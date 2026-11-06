# Features review (independent)

## Review 1: stopped for usage, NOT finished
The 5-hour figure read 46 at the start and 48 a few minutes later, past the task's stop line of 47, so this stopped at once. The user's own stop is 50. The window resets at 01:40 UTC. The Mac was on battery, 49%.

**No verdict.** No test or screenshot was run, so nothing below is a pass and nothing is a confirmed failure. Do not read this as approval.

### Done
- Read only: menu.js, extras-ui.js, coach.js, notes.js, extras.css, extras.html, features.md, the LEVELS table in ai.js, the Codex and tips in index.html, HUD tips, sim round-end code, index.js as far as the start of `load()`'s asset work.
- Copied the driver to scratchpad `features/review1/cdpr.py`, with its own lock. Nothing else is in that folder yet.

### Not done (all of it still to do)
- Menu: every keyboard, touch, focus and storage test, all screenshots, plates measured in real play (ai.js changed at 10:19).
- Coach: the 300+ match loop from seed 71000, tag and offerStop checks, reading each line against the Codex in full.
- Notes: live comparison with CX on the real page, focus trap, scrolling, failed fetch, CX missing, leak test, save data and G before and after, tools/parity.js signature 3bea3b59.
- Hook plan: anchors in the rest of index.js (`teardown`, `safe`, `makeHandle`, item 3 and 4 positions) and in hud.js (`act`, `emit`, TEMPLATE) not checked.

### Leads from reading only, each unconfirmed: check these first
- Coach: "takes his wind", "slows his hands down later", "Every miss costs you wind" are claims about the game. Check them against PUNCHES and TUNE in sim.js.
- Coach: the `bar` lines say "looks fine" at half a bar (BAR_FINE 0.5). See whether that reads as true on screen.
- Menu: with no focus, Shift+Tab goes to the third plate, not Exit (index -1 in the wrap sum). Minor if confirmed.
- Menu and notes: the element is hidden only by the stylesheet, so if the CSS fails to load, hide() may leave it visible.
- Notes: renderMarkdown has no numbered lists, rules or blockquotes. Check against what CREDITS.md really contains.
- Notes: at 844x390 and large Text Size the fixed header may leave little scroll room. Measure it.
- Plates against the LEVELS table only: easy react .27, slipRead .05, ease 2.6; normal react .18, slipRead .22, finish .6; hard react .13, mistake .02, finish .7, finishGap .25. The table fits the three lines. "Rarely wastes a punch" still needs a whiff rate from real play.
- Hook anchors seen and present so far: `list` and `createHud` options in `load()`, `newMatch`, `dispatch`, `frame`, `S.hold`, `HOLD`, `rematch`, `closeArena`, `S.onKeyDown`, `S.onVisibility`.

### To restart
Run the "Not done" list above after the usage window resets.
