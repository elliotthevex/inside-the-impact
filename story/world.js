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
    css: null, cssAt: -1e9, cssFrame: -1, loops: null, muffle: 0, hbT: 0, beatAt: -1e9,
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
    // The director's lookup knows the chapter order and 'c3:id' pins; the world registry is the fallback.
    if (story && typeof story.lookup === 'function') {
      try { const d = story.lookup('locations', id); if (d) return d; } catch (e) { report(e, 'story.lookup'); }
      if (W.locations[id]) return W.locations[id];
    }
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
    if (typeof def === 'function') def = callFn(def, 'location builder ' + id, S.G, S);
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
    if (!(a.dropT > 0) && !a.dropThrough) for (const p of L._plats) {
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
    a.onOneway = !!(a.onGround && a._oneway);   // combat reads this for down+jump
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
  const isEnemy = (a) => !!(a && (a.kind === 'enemy' || a.enemy || a.ai));

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
        b.removed = true;
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

  // Pose time and crossfade bookkeeping. A pose change (by anyone) starts a crossfade from the old pose.
  // poseT advances here unless another module (combat) wrote it during this step.
  function tickPose(a, dt) {
    const touched = a._myT !== undefined && a.poseT !== a._myT;
    if (a.pose !== a._pp) {
      if (a._pp) a._blend = { pose: a._pp, t: a._ppT || 0, k: 1, dur: blendDur(a._pp, a.pose) };
      a._pp = a.pose;
      if (!touched) a.poseT = 0;
    } else if (!touched && !a.animFreeze) a.poseT = (+a.poseT || 0) + dt;
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
    if (a === W.jin || isEnemy(a) || g.collide) {
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
      if (a === j || isEnemy(a) || !shown(a) || !a.barks || a._talking || a.goal) continue;
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
    return W.actors.filter((a) => isEnemy(a) && shown(a) && !a.down && !a.ko);
  }
  function activityState() {
    const A = S.activities, c = A && A.current;
    return c && !c.done ? c : null;
  }
  // Does the player steer Jin right now? director.busy is false whenever no scene holds control: no scene,
  // A.control(true), or a scene waiting in A.fight / A.bout / A.activity / A.reach / A.waitFor.
  // W.control forces either way (dev tools, tests).
  function playerHasControl() {
    if (W.control === true) return true;
    if (W.control === false || S.paused) return false;
    return !directorBusy();
  }
  const sceneRunning = () => { const D = S.director; return !!(D && (D.running !== undefined ? D.running : D.busy)); };
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
  const MOVE_KEYS = ['left', 'right', 'up', 'down', 'jump', 'punch', 'dash', 'slip', 'flurry'];
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
    // A pose a scene put on Jin holds until the scene ends or hands control back. A pose set with
    // hold:true (j.poseHold) outlives the scene until the player moves.
    if (j.scriptPose) {
      if (j.poseHold && control) {
        if (MOVE_KEYS.some((k) => S.input.down(k))) { j.poseHold = false; j.scriptPose = null; }
      } else if (control || !directorBusy()) j.scriptPose = null;
      if (j.scriptPose) {
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
  // Examined at least once (the glint stops). Kept in G.flags like used:/trig:/entered: keys.
  const seenKey = (o) => 'seen:' + (S.G ? S.G.chapter : 0) + ':' + W.locId + ':' + o.id;
  function isSeen(o) { return !!(o._seen || (S.G && S.G.flags && S.G.flags[seenKey(o)])); }
  function markSeen(o) { o._seen = true; if (S.G && S.G.flags) S.G.flags[seenKey(o)] = true; }
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
        // Enemies can be talked to only once they are down (questioning) or not hostile.
        if (isEnemy(a) && (!a.talk || !(a.down || a.ko || (a.enemy && (a.enemy.ko || a.enemy.fled)) || a.hostile === false))) continue;
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
    markSeen(o);
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
      // A short rattle (not for open street edges), then the reason.
      if (d.kind !== 'edge' && S.time - (d._rattleAt || -9) > 0.45) { d._rattleAt = S.time; S.audio.play(d.sound === null ? 'uiBack' : 'door', { rattle: true, locked: true, vol: 0.5 }); }
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
    // The director's checkpoint also records G.checkpoint (where "Continue" resumes).
    if (!opts.silent && opts.save !== false && !directorBusy() && !fightState() && S.time - st.lastAutosave >= 20 && typeof S.save === 'function') {
      st.lastAutosave = S.time;
      try {
        if (S.director && typeof S.director.checkpoint === 'function') S.director.checkpoint(null, { quiet: true });
        else S.save('auto');
      } catch (e) { report(e, 'autosave'); }
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
      // Safety net: a scripted camera left behind when every scene has ended goes back to following.
      if (!sceneRunning() && !camS.tween) {
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
  // W.fx(kind, x, y, opts): timed world-space effect drawn after actors. `age` is the elapsed time.
  // kinds: 'spark' {color}, 'dust', 'smear' {face, smear:'jab'|'cross'|'hook'|'upper'|'straight'},
  // 'afterimage' {face, pose, t (pose time), look, alpha}, 'ring' {color, r}, 'text' {text, color},
  // or any kind with opts.draw(ctx, k, e). opts.dur overrides the default length.
  const FX_DUR = { spark: 0.16, dust: 0.35, smear: 0.09, afterimage: 0.18, ring: 0.3, text: 0.9 };
  W.fx = function (kind, x, y, o) {
    if (S.headless) return null;
    o = o || {};
    const e = Object.assign({ kind, face: 1 }, o, { x: +x || 0, y: +y || 0, age: 0 });
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
    for (let i = W.effects.length - 1; i >= 0; i--) { const e = W.effects[i]; e.age += dt; if (e.age >= e.dur) W.effects.splice(i, 1); }
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
          else if (isEnemy(a)) {
            if (a.goal) driveGoal(a, adt);
            else if (a.enemy && S.combat && typeof S.combat.updateActor === 'function') S.combat.updateActor(a, adt);
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

  // muffle is audio: re-sync it whenever S.fx.muffle moves (director tweens it; combat's bout debuffs call
  // S.audio.muffle directly and are left alone while S.fx.muffle stays put). The heartbeat SOUND is the
  // director's; world mirrors its beat timing (interval 1.15 - 0.45 * amount) for the visual pulse.
  function syncAudioFx(dt) {
    const fx = S.fx;
    const m = clamp(+fx.muffle || 0, 0, 1);
    if (Math.abs(m - st.muffle) > 0.01 || (m === 0 && st.muffle !== 0)) { st.muffle = m; S.audio.muffle(m, 0.15); }
    const hb = clamp(+fx.heartbeat || 0, 0, 1);
    if (hb > 0.15) {
      st.hbT -= dt;
      if (st.hbT <= 0) { st.hbT = 1.15 - 0.45 * hb; st.beatAt = S.time; }
    } else st.hbT = 0;
  }

  /* ── 15. Baking: canvases, room shells, street ground, layers ─────── */
  // Static pieces of each layer are drawn once per location entry (and again when when()-gated pieces
  // change) into chunked offscreen canvases. Chunks cover layer x in [x, x + CHUNK) and y in [-PADY, h + PADY).
  function makeCanvas(w, h) {
    if (S.headless || typeof document === 'undefined' || !document.createElement) return null;
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  }
  function ctxOf(c) {
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return x;
  }
  function releaseBakes() {
    const b = st.bakes;
    st.bakes = null;
    if (!b) return;
    // Zero-size canvases hand their memory back promptly (Safari keeps big ones around otherwise).
    for (const n in b) if (b[n]) for (const ch of b[n].chunks) { ch.c.width = 0; ch.c.height = 0; }
  }

  // Local pixel kit for world surfaces (pieces.js has the same helpers; these keep world self-contained).
  function line(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    c.fillStyle = col;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let n = 0; n < 2000; n++) {
      c.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  function speckle(c, x, y, w, h, col, n, seed, a) {
    c.fillStyle = a != null ? rgba(col, a) : col;
    for (let i = 0; i < n; i++) {
      const px = x + Math.floor(hash(seed + i * 1.37) * w), py = y + Math.floor(hash(seed + i * 2.71 + 0.5) * h);
      c.fillRect(px, py, hash(seed + i * 3.1) < 0.35 ? 2 : 1, 1);
    }
  }
  // A crack: a short wandering line.
  function crack(c, x, y, len, col, seed) {
    let px = x, py = y;
    c.fillStyle = col;
    for (let i = 0; i < len; i++) {
      c.fillRect(Math.round(px), Math.round(py), 1, 1);
      px += hash(seed + i * 0.91) < 0.5 ? 1 : 0;
      py += hash(seed + i * 1.73) < 0.45 ? 1 : hash(seed + i * 2.3) < 0.2 ? -1 : 0;
    }
  }
  const INK = '#0c0a11';

  // A floor plane seen side-on: rows that grow toward the camera and darken, joints every `period` px
  // (wider rows = wider spacing). opts: { period, jointCol, lit, rows }.
  function planeRows(c, x0, x1, y, yEnd, F, seed, o) {
    o = o || {};
    let yy = y, h = o.first || 3, i = 0;
    const span = Math.max(1, yEnd - y);
    while (yy < yEnd && i < 40) {
      const hh = Math.min(Math.round(h), yEnd - yy);
      const t = clamp((yy - y) / span, 0, 1);
      R(c, x0, yy, x1 - x0, hh, mixc(i === 0 ? F[3] : F[2], F[0], t * 0.85));
      if (o.seam !== false && i > 0) RA(c, x0, yy, x1 - x0, 1, F[0], 0.55 * (1 - t * 0.5));
      if (o.period) {
        const per = Math.round(o.period * (1 + i * 0.35)), off = Math.floor(hash(seed + i * 4.7) * per);
        for (let x = x0 - ((x0 - off) % per + per) % per; x < x1; x += per) {
          if (o.skip && hash(seed + x * 0.13 + i) < o.skip) continue;
          RA(c, x, yy + 1, 1, Math.max(1, hh - 1), o.jointCol || F[0], 0.7 * (1 - t * 0.4));
        }
      }
      yy += hh; h *= o.grow || 1.32; i++;
    }
    if (o.lit !== false) RA(c, x0, y, x1 - x0, 1, F[4], 0.85);   // lit front edge of the walkable surface
  }

  // ── Room shell: ceiling, wall (pattern), wainscot, baseboard, floor ──
  const FLOOR_OF = { tile: 'tile', marble: 'marble', carpet: 'carpet', concrete: 'concrete', wood: 'wood', paneling: 'wood', brick: 'concrete', plaster: 'wood', wallpaper: 'carpet' };
  const WALL_DEF = { brick: '#4c362e', concrete: '#404346', tile: '#727f80', marble: '#8a8680', paneling: '#463220', wallpaper: '#5a5048', wood: '#463220', plaster: '#4d4b4a', carpet: '#4d4b4a' };
  const FLOOR_DEF = { tile: '#5d6a6c', marble: '#77726b', carpet: '#3a3348', concrete: '#404346', wood: '#463220' };
  function roomSpec(L) {
    const r = L.room || {};
    const pattern = r.pattern || 'plaster';
    const wallPat = r.wallPattern || (pattern === 'carpet' ? 'plaster' : pattern);
    const floorPat = r.floorPattern || FLOOR_OF[pattern] || 'wood';
    const wall = r.wall || WALL_DEF[wallPat] || WALL_DEF.plaster;
    const ceil = r.ceiling === false || r.ceiling === null ? null : r.ceiling != null ? +r.ceiling : L.ground - 210;
    return { wallPat, floorPat, wall: ramp(wall), wall2: r.wall2 ? ramp(r.wall2) : null, floor: ramp(r.floor || FLOOR_DEF[floorPat] || FLOOR_DEF.wood),
      trim: ramp(r.trim || mixc(wall, '#1d1c22', 0.45)), ceil, wainscot: r.wainscot != null ? +r.wainscot : 44, seed: hash(String(L.id).length * 7.1 + L.w * 0.013) * 997 };
  }
  function drawWallPattern(c, x0, x1, y0, y1, pat, Wr, seed) {
    const w = x1 - x0, h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    R(c, x0, y0, w, h, Wr[2]);
    if (pat === 'brick') {
      // Broad wall colour with a few ragged patches of visible brickwork (art direction §7).
      const n = Math.max(2, Math.round(w / 140));
      for (let k = 0; k < n; k++) {
        const pw = 30 + Math.floor(hash(seed + k * 7.7) * 60), ph = 14 + Math.floor(hash(seed + k * 8.8) * 30);
        const px = x0 + Math.floor(hash(seed + k * 9.9) * Math.max(1, w - pw)), py = y0 + 8 + Math.floor(hash(seed + k * 3.3) * Math.max(1, h - ph - 16));
        for (let row = 0; row * 5 < ph; row++) {
          const by = py + row * 5, off = row % 2 ? 5 : 0;
          for (let bx = px - off; bx < px + pw; bx += 10) {
            const edge = Math.min(bx - px, px + pw - bx, by - py, py + ph - by);
            if (edge < 6 && hash(seed + bx * 0.17 + by * 0.31) < 0.55) continue;
            R(c, bx, by, 9, 4, hash(bx * 0.7 + by) < 0.3 ? Wr[3] : Wr[2]);
            R(c, bx, by + 4, 10, 1, Wr[1]); R(c, bx + 9, by, 1, 4, Wr[1]);
          }
        }
      }
    } else if (pat === 'paneling' || pat === 'wood') {
      if (pat === 'paneling') for (let x = x0 + 2; x < x1; x += 18) { R(c, x, y0, 1, h, Wr[0]); RA(c, x + 1, y0, 1, h, Wr[4], 0.35); }
      else for (let y = y0 + 3; y < y1; y += 6) { RA(c, x0, y, w, 1, Wr[0], 0.6); }
      speckle(c, x0, y0, w, h, Wr[1], Math.round(w * h / 90), seed, 0.6);
    } else if (pat === 'wallpaper') {
      for (let x = x0; x < x1; x += 8) RA(c, x, y0, 3, h, Wr[3], 0.22);
      for (let y = y0 + 6; y < y1; y += 14) for (let x = x0 + ((y / 14) % 2 ? 4 : 0); x < x1; x += 16) RA(c, x, y, 2, 2, Wr[4], 0.3);
      // Faded rectangles where frames used to hang.
      const n = Math.round(w / 220);
      for (let k = 0; k < n; k++) RA(c, x0 + hash(seed + k) * (w - 30), y0 + 30 + hash(seed + k * 2) * 40, 18 + hash(k) * 14, 14 + hash(k * 3) * 10, Wr[4], 0.12);
    } else if (pat === 'tile') {
      const ty = Math.max(y0, y1 - 70);
      R(c, x0, ty, w, y1 - ty, Wr[3]);
      for (let y = ty; y < y1; y += 8) R(c, x0, y, w, 1, Wr[1]);
      for (let x = x0; x < x1; x += 8) R(c, x, ty, 1, y1 - ty, Wr[1]);
      RA(c, x0, ty - 2, w, 2, Wr[0], 0.8);
      speckle(c, x0, ty, w, y1 - ty, Wr[0], Math.round(w / 6), seed + 3, 0.5);
    } else if (pat === 'concrete') {
      for (let y = y0 + 4; y < y1; y += 8) RA(c, x0, y, w, 1, Wr[1], 0.55);
      for (let y = y0 + 4, r = 0; y < y1; y += 8, r++) for (let x = x0 + (r % 2 ? 8 : 0); x < x1; x += 16) RA(c, x, y, 1, 8, Wr[1], 0.45);
      speckle(c, x0, y0, w, h, Wr[0], Math.round(w * h / 60), seed, 0.5);
    } else if (pat === 'marble') {
      for (let x = x0 + 24; x < x1; x += 48) RA(c, x, y0, 1, h, Wr[0], 0.5);
      for (let k = 0; k < w / 30; k++) { const vx = x0 + hash(seed + k) * w, vy = y0 + hash(seed + k * 2) * h; line(c, vx, vy, vx + 10 + hash(k) * 20, vy + 8 + hash(k * 5) * 14, rgba(Wr[4], 0.3)); }
    } else {
      // plaster: stains, a few cracks, water streaks from above.
      speckle(c, x0, y0, w, h, Wr[1], Math.round(w * h / 140), seed, 0.5);
      for (let k = 0; k < w / 160; k++) crack(c, x0 + hash(seed + k * 5) * w, y0 + 10 + hash(seed + k * 6) * (h * 0.6), 6 + Math.floor(hash(k) * 10), Wr[1], seed + k);
      for (let k = 0; k < w / 90; k++) RA(c, x0 + hash(seed + k * 11) * w, y0, 1, 8 + hash(k * 7) * 30, Wr[0], 0.25);
    }
  }
  function drawRoomShell(c, L, xa, xb) {
    const r = roomSpec(L), gy = L.ground, w = xb - xa, top = -PADY;
    const wallTop = r.ceil != null ? r.ceil : top;
    // Ceiling: a dark slab with a lit crown edge.
    if (r.ceil != null) {
      // Ceiling: darker toward the top, faint board seams, so it reads as a surface rather than a void.
      const cd = mixc(r.wall[0], '#17141d', 0.5), ch = r.ceil - top;
      for (let i = 0; i < 4; i++) R(c, xa, top + (ch * i) / 4, w, ch / 4 + 1, mixc(cd, r.wall[1], i * 0.12));
      for (let x = xa - (((xa % 48) + 48) % 48); x < xb; x += 48) RA(c, x, top, 1, ch - 6, INK, 0.35);
      for (let i = 0; i < 4; i++) RA(c, xa, r.ceil - 6 + i, w, 1, r.wall[1], 0.25 + i * 0.15);
      if (r.floorPat === 'tile' || r.wallPat === 'tile') for (let x = xa - (xa % 32); x < xb; x += 32) RA(c, x, r.ceil - 6, 1, 6, r.trim[0], 0.7);
    }
    drawWallPattern(c, xa, xb, wallTop, gy, r.wallPat, r.wall, r.seed);
    // Shadow under the ceiling (soft bands) and toward the floor.
    for (let i = 0; i < 6; i++) RA(c, xa, wallTop + i * 3, w, 3, r.wall[0], 0.32 * (1 - i / 6));
    if (r.ceil != null) R(c, xa, r.ceil, w, 2, r.trim[2]);
    if (r.wall2 && r.wainscot > 0) {
      const wy = gy - r.wainscot;
      R(c, xa, wy, w, r.wainscot, r.wall2[2]);
      speckle(c, xa, wy, w, r.wainscot, r.wall2[1], Math.round(w / 3), r.seed + 9, 0.6);
      R(c, xa, wy - 2, w, 2, r.trim[3]); RA(c, xa, wy, w, 1, r.trim[0], 0.7);
    }
    R(c, xa, gy - 4, w, 4, r.trim[2]); R(c, xa, gy - 4, w, 1, r.trim[4]);   // baseboard
    drawFloorBand(c, xa, xb, gy, L.h + PADY, r.floorPat, r.floor, r.seed);
  }
  function drawFloorBand(c, xa, xb, y, yEnd, pat, F, seed) {
    if (pat === 'tile') planeRows(c, xa, xb, y, yEnd, F, seed, { period: 14, first: 3 });
    else if (pat === 'marble') {
      planeRows(c, xa, xb, y, yEnd, F, seed, { period: 40, first: 4 });
      for (let k = 0; k < (xb - xa) / 40; k++) RA(c, xa + hash(seed + k * 3) * (xb - xa), y + 3 + hash(k) * 10, 6 + hash(k * 2) * 12, 1, F[4], 0.25);
    } else if (pat === 'carpet') {
      planeRows(c, xa, xb, y, yEnd, F, seed, { seam: false, first: 4 });
      speckle(c, xa, y, xb - xa, yEnd - y, F[1], Math.round((xb - xa) * (yEnd - y) / 30), seed, 0.5);
      speckle(c, xa, y, xb - xa, 10, F[4], Math.round((xb - xa) / 8), seed + 2, 0.25);
    } else if (pat === 'concrete') {
      planeRows(c, xa, xb, y, yEnd, F, seed, { period: 96, seam: false, first: 5 });
      for (let k = 0; k < (xb - xa) / 120; k++) crack(c, xa + hash(seed + k * 9) * (xb - xa), y + 2 + hash(k * 4) * 8, 6 + Math.floor(hash(k) * 10), F[0], seed + k);
      speckle(c, xa, y, xb - xa, yEnd - y, F[1], Math.round((xb - xa) / 4), seed + 5, 0.5);
    } else {
      // wood: boards run along the room; board ends staggered per row.
      planeRows(c, xa, xb, y, yEnd, F, seed, { period: 34, first: 3, grow: 1.25 });
      speckle(c, xa, y, xb - xa, yEnd - y, F[1], Math.round((xb - xa) / 3), seed + 7, 0.45);
    }
    RA(c, xa, y, xb - xa, 2, INK, 0.25);   // contact shadow where wall meets floor
  }

  // ── Exterior ground: sidewalk, curb, road (default) and other styles ──
  function streetOpts(L) {
    const s = L.def.street || {};
    return { sidewalk: s.sidewalk != null ? +s.sidewalk : 16, curb: s.curb !== false, lines: s.lines !== false, manholes: s.manholes !== false };
  }
  function wet(L) { return L.weather === 'rain' || L.weather === 'drizzle' || !!(L.def.wet); }
  function drawStreet(c, L, xa, xb, gy, yEnd, seed) {
    const o = streetOpts(L), WK = pal('walk'), AS = pal('asphalt'), CO = pal('concrete'), w = xb - xa;
    const sw = yEnd - gy < 34 ? yEnd - gy : o.sidewalk;
    // Sidewalk slabs.
    planeRows(c, xa, xb, gy, gy + sw, WK, seed, { period: 30, first: 3, grow: 1.4 });
    for (let k = 0; k < w / 70; k++) crack(c, xa + hash(seed + k * 3.3) * w, gy + 1 + hash(seed + k * 1.9) * (sw - 4), 4 + Math.floor(hash(k * 2.2) * 7), WK[0], seed + k);
    speckle(c, xa, gy + 1, w, sw - 1, WK[1], Math.round(w / 5), seed + 1, 0.7);
    speckle(c, xa, gy + 2, w, sw - 3, '#1a1a20', Math.round(w / 40), seed + 2, 0.6);   // gum and stains
    let y = gy + sw;
    if (y >= yEnd) return;
    if (o.curb) {
      R(c, xa, y, w, 1, CO[4]); R(c, xa, y + 1, w, 3, CO[2]); RA(c, xa, y + 1, w, 1, CO[3], 0.6);
      for (let x = xa - (xa % 52); x < xb; x += 52) RA(c, x, y, 1, 4, CO[0], 0.5);
      R(c, xa, y + 4, w, 2, AS[0]);   // gutter
      y += 6;
    }
    if (y >= yEnd) return;
    // Road: worn asphalt, patches, a faded centre line, manholes.
    planeRows(c, xa, xb, y, yEnd, AS, seed + 4, { seam: false, first: 6, grow: 1.5, lit: false });
    speckle(c, xa, y, w, yEnd - y, AS[3], Math.round(w * (yEnd - y) / 26), seed + 5, 0.55);
    for (let k = 0; k < w / 260; k++) {
      const px = xa + hash(seed + k * 6.1) * w, pw = 24 + hash(seed + k * 6.2) * 50, py = y + 2 + hash(seed + k * 6.3) * Math.max(1, yEnd - y - 12);
      R(c, px, py, pw, 5 + hash(k) * 5, AS[1]); RA(c, px, py, pw, 1, AS[3], 0.5);
    }
    if (o.lines && yEnd - y > 22) {
      const ly = y + Math.round((Math.min(yEnd, y + 60) - y) * 0.45), FY = pal('fadedYellow') || '#a98c47';
      for (let x = xa - (xa % 44); x < xb; x += 44) for (let i = 0; i < 20; i++) if (hash(x * 0.31 + i * 0.7) > 0.22) RA(c, x + i, ly, 1, 1, FY, 0.55);
    }
    if (o.manholes && yEnd - y > 16) {
      for (let x = Math.ceil(xa / 640) * 640 + 210; x < xb; x += 640) {
        if (hash(x * 0.017) < 0.35) continue;
        const my = y + 5;
        R(c, x - 9, my, 18, 3, AS[0]); RA(c, x - 8, my, 16, 1, AS[4], 0.5); R(c, x - 6, my + 1, 12, 1, CO[1]);
      }
    }
    if (wet(L)) {
      // Wet asphalt: sparse, broken horizontal sheen (weather adds live reflections).
      for (let k = 0; k < w / 9; k++) {
        const px = xa + hash(seed + k * 1.11) * w, py = gy + 2 + hash(seed + k * 1.27) * (yEnd - gy - 3), len = 2 + Math.floor(hash(k * 1.9) * 7);
        RA(c, px, py, len, 1, '#7d90a8', 0.18);
      }
    }
  }
  function drawGroundStyle(c, L, style, xa, xb, gy, yEnd, seed) {
    const w = xb - xa;
    if (style === 'none') return;
    if (style === 'street' || style === 'sidewalk') {
      if (style === 'sidewalk') { const WK = pal('walk'); planeRows(c, xa, xb, gy, yEnd, WK, seed, { period: 30, first: 3, grow: 1.35 }); speckle(c, xa, gy, w, yEnd - gy, WK[1], Math.round(w / 4), seed, 0.6); }
      else drawStreet(c, L, xa, xb, gy, yEnd, seed);
      return;
    }
    if (style === 'room') { const r = roomSpec(L); drawFloorBand(c, xa, xb, gy, yEnd, r.floorPat, r.floor, r.seed); return; }
    const M = { alley: pal('asphalt'), concrete: pal('concrete'), dirt: pal('dirt'), yard: pal('dirt'), rooftop: pal('roof'), gravel: pal('concrete') }[style] || pal('walk');
    planeRows(c, xa, xb, gy, yEnd, M, seed, { period: style === 'concrete' ? 64 : 0, seam: style === 'concrete', first: 3, grow: 1.4 });
    speckle(c, xa, gy, w, yEnd - gy, M[3], Math.round(w * (yEnd - gy) / (style === 'gravel' || style === 'rooftop' ? 8 : 30)), seed, 0.5);
    for (let k = 0; k < w / 90; k++) crack(c, xa + hash(seed + k * 2.9) * w, gy + 1 + hash(k * 3.7) * 10, 5 + Math.floor(hash(k) * 9), M[0], seed + k);
    if (style === 'alley') {
      R(c, xa, gy + 9, w, 2, M[0]);   // drain channel
      for (let k = 0; k < w / 120; k++) RA(c, xa + hash(seed + k * 8) * w, gy + 3 + hash(k * 9) * 6, 10 + hash(k) * 20, 2, '#0e131b', 0.5);
    } else if (style === 'yard') {
      const G = pal('green') || ['#1b241f', '#26332b', '#324238', '#405346', '#526656'];
      R(c, xa, gy, w, 2, G[2]);
      for (let x = xa; x < xb; x += 2) if (hash(seed + x * 0.37) < 0.55) R(c, x, gy - 1 - Math.floor(hash(x * 0.71) * 3), 1, 2 + Math.floor(hash(x) * 2), G[hash(x * 1.3) < 0.5 ? 2 : 3]);
    }
  }
  // Floors: the ground-level ones get the location's ground style down to the bottom; raised ones get a
  // surface strip and a face (exteriors) or a slab with an underside (interiors).
  function drawFloors(c, L, xa, xb) {
    const style = L.groundStyle, base = L.ground;
    const floors = L.floors.slice().sort((p, q) => q.y - p.y);
    for (const f of floors) {
      let x0 = Math.min(f.x0, f.x1), x1 = Math.max(f.x0, f.x1);
      if (x0 <= 0) x0 = xa; if (x1 >= L.w) x1 = xb;   // floors at the map ends run under the margins
      x0 = Math.max(x0, xa); x1 = Math.min(x1, xb);
      if (x1 <= x0) continue;
      const seed = (L.seed || 0) + f.y * 0.37 + Math.min(f.x0, f.x1) * 0.013;
      const fs = f.style || style;
      if (f.y >= base - 12) { drawGroundStyle(c, L, fs, x0, x1, f.y, L.h + PADY, seed); continue; }
      if (fs === 'none') continue;
      const M = L.kind === 'interior' ? roomSpec(L).floor : pal(fs === 'street' || fs === 'sidewalk' ? 'concrete' : fs === 'alley' ? 'asphalt' : 'concrete') || pal('concrete');
      if (L.kind === 'interior') {
        R(c, x0, f.y, x1 - x0, 3, M[3]); R(c, x0, f.y, x1 - x0, 1, M[4]);
        R(c, x0, f.y + 3, x1 - x0, 7, roomSpec(L).trim[1]); R(c, x0, f.y + 10, x1 - x0, 1, roomSpec(L).trim[0]);
        for (let i = 0; i < 4; i++) RA(c, x0, f.y + 11 + i, x1 - x0, 1, INK, 0.3 - i * 0.07);
      } else {
        R(c, x0, f.y, x1 - x0, 4, M[3]); R(c, x0, f.y, x1 - x0, 1, M[4]);
        R(c, x0, f.y + 4, x1 - x0, L.h + PADY - f.y - 4, M[1]);
        for (let y = f.y + 10; y < L.h + PADY; y += 9) RA(c, x0, y, x1 - x0, 1, M[0], 0.5);
        RA(c, x0, f.y + 4, 2, L.h + PADY - f.y, M[4], 0.3); RA(c, x1 - 2, f.y + 4, 2, L.h + PADY - f.y, M[0], 0.6);
      }
    }
  }
  // Solids are invisible collision unless they ask to be drawn ({style} or {draw:true}); ladders draw by
  // default (no piece type draws a plain ladder) unless kind:'stairs' or draw:false.
  function drawSolidsAndLadders(c, L) {
    for (const s of L.solids) {
      if (!(s.style || s.draw === true) || s.draw === false) continue;
      const M = pal(s.style) || ramp(typeof s.style === 'string' && s.style[0] === '#' ? s.style : '#404346');
      if (s.oneway) { R(c, s.x, s.y, s.w, 3, M[3]); R(c, s.x, s.y, s.w, 1, M[4]); R(c, s.x, s.y + 3, s.w, 2, M[1]); for (let i = 0; i < 3; i++) RA(c, s.x, s.y + 5 + i, s.w, 1, INK, 0.25 - i * 0.07); }
      else { R(c, s.x, s.y, s.w, s.h, M[2]); R(c, s.x, s.y, s.w, 1, M[4]); R(c, s.x, s.y + 1, 1, s.h - 1, M[3]); R(c, s.x + s.w - 1, s.y + 1, 1, s.h - 1, M[1]); R(c, s.x, s.y + s.h - 1, s.w, 1, M[0]); }
    }
    const IR = pal('iron');
    for (const l of L.ladders) {
      if (l.kind === 'stairs' || l.xTop != null || l.draw === false) continue;
      const x = Math.round(l.x), y0 = Math.round(l.y0) - 10, y1 = Math.round(l.y1);
      R(c, x - 6, y0, 1, y1 - y0, IR[3]); R(c, x + 5, y0, 1, y1 - y0, IR[2]);
      RA(c, x - 5, y0, 1, y1 - y0, IR[0], 0.6);
      for (let y = y0 + 3; y < y1; y += 6) { R(c, x - 5, y, 10, 1, IR[3]); RA(c, x - 5, y + 1, 10, 1, INK, 0.4); }
    }
  }

  // Span of a piece in its layer's x (for chunk culling); null = draw everywhere.
  function pieceSpan(p) {
    if (p.x0 != null || p.x1 != null) { const a = +p.x0 || 0, b = p.x1 != null ? +p.x1 : a; return [Math.min(a, b) - 64, Math.max(a, b) + 64]; }
    if (p.x == null) return null;
    const x = +p.x || 0;
    return [x - 200, x + (+p.w || 0) + 200];
  }
  function bakeLayer(L, name) {
    const p = PARALLAX[name], list = L.layers[name] || [];
    const isBack = name === 'back';
    const statics = [], anim = [];
    for (const pc of list) { if (!pc) continue; statics.push(pc); if (S.pieces && S.pieces.isAnimated && S.pieces.isAnimated(pc)) anim.push(pc); }
    const shell = isBack && (L.kind === 'interior' || L.def.room);
    const ground = isBack;
    if (!statics.length && !shell && !ground) return null;
    let x0 = -VW / 2, x1 = p === 1 ? L.w + VW / 2 : Math.max(L.w + VW / 2, (L.w - VW) * p + VW * 1.5);
    for (const pc of statics) { const sp = pieceSpan(pc); if (sp) { x0 = Math.min(x0, sp[0] + 150); x1 = Math.max(x1, sp[1] - 150); } }
    x0 = Math.floor(Math.max(x0, -VW * 2)); x1 = Math.ceil(Math.min(x1, x0 + 24000));
    const H = Math.ceil(L.h + PADY * 2);
    const out = { name, p, chunks: [], anim, x0, x1 };
    for (let cx = x0; cx < x1; cx += CHUNK) {
      const cw = Math.min(CHUNK, x1 - cx);
      const cv = makeCanvas(cw, H);
      if (!cv) return null;
      const c = ctxOf(cv);
      c.save();
      c.translate(-cx, PADY);
      try {
        if (shell) drawRoomShell(c, L, cx, cx + cw);
        if (ground) drawFloors(c, L, cx, cx + cw);
        if (isBack) drawSolidsAndLadders(c, L);
      } catch (e) { report(e, 'bake shell'); }
      for (const pc of statics) {
        const sp = pieceSpan(pc);
        if (sp && (sp[1] < cx || sp[0] > cx + cw)) continue;
        try { S.pieces.draw(c, pc, L, true); } catch (e) { report(e, 'bake piece ' + pc.t); }
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }
      c.restore();
      out.chunks.push({ x: cx, w: cw, c: cv });
    }
    return out;
  }
  function bake() {
    const L = W.loc;
    releaseBakes();
    st.rebake = false;
    if (!L || S.headless) return;
    L.seed = L.seed != null ? L.seed : hash(L.w * 0.0137 + String(L.id).length * 3.1) * 1000;
    const b = {};
    for (const n of LAYERS) {
      // Without pieces.js only the back layer bakes (room shell and ground).
      const can = !!(S.pieces && S.pieces.draw) || n === 'back';
      try { b[n] = can ? bakeLayerSafe(L, n) : null; } catch (e) { report(e, 'bake ' + n); b[n] = null; }
    }
    st.bakes = b;
    st.lights = collectLights(L);
  }
  function bakeLayerSafe(L, n) {
    if (S.pieces && S.pieces.draw) return bakeLayer(L, n);
    // Without pieces.js only the back layer's shell and ground bake.
    const saved = L.layers[n]; L.layers[n] = [];
    try { return bakeLayer(L, n); } finally { L.layers[n] = saved; }
  }
  // Lights from every piece (in its layer's coordinates, converted per frame) plus LocationDef.lights.
  function collectLights(L) {
    const out = [];
    if (S.pieces && typeof S.pieces.lights === 'function') {
      for (const n of LAYERS) for (const pc of L.layers[n] || []) {
        let ls = null;
        try { ls = S.pieces.lights(pc, L); } catch (e) { report(e, 'piece lights ' + (pc && pc.t)); }
        if (Array.isArray(ls)) for (const l of ls) if (l) out.push({ src: l, p: PARALLAX[n] });
      }
    }
    for (const l of L.lights) if (l && test(l.when, 'light when')) out.push({ src: l, p: (l.layer && PARALLAX[l.layer]) || 1 });
    return out;
  }

  /* ── 16. Render: layers, actors, effects ──────────────────────────── */
  // Render camera: view centre (with shake) and zoom. Parallax layer p sees layer point X at
  // screen VW/2 + z (X - lcx), lcx = camLeft * p + VW/2 (p = 1 is the world). Vertically the same around a
  // reference view (the one framing the main ground), so far layers never drift off the horizon on tall maps.
  const rc = { x: 0, y: 0, zoom: 1, cx: VW / 2, cy: VH / 2, refTop: 0, w: VW, h: VH };
  function setupRenderCam(L) {
    const sh = shakeOffset();
    st.shx = sh[0]; st.shy = sh[1];
    rc.zoom = cam.zoom || 1;
    rc.cx = camS.cx - sh[0] / rc.zoom; rc.cy = camS.cy - sh[1] / rc.zoom;
    rc.x = rc.cx - VW / 2; rc.y = rc.cy - VH / 2;
    const ref = clampCentre(rc.cx, L.ground - VH * 0.12 + (+L.camera.yOffset || 0), 1);
    rc.refTop = ref[1] - VH / 2;
  }
  function layerCentre(p) {
    if (p === 1) return [rc.cx, rc.cy];
    return [(rc.cx - VW / 2) * p + VW / 2, (rc.cy - VH / 2 - rc.refTop) * p + rc.refTop + VH / 2];
  }
  function applyLayer(c, p) {
    const lc = layerCentre(p), z = rc.zoom;
    c.setTransform(z, 0, 0, z, Math.round(VW / 2 - lc[0] * z), Math.round(VH / 2 - lc[1] * z));
    return lc;
  }
  // Visible layer-space rect for culling.
  function viewOf(p) {
    const lc = layerCentre(p), hw = VW / (2 * rc.zoom), hh = VH / (2 * rc.zoom);
    return { x0: lc[0] - hw, x1: lc[0] + hw, y0: lc[1] - hh, y1: lc[1] + hh };
  }
  function drawBaked(c, name) {
    const b = st.bakes && st.bakes[name], L = W.loc;
    if (!b) return;
    const p = b.p;
    applyLayer(c, p);
    const v = viewOf(p);
    for (const ch of b.chunks) {
      if (ch.x + ch.w < v.x0 - 2 || ch.x > v.x1 + 2) continue;
      c.drawImage(ch.c, ch.x, -PADY);
    }
    if (b.anim.length && S.pieces && S.pieces.drawAnimated) {
      for (const pc of b.anim) {
        const sp = pieceSpan(pc);
        if (sp && (sp[1] < v.x0 || sp[0] > v.x1)) continue;
        try { S.pieces.drawAnimated(c, pc, L, S.time); } catch (e) { report(e, 'animated piece ' + pc.t); }
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
  }

  // Actors: 'back' placements draw right after the back layer, 'main' next (y-sorted, Jin on top of
  // equals), 'front' after the front piece layer.
  const drawList = [];
  function drawActors(c, layer, v) {
    drawList.length = 0;
    for (const a of W.actors) {
      if (!shown(a) || (a.layer || 'main') !== layer) continue;
      if (a.x < v.x0 - 90 || a.x > v.x1 + 90 || a.y < v.y0 - 20 || a.y - (a.h || 46) > v.y1 + 20) continue;
      drawList.push(a);
    }
    drawList.sort((p, q) => (p.y - q.y) || ((p === W.jin ? 1 : 0) - (q === W.jin ? 1 : 0)) || (p.x - q.x));
    for (const a of drawList) {
      try { drawActor(c, a); } catch (e) { report(e, 'draw actor ' + a.id); }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
  }
  function drawActor(c, a) {
    if (typeof a.draw === 'function') { a.draw(c); return; }
    const look = lookDef(a.look) || a.look || 'man';
    const po = a.poseOpts || {};
    const grounded = a.onGround !== false || a.fixedY || a.ladder;
    const o = {
      alpha: a.alpha != null ? clamp(+a.alpha, 0, 1) : po.alpha != null ? po.alpha : 1,
      tint: a.tint || po.tint || null,
      squash: a.squash || po.squash || 0,
      lean: a.lean || po.lean || 0,
      carry: a.carry || po.carry || null,
      speed: a.speed || po.speed || 1,
      scaleX: a.scaleX || po.scaleX || 1,
      shadow: !!grounded && !a.ladder,
    };
    if (a.outlineCol) o.outlineCol = a.outlineCol;
    if (a._blend && a._blend.k > 0) o.blendFrom = { pose: a._blend.pose, t: a._blend.t, k: clamp(a._blend.k, 0, 1) };
    if (a.poseK != null) o.k = a.poseK;
    const x = Math.round(a.x), y = Math.round(a.y);
    if (!grounded) drawAirShadow(c, a);
    if (S.art && typeof S.art.drawFigure === 'function') S.art.drawFigure(c, x, y, a.face === -1 ? -1 : 1, a.pose || 'idle', +a.poseT || 0, look, o);
    else drawFigureFallback(c, a, x, y, typeof look === 'object' ? look : null, o);
  }
  function drawAirShadow(c, a) {
    const gy = groundAtL(W.loc, a.x, a.y);
    const d = gy - a.y;
    if (!(d > 1) || d > 220) return;
    const k = clamp(1 - d / 180, 0.25, 1), w = Math.max(4, Math.round(13 * k));
    RA(c, a.x - w / 2, gy - 1, w, 2, INK, 0.32 * k);
  }
  // Used only when art.js is absent (dev builds): a readable block figure in the look's colours.
  function drawFigureFallback(c, a, x, y, lk, o) {
    lk = lk || {};
    const h = Math.round(a.h || 46), f = a.face === -1 ? -1 : 1;
    const skin = lk.skin || '#c69a74', top = (lk.top && lk.top.color) || '#3d5168', bot = (lk.bottom && lk.bottom.color) || '#1d1c22';
    const hair = (lk.hair && lk.hair.color) || '#2b2217', shoes = lk.shoes || '#cfc8b6';
    c.globalAlpha = o.alpha;
    RA(c, x - 7, y - 1, 14, 2, INK, 0.3);
    const pose = a.pose || 'idle';
    if (pose === 'lieBed' || pose === 'down' || pose === 'knockdown') {
      R(c, x - h / 2, y - 7, h - 8, 6, top); R(c, x - h / 2 + h - 8, y - 8, 7, 7, skin); R(c, x - h / 2 + h - 8, y - 9, 7, 3, hair);
    } else {
      const s = /^(sit|sitCurb|sitFloor|wheelchair|kneel|crouch)$/.test(pose) ? 0.7 : 1, hh = Math.round(h * s);
      const leg = Math.round(hh * 0.45), body = Math.round(hh * 0.36), head = Math.max(6, Math.round(h * 0.16));
      R(c, x - 4, y - leg, 3, leg - 1, bot); R(c, x + 1, y - leg, 3, leg - 1, bot);
      R(c, x - 5, y - 1, 4, 1, shoes); R(c, x + 1, y - 1, 4, 1, shoes);
      R(c, x - 5, y - leg - body, 10, body, top);
      const reach = /jab|cross|counter|dashStraight|point|reach/.test(pose) ? 9 : 0;
      R(c, x + f * 4 - (f < 0 ? reach + 2 : 0), y - leg - body + 3, 2 + reach, 3, top);
      R(c, x - 3, y - leg - body - head, 7, head, skin);
      R(c, x - 4, y - leg - body - head - 1, 9, 3, hair); R(c, x + (f > 0 ? -4 : 3), y - leg - body - head, 2, 4, hair);
    }
    if (o.tint) { c.globalAlpha = 0.6; R(c, x - 5, y - h, 10, h, o.tint); }
    c.globalAlpha = 1;
  }

  function drawEffects(c, v) {
    const art = S.art || {};
    for (const e of W.effects) {
      if (e.x < v.x0 - 60 || e.x > v.x1 + 60) continue;
      const k = clamp(e.age / e.dur, 0, 1);
      try {
        if (typeof e.draw === 'function') e.draw(c, k, e);
        else if (e.kind === 'spark') {
          if (art.spark) art.spark(c, e.x, e.y, k, e.color);
          else { const r = 2 + k * 4; c.globalAlpha = 1 - k; R(c, e.x - r, e.y, 2 * r, 1, e.color || '#fff2d6'); R(c, e.x, e.y - r, 1, 2 * r, e.color || '#fff2d6'); }
        } else if (e.kind === 'dust') {
          if (art.dust) art.dust(c, e.x, e.y, k);
          else RA(c, e.x - 2 - k * 4, e.y - 2 - k * 3, 4 + k * 8, 2, '#9a9488', 0.5 * (1 - k));
        } else if (e.kind === 'smear') {
          if (art.drawSmear) art.drawSmear(c, e.x, e.y, e.face, e.smear || 'jab', k);
        } else if (e.kind === 'afterimage') {
          if (art.drawAfterimage) art.drawAfterimage(c, e.x, e.y, e.face, e.pose || 'dash', +e.t || 0, e.look || 'jin', (e.alpha != null ? +e.alpha : 0.45) * (1 - k));
        } else if (e.kind === 'ring') {
          const r = (e.r || 14) * (0.3 + 0.7 * U.ease.out(k)), col = rgba(e.color || '#e8c272', 0.8 * (1 - k));
          c.fillStyle = col;
          for (let i = 0; i < 24; i++) { const an = (i / 24) * Math.PI * 2; c.fillRect(Math.round(e.x + Math.cos(an) * r), Math.round(e.y + Math.sin(an) * r * 0.45), 1, 1); }
        } else if (e.kind === 'text' && e.text) {
          const f = S.font && S.font.draw ? S.font : S.pieces && S.pieces.font;
          if (f) { c.globalAlpha = 1 - k * k; f.draw(c, String(e.text), Math.round(e.x), Math.round(e.y - k * 10), { color: e.color || '#e8c272', align: 'center', shadow: true }); }
        }
      } catch (err) { report(err, 'fx ' + e.kind); }
      c.globalAlpha = 1;
    }
    for (const p of W.particles) {
      if (p.x < v.x0 - 8 || p.x > v.x1 + 8) continue;
      const k = p.t / p.life, a = (k > 0.7 ? (1 - k) / 0.3 : 1) * (p.alpha != null ? p.alpha : 1);
      RA(c, p.x, p.y, p.size || 1, p.size || 1, p.color || '#c9c1b0', a);
    }
  }

  // A small twinkle on objects not yet examined (ObjectDef.glint, default true; never on hidden ones).
  function drawGlints(c, v) {
    const L = W.loc;
    if (!playerHasControl()) return;
    for (const o of L.objects) {
      if (o.glint === false || o.hidden) continue;
      if (o.x < v.x0 - 20 || o.x > v.x1 + 20) continue;
      if (isSeen(o) || (o.once && isUsed(o))) continue;
      const ph = (S.time * 0.5 + hash(o.x * 0.37 + 11)) % 1;
      if (ph > 0.16) continue;
      if (!test(o.when, 'object when ' + o.id)) continue;
      const a = Math.sin((ph / 0.16) * Math.PI);
      const gx = Math.round(o.x + (hash(o.x * 1.7) - 0.5) * Math.min(+o.w || 20, 24) * 0.5), gy = Math.round(o._y - Math.min(+o.h || 30, 34) + 6);
      RA(c, gx, gy, 1, 1, '#fff4dc', a);
      if (a > 0.45) { RA(c, gx - 1, gy, 3, 1, '#f2d9a0', a * 0.7); RA(c, gx, gy - 1, 1, 3, '#f2d9a0', a * 0.7); }
      if (a > 0.8) { RA(c, gx - 2, gy, 1, 1, '#e8c272', 0.5); RA(c, gx + 2, gy, 1, 1, '#e8c272', 0.5); }
    }
  }
  // Street edges that lead somewhere: a faint chevron on the ground as Jin nears them.
  function drawEdgeHints(c) {
    const j = W.jin, L = W.loc;
    if (!j || !playerHasControl() || fightState()) return;
    for (const d of L.doors) {
      if (!d.auto || d.kind !== 'edge') continue;
      const dist = Math.abs(j.x - d.x);
      if (dist > 100 || !test(d.when, 'door when ' + d.id)) continue;
      const dir = d.x < L.w / 2 ? -1 : 1, a = clamp(1 - dist / 100, 0, 1) * 0.65;
      const col = lockReason(d) ? '#d8402f' : '#e8c272';
      const bob = Math.round(Math.sin(S.time * 4) * 1.5);
      const x = Math.round(d.x - dir * 14 + dir * bob), y = Math.round(d._y - 6);
      for (let i = 0; i < 3; i++) { RA(c, x - dir * i, y - i, 1, 1, col, a); RA(c, x - dir * i, y + i, 1, 1, col, a); }
    }
  }

  // Canvas fallback for barks, the focus prompt and markers when ui.js is not loaded (dev pages).
  function drawLabelsFallback(c) {
    const f = S.font && S.font.draw ? S.font : S.pieces && S.pieces.font;
    if (!f) return;
    const toS = (x, y) => [Math.round(VW / 2 + rc.zoom * (x - rc.cx)), Math.round(VH / 2 + rc.zoom * (y - rc.cy))];
    const box = (text, sx, sy, col) => {
      const w = (f.width ? f.width(text, 1) : text.length * 4) + 6;
      RA(c, sx - w / 2, sy - 9, w, 9, '#0c0a11', 0.78);
      f.draw(c, text, sx, sy - 7, { color: col, align: 'center' });
    };
    for (const a of W.actors) {
      if (a === W.jin || !a.marker || !shown(a)) continue;
      const p = toS(a.x, a.y - a.h - 4);
      box(a.marker === '…' ? '...' : a.marker, p[0], p[1], '#e8c272');
    }
    const b = st.bark;
    if (b && b.actor && shown(b.actor)) { const p = toS(b.actor.x, b.actor.y - b.actor.h - 6); box(String(b.text).toUpperCase().slice(0, 60), p[0], p[1] - (b.actor.marker ? 10 : 0), '#efe6d2'); }
    const fo = W.focus;
    // The 3x5 font has no brackets or dash: '(E) EXAMINE - POSTER'.
    if (fo) { const p = toS(fo.x, fo.y); box(String(fo.text).toUpperCase().replace('—', '-').replace('[', '(').replace(']', ')'), p[0], p[1] - 4, fo.locked ? '#d8402f' : '#e8c272'); }
  }

  function drawDebug(c) {
    const L = W.loc;
    applyLayer(c, 1);
    const box = (x, y, w, h, col) => { c.strokeStyle = col; c.lineWidth = 1 / rc.zoom; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); };
    for (const f of L.floors) { c.fillStyle = 'rgba(80,220,120,.8)'; c.fillRect(Math.min(f.x0, f.x1), f.y, Math.abs(f.x1 - f.x0), 1); }
    for (const s of L.solids) { if (s.oneway) { c.fillStyle = 'rgba(240,210,80,.9)'; c.fillRect(s.x, s.y, s.w, 1); } else box(s.x, s.y, s.w, s.h, 'rgba(230,80,70,.9)'); }
    for (const l of L.ladders) { c.fillStyle = 'rgba(90,200,230,.8)'; c.fillRect(l.x, l.y0, 1, l.y1 - l.y0); if (l.xTop != null) line(c, l.x, l.y1, +l.xTop, l.y0, 'rgba(90,200,230,.8)'); }
    for (const d of L.doors) box(d.x - (+d.w || 24) / 2, d._y - (+d.h || 48), +d.w || 24, +d.h || 48, d.auto ? 'rgba(200,120,240,.9)' : 'rgba(240,120,200,.9)');
    for (const o of L.objects) box(o.x - (+o.w || 20) / 2, o._y - (+o.h || 30), +o.w || 20, +o.h || 30, 'rgba(240,240,240,.6)');
    for (const t of L.triggers) { if (t.x0 == null) continue; c.fillStyle = 'rgba(255,150,40,.15)'; c.fillRect(Math.min(t.x0, t.x1), t.y0 != null ? +t.y0 : 0, Math.abs(t.x1 - t.x0), (t.y1 != null ? +t.y1 : L.h) - (t.y0 != null ? +t.y0 : 0)); }
    for (const a of W.actors) if (shown(a)) box(a.x - a.w / 2, a.y - a.h, a.w, a.h, a === W.jin ? 'rgba(120,180,255,.9)' : 'rgba(255,255,255,.35)');
    if (W.focus) box(W.focus.x - 3, W.focus.y - 3, 6, 6, '#e8c272');
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ── 17. Sky, lighting, post effects, W.render ────────────────────── */
  const SKY = {   // fallback skies (pieces.js's S.backdrop draws the real ones)
    night: ['#0b0d16', '#121725', '#1c2333', '#262c3d'], dusk: ['#1a1a2c', '#3a2f45', '#6a4a52', '#9a6a5a'],
    dawn: ['#1e2236', '#3c4058', '#6f6a78', '#a08a80'], day: ['#4a5a6e', '#61738a', '#7a8c9e', '#93a1ad'],
    overcast: ['#3a3f4a', '#474c56', '#555a63', '#62666d'], storm: ['#121419', '#1b1e25', '#262a31', '#30343b'],
  };
  function drawSky(c, L) {
    if (S.backdrop && typeof S.backdrop.draw === 'function') {
      try { S.backdrop.draw(c, L, rc.x, rc.y, S.time); } catch (e) { report(e, 'backdrop.draw'); }
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      return;
    }
    const k = SKY[L.sky] || SKY.night;
    for (let i = 0; i < 6; i++) R(c, 0, (VH * i) / 6, VW, VH / 6 + 1, mixc(k[Math.min(3, Math.floor(i * 0.7))], k[Math.min(3, Math.floor(i * 0.7) + 1)], (i * 0.7) % 1));
  }

  function makeVignette(col) {
    const v = makeCanvas(VW, VH);
    if (!v) return null;
    const c = v.getContext('2d');
    const g = c.createRadialGradient(VW / 2, VH / 2, VH * 0.28, VW / 2, VH / 2, VW * 0.62);
    g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.45, rgba(col, 0.25)); g.addColorStop(0.8, rgba(col, 0.75)); g.addColorStop(1, rgba(col, 1));
    c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    return v;
  }
  // Lights for this frame in world coordinates (parallax lights shift with the camera). Reuses objects.
  function frameLights() {
    const out = st.lightBuf || (st.lightBuf = []);
    out.length = 0;
    const src = st.lights || [];
    for (let i = 0; i < src.length; i++) {
      const s = src[i], l = s.src;
      if (s.p === 1) { out.push(l); continue; }
      const lc = layerCentre(s.p);
      const o = s.tmp || (s.tmp = {});
      Object.assign(o, l);
      o.x = (+l.x || 0) + rc.cx - lc[0]; o.y = (+l.y || 0) + rc.cy - lc[1];
      out.push(o);
    }
    if (Array.isArray(W.extraLights)) for (const l of W.extraLights) if (l) out.push(l);
    return out;
  }
  function composite(c, L) {
    const lights = frameLights();
    if (S.light && typeof S.light.composite === 'function') {
      try { S.light.composite(c, L, rc, lights, S.time); } catch (e) { report(e, 'light.composite'); }
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      return;
    }
    // Fallback: darkness with soft holes for lights, then a faint warm glow.
    const dark = clamp(+(L.ambient && L.ambient.dark) || 0, 0, 1);
    if (dark <= 0.01 && !lights.length) return;
    const lc = st.lightCv || (st.lightCv = makeCanvas(VW, VH));
    if (!lc) return;
    const x = lc.getContext('2d'), z = rc.zoom;
    x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, VW, VH);
    x.fillStyle = rgba((L.ambient && L.ambient.tint) || '#0c0a16', dark); x.fillRect(0, 0, VW, VH);
    x.globalCompositeOperation = 'destination-out';
    const toS = (l) => [VW / 2 + z * ((+l.x || 0) - rc.cx), VH / 2 + z * ((+l.y || 0) - rc.cy)];
    for (const l of lights) {
      const p = toS(l), r = Math.max(4, (+l.r || 40) * z), fl = l.flicker ? 1 - l.flicker * 0.35 * hash(Math.floor(S.time * 14) + (+l.x || 0)) : 1;
      if (p[0] < -r || p[0] > VW + r || p[1] < -r || p[1] > VH + r) continue;
      const g = x.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      g.addColorStop(0, 'rgba(0,0,0,' + clamp((l.k != null ? +l.k : 0.8) * fl, 0, 1).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r);
    }
    c.drawImage(lc, 0, 0);
    c.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      const p = toS(l), r = Math.max(4, (+l.r || 40) * z * 0.8);
      if (p[0] < -r || p[0] > VW + r || p[1] < -r || p[1] > VH + r) continue;
      const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      g.addColorStop(0, rgba(l.color || '#f2c46e', 0.16 * (l.k != null ? +l.k : 0.8))); g.addColorStop(1, rgba(l.color || '#f2c46e', 0));
      c.fillStyle = g; c.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r);
    }
    c.globalCompositeOperation = 'source-over';
  }

  // Lub-dub shape from the time since the director's last heartbeat.
  function beatPulse() {
    const hb = clamp(+S.fx.heartbeat || 0, 0, 1);
    if (hb <= 0.15) return 0;
    const t = S.time - st.beatAt;
    if (t < 0 || t > 0.6) return 0;
    const g = (m, w) => Math.exp(-((t - m) * (t - m)) / (2 * w * w));
    return hb * Math.max(g(0.04, 0.03), 0.65 * g(0.24, 0.035));
  }
  // S.fx post effects, in order: desaturation and sepia, blur, double vision, vignette, heartbeat,
  // flash, letterbox, door-transition fade, S.fx.fade (world draws it: S.world.rendersFade).
  function postFx(c, fc) {
    const fx = S.fx, t = S.realTime || S.time;
    c.setTransform(1, 0, 0, 1, 0, 0);
    const desat = clamp(+fx.desat || 0, 0, 1), sepia = clamp(+fx.sepia || 0, 0, 1);
    if (desat > 0.003 || sepia > 0.003) {
      c.globalCompositeOperation = 'saturation'; c.globalAlpha = Math.max(desat, sepia);
      c.fillStyle = '#808080'; c.fillRect(0, 0, VW, VH);
      if (sepia > 0.003) {
        c.globalCompositeOperation = 'color'; c.globalAlpha = sepia * 0.78; c.fillStyle = '#9c7a52'; c.fillRect(0, 0, VW, VH);
        c.globalCompositeOperation = 'lighter'; c.globalAlpha = sepia * 0.5; c.fillStyle = '#1e1609'; c.fillRect(0, 0, VW, VH);   // faded, warm blacks
      }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    }
    const blur = clamp(+fx.blur || 0, 0, 1);
    if (blur > 0.01) {
      const sc = st.blurCv || (st.blurCv = makeCanvas(VW, VH));
      if (sc) {
        const f = 1 + blur * 5, sw = Math.max(8, Math.round(VW / f)), sh = Math.max(5, Math.round(VH / f));
        const x = sc.getContext('2d');
        x.imageSmoothingEnabled = true; x.clearRect(0, 0, VW, VH); x.drawImage(fc, 0, 0, sw, sh);
        c.imageSmoothingEnabled = true; c.globalAlpha = clamp(blur * 1.5, 0, 1);
        c.drawImage(sc, 0, 0, sw, sh, 0, 0, VW, VH);
        c.imageSmoothingEnabled = false; c.globalAlpha = 1;
      }
    }
    const dbl = clamp(+fx.double || 0, 0, 1);
    if (dbl > 0.01) {
      const tc = st.tmpCv || (st.tmpCv = makeCanvas(VW, VH));
      if (tc) {
        const x = tc.getContext('2d');
        x.clearRect(0, 0, VW, VH); x.drawImage(fc, 0, 0);
        const ox = Math.round((3 + 7 * dbl) * (0.6 + 0.4 * Math.sin(t * 1.3))), oy = Math.round(2 * dbl * Math.sin(t * 0.9));
        c.globalAlpha = clamp(0.48 * dbl, 0, 0.5); c.drawImage(tc, ox, oy); c.globalAlpha = 1;
      }
    }
    const vig = clamp(+fx.vignette || 0, 0, 1) + sepia * 0.3;
    if (vig > 0.005) {
      const v = st.vigCv || (st.vigCv = makeVignette(INK));
      if (v) { c.globalAlpha = clamp(vig, 0, 1); c.drawImage(v, 0, 0); c.globalAlpha = 1; }
    }
    const pulse = beatPulse();
    if (pulse > 0.01) {
      const v = st.vigRed || (st.vigRed = makeVignette('#5a0d14'));
      if (v) { c.globalAlpha = clamp(pulse * 0.85, 0, 1); c.drawImage(v, 0, 0); c.globalAlpha = 1; }
    }
    const flash = Math.min(clamp(+fx.flash || 0, 0, 1), S.settings && S.settings.flash != null ? clamp(+S.settings.flash, 0, 1) : 1);
    if (flash > 0.003) { c.globalAlpha = flash; c.fillStyle = fx.flashColor || '#ffffff'; c.fillRect(0, 0, VW, VH); c.globalAlpha = 1; }
    const lb = clamp(+fx.letterbox || 0, 0, 1);
    if (lb > 0.003) { const h = Math.round(U.ease.inOut(lb) * 42); c.fillStyle = '#000'; c.fillRect(0, 0, VW, h); c.fillRect(0, VH - h, VW, h); }
    const tk = st.trans.phase ? clamp(st.trans.k, 0, 1) : 0;
    if (tk > 0.003) { c.globalAlpha = tk; c.fillStyle = '#000'; c.fillRect(0, 0, VW, VH); c.globalAlpha = 1; }
    const fade = clamp(+fx.fade || 0, 0, 1);
    if (fade > 0.003) { c.globalAlpha = fade; c.fillStyle = fx.fadeColor || '#000000'; c.fillRect(0, 0, VW, VH); c.globalAlpha = 1; }
    return pulse;
  }

  // Full frame into an internal 640x360 canvas (post effects need a copy of the frame), then blitted onto
  // ctx under the caller's transform; an identity-transformed ctx of another size is filled entirely.
  W.rendersFade = true;
  W.render = function (ctx) {
    if (S.headless || !ctx) return;
    st.frame = (st.frame || 0) + 1;
    if (ctx.canvas) st.displayCanvas = ctx.canvas;
    const fc = st.frameCv || (st.frameCv = makeCanvas(VW, VH));
    if (!fc) return;
    const c = st.frameCtx || (st.frameCtx = ctxOf(fc));
    const L = W.loc;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.imageSmoothingEnabled = false;
    if (!L) { c.fillStyle = '#000'; c.fillRect(0, 0, VW, VH); postFx(c, fc); blit(ctx, fc, 0); return; }
    try {
      if (!st.bakes || st.rebake) bake();
      setupRenderCam(L);
      // 1. sky + far parallax backdrop (exteriors), else the room colour
      if (L.kind === 'exterior' || (L.sky && L.sky !== 'none')) drawSky(c, L);
      else { c.fillStyle = L.room && L.room.wall ? ramp(L.room.wall)[0] : '#17141d'; c.fillRect(0, 0, VW, VH); }
      // 2. far / mid parallax layers, room shell + ground + back layer
      drawBaked(c, 'far'); drawBaked(c, 'mid'); drawBaked(c, 'back');
      applyLayer(c, 1);
      const v = viewOf(1);
      runHooks('back', c);
      if (S.activities && typeof S.activities.draw === 'function') { try { S.activities.draw(c, 'back'); } catch (e) { report(e, 'activities.draw'); } applyLayer(c, 1); }
      drawGlints(c, v); drawEdgeHints(c);
      if (S.combat && typeof S.combat.drawUnder === 'function') { S.combat.drawUnder(c); applyLayer(c, 1); }
      // 3. actors
      drawActors(c, 'back', v); drawActors(c, 'main', v);
      // 4. effects and particles
      drawEffects(c, v);
      if (S.combat && typeof S.combat.drawOver === 'function') { S.combat.drawOver(c); applyLayer(c, 1); }
      runHooks('effects', c);
      // 5. front layer, front actors, fore layer
      drawBaked(c, 'front');
      applyLayer(c, 1);
      drawActors(c, 'front', v);
      if (S.activities && typeof S.activities.draw === 'function') { try { S.activities.draw(c, 'front'); } catch (e) { report(e, 'activities.draw'); } applyLayer(c, 1); }
      runHooks('front', c);
      drawBaked(c, 'fore');
      // 6. weather and lighting (screen space)
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (L.weather && S.weather && typeof S.weather.draw === 'function') {
        try { S.weather.draw(c, L, rc); } catch (e) { report(e, 'weather.draw'); }
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }
      composite(c, L);
      runHooks('screen', c);
      if (W.debug) drawDebug(c);
      if (!S.ui || W.canvasLabels) drawLabelsFallback(c);
    } catch (e) {
      report(e, 'render');
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    const pulse = postFx(c, fc);
    blit(ctx, fc, pulse);
  };
  function runHooks(where, c) {
    const list = st.hooks[where];
    if (!list.length) return;
    for (const fn of list.slice()) {
      try { fn(c, rc); } catch (e) { report(e, 'draw hook ' + where); }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (where === 'screen') c.setTransform(1, 0, 0, 1, 0, 0); else applyLayer(c, 1);
    }
  }
  function blit(ctx, fc, pulse) {
    ctx.save();
    try {
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = false;
      const m = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
      const ident = m && m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
      const cw = ctx.canvas ? ctx.canvas.width : VW, ch = ctx.canvas ? ctx.canvas.height : VH;
      const tw = ident && (cw !== VW || ch !== VH) ? cw : VW, th = ident && (cw !== VW || ch !== VH) ? ch : VH;
      if (pulse > 0.01) {
        // The heartbeat swells the frame a hair (about its centre); black shows nowhere.
        const s = 1 + 0.012 * pulse;
        ctx.translate(tw / 2, th / 2); ctx.scale(s, s); ctx.translate(-tw / 2, -th / 2);
      }
      ctx.drawImage(fc, 0, 0, tw, th);
    } finally { ctx.restore(); }
  }

  /* ── 18. Screen positions, minimap and prompt data for the UI ─────── */
  // The display canvas's box inside #story-root in CSS px, plus px per logical px. main.js may provide
  // S.main.viewRect() (same shape); otherwise the canvas world.render last drew into is measured
  // (cached 0.25 s and on resize). Headless: logical pixels.
  W.viewRect = function () {
    if (S.headless || typeof document === 'undefined') return { x: 0, y: 0, w: VW, h: VH, sx: 1, sy: 1 };
    if (S.main && typeof S.main.viewRect === 'function') {
      try { const r = S.main.viewRect(); if (r && isFinite(r.w) && r.w > 0) return { x: +r.x || 0, y: +r.y || 0, w: +r.w, h: +r.h, sx: r.w / VW, sy: r.h / VH }; } catch (e) { report(e, 'main.viewRect'); }
    }
    const now = S.realTime || 0;
    if (st.css && now - st.cssAt < 0.25) return st.css;
    st.cssAt = now;
    let r = { x: 0, y: 0, w: VW, h: VH, sx: 1, sy: 1 };
    try {
      const root = document.getElementById('story-root');
      const cv = (st.displayCanvas && st.displayCanvas.getBoundingClientRect ? st.displayCanvas : null) ||
        (S.main && S.main.canvas) || (root && root.querySelector && root.querySelector('canvas'));
      if (cv && cv.getBoundingClientRect) {
        const a = cv.getBoundingClientRect(), b = root && root.getBoundingClientRect ? root.getBoundingClientRect() : { left: 0, top: 0 };
        if (a.width > 0 && a.height > 0) r = { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height, sx: a.width / VW, sy: a.height / VH };
      }
    } catch (e) { report(e, 'viewRect'); }
    st.css = r;
    return r;
  };
  if (!S.headless && typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', () => { st.cssAt = -1e9; });

  // World point -> CSS px relative to #story-root (follows camera, zoom and shake).
  W.screenPos = function (x, y) {
    const z = cam.zoom || 1;
    const sx = VW / 2 + z * ((+x || 0) - camS.cx) + (st.shx || 0), sy = VH / 2 + z * ((+y || 0) - camS.cy) + (st.shy || 0);
    const v = W.viewRect();
    return { x: v.x + sx * v.sx, y: v.y + sy * v.sy, onScreen: sx >= -8 && sx <= VW + 8 && sy >= -8 && sy <= VH + 8 };
  };
  // Logical (canvas) position of a world point, for tests and canvas overlays.
  W.toScreen = function (x, y) {
    const z = cam.zoom || 1;
    return { x: VW / 2 + z * ((+x || 0) - camS.cx), y: VH / 2 + z * ((+y || 0) - camS.cy) };
  };
  // Visible world rect after zoom.
  W.view = () => ({ x0: cam.view.x, y0: cam.view.y, x1: cam.view.x + cam.view.w, y1: cam.view.y + cam.view.h });

  // The focus prompt with its CSS position: { text, verb, label, key, kind, id, locked, marker, x, y } or null.
  W.prompt = function () {
    const f = W.focus;
    if (!f) return null;
    const p = W.screenPos(f.x, f.y);
    return { text: f.text, verb: f.verb, label: f.label, key: f.key, kind: f.kind, id: f.id, locked: f.locked || null, marker: f.marker || null, x: p.x, y: p.y };
  };

  // Targets of active quests in this location; a target elsewhere points at the door that leads there.
  function questTargets() {
    const out = [], L = W.loc, G = S.G, D = S.director, story = S.story;
    const seen = new Set();
    const push = (t, kind, quest) => {
      if (!t) return;
      const key = quest + '|' + kind;
      if (seen.has(key)) return;
      if (!t.loc || t.loc === W.locId) {
        if (t.x == null) return;
        seen.add(key);
        out.push({ x: +t.x, y: t.y != null ? +t.y : null, kind, quest: quest || null });
        return;
      }
      const d = L.doors.find((o) => o.to === t.loc && test(o.when, 'door when ' + o.id));
      if (d) { seen.add(key); out.push({ x: d.x, y: d._y, kind, quest: quest || null, via: d.id, loc: t.loc }); }
    };
    let main = null;
    if (D && typeof D.objective === 'function') { try { main = D.objective(); } catch (e) { report(e, 'director.objective'); } }
    if (main && main.target) push(main.target, main.kind || 'main', main.quest);
    if (G && G.quests && story && typeof story.questDef === 'function') {
      for (const id in G.quests) {
        const q = G.quests[id];
        if (!q || q.state !== 'active' || (main && main.quest === id)) continue;
        let def = null;
        try { def = story.questDef(id); } catch (e) { report(e, 'questDef'); }
        const steps = def && Array.isArray(def.steps) ? def.steps : null;
        if (!steps || !steps.length) continue;
        const s = steps[clamp(q.step | 0, 0, steps.length - 1)];
        if (s && s.target) push(s.target, def.kind || 'side', id);
      }
    }
    return out;
  }
  // Minimap data: {w, h, jin:{x,y}, npcs:[{x,y,marker}], doors:[{x,label}], targets:[{x}]} plus extras the
  // UI may use (id, name, ground, floors, ladders, view, enemies flagged on npcs, door kind/locked/to).
  W.minimap = function () {
    const L = W.loc;
    if (!L) return null;
    const j = W.jin;
    const npcs = [];
    for (const a of W.actors) {
      if (a === j || !shown(a)) continue;
      const enemy = isEnemy(a);
      if (enemy && (a.down || (a.enemy && (a.enemy.ko || a.enemy.fled)))) continue;
      npcs.push({ id: a.id, name: a.name, x: Math.round(a.x), y: Math.round(a.y), marker: a.marker || null, enemy, talk: !!a.talk });
    }
    const doors = [];
    for (const d of L.doors) {
      if (!test(d.when, 'door when ' + d.id)) continue;
      doors.push({ id: d.id, x: Math.round(d.x), y: Math.round(d._y), label: d.label || locName(d.to), kind: d.kind, to: d.to || null, locked: !!lockReason(d) });
    }
    return {
      id: W.locId, name: L.name, area: L.area || null, w: L.w, h: L.h, ground: L.ground, kind: L.kind,
      jin: j ? { x: Math.round(j.x), y: Math.round(j.y), face: j.face } : null,
      npcs, doors, targets: questTargets(),
      floors: L.floors.map((f) => ({ x0: Math.min(f.x0, f.x1), x1: Math.max(f.x0, f.x1), y: f.y })),
      platforms: L._plats.map((p) => ({ x0: p.x0, x1: p.x1, y: p.y })),
      ladders: L.ladders.map((l) => ({ x: l.x, y0: l.y0, y1: l.y1 })),
      view: { x: Math.round(cam.view.x), y: Math.round(cam.view.y), w: Math.round(cam.view.w), h: Math.round(cam.view.h) },
    };
  };

  /* ── 19. Reset, debug toggles, events ─────────────────────────────── */
  // Back to an empty world (title screen, closing Story Mode). Jin is rebuilt on the next enter.
  W.reset = function () {
    endBark();
    releaseBakes();
    W.loc = null; W.locId = null; W.actors.length = 0; W.jin = null; W.focus = null;
    W.effects.length = 0; W.particles.length = 0; W.control = null; W.transitioning = false;
    st.trans = { phase: null, t: 0, dur: 0, k: 0, k0: 0, pending: null, w: null, edge: 0 };
    st.lights = null; st.barkSeen = Object.create(null); st.lastAutosave = -1e9;
    if (camS.tween && camS.tween.w) camS.tween.w.finish(false);
    camS.tween = null; cam.mode = 'follow'; cam.target = null; cam.zoom = 1; cam.shake = 0; camS.shakeT = 0;
    W.resetFx();
    if (st.loops) { for (const k in st.loops) S.audio.loop(k, 0, 0.6); st.loops = null; }
  };
  // The look registry or settings can change under a baked location (cast.js loading late, a chapter
  // replaces a LocationDef while it is shown): world re-resolves on 'chapterStart' / 'loaded' through
  // markDirty; W.refresh() re-resolves the whole location in place (positions kept).
  W.refresh = function () {
    const L = W.loc;
    if (!L) return;
    const fresh = resolveLocation(W.locId);
    if (!fresh) return;
    W.loc = fresh;
    nameCacheClear();
    st.rebake = true;
  };
  function nameCacheClear() { for (const k in nameCache) delete nameCache[k]; }
  S.events.on('chapterStart', nameCacheClear);
  S.events.on('settings', () => { st.cssAt = -1e9; });
})(window.STORY);
