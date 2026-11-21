# Notes: buildability and pacing critic (resume file)

Run 1 (2026-11-21 20:16 KST): BIBLE.md did not exist; reviewed bible-parts ch00-ch02 only. Superseded.
Run 2 (2026-11-22, after 00:47): BIBLE.md now complete (2915 lines, ~490 KB, assembled from bible-parts). Re-read BRIEF.md, ref-story.pdf (12/12), ref-movement-art.pdf (10 + blank). Reviewing BIBLE.md in full.
Note: BIBLE is built from bible-parts/*.md; fixes should be applied to part files then re-assembled (per notes-bible.md).

## Progress (run 2)
- [x] BIBLE lines 1-423 (decisions, global, registries)
- [x] Ch0-Ch2 (424-1079)
- [x] Ch3-Ch5 (1080-1744)
- [x] Ch6-Ch7 (1745-2259)
- [x] Ch8-Ch10 (2260-2915)
- [x] scripted cross-check: flags set/read, ev ids, loc ids
- [ ] return StructuredOutput

## Run 1 issues to re-verify against BIBLE (some fixed in merge run 2)
- Ch0 'Hold still' interaction, Min follower, bus/wagon vehicles
- Ch1 night stealth flashlight; Hana card Gus->Otis (reported fixed); 9 time-card sessions
- Ch2 timeline alley vs Teddy (reported fixed); dash straight fallback (reported: Ch4 Teddy any value / Ch5 Deshawn); breath meter (reported: no meter, posture only)

## Issues found (run 2) (chapter | severity | short)
- Global | should | AI ally (Deshawn, E2) not in engine list; Gloria Hale vs Bernice Hale surname clash; two Bernices; `calder_arms` base id has no location
- Ch0 | nice | Hold still release-keys, Min follower, chin-tap tell readability at 50px, poses (hands at mouth, climbing apron, two fingers forehead)
- Ch1 | should | Training tab Week 4 offers footwork/conditioning while Jin is in wheelchair; 9 sessions in 18-22 min; stealth cone = proximity; first snow morning vs afternoon
- Ch2 | should | Iron Pulse bag/mitts offered before alley but punches only return in alley; van spawn trigger implicit; poise outline UI; Ch2 slip vs Ch3 counter gate ambiguous
- Ch3 | must | allowLoss:false header vs Slim straight loss allowed + Deshawn 'win or lose'; YMCA nights money ($16 vs 3 weeks); Lenny collar-over-rail pose; pin-deck face perspective; Route 9 walk location undefined; windshield vignette front view
- Ch4 | should | safe combination input UI not in engine (and Roz's 4-digit 4-4-7-1 vs three-number input); enemies climbing ladders/trailer (E4.3, E4.4) not in engine; stretcher-level 'camera lies flat'; Roz 'Tuesday envelopes' vs label 'deliver Mon.'
- Ch5 | should | day-phase loop (morning/afternoon/evening) + NPC routines = new system, phase triggers unclear; two-person carry (Mara, Gus) = follower/tether; medicine-ball launch prop; reversed mitts for Keisha; cross-refs 'see scene 5.5' (Rook is 5.4), 'scene 5.6' (Odette is 5.5); Leon (Odette's husband) vs Leon Dukes; shifts 'one per morning' vs Wed 9PM/Fri afternoon
- Ch6 | must | too large for 22-25 min (box 10 items + 3-trip windows + Asher 12 sheets + Lindell + flurry + film + board pass1 ~20 cards + Saturday + 9 letters + Hana + board pass2 + cemetery button) -> 40+ min
- Ch6 | should | NPC-vs-NPC bout (Deshawn vs Bell) needs scripted choreography; soft-floor hazard tiles; pike path -3/abandon applied even if never promised corner; deshawn>=4 (Ch6 table) vs >=3 (registry); Asher 'went back up' -> Lindell strippers within a minute (ordering/breath); Pike memo June 1995 'asking St. Agnes by name' vs call log 11/02/95; cross-refs (box 6.2->6.1, film 6.4->6.5, letters 6.7->6.8)
- Ch7 | should | 'Noon: the Harlan men' trigger undefined; kept_going lobby fight follows archive discovery (Odette/ASH wire) with no breath beat before it (calm only after); Iron Pulse back room as base missing from `base` state; Leon Baptiste vs Leon Dukes
- Ch8 | must | safety valve (Teddy stops fight on 'Something's wrong') means champion NOT defeated -> PDF 'The champion is defeated'; also no bell_state set on that path
- Ch8 | should | round-3 time-out outcome undefined (Ray floor not reached); A.bout ring confinement vs walking out to the bell table; Rook 'dressing room' vs Ray 'note to hotel'
- Ch9 | should | shield guards = new archetype (protector); consideration clock (5 phases vs 12 phase-tagged visits) undefined; river path has no location id; slick marble friction modifier
- Ch10 | should | Restrain verb, hold-E cut/door, cutter-man objective AI, Deshawn ally; epilogue cards out of chronological order; ch9_knuckles Teddy line + ch3_covered_slim line + ch9_visits props never written; ch6_strippers read at Garrison St not in Ch9 list
- Cross | should | Ch9 Penner lacks ch4_scouted and ch4_roz=threatened lines promised in Ch4; Ch6 Pike present 'ev_lenny_voucher (G.P. lines)' wrong card (G.P. is in ev_civic_ledger/ev_transport_log); Ch3 Wojo bout teaches hook before hook unlock (3.7)
- Run 2 review COMPLETE; next step: StructuredOutput (if restarted, just re-emit from this list)
