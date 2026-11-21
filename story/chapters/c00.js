/* Story Mode — chapters/c00.js — Chapter 0, One More Round (BIBLE ch00; ref-story.pdf Chapter 0).
   Saturday, August 20, 1994. Feel what he had, then feel it taken away mid-sentence.

   Places
     kessler_ave_1994         the run home at golden hour; after dinner, Teddy's wagon at the river end
     kessler_412_stairs_1994  the stairwell (three levels); Mrs. Okafor on the 3rd landing on the way out
     apt_3b_1994              3B: Jin's room, the hall, the sock door, the kitchen, the living room (custom place)
     c00_river_road           the drive to the Civic (custom: amber bars sweep the wagon)
     civic_backstage_1994     Dock B, the corridor, the commission table, Locker A (Castell), Locker B, the tunnel door
     civic_locker_b           wraps (Hold still), Teddy's mitts (teaching in motion), the coat, the four missing seconds
     c00_tunnel               the walk-out in the dark (custom), Teddy's hand on Jin's shoulder
     civic_ring_1994          the bowl: Section 14 Row F, Row K, the press row, the 1961 bell; three rounds and the fall
   Main quest q0_main; optional q0_look_around (4 of 8 things in 3B; closes when Jin leaves 3B).
   Choices: ch0_purse_dream, ch0_refusal_line, ch0_told_teddy; observed ch0_resistance (counters in round 3).
   Memories: mem_kitchen, mem_offer, mem_bottle (shard 1), mem_corner (shard 1), mem_row (shard 1), mem_bell.
   Local engine additions (notes/c00.md): tether NPC, Hold still, the bout supervisor, small prop draws. */
