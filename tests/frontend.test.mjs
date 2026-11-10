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
  // The snapshot carries the threaded flag; the export consumes it.
  const snapStart = app.indexOf('snapshot = { room:');
  assert.ok(snapStart !== -1, 'snapshot assembly found');
  assert.ok(app.slice(snapStart, snapStart + 400).includes('finalized'),
    'snapshot carries the threaded finalized flag');
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
  assert.ok(css.includes('3.5rem'), 'stamp verdict reaches 56px (3.5rem)');
  const app = read('site/src/app.js');
  assert.ok(app.includes('function renderStampOverlay'), 'stamp renders via its own gated function');
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
