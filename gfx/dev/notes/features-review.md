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

## Review 2 (second reviewer, independent)
Everything here was run and measured. Scripts and screenshots are in the scratchpad `features/review1/` (coach_loop.js, coach_final.txt, coach_counts.js, session.js, session2.js, claims.js, claims2.js, rv_menu.py, rv_menu2.py, rv_notes.py, rv_notes2.py, rv_stack.py, rv_real.py, rv_small.py, hook_apply.py, rv_hook.py, rv_hook_touch.py, rv_hook_breathe.py, hook_run.txt, hook_touch.txt, whatif/coach.js, shots/). No project file was edited except this one. sim.js and ai.js kept changing during the review (last at 11:37 and 11:40). The coach numbers below are from those versions. The plate numbers are from 11:26 and 11:29, and the sentences that can be false were seen across the runs.

**Verdict: not passed. Two visible failures, both in coach.js, both a small fix. No blocker.** Menu, notes, dev page and the hook plan hold up.

### Visible
1. **The corner says the same two sentences.** `say()` (coach.js:313) takes the `bar` list first whenever the bar counts as fine, each `bar` list has two lines or fewer, and a match has at most two breaks. So the `any` lists, which hold the Codex substance, are reached only under half a bar.
   - 684 full matches, seeds from 71000, 928 lines: 41 of 87 lines said, 46 never.
   - self-warn: 372 of 375 calls are the same two lines. The other eight lines ("Signs can show up late", "Feeling fine is not clearance", "Head shots add up", "Fighters hide this stuff", "Rest and water") share the other 3 calls.
   - rival-warn: 47 of 47 are one line.
   - One player over five rematches (72 sessions): 8.1 breaks, 5.9 different lines, the two most-said lines are 51% of breaks. So features.md's "the walk through each list carries across rematches so they sound different" does not hold in practice.
   - What a first-time player hears, `skilled` on Hard: "Bar looks fine, but your guard's coming up late..." and "Don't trust the bar..." in turn, for all eight breaks of five matches. See `session2.js`.
2. **"Your bar looks fine" over a half-red bar.** BAR_FINE is 0.5 (coach.js:21). Those lines fire at hp 50 and up: 602 of 928 lines, p10 54, median 63. On screen near half the bar is red at that point, while the game's lesson depends on the bar really looking fine. Screenshot `shots/bar_fine_hp52.png`. The same applies to "His bar looks fine".

Both go with two lines. In `whatif/coach.js`, not applied: BAR_FINE .7, and at most one `bar` line per match. Same 72 sessions: 8.1 different lines in 8.1 breaks, the two most-said lines 25%, and "Signs can show up late", "Feeling fine is not clearance" and "Head shots add up" are heard in the first five matches. Re-run coach_loop.js after any change.

### Minor
- Safety tiers take most breaks: self 69%, rival 6%, coaching 25%, praise and `watch` 0 of 928 at real round length. That is the priority the brief asks for and the builder flagged it; the answer is in the head numbers. features.md's "65 of 87 lines said in real play" counts 12-second rounds the game does not have. A decision for the main session, not a bug.
- Sentences that can be false. "Nothing to the body that round." with 2 body of 50 thrown (skilled, normal, 71006, r1; BODY_RATE .05). "Good mix, head and body." with 0 head and 14 body (my bodyman bot, easy, 71003, r3, 14-second rounds). "You hit him more than he hit you, and cleaner." at 8 landed each (learner, hard, 71004, r2; 4 of 11 in short rounds). "A guard alone won't win you the round." to a man who never guarded (idle, easy, 71007, r1; 1 of 6). None is medical.
- Signs against the rig. 42 of 263 self-bad lines are at head 13 to 14. The rig only plays long blinks past 14 (rig.js:441, `bad > 0.5`) and sway ramps over 13 to 15 (rig.js:240), so "swaying and blinking slow" is barely true there. The rig holds its own numbers, so this is not coach.js alone.
- extras.css failing to load: `display = ''` after `ready` leaves the closed menu and notes as raw markup, and `hide()` cannot hide them. `shots/css_blocked.png`, dev page only. Not tried over the real canvas. Rare. Lead confirmed.
- Menu: with focus on the dialog itself (a click on the card), Shift+Tab goes to Hard and moves the mark, not to Exit. Forward Tab is right. Lead confirmed.
- Corner's line covers part of a touch button at small landscape: 667x375 JAB 35x9 px, 35x27 at large text; 568x320 33x53. pointer-events none, and only during a break. 844x390 and 390x844 clear. `shots/coach_667x375_large.png`.
- The Notes button from the hook is 40 px tall at 844x390 (43 at large), under 44, like the HUD's own buttons there. `shots/hook_pause_844_touch.png`. arena.css owns that rule.
- Portrait menu on the real ring: the card covers the men, only rafters show above it. `shots/hook_menu_390_real_touch.png`. Landscape is good: `shots/hook_menu_1280.png`, `shots/hook_menu_844.png`.
- Hook plan, test tools list is loose. `integrate/drive.py` sets no `__arenaOpts`, and play.js's normal paths already pass difficulty. The ones that would hang on the menu: `integrate/play.js:312`, `polish/play.js:324`, `integrate/lobbycost.js:8`, `audit/flows/fl.py:53` (default opts).
- CREDITS.md still says entries "unlock as you meet them in a bout" inside a panel that shows them all. The builder flagged it; confirmed.

