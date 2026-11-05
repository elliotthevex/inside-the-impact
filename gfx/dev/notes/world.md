# World area notes

Status: done and verified by render. Engine, kit, stage and dev page work on low, medium and high with no console errors, no GL errors.

## What exists and how to use it

```js
import { Engine } from '../core/engine.js';
import { createStage } from './stage.js';
const engine = new Engine(canvas, { quality: 'auto' });      // 'low' | 'medium' | 'high' | 'auto'; { reducedMotion, adaptive, onQuality, lowDetail, st }
const mgr = new THREE.LoadingManager();                      // optional, drives a real progress bar
const stage = await createStage(engine, mgr);                // ASYNC. The contract line says -> object; it resolves to that object
engine.scene = stage.scene;
stage.scene.add(fighter.root); fighter.root.position.y = stage.canvasY;
await engine.precompile();                                   // optional: compiles shaders up front so the first frames do not hitch
engine.start((dt, t) => { stage.update(dt, engine.camera); engine.post.focus = ...; engine.post.aperture = ...; });
// tests: engine.update = fn; engine.step(n, dt) renders only the last unless { renderAll: true }
stage.dispose();                                             // on close: frees GPU memory, kit caches keep images so reopening takes about 1 s
```

### Engine (`gfx/core/engine.js`)
`PRESETS {low, medium, high}`, `detectQuality(opts)`, `hasWebGL2()`, `class Engine`. Members: `renderer`, `camera` (fov 38, near .1, far 42), `post`, `q`, `quality`, `scene`, `update`, `stats {fps, ms, calls, tris, w, h, quality}`, `listeners` (Set of fn(q)), `start(update)`, `stop()`, `step(n, dt)`, `render(dt)`, `resize()`, `setExposure(v)`, `setQuality(name)`, `precompile()`, `dispose()`.
`ST.lowdetail` forces low. Adaptive (only on quality 'auto'): two 3 s windows in a row under 42 fps drop one level. Tested by feeding slow frames: high to low.
Presets add fields beyond Post's: `shadow, hazeSteps, dust, crowd, bulbs, pixelRatio, maxPixels, exposureScale, mainFormat`. A preset's bulbs value is how many real point lights the fighters get.
`engine.setExposure` is in film-pipeline terms; the low path has its own scale so the two match by eye. Do not set `post.exposure` directly on low.

### Stage (`gfx/arena/stage.js`)
Origin ring centre, floor y 0. `stage.canvasY` 0.75. `stage.floorY` 0. `stage.ringHalf` 2.9 (inside the ropes, sim should keep body radius inside that). `stage.platformHalf` 3.2. Posts at +-3.0, rope centre line 2.93, rope heights above canvas .45 .85 1.25. Room half 9, ceiling 4.5.
`stage.corners`: `blue` (-2.5, .75, -2.5), `red` (2.5, .75, 2.5), `neutralA` (-2.5, .75, 2.5), `neutralB` (2.5, .75, -2.5). THREE.Vector3, standing spots inside each corner.
`stage.ropes`: `{px, nx, pz, nz}`, one Mesh per side (three ropes and two straps), named by which way the side lies from centre (+x, -x, +z, -z). `stage.autoRopes` (default true) fades a side when `update(dt, camera)` finds the camera beyond 2.58 m on that side. Set false and call `stage.setRopeAlpha(side, a)` to drive by hand. At alpha 0 a side stops drawing but still casts its shadow.
`stage.ropeHit(side, metres, along)` springs a side, along -1..1 picks where. `stage.kickLamp(power)` swings the lamp harder, about 3 for a knockdown. `stage.keyLight`, `stage.lamp` are exposed. Reduced motion (`new Engine(c, {reducedMotion: true})`) cuts the sway to a quarter.

### Kit (`gfx/world/kit.js`)
`RING, ROOM, setLoader, texturesReady, pbr(id, {tile|repeat, color, normalScale, maps}), grime(mat, {kind, macro, bake, bakeSpec, bulbs, contact}), LightField, aabb, bakeInto, applyBake, loadModel(id), instanced, trs, box, sbox, metreUV, cable, tube, buildRing, buildRoom, buildBenches, loadCrowdGeometry, paintPosters, wallQuad, pendantGeometry, hangingLamp, hazeCone, dust, halos, noiseTexture`.

### Dev page
`gfx/dev/stage.html?q=high|medium|low`, also `&live=1` to run the loop, `&fighters=0`, and profiling overrides `&ao=0&msaa=2&dof=16&bulbs=0&hazeSteps=3&maxPixels=...&halfDof=0&main=rgba`. `window.STAGE = {engine, stage, fighters, setCam(name), shot(name), measure(sec), CAMS}`. Cameras: fight low wide floor far door crowd corner lampc cage back wallx top. The two fighters are posed by hand-aimed bones and are for scale and light only.

