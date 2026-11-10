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

test('evidence-data: 64 txs, deploy tx, contract, source sha', () => {
  assert.equal(EVIDENCE_DATA.contract, '0x56C85764c91F439185f446e019BB70A877458b54');
  assert.equal(EVIDENCE_DATA.deploy_tx, '0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce');
  assert.equal(EVIDENCE_DATA.source_sha256, '0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47');
  assert.equal(EVIDENCE_DATA.tx_count, 64);
  assert.equal(EVIDENCE_DATA.txs.length, 64);
  assert.equal(EVIDENCE_DATA.rounds.length, 10);
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
