/* Story Mode — chapters/c02.js — Chapter 2, No One Waiting (BIBLE ch02; ref-story.pdf Chapter 2).
   Wednesday, December 18, 1996. Jin gets off the 14 on Kessler Avenue, finds 3B belongs to the Novaks, hears from
   Mrs. Okafor what happened to Umma and Min, is given room to breathe (sit spots, dusk falling lamp by lamp), finds
   Teddy in the back room of Iron Pulse after nine (the haircut, the box), and on the way to the YMCA through Pratt
   Alley meets Pike's collectors and the gray van: the first street fight, the knuckles, Benny naming Lenny Voss.
   Room 312 ends it: "Find the man who was supposed to protect you."

   Places: c02_bus (the 14, opening vignette), kessler_ave_1996, kessler_412_stairs_1996, c02_3b_doorway (3B seen from
   the door), okafor_3a, sunnys, iron_pulse, iron_pulse_backroom, pratt_alley (+ the 412 roof), ymca_312.
   Time of day lives in G.flags.c02_phase: 'day' (3 PM) -> 'dusk' (first sit after the news, or walking) -> 'night'
   (after nine). Chapter-local systems (notes/c02.md): one dash charge, the winded state, the knuckles drop and
   pickup inside E2.1, the self-hiding objective after Mrs. Okafor. */
