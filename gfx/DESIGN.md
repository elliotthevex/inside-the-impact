# Street Fight 3D: build design

The 1v1 Arena card in Mode Select opens a complete 3D boxing game. It lives in `site/gfx/arena/`, is lazy-loaded on click,
and needs WebGL2. The old canvas arena (`a3*` in `site/index.html`) stays untouched as the fallback.

Purpose of the whole game: a boxing safety-education game for a college extracurricular. It teaches injury recognition
through play. Keep that in the arena: a hidden head-exposure counter, postural warning signs, and a referee stoppage.

## Hard rules
- Real 3D only. No static image may stand in for a model. Photos (HDRI) may light the scene and fill reflections; the room,
  ring, props and people are real geometry with PBR materials.
- Nothing fake: no control, button or feature that does not work. Never mark something done that was not tested.
- Career simulation untouched. `site/tools/parity.js` must return `3bea3b59`, `site/tools/smoke.js` must pass. Edit
  `site/index.html` only for the small launch hook. Do not change `a3*` (another session is fixing it on its own branch).
- Not gory: sweat and impact flashes, no blood.
- No new dependencies beyond the vendored Three.js r187 in `site/vendor/three` (`three`, `three/addons/`). No build step.
- Plain language in any on-screen text. No emoji in new UI.

## Usage stop, applies to every agent
Before each major step call `mcp__ccd_session_mgmt__get_usage` (load with ToolSearch). If the 5-hour `percentUsed` is 72 or
more: stop starting work, save files in a working state, write what is done and what is next to
`site/gfx/dev/notes/<your-area>.md`, and return. Never run past it.

## Machine limits
Apple M1, 8 GB shared memory, disk 96% full. One GPU job at a time (`cdp.py` takes a lock). Keep downloads small and delete
raw sources after converting. No node, no Blender. `python3` plus the venv in the scratchpad (numpy, pillow).

## Tools (`site/tools/gfx/`)
- Server: `sink.py` serves the project root on port 8791 and accepts POST `/__save?path=` into allowed folders. If down:
  `python3 -I site/tools/gfx/sink.py "$PWD" 8791 "$PWD/site/assets" "$SCRATCH" &` from the project root.
- `run.sh PAGE 'JS' [--size WxH] [--shot out.png]`: headless Chrome with real GPU, evaluates JS, prints value and errors.
  PAGE is e.g. `site/gfx/dev/arena.html`. Then Read the PNG to look at it. Look at your work; numbers alone do not prove a picture.
- `ph.py tex|hdri|model ID`: Poly Haven CC0 assets into `site/assets/`, recorded in `site/assets/manifest.json` for credits.
- `person.py`, `retarget.py`, `clipcut.py`, `bvh.py`, `glb.py`, `skin.py`, `gear_tex.py`, `backplate.py`, `sheet.py`: the people pipeline.
- Raw sources in the scratchpad: `dl/rb/` (Rocketbox), `dl/cmu/*.bvh` (boxing mocap), `out/raw/m021_facial.{json,bin}` (fighter dump),
  `res/punches.json` (204 scanned punches), `lab/dump.html` (FBX dump page: `dumpMesh`, `dumpAnim`). Symlinked into the server root as `.scratch`, `.dl`, `.lab`.

## Already built and verified by render
- `gfx/core/post.js`: film pipeline on one depth texture (AO, DOF, bloom, tone map, grade, grain).
- `gfx/people/skin.js`, `fighter.js`, `glove.js`: Rocketbox `Sports_Male_01` (MIT) with trunks and boots cut as shells in `person.py`, a muscle morph
  (0..1), 27 face morphs, sweat and flush uniforms, lofted gloves. Asset: `assets/people/fighter.glb` plus `m021_*` textures.
- `tools/gfx/retarget.py`, `clipcut.py`: CMU boxing mocap onto the Biped rig, with a boxer's guard lift by IK and a straight wrist.
- `gfx/world/backdrop.js`: box-projected photo room. Not for the arena room (see hard rules); it is for far later screens.
- Look target: `gfx/dev/ref/look-target.png`. Dark room, warm key, deep shadows, slightly desaturated. Rig facts: Y up, metres, character faces +Z, his
  left is +X. Biped bones run along local +X. Hand: +X along fingers, +Y out of the palm, thumb is -Z on the left, +Z on the right. Finger curl is +Z rotation.
  Bones: `Bip01_Pelvis, Spine, Spine1, Spine2, Neck, Head, LEye, REye`, `Bip01_{L,R}_{Clavicle,UpperArm,Forearm,Hand,Finger*,Thigh,Calf,Foot,Toe0}`. Thighs parent to `Bip01_Spine`.

