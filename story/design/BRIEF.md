# Story Mode brief (shared by every agent)

Read this whole file first. It is the user's request, the reference documents, the canon decisions already made, and what the engine can do.

## Reference documents (read them yourself; do not rely on summaries)

- `story/design/ref-story.pdf` — **THE STORY.** Chapter 0 to 10, both endings, and "How progression stays connected to the story". This is canon. Do not rewrite the narrative: preserve chronology, motivations, relationships, discoveries and endings. Every "do not" in it is a hard rule.
- `story/design/ref-movement-art.pdf` — Jin's movement and combat controller spec (timings, cancel windows, slip/counter, dash charges, hit-stop) and the art direction (640x360 logical canvas, Jin 44–52 px tall, muted blue-gray streets, worn brown brick, warm streetlights, no heavy black outline on Jin, eyes hidden under fringe, reddish healed scar on right cheek, blue track top, black pants, white running shoes, no cane).
- `story/design/ref-research.pdf` — the user's SANABI and MapleStory systems research. Its principles apply (see the end of this file).

## The user's request, verbatim

> Redesign and Develop Story Mode — Inside the Impact
> Inspired by SANABI and MapleStory
> I want you to completely develop and elevate the Story Mode of our existing game:
> Website: https://inside-the-impact.pages.dev/
> Story Reference: Attached `InsideTheImpact.pdf`  (this is `ref-story.pdf` here)
> Gameplay and Visual Reference: Attached `InsideTheImpact(1).pdf`  (this is `ref-movement-art.pdf` here)
> Our primary inspirations are:
>
> * SANABI: Cinematic storytelling, emotional storytelling, atmospheric environments, seamless transitions, environmental storytelling, and immersive 2D side-scrolling gameplay.
> * MapleStory: World exploration, NPC interactions, interconnected locations, quests, character encounters, and a sense of progression throughout the world.
>
> The goal is to combine these experiences while preserving our original story, characters, and gameplay identity.
>
> 1. Build the Story Mode Around Our Actual Narrative
> First, read the entire story PDF carefully.
> Our story follows Jin, a former boxing champion who loses control of his future after a manipulated championship fight in 1994.
> Two years later, he awakens in a long-term care facility under a false identity. As he gradually recovers, he discovers the truth about his hospitalization, his family, the underground boxing organization, and the people who benefited from his disappearance.
> The campaign follows his journey through multiple locations, confrontations, discoveries, and difficult decisions.
> Do not rewrite the narrative. Preserve the established chronology, character motivations, relationships, important discoveries, and endings.
> The Story Mode should contain all chapters and their corresponding events from the PDF.
>
> 2. SANABI-Inspired Gameplay Presentation
> I want the actual experience of playing Story Mode to resemble SANABI's approach to narrative-driven gameplay.
> This means:
> * A continuous 2D side-scrolling world.
> * Cinematic camera movements during important scenes.
> * Smooth transitions between exploration, dialogue, combat, and cutscenes.
> * Environmental storytelling.
> * Atmospheric lighting and background details.
> * Expressive character animations.
> * Carefully directed dialogue sequences.
> * Important story revelations presented through gameplay.
>
> Avoid making Story Mode feel like a visual novel with occasional combat sections.
> The player should physically explore the environments and experience the events.
> For example, when Jin returns to his former neighborhood, allow the player to walk through the streets, examine familiar locations, interact with objects, and gradually discover what happened to his family.
> Let important scenes breathe. Do not immediately interrupt emotional moments with combat.
>
> 3. MapleStory-Inspired Exploration
> Build a world that players can explore naturally.
> Each chapter should introduce locations that feel like actual places rather than isolated gameplay levels.
> Examples include: Championship Arena; Hospital and Rehabilitation Wing; Jin's Former Neighborhood; Underground Arena; Mafia Depot and Hideout; Foundry Courts; Community Organization Headquarters; Original Championship Arena; Financial Leadership Offices; Somebody Else's Home.
> Each location should have its own environment, NPCs, interactive objects, and atmosphere.
> Implement:
> NPC interactions — Characters should be physically present in the world. Players can approach NPCs and initiate conversations. Important characters should have unique dialogue and animations. NPCs should react to major story developments. Some NPCs should offer optional quests or additional information.
> Exploration — Players can move freely through available areas. Doors and entrances should lead to connected locations. Important objects can be examined. Hidden documents and evidence can be discovered. Previously visited locations can change as the story progresses.
> Quest progression — Main quests should guide the central narrative. Optional quests should develop the world and characters. Objectives should update naturally after important events.
> Do not make the world feel artificially populated with meaningless NPCs.
>
> 4. Chapter-by-Chapter Implementation
> Every chapter should have its own gameplay identity.
> Chapter 0 — One More Round: Introduce Jin before the championship fight. Let players experience his relationship with his family, his preparation, and his former boxing abilities. The championship fight should become a cinematic sequence that establishes the central tragedy.
> Chapter 1 — The Name Above the Bed: Introduce the hospital, rehabilitation, Hana, movement recovery, and the first evidence of Jin's false identity.
> Chapter 2 — No One Waiting: Allow players to explore Jin's former neighborhood, discover his family's fate, and experience his first street confrontation.
> Chapter 3 — The Price of Admission: Explore the underground arena, interact with fighters, participate in bouts, and investigate the former corner assistant.
> Chapter 4 — Collections: Explore the mafia depot, fight through the location, and discover the financial records.
> Chapter 5 — The Houses Still Standing: Introduce Foundry Courts. Focus on exploration, ordinary activities, NPC relationships, and the residents' everyday lives.
> Chapter 6 — Undelivered: Investigate Jin's family's final months through documents, belongings, testimony, and environmental discoveries.
> Chapter 7 — What Your Life Bought: Confront Rook and reveal the connection between the championship fight, the organization, and Foundry Courts.
> Chapter 8 — The Man in the Other Corner: Return to the original arena and confront the champion.
> Chapter 9 — The Offer: Explore the financial leadership's offices and confront the people offering Jin a different future.
> Chapter 10 — Somebody Else's Home: Present the final decision and develop the two endings.
> Use the complete PDF for the specific events and details of every chapter.
>
> 5. Meaningful Exploration Instead of Constant Combat
> This is extremely important. I do not want every chapter to consist of walking forward and fighting enemies. Create different gameplay experiences: exploring neighborhoods; talking to residents; investigating old buildings; finding photographs and documents; reconstructing memories; completing ordinary tasks; training at gyms; participating in boxing matches; discovering hidden locations; making important decisions. Some chapters should have very little combat. The balance between exploration, storytelling, and action should change depending on the chapter.
>
> 6. Character and Relationship Development
> Characters should feel alive. Pay particular attention to Jin, Min, Hana, Mara, Rook, the champion, and the other important characters in the original story. Give characters: unique animations and body language; distinctive dialogue; meaningful interactions with Jin; reactions to previous events; different perspectives on the central conflict. Do not turn every character into a simple good or evil personality. The conflict between Jin, Rook, the organization, and the residents should retain its moral complexity.
>
> 7. Story Progression and Player Choices
> Implement persistent story progression. The game should remember important decisions made by the player. Choices should influence: character relationships; NPC dialogue; available assistance; supporting characters' reactions; certain optional interactions; the final narrative outcome. Preserve the two established endings:
> 1. The Champion: Jin accepts the bargain and obtains the promised material security and boxing comeback at the expense of the unfamiliar neighborhood's residents.
> 2. His Own Name: Jin refuses, protects the neighborhood, and sacrifices the promised treatment package and managed comeback.
> Earlier decisions should provide context for the final decision, but must not secretly remove the player's responsibility for choosing.
>
> 8. Visual and Environmental Direction
> Use the attached visual references. Maintain: 2D side-scrolling pixel art; small expressive character sprites; muted blue-gray environments; worn brown brick buildings; warm streetlights; atmospheric backgrounds; detailed environmental layers; consistent pixel density. Use SANABI for atmospheric depth and cinematic presentation, and MapleStory for expressive world design and exploration. The setting should consistently reflect the 1990s American industrial neighborhood described in our story. Do not copy assets from either reference game.
>
> 9. Story Mode Interface
> Create a dedicated Story Mode interface. Include: chapter introduction screens; current objective display; dialogue interface; quest journal; world map; NPC interaction indicators; evidence archive; memory archive; character information; chapter completion screens; save and load progression. Keep the interface minimal during exploration. Avoid covering the gameplay screen with unnecessary UI elements.
>
> 10. Technical Implementation
> Before developing, inspect the existing codebase and identify how the current game works. Do not destroy existing systems. Implement Story Mode as a modular system that can be expanded with additional chapters and content. Prioritize: reusable dialogue systems; data-driven chapter structures; NPC interaction systems; quest management; location transitions; persistent player choices; save/load functionality; cinematic event sequences; reusable environmental objects. Every button, NPC interaction, quest, and transition must actually work. Test the campaign from the beginning to the end.
>
> FINAL VISION: SANABI's cinematic narrative experience + MapleStory's immersive exploration + our original boxing combat system. The player should feel like they are living through Jin's story. They should walk through his neighborhood, meet people, discover secrets, develop relationships, investigate the past, and experience the consequences of their choices. Most importantly, I want the world to feel alive even when nothing dramatic is happening. A quiet conversation with a resident should be just as meaningful as a major boxing fight when the story calls for it. Do not prioritize adding features over creating a cohesive experience. Build the Story Mode as a complete, interconnected, emotionally engaging 2D action-adventure campaign.

