# Notes: BIBLE revision from critic findings (resume file)

Task: apply the fidelity + buildability critic findings (66 findings) to story/BIBLE.md, add Decisions, append "# Revision log".

## Method
- BIBLE.md is assembled from story/design/bible-parts/ (00-decisions, 01-global, ch00..ch10). Edits go into the part files; then rebuild.
- Assembly script (verified byte-identical to BIBLE.md before any edits, 2026-11-22):
  decisions, then "\n## Contents ..." block, "\n", 01-global, then each of ch00..ch10 and 99-revision-log.md preceded by "\n\n", trailing "\n\n"; "<!-- end" lines dropped.
  A copy lives in the scratchpad (assemble.sh); if it is gone, rebuild it from this description.
- Revision log lives in bible-parts/99-revision-log.md (so a rebuild keeps it).
- New decisions are appended to bible-parts/00-decisions.md as items 21+.

## Progress (tick as done)
- [x] Read BRIEF.md
- [x] Read ref-story.pdf (12/12), ref-movement-art.pdf (10/10) via PDFKit text (Read tool has no pdftoppm)
- [x] ch00  - [x] ch01  - [x] ch02  - [x] ch03  - [x] ch04  - [x] ch05
- [x] ch06  - [x] ch07  - [x] ch08  - [x] ch09  - [ ] ch10  - [x] global  - [x] decisions
- [x] 99-revision-log.md written
- [x] BIBLE.md rebuilt + id cross-check (flags/ev/mem/bel/locations all consistent; every section grew)

## Decisions taken in this run
(see 00-decisions.md items 21+ once written)
- Ch0-2 done (2026-11-22): Min lists 3 purse items; morty id; chin-tap tell bigger; Min apron posture; tether/stillness refs; Ch1 7 sessions (Day1+Day3, Dec16->Dec18 morning), drills gated by body, Dolores proximity, snow, Hana "seven weeks" line (adapted: file typed Feb '95), wheel zoom; Ch2 Teddy "charity fella" line, Iron Pulse training from Ch3 card, van trigger, no counter window in Ch2, poise via shrug.
- TODO global: Direction grammar add tether NPC + holdE/stillness table; Progression Ch2/Ch3 rows; Training body gating; Money YMCA rule; shared locations table; base iron_pulse_backroom; renames; boxer alias; jin_voice split; pike_unpromised; deshawn>=3; Decision #19, #15.
- Ch3-4 done: allowLoss per bout + state bools ch3_tryout_won/ch3_slim_won (ADD TO REGISTRY); hook lesson moved to 3.5 step 1a (fallback = Wojo's wide right) -> update Decision #6 + Progression Ch3 row; route9_walk defined in ch03 (add to Global shared locations); pin deck side-on; pressed poses; Cutlass side view; YMCA $120 tab on Ch3 card. Ch4: safe via dialogue choice, Roz "Forty-four, seventy-one", Monday envelopes, CIVIC folder now holds CFRF rm 214 + G.P. admin lines, NCC holds acquisition line under coffee ring, Council-bed thought cut; E4.3 catwalk door; E4.4 roof unreachable; mem_backdoor vignette; Friday end trigger. -> global ev_ncc_ledger/ev_civic_ledger/ev_roz_account rows to update.
- Ch5-7 done: Ch5 phase rule, q5_shifts per day, swing dummy, Keisha reaction-board, refs 5.4/5.5, tethers, holdE. Ch6: cuts (2 trips, 6 sheets, board pass1 ★+3, corner 2 rounds 1 call scripted choreography, letters 1/6/7/9 auto), two halves + target 26-30, 6.3 Lindell / 6.4 Suds swapped (refs updated), pike_unpromised, Deshawn>=3, Pike accepted cards, memo "every long-term facility", notebook 7/14 visit + front-desk slip in ev_stagnes_calllog, soft floor trigger zones. Ch7: Wanda Wojcik (id wanda, q7_wanda), Southbank vague letter, "Dutch said they got word to him the night before", Rook maybe-line, jin_voice harm-only + threat_voice thought, Odette tether, 30 s calm + noon trigger, pantry 10-12, Mara walks out (2nd rejection), Darnell reads date, base iron_pulse_backroom.
- GLOBAL TODO add: threat_voice def; jin_voice harm-only thresholds 0/1/>=2; ch3_tryout_won/ch3_slim_won; ch6_saturday pike_unpromised; ev_alder_letter row; q7_wanda; Wanda in cast; Wojo mother Wanda.
- Ch8-9 done: Ch8 valve = rest (40%, tells +50%, 8.8 always), round-3 clock rule, free-roam switch, Ray owns decision line, 11:50 note, ice pack, tether, chin tap tell, Alder Row named first here. Ch9: Celeste only after Garvey down, Celeste line, Penner sincere belief + no flowers line, Celeste doubt at model, guards not shields, clock 5 phases x2 visits, river_path, Fitz on bus vignette, ch4_scouted + ch4_roz lines, sleep thought split.
- NEXT: ch10 then global, decisions, revision log, rebuild.
- Ch10 done: Tran/Pryor renames, Slim covered line, gate thoughts split + pike_unpromised + pull thought (7) before fixed last (8), holdE cut/door, Restrain = E scripted seq, cutter-man scripted path, Deshawn scripted tackle (wave 3 -1), title fight no pause, epilogue reordered by date, Teddy knuckles line, Thursday props per visit, courthouse_steps/room_above_hans. ch03 boxer->trained_boxer. ch06 Arnie Dukes, button holdE.
- NOW: global (01-global.md), then decisions, then 99-revision-log.md, rebuild.
- RUN COMPLETE (2026-11-22): 72 findings, 71 applied, 1 no change, 0 rejected. BIBLE.md rebuilt from bible-parts with assemble.sh (scratchpad). Assembly recipe for a rebuild: cat 00-decisions (drop '<!-- end' lines), then '\n## Contents' block (13 lines, see top of BIBLE.md), '\n', 01-global, then '\n\n'+each of ch00..ch10 and 99-revision-log, trailing '\n\n'.