### Checked, no failure
- **Coach loop**: 19 bots (idle, turtle, runner, learner, mixed, skilled, guardjab, spam on all six punches, plus my noguard, whiffer, slipper, bodyman, hitrun, gasser) on all three levels, 12 seeds each. Failures 0: never empty, no digit or number word, no repeat in a match, longest 14 words, second ask same, safety tags fire when and only when their state holds against my own knockdown counts, offerStop exact (230 true, 230 wanted). Coach's own counts equal mine per round and per match over 183 rounds. Forced three-round states never dry. Short rounds reach the praise lines.
- **Every line read twice**, as a player and against CX, TP and the HUD tips: no fight-through, no diagnosis, no number, no invented medical fact. One soft spot only: "A knockdown's a reason to get checked" is my reading of CX.conc and CX.sic, not a Codex sentence. It is reasonable.
- **Game claims in the lines**: true. Body shots: rival stamina 63 against 87 for jabs, tired 28% of the time against 2%. Every throw costs stamina, hit or miss (sim.js `_throw`).
- **Plates** true of ai.js in play, by same-seed comparison with the setting changed. Easy: 0.1 to 0.4 slip attempts per 100 head shots (Normal 2.4 to 4.9, Hard 3.7 to 6); throws 32.5 a minute when ahead against 41.3 with ease 0. Normal: 54.1 a minute on a hurt man against 45.2 with finish 0. Hard: 54.8 against 40.1. Hard whiffs 7 to 9 per 100, least of the three (Easy 16 to 18, Normal 11 to 14). "Pounces the moment" is flavour: time to his next throw is 0.55 s on Hard, 0.57 s on Normal.
- **Menu**: keyboard only, touch only, Esc, held keys, double click and double Enter pick once, localStorage throwing three ways, seven bad stored values, focus at each step, focus ring. Double click on Exit calls onExit twice on the dev page, harmless in the game (closeArena is idempotent, the menu is destroyed by the first). 9 screen sizes × text normal and large × touch: all on screen, targets at least 44, no clipping. Small text at 3 sizes.
- **Notes on the real page**: `typeof CX` object, `window.CX` undefined, 19 of 19 titles and bodies exact, none open, none locked, order right. Disclaimer sentences verbatim from `#about`. G, localStorage, sessionStorage byte-identical before and after. Parity 3bea3b59 before and after. Site CSS leaks: none across 38 properties on 42 selectors against the dev page.
- **Notes behaviour**: focus moves in, full lap of Tab both ways stays inside (40 stops), focus thrown out comes back, Esc, held Esc, focus return, wheel, ArrowDown, PageDown, Space, End, Home, touch drag, tap to open. Blocked fetch, 404, rejected and hanging fetch all say so and keep working, and it retries on next open. CX missing or odd shapes say so. Hostile Codex and Markdown stay inert. Reduced Motion by body class, OS and settings store: no animation. 300 open and close: listeners balanced, no new fetch, DOM stable, focus returned every time. Scroller is at least 56% of the screen (568x320 large), 67% at 844x390 large, so that lead is closed. CREDITS.md has no numbered lists, rules or blockquotes, and every heading, bullet, row, fence and link renders, so that lead is closed too.
- **Hook plan, applied literally to copies of index.js and hud.js** (`hook_apply.py`: every anchor found exactly once, also after hud.js changed at 11:30) and swapped in on the wire, on the real page, real launcher, real arena, GPU, quality low. Keyboard (`hook_run.txt`) and touch (`hook_touch.txt`), both all pass with no page errors: menu over the ring, men still and sim held while frames run, pick sets the AI level and stores it, ROUND 1 banner plays after the pick, fight starts, corner's line at a real break matches `coach.line`, hidden when the next round runs, not shown at the final bell. Notes from pause and end, Esc closes only notes, focus back on the button, next Esc resumes or exits. Rematch keeps the level with no menu. Second open lands on the remembered level. Esc and Exit from the menu close the arena. `difficulty` given means no menu. G unchanged, only `iti-arena-level` added, parity 3bea3b59. `index.html` needs no edit, as the plan says. A person could apply the plan without guessing.
- Live host serves `.md` raw (`README.md` 200 text/markdown on pages.dev), so the credits fetch should work there. CREDITS.md itself is not on main yet.

