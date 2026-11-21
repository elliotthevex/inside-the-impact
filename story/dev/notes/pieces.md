# pieces.js — builder notes

Status: COMPLETE (run 2). `story/pieces.js` (sections 1–11) and `story/dev/pieces.html` are done, syntax-checked in JavaScriptCore, loaded headless (core + pieces, every type's `lights()` returns finite data, no `S.errors`), and checked in the browser (scenes and every gallery cell).

Owner files: `story/pieces.js`, `story/dev/pieces.html`.

## What is built (contract §4)
- `S.pieces.define / draw / lights` plus all 118 piece types in the §4 list (sections 7 and 8). Unknown type → magenta 8x8 box and a single console warning.
- `S.backdrop.draw(ctx, L, camX, camY, time)`: sky presets `night dusk dawn day overcast storm none` (or a `'#hex'` flat colour), and far-parallax presets `skyline` (Calder's skyline: towers with masts and aviation lights, mid-rises with water tanks, antennas, rooftop billboards, a church steeple now and then), `foundry` (sawtooth sheds glowing from the furnaces, smokestacks with drifting smoke and red lights, blast furnace and stoves, gantry cranes, a rail yard with boxcars and floodlight masts), `river` (water reflecting the sky, a steel truss bridge on piers with deck lamps, cars crossing, broken lamp reflections, the moon's path), `towers` (downtown office towers with lit floors), `rowhouses` (gables, mansards, chimneys with smoke, trees, utility poles and sagging wires). Clouds (flat-based pixel clouds lit from below at night), stars that twinkle, optional moon, storm lightning with a bolt. Distant windows switch on and off.
- `S.weather.update(dt, L)` / `S.weather.draw(ctx, L, cam)`: rain (slanted streaks in three depth buckets, splashes where drops land, low spray), drizzle, snow, dust motes, smoke (soft drifting puffs), embers (also emissive after the darkness pass), leaves (tumbling). Particles keep anchored to the world as the camera moves (deeper ones slide less).
- `S.light.composite(ctx, L, cam, lights, time)`: darkness overlay (dusty blue-charcoal or `L.ambient.tint`) with soft holes, cones that stop at the floor and leave a light pool, warm additive glow, lens glare, faint beams (stronger in fog/rain/smoke/dust), flicker (breathing for fire/TV, dropouts from 0.5 up for a dying tube or bad streetlight), broken horizontal reflections on wet ground (rain, drizzle, `L.wet`) and always over puddle pieces, ground fog (`L.ambient.fog`).

## Exports beyond the contract
- `S.pieces`: `defs`, `pal` (named palette + 3–5 shade material ramps), `has(type)`, `types()`, `isAnimated(p)`, `active(p)` (evaluates `when(S.G)`), `drawAnimated(ctx, p, L, time)`, `font` (fallback 3x5 font), `util` drawing kit: `rgb mix rgba shade ramp mute R Px RA line cable ellipse box speckle contact streaks vbands txt txtW hash wallFill brickPatches drawWin drawDoor drawPoster graffitiTag person makeCanvas prng toScreen gyOf ceilOf`.
- `S.backdrop`: `skies`, `presets`, `sky(L)`, `clearCache()`, `hazeFor(L, layer)` → `{color, k}` to tint baked `far`/`mid` layers toward the haze (far .5, mid .26, more with fog).
- `S.weather`: `kinds(L)`, `spec(L)`, `wet(L)` (0..1), `flash(L)`, `reset(L)`.
- `S.light`: `res` (darkness buffer downscale, default 2), `darkColor`, `gather(L)` (all piece lights of L with layer parallax + `L.lights`, cached), `flicker(light, time)`, `toScreen(x, y, cam, par, parY)`, `layerPar` (`far .25, mid .6, back/main/front 1, fore 1.25`).
- `composite(..., opts)`: optional 6th argument `{w, h}` for a view that is not 640x360 (the gallery uses it).

## Decisions
- Coordinates: pieces draw in their layer's world coordinates. `x` is the LEFT edge for pieces that take `w`, the horizontal CENTRE for fixed-size props (doors, cars, containers, elevators included). `y` defaults to `L.ground` (300) and is the line the prop stands on; wall-mounted pieces (poster, flyer, notice, sign, window, picture, clock, tv, radio, mirror, phone_wall, med_monitor, bulletin_board, chalkboard, art, window_city, billboard, banner, graffiti, mural, catwalk, pipes) take `y` as their TOP edge and have sensible defaults relative to the ground or `L.room.ceiling` (default ground − 210).
- `draw(ctx, p, L, bake)`: `bake` true = static part only; animated pieces draw moving parts in `drawAnimated(ctx, p, L, time)`.
- Screen helpers draw on an identity-transformed 640x360 ctx. `cam = {x, y, zoom}`: x/y = world top-left of the view at zoom 1, zoom scales about the view centre (matches world.js notes). `backdrop.draw` also accepts `S.cam` as `camX`.
- Lights are in their layer's coordinates. `par` (and optional `parY`) on a light, or `layer`, selects the parallax; default 1. `gather()` sets them. Reflections only come from main-layer lights (par 1).
- Light fields used: `{x, y, r, color, k, flicker, cone:{dir:'down'|'up'|'left'|'right'|degrees, width}, reflect, win, glow (halo scale), shaft (beam scale), seed}`. Cones wider than ~100° (fluorescent tubes) light diffusely instead of as a wedge.
- Weather input: `L.weather` = `'rain'`, `'rain+smoke'`, `['rain','smoke']`, `{kind, k|amount, wind}` or a list of those; `L.weatherAmount` and `L.wind` apply to all. State is per LocationDef object (WeakMap), cosmetic only, private PRNG — never `S.rand()`, no `Math.random()`. `update` is a no-op headless.
- `L.backdrop` may combine presets (`'river+skyline'`): the first is nearest; later ones are pushed back (higher, slower, hazier, shorter). Object form `{preset, seed, lit}` (`lit` scales lit windows).
- `L.sky` object form: `{preset, stops, glow, clouds (0..1), stars, moon: true|'crescent', moonX, moonY, seed}`.
- Far silhouettes take the sky colour at mid height (mixed toward the horizon and the preset's silhouette colour), never the bare horizon colour, so tall towers never read lighter than the sky behind them.
- The darkness pass cannot know occlusion, so backdrop windows are drawn bright enough to survive it; only weather emissives (embers, the lightning wash) are re-added after darkness.
- Scale fixes to run-1 pieces against a 46 px figure: doors default 54 px tall (22 wide, double 36), building ground floors 62 px (shops 70–78) so doors fit, roll doors 60, elevator 58, cars ×1.5 (`CAR_SCALE`, a sedan is ~111x33). Payphone sign fixed (text no longer doubled). Stage lights: one can per 60 px, softer beams. Crowd rows darker (`p.dim`, default .32) so fighters read in front. `window_city` gained `'day'` and `'dusk'` views and quieter night windows.

## For world.js (recommendations, not enforced here)
- Bake each layer in list order but cut the bake at every animated piece: static run → canvas, animated piece's `drawAnimated` live, next static run → next canvas. Drawing all animated parts after the whole layer puts e.g. a crowd over ring ropes listed after it. `story/dev/pieces.html` (`bakeScene`) shows this.
- Tint baked `far`/`mid` canvases with `S.backdrop.hazeFor(L, layer)` (source-atop).
- In interiors the room shell covers `far`/`mid`, so arena crowds belong in `back` (raise their `y` a few px so they read as further back); use `ring` with `part:'back'` in `back` and `part:'front'` in `front` so the front ropes overlap fighters.
- Call `S.weather.update(dt, L)` per step and `S.weather.draw` before `S.light.composite` (embers and lightning are emitted then drawn by composite).

## dev/pieces.html
Loads `core.js`, `art.js` (optional; stand-in figures when missing) and `pieces.js`. Three 640x360 scenes scaled x2 with world-order rendering (backdrop, far/mid with haze, street or room shell, back, actors, front, fore, weather, lighting): a rainy night on Kessler Avenue (diner, laundromat, corner store, gym, liquor store, alleys, fire escapes, posters, payphone, streetlights, puddles, parked cars, wires), the St. Agnes rehabilitation wing (bars, mat, bed, IV, monitor, day windows, fluorescent tubes with one flickering, dust), and the Calder Civic Arena (ring under a lighting truss and spotlights, crowd and bleachers, banner, smoke haze). Per-scene controls for sky, backdrop, weather, darkness and fog; then one labelled canvas per piece type with lighting on or off. Console helpers: `__piecesDev.view(i, cssWidth)`, `.at(i, camX)`, `.sheet(page)` (every gallery canvas at 1x on 800x600 pages), `.bd(sky, backdrop, weather, camX, t, dark)` (bare backdrop study).

## Known gaps
- The darkness pass also darkens the sky and far bands (no occlusion info); night skies are authored a little lighter to compensate.
- Rain lands on the single `L.ground` line (no per-platform splashes); reflections use `S.world.groundAt` when the light's location is the current one, else `L.ground`.
- Backdrop bands ignore zoom except for a slight scale on the nearer bands.
- Many run-1 pieces were reviewed only in the gallery at 1x; heights of a few interior props may still be compressed relative to the 46 px figure (e.g. lockers, shelves).
