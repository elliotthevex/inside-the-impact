/* Story Mode — chapters/c99_sandbox.js
   The movement test area from ref-movement-art.pdf §10, registered as chapter 99. It is not in the normal
   chapter list (director.chapterList shows it only in dev builds); story/dev/play.html?ch=99 opens it.
   It doubles as the engine's integration test: S.sandbox.selfTest() drives the real engine through it
   (headless: `osascript -l JavaScript story/dev/headless.js <root> sandbox`; browser: play.html?ch=99&test=1).

   Places
     sb_yard       the back lot (tall map): controls board, bench, fuse box, run lane, a crate wall, plank
                   platforms at three heights and a far plank across a gap (air dash), a stationary dummy and a
                   heavy bag, the sparring corner (bell -> one telegraphed thug), the training corner (every
                   drill, Dell the coach), the locked warehouse door, a ladder to a rooftop, the street edge.
     sb_warehouse  behind the locked door: a modest swarm (two waves, a director in the second).
     sb_street     the avenue past the lot: Rosa's coffee cart (a carry errand), a payphone, a newspaper box,
                   a kid walking his route, a bus stop.
   Main quest sb_tour: read the board -> spar a round -> get Dell's key -> clear the warehouse -> sign out.
   Side: sb_crate (carry), sb_roof (climb); missable: sb_light (repair). Evidence sb_paper, sb_photo (hidden on
   the roof); memory sb_bench.

   Movement checklist (PDF §10 "Verify that I can"): a tracker watches the real controller and events and
   ticks items off (flags sb_chk_*); the controls board lists them. Exports: S.sandbox. */
