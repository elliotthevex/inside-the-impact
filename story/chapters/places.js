/* Story Mode — chapters/places.js
   Shared location builders for the places that recur across chapters (BIBLE 01-global "World map" and
   "Shared locations"; each chapter's "Locations" section). Every builder returns a plain LocationDef
   (ARCHITECTURE §5) that a chapter puts in its own `locations` map under the bible's id:

     locations: {
       kessler_ave_1996: S.places.kesslerAve({ year: 1996, time: 'dusk', van: (G) => G.flags.ch1_pike_stance === 'insisted',
                                               npcs: [ { id: 'petra', ... } ], objects: [ ... ] }),
     }

   Opts every builder accepts (finish(), section 1):
     name, area, map, sky, backdrop, weather, weatherAmount, wind, wet, groundStyle, firstEnter, enter, ground, h  (override)
     ambient, camera, room, points, sound           (merged / replaced)
     training: {...} | null                        (the journal's drill spots here; null removes them)
     npcs, objects, doors, triggers: [ ... ]        (added; an entry whose id matches a built-in one patches it)
     npc, obj, door: { id: false | { patch } }      (remove or patch a built-in entry by id)
     to: { doorId: 'locId' | null }                 (retarget a built-in door, or remove it with null)
     layers: { far|mid|back|front|fore: [pieces] }  (added to the built-in layers)
     drop: [ 'pieceId', ... ]                       (remove built-in pieces that carry that `id`)
     lights, solids, ladders: [ ... ]               (added)
     cast: false                                    (no built-in residents)
     edit: (L) => L                                 (last word: change anything)
   Place-specific opts (year, season, time, state ...) are listed with each builder and in chapters/README.md.

   Also here: S.places.calderMap / node() / nodes() (world-map nodes, one coordinate table for every chapter),
   S.places.spots (named x/y of every built-in fixture, for placing chapter objects and NPCs),
   S.places.climb / climbTo() / withClimb() (autoplay hints for tall maps: the test autopilot cannot climb),
   S.places.stairs() (a walkable flight + its two 'stairs' doors), S.places.look() (cast look resolver),
   S.places.catalog (every builder, its location ids and opts). Shared scene: 'places_noop'. */
