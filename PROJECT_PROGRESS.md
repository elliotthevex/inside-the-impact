# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`. Each builder's notes are in `gfx/dev/notes/`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live, and the user decides that.

## Status
STOPPED at 11:32 KST on 2026-11-08 at weekly 74% against the 75% line (5-hour 9%). Weekly resets at 15:00 KST on 2026-11-12. Do not start agents before then unless the user moves the line. Nothing is running; both trees are clean.
`realistic-3d` (in `site/`) holds: balance (verified, passed), polish (no blockers; a further full review skipped to save usage), the failure, loading, input and frame-rate fixes merged from `phone-fixes` as `6ee3fda`, and the computer-game basics (cursor, focus pause, fullscreen, graphics and sound in the pause panel, Q guard, big monitors; independent check passed). Gates and a whole match by real keys passed on it. Not live. A stable copy for the user to play on this Mac: http://127.0.0.1:8791/try-now/index.html (worktree `../try-now`, detached at the branch head).
Usage rule: stop at 70% of the 5-hour window and 75% weekly (the user's lines). About 8 points of the 5-hour limit cost 1 weekly point. Agents running in short dark-wake bursts while the lid is shut still spend usage: weekly went from 67 to 74 overnight with the lid shut.

## Live release
The user said "Put it live now" on 2026-11-06. `main` is at `6c7e471` and deployed on https://inside-the-impact.pages.dev. Another session also pushed `2ee0907` to `main` about the same time; this release sits on top of it. Cloudflare reported "Build failed" for `fa818c0`, with logs only in the user's dashboard; an empty rebuild commit `6c7e471` succeeded.
Built from worktree `../release-live` (branch `release-live`), so the running jobs' edits did not ship. It carries three fixes and one rollback that `realistic-3d` does not have yet:
- `404.html` for unknown addresses; `filmTargetsWork` and phones on low in `gfx/core/engine.js`; end panel focus delay in `gfx/arena/hud.js`.
- `gfx/arena/ai.js` restored to the tuned `5d6668b`, because the half-done fix at `2ee0907` measured harder for new players (normal mixed 6.7% against 19%, n=60 and n=100).
Before the next release, merge `main` into `realistic-3d` and keep `realistic-3d`'s `ai.js`, not the rollback. Do not push half-finished jobs: release from a commit that has passed its independent checks.

## Scope note
The user said on 2026-11-08: "this is for computer game mainly, do not need to work on ios". So aim testing, polish and performance at keyboard and desktop browsers. No iOS Simulator and no iPhone or Safari-specific work. Touch controls and the phone fixes already written stay, and get a sanity run only. Low keeps full-size textures on a computer; the smaller ones apply only to a coarse pointer.
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief, which is parked, not cancelled, and saved at `gfx/dev/overhaul-brief.md`.

## Page layout
The page is three files. `index.html` is markup only, `style.css` holds every style in the original cascade order, and `game.js` holds every page script, including the career game, the old canvas arena and the launch hook for the 3D one. Older notes in `gfx/dev/notes/` and the parked `gfx/dev/overhaul-brief.md` that say `index.html` for code now mean `game.js`.

## Done and tested
- World, fighters, rules, AI, HUD, camera, effects and sound run as one game (commit `ad04b5b`).
- 13 bot matches through real key events on the real page, on high, medium and low, with rematch, pause, touch emulation, settings and all four fallbacks to the old canvas arena. Numbers are in `gfx/dev/notes/integrate.md`.
- Independently rerun at 22:26 KST on 2026-11-05: `jscheck.py` parses, parity `3bea3b59`, smoke passes.
- `CREDITS.md`, `ASSET_LIST.md`.

## In progress (stopped)
Resume with `Workflow({scriptPath, resumeFromRunId})`. Scripts are in the session's `workflows/scripts` folder. Finished agents replay only if their prompt is byte-identical.
- `arena-phone-fixes-wf_e026d923-0b6.js`, run `wf_e026d923-0b6`, branch `phone-fixes`. Check round 3 for computers found: right Shift held through a pause or over a Cmd tap leaves the guard stuck; a hung index.js or hud.js on a keyboard device keeps the card out of the real arena until reload; Tab stops on Exit while Resume is disabled or hidden; Space held over the end panel's focus, or tapped past .96 s, presses Rematch; Space held over Esc presses Resume on release. `fix after check 2` was stopped at its start (notes commit `427aacf`, no code). Then the workflow hooks in the difficulty menu, corner coach, notes and the Stop the fight button (plan in `gfx/dev/notes/features.md`, decisions in the script), and checks them. menu.js still lists only Shift for Guard: add Q there during the hook.
- Balance and polish workflows are finished.

## Finished, waiting to be acted on
- Feature modules: `gfx/arena/menu.js`, `coach.js`, `notes.js`, `extras-ui.js`, `extras.css`. Final review: one visible failure, `rawFallback` in `extras-ui.js` leaves a nearly black inline background on the menu if `extras.css` arrives late, plus minors in `gfx/dev/notes/features-review.md`. Hook plan in `gfx/dev/notes/features.md`.
- Audits (report only): `gfx/dev/notes/audit-flows.md`, `audit-phone.md`, and full findings in the run journal `wf_188f91df-717`. Worst for real players, all live now:
  - Nearly every failure on a phone lands in the old canvas arena, which has no touch controls, with no message.
  - Leaving the app for over 30 s during load does the same, because the stall check counts time while hidden.
  - One texture failing its three tries locks the page to the old arena until reload (`gfx/world/kit.js` keeps the rejected promise in `pending`).
  - AI decides once per frame, so at 30 fps the rival is easier (mixed 21% against 10% at 60). Fix to test: call `ai.decide` every 2 sim ticks inside the tick loop.
  - Also: slow networks give up while data is arriving, iOS plays all queued sounds at the first tap, the crowd sound keeps playing behind another app with the end panel up, arena.css failing leaves an invisible fight, and the touch pause icon ignores taps while another finger is down. Whether a script-added import map works in real Safari is the top unknown.

## Remaining, in order
1. After the weekly reset, or if the user moves the line: resume the phone-fixes workflow (fixes for the check's failures, then the hook and Stop the fight, then their check).
2. Merge `phone-fixes` into `realistic-3d` by hand (never `-X ours` or `-X theirs`). Expect overlaps with the desktop work in `gfx/arena/index.js`, `hud.js` and `arena.css`. Rerun gates, `gfx/dev/coachtest.js`, `gfx/dev/menuclaims.js` and whole matches by real keys.
3. Playtest on a computer: does a new player meet the Stop the fight offer, does a stoppage land, is it fun. No referee figure exists; the stoppage is told by the graphic and caption. Performance on computers: high and medium at 1080p with nothing else running, and how integrated GPUs get treated by `detectQuality`.
4. Prune `vendor/`, unused assets and `gfx/dev` from what ships. Remove the `.lab`, `.dl` and `.scratch` symlinks and the `release-live`, `phone-fixes` and `try-now` worktrees.
5. Ask the user before each release: a push to `main` reaches real players. `origin/main` has moved by other sessions' pushes, so merge it into `realistic-3d` first. Sync `upload/`.

## Other branches to keep in mind
- Page split: merged into `realistic-3d` as `2ee0907` by another session at the user's choice. `index.html` is markup, `style.css` and `game.js` hold the rest, and the arena launch line and `hotkeysBlocked` are now in `game.js`. Older notes and workflow prompts may still say `index.html`. `game.js` must stay a classic script, because `notes.js` reads `CX` as a bare global.
- `arena-combat-fixes`: old canvas arena fixes, now commit `7579719`, unmerged until the user decides.

## Known bugs
- Listed for the polish pass in its script. Anything it leaves goes here.
- Tooling trap: rerunning `gear_tex.py` overwrites the new glove textures. Run `glove_tex.py` after it.
- The old canvas arena has measured combat defects. Commit `c81903e` on branch `arena-combat-fixes` addresses them, unmerged until the user decides. It edits the old single-file `index.html`, so after the split a plain merge conflicts, and `-X ours` or `-X theirs` exits 0 with a wrong result: never use those. This recipe was tested in a scratch clone: `git merge --no-commit --no-ff arena-combat-fixes; git checkout --ours -- index.html; git add index.html; git show c81903e --format= -- index.html | sed -e '1,4s#a/index.html#a/game.js#' -e '1,4s#b/index.html#b/game.js#' > x.patch; git apply --index x.patch; git commit`.

## Not verified
- No human has played it, and nobody on this side can listen to the sound. `gfx/dev/sound.html` is there for a person to judge it.
- Desktop Safari and Firefox have never run it; only Chrome here. iOS is out of scope. One quick probe in iPhone Safari in the Simulator did run a whole match on low.
- 60 Hz never seen on a real display. macOS Low Power Mode is on, which is the user's setting, so every fps number is lower than a normal Mac would give.

## Files changed
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`, `CREDITS.md`, `ASSET_LIST.md`, `PROJECT_PROGRESS.md`. The page's own code changed only in the head loader with its injected import map, the launch line and the `hotkeysBlocked` selector, all now in `game.js`.

## Last successful test
00:35 KST on 2026-11-08, merged code `6ee3fda`: jscheck parses, parity `3bea3b59`, smoke pass (20 run), a whole match on high by real keys to a TKO with no page or GL errors. The desktop work after it passed its own gates, a whole match on high by real keys, and an independent check.

## Next task
Wait for the weekly reset (15:00 KST on 2026-11-12) or the user. Then resume `wf_e026d923-0b6`.
