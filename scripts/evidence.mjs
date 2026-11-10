/* SketchVerdict evidence run (P12) on Stable Studionet.
 *
 * Runs the EXPECTED.md pre-registration (R1-R9 + R10 negatives + R11)
 * with temp accounts, one FINALIZED tx at a time. Journal-based and
 * resumable: evidence/evidence.json records every tx with its receipt
 * and latest-final readback; completed labels are skipped on re-run.
 *
 * Keys live ONLY in the checkpoint file
 * ~/workspace/build-p12/.checkpoint-accounts.json (0600, outside the
 * repo, deleted when the flow completes or is abandoned). The journal
 * records addresses, hashes, receipts and readbacks only.
 *
 * A step whose latest-final readback disagrees with EXPECTED.md
 * STOPS the run (journal saved): the actual result is analysed and,
 * if the drawing was at fault, a NEW case is run instead of editing
 * EXPECTED.md retroactively.
 */
import { createAccount, createClient, generatePrivateKey } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { assertSuccessfulConsensus } from './receipt.mjs';

const root = new URL('../', import.meta.url);
const journalFile = new URL('evidence/evidence.json', root);
const checkpointFile = new URL('../../.checkpoint-accounts.json', import.meta.url);
const RPC = 'https://studio.genlayer.com/api';
const GEN = 10n ** 18n;
const ZERO_HASH = '0'.repeat(64);
const WRONG_HASH = 'f'.repeat(64);

const IMAGES = JSON.parse(fs.readFileSync(new URL('evidence/images.json', root), 'utf8'));
const b64 = (name) => fs.readFileSync(new URL('evidence/' + name, root), 'utf8').trim();
const commit = (salt, concept) =>
  crypto.createHash('sha256').update(salt + '|' + concept).digest('hex');

// ---- journal --------------------------------------------------------------
let journal;
try {
  journal = JSON.parse(fs.readFileSync(journalFile, 'utf8'));
  console.log('RESUMING from existing journal,',
    (journal.transactions ?? []).length, 'txs recorded');
} catch {
  journal = {
    network: { chain_id: 61999, rpc: RPC },
    started_at: new Date().toISOString(),
    expected_doc: 'evidence/EXPECTED.md (pre-registered before any tx ran)',
    transactions: [], accounts: {},
  };
}
function save() {
  fs.mkdirSync(new URL('evidence/', root), { recursive: true });
  fs.writeFileSync(journalFile, JSON.stringify(journal,
    (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
}
save();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

async function rpc(method, params = [], attempts = 6) {
  let delay = 1000;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(RPC, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }) });
      if (!r.ok) throw Error('HTTP ' + r.status);
      const j = await r.json();
      if (j.error) throw Error('RPC ' + JSON.stringify(j.error));
      return j.result;
    } catch (e) {
      if (String(e).startsWith('RPC ')) throw e;
      if (i === attempts - 1) throw e;
      console.log('rpc retry', method, String(e).slice(0, 100));
      await sleep(delay);
      delay *= 2;
    }
  }
}

// ---- accounts (checkpointed outside the repo) -----------------------------
let checkpoint;
try {
  checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
  console.log('loaded checkpoint accounts:', Object.keys(checkpoint).join(', '));
} catch {
  checkpoint = {};
  for (const role of ['drawer', 'a', 'b', 'c', 'challenger', 'fresh']) {
    checkpoint[role] = generatePrivateKey();
  }
  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2) + '\n',
    { mode: 0o600 });
  fs.chmodSync(checkpointFile, 0o600);
  console.log('created checkpoint accounts file (0600, outside repo)');
}
const clients = {};
for (const [role, key] of Object.entries(checkpoint)) {
  clients[role] = createClient({ chain: studionet, account: createAccount(key) });
  journal.accounts[role] = clients[role].account.address;
}
save();
const addr = (role) => clients[role].account.address;
console.log('accounts:', JSON.stringify(journal.accounts));

// ---- chain + funding -------------------------------------------------------
let address = journal.contract_address ?? null;
const read = async (fn, args = []) => {
  for (let i = 0; i < 6; i++) {
    try {
      return await clients.drawer.readContract({ address, functionName: fn,
        args, transactionHashVariant: 'latest-final' });
    } catch (e) {
      if (i === 5) throw e;
      console.log('read retry', fn, String(e).slice(0, 100));
      await sleep(2000 * (i + 1));
    }
  }
};
const getRound = async (id) => JSON.parse(await read('get_round', [id]));
const getStats = async (a) => JSON.parse(await read('get_player_stats', [a]));
const getRoom = async () => JSON.parse(await read('get_room_state'));
const getAccounting = async () => JSON.parse(await read('get_accounting'));

async function pollReceipt(hash, label) {
  for (let i = 0; i < 300; i++) {
    let receipt = null;
    try {
      receipt = await rpc('eth_getTransactionByHash', [hash]);
    } catch (e) {
      console.log(label, 'poll rpc error, retrying:', String(e).slice(0, 100));
      await sleep(12000);
      continue;
    }
    if (receipt?.status === 'FINALIZED') return receipt;
    if (['UNDETERMINED', 'CANCELED', 'LEADER_TIMEOUT', 'VALIDATORS_TIMEOUT']
      .includes(receipt?.status)) throw Error(label + ' stopped: ' + receipt.status);
    if (i % 5 === 0) console.log(label, 'polling', receipt?.status);
    await sleep(12000);
  }
  throw Error(label + ' pending; retain hash and inspect without resubmission');
}

