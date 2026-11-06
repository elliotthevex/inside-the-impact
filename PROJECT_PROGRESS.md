# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: a first version is LIVE (see below). Balance and polish fixes are stopped partway; the feature modules and both audits are finished and waiting to be acted on.
STOPPED at 22:18 KST on 2026-11-06 at 67 against the 70 line. The window resets at 01:40 KST on 2026-11-07. Weekly 47%.
Usage rule: stop at 70% of the 5-hour window (the user moved it from 75 to 50 to 70 on 2026-11-06, and the latest message wins); the weekly limit keeps 75%. Check with `mcp__ccd_session_mgmt__get_usage`. Agents stop at 67. Five agents at once burned 45 to 60 points an hour, three about 30, so check every 5 minutes past 55. The main session stops anything still running at 67 to 68.
Power: on battery at about 80% at 22:18 KST. A closed lid sleeps the Mac even on the charger.

## Live release
The user said "Put it live now" on 2026-11-06. `main` is at `6c7e471` and deployed on https://inside-the-impact.pages.dev. Another session also pushed `2ee0907` to `main` about the same time; this release sits on top of it. Cloudflare reported "Build failed" for `fa818c0`, with logs only in the user's dashboard; an empty rebuild commit `6c7e471` succeeded.
Built from worktree `../release-live` (branch `release-live`), so the running jobs' edits did not ship. It carries three fixes and one rollback that `realistic-3d` does not have yet:
- `404.html` for unknown addresses; `filmTargetsWork` and phones on low in `gfx/core/engine.js`; end panel focus delay in `gfx/arena/hud.js`.
- `gfx/arena/ai.js` restored to the tuned `5d6668b`, because the half-done fix at `2ee0907` measured harder for new players (normal mixed 6.7% against 19%, n=60 and n=100).
Before the next release, merge `main` into `realistic-3d` and keep `realistic-3d`'s `ai.js`, not the rollback. Do not push half-finished jobs: release from a commit that has passed its independent checks.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief, which is parked, not cancelled, and saved at `gfx/dev/overhaul-brief.md`.

## Page layout
The page is three files. `index.html` is markup only, `style.css` holds every style in the original cascade order, and `game.js` holds every page script, including the career game, the old canvas arena and the launch hook for the 3D one. Older notes in `gfx/dev/notes/` and the parked `gfx/dev/overhaul-brief.md` that say `index.html` for code now mean `game.js`.

## Done and tested
- World, fighters, rules, AI, HUD, camera, effects and sound run as one game (commit `ad04b5b`).
- 13 bot matches through real key events on the real page, on high, medium and low, with rematch, pause, touch emulation, settings and all four fallbacks to the old canvas arena. Numbers are in `gfx/dev/notes/integrate.md`.
- Independently rerun at 22:26 KST on 2026-11-05: `jscheck.py` parses, parity `3bea3b59`, smoke passes.
- `CREDITS.md`, `ASSET_LIST.md`.

## In progress, all stopped at 22:18 KST
Resume with `Workflow({scriptPath, resumeFromRunId})`. Scripts are in the session's `workflows/scripts` folder. Finished agents replay from cache.
- Balance: `arena-balance-wf_0ec0b835-a23.js`, run `wf_0ec0b835-a23`. Independent verify failed: any two-button fixed-beat pattern beats the AI (body shots only 96% on Normal, 93.5% on Hard). `fix 1` was stopped partway. Its lead: the AI learns the man's punch order (`learnOrder`) and stops sparing a routine. `gfx/dev/notes/balance.md` has its state, and the working tree holds it.
- Polish: `arena-polish-wf_14dc4bd3-946.js`, run `wf_14dc4bd3-946`. Review failed on portrait phones: the break view and count can lose the men. `fix 1` was stopped partway. Findings in `gfx/dev/notes/polish-review.md`.

## Finished, waiting to be acted on
- Feature modules: `gfx/arena/menu.js`, `coach.js`, `notes.js`, `extras-ui.js`, `extras.css`. Final review: one visible failure, `rawFallback` in `extras-ui.js` leaves a nearly black inline background on the menu if `extras.css` arrives late, plus minors in `gfx/dev/notes/features-review.md`. Hook plan in `gfx/dev/notes/features.md`.
- Audits (report only): `gfx/dev/notes/audit-flows.md`, `audit-phone.md`, and full findings in the run journal `wf_188f91df-717`. Worst for real players, all live now:
  - Nearly every failure on a phone lands in the old canvas arena, which has no touch controls, with no message.
  - Leaving the app for over 30 s during load does the same, because the stall check counts time while hidden.
  - One texture failing its three tries locks the page to the old arena until reload (`gfx/world/kit.js` keeps the rejected promise in `pending`).
  - AI decides once per frame, so at 30 fps the rival is easier (mixed 21% against 10% at 60). Fix to test: call `ai.decide` every 2 sim ticks inside the tick loop.
  - Also: slow networks give up while data is arriving, iOS plays all queued sounds at the first tap, the crowd sound keeps playing behind another app with the end panel up, arena.css failing leaves an invisible fight, and the touch pause icon ignores taps while another finger is down. Whether a script-added import map works in real Safari is the top unknown.

