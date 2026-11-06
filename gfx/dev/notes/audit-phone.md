# Audit: will Street Fight 3D run on phones and in Safari? (report only)

Status: IN PROGRESS. Started 2026-11-06 about 11:05 local. Scripts: scratchpad audit/phone (phone.py driver, emu.js GL wrapper, run.js, show.py, scan.py). No project file edited except this one.
No real phone and no WebKit here: every claim is marked [V] verified in Chrome emulation, or [R] read from code.

## Where I stopped (restart from here)
- 11:30 Done: read code; shader counts at low, medium, high; first memory tally; feature scan of code. Not done yet: phone float emulation, preset table run, adaptive timing, network, CPU throttle, touch and layout, audio, lifecycle. Battery 25% and discharging at 11:28.

## Numbers so far
- Shader use, real page, real launch path [V, real GL link on M1, counts from getActiveUniform and the preprocessed source]: low 44 programs, medium 52, high 54. Highest per program, low/medium/high: fragment samplers 8/8/8 (floor: uNoise, uContact, map, envMap, dfgLUT, spotShadowMap, normalMap, roughnessMap), vertex samplers 2/2/2 (bones, morphs), fragment uniform vectors unpacked 52/63/67, vertex uniform vectors 73/73/73, varyings 9/9/9, attributes 10/10/10. WebGL2 guaranteed minimums are 16 samplers, 16 vertex samplers, 224 fragment vectors, 256 vertex vectors, 15 varyings, 16 attributes, so every program fits on any WebGL2 device. No shader uses mediump or lowp outside three's precision lines.
- GPU memory tally on 844x390 at dpr 1 [V, by wrapping texStorage, bufferData, renderbufferStorage]: low 285 MB textures + 7 MB buffers = 292 MB; medium 312 MB; high 489 MB. All textures uncompressed RGBA8 with mips.

## Browser features [R]
- three.core.js has `static {` blocks (6), which need Safari 16.4 / Chrome 94. Import maps need Safari 16.4 / Chrome 89. So the real minimum for the 3D arena: Safari and iOS 16.4, Chrome 94.
- Old arena (a3) has keyboard controls only: no touch handler anywhere in it, so every fallback on a phone lands in a fight that cannot be played; only its Exit button works. To check on the page.

## Layout matrix [V, real page CSS, real sim, real env() through CDP safe-area override, no GPU, 16 combos: 360x640, 390x844, 844x390, 667x375, 820x1180, normal and large, notch insets on the iPhone sizes]
Every touch button on screen, inside the safe area, at least 52 px, no clipped label, no overlap with each other or the stick zone. Pause and end panel buttons on screen and inside the safe area. Names, pips, tired tag fit. Banners fit (word width). Only marks:
- pause icon 44x36 at every size (height under 44).
- stick resting ring pokes out of the safe area: 390x844 notch: bottom 829 vs safe 810; 844x390 notch: left 16 vs safe 47, bottom 374 vs 369. Zone starts at the screen edge too.
- first run only: load title 402 px wide on a 360 px screen, clipped both sides: see fonts race (hud.ready calls document.fonts.load before the stylesheet has loaded, so it does not wait). To prove under slow network.
- bars and plates touch the clock plate's bounding box by 5 px: by design (slant). Not a bug.

## Black screen when the main target cannot render [V]
Auto on Apple GPU with R11F refused and EXT_color_buffer_float withheld: no error shown, no fallback, state goes to fight, HUD runs, canvas black (mean pixel 1.28/255), GL error 1286 137 times in 120 frames; console only warns `[arena] GL error after first frame: 1286`. Post._build never checks framebuffer status. (First run was at high because no touch flag; medium run queued: o_iphone_all.txt.)

## Preset choice [V table through detectQuality, renderer string faked]
Every Apple GPU with touch: medium, never low. Safari reports "Apple GPU" for all iPhones and iPads, so an iPhone 8 gets the same as an iPhone 16. Android: Adreno 7xx, 8xx medium; every other name, Mali flagships included, low.

