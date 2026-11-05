# Parked brief: redesign the whole game from pixel art to realistic 3D

Status: parked, not cancelled. The user's later brief ("Autonomous game development, continuous execution mode")
takes priority: finish Street Fight 3D, which opens from the 1v1 Arena card. This file holds the earlier brief because it
existed only in a conversation. Paraphrased closely from what the user pasted.

The whole game is one index.html; read all of it before changing anything. Replace low-res sprites, scanlines, monospace
fonts, flat navy cards, emoji, and POW!/OW!.

Target: realistic cinematic 3D at the quality of Undisputed or Fight Night Champion, on every screen, menu and HUD.
"Gameplay, rules, numbers and all text stay exactly the same. This is a visual overhaul only: the 3D reads the game's
existing state and never changes it."

## 1. Look
- People: skin with pores and subsurface scattering, sweat building with fatigue, real hair, believable faces,
  motion-captured movement.
- Materials: leather gloves with stitching and creases, cotton hand wraps, satin trunks, scuffed canvas, taped ropes,
  chalk, brick, rusted pipe, wet concrete, glass, brass.
- Light: underground rooms with hanging tungsten bulbs and work lights, deep shadows, haze with light shafts and dust,
  warm highlights against cool shadows, reflections on sweat and wet floors.
- Cameras: perspective lenses, shallow DOF, handheld drift, motion blur on fast punches, TV angles.
- Grade: high contrast, slightly desaturated, charcoal and black with warm bulb light, red and blue for the corners, gold
  as a small accent.
- Nothing pixelated: no low-res canvases, no imageSmoothingEnabled=false, no scanlines, blocky sprites, flat-shaded boxes,
  pixel or monospace display fonts, or emoji.

## 2. UI
- Premium sports-broadcast interface over a live 3D scene.
- Bold condensed sans for titles, numbers and clock; clean sans for body; Text Size keeps working.
- Smoked glass panels that blur the scene, soft shadows, rounded corners, thin warm edge light, slight parallax depth.
- Tactile buttons; PLAY a large lit gold plate.
- Replace every emoji with a consistent set of 3D-rendered icons.
- Smooth gradient meters; scores and clock as broadcast graphics.
- Camera moves between screens; Reduced Motion uses fades. Safety text always legible.

## 3. Screens
1. Boot: corridor to a ring under one bulb with a real loading bar.
2. Lobby: live 3D, fighter idling, wrapping hands, shadowboxing; tabs Gear Up, Quests, Equipment, Inventory, Market,
   Rankings, Gym, Regiment, Battlepass; gold and gem counters, profile and level, multipliers, Next Bout, PLAY; Switch
   gym/plaza/lobby moves the camera; the punch close-up becomes a slow-motion straight right landing on the cheek.
3. Mode Select: four cinematic cards (Missions, Street Fight, 1v1 Arena, The Call - Soon) with depth parallax on hover.
4. Mission Setup: venue live behind the panel, eight realistic thumbnails, 3D coin, gem and EXP icons.
5. Eight venues: Sub-Level Nine / Ironworks (basement ring, breeze block); The Boiler Room (pipes, steam, crowd on the
   ropes); Parking Level C / Chalk Circle (pillars, chalk circle, no ring); Kowloon Bag Room (rows of heavy bags, mirror
   wall); Pier 14 / Cold Storage (frost, visible breath); The Cellar, Yongsan (regulars, house doctor); Furnace Street
   Athletic Club (sanctioned ring, ringside physician); Loading Bay Seven (dock with shutters, no doctor). Loading screens
   are slow push-ins.
6. Camp: heavy bag, speed bag, defence drills, skipping or roadwork, shadowboxing, resting, check-up; he tires as fatigue
   rises.
7. Pre-bout: face-off, weigh-in on a real scale, ringside doctor's check.
8. Bout: broadcast fight, you in blue corner, opponent in red, real ring, believable crowd, TV angles, broadcast top bar,
   POW!/OW! removed, KNOCKDOWN as a broadcast graphic.
9. Warning signs acted out (late guard, blank stare, hands dropping, guarding side, covering an eye), never highlighted.
10. Corner: stool, cutman, towel, water, doctor; choices (Defend/Balance/Attack, Water/Cut care/Doctor, Stop) over the
    scene.
11. Ringside checks: penlight, balance test, cut and swelling, hands, ribs.
12. Fighter Status: HUD panel with semi-transparent 3D anatomy, illustrative, never like a medical scan.
13. Results: hand raised, towel thrown in, doctor waving it off, medics, then the same text.
14. Gear Up: turntable, body changes with upgrades, realistic glove, lungs, arm, every skill previews as an animation.
15. Gym floor: third person, every lift and drill animated including failing a rep.
16. The Square: dusk plaza, gilded boxer statue, plinth with four boards (Rank, Money Spent, Level, Gold), next to Trade
    Central market.
17. Market: glass potion bottles with liquid, gem clusters, coin stacks.
18. Street Fight: wet night street, keep arcade side-on play.
19. 1v1 Arena: realistic ring and fighters.
20. Dialogs (Coach Briefing, Corner Knowledge, Medical Codex, Settings, toasts): same text, new UI.

## 4. Keep
All gameplay, rules, balance, timings, save data; all text including every disclaimer and the 119 emergency line; realistic
but not gory (no blood spray, no lingering on injuries); settings keep working (Low Detail, Shadows, Blur, Camera Shake,
Reduced Motion, Text Size).

## 5. Build
Three.js, PBR, HDR lighting, real shadows; post (filmic tone mapping, bloom, AO, DOF, light grain); rigged photoreal humans
with facial animation plus mocap; licensed or CC0 assets listed in CREDITS.md; clearly named placeholders in ASSET_LIST.md;
quality presets for phones; keep the old pixel version as a fallback for devices without WebGL2.

## HDRI ideas already found (Poly Haven, CC0)
Ironworks basement_boxing_ring; Boiler Room boiler_room; Parking parking_garage; Kowloon gym_entrance or crossfit_gym;
Pier 14 bank_vault; Cellar drachenfels_cellar or castle_zavelstein_cellar; Furnace Street wrestling_gym; Loading Bay
small_hangar_01 or hangar_interior; gym gym_01; street vignaioli_night or cobblestone_street_night; plaza palermo_square;
arena circus_arena.
