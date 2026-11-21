# integrate — integrator notes

Status: DONE (run 2, 2026-11-22). Restart: nothing pending; re-run the checks under "Verified" after any change.

## Verified
- Syntax: all 14 story JS files (`story/*.js`, `story/chapters/c99_sandbox.js`, `story/dev/*.js`) pass `dev/syntax.js`.
- Headless `load`: `okEngine: true`, 0 problems, 0 warnings. `ok` is false only because the 13 content files
  (cast.js, places.js, c00..c10) do not exist yet (chapters phase).
- Headless `chapter 99` and `chapter 99 --render`: reaches the end (31 sim s), no errors, render clean.
  `chapter 99 --real` (real fights): reaches the end in 54 sim s, not stuck, no errors.
- Headless `sandbox` self-test 29/29; `locations --render` 3/3.
- Browser, `story/dev/play.html?ch=99` (preview copy on :8795, hidden pane, driven with real KeyboardEvents plus
  `S.test.frames`): walk, run, Shift walk toggle, jump over the crate wall, up the three planks, air dash across
  the gap, drop through a plank, jab–cross–hook on the dummy, bell fight (slip the telegraphed strike and
  counter by hand, win the round), locked warehouse door shows its reason, Dell (talk, 4-way choice, key),
  heavy-bag drill to the end (level 0 → 1, then 4/4 at level 1), fuse-box repair, ladder up and down, rooftop
  trigger, hidden snapshot (photo viewer, evidence toast), journal (all six tabs, map, people, training),
  pause menu, settings (difficulty, change persisted), controls (rebind Punch to H, H punches in play,
  preset A restores), warehouse two-wave fight cleared, avenue: Rosa (marker, quest choice), newspaper
  (document viewer, page turn), payphone choice by digit key, kid bark bubble, bus schedule (thought lines).
  In-page self-test (`&test=1`) 28/28. 0 entries in `S.errors`; console errors are only 404s for the
  missing chapter files. Scale: 1024x576 → 960x540 integer (3 device px), 1280x720 → x2, 1920x1080 → x3.
- Save/load through the UI: the sandbox refuses manual saves by design ("The movement sandbox is not
  saved."), so a throwaway chapter 7 was registered in the page only (not in the repo) on the sandbox avenue:
  pause → Save → slot 1 (toast), walk on, set a flag, pause → Load → slot 1 → confirm Load: Jin back at the
  saved x, the later flag gone. Quit to title (confirm) → title with Continue line; Chapters list; Esc on the
  title closes Story Mode. Test saves were deleted from the preview origin afterwards.
- Real lobby (`http://localhost:8795/`): boot, PLAY → Story Mode card → title opens (no errors,
  `hotkeysBlocked()` true, canvas visible); Esc on the title returns to the lobby (root removed, hotkeys free).
- `python3 -I tools/jscheck.py index.html`: ALL SCRIPTS PARSE. game.js, index.html and style.css untouched.

## Fixed
- main.js: `S.test.frames(seconds, fps = 60)` — runs whole frames (sim steps + render + ui.update + clearFrame)
  without rAF. A hidden browser pane throttles rAF to ~1 Hz, so key-driven checks need it. (Export beyond §11.)
- c99_sandbox.js: the controls board said "hold Shift to walk instead of run"; Shift is a toggle (combat.js
  `toggleWalk`, contract "Shift run(walk toggle)"). It now says Shift switches between running and walking.
- c99_sandbox.js: map nodes spread apart (Back lot 230,200; Avenue 420,140); the Avenue label sat on the Back
  lot marker in the Map tab.
- combat.js `pushBodies`: passive targets (bag, dummy, `opts.passive`) no longer body-block Jin. In the yard
  the dummy (x 1200) and bag (1250) walled off the bell lane; a player had to jump each one. A drill's own bag
  (`opts.drill`, activities.js) stays solid so Jin works it from the side.
- combat.js enemy update: passive props are no longer clamped into a fight's arena. Ringing the bell dragged
  the yard's bag and dummy 150 px into the arena, on top of the thug, where Jin's counter and hook hit them.
- activities.js bag drill: the bag hangs at the "Use" spot, so Jin started inside it; setup now steps him to
  22 px on his side, facing the bag. Combo prompt adds "pause a beat to start again with a jab" when a jab
  follows a jab or a cross (repeated presses always chain jab → cross → hook, so mashing failed those combos
  with no explanation).
- activities.js repair: the prompt showed "[W] ×0" during the 0.3 s DONE pause between steps; the count is
  hidden once it reaches zero.
- ui.js + story.css dialogue: three or more short answers (≤ 44 chars, no disabled hint) lay out in two
  columns, column-major so ↑↓ order is unchanged, and the question line keeps one line of height. A 4-choice
  list used to cover Jin and the speaker standing above the box.
- story.css pause/menu footer: the disabled-reason line wrapped one word per line in narrow windows; the
  footer now wraps the key hints under a readable reason line.
- story.css lobby leak: style.css styles bare `h1`/`h2`/`b` globally (boxed uppercase Arial Black, ◆
  pseudo-elements, offset shadows) and those beat the zero-specificity resets, so in the real lobby the title
  read as a boxed "STORY MODE" plate (play.html has no style.css, so it only showed there). Added a
  `#story-root h1..h4` / `b` neutraliser; component rules still win. Verified in the lobby.
- Already in place from run 1: `S.main.viewRect()` (main.js), so `S.world.screenPos` returns CSS px.

## Still failing / open
- `headless.js load` reports `ok: false` until chapters/cast.js, places.js and c00..c10 exist; `campaign` cannot
  run yet. The lobby loader requests those 13 files on every first open (13 harmless 404s) until then.
- In the real lobby the title shows Continue / New Game / Load disabled ("No chapters…") — expected until
  chapter files land. The sandbox is reachable only in dev (`play.html?ch=99`).
- Save/load was verified with a page-only temporary chapter; re-check with chapter 0 once it exists.
- Not checked here: tools/smoke.js and tools/parity.js (no node in this environment); game.js was not changed
  in this run, so parity should be unaffected.
- Minor, left as is: the bag drill hit-stop reads 20 ms for a jab on a passive target (tune 25 ms, within the
  PDF's 20–35 ms); the self-test's "hit-stop 11.7 ms" is its sampling (value left after the hit step), not a bug.
- Window panels are quite translucent over bright scenes (readable, but a slightly darker panel would help).