(The user also wrote at the end: "I will put SANABI and MapleStory Analysis afterward" — that analysis is `ref-research.pdf`.)

## Canon decisions already made (do not change these; the story PDF leaves them open)

These names fill gaps the story PDF leaves unnamed. Use them exactly. Everything the PDF does state wins over anything here.

| Role in the PDF | Name used |
|---|---|
| Jin | Jin Seo (Korean-American, 26 in 1994). Documents may print SEO, JIN. |
| False hospital identity | "Daniel Ahn", file says industrial accident at Calder Foundry |
| Jin's mother | Mrs. Seo Mi-ok; Jin calls her "Umma" or "Mom" |
| Jin's sister | **Min** (Seo Min-ji), 22. The user names Min as a main character; she is the sister in the PDF. |
| City | Calder, an industrial river city, 1994–1997 |
| Jin's home district | Eastgate; family apartment 3B, 412 Kessler Avenue |
| Jin's old gym | Marsh Boxing Club (head trainer Coach Teddy Marsh); by 1996 it is "Iron Pulse Fitness" |
| Former corner assistant | Lenny Voss (cutman/corner assistant on fight night; now works at the underground arena) |
| Man who offers the bribe before the fight | unnamed: "the man in the camel coat" |
| The champion | Ray Castell |
| Championship venue | Calder Civic Arena; fight night August 20, 1994 |
| Long-term care facility | St. Agnes Long-Term Care, Rehabilitation Wing |
| Rehabilitation worker | Hana Lim |
| Hospital liaison from the funding organization | Gerald Pike |
| The community organization | Northside Community Council ("the Council"); leader **Rook** (Walter Rook) |
| The mafia | the Harlan Street outfit |
| Collectors who try to force Jin into a vehicle (Ch2) | Pike's hired collectors, a gray panel van |
| Underground arena | "The Cellar", beneath Starlite Lanes bowling alley; run by promoter Mo Feeney |
| Mafia depot (Ch4) | Harlan Freight Depot; boss collector "Dutch" Brannigan |
| Protected housing district (Ch5) | Foundry Courts |
| Maintenance workshop resident (Ch5) | Mara Kowalski |
| Boardinghouse where the family died | Lindell House, Garrison Street |
| Financial leadership (Ch9) | Ashgrove Capital, Ashgrove Tower; Celeste Ashgrove and Lyle Penner (Penner gave the final instructions) |
| Targeted cooperative (Ch10) | Alder Row Cooperative — strangers to Jin; not Foundry Courts |

