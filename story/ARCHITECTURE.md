# Story Mode engine — architecture and module contract

This is the contract every module is written against. If your module needs something another module does not export here, do not invent a private back channel: use what is listed, or add a small, clearly named export to YOUR module and note it in `story/dev/notes/<module>.md`. Everything lives under `story/`. Content design lives in `story/BIBLE.md`; the user's request and canon are in `story/design/BRIEF.md`.

## 0. Ground rules

- Plain classic scripts, no ES modules, no build step, no external libraries, no image or audio files. Every file is wrapped as `(function (S) { 'use strict'; ... })(window.STORY);`. `core.js` creates `window.STORY`.
- Modern JS is fine (classes, private fields, `?.`, `??`, generators). It must run in current Chrome/Safari/Firefox AND headless in JavaScriptCore under `osascript -l JavaScript` (see §11). JavaScriptCore there does **not** settle promises during a run, so nothing in the simulation may depend on promises or `await`. Story scripts are **generator functions** (`function*`), stepped by the director.
- Fixed simulation step `S.DT = 1/120` s. Rendering runs per `requestAnimationFrame`. Simulation never reads wall-clock time; everything uses `S.time` (sim seconds). Randomness in gameplay uses `S.rand()` (seeded), never `Math.random()`, so headless runs are reproducible.
- `S.headless === true` means: no canvas drawing, no DOM, no audio. Logic must still run fully. Guard all drawing/DOM/audio behind `if (!S.headless)` or no-op adapters.
- Logical canvas 640x360. World units are logical pixels, y grows downward. Actors are positioned by feet: `x` = centre, `y` = feet.
- Never block the page: catch errors inside the loop, show them in the error overlay (`S.fail(err)`), keep the lobby reachable.
- Visual direction: `story/design/ref-movement-art.pdf`. Jin ~46 px tall, muted blue-gray streets, worn brown brick, warm amber lights, charcoal/plum shadows, no heavy black outline on Jin, eyes hidden, reddish scar patch on his right cheek (visible when facing right), blue track top with off-white sleeve stripes, black pants, white running shoes, no cane. Inverted detail density: simple characters, detailed backgrounds.

## 1. Files and load order

The loader (in `game.js`, §12) loads `story/story.css`, then these scripts in order, then calls `STORY.open()`:

1. `core.js` — namespace, util, rng, events, input, audio, storage, settings, persistent state, save/load
2. `art.js` — palette, pixel font, figure renderer, poses, looks registry, small canvas helpers
3. `pieces.js` — environment piece library, backdrops, weather, lighting helpers
4. `world.js` — locations, baking, camera, collision, actors, NPC behaviour, interaction, doors, triggers, render pipeline
5. `combat.js` — Jin controller, enemies and AI, hit system, effects, fights and bouts, tuning table
6. `activities.js` — training drills, carry, repair, work shifts, timeline board logic, evidence presentation logic
7. `director.js` — scene runner, script API `A`, dialogue/choice state, quests/evidence/memories/people/flags/relationships, chapter flow, checkpoints, autoplay policy
8. `ui.js` — all DOM interface (HUD, dialogue, windows, title, menus, toasts, chapter cards and completion, endings)
9. `chapters/cast.js` — shared looks and cast (people archive base entries)
10. `chapters/places.js` — shared location builders for recurring places
11. `chapters/c00.js` … `chapters/c10.js` — chapter content (and `chapters/c99_sandbox.js`, the movement test area)
12. `main.js` — open/close, title flow, main loop, resize/scaling, error overlay, `S.test` harness API

The ordered list is exported as `STORY_FILES` at the top of the loader and in `story/manifest.js` (an array of paths) so the headless runner uses the same list.

## 2. core.js

