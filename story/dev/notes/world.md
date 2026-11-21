# world.js — builder notes

Status: COMPLETE (run 2). `story/world.js`, 2610 lines, sections `/* ── 0..19 ── */`, syntax OK in JavaScriptCore.
Verified: 48 headless checks (enter, firstEnter, live when()/markers, walls, one-way platforms + drop-through,
jump onto a platform, ladder up/down, NPC talk scene, examine, locked door, door and edge transitions both ways,
`up` at a door, triggers once, barks, camera clamp, cam.to Wait, minimap, screenPos, spawn/remove, walkTo,
A.walk/A.pose through the director, hit-stop), every render path against a canvas stub (street/rain, debug,
all post fx, mid-transition, interior, zoom 1.5/0.6, fallback labels, a 720 px tall map), and real browser
frames of a street, an interior and a sepia/double/letterbox combination with zero errors.
The scratch runner is outside the repo (session scratchpad `wt/run.js`, `tests.js`, `render.js`).

## What it does (contract §5)
- Locations: `S.world.enter(locId, x, {y, face, fade, silent})` resolves the LocationDef (director's
  `story.lookup` first, then `S.world.locations`; builder functions get `(G, S)`), filters pieces, floors,
  solids and ladders by `when()` at bake time, keeps `when()` live for npcs/objects/doors/triggers (20 Hz),
  places Jin, snaps the camera, sets ambience loops, autosaves (throttled 20 s, through
  `S.director.checkpoint` so `G.checkpoint` is set), then runs `firstEnter` (first visit per chapter) and `enter`.
  Flag/quest/evidence/memory/chapterStart/loaded events re-resolve when()-gated pieces and geometry (re-bake).
- Baking: each layer's static pieces go into 1024 px chunk canvases (skipped headless); animated pieces
  draw per frame over them. The back layer bakes the room shell (interiors) or the ground first.
- Room shell: ceiling (darkening, board seams, lit crown), wall pattern (brick patches, paneling, wallpaper,
  tile, concrete block, marble, wood, plaster with stains/cracks), optional wainscot (`room.wall2`), baseboard,
  floor plane (wood/tile/carpet/concrete/marble rows that widen and darken toward the camera).
- Exterior ground (default `groundStyle: 'street'`): sidewalk slabs with cracks and stains, curb and gutter,
  worn asphalt with patches, a faded centre line, manholes, broken wet sheen when it rains.
- Collision: floors (solid down to infinity), walls, one-way platforms, step up/down 9 px, sub-stepped,
  head bonks, map edges, `actor.bounds` clamps, fell-out recovery to the last safe footing. Ladders: up/down to
  climb, jump lets go; `kind:'stairs'` and slanted `xTop` walk instead of climb.
- Actors: Jin first, placements, spawned enemies. Pose crossfade on every pose change (snappy for strikes,
  slower for sitting/lying); poseT advances unless combat wrote it this step.
- NPCs: idle (optional `idles` cycle), glance at Jin, wander, paths (loop or stop), pause while Jin is close
  enough to talk or a scene holds control, face Jin while talking. Barks: nearest within `barkRadius`, one bubble
  at a time, a line never repeats within 20 s, per-NPC gap 7 s.
- Interaction: nearest valid interactable within 28 px in front (6 px behind, 24 px for hidden objects);
  `S.world.focus = {kind, ref, id, label, verb, text:'[E] Talk — Name', key, x, y, locked?, marker?}`.
  Interact runs it; `up` also enters doors. Enemies are talkable only once down. Objects: text thoughts,
  `run` scene, evidence/memory, `verb:'Sit'` (walk over, sit, camera eases out, thoughts, stand).
- Doors: fade out → enter → fade in; edge doors are auto (walk into the map end), arrival defaults to just
  inside the matching back-edge; locked doors rattle (not street edges) and toast the reason.
- Triggers: once per chapter by default (G.flags), `once:false` fires on each entry.
- Camera: follow with look-ahead and smoothing, vertical follow on tall maps (tracks footing, not hops),
  dialogue framing (Jin and speaker), fight framing of every live enemy clamped to the arena, scripted
  `S.cam.to` (centre x/y or `target`, zoom about the centre, returns a Wait), `shakeIt` scaled by `settings.shake`.
- Render order: sky/backdrop → far → mid → back (shell/ground/pieces) → hooks 'back', activities 'back',
  glints, edge chevrons, combat.drawUnder → actors back/main → effects, particles, combat.drawOver,
  hooks 'effects' → front layer, front actors, activities 'front', hooks 'front' → fore → weather →
  lighting composite → hooks 'screen' → debug → fallback labels (only when ui.js is absent) → post fx →
  blit to the caller's ctx.
- Post fx (S.fx): desat and sepia (composite blend modes, no ctx.filter, so Safari works), blur (downscale/
  upscale), double vision, vignette, heartbeat pulse (red vignette + 1.2 % swell, in step with the director's
  beat), flash (capped by settings.flash), letterbox, door-transition fade, `S.fx.fade`. muffle →
  `S.audio.muffle` whenever S.fx.muffle moves.

