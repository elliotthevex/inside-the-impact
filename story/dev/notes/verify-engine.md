# verify-engine — final verifier notes

Status: DONE (2026-11-22). Restart: nothing pending. To re-verify, repeat the steps under "Checks run" in order.

## Checks run and results
1. Syntax, all 14 story JS files (`story/*.js`, `story/chapters/c99_sandbox.js`, `story/dev/*.js`) with
   `story/dev/syntax.js`: ALL OK. Re-run on director.js after the fix below: ok.
2. Headless `load`: `okEngine: true`, 0 problems, 0 warnings, 0 console output. `ok` is false only because the
   13 content files (cast.js, places.js, c00..c10) are not written yet (chapters phase), as before.
3. Headless `chapter 99`: reached the end in 31 sim s, no errors, not stuck. Also `chapter 99 --real` (54 s),
   `chapter 99 --render`, `sandbox` (29/29) and `locations --render` (3/3): all ok, before and after the fix.
4. Browser, own tab (`story/dev/play.html?ch=99` on the :8795 preview copy, synced with `dev/sync-preview.sh`,
   viewport forced to 1280x720 because the pane was hidden). Input went through the real window key listeners:
   computer-tool key presses for taps (E, J, Tab, Esc, arrows, Enter, H), dispatched KeyboardEvents for held keys,
   `S.test.frames` to advance frames (the hidden pane throttles rAF). Covered, all working:
   - chapter card skip, narration, board document viewer (3 pages, ←→, Esc), objective updates;
   - run 184 px/s, Shift walk toggle 78 px/s, brake/turn, "reverse" checklist tick;
   - crate wall blocks (stops at 553), jump over it, short hop 28 px vs full jump 61 px, three one-way planks,
     air dash across the 140 px gap to the far plank, S+Space drops through a plank;
   - jab 6 → cross 9 → hook 11 on the dummy; uppercut 10; flurry 6×3 + finisher 8; backdash 57 px keeps facing;
     returning cross out of a backdash; dash straight 12; dash → jab → cross; jab cut short by a slip deals no
     damage; slip of a telegraphed strike (clean) then a hand-pressed counter (counter 20 dmg); uppercut launch
     plus an air follow-up; bell round won. All 7 movement-checklist items ticked;
   - warehouse: dash through a thug during the dodge window (279 → 376 past him at 308), two-wave swarm with
     a director and an enforcer, never more than 2 attackers at once (token), target switch, cleared;
   - talk (Dell, 4-way choice with ↑↓ and Enter, key granted, people note), examine (bench sit → memory, warehouse
     clipboard thought lines), locked door reason, door into and out of the warehouse, fuse-box repair (hold E,
     W×2, J; streetlight comes on), heavy-bag drill 4/4 (level 0 → 1), ladder up (trigger quest done) and down,
     hidden roof snapshot (photo viewer, evidence toast);
   - journal: all six tabs (quests, evidence, memories, people, map, training), Tab closes;
   - pause menu; Save shows "The movement sandbox is not saved."; settings (difficulty, text speed, shake)
     change and persist to `iti.story.settings`, then restored; controls: Punch rebound to H (J no longer punches,
     H does), "Reset to preset A" restores bindings (stored `bindings: null`);
   - save/load: a page-only chapter 7 (not in the repo) on the sandbox avenue: pause → Save → slot 1 (toast),
     walk on and set a flag, pause → Load → slot 1 → confirm (mouse click): Jin back at the saved x, flag gone.
     Test saves (`iti.story.save.1`, `iti.story.save.auto`) deleted from the preview origin afterwards;
   - sign-out choice by mouse click → chapter completion screen (evidence 1/2, optional 2/3, choices, time,
     checklist 7/7) → E → title Chapters list.
   `S.errors` stayed empty; the console shows only the 404s for the 13 missing chapter files.
5. Real lobby `http://localhost:8795/` → PLAY → Story Mode card → Story Mode title (canvas display block, no
   border, 1280x720; `hotkeysBlocked()` true; 0 errors) → Chapters → Esc → Esc on the title: `#story-root`
   removed, `STORY.isOpen` false, `hotkeysBlocked()` false, lobby shown. Network: only the 13 chapter 404s.
6. `python3 -I tools/jscheck.py index.html`: ALL SCRIPTS PARSE. game.js, index.html, style.css: no diff vs HEAD.

## Fixed
- director.js `combatWait`: the fight/bout checkpoint label was "Fight: <encounter id>", and the pause menu and
  the quit dialog show it to the player ("Last checkpoint: Fight: sb_swarm"). It now reads
  "Before the fight — <location name>" ("Before the bout — …"), or `def.label` when an EncounterDef gives one
  (optional extra field, not in the contract). The label is display only (nothing parses it). Verified headless
  ("Before the fight — Warehouse No. 2") and the full headless suite re-run clean.

## Open (small, not fixed)
- c99_sandbox.js: Dell's barks switch only on `sb_key`, so after the bell round he still says "Bell is over
  there if you want a round." Content nit in the dev sandbox.
- activities.js: the activity panel (repair/drill prompt) redraws from its own rAF loop, so `S.test.frames`
  does not refresh it; in a hidden pane its DOM text lags the sim. Players never see this; test scripts should
  read `S.activities.current.hud` instead of the DOM.
- Ladder climb is ~58 px/s (a 220 px ladder takes ~3.8 s). Works; may feel slow. No number in the PDF.
- Not checked here: `tools/smoke.js` and `tools/parity.js` (no node in this environment). game.js is unchanged
  vs HEAD, so parity should hold.
- Chapters 0–10, cast.js and places.js do not exist yet, so `load` stays `ok: false`, `campaign` cannot run,
  and the lobby title shows Continue / New Game / Load disabled. Re-run this whole list once they land.