```
S.VERSION = 'story-1'
S.W = 640; S.H = 360; S.DT = 1/120
S.time            // sim seconds since open (advances only while not paused)
S.realTime        // seconds since open, wall clock (for UI anims only)
S.headless        // set before core loads by the headless runner, else false
S.paused          // true while a window (journal, pause menu, document) is open
S.timeScale = 1   // slow motion multiplier for actors (director fx 'slowmo')
S.hitstop = 0     // seconds remaining of hit-stop: actors frozen, camera/UI/director timers continue

S.util = { clamp, lerp, invLerp, approach(v, target, delta), sign, ease: { inOut, out, in, outBack }, hash(n) /*0..1 deterministic*/, pick(arr, r), dist(ax,ay,bx,by), fmtMoney(n) }
S.rand()          // seeded PRNG 0..1 (mulberry32); S.seed(n) reseeds; S.randRange(a,b); S.randInt(a,b)

S.events.on(name, fn) / off(name, fn) / emit(name, data)
  // events used across modules (emit them where they happen):
  // 'hit' {attacker, target, kind:'light'|'heavy', dmg, x, y}   'whiff' {actor, move}
  // 'slip' {ok:bool}  'counter' {}  'jinHurt' {dmg}  'jinDown' {}  'enemyDown' {enemy}
  // 'enterLoc' {id}  'interact' {kind, id}  'quest' {id, state, step}  'evidence' {id}
  // 'memory' {id}  'flag' {name, value}  'checkpoint' {label}  'toast' {text, kind}
  // 'fightStart' {id}  'fightEnd' {id, won}  'chapterStart' {n}  'chapterEnd' {n}

S.input
  .actions = ['left','right','up','down','jump','punch','dash','slip','flurry','interact','journal','map','minimap','pause','run']
  .presets = { A: {...}, B: {...} }  // A: A/D move, W up, S down(guard), Space jump, J punch, K dash, L slip, U flurry, E interact, Tab journal, M map, N minimap, Esc pause, Shift run(walk toggle)
                                     // B: arrows move/up/down, Z jump? no: Up jump is confusing — B: arrows move, Alt jump, X punch, C dash, V slip, F flurry, Space interact, I journal, M map, N minimap, Esc pause, Shift run
  .bindings          // action -> [KeyboardEvent.code, ...], from settings, falls back to preset A
  .down(action)      // held this step
  .pressed(action)   // went down this step (edge)
  .released(action)
  .buffer(action, seconds=0.10)  // true if pressed within the last `seconds` and not yet consumed; consumes it
  .consume(action)
  .any()             // any action pressed this step (for "press any key")
  .virtualDown(action, bool)     // tests and on-screen buttons
  .rebind(action, slot, code) / resetBindings(preset)
  .labelFor(action)  // human label of the first binding, e.g. 'J', 'Space', 'Esc' — UI and tips use this, never hardcode keys
  .update()          // called once per sim step by main loop: computes edges from raw key state
  // Listens to window keydown/keyup only while S.isOpen; preventDefault for bound keys (including Tab and Space) while open.

S.audio  // WebAudio synthesis only. All no-op when headless or muted.
  .play(name, opts)   // names: 'jab','cross','hook','upper','heavy','whiff','block','dash','slip','slipOk','counter','hurt','down','step','land','jump','bell','bell3','door','stairs','pickup','paper','evidence','quest','checkpoint','ui','uiBack','uiMove','type','heartbeat','crowdRoar','crowdGasp','carHorn','vanDoor','glass','phoneRing','dial','radio','tvStatic','buzz'
  .loop(name, vol, fade)  // ambience loops: 'city','rain','hum'(fluorescent),'crowd','arena','wind','traffic','fire','room','courtyard','office','tinnitus'
  .stopLoops(fade)
  .muffle(amount 0..1, seconds)  // lowpass + volume dip for sabotage/underwater feel
  .master(vol)
  // The hit sound and the whiff sound must be the most distinct pair; slipOk must be unmistakable.

S.store.get(key, def) / set(key, value) / del(key)   // localStorage under 'iti.story.' with try/catch; in-memory fallback

S.settings  // persisted under 'settings'
  { difficulty: 'normal' /* 'story' | 'normal' | 'veteran' — scales ONLY Jin's condition recovery */,
    textSpeed: 1 /* 0.5..2, 3 = instant */, shake: 1 /* 0..1 */, flash: 1 /* 0..1 */, sfx: 0.8, ambience: 0.6,
    minimap: 'partial' /* 'full'|'partial'|'hidden' */, bindings: null, preset: 'A', showTips: true }
S.saveSettings()

S.G   // the persistent game state, see §9. S.newState() returns a fresh one.
S.save(slot /* 'auto' | 1 | 2 | 3 */, label) -> bool
S.load(slot) -> bool (sets S.G)
S.listSaves() -> [{slot, label, chapter, loc, playtime, when}]
S.hasSave(slot)
```

## 3. art.js

```
S.pal   // named palette: blue-gray street tones, brick browns/reds, charcoal, plum, green-gray metal, amber light, skin tones, Jin's colours. Use these everywhere.

S.font.draw(ctx, text, x, y, {color, scale=1, align:'left'|'center'|'right', shadow}) // 3x5 pixel font, uppercase, digits, . , ' ! ? - : / & # $ ( ) "
S.font.width(text, scale)

S.looks           // registry: id -> LookDef (chapters/cast.js fills it; art.js ships 'jin', 'jin_ring', 'jin_hospital' (gown), 'jin_rehab' (tee and sweatpants), 'jin_street' (track top + knuckles when gear.knuckles), and generic fallbacks 'man', 'woman', 'kid', 'thug', 'collector', 'guard')
S.defineLook(id, LookDef)

// LookDef
{ h: 46,                       // standing height px (adults 40–50, kids 28–34)
  build: 'avg'|'slim'|'broad'|'heavy'|'boxer'|'old'|'kid',
  skin: '#hex',
  hair: { style: 'twoblock'|'short'|'buzz'|'bald'|'long'|'ponytail'|'bun'|'curly'|'afro'|'slick'|'gray_short'|'bob'|'braids'|'cap'|'beanie'|'fedora'|'hood', color: '#hex' },
  top: { kind: 'track'|'tee'|'tank'|'shirt'|'polo'|'hoodie'|'sweater'|'jacket'|'leather'|'coat'|'trench'|'suit'|'blazer'|'scrubs'|'gown'|'dress'|'overalls'|'vest'|'robe'|'bare'|'cardigan'|'uniform', color: '#hex', color2: '#hex' /* trim, stripes, shirt under suit */, long: false /* to the knee */ },
  bottom: { kind: 'pants'|'jeans'|'slacks'|'skirt'|'long_skirt'|'shorts'|'trunks'|'sweats', color: '#hex' },
  shoes: '#hex',
  extras: [ 'glasses', 'tie:#hex', 'scarf:#hex', 'gloves:#hex' /* boxing gloves */, 'wraps', 'knuckles', 'apron:#hex', 'badge', 'clipboard', 'cigarette', 'bag:#hex', 'scar', 'beard:#hex', 'mustache:#hex', 'earrings', 'lanyard', 'headband:#hex', 'watch', 'cap:#hex' ] }

S.art.drawFigure(ctx, x, y, face /* 1 right, -1 left */, poseName, t /* seconds into pose */, look /* LookDef or id */, opts)
  // opts: { blendFrom: {pose, t, k} /* crossfade previous pose, k 0..1 */, alpha, tint /* '#hex' flash for hits/telegraph */, squash /* -1..1 */, lean, carry /* object kind */, speed /* run cycle rate */, flip, scaleX, outlineCol, shadow:true }
  // Must draw procedurally from a 2D skeleton (hips, chest, head, hands, feet; knees and elbows by two-bone IK) with limbs stamped as small rects, so every pose reads as a silhouette at 46 px. Far-side limbs darker. Hair, clothing and extras drawn per LookDef. No facial features; upper face shaded under the hair. Jin's scar patch on the right cheek when facing right.
S.art.poses       // list of supported pose names (see below); unknown pose -> 'idle' with a console warning once
S.art.poseDuration(name) // natural length of one-shot poses (punches, getup), loops return 0
S.art.drawAfterimage(ctx, x, y, face, poseName, t, look, alpha)  // dash afterimages (tinted)
S.art.drawSmear(ctx, x, y, face, kind /* 'jab'|'cross'|'hook'|'upper'|'straight' */, k) // punch trails, narrow streaks, curved for hooks, upward for uppercuts
S.art.spark(ctx, x, y, k, color)  // impact spark
S.art.dust(ctx, x, y, k)          // foot dust puff

// Pose names (all required):
idle guard walk run backstep jump fall land dash backdash slip jab cross hook uppercut dashStraight counter flurry hurt stagger knockdown down getup
sit sitFloor sitCurb lieBed kneel crouch leanWall armsCrossed handsHips phone carry push point wave shrug headDown hug handShoulder work sweep write
smoke drink cower limp wheelchair bars shadowbox skip talk think reach pocket windup grab baton shove block tired cheer
```

