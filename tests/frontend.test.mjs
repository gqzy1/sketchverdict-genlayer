// Frontend tests for SketchVerdict (node --test).
// Covers: i18n key parity, dossier export gate + verdict tones, demo preset
// SHA-256 vs the evidence record, and static Gate 11 checks on index.html.
// Run: node --test tests/frontend.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { STRINGS, t } from '../site/src/i18n.js';
import { buildDossier, verdictClass, verdictTone } from '../site/src/dossier.js';
import { EVIDENCE_DATA } from '../site/src/evidence-data.js';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');

test('i18n: every key exists in zh and en, t() never throws', () => {
  const enKeys = Object.keys(STRINGS.en).sort();
  const zhKeys = Object.keys(STRINGS.zh).sort();
  assert.deepEqual(zhKeys, enKeys);
  for (const k of enKeys) {
    assert.equal(typeof t('zh', k), 'string', k);
    assert.equal(typeof t('en', k), 'string', k);
    assert.ok(t('zh', k).length > 0, k);
    assert.ok(t('en', k).length > 0, k);
  }
});

const settledMatches = {
  round_id: 'R1', status: 'SETTLED', drawing_verdict: 'DRAWING_MATCHES',
  reason_code: 'VISUAL_MATCH_CONFIRMED', correct_guessers: ['0xabc'],
  fastest_guesser: '0xabc', drawer_payout_wei: '12500000000000000000',
  guesser_payouts: { '0xabc': '6250000000000000000' },
  total_pot_wei: '25000000000000000000', next_rollover_pool_wei: '0',
  guesses: [], challenges: [], image_sha256: '3aefeb2e', image_byte_len: 4602,
};
const readback = { finalized: true, contract_address: '0x56C85764c91F439185f446e019BB70A877458b54',
  source_sha256: '0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47',
  readback_at: '2026-11-11T00:00:00.000Z' };

test('dossier: export blocked before FINALIZED readback or before SETTLED', () => {
  assert.throws(() => buildDossier(settledMatches, null), /awaiting FINALIZED/);
  assert.throws(() => buildDossier(settledMatches, { finalized: false }), /awaiting FINALIZED/);
  assert.throws(() => buildDossier({ ...settledMatches, status: 'JUDGED' }, readback), /awaiting FINALIZED/);
  assert.throws(() => buildDossier({ ...settledMatches, drawing_verdict: '' }, readback), /awaiting FINALIZED/);
});

test('dossier: export blocked when the readback carries no finalized flag at all', () => {
  // The snapshot-without-a-flag case: the gate must throw when `finalized`
  // is absent (undefined), not just when it is false. An export caller may
  // only pass through a flag produced by the latest-final read path; it
  // must never synthesize one.
  const noFlag = { contract_address: readback.contract_address,
    source_sha256: readback.source_sha256, readback_at: readback.readback_at };
  assert.throws(() => buildDossier(settledMatches, noFlag), /awaiting FINALIZED/);
  assert.throws(() => buildDossier(settledMatches, { finalized: undefined }), /awaiting FINALIZED/);
  assert.throws(() => buildDossier(settledMatches, {}), /awaiting FINALIZED/);
});

test('Gate 11 structural: the finalized flag is stamped only inside readFinal', () => {
  // The literal may occur exactly once across all of site/src/, inside the
  // readFinal function in app.js. exportRoundDossier and every other caller
  // must consume the snapshot's own flag, never synthesize it.
  const srcFiles = ['site/src/app.js', 'site/src/dossier.js', 'site/src/i18n.js',
    'site/src/evidence-data.js', 'site/src/styles.css'];
  const occurrences = [];
  for (const f of srcFiles) {
    const s = read(f);
    let idx = s.indexOf('finalized: true');
    while (idx !== -1) {
      occurrences.push(`${f}:${s.slice(0, idx).split('\n').length}`);
      idx = s.indexOf('finalized: true', idx + 1);
    }
  }
  assert.equal(occurrences.length, 1,
    'finalized: true must occur exactly once in site/src/: ' + occurrences.join(', '));
  const app = read('site/src/app.js');
  const rfStart = app.indexOf('async function readFinal');
  const rfEnd = app.indexOf('async function readJson', rfStart);
  assert.ok(rfStart !== -1 && rfEnd !== -1, 'readFinal/readJson found in app.js');
  assert.ok(app.slice(rfStart, rfEnd).includes('finalized: true'),
    'the sole occurrence lives inside readFinal');
  assert.ok(app.slice(rfStart, rfEnd).includes('readAt'),
    'readFinal stamps a readAt timestamp alongside the flag');
  // readJson threads the flag through from readFinal's envelope.
  const rjStart = app.indexOf('async function readJson');
  const rjEnd = app.indexOf('async function refreshSnapshot', rjStart);
  assert.ok(app.slice(rjStart, rjEnd).includes('finalized: r.finalized'),
    'readJson threads readFinal’s flag, it does not stamp its own');
  // The snapshot is assembled as the `partial` object (published stage
  // by stage through publishSnapshot) and carries the threaded flag.
  // Round 3: the partial starts as a COPY of the previous snapshot
  // (merge, never replace), so a later partial cycle can never wipe
  // confirmed data — the flag is recomputed from the merged fields.
  const snapStart = app.indexOf('const partial = prev ? {');
  assert.ok(snapStart !== -1, 'snapshot assembly found');
  assert.ok(app.slice(snapStart, snapStart + 400).includes('finalized'),
    'snapshot carries the threaded finalized flag');
  assert.ok(app.includes('partial.finalized = computeFinalized();'),
    'the assembled snapshot takes the merged-fields completeness flag');
  assert.ok(app.includes('finalized: snapshot.finalized'),
    'exportRoundDossier consumes snapshot.finalized');
  const exStart = app.indexOf('function exportRoundDossier');
  assert.ok(exStart !== -1, 'exportRoundDossier found');
  assert.ok(!app.slice(exStart).includes('finalized: true'),
    'nothing from exportRoundDossier onward synthesizes the flag');
});

