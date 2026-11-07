# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
Phase: a first version is LIVE (see below). Three workflows run on 2026-11-07 from 17:55 KST: balance and polish in `site/`, phone fixes in worktree `../phone-fixes` (branch `phone-fixes`). All unpublished.
Usage rule: stop at 70% of the 5-hour window (the user moved it from 75 to 50 to 70 on 2026-11-06, and the latest message wins); the weekly limit keeps 75%. Check with `mcp__ccd_session_mgmt__get_usage`. Agents stop at 67 by themselves. The window resets at 22:50 KST. About 8 points of the 5-hour limit cost 1 weekly point, so a 67-point window costs about 8 weekly points; weekly was 57 at 21:32 KST.
Power: on battery at 4% at 21:32 KST. The Mac sleeps with a closed lid or a dead battery. Nothing is lost, and agents retry when it wakes.

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

## In progress
Resume with `Workflow({scriptPath, resumeFromRunId})`. Scripts are in the session's `workflows/scripts` folder. Finished agents replay from cache only if their prompt is byte-identical, so never edit a string a finished agent's prompt uses.
- Balance: `arena-balance-wf_0ec0b835-a23.js`, run `wf_0ec0b835-a23`. Fix 1 closed the fixed-beat holes (committed `9bf806e`). Verify 2 met every table target and found one policy left: walk in to .8 m, hands up, random power punch every 1.4 s wins 64.5% on normal and 30.5% on hard. `fix 2` is working on it, in `gfx/arena/ai.js`. This is a real boxing plan a person might find, so if fix 2 cannot close it cheaply, accept it and record that: do not lift difficulty for new players to chase it.
- Polish: `arena-polish-wf_14dc4bd3-946.js`, run `wf_14dc4bd3-946`. A second full review ran by accident (my edit broke the cache) and gave a clean list: no blockers, three visible, all camera (orbit, accepted as out of reach; post strip; post ghost at fast orbit). `fix 1` is working on the post items. Its next step is another full review, which can be skipped if the playtest covers it.
- Phone fixes: `arena-phone-fixes-wf_e026d923-0b6.js`, run `wf_e026d923-0b6`, branch `phone-fixes`. Groups A to G committed, notes in `gfx/dev/notes/phone-fixes.md` on that branch. `check 1` is running: it re-runs the audits and tests on real iPhone Safari in the Simulator. Then the same workflow hooks in the menu, coach, notes and the Stop the fight button, and checks those.

## Finished, waiting to be acted on
- Feature modules: `gfx/arena/menu.js`, `coach.js`, `notes.js`, `extras-ui.js`, `extras.css`. Final review: one visible failure, `rawFallback` in `extras-ui.js` leaves a nearly black inline background on the menu if `extras.css` arrives late, plus minors in `gfx/dev/notes/features-review.md`. Hook plan in `gfx/dev/notes/features.md`.
- Audits (report only): `gfx/dev/notes/audit-flows.md`, `audit-phone.md`, and full findings in the run journal `wf_188f91df-717`. Worst for real players, all live now:
  - Nearly every failure on a phone lands in the old canvas arena, which has no touch controls, with no message.
  - Leaving the app for over 30 s during load does the same, because the stall check counts time while hidden.
  - One texture failing its three tries locks the page to the old arena until reload (`gfx/world/kit.js` keeps the rejected promise in `pending`).
  - AI decides once per frame, so at 30 fps the rival is easier (mixed 21% against 10% at 60). Fix to test: call `ai.decide` every 2 sim ticks inside the tick loop.
  - Also: slow networks give up while data is arriving, iOS plays all queued sounds at the first tap, the crowd sound keeps playing behind another app with the end panel up, arena.css failing leaves an invisible fight, and the touch pause icon ignores taps while another finger is down. Whether a script-added import map works in real Safari is the top unknown.

## Remaining, in order
1. When the workflows finish or stop at the usage line, commit what is in `site/`, then after the reset resume whichever stopped.
2. Merge `phone-fixes` into `realistic-3d` by hand, never with `-X ours` or `-X theirs`. Expect small overlaps in `hud.js`, `arena.css`, `stage.js`, `kit.js`. Rerun gates, `gfx/dev/coachtest.js`, `gfx/dev/menuclaims.js` and complete matches on the merged code, and the balance table through the real `frame()`.
3. Adversarial playtest and fix pass, including real iPhone Safari by real taps: does a new player meet the Stop the fight offer, does a stoppage land, is it fun. Note from polish: there is no referee figure, so the stoppage is told only by the graphic and caption.
4. Performance: measure with nothing else running.
5. Prune `vendor/`, unused assets and `gfx/dev` from what ships, final checkpoint. Remove the `.lab`, `.dl` and `.scratch` symlinks and the `release-live` and `phone-fixes` worktrees.
6. Ask the user before each release: a push to `main` reaches real players. Sync `upload/` with the released tree. `inside-the-impact.html` in the project root is a stale single-file copy from before the 3D game.

## Other branches to keep in mind
- Page split: merged into `realistic-3d` as `2ee0907` by another session at the user's choice. `index.html` is markup, `style.css` and `game.js` hold the rest, and the arena launch line and `hotkeysBlocked` are now in `game.js`. Older notes and workflow prompts may still say `index.html`. `game.js` must stay a classic script, because `notes.js` reads `CX` as a bare global.
- `arena-combat-fixes`: old canvas arena fixes, now commit `7579719`, unmerged until the user decides.

## Known bugs
- Listed for the polish pass in its script. Anything it leaves goes here.
- Tooling trap: rerunning `gear_tex.py` overwrites the new glove textures. Run `glove_tex.py` after it.
- The old canvas arena has measured combat defects. Commit `c81903e` on branch `arena-combat-fixes` addresses them, unmerged until the user decides. It edits the old single-file `index.html`, so after the split a plain merge conflicts, and `-X ours` or `-X theirs` exits 0 with a wrong result: never use those. This recipe was tested in a scratch clone: `git merge --no-commit --no-ff arena-combat-fixes; git checkout --ours -- index.html; git add index.html; git show c81903e --format= -- index.html | sed -e '1,4s#a/index.html#a/game.js#' -e '1,4s#b/index.html#b/game.js#' > x.patch; git apply --index x.patch; git commit`.

## Not verified
- No human has played it, and nobody on this side can listen to the sound. `gfx/dev/sound.html` is there for a person to judge it.
- Real iPhone Safari: one quick probe in the Simulator (iOS 26.2) on 2026-11-07. The import map added from script works and a whole match ran on low with no page errors. The first open failed about 30 s in when the GPU context died with the Mac at 12 GB of swap, so read as memory pressure, not proven. No real phone has run it, and the fix for this is what `check 1` tests. Android only as Chrome emulation. In-app browsers (KakaoTalk, Naver) never.
- 60 Hz never seen on a real display. macOS Low Power Mode is on, which is the user's setting, so every fps number is lower than a normal Mac would give.

## Files changed
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`, `CREDITS.md`, `ASSET_LIST.md`, `PROJECT_PROGRESS.md`. The page's own code changed only in the head loader with its injected import map, the launch line and the `hotkeysBlocked` selector, all now in `game.js`.

## Last successful test
21:58 KST on 2026-11-06, on the live site itself, commit `6c7e471`: a bot played a whole match through real key events on medium, ending in a referee stoppage in round 3 at 40 health with the report line on the end panel. No page or console errors, load 8.5 s, 43 fps with five agents running. Parity `3bea3b59` and smoke pass on the live URL.

## Next task
When the workflows report, read their results. Merge `phone-fixes` once its checks pass, then the playtest.
