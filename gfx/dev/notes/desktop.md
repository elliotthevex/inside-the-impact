# A fight on a computer: cursor, focus, fullscreen, graphics, sound, Q, big monitors

Status: done. All eight items built and looked at on the real page, gates pass, a whole match on high by real keys ran to the end panel. Code committed on realistic-3d, not pushed.
The Mac's lid closed at 01:15:42 on 2026-11-08 and it then woke for about 40 s every 17 minutes. The last checks (t8.py, t9.py) were run in those windows with waits on the monotonic clock, so sleep did not count as waiting.
Restart: read this file and `gfx/arena/desktop.js`. Test scripts are in the scratchpad `desktop/`: t1 cursor, t2 focus, t3b and t6 fullscreen and Esc, t4 graphics, t5 sound, t7 big monitors (`t7.py large` for large text), gates.sh, cfg_main.js (the whole match on high), play_q.js with cfg_q.js (a match guarding with Q). They use fl.py and common.py from the flows audit.

## Decisions
- New file `gfx/arena/desktop.js` holds cursor, focus, fullscreen, graphics and sound, so index.js has only short hook lines. Its selector for "a panel is up" already names the menu and notes panel of the other workflow, so nothing needs changing there when that work is merged.
- Graphics and Sound controls exist on keyboard devices only. Touch controls and the touch pause panel stay exactly as they were. A touch device also ignores the two stored choices, because it has no control to change them.
- Any leaving of fullscreen during play pauses, also by F or the icon. The task says so and it needs no special cases.
- Sound off in the page's settings (Effects 0 or the sound checkbox): the Sound control is greyed out and says why, and M only shows a short note. It does not change the page's settings or the stored choice.
- Low Detail on in the page's settings: Graphics is greyed out on Low and says why. The stored choice is kept for when it is turned off.
- The options in the pause panel are ordinary `.ax-btn` buttons after the button row, so the existing Tab and arrow code walks them. Arrows move, Enter or a click applies. Resume still takes the first focus.
- M shows a short note under the clock for 1.2 s when no panel is up, because silence alone says nothing on a quiet moment.
- Big monitors: CSS `zoom` on `.ax-hud` by `--ax-k`, which hud.js sets to min(width/1920, height/1080) above 1920x1080 and nowhere else. In Chrome zoom also grows viewport units, so the sizes with no px cap divide by `--ax-k`: `--bn-s` (read `--bn-size` through it), the banner band, burst, count number and sub line. The fight menu and notes panel are appended to the root, so arena.css gives them the same zoom. The coach strip sits inside `.ax-hud` and must not get it twice.

## For the merge with phone-fixes
- index.js hooks are one line each. `S.onKeyDown` gets `if (S.desk && S.desk.key(code, e)) return;` after `const code`; their menu line goes before it, so F and M do nothing while the menu or notes are open.
- `gfx/arena/menu.js` still lists only Shift for Guard in its short how-to line. I may not touch that file. Whoever merges can add Q there.
- In a new `ax-prefs` block under the button row of the pause panel: their Notes button goes in the button row and is walked by Tab the same way.

