# SketchVerdict — API.md (frontend contract)

Network: GenLayer Stable Studionet only, Chain ID 61999,
RPC `https://studio.genlayer.com/api`. Contract address: see `README.md`
(and `evidence/evidence.json` `contract_address`).

All view methods return canonical JSON strings (sorted keys, compact).
All write methods return canonical JSON strings. Money is integer wei
as decimal strings. Addresses are lowercase `0x` hex. Every read the
frontend displays must use the `latest-final` variant and must show
"Unconfirmed" until a FINALIZED readback arrives — never display a
verdict, payout, or gallery seal from a non-final read.

## States

`DRAWING` -> `GUESSING` -> `JUDGED` -> `SETTLED`.
`trigger_timeout_auto_settle` moves `DRAWING`/`GUESSING` straight to
`SETTLED`. `SETTLED` is frozen forever.

## Write methods

### `start_round(round_id, concept_commit, category_hint, drawing_duration_min, guessing_duration_min)` — payable

- `round_id`: string, 1–48 chars, must not exist yet (a duplicate is
  recorded in the witness log, the value is credited back, and the call
  returns `accepted:false`).
- `concept_commit`: 64-char lowercase hex =
  `SHA256(salt + "|" + normalized_concept)`. Locked before any guess.
- `category_hint`: string, max 40 chars (display only).
- `drawing_duration_min`, `guessing_duration_min`: integers, 1–1440.
- Value: drawer stake, minimum 1 GEN (standard: 10 GEN).
- Previous round must be `SETTLED`. If it is `JUDGED` and its
  challenge window has expired, it is settled inside this call
  (piggyback; the return carries `piggyback_settled_round` and
  `piggyback_settlement`). If the window is still open, or the previous
  round is `DRAWING`/`GUESSING`, the call is rejected and the value is
  credited back.
- Success return: `{"accepted":true,"round_id","drawer","status":"DRAWING",
  "drawing_deadline_minute":"<utc minute>","drawer_stake_wei":"...",
  "piggyback_settled_round":""|<id>}`.
- Failure return (never a raise while holding value):
  `{"accepted":false,"reason":"<code>","refunded_credit_wei":"..."}`.
  Reasons: `duplicate_round_id`, `round_id_invalid`,
  `concept_commit_invalid`, `category_hint_invalid`,
  `drawing_duration_invalid`, `guessing_duration_invalid`,
  `drawer_stake_too_small`, `previous_round_challenge_open`,
  `previous_round_not_settled`, `time_unavailable`.

### `submit_drawing(round_id, image_b64, image_sha256)` — non-payable

- Drawer only, `DRAWING` only. `image_b64`: base64 PNG, max 200,000
  chars, must decode to PNG magic bytes. `image_sha256`: 64-char
  lowercase hex, stored as the lock WITHOUT verification at submit
  time (verification happens at reveal — this is what makes the
  challenge flip path reachable).
- A second call on a non-`DRAWING` round does NOT raise: it appends a
  `second_submit_drawing` entry to the witness log and returns
  `{"accepted":false,"reason":"round_not_drawing","conflict_recorded":true}`.
  State is never overwritten.
- Any value sent with this call is credited back and the call returns
  `accepted:false` / `value_not_accepted`.
- Success return: `{"accepted":true,"round_id","status":"GUESSING",
  "image_byte_len":<int>,"image_sha256_locked":"...",
  "reveal_deadline_minute":"<utc minute>"}`.

### `submit_guess(round_id, guess_text)` — payable

- Any player except the drawer, `GUESSING` only, max 1 valid guess per
  guesser per round. Value: guesser stake, minimum 0.1 GEN (standard:
  5 GEN). Guesses are stored normalized (trim, lowercase, collapse
  whitespace, keep `[a-z0-9 ]`) with a strictly increasing `seq_no`.
- Failure return (value credited back): reasons `round_not_found`,
  `round_not_guessing`, `drawer_self_guess`, `guesser_stake_too_small`,
  `duplicate_guess`, `guess_invalid`.
- Success return: `{"accepted":true,"round_id","guesser","seq_no":<int>,
  "normalized_guess":"...","stake_wei":"..."}`.

### `reveal_and_auto_settle(round_id, revealed_concept, drawer_salt)` — non-payable

