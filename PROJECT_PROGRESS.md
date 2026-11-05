# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: balance and polish, both running. A whole match plays from the 1v1 Arena card on the real page.
Usage rule: stop at 75% of the 5-hour window (`mcp__ccd_session_mgmt__get_usage`). Agents stop at 72. Last check 08:56 KST on 2026-11-06: 14%, resets 10:40 KST. Weekly 17%.
Power: on battery at 73% at 08:56 KST, and the user has been asked to plug in. The lid was closed from 22:29 to 08:55, which paused everything overnight. A closed lid sleeps the Mac even on the charger.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief, which is parked, not cancelled, and saved at `gfx/dev/overhaul-brief.md`.

## Done and tested
- World, fighters, rules, AI, HUD, camera, effects and sound run as one game (commit `ad04b5b`).
- 13 bot matches through real key events on the real page, on high, medium and low, with rematch, pause, touch emulation, settings and all four fallbacks to the old canvas arena. Numbers are in `gfx/dev/notes/integrate.md`.
- Independently rerun at 22:26 KST on 2026-11-05: `jscheck.py` parses, parity `3bea3b59`, smoke passes.
- `CREDITS.md`, `ASSET_LIST.md`.

## In progress
Both are workflows, so never message their agents (see memory `workflow-agents-have-no-inbox`).
- Balance, run `wf_0ec0b835-a23`, owns `gfx/arena/sim.js`, `ai.js`, `gfx/dev/simtest.html`, `gfx/dev/notes/balance*.md`. Tuning, then an independent check on fresh seeds. Its files are uncommitted on purpose until it finishes.
- Polish, run `wf_14dc4bd3-946`, owns the rest of `gfx/`. Fighter light, depth of field, exposure across presets, broadcast graphics that hide the fight, camera movement, low-preset crowd, get-up timing, folding the `engine.js` patches into `post.js`. Notes in `gfx/dev/notes/polish*.md`.
- Both retry after a network error. To resume either after a stop: `Workflow({scriptPath: '<its script in the session workflows/scripts folder>', resumeFromRunId: '<run id>'})`.

## Remaining, in order
1. Read the balance and polish results, look at frames, rerun the gates, commit.
2. In-game medical notes and credits panel, reached from pause and the end panel. The user asked for "all the medical knowledge in credits or somewhere". Draw the entries from the game's live `CX` so the text cannot drift. Wait for polish to finish, because it owns `hud.js`.
3. Adversarial playtest and fix pass on the final balance.
4. Performance and low-end preset: measure with everything on, adaptive quality, GPU memory on low, missing-extension fallbacks.
5. Prune `vendor/` and unused assets, final checkpoint.
6. Remove the `.lab`, `.dl` and `.scratch` symlinks from the project root.
7. Ask the user before anything goes to `main`. A release also has to sync `upload/` with the whole tree.

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
Wait for the balance and polish workflows. If the Mac slept, check `pmset -g log` and their transcripts before assuming they are alive.
