/* The opponent, and the test bots that play the player's side.
   createAI({ difficulty, seed }) -> { decide(match, me, foe, dt) -> Input, style(), level }
   createBot(name, { seed, kind }) -> { decide(match, me, foe, dt) -> Input }, names in BOTS.

   Nothing here touches the sim. It reads fighters and returns an Input, like a player does.
   The opponent only knows what he saw `react` seconds ago (eye below), so a punch can land before he can answer it.
   He can still block a fast punch by having his hands up already, and he can still be hit by a slow one: his reads are rolls,
   and he cannot defend while he is throwing. */
import { PUNCHES, REACH, HEAD, TUNE, STEP, makeRng } from './sim.js';

/* react: seconds behind the fight. jitter: extra random delay. The others are chances per read. cadence scales the gap between attacks. */
export const LEVELS = {
  easy:   { react: .27, jitter: .05, guardRead: .15, spamRead: .5, slipRead: .10, backRead: .15, punish: .2, anticip: .2, cadence: 1.2, cadVar: .8, mistake: .20, finish: .35, speed: .86, upBonus: 0, ease: 2.6, press: 0, feast: .3, finishGap: .9, retreat: .6, spar: .75, hurtHead: 12, hurtHp: 5, leadAt: 7, threatAt: 6, lunge: .35, learn: 0 },
  normal: { react: .18, jitter: .03, guardRead: .34, spamRead: .6, slipRead: .22, backRead: .35, punish: .36, anticip: .33, cadence: 1.03, cadVar: .7, mistake: .08, finish: .6, speed: .96, upBonus: .1, ease: 1.6, press: .15, feast: .8, finishGap: .5, retreat: .9, spar: 1, hurtHead: 10.5, hurtHp: 10, leadAt: 6, threatAt: 5, lunge: .8, learn: .4 },
  hard:   { react: .13, jitter: .02, guardRead: .34, spamRead: .7, slipRead: .28, backRead: .4, punish: .38, anticip: .34, cadence: 1.03, cadVar: .5, mistake: .02, finish: .7, speed: .98, upBonus: .12, ease: .5, press: .3, feast: 1, finishGap: .25, retreat: 1, spar: 1, hurtHead: 10.5, hurtHp: 10, leadAt: 4, threatAt: 4.6, lunge: .8, learn: .6 },
};

/* A style is a way of fighting you can recognise from across the room. Round 1 he boxes, round 2 he comes through you, round 3 he waits to hurt you. */
const R = (seq, w) => ({ seq, w, cost: seq.reduce((a, k) => a + PUNCHES[k].sta, 0), load: seq.reduce((a, k) => a + PUNCHES[k].head, 0), body: seq.some((k) => PUNCHES[k].tgt === 'body'), head: seq.some((k) => PUNCHES[k].tgt === 'head'), heavy: seq.some((k) => PUNCHES[k].heavy) });
export const STYLES = {
  jabber: { name: 'jabber', drive: 1, range: 1.36, rest: 1.5, cover: 1.52, heavy: 1.2, circle: .8, tempo: 1.0, floor: 22, out: .75, slip: 1, anticip: .4, punish: .9,
    plans: [R(['jab'], 2.4), R(['jab', 'jab'], 1.6), R(['jab', 'cross'], 4.6), R(['jab', 'bodyL'], .8), R(['cross'], 1.6), R(['jab', 'hook'], .5)] },
  presser: { name: 'presser', drive: 2, range: .88, rest: .92, cover: .92, heavy: 2, circle: .25, tempo: .86, floor: 24, out: .1, slip: .55, anticip: 2, punish: 1,
    plans: [R(['bodyL', 'hook'], 3), R(['jab', 'bodyR'], 2), R(['bodyR', 'upper'], 2), R(['hook', 'bodyL'], 2), R(['jab', 'hook'], 2), R(['bodyL', 'bodyR'], 1.6), R(['upper'], 1)] },
  hunter: { name: 'hunter', drive: 1, range: 1.22, rest: 1.48, cover: 1.52, heavy: 3, circle: .5, tempo: 1.3, floor: 20, out: .5, slip: 1.35, anticip: .4, punish: 1.45,
    plans: [R(['cross', 'hook'], 3), R(['jab', 'hook'], 3), R(['hook'], 2.2), R(['cross'], 2.2), R(['upper'], 1.4), R(['jab', 'cross', 'hook'], 1), R(['bodyR', 'hook'], 1.6), R(['bodyL', 'cross'], 1.6), R(['jab'], .8)] },
};

