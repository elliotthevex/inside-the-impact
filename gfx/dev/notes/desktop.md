# A fight on a computer: cursor, focus, fullscreen, graphics, sound, Q, big monitors

Status: in progress. Restart: read this file, `gfx/arena/desktop.js`, and the test scripts in the scratchpad `desktop/` (t1 cursor, t2 focus, t3b fullscreen, t4 graphics).

## Decisions
- New file `gfx/arena/desktop.js` holds cursor, focus, fullscreen, graphics and sound, so index.js only has short hook lines. Its selector for "a panel is up" already names the menu and notes panel of the other workflow.
- Graphics and Sound controls exist on keyboard devices only. Touch controls and the touch pause panel stay as they are.
- Any leaving of fullscreen during play pauses, also by F or the icon: the task says so and it needs no special cases.
