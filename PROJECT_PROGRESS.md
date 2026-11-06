# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: balance and polish, both interrupted for the usage line, with the feature modules built but not hooked in.
STOPPED at 10:26 KST on 2026-11-06 because the 5-hour figure read 49 against the 50 line. It rose from 40 to 49 in ten minutes. The window resets at 10:40 KST.
Usage rule: stop at 50% of the 5-hour window (the user lowered it from 75% on 2026-11-06); the weekly limit keeps 75%. Check with `mcp__ccd_session_mgmt__get_usage`. Agents stop at 47. Weekly 21% at the stop.
Power: on battery at 47% at 10:26 KST, about two hours left, and the user has been asked three times to plug in. A closed lid sleeps the Mac even on the charger.
Another session, "AAA fighting game screenshot", runs in this folder and shares the usage limit. Its changes, if any, are not coordinated with this work.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief, which is parked, not cancelled, and saved at `gfx/dev/overhaul-brief.md`.

## Done and tested
- World, fighters, rules, AI, HUD, camera, effects and sound run as one game (commit `ad04b5b`).
- 13 bot matches through real key events on the real page, on high, medium and low, with rematch, pause, touch emulation, settings and all four fallbacks to the old canvas arena. Numbers are in `gfx/dev/notes/integrate.md`.
- Independently rerun at 22:26 KST on 2026-11-05: `jscheck.py` parses, parity `3bea3b59`, smoke passes.
- `CREDITS.md`, `ASSET_LIST.md`.

## In progress, all stopped at 10:26 KST
Resume each after the reset with `Workflow({scriptPath, resumeFromRunId})`. Scripts are in the session's `workflows/scripts` folder and were patched at the stop: agents now stop at 47, and they are told to go easy on images.
- Balance: `arena-balance-wf_0ec0b835-a23.js`, run `wf_0ec0b835-a23`. Still in its tuning step. `sim.js` and `ai.js` hold experimental numbers from a kiting experiment, so read "Mid-experiment warning" in `gfx/dev/notes/balance.md` first. Known exploit being fixed: jab then back off wins 92-100% on every level. Harness now plays at the game's real 60 fps.
- Polish: `arena-polish-wf_14dc4bd3-946.js`, run `wf_14dc4bd3-946`. First pass nearly done, per `gfx/dev/notes/polish.md`: Post patches folded, character light, focus, banners as lower thirds, calmer camera, crowd faces, get-up timing. Independent review not started.
- Feature modules: `arena-feature-modules-wf_92506359-3fd.js`, run `wf_92506359-3fd`. Built and passing their own tests. The review stopped for usage before it ran anything, so there is no verdict. Hook plan: 16 edits in `gfx/dev/notes/features.md`.

## Remaining, in order
1. Resume the three jobs above. Then read their results, look at frames, rerun the gates, commit.
2. Two report-only audits: edge cases in the game's flows, and phone and Safari compatibility. Promised to the user for after the 10:40 reset.
3. Hook in the difficulty menu, coach lines and medical notes once polish has finished, because it owns `hud.js` and `index.js`, and a menu would block its test bot. Re-run `gfx/dev/coachtest.js` and `gfx/dev/menuclaims.js` after balance, because the menu's claims describe the AI. CREDITS.md says Codex entries unlock in a bout, which reads oddly in a panel where all are open; suggested wording is in `features.md`.
4. "Stop the fight" choice at a break, using `coach.offerStop`. It needs a small addition to `sim.js`, so it waits for balance.
5. Adversarial playtest and fix pass on the final balance.
6. Performance and low-end preset: measure with everything on, adaptive quality, GPU memory on low, missing-extension fallbacks.
7. Prune `vendor/` and unused assets, final checkpoint. Remove the `.lab`, `.dl` and `.scratch` symlinks from the project root.
8. Ask the user before anything goes to `main`. A release also has to sync `upload/` with the whole tree.

## Known bugs
- Listed for the polish pass in its script. Anything it leaves goes here.
- Tooling trap: rerunning `gear_tex.py` overwrites the new glove textures. Run `glove_tex.py` after it.
- The old canvas arena has measured combat defects. Commit `c81903e` on branch `arena-combat-fixes` addresses them, unmerged until the user decides.

## Not verified
- No human has played it, and nobody on this side can listen to the sound. `gfx/dev/sound.html` is there for a person to judge it.
- Never run on a phone or in Safari. Touch was emulated in desktop Chrome.
- 60 Hz never seen on a real display. macOS Low Power Mode is on, which is the user's setting, so every fps number is lower than a normal Mac would give.

## Files changed
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`, `CREDITS.md`, `ASSET_LIST.md`, `PROJECT_PROGRESS.md`. `index.html` has only the head loader with its injected import map, the launch line and the `hotkeysBlocked` selector.

## Last successful test
22:26 KST on 2026-11-05: all scripts parse, parity `3bea3b59`, smoke passes. 22:23 KST: two more whole matches on the real page, KO and TKO.

## Next task
After the reset at 10:40 KST, confirm usage has really dropped, then resume the three workflows in the order balance, polish, features.