## 4. pieces.js

Environment drawing is data-driven: a location lists pieces; `world.js` bakes static pieces into layer canvases on entry and asks pieces for their lights.

```
S.pieces.define(type, { draw(ctx, p, L, bake) , lights?(p, L) -> [Light], animated?: bool, drawAnimated?(ctx, p, L, time) })
S.pieces.draw(ctx, p, L)     // dispatch; unknown type draws a magenta 8x8 box and warns once
S.pieces.lights(p, L)
S.backdrop.draw(ctx, L, camX, camY, time)   // sky + far parallax for exteriors (sky presets 'night'|'dusk'|'dawn'|'day'|'overcast'|'storm'|'none'; backdrop presets 'skyline'|'foundry'|'river'|'towers'|'rowhouses'|'none'), haze, stars, distant lit windows
S.weather.update(dt, L) / S.weather.draw(ctx, L, cam)   // 'rain'|'drizzle'|'snow'|'dust'|'smoke'|'embers'|'leaves' + broken-horizontal puddle reflections for rain
S.light.composite(ctx, L, cam, lights, time)  // darkness overlay with soft holes for lights + warm additive glow; flicker; cones for streetlights and ring lights

// Light: { x, y, r, color: '#hex', k: 0..1, flicker: 0..1, cone: { dir: 'down', width: deg } }
// Piece common params: { t: 'type', x, y? (defaults to ground), when?: (G)=>bool evaluated at bake time, layer is given by the list it sits in }
```

Required piece types and their key params (draw all of them in the muted palette with selective wear; a repaired door, swept stoop, lit window or flowerpot shows people still care):

Architecture and street: `building {x,w,h,style:'brick'|'brick_red'|'brick_dark'|'stone'|'siding'|'concrete', floors, windows:{cols,lit,seed}, fireEscape, cornice, roof:{tank,antenna}, shop:{sign,color,awning,window:'lit'|'dark'|'boarded'}, door:{dx,kind}, posters:[]}`, `wall {x,w,h,style}`, `alley_gap {x,w}`, `streetlight {x,on,flicker}`, `pole {x}`, `wires {x0,x1,y,sag}`, `fireescape {x,y,w,floors}`, `water_tank {x,y}`, `dumpster {x,color}`, `trashbags {x,n}`, `newspapers {x}`, `pallet {x,n}`, `crates {x,n,stack}`, `barrel {x}`, `payphone {x}`, `hydrant {x}`, `mailbox {x}`, `bench {x,kind}`, `bus_stop {x,sign}`, `car {x,color,kind:'sedan'|'wagon'|'van'|'pickup'|'cab',face}`, `fence {x,w,kind:'chain'|'wood'|'iron'}`, `gate {x,w,open}`, `stoop {x,w}`, `stairs {x,w,h,dir}` (visual), `planter {x,flowers}`, `tree {x,kind}`, `poster {x,y,kind:'boxing'|'concert'|'missing'|'notice'|'ad'|'jin_fight',torn,text}`, `flyer {x,y,text}`, `notice {x,y,lines}`, `graffiti {x,y,w}`, `sign {x,y,text,color,neon,w}`, `window {x,y,w,h,lit,curtains,broken,boarded}`, `door {x,kind:'wood'|'metal'|'glass'|'roll'|'double',color,open,label}`, `awning {x,w,color,stripes}`, `billboard {x,y,w,text}`, `laundry_line {x0,x1,y}`, `basketball_hoop {x}`, `garden_plot {x,w}`, `mural {x,y,w,h}`, `memorial {x}`, `caution_tape {x0,x1,y}`, `rubble {x,w}`, `burned_wall {x,w,h}`, `scaffold {x,w,h}`, `puddle {x,w}`, `smokestack {x,h}` (far), `bridge {x,w}` (far), `river {}` (far).