## Exports beyond the contract
`S.world`: `defineLocation(id, def)`, `locations`, `locationDef(id)`, `setPose(ref, pose, {hold, t, base})`,
`face`, `place`, `show`, `setLook`, `walkTo(ref, x, opts) -> Wait`, `walkToActor(ref, other, gap, opts)`,
`bark(ref, text, seconds)`, `barks()` and `markers()` (UI data with CSS positions), `prompt()` (focus with CSS
position), `interactables()`, `interactWith(idOrKind)`, `use(focus)`, `travel(locId, x, opts) -> Wait`,
`rebake()`, `refresh()`, `reset()`, `ensureJin()`, `onOneway(a)`, `drop(a)`, `playerControl()`, `fightActive()`,
`fx(kind, x, y, opts)`, `particle(p)`, `burst(x, y, n, o)`, `addDraw(where, fn)` (where = back | effects | front |
screen; returns a remover), `viewRect()`, `toScreen(x, y)`, `view()`, `resetFx()`, flags `debug`, `control`
(null | true | false), `canvasLabels`, `extraLights` (array), `rendersFade = true`, `transitioning`.
`S.cam`: `center()`, `snap()`, `view` (visible world rect). `S.fx`: `fade`, `fadeColor` (shared with director).
Events emitted: 'bark' {id, text, dur}, 'trigger' {id, loc}, 'ladder' {on}, 'fellOut' {id},
'toast' {text, kind:'locked'}, 'interact' (doors add `to` or `locked`), 'enterLoc' adds {from, first, silent, name}.
Actor field set for combat: `onOneway`; collide honours combat's `dropThrough` as well as world's `dropT`.

## Authoring extensions (all optional)
LocationDef: `groundStyle` ('street' | 'sidewalk' | 'alley' | 'concrete' | 'dirt' | 'yard' | 'rooftop' |
'gravel' | 'room' | 'none'), `street: {sidewalk: 16, curb, lines, manholes}`, `wet`, `points.start`.
room: `wallPattern`, `floorPattern`, `wainscot` (px), `ceiling: false` (no ceiling). floors[]: `style`.
solids[]: `style` or `draw: true` to be drawn (default invisible; use catwalk/fireescape pieces).
ladders[]: drawn by default (no piece type draws a plain ladder); `draw: false`, `kind: 'stairs'`, `xTop`, `w`.
lights[]: `layer`, `when`. DoorDef: `side: 'left'|'right'`, `h`, `run` (door with no `to`), `sound: null`.
NpcPlacement: `idles: [poses]`, `walkPose`, `verb`, `pathSpeed`, path points `{face, speed}`.
ObjectDef: `verb: 'Sit'` (+ `pose`, `zoom`, `face`), `doc` (true = open the evidence doc), `text` may be (G)=>lines.

## Decisions
- `S.cam.x/y` = view top-left at zoom 1; zoom scales about the view centre (same as pieces.js). `S.cam.to`
  takes the centre to look at.
- Parallax: layer p shows layer x at `VW/2 + z(x − (camLeft·p + VW/2))`; vertically the same around the view
  that frames the main ground, so far layers stay on the horizon on tall maps. Parallax-layer lights are
  converted to world coordinates every frame.
- Player control = `!S.director.busy` (the director's definition) unless `S.world.control` forces it.
- director plays the heartbeat sound; world only draws the pulse. director/main: world draws `S.fx.fade`.
- World owns the hit-stop countdown unless another module already counts it down (detected).
- world attaches Jin to ladders before combat runs (combat also has ladder code; it never sees them then).
- A `hold: true` pose on Jin outlives the scene until the player presses a movement/action key.
- A scripted camera left after every scene ends returns to follow after 0.6 s.
- Examined objects stop glinting; `used:`, `seen:`, `trig:`, `entered:` keys live in `G.flags` per chapter.
- The frame renders into an internal 640×360 canvas, then is drawn onto the given ctx under its transform;
  an identity-transformed ctx of another size is filled whole.
- `screenPos` uses `S.main.viewRect()` if main provides it, else measures the canvas last rendered into
  relative to `#story-root` (cached 0.25 s, invalidated on resize).
- Without pieces.js's S.backdrop / S.weather / S.light, world falls back to a plain sky, no weather and a
  simple darkness-with-holes composite (pieces.js now ships all three).

## Known gaps
- art.js was not on disk while building: without it actors draw as plain block figures (dev fallback only).
- 'back'-layer actors are only ordered behind, not dimmed for depth.
- Bake culling guesses a piece's span as x ± 200 px (+ w); a piece drawing wider than that without `w`
  or `x0/x1` could clip at a 1024 px chunk seam.
- Door kinds 'stairs'/'ladder' change location with a fade and the stairs sound; no climbing walk-out.
- No render interpolation between sim steps (120 Hz sim, so it is smooth in practice).
- The headless self-test is in the session scratchpad, not the repo; `story/dev/headless.js` (dev-harness
  builder) is the shared runner.
