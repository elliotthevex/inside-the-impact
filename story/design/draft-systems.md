# Inside the Impact — Story Mode design draft (systems lens)

Lens of this draft: **choices, consequences and gameplay identity.** Every chapter is described in full, but the weight sits on four things: the recurring moral question asked at growing scales, how flags change dialogue and assistance without ever choosing the ending for the player, how combat is taught chapter by chapter, and how training and money stay small, legible and honest.

Canon sources, in order of authority: `ref-story.pdf` (wins over everything) → canon names in `BRIEF.md` → `ref-movement-art.pdf` → `ref-research.pdf` principles. Engine vocabulary (piece types, poses, fx names, enemy type ids, drill names, `A.*` script calls) follows `story/ARCHITECTURE.md` so this can be built directly.

## Decisions I made (nobody could be asked mid-run)

1. **The funding organization in Chapter 1 is the Calder Foundry Relief Fund**, a charitable trust administered by Gerald Pike. It matches the false file ("industrial accident at Calder Foundry"), hides the Council until Chapter 5, and in Chapters 4–7 is traced to Harlan Street money and to Walter Rook's signature. This keeps the PDF's seed literal: *the organization pays for his care while denying him authority over his own life.*
2. **Corner team on fight night:** Coach Teddy Marsh (head trainer) and Lenny Voss (cutman/corner assistant). Teddy honestly thought it was nerves and sent Jin out; Lenny knew, pushed ("He's fine, Ted. Send him."), and handed Jin the cup in Locker Room B. Teddy is guilt, Lenny is complicity. Neither ordered anything.
3. **What was administered:** a paper cup of "water" handed to Jin before the walk-out, *after* he refused the bribe. Chapter 0 shows only fragments (white cup, bitter taste, a wrist wrapped in white tape, "You're dry, drink"). The paper cup becomes the game's main motif and closes in Chapter 10.
4. **Family timeline:** apartment lost May 1995 (Housing Court, rent arrears); Lindell House Room 9 from June 1995; fire on the night of **February 11, 1996**. Umma (Seo Mi-ok) born 1942; Min (Seo Min-ji) born 1972; Jin born March 14, 1968. They are buried by the county in Calder Municipal Cemetery, Section 14, markers 96-031 and 96-032, with a wooden cross added by Mrs. Okafor's church.
5. **The payout:** Jin was a 3-to-1 favourite. Harlan Street placed stakes on "Castell by KO, rounds 3–5" through out-of-state books, financed and laundered by Ashgrove Capital. The Council's negotiated share was **$640,000**, used on **September 28, 1994** to buy the four Foundry Courts buildings from the bankrupt foundry's pension trustee two days before a September 30 sale deadline (the plaque says September 30, the day the deed recorded).
6. **The knuckles** are a pair of brass knuckles that a collector, Benny Szabo, drops in the Chapter 2 alley. Bare-handed, Jin cannot put a collector down in that fight (their poise refills); the game says so and points at the knuckles. The player presses the button that picks them up.
7. **One Q1 money ladder** runs the whole campaign: a $6.40 activities jar (Ch1) → a $1,840 payroll envelope (Ch4) → an empty apartment someone else is waiting for (Ch5) → 24 homes (Ch9–10).
8. **Ray Castell's tell** (dropping his right shoulder before the straight right) is visible in Chapter 0 but nobody explains it. In Chapter 8 it is the key to the fight.
9. **Residents of Alder Row show a name only after Jin speaks to them.** Until then the label reads "Resident". Names learned are reused in both endings.
10. Jin's HP stays at 100 all game (per ARCHITECTURE: training never adds HP). His injury is expressed through `body.power`, breath, and which verbs are allowed.
11. **Hana always ends up holding a copy of the evidence** (so the PDF's "people outside the building hold copies" is always true). Other holders depend on relationships.

---

# Global

## Cast bible

Looks use the ARCHITECTURE `LookDef` vocabulary so the art can be built from it. Heights are standing pixel heights (Jin = 46).

### Jin Seo
- **Look (1994, Ch0):** 46 px, `build:'boxer'`. Dark-brown two-block hair, fringe over the eyes, no scar yet. Street: muted blue track top (`#4f6a86`, off-white sleeve stripes), black pants, white running shoes. Ring: navy robe with "EASTGATE" in off-white on the back (Umma sewed the letters), blue trunks with a white stripe and "SEO" on the waistband, red gloves.
- **Look (1996–97, Ch1–10):** same street outfit, slightly looser across the shoulders (thinner). Broad reddish healed scar patch on the right cheek. Ch1: `jin_hospital` gown, then `jin_rehab` (gray tee, navy sweatpants). From Ch2, `knuckles` extra when the gear is on.
- **Body language:** in 1994 he bounces on his toes, rolls his shoulders, keeps his chin up, and walks a little ahead of everyone. From 1996 he leans on walls with his hands in his pockets, puts his weight on the left leg when standing still, and turns his whole body slowly instead of snapping round. The guard still comes up instantly; speed is the one thing nobody took. Signature poses: `leanWall` under streetlights; `sitCurb` with forearms on knees; shadowboxing two quick jabs absent-mindedly when he is thinking.
- **Voice:** few words, dry, concrete. Inner voice (thoughts) is short sentences about physical things. He says "Umma" to and about his mother.
  - (1994, to Min) "It's a poster, Min. Nobody looks at the face."
  - (Ch1, thought) "Ceiling tiles. Thirty-seven. I counted yesterday too."
  - (Ch7, to Rook) "You had a list of names. Households. Was mine on it?"
- **Wants:** at first, to get his name back and find his family; after Chapter 2, someone to pay; after Chapter 6, for someone to say out loud what happened; by Chapter 9, the life he was promised in 1994.
- **Perspective on the conflict:** he was the cost nobody asked about, and the game makes him ask whether his suffering gives him the right to charge strangers.
- **Change:** from boxer to investigator to someone choosing where the cost falls. His *voice* changes by what the player did (see `jin_voice`).

### Min (Seo Min-ji), 22 in 1994
- **Look:** 40 px, `build:'slim'`, black `bob` with blunt bangs, oversized maroon cardigan over a gray Calder Community College tee, faded jeans, red sneakers (`#a8443c`), a camera strap across her body (Pentax K1000, black and silver), ink-stained fingers (one darker pixel on the right hand).
- **Body language:** sits on counters and backwards on chairs, points with a pen, elbows Jin, laughs with her shoulders. When serious she goes completely still, which is how the player learns to read her.
- **Voice:** fast, teasing, exact. Works at Kwik Copy, takes night classes in photography.
  - "They used your passport photo. You look like you're being arrested for tax fraud."
  - "If you win, Umma quits Saturdays. That's the deal. I already told her you agreed."
  - (letter, Ch6) "Jin-ah. Writing to the Box again, because it's the only address anyone gave me. Umma says hi. Umma says eat."
- **Wants:** Umma off her Saturday shift; to start the photography certificate; later, to find Jin, and to get the two of them through the winter.
- **Perspective:** she is the family's investigator. She refused "no record" a hundred times. The Chapter 6 investigation is Jin walking her route two years late.
- **Change:** present only in Chapter 0 and through memories, belongings and letters. Through those she goes from "the kid sister who mocks the poster" to the person who never stopped.

### Mother — Mrs. Seo Mi-ok ("Umma"), 52 in 1994
- **Look:** 40 px, `build:'old'`, gray-streaked black hair in a low `bun`, lavender work smock (`#9a8bb0`) over a cream blouse, brown cardigan, black flats, reading glasses on a beaded chain (`glasses` extra worn low).
- **Body language:** hands always busy (folding, wiping the counter, adjusting Jin's collar). Stands at the stove with her back half-turned while she says important things. Touches Jin's forearm instead of hugging.
- **Voice:** practical worry, love through food and logistics, Korean words mixed in.
  - "The Route 9 stops at midnight. If it goes long, we take a taxi. You pay."
  - "Eat first. Then hit people."
  - (time card margin note, Ch6) "Sat. — extra 4 hrs. For Min's books."
- **Wants:** her children safe; one free Saturday a week; to hear the Korean program on 1490 AM on Sunday mornings.
- **Perspective:** told by records. She kept working sixty-two-hour weeks, appealed the eviction in person, and wrote to the Housing Authority herself in careful block capitals.
- **Change:** none on screen after Chapter 0. Her stubbornness and dignity come out through the records.

### Coach Teddy Marsh, 61 in 1994
- **Look 1994:** 47 px, `build:'heavy'`, bald with a gray horseshoe of hair, white `mustache`, gray sweatshirt "MARSH B.C." in maroon, whistle on a cord, towel over one shoulder. **1996:** thinner, red-nosed, blue janitor's coverall (`uniform`), a ring of keys at the belt, a push broom.
- **Body language:** 1994 hands on hips, chin out, claps once to end a drill. 1996 shoulders rounded over the broom, avoids eye contact, crosses his arms when he is ashamed.
- **Voice:** gravel, gym proverbs that he now hears differently.
  - "Hands up, chin down, mouth shut. In that order."
  - "I said it was nerves. I said it to your face. Two years I've been saying it to the mirror."
  - (Ch8, at the stool) "It's water, kid. Watch me. ...See? Water."
- **Wants:** in 1994, a champion out of his gym. In 1996, to have been right; failing that, to be useful once.
- **Perspective:** he didn't know about the cup. He knew Jin said something was wrong and chose "nerves" because the alternative was stopping a title fight. He calls it his fault and means it.
- **Change:** if the relationship is built, he goes from janitor at the gym he lost to sitting in Jin's corner again in Chapter 8. He also opens the door to "occasional teaching at a gym" in Ending Two.

### Lenny Voss, 42 in 1994 / 45 in 1997
- **Look:** 44 px, `build:'slim'`, thinning `slick` hair, maroon windbreaker, gold chain, a cigarette behind one ear, and a **roll of white tape worn on his left wrist like a bracelet** (cutman's habit). The wrist is the clue in Chapter 0's fragments.
- **Body language:** fidgets, wipes his hands on a towel that isn't dirty, talks with his eyes on the exit, cowers (`cower`) the moment anyone raises a hand.
- **Voice:** fast, wheedling, swears on relatives, minimizes.
  - "It's water! It's just water, Jin, I swear on my mother."
  - "I carried a bucket. Everybody in that building carried something."
  - (if treated patiently) "I'll say it again. To a lawyer, a judge, whoever. Just don't make me say it to you twice."
- **Wants:** not to be hurt; money; to be forgiven without paying for it.
- **Perspective:** "Everybody took something. I took the least." It is half true, which is why it stings.
- **Change:** patient route: he finally states it plainly, keeps the original tape and agrees to testify. Pressed route: he runs and is never found to testify.

### The man in the camel coat (never named)
- **Look:** 48 px, `build:'avg'`, neat silver hair, camel overcoat (`coat` long, `#b08a5a`) in every season including August, charcoal suit, gray scarf, thin leather gloves. Never sweats, never sits.
- **Body language:** perfectly still; hands clasped behind his back; adjusts a cuff before he says something important. He is always at the edge of frame: a stairwell (Ch0), row 3 ringside (Ch0), the boardroom window (Ch9), a parked car at the end of Alder Row (Ch10).
- **Voice:** soft, reasonable, "practical advice".
  - "It isn't an insult, Jin. It's advice."
  - "Guaranteed money against everything you've got."
  - (Ch9) "I did tell you to take the money."
- **Wants:** deals that close. **Perspective:** everyone has a price; refusing it is a misunderstanding of arithmetic. **Change:** none. He is the system's constant.

### Ray Castell — the champion, 29 in 1994 / 32 in 1997
- **Look:** 50 px (taller than Jin, longer reach), `build:'boxer'`, close-cropped hair with a shaved part line. 1994: gold trunks with black trim, red robe. 1997: burgundy tracksuit with gold piping, gold chain, the belt over his shoulder at the press event, a gym bag with "CASTELL" in gold.
- **Body language:** chin high, hands low and loose (showman), talks to the crowd with an open palm. **Tell:** before his big straight right he drops his right shoulder for about 0.25 s. In Chapter 0 he also *pauses*. In round three, with Jin defenceless, his eyes go to row 3 ringside before he throws.
- **Voice:** smooth for cameras; raw and defensive in private.
  - "I didn't put anything in your cup. I just didn't stop. You want to hang me for not stopping?"
  - "You don't know what it is to be the guy everyone's paycheck stands on."
  - (if Jin resisted in Ch0) "You were still throwing in the third. I felt it. I still feel it in this hand."
- **Wants:** to stay relevant and keep the people who depend on him paid (trainer, cutman, a sponsor who put his face on a billboard). **Perspective:** "I didn't do it; I benefited." The PDF's line is that he knew, benefited, and continued when he could have stopped. **Change:** beaten, and Jin feels nothing restored. If Jin stops, Ray later gives the Athletic Commission a statement. If Jin continues, Ray's camp closes ranks.

### Hana Lim, rehabilitation worker, 29
- **Look:** 42 px, `build:'slim'`, black `ponytail` with a pencil through it, teal `scrubs` with a white cardigan, ID `badge` on a `lanyard`, white sneakers. Off duty (Ch6, 8, 9): navy peacoat, gray scarf.
- **Body language:** kneels to eye level with patients, hugs her clipboard to her chest when worried, one sharp clap to reset an exercise, `handShoulder`.
- **Voice:** warm, brisk, counts out loud; later quietly furious. She is Korean-American and can switch to Korean with Jin (a small private register in Ch1).
  - "Three more. Then you're allowed to hate me."
  - "I typed this file. I typed it from what Mr. Pike handed me."
  - (Ch9 night) "I won't tell you what to do. Everyone's been deciding for you. I'm not going to be one more."
- **Wants:** patients to go home; for a record to mean what it says.
- **Perspective:** she trusts records, then learns that records can be written by whoever pays. Most staff are ordinary caregivers and so is she. Her turn is a professional one.
- **Change:** rule-follower → the person who notarizes his identity (Ch6) → keeper of the evidence (Ch9) → in Ending Two, one of the people who take it to the public.

### Gerald Pike, liaison, Calder Foundry Relief Fund, 54
- **Look:** 44 px, `build:'slim'`, comb-over, wire `glasses`, brown suit a size too big, tan raincoat, briefcase (`bag:#5a4a3a`).
- **Body language:** stands too close to the bed, taps the chart with one finger, smiles with his mouth only (shown by head tilt), flinches at loud sounds.
- **Voice:** soothing administrative language that ends conversations.
  - "Confusion is normal, Daniel. The brain fills gaps with stories. Boxing is a very common story."
  - "All inquiries go through the Fund. It's for your protection."
  - (Ch6, cornered) "I'm a bookkeeper with a fund. I forwarded what I was told to forward."
- **Wants:** the file closed and his administrator's fee paid. **Perspective:** he sees himself as a clerk, not a jailer. **Change:** from smooth to terrified. He can be made to write a statement.

### Walter Rook, leader, Northside Community Council, 58
- **Look:** 48 px, `build:'broad'`, stooped, trimmed gray `beard`, flat `cap`, brown corduroy `blazer` with elbow patches over a cardigan, reading glasses pushed up on his forehead. Drives a brown Oldsmobile.
- **Body language:** a hand on everyone's shoulder; sits on stoops with residents; at his office window with his hands behind his back. In the confrontation he sits heavily and rubs his knuckles.
- **Voice:** organizer's cadence; names and numbers; never abstract when he can be specific.
  - "Ada Pruitt sat in that chair and cried, and I had eleven years of bake sales to show her."
  - "I told myself once. A man can live a long time on once."
  - (Ch5) "If you need work, a room, a doctor — I can make calls. That's all I'm good for anymore. Calls."
- **Wants:** Foundry Courts standing after he's gone. **Perspective:** polite fundraising failed for years and the criminal arrangement delivered. He believes the households outweigh one fighter, and he knows that belief is exactly what he can't defend to Jin's face.
- **Change:** concern → exposed → a man watching the outfit use his dependence to drag the Council into Alder Row. He is never a boss fight.

### Mara Kowalski, maintenance lead, Foundry Courts, 44
- **Look:** 44 px, `build:'broad'`, short ash-blond hair under a dark-green `beanie`, brown canvas work `jacket` over a gray hoodie, work boots, tool belt, reading glasses on a cord, pencil behind her ear.
- **Body language:** crouches at machines; points with a wrench; carries things on one shoulder; laughs with her head back; goes silent and keeps working when upset.
- **Voice:** blunt, funny, practical, mild Polish swears ("Jezus Maria").
  - "You can carry? Good. Don't punch anything while you're carrying. Radiators don't forgive."
  - "I don't pay late people. I barely pay early ones."
  - (Ch7) "I fixed these pipes with that money. I'd fix them again. That's the worst part."
- **Wants:** buildings that stand, a crew that gets paid on Friday, respect for work. Her father poured iron at Calder Foundry, which is why the false file's cover story ("industrial accident at Calder Foundry") lands on her when she reads it.
- **Perspective:** she knows the Council helped buy the buildings. She does not know about the fight (canon). After Chapter 7 she holds both truths and keeps working.
- **Change:** employer → friend → someone who, if the relationship holds, puts the Courts' truck across Alder Row in Ending Two.

### Mo Feeney, promoter, The Cellar, 60
- **Look:** 46 px, `build:'heavy'`, red face, white hair, plaid sport coat, open-collar shirt, pinky ring, cigar.
- **Body language:** leans on the ropes; licks his thumb to count bills; spreads his arms when he's being generous.
- **Voice:** jovial, transactional.
  - "Everybody down here's free to leave. Funny thing — nobody does."
  - "Admission's free for fighters. The price is you fight when I say, and you fall when I say."
- **Wants:** a full card and a sure bet. **Perspective:** business. **Change:** none, but he reappears in the Ch9 night, glad Jin is "finally being smart".

### The underground fighters (The Cellar)
- **Curtis "Slim" Dobbs, 19:** 47 px, very skinny, gray `hood`, red trunks, nervous bounce. *Fights for:* his place at Iron Pulse Fitness (the new owner lets Cellar fighters train free if they take every booking). "If I don't go three, Iron Pulse cuts me. That's the deal. I didn't make it." *Change:* depends on whether Jin carried him (Ch3). In Ch10 he is on the enforcer crew because he needs the money. Either he stands with Jin or he fights him.
- **Ollie Kraus, 34:** 50 px, `build:'heavy'`, bald, red beard, green trunks, union dock jacket. *Fights for:* pleasure and recognition. "Only place in Calder I'm allowed to hit a man and buy him a beer after." *Change:* stays himself; he's proof that not everyone down there is desperate.
- **Deshawn Pryor, 26:** 46 px, `build:'boxer'`, `braids`, white trunks with gold trim, small cross necklace, very calm. *Fights for:* debt. He owes Mo $1,100 and Mo collects it in arranged results. He sparred for Ray Castell's camp in 1996. "Round two I go down. Don't make it ugly. Some of us gotta be here next week." *Change:* via the dive choice. He becomes Jin's informant on Ray's habits, or someone who never forgets Jin's principles cost him $200.
- **Marisol "Mari" Ortega, 28:** 42 px, `ponytail`, purple top and shorts, taped knuckles. *Fights for:* rent. Teaches the slip. "Don't back up from a jab, papi. Move your head. Then he's the one in trouble."

### Dutch Brannigan, boss collector, Harlan Freight Depot, 52
- **Look:** 52 px, `build:'heavy'`, navy pea coat, black knit cap, gray stubble, a toothpick, scarred knuckles. A wedding ring on a chain (Moira).
- **Body language:** spreads his arms to fill doorways; walks forward slowly while Jin backs up; rolls his neck before he grabs.
- **Voice:** low and patient. "I don't chase. I wait for the wall." / "You got what you came for. Go home, kid."
- **Wants:** to collect and go home to Moira. **Perspective:** a job; Harlan Street pays his mortgage. **Change:** depends on Ch4. Spared, he steps aside at Alder Row ("I collect. I don't do this."). Beaten past the point of need, he comes back to Alder Row with a bandaged hand and a grudge.

### Foundry Courts residents (Ch5 onward)
Kept small; each has a reason to be on screen.
- **Ada Pruitt, 74 (Building B captain):** 38 px, `build:'old'`, white curls, purple housecoat over slacks, cardigan, house slippers; sits on her stoop on a kitchen chair. Forty-one years in 3B. "Walter got it done in three weeks. After eleven years of nothing. You understand what three weeks felt like?" In Ch7 she can't reconcile her gratitude with the truth: "He saved my home and he took your life. Both. I can't hold both, Jin."
- **Darnell Greer, 31 (maintenance crew; night shifts at the rail yard):** 47 px, `build:'broad'`, `buzz` cut, orange rail-yard safety vest over a hoodie. Short-tempered from exhaustion. His name is on the Ch4 payroll envelope. Ch7: one of the residents angry at Jin because he's afraid of losing his home. "You got your truth. I got two kids and a lease that says Courts Housing Partnership."
- **Tasha Greer, 29:** 42 px, `braids`, nurse's aide uniform (pale blue), coat. The family's translator: "Darnell's not mad at you. He's scared. It comes out the same."
- **Keisha (8) and Andre (6) Greer:** 30 / 28 px, kids. Keisha: yellow scarf, red sled; copies Jin's stance at the gym. "Is it true you were on TV?" Andre: follows Keisha everywhere.
- **Gus Lindqvist, 69:** 44 px, `old`, flat cap, wool coat, coughs (foundry lungs); fixes radios. Rejects Rook immediately in Ch7. "I poured iron forty years for a man who sold us to a bank. Now I find out who bought us back. Wonderful."
- **Luis "Lucho" Reyes, 33 (local boxer):** 47 px, `boxer`, curly hair, bus-company mechanic's overalls rolled to the waist over a white tank, hand wraps always in his back pocket. Former Golden Gloves; runs the basement gym for kids for free; also takes weekend boiler watch (he's on the payroll envelope). Training partner. "Half a second. Bang-bang-bang-bang. Then get out before he remembers he has hands."
- **Nell Faraday, 34 (Council on-site coordinator):** 43 px, cardigan, clipboard, sensible bob. "I just do the forms. I believed the forms."
- **Elena Vasquez, 38:** appears twice, at the site office asking about unit 4D; three kids (not shown). She exists so that taking 4D (Ch5) has a face.

### Celeste Ashgrove, chair, Ashgrove Capital, 56
- **Look:** 44 px, silver `bob`, black turtleneck under a charcoal tailored `suit`, pearl `earrings`. Seated at the end of the boardroom table; stands only once.
- **Body language:** perfectly economical. Folds her hands; looks at the city, not at people.
- **Voice:** dry, systemic, never threatening.
  - "Nobody in this room has ever hit anyone, Mr. Seo. That's rather the point."
  - "Expose us, and in three years a judge fines a holding company. Accept, and in three years you're champion of the world. Both are true. Choose which one you'd like to live in."
- **Wants:** returns and legitimacy. **Perspective:** the city needs capital, and poor neighbourhoods are a line item. **Change:** none; she is the place the money ends up.

### Lyle Penner, executive vice president, acquisitions, Ashgrove Capital, 44
- **Look:** 47 px, slim, navy `suit` with suspenders, rolled sleeves, horn-rimmed `glasses`, a fountain pen he clicks.
- **Body language:** stands by the glass-cased architectural model of "Alder Commons", leans on it, taps the tiny rowhouses with the pen.
- **Voice:** brisk, enthusiastic, numbers, smiles. "Let's be adults about the upside." He gave the final instruction in 1994 ("Now.") by phone to Castell's trainer at the end of round two.
- **Wants:** the Alder Row closing on May 9, 1997, and Jin as the face of it. **Perspective:** risk is something you price. **Change:** none on screen; in Ending Two the epilogue reports what accountability reaches him.

### Alder Row residents (Ch10 only — strangers)
No backstories; each is shown doing one human thing. Their label reads "Resident" until Jin talks to them; then their name appears and is stored in `ch10_names_learned`.
- **Mr. Haile** (shopkeeper, 60s): pulling the grate down on Alder Market two hours early. "Nobody's buying milk this morning."
- **Rosa Medina** (30s): dragging a crib mattress away from the entrance. "Help me with this or get out of the way."
- **Hollis Grant** (co-op chair, 60s, cardigan, clipboard): arguing on the steps. "If we lock the doors, they call it resisting. If we open them, they call it consent."
- **Terrence Grant** (19, Hollis's grandson): wants to fight back; holds a broom handle. "You're the boxer. From the TV. You're with them?"
- **Mr. Fitch** (80s): on a folding chair in the community garden with a transistor radio playing the early ballgame; doesn't move.
- **June** (10): circles on a bike, delivering the co-op's flyers ("MEETING 6 AM — DO NOT SIGN ANYTHING").

---
## Flags & relationships registry

### Rules the whole registry obeys
1. **The ending reads exactly one flag: `ch10_choice`.** Nothing else gates which ending plays. Every other flag changes lines, who shows up, how hard a fight is, what an epilogue vignette shows, or which optional scene exists. Both final options are always offered and always enabled (`A.choice` never hides either).
2. **No visible morality meter.** The Journal's People tab shows a *sentence* per relationship ("She worries about you out loud"), never a number. The chapter completion screen lists "Choices made this chapter" in plain words ("You left the payroll envelope on the desk.").
3. **Reflect the player, don't judge them.** Jin's lines quote what the player actually did. A restrained player never hears Jin talk as if he brutalized people; a player who took things hears Jin name them.
4. **Hidden options, never trap options.** When a relationship or flag disables an option, it is hidden (ARCHITECTURE `A.choice` rule), and no option text misrepresents its result. Choices that hurt someone say so in brackets: `[Hit him again]`.
5. **Autosave right after every flagged choice** (`A.checkpoint`) so the choice is the player's, made once.

### The four questions as a ladder
The PDF's four recurring questions, asked at growing scale. Each row is a flagged choice; nothing on the ladder blocks progression.

| Question | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Ch8 | Ch9–10 |
|---|---|---|---|---|---|---|---|---|
| **Q1 — take money/goods already allocated to someone else?** | $6.40 activities jar (`ch1_fare_source`) | — | inverse: pay Deshawn's docked $200 (`ch3_deshawn_paid`); Mo's paid dives (`ch3_mo_deal`) | $1,840 payroll envelope (`ch4_envelope`) | Unit 4D, promised to the Vasquez family (`ch5_took_unit_4d`) | — | — | 24 homes (`ch10_choice`) |
| **Q2 — threaten a frightened witness to save time?** | — | — | Lenny (`ch3_lenny_method`) | Roz the dispatcher (`ch4_roz`) | — | Wendell Asher (`ch6_asher_method`) | — | Owen Tully (`ch9_owen`) |
| **Q3 — abandon a commitment for an investigative opportunity?** | wait for Hana vs. go alone (`ch1_records_route`) | — | — | — | boiler vs. site office (`ch5_left_repair`) | — | Lucho's corner vs. Ray tonight (`ch8_lucho_commitment`) | — |
| **Q4 — keep hurting someone after getting what you need?** | — | Benny Szabo (`ch2_collector_after`) | Slim, carry or finish (`ch3_slim_carried`) | Dutch (`ch4_dutch_after`) | — | — | Ray Castell (`ch8_ray_after`, canon) | — |

### Choice flags (complete list)

| Flag id | Values | Set where | Read where |
|---|---|---|---|
| `ch0_purse_dream` | `rent` / `umma_saturdays` / `new_apartment` | Ch0 kitchen, Min asks "So what's the purse for?" | Ch2 Okafor ("Your mother told everyone you'd …"); Ch6 Min's letter line; Ch10 both endings (what Jin's money finally buys, or doesn't) |
| `ch0_refusal_line` | `not_for_sale` / `my_family` / `step_aside` | Ch0 stairwell bribe (all three refuse) | Ch9 Penner quotes it back word for word; Ch10 Jin's last thought before the choice |
| `ch0_told_teddy` | bool | Ch0 locker room: tell Teddy about the offer or not | Ch2 Teddy ("You told me about the coat. I told you we'd win anyway.") / ("You never said a word about a coat? Jesus, kid."); Ch8 Teddy corner line |
| `ch0_resistance` | 0–3 | Ch0 round 3: counts counters landed and guard holds while sabotaged | Ch8 Ray's pre-fight line; Ch8 memory `mem_08_corner` variant |
| `ch1_pike_stance` | `played_along` / `insisted` | Ch1 Pike's second visit: answer to "your name?" | Ch1 freedom (played along: day-room pass early; insisted: phone privileges revoked, Hana sees it); Ch2 collectors' timing (insisted: van already waiting at Kessler Ave; played along: van arrives at dusk); Ch6 Pike's file note on Jin |
| `ch1_records_route` | `with_hana` / `alone_at_night` | Ch1, finding the transfer form | Hana rel (+2 / 0); Ch1 Hana scene variant; Ch6 Hana line ("You could have trusted me." / "We found it together. I'm not stopping now.") |
| `ch1_fare_source` | `hana_loan` / `activities_jar` / `mr_bell` | Ch1 leaving St. Agnes, bus fare | Ch1 Hana; Ch6 Hana (repay prompt or the jar line); Ch9 Penner (only if jar: "Even the bingo money."); Ch10 Jin's reflection |
| `ch2_collector_after` | `let_go` / `hit_again` | Ch2 alley, after Benny names Lenny | Ch3 Lenny ("Benny says you let him walk" / "Benny's jaw is wired"); Ch6 Benny at Pike's office (steps aside / is in hospital); Ch10 Benny on the crew (steps aside / fights) |
| `ch2_teddy_met` | bool | Ch2 optional Iron Pulse night | enables Teddy's mitts drills; Teddy's rel |
| `ch2_teddy_tone` | `blamed` / `forgave` / `asked` | Ch2 Teddy conversation | Teddy rel (−1 / +2 / +1); Ch8 corner |
| `ch2_took_mailbox` | bool | Ch2 Petra Novak offers the shoebox of mail | gives `ev_returned_letter` early (also obtainable in Ch6) |
| `ch3_slim_carried` | bool | Ch3 bout 1 (carry Slim to the bell or knock him out) | Slim rel; Ch3 Slim's gym bag scene; Ch10 Slim on the crew stands with Jin / fights him |
| `ch3_deshawn_dive` | `accepted` / `refused` | Ch3 before bout 3 | Deshawn rel; bout 3 length and difficulty; Ch8 Deshawn's intel on Ray; Ch9 Penner (if accepted: "You've taken a gift before"); Ch10 reflection |
| `ch3_deshawn_paid` | bool | Ch3 after Mo docks Deshawn $200 (only if refused) | Deshawn rel +2; money −200 |
| `ch3_cup` | `drank` / `poured` | Ch3, Lenny offers a paper cup between rounds | Lenny's panic line; `mem_00_cup` fills either way; Ch8 Teddy's cup scene variant |
| `ch3_lenny_method` | `patient` / `pressed` | Ch3 pinsetter loft | Lenny rel (+2 / −3); tape completeness; Lenny as copy holder and witness; Ch10 epilogue |
| `ch3_mo_deal` | `accepted` / `declined` | Ch3, Mo's Saturday offer | unlocks "Saturday at the Cellar" (max 2 dives, $150 each) |
| `cellar_dives_taken` | 0–2 | each Saturday dive taken (Ch4–Ch6 free time) | Ch8 Ray ("You took dives in a bowling alley basement and you want to talk to me about integrity?"); Ch9 Penner; Ch10 reflection |
| `ch4_roz` | `let_go` / `threatened` | Ch4 dispatch room | Roz as witness/copy holder; how the safe combination is found |
| `ch4_took_profit` | bool | Ch4 counting room, the "to A.C." stacks ($600) | Ch4 Dutch line; Ch9 Celeste ("You took six hundred dollars of ours. Consider it an advance."). No harm to innocents. |
| `ch4_envelope` | `taken` / `left` | Ch4 counting room, payroll envelope ($1,840) | Ch4 end (Doc Ferris and a room affordable); Ch5 whole chapter (missed wages, roof leak, meeting topic); Ch7 Darnell; Ch9 Penner; Ch10 reflection |
| `ch4_dutch_after` | `walked_away` / `kept_going` | Ch4 river lot after the boss | Ch10 crew boss (Dutch steps aside / Dutch fights with a grudge) |
| `ch5_envelope_outcome` | `none` / `confessed` / `returned_anon` / `kept` | Ch5 workshop pay tin (only if envelope taken) | Mara rel; Ch7 Mara line; Ch10 reflection |
| `ch5_left_repair` | bool | Ch5 day 3, boiler repair vs. the open site office | Mara rel −2, courts −1, Greer kids sleep at Ada's; gives `ev_chp_schedule` early (otherwise found in Ch7) |
| `ch5_meeting_stance` | `roof` / `payroll` / `heater` / `independence` / `silent` | Ch5 residents' meeting | courts rel; Ch7 reactions; visible props (bucket or heater) |
| `ch5_donation` | integer $ | Ch5 meeting, optional | courts rel +1 if ≥ $50; Ada's line |
| `ch5_took_unit_4d` | bool | Ch5 day 4, Rook offers unit 4D | Ch6 rest point; Elena Vasquez scene; Ch7 Rook and Nell lines; Ch9 Penner; Ch10 reflection |
| `ch5_trained_kids` | bool | Ch5 optional, hold mitts for Keisha | Ending Two teaching vignette shows Keisha |
| `ch6_asher_method` | `patient` / `threatened` | Ch6 Garrison Street laundromat | Asher's testimony and witness status; copy holder |
| `ch6_strippers` | `talked_down` / `fought` | Ch6 Lindell House ruin | flavour only (the fight is short either way) |
| `ch6_pike_statement` | bool | Ch6 Pike's office: make him write it down | adds `ev_pike_statement`; Ending Two epilogue line about Pike |
| `ch6_hana_repaid` | bool | Ch6, if `ch1_fare_source == hana_loan` | Hana +1 |
| `ch7_truth_told_by` | `jin` / `rook` | Ch7 after the confrontation | how the residents' reactions sequence plays; Rook's later standing; Mara line |
| `ch7_rook_answer` | `would_have_asked` / `dont_know` / `not_this` | Ch7, Rook asks "What would you have done?" | Ch9 night Gus/Ada lines; Ch10 Jin's last thought |
| `ch8_lucho_commitment` | `kept` / `abandoned` | Ch8 opening | Lucho rel (+2 / −2); Ch8 approach difficulty (kept = heavier security two nights later) |
| `ch8_lucho_call` | `stopped` / `sent` | Ch8 Armory corner (only if kept) | Lucho line; Ch10 Jin's reflection about corners |
| `ch8_hands` | `wraps` / `knuckles` | Ch8 locker room before Ray | Ray line; Teddy line; damage/poise numbers |
| `ch8_ray_after` | `stopped` / `continued` | Ch8 after Ray is defeated (canon choice) | Teddy, Hana, Deshawn, Mara, Lucho reactions; Ray's statement (stopped) or Ray's camp hostile (continued); Ch9 Penner; Ending Two epilogue |
| `copy_holder_*` | bool each: `hana` (always), `mara`, `teddy`, `lenny`, `deshawn`, `roz`, `asher` | Ch8 dawn at Kwik Copy: choose who gets an envelope (only people with rel ≥ 1, or witness flags) | Ch9 Penner names them; Ending Two epilogue texture (how fast and how far exposure goes) |
| `ch9_owen` | `persuaded` / `threatened` | Ch9 floor 22 | `ev_relocation_model` (persuaded only); Ending Two epilogue (Owen testifies) |
| `ch9_night_visits` | list of ids | Ch9 consideration night | nothing mechanical; each visit is a perspective |
| `ch10_names_learned` | list of resident ids | Ch10, talking to Alder Row residents | both endings: administrative report (Champion) / morning vignette (His Own Name) |
| `ch10_choice` | `accept` / `refuse` | Ch10 at the gate | **the ending** |

### Derived values (computed, never shown as numbers)
- `harm_count` = number of: `ch2_collector_after=hit_again`, `ch3_lenny_method=pressed`, `ch4_roz=threatened`, `ch4_dutch_after=kept_going`, `ch6_asher_method=threatened`, `ch8_ray_after=continued`, `ch9_owen=threatened`.
- `take_count` = number of: `ch1_fare_source=activities_jar`, `ch4_envelope=taken` with `ch5_envelope_outcome ∈ {kept, none}`, `ch5_took_unit_4d`, `cellar_dives_taken > 0`.
- `jin_voice` = `restrained` (harm 0), `mixed` (1–2), `hard` (3+). Used **only** to pick line variants: Jin's thoughts, how he speaks to frightened people, and how others describe him ("You don't swing at people who are down" vs. "Everybody's heard what you did to Dutch"). The ending never reads it.
- `support_at_alder` = the set of allies who appear in Ending Two (see Ch10). Built from relationships, not from `jin_voice`.

### Relationship meters
Integer, range −3…+5, start 0. People-tab sentence bands: ≤ −2 "cold", −1…0 "wary", 1–2 "warm", 3–4 "trusts you", 5 "would lie for you".

| Meter | Raised by | Lowered by | Read for |
|---|---|---|---|
| `hana` | Ch1 parallel bars sessions done (+1), `with_hana` (+2), telling her the truth about boxing (+1), Ch2 payphone call (+1), `ch6_hana_repaid` (+1), Ch8 calling her after Ray (+1) | `alone_at_night` (0 instead of +2), `activities_jar` (−1 when she finds out in Ch6), `ch8_ray_after=continued` (−1) | Ch6 she brings Dr. Whitlow's affidavit (always; it's her job), ≥3: she also brings St. Agnes's call log; Ch9 night line; Ending Two: ≥3 she brings the Calder Ledger reporter to Alder Row |
| `teddy` | Ch2 `forgave` (+2) / `asked` (+1); each mitts session (+1, max +2); Ch3 telling him about the cup (+1) | Ch2 `blamed` (−1); `ch8_ray_after=continued` (−1) | ≥2: Teddy in Jin's corner at Calder Civic (Ch8) and at Alder Row (Ending Two hints between waves); Ending Two teaching vignette |
| `lenny` | `patient` (+2), pouring the cup out without anger (+0) | `pressed` (−3) | ≥1: Lenny keeps the original tape and testifies (Ending Two) |
| `slim` | `ch3_slim_carried` (+3) | knocked out fast (−2) | Ch10: ≥1 Slim drops his hands and stands with the residents; ≤0 he fights |
| `deshawn` | `accepted` (+1), `refused`+`paid` (+2), `refused` unpaid (−2) | — | ≥1: Ray's tell confirmed in Ch8 (Deshawn: "He drops that right shoulder. Every time."); ≥2: he fights beside Jin in Ending Two wave 3 |
| `mara` | each work shift (+1, max +3), `confessed` (+1), staying on the boiler (+2), roof vote (+1) | `left_repair` (−2), `kept` envelope (−1 when she finds the tin short in Ch7), `ch8_ray_after=continued` (−1) | ≥1 copy holder; ≥2: the Courts' truck blocks the vans in Ending Two; Ch9 night line |
| `lucho` | mitts and sparring done (+1 each), `ch5_trained_kids` (+1), `ch8_lucho_commitment=kept` (+2) | `abandoned` (−2) | ≥2: fights beside Jin in Ending Two wave 2 |
| `courts` (Foundry residents, collective) | work shifts (+1 each, max +2), staying on the boiler (+1), donation ≥ $50 (+1), `ch7_truth_told_by=rook` (+1: they heard it from him) | `left_repair` (−1), `ch5_took_unit_4d` (−1), `ch4_envelope=taken`+`kept` (−1) | Ch7 who is angry at Jin; Ch9 night; Ending Two: ≥2 residents of the Courts (Ada, Gus) appear in the epilogue hearing |

Rook, Ray, Pike, Mo, Dutch and Ashgrove have **no meters**. What they think of Jin is read from flags, because their views don't move with kindness.