Interiors: `bed {x,kind:'hospital'|'cot'|'single'|'bunk'}`, `curtain {x,w,open}`, `iv_stand {x}`, `med_monitor {x,y}`, `wheelchair {x}`, `parallel_bars {x,w}`, `mat {x,w,color}`, `desk {x,w,kind:'office'|'nurse'|'reception'|'school'|'executive'}`, `chair {x,kind:'office'|'wood'|'plastic'|'stool'|'folding'|'armchair'}`, `table {x,w,kind}`, `filing_cabinet {x,n}`, `shelf {x,w,h,items:'books'|'boxes'|'files'|'cans'|'tools'|'trophies'}`, `locker {x,n,open}`, `tv {x,y,on,content:'static'|'boxing'|'news'}`, `radio {x,y}`, `sofa {x,w,color}`, `fridge {x}`, `stove {x}`, `sink {x}`, `counter {x,w}`, `lamp {x,y,kind:'desk'|'floor'|'bulb'|'fluorescent'|'pendant',on}`, `ceiling_light {x,kind}`, `picture {x,y,w,h,kind:'photo'|'frame'|'certificate'|'poster'|'calendar'}`, `clock {x,y}`, `bulletin_board {x,y,w,h}`, `chalkboard {x,y,w,h,lines}`, `boxes {x,n,label}`, `heavy_bag {x}`, `speed_bag {x}`, `ring {x,w,ropes,corners:['#hex','#hex']}`, `bleachers {x,w,rows,crowd}`, `crowd {x,w,rows,density,mood:'cheer'|'idle'|'tense'}` (animated), `spotlight {x}`, `corner_stool {x}`, `bucket {x}`, `banner {x,y,w,text,color}`, `bowling_lanes {x,w}`, `forklift {x}`, `shelving {x,w,h,stock}`, `container {x,color}`, `loading_dock {x,w}`, `roll_door {x,w,open}`, `catwalk {x,y,w}` (visual), `pipes {x,w,y}`, `safe {x,open}`, `cage {x,w}`, `office_window {x,w}`, `workbench {x,w}`, `boiler {x}`, `tool_wall {x,w}`, `elevator {x,open}`, `glass_wall {x,w}`, `plant {x}`, `art {x,y,w,h}`, `reception {x,w}`, `window_city {x,y,w,h,view:'skyline'|'river'|'night'}`, `fire_damage {x,w,h}`, `soot {x,w}`, `candles {x}`, `flowers {x}`, `mattress {x}`, `stairs_interior {x,w,h,dir}`, `rug {x,w,color}`, `phone_wall {x,y}`, `mirror {x,y}`, `trophy_case {x,w}`, `vending {x}`, `water_cooler {x}`, `copier {x}`, `stage_lights {x,w}`.

Rooms: interiors set `room: { wall, wall2, floor, pattern:'brick'|'tile'|'wood'|'paneling'|'concrete'|'plaster'|'wallpaper'|'marble'|'carpet', ceiling: y, trim }`; `world.js` draws the room shell, then pieces.

## 5. world.js

```
S.world.loc              // current LocationDef (resolved), S.world.locId
S.world.enter(locId, x, {y, face, fade=true, silent=false})   // load (bake layers, build actors from placements), place Jin, run firstEnter/enter scenes
S.world.actors           // array: Jin first, then NPCs and enemies
S.world.jin              // Jin's actor
S.world.actor(id)        // find by id
S.world.spawn(placement) -> actor   /  S.world.remove(id)
S.world.update(dt)       // NPC behaviour, Jin + enemies via S.combat.updateActor, interaction focus, doors, triggers, camera, particles, weather
S.world.render(ctx)      // full frame: backdrop, far/mid parallax, room shell, back layer, actors (y/layer sorted), effects, front, fore, weather, lighting, post fx (from S.fx)
S.world.collide(actor, dt)  // integrates position with floors, walls, one-way platforms (drop through with down+jump), ladders; sets actor.onGround, actor.wallL/wallR
S.world.groundAt(x, y) -> y of the floor below
S.world.focus            // current interactable {kind:'npc'|'object'|'door', ref, label, verb} or null
S.world.screenPos(x, y) -> {x, y} in CSS pixels relative to the story root (for DOM barks/prompts/markers)
S.world.minimap()        // data for UI: {w, h, jin:{x,y}, npcs:[{x,y,marker}], doors:[{x,label}], targets:[{x}]}

S.cam = { x, y, zoom: 1, shake: 0, mode: 'follow'|'scripted', target: actor|null, lookAhead: 40, bounds }
S.cam.to({x, y, zoom, dur, ease}) -> a Wait (see director)   S.cam.follow(actor?)   S.cam.shakeIt(amount, dur)   // shake scaled by settings.shake
S.fx = { muffle:0, blur:0, double:0, desat:0, vignette:0.25, heartbeat:0, flash:0, flashColor, sepia:0, letterbox:0 }  // world.render applies them; director animates them

// LocationDef (chapters write these)
{ name, area, w, h = 360, kind: 'exterior'|'interior', ground: 300,
  sky, backdrop, weather, ambient: { dark: 0..1, tint: '#hex', fog: 0..1 }, sound: { loop, vol },
  room: { ... },                         // interiors
  layers: { far: [], mid: [], back: [], front: [], fore: [] },   // PieceDef lists; parallax far .25, mid .6, back/front 1, fore 1.25
  floors: [ { x0, x1, y } ],             // optional piecewise ground; default one floor at `ground` across the width
  solids: [ { x, y, w, h, oneway } ],    // platforms (oneway true) and walls
  ladders: [ { x, y0, y1 } ],            // up/down to climb; also used for stairs between floors
  lights: [ Light ],                     // extra lights besides piece lights
  doors: [ DoorDef ], npcs: [ NpcPlacement ], objects: [ ObjectDef ], triggers: [ TriggerDef ],
  points: { name: { x, y } },            // named spots for scripts
  camera: { zoom: 1, yOffset: 0, x0, x1 },
  firstEnter: 'sceneId', enter: 'sceneId',
  map: 'nodeId' }                        // world-map node this place belongs to

// DoorDef
{ id, x, w = 24, y?, to: 'locId', tx, ty?, face?, label: 'Hallway', verb: 'Enter', kind: 'door'|'edge'|'stairs'|'ladder',
  auto: false /* edge doors fire when walked into */, locked: (G) => false | 'Why it is locked, in Jin's words or a plain reason', when: (G) => bool, sound: 'door' }
// NpcPlacement
{ id, look: 'lookId' | LookDef, name, x, y?, face: 1|-1, pose: 'idle', talk: 'dialogId' | function*,
  barks: ['line', ...] | (G) => [lines], barkRadius: 70, marker: (G) => '!'|'?'|'…'|null, when: (G) => bool,
  wander: { x0, x1, speed, pause }, path: [ {x, wait, pose} ], loop: true, layer: 'back'|'main'|'front' }
// ObjectDef
{ id, x, y?, w = 20, h = 30, label: 'Promo photo', verb: 'Examine'|'Read'|'Sit'|'Open'|'Use'|'Take'|'Listen'|'Call'|'Knock'|'Search',
  text: 'line' | ['line', ...] /* simple examine: Jin's thought lines */, run: 'sceneId' | function*,
  evidence: 'id', memory: 'id', once: false, when: (G) => bool, hidden: false /* only shows when Jin is within 24 px */, glint: true }
// TriggerDef
{ id, x0, x1, y0?, y1?, run: 'sceneId' | function*, once: true, when: (G) => bool }
```