(function (S) {
  'use strict';

  const P = S.places = S.places || {};
  const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
  const isFn = (f) => typeof f === 'function';
  const flag = (G, k) => !!(G && G.flags && G.flags[k]);
  const fv = (G, k) => (G && G.flags ? G.flags[k] : undefined);

  /* ── 1. Helpers: opts, merging, looks, atmosphere ─────────────────── */

  // A scene that does nothing: the `run` of placeholder doors (locked with a reason, no target in this chapter).
  if (isFn(S.defineScene)) S.defineScene('places_noop', function* () { /* nothing */ });

  // bool | (G) => bool  ->  a when() function, or undefined for "always".
  function whenOf(v) {
    if (v === undefined || v === null || v === true) return undefined;
    if (v === false) return () => false;
    if (isFn(v)) return v;
    return () => !!v;
  }
  // Is an opt on? (functions count as "maybe": the piece gets the function as when()).
  const on = (v) => v !== false && v !== null && v !== undefined;

  // Resolve a cast look: '<id>_<variant>' -> '<id>' -> fallback generic. Cast.js loads before this file.
  function look(id, variant, fallback) {
    const L = S.looks || {};
    if (variant !== undefined && variant !== null && own(L, id + '_' + variant)) return id + '_' + variant;
    if (own(L, id)) return id;
    if (fallback && own(L, fallback)) return fallback;
    return fallback || id;
  }
  P.look = look;

  // Merge entries into a list by id: false removes, objects patch (entry wins), new ids are appended.
  function mergeList(list, entries) {
    if (!entries) return list;
    const arr = Array.isArray(entries) ? entries : Object.keys(entries).map((id) => (entries[id] === false ? { id, __remove: true } : Object.assign({ id }, entries[id])));
    for (const e of arr) {
      if (!e) continue;
      const i = e.id != null ? list.findIndex((x) => x && x.id === e.id) : -1;
      if (e.__remove) { if (i >= 0) list.splice(i, 1); continue; }
      if (i >= 0) {
        const cur = list[i];
        if (cur._placeholder && (e.to !== undefined || e.run !== undefined || e.locked !== undefined)) { delete cur.locked; delete cur.run; delete cur._placeholder; }
        list[i] = Object.assign(cur, e);
      } else list.push(Object.assign({}, e));
    }
    return list;
  }

  // Apply the common opts to a built LocationDef (see the header).
  function finish(L, o) {
    o = o || {};
    for (const k of ['name', 'area', 'map', 'sky', 'backdrop', 'weather', 'weatherAmount', 'wind', 'wet', 'groundStyle', 'firstEnter', 'enter', 'ground', 'h', 'street'])
      if (o[k] !== undefined) L[k] = o[k];
    if (o.ambient) L.ambient = Object.assign({}, L.ambient || {}, o.ambient);
    if (o.camera) L.camera = Object.assign({}, L.camera || {}, o.camera);
    if (o.room) L.room = Object.assign({}, L.room || {}, o.room);
    if (o.points) L.points = Object.assign({}, L.points || {}, o.points);
    if (o.sound !== undefined) L.sound = o.sound;
    if (o.training !== undefined) { if (o.training === null) delete L.training; else L.training = Object.assign({}, L.training || {}, o.training); }
    for (const k of ['npcs', 'objects', 'doors', 'triggers', 'lights', 'solids', 'ladders', 'floors']) if (!Array.isArray(L[k])) L[k] = [];
    if (o.cast === false) L.npcs = L.npcs.filter((n) => n && !n._res);
    if (o.to) for (const id in o.to) {
      const i = L.doors.findIndex((d) => d && d.id === id);
      if (i < 0) continue;
      const t = o.to[id];
      if (t === null || t === false) { L.doors.splice(i, 1); continue; }
      const d = L.doors[i];
      if (d._placeholder) { delete d.locked; delete d._placeholder; }
      delete d.run; d.to = t;
    }
    mergeList(L.doors, o.door); mergeList(L.npcs, o.npc); mergeList(L.objects, o.obj);
    mergeList(L.doors, o.doors); mergeList(L.npcs, o.npcs); mergeList(L.objects, o.objects); mergeList(L.triggers, o.triggers);
    for (const k of ['lights', 'solids', 'ladders']) if (Array.isArray(o[k])) L[k] = L[k].concat(o[k]);
    L.layers = L.layers || {};
    if (o.drop) { const drop = new Set([].concat(o.drop)); for (const n in L.layers) L.layers[n] = L.layers[n].filter((p) => !(p && p.id && drop.has(p.id))); }
    if (o.layers) for (const n in o.layers) L.layers[n] = (L.layers[n] || []).concat(o.layers[n] || []);
    if (isFn(o.edit)) L = o.edit(L) || L;
    return L;
  }
  P.finish = finish;
  P.extend = (L, o) => finish(L, o);

  // A placeholder door: drawn by the place, leads nowhere in this chapter, says why (retarget it with `to`).
  function closed(d, why) {
    return Object.assign({ verb: 'Enter', kind: 'door' }, d, { locked: () => why, run: 'places_noop', _placeholder: true });
  }
  // A door to `to`, or a placeholder with `why` when `to` is null.
  function door(d, to, why) { return to ? Object.assign({ verb: 'Enter', kind: 'door' }, d, { to }) : closed(d, why || 'Not now.'); }

  // Time of day and season -> sky, darkness, weather, lit windows, street lamps.
  const TIME = {
    day:   { sky: 'day', dark: 0.06, lit: 0.12, lamps: false, tint: '#3a4658' },
    overcast: { sky: 'overcast', dark: 0.16, lit: 0.18, lamps: false, tint: '#36404e' },
    dusk:  { sky: 'dusk', dark: 0.3, lit: 0.42, lamps: true, tint: '#2a3550' },
    night: { sky: 'night', dark: 0.52, lit: 0.5, lamps: true, tint: '#1e2840' },
    late:  { sky: 'night', dark: 0.6, lit: 0.22, lamps: true, tint: '#1a2236' },
    dawn:  { sky: 'dawn', dark: 0.24, lit: 0.2, lamps: true, tint: '#34405a' },
  };
  function tod(o, def) { return TIME[o.time] || TIME[def] || TIME.dusk; }
  function seasonWeather(season, time) {
    if (season === 'winter') return 'snow';
    if (season === 'autumn') return 'leaves';
    if (season === 'spring') return time === 'night' || time === 'late' ? null : null;
    return null;
  }
  // Exterior atmosphere from opts (o.time, o.season, o.weather, o.fog).
  function outdoor(o, def) {
    const t = tod(o, def.time || 'dusk');
    const weather = o.weather !== undefined ? o.weather : def.weather !== undefined ? def.weather : seasonWeather(o.season || def.season, o.time || def.time);
    const wetW = /rain|drizzle/.test(String(weather || ''));
    return {
      sky: o.sky || (wetW && t.sky !== 'night' ? 'overcast' : t.sky), weather: weather || undefined,
      ambient: { dark: o.dark !== undefined ? o.dark : t.dark, tint: t.tint, fog: o.fog !== undefined ? o.fog : def.fog || (wetW ? 0.1 : 0.04) },
      wet: wetW || !!o.wet, lit: t.lit, lamps: o.lamps !== undefined ? !!o.lamps : t.lamps,
    };
  }
  // Interior darkness by time (lamps and windows do the rest).
  function indoor(o, base) {
    const t = o.time || 'day';
    const add = t === 'night' || t === 'late' ? 0.22 : t === 'dusk' ? 0.1 : t === 'dawn' ? 0.08 : 0;
    return { dark: Math.min(0.85, (base || 0.2) + add), tint: o.tint || '#2a2c38', fog: o.fog || 0.03 };
  }
  // Default season of a year in this story (1994 summer, 1996 Oct–Dec, 1997 Jan–Apr).
  function seasonOf(o) {
    if (o.season) return o.season;
    if (o.year === 1994) return 'summer';
    if (o.year === 1996) return 'winter';
    if (o.year === 1997) return o.month === 'apr' || o.month === 'mar' ? 'spring' : 'winter';
    if (o.year === 2000) return 'spring';
    return 'winter';
  }

  // An NPC that belongs to the place (a resident). Chapters add their own with opts.npcs.
  function resident(id, x, extra) {
    const n = Object.assign({ id, x, face: -1, pose: 'idle', barkRadius: 70 }, extra || {}, { _res: true, look: (extra && extra.look) || look(id, extra && extra.variant, extra && extra.fallback) });
    delete n.variant; delete n.fallback;
    return n;
  }

  /* ── 2. Stairs and tall maps: walkable flights + 'stairs' doors, autoplay climb hints ── */

  // One flight between two levels of the SAME location:
  //   - a walkable stair (ladder kind 'stairs' with xTop): hold up / down at its foot / head;
  //   - a 'stairs' door at each end (E: "Take — <label>") that runs a short fade to the other end.
  // The doors are what the test autopilot uses (see climb below). spec:
  //   { id, from: { x, y }, to: { x, y }, up: 'label going up', down: 'label going down', draw: 'wood'|'iron'|'concrete'|false, when }
  // Returns { ladders: [..], doors: [..], pieces: [..] } to spread into a LocationDef.
  function hopTo(x, y, face) {
    return function* placesHop(A) {
      A.sound('stairs');
      yield A.fade(1, 0.2);
      A.place('jin', x, y);
      if (face) A.face('jin', face);
      yield A.wait(0.05);
      yield A.fade(0, 0.25);
    };
  }
  function stairs(spec) {
    const a = spec.from, b = spec.to, id = spec.id || 'st';
    const lo = a.y >= b.y ? a : b, hi = lo === a ? b : a;     // lo = lower level (bigger y)
    const dirUp = hi.x >= lo.x ? 1 : -1;
    const when = whenOf(spec.when);
    const out = { ladders: [], doors: [], pieces: [] };
    out.ladders.push({ x: lo.x, xTop: hi.x, y0: hi.y, y1: lo.y, kind: 'stairs', w: 16, when, draw: false });
    out.doors.push({ id: id + '_up', x: lo.x, y: lo.y, w: 22, h: 50, kind: 'stairs', verb: 'Take', label: spec.up || 'Stairs up',
      run: hopTo(hi.x + dirUp * 6, hi.y, dirUp), stair: { fromY: lo.y, toY: hi.y }, sound: null, when });
    out.doors.push({ id: id + '_down', x: hi.x, y: hi.y, w: 22, h: 50, kind: 'stairs', verb: 'Take', label: spec.down || 'Stairs down',
      run: hopTo(lo.x - dirUp * 6, lo.y, -dirUp), stair: { fromY: hi.y, toY: lo.y }, sound: null, when });
    if (spec.draw !== false) {
      const kind = spec.draw || 'wood';
      if (kind === 'wood') out.pieces.push({ t: 'stairs_interior', x: Math.min(lo.x, hi.x), w: Math.abs(hi.x - lo.x), h: lo.y - hi.y, dir: dirUp, y: lo.y, when, runner: spec.runner });
      else out.pieces.push({ t: 'stairs', x: Math.min(lo.x, hi.x), w: Math.abs(hi.x - lo.x), h: lo.y - hi.y, dir: dirUp, y: lo.y, kind: kind === 'iron' ? 'iron' : undefined, when });
    }
    return out;
  }
  // A plain ladder (fire escape, loft, tank) with a 'ladder' door at the foot and the head for the autopilot.
  function ladder(spec) {
    const id = spec.id || 'ld', x = spec.x, when = whenOf(spec.when);
    return {
      ladders: [{ x, y0: spec.top, y1: spec.bottom, when }],
      doors: [
        { id: id + '_up', x: x + (spec.side || 0), y: spec.bottom, w: 18, h: 50, kind: 'ladder', verb: 'Climb', label: spec.up || 'Ladder up',
          run: hopTo(x + (spec.offTop || 12), spec.top, spec.faceTop || 1), stair: { fromY: spec.bottom, toY: spec.top }, sound: null, when },
        { id: id + '_down', x: x + (spec.offTop || 12), y: spec.top, w: 18, h: 50, kind: 'ladder', verb: 'Climb', label: spec.down || 'Ladder down',
          run: hopTo(x - (spec.offBottom || 12), spec.bottom, spec.faceBottom || -1), stair: { fromY: spec.top, toY: spec.bottom }, sound: null, when },
      ],
    };
  }
  P.stairs = stairs;
  P.ladder = ladder;
  // Spread stairs()/ladder() results into a def.
  function addFlight(L, f, layer) {
    L.ladders = (L.ladders || []).concat(f.ladders || []);
    L.doors = (L.doors || []).concat(f.doors || []);
    if (f.pieces && f.pieces.length) { L.layers[layer || 'back'] = (L.layers[layer || 'back'] || []).concat(f.pieces); }
    return L;
  }

  // Levels of the current location: every y a stair door stands on.
  function levelYs(L) {
    const ys = [];
    for (const d of (L && L.doors) || []) if (d && d.stair) for (const y of [+d.stair.fromY, +d.stair.toY]) if (!ys.some((v) => Math.abs(v - y) < 3)) ys.push(y);
    return ys;
  }
  const nearestY = (ys, y) => ys.reduce((b, v) => (Math.abs(v - y) < Math.abs(b - y) ? v : b), ys[0]);
  function usable(d) {
    try {
      if (d.when && !d.when(S.G)) return false;
      if (d.locked) { const r = isFn(d.locked) ? d.locked(S.G) : d.locked; if (r) return false; }
    } catch (_) { return false; }
    return true;
  }
  // The id of the stair door on Jin's level that starts the shortest way to the level of wantY (BFS over levels).
  function stairToward(L, jy, wantY) {
    const ys = levelYs(L);
    if (ys.length < 2 || wantY === null || wantY === undefined || !isFinite(wantY)) return null;
    const cur = nearestY(ys, jy), want = nearestY(ys, wantY);
    if (Math.abs(cur - want) < 3) return null;
    if (Math.abs(jy - cur) > 40) return null;          // between levels (on a ladder, jumping): wait
    const doors = L.doors.filter((d) => d && d.stair && usable(d));
    const prev = new Map([[cur, null]]), q = [cur];
    while (q.length) {
      const y = q.shift();
      if (Math.abs(y - want) < 3) {
        let at = y, first = null;
        while (prev.get(at)) { first = prev.get(at); at = nearestY(ys, +first.stair.fromY); }
        return first ? first.id : null;
      }
      for (const d of doors) {
        if (Math.abs(nearestY(ys, +d.stair.fromY) - y) >= 3) continue;
        const ny = nearestY(ys, +d.stair.toY);
        if (prev.has(ny)) continue;
        prev.set(ny, d); q.push(ny);
      }
    }
    return null;
  }
  // Which y the autopilot needs to stand on next for target t ({loc, x, y, interact, walkTo}).
  function wantedY(t, here, L) {
    if (!t) return null;
    const W = S.world;
    if (t.loc && t.loc !== here) {
      const route = S.test && isFn(S.test.route) ? S.test.route : null;
      const d = route ? route(here, t.loc) : null;
      if (!d) return null;
      return d._y != null ? +d._y : (d.y != null ? +d.y : null);
    }
    if (t.y != null) return +t.y;
    const list = W && isFn(W.interactables) ? W.interactables() : [];
    if (t.interact) { const c = list.find((e) => e.id === t.interact || (e.ref && e.ref.to === t.interact)); if (c) return +c.y; }
    const x = t.walkTo != null ? +t.walkTo : t.x != null ? +t.x : null;
    if (x === null || !isFinite(x)) return null;
    let best = null;
    for (const c of list) {
      if (c.kind === 'door' && c.ref && c.ref.stair) continue;
      const dx = Math.abs(c.x - x);
      if (dx <= 90 && (!best || dx < best.dx)) best = { dx, y: +c.y };
    }
    return best ? best.y : null;
  }
  // An autoplay hint whose fields are computed when the autopilot reads them (Object.assign calls getters).
  function makeHint(target) {
    const plan = () => {
      try {
        const W = S.world, L = W && W.loc, j = W && W.jin, here = W && W.locId;
        if (!L || !j) return {};
        let t = target;
        if (!t) {
          const D = S.director;
          const wh = D && isFn(D.waitHint) ? D.waitHint() : null;
          if (wh && !wh.__climb && (wh.loc || wh.interact || wh.walkTo != null)) t = wh;
          else if (wh && wh.__climb && wh.__target) t = wh.__target;
          else {
            const ob = D && isFn(D.objective) ? D.objective() : null;
            if (ob && ob.autoplay && ob.autoplay.__climb && ob.autoplay.__target) t = ob.autoplay.__target;
            else if (ob && ob.target) t = ob.target;
          }
        }
        if (!t) return {};
        const wy = wantedY(t, here, L);
        const sid = wy !== null ? stairToward(L, j.y, wy) : null;
        if (sid) return { interact: sid };
        if (!target) return {};
        if (target.loc && target.loc !== here) return { loc: target.loc };
        return { walkTo: target.x != null ? target.x : target.walkTo, interact: target.interact };
      } catch (_) { return {}; }
    };
    const h = {};
    Object.defineProperty(h, '__climb', { value: true });
    Object.defineProperty(h, '__target', { value: target || null });
    for (const k of ['loc', 'interact', 'walkTo']) Object.defineProperty(h, k, { enumerable: true, get: () => plan()[k] });
    return h;
  }
  // Quest step: { text, target: { loc, x, y }, autoplay: S.places.climb } — follows the step's own target.
  P.climb = makeHint(null);
  // Scene waits: yield A.waitFor(fn, { autoplay: S.places.climbTo({ loc, x, y, interact }) }).
  P.climbTo = (t) => makeHint(t || null);
  // Give every quest step without its own autoplay hint the climb hint: quests: S.places.withClimb({...}).
  P.withClimb = function (quests) {
    for (const id in quests || {}) {
      const q = quests[id];
      if (q && Array.isArray(q.steps)) for (const s of q.steps) if (s && !s.autoplay) s.autoplay = P.climb;
    }
    return quests;
  };
  P._levels = { levelYs, stairToward, wantedY };

  // A blank def with the shared defaults.
  function base(d) {
    return Object.assign({ kind: 'interior', h: 360, ground: 300, layers: { far: [], mid: [], back: [], front: [], fore: [] },
      floors: [], solids: [], ladders: [], lights: [], doors: [], npcs: [], objects: [], triggers: [], points: {} }, d);
  }

  /* ── 3. World map: one node table for every chapter ───────────────── */
  // 640 x 360 frame over ui.js's folded map (river along the bottom, the bridge at x≈304).
  // Keep x ≤ 600 and y ≤ 330: ui's nodeFit then keeps the 640 x 360 frame for any subset of nodes.
  P.calderMap = [
    { id: 'map_hillcrest', name: 'Hillcrest — St. Agnes', x: 96, y: 86, district: 'Hillcrest Road',
      desc: 'St. Agnes Long-Term Care on the hill. From the steps the Civic dome is a gray bump on the river.' },
    { id: 'map_northside', name: 'Northside — Foundry Courts', x: 256, y: 70, district: 'Northside',
      desc: 'Foundry Street, the old Local 1197 hall, and the four brick blocks of Foundry Courts under the dead stack.' },
    { id: 'map_cemetery', name: 'Municipal Cemetery', x: 446, y: 92, district: 'North hill',
      desc: 'Calder Municipal Cemetery. Section 14 is the county rows.' },
    { id: 'map_route9', name: 'Route 9 — Starlite Lanes', x: 62, y: 196, district: 'Route 9',
      desc: 'A bowling alley under the overpass. The fighters use the side door.' },
    { id: 'map_downtown', name: 'Downtown — Market Street', x: 330, y: 194, district: 'Downtown',
      desc: 'Market Street, the City Hall Annex, Kwik Copy, 88 Market.' },
    { id: 'map_eastgate', name: 'Eastgate — Kessler Avenue', x: 522, y: 182, district: 'Eastgate',
      desc: 'Kessler Avenue: 412, Sunny\'s, Han\'s Market, the gym.' },
    { id: 'map_garrison', name: 'Garrison Street', x: 150, y: 246, district: 'The Flats',
      desc: 'Garrison Street by the rail cut. Lindell House.' },
    { id: 'map_front_street', name: 'Front Street — YMCA', x: 372, y: 252, district: 'Front Street',
      desc: 'The Calder YMCA. Rooms by the night.' },
    { id: 'map_calder_arms', name: 'Calder Arms Hotel', x: 432, y: 236, district: 'Front Street', base: true,
      desc: 'Rooms by the week, on Front Street.' },
    { id: 'map_civic', name: 'Calder Civic Arena', x: 228, y: 270, district: 'Riverfront',
      desc: 'The Civic. Built 1961.' },
    { id: 'map_riverfront', name: 'Ashgrove Plaza', x: 318, y: 278, district: 'Riverfront',
      desc: 'Ashgrove Tower and its plaza on the river.' },
    { id: 'map_harlan', name: 'Harlan Street', x: 562, y: 262, district: 'Riverside',
      desc: 'Harlan Street, the Grill and Harlan Freight Depot on the river.' },
    { id: 'map_southbank', name: 'Southbank — Alder Row', x: 382, y: 328, district: 'Southbank', travel: false,
      locked: 'Southbank. I\'ve never been. I don\'t know anyone there.',
      desc: 'Across the river.' },
  ];
  const MAP = {};
  for (const n of P.calderMap) MAP[n.id] = n;
  P.mapById = MAP;
  // One node for a chapter's mapNodes: S.places.node('map_eastgate', { locs: ['kessler_ave_1996', ...], travel: true }).
  P.node = function (id, extra) {
    const n = MAP[id];
    if (!n) throw new Error('S.places.node: unknown map node ' + id);
    const out = Object.assign({ travel: true }, n, extra || {});
    if (extra && extra.travel !== undefined && extra.locked === undefined && n.locked) delete out.locked;
    out.locs = (extra && extra.locs) || [];
    return out;
  };
  // Many at once: S.places.nodes({ map_eastgate: ['kessler_ave_1996', 'sunnys'], map_front_street: { locs: ['ymca_312'], travel: false } }).
  P.nodes = function (spec) {
    const out = [];
    for (const id in spec || {}) {
      const v = spec[id];
      out.push(P.node(id, Array.isArray(v) ? { locs: v } : v));
    }
    return out;
  };

  /* ── 4. Eastgate: Kessler Avenue, 412, 3A, Sunny's, Iron Pulse, the YMCA ── */

  const KX = {   // Kessler Avenue, left -> right (BIBLE ch00 / ch02; 2400 x 360, the same geometry every year)
    busStop: 64, payphone: 132, hydrant: 178, posterWall: 226, hans: 262, hansDoor: 384, kettle: 300,
    sunnys: 432, sunnysDoor: 467, booth: 560, k412: 620, door412: 901, stoop: 880, geranium: 932, lawnChair: 962,
    chalk: 700, alley: 1230, gym: 1260, gymDoor: 1491, gymSide: 1760, river: 1800, wagon: 1960, van: 1000,
    lamps: [340, 760, 1180, 1620, 2100], left: 0, right: 2400,
  };
  // year: 1994 (Ch0, late summer) | 1996 (Ch2, December) | 1997 (Ch6–Ch9; spring by default for Ch9) | 2000 (Ending One)
  // time: 'day'|'overcast'|'dusk'|'night'|'late'|'dawn' · season: 'summer'|'autumn'|'winter'|'spring'
  // van: bool | (G)=>bool (Pike's gray panel van across from 412, 1996) · wagon: Teddy's maroon wagon (1994 default true)
  // poster: what tops the poster wall: 'fight' (1994 default) | 'layers' (1996: three layers over his) | 'champion' (Ending One) | 'june' (Ending Two flyer)
  P.kesslerAve = function (o) {
    o = Object.assign({ year: 1996 }, o);
    const yr = +o.year, season = seasonOf(o), A = outdoor(o, { time: yr === 1994 ? 'dusk' : yr === 1996 ? 'overcast' : 'day', season });
    const winter = season === 'winter', y94 = yr === 1994;
    const gym = y94
      ? { t: 'building', id: 'kes_gym', x: KX.gym, w: 540, h: 220, style: 'brick_dark', floors: 3, windows: { cols: 8, lit: A.lit, seed: 41 },
        shop: { sign: 'MARSH BOXING CLUB · EST. 1971', color: '#6a2a24', window: 'lit', interior: 'gym' }, door: { dx: 220, kind: 'wood', label: 'CLOSED TONIGHT' } }
      : { t: 'building', id: 'kes_gym', x: KX.gym, w: 540, h: 220, style: 'concrete', floors: 3, windows: { cols: 8, lit: A.lit, seed: 41 },
        shop: { sign: 'IRON PULSE FITNESS', color: '#5a4a62', window: o.time === 'late' ? 'dark' : 'lit', interior: 'gym', neon: true }, door: { dx: 220, kind: 'glass' } };
    const L = base({
      name: 'Kessler Avenue', area: 'Eastgate', kind: 'exterior', w: 2400, map: 'map_eastgate',
      sky: A.sky, backdrop: 'rowhouses+skyline', weather: A.weather, wet: A.wet, groundStyle: 'street',
      ambient: A.ambient, sound: { loop: winter ? 'wind' : 'city', vol: 0.45 },
      layers: {
        far: [
          { t: 'smokestack', x: 380, h: 150, smoke: false },
          { t: 'bridge', x: 1700, w: 700 },
          // Ashgrove Tower: a crane-topped steel skeleton in 1994, finished and lit from 1996.
          y94 ? { t: 'scaffold', id: 'kes_tower', x: 1180, w: 46, h: 250, y: 300 }
            : { t: 'building', id: 'kes_tower', x: 1180, w: 46, h: 270, style: 'concrete', floors: 12, windows: { cols: 2, lit: 0.7, seed: 77 }, cornice: false },
        ],
        mid: [{ t: 'wires', x0: 0, x1: 2400, y: 118, sag: 16 }],
        back: [
          // Kessler & 5th
          { t: 'bus_stop', id: 'kes_bus', x: KX.busStop, sign: yr === 1996 ? '14 · LAST BUS 10:50' : '14 KESSLER–CIVIC CTR', shelter: !y94 },
          { t: 'payphone', x: KX.payphone }, { t: 'hydrant', x: KX.hydrant, color: winter ? '#7a3a32' : '#a8462e' },
          { t: 'wall', id: 'kes_poster_wall', x: KX.posterWall - 28, w: 60, h: 92, style: 'brick', posters: [] },
          { t: 'poster', id: 'kes_poster_fight', x: KX.posterWall - 22, y: 222, kind: 'jin_fight', when: whenOf(y94 || o.poster === 'fight') },
          { t: 'poster', id: 'kes_poster_fight2', x: KX.posterWall + 4, y: 226, kind: 'jin_fight', when: whenOf(y94) },
          { t: 'poster', id: 'kes_poster_layers', x: KX.posterWall - 20, y: 220, kind: 'ad', text: 'IRON PULSE', torn: true, when: whenOf(!y94 && (o.poster || 'layers') === 'layers') },
          { t: 'poster', id: 'kes_poster_champ', x: KX.posterWall - 22, y: 216, kind: 'boxing', text: 'THE CHAMPION', when: whenOf(o.poster === 'champion') },
          { t: 'flyer', id: 'kes_poster_june', x: KX.posterWall + 2, y: 238, text: 'DO NOT SIGN ANYTHING', when: whenOf(o.poster === 'june') },
          { t: 'notice', x: KX.posterWall + 10, y: 250, lines: y94 ? ['BAKE SALE', 'ST. COLUMBA'] : ['SERVICE', 'REDUCED'] },
          // Han's Market and Sunny's
          { t: 'building', id: 'kes_hans', x: KX.hans, w: 170, h: 200, style: 'brick', floors: 3, windows: { cols: 4, lit: A.lit, seed: 12 },
            shop: { sign: "HAN'S MARKET", color: '#3f5a3a', awning: '#3f6a44', window: 'lit', interior: 'store' }, door: { dx: 112 } },
          { t: 'sign', id: 'kes_gojin', x: KX.hans + 20, y: 238, text: "GO JIN! EASTGATE'S OWN", color: '#d8c49a', textColor: '#7a2c2a', w: 80, when: whenOf(y94) },
          { t: 'crates', x: KX.hans + 30, n: 3, stack: 1, when: whenOf(!winter) },
          { t: 'building', id: 'kes_sunnys', x: KX.sunnys, w: 188, h: 210, style: 'brick_red', floors: 3, windows: { cols: 4, lit: A.lit, seed: 14 },
            shop: { sign: "SUNNY'S DINER", color: '#7a2c2a', awning: '#8a3a30', window: 'lit', interior: 'diner' }, door: { dx: 24 } },
          { t: 'sign', x: KX.sunnys + 150, y: 196, text: 'EAT', neon: true, color: '#d8402f', w: 26 },
          // 412 Kessler
          { t: 'building', id: 'kes_412', x: KX.k412, w: 580, h: 250, style: 'brick', floors: 4, windows: { cols: 10, lit: A.lit, seed: 23, ac: y94 ? 0.3 : 0.08 },
            fireEscape: 7, roof: { tank: true, antenna: true }, door: { dx: 270, kind: 'wood', label: '412' } },
          { t: 'stoop', x: KX.stoop, w: 42, steps: 3, plant: y94 },
          { t: 'planter', id: 'kes_geranium', x: KX.geranium, w: 10, flowers: !winter && yr !== 1996 },
          { t: 'chair', id: 'kes_lawnchair', x: KX.lawnChair, kind: 'folding', when: whenOf(!y94) },
          // Pratt Alley mouth (closed in 1994)
          { t: 'alley_gap', x: KX.alley - 30, w: 60, light: !y94 },
          { t: 'gate', id: 'kes_alley_gate', x: KX.alley - 22, w: 44, kind: 'iron', open: false, when: whenOf(y94) },
          // Marsh Boxing Club (1994) / Iron Pulse Fitness (1996 on)
          gym,
          { t: 'banner', id: 'kes_banner', x: KX.gym + 150, y: 120, w: 150, text: y94 ? 'GOOD LUCK JIN!!' : 'JOIN NOW · NO INITIATION FEE', color: y94 ? '#d8d0bc' : '#3a6a7a' },
          { t: 'sign', id: 'kes_old_glove', x: KX.gym + 330, y: 112, text: y94 ? 'MARSH B.C.' : 'M  B C', color: y94 ? '#8a2a24' : '#7a7a7e', w: 64 },
          { t: 'door', id: 'kes_side_door', x: KX.gymSide, kind: 'metal', color: '#4a4f52', label: 'STAFF', when: whenOf(!y94) },
          // toward the river
          { t: 'wall', x: KX.river, w: 600, h: 36, style: 'concrete' },
          { t: 'trashbags', x: 1840, n: 3 }, { t: 'newspapers', x: 2010 },
          { t: 'tree', x: 2240, kind: winter || season === 'autumn' ? 'bare' : 'leafy' },
        ].concat(KX.lamps.map((x, i) => ({ t: 'streetlight', x, on: A.lamps, flicker: i === 3 && !y94 ? 0.35 : 0 }))),
        front: [
          { t: 'car', id: 'kes_wagon', x: KX.wagon, kind: 'wagon', color: '#5a2a2a', face: -1, when: whenOf(o.wagon !== undefined ? o.wagon : y94) },
          { t: 'car', id: 'kes_snowcar', x: KX.wagon, kind: 'sedan', color: '#5a5e62', face: -1, when: whenOf(!y94 && winter) },
          { t: 'car', id: 'kes_van', x: KX.van, kind: 'van', color: '#5e6266', face: 1, when: whenOf(o.van === undefined ? false : o.van) },
          { t: 'puddle', x: 560, w: 50, when: whenOf(A.wet || winter) }, { t: 'puddle', x: 1400, w: 70, when: whenOf(A.wet || winter) },
        ],
      },
      points: { start: { x: KX.busStop + 40, y: 300 }, arrive: { x: KX.busStop + 40, y: 300 } },
    });
    // Doors: per year the bible's targets; others are placeholders with Jin's reason.
    const stairsId = y94 ? 'kessler_412_stairs_1994' : 'kessler_412_stairs_1996';
    L.doors.push(
      door({ id: 'kes_412', x: KX.door412, label: '412 Kessler', tx: ST4.street, ty: ST4.lobbyY, face: 1 }, yr === 2000 ? null : stairsId, 'Not now.'),
      door({ id: 'kes_sunnys', x: KX.sunnysDoor, label: "Sunny's", tx: 40, face: 1 }, y94 ? null : 'sunnys', 'Not now. Home first.'),
      door({ id: 'kes_alley', x: KX.alley, label: 'Pratt Alley', kind: 'door' }, yr === 1996 ? 'pratt_alley' : null, y94 ? "Home by five. Teddy's orders." : 'Not now.'),
      door({ id: 'kes_gym', x: KX.gymDoor, label: y94 ? 'Marsh Boxing Club' : 'Iron Pulse Fitness', tx: 40, face: 1 },
        y94 || yr === 2000 ? null : 'iron_pulse', y94 ? "CLOSED TONIGHT — WE'RE AT THE CIVIC! — T.M." : 'Not now.'),
    );
    if (!y94 && yr !== 2000) L.doors.push({ id: 'kes_gym_side', x: KX.gymSide, label: 'Side door', verb: 'Enter', kind: 'door', to: 'iron_pulse_backroom', tx: 440, face: -1 });
    if (y94) L.doors.push(closed({ id: 'kes_left', x: 0, side: 'left', kind: 'edge', auto: true, label: 'Kessler & 5th' }, "Home by five. Teddy's orders."));
    if (yr === 1996) L.doors.push({ id: 'kes_right', x: 2400, side: 'right', kind: 'edge', auto: true, label: 'Front Street', to: 'ymca_312', tx: 40, face: 1 });
    // The red-kettle volunteer outside Han's (December only).
    if (winter && yr === 1996) L.npcs.push(resident('kettle', KX.kettle, { name: 'Kettle volunteer', fallback: 'woman', face: 1, pose: 'idle',
      barks: ['Merry Christmas.', 'Anything helps.'], barkRadius: 60 }));
    L.lights.push({ x: KX.sunnys + 90, y: 250, r: 90, color: '#e8b35a', k: 0.45 });
    return finish(L, o);
  };

  const ST4 = {  // 412 Kessler stairwell: 320 x 720, three levels
    street: 36, mailbox: 98, lobbyY: 680, l2Y: 500, l3Y: 320,
    f1: { from: { x: 150, y: 680 }, to: { x: 288, y: 500 } }, f2: { from: { x: 250, y: 500 }, to: { x: 128, y: 320 } },
    bulb: 160, mitten: 70, door3a: 40, door3b: 276,
  };
  // year: 1994 | 1996 (also Ch6/Ch9: the bible keeps the 1996 id) · novak: 3B decorated by the Novaks (default year ≥ 1996)
  P.kessler412Stairs = function (o) {
    o = Object.assign({ year: 1996 }, o);
    const yr = +o.year, y94 = yr === 1994, season = seasonOf(o);
    const L = base({
      name: '412 Kessler — stairwell', area: 'Eastgate', kind: 'interior', w: 320, h: 720, ground: ST4.lobbyY, map: 'map_eastgate',
      room: { wall: '#5a4a3e', wall2: '#3e342e', floor: '#4a4440', pattern: 'plaster', floorPattern: 'tile', ceiling: 220, trim: '#6a5644', wainscot: 30 },
      ambient: indoor(o, y94 ? 0.24 : 0.34), sound: { loop: 'room', vol: 0.3 },
      camera: { zoom: 1 },
      layers: {
        back: [
          { t: 'door', x: ST4.street, y: ST4.lobbyY, kind: 'wood', color: '#5a3a28', label: '412' },
          { t: 'picture', id: 'st4_mailboxes', x: ST4.mailbox - 13, y: ST4.lobbyY - 44, w: 26, h: 16, kind: 'frame' },
          { t: 'ceiling_light', x: 90, y: 560, kind: 'bulb' },
          { t: 'rug', x: 14, w: 50, y: ST4.lobbyY, color: '#4a3a30' },
          // landing 2: a bulb that flickers (1994), a child's mitten (1996)
          { t: 'lamp', x: ST4.bulb, y: 400, kind: 'bulb', flicker: y94 ? 0.6 : 0.2 },
          { t: 'window', x: 40, y: 420, w: 26, h: 34, lit: false, curtains: false },
          // landing 3: 3A (Mrs. Okafor) and 3B
          { t: 'door', id: 'st4_3a_door', x: ST4.door3a, y: ST4.l3Y, kind: 'wood', color: '#4a3a2a', label: '3A' },
          { t: 'plant', id: 'st4_wreath', x: ST4.door3a, y: ST4.l3Y - 40, kind: 'fern', when: whenOf(true) },
          { t: 'rug', id: 'st4_bless_mat', x: ST4.door3a - 12, w: 24, y: ST4.l3Y, color: '#6a5a3a' },
          { t: 'door', id: 'st4_3b_door', x: ST4.door3b, y: ST4.l3Y, kind: 'wood', color: '#5a4030', label: '3B' },
          { t: 'rug', id: 'st4_welcome_mat', x: ST4.door3b - 12, w: 24, y: ST4.l3Y, color: '#5a4a34' },
          { t: 'poster', id: 'st4_skeleton', x: ST4.door3b - 8, y: ST4.l3Y - 46, kind: 'notice', text: 'BOO', when: whenOf(!y94 && season === 'winter' && yr === 1996) },
          { t: 'lamp', x: 200, y: 230, kind: 'bulb' },
        ],
      },
      solids: [
        { x: 0, y: ST4.l2Y, w: 320, oneway: true, style: 'wood' },
        { x: 0, y: ST4.l3Y, w: 320, oneway: true, style: 'wood' },
      ],
      points: { start: { x: 60, y: ST4.lobbyY }, lobby: { x: 60, y: ST4.lobbyY }, landing2: { x: 120, y: ST4.l2Y }, landing3: { x: 180, y: ST4.l3Y } },
    });
    addFlight(L, stairs({ id: 'st4_f1', from: ST4.f1.from, to: ST4.f1.to, up: 'Up — 2nd floor', down: 'Down — lobby' }));
    addFlight(L, stairs({ id: 'st4_f2', from: ST4.f2.from, to: ST4.f2.to, up: 'Up — 3rd floor', down: 'Down — 2nd floor' }));
    const kes = y94 ? 'kessler_ave_1994' : 'kessler_ave_1996';
    L.doors.push(
      { id: 'st4_street', x: ST4.street, y: ST4.lobbyY, label: 'Kessler Avenue', verb: 'Leave', kind: 'door', to: kes, tx: KX.door412, face: 1 },
      door({ id: 'st4_3a', x: ST4.door3a, y: ST4.l3Y, label: '3A — Okafor', tx: OK3A.door - 20, face: -1 }, y94 ? null : 'okafor_3a', "Mrs. Okafor's door."),
      door({ id: 'st4_3b', x: ST4.door3b, y: ST4.l3Y, label: '3B', tx: 1080, face: -1 }, y94 ? 'apt_3b_1994' : null, 'Somebody else lives here now.'),
    );
    return finish(L, o);
  };

  const OK3A = { door: 600, sofa: 470, calendar: 420, radiator: 352, table: 214, kettle: 150, photos: 96, photoUmma: 80, photoWalkout: 128, window: 300 };
  // Mrs. Okafor's apartment (Ch2, Ch6 side, Ch9). year 1996 | 1997 · time · tv: true (Ch9: her TV)
  P.okafor3a = function (o) {
    o = Object.assign({ year: 1996 }, o);
    const L = base({
      name: "Mrs. Okafor's apartment", area: 'Eastgate', kind: 'interior', w: 640, map: 'map_eastgate',
      room: { wall: '#6a5a48', wall2: '#4a3e34', floor: '#5a4636', pattern: 'wallpaper', floorPattern: 'wood', ceiling: 64, trim: '#7a6248', wainscot: 34 },
      ambient: indoor(o, 0.2), sound: { loop: 'room', vol: 0.3 },
      layers: {
        back: [
          { t: 'door', x: OK3A.door, kind: 'wood', color: '#4a3a2a' },
          { t: 'sofa', id: 'ok_sofa', x: OK3A.sofa - 30, w: 60, color: '#7a6a5a', blanket: true },
          { t: 'picture', id: 'ok_calendar', x: OK3A.calendar, y: 150, kind: 'calendar' },
          { t: 'pipes', id: 'ok_radiator', x: OK3A.radiator - 14, w: 28, y: 270 },
          { t: 'window', x: OK3A.window - 22, y: 120, w: 44, h: 60, lit: false, curtains: true, plant: true },
          { t: 'table', id: 'ok_table', x: OK3A.table - 22, w: 44, kind: 'kitchen' },
          { t: 'chair', x: OK3A.table - 30, kind: 'wood', face: 1 }, { t: 'chair', x: OK3A.table + 30, kind: 'wood', face: -1 },
          { t: 'stove', x: OK3A.kettle }, { t: 'counter', x: 40, w: 70 }, { t: 'sink', x: 70 },
          { t: 'radio', x: OK3A.table + 6, y: 262 },
          { t: 'picture', id: 'ok_photo_umma', x: OK3A.photoUmma - 6, y: 128, w: 12, h: 10, kind: 'photo' },
          { t: 'picture', id: 'ok_photo_walkout', x: OK3A.photoWalkout - 6, y: 122, w: 12, h: 12, kind: 'photo' },
          { t: 'picture', x: OK3A.photos - 4, y: 144, w: 10, h: 8, kind: 'photo' },
          { t: 'lamp', x: OK3A.sofa + 44, kind: 'floor' },
          { t: 'tv', id: 'ok_tv', x: OK3A.sofa - 60, on: true, content: 'news', when: whenOf(o.tv) },
          { t: 'clock', x: 520, y: 110 },
        ],
      },
      points: { start: { x: OK3A.door - 30, y: 300 }, sofa: { x: OK3A.sofa, y: 300 } },
    });
    L.doors.push({ id: 'ok_door', x: OK3A.door, label: 'Stairwell', verb: 'Leave', kind: 'door', to: 'kessler_412_stairs_1996', tx: ST4.door3a, ty: ST4.l3Y, face: 1 });
    L.npcs.push(resident('okafor', OK3A.sofa, { name: 'Mrs. Okafor', fallback: 'old_woman', pose: 'sit', face: -1 }));
    return finish(L, o);
  };

  const SUN = { door: 40, counter: 130, stools: [150, 190, 230, 270, 310, 350], rita: 260, urn: 380, booth: 560, table: 560, tv: 690, pass: 830, augie: 840 };
  // Sunny's Diner (Ch2, Ch6, Ch8 rest card, Ch9, Ch10). year 1996 (tinsel) | 1997 | 2000 · tv: 'boxing'|'news'|'static'|false · time
  P.sunnys = function (o) {
    o = Object.assign({ year: 1996, tv: 'boxing' }, o);
    const yr = +o.year, dec = yr === 1996 && seasonOf(o) === 'winter';
    const L = base({
      name: "Sunny's Diner", area: 'Eastgate', kind: 'interior', w: 960, map: 'map_eastgate',
      room: { wall: '#7a5a40', wall2: '#5a3a30', floor: '#5a4a46', pattern: 'paneling', floorPattern: 'tile', ceiling: 66, trim: '#a88a5a', wainscot: 40 },
      ambient: Object.assign(indoor(o, 0.14), { tint: '#3a2a24' }), sound: { loop: 'room', vol: 0.35 },
      layers: {
        back: [
          { t: 'door', x: SUN.door, kind: 'glass', color: '#5a3a28', lit: true },
          { t: 'counter', id: 'sun_counter', x: SUN.counter, w: 290, color: '#8a4a3a' },
          { t: 'sign', x: 200, y: 92, text: dec ? 'PIE $1.50 · MERRY XMAS' : 'PIE $1.50', color: '#e2d6b4', textColor: '#7a2c2a', w: 90 },
          { t: 'shelf', x: 150, w: 120, h: 30, items: 'cans', y: 200 },
          { t: 'window', id: 'sun_window', x: 486, y: 104, w: 140, h: 84, lit: false, curtains: false, frame: '#8a6a4a' },
          { t: 'table', id: 'sun_booth', x: SUN.table - 20, w: 40, kind: 'diner' },
          { t: 'sofa', x: SUN.table - 58, w: 30, color: '#8a2a24' }, { t: 'sofa', x: SUN.table + 28, w: 30, color: '#8a2a24' },
          { t: 'table', x: 680, w: 40, kind: 'diner' }, { t: 'sofa', x: 642, w: 30, color: '#8a2a24' },
          { t: 'tv', id: 'sun_tv', x: SUN.tv + 60, y: 96, mount: true, on: !!o.tv, content: o.tv || 'static', when: whenOf(o.tv !== false) },
          { t: 'wall', id: 'sun_pass', x: 760, w: 140, h: 70, style: 'concrete' },
          { t: 'stove', x: 800 }, { t: 'counter', x: 850, w: 60 },
          { t: 'clock', x: 450, y: 90 },
          { t: 'banner', id: 'sun_tinsel', x: 120, y: 74, w: 300, text: '', color: '#8a8a6a', when: whenOf(dec) },
        ].concat(SUN.stools.map((x) => ({ t: 'chair', x, kind: 'stool' }))),
        front: [{ t: 'ceiling_light', x: 220, kind: 'pendant' }, { t: 'ceiling_light', x: 560, kind: 'pendant' }],
      },
      lights: [{ x: SUN.booth, y: 200, r: 110, color: '#e8b35a', k: 0.5 }],
      points: { start: { x: 70, y: 300 }, booth: { x: SUN.booth, y: 300 } },
    });
    L.doors.push({ id: 'sun_door', x: SUN.door, label: 'Kessler Avenue', verb: 'Leave', kind: 'door', to: 'kessler_ave_1996', tx: KX.sunnysDoor, face: 1 });
    L.npcs.push(
      resident('rita', SUN.rita, { name: 'Rita', fallback: 'woman', pose: 'work', face: 1, idles: ['work', 'idle', 'work', 'drink'],
        barks: yr === 1996 ? ["Pie's from yesterday. Still pie."] : ['More coffee?'] }),
      resident('augie', SUN.augie, { name: 'Augie', fallback: 'worker', pose: 'work', face: -1 }),
    );
    return finish(L, o);
  };

  const IP = { door: 40, desk: 110, receptionist: 120, machines: 230, glass: 480, ring: 760, ringW: 300, oldPaint: 860, staff: 1150, teddyMop: 600 };
  // Iron Pulse Fitness (Ch2–Ch4, Ch8–Ch10). after9: front dark, desk empty (only the back room lit) · year
  P.ironPulse = function (o) {
    o = Object.assign({ year: 1996 }, o);
    const late = !!o.after9;
    const L = base({
      name: 'Iron Pulse Fitness', area: 'Eastgate', kind: 'interior', w: 1200, map: 'map_eastgate',
      room: { wall: '#6a6a72', wall2: '#4a4a52', floor: '#6a5440', pattern: 'plaster', floorPattern: 'wood', ceiling: 60, trim: '#8a8a92' },
      ambient: late ? { dark: 0.62, tint: '#1e2234', fog: 0.02 } : indoor(o, 0.12), sound: { loop: late ? 'hum' : 'room', vol: 0.3 },
      layers: {
        back: [
          { t: 'door', x: IP.door, kind: 'glass', color: '#4a4a52', lit: !late },
          { t: 'desk', id: 'ip_desk', x: IP.desk - 30, w: 64, kind: 'reception' },
          { t: 'sign', x: IP.desk - 20, y: 120, text: 'IRON PULSE', neon: !late, color: '#c84a8a', w: 70 },
          { t: 'bench', x: IP.machines, kind: 'gym' }, { t: 'bench', x: IP.machines + 70, kind: 'gym' },
          { t: 'shelf', x: IP.machines + 120, w: 60, h: 40, items: 'tools' }, { t: 'vending', x: 430 },
          { t: 'glass_wall', id: 'ip_glass', x: IP.glass, w: 220 },
          { t: 'mirror', x: 590, y: 160, w: 90, h: 70 },
          { t: 'rug', id: 'ip_ring_floor', x: IP.ring, w: IP.ringW, color: '#9a7a50' },
          { t: 'sign', id: 'ip_old_paint', x: IP.oldPaint, y: 108, text: 'HANDS UP / CHIN', color: '#6e6c70', textColor: '#8a8890', w: 110 },
          { t: 'door', x: IP.staff, kind: 'wood', color: '#4a4440', label: 'STAFF' },
        ],
        front: [
          { t: 'ceiling_light', x: 200, kind: 'fluorescent', on: !late }, { t: 'ceiling_light', x: 600, kind: 'fluorescent', on: !late },
          { t: 'ceiling_light', x: 900, kind: 'fluorescent', on: !late, flicker: 0.15 },
        ],
      },
      points: { start: { x: 70, y: 300 }, ring: { x: IP.ring + IP.ringW / 2, y: 300 }, mop: { x: IP.teddyMop, y: 300 } },
    });
    L.doors.push(
      door({ id: 'ip_front', x: IP.door, label: 'Kessler Avenue', verb: 'Leave', tx: KX.gymDoor, face: 1 }, late ? null : 'kessler_ave_1996', 'Locked for the night. The side door is in the back room.'),
      { id: 'ip_staff', x: IP.staff, label: 'Back room', verb: 'Enter', kind: 'door', to: 'iron_pulse_backroom', tx: 40, face: 1 },
    );
    if (!late) L.npcs.push(resident('receptionist', IP.receptionist, { name: 'Receptionist', fallback: 'woman', pose: 'idle', face: 1,
      barks: ['Membership\'s nineteen a month.', 'We close at nine.'] }));
    return finish(L, o);
  };

  const IPB = { staff: 30, cot: 92, hotplate: 160, bag: 262, mirror: 330, bench: 380, locker: 420, box: 420, side: 450 };
  // Teddy's back room (Ch2, Ch3–4 mitts, Ch7–9 base/visit, Ending Two). time
  P.ironPulseBackroom = function (o) {
    o = Object.assign({}, o);
    const L = base({
      name: 'Iron Pulse — back room', area: 'Eastgate', kind: 'interior', w: 480, map: 'map_eastgate',
      room: { wall: '#5a5048', wall2: '#3e3832', floor: '#4a4038', pattern: 'brick', floorPattern: 'wood', ceiling: 70, trim: '#6a5a48' },
      ambient: Object.assign(indoor(o, 0.36), { tint: '#2a2420' }), sound: { loop: 'hum', vol: 0.25 },
      layers: {
        back: [
          { t: 'door', x: IPB.staff, kind: 'wood', color: '#4a4440', label: 'STAFF' },
          { t: 'bed', id: 'ipb_cot', x: IPB.cot, kind: 'cot', face: -1 },
          { t: 'counter', id: 'ipb_hotplate', x: IPB.hotplate - 14, w: 30 },
          { t: 'pipes', x: IPB.bag - 60, w: 120, y: 74 },
          { t: 'heavy_bag', id: 'ipb_bag', x: IPB.bag },
          { t: 'mirror', id: 'ipb_mirror', x: IPB.mirror, y: 200, w: 22, h: 34, cracked: true },
          { t: 'bench', id: 'ipb_bench', x: IPB.bench - 17, kind: 'gym' },
          { t: 'locker', id: 'ipb_locker', x: IPB.locker, n: 1 },
          { t: 'boxes', id: 'ipb_seo_box', x: IPB.box, n: 1, label: 'SEO', y: 236 },
          { t: 'door', x: IPB.side, kind: 'metal', color: '#4a4f52' },
          { t: 'lamp', x: IPB.cot + 20, y: 150, kind: 'bulb' },
        ],
      },
      training: { bag: { x: IPB.bag } },
      points: { start: { x: 60, y: 300 }, cot: { x: IPB.cot, y: 300 }, bag: { x: IPB.bag, y: 300 } },
    });
    L.doors.push(
      { id: 'ipb_staff', x: IPB.staff, label: 'The gym', verb: 'Enter', kind: 'door', to: 'iron_pulse', tx: IP.staff - 20, face: -1 },
      { id: 'ipb_side', x: IPB.side, label: 'Kessler Avenue', verb: 'Leave', kind: 'door', to: 'kessler_ave_1996', tx: KX.gymSide, face: -1 },
    );
    return finish(L, o);
  };

  const YM = { front: 30, desk: 110, otis: 118, payphone: 190, cork: 240, clock: 300, stairs: 470, roomDoor: 540, cot: 650, wall: 650, chair: 730, bible: 730, window: 800, radiator: 870 };
  // Calder YMCA, Front Street: lobby and Room 312 (Ch2–Ch4 base). time · wall: (G)=>bool show the evidence wall papers
  P.ymca312 = function (o) {
    o = Object.assign({}, o);
    const L = base({
      name: 'Calder YMCA — Room 312', area: 'Front Street', kind: 'interior', w: 900, map: 'map_front_street',
      room: { wall: '#5a5a52', wall2: '#40403a', floor: '#4a4844', pattern: 'paneling', floorPattern: 'tile', ceiling: 62, trim: '#6a6a60', wainscot: 36 },
      ambient: indoor(o, 0.3), sound: { loop: 'hum', vol: 0.25 },
      layers: {
        back: [
          { t: 'door', x: YM.front, kind: 'double', color: '#4a4436', label: 'YMCA' },
          { t: 'desk', id: 'ym_desk', x: YM.desk - 32, w: 64, kind: 'reception' },
          { t: 'radio', x: YM.desk + 14, y: 262 },
          { t: 'phone_wall', id: 'ym_payphone', x: YM.payphone, y: 220 },
          { t: 'bulletin_board', id: 'ym_cork', x: YM.cork - 20, y: 170, w: 40, h: 30 },
          { t: 'clock', x: YM.clock, y: 120 },
          { t: 'stairs_interior', x: YM.stairs - 40, w: 60, h: 60, dir: 1 },
          { t: 'door', x: YM.roomDoor, kind: 'wood', color: '#5a4a3a', open: true, label: '312' },
          { t: 'bed', id: 'ym_cot', x: YM.cot, kind: 'cot', face: -1 },
          { t: 'bulletin_board', id: 'ym_evidence_wall', x: YM.wall - 46, y: 150, w: 92, h: 56 },
          { t: 'chair', id: 'ym_chair', x: YM.chair, kind: 'wood', face: -1 },
          { t: 'window_city', id: 'ym_window', x: YM.window - 34, y: 110, w: 68, h: 70, view: 'river' },
          { t: 'pipes', id: 'ym_radiator', x: YM.radiator - 14, w: 28, y: 272 },
          { t: 'lamp', x: YM.cot + 40, y: 120, kind: 'bulb' },
        ],
        front: [{ t: 'ceiling_light', x: 140, kind: 'fluorescent', flicker: 0.1 }],
      },
      points: { start: { x: 60, y: 300 }, room: { x: YM.cot + 30, y: 300 } },
    });
    L.doors.push(closed({ id: 'ym_front', x: YM.front, label: 'Front Street', verb: 'Leave' }, 'Front Street. The bus stops out front. (Map)'));
    L.npcs.push(resident('otis', YM.otis, { name: 'Otis', fallback: 'old_man', pose: 'sit', face: 1 }));
    return finish(L, o);
  };

  /* ── 5. Calder Civic Arena: outside, the corridor, Locker Room B, the bowl ── */

  const CX = { front: 330, marquee: 330, boxOffice: 620, payphone: 660, lot: 760, loftsSign: 860, wagon: 1010, dock: 1270 };
  // Outside the arena (Ch8 farewell night; Ending One with `lofts: true`). year 1994 | 1997 · time · lofts
  P.civicExterior = function (o) {
    o = Object.assign({ year: 1997, time: 'night' }, o);
    const y97 = +o.year !== 1994, A = outdoor(o, { time: 'night', season: seasonOf(o) });
    const L = base({
      name: 'Calder Civic Arena', area: 'Riverfront', kind: 'exterior', w: 1400, map: 'map_civic',
      sky: A.sky, backdrop: 'river+towers', weather: A.weather, wet: A.wet, groundStyle: 'sidewalk', ambient: A.ambient,
      sound: { loop: 'wind', vol: 0.4 },
      layers: {
        far: [{ t: 'smokestack', x: 260, h: 130, smoke: false }],
        back: [
          { t: 'building', id: 'cx_arena', x: 60, w: 560, h: 230, style: 'stone', floors: 2, windows: { cols: 9, lit: o.lofts ? 0.6 : 0.1, seed: 61 }, cornice: true,
            shop: { sign: o.lofts ? 'RIVERSIDE LOFTS' : 'CALDER CIVIC ARENA', color: o.lofts ? '#4a5a6a' : '#5a3a30', window: o.lofts ? 'lit' : 'dark' }, door: { dx: 260, kind: 'double' } },
          { t: 'sign', id: 'cx_marquee', x: CX.marquee - 90, y: 160, w: 180, neon: true, color: '#e8c272',
            text: o.lofts ? 'NOW LEASING' : y97 ? 'THANK YOU CALDER — 1961–1997' : 'TONIGHT: CASTELL vs SEO' },
          { t: 'building', x: CX.boxOffice - 30, w: 60, h: 80, style: 'stone', floors: 1, windows: { cols: 1, lit: 0.6, seed: 63 }, cornice: false },
          { t: 'payphone', x: CX.payphone },
          { t: 'fence', id: 'cx_fence', x: 720, w: 420, kind: 'chain', when: whenOf(y97 && !o.lofts) },
          { t: 'billboard', id: 'cx_lofts_sign', x: CX.loftsSign - 70, y: 180, w: 160, text: 'COMING 1998: RIVERSIDE LOFTS', sub: 'An Ashgrove Capital development', lit: true, when: whenOf(y97 && !o.lofts) },
          { t: 'building', x: 1160, w: 240, h: 170, style: 'concrete', floors: 2, windows: { cols: 3, lit: 0.05, seed: 64 }, cornice: false },
          { t: 'loading_dock', x: 1210, w: 120 },
          { t: 'roll_door', id: 'cx_dock_door', x: CX.dock - 40, w: 80, open: y97, lit: y97 },
          { t: 'sign', x: CX.dock - 50, y: 214, text: 'DOCK B — NO PUBLIC ACCESS', color: '#c8b070', textColor: '#2a2a2e', w: 100 },
          { t: 'streetlight', x: 700, on: A.lamps }, { t: 'streetlight', x: 1120, on: A.lamps, flicker: 0.2 },
        ],
        front: [
          { t: 'car', id: 'cx_morty_wagon', x: CX.wagon, kind: 'wagon', color: '#6a4a30', face: -1, when: whenOf(y97 && !o.lofts) },
          { t: 'car', x: 780, kind: 'sedan', face: 1, when: whenOf(!o.lofts) },
        ],
      },
      points: { start: { x: 420, y: 300 }, arrive: { x: 420, y: 300 }, dock: { x: CX.dock, y: 300 } },
    });
    L.doors.push(
      closed({ id: 'cx_front', x: CX.front, label: o.lofts ? 'Riverside Lofts' : 'Main doors' }, o.lofts ? 'Residents only.' : y97 ? 'Locked. The farewell crowd went out this way.' : 'Not the front. Fighters use the dock.'),
      door({ id: 'cx_dock', x: CX.dock, label: 'Dock B', tx: 90, face: 1 }, o.lofts ? null : y97 ? 'civic_backstage_1997' : 'civic_backstage_1994', 'Dock B. No public access.'),
    );
    return finish(L, o);
  };

  const CB = { dock: 70, posters: [200, 270, 340], poster1971: 340, table: 440, cart: 560, lockerA: 780, lockerB: 1060, tunnel: 1540 };
  // Service corridor (Ch0 1994, Ch8 1997: Ch0's geometry). year 1994 | 1997
  P.civicBackstage = function (o) {
    o = Object.assign({ year: 1994 }, o);
    const y97 = +o.year !== 1994;
    const L = base({
      name: 'Calder Civic Arena — service corridor', area: 'Riverfront', kind: 'interior', w: 1600, map: 'map_civic',
      room: { wall: '#6a6a62', wall2: '#4a4a44', floor: '#4a4a46', pattern: 'concrete', floorPattern: 'concrete', ceiling: 70, trim: '#8a8a7a', wainscot: 70 },
      ambient: { dark: y97 ? 0.5 : 0.28, tint: '#262a30', fog: 0.03 }, sound: { loop: y97 ? 'hum' : 'arena', vol: y97 ? 0.3 : 0.5 },
      layers: {
        back: [
          { t: 'roll_door', id: 'cb_dock_door', x: CB.dock - 40, w: 80, open: false },
          { t: 'sign', x: CB.dock - 46, y: 196, text: 'DOCK B — NO PUBLIC ACCESS', color: '#c8b070', textColor: '#2a2a2e', w: 92 },
          { t: 'poster', x: CB.posters[0], y: 200, kind: 'boxing' }, { t: 'poster', x: CB.posters[1], y: 204, kind: 'boxing', torn: y97 },
          { t: 'poster', id: 'cb_poster_1971', x: CB.poster1971, y: 198, kind: 'boxing', text: '1971' },
          { t: 'table', id: 'cb_commission', x: CB.table - 24, w: 48, kind: 'folding', when: whenOf(!y97) },
          { t: 'chair', x: CB.table + 30, kind: 'folding', when: whenOf(!y97) },
          { t: 'boxes', id: 'cb_commission_folded', x: CB.table, n: 2, label: 'COMMISSION', when: whenOf(y97) },
          { t: 'table', id: 'cb_hotdog', x: CB.cart - 20, w: 40, kind: 'cart', when: whenOf(y97) },
          { t: 'door', id: 'cb_lockerA_door', x: CB.lockerA, kind: 'metal', color: '#5a5a52', label: y97 ? 'A' : 'CASTELL' },
          { t: 'sign', id: 'cb_star', x: CB.lockerA - 8, y: 220, text: y97 ? '' : 'STAR', color: y97 ? '#6a6a62' : '#c9a13b', w: 16 },
          { t: 'door', id: 'cb_lockerB_door', x: CB.lockerB, kind: 'metal', color: '#5a5a52', label: y97 ? 'B' : 'SEO / MARSH' },
          { t: 'notice', id: 'cb_tape', x: CB.lockerB - 14, y: 224, lines: y97 ? [''] : ['NO PRESS'] },
          { t: 'door', id: 'cb_tunnel_door', x: CB.tunnel, kind: 'double', color: '#2a2a2e', open: true, lit: true },
          { t: 'pipes', x: 0, w: 1600, y: 80 },
        ],
        front: [0, 1, 2, 3, 4, 5, 6].map((i) => ({ t: 'ceiling_light', x: 120 + i * 230, kind: 'fluorescent', on: !y97 || i % 2 === 0, flicker: i === 4 ? 0.55 : 0 })),
      },
      points: { start: { x: 120, y: 300 }, lockerB: { x: CB.lockerB, y: 300 }, tunnel: { x: CB.tunnel - 40, y: 300 } },
    });
    L.doors.push(
      door({ id: 'cb_dock', x: CB.dock, label: 'Dock B', verb: 'Leave', tx: CX.dock, face: -1 }, y97 ? 'civic_exterior' : null, 'Dock B. No public access.'),
      closed({ id: 'cb_lockerA', x: CB.lockerA, label: y97 ? 'Locker Room A' : 'Locker Room A — Castell' }, y97 ? "Ray's room." : 'Castell\'s room. Music and laughing.'),
      { id: 'cb_lockerB', x: CB.lockerB, label: 'Locker Room B', verb: 'Enter', kind: 'door', to: 'civic_locker_b', tx: 50, face: 1 },
      Object.assign({ id: 'cb_tunnel', x: CB.tunnel, label: 'The tunnel', verb: 'Walk out', kind: 'door', to: y97 ? 'civic_ring_1997' : 'civic_ring_1994', tx: 60, face: 1 },
        y97 ? {} : { locked: () => 'Not yet. Teddy says walk out when they call you.' }),
    );
    return finish(L, o);
  };

  const LB = { door: 30, lockers: 80, bench: 110, table: 290, marks: [360, 392, 424, 456], bag: 530, mirror: 610, sink: 680, clock: 300 };
  // Locker Room B (Ch0, Ch8). year 1994 | 1997 (four dead bulbs; the tube still flickers every 7 s)
  P.civicLockerB = function (o) {
    o = Object.assign({ year: 1994 }, o);
    const y97 = +o.year !== 1994;
    const L = base({
      name: 'Locker Room B', area: 'Riverfront', kind: 'interior', w: 720, map: 'map_civic',
      room: { wall: '#5a6460', wall2: '#3e4642', floor: '#4a504c', pattern: 'tile', floorPattern: 'tile', ceiling: 66, trim: '#7a847e', wainscot: 60 },
      ambient: { dark: y97 ? 0.42 : 0.3, tint: '#22282a', fog: 0.02 }, sound: { loop: 'hum', vol: 0.35 },
      layers: {
        back: [
          { t: 'door', x: LB.door, kind: 'metal', color: '#5a5a52' },
          { t: 'locker', id: 'lb_lockers', x: LB.lockers, n: 6 },
          { t: 'bench', id: 'lb_bench', x: LB.bench, kind: 'wood', w: 70 },
          { t: 'table', id: 'lb_taping', x: LB.table - 24, w: 48, kind: 'wood' },
          { t: 'bucket', x: LB.table + 34 },
          { t: 'clock', x: LB.clock, y: 110 },
          { t: 'pipes', x: LB.bag - 50, w: 100, y: 72 },
          { t: 'heavy_bag', id: 'lb_bag', x: LB.bag },
          { t: 'mirror', id: 'lb_mirror', x: LB.mirror, y: 176, w: 40, h: 46 },
          { t: 'lamp', x: LB.mirror - 20, y: 168, kind: 'bulb', on: true }, { t: 'lamp', x: LB.mirror, y: 166, kind: 'bulb', on: !y97 },
          { t: 'lamp', x: LB.mirror + 20, y: 168, kind: 'bulb', on: !y97 },
          { t: 'sink', x: LB.sink },
        ].concat(LB.marks.map((x, i) => ({ t: 'mat', x, w: 14, y: 300, color: i % 2 ? '#c8c060' : '#d8d070' }))),
        front: [{ t: 'ceiling_light', id: 'lb_tube', x: 380, kind: 'fluorescent', flicker: 0.6 }],
      },
      training: { bag: { x: LB.bag }, footwork: { x: LB.marks[1] } },
      points: { start: { x: 60, y: 300 }, table: { x: LB.table, y: 300 }, bench: { x: LB.bench + 30, y: 300 }, mirror: { x: LB.mirror, y: 300 } },
    });
    L.doors.push({ id: 'lb_door', x: LB.door, label: 'Corridor', verb: 'Leave', kind: 'door', to: y97 ? 'civic_backstage_1997' : 'civic_backstage_1994', tx: CB.lockerB, face: 1 });
    return finish(L, o);
  };

  const CR = { tunnel: 40, ring0: 380, ring1: 900, blue: 400, red: 880, center: 640, bell: 336, press0: 940, press1: 1120, pressEnd: 1120, camera: 1190,
    rowF: { x: 360, y: 444 }, rowK: { x: 190, y: 352 }, floorY: 480 };
  // The bowl (Ch0 1994, Ch8 1997, Ending One's Ashgrove Center with variant 'center').
  // year 1994 | 1997 · crowd: 'full' | 'empty' (1997 default) · variant: 'civic' | 'center' (gold-and-white, every seat full)
  P.civicRing = function (o) {
    o = Object.assign({ year: 1994 }, o);
    const y97 = +o.year !== 1994, center = o.variant === 'center';
    const crowd = o.crowd || (y97 && !center ? 'empty' : 'full'), full = crowd === 'full';
    const corners = center ? ['#d8d0b0', '#c9a13b'] : ['#33507a', '#8a3a30'];
    const G0 = CR.floorY;
    const stands = [];
    // Three tiers behind the ring, rising (back layer: the room shell hides far/mid in interiors).
    for (const [y, rows, x0, w] of [[G0 - 10, 3, 40, 1200], [G0 - 46, 3, 20, 1240], [G0 - 92, 4, 0, 1280]]) {
      stands.push({ t: 'bleachers', x: x0, w, rows, y, crowd: full });
      if (full) stands.push({ t: 'crowd', x: x0, w, rows, y: y - 2, density: center ? 1 : 0.85, mood: o.mood || 'idle', dim: 0.34 });
    }
    const L = base({
      name: center ? 'Ashgrove Center' : 'Calder Civic Arena', area: 'Riverfront', kind: 'interior', w: 1280, h: 540, ground: G0, map: center ? 'map_riverfront' : 'map_civic',
      room: { wall: '#1e1824', wall2: '#16121a', floor: '#2a2430', pattern: 'concrete', floorPattern: 'concrete', ceiling: 40, trim: '#2e2836' },
      ambient: { dark: 0.66, tint: '#1a1420', fog: full ? 0.12 : 0.06 }, weather: full ? 'smoke' : 'dust', weatherAmount: full ? 0.35 : 0.2,
      sound: { loop: full ? 'crowd' : 'room', vol: full ? 0.6 : 0.25 },
      camera: { zoom: 1 },
      layers: {
        back: stands.concat([
          { t: 'door', x: CR.tunnel, kind: 'double', color: '#2a2a2e', open: true, lit: true },
          { t: 'ring', id: 'cr_ring_back', x: CR.ring0, w: CR.ring1 - CR.ring0, part: 'back', corners, ropes: 3, skirtText: center ? 'ASHGROVE' : 'CALDER' },
          { t: 'table', id: 'cr_bell_table', x: CR.bell - 18, w: 36, kind: 'folding' },
          { t: 'boxes', id: 'cr_auction_box', x: CR.bell + 26, n: 1, label: 'LOT 112', when: whenOf(y97 && !center) },
          { t: 'table', id: 'cr_press_row', x: CR.press0, w: CR.press1 - CR.press0, kind: 'folding' },
          { t: 'scaffold', id: 'cr_ch6_riser', x: CR.camera - 20, w: 40, h: 30 },
          { t: 'lamp', id: 'cr_light_stand', x: CR.press1 + 30, kind: 'floor', on: false, when: whenOf(y97 && !center) },
          { t: 'newspapers', id: 'cr_confetti', x: 520, n: 4, lift: false, when: whenOf(y97 && !center) },
          { t: 'banner', x: 440, y: 120, w: 400, text: center ? 'ASHGROVE CENTER' : y97 ? 'FAREWELL TO THE CIVIC · 1961–1997' : 'CASTELL vs SEO · CALDER CIVIC ARENA', color: center ? '#c9a13b' : '#5a2a2a' },
        ]),
        front: [
          { t: 'ring', id: 'cr_ring_front', x: CR.ring0, w: CR.ring1 - CR.ring0, part: 'front', corners, ropes: 3 },
          { t: 'stage_lights', id: 'cr_lamps', x: CR.ring0 + 30, w: CR.ring1 - CR.ring0 - 60, y: G0 - 210, n: 4, on: true, r: 280, width: 34, k: 0.95 },
        ],
      },
      points: { start: { x: 80, y: G0 }, blue: { x: CR.blue, y: G0 }, red: { x: CR.red, y: G0 }, center: { x: CR.center, y: G0 }, bell: { x: CR.bell, y: G0 },
        rowF: { x: CR.rowF.x, y: CR.rowF.y }, rowK: { x: CR.rowK.x, y: CR.rowK.y }, pressEnd: { x: CR.pressEnd, y: G0 } },
    });
    L.doors.push(door({ id: 'cr_tunnel', x: CR.tunnel, label: 'The tunnel', verb: 'Leave', tx: CB.tunnel - 30, face: -1 },
      center ? null : y97 ? 'civic_backstage_1997' : 'civic_backstage_1994', 'Not now.'));
    return finish(L, o);
  };

  /* ── 6. St. Agnes Long-Term Care (Ch1; Ch9 night corridor; Ending One's room 214) ── */

  const R214 = { door: 612, earlBed: 470, earlTable: 420, jinBed: 150, nameCard: 150, jinTable: 214, board: 560, closet: 586, window: 70 };
  // Room 214. year 1996 (Ch1) | 1997 (Ch9) | 2000 (Ending One) · time · earl: true (Earl in his bed; default year 1996)
  // board: lines for the whiteboard by the door (default Ch1, Oct 7) · iv: the IV stand by Jin's bed
  P.stagnesRoom214 = function (o) {
    o = Object.assign({ year: 1996, time: 'day' }, o);
    const night = o.time === 'night' || o.time === 'late';
    const L = base({
      name: 'St. Agnes — Room 214', area: 'Hillcrest', kind: 'interior', w: 640, map: 'map_hillcrest',
      room: { wall: '#8a9088', wall2: '#6a7068', floor: '#7a7a70', pattern: 'plaster', floorPattern: 'tile', ceiling: 60, trim: '#a8aca0', wainscot: 30 },
      ambient: night ? { dark: 0.66, tint: '#1a2230', fog: 0.02 } : indoor(o, 0.1), sound: { loop: 'hum', vol: 0.2 },
      layers: {
        back: [
          { t: 'window_city', id: 'r214_window', x: R214.window - 40, y: 100, w: 80, h: 80, view: night ? 'night' : 'day' },
          { t: 'bed', id: 'r214_jin_bed', x: R214.jinBed, kind: 'hospital', face: -1, chart: true },
          { t: 'picture', id: 'r214_name_card', x: R214.nameCard - 8, y: 170, w: 16, h: 6, kind: 'frame' },
          { t: 'table', id: 'r214_jin_table', x: R214.jinTable - 10, w: 20, kind: 'wood' },
          { t: 'iv_stand', x: R214.jinBed + 44, when: whenOf(o.iv) },
          { t: 'med_monitor', x: R214.jinBed - 40, y: 160, when: whenOf(o.iv) },
          { t: 'curtain', x: 300, w: 40, open: true },
          { t: 'bed', id: 'r214_earl_bed', x: R214.earlBed, kind: 'hospital', face: 1, chart: true },
          { t: 'table', id: 'r214_earl_table', x: R214.earlTable - 12, w: 24, kind: 'wood' },
          { t: 'radio', id: 'r214_radio', x: R214.earlTable, y: 270 },
          { t: 'picture', id: 'r214_rigging_photo', x: R214.earlTable - 8, y: 196, w: 16, h: 11, kind: 'photo' },
          { t: 'laundry_line', id: 'r214_cards', x0: R214.earlBed - 30, x1: R214.earlBed + 30, y: 170, sag: 4 },
          { t: 'chalkboard', id: 'r214_board', x: R214.board - 24, y: 130, w: 48, h: 34,
            lines: o.board || ['TODAY IS:', 'MON OCT 7', 'NURSE: DOLORES', 'THERAPIST: HANA'] },
          { t: 'door', x: R214.door, kind: 'wood', color: '#9a9a8a' },
          { t: 'ceiling_light', x: 320, kind: 'fluorescent', on: !night },
        ],
      },
      lights: night ? [{ x: R214.door, y: 296, r: 40, color: '#c8d0c8', k: 0.5 }, { x: R214.earlTable, y: 268, r: 26, color: '#e8b35a', k: 0.6 }] : [],
      points: { start: { x: R214.jinBed + 40, y: 300 }, jinBed: { x: R214.jinBed, y: 300 }, earlBed: { x: R214.earlBed, y: 300 }, door: { x: R214.door - 20, y: 300 } },
    });
    L.doors.push({ id: 'r214_door', x: R214.door, label: 'Corridor', verb: 'Leave', kind: 'door', to: 'stagnes_2west', tx: W2.r214, face: 1 });
    if (o.earl !== undefined ? o.earl : +o.year === 1996)
      L.npcs.push(resident('earl', R214.earlBed, { name: 'Earl', fallback: 'old_man', pose: 'sit', face: -1 }));
    return finish(L, o);
  };

  const W2 = { stairs: 40, elevator: 110, basement: 70, r210: 300, r212: 420, r214: 540, r216: 660, knitter: 674, rail0: 720, rail1: 1000,
    station: 1080, dolores: 1110, charts: 1150, board: 1240, tv: 1340, puzzle: 1400, payphone: 1480, chairs: [1530, 1570], jar: 1610, office: 1676 };
  // Second floor, West corridor and day room. year · time ('day' | 'night': the night corridor, Ch1 Week 10 / Ch9)
  // month: 'oct' | 'nov' (paper turkey) | 'dec' (snowflake chain, the finished scarf) | 'apr'
  P.stagnes2West = function (o) {
    o = Object.assign({ year: 1996, time: 'day', month: 'oct' }, o);
    const night = o.time === 'night' || o.time === 'late';
    const L = base({
      name: 'St. Agnes — 2 West', area: 'Hillcrest', kind: 'interior', w: 1700, map: 'map_hillcrest',
      room: { wall: '#8a9088', wall2: '#6a7068', floor: '#7a7a70', pattern: 'plaster', floorPattern: 'tile', ceiling: 62, trim: '#a8aca0', wainscot: 34 },
      ambient: night ? { dark: 0.62, tint: '#1a2230', fog: 0.02 } : indoor(o, 0.12), sound: { loop: 'hum', vol: 0.3 },
      layers: {
        back: [
          { t: 'door', x: W2.stairs, kind: 'metal', color: '#7a7a70', label: 'STAIRS' },
          { t: 'elevator', x: W2.elevator, open: false },
          { t: 'door', x: W2.r210, kind: 'wood', color: '#9a9a8a', open: true, label: '210' },
          { t: 'door', x: W2.r212, kind: 'wood', color: '#9a9a8a', open: true, label: '212' },
          { t: 'door', x: W2.r214, kind: 'wood', color: '#9a9a8a', open: true, label: '214' },
          { t: 'door', x: W2.r216, kind: 'wood', color: '#9a9a8a', open: true, label: '216' },
          { t: 'pipes', id: 'w2_handrail', x: W2.rail0, w: W2.rail1 - W2.rail0, y: 252 },
          { t: 'desk', id: 'w2_station', x: W2.station - 40, w: 120, kind: 'nurse' },
          { t: 'shelf', id: 'w2_chart_rack', x: W2.charts - 10, w: 40, h: 34, items: 'files', y: 236 },
          { t: 'lamp', x: W2.station + 60, y: 262, kind: 'desk', on: true },
          { t: 'bulletin_board', id: 'w2_board', x: W2.board - 24, y: 150, w: 48, h: 34 },
          { t: 'notice', x: W2.board - 18, y: 154, lines: ['BINGO THURS 2 PM', o.month === 'nov' ? 'HAPPY THANKSGIVING' : o.month === 'dec' ? '* * * * *' : 'PRIZES FROM THE JAR'] },
          { t: 'tv', id: 'w2_tv', x: W2.tv, y: 120, mount: true, on: !night, content: 'news' },
          { t: 'table', id: 'w2_puzzle', x: W2.puzzle - 20, w: 40, kind: 'folding' },
          { t: 'phone_wall', id: 'w2_payphone', x: W2.payphone, y: 214 },
          { t: 'sign', x: W2.payphone - 30, y: 196, text: 'PATIENT CALLS 7–9 PM', color: '#d8d4c4', textColor: '#3a3a3a', w: 60 },
          { t: 'chair', x: W2.chairs[0], kind: 'armchair', face: -1 }, { t: 'chair', x: W2.chairs[1], kind: 'armchair', face: -1 },
          { t: 'window', id: 'w2_sill', x: W2.jar - 26, y: 150, w: 52, h: 60, lit: false, curtains: true },
          { t: 'door', x: W2.office, kind: 'wood', color: '#6a4a30', label: 'ADMIN' },
        ].concat([200, 500, 800, 1100, 1400].map((x, i) => ({ t: 'ceiling_light', x, kind: 'fluorescent', on: !night || i === 3, flicker: i === 4 ? 0.3 : 0 }))),
      },
      lights: night ? [{ x: W2.station + 60, y: 250, r: 80, color: '#e8b35a', k: 0.55 }] : [],
      points: { start: { x: W2.r214, y: 300 }, r214: { x: W2.r214, y: 300 }, station: { x: W2.station, y: 300 }, dayroom: { x: 1450, y: 300 } },
    });
    L.doors.push(
      { id: 'w2_stairs', x: W2.stairs, label: 'Stairs — the gym (1F)', verb: 'Take', kind: 'stairs', to: 'stagnes_gym', tx: 50, face: 1 },
      { id: 'w2_basement', x: W2.basement, label: 'Stairs — basement', verb: 'Take', kind: 'stairs', to: 'stagnes_records', tx: 60, face: 1 },
      { id: 'w2_elevator', x: W2.elevator, label: 'Elevator — lobby', verb: 'Take', kind: 'door', to: 'stagnes_lobby', tx: LOB.elevator, face: 1 },
      { id: 'w2_214', x: W2.r214, label: 'Room 214', verb: 'Enter', kind: 'door', to: 'stagnes_room214', tx: R214.door - 24, face: -1 },
      closed({ id: 'w2_office', x: W2.office, label: "Sister Margaret's office" }, 'The administrator\'s office. The door is shut.'),
    );
    if (!night) {
      L.npcs.push(resident('dolores', W2.dolores, { name: 'Nurse Dolores', fallback: 'nurse', pose: 'write', face: -1 }));
      L.npcs.push(resident('knitter', W2.knitter, { name: 'Woman in 216', fallback: 'old_woman', pose: 'sit', face: -1, idles: ['sit', 'wave', 'sit'] }));
    }
    return finish(L, o);
  };

  const SG = { door: 30, bars: 150, barsW: 80, beam: 290, stepTrainer: 360, mats: 420, mirror: 590, marks: [640, 670, 700, 730, 760, 790], board: 840, desk: 930, glass: 1070 };
  // Rehabilitation gym, 1F (Ch1). time · patients: true (two other patients with their own therapists, never named)
  P.stagnesGym = function (o) {
    o = Object.assign({ year: 1996, time: 'day' }, o);
    const L = base({
      name: 'St. Agnes — rehabilitation gym', area: 'Hillcrest', kind: 'interior', w: 1100, map: 'map_hillcrest',
      room: { wall: '#8a9490', wall2: '#6a7470', floor: '#6a6a60', pattern: 'plaster', floorPattern: 'wood', ceiling: 58, trim: '#a8b0aa', wainscot: 40 },
      ambient: indoor(o, 0.08), sound: { loop: 'hum', vol: 0.2 },
      layers: {
        back: [
          { t: 'door', x: SG.door, kind: 'metal', color: '#7a7a70', label: 'STAIRS' },
          { t: 'parallel_bars', id: 'sg_bars', x: SG.bars, w: SG.barsW },
          { t: 'mat', id: 'sg_beam', x: SG.beam - 30, w: 60, color: '#5a4a3a' },
          { t: 'stairs', id: 'sg_step_trainer', x: SG.stepTrainer - 20, w: 40, h: 20, kind: 'iron' },
          { t: 'mat', x: SG.mats, w: 110, color: '#3a5a6a' },
          { t: 'mirror', id: 'sg_mirror', x: SG.mirror, y: 150, w: 90, h: 90 },
          { t: 'bulletin_board', id: 'sg_reaction_board', x: SG.board - 20, y: 200, w: 40, h: 30 },
          { t: 'lamp', x: SG.board - 10, y: 204, kind: 'bulb', color: '#d84a3a' }, { t: 'lamp', x: SG.board + 10, y: 204, kind: 'bulb', color: '#4a8ad8' },
          { t: 'desk', id: 'sg_desk', x: SG.desk - 22, w: 50, kind: 'office' },
          { t: 'door', x: SG.glass, kind: 'glass', color: '#6a7a7a', lit: true },
        ].concat(SG.marks.map((x, i) => ({ t: 'mat', x: x - 6, w: 12, y: i % 2 ? 300 : 300, color: '#d8c860' }))),
        front: [200, 420, 640, 860].map((x) => ({ t: 'ceiling_light', x, kind: 'fluorescent' })),
      },
      training: { balance: { x: SG.bars + SG.barsW / 2 }, footwork: { x: SG.marks[2] }, reaction: { x: SG.board } },
      points: { start: { x: 70, y: 300 }, bars: { x: SG.bars + SG.barsW / 2, y: 300 }, desk: { x: SG.desk, y: 300 }, board: { x: SG.board, y: 300 } },
    });
    L.doors.push(
      { id: 'sg_stairs', x: SG.door, label: 'Stairs — 2 West', verb: 'Take', kind: 'stairs', to: 'stagnes_2west', tx: W2.stairs + 20, face: 1 },
      { id: 'sg_courtyard', x: SG.glass, label: 'Courtyard', verb: 'Go out', kind: 'door', to: 'stagnes_courtyard', tx: 60, face: 1 },
    );
    if (o.patients !== false) L.npcs.push(
      resident('gym_patient', SG.mats + 40, { name: 'Patient', fallback: 'old_man', pose: 'sitFloor', face: 1 }),
      resident('gym_therapist', SG.mats + 70, { name: 'Therapist', fallback: 'nurse', pose: 'kneel', face: -1 }),
    );
    return finish(L, o);
  };

  const SC = { door: 40, bench1: 300, fountain: 520, maple: 660, bench2: 780, fence: 1040, lobby: 1170, lapA: 380, lapB: 900 };
  // Courtyard garden (Ch1 laps). month: 'oct' | 'nov' (leaves) | 'dec' (frost) · time
  P.stagnesCourtyard = function (o) {
    o = Object.assign({ year: 1996, time: 'overcast', month: 'oct' }, o);
    const frost = o.month === 'dec', A = outdoor(o, { time: 'overcast', weather: frost ? null : 'leaves' });
    const L = base({
      name: 'St. Agnes — courtyard', area: 'Hillcrest', kind: 'exterior', w: 1200, map: 'map_hillcrest',
      sky: A.sky, backdrop: 'skyline', weather: A.weather, groundStyle: 'gravel', ambient: Object.assign(A.ambient, { fog: frost ? 0.12 : 0.06 }),
      sound: { loop: 'wind', vol: 0.3 },
      layers: {
        back: [
          { t: 'wall', x: 0, w: 1200, h: 70, style: 'brick' },
          { t: 'door', x: SC.door, kind: 'glass', color: '#6a7a7a' },
          { t: 'bench', id: 'sc_bench1', x: SC.bench1 - 17, kind: 'park' },
          { t: 'planter', id: 'sc_fountain', x: SC.fountain - 40, w: 80, kind: 'stone', flowers: false },
          { t: 'tree', id: 'sc_maple', x: SC.maple, kind: frost ? 'bare' : 'leafy', autumn: !frost },
          { t: 'bench', id: 'sc_bench2', x: SC.bench2 - 17, kind: 'park' },
          { t: 'fence', x: SC.fence, w: 100, kind: 'iron' },
          { t: 'door', x: SC.lobby, kind: 'glass', color: '#6a7a7a' },
        ],
      },
      training: { conditioning: { x: SC.lapA } },
      points: { start: { x: 80, y: 300 }, lapA: { x: SC.lapA, y: 300 }, lapB: { x: SC.lapB, y: 300 } },
    });
    L.doors.push(
      { id: 'sc_gym', x: SC.door, label: 'Rehabilitation gym', verb: 'Enter', kind: 'door', to: 'stagnes_gym', tx: SG.glass - 24, face: -1 },
      { id: 'sc_lobby', x: SC.lobby, label: 'Lobby', verb: 'Enter', kind: 'door', to: 'stagnes_lobby', tx: LOB.desk, face: 1 },
    );
    return finish(L, o);
  };

  const REC = { door: 30, boiler: 150, shelves: [260, 420], box: 470, fiche: 620, xerox: 700, property: 780, window: 830 };
  // Medical records, basement (Ch1 records route). time
  P.stagnesRecords = function (o) {
    o = Object.assign({ year: 1996, time: 'day' }, o);
    const L = base({
      name: 'St. Agnes — medical records', area: 'Hillcrest', kind: 'interior', w: 900, map: 'map_hillcrest',
      room: { wall: '#5a5e58', wall2: '#40443e', floor: '#4a4c48', pattern: 'concrete', floorPattern: 'concrete', ceiling: 76, trim: '#6a6e66' },
      ambient: { dark: 0.55, tint: '#20262a', fog: 0.05 }, weather: 'dust', weatherAmount: 0.2, sound: { loop: 'hum', vol: 0.35 },
      layers: {
        back: [
          { t: 'door', x: REC.door, kind: 'metal', color: '#5a5a52', label: 'STAFF' },
          { t: 'boiler', x: REC.boiler }, { t: 'pipes', x: 90, w: 180, y: 90 },
          { t: 'shelving', id: 'rec_shelf_a', x: REC.shelves[0], w: 140, h: 110, stock: 'boxes' },
          { t: 'shelving', id: 'rec_shelf_b', x: REC.shelves[1], w: 140, h: 110, stock: 'boxes' },
          { t: 'desk', id: 'rec_fiche', x: REC.fiche - 22, w: 46, kind: 'office' },
          { t: 'lamp', id: 'rec_pullchain', x: REC.fiche, y: 150, kind: 'bulb' },
          { t: 'copier', id: 'rec_xerox', x: REC.xerox },
          { t: 'shelf', id: 'rec_property', x: REC.property - 26, w: 52, h: 60, items: 'boxes' },
          { t: 'window', id: 'rec_window', x: REC.window - 18, y: 86, w: 36, h: 20, lit: o.time !== 'night', curtains: false },
        ],
      },
      lights: o.time !== 'night' ? [{ x: REC.window, y: 110, r: 120, color: '#e8b35a', k: 0.5, cone: { dir: 'down', width: 50 } }] : [],
      points: { start: { x: 60, y: 300 }, box: { x: REC.box, y: 300 }, fiche: { x: REC.fiche, y: 300 }, property: { x: REC.property, y: 300 } },
    });
    // The bible's lock for this door ("Staff only. Hana has a reason to be down here. You don't, yet.") belongs to the chapter.
    L.doors.push({ id: 'rec_door', x: REC.door, label: 'Stairs — 2 West', verb: 'Take', kind: 'stairs', to: 'stagnes_2west', tx: W2.basement + 20, face: 1 });
    return finish(L, o);
  };

  const LOB = { chapel: 40, desk: 170, binder: 170, rack: 270, plaque: 350, elevator: 430, glass: 560, steps: 620, road: 900, shelter: 1210, lamp: 1160 };
  // Lobby and front steps, Hillcrest Road (Ch1 departure). A cut-away: the lobby wall on the left, the steps and the
  // Route 14 shelter outside on the right. time · month
  P.stagnesLobby = function (o) {
    o = Object.assign({ year: 1996, time: 'overcast', month: 'dec' }, o);
    const A = outdoor(o, { time: 'overcast', season: o.month === 'dec' ? 'winter' : 'autumn', weather: o.month === 'dec' ? null : 'leaves' });
    const L = base({
      name: 'St. Agnes — lobby', area: 'Hillcrest', kind: 'exterior', w: 1300, map: 'map_hillcrest',
      sky: A.sky, backdrop: 'skyline', weather: A.weather, groundStyle: 'sidewalk', ambient: A.ambient, sound: { loop: 'room', vol: 0.25 },
      layers: {
        far: [{ t: 'river', x: 600, w: 700 }],
        back: [
          { t: 'wall', id: 'lob_wall', x: 0, w: LOB.glass + 10, h: 240, style: 'stone' },
          { t: 'door', x: LOB.chapel, kind: 'wood', color: '#5a3a2a' },
          { t: 'window', x: LOB.chapel - 8, y: 196, w: 16, h: 14, lit: true, frame: '#5a3a2a' },
          { t: 'desk', id: 'lob_desk', x: LOB.desk - 32, w: 64, kind: 'reception' },
          { t: 'shelf', id: 'lob_rack', x: LOB.rack - 16, w: 32, h: 44, items: 'files' },
          { t: 'sign', id: 'lob_plaque', x: LOB.plaque - 30, y: 200, text: 'REHABILITATION WING · CFRF', color: '#a8884a', textColor: '#2a2418', w: 124 },
          { t: 'elevator', x: LOB.elevator, open: false },
          { t: 'door', id: 'lob_glass_doors', x: LOB.glass, kind: 'double', color: '#6a7a7a', lit: true },
          { t: 'stoop', x: LOB.steps - 20, w: 60, steps: 4 },
          { t: 'tree', x: 760, kind: o.month === 'dec' ? 'bare' : 'leafy', autumn: true },
          { t: 'fence', x: 980, w: 120, kind: 'iron' },
          { t: 'bus_stop', id: 'lob_shelter', x: LOB.shelter, sign: '14', shelter: true },
          { t: 'streetlight', x: LOB.lamp, on: true },
        ],
        front: [{ t: 'ceiling_light', x: 200, y: 64, kind: 'pendant' }, { t: 'ceiling_light', x: 420, y: 64, kind: 'pendant' }],
      },
      points: { start: { x: LOB.desk + 40, y: 300 }, steps: { x: LOB.steps, y: 300 }, shelter: { x: LOB.shelter, y: 300 } },
    });
    L.doors.push(
      { id: 'lob_elevator', x: LOB.elevator, label: 'Elevator — 2 West', verb: 'Take', kind: 'door', to: 'stagnes_2west', tx: W2.elevator + 24, face: 1 },
      closed({ id: 'lob_chapel', x: LOB.chapel, label: 'Chapel' }, 'The chapel. Somebody is praying.'),
      { id: 'lob_courtyard', x: LOB.rack + 40, label: 'Courtyard', verb: 'Go out', kind: 'door', to: 'stagnes_courtyard', tx: SC.lobby - 24, face: -1 },
    );
    return finish(L, o);
  };

  /* ── 7. Route 9: Starlite Lanes, the Pit, the Cellar ──────────────── */

  const SL = { shelter: 80, ad: 110, lampA: 360, lampB: 780, mo: 430, pickup: 560, slim: 690, star: 720, front: 1180, building: 900, dumpster: 1290, barrel: 1330, fighters: 1372 };
  // Route 9 and the Starlite parking lot (Ch3; Ch6 corner night; Ch9 the dark lot). time 'night' · closed: sign and lanes dark (Ch9)
  // cars: { mo, slim, pickup } each bool | (G)=>bool (default all true) · letters: the sign's letter-board lines
  P.starliteLot = function (o) {
    o = Object.assign({ year: 1997, time: 'night', season: 'winter' }, o);
    const A = outdoor(o, { time: 'night', season: seasonOf(o) }), cars = Object.assign({ mo: true, slim: true, pickup: true }, o.cars || {});
    const dark = !!o.closed;
    const L = base({
      name: 'Starlite Lanes — parking lot', area: 'Route 9', kind: 'exterior', w: 1400, map: 'map_route9',
      sky: A.sky, backdrop: 'skyline', weather: A.weather, wet: A.wet, groundStyle: 'concrete', ambient: A.ambient, sound: { loop: 'traffic', vol: 0.4 },
      layers: {
        far: [{ t: 'bridge', id: 'sl_overpass', x: 0, w: 1400, y: 200 }, { t: 'sign', id: 'sl_motel', x: 200, y: 150, text: 'VACAN Y', neon: true, color: '#d8402f', w: 46 },
          { t: 'building', id: 'sl_tower', x: 1100, w: 40, h: 240, style: 'concrete', floors: 10, windows: { cols: 2, lit: 0.6, seed: 91 }, cornice: false }],
        back: [
          { t: 'bus_stop', id: 'sl_shelter', x: SL.shelter, sign: 'ROUTE 9', shelter: true },
          { t: 'poster', id: 'sl_savings_ad', x: SL.ad, y: 248, kind: 'ad', text: 'CALDER SAVINGS' },
          { t: 'streetlight', x: SL.lampA, on: true, color: '#e8a040' }, { t: 'streetlight', x: SL.lampB, on: true, color: '#e8a040', flicker: 0.2 },
          { t: 'rubble', id: 'sl_snowbank', x: 240, w: 90, when: whenOf(seasonOf(o) === 'winter') },
          { t: 'pole', id: 'sl_sign_pole', x: SL.star },
          { t: 'sign', id: 'sl_star', x: SL.star - 40, y: 120, text: 'STARLITE LANES', neon: !dark, lit: !dark, color: '#d86a9a', w: 80 },
          { t: 'notice', id: 'sl_letters', x: SL.star - 34, y: 142, lines: o.letters || ['THURS TRYOUTS', 'SAT COSMIC BOWL', 'CONGRATS GARY 300'] },
          { t: 'building', id: 'sl_building', x: SL.building, w: 350, h: 160, style: 'siding', floors: 1, cornice: false,
            shop: { sign: 'STARLITE LANES', color: '#4a3a5a', window: dark ? 'dark' : 'lit' }, door: { dx: 268, kind: 'glass' } },
          { t: 'poster', id: 'sl_toy_drive', x: SL.building + 40, y: 254, kind: 'notice', text: 'TOY DRIVE' },
          { t: 'dumpster', x: SL.dumpster, color: '#3f5246' }, { t: 'barrel', x: SL.barrel },
          { t: 'door', id: 'sl_fighters_door', x: SL.fighters, kind: 'metal', color: '#4a4a52', label: 'DELIVERIES' },
        ],
        front: [
          { t: 'car', id: 'sl_mo_car', x: SL.mo, kind: 'sedan', color: '#d8d4c8', face: 1, text: 'MO 1', when: whenOf(cars.mo) },
          { t: 'car', id: 'sl_pickup', x: SL.pickup, kind: 'pickup', face: -1, when: whenOf(cars.pickup) },
          { t: 'car', id: 'sl_slim_car', x: SL.slim, kind: 'sedan', color: '#5a3a28', face: 1, rusty: true, when: whenOf(cars.slim) },
        ],
      },
      points: { start: { x: SL.shelter + 40, y: 300 }, arrive: { x: SL.shelter + 40, y: 300 }, slimCar: { x: SL.slim, y: 300 } },
    });
    L.doors.push(
      door({ id: 'sl_front', x: SL.front, label: 'Starlite Lanes', tx: 60, face: 1 }, dark ? null : 'starlite_lanes', 'Dark. Closed for the night.'),
      { id: 'sl_fighters', x: SL.fighters, label: "Fighters' door", verb: 'Enter', kind: 'door', to: 'cellar', tx: CEL.cellarDoors - 40, face: -1 },
    );
    return finish(L, o);
  };

  const LN = { front: 30, toyBox: 70, shoes: 220, peg: 230, staff: 330, bar: 470, tv: 500, trophies: 600, lanes0: 660, lanes1: 1700, loft: 1750 };
  // Starlite Lanes, upstairs (Ch3). cosmic: Saturday after 10 PM, blacklight purple · loft: 'pinsetter_loft' | null
  P.starliteLanes = function (o) {
    o = Object.assign({ year: 1997 }, o);
    const cosmic = !!o.cosmic;
    const L = base({
      name: 'Starlite Lanes', area: 'Route 9', kind: 'interior', w: 1800, map: 'map_route9',
      room: { wall: cosmic ? '#3a2a5a' : '#6a5440', wall2: cosmic ? '#2a1a40' : '#4a3a30', floor: '#6a4a30', pattern: 'paneling', floorPattern: 'wood', ceiling: 64, trim: '#8a6a48', wainscot: 44 },
      ambient: cosmic ? { dark: 0.5, tint: '#3a2060', fog: 0.05 } : Object.assign(indoor(o, 0.12), { tint: '#3a2a20' }), sound: { loop: 'room', vol: 0.4 },
      layers: {
        back: [
          { t: 'door', x: LN.front, kind: 'double', color: '#4a3a3a', lit: true },
          { t: 'boxes', id: 'ln_toy_box', x: LN.toyBox, n: 1, label: 'TOYS' },
          { t: 'counter', id: 'ln_shoe_counter', x: 160, w: 120, color: '#6a4a30' },
          { t: 'shelf', id: 'ln_cubbies', x: 160, w: 120, h: 50, items: 'boxes', y: 214 },
          { t: 'sign', x: 160, y: 120, text: 'SHOES MUST BE RETURNED.', color: '#d8d0b8', textColor: '#5a2a2a', w: 120 },
          { t: 'door', x: LN.staff, kind: 'wood', color: '#4a3a30', label: 'STAFF' },
          { t: 'counter', id: 'ln_star_bar', x: 380, w: 200, color: '#5a2a2a' },
          { t: 'tv', id: 'ln_tv', x: LN.tv, y: 110, mount: true, on: true, content: 'news' },
          { t: 'trophy_case', id: 'ln_trophies', x: LN.trophies - 26, w: 52, lit: true },
          { t: 'bowling_lanes', id: 'ln_lanes', x: LN.lanes0, w: LN.lanes1 - LN.lanes0 },
          { t: 'door', x: LN.loft, kind: 'metal', color: '#4a4a52', label: 'PINSETTERS' },
        ],
        front: [300, 700, 1100, 1500].map((x) => ({ t: 'ceiling_light', x, kind: 'pendant', color: cosmic ? '#8a5ad8' : undefined })),
      },
      points: { start: { x: 60, y: 300 }, bar: { x: LN.bar, y: 300 }, lane16: { x: LN.lanes1 - 20, y: 300 } },
    });
    L.doors.push(
      { id: 'ln_front', x: LN.front, label: 'Parking lot', verb: 'Leave', kind: 'door', to: 'starlite_lot', tx: SL.front, face: -1 },
      { id: 'ln_staff', x: LN.staff, label: 'STAFF — down to the Pit', verb: 'Take', kind: 'stairs', to: 'cellar_pit', tx: PIT.stair + 24, face: 1 },
      door({ id: 'ln_loft', x: LN.loft, label: 'STAFF — PINSETTERS', tx: 60, face: 1 }, o.loft === undefined ? 'pinsetter_loft' : o.loft, 'Locked. From the other side.'),
    );
    L.npcs.push(resident('peg', LN.peg, { name: 'Peg', fallback: 'woman', pose: 'work', face: 1 }));
    return finish(L, o);
  };

  const PIT = { stair: 30, cots: [120, 200, 280], slimCot: 120, deshawnCot: 200, bag: 380, rope0: 430, rope1: 500, ladder: [520, 545, 570, 595, 620], rules: 660, fame: 730, sink: 820, fridge: 852, heater: 884, stool: 916, mirror: 930, office: 948, curtain: 988 };
  // The Pit, the fighters' room (Ch3; Ch6 corner night). time
  P.cellarPit = function (o) {
    o = Object.assign({ year: 1997 }, o);
    const L = base({
      name: 'The Pit', area: 'Route 9', kind: 'interior', w: 1000, map: 'map_route9',
      room: { wall: '#4a4440', wall2: '#342e2a', floor: '#3a3634', pattern: 'concrete', floorPattern: 'concrete', ceiling: 80, trim: '#5a524a' },
      ambient: { dark: 0.5, tint: '#2a2220', fog: 0.04 }, sound: { loop: 'hum', vol: 0.3 },
      layers: {
        back: [
          { t: 'stairs_interior', x: 0, w: 60, h: 80, dir: -1, runner: false },
          { t: 'bed', id: 'pit_slim_cot', x: PIT.cots[0], kind: 'cot', face: -1 },
          { t: 'bed', id: 'pit_deshawn_cot', x: PIT.cots[1], kind: 'cot', face: -1 },
          { t: 'bed', id: 'pit_empty_cot', x: PIT.cots[2], kind: 'cot', face: -1 },
          { t: 'pipes', x: PIT.bag - 40, w: 80, y: 86 },
          { t: 'heavy_bag', id: 'pit_bag', x: PIT.bag },
          { t: 'laundry_line', id: 'pit_slip_rope', x0: PIT.rope0, x1: PIT.rope1, y: 252, sag: 3 },
          { t: 'notice', id: 'pit_rules', x: PIT.rules - 14, y: 190, lines: ["MO'S RULES", 'TRAIN HERE', 'FIGHT WHEN', 'BOOKED'] },
          { t: 'bulletin_board', id: 'pit_wall_of_fame', x: PIT.fame - 40, y: 150, w: 80, h: 50 },
          { t: 'sink', x: PIT.sink }, { t: 'fridge', x: PIT.fridge },
          { t: 'bucket', id: 'pit_heater', x: PIT.heater, color: '#5a3a2a' },
          { t: 'chair', x: PIT.stool, kind: 'stool' }, { t: 'mirror', x: PIT.mirror, y: 200, w: 16, h: 24, cracked: true },
          { t: 'door', id: 'pit_office_door', x: PIT.office, kind: 'glass', color: '#6a6a5a', label: 'M. FEENEY' },
          { t: 'curtain', id: 'pit_curtain', x: PIT.curtain - 10, w: 22, open: false, color: '#5a2a2a' },
          { t: 'lamp', x: 180, y: 120, kind: 'bulb' }, { t: 'lamp', x: 620, y: 120, kind: 'bulb' },
        ].concat(PIT.ladder.map((x) => ({ t: 'mat', x: x - 5, w: 10, color: '#c8c060' }))),
      },
      lights: [{ x: PIT.heater, y: 286, r: 50, color: '#e86a2a', k: 0.6, flicker: 0.2 }],
      training: { bag: { x: PIT.bag }, footwork: { x: 570 }, reaction: { x: 465 } },
      points: { start: { x: 60, y: 300 }, bag: { x: PIT.bag, y: 300 }, ladder: { x: 570, y: 300 }, stool: { x: PIT.stool, y: 300 } },
    });
    L.doors.push(
      { id: 'pit_stair', x: PIT.stair, label: 'Up to the lanes', verb: 'Take', kind: 'stairs', to: 'starlite_lanes', tx: LN.staff + 24, face: 1 },
      door({ id: 'pit_office', x: PIT.office, label: "Mo's office", tx: 60, face: 1 }, o.office === undefined ? 'cellar_office' : o.office, "Mo's office. Mo's not in."),
      { id: 'pit_cellar', x: PIT.curtain, label: 'The Cellar', verb: 'Go through', kind: 'door', to: 'cellar', tx: CEL.curtain + 30, face: 1, sound: null },
    );
    return finish(L, o);
  };

  const CEL = { curtain: 30, bar: 120, honour: 220, chalk: 300, mo: 452, bellTable: 452, ring0: 500, ring1: 920, chairs0: 940, cellarDoors: 1240, floorY: 420 };
  // The Cellar under lanes 17–24 (Ch3 bouts; Ch6 Deshawn's corner). h 480, floor 420.
  // crowd: 'thursday' (a dozen) | 'saturday' (~70, default) | 'empty' · card: lines for Mo's chalkboard
  P.cellar = function (o) {
    o = Object.assign({ year: 1997, crowd: 'saturday' }, o);
    const G0 = CEL.floorY, crowd = o.crowd, n = crowd === 'saturday' ? 1 : crowd === 'thursday' ? 0.25 : 0;
    const L = base({
      name: 'The Cellar', area: 'Route 9', kind: 'interior', w: 1280, h: 480, ground: G0, map: 'map_route9',
      room: { wall: '#3a3430', wall2: '#2a2622', floor: '#34302c', pattern: 'brick', floorPattern: 'concrete', ceiling: 210, trim: '#4a423a' },
      ambient: { dark: 0.62, tint: '#1e2420', fog: n ? 0.12 : 0.05 }, weather: n ? 'smoke' : 'dust', weatherAmount: 0.25,
      sound: { loop: n ? 'crowd' : 'room', vol: 0.2 + n * 0.4 },
      layers: {
        back: [
          { t: 'curtain', x: CEL.curtain - 10, w: 22, open: false, color: '#5a2a2a', y: G0 },
          { t: 'counter', id: 'cel_bar', x: CEL.bar - 50, w: 110, color: '#5a4a34', y: G0 },
          { t: 'boxes', x: CEL.bar + 20, n: 2, label: 'COOLER', y: G0 },
          { t: 'sign', id: 'cel_honour_box', x: CEL.honour - 30, y: G0 - 90, text: 'BEER $2 · BE HONEST', color: '#d8d0b8', textColor: '#3a2a2a', w: 64 },
          { t: 'chalkboard', id: 'cel_chalkboard', x: CEL.chalk - 30, y: G0 - 120, w: 60, h: 44, lines: o.card || ['TONIGHT', 'SEO v TILLERY', 'WOJO v ?', 'SEO v WHITLOCK'] },
          { t: 'ring', id: 'cel_ring_back', x: CEL.ring0, w: CEL.ring1 - CEL.ring0, part: 'back', corners: ['#33507a', '#8a3a30'], ropes: ['#8a8a8a', '#7a7a7a', '#8a8a8a'], skirtText: 'CELLAR', y: G0 },
          { t: 'table', id: 'cel_mo_table', x: CEL.bellTable - 20, w: 40, kind: 'folding', y: G0 },
          { t: 'stairs', id: 'cel_doors', x: CEL.cellarDoors - 30, w: 60, h: 60, dir: 1, y: G0 },
          { t: 'sign', x: CEL.cellarDoors - 16, y: G0 - 140, text: 'EXIT', neon: true, color: '#d8402f', w: 22 },
        ].concat(n ? [{ t: 'crowd', id: 'cel_crowd', x: 470, w: 520, rows: 2, density: n, mood: o.mood || 'tense', y: G0 - 8, dim: 0.36 }] : []),
        front: [
          { t: 'ring', id: 'cel_ring_front', x: CEL.ring0, w: CEL.ring1 - CEL.ring0, part: 'front', corners: ['#33507a', '#8a3a30'], ropes: ['#8a8a8a', '#7a7a7a', '#8a8a8a'], y: G0 },
          { t: 'ceiling_light', id: 'cel_ring_lamp', x: (CEL.ring0 + CEL.ring1) / 2, y: 214, kind: 'pendant', color: '#9ad87a', len: 30, r: 240 },
        ].concat([150, 300, 1050, 1180].map((x) => ({ t: 'ceiling_light', x, y: 214, kind: 'bulb' })))
          .concat(n ? [0, 1, 2, 3, 4].map((i) => ({ t: 'chair', x: CEL.chairs0 + i * 26, kind: 'folding', y: G0 + 4 })) : []),
      },
      points: { start: { x: 60, y: G0 }, blue: { x: CEL.ring0 + 30, y: G0 }, red: { x: CEL.ring1 - 30, y: G0 }, mo: { x: CEL.mo, y: G0 } },
    });
    L.doors.push(
      { id: 'cel_curtain', x: CEL.curtain, y: G0, label: 'The Pit', verb: 'Go through', kind: 'door', to: 'cellar_pit', tx: PIT.curtain - 24, face: -1, sound: null },
      { id: 'cel_doors', x: CEL.cellarDoors, y: G0, label: 'Up to the loading alley', verb: 'Take', kind: 'stairs', to: 'starlite_lot', tx: SL.fighters - 20, face: -1 },
    );
    if (n) L.npcs.push(resident('mo', CEL.mo, { name: 'Mo', fallback: 'man', pose: 'sit', face: 1, y: G0 }));
    return finish(L, o);
  };

  /* ── 8. Harlan Street and the Calder Arms ─────────────────────────── */

  const HS = { stop: 80, grill: 210, grillDoor: 560, hardware: 660, siding: 1000, shack: 1300, gate: 1440, lincoln: 1720, trucks: [1560, 1860], ghost: 1500 };
  // Harlan Street (Ch4; Ch9's 5:30 AM gate). state: 'open' (Ch4) | 'chained' (Ch5–8: CLOSED FOR INVENTORY) | 'trucks' (Ch9: floodlights, the crew's trucks)
  // time · grill: 'harlan_grill' | null (door target)
  P.harlanStreet = function (o) {
    o = Object.assign({ year: 1997, state: 'open', time: 'night', season: 'winter' }, o);
    const st = o.state, A = outdoor(o, { time: 'night', season: seasonOf(o) });
    const L = base({
      name: 'Harlan Street', area: 'Riverside', kind: 'exterior', w: 2000, map: 'map_harlan',
      sky: A.sky, backdrop: 'river+skyline', weather: A.weather, wet: A.wet, groundStyle: 'street', ambient: A.ambient,
      sound: { loop: 'traffic', vol: 0.4 },
      layers: {
        far: [{ t: 'bridge', x: 300, w: 900 }, { t: 'building', id: 'hs_tower', x: 1500, w: 40, h: 240, style: 'concrete', floors: 10, windows: { cols: 2, lit: 0.6, seed: 92 }, cornice: false }],
        mid: [{ t: 'building', id: 'hs_warehouse', x: 1120, w: 880, h: 200, style: 'concrete', floors: 2, windows: { cols: 10, lit: st === 'chained' ? 0 : 0.2, seed: 93 }, cornice: false }],
        back: [
          { t: 'bridge', id: 'hs_overpass', x: 0, w: 200, y: 150 },
          { t: 'bus_stop', id: 'hs_stop', x: HS.stop, sign: 'LAST 22 — 11:50 PM', shelter: false },
          { t: 'building', id: 'hs_grill', x: HS.grill, w: 440, h: 170, style: 'siding', floors: 2, windows: { cols: 6, lit: A.lit, seed: 94 },
            shop: { sign: 'HARLAN GRILL · OPEN 24 HRS', color: '#7a2c2a', window: 'lit', interior: 'diner' }, door: { dx: HS.grillDoor - HS.grill - 11 } },
          { t: 'sign', x: HS.grill + 300, y: 150, text: 'DRIVERS WELCOME', neon: true, color: '#d8402f', w: 70 },
          { t: 'building', id: 'hs_hardware', x: HS.hardware - 10, w: 240, h: 150, style: 'brick', floors: 2, windows: { cols: 4, lit: 0.1, seed: 95 },
            shop: { sign: 'HADDAD HARDWARE', color: '#3a4a5a', window: 'dark' } },
          { t: 'roll_door', id: 'hs_hardware_gate', x: HS.hardware + 30, w: 120, open: false },
          { t: 'fence', id: 'hs_siding_fence', x: 900, w: 80, kind: 'chain' }, { t: 'fence', x: 1040, w: 60, kind: 'chain' },
          { t: 'pole', id: 'hs_switch_lamp', x: HS.siding + 10 },
          { t: 'fence', id: 'hs_depot_fence', x: 1100, w: 300, kind: 'chain', barbed: true },
          { t: 'building', id: 'hs_shack', x: HS.shack - 24, w: 48, h: 70, style: 'siding', floors: 1, windows: { cols: 1, lit: 1, seed: 96 }, cornice: false },
          { t: 'gate', id: 'hs_gate', x: HS.gate - 40, w: 80, kind: 'chain', open: st === 'trucks' },
          { t: 'sign', id: 'hs_gate_sign', x: HS.gate - 60, y: 210, text: st === 'chained' ? 'CLOSED FOR INVENTORY' : 'HARLAN FREIGHT DEPOT', color: '#c8b070', textColor: '#2a2a2e', w: 120 },
          { t: 'caution_tape', id: 'hs_chain', x0: HS.gate - 40, x1: HS.gate + 40, y: 270, when: whenOf(st === 'chained') },
          { t: 'fence', x: 1520, w: 480, kind: 'chain', barbed: true },
          { t: 'sign', id: 'hs_ghost_sign', x: HS.ghost, y: 150, text: 'HARLAN FREIGHT CO. · EST. 1958 · WE MOVE CALDER', color: '#5a5a52', textColor: '#8a8478', w: 260 },
          { t: 'streetlight', x: 460, on: true, color: '#e8a040' }, { t: 'streetlight', x: 880, on: true, color: '#e8a040' },
          { t: 'spotlight', id: 'hs_flood_a', x: 1600, y: 120, on: st !== 'chained', dir: 'down', width: 60 },
          { t: 'spotlight', id: 'hs_flood_b', x: 1900, y: 120, on: st !== 'chained', dir: 'down', width: 60 },
        ],
        front: [
          { t: 'car', id: 'hs_lincoln', x: HS.lincoln, kind: 'sedan', color: '#1a1a1e', face: -1, when: whenOf(st === 'open') },
          { t: 'car', id: 'hs_truck_a', x: HS.trucks[0], kind: 'van', color: '#7a7a74', face: -1, text: st === 'trucks' ? 'WEST END' : '', when: whenOf(st !== 'chained') },
          { t: 'car', id: 'hs_truck_b', x: HS.trucks[1], kind: 'van', color: '#6a6a64', face: -1, when: whenOf(st !== 'chained') },
          { t: 'car', id: 'hs_gray_van', x: 1700, kind: 'van', color: '#5e6266', face: -1, when: whenOf(st === 'trucks') },
        ],
      },
      lights: [{ x: HS.shack, y: 268, r: 40, color: '#e86a2a', k: 0.55, flicker: 0.2 }],
      points: { start: { x: HS.stop + 40, y: 300 }, arrive: { x: HS.stop + 40, y: 300 }, gate: { x: HS.gate, y: 300 }, booth: { x: HS.grill + 360, y: 300 } },
    });
    L.doors.push(
      door({ id: 'hs_grill', x: HS.grillDoor, label: 'Harlan Grill', tx: 40, face: 1 }, o.grill === undefined ? (st === 'open' ? 'harlan_grill' : null) : o.grill, 'Not now.'),
      door({ id: 'hs_siding', x: HS.siding, label: 'Rail siding' }, st === 'open' ? 'depot_warehouse' : null, 'Floodlight on the gap. The man in the shack would see me.'),
      door({ id: 'hs_gate', x: HS.gate, label: 'Depot gate' }, st === 'open' ? 'depot_warehouse' : null, st === 'chained' ? 'Chained. CLOSED FOR INVENTORY.' : 'Not yet.'),
    );
    return finish(L, o);
  };

  const CA = { door: 600, bed: 200, wall: 200, radiator: 330, window: 430, chair: 520, desk: 500 };
  // The Calder Arms Hotel, Room 6, downtown on Front Street ($45 a week): Ch4 rest card, Ch8–Ch9 base. time
  P.calderArms = function (o) {
    o = Object.assign({ time: 'night' }, o);
    const L = base({
      name: 'Calder Arms Hotel — Room 6', area: 'Front Street', kind: 'interior', w: 640, map: 'map_calder_arms',
      room: { wall: '#6a5a50', wall2: '#4a3e38', floor: '#5a4038', pattern: 'wallpaper', floorPattern: 'carpet', ceiling: 62, trim: '#8a7058', wainscot: 30 },
      ambient: indoor(o, 0.22), sound: { loop: 'traffic', vol: 0.2 },
      layers: {
        back: [
          { t: 'bed', id: 'ca_bed', x: CA.bed, kind: 'single', face: -1 },
          { t: 'bulletin_board', id: 'ca_evidence_wall', x: CA.wall - 50, y: 140, w: 100, h: 50 },
          { t: 'pipes', id: 'ca_radiator', x: CA.radiator - 14, w: 28, y: 272 },
          { t: 'window_city', id: 'ca_window', x: CA.window - 40, y: 100, w: 80, h: 80, view: o.time === 'day' ? 'day' : 'night' },
          { t: 'desk', x: CA.desk - 22, w: 44, kind: 'office' }, { t: 'chair', x: CA.chair, kind: 'wood', face: -1 },
          { t: 'lamp', x: CA.desk - 10, y: 262, kind: 'desk', on: true },
          { t: 'door', x: CA.door, kind: 'wood', color: '#5a3a28', label: '6' },
          { t: 'rug', x: 140, w: 140, color: '#5a2a2a' },
        ],
      },
      points: { start: { x: CA.door - 40, y: 300 }, bed: { x: CA.bed, y: 300 } },
    });
    L.doors.push(closed({ id: 'ca_door', x: CA.door, label: 'Front Street', verb: 'Leave' }, 'Front Street. The bus stops at the corner. (Map)'));
    return finish(L, o);
  };

  /* ── 9. Northside: Foundry Street, Foundry Courts, the union hall ──── */

  const FS = { stop: 60, carWash: 120, deshawnWash: 180, market: 260, marketDoor: 520, hq: 600, hqDoor: 850, bulletin: 760, lincoln: 900, mural: 1100, gate: 1660, plaque: 1610, edge: 1800 };
  // Foundry Street (Ch5, Ch7). time · season · hq: true | (G)=>bool the union hall door opens (Ch7; default false: locked with
  // `hqLocked` text) · lincoln: Carrow's black Lincoln double-parked at noon (Ch7)
  P.foundryStreet = function (o) {
    o = Object.assign({ year: 1997, time: 'day', season: 'winter' }, o);
    const A = outdoor(o, { time: 'day', season: seasonOf(o) });
    const L = base({
      name: 'Foundry Street', area: 'Northside', kind: 'exterior', w: 1800, map: 'map_northside',
      sky: A.sky, backdrop: 'foundry', weather: A.weather, wet: A.wet, groundStyle: 'street', ambient: A.ambient, sound: { loop: 'city', vol: 0.4 },
      layers: {
        far: [{ t: 'smokestack', x: 1500, h: 170, smoke: false }],
        back: [
          { t: 'bus_stop', id: 'fs_stop', x: FS.stop, sign: '22', shelter: true },
          { t: 'building', id: 'fs_car_wash', x: FS.carWash - 20, w: 140, h: 100, style: 'siding', floors: 1, cornice: false,
            shop: { sign: 'NORTHSIDE CAR WASH', color: '#3a5a7a', window: 'lit' } },
          { t: 'sign', x: FS.carWash - 10, y: 170, text: 'HAND WASH $5', color: '#d8d0b8', textColor: '#2a4a6a', w: 60 },
          { t: 'building', id: 'fs_market', x: FS.market, w: 300, h: 170, style: 'brick', floors: 2, windows: { cols: 5, lit: A.lit, seed: 51 },
            shop: { sign: "DOMBROWSKI'S MARKET", color: '#3f5a3a', awning: '#3f6a44', window: 'lit', interior: 'store' }, door: { dx: FS.marketDoor - FS.market - 11 } },
          { t: 'building', id: 'fs_hq', x: FS.hq, w: 480, h: 180, style: 'brick', floors: 2, windows: { cols: 7, lit: o.hq ? 0.5 : 0.1, seed: 52 }, cornice: true, door: { dx: FS.hqDoor - FS.hq - 11, kind: 'double' } },
          { t: 'sign', id: 'fs_lintel', x: FS.hq + 110, y: 126, text: 'UNITED FOUNDRY WORKERS LOCAL 1197 · 1937', color: '#a8a090', textColor: '#4a4238', w: 260 },
          { t: 'sign', id: 'fs_ncc_sign', x: FS.hq + 170, y: 196, text: 'NORTHSIDE COMMUNITY COUNCIL', color: '#2a4a3a', w: 140 },
          { t: 'bulletin_board', id: 'fs_bulletin_case', x: FS.bulletin - 20, y: 236, w: 40, h: 26 },
          { t: 'notice', x: FS.hqDoor + 16, y: 240, lines: ['OFFICE HOURS', 'TUE / THU 10–4'] },
          { t: 'mural', id: 'fs_mural', x: FS.mural, y: 150, w: 300, h: 120, text: 'FOUNDRY STRONG · 1911–1992' },
          { t: 'wall', x: 1400, w: 400, h: 80, style: 'brick_red' },
          { t: 'gate', id: 'fs_gate', x: FS.gate - 50, w: 100, h: 70, kind: 'iron', open: true },
          { t: 'sign', id: 'fs_arch', x: FS.gate - 60, y: 206, text: 'FOUNDRY COURTS 1911', color: '#2a2a2e', textColor: '#a8a090', w: 120 },
          { t: 'banner', id: 'fs_banner', x: FS.gate - 64, y: 222, w: 128, text: 'SAVED BY ITS PEOPLE · 1994', color: '#d8d0bc' },
          { t: 'sign', id: 'fs_plaque', x: FS.plaque - 8, y: 252, text: '1994', color: '#8a6a3a', textColor: '#d8c49a', w: 16 },
          { t: 'streetlight', x: 420, on: A.lamps }, { t: 'streetlight', x: 1040, on: A.lamps }, { t: 'streetlight', x: 1480, on: A.lamps },
        ],
        front: [{ t: 'car', id: 'fs_lincoln', x: FS.lincoln, kind: 'sedan', color: '#1a1a1e', face: -1, when: whenOf(o.lincoln || false) }],
      },
      points: { start: { x: FS.stop + 40, y: 300 }, arrive: { x: FS.stop + 40, y: 300 }, gate: { x: FS.gate, y: 300 }, plaque: { x: FS.plaque, y: 300 } },
    });
    L.doors.push(
      Object.assign({ id: 'fs_hq', x: FS.hqDoor, label: 'Council HQ', verb: 'Enter', kind: 'door', to: 'union_hall', tx: UH.street + 24, ty: UH.groundY, face: 1 },
        { locked: (G) => { const ok = isFn(o.hq) ? o.hq(G) : !!o.hq; return ok ? false : (o.hqLocked || 'Locked. OFFICE HOURS TUE / THU 10–4.'); } }),
      { id: 'fs_courts', x: FS.edge, side: 'right', kind: 'edge', auto: true, label: 'Foundry Courts', to: 'courts_yard', tx: 40, ty: CY.groundY, face: 1 },
    );
    return finish(L, o);
  };

  const CY = { groundY: 480, gate: 0, bench: 120, slowKids: 200, bldgA: 250, baptiste: 330, kowalski: 470, laundry: 720, fountain: 900, hopscotch: 1040, oak: 1200, barrel: 1300, hoop: 1450,
    bldgB: 1500, greer: 1580, bldgC: 1660, fireEscape: 1700, landings: [410, 340, 270], bldgCDoor: 1860, workshop: 2150, community: 2420, siteOffice: 2540 };
  // The courtyard (Ch5–Ch7, Ch9, Ending Two). 2600 x 540, ground 480; Building C's fire escape up to the roof door.
  // time · season · phase: 'morning'|'afternoon'|'evening'|'night' (places the residents' routine, BIBLE ch05 NPCs)
  // took4d: bool | (G)=>bool (Building C door leads to 'courts_4d'; default reads G.flags.ch5_took_4d) · siteOffice: true (Ch5)
  // porches: Ch7's residents on three porches (bool) · vigil / laundry: Ch9 props
  P.courtsYard = function (o) {
    o = Object.assign({ year: 1997, time: 'day', season: 'winter', phase: 'afternoon' }, o);
    const G0 = CY.groundY, A = outdoor(o, { time: 'day', season: seasonOf(o) }), winter = seasonOf(o) === 'winter';
    const L = base({
      name: 'Foundry Courts', area: 'Northside', kind: 'exterior', w: 2600, h: 540, ground: G0, map: 'map_northside',
      sky: A.sky, backdrop: 'foundry', weather: A.weather, wet: A.wet, groundStyle: 'yard', ambient: A.ambient,
      sound: { loop: 'courtyard', vol: 0.4 },
      layers: {
        far: [{ t: 'smokestack', x: 1300, h: 190, smoke: false }],
        mid: [{ t: 'wall', x: 0, w: 2600, h: 60, style: 'brick_dark', y: G0 - 40 }],
        back: [
          { t: 'gate', x: 10, w: 60, h: 64, kind: 'iron', open: true, y: G0 },
          { t: 'bench', id: 'cy_bench', x: CY.bench - 17, kind: 'park', y: G0 },
          { t: 'streetlight', id: 'cy_lamp', x: CY.slowKids, on: A.lamps, y: G0 },
          { t: 'sign', x: CY.slowKids - 22, y: G0 - 66, text: 'SLOW — KIDS', color: '#d8d0b8', textColor: '#7a2c2a', w: 44 },
          { t: 'building', id: 'cy_bldg_a', x: CY.bldgA, w: 550, h: 250, style: 'brick', floors: 3, windows: { cols: 9, lit: A.lit + 0.1, seed: 71 }, y: G0,
            fireEscape: 6, door: { dx: CY.baptiste - CY.bldgA - 11, kind: 'wood', label: 'A' } },
          { t: 'stoop', id: 'cy_stoop_a', x: CY.baptiste - 22, w: 44, steps: 2, plant: true, y: G0 },
          { t: 'door', id: 'cy_laundry_door', x: CY.laundry, kind: 'metal', color: '#4a4f48', label: 'LAUNDRY', y: G0 },
          { t: 'notice', id: 'cy_laundry_sheet', x: CY.laundry + 14, y: G0 - 52, lines: ['MON A1-A6', 'TUE A7-B2', 'THU C'] },
          { t: 'planter', id: 'cy_fountain', x: CY.fountain - 50, w: 100, kind: 'stone', flowers: false, y: G0 },
          { t: 'rubble', id: 'cy_snow_fort', x: CY.fountain - 40, w: 80, y: G0, when: whenOf(winter) },
          { t: 'tree', id: 'cy_oak', x: CY.oak, kind: winter ? 'bare' : 'leafy', y: G0 },
          { t: 'barrel', id: 'cy_barrel', x: CY.barrel, fire: o.time !== 'day' || winter, y: G0 },
          { t: 'laundry_line', id: 'cy_clothesline', x0: 800, x1: 1500, y: G0 - 150, sag: 14 },
          { t: 'basketball_hoop', id: 'cy_hoop', x: CY.hoop, face: -1, y: G0 },
          { t: 'building', id: 'cy_bldg_b', x: CY.bldgB, w: 160, h: 240, style: 'brick_red', floors: 3, windows: { cols: 3, lit: A.lit + 0.1, seed: 72 }, y: G0,
            door: { dx: CY.greer - CY.bldgB - 11, kind: 'wood', label: 'B' } },
          { t: 'building', id: 'cy_bldg_c', x: CY.bldgC, w: 340, h: 290, style: 'brick', floors: 4, windows: { cols: 6, lit: A.lit, seed: 73 }, y: G0,
            roof: { tank: true }, door: { dx: CY.bldgCDoor - CY.bldgC - 11, kind: 'wood', label: 'C', fresh: true } },
          { t: 'scaffold', id: 'cy_scaffold', x: CY.bldgC + 200, w: 120, h: 200, y: G0 },
          { t: 'fireescape', id: 'cy_fire_escape', x: CY.fireEscape - 20, w: 60, y: CY.landings[2] - 4, floors: 3, floorH: 70, drop: false },
          { t: 'building', id: 'cy_workshop', x: 2000, w: 300, h: 200, style: 'brick_red', floors: 2, windows: { cols: 4, lit: A.lit + 0.2, seed: 74 }, y: G0, cornice: true },
          { t: 'roll_door', id: 'cy_workshop_door', x: CY.workshop - 40, w: 80, open: false, lit: true, y: G0 },
          { t: 'sign', id: 'cy_workshop_sign', x: CY.workshop - 50, y: G0 - 96, text: 'MAINTENANCE · KNOCK LOUD · MARA', color: '#d8d0b8', textColor: '#3a3a3a', w: 100 },
          { t: 'building', id: 'cy_community', x: 2300, w: 200, h: 190, style: 'stone', floors: 2, windows: { cols: 3, lit: A.lit + 0.2, seed: 75 }, y: G0,
            roof: { antenna: false, chimney: true }, door: { dx: CY.community - 2300 - 11, kind: 'double' } },
          { t: 'container', id: 'cy_site_office', x: CY.siteOffice, color: '#c8c4b8', len: 100, h: 54, text: 'N.C.C.', y: G0 },
          { t: 'streetlight', x: 1000, on: A.lamps, y: G0 }, { t: 'streetlight', x: 2240, on: A.lamps, y: G0 },
        ],
        front: [{ t: 'puddle', x: 1600, w: 60, y: G0, when: whenOf(A.wet) }],
      },
      solids: CY.landings.map((y) => ({ x: CY.fireEscape - 22, y, w: 64, oneway: true, style: 'iron' })),
      points: { start: { x: 60, y: G0 }, arrive: { x: 60, y: G0 }, hopscotch: { x: CY.hopscotch, y: G0 }, stoopA: { x: CY.baptiste, y: G0 },
        fireEscapeTop: { x: CY.fireEscape + 12, y: CY.landings[2] } },
    });
    addFlight(L, ladder({ id: 'cy_fe', x: CY.fireEscape, top: CY.landings[2], bottom: G0, up: 'Fire escape — up', down: 'Fire escape — down' }));
    const took = o.took4d !== undefined ? o.took4d : (G) => flag(G, 'ch5_took_4d');
    L.doors.push(
      { id: 'cy_gate', x: 0, side: 'left', kind: 'edge', auto: true, label: 'Foundry Street', to: 'foundry_street', tx: FS.edge - 40, face: -1 },
      { id: 'cy_roof', x: CY.fireEscape - 18, y: CY.landings[2], w: 20, label: 'Roof of Building C', verb: 'Climb', kind: 'ladder', to: 'courts_roof_c', tx: RC.ladder + 30, face: 1 },
      { id: 'cy_workshop', x: CY.workshop, y: G0, label: "Mara's workshop", verb: 'Enter', kind: 'door', to: 'courts_workshop', tx: WS.door + 30, ty: WS.groundY, face: 1 },
      { id: 'cy_community', x: CY.community, y: G0, label: 'Community building', verb: 'Enter', kind: 'door', to: 'courts_community', tx: CC.door + 30, ty: CC.roomY, face: 1 },
      Object.assign(door({ id: 'cy_site_office', x: CY.siteOffice, y: G0, label: 'Council site office', tx: 40, face: 1 }, o.siteOffice ? 'courts_site_office' : null, "The site office. Nobody's in.")),
      Object.assign({ id: 'cy_4d', x: CY.bldgCDoor, y: G0, label: 'Building C — 4D', verb: 'Enter', kind: 'door', to: 'courts_4d', tx: D4.door - 30, face: -1 },
        { locked: (G) => (isFn(took) ? took(G) : took) ? false : 'Building C. Not my door.' }),
    );
    // The residents' routine by phase (BIBLE ch05 "NPCs present"); chapters patch these by id or pass cast: false.
    const ph = o.phase;
    if (ph === 'morning') L.npcs.push(resident('odette', CY.baptiste + 10, { name: 'Odette', fallback: 'old_woman', pose: 'sweep', face: -1, y: G0 }));
    if (ph === 'afternoon') L.npcs.push(resident('odette', CY.laundry - 20, { name: 'Odette', fallback: 'old_woman', pose: 'work', face: 1, y: G0 }));
    if (ph === 'morning' || ph === 'afternoon') L.npcs.push(resident('gus', CY.hoop - 40, { name: 'Gus', fallback: 'old_man', pose: 'sit', face: 1, y: G0 }));
    if (ph === 'afternoon' || ph === 'evening') L.npcs.push(resident('keisha', CY.hopscotch, { name: 'Keisha', fallback: 'kid', pose: 'idle', face: 1, y: G0,
      path: [{ x: CY.hopscotch - 30, wait: 1.4, pose: 'idle' }, { x: CY.hopscotch + 50, wait: 1.2, pose: 'cheer' }], loop: true }));
    if (ph !== 'night') L.npcs.push(resident('darnell', CY.greer + 20, { name: 'Darnell', fallback: 'worker', pose: 'armsCrossed', face: -1, y: G0 }));
    return finish(L, o);
  };

  const WS = { groundY: 480, loftY: 300, door: 30, bench: 140, pegboard: 120, patterns: 300, bell: 300, stove: 340, payTin: 200, sheet: 230, radio: 260, phone: 380, keys: 410,
    ladder: 446, cot: 560, crate: 640, hotplate: 690, nail: 720, window: 780, wall: 850 };
  // Mara's workshop and the loft (Ch5–Ch7 base; Ch9). 900 x 540: workshop floor y 480, loft y 300 (ladder at x 446). time
  P.courtsWorkshop = function (o) {
    o = Object.assign({ time: 'day' }, o);
    const G0 = WS.groundY, LY = WS.loftY;
    const L = base({
      name: "Mara's workshop", area: 'Northside', kind: 'interior', w: 900, h: 540, ground: G0, map: 'map_northside',
      room: { wall: '#5a4a3e', wall2: '#40362e', floor: '#4a4038', pattern: 'brick', floorPattern: 'concrete', ceiling: 150, trim: '#6a5a48' },
      ambient: indoor(o, 0.24), sound: { loop: 'room', vol: 0.3 },
      layers: {
        back: [
          { t: 'roll_door', x: WS.door - 26, w: 52, open: false, y: G0 },
          { t: 'workbench', id: 'ws_bench', x: WS.bench - 60, w: 120, y: G0 },
          { t: 'tool_wall', id: 'ws_pegboard', x: WS.pegboard - 60, w: 120, h: 50, y: G0 - 110 },
          { t: 'shelf', id: 'ws_patterns', x: WS.patterns - 40, w: 80, h: 30, items: 'boxes', y: G0 - 120 },
          { t: 'stove', id: 'ws_woodstove', x: WS.stove, color: '#2a2622', y: G0 },
          { t: 'radio', id: 'ws_radio', x: WS.radio, y: G0 - 40 },
          { t: 'phone_wall', id: 'ws_phone', x: WS.phone, y: G0 - 80 },
          { t: 'sign', x: WS.phone - 14, y: G0 - 96, text: '555-0172', color: '#4a3a30', textColor: '#d8402f', w: 30 },
          { t: 'bulletin_board', id: 'ws_key_board', x: WS.keys - 14, y: G0 - 84, w: 28, h: 22 },
          { t: 'boxes', x: 60, n: 2, y: G0 },
          // the loft
          { t: 'wall', x: WS.ladder + 14, w: 900 - WS.ladder - 14, h: 18, style: 'concrete', y: LY + 18 },
          { t: 'bed', id: 'ws_cot', x: WS.cot, kind: 'cot', face: -1, y: LY },
          { t: 'crates', id: 'ws_crate_table', x: WS.crate, n: 1, stack: 1, y: LY },
          { t: 'counter', id: 'ws_hotplate', x: WS.hotplate - 14, w: 28, y: LY },
          { t: 'window_city', id: 'ws_window', x: WS.window - 30, y: LY - 100, w: 60, h: 60, view: o.time === 'day' ? 'day' : 'night' },
          { t: 'lamp', x: WS.cot + 30, y: LY - 90, kind: 'bulb' },
          { t: 'lamp', x: WS.bench, y: G0 - 140, kind: 'bulb' },
        ],
      },
      solids: [{ x: WS.ladder + 10, y: LY, w: 900 - WS.ladder - 10, oneway: true, style: 'wood' }],
      lights: [{ x: WS.stove, y: G0 - 14, r: 50, color: '#e86a2a', k: 0.5, flicker: 0.2 }],
      points: { start: { x: WS.door + 40, y: G0 }, bench: { x: WS.bench, y: G0 }, loft: { x: WS.cot + 40, y: LY }, wall: { x: WS.wall, y: LY } },
    });
    addFlight(L, ladder({ id: 'ws_ladder', x: WS.ladder, top: LY, bottom: G0, up: 'Up to the loft', down: 'Down to the workshop', offTop: 26 }));
    L.doors.push({ id: 'ws_door', x: WS.door, y: G0, label: 'The courtyard', verb: 'Leave', kind: 'door', to: 'courts_yard', tx: CY.workshop, ty: CY.groundY, face: -1 });
    return finish(L, o);
  };

  const CC = { roomY: 330, baseY: 690, door: 30, chairs: [180, 210, 240, 270, 300, 330, 360], tables: 440, urn: 520, piano: 600, drawings: 660, singer: 760, minutes: 850, thermometer: 900, can: 940, kitchen: 1040, drip: 1120,
    stairsTop: 1170, stairsFoot: 1040, records: 150, boiler: 420, gauges: 470, logbook: 500, gym: 700, mirrors: 760, ring: 720, bag: 880, speedBag: 950, chalk: 1010, gloves: 1100 };
  // Community building (Ch5–Ch7, Ending Two's gym). 1200 x 720: the community room on y 330 (= L.ground), the basement (gym,
  // Building C boiler room, the padlocked N.C.C. records door) on y 690; stairs at the right. time · meeting: chairs in rows (Ch5/Ch7)
  P.courtsCommunity = function (o) {
    o = Object.assign({ time: 'day' }, o);
    const RY = CC.roomY, BY = CC.baseY;
    const chairs = (o.meeting ? [180, 205, 230, 255, 280, 305, 330, 355, 380, 405] : CC.chairs).map((x, i) => ({ t: 'chair', x, kind: 'folding', face: o.meeting ? 1 : (i % 2 ? 1 : -1), y: RY }));
    const L = base({
      name: 'Foundry Courts — community building', area: 'Northside', kind: 'interior', w: 1200, h: 720, ground: RY, map: 'map_northside',
      floors: [{ x0: 0, x1: 1200, y: BY }],
      room: { wall: '#6a5a48', wall2: '#4a4036', floor: '#4a4440', pattern: 'plaster', floorPattern: 'concrete', ceiling: 80, trim: '#7a6a54', wainscot: 0 },
      ambient: indoor(o, 0.22), sound: { loop: 'room', vol: 0.3 },
      layers: {
        back: [{ t: 'wall', id: 'cc_basement_wall', x: 0, w: 1200, h: BY - RY - 8, y: BY, style: 'concrete' }].concat(chairs).concat([
          { t: 'door', x: CC.door, kind: 'double', color: '#4a3a30', y: RY },
          { t: 'table', id: 'cc_tables', x: CC.tables - 30, w: 60, kind: 'folding', y: RY },
          { t: 'counter', id: 'cc_urn', x: CC.urn - 16, w: 32, y: RY },
          { t: 'counter', id: 'cc_piano', x: CC.piano - 24, w: 48, color: '#2a2420', y: RY },
          { t: 'picture', id: 'cc_drawings', x: CC.drawings - 10, y: RY - 120, w: 20, h: 14, kind: 'poster' },
          { t: 'window', id: 'cc_singer_window', x: CC.singer - 26, y: RY - 130, w: 52, h: 64, lit: o.time !== 'night', curtains: true },
          { t: 'table', id: 'cc_singer', x: CC.singer - 14, w: 28, kind: 'wood', y: RY },
          { t: 'shelf', id: 'cc_minutes_shelf', x: CC.minutes - 20, w: 40, h: 40, items: 'files', y: RY - 30 },
          { t: 'poster', id: 'cc_thermometer', x: CC.thermometer - 8, y: RY - 120, kind: 'notice', text: 'COURTS FUND' },
          { t: 'stove', x: CC.kitchen, y: RY }, { t: 'counter', x: CC.kitchen + 30, w: 60, y: RY }, { t: 'bucket', id: 'cc_drip_bucket', x: CC.drip, y: RY },
          // basement: records door, boiler room, gym
          { t: 'door', id: 'cc_records_door', x: CC.records, kind: 'metal', color: '#4a4f48', label: 'N.C.C. RECORDS', y: BY },
          { t: 'boiler', id: 'cc_boiler', x: CC.boiler, y: BY }, { t: 'pipes', x: CC.boiler - 80, w: 200, y: BY - 150 },
          { t: 'mirror', x: CC.mirrors, y: BY - 70, w: 40, h: 50 }, { t: 'mirror', x: CC.mirrors + 50, y: BY - 70, w: 40, h: 50 },
          { t: 'rug', id: 'cc_tape_ring', x: CC.ring, w: 140, color: '#8a2a24', y: BY },
          { t: 'pipes', x: CC.bag - 40, w: 80, y: BY - 66 },
          { t: 'heavy_bag', id: 'cc_bag', x: CC.bag, y: BY },     // heavy_bag reads y as its floor line (and chain top)
          { t: 'speed_bag', id: 'cc_speed_bag', x: CC.speedBag, y: BY },
          { t: 'chalkboard', id: 'cc_kids_board', x: CC.chalk - 30, y: BY - 110, w: 60, h: 36, lines: ['SAT 9 AM KIDS CLASS', 'D. TILLERY'] },
          { t: 'crates', id: 'cc_gloves', x: CC.gloves, n: 1, stack: 1, y: BY },
          { t: 'lamp', x: CC.boiler, y: BY - 130, kind: 'bulb' }, { t: 'lamp', x: CC.bag, y: BY - 140, kind: 'bulb' },
        ]),
        front: [{ t: 'ceiling_light', x: 300, y: 82, kind: 'pendant' }, { t: 'ceiling_light', x: 800, y: 82, kind: 'pendant' }],
      },
      solids: [{ x: 0, y: RY, w: 1200, oneway: true, style: 'wood' }],
      training: { bag: { x: CC.bag }, mitts: { x: CC.ring + 70 } },
      points: { start: { x: CC.door + 40, y: RY }, room: { x: 400, y: RY }, singer: { x: CC.singer, y: RY }, gym: { x: CC.bag - 40, y: BY }, boiler: { x: CC.boiler, y: BY } },
    });
    addFlight(L, stairs({ id: 'cc_stairs', from: { x: CC.stairsFoot, y: BY }, to: { x: CC.stairsTop, y: RY }, up: 'Upstairs — community room', down: 'Downstairs — the gym', draw: 'wood', runner: false }));
    L.doors.push(
      { id: 'cc_door', x: CC.door, y: RY, label: 'The courtyard', verb: 'Leave', kind: 'door', to: 'courts_yard', tx: CY.community, ty: CY.groundY, face: -1 },
      closed({ id: 'cc_records', x: CC.records, y: BY, label: 'N.C.C. — RECORDS' }, 'Council files. Not mine to open.'),
    );
    return finish(L, o);
  };

  const RC = { ladder: 40, patch: 500, scaffold: 120, buckets: 760, thermos: 790, view: 900 };
  // Roof of Building C (Ch5 sunset with Mara; Ch7 11 PM). time 'dusk' | 'late'
  P.courtsRoofC = function (o) {
    o = Object.assign({ time: 'dusk', season: 'winter' }, o);
    const A = outdoor(o, { time: 'dusk', season: seasonOf(o) });
    const L = base({
      name: 'Roof of Building C', area: 'Northside', kind: 'exterior', w: 1000, map: 'map_northside',
      sky: A.sky, backdrop: 'river+foundry', weather: A.weather, wet: A.wet, groundStyle: 'rooftop', ambient: A.ambient, sound: { loop: 'wind', vol: 0.45 },
      layers: {
        far: [{ t: 'smokestack', x: 600, h: 200, smoke: false }],
        back: [
          { t: 'scaffold', id: 'rc_scaffold', x: RC.scaffold - 30, w: 60, h: 30 },
          { t: 'rug', id: 'rc_patch', x: RC.patch - 40, w: 80, color: '#2a2a2e' },
          { t: 'bucket', id: 'rc_bucket_a', x: RC.buckets }, { t: 'bucket', id: 'rc_bucket_b', x: RC.buckets + 22 },
          { t: 'water_tank', x: 300 }, { t: 'pole', x: 640, h: 40 },
        ],
      },
      points: { start: { x: RC.ladder + 30, y: 300 }, buckets: { x: RC.buckets + 10, y: 300 } },
    });
    L.doors.push({ id: 'rc_down', x: RC.ladder, label: 'Fire escape — down', verb: 'Climb', kind: 'ladder', to: 'courts_yard', tx: CY.fireEscape + 30, ty: CY.landings[2], face: -1 });
    return finish(L, o);
  };

  const D4 = { door: 600, mattress: 300, radiator: 420, window: 200, sill: 200, wall: 120 };
  // Unit 4D, Building C (only if ch5_took_4d; Ch5–Ch6 base). time
  P.courts4d = function (o) {
    o = Object.assign({ time: 'evening' }, o);
    const L = base({
      name: 'Unit 4D', area: 'Northside', kind: 'interior', w: 640, map: 'map_northside',
      room: { wall: '#c8bea4', wall2: '#a89e86', floor: '#6a5a48', pattern: 'plaster', floorPattern: 'wood', ceiling: 60, trim: '#d8d0bc' },
      ambient: indoor(o, 0.18), sound: { loop: 'room', vol: 0.2 },
      layers: {
        back: [
          { t: 'window_city', id: 'd4_window', x: D4.window - 36, y: 100, w: 72, h: 70, view: o.time === 'day' ? 'day' : 'night' },
          { t: 'mattress', id: 'd4_mattress', x: D4.mattress },
          { t: 'pipes', id: 'd4_radiator', x: D4.radiator - 14, w: 28, y: 272 },
          { t: 'door', x: D4.door, kind: 'wood', color: '#e8e4d8', fresh: true, label: '4D' },
          { t: 'lamp', x: 380, y: 110, kind: 'bulb' },
        ],
      },
      points: { start: { x: D4.door - 40, y: 300 }, mattress: { x: D4.mattress, y: 300 } },
    });
    L.doors.push({ id: 'd4_door', x: D4.door, label: 'The courtyard', verb: 'Leave', kind: 'door', to: 'courts_yard', tx: CY.bldgCDoor, ty: CY.groundY, face: 1 });
    return finish(L, o);
  };

  const UH = { groundY: 470, balconyY: 230, baseY: 700, street: 40, trophies: 140, pantry: 300, wanda: 480, cooler: 560, plaque: 620, hallDoors: 690, stage: 1300, lectern: 1330, mural: 760,
    pews: [760, 860, 960, 1060, 1160, 1260, 1360], office: 1490, transom: 1490, upFoot: 1440, upHead: 1572, baseFoot: 1330, baseHead: 1500, archive: 700, typing: 900, steno: 930, bulb: 900 };
  // Council HQ, the old Local 1197 hall (Ch7, Ch9). 1600 x 720, three levels: balcony y 230 (Rook's office door at the far
  // end), ground floor y 470 = L.ground (lobby, pantry, assembly hall), basement y 700 (the archive). time · pantry: the line until noon
  P.unionHall = function (o) {
    o = Object.assign({ time: 'day' }, o);
    const GY = UH.groundY, BY = UH.balconyY, AY = UH.baseY;
    const L = base({
      name: 'Council HQ — Local 1197 hall', area: 'Northside', kind: 'interior', w: 1600, h: 720, ground: GY, map: 'map_northside',
      floors: [{ x0: 0, x1: 1600, y: AY }],
      room: { wall: '#6a5a48', wall2: '#4a3e34', floor: '#4a3c32', pattern: 'paneling', floorPattern: 'wood', ceiling: 70, trim: '#8a7458', wainscot: 0 },
      ambient: indoor(o, o.time === 'dusk' ? 0.4 : 0.24), sound: { loop: 'room', vol: 0.3 },
      layers: {
        back: [
          // the basement's back wall, under the ground-floor slab (L.ground is the ground floor; the basement is a lower floor)
          { t: 'wall', id: 'uh_basement_wall', x: 0, w: 1600, h: AY - GY - 8, y: AY, style: 'concrete' },
          // ground floor
          { t: 'door', x: UH.street, kind: 'double', color: '#4a3a2a', y: GY },
          { t: 'trophy_case', id: 'uh_trophies', x: UH.trophies - 30, w: 60, lit: true, y: GY },
          { t: 'picture', id: 'uh_strike_photo', x: UH.trophies + 40, y: GY - 120, w: 24, h: 16, kind: 'photo' },
          { t: 'table', id: 'uh_pantry', x: UH.pantry - 60, w: 120, kind: 'folding', y: GY },
          { t: 'shelf', x: UH.pantry - 50, w: 100, h: 36, items: 'cans', y: GY - 40 },
          { t: 'sign', x: UH.pantry - 30, y: GY - 110, text: 'PANTRY 10–12', color: '#d8d0b8', textColor: '#3a4a3a', w: 60 },
          { t: 'desk', id: 'uh_wanda_desk', x: UH.wanda - 24, w: 48, kind: 'office', y: GY },
          { t: 'water_cooler', x: UH.cooler, y: GY },
          { t: 'notice', id: 'uh_plaque', x: UH.plaque - 20, y: GY - 120, lines: ['NO FAMILY', 'SHOULD FACE', 'HARDSHIP ALONE'] },
          { t: 'door', x: UH.hallDoors, kind: 'double', color: '#5a4430', open: true, y: GY },
          { t: 'mural', id: 'uh_mural', x: UH.mural, y: 300, w: 560, h: 110, text: '1937' },
          { t: 'stairs', id: 'uh_stage', x: UH.stage - 60, w: 120, h: 10, y: GY },
          { t: 'desk', id: 'uh_lectern', x: UH.lectern - 8, w: 16, kind: 'school', y: GY - 10 },
          { t: 'counter', id: 'uh_piano', x: UH.stage + 50, w: 40, color: '#d8d4c8', y: GY - 10 },
          // balcony
          { t: 'banner', x: 760, y: BY + 8, w: 120, text: 'LOCAL 1197', color: '#6a2a24' }, { t: 'banner', x: 1060, y: BY + 8, w: 120, text: 'UNITY', color: '#2a4a6a' },
          { t: 'door', id: 'uh_office_door', x: UH.office, kind: 'wood', color: '#5a4430', label: 'W. ROOK', y: BY },
          { t: 'window', id: 'uh_transom', x: UH.transom - 12, y: BY - 74, w: 24, h: 10, lit: true },
          // basement archive
          { t: 'shelving', id: 'uh_archive_a', x: UH.archive - 100, w: 160, h: 110, stock: 'boxes', y: AY },
          { t: 'shelving', id: 'uh_archive_b', x: UH.archive + 340, w: 160, h: 110, stock: 'boxes', y: AY },
          { t: 'table', id: 'uh_typing_table', x: UH.typing - 24, w: 48, kind: 'wood', y: AY },
          { t: 'lamp', id: 'uh_archive_bulb', x: UH.bulb, y: AY - 130, kind: 'bulb' },
        ].concat(UH.pews.map((x) => ({ t: 'bench', x: x - 30, w: 60, kind: 'pew', y: BY })))
          .concat([780, 840, 900, 960, 1020, 1080, 1140, 1200].map((x) => ({ t: 'chair', x, kind: 'folding', face: 1, y: GY }))),
        front: [{ t: 'ceiling_light', x: 300, y: 72, kind: 'pendant' }, { t: 'ceiling_light', x: 1000, y: 72, kind: 'pendant' }],
      },
      solids: [{ x: 0, y: GY, w: 1600, oneway: true, style: 'wood' }, { x: 640, y: BY, w: 960, oneway: true, style: 'wood' }],
      points: { start: { x: UH.street + 40, y: GY }, arrive: { x: UH.street + 40, y: GY }, wanda: { x: UH.wanda, y: GY }, hall: { x: 1000, y: GY },
        balcony: { x: 1200, y: BY }, office: { x: UH.office - 30, y: BY }, archive: { x: UH.typing, y: AY } },
    });
    addFlight(L, stairs({ id: 'uh_up', from: { x: UH.upFoot, y: GY }, to: { x: UH.upHead, y: BY }, up: 'Upstairs — the balcony', down: 'Downstairs — the hall', draw: 'wood' }));
    addFlight(L, stairs({ id: 'uh_base', from: { x: UH.baseFoot, y: AY }, to: { x: UH.baseHead, y: GY }, up: 'Upstairs — the hall', down: 'Downstairs — the archive', draw: 'wood', runner: false }));
    L.doors.push(
      { id: 'uh_street', x: UH.street, y: GY, label: 'Foundry Street', verb: 'Leave', kind: 'door', to: 'foundry_street', tx: FS.hqDoor, face: 1 },
      { id: 'uh_office', x: UH.office, y: BY, label: "Rook's office", verb: 'Enter', kind: 'door', to: 'rook_office', tx: 50, face: 1 },
    );
    L.npcs.push(resident('wanda', UH.wanda + 4, { name: 'Wanda', fallback: 'old_woman', pose: 'sit', face: 1, y: GY }));
    return finish(L, o);
  };

  const RO = { door: 30, chairs: [140, 190], desk: 330, letters: 360, rejections: [430, 470, 510, 550], card: 600, photo: 640, rack: 700, cap: 700, radiator: 760, window: 740 };
  // Rook's office (Ch7; Ch9 visit). time
  P.rookOffice = function (o) {
    o = Object.assign({ time: 'day' }, o);
    const L = base({
      name: "Rook's office", area: 'Northside', kind: 'interior', w: 800, map: 'map_northside',
      room: { wall: '#6a5a48', wall2: '#4a3e34', floor: '#4a3c32', pattern: 'paneling', floorPattern: 'wood', ceiling: 62, trim: '#8a7458', wainscot: 40 },
      ambient: indoor(o, 0.26), sound: { loop: 'room', vol: 0.25 }, weather: o.rain ? undefined : undefined,
      layers: {
        back: [
          { t: 'door', x: RO.door, kind: 'wood', color: '#5a4430' },
          { t: 'chair', id: 'ro_chair_cushion', x: RO.chairs[0], kind: 'wood', face: 1 }, { t: 'chair', x: RO.chairs[1], kind: 'wood', face: 1 },
          { t: 'desk', id: 'ro_desk', x: RO.desk - 30, w: 64, kind: 'executive' },
          { t: 'lamp', x: RO.desk + 20, y: 262, kind: 'desk', on: true, color: '#9ad87a' },
          { t: 'picture', id: 'ro_union_card', x: RO.card - 8, y: 140, w: 16, h: 12, kind: 'certificate' },
          { t: 'picture', id: 'ro_photo_baptiste', x: RO.photo - 8, y: 150, w: 16, h: 11, kind: 'photo' },
          { t: 'window_city', id: 'ro_window', x: RO.window - 34, y: 104, w: 68, h: 64, view: o.time === 'day' ? 'day' : 'night' },
          { t: 'pipes', x: RO.radiator - 14, w: 28, y: 272 },
          { t: 'clock', x: 380, y: 100 },
        ].concat(RO.rejections.map((x) => ({ t: 'picture', x: x - 8, y: 136, w: 16, h: 12, kind: 'frame' }))),
      },
      points: { start: { x: RO.door + 40, y: 300 }, desk: { x: RO.desk, y: 300 }, window: { x: RO.window, y: 300 } },
    });
    L.doors.push({ id: 'ro_door', x: RO.door, label: 'The balcony', verb: 'Leave', kind: 'door', to: 'union_hall', tx: UH.office - 24, ty: UH.balconyY, face: -1 });
    return finish(L, o);
  };

  /* ── 10. Downtown: Market Street, Kwik Copy, Garrison Street, the cemetery ── */

  const MS = { stop: 60, kwik: 120, kwikDoor: 340, newsstand: 430, n88: 500, dental: 520, fundDoor: 770, savings: 820, alley: 1180, dumpster: 1260 };
  // Market Street (Ch6; Ch7+ the Fund office FOR LEASE; Ch8 dawn). time · forLease: true from Ch7 · fund: 'fund_office' | null
  P.marketStreet = function (o) {
    o = Object.assign({ year: 1997, time: 'dusk', season: 'winter' }, o);
    const A = outdoor(o, { time: 'dusk', season: seasonOf(o) });
    const L = base({
      name: 'Market Street', area: 'Downtown', kind: 'exterior', w: 1400, map: 'map_downtown',
      sky: A.sky, backdrop: 'towers', weather: A.weather, wet: A.wet, groundStyle: 'street', ambient: A.ambient, sound: { loop: 'traffic', vol: 0.45 },
      layers: {
        back: [
          { t: 'bus_stop', id: 'ms_stop', x: MS.stop, sign: 'ROUTE 9', shelter: true },
          { t: 'building', id: 'ms_kwik', x: MS.kwik, w: 260, h: 200, style: 'brick', floors: 3, windows: { cols: 5, lit: A.lit, seed: 81 },
            shop: { sign: 'KWIK COPY', color: '#8a2a24', window: 'lit', interior: 'store' }, door: { dx: MS.kwikDoor - MS.kwik - 11, kind: 'glass' } },
          { t: 'table', id: 'ms_newsstand', x: MS.newsstand - 20, w: 40, kind: 'cart' }, { t: 'awning', x: MS.newsstand - 26, w: 52, color: '#3a4a5a', stripes: true },
          { t: 'newspapers', x: MS.newsstand + 26 },
          { t: 'building', id: 'ms_88', x: MS.n88, w: 300, h: 230, style: 'brick_dark', floors: 3, windows: { cols: 5, lit: o.forLease ? 0.05 : A.lit, seed: 82 },
            shop: { sign: 'BRANDT DENTAL', color: '#6a4a5a', window: o.time === 'late' ? 'dark' : 'lit' }, door: { dx: MS.fundDoor - MS.n88 - 11, kind: 'wood', label: '88' } },
          { t: 'sign', id: 'ms_tooth', x: MS.dental + 40, y: 196, text: 'TOOTH', neon: true, color: '#e87aa8', w: 30 },
          { t: 'notice', id: 'ms_directory', x: MS.fundDoor + 14, y: 240, lines: ['2F CALDER FOUNDRY', 'RELIEF FUND', 'G. PIKE'] },
          { t: 'sign', id: 'ms_for_lease', x: MS.n88 + 120, y: 120, text: 'FOR LEASE', color: '#d8d0b8', textColor: '#7a2c2a', w: 50, when: whenOf(o.forLease) },
          { t: 'building', id: 'ms_savings', x: MS.savings, w: 300, h: 240, style: 'stone', floors: 3, windows: { cols: 5, lit: A.lit * 0.6, seed: 83 },
            shop: { sign: 'FIRST CALDER SAVINGS', color: '#3a4a5a', window: o.time === 'day' ? 'lit' : 'dark' } },
          { t: 'alley_gap', x: MS.alley - 40, w: 80 }, { t: 'dumpster', x: MS.dumpster, color: '#3f5246' },
          { t: 'streetlight', x: 460, on: A.lamps }, { t: 'streetlight', x: 1140, on: A.lamps },
        ],
      },
      points: { start: { x: MS.stop + 40, y: 300 }, arrive: { x: MS.stop + 40, y: 300 }, newsstand: { x: MS.newsstand, y: 300 } },
    });
    L.doors.push(
      { id: 'ms_kwik', x: MS.kwikDoor, label: 'Kwik Copy', verb: 'Enter', kind: 'door', to: 'kwik_copy', tx: 40, face: 1 },
      door({ id: 'ms_88', x: MS.fundDoor, label: '88 Market — 2F', tx: 40, face: 1 }, o.fund !== undefined ? o.fund : (o.forLease ? null : 'fund_office'),
        'FOR LEASE. The Fund is gone.'),
    );
    return finish(L, o);
  };

  const KC = { door: 30, counter: 160, bell: 150, dot: 200, copiers: [340, 420], booth: 200, curtain: 520, cubbies: 640, minCubby: 650, cork: 730 };
  // Kwik Copy (Ch6 the film roll; Ch8 at dawn). time · flyer: the sun-faded 1995 MISSING flyer on the corkboard (Ch8)
  P.kwikCopy = function (o) {
    o = Object.assign({ time: 'day' }, o);
    const L = base({
      name: 'Kwik Copy', area: 'Downtown', kind: 'interior', w: 800, map: 'map_downtown',
      room: { wall: '#7a7a72', wall2: '#5a5a52', floor: '#5a5a56', pattern: 'plaster', floorPattern: 'tile', ceiling: 60, trim: '#8a2a24', wainscot: 30 },
      ambient: indoor(o, o.time === 'dawn' ? 0.34 : 0.1), sound: { loop: 'hum', vol: 0.35 },
      layers: {
        back: [
          { t: 'door', x: KC.door, kind: 'glass', color: '#6a2a24', lit: true },
          { t: 'counter', id: 'kc_counter', x: KC.counter - 70, w: 140, color: '#8a2a24' },
          { t: 'picture', id: 'kc_booth_strip', x: KC.booth - 4, y: 150, w: 8, h: 22, kind: 'photo' },
          { t: 'copier', id: 'kc_copier_a', x: KC.copiers[0] }, { t: 'copier', id: 'kc_copier_b', x: KC.copiers[1] },
          { t: 'curtain', id: 'kc_lab_curtain', x: KC.curtain - 16, w: 32, open: false, color: '#2a2a2e' },
          { t: 'shelf', id: 'kc_cubbies', x: KC.cubbies - 30, w: 60, h: 40, items: 'files', y: 250 },
          { t: 'bulletin_board', id: 'kc_cork', x: KC.cork - 26, y: 160, w: 52, h: 40 },
          { t: 'poster', id: 'kc_missing_flyer', x: KC.cork - 10, y: 166, kind: 'missing', torn: false, when: whenOf(o.flyer) },
        ],
        front: [200, 450, 680].map((x, i) => ({ t: 'ceiling_light', x, kind: 'fluorescent', flicker: o.time === 'dawn' && i === 2 ? 0.5 : 0 })),
      },
      points: { start: { x: KC.door + 40, y: 300 }, counter: { x: KC.counter, y: 300 }, cubby: { x: KC.minCubby, y: 300 } },
    });
    L.doors.push({ id: 'kc_door', x: KC.door, label: 'Market Street', verb: 'Leave', kind: 'door', to: 'market_street', tx: MS.kwikDoor, face: 1 });
    L.npcs.push(resident('dot', KC.dot, { name: 'Dot', fallback: 'woman', pose: 'work', face: 1 }));
    return finish(L, o);
  };

  const GS = { groundY: 360, stop: 60, pawn: 120, suds: 380, sudsDoor: 600, lot: 700, mattress: 760, lindell: 880, lindellGap: 1090, flowers: 1180, pole: 1340, flyer: 1340, realty: 1400, cut: 1700 };
  // Garrison Street, The Flats (Ch6; Ch9 SOLD on the fence). 1800 x 420, ground 360. time · weather (rain or fog by default)
  // sold: 'SOLD — RIVERSIDE HOLDINGS' on the fence · suds / lindell: door targets ('garrison_suds' / 'lindell_ruin' | null)
  P.garrisonStreet = function (o) {
    o = Object.assign({ year: 1997, time: 'overcast', season: 'winter', weather: 'drizzle' }, o);
    const G0 = GS.groundY, A = outdoor(o, { time: 'overcast', fog: 0.18 });
    const L = base({
      name: 'Garrison Street', area: 'The Flats', kind: 'exterior', w: 1800, h: 420, ground: G0, map: 'map_garrison',
      sky: A.sky, backdrop: 'rowhouses', weather: A.weather, wet: A.wet, groundStyle: 'street', ambient: A.ambient, sound: { loop: 'rain', vol: 0.35 },
      layers: {
        back: [
          { t: 'bus_stop', id: 'gs_stop', x: GS.stop, sign: '14', shelter: false, y: G0 },
          { t: 'building', id: 'gs_pawn', x: GS.pawn, w: 250, h: 190, style: 'brick', floors: 3, windows: { cols: 4, lit: 0.1, seed: 101 }, y: G0,
            shop: { sign: "DUFFY'S PAWN", color: '#5a4a2a', window: 'dark', interior: 'pawn' } },
          { t: 'roll_door', x: GS.pawn + 60, w: 120, open: false, y: G0 },
          { t: 'building', id: 'gs_suds', x: GS.suds, w: 270, h: 200, style: 'brick_red', floors: 3, windows: { cols: 4, lit: 0.4, seed: 102 }, y: G0,
            shop: { sign: 'GARRISON SUDS', color: '#3d5168', window: 'lit', interior: 'laundry' }, door: { dx: GS.sudsDoor - GS.suds - 11, kind: 'glass' } },
          { t: 'mattress', id: 'gs_mattress', x: GS.mattress, y: G0 }, { t: 'rubble', x: GS.lot, w: 120, y: G0 },
          { t: 'building', id: 'gs_lindell', x: GS.lindell, w: 300, h: 230, style: 'brick_dark', floors: 3, windows: { cols: 6, lit: 0, boarded: 0.5, broken: 0.5, seed: 103 }, y: G0 },
          { t: 'fire_damage', x: GS.lindell + 120, w: 160, h: 150, y: G0 - 70 },
          { t: 'soot', x: GS.lindell + 20, w: 260, h: 60, y: G0 - 170 },
          { t: 'fence', id: 'gs_lindell_fence', x: GS.lindell - 20, w: 340, kind: 'chain', y: G0 },
          { t: 'notice', id: 'gs_condemned', x: GS.lindell + 40, y: G0 - 50, lines: ['CONDEMNED', 'DO NOT ENTER'] },
          { t: 'flowers', id: 'gs_church_flowers', x: GS.flowers, kind: 'wrapped', y: G0 },
          { t: 'sign', id: 'gs_sold', x: GS.lindell + 160, y: G0 - 66, text: 'SOLD — RIVERSIDE HOLDINGS', color: '#d8d0b8', textColor: '#7a2c2a', w: 110, when: whenOf(o.sold) },
          { t: 'pole', id: 'gs_pole', x: GS.pole, y: G0 },
          { t: 'flyer', id: 'gs_min_flyer', x: GS.flyer - 5, y: G0 - 70, text: 'MISSING' },
          { t: 'building', id: 'gs_realty', x: GS.realty, w: 260, h: 170, style: 'siding', floors: 2, windows: { cols: 4, lit: 0.05, seed: 104 }, y: G0,
            shop: { sign: 'GARRISON REALTY', color: '#4a4a3a', window: 'dark' } },
          { t: 'sign', x: GS.realty + 60, y: G0 - 110, text: 'FOR SALE — DEVELOPMENT OPPORTUNITY', color: '#d8d0b8', textColor: '#3a3a3a', w: 140 },
          { t: 'fence', x: GS.cut, w: 100, kind: 'wood', y: G0 },
          { t: 'streetlight', x: 340, on: A.lamps, y: G0 }, { t: 'streetlight', x: 1280, on: A.lamps, y: G0, flicker: 0.4 },
        ],
        front: [{ t: 'puddle', x: 500, w: 60, y: G0 }, { t: 'puddle', x: 1500, w: 50, y: G0 }],
      },
      points: { start: { x: GS.stop + 40, y: G0 }, arrive: { x: GS.stop + 40, y: G0 }, fence: { x: GS.lindellGap, y: G0 } },
    });
    L.doors.push(
      door({ id: 'gs_suds', x: GS.sudsDoor, y: G0, label: 'Garrison Suds', tx: 40, face: 1 }, o.suds !== undefined ? o.suds : 'garrison_suds', 'Closed.'),
      door({ id: 'gs_lindell', x: GS.lindellGap, y: G0, label: 'Gap in the fence', verb: 'Go through', tx: 60, face: 1 }, o.lindell !== undefined ? o.lindell : 'lindell_ruin', 'Not now.'),
    );
    return finish(L, o);
  };

  const CEM = { groundY: 360, gate: 40, cart: 110, office: 260, plots: [380, 460, 540, 620], s14: 760, marker31: 900, marker32: 924, cross: 912, stone: 912, flowers: 912, bench: 1220, tree: 1250 };
  // Calder Municipal Cemetery, Section 14 (Ch6, Ch9). 1400 x 420, ground 360. time
  // flowers: bool | (G)=>bool (the flowers stay; default reads G.flags.ch6_flowers)
  P.cemeteryS14 = function (o) {
    o = Object.assign({ year: 1997, time: 'day', season: 'winter' }, o);
    const G0 = CEM.groundY, A = outdoor(o, { time: 'day', season: seasonOf(o) });
    const markers = [];
    for (let i = 0; i < 9; i++) { const x = CEM.s14 + i * 40; if (x !== 900 && x !== 920) markers.push({ t: 'memorial', x, text: '', y: G0 }); }
    const L = base({
      name: 'Calder Municipal Cemetery — Section 14', area: 'North hill', kind: 'exterior', w: 1400, h: 420, ground: G0, map: 'map_cemetery',
      sky: o.sky || 'day', backdrop: 'river+towers', weather: A.weather, groundStyle: 'gravel', ambient: Object.assign(A.ambient, { fog: 0.05 }), sound: { loop: 'wind', vol: 0.35 },
      layers: {
        far: [{ t: 'smokestack', x: 400, h: 140, smoke: false }, { t: 'building', id: 'cem_tower', x: 1000, w: 50, h: 280, style: 'concrete', floors: 12, windows: { cols: 2, lit: 0.4, seed: 111 }, cornice: false }],
        back: [
          { t: 'gate', x: CEM.gate - 30, w: 60, h: 60, kind: 'iron', open: true, y: G0 },
          { t: 'table', id: 'cem_cart', x: CEM.cart - 20, w: 40, kind: 'cart', y: G0 }, { t: 'flowers', x: CEM.cart, kind: 'wrapped', y: G0 - 18 },
          { t: 'building', id: 'cem_office', x: CEM.office - 60, w: 120, h: 90, style: 'stone', floors: 1, windows: { cols: 2, lit: 0.6, seed: 112 }, y: G0, door: { dx: 50 } },
          { t: 'tree', x: 330, kind: 'bare', y: G0 },
        ].concat(CEM.plots.map((x) => ({ t: 'memorial', x, text: '', y: G0 }))).concat(markers).concat([
          { t: 'memorial', id: 'cem_marker_031', x: CEM.marker31, text: '96-031', y: G0 },
          { t: 'memorial', id: 'cem_marker_032', x: CEM.marker32, text: '96-032', y: G0 },
          { t: 'memorial', id: 'cem_cross', x: CEM.cross, text: 'ST. COLUMBA\'S REMEMBERS', y: G0 },
          { t: 'memorial', id: 'cem_stone', x: CEM.stone + 6, text: 'SEO', y: G0 - 2 },
          { t: 'flowers', id: 'cem_flowers', x: CEM.flowers, y: G0, when: o.flowers !== undefined ? whenOf(o.flowers) : (G) => flag(G, 'ch6_flowers') },
          { t: 'bench', id: 'cem_bench', x: CEM.bench - 17, kind: 'park', y: G0 },
          { t: 'tree', id: 'cem_tree', x: CEM.tree, kind: seasonOf(o) === 'spring' ? 'leafy' : 'bare', y: G0 },
        ]),
      },
      points: { start: { x: CEM.gate + 40, y: G0 }, arrive: { x: CEM.gate + 40, y: G0 }, graves: { x: CEM.marker31 + 12, y: G0 }, bench: { x: CEM.bench, y: G0 } },
    });
    return finish(L, o);
  };

  /* ── 11. Riverfront: Ashgrove Plaza, the lobby, the river path ─────── */

  const AP = { groundY: 360, stop: 60, fountain: 360, statue: 640, revolving: 1180, river: 1350, tower: 840 };
  // Ashgrove Plaza (Ch9; Ending One). 1400 x 420, ground 360. time · weather ('drizzle' Wednesday night)
  P.ashgrovePlaza = function (o) {
    o = Object.assign({ year: 1997, time: 'night', season: 'spring' }, o);
    const G0 = AP.groundY, A = outdoor(o, { time: 'night', season: 'spring' });
    const L = base({
      name: 'Ashgrove Plaza', area: 'Riverfront', kind: 'exterior', w: 1400, h: 420, ground: G0, map: 'map_riverfront',
      sky: A.sky, backdrop: 'river+towers', weather: A.weather, wet: A.wet || true, groundStyle: 'concrete', ambient: A.ambient, sound: { loop: 'wind', vol: 0.4 },
      layers: {
        back: [
          { t: 'bus_stop', id: 'ap_stop', x: AP.stop, sign: 'ROUTE 9', shelter: true, y: G0 },
          { t: 'building', id: 'ap_tower', x: AP.tower, w: 440, h: 350, style: 'concrete', floors: 12, windows: { cols: 9, lit: 0.04, seed: 121 }, cornice: false, y: G0,
            door: { dx: AP.revolving - AP.tower - 18, kind: 'double', w: 36 } },
          { t: 'planter', id: 'ap_fountain', x: AP.fountain - 50, w: 100, kind: 'stone', flowers: false, y: G0 },
          { t: 'art', id: 'ap_momentum', x: AP.fountain - 14, y: G0 - 50, w: 28, h: 28 },
          { t: 'memorial', id: 'ap_plaque', x: AP.statue, text: 'THE WORKER', y: G0 },
          { t: 'fence', x: 1300, w: 100, kind: 'iron', y: G0 },
          { t: 'spotlight', x: AP.statue, y: G0 - 4, dir: 'up', width: 40, on: true },
          { t: 'streetlight', x: 220, on: true, y: G0 }, { t: 'streetlight', x: 1260, on: true, y: G0 },
        ],
      },
      points: { start: { x: AP.stop + 40, y: G0 }, arrive: { x: AP.stop + 40, y: G0 }, statue: { x: AP.statue, y: G0 }, doors: { x: AP.revolving, y: G0 } },
    });
    // The statue: a figure in bronze (no talk), the foundry man with a ladle.
    L.npcs.push({ id: 'ap_statue', x: AP.statue, y: G0 - 14, face: 1, pose: 'work', name: 'The Worker', _res: true,
      look: { h: 52, build: 'broad', skin: '#7a5a34', hair: { style: 'cap', color: '#6a4a2a' }, top: { kind: 'jacket', color: '#7a5a34' }, bottom: { kind: 'pants', color: '#6a4a2c' }, shoes: '#5a4024' } });
    L.doors.push(
      door({ id: 'ap_lobby', x: AP.revolving, y: G0, label: 'Ashgrove Tower', tx: 60, face: 1 }, o.lobby !== undefined ? o.lobby : 'ashgrove_lobby', 'Closed.'),
      door({ id: 'ap_river', x: AP.river, y: G0, label: 'Steps down to the river', verb: 'Take', kind: 'stairs', tx: 60, face: 1 }, o.river !== undefined ? o.river : 'river_path', 'Not now.'),
    );
    return finish(L, o);
  };

  const AL = { groundY: 420, revolving: 40, desk: 300, benches: [520, 600], donors: 780, model: 1020, elevators: [1250, 1320], stair: 1500 };
  // Ashgrove Tower lobby (Ch9; Ending One's press conference with `press: true`). 1600 x 480, ground 420. time
  // stair: 'ashgrove_stair' | null (the service stair door)
  P.ashgroveLobby = function (o) {
    o = Object.assign({ time: 'night' }, o);
    const G0 = AL.groundY;
    const L = base({
      name: 'Ashgrove Tower — lobby', area: 'Riverfront', kind: 'interior', w: 1600, h: 480, ground: G0, map: 'map_riverfront',
      room: { wall: '#c8c8c2', wall2: '#a8a8a2', floor: '#d8d8d2', pattern: 'marble', floorPattern: 'marble', ceiling: 90, trim: '#9a9a94' },
      ambient: { dark: o.time === 'day' ? 0.06 : 0.22, tint: '#2a3038', fog: 0 }, sound: { loop: 'office', vol: 0.3 },
      layers: {
        back: [
          { t: 'door', x: AL.revolving, kind: 'double', color: '#5a6068', lit: true, y: G0 },
          { t: 'desk', id: 'al_security', x: AL.desk - 100, w: 200, kind: 'reception', y: G0 },
          { t: 'tv', x: AL.desk - 40, y: G0 - 50, w: 14, h: 10, on: true, content: 'static', stand: false },
          { t: 'tv', x: AL.desk - 20, y: G0 - 50, w: 14, h: 10, on: true, content: 'static', stand: false },
          { t: 'tv', x: AL.desk, y: G0 - 50, w: 14, h: 10, on: true, content: 'static', stand: false },
          { t: 'sofa', x: AL.benches[0] - 24, w: 48, color: '#2a2a2e', y: G0 }, { t: 'sofa', x: AL.benches[1] - 24, w: 48, color: '#2a2a2e', y: G0 },
          { t: 'notice', id: 'al_donor_wall', x: AL.donors - 40, y: G0 - 150, lines: ['OUR PARTNERS', 'NORTHSIDE COMMUNITY', 'COUNCIL — 1995'] },
          { t: 'trophy_case', id: 'al_model', x: AL.model - 70, w: 140, lit: true, y: G0 },
          { t: 'sign', x: AL.model - 60, y: G0 - 90, text: 'ALDER COMMONS — 140 RESIDENCES — 1999', color: '#e8e8e2', textColor: '#4a4a52', w: 120 },
          { t: 'elevator', id: 'al_elevator_a', x: AL.elevators[0], open: false, y: G0 }, { t: 'elevator', id: 'al_elevator_b', x: AL.elevators[1], open: false, y: G0 },
          { t: 'door', x: AL.stair, kind: 'metal', color: '#8a8a8a', label: 'STAIR', y: G0 },
          { t: 'plant', x: 460, kind: 'ficus', y: G0 }, { t: 'plant', x: 1420, kind: 'snake', y: G0 },
        ].concat(o.press ? [700, 740, 780, 820, 860, 900].map((x) => ({ t: 'chair', x, kind: 'folding', face: 1, y: G0 })).concat([{ t: 'banner', x: 960, y: G0 - 200, w: 200, text: 'ASHGROVE CAPITAL', color: '#2a3a5a' }]) : []),
        front: [200, 600, 1000, 1400].map((x) => ({ t: 'ceiling_light', x, y: 92, kind: 'panel', color: '#e8eef2' })),
      },
      points: { start: { x: AL.revolving + 40, y: G0 }, model: { x: AL.model, y: G0 }, desk: { x: AL.desk, y: G0 }, stair: { x: AL.stair - 30, y: G0 } },
    });
    L.doors.push(
      { id: 'al_revolving', x: AL.revolving, y: G0, label: 'Ashgrove Plaza', verb: 'Leave', kind: 'door', to: 'ashgrove_plaza', tx: AP.revolving, face: -1 },
      closed({ id: 'al_elevators', x: (AL.elevators[0] + AL.elevators[1]) / 2, y: G0, label: 'Elevators' }, 'Locked. Card only.'),
      door({ id: 'al_stair', x: AL.stair, y: G0, label: 'Service stair', tx: 60, face: 1 }, o.stair !== undefined ? o.stair : 'ashgrove_stair', 'Not now.'),
    );
    return finish(L, o);
  };

  const RP = { groundY: 360, steps: 40, benches: [380, 900], rail0: 120, rail1: 1380, dropRail: 1100, shadowbox: 640 };
  // The river rail below Ashgrove Plaza; Alder Row's windows across the water downstream (Ch9 consideration; Ending Two).
  // 1400 x 420, ground 360. time ('night' | 'dawn' with mist | 'day') · season
  P.riverPath = function (o) {
    o = Object.assign({ time: 'night', season: 'spring' }, o);
    const G0 = RP.groundY, A = outdoor(o, { time: 'night', season: seasonOf(o) });
    const L = base({
      name: 'The river path', area: 'Riverfront', kind: 'exterior', w: 1400, h: 420, ground: G0, map: 'map_riverfront',
      sky: A.sky, backdrop: 'river+rowhouses', weather: A.weather, groundStyle: 'concrete',
      ambient: Object.assign(A.ambient, { fog: o.time === 'dawn' ? 0.3 : 0.08 }), sound: { loop: 'wind', vol: 0.35 },
      layers: {
        far: [{ t: 'river', x: 0, w: 1400 }],
        mid: [{ t: 'building', id: 'rp_alder_row', x: 980, w: 300, h: 60, style: 'brick', floors: 2, windows: { cols: 12, lit: 0.8, seed: 131 }, cornice: false, y: 300 }],
        back: [
          { t: 'stairs', x: RP.steps - 30, w: 60, h: 40, dir: -1, y: G0 },
          { t: 'fence', id: 'rp_rail', x: RP.rail0, w: RP.rail1 - RP.rail0, kind: 'iron', h: 22, y: G0 },
          { t: 'bench', id: 'rp_bench_a', x: RP.benches[0] - 17, kind: 'park', y: G0 }, { t: 'bench', id: 'rp_bench_b', x: RP.benches[1] - 17, kind: 'park', y: G0 },
          { t: 'streetlight', x: 260, on: o.time !== 'day', y: G0 }, { t: 'streetlight', x: 760, on: o.time !== 'day', y: G0 }, { t: 'streetlight', x: 1240, on: o.time !== 'day', y: G0 },
        ],
      },
      points: { start: { x: RP.steps + 40, y: G0 }, arrive: { x: RP.steps + 40, y: G0 }, rail: { x: RP.dropRail, y: G0 }, shadowbox: { x: RP.shadowbox, y: G0 } },
    });
    L.doors.push(door({ id: 'rp_steps', x: RP.steps, y: G0, label: 'Up to the plaza', verb: 'Take', kind: 'stairs', tx: AP.river - 30, face: -1 }, o.plaza !== undefined ? o.plaza : 'ashgrove_plaza', 'Not now.'));
    return finish(L, o);
  };

  /* ── 12. Spots and catalog ────────────────────────────────────────── */

  // Named coordinates of every built-in fixture (x in px; *Y = floor lines of tall maps). Read-only.
  const SPOTS = {
    kesslerAve: KX, kessler412Stairs: ST4, okafor3a: OK3A, sunnys: SUN, ironPulse: IP, ironPulseBackroom: IPB, ymca312: YM,
    civicExterior: CX, civicBackstage: CB, civicLockerB: LB, civicRing: CR,
    stagnesRoom214: R214, stagnes2West: W2, stagnesGym: SG, stagnesCourtyard: SC, stagnesRecords: REC, stagnesLobby: LOB,
    starliteLot: SL, starliteLanes: LN, cellarPit: PIT, cellar: CEL, harlanStreet: HS, calderArms: CA,
    foundryStreet: FS, courtsYard: CY, courtsWorkshop: WS, courtsCommunity: CC, courtsRoofC: RC, courts4d: D4, unionHall: UH, rookOffice: RO,
    marketStreet: MS, kwikCopy: KC, garrisonStreet: GS, cemeteryS14: CEM, ashgrovePlaza: AP, ashgroveLobby: AL, riverPath: RP,
  };
  const freeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k in o) freeze(o[k]); } return o; };
  P.spots = freeze(SPOTS);

  // builder -> the bible location ids it builds, the chapters that use it, and its own opts (README lists the same).
  P.catalog = {
    kesslerAve: { ids: ['kessler_ave_1994', 'kessler_ave_1996'], chapters: [0, 2, 9, 10], opts: 'year 1994|1996|1997|2000, time, season, van, wagon, poster' },
    kessler412Stairs: { ids: ['kessler_412_stairs_1994', 'kessler_412_stairs_1996'], chapters: [0, 2, 9], opts: 'year' },
    okafor3a: { ids: ['okafor_3a'], chapters: [2, 6, 9], opts: 'year, time, tv' },
    sunnys: { ids: ['sunnys'], chapters: [2, 6, 8, 9, 10], opts: 'year, time, season, tv' },
    ironPulse: { ids: ['iron_pulse'], chapters: [2, 3, 4, 8, 9, 10], opts: 'after9, time' },
    ironPulseBackroom: { ids: ['iron_pulse_backroom'], chapters: [2, 3, 4, 7, 8, 9, 10], opts: 'time' },
    ymca312: { ids: ['ymca_312'], chapters: [2, 3, 4], opts: 'time' },
    civicExterior: { ids: ['civic_exterior'], chapters: [8, 10], opts: 'year, time, lofts' },
    civicBackstage: { ids: ['civic_backstage_1994', 'civic_backstage_1997'], chapters: [0, 8], opts: 'year' },
    civicLockerB: { ids: ['civic_locker_b'], chapters: [0, 8], opts: 'year' },
    civicRing: { ids: ['civic_ring_1994', 'civic_ring_1997', 'ashgrove_center'], chapters: [0, 8, 10], opts: "year, crowd 'full'|'empty', mood, variant 'center'" },
    stagnesRoom214: { ids: ['stagnes_room214'], chapters: [1, 10], opts: 'year, time, earl, board, iv' },
    stagnes2West: { ids: ['stagnes_2west'], chapters: [1, 9], opts: "year, time, month 'oct'|'nov'|'dec'|'apr'" },
    stagnesGym: { ids: ['stagnes_gym'], chapters: [1], opts: 'time, patients' },
    stagnesCourtyard: { ids: ['stagnes_courtyard'], chapters: [1], opts: 'time, month' },
    stagnesRecords: { ids: ['stagnes_records'], chapters: [1], opts: 'time' },
    stagnesLobby: { ids: ['stagnes_lobby'], chapters: [1], opts: 'time, month' },
    starliteLot: { ids: ['starlite_lot'], chapters: [3, 6, 9], opts: 'time, season, closed, cars, letters' },
    starliteLanes: { ids: ['starlite_lanes'], chapters: [3, 6], opts: 'cosmic, loft' },
    cellarPit: { ids: ['cellar_pit'], chapters: [3, 6], opts: 'office' },
    cellar: { ids: ['cellar'], chapters: [3, 6, 9], opts: "crowd 'thursday'|'saturday'|'empty', mood, card" },
    harlanStreet: { ids: ['harlan_street'], chapters: [4, 9], opts: "state 'open'|'chained'|'trucks', time, season, grill" },
    calderArms: { ids: ['calder_arms'], chapters: [4, 7, 8, 9], opts: 'time' },
    foundryStreet: { ids: ['foundry_street'], chapters: [5, 7], opts: 'time, season, weather, hq, hqLocked, lincoln' },
    courtsYard: { ids: ['courts_yard'], chapters: [5, 6, 7, 9, 10], opts: "time, season, phase 'morning'|'afternoon'|'evening'|'night', took4d, siteOffice" },
    courtsWorkshop: { ids: ['courts_workshop'], chapters: [5, 6, 7, 9], opts: 'time' },
    courtsCommunity: { ids: ['courts_community'], chapters: [5, 6, 7, 10], opts: 'time, meeting' },
    courtsRoofC: { ids: ['courts_roof_c'], chapters: [5, 7], opts: "time 'dusk'|'late', season" },
    courts4d: { ids: ['courts_4d'], chapters: [5, 6], opts: 'time' },
    unionHall: { ids: ['union_hall'], chapters: [7, 9], opts: 'time' },
    rookOffice: { ids: ['rook_office'], chapters: [7, 9], opts: 'time' },
    marketStreet: { ids: ['market_street'], chapters: [6, 7, 8], opts: 'time, season, forLease, fund' },
    kwikCopy: { ids: ['kwik_copy'], chapters: [6, 8], opts: "time ('dawn' Ch8), flyer" },
    garrisonStreet: { ids: ['garrison_street'], chapters: [6, 9], opts: 'time, weather, sold, suds, lindell' },
    cemeteryS14: { ids: ['cemetery_s14'], chapters: [6, 9], opts: 'time, season, flowers' },
    ashgrovePlaza: { ids: ['ashgrove_plaza'], chapters: [9, 10], opts: 'time, weather, lobby, river' },
    ashgroveLobby: { ids: ['ashgrove_lobby'], chapters: [9, 10], opts: 'time, press, stair' },
    riverPath: { ids: ['river_path'], chapters: [9, 10], opts: "time 'night'|'dawn'|'day', season, plaza" },
  };
  P.builders = Object.keys(P.catalog);
})(window.STORY);
