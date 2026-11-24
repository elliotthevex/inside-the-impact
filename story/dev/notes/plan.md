# Story Mode build plan (orchestrator notes)

Branch `story-mode`, worktree `~/Desktop/Inside-the-Impact/story-mode`. Not pushed, not live. A push to `main` deploys the public site; ask the user first.

Usage rule: the user said on 2026-11-20 "code until the 5-hour usage hits 80%" and "resume when it becomes 0%". Stop new work at ~77%, stop running workflows, commit WIP, resume after the 5-hour reset.

## Phases (each is one Workflow run)

1. Design bible — `wf_b87e3322-06d` (task wh3ujm4fw): three lens drafts -> `story/BIBLE.md` -> three critics -> revision.
2. Engine — `wf_a47653da-b10` (task w0f9000c0): eight module builders against `story/ARCHITECTURE.md` -> integrator -> four reviewers -> per-file fixers -> verifier.
3. Chapters (after 1 and 2): `chapters/cast.js` + `chapters/places.js` first, then c00..c10 in parallel against BIBLE + ARCHITECTURE; per chapter: headless chapter run, story-fidelity review vs `ref-story.pdf`, fix.
4. Campaign verification: headless `campaign restraint` and `campaign ruthless` (both endings), browser playthrough of every chapter start and key scenes, adversarial reviews (story fidelity, choices/consequences wiring, bugs, UX), fix loop until dry.
5. Release prep: gates on the exact commit (jscheck, parity `3bea3b59`, smoke 20), PROJECT_PROGRESS.md entry, then ask the user before any push to `main`.

Scripts are saved under the session's `workflows/scripts/` folder; resume with `Workflow({scriptPath, resumeFromRunId})`.

## Paused at the usage line — 02:23 KST, 2026-11-20 (5-hour at 78%)

Both workflows were stopped in their first phase; no agent had finished, so a resume re-runs every agent (partial files on disk — `story/core.js`, `story/design/draft-systems.md` — get overwritten).
- Design: run `wf_b87e3322-06d`, script `~/.claude/projects/-Users-elliot-jeong-Desktop-Inside-the-Impact/ca804261-1003-4979-b90e-1f8fbae65bec/workflows/scripts/story-design-bible-wf_b87e3322-06d.js`
- Engine: run `wf_a47653da-b10`, script `~/.claude/projects/-Users-elliot-jeong-Desktop-Inside-the-Impact/ca804261-1003-4979-b90e-1f8fbae65bec/workflows/scripts/story-engine-build-wf_a47653da-b10.js`
Burn rate seen: nine agents at once took the 5-hour window from 42% to 78% in about 25 minutes (another session was also spending it).
Resume is scheduled for 05:44 KST (one-shot cron in the session).

## Resumed — 05:44 KST, 2026-11-20 (5-hour at 1%)

Both workflows restarted from their run ids (design task witl3vt4r, engine task wk19fe4gm). Prompts now tell agents to continue from their own partial files after an interruption, so a stop at the usage line loses less. Usage check every 3 minutes; pause at 76%.

## Paused again — 06:13 KST, 2026-11-20 (5-hour at 67%, stopped early: the burn was 12 points per 3 minutes)

Same run ids and scripts as above (design wf_b87e3322-06d, engine wf_a47653da-b10). Still no agent had returned, but a lot is on disk for them to continue from: drafts cinematic 139 KB, world 130 KB, systems 205 KB; engine core.js, director.js, world.js, pieces.js, combat.js, activities.js written (art.js, ui.js, story.css and the dev harness not yet). Builders 7 and 8 (ui, dev-harness) had not started (concurrency cap 6).
Weekly went 19% -> 27% in this window. Resume scheduled 10:44 KST (one-shot cron); next pause at 70%.

## Resumed — 10:44 KST, 2026-11-20 (5-hour at 1%, weekly 33%)

