// SketchVerdict — game-room frontend (P12).
// Display rule (Gate 11): every displayed or exported value comes from a
// FINALIZED get_* readback snapshot. Before a readback, fields show
// "Unconfirmed" and never a value, verdict, or payout. No seed data and no
// local simulation feeds any display, export, score, or payout field.
// Drawings are stored on-chain as base64 PNG bytes; no URLs anywhere in the
// contract flow. The drawer vault (concept + salt) lives only in this
// browser session's memory and never leaves it except as the reveal preimage.
import { createAccount, abi } from 'genlayer-js';
import { encodeFunctionData } from 'viem';
import { studionet } from 'genlayer-js/chains';
import { t } from './i18n.js';
import { buildDossier, verdictClass, verdictTone } from './dossier.js';
import { EVIDENCE_DATA } from './evidence-data.js';

const RPC_URL = 'https://studio.genlayer.com/api';
const CHAIN_ID = 61999;
const CONTRACT_ADDRESS = '0x56C85764c91F439185f446e019BB70A877458b54';
const SOURCE_SHA256 = '0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47';
const EXPLORER = 'https://explorer-studio.genlayer.com';
const GEN = 10n ** 18n;
const CANVAS_SIZE = 384;
const INK_COLORS = ['#111927', '#1D4ED8', '#0F766E', '#B45309', '#B91C1C'];
const PAPER = '#F4F6FA';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { calldata, transactions } = abi;

let lang = localStorage.getItem('sv-lang') || 'zh';
let view = 'human';
let staticMode = new URLSearchParams(location.search).has('static')
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let snapshot = null; // { room, round, gallery, galleryRounds, stats, finalized, readAt, readBackAt } or null —
// `finalized` is threaded up from readFinal's stamps only, never written here.
// Gate 11: NO verdict claim, amount, score or round state may render until
// a FINALIZED readback has completed. Every render function gates on
// readbackOk() — snapshot truthiness alone is never enough.
const readbackOk = () => snapshot?.finalized === true;
let readingBack = false;
let wallet = null; // { kind: 'injected'|'temp', address, label }
let tempAccount = null; // in-memory only; never serialized or stored
let vault = null; // { roundId, concept, salt } — memory only, never leaves the browser except as reveal preimage
let currentRoundId = '';
let autoRevealFired = {}; // roundId -> true (fire the auto-reveal trigger once)
let expandedGallery = new Set();
let galleryTab = 'gallery'; // 'gallery' | 'evidence'
let utcMinuteOffset = 0; // local clock fallback offset, unused unless timeapi fails

const chain = { ...studionet, rpcUrls: { default: { http: [RPC_URL] } } };

