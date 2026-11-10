"""Local unit tests for the SketchVerdict contract.

NON-CHAIN tests only: pure SHA-256 / base64 codecs, normalize +
commit-reveal, the 6-branch allocation matrix, challenge logic,
timeout deadline math, and full contract flows with a fake genlayer
module (FakeLLM jury, FakeWeb clock). Nothing here proves on-chain
consensus behaviour.
"""
import base64
import hashlib
import importlib.util
import json
import os
import random
import sys
import types
import unittest
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTRACT = os.path.join(ROOT, "contracts", "sketchverdict.py")
EVIDENCE = os.path.join(ROOT, "evidence")

GEN = 10 ** 18
DRAWER = "0x1111111111111111111111111111111111111111"
GUESSER_A = "0x2222222222222222222222222222222222222222"
GUESSER_B = "0x3333333333333333333333333333333333333333"
GUESSER_C = "0x4444444444444444444444444444444444444444"
CHALLENGER = "0x5555555555555555555555555555555555555555"

MATCHES = {"has_written_text_cheat": "NO", "visual_depiction_tier": "MATCHES"}
WEAK = {"has_written_text_cheat": "NO", "visual_depiction_tier": "WEAK"}
MISS = {"has_written_text_cheat": "NO", "visual_depiction_tier": "MISS"}
CHEAT = {"has_written_text_cheat": "YES", "visual_depiction_tier": "MATCHES"}

TRANSFERS = []


class Return:
    def __init__(self, calldata):
        self.calldata = calldata


class UserError(Exception):
    pass


def _run_nondet_unsafe(leader_fn, validator_fn):
    """Local consensus simulation: leader runs, validator checks."""
    try:
        value = leader_fn()
    except Exception as exc:
        if validator_fn(exc):
            raise
        raise AssertionError("validator disagreed with leader failure")
    if not validator_fn(Return(value)):
        raise AssertionError("validator disagreed with leader result")
    return value


class FakeWeb:
    """Controllable UTC clock. minute is epoch minutes."""

    def __init__(self, minute):
        self.minute = minute
        self.primary_fail = False
        self.primary_down = False

    def request(self, url, method="GET"):
        if "timeapi.io" in url:
            if self.primary_down:
                raise ConnectionError("primary down")
            if self.primary_fail:
                return types.SimpleNamespace(status=500, body=b"")
            dt = datetime.fromtimestamp(self.minute * 60, tz=timezone.utc)
            text = dt.strftime("%Y-%m-%dT%H:%M:%S") + ".0000000"
            return types.SimpleNamespace(
                status=200,
                body=json.dumps({"dateTime": text}).encode("utf-8"))
        if "worldtimeapi" in url:
            return types.SimpleNamespace(
                status=200,
                body=json.dumps({"unixtime": self.minute * 60}).encode("utf-8"))
        raise ValueError("unexpected url " + url)


class FakeLLM:
    """Fake exec_prompt. Pops one verdict per call (leader + validator
    each consume one, so tests queue each verdict twice)."""

    def __init__(self, verdicts):
        self.queue = list(verdicts)
        self.calls = []
        self.last = MISS

    def __call__(self, prompt, **kwargs):
        form = "a" if "images" in kwargs else "c"
        self.calls.append(form)
        if self.queue:
            self.last = self.queue.pop(0)
        if isinstance(self.last, Exception):
            raise self.last
        return dict(self.last)


class Address(str):
    pass


def _contract_interface(cls):
    class Wrapper:
        def __init__(self, address):
            self.address = str(address)

        def emit_transfer(self, value):
            TRANSFERS.append((self.address, int(value)))

    return Wrapper


def _write_decorator(f):
    return f


_write_decorator.payable = _write_decorator


