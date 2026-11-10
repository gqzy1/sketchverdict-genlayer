# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""SketchVerdict (P12 draw-and-guess party game) on Stable Studionet.

States: DRAWING -> GUESSING -> JUDGED -> SETTLED.
Consensus decides the drawing's visual tier (DRAWING_MATCHES /
DRAWING_WEAK / DRAWING_MISS) plus a text-cheat veto; deterministic code
decides guess correctness, the fastest guesser, and all money.

Anchors (beneficiary cannot forge):
1. concept_commit = SHA256(salt + "|" + normalized_concept), locked in
   start_round before any guess is seen (pure-Python SHA-256, sealed-
   vote implementation). A wrong (concept, salt) at reveal raises
   COMMIT_MISMATCH before any write; the round stays GUESSING.
2. The drawing's PNG bytes are stored on-chain as base64 at
   submit_drawing, with the caller-provided image_sha256 stored as the
   lock WITHOUT verification at submit time (verification happens at
   reveal -- this is what makes the challenge flip path reachable).
   At reveal, deterministic code re-hashes the stored bytes; a
   mismatch short-circuits to DRAWING_MISS / IMAGE_HASH_MISMATCH with
   no LLM call. NO URL fetching anywhere: the probe contract
   (0x0f5169aD1BE8497fC0f302df461D9fE2AD72A656) proved on-chain that
   URL image fetch in consensus fails, while the vision LLM CAN judge
   bytes stored on-chain.
3. Guess correctness is deterministic exact match on the normalized
   concept; seq_no order is assigned on-chain, so the fastest guesser
   is code-decided, never LLM-decided.

Money safety (A3 lesson): on Studionet a payable call that raises
keeps the value while the state reverts. So NO payable entry point
ever raises while holding value: every failure path credits the full
received value back to the sender's withdrawable balance and returns
a failure JSON. Settlement never pushes GEN; it records withdrawable
credits and each player pulls with withdraw(). withdraw() zeroes the
credit before transferring.

Time: UTC minute from timeapi.io (primary) with worldtimeapi.org
backup, exact agreement (sealed-vote pattern). If both sources fail
in consensus the call returns None and the caller fails closed
(payable: reject-with-refund; non-payable: raise before any write).

Allocation (integer math only, remainder always rolls over):
total_pot = previous rollover + drawer stake + sum(guesser stakes).
- MATCHES, correct >= 1: drawer 50%; correct guessers SPLIT the other
  50% EQUALLY (fastest takes no extra money, only +100 score vs +30).
- MATCHES, correct 0: 0 payouts, 100% rollover.
- WEAK, correct >= 1: drawer 25%; correct guessers split 25% equally;
  ~50% + remainders roll over.
- WEAK, correct 0 / MISS (any correct count): 0 payouts, 100% rollover.
Invariant: received == withdrawn + credited balances + rollover +
locked stakes of open rounds (see get_accounting).