Interaction: the nearest valid interactable within ~28 px in front of Jin gets focus; UI shows `[E] Talk — Mrs. Delgado`. Pressing interact runs it. NPCs face Jin while talking. NPC barks appear when Jin comes within `barkRadius`, at most one bark on screen at a time, each line not repeated within 20 s. Markers come from `marker(G)`. Edge doors on the map's left/right ends are `auto`. Locked doors play a short rattle and show their reason. Quest targets (current main objective `target: {loc, x}`) appear on the minimap.

Camera: follow Jin with smoothing and look-ahead in the facing direction, vertical follow on tall maps, clamped to the map bounds; during fights the camera frames all fighters and is clamped to the fight arena; scripted mode is driven by the director (`A.cam`). Zoom is applied around the view centre. Shake respects `settings.shake`.

## 6. combat.js

```
S.tune   // every number from ref-movement-art.pdf §6, in H units where it says so (H = 46 px), editable at runtime:
  { H: 46, runSpeed: 4 /*H/s*/, walkSpeed: 1.7, accelTime: .10, decelTime: .07, airControl: .7, gravity, fallGravityMul: 1.25, jumpVel, jumpCut: .5, coyote: .08, landRecover: .06,
    dashDist: 1.8, dashTime: .16, backdashDist: 1.1, backdashTime: .14, dashProtect: .07, dashCharges: 2, dashRecharge: .6, airDashes: 1,
    slipTime: .20, slipWindow: [.02, .08], slipCooldown: .40, counterWindow: .30, inputBuffer: .10,
    jab: { startup: .05, active: .05, recovery: .12, comboFrom: .07, dmg: 6, reach: 22, stun: .18, hitstop: .025 },
    cross: { startup: .08, active: .05, recovery: .16, comboFrom: .10, dmg: 9, reach: 26, stun: .24, hitstop: .03 },
    hook: { startup: .11, active: .06, recovery: .20, dmg: 11, reach: 24, arc: true, multi: true, stun: .30, hitstop: .05 },
    uppercut: { startup: .10, active: .06, recovery: .24, dmg: 10, reach: 20, launch: 260, hitstop: .05 },
    dashStraight: { startup: .04, active: .07, recovery: .22, dmg: 12, reach: 30, knockback: 180, hitstop: .055 },
    counter: { startup: .03, active: .05, recovery: .16, dmg: 16, reach: 26, hitstop: .065 },
    flurry: { time: .5, hits: 6, dmg: 3, finisherDmg: 8, reach: 22 },
    guardReduce: .75, guardSpeedMul: .45,
    breath: { max: 100, punchCost: 7, dashCost: 10, regen: 30, regenDelay: .5, exhaustedRecoveryMul: 1.4 },
    hitstopCapPerFrame: true, maxAttackers: 2 }
S.combat.jin              // Jin's controller state (also on S.world.jin.ctrl)
S.combat.updateActor(actor, dt)   // Jin: input -> state machine; enemies: AI -> state machine; both through S.world.collide
S.combat.body = { power: 1, speedMul: 1, breath: false, limp: 0, delay: 0 /* input delay s, sabotage */, knuckles: false }  // set per chapter / by director
S.combat.allowed = { jab, cross, hook, uppercut, dashStraight, counter, flurry, dash, backdash, airdash, slip, guard, jump, run, punch }  // derived from G.skills + director restrictions
S.combat.restrict({ punch: false, ... , reason: 'shown when a blocked verb is pressed' }) / S.combat.unrestrict()
S.combat.spawnEnemy({ type, x, y, face, name, look, hp, opts }) -> actor
S.combat.enemies()        // live, not-down enemies
S.combat.forceDown(actorId)  // scripted knockdown
S.combat.healJin(amount|'full')
S.combat.state            // { fight: FightState|null, bout: BoutState|null }
S.combat.startFight(EncounterDef) -> FightState      // director wraps it as A.fight
S.combat.startBout(BoutDef) -> BoutState              // director wraps it as A.bout
S.combat.autoWin()        // test/autoplay: down every enemy (used by autoplay policy only)
```

