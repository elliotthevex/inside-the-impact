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
5. `frame()`, first line, add: `if (S.menu && S.menu.isOpen) S.hold = HOLD;   // the ring is live behind the menu, the fight has not started`
   With hold set the sim and rig time do not advance. Camera, room, HUD timers run. The men stand still at their corners. To let them breathe, try passing `S.menu && S.menu.isOpen ? dt : dts` to `updateBoth`; I could not check that here (needs the GPU), so look at it before keeping it.
6. `newMatch()`, last line, add: `if (S.coach) { S.coach.reset(); S.coachT = 0; S.coachEl.classList.remove('is-on'); }`
7. `dispatch()`, after `S.audio.onEvent(ev);` add: `if (S.coach) S.coach.onEvent(ev);`
8. `dispatch()`, in the switch, add:
```js
case 'round_end':
  if (m.state === 'break') {
    S.coachEl.lastChild.textContent = S.coach.line(m).text;
    S.coachEl.classList.add('is-on');
    S.coachT = m.breakTime - .6;
    /* later step: S.coach.offerStop(m) says whether to offer "Stop the fight". Ask here, once: the load sheds during the break. */
  }
  break;
```
9. `frame()`, after `S.hud.update(m, dt);` add: `if (S.coachT > 0 && (S.coachT -= dt) <= 0) S.coachEl.classList.remove('is-on');`
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

### Tests and tools
- Skipping the menu: pass `difficulty`, or set `window.__arenaOpts = { difficulty: 'normal' }` before the launch (index.js merges it in underneath). Then the flow is exactly today's.
- `gfx/dev/arena.html` always passes difficulty (`P.get('ai') || 'normal'`): no change, no menu.
- Anything that opens the real page through the Mode Select card and then waits for a fight will hang on the menu (the sim holds until a pick). Scratchpad tools to change: `integrate/play.js`, `integrate/drive.py` and their `cfg_*.js`, and any `polish/` or balance tool using the real launch path: add `difficulty: 'normal'` to the `__arenaOpts` they already set. `tools/parity.js` and `tools/smoke.js` do not open the arena: no change.
- To test the menu on the real path: leave difficulty out, wait for `arenaSession().ready`, press Enter, wait for `match.state === 'fight'`.
- After hooking, look at: the menu over the real ring at 1280x720, 844x390, 390x844; the corner's line at a real break; Notes from pause and end.

## What each module promises
- menu: levels easy, normal, hard. Arrows move and wrap, Enter or Space picks (a held key does not), Esc or Exit calls onExit, Tab stays in. Stored under `iti-arena-level`, default normal, try/catch. I added an Exit button because a touch player has no Esc.
- coach: `line(match)` -> `{ text, tag }`. Tags: self-bad, self-down-warn, self-warn, self-down, rival-bad, rival-warn, rival-down, miss, idle, guard, slip, gas, body, praise-slip, praise-clean, praise-guard, praise-body, praise-work, watch. Decisions of mine: `self-down-warn` is its own tag because offerStop is true there; `idle` added to coaching (a man who only stands or only guards); offerStop answers false outside `state === 'break'`, so false at the final bell; asking line() twice in a round gives the same line; the walk through each list carries across rematches so they sound different; a new lesson comes before the same lesson again.
- notes: `open()`, `open('credits')`, `open('conc')` or any Codex key. CX is read with `typeof CX` from the module: on the real page that is `object` with 19 keys, `window.CX` is undefined. Text never copied.

## Things I would flag
- `CREDITS.md` says the Codex entries "unlock as you meet them in a bout". True of the career game, but it now shows in a panel where all of them are open. Suggested wording: "In the career game they unlock as you meet them in a bout. The notes panel in Street Fight shows them all." Not changed.
- With the sim as tuned today most rounds end with the player over HEAD.warn, so the safety lines are what people mostly hear, and fight coaching is the minority. That is the priority asked for, and it follows from the balance, but if coaching should be heard more the answer is in the head numbers, not in coach.js.
- ai.js and sim.js were changing while I tested. Re-run `gfx/dev/coachtest.js` and `gfx/dev/menuclaims.js` when balance is done, and re-read the three menu lines against the table.

## Log (restart from here)
- Modules written and seen in Chrome. Chrome tests in the scratchpad `features/`: cdpx.py (driver, no GPU, own lock), ui_menu.py, ui_notes.py, ui_stack.py, ui_real.py.
- Final run. JavaScriptCore: 798 matches, 1699 line calls, 0 failures (never empty, no digit, no number word, no repeat in a match, safety tags match state both ways, offerStop matches, own counts equal the sim's). Forced and random states: 0 failures. 65 of 87 lines said in real play.
- Full rounds tags: self-warn 431, self-bad 240, guard 95, idle 55, slip 36, rival-warn 33, miss 27, rival-bad 12, gas 11, body 3, watch 1. Short rounds (12 s, to keep head load low) add praise-clean 9, praise-body 9, praise-work 6, praise-slip 2.
- Never fired in real play, only in forced and random states: self-down, self-down-warn, rival-down, praise-guard.
- Chrome, no GPU: menu 46 of 46, notes 79 of 79, stack 41 of 41, real page 15 of 15. Real page last run before the :has rule and the 46vw strip width. Menu and notes last run before the strip width only.
- Menu lines: my first Hard line ("jumps on you when you tire") failed menuclaims.js, he throws less when the player is tired at every level, so it was replaced.
- Not done: the hook is not applied and nothing has run on the real rig or GPU. The routing test uses a copy of the index.js key handler in the dev page. Real phones not run, touch is emulated. Small Text Size not checked.
- Screenshots deleted from the scratchpad to save disk. Re-run the ui_*.py scripts to get them again.

## Fix round after review 2 (in progress, restart from here)
Working from the failure list in `features-review.md`, Review 2. Scratch scripts in the scratchpad `features/fix2/`. Status lines below are updated as each item lands.
- Started 11:50 KST, Mac on battery (20%). Nothing changed yet.