def load_contract(web, llm):
    gl = types.SimpleNamespace(
        Contract=object,
        public=types.SimpleNamespace(
            write=_write_decorator,
            view=lambda f: f),
        evm=types.SimpleNamespace(contract_interface=_contract_interface),
        message=types.SimpleNamespace(sender_address="0x0", value=0),
        vm=types.SimpleNamespace(
            Return=Return, UserError=UserError,
            run_nondet_unsafe=_run_nondet_unsafe),
        nondet=types.SimpleNamespace(web=web, exec_prompt=llm))
    fake = types.ModuleType("genlayer")
    fake.gl = gl
    fake.u256 = int
    fake.Address = Address
    sys.modules["genlayer"] = fake
    spec = importlib.util.spec_from_file_location("sketchverdict", CONTRACT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module, gl


def commit(salt, concept):
    return hashlib.sha256((salt + "|" + concept).encode("utf-8")).hexdigest()


def epoch_minute(year, month, day, hour, minute):
    dt = datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
    return int(dt.timestamp()) // 60


class ContractTestCase(unittest.TestCase):
    def setUp(self):
        TRANSFERS.clear()
        self.minute = epoch_minute(2026, 11, 10, 13, 45)
        self.web = FakeWeb(self.minute)
        self.llm = FakeLLM([])
        self.mod, self.gl = load_contract(self.web, self.llm)
        self.c = self.mod.SketchVerdict()
        self.c.__init__()
        self.c.balance = 0

    # -- helpers ---------------------------------------------------------
    def send(self, addr, value=0):
        self.gl.message.sender_address = addr
        self.gl.message.value = value

    def sync_balance(self):
        received = int(self.c.total_received_wei)
        withdrawn = int(self.c.total_withdrawn_wei)
        self.c.balance = received - withdrawn

    def round(self, round_id):
        return json.loads(self.c.get_round(round_id))

    def accounting(self):
        self.sync_balance()
        return json.loads(self.c.get_accounting())

    def start(self, round_id, concept, salt, drawer=DRAWER, stake=10 * GEN,
              draw_min=2, guess_min=5):
        self.send(drawer, stake)
        out = json.loads(self.c.start_round(
            round_id, commit(salt, concept), "test", draw_min, guess_min))
        self.assertTrue(out["accepted"], out)
        return out

    def draw(self, round_id, image="bicycle.png", sha=None, drawer=DRAWER):
        b64 = open(os.path.join(EVIDENCE, image.replace(".png", ".b64"))).read().strip()
        if sha is None:
            sha = hashlib.sha256(open(os.path.join(EVIDENCE, image), "rb").read()).hexdigest()
        self.send(drawer, 0)
        out = json.loads(self.c.submit_drawing(round_id, b64, sha))
        self.assertTrue(out["accepted"], out)
        return out

    def guess(self, round_id, addr, text, stake=5 * GEN):
        self.send(addr, stake)
        return json.loads(self.c.submit_guess(round_id, text))

    def reveal(self, round_id, concept, salt, drawer=DRAWER):
        self.send(drawer, 0)
        return json.loads(self.c.reveal_and_auto_settle(round_id, concept, salt))

    def settle(self, round_id, sender=GUESSER_A):
        self.send(sender, 0)
        return json.loads(self.c.settle(round_id))


class PayableMarkerTest(ContractTestCase):
    def test_payable_methods_marked_payable(self):
        """Regression: on Studionet a value-bearing call to a method
        without @gl.public.write.payable fails at method resolution
        ('called non-payable method ... with non-zero value') and the
        value strands in the contract. The three value-taking entry
        points must carry the marker; withdraw stays plain write."""
        src = open(CONTRACT).read()
        for name in ("start_round", "submit_guess", "challenge"):
            self.assertIn("@gl.public.write.payable\n    def %s(" % name, src)
        for name in ("submit_drawing", "reveal_and_auto_settle", "settle",
                     "trigger_timeout_auto_settle", "withdraw"):
            self.assertIn("@gl.public.write\n    def %s(" % name, src)
            self.assertNotIn("@gl.public.write.payable\n    def %s(" % name, src)


class CodecTest(ContractTestCase):
    def test_sha256_str_vectors(self):
        for text in ["", "abc", "salt|bicycle",
                     "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"]:
            self.assertEqual(self.mod.pure_sha256_hex(text),
                             hashlib.sha256(text.encode("utf-8")).hexdigest())

    def test_sha256_bytes_vectors(self):
        for data in [b"", b"abc",
                     b"abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
                     bytes(range(256)) * 4]:
            self.assertEqual(self.mod.pure_sha256_hex_bytes(data),
                             hashlib.sha256(data).hexdigest())

    def test_sha256_drawing_bytes(self):
        for name, sha in (
                ("bicycle.png", "3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14"),
                ("lighthouse.png", "c06fd82a7430dc0695e01304b2fbe7a56a510b7421e2b69bdca4978d4cc048f3"),
                ("volcano-text.png", "d0da6341b39ca4d868d1f75bb2fbbb525c050a007008ff95881dddbf7c59c666"),
                ("crank.png", "e2bb96fcbb14606c63f77e853c59e160ccd4d196081cd8729e0b95747a53a546")):
            data = open(os.path.join(EVIDENCE, name), "rb").read()
            self.assertEqual(self.mod.pure_sha256_hex_bytes(data),
                             hashlib.sha256(data).hexdigest())
            self.assertEqual(hashlib.sha256(data).hexdigest(), sha)

    def test_b64_roundtrip_random(self):
        rng = random.Random(20261110)
        for n in [0, 1, 2, 3, 4, 5, 100, 1000, 4602, 45021]:
            data = bytes(rng.randrange(256) for _ in range(n))
            enc = self.mod.pure_b64encode(data)
            self.assertEqual(enc, base64.b64encode(data).decode("ascii"))
            self.assertEqual(self.mod.pure_b64decode(enc), data)

    def test_b64_drawings(self):
        for name in ("bicycle.png", "lighthouse.png", "volcano-text.png", "crank.png"):
            data = open(os.path.join(EVIDENCE, name), "rb").read()
            b64 = open(os.path.join(EVIDENCE, name.replace(".png", ".b64"))).read().strip()
            self.assertEqual(self.mod.pure_b64encode(data), b64)
            self.assertEqual(self.mod.pure_b64decode(b64), data)

    def test_normalize_and_commit(self):
        self.assertEqual(self.mod._normalize("  Bicycle  "), "bicycle")
        self.assertEqual(self.mod._normalize("LIGHT  HOUSE"), "light house")
        self.assertEqual(self.mod._normalize("Bi-Cycle!"), "bicycle")
        self.assertEqual(self.mod._normalize("  "), "")
        good = commit("s3cr3t", "bicycle")
        self.assertEqual(
            self.mod.pure_sha256_hex("s3cr3t|bicycle"), good)
        self.assertNotEqual(
            self.mod.pure_sha256_hex("wrong|bicycle"), good)
        self.assertNotEqual(
            self.mod.pure_sha256_hex("s3cr3t|car"), good)

    def test_parse_verdict(self):
        self.assertEqual(self.mod._parse_verdict(MATCHES), MATCHES)
        self.assertEqual(
            self.mod._parse_verdict('```json\n{"has_written_text_cheat": "YES", '
                                    '"visual_depiction_tier": "MISS"}\n```'),
            {"has_written_text_cheat": "YES",
             "visual_depiction_tier": "MISS"})
        for bad in [{}, {"has_written_text_cheat": "NO"},
                    {"has_written_text_cheat": "MAYBE",
                     "visual_depiction_tier": "MATCHES"},
                    {"has_written_text_cheat": "NO",
                     "visual_depiction_tier": "GOOD"},
                    "not json", 42]:
            with self.assertRaises(ValueError, msg=str(bad)):
                self.mod._parse_verdict(bad)


class AllocationTest(ContractTestCase):
    def test_six_branch_matrix(self):
        pot = 25 * GEN
        drawer, each, roll = self.mod._allocate("DRAWING_MATCHES", 2, pot)
        self.assertEqual((drawer, each, roll),
                         (pot * 50 // 100, (pot * 50 // 100) // 2,
                          pot - pot * 50 // 100 - ((pot * 50 // 100) // 2) * 2))
        self.assertEqual(self.mod._allocate("DRAWING_MATCHES", 0, pot),
                         (0, 0, pot))
        drawer, each, roll = self.mod._allocate("DRAWING_WEAK", 2, 20 * GEN)
        self.assertEqual((drawer, each, roll), (5 * GEN, 5 * GEN // 2, 10 * GEN))
        self.assertEqual(self.mod._allocate("DRAWING_WEAK", 0, pot), (0, 0, pot))
        self.assertEqual(self.mod._allocate("DRAWING_MISS", 1, pot), (0, 0, pot))
        self.assertEqual(self.mod._allocate("DRAWING_MISS", 0, pot), (0, 0, pot))

    def test_odd_wei_conservation(self):
        pot = 1000000000000000003
        for verdict, correct in (("DRAWING_MATCHES", 1), ("DRAWING_MATCHES", 3),
                                 ("DRAWING_WEAK", 1), ("DRAWING_WEAK", 2),
                                 ("DRAWING_MISS", 0), ("DRAWING_MISS", 2)):
            drawer, each, roll = self.mod._allocate(verdict, correct, pot)
            self.assertEqual(drawer + each * correct + roll, pot,
                             (verdict, correct))
        drawer, each, roll = self.mod._allocate("DRAWING_MATCHES", 1, pot)
        self.assertEqual((drawer, each, roll),
                         (500000000000000001, 500000000000000001, 1))


class TimeTest(ContractTestCase):
    def test_days_from_civil(self):
        for y, mo, d, h, mi in ((1970, 1, 1, 0, 0), (2026, 11, 10, 13, 45),
                                (2000, 2, 29, 12, 0), (2024, 2, 29, 23, 59)):
            got = self.mod._days_from_civil(y, mo, d) * 1440 + h * 60 + mi
            want = int(datetime(y, mo, d, h, mi, tzinfo=timezone.utc).timestamp()) // 60
            self.assertEqual(got, want)

    def test_fetch_primary(self):
        self.assertEqual(self.mod._fetch_current_utc_minute(), self.minute)

    def test_fetch_falls_back_to_backup(self):
        self.web.primary_fail = True
        self.assertEqual(self.mod._fetch_current_utc_minute(), self.minute)

    def test_fetch_both_down_returns_none(self):
        self.web.primary_down = True
        # backup also down: point the fake at a raising web for backup
        orig = self.web.request

        def flaky(url, method="GET"):
            if "worldtimeapi" in url:
                raise ConnectionError("backup down")
            return orig(url, method)
        self.web.request = flaky
        self.assertIsNone(self.mod._fetch_current_utc_minute())


class FlowTest(ContractTestCase):
    def test_full_matches_flow_with_negatives(self):
        # R1: bicycle MATCHES, A wrong, B correct seq 2, C correct seq 3.
        self.llm.queue = [MATCHES, MATCHES]
        self.start("R1", "bicycle", "salt-r1")
        # non-drawer cannot submit the drawing
        self.send(GUESSER_A, 0)
        with self.assertRaises(UserError):
            self.c.submit_drawing("R1", "AAAA", "0" * 64)
        self.draw("R1")
        # drawer self-guess rejected + refunded
        out = self.guess("R1", DRAWER, "bicycle")
        self.assertFalse(out["accepted"])
        self.assertEqual(out["reason"], "drawer_self_guess")
        self.assertEqual(out["refunded_credit_wei"], str(5 * GEN))
        # guesses
        self.assertTrue(self.guess("R1", GUESSER_A, "car")["accepted"])
        self.assertTrue(self.guess("R1", GUESSER_B, "Bicycle")["accepted"])
        self.assertTrue(self.guess("R1", GUESSER_C, " bicycle ")["accepted"])
        # duplicate guess rejected + refunded
        out = self.guess("R1", GUESSER_A, "bicycle")
        self.assertFalse(out["accepted"])
        self.assertEqual(out["reason"], "duplicate_guess")
        # second submit_drawing after GUESSING: witness, no overwrite
        b64 = open(os.path.join(EVIDENCE, "crank.b64")).read().strip()
        self.send(DRAWER, 0)
        out = json.loads(self.c.submit_drawing("R1", b64, "e" * 64))
        self.assertFalse(out["accepted"])
        self.assertTrue(out["conflict_recorded"])
        self.assertEqual(
            self.round("R1")["image_sha256"],
            "3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14")
        # non-drawer reveal raises
        self.send(GUESSER_A, 0)
        with self.assertRaises(UserError):
            self.c.reveal_and_auto_settle("R1", "bicycle", "salt-r1")
        # wrong salt: COMMIT_MISMATCH, stays GUESSING
        self.send(DRAWER, 0)
        with self.assertRaisesRegex(UserError, "COMMIT_MISMATCH"):
            self.c.reveal_and_auto_settle("R1", "bicycle", "wrong-salt")
        self.assertEqual(self.round("R1")["status"], "GUESSING")
        # correct reveal
        out = self.reveal("R1", "bicycle", "salt-r1")
        self.assertEqual(out["drawing_verdict"], "DRAWING_MATCHES")
        self.assertEqual(out["reason_code"], "VISUAL_MATCH_CONFIRMED")
        self.assertEqual(out["correct_guessers"], [GUESSER_B, GUESSER_C])
        self.assertEqual(out["fastest_guesser"], GUESSER_B)
        self.assertEqual(self.round("R1")["status"], "JUDGED")
        # settle inside the window raises
        self.send(GUESSER_A, 0)
        with self.assertRaisesRegex(UserError, "challenge_window_open"):
            self.c.settle("R1")
        # advance past the 10-minute window, settle
        self.web.minute = self.minute + 11
        out = self.settle("R1")
        pot = 25 * GEN
        self.assertEqual(out["total_pot_wei"], str(pot))
        self.assertEqual(out["drawer_payout_wei"], str(pot * 50 // 100))
        self.assertEqual(out["guesser_payouts"],
                         {GUESSER_B: str((pot * 50 // 100) // 2),
                          GUESSER_C: str((pot * 50 // 100) // 2)})
        self.assertEqual(out["next_rollover_pool_wei"], "0")
        stats_b = json.loads(self.c.get_player_stats(GUESSER_B))
        self.assertEqual(stats_b["score"], 100)
        stats_c = json.loads(self.c.get_player_stats(GUESSER_C))
        self.assertEqual(stats_c["score"], 30)
        stats_d = json.loads(self.c.get_player_stats(DRAWER))
        self.assertEqual(stats_d["score"], 100)
        # re-reveal on SETTLED: witness, no overwrite
        self.send(DRAWER, 0)
        out = json.loads(self.c.reveal_and_auto_settle("R1", "bicycle", "salt-r1"))
        self.assertFalse(out["accepted"])
        self.assertTrue(out["conflict_recorded"])
        self.assertEqual(self.round("R1")["drawing_verdict"], "DRAWING_MATCHES")
        # duplicate round_id start: witness + refund
        self.send(DRAWER, 10 * GEN)
        out = json.loads(self.c.start_round(
            "R1", commit("x", "y"), "test", 2, 5))
        self.assertFalse(out["accepted"])
        self.assertEqual(out["reason"], "duplicate_round_id")
        self.assertTrue(out["conflict_recorded"])
        # accounting invariant holds throughout
        acc = self.accounting()
        self.assertTrue(acc["invariant_ok"], acc)
        self.assertTrue(acc["balance_matches_accounted"], acc)

    def test_weak_flow_and_piggyback_settle(self):
        self.llm.queue = [WEAK, WEAK]
        self.start("R1", "lighthouse", "s1")
        self.draw("R1", "lighthouse.png")
        self.assertTrue(self.guess("R1", GUESSER_A, "lighthouse")["accepted"])
        self.assertTrue(self.guess("R1", GUESSER_B, "LIGHTHOUSE")["accepted"])
        out = self.reveal("R1", "lighthouse", "s1")
        self.assertEqual(out["drawing_verdict"], "DRAWING_WEAK")
        self.web.minute = self.minute + 11
        # next start_round piggybacks the settle
        self.llm.queue = []
        out = self.start("R2", "bicycle", "s2")
        self.assertEqual(out["piggyback_settled_round"], "R1")
        settled = out["piggyback_settlement"]
        self.assertEqual(settled["total_pot_wei"], str(20 * GEN))
        self.assertEqual(settled["drawer_payout_wei"], str(5 * GEN))
        self.assertEqual(settled["next_rollover_pool_wei"], str(10 * GEN))
        self.assertEqual(self.round("R1")["status"], "SETTLED")
        self.assertEqual(self.round("R2")["status"], "DRAWING")
        self.assertTrue(self.accounting()["invariant_ok"])

    def test_cheat_miss_and_unrelated_miss(self):
        # R3 volcano text cheat: accomplice correct first, still 0.
        self.llm.queue = [CHEAT, CHEAT]
        self.start("R1", "volcano", "s1")
        self.draw("R1", "volcano-text.png")
        self.assertTrue(self.guess("R1", GUESSER_A, "volcano")["accepted"])
        out = self.reveal("R1", "volcano", "s1")
        self.assertEqual(out["drawing_verdict"], "DRAWING_MISS")
        self.assertEqual(out["reason_code"], "TEXT_CHEAT_DETECTED")
        self.web.minute = self.minute + 11
        out = self.settle("R1")
        self.assertEqual(out["drawer_payout_wei"], "0")
        # correct guesser is listed with an explicit 0 payout
        self.assertEqual(out["guesser_payouts"], {GUESSER_A: "0"})
        self.assertEqual(out["next_rollover_pool_wei"], str(15 * GEN))
        # R4 guitar + crank image: jury MISS.
        self.llm.queue = [MISS, MISS]
        self.start("R2", "guitar", "s2")
        self.draw("R2", "crank.png")
        self.assertTrue(self.guess("R2", GUESSER_A, "tree")["accepted"])
        out = self.reveal("R2", "guitar", "s2")
        self.assertEqual(out["drawing_verdict"], "DRAWING_MISS")
        self.assertEqual(out["reason_code"], "VISUAL_MISS")
        self.assertTrue(self.accounting()["invariant_ok"])


class ChallengeTest(ContractTestCase):
    def _judged_mismatch_round(self):
        """Round with a deliberately WRONG locked hash -> MISS."""
        self.llm.queue = []
        self.start("R1", "bicycle", "s1")
        self.draw("R1", "bicycle.png", sha="0" * 64)
        self.assertTrue(self.guess("R1", GUESSER_B, "bicycle")["accepted"])
        out = self.reveal("R1", "bicycle", "s1")
        self.assertEqual(out["drawing_verdict"], "DRAWING_MISS")
        self.assertEqual(out["reason_code"], "IMAGE_HASH_MISMATCH")
        return out

    def test_challenge_wrong_hash_forfeits(self):
        self._judged_mismatch_round()
        self.send(CHALLENGER, 5 * GEN)
        out = json.loads(self.c.challenge("R1", "f" * 64))
        self.assertTrue(out["accepted"])
        self.assertEqual(out["challenge_outcome"], "CHALLENGE_FAILED_WRONG_HASH")
        self.assertEqual(out["deposit"], "forfeited_to_rollover")
        self.assertEqual(out["verdict"], "DRAWING_MISS")
        self.assertEqual(self.round("R1")["image_sha256"], "0" * 64)
        # deposit landed in the rollover pool
        room = json.loads(self.c.get_room_state())
        self.assertEqual(room["rollover_pool_wei"], str(5 * GEN))
        # second challenge blocked (first did not flip)
        self.send(CHALLENGER, 5 * GEN)
        out = json.loads(self.c.challenge("R1", "f" * 64))
        self.assertFalse(out["accepted"])
        self.assertEqual(out["reason"], "challenge_not_allowed")
        self.assertEqual(out["refunded_credit_wei"], str(5 * GEN))

    def test_challenge_flip_with_true_hash(self):
        self._judged_mismatch_round()
        true_sha = "3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14"
        self.llm.queue = [MATCHES, MATCHES]
        self.send(CHALLENGER, 5 * GEN)
        out = json.loads(self.c.challenge("R1", true_sha))
        self.assertTrue(out["accepted"])
        self.assertEqual(out["challenge_outcome"], "CHALLENGE_SUCCEEDED_FLIP")
        self.assertEqual(out["deposit"], "refunded")
        self.assertEqual(out["verdict"], "DRAWING_MATCHES")
        self.assertEqual(out["reason_code"], "VISUAL_MATCH_CONFIRMED")
        self.assertEqual(self.round("R1")["image_sha256"], true_sha)
        # deposit refunded as a withdrawable credit
        stats = json.loads(self.c.get_player_stats(CHALLENGER))
        self.assertEqual(stats["balance_wei"], str(5 * GEN))
        # second challenge allowed after a flip: second opinion stands
        self.llm.queue = [MATCHES, MATCHES]
        self.send(GUESSER_A, 5 * GEN)
        out = json.loads(self.c.challenge("R1", true_sha))
        self.assertEqual(out["challenge_outcome"], "CHALLENGE_FAILED_SAME_VERDICT")
        self.assertEqual(out["deposit"], "forfeited_to_rollover")
        # settle splits 50/50; forfeited 5 GEN is inside the pot
        self.web.minute = self.minute + 11
        out = self.settle("R1")
        pot = 5 * GEN + 10 * GEN + 5 * GEN  # forfeit + drawer + guesser
        self.assertEqual(out["total_pot_wei"], str(pot))
        self.assertEqual(out["drawer_payout_wei"], str(pot * 50 // 100))
        self.assertEqual(out["guesser_payouts"], {GUESSER_B: str(pot * 50 // 100)})
        self.assertEqual(out["next_rollover_pool_wei"], "0")
        self.assertTrue(self.accounting()["invariant_ok"])

    def test_challenge_second_opinion_flip(self):
        self.llm.queue = [MATCHES, MATCHES]
        self.start("R1", "bicycle", "s1")
        self.draw("R1")
        self.assertTrue(self.guess("R1", GUESSER_B, "bicycle")["accepted"])
        out = self.reveal("R1", "bicycle", "s1")
        self.assertEqual(out["drawing_verdict"], "DRAWING_MATCHES")
        # second opinion: jury now says WEAK -> flips, refund
        true_sha = "3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14"
        self.llm.queue = [WEAK, WEAK]
        self.send(CHALLENGER, 5 * GEN)
        out = json.loads(self.c.challenge("R1", true_sha))
        self.assertEqual(out["challenge_outcome"], "CHALLENGE_SUCCEEDED_FLIP")
        self.assertEqual(out["verdict"], "DRAWING_WEAK")
        self.assertEqual(out["deposit"], "refunded")
        # second challenge allowed after a flip: jury stands -> forfeit
        self.llm.queue = [WEAK, WEAK]
        self.send(GUESSER_A, 5 * GEN)
        out = json.loads(self.c.challenge("R1", true_sha))
        self.assertTrue(out["accepted"])
        self.assertEqual(out["challenge_outcome"], "CHALLENGE_FAILED_SAME_VERDICT")
        self.assertEqual(out["deposit"], "forfeited_to_rollover")
        # third challenge blocked (only one re-challenge after a flip)
        self.llm.queue = [WEAK, WEAK]
        self.send(GUESSER_B, 5 * GEN)
        out = json.loads(self.c.challenge("R1", true_sha))
        self.assertFalse(out["accepted"])
        self.assertEqual(out["reason"], "challenge_not_allowed")
        self.assertEqual(out["refunded_credit_wei"], str(5 * GEN))


class TimeoutTest(ContractTestCase):
    def test_drawing_timeout(self):
        self.start("R1", "bicycle", "s1", draw_min=1)
        # too early: the drawer (only participant so far) is refused
        self.send(DRAWER, 0)
        with self.assertRaisesRegex(UserError, "drawing_deadline_not_passed"):
            self.c.trigger_timeout_auto_settle("R1")
        # non-participant cannot trigger even after the deadline
        self.web.minute = self.minute + 2
        self.send(CHALLENGER, 0)
        with self.assertRaisesRegex(UserError, "not_a_participant"):
            self.c.trigger_timeout_auto_settle("R1")
        self.send(DRAWER, 0)
        out = json.loads(self.c.trigger_timeout_auto_settle("R1"))
        self.assertEqual(out["reason_code"], "DRAWER_DRAWING_TIMEOUT")
        self.assertEqual(out["timeout_forfeited_wei"], str(10 * GEN))
        self.assertEqual(out["next_rollover_pool_wei"], str(10 * GEN))
        self.assertEqual(self.round("R1")["status"], "SETTLED")
        self.assertTrue(self.accounting()["invariant_ok"])

    def test_reveal_timeout_refunds_guessers(self):
        self.start("R1", "bicycle", "s1", guess_min=1)
        self.draw("R1")
        self.assertTrue(self.guess("R1", GUESSER_A, "car")["accepted"])
        self.assertTrue(self.guess("R1", GUESSER_B, "bicycle")["accepted"])
        self.web.minute = self.minute + 2
        self.send(GUESSER_A, 0)
        out = json.loads(self.c.trigger_timeout_auto_settle("R1"))
        self.assertEqual(out["reason_code"], "DRAWER_REVEAL_TIMEOUT")
        self.assertEqual(out["guesser_refunds_wei"],
                         {GUESSER_A: str(5 * GEN), GUESSER_B: str(5 * GEN)})
        self.assertEqual(out["next_rollover_pool_wei"], str(10 * GEN))
        stats = json.loads(self.c.get_player_stats(GUESSER_A))
        self.assertEqual(stats["balance_wei"], str(5 * GEN))
        self.assertTrue(self.accounting()["invariant_ok"])


class WithdrawTest(ContractTestCase):
    def test_withdraw_and_zero_balance(self):
        self.llm.queue = [MATCHES, MATCHES]
        self.start("R1", "bicycle", "s1")
        self.draw("R1")
        self.assertTrue(self.guess("R1", GUESSER_B, "bicycle")["accepted"])
        self.reveal("R1", "bicycle", "s1")
        self.web.minute = self.minute + 11
        self.settle("R1")
        # drawer withdraws 7.5 GEN (15 GEN pot, MATCHES 50%)
        self.send(DRAWER, 0)
        out = json.loads(self.c.withdraw())
        self.assertEqual(out["withdrawn_wei"], str(75 * GEN // 10))
        self.assertEqual(TRANSFERS, [(DRAWER, 75 * GEN // 10)])
        stats = json.loads(self.c.get_player_stats(DRAWER))
        self.assertEqual(stats["balance_wei"], "0")
        # second withdraw: zero balance raises
        with self.assertRaisesRegex(UserError, "no_credit_to_withdraw"):
            self.c.withdraw()
        self.assertTrue(self.accounting()["invariant_ok"])

    def test_failed_payable_never_strands_value(self):
        # start with a bad commit: the 10 GEN comes back as credit.
        self.send(DRAWER, 10 * GEN)
        out = json.loads(self.c.start_round("R1", "not-a-hash", "t", 2, 5))
        self.assertFalse(out["accepted"])
        self.assertEqual(out["refunded_credit_wei"], str(10 * GEN))
        stats = json.loads(self.c.get_player_stats(DRAWER))
        self.assertEqual(stats["balance_wei"], str(10 * GEN))
        acc = self.accounting()
        self.assertTrue(acc["invariant_ok"], acc)


if __name__ == "__main__":
    unittest.main(verbosity=2)
