# SketchVerdict — 绘画猜谜派对游戏 / Draw-and-Guess Party Game

> Live site: (frontend coming — the contract and evidence below are live)
>
> Contract (Stable Studionet): [`0x56C85764c91F439185f446e019BB70A877458b54`](https://explorer-studio.genlayer.com/address/0x56C85764c91F439185f446e019BB70A877458b54)
>
> Source SHA-256: `0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47`
> (byte-identical to `contracts/sketchverdict.py` — see `scripts/verify.mjs`)

SketchVerdict is a multiplayer draw-and-guess party game on GenLayer.
One player draws a secret concept; the others guess it. Consensus
decides how well the drawing depicts the concept, deterministic code
decides who guessed right and who was fastest, and the round's prize
pool is split accordingly — with the remainder rolling over to the
next round.

SketchVerdict 是一款多人绘画猜谜派对游戏：一名玩家画出秘密概念，
其他玩家猜测。共识裁决画作与概念的匹配程度，确定性代码判定谁猜
中、谁最快，轮次奖池按规则分配，剩余部分滚存至下一轮。

## How it works / 玩法

1. **Start** — the drawer locks a secret concept as a hash commitment
   (`SHA256(salt + "|" + concept)`) and stakes 10 GEN. Nobody — not
   even the drawer — can change the concept after seeing the guesses.
   画者锁定秘密概念的哈希承诺并质押 10 GEN，看到猜测后无法再改概念。
2. **Draw** — the drawer submits the drawing. Its PNG bytes are stored
   on-chain (base64) with a SHA-256 hash lock. No URL fetching anywhere:
   validators judge the bytes stored on-chain.
   画者提交画作，PNG 字节以 base64 存入链上并锁定 SHA-256 哈希。
3. **Guess** — each other player stakes 5 GEN and submits one guess.
   Guesses are recorded on-chain in arrival order.
   其他玩家各质押 5 GEN 提交一次猜测，按链上到达顺序编号。
4. **Reveal** — the drawer reveals the concept and salt. Code checks the
   commitment, marks every guess right or wrong, re-hashes the stored
   drawing, and then a narrow visual jury (fixed-answer JSON only)
   grades the drawing: MATCHES / WEAK / MISS, with a text-cheat veto.
   画者揭示概念与盐：代码核验承诺、判定猜测正误、重算画作哈希，
   再由视觉陪审团给出 MATCHES / WEAK / MISS 粗档（写字作弊一票否决）。
5. **Challenge** — for 10 minutes after the reveal, anyone may stake
   5 GEN to challenge with a corrected hash. If the stored lock was
   wrong, it is corrected, the jury re-runs, and a flipped verdict
   refunds the deposit. The jury band itself is never re-litigated.
   揭示后 10 分钟内，任何人可质押 5 GEN 用修正后的哈希发起挑战；
   若原锁定哈希确有错误，锁会被纠正并重跑陪审团，翻盘则退还押金。
6. **Settle** — after the challenge window, anyone can settle. The pool
   splits by the verdict; the rest rolls over. Winnings are credited
   and pulled with `withdraw()`.
   挑战窗口结束后任何人可结算，奖池按裁决分配，余下滚存；奖金记账后
   由玩家自行 `withdraw()` 提取。

## Prize split / 奖金分配

`total_pot = rollover + drawer stake + sum(guesser stakes)` (integer wei)

| Drawing verdict | Correct guessers | Drawer | Correct guessers | Rollover |
|---|---|---|---|---|
| MATCHES | >= 1 | 50% | split 50% equally | remainder |
| MATCHES | 0 | 0 | 0 | 100% |
| WEAK | >= 1 | 25% | split 25% equally | ~50% + remainder |
| WEAK | 0 | 0 | 0 | 100% |
| MISS | any | 0 | 0 | 100% |

Scores: MATCHES drawer +100, fastest guesser +100, other correct
+30; WEAK drawer +40, each correct +50. A drawing that just writes
the concept word is a MISS — even a correct accomplice guess wins
nothing, so cheating cannot pay.

## Why the verdict can be trusted / 为什么裁决可信

- **Commit-reveal**: the concept is hash-locked before any guess.
  概念在猜测前已哈希锁定。
- **Stored-bytes jury**: the drawing's bytes live on-chain; validators
  judge those bytes, never a URL that could change or disappear.
  画作字节存于链上，验证者裁决链上字节，不依赖任何 URL。
- **Deterministic gates first**: commitment check, guess marking,
  image re-hash — all code, no LLM. The LLM answers one fixed
  two-field question and can only award a coarse tier, never money.
  确定性门控在先（承诺、猜测、哈希全由代码裁决），LLM 只回答一道
  固定两字段问题，只能给出粗档，不能直接决定钱。
- **Fail-closed**: a hash mismatch, a text cheat, or an unparseable
  jury answer all end in MISS with the whole pool rolling over.
  哈希不符、写字作弊、陪审团输出无效，全部判 MISS、奖池全额滚存。
- **Challenge**: a wrong hash lock can be corrected on-chain and the
  verdict flipped, with the deposit refunded on success.
  错误的哈希锁可链上纠正并翻盘，成功退还挑战押金。
- **Money invariant**: received GEN == withdrawn + credited balances
  + rollover + locked stakes of open rounds, checked live by
  `get_accounting`. Settlement never pushes GEN; players pull with
  `withdraw()`. 资金守恒可实时核验；结算只记账，提款由玩家自行提取。

## Evidence / 证据

- `evidence/EXPECTED.md` — every case pre-registered before it ran.
  所有案例均在运行前预登记。
- `evidence/evidence.json` — every transaction hash, receipt
  (FINALIZED), and latest-final readback. 全部交易哈希、收据与读回。
- `evidence/EVIDENCE.md` — narrative: what happened per case,
  expected vs actual. 逐案例叙述与预期对照。
- `docs/REVIEWER.md` — claims, anchors, per-tx explorer links,
  adversarial table, and what the evidence does not prove.
- `scripts/verify.mjs` — one command: re-reads the deployed code
  (byte parity), re-reads all evidence txs live, checks the money
  invariant. Run: `node scripts/verify.mjs`.
- `tests/` — 24 local unit tests (codecs, allocation matrix, challenge
  logic, timeouts, full flows). Run: `npm test`.

## Frontend API

See `docs/API.md` — exact view method names and JSON shapes
(`get_round`, `get_room_state`, `get_gallery`, `get_player_stats`,
`get_witness_log`, `get_accounting`). The frontend displays values
only from FINALIZED readbacks.

## Tech / 技术

- GenLayer Intelligent Contract (Python), Stable Studionet, Chain ID 61999.
- Pure-Python SHA-256 + base64 (no stdlib assumption in GenVM).
- UTC-minute time anchor: timeapi.io (primary) / worldtimeapi.org
  (backup), exact agreement.
- Vision jury via `gl.nondet.exec_prompt` with `images=[bytes]`
  (base64-in-prompt fallback). Feasibility was proven on-chain by the
  probe contract
  [`0x0f5169aD1BE8497fC0f302df461D9fE2AD72A656`](https://explorer-studio.genlayer.com/address/0x0f5169aD1BE8497fC0f302df461D9fE2AD72A656):
  the vision LLM judges bytes stored on-chain (concept "crank" →
  MATCHES, "bicycle" → MISS on the same image); URL image fetch in
  consensus fails, so this contract fetches no URLs.
