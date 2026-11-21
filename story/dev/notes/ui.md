# ui.js + story.css — builder notes

Status: COMPLETE (run 1). Owner files: `story/ui.js` (sections `/* ── 0. … 19. ── */`), `story/story.css`.
Both pass the syntax check; `headless.js load` and `headless.js sandbox` pass with ui.js in the manifest (it does
nothing headless). Checked in a real browser (story/dev/play.html served from a scratch copy, 1280x720 and
1920x1080): title, Chapters list, chapter card, HUD, prompts, dialogue + choices, A.card, doc viewer, journal (all six
tabs, Read, Travel, Start drill), pause, save (overwrite confirm), load, settings, controls (rebind, clear, refusals),
timeline board, evidence picker, a fight, a bout, completion screen, ending cards, credits, error overlay.
Restart: read this file, then ui.js.

## What is built (contract §10)
- Fixed edges: top-left place name (shows 4.4 s of *visible* time after entering, then collapses), the minimap
  (full / partial "nearby" strip / hidden; N cycles, click cycles, stored in `S.settings.minimap`), objective with kind
  icon (main ◆, side ○, missable ★, collectable ▣) and the quest title above the step; top-right Journal and Map
  buttons with the bound key and a "+" badge while `D.unread()`; bottom-left condition bar (damage trail), breath bar
  (only when `combat.body.breath`), dash pips with recharge fill — shown in combat or while anything is below full,
  fading 1.6 s after calm. Context opacity: objective and place name drop to 22% in fights, the minimap to 50%; all
  HUD edges hide under letterbox, fades and A.card. Bout plate (round, clock, opponent and his condition) plus big
  centre text for "Round N", the knockdown count ("Get up — tap J"), Corner, Knockout.
