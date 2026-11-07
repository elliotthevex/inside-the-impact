# Audit findings, as the two audit agents returned them

Copied from the journal of run wf_188f91df-717 so they survive the session. Code has moved since: check each one on the current code before fixing it. [V] means seen in emulation, [R] read from code.

## Phones and Safari

### 1.1 [blocker] game.js openArena3D (line 2711 on), window.__openRealArena (lines 11-15); gfx/arena/index.js S.onLost
Nearly every failure path on a phone ends in the old canvas arena, which has no touch controls. The player sees a 2D fight with 'WASD move, Shift guard' text and no message that the 3D game failed. Only Exit works. This is the path for iOS under 16.4, no WebGL2, a GL context lost in a fight, a load stall and a failed asset. Happens every time on those paths. How many real players reach it is unknown; a context lost after backgrounding is the likely common one on iPhone, read from known behaviour, not seen here.

Steps: Real page, touch emulation 390x844: drop the injected import map (p_noimportmap.js acts out old Safari), tap Play, tap the 1v1 Arena card. Or in a 3D fight call WEBGL_lose_context.loseContext().

Evidence: [V] o2_noimap: old arena at 313 ms, buttons a3-exit and a3-restart only, no touch or pointer handler in openArena3D, Exit works by real touch. o2_life2: after loseContext overlay false, arena3 true. Grep of openArena3D onward finds no touch handler.

### 1.2 [blocker] gfx/arena/index.js load(), stall setInterval and STALL_MS (line 307 in the stack trace)
Leaving the app for more than 30 s during the load throws the player into the old arena, which they cannot play. The stall check compares performance.now() with the last progress and does not know the page was suspended. A first visit takes 33 to 72 s at 1.6 Mbps, so switching apps during the load is likely. Happens every time in the emulation.

Steps: Real page, 844x390, network 1.6 Mbps. Open the 1v1 Arena card. At 12% on the bar call Page.setWebLifecycleState frozen, wait 32 s, set active. Script: run_stall.js.

Evidence: [V in Chrome] o2_stall: frozen at 12%, 15.6 s after the tap; 222 ms after coming back console says 'arena load stalled', old arena up, overlay gone. Network healthy throughout. [R] That iOS suspends a backgrounded tab while its clock keeps counting is known behaviour, not verified on a device.

### 1.3 [blocker] gfx/world/kit.js lines 28-38 (pending[], texCache) and line 282 (modelCache)
After one texture fails its three tries, the 3D arena can never open again until the page is reloaded, even when the network is back. Each try lands in the old arena with no hint to reload. kit.js keeps the rejected promise in pending[] for ever, so texturesReady() rejects on every later open. modelCache does the same for models (read from code, not run). Happens on every reopen. Needs one file to fail three times, so a flaky mobile network.

Steps: phone2.py --failfirst concrete_floor_worn_001_diff.webp@3 (only the first three requests fail), run_retry.js. Open the card, Exit the old arena, open again, Exit, open again, no reload.

Evidence: [V] o4_retry on a frozen copy of the last commit: open 1 old arena at 6.8 s, open 2 old arena at 3.0 s, open 3 at 2.0 s; exactly three ERR_CONNECTION_RESET in the log, so the later opens never asked for the file again.

### 1.4 [blocker] gfx/core/post.js Post._build (no checkFramebufferStatus); gfx/arena/index.js load (GL error only warned); gfx/core/engine.js PRESETS.medium mainFormat r11
On the medium preset, any device that refuses R11F_G11F_B10F as a render target, or refuses MSAA on it, gets a black picture with no error shown and no fallback, while the HUD and the match keep running. The low preset draws under the same limits. How likely on a real device is unknown: my earlier web check (web3dsurvey, WebKit bug 247240) says iOS 16.4 and later report EXT_color_buffer_float on most devices, so I expect this to be rare on iPhones. Every time on an affected device. Everything reaching medium on a phone is an Apple GPU or Adreno 7xx/8xx.

Steps: iPhone emulation 390x844 dpr 3, renderer string Apple GPU, auto quality, wrap GL: refuse R11F, or refuse MSAA on float, or withhold EXT_color_buffer_float so the real validator refuses. Open the arena through the real card.

Evidence: [V] Mean pixel 1.84, 1.32 and 2.08 of 255 in o2_float_r11, o2_iphone_msaa, o2_float_real, against 41.8 unrestricted. GL error 1286 on every frame (123 to 146 in 120 frames); console only '[arena] GL error after first frame'. Low under all limits with 4096 max texture size: mean 56, no GL error (o_float_low).

