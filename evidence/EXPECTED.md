# SketchVerdict — EXPECTED.md (pre-registration)

Written BEFORE any evidence transaction is run. If a pre-registered
expectation fails on-chain, this file is NOT edited retroactively:
the actual result is recorded in `evidence.json` + `EVIDENCE.md`,
the cause is analysed, and — if the drawing was at fault — a NEW
case (new round, new pre-registration entry below) is run with an
improved drawing.

Network: GenLayer Stable Studionet only (Chain ID 61999).
Contract: `contracts/sketchverdict.py` (source SHA-256 recorded in
`evidence.json` at deploy time).

## Stakes

Standard stakes used in every evidence round unless stated otherwise:

- drawer stake: 10 GEN (10,000,000,000,000,000,000 wei)
- guesser stake: 5 GEN (5,000,000,000,000,000,000 wei)
- challenge deposit: 5 GEN (5,000,000,000,000,000,000 wei)
- challenge window: 10 UTC minutes from the reveal minute
- durations: drawing 2 min, guessing 5 min, except R7 (drawing 1 min)
  and R8 (guessing 1 min)

Minimum stakes enforced by the contract (so an odd-wei pot stays
possible): drawer >= 1 GEN, guesser >= 0.1 GEN, challenge >= 1 GEN.

## Money rules (integer math only, remainder always rolls over)

`total_pot = previous rollover + drawer stake + sum(guesser stakes)`

- MATCHES, correct >= 1: drawer 50% of total_pot; correct guessers
  SPLIT the other 50% EQUALLY (fastest takes no extra money, only
  score +100 vs +30 for other correct guessers).
- MATCHES, correct 0: payouts 0, 100% rollover.
- WEAK, correct >= 1: drawer 25%; correct guessers split 25% equally;
  ~50% + remainders roll over.
- WEAK, correct 0 / MISS (any correct count): payouts 0, 100% rollover.
- Timeout DRAWING: drawer stake -> rollover, no guessers exist.
- Timeout GUESSING: drawer stake -> rollover, all guesser stakes
  refunded in full as withdrawable credits.

Invariant at all times: received GEN == withdrawn + credited balances
+ rollover + locked stakes of open rounds.

## Drawings (all stored on-chain as base64 — the same path live play uses)

| file | bytes | SHA-256 |
|---|---|---|
| `bicycle.png` | 4602 | `3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14` |
| `lighthouse.png` | 1582 | `c06fd82a7430dc0695e01304b2fbe7a56a510b7421e2b69bdca4978d4cc048f3` |
| `volcano-text.png` | 6139 | `d0da6341b39ca4d868d1f75bb2fbbb525c050a007008ff95881dddbf7c59c666` |
| `crank.png` (probe reuse) | 45021 | `e2bb96fcbb14606c63f77e853c59e160ccd4d196081cd8729e0b95747a53a546` |

## Cases

### R1 — CASE-1 bicycle MATCHES, 3 guessers

- Concept `bicycle`, salt `salt-r1`. Drawer stakes 10 GEN.
- Drawing: `bicycle.png` (two wheels + frame + handlebar + saddle),
  locked hash = its true SHA-256.
- Guesses: A `car` (WRONG, seq 1), B `bicycle` (CORRECT, seq 2),
  C `bicycle` (CORRECT, seq 3).
- Reveal: `DRAWING_MATCHES` / `VISUAL_MATCH_CONFIRMED`, cheat NO,
  fastest = B.
- Settle (explicit `settle`, after the challenge window):
  total_pot = 25 GEN; drawer 12,500,000,000,000,000,000 wei;
  B 6,250,000,000,000,000,000 wei; C 6,250,000,000,000,000,000 wei;
  rollover 0. Scores: drawer +100, B +100, C +30.

### R2 — CASE-2 lighthouse WEAK, 2 correct guessers

- Concept `lighthouse`, salt `salt-r2`. Drawer stakes 10 GEN.
- Drawing: `lighthouse.png` (plain tapered tower, tiny lamp, no beams,
  no stripes — deliberately vague).
- Guesses: A `lighthouse` (seq 1), B `lighthouse` (seq 2).
- Reveal: `DRAWING_WEAK` / `VISUAL_WEAK_PARTIAL`, cheat NO.
- Settle: total_pot = 20 GEN; drawer 5,000,000,000,000,000,000 wei;
  A 2,500,000,000,000,000,000 wei; B 2,500,000,000,000,000,000 wei;
  rollover 10,000,000,000,000,000,000 wei. Scores: drawer +40,
  A +50, B +50.