Other residents, fighters, neighbours and staff may be named by the design, but keep the cast small and meaningful: no filler NPCs.

Fight date August 20, 1994. Chapter 1 opens in autumn 1996 ("two years later"). Foundry Courts was bought shortly after the fight (late September 1994).

## What the engine can do (design within this)

The engine is a custom HTML5 canvas engine written for this, loaded from the existing game's Story Mode card. All art is drawn procedurally in code (no image files), so design props and characters that can be described as shapes and colours.

- **World**: 640x360 logical pixels, scaled up crisply. Discrete locations ("maps") joined by doors, stairs and street edges, with fade or walk-through transitions. A location can be wider than the screen (typical 900–3200 px) and taller (vertical layers: fire escapes, catwalks, stairwells, rooftops) with one-way platforms and ladders/stairs. Parallax background layers, a foreground layer, lights (streetlights, windows, lamps, ring lights) with darkness and warm glow, weather (rain, snow, dust, smoke), time of day.
- **Characters**: small (~46 px) procedurally posed figures, distinct silhouettes and colours, no facial features (posture tells everything). Poses/animations available: idle relaxed, boxing guard, walk, run, backstep, jump, fall, land, dash, slip, all punches, hurt, knockdown, lying down, get up, sit (chair, bench, bed edge, curb, stool), lie in bed, kneel, crouch, lean on wall with hands in pockets, arms crossed, hands on hips, phone call, carry box, push, point, wave, shrug, head down, hug, hand on shoulder, cook/work at counter, sweep, write at desk, smoke, drink, cower, limp, wheelchair, parallel bars, shadowbox, skip rope. Any NPC can walk scripted paths, turn, play poses, and bark a short line in a speech bubble when the player is near.
- **Interaction**: approach + E. NPC talk, examine objects (text, or open a document/photo viewer), pick up evidence, sit down (camera eases out, time passes, Jin's thoughts), use (doors, payphone, light switch, radio, TV, locker), carry objects, repair (a short sequence of steps). Locked things always say why. NPC markers: `!` new quest, `?` quest turn-in, `…` new dialogue.
- **Cinematics**: camera pans, authored zoom in/out, shake, letterbox, fades, slow motion, freeze frame, title cards, time-skip cards ("Six weeks later"), flashback/memory filter, screen effects (muffled audio, blur, double vision, desaturation, heartbeat, tinnitus), sound cues (bell, crowd, rain, traffic, radio). Scenes are scripted beat by beat.
- **Dialogue**: speaker name + typewriter text, optional thought lines (italic, Jin's inner voice), choices (2–4 options, no timers, no misleading options), lines conditional on flags.
- **Combat**: Jin's full moveset from `ref-movement-art.pdf` (dash with 2 charges, backdash, air dash, slip with counter window, jab–cross–hook, uppercut launch, dash straight, counter-cross, flurry, guard) with skills unlocking per the story. Enemy archetypes: collector (big, slow, committed haymaker, grab), thug, trained boxer (keeps distance, feints, punishes repeated jabs, different openings after misses), security guard (baton), director (makes nearby enemies attack faster; hit him first), boss collector (corners Jin, resists stagger), champion (pattern boss), sparring partner, heavy bag / dummy. Fights happen in the open world space; boxing bouts use a ring with rounds and the bell. Jin can be beaten (retry from a checkpoint, a few seconds lost). Enemies stay down (knocked out or flee), never killed. Downed enemies can be questioned.
- **Activities / minigames**: training drills (balance beam, footwork marks, reaction pads, conditioning laps, heavy bag combos, mitt work, slip-rope), carrying (no punching while carrying, stated), repair sequences, ordinary work shifts that pay modest money, a timeline-reconstruction board (place evidence cards in order), presenting evidence to support a claim in a confrontation, reading letters/documents in a viewer, photographs.
- **Systems**: main and optional quests with objectives that update; journal (Quests, Evidence, Memories, People, Map); world map of Calder showing unlocked places; a location minimap with three states (full / partial / hidden); flags for every choice; relationship values (Hana, Mara, the Foundry residents, Lenny, Slim, Deshawn, etc.); money (modest; cannot buy recovery); training levels with hard caps; save slots + autosave at checkpoints; chapter select after completion; difficulty that scales only Jin's condition recovery.

## Research principles that apply (from ref-research.pdf)

- Difficulty lives in the player's hands (execution), not in stats. Training improves control a little, with caps; money never buys power or the ending's recovery package.
- Failure is cheap: frequent checkpoints, instant retry.
- One signature verb, deeply tuned: Jin's boxing rhythm (dash in → jab–cross → evade → counter → reposition). If a section blocks a verb (rehab, carrying, the sabotaged fight), it must say so and offer the substitute; never let the controls feel broken without explanation.
- Authored, film-like camera: zoom in for shock and impact, out for distance and loneliness; per scene, not one global follow.
- Inverted detail density: simple characters, detailed backgrounds.
- Two-layer UI: a few fixed edge elements, everything else in summonable windows; fade non-essential UI during combat; badge the journal when something new is unread; three-state minimap; notifier icons typed by kind (main / optional / missable / collectable).
- Explain failure at the point of failure (locked door says why).
- Discrete maps with portal transitions; some maps taller than the viewport so they read as places.
- Teach through a guided opening, not a tutorial menu (Chapter 0 warm-up teaches in motion).
- No MapleStory retention machinery: no grind, no stacked progression systems, no loot economy.