### 1.5 [visible] gfx/arena/index.js STALL_MS and makeProgress; assets as served
On a slow connection the load gives up while data is still arriving, and the player lands in the old arena with the bar on 4%. Progress only counts finished files, so one big file looks like a stall. On the real host this should need a much slower line: Cloudflare Pages should compress the JS (2.59 MB raw, 0.57 MB gzip), and my model puts the false give-up under about 250 kbps. That is a model, not a measurement. Every time at the measured speed.

Steps: Real page, low preset, local server (no compression, HTTP/1.1), network emulation 500 kbps with 300 ms latency, open the card.

Evidence: [V] o2_net05: gave up at 40.7 s on 4%, 1.29 MB received, console 'arena load stalled'. o_net04 at 400 kbps: same at 43 s. o2_net08 at 800 kbps: survived, flat for 25 s of the 30 allowed, fight at 109.8 s.

### 1.6 [visible] gfx/arena/hud.js onClick (pause icon and panel buttons use click)
Tapping the pause icon does nothing while other fingers are down. A player keeping a thumb on the stick has to let go first. The browser makes no click from a tap when another finger is on the screen, and the pause icon listens for click. The punch buttons are fine because they use pointerdown. Every time in Chrome emulation with two fingers held; one held finger not run; iOS not verified.

Steps: 844x390, real CDP touches. Hold the stick with finger 1 and Guard with finger 2, tap the pause icon with finger 3 and lift only finger 3 (touchEnd with that finger listed). Script: a3_touch.js.

Evidence: [V] o4_touch3 d_paused: paused false, and the following steps confirm the game never paused. A single-finger tap works: o2_life2 Resume by touch, and integrate.md.

### 1.7 [visible] gfx/core/engine.js detectQuality, Engine._watch, PRESETS
An iPhone never starts on low. Safari reports 'Apple GPU' for every iPhone, so an iPhone 8 gets the same medium as an iPhone 16: film pipeline, depth of field, MSAA 2. Android: Adreno 7xx and 8xx get medium, everything else low, Mali flagships included. If medium is too slow, the drop takes 9 to 10 s at 20 to 30 fps and then the fight freezes while shaders compile. Below 4 fps it never drops, because gaps over 250 ms are not counted. After the drop the context has no antialias, because it was made for medium. Only one way down, so it cannot oscillate. Every time for the preset choice.

Steps: Table through detectQuality with faked renderer strings. adapt_logic.js drives the real _watch with frame gaps. a2_adapt.js burns 30 ms per frame in the real loop on iPhone emulation.

Evidence: [V] Steady 30 fps first drop at 9.1 s, 20 fps 10.6 s, 10 fps 15 s, 4.1 fps 28 s, 3.9 fps and 2 fps never, 43 fps or better never. Real loop: medium to low at 10.1 s, longest frame 2294 ms on the M1 under load (33 new programs), 903 ms on a quieter run. antialias false after the drop. [R] Low Power Mode on iOS caps frames at 30, so those phones drop too.

### 1.8 [visible] gfx/people/fighter.js, gfx/world/kit.js texture loading; gfx/core/engine.js PRESETS.low.tex
Low saves almost no memory, so a phone that struggles for memory gets little help from it. A tab kill would show as a reload or a crash message with no JS error. I am not sure of the real limit: there is no official ceiling for an iPhone tab, and WebKit bug 290623 mentions WebGL sites at 500 to 800 MB running. My guess is fine on 4 GB phones and a risk on 2 to 3 GB iPhones (8, X). Not seen failing, because no phone ran.

Steps: Wrap texStorage, bufferData and renderbufferStorage on the real launch path, read the tally in a fight at 844x390 (low) and 390x844 dpr 3 (medium).

Evidence: [V] Low 282 to 292 MB, medium 331 MB (textures 313, buffers 7.8, renderbuffers 9.9), heap 50 to 60 MB. 38 textures at 1024 RGBA8 with mips, 5.46 MB each, 3 gloves at 1400, 10.2 MB each, nothing compressed. Decoded images on top: up to about 200 MB if the browser keeps them (estimate, not measured).

### 1.9 [visible] gfx/arena/audio.js now(), onEvent, unlock
On iOS the fight is silent until the first finger lift, then everything queued plays at once. Every sound scheduled while the context is suspended gets time 0, so the opening bell rings at the first tap, not when the fight starts. Peak stays controlled by the limiter, so it is a mash, not a blast. Every first fight on a real iPhone, if iOS behaves as acted out. [R] Separately, nothing handles iOS's 'interrupted' state: no statechange listener, and the unlock listeners are removed after the first success, so sound might stay dead after a phone call. Not verified. iOS's silent switch mutes WebAudio, which is also not handled.