Jin's state machine: idle, walk/run, brake/turn, jump/fall/land, dash (ground/air/back), slip, attack (jab, cross, hook, uppercut, dashStraight, counter, flurry), guard, hurt, down, getup, carry, scripted. Implement every rule in `ref-movement-art.pdf` §1–§9: two shared dash charges recharging sequentially, air dash once per airborne sequence (landing restores eligibility, not charges), dash dodge window only near the start, attacking ends dash protection, pass through ordinary enemies during the dodge window but never through walls, dashing deals no damage; slip with a short evade window, vulnerable if mistimed, avoids direct strikes only, opens a counter window only after a real evade, counter needs a manual press; jab→cross→hook on repeated presses with stops allowed; cancel windows; heavies keep active frames before a defensive cancel; dash into dash straight after the initial burst; backdash into returning cross; jump carries horizontal speed within a limit; one buffered input; canceled punches never deal damage; hit-stop 20–35 ms light, 45–65 ms heavy, capped so multi-hits freeze once; directional recoil, sparks, sounds, restrained shake; afterimages (2–3) during dashes; smear frames; dust at push-off. Down + punch = uppercut. Guard = hold down while grounded and not punching.

Breath (only when `S.combat.body.breath`): punches and dashes cost breath, it regenerates after a short delay; at zero, recovery is slower and dash recharge halves. Shown by the HUD. The PDF says the first prototype has no stamina; the story PDF says extended exchanges exhaust Jin after the injury, so breath is on from Chapter 2 onward, never in Chapter 0.

Condition (HP): Jin `hp/hpMax` (100). Difficulty scales only recovery: story = no damage taken while above 1 HP floor... precisely: `story`: Jin cannot fall below 1 HP and regenerates fully 2 s after avoiding damage; `normal`: regenerates to full 3 s after avoiding damage, but only between exchanges (when no enemy is attacking); `veteran`: regeneration capped at half max. Damage numbers themselves never change by difficulty.

Enemy archetypes (type ids): `thug`, `collector`, `boxer`, `guard`, `director`, `boss_collector`, `champion`, `sparring`, `bag`, `dummy`, `enforcer`. Each has: hp, poise (stagger resistance), speed, reach, attacks with windup (telegraph: a 1-px tint flash on the figure plus a tiny exclamation spark at its head, readable at normal scale), active, recovery, committed direction (set at windup, does not track through dashes), and openings after whiffs. `boxer` keeps distance, feints (a windup that cancels), punishes three quick jabs in a row by slipping and countering, and leaves different openings after missed jabs vs. hooks. `director` stays back, points, and makes allies within 160 px attack 30% faster until knocked down. `boss_collector` cuts Jin off toward walls, grabs when Jin's back is near a wall, resists stagger (poise), never launch-loops. `champion` has readable patterns (double jab, right hand, body hook combo, a lean-back counter), phases, resists repeated stagger; `opts.patternSet` selects 'ch0' or 'ch8' (ch8 shows the same patterns with tells the player now recognizes). Limit simultaneous attackers to `maxAttackers` with an attack token and keep spacing. Light enemies can be launched; heavy ones and bosses cannot be juggled more than once.

EncounterDef: `{ id, arena: { x0, x1 }, waves: [ { enemies: [ { type, x, face, name, look, hp } ], delay } ], maxAttackers, checkpoint: true, tips: [ { text, at: 'start'|'firstWhiff'|'firstSlip'|'lowBreath' } ], allowLoss: false, onLoss: 'retry' }`
BoutDef: `{ id, ring: { x0, x1 }, opponent: { type, name, look, hp, opts }, rounds: 3, roundTime: 60, startRound: 1, endWhen: 'ko'|'time'|'roundEnd', crowd: true, bell: true, corner: 'sceneId per round break', allowLoss: false, debuff: (round, t) => ({ speedMul, delay, muffle, blur, double }) }`
FightState/BoutState expose `{ done, won, round, time, stats: { hits, taken, slips, counters } }`.

## 7. activities.js

```
S.activities.start(name, opts) -> ActivityState { done, result }   // director wraps it as A.activity
// names and opts:
'train_balance'      { level } — hold Jin steady on a beam/bars against a sway meter for N seconds (left/right correct the sway)
'train_footwork'     { level } — floor marks light in sequence; reach each with steps/dashes/backdashes in time
'train_reaction'     { level } — a coach or a pad machine swings left/high/low; slip, guard or jab the right one in time
'train_conditioning' { level } — laps; hold run, ease off before breath runs out; distance target
'train_bag'          { level } — perform the shown combination on the heavy bag (jab, cross, hook, uppercut) cleanly
'train_mitts'        { level } — partner calls punches and swings back; slip then counter
'carry'              { item, from: x, to: x | locId, label } — Jin carries something: slower, no punch/dash/jump, a stated reason when pressed
'repair'             { steps: [ { prompt, action: 'interact'|'left'|'right'|'up'|'down'|'punch', hold: seconds } ], label }
'work_shift'         { tasks: [ activity specs ], pay } — chains carry/repair tasks, then pays modest money
'timeline'           { cards: [evidenceId|{id,title,date}], slots: n, answer: [ids in order], lines: { id: 'line spoken when placed right' } } — UI board, wrong placements get a hint, no failure
'present'            { claim, accept: [evidenceIds], rebuttal: 'line when wrong', speaker } — choose evidence from the archive to support a claim; wrong picks get a rebuttal and retry, no failure
```

Training levels live in `G.train[drill]` (0–3, hard cap 3). Effects, applied in exactly one place (`S.activities.applyTraining()`): balance → shorter landing/hurt recovery; footwork → dash recharge up to −15%; reaction → slip window up to +20 ms; conditioning → breath max up to +30; bag → punch damage up to +10%; mitts → counter window up to +60 ms. Training improves control of the body Jin has; it never removes his injuries and never adds HP.

## 8. director.js

Story scripts are generator functions `function* (A, G) { ... }`. Each `yield` hands the director a Wait; the director resumes the generator when the wait completes and passes its result back (`const v = yield A.choice(...)`). Sub-scenes: `yield* A.sub('sceneId')`. A scene that throws is caught: the error goes to `S.fail`, control returns to the player, and play continues.

