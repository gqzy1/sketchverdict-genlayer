/* Independent one-command verifier for SketchVerdict.
 *
 * Re-reads the deployed code and checks source-SHA byte parity,
 * re-reads every evidence tx live from the Studio RPC, and checks the
 * money invariant + final state against EXPECTED.md.
 *
 * Usage: node scripts/verify.mjs
 * Exit 0 only when every check passes.
 */
import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('../', import.meta.url);
const RPC = 'https://studio.genlayer.com/api';

let pass = 0;
let fail = 0;
function check(name, cond, detail = '') {
  if (cond) {
    pass++;
    console.log('PASS', name, detail);
  } else {
    fail++;
    console.log('FAIL', name, detail);
  }
}

async function rpc(method, params = []) {
  const r = await fetch(RPC, { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }) });
  const j = await r.json();
  if (j.error) throw Error('RPC ' + JSON.stringify(j.error));
  return j.result;
}

const journal = JSON.parse(fs.readFileSync(new URL('evidence/evidence.json', root), 'utf8'));
const code = fs.readFileSync(new URL('contracts/sketchverdict.py', root), 'utf8');
const address = journal.contract_address;
const client = createClient({ chain: studionet, account: createAccount() });
const read = (fn, args = []) => client.readContract({ address, functionName: fn,
  args, transactionHashVariant: 'latest-final' });

console.log('contract:', address);
console.log('expected source sha256:', journal.source_sha256);

// 1. source byte parity
const deployed = await client.getContractCode(address);
check('deployed code byte-identical to repo source', deployed === code);
check('source sha256 matches journal',
  crypto.createHash('sha256').update(code).digest('hex') === journal.source_sha256);
check('protocol version', (await read('get_protocol')) === 'sketchverdict-1');

// 2. every evidence tx re-read live
let txTotal = 0;
let txFinalized = 0;
for (const t of journal.transactions ?? []) {
  if (!t.hash) continue;
  txTotal++;
  const live = await rpc('eth_getTransactionByHash', [t.hash]);
  const finalized = live?.status === 'FINALIZED';
  if (finalized) txFinalized++;
  else check('tx FINALIZED: ' + t.label, false, 'status=' + live?.status);
  if (t.expect === 'fail') {
    const agreed = [6, '6', 'MAJORITY_AGREE'].includes(live?.result);
    check('tx expected-failure (no agreement): ' + t.label, !agreed,
      'result=' + live?.result);
  } else {
    const agreed = [6, '6', 'MAJORITY_AGREE'].includes(live?.result);
    check('tx consensus agreed: ' + t.label, agreed, 'result=' + live?.result);
  }
}
console.log('txs re-read live:', txFinalized + '/' + txTotal, 'FINALIZED');

// 3. live state vs EXPECTED.md
const acc = JSON.parse(await read('get_accounting'));
check('invariant_ok', acc.invariant_ok === true, JSON.stringify(acc));
check('total_received_wei', acc.total_received_wei === '176000000000000000001', acc.total_received_wei);
check('total_withdrawn_wei', acc.total_withdrawn_wei === '147250000000000000000', acc.total_withdrawn_wei);
check('credits_outstanding_wei', acc.credits_outstanding_wei === '28750000000000000000', acc.credits_outstanding_wei);
check('rollover_pool_wei', acc.rollover_pool_wei === '1', acc.rollover_pool_wei);
check('locked_stakes_wei', acc.locked_stakes_wei === '0', acc.locked_stakes_wei);
check('balance_matches_accounted', acc.balance_matches_accounted === true);

const expectedRounds = {
  R1: ['DRAWING_MATCHES', 'VISUAL_MATCH_CONFIRMED', '12500000000000000000', '0'],
  R2: ['DRAWING_WEAK', 'VISUAL_WEAK_PARTIAL', '5000000000000000000', '10000000000000000000'],
  R3: ['DRAWING_MISS', 'TEXT_CHEAT_DETECTED', '0', '25000000000000000000'],
  R4: ['DRAWING_MISS', 'VISUAL_MISS', '0', '40000000000000000000'],
  R5: ['DRAWING_MATCHES', 'VISUAL_MATCH_CONFIRMED', '27500000000000000000', '0'],
  R6: ['DRAWING_MATCHES', 'VISUAL_MATCH_CONFIRMED', '10000000000000000000', '0'],
  R7: ['DRAWING_MISS', 'DRAWER_DRAWING_TIMEOUT', '0', '10000000000000000000'],
  R8: ['DRAWING_MISS', 'DRAWER_REVEAL_TIMEOUT', '0', '20000000000000000000'],
  R9: ['DRAWING_MATCHES', 'VISUAL_MATCH_CONFIRMED', '13000000000000000000', '1'],
};
for (const [id, [verdict, reason, payout, rollover]] of Object.entries(expectedRounds)) {
  const r = JSON.parse(await read('get_round', [id]));
  check(id + ' SETTLED', r.status === 'SETTLED', r.status);
  check(id + ' verdict', r.drawing_verdict === verdict, r.drawing_verdict);
  check(id + ' reason', r.reason_code === reason, r.reason_code);
  check(id + ' drawer payout', r.drawer_payout_wei === payout, r.drawer_payout_wei);
  check(id + ' rollover', r.next_rollover_pool_wei === rollover, r.next_rollover_pool_wei);
}
const gallery = JSON.parse(await read('get_gallery'));
check('gallery has 9 settled entries', gallery.entries.length === 9,
  String(gallery.entries.length));
const room = JSON.parse(await read('get_room_state'));
check('room round_count', room.round_count === 9, String(room.round_count));
check('room current round', room.current_round_id === 'R9', room.current_round_id);

const expectedScores = { drawer: 440, b: 450, a: 50, c: 30, challenger: 0 };
for (const [role, score] of Object.entries(expectedScores)) {
  const s = JSON.parse(await read('get_player_stats', [journal.accounts[role]]));
  check(role + ' score', s.score === score, role + '=' + s.score);
}
const drawerStats = JSON.parse(await read('get_player_stats', [journal.accounts.drawer]));
const bStats = JSON.parse(await read('get_player_stats', [journal.accounts.b]));
check('drawer credit zero after withdraw', drawerStats.balance_wei === '0', drawerStats.balance_wei);
check('B credit zero after withdraw', bStats.balance_wei === '0', bStats.balance_wei);

console.log('\nVERIFY: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