Design task wzztkdvqp, engine task welalgoh8 (same run ids). Pause at 70% this window.

## Paused — 12:57 KST, 2026-11-20 (5-hour at 78%, weekly 44%; account usage limit reached)

Same run ids and scripts (design wf_b87e3322-06d, engine wf_a47653da-b10); still no agent had returned. world.js was mid-write (syntax incomplete). Next 5-hour reset 15:40 KST.

## On hold by the user — 2026-11-21

The user said: "dont resume the code until i tell u". No workflow is running and no resume job is scheduled. Do not restart either workflow until the user says so; then resume with the run ids and scripts above.

## Resumed by the user ("continue") — 18:19 KST, 2026-11-21 (5-hour 7%, weekly 50%)

Design task wjgu399fh, engine task wz9gs7ydg (same run ids). Per the user, no timer polling of usage; check at natural checkpoints (a workflow finishing, before the next phase). If the account limit cuts agents off, the run resumes from partial files.

## Retried by the user ("Try again") — 00:10 KST, 2026-11-22 (5-hour 4%, weekly 63%)

Last run: all eight engine builders and all three drafts finished (cached). Failed and now re-running: bible synthesize (network error), critics, revise; engine integrate, reviews, fixes, verify (5-hour limit). To fit the weekly 95% line, reviews were trimmed to movement + visual (engine) and fidelity + buildability (bible). Design task wtnqgz7p1, engine task wxvhvxhoc.
Weekly budget left before 95%: ~32 points; the last full run used ~13. Chapters and campaign verification will need a leaner plan or the weekly reset (Nov 26 15:00 KST).

## Engine and bible done — 01:50 KST, 2026-11-22 (5-hour 70%, weekly 72%)

Engine run wf_a47653da-b10 complete (15 agents; 24 findings handled; verify PASS; commit 2060907). Bible run wf_b87e3322-06d complete (72 findings, 71 applied; commit 37a02cf). `story/BIBLE.md` is 555 KB; authors should read `story/design/bible-parts/01-global.md` + their `chNN.md`.
Next: chapters phase, lean (weekly line 95% leaves ~23 points): one agent for `chapters/cast.js` + `places.js`, then one author per chapter with headless `chapter N` self-test, then a campaign phase (headless both endings, fidelity + choices-wiring reviewers, fixers, final browser pass). Waiting for the user's go and the 5-hour reset at 04:59 KST.

## Chapters phase approved — start at the 05:00 KST reset, 2026-11-22

The user said "Yes, at the reset". Script: `~/.claude/projects/-Users-elliot-jeong-Desktop-Inside-the-Impact/ca804261-1003-4979-b90e-1f8fbae65bec/workflows/scripts/story-chapters.js` — foundation (cast.js, places.js, README) -> 11 chapter authors (each self-tests headless under both policies) -> campaign integrator (both endings) -> 5 reviewers (fidelity 0-3 / 4-7 / 8-10, choices wiring, in-browser play) -> 3 fixers by chapter group -> final verifier. A session cron starts it at 05:02 KST; usage is checked every ~15 minutes and the run pauses at 74% and waits for the user (no auto-resume after a reset).

## Release wish — 2026-11-22

The user asked to "push it to live", then chose to wait for the chapters: push to the live site once chapters 0–10 are written and the full campaign passes, and ask them again then. origin/main has moved (2378207, two Missions bout fixes by another session): merge origin/main into story-mode before the release gates.

## Chapters phase started — 05:04 KST, 2026-11-22 (5-hour 1%, weekly 73%)

Task wrfokh85v, run wf_06933f2e-cd8, script `~/.claude/projects/-Users-elliot-jeong-Desktop-Inside-the-Impact/ca804261-1003-4979-b90e-1f8fbae65bec/workflows/scripts/story-chapters.js`. Resume after a stop: Workflow({scriptPath, resumeFromRunId: "wf_06933f2e-cd8"}) — only when the user says so.

