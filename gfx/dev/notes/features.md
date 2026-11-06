# Features notes: fight menu, corner coach, notes panel

Status: the three modules, extras.css, the dev page and their tests are done. Not hooked into the game: that is the list below, for after the other agents finish.
Files: `gfx/arena/menu.js`, `coach.js`, `notes.js`, `extras-ui.js` (helpers the menu and notes share, my call: one copy of ensureCss and the settings reads), `extras.css`, `gfx/dev/extras.html`, `gfx/dev/coachtest.js`, `gfx/dev/menuclaims.js`.

## The hook, every line
`site/index.html` needs NO edit: it already opens the arena with no difficulty, and "no difficulty" is what shows the menu.

### gfx/arena/index.js
1. `load()`, in `list`, add: `['menu', './menu.js'], ['notes', './notes.js'], ['coach', './coach.js']`
2. `load()`, in the `createHud` options, add: `onNotes: () => { if (S.notes) S.notes.open(); },`
3. `load()`, just before `newMatch(S);` (after `S.audio = ...`), add:
```js
S.coach = mods.coach.createCoach({ HEAD: mods.sim.HEAD });
S.coachEl = document.createElement('div');
S.coachEl.className = 'ax-x-coach'; S.coachEl.setAttribute('role', 'status');
S.coachEl.innerHTML = '<span class="ax-x-coach-who">Your corner</span><span class="ax-x-coach-text"></span>';
S.coachEl.style.visibility = 'hidden';   // held here too, so a closed strip stays hidden if extras.css never loads
S.hud.el.appendChild(S.coachEl);   // inside the HUD so the pause and end panels cover it
S.coachT = 0;
S.notes = mods.notes.createNotesPanel(S.root);
/* opts.difficulty given means no menu: that is how a test skips it */
if (!opts.difficulty) S.menu = mods.menu.createFightMenu(S.root, { touch: opts.touch, onPick: (level) => { S.opts.difficulty = level; rematch(S); }, onExit: () => closeArena() });
```
   `onPick` uses rematch on purpose: it resets the HUD and builds a new match and AI at the picked level, so the ROUND 1 banner plays when the fight really starts.
4. `load()`, near the end, just before `S.ready = true;` add (before the loop starts, so the first frame already holds):
```js
if (S.menu) { await S.menu.ready; if (S.closed) return; S.menu.show(); }
```
5. `frame()`, right after `const t0 = performance.now(), m = S.match;`, add:
```js
/* the ring is live behind the menu, the fight has not started. On a tall screen the corners are out of the camera's frame, so there the men walk to their marks first. */
if (S.menu && S.menu.isOpen && (innerWidth >= innerHeight || m.stateT >= 2)) S.hold = HOLD;
```
   With hold set the sim does not advance. In landscape the men stay in their corners, in view. In portrait the corners are out of frame (seen with the card hidden, real ring, 390x844), so the men walk in, about 1.8 s, and hold at their marks with the sim stopped short of the bell at 2.4 s. A frame is at most 1/15 s, so it cannot jump the gap. A pick then starts the match over from the corners, as a rematch does.
   Then, in the same function, change the rig line to: `S.mods.rig.FighterRig.updateBoth(S.rigP, S.rigO, m, S.menu && S.menu.isOpen ? dt : dts);`
   So the men breathe while the sim is held. Measured on the real rig: the head moves about 1 cm up and down and 3 to 4 cm sideways, sim time does not move.
6. `newMatch()`, last line, add: `if (S.coach) { S.coach.reset(); S.coachT = 0; S.coachEl.classList.remove('is-on'); S.coachEl.style.visibility = 'hidden'; }`
7. `dispatch()`, after `S.audio.onEvent(ev);` add: `if (S.coach) S.coach.onEvent(ev);`
8. `dispatch()`, in the switch, add:
```js
case 'round_end':
  if (m.state === 'break') {
    S.coachEl.lastChild.textContent = S.coach.line(m).text;
    S.coachEl.style.visibility = 'visible'; S.coachEl.classList.add('is-on');
    S.coachT = m.breakTime - .6;
    /* later step: S.coach.offerStop(m) says whether to offer "Stop the fight". Ask here, once: the load sheds during the break. */
  }
  break;
```
9. `frame()`, after `S.hud.update(m, dt);` add: `if (S.coachT > 0 && (S.coachT -= dt) <= 0) { S.coachEl.classList.remove('is-on'); S.coachEl.style.visibility = 'hidden'; }`
   The inline visibility does not stop the fade: the stylesheet's transition delays it by the fade's length.
10. `wireInput()`, in `S.onKeyDown`, right after the ctrl/meta line, add: `if ((S.menu && S.menu.isOpen) || (S.notes && S.notes.isOpen)) return;   // they hear keys on the window themselves`
    Without this Esc would pause the game behind them. The routing with this line is what the `stack` view of the dev page tests.