## Where I stopped, 11:48
Single ordered batch scratchpad audit/phone/all.sh started, results in o_<name>.txt, read with show.py, progress in batch.log. After reading results, write them here.
Web sources so far: web3dsurvey and WebKit bug 247240 say iOS 16.4 and later report EXT_color_buffer_float on most devices, so the R11F black screen is unlikely on an iPhone that passes the 16.4 gate; 32-bit float blend is the missing one. No official tab memory ceiling exists; WebKit bug 290623 mentions WebGL sites at 500 to 800 MB running; the kill leaves no JS error (bug 300782).

## Results at 11:57 (usage 40 at 11:55, stop line 47)
- [V] iPhone emulation (UA, touch, 390x844 dpr 3, Apple GPU), all float restrictions: auto gives medium, 585x1266, canvas black (mean 1.36/255), GL 1286 every frame, state fight, HUD runs, no fallback, one console warning. Same run without restrictions draws (mean 41.8). No framebuffer check in post.js or index.js.
- [V] Low preset under the same restrictions draws (mean 56 in fight), no GL error, HDRI and PMREM half float fine, console warns only about EXT_color_buffer_float.
- [V] Memory iPhone emulation medium: textures 313 MB, buffers 7.8, renderbuffers 9.9, total 331 MB, heap 58 MB. Low: 282 to 292 MB. 38 textures at 1024 RGBA8 with mips (5.46 MB each), 3 gloves at 1400 (10.2 MB each), nothing compressed. Low saves almost nothing against medium. Decoded images on top: about 200 MB if the browser keeps them (estimate, not measured).
- [V] Real touch through CDP on the real arena, Lobby Play button, duel card, stick plus Guard plus a punch at once: all work. touchCancel with everything held releases all and the stick can be grabbed again. Sliding off a button does not release it (capture holds it until lift, then it releases). Double tap, pinch, long press, pull down: scale 1, no scroll, no selection. Lifting one of several fingers could not be acted out (CDP touchMove with fewer points does not lift): not verified; the hold-through-pause step depended on it: not verified.
- [V] BUG stick ring: finger on the stick when the match ends, lifted while the touch layer is display:none: rest() runs on hidden layer, transform translate3d(12px,-12px,0). After rematch the ring is at [-45,119,69,232] where it belongs at [16,261,129,374], half off screen. Stick still works and returns on next use. Same from a rotation while the end panel is up: [-43,339,67,448] in zone [0,405,179,844].
- [V] Audio with an iOS-like context: suspended until gesture; pointerdown resume call is outside activation, touchend inside it, context runs. While suspended every event schedules at currentTime 0: 118 sources in 11 s of idle match, 117 of them fire together at the first finger lift, peak .66 against .57 normal after the limiter, so a mash, not a blast. Opening bell is one of them, so it rings at the first tap, not at the start of the fight.
- [V] Hidden in a fight: pause, panel, suspended; Resume by touch runs resume inside a click; runs again. Hidden with the end panel up: no pause, context stays running: crowd loop keeps playing behind another app.
- [R] No statechange listener, nothing handles iOS 'interrupted' (phone call); unlock listeners are removed after first success.

## Restart at 20:42, new 5-hour window, stop line 67
Page was split at 18:54 (import map now added by game.js at the end of body, style.css and game.js separate). engine, post, stage, kit, audio not changed since my runs at 11:42 to 13:21; hud.js last changed 11:30, arena.css 11:21. Results above still stand for those. Re-running what the split could change, plus what never finished: scratchpad audit/phone/all2.sh, results o2_*.txt, progress batch2.log.
Earlier results not yet written up, from the batch that ended 13:21: at 400 kbps the load gives up at 43 s, 4% on the bar, data still flowing, and falls to the old arena (o_net04). A hung texture or three.core.js falls back at 30 s (o_hang_tex, o_hang_three). A hung font does not block (o_hang_font). A hung arena.css: HUD shown unstyled after 2.5 s and the fight still starts (o_hang_css). A hung gfx/arena/index.js: nothing on screen and no message, for ever (o_hang_index).