(function (S) {
  'use strict';

  const N = 99;
  const GROUND = 420;                 // the yard is a tall map: ground at 420 of 480
  const ROOF = 200;                   // rooftop of the tall building
  const P = {                         // plank platforms (one-way) and the crate wall (solid)
    p1: { x: 640, w: 90, y: 376 }, p2: { x: 740, w: 80, y: 332 }, p3: { x: 840, w: 80, y: 288 }, p4: { x: 1060, w: 80, y: 288 },
    crates: { x: 560, w: 30, y: 380, h: 40 },
  };
  const X = {                         // where things stand in the yard
    start: 90, board: 140, bench: 210, fuse: 300, light: 380,
    dummy: 1200, bag: 1250, bell: 1330, ring0: 1340, ring1: 1660,
    balance: 1760, footwork: 1830, laps: 1890, heavyBag: 1950, coach: 2010, drillSpot: 1975,
    whDoor: 2140, ladder: 2214, roof0: 2204, roof1: 2500, view: 2330, photo: 2470, crate: 2550, edge: 2600,
  };
  const W_YARD = 2600;

  const has = (o, fn) => !!o && typeof o[fn] === 'function';
  const flag = (G, k) => !!(G && G.flags && G.flags[k]);

  /* ── Keys, always from the live bindings ──────────────────────────── */
  function key(a) {
    try { return S.input && has(S.input, 'labelFor') ? S.input.labelFor(a) || '?' : '?'; } catch (_) { return '?'; }
  }
  // The pixel font has no arrows: in-world signs spell them out.
  const ARROW_WORDS = { '←': 'LEFT', '→': 'RIGHT', '↑': 'UP', '↓': 'DOWN' };
  const signKey = (a) => String(key(a)).replace(/[←→↑↓]/g, (c) => ARROW_WORDS[c]).toUpperCase();

  const CHECKS = [
    ['reverse', 'Run, stop and turn around cleanly'],
    ['dashCombo', 'Dash in, then jab and cross'],
    ['cancel', 'Cut a punch short with a dash or a slip'],
    ['slipCounter', 'Slip a strike, then counter by hand'],
    ['launch', 'Uppercut a man into the air and hit him again'],
    ['switch', 'Switch targets mid-exchange'],
    ['airdash', 'Air-dash across the gap to the far plank'],
  ];

  function controlsDoc(G) {
    const k = key;
    const ticks = CHECKS.map(([id, text]) => (flag(G, 'sb_chk_' + id) ? '[x] ' : '[  ] ') + text).join('\n');
    return {
      id: 'sb_controls', title: 'Back lot — how it works', kind: 'document',
      pages: [
        'MOVE  ' + k('left') + ' / ' + k('right') + '   (' + k('run') + ' switches between running and walking)\n' +
        'JUMP  ' + k('jump') + ' — tap for a hop, hold for the full jump. You can steer in the air.\n' +
        'DROP  ' + k('down') + ' + ' + k('jump') + ' on a plank drops through it.\n' +
        'GUARD hold ' + k('down') + ' on the ground.\n' +
        'LADDERS and DOORS  ' + k('up') + ' / ' + k('down') + ' to climb; ' + k('interact') + ' or ' + k('up') + ' at a door.\n' +
        'TALK, EXAMINE, USE  ' + k('interact') + '.',
        'PUNCH  ' + k('punch') + ' — press again for jab, cross, hook. Stop after any of them.\n' +
        'UPPERCUT  ' + k('down') + ' + ' + k('punch') + ' — lifts lighter men; jump and hit them again.\n' +
        'DASH  ' + k('dash') + ' — two charges, refilling one at a time; once in the air.\n' +
        '  Dash away while guarding or punching and you keep your facing: a backdash.\n' +
        '  ' + k('punch') + ' during a forward dash: dash straight. Out of a backdash: a returning cross.\n' +
        'SLIP  ' + k('slip') + ' — just before a strike lands. A real slip opens a counter: press ' + k('punch') + ' right away.\n' +
        'FLURRY  ' + k('flurry') + ' — a short burst with a finisher.',
        'JOURNAL ' + k('journal') + '   MAP ' + k('map') + '   MINIMAP ' + k('minimap') + '   PAUSE ' + k('pause') + '\n' +
        'Every key can be changed under Pause > Controls.\n\n' +
        'CHECKLIST (ticks itself as you go)\n' + ticks,
      ],
    };
  }

  /* ── Main quest progress, derived from flags so any order works ───── */
  function tourStep(G) {
    if (!flag(G, 'sb_read_board')) return 0;
    if (!flag(G, 'sb_spar')) return 1;
    if (!flag(G, 'sb_key')) return 2;
    if (!flag(G, 'sb_swarm')) return 3;
    return 4;
  }
  function syncTour(A, G) {
    const q = G.quests.sb_tour;
    if (!q || q.state !== 'active') return;
    const n = tourStep(G);
    if (q.step !== n) A.quest('sb_tour', 'step', n);
  }

  /* ── Looks (inline, so the sandbox does not depend on cast.js) ─────── */
  const LOOK = {
    coach: { h: 45, build: 'old', skin: '#9c7254', hair: { style: 'gray_short', color: '#8f8a84' }, top: { kind: 'hoodie', color: '#3d4a3e' },
      bottom: { kind: 'sweats', color: '#2a2c30' }, shoes: '#bdb6a6', extras: ['clipboard', 'mustache:#8f8a84', 'watch'] },
    rosa: { h: 43, build: 'avg', skin: '#b5835f', hair: { style: 'bun', color: '#2a1d16' }, top: { kind: 'cardigan', color: '#6b3b34', color2: '#c9bda4' },
      bottom: { kind: 'long_skirt', color: '#2f3442' }, shoes: '#3a2f2a', extras: ['apron:#cfc8b6'] },
    kid: { h: 31, build: 'kid', skin: '#8d5f43', hair: { style: 'short', color: '#1f1a17' }, top: { kind: 'tee', color: '#a8842f' },
      bottom: { kind: 'shorts', color: '#3a4a66' }, shoes: '#d8d2c4', extras: ['cap:#7a2c2a'] },
  };

  /* ── Locations ────────────────────────────────────────────────────── */
  // The yard is a builder so the in-world controls sign shows the player's own keys.
  function yard() {
    const sign = [
      'MOVE ' + signKey('left') + '/' + signKey('right'), 'JUMP ' + signKey('jump'), 'PUNCH ' + signKey('punch'),
      'DASH ' + signKey('dash'), 'SLIP ' + signKey('slip'), 'FLURRY ' + signKey('flurry'), 'USE ' + signKey('interact'),
    ];
    return {
      name: 'Back Lot', area: 'Sandbox', kind: 'exterior', w: W_YARD, h: 480, ground: GROUND,
      sky: 'dusk', backdrop: 'skyline', weather: 'drizzle', groundStyle: 'alley',
      ambient: { dark: 0.42, tint: '#2a3550', fog: 0.12 }, sound: { loop: 'city', vol: 0.5 },
      camera: { zoom: 1 },
      map: 'sb_lot',
      layers: {
        far: [{ t: 'smokestack', x: 300, h: 150 }, { t: 'smokestack', x: 900, h: 120 }, { t: 'bridge', x: 1200, w: 600 }],
        mid: [
          { t: 'building', x: -40, w: 260, h: 230, style: 'brick_dark', floors: 4, windows: { cols: 5, lit: 0.25, seed: 3 }, roof: { tank: true, antenna: true } },
          { t: 'building', x: 520, w: 300, h: 260, style: 'brick', floors: 5, windows: { cols: 6, lit: 0.35, seed: 7 }, fireEscape: true },
          { t: 'building', x: 1100, w: 280, h: 210, style: 'siding', floors: 4, windows: { cols: 5, lit: 0.2, seed: 11 } },
          { t: 'building', x: 1640, w: 320, h: 250, style: 'brick_red', floors: 5, windows: { cols: 6, lit: 0.3, seed: 13 }, roof: { antenna: true } },
          { t: 'wires', x0: 0, x1: 1400, y: 150, sag: 18 },
        ],
        back: [
          // Left: the board, the bench, the fuse box and the yard light (dark until the fuse is fixed).
          { t: 'wall', x: 0, w: 520, h: 120, style: 'brick' },
          { t: 'notice', x: X.board, y: GROUND - 64, lines: sign },
          { t: 'bulletin_board', x: X.board - 20, y: GROUND - 96, w: 40, h: 24 },
          { t: 'bench', x: X.bench, kind: 'park' },
          { t: 'sign', x: X.fuse - 14, y: GROUND - 66, text: 'FUSES', color: '#5a6168', w: 28 },
          // Two lamps, one shown at a time: when() is re-checked whenever a flag changes (the layer re-bakes).
          { t: 'streetlight', x: X.light, on: false, when: (g) => !flag(g, 'sb_light_on') },
          { t: 'streetlight', x: X.light, on: true, when: (g) => flag(g, 'sb_light_on') },
          { t: 'trashbags', x: 470, n: 3 },
          // The plank course and the crate wall.
          { t: 'crates', x: P.crates.x + 15, n: 4, stack: 2 },
          { t: 'scaffold', x: P.p1.x, w: P.p1.w, h: GROUND - P.p1.y },
          { t: 'scaffold', x: P.p2.x, w: P.p2.w, h: GROUND - P.p2.y },
          { t: 'scaffold', x: P.p3.x, w: P.p3.w, h: GROUND - P.p3.y },
          { t: 'scaffold', x: P.p4.x, w: P.p4.w, h: GROUND - P.p4.y },
          { t: 'poster', x: 980, y: GROUND - 70, kind: 'boxing', torn: true },
          // Dummy and bag (actors spawned by the enter scene) under a pipe frame.
          { t: 'pipes', x: X.dummy - 30, w: 110, y: GROUND - 66 },
          { t: 'mat', x: X.dummy - 30, w: 110, color: '#3a3a44' },
          // The sparring corner.
          { t: 'mat', x: X.ring0, w: X.ring1 - X.ring0, color: '#3a4a6a' },
          { t: 'corner_stool', x: X.ring0 + 14 }, { t: 'bucket', x: X.ring0 + 30 },
          { t: 'sign', x: X.bell - 18, y: GROUND - 80, text: 'RING FOR A ROUND', color: '#7c3a31', w: 70 },
          { t: 'fence', x: X.ring1 + 10, w: 30, kind: 'chain' },
          // The training corner.
          { t: 'mat', x: 1710, w: 330, color: '#4a3a3a' },
          { t: 'parallel_bars', x: X.balance - 40, w: 80 },
          // The bag hangs from a scaffold gantry (an outdoor heavy_bag's chain runs from ground - 210).
          { t: 'scaffold', x: X.heavyBag - 34, w: 68, h: 210 },
          { t: 'heavy_bag', x: X.heavyBag },
          { t: 'speed_bag', x: X.heavyBag + 34 },
          { t: 'chalkboard', x: 1790, y: GROUND - 118, w: 70, h: 40, lines: ['BALANCE', 'FOOTWORK', 'LAPS', 'BAG', 'PADS'] },
          // Warehouse (low) and the tall building with its ladder and rooftop.
          { t: 'building', x: X.whDoor - 60, w: 120, h: 150, style: 'concrete', floors: 2, windows: { cols: 2, lit: 0, seed: 21 }, cornice: false },
          { t: 'door', x: X.whDoor, kind: 'metal', color: '#4a4f48', label: 'NO. 2' },
          { t: 'building', x: X.roof0 - 4, w: X.roof1 - X.roof0 + 4, h: GROUND - ROOF, style: 'brick', floors: 4, windows: { cols: 6, lit: 0.4, seed: 23 }, cornice: true },
          { t: 'water_tank', x: 2420, y: ROOF },
          { t: 'pole', x: 2480, y: ROOF, h: 40 },
          { t: 'pallet', x: X.crate - 12, n: 2 }, { t: 'crates', x: X.crate + 18, n: 2, stack: 1 },
          { t: 'dumpster', x: 2420, color: '#3f5246' },
        ],
        front: [{ t: 'puddle', x: 300, w: 60 }, { t: 'puddle', x: 1500, w: 80 }],
        fore: [{ t: 'pipes', x: 1480, w: 140, y: 40 }],
      },
      solids: [
        { x: P.crates.x, y: P.crates.y, w: P.crates.w, h: P.crates.h },
        { x: P.p1.x, y: P.p1.y, w: P.p1.w, oneway: true, style: 'wood' },
        { x: P.p2.x, y: P.p2.y, w: P.p2.w, oneway: true, style: 'wood' },
        { x: P.p3.x, y: P.p3.y, w: P.p3.w, oneway: true, style: 'wood' },
        { x: P.p4.x, y: P.p4.y, w: P.p4.w, oneway: true, style: 'wood' },
        { x: X.roof0, y: ROOF, w: X.roof1 - X.roof0, oneway: true },
      ],
      ladders: [{ x: X.ladder, y0: ROOF, y1: GROUND }],
      lights: [{ x: X.coach - 40, y: GROUND - 120, r: 110, color: '#e8b35a', k: 0.55, flicker: 0.1 }, { x: X.bell + 150, y: GROUND - 110, r: 120, color: '#e8b35a', k: 0.5 }],
      training: {
        balance: { x: X.balance }, footwork: { x: X.footwork }, conditioning: { x: X.laps }, bag: { x: X.heavyBag },
        reaction: { x: X.drillSpot, coach: 'sb_coach' }, mitts: { x: X.drillSpot, coach: 'sb_coach' },
      },
      points: { start: { x: X.start, y: GROUND }, roof: { x: 2300, y: ROOF }, train: { x: X.footwork, y: GROUND } },
      doors: [
        { id: 'sb_wh_door', x: X.whDoor, to: 'sb_warehouse', tx: 70, face: 1, label: 'Warehouse', verb: 'Enter', kind: 'door',
          locked: (g) => (flag(g, 'sb_key') ? false : 'Chained from the inside. Dell keeps the key.') },
        { id: 'sb_to_street', x: X.edge, to: 'sb_street', tx: 30, face: 1, label: 'Avenue', kind: 'edge', side: 'right', auto: true },
      ],
      npcs: [
        { id: 'sb_coach', look: LOOK.coach, name: 'Dell', x: X.coach, face: -1, pose: 'armsCrossed', talk: 'sb_coach_talk',
          idles: ['armsCrossed', 'handsHips', 'armsCrossed', 'point'],
          barks: (g) => (flag(g, 'sb_key') ? ['Bring the key back when you are done.', 'Hands up. Always.'] : ['Bell is over there if you want a round.', 'Feet first. Then hands.']),
          marker: (g) => (tourStep(g) === 2 ? '!' : null) },
      ],
      objects: [
        { id: 'sb_board', x: X.board, label: 'Controls board', verb: 'Read', run: 'sb_board' },
        { id: 'sb_bench', x: X.bench, label: 'Bench', verb: 'Sit', pose: 'sit', face: 1, memory: 'sb_bench',
          text: ['Rain on the planks. Somebody hosed the mat down this morning.', 'Feels like the old gym, if the old gym had no roof.'] },
        { id: 'sb_fuse', x: X.fuse, label: 'Fuse box', verb: 'Use', run: 'sb_fuse', when: (g) => !flag(g, 'sb_light_on') },
        { id: 'sb_bell', x: X.bell, label: 'Ring bell', verb: 'Use', run: 'sb_bell' },
        { id: 'sb_t_balance', x: X.balance, label: 'Balance bars', verb: 'Use', run: 'sb_train_balance' },
        { id: 'sb_t_footwork', x: X.footwork, label: 'Footwork marks', verb: 'Use', run: 'sb_train_footwork' },
        { id: 'sb_t_laps', x: X.laps, label: 'Laps', verb: 'Use', run: 'sb_train_conditioning' },
        { id: 'sb_t_bag', x: X.heavyBag, label: 'Heavy bag', verb: 'Use', run: 'sb_train_bag' },
        { id: 'sb_view', x: X.view, y: ROOF, label: 'Ledge', verb: 'Sit', pose: 'sitCurb', face: 1, zoom: 0.8,
          text: ['From up here the lot looks like a ring somebody forgot to put ropes on.', 'The river is out there. You can smell it.'] },
        { id: 'sb_photo', x: X.photo, y: ROOF, label: 'Snapshot', verb: 'Take', evidence: 'sb_photo', doc: true, hidden: true, once: true },
        { id: 'sb_crate', x: X.crate, label: 'Coffee crate', verb: 'Take', run: 'sb_crate', when: (g) => !flag(g, 'sb_crate_delivered') },
      ],
      triggers: [{ id: 'sb_roof_trig', x0: X.roof0 + 40, x1: X.roof1, y0: ROOF - 60, y1: ROOF + 4, run: 'sb_roof' }],
      enter: 'sb_yard_enter',
    };
  }

  const warehouse = {
    name: 'Warehouse No. 2', area: 'Sandbox', kind: 'interior', w: 900, h: 360, ground: 300,
    room: { wall: '#3a3532', wall2: '#2c2a2a', floor: '#2a2b2e', pattern: 'concrete', ceiling: 58, trim: '#4a4440' },
    ambient: { dark: 0.5, tint: '#2c3040', fog: 0.05 }, sound: { loop: 'hum', vol: 0.35 },
    map: 'sb_lot',
    layers: {
      back: [
        { t: 'door', x: 50, kind: 'metal', color: '#4a4f48' },
        { t: 'shelving', x: 160, w: 120, h: 90, stock: 'boxes' },
        { t: 'pallet', x: 330, n: 3 }, { t: 'crates', x: 380, n: 5, stack: 3 },
        { t: 'forklift', x: 560 },
        { t: 'roll_door', x: 760, w: 90, open: false },
        { t: 'ceiling_light', x: 200, kind: 'fluorescent', flicker: 0.3 },
        { t: 'ceiling_light', x: 480, kind: 'fluorescent' },
        { t: 'ceiling_light', x: 760, kind: 'fluorescent', flicker: true },
        { t: 'boxes', x: 690, n: 4 },
      ],
    },
    doors: [{ id: 'sb_wh_exit', x: 50, to: 'sb_yard', tx: X.whDoor, face: -1, label: 'Back lot', verb: 'Leave', kind: 'door' }],
    objects: [
      { id: 'sb_shutter', x: 800, label: 'Shutter', verb: 'Knock', run: 'sb_swarm_again', when: (g) => flag(g, 'sb_swarm') },
      { id: 'sb_ledger', x: 210, label: 'Clipboard', verb: 'Read', text: ['Inventory: forty crates, thirty-nine checked. Somebody always takes one.'] },
    ],
    triggers: [{ id: 'sb_wh_trig', x0: 260, x1: 300, run: 'sb_swarm' }],
    points: { arena: { x: 480, y: 300 } },
  };

  const street = {
    name: 'Kessler Avenue (test block)', area: 'Sandbox', kind: 'exterior', w: 1200, h: 360, ground: 300,
    sky: 'dusk', backdrop: 'rowhouses', weather: 'drizzle', groundStyle: 'street',
    ambient: { dark: 0.35, tint: '#2a3550', fog: 0.08 }, sound: { loop: 'traffic', vol: 0.4 },
    map: 'sb_ave',
    layers: {
      far: [{ t: 'bridge', x: 400, w: 500 }],
      back: [
        { t: 'building', x: 20, w: 220, h: 200, style: 'brick', floors: 3, shop: { sign: 'CORNER STORE', color: '#7c3a31', awning: true, window: 'lit' } },
        { t: 'building', x: 250, w: 220, h: 230, style: 'brick_red', floors: 4, windows: { cols: 5, lit: 0.4, seed: 31 }, fireEscape: true },
        { t: 'building', x: 480, w: 200, h: 180, style: 'siding', floors: 3, windows: { cols: 4, lit: 0.3, seed: 33 } },
        { t: 'building', x: 690, w: 300, h: 240, style: 'brick', floors: 4, windows: { cols: 6, lit: 0.45, seed: 35 }, shop: { sign: 'LAUNDRY', color: '#3d5168', window: 'lit' } },
        { t: 'building', x: 1000, w: 220, h: 200, style: 'brick_dark', floors: 3, windows: { cols: 4, lit: 0.2, seed: 37 } },
        { t: 'table', x: 300, w: 40, kind: 'cart' }, { t: 'awning', x: 292, w: 56, color: '#7c3a31', stripes: true },
        { t: 'payphone', x: 520 },
        { t: 'newspapers', x: 600 }, { t: 'mailbox', x: 640 },
        { t: 'hydrant', x: 760 }, { t: 'streetlight', x: 450, on: true }, { t: 'streetlight', x: 900, on: true, flicker: 0.4 },
        { t: 'bus_stop', x: 1040, sign: 'LINE 4' }, { t: 'planter', x: 180, flowers: true },
        { t: 'poster', x: 560, y: 240, kind: 'concert' }, { t: 'poster', x: 576, y: 244, kind: 'missing', torn: true },
      ],
      front: [{ t: 'car', x: 840, color: '#4a5560', kind: 'sedan', face: -1 }],
    },
    doors: [{ id: 'sb_to_yard', x: 0, to: 'sb_yard', tx: X.edge - 30, face: -1, label: 'Back lot', kind: 'edge', side: 'left', auto: true }],
    npcs: [
      { id: 'sb_rosa', look: LOOK.rosa, name: 'Rosa', x: 330, face: -1, pose: 'idle', talk: 'sb_rosa_talk', idles: ['idle', 'work', 'idle', 'drink'],
        barks: (g) => (flag(g, 'sb_crate_delivered') ? ['Coffee is on me today.'] : ['My crate is still sitting in that lot.', 'Coffee! Hot, mostly.']),
        marker: (g) => { const q = g.quests.sb_crate; return !q ? '!' : q.state === 'active' && q.step >= 1 ? '?' : null; } },
      { id: 'sb_kid', look: LOOK.kid, name: 'Tavi', x: 700, face: 1, talk: 'sb_kid_talk', loop: true, barkRadius: 80,
        path: [{ x: 660, wait: 2, pose: 'idle' }, { x: 920, wait: 1.2, pose: 'point' }],
        barks: ['You a boxer? You walk like one.', 'The bus is always late on Sundays.', 'My brother says the lot is haunted.'] },
    ],
    objects: [
      { id: 'sb_phone', x: 520, label: 'Payphone', verb: 'Call', run: 'sb_payphone' },
      { id: 'sb_paper', x: 600, label: 'Newspaper box', verb: 'Read', evidence: 'sb_paper', doc: true },
      { id: 'sb_busstop', x: 1040, label: 'Bus schedule', verb: 'Read', text: ['LINE 4. Every twenty minutes. Someone wrote "LIES" under it in marker.'] },
    ],
    points: { cart: { x: 360, y: 300 } },
  };

  /* ── Scenes ───────────────────────────────────────────────────────── */
  const scenes = {
    *sb_start(A, G) {
      yield A.wait(0.4);
      yield A.think('The back lot behind the gym. Somebody set it up for practice: planks, a bag, a ring with no ropes.');
      A.quest('sb_tour', 'start');
      if (!G.quests.sb_light) A.quest('sb_light', 'start');
      A.meet('sb_coach');
      yield A.think('The board by the gate first.');
    },
    // Spawns the dummy and the bag every time the yard is entered (actors are rebuilt on entry).
    *sb_yard_enter() {
      const C = S.combat;
      if (!C || !has(C, 'spawnEnemy') || !S.world) return;
      if (!S.world.actor('sb_dummy')) C.spawnEnemy({ id: 'sb_dummy', type: 'dummy', x: X.dummy, face: -1, name: 'Dummy' });
      if (!S.world.actor('sb_bag')) C.spawnEnemy({ id: 'sb_bag', type: 'bag', x: X.bag, face: -1, name: 'Heavy bag' });
    },
    *sb_board(A, G) {
      if (tourStep(G) >= 4) {
        const v = yield A.choice('Everything on the list is done.', [
          { text: 'Sign out and leave the lot.', value: 'out', autoplay: true, record: 'Signed out of the back lot.' },
          { text: 'Read the board again.', value: 'read' },
          { text: 'Not yet.', value: 'stay' },
        ]);
        if (v === 'out') {
          A.quest('sb_tour', 'done');
          yield A.think('Good session.');
          yield A.endChapter();
          return;
        }
        if (v !== 'read') return;
      }
      A.sound('paper');
      yield A.doc(controlsDoc(G));
      if (!flag(G, 'sb_read_board')) {
        A.flag('sb_read_board');
        syncTour(A, G);
        yield A.think('Bell for a round. Dell has the warehouse key. Then sign out here.');
      }
    },
    *sb_bell(A, G) {
      A.sound('bell');
      yield A.think(flag(G, 'sb_spar') ? 'Another round.' : 'One man, one round. Watch his shoulders.');
      const r = yield A.fight({
        id: 'sb_spar', arena: { x0: X.ring0, x1: X.ring1 }, maxAttackers: 1, checkpoint: false,
        waves: [{ enemies: [{ type: 'thug', x: X.ring1 - 50, face: -1, name: 'Sparring thug' }] }],
        tips: [{ text: 'He flashes before he swings. [slip] just before it lands, then [punch].', at: 'start' },
          { text: 'He missed: that opening is yours.', at: 'firstWhiff' }, { text: 'Now [punch]: the counter is open.', at: 'firstSlip' }],
      });
      if (r && r.won) {
        A.sound('bell3');
        if (!flag(G, 'sb_spar')) { A.flag('sb_spar'); syncTour(A, G); yield A.think('Still got it. Some of it.'); }
      }
    },
    *sb_fuse(A, G) {
      const r = yield A.activity('repair', { label: 'Fuse box', steps: [
        { prompt: 'Pull the old fuse', action: 'interact', hold: 0.6 },
        { prompt: 'Seat the new one', action: 'up', count: 2 },
        { prompt: 'Throw the switch', action: 'punch' },
      ] });
      if (r && r.ok === false) { yield A.think('Later.'); return; }
      A.sound('buzz');
      A.flag('sb_light_on');
      A.quest('sb_light', 'done');
      yield A.think('Light. Somebody will be glad of that.');
    },
    *sb_roof(A, G) {
      A.quest('sb_roof', 'done');
      yield A.think('Up top. The whole lot laid out like a floor plan.');
    },
    *sb_swarm(A, G) {
      if (flag(G, 'sb_swarm')) return;
      yield A.think('Company.');
      const r = yield* A.sub('sb_swarm_fight');
      if (r && r.won) {
        A.flag('sb_swarm');
        syncTour(A, G);
        yield A.think('Done. Back to the board.');
      }
    },
    *sb_swarm_again(A) {
      yield A.think('They heard that.');
      yield* A.sub('sb_swarm_fight');
    },
    *sb_swarm_fight(A) {
      const r = yield A.fight({
        id: 'sb_swarm', arena: { x0: 110, x1: 880 }, maxAttackers: 2, checkpoint: true,
        waves: [
          { enemies: [{ type: 'thug', x: 640, face: -1 }, { type: 'thug', x: 720, face: -1 }, { type: 'thug', x: 150, face: 1 }] },
          { delay: 1.2, enemies: [{ type: 'thug', x: 820, face: -1 }, { type: 'enforcer', x: 760, face: -1 }, { type: 'director', x: 860, face: -1, name: 'Foreman' }] },
        ],
        tips: [{ text: 'Two at a time, at most. Keep moving so the rest wait.', at: 'start' }, { text: 'The foreman makes them faster. Get to him first.', at: 'firstWhiff' }],
      });
      return r;
    },
    *sb_crate(A, G) {
      const q = G.quests.sb_crate;
      if (!q || q.state !== 'active') { yield A.think("Somebody's coffee crate. Not mine to move."); return; }
      const r = yield A.activity('carry', { item: 'crate', label: 'Coffee crate', to: { loc: 'sb_street', x: 360 } });
      if (r && (r.delivered || r.ok)) {
        A.flag('sb_crate_delivered');
        A.quest('sb_crate', 'step', 1);
      }
    },
    *sb_payphone(A) {
      A.sound('dial');
      const v = yield A.choice('Who to call?', [
        { text: 'Dell at the gym.', value: 'dell' },
        { text: 'Nobody. Hang up.', value: 'none' },
      ]);
      if (v === 'dell') { yield A.wait(0.6); yield A.say(null, 'It rings eleven times. Nobody picks up.'); }
      else yield A.think('Saved a quarter.');
    },
    *sb_train_balance(A) { yield A.activity('train_balance', {}); },
    *sb_train_footwork(A) { yield A.activity('train_footwork', {}); },
    *sb_train_conditioning(A) { yield A.activity('train_conditioning', {}); },
    *sb_train_bag(A) { yield A.activity('train_bag', {}); },
  };

  const dialogs = {
    *sb_coach_talk(A, G) {
      const first = !flag(G, 'sb_met_coach');
      if (first) {
        A.flag('sb_met_coach');
        A.meet('sb_coach', 'met');
        yield A.say('sb_coach', 'You are the one Teddy sent? Good. The lot is yours as long as you put things back.');
      }
      const opts = [];
      if (!flag(G, 'sb_key')) opts.push({ text: 'I need the warehouse key.', value: 'key', autoplay: true });
      opts.push({ text: 'Hold the pads for me.', value: 'drill' });
      opts.push({ text: S.combat && S.combat.body && S.combat.body.breath ? 'Train me like I am healthy.' : 'Train me like I am hurt.', value: 'breath' });
      opts.push({ text: "That's all.", value: 'bye' });
      const v = yield A.choice(first ? 'What do you need?' : 'Back again. What is it?', opts, { who: 'sb_coach' });
      if (v === 'key') {
        A.flag('sb_key');
        A.meet('sb_coach', 'key');
        A.sound('pickup');
        yield A.say('sb_coach', 'Second door from the end. There are men in there who think it is their warehouse. Show them otherwise.');
        syncTour(A, G);
      } else if (v === 'drill') {
        const d = yield A.choice('Which one?', [
          { text: 'Reaction pads.', value: 'train_reaction' },
          { text: 'Mitt work.', value: 'train_mitts' },
          { text: 'Balance.', value: 'train_balance' },
          { text: 'Footwork.', value: 'train_footwork' },
          { text: 'Laps.', value: 'train_conditioning' },
          { text: 'The heavy bag.', value: 'train_bag' },
        ], { who: 'sb_coach' });
        yield A.say('sb_coach', 'Hands up.');
        yield A.activity(d, { coach: 'sb_coach' });
      } else if (v === 'breath') {
        const on = !(S.combat && S.combat.body && S.combat.body.breath);
        A.body({ breath: on });
        yield A.say('sb_coach', on ? 'All right. Every punch costs you now. Watch the meter.' : 'Fresh legs, then. Enjoy it.');
      } else yield A.say('sb_coach', 'Feet first.');
    },
    *sb_rosa_talk(A, G) {
      const q = G.quests.sb_crate;
      A.meet('sb_rosa', 'met');
      if (!q) {
        yield A.say('sb_rosa', 'You came from the lot? My coffee crate is still back there by the pallets. My back says no.');
        const v = yield A.choice(null, [
          { text: "I'll bring it.", value: 'yes', autoplay: true },
          { text: 'Not right now.', value: 'no' },
        ]);
        if (v === 'yes') { A.quest('sb_crate', 'start'); yield A.say('sb_rosa', 'Bless you. Mind the puddles.'); }
        else yield A.say('sb_rosa', 'It will keep.');
        return;
      }
      if (q.state === 'active' && q.step >= 1) {
        A.quest('sb_crate', 'done');
        A.meet('sb_rosa', 'crate');
        yield A.say('sb_rosa', 'There it is. Here, for your trouble, and a cup on the house.');
        return;
      }
      if (q.state === 'done') { yield A.say('sb_rosa', 'Same time tomorrow? I am joking. Mostly.'); return; }
      yield A.say('sb_rosa', 'By the pallets, at the far end of the lot.');
    },
    *sb_kid_talk(A, G) {
      A.meet('sb_kid', 'met');
      yield A.say('sb_kid', flag(G, 'sb_spar') ? 'I saw you in the lot! You slipped right under him.' : 'Are you going to fight in the lot? Can I watch?');
      yield A.think('He walks the same route every time. Like a man on a shift.');
    },
  };

  /* ── Chapter ──────────────────────────────────────────────────────── */
  S.defineChapter({
    id: N, title: 'Back Lot', date: 'Any evening', place: 'Sandbox',
    card: ['A practice yard for the engine.', 'Nothing here is part of the story.'],
    start: { loc: 'sb_yard', x: X.start, face: 1, scene: 'sb_start' },
    required: ['sb_yard', 'sb_warehouse'],     // the avenue is optional (headless chapter runs report unvisited required places)
    body: { look: 'jin_street', power: 1, speedMul: 1, breath: false, limp: 0 },
    skills: { jab: true, cross: true, hook: true, uppercut: true, counter: true, dashStraight: true, flurry: true, guard: true, slip: true, dash: true, backdash: true, airdash: true },
    locations: { sb_yard: yard, sb_warehouse: warehouse, sb_street: street },
    quests: {
      sb_tour: { title: 'Shakedown', kind: 'main', giver: 'sb_coach', summary: 'Try everything the lot has, then sign out at the board.',
        steps: [
          { text: 'Read the board by the gate.', target: { loc: 'sb_yard', x: X.board } },
          { text: 'Ring the bell and spar a round.', target: { loc: 'sb_yard', x: X.bell } },
          { text: 'Ask Dell for the warehouse key.', target: { loc: 'sb_yard', x: X.coach } },
          { text: 'Clear out the warehouse.', target: { loc: 'sb_warehouse', x: 420 } },
          { text: 'Sign out at the board.', target: { loc: 'sb_yard', x: X.board } },
        ] },
      sb_crate: { title: "Rosa's crate", kind: 'side', giver: 'sb_rosa', summary: 'Carry the coffee crate from the lot to her cart on the avenue.',
        steps: [
          { text: 'Carry the crate from the lot to Rosa’s cart.', target: { loc: 'sb_yard', x: X.crate } },
          { text: 'Tell Rosa.', target: { loc: 'sb_street', x: 330 } },
        ], reward: { money: 5, rel: { sb_rosa: 1 } } },
      sb_roof: { title: 'Up top', kind: 'side', summary: 'Climb the ladder to the roof.', steps: [{ text: 'Climb to the roof.', target: { loc: 'sb_yard', x: X.ladder } }] },
      sb_light: { title: 'Yard light', kind: 'missable', summary: 'The yard light is out. The fuse box is by the bench.',
        steps: [{ text: 'Fix the fuse box.', target: { loc: 'sb_yard', x: X.fuse } }] },
    },
    evidence: {
      sb_paper: { title: 'Calder Courier, Sunday', kind: 'document', date: 'Any Sunday',
        text: 'A folded newspaper from the box on the avenue.',
        pages: ['CALDER COURIER — SUNDAY\n\nFOUNDRY LAYOFFS: "NO MORE CUTS," SAYS MANAGEMENT\n\nThe third round this year.',
          'SPORTS\n\nCivic Arena card set for August. Local boy on the undercard.\n\n(The sandbox paper. Page two works too.)'] },
      sb_photo: { title: 'Snapshot on the roof', kind: 'photo', date: 'Unknown',
        text: 'A faded snapshot wedged under the water tank: two kids on this roof, holding up a trophy made of a tin can.' },
    },
    memories: {
      sb_bench: { title: 'Rain on the mat', text: 'Sitting in the lot, the smell of wet canvas brings back the first gym: a radio, a broom, a coach who never sat down.', when: 'Sandbox' },
    },
    people: {
      sb_coach: { name: 'Dell', role: 'Runs the back lot', look: LOOK.coach,
        notes: [{ id: 'met', text: 'Keeps the lot open for anyone who puts things back.' }, { id: 'key', text: 'Trusted Jin with the warehouse key.' }] },
      sb_rosa: { name: 'Rosa', role: 'Coffee cart on the avenue', look: LOOK.rosa,
        notes: [{ id: 'met', text: 'Sells coffee from a cart. Her back hurts.' }, { id: 'crate', text: 'Got her crate back.' }] },
      sb_kid: { name: 'Tavi', role: 'Kid on the avenue', look: LOOK.kid, notes: [{ id: 'met', text: 'Walks the same route every day.' }] },
    },
    scenes, dialogs,
    mapNodes: [
      { id: 'sb_lot', name: 'Back lot', x: 230, y: 200, locs: ['sb_yard', 'sb_warehouse'], travel: true },
      { id: 'sb_ave', name: 'Avenue (test block)', x: 420, y: 140, locs: ['sb_street'], travel: true },
    ],
    summary: (G) => {
      const done = CHECKS.filter(([id]) => flag(G, 'sb_chk_' + id)).length;
      return ['Movement checklist: ' + done + ' / ' + CHECKS.length + '.', 'Drills at level 1 or better: ' +
        ['balance', 'footwork', 'reaction', 'conditioning', 'bag', 'mitts'].filter((k) => (G.train[k] | 0) >= 1).length + ' / 6.'];
    },
  });

  /* ── Movement checklist tracker ───────────────────────────────────── */
  const trk = { hooked: false, prev: null, lastDashEnd: -9, airDashAt: -9, jabAt: -9, slipOkAt: -9, launched: null, launchAt: -9,
    lastTarget: null, lastTargetAt: -9, runDir: 0, runAt: -9 };
  const inSandbox = () => !!(S.G && S.G.chapter === N && S.world && S.world.jin);
  function mark(id) {
    if (!inSandbox()) return;
    const k = 'sb_chk_' + id;
    if (S.G.flags[k]) return;
    S.G.flags[k] = true;
    const item = CHECKS.find((c) => c[0] === id);
    S.events.emit('flag', { name: k, value: true });
    S.events.emit('toast', { text: 'Checked: ' + (item ? item[1] : id), kind: 'hint' });
    if (S.audio) S.audio.play('ui');
  }
  function onStep() {
    if (!inSandbox() || !S.combat || !S.combat.jin) return;
    const j = S.combat.jin, a = S.world.jin, t = S.time, st = j.state;
    if (trk.prev === 'dash' && st !== 'dash') trk.lastDashEnd = t;
    // A punch cut short: attack straight into a dash or a slip (recovery cancel).
    if (trk.prev === 'attack' && (st === 'dash' || st === 'slip')) mark('cancel');
    if (st === 'dash' && j.dash && j.dash.air) trk.airDashAt = t;
    const L = S.world.loc;
    if (a.onGround && t - trk.airDashAt < 1.5 && L && a.y < (+L.ground || GROUND) - 20 && st !== 'climb') { trk.airDashAt = -9; mark('airdash'); }
    // Run, then reverse: at running speed, then moving the other way within half a second.
    const top = (S.tune.runSpeed || 4) * (S.tune.H || 46) * ((S.combat.body && S.combat.body.speedMul) || 1);
    const vx = +a.vx || 0;
    if (a.onGround && st !== 'dash' && Math.abs(vx) >= top * 0.85) { trk.runDir = Math.sign(vx); trk.runAt = t; }
    else if (a.onGround && trk.runDir && Math.sign(vx) === -trk.runDir && Math.abs(vx) > 30 && t - trk.runAt < 0.5) { trk.runDir = 0; mark('reverse'); }
    trk.prev = st;
  }
  function hook() {
    if (trk.hooked || !S.main || !has(S.main, 'onStep')) return;
    trk.hooked = true;
    S.main.onStep(onStep, true);
  }
  for (const ev of ['chapterStart', 'resumed', 'enterLoc', 'open']) S.events.on(ev, hook);
  S.events.on('hit', (d) => {
    if (!inSandbox() || !d || d.attacker !== S.world.jin || d.blocked) return;
    const t = S.time;
    if ((d.move === 'jab' || d.move === 'dashStraight') && t - trk.lastDashEnd < 0.45) trk.jabAt = t;
    else if (d.move === 'cross' && t - trk.jabAt < 0.7) mark('dashCombo');
    if (d.target && d.target === trk.launched && !d.target.onGround && t - trk.launchAt < 2) mark('launch');
    if (d.target && trk.lastTarget && d.target !== trk.lastTarget && t - trk.lastTargetAt < 2.5) mark('switch');
    trk.lastTarget = d.target || null; trk.lastTargetAt = t;
  });
  S.events.on('slip', (d) => { if (d && d.ok) trk.slipOkAt = S.time; });
  S.events.on('counter', () => { if (S.time - trk.slipOkAt < 0.8) mark('slipCounter'); });
  S.events.on('launch', (d) => { if (d && d.enemy) { trk.launched = d.enemy; trk.launchAt = S.time; } });

  /* ── Self-test: the engine driven through the sandbox (§11 integration) ── */
  function selfTest(opts) {
    opts = opts || {};
    const T = S.test, out = { ok: false, checks: [], checklist: {}, errors: [], time: 0 };
    if (!T || !S.main) { out.error = 'S.test is missing (main.js)'; return out; }
    if (!S.isOpen) T.boot({ headless: S.headless });
    const D = S.director, C = S.combat;
    const prevPolicy = D.policy;
    const err0 = S.errors.length, t0 = S.time;
    const evs = [];
    const spy = (name, data) => { if (evs.length < 20000) evs.push({ n: name, d: data, t: S.time }); };
    S.events.on('*', spy);
    const J = () => S.world.jin;
    const tick = () => { S.realTime += S.DT; S.main.step(); };
    const run = (sec) => { const n = Math.max(1, Math.round(sec / S.DT)); for (let i = 0; i < n && S.isOpen; i++) tick(); };
    const until = (pred, sec) => {
      const n = Math.ceil(sec / S.DT);
      for (let i = 0; i < n && S.isOpen; i++) { let ok = false; try { ok = !!pred(); } catch (_) { ok = false; } if (ok) return true; tick(); }
      try { return !!pred(); } catch (_) { return false; }
    };
    const releaseAll = () => { for (const a of S.input.actions) T.release(a); };
    const press = (a) => T.press(a), release = (a) => T.release(a);
    const tap = (a) => { press(a); tick(); release(a); tick(); };
    const evSince = (i, name, pred) => evs.slice(i).filter((e) => e.n === name && (!pred || pred(e.d)));
    // Settled: no scene holding control, no transition, activity or fight — for a few steps in a row
    // (a scene resumes one step after the activity or fight it waited on ends).
    const calm = () => !D.busy && !(S.world && S.world.transitioning) && !(S.activities && S.activities.running) && !(C.state.fight && !C.state.fight.done);
    const idle = (sec) => { let n = 0; return until(() => { n = calm() ? n + 1 : 0; return n >= 6; }, sec || 8); };
    const r1 = (v) => Math.round(v * 10) / 10;
    function place(x, y, face) {
      releaseAll();
      const j = J();
      j.x = x; j.y = y === undefined ? S.world.groundAt(x) : y; j.vx = 0; j.vy = 0; j.onGround = true;
      if (j.ladder) j.ladder = null;
      if (face) j.face = face;
      run(0.12);
    }
    const focusId = () => { const f = S.world.focus; return f ? (f.id !== undefined ? f.id : f.ref && f.ref.id) : null; };
    function use(id, sec) {
      if (!until(() => focusId() === id, 0.8)) return false;
      tap('interact');
      return true;
    }
    function check(name, fn) {
      const i0 = evs.length;
      let r;
      try { r = fn(i0); } catch (e) { r = { ok: false, detail: 'threw: ' + (e && e.message) }; }
      if (typeof r !== 'object' || r === null) r = { ok: !!r };
      releaseAll();
      out.checks.push(Object.assign({ name }, r));
      if (opts.verbose) try { console.log('[sandbox] ' + name + ': ' + (r.ok ? 'ok' : 'FAIL') + (r.detail ? ' — ' + r.detail : '')); } catch (_) { /* no console */ }
      return r.ok;
    }

    try {
      // Policy: lines and choices advance by themselves, fights are played for real (no auto-win).
      D.setPolicy('first', { fights: 'real' });

      check('start', () => {
        const ok = T.startChapter(N);
        const ready = until(() => S.world.locId === 'sb_yard' && J() && !D.busy && S.G.quests.sb_tour, 12);
        return { ok: ok && ready, detail: 'loc ' + S.world.locId + ', quest ' + (S.G.quests.sb_tour ? S.G.quests.sb_tour.state : 'none') };
      });
      idle(4);

      check('run, stop, reverse', () => {
        const H = S.tune.H, top = S.tune.runSpeed * H * (C.body.speedMul || 1);
        place(150, undefined, 1);
        press('right');
        let vmax = 0, t90 = null;
        for (let k = 0; k < 60; k++) { tick(); const v = J().vx; if (v > vmax) vmax = v; if (t90 === null && v >= top * 0.9) t90 = (k + 1) * S.DT; }
        release('right');
        let tStop = null;
        for (let k = 0; k < 60; k++) { tick(); if (Math.abs(J().vx) < 3) { tStop = (k + 1) * S.DT; break; } }
        place(200, undefined, 1);
        press('right'); run(0.35); release('right'); press('left');
        let tRev = null;
        for (let k = 0; k < 40; k++) { tick(); if (J().vx < 0) { tRev = (k + 1) * S.DT; break; } }
        run(0.3); release('left');
        const ok = vmax > top * 0.85 && vmax < top * 1.15 && t90 !== null && t90 <= 0.2 && tStop !== null && tStop <= 0.16 && tRev !== null && tRev <= 0.15;
        return { ok, detail: 'top ' + r1(vmax) + '/' + r1(top) + ' px/s, 90% in ' + (t90 === null ? '—' : r1(t90 * 1000)) + ' ms, stop ' +
          (tStop === null ? '—' : r1(tStop * 1000)) + ' ms, reverse ' + (tRev === null ? '—' : r1(tRev * 1000)) + ' ms' };
      });

      check('dash charges and distance', () => {
        const H = S.tune.H, want = S.tune.dashDist * H * (C.body.speedMul || 1);
        place(150, undefined, 1);
        until(() => C.jin.charges >= C.jin.chargeMax, 2);
        const x0 = J().x, c0 = C.jin.charges;
        tap('dash'); run(0.2);
        const dx = J().x - x0, c1 = C.jin.charges;
        tap('dash'); run(0.15);
        const c2 = C.jin.charges, x2 = J().x;
        tap('dash'); run(0.15);
        const third = J().x - x2;
        const tA = S.time;
        until(() => C.jin.charges >= 1, 1.5);
        const t1 = S.time - tA;
        until(() => C.jin.charges >= 2, 1.5);
        const t2 = S.time - tA;
        // Refills are sequential: the second charge comes one recharge period after the first.
        const ok = Math.abs(dx - want) <= want * 0.15 && c1 === c0 - 1 && c2 === c0 - 2 && Math.abs(third) < 6 && t2 > t1 + 0.3;
        return { ok, detail: 'dash ' + r1(dx) + '/' + r1(want) + ' px, charges ' + c0 + '→' + c1 + '→' + c2 + ', third dash moved ' + r1(third) +
          ' px, refills at +' + r1(t1) + ' s and +' + r1(t2) + ' s' };
      });

      check('backdash keeps facing', () => {
        const want = S.tune.backdashDist * S.tune.H * (C.body.speedMul || 1);
        place(300, undefined, 1);
        until(() => C.jin.charges >= 1, 1.5);
        press('down'); run(0.1);
        const x0 = J().x;
        press('left'); tap('dash'); run(0.25);
        release('left'); release('down');
        const dx = J().x - x0;
        return { ok: J().face === 1 && dx < 0 && Math.abs(Math.abs(dx) - want) <= want * 0.25, detail: 'moved ' + r1(dx) + ' px (want −' + r1(want) + '), facing ' + J().face };
      });

      check('variable jump', () => {
        place(200, undefined, 1);
        const y0 = J().y;
        let minY = y0;
        press('jump');
        for (let k = 0; k < 72; k++) { tick(); minY = Math.min(minY, J().y); }
        release('jump');
        until(() => J().onGround, 1.5);
        const full = y0 - minY;
        place(200, undefined, 1);
        let minH = y0;
        press('jump'); tick(); tick(); release('jump');
        for (let k = 0; k < 72; k++) { tick(); minH = Math.min(minH, J().y); }
        until(() => J().onGround, 1.5);
        const hop = y0 - minH;
        return { ok: full > 45 && full < 85 && hop > 4 && hop < full * 0.8, detail: 'full jump ' + r1(full) + ' px, hop ' + r1(hop) + ' px' };
      });

      check('one-way plank: land, drop through', () => {
        place(P.p1.x + 30, GROUND, 1);
        press('jump');
        const up = until(() => J().onGround && Math.abs(J().y - P.p1.y) < 1 && J().vy >= 0 && S.time > 0, 1.6);
        release('jump');
        run(0.15);
        const onPlank = Math.abs(J().y - P.p1.y) < 1 && J().onGround;
        press('down'); tap('jump'); release('down');
        const down = until(() => J().onGround && Math.abs(J().y - GROUND) < 1, 1.5);
        return { ok: up && onPlank && down, detail: 'landed ' + up + ', stayed ' + onPlank + ', dropped ' + down };
      });

      check('crate wall blocks', () => {
        place(P.crates.x - 40, GROUND, 1);
        press('right'); run(1.0); release('right');
        const j = J();
        return { ok: j.x + (j.w || 14) / 2 <= P.crates.x + 1, detail: 'stopped at ' + r1(j.x) + ' (wall at ' + P.crates.x + ')' };
      });

      check('air dash across the gap, once per jump', () => {
        place(P.p3.x + 30, P.p3.y, 1);
        until(() => C.jin.charges >= 2, 1.5);
        let airDashes = 0, prev = C.jin.state;
        const watch = () => { const s = C.jin.state; if (s === 'dash' && prev !== 'dash' && C.jin.dash && C.jin.dash.air) airDashes++; prev = s; };
        press('right'); for (let k = 0; k < 18; k++) { tick(); watch(); }
        press('jump'); for (let k = 0; k < 26; k++) { tick(); watch(); }
        press('dash'); tick(); watch(); release('dash'); for (let k = 0; k < 14; k++) { tick(); watch(); }
        press('dash'); tick(); watch(); release('dash');
        for (let k = 0; k < 240 && !J().onGround; k++) { tick(); watch(); }
        releaseAll(); run(0.1);
        const j = J(), onP4 = Math.abs(j.y - P.p4.y) < 1 && j.x >= P.p4.x && j.x <= P.p4.x + P.p4.w;
        const ticked = !!S.G.flags.sb_chk_airdash;
        // Back to the ground for the next checks.
        press('down'); tap('jump'); release('down'); until(() => J().onGround && Math.abs(J().y - GROUND) < 1, 1.5);
        return { ok: onP4 && airDashes === 1, detail: 'landed at ' + r1(j.x) + ',' + r1(j.y) + (onP4 ? ' (far plank)' : '') + ', air dashes ' + airDashes + ', checklist ' + ticked };
      });

      check('jab → cross → hook on the dummy', (i0) => {
        place(X.dummy - 24, GROUND, 1);
        let hs = 0;
        tap('punch'); for (let k = 0; k < 14; k++) { tick(); hs = Math.max(hs, S.hitstop || 0); }
        tap('punch'); run(0.15);
        tap('punch'); run(0.45);
        const hits = evSince(i0, 'hit', (d) => d.attacker === J() && d.target && d.target.id === 'sb_dummy').map((e) => e.d.move);
        return { ok: hits.join(',') === 'jab,cross,hook' && hs > 0, detail: 'hits ' + (hits.join(', ') || 'none') + ', hit-stop ' + r1(hs * 1000) + ' ms' };
      });

      check('dash into a jab–cross', (i0) => {
        place(X.dummy - 112, GROUND, 1);
        until(() => C.jin.charges >= 1, 1.5);
        tap('dash'); run(0.17);
        tap('punch'); run(0.12);
        tap('punch'); run(0.45);
        const hits = evSince(i0, 'hit', (d) => d.attacker === J() && d.target && d.target.id === 'sb_dummy').map((e) => e.d.move);
        return { ok: hits[0] === 'jab' && hits[1] === 'cross' && !!S.G.flags.sb_chk_dashCombo, detail: 'hits ' + (hits.join(', ') || 'none') + ', checklist ' + !!S.G.flags.sb_chk_dashCombo };
      });

      check('cancel recovery into a slip', () => {
        place(X.dummy - 24, GROUND, 1);
        run(0.4);
        let sawAttack = false, sawSlip = false;
        tap('punch');
        for (let k = 0; k < 12; k++) { tick(); if (C.jin.state === 'attack') sawAttack = true; }
        tap('slip');
        for (let k = 0; k < 6; k++) { tick(); if (C.jin.state === 'slip') sawSlip = true; }
        run(0.5);
        return { ok: sawAttack && sawSlip, detail: 'attack ' + sawAttack + ' → slip ' + sawSlip + ', checklist ' + !!S.G.flags.sb_chk_cancel };
      });

      check('uppercut (down + punch)', (i0) => {
        place(X.dummy - 24, GROUND, 1);
        run(0.4);
        press('down'); tap('punch'); release('down'); run(0.5);
        const ups = evSince(i0, 'hit', (d) => d.attacker === J() && d.move === 'uppercut');
        return { ok: ups.length > 0, detail: ups.length ? 'uppercut landed' : 'no uppercut hit' };
      });

      check('heavy bag and switching targets', (i0) => {
        place((X.dummy + X.bag) / 2, GROUND, 1);
        run(0.4);
        tap('punch'); run(0.35);
        tap('left'); run(0.1);
        tap('punch'); run(0.35);
        const hits = evSince(i0, 'hit', (d) => d.attacker === J()).map((e) => (e.d.target && e.d.target.id) + (e.d.bag ? '(passive)' : ''));
        const bag = hits.some((h) => /^sb_bag/.test(h)), dummy = hits.some((h) => /^sb_dummy/.test(h));
        return { ok: bag && dummy && !!S.G.flags.sb_chk_switch, detail: 'hits ' + (hits.join(', ') || 'none') + ', checklist ' + !!S.G.flags.sb_chk_switch };
      });

      check('controls board (doc viewer, quest step)', () => {
        place(X.board + 20, GROUND, -1);
        if (!use('sb_board')) return { ok: false, detail: 'no focus on the board (focus ' + focusId() + ')' };
        const opened = until(() => D.doc || D.dialog, 1);
        idle(8);
        return { ok: opened && !!S.G.flags.sb_read_board && S.G.quests.sb_tour.step >= 1, detail: 'doc opened ' + !!opened + ', step ' + S.G.quests.sb_tour.step };
      });

      check('locked door says why', (i0) => {
        place(X.whDoor - 20, GROUND, 1);
        if (!use('sb_wh_door')) return { ok: false, detail: 'no focus on the door (focus ' + focusId() + ')' };
        run(1);
        const why = evSince(i0, 'toast', (d) => d && d.kind === 'locked').map((e) => e.d.text)[0];
        return { ok: !!why && S.world.locId === 'sb_yard', detail: why ? '"' + why + '"' : 'no reason shown' };
      });

      check('spar: slip a telegraphed strike and counter by hand', (i0) => {
        place(X.bell - 20, GROUND, 1);
        if (!use('sb_bell')) return { ok: false, detail: 'no focus on the bell' };
        if (!until(() => C.state.fight && !C.state.fight.done && C.enemies().length, 4)) return { ok: false, detail: 'the fight did not start' };
        const thug = () => C.enemies()[0];
        let tries = 0, okSlips = 0, counter = false, pressedFor = null, okAt = -1, countered = false, tele = 0;
        const deadline = S.time + 20;
        while (S.time < deadline && S.isOpen && C.state.fight && !C.state.fight.done) {
          const e = thug(), j = J();
          if (!e) break;
          if (j.onGround && Math.sign(e.x - j.x) !== j.face && C.jin.state !== 'attack' && C.jin.state !== 'slip') { tap(e.x > j.x ? 'right' : 'left'); continue; }
          const ai = e.enemy;
          if (ai && ai.state === 'windup' && ai.atk && ai.atk !== pressedFor) {
            if (ai.tintT > 0) tele++;
            const rem = (ai.atk.windupT || 0) - ai.t;
            if (rem <= 0.045 && ai.atk.slippable !== false && Math.abs(e.x - j.x) < 70) { pressedFor = ai.atk; tries++; tap('slip'); continue; }
          }
          const ok = evSince(i0, 'slip', (d) => d.ok).length;
          if (ok > okSlips) { okSlips = ok; okAt = S.time; countered = false; }
          if (okAt > 0 && !countered && S.time >= okAt + 0.05) { countered = true; tap('punch'); continue; }
          if (evSince(i0, 'counter').length) { counter = true; break; }
          tick();
        }
        run(0.3);
        const fails = evSince(i0, 'slip', (d) => !d.ok).length;
        return { ok: counter, detail: 'slip presses ' + tries + ', clean slips ' + okSlips + ', mistimed ' + fails + ', counter ' + counter + ', telegraphs seen ' + tele +
          ', checklist ' + !!S.G.flags.sb_chk_slipCounter };
      });

      check('launch and an airborne follow-up', (i0) => {
        const f = C.state.fight;
        if (!f || f.done) return { ok: false, detail: 'no fight running' };
        let launched = null, follow = false, ups = 0;
        const deadline = S.time + 14;
        while (S.time < deadline && S.isOpen && C.state.fight && !C.state.fight.done && !follow) {
          const e = C.enemies()[0], j = J();
          if (!e) break;
          const ai = e.enemy;
          if (!launched) {
            const d = Math.abs(e.x - j.x);
            if (j.onGround && Math.sign(e.x - j.x) !== j.face && C.jin.state !== 'attack') { tap(e.x > j.x ? 'right' : 'left'); continue; }
            if (d > 24 && ai.state !== 'windup' && ai.state !== 'active') { press(e.x > j.x ? 'right' : 'left'); tick(); release('right'); release('left'); continue; }
            if (d <= 24 && C.jin.state !== 'attack' && ai.state !== 'windup' && ai.state !== 'active' && e.onGround) {
              ups++; press('down'); tap('punch'); release('down');
              for (let k = 0; k < 30; k++) { tick(); if (evSince(i0, 'launch').length) break; }
              if (evSince(i0, 'launch').length) launched = e;
              continue;
            }
            if (ai.state === 'windup') { press('down'); tick(); tick(); release('down'); continue; }
            tick();
            continue;
          }
          // Launched: jump after him and hit him while he is still in the air.
          run(0.05); tap('jump'); run(0.12); tap('punch');
          for (let k = 0; k < 40; k++) {
            tick();
            if (evSince(i0, 'hit', (d) => d.attacker === J() && d.target === launched && !launched.onGround).length) { follow = true; break; }
          }
          if (!follow) { launched = null; until(() => J().onGround, 1.5); }
        }
        return { ok: follow, detail: 'uppercuts ' + ups + ', launched ' + !!launched + ', air follow-up ' + follow + ', checklist ' + !!S.G.flags.sb_chk_launch };
      });

      check('spar ends (round won)', () => {
        for (let k = 0; k < 8 && C.state.fight && !C.state.fight.done; k++) { C.autoWin(); run(0.5); }
        idle(8);
        return { ok: !!S.G.flags.sb_spar, detail: 'sb_spar ' + !!S.G.flags.sb_spar + ', tour step ' + S.G.quests.sb_tour.step };
      });

      check('coach: talk, choice, key', () => {
        place(X.coach - 25, GROUND, 1);
        if (!use('sb_coach')) return { ok: false, detail: 'no focus on Dell (focus ' + focusId() + ')' };
        until(() => D.dialog, 1);
        idle(10);
        return { ok: !!S.G.flags.sb_key && !!(S.G.people.sb_coach), detail: 'key ' + !!S.G.flags.sb_key + ', tour step ' + S.G.quests.sb_tour.step };
      });

      check('warehouse door opens now', () => {
        place(X.whDoor - 20, GROUND, 1);
        if (!use('sb_wh_door')) return { ok: false, detail: 'no focus on the door' };
        const ok = until(() => S.world.locId === 'sb_warehouse' && !S.world.transitioning, 4);
        idle(3);
        return { ok, detail: 'now in ' + S.world.locId };
      });

      check('swarm: attackers limited, waves, win', (i0) => {
        if (S.world.locId !== 'sb_warehouse') return { ok: false, detail: 'not in the warehouse' };
        press('right');
        const started = until(() => C.state.fight && !C.state.fight.done, 5);
        release('right');
        if (!started) return { ok: false, detail: 'the trigger did not start the fight (x ' + r1(J().x) + ')' };
        const max = C.state.fight.tokens ? C.state.fight.tokens.max : 2;
        let most = 0;
        press('down');
        for (let k = 0; k < 6 / S.DT; k++) {
          tick();
          const n = C.enemies().filter((e) => e.enemy && (e.enemy.state === 'windup' || e.enemy.state === 'active')).length;
          if (n > most) most = n;
        }
        release('down');
        // Down the first wave man by man (scripted knockdowns), so the second wave has to come in.
        for (const e of C.enemies()) C.forceDown(e.id);
        const wave2 = until(() => evSince(i0, 'fightWave').length > 0, 4);
        run(0.5);
        const second = C.enemies().map((e) => e.enemy && e.enemy.type).join(' ');
        for (let k = 0; k < 16 && C.state.fight && !C.state.fight.done; k++) { C.autoWin(); run(0.5); }
        idle(8);
        return { ok: most <= max && !!S.G.flags.sb_swarm && wave2, detail: 'most at once ' + most + ' (limit ' + max + '), second wave ' + wave2 + ' [' + second + '], cleared ' + !!S.G.flags.sb_swarm };
      });

      check('back to the yard', () => {
        place(80, 300, -1);
        if (!use('sb_wh_exit')) return { ok: false, detail: 'no focus on the exit (focus ' + focusId() + ')' };
        const ok = until(() => S.world.locId === 'sb_yard' && !S.world.transitioning, 4);
        idle(3);
        return { ok, detail: 'now in ' + S.world.locId };
      });

      check('ladder up, rooftop trigger, hidden snapshot, ladder down', () => {
        place(X.ladder, GROUND, 1);
        press('up');
        const up = until(() => J().onGround && Math.abs(J().y - ROOF) < 1 && !J().ladder, 7);
        release('up');
        press('right'); run(0.6); release('right');
        idle(6);
        const roofQuest = !!(S.G.quests.sb_roof && S.G.quests.sb_roof.state === 'done');
        place(X.photo - 18, ROOF, 1);
        let photo = false;
        if (use('sb_photo')) { idle(6); photo = !!S.G.evidence.sb_photo; }
        place(X.ladder, ROOF, -1);
        press('down');
        const down = until(() => J().onGround && Math.abs(J().y - GROUND) < 1, 7);
        release('down');
        return { ok: up && roofQuest && photo && down, detail: 'up ' + up + ', roof quest ' + roofQuest + ', snapshot ' + photo + ', down ' + down };
      });

      check('every drill (journal path)', () => {
        const keys = ['balance', 'footwork', 'reaction', 'conditioning', 'bag', 'mitts'];
        const got = [];
        for (const k of keys) {
          place(X.footwork, GROUND, 1);
          idle(3);
          const why = S.activities && has(S.activities, 'canTrain') ? S.activities.canTrain(k) : 'activities.js missing';
          if (why !== true) { got.push(k + ': ' + why); continue; }
          S.activities.train(k);
          until(() => S.activities.running, 1);
          idle(10);
          got.push(k + ' ' + (S.G.train[k] | 0));
        }
        const ok = keys.every((k) => (S.G.train[k] | 0) >= 1);
        return { ok, detail: got.join(', ') };
      });

      check('fuse box (repair) lights the yard', () => {
        place(X.fuse + 20, GROUND, -1);
        if (!use('sb_fuse')) return { ok: false, detail: 'no focus on the fuse box (focus ' + focusId() + ')' };
        idle(10);
        run(0.2);
        const layers = (S.world.loc && S.world.loc.layers) || {};
        const lamp = (layers.back || []).find((p) => p && p.t === 'streetlight' && p.x === X.light);
        const lit = !!(lamp && lamp.on !== false);
        return { ok: !!S.G.flags.sb_light_on && S.G.quests.sb_light.state === 'done' && lit, detail: 'flag ' + !!S.G.flags.sb_light_on + ', quest ' + S.G.quests.sb_light.state + ', lamp rebaked on ' + lit };
      });

      check('street edge, Rosa, carry across maps', (i0) => {
        place(X.edge - 40, GROUND, 1);
        press('right');
        const there = until(() => S.world.locId === 'sb_street' && !S.world.transitioning, 5);
        release('right');
        idle(3);
        if (!there) return { ok: false, detail: 'edge did not lead to the avenue (loc ' + S.world.locId + ')' };
        place(305, 300, 1);
        if (!use('sb_rosa')) return { ok: false, detail: 'no focus on Rosa (focus ' + focusId() + ')' };
        idle(8);
        const started = !!S.G.quests.sb_crate;
        place(25, 300, -1);
        press('left');
        until(() => S.world.locId === 'sb_yard' && !S.world.transitioning, 5);
        release('left');
        idle(3);
        place(X.crate - 20, GROUND, 1);
        if (!use('sb_crate')) return { ok: false, detail: 'quest started ' + started + ', no focus on the crate (focus ' + focusId() + ')' };
        until(() => S.activities && S.activities.running, 1);
        idle(12);
        const delivered = !!S.G.flags.sb_crate_delivered;
        const acts = evSince(i0, 'activity', (d) => d && d.phase === 'end').map((e) => e.d.name + ':' + JSON.stringify(e.d.result && { ok: e.d.result.ok, delivered: e.d.result.delivered, cancelled: e.d.result.cancelled, reason: e.d.result.reason }));
        if (S.world.locId !== 'sb_street') {
          place(X.edge - 40, GROUND, 1); press('right');
          until(() => S.world.locId === 'sb_street' && !S.world.transitioning, 5); release('right'); idle(3);
        }
        place(305, 300, 1);
        if (use('sb_rosa')) idle(8);
        const done = !!(S.G.quests.sb_crate && S.G.quests.sb_crate.state === 'done');
        return { ok: started && delivered && done, detail: 'started ' + started + ', delivered ' + delivered + ', done ' + done + ', money ' + S.G.money + (delivered ? '' : ', activity ' + acts.join(' ')) };
      });

      check('barks, payphone choice, newspaper evidence', (i0) => {
        if (S.world.locId !== 'sb_street') return { ok: false, detail: 'not on the avenue' };
        const kid = S.world.actor('sb_kid');
        if (kid) place(kid.x - 50, 300, 1);
        run(3);
        const bark = evSince(i0, 'bark').length > 0;
        place(500, 300, 1);
        const phone = use('sb_phone');
        idle(8);
        place(580, 300, 1);
        const paper = use('sb_paper');
        idle(6);
        return { ok: bark && phone && !!S.G.evidence.sb_paper, detail: 'bark ' + bark + ', payphone ' + phone + ', paper evidence ' + !!S.G.evidence.sb_paper + (paper ? '' : ' (no focus)') };
      });

      if (S.headless) {
        check('save and load (headless only)', () => {
          const saved = S.save(1, 'Sandbox self-test');
          const list = S.listSaves().filter((s) => s.slot === 1);
          const locBefore = S.world.locId;
          place(200, 300, 1);
          const loaded = S.load(1);
          run(0.5);
          idle(5);
          return { ok: !!saved && list.length === 1 && loaded && S.world.locId === locBefore, detail: 'saved ' + !!saved + ', listed ' + list.length + ', loaded ' + loaded + ', loc ' + S.world.locId };
        });
      }

      check('sign out ends the chapter', (i0) => {
        if (S.world.locId !== 'sb_yard') {
          place(25, 300, -1); press('left');
          until(() => S.world.locId === 'sb_yard' && !S.world.transitioning, 5); release('left'); idle(3);
        }
        place(X.board + 20, GROUND, -1);
        if (!use('sb_board')) return { ok: false, detail: 'no focus on the board' };
        const ended = until(() => evSince(i0, 'chapterEnd', (d) => d && d.n === N).length > 0, 10);
        run(1);
        return { ok: ended, detail: 'tour step ' + S.G.quests.sb_tour.step + ', chapterEnd ' + ended };
      });
    } finally {
      releaseAll();
      S.events.off('*', spy);
      D.setPolicy(prevPolicy || null);
    }
    out.errors = S.errors.slice(err0).map((e) => (e.source ? e.source + ': ' : '') + e.message);
    for (const [id, text] of CHECKS) out.checklist[id] = { text, done: !!(S.G && S.G.flags['sb_chk_' + id]) };
    out.passed = out.checks.filter((c) => c.ok).length;
    out.failed = out.checks.filter((c) => !c.ok).map((c) => c.name);
    out.time = Math.round((S.time - t0) * 10) / 10;
    out.ok = !out.failed.length && !out.errors.length;
    return out;
  }

  S.sandbox = { id: N, checks: CHECKS, tracker: trk, selfTest, controlsDoc, tourStep, X, P };
})(window.STORY);