## More agents in parallel — 05:12 KST, 2026-11-22 (the user: "apply a lot of agents, so it works faster")

The single chapters run (wf_06933f2e-cd8) was stopped after a minute and replaced by parallel workflows (scripts in the session's workflows/scripts folder), launched in this order as each finishes:
1. `story-foundation.js` — cast.js and places.js + README in parallel. RUNNING: task wj1vos3vk, run wf_d5463e14-ce8.
2. `story-chapters-a.js` (chapters 0–5) and `story-chapters-b.js` (6–10) at the same time: 11 authors at once.
3. `story-integrate.js` — campaign integrator (both endings).
4. `story-review-a.js` and `story-review-b.js` at the same time: per-chapter reviewer -> fixer pipelines.
5. `story-verify.js` — two browser play-testers, shared fixer, final verifier.
Usage: one-shot checks about every 15 minutes; at 74% of the 5-hour window stop every running Story Mode workflow, commit WIP, and wait for the user.

## Foundation done; 11 chapter authors running — 05:47 KST, 2026-11-22 (5-hour 25%, weekly 76%)

Foundation run wf_d5463e14-ce8 complete (commit 09367aa). RUNNING now:
- `story-chapters-a.js` (chapters 0–5): task wcuwnepn3, run wf_eab357b2-3c0
- `story-chapters-b.js` (chapters 6–10): task w2k75uq5k, run wf_a842f7ec-ec9
Resume either after a stop: Workflow({scriptPath: <session scripts>/story-chapters-a.js or -b.js, resumeFromRunId}) — only when the user says so.

## Paused at the usage line — 05:59 KST, 2026-11-22 (5-hour 70%, weekly 82%)

Eleven chapter authors took the 5-hour window from 25% to 70% in 12 minutes (and weekly 76% -> 82%), so both chapter runs were stopped before the next check could overshoot 80%. Little chapter code was on disk yet (authors were still reading). Stopped:
- `story-chapters-a.js` (0–5): run wf_eab357b2-3c0
- `story-chapters-b.js` (6–10): run wf_a842f7ec-ec9
Resume: Workflow({scriptPath: <session scripts>/story-chapters-a.js | -b.js, resumeFromRunId}) — only when the user says so.
Weekly line 95% leaves ~13 points; at this rate the chapters need more than that. Options for the user: wait for the weekly reset (Nov 26, 15:00 KST), raise the weekly line, or run fewer authors at a time.

## Chapters 0–2 started now — 06:03 KST, 2026-11-22 (the user: "Chapters 0–2 at 10:00", then "do it right now")

RUNNING: `story-chapters-012.js` — task wbspxx5bl, run wf_747d9e2f-9a8 (three authors at once). The 5-hour window was at 70% when the user said to start now, so this run goes past the 80% line and may hit the 5-hour limit around 06:30; agents keep their partial files and the run resumes from them after the 10:00 KST reset, when the user says so. Weekly guard: stop at 93%.

## Chapters 0–2 done — 2026-11-22 (usage limit reached)

Run wf_747d9e2f-9a8 complete: c00.js, c01.js, c02.js written; each reaches its end headless under the restraint policy with no errors (commit 903ebc0). Left: chapters 3–10 (scripts story-chapters-a.js / -b.js with CHAPTERS trimmed to the rest), then story-integrate.js, story-review-a/-b.js, story-verify.js; then merge origin/main and ask the user before pushing live. Wait for the user before starting anything.

## Released chapters 0–2 — 12:39 KST, 2026-11-24 (the user: "publish chapter 0-2, put it live")

`main` = `dc0eb44`, live and checked (file hashes equal, smoke 24/24, parity 3bea3b59, Story Mode lists chapters 0–2). Next, when the user says so: chapters 3–10 (raise `LAST_CHAPTER` in story/manifest.js as they land), then integrate / per-chapter review / verify, then merge origin/main again and ask before the next push.
