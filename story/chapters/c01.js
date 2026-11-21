/* Story Mode — chapters/c01.js — Chapter 1, The Name Above the Bed (BIBLE ch01).
   St. Agnes Long-Term Care, Hillcrest. Monday, October 7 to Wednesday, December 18, 1996.
   Gameplay identity: relearn the body; read the paperwork. No combat. Seven short sessions separated by time
   cards (G.flags.c01_sess = 1 Day 1, 2 Week 2, 4 Week 4, 7 Week 7, 9 Week 9, 10 Week 10, 18 December 18).
   The bed in Room 214 is the hinge between sessions (Sleep). Notes: story/dev/notes/c01.md.

   Engine additions the bible relies on that the engine does not ship are built here, guarded to chapter 1:
     holdE (custom Wait + a ring drawn by a 'screen' hook), the bars walk and the stair trainer (custom Waits),
     the tether NPC (Hana walking backwards, Week 7), the wheelchair and bed poses (post-step pose override),
     movement limits with a stated reason, Dolores's night rounds (proximity on the side she faces),
     mirror reflections in the gym, Hana's reasons for locked drills in the Journal's Training tab. */
(function (S) {
  'use strict';

  const N = 1, P = S.places, SP = P.spots;
  const R = SP.stagnesRoom214, W2 = SP.stagnes2West, SG = SP.stagnesGym, SC = SP.stagnesCourtyard, REC = SP.stagnesRecords, LOB = SP.stagnesLobby;
  const flag = (G, k) => !!(G && G.flags && G.flags[k]);
  const fv = (G, k) => (G && G.flags ? G.flags[k] : undefined);
  const sess = (G) => +fv(G, 'c01_sess') || 1;
  const hasEv = (G, id) => !!(G && G.evidence && G.evidence[id]);
  const qs = (G, id) => (G && G.quests ? G.quests[id] : null);
  const step = (G) => { const q = qs(G, 'q1_main'); return q && q.state === 'active' ? q.step : (q && q.state === 'done' ? 99 : -1); };
  const isCh1 = () => !!(S.G && S.G.chapter === N);
  const auto = () => !!(S.director && (S.director.policy || (S.headless && S.director.autoHeadless)));
  const key = (a) => { try { return (S.input && S.input.labelFor && S.input.labelFor(a)) || '?'; } catch (_) { return '?'; } };

  // Main quest steps (q1_main). The bible's HUD texts, with a few in-between steps so every session has a target.
  const ST = { sit: 0, card: 1, bars: 2, rest: 3, dayroom: 4, call: 5, sleep4: 6, station: 7, sleep7: 8, stairs: 9, court: 10,
    upstairs: 11, thursday: 12, alone: 13, records: 14, whitlow: 15, things: 16, things2: 17, signout: 18, bus: 19 };

  const NOT_YET = "Not yet. Hana says the shoulder's held by two screws and good intentions.";
  const BED_X = R.jinBed;                 // 150
  const SLEEP_X = R.jinBed - 40;          // the pillow end of the bed
  const MIRROR = { x: SG.bars + SG.barsW + 34, y: 212, w: 34, h: 74 };   // a mirror panel at the end of the bars
  const DOOR_GYM_LOBBY = 75, LOBBY_GYM_DOOR = 490;
  const ALCOVES = [W2.r210, W2.r212, W2.r214, W2.r216];

  /* ════════════════════════════════════════════════════════════════════
     1. Session state: body, restrictions, the whiteboard
     ════════════════════════════════════════════════════════════════════ */
  const BOARD = {
    1: ['TODAY IS:', 'MON OCT 7', 'NURSE: DOLORES', 'THERAPIST: HANA'],
    1.5: ['TODAY IS:', 'WED OCT 9', 'NURSE: DOLORES', 'THERAPIST: HANA'],
    2: ['TODAY IS:', 'TUE OCT 15', 'GOAL: STAND', '30 SEC :)'],
    4: ['TODAY IS:', 'TUE OCT 29', 'GOAL: THE', 'DAY ROOM :)'],
    7: ['TODAY IS:', 'WED NOV 20', 'GOAL: WALK', 'TO STATION :)'],
    9: ['TODAY IS:', 'TUE DEC 3', 'GOAL: STAIRS', "DON'T SHOW OFF"],
    10: ['TODAY IS:', 'WED DEC 11', 'NURSE: DOLORES', 'THERAPIST: HANA'],
    10.5: ['TODAY IS:', 'THU DEC 12', 'NURSE: DOLORES', 'THERAPIST: HANA'],
    18: ['TODAY IS:', 'WED DEC 18', 'NURSE: DOLORES', 'THERAPIST: HANA'],
  };
  function boardKey(G) {
    const s = sess(G);
    if (s === 1) return flag(G, 'c01_pike1') ? 1.5 : 1;
    if (s === 10) return flag(G, 'c01_thursday') ? 10.5 : 10;
    return s;
  }
  const MONTH = (G) => (sess(G) <= 4 ? 'oct' : sess(G) <= 7 ? 'nov' : 'dec');
  const RESTRICT_BASE = { punch: false, dash: false, slip: false, flurry: false, guard: false };
  function bodyFor(s) {
    switch (s) {
      case 1: return { body: { look: 'jin_hospital', speedMul: 0.4, limp: 1, power: 0.3 }, run: false, jump: false };
      case 2: return { body: { look: 'jin_rehab', speedMul: 0.4, limp: 1, power: 0.3 }, run: false, jump: false };
      case 4: return { body: { look: 'jin_rehab', speedMul: 0.62, limp: 0, power: 0.3 }, run: false, jump: false };
      case 7: return { body: { look: 'jin_rehab', speedMul: 0.6, limp: 0.4, power: 0.4 }, run: false, jump: false };
      case 9: case 10: return { body: { look: 'jin_rehab', speedMul: 0.7, limp: 0.2, power: 0.45 }, run: true, jump: true };
      default: return { body: { look: 'jin_rehab', speedMul: 0.85, limp: 0, power: 0.5 }, run: true, jump: true };
    }
  }
  function applySession(A, s) {
    const b = bodyFor(s);
    A.body(b.body);
    const r = Object.assign({}, RESTRICT_BASE, { reasons: {} });
    for (const v of ['punch', 'dash', 'slip', 'flurry', 'guard']) r.reasons[v] = NOT_YET;
    if (!b.run) { r.run = false; r.reasons.run = s === 4 ? 'The chair goes one speed. Slow.' : 'Not yet. Walking is the whole job right now.'; }
    if (!b.jump) { r.jump = false; r.reasons.jump = s === 4 ? "Not in a wheelchair." : "My knees won't take a jump yet."; }
    A.restrict(r);
  }
  function* newSession(A, s, card, sub) {
    yield A.timeskip(card, sub);
    A.flag('c01_sess', s);
    applySession(A, s);
  }

  /* ════════════════════════════════════════════════════════════════════
     2. Custom waits: holdE, the bars walk, the stair trainer (input read raw; auto under a policy)
     ════════════════════════════════════════════════════════════════════ */
  const SCREEN = { glyph: null };
  function holdWait(o) {
    let t = 0, prog = 0;
    const w = { control: false, result: undefined,
      start() { SCREEN.glyph = { kind: 'hold', key: key('interact'), label: o.label || '', prog: 0 }; },
      wait(dt) {
        t += dt;
        const held = auto() ? t > 0.25 : !!(S.input && (S.input.rawHeld('interact') || S.input.down('interact')));
        prog = held ? Math.min(1, prog + dt / o.dur) : Math.max(0, prog - dt / (o.drain || o.dur * 0.5));
        if (SCREEN.glyph) SCREEN.glyph.prog = prog;
        if (o.failAt != null && prog >= o.failAt) { w.result = false; SCREEN.glyph = null; return true; }
        if (prog >= 1) { w.result = true; SCREEN.glyph = null; return true; }
        return false;
      } };
    return w;
  }
  // Alternate two keys (left/right on the bars, up/down on the stair trainer). Rushing (a press within `rush` s
  // of the last one, or the same key twice) makes Jin sag; `onStep(i)` runs after every good step.
  function alternateWait(o) {
    const keys = o.keys, need = o.steps || 6;
    let t = 0, last = -9, done = 0, want = 0, sagT = 0, autoT = 0;
    const w = { control: false, result: { sags: 0 },
      start() { SCREEN.glyph = { kind: 'alt', keys: keys.map(key), want: 0, label: o.label || '', done: 0, need }; },
      wait(dt) {
        t += dt;
        if (sagT > 0) { sagT -= dt; if (sagT <= 0 && o.onRecover) o.onRecover(); return false; }
        let pressed = null;
        if (auto()) { autoT += dt; if (autoT > 0.45) { autoT = 0; pressed = keys[want]; } }
        else for (const k of keys) if (S.input && S.input.rawPressed(k)) { pressed = k; S.input.consume(k); }
        if (!pressed) return false;
        const ok = pressed === keys[want] && t - last >= (o.rush || 0.3);
        last = t;
        if (!ok) { w.result.sags++; sagT = 0.9; if (o.onSag) o.onSag(w.result.sags); return false; }
        done++; want = 1 - want;
        if (SCREEN.glyph) { SCREEN.glyph.want = want; SCREEN.glyph.done = done; }
        if (o.onStep) o.onStep(done);
        if (done >= need) { SCREEN.glyph = null; return true; }
        return false;
      } };
    return w;
  }
  function drawGlyph(c) {
    const g = SCREEN.glyph;
    if (!g || !S.font) return;
    const cx = 320, cy = 300;
    c.save();
    c.globalAlpha = 0.92;
    c.fillStyle = 'rgba(10,12,16,0.72)';
    c.fillRect(cx - 90, cy - 22, 180, 40);
    if (g.kind === 'hold') {
      // A thin ring filling round the key.
      const r = 11, x = cx - 60, y = cy - 2;
      c.strokeStyle = '#4a5058'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#e8c272'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.prog); c.stroke();
      S.font.draw(c, String(g.key).toUpperCase(), x, y - 2, { color: '#f0e8d8', align: 'center' });
      S.font.draw(c, ('HOLD - ' + g.label).toUpperCase(), cx - 42, cy - 4, { color: '#e8e0d0' });
    } else {
      S.font.draw(c, g.label.toUpperCase(), cx, cy - 16, { color: '#e8c272', align: 'center' });
      for (let i = 0; i < 2; i++) {
        const x = cx - 34 + i * 68;
        c.fillStyle = i === g.want ? '#e8c272' : '#3a4048';
        c.fillRect(x - 16, cy - 6, 32, 14);
        S.font.draw(c, String(g.keys[i]).replace(/[←]/g, 'LEFT').replace(/[→]/g, 'RIGHT').replace(/[↑]/g, 'UP').replace(/[↓]/g, 'DOWN').toUpperCase(),
          x, cy - 2, { color: i === g.want ? '#1a1a1a' : '#c8c0b0', align: 'center' });
      }
      S.font.draw(c, g.done + ' / ' + g.need, cx, cy + 10, { color: '#a8a090', align: 'center' });
    }
    c.restore();
  }

  /* ════════════════════════════════════════════════════════════════════
     3. Per-step hook: limits, poses, the tether, Dolores's rounds, the flashlight
     ════════════════════════════════════════════════════════════════════ */
  const HK = { on: false, warnAt: -99, light: null, cone: null, caughtAt: -99 };
  function limitsFor(G, loc) {
    const s = sess(G);
    if (loc === 'stagnes_room214' && (s === 1 || (s === 2 && !flag(G, 'c01_w2_done'))))
      return { x0: BED_X - 1, x1: BED_X + 1, reason: s === 1 ? "My legs don't answer yet." : 'Not without the bars. Not yet.' };
    if (loc === 'stagnes_gym' && s === 2 && flag(G, 'c01_mirror_done')) return { x0: SG.bars + SG.barsW - 18, x1: SG.bars + SG.barsW + 6, reason: 'Not without the bars. Not yet.' };
    if (loc === 'stagnes_lobby' && !flag(G, 'c01_signed')) return { x0: 0, x1: LOB.glass - 18, reason: "Residents sign out at the desk. There's a form." };
    return null;
  }
  function jinPoseFor(G, loc) {
    const s = sess(G);
    if (loc === 'stagnes_room214' && s === 1) return flag(G, 'c01_satup') ? 'sit' : 'lieBed';
    if (loc === 'stagnes_room214' && s === 2 && !flag(G, 'c01_w2_done')) return 'lieBed';
    if (s === 4 && !flag(G, 'c01_standing')) return 'wheelchair';
    return null;
  }
  function post(dt) {
    if (!isCh1() || !S.world || !S.world.jin || !S.world.loc) return;
    const G = S.G, W = S.world, j = W.jin, loc = W.locId, busy = !!(S.director && S.director.busy);
    // Limits (with a reason when pushed against).
    // Scenes place Jin themselves: limits only bind while the player has control.
    const lim = busy ? null : limitsFor(G, loc);
    let tb = null;
    const hana = W.actor('hana');
    if (!busy && flag(G, 'c01_tether') && loc === 'stagnes_2west' && hana) tb = { x0: null, x1: hana.x - 30 };
    if (lim || tb) {
      // Limits are ranges for Jin's centre; world.collide clamps his edges, so widen by half his width.
      const hw = (+j.w || 14) / 2;
      const c0 = lim && lim.x0 != null ? lim.x0 : null, c1 = Math.min(lim && lim.x1 != null ? lim.x1 : 1e9, tb && tb.x1 != null ? tb.x1 : 1e9);
      j.bounds = { x0: c0 == null ? null : c0 - hw, x1: c1 + hw };
      if (!busy && lim && S.input) {
        const pushL = S.input.down('left') && c0 != null && j.x <= c0 + 1;
        const pushR = S.input.down('right') && j.x >= c1 - 1;
        if ((pushL || pushR) && S.time - HK.warnAt > 4 && !tb) { HK.warnAt = S.time; S.events.emit('toast', { text: lim.reason, kind: 'restrict' }); }
      }
    } else if (j.bounds && !(S.combat && S.combat.state && (S.combat.state.fight || S.combat.state.bout))) j.bounds = null;
    // Tether: Hana holds 40 px ahead, walking backwards, at her own pace.
    if (hana && flag(G, 'c01_tether') && loc === 'stagnes_2west' && !busy) {
      const want = j.x + 40;
      hana.face = -1;
      if (hana.x < want - 1) { hana.x = Math.min(want, hana.x + 34 * dt); hana.pose = 'backstep'; hana.basePose = 'idle'; }
      else hana.pose = 'idle';
    }
    // Poses the combat controller cannot choose (bed, wheelchair).
    const pz = jinPoseFor(G, loc);
    if (pz && !busy && !(S.activities && S.activities.running)) j.pose = pz;
    // Dolores's night rounds (Week 10, before the route is decided): her side, 70 px, unless Jin is in a doorway.
    const night = loc === 'stagnes_2west' && sess(G) === 10 && !fv(G, 'ch1_records_route');
    const dol = night ? W.actor('dolores') : null;
    if (dol && !busy) {
      const d = j.x - dol.x, hidden = ALCOVES.some((x) => Math.abs(j.x - x) < 12);
      if (Math.sign(d) === dol.face && Math.abs(d) < 70 && !hidden && S.time - HK.caughtAt > 3) {
        HK.caughtAt = S.time;
        if (S.director && S.director.run) S.director.run('c01_caught');
      }
    }
    // Her flashlight (a warm light that moves with her hand).
    if (Array.isArray(W.extraLights)) {
      if (dol) {
        if (!HK.light) { HK.light = { x: 0, y: 0, r: 46, color: '#f0dca0', k: 0.75 }; W.extraLights.push(HK.light); }
        HK.light.x = dol.x + dol.face * 26; HK.light.y = dol.y - 18;
      } else if (HK.light) { const i = W.extraLights.indexOf(HK.light); if (i >= 0) W.extraLights.splice(i, 1); HK.light = null; }
    }
    HK.cone = dol ? { x: dol.x + dol.face * 6, y: dol.y - 26, face: dol.face } : null;
    // Thursday in the records room: Hana keeps the flashlight on whatever Jin is reading.
    if (loc === 'stagnes_records' && hana && flag(G, 'c01_follow') && !flag(G, 'c01_records_done') && !busy) {
      const want = j.x - 22 * (j.face || 1), d = want - hana.x;
      if (Math.abs(d) > 4) { hana.x += Math.sign(d) * Math.min(Math.abs(d), 44 * dt); hana.face = Math.sign(d); hana.pose = 'walk'; }
      else { hana.face = j.x >= hana.x ? 1 : -1; hana.pose = 'idle'; }
    }
  }
  // Mirrors in the gym show Jin (scar side out) and, in the key scene, Hana behind him.
  const MIRRORS = [MIRROR, { x: SG.mirror, y: 150, w: 90, h: 90 }];
  function drawBack(c) {
    if (!isCh1() || !S.world || S.world.locId !== 'stagnes_gym' || !S.art || !S.art.drawFigure) return;
    const j = S.world.jin;
    if (!j) return;
    for (const m of MIRRORS) {
      if (Math.abs(j.x - m.x) > 70) continue;
      const x0 = m.x - m.w / 2, y0 = m.y;
      c.save();
      c.beginPath(); c.rect(x0, y0, m.w, m.h); c.clip();
      const k = 0.62, fy = y0 + m.h - 2;
      const rx = m.x + 4;   // stylised: the glass catches him three-quarter on, scar side out
      try {
        const h = S.world.actor('hana');
        if (h && flag(S.G, 'c01_mirror_hana')) S.art.drawFigure(c, rx - 13, fy - 3, 1, 'idle', S.time, h.look, { alpha: 0.42 });
        S.art.drawFigure(c, rx, fy, 1, j.pose === 'bars' ? 'idle' : (j.pose || 'idle'), j.poseT || 0, j.look, { alpha: k });
      } catch (_) { /* art missing: no reflection */ }
      c.fillStyle = 'rgba(90,104,120,0.25)'; c.fillRect(x0, y0, m.w, m.h);
      c.restore();
    }
  }
  function drawEmissive(c) {
    const cn = HK.cone;
    if (!isCh1() || !cn) return;
    c.save();
    const g = c.createLinearGradient ? c.createLinearGradient(cn.x, cn.y, cn.x + cn.face * 70, cn.y) : null;
    if (g) { g.addColorStop(0, 'rgba(240,220,160,0.32)'); g.addColorStop(1, 'rgba(240,220,160,0)'); c.fillStyle = g; } else c.fillStyle = 'rgba(240,220,160,0.18)';
    c.beginPath(); c.moveTo(cn.x, cn.y); c.lineTo(cn.x + cn.face * 70, cn.y - 14); c.lineTo(cn.x + cn.face * 70, cn.y + 26); c.closePath(); c.fill();
    c.restore();
  }
  function drawScreen(c) { if (isCh1()) drawGlyph(c); }
  if (S.world && typeof S.world.addDraw === 'function') {
    S.world.addDraw('back', drawBack);
    S.world.addDraw('emissive', drawEmissive);
    S.world.addDraw('screen', drawScreen);
  }
  function hookUp() {
    if (HK.on || !S.main || typeof S.main.onStep !== 'function') return;
    HK.on = true;
    S.main.onStep(post, true);
  }
  for (const e of ['chapterStart', 'resumed', 'enterLoc', 'open', 'loaded']) S.events.on(e, hookUp);
  // Leaving the chapter: no glyph or flashlight left behind.
  S.events.on('chapterStart', () => { SCREEN.glyph = null; HK.cone = null; });

  // Journal → Training: the drills Jin's body can't do yet say why, in Hana's words.
  const DRILL_WHY = {
    footwork: (G) => (sess(G) < 7 ? 'Tape marks when you can walk without the rail.' : null),
    conditioning: (G) => (sess(G) < 9 ? 'Laps when you can jog. Not before.' : null),
    balance: (G) => (sess(G) < 4 ? 'The bars are with me, on Tuesdays. Not on your own yet.' : null),
    reaction: (G) => (sess(G) < 4 ? 'The board is for when you can sit up straight for an hour.' : null),
    bag: () => 'No bags at St. Agnes. No punching. Two screws.',
    mitts: () => 'No mitts at St. Agnes. No punching. Two screws.',
  };
  if (S.activities && typeof S.activities.canTrain === 'function' && !S.activities.__c01wrapped) {
    const orig = S.activities.canTrain;
    S.activities.canTrain = function (k) {
      const r = orig.apply(this, arguments);
      try {
        if (r !== true && isCh1() && S.world && /^stagnes_/.test(S.world.locId || '')) {
          const fn = DRILL_WHY[String(k || '').replace(/^train_/, '')];
          const why = fn ? fn(S.G) : null;
          if (why) return why;
        }
      } catch (_) { /* keep the engine's reason */ }
      return r;
    };
    S.activities.__c01wrapped = true;
  }
  // Hana's exercise card: any drill passed at level 1 after she hands it over.
  S.events.on('activity', (d) => {
    if (!isCh1() || !d || d.phase !== 'end' || !d.result || !d.result.ok || !d.result.drill) return;
    const q = qs(S.G, 'q1_exercise_card');
    if (!q || q.state !== 'active' || flag(S.G, 'c01_card_drill')) return;
    S.G.flags.c01_card_drill = true;
    if (S.director && S.director.run) S.director.run('c01_card_done');
  });

  /* ════════════════════════════════════════════════════════════════════
     4. Looks used only here
     ════════════════════════════════════════════════════════════════════ */
  const TRANSPORT = { h: 47, build: 'avg', skin: '#c99a78', hair: { style: 'short', color: '#3a3028' },
    top: { kind: 'uniform', color: '#6a6e72', color2: '#8a8e92' }, bottom: { kind: 'slacks', color: '#4a4e52' }, shoes: '#1e1e22', extras: ['badge'] };
  const hanaLook = (G) => (sess(G) === 18 && flag(G, 'c01_signed') ? 'hana_coat' : 'hana_scrubs');

  /* ════════════════════════════════════════════════════════════════════
     5. Locations (functions of G: re-resolved on every entry)
     ════════════════════════════════════════════════════════════════════ */
  function room214(G) {
    const s = sess(G), night = (s === 2 && flag(G, 'c01_bars_done')) || (s === 10 && !flag(G, 'c01_thursday')) || (s === 10 && flag(G, 'c01_back_to_bed'));
    const earlHere = s !== 4 && !(s === 18 && flag(G, 'c01_earl_left'));
    const pm = s === 18 && flag(G, 'c01_pm');
    const npcs = [];
    if (earlHere) npcs.push(S.castNpc('earl', { x: R.earlBed, face: -1, pose: s === 18 ? 'work' : 'sit', talk: 'c01_earl', barkRadius: 60,
      idles: s === 18 ? ['work', 'idle', 'work'] : ['sit', 'think', 'sit'],
      barks: (g) => (sess(g) === 18 ? ["Florida. My daughter says it never snows. I'll believe it when I see it not."] :
        night ? ['(snoring, softly)'] : ['Seven letters. Don\'t tell me, I\'ll get it.', 'Steelhawks again. Every year.', 'Hand me the pencil, would you? Never mind.']),
      marker: (g) => (crosswordReady(g) ? '!' : (sess(g) === 18 && pm && !fv(g, 'ch1_fare_source') && flag(g, 'c01_radio') && !flag(g, 'c01_earl_fare_asked') ? '…' : null)) }));
    return P.stagnesRoom214({
      year: 1996, time: night ? 'night' : 'day', earl: false, iv: s === 1,
      board: BOARD[boardKey(G)] || BOARD[1],
      ambient: s === 18 && !pm ? { dark: 0.14, tint: '#4a5468' } : undefined,
      sound: night ? { loop: 'room', vol: 0.15 } : { loop: 'hum', vol: 0.2 },
      npcs,
      layers: {
        back: [
          { t: 'radio', x: R.jinTable - 4, y: 272, when: (g) => flag(g, 'c01_radio') },
          { t: 'boxes', x: R.earlBed + 40, n: 2, label: 'FLA', when: (g) => sess(g) === 18 },
        ],
      },
      objects: [
        { id: 'i1_namecard', x: R.nameCard - 12, label: 'Name above the bed', verb: 'Read', run: 'c01_namecard', when: (g) => !(sess(g) === 18 && flag(g, 'c01_changed')) },
        { id: 'i1_pikecard', x: R.jinBed + 16, label: 'Business card', verb: 'Take', run: 'c01_pikecard', when: (g) => flag(g, 'c01_pike1') && !hasEv(g, 'ev_pike_card') },
        { id: 'i1_candies', x: R.jinBed + 30, label: 'Butterscotch', verb: 'Look', run: 'c01_candies', when: (g) => flag(g, 'c01_pike1') },
        { id: 'c01_jug', x: R.jinTable, label: 'Side table', verb: 'Look',
          text: ['A plastic water jug. Nothing else.', 'No cards. No photos. Two years, and nobody left anything.'], when: (g) => sess(g) >= 4 },
        { id: 'i1_window', x: R.window, label: 'Window', verb: 'Look', run: 'c01_window', when: (g) => sess(g) >= 4 },
        { id: 'i1_earl_photo', x: R.earlTable - 18, label: 'Old photo', verb: 'Look',
          text: ['Calder Foundry Rigging Crew, 1971. Thirty men in hard hats.', "Earl's the one pretending not to smile."], when: (g) => sess(g) >= 4 },
        { id: 'c01_cards', x: R.earlBed + 26, label: 'Get-well cards', verb: 'Read', when: (g) => sess(g) >= 4,
          text: (g) => (sess(g) === 18 ? ['The yarn is bare. Earl packed the cards first.'] : ['Get-well cards on a string. GRANDPA in crayon. A Steelhawks pennant somebody cut down to fit.', 'Earl gets mail.']) },
        { id: 'i1_whiteboard', x: R.board, label: 'Whiteboard', verb: 'Read', run: 'c01_whiteboard', when: (g) => sess(g) >= 4 },
        { id: 'c01_closet', x: R.closet, label: 'Closet', verb: 'Open', run: 'c01_closet', when: (g) => sess(g) >= 4 && !(sess(g) === 18 && !flag(g, 'c01_changed')) },
        { id: 'c01_closet_change', x: R.closet, label: 'Closet — your things', verb: 'Change', run: 'c01_closet', when: (g) => sess(g) === 18 && !flag(g, 'c01_changed') },
        { id: 'c01_bed_edge', x: BED_X, label: 'Edge of the bed', verb: 'Sit', run: 'c01_bed_edge', when: (g) => sess(g) === 2 && flag(g, 'c01_bars_done') && !hasMem(g, 'mem_waistband') },
        { id: 'c01_sleep', x: SLEEP_X, label: 'Bed', verb: 'Sleep', run: 'c01_sleep', when: (g) => sleepReady(g) },
        { id: 'c01_take_card', x: R.nameCard - 12, label: 'Take the name card', verb: 'Take', run: 'c01_take_card',
          when: (g) => sess(g) === 18 && flag(g, 'c01_changed') && !flag(g, 'c01_name_card') },
      ],
      triggers: [
        { id: 'c01_trig_radio', x0: R.board - 80, x1: R.door, run: 'c01_radio_gift', when: (g) => sess(g) === 18 && flag(g, 'c01_pm') && !flag(g, 'c01_radio') },
      ],
      door: { r214_door: { locked: (g) => (sess(g) === 1 ? "My legs don't answer yet." : sess(g) === 2 ? 'Not without the bars. Not yet.' : false) } },
      points: { bed: { x: BED_X, y: 300 } },
    });
  }
  const hasMem = (G, id) => !!(G && G.memories && G.memories[id]);
  const nightUndecided = (G) => sess(G) === 10 && !fv(G, 'ch1_records_route') && !flag(G, 'c01_thursday');
  function sleepReady(G) {
    const s = sess(G), st = step(G);
    return (s === 4 && st === ST.sleep4) || (s === 7 && st === ST.sleep7) || (s === 9 && st === ST.thursday) ||
      (s === 10 && st === ST.thursday && !fv(G, 'ch1_records_route')) || (s === 10 && flag(G, 'c01_back_to_bed') && !flag(G, 'c01_morning'));
  }
  function crosswordReady(G) {
    const q = qs(G, 'q1_crossword'), s = sess(G), n = q ? (q.state === 'done' ? 3 : q.step | 0) : 0;
    if (q && q.state === 'done') return false;
    return (s === 2 && flag(G, 'c01_bars_done') && n === 0) || (s === 4 && n === 1) || (s === 7 && n === 2);
  }

  function west2(G) {
    const s = sess(G), night = s === 10 && !flag(G, 'c01_thursday') && !flag(G, 'c01_morning');
    const pm = flag(G, 'c01_pm');
    const npcs = night ? [] : [
      { id: 'dolores', look: S.castLook('dolores', N), name: 'Nurse Dolores', x: W2.dolores, face: -1, pose: 'write', talk: 'c01_dolores',
        idles: ['write', 'idle', 'write', 'drink'],
        barks: (g) => (sess(g) >= 10 && fv(g, 'ch1_records_route') ? ['Lights out at ten, Mr. Seo. Sorry. I\'ll get used to it.'] : ['Pills, then glory.', 'Peppermints are for everybody. Don\'t tell Sister.']),
        marker: (g) => (step(g) === ST.call ? '!' : null) },
      { id: 'knitter', talk: 'c01_knitter', barks: (g) => (sess(g) === 18 ? ['(She holds up a finished scarf. Red and gray. Very long.)'] : ['(She waves a knitting needle at you.)']) },
    ];
    if (night) npcs.push({ id: 'dolores', look: S.castLook('dolores', N), name: 'Nurse Dolores', x: W2.dolores - 10, face: -1, pose: 'idle',
      path: [{ x: W2.dolores - 10, wait: 7, pose: 'write' }, { x: W2.r216, wait: 2.5, pose: 'idle' }, { x: W2.r212, wait: 2.5, pose: 'idle' }, { x: W2.r210 - 30, wait: 2, pose: 'idle' }, { x: W2.rail0, wait: 0.5 }],
      loop: true, pathSpeed: 30, barks: ['(humming, low)'], when: (g) => !flag(g, 'c01_dolores_break') && !fv(g, 'ch1_records_route') });
    if (s === 4) npcs.push(S.castNpc('earl', { x: W2.puzzle + 46, face: -1, pose: 'wheelchair', talk: 'c01_earl',
      barks: ['Turn it up. No, down. Up.'], marker: (g) => (crosswordReady(g) ? '!' : null) }));
    if (s === 4 || s === 7 || s === 9) npcs.push(S.castNpc('whitlow', { x: W2.r212 + 30, face: 1, pose: 'idle', talk: 'c01_whitlow',
      path: [{ x: W2.r212 + 30, wait: 6, pose: 'write' }, { x: W2.r216 + 20, wait: 6, pose: 'write' }], loop: true, pathSpeed: 26,
      barks: (g) => (sess(g) >= 7 ? ['Morning, Mr. — ...morning.'] : ['Morning, Mr. Ahn.']) }));
    if (s === 18 && !pm) npcs.push(S.castNpc('whitlow', { x: W2.office - 26, face: -1, pose: 'idle', talk: 'c01_whitlow_office',
      marker: (g) => (step(g) === ST.whitlow ? '!' : null), barks: ['Mr. Seo. In here a minute.'] }));
    if (s === 9 && step(G) === ST.upstairs) {
      npcs.push(S.castNpc('sister_margaret', { x: W2.office + 6, face: -1, pose: 'write', barkRadius: 400 }));
      npcs.push(S.castNpc('hana', { look: 'hana', x: W2.office - 18, face: 1, pose: 'handsHips', barkRadius: 400 }));
    }
    const objects = [
      { id: 'c01_peppermints', x: W2.station - 34, label: 'Peppermints', verb: 'Take', text: (g) => (sess(g) >= 10 ? ['Dolores refilled the bowl. She always does.'] : ['A bowl of peppermints. Dolores refills it every morning.', 'I take one. It tastes like 1986.']) },
      { id: 'i1_sponsor_binder', x: W2.station + 22, label: 'Sponsor binder', verb: 'Read', run: 'c01_binder', when: (g) => sess(g) >= 4 && !(sess(g) === 10 && !flag(g, 'c01_thursday') && !flag(g, 'c01_morning')) },
      { id: 'i1_chart_rack', x: W2.charts + 6, label: 'Charts', verb: 'Look', run: 'c01_chart_rack', when: (g) => sess(g) >= 4 },
      { id: 'c01_bulletin', x: W2.board, label: 'Bulletin board', verb: 'Read', text: (g) => (sess(g) <= 4 ? ['BINGO THURSDAYS 2 PM · prizes from the jar!', 'Somebody drew a bingo ball with a face.'] :
        sess(g) <= 7 ? ['BINGO THURSDAYS 2 PM. A paper turkey, every feather a different patient\'s hand.', 'One feather says DANIEL. I don\'t remember tracing it.'] :
          ['BINGO THURSDAYS 2 PM. A snowflake chain now, sagging in the middle.', 'Thursday.']), when: (g) => sess(g) >= 4 },
      { id: 'i1_dayroom_tv', x: W2.tv, label: 'TV', verb: 'Watch', run: 'c01_tv', when: (g) => sess(g) >= 4 && flag(g, 'c01_tv_seen') && !(sess(g) === 10 && !flag(g, 'c01_morning')) },
      { id: 'c01_puzzle', x: W2.puzzle, label: 'Jigsaw puzzle', verb: 'Look', when: (g) => sess(g) >= 4,
        text: (g) => (sess(g) <= 4 ? ['A thousand-piece lighthouse. Half done. All the sky is missing.'] : sess(g) <= 9 ? ['The lighthouse has a sky now. Somebody worked nights.'] : ['Done. The lighthouse, the rocks, the sky. One piece missing, by the door.', 'Somebody will find it.']) },
      { id: 'i1_payphone', x: W2.payphone, label: 'Payphone', verb: 'Use', run: 'c01_payphone', when: (g) => sess(g) >= 4 && !(sess(g) === 10 && !flag(g, 'c01_morning')) },
      { id: 'c01_armchair', x: W2.chairs[0] + 20, label: 'Armchair', verb: 'Sit', pose: 'sit', face: -1, zoom: 0.85, when: (g) => sess(g) >= 7,
        text: (g) => (sess(g) >= 18 ? ['Snow on the sill. The day room smells like coffee and radiator dust.', 'I won\'t miss this chair. I\'ll remember it.'] : ['The armchair sighs when I sit. Same as me.', 'Two years in this building. I\'ve been awake for eight weeks of it.']) },
      { id: 'i1_jar', x: W2.jar, label: 'Bingo jar', verb: 'Look', run: 'c01_jar', when: (g) => sess(g) >= 4 && !(sess(g) === 10 && !flag(g, 'c01_morning')) },
      { id: 'c01_go_down', x: W2.basement, label: 'Basement door — propped open', verb: 'Go down now', run: 'c01_basement_door', when: (g) => nightUndecided(g) },
      { id: 'c01_rail', x: W2.rail0 + 24, label: 'Handrail', verb: 'Stand', run: 'c01_rail', when: (g) => sess(g) === 4 && !flag(g, 'c01_rail_done') },
    ];
    const triggers = [
      { id: 'c01_trig_tv', x0: W2.tv - 70, x1: W2.tv + 40, run: 'c01_tv_scene', when: (g) => sess(g) === 4 && step(g) === ST.dayroom },
      { id: 'c01_trig_tether', x0: W2.r214 + 60, x1: W2.rail0 + 40, run: 'c01_tether', when: (g) => sess(g) === 7 && step(g) === ST.station && !flag(g, 'c01_tether') },
      { id: 'c01_trig_pike7', x0: W2.station - 60, x1: W2.station + 20, run: 'c01_pike_station', when: (g) => sess(g) === 7 && step(g) === ST.station },
      { id: 'c01_trig_overheard', x0: W2.station, x1: W2.tv, run: 'c01_overheard', when: (g) => sess(g) === 9 && step(g) === ST.upstairs },
      { id: 'c01_trig_hop', x0: W2.stairs, x1: W2.stairs + 60, run: 'c01_hop', when: (g) => sess(g) === 9 && step(g) === ST.stairs },
      { id: 'c01_trig_memo', x0: W2.r214 + 120, x1: W2.station, run: 'c01_memo', when: (g) => sess(g) === 18 && !flag(g, 'c01_pm') && !flag(g, 'c01_memo') },
    ];
    const notNightRound = (g) => !(sess(g) === 10 && !flag(g, 'c01_thursday') && !flag(g, 'c01_morning'));
    return P.stagnes2West({
      year: 1996, time: night ? 'night' : 'day', month: MONTH(G),
      cast: night ? false : undefined,
      drop: ['w2_tv'],
      layers: {
        back: [
          { t: 'tv', id: 'c01_tv', x: W2.tv, y: 120, mount: true, on: !night, content: s === 4 && !flag(G, 'c01_tv_seen') ? 'boxing' : 'news' },
          { t: 'bucket', x: W2.basement + 14, when: () => night },
          { t: 'boxes', x: W2.jar - 6, n: 1, label: '$', when: (g) => !flag(g, 'c01_jar_taken') },
          { t: 'wheelchair', x: W2.r214 - 30, when: (g) => sess(g) === 18 && flag(g, 'c01_pm') },
        ],
      },
      npcs, objects, triggers,
      door: {
        w2_stairs: { locked: (g) => (sess(g) < 9 ? "Stairs are Week 9. Hana's rule." : (sess(g) === 10 && !flag(g, 'c01_morning') && !flag(g, 'c01_thursday')) ? "The gym's locked at night." : false) },
        w2_elevator: { locked: (g) => (sess(g) < 4 ? 'Not yet.' : !notNightRound(g) ? 'The elevator dings like a church bell. Not at night.' : false) },
        w2_basement: { run: 'c01_basement_door', to: null, locked: false, when: (g) => !nightUndecided(g) },
        w2_office: { run: 'places_noop', locked: (g) => (sess(g) === 18 && !flag(g, 'c01_pm') ? 'Dr. Whitlow is in the doorway. Talk to her.' : "Sister Margaret's office. The door is shut.") },
      },
    });
  }

  function gym(G) {
    const s = sess(G), pm = flag(G, 'c01_pm');
    const npcs = [];
    const hanaHere = (s === 4) || (s === 7 && flag(G, 'c01_pike7')) || (s === 9 && step(G) <= ST.stairs) || (s === 18 && pm && !flag(G, 'c01_voluntary'));
    if (hanaHere) npcs.push(S.castNpc('hana', { look: 'hana_scrubs', x: SG.desk + 26, face: -1, pose: s === 7 ? 'sit' : 'write', talk: 'c01_hana',
      idles: ['write', 'idle', 'write', 'armsCrossed'],
      barks: (g) => (sess(g) >= 9 ? ['Stairs today. Don\'t show off.', 'Heel, toe. Heel, toe.'] : ['Don\'t look at your feet, look at me.', 'Three more. Then you\'re allowed to hate me.']),
      marker: (g) => (s === 4 && !qs(g, 'q1_exercise_card') ? '!' : null) }));
    return P.stagnesGym({
      year: 1996, time: s === 18 ? 'dusk' : 'day', patients: s !== 2 && !(s === 10),
      npcs,
      layers: { back: [
        { t: 'mirror', x: MIRROR.x, y: MIRROR.y, w: MIRROR.w, h: MIRROR.h },
        { t: 'door', x: DOOR_GYM_LOBBY, kind: 'double', color: '#7a8478', label: '1F' },
        { t: 'chair', x: SG.desk + 26, kind: 'office', face: -1 },
      ] },
      training: {
        balance: { x: SG.bars + SG.barsW / 2, level: 1, when: (g) => sess(g) >= 4 },
        reaction: { x: SG.board, level: 1, coach: 'hana', when: (g) => sess(g) >= 4 },
        footwork: { x: SG.marks[2], level: 1, when: (g) => sess(g) >= 7 },
      },
      objects: [
        { id: 'i1_hana_mug', x: SG.desk - 14, label: 'Coffee mug', verb: 'Look', run: 'c01_mug' },
        { id: 'i1_beacon_brochure', x: SG.desk + 6, label: 'Brochure', verb: 'Read', run: 'c01_beacon', when: (g) => sess(g) === 18 },
        { id: 'c01_mat', x: SG.mats + 50, label: 'Mat', verb: 'Sit', pose: 'sitFloor', face: 1, zoom: 0.85, when: (g) => sess(g) >= 4,
          text: ['The mats smell like bleach and other people\'s effort.', 'Four long lights overhead, in a square. I know that square.'] },
        { id: 'c01_stairtrainer', x: SG.stepTrainer, label: 'Stair trainer', verb: 'Use', run: 'c01_stairtrainer', when: (g) => sess(g) === 9 && !flag(g, 'c01_trainer_done') },
        { id: 'c01_reaction_board', x: SG.board + 24, label: 'Reaction board', verb: 'Look', when: (g) => sess(g) >= 4,
          text: ['Plywood, four coloured bulbs, a switch box with taped labels. HANA\'S. DO NOT TOUCH. TOUCH IF HANA SAYS.', 'Training tab in the Journal, if I want it.'] },
        { id: 'c01_wheelchair2', x: SG.bars + SG.barsW + 2, label: 'Wheelchair', verb: 'Sit', run: 'c01_w2_chair', when: (g) => sess(g) === 2 && flag(g, 'c01_mirror_done') },
      ],
      doors: [
        { id: 'c01_gym_lobby', x: DOOR_GYM_LOBBY, label: 'Lobby (1F)', verb: 'Go', kind: 'door', to: 'stagnes_lobby', tx: LOBBY_GYM_DOOR - 26, face: -1,
          locked: (g) => (sess(g) === 2 ? 'Not without the bars. Not yet.' : sess(g) === 10 && !flag(g, 'c01_morning') ? 'Locked at night.' : false) },
      ],
      door: {
        sg_stairs: { locked: (g) => (sess(g) < 9 ? "Stairs are Week 9. Hana's rule." : false) },
        sg_courtyard: { locked: (g) => courtyardLock(g) },
      },
    });
  }
  function courtyardLock(G) {
    const s = sess(G);
    if (s === 2) return 'Not without the bars. Not yet.';
    if (s >= 9) return false;
    if (s === 7 && fv(G, 'ch1_pike_stance') === 'played_along') return false;
    return "The courtyard's by pass. The Fund signs the passes.";
  }

  function courtyard(G) {
    const s = sess(G);
    const npcs = [];
    if (s === 9 && step(G) === ST.court) npcs.push(S.castNpc('hana', { look: 'hana_scrubs', x: SC.lapA + 30, face: -1, pose: 'armsCrossed', talk: 'c01_laps',
      marker: () => '!', barks: ['Laps. Easy ones.'] }));
    return P.stagnesCourtyard({
      year: 1996, month: s >= 10 ? 'dec' : s >= 9 ? 'nov' : 'oct', time: 'overcast',
      weather: s === 18 ? 'snow' : s >= 10 ? null : 'leaves', weatherAmount: s === 18 ? 0.3 : undefined,
      npcs,
      training: { conditioning: { x: SC.lapA, level: 1, when: (g) => sess(g) >= 9 } },
      objects: [
        { id: 'c01_bench1', x: SC.bench1, label: 'Bench', verb: 'Sit', pose: 'sit', face: 1, zoom: 0.8,
          text: (g) => (sess(g) >= 10 ? ['Frost on the slats. My breath goes up and stays a second.', 'The tower down there has lights on every floor.'] : ['Leaves in the dry fountain. Somebody\'s grandfather on the other bench, asleep in a blanket.', 'Outside. It still counts.']) },
        { id: 'c01_maple', x: SC.maple, label: 'Maple', verb: 'Look',
          text: (g) => (sess(g) >= 10 ? ['Bare. Frost on every twig.', 'It was orange the day I woke up. It\'s the only clock in this building that doesn\'t lie.'] : sess(g) >= 9 ? ['Bare now. A few leaves hanging on out of spite.'] : ['Half the leaves gone. The other half deciding.']) },
        { id: 'c01_fountain', x: SC.fountain, label: 'Fountain', verb: 'Look', text: ['Dry. Full of leaves and one tennis ball.', 'Somebody played catch out here once.'] },
        { id: 'c01_fence', x: SC.fence + 40, label: 'Iron fence', verb: 'Look', text: ['Calder down the hill. The river. The Foundry stacks, cold.', 'And Ashgrove Tower, finished. It was a crane when I went down.'] },
      ],
      door: { sc_gym: { locked: false }, sc_lobby: { locked: (g) => (sess(g) < 4 ? 'Not yet.' : false) } },
    });
  }

  function records(G) {
    const route = fv(G, 'ch1_records_route'), alone = route === 'alone_at_night', night = alone && !flag(G, 'c01_morning');
    const npcs = [];
    if (route === 'with_hana' && !flag(G, 'c01_records_done')) npcs.push(S.castNpc('hana', { look: 'hana', x: REC.door + 40, face: 1, pose: 'idle', talk: 'c01_hana_records',
      barks: ['Q3, ninety-four. Bottom shelves.', 'I\'ve got the light. You\'ve got the eyes.'] }));
    return P.stagnesRecords({
      year: 1996, time: night ? 'night' : 'dusk',
      ambient: night ? { dark: 0.8, tint: '#141a1e' } : { dark: 0.5, tint: '#3a2a20' },
      lights: night ? [{ x: REC.door + 10, y: 230, r: 50, color: '#9ab0a0', k: 0.35 }].concat(flag(G, 'c01_bulb') ? [{ x: REC.fiche, y: 160, r: 120, color: '#f0d890', k: 0.85 }] : [])
        : [{ x: REC.window, y: 120, r: 160, color: '#e87a4a', k: 0.65, cone: { dir: 'down', width: 60 } }],
      npcs,
      objects: [
        { id: 'c01_shelf_a', x: REC.shelves[0] + 30, label: 'Archive boxes', verb: 'Search', text: ['ADMISSIONS 1992 Q1–Q4. 1993 Q1–Q4. Dust like felt.', 'Not these.'] },
        { id: 'c01_shelf_b', x: REC.shelves[1] - 10, label: 'Archive boxes', verb: 'Search', text: ['1995. DISCHARGES. DECEASED. Somebody wrote SORRY on a box lid in pencil.', 'Not these.'] },
        { id: 'i1_records_box', x: REC.box, label: 'ADMISSIONS 1994 Q3 — ORIGINALS', verb: 'Open', run: 'c01_box', when: (g) => !hasEv(g, 'ev_transfer_form') },
        { id: 'c01_pullchain', x: REC.fiche, label: 'Pull-chain bulb', verb: 'Pull', run: 'c01_bulb', when: () => night },
        { id: 'c01_fiche', x: REC.fiche + 24, label: 'Microfiche reader', verb: 'Look', text: ['A microfiche reader under a dust cover. Nobody reads fiche anymore. Nobody reads.'] },
        { id: 'c01_xerox', x: REC.xerox, label: 'Xerox machine', verb: 'Use', text: (g) => (fv(g, 'ch1_records_route') === 'with_hana' ? ['STAFF CODE. Hana knows the code.'] : ['STAFF CODE. Four digits. I don\'t have four digits.', 'Then I take the originals.']) },
        { id: 'i1_property_shelf', x: REC.property, label: 'Patient property', verb: 'Search', run: 'c01_property', when: (g) => hasEv(g, 'ev_intake_whiteout') && !hasEv(g, 'ev_property_tag') },
        { id: 'c01_boiler', x: REC.boiler, label: 'Boiler', verb: 'Look', text: ['The boiler knocks twice, like somebody wants in.', 'A pipe drips into a coffee can. Somebody empties it. Somebody always does.'] },
      ],
      door: { rec_door: { locked: (g) => (fv(g, 'ch1_records_route') ? false : 'Staff only. Hana has a reason to be down here. You don\'t, yet.') } },
    });
  }

  function lobby(G) {
    const s = sess(G), signed = flag(G, 'c01_signed');
    const npcs = [];
    if (s === 18 && flag(G, 'c01_pm') && !signed) {
      npcs.push(S.castNpc('pike', { x: LOB.desk + 50, face: -1, pose: 'idle', barkRadius: 0 }));
      npcs.push({ id: 'c01_transport', look: TRANSPORT, name: 'Transport man', x: LOB.desk + 82, face: -1, pose: 'armsCrossed' });
      npcs.push(S.castNpc('dolores', { x: LOB.desk - 14, face: 1, pose: 'write' }));
    }
    if (s === 18 && signed && !flag(G, 'c01_hana_out')) npcs.push(S.castNpc('hana', { look: 'hana_coat', x: LOB.glass + 36, face: -1, pose: 'idle', talk: 'c01_hana_doors', marker: () => '!' }));
    if (s !== 18) npcs.push({ id: 'c01_desk_clerk', look: 'receptionist', name: 'Front desk', x: LOB.desk + 14, face: 1, pose: 'write',
      barks: ['Visiting hours are on the sign, hon.', 'Sign-out forms are for discharges.'] });
    return P.stagnesLobby({
      year: 1996, month: s === 18 ? 'dec' : s <= 4 ? 'oct' : 'nov', time: 'overcast',
      weather: s === 18 ? 'snow' : undefined, weatherAmount: s === 18 ? 0.25 : undefined,
      npcs,
      layers: { back: [
        { t: 'door', x: LOBBY_GYM_DOOR, kind: 'double', color: '#7a8478', label: 'REHAB' },
        { t: 'car', x: LOB.shelter - 70, color: '#b8ae94', kind: 'van', face: -1, when: (g) => flag(g, 'c01_bus') },
        { t: 'window', x: 284, y: 92, w: 32, h: 40, lit: true, curtains: false, when: (g) => flag(g, 'c01_bus') },
      ] },
      objects: [
        { id: 'c01_visitor_binder', x: LOB.desk - 36, label: 'Visitor binder', verb: 'Read', run: 'c01_visitor_binder' },
        { id: 'i1_rights_brochure', x: LOB.rack, label: 'Brochure rack', verb: 'Read', run: 'c01_rights' },
        { id: 'i1_plaque', x: LOB.plaque, label: 'Donor plaque', verb: 'Read', run: 'c01_plaque' },
        { id: 'c01_front_doors', x: LOB.glass - 10, label: 'Front doors', verb: 'Open', run: 'c01_front_doors', when: (g) => !flag(g, 'c01_signed') },
        { id: 'c01_shelter', x: LOB.shelter, label: 'Route 14 shelter', verb: 'Wait', run: 'c01_bus', when: (g) => flag(g, 'c01_signed') },
        { id: 'c01_view', x: LOB.steps + 60, label: 'The steps', verb: 'Look', when: (g) => flag(g, 'c01_signed'),
          text: ['Calder below, blue in the haze. The river. The Civic\'s dome, a gray bump.', 'Somewhere past it, Kessler Avenue.'] },
      ],
      doors: [
        { id: 'c01_lobby_gym', x: LOBBY_GYM_DOOR, label: 'Rehabilitation gym', verb: 'Enter', kind: 'door', to: 'stagnes_gym', tx: DOOR_GYM_LOBBY + 26, face: 1 },
      ],
      triggers: [
        { id: 'c01_trig_ama', x0: LOB.desk + 80, x1: LOB.elevator - 20, run: 'c01_ama', when: (g) => sess(g) === 18 && step(g) === ST.signout && !flag(g, 'c01_signed') },
      ],
      door: { lob_courtyard: { locked: (g) => (sess(g) < 9 && !(sess(g) === 7 && fv(g, 'ch1_pike_stance') === 'played_along') ? "The courtyard's by pass. The Fund signs the passes." : false) } },
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     6. Scenes
     ════════════════════════════════════════════════════════════════════ */
  const scenes = {
    /* ── 1.1 Waking (Day 1) ─────────────────────────────────────────── */
    *c01_start(A, G) {
      A.flag('c01_sess', 1);
      applySession(A, 1);
      A.quest('q1_main', 'start', ST.sit);
      A.letterbox(true, 0);
      A.pose('jin', 'lieBed', { hold: true });
      A.face('jin', -1);
      yield A.cam({ x: BED_X + 6, y: 262, zoom: 1.6, dur: 0 });
      yield A.fade(1, 0, '#ffffff');
      A.fx('muffle', 0.85, 0);
      A.sound('bell', { vol: 0.35 });
      yield 0.6;
      A.ambience('hum', 0.2);
      yield A.fade(0, 2.6, '#ffffff');
      A.fx('muffle', 0, 1.2);
      A.sound('radio', { vol: 0.5 });
      yield A.say(null, '...Ashgrove Tower\'s ribbon-cutting drew the mayor and—', { name: 'Radio' });
      yield 0.6;
      A.sound('ui', { vol: 0.6 }); yield 0.5; A.sound('ui', { vol: 0.45 });
      yield 0.4;
      A.face('jin', 1);
      yield 1.0;
      // The camera eases out and climbs the wall to the name card.
      yield A.cam({ x: BED_X + 20, y: 230, zoom: 1.0, dur: 2.2 });
      yield A.cam({ x: R.nameCard, y: 176, zoom: 1.4, dur: 1.8 });
      yield 2.5;
      yield A.think("That's not my name.");
      yield 0.8;
      yield A.think('My name is Seo Jin.');
      yield 0.8;
      yield A.cam({ x: BED_X + 40, y: 120, zoom: 1.2, dur: 1.4 });
      yield A.think('Ceiling tiles. Thirty-seven. I counted yesterday too.');
      yield A.cam({ x: BED_X + 6, y: 262, zoom: 1.4, dur: 1.0 });
      // Sit up: hold the interact key. The first two tries fail.
      yield A.think("Up. Sit up.");
      for (let i = 0; i < 2; i++) {
        const ok = yield holdWait({ dur: 1.5, failAt: 0.35 + i * 0.2, label: 'Sit up' });
        if (ok) break;
        A.sound('step', { vol: 0.3 });
        A.shake(1, 0.15);
        yield A.think(i === 0 ? "My arms don't answer yet." : 'Again.');
      }
      yield holdWait({ dur: 1.5, label: 'Sit up' });
      A.flag('c01_satup');
      A.pose('jin', 'sit', { hold: true });
      A.sound('step', { vol: 0.4 });
      A.quest('q1_main', 'step', ST.card);
      yield A.cam({ x: R.board - 20, y: 170, zoom: 1.2, dur: 1.6 });
      yield A.think('October.');
      yield 0.8;
      yield A.think('The calendar card in the corner says 1996.');
      yield A.think('Nineteen ninety-six.');
      yield 1.5;
      yield A.think('Two years.');
      yield A.cam({ x: 400, y: 220, zoom: 1.0, dur: 1.2 });
      A.spawn(S.castNpc('dolores', { x: R.door - 6, face: -1, pose: 'idle' }));
      yield A.say('dolores', "Daniel? Oh my God. Okay. Okay. Don't move. Dr. Whitlow!");
      A.walk('dolores', 660, { run: true });
      yield 0.6;
      A.remove('dolores');
      yield A.say('earl', "Two years I've had a roommate who doesn't snore. Figures you'd wake up the week the Steelhawks blow the season.");
      yield A.say('jin', 'Jin.');
      yield 0.6;
      yield A.say('jin', "My name's Jin.");
      A.spawn(S.castNpc('dolores', { x: R.door - 20, face: -1, pose: 'write' }));
      yield A.say('dolores', "Mm-hm. We'll tell the doctor you're talking. That's wonderful.");
      A.meet('earl', 'c01_met'); A.meet('dolores', 'c01_met');
      yield 0.8;
      A.remove('dolores');
      yield* scenes.c01_pike1(A, G);
    },

    /* ── 1.2 Pike's first visit (same session, after a short white fade) ── */
    *c01_pike1(A, G) {
      yield A.fade(1, 0.5, '#ffffff');
      A.flag('c01_pike1');
      yield A.goto('stagnes_room214', BED_X, { face: 1, fade: false });
      A.pose('jin', 'sit', { hold: true });
      A.spawn(S.castNpc('pike', { x: BED_X + 52, face: -1, pose: 'sit' }));
      A.letterbox(true, 0.4);
      yield A.cam({ x: BED_X + 40, y: 236, zoom: 1.25, dur: 0 });
      yield A.fade(0, 0.6, '#ffffff');
      yield 0.5;
      yield A.say('pike', "Daniel. Gerald Pike, Calder Foundry Relief Fund. We've been looking after you since your accident. You're a lucky man.");
      A.sound('paper', { vol: 0.5 });
      yield A.say(null, 'He sets a butterscotch on the tray. His card beside it.');
      yield A.say('jin', 'What accident?');
      yield A.say('pike', "Salvage work at the old Foundry. A beam came down. August of '94. You don't have to remember. Most men don't.");
      yield A.say('jin', 'Jin.');
      yield A.say('jin', 'Seo Jin.');
      yield A.say('jin', "I'm a boxer. I fought at the Civic.");
      A.pose('pike', 'think');
      yield 0.8;
      yield A.say('pike', 'Confusion is very normal after an injury like yours, Daniel. The brain fills gaps with stories. Boxing is a very common story. Young men see it on television.');
      A.pose('pike', 'idle');
      yield A.say('pike', "Questions about boxing will only upset you. Let's not make your recovery harder than it needs to be.");
      A.spawn(S.castNpc('dolores', { x: R.door - 10, face: -1, pose: 'idle' }));
      yield A.walk('pike', R.door - 40, { face: 1 });
      yield A.cam({ x: R.door - 60, y: 236, zoom: 1.1, dur: 0.8 });
      yield A.say('pike', "No outside calls until the Fund's physician clears it. It's in the binder. For his own good.");
      A.face('pike', -1);
      yield A.say('pike', "We're paying for all of this, Daniel. The least we can do is get well quietly.");
      A.walk('pike', 660);
      A.walk('dolores', 660);
      yield 0.9;
      A.remove('pike'); A.remove('dolores');
      A.sound('radio', { vol: 0.4 });
      yield A.cam({ x: 320, y: 220, zoom: 1.0, dur: 1.0 });
      yield A.say('earl', "That fella's been here every month for two years. Never once took his coat off. Never once asked how you slept.");
      A.meet('pike', 'c01_met');
      A.letterbox(false, 0.4);
      yield A.think("The card above the bed. I want to read it again. Up close.");
    },

    *c01_namecard(A, G) {
      if (sess(G) === 18 && flag(G, 'c01_changed')) { yield* scenes.c01_take_card(A, G); return; }
      A.sound('paper', { vol: 0.4 });
      yield A.cam({ x: R.nameCard, y: 176, zoom: 1.4, dur: 0.6 });
      yield A.doc({ id: 'ev_name_card', title: 'The name above the bed', kind: 'record', pages: ['AHN, DANIEL\nDOB 03/14/68\nADM 08/22/94\nDR. WHITLOW\nFUNDING: CFRF'] });
      const first = !hasEv(G, 'ev_name_card');
      A.evidence('ev_name_card');
      if (first) {
        yield A.think("That's my birthday.");
        yield 0.8;
        yield A.think("That's not my name.");
      } else yield A.think(sess(G) >= 10 ? 'AHN, DANIEL. Somebody typed it. Somebody slid it in the sleeve. Somebody.' : 'AHN, DANIEL. Still there.');
      if (first && sess(G) === 1) yield* scenes.c01_day1_end(A, G);
    },
    *c01_day1_end(A, G) {
      yield 1.0;
      yield A.think('Two years. A name that isn\'t mine. A man who pays for the bed.');
      yield A.think('Fine. Then I get up. Then I walk. Then I ask.');
      yield* newSession(A, 2, 'Week 2', 'Rehabilitation gym · Tuesday, October 15');
      A.quest('q1_main', 'step', ST.bars);
      yield* scenes.c01_week2(A, G);
    },
    *c01_pikecard(A, G) {
      A.sound('pickup', { vol: 0.5 });
      yield A.doc('ev_pike_card');
      A.evidence('ev_pike_card');
      A.meet('pike', 'c01_card');
      yield A.think('I never worked a day at the Foundry.');
    },
    *c01_candies(A, G) {
      const n = sess(G) <= 2 ? 1 : sess(G) <= 4 ? 2 : sess(G) <= 9 ? 3 : 4;
      yield A.think(n === 1 ? 'One butterscotch on the tray.' : (['', 'One', 'Two', 'Three', 'Four'][n] + ' butterscotches on the tray. One a visit.'));
      yield A.think("He leaves one every time. Like I'm a grave.");
    },
    *c01_window(A, G) {
      const s = sess(G);
      yield A.cam({ x: R.window, y: 150, zoom: 1.3, dur: 0.7 });
      if (s >= 18) yield A.think('Frost. Two Decembers gone.');
      else if (s >= 10) yield A.think('The maple is bare. Frost on the courtyard path. The tower lit on every floor.');
      else if (s >= 7) yield A.think('Rain on the glass. The maple is half bare. The river runs past the dead stacks like nothing happened.');
      else yield A.think("Calder. That tower wasn't finished.");
    },
    *c01_whiteboard(A, G) {
      const lines = BOARD[boardKey(G)] || BOARD[1];
      yield A.think(lines.join(' · ') + (sess(G) === 2 ? ' Hana drew the smiley.' : ''));
    },
    *c01_closet(A, G) {
      if (sess(G) !== 18) { yield A.think('Two gowns. A pair of sweatpants. Hospital slippers. Nothing of mine.'); return; }
      if (flag(G, 'c01_changed')) { yield A.think('Empty hangers. The gown on the hook, folded like I was never in it.'); return; }
      A.sound('paper', { vol: 0.4 });
      yield A.fade(1, 0.4);
      A.body({ look: 'jin_street' });
      A.flag('c01_changed');
      A.quest('q1_main', 'step', ST.things2);
      A.sound('door', { vol: 0.3 });
      yield A.fade(0, 0.4);
      yield A.cam({ x: R.closet - 10, y: 250, zoom: 1.35, dur: 0.6 });
      yield A.think("Track top's loose in the shoulders. Still mine.");
      yield A.think('The name card. Then I go.');
    },
    *c01_take_card(A, G) {
      if (flag(G, 'c01_name_card')) return;
      yield A.walk('jin', R.nameCard + 4, { face: -1 });
      A.pose('jin', 'reach', { hold: 1.2 });
      A.sound('paper', { vol: 0.5 });
      yield 0.6;
      A.flag('c01_name_card');
      yield A.think('AHN, DANIEL. It slides out of the sleeve like it was never stuck.');
      yield A.cam({ x: R.nameCard, y: 180, zoom: 1.3, dur: 0.8 });
      yield 2.0;
      A.quest('q1_main', 'step', ST.signout);
      yield A.cam({ x: 320, y: 220, zoom: 1.0, dur: 0.8 });
      yield A.think('Front desk. The 14 goes past the shelter every forty minutes. It costs a dollar.');
      if (!fv(G, 'ch1_fare_source')) {
        yield A.think('I have nothing. Not a dollar.');
        // While he decides, the autopilot looks at the jar (the policy then takes it or leaves it).
        yield A.waitFor((g) => !!fv(g, 'ch1_fare_source') || flag(g, 'c01_jar_seen') || (S.world && S.world.locId === 'stagnes_lobby'),
          { autoplay: { loc: 'stagnes_2west', interact: 'i1_jar' } });
      }
    },

    /* ── 1.3 Week 2: the bars and the mirror ───────────────────────── */
    *c01_week2(A, G) {
      yield A.goto('stagnes_gym', SG.door + 40, { face: 1, fade: false });
      A.letterbox(true, 0);
      // Match cut: the ring lamps of the last image are the gym's four tubes.
      yield A.cam({ x: 520, y: 60, zoom: 1.5, dur: 0 });
      yield A.fade(0, 1.0);
      A.sound('buzz', { vol: 0.3 });
      yield 1.2;
      yield A.cam({ x: 200, y: 230, zoom: 1.0, dur: 2.0 });
      A.spawn(S.castNpc('hana', { look: 'hana_scrubs', x: SG.door + 14, face: 1, pose: 'push' }));
      A.pose('jin', 'wheelchair', { hold: true });
      A.walk('hana', SG.bars - 26, { speed: 34, pose: 'push' });
      yield A.walk('jin', SG.bars - 6, { speed: 34, pose: 'wheelchair' });
      A.pose('jin', 'wheelchair', { hold: true });
      A.pose('hana', 'kneel');
      A.face('hana', 1);
      yield A.cam({ x: SG.bars - 14, y: 250, zoom: 1.3, dur: 0.8 });
      yield A.say('hana', "Daniel Ahn, thirty-one, foundry. Hi. I'm Hana. I've been moving your arms and legs for nine months while you weren't here. Now you get to help.");
      yield A.say('jin', 'My name is Jin Seo.');
      yield A.say('hana', "Your chart says Daniel, so for now you're Daniel. Records are how we keep people safe.");
      A.meet('hana', 'c01_met');
      A.pose('hana', 'idle');
      yield A.say('hana', 'Stand. Hands on the bars. Hold it steady for me. Left and right keep you in the middle.');
      A.letterbox(false, 0.4);
      A.pose('jin', 'bars', { hold: true });
      yield A.activity('train_balance', { level: 1, x: SG.bars + 12, title: 'Parallel bars', tries: 3, quiet: true });
      A.pose('jin', 'bars', { hold: true });
      yield A.say('hana', 'Good. Now walk them. Left foot, right foot. Slow is smooth.');
      A.walk('hana', SG.bars + 2, { speed: 30 });
      // Halfway: the relationship-only choice.
      const v = yield A.choice('Halfway down the bars. Her hands hover at your belt.', [
        { text: 'Tell her about the fight.', value: 'told', policy: 'restraint', autoplay: true, record: 'Told Hana about the fight on the bars.' },
        { text: 'Say nothing.', value: 'quiet', policy: 'ruthless', record: 'Said nothing to Hana on the bars.' },
      ], { who: 'hana', id: 'c01_bars' });
      if (v === 'told') {
        A.flag('ch1_told_hana_boxing', true);
        A.rel('hana', 1);
        yield A.say('jin', "I'm a boxer. Was. I fought Ray Castell for the title.");
        A.pose('hana', 'write', { hold: 2 });
        yield A.say('hana', "Okay. I'm writing that you said so. That's what I can do today.");
        yield A.think('Her own notebook. Not the chart.');
        A.meet('hana', 'c01_notebook');
      } else {
        A.flag('ch1_told_hana_boxing', false);
        yield A.think('Let her watch me move for a few weeks. Then she can decide.');
      }
      // The walk: alternate left and right, at a steady rhythm.
      const x0 = SG.bars + 12, x1 = SG.bars + SG.barsW - 8;
      A.pose('jin', 'bars', { hold: true });
      yield alternateWait({ keys: ['left', 'right'], steps: 6, rush: 0.32, label: 'The bars: left, right',
        onStep: (n) => { const j = S.world && S.world.jin; if (j) { j.x = x0 + (x1 - x0) * n / 6; j.face = 1; } const h = S.world && S.world.actor('hana'); if (h) h.x = (j ? j.x : x0) - 12; },
        onSag: (n) => { const j = S.world && S.world.jin; if (j) { j.scriptPose = 'crouch'; j.pose = 'crouch'; } const h = S.world && S.world.actor('hana'); if (h) { h.pose = 'reach'; }
          if (S.world && S.world.bark) S.world.bark('hana', n === 1 ? "Slow is smooth. Your left foot is lying to you. Don't believe it." : 'Got you. Again. Slower.', 2.4); },
        onRecover: () => { const j = S.world && S.world.jin; if (j) { j.scriptPose = 'bars'; j.pose = 'bars'; } const h = S.world && S.world.actor('hana'); if (h) h.pose = 'idle'; } });
      A.flag('c01_bars_done');
      // The mirror: the end of the bars faces it.
      A.pose('jin', 'idle', { hold: true });
      A.face('jin', 1);
      A.ambience('hum', 0.35);
      A.flag('c01_mirror_hana');
      A.letterbox(true, 0.6);
      yield A.cam({ x: MIRROR.x, y: MIRROR.y + 36, zoom: 1.35, dur: 5.0 });
      yield 1.0;
      A.place('hana', MIRROR.x - 40);
      A.face('hana', 1);
      yield 1.2;
      A.sound('paper', { vol: 0.25 });
      yield 1.8;
      A.flag('c01_mirror_hana', false);
      A.walk('hana', SG.bars - 30, { speed: 30 });
      yield 3.0;
      yield A.say('hana', "That's enough for today.");
      A.flag('c01_mirror_done');
      A.remove('hana');
      A.letterbox(false, 0.6);
      yield A.cam({ x: SG.bars + 60, y: 230, zoom: 0.9, dur: 1.6 });
      A.ambience('hum', 0.2);
      yield A.think('Thin shoulders. Hair over my ears. That mark on my cheek.');
      yield A.think('The chair is right there.');
    },
    *c01_w2_chair(A, G) {
      A.pose('jin', 'wheelchair', { hold: true });
      yield A.cam({ x: SG.bars + 60, y: 220, zoom: 0.85, dur: 1.2 });
      yield A.think('Six steps. Two years, and I walked six steps.');
      yield A.fade(1, 0.8);
      A.flag('c01_w2_night');
      A.quest('q1_main', 'step', ST.rest);
      yield A.goto('stagnes_room214', BED_X, { face: 1, fade: false });
      A.pose('jin', 'lieBed', { hold: true });
      yield A.fade(0, 1.0);
      yield A.think("Night. Earl's radio dial glowing. The hall light under the door.");
      yield A.think('The edge of the bed. I can sit on the edge of the bed by myself now.');
    },
    *c01_bed_edge(A, G) {
      A.pose('jin', 'sit', { hold: true });
      A.sound('step', { vol: 0.3 });
      yield A.cam({ x: BED_X + 20, y: 250, zoom: 1.2, dur: 1.0 });
      yield 1.0;
      // mem_waistband: two seconds of Umma's hands.
      A.fx('sepia', 0.8, 0.5); A.fx('vignette', 0.6, 0.5);
      yield A.cam({ x: BED_X + 10, y: 258, zoom: 1.45, dur: 0.6 });
      yield A.say('umma', 'Ya. Hold still.', { name: 'Umma' });
      yield A.say(null, 'The blue trunks across her knees. The needle. The thread, bitten off with her teeth.');
      A.fx('sepia', 0, 0.6); A.fx('vignette', 0.25, 0.6);
      A.memory('mem_waistband');
      yield 0.8;
      yield A.think('Gone.');
      yield A.cam({ x: 320, y: 220, zoom: 1.0, dur: 1.0 });
      A.flag('c01_w2_done');
      if (crosswordReady(G)) {
        yield A.say('earl', "You awake? Good. Seven letters. Don't tell me, I'll get it.");
        yield* scenes.c01_crossword(A, G);
      }
      yield A.think('Sleep. Then whatever comes.');
      yield* scenes.c01_to_week4(A, G);
    },

    /* ── 1.4 Week 4: the day room and the public lie ───────────────── */
    *c01_to_week4(A, G) {
      yield* newSession(A, 4, 'Week 4', 'Room 214 · Tuesday, October 29');
      A.quest('q1_main', 'step', ST.dayroom);
      yield A.goto('stagnes_room214', BED_X + 40, { face: 1, fade: false });
      A.spawn(S.castNpc('hana', { look: 'hana', x: R.board - 30, face: -1, pose: 'idle' }));
      yield A.fade(0, 0.8);
      yield A.say('hana', 'Your chair. It goes one speed: yours. The day room is at the end of the hall. Go see what the rest of the floor looks like.');
      yield A.say('hana', "And this. Home exercises. It's not a plan, it's homework.");
      A.sound('paper', { vol: 0.5 });
      yield A.doc({ id: 'c01_exercise_card', title: "Hana's home exercise card", kind: 'document', pages: [
        'HOME EXERCISE CARD — AHN, D. (214)\n\nBALANCE — the bars, with me or Dolores. Level 1.\nREACTION — the bulb board, seated. Level 1.\n\nFOOTWORK — tape marks when you can walk without the rail.\nCONDITIONING — laps when you can jog. Not before.\n\nNo bags. No punching. Two screws.\n— H.L.',
      ] });
      A.quest('q1_exercise_card', 'start');
      S.events.emit('toast', { text: 'Training unlocked. Optional. It improves control of the body you have. (Journal: Training)', kind: 'hint' });
      A.walk('hana', 660);
      yield 0.8;
      A.remove('hana');
    },
    *c01_rail(A, G) {
      A.flag('c01_standing');
      A.pose('jin', 'reach', { hold: true });
      yield A.think('The rail. GOAL: STAND 30 SEC, the board says. Hana\'s smiley.');
      const ok = yield holdWait({ dur: 3.0, label: 'Stand at the rail', drain: 1.2 });
      A.pose('jin', 'idle', { hold: 1.5 });
      yield 1.0;
      A.flag('c01_rail_done');
      A.flag('c01_standing', false);
      A.pose('jin', null);
      yield A.think(ok ? 'Standing. My legs shake like a cheap card table. Standing.' : 'Down again. Next week.');
    },
    *c01_tv_scene(A, G) {
      A.letterbox(true, 0.5);
      yield A.walk('jin', W2.tv - 30, { speed: 30, pose: 'wheelchair', face: 1 });
      A.pose('jin', 'wheelchair', { hold: true });
      yield A.cam({ x: W2.tv - 10, y: 170, zoom: 1.15, dur: 1.2 });
      A.sound('tvStatic', { vol: 0.3 });
      yield A.say(null, 'Calder Sports Weekly. Ray Castell hitting pads, heavier than I remember.', { name: 'Channel 6' });
      yield A.say(null, "...Castell's title came, of course, at the expense of Eastgate's Jin Seo, who, you'll remember, checked himself out of Calder General against medical advice two days after that knockout, and hasn't been seen since.", { name: 'Anchor' });
      yield A.say('earl', 'Never trusted that Korean kid. Took the money and ran, I bet.');
      A.fx('muffle', 0.5, 1.5);
      yield A.cam({ x: S.world.jin.x, y: 260, zoom: 1.3, dur: 2.5 });
      yield 0.6;
      yield A.cam({ x: S.world.jin.x + 4, y: 284, zoom: 1.5, dur: 0.4 });
      A.sound('block', { vol: 0.5, rate: 0.6 });
      A.shake(0.5, 0.15);
      yield 1.2;
      A.spawn(S.castNpc('hana', { look: 'hana', x: W2.board + 10, face: 1, pose: 'idle' }));
      yield A.cam({ x: W2.tv - 60, y: 240, zoom: 1.1, dur: 1.0 });
      yield 2.0;
      A.fx('muffle', 0, 1.0);
      yield A.think("Checked himself out. Against medical advice.");
      yield A.think("I was in a bed, two miles up a hill, under somebody else's name.");
      A.walk('hana', W2.office + 40);
      yield 1.0;
      A.remove('hana');
      A.flag('c01_tv_seen');
      A.letterbox(false, 0.5);
      A.quest('q1_main', 'step', ST.call);
      yield A.think('Home. I want to call home.');
    },
    *c01_tv(A, G) {
      if (sess(G) === 4 && step(G) === ST.dayroom) { yield* scenes.c01_tv_scene(A, G); return; }
      yield A.think(sess(G) >= 10 ? 'A game show. A woman wins a dinette set and cries.' : 'Champion. Three defenses. I was supposed to be in that sentence.');
    },
    *c01_call_home(A, G) {
      yield A.say('jin', 'I need to call home. My mother. Mi-ok Seo, 412 Kessler.');
      A.pose('dolores', 'idle');
      yield A.say('dolores', "Your Fund says calls go through them, honey. It's in the binder. I'm sorry. I'm really sorry.");
      A.spawn(S.castNpc('hana', { look: 'hana', x: W2.station - 90, face: 1, pose: 'idle' }));
      A.walk('hana', W2.station - 40);
      yield 0.8;
      yield A.say('hana', "I'll ask Mr. Pike.");
      A.walk('hana', W2.r212);
      yield 0.8;
      A.remove('hana');
      A.meet('dolores', 'c01_calls');
      A.quest('q1_main', 'step', ST.sleep4);
      if (!qs(G, 'q1_calls')) {
        A.quest('q1_calls', 'start');
        yield A.think('There is a payphone in the day room. PATIENT CALLS 7–9 PM.');
      }
      yield A.think('The binder says my life goes through the Fund. Fine. Then I find out where the Fund goes.');
    },

    /* ── 1.5 Week 7: the contradiction and the letter ──────────────── */
    *c01_to_week7(A, G) {
      yield* newSession(A, 7, 'Week 7', '2 West · Wednesday, November 20');
      // Earlier that week: the outgoing tray.
      yield A.goto('stagnes_2west', W2.station - 20, { face: 1, fade: false });
      A.letterbox(true, 0);
      yield A.cam({ x: W2.station + 10, y: 250, zoom: 1.5, dur: 0 });
      yield A.fade(0, 0.6);
      A.sound('paper', { vol: 0.4 });
      yield A.say(null, 'Monday. The outgoing tray at the nurses\' station. On top, an envelope on St. Agnes letterhead: MRS. SEO, 412 KESSLER AVE, APT 3B. The hand is Hana\'s.');
      yield 1.0;
      yield A.fade(1, 0.6);
      A.quest('q1_main', 'step', ST.station);
      yield A.goto('stagnes_room214', BED_X + 60, { face: 1, fade: false });
      A.letterbox(false, 0);
      yield A.fade(0, 0.8);
      yield A.think('No chair today. Walk to the station. My idle lists right. I keep a hand near the wall.');
      if (crosswordReady(G)) yield A.say('earl', "Hey. Before you go out there. Four letters. I'm stuck.");
    },
    *c01_tether(A, G) {
      A.spawn(S.castNpc('hana', { look: 'hana_scrubs', x: S.world.jin.x + 44, face: -1, pose: 'idle' }));
      yield A.say('hana', "Off the rail. Don't look at your feet, look at me.");
      A.flag('c01_tether');
      S.events.emit('toast', { text: 'Hana walks backwards ahead of you. Keep up with her, not ahead.', kind: 'hint' });
    },
    *c01_pike_station(A, G) {
      if (!flag(G, 'c01_tether')) yield* scenes.c01_tether(A, G);
      A.flag('c01_tether', false);
      A.flag('c01_walked');
      A.letterbox(true, 0.5);
      A.pose('dolores', 'cheer', { hold: 1.2 });
      A.sound('step', { vol: 0.3 });
      yield A.say(null, 'Dolores claps once, quietly.');
      A.spawn(S.castNpc('pike', { x: W2.station + 50, face: -1, pose: 'write' }));
      A.walk('hana', W2.station - 70);
      yield A.walk('jin', W2.station - 30, { face: 1 });
      A.face('hana', 1);
      yield A.cam({ x: W2.station + 20, y: 250, zoom: 1.2, dur: 0.8 });
      A.sound('paper', { vol: 0.4 });
      yield A.say(null, 'Pike, signing the visitor binder. He opens his briefcase for "the Fund\'s paperwork".');
      yield A.cam({ x: W2.station + 50, y: 276, zoom: 1.5, dur: 0.3 });
      yield 1.0;
      yield A.think("St. Agnes letterhead. Mrs. Seo, 412 Kessler. In his briefcase.");
      yield A.cam({ x: W2.station, y: 250, zoom: 1.2, dur: 0.3 });
      A.pose('hana', 'headDown', { hold: 1.5 });
      yield 0.8;
      A.pose('pike', 'idle');
      yield A.say('pike', "Daniel. You look wonderful. Ms. Lim, you're working miracles. Let's start simply, shall we? Tell me your name.");
      yield A.say('jin', 'I fought Ray Castell for the title. August twentieth. At the Civic.');
      yield A.say('pike', "Daniel, you worked the pour floor at Calder Foundry for nine years. It's in the file Ms. Lim typed.");
      A.pose('hana', 'write');
      yield A.say('hana', "Calder Foundry closed in March of '92.");
      yield 1.5;
      yield A.say('pike', 'Salvage, Ms. Lim. A salvage crew. The paperwork around that bankruptcy was extensive.');
      yield A.cam({ x: W2.station - 20, y: 248, zoom: 1.25, dur: 0.6 });
      A.pose('hana', 'idle');
      yield A.say('hana', "My father got his last check from Calder Foundry in March of '92. They gave him a mug.");
      yield A.say('hana', "Nobody was salvaging anything in August '94. The gates were chained.");
      yield 0.8;
      yield A.say('pike', 'Your name, Daniel.');
      const v = yield A.choice('Your name, Daniel.', [
        { text: '"...Daniel."', value: 'played_along', policy: 'ruthless', record: 'Told Pike his name was Daniel, for a courtyard pass.' },
        { text: '"Seo Jin. S-E-O. Call my mother. Mi-ok Seo, 412 Kessler."', value: 'insisted', policy: 'restraint', autoplay: true, record: 'Told Pike his own name and asked him to call his mother.' },
      ], { who: 'pike', id: 'c01_pike_stance' });
      A.flag('ch1_pike_stance', v);
      if (v === 'played_along') {
        yield A.say('jin', '...Daniel.');
        A.pose('pike', 'idle');
        yield A.say('pike', 'There. You see? It comes back.');
        A.sound('paper', { vol: 0.5 });
        yield A.say(null, 'He signs a day-room and courtyard pass on the spot.');
        yield A.think("Let him think he's won. I need the courtyard more than I need him to say it.");
        yield A.say(null, "Hana's pencil stops.");
        A.meet('pike', 'c01_pass');
      } else {
        yield A.say('jin', 'Seo Jin. S-E-O. Call my mother. Mi-ok Seo, 412 Kessler.');
        A.pose('pike', 'shrug');
        yield A.say('pike', "I'll let the Fund know Mr. Ahn is agitated. For his protection, calls will go through our office.");
        yield A.walk('pike', W2.payphone - 14);
        A.pose('pike', 'reach', { hold: 1.2 });
        A.sound('paper', { vol: 0.5 });
        yield 1.0;
        yield A.say('hana', "He can't do that.");
        yield A.say('dolores', 'He can, honey. Sponsor\'s instructions.');
        A.meet('pike', 'c01_card_taped');
      }
      A.walk('pike', W2.office + 60);
      yield 1.0;
      A.remove('pike');
      A.flag('c01_pike7');
      yield A.fade(1, 0.6);
      yield A.goto('stagnes_gym', SG.desk - 60, { face: 1, fade: false });
      A.place('hana', SG.desk + 20); A.face('hana', -1); A.pose('hana', 'idle');
      yield A.cam({ x: SG.desk - 20, y: 246, zoom: 1.15, dur: 0 });
      yield A.fade(0, 0.6);
      A.sound('door', { vol: 0.4 });
      yield A.say(null, 'Hana closes the gym door.');
      yield A.say('hana', "I typed that file. In February '95, during the records conversion. I typed it from a face sheet Mr. Pike handed me.");
      A.pose('hana', 'phone');
      yield A.say('hana', "Front desk? It's Hana. The letter I put in the outgoing tray Monday. To a Mrs. Seo. Can you check if it went?");
      yield A.say(null, "Mr. Pike took the Ahn correspondence. As usual.", { name: 'Reception (phone)' });
      yield A.say('hana', 'As usual.');
      A.pose('hana', 'idle');
      yield 0.8;
      A.sound('paper', { vol: 0.5 });
      yield A.say(null, 'She opens the chart with you present. She is allowed to.');
      yield A.doc(currentFileDoc(G));
      A.evidence('ev_current_file');
      yield A.think('Age thirty-one. I\'m twenty-eight. They couldn\'t even keep the lie straight.');
      yield A.say('hana', v === 'played_along' ? "'Patient cooperative. Low risk.' He wrote that this morning." : "'Patient agitated. Monitor.' He wrote that this morning.");
      A.pose('hana', 'headDown', { hold: 1.2 });
      yield A.say('hana', "'Redirect gently.' I've redirected you gently for seven weeks. I typed those two words in February '95, a year and a half before you could answer.");
      yield 0.8;
      yield A.say('hana', 'Huh.');
      yield A.walk('hana', SG.desk + 70);
      A.pose('hana', 'sit');
      yield A.cam({ x: SG.desk + 30, y: 246, zoom: 1.2, dur: 0.8 });
      yield A.say('hana', "I'm not on your side, Jin. I'm on the side of the chart being true.");
      yield 0.8;
      yield A.say('hana', "Right now that's the same thing.");
      A.meet('hana', 'c01_chart');
      A.quest('q1_main', 'step', ST.sleep7);
      yield A.think('She called me Jin.');
    },

    /* ── 1.6 Week 9: stairs, the courtyard, the office door ────────── */
    *c01_to_week9(A, G) {
      yield* newSession(A, 9, 'Week 9', 'Rehabilitation gym · Tuesday, December 3');
      A.quest('q1_main', 'step', ST.stairs);
      yield A.goto('stagnes_gym', SG.stepTrainer - 40, { face: 1, fade: false });
      yield A.fade(0, 0.8);
      yield A.say('hana', "Stairs today. Don't show off.");
      yield A.say('hana', 'The trainer first. Up with one foot, down with the other. Then the real stairs, up to 2 West and back. Then the courtyard.');
      S.events.emit('toast', { text: 'Jump works now: a small hop. Running too, at a jog.', kind: 'hint' });
    },
    *c01_stairtrainer(A, G) {
      A.pose('jin', 'idle', { hold: true });
      yield alternateWait({ keys: ['up', 'down'], steps: 6, rush: 0.3, label: 'Stair trainer: up, down',
        onStep: (n) => { const j = S.world && S.world.jin; if (j) { j.y = (S.world.loc.ground || 300) - (n % 2 ? 8 : 0); } },
        onSag: () => { if (S.world && S.world.bark) S.world.bark('hana', "Don't show off.", 2); },
        onRecover: () => {} });
      const j = S.world && S.world.jin; if (j) j.y = S.world.loc.ground || 300;
      A.flag('c01_trainer_done');
      A.pose('jin', null);
      yield A.think('Up. Down. Up. Like a kid on the stoop of 412.');
    },
    *c01_hop(A, G) {
      A.flag('c01_climbed');
      A.quest('q1_main', 'step', ST.court);
      yield A.think('The top step. A hop, just to see.');
      A.pose('jin', 'jump', { hold: 0.35 });
      A.sound('land', { vol: 0.4 });
      yield 0.5;
      yield A.think('Both feet. Still here. Now down, and out to the courtyard.');
    },
    *c01_laps(A, G) {
      yield A.say('hana', 'Laps. The fountain and back. Jog when you can, walk when you can\'t.');
      yield A.activity('train_conditioning', { level: 1, x: SC.lapA, title: 'Courtyard laps', tries: 2 });
      A.pose('jin', 'tired', { hold: 1.6 });
      yield A.cam({ x: S.world.jin.x, y: 250, zoom: 1.2, dur: 0.8 });
      yield A.say(null, 'Your shoulders heave. Small breath puffs. The pace drops on its own.');
      yield A.say('hana', 'When your shoulders go up like that, you stop. Not when you feel like stopping. Before.');
      yield A.say('hana', "That's winded. It'll follow you out of here. Respect it.");
      A.meet('hana', 'c01_winded');
      yield A.say('hana', "I have a meeting upstairs with Sister Margaret. Walk it off, then come up.");
      A.walk('hana', SC.lobby);
      yield 1.0;
      A.remove('hana');
      A.quest('q1_main', 'step', ST.upstairs);
    },
    *c01_overheard(A, G) {
      yield A.think('Voices. Sister Margaret\'s door at the end of the hall, half open.');
      const lines = [
        ['sister_margaret', 'You called the State Athletic Commission. You called a disconnected number in Eastgate nine times.'],
        ['sister_margaret', 'Mr. Pike called me at home, Hana. At home.'],
        ['hana', "The commission says Jin Seo's licence lapsed in '95. Last address: 412 Kessler."],
        ['hana', 'His purse from August \'94 is still sitting there, unclaimed.'],
        ['sister_margaret', 'Twelve beds, Hana. Twelve people who\'d be somewhere worse.'],
        ['sister_margaret', 'Staff do not contact outside parties on behalf of Fund patients.'],
      ];
      const marks = [W2.tv - 20, W2.puzzle, W2.payphone - 30, W2.payphone + 20, W2.jar - 50, W2.jar - 20];
      let i = 0, t = 0;
      // Control kept: the closer he walks, the more he hears.
      yield A.waitFor(() => {
        const j = S.world && S.world.jin;
        t += S.DT;
        if (!j) return true;
        while (i < lines.length && (j.x >= marks[i] || auto())) {
          if (S.world.bark) S.world.bark(lines[i][0], lines[i][1], 3.6);
          i++; t = 0;
          if (auto()) break;
        }
        return i >= lines.length && t > 2.5;
      }, { autoplay: { walkTo: W2.jar - 10 } });
      A.letterbox(true, 0.5);
      A.walk('hana', W2.jar - 6, { face: -1 });
      yield A.cam({ x: W2.jar - 40, y: 248, zoom: 1.2, dur: 0.8 });
      yield A.say(null, "Hana comes out. She sees you in the corridor and doesn't pretend you didn't hear.");
      yield A.say('hana', "Thursday, I'm on until eleven. Medical records keeps originals from before the conversion.");
      yield A.say('hana', "If there's another version of you, it's down there. Dolores will lend me the key if I call it a chart audit.");
      yield A.say('hana', 'Wait for Thursday.');
      A.meet('sister_margaret', 'c01_beds');
      A.meet('hana', 'c01_thursday');
      A.letterbox(false, 0.5);
      A.walk('hana', W2.r212);
      A.quest('q1_main', 'step', ST.thursday);
      yield A.think('Twelve beds. She isn\'t a villain. She\'s afraid of an empty wing.');
    },

    /* ── 1.7 Week 10: the records room (two variants) ──────────────── */
    *c01_to_week10(A, G) {
      yield* newSession(A, 10, 'Week 10', 'Wednesday, December 11 · 11:10 PM');
      yield A.goto('stagnes_room214', BED_X + 20, { face: 1, fade: false });
      A.pose('jin', 'sit', { hold: true });
      yield A.fade(0, 1.0);
      yield A.think("Can't sleep. Earl's radio is off. The hall is dark under the door.");
      yield A.think('Thursday. Tomorrow. Hana said wait.');
      // The choice is made in play: the bed (wait) or the basement door (now). The autopilot goes to the door,
      // where the policy picks.
      yield A.waitFor((g) => !!fv(g, 'ch1_records_route'), { autoplay: { loc: 'stagnes_2west', interact: 'c01_go_down' } });
    },
    *c01_basement_door(A, G) {
      const s = sess(G);
      if (s === 10 && !fv(G, 'ch1_records_route') && !flag(G, 'c01_thursday')) {
        A.sound('door', { vol: 0.2 });
        yield A.think("The basement door, propped open with the night janitor's mop bucket. Stairs going down into the dark.");
        const v = yield A.choice('The records room is down there. Tonight.', [
          { text: 'Go down now.', value: 'alone_at_night', policy: 'ruthless', record: 'Went down to the records room alone, at night.' },
          { text: 'Not tonight. Hana said Thursday.', value: 'with_hana', policy: 'restraint', autoplay: true, record: 'Waited for Thursday, for Hana.' },
        ], { id: 'c01_records_route' });
        if (v === 'alone_at_night') {
          A.flag('ch1_records_route', 'alone_at_night');
          A.quest('q1_main', 'step', ST.alone);
          yield A.goto('stagnes_records', REC.door + 30, { face: 1 });
          A.quest('q1_main', 'step', ST.records);
          yield A.think('Sodium dark. The dehumidifier. A pipe dripping somewhere. Three rows of boxes by quarter.');
          return;
        }
        yield A.think('Thursday. I said I\'d wait.');
        yield* scenes.c01_thursday(A, G);
        return;
      }
      yield A.think("Staff only. Hana has a reason to be down here. You don't, yet.");
    },
    *c01_caught(A, G) {
      const n = (+fv(G, 'c01_caught') || 0) + 1;
      A.flag('c01_caught', n);
      A.face('dolores', 'jin');
      A.sound('step', { vol: 0.3 });
      yield A.say('dolores', n === 1 ? "Daniel, it's eleven. Even the goldfish is asleep." : n === 2 ? 'Daniel. Bed. I mean it, honey.' : 'Okay. I\'m going for coffee. When I come back, you\'re asleep. Deal?');
      yield A.fade(1, 0.4);
      A.place('jin', W2.r214);
      A.face('jin', -1);
      if (n >= 3) { A.flag('c01_dolores_break'); A.remove('dolores'); }
      yield A.fade(0, 0.4);
      yield A.think(n >= 3 ? 'She went the other way. The corridor is empty.' : 'Back at my door. The doorways are dark. She checks the rooms on her way down; she doesn\'t check the doors.');
    },
    *c01_thursday(A, G) {
      A.flag('ch1_records_route', 'with_hana');
      yield A.fade(1, 0.8);
      A.flag('c01_thursday');
      yield A.card('Thursday', '6:15 PM · Medical records, basement', 2.4);
      A.quest('q1_main', 'step', ST.records);
      yield A.goto('stagnes_records', REC.door + 60, { face: 1, fade: false });
      A.sound('door', { vol: 0.5 });
      yield A.fade(0, 1.0);
      yield A.say('hana', "Chart audit. That's what the key's for. Q3, ninety-four. Bottom shelves.");
      yield A.say('hana', "I've got the light. You've got the eyes.");
      A.flag('c01_follow');
    },
    *c01_box(A, G) {
      const withHana = fv(G, 'ch1_records_route') === 'with_hana';
      A.sound('paper', { vol: 0.5 });
      if (withHana) {
        A.letterbox(true, 0.5);
        A.walk('hana', REC.box - 22, { face: 1 });
        yield A.cam({ x: REC.box - 10, y: 262, zoom: 1.2, dur: 1.0 });
        A.pose('jin', 'sitFloor', { hold: true });
        A.pose('hana', 'sitFloor');
        yield A.say(null, 'ADMISSIONS 1994 Q3 — ORIGINALS. Dusty, except for one hand-shaped clean patch on the lid.');
        yield A.say(null, 'Behind another patient\'s papers, stapled on: a transfer form.');
        A.pose('hana', 'write');
        yield A.say('hana', 'Seo. Jin. Date of birth March fourteenth, sixty-eight. MR number four-four-seven-one dash zero.');
        yield A.say('hana', 'Closed head injury, professional boxing contest, Calder Civic Arena.');
        yield 0.8;
        yield A.say('hana', 'Same MR number as Daniel Ahn. Same bed. Different man.');
        yield A.doc('ev_transfer_form');
        A.evidence('ev_transfer_form');
        yield A.say(null, 'Then the St. Agnes intake sheet.');
        yield A.say('hana', "That's white-out.");
        A.pose('hana', 'idle');
        yield A.walk('hana', REC.window - 30, { face: 1 });
        A.pose('hana', 'reach', { hold: 3 });
        yield A.cam({ x: REC.window - 24, y: 228, zoom: 1.5, dur: 0.8 });
        yield A.say(null, 'She holds the sheet up to the high window. In the red sunset light, typed letters show through under AHN, DANIEL.');
        yield 2.5;
        yield A.doc('ev_intake_whiteout');
        A.evidence('ev_intake_whiteout');
        yield A.cam({ x: REC.window - 60, y: 258, zoom: 1.2, dur: 0.8 });
        A.walk('hana', REC.property - 30);
        yield 0.8;
        A.pose('hana', 'sit');
        yield A.say(null, 'Hana sits down on a box.');
        yield A.say('hana', 'Okay.');
        yield 0.8;
        yield A.say('hana', "Okay. I'm going to copy this, and put it back exactly where it was, and then I'm going to be very normal for a while.");
        A.walk('hana', REC.xerox + 4);
        yield 0.8;
        A.pose('hana', 'work', { hold: 2 });
        A.sound('buzz', { vol: 0.4 });
        A.flash('#f0f4ff', 0.6);
        yield 1.2;
        A.flash('#f0f4ff', 0.6);
        yield 1.0;
        A.rel('hana', 2);
        A.meet('hana', 'c01_records');
        yield A.say('hana', "Jin. There's a property shelf. There's a bag with a tag.");
        yield* scenes.c01_property(A, G);
        A.letterbox(false, 0.5);
        return;
      }
      // Alone, at night.
      yield A.say(null, 'ADMISSIONS 1994 Q3 — ORIGINALS. Dusty, except for one hand-shaped clean patch. Somebody took things out of here once.');
      yield A.say(null, "A transfer form, stapled behind another patient's papers. Missed.");
      yield A.doc('ev_transfer_form');
      A.evidence('ev_transfer_form');
      yield A.think('SEO, JIN. MR 4471-0. Boxing contest, Calder Civic Arena. Transferred two days after. Not checked out. Transferred.');
      yield A.say(null, 'And the St. Agnes intake sheet. AHN, DANIEL, typed thick, like the letters are standing on something.');
      yield A.think('I need light. The pull-chain bulb, by the fiche desk.');
      A.flag('c01_need_bulb');
    },
    *c01_bulb(A, G) {
      if (!hasEv(G, 'ev_transfer_form')) { A.sound('ui', { vol: 0.4 }); yield A.think('A bulb on a chain. Not yet. Find the box first.'); return; }
      A.flag('c01_bulb');
      A.sound('buzz', { vol: 0.5 });
      A.pose('jin', 'reach', { hold: 3.0 });
      A.letterbox(true, 0.4);
      yield A.cam({ x: REC.fiche + 2, y: 206, zoom: 1.5, dur: 0.6 });
      yield A.say(null, 'He holds the intake sheet up to the bare bulb. Under AHN, DANIEL: SEO, JIN, showing through.');
      yield 2.5;
      yield A.doc('ev_intake_whiteout');
      A.evidence('ev_intake_whiteout');
      yield A.think('Somebody sat at a desk and did this with a little brush.');
      yield A.think("I can't use the Xerox. Then I take the originals. And there's a property shelf.");
      A.letterbox(false, 0.4);
    },
    *c01_property(A, G) {
      const withHana = fv(G, 'ch1_records_route') === 'with_hana';
      A.sound('pickup', { vol: 0.5 });
      if (!withHana) yield A.walk('jin', REC.property - 14, { face: 1 });
      yield A.say(null, withHana ? 'She is the one who finds it. A patient property bag on the shelf, the tag in old ink.' : 'A patient property bag on the bottom shelf. A tag in old ink.');
      yield A.doc('ev_property_tag');
      A.evidence('ev_property_tag');
      yield A.think('Min bought it. Christmas \'92. She wrote that so the gym guys wouldn\'t take it.');
      if (!withHana) {
        A.pose('jin', 'sitFloor', { hold: true });
        yield A.cam({ x: REC.property - 60, y: 220, zoom: 0.8, dur: 2.0 });
        yield 2.0;
        yield A.think('Nobody to show it to. Not tonight.');
        A.flag('c01_records_done');
        A.quest('q1_main', 'step', ST.thursday);
        A.flag('c01_back_to_bed');
        yield A.think('Back up. Back to bed before Dolores comes round again.');
        return;
      }
      A.flag('c01_records_done');
      yield A.say('hana', 'Go to bed, Jin. Be very normal. I will be too.');
      yield* scenes.c01_to_dec18(A, G);
    },
    *c01_morning_after(A, G) {
      // The alone route: next morning, in the gym.
      yield A.fade(1, 0.8);
      A.flag('c01_morning');
      yield A.card('Thursday', '8:00 AM · Rehabilitation gym', 2.2);
      yield A.goto('stagnes_gym', SG.desk - 50, { face: 1, fade: false });
      A.spawn(S.castNpc('hana', { look: 'hana_scrubs', x: SG.desk + 16, face: -1, pose: 'idle' }));
      yield A.cam({ x: SG.desk - 20, y: 246, zoom: 1.15, dur: 0 });
      yield A.fade(0, 0.8);
      A.sound('paper', { vol: 0.5 });
      yield A.say(null, 'You put the originals on her desk.');
      A.pose('hana', 'handsHips');
      yield A.say('hana', 'You went down there alone? On those legs? I said Thursday.');
      yield A.say('jin', "I've lost two years. I couldn't lose one more day.");
      yield 0.8;
      yield A.say('hana', '...I know. I still said Thursday.');
      yield 0.8;
      yield A.say('hana', 'Show me.');
      A.pose('hana', 'reach', { hold: 3 });
      yield A.cam({ x: SG.glass - 40, y: 220, zoom: 1.4, dur: 0.8 });
      yield A.say(null, 'She holds the intake sheet up to the glass door. In daylight: SEO, JIN, under the white-out.');
      yield 2.0;
      yield A.say('hana', "I'm copying these. Then they go back exactly where they were. Then we're very normal.");
      A.meet('hana', 'c01_alone');
      yield* scenes.c01_to_dec18(A, G);
    },

    /* ── 1.8 December 18, morning ──────────────────────────────────── */
    *c01_to_dec18(A, G) {
      yield* newSession(A, 18, 'December 18', 'Room 214 · Wednesday morning');
      A.flag('c01_morning');
      A.quest('q1_main', 'step', ST.whitlow);
      yield A.goto('stagnes_room214', BED_X + 30, { face: -1, fade: false });
      A.letterbox(true, 0);
      yield A.cam({ x: R.window, y: 150, zoom: 1.35, dur: 0 });
      yield A.fade(0, 1.2);
      yield A.think('Snow. A thin first snow on the maple and the sill.');
      yield A.think('Frost. Two Decembers gone.');
      yield A.cam({ x: 360, y: 220, zoom: 1.0, dur: 1.4 });
      A.letterbox(false, 0.4);
      yield A.say('earl', "Morning. Dr. Whitlow came by. She wants you at her office, end of the hall. And Dolores said to tell you the binder's open. She said it twice.");
    },
    *c01_memo(A, G) {
      A.flag('c01_memo');
      yield A.walk('jin', W2.station + 10, { face: 1 });
      A.sound('paper', { vol: 0.5 });
      yield A.say('dolores', "I left the binder open. I'm going to go count gauze for a while.");
      A.walk('dolores', W2.r216, { face: -1 });
      yield A.doc({ id: 'c01_memo', title: 'Memo in the sponsor binder', kind: 'document', pages: [
        'CALDER FOUNDRY RELIEF FUND — 88 Market St.\nTo: St. Agnes, 2 West\nRe: AHN, Daniel (214)\nDate: 12/16/96\n\nPatient AHN, Daniel to be transferred to Ridgeview State Home, Millbrook, 12/19/96, 7:00 AM, at sponsor\'s request.\nTransport arranged by the Fund.\n\n— G. Pike, Liaison',
      ] });
      yield A.think('Millbrook. Two hundred miles upstate. Tomorrow, seven in the morning.');
      yield A.think('Somebody\'s still deciding where I sleep.');
      A.meet('dolores', 'c01_memo');
    },
    *c01_whitlow(A, G) {
      A.letterbox(true, 0.4);
      yield A.cam({ x: W2.office - 40, y: 246, zoom: 1.2, dur: 0.8 });
      yield A.say('whitlow', 'Medically, you can go. If you have somewhere to go.');
      A.sound('paper', { vol: 0.5 });
      yield A.say(null, 'She hands you a sheet.');
      yield A.doc('ev_whitlow_note');
      A.evidence('ev_whitlow_note');
      yield A.cam({ x: W2.office - 40, y: 250, zoom: 1.35, dur: 0.5 });
      yield 2.0;
      yield A.say('whitlow', "That's what fixing this properly looks like. Eighteen months. Specialists every day. People sell houses for it. People who have houses.");
      yield 0.8;
      yield A.say('whitlow', "Nobody is going to pay for that, Jin. I'm sorry.");
      yield A.think('Jin. She used my name.');
      yield A.think('I was going to make forty thousand on the biggest night of my life. Before the cuts.');
      yield A.think('Eighty-four thousand. Ordinary money doesn\'t get there. Not from a bed, not from a bus.');
      A.meet('whitlow', 'c01_note');
      A.letterbox(false, 0.4);
      yield A.fade(1, 0.8);
      A.flag('c01_pm');
      yield A.card('December 18', 'Afternoon · Rehabilitation gym', 2.2);
      yield A.goto('stagnes_gym', SG.desk - 50, { face: 1, fade: false });
      yield A.cam({ x: SG.desk - 20, y: 246, zoom: 1.1, dur: 0 });
      yield A.fade(0, 0.8);
      yield* scenes.c01_voluntary(A, G);
    },
    *c01_voluntary(A, G) {
      A.flag('c01_voluntary');
      yield A.say('hana', 'I read your admission paperwork front to back. There\'s no court order. No guardianship. You\'re a voluntary resident.');
      yield A.say('hana', "The Fund pays the bill. It doesn't own you.");
      yield 0.8;
      yield A.say('hana', 'You can walk out the door, Jin. Nobody told you that, because nobody wanted you to know.');
      A.meet('hana', 'c01_voluntary');
      A.quest('q1_main', 'step', ST.things);
      yield A.think('My things are in the closet. The name card is above the bed. Then the front desk.');
      A.walk('hana', SG.desk + 30);
    },
    *c01_radio_gift(A, G) {
      A.flag('c01_radio');
      A.flag('c01_radio_given');
      A.walk('jin', R.earlBed - 40, { face: 1 });
      yield A.say('earl', 'Here. Take it. For the ball games.');
      A.sound('pickup', { vol: 0.5 });
      if (qs(G, 'q1_crossword') && qs(G, 'q1_crossword').state === 'done') yield A.say('earl', 'Jin. Right? Jin. Find a fight on it.');
      else yield A.say('earl', 'Or whatever you call yourself.');
      yield A.think("Earl's transistor radio. It weighs nothing. It's the first thing anybody's given me in two years.");
      A.meet('earl', 'c01_radio');
    },

    /* ── 1.9 Leaving ───────────────────────────────────────────────── */
    *c01_ama(A, G) {
      A.letterbox(true, 0.5);
      yield A.cam({ x: LOB.desk + 160, y: 230, zoom: 0.95, dur: 1.0 });
      yield A.walk('jin', LOB.desk + 104, { face: -1 });
      yield A.say('pike', 'Daniel. The Fund has found a facility that will suit you better. Quieter. Less... imaginative staff.');
      A.spawn(S.castNpc('hana', { look: 'hana_scrubs', x: LOBBY_GYM_DOOR, face: -1, pose: 'idle' }));
      yield A.walk('hana', LOB.desk + 78, { run: true, face: -1 });
      A.pose('hana', 'handsHips');
      yield A.say('hana', "He's a voluntary resident. He can sign himself out against medical advice any time he likes. It's in the brochure. Someone circled it.");
      A.sound('paper', { vol: 0.5 });
      yield A.say(null, 'Dolores slides the AMA form across the desk without being asked. As she does, she turns the visitor binder toward you.');
      yield A.cam({ x: LOB.desk - 20, y: 262, zoom: 1.4, dur: 0.6 });
      yield A.say(null, 'Twenty-six visits. One name: G. Pike, CFRF. Family visits: none.');
      yield A.cam({ x: LOB.desk + 40, y: 246, zoom: 1.15, dur: 0.6 });
      const v = yield A.choice('The form\'s name line.', [
        { text: 'Sign "Seo Jin".', value: 'seo_jin', policy: 'restraint', autoplay: true, record: 'Signed himself out as Seo Jin.' },
        { text: 'Sign "Daniel Ahn".', value: 'daniel_ahn', policy: 'ruthless', record: 'Signed himself out as Daniel Ahn.' },
      ], { id: 'c01_signed_name' });
      A.flag('ch1_signed_name', v);
      A.pose('jin', 'write', { hold: 1.0 });
      A.sound('paper', { vol: 0.5 });
      yield 1.0;
      if (v === 'seo_jin') {
        yield A.say('dolores', "That's not the name on the file, hon.");
        yield A.say('jin', "It's the name on me.");
        A.pose('pike', 'pocket');
        yield A.say(null, "Pike's smile goes. He leaves first, already feeling his coat for a dime for the payphone.");
        A.walk('pike', LOB.glass + 60);
        A.walk('c01_transport', LOB.glass + 60);
        yield 1.4;
        A.remove('pike'); A.remove('c01_transport');
      } else {
        A.pose('pike', 'idle');
        yield A.say('pike', 'Sensible.');
        yield A.think("It's just a form. I'll get the name back when I can prove it.");
        A.walk('pike', LOB.elevator);
        A.walk('c01_transport', LOB.glass + 60);
        yield 1.4;
        A.remove('pike'); A.remove('c01_transport');
      }
      A.meet('pike', 'c01_ama');
      A.flag('c01_signed');
      A.flag('c01_tether', false);
      yield A.say('hana', "Go on. I'll get my coat.");
      A.remove('hana');
      A.letterbox(false, 0.5);
      A.quest('q1_main', 'step', ST.bus);
      A.spawn(S.castNpc('hana', { look: 'hana_coat', x: LOB.glass + 36, face: -1, pose: 'idle', talk: 'c01_hana_doors', marker: () => '!' }));
      yield A.think('The front doors. Snow on the steps.');
    },
    *c01_front_doors(A, G) {
      if (flag(G, 'c01_signed')) return;
      yield A.think(sess(G) === 18 ? "Locked to residents. Residents sign out at the desk. There's a form." : "Residents sign out at the desk. There's a form.");
    },
    *c01_bus(A, G) {
      if (!flag(G, 'c01_hana_out')) {
        yield A.think('Hana is at the doors. She came out after me.');
        yield* dialogs.c01_hana_doors(A, G);
      }
      if (!fv(G, 'ch1_fare_source')) {
        // Never strand him: Hana presses it on him at the shelter.
        A.flag('ch1_fare_source', 'hana_loan');
        A.money(20);
      }
      A.letterbox(true, 0.5);
      yield A.walk('jin', LOB.shelter - 10, { face: 1 });
      yield A.cam({ x: LOB.steps + 120, y: 210, zoom: 0.8, dur: 2.0 });
      yield A.think('Calder below, in blue haze. The Civic, a gray bump on the river.');
      yield 2.0;
      A.sound('carHorn', { vol: 0.3 });
      A.flag('c01_bus');
      yield 1.0;
      A.money(-1);
      yield A.say(null, 'The 14. A dollar in the box.');
      yield A.fade(1, 0.8);
      A.show('jin', false);
      // The last shot: from the bus window, St. Agnes sliding away; Hana at a second-floor window, not waving.
      A.spawn(S.castNpc('hana', { id: 'c01_hana_window', look: 'hana_scrubs', x: 300, y: 128, face: 1, pose: 'idle', fixedY: true }));
      yield A.cam({ x: 560, y: 180, zoom: 1.0, dur: 0 });
      yield A.fade(0, 0.8);
      yield A.cam({ x: 260, y: 170, zoom: 1.0, dur: 5.0 });
      yield A.say(null, 'A small figure in teal with a clipboard at a second-floor window. Not waving.');
      yield 1.0;
      A.fx('desat', 0.3, 1.0);
      yield A.think('She charted what she saw. Somebody else charted what they wanted.');
      yield A.card('An address: 412 Kessler Avenue.', '', 3.0);
      A.quest('q1_main', 'done');
      A.flag('ch1_complete');
      A.flag('base', 'stagnes_room214');
      A.letterbox(false, 0);
      A.fx('desat', 0, 0);
      yield A.endChapter();
    },
    *c01_jar(A, G) {
      A.flag('c01_jar_seen');
      if (flag(G, 'c01_jar_taken')) { yield A.think('The jar on the sill. Empty. The "thank you!" label facing the room.'); return; }
      const fare = fv(G, 'ch1_fare_source');
      yield A.think("$6.40 in coins and two singles. A masking-tape label: 'DAY ROOM — BINGO PRIZES — thank you! — Mrs. Alvarez, Volunteer.'");
      if (sess(G) !== 18 || !flag(G, 'c01_pm') || fare) return;
      const v = yield A.choice('The 14 costs a dollar.', [
        { text: "[Take the bingo jar. $6.40. It's the day room's prize money.]", value: 'take', policy: 'ruthless', record: 'Took the bingo jar for bus fare.' },
        { text: 'Leave it on the sill.', value: 'leave', policy: 'restraint', autoplay: true },
      ], { id: 'c01_jar' });
      if (v === 'take') {
        A.flag('ch1_fare_source', 'activities_jar');
        A.flag('c01_jar_taken');
        A.flag('take_count', (+fv(G, 'take_count') || 0) + 1);
        A.sound('pickup', { vol: 0.5 });
        A.money(6);
        yield A.think('Six dollars and forty cents of Thursday afternoons.');
      } else yield A.think('Not theirs to lose.');
    },
    *c01_card_done(A, G) {
      A.quest('q1_exercise_card', 'done');
      A.rel('hana', 1);
      A.meet('hana', 'c01_homework');
      yield A.think('Level one. Hana will put a check on the card. She will pretend it\'s nothing.');
    },

    /* Small examine scenes. */
    *c01_binder(A, G) {
      if (sess(G) === 18 && !flag(G, 'c01_memo')) { yield* scenes.c01_memo(A, G); return; }
      A.sound('paper', { vol: 0.4 });
      yield A.say(null, 'AHN, D. — All correspondence and telephone contact to be routed via CFRF liaison. Visitors by prior approval only. — G.P.');
      yield A.think('My life has a routing slip.');
    },
    *c01_chart_rack(A, G) {
      if (!hasEv(G, 'ev_current_file')) { yield A.think('AHN, D. 214. Not mine to read, apparently.'); return; }
      yield A.doc(currentFileDoc(G));
    },
    *c01_mug(A, G) {
      yield A.think('CALDER FOUNDRY & FORGE — 25 YEARS.');
      if (S.world && S.world.actor('hana')) yield A.say('hana', 'My dad\'s. They gave him a mug and a pension that lasted until the bankruptcy.');
      A.flag('c01_mug_seen');
    },
    *c01_beacon(A, G) {
      A.sound('paper', { vol: 0.4 });
      yield A.doc({ id: 'c01_beacon', title: 'Brochure (Hana\'s tray)', kind: 'document', pages: [
        'BEACON STREET INSTITUTE\nBoston\n\nResidential Neuro-Rehabilitation\n18 months · specialists daily\n\nest. $84,000\n\n(Someone has written "ask about" on the cover in pencil, and then crossed it out.)'] });
      yield A.think('Eighty-four thousand dollars. Hana wrote "ask about". Then she did the arithmetic.');
    },
    *c01_rights(A, G) {
      yield A.think("Living With Brain Injury. Your Rights as a Resident.");
      if (sess(G) >= 9) yield A.think("'You have the right to communicate privately with persons of your choice.' Somebody circled it in pen. Not me.");
      else yield A.think("'You have the right to communicate privately with persons of your choice.' Huh.");
    },
    *c01_plaque(A, G) {
      yield A.say(null, 'REHABILITATION WING · Twelve beds supported by the CALDER FOUNDRY RELIEF FUND since 1994');
      yield A.think('They bought twelve beds and a name.');
      A.flag('c01_plaque_seen');
    },
    *c01_visitor_binder(A, G) {
      A.sound('paper', { vol: 0.4 });
      yield A.say(null, 'VISITORS — 2 WEST. Rows of names and times. For room 214, one name, over and over: G. Pike, CFRF.');
      yield A.think('Nobody else. Not once.');
    },
    *c01_payphone(A, G) {
      const insisted = fv(G, 'ch1_pike_stance') === 'insisted' && sess(G) >= 7;
      if (insisted) yield A.think('An index card taped to the phone: Resident AHN D. — calls via CFRF liaison. My name, on a payphone. Not even my name.');
      const q = qs(G, 'q1_calls');
      if (!q || q.state === 'done') { if (!insisted) yield A.think(q ? 'Both numbers belong to somebody else now.' : 'PATIENT CALLS 7–9 PM.'); return; }
      const opts = [];
      if (!flag(G, 'c01_called_home')) opts.push({ text: '412 Kessler. Home.', value: 'home', autoplay: true });
      if (!flag(G, 'c01_called_gym')) opts.push({ text: 'Marsh Boxing Club. The number from memory.', value: 'gym', autoplay: !flag(G, 'c01_called_home') ? undefined : true });
      opts.push({ text: 'Hang up.', value: 'no' });
      const v = yield A.choice('The receiver is warm from the last person.', opts, { id: 'c01_phone' });
      if (v === 'home') {
        A.sound('dial', { vol: 0.5 });
        yield 1.0;
        A.sound('buzz', { vol: 0.4 }); yield 0.35; A.sound('buzz', { vol: 0.45 }); yield 0.35; A.sound('buzz', { vol: 0.5 }); yield 0.4;
        yield A.say(null, 'The number you have reached is not in service. Please check the number and dial again.', { name: 'Recording' });
        yield A.say(null, '(Three tones. Again. The whole message, again.)');
        A.flag('c01_called_home');
        yield A.think('Not in service. Umma always paid the phone first. Before the rent.');
      } else if (v === 'gym') {
        A.sound('dial', { vol: 0.5 });
        yield 1.0;
        A.sound('phoneRing', { vol: 0.4 });
        yield 0.6;
        yield A.say(null, 'Iron Pulse Fitness, how can I pump you up?', { name: 'Voice on the line' });
        yield A.say('jin', '...Marsh Boxing Club?');
        yield A.say(null, "Who? This is Iron Pulse. We've got a two-for-one on tanning.", { name: 'Voice on the line' });
        A.flag('c01_called_gym');
        yield A.think("Teddy's gym. Somebody sells tanning in it now.");
      } else return;
      if (flag(G, 'c01_called_home') && flag(G, 'c01_called_gym')) {
        yield A.think('Both numbers belong to somebody else now.');
        A.quest('q1_calls', 'done');
      }
    },
    *c01_sleep(A, G) {
      const s = sess(G);
      A.pose('jin', 'lieBed', { hold: true });
      yield A.think(s === 10 ? 'Lie down. Be very normal.' : 'Sleep. Count the tiles. Thirty-seven.');
      if (s === 4) { yield* scenes.c01_to_week7(A, G); return; }
      if (s === 7) { yield* scenes.c01_to_week9(A, G); return; }
      if (s === 9) { yield* scenes.c01_to_week10(A, G); return; }
      if (s === 10 && !fv(G, 'ch1_records_route')) { yield* scenes.c01_thursday(A, G); return; }
      if (s === 10 && flag(G, 'c01_back_to_bed')) { yield* scenes.c01_morning_after(A, G); return; }
    },
  };

  function currentFileDoc(G) {
    const st = fv(G, 'ch1_pike_stance');
    const note = st === 'played_along' ? '11/20/96  Patient cooperative. Low risk. — G.P.' : st === 'insisted' ? '11/20/96  Patient agitated. Monitor. — G.P.' : '';
    return { id: 'ev_current_file', title: 'Current chart face sheet', kind: 'record', pages: [
      'ST. AGNES LONG-TERM CARE — REHABILITATION WING\nFACE SHEET (typed 02/95, records conversion — H.L.)\n\nPatient: AHN, DANIEL      Age: 31\nDOB 03/14/68      MR# 4471-0      Bed 214-W\nAdmitted 08/22/94 from Calder General\nSponsor: Calder Foundry Relief Fund (CFRF), liaison G. Pike\nNext of kin: none on file',
      'HISTORY: Industrial accident, 08/20/94. Salvage work at Calder Foundry; struck by a falling beam.\nEmployment: pour floor, Calder Foundry, 9 years.\nDx: closed head injury; shoulder ORIF (two screws); facial laceration, healed.\n\nNOTE: Patient may describe a history of professional boxing. Confabulation is expected. Redirect gently.\nCorrespondence: all via CFRF liaison.' + (note ? '\n\n' + note : ''),
    ] };
  }

  /* ════════════════════════════════════════════════════════════════════
     7. Dialogs
     ════════════════════════════════════════════════════════════════════ */
  const dialogs = {
    *c01_earl(A, G) {
      const s = sess(G);
      A.meet('earl', 'c01_met');
      if (crosswordReady(G)) { yield* scenes.c01_crossword(A, G); return; }
      if (s === 18) {
        if (!flag(G, 'c01_radio') && flag(G, 'c01_pm')) { yield* scenes.c01_radio_gift(A, G); return; }
        if (!flag(G, 'c01_pm')) { yield A.say('earl', "Whitlow's at her office. Go on. I'm packing. Florida. My daughter says it never snows."); return; }
        if (!fv(G, 'ch1_fare_source') && !flag(G, 'c01_earl_fare_asked')) {
          A.flag('c01_earl_fare_asked');
          yield A.say('earl', "You're going today. Good. You got bus fare?");
          const v = yield A.choice(null, [
            { text: 'Take the five.', value: 'take', record: 'Took five dollars from Earl for the bus.' },
            { text: "I'll manage, Earl.", value: 'no', autoplay: true },
          ], { who: 'earl', id: 'c01_earl_fare' });
          if (v === 'take') {
            yield A.say('earl', 'Forty years I rigged steel and never once tipped a bus driver. Take five.');
            A.flag('ch1_fare_source', 'earl_gift');
            A.sound('pickup', { vol: 0.5 });
            A.money(5);
            A.meet('earl', 'c01_five');
          } else yield A.say('earl', 'Suit yourself. Stubborn. That I trust.');
          return;
        }
        yield A.say('earl', 'Go on. Before Pike gets his coat on.');
        return;
      }
      if (s === 4) { yield A.say('earl', 'Shh. Channel 6. They do the sports at the half hour.'); return; }
      if (s === 7) { yield A.say('earl', 'Look at you, upright. Like a man waiting for a bus.'); return; }
      if (s >= 9) { yield A.say('earl', hasEv(G, 'ev_earl_testimony') ? 'Jin. Right? Jin. I keep saying it so I don\'t slip.' : 'Morning, Daniel. Or whatever your name is today.'); return; }
      yield A.say('earl', 'Morning, Daniel. Or whatever your name is today.');
    },
    *c01_crossword(A, G) {
      const q0 = qs(G, 'q1_crossword'), n = q0 ? q0.step | 0 : 0;
      if (!q0) A.quest('q1_crossword', 'start');
      if (n === 0) {
        yield A.say('earl', "Sunday's crossword. Seven letters. 'A fighter throws it first.' I've got an O at the front and a G at the end.");
        const v = yield A.choice('Seven letters, O _ _ _ _ _ G.', [
          { text: 'OPENING', value: 'ok', autoplay: true }, { text: 'JAB', value: 'no' }, { text: 'OVERHAND', value: 'no' },
        ], { who: 'earl', id: 'c01_clue1' });
        if (v !== 'ok') { yield A.say('earl', "Doesn't fit. Count the boxes, kid. Seven."); return; }
        yield A.say('earl', 'Opening. Huh. You\'d know.');
        yield A.think("You throw it first or you don't throw anything.");
        A.quest('q1_crossword', 'step', 1);
        return;
      }
      if (n === 1) {
        yield A.say('earl', "Seven letters. 'Calder's old employer, closed in '92.' F, then a U.");
        const v = yield A.choice('Seven letters, F U _ _ _ _ _.', [
          { text: 'FOUNDRY', value: 'ok', autoplay: true }, { text: 'FORGE', value: 'no' }, { text: 'FACTORY', value: 'no' },
        ], { who: 'earl', id: 'c01_clue2' });
        if (v !== 'ok') { yield A.say('earl', "Second letter's a U. Read it again."); return; }
        yield A.say('earl', 'Foundry. Ha. Forty years I rigged steel down there.');
        yield A.say('earl', "Closed in March of '92. Chained the gates. The bank's men took the copper out that summer and nobody went in after. Nobody.");
        yield A.say('earl', "Salvage. Huh. There was nothing left to salvage by '93.");
        A.quest('q1_crossword', 'step', 2);
        A.meet('earl', 'c01_foundry');
        return;
      }
      yield A.say('earl', "Four letters. 'What's on a bed card.' Ends in an E.");
      const v = yield A.choice('Four letters, _ _ _ E.', [
        { text: 'NAME', value: 'ok', autoplay: true }, { text: 'TAG', value: 'no' }, { text: 'NUMBER', value: 'no' },
      ], { who: 'earl', id: 'c01_clue3' });
      if (v !== 'ok') { yield A.say('earl', "Four boxes. Ends in E."); return; }
      yield A.say('earl', 'Name.');
      yield 0.8;
      yield A.say('earl', 'Funny clue for this room.');
      yield 0.8;
      yield A.say('earl', 'Jin. Right? Jin.');
      yield A.say('earl', "That thing I said at the TV. About the Korean kid. I'm sorry. I didn't know it was you in the bed. I should've said it different even if it wasn't.");
      yield A.say('earl', "And for what it's worth: no beam came down on anybody at the Foundry in August of '94. There wasn't a soul in there to drop one.");
      A.evidence('ev_earl_testimony');
      A.quest('q1_crossword', 'done');
      A.meet('earl', 'c01_sorry');
    },
    *c01_dolores(A, G) {
      const s = sess(G);
      A.meet('dolores', 'c01_met');
      if (s === 4 && step(G) === ST.call) { yield* scenes.c01_call_home(A, G); return; }
      if (s === 18 && !flag(G, 'c01_memo')) { yield* scenes.c01_memo(A, G); return; }
      if (s >= 10 && fv(G, 'ch1_records_route')) { yield A.say('dolores', "Lights out at ten, Mr. Seo. Sorry. I'll get used to it."); return; }
      if (s === 7 && fv(G, 'ch1_pike_stance') === 'insisted') { yield A.say('dolores', "That card on the phone. I didn't tape it, honey. I want you to know I didn't tape it."); return; }
      yield A.say('dolores', s <= 4 ? "Good morning, Daniel. Big day. Pills, then glory." : 'Look at you. Walking to my desk like you pay rent.');
    },
    *c01_knitter(A, G) {
      if (sess(G) === 18) { yield A.say('knitter', 'Finished. Red and gray. For my grandson. He won\'t wear it.', { name: 'Woman in 216' }); return; }
      yield A.say('knitter', 'You\'re the boy who woke up. Good for you. Don\'t let them rush you.', { name: 'Woman in 216' });
    },
    *c01_whitlow(A, G) {
      A.meet('whitlow', 'c01_met');
      yield A.say('whitlow', sess(G) >= 7 ? "Morning, Mr. —" : 'Morning, Mr. Ahn.');
      if (sess(G) >= 7) yield 0.8;
      yield A.say('whitlow', 'Your recovery is real. It is also slow. Both of those are going to annoy you.');
    },
    *c01_whitlow_office(A, G) {
      if (step(G) === ST.whitlow) { yield* scenes.c01_whitlow(A, G); return; }
      yield A.say('whitlow', 'Take care of the shoulder, Jin.');
    },
    *c01_hana(A, G) {
      const s = sess(G);
      if (s === 4 && !qs(G, 'q1_exercise_card')) {
        yield A.say('hana', "Here. Home exercises. It's not a plan, it's homework.");
        A.quest('q1_exercise_card', 'start');
        return;
      }
      if (s === 18) {
        if (!flag(G, 'c01_voluntary')) { yield* scenes.c01_voluntary(A, G); return; }
        yield A.say('hana', 'Go. Get your things.');
        return;
      }
      if (flag(G, 'c01_card_drill')) { yield A.say('hana', "Training isn't the plan. It's the homework. The plan is you walking out of here."); return; }
      if (s === 7) { yield A.say('hana', 'Footwork marks are open. Number one to six, zigzag. At sixty percent.'); return; }
      if (s >= 9) { yield A.say('hana', 'Stairs. Then the courtyard. Then you can sulk.'); return; }
      yield A.say('hana', 'The bars or the board. Training tab, in your journal. Level one. Nobody gets level two at St. Agnes.');
    },
    *c01_hana_records(A, G) {
      yield A.say('hana', hasEv(G, 'ev_transfer_form') ? 'Keep going. I\'m right here.' : "Q3, ninety-four. The originals. Bottom shelf, I'd bet. Somebody's lazy.");
    },
    *c01_hana_doors(A, G) {
      if (flag(G, 'c01_hana_out')) { yield A.say('hana', 'Go. The 14 is never on time, but it does come.'); return; }
      A.flag('c01_hana_out');
      A.letterbox(true, 0.4);
      yield A.cam({ x: LOB.glass + 20, y: 240, zoom: 1.2, dur: 0.6 });
      if (fv(G, 'ch1_records_route') === 'with_hana') yield A.say(null, 'She hands you the copies. Every page.');
      else yield A.say(null, 'She has nothing to hand you. You have the originals.');
      A.sound('paper', { vol: 0.5 });
      yield A.say(null, "And an appointment card. Front: Hana Lim · Rehab · ext. 214 · before 7 or after 9. Back: Calder YMCA, Front St. $8/night. Tell Otis at the desk I sent you.");
      A.flag('c01_hana_card');
      if (!fv(G, 'ch1_fare_source')) {
        yield A.say('hana', "Take it. It's a loan. I'm keeping a list.");
        A.flag('ch1_fare_source', 'hana_loan');
        A.sound('pickup', { vol: 0.5 });
        A.money(20);
        A.meet('hana', 'c01_loan');
      }
      yield A.say('hana', 'The address on the form is 412 Kessler. Eastgate. The 14 goes there.');
      yield A.say('jin', 'Why are you doing this?');
      yield A.say('hana', "Because the chart's wrong. I hate it when the chart's wrong.");
      if (flag(G, 'ch1_told_hana_boxing')) yield A.say('hana', "You told me on the bars. I should've written it bigger.");
      if (fv(G, 'ch1_fare_source') === 'hana_loan') yield A.say('hana', "Twenty dollars. It's on the list.");
      A.meet('hana', 'c01_card');
      A.letterbox(false, 0.4);
      A.walk('hana', LOB.glass - 10);
      yield 0.8;
      A.remove('hana');
    },
  };
  // Crossword lives with the dialogs but scenes call it too.
  scenes.c01_crossword = dialogs.c01_crossword;

  /* ════════════════════════════════════════════════════════════════════
     8. Chapter
     ════════════════════════════════════════════════════════════════════ */
  const atLoc = (loc, x, extra) => Object.assign({ loc, x }, extra || {});
  S.defineChapter({
    id: N, title: 'The Name Above the Bed', date: 'October 1996', place: 'St. Agnes Long-Term Care, Hillcrest',
    card: ['Two years later.'],
    start: { loc: 'stagnes_room214', x: BED_X, face: -1, scene: 'c01_start', fadeIn: false },
    required: ['stagnes_room214', 'stagnes_2west', 'stagnes_gym', 'stagnes_courtyard', 'stagnes_records', 'stagnes_lobby'],
    body: { look: 'jin_hospital', power: 0.3, speedMul: 0.4, breath: false, limp: 1 },
    skills: {},
    travel: "Residents sign out at the desk. There's a form.",
    locations: {
      stagnes_room214: room214, stagnes_2west: west2, stagnes_gym: gym, stagnes_courtyard: courtyard,
      stagnes_records: records, stagnes_lobby: lobby,
    },
    quests: {
      q1_main: { title: 'The Name Above the Bed', kind: 'main', giver: 'hana',
        summary: 'Wake. Sit up. Walk again. Find out who put another man\'s name above your bed, and get out.',
        steps: [
          { text: 'Sit up.', target: atLoc('stagnes_room214', BED_X) },
          { text: 'Read the card above the bed.', target: atLoc('stagnes_room214', R.nameCard - 12), autoplay: { loc: 'stagnes_room214', interact: 'i1_namecard' } },
          { text: 'Walk the bars with Hana.', target: atLoc('stagnes_gym', SG.bars + SG.barsW / 2) },
          { text: 'Rest.', target: atLoc('stagnes_room214', BED_X), autoplay: { loc: 'stagnes_room214', interact: 'c01_bed_edge' } },
          { text: 'Get to the day room.', target: atLoc('stagnes_2west', W2.tv), autoplay: { loc: 'stagnes_2west', walkTo: W2.tv } },
          { text: 'Ask to call home.', target: atLoc('stagnes_2west', W2.dolores), autoplay: { loc: 'stagnes_2west', interact: 'dolores' } },
          { text: 'Get some sleep.', target: atLoc('stagnes_room214', SLEEP_X), autoplay: { loc: 'stagnes_room214', interact: 'c01_sleep' } },
          { text: "Walk to the nurses' station.", target: atLoc('stagnes_2west', W2.station - 30), autoplay: { loc: 'stagnes_2west', walkTo: W2.station - 30 } },
          { text: 'Get some sleep.', target: atLoc('stagnes_room214', SLEEP_X), autoplay: { loc: 'stagnes_room214', interact: 'c01_sleep' } },
          { text: 'Climb the stairs. Then the courtyard.', target: atLoc('stagnes_gym', SG.door), autoplay: { loc: 'stagnes_gym', interact: 'sg_stairs' } },
          { text: 'Climb the stairs. Then the courtyard.', target: atLoc('stagnes_courtyard', SC.lapA + 30), autoplay: { loc: 'stagnes_courtyard', interact: 'hana' } },
          { text: 'Back up to 2 West.', target: atLoc('stagnes_2west', W2.jar - 10), autoplay: { loc: 'stagnes_2west', walkTo: W2.tv } },
          { text: 'Wait for Thursday. Hana has the key.', target: atLoc('stagnes_room214', SLEEP_X), autoplay: { loc: 'stagnes_room214', interact: 'c01_sleep' } },
          { text: "Go down to the records room. Don't get caught.", target: atLoc('stagnes_2west', W2.basement), autoplay: { loc: 'stagnes_records', interact: 'i1_records_box' } },
          { text: 'Find ADMISSIONS 1994 Q3.', target: atLoc('stagnes_records', REC.box), autoplay: { loc: 'stagnes_records', interact: 'i1_records_box' } },
          { text: 'See Dr. Whitlow.', target: atLoc('stagnes_2west', W2.office - 26), autoplay: { loc: 'stagnes_2west', interact: 'whitlow' } },
          { text: 'Get your things. Get out before the 19th.', target: atLoc('stagnes_room214', R.closet), autoplay: { loc: 'stagnes_room214', interact: 'c01_closet_change' } },
          { text: 'Get your things. Get out before the 19th.', target: atLoc('stagnes_room214', R.nameCard - 12), autoplay: { loc: 'stagnes_room214', interact: 'c01_take_card' } },
          { text: 'Sign out at the front desk.', target: atLoc('stagnes_lobby', LOB.desk + 104), autoplay: { loc: 'stagnes_lobby', walkTo: LOB.desk + 120 } },
          { text: 'Catch the 14.', target: atLoc('stagnes_lobby', LOB.shelter), autoplay: { loc: 'stagnes_lobby', interact: 'c01_shelter' } },
        ] },
      q1_crossword: { title: "Earl's crossword", kind: 'side', giver: 'earl', summary: "Help Earl with Sunday's crossword, one clue a week.",
        steps: [
          { text: "Help Earl with Sunday's crossword.", target: atLoc('stagnes_room214', R.earlBed) },
          { text: "Help Earl with Sunday's crossword.", target: atLoc('stagnes_2west', W2.puzzle + 46) },
          { text: "Help Earl with Sunday's crossword.", target: atLoc('stagnes_room214', R.earlBed) },
        ] },
      q1_calls: { title: 'A phone call', kind: 'side', summary: 'Two numbers from memory, from the day-room payphone.',
        steps: [{ text: 'Make a phone call.', target: atLoc('stagnes_2west', W2.payphone) }] },
      q1_exercise_card: { title: "Hana's exercise card", kind: 'side', giver: 'hana', summary: "Hana's home exercise card. Training is optional: it improves control of the body you have.",
        steps: [{ text: "Hana's home exercise card: try a drill.", target: atLoc('stagnes_gym', SG.bars + SG.barsW / 2) }] },
    },
    evidence: {
      ev_name_card: { title: 'The name above the bed', kind: 'record', date: 'October 7, 1996',
        text: 'AHN, DANIEL · DOB 03/14/68 · ADM 08/22/94 · DR. WHITLOW · FUNDING: CFRF', proves: 'Someone renamed him with his own birthday.',
        pages: ['AHN, DANIEL\nDOB 03/14/68\nADM 08/22/94\nDR. WHITLOW\nFUNDING: CFRF\n\nThat\'s my birthday. That\'s not my name.'] },
      ev_pike_card: { title: "Pike's business card", kind: 'document', date: 'October 9, 1996',
        text: 'Gerald T. Pike · Liaison · Calder Foundry Relief Fund · 88 Market Street, 2nd floor · P.O. Box 1180, Calder', proves: 'Links Pike, the Fund and the post-office box.',
        pages: ['GERALD T. PIKE\nLiaison\n\nCALDER FOUNDRY RELIEF FUND\n88 Market Street, 2nd floor\nP.O. Box 1180, Calder'] },
      ev_current_file: { title: 'Current chart face sheet', kind: 'record', date: 'Typed February 1995',
        text: "AHN, DANIEL, 'age 31', DOB 03/14/68, MR# 4471-0. Industrial accident, salvage at Calder Foundry, 08/20/94. 'Patient may describe a history of professional boxing. Confabulation is expected. Redirect gently.' Pike's note on top: 'cooperative' or 'agitated, monitor'.",
        proves: 'The false account, typed by Hana from a face sheet Pike handed her.' },
      ev_transfer_form: { title: 'Original transfer form', kind: 'record', date: 'August 22, 1994',
        text: 'Calder General to St. Agnes. SEO, JIN, DOB 03/14/68, MR# 4471-0. Closed head injury, professional boxing contest, Calder Civic Arena.',
        proves: 'Same MR number, different man: his identity was replaced after the fight. He did not check himself out.',
        pages: ['CALDER GENERAL HOSPITAL — INTERFACILITY TRANSFER\nDate: 08/22/94\n\nPatient: SEO, JIN\nDOB: 03/14/68      MR# 4471-0\nDx: Closed head injury, sustained in professional boxing contest, Calder Civic Arena, 08/20/94.\nTo: St. Agnes Long-Term Care, Rehabilitation Wing, Bed 214-W\nSponsor: CFRF (G. Pike)\nFamily contact: per sponsor.\n\n(Stapled behind another patient\'s papers. Missed.)'] },
      ev_intake_whiteout: { title: 'Intake sheet', kind: 'record', date: 'August 22, 1994',
        text: 'St. Agnes intake sheet. AHN, DANIEL typed over white-out; against the light, SEO, JIN shows through.',
        proves: 'The replacement was done by hand.',
        pages: ['ST. AGNES LONG-TERM CARE — INTAKE\n08/22/94\n\nName: AHN, DANIEL\n   (against the light, under the white-out: SEO, JIN)\nMR# 4471-0      Bed 214-W\nSponsor: CFRF\nIntake clerk: initials illegible'] },
      ev_property_tag: { title: 'Patient property bag', kind: 'object', date: 'August 20, 1994',
        text: 'Tag: SEO, J. · ER 8/20/94 · MR# 4471-0. A muted blue track top, black pants, worn white running shoes, a wallet with Athletic Commission licence SEO, JIN · Professional Boxer · Lic. CA-1187.',
        proves: 'His own things, under his own name.',
        pages: ['PATIENT PROPERTY\nSEO, J. · ER 8/20/94 · MR# 4471-0\n\n1 track top, blue\n1 pr pants, black\n1 pr running shoes, white (worn)\n1 wallet: Athletic Commission licence — SEO, JIN · Professional Boxer · Lic. CA-1187',
          'You turn the collar of the track top. Inside, in marker:\n\nPROPERTY OF THE CHAMP (allegedly) — M'] },
      ev_whitlow_note: { title: "Dr. Whitlow's sheet", kind: 'document', date: 'December 18, 1996',
        text: "What he actually needs, in Dr. Whitlow's hand: Beacon Street Institute, Boston. Residential neuro-rehabilitation, 18 months, specialists daily. Est. $84,000. Funding: none identified.",
        proves: 'What real recovery costs. Ordinary money can\'t reach it.',
        pages: ['A. WHITLOW, M.D. — DISCHARGE RECOMMENDATIONS\nPatient: SEO, JIN (chart: AHN, D.)\nMedically stable for discharge.\n\nWhat he actually needs:\n1. Gait and vestibular therapy, 5x a week.\n2. Neuro-psych follow-up (memory of 08/20/94 incomplete).\n3. Shoulder: no contact sport, no lifting over 20 lb, 6 months.',
          'Done properly:\nBeacon Street Institute, Boston.\nResidential neuro-rehabilitation, 18 months, specialists daily.\nEst. $84,000.\n\nFunding: none identified.'] },
      ev_earl_testimony: { title: "Earl's account", kind: 'recording', date: 'November 1996',
        text: "Earl Dunning, forty years a Calder Foundry rigger: the Foundry closed in March 1992. The gates were chained; the bank's men took the copper out that summer and nobody went in after. No beam came down on anybody in August 1994.",
        proves: 'The accident story is impossible.' },
    },
    memories: {
      mem_waistband: { title: 'Hold still', when: 'August 1994',
        text: "Umma at the kitchen table with the blue trunks across her knees, re-stitching the waistband. 'Ya. Hold still.' The needle, the thread bitten off with her teeth. Two seconds. Gone." },
    },
    people: {
      hana: { notes: [
        { id: 'c01_met', text: 'Rehabilitation therapist. Trusts the chart. Kneels to eye level.' },
        { id: 'c01_notebook', text: 'Wrote down that I said I was a boxer. In her own notebook, not the chart.' },
        { id: 'c01_chart', text: "Typed my false face sheet in February '95, from a page Pike handed her. 'I'm on the side of the chart being true.'" },
        { id: 'c01_winded', text: "'When your shoulders go up like that, you stop. Not when you feel like stopping. Before.'" },
        { id: 'c01_thursday', text: 'Called the Athletic Commission and my old number. Got called in by Sister Margaret for it.' },
        { id: 'c01_records', text: 'Found the originals with me. Copied every page. Then went back to being very normal.' },
        { id: 'c01_alone', text: "I went down alone. She still said Thursday. She copied it anyway." },
        { id: 'c01_voluntary', text: "Read my admission paperwork front to back: no court order, no guardianship. 'The Fund pays the bill. It doesn't own you.'" },
        { id: 'c01_homework', text: "'Training isn't the plan. It's the homework.'" },
        { id: 'c01_loan', text: 'Lent me twenty dollars for the bus. She is keeping a list.' },
        { id: 'c01_card', text: 'Gave me her card: ext. 214, before 7 or after 9. And the YMCA on Front Street: tell Otis she sent me.' },
      ] },
      pike: { notes: [
        { id: 'c01_met', text: "Calder Foundry Relief Fund. 'Confusion is very normal.' Never takes his coat off." },
        { id: 'c01_card', text: '88 Market Street, 2nd floor. P.O. Box 1180.' },
        { id: 'c01_pass', text: 'Signed me a courtyard pass when I said "Daniel".' },
        { id: 'c01_card_taped', text: 'Taped a card on the patient payphone: calls via CFRF liaison.' },
        { id: 'c01_ama', text: 'Came to move me to Millbrook. I signed myself out first.' },
      ] },
      earl: { notes: [
        { id: 'c01_met', text: 'Room 214, the other bed. Emphysema, a transistor radio, the Sunday crossword.' },
        { id: 'c01_foundry', text: "Rigged steel at Calder Foundry forty years. 'Nobody went in after.'" },
        { id: 'c01_sorry', text: 'Called me Jin. Apologised for what he said at the TV.' },
        { id: 'c01_radio', text: 'Gave me his radio. Off to his daughter in Florida.' },
        { id: 'c01_five', text: 'Gave me five dollars for the bus.' },
      ] },
      dolores: { notes: [
        { id: 'c01_met', text: 'Nurse on 2 West. Refills the peppermints. Cheers for small things.' },
        { id: 'c01_calls', text: "'Your Fund says calls go through them, honey. I'm sorry. I'm really sorry.'" },
        { id: 'c01_memo', text: 'Left the sponsor binder open so I would read the transfer memo.' },
      ] },
      whitlow: { notes: [
        { id: 'c01_met', text: "Attending physiatrist. 'Your recovery is real. It is also slow.'" },
        { id: 'c01_note', text: "Wrote down what I actually need: $84,000 and eighteen months. Called me Jin." },
      ] },
      sister_margaret: { notes: [
        { id: 'c01_beds', text: "Administrator. 'Twelve beds, Hana. Twelve people who'd be somewhere worse.' Afraid of an empty wing." },
      ] },
    },
    scenes, dialogs,
    mapNodes: P.nodes({ map_hillcrest: { locs: ['stagnes_room214', 'stagnes_2west', 'stagnes_gym', 'stagnes_courtyard', 'stagnes_records', 'stagnes_lobby'], travel: false } }),
    canon: {
      flags: { ch1_told_hana_boxing: true, ch1_pike_stance: 'insisted', ch1_records_route: 'with_hana', ch1_fare_source: 'hana_loan', ch1_signed_name: 'seo_jin',
        ch1_complete: true, base: 'stagnes_room214', c01_hana_card: true, c01_radio: true, c01_name_card: true },
      rel: { hana: 3 },
      money: 19,
      evidence: ['ev_name_card', 'ev_pike_card', 'ev_current_file', 'ev_transfer_form', 'ev_intake_whiteout', 'ev_property_tag', 'ev_whitlow_note', 'ev_earl_testimony'],
      memories: ['mem_waistband'],
      people: ['hana', 'pike', 'earl', 'dolores', 'whitlow', 'sister_margaret'],
      quests: { q1_main: 'done', q1_crossword: 'done', q1_calls: 'done' },
      train: { balance: 1 },
      visited: ['stagnes_room214', 'stagnes_2west', 'stagnes_gym', 'stagnes_courtyard', 'stagnes_records', 'stagnes_lobby'],
    },
    summary: (G) => {
      const out = ['Someone is still controlling his life.'];
      out.push(fv(G, 'ch1_signed_name') === 'seo_jin' ? 'He signed his own name on the way out.' : 'He signed Daniel Ahn on the way out. The name is still in his pocket.');
      out.push(fv(G, 'ch1_records_route') === 'with_hana' ? 'He waited for Thursday. Hana found the originals with him.' : 'He went down alone at night. Hana still said Thursday.');
      const f = fv(G, 'ch1_fare_source');
      out.push(f === 'hana_loan' ? 'Bus fare: twenty dollars from Hana. She is keeping a list.' : f === 'earl_gift' ? 'Bus fare: five dollars from Earl.' : f === 'activities_jar' ? 'Bus fare: the day room\'s bingo jar.' : 'Bus fare: somehow.');
      out.push('What it would take: $84,000.');
      return out;
    },
  });
})(window.STORY);