### Not checked
- Real phones, iOS Safari or any WebKit: touch is Chrome emulation only (`touch-action`, `:has`, `details` in WebKit).
- A screen reader.
- A fight played by hand from start to finish. In the real-arena runs a bot played and I set the clock and head load to reach the states quickly.
- Quality other than low on the real arena.
- The optional tweak in hook item 5 (let the men breathe by passing `dt` to `updateBoth` while the menu is open). `rv_hook_breathe.py` is written, but the GPU lock was not free after 420 s. Without the tweak the men stand frozen, which looks fine in the screenshots.
- The Mac was on battery the whole run, 43% at the start and 20% at the end, about 53 minutes left. Someone should plug it in.

## Review 3 (third reviewer, independent)
Scripts and pictures in the scratchpad `features/review2/`. Written from this reviewer's own reading of the task; `hook_apply.py` applies the plan from features.md's text. No project file edited except this one.
Run on files as they stood 20:40 to 22:15 KST. sim.js last changed 20:11, ai.js 21:29, hud.js and arena.css during the review.

### Review 3, findings (22:15 KST). **Verdict: not passed. One visible failure, a small fix. No blocker.**
Visible:
1. **A late stylesheet leaves the menu dark and in the wrong font for good.** If extras.css has not arrived when the menu shows (`ensureCss` gives up after 2.5 s), `rawFallback` (extras-ui.js) writes `background: rgba(3,4,6,.9)` and `font: 16px/1.35 system-ui` inline, and nothing removes them when the sheet arrives. The ring barely shows and the type is not Barlow. It happened by itself on the real arena at load average 124: `features/review2/shots/g_menu_1280.jpg`. Reproduced on the dev page by holding extras.css back (`t_late.py`): at 1.5 s fine; at 3.5 s the sheet is in, line font `system-ui, sans-serif`, background `rgba(3, 4, 6, 0.9)`, and it stays after close and show again, `shots/late_3_5.png`. Good look for comparison: `features/fix4/shots/hook_menu_1280.jpg`. features.md lists this as reasoned, not run; now it has been seen. Rare for a player, only a slow or flaky load, but then it is the first thing they see. Fix: clear the fallback's inline styles when the link's load event comes. Notes shares the helper but opens long after the sheet is in.