## The room
Real geometry only. 18 x 18 m, 4.5 m ceiling. Breeze-block walls with a worn painted band, damp rising from the floor, streaks and soot. Wet concrete floor with puddles, environment reflections, mirror highlights of the bulbs. Concrete columns and beams, I-beam over the ring, round ducts on braces, pipe runs with drops to the floor, cables with sag, shutter door, utility box, barrels, posters and two hanging banners painted at load, an exit sign. Ring: platform, painted canvas with scuffs and print, padded lip, cloth skirt with folds, four posts with blue, red and two neutral pads, three taped ropes per side with sag and straps, steps at the blue and red corners, stools and buckets, a crowd rail, a timekeeper's table and bell.
Crowd: Rocketbox athlete posed five ways (seated, leaning in, standing, arms crossed, one fist up), skinned on the CPU at load and clustered to about 1100 triangles, instanced with per-person shirt colour and a small shader sway. High 180 people, medium 110, low 44. One base mesh only, all male; it reads fine dark and out of focus but faces are blank up close.

## Light
One real shadowed spot on the swaying lamp (bulb at y 3.9, about 3 cm of sway, period 4 s). Six bulbs, one flickering fluorescent and the ring's glow are baked per vertex at load by `LightField` (box occluders, soft shadows, AO, dominant direction so normal maps still respond). World shaders skip real point lights completely. Real point lights (bounce, fluorescent, up to two bulbs) only reach the fighters and cables. Bake takes about 0.46 s on the M1, 0.24 s on low; it runs on the main thread during load. If columns, beams or bulbs move, the bake follows automatically because it runs from the same layout. HDRI (basement_boxing_ring) at low intensity for reflections and a little ambient, clamped on the floor so its bright strips do not read as white patches.

## Measured (this M1, Chrome headless with real GPU, other agents running)
Headless requestAnimationFrame is capped near 30 Hz on every preset, so `rafFps` says nothing. Real cost comes from `openFps` (frames as fast as the browser takes them, 3 s) and `syncMsMedian` (each frame forced to finish, includes JS).

| preset | canvas | rendered | openFps | sync ms | draw calls fight / wide | triangles fight / wide |
| high | 1280x720 | 1280x720 | 107 | 12.8 | 110 / 116 | 568k / 592k |
| medium | 1280x720 | 1280x720 | 135 | 9.6 | 106 / 112 | 469k / 493k |
| low | 1280x720 | 1280x720 | 198 | 6.8 | 85 / 92 | 291k / 338k |
| high | 1920x1080 | 1788x1006 | 65 | 15.9 | 110 / 116 | 568k / 592k |

The 1080p case swings between about 45 and 67 fps from run to run; the dips track other agents' load (load average 3 to 4). At a true 1920x1080 it peaks near 58. So high renders at a budget of 1.8 M pixels (`maxPixels`), about 7 percent under 1080p each way, and that is what reaches 60. JS is about 3 ms of a frame now; rig, HUD and effects will add to it. A real 60 Hz has not been seen, since headless cannot show it. Check once in a normal window with `?live=1`.
Load: about 0.9 s on localhost including fighters, textures already local. Download about 6 MB for the room (models 2.9 MB, textures 1.6 MB, HDRI 1.4 MB). Crowd adds no asset: it reuses fighter.glb.

## Changes to other people's assumptions
- `createStage` is async. Contract shows it returning the object directly.
- post.js is not edited. `makePost` in engine.js adjusts a Post after building it. Three things, all measured and all worth folding into post.js by whoever owns it:
  1. AO stripes: `vpos` reads nearest depth but rebuilds position at its own UV, and half-res pixel centres sit exactly on texel edges. Snapped to texel centre with a small offset. Without it the canvas shows dark bands.
  2. Depth of field replaced by `HalfResDof` (half-res gather, tent filter, depth-aware upsample), same uniforms. 32 taps cost 9.5 ms at 1080p before, about 3.5 now.
  3. Main target is R11F_G11F_B10F when `mainFormat: 'r11'`. Half the bytes per sample with MSAA. Nothing reads its alpha.
- Post's `grain` is set to .0045 by createStage. Its default .011 is added before the sRGB curve, so it turns blacks to speckle in a room this dark.
- Glass in glTF models: `loadModel` turns KHR transmission off, because any transmissive material makes three draw every opaque object twice per frame. Worth knowing for anything else that loads a Poly Haven model.
- Any shader on a world surface that wants the bulbs must use the bake, not real lights. A new material added to the room without `grime(..., {bake})` or `bakeInto` will look dark, because only two bulbs are real.

## Asset handling
`ph.py` then two one-off scripts in the scratchpad, `world/tools/leanmodel.py` (textures to WebP at 512 or 1024) and `world/tools/prunegltf.py` (keep named nodes, rewrite bin, drop unused images). Pipes, ducts and fluorescent models are pruned to the meshes used. Re-running `ph.py model` on those would restore the full files. Manifest is up to date for credits.

## Not done or not verified
- Not run inside the game: `index.js`, fightcam and rig did not exist when this was finished. Only the dev page has driven it.
- True 60 Hz on a real display: see above. Phone GPUs: never run on one; low was only checked at phone resolution on the M1 (844x390), about 330k triangles.
- Fighters' lighting judged in a hand-made guard pose only.
- Bake time on a phone is unmeasured. It uses one shadow sample there, about half the rays. If it stalls the load screen it can be split over frames.
- Crowd variety: one base mesh. More Rocketbox characters would need downloads and a re-run of the same pose code.
- `.hdr` is read at 1k; a smaller one would save a little more download.
Screenshots: scratchpad `shots/world/` (`w_sheet.png`, `t_wide.png`, `t_fight.png`, `pl_fight.png`).
