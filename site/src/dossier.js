// Round dossier builder (pure function — no DOM, no network).
// Gate 11: the dossier is assembled ONLY from a FINALIZED get_round readback.
// The first line enforces the gate; anything else throws.
export function verdictClass(round) {
  const v = round.drawing_verdict;
  const correct = (round.correct_guessers || []).length;
  if (v === 'DRAWING_MATCHES' && correct >= 1) return 'FULL_MATCH_SETTLED';
  if (v === 'DRAWING_MATCHES' && correct === 0) return 'PARTIAL_UNGUESSED_ZERO_PAYOUT';
  if (v === 'DRAWING_WEAK' && correct >= 1) return 'PARTIAL_WEAK_HALF_ROLLOVER';
  if (v === 'DRAWING_WEAK' && correct === 0) return 'PARTIAL_WEAK_ZERO_PAYOUT';
  if (v === 'DRAWING_MISS') return 'REJECTED_DRAWING_MISS';
  return 'UNCONFIRMED';
}

// tone: 'teal' only for a full match with >= 1 correct guesser.
// PARTIAL branches (WEAK or unguessed) are always 'amber', never teal.
// MISS is 'crimson'. Anything unconfirmed is 'navy'.
export function verdictTone(round) {
  const v = round.drawing_verdict;
  const correct = (round.correct_guessers || []).length;
  if (v === 'DRAWING_MATCHES' && correct >= 1) return 'teal';
  if (v === 'DRAWING_MATCHES' || v === 'DRAWING_WEAK') return 'amber';
  if (v === 'DRAWING_MISS') return 'crimson';
  return 'navy';
}

export function buildDossier(round, readback) {
  if (!readback || readback.finalized !== true || !round || round.status !== 'SETTLED') {
    throw new Error('Export blocked: awaiting FINALIZED on-chain readback');
  }
  const vc = verdictClass(round);
  if (vc === 'UNCONFIRMED') {
    throw new Error('Export blocked: awaiting FINALIZED on-chain readback');
  }
  // Echo readback fields verbatim — never recompute money or scores locally.
  return {
    dossier_version: 'sketchverdict-dossier-1',
    contract: readback.contract_address,
    source_sha256: readback.source_sha256,
    readback_finalized_at: readback.readback_at,
    round_id: round.round_id,
    drawer: round.drawer,
    concept_commit: round.concept_commit,
    category_hint: round.category_hint,
    status: round.status,
    revealed_concept: round.revealed_concept,
    has_written_text_cheat: round.has_written_text_cheat,
    visual_depiction_tier: round.visual_depiction_tier,
    drawing_verdict: round.drawing_verdict,
    reason_code: round.reason_code,
    verdict_class: vc,
    image_sha256: round.image_sha256,
    image_byte_len: round.image_byte_len,
    guesses: round.guesses,
    correct_guessers: round.correct_guessers,
    fastest_guesser: round.fastest_guesser,
    total_pot_wei: round.total_pot_wei,
    drawer_payout_wei: round.drawer_payout_wei,
    guesser_payouts: round.guesser_payouts,
    next_rollover_pool_wei: round.next_rollover_pool_wei,
    challenges: round.challenges,
    settled_by: round.settled_by,
  };
}