function done(label) {
  return journal.transactions.find((t) => t.label === label
    && t.receipt?.status === 'FINALIZED'
    && (t.expect === 'fail' ? t.consensus_error : !t.consensus_error));
}

function expect(cond, msg) {
  if (!cond) throw Error('EXPECTATION FAILED: ' + msg);
}

/* One evidence step.
 * expect: 'ok' (consensus must agree; retries up to 3 attempts on a
 *   transient consensus failure), 'fail' (the call must raise in
 *   consensus: FINALIZED receipt with no successful leader execution,
 *   no retry), 'reject' (FINALIZED + agreed, but the call returns
 *   accepted:false; verified through state, not the return value).
 * check: async function run against the latest-final readback.
 * A failed check STOPS the run with the journal saved.
 */
async function step(label, role, fn, args, value, check, expectKind = 'ok') {
  const existing = done(label);
  if (existing) {
    console.log(label, 'already recorded, skipping:', existing.hash);
    return existing;
  }
  const client = clients[role];
  const entry = { label, sender: client.account.address, role,
    fn, args: args.map((a) => typeof a === 'string' && a.length > 200
      ? a.slice(0, 40) + '...[' + a.length + ' chars]' : a),
    value: value.toString(), expect: expectKind,
    submitted_at: new Date().toISOString(), attempts: [] };
  journal.transactions.push(entry); save();
  const maxAttempts = expectKind === 'ok' ? 3 : 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const att = { attempt, hash: null };
    entry.attempts.push(att); save();
    try {
      att.hash = await client.writeContract({ address, functionName: fn,
        args, value, leaderOnly: false, consensusMaxRotations: 0 });
      entry.hash = att.hash; save();
      console.log(label, 'SUBMITTED', att.hash, '(attempt ' + attempt + ')');
    } catch (e) {
      att.error = String(e); save();
      console.log(label, 'SUBMISSION FAILED:', String(e).slice(0, 300));
      if (attempt === maxAttempts) throw Error(label + ' submission failed');
      await sleep(15000);
      continue;
    }
    try {
      att.receipt = await pollReceipt(att.hash, label);
      entry.receipt = att.receipt; save();
    } catch (e) {
      att.poll_error = String(e); save();
      console.log(label, 'POLL ENDED:', String(e).slice(0, 300));
      if (attempt === maxAttempts) throw Error(label + ' poll failed');
      await sleep(15000);
      continue;
    }
    try {
      att.consensus = assertSuccessfulConsensus(att.receipt);
      entry.consensus = att.consensus;
      delete entry.consensus_error;
      console.log(label, 'CONSENSUS OK',
        att.consensus.agree + '/' + att.consensus.total + ' AGREE');
    } catch (e) {
      att.consensus_error = String(e);
      entry.consensus_error = String(e); save();
      console.log(label, 'CONSENSUS FAILED:', String(e).slice(0, 300));
      if (expectKind === 'fail') {
        console.log(label, 'expected failure observed');
        break;
      }
      if (attempt === maxAttempts) {
        throw Error(label + ' consensus failed after ' + maxAttempts
          + ' attempts: ' + String(e).slice(0, 200));
      }
      console.log(label, 'retrying (transient consensus failure?)');
      await sleep(20000);
      continue;
    }
    if (expectKind === 'fail') {
      throw Error(label + ': expected a consensus failure but the call '
        + 'succeeded');
    }
    break;
  }
  if (check) {
    try {
      entry.readback = await check();
      console.log(label, 'READBACK OK:',
        JSON.stringify(entry.readback).slice(0, 400));
    } catch (e) {
      entry.check_error = String(e); save();
      console.log(label, 'READBACK/CHECK FAILED:', String(e).slice(0, 400));
      throw e;
    }
  }
  save();
  return entry;
}

/** Wait until the UTC minute (timeapi.io) is > targetMinute. */
async function waitMinuteGreaterThan(targetMinute, label) {
  console.log(label, 'waiting for UTC minute >', targetMinute);
  for (let i = 0; i < 240; i++) {
    try {
      const r = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC');
      const j = await r.json();
      const dt = new Date(j.dateTime + 'Z');
      const minute = Math.floor(dt.getTime() / 60000);
      if (minute > targetMinute) {
        console.log(label, 'now at UTC minute', minute, '(target was >',
          targetMinute + ')');
        return minute;
      }
      if (i % 4 === 0) console.log(label, 'UTC minute', minute, 'waiting...');
    } catch (e) {
      console.log(label, 'time fetch retry:', String(e).slice(0, 100));
    }
    await sleep(15000);
  }
  throw Error(label + ': deadline wait timed out');
}