11. `wireInput()`, `S.onVisibility`, add to the condition: `&& !(S.menu && S.menu.isOpen)` (else a hidden tab raises the pause panel under the menu).
12. `teardown()`, before `S.hud.destroy()`, add: `if (S.menu) safe(() => S.menu.destroy()); if (S.notes) safe(() => S.notes.destroy());`
13. `makeHandle()`, add: `get menu() { return S.menu; }, get notes() { return S.notes; }, get coach() { return S.coach; },`

### gfx/arena/hud.js
14. TEMPLATE, in the `.ax-btnrow` of both `.ax-pause` and `.ax-end`, after the Exit button, add: `<button class="ax-btn" type="button" data-act="notes"><span>Notes</span></button>`
15. `act()`, add: `else if (a === 'notes') emit('notes');`
16. Header comment, opts list: add `onNotes()`.
The Tab handling in index.js and the arrow keys in hud.js collect `.ax-btn` by query, so the new button joins them with no other change. Focus returns to it when the notes close.
arena.css sets `.ax-btn` to 40 px under 480 px of height. extras.css raises `.ax-panel .ax-btn` to 44 there, so Notes and the HUD's own buttons in the pause and end panels all pass. arena.css is not edited. If it later says 44 itself, drop that rule.

### Tests and tools
- Skipping the menu: pass `difficulty`, or set `window.__arenaOpts = { difficulty: 'normal' }` before the launch (index.js merges it in underneath). Then the flow is exactly today's.
- `gfx/dev/arena.html` always passes difficulty (`P.get('ai') || 'normal'`): no change, no menu.
- Tools that set `__arenaOpts` with no difficulty, then wait for a fight, will hang on the menu. All are in the scratchpad. Add `difficulty: 'normal'` to the options on these lines:
  - `integrate/play.js:312`, `polish/play.js:324`, `polish/review1/play.js:324`, `polish/review1/play_r.js:467`: `window.__arenaOpts = { seed: 321 };`
  - `integrate/lobbycost.js:8`: `window.__arenaOpts={quality:'high',adaptive:false,seed:5};`
  - `audit/flows/fl.py:53`, the default `opts=`, and `audit/flows/s_batch.py:69`, which passes its own.
- No change needed, read to check: the normal paths of `integrate/play.js` and `polish/play.js` (`CFG.difficulty` defaults to normal, lines 143 and 378, 155 and 390), `audit/phone/run.js:19` (same default), `integrate/drive.py` (sets no options, runs play.js), `balance/verify/` (sim only), `gfx/dev/arena.html`, `tools/parity.js` and `tools/smoke.js`.
- To test the menu on the real path: leave difficulty out, wait for `arenaSession().ready`, press Enter, wait for `match.state === 'fight'`.
- After hooking, look at: the menu over the real ring at 1280x720, 844x390, 390x844; the corner's line at a real break; Notes from pause and end.

## What each module promises
- menu: levels easy, normal, hard. Arrows move and wrap, Enter or Space picks (a held key does not), Esc or Exit calls onExit, Tab stays in. Stored under `iti-arena-level`, default normal, try/catch. I added an Exit button because a touch player has no Esc. On a tall screen the card is compact, under the men's feet, with Exit beside the title.
- coach: `line(match)` -> `{ text, tag }`. Tags: self-bad, self-down-warn, self-warn, self-down, rival-bad, rival-warn, rival-down, miss, idle, guard, slip, gas, body, praise-slip, praise-clean, praise-guard, praise-body, praise-work, watch. Decisions of mine: `self-down-warn` is its own tag because offerStop is true there; `idle` added to coaching (a man who only stands or only guards); offerStop answers false outside `state === 'break'`, so false at the final bell; asking line() twice in a round gives the same line; the walk through each list carries across rematches; a new lesson comes before the same lesson again.
- coach, what may be said about a bar and about signs: `fine` lines say the bar looks fine, only at BAR_FINE (.7) or more. `bar` lines say not to go by it, only at BAR_LEFT (.5) or more. Never two of those in a row, so at most one in a match's two breaks. Signs: just past HEAD.bad a line names only what the sim does (slow guard that stops short, slow turning). Sway, long blinks and low hands wait for HEAD.bad + SIGNS_SHOW (14), where rig.js plays them. coachtest.js fails if the two rig numbers it depends on change.
- notes: `open()`, `open('credits')`, `open('conc')` or any Codex key. CX is read with `typeof CX` from the module: on the real page that is `object` with 19 keys, `window.CX` is undefined. Text never copied.