(function (S) {
  'use strict';

  const N = 2, P = S.places;
  const KX = P.spots.kesslerAve, ST4 = P.spots.kessler412Stairs, OKX = P.spots.okafor3a, SUN = P.spots.sunnys;
  const IP = P.spots.ironPulse, IPB = P.spots.ironPulseBackroom, YM = P.spots.ymca312;

  const flag = (G, k) => !!(G && G.flags && G.flags[k]);
  const fv = (G, k) => (G && G.flags ? G.flags[k] : undefined);
  const phase = (G) => fv(G, 'c02_phase') || 'day';
  // q2_main progress: the active step, 99 when done, -1 before it starts.
  const qstep = (G) => { const q = G && G.quests && G.quests.q2_main; return !q ? -1 : q.state === 'done' ? 99 : q.step | 0; };
  const jin = () => (S.world ? S.world.jin : null);
  const seated = () => { const j = jin(); return !!(j && j.poseHold); };
  const here = () => (S.world ? S.world.locId : null);
  const npc = (id, o) => S.castNpc(id, Object.assign({ chapter: N }, o));
  // A thin letterbox (the player still walks): the director tweens any S.fx field; A.letterbox only does full.
  const THIN = ['letter', 'box'].join('');

  // Seven lamps from the bus stop to 412 light one by one at dusk; three more toward the river.
  const LAMPS = [100, 286, 432, 592, 744, 1036, 1180, 1452, 1700, 2100];
  // Pratt Alley (1600 x 560, two layers): ground 500, the 412 roof at 260.
  const PA = { w: 1600, h: 560, g: 500, sunDoor: 204, augie: 184, dumpA: 330, dumpB: 392, vent: 520, bld0: 690, bld1: 1160,
    ladder: 820, feX: 846, feW: 104, landA: 430, landB: 360, roof: 260, tank: 1000, chairs: 1094, pool: 955, benny: 1006,
    dumpC: 1044, bay: 1300, tomas: 1356, truck: 1530, van: 1452, arena0: 600, arena1: 1290 };

  /* ── Looks: Jin grows out his hair in St. Agnes; Teddy gives the two-block back in three steps ── */
  (function looks() {
    const base = S.looks && S.looks.jin_street;
    if (!base) return;
    const withHair = (style) => Object.assign({}, base, { hair: Object.assign({}, base.hair || {}, { style }) });
    S.defineLook('c02_jin_grown', withHair('shaggy'));
    S.defineLook('c02_jin_cut1', withHair('long'));
    S.defineLook('c02_jin_cut2', withHair('short'));
    // The laundry woman on the fire escape (a bystander, no name).
    S.defineLook('c02_laundry', { h: 42, build: 'avg', skin: '#c99a76', hair: { style: 'bun', color: '#3a2a22' },
      top: { kind: 'cardigan', color: '#6a5a6e', color2: '#c9c1ad' }, bottom: { kind: 'long_skirt', color: '#3a3a46' }, shoes: '#2a2626' });
  })();

  /* ── The objective hides itself after Mrs. Okafor (bible 2.2/2.3) ─────────────────────────────
     For 90 s (or until Jin leaves a sit spot) the HUD line is blank; target and autoplay stay. */
  (function wrapObjective() {
    const D = S.director;
    if (!D || typeof D.objective !== 'function' || D.objective.__c02) return;
    const orig = D.objective;
    const wrapped = function () {
      const o = orig.apply(this, arguments);
      const G = S.G;
      if (o && G && G.chapter === N && !D.objectiveOverride) {
        const t = G.flags && G.flags.c02_hud_off;
        if (typeof t === 'number') { const dt = S.time - t; if (dt >= 0 && dt < 90) return Object.assign({}, o, { text: '' }); }
      }
      return o;
    };
    wrapped.__c02 = true;
    D.objective = wrapped;
  })();

  /* ── Locations ───────────────────────────────────────────────────── */

  // The 14, sliding along Front Street toward Eastgate.
  const bus = {
    name: 'The 14 — Kessler–Civic Ctr', area: 'Eastgate', kind: 'interior', w: 640, h: 360, ground: 300, map: 'map_eastgate',
    room: { wall: '#4a5450', wall2: '#343a38', floor: '#3a3a3e', pattern: 'paneling', floorPattern: 'concrete', ceiling: 118, trim: '#7a827a', wainscot: 76 },
    ambient: { dark: 0.3, tint: '#2a3446', fog: 0.04 }, sound: { loop: 'traffic', vol: 0.35 },
    camera: { zoom: 1 },
    layers: {
      back: [
        { t: 'window_city', x: 40, y: 150, w: 120, h: 62, view: 'skyline' },
        { t: 'window_city', x: 182, y: 150, w: 120, h: 62, view: 'skyline' },
        { t: 'window_city', x: 324, y: 150, w: 120, h: 62, view: 'river' },
        { t: 'window_city', x: 466, y: 150, w: 120, h: 62, view: 'skyline' },
        { t: 'sign', x: 250, y: 128, text: '14  KESSLER - CIVIC CTR', color: '#1e2426', textColor: '#e8b35a', w: 126 },
        { t: 'notice', x: 560, y: 226, lines: ['SERVICE', 'REDUCED', 'LAST BUS', '10:50 PM'] },
        { t: 'chair', x: 96, kind: 'plastic', face: 1 }, { t: 'chair', x: 196, kind: 'plastic', face: 1 },
        { t: 'chair', x: 330, kind: 'plastic', face: 1 }, { t: 'chair', x: 430, kind: 'plastic', face: 1 },
        { t: 'ceiling_light', x: 180, kind: 'fluorescent' }, { t: 'ceiling_light', x: 460, kind: 'fluorescent', flicker: 0.2 },
      ],
    },
    points: { start: { x: 330, y: 300 } },
  };

  // Kessler Avenue in December: built-in street (places.js) + this chapter's lamps, posters, van and objects.
  function kessler(G) {
    const ph = phase(G);
    const time = ph === 'day' ? 'overcast' : ph === 'dusk' ? 'dusk' : 'night';
    const vanOn = (g) => { const s = fv(g, 'ch1_pike_stance'); return s === 'insisted' || (s === 'played_along' && phase(g) !== 'day'); };
    const peel = (g) => fv(g, 'c02_peel') | 0;
    const lamps = [];
    LAMPS.forEach((x, i) => {
      const lit = (g) => phase(g) === 'night' || flag(g, 'c02_lamp_' + i);
      lamps.push({ t: 'streetlight', x, on: false, c02: true, when: (g) => !lit(g) });
      lamps.push({ t: 'streetlight', x, on: true, c02: true, flicker: i === 8 ? 0.35 : 0, when: lit });
    });
    const PW = KX.posterWall;
    return P.kesslerAve({
      year: 1996, time, season: 'winter', van: false, poster: 'layers',
      weather: ph === 'day' ? 'drizzle' : 'snow', weatherAmount: ph === 'night' ? 0.75 : 0.5,
      sound: { loop: ph === 'night' ? 'wind' : 'city', vol: 0.4 },
      drop: ['kes_poster_layers'],
      layers: {
        back: lamps.concat([
          // The poster wall, four deep: his 1994 poster under three newer ones (peeled top first).
          { t: 'poster', id: 'c02_p_fight', x: PW, y: 218, w: 24, h: 32, kind: 'jin_fight', torn: true },
          { t: 'poster', id: 'c02_p_l3', x: PW, y: 218, w: 26, h: 33, kind: 'ad', text: 'ASHGROVE', when: (g) => peel(g) < 3 },
          { t: 'poster', id: 'c02_p_l2', x: PW + 1, y: 217, w: 26, h: 33, kind: 'concert', text: 'RUST BELT', torn: true, when: (g) => peel(g) < 2 },
          { t: 'poster', id: 'c02_p_l1', x: PW - 1, y: 216, w: 27, h: 34, kind: 'ad', text: 'IRON PULSE', torn: true, when: (g) => peel(g) < 1 },
          // Min's MISSING flyer, sun-faded, in the lower corner of Sunny's window.
          { t: 'flyer', id: 'c02_flyer', x: 597, y: 262, text: 'MISSING' },
        ]),
        front: [
          { t: 'car', id: 'c02_kes_van', x: KX.van, kind: 'van', color: '#5e6266', face: 1, on: ph !== 'day', when: vanOn },
        ],
      },
      // Every built-in lamp goes; this chapter's lamps carry c02:true.
      edit: (L) => { L.layers.back = L.layers.back.filter((p) => !(p && p.t === 'streetlight' && !p.c02)); return L; },
      npcs: [{ id: 'kettle', when: (g) => phase(g) !== 'night',
        barks: ['Merry Christmas.', 'Anything helps. God bless.', 'Cold one, huh?'] }],
      objects: [
        { id: 'i2_bus_bench', x: KX.busStop + 10, label: 'Bus shelter bench', verb: 'Sit', run: 'c02_sit_bench' },
        { id: 'c02_kes_phone', x: KX.payphone, label: 'Payphone', verb: 'Use', run: 'c02_phone' },
        { id: 'i2_poster_wall', x: PW, label: 'Poster wall', verb: 'Peel', run: 'c02_posters', when: (g) => peel(g) < 3 },
        { id: 'c02_poster_1994', x: PW, label: 'The 1994 poster', verb: 'Look', run: 'c02_poster_look', when: (g) => peel(g) >= 3 },
        { id: 'c02_hans_window', x: KX.hans + 92, label: "Han's window", verb: 'Look',
          text: ['A clean rectangle on the glass. The tape marks are still there at the corners.', 'GO JIN! was right here. Mr. Han put it up himself.'] },
        { id: 'i2_flyer', x: 597, label: 'MISSING flyer', verb: 'Read', run: 'c02_flyer' },
        { id: 'c02_stoop', x: KX.stoop - 14, label: '412 stoop', verb: 'Sit', run: 'c02_sit_stoop' },
        { id: 'c02_buzzer', x: KX.door412 + 22, label: 'Buzzer panel', verb: 'Read',
          text: ['3B — NOVAK. On a label-maker strip.', "Somebody else's name in our slot."] },
        { id: 'c02_lawnchair', x: KX.lawnChair + 6, label: 'Lawn chair', verb: 'Look',
          text: (g) => (flag(g, 'c02_okafor_done')
            ? ['Mrs. Okafor\'s lawn chair. Folded. Chained to the railing.', 'The coffee can by the door holds snow. Umma\'s geraniums were in that can.']
            : ['A lawn chair, folded and chained to the railing. Mrs. Okafor sat out here every summer.', 'The geranium can by the door holds nothing but snow.']) },
        { id: 'c02_old_glove', x: KX.gym + 362, label: 'Old sign', verb: 'Look',
          text: ['The glove Teddy had painted up there is coming through the white.', 'They didn\'t use enough coats.'] },
        { id: 'c02_snowcar', x: KX.wagon, label: 'Snowed-in sedan', verb: 'Look',
          text: ['A sedan under a foot of snow.', 'Teddy\'s wagon used to sit right here. Maroon. Fake wood on the doors.'] },
        { id: 'c02_kes_van_obj', x: KX.van, label: 'Gray van', verb: 'Look', when: vanOn,
          text: ['A gray panel van. The engine\'s running. The wipers go every six seconds.', 'Nobody gets out.'] },
      ],
      triggers: [
        { id: 'c02_trig_bells', x0: KX.kettle - 40, x1: KX.kettle + 40, run: 'c02_bells', when: (g) => phase(g) !== 'night' },
      ],
      door: {
        kes_alley: { tx: 40, face: 1 },
        kes_gym: { locked: (g) => (phase(g) === 'night' ? "Closed. It's after nine. There's a side door." : false) },
        kes_gym_side: { label: 'Side door — STAFF',
          locked: (g) => (phase(g) === 'night' ? false : flag(g, 'c02_saw_teddy') ? 'Locked. He stays after nine.' : 'STAFF. Locked.') },
        kes_right: { locked: (g) => (flag(g, 'c02_alley_done') ? false : "Through the alley's quicker.") },
      },
      enter: 'c02_kes_enter',
    });
  }

  function stairs412() {
    return P.kessler412Stairs({
      year: 1996,
      door: {
        st4_3b: { run: 'c02_3b_knock', verb: 'Knock', label: '3B' },
        st4_3a: { locked: (g) => (flag(g, 'c02_okafor_met') ? false : "3A. Mrs. Okafor's. Home first.") },
      },
      objects: [
        { id: 'i2_mailbox', x: ST4.mailbox, y: ST4.lobbyY, label: 'Mailbox 3B', verb: 'Read',
          text: ['NOVAK, on a label-maker strip.', 'Under the sticker, Min\'s writing. NO MENUS PLEASE.'] },
        { id: 'c02_mitten', x: ST4.mitten, y: ST4.l2Y, label: 'Mitten', verb: 'Look',
          text: ['A kid\'s mitten on the landing. Red, with a snowflake.', 'Somebody\'ll come back down for it.'] },
      ],
      triggers: [
        { id: 'c02_trig_okafor', x0: 60, x1: 246, y0: ST4.l3Y - 60, y1: ST4.l3Y + 4, run: 'c02_okafor_meet',
          when: (g) => qstep(g) === 1 && !flag(g, 'c02_okafor_met') },
      ],
    });
  }

  // 3B from the doorway: yellow walls, a high chair where the table was, the same window (camera over his shoulder).
  const doorway3b = {
    name: '412 Kessler — 3B', area: 'Eastgate', kind: 'interior', w: 640, h: 360, ground: 300, map: 'map_eastgate',
    room: { wall: '#b8a25a', wall2: '#9a8648', floor: '#6a5a46', pattern: 'plaster', floorPattern: 'wood', ceiling: 64, trim: '#e2d8bc', wainscot: 30 },
    ambient: { dark: 0.16, tint: '#3a3426', fog: 0.02 }, sound: { loop: 'room', vol: 0.25 },
    camera: { zoom: 1.4 },
    layers: {
      back: [
        { t: 'counter', x: 40, w: 90 }, { t: 'sink', x: 70 }, { t: 'stove', x: 150 }, { t: 'fridge', x: 196 },
        { t: 'window', x: 262, y: 118, w: 62, h: 70, lit: false, curtains: true },
        { t: 'chair', x: 360, kind: 'stool', face: 1 },
        { t: 'picture', x: 420, y: 140, w: 14, h: 10, kind: 'photo' }, { t: 'picture', x: 440, y: 152, w: 10, h: 8, kind: 'calendar' },
        { t: 'rug', x: 330, w: 120, color: '#7a4a3a' },
        { t: 'boxes', x: 470, n: 1, label: 'XMAS' },
        { t: 'door', x: 604, kind: 'wood', color: '#5a4030', open: true, label: '3B' },
        { t: 'ceiling_light', x: 300, kind: 'pendant' },
      ],
    },
    solids: [{ x: 548, y: 0, w: 8, h: 300 }],     // the threshold: Jin stays in the doorway's 60 px
    doors: [{ id: 'c02_3b_out', x: 626, label: 'The landing', verb: 'Step back', kind: 'door', run: 'c02_3b_leave' }],
    objects: [
      { id: 'i2_height_marks', x: 592, label: 'Doorframe', verb: 'Examine', run: 'c02_height_marks', when: (g) => !flag(g, 'ch2_saw_height_marks') },
      { id: 'i2_3b_doorway', x: 566, label: 'The kitchen', verb: 'Look', text: ['Yellow walls. A high chair where the table was.', 'Same window. Different everything.'] },
    ],
    npcs: [
      npc('petra', { x: 512, face: 1, pose: 'armsCrossed' }),
      npc('rosie', { x: 494, face: 1, pose: 'idle', barks: ['Is he Santa?'] }),
    ],
    points: { start: { x: 604, y: 300 } },
  };

  function okafor3a(G) {
    const ph = phase(G);
    return P.okafor3a({
      year: 1996, time: ph === 'day' ? 'day' : ph === 'dusk' ? 'dusk' : 'night',
      sound: { loop: 'room', vol: 0.3 },
      npcs: [{ id: 'okafor', talk: 'c02_okafor_talk', marker: (g) => (flag(g, 'c02_okafor_done') && !flag(g, 'c02_okafor_again') ? '…' : null) }],
      objects: [
        { id: 'c02_photo_supper', x: OKX.photoUmma, label: 'Church supper photo', verb: 'Look', run: 'c02_photo_supper' },
        { id: 'i2_okafor_photo', x: OKX.photoWalkout + 8, label: 'Framed photo', verb: 'Look', run: 'c02_photo_walkout' },
        { id: 'c02_radiator', x: OKX.radiator, label: 'Radiator', verb: 'Listen', text: ['It clanks. Every radiator in this building clanks.', 'Umma used to bang ours back with a spoon.'] },
      ],
    });
  }

  function sunnys(G) {
    const ph = phase(G);
    return P.sunnys({
      year: 1996, tv: 'boxing', time: ph === 'day' ? 'day' : ph === 'dusk' ? 'dusk' : 'night',
      npcs: [
        { id: 'rita', talk: 'c02_rita', barks: ["Pie's from yesterday. Still pie.", 'Sit anywhere, hon.'] },
        { id: 'augie', when: (g) => phase(g) !== 'night', barks: ['Order up.', 'Behind!', 'Who ordered the patty melt?'] },
      ],
      objects: [
        { id: 'i2_booth', x: SUN.booth, label: 'Booth by the window', verb: 'Sit', run: 'c02_sit_booth' },
        { id: 'c02_sun_tv', x: SUN.tv + 54, label: 'TV', verb: 'Watch', run: 'c02_tv' },
      ],
      firstEnter: 'c02_sunnys_bell',
    });
  }

  function ironPulse(G) {
    const night = phase(G) === 'night';
    const npcs = [];
    if (!night) {
      npcs.push(npc('teddy', { x: IP.teddyMop, face: -1, pose: 'sweep', talk: 'c02_teddy_mop',
        marker: (g) => (qstep(g) === 2 ? '…' : null), barks: ['We close at nine.'], barkRadius: 50 }));
      npcs.push({ id: 'receptionist', talk: 'c02_receptionist' });
    }
    return P.ironPulse({
      after9: night,
      npcs,
      objects: [
        { id: 'i2_ring_floor', x: IP.ring + 40, label: 'Bright floorboards', verb: 'Look',
          text: ['Sixteen by sixteen. That\'s where the ring was.', 'They sanded around it.'] },
        { id: 'i2_old_paint', x: IP.oldPaint + 74, label: 'Old paint', verb: 'Look',
          text: ['HANDS UP / CHIN. Teddy painted that in \'79.', 'He said the third part didn\'t need a sign.'] },
      ],
      door: {
        ip_staff: { locked: (g) => (phase(g) === 'night' ? false : 'Staff only. The girl at the desk is watching.') },
      },
    });
  }

  function backroom(G) {
    const night = phase(G) === 'night';
    return P.ironPulseBackroom({
      time: night ? 'night' : 'dusk', training: null,
      layers: { back: [{ t: 'bucket', id: 'c02_bucket', x: IPB.mirror - 12 }] },
      npcs: night ? [npc('teddy', { x: IPB.cot, face: 1, pose: 'sit', talk: 'c02_teddy_after',
        marker: (g) => (flag(g, 'c02_teddy_done') ? null : '…') })] : [],
      objects: [
        { id: 'c02_bag', x: IPB.bag, label: 'Heavy bag', verb: 'Hit', text: ['The bag on the pipe. Teddy kept one.', 'Not tonight. A bed first.'] },
        { id: 'i2_taping_bench', x: IPB.bench, label: 'Taping bench', verb: 'Sit', run: 'c02_taping_bench', when: (g) => flag(g, 'c02_teddy_done') },
        { id: 'i2_seo_box', x: IPB.box, label: 'Box: SEO — DON\'T TOSS', verb: 'Open', run: 'c02_seo_box', when: (g) => flag(g, 'c02_teddy_done') },
      ],
      enter: 'c02_backroom_enter',
    });
  }

  // Pratt Alley and the 412 roof: the art-reference shot under one streetlight.
  function prattAlley(G) {
    const ph = phase(G);
    const lit = ph !== 'day';
    const L = {
      name: 'Pratt Alley', area: 'Eastgate', kind: 'exterior', w: PA.w, h: PA.h, ground: PA.g, map: 'map_eastgate',
      sky: ph === 'day' ? 'overcast' : ph === 'dusk' ? 'dusk' : 'night', backdrop: 'skyline',
      weather: ph === 'day' ? 'drizzle' : 'snow', weatherAmount: ph === 'night' ? 0.85 : 0.55, wet: true, groundStyle: 'alley',
      ambient: { dark: ph === 'day' ? 0.3 : ph === 'dusk' ? 0.48 : 0.6, tint: ph === 'night' ? '#1a2238' : '#26304a', fog: 0.08 },
      sound: { loop: 'wind', vol: 0.35 },
      camera: { zoom: 1 },
      layers: {
        far: [
          { t: 'smokestack', x: 260, h: 150 },
          { t: 'building', x: 1060, w: 46, h: 280, style: 'concrete', floors: 12, windows: { cols: 2, lit: 0.75, seed: 77 }, cornice: false, y: PA.g },
          { t: 'bridge', x: 1300, w: 600 },
        ],
        mid: [{ t: 'wires', x0: 0, x1: PA.w, y: 150, sag: 20 }],
        back: [
          // Sunny's and Han's backs, the laundromat with its dryer vent.
          { t: 'building', x: -10, w: 250, h: 210, style: 'brick_red', floors: 3, windows: { cols: 4, lit: lit ? 0.5 : 0.2, seed: 61 }, cornice: true },
          { t: 'door', x: PA.sunDoor, kind: 'metal', color: '#4a4440', label: "SUNNY'S" },
          { t: 'lamp', x: PA.sunDoor, y: PA.g - 62, kind: 'bulb', on: true },
          { t: 'crates', x: PA.augie - 10, n: 1, stack: 1 },
          { t: 'building', x: 240, w: 450, h: 200, style: 'brick', floors: 3, windows: { cols: 7, lit: lit ? 0.45 : 0.15, seed: 62 }, cornice: true },
          { t: 'dumpster', x: PA.dumpA, color: '#4f5a48' }, { t: 'dumpster', x: PA.dumpB, color: '#46524a' },
          { t: 'trashbags', x: 440, n: 3 },
          { t: 'pipes', x: PA.vent - 18, w: 36, y: PA.g - 74 },
          { t: 'sign', x: PA.vent - 20, y: PA.g - 92, text: 'SUDS-N-DUDS', color: '#3a4a5a', w: 54 },
          // The 412 back wall, its fire escape, the roof (a walkable level), the wall with torn posters.
          { t: 'building', id: 'c02_412_back', x: PA.bld0, w: PA.bld1 - PA.bld0, h: PA.g - PA.roof, style: 'brick', floors: 4,
            windows: { cols: 8, lit: lit ? 0.4 : 0.12, seed: 63 }, cornice: true },
          { t: 'fireescape', x: PA.feX, w: PA.feW, y: PA.landB, floors: 2, floorH: PA.landA - PA.landB, drop: false },
          { t: 'laundry_line', x0: PA.feX + 6, x1: PA.feX + PA.feW - 6, y: PA.landB + 26 },
          { t: 'poster', x: 900, y: PA.g - 74, kind: 'boxing', torn: true }, { t: 'poster', x: 922, y: PA.g - 70, kind: 'concert', torn: true },
          { t: 'poster', x: 986, y: PA.g - 76, kind: 'notice', torn: true }, { t: 'poster', x: 1008, y: PA.g - 72, kind: 'ad', torn: true },
          { t: 'graffiti', x: 1110, y: PA.g - 62, w: 44 },
          { t: 'streetlight', id: 'c02_pa_lamp_off', x: PA.pool, on: false, when: () => !lit },
          { t: 'streetlight', id: 'c02_pa_lamp', x: PA.pool, on: true, when: () => lit },
          { t: 'dumpster', x: PA.dumpC, color: '#3f5246' },
          // Roof: tank, antennas, two lawn chairs at the parapet facing the skyline.
          { t: 'water_tank', x: PA.tank, y: PA.roof },
          { t: 'pole', x: 760, y: PA.roof, h: 34 }, { t: 'pole', x: 1140, y: PA.roof, h: 28 },
          { t: 'chair', x: PA.chairs - 8, y: PA.roof, kind: 'folding', face: 1 }, { t: 'chair', x: PA.chairs + 12, y: PA.roof, kind: 'folding', face: 1 },
          // Han's delivery bay and the far mouth to Front Street.
          { t: 'building', x: PA.bld1, w: 460, h: 220, style: 'brick_dark', floors: 3, windows: { cols: 6, lit: lit ? 0.35 : 0.1, seed: 64 }, cornice: true },
          { t: 'loading_dock', x: PA.bay - 10, w: 120 },
          { t: 'sign', x: PA.bay + 8, y: PA.g - 96, text: "HAN'S — DELIVERIES", color: '#3f5a3a', w: 80 },
          { t: 'lamp', x: PA.bay + 50, y: PA.g - 70, kind: 'bulb', on: true },
          { t: 'crates', x: PA.bay + 74, n: 4, stack: 2 }, { t: 'pallet', x: PA.bay + 130, n: 2 },
        ],
        front: [
          { t: 'car', id: 'c02_hans_truck', x: PA.truck, kind: 'van', color: '#d8d2c2', text: "HAN'S", face: -1, when: (g) => !flag(g, 'c02_van_came') },
          { t: 'puddle', x: 700, w: 60 }, { t: 'puddle', x: 1180, w: 70 },
        ],
      },
      solids: [
        { x: PA.bld0, y: PA.roof, w: PA.bld1 - PA.bld0, oneway: true },
        { x: PA.feX, y: PA.landA, w: PA.feW, oneway: true }, { x: PA.feX, y: PA.landB, w: PA.feW, oneway: true },
      ],
      ladders: [], doors: [], npcs: [], objects: [], triggers: [], lights: [],
      points: { start: { x: 40, y: PA.g }, cone: { x: PA.pool, y: PA.g }, roof: { x: 900, y: PA.roof } },
      enter: 'c02_alley_enter',
    };
    const fe = P.ladder({ id: 'c02_fe', x: PA.ladder, top: PA.roof, bottom: PA.g, up: 'Fire escape — the roof', down: 'Fire escape — the alley' });
    L.ladders.push(...fe.ladders); L.doors.push(...fe.doors);
    L.doors.push(
      { id: 'c02_pa_kes', x: 0, side: 'left', kind: 'edge', auto: true, label: 'Kessler Avenue', to: 'kessler_ave_1996', tx: KX.alley + 18, face: 1 },
      { id: 'c02_pa_front', x: PA.w, side: 'right', kind: 'edge', auto: true, label: 'Front Street — YMCA', to: 'ymca_312', tx: 50, face: 1,
        locked: (g) => (flag(g, 'c02_alley_done') ? false : flag(g, 'c02_van_came') ? 'Not while they\'re here.' : "Truck's blocking it. Kessler's the way out.") },
    );
    L.npcs.push(
      npc('augie', { x: PA.augie, face: 1, pose: 'smoke', talk: 'c02_augie_alley',
        when: (g) => phase(g) === 'night' && !flag(g, 'c02_augie_inside'), barks: ['Kitchen closes at ten.', 'Cold enough for you?'] }),
      npc('tomas', { x: PA.tomas, face: -1, pose: 'carry', talk: 'c02_tomas', walkPose: 'carry', loop: true,
        path: [{ x: PA.tomas - 30, wait: 1.2, pose: 'carry' }, { x: PA.tomas + 40, wait: 1.6, pose: 'idle' }],
        barks: (g) => (flag(g, 'c02_van_came') && !flag(g, 'c02_alley_done') ? ['Not my business, man. Not my business.'] : ['Cases go on the left. Left.', 'Twenty more and I\'m done.']) }),
      // Benny after the fight: against the dumpster in the light; questioned, then he walks (let_go) or stays down.
      npc('benny', { x: PA.benny, face: -1, pose: 'sitFloor', talk: 'c02_benny_question', verb: 'Question',
        marker: (g) => (qstep(g) === 6 ? '!' : null), when: (g) => flag(g, 'c02_alley_fought') && !fv(g, 'ch2_collector_after') }),
      { id: 'c02_benny_down', look: 'benny', name: 'Benny', x: PA.benny + 6, face: -1, pose: 'down',
        when: (g) => fv(g, 'ch2_collector_after') === 'hit_again' },
    );
    L.objects.push(
      { id: 'c02_fe_foot', x: PA.ladder - 24, label: 'Fire escape', verb: 'Look', run: 'c02_fe_look' },
      { id: 'i2_tank_ladder', x: PA.tank, y: PA.roof, label: 'Water tank ladder', verb: 'Look',
        text: ['Scratched in the paint: J + M 1989.', 'She did the M. I did the plus sign and got in trouble for both.'] },
      { id: 'i2_roof_chairs', x: PA.chairs, y: PA.roof, label: 'Lawn chair', verb: 'Sit', run: 'c02_sit_roof' },
      { id: 'c02_vent', x: PA.vent, label: 'Dryer vent', verb: 'Look', text: ['Warm air out of the laundromat. It smells like somebody else\'s clean sheets.'] },
    );
    return L;
  }

  function ymca(G) {
    const papers = [];
    const pin = (id, x, y, kind) => papers.push(kind === 'photo'
      ? { t: 'picture', x, y, w: 9, h: 8, kind: 'photo', when: (g) => !!(g.evidence && g.evidence[id]) }
      : { t: 'flyer', x, y, when: (g) => !!(g.evidence && g.evidence[id]) });
    const bx = YM.wall - 40, by = 154;
    // The evidence wall over the cot: one pinned paper per card (Ch1's, then Ch2's).
    [['ev_name_card', 0, 0], ['ev_current_file', 1, 0], ['ev_transfer_form', 2, 0], ['ev_intake_whiteout', 3, 0],
      ['ev_fight_poster', 0, 1, 'photo'], ['ev_missing_flyer', 1, 1], ['ev_returned_letter', 2, 1], ['ev_okafor_account', 3, 1],
      ['ev_pickup_order', 0, 2], ['ev_pike_card', 1, 2], ['ev_earl_testimony', 2, 2], ['ev_property_tag', 3, 2]]
      .forEach(([id, cx, cy, k]) => pin(id, bx + 12 + cx * 20, by + cy * 15, k));
    return P.ymca312({
      time: 'night',
      layers: { back: papers },
      npcs: [{ id: 'otis', talk: 'c02_otis', face: -1 }],
      objects: [
        { id: 'i2_payphone', x: YM.payphone, label: 'Payphone', verb: 'Use', run: 'c02_phone' },
        { id: 'c02_cork', x: YM.cork, label: 'Corkboard', verb: 'Read', text: ['Swim schedule. Lap swim 6 to 8 AM. A card for a guitar teacher.', 'Somebody lost a dog named Biscuit in October.'] },
        { id: 'c02_ev_wall', x: YM.wall - 36, label: 'The wall over the cot', verb: 'Look', run: 'c02_ev_wall' },
        { id: 'c02_cot', x: YM.cot + 14, label: 'Cot', verb: 'Sit', run: 'c02_cot' },
        { id: 'c02_chair', x: YM.chair, label: 'Chair', verb: 'Look', run: 'c02_chair_look' },
        { id: 'i2_window_312', x: YM.window, label: 'Window', verb: 'Look', text: ['The river. That tower again.', 'It\'s in every window in this city.'] },
        { id: 'c02_radio', x: YM.window + 34, label: 'Earl\'s radio', verb: 'Listen', run: 'c02_radio' },
      ],
      door: { ym_front: { locked: () => "It's late. A bed first.", run: 'places_noop' } },
      firstEnter: 'c02_ymca_arrive',
    });
  }

  // Locked map nodes need a location to show Jin's reason; these stand in for places later chapters build
  // (garrison_street, annex, starlite_lot) and are never entered: their nodes stay locked all chapter.
  const farPlace = (name, area, map) => ({ name, area, kind: 'exterior', w: 640, h: 360, ground: 300, map, sky: 'night', backdrop: 'skyline',
    ambient: { dark: 0.5, tint: '#1e2840', fog: 0.06 }, layers: { far: [], mid: [], back: [{ t: 'streetlight', x: 320, on: true }], front: [], fore: [] },
    points: { start: { x: 320, y: 300 } } });

  /* ── Small helpers used by scenes ─────────────────────────────────── */
  function* memIn(A) { A.fx('sepia', 0.75, 0.8); A.fx('vignette', 0.55, 0.8); yield A.wait(0.5); }
  function* memOut(A) { A.fx('sepia', 0, 0.9); A.fx('vignette', 0.25, 0.9); yield A.wait(0.4); }
  // Walk to a spot, sit (the pose holds until the player moves), ease the camera out.
  function* sitAt(A, x, face, o) {
    o = o || {};
    yield A.walk('jin', x, {});
    A.face('jin', face);
    A.pose('jin', o.pose || 'sit', { hold: true });
    const j = jin();
    yield A.cam({ x: o.cx !== undefined ? o.cx : (j ? j.x : x), y: o.cy !== undefined ? o.cy : (j ? j.y - 40 : 260), zoom: o.zoom || 0.85, dur: 1.4 });
  }
  // Stay with him while he sits (camera held); returns when he stands, or after `secs` if given.
  function* stay(A, secs) {
    yield A.waitFor(() => !seated(), secs ? { timeout: secs, autoplay: {} } : { autoplay: {} });
  }
  function hudBack(A) { if (typeof fv(S.G, 'c02_hud_off') === 'number') A.flag('c02_hud_off', false); }
  function silentEvidence(id) {
    const G = S.G;
    if (!G || G.evidence[id]) return;
    G.evidence[id] = { at: N, seen: false };
    if (S.director) S.director.progress = (S.director.progress | 0) + 1;
  }
  function addHarm(A) { A.flag('harm_count', (fv(S.G, 'harm_count') | 0) + 1); }

  // Dusk falls: the camera eased out (cine), the snow starts, the lamps come on one by one from the bus stop to 412.
  function* duskFalls(A, cine) {
    if (phase(S.G) !== 'day') return;
    A.flag('c02_dusk_started');
    const W = S.world, L = W.loc, id = W.locId;
    const street = id === 'kessler_ave_1996', alley = id === 'pratt_alley';
    if (cine) {
      if (street) yield A.cam({ x: 520, y: 196, zoom: 0.8, dur: 1.8 });
      else yield A.cam({ target: 'jin', zoom: 0.8, dur: 1.8 });
    }
    if (L && (street || alley)) { L.sky = 'dusk'; L.weather = 'snow'; }
    const d0 = L && L.ambient ? +L.ambient.dark || 0 : 0;
    const d1 = street ? 0.3 : alley ? 0.48 : Math.min(0.6, d0 + 0.1);
    for (let i = 1; i <= 8; i++) { if (L && W.loc === L) L.ambient.dark = d0 + (d1 - d0) * i / 8; yield A.wait(cine ? 0.3 : 0.6); }
    for (let i = 0; i < 7; i++) {
      A.flag('c02_lamp_' + i, true);
      if (street) { A.sound('buzz', { vol: 0.12 }); yield A.wait(0.4); }
    }
    A.flag('c02_phase', 'dusk');
    if (cine) yield A.wait(street ? 3.4 : 2.4);
    if (W.loc === L) W.refresh();
  }
  // After Teddy has been seen mopping: the booth or the stoop can pass the evening to nine.
  function* offerNine(A, G) {
    if (phase(G) === 'night' || !flag(G, 'c02_okafor_done') || !flag(G, 'c02_saw_teddy') || flag(G, 'c02_teddy_done')) return false;
    const v = yield A.choice('He stays after nine. Teddy always stayed.', [
      { text: 'Wait here until nine.', value: 'wait', autoplay: true },
      { text: 'Not yet.', value: 'later' },
    ], { thought: true, id: 'c02_wait_nine' });
    if (v !== 'wait') return false;
    yield A.fade(1, 1.4);
    A.flag('c02_phase', 'night');
    for (let i = 0; i < LAMPS.length; i++) if (!flag(S.G, 'c02_lamp_' + i)) A.flag('c02_lamp_' + i, true);
    if (S.world) S.world.refresh();
    A.pose('jin', null);
    yield A.card('9:10 PM', 'Kessler Avenue', 2.4);
    A.quest('q2_main', 'step', 4);
    A.follow();
    yield A.fade(0, 1.4);
    yield A.think('Nine. He\'ll be alone in there now.');
    return true;
  }

  /* ── Scenes ───────────────────────────────────────────────────────── */
  const scenes = {
    // 2.1 Arrival: the 14 folds its doors open at Kessler & 5th.
    *c02_start(A, G) {
      A.fx('muffle', 0.55, 0);
      A.sound('bell', { vol: 0.35 });
      A.pose('jin', 'sit', { hold: true });
      A.face('jin', 1);
      yield A.letterbox(true, 0);
      yield A.cam({ x: 330, y: 250, zoom: 1.25, dur: 0 });
      yield A.wait(1.6);
      A.fx('muffle', 0, 2.5);
      yield A.cam({ x: 300, y: 248, zoom: 1.18, dur: 4.5, ease: 'inOut' });
      yield A.think('Two years of hospital windows. Now a bus window.');
      yield A.wait(0.8);
      yield A.say(null, '"Kessler and Fifth."');
      A.sound('vanDoor', { vol: 0.6 });
      yield A.wait(0.6);
      yield A.fade(1, 0.8);
      A.pose('jin', null);
      A.quest('q2_main', 'start');
      A.quest('q2_call_hana', 'start');
      yield A.goto('kessler_ave_1996', KX.busStop + 40, { face: 1, fade: false });
      // The street running both ways into sleet; Jin small at the stop, easing to 1.0 as he walks.
      const L = S.world.loc;
      if (L && L.camera) L.camera.zoom = 0.85;
      A.follow();
      if (S.cam && S.cam.snap) S.cam.zoom = 0.85, S.cam.snap();
      A.sound('vanDoor', { vol: 0.4 });
      yield A.letterbox(false, 0.4);
      yield A.fade(0, 1.4);
      yield A.think('Same street. Somebody moved all the furniture.');
      A.checkpoint('Kessler Avenue');
      A.parallel('c02_zoom_ease');
    },
    // Background: Kessler's zoom eases 0.85 -> 1.0 over six seconds of walking.
    *c02_zoom_ease(A) {
      const L = S.world && S.world.loc;
      if (!L || !L.camera) return;
      for (let i = 1; i <= 30; i++) {
        yield A.wait(0.2);
        if (S.world.loc !== L) return;
        L.camera.zoom = 0.85 + 0.15 * (i / 30);
        if (S.cam && S.cam.mode === 'follow') A.follow();
      }
      L.camera.zoom = 1;
    },
    *c02_kes_enter(A, G) {
      if (flag(G, 'c02_dish_pending')) {
        A.flag('c02_dish_pending', false);
        if (S.combat && S.combat.carry) S.combat.carry(null);
        A.evidence('bel_dish');
        yield A.think('Her dish. I don\'t know where to put it down, so I don\'t.');
      }
      if (flag(G, 'c02_okafor_done') && phase(G) === 'day' && !flag(G, 'c02_dusk_walk')) {
        A.flag('c02_dusk_walk');
        A.parallel('c02_dusk_walk');
      }
    },
    // If he never sits, dusk still falls as he walks (lamps light as he passes: see the step hook).
    *c02_dusk_walk(A) {
      let t = 0;
      while (t < 45) {
        yield A.wait(1);
        if (phase(S.G) !== 'day' || flag(S.G, 'c02_dusk_started')) return;
        const id = here();
        if (id === 'kessler_ave_1996' || id === 'pratt_alley') t += 1;
      }
      if (phase(S.G) !== 'day') return;
      A.flag('c02_dusk_started');
      const W = S.world, L = W.loc, id = W.locId;
      const ext = id === 'kessler_ave_1996' || id === 'pratt_alley';
      if (ext && L) {
        L.sky = 'dusk'; L.weather = 'snow';
        const d0 = +L.ambient.dark || 0, d1 = id === 'pratt_alley' ? 0.48 : 0.3;
        for (let i = 1; i <= 12; i++) { if (W.loc !== L) break; L.ambient.dark = d0 + (d1 - d0) * i / 12; yield A.wait(0.5); }
      }
      A.flag('c02_phase', 'dusk');
      if (W.loc === L) W.refresh();
    },
    *c02_bells(A) {
      A.sound('bell', { vol: 0.18 });
      A.bark('jin', 'Bells.', 2.2);
    },
    // Peel the poster wall, three layers deep, to the 1994 poster.
    *c02_posters(A, G) {
      const n = fv(G, 'c02_peel') | 0;
      if (!G.quests.q2_posters) A.quest('q2_posters', 'start');
      A.sound('paper');
      A.pose('jin', 'reach', { hold: 0.6 });
      if (n === 0) {
        yield A.say(null, 'IRON PULSE FITNESS — NEW YEAR NEW YOU — $19/MO');
        A.flag('c02_peel', 1);
        yield A.think('Nineteen dollars a month to look at my old gym.');
      } else if (n === 1) {
        yield A.say(null, 'THE RUST BELT REVUE — LIVE AT STARLITE LANES — FRIDAYS');
        A.flag('c02_peel', 2);
        yield A.think('Starlite Lanes. Out on Route 9. Somebody\'s Fridays.');
      } else {
        yield A.say(null, 'ASHGROVE TOWER · NOW LEASING · LIVE ABOVE IT ALL');
        A.flag('c02_peel', 3);
        yield A.think('They finished the tower.');
        yield A.wait(0.4);
        A.sound('paper');
        yield A.cam({ x: KX.posterWall, y: 226, zoom: 1.5, dur: 0.9 });
        A.evidence('ev_fight_poster');
        yield A.doc('ev_fight_poster');
        yield A.think('Torn across the face.');
        yield A.think('Two years of other people\'s Fridays on top of my Saturday.');
        A.quest('q2_posters', 'done');
        A.follow();
      }
    },
    *c02_poster_look(A) {
      yield A.doc('ev_fight_poster');
      yield A.think('Castell vs. Seo. Somebody tore it right across my face.');
    },
    *c02_flyer(A, G) {
      yield A.cam({ x: 597, y: 250, zoom: 1.4, dur: 0.8 });
      const had = !!G.evidence.ev_missing_flyer;
      A.evidence('ev_missing_flyer');
      yield A.doc('ev_missing_flyer');
      if (!had) {
        A.meet('min', 'c02_flyer');
        yield A.think('Taped at four corners and once more across a tear.');
        yield A.think('She wrote the phone number twice. Bigger the second time.');
      } else yield A.think('555-0143. Evenings.');
      A.follow();
    },
    // Payphones (Kessler, the YMCA lobby): Hana's card says call before 7 or after 9.
    *c02_phone(A, G) {
      if (!flag(G, 'c02_okafor_done')) { yield A.think('Hana\'s card. Not yet. Not till I\'ve been home.'); return; }
      if (flag(G, 'ch2_called_hana')) {
        yield A.think(here() === 'ymca_312' ? 'She said call anyway. Not tonight. Tonight I said enough.' : 'I called her already.');
        return;
      }
      const v = yield A.choice('Hana\'s card: Call me. Before 7 or after 9.', [
        { text: 'Call Hana.', value: 'call', policy: 'restraint' },
        { text: 'Hang up.', value: 'no', policy: 'ruthless' },
      ], { thought: true, id: 'c02_call' });
      if (v !== 'call') { yield A.think('Later.'); return; }
      A.sound('dial');
      yield A.wait(1.4);
      A.sound('phoneRing', { vol: 0.35 });
      yield A.wait(1.6);
      yield A.say('hana', 'St. Agnes, Two West— Jin? Jin. You\'re alive. Good.');
      yield A.say('hana', 'Did you find them?');
      yield A.say('jin', '...');
      yield A.wait(1.6);
      yield A.say('hana', '...Oh. Oh, Jin. I\'m sorry.');
      yield A.wait(0.8);
      yield A.say('hana', 'I\'m keeping the copy somewhere safe. Call me anyway. Even if there\'s nothing to say.');
      A.flag('ch2_called_hana');
      A.rel('hana', 1);
      A.quest('q2_call_hana', 'done');
      A.meet('hana', 'c02_call');
      yield A.think('Even if there\'s nothing to say.');
    },

    /* Sit spots (2.3): each eases the camera out; the first after the news lets dusk fall. */
    *c02_sit_bench(A, G) {
      yield* sitAt(A, KX.busStop + 10, 1, { zoom: 0.85 });
      if (!G.memories.mem_umbrella) {
        yield* memIn(A);
        yield A.think('My first amateur loss. I came home on the 14 with my eye shut.');
        yield A.say('umma', 'You lost. Okay. Umbrella.', { name: 'Umma' });
        yield A.think('Two umbrellas. She\'d waited at this shelter with two umbrellas.');
        yield* memOut(A);
        A.memory('mem_umbrella');
        A.meet('umma', 'c02_umbrella');
        yield A.think('She didn\'t ask how. She just handed me the umbrella.');
      } else yield A.think(flag(G, 'c02_okafor_done') ? 'Nobody\'s waiting at this shelter.' : 'The 14 still runs. Less of it.');
      if (flag(G, 'c02_okafor_done')) yield* duskFalls(A, true);
      yield* offerNine(A, G);
      hudBack(A);
      yield* stay(A);
    },
    *c02_sit_stoop(A, G) {
      yield* sitAt(A, KX.stoop - 14, 1, { zoom: 0.85 });
      if (!flag(G, 'c02_okafor_done')) {
        yield A.think('Unswept. Umma swept this stoop every morning whether it was ours or not.');
      } else {
        yield A.think('Garrison Street. February. I was on Hillcrest in February, counting ceiling tiles.');
        yield A.think('Her good coat. The navy one with the big buttons.');
        yield* duskFalls(A, true);
      }
      yield* offerNine(A, G);
      hudBack(A);
      yield* stay(A);
    },
    *c02_sit_booth(A, G) {
      yield* sitAt(A, SUN.booth, 1, { zoom: 0.9 });
      const rita = S.world.actor('rita');
      if (rita && !flag(G, 'c02_booth_coffee')) {
        A.flag('c02_booth_coffee');
        yield A.walk('rita', SUN.booth - 26, { face: 1 });
        A.pose('rita', 'reach', { hold: 1 });
        A.sound('pickup', { vol: 0.3 });
        if (flag(G, 'c02_okafor_done')) {
          yield A.say('rita', 'She sat in that booth with her envelopes. Every Saturday.');
          yield A.say('rita', 'I gave her the refills free and she tipped me anyway, the stubborn thing.');
          A.meet('rita', 'c02_min');
          yield A.walk('rita', SUN.rita, { face: 1 });
          yield A.think('Every Saturday. In this booth.');
        } else {
          yield A.say('rita', 'Coffee\'s on the house. You look like the weather.');
          yield A.walk('rita', SUN.rita, { face: 1 });
          yield A.think('Min paid for pie here once and came up forty cents short. We split it anyway.');
        }
      } else yield A.think(flag(G, 'c02_okafor_done') ? 'Her envelopes. On this table.' : 'Same booth. Same crack in the seat.');
      if (flag(G, 'c02_okafor_done')) yield* duskFalls(A, true);
      yield* offerNine(A, G);
      hudBack(A);
      yield* stay(A);
    },
    *c02_sit_roof(A, G) {
      yield* sitAt(A, PA.chairs, 1, { zoom: 0.7, cx: PA.chairs + 40, cy: PA.roof - 70 });
      if (!G.memories.mem_roof) {
        yield* memIn(A);
        yield A.think('Fourth of July, 1993. These two chairs. Fireworks over the river.');
        yield A.say('min', 'When you\'re champion, buy a building with a roof that doesn\'t leak.', { name: 'Min' });
        yield A.say('jin', 'This roof leaks?');
        yield A.say('min', 'Everything leaks, Jin. You\'ve just never been home when it rains.', { name: 'Min' });
        yield* memOut(A);
        A.memory('mem_roof');
        A.meet('min', 'c02_roof');
      }
      A.quest('q2_roof', 'done');
      if (flag(G, 'c02_okafor_done')) {
        yield A.think('I kept thinking they were somewhere I hadn\'t looked yet.');
        yield* duskFalls(A, true);
        hudBack(A);
        yield* stay(A, 20);
        if (seated()) { yield A.think('Garrison Street. I don\'t even know what it looks like.'); yield* stay(A); }
      } else {
        yield A.think('Somebody on this street knows where they are.');
        hudBack(A);
        yield* stay(A);
      }
    },
    *c02_fe_look(A, G) {
      if (!G.quests.q2_roof) A.quest('q2_roof', 'start');
      yield A.think('The fire escape still goes all the way up.');
      yield A.think('Min and I had two lawn chairs on that roof. Nobody was supposed to know.');
    },

    /* 2.2 3B: Petra Novak on the chain. */
    *c02_3b_knock(A, G) {
      if (flag(G, 'c02_petra_done')) { yield A.think('She said what she could. Let them have their evening.'); return; }
      A.sound('door', { vol: 0.5 });
      yield A.think('I still have the key. I don\'t try it.');
      yield A.letterbox(true, 0.5);
      yield A.walk('jin', ST4.door3b - 34, { face: 1 });
      A.spawn(npc('petra', { x: ST4.door3b - 4, y: ST4.l3Y, face: -1, pose: 'idle' }));
      A.spawn(npc('rosie', { x: ST4.door3b + 10, y: ST4.l3Y, face: -1, pose: 'idle' }));
      yield A.cam({ x: ST4.door3b - 20, y: ST4.l3Y - 34, zoom: 1.3, dur: 0.8 });
      yield A.say('petra', 'Can I help you?', { pose: 'armsCrossed' });
      yield A.say('jin', 'I lived here. Jin Seo. My mother, Mi-ok Seo. My sister.');
      yield A.wait(0.6);
      yield A.say('petra', 'We\'ve been here since July \'95. Management said the last people moved out.');
      yield A.say('petra', 'I\'m sorry.');
      A.bark('rosie', 'Is he Santa?', 2.2);
      A.meet('petra', 'met'); A.meet('rosie', 'met');
      const v = yield A.choice(null, [
        { text: 'Could I just see the kitchen? From here.', value: 'look', policy: 'restraint', record: 'Asked to see the kitchen of 3B, from the doorway.' },
        { text: 'Never mind. Sorry.', value: 'go', policy: 'ruthless', record: 'Left 3B at the door.' },
      ], { id: 'c02_3b_kitchen' });
      if (v === 'look') {
        yield A.say('petra', '...', { face: 1 });
        A.sound('door', { vol: 0.35 });
        yield A.fade(1, 0.4);
        A.remove('petra'); A.remove('rosie');
        yield A.goto('c02_3b_doorway', 604, { face: -1, fade: false });
        yield A.letterbox(false, 0.3);
        yield A.fade(0, 0.5);
        yield A.think('Yellow walls. A high chair where the table was.');
        A.flag('c02_in_doorway');
        yield A.waitFor((g) => flag(g, 'c02_doorway_done'), { autoplay: { interact: 'i2_height_marks' } });
        yield A.fade(1, 0.4);
        yield A.goto('kessler_412_stairs_1996', ST4.door3b - 34, { y: ST4.l3Y, face: 1, fade: false });
        A.spawn(npc('petra', { x: ST4.door3b - 4, y: ST4.l3Y, face: -1, pose: 'armsCrossed' }));
        A.spawn(npc('rosie', { x: ST4.door3b + 10, y: ST4.l3Y, face: -1, pose: 'idle' }));
        yield A.letterbox(true, 0);
        yield A.cam({ x: ST4.door3b - 20, y: ST4.l3Y - 34, zoom: 1.3, dur: 0 });
        yield A.fade(0, 0.5);
      } else {
        yield A.say('petra', '...', { pose: 'idle' });
        yield A.think('She nods through the gap.');
      }
      yield A.wait(0.8);
      yield A.say('petra', 'Stuff kept coming for "Seo." I didn\'t know where to send it and I couldn\'t throw it out.');
      yield A.say('petra', 'That felt wrong.');
      const m = yield A.choice(null, [
        { text: 'Can I have it?', value: 'take', policy: 'restraint', record: 'Took the shoebox of mail from 3B.' },
        { text: 'Keep it. It\'s fine.', value: 'keep', policy: 'ruthless', record: 'Left the mail with Petra.' },
      ], { id: 'c02_mailbox' });
      if (m === 'take') {
        A.flag('ch2_took_mailbox', true);
        A.remove('rosie');
        yield A.wait(0.8);
        A.sound('paper');
        yield A.say('petra', 'Here. It\'s all of it. Most of it\'s menus.');
        A.evidence('ev_returned_letter');
        yield A.doc('ev_returned_letter');
        yield A.think('Housing Authority. October. To this door. They were already gone.');
      } else {
        A.flag('ch2_took_mailbox', false);
        yield A.say('petra', 'I\'ll hang onto it. In case.');
      }
      yield A.say('petra', 'Mrs. Okafor across the hall. She\'d know. She\'s been here forever.');
      A.sound('door', { vol: 0.5 });
      A.remove('petra'); A.remove('rosie');
      A.meet('petra', 'mail');
      A.flag('c02_petra_done');
      A.quest('q2_main', 'step', 1);
      yield A.letterbox(false, 0.5);
      A.follow();
    },
    *c02_height_marks(A, G) {
      yield A.cam({ x: 592, y: 250, zoom: 1.7, dur: 0.8 });
      yield A.think('She painted until she reached the names.');
      yield A.think('JIN 8. MIN 4. JIN 12. The rest is white.');
      yield A.say('petra', 'I painted it in the summer. When I got to the names, I didn\'t know what to do. So I stopped.');
      yield A.say('jin', 'Thank you for stopping.');
      A.flag('ch2_saw_height_marks', true);
      A.meet('petra', 'marks');
      A.follow();
      A.flag('c02_doorway_done');
    },
    *c02_3b_leave(A) { A.flag('c02_doorway_done'); },

    /* 2.2 Mrs. Okafor (key scene). */
    *c02_okafor_meet(A, G) {
      A.flag('c02_okafor_met');
      const j = jin();
      yield A.letterbox(true, 0.6);
      A.sound('door', { vol: 0.5 });
      A.spawn(npc('okafor', { id: 'c02_okafor_hall', x: ST4.door3a + 10, y: ST4.l3Y, face: 1, pose: 'idle' }));
      A.face('jin', -1);
      const jx = j ? j.x : 200;
      yield A.cam({ x: (ST4.door3a + 10 + jx) / 2, y: ST4.l3Y - 36, zoom: 1.15, dur: 1.2 });
      yield A.wait(0.6);
      A.sound('pickup', { vol: 0.45 });
      A.pose('c02_okafor_hall', 'reach', { hold: 0.8 });
      yield A.wait(1.0);
      yield A.say('c02_okafor_hall', 'Jin?', { name: 'Mrs. Okafor' });
      yield A.wait(1.5);
      yield A.say('c02_okafor_hall', 'Jin. Oh, Lord. Oh, Lord, look at you.', { name: 'Mrs. Okafor' });
      yield A.say('c02_okafor_hall', 'Come in. Come in before I fall down.', { name: 'Mrs. Okafor' });
      A.meet('okafor', 'met');
      yield A.fade(1, 0.6);
      A.remove('c02_okafor_hall');
      yield A.goto('okafor_3a', OKX.door - 20, { face: -1, fade: false });
      // Her kitchen, full letterbox. She puts the kettle on and sits first.
      A.place('okafor', OKX.door - 50);
      A.face('okafor', -1);
      yield A.cam({ x: 300, y: 250, zoom: 1.05, dur: 0 });
      A.ambience('room', 0.25);
      yield A.fade(0, 0.8);
      yield A.walk('okafor', OKX.kettle + 14, { face: -1 });
      A.pose('okafor', 'work');
      yield A.walk('jin', OKX.table + 48, { face: -1 });
      yield A.wait(1.2);
      yield A.walk('okafor', OKX.table - 30, { face: 1 });
      A.pose('okafor', 'sit');
      yield A.cam({ x: OKX.table + 4, y: 252, zoom: 1.15, dur: 1.2 });
      yield A.wait(1.0);
      yield A.say('okafor', 'Sit.');
      yield A.walk('jin', OKX.table + 30, { face: -1 });
      A.pose('jin', 'sit');
      yield A.wait(0.8);
      A.sound('block', { vol: 0.25 });
      yield A.wait(0.9);
      yield A.say('okafor', 'They said you left. The hospital said you checked yourself out and went, and the newspaper said it, and the television said it.');
      yield A.say('okafor', 'Your sister said it was a lie. Every day she said it was a lie.');
      yield A.say('jin', 'Where are they?');
      yield A.wait(2.0);
      // She puts down her cup. The camera eases in, slowly enough not to be noticed.
      A.cam({ x: OKX.table + 4, y: 250, zoom: 1.25, dur: 14, ease: 'inOut' });
      yield A.say('okafor', 'They lost the apartment. May, the year after. They were behind, and the searching cost money, and your mother went to the court herself, in her good coat.');
      yield A.say('okafor', 'In her good navy coat.');
      yield A.say('okafor', 'They went to a rooming house on Garrison Street. Lindell House. I told her it was no place. She said, "For a little while, Grace."');
      yield A.say('okafor', 'There was a fire. In February. At night.');
      yield A.wait(1.5);
      yield A.say('okafor', 'Both of them, Jin. Both of them.');
      // Silence. No lines. He stands; his head goes down. The radiator clanks once.
      A.pose('jin', 'headDown');
      A.fx('desat', 0.25, 2.5);
      yield A.wait(1.6);
      A.sound('block', { vol: 0.22 });
      yield A.wait(1.4);
      // The kettle starts; she doesn't get up for it for two seconds.
      const kettle = () => { if (S.world && S.world.particle) for (let i = 0; i < 3; i++) S.world.particle({ x: OKX.kettle + 4, y: 236, vx: (i - 1) * 6, vy: -24, g: -20, life: 1.2, size: 1, color: '#e6e8ea', alpha: 0.7 }); };
      for (let i = 0; i < 4; i++) { kettle(); yield A.wait(0.5); }
      yield A.walk('okafor', OKX.kettle + 14, { face: -1 });
      A.pose('okafor', 'work');
      yield A.wait(0.8);
      A.pose('okafor', 'idle');
      A.face('okafor', -1);
      yield A.say('okafor', 'The county buried them. Calder Municipal, Section fourteen. My church put up a cross. Then somebody put up a stone.');
      yield A.say('okafor', 'I don\'t know who. Not me. I wish it was me.');
      yield A.say('okafor', 'Their things. What the fire didn\'t take, the county boxed. Unclaimed property, at the City Hall Annex. I tried to get them. They said only family.');
      yield A.wait(0.8);
      yield A.say('okafor', 'Only family. They keep it a year, Jin. Until February.');
      A.fx('desat', 0, 3);
      A.face('okafor', 1);
      // Each question once; "Stand up." ends it. No flag: no wrong answer here.
      const asked = { umma: false, min: false };
      for (let guard = 0; guard < 4; guard++) {
        const v = yield A.choice(null, [
          { text: 'Tell me about Umma.', value: 'umma', when: () => !asked.umma, autoplay: true },
          { text: 'Tell me about Min.', value: 'min', when: () => !asked.min },
          { text: 'Stand up.', value: 'stand' },
        ], { id: 'c02_okafor_ask' });
        if (v === 'umma') {
          asked.umma = true;
          yield A.say('okafor', 'She hemmed half the church for free that winter so she wouldn\'t have to sit still.');
          const pd = fv(G, 'ch0_purse_dream');
          if (pd === 'rent') yield A.say('okafor', 'She told the whole building you\'d have the rent paid off by Christmas. She was so proud she told the mailman.');
          else if (pd === 'umma_saturdays') yield A.say('okafor', 'She said she\'d never work another Saturday. She worked every Saturday after.');
          else if (pd === 'new_apartment') yield A.say('okafor', 'She told everyone about the bathroom lock. She laughed so hard telling it.');
          A.meet('umma', 'c02_okafor');
        } else if (v === 'min') {
          asked.min = true;
          yield A.say('okafor', 'Flyers on every pole in Eastgate. Letters to everybody.');
          yield A.say('okafor', 'She\'d come up these stairs with her bag of envelopes and say, "Mrs. O, today somebody answers."');
          A.meet('min', 'c02_okafor');
        } else break;
      }
      // Umma's dish.
      yield A.walk('okafor', 70, { face: -1 });
      A.pose('okafor', 'reach', { hold: 1.2 });
      yield A.wait(1.2);
      yield A.walk('okafor', OKX.table + 4, { face: 1 });
      yield A.cam({ x: OKX.table + 18, y: 256, zoom: 1.4, dur: 1.0 });
      yield A.say('okafor', 'This is hers. Pyrex. Blue cornflowers. Look, her name on the tape.');
      yield A.say('okafor', 'She brought me japchae in it the week before... I never gave it back. I kept meaning to.');
      A.pose('okafor', 'reach', { hold: 1 });
      if (S.combat && S.combat.carry) S.combat.carry('dish', 'Hands full.');
      A.pose('jin', null);
      yield A.think('SEO, on masking tape. Her handwriting.');
      A.flag('c02_dish_pending');
      // At her door.
      yield A.walk('okafor', OKX.door - 30, { face: 1 });
      yield A.walk('jin', OKX.door - 56, { face: 1 });
      A.face('okafor', -1);
      yield A.cam({ x: OKX.door - 44, y: 250, zoom: 1.2, dur: 0.9 });
      yield A.say('okafor', 'Teddy Marsh came up these stairs twice asking for you. He sweeps that gym at night now.');
      yield A.say('okafor', 'You go see him. And you come back. You hear me? You come back up these stairs.');
      yield A.say('jin', 'I hear you.');
      A.meet('okafor', 'told');
      yield A.fade(1, 0.7);
      yield A.goto('kessler_412_stairs_1996', ST4.door3a + 22, { y: ST4.l3Y, face: 1, fade: false });
      if (S.combat && S.combat.carry && flag(S.G, 'c02_dish_pending')) S.combat.carry('dish', 'Hands full.');
      // 2.3 Room to breathe: no hostile anywhere; the account goes in the journal without a toast; the HUD hides.
      silentEvidence('ev_okafor_account');
      A.flag('c02_okafor_done');
      A.flag('c02_hud_off', S.time);
      A.quest('q2_main', 'step', 2);
      A.fx('muffle', 0.3, 0.8);
      A.parallel('c02_unmuffle');
      A.checkpoint('412 Kessler — the landing');
      yield A.letterbox(false, 0);
      A.follow();
      yield A.fade(0, 1.2);
    },
    *c02_unmuffle(A) { yield A.wait(20); A.fx('muffle', 0, 3); },
    *c02_photo_walkout(A, G) {
      yield A.cam({ x: OKX.photoWalkout, y: 150, zoom: 1.6, dur: 0.8 });
      yield A.think('My walk-out. The lights went white. Min took it from Section 14.');
      const ok = S.world.actor('okafor');
      if (ok && !flag(G, 'c02_heard_photo')) {
        A.flag('c02_heard_photo');
        yield A.say('okafor', 'Min gave it to me. She said it was the only one where you didn\'t look arrested.');
      }
      A.follow();
    },
    *c02_photo_supper(A) {
      yield A.cam({ x: OKX.photoUmma, y: 156, zoom: 1.6, dur: 0.8 });
      yield A.think('Umma and Mrs. Okafor at the church supper. 1993. Both holding dishes.');
      yield A.think('Umma\'s has the blue cornflowers.');
      A.follow();
    },

    /* Sunny's, Iron Pulse. */
    *c02_sunnys_bell(A) {
      A.sound('bell', { vol: 0.12 });
      A.bark('jin', 'Not that one. A smaller one.', 2.6);
    },
    *c02_tv(A) {
      yield A.cam({ x: SUN.tv + 60, y: 120, zoom: 1.5, dur: 0.7 });
      A.sound('tvStatic', { vol: 0.2 });
      yield A.say(null, '"Ray Castell defends at the Civic. March. Tickets on sale now."');
      yield A.think('Castell. Still champion. Still at the Civic.');
      A.follow();
    },

    /* 2.4 Iron Pulse after nine: Teddy, the haircut, the box (key scene). */
    *c02_backroom_enter(A, G) {
      if (phase(G) === 'night' && !flag(G, 'c02_teddy_done')) yield* A.sub('c02_teddy_scene');
    },
    *c02_teddy_scene(A, G) {
      const j = jin();
      yield A.letterbox(true, 0.5);
      A.face('teddy', 1);
      A.pose('teddy', 'sit');
      yield A.walk('jin', IPB.side - 30, { face: -1 });
      yield A.cam({ x: (IPB.cot + IPB.side) / 2, y: 252, zoom: 0.95, dur: 1.0 });
      yield A.wait(1.2);
      // He looks up. He stands too fast and the can tips over.
      A.pose('teddy', 'idle');
      A.sound('block', { vol: 0.4 });
      if (S.world && S.world.burst) S.world.burst(IPB.cot + 14, 286, 5, { color: '#b8783a', spread: 30, up: 30 });
      yield A.wait(2.0);
      yield A.say('teddy', '...Kid?');
      A.meet('teddy', 'haircut');
      yield A.walk('jin', IPB.cot + 92, { face: -1 });
      yield A.cam({ x: IPB.cot + 46, y: 250, zoom: 1.15, dur: 0.9 });
      yield A.say('teddy', 'They said you walked out of Calder General. I went there. I went there, Jin. They said "discharged."');
      yield A.say('teddy', 'Then some fella from a charity called the gym. Said the family had asked for privacy.');
      yield A.wait(0.8);
      yield A.say('teddy', 'I took it. I was glad to take it. It meant I didn\'t have to knock on 3B.');
      A.pose('teddy', 'sit');
      A.sound('block', { vol: 0.2 });
      yield A.say('teddy', 'I sold the gym. I couldn\'t walk in the door. Now I walk in it every night with a mop.');
      yield A.wait(1.0);
      // The haircut: Teddy talks while cutting so he never has to look at Jin's face.
      A.pose('teddy', 'idle');
      yield A.say('teddy', 'Sit.');
      const bucketX = IPB.mirror - 12;
      yield A.walk('jin', bucketX, { face: 1 });
      A.pose('jin', 'sit');
      yield A.walk('teddy', bucketX - 18, { face: 1 });
      A.pose('teddy', 'work');
      yield A.cam({ x: bucketX - 6, y: 236, zoom: 1.2, dur: 1.2 });
      A.sound('buzz', { vol: 0.2 });
      yield A.say('teddy', 'I\'ve said this to that mirror every night for two years, so I\'ll say it to you.');
      if (S.world && j) S.world.setLook(j, 'c02_jin_cut1');
      yield A.say('teddy', 'Your eyes were swimming in the second. I saw it. You told me something was wrong and I called it nerves,');
      yield A.say('teddy', 'because the other thing meant stopping a title fight, and I\'d waited thirty years for one.');
      if (G.memories.mem_corner) {
        G.memories.mem_corner.at = N; G.memories.mem_corner.seen = false;
        S.events.emit('memory', { id: 'mem_corner', title: 'Send him' });
      } else A.memory('mem_corner');
      if (flag(G, 'ch0_told_teddy')) {
        yield A.say('teddy', 'And you told me about the coat. You told me, and I said we win anyway.');
      } else {
        yield A.say('jin', 'There was a man in a camel coat. In the locker room, before. Fifty thousand to go down in the fourth.');
        yield A.wait(1.0);
        yield A.say('teddy', 'You never said a word about a coat? Jesus, kid. And I sent you out.');
      }
      if (S.world && j) S.world.setLook(j, 'c02_jin_cut2');
      A.sound('buzz', { vol: 0.2 });
      const tone = yield A.choice(null, [
        { text: 'You sent me out.', value: 'blamed', policy: 'ruthless', record: 'Told Teddy: "You sent me out."' },
        { text: 'Who else was in my corner? Who did the water?', value: 'asked', record: 'Asked Teddy who else worked the corner.' },
        { text: 'You didn\'t put anything in me.', value: 'forgave', policy: 'restraint', record: 'Told Teddy he didn\'t put anything in you.' },
      ], { id: 'c02_teddy_tone' });
      A.flag('ch2_teddy_tone', tone);
      if (tone === 'blamed') {
        yield A.say('teddy', 'Yeah.');
        yield A.wait(1.0);
        yield A.say('teddy', 'Yeah, I did.');
        A.rel('teddy', -1);
      } else if (tone === 'asked') {
        yield A.say('teddy', 'Lenny. Lenny Voss did the bucket and the bottles. Said you were fine. I wanted you to be fine.');
        yield A.say('teddy', 'He quit the week after. Took his kit and went.');
        A.rel('teddy', 1);
        A.meet('lenny', 'c02_teddy');
      } else {
        A.pose('teddy', 'idle');
        yield A.wait(1.6);
        yield A.say('teddy', 'Don\'t do that. Don\'t make it easy.');
        A.pose('teddy', 'work');
        A.rel('teddy', 2);
      }
      yield A.wait(0.8);
      if (S.world && j) S.world.setLook(j, 'jin_street');
      A.body({ look: 'jin_street' });
      A.sound('buzz', { vol: 0.15 });
      yield A.wait(0.6);
      yield A.think('Two-block. The way he always cut it.');
      // The box.
      A.pose('jin', null);
      yield A.walk('teddy', IPB.box - 6, { face: 1 });
      A.pose('teddy', 'reach', { hold: 1.2 });
      yield A.wait(1.2);
      yield A.walk('teddy', IPB.bench - 18, { face: 1 });
      yield A.walk('jin', IPB.bench + 18, { face: -1 });
      A.face('teddy', 1);
      yield A.cam({ x: IPB.bench, y: 250, zoom: 1.5, dur: 1.0 });
      yield A.think('Masking tape. SEO — DON\'T TOSS.');
      yield A.think('My old hand wraps. The amateur belt.');
      A.sound('paper');
      yield A.doc({ id: 'c02_team_photo', kind: 'photo', title: 'Marsh B.C., 1993', date: '1993',
        text: 'Fourteen fighters in two rows in front of the ring. Teddy at the end with his arms crossed. Jin in the middle of the back row, the amateur belt over his shoulder. Somebody wrote the names on the back in pencil.' });
      yield A.think('And the robe. Navy. EASTGATE across the back.');
      yield A.say('teddy', 'Your mother sewed those letters. I couldn\'t throw it out and I couldn\'t look at it.');
      A.pose('jin', 'reach', { hold: 1.4 });
      yield A.wait(1.4);
      yield A.think('The G is crooked.');
      yield A.think('Not yet.');
      A.flag('c02_saw_box');
      yield A.cam({ x: IPB.bench - 40, y: 250, zoom: 1.15, dur: 0.9 });
      yield A.say('teddy', 'Bag\'s still on the pipe. Come back another night, after nine. I\'ll hold mitts if you want.');
      yield A.say('teddy', 'YMCA on Front Street\'s eight a night. Cut through the alley, it\'s quicker. Go.');
      A.flag('c02_teddy_done');
      A.quest('q2_main', 'step', 5);
      A.checkpoint('Iron Pulse — the back room');
      yield A.letterbox(false, 0.5);
      A.follow();
    },
    *c02_seo_box(A) {
      yield A.think('SEO — DON\'T TOSS. The robe is folded on top.');
      yield A.think('Not yet.');
    },
    *c02_taping_bench(A, G) {
      yield* sitAt(A, IPB.bench, -1, { zoom: 1.1, pose: 'sit' });
      if (!G.memories.mem_first_wraps) {
        yield* memIn(A);
        yield A.think('Fourteen. This bench. My hands were too small for the wraps.');
        yield A.say('teddy', 'Hands up, chin down, mouth shut. In that order.', { name: 'Teddy' });
        yield* memOut(A);
        A.memory('mem_first_wraps');
        yield A.think('He wrapped them twice because I talked the first time.');
      } else yield A.think('Same bench. The tape marks are still on it.');
      yield* stay(A);
    },

    /* 2.5 Pratt Alley: the key image, then the van. */
    *c02_alley_enter(A, G) {
      if (!flag(G, 'c02_alley_seen')) {
        A.flag('c02_alley_seen');
        if (!G.quests.q2_roof) A.quest('q2_roof', 'start');
        A.bark('jin', 'The fire escape still goes all the way up.', 3);
      }
      if (phase(G) === 'night' && !flag(G, 'c02_fight_on')) A.sound('radio', { vol: 0.12 });
      if (qstep(G) === 5 && !flag(G, 'c02_alley_fought')) yield* A.sub('c02_alley_van');
    },
    *c02_alley_van(A, G) {
      const W = S.world, L = W.loc;
      // A short framing: thin letterbox, wide (0.9); he can still walk.
      A.fx(THIN, 0.4, 0.8);
      if (L && L.camera) { L.camera.zoom = 0.9; A.follow(); }
      let stillT = 0, lastT = S.time;
      yield A.waitFor(() => {
        const j = jin(), now = S.time, dt = Math.max(0, now - lastT);
        lastT = now;
        if (!j) return false;
        if (here() !== 'pratt_alley') return true;
        const inCone = j.x > PA.pool - 52 && j.x < PA.pool + 56 && Math.abs(j.y - PA.g) < 4;
        if (inCone && Math.abs(j.vx || 0) < 3) stillT += dt; else stillT = 0;
        return (inCone && stillT > 1.4) || (j.x > PA.pool + 90 && Math.abs(j.y - PA.g) < 4);
      }, { autoplay: { walkTo: PA.pool } });
      if (L && L.camera) L.camera.zoom = 1;
      if (here() !== 'pratt_alley') { A.fx(THIN, 0, 0.3); return; }
      A.flag('c02_van_came');
      // If he pressed nothing: he stops in the cone and leans on the wall, hands in his pockets. The key image.
      const j0 = jin();
      if (j0 && Math.abs(j0.x - (PA.pool + 18)) > 8) yield A.walk('jin', PA.pool + 18, {});
      A.face('jin', 1);
      A.pose('jin', 'leanWall', { hold: true });
      yield A.cam({ x: PA.pool + 10, y: PA.g - 80, zoom: 0.9, dur: 1.6 });
      yield A.wait(3.2);
      // Headlights sweep the far wall.
      const beam = { c02: true, x: PA.w + 40, y: PA.g - 40, r: 150, color: '#f4e2b0', k: 0.85, cone: { dir: 'left', width: 40 } };
      W.extraLights = (Array.isArray(W.extraLights) ? W.extraLights : []).filter((l) => !(l && l.c02));
      W.extraLights.push(beam);
      A.sound('carHorn', { vol: 0.15 });
      for (let i = 0; i <= 16; i++) { beam.x = PA.w + 40 - i * 22; beam.y = PA.g - 40 - Math.sin(i / 16 * Math.PI) * 30; yield A.wait(0.08); }
      // The gray van backs into the Front Street mouth and stops, blocking it.
      const van = A.spawn({ id: 'c02_van', look: 'man', name: 'Gray van', x: PA.w + 90, face: 1, pose: 'idle', layer: 'front' });
      if (van) {
        van.scripted = true; van.h = 40; van.vanFace = 1;
        van.draw = (c) => { if (S.pieces && S.world && S.world.loc) S.pieces.draw(c, { t: 'car', kind: 'van', x: van.x, color: '#6c7074', face: van.vanFace, on: true, rusty: true }, S.world.loc); };
      }
      beam.cone = { dir: 'right', width: 30 };
      // Reversing lights toward the alley while it backs in; a red tail glow once it stops.
      const rear = { c02: true, x: PA.w + 50, y: PA.g - 16, r: 130, color: '#f0e8d8', k: 0.75, cone: { dir: 'left', width: 34 } };
      W.extraLights.push(rear);
      A.pose('jin', null);
      A.face('jin', 1);
      A.cam({ x: (PA.pool + PA.van) / 2 - 30, y: PA.g - 110, zoom: 0.6, dur: 2.4 });
      for (let i = 0; i <= 24; i++) {
        if (van) van.x = PA.w + 90 - (PA.w + 90 - PA.van) * (1 - Math.pow(1 - i / 24, 2));
        beam.x = (van ? van.x : PA.van) + 52; beam.y = PA.g - 15;
        rear.x = (van ? van.x : PA.van) - 44;
        yield A.wait(0.1);
      }
      Object.assign(rear, { color: '#c83a2a', r: 56, k: 0.55, cone: null });
      yield A.letterbox(true, 0.5);
      A.sound('vanDoor', { vol: 0.7 });
      yield A.wait(0.4);
      A.sound('vanDoor', { vol: 0.6 });
      const jx = Math.min(Math.max(jin() ? jin().x : PA.pool, PA.arena0 + 60), PA.arena1 - 160);
      const bx = jx + 40, cx = jx + 80;
      A.spawn(npc('benny', { id: 'c02_benny_van', x: PA.van - 40, face: -1, pose: 'idle' }));
      A.spawn(npc('carl', { id: 'c02_carl_van', x: PA.van - 20, face: -1, pose: 'idle' }));
      A.walk('c02_carl_van', cx, { face: -1 });
      yield A.walk('c02_benny_van', bx, { face: -1 });
      A.pose('c02_carl_van', 'armsCrossed');
      yield A.cam({ x: (jx + cx) / 2, y: PA.g - 60, zoom: 1.1, dur: 1.2 });
      yield A.say('c02_benny_van', 'Daniel Ahn? Mr. Pike\'s worried sick. Let\'s get you home.');
      if (fv(G, 'ch1_signed_name') === 'seo_jin') yield A.say('c02_benny_van', 'Mr. Pike\'s real upset about your little signature.');
      yield A.say('jin', 'I\'m not Daniel.');
      yield A.say('c02_carl_van', 'Pike said you\'d say that.');
      A.meet('benny', 'met'); A.meet('carl', 'met'); A.meet('pike', 'c02_van');
      // Benny reaches for his collar: a slow two-arm grab, the first telegraph.
      A.pose('c02_benny_van', 'grab');
      yield A.wait(0.5);
      A.fx(THIN, 0, 0.3);
      yield A.letterbox(false, 0.3);
      A.remove('c02_benny_van'); A.remove('c02_carl_van');
      A.flag('c02_fight_on');
      A.flag('c02_augie_inside', false);
      A.follow();
      const r = yield A.fight({
        id: 'e2_1', arena: { x0: PA.arena0, x1: PA.arena1 }, maxAttackers: 2, checkpoint: true, label: 'Pratt Alley — the gray van',
        waves: [{ enemies: [
          { id: 'c02_e_benny', type: 'collector', x: bx, face: -1, name: 'Benny', look: 'benny', opts: { needsKnuckles: true, knuckleFloor: 0.35 } },
          { id: 'c02_e_carl', type: 'collector', x: cx, face: -1, name: 'Carl', look: 'carl', opts: { needsKnuckles: true, knuckleFloor: 0.35 } },
        ] }],
        tips: [
          { text: 'Big. Slow. When a fist glints, [dash] back out of it.', at: 'start' },
          { text: 'He missed. That\'s the opening: [punch] [punch]. Two punches, not five.', at: 'firstWhiff' },
          { text: 'Slipped it. No counter yet: [punch] [punch] into his recovery.', at: 'firstSlip' },
        ],
      });
      A.flag('c02_fight_on', false);
      // After the fight: Carl and Vic stumble back into the van; it peels out with its door open. Benny stays down.
      const pos = (id, dx) => { const a = S.world.actor(id); return a ? a.x : PA.pool + dx; };
      const carlX = pos('c02_e_carl', 60), vicX = pos('c02_e_vic', 100);
      const hadVic = !!S.world.actor('c02_e_vic');
      for (const id of ['c02_e_benny', 'c02_e_carl', 'c02_e_vic']) A.remove(id);
      A.flag('c02_alley_fought');
      A.flag('c02_augie_inside', true);
      yield A.letterbox(true, 0.5);
      A.spawn(npc('carl', { id: 'c02_carl_out', x: carlX, face: 1, pose: 'getup' }));
      if (hadVic) A.spawn(npc('vic', { id: 'c02_vic_out', x: vicX, face: 1, pose: 'getup' }));
      yield A.cam({ x: (PA.pool + PA.van) / 2, y: PA.g - 90, zoom: 0.8, dur: 1.0 });
      yield A.wait(0.8);
      A.walk('c02_carl_out', PA.van - 30, { speed: 70 });
      if (hadVic) A.walk('c02_vic_out', PA.van - 20, { speed: 80 });
      yield A.wait(Math.max(1.6, (PA.van - carlX) / 70));
      A.remove('c02_carl_out'); A.remove('c02_vic_out');
      A.sound('vanDoor', { vol: 0.7 });
      yield A.wait(0.3);
      A.sound('carHorn', { vol: 0.25 });
      const vv = S.world.actor('c02_van');
      for (let i = 0; i <= 18; i++) { if (vv) vv.x = PA.van + i * i * 1.2; beam.x = (vv ? vv.x : PA.van) + 52; rear.x = beam.x - 96; yield A.wait(0.06); }
      A.remove('c02_van');
      if (Array.isArray(W.extraLights)) W.extraLights = W.extraLights.filter((l) => l !== beam && l !== rear);
      A.meet('vic', 'met');
      // Under autoplay the fight can end before the brass falls: it is lying in the light all the same.
      if (!S.G.gear.knuckles) {
        yield A.walk('jin', PA.pool, {});
        yield A.cam({ x: PA.pool, y: PA.g - 20, zoom: 1.5, dur: 0.8 });
        A.pose('jin', 'crouch', { hold: 0.6 });
        yield A.think('Something fell out of his coat. Brass, in the slush.');
        yield A.think('Teddy would throw me out of the gym for this.');
        A.gear('knuckles');
        A.body({ power: 0.7 });
      }
      yield A.cam({ x: PA.pool + 30, y: PA.g - 70, zoom: 1.0, dur: 1.0 });
      yield A.think(r && r.won ? 'Two of them. My hands are shaking.' : 'Done.');
      A.quest('q2_main', 'step', 6);
      A.checkpoint('Pratt Alley — after the van');
      yield A.letterbox(false, 0.5);
      A.follow();
    },
    // Background beat when the knuckles fall (inside the fight): slow motion, the brass in the slush, sound out.
    *c02_knuckles_beat(A) {
      A.fx('slowmo', 0.6, 0.12);
      A.fx('muffle', 0.7, 0.2);
      yield A.cam({ x: PA.pool, y: PA.g - 18, zoom: 1.5, dur: 0.35 });
      A.bark('jin', 'Teddy would throw me out of the gym for this.', 3.2);
      yield A.wait(2.0);
      A.fx('slowmo', 0, 0.25);
      A.fx('muffle', 0, 0.5);
      A.follow();
    },

    /* 2.6 Room 312. */
    *c02_ymca_arrive(A, G) {
      yield A.wait(0.3);
      A.face('otis', -1);
      yield A.walk('jin', YM.otis - 30, { face: 1 });
      yield A.say('otis', 'Seo?');
      yield A.say('jin', 'Yeah.');
      yield A.say('otis', 'Lim called ahead. Hana Lim sends people sometimes. First week\'s paid.');
      yield A.say('otis', 'She said you\'d argue, so I\'m not listening.');
      yield A.say('otis', 'Room 312. Radiator\'s loud. It means it\'s working.');
      A.meet('otis', 'met');
      A.flag('base', 'ymca_312');
      A.quest('q2_main', 'step', 8);
      A.checkpoint('Calder YMCA');
    },
    *c02_ev_wall(A, G) {
      const n = Object.keys(G.evidence || {}).length;
      yield A.think('The wall over the cot. I pin up what I have.');
      yield A.think(n >= 8 ? 'It\'s filling up. A name that isn\'t mine. A flyer. A slip with Lenny\'s initials.' : 'Not much yet.');
    },
    *c02_chair_look(A, G) {
      if (flag(G, 'c02_dish_on_chair')) yield A.think('Umma\'s dish beside the knuckles. Those two things don\'t belong on the same chair.');
      else yield A.think('A wooden chair. Somewhere to put things down.');
    },
    *c02_radio(A, G) {
      A.sound('radio', { vol: 0.3 });
      yield A.think('Earl\'s radio. Static, then a ball game from somewhere warm.');
      if (!flag(G, 'c02_radio_on')) A.flag('c02_radio_on');
    },
    *c02_cot(A, G) {
      if (qstep(G) < 8) { yield A.think('A cot.'); return; }
      yield A.letterbox(true, 0.6);
      yield A.walk('jin', YM.chair - 16, { face: 1 });
      A.pose('jin', 'reach', { hold: 1.0 });
      A.sound('pickup', { vol: 0.4 });
      A.flag('c02_dish_on_chair');
      yield A.wait(1.0);
      yield A.cam({ x: YM.chair, y: 262, zoom: 1.5, dur: 0.8 });
      yield A.think('Umma\'s dish on the chair.');
      A.pose('jin', 'think', { hold: 1.6 });
      yield A.think('And the knuckles out of my pocket. I turn them over.');
      A.flag('c02_knuckles_on_chair');
      yield A.wait(0.8);
      A.sound('radio', { vol: 0.18 });
      A.flag('c02_radio_on');
      yield A.walk('jin', YM.cot + 14, { face: 1 });
      A.pose('jin', 'sit', { hold: true });
      yield A.cam({ x: (YM.cot + YM.window) / 2, y: 220, zoom: 0.95, dur: 2.2 });
      yield A.wait(1.0);
      yield A.think('Their things are in a room downtown until February.');
      yield A.think('Not yet. I can\'t open those boxes yet.');
      yield A.wait(0.8);
      yield A.think('Lenny Voss. Lenny was in my corner.');
      yield A.think('First the man who was supposed to protect me.');
      A.quest('q2_main', 'step', 9);
      A.flag('ch2_complete');
      yield A.wait(1.2);
      yield A.cam({ x: (YM.cot + YM.window) / 2 + 10, y: 210, zoom: 0.85, dur: 2.4 });
      yield A.wait(3.0);
      A.quest('q2_main', 'done');
      yield A.fade(1, 1.8);
      yield A.endChapter();
    },
  };

  /* ── Dialogs (NPC talk) ───────────────────────────────────────────── */
  const dialogs = {
    *c02_rita(A, G) {
      A.meet('rita', 'met');
      if (!flag(G, 'c02_rita_met')) {
        A.flag('c02_rita_met');
        yield A.say('rita', 'Coffee\'s on the house. You look like the weather.');
        yield A.say('jin', 'Thanks.');
        if (!flag(G, 'c02_okafor_done')) yield A.think('She doesn\'t know me. Nobody on this street knows me.');
        return;
      }
      if (flag(G, 'c02_okafor_done') && !flag(G, 'c02_rita_min')) {
        A.flag('c02_rita_min');
        yield A.say('rita', 'Grace called down. Said you might come by.');
        yield A.say('rita', 'Sit wherever you want, hon. That booth\'s empty.');
        return;
      }
      yield A.say('rita', phase(G) === 'night' ? 'We\'re open till eleven. Pie\'s from yesterday. Still pie.' : 'Pie\'s from yesterday. Still pie.');
    },
    *c02_teddy_mop(A, G) {
      A.face('teddy', -1);
      yield A.say('teddy', 'We close at nine.', { pose: 'sweep' });
      if (!flag(G, 'c02_saw_teddy')) {
        yield A.wait(0.8);
        yield A.think('He didn\'t look up. He mops like he\'s counting the boards.');
        yield A.think('Not here. Not with the girl at the desk watching. After nine.');
        A.flag('c02_saw_teddy');
        A.meet('teddy', 'mop');
      } else if (qstep(G) === 2) yield A.think('After nine. When the girl at the desk goes home.');
      if (qstep(G) === 2) { A.quest('q2_main', 'step', 3); hudBack(A); }
    },
    *c02_receptionist(A, G) {
      A.meet('receptionist', 'met');
      yield A.say('receptionist', 'Membership\'s nineteen a month. You look like you need it.');
      const v = yield A.choice(null, [
        { text: 'The old guy with the mop. Who is he?', value: 'teddy', autoplay: true },
        { text: 'Just looking.', value: 'no' },
      ], { id: 'c02_receptionist' });
      if (v === 'teddy') {
        yield A.say('receptionist', 'The old guy? Mr. Marsh? He sold it to my boss. He mops.');
        yield A.say('receptionist', 'Then at nine he just stands in there and looks at that wall.');
        if (!flag(G, 'c02_saw_teddy')) { A.flag('c02_saw_teddy'); A.meet('teddy', 'mop'); }
        if (qstep(G) === 2) { A.quest('q2_main', 'step', 3); hudBack(A); }
        yield A.think('After nine, then.');
      } else yield A.say('receptionist', 'We close at nine.');
    },
    *c02_teddy_after(A, G) {
      const t = fv(G, 'ch2_teddy_tone');
      if (t === 'blamed') yield A.say('teddy', 'Go on. Front Street. Through the alley.');
      else if (t === 'forgave') yield A.say('teddy', 'Go get some sleep, kid. Come back after nine some night. I mean it about the mitts.');
      else yield A.say('teddy', 'Front Street. The alley\'s quicker. And kid — Lenny. I don\'t know where he went.');
    },
    *c02_okafor_talk(A, G) {
      A.flag('c02_okafor_again');
      if (flag(G, 'c02_teddy_done')) yield A.say('okafor', 'You saw Teddy? Good. Did you eat? You didn\'t eat.');
      else yield A.say('okafor', 'Teddy. Iron Pulse, after nine. Go on. And you come back up these stairs.');
    },
    *c02_augie_alley(A, G) {
      if (fv(G, 'ch2_collector_after') === 'let_go') { yield A.say('augie', 'Keep the towel. Go on, before they come back with friends.'); return; }
      yield A.say('augie', 'You lost, pal? Kessler\'s that way. Front Street\'s that way. Pick one.');
      A.meet('augie', 'met');
    },
    *c02_tomas(A, G) {
      A.meet('tomas', 'met');
      if (flag(G, 'c02_alley_fought')) yield A.say('tomas', 'I didn\'t see nothing. I got cases.');
      else yield A.say('tomas', 'Truck goes at ten. You need through, go round by Kessler.');
    },
    *c02_otis(A, G) {
      if (flag(G, 'ch2_called_hana')) yield A.say('otis', 'Payphone works. You already found that out.');
      else yield A.say('otis', 'Payphone takes quarters. Don\'t feed it dimes, it eats them.');
    },
    // Questioning Benny (full letterbox; Jin crouches in the streetlight pool; the snow heavier).
    *c02_benny_question(A, G) {
      const W = S.world, L = W.loc;
      yield A.letterbox(true, 0.6);
      yield A.walk('jin', PA.benny - 26, { face: 1 });
      A.pose('jin', 'crouch');
      if (L) L.weatherAmount = 1;
      yield A.cam({ x: PA.benny - 12, y: PA.g - 36, zoom: 1.3, dur: 1.0 });
      yield A.say('benny', 'Okay. Okay! It\'s a job. The Fund pays to bring the strays back. You\'re a stray.');
      yield A.say('jin', 'Who pays you?');
      yield A.say('benny', 'Pike don\'t hire guys like us direct. Lenny does. Lenny Voss. Little guy, cutman.');
      yield A.say('benny', 'He does the cuts at the Cellar now, under Starlite Lanes, out on Route 9.');
      yield A.say('benny', 'He gets the envelopes from Pike\'s office, takes his piece, passes \'em down. I never even met no Pike.');
      // A taped wrist, white plastic: half a second of memory.
      A.fx('sepia', 0.9, 0.05);
      A.flash('#ffffff', 0.5);
      yield A.wait(0.5);
      A.fx('sepia', 0, 0.3);
      yield A.think('Lenny. Lenny was in my corner.');
      A.flag('c02_lenny_named');
      A.meet('benny', 'named');
      A.meet('lenny', 'c02_named');
      A.pose('jin', 'reach', { hold: 0.8 });
      A.sound('paper');
      A.evidence('ev_pickup_order');
      yield A.doc('ev_pickup_order');
      yield A.think('Job via L.V.');
      const v = yield A.choice(null, [
        { text: 'Get up. Go home.', value: 'let_go', policy: 'restraint', record: 'Let the collector go.' },
        { text: '[Hit him again]', value: 'hit_again', policy: 'ruthless', record: 'Hit the collector again after he talked.' },
      ], { id: 'c02_collector_after' });
      if (v === 'let_go') {
        A.flag('ch2_collector_after', v);
        A.pose('jin', null);
        yield A.walk('jin', PA.benny - 44, { face: 1 });
        A.spawn(npc('benny', { id: 'c02_benny_walk', x: PA.benny, face: -1, pose: 'getup' }));
        yield A.wait(1.0);
        A.pose('c02_benny_walk', 'limp');
        yield A.say('c02_benny_walk', '...You\'re not what they said.', { name: 'Benny' });
        A.meet('benny', 'let_go');
        yield A.walk('c02_benny_walk', PA.w + 40, { speed: 34 });
        A.remove('c02_benny_walk');
        // Augie, from Sunny's back step.
        A.flag('c02_augie_inside', false);
        yield A.wait(0.4);
        A.follow();
        A.walk('jin', PA.pool - 300, { face: -1 });
        yield A.walk('augie', PA.pool - 340, { speed: 85, face: 1 });
        A.face('jin', -1);
        yield A.cam({ x: PA.pool - 320, y: PA.g - 50, zoom: 1.2, dur: 0.8 });
        yield A.say('augie', '...You want some coffee?');
        A.pose('augie', 'reach', { hold: 1 });
        yield A.think('He hands me a towel packed with snow. For the hand.');
        yield A.say('jin', 'Yeah. Thanks.');
        A.meet('augie', 'towel');
      } else {
        // One more punch, framed wide; the sound is wrong: muffled, no spark, no hit-stop.
        A.spawn({ id: 'c02_augie_door', look: 'augie', name: 'Augie', x: PA.sunDoor + 8, face: 1, pose: 'idle' });
        yield A.cam({ x: (PA.sunDoor + PA.benny) / 2 + 200, y: PA.g - 100, zoom: 0.9, dur: 0.6 });
        A.fx('muffle', 0.85, 0.05);
        A.pose('jin', 'cross', { hold: 0.5 });
        A.sound('hurt', { vol: 0.35 });
        yield A.wait(0.6);
        A.flag('ch2_collector_after', v);
        yield A.wait(1.2);
        A.remove('c02_augie_door');
        A.sound('door', { vol: 0.8 });
        yield A.wait(0.5);
        A.fx('muffle', 0, 1.2);
        yield A.think('That one wasn\'t for information.');
        addHarm(A);
        A.meet('benny', 'hit_again');
      }
      A.flag('c02_alley_done');
      A.quest('q2_main', 'step', 7);
      A.checkpoint('Pratt Alley');
      yield A.letterbox(false, 0.5);
      A.follow();
    },
  };

  /* ── Step hook: lamps as he passes, the knuckles and the winded state in E2.1, one dash charge ── */
  const E = { active: false, f: null, t: 0, open: 0, lastOpenT: -9, lastOpenTarget: null, grabDone: false, dropAt: -1, kFrom: PA.pool,
    pickAt: -1, vicSpawned: false, crouchUntil: 0, closeT: 0, outT: 0, winded: false, windTip: false, needTip: false, whiffTip: false,
    grabTip: false, ignoredTip: false, ladderTipAt: -9, puffAt: 0, augieAt: -1, laundryAt: -1, pickTip: false };
  let tuneSaved = null;
  function syncTune() {
    const T = S.tune;
    if (!T) return;
    const inCh = !!(S.G && S.G.chapter === N);
    if (inCh) { if (T.dashCharges !== 1) { if (tuneSaved === null) tuneSaved = T.dashCharges; T.dashCharges = 1; } }
    else if (tuneSaved !== null) { if (T.dashCharges === 1) T.dashCharges = tuneSaved; tuneSaved = null; }
  }
  function liveEnemies() { return S.combat && S.combat.enemies ? S.combat.enemies() : []; }
  function toast(text, kind) { S.events.emit('toast', { text, kind: kind || 'tip' }); }
  function wind(on) {
    const C = S.combat;
    E.winded = on;
    if (C && C.body) C.body.dmgMul = on ? 0.75 : 1;
    if (on && !E.windTip) { E.windTip = true; toast('Winded. Back off. Let it come back.'); }
  }
  function beginFight(f) {
    Object.assign(E, { active: true, f, t: 0, open: 0, lastOpenT: -9, lastOpenTarget: null, grabDone: false, vicSpawned: false,
      crouchUntil: 0, closeT: 0, outT: 0, puffAt: 0, augieAt: S.time + 1.6, laundryAt: S.time + 3, pickAt: -1, dropAt: -1 });
    if (E.winded) wind(false);
    if (S.world) {
      S.world.bark('augie', 'Hey! HEY! I\'m calling somebody!', 2.4);
      S.world.bark('jin', 'Big. Slow. Move.', 2.4);
    }
    if (S.world && S.world.spawn && !S.world.actor('c02_laundry')) {
      S.world.spawn({ id: 'c02_laundry', look: 'c02_laundry', name: 'Neighbour', x: PA.feX + 60, y: PA.landB, face: -1, pose: 'reach' });
    }
  }
  function endFight() {
    E.active = false; E.f = null;
    if (E.winded) wind(false);
    const C = S.combat, j = jin();
    if (E.crouchUntil && C && C.jin) { C.jin.locked = false; if (j) { j.poseHold = false; j.scriptPose = null; } }
    E.crouchUntil = 0;
    if (S.world && S.world.actor('c02_laundry')) S.world.remove('c02_laundry');
  }
  function dropKnuckles() {
    const b = S.world.actor('c02_e_benny');
    E.kFrom = b ? b.x : PA.pool; E.dropAt = S.time;
    S.A.flag('c02_knuckles_dropped');
    if (S.world && b) S.world.bark(b, 'Hey—', 1.2);
    toast('Something fell out of his coat. [interact] Pick it up.', 'tip');
    if (S.director && S.director.parallel) S.director.parallel('c02_knuckles_beat');
  }
  function pickUpKnuckles() {
    const C = S.combat, j = jin(), G = S.G;
    G.gear.knuckles = true;
    if (C && C.body) C.body.knuckles = true;
    S.events.emit('gear', { name: 'knuckles', value: true });
    toast('Knuckles: more stagger, more damage. Not boxing anymore.', 'gear');
    if (S.audio) S.audio.play('pickup');
    S.A.body({ power: 0.7 });
    S.A.flag('c02_knuckles_taken');
    E.pickAt = S.time;
    if (C && C.jin && j) { C.jin.locked = true; j.poseHold = true; j.scriptPose = 'crouch'; E.crouchUntil = S.time + 0.3; }
  }
  function spawnVic() {
    const C = S.combat, f = E.f;
    if (!C || !f || f.done) return;
    const e = C.spawnEnemy({ id: 'c02_e_vic', type: 'thug', x: PA.arena1 - 20, face: -1, name: 'Vic', look: 'vic' });
    if (!e) return;
    e.enemy.fightId = f.id; e.enemy.state = 'idle';
    if (Array.isArray(f.spawned)) f.spawned.push(e);
    if (Array.isArray(f.waveActors)) f.waveActors.push(e);
    E.vicSpawned = true;
    if (S.world) S.world.bark(e, 'Just grab him, Carl, it\'s freezing.', 2.6);
  }
  function fightStep(dt, f) {
    const C = S.combat, j = jin(), G = S.G;
    if (!j || !C) return;
    E.t += dt;
    // Benny's slow two-arm grab is the first thing the player sees.
    if (!E.grabDone && E.t > 0.45) { E.grabDone = true; try { C.enemyAttack('c02_e_benny', 'grab'); } catch (_) { /* he may be out of reach */ } }
    if (E.augieAt > 0 && S.time >= E.augieAt) { E.augieAt = -1; S.A.flag('c02_augie_inside'); S.world.bark('tomas', 'Not my business, man. Not my business.', 2.6); }
    if (E.laundryAt > 0 && S.time >= E.laundryAt) { E.laundryAt = -1; if (S.world.actor('c02_laundry')) S.world.remove('c02_laundry'); }
    // The crouch to pick up the brass: 0.3 s with his hands busy.
    if (E.crouchUntil && S.time >= E.crouchUntil) { E.crouchUntil = 0; if (C.jin) C.jin.locked = false; j.poseHold = false; j.scriptPose = null; }
    // Winded: about six seconds of close exchange without a break.
    const near = liveEnemies().some((e) => Math.abs(e.x - j.x) < 58);
    if (near) { E.closeT += dt; E.outT = 0; }
    else { E.outT += dt; if (E.outT >= 1.5) { E.closeT = 0; if (E.winded) wind(false); } }
    const thr = 6 + 0.5 * ((G.train && G.train.conditioning) | 0);
    if (!E.winded && E.closeT >= thr) wind(true);
    if (E.winded) {
      const cj = C.jin;
      if (cj && cj.charges < cj.chargeMax) cj.rechargeT = Math.max(0, cj.rechargeT - dt / Math.max(0.05, S.tune.dashRecharge) * 0.5);
      if (S.time >= E.puffAt && S.world.particle) {
        E.puffAt = S.time + 0.45;
        S.world.particle({ x: j.x + (j.face || 1) * 5, y: j.y - 38, vx: (j.face || 1) * 14, vy: -8, g: -24, life: 0.9, size: 1, color: '#dfe5ec', alpha: 0.75 });
      }
    }
    // The knuckles fall on the third punished opening (or after 40 s of bare hands).
    if (!flag(G, 'c02_knuckles_dropped') && !G.gear.knuckles && (E.open >= 3 || E.t >= 40)) dropKnuckles();
    if (flag(G, 'c02_knuckles_dropped') && !G.gear.knuckles) {
      if (E.dropAt < 0) E.dropAt = S.time;
      const onIt = Math.abs(j.x - PA.pool) <= 18 && j.onGround;
      if (onIt && S.input.pressed('interact')) { S.input.consume('interact'); pickUpKnuckles(); }
      else if (S.director && S.director.policy && S.time - E.dropAt > 3) pickUpKnuckles();
      else if (!E.ignoredTip && S.time - E.dropAt > 10) { E.ignoredTip = true; S.world.bark('jin', 'Bare hands won\'t put these two down.', 2.8); }
    }
    if (G.gear.knuckles && !E.vicSpawned && E.pickAt > 0 && S.time - E.pickAt > 1.2) spawnVic();
    if (G.gear.knuckles && !E.vicSpawned && E.pickAt < 0 && E.t > 1.5) { E.pickAt = S.time; }
    // The fire escape is out of reach while they stand between him and it.
    if (Math.abs(j.x - PA.ladder) < 16 && S.input.pressed('up') && S.time - E.ladderTipAt > 3) {
      E.ladderTipAt = S.time; S.world.bark('jin', 'Not while they\'re between me and the ladder.', 2.4);
    }
  }
  function onStep(dt) {
    syncTune();
    const G = S.G;
    if (!G || G.chapter !== N || !S.world || !S.world.jin) { if (E.active) endFight(); return; }
    const j = S.world.jin, id = S.world.locId;
    if (id !== 'pratt_alley' && Array.isArray(S.world.extraLights) && S.world.extraLights.some((l) => l && l.c02))
      S.world.extraLights = S.world.extraLights.filter((l) => !(l && l.c02));
    // Kessler at dusk: a lamp comes on as he passes under it.
    if (id === 'kessler_ave_1996' && phase(G) === 'dusk') {
      for (let i = 0; i < LAMPS.length; i++) if (!G.flags['c02_lamp_' + i] && Math.abs(j.x - LAMPS[i]) < 60) { S.A.flag('c02_lamp_' + i, true); if (S.audio) S.audio.play('buzz', { vol: 0.1 }); }
    }
    const C = S.combat, f = C && C.state ? C.state.fight : null;
    if (f && !f.done && f.id === 'e2_1') { if (!E.active || E.f !== f) beginFight(f); fightStep(dt, f); }
    else if (E.active) endFight();
  }
  function hook() {
    if (hook.done || !S.main || typeof S.main.onStep !== 'function') return;
    hook.done = true;
    S.main.onStep(onStep, true);
  }
  for (const ev of ['chapterStart', 'resumed', 'enterLoc', 'open', 'loaded']) S.events.on(ev, hook);
  S.events.on('hit', (d) => {
    if (!E.active || !d || !S.world) return;
    const j = S.world.jin;
    if (d.attacker === j && !d.blocked && d.opening && d.target && d.target.enemy && d.target.enemy.type === 'collector') {
      if (d.target !== E.lastOpenTarget || S.time - E.lastOpenT > 0.9) E.open++;
      E.lastOpenTarget = d.target; E.lastOpenT = S.time;
    }
    if (d.target === j && d.grab && !E.grabTip) { E.grabTip = true; toast('A grab. [dash] through him before it closes.'); }
  });
  S.events.on('whiff', (d) => {
    if (!E.active || E.whiffTip || !d || !d.actor || !d.actor.enemy) return;
    E.whiffTip = true;
    if (S.world) S.world.bark('jin', 'He missed. That\'s the opening. Two punches, not five.', 2.8);
  });
  S.events.on('needKnuckles', (d) => {
    if (!E.active || E.needTip || !S.world) return;
    E.needTip = true;
    S.world.bark('jin', 'I can hit him all night. He doesn\'t feel it.', 3);
    const b = S.world.actor('c02_e_benny');
    if (b && d && d.enemy === b) S.world.bark(b, 'That all you got, Danny?', 2.2);
  });
  S.events.on('fightRetry', (d) => {
    if (!d || d.id !== 'e2_1' || !S.world) return;
    S.world.bark('jin', 'They nearly had me. Again.', 2.6);
    E.vicSpawned = false; E.t = 0; E.closeT = 0; E.outT = 0; E.grabDone = true;
    if (S.G && S.G.gear.knuckles) E.pickAt = S.time;
    if (E.winded) wind(false);
  });
  S.events.on('chapterStart', () => { if (S.combat && S.combat.body && S.combat.body.dmgMul !== 1 && !E.active) S.combat.body.dmgMul = 1; });

  /* ── Draw hooks (browser only): the brass in the slush, the dryer-vent steam, Room 312's chair ── */
  function drawKnuckles(c) {
    const G = S.G;
    if (!G || G.chapter !== N || !S.world || S.world.locId !== 'pratt_alley') return;
    if (!flag(G, 'c02_knuckles_dropped') || G.gear.knuckles || !E.active) return;
    const k = Math.min(1, (S.time - E.dropAt) / 0.6);
    const x = Math.round(E.kFrom + (PA.pool - E.kFrom) * (1 - Math.pow(1 - k, 3))), y = PA.g - 2;
    c.fillStyle = '#8a6a2a'; c.fillRect(x - 4, y - 2, 8, 2);
    c.fillStyle = '#c9a24a'; c.fillRect(x - 4, y - 3, 8, 1); c.fillRect(x - 4, y - 2, 1, 1); c.fillRect(x - 1, y - 2, 1, 1); c.fillRect(x + 2, y - 2, 1, 1);
    if ((S.time * 3) % 1 < 0.5) { c.fillStyle = '#fff4c8'; c.fillRect(x + 1, y - 4, 1, 1); }
    if (k >= 1 && S.font && S.input) {
      const key = String(S.input.labelFor ? S.input.labelFor('interact') : 'E').toUpperCase();
      S.font.draw(c, '[' + key + '] PICK UP', x, y - 16, { color: '#e8c272', align: 'center', shadow: true });
    }
  }
  function drawVent(c) {
    const G = S.G;
    if (!G || G.chapter !== N || !S.world || S.world.locId !== 'pratt_alley') return;
    const t = S.time;
    for (let i = 0; i < 5; i++) {
      const u = ((t * 0.35 + i / 5) % 1);
      const x = PA.vent + 12 + u * 26 + Math.sin(t + i) * 2, y = PA.g - 76 - u * 40, r = 3 + u * 6;
      c.globalAlpha = 0.22 * (1 - u);
      c.fillStyle = '#d4d8dc';
      c.fillRect(Math.round(x - r), Math.round(y - r / 2), Math.round(r * 2), Math.round(r));
    }
    c.globalAlpha = 1;
  }
  function drawChair(c) {
    const G = S.G;
    if (!G || G.chapter !== N || !S.world || S.world.locId !== 'ymca_312') return;
    const L = S.world.loc, gy = L ? L.ground : 300, x = YM.chair;
    if (flag(G, 'c02_dish_on_chair')) {
      c.fillStyle = '#e4e6ea'; c.fillRect(x - 6, gy - 18, 9, 3);
      c.fillStyle = '#5a7ab8'; c.fillRect(x - 5, gy - 17, 1, 1); c.fillRect(x - 2, gy - 17, 1, 1); c.fillRect(x + 1, gy - 17, 1, 1);
    }
    if (flag(G, 'c02_knuckles_on_chair')) { c.fillStyle = '#c9a24a'; c.fillRect(x + 4, gy - 16, 4, 1); c.fillStyle = '#fff0b8'; c.fillRect(x + 5, gy - 17, 1, 1); }
  }
  if (S.world && typeof S.world.addDraw === 'function') {
    S.world.addDraw('back', drawVent);
    S.world.addDraw('back', drawChair);
    S.world.addDraw('effects', drawKnuckles);
  }

  /* ── Chapter ──────────────────────────────────────────────────────── */
  S.defineChapter({
    id: N, title: 'No One Waiting', date: 'Wednesday, December 18, 1996', place: 'Eastgate, Calder',
    card: ['Two years later. An address on a hospital form.', '412 Kessler Avenue, apartment 3B.'],
    start: { loc: 'c02_bus', x: 330, face: 1, scene: 'c02_start' },
    required: ['kessler_ave_1996', 'kessler_412_stairs_1996', 'okafor_3a', 'iron_pulse', 'iron_pulse_backroom', 'pratt_alley', 'ymca_312'],
    body: { look: 'c02_jin_grown', power: 0.55, speedMul: 1, breath: false, limp: 0 },
    skills: { jab: true, cross: true, guard: true, slip: true, dash: true, backdash: true,
      airdash: false, hook: false, uppercut: false, counter: false, dashStraight: false, flurry: false },
    locations: {
      c02_bus: bus,
      kessler_ave_1996: kessler,
      kessler_412_stairs_1996: stairs412,
      c02_3b_doorway: doorway3b,
      okafor_3a: okafor3a,
      sunnys,
      iron_pulse: ironPulse,
      iron_pulse_backroom: backroom,
      pratt_alley: prattAlley,
      ymca_312: ymca,
      c02_far_garrison: farPlace('Garrison Street', 'The Flats', 'map_garrison'),
      c02_far_annex: farPlace('City Hall Annex', 'Downtown', 'map_downtown'),
      c02_far_route9: farPlace('Starlite Lanes', 'Route 9', 'map_route9'),
    },
    quests: P.withClimb({
      q2_main: { title: 'No One Waiting', kind: 'main', giver: null,
        summary: 'Go home to 412 Kessler. Find out where Umma and Min are. Then find out who sent the van.',
        steps: [
          { text: 'Go home. 412 Kessler Avenue, 3B.', target: { loc: 'kessler_412_stairs_1996', x: ST4.door3b, y: ST4.l3Y } },
          { text: 'Ask someone who\'d know.', target: { loc: 'kessler_412_stairs_1996', x: 120, y: ST4.l3Y } },
          { text: 'Iron Pulse. Teddy sweeps it at night.', target: { loc: 'iron_pulse', x: IP.teddyMop } },
          { text: 'Teddy stays after nine. Sit somewhere and let the evening go.', target: { loc: 'sunnys', x: SUN.booth } },
          { text: 'Iron Pulse. The side door, after nine.', target: { loc: 'iron_pulse_backroom', x: IPB.cot } },
          { text: 'Find a bed. Hana\'s card: Calder YMCA, Front Street.', target: { loc: 'pratt_alley', x: PA.pool } },
          { text: 'Ask him who sent them.', target: { loc: 'pratt_alley', x: PA.benny } },
          { text: 'Find a bed. Hana\'s card: Calder YMCA, Front Street.', target: { loc: 'ymca_312', x: YM.otis } },
          { text: 'Room 312. Get some sleep.', target: { loc: 'ymca_312', x: YM.cot + 14 } },
          { text: 'Find the man who was supposed to protect you.', target: { loc: 'ymca_312', x: YM.cot + 14 } },
        ] },
      q2_posters: { title: 'The poster wall', kind: 'side', summary: 'Three newer posters over his. Peel them back.',
        steps: [{ text: 'Peel back the poster wall.', target: { loc: 'kessler_ave_1996', x: KX.posterWall } }] },
      q2_roof: { title: 'Two lawn chairs', kind: 'side', summary: 'The 412 fire escape still goes all the way to the roof.',
        steps: [{ text: 'Climb the fire escape in Pratt Alley and sit on the roof.', target: { loc: 'pratt_alley', x: PA.chairs, y: PA.roof } }] },
      q2_call_hana: { title: 'Call Hana', kind: 'side', giver: 'hana', summary: 'Her card: "Call me. Before 7 or after 9." A payphone will do.',
        steps: [{ text: 'Call Hana. Before 7 or after 9.', target: { loc: 'ymca_312', x: YM.payphone } }] },
    }),
    evidence: {
      ev_fight_poster: { title: 'The buried poster', kind: 'document', date: 'August 1994',
        text: 'The 1994 fight poster on the Kessler Avenue wall, under three newer ones. Torn across the face.',
        pages: ['CALDER CIVIC ARENA\nSATURDAY, AUGUST 20, 1994\n\nWORLD CHAMPIONSHIP\nRAY "THE CROWN" CASTELL\nvs.\nJIN SEO\nEASTGATE\'S OWN\n\nTickets at the Civic box office and Sunny\'s Diner.',
          '[Torn across the face. Two years of other people\'s Fridays were pasted on top of it: Iron Pulse Fitness, the Rust Belt Revue at Starlite Lanes, Ashgrove Tower, now leasing.]'],
        proves: 'Who he was, two years ago, on this wall.' },
      ev_missing_flyer: { title: 'Min\'s MISSING flyer', kind: 'document', date: 'Autumn 1994',
        text: 'Sun-faded, in the corner of Sunny\'s window. Taped at four corners and once more across a tear.',
        pages: ['MISSING\n\nJIN SEO, 26\nBoxer\n\nLast seen Calder General Hospital 8/22/94\n\nHe did NOT "leave town."\n\nPlease call Min: 555-0143 (eves)\nor ask at Sunny\'s.\n\n[A photocopied photo of Jin in his track top. The phone number is written twice, bigger the second time.]'],
        proves: 'Min searched for him in public. She never believed he left.' },
      ev_returned_letter: { title: 'Returned mail', kind: 'letter', date: 'October 4, 1995',
        text: 'From the shoebox of mail Petra Novak kept for "Seo." A Housing Authority letter that came to 3B after the family had gone.',
        pages: ['CALDER HOUSING AUTHORITY\n200 Market Street\n\nOctober 4, 1995\n\nMrs. Mi-ok Seo\n412 Kessler Avenue, Apt. 3B\n\nRe: Application for emergency housing assistance, No. 95-2217\n\nBefore your application can be reviewed we require:\n  1. Proof of income for all household members.\n  2. A current address, or a statement of the whereabouts, of household member SEO, JIN.\n\nPlease bring these to Window 3 by November 3, 1995, or the application will be closed.',
          '[The envelope: forwarded once, stamped RETURN TO SENDER, and delivered back to 3B anyway. Petra kept it in a shoebox with the menus.]'],
        proves: 'Help came to the wrong address. Their application needed his whereabouts.' },
      ev_okafor_account: { title: 'Mrs. Okafor\'s account', kind: 'record', date: 'December 18, 1996',
        text: 'What Grace Okafor told him in her kitchen.',
        pages: ['They lost the apartment in May 1995: behind on rent, the searching cost money. Umma went to court herself, in her good navy coat.\n\nThey moved to a rooming house on Garrison Street: Lindell House. "For a little while, Grace."\n\nThere was a fire. In February. At night. Both of them.',
          'The county buried them: Calder Municipal, Section 14. Her church put up a cross. Then somebody put up a stone. She doesn\'t know who.\n\nWhat the fire didn\'t take, the county boxed: unclaimed property at the City Hall Annex. Only family can claim it. They keep it a year, until February.'],
        proves: 'The basic facts of their deaths, and where their things are.' },
      ev_pickup_order: { title: 'Benny\'s pickup slip', kind: 'document', date: 'December 1996',
        text: 'Folded in the collector\'s vest.',
        pages: ['PICKUP\n\nAHN, D.\nLast seen: Kessler Ave., Eastgate\nReturn to St. Agnes LTC, 2 West\n\n$150 on delivery\n\nJob via L.V.'],
        proves: 'Pike\'s collectors are hired through Lenny Voss.' },
      bel_dish: { title: 'Umma\'s dish', kind: 'object', date: 'Belonging',
        text: 'Pyrex, blue cornflowers. SEO on masking tape on the bottom, in Umma\'s hand. She brought Mrs. Okafor japchae in it the week before. Mrs. Okafor never gave it back.' },
    },
    memories: {
      mem_roof: { title: 'Everything leaks', when: 'Fourth of July, 1993 — the 412 roof',
        text: 'The two lawn chairs at the parapet, fireworks over the river.\n\nMin: "When you\'re champion, buy a building with a roof that doesn\'t leak."\nJin: "This roof leaks?"\nMin: "Everything leaks, Jin. You\'ve just never been home when it rains."' },
      mem_umbrella: { title: 'Umbrella', when: 'After his first amateur loss — the Kessler & 5th shelter',
        text: 'He came home on the 14 with one eye shut. Umma was waiting at the shelter with two umbrellas.\n\n"You lost. Okay. Umbrella."\n\nShe didn\'t ask how.' },
      mem_first_wraps: { title: 'First wraps', when: 'Marsh Boxing Club, 1982',
        text: 'Teddy wrapping a fourteen-year-old\'s hands on the taping bench.\n\n"Hands up, chin down, mouth shut. In that order."\n\nHe wrapped them twice, because the boy talked the first time.' },
      mem_corner: { title: 'Send him', when: 'Round two, August 20, 1994 (Teddy\'s account, December 1996)',
        text: 'The stool. The towel. "It\'s nerves, kid."\n\nTwo years later, at the cracked mirror: "Your eyes were swimming in the second. I saw it. You told me something was wrong and I called it nerves, because the other thing meant stopping a title fight."\n\nThe rest of the corner is still in pieces.' },
    },
    people: {
      petra: { notes: [{ id: 'met', text: 'Lives in 3B now with her daughter Rosie. Since July \'95.' },
        { id: 'marks', text: 'Painted the kitchen in the summer and stopped at the height marks.' },
        { id: 'mail', text: 'Kept the mail that came for "Seo." Couldn\'t throw it out.' }] },
      rosie: { notes: [{ id: 'met', text: 'Three. Asked if Jin was Santa.' }] },
      okafor: { notes: [{ id: 'met', text: 'Dropped her keys on the landing when she saw him.' },
        { id: 'told', text: 'Told him: the eviction, Lindell House, the fire in February. Gave him Umma\'s dish. "You come back up these stairs."' }] },
      umma: { notes: [{ id: 'c02_okafor', text: 'Went to court herself, in her good navy coat. Hemmed half the church for free that winter so she wouldn\'t have to sit still.' },
        { id: 'c02_umbrella', text: 'Waited at the bus shelter with two umbrellas after his first loss.' }] },
      min: { notes: [{ id: 'c02_flyer', text: 'Put up MISSING flyers. "He did NOT leave town."' },
        { id: 'c02_okafor', text: 'Climbed the stairs with her bag of envelopes: "Mrs. O, today somebody answers."' },
        { id: 'c02_roof', text: '"Everything leaks, Jin. You\'ve just never been home when it rains."' }] },
      rita: { notes: [{ id: 'met', text: 'Coffee on the house.' }, { id: 'c02_min', text: 'Gave Min free refills every Saturday. Min tipped anyway.' }] },
      augie: { notes: [{ id: 'met', text: 'Smokes on Sunny\'s back step.' }, { id: 'towel', text: 'Brought him a towel packed with snow for his hand.' }] },
      teddy: { role: 'Coach Teddy Marsh. Sold the gym; mops Iron Pulse Fitness and sleeps in the back room.',
        notes: [{ id: 'mop', text: 'Mops the aerobics room. Didn\'t look up.' },
          { id: 'haircut', text: 'Cut Jin\'s hair at the cracked mirror. Kept a box: SEO — DON\'T TOSS. "Don\'t make it easy."' }] },
      receptionist: { notes: [{ id: 'met', text: '"Membership\'s nineteen a month. You look like you need it."' }] },
      tomas: { notes: [{ id: 'met', text: 'Unloads cases at Han\'s bay. "Not my business."' }] },
      benny: { notes: [{ id: 'met', text: 'Came for "Daniel Ahn" with a gray van.' },
        { id: 'named', text: 'Named who hires the collectors: Lenny Voss, cutman, at the Cellar under Starlite Lanes.' },
        { id: 'let_go', text: 'Let go. "You\'re not what they said."' }, { id: 'hit_again', text: 'Hit again after he talked.' }] },
      carl: { notes: [{ id: 'met', text: '"Pike said you\'d say that."' }] },
      vic: { notes: [{ id: 'met', text: 'Drove the gray van away with its door open.' }] },
      otis: { notes: [{ id: 'met', text: 'Hana called ahead. First week paid. Room 312.' }] },
      hana: { notes: [{ id: 'c02_call', text: '"Call me anyway. Even if there\'s nothing to say."' }] },
      lenny: { notes: [{ id: 'c02_teddy', text: 'Did the bucket and the bottles on fight night. Quit the week after.' },
        { id: 'c02_named', text: 'Hires Pike\'s collectors now. Does the cuts at the Cellar, under Starlite Lanes on Route 9.' }] },
      pike: { notes: [{ id: 'c02_van', text: 'His collectors came for "Daniel Ahn" in a gray van.' }] },
    },
    scenes, dialogs,
    mapNodes: P.nodes({
      map_eastgate: { locs: ['kessler_ave_1996', 'sunnys', 'iron_pulse', 'kessler_412_stairs_1996', 'okafor_3a', 'iron_pulse_backroom', 'pratt_alley'] },
      map_front_street: { locs: ['ymca_312'], travel: (G) => (flag(G, 'c02_alley_done') ? true : "Through the alley's quicker.") },
      map_garrison: { locs: ['c02_far_garrison'], travel: false, locked: 'Not yet.', when: (G) => flag(G, 'c02_okafor_done') },
      map_downtown: { name: 'Downtown — City Hall Annex', locs: ['c02_far_annex'], travel: false, locked: 'Closed. And I\'m not ready.', when: (G) => flag(G, 'c02_okafor_done') },
      map_route9: { locs: ['c02_far_route9'], travel: false, locked: 'Starlite Lanes. Not tonight. A bed first.', when: (G) => flag(G, 'c02_lenny_named') },
    }),
    canon: {
      flags: { ch2_saw_height_marks: true, ch2_took_mailbox: true, ch2_teddy_tone: 'forgave', ch2_collector_after: 'let_go',
        ch2_called_hana: true, base: 'ymca_312', ch2_complete: true },
      rel: { teddy: 2, hana: 1 },
      evidence: ['ev_fight_poster', 'ev_missing_flyer', 'ev_returned_letter', 'ev_okafor_account', 'ev_pickup_order', 'bel_dish'],
      memories: ['mem_corner', 'mem_roof', 'mem_umbrella', 'mem_first_wraps'],
      people: ['petra', 'rosie', 'okafor', 'rita', 'augie', 'teddy', 'receptionist', 'tomas', 'benny', 'carl', 'vic', 'otis', 'lenny'],
      quests: { q2_main: 'done', q2_posters: 'done', q2_roof: 'done', q2_call_hana: 'done' },
      gear: { knuckles: true },
      visited: ['kessler_ave_1996', 'kessler_412_stairs_1996', 'okafor_3a', 'sunnys', 'iron_pulse', 'iron_pulse_backroom', 'pratt_alley', 'ymca_312'],
    },
    summary: (G) => {
      const out = ['Finding answers becomes personal revenge.'];
      if (flag(G, 'ch2_saw_height_marks')) out.push('You stood in the doorway of 3B.');
      const c = fv(G, 'ch2_collector_after');
      if (c === 'let_go') out.push('You let the collector go.');
      else if (c === 'hit_again') out.push('You hit the collector again after he talked.');
      if (flag(G, 'ch2_called_hana')) out.push('You called Hana.');
      out.push('Lenny Voss does the cuts at the Cellar, under Starlite Lanes. Route 9.');
      return out;
    },
  });
})(window.STORY);