- Drawer only, `GUESSING` only. Steps, in order:
  1. Deterministic preimage check
     `SHA256(salt + "|" + normalized concept) == concept_commit`, else
     the call raises `COMMIT_MISMATCH` before any write (round stays
     `GUESSING`).
  2. Deterministic guess marking (`GUESS_CORRECT` / `GUESS_WRONG`);
     fastest = smallest `seq_no` among correct (or `""`).
  3. Deterministic hash gate: re-hash the STORED bytes; on mismatch the
     round becomes `JUDGED` with `DRAWING_MISS` /
     `IMAGE_HASH_MISMATCH` and no LLM call runs.
  4. Visual jury on the stored bytes (narrow fixed-answer JSON:
     `has_written_text_cheat` YES/NO, `visual_depiction_tier`
     MATCHES/WEAK/MISS). Cheat YES forces `DRAWING_MISS` /
     `TEXT_CHEAT_DETECTED`. A failed jury (all input forms failed or
     unparseable output) becomes `DRAWING_MISS` /
     `INVALID_JURY_OUTPUT`, never a default pass.
- Sets `challenge_deadline_minute` = reveal minute + 10. Status `JUDGED`.
- A re-reveal on a `SETTLED` round does NOT raise: it appends a
  `re_reveal_settled` witness entry and returns
  `{"accepted":false,"reason":"round_settled","conflict_recorded":true}`.
- Success return: `{"accepted":true,"round_id","status":"JUDGED",
  "revealed_concept","has_written_text_cheat":"YES"|"NO"|"",
  "visual_depiction_tier":"MATCHES"|"WEAK"|"MISS"|"",
  "drawing_verdict":"DRAWING_MATCHES"|"DRAWING_WEAK"|"DRAWING_MISS",
  "reason_code":"VISUAL_MATCH_CONFIRMED"|"VISUAL_WEAK_PARTIAL"|
  "VISUAL_MISS"|"TEXT_CHEAT_DETECTED"|"IMAGE_HASH_MISMATCH"|
  "INVALID_JURY_OUTPUT","correct_guessers":[...],"fastest_guesser":""|<addr>,
  "challenge_deadline_minute":"...","payouts_pending_settle":true}`.
  Payouts are NOT final at `JUDGED` — they are computed at settle time
  from the rollover pool then.

### `challenge(round_id, corrected_hash)` — payable

- `JUDGED` only, inside the challenge window (current UTC minute <=
  `challenge_deadline_minute`). Value: challenge deposit, minimum 1 GEN
  (standard: 5 GEN). `corrected_hash`: 64-char lowercase hex.
- One challenge per round; a second is allowed only if the first one
  flipped the verdict (a third is never allowed). Otherwise the call is
  rejected and the deposit is credited back.
- The contract re-hashes the STORED bytes:
  - (a) recomputed != `corrected_hash` → challenge fails:
    `CHALLENGE_FAILED_WRONG_HASH`, deposit forfeits to the rollover
    pool, verdict unchanged.
  - (b) recomputed == `corrected_hash` and it differs from the locked
    hash → the lock was wrong: the lock is corrected, the jury re-runs
    on the stored bytes, verdict/reason are updated. If the verdict
    enum differs → `CHALLENGE_SUCCEEDED_FLIP`, deposit refunded;
    if identical → `CHALLENGE_FAILED_SAME_VERDICT`, deposit forfeits.
  - (c) `corrected_hash` == locked hash → second-opinion jury re-run;
    the verdict flips only if the (tier, cheat) pair differs
    (`CHALLENGE_SUCCEEDED_FLIP`, deposit refunded), else
    `CHALLENGE_FAILED_SAME_VERDICT`, deposit forfeits.
  - If the jury re-run itself fails, the deposit is refunded, nothing
    changes, and the challenge slot is NOT consumed (it can be retried
    inside the window): `CHALLENGE_JURY_FAILED_REFUNDED`.
- Every challenge is recorded in the round's `challenges` list and in
  the global witness log. The jury band itself is never re-litigated
  on any other basis.
- Success return: `{"accepted":true,"round_id",
  "challenge_outcome":"CHALLENGE_SUCCEEDED_FLIP"|
  "CHALLENGE_FAILED_WRONG_HASH"|"CHALLENGE_FAILED_SAME_VERDICT"|
  "CHALLENGE_JURY_FAILED_REFUNDED","deposit":"refunded"|
  "forfeited_to_rollover","verdict":"...","reason_code":"...",
  "image_sha256":"..."}`.