## Results from the 20:42 restart (usage 28 at 21:16, stop line 67, every tool call is costly because my context is large: keep calls few)
- [V] Medium with R11F refused, or MSAA on float refused, or EXT_color_buffer_float withheld (real validator): each one black (mean 1.3 to 2.1 of 255), GL 1286 every frame, no fallback, one console warning (o2_float_r11, o2_iphone_msaa, o2_float_real).
- [V] Old Safari path acted out on the split page (import map dropped): old arena at 313 ms, draws, no touch handler, Exit works by touch (o2_noimap).
- [V] Lifecycle (o2_life2): really hidden by a second tab: pause, panel, context suspended, engine stopped; back: nothing ran, panel still up; Resume by touch: runs, audio running. Frozen by Page.setWebLifecycleState: same, dt never above 1/15. loseContext in a fight: overlay gone, old arena, no touch controls.
- [V] CDP touchEnd WITH a list lifts just those fingers (o2_touch2), so real multi-finger lifts can be tested: a3_touch.js in batch 3.
- [V] Holding Guard through pause and Resume: guard 0 while the button stays lit, until lifted and pressed again (o2_touch2, JS click on pause). clearInput on pause drops the key, nothing re-adds it.
- [V by synthetic events] Stick when pointerup never comes: id stays set, a new finger is ignored, stick.active stays true, the man keeps walking (0.99 m in 0.5 s). blur does not reset it. Not seen with real touches.
- [V] Real adaptive logic, driven by frame gaps (adapt_logic.js): steady 30 fps: 9.1 s to the first drop; 20 fps 10.6 s; 10 fps 15 s; 4.1 fps 28 s; under 4 fps never, because gaps over 250 ms are not counted. 43 fps or better never. One way only, no way up, so it cannot oscillate. Real loop on iPhone emulation with frames at 44 ms: medium to low at 10.1 s, longest frame 2294 ms on the M1 (33 new programs compile), drawing buffer 585x1266 to 390x844, antialias stays off because the context was made for medium.
- [V] CPU throttle, low preset, 844x390, frame limit off, other agents running (o2_cpu4, o2_cpu6). 4x: load 13.4 s, 31 fps, p50 27 ms, p95 66, p99 98, worst 207, frame() JS 6 ms mean, 65 peak. 6x: load 27.4 s, 20 fps, p50 48 ms, p95 102, p99 148, worst 311, frame() JS 6.4 mean, 100 peak. Rest of the frame is three's render on the main thread. No GPU throttle exists, so this is CPU only.
- [R] kit.js keeps rejected promises for ever: pending[] and modelCache. One texture failing three tries makes texturesReady reject on every later open until reload. Test in batch 3 (run_retry.js).
- [R] No -webkit-text-size-adjust anywhere in the site. iOS can inflate text in landscape.
- Batch 3: all3.sh, results o3_*.txt, batch3.log.

## 21:45, usage 44 (other agents burn it fast), stop line 67
- [V] First visit on low: 124 requests, 9.71 MB uncompressed (webp 66 files 3.23 MB, js 25 files 2.59, bin 12 files 1.88, hdr 1.45, glb 0.43, woff2 0.07, css 0.04). Medium the same. Local server: no compression, HTTP/1.1. Tap to fight: 9 Mbps 60 ms 17.1 s; 1.6 Mbps 150 ms 72.1 s; 800 kbps 300 ms 109.8 s; 500 kbps 300 ms gives up at 40.7 s on 4% (data flowing) and lands in the old arena. Real host is Cloudflare Pages, which should compress js (2.59 MB to 0.57 MB gzip) and use HTTP/2; model: 1.6 Mbps about 33 s of network; false give-up only under about 250 kbps. Not measured there.
- [V] Frozen for 32 s at 12% on the bar (acts out leaving the app during the load), network healthy: 222 ms after coming back: "arena load stalled", old arena (o2_stall). No document.hidden guard on the stall check.
- hud.js was being edited at 21:29: a run hit "ReferenceError: wCalm is not defined" (hud.js:517) and fell back. Half-finished edit by another agent, not reported as a bug. Final runs (all4.sh, results o4_*.txt, batch4.log) use a frozen copy of the last commit, served on port 8795 from scratchpad audit/phone/head.