Steps: p_audio.js wraps AudioContext so it starts suspended and resume only works in a gesture. Open the arena, wait 11 s, tap.

Evidence: [V with the wrapper] o_audio: 118 sources scheduled while suspended, 117 fire together; pointerdown resume is outside activation, touchend inside; peak 0.66 in the first second against 0.57 later.

### 1.10 [visible] gfx/arena/index.js S.onVisibility (!panelOn(S))
With the end panel up, switching to another app does not suspend the sound, so the crowd loop keeps playing behind the other app. Read as Android behaviour; iOS would likely stop it by itself. Every time.

Steps: Finish a match on touch emulation, end panel up, hide the page.

Evidence: [V] o_audio hiddenEndPanel: paused false, context state running.

### 1.11 [visible] gfx/arena/hud.js wireTouch rest(); arena.css .is-over .ax-touch display none
The stick ring is half off the screen in the next match if a finger was on the stick when the match ended, or if the phone is rotated while the end panel is up. rest() measures a hidden layer. The stick still works and the ring returns after the next use. Every time in those sequences. hud.js was edited again by another agent after this run, so check again.

Steps: 844x390 touch. Hold the stick until the match ends, lift while the end panel is coming, tap Rematch. Or rotate to 390x844 with the end panel up.

Evidence: [V] o_touch rematch: ring at [-45,119,69,232] where it belongs at [16,261,129,374], transform translate3d(12px,-12px,0). rotateOnEnd: [-43,339,67,448] in zone [0,405,179,844].

### 1.12 [visible] gfx/arena/hud.js ensureCss; gfx/arena/index.js load (await S.hud.ready)
If arena.css fails to arrive, the player sees the lobby while an invisible fight runs behind it with its sound. The stylesheet has no retry and no failure path. Exit is raw markup far below the fold. Reopening would do nothing because the session is still open (read from code: openArena returns the old handle). Only when that one file fails. A hung stylesheet does the same after the 2.5 s timer.

Steps: phone2.py --fail arena.css, iPhone emulation 844x390, open the card. Hung version: --hang arena.css.

Evidence: [V] o4_cssfail: root position static at y 390 to 1745, canvas 0x0, element at screen centre DIV.lb-stage outside the arena, match state intro and running, Exit at y 1579. o_hang_css: same path after the timer. Screenshot exists but I did not read it, to save usage.

### 1.13 [visible] gfx/arena/hud.js stick zone and arena.css .ax-stickzone (left:0, bottom:0)
The stick zone starts at the screen edge and its resting ring pokes out of the safe area, so a thumb can land in the home-bar strip or the left-edge strip. [R] On iOS Safari a swipe from the left edge goes back and the home-bar swipe can take the touch; nothing here prevents either, and leaving the page loses the fight. Not verified on a device. The buttons are always inside the safe area. Geometry is every time.

Steps: Layout matrix with safe-area insets through CDP: 390x844 with 47,0,34,0 and 844x390 with 0,47,21,47.

Evidence: [V] 390x844 notch: ring bottom 829 against safe 810. 844x390 notch: ring left 16 against safe 47, bottom 374 against 369. 390x664: bottom 649 against 630.

### 1.14 [minor] game.js window.__openRealArena (no timeout or feedback around import)
After tapping the card nothing shows until index.js, hud.js and arena.css have arrived, one after another: about 1.4 s at 1.6 Mbps. If index.js hangs, the player sees the lobby with no message, for ever. They can tap again. Every load for the delay; hung file only for the rest.

Steps: phone.py --hang gfx/arena/index.js and tap the card. For the delay, read the network log at 1.6 Mbps.

Evidence: [V] o_hang_index: no overlay and no fallback in 20 s of watching, and no timeout exists in the code. nl_16.json: index.js 0.44 s, hud.js 0.44 s, arena.css 0.39 s.

### 1.15 [minor] gfx/arena/index.js pause and clearInput; gfx/arena/hud.js btnDown, btnUp, wireTouch down
Touch state can disagree with the fingers in rare cases. After a pause or blur with a finger still on Guard, the button stays lit but guard is 0 until lifted and pressed again. Two fingers on one button: lifting one releases it. If a stick pointerup or pointercancel never arrives, the stick ignores new fingers and the man walks on by himself, and blur does not clear it. That last one was shown only with synthetic events; real touchCancel recovers correctly.

