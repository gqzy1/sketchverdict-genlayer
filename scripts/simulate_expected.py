"""Simulate the P12 evidence plan (R1-R9 + R11) with exact integer
math, independently of the contract, to produce the numbers that
EXPECTED.md pre-registers. Run: python3 scripts/simulate_expected.py
"""
GEN = 10 ** 18


def allocate(verdict, correct_count, total_pot):
    if verdict == "DRAWING_MATCHES" and correct_count >= 1:
        drawer = total_pot * 50 // 100
        pot = total_pot * 50 // 100
        each = pot // correct_count
        return drawer, each, total_pot - drawer - each * correct_count
    if verdict == "DRAWING_WEAK" and correct_count >= 1:
        drawer = total_pot * 25 // 100
        pot = total_pot * 25 // 100
        each = pot // correct_count
        return drawer, each, total_pot - drawer - each * correct_count
    return 0, 0, total_pot


def fmt(w):
    return "%d (%s GEN)" % (w, w / GEN if w % GEN == 0 else str(w) + " wei")


def main():
    rollover = 0
    credits = {}
    scores = {}
    received = 0

    def credit(addr, amount):
        credits[addr] = credits.get(addr, 0) + amount

    def score(addr, delta):
        scores[addr] = scores.get(addr, 0) + delta

    def settle(rid, verdict, drawer, drawer_stake, guessers):
        """guessers: list of (addr, stake, correct_bool)."""
        nonlocal rollover, received
        pot = rollover + drawer_stake + sum(s for _, s, _ in guessers)
        correct = [a for a, _, ok in guessers if ok]
        fastest = correct[0] if correct else ""
        d_pay, each, rollover = allocate(verdict, len(correct), pot)
        payouts = {}
        for a in correct:
            payouts[a] = each
            credit(a, each)
        credit(drawer, d_pay)
        if verdict == "DRAWING_MATCHES" and correct:
            score(drawer, 100)
            for a in correct:
                score(a, 100 if a == fastest else 30)
        elif verdict == "DRAWING_WEAK" and correct:
            score(drawer, 40)
            for a in correct:
                score(a, 50)
        print("%s %s pot=%s drawer=%s guessers=%s rollover=%s" % (
            rid, verdict, fmt(pot), fmt(d_pay),
            {a: fmt(v) for a, v in payouts.items()}, fmt(rollover)))
        return pot, d_pay, payouts

    # R1 CASE-1 bicycle MATCHES (A wrong, B seq2, C seq3) + negatives
    received += 10 * GEN + 5 * GEN + 15 * GEN + 5 * GEN + 10 * GEN
    credit("DRAWER", 5 * GEN)   # self-guess rejected, refunded
    credit("A", 5 * GEN)        # duplicate guess rejected, refunded
    credit("DRAWER", 10 * GEN)  # duplicate round_id start, refunded
    settle("R1", "DRAWING_MATCHES", "DRAWER", 10 * GEN,
           [("A", 5 * GEN, False), ("B", 5 * GEN, True), ("C", 5 * GEN, True)])
    # R2 CASE-2 as-run: the jury returned DRAWING_MATCHES, not the
    # pre-registered WEAK (drawing too recognizable: tower + lamp room
    # + cap). Recorded as-is; the WEAK branch is demonstrated by R2b.
    received += 20 * GEN
    settle("R2", "DRAWING_MATCHES", "DRAWER", 10 * GEN,
           [("A", 5 * GEN, True), ("B", 5 * GEN, True)])
    # R2b: vaguer lighthouse (bare tapered tower, railing ticks, no lamp
    # room / cap / ground line), pre-registered WEAK.
    received += 20 * GEN
    settle("R2b", "DRAWING_WEAK", "DRAWER", 10 * GEN,
           [("A", 5 * GEN, True), ("B", 5 * GEN, True)])
    # R3 CASE-3 volcano text cheat, accomplice A correct first -> 0
    received += 15 * GEN
    settle("R3", "DRAWING_MISS", "DRAWER", 10 * GEN, [("A", 5 * GEN, True)])
    # R4 CASE-4 guitar + crank image -> MISS
    received += 15 * GEN
    settle("R4", "DRAWING_MISS", "DRAWER", 10 * GEN, [("A", 5 * GEN, False)])
    # R5 challenge flip: wrong lock -> MISS, challenge true hash -> MATCHES
    received += 10 * GEN + 5 * GEN + 5 * GEN
    credit("CH", 5 * GEN)  # challenge deposit refunded on flip
    settle("R5", "DRAWING_MATCHES", "DRAWER", 10 * GEN, [("B", 5 * GEN, True)])
    # R6 challenge fails: wrong hash -> 5 GEN forfeits to rollover.
    # A second challenge attempt (first did not flip) is rejected and
    # its 5 GEN deposit is credited back to CH.
    received += 10 * GEN + 5 * GEN + 5 * GEN + 5 * GEN
    credit("CH", 5 * GEN)
    rollover += 5 * GEN
    settle("R6", "DRAWING_MATCHES", "DRAWER", 10 * GEN, [("B", 5 * GEN, True)])
    # R7 drawing timeout: drawer stake -> rollover
    received += 10 * GEN
    rollover += 10 * GEN
    print("R7 DRAWER_DRAWING_TIMEOUT rollover=%s" % fmt(rollover))
    # R8 reveal timeout: drawer stake -> rollover, guessers refunded
    received += 20 * GEN
    rollover += 10 * GEN
    credit("A", 5 * GEN)
    credit("B", 5 * GEN)
    print("R8 DRAWER_REVEAL_TIMEOUT rollover=%s refunds A/B 5 GEN" % fmt(rollover))
    # R9 odd-wei pot
    received += 1000000000000000001 + 5 * GEN
    settle("R9", "DRAWING_MATCHES", "DRAWER", 1000000000000000001,
           [("B", 5 * GEN, True)])
    # R11 withdrawals
    wd_drawer = credits["DRAWER"]
    wd_b = credits["B"]
    withdrawn = wd_drawer + wd_b
    remaining = sum(credits.values()) - withdrawn
    print("credits: {%s}" % ", ".join(
        "%s: %s" % (k, fmt(v)) for k, v in sorted(credits.items())))
    print("scores: {%s}" % ", ".join(
        "%s: %d" % (k, v) for k, v in sorted(scores.items())))
    print("R11 withdraw DRAWER %s, B %s" % (fmt(wd_drawer), fmt(wd_b)))
    print("total_received=%s" % fmt(received))
    print("withdrawn=%s remaining_credits=%s rollover=%s" % (
        fmt(withdrawn), fmt(remaining), fmt(rollover)))
    accounted = withdrawn + remaining + rollover
    print("invariant: received == withdrawn + credits + rollover -> %s == %s : %s"
          % (fmt(received), fmt(accounted), received == accounted))
    assert received == accounted


if __name__ == "__main__":
    main()