test('dossier: SETTLED MATCHES echoes readback fields verbatim', () => {
  const d = buildDossier(settledMatches, readback);
  assert.equal(d.verdict_class, 'FULL_MATCH_SETTLED');
  assert.equal(d.drawer_payout_wei, '12500000000000000000');
  assert.equal(d.total_pot_wei, '25000000000000000000');
  assert.equal(d.drawing_verdict, 'DRAWING_MATCHES');
  assert.equal(d.contract, readback.contract_address);
});

test('verdict classes + tones: PARTIAL is amber, never teal, payout 0', () => {
  const weak = { ...settledMatches, drawing_verdict: 'DRAWING_WEAK', reason_code: 'VISUAL_WEAK_PARTIAL',
    drawer_payout_wei: '5000000000000000000',
    guesser_payouts: { '0xabc': '2500000000000000000' }, next_rollover_pool_wei: '10000000000000000000' };
  assert.equal(verdictClass(weak), 'PARTIAL_WEAK_HALF_ROLLOVER');
  assert.equal(verdictTone(weak), 'amber');
  const unguessed = { ...settledMatches, correct_guessers: [], fastest_guesser: '',
    guesser_payouts: {}, drawer_payout_wei: '0' };
  assert.equal(verdictClass(unguessed), 'PARTIAL_UNGUESSED_ZERO_PAYOUT');
  assert.equal(verdictTone(unguessed), 'amber');
  assert.equal(verdictClass({ ...settledMatches, drawing_verdict: 'DRAWING_MISS', correct_guessers: ['0xabc'],
    drawer_payout_wei: '0', guesser_payouts: { '0xabc': '0' } }), 'REJECTED_DRAWING_MISS');
  assert.equal(verdictTone({ ...settledMatches, drawing_verdict: 'DRAWING_MISS' }), 'crimson');
  assert.equal(verdictTone(settledMatches), 'teal');
  assert.equal(verdictTone({ status: 'JUDGED', drawing_verdict: '' }), 'navy');
  assert.equal(verdictClass({ status: 'JUDGED', drawing_verdict: '' }), 'UNCONFIRMED');
});

