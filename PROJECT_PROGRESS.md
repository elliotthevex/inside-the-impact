# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: balance and polish tuned but not yet independently checked; feature modules built, reviewed once, not hooked in.
STOPPED at 12:00 KST on 2026-11-06 because the 5-hour figure read 46 and was rising 1 point a minute against the 50 line. The window resets at 15:40 KST. Weekly 27%.
Usage rule: stop at 50% of the 5-hour window (the user lowered it from 75% on 2026-11-06); the weekly limit keeps 75%. Check with `mcp__ccd_session_mgmt__get_usage`. Agents stop at 47. Five agents at once burned about 60 points an hour, so run at most three, and watch every 5 minutes past 35. The main session stops anything still running at 46.
Power: on battery at 15% at 12:00 KST, about 40 minutes left. The user has been asked several times to plug in. Mobile push is disabled, so the only warnings are messages here.
Another session, "AAA fighting game screenshot", ran in this folder and shares the usage limit. A one-line README.md play-link change, already staged, went into commit 063f451; it looks correct and was kept.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief, which is parked, not cancelled, and saved at `gfx/dev/overhaul-brief.md`.

## Page layout
The page is three files. `index.html` is markup only, `style.css` holds every style in the original cascade order, and `game.js` holds every page script, including the career game, the old canvas arena and the launch hook for the 3D one. Older notes in `gfx/dev/notes/` and the parked `gfx/dev/overhaul-brief.md` that say `index.html` for code now mean `game.js`.

## Done and tested
- World, fighters, rules, AI, HUD, camera, effects and sound run as one game (commit `ad04b5b`).
- 13 bot matches through real key events on the real page, on high, medium and low, with rematch, pause, touch emulation, settings and all four fallbacks to the old canvas arena. Numbers are in `gfx/dev/notes/integrate.md`.
- Independently rerun at 22:26 KST on 2026-11-05: `jscheck.py` parses, parity `3bea3b59`, smoke passes.
- `CREDITS.md`, `ASSET_LIST.md`.

## In progress, all stopped at 12:00 KST
Resume with `Workflow({scriptPath, resumeFromRunId})`. Scripts are in the session's `workflows/scripts` folder. Finished agents replay from cache.
- Balance: `arena-balance-wf_0ec0b835-a23.js`, run `wf_0ec0b835-a23`. Tuning finished: 0 of 78 missed at n=200 on seeds 1000+, 3 of 77 on seeds 5000+ with thin margins. Independent verify has not run. Results are in `gfx/dev/notes/balance.md`.
- Polish: `arena-polish-wf_14dc4bd3-946.js`, run `wf_14dc4bd3-946`. First pass finished, gates pass. Worst/best face light went from .17 to .60 and .07 to .68. Camera orbit 34.7 deg/s; its own calculation says no camera reaches the 20 target with this AI. Independent review has not run.
- Feature modules: `arena-feature-modules-wf_92506359-3fd.js`, run `wf_92506359-3fd`. Review finished with visible failures: the coach repeats the same few lines and says "bar looks fine" over a half-red bar. The fix agent was stopped partway; findings are in `gfx/dev/notes/features-review.md`.
- Audits: `arena-audits-wf_188f91df-717.js`, run `wf_188f91df-717`. Stopped partway, report only. Partial findings in `gfx/dev/notes/audit-flows.md` and `audit-phone.md`.

## Remaining, in order
1. Resume balance, polish and features at the reset, three at most. Read results, rerun the gates, commit. Then the audits.
2. Hook in the difficulty menu, coach lines and medical notes (16 edits listed in `gfx/dev/notes/features.md`), then re-run `gfx/dev/coachtest.js` and `gfx/dev/menuclaims.js` on the final balance.
3. "Stop the fight" choice at a break, using `coach.offerStop`. Needs a small addition to `sim.js`.
4. Fix what the audits found.
5. Adversarial playtest and fix pass on the final balance. Note from balance: 98% of normal mixed matches reach round 3 and only 24.5% end stopped, so check that a new player actually sees a stoppage. Note from polish: there is no referee figure, so the stoppage is told only by the graphic and caption.
6. Performance and low-end preset: measure with everything on and with nothing else running, adaptive quality, GPU memory on low, missing-extension fallbacks.
7. Prune `vendor/` and unused assets, final checkpoint. Remove the `.lab`, `.dl` and `.scratch` symlinks from the project root.
8. Ask the user before anything goes to `main`. A release also has to sync `upload/` with the whole tree, which now includes `style.css` and `game.js`. Decide on deep URLs before release: the host answers any unknown path with `index.html`, so at `/foo/bar/` the relative `game.js` and `style.css` get HTML back and the page sticks on an unstyled Loading screen. The old single file ran there. Nothing links to such a URL. The likely fix is a `_redirects` file with `/*/game.js /game.js 200` and `/*/style.css /style.css 200`, untested because only Cloudflare can run it, so try it on a preview deployment first. Root-absolute paths are not the fix: they break `file://` and subfolder testing.

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
About 11:50 KST on 2026-11-06, by the polish agent on its final code: three whole matches on the real page through real key events (high and low), parse check, parity `3bea3b59`, smoke test 20 run and passing. Parse check rerun at the stop. `sim.js` and `ai.js` changed shortly before that run.

## Next task
After the reset at 15:40 KST, confirm usage has really dropped, then resume balance, polish and features.