- Failure return (deposit credited back): reasons `round_not_found`,
  `round_not_judged`, `corrected_hash_invalid`,
  `challenge_deposit_too_small`, `challenge_not_allowed`,
  `challenge_window_closed`, `time_unavailable`.

### `settle(round_id)` — non-payable, callable by anyone

- `JUDGED` only, and only after the challenge window has expired
  (current UTC minute > `challenge_deadline_minute`); otherwise raises
  `challenge_window_open`. Computes the allocation, credits balances
  (pull-payment), updates scores, archives the gallery entry, status
  `SETTLED`.
- Success return (the full decision vector):
  `{"accepted":true,"method":"settle","round_id","drawing_verdict",
  "reason_code","correct_guessers":[...],"fastest_guesser":"",
  "total_pot_wei":"...","drawer_payout_wei":"...",
  "guesser_payouts":{<addr>:"..."},"next_rollover_pool_wei":"...",
  "status":"SETTLED"}`.
- Allocation (integer math, remainder rolls over):
  `total_pot = rollover + drawer stake + sum(guesser stakes)`.
  MATCHES + correct >= 1: drawer 50%, correct guessers split 50%
  equally. MATCHES + 0 correct: all 0. WEAK + correct >= 1: drawer
  25%, correct guessers split 25% equally. WEAK + 0 correct / MISS:
  all 0. Scores: MATCHES drawer +100, fastest +100, other correct
  +30; WEAK drawer +40, each correct +50; otherwise +0.

### `trigger_timeout_auto_settle(round_id)` — non-payable

- Any round participant (drawer or a guesser), `DRAWING` or `GUESSING`
  only, current UTC minute past the applicable deadline; otherwise
  raises `drawing_deadline_not_passed` / `reveal_deadline_not_passed`
  (or `not_a_participant` / `round_not_timeout_eligible`). No LLM.
- `DRAWING`: `DRAWING_MISS` / `DRAWER_DRAWING_TIMEOUT`, drawer stake
  -> rollover, status `SETTLED`.
- `GUESSING`: `DRAWING_MISS` / `DRAWER_REVEAL_TIMEOUT`, drawer stake
  -> rollover, all guesser stakes credited back in full, status
  `SETTLED`.
- Success return: `{"accepted":true,"round_id","status":"SETTLED",
  "drawing_verdict":"DRAWING_MISS","reason_code":"...",
  "timeout_forfeited_wei":"...","guesser_refunds_wei":{<addr>:"..."},
  "next_rollover_pool_wei":"..."}`.

### `withdraw()` — non-payable, pull-payment

- Pays out the caller's credited balance. Zero balance raises
  `no_credit_to_withdraw` and moves nothing. The credit is zeroed
  before the transfer. GEN sent with the call is credited back first.
- Success return: `{"accepted":true,"address":"...",
  "withdrawn_wei":"...","total_withdrawn_wei":"..."}`.

## View methods (all return canonical JSON strings)

### `get_protocol()` -> `"sketchverdict-1"`

### `get_round(round_id)` -> full round object, or `""` if unknown

```json
{"round_id":"R1","drawer":"0x...","concept_commit":"<64-hex>",
 "category_hint":"...","status":"DRAWING|GUESSING|JUDGED|SETTLED",
 "started_minute":"...","drawing_duration_min":2,"guessing_duration_min":5,
 "drawing_deadline_minute":"...","reveal_deadline_minute":"...",
 "challenge_deadline_minute":"...","drawer_stake_wei":"...",
 "image_b64":"<base64 PNG, present after submit_drawing>",
 "image_sha256":"<locked hash>","image_byte_len":4602,
 "guesses":[{"address":"0x...","seq_no":1,"normalized_guess":"car",
             "verdict":"GUESS_WRONG"|"GUESS_CORRECT"|"","stake_wei":"..."}],
 "next_seq_no":4,"revealed_concept":"bicycle",
 "has_written_text_cheat":"NO"|"YES"|"",
 "visual_depiction_tier":"MATCHES"|"WEAK"|"MISS"|"",
 "drawing_verdict":"DRAWING_MATCHES"|"DRAWING_WEAK"|"DRAWING_MISS"|"",
 "reason_code":"VISUAL_MATCH_CONFIRMED"|"VISUAL_WEAK_PARTIAL"|
   "VISUAL_MISS"|"TEXT_CHEAT_DETECTED"|"IMAGE_HASH_MISMATCH"|
   "INVALID_JURY_OUTPUT"|"DRAWER_DRAWING_TIMEOUT"|
   "DRAWER_REVEAL_TIMEOUT"|"",
 "correct_guessers":["0x..."],"fastest_guesser":"0x..."|"",
 "drawer_payout_wei":"...","guesser_payouts":{"0x...":"..."},
 "total_pot_wei":"...","next_rollover_pool_wei":"..."|"",
 "challenges":[{"round_id":"R1","challenger":"0x...","corrected_hash":"...",
   "recomputed_hash":"...","locked_hash_before":"...","old_verdict":"...",
   "old_reason_code":"...","new_verdict":"...","new_reason_code":"...",
   "outcome":"CHALLENGE_SUCCEEDED_FLIP"|"CHALLENGE_FAILED_WRONG_HASH"|
   "CHALLENGE_FAILED_SAME_VERDICT"|"CHALLENGE_JURY_FAILED_REFUNDED",
   "deposit":"refunded"|"forfeited_to_rollover"}],
 "challenge_count":0,"last_challenge_flipped":false,
 "timeout_forfeited_wei":"0","timeout_refunded_wei":"0","settled_by":"0x..."|""}
```