/* For a man emptying himself on one button: straight and fast, because a cross beats anything slower and his arms are already down. */
const FEAST = [R(['cross'], 4), R(['jab', 'cross'], 2), R(['cross', 'cross'], 2), R(['cross', 'hook'], 1)];

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* How the opponent changes against a man who cannot defend (soft 1): heavier plans fade by load, gaps grow by tempo, he gives less ground by retreat and stands nearer by close. */
/* Heat 0..1 undoes that and more. It rises when the head load he took over the last threatFade seconds passes the level's threatAt (span threatSpan), or when he carries leadAt more load than the man (span leadSpan): gaps shrink by heatTempo, heavy plans grow by heatHeavy, punishing rises by heatPunish.
   Kite: the share of the man's punches after which he is moving away. Past kiteAt he stays on him, gaps shrink by kiteTempo, and the level's lunge is the chance of going in behind the punch with a cross from up to lungeReach beyond range.
   freqRate: how fast he learns what a man throws. The level's learn turns that into reads. reads: how much soft takes off his reads. waitSta: stamina he needs to keep waiting out a one-button man. */
export const TEMPER = { load: 3.2, tempo: .4, retreat: .5, close: .25, easeCap: 1.7, feastFloor: 34, threatFade: 20, threatSpan: 1.5, heatTempo: .45, heatPunish: .3, lungeReach: .42, kiteAt: .45, kiteTempo: .6, heatHeavy: 3, freqRate: .12, reads: .7, leadSpan: 2, waitSta: 12 };

/* What a fighter has seen of the other one, indexed by time, so he can only act on the past. */
function makeEye(size = 96) {
  const buf = []; for (let i = 0; i < size; i++) buf.push({ t: -1e9, x: 0, z: 0, vx: 0, vz: 0, guard: 0, kind: null, pt: 0, contact: 0, dur: 0, phase: null, pid: 0, result: null, stagger: 0, slip: 0, hp: 100, sta: 100, head: 0, landed: 0, down: false });
  let at = 0, n = 0;
  return {
    see(t, f) {
      const s = buf[at]; at = (at + 1) % size; if (n < size) n++;
      s.t = t; s.x = f.x; s.z = f.z; s.vx = f.vx; s.vz = f.vz; s.guard = f.guard; s.stagger = f.stagger; s.slip = f.slip; s.hp = f.hp; s.sta = f.sta; s.head = f.head; s.landed = f.landed; s.down = !!f.down;
      const p = f.punch; s.pid = f.thrown;
      if (p) { s.kind = p.kind; s.pt = p.t; s.contact = p.contact; s.dur = p.dur; s.phase = p.phase; s.result = p.result; } else { s.kind = null; s.phase = null; s.result = null; }
    },
    at(t) {
      for (let i = 1; i <= n; i++) { const s = buf[(at - i + size) % size]; if (s.t <= t) return s; }
      return buf[(at - n + size) % size];
    },
    clear() { n = 0; at = 0; },
  };
}

function blank() { return { mx: 0, mz: 0, guard: false, punch: null, slip: false, getUp: false }; }
function reset(o) { o.mx = 0; o.mz = 0; o.guard = false; o.punch = null; o.slip = false; o.getUp = false; return o; }
const CHAINS = { cross: 1, hook: 1, bodyL: 1, bodyR: 1 };

