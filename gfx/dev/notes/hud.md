# HUD, audio, effects

Status: stopped at the usage limit (5-hour figure hit 72). HUD is built and looked at. Audio and effects are NOT built:
`gfx/arena/audio.js` and `gfx/arena/fx.js` are silent placeholders that only match the contract so imports do not fail.

## Exists and verified by looking at renders
- `assets/fonts/`: Barlow Condensed latin woff2 (500, 600, 700, 700i, 800i, 900i, 97 KB in all) plus `OFL.txt`.
- `gfx/arena/arena.css`: all rules under `.arena-x`; only @font-face (`ArenaBarlow`) and @keyframes (`ax-*`) are global. `.arena-x` is the fixed overlay (z-index 90). Text size via `data-ax-text` on the scope (S .9, M 1, L 1.2), set by hud.js from `documentElement.dataset.textSize` or `iti.settings.v1`.
- `gfx/arena/hud.js`: `createHud(rootEl, opts)`.
- `gfx/dev/hud.html`: bench with a fake match over `ref/look-target.png` (bench only). `?touch=1 &text=large &rm=1 &keys=1`. `HUDTEST.scene(name, waitMs)`; scenes load0 load intro intro3 fightbanner fight combo low downo downp time ko tko stopped decision endstop endko enddec pause.
- Looked at: all scenes at 1280x720 and 390x844 touch; most at 360x640 touch with large text; ko, low, downp, endstop, pause, load at 844x390. No overflow reported by `HUDTEST.overflow()` after fixes except the known tired-tag squeeze below.
- Scratch tools, not in the repo: `scratchpad/hud/shots.py OUTDIR 'scene:wait@WxH?query' ...` (one Chrome, many shots, same lock as cdp.py), `scratchpad/hud/montage.py OUT COLS files...`. Shots in `scratchpad/shots/hud/`.

## HUD API (contract plus additive extras, a contract change for index.js to know)
`createHud(rootEl, { touch, onPause, onResume, onRematch, onExit, onInput })` -> `{ update(match, dt), onEvent(ev), showLoading(p, label), destroy(), setPaused(bool), paused, reset(), stick, el, ready }`
- `rootEl`: the overlay `.arena-x`, or anything inside one. Adds the class if there is none. hud.js injects `arena.css` itself unless a link to it exists. `ready` resolves when css and fonts are in.
- Call `hud.onEvent(ev)` for each event, then `hud.update(match, dt)` each frame. Events queue until update. A new match object (or `reset()`) clears everything.
- `showLoading(p, label)`: p 0..1 shows the load screen, real progress only, never goes backward. p >= 1 or false fades it out.
- Buttons: pause icon, Resume, Restart, Rematch, Exit call `onPause/onResume/onRematch/onExit` and also dispatch bubbling `arena:pause|resume|rematch|exit` on the scope. Rematch and Restart call `hud.reset()` first; index.js must then make a new match. Esc is index.js's job: call `hud.setPaused(true|false)`, which does not fire callbacks. While `hud.paused`, or while the end panel shows, index.js must ignore game keys.
- Touch: shown when `touch` is true (default: coarse pointer). With `onInput(code, down)` it gets KeyboardEvent codes (KeyW KeyA KeyS KeyD KeyJ KeyK KeyL KeyU KeyI KeyO ShiftLeft Space). Without it the HUD dispatches real KeyboardEvents on document.body, so a key-driven handler works unchanged. Analog stick in `hud.stick {x, y, active}`, x right, y forward. Punch buttons also serve as get-up mash.

## Reading the sim (gfx/dev/notes/sim.md is the source)
Uses `state round rounds clock scores result`, fighter `hp maxHp sta maxSta name corner down{count,n} landed clean`, events by type. Never reads `head`, `pHead`, `oHead`.
Round pips and score table come from `match.scores`, [p, o] per round; `readScores` also takes {p, o} because the bench fake still uses that shape. That change and the slipped-side fix were made last and got only a load check, not screenshots.

## Not done, in order
1. HUD against the REAL sim, not yet run. Import `createMatch`, `createBot` in the bench and play whole matches at speed. Convert the fake to the real shapes: scores `[[10,9]]`; result `{winner, loser, how, round, loserHp, pClean, oClean}`; `down {t,count,n,mash,need,up,rising,cause}`.
2. Small HUD fixes known from reading the sim:
   - `getup` fires 1.2 s before he is really up (`down.rising` runs, then `fight` with `resumed:true`). Make `getup` change the sub-line ("You are up" / "NAME is up") and show the small FIGHT banner on the state change back to fight, not on `getup`.
   - Add a get-up progress bar in the down banner from `down.up` 0..1, shown only when the player is down.
   - Use `m.p.thrown` instead of counting events; use `result.loserHp` in the stopped line. `power` is 0..1 so drop the /12 guess in `power01`.
   - At 360 wide with large text and both Tired tags on, the name truncates ("MA..."). Below 560px make `.ax-tired` absolute under the name.