Steps: a2_touch.js: hold stick and Guard, JS click on pause, JS click on Resume. a3_touch.js for two fingers on Guard. Synthetic pointerdown 77 with no pointerup, then pointerdown 78.

Evidence: [V] o2_touch2 resumed: guard 0, btnLit true. o4_touch3 c_oneLift: lit false with a finger still on it. [V synthetic] lostB x stayed 1, lostC walked 0.99 m in 0.5 s, lostAfterBlur active true.

### 1.16 [minor] gfx/arena/arena.css .ax-pausebtn and .ax-panel at short heights
Small layout marks. The pause icon is 44x36 at every size. With a browser bar showing and large text, the end panel's first button starts below the fold at 740x304 and 640x280; the panel is set to scroll, but I did not drive a touch scroll at those sizes. At 844x340 with a notch, Rematch and Exit sit 2 px under the safe bottom. At 320x568 large, three buttons overlap the stick zone by 3 px.

Steps: layout.js and layout3.js with those sizes, Text Size large.

Evidence: [V] o_layout and o4_layout3: first end button bottom 319 of 304 and 319 of 280; Rematch bottom 321 against safe 319; Jab left 144 against zone right 147.

### 1.17 [minor] gfx/arena/hud.js loadFonts; site-wide CSS
On a first visit the load title is clipped on both sides at 360 px wide until the font arrives, about 3 s at 1.6 Mbps, because hud.ready asks for the fonts before the stylesheet is in and so does not wait. [R] No -webkit-text-size-adjust anywhere in the site, so iOS may inflate some text in landscape. Not verified.

Steps: First visit on a fresh profile, 360x640, slow network. Grep for text-size-adjust.

Evidence: [V] Title 402 to 407 px wide in the fallback font (o_layout, o_hang_font). Fonts finish 2.5 to 3 s after the tap in nl_16.json. Zero matches for text-size-adjust in arena.css and style.css.

### Passed
- Shaders against mobile limits [V, real link, counts from getActiveUniform]: low 44 programs, medium 52, high 54. Highest fragment samplers 8/8/8 of 16; vertex samplers 2 of 16; fragment uniform vectors 52/63/67 of 224; vertex uniform vectors 73 of 256; varyings 9 of 15; attributes 10 of 16.
- highp [V and R]: three declares highp for float, int and samplers; no mediump or lowp in the game's shaders; no RawShaderMaterial; WebGL2 guarantees highp in fragment shaders.
- Low preset with half float only, no float linear, no MSAA on float, R11F refused, 4096 max texture [V]: draws, no GL error. HDRI and PMREM use half float; shadow map fine. Baked light is per-vertex CPU data [R], so it needs no float target.
- First visit on low [V]: 124 requests, 9.71 MB uncompressed (webp 66 files 3.23 MB, js 25 files 2.59 MB, bin 12 files 1.88 MB, hdr 1.45 MB, glb 0.43 MB); medium the same. Local server, no compression, HTTP/1.1: 9 Mbps 17.1 s, 1.6 Mbps 72.1 s low and 72.9 s medium, 800 kbps 109.8 s. The real host should be faster: model 33 s of network at 1.6 Mbps.
- Load bar [V]: never goes back, tied to real events, reaches 100% only when ready. It counts files, not bytes, and sits flat on 4% for 20 s at 1.6 Mbps. Hung font: no block. Hung texture or three.core.js: stops at 30 s, then goes to the old arena (see findings).
- CPU throttle, low, 844x390, other agents running [V]. 4x: load 13.4 s, 31 fps, p50 27 ms, p95 66, worst 207, frame() JS 6 ms mean, 65 peak. 6x: load 27.4 s, 20 fps, p50 48 ms, p95 102, worst 311, frame() JS 6.4 mean, 100 peak. The sim is fixed-step, so a bot still plays a normal fight; most of the frame is three's render on the main thread.
- Lifecycle [V]: really hidden through a second tab in a fight: pauses, panel up, audio suspended, engine stopped, nothing advances; back: panel still up; Resume by one-finger touch runs again with audio on, no GL error. Frozen by the lifecycle API: same, dt never over 1/15.
- Address bar and rotation in a fight on medium [V, before the page split, code unchanged]: canvas and camera follow, longest frame 52 ms on the M1, buttons stay on screen.
- Multi-touch with real lifts [V]: stick plus Guard plus Jab at once, lift Jab only, lift Guard only, Cross with the stick held, stick lifted last. Second finger on the stick zone ignored. Stick dragged far outside the zone works and releases. touchCancel with everything held releases all and the stick can be grabbed again. Finger sliding off a button: stays pressed until lift, then releases, no stuck key.
- Gestures in Chrome emulation [V]: viewport-fit=cover, touch-action none on the overlay; double tap, pinch, long press and pull down give scale 1, no scroll, no selection. Long press on Guard and stick: contextmenu prevented. Long press on the bare fight picture: not prevented, because the handler is only on .ax-touch; no effect seen here.
- Requested sizes 360x640, 390x844, 844x390, 667x375, 820x1180, normal and large, notch insets on iPhone sizes [V at 11:38, before later HUD edits]: every touch button on screen, inside the safe area, at least 52 px, no clipped label, no overlap; pause and end panel buttons reachable; bars, plates, names, pips, banners fit.
- Real browser sizes with bars showing, large text [V, frozen last commit]: 844x340, 390x664, 667x331, 740x304, 640x280, 360x560, 320x568: buttons at least 52 px, HUD plates clear of buttons, no page element above the overlay (grid 14x10). Small marks are in the findings.
- Old Safari path [V acted out]: without the import map the page reaches the old arena at 313 ms with no overlay left and no page error. game.js itself uses only ?., dynamic import and replaceAll, so it parses on old Safari [R].
- Minimum versions for the whole arena [R, from code and version tables, no real browser]: Safari and iOS 16.4, Chrome 94, Firefox 108. Set by import maps (Safari 16.4, Chrome 89) and class static blocks in three.core.js (Safari 16.4, Chrome 94). Lower needs: WebGL2 Safari 15, Array.at 15.4, WebP 14. Not used by the arena: structuredClone, AudioWorklet, top-level await, dvh, backdrop-filter (style.css only). OffscreenCanvas only as a probe inside three. The crowd worker is a Blob worker with a main-thread fallback.

