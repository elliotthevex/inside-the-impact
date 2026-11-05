# Integration notes (fightcam, index.js, arena.html, index.html hook, plus audio.js, fx.js, HUD leftovers)

Status: IN PROGRESS. Started 2026-11-05 20:15 KST. Keep this current: the Mac may sleep without warning.

## Scope decided with the coordinator
- I build gfx/arena/audio.js and gfx/arena/fx.js (hud and sim agents are finished; plans in hud.md).
- I take the "Not done" list in hud.md: HUD on the real sim, item 2 fixes, buttons, touch, reduced motion.
- Do NOT change balance numbers in sim.js or ai.js. Balance gets its own pass (numbers in sim.js, ai.js, simtest.html only). Smallest fix only if a real sim bug blocks a full match, and list it here.
- Apply setReach(reach.json) before createMatch.

## Order of work
1. fightcam.js, index.js, dev/arena.html running on real sim, rig, stage, hud. 2. index.html hook, gates. 3. fx.js. 4. audio.js. 5. Bot match on the real page through key events, screenshots. 6. HUD fixes. 7. Numbers (glove gap, feet, camera, console, memory, fps). 8. Touch, reduced motion, buttons. 9. Final gates, final notes.

## Progress log
- 20:15 read DESIGN.md, all notes, sim, ai, hud, engine, stage, fighter, rig. Nothing written yet except this file.
- about 20:26 wrote fightcam.js, index.js, dev/arena.html (not yet run). fighter.js: added dispose(), releaseFighterGPU(), texture-size check in preloadFighter. fx.js and audio.js still placeholders at this point.
- jscheck.py wraps every <script> body as JS, so a static <script type="importmap"> FAILS it (checked on a test file). Plan: inject the import map from one line of JS in the head. jscheck.py is left alone.
- about 20:28 dev page runs on real sim, rig, stage, hud (fx and audio placeholders); looked at first.png. Hook added to site/index.html (head loader script with injected import map, launch line, hotkeysBlocked). Original saved in the scratchpad at integrate/index.html.orig.
- 20:28 gates on the hooked page: jscheck ALL SCRIPTS PARSE, parity 3bea3b59, smoke pass true (fx and audio still placeholders then). A second copy of this agent also wrote here until 20:27; the coordinator stopped it. Its leftovers: a getter `ended` in hud.js, stubs in fx.js, saved versions in the scratchpad integrate/workflow-agent-copy/. The files on disk are this copy's.
- 20:32 wrote fx.js and audio.js (replacing the placeholders, not yet run). index.js now steps the sim tick by tick and stops on the tick a punch connects, so the frame drawn and held by hit-stop is the contact.