## Remaining, in order
1. At the reset, resume balance and polish. Read results, rerun the gates, commit.
2. Merge `origin/main` into `realistic-3d`: it holds the release fixes and two commits by AngelCat Tech to `README.md` and `CREDITS.md`, which must be kept. Keep `realistic-3d`'s `ai.js`, not the release's rollback.
3. Fix the audit findings, phone blockers first.
4. Hook in the difficulty menu, coach lines and medical notes (`gfx/dev/notes/features.md`), fix `rawFallback`, then re-run `gfx/dev/coachtest.js` and `gfx/dev/menuclaims.js` on the final balance. Coach praise almost never fires because head load puts most breaks in the safety tiers: decide whether that is right after the final balance.
5. "Stop the fight" choice at a break, using `coach.offerStop`. Needs a small addition to `sim.js`.
6. Adversarial playtest and fix pass. Note from balance: only a quarter of normal mixed matches end stopped, so check a new player actually sees a stoppage. Note from polish: there is no referee figure, so the stoppage is told only by the graphic and caption.
7. Performance and low-end preset: measure with nothing else running. Low saves little memory against medium (282-292 against 331 MB of textures), so phones may need smaller textures.
8. Prune `vendor/`, unused assets and `gfx/dev` from what ships, final checkpoint. Remove the `.lab`, `.dl` and `.scratch` symlinks and the `release-live` worktree.
9. Each later release needs the user's say-so: a push to `main` reaches real players. Sync `upload/` with the released tree (done for `6c7e471`). `inside-the-impact.html` in the project root is a stale single-file copy from before the 3D game.

## Other branches to keep in mind
- Page split: merged into `realistic-3d` as `2ee0907` by another session at the user's choice. `index.html` is markup, `style.css` and `game.js` hold the rest, and the arena launch line and `hotkeysBlocked` are now in `game.js`. Older notes and workflow prompts may still say `index.html`. `game.js` must stay a classic script, because `notes.js` reads `CX` as a bare global.
- `arena-combat-fixes`: old canvas arena fixes, now commit `7579719`, unmerged until the user decides.

## Known bugs
- Listed for the polish pass in its script. Anything it leaves goes here.
- Tooling trap: rerunning `gear_tex.py` overwrites the new glove textures. Run `glove_tex.py` after it.
- The old canvas arena has measured combat defects. Commit `c81903e` on branch `arena-combat-fixes` addresses them, unmerged until the user decides. It edits the old single-file `index.html`, so after the split a plain merge conflicts, and `-X ours` or `-X theirs` exits 0 with a wrong result: never use those. This recipe was tested in a scratch clone: `git merge --no-commit --no-ff arena-combat-fixes; git checkout --ours -- index.html; git add index.html; git show c81903e --format= -- index.html | sed -e '1,4s#a/index.html#a/game.js#' -e '1,4s#b/index.html#b/game.js#' > x.patch; git apply --index x.patch; git commit`.

## Not verified
- No human has played it, and nobody on this side can listen to the sound. `gfx/dev/sound.html` is there for a person to judge it.
- Never run on a phone or in Safari. Touch was emulated in desktop Chrome.
- 60 Hz never seen on a real display. macOS Low Power Mode is on, which is the user's setting, so every fps number is lower than a normal Mac would give.

## Files changed
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`, `CREDITS.md`, `ASSET_LIST.md`, `PROJECT_PROGRESS.md`. The page's own code changed only in the head loader with its injected import map, the launch line and the `hotkeysBlocked` selector, all now in `game.js`.

## Last successful test
21:58 KST on 2026-11-06, on the live site itself, commit `6c7e471`: a bot played a whole match through real key events on medium, ending in a referee stoppage in round 3 at 40 health with the report line on the end panel. No page or console errors, load 8.5 s, 43 fps with five agents running. Parity `3bea3b59` and smoke pass on the live URL.

## Next task
After the reset at 01:40 KST on 2026-11-07, confirm usage has really dropped, then resume balance and polish.
