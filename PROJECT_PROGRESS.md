# Project progress: Street Fight 3D

Checkpoint file. Read this first when resuming. Design and interfaces are in `gfx/DESIGN.md`.
Work is on git branch `realistic-3d` in `site/`. Do not push or merge to `main`: a push to `main` deploys live.

## Status
Phase: building the foundation for the 3D 1v1 game.
Usage rule: stop at 75% of the 5-hour window (`mcp__ccd_session_mgmt__get_usage`). Last check: 46%, resets 2026-11-05 19:20 KST.

## Scope note
The user's latest brief is Street Fight 3D, a complete 1v1 arena game. It takes priority over the earlier whole-game overhaul brief (20 screens to realistic 3D).
That overhaul is parked, not cancelled. Its reference notes are partly done: `scratchpad/notes/` has css1-5, js01-03, js05; the rest was stopped to save usage.

## Completed and tested
- Fighter asset, skin, gloves, trunks, boots, film pipeline, mocap retargeting: checked by test render only, not yet in the game.

## In progress
- Everything in the module map in `gfx/DESIGN.md`.

## Remaining, in the brief's priority order
1. 3D environment 2. Boxing arena 3. Player character 4. Opponent character 5. WASD movement 6. Footwork and animation 7. Dynamic camera 8. Health 9. Stamina
10. Combat 11. Opponent AI 12. Collision and physics 13. Tekken-style HUD 14. Impact effects 15. Rounds and match 16. Audio 17. Performance 18. Full testing

## Known bugs
- Old canvas arena: `reference/arena-combat-audit.json` lists measured combat defects. Session `arena-combat-fixes` is handling that on its own branch.

## Files changed
New: `gfx/`, `assets/`, `vendor/three/`, `tools/gfx/`. `index.html` not yet touched.

## Last successful test
Test render of the fighter through the film pipeline in headless Chrome (`gfx/dev/ref/look-target.png`).

## Next task
Run the foundation build: engine, room and ring, rig, sim and AI, HUD, audio, effects, then integrate.