function esc(v) {
  return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
function shortAddr(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : t(lang, 'unconfirmed'); }
function normalizeConcept(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');
}
function fmtGen(weiStr) {
  try {
    const w = BigInt(weiStr ?? '0');
    const neg = w < 0n;
    const abs = neg ? -w : w;
    const whole = abs / GEN;
    const frac = abs % GEN;
    const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '').slice(0, 6);
    return `${neg ? '-' : ''}${whole}${fracStr ? '.' + fracStr : ''} GEN`;
  } catch { return t(lang, 'unconfirmed'); }
}
function fmtWei(weiStr) { try { return BigInt(weiStr ?? '0').toString() + ' wei'; } catch { return '—'; } }
function fmtGenExact(weiStr) {
  // Like fmtGen, but a sub-6-decimal remainder is shown as "+ N wei"
  // instead of being silently truncated — an odd-wei pot (e.g. R9's
  // 26 GEN + 1 wei) must never read as a round number.
  try {
    const w = BigInt(weiStr ?? '0');
    const sub = (w < 0n ? -w : w) % GEN % (10n ** 12n);
    if (sub === 0n) return fmtGen(weiStr);
    const neg = w < 0n ? '-' : '';
    const whole = (w < 0n ? -w : w) / GEN;
    return whole === 0n ? `${neg}${sub} wei` : `${neg}${whole} GEN + ${sub} wei`;
  } catch { return t(lang, 'unconfirmed'); }
}
async function sha256Hex(bytes) {
  const d = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function b64encode(bytes) {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}
function b64decode(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function utcMinuteNow() {
  try {
    const r = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    return Math.floor(new Date(j.dateTime + 'Z').getTime() / 60000);
  } catch {
    return Math.floor(Date.now() / 60000) + utcMinuteOffset;
  }
}
function minuteToUTC(minStr) {
  const m = parseInt(minStr, 10);
  if (!Number.isFinite(m)) return t(lang, 'unconfirmed');
  return new Date(m * 60000).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

// ------------------------------------------------------------------
// Chain reads (fetch-based gen_call, latest-final, with retries).
// ------------------------------------------------------------------
function encoded(method, args = []) {
  return transactions.serialize([calldata.encode(calldata.makeCalldataObject(method, args, {})), false]);
}
async function rpcCall(method, params = []) {
  // A hanging call used to stall the whole refresh for minutes: 60s
  // timeout x 6 attempts with backoff to 30s. The RPC answers in <1s
  // when healthy (curl 0.87s), so 20s is 20x headroom and 4 attempts
  // bound one bad call to ~100s worst case (4x20s + 3s/6s/12s backoff)
  // instead of several minutes — fast enough for the whole-refresh
  // retry to actually engage instead of never firing.
  for (let attempt = 0; attempt < 4; attempt++) {
    let res;
    try {
      res = await fetch(RPC_URL, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
        signal: AbortSignal.timeout(20000),
      });
    } catch { await sleep(3000 * (2 ** attempt)); continue; }
    if (!res.ok) { await sleep(3000 * (2 ** attempt)); continue; }
    let body;
    try { body = await res.json(); } catch { await sleep(3000 * (2 ** attempt)); continue; }
    if (body.error) throw new Error(body.error.message || JSON.stringify(body.error));
    return body.result;
  }
  throw new Error('RPC_RETRY_EXHAUSTED');
}
async function readFinal(functionName, args = []) {
  const result = await rpcCall('gen_call', [{
    type: 'read', to: CONTRACT_ADDRESS,
    from: '0x0000000000000000000000000000000000000000',
    data: encoded(functionName, args),
    transaction_hash_variant: 'latest-final',
  }]);
  if (result && typeof result === 'object' && result.status && result.status.code !== 0) {
    throw new Error(result.status.message);
  }
  const hex = typeof result === 'string' ? result : result?.data;
  if (typeof hex !== 'string') throw new Error('INVALID_READ_RESULT');
  const plain = hex.startsWith('0x') ? hex.slice(2) : hex;
  const value = calldata.decode(Uint8Array.from(plain.match(/../g) || [], (x) => parseInt(x, 16)));
  // Gate 11: this return is the SOLE place in the frontend that stamps the
  // finalized flag, immediately after a latest-final gen_call succeeds.
  // Every downstream consumer (readJson, the snapshot, the dossier export)
  // threads this flag through and never writes it itself, so a future
  // read-variant change cannot silently feed non-final data to the export.
  return { value, finalized: true, readAt: new Date().toISOString() };
}
async function readJson(functionName, args = []) {
  // Threads readFinal's envelope through untouched: decoded JSON in `data`,
  // the finalized flag and readAt passed along as produced. This function
  // never stamps or synthesizes the flag itself.
  const r = await readFinal(functionName, args);
  return { data: r.value === '' ? null : JSON.parse(r.value), finalized: r.finalized, readAt: r.readAt };
}

// Readback resilience: one refresh is ~13 sequential latest-final calls
// and a shared-egress RPC can fail a whole attempt (observed twice in a
// live browser: RPC_RETRY_EXHAUSTED, while headless runs on another path
// succeeded). So a failed refresh retries the WHOLE refresh before any
// error banner appears, and a refresh that got room + gallery but lost
// the current round still renders what it read instead of aborting.
const READBACK_MAX_ATTEMPTS = 3; // 1 initial attempt + 2 whole-refresh retries
const READBACK_RETRY_DELAYS_MS = [5000, 15000]; // backoff between attempts

// Progressive rendering: the snapshot is published stage by stage as
// reads land, through this SINGLE assignment point — never anywhere
// else. A publish only ever carries data that was actually read back
// (a partial snapshot has finalized === false), so a refresh that fails
// before its first successful read leaves the previous snapshot
// untouched, and the screen always shows the most recent real data.
function publishSnapshot(next) {
  snapshot = next;
  renderAll();
}

// Bounded-concurrency map: runs fn over items with at most `limit` in
// flight. The gallery's 10 per-round reads are independent; capping at
// 4 cuts the gallery stage from ~10 sequential waves to ~3 without an
// unbounded burst against the rate-limited RPC.
async function mapLimit(items, limit, fn) {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
}

async function refreshSnapshot() {
  if (readingBack) return;
  readingBack = true;
  renderStatus();
  try {
    let lastError = null;
    for (let attempt = 0; attempt < READBACK_MAX_ATTEMPTS; attempt++) {
      try {
        await refreshSnapshotOnce();
        // Success (full or partial) — a retry notice from an earlier
        // attempt must not linger as if the readback were still failing.
        if (attempt > 0) setNotice(`${t(lang, 'readbackOk')} · ${snapshot.readBackAt}`, 'ok');
        return;
      } catch (error) {
        lastError = error;
        if (attempt + 1 >= READBACK_MAX_ATTEMPTS) break;
        // Retry pending: say so in the notice and keep the last good
        // snapshot on screen (it is never cleared here), with its
        // readBackAt untouched, so "最近读回" still shows the last success.
        setNotice(`${t(lang, 'readbackRetrying')} (${attempt + 2}/${READBACK_MAX_ATTEMPTS})`, 'info');
        await sleep(READBACK_RETRY_DELAYS_MS[attempt] ?? 15000);
      }
    }
    // All attempts exhausted: only NOW show the error banner. The last
    // successful snapshot (if any) stays rendered; its readBackAt is
    // untouched, so the footer still shows the last successful readback.
    setNotice(`${t(lang, 'txError')} (${lastError?.message || ''})`, 'error');
  } finally {
    readingBack = false;
    renderAll();
  }
}

async function refreshSnapshotOnce() {
  // Stage by stage, each successful read publishes a growing partial
  // snapshot (finalized === false until every constituent has landed),
  // so the page shows room facts within ~1s and gallery cards as their
  // reads land, instead of waiting for all ~13 calls to finish. A
  // refresh that throws before its first successful read never reaches
  // a publish, so the previous snapshot stays untouched.
  const partial = { room: null, round: null, gallery: null, galleryRounds: {},
    stats: null, finalized: false, readAt: null, readBackAt: null };
  const roomR = await readJson('get_room_state', []);
  partial.room = roomR.data;
  partial.readAt = roomR.readAt;
  publishSnapshot(partial);
  const galleryR = await readJson('get_gallery', []);
  partial.gallery = galleryR.data;
  publishSnapshot(partial);
  const roundId = currentRoundId || roomR.data?.current_round_id || '';
  // Partial readback: the current-round read may fail while room + gallery
  // succeeded. Do not abort — keep room + gallery, leave round null,
  // and force the snapshot flag false: a failed constituent can never
  // count as FINALIZED, so the marker, the verdict displays and the
  // export gate all stay closed.
  let roundOk = !roundId;
  if (roundId) {
    try {
      const roundR = await readJson('get_round', [roundId]);
      partial.round = roundR.data;
      roundOk = true;
      publishSnapshot(partial);
    } catch { roundOk = false; }
  }
  // The gallery's per-round reads are independent: run them with a
  // bounded concurrency of 4. A card publishes as its own read lands —
  // its verdict/image come only from that FINALIZED per-round read (see
  // galleryCard) — and a failed entry simply keeps no card data (as in
  // round 1); it does not unfinalize the snapshot.
  const entries = galleryR.data?.entries || [];
  await mapLimit(entries, 4, async (e) => {
    try {
      const rr = await readJson('get_round', [e.round_id]);
      partial.galleryRounds[e.round_id] = rr.data;
      publishSnapshot(partial);
    } catch { /* keep gallery entry without image */ }
  });
  // The snapshot flag is the AND of every constituent latest-final read
  // envelope — computed from readFinal's stamps only, never asserted here.
  let finalized = roomR.finalized && galleryR.finalized && roundOk;
  if (wallet?.address) {
    try {
      const statsR = await readJson('get_player_stats', [wallet.address.toLowerCase()]);
      partial.stats = statsR.data;
      finalized = finalized && statsR.finalized;
    } catch { /* keep stats null */ }
  }
  partial.finalized = finalized;
  // readBackAt is when this snapshot was ASSEMBLED, not when the first
  // read landed — the marker must not claim a time minutes before the
  // data was actually complete. Each single read's readAt envelope value
  // is untouched.
  partial.readBackAt = new Date().toISOString();
  publishSnapshot(partial);
  const fired = await maybeAutoReveal();
  if (fired) setTimeout(() => refreshSnapshot(), 5000); // re-read after the auto-reveal settles
}

// Auto-trigger: the drawer client watches for a new guess matching the local
// secret concept and then sends reveal_and_auto_settle by itself.
// Returns true when it fired a write (caller re-reads after a delay).
async function maybeAutoReveal() {
  if (!snapshot?.round || !vault) return false;
  const r = snapshot.round;
  if (r.status !== 'GUESSING' || vault.roundId !== r.round_id) return false;
  const norm = normalizeConcept(vault.concept);
  const hit = (r.guesses || []).find((g) => g.normalized_guess === norm);
  if (hit && !autoRevealFired[r.round_id]) {
    autoRevealFired[r.round_id] = true;
    setNotice(t(lang, 'autoTriggerBanner'), 'info');
    await runWrite(t(lang, 'revealNow'), 'reveal_and_auto_settle',
      [r.round_id, norm, vault.salt], 0n, true);
    return true;
  }
  // Drawer online past the reveal deadline with no correct guess: auto-reveal.
  try {
    const nowMin = await utcMinuteNow();
    if (!hit && r.reveal_deadline_minute && nowMin > parseInt(r.reveal_deadline_minute, 10)
      && !autoRevealFired[r.round_id + ':timeout']) {
      autoRevealFired[r.round_id + ':timeout'] = true;
      await runWrite(t(lang, 'revealNow'), 'reveal_and_auto_settle',
        [r.round_id, norm, vault.salt], 0n, true);
      return true;
    }
  } catch { /* clock unavailable — leave the manual button */ }
  return false;
}

// ------------------------------------------------------------------
// Chain writes. Signing account is the in-browser ephemeral test
// account (generated here, keys never leave this browser session).
// Injected wallets are used for connecting and reading; writes are
// never presented as the injected wallet's signature.
// ------------------------------------------------------------------
function envelope(sender, to, data) {
  const entry = chain.consensusMainContract.abi.find(
    (x) => x.type === 'function' && x.name === 'addTransaction');
  const args = [sender, to, 5, 3, data];
  if (entry.inputs.length === 6) args.push(BigInt(Math.floor(Date.now() / 1000) + 3600));
  return encodeFunctionData({ abi: [entry], functionName: 'addTransaction', args });
}
async function waitFinalized(hash, timeoutMs = 15 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const receipt = await rpcCall('eth_getTransactionByHash', [hash]);
    if (receipt?.status === 'FINALIZED') return receipt;
    await sleep(6000);
  }
  return null;
}
async function ensureTempFunded(minWei) {
  if (!tempAccount) tempAccount = createAccount();
  const bal = BigInt(await rpcCall('eth_getBalance', [tempAccount.address, 'latest']));
  if (bal < BigInt(minWei) + GEN) {
    await rpcCall('sim_fundAccount', [tempAccount.address, 100 * 10 ** 18]);
  }
  return tempAccount;
}
async function sendWrite(method, args, valueWei = 0n) {
  if (!tempAccount) throw new Error('ENABLE_TEMPORARY_TEST_ACCOUNT');
  const data = transactions.serialize([
    calldata.encode(calldata.makeCalldataObject(method, args, {})), false]);
  const nonce = await rpcCall('eth_getTransactionCount', [tempAccount.address, 'latest']);
  const serialized = await tempAccount.signTransaction({
    chainId: CHAIN_ID, type: 'legacy',
    to: chain.consensusMainContract.address,
    data: envelope(tempAccount.address, CONTRACT_ADDRESS, data),
    nonce: Number(BigInt(nonce)), gas: 20000000n, gasPrice: 0n, value: BigInt(valueWei),
  });
  return rpcCall('eth_sendRawTransaction', [serialized]);
}
async function runWrite(label, method, args, valueWei = 0n, quiet = false) {
  if (!tempAccount) { setNotice(t(lang, 'needTempSigner'), 'error'); return null; }
  try { await ensureTempFunded(valueWei); } catch (e) {
    setNotice(`${t(lang, 'txError')} (${e.message})`, 'error'); return null;
  }
  if (!quiet) setNotice(`${t(lang, 'txSubmitted')}: ${label}…`, 'info');
  let hash;
  try { hash = await sendWrite(method, args, valueWei); }
  catch (error) { setNotice(`${t(lang, 'txError')} (${error.message})`, 'error'); return null; }
  setNotice(`${t(lang, 'txSubmitted')}: ${String(hash).slice(0, 18)}… — ${t(lang, 'readingBack')}`, 'info');
  const receipt = await waitFinalized(hash);
  if (!receipt) { setNotice(`${t(lang, 'txError')} (FINALIZED timeout ${String(hash).slice(0, 18)}…)`, 'error'); return null; }
  const leaders = receipt.consensus_data?.leader_receipt;
  const leader = Array.isArray(leaders) ? leaders.find((x) => x.mode === 'leader') || leaders[0] : leaders;
  if (receipt.result_name !== 'MAJORITY_AGREE' || leader?.execution_result !== 'SUCCESS') {
    setNotice(`${t(lang, 'txFailed')}: ${receipt.result_name}/${leader?.execution_result}`, 'error');
    return null;
  }
  setNotice(`${t(lang, 'txFinalized')}: ${String(hash).slice(0, 18)}…`, 'ok');
  await refreshSnapshot();
  return receipt;
}

// ------------------------------------------------------------------
// Wallet.
// ------------------------------------------------------------------
async function connectInjected() {
  const provider = window.okxwallet || window.ethereum;
  if (!provider) { setNotice(t(lang, 'noWallet'), 'error'); return; }
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const chainIdHex = await provider.request({ method: 'eth_chainId' });
    if (parseInt(chainIdHex, 16) !== CHAIN_ID) { setNotice(t(lang, 'wrongNetwork'), 'error'); return; }
    wallet = { kind: 'injected', address: (accounts[0] || '').toLowerCase(),
      label: `${window.okxwallet ? 'OKX Wallet' : 'Injected EVM Wallet'} ${(accounts[0] || '').slice(0, 6)}…${(accounts[0] || '').slice(-4)}` };
    renderWallet(); renderAll(); refreshSnapshot();
  } catch (error) { setNotice(`${t(lang, 'txError')} (${error.message})`, 'error'); }
}
async function useTempAccount() {
  if (!tempAccount) tempAccount = createAccount();
  wallet = { kind: 'temp', address: tempAccount.address.toLowerCase(),
    label: `${tempAccount.address.slice(0, 6)}…${tempAccount.address.slice(-4)} (${t(lang, 'walletTemp')})` };
  renderWallet(); renderAll(); refreshSnapshot();
}
function disconnectWallet() { wallet = null; renderWallet(); renderAll(); }

