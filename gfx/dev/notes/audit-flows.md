# Audit: edge cases in the game's flows (report only, no game files changed)

Status: in progress. Scripts: scratchpad audit/flows/ (fl.py is the driver: one headless Chrome, trusted key and mouse events over the DevTools protocol).
Restart point: see the log at the bottom.

## Log
- start: read DESIGN.md, integrate.md, index.js, hud.js, engine.js, sim.js, ai.js, audio.js. Mac on battery at 35%.
- 20:45 restart after the usage stop at 11:58. Earlier scripts in scratchpad audit/flows kept (fl.py driver, s_*.py); their results were never written here and the code has changed since (sim.js 20:11, ai.js 20:38, game.js split out of index.html 20:10), so everything is being re-run. New output goes to audit/flows/out2/.
- 20:55 first re-run on current code (index.js 5e795429, hud.js 31674128, sim.js e5640303, ai.js fdacdb35, engine.js 81c53425, audio.js 2b611569, game.js 98b33759). out2/s_input, s_focus, s_exit, s_pause done. Passed so far listed below. Found: Space into the end panel = instant Rematch. Running next: s2.py dbl back fail, s_batch.py ctxloss stall vis, fps3 (frame rate, jsc), then s3.py resize orient sound stress.

## Passed (one line each, code as of 20:55)
- Korean keyboard, Mac (key is a Hangul letter) and Windows IME (key Process, keyCode 229): all of W A S D, J K L U I O, Shift, Space work (s_input). Handler reads e.code.
- Caps Lock J jabs. Shift held then J: guard stays up and a jab comes out (s_focus).
- W+S and A+D cancel. All keys together: no error, slip wins over punches pressed in the same frame, everything clears on release. K held with auto-repeat: 1 punch. Space held: 1 slip.
- Blur with W and Shift held: walking and guard stop. Key released during pause: not held after resume. Pause icon, Resume, Restart clicked then Space: slips, does not press the button. Enter in the fight: nothing. Tab in the fight stays on body. Pause panel Tab and Shift+Tab cycle inside the panel. Click on empty space in pause then Space, arrows, PageDown, End: nothing moves.
- Scroll keys and wheel in the fight at 1280x720: page does not move.
- Exit at load +0, +30, +120, +300, +800 ms, intro, fight, down, count, get-up, him down, break, end graphic, decision graphic, end panel by button and by Esc, slow motion: reopen each time: state intro round 1, HP 100/100, head 0, kd 0, no panel, no pips, real J press throws, audio running. Page after: same classes, no overlay, cursor auto, 1 arena.css.
- After a whole session: localStorage same, G hash same, ST hash same, sessionStorage empty, parity 3bea3b59, settings hotkey O opens, lobby canvases drawing.
- Pause in intro, fight, punch startup, on the hit tick, down with slow motion on, counting, rising, break, round 2 intro, TKO graphic, on the exact tick of round_end, knockdown, count, back-up, final round_end: time, clock, frames, count, slow-motion timer, banner all hold for .9 s, context suspended; resume continues from there (count 5.16 where 5.1 expected), context running, panel gone.
- Rematch double click: one new match. 30 rematches at 40 ms: one loop (61 frames per 61 rAF), clean state. Restart from pause with either man down: pelvis .10 to .83 at once, HP 100, HUD clean.

## Findings so far (full write-up at the end when done)
- [visible] Space (or a held Space, or Enter) at the moment the end panel appears presses Rematch: panel gone within .23 s, end report never read. s_focus: "mash Space into the end panel: presses 21, panel seen at 3.75 s, elapsed 3.98, same false, st intro". Cause: hud.js showPanel focuses the first button (Rematch), and index.js onKeyDown returns early for an open panel without preventDefault, so the browser clicks the focused button.
- 21:15 suspected, tex2 scenario running: kit.js loadTex keeps a rejected promise in `pending` and the failed Texture in texCache, stage.js:147 awaits texturesReady(): one failed stage texture may send every later open to the old arena until reload.
- Back in a fight leaves the site with no guard, forward gives a fresh lobby, save unchanged. No bfcache with sink.py's no-store; on normal hosting not tested yet.
- Second open after a failed module, reach.json, clips.json, fighter.glb: works (Chrome retries a failed dynamic import). Machine load 70 to 150 at this time.