### Not tested
- No real phone and no WebKit ran. Everything said about iOS behaviour is read from code or known behaviour.
- Most important unknown: whether an import map added from script (game.js line 10) works in real Safari. I read it as fine on 16.4 and later. If wrong, every iPhone lands in the old arena. Try this first on a real iPhone.
- Real GPU frame time on any phone: only the CPU can be throttled here. Shader compile time on phones: Safari has no KHR_parallel_shader_compile, so linking runs on the main thread; not measured.
- Real memory kill on an iPhone. The limit in that finding is an estimate, and I am not sure of it.
- Sound was never heard. Phone call, iOS 'interrupted' state and the silent switch were not run; the iOS-like context was acted out with a wrapper.
- The real host (Cloudflare Pages): compression and HTTP/2 were not measured because curl from here returned nothing. The figures for it are a model.
- In-app browsers (KakaoTalk, Naver), Samsung Internet and Firefox on Android.
- Left-edge back swipe, home-bar swipe and the iOS long-press loupe: not testable in Chrome.
- Touch scroll of the end panel at 740x304 and 640x280.
- Slip with the stick held: the run read false 60 ms after the tap at load average over 100, so inconclusive. Slip by touch alone passed in integrate.md.
- Pause with one other finger held: only two held fingers were run.
- Dropped to stay under the usage line (61 at 22:04): first bell cost on the main thread (about 1.7 million sin calls at the first FIGHT, not measured); 2D canvas tally (from code under 30 MB against an iOS budget of about 384 MB, an estimate); a repeat of the 4x and 6x CPU runs in quiet conditions. The dropped-CSS screenshot was not read: DOM state was used instead.
- Timings are from a loaded machine: load average reached 143 at 21:45 and I did not record it during the CPU runs at 21:06 to 21:09.
- The menu, coach lines and notes panel are not hooked into index.js on the real page, so they were not audited here. gfx/dev/notes/features.md covers their sizes and also says real phones are unchecked.
- hud.js was being edited during this audit: a run at 21:29 hit 'ReferenceError: wCalm is not defined' at hud.js:517 and fell back. I treated that as a half-finished edit, not a bug, and ran the last tests (o4_*) on a frozen copy of the last commit. The layout matrix and stick-ring results should be rerun when the HUD work ends, with scripts in /private/tmp/claude-501/-Users-elliot-jeong-Downloads-Inside-the-Impact/a4d575ac-45f5-438b-a265-75fe753a2111/scratchpad/audit/phone. Notes are in /Users/elliot_jeong/Downloads/Inside-the-Impact/site/gfx/dev/notes/audit-phone.md.

