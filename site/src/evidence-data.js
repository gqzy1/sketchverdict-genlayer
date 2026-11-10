// Evidence transactions (copied from evidence/evidence.json — read-only
// reference links for the reviewer panel). Per-round outcomes are NOT
// copied here: the evidence page renders them from the live FINALIZED
// readback only, so no hardcoded outcome can ever go stale.
// No value shown on this page is a live claim: live values come only from a
// FINALIZED get_* readback. This file only feeds the evidence-page link table.
 export const EVIDENCE_DATA = {
  "contract": "0x56C85764c91F439185f446e019BB70A877458b54",
  "deploy_tx": "0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce",
  "source_sha256": "0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47",
  "tx_count": 64,
  "txs": [
    {
      "label": "deploy",
      "hash": "0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce"
    },
    {
      "label": "R1:start",
      "hash": "0x35af00e554a0748e8f0072dc5e577e7ab6f5eb1c1edc8492d2f2dc1741715292"
    },
    {
      "label": "R1:draw",
      "hash": "0xbbacc50d938dc2fc5585b3c729a886a24a2ea1ab6f6d30ca9b8b1e3dc6e49f62"
    },
    {
      "label": "R10-2:self-guess",
      "hash": "0x5f68460d8e1795264caca10e5deee691550e778f702c91f4c76827004d7c8fc5"
    },
    {
      "label": "R1:guess-A-car",
      "hash": "0xf349706d11ff17ea99d639fffddb8ad41384948cac0fdd0fb003e56da4fb1e5c"
    },
    {
      "label": "R1:guess-B-bicycle",
      "hash": "0x5efa50cdd51bd92163bca8ce35cdb4bdd3ab75c2bec3959aa31b4887732a1a5f"
    },
    {
      "label": "R1:guess-C-bicycle",
      "hash": "0x94e5991bd40298cb4aae0c5d48c2cc68b2d666ab7633ecb588fdc5be5a597cda"
    },
    {
      "label": "R10-1:dup-guess",
      "hash": "0xe8cb27901415d7ef3004bd6eedea1e4a01267552ad9e647620a5f9fd6ec9a5fa"
    },
    {
      "label": "R10-5:second-drawing",
      "hash": "0xa76ef65b1c4d4dcbeb8d53d5c8be6d957c917e57a4240743449ebb1ada263ee3"
    },
    {
      "label": "R10-3:non-drawer-reveal",
      "hash": "0x3a40d67cd5ac807b6ce10aac463d4f4f9c83bfd102ebe0c8fd413881f153e7a9"
    },
    {
      "label": "R10-4:wrong-salt",
      "hash": "0x810d2e95143c93a5f39d20c25c2507c825501f66fbb906c26a8bc3e61b994be2"
    },
    {
      "label": "R1:reveal",
      "hash": "0xa438046d56baf0dd0a314b9ba54492f7706bf71c3754d8a5d26eacf9cde1cb33"
    },
    {
      "label": "R1:settle",
      "hash": "0x65d823b0c8343d90ea1b08e85a304308721abe9432e56e0d3cb113351196f540"
    },
    {
      "label": "R10-6:re-reveal-settled",
      "hash": "0x2fd41a7ad2569edb3d655934cd2324f943e7ae629146f6c41aa15b672f6adda0"
    },
    {
      "label": "R10-7:dup-round-id",
      "hash": "0x19ea8e7f6398d4165c468f3cb571cfd8884824471262a54a4f3e2ffef86fcc53"
    },
    {
      "label": "R2:start",
      "hash": "0x0b41e122d34d800950dac591a044c6c87730cf259eb2ac859a6bae6f9bf36e15"
    },
    {
      "label": "R2:draw",
      "hash": "0x259102cdc3adfd69c089d4d721e022d6df29db41e4db597d410c522b5644c7c1"
    },
    {
      "label": "R2:guess-A",
      "hash": "0x69ceeb70b6d4bc49154eb13a32cc37aa1783e378f562b54e5111f6bcacdb9b51"
    },
    {
      "label": "R2:guess-B",
      "hash": "0xd313072c62520b5b357f5bae6134c314950f6a09c356a557716b12f29b8ef92e"
    },
    {
      "label": "R2:reveal",
      "hash": "0x3a5b0c2995a6ba76620f8c2a5bf6f741f77fe135226d8f8ea50ca043a090d5f7"
    },
    {
      "label": "R2:settle",
      "hash": "0x191ccfe7bdd93454501ab215d7965dcb49344e67719204082ec392768c06a51a"
    },
    {
      "label": "R2b:start",
      "hash": "0xc1e9d2ea7e0a6738e7491a6e46a35b5da7bac981857524839a1b592e1945778c"
    },
    {
      "label": "R2b:draw",
      "hash": "0x84cb45a81e66175938c2135fb7b8b79d14146adde71d49c1b7dcf1673d472856"
    },
    {
      "label": "R2b:guess-A",
      "hash": "0x8e0f2ac6beb99d68f1bd9ee18c25d080f36d60b07c29beebe4f440c7024a3209"
    },
    {
      "label": "R2b:guess-B",
      "hash": "0xc6c5dcc2b88649144abf1041890e7f2537502f7cc856e0df3d1d3b0e6e368163"
    },
    {
      "label": "R2b:reveal",
      "hash": "0x1a5ea8fd80b9d39fe42e05168c5b288164ced2808e42eaef99eaa63de8f894d4"
    },
    {
      "label": "R2b:settle",
      "hash": "0xfc95248c4477f03e59deba255a9d3628c8580b8fa98f27ca2c3927d7a3c387dc"
    },
    {
      "label": "R3:start",
      "hash": "0x56fb55b772dcef0251779c58a344706b67d8755074dd24eaf0e6bbbd1b1774c3"
    },
    {
      "label": "R3:draw",
      "hash": "0x478d103edcdb9f9f3d0bb7eeea1eb2e999633aeb34b7bc5626a1308327ff790e"
    },
    {
      "label": "R3:guess-A",
      "hash": "0xaf51b21af1296616162660ab10c92984ea7537a7f8a4f5be547a0ba0470e6589"
    },
    {
      "label": "R3:reveal",
      "hash": "0x61929e4e1f5b36e3f49939b7e20d507d743222d2d5954cff250cd0e3361316cc"
    },
    {
      "label": "R4:start",
      "hash": "0x27b797c42dd1fb8fcb089888873befc6ee0b3055b6d80bd4827eec7a5f81dd7a"
    },
    {
      "label": "R4:draw",
      "hash": "0xca92c68ad9eec347540d5cff4a4999cdbecdac55f118a291200a409e0174fce8"
    },
    {
      "label": "R4:guess-A",
      "hash": "0x925612a2034ed695fba6f3e4af2332bc32cf21e02b15e06caa6b2a0b873de5a9"
    },
    {
      "label": "R4:reveal",
      "hash": "0x7bb992935f70ef9f118f7d86d8a0feb9e803af884ee0ab1ceb52633fb0d1c3e3"
    },
    {
      "label": "R4:settle",
      "hash": "0x5b62e17aefc2f52c537c62a32b023a3effd410b2966d0dd9dcbc01439d25c9ce"
    },
    {
      "label": "R5:start",
      "hash": "0x27ee81dcebc5b5ae28b436093d4442660ff1e47749f2d3ee6c175b478127a42c"
    },
    {
      "label": "R5:draw-wrong-hash",
      "hash": "0x802dcfa681288eb7a71cac3901ae73161c80a1274cd8ccf5b0427870c0eb1a04"
    },
    {
      "label": "R5:guess-B",
      "hash": "0x93c5032a60ad610ad206808e16437cfbcf4bdb8348924e2ea329b29a9b15ad6b"
    },
    {
      "label": "R5:reveal",
      "hash": "0x07208321a09f25977e641e6282a3ac9220d584aa2532573dbdf9cd18946a1542"
    },
    {
      "label": "R5:challenge-true-hash",
      "hash": "0xa959ee576b2ba5982104063f8e2eb6c57bb51ec7a4ea0dc1c04cabc2d6c21619"
    },
    {
      "label": "R5:settle",
      "hash": "0x3083f935663f01366f471fa3054177b4f556a8341addf2d97e1a38ebc26dc234"
    },
    {
      "label": "R6:start",
      "hash": "0x56ba145b10671d9a2361d4079ac488e97ade7677eeef4f55234a2287e95687a2"
    },
    {
      "label": "R6:draw",
      "hash": "0x6283d42b589d1d37279b67e8c96667b3438439f7c6c3ab6bda0015c2030dd83a"
    },
    {
      "label": "R6:guess-B",
      "hash": "0xcdd00c11d599e434c401f30e3989036a1ac4001daab03ab2e466bfc8fe429321"
    },
    {
      "label": "R6:reveal",
      "hash": "0xa7a24a7a0775102ed5cfa3a13966118fd96e3b12b370d3cb206a1b83cfbe0fb3"
    },
    {
      "label": "R6:challenge-wrong-hash",
      "hash": "0xd22adccec6bc6a25e67ad066affb9d991bbadf242a5e6c8d178c5bf6d329a62c"
    },
    {
      "label": "R6:challenge-second-blocked",
      "hash": "0xfb142def6875982a923a144c8f89813bababccde693d31aa5438da515b5af332"
    },
    {
      "label": "R6:settle",
      "hash": "0xf42e7f748d383aa6b5b5396ef05e99cd287c39a69c8d66007961f34f9d62b022"
    },
    {
      "label": "R7:start",
      "hash": "0xdaad560339793bd2e7d81cdb754f300f512468f1575ddd9404982698d8f17ed2"
    },
    {
      "label": "R7:timeout",
      "hash": "0x1f191c2aa94a5a87002bf50cd4c56d8bb066133baaec8a941a44fc00285e3e65"
    },
    {
      "label": "R8:start",
      "hash": "0xa176e4eb586304d573d73695177f558aec305f1ba2f254175c481aeab21b0f2a"
    },
    {
      "label": "R8:draw",
      "hash": "0x84392109f967cf0074e062a4253c6dd31b1d1b684c4bd90cb3865f8231a3dc37"
    },
    {
      "label": "R8:guess-A",
      "hash": "0x37d16c787101f939d6cff02d7c4b09aeb9217a7a4c4c8cc9cf8ee676ea3b0f00"
    },
    {
      "label": "R8:guess-B",
      "hash": "0x5845fe7987ebf00a50d9d85c074081c87b702271bba7679827f37130fcf417a2"
    },
    {
      "label": "R8:timeout",
      "hash": "0x7b99ee4a9d0f554c47dbd5451135f42274d1644000e492d22cbde9f229b8acdf"
    },
    {
      "label": "R9:start",
      "hash": "0x62f75c56c3277b9cba753ac7d19db7da9349f48ce96dadc83fe902189faa0928"
    },
    {
      "label": "R9:draw",
      "hash": "0xfd5c1f0ba0c112432134535b5cd605b0cad32309942e41913bc23c2ccbb4c88f"
    },
    {
      "label": "R9:guess-B",
      "hash": "0x17858c1993e337c66de374470908ae8fa774e2c8abe3a0693c3ba15c3bac4384"
    },
    {
      "label": "R9:reveal",
      "hash": "0x02708317dfee337f59fe6fcedae623145e9e4c548efba74b896deb96d94bfa6b"
    },
    {
      "label": "R9:settle",
      "hash": "0xfa2e165619c1becd0505b68980064eecb28e6f31f656a580578fa99a0f1bd717"
    },
    {
      "label": "R11:withdraw-drawer",
      "hash": "0xfbd9e669b5b20a3c14afe2277850937cbfabb30ec2d63c555b797a444408da62"
    },
    {
      "label": "R11:withdraw-B",
      "hash": "0x591df1e9d616a27c7cd75a957263f30207e4143764ad9b0ab35b66317ef45b81"
    },
    {
      "label": "R11:withdraw-zero",
      "hash": "0xc73b8c765a0616b6ac2f871e640f9c28f1d3968b1edc7167f6847d0b0c20b222"
    }
  ],
};
