# SketchVerdict — EVIDENCE.md

On-chain evidence for the SketchVerdict drawing/guessing party game
(P12). Every expectation was pre-registered in `EXPECTED.md` BEFORE
any evidence transaction ran; this file records what actually
happened, expected vs actual, including every deviation. `EXPECTED.md`
was not edited retroactively (its R2 entry carries the deviation as
a dated ACTUAL note, written at the time it happened).

- Network: GenLayer Stable Studionet only (Chain ID 61999)
- Contract: [`0x56C85764c91F439185f446e019BB70A877458b54`](https://explorer-studio.genlayer.com/address/0x56C85764c91F439185f446e019BB70A877458b54)
- Deploy tx: [`0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce`](https://explorer-studio.genlayer.com/tx/0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce)
- Contract source: `contracts/sketchverdict.py`
- Source SHA-256: `0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47`
  (verified byte-identical to the deployed code by `scripts/verify.mjs`)
- Evidence run completed: 2026-11-10T15:59:17Z
- Evidence journal: `evidence.json` (every tx hash, receipt, consensus
  count, and latest-final readback)
- Independent verifier: `node scripts/verify.mjs` — **135 passed, 0 failed**
  (re-reads the deployed code for byte parity, re-reads all 64 evidence
  txs live, checks the money invariant and final state)
- Local tests: `tests/test_sketchverdict.py` — **24 passed, 0 failed**

## How the evidence was produced

`scripts/evidence.mjs` runs the full flow against the live contract
with temporary test accounts (drawer, guessers A/B/C, challenger,
fresh zero-balance account). The journal is resumable: completed
labels are skipped on re-run, so an interrupted run continues where
it stopped instead of re-submitting. Every step asserts a
latest-final readback immediately after its transaction finalizes.

Stakes (standard): drawer 10 GEN, guesser 5 GEN, challenge deposit
5 GEN, challenge window 10 UTC minutes. Drawings are stored on-chain
as base64 PNG (the same path live play uses: canvas export → base64
→ store); validators judge from the stored bytes, never from a URL.

## Outcome table (expected vs actual)

| Case | Pre-registered expectation | Actual on-chain | Result |
|---|---|---|---|
| R1 bicycle MATCHES, 3 guessers | MATCHES / VISUAL_MATCH_CONFIRMED; pot 25 GEN; drawer 12.5, B 6.25, C 6.25; rollover 0; fastest B | Identical. Scores D +100, B +100, C +30 | PASS |
| R2 lighthouse WEAK, 2 correct | WEAK / VISUAL_WEAK_PARTIAL; pot 20 GEN; drawer 5, A 2.5, B 2.5; rollover 10 | **Deviation:** jury returned MATCHES / VISUAL_MATCH_CONFIRMED — the drawing (tower + lamp room + cap) was too recognizable. Settled as MATCHES: drawer 10, A 5, B 5, rollover 0; scores D +100, A +100, B +30 | DEVIATION (recorded as-is; see below) |
| R2b lighthouse WEAK, vaguer drawing | WEAK / VISUAL_WEAK_PARTIAL; pot 20 GEN; drawer 5, A 2.5, B 2.5; rollover 10 | Identical (reveal took 3 attempts; first two ended UNDETERMINED, see incidents). Scores D +40, A +50, B +50 | PASS |
| R3 volcano text-cheat MISS | MISS / TEXT_CHEAT_DETECTED; accomplice A correct but 0 for everyone; pot 25 GEN → rollover 25; settled via R4 piggyback | Identical. Drawer 0, A 0, rollover 25 GEN | PASS |
| R4 guitar + crank image MISS | MISS / VISUAL_MISS; pot 40 GEN → rollover 40 | Identical. Drawer 0, rollover 40 GEN | PASS |
| R5 challenge flip | Reveal MISS / IMAGE_HASH_MISMATCH (wrong hash locked); challenge with true hash flips to MATCHES / VISUAL_MATCH_CONFIRMED, deposit refunded; settle pot 55 GEN, drawer 27.5, B 27.5, rollover 0 | Identical. Challenge outcome `CHALLENGE_SUCCEEDED_FLIP`, lock corrected, jury re-ran on the stored bytes | PASS |
| R6 challenge fails | MATCHES; challenge with wrong hash → `CHALLENGE_FAILED_WRONG_HASH`, 5 GEN forfeits to rollover; second challenge blocked, deposit refunded; settle pot 20 GEN, drawer 10, B 10, rollover 0 | Identical. Second challenge rejected `challenge_not_allowed`, 5 GEN credited back (CH credit 10 GEN: 5 R5 refund + 5 here) | PASS |
| R7 drawing timeout | DRAWER_DRAWING_TIMEOUT, drawer stake 10 GEN → rollover 10 | Identical. Status SETTLED directly, no jury | PASS |
| R8 reveal timeout | DRAWER_REVEAL_TIMEOUT, drawer stake 10 GEN → rollover 20, A and B refunded 5 GEN each | Identical on-chain. (The runner's intermediate balance check had wrong constants; see incidents — the contract was right.) | PASS |
| R9 odd-wei pot | MATCHES; pot 26,000,000,000,000,000,001 wei; drawer 13 GEN, B 13 GEN, rollover 1 wei | Identical. Conservation exact | PASS |
| R10 negative battery (7 items) | Each fails on-chain with the matching error, round state unchanged | All 7 as expected (table below) | PASS |
| R11 withdraw | Drawer withdraws 93 GEN, B withdraws 69.25 GEN, exact contract-balance drops; fresh zero-balance withdraw raises, moves nothing | Identical. Drawer 5/5 AGREE, B 3/5 AGREE, zero-withdraw raised `no_credit_to_withdraw` | PASS |

## Per-round money (all values in wei, from latest-final readbacks)

| Round | Verdict / reason | Total pot | Drawer payout | Guesser payouts | Next rollover |
|---|---|---|---|---|---|
| R1 | DRAWING_MATCHES / VISUAL_MATCH_CONFIRMED | 25,000,000,000,000,000,000 | 12,500,000,000,000,000,000 | B 6,250,000,000,000,000,000; C 6,250,000,000,000,000,000 | 0 |
| R2 | DRAWING_MATCHES / VISUAL_MATCH_CONFIRMED | 20,000,000,000,000,000,000 | 10,000,000,000,000,000,000 | A 5,000,000,000,000,000,000; B 5,000,000,000,000,000,000 | 0 |
| R2b | DRAWING_WEAK / VISUAL_WEAK_PARTIAL | 20,000,000,000,000,000,000 | 5,000,000,000,000,000,000 | A 2,500,000,000,000,000,000; B 2,500,000,000,000,000,000 | 10,000,000,000,000,000,000 |
| R3 | DRAWING_MISS / TEXT_CHEAT_DETECTED | 25,000,000,000,000,000,000 | 0 | A 0 | 25,000,000,000,000,000,000 |
| R4 | DRAWING_MISS / VISUAL_MISS | 40,000,000,000,000,000,000 | 0 | — | 40,000,000,000,000,000,000 |
| R5 | DRAWING_MATCHES / VISUAL_MATCH_CONFIRMED | 55,000,000,000,000,000,000 | 27,500,000,000,000,000,000 | B 27,500,000,000,000,000,000 | 0 |
| R6 | DRAWING_MATCHES / VISUAL_MATCH_CONFIRMED | 20,000,000,000,000,000,000 | 10,000,000,000,000,000,000 | B 10,000,000,000,000,000,000 | 0 |
| R7 | DRAWING_MISS / DRAWER_DRAWING_TIMEOUT | — (stake 10 GEN → rollover) | 0 | — | 10,000,000,000,000,000,000 |
| R8 | DRAWING_MISS / DRAWER_REVEAL_TIMEOUT | — (stake 10 GEN → rollover; A/B refunded 5 GEN each) | 0 | — (refunds, not payouts) | 20,000,000,000,000,000,000 |
| R9 | DRAWING_MATCHES / VISUAL_MATCH_CONFIRMED | 26,000,000,000,000,000,001 | 13,000,000,000,000,000,000 | B 13,000,000,000,000,000,000 | 1 |

## Final accounting (latest-final `get_accounting`, after R11)

| Item | Wei | GEN |
|---|---|---|
| Total received (`total_received_wei`) | 196,000,000,000,000,000,001 | 196 + 1 wei |
| Total withdrawn (`total_withdrawn_wei`) | 162,250,000,000,000,000,000 | 162.25 |
| Credits outstanding | 33,750,000,000,000,000,000 | 33.75 (A 17.5 + C 6.25 + CH 10) |
| Rollover pool | 1 | 1 wei |
| Locked stakes of open rounds | 0 | 0 |
| `invariant_ok` | true | received == withdrawn + credits + rollover + locked |
| Contract balance | 53,750,000,000,000,000,001 | 53.75 + 1 wei |
| `balance_matches_accounted` | **false** | balance exceeds accounted value by exactly 20 GEN — the stranded value from three MAJORITY_DISAGREE txs (see incidents). Not hidden: `verify.mjs` asserts the gap equals the documented stranded amount. |

Final scores: drawer 540, B 480, A 150, C 30, challenger 0. Gallery:
10 settled entries (R1, R2, R2b, R3, R4, R5, R6, R7, R8, R9),
`round_count` 10, current round R9. All 10 rounds SETTLED and frozen.

## R10 negative battery (all on-chain, round state unchanged)

| # | Action | Expected | Actual |
|---|---|---|---|
| R10-1 | Duplicate guess (A guesses again in R1) | `accepted:false`, `duplicate_guess`, 5 GEN credited back | Identical. Tx `0xe8cb27901415d7ef3004bd6eedea1e4a01267552ad9e647620a5f9fd6ec9a5fa`, 3/5 AGREE |
| R10-2 | Drawer self-guess (R1) | `accepted:false`, `drawer_self_guess`, 5 GEN credited back | Identical. Tx `0x5f68460d8e1795264caca10e5deee691550e778f702c91f4c76827004d7c8fc5`, 3/5 AGREE |
| R10-3 | Non-drawer reveal (A reveals R1) | Raises `only_drawer_reveals`, round stays GUESSING | Identical. Tx `0x3a40d67cd5ac807b6ce10aac463d4f4f9c83bfd102ebe0c8fd413881f153e7a9`, FINALIZED, validators agreed the call raises (leader ERROR, no SUCCESS execution) |
| R10-4 | Reveal with wrong salt (R1) | Raises `COMMIT_MISMATCH`, round stays GUESSING, then reveal correctly | Identical. Tx `0x810d2e95143c93a5f39d20c25c2507c825501f66fbb906c26a8bc3e61b994be2` |
| R10-5 | Second `submit_drawing` after GUESSING (R1) | `accepted:false`, `round_not_drawing`, conflict in witness log, stored drawing + hash unchanged | Identical. Tx `0xa76ef65b1c4d4dcbeb8d53d5c8be6d957c917e57a4240743449ebb1ada263ee3`, 4/5 AGREE |
| R10-6 | Re-reveal on a SETTLED round (R1) | `accepted:false`, `round_settled`, conflict in witness log, verdict unchanged | Identical. Tx `0x2fd41a7ad2569edb3d655934cd2324f943e7ae629146f6c41aa15b672f6adda0`, 3/5 AGREE |
| R10-7 | Second `start_round` with the same round_id (R1) | `accepted:false`, `duplicate_round_id`, conflict in witness log, 10 GEN credited back | Identical. Tx `0x19ea8e7f6398d4165c468f3cb571cfd8884824471262a54a4f3e2ffef86fcc53`, 3/5 AGREE |

## Witness log (latest-final `get_witness_log`, 7 entries)

1. `second_submit_drawing`, R1, drawer — conflict (R10-5)
2. `re_reveal_settled`, R1, drawer — conflict (R10-6)
3. `duplicate_round_id`, R1, drawer — conflict (R10-7)
4. `challenge`, R5 — `CHALLENGE_SUCCEEDED_FLIP` (old MISS /
   IMAGE_HASH_MISMATCH → new MATCHES / VISUAL_MATCH_CONFIRMED,
   deposit refunded, lock corrected to the recomputed hash)
5. `challenge`, R6 — `CHALLENGE_FAILED_WRONG_HASH` (deposit forfeited
   to rollover)
6. `timeout`, R7 — DRAWER_DRAWING_TIMEOUT, triggered by drawer
7. `timeout`, R8 — DRAWER_REVEAL_TIMEOUT, triggered by A

The blocked R6 second challenge is NOT a witness entry: the contract
refused it (`challenge_not_allowed`) and refunded the deposit before
any challenge was recorded — the refusal itself is the evidence
(CH credit became 10 GEN, verified by readback).

## Drawings (stored on-chain as base64)

| File | Bytes | SHA-256 | Used in |
|---|---|---|---|
| `bicycle.png` | 4602 | `3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14` | R1, R5, R6, R8, R9 |
| `lighthouse.png` | 1582 | `c06fd82a7430dc0695e01304b2fbe7a56a510b7421e2b69bdca4978d4cc048f3` | R2 |
| `lighthouse-vague.png` | 1527 | `7a0fd68a508352df8a689d2f4f7bbdeee6a1f27292033bed372dd602cee108d1` | R2b |
| `volcano-text.png` | 6139 | `d0da6341b39ca4d868d1f75bb2fbbb525c050a007008ff95881dddbf7c59c666` | R3 |
| `crank.png` (probe reuse) | 45021 | `e2bb96fcbb14606c63f77e853c59e160ccd4d196081cd8729e0b95747a53a546` | R4 |

## Incidents (nothing hidden; each was investigated, not worked around)

### 1. Payable-marker bug — 30 GEN stranded in an abandoned deployment

The first deployment (`0xD609fee308Fe807224aa3e177BEfF27deB1F0063`)
declared its payable methods as plain `@gl.public.write`, so
Studionet rejected every value-bearing call at method resolution
(`called non-payable method ... with non-zero value`). Three
`start_round` attempts (10 GEN each) moved their value into the
contract without executing and without any credit being recorded.
The deployment was abandoned; the 30 GEN is unrecoverable by design
(no credit exists for it). Fix: `@gl.public.write.payable` on
`start_round`, `submit_guess`, and `challenge` (the same marker the
A3 contract uses). A regression test pins the marker. Journal:
`evidence/evidence-abandoned-0xD609.json`.

### 2. R2 deviation — jury returned MATCHES, not WEAK

Pre-registered WEAK; the jury returned MATCHES on the lighthouse
drawing (tower + lamp room + cap read as a clear depiction).
Recorded as-is in `EXPECTED.md` (dated ACTUAL note) and in
`evidence.json` (R2:reveal `check_error`). R2 settled as MATCHES.
The WEAK branch is demonstrated by the new case R2b with a vaguer
drawing (no lamp room, no cap), which the jury returned as WEAK.
This shows the WEAK band is a genuine jury judgment call at the
band edge — the contract guarantees determinism of the money given
the verdict, not of the verdict itself.

### 3. MAJORITY_DISAGREE retries — 20 GEN stranded in the LIVE contract

Eight evidence transactions reached FINALIZED with result
MAJORITY_DISAGREE (validators agreed to disagree, no execution):
the first two attempts of R2:reveal, R2b:reveal, and
R5:challenge-true-hash, plus attempt 1 of R5:start and R8:timeout.
The runner retried each with a fresh transaction and the retry
succeeded — the mechanism is sound, but the retries exposed a
Studionet behavior: **a consensus-disagreed payable transaction
still transfers its value into the contract**. Three of the eight
carried value (R5:start attempt 1: 10 GEN; R5:challenge attempts 1
and 2: 5 GEN each). That 20 GEN sits in the live contract with no
credit and no `total_received` entry — it can never be withdrawn or
enter the rollover. Proof it moved: wallet balances reconcile
exactly only if the disagreed value left the wallets (drawer funded
570 GEN − 105 recorded − 10 disagreed = 455 on-chain; challenger
100 − 15 − 10 = 75; A 200 − 35 = 165; B 200 − 30 = 170).
Consequences: contract balance (53,750,000,000,000,000,001 wei)
exceeds the accounted value by exactly 20 GEN;
`balance_matches_accounted` is false; the money invariant over
accounted value still holds (`invariant_ok` true). The three
transactions are listed in `evidence.json`
(`stranded_disagreed_wei`) and asserted by `verify.mjs`. The five
0-value disagreed attempts cost nothing. Lesson for future runs:
never retry a value-bearing call blindly — check the previous
attempt's live receipt first; if it finalized as MAJORITY_DISAGREE,
its value is already stranded and a retry sends fresh value.

### 4. R8 runner-constant bug (the contract was right)

Run 6 stopped at the R8 readback check: the runner expected A 12.5
GEN and B 51.25 GEN, but the live balances were A 17.5 GEN and
B 56.25 GEN. The contract was correct; the runner's constants
omitted (a) the 5 GEN duplicate-guess deposit refunded to A in
R10-1 and (b) the 5 GEN R8 refund to B. The constants were fixed
(A 17.5 = 5 R2 + 2.5 R2b + 5 R8 refund + 5 R10-1 refund;
B 56.25 = 6.25 R1 + 5 R2 + 2.5 R2b + 27.5 R5 + 10 R6 + 5 R8 refund),
the corrected check was re-run against latest-final live state and
passed, and the journal entry was completed from that live
verification with a recovery note — no transaction was re-submitted
(the round was already SETTLED, so re-running the step would have
raised). `EXPECTED.md`'s final numbers already included these
refunds (they came from `simulate_expected.py`), which is why only
the R8 intermediate check was wrong.

### 5. Runtime restart mid-run (run 5 → run 6)

The runtime restarted while R5:draw-wrong-hash was polling. The
transaction was found FINALIZED with 3/5 AGREE on the live chain,
so the journal entry was completed from the live receipt + a
latest-final readback (R5 GUESSING, wrong hash locked) instead of
re-submitting the drawing — a re-submission would have recorded a
spurious second-drawing conflict. The recovery is noted in the
journal entry (`recovered_after_restart`).

### 6. Verifier corrections (before the final pass)

The first `verify.mjs` run passed 130/134. The 4 failures were
verifier bugs, not contract bugs: (a) three expected-failure
transactions (R10-3, R10-4, R11:withdraw-zero) are FINALIZED with
MAJORITY_AGREE — validators agree the call *raises* — but no leader
execution succeeds (leader ERROR). The verifier now applies the
same criterion the runner used (no successful leader execution).
(b) `balance_matches_accounted` is false by exactly the stranded
20 GEN; the verifier now asserts the gap equals the documented
stranded amount instead of asserting the flag. Final run:
**135 passed, 0 failed**.

## What this evidence does NOT prove

- **Jury subjectivity.** The vision jury decides MATCHES / WEAK /
  MISS on stored bytes; the WEAK band edge is a judgment call (see
  the R2 deviation). What is proven is that *given* a verdict, the
  money, scores, and state follow deterministically, and that bad
  evidence (wrong hash, text cheat, unrelated image) fails on-chain.
- **Real-player drawings.** The evidence drawings are synthetic PIL
  line art, not real player canvas input. They exercise the same
  on-chain path (base64 → store → jury on stored bytes), but a live
  game's messier drawings may land in the WEAK band more often.
- **Frontend / wallet / mobile.** No real OKX wallet or mobile
  check was done in this phase (frontend builder's domain).
- **The stranded 20 GEN is recoverable.** It is not — no credit was
  ever recorded for it, in either the dead deployment (30 GEN) or
  the live contract (20 GEN). Both are faucet testnet GEN (zero
  cash cost); the loss is documented, not hidden.
