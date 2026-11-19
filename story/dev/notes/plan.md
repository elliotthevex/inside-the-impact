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