export function createAI({ difficulty = 'normal', seed = 1 } = {}) {
  const L = LEVELS[difficulty] || LEVELS.normal;
  const rnd = makeRng(seed);
  const eye = makeEye();
  const o = blank();
  const S = {
    round: 0, style: STYLES.jabber, plan: [], planT: 0, next: 0, circle: 1, circleT: 0,
    seenPid: 0, foeGuard: 0, throws: [], lastThrow: -9, punished: 0,
    spamUntil: 0, coverUntil: 0, guardUntil: 0, backUntil: 0, antUntil: 0, antNext: 0, outUntil: 0, slipNow: false,
    taken: 0, hits: [], upFor: null, upAt: Infinity, upMash: 0, readNext: 0, finishing: false, landRate: .5, graded: 0, soft: 0, same: 0, lastKind: null, holdUntil: 0, chase: 0, threat: 0, heat: 0, lastHead: 0, freq: { jab: .17, cross: .17, hook: .17, upper: .17, bodyL: .17, bodyR: .17 }, kite: 0, endSeen: 0, hadPunch: false, lunge: false,
  };

  function newRound(match, me, foe, now) {
    S.round = match.round;
    S.style = match.round <= 1 ? STYLES.jabber : match.round === 2 ? STYLES.presser : STYLES.hunter;
    S.plan.length = 0; S.next = now + .35 + rnd() * .4; S.coverUntil = 0; S.outUntil = 0; S.circle = rnd() < .5 ? 1 : -1; S.circleT = now + 1.5; S.seenPid = foe.thrown;
    eye.clear();
  }

  /* The referee counts and he rolls once: can he get up at all, and how late. It worsens with head load and with each knockdown. */
  function rollUp(me, dt) {
    const d = me.down;
    if (S.upFor !== d) {
      S.upFor = d; S.upMash = 0;
      const h = me.head / HEAD.stop;
      const chance = clamp(1.04 - .55 * h * h - .10 * (me.kdTotal - 1) + L.upBonus, .05, .98);
      S.upAt = rnd() < chance ? 1.6 + rnd() * 2.6 + 3.2 * h : Infinity;
    }
    if (d.t >= S.upAt) { S.upMash += dt * 11; o.getUp = (S.upMash % 1) < .5; }
  }

  /* Well ahead on clean shots or on the bars he has no need to rush and saves his arms, so a weaker player still gets a fight. */
  function easeOff(me, s) { return Math.min(TEMPER.easeCap, 1 + Math.max(Math.max(0, me.hp - s.hp) / 100, Math.max(0, me.landed - s.landed) / 12) * L.ease); }

  function pickPlan(dist, me, foe, finishing, feast) {
    const plans = feast ? FEAST : finishing || S.heat > .5 ? STYLES.hunter.plans : S.style.plans; let tot = 0; const fg = S.foeGuard; /* an opening turns any style into a puncher */
    const weight = (p) => {
      let w = p.w;
      if (fg > .55) w *= p.body ? 2.2 : .55; else if (fg < .2 && p.head) w *= 1.2;
      if (me.sta < p.cost + 6) w *= .15;
      if (p.heavy) w *= finishing ? 2 : S.style.heavy * (1 + S.heat * (TEMPER.heatHeavy - 1));
      w *= Math.exp(-S.soft * TEMPER.load * p.load);
      if (dist > REACH[p.seq[0]] + .35) w *= .55;
      return w;
    };
    for (const p of plans) tot += weight(p);
    let r = rnd() * tot;
    for (const p of plans) { r -= weight(p); if (r <= 0) return p; }
    return plans[0];
  }

  function decide(match, me, foe, dt = STEP) {
    reset(o);
    if (match.state === 'over') return o;
    if (me.down) { rollUp(me, dt); return o; }
    if (match.state !== 'fight') return o;
    const now = match.time;
    if (match.round !== S.round) newRound(match, me, foe, now);
    eye.see(now, foe);

    const delay = L.react * (me.head >= HEAD.bad ? 1.5 : me.head >= HEAD.warn ? 1.25 : 1);
    const s = eye.at(now - delay), age = now - s.t; /* the sample he can see, and how old it really is on this frame */
    const px = s.x + s.vx * age, pz = s.z + s.vz * age;
    const dx = px - me.x, dz = pz - me.z, dist = Math.hypot(dx, dz) || 1e-3, nx = dx / dist, nz = dz / dist;
    const sty = S.style;

    /* How much of what he throws is landing, over his last dozen or so. A man who cannot defend gets the jab and the body, not the heavy hands, until he hurts him back. */
    const mine = me.punch;
    if (mine && mine.result && mine.id !== S.graded) { S.graded = mine.id; S.landRate += ((mine.result === 'hit' ? 1 : 0) - S.landRate) * .12; }
    /* How hard is this man really hitting him? The head load he has taken, fading over twenty seconds. A man who cannot defend but hits like this is no beginner: he gets the real fight, and faster. */
    S.threat = (S.threat + Math.max(0, me.head - S.lastHead)) * Math.exp(-dt / TEMPER.threatFade); S.lastHead = me.head;
    S.heat = clamp(Math.max((S.threat - L.threatAt) / TEMPER.threatSpan, (me.head - s.head - L.leadAt) / TEMPER.leadSpan), 0, 1); /* and he only spares a man he is beating */
    S.soft = L.spar * clamp((S.landRate - .5) / .25, 0, 1) * (1 - clamp((me.head - L.hurtHead) / 8, 0, 1)) * clamp((me.hp - L.hurtHp) / 30, 0, 1) * (1 - S.heat);
    if (S.spamUntil > now || s.t - S.lastThrow > 4) S.soft = 0; /* a one-button man, or a man who is not fighting at all, gets the full fight */
    const soft = S.soft;

    S.foeGuard += ((s.guard > .5 ? 1 : 0) - S.foeGuard) * dt / 3;

    /* Does he throw and get out? Looked at once, a moment after each of his punches ends. */
    if (S.hadPunch && !s.kind) S.endSeen = now + .12;
    S.hadPunch = !!s.kind;
    if (S.endSeen && now >= S.endSeen) { S.endSeen = 0; S.kite += ((s.vx * nx + s.vz * nz > .9 ? 1 : 0) - S.kite) * .2; }

    /* took a run of shots: cover up */
    if (me.taken !== S.taken) { for (let i = S.taken; i < me.taken; i++) S.hits.push(now); S.taken = me.taken; }
    while (S.hits.length && S.hits[0] < now - 1.6) S.hits.shift();
    /* He will not stop throwing. While he is fresh: back off out of range and let him empty himself, saving his own arms, because a held guard refills nothing. Once he is empty he is open, and how hard that is taken is the level's press. */
    while (S.throws.length && S.throws[0] < s.t - 3) S.throws.shift();
    if (S.throws.length >= 6 || S.same >= 5) S.spamUntil = now + 3;
    const spammer = S.spamUntil > now, feast = spammer && s.sta < 30 && me.sta > 15;
    if (me.stagger > 0 || (S.hits.length >= 3 && !spammer)) { if (S.coverUntil < now + .3) S.coverUntil = now + .9 + rnd() * 1.1; S.plan.length = 0; S.hits.length = 0; }
    const hurt = me.hp < 30 || me.head >= HEAD.bad;
    const covering = S.coverUntil > now && me.sta > 10;
    const waitOut = spammer && S.throws.length >= 4 && s.sta >= 30 && me.sta > TEMPER.waitSta;
    const gassed = me.sta < (feast && !(S.lastKind && PUNCHES[S.lastKind].drain) ? TEMPER.feastFloor : sty.floor);
    const free = !me.punch && me.stun <= 0;

    /* a punch he has just become able to see */
    if (s.kind && s.pid !== S.seenPid) {
      S.seenPid = s.pid;
      S.lastThrow = s.t - s.pt;
      S.throws.push(S.lastThrow);
      if (s.kind === S.lastKind) S.same++; else { S.same = 1; S.lastKind = s.kind; }
      for (const k in S.freq) S.freq[k] += ((k === s.kind ? 1 : 0) - S.freq[k]) * TEMPER.freqRate; /* a man who keeps throwing the same thing gets read */
      const P = PUNCHES[s.kind], left = s.contact - s.pt - age - rnd() * L.jitter, reach = REACH[s.kind];
      if (P.tgt === 'head') {
        const r = rnd();
        const lower = 1 - soft * TEMPER.reads;
        if (left >= TUNE.slip.from && me.sta > TUNE.slip.sta + 10 && r < L.slipRead * sty.slip * lower) { S.slipNow = true; }
        else if (r < (L.slipRead * sty.slip + L.guardRead + L.learn * S.freq[s.kind] + (S.spamUntil > now ? L.spamRead : 0)) * lower) { if (left > -.02) S.guardUntil = now + Math.max(0, left) + .24; if (left > .03) S.holdUntil = now + left + .06; }
        else if (dist > reach - .16 && rnd() < L.backRead) S.backUntil = now + .22;
      } else if (dist > reach - .16 && rnd() < L.backRead) S.backUntil = now + .24;
    }

    /* he is committed and I can see it: hit him before he is back */
    if (free && !covering && s.kind && s.phase !== 'startup' && s.pid !== S.punished && me.sta > 12) {
      S.punished = s.pid;
      const leftRec = s.dur - s.pt - age, hot = S.heat > .5;
      if (rnd() < (L.punish * sty.punish + (s.sta < 25 ? .35 : 0) + S.heat * TEMPER.heatPunish) * (1 - soft)) {
        let k = null;
        if (dist <= REACH.hook && (leftRec > .2 || hot) && me.sta > 20) k = rnd() < .5 * sty.heavy ? 'hook' : 'cross';
        else if (dist <= REACH.cross && (leftRec > .14 || hot) && me.sta > 16) k = 'cross';
        else if (dist <= REACH.jab) k = 'jab';
        if (k) { S.plan.length = 0; S.plan.push(k); if (k === 'jab' && rnd() < .5) S.plan.push('cross'); S.planT = now; }
      }
      /* He jabs and is gone before there is an answer: do not wait for him to come back, go in behind the punch as he leaves. */
      if (S.kite > TEMPER.kiteAt && me.sta > 16 && dist <= REACH.cross + TEMPER.lungeReach && rnd() < L.lunge) { S.plan.length = 0; S.plan.push('cross'); S.planT = now; S.lunge = true; }
    }

    /* his armour after being interrupted lets him walk through a jab: use it on a man who will not stop throwing */
    if (free && me.armor > .15 && !S.plan.length && dist <= REACH.hook && me.sta > 18 && s.kind && s.sta < 30) { S.plan.push(rnd() < .6 ? 'hook' : 'upper'); S.planT = now; }

    /* posture: low hands, a stagger, a run of shots means an opening. He looks a few times a second and rolls each time, so the frame rate does not change how often he takes it. */
    if (now >= S.readNext) {
      S.readNext = now + .35;
      S.finishing = (s.hp < 28 || s.stagger > 0 || s.head >= HEAD.bad) && rnd() < L.finish * (1 - soft * .6);
      if (S.finishing) { const g = L.finishGap * easeOff(me, s); if (S.next > now + g) S.next = now + g; }
      else if (s.sta < 25 && L.press > 0) { const g = (S.next - now) * (1 - L.press * (1 - soft)); if (g > 0) S.next = now + g; }
    }
    /* a man emptying himself on one button: go through him */
    if (feast && S.next > now + .05 + (1 - L.feast) * .9) S.next = now + .05 + (1 - L.feast) * .9;
    const finishing = S.finishing || feast, kiting = S.kite > TEMPER.kiteAt;

    /* attack */
    if (feast) S.coverUntil = Math.min(S.coverUntil, now);
    if (S.plan.length) {
      const k = S.plan[0], mine = me.punch;
      const chain = mine && mine.kind === 'jab' && mine.hit && mine.phase === 'recovery' && CHAINS[k];
      if ((!mine || chain) && me.stun <= 0 && !covering && S.holdUntil <= now) {
        const at = dist + (s.vx * nx + s.vz * nz) * PUNCHES[k].start - PUNCHES[k].start * .7; /* where he will be when it arrives, stepping in */
        if ((at <= REACH[k] - .03 && dist <= REACH[k] + (REACH[k] < 1 ? .04 : .12)) || S.wild || S.lunge) { o.punch = k; S.plan.shift(); S.planT = now; S.wild = false; S.lunge = false; if (!S.plan.length) { S.next = now + PUNCHES[k].start + PUNCHES[k].rec + sty.tempo * L.cadence * (1 + soft * TEMPER.tempo) * (1 - S.heat * TEMPER.heatTempo) * (kiting ? TEMPER.kiteTempo : 1) * easeOff(me, s) * (1.6 - L.cadVar / 2 + rnd() * L.cadVar); if (rnd() < sty.out * (1 - soft)) S.outUntil = S.next - .15; } }
        else if (now - S.planT > .75) S.plan.length = 0;
      } else if (covering) S.plan.length = 0;
    } else if (now >= S.next && !gassed && !covering && !waitOut && free && S.holdUntil <= now) {
      const p = pickPlan(dist, me, foe, finishing, feast);
      S.plan.length = 0; for (const k of p.seq) S.plan.push(k); S.planT = now;
      S.wild = rnd() < L.mistake;
    }

    /* slip */
    if (S.slipNow) {
      S.slipNow = false;
      if (free) { o.slip = true; const c = rnd() < .5 ? 1 : -1; o.mx = -nz * c; o.mz = nx * c; return o; }
    }

    /* guard */
    if (now >= S.antNext) {
      S.antNext = now + .22 + rnd() * .3;
      const threat = dist < REACH.cross + .26;
      if (threat && me.sta > 16 && rnd() < L.anticip * sty.anticip * (hurt || spammer ? 1.5 : 1) * (gassed ? .5 : 1) * (1 - soft * TEMPER.reads)) S.antUntil = S.antNext;
      else S.antUntil = 0;
    }
    o.guard = S.holdUntil > now || covering || S.guardUntil > now || S.antUntil > now;

    /* feet */
    let want = sty.range - soft * TEMPER.close;
    if (me.punch && me.punch.phase === 'startup') want = REACH[me.punch.kind] - .14; /* step into the punch he is throwing */
    else if (covering || waitOut) want = sty.cover;
    else if (gassed) want = sty.rest;
    else if (S.backUntil > now) want = dist + .4;
    else if (S.plan.length) want = REACH[S.plan[0]] - .07;
    else if (S.outUntil > now) want = REACH.cross + .2;
    /* he keeps backing off: go and get him, and aim where he is going so the ropes do the rest */
    const away = s.vx * nx + s.vz * nz;
    S.chase = clamp(S.chase + (away > .5 ? dt : -dt * 2), 0, 3);
    const chasing = S.chase > 1.4 && !gassed && !covering && !waitOut;
    if ((chasing || (kiting && !gassed && !covering && !waitOut)) && want > REACH.jab - .1) want = REACH.jab - .1;
    const err = dist - want;
    let fwd = Math.abs(err) < .03 ? 0 : clamp(err / (err > 0 ? .15 / sty.drive : .15), -1, 1);
    if (fwd < 0 && !covering && !waitOut && S.backUntil <= now) fwd *= L.retreat * (1 - soft * TEMPER.retreat);
    if (now >= S.circleT) { if (rnd() < .4) S.circle = -S.circle; S.circleT = now + 1 + rnd() * 2; }
    let side = S.circle * sty.circle;
    const lim = match.ring.limit, bx = me.x - nx * .55, bz = me.z - nz * .55;
    if (Math.abs(bx) > lim || Math.abs(bz) > lim) { /* back to the ropes: slide along them to the open side */
      const toCentre = -(me.x * -nz + me.z * nx);
      side = toCentre >= 0 ? .95 : -.95;
      if (fwd < 0) fwd *= .3;
    }
    if (covering || gassed) side *= 1.1;
    let hx = nx, hz = nz;
    if (chasing && fwd > 0) { const lx = px + s.vx * .4 - me.x, lz = pz + s.vz * .4 - me.z, ll = Math.hypot(lx, lz) || 1; hx = lx / ll; hz = lz / ll; side *= .3; }
    o.mx = (hx * fwd - hz * side) * L.speed; o.mz = (hz * fwd + hx * side) * L.speed;
    return o;
  }

  return { decide, level: difficulty, style: () => S.style.name };
}

