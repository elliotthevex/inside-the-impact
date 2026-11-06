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