## Player flows and input

### 2.1 [blocker] site/gfx/arena/hud.js:445, :517
The 1v1 card always opens the old canvas arena, because hud.js uses wCalm without declaring it. This may be someone's half-finished edit.

Steps: Open the real page on the code on disk and click the 1v1 Arena card.

Evidence: Console: '[arena] falling back to the canvas arena: ReferenceError: wCalm is not defined at reset'. grep at 22:05 finds only hud.js:445 and :517 and no declaration. hud.js was saved 21:28:38. Happened on every open tried after that time. Fix: declare it with the other lets near hud.js:211. Tests after 21:45 ran on a frozen copy with only that one line added.

### 2.2 [blocker] site/gfx/world/kit.js:38, site/gfx/arena/stage.js:147
One stage texture failing once locks the page to the old arena until the player reloads, even when the network is back.

Steps: Open the card with assets/tex/concrete_block_wall_diff.webp failing (blocked here), so it lands in the old arena. Exit it, unblock the file, and open the card again.

Evidence: Second open landed in the old arena again after 2.9 s. Page errors: 'rej [object Event]' and 'Uncaught (in promise) Event @kit.js:36'. From reading the code: kit.js:38 pushes every load promise into module-level `pending` and never clears it, stage.js:147 awaits Promise.all(pending), and texCache keeps the empty Texture. Ran once, on the wall texture. By the code it applies to any kit texture that fails its 3 tries. The HDRI, reach.json, clips.json, fighter.glb, glove webp, face.bin and modules recover on the second open. audit-phone notes the old arena has no touch controls, so a phone player could only Exit (not re-checked here).

### 2.3 [visible] site/gfx/arena/hud.js showPanel, site/gfx/arena/index.js onKeyDown
Pressing Space as the end panel appears presses Rematch. The result screen and its head-shot report vanish and a new match starts.

Steps: Reach the end of a match and keep tapping Space (slip) as the end panel arrives.

Evidence: s_focus, one run: 21 presses, panel seen at 3.75 s, new match in intro at 3.98 s. hud.js showPanel focuses Rematch. index.js onKeyDown returns on an open panel without preventDefault, so the browser clicks the focused button. By the code, any Space or Enter landing after the panel opens does this. A held Space with a repeat, then release, pressed Resume in the same way on the pause panel. That held case was not run on the end panel.

### 2.4 [visible] site/gfx/arena/index.js frame(), site/gfx/arena/ai.js decide and eye
At 30 fps the rival is easier: he goes down nearly twice as often and weak players win about twice as often. At 120 and 144 Hz a player who does not get faster himself gets the same game as at 60.

Steps: Same seeds and bots at 30, 60, 120 and 144 fps, normal level, 400 matches a cell, using a jsc copy of the index.js frame loop with sim e5640303 and ai fdacdb35. ai.js has changed twice since.

Evidence: Win % at 30/60/120/144 with the bot at frame rate: skilled 61/65/73.5/72.5, mixed 21/10/8.5/9.3, learner 31.5/22/20/19.3. Bot held at 60 Hz: mixed 21/10/12.5/10, learner 31.3/22.3/20.8/21.3, skilled at 60/120/144 64.5/63.3/66 (its 30 fps figure is not valid). So the skilled bot's rise at frame rate is the bot reading more often. Mixed at 30 vs 60: rival knockdowns .55 vs .32. Mixed at 30 vs 144 with keepBank on, in the isolation run: bot whiffs 15.7 vs 18.1. AI punches a minute barely move (35 vs 33.6, mixed 30 vs 60), and AI land rate is 78.7 vs 80.3 %. Cause proved: with both sides deciding every 2 sim ticks inside the tick loop, every number is identical at 30, 60 and 144 fps (mixed 12.3, learner 21, skilled 62.8). Dropping `S.bank = 0` alone does not fix it (mixed 24/12/10.5 at 30/60/144). Fix to test: call ai.decide every 2 ticks inside `while (S.bank >= STEP)`. The comparison of this copy against the real frame() did not run.

### 2.5 [visible] site/gfx/arena/index.js S.onVisibility
Crowd sound keeps playing behind another tab or app when the end panel is up.

Steps: Reach the end panel, then switch to another tab.

Evidence: Real tab switch: document.hidden true, context state running, rms .035 to .038 over 6 s, context time advancing, paused false. index.js onVisibility skips pause when panelOn(S), so audio.setPaused never runs. Seen in the one run on current code; the same result appears in the 11:51 run.