// ------------------------------------------------------------------
// Canvas: 384x384 backing store; CSS scales it. Export is always the
// exact 384x384 PNG bytes, so mobile and desktop SHA-256 agree.
// ------------------------------------------------------------------
let canvas, ctx, drawing = false, lastPt = null;
let brushColor = INK_COLORS[0], brushSize = 6;
let currentImageBytes = null, currentImageB64 = '', currentImageSha = '';
let presetLoaded = null;
// What is on the canvas right now. 'blank' = untouched paper (no drawing
// identity at all — its export hash must never be displayed as a drawing
// SHA); 'drawn' = the user's own strokes; 'demo' = a demo case loaded
// verbatim from the evidence bytes. demoOriginal holds the demo's verified
// original bytes/SHA so the panel shows the evidence-record identity, not
// the canvas re-encode.
let canvasContent = 'blank';
let demoOriginal = null; // { id, sha, bytes, b64 } while a demo is loaded
// 'round' = the latest round's on-chain image, auto-loaded verbatim after a
// FINALIZED readback (brief §八). roundOriginal holds its verified bytes /
// SHA so the panel shows the on-chain identity, never a re-encode.
let roundOriginal = null; // { roundId, sha, bytes, b64 } while a round image is auto-loaded
let autoLoadedRound = null; // round_id whose image is currently on the canvas
let autoLoadPending = null; // round_id currently being verified / drawn

function initCanvas() {
  canvas = $('#draw-canvas');
  ctx = canvas.getContext('2d');
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  canvasContent = 'blank';
  demoOriginal = null;
  const pos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
             y: (e.clientY - rect.top) * (CANVAS_SIZE / rect.height) };
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (canvas.dataset.locked === '1') return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    // The first stroke invalidates a loaded demo: from here on the canvas
    // is the user's own drawing and the export is recomputed from pixels.
    if (canvasContent === 'demo') { canvasContent = 'drawn'; demoOriginal = null; presetLoaded = null; }
    else if (canvasContent === 'blank') { canvasContent = 'drawn'; }
    drawing = true;
    lastPt = pos(e);
    dot(lastPt);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath(); ctx.moveTo(lastPt.x, lastPt.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    lastPt = p;
  });
  const endStroke = async (e) => {
    if (!drawing) return;
    drawing = false;
    lastPt = null;
    await updateExport();
  };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
}
function dot(p) {
  ctx.fillStyle = brushColor;
  ctx.beginPath(); ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2); ctx.fill();
}
function clearCanvas() {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  presetLoaded = null;
  canvasContent = 'blank';
  demoOriginal = null;
  roundOriginal = null;
  autoLoadedRound = null;
  updateExport();
}
function canvasToBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
async function updateExport() {
  // A loaded demo keeps the EXACT evidence bytes: the preset is the
  // on-chain image itself, so the submit hash equals the evidence-record
  // SHA. Anything else (blank paper, user strokes) is exported from the
  // canvas pixels as before.
  if (canvasContent === 'demo' && demoOriginal) {
    currentImageBytes = b64decode(demoOriginal.b64);
    currentImageB64 = demoOriginal.b64;
    currentImageSha = demoOriginal.sha;
    renderCanvasMeta();
    return;
  }
  // An auto-loaded round image also keeps its EXACT on-chain bytes: the
  // canvas is only a visual preview of those bytes.
  if (canvasContent === 'round' && roundOriginal) {
    currentImageBytes = b64decode(roundOriginal.b64);
    currentImageB64 = roundOriginal.b64;
    currentImageSha = roundOriginal.sha;
    renderCanvasMeta();
    return;
  }
  const blob = await canvasToBlob();
  const buf = new Uint8Array(await blob.arrayBuffer());
  currentImageBytes = buf;
  currentImageB64 = b64encode(buf);
  currentImageSha = await sha256Hex(buf);
  renderCanvasMeta();
}
function renderCanvasMeta() {
  // The canvas meta never presents a hash for blank paper: the blank
  // export's SHA is not a drawing identity, and showing it next to the
  // on-chain panel invites exactly the mismatch the cold-start check found.
  const preset = $('#canvas-preset');
  if (canvasContent === 'blank') {
    $('#image-sha').textContent = t(lang, 'unconfirmed');
    $('#image-bytes').textContent = '—';
    $('#b64-size').textContent = '—';
    if (preset) preset.textContent = t(lang, 'canvasPresetBlank');
    return;
  }
  if (canvasContent === 'demo' && demoOriginal) {
    // The drawing's identity is the verified ORIGINAL (evidence-record)
    // bytes — the canvas is only a visual preview of those exact bytes.
    $('#image-sha').textContent = demoOriginal.sha;
    $('#image-bytes').textContent = String(demoOriginal.bytes);
    $('#b64-size').textContent = String(demoOriginal.b64.length);
    if (preset) preset.textContent = `${t(lang, 'canvasPresetDemo')} · ${demoOriginal.id}`;
    return;
  }
  if (canvasContent === 'round' && roundOriginal) {
    // The auto-loaded round image shows its verified ORIGINAL on-chain SHA
    // and round label — the canvas is only a visual preview of those bytes.
    $('#image-sha').textContent = roundOriginal.sha;
    $('#image-bytes').textContent = String(roundOriginal.bytes);
    $('#b64-size').textContent = String(roundOriginal.b64.length);
    if (preset) preset.textContent = `${t(lang, 'canvasPresetRound')} · ${roundOriginal.roundId}`;
    return;
  }
  $('#image-sha').textContent = currentImageSha || t(lang, 'unconfirmed');
  $('#image-bytes').textContent = currentImageBytes ? String(currentImageBytes.length) : '—';
  $('#b64-size').textContent = currentImageB64 ? String(currentImageB64.length) : '—';
  if (preset) preset.textContent = t(lang, 'canvasPresetDrawn');
}