- World labels in `.su-labels` (CSS px from S.world): focus prompt `[E] Talk — Name` with the lock reason under locked
  doors, NPC markers (! ? …), one bark bubble (Jin's barks styled as thoughts).
- Dialogue: speaker plate, typewriter (the director owns `shown`; the unrevealed rest keeps its space, soft type
  ticks), thoughts in italics without a plate, narration centred, ▼ when done. Choices: ↑↓ / interact / Enter / 1–9 /
  mouse; disabled options show their hint; an answer counts only once the options have been visible 0.3 s and a key
  pressed within 0.08 s of the line opening is ignored (mashing through lines never picks an answer).
- Screens from `D.screen`: chapter card, completion (evidence x/y, optional quests x/y with each one's state, choices
  in plain words, time, chapter summary lines, what comes next), ending (cards revealed one by one), credits (rolling;
  "Story Mode by Joohyun Lee and Elliot Jeong"), continued. `D.card` title cards fade in/out.
- Windows (all pause the sim, Esc / the pause key closes, every key handled, mouse everywhere): journal (Quests, Evidence,
  Memories, People, Map, Training), doc viewer (paper, letter, record, recording, photo styles; pages), timeline board,
  present-evidence picker, pause menu, save (slots 1–3), load (auto + 1–3), settings, controls, confirm.
- Title screen (Continue, New Game, Load, Chapters, Settings, Back to the lobby), error overlay, toasts and notices.

## Public API (S.ui)
- `init(root)` / `destroy()` — called by main.js on open/close.
- `update(dt)` — once per rendered frame (main.js).
- `openWindow(name, data) -> bool` — 'journal' {tab}, 'map', 'quests', 'evidence', 'memories', 'people', 'training'
  (journal tabs), 'pause', 'save', 'load', 'settings', 'controls', 'doc' ({doc} | {id, at} | {src: D.doc}),
  'timeline' | 'present' (the activity state), 'confirm' {title, text|[paras], yes, no, danger, defaultYes, onYes, onNo}.
- `closeWindow(name?) -> bool` — that window (else the top one). `isOpen(name?) -> bool` ('map' = journal on Map).
- `toast(text, kind, o?)` — kinds quest, evidence, memory, people, skill, gear, money, checkpoint, saved, fail go top
  right (they wait while a full-screen card or the title is up); hint, tip, locked, error, info are short notices at the
  bottom centre. o: {head, icon, iconCls, life, key (a notice that replaces its earlier copy)}. Text renders `{action}`
  and `[action]` as the bound key cap, `[K]` as a literal key cap.
- `title()`, `chapterCard(def, {onDone, minTime}) -> {close}`, `chapterComplete(data, {onDone, minTime}) -> {close}`,
  `error(err, ctx)` (throws when not mounted so main.js falls back to its own overlay), `handlesTitleEsc = true`.

## Exports / conventions beyond the contract
- `S.ui.toast(text, kind, o)` third argument (above). Event 'travel' {id, loc} emitted on map travel.
- ChapterDef / map node fields the Map tab reads (all optional): `ChapterDef.travel` (bool | string | (G)=>bool|string:
  false/string closes map travel for the chapter, with that reason); node `when(G)` (shown at all), `travel`
  (true | string | (G)=>…; default false = "Jin has no way to get there…"), `locked` (string | (G)=>string), `arrive`
  {loc, x, face} (where travel lands; default the node's first loc at points.arrive || points.start), `district`/`area`,
  `text`. Node x/y: fractions 0..1, or map units fitted to a 640x360 sheet (river along the bottom).
- QuestDef.reward as a string is shown in the journal once the quest is done.
- PersonDef notes: a note shows when its id was recorded by A.meet, or its when(G) holds; notes with neither always show.

## Decisions
- Keyboard: the UI keeps its own keydown queue (window, capture phase, registered after core and main) and maps codes
  through `S.input.actionFor`, so rebinding applies to menus; arrows/Enter/Space/Esc/Backspace/Delete/1–9 always work in
  menus. Every keydown/keyup is `stopPropagation`ed while Story Mode is open, so nothing reaches the lobby whatever
  game.js's hotkeysBlocked() says. Keys are routed to the state that was on screen when they were pressed: the queue is
  processed before this frame's director changes, and a window ignores keys older than itself.
- Plain dialogue lines still advance inside the director (D.keys); the UI drives choices (director leaves them to S.ui).
- `S.paused` is owned here while a window or the error overlay is up (set only when that state changes).
- Closing the last window consumes every input action, so a key pressed in a menu never reaches Jin's input buffer.
- Ending cards: while cards remain hidden the UI raises `D.screen.minTime` to t+0.6 each frame so the director's own
  interact check cannot close the ending early; cards also auto-reveal every 6.5 s.
- Labels are re-based onto `S.main.view` (see gaps: world.viewRect measures the off-screen logical canvas).
- activities.js keeps drawing its own drill/carry/repair HUD overlay (`S.activities.overlay` left true).
- Boards: closing early calls state.close() (interact reopens it); Done/Continue calls state.finish(); state.done closes.
- Save is allowed only when Jin is free (no scene holding control, fight, activity or transition); every disabled button
  says why (footer line, tooltip, inline under journal actions).
- New Game / chapter replay / load-in-play / quit / overwrite ask for confirmation, and say honestly what happens
  (autosave replaced, slots kept; quit saves first only when it can).
- CSS resets use :where() (zero specificity); under windows are hidden while another window is on top.

## Known gaps / notes for the integrator
- world.js `W.viewRect()` picks `st.displayCanvas` (the off-screen 640x360 logical canvas, which has no layout box), so
  `screenPos` returns logical px. ui.js re-bases positions onto `S.main.view`, so labels are right either way; a
  `S.main.viewRect()` in main.js (or world preferring `S.main.canvas`) would fix it for any other caller.
- The chapter files do not exist yet, so the journal and screens were exercised with the sandbox chapter and a
  temporary chapter 10 defined in the test page only (not in the repo).
- In a hidden/background browser tab rAF stops, so the UI (and the game) only advances when the tab is visible.
- 'continued' screen and the people portrait for every LookDef were not visually checked beyond the sandbox cast.