- NOTE (jury risk): WEAK is the genuinely uncertain verdict — the same
  drawing could plausibly read MATCHES or MISS. If the jury returns
  anything else, the actual result is recorded as-is (no edit here)
  and a follow-up round with a re-drawn lighthouse is run as a new
  pre-registered case.

### R3 — CASE-3 volcano text-cheat MISS

- Concept `volcano`, salt `salt-r3`. Drawer stakes 10 GEN.
- Drawing: `volcano-text.png` (the written word VOLCANO only).
- Guesses: accomplice A `volcano` (CORRECT, seq 1).
- Reveal: `DRAWING_MISS` / `TEXT_CHEAT_DETECTED`, cheat YES.
- Settle (via R4's `start_round` piggyback — proves that path):
  total_pot = 25 GEN (10 rollover + 10 + 5); drawer 0, A 0
  (listed as `"0"` in `guesser_payouts`), rollover
  25,000,000,000,000,000,000 wei. Scores +0.

### R4 — CASE-4 guitar concept + unrelated image (crank)

- Concept `guitar`, salt `salt-r4`. Drawer stakes 10 GEN.
- Drawing: `crank.png` (a crank diagram, unrelated to guitar).
- Guesses: A `tree` (WRONG).
- Reveal: `DRAWING_MISS` / `VISUAL_MISS`, cheat NO.
- Settle: total_pot = 40 GEN (25 rollover + 10 + 5); payouts 0;
  rollover 40,000,000,000,000,000,000 wei. Scores +0.

### R5 — challenge flip (Gate 3 demo)

- Concept `bicycle`, salt `salt-r5`. Drawer stakes 10 GEN.
- Drawing: `bicycle.png`, but `submit_drawing` locks a DELIBERATELY
  WRONG hash (`0000...0000`, 64 zeros).
- Guesses: B `bicycle` (CORRECT, seq 1).
- Reveal: `DRAWING_MISS` / `IMAGE_HASH_MISMATCH` (deterministic hash
  gate, no LLM call).
- Challenge by CH with the TRUE hash
  `3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14`:
  outcome `CHALLENGE_SUCCEEDED_FLIP`, deposit 5 GEN refunded to CH,
  lock corrected, jury re-runs, verdict flips to `DRAWING_MATCHES` /
  `VISUAL_MATCH_CONFIRMED`.
- Settle: total_pot = 55 GEN (40 rollover + 10 + 5); drawer
  27,500,000,000,000,000,000 wei; B 27,500,000,000,000,000,000 wei;
  rollover 0. Scores: drawer +100, B +100.

### R6 — challenge fails

- Concept `bicycle`, salt `salt-r6`. Drawer stakes 10 GEN.
- Drawing: `bicycle.png` with its true hash locked.
- Guesses: B `bicycle` (CORRECT, seq 1).
- Reveal: `DRAWING_MATCHES` / `VISUAL_MATCH_CONFIRMED`.
- Challenge by CH with a WRONG hash (`ffff...ffff`): outcome
  `CHALLENGE_FAILED_WRONG_HASH`, deposit 5 GEN forfeits to the
  rollover pool, verdict unchanged. Rollover pool becomes 5 GEN
  before settlement.
- Second challenge attempt (same round, first did not flip):
  rejected `challenge_not_allowed`, 5 GEN deposit credited back to
  CH (CH credit becomes 10 GEN: 5 from the R5 flip refund + 5 here).
- Settle: total_pot = 20 GEN (5 forfeit + 10 + 5); drawer
  10,000,000,000,000,000,000 wei; B 10,000,000,000,000,000,000 wei;
  rollover 0. Scores: drawer +100, B +100.

### R7 — drawer drawing timeout

- Concept `bicycle`, salt `salt-r7`, drawing duration 1 min.
  Drawer stakes 10 GEN. No drawing submitted.
- After the drawing deadline passes, drawer calls
  `trigger_timeout_auto_settle`: `DRAWING_MISS` /
  `DRAWER_DRAWING_TIMEOUT`, status SETTLED directly, drawer stake
  10 GEN -> rollover. Rollover pool becomes 10 GEN.
- Triggering before the deadline raises
  `drawing_deadline_not_passed`; a non-participant triggering raises
  `not_a_participant`.

### R8 — drawer reveal timeout

- Concept `bicycle`, salt `salt-r8`, guessing duration 1 min.
  Drawer stakes 10 GEN. Drawing: `bicycle.png`.
- Guesses: A `car` 5 GEN, B `bicycle` 5 GEN. No reveal.
- After the reveal deadline passes, A calls
  `trigger_timeout_auto_settle`: `DRAWING_MISS` /
  `DRAWER_REVEAL_TIMEOUT`, status SETTLED directly, drawer stake
  10 GEN -> rollover (pool becomes 20 GEN), A and B refunded 5 GEN
  each in full as withdrawable credits.

### R9 — odd-wei pot

- Concept `bicycle`, salt `salt-r9`. Drawer stakes
  1,000,000,000,000,000,001 wei (1 GEN + 1 wei).
- Drawing: `bicycle.png` with its true hash locked.
- Guesses: B `bicycle` (CORRECT, seq 1), 5 GEN.
- Reveal: `DRAWING_MATCHES` / `VISUAL_MATCH_CONFIRMED`.
- Settle: total_pot = 26,000,000,000,000,000,001 wei (20 GEN rollover
  + 1,000,000,000,000,000,001 + 5 GEN); drawer
  13,000,000,000,000,000,000 wei; B 13,000,000,000,000,000,000 wei;
  rollover 1 wei. Conservation exact, the 1-wei remainder sits in
  the rollover. Scores: drawer +100, B +100.

### R10 — regression / negative battery

Each must fail on-chain with the matching error, round state
unchanged (verified by a latest-final `get_round` readback after
each):

| # | action | expected failure |
|---|---|---|
| R10-1 | duplicate guess by the same player (R1, A guesses again) | `accepted:false`, reason `duplicate_guess`, 5 GEN credited back |
| R10-2 | drawer self-guess (R1, drawer guesses) | `accepted:false`, reason `drawer_self_guess`, 5 GEN credited back |
| R10-3 | non-drawer reveal (R1, A reveals) | raises `only_drawer_reveals`, round stays GUESSING |
| R10-4 | reveal with wrong salt (R1) | raises `COMMIT_MISMATCH`, round stays GUESSING, then reveal correctly |
| R10-5 | second `submit_drawing` after GUESSING (R1) | `accepted:false`, reason `round_not_drawing`, conflict recorded in witness log, stored drawing + hash unchanged |
| R10-6 | re-reveal on a SETTLED round (R1, after settle) | `accepted:false`, reason `round_settled`, conflict recorded, verdict unchanged |
| R10-7 | second `start_round` with the same round_id (R1, after settle) | `accepted:false`, reason `duplicate_round_id`, conflict recorded, 10 GEN credited back |

### R11 — withdraw

- Before: credited balances are DRAWER 83 GEN
  (83,000,000,000,000,000,000 wei), B 64.25 GEN
  (64,250,000,000,000,000,000 wei), A 12.5 GEN, C 6.25 GEN, CH 10 GEN.
  Rollover 1 wei. Contract balance = 176,000,000,000,000,000,001 wei
  received minus 0 withdrawn.
- DRAWER withdraws: receives exactly 83 GEN; contract balance drops
  by exactly 83 GEN; DRAWER credit becomes 0.
- B withdraws: receives exactly 64.25 GEN; contract balance drops by
  exactly 64.25 GEN; B credit becomes 0.
- Fresh account F (zero credit) calls `withdraw`: raises
  `no_credit_to_withdraw`, moves nothing (contract balance and F's
  balance unchanged).
- After both withdrawals: total withdrawn
  147,250,000,000,000,000,000 wei; remaining credits 28,750,000,000,
  000,000,000 wei (A 12.5 + C 6.25 + CH 10 GEN); rollover 1 wei;
  invariant holds: 176,000,000,000,000,000,001 ==
  147,250,000,000,000,000,000 + 28,750,000,000,000,000,000 + 1.

## Final scores (expected)

DRAWER 440, B 450, A 50, C 30, CH 0.

## Final accounting (expected)

- total received: 176,000,000,000,000,000,001 wei
- total withdrawn: 147,250,000,000,000,000,000 wei
- credits outstanding: 28,750,000,000,000,000,000 wei
- rollover: 1 wei
- locked stakes of open rounds: 0
- `get_accounting` invariant_ok: true

(All numbers above were computed by `scripts/simulate_expected.py`,
an independent re-implementation of the allocation chain, before any
evidence ran.)