test('demo presets: base64 bytes SHA-256 matches evidence/images.json', () => {
  const images = JSON.parse(read('evidence/images.json'));
  const cases = [
    ['bicycle.b64', 'bicycle.png'], ['lighthouse-vague.b64', 'lighthouse-vague.png'],
    ['volcano-text.b64', 'volcano-text.png'], ['crank.b64', 'crank.png'],
  ];
  for (const [b64file, png] of cases) {
    const raw = Buffer.from(read(`site/src/assets/${b64file}`).trim(), 'base64');
    assert.equal(raw.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', png + ' not PNG');
    const sha = crypto.createHash('sha256').update(raw).digest('hex');
    assert.equal(sha, images[png].sha256, png + ' sha mismatch');
  }
});

test('evidence-data: 64 txs, deploy tx, contract, source sha — and no hardcoded round outcomes', () => {
  assert.equal(EVIDENCE_DATA.contract, '0x56C85764c91F439185f446e019BB70A877458b54');
  assert.equal(EVIDENCE_DATA.deploy_tx, '0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce');
  assert.equal(EVIDENCE_DATA.source_sha256, '0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47');
  assert.equal(EVIDENCE_DATA.tx_count, 64);
  assert.equal(EVIDENCE_DATA.txs.length, 64);
  // Round outcomes must never be hardcoded in the bundle: the evidence
  // table renders them from the live FINALIZED readback (a stale copy once
  // rendered a wrong R6 row). The tx links are immutable references only.
  assert.equal(EVIDENCE_DATA.rounds, undefined, 'no hardcoded rounds array may remain');
});

test('Gate 11 structural: evidence round table renders only FINALIZED-readback data', () => {
  const app = read('site/src/app.js');
  assert.ok(!app.includes('EVIDENCE_DATA.rounds'), 'round table must not read a hardcoded copy');
  assert.ok(app.includes('snapshot.galleryRounds[e.round_id]'),
    'round rows come from the live per-round FINALIZED reads');
  assert.ok(app.includes('function renderEvidence'),
    'renderEvidence found');
  const evStart = app.indexOf('function renderEvidence');
  const evEnd = app.indexOf('function renderMachine', evStart);
  const evBody = app.slice(evStart, evEnd);
  assert.ok(evBody.includes('if (!readbackOk())'),
    'evidence panel shows its UNCONFIRMED state before a FINALIZED readback');
  assert.ok(evBody.includes('fmtGenExact(d.total_pot_wei)'),
    'live pot renders with exact wei (odd-wei pots are never rounded away)');
});

test('Gate 11 structural: every verdict display gates on snapshot.finalized', () => {
  const app = read('site/src/app.js');
  // The gate helper exists and every display render uses it (or the flag
  // directly); no render may key off bare snapshot truthiness.
  assert.ok(app.includes('const readbackOk = () => snapshot?.finalized === true'),
    'readbackOk helper gates on the finalized flag');
  const fnBody = (name) => {
    const start = app.indexOf(`function ${name}(`);
    assert.ok(start !== -1, name + ' found');
    const next = app.indexOf('\nfunction ', start);
    return next === -1 ? app.slice(start) : app.slice(start, next);
  };
  for (const fn of ['renderStatus', 'renderRoom', 'renderConsole', 'renderCanvasState',
    'renderGuesses', 'renderPayouts', 'renderGallery', 'renderEvidence', 'renderMachine']) {
    const body = fnBody(fn);
    assert.ok(body.includes('readbackOk()') || body.includes('snapshot?.finalized'),
      fn + ' must gate on readbackOk()/snapshot.finalized');
  }
  // Gallery cards render verdict/image only from the FINALIZED per-round
  // detail; without it they show only the round id + UNCONFIRMED.
  const gcStart = app.indexOf('function galleryCard');
  const gcBody = app.slice(gcStart, app.indexOf('\nfunction renderGallery', gcStart));
  assert.ok(gcBody.includes('if (!detail)'), 'card without detail renders no verdict');
  assert.ok(gcBody.includes('!!detail.image_b64 && !!detail.image_sha256'),
    'image renders only with FINALIZED bytes AND hash');
  assert.ok(gcBody.includes("t(lang, 'noImage')"), 'no-image rounds are labelled, not left blank');
  assert.ok(!gcBody.includes('e.drawing_verdict'), 'card head must not use the gallery entry verdict');
});

test('Gate 11 structural: canvas meta never shows a hash for blank paper; demos are labelled', () => {
  const app = read('site/src/app.js');
  const cmStart = app.indexOf('function renderCanvasMeta');
  const cmBody = app.slice(cmStart, app.indexOf('\nfunction ', cmStart + 10));
  assert.ok(cmBody.includes("canvasContent === 'blank'"), 'blank canvas is a distinct state');
  assert.ok(cmBody.includes("t(lang, 'canvasPresetBlank')"), 'blank canvas is labelled, not hashed');
  assert.ok(cmBody.includes("demoOriginal.sha"), 'a loaded demo shows its verified original SHA');
  assert.ok(cmBody.includes("t(lang, 'canvasPresetDemo')"), 'a loaded demo is labelled demo/示意 in the panel');
  assert.ok(app.includes("canvasContent = 'demo'"), 'demo load marks the canvas content as demo');
  assert.ok(app.includes("if (canvasContent === 'demo' && demoOriginal)"),
    'a loaded demo submits its exact evidence bytes, not a re-encode');
  assert.ok(app.includes("canvasContent = 'drawn'"), 'the first stroke invalidates a loaded demo');
});

test('amounts render exact wei (odd-wei pots are never rounded away)', () => {
  const app = read('site/src/app.js');
  assert.ok(app.includes('function fmtGenExact'), 'fmtGenExact exists');
  // Every pot / rollover display goes through the exact formatter: R9's
  // 26 GEN + 1 wei pot and 1 wei rollover must not render as 26.000000 /
  // 0.000000 GEN.
  for (const site of ['fmtGenExact(room.rollover_pool_wei)', 'fmtGenExact(pot.total_pot_wei)',
    'fmtGenExact(r.total_pot_wei)', 'fmtGenExact(r.next_rollover_pool_wei)',
    'fmtGenExact(d.total_pot_wei)', 'fmtGenExact(d.next_rollover_pool_wei)',
    'fmtGenExact(roll.toString())']) {
    assert.ok(app.includes(site), 'exact amount display missing: ' + site);
  }
});

test('mobile: stage-layout grid items may shrink (375px must not scroll horizontally)', () => {
  const css = read('site/src/styles.css');
  assert.ok(css.includes('.stage-layout > *'), 'stage-layout children rule present');
  const rule = css.slice(css.indexOf('.stage-layout > *'));
  assert.ok(rule.includes('min-width: 0'), 'stage-layout children must allow shrinking below min-content');
  assert.ok(css.includes('min(100%, 384px)'), 'mobile canvas is min(100%, 384px)');
});

test('Gate 11 static: index.html has full contract address, no dead address, no verdict claims', () => {
  const html = read('index.html');
  assert.ok(html.includes('0x56C85764c91F439185f446e019BB70A877458b54'), 'full address as visible text');
  assert.ok(html.includes('explorer-studio.genlayer.com/address/0x56C85764c91F439185f446e019BB70A877458b54'));
  assert.ok(!html.includes('0xD609'), 'dead 0xD609 address must be absent');
  assert.ok(!html.includes('scan.bradbury'), 'Bradbury host must be absent');
  assert.ok(!html.includes('VERIFIED'), 'no VERIFIED in static HTML');
  assert.ok(!html.includes('DRAWING_MATCHES'), 'no DRAWING_MATCHES in static HTML');
  assert.ok(!html.includes('SETTLED'), 'no SETTLED in static HTML');
  assert.ok(/src="dist\/app\.js\?v=[0-9a-f]{12}"/.test(html), 'script tag carries ?v=<12 hex> stamp');
});

test('Gate 11 static: no dead address / Bradbury host anywhere in frontend sources', () => {
  for (const f of ['site/src/app.js', 'site/src/i18n.js', 'site/src/dossier.js',
    'site/src/evidence-data.js', 'site/src/styles.css', 'index.html']) {
    const s = read(f);
    assert.ok(!s.includes('0xD609'), f + ' contains dead address');
    assert.ok(!s.includes('scan.bradbury'), f + ' contains Bradbury host');
    assert.ok(!s.toLowerCase().includes('xiaoyu7799'), f + ' leaks other account');
  }
});

test('reads pinned to latest-final in app.js', () => {
  const src = read('site/src/app.js');
  assert.ok(src.includes("transaction_hash_variant: 'latest-final'"), 'reads pinned latest-final');
  assert.ok(src.includes('gen_call'), 'reads use gen_call');
  assert.ok(!src.includes('latest-nonfinal'), 'no nonfinal reads');
  assert.ok(src.includes('✓ Read from FINALIZED Studionet state'), 'readback marker text present');
  assert.ok(src.includes('0x56C85764c91F439185f446e019BB70A877458b54'), 'contract address in bundle source');
});

test('redesign: slim one-line header — name + LIVE + round only', () => {
  const html = read('index.html');
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  assert.ok(header.includes('data-i18n="title"'), 'header keeps the name');
  assert.ok(header.includes('id="readback-marker"'), 'header keeps the LIVE readback marker');
  assert.ok(header.includes('id="round-id-display"'), 'header keeps the round id');
  for (const gone of ['id="pool-current"', 'id="pool-rollover"', 'id="round-count"',
    'id="btn-connect"', 'id="btn-temp"', 'id="btn-disconnect"',
    'id="lang-toggle"', 'id="static-toggle"']) {
    assert.ok(!header.includes(gone), 'header must not contain ' + gone);
  }
  // The moved items still exist on the page (rail / footer), just not in the header.
  for (const kept of ['id="pool-current"', 'id="pool-rollover"', 'id="round-count"',
    'id="btn-connect"', 'id="btn-temp"', 'id="lang-toggle"', 'id="static-toggle"']) {
    assert.ok(html.includes(kept), kept + ' must remain reachable on the page');
  }
});

test('redesign: stage-first layout — 640px paper canvas, guess dock under it, rail at the side', () => {
  const html = read('index.html');
  const css = read('site/src/styles.css');
  assert.ok(html.includes('id="stage-col"'), 'stage column exists');
  assert.ok(html.includes('id="rail-col"'), 'side rail exists');
  assert.ok(css.includes('max-width: 720px'), 'stage max-width ~720px');
  assert.ok(css.includes('min(100%, 640px)'), 'desktop canvas displays at 640px');
  assert.ok(css.includes('0 12px 40px rgba(17, 25, 39, 0.18)') || css.includes('0 12px 40px rgba(17,25,39,.18)'),
    'canvas carries the paper-sheet shadow');
  // Guess dock sits directly under the canvas, before the progress dots.
  assert.ok(html.indexOf('id="draw-canvas"') < html.indexOf('id="guess-input"'),
    'canvas precedes the guess input');
  assert.ok(html.indexOf('id="guess-input"') < html.indexOf('id="pipeline"'),
    'guess dock sits directly under the canvas, before the progress dots');
  // Deck (gallery + evidence) is below the fold: after the stage layout.
  assert.ok(html.indexOf('id="deck"') > html.indexOf('id="rail-col"'),
    'deck comes after the stage + rail');
});

test('redesign: the 14 readback fields are all reachable somewhere on the page', () => {
  const html = read('index.html');
  const fields = ['round-id-display', 'pool-rollover', 'pool-current', 'round-count',
    'c-status', 'c-commit', 'c-category', 'c-draw-deadline', 'c-reveal-deadline',
    'c-challenge-deadline', 'c-concept', 'c-cheat', 'c-tier', 'image-sha'];
  assert.equal(fields.length, 14, 'the mapping is 14 fields');
  for (const id of fields) {
    assert.ok(html.includes(`id="${id}"`), 'readback field missing from the page: ' + id);
  }
});

test('redesign: canvas auto-loads the latest round on-chain image after FINALIZED readback', () => {
  const app = read('site/src/app.js');
  assert.ok(app.includes('async function autoLoadRoundImage'), 'auto-load function exists');
  assert.ok(app.includes("sha !== r.image_sha256"), 'image SHA is verified before display');
  assert.ok(app.includes("canvasContent === 'drawn' || canvasContent === 'demo'"),
    'auto-load never clobbers user strokes or a loaded demo');
  assert.ok(app.includes("canvasContent = 'round'"), 'auto-loaded image is a distinct canvas state');
  assert.ok(app.includes('roundOriginal'), 'auto-loaded image keeps its verified original bytes');
  const cmStart = app.indexOf('function renderCanvasMeta');
  const cmBody = app.slice(cmStart, app.indexOf('\nfunction ', cmStart + 10));
  assert.ok(cmBody.includes("canvasContent === 'round'"), 'canvas meta has a round branch');
  assert.ok(cmBody.includes("t(lang, 'canvasPresetRound')"), 'auto-loaded image is labelled with its round');
  assert.ok(app.includes("canvasContent === 'round' && roundOriginal"),
    'an auto-loaded round submits its exact on-chain bytes, not a re-encode');
  // renderCanvasState triggers the auto-load only from a FINALIZED round.
  const rcStart = app.indexOf('function renderCanvasState');
  const rcBody = app.slice(rcStart, app.indexOf('\nfunction renderStampOverlay', rcStart) === -1
    ? app.indexOf('\nfunction renderGuesses', rcStart) : app.indexOf('\nfunction renderStampOverlay', rcStart));
  assert.ok(rcBody.includes('autoLoadRoundImage(r)'), 'renderCanvasState triggers the auto-load');
});

test('redesign: verdict stamp is an event — large display type, overlaying the dimmed canvas', () => {
  const css = read('site/src/styles.css');
  const html = read('index.html');
  assert.ok(html.includes('id="stamp-overlay"'), 'stamp overlay exists over the canvas');
  assert.ok(html.includes('id="canvas-dim"'), 'reveal curtain (dim) exists');
  assert.ok(css.includes('.stamp-verdict'), 'stamp verdict rule exists');
  assert.ok(css.includes('3rem'), 'stamp verdict reaches 48px (3rem) — within the 40–56px brief range');
  const app = read('site/src/app.js');
  assert.ok(app.includes('function renderStampOverlay'), 'stamp renders via its own gated function');
  assert.ok(app.includes("replaceAll('_', '_<wbr>')"), 'verdict enum breaks only at underscores, never mid-word');
  const soStart = app.indexOf('function renderStampOverlay');
  const soBody = app.slice(soStart, app.indexOf('\nfunction renderCanvasState', soStart));
  assert.ok(soBody.includes("r.status === 'SETTLED'"), 'stamp shows only for a SETTLED round');
  assert.ok(soBody.includes('verdictStampHTML(r)'), 'stamp content comes from the verdict');
});

test('redesign: ?static kills motion but leaves every content visible', () => {
  const css = read('site/src/styles.css');
  const staticBlock = css.slice(css.indexOf('html.static-mode'), css.indexOf('}', css.indexOf('html.static-mode')) + 1);
  assert.ok(staticBlock.includes('--dur-reveal: 0ms'), 'static mode zeroes the reveal duration');
  assert.ok(staticBlock.includes('--dur-tap: 0ms'), 'static mode zeroes the tap duration');
  assert.ok(!staticBlock.includes('display'), 'static mode hides nothing');
  assert.ok(!staticBlock.includes('visibility'), 'static mode hides nothing');
  assert.ok(!staticBlock.includes('opacity'), 'static mode hides nothing');
  // The stamp overlay never sits at opacity 0 by default (only the
  // decorative curtain dims, and it is not content).
  const ovStart = css.indexOf('.stamp-overlay');
  const ovRule = css.slice(ovStart, css.indexOf('}', ovStart));
  assert.ok(!ovRule.includes('opacity'), 'stamp overlay is never invisible by default');
  assert.ok(read('index.html').includes('id="static-toggle"'), 'static toggle remains on the page');
});

test('redesign: stylesheet is versioned by its own content hash (no stale CSS)', () => {
  const html = read('index.html');
  const m = html.match(/href="dist\/styles\.css\?v=([0-9a-f]{12})"/);
  assert.ok(m, 'stylesheet link carries ?v=');
  const css = read('dist/styles.css');
  const expect = crypto.createHash('sha256').update(css).digest('hex').slice(0, 12);
  assert.equal(m[1], expect, 'stylesheet ?v= is the first 12 hex of dist/styles.css SHA-256');
});

test('redesign: exactly 6 colors, 3 fonts, CSS-only paper texture', () => {
  const css = read('site/src/styles.css');
  const allowed = new Set(['#111927', '#F4F6FA', '#1D4ED8', '#0F766E', '#B45309', '#B91C1C']);
  const found = css.match(/#[0-9a-fA-F]{6}/g) || [];
  assert.ok(found.length > 0, 'colors present');
  for (const c of found) {
    assert.ok(allowed.has(c.toUpperCase()) || [...allowed].some((a) => a.toUpperCase() === c.toUpperCase()),
      'color outside the 6-token palette: ' + c);
  }
  assert.ok(!css.includes('url(http://') && !css.includes('url(https://'),
    'no external image assets in the stylesheet');
  assert.ok(css.includes('data:image/svg+xml'), 'paper grain is an inline SVG data URI');
  assert.ok(css.includes('--font-display') && css.includes('--font-sans') && css.includes('--font-mono'),
    'three font tokens present');
});

test('readback resilience: a failed refresh retries the whole refresh before any error banner', () => {
  const app = read('site/src/app.js');
  // 1 initial attempt + 2 whole-refresh retries, backoff ~5s then ~15s.
  assert.ok(app.includes('const READBACK_MAX_ATTEMPTS = 3'), 'max attempts is 3');
  assert.ok(app.includes('const READBACK_RETRY_DELAYS_MS = [5000, 15000]'), 'backoff is 5s then 15s');
  const wrapStart = app.indexOf('async function refreshSnapshot()');
  const wrapEnd = app.indexOf('async function refreshSnapshotOnce', wrapStart);
  assert.ok(wrapStart !== -1 && wrapEnd !== -1, 'retry wrapper + single-attempt split exist');
  const wrap = app.slice(wrapStart, wrapEnd);
  assert.ok(wrap.includes('for (let attempt = 0; attempt < READBACK_MAX_ATTEMPTS; attempt++)'),
    'wrapper loops over whole-refresh attempts');
  assert.ok(wrap.includes('await refreshSnapshotOnce()'), 'each attempt runs one full refresh');
  assert.ok(wrap.includes("t(lang, 'readbackRetrying')"), 'retries show a retrying status, not an error');
  assert.ok(wrap.includes('await sleep(READBACK_RETRY_DELAYS_MS[attempt]'),
    'retries wait the backoff before the next attempt');
  // The error banner appears only after every attempt is exhausted.
  assert.ok(wrap.includes("t(lang, 'txError')"), 'error banner exists in the wrapper');
  assert.ok(wrap.indexOf("t(lang, 'readbackRetrying')") < wrap.indexOf("t(lang, 'txError')"),
    'retrying status precedes the error banner');
  // The wrapper never touches the snapshot itself: a failed refresh cannot
  // clear the last good snapshot, and its readBackAt survives untouched.
  assert.ok(!wrap.includes('snapshot ='), 'retry wrapper never assigns snapshot');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  assert.ok(!once.includes('setNotice'), 'a single attempt never shows its own banner');
});

test('readback resilience: partial render — round failure keeps room + gallery, finalized false', () => {
  const app = read('site/src/app.js');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  // The current-round read is wrapped: its failure must not abort the refresh.
  const roundSlice = once.slice(once.indexOf('const roundId'), once.indexOf('const entries'));
  assert.ok(roundSlice.includes('try {'), 'current-round read is guarded');
  assert.ok(roundSlice.includes("readJson('get_round'"), 'guarded read is the current round');
  assert.ok(roundSlice.includes('catch'), 'round failure is caught, not thrown');
  assert.ok(roundSlice.includes('roundOk = false'), 'a failed round read marks the round not-ok');
  // The fresh-constituent AND (this cycle's reads only) drives the
  // readBackAt stamp; the snapshot flag itself is the merged
  // completeness (every presented field read from latest-final), so a
  // failed round read on a first load still forces it false — the
  // marker, verdict displays and export stay closed.
  assert.ok(once.includes('let freshFinalized = roomR.finalized && galleryR.finalized && roundOk'),
    'fresh-constituent AND includes the round-ok flag');
  assert.ok(once.includes('partial.finalized = computeFinalized();'),
    'snapshot flag is recomputed from the merged fields');
  // The partial snapshot starts with round null and only the successful
  // read assigns it, so a failed round read leaves round null.
  assert.ok(once.includes('round: null,'), 'partial snapshot starts with round null');
  assert.ok(once.includes('partial.round = roundR.data;'), 'round is assigned only on a successful read');
  const catchSlice = roundSlice.slice(roundSlice.indexOf('catch'));
  assert.ok(!catchSlice.includes('partial.round ='), 'the catch path never assigns round');
  // Room facts render from a successful get_room_state, not only behind
  // the full-readback gate.
  const roomStart = app.indexOf('function renderRoom()');
  const roomBody = app.slice(roomStart, app.indexOf('\nfunction ', roomStart));
  assert.ok(roomBody.includes('const room = snapshot?.room || null'),
    'room facts render whenever the room read succeeded');
  assert.ok(roomBody.includes('const live = readbackOk()'),
    'round-derived facts in the room still gate on the full readback');
  // The gallery list renders from a successful get_gallery; a card's
  // verdict/image still comes only from its own FINALIZED per-round read.
  const galStart = app.indexOf('function renderGallery()');
  const galBody = app.slice(galStart, app.indexOf('\nfunction renderEvidence', galStart));
  assert.ok(galBody.includes('!snapshot?.gallery'), 'gallery renders when its own read succeeded');
  assert.ok(galBody.includes('readbackOk()'), 'gallery still names the full-readback gate');
  // Export stays closed on a partial snapshot: the card button and the
  // dossier gate both require snapshot.finalized.
  assert.ok(app.includes("detail.status === 'SETTLED' && snapshot?.finalized ? '' : 'disabled'"),
    'gallery export button stays disabled without snapshot.finalized');
});

test('readback resilience: a failed refresh never clears the last good snapshot or its readBackAt', () => {
  const app = read('site/src/app.js');
  // The only `snapshot = null` is the cold-start declaration (`let
  // snapshot = null`); no code path ever nulls it out after init.
  const nulled = app.split('\n').filter((l) => /^\s*snapshot = null/.test(l));
  assert.equal(nulled.length, 0, 'snapshot must never be nulled out after init');
  // The only snapshot assignment lives in the successful single-attempt
  // path; the retry wrapper and every catch path leave it alone. (The
  // `let snapshot = null` declaration is the cold-start init, not an
  // assignment — it is excluded from the count.)
  const assigns = app.split('\n')
    .map((l, i) => ({ l, n: i + 1 }))
    .filter(({ l }) => l.includes('snapshot =') && !/^\s*let\s+snapshot/.test(l));
  assert.equal(assigns.length, 1,
    'exactly one snapshot assignment: ' + assigns.map((a) => a.n).join(', '));
  // "最近读回" shows the last SUCCESSFUL readback time only; a failed
  // attempt cannot overwrite it because the snapshot is never replaced.
  assert.ok(app.includes("snapshot?.finalized ? snapshot.readBackAt : t(lang, 'neverReadBack')"),
    'last-readback shows only a finalized snapshot’s readBackAt');
  // The retrying status key exists in both languages (parity is enforced
  // by the i18n test, but the content must actually say retrying).
  assert.ok(t('zh', 'readbackRetrying').includes('重试'), 'zh retrying text');
  assert.ok(t('en', 'readbackRetrying').toLowerCase().includes('retry'), 'en retrying text');
});

test('readback round 2: rpcCall fails fast — 20s timeout, 4 attempts, 3s/6s/12s backoff', () => {
  const app = read('site/src/app.js');
  const rpcStart = app.indexOf('async function rpcCall');
  const rpcEnd = app.indexOf('async function readFinal', rpcStart);
  assert.ok(rpcStart !== -1 && rpcEnd !== -1, 'rpcCall found');
  const rpc = app.slice(rpcStart, rpcEnd);
  assert.ok(rpc.includes('AbortSignal.timeout(20000)'), 'per-call timeout is 20s, not 60s');
  assert.ok(rpc.includes('attempt < 4'), 'at most 4 attempts per call');
  assert.ok(!rpc.includes('attempt < 6'), 'the old 6-attempt loop is gone');
  assert.ok(!rpc.includes('AbortSignal.timeout(60000)'), 'the old 60s timeout is gone');
  assert.ok(rpc.includes('3000 * (2 ** attempt)'), 'backoff is ~3s/6s/12s');
  // Worst case per call: 4x20s + 3s + 6s + 12s = ~101s, so a hanging
  // call can no longer stall a refresh for several minutes, and the
  // whole-refresh retry actually gets a chance to engage.
});

test('readback round 2: progressive rendering — each stage publishes its partial snapshot', () => {
  const app = read('site/src/app.js');
  // One assignment point only: publishSnapshot. The single-attempt path
  // never writes `snapshot =` directly (the "never clears" test counts
  // exactly one such line in the whole file).
  assert.ok(app.includes('function publishSnapshot(next)'), 'publishSnapshot helper exists');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  assert.ok(!once.includes('snapshot ='), 'refreshSnapshotOnce never assigns snapshot directly');
  const publishes = once.split('publishSnapshot(partial)').length - 1;
  assert.ok(publishes >= 4, 'publishes after room, gallery, round/entry and at the end: ' + publishes);
  // Partials carry finalized false until every constituent has landed.
  assert.ok(once.includes('finalized: false'), 'partial snapshot starts unfinalized');
  // Stage order: room publishes before gallery is read; gallery publishes
  // before the per-entry reads; cards publish before the final assembly.
  assert.ok(once.indexOf('partial.room = roomR.data;') < once.indexOf("readJson('get_gallery'"),
    'room publishes before the gallery read starts');
  assert.ok(once.indexOf('partial.gallery = galleryR.data;') < once.indexOf('mapLimit(entries, 4,'),
    'gallery publishes before the per-entry reads start');
  assert.ok(once.indexOf('partial.galleryRounds[e.round_id] = rr.data;') < once.indexOf('partial.readBackAt = new Date().toISOString();'),
    'cards publish before the final assembly');
  // Verdict displays still gate on the full readback: the stamp/canvas
  // reads snapshot.round only through readbackOk().
  assert.ok(app.includes('const r = readbackOk() ? snapshot.round : null'),
    'round-derived displays still gate on readbackOk()');
});

test('readback round 2: gallery reads run with bounded concurrency 4', () => {
  const app = read('site/src/app.js');
  assert.ok(app.includes('async function mapLimit(items, limit, fn)'), 'mapLimit helper exists');
  const mlStart = app.indexOf('async function mapLimit');
  const mlEnd = app.indexOf('async function refreshSnapshot', mlStart);
  const ml = app.slice(mlStart, mlEnd);
  assert.ok(ml.includes('Math.min(limit, items.length)'), 'workers are capped by the limit');
  assert.ok(ml.includes('await fn(items[i], i)'), 'each item runs through fn');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  assert.ok(once.includes('mapLimit(entries, 4,'), 'gallery entries run with concurrency 4');
  assert.ok(!once.includes('for (const e of'), 'no sequential gallery loop remains');
  assert.ok(!once.includes('Promise.all(entries'), 'no unbounded burst over the entries');
});

test('readback round 2: marker time is the snapshot assembly time, not the first read', () => {
  const app = read('site/src/app.js');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  // readBackAt is stamped at assembly, after the gallery and stats stages.
  assert.ok(once.includes('partial.readBackAt = new Date().toISOString();'),
    'readBackAt is stamped at assembly time');
  assert.ok(once.indexOf('mapLimit(entries, 4,') < once.indexOf('partial.readBackAt = new Date().toISOString();'),
    'readBackAt is stamped after the gallery stage');
  // The stamp and the flag flip live in the same final block: the
  // marker never claims a time before the data was complete, and it
  // never flips with a null timestamp. (The flag used to be computed
  // at every publish, which let the marker flip at the round publish
  // while readBackAt was still null — "· null" on the live site.)
  const stampIdx = once.indexOf('if (freshFinalized) partial.readBackAt = new Date().toISOString();');
  const flagIdx = once.indexOf('partial.finalized = computeFinalized();');
  assert.ok(stampIdx !== -1 && flagIdx !== -1 && Math.abs(flagIdx - stampIdx) < 120,
    'stamp and flag flip are adjacent in the final block');
  // The stale load-time stamp is gone: nothing assigns roomR.readAt as readBackAt.
  assert.ok(!app.includes('readBackAt: roomR.readAt'), 'readBackAt no longer takes the first read’s time');
  // Each single read's readAt envelope value is untouched.
  assert.ok(once.includes('partial.readAt = roomR.readAt;'), 'room readAt envelope is kept');
});

test('readback round 3: success notice is gated on snapshot.finalized (no false FINALIZED notice)', () => {
  const app = read('site/src/app.js');
  // The b2 finding (verification report #5): a partial success after a
  // retry used to show "✓ 已读回 FINALIZED" while the marker said
  // UNCONFIRMED, because the notice fired whenever attempt > 0.
  const wrapStart = app.indexOf('async function refreshSnapshot()');
  const wrapEnd = app.indexOf('async function refreshSnapshotOnce', wrapStart);
  const wrap = app.slice(wrapStart, wrapEnd);
  // The notice is reconciled on EVERY successful return, not only after
  // retries — the notice is the only timestamp display not re-rendered
  // from the snapshot on every render, so gating it on attempt > 0 let
  // it go stale beside the marker (the "two markers disagree" report).
  assert.ok(!wrap.includes('if (attempt > 0) setNotice'),
    'the notice is no longer gated on attempt > 0');
  assert.ok(wrap.includes('if (snapshot?.finalized) setNotice('),
    'FINALIZED notice appears only when the snapshot is actually finalized');
  assert.ok(wrap.includes("t(lang, 'readbackOk')"), 'the gated notice is the readbackOk text');
  assert.ok(wrap.includes('else clearNotice();'),
    'a partial success clears any stale retry/error notice');
  // clearNotice restores the bar to its initial empty state (text +
  // kind), it does not leave an empty coloured bar behind.
  const cnStart = app.indexOf('function clearNotice()');
  assert.ok(cnStart !== -1, 'clearNotice helper exists');
  const cn = app.slice(cnStart, app.indexOf('\n}\n', cnStart));
  assert.ok(cn.includes("n.textContent = '';"), 'clearNotice empties the text');
  assert.ok(cn.includes("removeAttribute('data-kind')"), 'clearNotice removes the kind');
});

test('readback round 3: new cycles merge into the snapshot — confirmed data is never wiped', () => {
  const app = read('site/src/app.js');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  // The partial starts as a COPY of the previous snapshot, not an
  // empty object: a later cycle can only add confirmed data.
  assert.ok(once.includes('const prev = snapshot;'), 'previous snapshot is kept as the merge base');
  assert.ok(once.includes('galleryRounds: { ...prev.galleryRounds }'),
    'gallery rounds are copied, never reset');
  assert.ok(once.includes('round: null,'),
    'the empty base (first load) still starts with round null');
  // The merged flag is computed from the merged fields exactly once,
  // at the final publish — never mid-refresh, so the marker cannot
  // flip before readBackAt is stamped. Intermediate publishes keep
  // the previous cycle's flag (see the flag-flip test below).
  assert.ok(once.includes('const computeFinalized = () => {'),
    'merged-flag helper exists');
  const cf = once.slice(once.indexOf('const computeFinalized'));
  assert.ok(cf.includes('if (!partial.room || !partial.gallery) return false;'),
    'flag requires room and gallery');
  assert.ok(cf.includes("if (rid && partial.round?.round_id !== rid) return false;"),
    'flag requires the round slot to match the current round id');
  assert.ok(once.includes('partial.finalized = computeFinalized();'),
    'flag is computed from the merged fields at the final publish');
  // A retained round whose id no longer matches the fresh room is
  // dropped from the current-round slot (it stays in galleryRounds
  // as a historical entry), and the kept flag drops with it — fresh
  // data contradicting the retained snapshot ends the old confirmation.
  assert.ok(once.includes('if (partial.round && partial.round.round_id !== roundId) {'),
    'stale retained round is dropped from the current-round slot');
  assert.ok(once.includes('keepFinalized = false;'),
    'dropping the stale round also drops the kept flag');
  // readBackAt advances only on a fully-fresh cycle, so a retained
  // value never gets a fresh timestamp it did not earn.
  assert.ok(once.includes('if (freshFinalized) partial.readBackAt = new Date().toISOString();'),
    'readBackAt advances only when every fresh constituent succeeded');
  assert.ok(!once.includes('\n  partial.readBackAt = new Date().toISOString();'),
    'no unconditional readBackAt stamp at assembly');
});

test('readback round 3: the 30s timer stops once the snapshot is complete; holes get a light backfill', () => {
  const app = read('site/src/app.js');
  // The unconditional 30s poll used to re-run a full refresh every
  // cycle and wipe the UI (the ~2-minute flap). Now it only fires
  // while the snapshot is not complete.
  const initStart = app.indexOf('setInterval(() => {');
  assert.ok(initStart !== -1, '30s interval found');
  const interval = app.slice(initStart, app.indexOf('}, 30000);', initStart));
  assert.ok(interval.includes('snapshotComplete()'), 'interval checks completeness');
  assert.ok(interval.includes('backfillMissing()'), 'holes get a light backfill');
  assert.ok(!interval.includes('refreshSnapshot();\n  }, 30000'),
    'no unconditional full refresh in the interval');
  // snapshotComplete: FINALIZED plus no holes.
  const scStart = app.indexOf('function snapshotComplete()');
  assert.ok(scStart !== -1, 'snapshotComplete helper exists');
  const sc = app.slice(scStart, app.indexOf('\n}\n', scStart));
  assert.ok(sc.includes('if (!readbackOk()) return false;'), 'complete requires FINALIZED');
  assert.ok(sc.includes('entries.some((e) => !snapshot.galleryRounds[e.round_id])'),
    'complete requires every gallery entry to have its round data');
  assert.ok(sc.includes("if (roundId && snapshot?.round?.round_id !== roundId) return false;"),
    'complete requires the current round to be present');
  // backfillMissing: reads ONLY the missing entries, bounded to 4,
  // and merges them — it never touches the rest of the snapshot.
  const bfStart = app.indexOf('async function backfillMissing()');
  assert.ok(bfStart !== -1, 'backfillMissing helper exists');
  const bf = app.slice(bfStart, app.indexOf('\n}\n', bfStart));
  assert.ok(bf.includes('if (readingBack || !snapshot?.finalized) return;'),
    'backfill only runs on a FINALIZED snapshot');
  assert.ok(bf.includes('.filter((e) => !next.galleryRounds[e.round_id])'),
    'backfill selects only the missing entries');
  assert.ok(bf.includes('mapLimit(missing, 4,'), 'backfill reads with bounded concurrency 4');
  assert.ok(!bf.includes('snapshot ='), 'backfill publishes through publishSnapshot only');
  // The full refresh reads holes first, so a backfill cycle spends its
  // concurrency on the missing rounds.
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  assert.ok(once.includes('.sort((a, b)'), 'gallery entries are ordered before the bounded read');
  assert.ok(once.indexOf('.sort((a, b)') < once.indexOf('mapLimit(entries, 4,'),
    'holes-first ordering happens before the gallery reads');
});

test('readback round 3: every timestamp display reads snapshot.readBackAt (single source of truth)', () => {
  const app = read('site/src/app.js');
  // Marker, last-readback, Machine view, notice and dossier all read
  // the same snapshot.readBackAt — there is no second timestamp source
  // left for two displays to disagree about.
  assert.ok(app.includes('`✓ Read from FINALIZED Studionet state · ${snapshot.readBackAt}`'),
    'marker reads snapshot.readBackAt');
  assert.ok(app.includes("snapshot?.finalized ? snapshot.readBackAt : t(lang, 'neverReadBack')"),
    'last-readback reads snapshot.readBackAt');
  assert.ok(app.includes('READBACK ...... FINALIZED @ ${snapshot.readBackAt}'),
    'Machine view reads snapshot.readBackAt');
  assert.ok(app.includes('readback_at: snapshot.readBackAt'),
    'dossier reads snapshot.readBackAt');
  // The readBackAt stamp is written in exactly one place (the
  // conditional fresh stamp at assembly) — no second writer exists.
  const stamps = app.split('\n').filter((l) => l.includes('readBackAt = new Date().toISOString();'));
  assert.equal(stamps.length, 1, 'readBackAt is stamped in exactly one place: ' + stamps.join(' | '));
  assert.ok(!app.includes('readBackAt: roomR.readAt'), 'no stale first-read timestamp');
});

test('readback round 3: the flag flips exactly once, at the final publish, together with readBackAt', () => {
  const app = read('site/src/app.js');
  const onceStart = app.indexOf('async function refreshSnapshotOnce');
  const onceEnd = app.indexOf('async function maybeAutoReveal', onceStart);
  const once = app.slice(onceStart, onceEnd);
  // Regression: the merged flag used to be recomputed at every publish,
  // so the marker flipped at the round publish while readBackAt was
  // still null — the live site showed "✓ Read from FINALIZED Studionet
  // state · null" with the gallery still unconfirmed.
  const flagComputes = once.split('partial.finalized = computeFinalized();').length - 1;
  assert.equal(flagComputes, 1, 'the merged flag is computed exactly once per cycle');
  const finalCompute = once.indexOf('partial.finalized = computeFinalized();');
  const stamp = once.indexOf('if (freshFinalized) partial.readBackAt = new Date().toISOString();');
  assert.ok(stamp !== -1 && stamp < finalCompute, 'the stamp and the flag flip are in the same final block');
  assert.ok(once.indexOf('publishSnapshot(partial);', finalCompute) - finalCompute < 80,
    'the flag flip is immediately followed by its publish');
  // Every earlier publish keeps the previous cycle's flag instead of
  // recomputing it — a retry over a complete snapshot never
  // unfinalizes the UI while it re-reads, and first load stays
  // unconfirmed until the assembly is complete.
  const keeps = once.split('partial.finalized = keepFinalized;').length - 1;
  assert.equal(keeps, 4, 'four intermediate publishes keep the previous flag: ' + keeps);
  assert.ok(once.includes('let keepFinalized = prev?.finalized === true;'),
    'the kept flag starts from the previous snapshot');
  assert.ok(once.includes('keepFinalized = false;'),
    'the kept flag drops when fresh data contradicts the retained round');
  // The round publish — the one that used to flip early — must not
  // recompute the flag.
  const roundPub = once.indexOf("const roundR = await readJson('get_round', [roundId]);");
  const roundPubEnd = once.indexOf('publishSnapshot(partial);', roundPub);
  assert.ok(!once.slice(roundPub, roundPubEnd).includes('computeFinalized()'),
    'the round publish does not recompute the flag');
  // No assignment ever wipes the flag to false mid-cycle.
  assert.ok(!once.includes('partial.finalized = false;'),
    'no mid-cycle wipe of the flag');
});

test('read path smoke: gen_call latest-final against the live evidence contract (read-only)', async () => {
  const { abi } = await import('genlayer-js');
  const { calldata, transactions } = abi;
  const RPC = 'https://studio.genlayer.com/api';
  const data = transactions.serialize([
    calldata.encode(calldata.makeCalldataObject('get_room_state', [], {})), false]);
  const res = await fetch(RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'gen_call', params: [{ type: 'read',
      to: '0x56C85764c91F439185f446e019BB70A877458b54',
      from: '0x0000000000000000000000000000000000000000',
      data, transaction_hash_variant: 'latest-final' }] }) });
  const j = await res.json();
  assert.ok(!j.error, 'rpc error: ' + JSON.stringify(j.error));
  const hex = typeof j.result === 'string' ? j.result : j.result?.data;
  const plain = hex.startsWith('0x') ? hex.slice(2) : hex;
  const room = JSON.parse(calldata.decode(Uint8Array.from(plain.match(/../g) || [], (x) => parseInt(x, 16))));
  assert.equal(room.round_count, 10, 'evidence contract has 10 rounds');
  assert.equal(room.current_round_id, 'R9');
});