## Results 21:35 (usage 40 at 21:33, rising about .8 a minute from all agents; stop line 67)
Passed, more:
- Hidden tab mid fight, real tab switch, 30 s: paused at once, clock and time held, context suspended, panel still there on return, Resume runs, sound running, W held before the switch not walking (s_batch vis).
- Load finishing while hidden: state holds at intro, nearly silent (rms .0015), plays on when shown.
- Context loss in load (3 points), intro, fight, down, rising, break, end graphic, paused, end panel: no error, overlay gone, old arena opens; reopen works. (That landing in the old arena is itself a finding for phones, see below.)
- Failed asset or module on first open (index.js, hud.js, sim.js, three.module.js, reach.json, clips.json, fighter.glb, glove webp, face.bin): falls to the old arena in 0.1 to 6 s; second open with the network back loads the real arena. Chrome retries a failed dynamic import.
- Double click on the card, click on the lobby and clicking the card again in the gap before the overlay, Settings opened in the gap: one overlay, arena on top (z 90 over 64), page fine after exit.
- Reload in a fight: lobby, save same, plays on. Back in a fight: leaves the site, no prompt; forward gives a fresh lobby, save same.
Frame rate, jsc copy of the frame loop, sim e5640303 and ai fdacdb35, 400 matches a cell, normal level, win % at 30/60/120/144 fps:
- bot at frame rate: skilled 61/65/73.5/72.5, mixed 21/10/8.5/9.3, learner 31.5/22/20/19.3.
- bot at a fixed 60 Hz, AI at frame rate: mixed 21/10/12.5/10, learner 31.3/22.3/20.8/21.3, skilled -/64.5/63.3/66 (30 fps not valid for skilled: two decisions a frame with no sim between).
- So: above 60 fps nothing real changes for a player who does not get faster himself; at 30 fps the rival goes down far more (mixed kdO .55 vs .32) and weak players win about twice as often, with the same punch counts (AI 35 vs 33.6 a minute, land 78.7 vs 80.3 %). Cause being isolated: out2/fr_iso.txt.
Findings:
- Crowd keeps playing behind another tab with the end panel up (vis: state running, rms .035 to .038 for 6 s hidden, context time advancing). index.js onVisibility skips pause when a panel is on, so audio.setPaused is never called.
- arena.css failing: see cssfail, s5.py (first read: root static at top 720, canvas height 0, game runs unseen under the lobby).
Pending at 21:35: s2 tex2 (one stage texture failed), s4 clickgap lobbycost, s3 sound stress resize orient, s4 fpsreal, s5 cssfail slownet, fr_iso, tight stall re-run.

## URGENT, 21:45: hud.js on disk kills the real arena right now (maybe someone's half-finished edit)
hud.js saved 21:28:38 uses `wCalm` (lines 445, 517) with no declaration. reset() throws `ReferenceError: wCalm is not defined` inside createHud's first update, so every open of the 1v1 card falls back to the old canvas arena. Console: "[arena] falling back to the canvas arena: ReferenceError: wCalm is not defined at reset". Fix: declare it next to the other `let` lines. From here on this audit runs on a frozen copy in scratchpad audit/flows/snap_site with only that one line added.

## 21:52 (usage 50 at 21:47; each of my calls is expensive, polling less)
- [blocker on a flaky network] One stage texture failing once locks the page to the old arena until a reload. s2 tex3 on the frozen copy: block tex/concrete_block_wall_diff.webp: first open old arena; unblock: second open old arena again in 2.9 s. Page errors: "rej [object Event]", "Uncaught (in promise) Event @kit.js:36". Cause: kit.js:38 keeps the rejected promise in module-level `pending` for ever and stage.js:147 awaits Promise.all(pending); texCache also keeps the empty Texture. On a phone the old arena has no touch controls (audit-phone), so that player can only Exit until he reloads.