async function main() {
  if (BigInt(await rpc('eth_chainId')) !== 61999n) throw Error('WRONG_CHAIN');
  if (BigInt(await rpc('eth_gasPrice')) !== 0n)
    throw Error('NONZERO_GAS_PRICE: no paid transaction allowed');
  const code = fs.readFileSync(new URL('contracts/sketchverdict.py', root), 'utf8');
  journal.source_sha256 = sha(code); save();
  console.log('contract source sha256:', journal.source_sha256);

  // ---- fund temp accounts (testnet GEN, zero cash cost) ------------------
  const funds = { drawer: 300, a: 100, b: 100, c: 50, challenger: 50, fresh: 1 };
  if (!journal.funding) {
    journal.funding = {};
    for (const [role, gen] of Object.entries(funds)) {
      const fundTx = await clients[role].request({ method: 'sim_fundAccount',
        params: [clients[role].account.address, gen * 10 ** 18] });
      const bal = await rpc('eth_getBalance', [clients[role].account.address, 'latest']);
      journal.funding[role] = { funded_gen: gen, fundTx: String(fundTx),
        balance_after_wei: BigInt(bal).toString() };
      console.log('funded', role, gen, 'GEN');
    }
    save();
  }

  // ---- deploy -------------------------------------------------------------
  if (!journal.contract_address) {
    const entry = { label: 'deploy', sender: addr('drawer'), role: 'drawer',
      submitted_at: new Date().toISOString(), attempts: [] };
    journal.transactions.push(entry); save();
    entry.hash = await clients.drawer.deployContract({
      code: new TextEncoder().encode(code), args: [],
      leaderOnly: false, consensusMaxRotations: 0 });
    save();
    console.log('deploy SUBMITTED', entry.hash);
    entry.receipt = await pollReceipt(entry.hash, 'deploy');
    save();
    entry.consensus = assertSuccessfulConsensus(entry.receipt);
    console.log('deploy CONSENSUS OK',
      entry.consensus.agree + '/' + entry.consensus.total + ' AGREE');
    address = entry.receipt.to_address;
    journal.contract_address = address; save();
    const deployed = await clients.drawer.getContractCode(address);
    if (deployed !== code) throw Error('DEPLOYED_SOURCE_MISMATCH');
    journal.source_verified = true; save();
    console.log('DEPLOYED', address, 'source verified byte-identical');
    entry.readback = await read('get_protocol');
    expect(entry.readback === 'sketchverdict-1', 'protocol mismatch');
    save();
  } else {
    console.log('using deployed contract', address);
    expect(await read('get_protocol') === 'sketchverdict-1', 'protocol mismatch');
  }

  const BICYCLE_SHA = IMAGES['bicycle.png'].sha256;
  const LIGHTHOUSE_SHA = IMAGES['lighthouse.png'].sha256;
  const VOLCANO_SHA = IMAGES['volcano-text.png'].sha256;
  const CRANK_SHA = IMAGES['crank.png'].sha256;

  // Wait until the challenge window of a JUDGED round has expired, then
  // run the given settle step.
  async function settleAfterWindow(roundId, settleLabel) {
    const rnd = await getRound(roundId);
    expect(rnd.status === 'JUDGED', roundId + ' not JUDGED before settle');
    await waitMinuteGreaterThan(parseInt(rnd.challenge_deadline_minute, 10),
      settleLabel + ':wait');
    return rnd;
  }

  // ============================ R1 CASE-1 ================================
  await step('R1:start', 'drawer', 'start_round',
    ['R1', commit('salt-r1', 'bicycle'), 'animals', 2, 5], 10n * GEN,
    async () => {
      const r = await getRound('R1');
      expect(r.status === 'DRAWING', 'R1 not DRAWING');
      expect(r.drawer === addr('drawer'), 'R1 drawer mismatch');
      return { status: r.status, drawing_deadline_minute: r.drawing_deadline_minute };
    });
  await step('R1:draw', 'drawer', 'submit_drawing',
    ['R1', b64('bicycle.b64'), BICYCLE_SHA], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.status === 'GUESSING', 'R1 not GUESSING');
      expect(r.image_sha256 === BICYCLE_SHA, 'R1 hash lock mismatch');
      return { status: r.status, image_byte_len: r.image_byte_len };
    });
  // R10-2 drawer self-guess: rejected + refunded.
  await step('R10-2:self-guess', 'drawer', 'submit_guess',
    ['R1', 'bicycle'], 5n * GEN,
    async () => {
      const s = await getStats(addr('drawer'));
      expect(s.balance_wei === (5n * GEN).toString(), 'self-guess refund missing');
      expect((await getRound('R1')).guesses.length === 0, 'self-guess recorded');
      return { drawer_credit_wei: s.balance_wei };
    }, 'reject');
  await step('R1:guess-A-car', 'a', 'submit_guess', ['R1', 'car'], 5n * GEN,
    async () => {
      const r = await getRound('R1');
      expect(r.guesses.length === 1 && r.guesses[0].seq_no === 1, 'A seq wrong');
      return { guesses: r.guesses.map((g) => g.normalized_guess) };
    });
  await step('R1:guess-B-bicycle', 'b', 'submit_guess', ['R1', 'Bicycle'], 5n * GEN,
    async () => {
      const r = await getRound('R1');
      expect(r.guesses.length === 2 && r.guesses[1].normalized_guess === 'bicycle', 'B guess wrong');
      return { seq_no: r.guesses[1].seq_no };
    });
  await step('R1:guess-C-bicycle', 'c', 'submit_guess', ['R1', ' bicycle '], 5n * GEN,
    async () => {
      const r = await getRound('R1');
      expect(r.guesses.length === 3, 'C guess missing');
      return { guesses: r.guesses.length };
    });
  // R10-1 duplicate guess: rejected + refunded.
  await step('R10-1:dup-guess', 'a', 'submit_guess', ['R1', 'bicycle'], 5n * GEN,
    async () => {
      const s = await getStats(addr('a'));
      expect(s.balance_wei === (5n * GEN).toString(), 'dup-guess refund missing');
      expect((await getRound('R1')).guesses.length === 3, 'dup guess recorded');
      return { a_credit_wei: s.balance_wei };
    }, 'reject');
  // R10-5 second submit_drawing: witness, no overwrite.
  await step('R10-5:second-drawing', 'drawer', 'submit_drawing',
    ['R1', b64('crank.b64'), 'e'.repeat(64)], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.image_sha256 === BICYCLE_SHA, 'drawing overwritten!');
      const w = JSON.parse(await read('get_witness_log'));
      expect(w.entries.some((e) => e.kind === 'second_submit_drawing'
        && e.round_id === 'R1'), 'no witness entry');
      return { image_sha256: r.image_sha256, witness: w.entries.length };
    }, 'reject');
  // R10-3 non-drawer reveal: raises, stays GUESSING.
  await step('R10-3:non-drawer-reveal', 'a', 'reveal_and_auto_settle',
    ['R1', 'bicycle', 'salt-r1'], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.status === 'GUESSING', 'round moved after non-drawer reveal');
      return { status: r.status };
    }, 'fail');
  // R10-4 wrong salt: COMMIT_MISMATCH, stays GUESSING.
  await step('R10-4:wrong-salt', 'drawer', 'reveal_and_auto_settle',
    ['R1', 'bicycle', 'wrong-salt'], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.status === 'GUESSING', 'round moved after COMMIT_MISMATCH');
      return { status: r.status };
    }, 'fail');
  // Correct reveal.
  await step('R1:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R1', 'bicycle', 'salt-r1'], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.status === 'JUDGED', 'R1 not JUDGED');
      expect(r.drawing_verdict === 'DRAWING_MATCHES', 'R1 verdict ' + r.drawing_verdict);
      expect(r.reason_code === 'VISUAL_MATCH_CONFIRMED', 'R1 reason ' + r.reason_code);
      expect(r.has_written_text_cheat === 'NO', 'R1 cheat flag wrong');
      expect(JSON.stringify(r.correct_guessers) === JSON.stringify([addr('b'), addr('c')]),
        'R1 correct guessers wrong');
      expect(r.fastest_guesser === addr('b'), 'R1 fastest wrong');
      return { verdict: r.drawing_verdict, reason: r.reason_code,
        fastest: r.fastest_guesser, challenge_deadline_minute: r.challenge_deadline_minute };
    });
  await settleAfterWindow('R1', 'R1:settle');
  await step('R1:settle', 'a', 'settle', ['R1'], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.status === 'SETTLED', 'R1 not SETTLED');
      expect(r.total_pot_wei === (25n * GEN).toString(), 'R1 pot ' + r.total_pot_wei);
      expect(r.drawer_payout_wei === (125n * GEN / 10n).toString(), 'R1 drawer payout');
      expect(r.guesser_payouts[addr('b')] === (625n * GEN / 100n).toString(), 'R1 B payout');
      expect(r.guesser_payouts[addr('c')] === (625n * GEN / 100n).toString(), 'R1 C payout');
      expect(r.next_rollover_pool_wei === '0', 'R1 rollover');
      const sd = await getStats(addr('drawer'));
      expect(sd.score === 100, 'drawer score ' + sd.score);
      expect((await getStats(addr('b'))).score === 100, 'B score');
      expect((await getStats(addr('c'))).score === 30, 'C score');
      return { total_pot_wei: r.total_pot_wei, drawer_payout_wei: r.drawer_payout_wei,
        guesser_payouts: r.guesser_payouts, rollover: r.next_rollover_pool_wei };
    });
  // R10-6 re-reveal on SETTLED: witness, no overwrite.
  await step('R10-6:re-reveal-settled', 'drawer', 'reveal_and_auto_settle',
    ['R1', 'bicycle', 'salt-r1'], 0n,
    async () => {
      const r = await getRound('R1');
      expect(r.drawing_verdict === 'DRAWING_MATCHES', 'settled verdict changed!');
      const w = JSON.parse(await read('get_witness_log'));
      expect(w.entries.some((e) => e.kind === 're_reveal_settled'
        && e.round_id === 'R1'), 'no re-reveal witness');
      return { verdict: r.drawing_verdict };
    }, 'reject');
  // R10-7 duplicate round_id start: witness + refund.
  await step('R10-7:dup-round-id', 'drawer', 'start_round',
    ['R1', commit('x', 'y'), 'test', 2, 5], 10n * GEN,
    async () => {
      const s = await getStats(addr('drawer'));
      // drawer credit: 5 (self-guess refund) + 12.5 (R1 payout) + 10 (this refund)
      expect(s.balance_wei === (275n * GEN / 10n).toString(),
        'dup-round refund wrong: ' + s.balance_wei);
      const w = JSON.parse(await read('get_witness_log'));
      expect(w.entries.some((e) => e.kind === 'duplicate_round_id'
        && e.round_id === 'R1'), 'no dup-round witness');
      return { drawer_credit_wei: s.balance_wei };
    }, 'reject');

  // ============================ R2 CASE-2 ================================
  await step('R2:start', 'drawer', 'start_round',
    ['R2', commit('salt-r2', 'lighthouse'), 'places', 2, 5], 10n * GEN,
    async () => ({ status: (await getRound('R2')).status }));
  await step('R2:draw', 'drawer', 'submit_drawing',
    ['R2', b64('lighthouse.b64'), LIGHTHOUSE_SHA], 0n,
    async () => ({ status: (await getRound('R2')).status }));
  await step('R2:guess-A', 'a', 'submit_guess', ['R2', 'lighthouse'], 5n * GEN,
    async () => ({ guesses: (await getRound('R2')).guesses.length }));
  await step('R2:guess-B', 'b', 'submit_guess', ['R2', 'LIGHTHOUSE'], 5n * GEN,
    async () => ({ guesses: (await getRound('R2')).guesses.length }));
  await step('R2:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R2', 'lighthouse', 'salt-r2'], 0n,
    async () => {
      const r = await getRound('R2');
      expect(r.drawing_verdict === 'DRAWING_WEAK', 'R2 verdict ' + r.drawing_verdict
        + ' (see EXPECTED.md jury-risk note)');
      expect(r.reason_code === 'VISUAL_WEAK_PARTIAL', 'R2 reason ' + r.reason_code);
      return { verdict: r.drawing_verdict, reason: r.reason_code,
        challenge_deadline_minute: r.challenge_deadline_minute };
    });
  await settleAfterWindow('R2', 'R2:settle');
  await step('R2:settle', 'a', 'settle', ['R2'], 0n,
    async () => {
      const r = await getRound('R2');
      expect(r.total_pot_wei === (20n * GEN).toString(), 'R2 pot');
      expect(r.drawer_payout_wei === (5n * GEN).toString(), 'R2 drawer payout');
      expect(r.guesser_payouts[addr('a')] === (25n * GEN / 10n).toString(), 'R2 A payout');
      expect(r.guesser_payouts[addr('b')] === (25n * GEN / 10n).toString(), 'R2 B payout');
      expect(r.next_rollover_pool_wei === (10n * GEN).toString(), 'R2 rollover');
      expect((await getStats(addr('drawer'))).score === 140, 'drawer score');
      expect((await getStats(addr('a'))).score === 50, 'A score');
      return { total_pot_wei: r.total_pot_wei, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R3 CASE-3 ================================
  await step('R3:start', 'drawer', 'start_round',
    ['R3', commit('salt-r3', 'volcano'), 'nature', 2, 5], 10n * GEN,
    async () => ({ status: (await getRound('R3')).status }));
  await step('R3:draw', 'drawer', 'submit_drawing',
    ['R3', b64('volcano-text.b64'), VOLCANO_SHA], 0n,
    async () => ({ status: (await getRound('R3')).status }));
  await step('R3:guess-A', 'a', 'submit_guess', ['R3', 'volcano'], 5n * GEN,
    async () => ({ guesses: (await getRound('R3')).guesses.length }));
  await step('R3:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R3', 'volcano', 'salt-r3'], 0n,
    async () => {
      const r = await getRound('R3');
      expect(r.drawing_verdict === 'DRAWING_MISS', 'R3 verdict ' + r.drawing_verdict);
      expect(r.reason_code === 'TEXT_CHEAT_DETECTED', 'R3 reason ' + r.reason_code);
      expect(r.has_written_text_cheat === 'YES', 'R3 cheat flag wrong');
      return { verdict: r.drawing_verdict, reason: r.reason_code,
        challenge_deadline_minute: r.challenge_deadline_minute };
    });

  // ============================ R4 CASE-4 ================================
  // R4 start piggybacks R3's settlement (challenge window must have expired).
  {
    const r3 = await getRound('R3');
    await waitMinuteGreaterThan(parseInt(r3.challenge_deadline_minute, 10), 'R4:start:wait');
  }
  await step('R4:start', 'drawer', 'start_round',
    ['R4', commit('salt-r4', 'guitar'), 'music', 2, 5], 10n * GEN,
    async () => {
      const r3 = await getRound('R3');
      expect(r3.status === 'SETTLED', 'R3 not settled by piggyback');
      expect(r3.total_pot_wei === (25n * GEN).toString(), 'R3 pot ' + r3.total_pot_wei);
      expect(r3.drawer_payout_wei === '0', 'R3 drawer payout');
      expect(r3.guesser_payouts[addr('a')] === '0', 'R3 accomplice payout');
      expect(r3.next_rollover_pool_wei === (25n * GEN).toString(), 'R3 rollover');
      expect((await getRound('R4')).status === 'DRAWING', 'R4 not DRAWING');
      return { r3_settled: true, r3_rollover: r3.next_rollover_pool_wei };
    });
  await step('R4:draw', 'drawer', 'submit_drawing',
    ['R4', b64('crank.b64'), CRANK_SHA], 0n,
    async () => ({ status: (await getRound('R4')).status }));
  await step('R4:guess-A', 'a', 'submit_guess', ['R4', 'tree'], 5n * GEN,
    async () => ({ guesses: (await getRound('R4')).guesses.length }));
  await step('R4:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R4', 'guitar', 'salt-r4'], 0n,
    async () => {
      const r = await getRound('R4');
      expect(r.drawing_verdict === 'DRAWING_MISS', 'R4 verdict ' + r.drawing_verdict);
      expect(r.reason_code === 'VISUAL_MISS', 'R4 reason ' + r.reason_code);
      return { verdict: r.drawing_verdict, reason: r.reason_code,
        challenge_deadline_minute: r.challenge_deadline_minute };
    });
  await settleAfterWindow('R4', 'R4:settle');
  await step('R4:settle', 'a', 'settle', ['R4'], 0n,
    async () => {
      const r = await getRound('R4');
      expect(r.total_pot_wei === (40n * GEN).toString(), 'R4 pot');
      expect(r.next_rollover_pool_wei === (40n * GEN).toString(), 'R4 rollover');
      return { total_pot_wei: r.total_pot_wei, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R5 challenge flip ========================
  await step('R5:start', 'drawer', 'start_round',
    ['R5', commit('salt-r5', 'bicycle'), 'animals', 2, 5], 10n * GEN,
    async () => ({ status: (await getRound('R5')).status }));
  await step('R5:draw-wrong-hash', 'drawer', 'submit_drawing',
    ['R5', b64('bicycle.b64'), ZERO_HASH], 0n,
    async () => {
      const r = await getRound('R5');
      expect(r.image_sha256 === ZERO_HASH, 'R5 wrong lock not stored');
      return { locked: r.image_sha256 };
    });
  await step('R5:guess-B', 'b', 'submit_guess', ['R5', 'bicycle'], 5n * GEN,
    async () => ({ guesses: (await getRound('R5')).guesses.length }));
  await step('R5:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R5', 'bicycle', 'salt-r5'], 0n,
    async () => {
      const r = await getRound('R5');
      expect(r.drawing_verdict === 'DRAWING_MISS', 'R5 verdict ' + r.drawing_verdict);
      expect(r.reason_code === 'IMAGE_HASH_MISMATCH', 'R5 reason ' + r.reason_code);
      return { verdict: r.drawing_verdict, reason: r.reason_code,
        challenge_deadline_minute: r.challenge_deadline_minute };
    });
  await step('R5:challenge-true-hash', 'challenger', 'challenge',
    ['R5', BICYCLE_SHA], 5n * GEN,
    async () => {
      const r = await getRound('R5');
      expect(r.drawing_verdict === 'DRAWING_MATCHES', 'R5 flip verdict ' + r.drawing_verdict);
      expect(r.reason_code === 'VISUAL_MATCH_CONFIRMED', 'R5 flip reason');
      expect(r.image_sha256 === BICYCLE_SHA, 'R5 lock not corrected');
      expect(r.challenges.length === 1
        && r.challenges[0].outcome === 'CHALLENGE_SUCCEEDED_FLIP', 'R5 challenge log');
      const s = await getStats(addr('challenger'));
      expect(s.balance_wei === (5n * GEN).toString(), 'R5 deposit not refunded');
      return { verdict: r.drawing_verdict, challenger_credit_wei: s.balance_wei };
    });
  await settleAfterWindow('R5', 'R5:settle');
  await step('R5:settle', 'a', 'settle', ['R5'], 0n,
    async () => {
      const r = await getRound('R5');
      expect(r.total_pot_wei === (55n * GEN).toString(), 'R5 pot');
      expect(r.drawer_payout_wei === (275n * GEN / 10n).toString(), 'R5 drawer payout');
      expect(r.guesser_payouts[addr('b')] === (275n * GEN / 10n).toString(), 'R5 B payout');
      expect(r.next_rollover_pool_wei === '0', 'R5 rollover');
      return { total_pot_wei: r.total_pot_wei, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R6 challenge fails =======================
  await step('R6:start', 'drawer', 'start_round',
    ['R6', commit('salt-r6', 'bicycle'), 'animals', 2, 5], 10n * GEN,
    async () => ({ status: (await getRound('R6')).status }));
  await step('R6:draw', 'drawer', 'submit_drawing',
    ['R6', b64('bicycle.b64'), BICYCLE_SHA], 0n,
    async () => ({ status: (await getRound('R6')).status }));
  await step('R6:guess-B', 'b', 'submit_guess', ['R6', 'bicycle'], 5n * GEN,
    async () => ({ guesses: (await getRound('R6')).guesses.length }));
  await step('R6:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R6', 'bicycle', 'salt-r6'], 0n,
    async () => {
      const r = await getRound('R6');
      expect(r.drawing_verdict === 'DRAWING_MATCHES', 'R6 verdict ' + r.drawing_verdict);
      return { verdict: r.drawing_verdict,
        challenge_deadline_minute: r.challenge_deadline_minute };
    });
  await step('R6:challenge-wrong-hash', 'challenger', 'challenge',
    ['R6', WRONG_HASH], 5n * GEN,
    async () => {
      const r = await getRound('R6');
      expect(r.drawing_verdict === 'DRAWING_MATCHES', 'R6 verdict changed!');
      expect(r.challenges.length === 1
        && r.challenges[0].outcome === 'CHALLENGE_FAILED_WRONG_HASH', 'R6 challenge log');
      const room = await getRoom();
      expect(room.rollover_pool_wei === (5n * GEN).toString(),
        'R6 forfeit not in rollover: ' + room.rollover_pool_wei);
      return { outcome: r.challenges[0].outcome, rollover: room.rollover_pool_wei };
    });
  await step('R6:challenge-second-blocked', 'challenger', 'challenge',
    ['R6', WRONG_HASH], 5n * GEN,
    async () => {
      const s = await getStats(addr('challenger'));
      expect(s.balance_wei === (10n * GEN).toString(),
        'R6 second-challenge refund wrong: ' + s.balance_wei);
      return { challenger_credit_wei: s.balance_wei };
    }, 'reject');
  await settleAfterWindow('R6', 'R6:settle');
  await step('R6:settle', 'a', 'settle', ['R6'], 0n,
    async () => {
      const r = await getRound('R6');
      expect(r.total_pot_wei === (20n * GEN).toString(), 'R6 pot');
      expect(r.drawer_payout_wei === (10n * GEN).toString(), 'R6 drawer payout');
      expect(r.guesser_payouts[addr('b')] === (10n * GEN).toString(), 'R6 B payout');
      expect(r.next_rollover_pool_wei === '0', 'R6 rollover');
      return { total_pot_wei: r.total_pot_wei, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R7 drawing timeout =======================
  await step('R7:start', 'drawer', 'start_round',
    ['R7', commit('salt-r7', 'bicycle'), 'animals', 1, 5], 10n * GEN,
    async () => ({ status: (await getRound('R7')).status }));
  {
    const r = await getRound('R7');
    await waitMinuteGreaterThan(parseInt(r.drawing_deadline_minute, 10), 'R7:timeout:wait');
  }
  await step('R7:timeout', 'drawer', 'trigger_timeout_auto_settle', ['R7'], 0n,
    async () => {
      const r = await getRound('R7');
      expect(r.status === 'SETTLED', 'R7 not SETTLED');
      expect(r.drawing_verdict === 'DRAWING_MISS', 'R7 verdict');
      expect(r.reason_code === 'DRAWER_DRAWING_TIMEOUT', 'R7 reason ' + r.reason_code);
      expect(r.timeout_forfeited_wei === (10n * GEN).toString(), 'R7 forfeit');
      expect(r.next_rollover_pool_wei === (10n * GEN).toString(), 'R7 rollover');
      return { reason: r.reason_code, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R8 reveal timeout ========================
  await step('R8:start', 'drawer', 'start_round',
    ['R8', commit('salt-r8', 'bicycle'), 'animals', 2, 1], 10n * GEN,
    async () => ({ status: (await getRound('R8')).status }));
  await step('R8:draw', 'drawer', 'submit_drawing',
    ['R8', b64('bicycle.b64'), BICYCLE_SHA], 0n,
    async () => ({ status: (await getRound('R8')).status }));
  await step('R8:guess-A', 'a', 'submit_guess', ['R8', 'car'], 5n * GEN,
    async () => ({ guesses: (await getRound('R8')).guesses.length }));
  await step('R8:guess-B', 'b', 'submit_guess', ['R8', 'bicycle'], 5n * GEN,
    async () => ({ guesses: (await getRound('R8')).guesses.length }));
  {
    const r = await getRound('R8');
    await waitMinuteGreaterThan(parseInt(r.reveal_deadline_minute, 10), 'R8:timeout:wait');
  }
  await step('R8:timeout', 'a', 'trigger_timeout_auto_settle', ['R8'], 0n,
    async () => {
      const r = await getRound('R8');
      expect(r.status === 'SETTLED', 'R8 not SETTLED');
      expect(r.reason_code === 'DRAWER_REVEAL_TIMEOUT', 'R8 reason ' + r.reason_code);
      expect(r.timeout_forfeited_wei === (10n * GEN).toString(), 'R8 forfeit');
      expect(r.next_rollover_pool_wei === (20n * GEN).toString(), 'R8 rollover');
      expect((await getStats(addr('a'))).balance_wei === (125n * GEN / 10n).toString(),
        'R8 A refund');
      expect((await getStats(addr('b'))).balance_wei === (5125n * GEN / 100n).toString(),
        'R8 B refund');
      return { reason: r.reason_code, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R9 odd-wei pot ===========================
  const ODD_STAKE = 1000000000000000001n;
  await step('R9:start', 'drawer', 'start_round',
    ['R9', commit('salt-r9', 'bicycle'), 'animals', 2, 5], ODD_STAKE,
    async () => ({ status: (await getRound('R9')).status }));
  await step('R9:draw', 'drawer', 'submit_drawing',
    ['R9', b64('bicycle.b64'), BICYCLE_SHA], 0n,
    async () => ({ status: (await getRound('R9')).status }));
  await step('R9:guess-B', 'b', 'submit_guess', ['R9', 'bicycle'], 5n * GEN,
    async () => ({ guesses: (await getRound('R9')).guesses.length }));
  await step('R9:reveal', 'drawer', 'reveal_and_auto_settle',
    ['R9', 'bicycle', 'salt-r9'], 0n,
    async () => {
      const r = await getRound('R9');
      expect(r.drawing_verdict === 'DRAWING_MATCHES', 'R9 verdict ' + r.drawing_verdict);
      return { verdict: r.drawing_verdict,
        challenge_deadline_minute: r.challenge_deadline_minute };
    });
  await settleAfterWindow('R9', 'R9:settle');
  await step('R9:settle', 'a', 'settle', ['R9'], 0n,
    async () => {
      const r = await getRound('R9');
      expect(r.total_pot_wei === '26000000000000000001', 'R9 pot ' + r.total_pot_wei);
      expect(r.drawer_payout_wei === '13000000000000000000', 'R9 drawer payout');
      expect(r.guesser_payouts[addr('b')] === '13000000000000000000', 'R9 B payout');
      expect(r.next_rollover_pool_wei === '1', 'R9 rollover ' + r.next_rollover_pool_wei);
      return { total_pot_wei: r.total_pot_wei, rollover: r.next_rollover_pool_wei };
    });

  // ============================ R11 withdraw =============================
  const balBefore = await rpc('eth_getBalance', [address, 'latest']);
  const drawerBefore = await rpc('eth_getBalance', [addr('drawer'), 'latest']);
  const bBefore = await rpc('eth_getBalance', [addr('b'), 'latest']);
  const freshBefore = await rpc('eth_getBalance', [addr('fresh'), 'latest']);
  await step('R11:withdraw-drawer', 'drawer', 'withdraw', [], 0n,
    async () => {
      const s = await getStats(addr('drawer'));
      expect(s.balance_wei === '0', 'drawer credit not zeroed');
      const balAfter = await rpc('eth_getBalance', [address, 'latest']);
      expect(BigInt(balAfter) === BigInt(balBefore) - 83n * GEN,
        'contract balance drop wrong');
      const dAfter = await rpc('eth_getBalance', [addr('drawer'), 'latest']);
      expect(BigInt(dAfter) === BigInt(drawerBefore) + 83n * GEN,
        'drawer received wrong');
      return { withdrawn_wei: (83n * GEN).toString() };
    });
  await step('R11:withdraw-B', 'b', 'withdraw', [], 0n,
    async () => {
      const s = await getStats(addr('b'));
      expect(s.balance_wei === '0', 'B credit not zeroed');
      const balAfter = await rpc('eth_getBalance', [address, 'latest']);
      expect(BigInt(balAfter) === BigInt(balBefore) - (83n * GEN + 6425n * GEN / 100n),
        'contract balance drop wrong after B');
      const bAfter = await rpc('eth_getBalance', [addr('b'), 'latest']);
      expect(BigInt(bAfter) === BigInt(bBefore) + 6425n * GEN / 100n,
        'B received wrong');
      return { withdrawn_wei: (6425n * GEN / 100n).toString() };
    });
  // Zero-balance withdraw raises and moves nothing.
  await step('R11:withdraw-zero', 'fresh', 'withdraw', [], 0n,
    async () => {
      const s = await getStats(addr('fresh'));
      expect(s.balance_wei === '0', 'fresh credit not zero');
      const balAfter = await rpc('eth_getBalance', [address, 'latest']);
      expect(BigInt(balAfter) === BigInt(balBefore) - (83n * GEN + 6425n * GEN / 100n),
        'contract balance moved on zero withdraw!');
      const fAfter = await rpc('eth_getBalance', [addr('fresh'), 'latest']);
      expect(BigInt(fAfter) === BigInt(freshBefore), 'fresh balance moved!');
      return { fresh_credit_wei: '0' };
    }, 'fail');

  // ---- final snapshot ------------------------------------------------------
  const finalRoom = await getRoom();
  const finalAcc = await getAccounting();
  const finalGallery = JSON.parse(await read('get_gallery'));
  const finalScores = {};
  for (const role of ['drawer', 'a', 'b', 'c', 'challenger']) {
    finalScores[role] = await getStats(addr(role));
  }
  journal.final_snapshot = { room: finalRoom, accounting: finalAcc,
    gallery_entries: finalGallery.entries.length, scores: finalScores };
  expect(finalAcc.invariant_ok === true, 'final invariant broken: ' + JSON.stringify(finalAcc));
  expect(finalAcc.total_received_wei === '176000000000000000001',
    'final received ' + finalAcc.total_received_wei);
  expect(finalAcc.total_withdrawn_wei === '147250000000000000000',
    'final withdrawn ' + finalAcc.total_withdrawn_wei);
  expect(finalAcc.credits_outstanding_wei === '28750000000000000000',
    'final credits ' + finalAcc.credits_outstanding_wei);
  expect(finalAcc.rollover_pool_wei === '1', 'final rollover');
  expect(finalAcc.locked_stakes_wei === '0', 'final locked stakes');
  expect(finalScores.drawer.score === 440, 'drawer final score');
  expect(finalScores.b.score === 450, 'B final score');
  expect(finalScores.a.score === 50, 'A final score');
  expect(finalScores.c.score === 30, 'C final score');
  journal.completed_at = new Date().toISOString();
  save();
  console.log('EVIDENCE COMPLETE');
  console.log('contract:', address);
  console.log('final accounting:', JSON.stringify(finalAcc));
}

main().catch((e) => {
  journal.error = String(e);
  save();
  console.error(String(e));
  process.exitCode = 1;
});