## Things I would flag
- For the main session to decide, not changed: with the sim as tuned today most rounds end with the player over HEAD.warn, so safety lines are what people mostly hear. Real rounds, 913 lines over bots and levels: self 59%, coaching 30%, rival 11%, praise 1 line, watch none. Five rematches, 72 players: 322 self, 107 rival, 160 coaching, 2 praise, 0 watch of 591 breaks. That is the priority asked for. If praise and coaching should be heard more, the answer is in the head numbers, not in coach.js.
- ai.js and sim.js were changing while I tested. Re-run `gfx/dev/coachtest.js` and `gfx/dev/menuclaims.js` when balance is done, and re-read the three menu lines against the table.

## Log (restart from here)
- Modules written and seen in Chrome. Chrome tests in the scratchpad `features/`: cdpx.py (driver, no GPU, own lock), ui_menu.py, ui_notes.py, ui_stack.py, ui_real.py.
- First builder's run, superseded below. Its "65 of 87 lines said in real play" counted 12-second rounds the game does not have, so it was wrong.
- Chrome, no GPU: menu 46 of 46, notes 79 of 79, stack 41 of 41, real page 15 of 15. Real page last run before the :has rule and the 46vw strip width. Menu and notes last run before the strip width only.
- Menu lines: my first Hard line ("jumps on you when you tire") failed menuclaims.js, he throws less when the player is tired at every level, so it was replaced.
- Not done: the hook is not applied and nothing has run on the real rig or GPU. The routing test uses a copy of the index.js key handler in the dev page. Real phones not run, touch is emulated. Small Text Size not checked.
- Screenshots deleted from the scratchpad to save disk. Re-run the ui_*.py scripts to get them again.

## Fix round after review 2 (restart from here)
Working from the failure list in `features-review.md`, Review 2. Scratch scripts in the scratchpad `features/fix2/` (first fixer, stopped at the usage line) and `features/fix3/` (second fixer: `hook_apply.py` applies this plan to copies, `rh_all.py`, `rv_hook*.py` run it on the real ring, `ui_fix.py`, `ui_strip.py`, `m_coach.py`, `m_menu.py` run on the dev page).

What changed, by failure:
1. Same few sentences (coach.js): first fixer. Bar lines no longer come first every time, never two in a row. Five rematches, 72 players: 8.1 different lines in 8.2 breaks, the two most said lines 26%. Before: 5.9 in 8.1, 51%. coachtest.js now fails if this comes back.
2. Bar looks fine over a half-red bar (coach.js): first fixer. Those lines need .7 of the bar, the others .5. Looked at the real HUD at 52, 70: 70 still reads as mostly there, 52 does not.
3. Safety tiers take most breaks: left, a decision for the main session, numbers under "Things I would flag". The false "65 of 87" is corrected in the log above.
4. False sentences (coach.js): first fixer rewrote or removed the four. I tightened praise-guard (blocks at least equal to clean shots taken). coachtest.js checks about 35 sentences against its own count of the round: 0 false.
5. Signs against the rig (coach.js): first fixer split the lists at head 14. Lines before that name only what the sim does. coachtest.js also fails if the rig's numbers change.
6. extras.css failing (menu.js, notes.js, extras-ui.js): first fixer. Checked by me on the dev page and over the real canvas: closed means `display:none`, the open menu and notes are plain but on top and usable, Enter, Esc work. I added the same for the corner's strip in the hook, it showed raw at top left.
7. Shift+Tab from the dialog (menu.js): first fixer. Checked at all three levels: goes to Exit, the mark stays.
8. Strip over a touch button (extras.css): fixed. Under 480 px high it stays centred while that fits, then slides left of the buttons. Measured clear at 21 sizes, three text sizes.
9. Notes under 44 px (extras.css): fixed by a rule for all panel buttons under 480 px high. 44 at every short size and text size. The end panel scrolls at 568x320 and 640x360, as it already did, by up to 12 px more.
10. Portrait card (extras.css, hook item 5): the review had one thing wrong. With the card hidden the men are not in the portrait frame at all while they stand in their corners, so no card layout could show them. Fix is two parts: on a tall screen they walk to their marks behind the menu, and the card is compact, under their feet. On the real ring at 390x844 both men show whole above the card (top 520, feet about 515), at large text down to the knee or so. 360x640: heads and chests.
11. Test tools list: rewritten above, every line read.
12. CREDITS.md: reworded as the builder suggested. The sentence now names both.

Also fixed, not on the list: `onEvent` threw on a `def` that is not p or o, found by the review's own fuzz. Cannot happen from the sim. And the optional breathing tweak is now a firm hook step, seen working.

Left, not done: nothing on the list except item 3, which is not mine to decide. Not checked by anyone yet: real phones, iOS Safari or WebKit, a screen reader, a fight played by hand, quality other than low.

Results of the last run: see the end of this file.