## Final results, 22:05, usage 61, returned before the stop line of 67
Status: DONE as far as the machine and the usage allow. [V] verified in Chrome emulation, [R] read from code or known browser behaviour. No real phone and no WebKit ran anywhere. Last runs (o4_*) used a frozen copy of the last commit because hud.js was being edited.

Plain answer: on a current iPhone or Android phone it should run, on a good network, if the import map added from script works in real Safari (not verified, try this first on a real iPhone). What is wrong is what happens when anything goes wrong: nearly every failure path ends in the old canvas arena, which a phone cannot play.

More results:
- [V] Real multi-finger with real lifts (o4_touch3): stick plus Guard plus Jab, lift Jab only, lift Guard only, Cross with the stick held, stick lifted last: all right. Second finger on the stick zone ignored. Drag far out of the zone fine. BUG: a third finger tapping the pause icon while two others are down: no pause, no click (d_paused false). Two fingers on one button: lifting one releases it. a_slip read false 60 ms after the tap at load over 100: inconclusive.
- [V] Retry after a failure (o4_retry): a texture reset three times on the first open only. Open 1 old arena at 6.8 s; network now healthy; open 2 old arena at 3.0 s; open 3 at 2.0 s; no new request for that file. Lasts until reload.
- [V] arena.css dropped (o4_cssfail): root position static at y 390 to 1745, canvas 0x0, centre of the screen is the lobby, match runs unseen, Exit is raw markup at y 1579. No failure path. Screenshot not read, to save usage: scratchpad audit/phone/o3/cssfail_640.png.
- [V] Real browser sizes with bars showing, large text, frozen last commit (o4_layout3): 844x340 notch, 390x664 notch, 667x331, 740x304, 640x280, 360x560, 320x568. Buttons at least 52 px, on screen, inside the safe area; plates clear of buttons; no page element above the overlay (grid 14x10). Marks: end panel first button below the fold at 740x304 (319 of 304) and 640x280 (319 of 280), panel scrolls by CSS, touch scroll not driven; 844x340 notch: Rematch and Exit 2 px under the safe bottom; 320x568: three buttons overlap the stick zone by 3 px; stick ring out of the safe area as before.
- [V] Time from tap to load screen at 1.6 Mbps: index.js 0.44 s, hud.js 0.44 s, arena.css 0.39 s, one after the other, about 1.4 s of nothing. Fonts finish about 3 s after the tap. Bar flat at 4% for 20 s at 1.6 Mbps and 25 s at 800 kbps (three.core.js 1.47 MB raw), counts files and not bytes, never goes back.
- Minimums for the whole arena [R]: Safari and iOS 16.4 (import maps and class static blocks in three.core.js), Chrome 94 (static blocks; import maps 89), Firefox 108. Others are lower: WebGL2 Safari 15, Array.at 15.4, ??= 14, aspect-ratio 15, overscroll-behavior 16, WebP 14, translate property 14.1. Not used by the arena: structuredClone, AudioWorklet, top-level await, dvh, backdrop-filter (only style.css), createImageBitmap directly. OffscreenCanvas only as a probe inside three. Worker from a Blob, falls back to the main thread.
Dropped to stay under the usage line: first bell cost on the main thread (about 1.7 million sin calls at the first FIGHT, not measured), 2D canvas tally (from code under 30 MB against the iOS budget of about 384 MB, estimate), re-run of cpu at 4x and 6x under quiet conditions. Load average reached 143 at 21:45.
Scripts: scratchpad audit/phone (phone.py, phone2.py, run.js, emu.js, a*_*.js, c*_*.js, layout*.js, adapt_logic.js, run_stall.js, run_retry.js, all2.sh, all4.sh, netsum.py, show2.py).