// ------------------------------------------------------------------
// Demo presets (CASE-1..4). Bytes come from evidence/*.b64, copied
// into dist/assets at build time; the SHA-256 is verified against the
// evidence record BEFORE the drawing is put on the canvas.
// ------------------------------------------------------------------
const DEMO_CASES = [
  { id: 'CASE-1', file: 'bicycle.b64', concept: 'bicycle',
    sha: '3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14', labelKey: 'demoCase1' },
  { id: 'CASE-2', file: 'lighthouse-vague.b64', concept: 'lighthouse',
    sha: '7a0fd68a508352df8a689d2f4f7bbdeee6a1f27292033bed372dd602cee108d1', labelKey: 'demoCase2' },
  { id: 'CASE-3', file: 'volcano-text.b64', concept: 'volcano',
    sha: 'd0da6341b39ca4d868d1f75bb2fbbb525c050a007008ff95881dddbf7c59c666', labelKey: 'demoCase3' },
  { id: 'CASE-4', file: 'crank.b64', concept: 'crank',
    sha: 'e2bb96fcbb14606c63f77e853c59e160ccd4d196081cd8729e0b95747a53a546', labelKey: 'demoCase4' },
];
async function loadDemoCase(c) {
  try {
    const res = await fetch(`dist/assets/${c.file}`);
    if (!res.ok) throw new Error('DEMO_ASSET_MISSING');
    const b64 = (await res.text()).trim();
    const bytes = b64decode(b64);
    const sha = await sha256Hex(bytes);
    if (sha !== c.sha) { setNotice(t(lang, 'demoShaMismatch'), 'error'); return; }
    const blob = new Blob([bytes], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    URL.revokeObjectURL(url);
    presetLoaded = c.id;
    canvasContent = 'demo';
    demoOriginal = { id: c.id, sha: c.sha, bytes: bytes.length, b64 };
    await updateExport();
    setNotice(`${t(lang, 'demoLoaded')} — ${t(lang, 'demoShaMatch')}`, 'ok');
  } catch (e) { setNotice(`${t(lang, 'txError')} (${e.message})`, 'error'); }
}

async function autoLoadRoundImage(r) {
  // Brief §八: after a FINALIZED readback, if the latest round carries an
  // on-chain image, show its EXACT bytes on the main canvas so the stage is
  // never a blank sheet. Never clobber user strokes or a loaded demo; never
  // display a hash that was not verified against the round's own
  // image_sha256; a round with no image leaves the canvas blank (and clears
  // a stale auto-loaded image when the displayed round changes).
  if ((!r || !r.image_b64 || !r.image_sha256) && canvasContent === 'round'
    && autoLoadedRound !== r?.round_id) {
    clearCanvas();
    return;
  }
  if (!r || !r.image_b64 || !r.image_sha256) return;
  if (canvasContent === 'drawn' || canvasContent === 'demo') return;
  if (autoLoadedRound === r.round_id || autoLoadPending === r.round_id) return;
  autoLoadPending = r.round_id;
  try {
    const bytes = b64decode(r.image_b64);
    const sha = await sha256Hex(bytes);
    if (sha !== r.image_sha256) return; // never display an unverified image
    const blob = new Blob([bytes], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    URL.revokeObjectURL(url);
    // The round may have changed while the image decoded — only paint if
    // this is still the current round and the canvas is still untouched.
    if (snapshot?.round?.round_id !== r.round_id) return;
    if (canvasContent === 'drawn' || canvasContent === 'demo') return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    canvasContent = 'round';
    roundOriginal = { roundId: r.round_id, sha: r.image_sha256, bytes: bytes.length, b64: r.image_b64 };
    autoLoadedRound = r.round_id;
    await updateExport();
  } catch { /* image undecodable — leave the canvas blank */ }
  finally { if (autoLoadPending === r.round_id) autoLoadPending = null; }
}

// ------------------------------------------------------------------
// Rendering. Everything reads `snapshot`; without one, fields show
// UNCONFIRMED and never a value.
// ------------------------------------------------------------------
function setNotice(msg, kind) {
  const n = $('#notice');
  if (!n) return;
  n.textContent = msg;
  n.dataset.kind = kind || 'info';
}
function renderStatus() {
  const m = $('#readback-marker');
  if (snapshot?.finalized) {
    m.textContent = `✓ Read from FINALIZED Studionet state · ${snapshot.readBackAt}`;
    m.classList.add('ok');
  } else {
    m.textContent = t(lang, 'readbackPending');
    m.classList.remove('ok');
  }
  $('#last-readback').textContent = snapshot?.finalized ? snapshot.readBackAt : t(lang, 'neverReadBack');
  $('#offline-banner').hidden = readbackOk();
}
function renderWallet() {
  const cap = $('#wallet-capsule');
  if (!wallet) {
    cap.textContent = t(lang, 'unconfirmed');
  } else {
    cap.textContent = wallet.label;
  }
  $$('.signer-addr').forEach((el) => {
    el.textContent = tempAccount
      ? tempAccount.address.toLowerCase()
      : t(lang, 'walletNotCreated');
  });
  $('#btn-temp').disabled = !!tempAccount;
}
function applyI18n() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  $$('[data-i18n]').forEach((el) => { el.textContent = t(lang, el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(lang, el.dataset.i18nPh); });
  $('#lang-toggle').textContent = t(lang, 'langToggle');
  $('#static-toggle').textContent = `${t(lang, 'staticMode')}: ${staticMode ? 'ON' : 'OFF'}`;
}
function verdictStampHTML(round) {
  if (!round || round.status !== 'SETTLED' || !round.drawing_verdict) {
    return `<div class="stamp unconfirmed"><span>${esc(t(lang, 'verdictUnconfirmed'))}</span></div>`;
  }
  const tone = verdictTone(round);
  const vc = verdictClass(round);
  const label = vc === 'FULL_MATCH_SETTLED' ? t(lang, 'verdictFull')
    : vc === 'PARTIAL_UNGUESSED_ZERO_PAYOUT' ? t(lang, 'verdictPartialUnguessed')
    : vc === 'PARTIAL_WEAK_HALF_ROLLOVER' ? t(lang, 'verdictWeak')
    : vc === 'PARTIAL_WEAK_ZERO_PAYOUT' ? t(lang, 'verdictWeakUnguessed')
    : t(lang, 'verdictMiss');
  // A <wbr> after every underscore: the verdict enum (DRAWING_MATCHES)
  // may only break at an underscore, never mid-word, on any viewport.
  return `<div class="stamp ${tone}"><span class="stamp-verdict">${esc(round.drawing_verdict).replaceAll('_', '_<wbr>')}</span><span class="stamp-label">${esc(label)}</span></div>`;
}
function potSplitHTML(round) {
  if (!round || round.status !== 'SETTLED') {
    return `<div class="splitbar unconfirmed"><span>${esc(t(lang, 'unconfirmed'))}</span></div>`;
  }
  const total = BigInt(round.total_pot_wei || '0');
  const drawer = BigInt(round.drawer_payout_wei || '0');
  const guessers = Object.values(round.guesser_payouts || {}).reduce((a, v) => a + BigInt(v || '0'), 0n);
  const roll = BigInt(round.next_rollover_pool_wei || '0');
  const pct = (v) => total > 0n ? Number((v * 10000n) / total) / 100 : 0;
  return `<div class="splitbar" role="img" aria-label="${esc(t(lang, 'potSplitBar'))}">
    <div class="split-drawer" style="width:${pct(drawer)}%"></div>
    <div class="split-guesser" style="width:${pct(guessers)}%"></div>
    <div class="split-roll" style="width:${pct(roll)}%"></div></div>
  <div class="split-legend"><span>${esc(t(lang, 'drawerShare'))} ${esc(fmtGen(drawer.toString()))}</span><span>${esc(t(lang, 'guesserShare'))} ${esc(fmtGen(guessers.toString()))}</span><span>${esc(t(lang, 'rolloverShare'))} ${esc(fmtGenExact(roll.toString()))}</span></div>`;
}
function renderAll() {
  applyI18n();
  renderStatus();
  renderWallet();
  renderRoom();
  renderConsole();
  renderCanvasState();
  renderGuesses();
  renderPayouts();
  renderGallery();
  renderEvidence();
  renderMachine();
}
function renderRoom() {
  const live = readbackOk();
  // Room-level facts come from a successful latest-final get_room_state,
  // so they render whenever that read succeeded — including a partial
  // snapshot whose current-round read failed. Round-derived facts (the
  // pot, the pipeline stages) stay behind the full-readback gate: they
  // are verdict-adjacent and must not render from a partial snapshot.
  const room = snapshot?.room || null;
  $('#pool-rollover').textContent = room ? fmtGenExact(room.rollover_pool_wei) : t(lang, 'dashUnconfirmed');
  $('#round-count').textContent = room ? String(room.round_count) : t(lang, 'dashUnconfirmed');
  const rid = live ? (snapshot.round?.round_id || room?.current_round_id || '') : (room?.current_round_id || '');
  $('#round-id-display').textContent = rid || t(lang, 'unconfirmed');
  if (rid && !currentRoundId) { currentRoundId = rid; $('#round-id').value = rid; }
  // Progress dots under the canvas: stage names render only after a
  // FINALIZED readback; before that every step shows UNCONFIRMED so no
  // stage/verdict string is ever pre-claimed.
  const stage = live ? (snapshot.round?.status || '') : '';
  const stages = ['DRAWING', 'GUESSING', 'JUDGED', 'SETTLED'];
  $('#pipeline').innerHTML = stages.map((s, i) => {
    const active = stage === s;
    const label = live ? `${i + 1}. ${s}` : `${i + 1}. ${t(lang, 'unconfirmed')}`;
    return `<span class="pipe-step${active ? ' active' : ''}"><i class="dot"></i><span>${esc(label)}</span></span>`;
  }).join('');
  const pot = live ? snapshot.round : null;
  $('#pool-current').textContent = pot?.total_pot_wei ? fmtGenExact(pot.total_pot_wei) : t(lang, 'dashUnconfirmed');
}
function renderConsole() {
  const r = readbackOk() ? snapshot.round : null;
  const u = () => t(lang, 'unconfirmed');
  $('#c-status').textContent = r ? r.status : u();
  $('#c-commit').textContent = r?.concept_commit || u();
  $('#c-category').textContent = r?.category_hint || u();
  $('#c-draw-deadline').textContent = r?.drawing_deadline_minute ? minuteToUTC(r.drawing_deadline_minute) : u();
  $('#c-reveal-deadline').textContent = r?.reveal_deadline_minute ? minuteToUTC(r.reveal_deadline_minute) : u();
  $('#c-challenge-deadline').textContent = r?.challenge_deadline_minute ? minuteToUTC(r.challenge_deadline_minute) : u();
  $('#c-concept').textContent = r?.revealed_concept || t(lang, 'hidden');
  $('#c-cheat').textContent = r?.has_written_text_cheat || u();
  $('#c-tier').textContent = r?.visual_depiction_tier || u();
  const localCommit = $('#vault-commit');
  if (vault) {
    localCommit.textContent = t(lang, 'conceptCommitLocal');
  } else {
    localCommit.textContent = '—';
  }
  $('#vault-concept').textContent = vault ? vault.concept : '—';
  $('#vault-salt').textContent = vault ? vault.salt : '—';
  $('#vault-round').textContent = vault ? vault.roundId : '—';
  updateTimeoutButton();
}
function renderStampOverlay(r) {
  // The verdict stamp lives on the canvas as an event, not a table row. It
  // renders only from a FINALIZED SETTLED round (r is already gated by
  // readbackOk() in renderCanvasState); anything else leaves the overlay
  // empty so no verdict is ever pre-claimed. The dim is the reveal curtain:
  // it appears with the stamp, over the same 420ms, and statically with
  // ?static (durations 0).
  const overlay = $('#stamp-overlay');
  const dim = $('#canvas-dim');
  const show = !!r && r.status === 'SETTLED' && !!r.drawing_verdict;
  if (dim) dim.classList.toggle('on', show);
  if (!overlay) return;
  if (!show) { overlay.innerHTML = ''; return; }
  overlay.innerHTML = `<div class="stamp-wrap${!staticMode ? ' animate-in' : ''}">${verdictStampHTML(r)}</div>`;
}
function renderCanvasState() {
  const r = readbackOk() ? snapshot.round : null;
  const locked = !!r && r.status !== 'DRAWING';
  if (canvas) canvas.dataset.locked = locked ? '1' : '0';
  $('#canvas-state').textContent = !readbackOk() ? t(lang, 'unconfirmed')
    : locked ? t(lang, 'canvasReadonly') : t(lang, 'canvasActive');
  renderCanvasMeta();
  renderStampOverlay(r);
  const stage = $('#reveal-stage');
  if (!r) {
    stage.innerHTML = `<p class="reveal-wait">${esc(t(lang, 'revealWaiting'))}</p>`;
    return;
  }
  const checks = [
    [t(lang, 'commitMatch'), r.status === 'JUDGED' || r.status === 'SETTLED' ? '✓' : t(lang, 'unconfirmed')],
    [t(lang, 'imageMatch'), r.status === 'JUDGED' || r.status === 'SETTLED' ? '✓' : t(lang, 'unconfirmed')],
    [t(lang, 'cheatGate'), r.has_written_text_cheat ? (r.has_written_text_cheat === 'NO' ? 'PASSED (NO)' : 'FAILED (YES)') : t(lang, 'unconfirmed')],
  ];
  stage.innerHTML = `
    <dl class="checks">${checks.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd class="mono">${esc(v)}</dd></div>`).join('')}</dl>
    <dl class="reveal-facts">
      <div><dt>${esc(t(lang, 'verdictLabel'))}</dt><dd class="mono">${esc(r.drawing_verdict || t(lang, 'unconfirmed'))}</dd></div>
      <div><dt>${esc(t(lang, 'reasonLabel'))}</dt><dd class="mono">${esc(r.reason_code || t(lang, 'pendingReadback'))}</dd></div>
      <div><dt>${esc(t(lang, 'fastestGuesser'))}</dt><dd class="mono">${esc(r.fastest_guesser ? shortAddr(r.fastest_guesser) : t(lang, 'unconfirmed'))}</dd></div>
    </dl>`;
  // Brief §八: after the FINALIZED readback, the latest round's on-chain
  // image auto-loads onto the main canvas (exact bytes, SHA verified).
  autoLoadRoundImage(r);
}
function renderGuesses() {
  const box = $('#guess-stream');
  const r = readbackOk() ? snapshot.round : null;
  if (!r) { box.innerHTML = `<p class="empty">${esc(t(lang, 'unconfirmedLong'))}</p>`; return; }
  const guesses = [...(r.guesses || [])].sort((a, b) => a.seq_no - b.seq_no);
  if (!guesses.length) { box.innerHTML = `<p class="empty">${esc(t(lang, 'noGuesses'))}</p>`; return; }
  // The rail shows the latest 5 guesses, compact; the count stays the total.
  const latest = guesses.slice(-5);
  box.innerHTML = latest.map((g) => {
    const badge = !g.verdict ? t(lang, 'guessPending')
      : g.verdict === 'GUESS_CORRECT' ? t(lang, 'guessCorrect') : t(lang, 'guessWrong');
    const cls = !g.verdict ? 'unconfirmed' : g.verdict === 'GUESS_CORRECT' ? 'correct' : 'wrong';
    return `<div class="guess"><span class="mono">#${String(g.seq_no).padStart(2, '0')}</span>
      <span class="mono">${esc(shortAddr(g.address))}</span>
      <span class="guess-text">${esc(g.normalized_guess)}</span>
      <span class="guess-badge ${cls}">${esc(badge)}</span>
      <span class="mono guess-stake">${esc(fmtGen(g.stake_wei))}</span></div>`;
  }).join('');
  $('#guess-count').textContent = String(guesses.length);
}
function renderPayouts() {
  const r = readbackOk() ? snapshot.round : null;
  const room = readbackOk() ? snapshot.room : null;
  const u = () => t(lang, 'dashUnconfirmed');
  $('#p-drawer').textContent = r?.status === 'SETTLED' ? fmtGen(r.drawer_payout_wei) : u();
  const guessTotal = r?.status === 'SETTLED'
    ? Object.values(r.guesser_payouts || {}).reduce((a, v) => a + BigInt(v || '0'), 0n).toString()
    : null;
  $('#p-guessers').textContent = guessTotal !== null ? fmtGen(guessTotal) : u();
  $('#p-rollover').textContent = r?.status === 'SETTLED' ? fmtGenExact(r.next_rollover_pool_wei)
    : room ? fmtGenExact(room.rollover_pool_wei) : u();
  $('#p-total').textContent = r?.status === 'SETTLED' ? fmtGenExact(r.total_pot_wei) : u();
  $('#p-fastest').textContent = r?.status === 'SETTLED'
    ? (r.fastest_guesser ? shortAddr(r.fastest_guesser) : '—') : u();
  const stats = readbackOk() ? snapshot.stats : null;
  $('#p-score').textContent = stats ? String(stats.score) : u();
  $('#p-balance').textContent = stats ? fmtGen(stats.balance_wei) : u();
  $('#split-wrap').innerHTML = potSplitHTML(r);
}
function galleryCard(e, detail) {
  // A card renders verdict, reason, allocations and image ONLY from its own
  // FINALIZED per-round read (detail). Without that read the card shows
  // nothing but the round id and UNCONFIRMED — never the gallery entry's
  // verdict next to an unconfirmed split bar, and never an image.
  if (!detail) {
    return `<article class="gcard tone-navy" data-round="${esc(e.round_id)}">
    <div class="gcard-head">
      <div class="thumb thumb-empty">${esc(t(lang, 'unconfirmed'))}</div>
      <span class="gcard-meta"><span class="gcard-id mono">${esc(e.round_id)}</span>
      <span class="gcard-verdict mono">${esc(t(lang, 'unconfirmed'))}</span></span>
    </div>
    <div class="gcard-body"><span>${esc(t(lang, 'unconfirmedLong'))}</span></div>
  </article>`;
  }
  const tone = verdictTone(detail);
  // An image renders only when the FINALIZED per-round read carries real
  // image bytes AND their hash. A round with no drawing (e.g. R7, drawing
  // timeout) shows an explicit no-image thumb, never another round's art.
  const hasImage = !!detail.image_b64 && !!detail.image_sha256;
  const thumb = hasImage
    ? `<img class="thumb" alt="drawing ${esc(e.round_id)}" src="data:image/png;base64,${esc(detail.image_b64)}">`
    : `<div class="thumb thumb-empty">${esc(t(lang, 'noImage'))}</div>`;
  const open = expandedGallery.has(e.round_id);
  return `<article class="gcard tone-${tone}" data-round="${esc(e.round_id)}">
    <button type="button" class="gcard-head" data-expand="${esc(e.round_id)}" aria-expanded="${open}">
      ${thumb}
      <span class="gcard-meta"><span class="gcard-id mono">${esc(e.round_id)} · ${esc(detail.revealed_concept || '')}</span>
      <span class="gcard-verdict mono">${esc(detail.drawing_verdict || t(lang, 'unconfirmed'))}</span>
      <span class="gcard-reason mono">${esc(detail.reason_code || '')}</span></span>
    </button>
    <div class="gcard-body">
      <div>${esc(t(lang, 'fastestGuesser'))}: <span class="mono">${esc(detail.fastest_guesser ? shortAddr(detail.fastest_guesser) : '—')}</span></div>
      ${potSplitHTML(detail)}
      <button type="button" class="btn secondary" data-export="${esc(e.round_id)}"
        ${detail.status === 'SETTLED' && snapshot?.finalized ? '' : 'disabled'}>${esc(t(lang, 'exportDossier'))}</button>
      <span class="hint">${esc(t(lang, 'exportDisabledNote'))}</span>
    </div>
    ${open && detail ? `<div class="gcard-detail"><h4>${esc(t(lang, 'roundDetail'))}</h4>
      <dl class="kv">
        <div><dt>concept_commit</dt><dd class="mono">${esc(detail.concept_commit || '')}</dd></div>
        <div><dt>image_sha256</dt><dd class="mono">${esc(detail.image_sha256 || '')}</dd></div>
        <div><dt>image_byte_len</dt><dd class="mono">${esc(String(detail.image_byte_len ?? ''))}</dd></div>
        <div><dt>revealed_concept</dt><dd class="mono">${esc(detail.revealed_concept || '')}</dd></div>
        <div><dt>has_written_text_cheat</dt><dd class="mono">${esc(detail.has_written_text_cheat || '')}</dd></div>
        <div><dt>visual_depiction_tier</dt><dd class="mono">${esc(detail.visual_depiction_tier || '')}</dd></div>
        <div><dt>reason_code</dt><dd class="mono">${esc(detail.reason_code || '')}</dd></div>
        <div><dt>drawer</dt><dd class="mono">${esc(detail.drawer || '')}</dd></div>
        <div><dt>guesses</dt><dd class="mono">${esc(JSON.stringify(detail.guesses || []))}</dd></div>
        <div><dt>challenges</dt><dd class="mono">${esc(JSON.stringify(detail.challenges || []))}</dd></div>
        <div><dt>settled_by</dt><dd class="mono">${esc(detail.settled_by || '')}</dd></div>
      </dl></div>` : ''}
  </article>`;
}
function renderGallery() {
  const box = $('#gallery');
  // Partial readback: the gallery list itself is FINALIZED data from a
  // successful latest-final get_gallery, so it renders whenever it was
  // read — the full-readback gate is not required for the list. A card's
  // verdict/image still comes only from its own FINALIZED per-round read
  // (see galleryCard), and the export button inside a card still needs
  // snapshot.finalized. Without any gallery data at all, UNCONFIRMED.
  if (!snapshot?.gallery && !readbackOk()) { box.innerHTML = `<p class="empty">${esc(t(lang, 'unconfirmedLong'))}</p>`; return; }
  const entries = snapshot.gallery?.entries || [];
  if (!entries.length) { box.innerHTML = `<p class="empty">${esc(t(lang, 'noGallery'))}</p>`; return; }
  box.innerHTML = entries.map((e) => galleryCard(e, snapshot.galleryRounds[e.round_id] || null)).join('');
}
function renderEvidence() {
  const box = $('#evidence');
  // Gate 11: the evidence panel shows its UNCONFIRMED state until a
  // FINALIZED readback exists — no verdict table, no tx table, no claims
  // before that. The round table below is then built from the LIVE
  // FINALIZED per-round reads (snapshot.galleryRounds), never from a
  // hardcoded copy, so a stale row cannot render.
  if (!readbackOk()) {
    box.innerHTML = `<p class="empty">${esc(t(lang, 'unconfirmedLong'))}</p>`;
    return;
  }
  const txRows = EVIDENCE_DATA.txs.map((tx) =>
    `<tr><td>${esc(tx.label)}</td><td class="mono"><a href="${EXPLORER}/tx/${esc(tx.hash)}" target="_blank" rel="noreferrer">${esc(tx.hash.slice(0, 18))}…</a></td></tr>`).join('');
  const roundRows = (snapshot.gallery?.entries || []).map((e) => {
    const d = snapshot.galleryRounds[e.round_id];
    if (!d) {
      return `<tr><td class="mono">${esc(e.round_id)}</td><td colspan="7">${esc(t(lang, 'unconfirmed'))}</td></tr>`;
    }
    const guessers = Object.entries(d.guesser_payouts || {})
      .map(([a, v]) => `${shortAddr(a)} ${fmtGen(v)}`).join(', ') || '—';
    return `<tr><td class="mono">${esc(d.round_id)}</td><td class="mono">${esc(d.revealed_concept || '')}</td><td class="mono">${esc(d.drawing_verdict || t(lang, 'unconfirmed'))}</td><td class="mono">${esc(d.reason_code || '')}</td><td>${esc(fmtGenExact(d.total_pot_wei))}</td><td>${esc(fmtGen(d.drawer_payout_wei))}</td><td>${esc(guessers)}</td><td>${esc(fmtGenExact(d.next_rollover_pool_wei))}</td></tr>`;
  }).join('');
  box.innerHTML = `
    <h3>${esc(t(lang, 'claimsTitle'))}</h3>
    <ol>${[1, 2, 3, 4, 5].map((i) => `<li>${esc(t(lang, 'claim' + i))}</li>`).join('')}</ol>
    <h3>${esc(t(lang, 'anchorsTitle'))}</h3>
    <ol>${[1, 2, 3].map((i) => `<li>${esc(t(lang, 'anchor' + i))}</li>`).join('')}</ol>
    <dl class="kv">
      <div><dt>${esc(t(lang, 'contract'))}</dt><dd class="mono"><a href="${EXPLORER}/address/${CONTRACT_ADDRESS}" target="_blank" rel="noreferrer">${CONTRACT_ADDRESS}</a></dd></div>
      <div><dt>${esc(t(lang, 'sourceSha'))}</dt><dd class="mono">${SOURCE_SHA256}</dd></div>
      <div><dt>Deploy tx</dt><dd class="mono"><a href="${EXPLORER}/tx/${EVIDENCE_DATA.deploy_tx}" target="_blank" rel="noreferrer">${EVIDENCE_DATA.deploy_tx}</a></dd></div>
    </dl>
    <h3>${esc(t(lang, 'txTableTitle'))} (${EVIDENCE_DATA.tx_count})</h3>
    <div class="table-wrap"><table class="tx-table"><thead><tr><th>Label</th><th>Tx hash</th></tr></thead><tbody>${txRows}</tbody></table></div>
    <h3>${esc(t(lang, 'advTitle'))}</h3>
    <div class="table-wrap"><table class="tx-table"><thead><tr><th>Round</th><th>Concept</th><th>Verdict</th><th>Reason</th><th>Pot</th><th>Drawer</th><th>Guessers</th><th>Rollover</th></tr></thead><tbody>${roundRows}</tbody></table></div>
    <p class="adv-note">R3 volcano text-cheat MISS · R4 crank VISUAL_MISS · R5 challenge flip (wrong lock → corrected → MATCHES) · R6 failed challenge (wrong hash, deposit forfeited) · R7/R8 timeouts · R10 negative battery (7 rejected calls) · R2 deviation: jury returned MATCHES, not pre-registered WEAK — recorded as-is in evidence/EVIDENCE.md.</p>
    <h3>${esc(t(lang, 'notProveTitle'))}</h3>
    <ol>${[1, 2, 3].map((i) => `<li>${esc(t(lang, 'notProve' + i))}</li>`).join('')}</ol>`;
}
function renderMachine() {
  const pre = $('#machine-view');
  if (view !== 'machine') { pre.hidden = true; return; }
  pre.hidden = false;
  const lines = [];
  lines.push(`CONTRACT ....... ${CONTRACT_ADDRESS}`);
  lines.push(`SOURCE_SHA256 . ${SOURCE_SHA256}`);
  lines.push(`CHAIN_ID ...... ${CHAIN_ID}`);
  lines.push(`RPC ........... ${RPC_URL}`);
  if (!snapshot?.finalized) {
    lines.push(`READBACK ...... UNCONFIRMED`);
    lines.push(`STATUS ........ UNCONFIRMED`);
    lines.push(`VERDICT ....... UNCONFIRMED`);
    lines.push(`PAYOUTS ....... UNCONFIRMED`);
  } else {
    lines.push(`READBACK ...... FINALIZED @ ${snapshot.readBackAt}`);
    const r = snapshot.round || {};
    lines.push(`ROUND_ID ...... ${r.round_id || ''}`);
    lines.push(`STATUS ........ ${r.status || ''}`);
    lines.push(`CONCEPT_COMMIT  ${r.concept_commit || ''}`);
    lines.push(`IMAGE_SHA256 .. ${r.image_sha256 || ''}`);
    lines.push(`VERDICT ....... ${r.drawing_verdict || ''}`);
    lines.push(`REASON_CODE ... ${r.reason_code || ''}`);
    lines.push(`FASTEST ....... ${r.fastest_guesser || ''}`);
    lines.push(`DRAWER_PAYOUT . ${r.drawer_payout_wei || ''}`);
    lines.push(`TOTAL_POT ..... ${r.total_pot_wei || ''}`);
    lines.push(`ROLLOVER ...... ${snapshot.room?.rollover_pool_wei || ''}`);
    lines.push(`GALLERY_ENTRIES ${snapshot.gallery?.entries?.length ?? 0}`);
  }
  pre.textContent = lines.join('\n');
}

// ------------------------------------------------------------------
// Timeout-rescue enablement (deadline-gated, re-checked on each render).
// ------------------------------------------------------------------
let timeoutCheckRunning = false;
async function updateTimeoutButton() {
  const btn = $('#btn-timeout');
  if (!btn) return;
  const r = readbackOk() ? snapshot.round : null;
  if (!r || (r.status !== 'DRAWING' && r.status !== 'GUESSING')) { btn.disabled = true; return; }
  if (timeoutCheckRunning) return;
  timeoutCheckRunning = true;
  try {
    const nowMin = await utcMinuteNow();
    const dl = r.status === 'DRAWING' ? parseInt(r.drawing_deadline_minute, 10) : parseInt(r.reveal_deadline_minute, 10);
    btn.disabled = !(Number.isFinite(dl) && nowMin > dl);
  } catch { btn.disabled = true; }
  timeoutCheckRunning = false;
}

// ------------------------------------------------------------------
// Dossier export (gated: SETTLED + FINALIZED readback, else throws).
// ------------------------------------------------------------------
function exportRoundDossier(roundId) {
  const round = snapshot?.galleryRounds[roundId] || (snapshot?.round?.round_id === roundId ? snapshot.round : null);
  // Gate 11: the export consumes the snapshot's own finalized flag, as
  // produced by readFinal and threaded through refreshSnapshot. It never
  // asserts the flag itself — a snapshot without the flag fails the gate
  // inside buildDossier.
  const dossier = buildDossier(round, snapshot
    ? { finalized: snapshot.finalized, contract_address: CONTRACT_ADDRESS, source_sha256: SOURCE_SHA256, readback_at: snapshot.readBackAt }
    : null);
  const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sketchverdict-dossier-${roundId}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ------------------------------------------------------------------
// Write-button handlers (each mirrors one contract method + value).
// ------------------------------------------------------------------
async function onStartRound() {
  const roundId = $('#round-id').value.trim();
  const concept = normalizeConcept($('#concept').value);
  let salt = $('#salt').value.trim();
  if (!salt) { salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, '0')).join(''); $('#salt').value = salt; }
  if (!roundId || roundId.length > 48) { setNotice(t(lang, 'invalidRoundId'), 'error'); return; }
  if (!concept) { setNotice(t(lang, 'needConcept'), 'error'); return; }
  const category = $('#category').value.trim().slice(0, 40) || 'GENERAL';
  const drawMin = Math.max(1, Math.min(1440, parseInt($('#draw-min').value, 10) || 5));
  const guessMin = Math.max(1, Math.min(1440, parseInt($('#guess-min').value, 10) || 10));
  const commit = await sha256Hex(new TextEncoder().encode(`${salt}|${concept}`));
  vault = { roundId, concept, salt };
  currentRoundId = roundId;
  clearCanvas(); // a new round starts on blank paper, never on the last round's image
  renderConsole();
  await runWrite(t(lang, 'startRound'), 'start_round', [roundId, commit, category, drawMin, guessMin], 10n * GEN);
}
async function onSubmitDrawing() {
  const roundId = currentRoundId || $('#round-id').value.trim();
  if (!roundId) { setNotice(t(lang, 'needRound'), 'error'); return; }
  // Re-export from the canvas first so a stroke that landed just before
  // this click is included; a loaded demo still submits its exact bytes
  // (updateExport preserves them while canvasContent is 'demo').
  await updateExport();
  if (!currentImageB64 || !currentImageSha) { setNotice(t(lang, 'needDrawing'), 'error'); return; }
  await runWrite(t(lang, 'submitDrawing'), 'submit_drawing', [roundId, currentImageB64, currentImageSha], 0n);
}
async function onSubmitGuess() {
  const roundId = currentRoundId || $('#round-id').value.trim();
  const guess = normalizeConcept($('#guess-input').value);
  if (!roundId) { setNotice(t(lang, 'needRound'), 'error'); return; }
  if (!guess) { setNotice(t(lang, 'needGuess'), 'error'); return; }
  await runWrite(t(lang, 'submitGuess'), 'submit_guess', [roundId, guess], 5n * GEN);
}
async function onReveal() {
  const roundId = currentRoundId || $('#round-id').value.trim();
  if (!vault || vault.roundId !== roundId) { setNotice(t(lang, 'needSalt'), 'error'); return; }
  await runWrite(t(lang, 'revealNow'), 'reveal_and_auto_settle',
    [roundId, normalizeConcept(vault.concept), vault.salt], 0n);
}
async function onChallenge() {
  const roundId = currentRoundId || $('#round-id').value.trim();
  const hash = $('#challenge-hash').value.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hash)) { setNotice(t(lang, 'needHash'), 'error'); return; }
  await runWrite(t(lang, 'challengeBtn'), 'challenge', [roundId, hash], 5n * GEN);
}
async function onSettle() {
  const roundId = currentRoundId || $('#round-id').value.trim();
  if (!roundId) { setNotice(t(lang, 'needRound'), 'error'); return; }
  await runWrite(t(lang, 'settleBtn'), 'settle', [roundId], 0n);
}
async function onTimeout() {
  const roundId = currentRoundId || $('#round-id').value.trim();
  if (!roundId) { setNotice(t(lang, 'needRound'), 'error'); return; }
  await runWrite(t(lang, 'timeoutRescue'), 'trigger_timeout_auto_settle', [roundId], 0n);
}
async function onWithdraw() {
  await runWrite(t(lang, 'withdraw'), 'withdraw', [], 0n);
}

// ------------------------------------------------------------------
// Events + init.
// ------------------------------------------------------------------
function bindEvents() {
  $('#lang-toggle').addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('sv-lang', lang);
    renderAll();
  });
  $('#static-toggle').addEventListener('click', () => {
    staticMode = !staticMode;
    document.documentElement.classList.toggle('static-mode', staticMode);
    renderAll();
  });
  $('#btn-connect').addEventListener('click', connectInjected);
  $('#btn-temp').addEventListener('click', useTempAccount);
  $('#btn-disconnect').addEventListener('click', disconnectWallet);
  $('#btn-refresh').addEventListener('click', refreshSnapshot);
  $('#btn-gen-salt').addEventListener('click', () => {
    $('#salt').value = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, '0')).join('');
  });
  $('#btn-start').addEventListener('click', onStartRound);
  $('#btn-draw').addEventListener('click', onSubmitDrawing);
  $('#btn-guess').addEventListener('click', onSubmitGuess);
  $('#btn-reveal').addEventListener('click', onReveal);
  $('#btn-challenge').addEventListener('click', onChallenge);
  $('#btn-settle').addEventListener('click', onSettle);
  $('#btn-timeout').addEventListener('click', onTimeout);
  $('#btn-withdraw').addEventListener('click', onWithdraw);
  $('#btn-clear').addEventListener('click', clearCanvas);
  $('#btn-eraser').addEventListener('click', () => { brushColor = PAPER; $$('.swatch').forEach((s) => s.classList.remove('active')); $('#btn-eraser').classList.add('active'); });
  $$('.swatch').forEach((s) => s.addEventListener('click', () => {
    brushColor = s.dataset.color;
    $$('.swatch').forEach((x) => x.classList.remove('active'));
    $('#btn-eraser').classList.remove('active');
    s.classList.add('active');
  }));
  $$('.brush-size').forEach((b) => b.addEventListener('click', () => {
    brushSize = parseInt(b.dataset.size, 10);
    $$('.brush-size').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
  }));
  $$('.demo-btn').forEach((b) => b.addEventListener('click', () => {
    const c = DEMO_CASES.find((x) => x.id === b.dataset.case);
    if (c) loadDemoCase(c);
  }));
  $$('.deck-tab').forEach((b) => b.addEventListener('click', () => {
    galleryTab = b.dataset.deck;
    $$('.deck-tab').forEach((x) => x.classList.toggle('active', x === b));
    $('#gallery-wrap').hidden = galleryTab !== 'gallery';
    $('#evidence-wrap').hidden = galleryTab !== 'evidence';
  }));
  $$('.mobile-tab').forEach((b) => b.addEventListener('click', () => {
    $$('.mobile-tab').forEach((x) => x.classList.toggle('active', x === b));
    const tab = b.dataset.mtab;
    // Mobile: the stage (canvas + guess dock) is the first screen; the rail
    // (facts, money, stream, wallet, play forms) is the guesses tab; the
    // deck (gallery / evidence) is the gallery / evidence tabs.
    $('#stage-col').classList.toggle('mtab-hidden', tab !== 'canvas');
    $('#rail-col').classList.toggle('mtab-hidden', tab !== 'guesses');
    $('#deck').classList.toggle('mtab-hidden', tab !== 'gallery' && tab !== 'evidence');
    if (tab === 'gallery' || tab === 'evidence') {
      galleryTab = tab;
      $$('.deck-tab').forEach((x) => x.classList.toggle('active', x.dataset.deck === tab));
      $('#gallery-wrap').hidden = tab !== 'gallery';
      $('#evidence-wrap').hidden = tab !== 'evidence';
    }
  }));
  $$('.view-pill button').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view;
    $$('.view-pill button').forEach((x) => x.classList.toggle('active', x === b));
    $('#human-view').hidden = view !== 'human';
    renderMachine();
  }));
  document.addEventListener('click', (e) => {
    const exp = e.target.closest('[data-expand]');
    if (exp) {
      const id = exp.dataset.expand;
      if (expandedGallery.has(id)) expandedGallery.delete(id); else expandedGallery.add(id);
      renderGallery();
      return;
    }
    const ex = e.target.closest('[data-export]');
    if (ex) {
      try { exportRoundDossier(ex.dataset.export); }
      catch (err) { setNotice(t(lang, 'exportBlocked') + ` (${err.message})`, 'error'); }
    }
  });
  $('#round-id').addEventListener('change', (e) => {
    currentRoundId = e.target.value.trim();
    refreshSnapshot();
  });
  setInterval(() => { if (!document.hidden) refreshSnapshot(); }, 30000);
  setInterval(updateTimeoutButton, 15000);
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.toggle('static-mode', staticMode);
  $('#contract-link').href = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;
  $('#contract-link-full').href = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;
  initCanvas();
  bindEvents();
  updateExport();
  renderAll();
  refreshSnapshot();
});
