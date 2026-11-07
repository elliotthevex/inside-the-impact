/* Sound for the fight. WebAudio synthesis only: no sound files.

     const audio = createAudio({ enabled, volume });   // volume 0..1, from ST.fxvol / 100; enabled from uiPrefs.sound. opts.ctx lets a test pass an OfflineAudioContext
     audio.crowdReady                                  // a promise: the crowd is rendered once, in a worker, and fades in when it arrives
     audio.onEvent(ev, when);  audio.update(match, dt, when);  audio.land(when);  audio.unlock();  audio.setPaused(on);  audio.setHidden(on);  audio.newMatch();  audio.destroy({ keepCtx });

   On a phone the context only starts inside a tap, so the launcher makes one in the card tap and passes it as ctx. While it is not running, sounds that come due are dropped rather than
   queued: nothing mashes together and no bell rings at the first tap. unlock() listens for a gesture for the life of the arena, so a context interrupted by a phone call comes back.

   Graph: master -> limiter -> out. Hits go through a tanh shaper (harmonics, so a phone speaker still hears the thump) and send to a short synthesised basement
   reverb. The crowd bus is high-passed with a low-pass that opens as it gets excited. Nobody on the build side could listen to this: it is checked by measuring
   rendered output (peak, centroid, decay), so its character needs a pair of ears. */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rngOf = (seed) => { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const VOWELS = [[730, 1090], [570, 840], [300, 870], [270, 2290], [530, 1840], [660, 1720], [440, 1020], [490, 1350]];
const OPEN = [[730, 1090], [660, 1720], [570, 840], [640, 1190]];

const nextSlice = () => new Promise((ok) => setTimeout(ok, 0));

/* One crowd loop. Talkers are pulses and breath through two formant resonators, a syllable at a time, panned about. The tail is crossfaded into the head so it loops. */
async function renderCrowd({ seconds, sr, talkers, f0: [f0a, f0b], syl: [sa, sb], gap, vowels, seed, xfade = 0.6 }) {
  const rnd = rngOf(seed), N = Math.floor((seconds + xfade) * sr), L = new Float32Array(N), R = new Float32Array(N);
  for (let k = 0; k < talkers; k++) {
    if (k) await nextSlice();
    const pan = rnd() * 0.9 + 0.05, gL = Math.cos(pan * Math.PI / 2), gR = Math.sin(pan * Math.PI / 2), level = 0.5 + rnd() * 0.7, f0 = f0a + (f0b - f0a) * rnd(), breath = 0.05 + rnd() * 0.05;
    let i = Math.floor(rnd() * sr * 0.3), phase = rnd(), per = sr / f0, y1 = 0, y1b = 0, y2 = 0, y2b = 0, env = 0, target = 0, end = i, a1 = 0, b1 = 0, a2 = 0, b2 = 0, pitch = 1, pitchV = 0;
    const att = 1 - Math.exp(-1 / (0.02 * sr)), rel = 1 - Math.exp(-1 / (0.05 * sr));
    const set = (f1, f2) => { const r1 = Math.exp(-Math.PI * 90 / sr), r2 = Math.exp(-Math.PI * 130 / sr); a1 = 2 * r1 * Math.cos(2 * Math.PI * f1 / sr); b1 = -r1 * r1; a2 = 2 * r2 * Math.cos(2 * Math.PI * f2 / sr); b2 = -r2 * r2; };
    set(...vowels[0]);
    for (; i < N; i++) {
      if (i >= end) {
        if (rnd() < gap) { target = 0; end = i + Math.floor(sr * (0.06 + rnd() * 0.3)); } else { target = 0.55 + rnd() * 0.45; end = i + Math.floor(sr * (sa + rnd() * (sb - sa))); const v = vowels[Math.floor(rnd() * vowels.length)]; set(v[0], v[1]); pitchV = (rnd() - 0.5) * 0.5 / sr; pitch = 0.92 + rnd() * 0.18; }
      }
      env += (target - env) * (target > env ? att : rel);
      phase += 1 / per;
      let x = 0;
      if (phase >= 1) { phase -= 1; x = 1; pitch = clamp(pitch + pitchV * per, 0.8, 1.25); per = sr / (f0 * pitch * (1 + (rnd() - 0.5) * 0.03)); }
      x += (rnd() - 0.5) * breath;
      const o1 = x + a1 * y1 + b1 * y1b, o2 = x + a2 * y2 + b2 * y2b; y1b = y1; y1 = o1; y2b = y2; y2 = o2;
      const s = (o1 + o2 * 0.5) * env * level;
      L[i] += s * gL; R[i] += s * gR;
    }
  }
  const out = Math.floor(seconds * sr), fade = N - out;
  for (let i = 0; i < fade; i++) { const t = i / fade, a = Math.sqrt(t), b = Math.sqrt(1 - t); L[i] = L[i] * a + L[out + i] * b; R[i] = R[i] * a + R[out + i] * b; }
  let dc = 0; for (let i = 0; i < out; i++) dc += L[i] + R[i]; dc /= out * 2;
  let peak = 1e-6; for (let i = 0; i < out; i++) { L[i] -= dc; R[i] -= dc; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
  const g = 0.8 / peak; for (let i = 0; i < out; i++) { L[i] *= g; R[i] *= g; }
  return { L: L.subarray(0, out), R: R.subarray(0, out), sr };
}

function renderClaps({ seconds, sr, rate, seed }) {
  const rnd = rngOf(seed), N = Math.floor(seconds * sr), L = new Float32Array(N), R = new Float32Array(N);
  let t = 0;
  while (t < seconds - 0.05) {
    t += -Math.log(1 - rnd()) / rate;
    const at = Math.floor(t * sr), len = Math.floor(sr * (0.012 + rnd() * 0.02)), pan = rnd(), gL = Math.cos(pan * Math.PI / 2), gR = Math.sin(pan * Math.PI / 2), lv = 0.3 + rnd() * 0.7, f = 1100 + rnd() * 1600, w = 2 * Math.PI * f / sr, r = Math.exp(-Math.PI * 900 / sr), a1 = 2 * r * Math.cos(w), b1 = -r * r; let y = 0, yb = 0;
    for (let i = 0; i < len * 3 && at + i < N; i++) { const e = i < len ? Math.exp(-i / (len * 0.28)) : 0, o = (rnd() - 0.5) * e + a1 * y + b1 * yb; yb = y; y = o; const v = o * lv * 0.2; L[(at + i) % N] += v * gL; R[(at + i) % N] += v * gR; }
  }
  let peak = 1e-6; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.8 / peak; for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
  return { L, R, sr };
}

/* a struck bell: inharmonic partials over about 1 kHz, each a slightly detuned pair so it beats as it rings */
function renderBell(sr) {
  const dur = 3, N = Math.floor(dur * sr), d = new Float32Array(N), F0 = 1046, P = [[1, 1, 2.6], [1.48, 0.55, 1.8], [2, 0.65, 1.3], [2.74, 0.34, 0.9], [3.76, 0.26, 0.55], [5.1, 0.16, 0.3]], rnd = rngOf(77);
  for (const [m, a, t60] of P) for (const det of [0.9995, 1.0005]) { const w = 2 * Math.PI * F0 * m * det / sr, k = Math.exp(-6.9 / (t60 * sr)); let e = a / 2, ph = rnd() * 6; for (let i = 0; i < N; i++) { d[i] += Math.sin(ph) * e; ph += w; e *= k; } }
  for (let i = 0, n = Math.floor(sr * 0.006); i < n; i++) d[i] += (rnd() - 0.5) * 1.4 * (1 - i / n);
  let peak = 1e-6; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(d[i]));
  for (let i = 0; i < N; i++) d[i] *= 0.9 / peak;
  return d;
}

/* Everything the crowd needs, as source text for a worker, so a second or two of synthesis never touches a frame. */
const workerSource = () => `const clamp=${clamp.toString()};const rngOf=${rngOf.toString()};const nextSlice=()=>Promise.resolve();${renderCrowd.toString()}${renderClaps.toString()}
onmessage=async(e)=>{const d=e.data,m=await renderCrowd(d.murmur),r=await renderCrowd(d.roar),c=renderClaps(d.claps);const own=(o)=>({L:o.L.slice(),R:o.R.slice(),sr:o.sr});const M=own(m),R=own(r),C=own(c);postMessage({murmur:M,roar:R,claps:C},[M.L.buffer,M.R.buffer,R.L.buffer,R.R.buffer,C.L.buffer,C.R.buffer]);};`;
function crowdInWorker(specs, onWorker) {
  return new Promise((ok, no) => {
    const url = URL.createObjectURL(new Blob([workerSource()], { type: 'text/javascript' }));
    const w = new Worker(url); onWorker(w);
    w.onmessage = (e) => { URL.revokeObjectURL(url); w.terminate(); ok(e.data); };
    w.onerror = (e) => { URL.revokeObjectURL(url); w.terminate(); no(e); };
    w.postMessage(specs);
  });
}
async function crowdHere(specs) { return { murmur: await renderCrowd(specs.murmur), roar: await renderCrowd(specs.roar), claps: renderClaps(specs.claps) }; }

function inert() {
  return { ready: Promise.resolve(), crowdReady: Promise.resolve(), onEvent() {}, update() {}, land() {}, unlock() {}, setPaused() {}, setHidden() {}, setVolume() {}, setEnabled() {}, newMatch() {}, destroy() {}, get ctx() { return null; } };
}

export function createAudio(opts = {}) {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!opts.ctx && (!AC || opts.enabled === false)) return inert(); /* sound off: no context at all, so nothing touches the phone's audio */
  let ctx;
  try { ctx = opts.ctx || new AC({ latencyHint: 'interactive' }); } catch (e) { return inert(); }
  let enabled = opts.enabled !== false, volume = opts.volume ?? 0.7, destroyed = false;
  const lite = !!opts.lite, sr = ctx.sampleRate, offline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;
  const rnd = rngOf(opts.seed ?? 4242), rr = (a, b) => a + (b - a) * rnd();
  const live = () => offline || ctx.state === 'running'; /* a context that is not running would save everything up and play it all at once when it wakes */
  const loops = []; /* what runs for ever, to stop by hand if the context outlives this */

  /* ---- graph ---- */
  const master = ctx.createGain(); master.gain.value = enabled ? volume : 0;
  const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -3; limiter.knee.value = 3; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.12;
  master.connect(limiter); limiter.connect(ctx.destination);
  const hitBus = ctx.createGain();
  const shaper = ctx.createWaveShaper(); { const c = new Float32Array(1025), k = 1.7, n = Math.tanh(k); for (let i = 0; i < 1025; i++) { const x = (i / 512) - 1; c[i] = Math.tanh(k * x) / n; } shaper.curve = c; shaper.oversample = '2x'; }
  hitBus.connect(shaper); shaper.connect(master);
  const fxBus = ctx.createGain(); fxBus.connect(master);
  const verb = ctx.createConvolver(); const verbOut = ctx.createGain(); verbOut.gain.value = 0.5; verb.connect(verbOut); verbOut.connect(master);
  { const n = Math.floor(sr * 0.85), b = ctx.createBuffer(2, n, sr), r0 = rngOf(99);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr, a = 1 - Math.exp(-2 * Math.PI * (500 + 3000 * Math.exp(-t * 7)) / sr); lp += (((r0() - 0.5) * Math.exp(-t / 0.2)) - lp) * a; d[i] = lp; } for (const [ms, g] of [[11, 0.5], [17, 0.42], [29, 0.3], [41, 0.24], [63, 0.14]]) d[Math.floor(ms * (c ? 1.13 : 1) * sr / 1000)] += g * 0.25; }
    verb.buffer = b; }
  const send = (node, amt) => { const g = ctx.createGain(); g.gain.value = amt; node.connect(g); g.connect(verb); };
  send(hitBus, 0.22); send(fxBus, 0.08);
  const crowdIn = ctx.createGain(), crowdHP = ctx.createBiquadFilter(), crowdLP = ctx.createBiquadFilter(), crowdOut = ctx.createGain();
  crowdHP.type = 'highpass'; crowdHP.frequency.value = 120; crowdLP.type = 'lowpass'; crowdLP.frequency.value = 2200; crowdLP.Q.value = 0.3; crowdOut.gain.value = 0;
  crowdIn.connect(crowdHP); crowdHP.connect(crowdLP); crowdLP.connect(crowdOut); crowdOut.connect(master); send(crowdLP, 0.16);

  const NOISE_LEN = 2;
  const noise = ctx.createBuffer(1, Math.floor(sr * NOISE_LEN), sr); { const d = noise.getChannelData(0), r0 = rngOf(11); for (let i = 0; i < d.length; i++) d[i] = r0() * 2 - 1; }

  const now = (when) => (when != null ? when : ctx.currentTime + 0.003);
  function shape(g, t, a, peak, d) { g.setValueAtTime(0.00001, t); g.linearRampToValueAtTime(peak, t + a); g.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function burst(t, type, f, q, a, d, peak, out = hitBus, sweepTo = 0) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), dur = a + d + 0.03;
    s.buffer = noise; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (sweepTo) fl.frequency.exponentialRampToValueAtTime(sweepTo, t + a + d);
    shape(g.gain, t, a, peak, d); s.connect(fl); fl.connect(g); g.connect(out);
    s.start(t, rnd() * (NOISE_LEN - 0.1)); s.stop(t + dur);
  }
  function tone(t, type, f0, f1, sweep, a, d, peak, out = hitBus) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    shape(g.gain, t, a, peak, d); o.connect(g); g.connect(out); o.start(t); o.stop(t + a + d + 0.03);
  }

  /* ---- punches ---- */
  /* Filtered noise keeps only a part of its power, so its gains read high: a low-passed burst at 600 Hz has about a tenth of the level of a sine at the same gain. */
  const PUNCH = {
    jab: { th: 0.15, f0: 210, f1: 92, dt: 0.065, body: 0.95, bf: 1000, bd: 0.05, sm: 1.25, sf: 1700, sd: 0.018, sn: 0.16 },
    cross: { th: 0.22, f0: 190, f1: 80, dt: 0.095, body: 1.9, bf: 860, bd: 0.07, sm: 1.8, sf: 1450, sd: 0.024, sn: 0.2 },
    hook: { th: 0.27, f0: 175, f1: 72, dt: 0.12, body: 3.0, bf: 700, bd: 0.09, sm: 2.1, sf: 1200, sd: 0.03, sn: 0.18, sub: 0.11 },
    upper: { th: 0.27, f0: 180, f1: 74, dt: 0.12, body: 2.8, bf: 780, bd: 0.09, sm: 2.2, sf: 1300, sd: 0.03, sn: 0.2, sub: 0.11 },
    bodyL: { th: 0.2, f0: 150, f1: 72, dt: 0.1, body: 3.2, bf: 430, bd: 0.1, sm: 0.6, sf: 820, sd: 0.02, sn: 0.03, hollow: 0.16, hf: 200 },
    bodyR: { th: 0.22, f0: 142, f1: 68, dt: 0.11, body: 3.5, bf: 400, bd: 0.11, sm: 0.6, sf: 780, sd: 0.02, sn: 0.03, hollow: 0.18, hf: 184 },
  };
  function punch(ev, t) {
    const P = PUNCH[ev.kind] || PUNCH.jab, p = clamp(ev.power ?? 0.5, 0, 1), det = rr(0.93, 1.07), lv = rr(0.86, 1.06) * (0.74 + p * 0.3) * (ev.counter ? 1.12 : 1);
    if (ev.blocked) {
      /* a padded glove on a padded glove: bright and short, not much below */
      tone(t, 'sine', 260 * det, 150 * det, 0.05, 0.002, 0.045, 0.07 * lv);
      burst(t, 'bandpass', 1300 * det, 1.1, 0.001, 0.026, 1.0 * lv);
      burst(t + 0.006, 'highpass', 3600, 0.5, 0.001, 0.012, 0.05 * lv);
      return;
    }
    tone(t, 'sine', P.f0 * det, P.f1 * det, P.dt * 0.6, 0.0015, P.dt, P.th * lv);
    burst(t, 'lowpass', P.bf * det, 0.7, 0.001, P.bd, P.body * lv);
    burst(t, 'bandpass', P.sf * det, 1, 0.001, P.sd, P.sm * lv);
    burst(t, 'highpass', 4200, 0.5, 0.0006, 0.006, P.sn * lv);
    if (P.hollow) tone(t, 'triangle', P.hf * det, P.hf * 0.82 * det, 0.09, 0.002, 0.11, P.hollow * lv);
    if (P.sub || ev.counter) tone(t, 'sine', 58 * det, 38 * det, 0.16, 0.004, 0.2, (P.sub || 0.2) * lv);
  }
  function whoosh(t, dur, peak, from, to) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; s.loop = true; fl.type = 'bandpass'; fl.Q.value = 1.3; fl.frequency.setValueAtTime(from, t); fl.frequency.exponentialRampToValueAtTime(to, t + dur * 0.55); fl.frequency.exponentialRampToValueAtTime(from * 0.9, t + dur);
    g.gain.setValueAtTime(0.00001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0002, t + dur);
    s.connect(fl); fl.connect(g); g.connect(fxBus); s.start(t, rnd() * (NOISE_LEN - 0.1)); s.stop(t + dur + 0.02);
  }

  /* ---- bell ---- */
  let bellBuf = null;
  function ringBell(t, level = 1) {
    if (!bellBuf) { const d = renderBell(sr); bellBuf = ctx.createBuffer(1, d.length, sr); bellBuf.copyToChannel(d, 0); }
    const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = bellBuf; g.gain.value = 0.3 * level; s.connect(g); g.connect(master); send(g, 0.2); s.start(t);
  }

  /* ---- crowd ---- */
  const crowd = { murmur: null, roar: null, claps: null, excite: 0, base: 0, acc: 0, started: false };
  function crowdVoice(data) {
    const b = ctx.createBuffer(2, data.L.length, data.sr); b.copyToChannel(data.L, 0); b.copyToChannel(data.R, 1);
    const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; s.loop = true; g.gain.value = 0; s.connect(g); g.connect(crowdIn); s.start(ctx.currentTime, rnd() * (data.L.length / data.sr)); loops.push(s);
    return { s, g };
  }
  let worker = null;
  const crowdReady = (async () => {
    if (!enabled || opts.noCrowd) return;
    /* room tone: low rumble under everything */
    const rt = ctx.createBufferSource(), rl = ctx.createBiquadFilter(), rg = ctx.createGain(); rt.buffer = noise; rt.loop = true; rl.type = 'lowpass'; rl.frequency.value = 340; rg.gain.value = 0.02; rt.connect(rl); rl.connect(rg); rg.connect(master); rt.start(); loops.push(rt);
    const sr2 = 22050, n = lite ? 8 : 16;
    const specs = {
      murmur: { seconds: lite ? 6 : 8, sr: sr2, talkers: n, f0: [88, 180], syl: [0.12, 0.36], gap: 0.3, vowels: VOWELS, seed: 1234 },
      roar: { seconds: lite ? 4 : 6, sr: sr2, talkers: n, f0: [170, 320], syl: [0.35, 1.1], gap: 0.06, vowels: OPEN, seed: 5678 },
      claps: { seconds: 4, sr: sr2, rate: 34, seed: 91 },
    };
    let out;
    try { out = await crowdInWorker(specs, (w) => { worker = w; }); } catch (e) { worker = null; if (destroyed) return; out = await crowdHere(specs); }
    worker = null; if (destroyed) return;
    crowd.murmur = crowdVoice(out.murmur); crowd.roar = crowdVoice(out.roar); crowd.claps = crowdVoice(out.claps); crowd.started = true;
  })().catch((e) => { console.warn('[arena] crowd sound failed:', e); });

  function excite(v) { crowd.excite = Math.min(1.4, crowd.excite + v); }

  function onEvent(ev, when) {
    if (!enabled || destroyed || !live()) return;
    const t = now(when);
    switch (ev.type) {
      case 'hit': punch(ev, t); excite((ev.power || 0) * (ev.clean ? 0.42 : 0.2) + (ev.counter ? 0.12 : 0)); break;
      case 'block': punch(ev, t); excite(0.03); break;
      case 'throw': { const p = ev.power || 0.4; whoosh(t, 0.11 + p * 0.1, 0.05 + p * 0.05, 520, 1500 + p * 700); if (rnd() < 0.55) burst(t + 0.01, 'highpass', 2900, 0.6, 0.012, 0.06, 0.012 + p * 0.012, fxBus); break; }
      case 'whiff': whoosh(t, 0.2, 0.09 + (ev.power || 0.4) * 0.08, 1100, 520); break;
      case 'slipped': whoosh(t, 0.16, 0.1, 700, 2000); excite(0.25); break;
      case 'step': { const p = ev.power ?? 0.5; burst(t, 'lowpass', 260, 0.7, 0.002, 0.04, 0.03 + p * 0.03, fxBus); tone(t, 'sine', 95, 70, 0.04, 0.002, 0.04, 0.03 + p * 0.03, fxBus); if (rnd() < 0.16) { const f = rr(1500, 2600); tone(t + 0.01, 'sine', f, f * rr(0.9, 1.1), 0.05, 0.006, 0.05, 0.012, fxBus); } break; }
      case 'rope': { const p = ev.power || 0.3; tone(t, 'sine', 92, 60, 0.1, 0.004, 0.14, 0.14 + p * 0.2, fxBus); tone(t + 0.01, 'triangle', 196, 142, 0.2, 0.01, 0.2, 0.03 + p * 0.03, fxBus); burst(t, 'bandpass', 620, 3, 0.01, 0.18, 0.03 + p * 0.03, fxBus); break; }
      case 'knockdown': excite(1.1); break;
      case 'count': { burst(t, 'bandpass', 920, 1.2, 0.001, 0.03, 0.2); tone(t, 'sine', 170, 92, 0.05, 0.002, 0.07, 0.2); excite(0.1 + (ev.n || 0) * 0.01); break; }
      case 'getup': { for (let i = 0; i < 3; i++) burst(t + i * 0.1 + rr(0, 0.03), 'lowpass', 360, 0.8, 0.003, 0.05, 0.22, fxBus); excite(0.5); break; }
      case 'bell': ringBell(t); break;
      case 'fight': if (!ev.resumed) { ringBell(t + 0.24, 0.9); excite(0.35); } break;
      case 'round_end': ringBell(t + 0.24, 0.9); ringBell(t + 0.48, 0.85); excite(0.2); break;
      case 'ko': case 'tko': case 'stopped': for (let i = 1; i <= 3; i++) ringBell(t + i * 0.17, 0.95); excite(1.4); break;
      case 'decision': excite(0.9); break;
      case 'stagger': excite(0.3); break;
      default: break;
    }
  }

  /* a body landing on the canvas: index.js calls this when the rig's pelvis gets there */
  function land(when) {
    if (!enabled || destroyed || !live()) return;
    const t = now(when);
    tone(t, 'sine', 84, 36, 0.16, 0.003, 0.3, 0.6);
    burst(t, 'lowpass', 420, 0.7, 0.002, 0.13, 1.2);
    burst(t + 0.092, 'lowpass', 300, 0.7, 0.002, 0.08, 0.2);
    tone(t + 0.092, 'sine', 70, 40, 0.1, 0.003, 0.12, 0.28);
  }

  /* levels from the state of the fight, set about 12 times a second */
  function update(match, dt, when) {
    if (!enabled || destroyed || !crowd.started || !live()) return;
    crowd.excite = Math.max(0, crowd.excite - dt * crowd.excite / 2.1 - dt * 0.02);
    crowd.acc += dt; if (crowd.acc < 0.08) return; crowd.acc = 0;
    const st = match.state; let base = st === 'fight' ? 0.42 : st === 'down' ? 0.72 : st === 'over' ? 0.66 : st === 'break' ? 0.34 : 0.4;
    if (st === 'fight') { const low = Math.min(match.p.hp, match.o.hp); if (low < 35) base += (35 - low) / 35 * 0.28; if (match.clock < 10) base += 0.08; }
    const e = clamp(crowd.excite, 0, 1.2), t = when != null ? when : ctx.currentTime, k = 0.09;
    crowdOut.gain.setTargetAtTime(0.28 + base * 0.34, t, 0.5);
    crowd.murmur.g.gain.setTargetAtTime(0.42 + base * 0.22 - e * 0.1, t, k * 2);
    crowd.roar.g.gain.setTargetAtTime(clamp(base * 0.18 + Math.pow(e, 1.5) * 1.5, 0, 1.7), t, e > 0.5 ? k * 0.6 : k * 2.5);
    crowd.claps.g.gain.setTargetAtTime(clamp((st === 'intro' || st === 'over' ? 0.34 : 0.03) + Math.max(0, e - 0.5) * 0.4, 0, 0.6), t, k * 3);
    crowdLP.frequency.setTargetAtTime(1500 + e * 3200, t, k);
  }

  /* ---- a context may start suspended, and iOS can stop it at any time: a phone call, Siri, another app ---- */
  const wakeOn = ['pointerdown', 'pointerup', 'touchend', 'mousedown', 'keydown', 'click'];
  let wired = false, paused = false, hidden = false;
  const wake = () => { if (!destroyed && !paused && !hidden && ctx.state !== 'running' && ctx.state !== 'closed' && ctx.resume) ctx.resume().catch(() => {}); };
  const settle = () => { if (offline || destroyed) return; if (paused || hidden) { if (ctx.state === 'running' && ctx.suspend) ctx.suspend().catch(() => {}); } else wake(); };

  return {
    ready: Promise.resolve(), crowdReady,
    onEvent, update, land,
    unlock() { if (offline || !enabled || wired) return; wired = true; for (const n of wakeOn) window.addEventListener(n, wake, true); ctx.addEventListener('statechange', wake); wake(); },
    setPaused(on) { paused = !!on; settle(); },
    setHidden(on) { hidden = !!on; settle(); },
    setVolume(v) { volume = v; master.gain.value = enabled ? volume : 0; },
    setEnabled(on) { enabled = !!on; master.gain.value = enabled ? volume : 0; },
    newMatch() { crowd.excite = 0.3; },
    destroy({ keepCtx = false } = {}) {
      if (destroyed) return; destroyed = true; if (wired) { wired = false; for (const n of wakeOn) window.removeEventListener(n, wake, true); ctx.removeEventListener('statechange', wake); } if (worker) { worker.terminate(); worker = null; }
      if (keepCtx) { for (const s of loops) { try { s.stop(); } catch (e) { /* never started */ } } limiter.disconnect(); return; } /* the next try at opening uses the same context */
      if (!offline && ctx.close && ctx.state !== 'closed') ctx.close().catch(() => {});
    },
    get ctx() { return ctx; },
  };
}
