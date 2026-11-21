# foundation-places — notes (places.js + chapters/README.md)

Owner files: `story/chapters/places.js`, `story/chapters/README.md`, this file.
Status: DONE (places.js verified, chapters/README.md written). Restart: nothing pending; places.js is the only source
(sections `/* ── n. … ── */`). The scratch test was deleted; its checks are listed under "Verification log".

## Decisions (made without anyone to ask)
- Builders return a plain LocationDef object (easy to read and extend). Chapter-level variation comes from opts
  (year, season, time, state); story-flag variation comes from `when(G)` on pieces, npcs, objects and doors. For a
  place whose whole shape depends on G, a chapter writes `locations: { id: (G) => S.places.x({...from G}) }`
  (location builders get (G, S); world and director both call them).
- Builders put no chapter interactables in (the bible's per-chapter Interactables tables are complete, so built-in
  examine objects would duplicate the chapter's). Built in: environment pieces, lights, doors (with bible default
  targets per year), stairs, background residents of the place (Rita, Augie, Otis, Peg, Fran...). Authors add
  objects at the coordinates exported in `S.places.spots.<builder>`.
- Opts merge by id: `npcs/objects/doors/triggers` entries whose id matches a built-in patch it (no duplicate actor
  ids); `npc/obj/door: { id: false | patch }`; `to: { doorId: locId | null }` retargets or removes a door.
- Door targets that would not exist in a chapter are placeholders: locked doors with `run: 'places_noop'` (a shared
  scene) and Jin's reason, so the static check passes; retargeting one with `to` clears the placeholder lock.
- Vertical places: the engine's test autopilot walks only left/right and never climbs ladders. Every flight in a
  tall map is BOTH a walkable stair (ladder kind 'stairs' with xTop: hold up/down) AND a pair of same-location
  'stairs' doors that run a short fade scene (E: "Take — Up to …"). `S.places.climb` / `climbTo(t)` are autoplay
  hint objects with getters (only documented channels: quest step `autoplay`, `A.waitFor(..., {autoplay})`) that
  send the autopilot through the right stair door when its target is on another level.
- Map: one 640x360 node table (`S.places.calderMap`) laid over ui.js's drawn sheet (river along the bottom,
  bridge at x≈304); all x ≤ 600 and y ≤ 330 so ui's nodeFit keeps the 640x360 frame for every subset.
- Looks: `look(id, variant)` resolves `<id>_<variant>` (e.g. teddy_1994), then `<id>`, then an art.js generic, at
  build time (cast.js loads before places.js). Ids are the bible's cast ids.

## Done
- places.js: 38 builders (S.places.catalog), calderMap/node/nodes, spots, stairs/ladder, climb/climbTo/withClimb, look,
  finish/extend, shared scene 'places_noop'.
- Layout rule found while testing: keep doors on the same level >= 30 px apart. The autopilot holds `up` while it waits
  for focus on a 'stairs'/'ladder' door, and `up` enters whatever door is focused (the yard's roof door 16 px from the
  fire-escape-down door bounced Jin down forever). Fixed: roof door moved to the other end of the landing; Rook's
  office door moved 80 px from the balcony stair head.

- chapters/README.md: file shape, id rules, ChapterDef fields, canon semantics (canon of chapter k = what k hands on
  on the restraint path; seedState(n) applies every k < n; rel is additive; train clamps to 3), choices (policy,
  autoplay, record), every builder with opts / doors / residents, map nodes, autoplay rules, tall places, engine
  pitfalls, test commands.
- Later fixes: union hall and community building now keep the main floor as L.ground (basement = extra `floors`
  entry under a concrete wall piece), so default placement, map arrival and A.goto without y land on the main floor
  (tested: 470 / 330). Ring lamps lowered to y G0-210 with r 280 (they did not reach the canvas); Cellar ring lamp
  r 240. heavy_bag reads `y` as its floor line: the basement bag uses y = basement floor.

## Builders (S.places.builders)
kesslerAve, kessler412Stairs, okafor3a, sunnys, ironPulse, ironPulseBackroom, ymca312, civicExterior, civicBackstage,
civicLockerB, civicRing, stagnesRoom214, stagnes2West, stagnesGym, stagnesCourtyard, stagnesRecords, stagnesLobby,
starliteLot, starliteLanes, cellarPit, cellar, harlanStreet, calderArms, foundryStreet, courtsYard, courtsWorkshop,
courtsCommunity, courtsRoofC, courts4d, unionHall, rookOffice, marketStreet, kwikCopy, garrisonStreet, cemeteryS14,
ashgrovePlaza, ashgroveLobby, riverPath. Plus calderMap / node / nodes / mapById, spots, catalog, stairs, ladder,
climb / climbTo / withClimb, look, finish / extend.

## Verification log
- syntax.js: ok. headless `load`: places.js ok, 0 problems (chapter files c00..c10 not written yet, so `ok` false).
- scratch exec test (deleted afterwards): every builder x 1–6 variants (87 defs) built, checked (piece types,
  door targets, looks, poses, drills, map node), entered with S.director.enterWorld, stepped 0.6 s, rendered into the
  stub canvas at zoom 1 and 1.4: all ok, 0 S.errors. 412 stairs by hand: E on st4_f1_up hops 680 -> 500; holding up
  on the second flight walks 500 -> 320. Autopilot (T.runChapter on a test chapter whose quest steps use
  S.places.withClimb): Kessler -> 412 lobby -> landing 2 -> landing 3 -> 3A; yard fire escape -> roof; workshop loft;
  Foundry Street -> hall -> balcony -> Rook's office; back down -> basement archive; community room -> basement gym:
  reachedEnd in 59 sim s, not stuck, no errors.
- Browser (own tab, muted, 1280x720, play.html?ch=99 with the builders entered in-page): Kessler 1996 dusk with the van,
  the 412 stairwell (three levels, flights, 3A/3B), the Courts yard (fire escape aligned with the one-way landings),
  the union hall, the Civic bowl (after the lamp fix: four lamps on the truss, canvas lit), the St. Agnes lobby
  cut-away, Sunny's. 0 S.errors. Tab closed, viewport reset.
- Final: syntax ok; `load` okEngine, 0 problems, 0 warnings, 0 console output; exec test ok (87 variants, autopilot
  reachedEnd 59 s, default placement on main floors).