```
S.director.run(sceneIdOrGenFn, {label}) -> handle   // only one main scene at a time; a second request queues
S.director.busy          // a scene is running
S.director.update(dt)
S.director.dialog        // current dialogue state for UI: { speaker, name, text, shown, thought, choices: [{text, enabled, hint}], sel } | null
S.director.advance()     // UI/input: complete typing or go next
S.director.choose(i)
S.director.policy        // autoplay policy for tests: null | { choose: (choices, ctx) => index, autoAdvance: true, fights: 'auto'|'real' }

S.story.chapters[n]      // registered chapters
S.defineChapter(ChapterDef)
S.story.start(n, {fromSave})   // chapter card -> start location -> start scene
S.story.next()                 // to chapter n+1, or to the ending flow after 10
S.story.chapterSelect(n)       // replay a completed chapter from its start with the flags it had at that start (snapshot taken at chapter start)

// ChapterDef
{ id: 0, title: 'One More Round', date: 'August 20, 1994', place: 'Eastgate, Calder', card: ['subtitle line', ...],
  start: { loc, x, face, scene },
  body: { look: 'jin_ring', power, speedMul, breath, limp },     // Jin's body this chapter
  skills: { hook: true, ... },                                   // skills granted at chapter start (cumulative with G.skills)
  locations: { id: LocationDef }, quests: { id: QuestDef }, evidence: { id: EvidenceDef }, memories: { id: MemoryDef },
  people: { id: PersonDef }, scenes: { id: function* }, dialogs: { id: function* },
  mapNodes: [ { id, name, x, y, locs: [locIds], travel: true } ], // world map nodes visible in this chapter
  summary: (G) => ['line', ...] }                                // extra lines on the completion screen

// QuestDef  { title, kind: 'main'|'side'|'missable', giver, summary, steps: [ { text, target: { loc, x } } ], reward }
// EvidenceDef { title, kind: 'document'|'photo'|'object'|'recording'|'letter'|'record', text, pages: ['page text', ...], proves, date }
// MemoryDef { title, text, when }
// PersonDef { name, role, look, notes: [ { id, text, when: (G)=>bool } ] }   // People archive; notes appear as learned
```

The script API `A` (every method returns a Wait unless marked "instant"):

```
A.say(who, text, opts)        // who: actor id, 'jin', a cast id, or null for narration. opts: { thought, pose, face, name, wait } — dialogue box, waits for advance
A.think(text)                 // Jin's thought (italic), same as say('jin', text, {thought:true})
A.choice(prompt, options)     // options: [ { text, value, when?: (G)=>bool, hint } ] -> value. No timers. Unavailable options are hidden, never shown as traps.
A.wait(seconds)
A.walk(id, x, { run, speed, face })     A.walkTo(id, otherId, gap)    A.face(id, dirOrId) (instant)
A.pose(id, pose, { hold }) (instant)     A.place(id, x, y) (instant)  A.show(id, bool) (instant)
A.spawn(NpcPlacement) (instant)          A.remove(id) (instant)       A.bark(id, text, seconds) (instant)
A.cam({ x, y, target, zoom, dur, ease })   A.follow(id?) (instant)    A.shake(amount, dur) (instant)
A.letterbox(on, dur)   A.fade(to, dur, color)   A.flash(color, dur)
A.card(title, sub, seconds)       // centred title card (place/time); input skips after 1 s
A.timeskip(text, sub)             // fade out, card, fade in
A.fx(name, amount, dur)           // 'muffle','blur','double','desat','vignette','heartbeat','sepia','slowmo','flash'
A.sound(name, opts) (instant)     A.ambience(loop, vol) (instant)
A.goto(locId, x, { face, fade })  // change location inside a scene
A.flag(name, value = true) (instant)   A.get(name) (instant)   A.rel(who, delta) (instant)   A.money(delta) (instant)
A.quest(id, 'start'|'step'|'done'|'fail', step) (instant; shows the notifier)
A.objective(text) (instant)       // override line for the HUD objective while a scene runs; null clears it
A.evidence(id) (instant; toast)   A.memory(id) (instant; toast)   A.meet(personId, noteId) (instant)
A.skill(name) (instant; "New technique" toast, unlocks it)        A.gear(name) (instant)
A.doc(evidenceIdOrDoc)            // opens the document/photo viewer, waits until closed
A.fight(EncounterDef) -> result   A.bout(BoutDef) -> result       A.activity(name, opts) -> result
A.control(bool) (instant)         // give the player control inside a running scene (scenes take it by default)
A.waitFor((G, S) => bool)         A.reach(x, dir)                 // wait until Jin passes x
A.restrict({ ..., reason }) (instant)  A.body({ power, speedMul, breath, limp, delay }) (instant)
A.checkpoint(label) (instant; autosave)
A.endChapter()                    // completion screen, then the next chapter
A.ending(id)                      // 'champion' | 'own_name' — sets G.ending, plays nothing by itself
A.credits()                       // credits screen: "Story Mode by Joohyun Lee and Elliot Jeong"; then back to the title
A.sub(sceneId)                    // use with yield*
```

## 9. Persistent state `S.G`

```
{ v: 1, chapter: 0, loc, x, y, face, checkpoint: { chapter, loc, x, label },
  flags: {}, rel: {}, money: 0,
  quests: { id: { state: 'active'|'done'|'failed', step: 0, seen: false } },
  evidence: { id: { at: 'chapter', seen: false } }, memories: { id: { seen: false } }, people: { id: { met: true, notes: [] } },
  skills: { jab: true, cross: true, guard: true, slip: true, dash: true, backdash: true, airdash: true, hook: false, uppercut: false, counter: false, dashStraight: false, flurry: false },
  gear: { knuckles: false }, train: { balance: 0, footwork: 0, reaction: 0, conditioning: 0, bag: 0, mitts: 0 },
  visited: {}, choices: [ { chapter, id, text } ], stats: { [chapter]: { evidence, sides, time } },
  completed: {}, snapshots: { [chapter]: <copy of G at chapter start> }, ending: null, playtime: 0 }
```

