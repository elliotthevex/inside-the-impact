# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: the four parts are built and each tested alone. They are being joined into one playable match now. The game does not run from the arena card yet.
Usage rule: stop at 75% of the 5-hour window (`mcp__ccd_session_mgmt__get_usage`). Agents stop at 72. Last check 20:14 KST: 15%, resets 00:20 KST. Weekly 6%.
Power: at 20:14 KST the Mac was at 7% battery and discharging. It slept once already (15:14 to 18:47) and that killed a whole build run.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief (20 screens to realistic 3D).
That overhaul is parked, not cancelled. Its reference notes are partly done: `scratchpad/notes/` has css1-5, js01-03, js05; the rest was stopped to save usage.

## Built and tested alone, not yet in the game
- World: engine, quality presets, room, ring, lamps, crowd (`gfx/core/engine.js`, `gfx/world/kit.js`, `gfx/arena/stage.js`). Rendered on low, medium and high with no shader, console or GL errors. Real 60 Hz not seen, because headless Chrome caps frame timing.
- Fighters: two distinct men, 10 clips, arm IK, foot planting, reactions (`gfx/people/rig.js`, `anim.js`, `fighter.js`, `glove.js`, `assets/anim/`). Checked on the real sim on its bench: no foot skate, glove reaches its target within 19 mm at contact, one 17 cm outlier on a round-bell tick.
- Rules and AI (`gfx/arena/sim.js`, `ai.js`, `gfx/dev/simtest.html`). No rule breaks across 200 matches per bot on the code two tuning passes back. Final code run at 100 matches per bot. Balance targets missed, see Known bugs.
- HUD (`gfx/arena/hud.js`, `arena.css`, fonts). Looked at in every state, but only against a fake match. Its buttons have never been clicked.

## In progress
- Integration agent (workflow run `wf_15ea3fef-cb4`): `fightcam.js`, `index.js`, `audio.js`, `fx.js`, HUD on the real sim, the arena card launch, `gfx/dev/arena.html`. Notes go to `gfx/dev/notes/integrate.md`. `audio.js` and `fx.js` were silent placeholders at the last check.

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
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`, `PROJECT_PROGRESS.md`. `index.html` had not been touched at the last commit; integration will add the launch hook.

## Last successful test
Each part on its own dev page: `gfx/dev/stage.html`, `rig.html`, `simtest.html`, `hud.html`. No full match has been played through the joined game yet.

## Next task
Finish integration. If the run died, restart it with `Workflow({scriptPath, resumeFromRunId: 'wf_15ea3fef-cb4'})` in the same session, or start a new integration agent from `gfx/dev/notes/integrate.md`. The script is `~/.claude/projects/-Users-elliot-jeong-Downloads-Inside-the-Impact/a4d575ac-45f5-438b-a265-75fe753a2111/workflows/scripts/street-fight-3d-build-wf_f66c7ee4-14f.js`.