### 2.6 [visible] site/gfx/arena/hud.js ensureCss
If arena.css fails to load, the match runs unseen below the lobby: the player sees the lobby, hears the fight, and keys go to the arena. By the code this is a dead end until reload, so it may be a blocker; I did not prove that part.

Steps: Open the card with gfx/arena/arena.css failing.

Evidence: s2 fail, live page, one run: root position static at top 720 on a 720 px window, canvas height 0, page height 2511, ready true, state intro. ensureCss in hud.js resolves on error or after 2.5 s and nothing checks that the sheet arrived. From reading: the failed link stays in the head and is never fetched again. The second open took 2.4 s, close to that 2.5 s timeout, but whether it stays unstyled was not confirmed because s5 cssfail did not run. Rare, flaky network only.

### 2.7 [visible] site/gfx/arena/index.js S.onLost
A lost WebGL context in any state, including pause and the end panel, drops the player into the old arena with no message. A finished fight is replaced by a new old-arena fight.

Steps: Call WEBGL_lose_context.loseContext() in load, intro, fight, down, rising, break, end graphic, paused or end panel.

Evidence: All 11 states: overlay gone, old arena open, no errors, reopen works. By design in index.js S.onLost. audit-phone notes the old arena has no touch controls, so a phone that loses the context in the background lands where it cannot play (not re-checked here).

### 2.8 [minor] site/gfx/arena/index.js wireInput (no contextmenu handler)
Right click in a fight opens the browser menu while the fight keeps running.

Steps: Right click the canvas during a fight.

Evidence: contextmenu event: prevented false, target CANVAS. A key released while that menu is open might stick; that cannot be proved headless.

### 2.9 [minor] site/gfx/arena/index.js S.onKeyUp
A key up lost while Cmd is held keeps the man walking until that key is pressed again.

Steps: Hold W, press and release Cmd, and release W while Cmd is down, on a Mac.

Evidence: With the keyup withheld: input .5,-.87, speed 2.24, still walking. This simulates the macOS behaviour; it was not seen on real Mac keys. A window blur clears it. Fix idea: clear keys on Meta keyup.

### 2.10 [minor] site/gfx/arena/index.js pause()/clearInput
Shift held through a pause: guard is down after resume until Shift is pressed again.

Steps: Hold Shift, press Esc twice, and keep holding Shift.

Evidence: Guard true before the pause, false after resume. Modifier keys do not auto-repeat. Letter keys come back on their next repeat (D measured).

### 2.11 [minor] site/gfx/arena/index.js codeOf, site/gfx/arena/hud.js keysHtml
On non-QWERTY layouts the keys named on screen do not match: controls follow key position.

Steps: Use AZERTY or Dvorak and press the keys labelled W, A or J.

Evidence: The key labelled W on AZERTY (KeyZ), A on AZERTY (KeyQ) and J on Dvorak (KeyC) did nothing, while the HUD says W, A and J. Korean layouts are not affected.

### 2.12 [minor] site/game.js:2775, :3745
With a Korean IME on, the old arena and the lobby hotkeys read e.key, so they should not respond to keys. The real arena is fine.

Steps: Read only. The test of the lobby hotkey did not run.

Evidence: game.js:2775 (old arena) and game.js:3745 (lobby hotkeys) both use e.key.

### 2.13 [minor] site/gfx/arena/index.js (no history entry)
Browser back in the arena leaves the whole site with no guard, so an Android back press in a fight leaves the game.

Steps: Press back during a fight.

Evidence: Went to the previous page with no prompt. Forward gave a fresh lobby with the save unchanged. The test server sends no-store, so a bfcache return on normal hosting was not seen.

### 2.14 [minor] site/game.js __openRealArena
No feedback between the card click and the overlay: Mode Select closes while the lobby and its hotkeys stay live until index.js and hud.js arrive.

Steps: Click the card with index.js delayed.

Evidence: Overlay 0, modesel 0, hotkeysBlocked false, cursor unchanged. A second click landed on .lb-stage and did nothing, and opening Settings in the gap was harmless. Under heavy load a second click arrived about .9 s after the first; the cause was not traced.

### 2.15 [minor] site/game.js:3712
An AudioContext warning from game.js appears in every run, so the page appears to create a context before any gesture. This is not the arena's context.

Steps: Load the page and read the console.

Evidence: 'The AudioContext was not allowed to start' with source game.js. Probably game.js:3712 (read, not traced). The arena's createAudio runs only after the card click. The sound scenario that would confirm this did not finish.