## 22:05 frame rate cause, proved (out2/fr_iso.txt, fps3.js, jsc copy of the frame loop, 400 matches a cell)
Both sides deciding every 2 sim ticks (1/60 s of sim time) inside the tick loop instead of once per rendered frame: every number identical at 30, 60, 144 fps (mixed win 12.3/12.3/12.3, learner 21/21/21, skilled 62.8/62.8/62.8, same land rates, knockdowns, damage). So the sim is frame-rate independent and all the difference comes from index.js frame(): playerInput and S.ai.decide run once per frame and hold for all that frame's ticks.
AI on the tick, bot per frame: mixed 14.8/10/11, learner 27/20.8/25.5. keepBank alone (contact does not drop the rest of the frame): mixed 24/12/10.5, so `S.bank = 0` is not the cause, it only makes rounds run a little longer in real time (1.086 vs 1.067 real s per sim s at 30 vs 144 fps).
At 30 fps with the shipped loop he sees and acts about a frame later: player whiffs 15.7 vs 18.1, player's heavy hits land 11.9 vs 10.4, rival goes down .55 to .62 vs .29. Fix to test: call ai.decide inside the `while (S.bank >= STEP)` loop every 2 ticks.

## REPORT at the usage stop, 22:06 (usage 61 and rising about .65 a minute, stop line 67)
Code: tests up to 21:28 ran on the live page (index.js 5e795429, hud.js 31674128, sim.js e5640303, ai.js fdacdb35). After that a frozen copy (scratchpad audit/flows/snap_root, served on 8795, hud.js with `let wCalm = false;` added, ai.js 9e036a5d, fx.js df02173b, fightcam.js dded58bb). Machine load 30 to 150 throughout, so timings here say nothing about speed.