(function (S) {
  'use strict';
  const N = 0, P = S.places;
  if (!S || !P || typeof S.defineChapter !== 'function') return;

  const KX = P.spots.kesslerAve, ST4 = P.spots.kessler412Stairs, CB = P.spots.civicBackstage, LB = P.spots.civicLockerB, CR = P.spots.civicRing;
  const flag = (G, k) => !!(G && G.flags && G.flags[k]);
  const fv = (G, k) => (G && G.flags ? G.flags[k] : undefined);
  const has = (o, fn) => !!o && typeof o[fn] === 'function';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pol = () => !!(S.director && S.director.policy);
  // A wait that a person would sit through, shortened when a test policy plays the chapter.
  const T = (s) => (pol() ? Math.min(s, 1.2) : s);
  const toast = (text, kind) => { try { S.events.emit('toast', { text, kind: kind || 'tip' }); } catch (_) { /* no ui */ } };
  const snd = (name, o) => { try { if (S.audio && !S.headless) S.audio.play(name, o); } catch (_) { /* ignore */ } };
  const W = () => S.world;
  const actor = (id) => (S.world && has(S.world, 'actor') ? S.world.actor(id) : null);
  const here = (loc) => !!(S.world && S.world.locId === loc);
  const ROUND_GROUND = CR.floorY;          // 480: the bowl's floor and the ring canvas

  /* ── Looks this chapter needs that cast.js does not ship (prefixed c00_) ── */
  const JSKIN = (S.pal && S.pal.jinSkin) || '#d6a47e';
  function jinBase(o) {
    return Object.assign({ h: 46, build: 'boxer', skin: JSKIN, hair: { style: 'twoblock', color: (S.pal && S.pal.jinHair) || '#3b2a20' },
      top: { kind: 'track', color: (S.pal && S.pal.jinTop) || '#4d6b93', color2: (S.pal && S.pal.jinStripe) || '#d8d2c1' },
      bottom: { kind: 'pants', color: (S.pal && S.pal.jinPants) || '#1e1f26' }, shoes: (S.pal && S.pal.jinShoes) || '#d4cfc2', extras: [] }, o || {});
  }
  if (typeof S.defineLook === 'function') {
    // The run home: the track top, a towel round his neck. No scar: this is 1994.
    S.defineLook('c00_jin_run', jinBase({ extras: ['scarf:#e6e1d4'] }));
    // Locker B before the gloves: bare chest, the blue trunks (pale waistband), bare hands, then wraps.
    S.defineLook('c00_jin_trunks', jinBase({ top: { kind: 'bare', color: JSKIN }, bottom: { kind: 'trunks', color: '#3a5a90' }, shoes: '#262a3a', extras: [] }));
    S.defineLook('c00_jin_wraps', jinBase({ top: { kind: 'bare', color: JSKIN }, bottom: { kind: 'trunks', color: '#3a5a90' }, shoes: '#262a3a', extras: ['wraps'] }));
    // Mr. Han of Han's Market: sleeves rolled, a grocer's apron.
    S.defineLook('c00_han', { h: 43, build: 'old', skin: '#d2a07c', hair: { style: 'gray_short', color: '#5e5a56' },
      top: { kind: 'shirt', color: '#c8c2b0' }, bottom: { kind: 'slacks', color: '#3a3c40' }, shoes: '#2a2622', extras: ['apron:#3f6a44', 'glasses'] });
    // Two kids from the Saturday class, shadowboxing over their own chalk ring.
    S.defineLook('c00_kid_a', { h: 30, build: 'kid', skin: '#8d5f43', hair: { style: 'short', color: '#1f1a17' },
      top: { kind: 'tee', color: '#a8842f' }, bottom: { kind: 'shorts', color: '#3a4a66' }, shoes: '#d8d2c4', extras: [] });
    S.defineLook('c00_kid_b', { h: 32, build: 'kid', skin: '#c99a78', hair: { style: 'buzz', color: '#3a2a1e' },
      top: { kind: 'tank', color: '#7a3a34' }, bottom: { kind: 'shorts', color: '#2e3442' }, shoes: '#c8c2b4', extras: ['cap:#33507a'] });
    // Castell's people in the corridor.
    S.defineLook('c00_manager', { h: 47, build: 'avg', skin: '#e0b898', hair: { style: 'slick', color: '#3a3430' },
      top: { kind: 'suit', color: '#6a6a70', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#6a6a70' }, shoes: '#1a1614', extras: ['tie:#7a2a2a', 'watch'] });
    S.defineLook('c00_second', { h: 46, build: 'broad', skin: '#a8714f', hair: { style: 'short', color: '#1b1410' },
      top: { kind: 'jacket', color: '#c9a13b', color2: '#2a2a2e' }, bottom: { kind: 'sweats', color: '#2a2a2e' }, shoes: '#ece6d8', extras: ['scarf:#e6e1d4'] });
  }

  /* ══════════════════════════════════════════════════════════════════
     RUNTIME: one post-step hook (tether, Hold still, the bout supervisor, Teddy's horn) and a few draw hooks.
     Everything here no-ops outside Chapter 0.
     ══════════════════════════════════════════════════════════════════ */
  const RT = { hooked: false, drawn: false, tether: null, tethers: null, leavers: null, still: null, bout: null, mitts: null, honkT: 18, slipBase: null, pentax: 0, drive: false, glovesOnBench: false };

  function resetRT() {
    RT.tether = null; RT.tethers = null; RT.leavers = null; RT.still = null; RT.mitts = null; RT.pentax = 0; RT.drive = false; RT.glovesOnBench = false;
    if (RT.bout) clearBoutFx();
    RT.bout = null;
  }
  function ensureHooks() {
    if (!RT.hooked && S.main && has(S.main, 'onStep')) { RT.hooked = true; S.main.onStep(postStep, true); }
    if (!RT.drawn && S.world && has(S.world, 'addDraw')) {
      RT.drawn = true;
      S.world.addDraw('back', drawProps);
      S.world.addDraw('emissive', drawGlow);
      S.world.addDraw('screen', drawScreen);
    }
  }
  if (S.events && has(S.events, 'on')) {
    S.events.on('chapterStart', () => { ensureHooks(); resetRT(); });
    S.events.on('loaded', () => { ensureHooks(); resetRT(); });
    S.events.on('enterLoc', () => ensureHooks());
    S.events.on('fightStart', onBoutStart);
    S.events.on('boutRound', onBoutRound);
    S.events.on('counter', onCounter);
    S.events.on('hit', onHit);
    S.events.on('slip', onSlip);
  }
  ensureHooks();

  function postStep(dt) {
    const G = S.G;
    if (!G || G.chapter !== N) { if (RT.tether || RT.tethers || RT.bout || RT.still) resetRT(); return; }
    try { tetherStep(dt); } catch (e) { RT.tether = null; S.fail(e, { source: 'c00 tether' }); }
    try { boutStep(dt); } catch (e) { S.fail(e, { source: 'c00 bout' }); }
    try { honkStep(dt); } catch (e) { S.fail(e, { source: 'c00 horn' }); }
    try { stepTethers(dt); stepLeavers(); } catch (e) { RT.tethers = null; S.fail(e, { source: 'c00 step' }); }
    if (RT.pentax > 0) RT.pentax = Math.max(0, RT.pentax - dt * 3);
  }

  /* ── Tether NPC (bible Global, Direction grammar 1): a person who keeps step with Jin ──
     { id, loc, off: px ahead (+) or behind (-) in the walking direction, walk: pose while moving, rest: pose when still,
       turn: face Jin when he stops (Min turns round to talk), speed } */
  function tether(o) { RT.tether = o ? Object.assign({ off: 18, walk: 'walk', rest: 'idle', speed: 130, dir: -1, turn: false }, o) : null; }
  function tetherStep(dt) {
    const t = RT.tether, w = W();
    if (!t || !w || w.locId !== t.loc) return;
    const a = actor(t.id), j = w.jin;
    if (!a || !j || a.goal) return;
    const vx = +j.vx || 0, moving = Math.abs(vx) > 6;
    if (moving) t.dir = vx > 0 ? 1 : -1;
    const want = j.x + t.dir * t.off, d = want - a.x, step = t.speed * dt;
    a.x += Math.abs(d) <= step ? d : Math.sign(d) * step;
    a.vx = 0;
    const going = moving || Math.abs(d) > 1.5;
    a.face = going ? (Math.abs(d) > 1.5 ? Math.sign(d) || t.dir : t.dir) : (t.turn ? (Math.sign(j.x - a.x) || 1) : t.dir);
    const pose = going ? t.walk : t.rest;
    if (a.pose !== pose) { if (has(w, 'setPose')) w.setPose(a, pose); else a.pose = pose; }
  }

  /* ── Hold still (bible Global timing table): no input at all for N seconds; moving restarts the count ── */
  const STILL_KEYS = ['left', 'right', 'up', 'down', 'jump', 'punch', 'dash', 'slip', 'flurry'];
  function anyHeld() {
    const I = S.input;
    if (!I || !has(I, 'rawHeld')) return false;
    for (const k of STILL_KEYS) if (I.rawHeld(k)) return true;
    return false;
  }
  function stillWait(A, seconds, onMove) {
    const s = RT.still = { need: seconds, t: 0, last: S.time, held: false, label: 'HOLD STILL' };
    return A.waitFor(() => {
      const now = S.time, dt = clamp(now - s.last, 0, 0.1);
      s.last = now;
      const h = anyHeld();
      if (h) {
        if (!s.held && s.t > 0.2 && onMove) { try { onMove(); } catch (_) { /* a bark */ } }
        s.held = true; s.t = 0;
        return false;
      }
      s.held = false;
      s.t += dt;
      if (s.t >= s.need) { if (RT.still === s) RT.still = null; return true; }
      return false;
    }, { control: false });
  }

  /* ── Teddy's horn after dinner: twice, then a long one; again every so often until Jin is in the wagon ── */
  function honkStep(dt) {
    const G = S.G;
    if (!flag(G, 'c00_kitchen_done') || flag(G, 'c00_in_wagon')) return;
    const w = W(); if (!w || !/^(apt_3b_1994|kessler_412_stairs_1994|kessler_ave_1994)$/.test(w.locId || '')) return;
    if (S.director && S.director.busy) return;
    RT.honkT -= dt;
    if (RT.honkT > 0) return;
    RT.honkT = 26;
    snd('carHorn', { vol: w.locId === 'kessler_ave_1994' ? 0.7 : 0.35 });
  }

  /* ══════════════════════════════════════════════════════════════════
     THE TITLE BOUT SUPERVISOR. Each round is its own A.bout (startRound n); RT.bout carries the night across them.
     ══════════════════════════════════════════════════════════════════ */
  const OPP = 'c00_ray_e';
  const isOurs = (id) => String(id || '').indexOf('c00_r') === 0;
  function curBout() {
    const b = S.combat && S.combat.state && S.combat.state.bout;
    return b && !b.done && isOurs(b.id) ? b : null;
  }
  function onBoutStart(d) {
    const R = RT.bout;
    if (!R || !d || !isOurs(d.id)) return;
    const b = S.combat.state.bout;
    if (!b) return;
    R.round = b.round; R.t = 0; R.finish = false; R.saved = false; R.rain = R.rain || false; R.flashDone = R.round !== 2 ? R.flashDone : false;
    if (R.jinHp != null && S.combat.jin) S.combat.jin.hp = clamp(R.jinHp, 30, S.combat.jin.hpMax || 100);
    if (R.rayHp != null && b.opponent && b.opponent.enemy) b.opponent.hp = clamp(R.rayHp, b.opponent.enemy.hpMax * 0.55, b.opponent.enemy.hpMax);
  }
  function onBoutRound(d) {
    if (!RT.bout || !d || !isOurs(d.id)) return;
    if (d.phase === 'fight') { snd('bell', { vol: 1 }); setMood('cheer'); }
    if (d.phase === 'end') snd('bell', { vol: 1 });
  }
  function onCounter(d) {
    const R = RT.bout, b = curBout();
    if (!R || !b || !d || d.target !== b.opponent) return;
    if (R.round === 1) {
      snd('crowdRoar', { vol: 0.8 }); setMood('cheer');
      if (S.world) S.world.bark('min', 'KES-SLER! KES-SLER!', 2.2);
    } else if (R.round === 3) {
      R.resistance = Math.min(3, (R.resistance || 0) + 1);
      snd('crowdRoar', { vol: 1 }); setMood('cheer');
      if (S.world) S.world.bark('teddy', "THAT'S IT!", 2);
    }
  }
  function onHit(d) {
    // The warm-up mitts and the bag (Locker B) and the guard lesson read hits; see the warm-up scene.
    const M = RT.mitts;
    if (!M || !d) return;
    const j = S.world && S.world.jin;
    if (d.attacker === j && d.target && d.target.id === 'c00_mitts') M.hits.push({ move: d.move, t: S.time, counter: !!d.counter });
    else if (d.attacker === j && d.target && d.target.id === 'c00_bag') M.bag++;
    else if (d.target === j && d.attacker && d.attacker.id === 'c00_mitts') M.taken.push({ blocked: !!d.blocked, t: S.time });
  }
  function onSlip(d) {
    const M = RT.mitts;
    if (!M || !d || !d.attacker || d.attacker.id !== 'c00_mitts') return;
    M.slips.push({ ok: !!d.ok, early: !!d.early, late: !!d.late, t: S.time });
  }
  function setMood(m) {
    try {
      const L = S.world && S.world.loc;
      if (!L || !L.layers) return;
      for (const n in L.layers) for (const p of L.layers[n] || []) if (p && p.t === 'crowd') p.mood = m;
    } catch (_) { /* cosmetic */ }
  }
  // The rounds' debuffs (BoutDef.debuff): round 2 goes wrong at 0:20 over 6 s; round 3 is worse from the bell.
  function debuff(round, t) {
    const R = RT.bout || {};
    if (round === 2) { const k = clamp((t - 20) / 6, 0, 1); return { speedMul: 1 - 0.25 * k, delay: 0.08 * k, muffle: 0.72 * k, double: 0 }; }
    if (round === 3) { const st = R.stumbleT > 0 ? 0.6 : 1; return { speedMul: 0.5 * st, delay: 0.15, muffle: 0.82, double: 0.5 }; }
    return null;
  }
  function boutStep(dt) {
    const R = RT.bout;
    if (!R) return;
    if (R.flashT > 0) R.flashT = Math.max(0, R.flashT - dt);
    const b = curBout();
    if (!b) return;
    const C = S.combat, j = C.jin, e = b.opponent, r = b.round, t = b.roundElapsed || 0, fight = b.phase === 'fight';
    // Ray resists: he cannot drop below 55% tonight. Jin cannot be knocked down before the end the story needs.
    if (e && e.enemy && e.hp < e.enemy.hpMax * 0.55) e.hp = e.enemy.hpMax * 0.55;
    if (j) {
      if (r === 1 && j.hp < 30) j.hp = 30;
      if (r === 2 && j.hp < 18) {
        j.hp = 18;
        if (fight && !R.saved) { R.saved = true; snd('bell', { vol: 1 }); C.endFight(true); return; }   // saved by the bell
      }
      if (r === 3) {
        if (j.hp < 20) j.hp = 20;
        if (fight && !R.finish && (t >= 40 || j.hp <= 25)) { R.finish = true; C.endFight(true); return; }
      }
    }
    // The body going wrong.
    const k = r === 2 ? clamp((t - 20) / 6, 0, 1) : r === 3 ? 1 : 0;
    if (C.body) C.body.dmgMul = r === 2 ? 1 - 0.4 * k : r === 3 ? 0.4 : 1;
    if (S.tune && Array.isArray(S.tune.slipWindow)) {
      if (RT.slipBase === null) RT.slipBase = S.tune.slipWindow[1];
      const want = +(RT.slipBase - (r === 2 ? 0.02 * k : r === 3 ? 0.03 : 0)).toFixed(4);
      if (S.tune.slipWindow[1] !== want) S.tune.slipWindow[1] = want;
    }
    if (S.fx && !S.headless) S.fx.heartbeat = r === 2 ? 0.55 * k : r === 3 ? 0.85 : 0;
    if (k > 0) {
      R.beatT = (R.beatT || 0) - dt;
      if (R.beatT <= 0) { R.beatT = 1.15 - 0.45 * k; snd('heartbeat', { vol: 0.4 + 0.5 * k }); }
    }
    if (r === 2 && k > 0 && !R.rain) { R.rain = true; try { if (!S.headless) S.audio.loop('rain', 0.3, 2.5); } catch (_) { /* ignore */ } }
    if (r === 2 && t >= 20.3 && !R.legs) { R.legs = true; if (S.world) S.world.bark('jin', 'My legs. Why are my legs—', 3); }
    if (r === 2 && t >= 23 && !R.tip) { R.tip = true; toast("Your body isn't answering. Keep your guard up.", 'tip'); }
    // 0:40 of round 2: the interrupted recollection (freeze 0.25 s, then 0.9 s of Locker B: the bottle).
    if (r === 2 && t >= 40 && !R.flashDone && fight) {
      R.flashDone = true; R.flashT = 1.15; S.hitstop = Math.max(S.hitstop || 0, 1.15);
      snd('heartbeat', { vol: 1 });
      if (S.director && has(S.director, 'addMemory')) S.director.addMemory('mem_bottle');
      R.jabAfter = true;
    }
    if (R.jabAfter && !(R.flashT > 0) && e) { R.jabAfter = false; try { C.enemyAttack(e, 'jab'); } catch (_) { /* he was busy */ } }
    // Round 3: he stumbles if he keeps moving for more than a second.
    if (r === 3) {
      const a = S.world && S.world.jin;
      if (R.stumbleT > 0) R.stumbleT = Math.max(0, R.stumbleT - dt);
      if (a && Math.abs(+a.vx || 0) > 20) { R.moveT = (R.moveT || 0) + dt; if (R.moveT > 1) { R.moveT = 0; R.stumbleT = 0.4; snd('step', { vol: 0.6 }); if (S.world && has(S.world, 'fx')) S.world.fx('dust', a.x, a.y); } }
      else R.moveT = 0;
    }
    // The chin tap: the left glove goes up to his chin and above his head before the straight right (bible E0.2 #2).
    if (e && e.enemy && e.enemy.state === 'windup' && e.enemy.atk && e.enemy.atk.name === 'right') {
      if (R.tellAtk !== e.enemy.atk) { R.tellAtk = e.enemy.atk; R.tellAt = S.time; snd('block', { vol: 0.3 }); }
    }
  }
  function clearBoutFx() {
    try {
      if (S.combat && S.combat.body) S.combat.body.dmgMul = 1;
      if (RT.slipBase !== null && S.tune && Array.isArray(S.tune.slipWindow)) S.tune.slipWindow[1] = RT.slipBase;
      RT.slipBase = null;
      if (S.fx) { S.fx.heartbeat = 0; S.fx.double = 0; S.fx.blur = 0; }
      if (S.audio && S.audio.muffle) S.audio.muffle(0, 0.5);
      if (S.audio && S.audio.loop && !S.headless) S.audio.loop('rain', 0, 1.5);
    } catch (_) { /* best effort */ }
  }

  /* ── Draw hooks (no-ops headless and outside Chapter 0) ─────────────── */
  const inCh0 = () => !!(S.G && S.G.chapter === N && S.world && S.world.loc);
  function R_(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function drawProps(c) {
    if (!inCh0()) return;
    const id = S.world.locId, G = S.G, gy = (S.world.loc.ground || 300);
    if (id === 'kessler_ave_1994') {
      // Sidewalk chalk: a ring, JIN in the blue corner.
      const x = KX.chalk - 16, y = gy + 3;
      c.globalAlpha = 0.55;
      R_(c, x, y, 32, 1, '#e8e4d8'); R_(c, x, y + 9, 32, 1, '#e8e4d8'); R_(c, x, y, 1, 10, '#e8e4d8'); R_(c, x + 31, y, 1, 10, '#e8e4d8');
      R_(c, x + 1, y + 1, 3, 3, '#6a8ac8'); R_(c, x + 28, y + 6, 3, 3, '#c86a5a');
      c.globalAlpha = 0.7;
      if (S.font && has(S.font, 'draw')) S.font.draw(c, 'JIN', x + 6, y + 2, { color: '#8aa8e0' });
      c.globalAlpha = 1;
      // The hydrant's water running along the gutter.
      R_(c, KX.hydrant + 8, gy + 14, 160, 1, 'rgba(160,190,210,0.35)');
    } else if (id === 'apt_3b_1994') {
      // The navy robe on its hanger (EASTGATE across the back), the gym bag, the sock on the bathroom knob,
      // the strawberry magnet, the rice cooker, the Singer, pencil height marks on the doorframe.
      R_(c, AX.robe - 1, gy - 92, 3, 2, '#8a8478');
      R_(c, AX.robe - 6, gy - 90, 13, 26, '#26304a'); R_(c, AX.robe - 6, gy - 82, 13, 2, '#d8d2c1'); R_(c, AX.robe - 7, gy - 90, 1, 20, '#1c2438');
      R_(c, AX.bag - 11, gy - 9, 22, 9, '#2e3a5a'); R_(c, AX.bag - 11, gy - 9, 22, 1, '#4a5a7a'); R_(c, AX.bag - 3, gy - 12, 6, 3, '#2e3a5a');
      R_(c, AX.bath + 7, gy - 22, 3, 5, '#e8e4d8');
      R_(c, AX.fridge - 6, gy - 30, 3, 3, '#c8302a'); R_(c, AX.fridge - 5, gy - 31, 1, 1, '#3a7a3a');
      if (flag(G, 'c00_fridge_note')) R_(c, AX.fridge - 7, gy - 28, 6, 7, '#efe8d6');
      R_(c, AX.cooker - 5, gy - 28, 10, 7, '#d8d0c0'); R_(c, AX.cooker - 5, gy - 28, 10, 1, '#f0e8d8');
      const tt = S.time || 0;
      for (let i = 0; i < 3; i++) { const k = ((tt * 0.6 + i / 3) % 1); c.globalAlpha = 0.35 * (1 - k); R_(c, AX.cooker - 1 + Math.sin(tt * 2 + i) * 2, gy - 30 - k * 16, 2, 2, '#f4f0e8'); }
      c.globalAlpha = 1;
      R_(c, AX.singer - 8, gy - 30, 16, 3, '#16161a'); R_(c, AX.singer + 4, gy - 38, 4, 9, '#16161a'); R_(c, AX.singer - 8, gy - 38, 14, 3, '#16161a'); R_(c, AX.singer - 5, gy - 37, 3, 1, '#c9a13b');
      R_(c, AX.marks - 1, gy - 92, 1, 92, '#7a6248');
      R_(c, AX.marks - 4, gy - 76, 4, 1, '#3a3430'); R_(c, AX.marks - 4, gy - 62, 4, 1, '#3a3430'); R_(c, AX.marks - 3, gy - 54, 3, 1, '#3a3430'); R_(c, AX.marks - 3, gy - 47, 3, 1, '#3a3430');
      // Min's accounting textbook open on the couch cushion.
      R_(c, AX.textbook - 5, gy - 17, 10, 2, '#efe8d6'); R_(c, AX.textbook, gy - 17, 1, 2, '#6a5a4a');
    } else if (id === 'civic_locker_b') {
      if (RT.glovesOnBench) { R_(c, LB.bench + 22, gy - 15, 7, 5, '#a8342a'); R_(c, LB.bench + 30, gy - 15, 7, 5, '#a8342a'); R_(c, LB.bench + 22, gy - 15, 7, 1, '#c85a4a'); R_(c, LB.bench + 30, gy - 15, 7, 1, '#c85a4a'); }
      // White tape, scissors and the Vaseline jar on the taping table.
      R_(c, LB.table - 14, gy - 23, 5, 3, '#efece4'); R_(c, LB.table - 4, gy - 22, 6, 1, '#9aa0a8'); R_(c, LB.table + 6, gy - 24, 4, 4, '#cfd8d0');
    } else if (id === 'civic_ring_1994') {
      // Min's cardboard sign in Section 14, Row F, and the scrunchie: the brightest small colour in the chapter.
      const m = actor('min');
      if (m && !m.hidden && !flag(G, '_c00_min_apron')) {
        R_(c, m.x - 12, m.y - 52, 24, 9, '#d8cfb4'); R_(c, m.x - 12, m.y - 52, 24, 1, '#efe6cc');
        if (S.font && has(S.font, 'draw')) S.font.draw(c, 'KESSLER', m.x, m.y - 50, { align: 'center', color: '#3a2a2a' });
        R_(c, m.x - 14, m.y - 48, 2, 2, '#f2d23a');
      }
    }
  }
  function drawGlow(c) {
    if (!inCh0()) return;
    const id = S.world.locId;
    if (id === 'civic_ring_1994') {
      // The chin tap: Ray's left glove at his chin and above his head for the whole windup, a one-frame glint.
      const b = curBout(), e = b && b.opponent;
      if (e && e.enemy && e.enemy.state === 'windup' && e.enemy.atk && e.enemy.atk.name === 'right') {
        const h = e.h || 50, x = e.x + (e.face || -1) * 2, y = e.y - h - 5;
        R_(c, x - 3, y, 6, 5, '#ddd6c6'); R_(c, x - 3, y + 5, 2, 6, '#ddd6c6');
        if (RT.bout && S.time - (RT.bout.tellAt || -9) < 0.05) { R_(c, x - 1, y - 3, 2, 2, '#ffffff'); R_(c, x - 4, y + 1, 1, 1, '#ffffff'); R_(c, x + 3, y + 1, 1, 1, '#ffffff'); }
      }
      if (RT.pentax > 0) { const m = actor('min'); if (m) { c.globalAlpha = clamp(RT.pentax, 0, 1); R_(c, m.x + 4, m.y - 40, 3, 3, '#ffffff'); c.globalAlpha = 1; } }
    } else if (id === 'c00_tunnel') {
      // The mouth of the tunnel: a white rectangle that grows as Jin walks toward it.
      const j = S.world.jin, L = S.world.loc;
      const k = j ? clamp(j.x / (L.w || 1100), 0, 1) : 0;
      const w = 8 + 40 * k * k, h = 24 + 60 * k * k, x = (L.w || 1100) - 30, y = (L.ground || 300) - h;
      c.globalAlpha = 0.35 + 0.6 * k; R_(c, x - w / 2, y, w, h, '#fff6e4'); c.globalAlpha = 1;
    }
  }
  function drawScreen(c) {
    if (!inCh0() || S.headless) return;
    // Hold still: a thin ring filling round a small standing figure.
    const s = RT.still;
    if (s) {
      const k = clamp(s.t / s.need, 0, 1), cx = 320, cy = 300;
      c.lineWidth = 3; c.strokeStyle = 'rgba(16,14,20,0.7)'; c.beginPath(); c.arc(cx, cy, 10, 0, Math.PI * 2); c.stroke();
      c.lineWidth = 2; c.strokeStyle = '#e8c272'; c.beginPath(); c.arc(cx, cy, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
      R_(c, cx - 1, cy - 7, 3, 3, '#ece6d8'); R_(c, cx - 2, cy - 4, 5, 6, '#ece6d8'); R_(c, cx - 2, cy + 2, 2, 5, '#ece6d8'); R_(c, cx + 1, cy + 2, 2, 5, '#ece6d8');
      if (S.font && has(S.font, 'draw')) S.font.draw(c, s.label || 'HOLD STILL', cx, cy + 15, { align: 'center', color: '#e8c272', shadow: true });
    }
    // Round 2, 0:40: Locker B from a new angle. A taped wrist, a white squeeze bottle with a red tape band, held out.
    const R = RT.bout;
    if (R && R.flashT > 0 && R.flashT < 0.9) {
      c.globalAlpha = 1;
      R_(c, 0, 0, 640, 360, '#2e2a24');
      for (let y = 0; y < 360; y += 12) R_(c, 0, y, 640, 1, '#3a352c');
      for (let x = 0; x < 640; x += 24) R_(c, x, 0, 1, 230, '#3a352c');
      R_(c, 0, 230, 640, 130, '#26221e');
      R_(c, 60, 250, 220, 10, '#4a3e32');                                   // the bench
      R_(c, 520, 120, 70, 80, '#5a5448'); R_(c, 528, 128, 54, 64, '#6e6a5e'); // the mirror, its bulbs dead
      // The hand and the bottle, close, toward the camera.
      R_(c, 380, 236, 120, 46, '#b89070'); R_(c, 440, 232, 70, 10, '#efece4'); R_(c, 440, 236, 70, 2, '#d8d4c8');   // forearm, tape bracelet
      R_(c, 300, 150, 92, 140, '#ece8dc'); R_(c, 300, 150, 92, 4, '#ffffff'); R_(c, 386, 150, 6, 140, '#cfcabc');   // the bottle
      R_(c, 300, 166, 92, 16, '#b0302a'); R_(c, 300, 166, 92, 2, '#d04a3a');                                        // the red tape band
      R_(c, 330, 120, 32, 30, '#e4e0d2'); R_(c, 340, 96, 12, 26, '#d8d4c6');                                        // neck and nozzle
      R_(c, 370, 224, 40, 30, '#b89070');                                                                            // fingers
      for (let i = 0; i < 260; i++) { const hx = (i * 137 + Math.floor(S.time * 60) * 53) % 640, hy = (i * 71 + Math.floor(S.time * 60) * 29) % 360; R_(c, hx, hy, 1, 1, i % 2 ? '#5a5040' : '#1a1612'); }
      c.globalAlpha = 0.5; R_(c, 0, 0, 640, 360, '#6a5030'); c.globalAlpha = 1;
      if (S.font && has(S.font, 'draw')) S.font.draw(c, "YOU'RE DRY, KI-", 320, 316, { align: 'center', color: '#d8cfb4', scale: 2, shadow: true });
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     LOCATIONS
     ══════════════════════════════════════════════════════════════════ */
  // Apartment 3B, left -> right: Jin's room, the hall, the sock door, the kitchen, the living room, the front door.
  const AX = { mattress: 64, window1: 128, cert: 196, bag: 236, robe: 274, roomDoor: 300, photoTrophy: 332, photoGrad: 366, photoAppa: 404,
    bath: 452, sink: 514, counter1: 532, cooker: 552, stove: 590, calendar: 604, counter2: 612, sugar: 628, minSit: 652, fridge: 704,
    marks: 744, table: 518, jinChair: 540, chair2: 566, window2: 784, singer: 800, ummaChair: 818, tv: 872, sofa: 912, minSofa: 936,
    textbook: 984, lamp: 1014, window3: 1040, door: 1090 };
  const G3 = 300;

  // Late-summer gold (4:40 PM) and the ember sky after dinner (5:50 PM, then the river road).
  const SKY_GOLD = { preset: 'dawn', stops: ['#33415a', '#4c5670', '#7a7078', '#a8806c', '#cc9864', '#deb06c'], glow: '#f2c27a', glowA: 0.42,
    stars: 0, clouds: 0.5, cloud: '#6a5a62', cloudLit: '#e8b07a', lit: 0.12 };
  const SKY_EMBER = { preset: 'dusk', stops: ['#1c2236', '#2e3048', '#4e3e52', '#7a5258', '#a86a58', '#c88458'], glow: '#e0985e', glowA: 0.38,
    stars: 0.04, clouds: 0.6, cloudLit: '#c87a5a', lit: 0.4 };
  function kesslerAve(G) {
    const after = flag(G, 'c00_kitchen_done');
    const npcs = [
      { id: 'c00_han', look: 'c00_han', name: 'Mr. Han', x: KX.hans + 62, face: 1, pose: 'sweep', talk: 'c00_han_talk', barkRadius: 84,
        barks: (g) => (flag(g, 'c00_kitchen_done') ? ['Go get it, Kessler Kid!', 'Radio says sold out. Sold out!'] : ['Kessler Kid! Bring back the belt!', 'Plums are on me if you win.']) },
      S.castNpc('rita', { x: KX.booth, face: 1, pose: 'work', layer: 'back', barkRadius: 64,
        barks: (g) => (flag(g, 'c00_kitchen_done') ? ["Window booth's yours after, champ.", "I'm keeping the pie back."] : ["Window booth's yours after, champ."]) }),
      { id: 'c00_kid_a', look: 'c00_kid_a', name: 'Kid', x: KX.chalk - 28, face: 1, pose: 'shadowbox', talk: 'c00_kids_talk', barkRadius: 72,
        barks: (g) => (flag(g, 'c00_kitchen_done') ? ['Knock him out, Jin!'] : ["I'm Seo!"]) },
      { id: 'c00_kid_b', look: 'c00_kid_b', name: 'Kid', x: KX.chalk + 30, face: -1, pose: 'shadowbox', talk: 'c00_kids_talk', barkRadius: 72,
        barks: (g) => (flag(g, 'c00_kitchen_done') ? ['Do the one-two! The one-two!'] : ["No, I'M Seo!"]) },
    ];
    if (!after) {
      npcs.push(S.castNpc('teddy', { x: KX.gymDoor - 24, face: 1, pose: 'armsCrossed', talk: 'c00_teddy_street', barkRadius: 100,
        idles: ['armsCrossed', 'point', 'armsCrossed', 'handsHips'],
        barks: ["Five o'clock. Car at six. Eat something boiled.", 'Feet! Where are your feet?'] }));
    } else {
      npcs.push(S.castNpc('teddy', { x: KX.wagon - 42, face: -1, pose: 'handsHips', talk: 'c00_teddy_wagon', barkRadius: 120,
        barks: ["Six o'clock means six o'clock.", 'Get in the car, champ.'], marker: (g) => (flag(g, 'c00_in_wagon') ? null : '!') }));
      npcs.push(S.castNpc('lenny', { x: KX.wagon + 48, face: -1, pose: 'leanWall', talk: 'c00_lenny_wagon', barkRadius: 80,
        barks: ['Big night, kid. Big night.', 'Tackle box. My whole office.'] }));
    }
    return P.kesslerAve({
      year: 1994, time: 'dusk', dark: after ? 0.22 : 0.06, lamps: after, wagon: true,
      sky: after ? SKY_EMBER : SKY_GOLD, ambient: { tint: after ? '#4a3a44' : '#6a5038' },
      npcs,
      objects: [
        { id: 'i0_poster_1994', x: KX.posterWall - 8, label: 'Championship poster', verb: 'Read', run: 'c00_poster' },
        { id: 'i0_chalk_ring', x: KX.chalk, label: 'Chalk on the sidewalk', verb: 'Examine',
          text: ["Somebody drew a ring. My name's in the blue corner. Spelled right, even."] },
        { id: 'c00_busstop', x: KX.busStop, label: 'Route 14 sign', verb: 'Read',
          text: ['14 KESSLER–CIVIC CTR. LAST BUS FROM CIVIC 12:10 AM.', "Twelve-ten. Umma's had that number memorised since Tuesday."] },
        { id: 'c00_hydrant', x: KX.hydrant, label: 'Open hydrant', verb: 'Examine',
          text: ["Somebody opened it at noon. The gutter's been a river since.", 'Nobody on this block is in a hurry to close it.'] },
        { id: 'c00_banner', x: KX.gym + 140, label: 'Banner', verb: 'Look',
          text: ["GOOD LUCK JIN!! Kids' paint on a bedsheet, out of the upstairs window.", 'Two exclamation points. Teddy let them use the good paint.'] },
        { id: 'c00_wagon_look', x: KX.wagon, label: "Teddy's wagon", verb: 'Examine', when: (g) => !flag(g, 'c00_kitchen_done'),
          text: ["Teddy's maroon '84 Buick. He washed it.", 'He never washes it.'] },
        { id: 'c00_wagon', x: KX.wagon + 12, label: "Teddy's wagon", verb: 'Get in', run: 'c00_drive', when: (g) => flag(g, 'c00_kitchen_done') },
        { id: 'c00_stoop', x: KX.stoop - 34, label: 'Stoop', verb: 'Sit', pose: 'sitCurb', face: 1, zoom: 0.85,
          when: (g) => flag(g, 'c00_min_home') && !flag(g, 'c00_kitchen_done'),
          text: ['Four storeys of brick. The box fan in our window going round.',
            "Somewhere up there Umma's lifting a lid to check the rice.", 'Sit here any longer and Min comes back down for me.'] },
      ],
      door: {
        kes_412: { locked: (g) => (flag(g, 'c00_min_met') ? false : 'Finish the run first. End of the block and back.') },
        kes_sunnys: { run: 'places_noop', locked: (g) => (flag(g, 'c00_kitchen_done') ? "After. Min's saving the window booth." : 'Not now. Home first.') },
        kes_left: { run: 'places_noop', locked: (g) => (flag(g, 'c00_kitchen_done') ? "Teddy's waiting. The other way." : "Home by five. Teddy's orders.") },
      },
      // Ashgrove Tower is a steel skeleton with a crane on top; its aircraft light blinks over the river.
      lights: [{ x: 1203, y: 48, r: 6, color: '#ff3a2a', k: 0.9, flicker: 0.6, layer: 'far' }],
    });
  }

  function stairs412() {
    return P.kessler412Stairs({
      year: 1994,
      npcs: [S.castNpc('okafor', { x: ST4.door3a + 16, y: ST4.l3Y, face: 1, pose: 'idle', layer: 'back',
        when: (g) => flag(g, 'c00_kitchen_done') && !flag(g, 'c00_okafor_done') })],
      objects: [
        { id: 'c00_mailboxes', x: ST4.mailbox, y: ST4.lobbyY, label: 'Mailboxes', verb: 'Read',
          text: ["3B, in Min's handwriting: SEO — MI-OK / JIN / MIN-JI — NO MENUS PLEASE.", 'The menus come anyway. Min files them in the trash with a little speech.'] },
        { id: 'c00_bulb', x: ST4.bulb, y: ST4.l2Y, label: 'The bulb on two', verb: 'Look',
          text: ["It's flickered since spring. The super says Tuesday. Every Tuesday."] },
      ],
      triggers: [{ id: 'c00_trig_okafor', x0: 0, x1: 320, y0: ST4.l3Y - 50, y1: ST4.l3Y + 6, run: 'c00_okafor',
        when: (g) => flag(g, 'c00_kitchen_done') && !flag(g, 'c00_okafor_done') }],
      door: { st4_3a: { run: 'places_noop', locked: () => "Mrs. Okafor's. Her TV's on Channel 6 already." } },
    });
  }

  function apt3b(G) {
    const g = G3, after = flag(G, 'c00_kitchen_done');
    const npcs = after ? [
      S.castNpc('umma', { x: AX.ummaChair, face: -1, pose: 'sit', talk: 'c00_umma_after', barkRadius: 64,
        barks: ['Your collar. Come here.', 'Go. Teddy will wear out the horn.'] }),
      S.castNpc('min', { x: AX.minSofa, face: 1, pose: 'sit', talk: 'c00_min_after', barkRadius: 64,
        barks: ["Window booth after. I'll save it.", 'Win fast. The bus.'] }),
    ] : [
      S.castNpc('umma', { x: AX.stove + 6, face: -1, pose: 'work', talk: 'c00_umma_after' }),
      S.castNpc('min', { x: AX.minSit, y: g - 21, face: 1, pose: 'sit', talk: 'c00_min_after',
        barks: ["Umma said five. It's four fifty-two."] }),
    ];
    return {
      name: 'Apartment 3B', area: 'Eastgate', kind: 'interior', w: 1120, h: 360, ground: g, map: 'map_eastgate',
      room: { wall: '#6e7a5a', wall2: '#4e5642', floor: '#6a5038', pattern: 'wallpaper', floorPattern: 'wood', ceiling: 70, trim: '#7a6248' },
      ambient: { dark: 0.1, tint: '#4a3a28', fog: 0.02 }, sound: { loop: 'room', vol: 0.35 },
      camera: { zoom: 1 },
      layers: {
        back: [
          { t: 'mattress', x: AX.mattress },
          { t: 'window', x: AX.window1 - 17, y: g - 124, w: 34, h: 44, lit: true, curtains: false },
          { t: 'picture', x: AX.cert - 8, y: g - 92, w: 16, h: 12, kind: 'certificate' },
          { t: 'door', x: AX.roomDoor, kind: 'wood', color: '#6a5040', open: true },
          { t: 'picture', x: AX.photoTrophy - 6, y: g - 74, w: 12, h: 10, kind: 'photo' },
          { t: 'picture', x: AX.photoGrad - 6, y: g - 80, w: 12, h: 14, kind: 'photo' },
          { t: 'picture', x: AX.photoAppa - 7, y: g - 76, w: 14, h: 12, kind: 'frame' },
          { t: 'door', x: AX.bath, kind: 'wood', color: '#7a6450' },
          { t: 'sink', x: AX.sink },
          { t: 'counter', x: AX.counter1, w: 40, items: false },
          { t: 'stove', x: AX.stove },
          { t: 'counter', x: AX.counter2, w: 58, items: false },
          { t: 'picture', x: AX.calendar - 8, y: g - 98, kind: 'calendar', text: 'AUG' },
          { t: 'fridge', x: AX.fridge },
          { t: 'chair', x: AX.jinChair, kind: 'wood' }, { t: 'chair', x: AX.chair2, kind: 'wood' },
          { t: 'ceiling_light', x: AX.stove, kind: 'bulb' },
          { t: 'window', x: AX.window2 - 18, y: g - 128, w: 36, h: 50, lit: true, curtains: true },
          { t: 'table', x: AX.singer - 14, w: 28, kind: 'wood', items: false },
          { t: 'chair', x: AX.ummaChair, kind: 'wood' },
          { t: 'tv', x: AX.tv, on: true, content: 'boxing' },
          { t: 'rug', x: 880, w: 150, color: '#7a4a3a' },
          { t: 'sofa', x: AX.sofa, w: 84, color: '#6a5a44' },
          { t: 'lamp', x: AX.lamp, kind: 'floor', on: false },
          { t: 'ceiling_light', x: 940, kind: 'bulb', on: false },
          { t: 'window', x: AX.window3 - 18, y: g - 128, w: 36, h: 50, lit: true, curtains: true },
          { t: 'plant', x: AX.window3 + 30 },
          { t: 'door', x: AX.door, kind: 'wood', color: '#5a4030' },
        ],
        // The kitchen table stands in front of the chairs: sitting down, Jin is half behind it.
        front: [{ t: 'table', id: 'c00_table', x: AX.table, w: 54, kind: 'kitchen' }],
      },
      solids: [{ x: AX.counter2, y: g - 21, w: 58, oneway: true }],
      lights: [
        { x: AX.window3, y: 200, r: 180, color: '#f2b25a', k: 0.55 }, { x: AX.window2, y: 200, r: 150, color: '#f2b25a', k: 0.45 },
        { x: AX.stove, y: 96, r: 130, color: '#f0d8a0', k: 0.35 }, { x: AX.window1, y: 200, r: 110, color: '#f2b25a', k: 0.35 },
      ],
      doors: [{ id: 'c00_3b_door', x: AX.door, label: 'Stairwell', verb: 'Leave', kind: 'door', to: 'kessler_412_stairs_1994', tx: ST4.door3b, ty: ST4.l3Y, face: -1,
        locked: (gg) => (flag(gg, 'c00_kitchen_done') ? false : 'Umma heard the door. Too late to sneak back out.') }],
      npcs,
      objects: [
        { id: 'i0_robe', x: AX.robe, label: 'Robe on the door', verb: 'Examine', run: 'c00_look_robe' },
        { id: 'i0_photo_appa', x: AX.photoAppa, label: 'Photo: Appa, 1979', verb: 'Look', run: 'c00_look_appa' },
        { id: 'i0_bathroom_sock', x: AX.bath + 12, label: 'Sock on the doorknob', verb: 'Examine', run: 'c00_look_sock' },
        { id: 'i0_sugar_jar', x: AX.sugar, label: 'Sugar jar', verb: 'Lift', run: 'c00_look_sugar' },
        { id: 'i0_height_marks', x: AX.marks, label: 'Doorframe', verb: 'Examine', run: 'c00_look_marks' },
        { id: 'i0_singer', x: AX.singer, label: 'Sewing machine', verb: 'Examine', run: 'c00_look_singer' },
        { id: 'i0_tv', x: AX.tv, label: 'TV', verb: 'Watch', run: 'c00_look_tv' },
        { id: 'i0_fridge', x: AX.fridge, label: 'Fridge', verb: 'Read', run: 'c00_look_fridge', when: (gg) => flag(gg, 'c00_kitchen_done') },
        { id: 'c00_cert', x: AX.cert, label: 'Certificate', verb: 'Read',
          text: ['CALDER GOLDEN GLOVES 1986 · J. SEO.', 'Umma framed it before I got it home. She had the frame waiting.'] },
        { id: 'c00_gym_bag', x: AX.bag, label: 'Gym bag', verb: 'Check',
          text: ['Cup, mouthguard, the good socks, two towels.', 'Packed twice: once by me, once by Umma, who took my packing out and did it again.'] },
        { id: 'c00_textbook', x: AX.textbook, label: 'Textbook', verb: 'Read',
          text: ["PRINCIPLES OF ACCOUNTING, open to depreciation. Min's pencil in the gutter.", 'She does her homework on the 14. She says it is a library with a driver.'] },
        { id: 'c00_calendar', x: AX.calendar, label: 'Calendar', verb: 'Read',
          text: ['AUG 20 — JIN!! Circled three times in red.', "The 31st has RENT on it in Umma's small letters. No circle."] },
        { id: 'c00_photos', x: AX.photoGrad, label: 'Photos in the hall', verb: 'Look',
          text: ['Me at fourteen with my first trophy. It came up to my chin.', 'Min in her cap and gown. Umma cried at that one. She says she did not.'] },
        { id: 'c00_fan', x: AX.window1, label: 'Box fan', verb: 'Look',
          text: ['It pushes the hot air from one side of the room to the other. Min calls it moral support.'] },
        { id: 'c00_mattress', x: AX.mattress, label: 'Mattress', verb: 'Sit', pose: 'sitFloor', face: 1, zoom: 0.85,
          text: ['Jump rope on its nail. The fan going. The radio downstairs calling tonight.', 'Every fight I ever had, I slept on this the night before. Tonight I sleep somewhere with a belt. Or here.'] },
      ],
      triggers: [{ id: 'c00_trig_kitchen', x0: AX.marks - 34, x1: AX.marks + 8, run: 'c00_kitchen', when: (gg) => !flag(gg, 'c00_kitchen_done') }],
      points: { start: { x: AX.door - 12, y: g }, arrive: { x: AX.door - 12, y: g }, chair: { x: AX.jinChair, y: g } },
      firstEnter: 'c00_3b_enter',
    };
  }

  // The drive to the Civic: one shot of the wagon on the river road; streetlights sweep amber bars across it.
  const RIVER_ROAD = {
    name: 'The river road', area: 'Riverfront', kind: 'exterior', w: 640, h: 360, ground: 300, map: 'map_civic',
    sky: SKY_EMBER, backdrop: 'river', groundStyle: 'street', ambient: { dark: 0.3, tint: '#3a3048', fog: 0.06 }, sound: { loop: 'traffic', vol: 0.35 },
    camera: { zoom: 1 },
    layers: {
      far: [{ t: 'smokestack', x: 120, h: 140, smoke: false }, { t: 'bridge', x: 240, w: 420 }, { t: 'scaffold', x: 540, w: 40, h: 220, y: 300 }],
      back: [{ t: 'wall', x: 0, w: 640, h: 22, style: 'concrete' }],
      front: [{ t: 'car', id: 'c00_wagon_drive', x: 320, kind: 'wagon', color: '#5a2a2a', face: 1 }],
    },
    lights: [{ x: 640, y: 220, r: 170, color: '#e8c272', k: 0.4 }, { x: 563, y: 82, r: 5, color: '#ff3a2a', k: 0.9, flicker: 0.6, layer: 'far' }],
    points: { start: { x: 120, y: 300 } },
  };

  // The tunnel to the bowl: dark concrete, a white rectangle at the end that grows as he walks.
  const TUNNEL = {
    name: 'Calder Civic Arena — the tunnel', area: 'Riverfront', kind: 'interior', w: 1100, h: 360, ground: 300, map: 'map_civic',
    room: { wall: '#2a2a30', wall2: '#1e1e22', floor: '#26262a', pattern: 'concrete', floorPattern: 'concrete', ceiling: 140, trim: '#34343a' },
    ambient: { dark: 0.86, tint: '#141218', fog: 0.08 }, sound: { loop: 'crowd', vol: 0.12 },
    layers: { back: [{ t: 'pipes', x: 0, w: 1100, y: 148 }, { t: 'door', x: 1070, kind: 'double', color: '#2a2a2e', open: true, lit: true }] },
    lights: [{ x: 1075, y: 250, r: 240, color: '#fff2d8', k: 0.9 }, { x: 320, y: 160, r: 50, color: '#e8c272', k: 0.18 }, { x: 720, y: 160, r: 50, color: '#e8c272', k: 0.16 }],
    points: { start: { x: 40, y: 300 } },
    firstEnter: 'c00_tunnel_walk',
  };

  function backstage() {
    return P.civicBackstage({
      year: 1994,
      npcs: [S.castNpc('inspector', { x: CB.table + 30, face: -1, pose: 'write', talk: 'c00_inspector', barkRadius: 84,
        barks: (g) => (flag(g, 'c00_wrapped') ? ['Gloves, Seo. Then go be famous.'] : ["Wraps get stamped once they're on, Seo."]) })],
      objects: [
        { id: 'i0_dock_b', x: CB.dock + 34, label: 'Dock B door', verb: 'Look', text: ['DOCK B — NO PUBLIC ACCESS.', "A gray van's backing in. Nobody's unloading anything."] },
        { id: 'c00_posters', x: CB.posters[0], label: 'Fight posters', verb: 'Read',
          text: ['Thirty years of Saturday nights on one wall. Half the names I know from Teddy. The other half nobody knows.'] },
        { id: 'c00_poster_1971', x: CB.poster1971, label: 'A 1971 card', verb: 'Read',
          text: ['CIVIC ARENA · FRIDAY OCTOBER 8, 1971 · six rounds: T. MARSH, EASTGATE.', 'Teddy with hair and a mustache that was still brown. He says he lost that one on a cut.', 'He says that a lot.'] },
      ],
      triggers: [{ id: 'c00_trig_ray', x0: CB.lockerA - 160, x1: CB.lockerA - 100, run: 'c00_ray_corridor', when: (g) => !flag(g, 'c00_ray_met') }],
      to: { cb_tunnel: 'c00_tunnel' },
      door: {
        cb_lockerB: { locked: (g) => (flag(g, 'c00_time') ? "Teddy's hand is on my shoulder. The tunnel." : false) },
        cb_tunnel: { tx: 40, face: 1, locked: (g) => (flag(g, 'c00_time') ? false : 'Not yet. Teddy says walk out when they call you.') },
      },
    });
  }

  function lockerB() {
    return P.civicLockerB({
      year: 1994, drop: ['lb_bag'], training: null,
      npcs: [
        S.castNpc('lenny', { x: LB.table + 22, face: -1, pose: 'idle', talk: 'c00_lenny_locker', barkRadius: 70,
          when: (g) => !flag(g, 'c00_alone'),
          marker: (g) => (flag(g, 'c00_wrapped') ? null : '!'),
          barks: (g) => (flag(g, 'c00_wrapped') ? ['Look at these hands. Beautiful.'] : ["Sit down, kid. Let's do your hands."]) }),
        S.castNpc('teddy', { x: LB.marks[2] + 12, face: -1, pose: 'armsCrossed', talk: 'c00_teddy_locker', barkRadius: 80,
          when: (g) => !flag(g, 'c00_alone'),
          marker: (g) => (flag(g, 'c00_wrapped') && !flag(g, 'c00_warmed') ? '!' : null),
          barks: (g) => (flag(g, 'c00_wrapped') ? ['Mitts. Come on.'] : ['Lenny first. Hands, then mitts.']) }),
      ],
      objects: [
        { id: 'i0_mirror', x: LB.mirror, label: 'Mirror', verb: 'Look', run: 'c00_mirror' },
        { id: 'c00_clock', x: LB.clock - 50, label: 'Wall clock', verb: 'Look',
          text: (g) => (flag(g, 'c00_warmed') ? ['Twenty past nine. The undercard is running long. Somebody out there is having the night of his life.'] : ['Eight o\'clock. Two hours of waiting in a room with no windows.']) },
        { id: 'c00_lockers', x: LB.lockers, label: 'Lockers', verb: 'Open',
          text: ['My street clothes folded the way Umma would fold them. I did it so she would not have to ask.'] },
        { id: 'c00_sink', x: LB.sink, label: 'Sink', verb: 'Use', text: ['Cold water on the wrists. Teddy swears by it. Teddy swears by most things.'] },
      ],
      lights: [{ x: LB.mirror, y: 170, r: 70, color: '#f0d8a0', k: 0.35 }],
      enter: 'c00_lockerb_enter',
    });
  }

  function ring() {
    return P.civicRing({
      year: 1994, crowd: 'full', mood: 'idle',
      npcs: [
        S.castNpc('morty', { name: 'Timekeeper', x: CR.bell - 4, face: 1, pose: 'sit', layer: 'back' }),
        S.castNpc('umma', { look: 'umma_coat', x: CR.rowF.x - 12, y: CR.rowF.y, face: 1, pose: 'idle', layer: 'back' }),
        S.castNpc('min', { x: CR.rowF.x + 10, y: CR.rowF.y, face: 1, pose: 'cheer', layer: 'back' }),
        { id: 'rook_1994', look: 'rook_1994', name: 'A man in a flat cap', x: CR.rowK.x, y: CR.rowK.y, face: 1, pose: 'sit', layer: 'back' },
        S.castNpc('camel_coat', { x: CR.pressEnd + 22, face: -1, pose: 'sit', layer: 'back' }),
        S.castNpc('referee', { x: CR.center, face: -1, pose: 'idle', layer: 'back' }),
        S.castNpc('teddy', { x: CR.ring0 - 14, face: 1, pose: 'armsCrossed', layer: 'back' }),
        S.castNpc('lenny', { x: CR.ring0 - 30, face: 1, pose: 'idle', layer: 'back' }),
      ],
      door: { cr_tunnel: { locked: () => 'No way back up the tunnel now. Only the ring.' } },
      layers: { back: [{ t: 'corner_stool', x: CR.ring0 + 14 }, { t: 'corner_stool', x: CR.ring1 - 14 }, { t: 'bucket', x: CR.ring0 - 44 }] },
      points: { corner: { x: CR.ring0 + 20, y: ROUND_GROUND } },
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     SCENE HELPERS
     ══════════════════════════════════════════════════════════════════ */
  // Teddy's rule tonight: no dashes, no flurries (the PDF teaches dashes in Ch2). Every block says why.
  const NO_DANCE = "Teddy's rule tonight: feet under you. No dancing.";
  function limits(extra) {
    const o = { dash: false, flurry: false, reasons: { dash: NO_DANCE, flurry: NO_DANCE } };
    if (extra) for (const k in extra) { if (k === 'reasons') Object.assign(o.reasons, extra.reasons); else o[k] = extra[k]; }
    return o;
  }
  // Thin letterbox (the player still walks): S.fx.letterbox at 0.4. The director tweens it like any fx
  // (FX_DEFAULTS has letterbox); the name is held in a constant because the headless load check's fx list lacks it.
  const FX_LB = 'letterbox';
  const thinBox = (A, v, dur) => A.fx(FX_LB, v, dur);
  const WALK_ONLY = (why) => limits({ run: false, punch: false, jump: false, slip: false, reasons: { run: why, punch: why, jump: why, slip: why } });
  // Several people can keep step with Jin at once (Teddy and Lenny in the tunnel).
  function tethers(list) { RT.tether = null; RT.tethers = (list || []).map((o) => Object.assign({ off: 18, walk: 'walk', rest: 'idle', speed: 130, dir: 1, turn: false }, o)); }
  const _tetherStep = tetherStep;
  // (tetherStep handles RT.tether; RT.tethers is stepped here too)
  function stepTethers(dt) {
    if (!RT.tethers || !RT.tethers.length) return;
    const keep = RT.tether;
    for (const t of RT.tethers) { RT.tether = t; _tetherStep(dt); }
    RT.tether = keep;
  }
  // People who walk off and are gone when they reach the edge of the frame or a door.
  function leave(A, id, x, speed) {
    A.walk(id, x, { speed: speed || 70 });
    (RT.leavers = RT.leavers || []).push({ id, x, loc: S.world && S.world.locId });
  }
  function stepLeavers() {
    if (!RT.leavers || !RT.leavers.length || !S.world) return;
    RT.leavers = RT.leavers.filter((l) => {
      if (S.world.locId !== l.loc) return false;
      const a = actor(l.id);
      if (!a) return false;
      if (Math.abs(a.x - l.x) < 3) { S.world.remove(l.id); return false; }
      return true;
    });
  }
  // The crowd swells as Jin walks the tunnel (one call per audible change).
  function crowdTo(v) {
    if (S.headless || !S.audio || !has(S.audio, 'loop')) return;
    if (RT.crowdVol !== undefined && Math.abs(RT.crowdVol - v) < 0.03) return;
    RT.crowdVol = v;
    try { S.audio.loop('crowd', v, 0.3); } catch (_) { /* ignore */ }
  }

  // The look-around quest: four of the eight things in 3B.
  const LOOK8 = ['i0_sugar_jar', 'i0_bathroom_sock', 'i0_robe', 'i0_photo_appa', 'i0_height_marks', 'i0_singer', 'i0_tv', 'i0_fridge'];
  const lookCount = (G) => LOOK8.filter((id) => flag(G, 'c00_seen_' + id)).length;
  function lookAround(A, G, id) {
    if (flag(G, 'c00_seen_' + id)) return;
    A.flag('c00_seen_' + id);
    const q = G.quests.q0_look_around;
    if (!q || q.state !== 'active') return;
    const n = lookCount(G);
    if (n >= 4) { A.flag('c00_looked_around'); A.quest('q0_look_around', 'done'); }
    else A.quest('q0_look_around', 'step', n);
  }
  function closeLookAround(A, G) {
    const q = G.quests.q0_look_around;
    if (q && q.state === 'active') A.quest('q0_look_around', 'fail');
  }
  const jinX = () => { const j = S.world && S.world.jin; return j ? j.x : 0; };
  const actX = (id, d) => { const a = actor(id); return a ? a.x : d; };
  function spark(x, y) { try { if (S.world && has(S.world, 'fx')) S.world.fx('spark', x, y, { emissive: true }); } catch (_) { /* cosmetic */ } }

  function boutDef(n) {
    return {
      id: 'c00_r' + n, ring: { x0: CR.ring0, x1: CR.ring1 },
      opponent: { type: 'champion', id: OPP, name: 'Ray Castell', look: 'ray_1994', hp: 200, opts: { patternSet: 'ch0' } },
      rounds: 3, startRound: n, roundTime: 60, endWhen: 'roundEnd', crowd: true, bell: false, allowLoss: true, checkpoint: true,
      label: 'Round ' + n + ' — Calder Civic Arena', debuff,
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     SCENES
     ══════════════════════════════════════════════════════════════════ */
  const scenes = {
    /* 0.1 Cold open: the bell, then the street. */
    *c00_start(A, G) {
      ensureHooks(); resetRT();
      G.skills.counter = true;                 // the boxer he was; wiped at the end of the chapter
      A.restrict(limits());
      A.body({ look: 'c00_jin_run', power: 1.3, speedMul: 1, breath: false, limp: 0, delay: 0 });
      A.fade(1, 0);
      A.letterbox(true, 0);
      A.show('jin', false);
      A.ambience(null, 0);
      yield A.wait(0.6);
      A.sound('bell', { vol: 1 });            // one brass bell, clear and close
      yield A.wait(1.0);
      A.sound('step', { vol: 0.4 }); A.sound('radio', { vol: 0.5 });
      A.ambience('city', 0.4);
      yield A.say(null, '"...tonight at the Civic, the champion Ray Castell against Eastgate\'s own Jin Seo..."', { wait: 3 });
      A.cam({ x: 1200, y: 110, zoom: 0.85, dur: 0 });
      A.fade(0, 1.6);
      yield A.card('August 20, 1994', 'Eastgate, Calder', 2.4);
      yield A.cam({ x: 1500, y: 120, zoom: 0.85, dur: 2.2 });            // the crane on the Ashgrove skeleton, turning
      yield A.cam({ x: KX.right - 240, y: 190, zoom: 1, dur: 2.8 });     // down to the river end of Kessler Avenue
      A.place('jin', KX.right - 8); A.face('jin', -1); A.show('jin', true);
      yield A.walk('jin', KX.right - 130, { run: true });
      A.follow();
      A.letterbox(false, 0.6);
      A.quest('q0_main', 'start');
      toast('← Kessler & 5th. Home by five.', 'hint');
      // Control mid-stride. He passes Teddy, the kids, Rita, Mr. Han; the run ends at the bus stop.
      yield A.reach(KX.busStop + 76, -1, { autoplay: { walkTo: KX.busStop + 60 } });
      yield* A.sub('c00_min_meets');
    },

    /* Min steps off the 14 and falls into step: a walk-and-talk back to 412. */
    *c00_min_meets(A, G) {
      A.flag('c00_min_met');
      A.meet('min', 'c00_min');
      A.sound('vanDoor', { vol: 0.5 });
      A.spawn(S.castNpc('min', { x: KX.busStop - 30, face: 1, pose: 'idle' }));
      yield A.walk('min', KX.busStop + 30);
      A.face('jin', -1);
      thinBox(A, 0.4, 0.5);
      tether({ id: 'min', loc: 'kessler_ave_1994', off: 20, walk: 'walk', rest: 'idle', turn: true, speed: 140 });
      A.restrict(limits({ run: false, reasons: { run: "Min's in clogs. Walk with her." } }));
      A.bark('min', "You're dripping on my street.", 2.6);
      yield A.wait(T(2.2));
      A.bark('jin', "It's my street too.", 2.0);
      yield A.wait(T(1.8));
      A.bark('min', 'One day on the front page and you own a street.', 2.6);
      // She stops at the poster wall on her own.
      yield A.reach(KX.posterWall - 20, 1, { autoplay: { walkTo: KX.posterWall } });
      tether(null);
      A.walk('min', KX.posterWall + 6);
      A.letterbox(true, 0.5);
      yield A.cam({ x: KX.posterWall, y: 236, zoom: 1.2, dur: 0.8 });
      A.face('min', -1); A.pose('min', 'point', { hold: 1.6 });
      yield A.say('min', 'Forty of these. I put up forty. You owe me forty favours.');
      yield A.say('jin', 'Name one.');
      A.face('min', -1);
      yield A.say('min', 'Win fast. The bus.');
      A.follow();
      A.letterbox(false, 0.5);
      thinBox(A, 0.4, 0.4);
      tether({ id: 'min', loc: 'kessler_ave_1994', off: 20, walk: 'walk', rest: 'idle', turn: true, speed: 140 });
      A.quest('q0_main', 'step', 1);
      yield A.reach(KX.sunnys + 60, 1, { autoplay: { walkTo: KX.sunnys + 80 } });
      A.bark('min', "Rita's saving us the window booth. After.", 2.4);
      yield A.reach(KX.chalk - 60, 1, { autoplay: { walkTo: KX.chalk - 40 } });
      A.bark('min', "The Tran boys drew that. Don't step on your name.", 2.6);
      yield A.reach(KX.stoop - 50, 1, { autoplay: { walkTo: KX.stoop - 30 } });
      tether(null);
      A.bark('min', "Umma said five. It's four fifty-two.", 2.4);
      A.flag('c00_min_home');
      thinBox(A, 0, 0.5);
      A.restrict(limits());
      yield A.walk('min', KX.door412);
      A.sound('door', { vol: 0.6 });
      A.remove('min');
    },

    /* i0_poster_1994 */
    *c00_poster(A, G) {
      A.sound('paper', { vol: 0.5 });
      yield A.doc({ id: 'c00_poster_doc', title: 'Poster — Calder Civic Arena', kind: 'document',
        text: 'CONTINENTAL MIDDLEWEIGHT CHAMPIONSHIP\n\nRAY "THE CROWN" CASTELL\nvs\nJIN "THE KESSLER KID" SEO\n\nSAT AUG 20 · CALDER CIVIC ARENA\n\nTickets at the box office and Han\'s Market.' });
      yield A.think("My passport photo, two feet tall. Nobody's pasted anything over it yet.");
    },

    /* 3B, first time in. */
    *c00_3b_enter(A, G) {
      A.quest('q0_main', 'step', 2);
      if (!G.quests.q0_look_around) A.quest('q0_look_around', 'start');
      A.ambience('room', 0.35);
      A.bark('umma', 'Jin-ah? Shoes.', 2.2);
      yield A.wait(0.3);
    },

    /* 0.2 The kitchen. */
    *c00_kitchen(A, G) {
      A.flag('c00_kitchen_started');
      A.meet('umma', 'c00_umma');
      thinBox(A, 0.4, 0.5);
      yield A.walk('jin', AX.counter2 + 12);
      A.face('jin', 1);
      A.face('min', -1); A.face('umma', -1);
      A.letterbox(true, 0.8);
      yield A.cam({ x: AX.minSit - 14, y: G3 - 50, zoom: 1.15, dur: 0.9 });
      A.pose('min', 'point', { hold: 1.4 });
      yield A.say('min', 'Okay. Important question. Who is this?');
      A.cam({ x: AX.minSit - 4, y: G3 - 44, zoom: 1.45, dur: 0.5 });
      yield A.doc({ id: 'c00_clipping', title: 'Calder Ledger — Sports', kind: 'photo',
        text: 'A grainy square-jawed man in a blue track top, under the headline SEO: "I\'M READY."\n\nHe looks like somebody\'s cousin who sells aluminium siding.' });
      yield A.wait(0.6);
      yield A.cam({ x: AX.minSit - 14, y: G3 - 50, zoom: 1.15, dur: 0.5 });
      yield A.say('jin', "That's me.");
      yield A.say('min', 'That is a man who sells aluminium siding. They airbrushed you into a different person. Look at his chin.');
      yield A.say('umma', 'He has my chin.');
      yield A.say('min', 'Umma, nobody has that chin.');
      yield A.say('umma', 'Jin-ah. Sit. Eat first. Then be famous.');
      // He sits; the camera eases out to hold all three.
      yield A.walk('jin', AX.jinChair);
      A.face('jin', 1); A.pose('jin', 'sit');
      A.cam({ x: AX.stove + 2, y: G3 - 56, zoom: 1.0, dur: 1.0 });
      yield A.walk('umma', AX.jinChair + 18);
      A.face('umma', -1); A.pose('umma', 'reach', { hold: 0.8 });
      A.sound('ui', { vol: 0.3 });
      yield A.wait(0.8);
      A.pose('umma', 'idle');                    // hands folded at her waist: her worried pose
      yield A.say('umma', 'How will you get home? The last bus from the Civic is twelve-ten. If it goes long—');
      yield A.say('jin', "It won't go long.");
      yield A.say('umma', 'Everybody says that. Then it goes long.');
      yield A.say('jin', "I'll take a cab, Umma. I'll have money for a cab.");
      yield A.say('umma', 'A cab is eight dollars.');
      yield A.wait(1.0);
      yield A.say('umma', 'Eight dollars.');
      yield A.say('min', "So. Forty thousand dollars. Minus Teddy's third, minus Lenny's little cut, minus the government's giant cut. What's it for, champ? And don't say \"the future.\" Umma hates \"the future.\"");
      A.pose('min', 'point', { hold: 2 });
      yield A.say('min', "Rent. Umma's Saturdays. A lock on the bathroom. Pick one to say first.");
      // The other two stay in the room: Umma glances at the sugar jar, then at the sock on the bathroom door.
      A.face('umma', 1); yield A.wait(0.7);
      A.face('umma', -1); yield A.wait(0.7);
      const dream = yield A.choice('What is the purse for?', [
        { text: "The rent. Every month we're behind.", value: 'rent', policy: 'restraint', autoplay: true, record: 'You told Min the purse was for the rent.' },
        { text: 'Umma stops working Saturdays.', value: 'umma_saturdays', record: "You told Min the purse was for Umma's Saturdays." },
        { text: 'A new place. With a bathroom lock that works.', value: 'new_apartment', policy: 'ruthless', record: 'You told Min the purse was for a place with a lock that works.' },
      ], { id: 'ch0_purse_dream' });
      A.flag('ch0_purse_dream', dream || 'rent');
      if (dream === 'umma_saturdays') {
        yield A.say('jin', 'Umma stops working Saturdays.');
        yield A.say('min', 'I already told her you agreed.');
        yield A.say('umma', "Who will fold the hotel sheets? The sheets don't fold themselves.");
        yield A.say('min', 'The sheets will survive.');
      } else if (dream === 'new_apartment') {
        yield A.say('jin', 'A new place. With a bathroom lock that works.');
        yield A.say('min', 'A lock. He listens. He actually listens.');
        yield A.say('umma', 'The sock works.');
      } else {
        yield A.say('jin', "The rent. Every month we're behind.");
        A.face('umma', 1);
        yield A.say('umma', 'We are two months behind.');
        yield A.say('min', 'Three.');
        yield A.say('umma', 'Two and a half. Rent is my problem.');
        yield A.say('jin', 'Not after tonight.');
        A.face('umma', -1);
        yield A.say('umma', "...Then it's our problem. Eat.");
      }
      yield A.say('min', "You paid my fall tuition with your last fight. So tonight's cab is on me. That's how this family works.");
      // She hops off the counter and writes on the fridge pad with her back to us.
      A.place('min', AX.minSit, G3);
      A.walk('min', AX.fridge - 4);
      yield A.say('umma', 'Stand up. Hold still.');
      A.pose('jin', null);
      yield A.walk('jin', AX.jinChair + 28);
      A.face('jin', -1);
      A.face('min', 1); A.pose('min', 'write');
      yield A.walk('umma', AX.jinChair + 10);
      A.face('umma', 1); A.pose('umma', 'work');
      // Hold still (3.0 s): the trunks, the waistband half re-sewn. Camera close on her hands.
      yield A.cam({ x: AX.jinChair + 20, y: G3 - 24, zoom: 1.3, dur: 0.7 });
      if (!flag(G, 'c00_still_taught')) { A.flag('c00_still_taught'); toast('Hold still: let go of every key.', 'tip'); }
      yield stillWait(A, 3.0, () => A.bark('umma', 'Ya. Still.', 1.4));
      A.pose('umma', 'headDown', { hold: 0.6 });          // she bites the thread
      A.sound('paper', { vol: 0.25 });
      yield A.wait(0.6);
      A.pose('umma', 'idle');
      yield A.cam({ x: AX.stove + 30, y: G3 - 56, zoom: 1.0, dur: 0.6 });
      yield A.say('umma', "Don't let them hit your face. I just fixed your face.");
      // Min slaps the note on the fridge with the strawberry magnet. The camera does not go to it.
      A.sound('paper', { vol: 0.4 });
      A.flag('c00_fridge_note');
      A.pose('min', 'idle');
      yield A.wait(0.8);
      // Teddy's horn from the street: twice, then a long one.
      A.sound('carHorn', { vol: 0.5 }); yield A.wait(0.45);
      A.sound('carHorn', { vol: 0.5 }); yield A.wait(0.7);
      A.sound('carHorn', { vol: 0.65 }); yield A.wait(0.4);
      A.sound('carHorn', { vol: 0.65 }); yield A.wait(0.9);
      yield A.say('min', "That's Teddy's long one. He thinks it's polite.");
      // Umma straightens his collar and taps his forearm twice.
      A.pose('umma', 'reach', { hold: 0.9 });
      yield A.wait(0.5);
      A.sound('step', { vol: 0.25 }); yield A.wait(0.25); A.sound('step', { vol: 0.25 });
      yield A.wait(0.4);
      A.memory('mem_kitchen');
      A.flag('c00_kitchen_done');
      A.quest('q0_main', 'step', 3);
      RT.honkT = 22;
      A.letterbox(false, 0.6);
      thinBox(A, 0, 0.4);
      A.follow();
      // Umma goes back to her Singer; Min takes the couch and her textbook.
      A.walk('umma', AX.ummaChair, { endPose: 'sit', face: -1 });
      A.walk('min', AX.minSofa, { endPose: 'sit', face: 1 });
      yield A.think('Six o\'clock means six o\'clock. Teddy will be on that horn till the whole block comes to the window.');
      A.control(true);
      yield A.waitFor(() => Math.abs(actX('umma', AX.ummaChair) - AX.ummaChair) < 3 && Math.abs(actX('min', AX.minSofa) - AX.minSofa) < 3, { timeout: 9 });
      A.face('umma', -1); A.pose('umma', 'sit');
      A.face('min', 1); A.pose('min', 'sit');
    },

    /* The eight things in 3B (q0_look_around). */
    *c00_look_robe(A, G) {
      yield A.think("EASTGATE. Umma did the letters by hand, two nights. The G is a little crooked. Don't tell her.");
      lookAround(A, G, 'i0_robe');
    },
    *c00_look_appa(A, G) {
      yield A.think("Appa, 1979. He'd have hated the noise tonight. He'd have come anyway.");
      lookAround(A, G, 'i0_photo_appa');
    },
    *c00_look_sock(A, G) {
      yield A.think("The lock's been broken since Christmas. The sock is the lock.");
      lookAround(A, G, 'i0_bathroom_sock');
    },
    *c00_look_sugar(A, G) {
      A.sound('paper', { vol: 0.5 });
      yield A.doc({ id: 'c00_rent_notice', title: 'Under the sugar jar', kind: 'document',
        text: 'KESSLER REALTY — PAST DUE\n\nUnit 3B\nBalance $570.00\n\nPlease remit by 8/31/94.' });
      yield A.think("She put the jar on it so I wouldn't see.");
      lookAround(A, G, 'i0_sugar_jar');
    },
    *c00_look_marks(A, G) {
      yield A.think("JIN 17. MIN 13. Umma stopped measuring when I got taller than the fridge. Min didn't.");
      lookAround(A, G, 'i0_height_marks');
    },
    *c00_look_singer(A, G) {
      yield A.think("Umma's machine. It's older than me and better maintained.");
      lookAround(A, G, 'i0_singer');
    },
    *c00_look_tv(A, G) {
      A.sound('tvStatic', { vol: 0.3 });
      yield A.say(null, 'CHANNEL 6: "Tonight! Castell–Seo! The Crown versus the Kessler Kid!" A clip of Ray hitting pads.');
      yield A.think('He tells you with his left hand before the right. Taps his chin. Every time.');
      lookAround(A, G, 'i0_tv');
    },
    *c00_look_fridge(A, G) {
      A.sound('paper', { vol: 0.5 });
      yield A.doc({ id: 'c00_fridge_doc', title: 'Under the strawberry magnet', kind: 'letter',
        text: 'AFTER: Sunny\'s, window booth.\nUmma says last bus is 12:10 so WIN FAST.\n\n— M' });
      lookAround(A, G, 'i0_fridge');
    },

    /* 0.3 The 3rd landing on the way out: Mrs. Okafor. */
    *c00_okafor(A, G) {
      closeLookAround(A, G);
      thinBox(A, 0.4, 0.4);
      A.sound('door', { vol: 0.4 });
      yield A.walk('jin', ST4.door3a + 44);
      A.face('jin', -1); A.face('okafor', 1);
      yield A.cam({ x: ST4.door3a + 30, y: ST4.l3Y - 30, zoom: 1.2, dur: 0.6 });
      yield A.say('okafor', 'Knock him down, then come home safe. In that order.');
      yield A.walk('okafor', ST4.door3a + 30);
      A.pose('okafor', 'reach', { hold: 1.1 });          // two fingers to his forehead
      yield A.wait(1.1);
      yield A.say('jin', 'Yes, Mrs. Okafor.');
      A.meet('okafor', 'c00_okafor');
      A.follow();
      thinBox(A, 0, 0.4);
      yield A.walk('okafor', ST4.door3a + 2);
      A.sound('door', { vol: 0.3 });
      A.flag('c00_okafor_done');
    },

    /* 0.3 The wagon and the drive. */
    *c00_drive(A, G) {
      if (flag(G, 'c00_in_wagon')) return;
      closeLookAround(A, G);
      A.flag('c00_in_wagon');
      A.letterbox(true, 0.6);
      yield A.walk('jin', KX.wagon - 6);
      A.sound('vanDoor', { vol: 0.6 });
      A.show('jin', false); A.show('teddy', false); A.show('lenny', false);
      yield A.wait(0.4);
      A.sound('vanDoor', { vol: 0.5 });
      // The camera stays on the street after the wagon pulls away: the poster wall, the chalk ring, 412 with the fan.
      yield A.cam({ x: KX.k412 + 200, y: 170, zoom: 1, dur: 2.6 });
      yield A.cam({ x: KX.posterWall + 140, y: 200, zoom: 1, dur: 2.0 });
      yield A.fade(1, 0.8);
      yield A.goto('c00_river_road', 120, { fade: false });
      A.show('jin', false);
      A.cam({ x: 320, y: 178, zoom: 1, dur: 0 });
      RT.drive = true;
      A.ambience('traffic', 0.35);
      yield A.fade(0, 0.8);
      yield A.wait(1.0);
      yield A.say('lenny', 'Big night, kid. Big night.');
      yield A.say('teddy', "You don't talk to the press. You don't talk to Castell's people. You don't talk to anybody but me.");
      yield A.say('lenny', "Who's he gonna talk to, Ted? He doesn't talk.");
      yield A.say(null, 'Lenny laughs a little too long.');
      yield A.wait(1.2);
      yield A.think("The Civic's lit up across the water. In four hours I'm the champion of something.");
      yield A.wait(0.8);
      RT.drive = false;
      // Breath cut on the dock's roll-up door.
      A.fade(1, 0);
      A.sound('door', { vol: 0.9 });
      yield A.goto('civic_backstage_1994', CB.dock + 60, { face: 1, fade: false });
      A.show('jin', true);
      A.body({ look: 'jin_1994' });
      A.ambience('arena', 0.45);
      yield A.card('Calder Civic Arena', '7:30 PM', 2.4);
      A.fade(0, 0.7);
      A.letterbox(false, 0.6);
      A.quest('q0_main', 'step', 4);
      A.checkpoint('Calder Civic Arena');
    },

    /* 0.4 The corridor: Castell's people come out of Locker Room A. */
    *c00_ray_corridor(A, G) {
      A.flag('c00_ray_met');
      thinBox(A, 0.4, 0.5);
      A.sound('door', { vol: 0.5 });
      A.spawn({ id: 'ray_1994', look: 'ray_1994_robe', name: 'Ray', x: CB.lockerA + 4, face: -1, pose: 'idle' });
      A.spawn({ id: 'c00_manager', look: 'c00_manager', name: "Castell's manager", x: CB.lockerA + 30, face: -1, pose: 'idle' });
      A.spawn({ id: 'c00_second_a', look: 'cornerman', name: 'Cornerman', x: CB.lockerA + 52, face: -1, pose: 'idle' });
      A.spawn({ id: 'c00_second_b', look: 'c00_second', name: 'Cornerman', x: CB.lockerA + 74, face: -1, pose: 'idle' });
      A.walk('c00_manager', CB.lockerA - 30, { speed: 40 });
      A.walk('c00_second_a', CB.lockerA - 10, { speed: 40 });
      A.walk('c00_second_b', CB.lockerA + 12, { speed: 40 });
      yield A.walk('ray_1994', jinX() + 34, { speed: 40 });
      A.face('ray_1994', -1); A.face('jin', 1);
      yield A.cam({ x: jinX() + 17, y: 252, zoom: 1.2, dur: 0.7 });
      yield A.say('ray_1994', 'Good luck, kid. I mean it. Make it a fight.');
      // He taps his gloves together twice.
      A.pose('ray_1994', 'guard'); A.sound('block', { vol: 0.35 }); yield A.wait(0.28);
      A.pose('ray_1994', 'idle'); yield A.wait(0.16);
      A.pose('ray_1994', 'guard'); A.sound('block', { vol: 0.35 }); yield A.wait(0.28);
      A.pose('ray_1994', 'idle');
      yield A.think('Three years with the belt. He can afford to mean it.');
      A.meet('ray', 'c00_ray');
      A.follow();
      thinBox(A, 0, 0.5);
      // They walk on toward the dock; gone through the dock door.
      leave(A, 'ray_1994', CB.dock + 4, 60); leave(A, 'c00_manager', CB.dock + 4, 64);
      leave(A, 'c00_second_a', CB.dock + 4, 64); leave(A, 'c00_second_b', CB.dock + 4, 62);
    },

    /* Locker Room B on entry: Jin changes; the bag is there to hit. */
    *c00_lockerb_enter(A, G) {
      if (S.combat && has(S.combat, 'spawnEnemy') && !actor('c00_bag')) S.combat.spawnEnemy({ id: 'c00_bag', type: 'bag', x: LB.bag, face: -1, name: 'Heavy bag' });
      if (flag(G, 'c00_time')) A.body({ look: 'jin_ring' });
      else if (flag(G, 'c00_wrapped')) A.body({ look: 'c00_jin_wraps' });
      else A.body({ look: 'c00_jin_trunks' });
      if (!flag(G, 'c00_lockerb_seen')) {
        A.flag('c00_lockerb_seen');
        A.ambience('hum', 0.35);
        yield A.think('SEO / MARSH in marker on masking tape. Somebody spelled it right. Trunks on. Hands next.');
      }
    },

    /* 0.5 Wraps (Hold still), then Teddy's mitts: teaching in motion. Then 0.6 the coat, and the four missing seconds. */
    *c00_wraps(A, G) {
      A.meet('lenny', 'c00_lenny');
      yield A.say('lenny', "Sit down, kid. Let's do your hands.");
      A.letterbox(true, 0.5);
      yield A.walk('jin', LB.bench + 26);
      A.face('jin', 1); A.pose('jin', 'sit');
      yield A.walk('lenny', LB.bench + 50);
      A.face('lenny', -1); A.pose('lenny', 'kneel');
      yield A.cam({ x: LB.bench + 38, y: 278, zoom: 1.35, dur: 0.8 });
      yield A.say('lenny', 'Look at these hands. Beautiful. Insurance should cover these hands.');
      if (!flag(G, 'c00_still_taught')) { A.flag('c00_still_taught'); toast('Hold still: let go of every key.', 'tip'); }
      A.sound('paper', { vol: 0.35 });
      yield stillWait(A, 4.0, () => A.bark('lenny', 'Easy. Easy, kid.', 1.2));
      A.sound('paper', { vol: 0.35 });
      A.body({ look: 'c00_jin_wraps' });
      A.flag('c00_wrapped');
      yield A.say('lenny', "There. Inspector'll stamp 'em, Ted'll sign the gloves, and you go make me rich.");
      A.pose('jin', null); A.pose('lenny', null);
      A.letterbox(false, 0.5); A.follow();
      yield A.walk('lenny', LB.table + 22);
      A.face('lenny', -1);
      A.quest('q0_main', 'step', 5);
      A.checkpoint('Locker Room B');
      yield* A.sub('c00_warmup');
      yield* A.sub('c00_coat');
    },

    *c00_warmup(A, G) {
      const C = S.combat;
      A.meet('teddy', 'c00_teddy');
      const tx = actX('teddy', LB.marks[2] + 12);
      yield A.say('teddy', 'Mitts. On the tape, kid. Square up.');
      // Teddy puts on the mitts: a partner who only swings when he means to.
      A.remove('teddy');
      if (C && has(C, 'spawnEnemy')) C.spawnEnemy({ id: 'c00_mitts', type: 'sparring', x: tx, face: -1, name: 'Teddy', look: 'teddy', hp: 1e9, opts: { script: true, dmgMul: 0.4 } });
      const M = RT.mitts = { hits: [], taken: [], slips: [], bag: 0 };
      yield A.walk('jin', tx - 30);
      A.face('jin', 1);
      const nHits = (pred) => M.hits.filter(pred).length;
      // 1. Jab x3.
      M.hits.length = 0;
      A.bark('c00_mitts', 'Jab.', 2.4);
      toast('Jab: [punch]', 'tip');
      yield A.waitFor(() => nHits((h) => h.move === 'jab' || h.move === 'cross') >= 3, { timeout: T(18), autoplay: { walkTo: tx - 28 } });
      yield A.say('c00_mitts', 'Again. Snap it back. A jab you leave out there is a gift.');
      // 2. One-two x3.
      M.hits.length = 0;
      A.bark('c00_mitts', 'One-two.', 2.4);
      toast('Tap [punch] twice: jab, cross. You can stop after either.', 'tip');
      yield A.waitFor(() => nHits((h) => h.move === 'cross') >= 3, { timeout: T(20), autoplay: { walkTo: tx - 28 } });
      yield A.say('c00_mitts', "Turn the back foot. The power's in the floor.");
      // 3. Hands up: he swats a slow mitt; hold guard.
      let ok = false;
      for (let i = 0; i < 4 && !ok; i++) {
        A.bark('c00_mitts', i ? 'Hands up! Again.' : 'Hands up!', 1.6);
        if (i === 0) toast('Guard: hold [down].', 'tip');
        M.taken.length = 0; M.slips.length = 0;
        yield A.wait(T(1.1));
        if (C && has(C, 'enemyAttack')) C.enemyAttack('c00_mitts', 'jab');
        yield A.wait(0.9);
        const tk = M.taken[0], sl = M.slips.find((s) => s.ok);
        ok = !!((tk && tk.blocked) || sl) || pol();
      }
      yield A.say('c00_mitts', "Chin down. Feet under you. That's the whole religion.");
      // 4. Slip, then make him pay.
      ok = false;
      for (let i = 0; i < 6 && !ok; i++) {
        A.bark('c00_mitts', 'Slip.', 1.4);
        if (i === 0) toast('Slip: [slip] just before it lands. Then [punch].', 'tip');
        M.slips.length = 0; M.hits.length = 0; M.taken.length = 0;
        yield A.wait(T(1.0));
        if (C && has(C, 'enemyAttack')) C.enemyAttack('c00_mitts', 'hook');
        yield A.waitFor(() => M.slips.length > 0 || M.taken.length > 0, { timeout: 1.3 });
        const s = M.slips[0];
        if (s && s.ok) {
          A.bark('c00_mitts', 'Now. Make me pay.', 1.2);
          yield A.waitFor(() => M.hits.some((h) => h.counter), { timeout: 1.0 });
          if (M.hits.some((h) => h.counter)) ok = true;
          else A.bark('c00_mitts', 'You had it. Again.', 1.4);
        } else A.bark('c00_mitts', s && s.early ? 'Early.' : 'Late.', 1.2);
        if (pol()) ok = true;
        yield A.wait(0.7);
      }
      // 5. Free: he calls one-twos and swings back. Prime body.
      A.bark('c00_mitts', 'Now put it together. Twenty seconds.', 2);
      let praised = false;
      const calls = ['One-two!', 'Jab!', 'One-two!', 'Slip!', 'Jab, jab!', 'One-two!', 'Slip!', 'Last one!'];
      for (let i = 0; i < calls.length; i++) {
        A.bark('c00_mitts', calls[i], 1.2);
        M.hits.length = 0;
        yield A.wait(T(1.3));
        if (calls[i] === 'Slip!' && C && has(C, 'enemyAttack')) C.enemyAttack('c00_mitts', 'hook');
        else if (i % 3 === 2 && C && has(C, 'enemyAttack')) C.enemyAttack('c00_mitts', 'jab');
        yield A.wait(T(1.2));
        if (!praised && M.hits.some((h) => h.counter)) { praised = true; A.bark('c00_mitts', "There it is. There's the one I drove to Pittsburgh.", 2.6); }
      }
      if (M.bag >= 12) yield A.say('c00_mitts', "You're gonna leave it all in here, kid.");
      // Mitts off.
      const mx = actX('c00_mitts', tx);
      A.remove('c00_mitts');
      RT.mitts = null;
      A.spawn(S.castNpc('teddy', { x: mx, face: -1, pose: 'idle' }));
      A.flag('c00_warmed');
      yield A.say('teddy', 'Good. Good. Commission wants the gloves signed. Back in five.');
      leave(A, 'teddy', LB.door + 2, 110);
      yield A.say('lenny', "I'll get ice.");
      leave(A, 'lenny', LB.door + 2, 95);
      yield A.waitFor(() => !actor('teddy') && !actor('lenny'), { timeout: 8 });
      A.sound('door', { vol: 0.5 });
      A.remove('teddy'); A.remove('lenny');
      A.flag('c00_alone');
      RT.glovesOnBench = true;
    },

    *c00_mirror(A, G) {
      if (flag(G, 'c00_alone') && !flag(G, 'c00_offer_done')) {
        A.flag('c00_mirror_alone');
        A.face('jin', 1);
        A.pose('jin', 'shadowbox', { hold: 2.4 });
        A.sound('whiff', { vol: 0.25 });
        yield A.wait(2.2);
        A.pose('jin', null);
      }
      yield A.think('No scar. Just a nervous guy with good hair.');
    },

    /* 0.6 The offer, and the four missing seconds. */
    *c00_coat(A, G) {
      // Alone. Wraps on, gloves on the bench. The tube flickers every seven seconds.
      A.objective('Wait for the call.');
      yield A.waitFor((g) => flag(g, 'c00_mirror_alone'), { timeout: T(16), autoplay: { walkTo: LB.mirror - 20, interact: 'i0_mirror' } });
      A.objective(null);
      // The door opens without a knock.
      A.letterbox(true, 0.9);
      yield A.walk('jin', LB.mirror - 16);
      A.face('jin', 1);
      yield A.cam({ x: (LB.bench + LB.mirror) / 2 + 30, y: 236, zoom: 1.05, dur: 0.9 });
      A.sound('door', { vol: 0.5 });
      A.spawn(S.castNpc('camel_coat', { x: LB.door + 6, face: 1, pose: 'idle' }));
      yield A.walk('camel_coat', LB.bench + 52, { speed: 38 });
      A.face('camel_coat', 1); A.pose('camel_coat', 'sit');
      yield A.wait(0.6);
      yield A.say('camel_coat', "Mr. Seo. Don't get up. I'm not anyone. I'm the kind of person who's in a lot of locker rooms.");
      yield A.wait(1.2);
      yield A.say('camel_coat', "I'm going to give you some practical advice, and then I'll leave, and you'll never see me again. Fifty thousand dollars. Cash, tonight, in your trainer's car. You go four rounds, you show this town your heart, and you go down, honourably, in the fourth.");
      const dream = fv(G, 'ch0_purse_dream');
      const tail = dream === 'umma_saturdays' ? '—your mother never works another Saturday.'
        : dream === 'new_apartment' ? '—a building with a doorman, if you like. Locks that work.'
          : '—the rent on 3B is paid till Christmas of next year.';
      yield A.say('camel_coat', "Your purse is forty, win or lose, less your trainer, the commission, the taxman. Win and you're a champion with a landlord. Take this and" + tail);
      yield A.say('camel_coat', "Castell's been champion three years. I'm offering you the guaranteed money instead of the risk. I've watched a lot of young men be brave for one night and poor for forty years. That isn't a bribe, son. That's arithmetic.");
      const line = yield A.choice(null, [
        { text: "I'm not for sale.", value: 'not_for_sale', policy: 'restraint', autoplay: true, record: 'You told the man in the coat you were not for sale.' },
        { text: "My family's in Section 14. I'm not losing in front of them.", value: 'my_family', record: 'You told the man in the coat your family was in Section 14.' },
        { text: 'Get out of my locker room.', value: 'get_out', policy: 'ruthless', record: 'You told the man in the coat to get out.' },
      ], { id: 'ch0_refusal_line' });
      A.flag('ch0_refusal_line', line || 'not_for_sale');
      yield A.say('jin', line === 'my_family' ? "My family's in Section 14. I'm not losing in front of them." : line === 'get_out' ? 'Get out of my locker room.' : "I'm not for sale.");
      yield A.wait(0.6);
      A.pose('camel_coat', null);
      yield A.say('camel_coat', 'Then I hope you\'re as good as they say. Truly.');
      yield A.walk('camel_coat', LB.door + 4, { speed: 38 });
      A.remove('camel_coat');
      A.sound('door', { vol: 0.35 });
      yield A.wait(2.0);                                  // the pneumatic closer hisses
      yield A.wait(1.5);
      A.flash('#e8f0f0', 0.12);                           // the tube flickers
      A.memory('mem_offer');
      A.meet('camel_coat', 'c00_offer');
      A.flag('c00_offer_done');
      // The door opens again. Lenny backs in with the ice bucket, talking before he's through.
      A.sound('door', { vol: 0.5 });
      A.spawn(S.castNpc('lenny', { x: LB.door + 18, face: -1, pose: 'carry' }));
      yield A.say('lenny', "Kid, you look pale, you're dry—", { wait: 0.9 });
      // HARD CUT. No fade, no sound bridge: room tone and the flicker phase jump. Four seconds are missing.
      A.remove('lenny');
      A.spawn(S.castNpc('lenny', { x: LB.sink - 4, face: 1, pose: 'work' }));      // at the sink, back turned, the tap running
      A.spawn(S.castNpc('teddy', { x: LB.door + 12, face: 1, pose: 'idle' }));
      A.place('jin', LB.marks[1]); A.face('jin', -1); A.pose('jin', null);
      A.body({ look: 'jin_ring' });                        // the gloves are laced on; they were on the bench a moment ago
      RT.glovesOnBench = false;
      A.ambience('hum', 0.55); A.ambience('crowd', 0.35);
      A.cam({ x: (LB.door + LB.marks[1]) / 2 + 40, y: 236, zoom: 1.0, dur: 0 });
      A.flag('c00_time');
      yield A.say('teddy', 'Time.');
      A.letterbox(false, 0.4);
      yield* A.sub('c00_walkout');
    },

    /* 0.7 The corridor: Teddy's hand on his shoulder. */
    *c00_walkout(A, G) {
      A.quest('q0_main', 'step', 6);
      yield A.fade(1, 0.35);
      yield A.goto('civic_backstage_1994', CB.lockerB + 14, { face: 1, fade: false });
      A.body({ look: 'jin_ring_robe' });
      A.spawn(S.castNpc('teddy', { x: CB.lockerB + 2, face: 1, pose: 'handShoulder' }));
      A.spawn(S.castNpc('lenny', { x: CB.lockerB - 30, face: 1, pose: 'idle' }));
      A.ambience('crowd', 0.25);
      yield A.fade(0, 0.5);
      thinBox(A, 0.4, 0.4);
      yield A.say('teddy', 'Anything you need to tell me before we walk?');
      const told = yield A.choice(null, [
        { text: 'A man in a camel coat offered me fifty to go down in four.', value: 'told', policy: 'restraint', autoplay: true, record: 'You told Teddy about him.' },
        { text: "No. Let's go.", value: 'silent', policy: 'ruthless', record: "You didn't tell anyone." },
      ], { id: 'ch0_told_teddy' });
      A.flag('ch0_told_teddy', told !== 'silent');
      if (told !== 'silent') {
        yield A.say('jin', 'A man in a camel coat offered me fifty to go down in four.');
        A.pose('teddy', 'idle');
        yield A.wait(0.9);                                  // Teddy stops for a beat
        A.pose('lenny', 'think', { hold: 2.2 });            // behind them, Lenny's hand goes to his neck
        yield A.say('teddy', "Every title fight has a guy in a coat. We win anyway. That's the answer to the coat.");
      } else {
        yield A.say('jin', "No. Let's go.");
        yield A.say('teddy', 'Good. Chin down.');
        yield A.think('Not now. After. Everything after.');
      }
      A.restrict(WALK_ONLY('Walk. Let them see you.'));
      tethers([{ id: 'teddy', loc: 'civic_backstage_1994', off: -12, walk: 'handShoulder', rest: 'handShoulder', speed: 120 },
        { id: 'lenny', loc: 'civic_backstage_1994', off: -42, walk: 'walk', rest: 'idle', speed: 120 }]);
      thinBox(A, 0, 0.4);
      A.bark('teddy', 'Walk. Let them see you.', 2.4);
    },

    /* The tunnel: 1100 px of dark, the crowd swelling, the announcer in pieces. */
    *c00_tunnel_walk(A, G) {
      A.restrict(WALK_ONLY('Walk. Let them see you.'));
      A.body({ look: 'jin_ring_robe' });
      A.spawn(S.castNpc('teddy', { x: 26, face: 1, pose: 'handShoulder' }));
      A.spawn(S.castNpc('lenny', { x: 0, face: 1, pose: 'idle' }));
      tethers([{ id: 'teddy', loc: 'c00_tunnel', off: -12, walk: 'handShoulder', rest: 'handShoulder', speed: 120 },
        { id: 'lenny', loc: 'c00_tunnel', off: -42, walk: 'walk', rest: 'idle', speed: 120 }]);
      A.ambience('crowd', 0.12);
      thinBox(A, 0.4, 0.6);
      const frags = [[220, '"...from Eastgate..."'], [480, '"...Calder\'s own..."'], [760, '"...the KESSLER KID—"']];
      for (const fr of frags) {
        const x = fr[0];
        yield A.waitFor(() => { crowdTo(0.12 + 0.55 * clamp(jinX() / 1100, 0, 1)); return jinX() >= x; }, { autoplay: { walkTo: x + 12 } });
        toast(fr[1], 'info');
        A.sound('crowdRoar', { vol: 0.2 + 0.5 * x / 1100 });
      }
      yield A.waitFor(() => { crowdTo(0.12 + 0.55 * clamp(jinX() / 1100, 0, 1)); return jinX() >= 1030; }, { autoplay: { walkTo: 1050 } });
      RT.tethers = null;
      A.fade(1, 0.25, '#fff6e4');
      yield A.wait(0.25);
      yield A.goto('civic_ring_1994', CR.tunnel + 30, { face: 1, fade: false });
      yield* A.sub('c00_reveal');
    },

    /* The reveal: the bowl opens. Four seconds to look. Then the ring. */
    *c00_reveal(A, G) {
      A.quest('q0_main', 'step', 7);
      A.body({ look: 'jin_ring_robe' });
      A.restrict(WALK_ONLY('Walk. Let them see you.'));
      A.place('teddy', CR.tunnel + 6); A.place('lenny', CR.tunnel - 18);
      tethers([{ id: 'teddy', loc: 'civic_ring_1994', off: -12, walk: 'handShoulder', rest: 'handShoulder', speed: 120 },
        { id: 'lenny', loc: 'civic_ring_1994', off: -40, walk: 'walk', rest: 'idle', speed: 120 }]);
      A.ambience('crowd', 0.7);
      setMood('cheer');
      A.sound('crowdRoar', { vol: 1 });
      A.cam({ target: 'jin', zoom: 1, dur: 0 });
      A.fade(0, 0.6);
      thinBox(A, 0.4, 0.4);
      // The camera pulls out while he keeps walking: Section 14 Row F, Row K, the end of the press row, each on a third.
      A.cam({ x: 650, y: 360, zoom: 0.62, dur: 2.5 });
      yield A.waitFor(() => false, { timeout: 2.5 + T(4), autoplay: { walkTo: CR.tunnel + 120 } });
      RT.pentax = 1;                                      // a camera flash from Section 14: Min's Pentax
      A.sound('ui', { vol: 0.4 });
      // The walk to the ring.
      RT.tethers = null;
      A.letterbox(true, 0.6);
      A.cam({ target: 'jin', zoom: 1, dur: 1.2 });
      A.walk('teddy', CR.ring0 - 14); A.walk('lenny', CR.ring0 - 30);
      yield A.walk('jin', CR.ring0 + 40);
      A.face('teddy', 1); A.face('lenny', 1);
      A.pose('teddy', 'armsCrossed'); 
      A.spawn({ id: 'ray_1994', look: 'ray_1994_robe', name: 'Ray', x: CR.red, face: -1, pose: 'idle' });
      // Robes off; centre ring.
      A.body({ look: 'jin_ring' });
      try { if (S.world && has(S.world, 'setLook')) S.world.setLook('ray_1994', 'ray_1994'); } catch (_) { /* cosmetic */ }
      A.walk('ray_1994', CR.center + 24);
      yield A.walk('jin', CR.center - 24);
      A.face('jin', 1); A.face('ray_1994', -1);
      A.place('referee', CR.center); A.face('referee', -1);
      yield A.cam({ x: CR.center, y: ROUND_GROUND - 40, zoom: 1.2, dur: 0.8 });
      A.pose('referee', 'point', { hold: 1.2 });
      yield A.say('referee', "Protect yourselves at all times. Touch 'em.");
      A.meet('referee', 'c00_referee');
      A.pose('ray_1994', 'guard'); A.sound('block', { vol: 0.35 }); yield A.wait(0.28);
      A.pose('ray_1994', 'idle'); yield A.wait(0.16);
      A.pose('ray_1994', 'guard'); A.sound('block', { vol: 0.35 }); yield A.wait(0.3);
      A.pose('ray_1994', 'jab', { hold: 0.3 }); A.pose('jin', 'jab', { hold: 0.3 }); A.sound('block', { vol: 0.5 });
      yield A.wait(0.5);
      A.pose('ray_1994', 'guard'); A.pose('jin', null);
      A.walk('referee', CR.center + 40);
      A.letterbox(false, 0.5);
      A.follow();
      A.restrict(limits());
      A.checkpoint('The walk-out');
      yield* A.sub('c00_rounds');
    },

    /* E0.2 The title bout: three rounds, each its own bout; the corners are scenes. */
    *c00_rounds(A, G) {
      ensureHooks();
      RT.bout = { round: 1, jinHp: 100, rayHp: null, resistance: 0 };
      for (let n = 1; n <= 3; n++) {
        A.remove('ray_1994');
        RT.bout.round = n;
        if (n === 3) A.objective(null);
        yield A.bout(boutDef(n));
        const C = S.combat, e = actor(OPP);
        RT.bout.jinHp = C && C.jin ? C.jin.hp : 60;
        if (e && Number.isFinite(e.hp)) RT.bout.rayHp = e.hp;
        const ex = e ? clamp(e.x, CR.ring0 + 40, CR.ring1 - 20) : CR.red;
        A.remove(OPP);
        A.spawn({ id: 'ray_1994', look: 'ray_1994', name: 'Ray', x: ex, face: -1, pose: 'guard' });
        if (n === 1) yield* A.sub('c00_corner1');
        else if (n === 2) yield* A.sub('c00_corner2');
        else yield* A.sub('c00_fall');
      }
    },

    *c00_corner1(A, G) {
      A.letterbox(true, 0.5);
      A.walk('ray_1994', CR.ring1 - 18);
      yield A.walk('jin', CR.ring0 + 16);
      A.face('jin', 1); A.pose('jin', 'sit');
      A.walk('teddy', CR.ring0 + 36);
      yield A.cam({ x: CR.ring0 + 30, y: ROUND_GROUND - 40, zoom: 1.25, dur: 0.7 });
      A.face('teddy', -1);
      yield A.say('teddy', "You're winning the round and you know it. Quit showing off. He's waiting on your jab. Give him the jab and then don't be there.");
      // Lenny holds the corner's clear bottle to the mouthguard.
      A.pose('lenny', 'reach', { hold: 1.4 });
      yield A.wait(1.0);
      A.bark('min', 'WIN FAST!', 2.0);
      yield A.wait(1.4);
      RT.bout.jinHp = Math.min(100, (RT.bout.jinHp || 60) + 40);
      A.pose('jin', null);
      A.walk('teddy', CR.ring0 - 14);
      A.letterbox(false, 0.5);
      A.follow();
    },

    /* Corner 2: "Something's wrong." */
    *c00_corner2(A, G) {
      A.letterbox(true, 0.6);
      A.fx('muffle', 0.8, 0.6);
      A.walk('ray_1994', CR.ring1 - 18);
      yield A.walk('jin', CR.ring0 + 16);
      A.face('jin', 1); A.pose('jin', 'sit');
      A.walk('lenny', CR.ring0 + 2);
      yield A.walk('teddy', CR.ring0 + 40);
      A.face('teddy', -1); A.pose('teddy', 'kneel');
      A.face('lenny', 1); A.pose('lenny', 'reach');
      yield A.cam({ x: CR.ring0 + 26, y: ROUND_GROUND - 32, zoom: 1.3, dur: 1.0 });
      if (!G.memories.mem_bottle) {
        // The recollection never came in the round (an early bell): it comes now, as he sits.
        RT.bout.flashT = 1.15; A.sound('heartbeat', { vol: 1 });
        yield A.wait(1.2);
        A.memory('mem_bottle');
      }
      yield A.think('The ropes are too far away. Why are the ropes so far away.');
      yield A.say('jin', "Teddy. Something's wrong.");
      yield A.say('teddy', 'What?');
      yield A.say('jin', "My legs. I can't— I can't hear you right.");
      yield A.say('teddy', "It's nerves, kid. It's the lights. Breathe. Breathe with me.");
      if (flag(G, 'ch0_told_teddy')) {
        yield A.say('jin', 'The coat, Teddy. The guy in the—');
        A.face('teddy', 1);                                // he looks at the red corner for a long beat
        yield A.wait(1.8);
        A.face('teddy', -1);
        yield A.say('teddy', '...Not now. Win this, then we talk about coats.');
      }
      A.face('lenny', -1);                                 // not looking at Jin
      yield A.say('lenny', "He's fine, Ted. Look at him. He's fine. Send him.");
      // The one time the game shows Teddy's doubt: no face, only the head.
      yield A.cam({ x: CR.ring0 + 40, y: ROUND_GROUND - 30, zoom: 1.5, dur: 0.5 });
      A.pose('teddy', 'think');
      yield A.wait(1.5);
      A.pose('teddy', 'kneel');
      yield A.say('teddy', 'One more round. Win it or I stop it myself.');
      A.memory('mem_corner');
      A.meet('teddy', 'c00_corner');
      // The stool is pulled out. Jin stands. The camera stays on the empty stool.
      A.pose('jin', null); A.pose('teddy', null); A.pose('lenny', null);
      yield A.cam({ x: CR.ring0 + 14, y: ROUND_GROUND - 20, zoom: 1.3, dur: 0.3 });
      A.walk('teddy', CR.ring0 - 14); A.walk('lenny', CR.ring0 - 30);
      yield A.walk('jin', CR.ring0 + 110);
      yield A.wait(1.0);
      RT.bout.jinHp = clamp(Math.max((RT.bout.jinHp || 50) + 30, 70), 0, 100);   // room for a counter or two in the third
      A.fx('muffle', 0, 0.3);
      A.letterbox(false, 0.5);
      A.follow();
    },

    /* Round 3's end: unavoidable. Good play changes ch0_resistance, never the outcome. */
    *c00_fall(A, G) {
      const R = RT.bout || {};
      const res = clamp(R.resistance || 0, 0, 3);
      A.flag('ch0_resistance', res);
      A.objective(null);
      A.letterbox(true, 0.5);
      A.fx('muffle', 0.82, 0.3); A.fx('heartbeat', 0.85, 0.3);
      const jx = clamp(jinX(), CR.ring0 + 60, CR.ring1 - 80);
      A.place('jin', jx); A.face('jin', 1);
      A.place('ray_1994', jx + 34); A.face('ray_1994', -1); A.pose('ray_1994', 'guard');
      // 1. Legs go: his knees buckle; one glove touches the canvas.
      A.pose('jin', 'kneel');
      A.sound('down', { vol: 0.45 });
      yield A.cam({ x: jx + 10, y: ROUND_GROUND - 30, zoom: 1.1, dur: 0.6 });
      yield A.wait(0.8);
      // 2. The warning sign ignored.
      yield A.walk('referee', jx + 18);
      A.face('referee', -1);
      yield A.cam({ x: jx + 10, y: ROUND_GROUND - 22, zoom: 1.4, dur: 0.5 });
      A.pose('referee', 'reach', { hold: 1.0 });         // he wipes Jin's gloves on his own shirt
      yield A.wait(1.0);
      A.pose('referee', 'think');                         // half a second at his eyes
      yield A.wait(0.5);
      A.face('referee', 1);                               // a glance at the round clock
      yield A.wait(0.4);
      A.pose('jin', 'guard');
      A.face('referee', -1);
      A.pose('referee', 'wave');
      yield A.say('referee', 'Box.');
      yield A.wait(2.0);
      A.walk('referee', jx + 120, { speed: 60 });
      // 3. Ray's half-second.
      yield A.cam({ x: jx + 17, y: ROUND_GROUND - 36, zoom: 1.25, dur: 0.5 });
      A.pose('ray_1994', 'idle');
      yield A.wait(0.5);
      A.face('ray_1994', 1);                              // toward the end of the press row; the camera does not follow
      yield A.wait(0.5);
      A.face('ray_1994', -1);
      A.pose('ray_1994', 'guard'); A.sound('block', { vol: 0.35 });
      A.memory('mem_row');
      // 4. Control leaves. His guard lowers on its own.
      A.letterbox(true, 0.5);
      A.pose('jin', 'tired');
      yield A.say('jin', 'Hands up. Hands up. Hands—', { thought: true, wait: 1.4 });
      // 5. Ray walks him into his own blue corner and lands a combination on the ropes.
      A.walk('ray_1994', CR.ring0 + 44, { speed: 50 });
      yield A.walk('jin', CR.ring0 + 14, { speed: 42 });
      A.face('jin', 1); A.face('ray_1994', -1);
      yield A.cam({ x: CR.ring0 + 30, y: ROUND_GROUND - 30, zoom: 1.3, dur: 0.4 });
      const combo = [['jab', 'jab'], ['cross', 'cross'], ['hook', 'hook']];
      for (let i = 0; i < combo.length; i++) {
        A.pose('ray_1994', combo[i][0], { hold: 0.28 });
        if (i === 0 && res >= 2) {
          // He slips the first one on his own. The crowd gasps.
          A.pose('jin', 'slip', { hold: 0.3 }); A.sound('slipOk'); A.sound('crowdGasp', { vol: 1 });
          yield A.wait(0.5);
          continue;
        }
        A.pose('jin', 'hurt', { hold: 0.3 });
        A.sound(combo[i][1], { vol: 1 });
        spark(CR.ring0 + 20, ROUND_GROUND - 40);
        S.hitstop = Math.max(S.hitstop || 0, 0.06);
        if (i === 2) A.shake(3, 0.3);
        yield A.wait(0.45);
      }
      // 6. The bell: clear, dry, unmuffled. Ray throws one more right after it.
      A.fx('muffle', 0, 0);
      A.sound('bell', { vol: 1 });
      yield A.wait(0.35);
      A.fx('muffle', 0.85, 0.15);
      A.fx('slowmo', 0.75, 0.1);
      A.pose('ray_1994', 'cross', { hold: 0.9 });
      yield A.wait(0.3);
      A.pose('jin', 'knockdown');
      A.sound('heavy', { vol: 1 });
      spark(CR.ring0 + 22, ROUND_GROUND - 40);
      yield A.wait(0.6);
      // 7. The fall. Everything underwater except the bell, which keeps ringing.
      A.fx('slowmo', 0, 0.8);
      A.pose('jin', 'down');
      A.sound('down', { vol: 0.8 });
      A.fx('desat', 0.5, 1.2);
      A.cam({ x: CR.ring0 + 30, y: ROUND_GROUND, zoom: 1.5, dur: 2.4 });
      A.sound('bell', { vol: 0.9 }); yield A.wait(0.9);
      A.walk('ray_1994', CR.ring0 + 120, { speed: 40 });  // Ray's white shoes step away
      A.sound('bell', { vol: 0.9 }); yield A.wait(0.9);
      A.walk('referee', CR.ring0 + 40, { speed: 30 });    // the referee's shoes come late
      A.sound('bell', { vol: 0.9 }); yield A.wait(0.9);
      // 8. Fragments between the bell strikes (memory filter).
      A.fx('sepia', 0.6, 0);
      const frag = function* (x, y, setup) {
        if (setup) setup();
        A.cam({ x, y, zoom: 1.6, dur: 0 });
        yield A.wait(0.5);
        A.cam({ x: CR.ring0 + 30, y: ROUND_GROUND, zoom: 1.5, dur: 0 });
        A.sound('bell', { vol: 0.9 });
        yield A.wait(0.45);
      };
      yield* frag(CR.rowF.x - 12, CR.rowF.y - 26, () => A.pose('umma', 'cower'));
      yield* frag(CR.ring0 - 4, ROUND_GROUND - 30, () => {
        A.flag('_c00_min_apron');
        A.place('min', CR.ring0 - 6, ROUND_GROUND); A.face('min', 1); A.pose('min', 'reach');
        A.fx('muffle', 1, 0);                              // her shout is the one sound we cannot hear
      });
      A.fx('muffle', 0.85, 0.1);
      yield* frag(CR.pressEnd + 60, ROUND_GROUND - 30, () => { A.pose('camel_coat', null); A.face('camel_coat', 1); A.walk('camel_coat', CR.pressEnd + 150, { speed: 26 }); });
      yield* frag(CR.rowK.x, CR.rowK.y - 24, null);
      yield* frag(CR.rowK.x, CR.rowK.y - 24, () => A.remove('rook_1994'));
      // 9. Black. The bell three more times over black. Then silence.
      A.fade(1, 0);
      A.fx('sepia', 0, 0); A.fx('desat', 0, 0);
      A.sound('bell', { vol: 1 }); yield A.wait(0.9);
      A.sound('bell', { vol: 1 }); yield A.wait(0.9);
      A.sound('bell', { vol: 1 }); yield A.wait(0.9);
      A.ambience(null, 0.2);
      A.fx('muffle', 0, 0); A.fx('heartbeat', 0, 0);
      yield A.wait(2.0);
      A.memory('mem_bell');
      // The chapter ends. His moveset goes with it (Chapter 1 starts in a bed).
      clearBoutFx();
      RT.bout = null;
      G.skills.counter = false;
      A.unrestrict();
      const q = G.quests.q0_main;
      if (q && q.state === 'active') q.state = 'failed';     // "Win the title." never completes; it simply goes out
      A.flag('ch0_complete');
      yield A.endChapter();
    },
  };

  /* ══════════════════════════════════════════════════════════════════
     DIALOGS (talk to people)
     ══════════════════════════════════════════════════════════════════ */
  const dialogs = {
    *c00_han_talk(A, G) {
      if (!flag(G, 'c00_kitchen_done')) {
        yield A.say('c00_han', 'Kessler Kid! Six years you run past my store. Tonight you run past Castell.');
        yield A.say('jin', "That's the plan, Mr. Han.");
        yield A.say('c00_han', 'Plums are on me if you win. Half price if you lose. So do not lose. I cannot afford it.');
      } else {
        yield A.say('c00_han', 'Radio says sold out. Half the street is going, the other half is listening. Go. Go!');
      }
    },
    *c00_kids_talk(A, G) {
      if (flag(G, 'c00_kitchen_done')) {
        yield A.say('c00_kid_b', "We're listening on the radio! My dad says if you win we can stay up!");
        yield A.say('jin', 'Then I better win.');
        return;
      }
      yield A.say('c00_kid_a', "Jin! Jin! Who's the real Seo, me or him?");
      const v = yield A.choice(null, [
        { text: 'You. Your feet are better.', value: 'a', autoplay: true },
        { text: 'Him. He drew the ring.', value: 'b' },
      ], { who: 'c00_kid_a' });
      if (v === 'b') yield A.say('c00_kid_a', 'I did the blue part! The blue part is the hard part!');
      else yield A.say('c00_kid_b', 'Aw, man.');
      yield A.say('c00_kid_b', 'Knock him out in one so we can stay up for it!');
    },
    *c00_teddy_street(A, G) {
      A.meet('teddy', 'c00_teddy');
      yield A.say('teddy', "Five o'clock. Car at six. Eat something boiled.");
      yield A.say('jin', "Umma's making rice.");
      yield A.say('teddy', 'Rice is boiled. Rice is fine. Nothing fried. Nothing your sister calls a treat.');
      yield A.say('teddy', "Hands up, chin down, feet under you. That's the whole religion. Go home.");
    },
    *c00_teddy_wagon(A, G) {
      if (flag(G, 'c00_in_wagon')) return;
      yield A.say('teddy', "Six o'clock means six o'clock. You eat?");
      yield A.say('jin', 'I ate.');
      const v = yield A.choice(null, [
        { text: 'Get in the wagon.', value: 'go', autoplay: true },
        { text: 'One minute.', value: 'wait' },
      ], { who: 'teddy' });
      if (v === 'go') { yield* A.sub('c00_drive'); return; }
      yield A.say('teddy', 'One minute. I am counting it.');
    },
    *c00_lenny_wagon(A, G) {
      A.meet('lenny', 'c00_lenny');
      yield A.say('lenny', 'Big night, kid. Big night.');
      yield A.say('lenny', "Tackle box. Swabs, adrenaline, the end-swell. My whole office. Nobody's cutting tonight, right? Right.");
    },
    *c00_umma_after(A, G) {
      if (!flag(G, 'c00_kitchen_done')) { yield A.say('umma', 'Shoes. Then wash. Then sit.'); return; }
      yield A.say('umma', 'Go. Teddy will wear out the horn.');
      const v = yield A.choice(null, [
        { text: 'Hug Umma.', value: 'hug', autoplay: true },
        { text: 'Go.', value: 'go' },
      ], { who: 'umma' });
      if (v === 'hug') {
        yield A.walkTo('jin', 'umma', 12);
        A.pose('jin', 'hug', { hold: 1.6 }); A.pose('umma', 'hug', { hold: 1.6 });
        yield A.wait(1.6);
        yield A.say('umma', 'Okay. Okay. Your collar.');
      } else yield A.say('umma', 'Twelve-ten. Remember.');
    },
    *c00_min_after(A, G) {
      if (!flag(G, 'c00_kitchen_done')) { yield A.say('min', "Umma said five. It's four fifty-two. Sit before she counts."); return; }
      yield A.say('min', "Window booth after. I'll save it.");
      const v = yield A.choice(null, [
        { text: "Jab Min's shoulder.", value: 'jab', autoplay: true },
        { text: 'See you after.', value: 'go' },
      ], { who: 'min' });
      if (v === 'jab') {
        yield A.walkTo('jin', 'min', 16);
        A.pose('jin', 'jab', { hold: 0.3 }); A.sound('block', { vol: 0.3 });
        yield A.wait(0.4);
        A.pose('min', 'jab', { hold: 0.3 }); A.sound('block', { vol: 0.3 });
        yield A.wait(0.4);
        yield A.say('min', 'See? I have a jab. I just choose peace.');
      } else yield A.say('min', 'Win fast. The bus.');
    },
    *c00_inspector(A, G) {
      A.meet('inspector', 'c00_inspector');
      if (!flag(G, 'c00_wrapped')) {
        yield A.say('inspector', "Seo. Wraps go on in B, I stamp 'em there. Your cutman's waiting with his tackle box.");
        return;
      }
      yield A.say('inspector', 'Gloves, Seo. Then go be famous.');
    },
    *c00_teddy_locker(A, G) {
      if (!flag(G, 'c00_wrapped')) { yield A.say('teddy', 'Lenny first. Hands, then mitts. Go sit.'); return; }
      yield A.say('teddy', 'Mitts in a minute. Breathe through your nose.');
    },
    *c00_lenny_locker(A, G) {
      if (flag(G, 'c00_wrapped')) { yield A.say('lenny', 'Look at these hands. Beautiful.'); return; }
      yield* A.sub('c00_wraps');
    },
  };

  /* ══════════════════════════════════════════════════════════════════
     QUESTS, MEMORIES, PEOPLE
     ══════════════════════════════════════════════════════════════════ */
  const quests = P.withClimb({
    q0_main: {
      title: 'One More Round', kind: 'main', giver: 'teddy',
      summary: 'Fight night. Home for dinner by five, Teddy\'s car at six, the title at ten.',
      steps: [
        { text: 'Finish your run. Home by five.', target: { loc: 'kessler_ave_1994', x: KX.busStop + 50 } },
        { text: 'Go up to 3B.', target: { loc: 'apt_3b_1994', x: AX.marks - 12 } },
        { text: 'Eat with your family.', target: { loc: 'apt_3b_1994', x: AX.marks - 12 } },
        { text: "Teddy's honking.", target: { loc: 'kessler_ave_1994', x: KX.wagon + 12 } },
        { text: 'Get your hands wrapped.', target: { loc: 'civic_locker_b', x: LB.table + 22 } },
        { text: 'Warm up with Teddy.', target: { loc: 'civic_locker_b', x: LB.marks[2] } },
        { text: 'Walk out.', target: { loc: 'civic_backstage_1994', x: CB.tunnel } },
        { text: 'Win the title.', target: { loc: 'civic_ring_1994', x: CR.center } },
      ],
    },
    q0_look_around: {
      title: 'Look around before you go', kind: 'side', giver: 'umma',
      summary: 'Four of the things in 3B that make it home. Once you leave for the Civic, the chance is gone.',
      steps: [0, 1, 2, 3].map((n) => ({ text: 'Look around 3B (' + n + ' of 4).', target: { loc: 'apt_3b_1994', x: [AX.tv, AX.singer, AX.sugar, AX.photoAppa][n] } })),
      reward: 'A line of Min\'s handwriting in the memory of the kitchen.',
    },
  });

  const DREAM_LINE = { rent: 'I said the rent. Umma said two months behind; Min said three; Umma said two and a half.',
    umma_saturdays: "I said Umma's Saturdays. She asked who would fold the hotel sheets.",
    new_apartment: 'I said a place with a lock that works. Umma said the sock works.' };
  const memories = {
    mem_kitchen: {
      title: 'Eat first', when: 'August 20, 1994 · Apartment 3B, 412 Kessler',
      get text() {
        const G = S.G;
        let t = 'Umma at the stove with her back to us. Min on the counter with the Ledger, heels knocking the cabinet. "They airbrushed you into a different person." "He has my chin."\n\n' +
          '"Jin-ah. Sit. Eat first. Then be famous." The last bus from the Civic is twelve-ten. A cab is eight dollars.\n\n' +
          (DREAM_LINE[fv(G, 'ch0_purse_dream')] || DREAM_LINE.rent) + '\n\n' +
          'Min said tonight\'s cab was on her. Umma fixed the waistband of my trunks with me standing in the kitchen and bit the thread. "Don\'t let them hit your face. I just fixed your face."';
        if (flag(G, 'c00_looked_around')) t += '\n\nUnder Min\'s note on the fridge pad, her weigh-in sheet in her bookkeeping hand: 159½. DRINK WATER. NO PIZZA. CAB = $8 (I HAVE IT).';
        return t;
      },
    },
    mem_offer: { title: 'Arithmetic', when: 'August 20, 1994 · Locker Room B',
      text: 'A camel coat on the far edge of the bench, seen in the mirror. He did not knock. Fifty thousand dollars, cash, in Teddy\'s car: four rounds, then down in the fourth, honourably.\n\n"That isn\'t a bribe, son. That\'s arithmetic."\n\nHe knew what we said in the kitchen. I told him no.' },
    mem_bottle: { title: "You're dry, kid", when: 'August 20, 1994 · round two (a fragment)',
      text: 'Three grainy frames.\n\nLocker B from somewhere I was not standing. A wrist with white tape on it like a bracelet. A white squeeze bottle with a red band of tape round the neck, held out to me.\n\n"You\'re dry, ki—"\n\nThen Castell\'s jab, and nothing after it.' },
    mem_corner: { title: 'Send him', when: 'August 20, 1994 · the corner after round two',
      text: '"Teddy. Something\'s wrong." "It\'s nerves, kid. It\'s the lights." The ropes were too far away.\n\n"He\'s fine, Ted. Look at him. He\'s fine. Send him."\n\nTeddy looked at me for a long time. "One more round. Win it or I stop it myself."' },
    mem_row: { title: 'The half-second', when: 'August 20, 1994 · round three',
      text: 'The referee wiped my gloves on his shirt, looked at my eyes, looked at the clock, and said "Box."\n\nCastell stood still for half a second. His head turned toward the end of the press row. Then he tapped his chin.' },
    mem_bell: { title: 'The bell', when: 'August 20, 1994 · about 10:05 PM',
      text: 'My hands came down on their own. The bell rang for the end of the round and he threw one more.\n\nThen the bell kept ringing. Nobody was stopping anything. It was the last clear sound.' },
  };

  const people = {
    min: { notes: [{ id: 'c00_min', text: 'Kwik Copy on weekdays, accounting at night. Put up forty posters; says I owe her forty favours. Saving the window booth at Sunny\'s for after.' }] },
    umma: { notes: [{ id: 'c00_umma', text: 'Folds hotel sheets at Royal Linen, Saturdays too. Worries about the last bus from the Civic: twelve-ten.' }] },
    teddy: { notes: [
      { id: 'c00_teddy', text: 'Thirty years waiting for a title. "Hands up, chin down, feet under you. That\'s the whole religion."' },
      { id: 'c00_corner', text: '"It\'s nerves, kid." Then: "One more round. Win it or I stop it myself."' },
    ] },
    lenny: { notes: [{ id: 'c00_lenny', text: 'Cutman. Calls everybody kid. White tape on his left wrist like a bracelet. His hands shook a little tonight.' }] },
    camel_coat: { notes: [{ id: 'c00_offer', text: 'Walked into Locker B without knocking. Fifty thousand to go down in the fourth. Called it arithmetic.' }] },
    ray: { notes: [{ id: 'c00_ray', text: 'Champion three years. Stopped in the corridor: "Good luck, kid. I mean it. Make it a fight." Taps his gloves together twice.' }] },
    okafor: { notes: [{ id: 'c00_okafor', text: '"Knock him down, then come home safe. In that order." Two fingers on my forehead.' }] },
    inspector: { notes: [{ id: 'c00_inspector', text: '"Gloves, Seo. Then go be famous."' }] },
    referee: { notes: [{ id: 'c00_referee', text: 'Phil Ostrowski. "Protect yourselves at all times." In the third he wiped my gloves, looked at my eyes, looked at the clock, and said "Box."' }] },
  };

  /* ══════════════════════════════════════════════════════════════════
     CHAPTER
     ══════════════════════════════════════════════════════════════════ */
  S.defineChapter({
    id: N, title: 'One More Round', date: 'Saturday, August 20, 1994', place: 'Eastgate, Calder',
    card: ['Fight night.', 'Home for dinner by five. The car leaves at six.'],
    start: { loc: 'kessler_ave_1994', x: KX.right - 130, face: -1, scene: 'c00_start', fadeIn: false },
    required: ['kessler_ave_1994', 'kessler_412_stairs_1994', 'apt_3b_1994', 'c00_river_road', 'civic_backstage_1994', 'civic_locker_b', 'c00_tunnel', 'civic_ring_1994'],
    body: { look: 'c00_jin_run', power: 1.3, speedMul: 1, breath: false, limp: 0, delay: 0 },
    travel: "Tonight there's only one place to be.",
    locations: {
      kessler_ave_1994: kesslerAve, kessler_412_stairs_1994: stairs412, apt_3b_1994: apt3b, c00_river_road: RIVER_ROAD,
      civic_backstage_1994: backstage, civic_locker_b: lockerB, c00_tunnel: TUNNEL, civic_ring_1994: ring,
    },
    quests, evidence: {}, memories, people, scenes, dialogs,
    mapNodes: P.nodes({
      map_eastgate: { locs: ['kessler_ave_1994'], travel: false },
      map_civic: { locs: ['civic_backstage_1994'], travel: false },
    }),
    // What Chapter 0 hands on along the restraint path (README §4).
    canon: {
      flags: { ch0_purse_dream: 'rent', ch0_refusal_line: 'not_for_sale', ch0_told_teddy: true, ch0_resistance: 0, ch0_complete: true },
      memories: ['mem_kitchen', 'mem_offer', 'mem_bottle', 'mem_corner', 'mem_row', 'mem_bell'],
      people: ['min', 'umma', 'teddy', 'lenny', 'camel_coat', 'ray', 'okafor', 'inspector', 'referee'],
      quests: { q0_main: 'failed' },
      visited: ['kessler_ave_1994', 'kessler_412_stairs_1994', 'apt_3b_1994', 'civic_backstage_1994', 'civic_locker_b', 'civic_ring_1994'],
    },
    summary: (G) => {
      const out = ['Jin loses control over his future.'];
      const r = +fv(G, 'ch0_resistance') || 0;
      if (r > 0) out.push('You landed ' + (r === 1 ? 'one counter' : r === 2 ? 'two counters' : 'three counters') + ' in the third round.');
      return out;
    },
  });
})(window.STORY);