Checkpoints: autosave at chapter start, on every `A.checkpoint`, on entering a location (throttled to once per 20 s), and at chapter end. Death/defeat in a fight restores the fight start, not the save. "Continue" loads the autosave.

## 10. ui.js and story.css

DOM only (no canvas text), inside `#story-root` which also holds the display canvas. Two layers, per the research: a few fixed edge elements, everything else in summonable windows.

Fixed edges: top-left — place name (fades 4 s after entering) and the minimap (three states full/partial/hidden, `N` cycles); under it the current objective with a kind icon (main ◆, side ○, missable ★, collectable ▣). Top-right — Journal and Map buttons; the Journal button shows a badge "+" while anything is unread. Bottom-left — condition bar, breath bar (only when breath is on), two dash pips; these show in combat and when not full, and fade out in calm exploration. Barks, interaction prompts (`[E] Talk — Name`) and NPC markers are small DOM elements positioned with `S.world.screenPos`. During combat the objective and place name fade (context opacity).

Windows (pause the sim while open; Esc closes): Journal with tabs Quests | Evidence | Memories | People | Map | Training; document/photo viewer; timeline board; present-evidence picker; pause menu (Resume, Journal, Save, Load, Settings, Controls, Quit to title); settings (difficulty, text speed, shake, flash, volumes, minimap mode, tips); controls (rebind every action, presets A/B, reset); save/load slots (auto + 3). Every disabled button says why it is disabled.

Dialogue box: bottom centre, speaker plate, typewriter (respects text speed; advance completes the line first), thought lines in italics without a plate, choices navigable by up/down + interact/Enter and by mouse. Narration lines centred without a plate.

Screens: Story Mode title (Continue, New Game, Load, Chapters, Settings, Back to the lobby), chapter intro card (number, title, date and place, subtitle lines), chapter completion (evidence found x/y, optional quests done, choices made this chapter in plain words, time), ending card sequence and credits ("Story Mode by Joohyun Lee and Elliot Jeong"), toasts (quest updated, new evidence, new memory, new technique, checkpoint saved), error overlay (message + "Back to the lobby").

Style: match the existing game (`style.css` at the repo root): dark translucent panels, gold `#e8c272` accents, red `#d8402f` for danger, serif headings (Iowan Old Style, Georgia), Courier New small caps labels. Readable at 1280x720 and 1920x1080; the canvas scales by an integer factor when possible, letterboxed in black. Mouse works everywhere; keyboard works everywhere.

## 11. Headless testing

- `story/dev/stubs.js` — minimal `window`, `document` (only what core/main touch when headless), `localStorage`, `performance`, `console` for JavaScriptCore.
- `story/dev/headless.js` — run with `osascript -l JavaScript story/dev/headless.js <repoRoot> [command]`. Reads `story/manifest.js`, evaluates stubs then every story file with `S.headless = true`, then runs the command and prints JSON:
  - `load` — every file evaluated, every chapter registered, every location/scene/dialog/quest/evidence id referenced is defined (static cross-reference check), prints problems.
  - `chapter N` — starts chapter N from a fresh state seeded with the canonical flags from earlier chapters, runs with the autoplay policy (advance dialogue, pick options by a policy, fights 'auto' unless `--real`), steps the sim in 1/120 s steps up to a time limit, and reports: reached the chapter end or not, scenes run, errors, stuck detection (no progress for 120 sim seconds), unvisited required locations.
  - `campaign [policy]` — chapters 0..10 in one run, policy 'restraint' (refuse, spare, leave money, keep promises) or 'ruthless' (accept, continue, take envelope, threaten); both endings must be reached by the matching policy.
- `S.test` (main.js): `boot({ headless })`, `step(seconds)`, `press(action)`, `release(action)`, `tap(action)`, `snapshot()`, `goto(locId, x)`, `startChapter(n, flags)`, `walkJinTo(x)` (drives input until Jin reaches x or is blocked), `interactNearest(kindOrId)`, `state()`, `log` (array of events), `errors` (array).
- Autoplay must be able to finish every chapter without special cases in chapter code: every required interaction is reachable by walking and pressing interact, every scene ends, every quest step has a reachable trigger. Chapter code may add `autoplay` hints to a scene or quest step (`{ autoplay: { walkTo: x, interact: id } }`) when the path is not obvious.

## 12. Integration with the existing game

- `game.js` stays a classic script. Changes there are limited to: the Story Mode card becomes live and its click calls `window.__openStory()`; its subtitle changes to fit the new mode; `hotkeysBlocked()` also returns true while `#story-root` exists. Nothing else in `game.js`, `index.html` or `style.css` changes.
- The loader `window.__openStory` (in `game.js`, next to the card code) injects `story/story.css` and the scripts in order once (relative paths, no leading slash, so it works on Cloudflare, GitHub Pages under `/inside-the-impact/`, and `file://`), shows a small loading line, then calls `STORY.open({ onExit })`. A load failure shows a plain message with Try again and Back.
- `STORY.open()` creates `#story-root` over the whole page (fixed, z-index above the lobby), pauses nothing of the lobby except key handling, and `STORY.close()` removes it and returns to the lobby. Esc on the title screen goes back to the lobby.
- Career parity must not change: `tools/parity.js` signature `3bea3b59`, `tools/jscheck.py` must pass on `index.html`, and `tools/smoke.js` must pass (20 checks).
