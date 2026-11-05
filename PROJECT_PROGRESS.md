# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: joining the four parts into one playable match. The dev page runs a fight on the real rules, fighters, room and HUD. `index.html` now has the launch hook, but a full match through the arena card has not been confirmed.
Usage rule: stop at 75% of the 5-hour window (`mcp__ccd_session_mgmt__get_usage`). Agents stop at 72. Last check 21:14 KST: 30%, resets 00:20 KST. Weekly 8%.
Power: plugged in and charging since about 21:14 KST. It reached 2% first. It slept once already (15:14 to 18:47) and that killed a whole build run.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief (20 screens to realistic 3D).
That overhaul is parked, not cancelled. Its reference notes are partly done: `scratchpad/notes/` has css1-5, js01-03, js05; the rest was stopped to save usage.

## Built and tested alone, not yet in the game
- World: engine, quality presets, room, ring, lamps, crowd (`gfx/core/engine.js`, `gfx/world/kit.js`, `gfx/arena/stage.js`). Rendered on low, medium and high with no shader, console or GL errors. Real 60 Hz not seen, because headless Chrome caps frame timing.
- Fighters: two distinct men, 10 clips, arm IK, foot planting, reactions (`gfx/people/rig.js`, `anim.js`, `fighter.js`, `glove.js`, `assets/anim/`). Checked on the real sim on its bench: no foot skate, glove reaches its target within 19 mm at contact, one 17 cm outlier on a round-bell tick.
- Rules and AI (`gfx/arena/sim.js`, `ai.js`, `gfx/dev/simtest.html`). No rule breaks across 200 matches per bot on the code two tuning passes back. Final code run at 100 matches per bot. Balance targets missed, see Known bugs.
- HUD (`gfx/arena/hud.js`, `arena.css`, fonts). Looked at in every state, but only against a fake match. Its buttons have never been clicked.

## In progress
- Integration agent `a404045a6c0629b59`, running on its own (not in a workflow): `fightcam.js`, `index.js`, `audio.js`, `fx.js`, HUD on the real sim, the arena card launch, `gfx/dev/arena.html`. Notes go to `gfx/dev/notes/integrate.md`. `audio.js` and `fx.js` were written at 20:32 and have not been run. The joined game has not been run to the end yet.
- Balance pass (workflow run `wf_0ec0b835-a23`, started 21:15 KST): tunes `sim.js` and `ai.js` with the real reach table against the targets in its script, then an independent check on fresh seeds. Notes go to `gfx/dev/notes/balance.md` and `balance-verify.md`.
- Workflow run `wf_15ea3fef-cb4` is stopped on purpose. A message to its integration agent started a second copy, and the two overwrote each other from 20:15 to 20:27 KST. The surviving copy owns everything. The stopped copy's versions are in `scratchpad/integrate/workflow-agent-copy/`.

## Remaining, in order
1. Finish integration, then confirm a full match runs through the real arena card.
2. Balance pass on `sim.js` and `ai.js`, with `setReach(reach.json)` applied. Targets are in Known bugs.
3. Adversarial playtest and fix pass.
4. Performance and low-end preset. Fold the `engine.js` patches into `post.js`, measure with fighters, HUD and effects on, and check a real window at 60 Hz (`?live=1`).
5. `CREDITS.md`, `ASSET_LIST.md`, prune `vendor/` and unused assets, final checkpoint.
6. Remove the `.lab`, `.dl` and `.scratch` symlinks from the project root.
7. Ask the user before anything goes to `main`. A release also has to sync `upload/` with the whole tree.

## Known bugs
- Balance, measured before `setReach`, normal difficulty, 100 matches per bot: the mixed bot (a stand-in for a new player) loses every match in round 1, in about 39 s. Spam and turtle end in round 1 in 68% and 78% of matches. Skilled wins 61% against a target of about 65%. Whiff rates are about 50% on both sides. Slip works but rarely matters, about 0.5% of AI punches.
- Get-up runs about 2.8x real speed at `TUNE.getUpTime` 1.2 s. The rig agent suggests 1.6 to 1.8 s, passed to both rigs as `getUpTime`.
- HUD: small FIGHT banner shows 1.2 s early after a get-up, get-up progress bar missing, name cut off at 360 wide with large text and both Tired tags.
- Rig: slip is procedural because no mocap slip was usable. Sweat wired but not tuned. Hard shadow stripes on skin in test lights, not yet judged under the real stage lights.
- Crowd: one male base mesh, blank faces up close. Reads fine dark and out of focus.
- Tooling trap: rerunning `gear_tex.py` overwrites the new glove textures. Run `glove_tex.py` after it.
- Old canvas arena: `reference/arena-combat-audit.json` lists measured combat defects. Session `arena-combat-fixes` is handling that on its own branch.

## Not verified
- No human has played any of it. Nobody on this side can listen to the audio.
- Never run on a phone GPU. Low was only checked at phone resolution on the M1.

## Files changed
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`, `PROJECT_PROGRESS.md`. `index.html` now has the launch hook: a head loader with an injected import map, the launch line and `hotkeysBlocked`. Its original is saved at `scratchpad/integrate/index.html.orig`.

## Last successful test
20:28 KST, on the page with the launch hook but with placeholder effects and sound: all scripts parse, parity `3bea3b59`, smoke test passes, and `gfx/dev/arena.html` shows a fight on the real rules, fighters, room and HUD. No full match has been played through the joined game yet.

## Next task
Finish integration. If agent `a404045a6c0629b59` died, send it a message, which resumes it from its transcript, or start a new integration agent from `gfx/dev/notes/integrate.md`. Do not resume workflow run `wf_15ea3fef-cb4`: that starts another integrator. Only message an agent started by a workflow once that workflow has stopped.
If the balance pass died, resume it with `Workflow({scriptPath: '~/.claude/projects/-Users-elliot-jeong-Downloads-Inside-the-Impact/a4d575ac-45f5-438b-a265-75fe753a2111/workflows/scripts/arena-balance-wf_0ec0b835-a23.js', resumeFromRunId: 'wf_0ec0b835-a23'})`. Its agents own `sim.js`, `ai.js` and `simtest.html`.