**Outside these files, for the record:** from 21:28:38 until some time between 22:05 and 22:09, `gfx/arena/hud.js` (another agent's edit) used `wCalm` with no declaration: `ReferenceError: wCalm is not defined` on the first `update`, seen on the dev page, `view=stack`. Its owner has since declared it at line 211. Any real-arena result from that window, by any agent, is suspect. My hook runs used a copy of hud.js from before that edit, so the new `is-calm` touch-button fade has not been run with the menu or the strip.

Minor:
- Hook plan's tool list misses `audit/phone/run_retry.js:7`, `audit/phone/run_stall.js:7`, `audit/flows/s4.py:14` (`manual:true`, no difficulty: its `h.step` loop never ends under the menu) and `release/play.js:312` (new at 21:08, same line as `integrate/play.js:312`). The rest of the plan applied from its text alone: `hook_apply.py` "problems: none" on today's index.js and hud.js.
- Praise and `watch` almost never fire in real 60-second rounds. 72 players, five rematches, 583 breaks: self 383, coaching 148, rival 52, praise 0, watch 0. Same point as "Things I would flag" in features.md: a decision, not a bug.
- `view=coach` on the dev page shows no strip until a test calls `showCoach` or `playCoach` (`strip: false` on load).
- Double click on Exit calls `onExit` twice on the dev page (count 2). `closeArena` is idempotent, so harmless in the game.
- "slips some" on Normal is thin: 1.2 to 2.2 slips per 100 head shots, one or two a match (Easy 0.1, Hard 2.4 to 3.2). True against Easy.
- With Notes added, the end panel starts below the fold at small landscape: 568x320 large text 455 of 320 (Rematch itself is cut, `shots/pn_end_568_l.png`), 640x360 403 of 360. A finger drag reaches every button.
- 83 of 113 of the player's own sign lines name a guard or covering up, which reads oddly to a man who never pressed guard. Not false: the guard really is slower.

Checked, no failure:
- Coach, `loop.js`, 21 bots (idle, turtle, runner, learner, mixed, skilled, guardjab, spam on six punches, my noguard, noslip, flee, whiffer, bodyman, gasser, slipper) on three levels, seeds from 71000. 360 matches at 60-second rounds (490 lines), plus 1200 at 14, 25 and 7 seconds (3258 lines). Never empty, no digit, no number word, no repeat in a match, longest 14 words, second ask same, safety and rival tags exact against my own knockdown counts, offerStop exact (121, 36, 48, 2 true of the same wanted), sentences true against my own round counts, `fine` lines only at 70 or more, `bar` lines only at 50 or more, sway, blink and low-hand lines only at head 15 or more. Forced states: 120000 lines, 0 problems. The two faults that failed Review 2 stay fixed: 7.9 different lines in 8.1 breaks, top two 28% (was 5.9 and 51%).
- Every line read as a player and against CX, TP and the HUD tips: nothing tells a man with a head sign to fight on, no diagnosis, no quantity, no invented medical fact. Rival lines never urge finishing him.
- Plates, `plates.js`, `ease.js`, `menuclaims.js`: react .27, .18, .13. Slips per 100 head shots 0.1, 1.2, 2.4. Hard wastes least, whiffs 7 to 10 per 100, others 12 to 14. On a hurt man 53 and 60 a minute against 38 on Normal and Hard. Easy with `ease` on hardly ever gets a landed lead (learner 1 s), with `ease` 0 it does (124 s). My first measure looked false (59 against 42 a minute at an hp lead) because a lead on the bar usually means a hurt man; with the hurt man taken out it holds.
- Menu, `t_menu.py`, `t_menu2.py`, `t_misc.py`: keyboard only, touch only, Esc, held keys, double activation, focus at each step, blur then keys, three kinds of storage failure, ten bad stored values, API idempotent, 300 shows with listeners balanced (602 added, 602 removed). 12 sizes by three text sizes by touch and keys, plus 240x320 to 3840x2160: on screen, targets at least 44, nothing clipped. Pictures looked at: 1280, 844, 390, 360, 568, normal and large. On a first show with no key pressed yet there is no focus ring, only the gold plate frame; the ring comes with the first key.
- Notes, `t_notes.py`, `t_notes2.py`, `t_notes3.py`, `t_real.py`, `t_pd.py`: real page, 19 of 19 titles and bodies exact, none open, none locked, order right, `typeof CX` object from a module, `window.CX` undefined. Disclaimer sentences verbatim from `#about` in game.js. Tab lap both ways, focus thrown out comes back, Esc, held Esc, focus return, Close by key and mouse, wheel, ArrowDown, PageDown, Space, End, Home, finger drag, tap. Blocked, 404, rejected and hanging fetch say so and keep working, retries on next open. CX missing or odd says so; hostile Codex and Markdown stay inert. 300 open and close: 900 listeners added, 900 removed, no refetch, DOM stable. Reduced Motion by body class, data attribute, OS, settings store: nothing moves. 12 sizes by three text sizes with all entries open: nothing clipped, bottom reachable, scroller at least 56% of the screen. Site CSS: 23 notes and 8 menu selectors over 26 properties, real page against dev page, one difference, a focus ring. G, ST, uiPrefs, sessionStorage identical, localStorage only adds `iti-arena-level`, parity 3bea3b59 before and after.
- Strip, `t_strip.py`: 14 sizes, two text sizes, longest line: on screen, clear of touch buttons and banner text.
- Real arena, hook from my own script, GPU, quality low, `g_keys.py`, `g_focus.py`: menu over the ring, 58 fps under it, sim held, game keys inert, hidden tab no pause, Esc closes, one extras.css link, pick sets level and store, hint back in the fight. Notes from pause: PageDown, ArrowDown, End, Home, wheel all scroll. Portrait 390x844: stateT stops at 2.01, tap picks, touch controls back.
- First `g_keys.py` run failed three checks and hung on a wheel event, at load average 124: the sim moved 0.2 s in 14 s. `g_focus.py` at load 46 ran the same checks at 58 fps and they passed. Not a defect. Numbers from a loaded machine mean nothing here.

- Real arena, `g_strip.py`, load 30, 60 fps: the corner's line at a real break equals `coach.line`, stays through pause and Notes, goes by itself before the next round. Tab reaches Notes in the pause and end panels, Esc closes only the notes, focus back on Notes, next Esc resumes or exits. Restart hides the strip, no menu, level kept, round 1. Referee stop: no strip on the end panel. `difficulty` given: no menu, fight starts in 2.8 s. G unchanged, only `iti-arena-level` changed, parity 3bea3b59, no page errors. Clock and head load were set to reach those states quickly.

Not checked by me: real phones, WebKit, a screen reader, a fight played by hand, a whole match at real clock on the rig, touch on the real arena at 844x390 (the touch run was stopped for load and usage; portrait tap was run), context loss under the menu, Esc on the load screen, other qualities, extras.css blocked on the real arena (fixers did it), hook with hud.js as it is now.