## What was run and seen (real page, headless Chrome, trusted keys and mouse over the DevTools protocol)
- Cursor: stays through the load screen, hides 1.5 s after ready, comes back on a real move, not on a same-spot event, shows at once on pause and the end panel, hides again after Esc and rematch. After Exit and after a crash into the old arena the page's cursor is auto.
- Focus: a real window blur with the tab visible (hasFocus false, hidden false) pauses with the panel, clock held, and it does not resume when focus returns. Nothing happens on the pause or end panel. A click right after the window comes back does not press a panel button. A blur that comes and goes within a fullscreen change does not pause; one that stays does, after it settles. A whole match in drive.py (no focus emulation) ran with no stray pause.
- Fullscreen: real fullscreen in headless once `Page.bringToFront` has run with focus emulation off, 1280x633 to 1920x1080. F and the icon go in and out, leaving pauses, Exit leaves it, a refused or throwing request shows nothing, the prefixed call works. Camera step across the change at most 0.016 m, field of view unchanged. Paused while the size changes: the picture stays.
- Esc, with the real lock: `lock(['Escape'])` resolves, an Esc tap reaches the page, pauses and stays in fullscreen, a second one resumes, holding it 3 s pauses first and then Chrome leaves fullscreen. Without `navigator.keyboard`: Chrome takes Esc, the page sees no key, fullscreen ends, the fight pauses and stays paused.
- Graphics: Tab order Resume, Restart, Exit, Auto, High, Medium, Low, Sound. Arrows move without applying, Enter applies. All six directions between low, medium and high by mouse: no GL error, right level, 1 s of play after each, and the frames look right, mean level 52 to 54 in all of them. Next open uses the choice with adaptive off. Auto goes back to what the machine picks with adaptive on. Junk stored and storage that throws both fall back cleanly, and a choice still lasts the visit. Low Detail wins over a stored High and frees it again when turned off. With the picture lost the options are disabled.
- Sound: M mutes at once (rms to 0), M again returns to the page's Effects volume (0.7, and 0.35 with Effects 35). A held M is one press. The panel control works by click and Enter. Stored and used on the next open. ST.fxvol and uiPrefs.sound never change.
- Guard: Q held raises the guard to 1, also after a pause while still held. A whole match on low with the bot guarding only by Q: skilled bot won by KO. Shift still works: pause flow check and the match on high.
- Big monitors: every HUD element's rectangle relative to the screen at 2560x1440 and 3840x2160 against 1920x1080, in round, fight, note, down, pause, load, time, TKO, end: none off by more than 0.4% of the screen, apart from a count number caught mid animation. Frames looked at for each state at all four sizes.
- Key list: Shift and Q on load, hint and pause. F and M on the pause panel only, on their own row.
- Gates on the final code (2178f81, nothing but notes changed after): jscheck ALL SCRIPTS PARSE, parity 3bea3b59, smoke pass true, 20 run. Whole match on high by real keys on the real page, bot mixed, seed 97201: ended by TKO in round 3, end panel, gl error 0, no page errors.
- Touch at 844x390 (t8): no fullscreen icon, no Graphics or Sound row, no note, no --ax-k, pause icon 44 px as before, touch note unchanged. F and M do nothing, the cursor never hides, a blur does not pause. Jab button, stick, Guard, pause icon and Resume by real touch events all work.
- Large Text at 3840x2160 against 1920x1080 (t8): no element off by more than 0.4% of the screen in the fight or the pause panel. Frames looked at.
- Reduced Motion (t8): the cursor hides, M's note shows at full opacity with no transition, M in the pause panel clears it. Camera Shake off still reaches the camera.
- Away while loading (t8): a blur during the load screen that is still away when the fight is ready starts it paused; Esc resumes.
- Context restore (t8, t9): options disabled while the picture is lost, enabled again after restore. Low, High and Medium after a restore all draw correctly (frames looked at). The first switch after a restore leaves one INVALID_OPERATION (1282) flag: three.js deletes the old film targets, whose GL objects belong to the lost context. Later switches and play read 0. Not fixed: harmless, and the adaptive step had the same path before.
- Fallback (t8): an asset that fails lands in the old arena, no overlay left, cursor auto. Two opens and exits add 14 listeners, exactly what Mode Select alone adds twice: nothing from the arena.

## Known limits
- A GPU that cannot draw the film path shows black on a manual High or Medium. The panel still works and Auto or Low brings the picture back. Auto never picks those there.
- A live switch changes the film path, lights, crowd count, shadow size and effects. Texture size and the context's antialias flag need the next open, as with the adaptive step.
- Nobody has played this by hand. Fullscreen is real Chrome but headless: the macOS and Windows window animations have not been seen. Firefox, Edge and Safari were not run. Windows Sticky Keys was not run; Q is simply a key that does not trigger it.

## Check
Independent check, headless Chrome over the DevTools protocol with real key and mouse events. Scripts and frames: scratchpad `desktop/check/` (a.py to f.py). Nothing in game code was changed.
- Gates: jscheck ALL SCRIPTS PARSE, parity 3bea3b59, smoke pass true, 20 run.
- Focus lost with the tab visible pauses with the panel, clock held, in: normal fight, knockdown of the player, slow motion after the opponent goes down, the break between rounds, the instant the round clock is at 0.02. Focus back does not resume. (An early run seemed to show no pause. That was the test toggling focus off and on without a pause between, so no blur event fired. Not a game fault.)
- F during load enters fullscreen with no error; M during load throws nothing. Ctrl+F is ignored by the page code (already in fullscreen in that run, so only read, not seen).
- Guard: Q then Shift, released in either order, keeps guard 1 until the last one is up. Q released during a pause gives guard 0 after resume. Q with key "ㅂ" (Hangul) guards.
- After Exit from fullscreen on the pause panel: fullscreen off, no arena left, cursor auto.
- localStorage that throws on get and set: M, pause and Resume work, no page error. I did not click a Graphics option in that run (selector miss).
- 1024x768: fullscreen icon sits right beside the pause icon (34 px each, 478-546), pause panel prefs row inside the screen. Touch emulation 844x390: no fullscreen icon, no prefs row.
- Result: no blocker or visible failure found.
- Not checked by me: 2560x1440 and 3840x2160 layout, Large Text, 1366x768 and 1920x1080 frames, graphics switching in each direction and the Low Detail override, a new complete match by real keys, cursor after a rematch, F in the count and end panel, Esc in fullscreen. I rely on the earlier notes for those.