/* ---------- test bots for the player's side ---------- */
export const BOTS = ['idle', 'spam', 'mixed', 'skilled', 'turtle', 'learner', 'runner', 'guardjab'];

function masher(rate) { let ph = 0; return (dt) => { ph += dt * rate; return (ph % 1) < .5; }; }

export function createBot(name, { seed = 1, kind = 'jab' } = {}) {
  const rnd = makeRng(seed), o = blank();
  if (name === 'idle') return { decide() { return reset(o); } };

  if (name === 'turtle') {
    const up = masher(6);
    return { decide(match, me, foe, dt = STEP) { reset(o); if (me.down) o.getUp = up(dt); else o.guard = true; return o; } };
  }

  if (name === 'spam') {
    const up = masher(6);
    return { kind, decide(match, me, foe, dt = STEP) {
      reset(o); if (me.down) { o.getUp = up(dt); return o; }
      const dx = foe.x - me.x, dz = foe.z - me.z, d = Math.hypot(dx, dz) || 1;
      if (d > .78) { o.mx = dx / d; o.mz = dz / d; }
      o.punch = kind; return o;
    } };
  }

  if (name === 'mixed') {
    const up = masher(5); const K = Object.keys(PUNCHES);
    let next = 0, gUntil = 0, sx = 0, sT = 0;
    return { decide(match, me, foe, dt = STEP) {
      reset(o); if (me.down) { o.getUp = up(dt); return o; }
      if (match.state !== 'fight') return o;
      const now = match.time, dx = foe.x - me.x, dz = foe.z - me.z, d = Math.hypot(dx, dz) || 1, nx = dx / d, nz = dz / d;
      if (now >= sT) { sx = rnd() < .5 ? 0 : rnd() < .5 ? .7 : -.7; sT = now + .5 + rnd(); }
      const f = d > 1.0 ? 1 : d < .85 ? -.5 : 0;
      o.mx = nx * f - nz * sx; o.mz = nz * f + nx * sx;
      if (now >= next) {
        next = now + .32 + rnd() * .75;
        const r = rnd();
        if (r < .72) o.punch = K[Math.floor(rnd() * K.length)];
        else if (r < .92) gUntil = now + .3 + rnd() * .5;
        else o.slip = true;
      }
      o.guard = gUntil > now;
      return o;
    } };
  }

  if (name === 'skilled') {
    /* A good human: sees with about 220 ms of delay, holds range, steps in to jab and chain, takes the guard up when he is close,
       slips what he can see coming, makes the man pay for whiffing, and rests when he is low. */
    const up = masher(7), eye = makeEye();
    const react = .22;
    let plan = [], planT = 0, next = 0, gUntil = 0, backUntil = 0, seen = 0, punished = 0, circle = 1, cT = 0, fg = 0, antNext = 0, antUntil = 0, round = 0, slipNow = false;
    return { decide(match, me, foe, dt = STEP) {
      reset(o); if (me.down) { o.getUp = up(dt); return o; }
      if (match.state !== 'fight') return o;
      const now = match.time;
      if (round !== match.round) { round = match.round; eye.clear(); plan = []; next = now + .4; seen = foe.thrown; }
      eye.see(now, foe);
      const s = eye.at(now - react), px = s.x + s.vx * react, pz = s.z + s.vz * react;
      const dx = px - me.x, dz = pz - me.z, d = Math.hypot(dx, dz) || 1e-3, nx = dx / d, nz = dz / d;
      fg += ((s.guard > .5 ? 1 : 0) - fg) * dt / 2.5;
      const free = !me.punch && me.stun <= 0;

      if (s.kind && s.pid !== seen) {
        seen = s.pid;
        const P = PUNCHES[s.kind], left = s.contact - s.pt - react - rnd() * .04;
        if (P.tgt === 'head') {
          if (left >= TUNE.slip.from && me.sta > 30 && rnd() < .6) slipNow = true;
          else gUntil = now + Math.max(0, left) + .24;
        } else backUntil = now + .24;
      }
      if (free && s.kind && s.phase !== 'startup' && s.pid !== punished) {
        punished = s.pid;
        const leftRec = s.dur - s.pt - react;
        if (d <= REACH.upper && leftRec > .2 && me.sta > 22) plan = [rnd() < .5 ? 'upper' : 'hook'];
        else if (d <= REACH.hook && leftRec > .2 && me.sta > 22) plan = [fg < .4 && rnd() < .5 ? 'hook' : 'cross'];
        else if (d <= REACH.cross && leftRec > .12 && me.sta > 18) plan = ['cross'];
        else if (d <= REACH.jab && me.sta > 12) plan = ['jab', 'cross'];
        planT = now;
      }
      if (!plan.length && now >= next && free && me.sta > 34) {
        const r = rnd();
        if (fg > .5) plan = r < .55 ? ['bodyL', 'bodyR'] : r < .8 ? ['jab', 'bodyR'] : ['bodyR'];
        else plan = r < .3 ? ['jab'] : r < .68 ? ['jab', 'cross'] : r < .84 ? ['jab', 'hook'] : r < .93 ? ['cross', 'hook'] : ['bodyL', 'hook'];
        planT = now; next = now + 1.5 + rnd() * 1.2;
      }
      if (plan.length) {
        const k = plan[0], mine = me.punch, chain = mine && mine.kind === 'jab' && mine.hit && mine.phase === 'recovery' && CHAINS[k];
        if ((!mine || chain) && me.stun <= 0) {
          const at = d + (s.vx * nx + s.vz * nz) * PUNCHES[k].start - PUNCHES[k].start * .7;
          if (at <= REACH[k] - .03 && d <= REACH[k] + (REACH[k] < 1 ? .04 : .1)) { o.punch = k; plan.shift(); planT = now; }
          else if (now - planT > .6) plan = [];
        }
      }
      if (now >= antNext) {
        antNext = now + .2 + rnd() * .25;
        const close = d < REACH.cross + .22;
        antUntil = close && me.sta > 20 && rnd() < .55 ? antNext : 0;
        const closing = -(s.vx * nx + s.vz * nz) > .8; /* he is stepping in: a read, not a reaction, slip the shot that is coming */
        if (close && free && !plan.length && me.sta > 40 && rnd() < (closing ? .4 : .08)) slipNow = true;
      }
      if (slipNow) { slipNow = false; if (free) { o.slip = true; const c = rnd() < .5 ? 1 : -1; o.mx = -nz * c; o.mz = nx * c; return o; } }
      o.guard = gUntil > now || antUntil > now;
      let want = REACH.cross + .14;
      if (backUntil > now) want = d + .4;
      else if (me.punch && me.punch.phase === 'startup') want = REACH[me.punch.kind] - .14;
      else if (plan.length) want = REACH[plan[0]] - .05;
      else if (me.sta < 30) want = REACH.cross + .5;
      const err = d - want; let f = Math.abs(err) < .03 ? 0 : clamp(err / .14, -1, 1);
      if (now >= cT) { if (rnd() < .5) circle = -circle; cT = now + .8 + rnd() * 1.6; }
      let side = circle * .55;
      const lim = match.ring.limit, bx = me.x - nx * .5, bz = me.z - nz * .5;
      if (Math.abs(bx) > lim || Math.abs(bz) > lim) { const toCentre = -(me.x * -nz + me.z * nx); side = toCentre >= 0 ? .9 : -.9; if (f < 0) f *= .3; }
      o.mx = nx * f - nz * side; o.mz = nz * f + nx * side;
      return o;
    } };
  }
  if (name === 'learner') {
    /* A plausible first-time human. Sees the fight 250 ms late, walks at the rival, and throws when he looks close, with no real feel for range.
       Mostly jabs and crosses, in short bursts with a pause to look. After being hit he sometimes remembers the guard. He never slips, and does not
       watch his stamina: when his arms are gone the press simply does nothing. */
    const up = masher(5), eye = makeEye(), react = .25;
    let next = 0, left = 0, gUntil = 0, seenTaken = 0, round = 0;
    const pick = () => { const r = rnd(); return r < .5 ? 'jab' : r < .82 ? 'cross' : r < .91 ? 'hook' : r < .94 ? 'upper' : r < .97 ? 'bodyL' : 'bodyR'; };
    return { decide(match, me, foe, dt = STEP) {
      reset(o); if (me.down) { o.getUp = up(dt); return o; }
      if (match.state !== 'fight') return o;
      const now = match.time;
      if (round !== match.round) { round = match.round; eye.clear(); next = now + .4 + rnd() * .5; left = 0; gUntil = 0; seenTaken = me.taken; }
      eye.see(now, foe);
      const s = eye.at(now - react), dx = s.x - me.x, dz = s.z - me.z, d = Math.hypot(dx, dz) || 1e-3, nx = dx / d, nz = dz / d;
      if (me.taken !== seenTaken) { seenTaken = me.taken; if (rnd() < .35) gUntil = Math.max(gUntil, now + react + .5 + rnd() * .8); }
      const f = d > .98 ? 1 : d < .8 ? -.4 : 0;
      o.mx = nx * f; o.mz = nz * f;
      const guarding = gUntil > now;
      o.guard = guarding;
      if (!guarding && now >= next && d < 1.18) {
        o.punch = pick();
        if (left <= 0) left = rnd() < .4 ? 0 : rnd() < .67 ? 1 : 2; else left--;
        next = now + (left > 0 ? .28 + rnd() * .27 : .7 + rnd() * 1.1);
      }
      return o;
    } };
  }

  if (name === 'runner') {
    /* Backs away and circles all fight. Throws a jab only when he is on the ropes with the rival on top of him. */
    const up = masher(6);
    let circle = rnd() < .5 ? 1 : -1, cT = 0, next = 0;
    return { decide(match, me, foe, dt = STEP) {
      reset(o); if (me.down) { o.getUp = up(dt); return o; }
      if (match.state !== 'fight') return o;
      const now = match.time, dx = foe.x - me.x, dz = foe.z - me.z, d = Math.hypot(dx, dz) || 1e-3, nx = dx / d, nz = dz / d;
      if (now >= cT) { if (rnd() < .4) circle = -circle; cT = now + 1 + rnd() * 2; }
      let back = -1, side = circle * .7;
      const lim = match.ring.limit, bx = me.x - nx * .6, bz = me.z - nz * .6, trapped = Math.abs(bx) > lim || Math.abs(bz) > lim;
      if (trapped) { const toCentre = -(me.x * -nz + me.z * nx); side = toCentre >= 0 ? 1 : -1; back = -.25; }
      o.mx = nx * back - nz * side; o.mz = nz * back + nx * side;
      if (trapped && d <= REACH.jab && now >= next && me.sta >= PUNCHES.jab.sta) { o.punch = 'jab'; next = now + .45 + rnd() * .3; }
      return o;
    } };
  }

  if (name === 'guardjab') {
    /* Holds the guard and taps the jab when the rival is in range. A held guard never refills the bar, so when it is nearly empty he drops his hands and backs off until it comes back. */
    const up = masher(6);
    let next = 0, rest = false;
    return { decide(match, me, foe, dt = STEP) {
      reset(o); if (me.down) { o.getUp = up(dt); return o; }
      if (match.state !== 'fight') return o;
      const now = match.time, dx = foe.x - me.x, dz = foe.z - me.z, d = Math.hypot(dx, dz) || 1e-3, nx = dx / d, nz = dz / d;
      if (me.sta < 8) rest = true; else if (me.sta > 40) rest = false;
      o.guard = !rest;
      const f = rest ? -1 : d > REACH.jab - .04 ? 1 : 0;
      o.mx = nx * f; o.mz = nz * f;
      if (!rest && d <= REACH.jab && now >= next) { o.punch = 'jab'; next = now + .5 + rnd() * .35; }
      return o;
    } };
  }
  throw new Error('no such bot: ' + name);
}