## Module map and interfaces (build to these so parallel work joins up)
```
gfx/core/engine.js    Engine: renderer, PRESETS {low,medium,high}, detectQuality(), Post, resize, loop, adaptive downgrade, step(n,dt) for tests
gfx/world/kit.js      buildRing(), buildRoom(), hangingLamp(), hazeCone(), dust(), loadModel(id), pbr(id,{repeat,...})
gfx/arena/stage.js    createStage(engine, loader) -> { scene, ringHalf, floorY, canvasY, update(dt,cam), corners }
gfx/people/anim.js    loadClips(url) -> ClipLib
gfx/people/rig.js     class FighterRig(fighter, clipLib)
gfx/arena/sim.js      createMatch(opts) -> Match. Pure logic: no THREE, no DOM, seeded RNG, fixed step.
gfx/arena/ai.js       createAI({difficulty, seed}) -> { decide(match, me, foe, dt) -> Input }
gfx/arena/fightcam.js createFightCam(camera, {reducedMotion, shake}) -> { update(match, rigP, rigO, dt), kick(power), getFocus() }
gfx/arena/fx.js       createFx(scene, q) -> { impact(pos, dir, power, blocked), update(dt) }
gfx/arena/audio.js    createAudio({enabled, volume}) -> { onEvent(ev), update(match, dt), destroy() }
gfx/arena/hud.js      createHud(rootEl, {touch}) -> { update(match, dt), onEvent(ev), showLoading(p), destroy() }  plus gfx/arena/arena.css
gfx/arena/index.js    openArena(), closeArena(): overlay root `.arena-x`, load screen with real progress, wires everything, keyboard and touch input
gfx/dev/arena.html    dev page. `window.ARENA = {match, engine, step(n), setPlayerBot(name)}` for tests
```

### Sim contract
Units are metres and seconds. Fixed step 1/120. Origin at ring centre.
```
Input  { mx, mz (world move, length <= 1), guard: bool, punch: null|'jab'|'cross'|'hook'|'upper'|'bodyL'|'bodyR', slip: bool, getUp: bool }
Match  { state: 'intro'|'fight'|'down'|'break'|'over', round, rounds, clock, p, o, events[], result, step(dt, inputP, inputO) }
Fighter{ x, z, vx, vz, yaw, hp, maxHp, sta, maxSta, head, guard 0..1, punch: null|{kind, t, dur, contact, phase, hit}, stun, slip, down: null|{t, count, n},
         knock: {x,z}, landed, taken, clean, fat, name, corner }
Event  { type, who: 'p'|'o', kind, tgt: 'head'|'body', power, dir: [x,z], blocked, counter, t }
types: round_start, fight, bell, throw, whiff, hit, block, slipped, stagger, knockdown, count, getup, ko, tko, stopped, decision, round_end, step
```
`match.events` is cleared by the caller each render frame after dispatch. Sim never reads the view. View never writes the sim.
Contact happens at `punch.t == punch.contact`. The rig time-warps its clip so the arm is furthest out at exactly that moment.

### Gameplay spec
Keys: WASD move, camera-relative. J jab, K cross, L hook, U uppercut, I body left, O body right. Shift guard. Space slip (with direction). Esc pause and exit.
Six punches with startup, active, recovery windows. Starting values, tune by measurement:
jab .12/.05/.14 dmg 3.5 head .35 sta 5; cross .18/.05/.24 dmg 8 head .9 sta 11; hook .24/.06/.28 dmg 10 head 1.6 sta 14 (staggers when clean);
upper .22/.05/.30 dmg 11 head 1.3 sta 14; bodyL .20/.05/.24 dmg 6 sta 10 plus 12 off the target's stamina; bodyR .24/.05/.28 dmg 7.5 sta 12 plus 14.
Chains: a jab's recovery can cancel into cross, hook or body after contact. Being hit interrupts a punch in startup, with a short immunity so one jab cannot stun-lock.
Counter hit (target in startup or recovery): dmg and head load x1.5.
Guard: head dmg x.2 and head load x.15 through a full guard, body shots pass at x.9, drains 6 sta/s, moves x.55. Guard value scales with `guard` 0..1, which sags as stamina empties.
Slip: .3 s, 14 sta, evades head shots from .04 to .22 s, not body shots, short cooldown.
Stamina regen 14/s, none for .4 s after a punch, none while guarding. Below 25: punches 20% slower, dmg x.75, hands lower, turn slower.
Hidden `head` load: rises only from head contact, sheds .05/s, is never drawn or hinted at numerically. warn 7: late guard and slower turning. bad 13: hands drift low, standing sway, long blinks. stop 20: referee stops the fight whatever the health bar says.
Tune so a stoppage can really happen with substantial health left. A fighter should be able to be stopped at around 40-65 HP after taking repeated clean head shots, especially hooks.
Knockdown at 0 HP or a heavy clean shot when badly hurt: count at 1 per second. Getting up by mashing punch keys, AI by a roll that worsens with `head`. Back up with HP 45, 30, 18 by knockdown number. Three in a round is a TKO. Count of 10 is a KO.
Match: 3 rounds of 60 s, 8 s break (+18 HP, stamina full, head -1). Round scored 10-9 by damage, 10-8 with a knockdown. Decision at the end. Show round wins in the HUD.
End screen keeps one honest report line: `you took N clean to the head · he took M`, and if stopped, the first time per session: `he was carrying it before you saw it`.
Measured ranges must come from the real rig: when the sim says a punch landed, the glove must visibly touch the target. Solve reach from `FighterRig` geometry, do not guess. Minimum separation so bodies do not intersect. Ropes are a soft boundary: fighters stop and rebound, and knockback pushes into them.

