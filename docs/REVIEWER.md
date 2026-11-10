# SketchVerdict — Reviewer Pack

A drawing/guessing party game on GenLayer (P12). Players stake GEN,
one player draws a concept, others guess it, and a vision jury in
consensus judges the drawing from the bytes stored on-chain. The
jury's verdict — not any single player — decides who gets paid.

## The contract

- Address: [`0x56C85764c91F439185f446e019BB70A877458b54`](https://explorer-studio.genlayer.com/address/0x56C85764c91F439185f446e019BB70A877458b54)
- Network: GenLayer Stable Studionet only (Chain ID 61999)
- Source: `contracts/sketchverdict.py`
- Source SHA-256: `0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47`
- Deploy tx: [`0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce`](https://explorer-studio.genlayer.com/tx/0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce)
- Status: deployed, evidence complete, 10/10 rounds SETTLED
- Verify it yourself: `node scripts/verify.mjs` — **135 passed, 0 failed**
  (re-reads the deployed code for byte parity, re-reads all 64
  evidence transactions live, checks the money invariant and final
  state). Local tests: `tests/test_sketchverdict.py` — 24 passed.

## Claims

1. **The vision jury sees the drawing.** Drawings are stored on-chain
   as base64 PNG; validators judge from those stored bytes via
   `gl.nondet.exec_prompt` with `images=[bytes]`. Anchor: the probe
   contract
   [`0x0f5169aD1BE8497fC0f302df461D9fE2AD72A656`](https://explorer-studio.genlayer.com/address/0x0f5169aD1BE8497fC0f302df461D9fE2AD72A656)
   proved this first (concept "crank" MATCHES, "bicycle" MISS on the
   same image, 3/5 agree); this contract reuses the probe's jury
   code and demonstrates it across 10 rounds.
2. **Bad evidence fails on-chain.** A text-cheat drawing (the written
   word VOLCANO) is MISS / TEXT_CHEAT_DETECTED even with a correct
   accomplice guess (R3); an unrelated image is MISS / VISUAL_MISS
   (R4); a wrong locked hash is MISS / IMAGE_HASH_MISMATCH with no
   LLM call at all (R5 reveal, deterministic hash gate).
3. **A wrong hash lock can be corrected by challenge.** R5 locked a
   deliberately wrong hash; a challenge with the true hash flipped
   the verdict MISS → MATCHES, refunded the deposit, and the round
   settled 50/50 (drawer 27.5 GEN, guesser 27.5 GEN).
4. **A wrong challenge loses its deposit.** R6's challenge with a
   wrong hash forfeited 5 GEN to the rollover; a second challenge
   after a non-flipping first challenge is refused and refunded.
5. **Timeouts settle without a jury.** R7 (no drawing) and R8 (no
   reveal) settled directly as MISS; the drawer stake went to the
   rollover and R8's guessers were refunded in full.
6. **Money is exact.** 196,000,000,000,000,000,001 wei received;
   162,250,000,000,000,000,000 withdrawn; 33,750,000,000,000,000,000
   still credited (A 17.5 + C 6.25 + challenger 10 GEN); 1 wei
   rollover; 0 locked; invariant holds. The odd-wei pot (R9) leaves
   exactly its 1-wei remainder in the rollover.
7. **Conflicts never overwrite state.** A second drawing, a
   re-reveal, and a duplicate round id are all recorded in the
   witness log and leave the stored state untouched (R10-5/6/7).
8. **Rejected calls refund the sender.** A duplicate guess, a
   drawer self-guess, and a duplicate round start all return
   `accepted:false` and credit the sent value straight back
   (R10-1/2/7). A zero-balance withdraw raises and moves nothing
   (R11).

## How the money works

`total_pot = previous rollover + drawer stake + guesser stakes`
(integer math; every remainder rolls over).

| Verdict | Drawer | Correct guessers | Rollover |
|---|---|---|---|
| MATCHES, ≥ 1 correct | 50% | split the other 50% equally (fastest takes no extra money, only score) | remainder |
| MATCHES, 0 correct | 0 | 0 | 100% |
| WEAK, ≥ 1 correct | 25% | split 25% equally | ~50% + remainders |
| WEAK, 0 correct / MISS | 0 | 0 | 100% |

Scores: MATCHES drawer +100, fastest correct +100, other correct
+30; WEAK drawer +40, each correct +50; everything else +0.
Payouts are pull-payment credits (`withdraw`); nothing is pushed.

## Evidence transactions (all 64, FINALIZED, re-read live)

Every hash links to the Stable Studionet explorer. Full receipts and
latest-final readbacks are in `evidence/evidence.json`; the narrative
is in `evidence/EVIDENCE.md`; expectations were pre-registered in
`evidence/EXPECTED.md`.

| Case | Transaction | Sender | Value | Consensus |
|---|---|---|---|---|
| deploy | [0x0cddebb7…](https://explorer-studio.genlayer.com/tx/0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R1:start | [0x35af00e5…](https://explorer-studio.genlayer.com/tx/0x35af00e554a0748e8f0072dc5e577e7ab6f5eb1c1edc8492d2f2dc1741715292) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R1:draw | [0xbbacc50d…](https://explorer-studio.genlayer.com/tx/0xbbacc50d938dc2fc5585b3c729a886a24a2ea1ab6f6d30ca9b8b1e3dc6e49f62) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R10-2:self-guess | [0x5f68460d…](https://explorer-studio.genlayer.com/tx/0x5f68460d8e1795264caca10e5deee691550e778f702c91f4c76827004d7c8fc5) | drawer | 5 GEN | FINALIZED, 3/5 AGREE |
| R1:guess-A-car | [0xf349706d…](https://explorer-studio.genlayer.com/tx/0xf349706d11ff17ea99d639fffddb8ad41384948cac0fdd0fb003e56da4fb1e5c) | a | 5 GEN | FINALIZED, 4/5 AGREE |
| R1:guess-B-bicycle | [0x5efa50cd…](https://explorer-studio.genlayer.com/tx/0x5efa50cdd51bd92163bca8ce35cdb4bdd3ab75c2bec3959aa31b4887732a1a5f) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R1:guess-C-bicycle | [0x94e5991b…](https://explorer-studio.genlayer.com/tx/0x94e5991bd40298cb4aae0c5d48c2cc68b2d666ab7633ecb588fdc5be5a597cda) | c | 5 GEN | FINALIZED, 4/5 AGREE |
| R10-1:dup-guess | [0xe8cb2790…](https://explorer-studio.genlayer.com/tx/0xe8cb27901415d7ef3004bd6eedea1e4a01267552ad9e647620a5f9fd6ec9a5fa) | a | 5 GEN | FINALIZED, 3/5 AGREE |
| R10-5:second-drawing | [0xa76ef65b…](https://explorer-studio.genlayer.com/tx/0xa76ef65b1c4d4dcbeb8d53d5c8be6d957c917e57a4240743449ebb1ada263ee3) | drawer | 0 | FINALIZED, 4/5 AGREE |
| R10-3:non-drawer-reveal | [0x3a40d67c…](https://explorer-studio.genlayer.com/tx/0x3a40d67cd5ac807b6ce10aac463d4f4f9c83bfd102ebe0c8fd413881f153e7a9) | a | 0 | FINALIZED, raises (no SUCCESS leader) |
| R10-4:wrong-salt | [0x810d2e95…](https://explorer-studio.genlayer.com/tx/0x810d2e95143c93a5f39d20c25c2507c825501f66fbb906c26a8bc3e61b994be2) | drawer | 0 | FINALIZED, raises (no SUCCESS leader) |
| R1:reveal | [0xa438046d…](https://explorer-studio.genlayer.com/tx/0xa438046d56baf0dd0a314b9ba54492f7706bf71c3754d8a5d26eacf9cde1cb33) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R1:settle | [0x65d823b0…](https://explorer-studio.genlayer.com/tx/0x65d823b0c8343d90ea1b08e85a304308721abe9432e56e0d3cb113351196f540) | a | 0 | FINALIZED, 3/5 AGREE |
| R10-6:re-reveal-settled | [0x2fd41a7a…](https://explorer-studio.genlayer.com/tx/0x2fd41a7ad2569edb3d655934cd2324f943e7ae629146f6c41aa15b672f6adda0) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R10-7:dup-round-id | [0x19ea8e7f…](https://explorer-studio.genlayer.com/tx/0x19ea8e7f6398d4165c468f3cb571cfd8884824471262a54a4f3e2ffef86fcc53) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R2:start | [0x0b41e122…](https://explorer-studio.genlayer.com/tx/0x0b41e122d34d800950dac591a044c6c87730cf259eb2ac859a6bae6f9bf36e15) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R2:draw | [0x259102cd…](https://explorer-studio.genlayer.com/tx/0x259102cdc3adfd69c089d4d721e022d6df29db41e4db597d410c522b5644c7c1) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R2:guess-A | [0x69ceeb70…](https://explorer-studio.genlayer.com/tx/0x69ceeb70b6d4bc49154eb13a32cc37aa1783e378f562b54e5111f6bcacdb9b51) | a | 5 GEN | FINALIZED, 3/5 AGREE |
| R2:guess-B | [0xd313072c…](https://explorer-studio.genlayer.com/tx/0xd313072c62520b5b357f5bae6134c314950f6a09c356a557716b12f29b8ef92e) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R2:reveal | [0x3a5b0c29…](https://explorer-studio.genlayer.com/tx/0x3a5b0c2995a6ba76620f8c2a5bf6f741f77fe135226d8f8ea50ca043a090d5f7) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R2:settle | [0x191ccfe7…](https://explorer-studio.genlayer.com/tx/0x191ccfe7bdd93454501ab215d7965dcb49344e67719204082ec392768c06a51a) | a | 0 | FINALIZED, 3/5 AGREE |
| R2b:start | [0xc1e9d2ea…](https://explorer-studio.genlayer.com/tx/0xc1e9d2ea7e0a6738e7491a6e46a35b5da7bac981857524839a1b592e1945778c) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R2b:draw | [0x84cb45a8…](https://explorer-studio.genlayer.com/tx/0x84cb45a81e66175938c2135fb7b8b79d14146adde71d49c1b7dcf1673d472856) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R2b:guess-A | [0x8e0f2ac6…](https://explorer-studio.genlayer.com/tx/0x8e0f2ac6beb99d68f1bd9ee18c25d080f36d60b07c29beebe4f440c7024a3209) | a | 5 GEN | FINALIZED, 3/5 AGREE |
| R2b:guess-B | [0xc6c5dcc2…](https://explorer-studio.genlayer.com/tx/0xc6c5dcc2b88649144abf1041890e7f2537502f7cc856e0df3d1d3b0e6e368163) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R2b:reveal | [0x1a5ea8fd…](https://explorer-studio.genlayer.com/tx/0x1a5ea8fd80b9d39fe42e05168c5b288164ced2808e42eaef99eaa63de8f894d4) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R2b:settle | [0xfc95248c…](https://explorer-studio.genlayer.com/tx/0xfc95248c4477f03e59deba255a9d3628c8580b8fa98f27ca2c3927d7a3c387dc) | a | 0 | FINALIZED, 3/5 AGREE |
| R3:start | [0x56fb55b7…](https://explorer-studio.genlayer.com/tx/0x56fb55b772dcef0251779c58a344706b67d8755074dd24eaf0e6bbbd1b1774c3) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R3:draw | [0x478d103e…](https://explorer-studio.genlayer.com/tx/0x478d103edcdb9f9f3d0bb7eeea1eb2e999633aeb34b7bc5626a1308327ff790e) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R3:guess-A | [0xaf51b21a…](https://explorer-studio.genlayer.com/tx/0xaf51b21af1296616162660ab10c92984ea7537a7f8a4f5be547a0ba0470e6589) | a | 5 GEN | FINALIZED, 5/5 AGREE |
| R3:reveal | [0x61929e4e…](https://explorer-studio.genlayer.com/tx/0x61929e4e1f5b36e3f49939b7e20d507d743222d2d5954cff250cd0e3361316cc) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R4:start | [0x27b797c4…](https://explorer-studio.genlayer.com/tx/0x27b797c42dd1fb8fcb089888873befc6ee0b3055b6d80bd4827eec7a5f81dd7a) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R4:draw | [0xca92c68a…](https://explorer-studio.genlayer.com/tx/0xca92c68ad9eec347540d5cff4a4999cdbecdac55f118a291200a409e0174fce8) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R4:guess-A | [0x925612a2…](https://explorer-studio.genlayer.com/tx/0x925612a2034ed695fba6f3e4af2332bc32cf21e02b15e06caa6b2a0b873de5a9) | a | 5 GEN | FINALIZED, 3/5 AGREE |
| R4:reveal | [0x7bb99293…](https://explorer-studio.genlayer.com/tx/0x7bb992935f70ef9f118f7d86d8a0feb9e803af884ee0ab1ceb52633fb0d1c3e3) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R4:settle | [0x5b62e17a…](https://explorer-studio.genlayer.com/tx/0x5b62e17aefc2f52c537c62a32b023a3effd410b2966d0dd9dcbc01439d25c9ce) | a | 0 | FINALIZED, 3/5 AGREE |
| R5:start | [0x27ee81dc…](https://explorer-studio.genlayer.com/tx/0x27ee81dcebc5b5ae28b436093d4442660ff1e47749f2d3ee6c175b478127a42c) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R5:draw-wrong-hash | [0x802dcfa6…](https://explorer-studio.genlayer.com/tx/0x802dcfa681288eb7a71cac3901ae73161c80a1274cd8ccf5b0427870c0eb1a04) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R5:guess-B | [0x93c5032a…](https://explorer-studio.genlayer.com/tx/0x93c5032a60ad610ad206808e16437cfbcf4bdb8348924e2ea329b29a9b15ad6b) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R5:reveal | [0x07208321…](https://explorer-studio.genlayer.com/tx/0x07208321a09f25977e641e6282a3ac9220d584aa2532573dbdf9cd18946a1542) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R5:challenge-true-hash | [0xa959ee57…](https://explorer-studio.genlayer.com/tx/0xa959ee576b2ba5982104063f8e2eb6c57bb51ec7a4ea0dc1c04cabc2d6c21619) | challenger | 5 GEN | FINALIZED, 3/5 AGREE |
| R5:settle | [0x3083f935…](https://explorer-studio.genlayer.com/tx/0x3083f935663f01366f471fa3054177b4f556a8341addf2d97e1a38ebc26dc234) | a | 0 | FINALIZED, 3/5 AGREE |
| R6:start | [0x56ba145b…](https://explorer-studio.genlayer.com/tx/0x56ba145b10671d9a2361d4079ac488e97ade7677eeef4f55234a2287e95687a2) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R6:draw | [0x6283d42b…](https://explorer-studio.genlayer.com/tx/0x6283d42b589d1d37279b67e8c96667b3438439f7c6c3ab6bda0015c2030dd83a) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R6:guess-B | [0xcdd00c11…](https://explorer-studio.genlayer.com/tx/0xcdd00c11d599e434c401f30e3989036a1ac4001daab03ab2e466bfc8fe429321) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R6:reveal | [0xa7a24a7a…](https://explorer-studio.genlayer.com/tx/0xa7a24a7a0775102ed5cfa3a13966118fd96e3b12b370d3cb206a1b83cfbe0fb3) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R6:challenge-wrong-hash | [0xd22adcce…](https://explorer-studio.genlayer.com/tx/0xd22adccec6bc6a25e67ad066affb9d991bbadf242a5e6c8d178c5bf6d329a62c) | challenger | 5 GEN | FINALIZED, 3/5 AGREE |
| R6:challenge-second-blocked | [0xfb142def…](https://explorer-studio.genlayer.com/tx/0xfb142def6875982a923a144c8f89813bababccde693d31aa5438da515b5af332) | challenger | 5 GEN | FINALIZED, 5/5 AGREE |
| R6:settle | [0xf42e7f74…](https://explorer-studio.genlayer.com/tx/0xf42e7f748d383aa6b5b5396ef05e99cd287c39a69c8d66007961f34f9d62b022) | a | 0 | FINALIZED, 3/5 AGREE |
| R7:start | [0xdaad5603…](https://explorer-studio.genlayer.com/tx/0xdaad560339793bd2e7d81cdb754f300f512468f1575ddd9404982698d8f17ed2) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R7:timeout | [0x1f191c2a…](https://explorer-studio.genlayer.com/tx/0x1f191c2aa94a5a87002bf50cd4c56d8bb066133baaec8a941a44fc00285e3e65) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R8:start | [0xa176e4eb…](https://explorer-studio.genlayer.com/tx/0xa176e4eb586304d573d73695177f558aec305f1ba2f254175c481aeab21b0f2a) | drawer | 10 GEN | FINALIZED, 3/5 AGREE |
| R8:draw | [0x84392109…](https://explorer-studio.genlayer.com/tx/0x84392109f967cf0074e062a4253c6dd31b1d1b684c4bd90cb3865f8231a3dc37) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R8:guess-A | [0x37d16c78…](https://explorer-studio.genlayer.com/tx/0x37d16c787101f939d6cff02d7c4b09aeb9217a7a4c4c8cc9cf8ee676ea3b0f00) | a | 5 GEN | FINALIZED, 3/5 AGREE |
| R8:guess-B | [0x5845fe79…](https://explorer-studio.genlayer.com/tx/0x5845fe7987ebf00a50d9d85c074081c87b702271bba7679827f37130fcf417a2) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R8:timeout | [0x7b99ee4a…](https://explorer-studio.genlayer.com/tx/0x7b99ee4a9d0f554c47dbd5451135f42274d1644000e492d22cbde9f229b8acdf) | a | 0 | FINALIZED, 3/5 AGREE |
| R9:start | [0x62f75c56…](https://explorer-studio.genlayer.com/tx/0x62f75c56c3277b9cba753ac7d19db7da9349f48ce96dadc83fe902189faa0928) | drawer | 1 GEN | FINALIZED, 3/5 AGREE |
| R9:draw | [0xfd5c1f0b…](https://explorer-studio.genlayer.com/tx/0xfd5c1f0ba0c112432134535b5cd605b0cad32309942e41913bc23c2ccbb4c88f) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R9:guess-B | [0x17858c19…](https://explorer-studio.genlayer.com/tx/0x17858c1993e337c66de374470908ae8fa774e2c8abe3a0693c3ba15c3bac4384) | b | 5 GEN | FINALIZED, 3/5 AGREE |
| R9:reveal | [0x02708317…](https://explorer-studio.genlayer.com/tx/0x02708317dfee337f59fe6fcedae623145e9e4c548efba74b896deb96d94bfa6b) | drawer | 0 | FINALIZED, 3/5 AGREE |
| R9:settle | [0xfa2e1656…](https://explorer-studio.genlayer.com/tx/0xfa2e165619c1becd0505b68980064eecb28e6f31f656a580578fa99a0f1bd717) | a | 0 | FINALIZED, 3/5 AGREE |
| R11:withdraw-drawer | [0xfbd9e669…](https://explorer-studio.genlayer.com/tx/0xfbd9e669b5b20a3c14afe2277850937cbfabb30ec2d63c555b797a444408da62) | drawer | 0 | FINALIZED, 5/5 AGREE |
| R11:withdraw-B | [0x591df1e9…](https://explorer-studio.genlayer.com/tx/0x591df1e9d616a27c7cd75a957263f30207e4143764ad9b0ab35b66317ef45b81) | b | 0 | FINALIZED, 3/5 AGREE |
| R11:withdraw-zero | [0xc73b8c76…](https://explorer-studio.genlayer.com/tx/0xc73b8c765a0616b6ac2f871e640f9c28f1d3968b1edc7167f6847d0b0c20b222) | fresh | 0 | FINALIZED, raises (no SUCCESS leader) |

## Adversarial summary

| Attack / failure | What happened on-chain |
|---|---|
| Draw the concept word instead of drawing it | R3: MISS / TEXT_CHEAT_DETECTED, 0 for everyone including the correct accomplice guess |
| Submit an unrelated image | R4: MISS / VISUAL_MISS, 100% rollover |
| Lock a wrong image hash | R5 reveal: MISS / IMAGE_HASH_MISMATCH, deterministic, no LLM call; corrected by challenge |
| Challenge with a wrong hash | R6: `CHALLENGE_FAILED_WRONG_HASH`, 5 GEN forfeited to rollover |
| Challenge twice without a flip | R6 second attempt: refused (`challenge_not_allowed`), deposit refunded |
| Drawer never draws / never reveals | R7 / R8: timeout settles as MISS, stake to rollover, guessers refunded in full (R8) |
| Duplicate guess / drawer self-guess | R10-1 / R10-2: `accepted:false`, value credited back |
| Non-drawer reveal / wrong salt | R10-3 / R10-4: call raises (`only_drawer_reveals` / `COMMIT_MISMATCH`), round unchanged |
| Second drawing / re-reveal / duplicate round id | R10-5 / R10-6 / R10-7: `accepted:false`, conflict recorded in the witness log, state untouched |
| Withdraw with zero balance | R11: raises `no_credit_to_withdraw`, nothing moves |
| Jury returns an unexpected band | R2: pre-registered WEAK, jury returned MATCHES — recorded as a deviation, not edited; the WEAK branch is shown by R2b instead |

## What this does NOT prove

- **The jury's taste is not deterministic.** The WEAK band edge is a
  judgment call: the same lighthouse concept read MATCHES in R2 and
  WEAK in R2b (vaguer drawing). The contract guarantees the money
  follows the verdict deterministically; it does not guarantee which
  band a borderline drawing lands in.
- **Drawings were synthetic.** Evidence drawings are PIL line art,
  not real player canvas input. They use the identical on-chain path
  (base64 → store → jury on stored bytes), but live drawings will be
  messier and may land in WEAK more often.
- **No wallet or mobile check.** No real OKX wallet or phone check
  was done in this phase; that belongs to the frontend build.
- **20 GEN is stranded in the live contract.** Three value-bearing
  transactions reached FINALIZED with MAJORITY_DISAGREE (consensus
  declined to execute them) yet their value stayed in the contract:
  10 GEN (R5:start attempt 1) + 5 + 5 GEN (R5:challenge attempts 1
  and 2). No credit was ever recorded for it, so it can never be
  withdrawn or rolled over. The contract honestly reports this
  (`balance_matches_accounted` false; the gap is exactly 20 GEN and
  is asserted by `verify.mjs`). It does not affect the money
  invariant, which holds over accounted value. A separate 30 GEN is
  stranded in an abandoned first deployment (`0xD609…`, payable
  methods not marked payable — see `EVIDENCE.md`). Both are faucet
  testnet GEN.

## Final state (latest-final readbacks)

- `get_accounting`: received 196,000,000,000,000,000,001 wei,
  withdrawn 162,250,000,000,000,000,000 wei, credits outstanding
  33,750,000,000,000,000,000 wei, rollover 1 wei, locked 0,
  `invariant_ok` true, contract balance 53,750,000,000,000,000,001
  wei (= accounted 33,750,000,000,000,000,001 wei + stranded 20 GEN).
- Scores: drawer 540, B 480, A 150, C 30, challenger 0.
- Gallery: 10 settled rounds. Round count 10, current round R9.
- Remaining withdrawable credits: A 17.5 GEN, C 6.25 GEN,
  challenger 10 GEN. Drawer and B withdrew in full (93 GEN and
  69.25 GEN) in R11.