3. Build `gfx/arena/audio.js`, plan below. 4. Build `gfx/arena/fx.js`, plan below. 5. Re-shoot every state at 1280x720 and 390x844. Measure frame cost when a banner appears. Test real pointer events on the touch controls and the `keys=1` path; test rematch, exit and reduced motion (`rm=1`), none of those clicked yet except the pause icon.

## Audio plan (`createAudio({enabled, volume, ctx}) -> {onEvent(ev, when), update(match, dt, when), destroy, unlock, setVolume, setEnabled, setPaused}`)
Written against BaseAudioContext so tests pass an OfflineAudioContext and a `when`. Defaults from `ST.fxvol/100` and `uiPrefs.sound`, both reachable as globals from a module (`typeof ST`), else localStorage `iti.settings.v1`, `impact-ui-preferences-v1`. Unlock: resume on pointerdown, touchend, keydown until running. Crowd gain 0 until the first update.
Graph: master -> DynamicsCompressor limiter -> out. Hits -> tanh WaveShaper (harmonics so phone speakers hear the thump) -> master, with a send to a synthesised 0.85 s basement IR convolver. Crowd bus -> high-pass 120, dynamic low-pass -> master and reverb send. Room tone: looped noise low-passed about 350 Hz, very quiet.
Punch layers by kind, tgt, power, counter: sine thump with pitch drop (about 120 to 50 Hz, 75-170 ms), low-passed noise body, band-passed noise smack (1-1.6 kHz, 12-30 ms), high-passed snap (4 kHz, 3-8 ms), hollow 160-210 Hz tone on body shots, sub drop on heavy or counter. Blocked: little low end, short bright glove pat. Random pitch and level per hit. Targets to measure: hook power 1 peak about -3 dBFS, jab about -9, block about -12, step about -30, whoosh about -24; centroid jab about 1.3 kHz, hook about .8 kHz, body about .45 kHz, block about 1.5 kHz.
`throw`: swept band-pass noise whoosh plus quiet high exhale. `whiff`: longer tail. `slipped`: fast whoosh, small crowd. `step`: scuff and low thud, sometimes a high-Q 1.5-2.6 kHz squeak. `rope`: creak and low thud. `knockdown`: heavy fall thump, whump, bounce at +90 ms, crowd roar. `count`: hand slap on canvas plus crowd pulse. `getup`: scuffle.
Bell: modal, inharmonic partials over about 1 kHz (1, 1.48, 2, 2.74, 3.76, 5.1), detuned pairs, strike noise. The sim emits `bell` at fight start, round end and finish, in the same frame just before `fight`, `round_end`, or just after `ko/tko/stopped`. Ring one strike on `bell`, then add strikes: `fight` (not `resumed`) +1, `round_end` +2, ko/tko/stopped +3 fast.
Crowd: pre-rendered at 22050 Hz with seeded RNG. Murmur loop about 8 s: about 16 talkers, each jittered glottal pulses plus noise through 2 formant resonators, vowel changes per syllable, syllable envelope 120-360 ms with gaps, random pan, 0.6 s loop crossfade. Roar loop about 6 s: higher f0, open vowels, longer syllables. Claps loop 4 s: Poisson short band-passed bursts. `excite` value bumped by events and decayed about 1.6 s in `update`, base level from state and low HP, params set about 12 Hz with setTargetAtTime.
Verify: render each event with OfflineAudioContext, measure peak, RMS, attack, decay to -20 and -40 dB, centroid, band shares, the 2-8 Hz modulation of the crowd; POST WAVs to the scratchpad through `/__save`, draw spectrograms with numpy and pillow and look at them. Add a sound board to the bench so a person can listen. State plainly that nobody on this side could listen.

## Effects plan (`createFx(scene, q, {stage}) -> {impact(pos, dir, power, blocked) -> hit-stop seconds, update(dt), onEvent(ev, match), dust(pos, amount), timeScale(), dispose}`)
`q` is an engine preset (`q.name` low, medium, high). `power` 0..1. One InstancedMesh quad pool as a GPU ring buffer: per-instance p0, v0, birth, life, size, drag, gravity, kind; the vertex shader computes the ballistic path from a time uniform, so spawning only writes typed arrays and no per-hit allocation. Kinds: sweat streak along velocity, soft dust puff, star flash aimed by `dir`, ring on heavy or blocked. Additive, depthWrite off, frustumCulled off, include tonemapping and colorspace chunks so low and film presets both work. Scale counts by preset. One pooled PointLight at intensity 0 on medium and high (never toggled visible, so no shader recompiles), none on low.
Hit-stop: 40 ms at power 0 to 90 ms at power 1; `impact` returns it and `timeScale()` gives 0 while it runs. Particles keep moving on real dt.
Ropes: `stage.ropeHit(side, metres, along)` exists. On sim event `rope` {who, power, dir}, side from dir ([1,0] px, [-1,0] nx, [0,1] pz, [0,-1] nz), along is z/half on px,nx and x/half on pz,nz, half is `stage.RING.ropeAt`. Dust on `step`, `knockdown`, `getup` at the fighter's x, `stage.canvasY`, z. `stage.kickLamp(power)` exists for index.js. Test on a small three.js scene in the bench, look at it, count allocations.