### Blockers
B1. hud.js on disk has `wCalm` undeclared (still so at 22:05; saved 21:28:38; may be someone's half-finished edit). Player sees: 1v1 card always opens the old canvas arena. Steps: click the card. Evidence: console "[arena] falling back to the canvas arena: ReferenceError: wCalm is not defined at reset", hud.js:445 and :517, no `let wCalm` anywhere. Every time. Fix: declare it with the other lets near hud.js:211.
B2. One stage texture failing once locks the page to the old arena until reload. Steps: first open with tex/concrete_block_wall_diff.webp failing (blocked here), Exit, network back, open again. Evidence: second open old arena in 2.9 s; page errors "rej [object Event]", "Uncaught (in promise) Event @kit.js:36". Cause: kit.js:38 pushes each load promise into module-level `pending` and never clears it, stage.js:147 awaits Promise.all(pending), texCache keeps the empty Texture. Every time a stage texture fails its 3 tries (flaky phone network). On a phone the old arena has no touch controls (audit-phone), so only Exit works. Fighter assets, hdri, reach.json, clips.json and modules do not do this: second open works.

### Visible
V1. Space at the moment the end panel appears presses Rematch, so the end report is gone. Steps: fight to a stoppage or KO, keep tapping Space as the panel arrives. Evidence: s_focus: 21 presses, panel seen at 3.75 s, new match at 3.98 s (same false, st intro). Cause: hud.js showPanel focuses Rematch, index.js onKeyDown returns on an open panel without preventDefault, the browser clicks the focused button. Every time Space or Enter lands after the panel opens; a held Space does it too, on release after a repeat. Fix idea: ignore Space and Enter on the end panel for about .6 s, or until those keys have been released.
V2. Frame rate changes the game at 30 fps. Win % normal level at 30/60/120/144 fps, 400 matches a cell: skilled bot 61/65/73.5/72.5, mixed 21/10/8.5/9.3, learner 31.5/22/20/19.3. With the bot held at 60 Hz: mixed 21/10/12.5/10, learner 31.3/22.3/20.8/21.3, skilled -/64.5/63.3/66. So a 120 or 144 Hz screen gives a player the same game as 60 (the skilled bot's rise is the bot itself reading more often); a 30 fps laptop gets a rival who goes down nearly twice as often (kdO .55 vs .32) and is about a frame late to react (bot whiffs 15.7 vs 18.1). AI punch rate and land rate barely move (35 vs 33.6 a minute, 78.7 vs 80.3 %). Cause, proved: index.js frame() runs ai.decide and playerInput once per frame and holds them for all that frame's ticks; with both on the tick (every 2 ticks) every number is identical at 30, 60, 144 fps. `S.bank = 0` is not the cause. Fix to test: call ai.decide every 2 ticks inside `while (S.bank >= STEP)`.
V3. Crowd sound keeps playing behind another tab or app when the end panel is up. Steps: reach the end panel, switch tab. Evidence: vis: hidden true, context running, rms .035 to .038 over 6 s, context time advancing. Cause: index.js onVisibility skips pause when panelOn(S), so audio.setPaused never runs. Every time. Fix: suspend audio on hidden whatever the panel, resume on shown unless paused.
V4. arena.css failing to load: the game runs unseen. First read (s2 fail, live page): root position static, top 720 on a 720 window, canvas height 0, match running, page height 2511, the lobby is what the player sees, keys go to the arena. ensureCss in hud.js resolves on error or after 2.5 s and nothing checks that the sheet arrived. The failed link stays in the head and is never fetched again (`link && link.sheet` false, waits the 2.5 s timeout), second open took 2.4 s in that run; s5 cssfail was queued to confirm it stays unstyled and did not finish. Rare, flaky network only.
V5. WebGL context lost in any state, end panel and pause included, drops the player into the old arena with no word. Measured in all 11 states, no error, reopen works. It is by design in index.js S.onLost, but on the end panel it replaces a finished fight with a new old-arena fight, and phones lose contexts when backgrounded and have no touch there.

### Minor
M1. Right click in a fight opens the browser menu (contextmenu prevented false on CANVAS), the fight keeps running behind it. A key released while that menu is open may stick: not provable headless.
M2. Key up lost while Cmd is held on a Mac keeps the man walking until that key is pressed again (s_input: walking .5,-.87 at speed 2.24 with the keyup withheld; macOS really does withhold it, I did not see that on a Mac here). Blur clears it. Fix idea: clear keys on Meta keyup.
M3. Shift held through a pause: guard is down after resume until Shift is pressed again (modifiers do not auto-repeat). Letter keys come back on their next repeat.
M4. Non-QWERTY: keys are by position (e.code). AZERTY key labelled W (KeyZ) and Dvorak key labelled J (KeyC) do nothing, while the HUD says W and J. Korean layouts are unaffected.
M5. Old arena reads e.key (game.js:2775): with a Korean IME on, movement and punches do nothing in the fallback. Read, not run. Lobby hotkeys read e.key too (game.js:3745): s6 smallscroll was queued to prove it and did not finish.
M6. Browser back in the arena leaves the site with no guard. Save unchanged, forward gives a fresh lobby. An Android back press in a fight therefore leaves the game.
M7. No feedback between the card click and the overlay: Mode Select closes, cursor unchanged, lobby and hotkeys live (hotkeysBlocked false) until index.js and hud.js arrive. Harmless in every case tried, about .9 s of blocked main thread at the click under load.
M8. Page's own AudioContext is made at boot before any gesture (game.js:3712, "AudioContext was not allowed to start" in every run). Not the arena's: createAudio runs after the click.

### Passed, not to repeat
See the two Passed lists above, plus: 3 s stall in the first (non-tight) run: no round skipped with 2.5 s left, clock 2.2 after, break arrives normally. Dt is capped at 1/15 in engine.js so a stall cannot jump.

### Not tested, stopped by the usage line
Queued in q5.sh on the frozen copy, unfinished: s3 sound (context state after pause, exit, volume across rematch, ten reopens, no-gesture backlog burst), s3 stress (ten opens, ten rematches: heap, geometries, textures, programs, listeners, GL contexts), s6 stall (tight version) and smallscroll, s5 cssfail, s3 resize (320x480 to 3840x2160, dpr 1 to 3, every state) and orient, s4 fpsreal (real frame() against the jsc copy, so the frame-rate tables are from a copy of the loop checked by reading only), clickgap, lobbycost, s5 slownet (false stall under 30 s with slow download). bfcache return on normal hosting: sink.py sends no-store. Real phones, real Mac keys, anyone listening.
Restart: rsync site to audit/flows/snap_root/ if hud.js is still broken, serve with tools/gfx/sink.py on 8795, run audit/flows/q5.sh with ITI_BASE set; drop the first item (tex3 done for the wall texture and hdr). Scripts read out2/. Keep polling under 5 minutes apart and print little: each call of mine costs a lot.

22:10 stopped at usage 63, line 67 close and load average over 100: s3 sound and s3 stress both died on `timed out: boot` (lobby not up in 40 s under that load, a harness limit, not a finding). Queue, frozen-copy server and my Chromes stopped. Everything under "Not tested" above still stands. Results files: scratchpad audit/flows/out2/.