Note: `fastest_guesser` is `""` when nobody guessed correctly.
`guesser_payouts` lists every correct guesser, including a `"0"` entry
when the verdict pays nothing (e.g. a text-cheat MISS with a correct
accomplice guess).

### `get_room_state()` -> room totals

```json
{"rollover_pool_wei":"...","current_round_id":"R9","round_count":9,
 "total_received_wei":"...","total_withdrawn_wei":"...",
 "contract_balance_wei":"..."}
```

### `get_gallery()` -> settled rounds (no image bytes — call `get_round` for the image)

```json
{"entries":[{"round_id":"R1","drawer":"0x...","revealed_concept":"bicycle",
 "drawing_verdict":"DRAWING_MATCHES","reason_code":"VISUAL_MATCH_CONFIRMED",
 "has_written_text_cheat":"NO","visual_depiction_tier":"MATCHES",
 "image_sha256":"...","fastest_guesser":"0x...","drawer_payout_wei":"...",
 "guesser_payouts":{"0x...":"..."},"total_pot_wei":"..."}]}
```

### `get_player_stats(address)` -> score + withdrawable balance

```json
{"address":"0x...","score":440,"balance_wei":"...","rounds_drawn":9,
 "rounds_guessed":0}
```

### `get_witness_log()` -> conflict + challenge + timeout entries

```json
{"entries":[{"type":"conflict"|"challenge"|"timeout",
 "kind":"duplicate_round_id"|"second_submit_drawing"|"re_reveal_settled",
 "round_id":"R1","sender":"0x...","existing_status":"GUESSING",
 "existing_image_sha256":"...","challenger":"0x...",
 "outcome":"CHALLENGE_SUCCEEDED_FLIP","reason":"DRAWER_DRAWING_TIMEOUT",
 "triggered_by":"0x..."}]}
```

### `get_accounting()` -> money invariant (live proof)

```json
{"total_received_wei":"...","total_withdrawn_wei":"...",
 "credits_outstanding_wei":"...","rollover_pool_wei":"...",
 "locked_stakes_wei":"...","contract_balance_wei":"...",
 "invariant_ok":true,"balance_matches_accounted":true}
```

Invariant: `total_received == total_withdrawn + credits_outstanding +
rollover + locked_stakes`, and `contract_balance == total_received -
total_withdrawn`.

## Error model

- Payable writes never raise while holding value: a rejected payable
  call returns `accepted:false` with the full value credited back as a
  withdrawable balance. The on-chain proof of a rejection is the
  credit increase + unchanged round state, readable via
  `get_player_stats` / `get_round`.
- Non-payable writes raise `gl.vm.UserError` with a short code
  (`COMMIT_MISMATCH`, `only_drawer_reveals`, `challenge_window_open`,
  `no_credit_to_withdraw`, ...) before any write when they cannot
  proceed; the round stays in its previous state and the transaction
  can be retried.
- Conflicting re-submissions (duplicate round id, second drawing,
  re-reveal on a settled round) never raise and never overwrite state:
  they append to the witness log and return `accepted:false` with
  `conflict_recorded:true`.