### Passed
- Korean keyboard, Mac (Hangul key) and Windows IME (Process, 229): WASD, J, K, L, U, I, O, Shift and Space all work; the handler reads e.code.
- Caps Lock J jabs. Shift held then J: guard stays up and a jab comes out.
- W+S and A+D cancel. All keys together cause no error and clear on release. K held with auto-repeat gives 1 punch; Space held gives 1 slip.
- Blur with W and Shift held stops walking and guard. A key released during pause is not held after resume.
- Pause icon, Resume or Restart clicked, then Space: slips and does not press the button. Enter and Tab in a fight do nothing. Tab and Shift+Tab cycle inside the pause panel.
- Scroll keys and wheel in a fight at 1280x720: page does not move. Click on empty space in pause, then keys: nothing moves.
- Exit at load (+0, +30, +120, +300, +800 ms), intro, fight, down, count, get-up, him down, break, end graphic, decision graphic, end panel (button and Esc), slow motion: every reopen is clean and a real J throws.
- Pause in intro, fight, punch startup, on the hit tick, down with slow motion, counting, rising, break, round 2 intro, TKO graphic, and on the exact tick of round_end, knockdown, count, back-up and final round_end: clock, count, timers and frames hold; resume continues; audio context suspends and resumes.
- Double click on Rematch gives one new match. 30 rematches at 40 ms leave one loop (61 frames per 61 rAF). Restart from pause with either man down: pelvis .10 to .83 at once, HP 100, HUD clean.
- Double click on the card, and card, lobby or Settings clicks in the gap before the overlay: one overlay, page fine after exit.
- Failed load of index.js, hud.js, sim.js, three.module.js, reach.json, clips.json, fighter.glb, glove webp, face.bin or the HDRI: falls to the old arena, and the second open with the network back loads the real arena. After fighter.glb the real J press registered no throw at .3 s under heavy load; not chased.
- Reload in a fight gives the lobby, save unchanged, and it plays on. Back then forward gives a fresh lobby, save unchanged.
- After a whole arena session: localStorage, G and ST unchanged, sessionStorage empty, parity 3bea3b59, settings hotkey O opens, lobby canvases drawing, cursor auto, one arena.css.
- Tab hidden 30 s mid fight: paused at once, clock held, context suspended, panel there on return, Resume runs, W held before the switch is not walking.
- Load finishing in a hidden tab: holds at intro, nearly silent, plays on when shown.
- Context loss in 11 states: no error and reopen works (the old-arena landing is listed as a finding).

### Not tested
- Stopped at usage 63, close to the 67 line, with load average over 100. The scenarios that had started hit boot timeouts under that load. Notes and restart steps: /Users/elliot_jeong/Downloads/Inside-the-Impact/site/gfx/dev/notes/audit-flows.md. Results: /private/tmp/claude-501/-Users-elliot-jeong-Downloads-Inside-the-Impact/a4d575ac-45f5-438b-a265-75fe753a2111/scratchpad/audit/flows/out2/.
- Sound: context state after pause and exit on the current code beyond the tab-hidden run, Effects volume across rematch, leftover contexts and workers after ten reopens, and the no-gesture backlog burst. s3 sound died on a boot timeout; this is a harness limit under load, not a finding.
- Stress: ten opens and ten rematches (heap, geometries, textures, programs, listeners, GL contexts). s3 stress died on a boot timeout.
- Resize and orientation change in every state, 320x480 to 3840x2160, dpr 1 to 3, because s3 resize and orient did not run. The stick ring after a rotate on the end panel also did not run.
- 3 s stall, tight version: s6 did not finish. The non-tight run showed no round skipped with 2.5 s on the clock, and engine.js caps dt at 1/15, but that run's first reading is contaminated by slow DevTools round trips.
- The real frame() compared against the jsc copy (s4 fpsreal), so the frame-rate tables come from a copy of the loop checked by reading only. Real frame rates on a real display were also not measured.
- arena.css second open and slow CSS (s5 cssfail), false load stall on a slow network (s5 slownet), click-to-load-screen time (clickgap), lobby loop cost under the arena (lobbycost).
- Scroll keys and wheel at a small window where the lobby could scroll, and the lobby hotkey with a Korean key (s6 smallscroll).
- After a failed stage texture, the lamp model and font cases did not run: I stopped tex3 to save time. Only the wall texture and the HDRI were run.
- bfcache return on normal hosting, because the test server sends no-store. Real phones, real Mac keys, and anyone listening to the sound.
