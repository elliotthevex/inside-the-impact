/* Story Mode — world.js
   Locations (resolution, baking, room shells, street ground), collision
   (floors, walls, one-way platforms, ladders), actors with pose blending,
   NPC behaviour (idle, wander, paths, barks, markers), interaction focus,
   doors and transitions, triggers, the camera, effects/particles, minimap
   data, screenPos and the full render pipeline with S.fx post effects.
   Contract: ARCHITECTURE.md §5. Notes: story/dev/notes/world.md.

   Conventions (shared with pieces.js):
   - World units are logical pixels, y grows down. Actors stand on their feet:
     x = centre, y = feet.
   - S.cam.x / S.cam.y = world top-left of the 640x360 view at zoom 1; zoom
     scales about the view centre. S.cam.to({x, y}) takes the CENTRE to look at.
   - Doors and objects are centred on x. Solids are rects {x (left), y (top),
     w, h}. Floors {x0, x1, y} are solid blocks from y down. Ladders {x, y0
     (top), y1 (bottom)}.
   - Waits handed to the director have the shape { wait(dt) -> done, result };
     world.update drives them, wait() only reports.
   - collide() integrates velocity and resolves contacts; it never applies
     gravity (combat owns gravity, world applies it only to actors it drives). */
(function (S) {
  'use strict';

  /* ── 0. Helpers ───────────────────────────────────────────────────── */
  const U = S.util;
  const clamp = U.clamp, lerp = U.lerp, approach = U.approach, sign = U.sign, hash = U.hash;
  const VW = S.W || 640, VH = S.H || 360;

  const LAYERS = ['far', 'mid', 'back', 'front', 'fore'];
  const PARALLAX = { far: 0.25, mid: 0.6, back: 1, front: 1, fore: 1.25 };
  const PADY = 64;                 // baked canvases extend this far above and below the map
  const CHUNK = 1024;              // baked canvas chunk width (keeps every canvas well inside browser limits)
  const INTERACT_RANGE = 28;       // px in front of Jin
  const BEHIND_SLACK = 6;          // px behind Jin still counts (touching)
  const HIDDEN_RANGE = 24;         // hidden objects only within this
  const BARK_REPEAT = 20;          // a line is not repeated within this many seconds
  const BARK_NPC_GAP = 7;          // one NPC waits at least this long between auto barks
  const STEP_UP = 9, STEP_DOWN = 9;
  const MAX_SUB = 4;               // collision sub-step length in px (no tunnelling through thin walls)
  const GRAV = 1500;               // gravity for actors world drives itself (combat has its own)
  const INTERACT_DEBOUNCE = 0.22;  // ignore interact this long after a scene ends (the advance press)

  // Content callbacks (when, marker, barks...) must never take the loop down.
  const reported = new Set();
  function report(err, where) {
    const key = where + '|' + (err && err.message);
    if (reported.has(key)) return;
    reported.add(key);
    try { S.fail(err instanceof Error ? err : new Error(String(err)), { source: 'world ' + where }); } catch (_) { /* nothing to report to */ }
  }
  function test(fn, where) {
    if (typeof fn !== 'function') return true;
    try { return !!fn(S.G); } catch (e) { report(e, where || 'when'); return false; }
  }
  function callFn(fn, where, a, b) {
    try { return fn(a, b); } catch (e) { report(e, where); return undefined; }
  }
  const expTo = (v, target, dt, k) => v + (target - v) * (1 - Math.exp(-k * dt));

  // Cosmetic randomness (glints, particles) never touches the seeded sim stream.
  let crs = 0x5eed1996 >>> 0;
  const crand = () => { crs = (Math.imul(crs, 1664525) + 1013904223) >>> 0; return crs / 4294967296; };

  // Colour kit: prefer pieces.js's so world surfaces match the piece library.
  const rgbC = new Map();
  function rgb(hex) {
    let v = rgbC.get(hex);
    if (v) return v;
    let h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16) || 0;
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbC.set(hex, v);
    return v;
  }
  const toHex = (r, g, b) => '#' + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1);
  function mixc(a, b, t) { const A = rgb(a), B = rgb(b); return toHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
  function rgba(hex, a) { const c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(+a || 0, 0, 1).toFixed(3) + ')'; }
  const rampC = new Map();
  function ramp(hex) {
    if (Array.isArray(hex)) return hex;
    const pu = S.pieces && S.pieces.util;
    if (pu && pu.ramp && pu.mute) return pu.ramp(pu.mute(hex, 0.18));
    let r = rampC.get(hex);
    if (!r) { r = [mixc(hex, '#191524', 0.55), mixc(hex, '#191524', 0.28), hex, mixc(hex, '#efd9b0', 0.14), mixc(hex, '#efd9b0', 0.3)]; rampC.set(hex, r); }
    return r;
  }
  // Material ramps (dark -> light, index 2 = base); pieces.js's palette wins when present.
  const FPAL = {
    walk: ['#262930', '#30343c', '#3b4049', '#474d57', '#565c66'],
    asphalt: ['#111318', '#171a20', '#1e222a', '#272c35', '#323843'],
    concrete: ['#232528', '#313437', '#404346', '#505255', '#626365'],
    plaster: ['#2b2a2c', '#3b3a3b', '#4d4b4a', '#615e5a', '#77726b'],
    wood: ['#23180f', '#332417', '#463220', '#5b432c', '#72573b'],
    brick: ['#2a1e1c', '#3a2924', '#4c362e', '#5f4639', '#735645'],
    brick_dark: ['#1a1618', '#241f22', '#30292c', '#3d3437', '#4a4043'],
    iron: ['#121417', '#1b1e22', '#262a2f', '#33383e', '#434950'],
    metal: ['#1a201e', '#262e2b', '#343e39', '#444f49', '#57635b'],
    dirt: ['#1f1913', '#2b231b', '#3a2f24', '#4a3d2f', '#5b4c3b'],
    roof: ['#141418', '#1b1b20', '#24242a', '#2e2e35', '#3a3a42'],
    fadedYellow: '#a98c47',
  };
  const pal = (k) => { const p = S.pieces && S.pieces.pal; return (p && p[k]) || FPAL[k]; };
  // Integer-snapped rect; both edges rounded so neighbours never leave seams.
  function R(c, x, y, w, h, col) {
    const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h);
    if (x1 <= x0 || y1 <= y0) return;
    c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  function RA(c, x, y, w, h, col, a) { if (a > 0.003) R(c, x, y, w, h, rgba(col, a)); }

  function makeWait(result) {
    const w = { done: false, result, wait: () => w.done, finish(res) { if (w.done) return; w.done = true; if (res !== undefined) w.result = res; } };
    return w;
  }
  const doneWait = (result) => { const w = makeWait(result); w.done = true; return w; };

  /* ── 1. State, S.fx, S.cam ────────────────────────────────────────── */
  const W = S.world = {
    loc: null, locId: null,
    actors: [], jin: null, focus: null,
    locations: Object.create(null),   // defineLocation registry (shared places)
    transitioning: false,
    control: null,                    // null = follow the director; true/false forces player control
    debug: false,                     // draws collision, doors, triggers and focus boxes
    ownsHitstop: true,                // world.update counts S.hitstop down unless something else already does
    particles: [], effects: [],
  };
  const st = {                         // private runtime state
    step: 0, lastBusy: -1e9, lastAutosave: -1e9, extHitstop: false, hsSeen: 0,
    trans: { phase: null, t: 0, dur: 0, k: 0, k0: 0, pending: null, w: null, edge: 0 },
    bark: null, barkSeen: Object.create(null),
    bakes: null, lights: null, dirty: false, rebake: false,
    css: null, cssAge: 1e9, loop: null, muffle: 0, beatPhase: 0,
    routeCache: Object.create(null), routeAt: -1,
    hooks: { back: [], effects: [], front: [], screen: [] },
  };

  const FX_DEFAULT = { muffle: 0, blur: 0, double: 0, desat: 0, vignette: 0.25, heartbeat: 0, flash: 0, flashColor: '#ffffff',
    sepia: 0, letterbox: 0, fade: 0, fadeColor: '#000000' };
  S.fx = Object.assign({}, FX_DEFAULT, S.fx || {});
  W.resetFx = function () { Object.assign(S.fx, FX_DEFAULT); };

  const camS = { cx: VW / 2, cy: VH / 2, la: 0, gy: null, tween: null, zoomTarget: 1, shakeT: 0, shakeDur: 0, shakeAmp: 0, idleScripted: 0 };
  const cam = S.cam = {
    x: 0, y: 0, zoom: 1, shake: 0, mode: 'follow', target: null, lookAhead: 40,
    bounds: { x0: 0, x1: VW, y0: 0, y1: VH },
    view: { x: 0, y: 0, w: VW, h: VH },     // visible world rect after zoom (read-only)
    // Scripted move. x/y = centre to look at (or `target` actor/id to track); zoom about the centre.
    // dur defaults to 0.8 s; 0 cuts. Returns a Wait that completes when the move ends.
    to(o) {
      o = o || {};
      const tgt = o.target != null ? resolveActor(o.target) : null;
      const dur = o.dur === undefined ? 0.8 : Math.max(0, +o.dur || 0);
      const ease = typeof o.ease === 'function' ? o.ease : (U.ease[o.ease] || U.ease.inOut);
      const w = makeWait(true);
      if (camS.tween && camS.tween.w) camS.tween.w.finish(false);
      camS.tween = { fx: camS.cx, fy: camS.cy, fz: cam.zoom, x: o.x, y: o.y, z: o.zoom != null ? Math.max(0.25, +o.zoom) : cam.zoom,
        target: tgt, t: 0, dur, ease, w };
      cam.mode = 'scripted'; cam.target = tgt; camS.idleScripted = 0;
      if (dur === 0) stepTween(0);
      return w;
    },
    // Back to following (Jin by default). Zoom eases back to the location's zoom.
    follow(a, o) {
      const t = a != null ? resolveActor(a) : null;
      if (camS.tween && camS.tween.w) camS.tween.w.finish(false);
      camS.tween = null;
      cam.mode = 'follow'; cam.target = t || W.jin;
      camS.zoomTarget = (W.loc && W.loc.camera.zoom) || 1;
      if (o && o.snap) snapCamera();
    },
    // amount in px of displacement, scaled by settings.shake (0 disables).
    shakeIt(amount, dur) {
      const amp = (+amount || 0) * clamp(S.settings ? +S.settings.shake : 1, 0, 1);
      if (amp <= 0) return;
      const cur = camS.shakeT > 0 ? camS.shakeAmp * (camS.shakeT / camS.shakeDur) : 0;
      camS.shakeAmp = Math.max(cur, amp);
      camS.shakeDur = camS.shakeT = Math.max(0.05, dur === undefined ? 0.25 : +dur || 0.25);
      cam.shake = camS.shakeAmp;
    },
    center: () => ({ x: camS.cx, y: camS.cy }),
    snap: () => snapCamera(),
  };

  /* ── 2. Locations: registry and resolution ────────────────────────── */
  W.defineLocation = function (id, def) { W.locations[id] = def; return def; };

  let lookingUp = false;
  // Raw LocationDef (or builder fn) for an id: current chapter, registry, nearest earlier chapter, any chapter.
  W.locationDef = function (id) {
    if (!id) return null;
    const G = S.G, story = S.story, chs = story && story.chapters;
    const cur = chs && G ? chs[G.chapter] : null;
    if (cur && cur.locations && cur.locations[id]) return cur.locations[id];
    if (W.locations[id]) return W.locations[id];
    if (chs) {
      const keys = Object.keys(chs).map(Number).filter((n) => !isNaN(n)).sort((a, b) => b - a);
      const c = G ? G.chapter : 0;
      for (const k of keys) if (k <= c && chs[k] && chs[k].locations && chs[k].locations[id]) return chs[k].locations[id];
      for (const k of keys) if (chs[k] && chs[k].locations && chs[k].locations[id]) return chs[k].locations[id];
    }
    if (story && typeof story.location === 'function' && !lookingUp) {
      lookingUp = true;
      try { const L = story.location(id); if (L) return L.def || L; } catch (e) { report(e, 'story.location'); } finally { lookingUp = false; }
    }
    return null;
  };
  function rawDef(id) {
    let def = W.locationDef(id);
    if (typeof def === 'function') def = callFn(def, 'location builder ' + id, S.G);
    return def && typeof def === 'object' ? def : null;
  }

  // Resolved copy: defaults filled, doors/objects/triggers copied (runtime state lives on the copies),
  // pieces and geometry filtered by when() (bake time); npcs/objects/doors/triggers keep when() for live checks.
  function resolveLocation(id) {
    const def = rawDef(id);
    if (!def) return null;
    const L = Object.assign({}, def);
    L.id = id; L.def = def;
    L.name = def.name || id;
    L.kind = def.kind === 'interior' ? 'interior' : 'exterior';
    L.w = Math.max(64, +def.w || VW);
    L.h = Math.max(64, +def.h || VH);
    L.ground = def.ground != null ? +def.ground : L.h - 60;
    L.ambient = Object.assign({ dark: 0, tint: null, fog: 0 }, def.ambient || {});
    L.camera = Object.assign({ zoom: 1, yOffset: 0, x0: 0, x1: L.w }, def.camera || {});
    if (L.camera.x0 == null) L.camera.x0 = 0;
    if (L.camera.x1 == null) L.camera.x1 = L.w;
    L.points = def.points || {};
    L.room = def.room || (L.kind === 'interior' ? {} : null);
    L.groundStyle = def.groundStyle || (L.kind === 'interior' ? 'room' : 'street');
    L.npcs = Array.isArray(def.npcs) ? def.npcs : [];
    L.lights = Array.isArray(def.lights) ? def.lights : [];
    L.doors = (def.doors || []).filter(Boolean).map((d, i) => {
      const c = Object.assign({ w: 24, kind: 'door' }, d);
      if (c.id == null) c.id = 'door' + i;
      if (c.x == null) c.x = c.side === 'left' ? 0 : c.side === 'right' ? L.w : L.w / 2;
      if (c.kind === 'edge' && c.auto === undefined) c.auto = true;
      return c;
    });
    L.objects = (def.objects || []).filter(Boolean).map((o, i) => Object.assign({ w: 20, h: 30, id: 'obj' + i }, o));
    L.triggers = (def.triggers || []).filter(Boolean).map((t, i) => Object.assign({ id: 'trig' + i, once: true }, t));
    resolveDynamic(L);
    return L;
  }

  // The part that depends on G at bake time: piece lists and collision geometry.
  function resolveDynamic(L) {
    const def = L.def;
    L._hasWhen = false;
    const keep = (p, where) => {
      if (!p) return false;
      if (p.when) { L._hasWhen = true; return test(p.when, where); }
      return true;
    };
    L.layers = {};
    for (const n of LAYERS) {
      const src = def.layers && Array.isArray(def.layers[n]) ? def.layers[n] : [];
      L.layers[n] = src.filter((p) => keep(p, 'piece ' + (p && p.t)));
    }
    const floors = Array.isArray(def.floors) && def.floors.length ? def.floors : [{ x0: 0, x1: L.w, y: L.ground }];
    L.floors = floors.filter((f) => keep(f, 'floor')).map((f) => ({ x0: f.x0 != null ? +f.x0 : 0, x1: f.x1 != null ? +f.x1 : L.w, y: +f.y, style: f.style }));
    L.solids = (def.solids || []).filter((s) => keep(s, 'solid')).map((s) => Object.assign({}, s, { x: +s.x || 0, y: +s.y || 0, w: +s.w || 0, h: +s.h || 0 }));
    L.ladders = (def.ladders || []).filter((l) => keep(l, 'ladder')).map((l) => Object.assign({ kind: 'ladder' }, l, {
      x: +l.x || 0, y0: Math.min(+l.y0, +l.y1), y1: Math.max(+l.y0, +l.y1) }));
    // Collision primitives: boxes (floors run down to infinity) and one-way platform tops.
    L._boxes = [];
    for (const f of L.floors) L._boxes.push({ x0: Math.min(f.x0, f.x1), x1: Math.max(f.x0, f.x1), y0: f.y, y1: Infinity, floor: true });
    L._plats = [];
    for (const s of L.solids) {
      if (s.oneway) L._plats.push({ x0: s.x, x1: s.x + s.w, y: s.y });
      else L._boxes.push({ x0: s.x, x1: s.x + s.w, y0: s.y, y1: s.y + s.h, floor: false });
    }
    // Static anchor heights for doors and objects.
    for (const d of L.doors) d._y = d.y != null ? +d.y : groundAtL(L, d.x, null);
    for (const o of L.objects) o._y = o.y != null ? +o.y : groundAtL(L, o.x, null);
  }

  /* ── 3. Geometry and collision ────────────────────────────────────── */
  function surfaceAt(L, x, yMin, platforms) {
    let best = Infinity;
    for (const b of L._boxes) if (x >= b.x0 && x <= b.x1 && b.y0 >= yMin && b.y0 < best) best = b.y0;
    if (platforms !== false) for (const p of L._plats) if (x >= p.x0 && x <= p.x1 && p.y >= yMin && p.y < best) best = p.y;
    return best;
  }
  // y == null: the floor at or below the location's ground line, else the topmost surface.
  function groundAtL(L, x, y) {
    if (!L) return VH - 60;
    x = clamp(+x || 0, 0, L.w);
    if (y == null) {
      let s = surfaceAt(L, x, L.ground - 12);
      if (s === Infinity) s = surfaceAt(L, x, -Infinity);
      return s === Infinity ? L.ground : s;
    }
    const s = surfaceAt(L, x, +y - 0.5);
    return s === Infinity ? L.h : s;
  }
  W.groundAt = (x, y) => groundAtL(W.loc, x, y);

  // Highest surface top under the actor's footprint within [yMin, yMax].
  function footSurface(L, a, yMin, yMax) {
    const hw = a.w / 2 - 1;
    let best = Infinity, oneway = false;
    for (const b of L._boxes) {
      if (a.x + hw <= b.x0 || a.x - hw >= b.x1) continue;
      if (b.y0 >= yMin && b.y0 <= yMax && b.y0 < best) { best = b.y0; oneway = false; }
    }
    if (!(a.dropT > 0)) for (const p of L._plats) {
      if (a.x + hw - 2 <= p.x0 || a.x - hw + 2 >= p.x1) continue;
      if (p.y >= yMin && p.y <= yMax && p.y < best) { best = p.y; oneway = true; }
    }
    return best === Infinity ? null : { y: best, oneway };
  }

  function moveX(L, a, dx) {
    if (!dx) return;
    const hw = a.w / 2;
    let nx = a.x + dx;
    const top = a.y - a.h + 1, feet = a.y;
    for (const b of L._boxes) {
      // Only boxes the body overlaps vertically block; a box whose top is a small step below the feet is climbed.
      if (feet <= b.y0 + 0.01 || top >= b.y1) continue;
      const stepUp = feet - b.y0 <= STEP_UP && b.y1 - b.y0 > 0;
      if (dx > 0 && a.x + hw <= b.x0 + 0.01 && nx + hw > b.x0) {
        if (stepUp && !blockedAbove(L, a, nx, b.y0)) { a.y = b.y0; continue; }
        nx = b.x0 - hw; a.wallR = true;
      } else if (dx < 0 && a.x - hw >= b.x1 - 0.01 && nx - hw < b.x1) {
        if (stepUp && !blockedAbove(L, a, nx, b.y0)) { a.y = b.y0; continue; }
        nx = b.x1 + hw; a.wallL = true;
      }
    }
    a.x = nx;
  }
  // Stepping up must not push the head into a box above.
  function blockedAbove(L, a, nx, newFeet) {
    const hw = a.w / 2, top = newFeet - a.h;
    for (const b of L._boxes) {
      if (b.floor || nx + hw <= b.x0 || nx - hw >= b.x1) continue;
      if (b.y1 > top && b.y0 < newFeet - 0.01) return true;
    }
    return false;
  }
  function moveY(L, a, dy) {
    if (!dy) return false;
    const hw = a.w / 2 - 1;
    if (dy > 0) {
      const s = footSurface(L, a, a.y - 0.01, a.y + dy);
      if (s) { a.y = s.y; a.vy = 0; a.onGround = true; a._oneway = s.oneway; return true; }
      a.y += dy; a.onGround = false;
      return false;
    }
    let ny = a.y + dy;
    const head = a.y - a.h;
    for (const b of L._boxes) {
      if (b.y1 === Infinity || a.x + hw <= b.x0 || a.x - hw >= b.x1) continue;
      if (head >= b.y1 - 0.01 && ny - a.h < b.y1) { ny = b.y1 + a.h; a.vy = 0; a.bonk = true; }
    }
    a.y = ny; a.onGround = false;
    return false;
  }

  // Integrates position from vx/vy (px/s) with floors, walls, one-way platforms and the map edges.
  // Sets onGround, wallL, wallR. Drop-through: while actor.dropT > 0 one-way platforms are ignored.
  W.collide = function (a, dt) {
    const L = W.loc;
    if (!L || !a) return;
    norm(a);
    a.wallL = a.wallR = false; a.bonk = false;
    if (a.dropT > 0) a.dropT = Math.max(0, a.dropT - dt);
    const wasGround = a.onGround;
    const dx = (+a.vx || 0) * dt, dy = (+a.vy || 0) * dt;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / MAX_SUB));
    let landed = false;
    for (let i = 0; i < n; i++) {
      moveX(L, a, dx / n);
      if (moveY(L, a, dy / n)) landed = true;
    }
    // Stay glued to the ground over small steps; walk off ledges into the air.
    if (!landed && (a.vy || 0) >= 0) {
      const s = footSurface(L, a, a.y - 0.5, a.y + (wasGround ? STEP_DOWN : 0.5));
      if (s) { a.y = s.y; a.vy = 0; a.onGround = true; a._oneway = s.oneway; } else a.onGround = false;
    }
    // Map edges and any clamp an owner put on the actor (fight arenas, rings).
    const hw = a.w / 2;
    let lo = hw, hi = L.w - hw;
    const bx = a.bounds;
    if (bx) { if (bx.x0 != null) lo = Math.max(lo, bx.x0 + hw); if (bx.x1 != null) hi = Math.min(hi, bx.x1 - hw); }
    if (a.x < lo) { a.x = lo; a.wallL = true; if (a.vx < 0) a.vx = 0; }
    if (a.x > hi) { a.x = hi; a.wallR = true; if (a.vx > 0) a.vx = 0; }
    if (a.wallL && a.vx < 0) a.vx = 0;
    if (a.wallR && a.vx > 0) a.vx = 0;
    // Fell out of the world: back to the last safe footing.
    if (a.y > L.h + 160) {
      const s = a._safe || { x: clamp(a.x, 40, L.w - 40), y: groundAtL(L, a.x, null) };
      a.x = s.x; a.y = s.y; a.vx = a.vy = 0; a.onGround = true;
      S.events.emit('fellOut', { id: a.id });
    }
    if (a.onGround && !a._oneway) a._safe = { x: a.x, y: a.y };
  };
  // True when the actor stands on a one-way platform (combat can use it to skip the jump on down+jump).
  W.onOneway = (a) => !!(a && a.onGround && a._oneway);
  W.drop = function (a) {
    if (!W.onOneway(a)) return false;
    a.dropT = 0.25; a.onGround = false; a.vy = Math.max(+a.vy || 0, 40); a.y += 1;
    return true;
  };

  function ladderX(l, y) {
    if (l.xTop == null) return l.x;
    return lerp(l.x, +l.xTop, clamp((l.y1 - y) / Math.max(1, l.y1 - l.y0), 0, 1));
  }
  function ladderAt(L, a) {
    for (const l of L.ladders) {
      if (a.y < l.y0 - 3 || a.y > l.y1 + 3) continue;
      if (Math.abs(a.x - ladderX(l, a.y)) <= (l.w ? l.w / 2 : 9)) return l;
    }
    return null;
  }

  /* ── 4. Actors ────────────────────────────────────────────────────── */
  // Poses that keep their facing (sitting, lying, working at something) and never turn toward Jin.
  const STATIC_POSES = new Set(['sit', 'sitFloor', 'sitCurb', 'lieBed', 'kneel', 'crouch', 'leanWall', 'wheelchair', 'bars',
    'work', 'sweep', 'write', 'down', 'knockdown', 'phone', 'cower', 'hug', 'handShoulder', 'skip', 'shadowbox', 'push', 'carry']);
  // Poses an NPC may swap to 'talk' while barking.
  const GESTURE_POSES = new Set(['idle', 'armsCrossed', 'handsHips', 'think', 'guard', 'tired', 'pocket']);
  const SNAP_POSES = new Set(['hurt', 'stagger', 'knockdown', 'jab', 'cross', 'hook', 'uppercut', 'dashStraight', 'counter',
    'flurry', 'dash', 'backdash', 'slip', 'windup', 'block']);
  const SIT_POSES = new Set(['sit', 'sitFloor', 'sitCurb', 'lieBed', 'kneel', 'wheelchair', 'down', 'getup']);
  function blendDur(from, to) {
    if (SNAP_POSES.has(to)) return 0.035;
    if (SNAP_POSES.has(from)) return 0.06;
    if (SIT_POSES.has(to) || SIT_POSES.has(from)) return 0.18;
    return 0.1;
  }

  function lookDef(look) {
    if (look && typeof look === 'object') return look;
    return (S.looks && look && S.looks[look]) || null;
  }
  // Fill defaults on any actor, including ones other modules built themselves.
  function norm(a) {
    if (a._n) return a;
    a._n = true;
    if (a.vx == null) a.vx = 0;
    if (a.vy == null) a.vy = 0;
    a.face = a.face === -1 ? -1 : 1;
    const lk = lookDef(a.look), H = (lk && +lk.h) || 46;
    if (a.h == null) a.h = H;
    if (a.w == null) a.w = Math.max(8, Math.round(14 * H / 46));
    if (!a.pose) a.pose = 'idle';
    if (a.poseT == null) a.poseT = 0;
    if (!a.layer) a.layer = 'main';
    if (a.visible == null) a.visible = true;
    if (a.present == null) a.present = true;
    if (a.onGround == null) a.onGround = true;
    if (a.dropT == null) a.dropT = 0;
    if (!a.kind) a.kind = 'npc';
    return a;
  }
  const shown = (a) => a && a.present !== false && a.visible !== false && !a.hidden;

  function resolveActor(ref) {
    if (ref == null) return null;
    if (typeof ref === 'object') return ref;
    return W.actor(ref);
  }
  // 'jin' is always Jin. With duplicate ids (placements gated by different when()), the present one wins.
  W.actor = function (id) {
    if (id == null) return null;
    if (id === 'jin') return W.jin;
    let first = null;
    for (const a of W.actors) if (a.id === id) { if (shown(a)) return a; if (!first) first = a; }
    return first;
  };

  function actorFromPlacement(p) {
    const a = Object.assign({}, p);
    a.placement = p;
    a.kind = p.kind || 'npc';
    a.look = p.look || (a.kind === 'enemy' ? 'thug' : 'man');
    a.name = p.name || (typeof p.id === 'string' ? p.id : 'Someone');
    a.x = +p.x || 0;
    a.y = p.y != null ? +p.y : groundAtL(W.loc, a.x, null);
    a.fixedY = p.y != null;
    a.face = p.face === -1 ? -1 : 1;
    a.basePose = a.pose = p.pose || 'idle';
    a.barkRadius = p.barkRadius != null ? +p.barkRadius : 70;
    a.loop = p.loop !== false;
    a.present = test(p.when, 'npc when ' + p.id);
    a.marker = null; a.bark = null; a.when = null;
    a._barkIdx = 0; a._barkNext = 0;
    a.marker = liveMarker(a);
    norm(a);
    return a;
  }

  // Spawn an actor from an NpcPlacement (or an enemy spec with kind:'enemy'). Same id replaces the old one.
  W.spawn = function (p) {
    if (!p) return null;
    if (p.id === 'jin') return W.jin;
    if (p.id != null) W.remove(p.id);
    const a = actorFromPlacement(p);
    W.actors.push(a);
    return a;
  };
  W.remove = function (id) {
    const a = typeof id === 'object' ? id : null;
    for (let i = W.actors.length - 1; i >= 0; i--) {
      const b = W.actors[i];
      if (b === W.jin) continue;
      if (a ? b === a : b.id === id) {
        W.actors.splice(i, 1);
        if (W.focus && W.focus.ref === b) W.focus = null;
        if (st.bark && st.bark.actor === b) st.bark = null;
        if (cam.target === b) cam.target = W.jin;
      }
    }
  };

  // Change a pose with a crossfade. opts: { t: start time, hold: seconds (then back to basePose) | true,
  // base: make it the NPC's resting pose }. On Jin it holds while a scene has control.
  W.setPose = function (ref, pose, opts) {
    const a = resolveActor(ref);
    if (!a || !pose) return;
    opts = opts || {};
    norm(a);
    if (a.pose !== pose) {
      a._blend = { pose: a.pose, t: a.poseT, k: 1, dur: blendDur(a.pose, pose) };
      a.pose = pose; a._pp = pose;
      a.poseT = +opts.t || 0;
    } else if (opts.restart) a.poseT = +opts.t || 0;
    a._myT = a.poseT;
    if (a === W.jin) { a.scriptPose = pose === 'idle' && !opts.hold ? null : pose; return; }
    if (typeof opts.hold === 'number') { a.poseHoldT = opts.hold; }
    else { a.poseHoldT = 0; if (opts.base !== false) a.basePose = pose; }
  };
  W.face = function (ref, dirOrRef) {
    const a = resolveActor(ref);
    if (!a) return;
    if (dirOrRef === 1 || dirOrRef === -1) { a.face = dirOrRef; return; }
    const o = typeof dirOrRef === 'number' ? { x: dirOrRef } : resolveActor(dirOrRef);
    if (o && o.x !== a.x) a.face = o.x > a.x ? 1 : -1;
  };
  W.place = function (ref, x, y) {
    const a = resolveActor(ref);
    if (!a) return;
    a.x = +x || 0;
    a.y = y != null ? +y : groundAtL(W.loc, a.x, a.fixedY ? a.y : null);
    a.vx = a.vy = 0; a.onGround = true; a.ladder = null;
    if (a.goal) finishGoal(a, false);
    if (a === W.jin) { a._safe = { x: a.x, y: a.y }; if (cam.mode === 'follow') snapCamera(); }
  };
  W.show = function (ref, on) {
    const a = resolveActor(ref);
    if (!a) return;
    a.visible = !!on; a.hidden = !on;
  };
  W.setLook = function (ref, look) {
    const a = resolveActor(ref);
    if (!a) return;
    a.look = look; a._n = false; a.h = a.w = null; norm(a);
    if (a === W.jin && S.G) { S.G.body = S.G.body || {}; S.G.body.look = look; }
  };

  // Pose time and crossfade bookkeeping. If another module drives poseT itself, world stops advancing it.
  function tickPose(a, dt) {
    if (a.pose !== a._pp) {
      if (a._pp) a._blend = { pose: a._pp, t: a._ppT || 0, k: 1, dur: blendDur(a._pp, a.pose) };
      a._pp = a.pose;
      if (!a._extT) a.poseT = 0;
    } else if (!a._extT) {
      if (a._myT !== undefined && a.poseT !== a._myT) a._extT = true;
      else if (!a.animFreeze) a.poseT += dt;
    }
    a._myT = a.poseT; a._ppT = a.poseT;
    if (a._blend) { a._blend.k -= dt / a._blend.dur; if (a._blend.k <= 0) a._blend = null; }
    if (a.tintT > 0) { a.tintT -= dt; if (a.tintT <= 0) { a.tintT = 0; a.tint = null; } }
  }

  /* ── 5. Scripted movement (A.walk) ────────────────────────────────── */
  // Walk an actor to x. opts: { run, speed (px/s), face (final facing, or an actor id), pose (moving pose),
  // endPose }. Returns a Wait: result true on arrival, false if blocked/stuck or interrupted.
  W.walkTo = function (ref, x, opts) {
    const a = resolveActor(ref);
    if (!a || !W.loc) return doneWait(false);
    norm(a);
    opts = opts || {};
    if (a.goal) finishGoal(a, false);
    const w = makeWait(true);
    const isJin = a === W.jin;
    const speed = opts.speed != null ? Math.max(5, +opts.speed) : opts.run ? (isJin ? 165 : 120) : (isJin ? 64 : 46);
    a.goal = { x: clamp(+x || 0, a.w / 2, W.loc.w - a.w / 2), speed, run: !!opts.run, face: opts.face, pose: opts.pose,
      endPose: opts.endPose, w, stuckT: 0, lastX: a.x, internal: !!opts.internal };
    if (isJin) a.scriptPose = null;
    return w;
  };
  // Walk up to another actor, stopping `gap` px short, and face it.
  W.walkToActor = function (ref, otherRef, gap, opts) {
    const a = resolveActor(ref), o = resolveActor(otherRef);
    if (!a || !o) return doneWait(false);
    const g = gap == null ? 24 : +gap;
    const side = a.x <= o.x ? -1 : 1;
    return W.walkTo(a, o.x + side * g, Object.assign({}, opts || {}, { face: o }));
  };
  function finishGoal(a, ok) {
    const g = a.goal;
    if (!g) return;
    a.goal = null;
    a.vx = 0;
    let f = g.face;
    if (typeof f === 'string' || (f && typeof f === 'object')) { const o = resolveActor(f); f = o ? (o.x >= a.x ? 1 : -1) : null; }
    if (f === 1 || f === -1) a.face = f;
    const rest = g.endPose || (a === W.jin ? 'idle' : a.basePose || 'idle');
    if (a.pose === 'walk' || a.pose === 'run' || a.pose === g.pose || g.endPose) a.pose = rest;
    if (g.w) g.w.finish(ok);
  }
  function driveGoal(a, dt) {
    const g = a.goal, L = W.loc;
    const d = g.x - a.x;
    if (Math.abs(d) <= 0.75) { a.x = g.x; finishGoal(a, true); return; }
    const dir = d > 0 ? 1 : -1;
    a.face = dir;
    a.pose = g.pose || (g.run ? 'run' : a.walkPose || (a.basePose === 'limp' ? 'limp' : 'walk'));
    if (a === W.jin || a.kind === 'enemy' || g.collide) {
      // Jin and fighters respect walls and ledges.
      a.vx = dir * Math.min(g.speed, Math.abs(d) / dt);
      if (!a.onGround) a.vy = (a.vy || 0) + GRAV * dt;
      W.collide(a, dt);
    } else {
      a.x += dir * Math.min(Math.abs(d), g.speed * dt);
      if (!a.fixedY) a.y = groundAtL(L, a.x, a.y - STEP_UP);
    }
    // Blocked or stuck for a moment: give up so a scene never hangs.
    if (Math.abs(a.x - g.lastX) < 0.05) { g.stuckT += dt; if (g.stuckT > 0.8) finishGoal(a, false); }
    else { g.stuckT = 0; g.lastX = a.x; }
  }

  /* ── 6. NPC behaviour ─────────────────────────────────────────────── */
  const turnable = (pose) => !STATIC_POSES.has(pose);
  function faceToward(a, o, slack) {
    if (!o) return;
    const d = o.x - a.x;
    if (Math.abs(d) > (slack || 4)) a.face = d > 0 ? 1 : -1;
  }
  function pauseRange(p) {
    if (Array.isArray(p)) return S.randRange(+p[0] || 0, +p[1] || 0);
    if (p != null) return S.randRange(0.6 * +p, 1.4 * +p);
    return S.randRange(1.5, 4.5);
  }
  function walkStep(a, tx, speed, dt) {
    const d = tx - a.x;
    if (Math.abs(d) <= 0.75) { a.x = tx; return true; }
    a.face = d > 0 ? 1 : -1;
    a.x += a.face * Math.min(Math.abs(d), speed * dt);
    if (!a.fixedY) a.y = groundAtL(W.loc, a.x, a.y - STEP_UP);
    a.pose = a.walkPose || (a.basePose === 'limp' ? 'limp' : 'walk');
    return false;
  }

  function updateNpc(a, dt, sceneBusy) {
    if (!a.present) return;
    if (a.goal) { driveGoal(a, dt); return; }
    const j = W.jin;
    const near = j && shown(j) && Math.abs(j.x - a.x) < 40 && Math.abs(j.y - a.y) < 40;
    // A held pose (A.pose with hold seconds) returns to the resting pose afterwards.
    if (a.poseHoldT > 0) { a.poseHoldT -= dt; if (a.poseHoldT <= 0) { a.poseHoldT = 0; a.pose = a.basePose; } return; }
    if (a._talking) {
      if (!directorBusy() && S.time - a._talkStart > 0.15) a._talking = false;
      else { if (turnable(a.pose)) faceToward(a, j); return; }
    }
    if (st.bark && st.bark.actor === a && st.bark.gesture) return;
    const restful = STATIC_POSES.has(a.basePose) && a.basePose !== 'sweep';
    // Wander and paths pause during scenes (scenes place people) and when Jin stands close (so he can talk).
    const roams = (a.path && a.path.length) || a.wander;
    if (roams && !restful && !sceneBusy && !(near && (a.talk || a.barks))) {
      if (a.path && a.path.length) runPath(a, dt); else runWander(a, dt);
      return;
    }
    if (a.pose === 'walk' || (a.pose === 'limp' && a.basePose !== 'limp')) a.pose = a.basePose;
    idle(a, dt, near);
  }
  function runWander(a, dt) {
    const wd = a.wander, x0 = Math.min(+wd.x0, +wd.x1), x1 = Math.max(+wd.x0, +wd.x1);
    const s = a._wd || (a._wd = { mode: 'pause', t: pauseRange(wd.pause), tx: a.x });
    if (s.mode === 'pause') {
      if (a.pose === 'walk' || a.pose === 'limp') a.pose = a.basePose;
      s.t -= dt;
      if (s.t <= 0) {
        let tx = x0 + S.rand() * (x1 - x0);
        if (Math.abs(tx - a.x) < 16) tx = a.x < (x0 + x1) / 2 ? Math.min(x1, a.x + 24) : Math.max(x0, a.x - 24);
        s.tx = tx; s.mode = 'walk';
      }
    } else if (walkStep(a, s.tx, wd.speed != null ? +wd.speed : 24, dt)) {
      s.mode = 'pause'; s.t = pauseRange(wd.pause); a.pose = a.basePose;
    }
  }
  function runPath(a, dt) {
    const pts = a.path;
    const s = a._pt || (a._pt = { i: 0, mode: 'walk', t: 0 });
    if (s.mode === 'done') { a.pose = (pts[pts.length - 1] && pts[pts.length - 1].pose) || a.basePose; return; }
    const p = pts[s.i] || pts[0];
    if (s.mode === 'walk') {
      if (walkStep(a, +p.x || 0, p.speed != null ? +p.speed : (a.pathSpeed || 36), dt)) {
        s.mode = 'wait'; s.t = +p.wait || 0;
        a.pose = p.pose || a.basePose;
        if (p.face === 1 || p.face === -1) a.face = p.face;
      }
    } else {
      s.t -= dt;
      if (s.t <= 0) {
        s.i++;
        if (s.i >= pts.length) { if (a.loop) { s.i = 0; s.mode = 'walk'; } else s.mode = 'done'; }
        else s.mode = 'walk';
      }
    }
  }
  function idle(a, dt, near) {
    // Optional variety: placement.idles = ['idle', 'armsCrossed', ...] cycles every 6–12 s.
    if (Array.isArray(a.idles) && a.idles.length > 1) {
      a._idleT = (a._idleT == null ? S.randRange(6, 12) : a._idleT) - dt;
      if (a._idleT <= 0) { a._idleT = S.randRange(6, 12); a._idleI = ((a._idleI || 0) + 1) % a.idles.length; a.basePose = a.idles[a._idleI]; }
    }
    if (!(st.bark && st.bark.actor === a)) a.pose = a.basePose;
    // People glance at Jin when he comes close.
    if (near && turnable(a.pose)) faceToward(a, W.jin, 6);
  }

  // Barks: the closest eligible NPC in range speaks a line it has not said in the last 20 s; one bubble at a time.
  function barkLines(a) {
    let b = a.barks;
    if (typeof b === 'function') b = callFn(b, 'barks ' + a.id, S.G);
    if (typeof b === 'string') b = [b];
    return Array.isArray(b) ? b.filter((s) => typeof s === 'string' && s) : [];
  }
  function barkDur(text) { return clamp(1.6 + String(text).length * 0.05, 2.2, 5.5); }
  function showBark(a, text, seconds, scripted) {
    if (!a || !text) return;
    if (st.bark && st.bark.actor && st.bark.actor !== a) endBark();
    const dur = seconds != null ? Math.max(0.5, +seconds) : barkDur(text);
    const gesture = a !== W.jin && GESTURE_POSES.has(a.pose) && !a.goal;
    st.bark = { actor: a, text: String(text), t: dur, dur, gesture, scripted: !!scripted };
    a.bark = { text: String(text), t: dur, dur };
    if (gesture) a.pose = 'talk';
    st.barkSeen[text] = S.time;
    S.events.emit('bark', { id: a.id, text: String(text), dur });
  }
  function endBark() {
    const b = st.bark;
    if (!b) return;
    st.bark = null;
    if (b.actor) {
      b.actor.bark = null;
      if (b.gesture && b.actor.pose === 'talk') b.actor.pose = b.actor.basePose || 'idle';
    }
  }
  // Script API: A.bark(id, text, seconds). Always shows (no repeat limit), replacing the current bubble.
  W.bark = function (ref, text, seconds) {
    const a = resolveActor(ref == null ? 'jin' : ref);
    if (!a) return;
    if (!text) { if (st.bark && st.bark.actor === a) endBark(); return; }
    showBark(a, text, seconds, true);
  };
  function updateBarks(dt, canAuto) {
    if (st.bark) {
      st.bark.t -= dt;
      if (st.bark.actor && st.bark.actor.bark) st.bark.actor.bark.t = st.bark.t;
      if (st.bark.t <= 0 || !shown(st.bark.actor) || W.actors.indexOf(st.bark.actor) < 0) endBark();
    }
    if (st.bark || !canAuto) return;
    const j = W.jin;
    if (!j || !shown(j)) return;
    let best = null, bestD = Infinity;
    for (const a of W.actors) {
      if (a === j || a.kind === 'enemy' || !shown(a) || !a.barks || a._talking || a.goal) continue;
      if (S.time < a._barkNext) continue;
      const d = Math.abs(a.x - j.x);
      if (d > a.barkRadius || Math.abs(a.y - j.y) > 60 || d >= bestD) continue;
      best = a; bestD = d;
    }
    if (!best) return;
    const lines = barkLines(best);
    if (!lines.length) { best._barkNext = S.time + 3; return; }
    for (let k = 0; k < lines.length; k++) {
      const i = (best._barkIdx + k) % lines.length, line = lines[i];
      const seen = st.barkSeen[line];
      if (seen != null && S.time - seen < BARK_REPEAT) continue;
      best._barkIdx = i + 1;
      showBark(best, line);
      best._barkNext = S.time + Math.max(BARK_NPC_GAP, st.bark.dur + 4);
      return;
    }
    best._barkNext = S.time + 2;   // everything said recently; check again shortly
  }
  // UI data: the bubble on screen (screen positions in CSS px relative to #story-root).
  W.barks = function () {
    const b = st.bark;
    if (!b || !b.actor) return [];
    const a = b.actor, p = W.screenPos(a.x, a.y - a.h - 6);
    return [{ id: a.id, name: a.name, text: b.text, x: p.x, y: p.y, t: b.t, dur: b.dur, jin: a === W.jin }];
  };
  W.markers = function () {
    const out = [];
    for (const a of W.actors) {
      if (a === W.jin || !a.marker || !shown(a)) continue;
      const p = W.screenPos(a.x, a.y - a.h - 6);
      out.push({ id: a.id, name: a.name, marker: a.marker, x: p.x, y: p.y });
    }
    return out;
  };

  /* ── 7. Who is in charge: director, fights, activities ────────────── */
  const directorBusy = () => !!(S.director && S.director.busy);
  function fightState() {
    const cs = S.combat && S.combat.state;
    if (!cs) return null;
    if (cs.fight && !cs.fight.done) return cs.fight;
    if (cs.bout && !cs.bout.done) return cs.bout;
    return null;
  }
  function fightArena(fs) {
    if (!fs) return null;
    const d = fs.def || {};
    const a = fs.arena || fs.ring || d.arena || d.ring;
    return a && isFinite(a.x0) && isFinite(a.x1) ? a : null;
  }
  function enemiesLive() {
    if (S.combat && typeof S.combat.enemies === 'function') {
      try { return S.combat.enemies() || []; } catch (e) { report(e, 'combat.enemies'); }
    }
    return W.actors.filter((a) => a.kind === 'enemy' && shown(a) && !a.down && !a.ko);
  }
  function activityState() {
    const A = S.activities, c = A && A.current;
    return c && !c.done ? c : null;
  }
  // Does the player steer Jin right now? A running scene takes control unless it handed it back
  // (A.control(true)), or a fight/bout/activity it started is underway. W.control forces either way.
  function playerHasControl() {
    if (W.control === true) return true;
    if (W.control === false || S.paused) return false;
    const D = S.director;
    if (!D || !D.busy) return true;
    if (D.dialog) return false;
    if (fightState() || activityState()) return true;
    if (typeof D.hasControl === 'function') { try { return !!D.hasControl(); } catch (_) { return false; } }
    return D.control === true || D.playerControl === true || D.hasControl === true || D.controlGiven === true;
  }
  W.playerControl = playerHasControl;
  W.fightActive = () => !!fightState();

  function runScene(run, label) {
    if (!run) return null;
    const D = S.director;
    if (!D || typeof D.run !== 'function') { report(new Error('no director to run ' + label), 'scene'); return null; }
    try { return D.run(run, { label }); } catch (e) { report(e, 'scene ' + label); return null; }
  }
  function liveMarker(a) {
    const p = a.placement;
    if (!p || p.marker == null) return null;
    const m = typeof p.marker === 'function' ? callFn(p.marker, 'marker ' + a.id, S.G) : p.marker;
    return typeof m === 'string' && m ? m : null;
  }
  // when() and marker() for every placed NPC (20 times a second is plenty).
  function updateLive() {
    for (const a of W.actors) {
      if (a === W.jin || !a.placement) continue;
      if (a.placement.when) a.present = test(a.placement.when, 'npc when ' + a.id);
      a.marker = liveMarker(a);
    }
  }

  /* ── 8. Jin: control hand-off, ladders, drop-through, fallback ────── */
  let climbPoseName = null;
  function climbPose() {
    if (!climbPoseName) climbPoseName = S.art && Array.isArray(S.art.poses) && S.art.poses.indexOf('climb') >= 0 ? 'climb' : 'reach';
    return climbPoseName;
  }
  function updateJin(j, dt) {
    const control = playerHasControl();
    const tr = st.trans;
    j.control = control && !(tr.phase && !(tr.phase === 'in' && tr.k < 0.5));
    if (j._ladderCd > 0) j._ladderCd -= dt;
    // While the screen fades Jin keeps physics but takes no input (edge exits keep walking).
    if (tr.phase && !(tr.phase === 'in' && tr.k < 0.5)) {
      if (j.goal) { driveGoal(j, dt); return; }
      j.vx = approach(+j.vx || 0, 0, 1200 * dt);
      if (!j.onGround) j.vy = (+j.vy || 0) + GRAV * dt;
      W.collide(j, dt);
      if (j.onGround && Math.abs(j.vx) < 5 && (j.pose === 'walk' || j.pose === 'run')) j.pose = 'idle';
      return;
    }
    if (j.ladder) { climb(j, dt, control); return; }
    if (j.goal) { driveGoal(j, dt); return; }
    // A pose a scene put on Jin holds until the scene ends or hands control back.
    if (j.scriptPose) {
      if (control || !directorBusy()) j.scriptPose = null;
      else {
        j.pose = j.scriptPose; j.vx = 0;
        if (!j.onGround) j.vy = (+j.vy || 0) + GRAV * dt;
        W.collide(j, dt);
        return;
      }
    }
    if (control && !fightState() && tryLadder(j)) { climb(j, dt, control); return; }
    if (control) checkDrop(j);
    if (S.combat && typeof S.combat.updateActor === 'function') S.combat.updateActor(j, dt);
    else fallbackJin(j, dt, control);
  }
  function tryLadder(j) {
    if (j._ladderCd > 0 || !W.loc.ladders.length) return false;
    const l = ladderAt(W.loc, j);
    if (!l) return false;
    if (S.input.down('up') && j.y > l.y0 + 2) { attachLadder(j, l); return true; }
    if (S.input.down('down') && j.onGround && Math.abs(j.y - l.y0) <= 4) { attachLadder(j, l); j.y = l.y0 + 3; return true; }
    return false;
  }
  function attachLadder(j, l) {
    j.ladder = l; j.vx = 0; j.vy = 0; j.onGround = false;
    S.events.emit('ladder', { on: true });
  }
  function detachLadder(j) {
    j.ladder = null; j.animFreeze = false; j._ladderCd = 0.25;
    S.events.emit('ladder', { on: false });
  }
  function climb(j, dt, control) {
    const l = j.ladder;
    const up = control && S.input.down('up'), dn = control && S.input.down('down');
    const dir = (dn ? 1 : 0) - (up ? 1 : 0);
    const stairs = l.kind === 'stairs' || l.xTop != null;
    j.vx = 0; j.vy = 0; j.onGround = false;
    if (control && S.input.pressed('jump')) {
      S.input.consume('jump');
      const h = (S.input.down('right') ? 1 : 0) - (S.input.down('left') ? 1 : 0);
      detachLadder(j);
      j.vy = -170; j.vx = h * 90; if (h) j.face = h;
      j.pose = 'jump';
      return;
    }
    j.y += dir * (stairs ? 70 : 58) * dt;
    j.x = approach(j.x, ladderX(l, j.y), 240 * dt);
    if (stairs) {
      if (dir && l.xTop != null && +l.xTop !== l.x) j.face = (dir < 0 ? +l.xTop - l.x : l.x - +l.xTop) > 0 ? 1 : -1;
      j.pose = dir ? 'walk' : 'idle'; j.animFreeze = false;
    } else { j.pose = climbPose(); j.animFreeze = !dir; }
    if (dir && S.time - (j._stepSnd || 0) > 0.32) { j._stepSnd = S.time; S.audio.play(stairs ? 'stairs' : 'step', { vol: 0.35 }); }
    if (j.y <= l.y0) {
      j.y = l.y0;
      const s = footSurface(W.loc, j, l.y0 - 1.5, l.y0 + 1.5);
      if (s) { detachLadder(j); j.y = s.y; j.onGround = true; j._oneway = s.oneway; j.pose = 'idle'; }
    } else if (j.y >= l.y1 && dir >= 0) {
      detachLadder(j);
      const s = footSurface(W.loc, j, l.y1 - 3, l.y1 + STEP_DOWN);
      if (s) { j.y = s.y; j.onGround = true; j._oneway = s.oneway; }
      j.pose = 'idle';
    }
  }
  // Down + jump on a one-way platform drops through it (the jump press is consumed before combat sees it).
  function checkDrop(j) {
    if (!W.onOneway(j) || !S.input.down('down') || !S.input.pressed('jump')) return;
    S.input.consume('jump');
    W.drop(j);
  }
  // Minimal controller used only when combat.js is absent (dev builds, early integration).
  function fallbackJin(j, dt, control) {
    const dir = control ? (S.input.down('right') ? 1 : 0) - (S.input.down('left') ? 1 : 0) : 0;
    const top = S.input.down('run') ? 78 : 184;
    j.vx = approach(+j.vx || 0, dir * top, (j.onGround ? 1800 : 1100) * dt);
    if (dir) j.face = dir;
    if (control && j.onGround && S.input.buffer('jump')) { j.vy = -380; j.onGround = false; S.audio.play('jump'); }
    if (!j.onGround) j.vy = (+j.vy || 0) + GRAV * dt;
    W.collide(j, dt);
    j.pose = !j.onGround ? (j.vy < 0 ? 'jump' : 'fall') : Math.abs(j.vx) > 110 ? 'run' : Math.abs(j.vx) > 8 ? 'walk' : 'idle';
  }

  /* ── 9. Interaction: focus, talk, examine ─────────────────────────── */
  const DOOR_VERB = { door: 'Enter', edge: 'Go', stairs: 'Take', ladder: 'Climb' };
  const nameCache = Object.create(null);
  function locName(id) {
    if (!id) return '';
    if (!(id in nameCache)) { const d = rawDef(id); nameCache[id] = (d && d.name) || id; }
    return nameCache[id];
  }
  const usedKey = (o) => 'used:' + (S.G ? S.G.chapter : 0) + ':' + W.locId + ':' + o.id;
  function isUsed(o) { return !!(o._used || (S.G && S.G.flags && S.G.flags[usedKey(o)])); }
  function markUsed(o) { o._used = true; if (S.G && S.G.flags) S.G.flags[usedKey(o)] = true; }
  const haveEvidence = (id) => !!(S.G && S.G.evidence && S.G.evidence[id]);

  // Every interactable that is valid right now (no distance check).
  function entries() {
    const L = W.loc, out = [];
    if (!L) return out;
    const act = activityState();
    const doorsOnly = !!(act && (act.name === 'carry' || act.kind === 'carry'));
    if (act && !doorsOnly) return out;
    if (!doorsOnly) {
      for (const a of W.actors) {
        if (a === W.jin || !shown(a) || a.goal) continue;
        if (!a.talk && !a.barks) continue;
        if (a.kind === 'enemy' && !a.talk) continue;
        const hw = Math.max(6, a.w / 2 + 2);
        out.push({ kind: 'npc', ref: a, id: a.id, label: a.name, verb: a.verb || 'Talk', x: a.x, x0: a.x - hw, x1: a.x + hw, y0: a.y - a.h, y1: a.y });
      }
      for (const o of L.objects) {
        if (isUsed(o) && o.once) continue;
        if (!test(o.when, 'object when ' + o.id)) continue;
        if (o.evidence && !o.run && o.text == null && haveEvidence(o.evidence)) continue;
        const hw = (+o.w || 20) / 2;
        out.push({ kind: 'object', ref: o, id: o.id, label: o.label || 'Something', verb: o.verb || 'Examine', x: o.x,
          x0: o.x - hw, x1: o.x + hw, y0: o._y - (+o.h || 30), y1: o._y, hidden: !!o.hidden });
      }
    }
    for (const d of L.doors) {
      if (d.auto) continue;    // walked through, never focused
      if (!test(d.when, 'door when ' + d.id)) continue;
      const hw = (+d.w || 24) / 2;
      out.push({ kind: 'door', ref: d, id: d.id, label: d.label || locName(d.to), verb: d.verb || DOOR_VERB[d.kind] || 'Enter', x: d.x,
        x0: d.x - hw, x1: d.x + hw, y0: d._y - (+d.h || 48), y1: d._y });
    }
    return out;
  }
  // Lower is better; null = out of reach. "In front" = within 28 px in the facing direction.
  function scoreEntry(j, e) {
    const overlapV = Math.min(j.y, e.y1 + 6) - Math.max(j.y - j.h, e.y0 - 6);
    if (overlapV <= 0) return null;
    let d = 0, behind = false;
    if (j.x < e.x0 || j.x > e.x1) {
      const ahead = j.face > 0 ? e.x0 - j.x : j.x - e.x1;
      if (ahead > 0) d = ahead; else { behind = true; d = j.face > 0 ? j.x - e.x1 : e.x0 - j.x; }
    }
    if (behind ? d > BEHIND_SLACK : d > (e.hidden ? HIDDEN_RANGE : INTERACT_RANGE)) return null;
    return d + (behind ? 8 : 0) + (e.kind === 'npc' ? 0 : e.kind === 'object' ? 1 : 2) + Math.abs(j.x - e.x) * 0.05;
  }
  function lockReason(d) {
    let r = d.locked;
    if (typeof r === 'function') { try { r = r(S.G); } catch (e) { report(e, 'door locked ' + d.id); r = false; } }
    if (!r) return null;
    return typeof r === 'string' ? r : 'Locked.';
  }
  function makeFocus(e) {
    const key = S.input && S.input.labelFor ? S.input.labelFor('interact') : 'E';
    const f = { kind: e.kind, ref: e.ref, id: e.id, label: e.label, verb: e.verb, x: e.x, y: e.y0 - 4, key };
    f.text = '[' + key + '] ' + e.verb + (e.label ? ' — ' + e.label : '');
    if (e.kind === 'door') { const why = lockReason(e.ref); if (why) f.locked = why; }
    if (e.kind === 'npc' && e.ref.marker) f.marker = e.ref.marker;
    return f;
  }
  function canInteract(j) {
    if (!j || !shown(j) || st.trans.phase || !playerHasControl()) return false;
    if (fightState() || j.ladder || (j.goal && !j.goal.internal) || !j.onGround) return false;
    return S.time - st.lastBusy >= INTERACT_DEBOUNCE;
  }
  function updateInteraction() {
    const j = W.jin;
    if (!canInteract(j)) { W.focus = null; return; }
    let best = null, bs = Infinity;
    for (const e of entries()) { const s = scoreEntry(j, e); if (s != null && s < bs) { bs = s; best = e; } }
    if (!best) { W.focus = null; return; }
    // Keep the same object while the target is the same so UI can diff cheaply.
    const f = W.focus && W.focus.ref === best.ref ? Object.assign(W.focus, makeFocus(best)) : makeFocus(best);
    W.focus = f;
    if (S.input.pressed('interact') || (best.kind === 'door' && S.input.pressed('up'))) {
      S.input.consume('interact');
      if (best.kind === 'door') S.input.consume('up');
      W.focus = null;
      useEntry(best);
    }
  }
  function useEntry(e) {
    if (!e || !e.ref) return false;
    if (e.kind === 'npc') return talkTo(e.ref);
    if (e.kind === 'object') return examine(e.ref);
    if (e.kind === 'door') return useDoor(e.ref);
    return false;
  }
  function talkTo(a) {
    const j = W.jin;
    if (j && Math.abs(a.x - j.x) > 1) j.face = a.x > j.x ? 1 : -1;
    if (j && turnable(a.pose)) faceToward(a, j, 0);
    S.events.emit('interact', { kind: 'npc', id: a.id });
    if (a.talk) {
      a._talking = true; a._talkStart = S.time;
      if (st.bark && st.bark.actor === a) endBark();
      runScene(a.talk, 'talk:' + a.id);
      return true;
    }
    const lines = barkLines(a);
    if (!lines.length) return false;
    const i = (a._barkIdx || 0) % lines.length;
    a._barkIdx = i + 1;
    showBark(a, lines[i]);
    a._barkNext = S.time + BARK_NPC_GAP;
    return true;
  }
  function examine(o) {
    const j = W.jin;
    if (j && Math.abs(o.x - j.x) > 2) j.face = o.x > j.x ? 1 : -1;
    S.events.emit('interact', { kind: 'object', id: o.id });
    if (o.once) markUsed(o);
    const scene = objectScene(o);
    if (scene) runScene(scene, 'object:' + o.id);
    return true;
  }
  // ObjectDef -> scene: Sit (walk over, sit, camera eases out, thoughts), run, thought lines, evidence/memory.
  function objectScene(o) {
    const sit = /^sit$/i.test(o.verb || '') && !o.run;
    if (!sit && o.text == null && !o.evidence && !o.memory && !o.doc) return o.run || null;
    return function* objectExamine(A, G) {
      if (sit) {
        yield A.walk('jin', o.x, {});
        if (o.face === 1 || o.face === -1) A.face('jin', o.face);
        A.pose('jin', o.pose || 'sit');
        yield A.cam({ target: 'jin', zoom: o.zoom || 0.9, dur: 1.2 });
      }
      if (o.run) { if (typeof o.run === 'string') yield* A.sub(o.run); else yield* o.run(A, G); }
      let lines = typeof o.text === 'function' ? o.text(G) : o.text;
      if (lines != null) {
        if (!Array.isArray(lines)) lines = [lines];
        for (const ln of lines) if (ln) yield A.think(String(ln));
      }
      if (o.evidence) A.evidence(o.evidence);
      if (o.memory) A.memory(o.memory);
      if (o.doc) yield A.doc(o.doc === true ? o.evidence : o.doc);
      if (sit) { yield A.wait(0.3); A.pose('jin', 'idle'); A.follow(); }
    };
  }

  // Programmatic interaction (tests, autoplay): every valid interactable, nearest first, with distances.
  W.interactables = function () {
    const j = W.jin;
    return entries().map((e) => ({ kind: e.kind, id: e.id, label: e.label, verb: e.verb, x: e.x, y: e.y1,
      dist: j ? Math.abs(e.x - j.x) : 0, reachable: j ? scoreEntry(j, e) != null : false, ref: e.ref }))
      .sort((a, b) => a.dist - b.dist);
  };
  // Use the nearest interactable matching an id or a kind ('npc'|'object'|'door'), ignoring reach.
  W.interactWith = function (idOrKind) {
    const j = W.jin;
    let best = null, bd = Infinity;
    for (const e of entries()) {
      if (idOrKind != null && e.id !== idOrKind && e.kind !== idOrKind) continue;
      const d = j ? Math.abs(e.x - j.x) : 0;
      if (d < bd) { bd = d; best = e; }
    }
    return best ? useEntry(best) : false;
  };
  W.use = function (focus) { return useEntry(focus || W.focus); };

  /* ── 10. Doors, transitions, triggers ─────────────────────────────── */
  function useDoor(d) {
    if (!d || !W.loc) return false;
    if (!test(d.when, 'door when ' + d.id)) return false;
    const why = lockReason(d);
    if (why) {
      if (S.time - (d._rattleAt || -9) > 0.45) { d._rattleAt = S.time; S.audio.play('door', { rattle: true, locked: true, vol: 0.5 }); }
      S.events.emit('toast', { text: why, kind: 'locked' });
      S.events.emit('interact', { kind: 'door', id: d.id, locked: why });
      return false;
    }
    S.events.emit('interact', { kind: 'door', id: d.id, to: d.to });
    if (!d.to) { if (d.run) runScene(d.run, 'door:' + d.id); return !!d.run; }
    const snd = d.sound !== undefined ? d.sound : d.kind === 'edge' ? null : (d.kind === 'stairs' || d.kind === 'ladder') ? 'stairs' : 'door';
    const arr = arrivalFor(d);
    W.travel(d.to, arr.x, { y: arr.y, face: arr.face, sound: snd, via: d.id,
      edge: d.kind === 'edge' ? (d.x < W.loc.w / 2 ? -1 : 1) : 0 });
    return true;
  }
  // Where a door puts Jin: its tx, else beside the target's door that leads back here, else the far end.
  function arrivalFor(d) {
    const from = W.locId, T = rawDef(d.to);
    const tw = T ? Math.max(64, +T.w || VW) : VW;
    let x = d.tx != null ? +d.tx : null, face = d.face === 1 || d.face === -1 ? d.face : null;
    if (x == null && T && Array.isArray(T.doors)) {
      const back = T.doors.find((o) => o && o.to === from);
      if (back) {
        let bx = back.x != null ? +back.x : back.side === 'left' ? 0 : back.side === 'right' ? tw : tw / 2;
        if (back.kind === 'edge') { const inward = bx < tw / 2 ? 1 : -1; bx += inward * 30; if (face == null) face = inward; }
        x = bx;
      }
    }
    if (x == null) x = d.kind === 'edge' ? (d.x < W.loc.w / 2 ? tw - 40 : 40) : 40;
    if (face == null) face = d.kind === 'edge' ? (x < tw / 2 ? 1 : -1) : (W.jin ? W.jin.face : 1);
    return { x, y: d.ty != null ? +d.ty : undefined, face };
  }

  // Fade out, enter, fade in. opts: { y, face, sound, edge: -1|1 (walk-through exit), fade:false (cut), outDur, fadeDur }.
  W.travel = function (locId, x, opts) {
    opts = opts || {};
    const w = makeWait(locId);
    if (!W.loc || opts.fade === false) { doEnter(locId, x, opts, w, opts.edge || 0); return w; }
    const tr = st.trans;
    if (tr.phase === 'out' && tr.w) tr.w.finish(false);
    if (opts.sound) S.audio.play(opts.sound);
    const k0 = tr.k || 0;
    st.trans = { phase: 'out', t: 0, dur: opts.outDur != null ? Math.max(0.01, +opts.outDur) : 0.28, k0, k: k0,
      pending: { locId, x, opts }, w, edge: opts.edge || 0 };
    W.transitioning = true;
    const j = W.jin;
    if (st.trans.edge && j) {
      const sp = Math.max(Math.abs(+j.vx || 0), 80);
      W.walkTo(j, j.x + st.trans.edge * 80, { speed: sp, run: sp > 120, internal: true });
    }
    return w;
  };
  function updateTransition(dt) {
    const tr = st.trans;
    if (!tr.phase) { W.transitioning = false; return; }
    tr.t += dt;
    const k = clamp(tr.t / Math.max(1e-3, tr.dur), 0, 1);
    if (tr.phase === 'out') {
      tr.k = lerp(tr.k0, 1, k);
      if (k >= 1) { const p = tr.pending; tr.pending = null; doEnter(p.locId, p.x, Object.assign({}, p.opts, { fade: true }), tr.w, tr.edge); }
    } else {
      tr.k = 1 - U.ease.inOut(k);
      if (k >= 1) { const w = tr.w; st.trans = { phase: null, t: 0, dur: 0, k: 0, k0: 0, pending: null, w: null, edge: 0 }; if (w) w.finish(); }
    }
    W.transitioning = !!st.trans.phase;
  }

  const trigKey = (t) => 'trig:' + (S.G ? S.G.chapter : 0) + ':' + W.locId + ':' + t.id;
  // once (default): fires the first time Jin is inside while when() holds, remembered in G.flags per chapter.
  // once:false fires each time Jin walks in.
  function updateTriggers() {
    const L = W.loc, j = W.jin;
    if (!j || !L.triggers.length || st.trans.phase || !playerHasControl() || !shown(j)) return;
    const flags = S.G && S.G.flags;
    for (const t of L.triggers) {
      if (t.x0 == null || t.x1 == null) continue;
      const inside = j.x >= Math.min(+t.x0, +t.x1) && j.x <= Math.max(+t.x0, +t.x1) &&
        (t.y0 == null || j.y >= +t.y0) && (t.y1 == null || j.y <= +t.y1);
      const was = t._in; t._in = inside;
      if (!inside) continue;
      if (t.once !== false) {
        if (t._fired || (flags && flags[trigKey(t)])) continue;
        if (!test(t.when, 'trigger when ' + t.id)) continue;
        t._fired = true;
        if (flags) flags[trigKey(t)] = true;
      } else if (was || !test(t.when, 'trigger when ' + t.id)) continue;
      S.events.emit('trigger', { id: t.id, loc: W.locId });
      runScene(t.run, 'trigger:' + t.id);
    }
  }
  // Auto doors fire when walked into; edge doors need Jin to push toward the map end.
  function updateAutoDoors() {
    const L = W.loc, j = W.jin;
    if (!j || st.trans.phase || !playerHasControl() || fightState() || j.ladder || (j.goal && !j.goal.internal) || !shown(j)) return;
    for (const d of L.doors) {
      if (!d.auto) continue;
      const inside = Math.abs(j.x - d.x) <= (+d.w || 24) / 2 + 1 && j.y <= d._y + 10 && j.y >= d._y - 70;
      if (!inside) { d._armed = true; continue; }
      if (!d._armed || !test(d.when, 'door when ' + d.id)) continue;
      if (d.kind === 'edge') {
        const dir = d.x < L.w / 2 ? -1 : 1;
        if (!((dir < 0 ? S.input.down('left') : S.input.down('right')) || (+j.vx || 0) * dir > 30)) continue;
      }
      d._armed = false;
      useDoor(d);
      return;
    }
  }

  /* ── 11. Entering a location ──────────────────────────────────────── */
  function jinLook() {
    const G = S.G;
    if (G && G.body && G.body.look) return G.body.look;
    const chs = S.story && S.story.chapters, ch = chs && G ? chs[G.chapter] : null;
    if (ch && ch.body && ch.body.look) return ch.body.look;
    return 'jin';
  }
  function ensureJin() {
    if (!W.jin) W.jin = norm({ id: 'jin', kind: 'jin', name: 'Jin', look: jinLook(), x: 0, y: 0, face: 1, pose: 'idle' });
    return W.jin;
  }
  W.ensureJin = ensureJin;

  // Location sound: { loop, vol } (+ a rain bed when it rains). Loops not wanted any more fade out.
  function setAmbience(L) {
    const want = Object.create(null), s = L.sound;
    if (s && s.loop) want[s.loop] = s.vol != null ? +s.vol : 0.6;
    if (s && Array.isArray(s.loops)) for (const e of s.loops) if (e && e.loop) want[e.loop] = e.vol != null ? +e.vol : 0.5;
    if ((L.weather === 'rain' || L.weather === 'drizzle') && !want.rain) want.rain = L.weather === 'rain' ? 0.55 : 0.3;
    const prev = st.loops || {};
    for (const k in prev) if (!(k in want)) S.audio.loop(k, 0, 0.9);
    for (const k in want) if (prev[k] !== want[k]) S.audio.loop(k, want[k], 1.2);
    st.loops = want;
  }

  // Load a location (resolve, build actors, place Jin, camera, ambience), then run its scenes:
  // firstEnter on the first visit in this chapter, then enter (every visit). opts: { y, face, fade = true,
  // silent (no scenes, no autosave), fadeDur }. Loads synchronously; returns a Wait that completes after the fade in.
  W.enter = function (locId, x, opts) {
    opts = opts || {};
    return doEnter(locId, x, opts, opts._wait || null, opts.edge || 0);
  };
  function doEnter(locId, x, opts, w, edge) {
    w = w || makeWait(locId);
    const L = resolveLocation(locId);
    if (!L) {
      report(new Error('Unknown location "' + locId + '"'), 'enter');
      st.trans = { phase: null, t: 0, dur: 0, k: 0, k0: 0, pending: null, w: null, edge: 0 };
      W.transitioning = false;
      w.finish(false);
      return w;
    }
    const prev = W.locId, G = S.G;
    endBark();
    for (const a of W.actors) if (a.goal) finishGoal(a, false);
    const j = ensureJin();
    W.actors.length = 0; W.actors.push(j);
    W.effects.length = 0; W.particles.length = 0; W.focus = null;
    W.loc = L; W.locId = locId;
    st.bakes = null; st.lights = null; st.rebake = true; st.dirty = false; st.routeAt = -1;

    // Jin
    const look = jinLook();
    if (!j.lookLocked && look !== j.look) { j.look = look; j._n = false; j.h = j.w = null; norm(j); }
    const sx = x != null ? +x : (L.points.start && L.points.start.x != null ? +L.points.start.x : 40);
    j.x = clamp(sx, j.w / 2, L.w - j.w / 2);
    j.y = opts.y != null ? +opts.y : groundAtL(L, j.x, null);
    j.vx = j.vy = 0; j.onGround = true; j._oneway = false; j.ladder = null; j.dropT = 0; j.scriptPose = null;
    j.animFreeze = false; j.bounds = null; j._safe = { x: j.x, y: j.y };
    if (opts.face === 1 || opts.face === -1) j.face = opts.face;
    j.present = true; j.visible = true; j.hidden = false;
    if (j.pose === 'walk' || j.pose === 'run' || j.pose === 'jump' || j.pose === 'fall') j.pose = 'idle';

    // NPCs from placements (all of them; when() decides presence live)
    for (const p of L.npcs) {
      if (!p || p.id === 'jin') continue;
      try { W.actors.push(actorFromPlacement(p)); } catch (e) { report(e, 'npc ' + p.id); }
    }
    for (const d of L.doors) d._armed = !(Math.abs(j.x - d.x) <= (+d.w || 24) / 2 + 1);
    for (const t of L.triggers) t._in = false;

    // Camera
    cam.bounds = { x0: +L.camera.x0, x1: +L.camera.x1, y0: 0, y1: L.h };
    camS.zoomTarget = +L.camera.zoom || 1; cam.zoom = camS.zoomTarget;
    if (camS.tween && camS.tween.w) camS.tween.w.finish(false);
    camS.tween = null; camS.gy = null; cam.mode = 'follow'; cam.target = j;
    snapCamera();

    if (opts.ambience !== false) setAmbience(L);
    if (G) {
      G.loc = locId; G.x = Math.round(j.x); G.y = Math.round(j.y); G.face = j.face;
      if (!G.visited) G.visited = {};
      if (!G.flags) G.flags = {};
    }

    // Fade in (the location is already live underneath).
    if (opts.fade === false) { st.trans = { phase: null, t: 0, dur: 0, k: 0, k0: 0, pending: null, w: null, edge: 0 }; w.finish(); }
    else st.trans = { phase: 'in', t: 0, dur: opts.fadeDur != null ? Math.max(0.01, +opts.fadeDur) : 0.38, k0: 1, k: 1, pending: null, w, edge: 0 };
    W.transitioning = !!st.trans.phase;
    if (edge) W.walkTo(j, j.x + j.face * 28, { speed: 80, internal: true });

    const firstKey = 'entered:' + (G ? G.chapter : 0) + ':' + locId;
    const first = !(G && G.flags[firstKey]);
    // Autosave on entering (throttled to once per 20 s), before the visit is recorded so a load replays a first visit.
    if (!opts.silent && opts.save !== false && !directorBusy() && !fightState() && S.time - st.lastAutosave >= 20 && typeof S.save === 'function') {
      st.lastAutosave = S.time;
      try { S.save('auto'); } catch (e) { report(e, 'autosave'); }
    }
    if (G) { G.visited[locId] = true; G.flags[firstKey] = true; }
    S.events.emit('enterLoc', { id: locId, from: prev, first, silent: !!opts.silent, name: L.name });
    if (!opts.silent) {
      if (first && L.firstEnter) runScene(L.firstEnter, 'firstEnter:' + locId);
      if (L.enter) runScene(L.enter, 'enter:' + locId);
    }
    return w;
  }

  // Re-resolve when()-gated pieces and geometry (flags changed). Rendering re-bakes on the next frame.
  W.rebake = function () {
    const L = W.loc;
    if (!L) return;
    resolveDynamic(L);
    st.rebake = true; st.dirty = false;
  };
  function markDirty() { if (W.loc && W.loc._hasWhen) st.dirty = true; }
  ['flag', 'quest', 'evidence', 'memory', 'chapterStart', 'loaded'].forEach((ev) => S.events.on(ev, markDirty));

  /* ── 12. Camera ───────────────────────────────────────────────────── */
  let camSync = { x: NaN, y: NaN };
  function clampCentre(cx, cy, z) {
    const b = cam.bounds, hw = VW / (2 * z), hh = VH / (2 * z);
    const bx0 = +b.x0 || 0, bx1 = b.x1 != null ? +b.x1 : (W.loc ? W.loc.w : VW);
    const by0 = +b.y0 || 0, by1 = b.y1 != null ? +b.y1 : (W.loc ? W.loc.h : VH);
    cx = bx1 - bx0 <= 2 * hw ? (bx0 + bx1) / 2 : clamp(cx, bx0 + hw, bx1 - hw);
    cy = by1 - by0 <= 2 * hh ? (by0 + by1) / 2 : clamp(cy, by0 + hh, by1 - hh);
    return [cx, cy];
  }
  function syncCam() {
    cam.x = camS.cx - VW / 2; cam.y = camS.cy - VH / 2;
    const vw = VW / cam.zoom, vh = VH / cam.zoom;
    cam.view.x = camS.cx - vw / 2; cam.view.y = camS.cy - vh / 2; cam.view.w = vw; cam.view.h = vh;
    camSync = { x: cam.x, y: cam.y };
  }
  // Feet sit a little below the middle of the view; vertical follow tracks footing, not every hop.
  function framingY(t) {
    return (camS.gy != null ? camS.gy : t.y) - VH * 0.12 + (+(W.loc && W.loc.camera.yOffset) || 0);
  }
  function followTarget(dt) {
    const j = W.jin;
    const t = cam.target && cam.target !== j && W.actors.indexOf(cam.target) >= 0 && shown(cam.target) ? cam.target : j;
    if (!t) return null;
    const moving = Math.abs(+t.vx || 0) > 20 || !!t.goal;
    const laGoal = (t.face || 1) * cam.lookAhead * (moving ? 1 : 0.45);
    camS.la = dt > 0 ? expTo(camS.la, laGoal, dt, moving ? 2.4 : 1.2) : laGoal;
    let x = t.x + camS.la;
    if (t.onGround || t.ladder || camS.gy == null) camS.gy = t.y;
    else if (t.y > camS.gy) camS.gy = t.y;
    else if (t.y < camS.gy - 110) camS.gy = t.y + 110;
    const y = framingY(t);
    // A conversation frames Jin and the speaker together.
    const D = S.director, dl = D && D.dialog;
    if (dl && dl.speaker && t === j) {
      const o = W.actor(dl.speaker);
      if (o && o !== j && shown(o) && Math.abs(o.x - j.x) < 220) x = (o.x + j.x) / 2;
    }
    // Fights frame every nearby fighter (Jin always well inside) and stay inside the arena.
    const fs = fightState();
    if (fs && t === j) {
      let lo = j.x, hi = j.x;
      for (const e of enemiesLive()) if (e && Math.abs(e.x - j.x) < 380) { lo = Math.min(lo, e.x); hi = Math.max(hi, e.x); }
      const half = VW / (2 * cam.zoom) - 90;
      if (hi > lo) x = clamp((lo + hi) / 2, j.x - half, j.x + half);
      const ar = fightArena(fs);
      if (ar) {
        const hw = VW / (2 * cam.zoom), a0 = Math.min(ar.x0, ar.x1) - 48, a1 = Math.max(ar.x0, ar.x1) + 48;
        x = a1 - a0 <= 2 * hw ? (a0 + a1) / 2 : clamp(x, a0 + hw, a1 - hw);
      }
    }
    return [x, y];
  }
  function stepTween(dt) {
    const tw = camS.tween;
    tw.t += dt;
    const k = tw.dur > 0 ? clamp(tw.t / tw.dur, 0, 1) : 1;
    const e = tw.ease(k), t = tw.target;
    const tx = tw.x != null ? +tw.x : t ? t.x : tw.fx;
    const ty = tw.y != null ? +tw.y : t ? t.y - t.h * 0.5 : tw.fy;
    camS.cx = lerp(tw.fx, tx, e); camS.cy = lerp(tw.fy, ty, e); cam.zoom = lerp(tw.fz, tw.z, e);
    if (k >= 1) { const w = tw.w; camS.tween = null; if (w) w.finish(true); }
  }
  function snapCamera() {
    const j = W.jin;
    if (!W.loc) return;
    if (cam.mode === 'scripted' && cam.target) { camS.cx = cam.target.x; camS.cy = cam.target.y - cam.target.h * 0.5; }
    else if (j) { camS.gy = null; const d = followTarget(0); if (d) { camS.cx = d[0]; camS.cy = d[1]; } }
    const c = clampCentre(camS.cx, camS.cy, cam.zoom);
    camS.cx = c[0]; camS.cy = c[1];
    syncCam();
  }
  function updateCamera(dt) {
    if (!W.loc) return;
    // Someone wrote S.cam.x/y directly: adopt it instead of fighting it.
    if (cam.x !== camSync.x) camS.cx = cam.x + VW / 2;
    if (cam.y !== camSync.y) camS.cy = cam.y + VH / 2;
    if (cam.mode === 'scripted') {
      if (camS.tween) stepTween(dt);
      else if (cam.target && W.actors.indexOf(cam.target) >= 0) {
        camS.cx = expTo(camS.cx, cam.target.x, dt, 5); camS.cy = expTo(camS.cy, cam.target.y - cam.target.h * 0.5, dt, 4);
      }
      // Safety net: a scene that ended (or handed control back) without A.follow() gets the follow camera back.
      if (!directorBusy() || (playerHasControl() && !fightState() ? false : fightState())) {
        camS.idleScripted += dt;
        if (camS.idleScripted > 0.6) cam.follow();
      } else camS.idleScripted = 0;
    }
    if (cam.mode !== 'scripted') {
      cam.mode = 'follow';
      cam.zoom = expTo(cam.zoom, camS.zoomTarget, dt, 3);
      if (Math.abs(cam.zoom - camS.zoomTarget) < 0.002) cam.zoom = camS.zoomTarget;
      const d = followTarget(dt);
      if (d) { camS.cx = expTo(camS.cx, d[0], dt, 5.5); camS.cy = expTo(camS.cy, d[1], dt, 4); }
    }
    const c = clampCentre(camS.cx, camS.cy, cam.zoom);
    camS.cx = c[0]; camS.cy = c[1];
    syncCam();
    if (camS.shakeT > 0) { camS.shakeT = Math.max(0, camS.shakeT - dt); cam.shake = camS.shakeAmp * (camS.shakeT / camS.shakeDur); }
    else cam.shake = 0;
  }
  // Shake offset for this frame (cosmetic, from real time so it never touches the sim).
  function shakeOffset() {
    if (!(cam.shake > 0.05)) return [0, 0];
    const t = (S.realTime || S.time) * 60;
    return [Math.round((hash(Math.floor(t) * 1.37) * 2 - 1) * cam.shake), Math.round((hash(Math.floor(t) * 2.71 + 9) * 2 - 1) * cam.shake * 0.7)];
  }

  /* ── 13. Effects and particles (the hook other modules draw through) ─ */
  // W.fx(kind, x, y, opts): timed world-space effect drawn after actors.
  // kinds: 'spark' {color}, 'dust', 'smear' {face, smear:'jab'|'cross'|'hook'|'upper'|'straight'},
  // 'afterimage' {face, pose, t, look, alpha}, 'ring' {color, r}, or any kind with opts.draw(ctx, k, e).
  const FX_DUR = { spark: 0.16, dust: 0.35, smear: 0.09, afterimage: 0.18, ring: 0.3 };
  W.fx = function (kind, x, y, o) {
    if (S.headless) return null;
    o = o || {};
    const e = Object.assign({ kind, x: +x || 0, y: +y || 0, t: 0, face: 1 }, o);
    e.dur = Math.max(0.01, +o.dur || FX_DUR[kind] || 0.3);
    W.effects.push(e);
    if (W.effects.length > 200) W.effects.shift();
    return e;
  };
  // W.particle({x, y, vx, vy, g, life, size, color, drag}) — tiny squares that bounce on the floor.
  W.particle = function (p) {
    if (S.headless || !W.loc) return null;
    const q = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 420, life: 0.6, t: 0, size: 1, color: '#c9c1b0', drag: 0, alpha: 1 }, p);
    q.gy = groundAtL(W.loc, q.x, q.y - 4);
    W.particles.push(q);
    if (W.particles.length > 500) W.particles.shift();
    return q;
  };
  W.burst = function (x, y, n, o) {
    o = o || {};
    for (let i = 0; i < (n | 0); i++) {
      W.particle({ x, y, vx: (crand() * 2 - 1) * (o.spread || 60), vy: -crand() * (o.up || 80), color: o.color,
        life: (o.life || 0.5) * (0.6 + crand() * 0.8), size: o.size || 1, g: o.g != null ? o.g : 420, drag: o.drag || 0 });
    }
  };
  function updateEffects(dt) {
    for (let i = W.effects.length - 1; i >= 0; i--) { const e = W.effects[i]; e.t += dt; if (e.t >= e.dur) W.effects.splice(i, 1); }
    for (let i = W.particles.length - 1; i >= 0; i--) {
      const p = W.particles[i];
      p.t += dt;
      if (p.t >= p.life) { W.particles.splice(i, 1); continue; }
      p.vy += p.g * dt;
      if (p.drag) { const k = Math.max(0, 1 - p.drag * dt); p.vx *= k; p.vy *= k; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > p.gy) { p.y = p.gy; p.vy *= -0.3; p.vx *= 0.6; }
    }
  }
  // Draw hooks for other modules: where = 'back' (after the back layer), 'effects' (after actors),
  // 'front' (after the front layer) — world transform; 'screen' (after lighting) — identity transform.
  // fn(ctx, cam). Returns a function that removes the hook.
  W.addDraw = function (where, fn) {
    const list = st.hooks[where];
    if (!list || typeof fn !== 'function') return () => {};
    list.push(fn);
    return () => { const i = list.indexOf(fn); if (i >= 0) list.splice(i, 1); };
  };

  /* ── 14. Update ───────────────────────────────────────────────────── */
  W.update = function (dt) {
    const L = W.loc;
    if (!L) return;
    dt = +dt || S.DT;
    st.step++;
    if (directorBusy()) st.lastBusy = S.time;
    if (st.dirty) W.rebake();

    // Hit-stop: actors freeze, camera and timers continue. Count it down unless another module already does.
    let frozen = false;
    if (S.hitstop > 0) {
      frozen = true;
      if (S.hitstop < st.hsSeen - 1e-9) st.extHitstop = true;
    }
    const adt = frozen ? 0 : dt * (S.timeScale != null ? clamp(+S.timeScale, 0, 4) : 1);

    updateTransition(dt);
    if (st.step % 6 === 1) updateLive();
    if (S.combat && typeof S.combat.update === 'function') { try { S.combat.update(dt); } catch (e) { report(e, 'combat.update'); } }

    if (!frozen && !S.paused) {
      const sceneBusy = directorBusy() && !playerHasControl();
      const list = W.actors.slice();
      for (const a of list) {
        if (W.actors.indexOf(a) < 0) continue;
        norm(a);
        try {
          if (a === W.jin) updateJin(a, adt);
          else if (a.kind === 'enemy' || a.ai) {
            if (a.goal) driveGoal(a, adt);
            else if (S.combat && typeof S.combat.updateActor === 'function') S.combat.updateActor(a, adt);
            else { if (!a.onGround) a.vy = (+a.vy || 0) + GRAV * adt; W.collide(a, adt); }
          } else updateNpc(a, adt, sceneBusy);
        } catch (e) { report(e, 'actor ' + a.id); }
        tickPose(a, adt);
      }
      updateEffects(adt);
    }
    if (!S.paused) {
      updateAutoDoors();
      updateInteraction();
      updateTriggers();
      updateBarks(dt, playerHasControl() && !directorBusy() && !fightState() && !st.trans.phase);
    }
    updateCamera(dt);
    if (!S.headless && S.weather && typeof S.weather.update === 'function') {
      try { S.weather.update(dt * (S.timeScale != null ? S.timeScale : 1), L); } catch (e) { report(e, 'weather.update'); }
    }
    syncAudioFx(dt);
    if (S.hitstop > 0 && !st.extHitstop) S.hitstop = Math.max(0, S.hitstop - dt);
    st.hsSeen = S.hitstop;
    const j = W.jin;
    if (j && S.G) { S.G.x = Math.round(j.x); S.G.y = Math.round(j.y); S.G.face = j.face; }
  };

  // muffle is audio; heartbeat also beats audibly when strong.
  function heartbeatPulse(t, hb) {
    const period = 60 / (62 + 48 * hb), ph = (t % period) / period * period;
    const g = (c, w) => Math.exp(-((ph - c) * (ph - c)) / (2 * w * w));
    return Math.max(g(0.06, 0.035), 0.6 * g(0.24, 0.04));
  }
  function syncAudioFx(dt) {
    const fx = S.fx;
    const m = clamp(+fx.muffle || 0, 0, 1);
    if (Math.abs(m - st.muffle) > 0.01 || (m === 0 && st.muffle !== 0)) { st.muffle = m; S.audio.muffle(m, 0.15); }
    const hb = clamp(+fx.heartbeat || 0, 0, 1);
    if (hb >= 0.25) {
      const period = 60 / (62 + 48 * hb);
      st.beatPhase += dt;
      if (st.beatPhase >= period) { st.beatPhase -= period; S.audio.play('heartbeat', { vol: 0.35 + 0.5 * hb }); }
    } else st.beatPhase = 0;
  }