Standard stakes (documented, enforced as minima so an odd-wei
evidence pot stays possible): drawer >= 1 GEN, guesser >= 0.1 GEN,
challenge deposit >= 1 GEN. Evidence uses drawer 10 GEN, guesser
5 GEN, challenge deposit 5 GEN.
"""

import json

from genlayer import *

PROTOCOL_VERSION = "sketchverdict-1"
MAX_B64_LENGTH = 200000
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
CHALLENGE_WINDOW_MINUTES = 10
DRAWER_STAKE_MIN_WEI = 1000000000000000000
GUESSER_STAKE_MIN_WEI = 100000000000000000
CHALLENGE_DEPOSIT_MIN_WEI = 1000000000000000000
MAX_ROUND_ID_LENGTH = 48
MAX_TEXT_LENGTH = 40
TIME_PRIMARY_URL = "https://timeapi.io/api/Time/current/zone?timeZone=UTC"
TIME_BACKUP_URL = "https://worldtimeapi.org/api/timezone/Etc/UTC"


# ======================================================================
# Pure-Python SHA-256 (str variant: sealed-vote-v2; bytes variant:
# probe; both checked locally against hashlib).
# ======================================================================

_SHA256_ROUND_CONSTANTS = [
    0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
    0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
    0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
    0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
    0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
    0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
    0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
    0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
    0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
    0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
    0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
    0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
    0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
    0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
    0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
    0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2,
]


def _rotate_right_32(value: int, bits: int) -> int:
    return ((value >> bits) | (value << (32 - bits))) & 0xFFFFFFFF


def _sha256_compress(buf: bytearray) -> str:
    digest_state = [
        0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
        0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19,
    ]
    for block_start in range(0, len(buf), 64):
        words = [0] * 64
        for index in range(16):
            pos = block_start + index * 4
            words[index] = (
                (buf[pos] << 24)
                | (buf[pos + 1] << 16)
                | (buf[pos + 2] << 8)
                | buf[pos + 3]
            )
        for index in range(16, 64):
            small0 = (
                _rotate_right_32(words[index - 15], 7)
                ^ _rotate_right_32(words[index - 15], 18)
                ^ (words[index - 15] >> 3)
            )
            small1 = (
                _rotate_right_32(words[index - 2], 17)
                ^ _rotate_right_32(words[index - 2], 19)
                ^ (words[index - 2] >> 10)
            )
            words[index] = (
                words[index - 16] + small0 + words[index - 7] + small1
            ) & 0xFFFFFFFF
        a, b, c, d, e, f, g, h = digest_state
        for index in range(64):
            big1 = (
                _rotate_right_32(e, 6)
                ^ _rotate_right_32(e, 11)
                ^ _rotate_right_32(e, 25)
            )
            choose = (e & f) ^ ((~e & 0xFFFFFFFF) & g)
            temp1 = (
                h + big1 + choose + _SHA256_ROUND_CONSTANTS[index] + words[index]
            ) & 0xFFFFFFFF
            big0 = (
                _rotate_right_32(a, 2)
                ^ _rotate_right_32(a, 13)
                ^ _rotate_right_32(a, 22)
            )
            majority = (a & b) ^ (a & c) ^ (b & c)
            temp2 = (big0 + majority) & 0xFFFFFFFF
            h, g, f, e, d, c, b, a = (
                g, f, e, (d + temp1) & 0xFFFFFFFF, c, b, a,
                (temp1 + temp2) & 0xFFFFFFFF,
            )
        new_values = [a, b, c, d, e, f, g, h]
        digest_state = [
            (digest_state[idx] + new_values[idx]) & 0xFFFFFFFF
            for idx in range(8)
        ]
    hex_digits = "0123456789abcdef"
    out = []
    for word in digest_state:
        for shift in (28, 24, 20, 16, 12, 8, 4, 0):
            out.append(hex_digits[(word >> shift) & 0xF])
    return "".join(out)


def pure_sha256_hex(message_text: str) -> str:
    buf = bytearray(message_text.encode("utf-8"))
    bit_length = len(buf) * 8
    buf.append(0x80)
    while (len(buf) % 64) != 56:
        buf.append(0x00)
    for shift in range(7, -1, -1):
        buf.append((bit_length >> (shift * 8)) & 0xFF)
    return _sha256_compress(buf)


def pure_sha256_hex_bytes(data: bytes) -> str:
    buf = bytearray(data)
    bit_length = len(buf) * 8
    buf.append(0x80)
    while (len(buf) % 64) != 56:
        buf.append(0x00)
    for shift in range(7, -1, -1):
        buf.append((bit_length >> (shift * 8)) & 0xFF)
    return _sha256_compress(buf)


# ======================================================================
# Pure-Python base64 (probe implementation; no stdlib assumption).
# ======================================================================

_B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
_B64_VALUE = {}
for _i, _ch in enumerate(_B64_ALPHABET):
    _B64_VALUE[_ch] = _i


def pure_b64encode(data: bytes) -> str:
    out = []
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
        n = (chunk[0] << 16)
        if len(chunk) > 1:
            n |= chunk[1] << 8
        if len(chunk) > 2:
            n |= chunk[2]
        out.append(_B64_ALPHABET[(n >> 18) & 63])
        out.append(_B64_ALPHABET[(n >> 12) & 63])
        out.append(_B64_ALPHABET[(n >> 6) & 63] if len(chunk) > 1 else "=")
        out.append(_B64_ALPHABET[n & 63] if len(chunk) > 2 else "=")
    return "".join(out)


def pure_b64decode(text: str) -> bytes:
    if not isinstance(text, str):
        raise ValueError("B64_NOT_STR")
    if len(text) % 4 != 0:
        raise ValueError("B64_LENGTH")
    if len(text) > MAX_B64_LENGTH:
        raise ValueError("B64_TOO_LONG")
    pad = 0
    if text.endswith("=="):
        pad = 2
    elif text.endswith("="):
        pad = 1
    for ch in text:
        if ch != "=" and ch not in _B64_VALUE:
            raise ValueError("B64_BAD_CHAR")
    if "=" in text[:len(text) - pad] if pad else ("=" in text):
        raise ValueError("B64_BAD_PADDING")
    out = bytearray()
    for i in range(0, len(text), 4):
        quad = text[i:i + 4]
        vals = []
        for ch in quad:
            if ch == "=":
                vals.append(0)
            else:
                vals.append(_B64_VALUE[ch])
        triple = (vals[0] << 18) | (vals[1] << 12) | (vals[2] << 6) | vals[3]
        out.append((triple >> 16) & 0xFF)
        out.append((triple >> 8) & 0xFF)
        out.append(triple & 0xFF)
    if pad:
        del out[len(out) - pad:]
    return bytes(out)


# ======================================================================
# Deterministic helpers
# ======================================================================


def _fail_unless(condition, message):
    if not condition:
        raise gl.vm.UserError(message)


def _canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"),
                      ensure_ascii=False)


def _is_hex_char(ch: str) -> bool:
    return ("0" <= ch <= "9") or ("a" <= ch <= "f")


def _valid_sha256_hex(value) -> bool:
    if not isinstance(value, str) or len(value) != 64:
        return False
    for ch in value:
        if not _is_hex_char(ch):
            return False
    return True


def _normalize(text) -> str:
    """Trim, lowercase, collapse whitespace, keep [a-z0-9 ] only.
    Any other character is dropped (it is not a separator)."""
    if not isinstance(text, str):
        return ""
    out = []
    prev_space = True
    for ch in text.lower():
        if ch == " " or ch == "\t" or ch == "\n" or ch == "\r":
            if not prev_space:
                out.append(" ")
                prev_space = True
        elif ("a" <= ch <= "z") or ("0" <= ch <= "9"):
            out.append(ch)
            prev_space = False
    if out and out[len(out) - 1] == " ":
        del out[len(out) - 1]
    return "".join(out)


def _verdict_from_jury(cheat: str, tier: str):
    """Deterministic mapping: cheat YES vetoes everything."""
    if cheat == "YES":
        return "DRAWING_MISS", "TEXT_CHEAT_DETECTED"
    if tier == "MATCHES":
        return "DRAWING_MATCHES", "VISUAL_MATCH_CONFIRMED"
    if tier == "WEAK":
        return "DRAWING_WEAK", "VISUAL_WEAK_PARTIAL"
    return "DRAWING_MISS", "VISUAL_MISS"


def _allocate(verdict: str, correct_count: int, total_pot: int):
    """Returns (drawer_payout, each_guesser_payout, next_rollover)."""
    if verdict == "DRAWING_MATCHES" and correct_count >= 1:
        drawer = total_pot * 50 // 100
        guesser_pot = total_pot * 50 // 100
        each = guesser_pot // correct_count
        return drawer, each, total_pot - drawer - each * correct_count
    if verdict == "DRAWING_WEAK" and correct_count >= 1:
        drawer = total_pot * 25 // 100
        guesser_pot = total_pot * 25 // 100
        each = guesser_pot // correct_count
        return drawer, each, total_pot - drawer - each * correct_count
    return 0, 0, total_pot


# ======================================================================
# Visual jury (probe _parse_verdict / _jury_prompt / _judge_image,
# with the URL form removed: no URL fetching anywhere).
# ======================================================================


def _parse_verdict(raw):
    """Strict parse of the fixed-answer LLM JSON. Raises, never defaults."""
    if isinstance(raw, dict):
        obj = raw
    elif isinstance(raw, str):
        text = raw.strip()
        if text.startswith("```"):
            header, sep, body = text.partition("\n")
            if not sep or header.lower() not in ("```", "```json"):
                raise ValueError("INVALID_MODEL_FORMAT")
            if not body.endswith("```"):
                raise ValueError("INVALID_MODEL_FORMAT")
            text = body[:-3].strip()
        try:
            obj = json.loads(text)
        except Exception:
            raise ValueError("INVALID_MODEL_JSON")
    else:
        raise ValueError("INVALID_MODEL_RESULT")
    if not isinstance(obj, dict):
        raise ValueError("INVALID_MODEL_RESULT")
    cheat = obj.get("has_written_text_cheat")
    tier = obj.get("visual_depiction_tier")
    if cheat not in ("YES", "NO"):
        raise ValueError("INVALID_CHEAT_ENUM")
    if tier not in ("MATCHES", "WEAK", "MISS"):
        raise ValueError("INVALID_TIER_ENUM")
    return {"has_written_text_cheat": cheat, "visual_depiction_tier": tier}


def _jury_prompt(concept: str) -> str:
    return (
        "You are a visual jury for a draw-and-guess game. Look at the "
        "attached image. It is a drawing. Answer ONLY with JSON: "
        "{\"has_written_text_cheat\": \"YES\" or \"NO\", "
        "\"visual_depiction_tier\": \"MATCHES\" or \"WEAK\" or \"MISS\"}. "
        "Rules: has_written_text_cheat is YES if the image contains any "
        "written word, letter, number, or text label (in any language), "
        "otherwise NO. visual_depiction_tier judges ONLY the drawn shapes "
        "(ignore any text): MATCHES if the drawing clearly depicts a "
        + concept + "; WEAK if it vaguely resembles a " + concept
        + "; MISS otherwise. Concept: " + concept + "."
    )


def _judge_image(img_bytes: bytes, concept: str, b64_text):
    """Runs the LLM over image bytes stored on-chain.

    Forms: (a) images=[bytes] native param; (c) base64 in the prompt.
    Returns the verdict dict plus the attempt log and the form used.
    Raises if every form fails or the output fails strict parsing.
    Equivalence is EXACT equality on the two enum fields only
    (coarse-band equivalence for the subjective part): the validator
    re-runs the leader function and compares the two enums.
    """
    prompt = _jury_prompt(concept)
    attempts = []

    def leader_fn():
        try:
            raw = gl.nondet.exec_prompt(prompt, images=[img_bytes],
                                        response_format="json")
            verdict = _parse_verdict(raw)
            attempts.append({"form": "a-images-param", "ok": True,
                             "error": ""})
            return {"verdict": verdict, "input_form": "a-images-param",
                    "attempts": attempts}
        except Exception as e:
            attempts.append({"form": "a-images-param", "ok": False,
                             "error": str(e)[:300]})
        if b64_text:
            try:
                raw = gl.nondet.exec_prompt(
                    prompt + " The image is the following base64-encoded "
                    "PNG. Decode it mentally and look at it before "
                    "answering: " + b64_text,
                    response_format="json")
                verdict = _parse_verdict(raw)
                attempts.append({"form": "c-base64-in-prompt", "ok": True,
                                 "error": ""})
                return {"verdict": verdict,
                        "input_form": "c-base64-in-prompt",
                        "attempts": attempts}
            except Exception as e:
                attempts.append({"form": "c-base64-in-prompt", "ok": False,
                                 "error": str(e)[:300]})
        raise ValueError("ALL_IMAGE_FORMS_FAILED: " + _canonical_json(attempts))

    def validator_fn(result):
        if not isinstance(result, gl.vm.Return):
            try:
                leader_fn()
            except Exception:
                return True
            return False
        proposed = result.calldata
        if not isinstance(proposed, dict):
            return False
        try:
            mine = leader_fn()
        except Exception:
            return False
        pv = proposed.get("verdict", {})
        mv = mine.get("verdict", {})
        return (pv.get("has_written_text_cheat")
                == mv.get("has_written_text_cheat")
                and pv.get("visual_depiction_tier")
                == mv.get("visual_depiction_tier"))

    return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)


# ======================================================================
# Current UTC minute (sealed-vote pattern, minute granularity).
# Primary timeapi.io, backup worldtimeapi.org. Returns an int minute
# since the Unix epoch, or None when both sources fail in consensus.
# ======================================================================


def _days_from_civil(y: int, m: int, d: int) -> int:
    if m <= 2:
        y = y - 1
    era = (y if y >= 0 else y - 399) // 400
    yoe = y - era * 400
    mp = (m + 9) % 12
    doy = (153 * mp + 2) // 5 + d - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468


def _parse_timeapi_minute(text: str) -> int:
    data = json.loads(text)
    dt = str(data["dateTime"])
    year = int(dt[0:4])
    month = int(dt[5:7])
    day = int(dt[8:10])
    hour = int(dt[11:13])
    minute = int(dt[14:16])
    return _days_from_civil(year, month, day) * 1440 + hour * 60 + minute


def _parse_worldtime_minute(text: str) -> int:
    data = json.loads(text)
    return int(data["unixtime"]) // 60


def _fetch_current_utc_minute():
    def fetch():
        try:
            response = gl.nondet.web.request(TIME_PRIMARY_URL, method="GET")
        except Exception:
            response = None
        if response is not None and getattr(response, "status", 200) == 200:
            body = response.body
            text = body.decode("utf-8") if isinstance(body, bytes) else str(body)
            try:
                return _parse_timeapi_minute(text)
            except Exception:
                pass
        try:
            response2 = gl.nondet.web.request(TIME_BACKUP_URL, method="GET")
        except Exception:
            raise gl.vm.UserError("TIME_FETCH_FAILED")
        if getattr(response2, "status", 200) != 200:
            raise gl.vm.UserError("TIME_STATUS")
        body2 = response2.body
        text2 = body2.decode("utf-8") if isinstance(body2, bytes) else str(body2)
        try:
            return _parse_worldtime_minute(text2)
        except Exception:
            raise gl.vm.UserError("TIME_BAD_JSON")

    def validate(leader):
        if isinstance(leader, gl.vm.UserError):
            try:
                fetch()
            except gl.vm.UserError:
                return True
            except Exception:
                return False
            return False
        if not isinstance(leader, gl.vm.Return):
            return False
        proposed = leader.calldata
        if not isinstance(proposed, int):
            return False
        try:
            own = fetch()
        except Exception:
            return False
        return proposed == own

    try:
        return gl.vm.run_nondet_unsafe(fetch, validate)
    except Exception:
        return None


# ======================================================================
# Contract
# ======================================================================


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


class SketchVerdict(gl.Contract):
    rounds_json: str
    credits_json: str
    scores_json: str
    witness_json: str
    rollover_pool_wei: u256
    total_received_wei: u256
    total_withdrawn_wei: u256
    round_count: u256
    current_round_id: str

    def __init__(self):
        self.rounds_json = "{}"
        self.credits_json = "{}"
        self.scores_json = "{}"
        self.witness_json = "[]"
        self.rollover_pool_wei = u256(0)
        self.total_received_wei = u256(0)
        self.total_withdrawn_wei = u256(0)
        self.round_count = u256(0)
        self.current_round_id = ""

    # -- state plumbing ------------------------------------------------------

    def _load_all(self):
        rounds = json.loads(self.rounds_json) if self.rounds_json else {}
        credits = json.loads(self.credits_json) if self.credits_json else {}
        scores = json.loads(self.scores_json) if self.scores_json else {}
        witness = json.loads(self.witness_json) if self.witness_json else []
        return rounds, credits, scores, witness

    def _save_all(self, rounds, credits, scores, witness):
        self.rounds_json = json.dumps(rounds, sort_keys=True)
        self.credits_json = json.dumps(credits, sort_keys=True)
        self.scores_json = json.dumps(scores, sort_keys=True)
        self.witness_json = json.dumps(witness)

    def _credit(self, credits, addr, amount: int):
        credits[addr] = str(int(credits.get(addr, "0")) + amount)

    def _refund_unexpected_value(self, credits) -> int:
        """Credit back GEN sent to a non-payable write. Returns value."""
        value = int(gl.message.value)
        if value > 0:
            sender = str(gl.message.sender_address).lower()
            self._credit(credits, sender, value)
            self.total_received_wei = self.total_received_wei + gl.message.value
        return value

    def _reject_with_refund(self, rounds, credits, scores, witness,
                            reason, value, extra) -> str:
        """Reject a payable call, crediting the full value back.
        The GEN is never swallowed; it becomes a withdrawable credit."""
        if value > 0:
            sender = str(gl.message.sender_address).lower()
            self._credit(credits, sender, value)
            self.total_received_wei = self.total_received_wei + gl.message.value
        self._save_all(rounds, credits, scores, witness)
        out = {
            "accepted": False,
            "reason": reason,
            "refunded_credit_wei": str(value if value > 0 else 0),
        }
        out.update(extra)
        return _canonical_json(out)

    def _settle_round(self, rounds, credits, scores, rnd):
        """Deterministic settlement of a JUDGED round. No LLM, no time.
        Credits payouts, updates scores, moves the remainder to the
        rollover pool, freezes the round as SETTLED. Returns summary."""
        total_pot = int(self.rollover_pool_wei)
        total_pot = total_pot + int(rnd["drawer_stake_wei"])
        for g in rnd["guesses"]:
            total_pot = total_pot + int(g["stake_wei"])
        correct = rnd["correct_guessers"]
        fastest = rnd["fastest_guesser"]
        drawer_payout, each, next_rollover = _allocate(
            rnd["drawing_verdict"], len(correct), total_pot)
        guesser_payouts = {}
        for addr in correct:
            guesser_payouts[addr] = str(each)
        if drawer_payout > 0:
            self._credit(credits, rnd["drawer"], drawer_payout)
        for addr in correct:
            if each > 0:
                self._credit(credits, addr, each)
        if rnd["drawing_verdict"] == "DRAWING_MATCHES" and len(correct) >= 1:
            scores[rnd["drawer"]] = int(scores.get(rnd["drawer"], 0)) + 100
            for addr in correct:
                if addr == fastest:
                    scores[addr] = int(scores.get(addr, 0)) + 100
                else:
                    scores[addr] = int(scores.get(addr, 0)) + 30
        elif rnd["drawing_verdict"] == "DRAWING_WEAK" and len(correct) >= 1:
            scores[rnd["drawer"]] = int(scores.get(rnd["drawer"], 0)) + 40
            for addr in correct:
                scores[addr] = int(scores.get(addr, 0)) + 50
        self.rollover_pool_wei = u256(next_rollover)
        rnd["drawer_payout_wei"] = str(drawer_payout)
        rnd["guesser_payouts"] = guesser_payouts
        rnd["total_pot_wei"] = str(total_pot)
        rnd["next_rollover_pool_wei"] = str(next_rollover)
        rnd["status"] = "SETTLED"
        return {
            "accepted": True,
            "method": "settle",
            "round_id": rnd["round_id"],
            "drawing_verdict": rnd["drawing_verdict"],
            "reason_code": rnd["reason_code"],
            "correct_guessers": correct,
            "fastest_guesser": fastest,
            "total_pot_wei": str(total_pot),
            "drawer_payout_wei": str(drawer_payout),
            "guesser_payouts": guesser_payouts,
            "next_rollover_pool_wei": str(next_rollover),
            "status": "SETTLED",
        }

    # -- writes ----------------------------------------------------------

    @gl.public.write
    def start_round(self, round_id, concept_commit, category_hint,
                    drawing_duration_min, guessing_duration_min) -> str:
        try:
            return self._start_round_inner(
                round_id, concept_commit, category_hint,
                drawing_duration_min, guessing_duration_min)
        except Exception as e:
            rounds, credits, scores, witness = self._load_all()
            value = int(gl.message.value)
            return self._reject_with_refund(
                rounds, credits, scores, witness,
                "internal_error:" + str(e)[:100], value,
                {"round_id": round_id if isinstance(round_id, str) else ""})

    def _start_round_inner(self, round_id, concept_commit, category_hint,
                           drawing_duration_min, guessing_duration_min) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        value = int(gl.message.value)
        extra = {"round_id": round_id if isinstance(round_id, str) else ""}
        # Conflicting re-submission: same round_id already exists. Record
        # the witness, refund the value, never overwrite state.
        if isinstance(round_id, str) and round_id in rounds:
            witness.append({
                "type": "conflict",
                "kind": "duplicate_round_id",
                "round_id": round_id,
                "sender": sender,
                "existing_status": rounds[round_id]["status"],
            })
            if value > 0:
                self._credit(credits, sender, value)
                self.total_received_wei = self.total_received_wei + gl.message.value
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "duplicate_round_id",
                "conflict_recorded": True,
                "refunded_credit_wei": str(value),
                "round_id": round_id,
            })
        reason = None
        if not isinstance(round_id, str) or len(round_id) == 0 or len(round_id) > MAX_ROUND_ID_LENGTH:
            reason = "round_id_invalid"
        elif not _valid_sha256_hex(concept_commit):
            reason = "concept_commit_invalid"
        elif not isinstance(category_hint, str) or len(category_hint) > MAX_TEXT_LENGTH:
            reason = "category_hint_invalid"
        elif not isinstance(drawing_duration_min, int) or drawing_duration_min < 1 or drawing_duration_min > 1440:
            reason = "drawing_duration_invalid"
        elif not isinstance(guessing_duration_min, int) or guessing_duration_min < 1 or guessing_duration_min > 1440:
            reason = "guessing_duration_invalid"
        elif value < DRAWER_STAKE_MIN_WEI:
            reason = "drawer_stake_too_small"
        if reason is not None:
            return self._reject_with_refund(
                rounds, credits, scores, witness, reason, value, extra)
        now = _fetch_current_utc_minute()
        if now is None:
            return self._reject_with_refund(
                rounds, credits, scores, witness, "time_unavailable",
                value, extra)
        piggyback_settled = ""
        piggyback_summary = {}
        prev_id = self.current_round_id
        if prev_id:
            prev = rounds.get(prev_id)
            if prev is not None and prev["status"] != "SETTLED":
                if prev["status"] == "JUDGED":
                    if now > int(prev["challenge_deadline_minute"]):
                        piggyback_summary = self._settle_round(
                            rounds, credits, scores, prev)
                        piggyback_settled = prev_id
                    else:
                        return self._reject_with_refund(
                            rounds, credits, scores, witness,
                            "previous_round_challenge_open", value, extra)
                else:
                    return self._reject_with_refund(
                        rounds, credits, scores, witness,
                        "previous_round_not_settled", value, extra)
        self.total_received_wei = self.total_received_wei + gl.message.value
        rnd = {
            "round_id": round_id,
            "drawer": sender,
            "concept_commit": concept_commit,
            "category_hint": category_hint,
            "status": "DRAWING",
            "started_minute": str(now),
            "drawing_duration_min": drawing_duration_min,
            "guessing_duration_min": guessing_duration_min,
            "drawing_deadline_minute": str(now + drawing_duration_min),
            "reveal_deadline_minute": "",
            "challenge_deadline_minute": "",
            "drawer_stake_wei": str(value),
            "image_b64": "",
            "image_sha256": "",
            "image_byte_len": 0,
            "guesses": [],
            "next_seq_no": 1,
            "revealed_concept": "",
            "has_written_text_cheat": "",
            "visual_depiction_tier": "",
            "drawing_verdict": "",
            "reason_code": "",
            "correct_guessers": [],
            "fastest_guesser": "",
            "drawer_payout_wei": "0",
            "guesser_payouts": {},
            "total_pot_wei": "0",
            "next_rollover_pool_wei": "",
            "challenges": [],
            "challenge_count": 0,
            "last_challenge_flipped": False,
            "timeout_forfeited_wei": "0",
            "timeout_refunded_wei": "0",
            "settled_by": "",
        }
        rounds[round_id] = rnd
        self.current_round_id = round_id
        self.round_count = self.round_count + u256(1)
        self._save_all(rounds, credits, scores, witness)
        out = {
            "accepted": True,
            "round_id": round_id,
            "drawer": sender,
            "status": "DRAWING",
            "drawing_deadline_minute": str(now + drawing_duration_min),
            "drawer_stake_wei": str(value),
            "piggyback_settled_round": piggyback_settled,
        }
        if piggyback_settled:
            out["piggyback_settlement"] = piggyback_summary
        return _canonical_json(out)

    @gl.public.write
    def submit_drawing(self, round_id, image_b64, image_sha256) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        stray = self._refund_unexpected_value(credits)
        if stray > 0:
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "value_not_accepted",
                "refunded_credit_wei": str(stray),
                "round_id": round_id if isinstance(round_id, str) else "",
            })
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        if rnd is None:
            raise gl.vm.UserError("round_not_found")
        if rnd["status"] != "DRAWING":
            # Conflicting re-submission: record the witness, never
            # overwrite the stored drawing or state.
            witness.append({
                "type": "conflict",
                "kind": "second_submit_drawing",
                "round_id": round_id,
                "sender": sender,
                "existing_status": rnd["status"],
                "existing_image_sha256": rnd["image_sha256"],
            })
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "round_not_drawing",
                "conflict_recorded": True,
                "round_id": round_id,
                "status": rnd["status"],
            })
        if rnd["drawer"] != sender:
            raise gl.vm.UserError("only_drawer_submits_drawing")
        if not isinstance(image_b64, str) or len(image_b64) == 0 or len(image_b64) > MAX_B64_LENGTH:
            raise gl.vm.UserError("image_b64_bounds")
        try:
            img_bytes = pure_b64decode(image_b64)
        except Exception:
            raise gl.vm.UserError("image_b64_invalid")
        if len(img_bytes) == 0 or img_bytes[:8] != PNG_MAGIC:
            raise gl.vm.UserError("image_not_png")
        if not _valid_sha256_hex(image_sha256):
            raise gl.vm.UserError("image_sha256_invalid")
        now = _fetch_current_utc_minute()
        if now is None:
            raise gl.vm.UserError("time_unavailable")
        # Store the caller-provided hash as the lock WITHOUT verifying
        # it here: verification happens at reveal, which is what makes
        # the challenge flip path reachable.
        rnd["image_b64"] = image_b64
        rnd["image_sha256"] = image_sha256.lower()
        rnd["image_byte_len"] = len(img_bytes)
        rnd["reveal_deadline_minute"] = str(
            now + int(rnd["guessing_duration_min"]))
        rnd["status"] = "GUESSING"
        self._save_all(rounds, credits, scores, witness)
        return _canonical_json({
            "accepted": True,
            "round_id": round_id,
            "status": "GUESSING",
            "image_byte_len": len(img_bytes),
            "image_sha256_locked": rnd["image_sha256"],
            "reveal_deadline_minute": rnd["reveal_deadline_minute"],
        })

    @gl.public.write
    def submit_guess(self, round_id, guess_text) -> str:
        try:
            return self._submit_guess_inner(round_id, guess_text)
        except Exception as e:
            rounds, credits, scores, witness = self._load_all()
            value = int(gl.message.value)
            return self._reject_with_refund(
                rounds, credits, scores, witness,
                "internal_error:" + str(e)[:100], value,
                {"round_id": round_id if isinstance(round_id, str) else ""})

    def _submit_guess_inner(self, round_id, guess_text) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        value = int(gl.message.value)
        extra = {"round_id": round_id if isinstance(round_id, str) else ""}
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        reason = None
        if rnd is None:
            reason = "round_not_found"
        elif rnd["status"] != "GUESSING":
            reason = "round_not_guessing"
        elif rnd["drawer"] == sender:
            reason = "drawer_self_guess"
        elif value < GUESSER_STAKE_MIN_WEI:
            reason = "guesser_stake_too_small"
        else:
            for g in rnd["guesses"]:
                if g["address"] == sender:
                    reason = "duplicate_guess"
                    break
            if reason is None:
                guess = _normalize(guess_text)
                if len(guess) == 0 or len(guess) > MAX_TEXT_LENGTH:
                    reason = "guess_invalid"
        if reason is not None:
            return self._reject_with_refund(
                rounds, credits, scores, witness, reason, value, extra)
        guess = _normalize(guess_text)
        seq_no = int(rnd["next_seq_no"])
        rnd["guesses"].append({
            "address": sender,
            "seq_no": seq_no,
            "normalized_guess": guess,
            "verdict": "",
            "stake_wei": str(value),
        })
        rnd["next_seq_no"] = seq_no + 1
        self.total_received_wei = self.total_received_wei + gl.message.value
        self._save_all(rounds, credits, scores, witness)
        return _canonical_json({
            "accepted": True,
            "round_id": round_id,
            "guesser": sender,
            "seq_no": seq_no,
            "normalized_guess": guess,
            "stake_wei": str(value),
        })

    @gl.public.write
    def reveal_and_auto_settle(self, round_id, revealed_concept,
                               drawer_salt) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        stray = self._refund_unexpected_value(credits)
        if stray > 0:
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "value_not_accepted",
                "refunded_credit_wei": str(stray),
                "round_id": round_id if isinstance(round_id, str) else "",
            })
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        if rnd is None:
            raise gl.vm.UserError("round_not_found")
        if rnd["status"] == "SETTLED":
            # Conflicting re-submission: re-reveal on a settled round.
            witness.append({
                "type": "conflict",
                "kind": "re_reveal_settled",
                "round_id": round_id,
                "sender": sender,
                "existing_verdict": rnd["drawing_verdict"],
            })
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "round_settled",
                "conflict_recorded": True,
                "round_id": round_id,
                "status": "SETTLED",
            })
        if rnd["status"] != "GUESSING":
            raise gl.vm.UserError("round_not_guessing")
        if rnd["drawer"] != sender:
            raise gl.vm.UserError("only_drawer_reveals")
        concept = _normalize(revealed_concept)
        if len(concept) == 0 or len(concept) > MAX_TEXT_LENGTH:
            raise gl.vm.UserError("concept_invalid")
        if not isinstance(drawer_salt, str) or len(drawer_salt) == 0 or len(drawer_salt) > 64:
            raise gl.vm.UserError("salt_invalid")
        # (1) Deterministic preimage check BEFORE any write.
        expect = pure_sha256_hex(drawer_salt + "|" + concept)
        if expect != rnd["concept_commit"]:
            raise gl.vm.UserError("COMMIT_MISMATCH")
        # (2) Deterministic guess marking (in memory; saved at the end).
        correct = []
        for g in rnd["guesses"]:
            if g["normalized_guess"] == concept:
                g["verdict"] = "GUESS_CORRECT"
                correct.append(g["address"])
            else:
                g["verdict"] = "GUESS_WRONG"
        fastest = correct[0] if correct else ""
        # Time first, so a dead time source fails before the jury runs.
        now = _fetch_current_utc_minute()
        if now is None:
            raise gl.vm.UserError("time_unavailable")
        # (3) Deterministic hash gate on the STORED bytes.
        img_bytes = pure_b64decode(rnd["image_b64"])
        recomputed = pure_sha256_hex_bytes(img_bytes)
        cheat = ""
        tier = ""
        if recomputed != rnd["image_sha256"]:
            verdict = "DRAWING_MISS"
            reason = "IMAGE_HASH_MISMATCH"
        else:
            # (4) Jury on the stored bytes. A failed jury (all forms
            # failed, or unparseable output) is DRAWING_MISS, never a
            # default pass.
            try:
                judged = _judge_image(img_bytes, concept, rnd["image_b64"])
                cheat = judged["verdict"]["has_written_text_cheat"]
                tier = judged["verdict"]["visual_depiction_tier"]
                verdict, reason = _verdict_from_jury(cheat, tier)
            except Exception:
                verdict = "DRAWING_MISS"
                reason = "INVALID_JURY_OUTPUT"
                cheat = ""
                tier = ""
        rnd["revealed_concept"] = concept
        rnd["has_written_text_cheat"] = cheat
        rnd["visual_depiction_tier"] = tier
        rnd["drawing_verdict"] = verdict
        rnd["reason_code"] = reason
        rnd["correct_guessers"] = correct
        rnd["fastest_guesser"] = fastest
        rnd["challenge_deadline_minute"] = str(now + CHALLENGE_WINDOW_MINUTES)
        rnd["status"] = "JUDGED"
        self._save_all(rounds, credits, scores, witness)
        return _canonical_json({
            "accepted": True,
            "round_id": round_id,
            "status": "JUDGED",
            "revealed_concept": concept,
            "has_written_text_cheat": cheat,
            "visual_depiction_tier": tier,
            "drawing_verdict": verdict,
            "reason_code": reason,
            "correct_guessers": correct,
            "fastest_guesser": fastest,
            "challenge_deadline_minute": rnd["challenge_deadline_minute"],
            "payouts_pending_settle": True,
        })

    @gl.public.write
    def challenge(self, round_id, corrected_hash) -> str:
        try:
            return self._challenge_inner(round_id, corrected_hash)
        except Exception as e:
            rounds, credits, scores, witness = self._load_all()
            value = int(gl.message.value)
            return self._reject_with_refund(
                rounds, credits, scores, witness,
                "internal_error:" + str(e)[:100], value,
                {"round_id": round_id if isinstance(round_id, str) else ""})

    def _challenge_inner(self, round_id, corrected_hash) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        value = int(gl.message.value)
        extra = {"round_id": round_id if isinstance(round_id, str) else ""}
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        reason = None
        if rnd is None:
            reason = "round_not_found"
        elif rnd["status"] != "JUDGED":
            reason = "round_not_judged"
        elif not _valid_sha256_hex(corrected_hash):
            reason = "corrected_hash_invalid"
        elif value < CHALLENGE_DEPOSIT_MIN_WEI:
            reason = "challenge_deposit_too_small"
        elif int(rnd["challenge_count"]) >= 2:
            reason = "challenge_not_allowed"
        elif int(rnd["challenge_count"]) == 1 and not rnd["last_challenge_flipped"]:
            reason = "challenge_not_allowed"
        if reason is not None:
            return self._reject_with_refund(
                rounds, credits, scores, witness, reason, value, extra)
        now = _fetch_current_utc_minute()
        if now is None:
            return self._reject_with_refund(
                rounds, credits, scores, witness, "time_unavailable",
                value, extra)
        if now > int(rnd["challenge_deadline_minute"]):
            return self._reject_with_refund(
                rounds, credits, scores, witness,
                "challenge_window_closed", value, extra)
        corrected_hash = corrected_hash.lower()
        img_bytes = pure_b64decode(rnd["image_b64"])
        recomputed = pure_sha256_hex_bytes(img_bytes)
        locked = rnd["image_sha256"]
        old_verdict = rnd["drawing_verdict"]
        old_reason = rnd["reason_code"]
        old_cheat = rnd["has_written_text_cheat"]
        old_tier = rnd["visual_depiction_tier"]
        entry = {
            "round_id": round_id,
            "challenger": sender,
            "corrected_hash": corrected_hash,
            "recomputed_hash": recomputed,
            "locked_hash_before": locked,
            "old_verdict": old_verdict,
            "old_reason_code": old_reason,
        }
        # The deposit is received now: exactly one accounting entry,
        # resolved below as either a refund (credit) or a forfeit.
        self.total_received_wei = self.total_received_wei + gl.message.value
        outcome = ""
        deposit = ""
        flipped = False
        if recomputed != corrected_hash:
            # (a) The challenger's hash is wrong: fail, forfeit.
            self.rollover_pool_wei = self.rollover_pool_wei + gl.message.value
            outcome = "CHALLENGE_FAILED_WRONG_HASH"
            deposit = "forfeited_to_rollover"
            flipped = False
        else:
            # Jury re-run on the stored bytes.
            try:
                judged = _judge_image(
                    img_bytes, rnd["revealed_concept"], rnd["image_b64"])
                new_cheat = judged["verdict"]["has_written_text_cheat"]
                new_tier = judged["verdict"]["visual_depiction_tier"]
                new_verdict, new_reason = _verdict_from_jury(
                    new_cheat, new_tier)
            except Exception:
                # Jury unavailable: refund the deposit, change nothing,
                # and do NOT consume the challenge slot, so the
                # challenge can be retried inside the window.
                self._credit(credits, sender, value)
                entry["outcome"] = "CHALLENGE_JURY_FAILED_REFUNDED"
                entry["deposit"] = "refunded"
                entry["new_verdict"] = old_verdict
                entry["new_reason_code"] = old_reason
                rnd["challenges"].append(entry)
                witness.append({
                    "type": "challenge",
                    "round_id": round_id,
                    "challenger": sender,
                    "outcome": "CHALLENGE_JURY_FAILED_REFUNDED",
                })
                self._save_all(rounds, credits, scores, witness)
                return _canonical_json({
                    "accepted": True,
                    "round_id": round_id,
                    "challenge_outcome": "CHALLENGE_JURY_FAILED_REFUNDED",
                    "deposit": "refunded",
                    "verdict": old_verdict,
                    "reason_code": old_reason,
                })
            if corrected_hash != locked:
                # (b) The lock was wrong: correct it, adopt the fresh
                # jury verdict. Refund only if the verdict enum flips.
                rnd["image_sha256"] = corrected_hash
                rnd["has_written_text_cheat"] = new_cheat
                rnd["visual_depiction_tier"] = new_tier
                rnd["drawing_verdict"] = new_verdict
                rnd["reason_code"] = new_reason
                entry["new_verdict"] = new_verdict
                entry["new_reason_code"] = new_reason
                if new_verdict != old_verdict:
                    self._credit(credits, sender, value)
                    outcome = "CHALLENGE_SUCCEEDED_FLIP"
                    deposit = "refunded"
                    flipped = True
                else:
                    self.rollover_pool_wei = self.rollover_pool_wei + gl.message.value
                    outcome = "CHALLENGE_FAILED_SAME_VERDICT"
                    deposit = "forfeited_to_rollover"
                    flipped = False
            else:
                # (c) Second opinion on the same bytes: the verdict
                # flips only if the tier/cheat pair differs.
                entry["new_verdict"] = new_verdict
                entry["new_reason_code"] = new_reason
                if new_cheat != old_cheat or new_tier != old_tier:
                    rnd["has_written_text_cheat"] = new_cheat
                    rnd["visual_depiction_tier"] = new_tier
                    rnd["drawing_verdict"] = new_verdict
                    rnd["reason_code"] = new_reason
                    self._credit(credits, sender, value)
                    outcome = "CHALLENGE_SUCCEEDED_FLIP"
                    deposit = "refunded"
                    flipped = True
                else:
                    self.rollover_pool_wei = self.rollover_pool_wei + gl.message.value
                    outcome = "CHALLENGE_FAILED_SAME_VERDICT"
                    deposit = "forfeited_to_rollover"
                    flipped = False
        entry["outcome"] = outcome
        entry["deposit"] = deposit
        entry["new_verdict"] = entry.get("new_verdict", old_verdict)
        entry["new_reason_code"] = entry.get("new_reason_code", old_reason)
        rnd["challenges"].append(entry)
        witness.append({
            "type": "challenge",
            "round_id": round_id,
            "challenger": sender,
            "outcome": outcome,
        })
        rnd["challenge_count"] = int(rnd["challenge_count"]) + 1
        rnd["last_challenge_flipped"] = flipped
        self._save_all(rounds, credits, scores, witness)
        return _canonical_json({
            "accepted": True,
            "round_id": round_id,
            "challenge_outcome": outcome,
            "deposit": deposit,
            "verdict": rnd["drawing_verdict"],
            "reason_code": rnd["reason_code"],
            "image_sha256": rnd["image_sha256"],
        })

    @gl.public.write
    def settle(self, round_id) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        stray = self._refund_unexpected_value(credits)
        if stray > 0:
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "value_not_accepted",
                "refunded_credit_wei": str(stray),
                "round_id": round_id if isinstance(round_id, str) else "",
            })
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        if rnd is None:
            raise gl.vm.UserError("round_not_found")
        if rnd["status"] != "JUDGED":
            raise gl.vm.UserError("round_not_judged")
        now = _fetch_current_utc_minute()
        if now is None:
            raise gl.vm.UserError("time_unavailable")
        if now <= int(rnd["challenge_deadline_minute"]):
            raise gl.vm.UserError("challenge_window_open")
        summary = self._settle_round(rounds, credits, scores, rnd)
        rnd["settled_by"] = sender
        self._save_all(rounds, credits, scores, witness)
        return _canonical_json(summary)

    @gl.public.write
    def trigger_timeout_auto_settle(self, round_id) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        stray = self._refund_unexpected_value(credits)
        if stray > 0:
            self._save_all(rounds, credits, scores, witness)
            return _canonical_json({
                "accepted": False,
                "reason": "value_not_accepted",
                "refunded_credit_wei": str(stray),
                "round_id": round_id if isinstance(round_id, str) else "",
            })
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        if rnd is None:
            raise gl.vm.UserError("round_not_found")
        if rnd["status"] not in ("DRAWING", "GUESSING"):
            raise gl.vm.UserError("round_not_timeout_eligible")
        is_participant = sender == rnd["drawer"]
        if not is_participant:
            for g in rnd["guesses"]:
                if g["address"] == sender:
                    is_participant = True
                    break
        if not is_participant:
            raise gl.vm.UserError("not_a_participant")
        now = _fetch_current_utc_minute()
        if now is None:
            raise gl.vm.UserError("time_unavailable")
        drawer_stake = int(rnd["drawer_stake_wei"])
        refunds = {}
        if rnd["status"] == "DRAWING":
            if now <= int(rnd["drawing_deadline_minute"]):
                raise gl.vm.UserError("drawing_deadline_not_passed")
            reason = "DRAWER_DRAWING_TIMEOUT"
        else:
            if now <= int(rnd["reveal_deadline_minute"]):
                raise gl.vm.UserError("reveal_deadline_not_passed")
            reason = "DRAWER_REVEAL_TIMEOUT"
            for g in rnd["guesses"]:
                refunds[g["address"]] = g["stake_wei"]
                self._credit(credits, g["address"], int(g["stake_wei"]))
        self.rollover_pool_wei = self.rollover_pool_wei + u256(drawer_stake)
        stakes_total = drawer_stake
        for g in rnd["guesses"]:
            stakes_total = stakes_total + int(g["stake_wei"])
        refunded_total = 0
        for addr in refunds:
            refunded_total = refunded_total + int(refunds[addr])
        rnd["drawing_verdict"] = "DRAWING_MISS"
        rnd["reason_code"] = reason
        rnd["drawer_payout_wei"] = "0"
        rnd["guesser_payouts"] = {}
        rnd["total_pot_wei"] = str(stakes_total)
        rnd["next_rollover_pool_wei"] = str(int(self.rollover_pool_wei))
        rnd["timeout_forfeited_wei"] = str(drawer_stake)
        rnd["timeout_refunded_wei"] = str(refunded_total)
        rnd["status"] = "SETTLED"
        witness.append({
            "type": "timeout",
            "round_id": round_id,
            "triggered_by": sender,
            "reason": reason,
        })
        self._save_all(rounds, credits, scores, witness)
        return _canonical_json({
            "accepted": True,
            "round_id": round_id,
            "status": "SETTLED",
            "drawing_verdict": "DRAWING_MISS",
            "reason_code": reason,
            "timeout_forfeited_wei": str(drawer_stake),
            "guesser_refunds_wei": refunds,
            "next_rollover_pool_wei": str(int(self.rollover_pool_wei)),
        })

    @gl.public.write
    def withdraw(self) -> str:
        rounds, credits, scores, witness = self._load_all()
        sender = str(gl.message.sender_address).lower()
        # GEN sent to a withdrawal is credited back first; the
        # withdrawal of the (now larger) credit then proceeds.
        self._refund_unexpected_value(credits)
        amount = int(credits.get(sender, "0"))
        if amount <= 0:
            raise gl.vm.UserError("no_credit_to_withdraw")
        # Pull payment: zero the credit before the transfer, so a
        # failed or re-entered transfer can never pay twice.
        credits[sender] = "0"
        self.total_withdrawn_wei = self.total_withdrawn_wei + u256(amount)
        self._save_all(rounds, credits, scores, witness)
        _Recipient(Address(sender)).emit_transfer(value=u256(amount))
        return _canonical_json({
            "accepted": True,
            "address": sender,
            "withdrawn_wei": str(amount),
            "total_withdrawn_wei": str(int(self.total_withdrawn_wei)),
        })

    # -- views ---------------------------------------------------------------

    @gl.public.view
    def get_protocol(self) -> str:
        return PROTOCOL_VERSION

    @gl.public.view
    def get_round(self, round_id) -> str:
        rounds = json.loads(self.rounds_json) if self.rounds_json else {}
        rnd = rounds.get(round_id) if isinstance(round_id, str) else None
        if rnd is None:
            return ""
        return _canonical_json(rnd)

    @gl.public.view
    def get_room_state(self) -> str:
        return _canonical_json({
            "rollover_pool_wei": str(int(self.rollover_pool_wei)),
            "current_round_id": self.current_round_id,
            "round_count": int(self.round_count),
            "total_received_wei": str(int(self.total_received_wei)),
            "total_withdrawn_wei": str(int(self.total_withdrawn_wei)),
            "contract_balance_wei": str(int(self.balance)),
        })

    @gl.public.view
    def get_gallery(self) -> str:
        rounds = json.loads(self.rounds_json) if self.rounds_json else {}
        out = []
        for rid in sorted(rounds.keys()):
            rnd = rounds[rid]
            if rnd["status"] == "SETTLED":
                out.append({
                    "round_id": rid,
                    "drawer": rnd["drawer"],
                    "revealed_concept": rnd["revealed_concept"],
                    "drawing_verdict": rnd["drawing_verdict"],
                    "reason_code": rnd["reason_code"],
                    "has_written_text_cheat": rnd["has_written_text_cheat"],
                    "visual_depiction_tier": rnd["visual_depiction_tier"],
                    "image_sha256": rnd["image_sha256"],
                    "fastest_guesser": rnd["fastest_guesser"],
                    "drawer_payout_wei": rnd["drawer_payout_wei"],
                    "guesser_payouts": rnd["guesser_payouts"],
                    "total_pot_wei": rnd["total_pot_wei"],
                })
        return _canonical_json({"entries": out})

    @gl.public.view
    def get_player_stats(self, address) -> str:
        addr = str(address).lower()
        credits = json.loads(self.credits_json) if self.credits_json else {}
        scores = json.loads(self.scores_json) if self.scores_json else {}
        rounds = json.loads(self.rounds_json) if self.rounds_json else {}
        drawn = 0
        guessed = 0
        for rid in rounds:
            rnd = rounds[rid]
            if rnd["drawer"] == addr:
                drawn = drawn + 1
            for g in rnd["guesses"]:
                if g["address"] == addr:
                    guessed = guessed + 1
                    break
        return _canonical_json({
            "address": addr,
            "score": int(scores.get(addr, 0)),
            "balance_wei": credits.get(addr, "0"),
            "rounds_drawn": drawn,
            "rounds_guessed": guessed,
        })

    @gl.public.view
    def get_witness_log(self) -> str:
        witness = json.loads(self.witness_json) if self.witness_json else []
        return _canonical_json({"entries": witness})

    @gl.public.view
    def get_accounting(self) -> str:
        rounds = json.loads(self.rounds_json) if self.rounds_json else {}
        credits = json.loads(self.credits_json) if self.credits_json else {}
        credits_outstanding = 0
        for addr in credits:
            credits_outstanding = credits_outstanding + int(credits[addr])
        locked = 0
        for rid in rounds:
            rnd = rounds[rid]
            if rnd["status"] != "SETTLED":
                locked = locked + int(rnd["drawer_stake_wei"])
                for g in rnd["guesses"]:
                    locked = locked + int(g["stake_wei"])
        received = int(self.total_received_wei)
        withdrawn = int(self.total_withdrawn_wei)
        accounted = withdrawn + credits_outstanding + int(self.rollover_pool_wei) + locked
        return _canonical_json({
            "total_received_wei": str(received),
            "total_withdrawn_wei": str(withdrawn),
            "credits_outstanding_wei": str(credits_outstanding),
            "rollover_pool_wei": str(int(self.rollover_pool_wei)),
            "locked_stakes_wei": str(locked),
            "contract_balance_wei": str(int(self.balance)),
            "invariant_ok": accounted == received,
            "balance_matches_accounted": int(self.balance) == received - withdrawn,
        })