### Rig spec
Upper body from mocap (stance loop and punch clips, time-warped to sim timing), lower body from a foot planter:
two-bone leg IK to planted feet, orthodox stance (left foot forward), lead foot first when advancing, rear foot first when retreating, steps with an arc and a boxer's bounce, heels light. No foot skating, ever.
Pelvis takes the clip's rotation and a damped bob. Arm IK aims the glove at the opponent's real head or chest at contact, blending in and out, so a landed punch touches.
Additive reactions: head snap by hit direction, body fold, stagger, plus face morphs (wince, blink, slack jaw, squint). Warning signs are performed, never highlighted. Knockdown and get-up from CMU clips (`90_18` fall, `140_08` and `139_18` get up, verify visually) with the planter faded out.
Sweat follows fatigue. Winner raises a hand. Rig reads sim state and events only. Getters: `headWorld()`, `chestWorld()`, `gloveWorld('L'|'R')`.

### Camera, HUD, audio, effects
Camera: Tekken-style. Side-on to the fighters' line, framing both, distance grows with separation, slow orbit that follows the line and never flips sides abruptly, player stays on the left. Hide near-side ropes when they block the view. Auto-focus DOF on the midpoint, with the men and the canvas around them always sharp and almost deep focus on wide shots. Impact kick and shake honour settings (`ST.camerashake`, `ST.motion`, `uiPrefs.shake`, `uiPrefs.motion`; read how `index.html` uses them). Slow motion on a knockout unless reduced motion is on.
HUD: Tekken-inspired. Large mirrored health bars across the top with a lagging damage chunk, stamina bars under them, names, round pips, a big centre clock, ROUND n / FIGHT / KO / DOWN and count banners as lower thirds so the men stay visible (top zone on tall screens), combo counter. Condensed font self-hosted from Google Fonts (Barlow Condensed, OFL) in `assets/fonts`. Respect Text Size via `ST.textsize`. Touch buttons on coarse pointers.
Effects: hit-stop 40-90 ms by power, sweat spray particles, a brief light flash at contact, canvas dust, rope wobble on contact with ropes, damage flash on the HUD. No blood.
Audio: WebAudio synthesis only, no files. Punch thuds by type and blocked, whoosh, canvas foot squeaks, bell, crowd bed that swells on big shots, count. Honour `ST.fxvol` and `uiPrefs.sound`; read how `index.html` uses them.

### Room
A real basement fight venue, 18 m by 18 m, ceiling about 4.5 m. Ring centred: 6.4 m platform, 0.75 m high, canvas with scuffs, four posts with coloured pads (blue corner, red corner, two neutral), three taped ropes each side with sag, apron, steps, stools and buckets in the corners. Breeze-block or brick walls, wet concrete floor, pipes, ducts, cables, beams. Poly Haven models and textures, CC0 (`hanging_industrial_lamp`, `caged_hanging_light`, `modular_industrial_pipes_01`, `modular_airduct_circular_01`, `metal_stool_01`, `wooden_bucket_01`, `concrete_block_wall_02`, and similar; check sizes, stay lean). One strong warm key with shadow over the ring on a swaying lamp, dim bulbs around, haze cones, dust. A low HDRI environment for reflections only. Benches and a seated and standing crowd of Rocketbox people, baked to static poses and instanced, dark and out of focus, with a small shader sway.

### Quality
low: no film pipeline, direct tone mapping, 1024 textures, no AO or DOF, small shadow map, little haze, few crowd, pixel ratio 1, works on a phone GPU.
medium: film, bloom, DOF 12 taps, 1024 textures. high: film, AO, DOF 16 taps, MSAA 4, 2048 textures. Auto-detect, `ST.lowdetail` forces low, drop a level if frames stay slow. Target 60 fps on an M1 at 1080p on high.

## Credits
`site/CREDITS.md` from `assets/manifest.json` plus: Microsoft Rocketbox (MIT, keep the licence text), CMU Graphics Lab Motion Capture Database
(`The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.`), Three.js (MIT), fonts (OFL). Placeholders go in `site/ASSET_LIST.md`.
