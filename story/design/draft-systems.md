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
12. **Ch6's timeline board will not accept a single cause.** Its four lanes are the PDF's four failures; dragging one card to "What killed them?" is answered and returned, and the board resolves only with the center left empty. This is how the game obeys "do not claim a single answered letter would have prevented every tragedy."
13. **Ch8's stop/continue is played, not picked.** After the knockdown, Sal rings the Ch0 bell over and over; walking to the neutral corner stops, and only a second deliberate attack press continues (the first press only raises the fist), so nobody "continues" by mashing.
14. **Ch9's deadline is stated once and never counts down.** The consideration days end only when the player sleeps. Alder Row cannot be visited before Ch10, so its residents stay strangers.
15. **Allies at Alder Row come for Alder Row**, because they read the closing memo in their Ch8 envelopes, not because Jin asked them. In Ending Two they arrive only after the refusal (so the choice is made without knowing who will come); in Ending One the closest of them arrives, sees, and leaves.
16. **Ending Two closes Umma's note on the Housing Court judgment:** Jin finally signs for his held 1994 purse ($9,400 after fees) and spends it on 3B's arrears, two stones with their names, and rent. He stays poor.
17. The Boston program in the offer is the fictional **Beacon Street Institute**; no real hospital is named.

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
- **Change:** rule-follower → the person who brings Dr. Whitlow's affidavit that proves who he is (Ch6) → keeper of the evidence (Ch9) → in Ending Two, one of the people who take it to the public.

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

### Supporting cast (each one carries a fact, a choice or a perspective; nobody is filler)
| id | Name, look | Chapter(s) | Why they exist |
|---|---|---|---|
| `okafor` | **Grace Okafor**, 66, Nigerian-American, 40 px `old`, head wrap in green and gold, brown cardigan over a church dress, house slippers, a rosary in her pocket. Former neighbour in 3A. Talks slowly, says "my dear". | 2, 6, epilogue | Tells Jin the basic facts of his family's death and where their belongings are. Her church paid for the wooden cross. |
| `petra` | **Petra Novak**, 35, current tenant of 3B, 44 px, blond `ponytail`, Calder Transit bus-driver uniform (navy, red stripe), a toddler on her hip. Wary, then kind. | 2 | Living proof that the apartment is someone else's home. Offers the shoebox of mail that kept coming for SEO. |
| `bell` | **Harold Bell**, 81, long-term resident at St. Agnes, 40 px `old`, wheelchair, plaid blanket, a transistor radio on his lap tuned to ballgames. Ex-streetcar conductor. | 1 | The day-room friend. Offers Jin his own bus fare as a gift (one of the three fare options). |
| `whitlow` | **Dr. Anita Whitlow**, 50, St. Agnes attending physiatrist, 44 px, gray `bob`, white coat over a maroon sweater, reading glasses. | 1, 6 | States the price of real treatment ($84,000) on day one, and in Ch6 signs the identity affidavit Hana brings. |
| `benny` | **Benny Szabo**, 38, collector, 50 px `heavy`, gray hoodie under a quilted vest, watch cap. Breathes through his mouth. | 2, 6, 10 | The collector who drops the knuckles and names Lenny. Q4 at its smallest scale. |
| `roz` | **Rosalind "Roz" Kaminski**, 57, Harlan Freight night dispatcher, 40 px, frizzy red-gray `curly`, cardigan, cigarette, headset around her neck. | 4, (8), epilogue | The frightened witness at the depot. Knows the safe combination and who signs for the Courts' envelopes. |
| `asher` | **Wendell Asher**, 61, former Lindell House night manager, now folds sheets at Garrison Suds laundromat, 44 px `slim`, gray `short`, cardigan with holes at the elbows. Can't stop folding while he talks. | 6, epilogue | He chained the rear exit on the owner's order. The frightened witness of Ch6. |
| `dot` | **Dot Pham**, 30, Kwik Copy shift lead, 40 px, black `bob` with a red clip, Kwik Copy polo (red), toner on her sleeves. Min's coworker and friend. | 6, 8 | Develops Min's last roll of film; opens the shop at dawn so Jin can copy the evidence. |
| `ferris` | **Doc Ferris** (Raymond Ferris), 70, struck-off doctor who stitches fighters behind Starlite Lanes, 44 px, cardigan, bow tie, rubber gloves. | 3–6 | The money sink that shows what money can and cannot buy. His price list ends with: "Real rehab: $84,000. Not here." |
| `nell` | (see Foundry Courts) | | |
| `sal` | **Sal Bruno**, 66, Ray Castell's trainer, 44 px, white `short`, black windbreaker "CASTELL" in gold, towel. | 8 | Took the phone call at the end of round two in 1994. Keeps the notebook. |
| `owen` | **Owen Tully**, 27, junior analyst, Ashgrove Acquisitions, 44 px `slim`, white shirt, loosened tie, sleeves rolled, coffee stains. | 9 | The frightened witness of Ch9. Built the relocation model and hates it. |
| `carrow` | **Vince Carrow**, 45, Harlan Street crew boss for Alder Row (if Dutch is absent), 48 px `broad`, leather jacket, clipboard. | 10 | Runs the clearance. Talks about it like moving furniture. |

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

Added in the Chapters 6–10 pass: **Q1** Ch6 giving 4D back (`ch6_gave_back_4d`, the 4D question's second chance); **Q4** Ch7 Rook offers his face once his admission is out (`ch7_hit_rook`); **Q2** Ch9 is literal about time: threatening Owen saves eight floors of stairs and costs Owen his job; **Q3** Ch8 is chosen by which bus Jin takes.

### Choice flags (complete list)

| Flag id | Values | Set where | Read where |
|---|---|---|---|
| `ch0_purse_dream` | `rent` / `umma_saturdays` / `new_apartment` | Ch0 kitchen, Min asks "So what's the purse for?" | Ch2 Okafor ("Your mother told everyone you'd …"); Ch6 Min's letter line; Ch10 both endings (what Jin's money finally buys, or doesn't) |
| `ch0_refusal_line` | `not_for_sale` / `my_family` / `step_aside` | Ch0 stairwell bribe (all three refuse) | Ch9 Penner quotes it back word for word; Ch10 Jin's last thought before the choice |
| `ch0_told_teddy` | bool | Ch0 locker room: tell Teddy about the offer or not | Ch2 Teddy ("You told me about the coat. I told you we'd win anyway.") / ("You never said a word about a coat? Jesus, kid."); Ch8 Teddy corner line |
| `ch0_resistance` | 0–3 | Ch0 round 3: counts counters landed and guard holds while sabotaged | Ch8 Ray's pre-fight line; Ch8 memory `mem_08_corner` variant |
| `ch1_pike_stance` | `played_along` / `insisted` | Ch1 Pike's second visit: answer to "your name?" | Ch1 freedom (played along: day-room pass early; insisted: phone privileges revoked, Hana sees it); Ch2 collectors' timing (insisted: van already waiting at Kessler Ave; played along: van arrives at dusk); Ch6 Pike's file note on Jin |
| `ch1_told_hana_boxing` | bool | Ch1 parallel bars, second week | `hana` +1; Ch6 Sunny's line |
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
| `ch6_gave_back_4d` | bool | Ch6 Ada's front room (only if `ch5_took_unit_4d`) | `courts` +1; removes 4D from `take_count`; Ch7 Rook; Ch9 Penner; Ch10 thought |
| `ch6_okafor_photo` | bool | Ch6 side quest | Ch9 night; Ending Two vignette |
| `ch6_flowers` | bool | Ch6 cemetery ($5) | Ch9 night; map |
| `ch7_hit_rook` | bool | Ch7 end of the confrontation | `harm_count`; Ch7 meeting bruise; Ch9 night Rook |
| `ch7_lucho_promise` | `yes` / `try` | Ch7 after the meeting | Ch8 commitment lines |
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
- `harm_count` = number of: `ch2_collector_after=hit_again`, `ch3_lenny_method=pressed`, `ch4_roz=threatened`, `ch4_dutch_after=kept_going`, `ch6_asher_method=threatened`, `ch7_hit_rook`, `ch8_ray_after=continued`, `ch9_owen=threatened`.
- `take_count` = number of: `ch1_fare_source=activities_jar`, `ch4_envelope=taken` with `ch5_envelope_outcome ∈ {kept, none}`, `ch5_took_unit_4d` (unless `ch6_gave_back_4d`), `cellar_dives_taken > 0`.
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

---
## Evidence and memory registry

### How evidence works
- Evidence lives in Journal → Evidence, grouped by **Claim** (not by chapter), so the player watches an argument assemble: *Who I am* · *What happened on August 20* · *Where the money went* · *What happened to Umma and Min* · *Who chose* · *What they want next*.
- Every item has a **"Proves"** line written plainly. Items marked ★ are on the critical path and cannot be missed (the location will not let Jin leave until they are taken, with a stated reason: "I'm not walking out of here without that file."). Everything else is optional, and optional items only add lines, witnesses or epilogue texture, never gate the ending.
- Evidence is used three ways: the **timeline board** (Ch6, Ch7), **present** confrontations (Lenny Ch3, Pike Ch6, Rook Ch7, Ray Ch8, Penner Ch9), and the **copy run** (Ch8 dawn: what goes into the envelopes).

### Evidence (id · title · kind · where found · text summary · what it proves)

**Chapter 1 — St. Agnes**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_name_card` ★ | Name card, Bed 214-B | Above Jin's bed, `stagnes_room214` | Typed card in a plastic sleeve: "AHN, DANIEL · DOB 03/02/67 · ADM 08/23/94 · DR. WHITLOW · FUNDING: CFRF". | The name he's been living under. |
| `ev_current_file` ★ | St. Agnes face sheet (current) | Nurses' station chart rack, read with Hana's permission (or after hours) | "AHN, Daniel. MR# 4471-0. Mechanism of injury: industrial accident, Calder Foundry (fall from height, salvage operation). Admitted from: Calder Foundry occupational clinic. Sponsor: Calder Foundry Relief Fund, liaison G. Pike. Family: none on record. All inquiries to sponsor." Typed by H. Lim, 02/95 records conversion. | The official story. |
| `ev_transfer_form` ★ | Inter-facility transfer form, Calder General → St. Agnes | Records room, basement, `stagnes_records`, box "ADMISSIONS 1994 Q3 — ORIGINALS" | Carbon form dated 08/23/94: "Patient SEO, JIN · DOB 03/14/68 · MR# 4471-0 · Dx: closed head injury, sustained in professional boxing contest 08/20/94, Calder Civic Arena · Transfer authorized by G. Pike for sponsor · Family notified: ____ (blank)". | **Someone replaced his identifying information after the fight.** Same MR number, different name, different injury. |
| `ev_whitlow_note` | Dr. Whitlow's discharge recommendation | Given to Jin at discharge | "Recommended: 18-month outpatient neuro-rehabilitation program (Calder University Hospital). Estimated cost $84,000. Funding: none identified. Sponsor declined." | The price of real recovery. Shown so the player knows from day one that ordinary money will never reach it. |
| `ev_pike_card` | Gerald Pike's business card | Pike drops it on the bedside table (Ch1 visit 1) | "Gerald T. Pike · Liaison · Calder Foundry Relief Fund · 88 Market Street, 2nd floor · P.O. Box 1180, Calder". | Where the Fund lives. Pays off in Ch6. |
| `ev_property_tag` | Patient property bag, "SEO, J." | Records room, patient-property shelf (found with the transfer form) | Calder General ER property bag, tag "SEO, J. · ER 8/20/94 · MR# 4471-0". Inside: blue track top, black pants, white running shoes, wallet with an Athletic Commission license card "SEO, JIN · Professional Boxer · Lic. CA-1187". | His own clothes and his own name, filed under the same number as Daniel Ahn. |

**Chapter 2 — Eastgate**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_jin_poster` | Torn fight poster | Poster wall at Kessler & 5th, under three layers (peel interaction) | "CHAMPIONSHIP NIGHT · RAY 'THE PROMISE' CASTELL vs JIN SEO 'EASTGATE' · SAT AUG 20 · CALDER CIVIC ARENA". Jin's face is the passport photo Min mocked. | He existed. A thing to carry. |
| `ev_okafor_account` ★ | Mrs. Okafor's account | Talking to Mrs. Okafor, 3A | Evicted May '95. Lindell House, Garrison Street, from June. Fire the night of February 11, 1996. Both died. Buried by the county, Calder Municipal, Section 14. "What the fire didn't take, the county boxed. The property room at the City Hall Annex. Ask under Seo." | The basic facts. The full sequence comes in Ch6. |
| `ev_returned_letter` | Undelivered Housing Authority letter | Petra Novak's shoebox (if `ch2_took_mailbox`), else Ch6 Annex mail-return bin | Calder Housing Authority to Seo Mi-ok, 412 Kessler 3B, dated Oct 4, 1995: "Your emergency relocation application cannot be processed. Provide proof of income for all adult household members, including SEO, JIN. If a household member is missing, provide a police report number. Respond within 30 days." Stamped "RETURN TO SENDER — MOVED, FORWARDING EXPIRED". | Requests for help were delayed and redirected by paperwork that demanded Jin's whereabouts. |
| `ev_pickup_order` ★ | Collector's pickup slip | Benny Szabo's vest pocket after the alley fight (questioning) | Carbon slip: "PICKUP — AHN, D. — Kessler Ave area — return to St. Agnes — $300 on delivery — job via L.V." | Pike's collectors were hired through Lenny Voss. |

**Chapter 3 — The Cellar**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_booking_card` | Mo's booking card | Mo's card table by the betting cage (examine while Mo is upstairs) | Index card: "SAT 1/11 · SEO (new) vs DOBBS — 3 rds · SEO vs KRAUS — 3 · SEO vs PRYOR — PRYOR GOES R2 ($200 off his #)". | Results are arranged down here too. |
| `ev_lenny_tape` ★ | Lenny's microcassette | Lenny's pinsetter loft, inside a coffee can | A phone call Lenny taped in Aug 1994 "for insurance". **Complete** (patient): "...in the cup, before the walk. Give it ten minutes, he's slow by the third." "Who's paying?" "Freight office on Dock Road pays. Brannigan hands it over. Don't call this number again." **Partial** (pressed: Lenny yanks the tape and it stretches): the dose and "Dock Road" survive; the name Brannigan is lost. | The fight was manipulated; the money ran through the Harlan Freight Depot on Dock Road. |
| `ev_lenny_receipt` ★ | Lenny's pay receipt | Same coffee can | Harlan Freight Co. cash voucher: "L. Voss · corner services · 08/21/94 · $5,000 · approved D.B." | Payment for the corner, from the depot. |
| `ev_lenny_statement` | Lenny's statement | Pinsetter loft confession | Patient: he handed Jin the cup in Locker Room B, it was "something to slow you down, they said nothing permanent". Pressed: "I carried a bucket. That's all. Ask Dock Road." | His role, minimized or plain. |

**Chapter 4 — Harlan Freight Depot**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_depot_ledger_94` ★ | Ledger, August 1994 | Dutch's office safe | "8/20 L.V. corner 5,000 · 8/20 Civic security (4) 1,200 · 8/22 private ambulance, Calder Gen → St. Agnes, 2,500, per G.P. · 8/23 St. Agnes deposit, patient 'D. Ahn', via CFRF 11,200 · 8/24 book settlement: Castell KO R3–5, receivable via A.C. 2,100,000". | The gang paid for the sabotage, the transfer and the false name. |
| `ev_chp_disbursements` ★ | Disbursement ledger, "C.H.P." | Counting room filing cabinet | "Courts Housing Partnership · 9/28/94 purchase (NCC share) 640,000 · 3/95 roof Bldg C 14,200 · 11/95 boiler parts 3,880 · 6/96 community room 9,400 · weekly maint. payroll 1,840". | Criminal money has legitimate destinations. Jin's first reading: a front. |
| `ev_payroll_note` | Payroll envelope (or its label) | Counting room desk | Manila envelope, typed label: "C.H.P. MAINT. PAYROLL · WK OF 1/27/97 · $1,840 · Kowalski 560 · Greer 480 · Reyes 400 · Lindqvist 200 · Pruitt (bldg capt.) 200 · deliver Tue. w/ N. Faraday". If left, Jin copies the label into his notebook. | Whose money it is. |
| `ev_roz_account` | Roz's account | Dispatch room | Patient: Tuesday envelopes go to "a woman from the Courts, Nell, she signs"; Dutch "drove the ambulance money himself in '94". Threatened: only the safe combination. | The depot routine; the human chain. |

**Chapter 5 — Foundry Courts**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_courts_plaque` ★ | Lobby plaque, Building A | `courts_lobby_a` | Bronze: "FOUNDRY COURTS · 212 households kept in their homes · Purchased by the residents with the Northside Community Council · September 30, 1994". | Purchased 41 days after the fight. Suspicion, not proof. |
| `ev_mara_foundry` | Mara on Calder Foundry | Mara, after Jin shows her the St. Agnes file | "Foundry poured its last heat in March '93. My father turned off the cupola himself. Salvage crew in '94 was my cousin's outfit. Nobody fell." | The false file's cover story is impossible. |
| `ev_chp_schedule` | CHP purchase schedule | Site office (Ch5 if `ch5_left_repair`, else Ch7 from Nell) | "Purchase closed 9/28/94 · recorded 9/30/94 · price $1,150,000 · sources: tenant contributions $96,000; city HOME grant $414,000; NCC capital contribution $640,000 (received 9/27/94)". | The Council's share arrived seven days after a big settlement. Still not proof of where the Council got it. |

**Chapter 6 — Garrison Street, the Annex, the Fund**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_housing_court` | Housing Court judgment | Annex, Housing Court records window | Calder Housing Court, April 11, 1995, *Kessler Realty v. Seo*: arrears $1,140; judgment for possession; tenant appeared in person, requested 60-day stay, granted 30. Handwritten on the back by Umma: "Asked the Athletic Commission for Jin's purse. Purse held until the fighter signs for it. Where do I send him?" | They fought the eviction in person. Even the purse was trapped behind the false name. |
| `ev_ha_application` | Housing Authority emergency application | Annex, Housing Authority archive drawer | Filed June 2, 1995 by Seo Mi-ok; status "pending — incomplete: whereabouts of household member SEO JIN". Seven months, three resubmissions. | Requests for help were delayed. |
| `ev_building_complaints` ★ | Building Department file: Lindell House | Annex, Building Dept. counter | Three complaints: Aug 14, 1995 (no smoke detector, 3rd floor hall); Oct 30, 1995 (residents' petition, 11 signatures, the first is "Seo Min-ji, Rm 9": rear exit chained, space heaters in use); Jan 22, 1996 (same). "Inspection scheduled" twice, "rescheduled" twice. Owner fined $150 once. | The unsafe conditions were known and left unresolved. |
| `ev_min_notebook` ★ | Min's search notebook | County property room box "SEO — LINDELL — 2/96" | Spiral notebook. Two years of calls and fares: "Calder Gen records — 'transferred, sponsor confidential'" · "Box 1180, letter #9" · "St. Agnes — no patient by that name" · "Calloway Investigations — $350 — paid in two parts" · "Bus 9 + 14, $2.20, again". | The search consumed time and money. |
| `ev_calloway_invoice` | Private investigator's invoice | Same box | Calloway Investigations, Feb 1995: "Subject SEO, JIN not located under given name in any area facility. $350." | They paid for a search the false name defeated. |
| `ev_umma_timecards` | Royal Linen Service timecards | Same box | 62-hour weeks through 1995. Margin, in pencil: "Sat. — extra 4 hrs. For Min's books." "Sun. off. Church, then Box 1180 letter w/ Min." | Umma kept working while they searched. |
| `ev_umma_note` | "After the fight" note | Same box, inside Jin's gym bag (returned to the family by Civic Arena lost & found) | On a Sunny's Diner napkin, Aug 20, 1994: "Jin-ah. After, Sunny's, the booth by the window. Min is paying (she says). Don't shower too long. — Umma". | Mundane. A plan that never happened. |
| `ev_shopping_list` | Min's shopping list | Same box, in the camera bag | "rice 20 lb · gochugaru · lightbulbs (hall!) · Tri-X film x2 · card for Mrs. O's birthday · ask Dot re: Sat shift". | Mundane. Their lives were not only pleading for Jin. |
| `ev_robe` | Jin's robe, half-mended | Same box | Navy robe; the "E" of EASTGATE half re-stitched, needle still in it. | An unfinished repair. Umma was getting it ready for him. |
| `ev_film_roll` | Min's last roll (developed) | Same box (camera) → developed at Kwik Copy with Dot | Eight frames: Umma asleep on the Route 9 bus; Mrs. Okafor's birthday cake; the chained rear door of Lindell House, date-stamped 01/28/96; Umma laughing at Sunny's; Min's reflection holding a "HAVE YOU SEEN JIN SEO?" flyer; three frames of snow on Garrison Street. | Min documented the chained exit two weeks before the fire. Also: they still laughed. |
| `ev_asher_testimony` | Wendell Asher's account | Garrison Suds | Patient: the owner, Dimitri Lazarou, told him to chain the rear door "against squatters"; Min asked him twice to unlock it; he has the owner's note. Threatened: "The door was chained. Owner's orders. That's all I know." | Who chained the door, and that the owner ordered it. |
| `ev_min_letters` ★ | Nine unopened letters | Fund office storage room, `fund_storage`, box "1180 — RECEIVED — HOLD" | Nine envelopes from Seo Min-ji to "Jin Seo, c/o Calder Foundry Relief Fund, P.O. Box 1180", Sept 1994 – Jan 1996, each date-stamped received, none opened. | The Fund received every letter and withheld them. |
| `ev_pike_memo` ★ | Pike to Rook, carbon | Pike's desk, locked drawer | Jan 9, 1995: "Walter — The sister has written seven times and is now asking St. Agnes and Calder General directly. The mother has applied to your Eastgate tenant fund. How do you want this handled? — G.P." | **Rook was informed that Jin's family was searching for him.** |
| `ev_rook_maintain` ★ | Rook's reply | Stapled to the carbon | On Northside Community Council letterhead, handwritten: "Gerald — Maintain. No contact. Nothing from our fund under that name. It holds or everything goes. Once. — W.R. 1/12/95". | He chose to preserve the concealed identity and denied them assistance. |
| `ev_whitlow_affidavit` ★ | Dr. Whitlow's affidavit | Hana brings it (always) | Sworn statement: the patient registered as Daniel Ahn is Jin Seo, by dental records and the healed fracture of the right fourth metacarpal on file at Calder General's boxing commission physical. | Who he is, in a form a court accepts. |
| `ev_st_agnes_calllog` | St. Agnes switchboard log | Hana brings it if `rel.hana ≥ 3` | "11/02/95 14:10 — caller Seo, Min-ji — asking for patient SEO, JIN — no such patient — caller referred to Calder General records". | Min called the building he was in. The false name answered. |
| `ev_pike_statement` | Pike's written statement | Pike's office (if `ch6_pike_statement`) | Two pages in Pike's tidy hand: the name change was Rook's instruction relayed by "the Harlan people"; he forwarded the family's letters to W.R. and held them on instruction; he was paid $1,500 a month. | A participant's admission. |

**Chapter 7 — Council HQ**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_council_minutes` | NCC executive session minutes | Council HQ records closet | Sept 26, 1994: "Bridge financing from H.F. Co. accepted for Foundry Courts purchase, deadline 9/30. Moved W. Rook, carried 3–1 (G. Lindqvist opposed: 'Ask where it comes from.')". | The Council voted to take the outfit's money. Gus opposed. |
| `ev_wire_640k` ★ | Wire confirmation | Rook's office safe (Rook opens it himself) | "9/27/94 · $640,000.00 · from Harlan Freight Co. escrow, ref ASH-0894 · to Northside Community Council capital account". | **A negotiated share financed Foundry Courts.** "ASH" is the first thread to Ashgrove. |
| `ev_rook_testimony` ★ | Rook's admission | The confrontation | He authorized interference in the fight. In round two he watched Jin's legs go from Section 12, stood up to walk to the Athletic Commission table, and sat back down when Dutch Brannigan, in the next seat, said "Sit down, Walter. It's almost over." | Rook's decision, in his words. |
| `ev_alder_letter` | Draft "community support letter" | Rook hands it over | Unsigned letter on Council letterhead supporting "Alder Commons, a mixed-income redevelopment", typed by someone else, with a note clipped: "Sign by 5/1. — H.S." | The outfit now uses the Council's dependence to demand cooperation. |

**Chapter 8 — Calder Civic Arena**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_sal_notebook` ★ | Sal Bruno's fight notebook | Ray's locker / handed over by Ray | Aug 20, 1994 page, in pencil between round notes: "End R2 — press-row phone, L. Penner (Ashgrove): 'Now.' Told Ray: he's done, go." | **Which financial figure gave the final instructions.** |
| `ev_alder_closing` ★ | Ashgrove closing memo | Ray's gym bag (his appearance schedule) | "Alder Commons · Closing Fri May 9, 1997, 10:00, Ashgrove Tower 30F · Site to be delivered vacant · Community partner: NCC · Celebrity ambassador: R. Castell (TBC) / alternative under discussion". | The leadership and the upcoming property transaction. |
| `ev_ray_statement` | Ray's account | If `ch8_ray_after == stopped` | Spoken on the canvas: he saw Jin's eyes go in round one, heard Sal say "Now," and threw. Later sends a typed statement to the Athletic Commission (Ending Two). | The champion knew Jin was impaired and continued. |

**Chapter 9 — Ashgrove Tower**
| id | Title | Where | Text summary | Proves |
|---|---|---|---|---|
| `ev_relocation_model` | Relocation cost model | Owen Tully (if `ch9_owen == persuaded`) | "Alder Row Cooperative — 24 households, 61 residents. Eminent-domain route: 14–20 months, $520,000. 'Voluntary surrender' route (on-site community pressure + NCC endorsement + public ambassador): 1 day, $110,000. Ambassador: J. Seo (pending)." | Exactly what the bargain costs and who pays. |
| `ev_offer_terms` ★ | The offer, in writing | Penner gives it | "Treatment: full 18-month program, Boston, all costs. Housing: furnished two-bedroom, Riverside. Income: $4,000/month for 36 months. Identity: public restoration as Jin Seo, press conference arranged. Career: managed return, six bouts, title opportunity guaranteed. Condition: participation in Alder Row delivery, May 9, and public support of Alder Commons." | The benefits are real. |

### Memory fragments
Memories open in a viewer with the memory filter (sepia, soft vignette, slower typewriter). Fight-night memories are **incomplete by design** (canon: Jin's memories of the fight itself are incomplete) and fill in shard by shard as the investigation reaches them; the shards are what the player *earns* by investigating, never a "sudden recovered memory" that grants a skill.

| id | Title | Shards (where each fills) | Text summary |
|---|---|---|---|
| `mem_kitchen` | "What's the purse for?" | Ch0 kitchen (complete) | Umma at the stove, Min on the counter, the passport-photo poster. The purse line the player chose (`ch0_purse_dream`). |
| `mem_offer` | The man in the camel coat | Ch0 stairwell (complete) | "Guaranteed money against everything you've got." Jin's refusal line (`ch0_refusal_line`). |
| `mem_cup` | The cup | ① Ch0 round 1 flash: a white paper cup, bitter. ② Ch3 first sight of Lenny's taped wrist. ③ Ch3 Lenny's confession: Locker Room B, "You're dry, drink." | Complete only after Ch3. |
| `mem_corner` | "Something's wrong" | ① Ch0 corner (Jin's side). ② Ch2 Teddy's account (Teddy's side: "Your eyes were swimming. I called it nerves."). ③ Ch8 the same stool. | Who heard him and sent him out anyway. |
| `mem_row3` | Row three | ① Ch0 round 3: Ray looks past him before the right hand. ② Ch8 Ray: "I looked at Sal. Sal looked at row three." | The man in the camel coat was watching. Never identified as the one who ordered it. |
| `mem_bell` | The bell | Ch0 (complete) | The last clear sound: the bell going on after he couldn't defend himself. |
| `mem_first_wraps` | First wraps | Ch2 Iron Pulse, Teddy's old taping bench | Teddy wrapping a 14-year-old's hands: "Hands up, chin down, mouth shut." |
| `mem_bus_umbrella` | Route 9 stop | Ch2 bus shelter at Kessler & 5th | Umma waiting with two umbrellas after his first amateur loss. |
| `mem_roof_july` | Roof, July 4th | Ch2 412 Kessler roof (via the fire escape) | Min photographing fireworks; "Hold still, you're in my shot." |
| `mem_robe` | EASTGATE | Ch6 the half-mended robe | Umma sewing the letters at the kitchen table, counting stitches in Korean. |
| `mem_sunnys` | The booth by the window | Ch6 Sunny's Diner (optional) | 1993: Min insists on paying, counts out quarters, short by forty cents. |
| `mem_presser` | The handshake | Ch8 Calder Civic press room | July 1994 press conference: Ray's handshake held a beat too long. |

---
## Progression

The PDF keeps three kinds of advancement separate, and so does the build:

| Kind | Earned by | Changes | Stored in |
|---|---|---|---|
| **Physical control and combat skill** | Rehab, practice with named people, techniques used under pressure | Movement options, combinations, defensive timing, efficiency | `G.skills`, `G.train`, `A.body` per chapter |
| **Knowledge and access** | Documents, testimony, observation, introductions | Locations, investigation routes, credible accusations | `G.evidence`, `G.memories`, `G.people`, map nodes |
| **Relationships and consequences** | Keeping promises, handling witnesses, taking resources, restraint | Assistance, dialogue, trust, the lives of supporting characters | `G.flags`, `G.rel` |

None of them converts into another. Money cannot buy skill. Skill cannot buy trust. Trust cannot unlock the ending.

### Jin's body by chapter (`ChapterDef.body`)
`power` multiplies punch damage and stagger. The two numbers are bare hands / knuckles. HP is 100 all game.

| Ch | Look | power | speedMul | breath | limp | What the player should feel |
|---|---|---|---|---|---|---|
| 0 | `jin_ring` / street in the kitchen | 1.0 | 1.0 | off | 0 | Whole. Then, in round 2–3, the sabotage debuff (see Ch0). |
| 1 | `jin_hospital` → `jin_rehab` | punches restricted | 0.35 → 0.8 across sessions | on (laps only) | 0.6 → 0.15 | A body that answers late. |
| 2 | `jin_street` | 0.55 / 0.80 | 1.0 | on, max 100 | 0.1 walking only (cosmetic) | Speed intact; punches don't stop big men; long exchanges empty him. |
| 3 | `jin_street`; ring: wraps | 0.60 (wraps; "no metal in Mo's ring") | 1.0 | on | 0 | Technique matters more than force. |
| 4 | `jin_street` | 0.60 / 0.85 | 1.0 | on | 0 | Enough force to control a room if he picks targets. |
| 5–10 | `jin_street` | 0.65 / 0.90 | 1.0 | on | 0 | The ceiling. It never rises again. |
| E1 epilogue | `jin_ring` | 1.0 | 1.0 | off | 0 | Treatment worked. The one round he plays proves it and means nothing. |

Temporary injuries (stated in the HUD condition tooltip, healed by rest or by Doc Ferris; money can shorten a temporary injury, never touch a permanent one):
- **Bruised hands** after Ch2 (bare-handed punches on collectors): cosmetic tape on Jin's hands until Ch3.
- **Cracked rib** after the Ch4 boss: breath max −25 until Ch5 day 3, or immediately if Doc Ferris is paid $150. Carry tasks in Ch5 are slower while it lasts ("Rib. Lift with the legs.").

### Skill unlocks (and why, in the story)
Rule from the PDF: new techniques come from rehab, practice and encounters, never from a sudden recovered memory. By the end of Chapter 5 the toolkit is complete; Chapter 6 adds nothing; Chapters 7–10 test mastery.

| Skill | Chapter | Taught by / how | Why now, in the story |
|---|---|---|---|
| jab, cross, guard, slip, dash, backdash | 0 | Warm-up in Dressing Room B: Teddy's mitts, Lenny's shadow pads, the footwork tape on the floor | The boxer he was. The PDF's list: jab, cross, guard, basic dodge. |
| (all punches locked) | 1 | Restriction reason on any punch press: "Hana said no punching. The shoulder's held by two screws and good intentions." | Rehab. |
| walk → run → jump | 1 | Sessions 2–5 (bars, corridor, curb step, courtyard laps) | Regaining basic movement. |
| dash, backdash (relearned) | 1 | Session 6, courtyard footwork marks: "Step. Step. Now push off." | Controlled footwork. Leaving the building on his own legs. |
| jab, cross (restored), breath on | 2 | First alley exchange; tip "Jab, then cross. Then get out." | His speed is still exceptional; his stopping power is not. |
| knuckles (gear) | 2 | Picked up from Benny Szabo's dropped hand in the alley | First departure from the sport. |
| hook | 3 | Ollie Kraus at the Cellar heavy bag between bouts: "Turn the hip, not the arm." Practice set (3 clean hooks on the bag) then used in bout 2 | Practice and an encounter. |
| counter (slip → counter-cross; backdash → returning cross) | 3 | Mari Ortega's slip-rope and mitts: "Move your head. Then he's the one in trouble." Practice set (3 slip-counters on Mari's mitts) then bout 3 | The first reliable slip-counter. |
| dash straight | 4 | Prep evening: Teddy at Iron Pulse (if `ch2_teddy_met`) or Mari at the Cellar: "Don't stop at the end of the step. Let the step throw the punch." | Needed to interrupt one attacker while avoiding another. |
| air dash | 4 | First climb onto the depot's container stacks; tip appears on the first jump between stacks | Six weeks after the bus his legs "feel like mine" (Jin's notebook on the Ch4 card). |
| uppercut | 5 | Lucho, basement gym: "Short. From the knees. Then hit him again before he lands." | Training with a local boxer. |
| flurry | 5 | Lucho, second session: "Half a second. Bang-bang-bang-bang. Then get out before he remembers he has hands." | Same. |

Combat teaching per chapter (what each fight is *for*) is listed in each chapter's **Encounters** section and summarised here:

| Ch | Core lesson | Enemy archetypes introduced |
|---|---|---|
| 0 | Dash in → jab–cross → slip → reposition, on a full body; then the same inputs failing under sabotage | `sparring` (Teddy's mitts), `champion` (`patternSet:'ch0'`) |
| 1 | Movement as a skill: balance, steps, reaction, breath | `dummy` (Hana's tennis-ball reaction drill) |
| 2 | Short dashes, jab–cross, slip slow committed swings, take the opening and leave; breath | `collector`, `thug` (the driver) |
| 3 | Trained opponents: don't spam jabs, read feints, different openings after different misses; hook, slip-counter | `boxer` (three variants), `sparring` |
| 4 | Groups: reposition, interrupt one while avoiding another, hooks for crowds, retreat, hit the director first; boss who corners | `thug`, `guard` (dock baton), `director`, `collector`, `boss_collector` |
| 5 | Little combat: training as play (uppercut, flurry, sparring with Lucho) | `sparring` |
| 6 | Short confrontations with a non-violent exit | `thug` (copper strippers), `collector` |
| 7 | One short fight before the confrontation, none after | `enforcer`, `thug` |
| 8 | Mastery: the Ch0 champion with tells the player can now read | `guard`, `director`, `champion` (`patternSet:'ch8'`) |
| 9 | Corporate security: clean spaces, batons, directors on radios | `guard`, `director`, `enforcer` |
| 10 | (Refuse) everything you have, alongside the people you kept | `enforcer`, `collector`, `boss_collector` (if Dutch fights), `boxer` (Slim, if he fights) |

### Training
- **Drills** (`activities.js`): `train_balance`, `train_footwork`, `train_reaction`, `train_conditioning` (from Ch1); `train_bag`, `train_mitts` (from the first gym access: Iron Pulse in Ch2 if Teddy was met, otherwise the Cellar in Ch3).
- **Levels and caps.** Each drill has levels 0–3. A level is one 60–90 second session, passed by a clean run; failing costs nothing and can be retried instantly. **Chapter caps:** level 1 in Ch1–2, level 2 in Ch3–4, level 3 from Ch5. A passed level can be replayed for practice but never gives anything twice. A complete set is 18 sessions, about 25 minutes over the whole campaign.
- **Effects** (applied only in `S.activities.applyTraining()`, per level): balance −10% landing/hurt recovery; footwork −5% dash recharge; reaction +7 ms slip window; conditioning +10 breath max; bag +3% punch damage (cap +10%); mitts +20 ms counter window. Training improves control of the body Jin has. It never removes an injury, never raises `power`'s ceiling, and never adds HP.
- **Never compulsory.** The critical path reads no training level. Every fight is tuned for level 0 on Normal. A Journal line on the training card says so: "Optional. Jin can win every fight without it. It makes the fights cleaner."
- **Where** (each place has a person, so training is also a relationship scene):

| Place | Chapters | Drills | Partner and what training with them does |
|---|---|---|---|
| St. Agnes rehab gym and courtyard | 1 | balance, footwork, reaction, conditioning | Hana counts. Each session is +1 `hana` (max +1 total; the first one). |
| Iron Pulse, after hours | 2–9 (if `ch2_teddy_met`) | bag, mitts, footwork | Teddy holds mitts. Two mitts sessions: +1 `teddy` each (max +2). |
| The Cellar warm-up corner | 3–6 | bag, mitts, reaction (slip-rope) | Mari. Flavour lines about rent. |
| Foundry Courts basement gym | 5–9 | all six | Lucho. Mitts and sparring: +1 `lucho` each. Keisha copies Jin's stance from the bench. |
| Riverside path | 2–9 | conditioning | Alone. Jin's thoughts change by chapter. |

### Money
**Rules**
1. Money is modest and shown only as cash on hand in the Journal header ("$47.25"). No shop menus: every purchase is a conversation with a person in the world.
2. It buys **circumstances**: a room, food, a doctor's stitches, flowers, a debt paid back, a gift. It never buys damage, HP, skills, training levels, evidence, access to the critical path, an ally, or any part of the ending's recovery package.
3. **The price of real recovery is stated early and never moves.** Ch1, Dr. Whitlow: "$84,000. Funding: none identified." Ch3, Doc Ferris's price list ends with "Real rehab: $84,000. Not here." The Journal's Jin page carries one line, never a progress bar: "Recommended program: est. $84,000. No funding." Maximum lifetime income, taking every tainted source, is about $3,200.
4. Enemies never drop money. Downed men are questioned, never robbed. There is no loot.
5. Every tainted source is labelled honestly before the choice: whose money it is and what happens if Jin takes it.

**Sources**
| Source | Ch | Amount | Whose money it was (Q1 ladder) |
|---|---|---|---|
| Hana's loan | 1 | $10 | Hana's; she expects it back (Ch6 repay prompt) |
| Activities jar | 1 | $6.40 | The day room's bingo prizes (Q1, smallest scale) |
| Mr. Bell's gift | 1 | $5 | Freely given |
| Cellar purses | 3 | $50 / $75 / $100 (+$50 "smart money" if the dive is accepted) | Mo's book; clean enough |
| Saturday dives at the Cellar | 4–6 | $150 each, max 2 (if `ch3_mo_deal`) | Paid for losing on purpose: the 1994 bargain in miniature |
| Harlan Freight profit stacks "to A.C." | 4 | $600 | Criminal profit. No innocent misses it. |
| C.H.P. payroll envelope | 4 | $1,840 | Five named Foundry Courts workers' week of wages (Q1) |
| Work shifts with Mara | 5 | $35 each, 4 shifts | Earned |

**Sinks**
| Sink | Ch | Cost | Effect |
|---|---|---|---|
| Monarch Hotel, Room 5 | 2–9 | $40/week, charged on each chapter card while rented | A private room: bed (sleep/advance time), radio, window, the evidence wall. Without it Jin sleeps at the Harbor Light shelter (free, a cot, a locker, the evidence wall is a sheet of cardboard). Same functions, different dignity. |
| Sunny's Diner | 2–9 | $3.50 a plate | A sit-down scene and Jin's thoughts; Augie the cook's lines change by chapter. |
| Doc Ferris | 3–9 | stitches $40; rib $150 | Heals a temporary injury early; his price list states what money can't do. |
| Pay Deshawn's docked $200 | 3 | $200 | `ch3_deshawn_paid`, `deshawn` +2 |
| Courts meeting donation | 5 | any amount | `ch5_donation`; ≥ $50 gives `courts` +1 |
| Return the payroll | 5 | $1,840 (or what's left) | `ch5_envelope_outcome` |
| Flowers, cemetery gate cart | 6, 9 | $5 | Flowers stay on markers 96-031 and 96-032 for the rest of the game |
| Repay Hana | 6 | $10 | `ch6_hana_repaid`, `hana` +1 |
| A round at the Hollow Tap for Teddy / coffee for Hana | 9 night | $2–6 | Flavour |

If Jin has more than $1,000 when Ch9 starts, Penner mentions it ("You've been careful with money. Careful men take good offers."). Nothing else reads the balance.

### Difficulty and failure
- Three settings, chosen at the start and changeable any time from the pause menu: **Story** (Jin cannot fall below 1 HP and recovers fully 2 s after avoiding damage), **Normal** (full recovery 3 s after avoiding damage, only between exchanges), **Veteran** (recovery capped at half). Damage numbers never change; difficulty scales only Jin's condition recovery.
- A lost fight restarts at the fight's start in under two seconds (`onLoss: 'retry'`), with a single line from the scene ("Again. Watch his shoulders."). Chapter 0 round 3 and the scripted Ch2 ambush cannot be lost or won; they end on their own.
- Reduced-shake and reduced-flash toggles in settings; every flash-heavy scene (Ch0 knockdown, Ch8 bell) respects them.

---
## World map — Calder, 1994–1997

Calder is a river city: the Calder River runs west to east across the bottom of the map; the old foundry's dead smokestacks stand on the north bank. The map screen is a folded transit map with Jin's pencil marks; unlocked places are inked, locked ones are faint pencil. From Ch2 onward, travel is by bus from any **bus stop** object (a short bus-window shot: time passes, the bus rattles, Jin's reflection in the glass). Travel is free. The map closes during main assaults and scripted nights (it says why: "Not now. Dutch's men are watching the bus stops.").

| Node | Place (district) | Locations | Unlocks | How it changes later |
|---|---|---|---|---|
| `n_kessler` | Kessler Avenue (Eastgate) | `kessler_ave`, `kessler_412_stairs`, `apt_3b_1994`, `okafor_3a`, `kessler_roof`, `kessler_alley`, `hollow_tap` (Ch9) | Ch0 (apartment), Ch2 | Ch0: August evening, a festival banner, the family's window lit. Ch2: December, posters buried, someone else's curtains in 3B. Ch6: Mrs. Okafor has a framed copy of Min's photo of her cake if Jin brought it. Ch9 night: Okafor's light on; she waves. Epilogues: Ending Two shows Jin buying milk on Kessler. |
| `n_sunnys` | Sunny's Diner (Eastgate) | `sunnys` | Ch2 | Augie's TV shows a different fight each chapter; in Ending Two it is the title fight Jin will never be in. |
| `n_ironpulse` | Iron Pulse Fitness, formerly Marsh Boxing Club (Eastgate) | `iron_pulse` | Ch2 (after hours, if Teddy met) | Ch2: Nautilus machines, the old ring roped off for storage. Ch8: Teddy has unrolled the old ring canvas to train Jin. Ending Two: Saturday kids' class. |
| `n_monarch` | Monarch Hotel / Harbor Light shelter (Eastgate) | `monarch_room5` / `harbor_light` | Ch2 | The evidence wall grows: each new evidence card adds a pinned paper. |
| `n_stagnes` | St. Agnes Long-Term Care (Hillcrest) | `stagnes_room214`, `stagnes_hall2`, `stagnes_dayroom`, `stagnes_gym`, `stagnes_courtyard`, `stagnes_records`, `stagnes_lobby` | Ch1 | Ch6 (optional): Bed 214-B holds a new patient; the name card slot is empty; Mr. Bell asks if Jin found his people. |
| `n_starlite` | Starlite Lanes and The Cellar (Westside, Route 9 strip) | `starlite_lanes`, `cellar_stairs`, `cellar`, `cellar_lockers`, `pinsetter_loft`, `ferris_backroom` | Ch3 | Ch4–6: Saturday dives (if `ch3_mo_deal`). Ch9 night: Mo, cigar lit, "finally being smart". |
| `n_dockroad` | Harlan Freight Depot (Dock Road, riverfront) | `depot_riverlot`, `depot_yard`, `depot_warehouse`, `depot_offices`, `depot_counting`, `depot_dutch_office` | Ch4 | Ch6+: padlocked; a sign "HARLAN FREIGHT HAS MOVED"; the dispatch window has a new face (or Roz, if let go, has quit). |
| `n_courts` | Foundry Courts (Northside) | `courts_yard`, `courts_lobby_a`, `courts_workshop`, `courts_boiler`, `courts_gym`, `courts_community_room`, `courts_site_office`, `courts_4d` | Ch5 | Ch6: unit 4D (if taken) is Jin's rest point; residents bark about the week. Ch7: the truth; the yard divides. Ch9 night: a resident vigil, or ordinary laundry, depending on `ch7_truth_told_by`. Epilogues. |
| `n_garrison` | Garrison Street | `garrison_st`, `lindell_ruin`, `garrison_suds` | Ch6 | Ch9 night: someone has left flowers at the fence if Jin did. |
| `n_downtown` | Downtown: City Hall Annex, 88 Market St, Kwik Copy | `annex_hall`, `annex_property_room`, `market_st`, `fund_stair`, `fund_office`, `fund_storage`, `kwik_copy` | Ch6 | Ch7+: the Fund office "FOR LEASE". Ch8 dawn: Kwik Copy opened early by Dot. |
| `n_cemetery` | Calder Municipal Cemetery | `cemetery_s14` | Ch6 | Ch9 night: flowers still there if bought. |
| `n_council` | Northside Community Council HQ (a former savings bank, Northside Ave) | `council_front`, `council_hall`, `rook_office`, `council_records` | Ch7 | Ch9 night: Rook alone with the lights off; he speaks only if Jin knocks. |
| `n_civic` | Calder Civic Arena (Downtown east) | `civic_dock` (Ch8), `civic_concourse`, `civic_dressing_b`, `civic_stairwell`, `civic_ring`, `civic_press` | Ch0, then Ch8 | Ch1–7 locked: "Ray Castell's title defense is in May. The doors are chained." Ch8: dark arena, only the ring lights. Ending One: full house. |
| `n_armory` | Calder Armory | `armory_floor` | Ch8 (if `ch8_lucho_commitment == kept`) | — |
| `n_riverpath` | Riverside path | `river_path` | Ch2 | Ice in Ch2–4, mud in Ch5–6, green in Ch8–10. |
| `n_ashgrove` | Ashgrove Tower (Downtown west) | `ash_plaza`, `ash_lobby`, `ash_security`, `ash_floor22`, `ash_stairwell`, `ash_floor30`, `ash_boardroom` | Ch9 | Ending One: Jin's press conference in the lobby. |
| `n_alder` | Alder Row (Southbank, across the river) | `alder_street`, `alder_gate`, `alder_garden` | Ch10 only (arrival by van, never by map) | Ending One: boarded. Ending Two: occupied, a co-op meeting flyer on the gate. |

---
# Chapter 0 — One More Round

**Chapter card:** "One More Round" · "Eastgate, Calder · Saturday, August 20, 1994"

## Date, mood, palette, weather
- 4:40 pm in the apartment; 7:30 pm backstage; 9:50 pm main event.
- Mood: crowded, teasing, hopeful, then wrong in a way the body notices before the mind does.
- Palette: apartment in late-afternoon amber and cream against a dusty-blue window; Kessler Avenue gold light on brown brick; the arena deep navy and charcoal with a white-hot ring, a blue corner (Jin's, left) and a red corner (Ray's, right). The only saturated colour in the chapter is the ring.
- Weather: humid, heat haze on Kessler, thunder far off. Inside the arena, the storm is heard only once, as a muffled rumble under round 3.

## Gameplay identity
**The boxer Jin used to be, then the body taken away mid-sentence.** The player walks through a home full of people who love him, warms up on a body that answers instantly, refuses a bribe, and fights a title bout whose controls degrade in a way the game explains as it happens.
- Exploration 15% · dialogue 25% · investigation 0% · combat 45% (warm-up and bout) · cinematic 15%.
- Target length: 14–18 minutes.

## Locations
| id | Name | Size | Layout (left → right) | Key props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `apt_3b_1994` | Apartment 3B, 412 Kessler Ave | 960 × 360, interior, `room.pattern:'wallpaper'` (faded green vines) | Front door with coat hooks (two umbrellas, one pink one black) → living room (sofa under a crocheted blanket, TV on Channel 8's "Fight Night Preview", **the promo poster** taped above the TV) → Min's corner behind a hanging curtain (desk, photography textbooks, Pentax K1000, Kwik Copy name tag "MIN") → kitchen (stove, rice cooker, counter, fridge with photos, wall calendar) → window onto the fire escape | Calendar: "AUG 20 — JIN!!" circled three times in Min's red pen; the 1st of the month says "Rent $380" and July's square says "Rent — paid half, rest 8/5" crossed out and "8/20" written in. The robe hangs on the bedroom door, "EASTGATE" across the back. Overdue notice on the table under a rice bowl. | Warm amber, blue window. Sizzle, a fan, Channel 8 commentators, Kessler street noise through the open window | Front door → `kessler_stairs_1994` |
| `kessler_ave_1994` | Kessler Avenue, August | 1400 × 360, exterior, `sky:'dusk'`, `backdrop:'skyline'` | 412 stoop (Mrs. Okafor in a lawn chair) → Han's Market (window sign "GO JIN! EASTGATE'S OWN") → Marsh Boxing Club across the way (door sign "CLOSED — WE'RE AT THE CIVIC! — T.M.") → poster wall at Kessler & 5th (a fresh **jin_fight** poster at eye level) → Route 9 bus shelter → Teddy's maroon station wagon at the curb, engine running | Kids' chalk on the sidewalk: a boxing ring drawn with "JIN" in one corner. A fire hydrant open, water running across the gutter. | Gold dusk, the first streetlights coming on. Hydrant spray, a radio playing a ballgame, Teddy's horn | Car (scripted) → `civic_concourse` |
| `civic_concourse` | Calder Civic Arena, backstage concourse | 1600 × 360, interior, `room.pattern:'concrete'` | Loading door → corridor with cable runs and road cases → press room door (light under it, typewriters) → **stairwell door** (`civic_stairwell`) → Dressing Room B door → the tunnel to the ring (black, crowd roar beyond) | Taped arrows on the floor: "BLUE CORNER →". A security guard in a yellow windbreaker on a folding chair. A hand-lettered sign on Dressing Room B: "SEO / MARSH — NO PRESS". | Fluorescent, one tube flickering. Crowd rumble through the walls rising and falling. | Dressing Room B, stairwell, tunnel (locked until the walk-out: "Not yet. Teddy says walk out when they call you, not before.") |
| `civic_dressing_b` | Dressing Room B | 720 × 360 | Bench and lockers → taping table (white tape, scissors, Vaseline jar, a **stack of paper cups** by the water cooler) → open concrete floor with footwork tape marks (X marks in a zigzag) → heavy bag hung from a pipe → mirror | The paper cups are ordinary set dressing here. The player has no reason to look twice, and that's the point. | Bare bulbs, a wall clock (9:20). Muffled undercard crowd. | Door → concourse |
| `civic_stairwell` | Service stairwell | 360 × 540 (vertical) | Ground landing (door) → stairs up → mid landing (the man in the camel coat, under the caged bulb) → upper door marked "ROOF — NO EXIT" | Cigarette butts in a coffee can. An exit sign with one letter dead: "EX T". | One caged bulb; everything else charcoal. The crowd is almost silent here: the quietest place in the building. | Ground door → concourse |
| `civic_ring` | Calder Civic Arena, main floor | 1280 × 360, `crowd` animated, `stage_lights`, `spotlight` × 2 | Tunnel mouth (left) → blue corner (Jin's stool, bucket, Teddy and Lenny) → ring (x 440–840) → red corner (Ray, Sal Bruno) → ringside: commission table, press row with phones, timekeeper's bell table, **row 3** seat behind the red corner | Banners: "CALDER CIVIC ARENA · CHAMPIONSHIP NIGHT". A Channel 8 camera on a riser. Section 8 sign in the bleachers on the left where Umma and Min sit. | Ring lights as white cones; crowd in near darkness, cigarette haze. Crowd roar, the bell (a brass bell, two strikes per signal), the announcer's echo. | — |

## NPCs present
| id | Where / idle | Key lines | Barks |
|---|---|---|---|
| `umma` | Kitchen, `work` at the stove, back half-turned | "The Route 9 stops at midnight. If it goes long, we take a taxi. You pay." / "Eat first. Then hit people." | "Taste this. No, not with your fingers." / "Your collar. Come here." |
| `min` | Sitting on the kitchen counter, swinging her heels, poster in hand | "They used your passport photo. You look like you're being arrested for tax fraud." / "I'll be in section eight. Wave, or I put your passport photo on the Kwik Copy wall." | "Ray Castell's poster has a wind machine. Yours has fluorescent lighting." |
| `okafor` | Lawn chair on the 412 stoop, fanning herself with a church bulletin | "My whole choir is praying for your left hand." Jin: "Tell them the right hand needs it more." | "Go on, Teddy's honking for you, my dear." |
| `teddy` | Car, then Dressing Room B, `handsHips`, whistle | "Hands up, chin down, mouth shut. In that order." / "Go breathe somewhere. You're making me nervous." | "Feet! Where are your feet?" |
| `lenny` | Dressing Room B by the taping table, wiping his hands on a towel; white tape roll worn on his left wrist | "Lookin' sharp, champ. Lookin' like money." | "Water's there if you want it." (on the cooler, once, idle; easy to miss) |
| `coat` | Stairwell mid-landing, hands clasped behind his back, then row 3 | See the offer scene | — |
| `ray` | Red corner; in the ring | Pre-fight, touching gloves: "Nothing personal, Eastgate. Just a big night." | — |
| `referee` | Referee Dale Hoskins: white shirt, black bow tie, 46 px | "Protect yourself at all times. Touch 'em." / Round 3: "You okay? Let's go." | — |
| `sal` | Red corner, towel over shoulder; at the end of round 2 he walks to the press-row phone and back | (no lines in Ch0) | — |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `o_poster_1994` | Promo poster | "My passport photo, blown up to two feet. Min's right. I look like I'm being booked." | starts the poster conversation |
| `o_calendar` | Calendar | "'AUG 20 — JIN!!' Three circles. July says rent, paid half. She wrote 8/20 next to the rest." | — |
| `o_overdue` | Envelope under the rice bowl | Opens doc: "KESSLER REALTY — PAST DUE — Unit 3B — Balance $570.00 — Please remit by 8/31/94." Thought: "She put the rice bowl on it so I wouldn't see." | — |
| `o_robe` | Robe on the door | "EASTGATE. Umma did the letters by hand, two nights. The G is a little crooked. Don't tell her." | — |
| `o_fridge_photo` | Photo on the fridge | "Me at fourteen, Golden Gloves, losing. Teddy's hand on my head. Min took it. She was ten and she still yelled at the ref." | — |
| `o_min_desk` | Min's desk | "'Weigh-in 8/19 — 159.5 ✓ — drove him, he ate a whole melon after.' She keeps notes on me like I'm homework." | — |
| `o_bus_schedule` | Route 9 schedule (on the fridge, magnet) | "Last bus from Civic 11:52. She's circled it." | — |
| `o_chalk_ring` | Chalk on the sidewalk | "Somebody drew a ring. My name's in the blue corner. Spelled right, even." | — |
| `o_poster_wall_1994` | Fight poster at Kessler & 5th | "Fresh paste. Nobody's put anything over it yet." (Ch2 echoes this exact object) | — |
| `o_cups` | Paper cups by the cooler | "Cups." (nothing else; one word, on purpose) | — |
| `o_mirror` | Mirror | "No scar yet. Just a nervous guy with good hair." | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q0_main` | main | 1. "Eat something. Umma's orders." → 2. "Teddy's waiting downstairs." → 3. "Warm up with Teddy." → 4. "Get some air." → 5. "Walk out." → 6. (none: the HUD fades during the bout) | Step triggers: kitchen choice resolved; car door; warm-up activity done; stairwell scene done; walk-out trigger | Chapter flow |
| `q0_side_letters` | side | "Look around the apartment before you go." | Examine 4 of the 7 apartment objects | Unlocks `mem_kitchen` with an extra line (Min's notes). No mechanical reward. |

## Scripted scenes, beat by beat
**S0.1 Cold open (no control).** Black. Sound only: a brass bell, two strikes, very clean. Crowd breath. Cut to the card "Saturday, August 20, 1994". Fade in on the apartment kitchen: camera starts tight on the rice cooker steam (zoom 1.6), eases out to 1.0 to reveal Umma at the stove, Min on the counter, Jin in the doorway with his gym bag over one shoulder. Control given as Jin steps in.

**S0.2 The purse (on talking to Min while Umma is in frame).** Camera holds a two-shot at zoom 1.2.
- Min: "They used your passport photo. You look like you're being arrested for tax fraud."
- Jin: "It's a poster, Min. Nobody looks at the face."
- Min: "Ray Castell's poster has a wind machine. Yours has fluorescent lighting."
- Umma (not turning round): "The Route 9 stops at midnight. If it goes long, we take a taxi. You pay."
- Jin: "It won't go long."
- Umma: "Everybody says that. Then it goes long."
- Min: "So what's the purse for? And don't say 'the future.' Umma hates 'the future.'"
- **Choice `ch0_purse_dream`:**
  - "Two months' rent. Then the rent after that." → `rent`. Umma stops stirring: "Rent is my problem." Jin: "Not after tonight." Umma: "...Then it's our problem. Eat."
  - "Umma quits Saturdays." → `umma_saturdays`. Min: "If you win, Umma quits Saturdays. That's the deal. I already told her you agreed." Umma: "Who will fold the hotel sheets? The sheets don't fold themselves." Min: "The sheets will survive."
  - "A place with a second bedroom. Min stops sleeping behind a curtain." → `new_apartment`. Min: "With a door. A door that locks. I want to slam it." Umma: "You slam the curtain now. It goes *fwump*."
- Umma turns, wipes her hands, fixes Jin's collar (`handShoulder`), and taps his forearm twice. "Eat first. Then hit people." Jin sits at the table (`sit`); the camera eases out to show all three in the window light; time skips gently (a 1 s fade) to empty bowls.
- Min, as he gets up: "Section eight. Wave, or your passport photo goes on the Kwik Copy wall." Memory `mem_kitchen` is written (no toast yet; it appears in Ch1).

**S0.3 Kessler Avenue (free walk).** Teddy's horn every 20 s from the right edge, never urgent. Mrs. Okafor's line triggers as Jin passes the stoop. Getting in the car: letterbox on, the wagon pulls away; the camera stays on the street for two seconds (the poster wall, the chalk ring) before the fade. Card: "Calder Civic Arena · 7:30 pm".

**S0.4 Warm-up (Dressing Room B; teaching in motion, no tutorial menu).** Teddy talks the whole time; each instruction is a HUD tip that fades after the player does it once.
1. "Show me your feet." Footwork tape marks light up in a zigzag; walk, run, stop on the marks (`train_footwork` level 0 framing, no grade).
2. "Pop." The heavy bag: jab ×3. "Now the right hand behind it." Jab–cross ×3 (tip: "Tap ATTACK twice: jab, cross. You can stop after either.").
3. "Step in, step out." Dash to the bag, jab–cross, backdash out (tip: "DASH forward or back. Two charges, shown under Jin.").
4. Teddy picks up the mitts (`sparring`) and swings slow hooks: "Slip it. Don't run from it. Move your head." Slip ×3 (tip: "SLIP just as the punch arrives.").
5. "Guard." Teddy throws a flurry at Jin's gloves; hold guard (tip: "Hold DOWN to guard.").
6. Teddy claps once. "That's a champion. Go breathe somewhere. You're making me nervous."

**S0.5 The offer (stairwell).** Jin enters; the crowd noise drops to almost nothing (`muffle 0.6` on ambience only). Camera eases out to show the full 540 px height: Jin small at the bottom, the man in the camel coat on the mid landing under the bulb. Letterbox on.
- Coat: "Mr. Seo. Two minutes, and then you can go back to being nervous."
- Jin: "Who are you?"
- Coat: "Someone who's watched a lot of these. Castell's people have been very generous with the odds. Some of us would like the evening to be orderly."
- He walks down three steps (camera follows him down until they share a frame at zoom 1.3). He adjusts a cuff. "Sixty thousand dollars. Cash, tonight, in a gym bag like yours. You go down in the fourth. You wake up tomorrow with your mother's rent paid to the end of the decade."
- Jin: "And if I win?"
- Coat: "Then you're twenty-six with a belt, no manager, and a long list of people who expected something else. Guaranteed money against everything you've got. It isn't an insult, Jin. It's advice."
- **Choice `ch0_refusal_line`** (all three refuse; the PDF's refusal is canon):
  - "I'm not for sale." → `not_for_sale`
  - "My mother's in section eight. Tell your people to watch." → `my_family`
  - "Move. I've got a fight." → `step_aside`
- Coat steps aside, palm open. "Good luck, then. I mean it." He goes up toward the roof door; the camera does not follow. `mem_offer` written.

**S0.6 Dressing Room B, before the walk (choice).** Teddy is cutting tape. Lenny wipes his hands.
- **Choice `ch0_told_teddy`:** "Teddy. A guy on the stairs offered me money to go down." / [Say nothing.]
  - Told: Teddy (without looking up): "Guys like that hang around every title fight like pigeons. Forget it. We win anyway." Lenny's towel stops for one beat, then keeps going (one-frame `idle` → `think` pose; no line).
  - Silent: Jin's thought: "Not tonight. Tomorrow I'll tell him. Tonight it's just the fight."
- Card cut (hard, no fade): "9:50 pm". **The three minutes before the walk-out are not shown.** That gap is the memory the player will rebuild.

**S0.7 Walk-out.** Tunnel, then the crowd. Camera tracks Jin from behind at zoom 1.2, then pulls out to 0.85 as he climbs into the ring. A camera flash from section 8 (Min's Pentax). Introductions; Ray: "Nothing personal, Eastgate. Just a big night." Referee: "Protect yourself at all times. Touch 'em." Bell. Letterbox off; the HUD fades in minimal (Jin's condition bar, dash pips, round clock).

## Encounters
**E0.1 Warm-up** (activity; cannot fail). Teaches movement, jab, cross, dash, backdash, slip, guard.

**E0.2 Title bout vs Ray Castell** (`A.bout`): `ring {x0:440, x1:840}`, `opponent {type:'champion', name:'Ray Castell', opts:{patternSet:'ch0'}}`, `rounds:3`, `roundTime:60`, `allowLoss:false`, `crowd:true`, `bell:true`, `corner:'s0_corner'`.
- **Ray's ch0 patterns** (the same four return in Ch8): ① double jab then step right; ② **the right hand**: drops his right shoulder ~0.25 s, then a straight right (slippable; best counter); ③ body hook → head hook (backdash, don't slip); ④ lean-back counter: if Jin throws three jabs in a row, Ray leans away and returns a cross.
- **Round 1 (whole body):** Jin is faster than Ray. Good play wins the round clearly (crowd swells, Teddy shouts "That's it!"). Ray cannot knock Jin down this round (HP floor).
- **Round 2 (the change):** at 0:25 the debuff begins and climbs over 20 s: `muffle` 0 → 0.6, input `delay` 0 → 0.10 s, `speedMul` 1 → 0.75, `double` 0 → 0.3. A HUD line appears once, small, at the bottom: "Your body isn't answering. Keep your guard up." At 0:40, **interrupted recollection** (0.6 s, memory filter): a white paper cup at the edge of frame, a wrist wrapped in white tape, the word "drink" muffled. Cut back mid-exchange. `mem_cup` shard ① written. At 0:55 Sal walks from the red corner to the press-row phone; visible if the player is looking, never pointed at.
- **Corner `s0_corner` (between rounds 2 and 3):** see below.
- **Round 3 (cannot be won, cannot be lost early):** debuff `speedMul 0.45`, `delay 0.20`, `blur 0.5`, `double 0.6`, heartbeat on. Jin's guard drifts down unless the player holds it. `ch0_resistance` counts up to 3: each counter-cross landed, and each time the player raises the guard back after it drifts (max 3). At 0:20 Jin stumbles into the ropes (forced): **the warning sign.** Referee Hoskins looks at Jin's eyes, wipes his gloves on his shirt: "You okay? Let's go." He waves them on. At 0:35 Ray looks past Jin, toward row 3, for one beat (camera holds the shot; the camel coat is a silhouette behind the red corner). `mem_row3` shard ① written. Ray drops his right shoulder (the tell from round 1) and throws. If `ch0_resistance ≥ 2`, Jin slips the first right hand on his own and the crowd gasps; Ray throws again. The second one lands. Slow motion (`slowmo 0.25`), freeze frame on contact, then the fall. The scene takes control; the player's last input is whatever they were pressing.

**After (S0.8, no control).** Jin on the canvas, seen from the canvas: camera at floor height, zoom 1.6, tilted. Ray's shoes walking away. Sound is gone except **the bell**, struck over and over by the timekeeper, clean and close, while everything else is underwater. A camera flash from section 8 lights the ropes white once. The bell continues over black for four seconds. `mem_bell` written. The last strike of the bell crossfades into a hospital monitor's beep (sound bridge into Ch1).

**Corner `s0_corner` (letterbox, camera close on the stool, zoom 1.4).**
- Jin's thought (muffled, slow typewriter): "The ropes are too far away. Why are the ropes so far away."
- Jin: "Teddy. Something's wrong. My legs aren't — I can't hear you right."
- Teddy (sponge on Jin's neck): "You're breathing like a freight train, that's all. It's nerves. It's the lights."
- If `ch0_told_teddy`: Jin: "The coat. The guy on the stairs, Teddy —" Teddy looks at the red corner for a long beat, then away: "...Not now. Win this, then we talk about coats."
- Lenny, with the bucket, not looking at Jin: "He's fine, Ted. Send him."
- Teddy: "Hands up, chin down. Go."
- `mem_corner` shard ① written. **They send him back out**, exactly as the PDF says.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch0_purse_dream` | rent / umma_saturdays / new_apartment | Kitchen line variant | Ch2 Mrs. Okafor: "Your mother told everyone you'd [pay the rent off / get her Saturdays back / find a place with a door for Min]." Ch6 Min's letter #4 mentions the same dream. Both endings: Ending One's epilogue shows Jin able to buy exactly that and no one to give it to; Ending Two's shows the rented room. |
| `ch0_refusal_line` | not_for_sale / my_family / step_aside | Coat's reaction is identical | Ch9 Penner reads it back word for word ("'I'm not for sale.' You said that on a stairwell. We liked you for it."); Ch10 it is Jin's last thought before the gate choice. |
| `ch0_told_teddy` | bool | Lenny's one-beat pause; Teddy's corner line | Ch2 Teddy's confession has two versions; Ch8 Teddy's corner line. |
| `ch0_resistance` | 0–3 | Jin slips the first right hand if ≥ 2 | Ch8 Ray's pre-fight line: 0–1 "You went down like you'd been told." / 2–3 "You were still throwing in the third. I felt it. I still feel it in this hand." |

## Chapter ending and state handed on
- Ending beat: the bell over black, crossfading into a monitor beep.
- Completion screen: "Chapter 0 — One More Round" · "Choices made: You told Min what the purse was for. You refused the man in the camel coat. [You told Teddy about him. / You didn't tell anyone.]" · Memories: 5. No score, no grade.
- Handed to Ch1: `ch0_*` flags; skills jab, cross, guard, slip, dash, backdash (Ch1 restricts them); memories `mem_kitchen`, `mem_offer`, `mem_cup`①, `mem_corner`①, `mem_row3`①, `mem_bell`; money $0 (Jin's pockets in Ch1 are empty).

---
# Chapter 1 — The Name Above the Bed

**Chapter card:** "The Name Above the Bed" · "St. Agnes Long-Term Care, Hillcrest · October 7, 1996"

## Date, mood, palette, weather
- October 7 – December 18, 1996, in six short sessions separated by time cards ("Week 1", "Week 3", "Week 5", "Week 8", "Week 10", "Week 11", "December 16").
- Mood: slow, clinical, patient. Frustration that has nowhere to go, then an alliance.
- Palette: pale green-gray walls, cream linoleum with a brown stripe, cold blue daylight through tall windows; the courtyard in amber maple leaves (Week 3–8), bare branches (Week 10–11), first snow (December 18); the records basement in sodium yellow and boiler-pipe green.
- Weather: October rain streaking the window of Room 214; November wind; December first snow on the bus shelter.

## Gameplay identity
**Recovering a body and noticing a lie.** Short rehab levels (each one a single movement problem), a building the player learns room by room, and a quiet investigation inside it. No combat. The controls start almost absent and grow back, and the game always says why a verb is missing.
- Exploration 20% · dialogue 30% · investigation 20% · combat 0% · activities (rehab drills) 30%.
- Target length: 18–22 minutes.

## Locations
| id | Name | Size | Layout | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `stagnes_room214` | Room 214 | 640 × 360 | Door → Bed A (stripped mattress, curtain half drawn) → **Bed B** (Jin) with the name card in a plastic sleeve above the headboard → IV stand, monitor → bedside table → window | Bedside table: a paper cup of water, a plastic comb still in its wrapper, Pike's business card. Window: Hillcrest view of Calder below, the river, the foundry's dead stacks. A get-well card on Bed A's table addressed to someone who's gone. | Cold daylight, the monitor's beep (the Ch0 bell's echo), rain | Door → `stagnes_hall2` |
| `stagnes_hall2` | Second-floor corridor | 1600 × 360 | Room 214 → **handrail** running the length of the wall → nurses' station (chart rack, phone, the sponsor binder) → patient payphone by the elevator (sign: "PATIENT CALLS 7–9 PM") → day room doorway → rehab gym doorway → stairwell (down to lobby and basement) | Bulletin board: "VOLUNTEER BINGO THURSDAYS · prizes from the jar!" A Thanksgiving paper turkey appears in Week 8, a paper snowflake chain in Week 11. | Fluorescent, a buzzing tube over the payphone; call bells, a floor polisher at night | 214, day room, gym, stairwell |
| `stagnes_dayroom` | Day room | 800 × 360 | Card tables → TV on a wall bracket → bingo board → **activities jar** on the windowsill → Mr. Bell's corner by the radiator | The jar: a pickle jar with a masking-tape label, "DAY ROOM — BINGO PRIZES — thank you! — Mrs. Alvarez, Volunteer"; coins and two dollar bills visible. | Warm lamps; TV murmur; Mr. Bell's transistor radio (the Calder Ironmen losing) | Hall |
| `stagnes_gym` | Rehabilitation gym | 960 × 360 | Mats → **parallel bars** → low balance beam → four-step stairs trainer → mirror wall → Hana's desk (schedule, a mug of pencils, a photo of her own mother) | Floor tape: footwork marks Hana lays out in Week 11. Therapy balls. | Bright, clinical; Hana counting | Hall; glass door → courtyard |
| `stagnes_courtyard` | Courtyard | 1200 × 360, exterior, `sky:'overcast'` | Glass door → path loop around a dry fountain → two benches → maple tree → iron fence with the **Route 14 bus shelter** beyond it → gate (locked until departure: "Gate's for visitors. Patients go out the front, with a signature.") | Leaves fall in a loop; in Week 11 the path has frost. | Wind, distant traffic | Gym; lobby door |
| `stagnes_records` | Records basement | 960 × 360 | Stairwell landing → boiler and pipes → shelving rows (archive boxes labelled by year and quarter) → microfiche desk under a pull-chain bulb → wire cage "SPONSOR FILES — CURRENT" (padlocked) → **patient-property shelf** | Box "ADMISSIONS 1994 Q3 — ORIGINALS" on the bottom shelf, dust except for one hand-shaped clean patch (someone took something out of it once; the form was missed because it was stapled behind another patient's). | Sodium yellow, one bulb; boiler hiss and knocks | Stairwell |
| `stagnes_lobby` | Ground-floor lobby | 1000 × 360 | Front doors → reception desk → visitors' chairs → elevator → stairwell | Pike's raincoat on the coat stand on visit days. A donor plaque: "Rehabilitation Wing renovated with the generous support of the Calder Foundry Relief Fund, 1995". | Warm, carpeted, quiet | Front doors (locked until departure, with the AMA form as the reason), stairs |

## NPCs present
| id | Where / idle | What they say (key lines) | Barks | Reacts to |
|---|---|---|---|---|
| `hana` | Gym, at her desk or kneeling by the bars; corridor with clipboard | "Three more. Then you're allowed to hate me." / Week 1: "Your chart says Daniel, so for now you're Daniel. Records are how we keep people safe." / Week 8: "I typed that file. I typed it from what Mr. Pike handed me." | "Heel, toe. Heel, toe." / "Don't look at your feet, look at me." | `ch1_pike_stance`, `ch1_records_route`, telling her about boxing |
| `pike` | Bedside (too close), later the nurses' station; taps the chart with one finger | "Confusion is normal, Daniel. The brain fills gaps with stories. Boxing is a very common story." / "All inquiries go through the Fund. It's for your protection." | — | `ch1_pike_stance` |
| `whitlow` | Rounds with a clipboard; her office door in the hall | "Your recovery is real. It is also slow. Both of those are going to annoy you." / Dec 16: "Medically, you can go. I've written down what you actually need. Nobody is going to pay for it." | "Morning, Mr. — " (she always pauses before the surname, from Week 8 on) | Records discovery (she quietly starts calling him "Jin" in December) |
| `doreen` | Nurses' station, nights | "Lights out at ten, Mr. Ahn." / after the records: "Lights out at ten, Mr. Seo. Sorry. I'll get used to it." | "Sponsor says calls go through the Fund, honey. It's in the binder." | `ch1_pike_stance` |
| `bell` | Day room by the radiator in his wheelchair | "Forty years I made change on the Route 9 streetcar. You know what I learned? Everybody's going somewhere." / "Find your people, son." | "Ironmen are losing. They're always losing. It's restful." | Departure day (offers fare) |
| `marcus` | Night orderly, patrols the hall with a flashlight (only on the `alone_at_night` route) | "Somebody up? ...Must be the pipes." | — | — |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `o_namecard` | Name above the bed | "AHN, DANIEL. Typed. Somebody pressed hard on the A." | `ev_name_card` ★ |
| `o_papercup` | Paper cup | "My hand won't take it. I don't know why." (the memory filter flickers for a quarter second; no shard yet). From Week 3, Hana has replaced it with a plastic mug without a word. | — |
| `o_window214` | Window | Week 1: "That's Calder. The river. The foundry stacks. So I'm still home." Week 11: "Snow on the stacks. Somebody's out there wondering where I went. Somebody has to be." | — |
| `o_pikecard` | Business card | Doc: Pike's card. Thought: "Calder Foundry Relief Fund. I never worked a day at the foundry." | `ev_pike_card` |
| `o_chartrack` | Chart rack | Before Week 8: "Not mine to read, apparently." Week 8 (Hana shows it): opens the face sheet. | `ev_current_file` ★ |
| `o_sponsorbinder` | Sponsor binder | "'AHN, D. — All correspondence and calls to be routed via CFRF liaison. — G.P.' My life has a routing slip." | — |
| `o_dayroom_tv` | TV | Week 3: Channel 8, "Ray Castell, champion, three defenses." Thought: "Champion. Three defenses. I was supposed to be in that sentence." | — |
| `o_jar` | Bingo jar | "$6.40 in coins and two singles. 'Thank you!' with a smiley face." | (fare option on departure day) |
| `o_bell_radio` | Mr. Bell's radio | Opens `q1_side_radio` | — |
| `o_records_box` | "ADMISSIONS 1994 Q3 — ORIGINALS" | Doc: the transfer form. | `ev_transfer_form` ★ |
| `o_property_shelf` | Patient property | "A bag with a tag. SEO, J. My handwriting isn't on it, but my name is." | `ev_property_tag` |
| `o_donor_plaque` | Plaque | "'With the generous support of the Calder Foundry Relief Fund.' They bought a wing and a name." | — |
| `o_payphone` | Payphone | Uses `q1_side_calls`; locked reason if `insisted`: "Sign taped on it: 'AHN, D. — calls via CFRF.' My name, on a payphone." | — |

## Quests
| id | Kind | HUD objective text (steps) | Completion | Reward / consequence |
|---|---|---|---|---|
| `q1_main` | main | "Sit up." → "Get to the day room." → "Walk the bars with Hana." → "Walk to the nurses' station." → "Climb the stairs. Then the courtyard." → "Learn to push off again." → [with Hana] "Wait for Thursday. Hana has the key." / [alone] "Go down to the records room. Don't get caught." → "Get your things. Get out before the 19th." → "Catch the Route 14." | Session triggers; records form taken; AMA form signed; bus boarded | Training menu (Week 3); dash and backdash (Week 11); evidence |
| `q1_side_calls` | side | "Make a phone call." | Two calls: directory assistance ("No listing for Seo on Kessler, sir.") and the Marsh Boxing Club number ("Iron Pulse Fitness, how can I help you?") | Seeds Ch2: the gym changed hands. |
| `q1_side_radio` | side | "Fix Mr. Bell's radio." | `repair` activity: three steps (straighten the antenna, reseat the battery, tap it once "like a vending machine") | Mr. Bell's streetcar story; his fare offer on departure day becomes a gift with a reason. |
| `q1_side_exercise` | side (training intro) | "Hana's home exercise card: try a drill." | Any drill to level 1 | `hana` +1 (first session only) |

## Scripted scenes, beat by beat
**S1.1 Waking (Week 1).** Black; the monitor beep that was the bell. Fade in on ceiling tiles from Jin's eyes: camera at zoom 2.0 on the tiles, slow pan down to the name card above the bed (hold), then a long pull-out to 1.0 showing Jin small in Bed B, Bed A empty. Thought: "Ceiling tiles. Thirty-seven. I counted yesterday too." (He has been surfacing for days; he remembers who he is.) Hana enters with Dr. Whitlow.
- Whitlow: "Good morning, Daniel. Can you squeeze my hand?"
- Jin (voice cracked, typewriter slowed): "Jin. My name is Jin Seo."
- Whitlow and Hana exchange a look. Hana (kindly): "Your chart says Daniel, so for now you're Daniel. Records are how we keep people safe."
- Jin's thought: "I know my name. I know my mother's phone number. I know the Route 9 schedule. I don't know how I got here."
- Activity: **sit up** (`train_balance` framing, level 0; left/right to stop the sway for 8 s; Hana: "Small corrections. You're not steering a bus."). Control restrictions active: `A.restrict({punch:false, run:false, jump:false, dash:false, reason:'Hana said no punching. The shoulder is held by two screws and good intentions.'})`; moving the stick shows "Not yet. My legs don't believe me."
- **Pike, visit 1.** He stands too close to the bed, taps the chart. "Gerald Pike, Calder Foundry Relief Fund. We've been looking after you, Daniel." Jin: "I'm a boxer. I fought at the Civic. August twentieth." Pike: "Confusion is normal, Daniel. The brain fills gaps with stories. Boxing is a very common story. Young men see it on television." He sets his card down. "All inquiries go through the Fund. It's for your protection." Exit. Hana, after he's gone, quietly: "He's very involved, for a sponsor."

**S1.2 Week 3: the day room.** Time card. Wheelchair movement (slow, steady; `wheelchair` pose). Mr. Bell, the TV (Ray Castell, champion). Hana gives Jin the **home exercise card**; the Training tab appears in the Journal with four drills (balance, footwork, reaction, conditioning), "Level cap: 1 for now". Toast: "Training unlocked. Optional. It improves control of the body you have."

**S1.3 Week 5: the bars.** Parallel bars, three lengths (`bars` pose; left/right with a sway meter). Hana counts: "Three more. Then you're allowed to hate me." Halfway, a dialogue choice (relationship only): "Tell her about the fight" (+1 `hana`, sets `ch1_told_hana_boxing`) / "Say nothing." If told, Hana listens without writing anything down, which is the first time anyone at St. Agnes has done that. Then Jin asks her to call home. Hana calls the Kessler number from the gym phone: the three-tone "disconnected" sound, played in full. She writes a letter to "Mrs. Seo, 412 Kessler Ave, Apt 3B" on St. Agnes letterhead and puts it in the outgoing tray at reception. The camera holds on the tray as the scene fades.

**S1.4 Week 8: the nurses' station (the turn).** Corridor walk with the handrail (`limp 0.4`), then without it for the last 10 m (Hana walking backwards in front of him: "Don't look at your feet, look at me."). At the station, Pike is signing the visitor log. He opens his briefcase to give Doreen "the Fund's paperwork"; **Hana's letter is visible inside it** (camera pushes in to zoom 1.5 on the briefcase for one second, then back). Hana sees it.
- Pike: "How are we today, Daniel?"
- Jin: "Jin."
- Pike: "We talked about this."
- Hana: "Mr. Pike, his X-rays show an old fracture of the right fourth metacarpal. It's called a boxer's fracture."
- Pike: "It's also called a salvage fracture, Ms. Lim, when a man drops an I-beam on his hand. Mr. Ahn worked salvage at Calder Foundry. It's in the file you typed." (to Jin) "So. Let's start again. Your name?"
- **Choice `ch1_pike_stance`:**
  - "...Daniel." → `played_along`. Pike: "There we are. Progress." Jin's thought: "Let him think he's won. I need the day-room pass more than I need him to say it." Doreen hands Jin a day-room pass, payphone included.
  - "Jin Seo. S-E-O. Write it down." → `insisted`. Pike's smile goes. "I'll let the Fund know Mr. Ahn is agitated. For his protection, calls will go through our office." He tapes a sign to the patient payphone himself. Hana: "He can't do that." Doreen, gently: "He can, honey. Sponsor's instructions. It's in the binder."
- After Pike leaves, in the gym, Hana closes the door. "I typed that file. In February '95, during the records conversion. I typed it from a face sheet Mr. Pike handed me." She takes the chart from the rack and hands it to Jin: `ev_current_file`. "There's a records room in the basement. Originals from before the conversion. If there's another version of you, it's down there."
- She asks for her letter back from reception; the receptionist says Mr. Pike took the Ahn correspondence "as usual". Hana's line: "As usual."

**S1.5 Week 10: stairs, courtyard, calls.** Stairs trainer (`land` recovery is long; balance drill shortens it), then the courtyard: first **jump** (a curb step: "Up. Good. Now down without thinking about it."), then **run** laps (`train_conditioning` framing; the breath meter is shown for the first time and explained by Hana: "When it's empty, you stop. Not when you feel like stopping, before."). Calls (`q1_side_calls`): if `played_along`, from the patient payphone with a quarter from Mr. Bell; if `insisted`, Hana dials them at 9:40 pm from the nurses' station while Doreen pretends to be at the med cart.

**S1.6 Week 11: push off.** Courtyard, frost on the path. Hana lays footwork tape in a zigzag. "Step. Step. Now push off. Big step." The player's first dash since Ch0; afterimages appear faintly; Hana laughs out loud for the first time. Backdash: "Same thing, backwards. Keep your eyes on me." Toast: "Dash and backdash." Then reaction drill with tennis balls (Hana throws, Jin slips or guards; no punching). In the gym afterwards Hana proposes Thursday.
- Hana: "Thursday I'm on until eleven. Doreen will lend me the key if I say it's a chart audit. Wait for Thursday."
- **Choice `ch1_records_route`:** "Thursday. Together." → `with_hana` / "[Go down tonight, alone.]" → `alone_at_night`.

**S1.7a Records with Hana (Thursday, 10:15 pm).** Hana unlocks; the two of them search the shelves (Jin reads box labels; Hana holds the flashlight, so the light follows her, not him). The player finds Q3 1994. Hana reads the form aloud, then sits on the bottom step (`sitFloor`). Camera: two-shot at 1.2, still. "Same MR number. Same bed. Different man." She is the one who finds the property bag. Jin holds the track top. Hana: "I'll get you out of here. Properly. With a signature." `hana` +2.

**S1.7b Records alone (2:10 am).** Night corridor; Marcus the orderly patrols with a flashlight. The stealth is soft: if the beam touches Jin, Marcus walks him back to bed ("Pipes keeping you up too?") and the player tries again from Room 214. The basement door is propped by a mop bucket ("Bless the boiler man."). Jin finds the form and the bag alone. He sits on the floor among the shelves. Camera eases out to 0.8, Jin small under the single bulb. Thought: "SEO, JIN. Somebody typed my name once. Then somebody typed over it." Next morning, Hana: "You went down there alone? On those legs? I said Thursday." Jin: "I've lost two years. I couldn't lose three more days." Hana: "...I know. I still said Thursday." `hana` +0.

**S1.8 December 16: the transfer notice.** A memo on the sponsor binder: "Patient AHN, Daniel to be transferred to Ridgeview State Home, Millbrook, 12/19/96, at sponsor's request." (Millbrook is 200 miles upstate.) Dr. Whitlow in her office: "Medically, you can go. If you have somewhere to go. I've written down what you actually need." `ev_whitlow_note` (the $84,000 line; the camera lingers on it). "Nobody is going to pay for that, Jin. I'm sorry." (She uses his name.)

**S1.9 December 18: leaving.** Jin changes into his own clothes from the property bag; the look switches to `jin_street` in a single cut (mirror in Room 214: "Track top's loose in the shoulders. Still mine."). At reception he signs the **against-medical-advice form**. Clerk: "That's not the name on the chart." Jin: "It's the name on me." Bus fare:
- **Choice `ch1_fare_source`** (whichever Jin takes first; once he has fare, the others close):
  - Hana, at the front doors: "Take it. It's a loan. I'm keeping a list." → `hana_loan` (+$10).
  - Day room jar: "[Take the bingo jar. $6.40. It's the day room's prize money.]" → `activities_jar` (+$6.40; the jar left empty on the sill, the "thank you!" label facing the room).
  - Mr. Bell: "Forty years I gave people change on the streetcar. Let me give one more." → `mr_bell` (+$5).
- Hana walks him to the shelter. She gives him a card with her number on the back: "Call. That's an order." Snow begins. The Route 14 arrives. Camera stays outside as the bus pulls away: Hana in her cardigan at the shelter, small, then the bus window with Jin's reflection over the city. Card: "December 18, 1996. An address: 412 Kessler Avenue."

## Encounters
None. The chapter's "fights" are rehab: balance, bars, stairs, laps, footwork marks, tennis-ball reaction. Each failure is a stumble with a line from Hana and an instant retry. The `alone_at_night` stealth cannot fail.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch1_told_hana_boxing` | bool | `hana` +1 | Ch6 Hana: "You told me about the fight on the bars, the second week. I didn't write it down. I should have." |
| `ch1_pike_stance` | played_along / insisted | Day-room pass vs payphone sign; Doreen line | Ch2: if `insisted`, the gray van is already parked on Kessler when Jin arrives (Pike was warned); if `played_along`, it arrives at dusk. Ch6: Pike's file on Jin reads "cooperative" or "agitated, monitor". |
| `ch1_records_route` | with_hana / alone_at_night | `hana` +2 / +0; scene variant | Ch6 Hana: "We found it together. I'm not stopping now." / "You could have trusted me. I'm here anyway." |
| `ch1_fare_source` | hana_loan / activities_jar / mr_bell | Money | Ch6: Hana's repay prompt (loan) or, if jar, Hana mentions Mrs. Alvarez cancelling bingo prizes in December (`hana` −1 when she connects it). Ch9 Penner (jar only): "Even the bingo money. We're not so different." Ch10 Jin's reflection. |

## Chapter ending and state handed on
- Ending beat: the bus window reflection, snow, the address card.
- Completion screen lists the three choices in plain words.
- Handed to Ch2: evidence `ev_name_card`, `ev_current_file`, `ev_transfer_form`, `ev_property_tag`, `ev_whitlow_note`, `ev_pike_card`; skills walk, run, jump, dash, backdash (punches unrestricted from Ch2); training levels (cap 1); money $3.90–$8.90 after the $1.10 fare; Hana's phone number (enables `q2_side_call_hana`).

---
# Chapter 2 — No One Waiting

**Chapter card:** "No One Waiting" · "Eastgate, Calder · December 19, 1996"

## Date, mood, palette, weather
- Thursday, December 19, 1996: 11:10 am (bus arrives) → late afternoon → dusk (streetlights come on during the sit beat) → night (alley) → midnight (shelter).
- Mood: familiar and wrong; grief with room around it; then a cold, ugly first fight.
- Palette: blue-gray slush streets, brown brick darkened by wet, Han's Market's green awning, Sunny's Diner's warm amber windows; night turns everything charcoal and plum with amber pools under the streetlights.
- Weather: overcast, old gray snow in the gutters; fresh snow starts at the sit beat and is falling in the alley (snow lit in the streetlight cone; puddle reflections in broken horizontal clusters).

## Gameplay identity
**Walking home and finding no one there.** Exploration of a neighbourhood the player saw lit and full in Chapter 0, now the same street in winter with other people's lives in it; talk, examine, sit. Then one street fight that teaches the new, weaker body.
- Exploration 35% · dialogue 25% · investigation 10% · combat 20% · cinematic 10%.
- Target length: 20–25 minutes.

## Locations
| id | Name | Size | Layout | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `kessler_ave` | Kessler Avenue, December | 2400 × 360, exterior, `sky:'overcast'` → `'night'`, `backdrop:'skyline'` | Route 9 bus shelter (Jin gets off here) → **poster wall** at Kessler & 5th → Han's Market → 412 Kessler stoop → Iron Pulse Fitness (old "MARSH B.C." still ghosting in paint on the brick above the new backlit sign) → Sunny's Diner (corner) → mouth of `kessler_alley` → parked cars → right edge toward the Monarch Hotel and Harbor Light | The chalk ring from Ch0 is gone. Han's window has a faded rectangle where "GO JIN" was taped. Okafor's lawn chair is folded and chained to the stoop railing for winter. The gray panel van (see `ch1_pike_stance`). | Day: flat gray; dusk: streetlights flicker on one by one left to right. Traffic hiss, a radio from Han's, a bus kneeling | Bus stop (map, from Ch2 end), 412 door, Iron Pulse (night only), Sunny's, alley, right edge → `harbor_light` |
| `kessler_412_stairs` | 412 Kessler stairwell | 360 × 720 (vertical: lobby, floors 1–3, roof door) | Lobby mailboxes → stairs with a wooden handrail → 3rd floor landing (doors 3A, 3B) → roof door | Mailbox 3B: "NOVAK" label over a scraped "SEO". A child's mitten on the 2nd-floor landing. The 3rd-floor hall bulb is new. | Dim, radiator clank, a TV through a door | 3A, 3B (threshold only), roof, street |
| `okafor_3a` | Mrs. Okafor's apartment | 640 × 360 | Door → sofa with a crocheted throw → side table with a framed photo → TV (church program) → window | **The framed photo:** Jin's 1994 walk-out, blurred, the ring lights white. "Min gave it to me. She said it was the only one where you didn't look arrested." The pink umbrella from the Seo hooks in her umbrella stand. A funeral program tucked in her Bible. | Warm lamplight, gospel radio low | Landing |
| `kessler_roof` | 412 roof | 960 × 360, exterior | Roof door → tar paper, antennas → water tank → Min's milk crate at the parapet | Far right on the skyline: the dome of Calder Civic Arena, faint, lit. | Wind, distant sirens, snow | Roof door |
| `sunnys` | Sunny's Diner | 960 × 360 | Door → counter and stools (Augie behind it) → **the booth by the window** → TV on a bracket → kitchen pass-through | TV: a commercial, "Ray Castell defends at the Civic — May — tickets on sale now". Hand-lettered "PIE $1.50". | Warm amber, grill sizzle, the bell over the door (a small brass bell: Jin's thought "Not that one. A smaller one.") | Street |
| `iron_pulse` | Iron Pulse Fitness, after hours | 1200 × 360 | Front desk (dark) → Nautilus machines under covers → aerobics mirror wall → **the old ring**, roped off, stacked with boxes → one heavy bag still hanging → the old taping bench → Teddy's janitor closet | A box "MARSH — STORAGE" with trophies sticking out. A schedule: "Fight team (sponsored): Mondays — mandatory." | Only the security lights and the closet bulb; Teddy's floor polisher | Street |
| `kessler_alley` | Alley behind Kessler | 1600 × 360, exterior, night; fire escape overhead (one-way platforms at y 220 and 150, ladder at x 600) | Diner back door with step (Augie smokes) → laundromat vent steam → dumpsters → **the streetlight** over a brick wall with torn posters (the art reference shot) → Han's delivery bay (truck, Tomas unloading) → far end: the gray van blocks the exit | The fight arena is x 500–1300. Bystanders sit outside it. | One amber streetlight cone, the diner's back-door bulb, the van's headlights at the end; snow in the light | Street (left), van end (right; blocked until after the fight) |
| `harbor_light` | Harbor Light men's residence | 800 × 360 | Front desk (a volunteer) → hall with a payphone → dormitory of cots → Jin's cot and locker | A sign: "Lights out 11. No alcohol. No weapons." Jin puts the knuckles in the locker. | Fluorescent, coughing, a radiator | Street |

## NPCs present
| id | Where / idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|
| `petra` | 3B doorway, toddler on her hip | "We've been here since July '95. Management said the last tenants moved out." / "Stuff kept coming for 'Seo'. I didn't know where to send it and I couldn't throw it out. That felt wrong." | — | — |
| `okafor` | Her sofa | See S2.3 | — | `ch0_purse_dream` |
| `teddy` | Iron Pulse, mopping the old ring's apron (dusk onward) | See S2.5 | "Bag's free after ten." | `ch0_told_teddy`; whether Jin has fought yet (knuckles) |
| `augie` | Sunny's counter; alley back step during the fight | "Coffee's on the house. You look like the weather." / alley: "Hey! HEY! I'm calling somebody!" | "Pie's from yesterday. Still pie." | Fight (runs inside to call; nobody comes) |
| `han` | Han's Market counter | Doesn't recognise Jin at first. When Jin buys something: "...Seo Jin? We heard — Ah. I had your poster in my window." | "Lotto's up to four million." | — |
| `tomas` | Alley delivery bay, unloading soda cases | "Not my business, man. Not my business." | — | Keeps working through the fight, eyes down |
| `benny`, `carl`, `vic` | The van | Benny: "Daniel Ahn? St. Agnes misses you, buddy. Get in the van." / Carl: "Pike said you'd say that." | — | `ch1_pike_stance` (timing) |

## Interactables
| id | Label | Examine | Unlocks |
|---|---|---|---|
| `o_bus_shelter` | Bus shelter bench | Sit: memory. | `mem_bus_umbrella` |
| `o_poster_wall` | Poster wall (verb: Peel, ×4) | Layer 1 "IRON PULSE FITNESS — NOW OPEN 24 HRS". Layer 2 "THE RUST BELT REVUE — LIVE AT STARLITE LANES — FRIDAYS" (seeds Ch3). Layer 3 "CALDER IRONMEN '96". Layer 4: the fight poster, half torn. "Min was right. I look like I'm being arrested." | `ev_jin_poster` |
| `o_han_window` | Han's window | "There's a clean square on the glass where my name was taped." | — |
| `o_mailbox_3b` | Mailbox 3B | "NOVAK. You can still see where SEO was scraped off. Somebody used a key." | — |
| `o_mitten` | Mitten on the landing | "A kid's mitten. Somebody lives here." | — |
| `o_3b_threshold` | 3B (from the doorway) | Camera pushes over Jin's shoulder (zoom 1.4): yellow walls, a high chair where the table was, the same window. "Same window. Different everything." | — |
| `o_okafor_photo` | Framed photo | "My walk-out. The lights went white in it. Min took it from section eight." | — |
| `o_funeral_program` | Funeral program | "In loving memory. Seo Mi-ok, 1942–1996. Seo Min-ji, 1972–1996. St. Brendan's Church, February 24." (No thought line. The text sits on screen alone for 3 s before the box can be closed.) | — |
| `o_min_crate` | Milk crate on the roof | Sit: memory. | `mem_roof_july` |
| `o_booth` | Booth by the window | Sit ($3.50 plate, or coffee on the house) | thoughts |
| `o_taping_bench` | Taping bench | Memory. | `mem_first_wraps` |
| `o_marsh_box` | "MARSH — STORAGE" | "Golden Gloves '82. Teddy's photo with the mayor. My amateur belt. In a box behind the leg press." | — |
| `o_knuckles` | Brass knuckles (in the fight) | "[E] Take the knuckles" | gear `knuckles` |
| `o_benny_vest` | Benny's vest (after the fight) | Doc: the pickup slip. | `ev_pickup_order` ★ |
| `o_shelter_phone` | Payphone (Harbor Light) | Calls Hana (`q2_side_call_hana`) | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q2_main` | main | "Go home. 412 Kessler, 3B." → "Ask Mrs. Okafor across the hall." → *(no objective; the HUD stays empty and the minimap dims to partial until Jin sits somewhere)* → "Find a bed for the night. Past the alley." → (fight) → "Find the man who was supposed to protect you." → "Sleep." | 3B knocked; Okafor's account; any sit spot used; alley trigger; pickup slip taken; cot | `ev_okafor_account`, `ev_pickup_order`, knuckles |
| `q2_side_mail` | side | "Petra kept the mail." | Accept the shoebox | `ev_returned_letter` early (`ch2_took_mailbox`) |
| `q2_side_teddy` | side | "The lights are on at Iron Pulse." (appears at dusk) | Teddy scene | `ch2_teddy_met`, `ch2_teddy_tone`, `mem_corner`②, Iron Pulse training (bag, mitts, footwork) |
| `q2_side_call_hana` | side | "Call Hana. That's an order." | Shelter payphone | `hana` +1 |
| `q2_side_places` | collectable | "Familiar places" (bus shelter, roof, booth, taping bench) | Each one is a memory or a thought | Memories |

## Scripted scenes, beat by beat
**S2.1 Arrival.** The Route 14→9 bus doors open; camera starts inside the bus (zoom 1.3) and lets Jin step out into a wide shot (0.9) of Kessler Avenue in flat December light. No music; traffic. First thought: "Same street. Somebody moved all the furniture."

**S2.2 3B.** Knock (the player presses E on the door). Petra opens with the chain on, toddler on her hip. "Can I help you?" — "I lived here." — "We've been here since July '95. Management said the last tenants moved out." Camera over Jin's shoulder into the apartment. Petra, after a beat, softer: "Stuff kept coming for 'Seo'." **Choice `ch2_took_mailbox`:** "Can I have it?" (she brings a shoebox; `ev_returned_letter`) / "Keep it. Or throw it out. It's fine." Petra: "Mrs. Okafor across the hall. She'd know. She's been here forever."

**S2.3 Mrs. Okafor (the discovery).** She opens the door, doesn't know him, then does. She holds his face in both hands. "Jin. My dear. Oh, my dear." She sits him on the sofa (camera eases out to 1.0, lamp light, the window going dim). She tells it plainly, in order, and the dialogue box is slower here:
- "They lost the apartment in the spring of '95. Your mother fought it. She went to the court herself, in her good coat."
- "Your mother told everyone you'd [`rent`: pay off the rent and the rent after that / `umma_saturdays`: get her Saturdays back / `new_apartment`: find a place with a door for Min to slam]. She said it at church. She said it at the laundromat."
- "They went to a rooming house on Garrison Street. Lindell House."
- "There was a fire. In February. This February." (camera starts a very slow zoom out, 1.0 → 0.85, over the next lines)
- "Both of them, Jin. In the night."
- Silence: three seconds with no box. Then Okafor: "The county buried them. Section fourteen at Municipal. My church put up a cross; it isn't much."
- "What the fire didn't take, the county boxed. The property room at the City Hall Annex. Ask under Seo."
- "She looked for you. Min looked for you every day. Where were you, my dear?"
- Jin: "In a bed. With somebody else's name over it."
- She gives him the pink umbrella. `ev_okafor_account` ★. No toast sound for this evidence (silent add, badge only).

**S2.4 Room to breathe (the rule: no enemy wave here).** Control returns on the landing with `muffle 0.3` for 20 s. The HUD objective is empty. The minimap goes to "partial". Sit glints appear on the 412 stoop, the bus-shelter bench, the roof crate and Sunny's booth. Every sit spot has 2–3 of Jin's thoughts, written short:
- Stoop: "Garrison Street. February. I was on Hillcrest in February, counting ceiling tiles." / "She went to court in her good coat. The navy one with the big buttons."
- Bus shelter: memory `mem_bus_umbrella` (Umma waiting with two umbrellas after his first amateur loss: "You lost. Okay. Umbrella.").
- Roof crate: memory `mem_roof_july` (Min: "Hold still, you're in my shot.").
- Sunny's booth: Augie: "Coffee's on the house. You look like the weather." Jin's thought: "Min paid for pie here once and came up forty cents short. We split it anyway."
- The first sit passes time: the camera eases out to 0.8 and holds for 6 s while dusk falls and the streetlights come on one by one along Kessler (left to right), and the snow starts. Then the objective returns: "Find a bed for the night. Past the alley." Jin's thought: "Sleep. Then Garrison Street. Then the Annex."
- The van: if `ch1_pike_stance == insisted`, it has been parked opposite 412 since the player arrived (Okafor: "That van's been out there since eight this morning.") and is visible all through the breathing section, never moving: dread without interruption. If `played_along`, it turns onto Kessler at dusk, headlights on.

**S2.5 Teddy (optional; Iron Pulse from dusk to chapter end).** Teddy sees Jin, drops the mop. "...Kid?" He crosses his arms (`armsCrossed`) and looks at the floor.
- Teddy: "Pike, the fund fella, he told me you didn't want visitors. Said you didn't know your own name."
- Jin: "I knew it. Nobody asked."
- Teddy: "I said it was nerves. I said it to your face. Two years I've been saying it to the mirror. Your eyes were swimming in the second. I saw it. I called it nerves because the other thing meant stopping a title fight, and I'd waited thirty years for one." (`mem_corner` shard ②)
- If `ch0_told_teddy`: "You told me about the coat. I told you we'd win anyway." / else Jin tells him now; Teddy: "You never said a word. Jesus, kid. And I sent you out."
- If Jin already has the knuckles: Teddy sees them. "You've been in the street. With those." (no judgement line beyond that; he looks away)
- **Choice `ch2_teddy_tone`:**
  - "You sent me out." → `blamed`. Teddy: "I did." He doesn't argue. (`teddy` −1)
  - "You didn't know." → `forgave`. Teddy: "Don't. Don't make it easy." Beat. "...Thanks." (`teddy` +2)
  - "Who else was in my corner? Who did the water?" → `asked`. Teddy: "Lenny. Lenny Voss did the bucket and the cups. Haven't seen him since spring of '95." (`teddy` +1)
- Teddy: "Gym belongs to a fitness outfit now. I sweep it. Nights it's mine. Bag's still there. After ten, you come hit it." `ch2_teddy_met` = true. Training at Iron Pulse unlocks (bag, mitts, footwork; cap 1 this chapter).

**S2.6 The alley (the art-reference shot).** Entering the alley at night: a short un-skippable framing (letterbox on, 4 s): wide shot at zoom 0.9 of the brick wall with torn posters, the dumpster, the fire escape overhead, the single streetlight; Jin walks into the cone and stops. If the player presses nothing, he leans on the wall, hands in pockets, one knee bent (`leanWall`): the game's key image. Augie is smoking on the diner step; Tomas is unloading cases. Then the van's headlights sweep the far wall. Benny and Carl get out; Vic stays at the wheel, then gets out too. Letterbox off.
- Benny: "Daniel Ahn? St. Agnes misses you, buddy. Get in the van."
- Jin: "Wrong guy."
- Carl: "Pike said you'd say that."
- Benny reaches for Jin's collar (a slow grab: the first telegraph the player sees).

## Encounters
**E2.1 The alley** (`A.fight`; arena x 500–1300; `maxAttackers: 2`; checkpoint at the alley mouth and again at the knuckles).
- **Phase 1, bare hands:** Vic (`thug`, light, launchable) and Benny (`collector`: big, slow, committed haymaker with a long wind-up, a grab when Jin is close and in front). Tips: at start "Their swings are slow and committed. SLIP or BACKDASH, then JAB–CROSS, then get out."; at first whiff "He missed. That's your opening. Two punches, not five."; at low breath "Breath low. Back off. Let it come back." Vic goes down after a few clean exchanges. Benny staggers under jab–cross but recovers: his poise refills whenever Jin's breath runs empty. This is the lesson the PDF asks for: speed and timing are still exceptional; ordinary punches have less stopping power; extended exchanges exhaust him.
- **Transition:** Carl climbs out of the van (second `collector`). Benny swings a haymaker wearing brass knuckles; if Jin slips it, Benny hits the dumpster and the knuckles spin out of his hand and land at Jin's feet (if Jin is hit instead, Benny drops them reeling from the effort; the beat happens either way). Brief slow motion (0.4 s) as the prompt appears: "[E] Take the knuckles". Fighting continues around the prompt; if the player ignores it for 10 s, a thought: "Bare hands won't put these two down." The prompt stays until taken. On pickup: thought "Teddy would have thrown me out of the gym for this." Toast: "Knuckles: more stagger, more damage. Not boxing anymore."
- **Phase 2, knuckles:** Benny and Carl together, attack token limits them to one swing at a time. Their haymakers now stagger-break when Jin lands jab–cross after a slip. Both go down.
- **Bystanders** stay outside the arena and react: Augie shouts and goes inside to call (no one comes); Tomas keeps stacking cases ("Not my business"); the laundromat attendant pulls her shade down. None of them are hittable, and nobody in the alley is hostile except the three from the van.
- **After:** Benny is down by the dumpster, Carl crawls toward the van. Questioning (`talk` on a downed enemy):
  - Jin: "Who sent you?"
  - Benny: "Pike. The fund guy. He don't hire us direct. Lenny does. Lenny Voss. Gives us the jobs, takes his piece."
  - Jin (thought): "Lenny. Lenny did the bucket."
  - Benny: "He does cuts at the Cellar now. Under Starlite Lanes, out on Route 9. Saturdays. Come on, man, I told you."
  - Jin takes the slip from Benny's vest: `ev_pickup_order` ★.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch2_took_mailbox` | bool | `ev_returned_letter` now | Ch6: if not taken, it is in the Annex mail-return bin instead (same text). |
| `ch2_teddy_met`, `ch2_teddy_tone` | blamed / forgave / asked | `teddy` −1 / +2 / +1; Iron Pulse training | Ch4 dash-straight teacher; Ch8 corner; Ending Two teaching vignette |
| `ch2_collector_after` | let_go / hit_again | let_go: Benny crawls to the van, which leaves. hit_again: Jin raises the knuckles; hard cut to black on the impact sound; Benny's groan; Jin's thought: "That one wasn't for information." | Ch3 Lenny: "Benny says you let him walk." / "Benny's jaw is wired shut. That was you?" Ch6 Benny at Pike's office steps aside ("You let me walk. I'm walking.") or is absent (in hospital). Ch10 Benny on the Alder Row crew: steps aside or fights. `harm_count` +1 if hit_again. |

**S2.7 Night.** The van leaves (or doesn't, if Vic is still out cold and the engine just idles; the doors hang open). The objective: "Find the man who was supposed to protect you." Jin walks to the right edge; the Monarch Hotel's clerk: "Forty a week, in advance." Jin has under $10: "Next week." Harbor Light: a cot, a locker. Jin puts the knuckles on the locker shelf. Optional payphone call to Hana (`q2_side_call_hana`):
- Hana: "You called. Good." Beat. "Jin? You sound — what happened?"
- Choice (no flag): "They're gone. Both of them. A fire." / "I found my street. I'll tell you later."
- If told: a long silence on the line, the sound of the hospital corridor behind her. "I'm so sorry. ...I'm still here. Call me tomorrow too." (`hana` +1 either way.)
- Jin lies on the cot (`lieBed`). Camera eases out to show the dormitory, thirty cots, one lamp. Thought: "Lenny Voss. Saturday."

## Chapter ending and state handed on
- Ending beat: the cot, the locker with the knuckles in it, the word "Saturday".
- Handed to Ch3: knuckles gear; breath on; `ch2_*` flags; evidence `ev_okafor_account`, `ev_pickup_order`, `ev_jin_poster` (opt.), `ev_returned_letter` (opt.); memories; map nodes `n_kessler`, `n_sunnys`, `n_ironpulse` (if met), `n_monarch`, `n_riverpath`; bus travel enabled.

---
# Chapter 3 — The Price of Admission

**Chapter card:** "The Price of Admission" · "Starlite Lanes, Route 9 · Saturday, January 11, 1997"

## Date, mood, palette, weather
- Saturday, January 11, 1997, 6:30 pm to 1:10 am.
- Mood: loud, smoky, transactional, oddly friendly. Everyone down here has a reason, and none of the reasons is evil.
- Palette: upstairs, Starlite's turquoise and pink neon over maple lanes and orange plastic seats; downstairs, the Cellar in brown plywood, dirty-gold work lights, a canvas ring stained the colour of tea, cigarette haze in blue layers. The pinsetter loft is black machinery with white pins flashing past.
- Weather: hard frost on Route 9; a sodium-lit parking lot with old snow banks; the Starlite sign buzzing.

## Gameplay identity
**A fight card with an investigation threaded through it.** Three short bouts against trained opponents who each fight for a different reason, conversations between bouts, two coaching sessions that teach the hook and the slip-counter, then a chase through the pinsetter machinery and a witness the player can either hear out or break.
- Exploration 15% · dialogue 25% · investigation 15% · combat 35% (three bouts) · activities 10% (bag, slip-rope).
- Target length: 22–25 minutes.

## Locations
| id | Name | Size | Layout | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `starlite_lot` | Starlite Lanes parking lot | 900 × 360, exterior, night | Route 9 bus stop → snow banks, a few cars, Mo's maroon Cadillac → the neon sign "STARLITE LANES · 24 LANES · COCKTAILS" (the "C" of COCKTAILS out) → front doors | A hand-lettered sign taped in the door: "RUST BELT REVUE FRIDAYS · LEAGUE NIGHT TUES". | Pink neon on snow | Bus stop (map), front doors |
| `starlite_lanes` | Starlite Lanes | 1800 × 360 | Front doors → shoe counter → lanes 1–12 (a Teamsters league bowling; balls crash; pins fall in the distance) → snack bar → arcade cabinets → door "EMPLOYEES ONLY" (bouncer Tiny) → service corridor (right) with a ladder to the pinsetter loft (locked until after the card: "Tiny's standing on the ladder. 'Card first.'") → back door to Doc Ferris | A trophy case of bowling trophies; one boxing trophy among them, unlabelled. The floor thuds with every strike. | Neon, fluorescent, crashing pins, a jukebox | Lot, cellar stairs, loft ladder, Ferris |
| `cellar_stairs` | Stairs down | 360 × 540, vertical | Door at the top → steep plywood stairs → a landing with a coat rack full of winter coats → door at the bottom | Graffiti in marker on the stair wall: dates and names of past bouts, crossed out or circled. "SLIM 3-0!!" circled. | One bulb; the crowd below getting louder with each step | Lanes, Cellar |
| `cellar` | The Cellar | 1600 × 360 (low ceiling at y 90; pipes) | Bottom of the stairs → plywood bar (bartender) → bleachers made of old lane wood → **ring** (x 600–1000; mismatched ropes, one is a tow rope; blue corner left, red right) → betting cage (chicken wire, bookie "Nickels") → Mo's card table → warm-up corner (heavy bag, Mari's slip-rope strung between two pipes) → door to the lockers | Every strike upstairs shakes dust from the ceiling onto the ring (a falling-dust particle burst on a timer). A chalkboard: tonight's card in Mo's handwriting. | Work lights, haze; crowd of ~30 (`crowd` density medium, mood 'idle' → 'cheer' during bouts); a brass hand bell on Mo's table (a cheap echo of Ch0's bell: higher pitched) | Stairs, lockers |
| `cellar_lockers` | Fighters' lockers | 800 × 360 | Door → benches → lockers (Slim's gym bag on a bench) → taping table with a stack of **paper cups** by a water jug → Lenny's cutman station (Q-tips, adrenaline swabs, a towel, a spare roll of white tape) → a toilet stall | Slim's bag: an Iron Pulse fight-team schedule ("Mondays — mandatory. Cellar bookings — mandatory."). Deshawn's bench: a Bible and a pocket ledger. | Bare bulb, a dripping pipe, the crowd through the wall | Cellar |
| `pinsetter_loft` | Pinsetter loft | 1200 × 480 (two catwalk levels: y 330 and y 200, ladders at x 150, 620, 1050) | Ladder up from the service corridor → lower catwalk along twelve pinsetting machines (sweep bars cycle, pins drop on a rhythm) → upper catwalk → far end: Lenny's corner (a cot, a hot plate, a coffee can, a calendar of 1994 still on August) | The machines are hazards with a rhythm: a sweep bar crossing the catwalk knocks Jin down (no damage, just a reset to the last ladder) unless he dashes through the gap. | Deafening clatter, strobing gaps of light from the lanes below | Ladder down |
| `ferris_backroom` | Doc Ferris's room | 640 × 360 | Back door → a dentist's chair → a sink → a wall price list | **The price list** (see Interactables). | Single lamp, a radiator | Back door |

## NPCs present
| id | Where / idle | Key lines | Barks |
|---|---|---|---|
| `mo` | Mo's card table, counting bills (licks his thumb); referees the bouts himself | "Admission's free for fighters. The price is you fight when I say and you fall when I say." / "Everybody down here's free to leave. Funny thing: nobody does." / "I'm the ref. Don't make me move." | "Bets close at the bell!" |
| `lenny` | Lockers, at his cutman station; avoids Jin until bout 2 | "Lookin' sharp, champ." (he says it before he recognises him, and then stops) / "It's water! It's just water, Jin, I swear on my mother." / "I carried a bucket. Everybody in that building carried something." | — |
| `slim` | Lockers, bouncing on his toes in a gray hood | "If I don't go three, Iron Pulse cuts me. That's the deal. I didn't make it." | "You're the guy from the poster? The old one?" |
| `ollie` | Warm-up corner, on the heavy bag, red beard | "Only place in Calder I'm allowed to hit a man and buy him a beer after." / "Turn the hip, not the arm." | "Hey, Eastgate! Hit me pretty tonight." |
| `deshawn` | Lockers, seated with his Bible, very still | "Round two, I go down. Don't make it ugly. Some of us gotta be here next week." / "I sparred for Castell's camp last spring. Two weeks. He paid on time. That's all I know about him." | — |
| `mari` | Warm-up corner by the slip-rope, taped knuckles | "Don't back up from a jab, papi. Move your head. Then he's the one in trouble." / "I fight for rent. Not glory, not God. February's rent." | "Again." |
| `ferris` | His back room, in rubber gloves | "Stitches I can do. Miracles are across town and they cost more." | — |
| `tiny` | Bouncer on the Employees Only door, later on the loft ladder | "Admission's free for fighters." / "Card first." | — |

## Interactables
| id | Label | Examine | Unlocks |
|---|---|---|---|
| `o_card_chalkboard` | Tonight's card | "SEO (new) vs DOBBS · SEO vs KRAUS · SEO vs PRYOR. Mo spelled my name right. Nobody else in Calder has, lately." | — |
| `o_booking_card` | Mo's index cards (only while Mo is upstairs, between bouts 1 and 2) | Doc: the booking card. Thought: "'PRYOR GOES R2.' Down here they write it on an index card." | `ev_booking_card` |
| `o_slim_bag` | Slim's gym bag | "Iron Pulse fight team. 'Cellar bookings — mandatory.' Teddy's gym books kids into a bowling alley basement." | — |
| `o_deshawn_ledger` | Pocket ledger (only if Deshawn lets him; he hands it over in conversation) | "Owed Mo: $1,100. Minus 200, minus 200, minus 150. Every line is a Saturday." | — |
| `o_paper_cups_cellar` | Paper cups | "Same cups. Every building has them." (a heartbeat sound, once) | — |
| `o_lenny_station` | Lenny's station | "A roll of white tape, same as the one on his wrist." | — |
| `o_dust` | Falling dust | "Somebody upstairs just bowled a strike." | — |
| `o_ferris_list` | Price list | "STITCHES $40 · NOSE $60 · RIBS $150 · TEETH (ask) · REAL REHAB $84,000 · NOT HERE". Thought: "Same number as Dr. Whitlow. Everyone in this city knows what I cost." | — |
| `o_lenny_calendar` | Calendar (loft) | "August 1994. He never turned the page." | — |
| `o_coffee_can` | Coffee can | Doc: the tape and the voucher. | `ev_lenny_tape` ★, `ev_lenny_receipt` ★ |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q3_main` | main | "Find Lenny Voss at the Cellar." → "Get on Mo's card." → "Bout 1: Slim Dobbs." → "Talk to the fighters." → "Bout 2: Ollie Kraus." → "Lenny ran. Finish the card first." → "Bout 3: Deshawn Pryor." → "Find Lenny in the pinsetter loft." → "Hear what Lenny has to say." | Bouts won; loft reached; confession | Purses; hook and counter; evidence; next lead: Harlan Freight Depot, Dock Road |
| `q3_side_hook` | side (teaching) | "Ollie's on the bag. Watch him." | 3 clean hooks on the bag | `skill hook` |
| `q3_side_slip` | side (teaching) | "Mari's slip-rope." | 3 slip-counters on Mari's mitts | `skill counter` |
| `q3_side_deshawn` | side | "Mo docked Deshawn $200." (only if `refused`) | Pay or don't | `ch3_deshawn_paid` |
| `q3_side_ferris` | side | "Doc Ferris, back of the lanes." | Visit; stitches optional ($40) | The price list; Ferris becomes available Ch3–9 |

Note: the hook and slip teaching sides are presented as optional, but the next bout's opener tip repeats the lesson. If the player skips Ollie's bag, the hook unlocks the first time Jin is hit by Ollie's own hook and then lands a punch ("Watched him do it. Do it back."), so practice and encounter both lead to the skill. The same fallback applies to the counter in bout 3.

## Scripted scenes, beat by beat
**S3.1 Admission.** Wide shot of the Starlite sign in the snow (zoom 0.85), the bus pulling away. Inside: lanes, noise. Tiny at the Employees Only door: "Admission's free for fighters." Jin: "Then I'm a fighter." Down the stairs (camera follows vertically, the crowd sound rising). Mo at his table:
- Mo: "Seo. Jin Seo. I had money on you once. Not much. Enough to remember."
- Jin: "I'm looking for Lenny Voss."
- Mo: "Lenny's my cutman. You want my cutman, you're a fighter. Fighters get a cutman. Three on the card tonight. Fifty, seventy-five, a hundred. No metal in my ring." (He nods at the knuckles; Jin pockets them. The HUD shows "Wraps" instead of the knuckles icon: power 0.60 for bouts.)
- Mo: "Admission's free for fighters. The price is you fight when I say and you fall when I say."

**S3.2 Lockers before bout 1.** Slim bouncing, hood up. "You're the guy from the poster? The old one?" Then: "If I don't go three, Iron Pulse cuts me. That's the deal. I didn't make it." Lenny's station is empty: a towel, the tape roll. Mari tapes Jin instead: "Lenny's 'on a break.' Lenny's been on a break since you came down the stairs."

**S3.3 Between bouts 1 and 2.** Free roam of Cellar and lockers. Mo goes upstairs to settle with the bowling league ("Don't touch my table.") so the booking card can be read. Ollie at the bag teaches the hook (activity `train_bag`, hook only: "Turn the hip, not the arm. Your arm's along for the ride."). Deshawn reading.

**S3.4 Bout 2's corner: the cup.** Mo: "Lenny! Work the new kid's corner, or you're off my payroll." Lenny comes out. He doesn't look at Jin. After round 1, Jin sits on the stool. Lenny holds out a paper cup of water. "You're dry. Drink." (He says it on autopilot; then he hears himself.) Camera: close on the cup at zoom 1.6, then up to Lenny's wrist, the white tape roll worn like a bracelet. Memory filter for 0.8 s: `mem_cup` shard ②. Heartbeat.
- **Choice `ch3_cup`:**
  - "[Drink it.]" → `drank`. Jin drinks, watching Lenny. The world muffles for one second (the Ch0 effect, very brief), then clears. Thought: "Water. Just water. My hands are shaking anyway."
  - "[Pour it out on the canvas.]" → `poured`. Jin turns the cup over slowly; water spreads on the canvas. Lenny takes one step back (`cower`). "It's water! It's just water, Jin, I swear on my mother."
- Round 2 plays. When the bell ends the bout, Lenny is gone. Mari: "Your cutman ran. Never seen Lenny run. He's usually too lazy."
- Mo: "You walk out on my card, you don't come back down these stairs. Lenny included." Objective: "Lenny ran. Finish the card first."

**S3.5 Mari's slip-rope.** `train_mitts` framing: Mari swings jabs; slip, then counter-cross on her mitt. "Don't back up from a jab, papi. Move your head. Then he's the one in trouble." Three clean ones unlock `counter`. Tip: "After a successful SLIP, press ATTACK for a counter-cross. The game won't do it for you."

**S3.6 Deshawn (the dive).** Lockers. Deshawn closes his Bible.
- Deshawn: "Round two, I go down. Don't make it ugly. Some of us gotta be here next week."
- Jin: "Who says?"
- Deshawn: "Mo says. I owe Mo eleven hundred. He takes it off in Saturdays. Two hundred if I go down when he says."
- Jin (thought): "Sixty thousand dollars. Go down in the fourth. Wake up with the rent paid."
- **Choice `ch3_deshawn_dive`:**
  - "Okay. Round two." → `accepted`. Deshawn nods once. "Appreciate it." (`deshawn` +1)
  - "No. Fight me for real." → `refused`. Deshawn looks at him for a long time. "Then I don't get my two hundred. You understand that? You're making a principle out of my rent." Beat. "...Fine. Then I'm not gonna lie down." (`deshawn` −2, may be recovered by paying)
  - (Both options say plainly what follows. Neither is a trap.)

**S3.7 After bout 3.** If `accepted`: Deshawn drops in round 2 to the first clean cross. The crowd boos. Mo counts slowly and smiles. Mo pays $100 plus $50: "Smart money for a smart man." Jin's thought: "That's what it feels like from this side." If `refused`: Mo pays $100, then turns to Deshawn: "You made me look like a liar, Pryor. Two hundred on your number." Deshawn says nothing, picks up his bag. **Choice `ch3_deshawn_paid`** (shown only if Jin has ≥ $200; if he doesn't yet, the option returns in Ch4's prep evening and Ch5): "[Give Deshawn $200.]" / "[Let it go.]". If paid, Deshawn: "Why?" Jin: "It was my principle. It shouldn't be your rent." (Implementation: `refused` sets `deshawn` to −2; paying sets it to +2, matching the registry.)
- Mo's offer. Mo: "You're good for business. Crowd likes the guy who used to be somebody. Saturdays. You go down in the second, I give you one-fifty. Twice a month, steady."
- **Choice `ch3_mo_deal`:** "I'll think about it." → `accepted` (unlocks "Saturday at the Cellar" in Ch4–6, max two) / "I've heard that offer before. The other guy wore a nicer coat." → `declined`. Mo laughs. "Everybody's heard it. Some people get smart."
- Tiny steps off the loft ladder. Mo: "Card's done. Go find him. Don't break my pinsetters."

**S3.8 The loft (chase, no combat).** Lenny is seen running along the upper catwalk. The player crosses the lower catwalk through the sweep-bar rhythm (dash through gaps; a mistimed dash knocks Jin down and resets him to the last ladder in 1 s), climbs, and corners Lenny at his cot. Camera eases in to 1.2 as the machines' noise drops (Lenny pulls the breaker for his row: sudden quiet, emergency light only).
- Lenny: "Benny says you [let him walk / broke his jaw]. Benny says you hit like you used to."
- Lenny: "I carried a bucket, Jin. That's all. Everybody in that building carried something."
- **Choice `ch3_lenny_method`:**
  - **Patient** ("[Sit down across from him. Let him talk.]"): Jin sits on an upturned crate. A `present` activity runs three times; each correct item breaks one minimisation and Lenny goes further:
    1. Claim "You did more than carry a bucket." → present `ev_pickup_order` ("job via L.V."). Lenny: "Okay. Okay. I pass Pike's jobs to Benny. That's money, that's not — that's not the fight."
    2. Claim "Somebody gave me something before the walk-out." → present `ev_transfer_form` or `mem_cup`. Lenny, after a long silence: "It was in the cup. In B. Before the walk. 'You're dry, drink.' They said something to slow you down. Nothing permanent. Ten minutes, slow by the third." `mem_cup` shard ③ completes (a full memory plays: Locker Room B, 9:47 pm, Lenny's taped wrist holding the cup out, Teddy's back turned at the door).
    3. Claim "Who paid you?" → Lenny volunteers it without a present: "Freight office on Dock Road. Harlan Freight. They paid the corner, the security, the ambulance after. Dutch Brannigan hands out the envelopes. Dutch don't think of things like this. Somebody upstairs from Dutch does. I never saw upstairs." He gives the coffee can. Complete tape, receipt. "I'll say it again. To a lawyer, a judge, whoever. Just don't make me say it to you twice." (`lenny` +2)
  - **Pressed** ("[Grab him. Make it quick.]"): Jin pins Lenny against the machine frame; Lenny's hand knocks the breaker and the sweep bar starts moving again behind his head. One exchange: "Who paid?" — "Dock Road! Harlan Freight! Brannigan!" Jin takes the coffee can; Lenny yanks the cassette and the tape stretches (`ev_lenny_tape` partial). `mem_cup` shard ③ still completes, but from the tape's audio rather than from Lenny's face. Lenny runs down the far ladder. (`lenny` −3; `harm_count` +1)
- Either way: `ev_lenny_receipt`, `ev_lenny_statement` (minimised or plain). New objective appears on the HUD: "Harlan Freight Depot, Dock Road."

**S3.9 Out into the lot (quiet).** Jin sits on the snow bank under the Starlite sign. Thought (variant by `ch3_deshawn_dive`): accepted: "Deshawn went down for two hundred dollars. I let him. That's the same arithmetic." / refused: "I cost Deshawn two hundred dollars to keep my hands clean. I don't know if that's better." Then: "Dock Road."

## Encounters
All three are `A.bout` with Mo refereeing, `rounds: 3`, `roundTime: 60`, wraps (`power 0.60`), crowd on, Mo's hand bell, `allowLoss: false` (a loss restarts the bout), checkpoint before each bout.

| Bout | Opponent | Archetype tuning | What it teaches | After |
|---|---|---|---|---|
| 1 | Curtis "Slim" Dobbs, 19 | `boxer`, low hp and poise; keeps distance with a long jab; if Jin throws three jabs in a row Slim slips and counters (the "punish repeated jabs" rule, introduced gently) | Don't spam jabs; close distance with a dash, then jab–cross; respect a trained opponent's spacing | **Before round 3** (corner, Mari): **choice `ch3_slim_carried`**: "[Carry him to the bell. He keeps his place.]" / "[Finish it.]". Carry: round 3 runs with Jin's damage at 30% and Slim unable to drop; the player wins on Mo's card if Jin lands more than he takes. It is harder to fight like this, and the game says so: "Hold back. Win the round without dropping him." Finish: Slim's poise is low and a clean jab–cross–(hook) drops him. Afterwards, carried: Slim, in the lockers: "You carried me. Why'd you carry me?" (`slim` +3). Finished: Slim on the bench with his hood up; his Iron Pulse schedule in the trash can (`slim` −2; `harm_count` unaffected, since knocking a man out in a sanctioned bout isn't Q4) |
| 2 | Ollie Kraus, 34 | `boxer` with heavy build: slower, high poise; leaves **different openings after different misses**: a missed jab leaves his chin open to a cross, a missed hook leaves his body open to a hook; feints once per round | Read what he missed, answer with the matching punch; hook as a tool | Ollie, laughing on the ropes: "Only place in Calder I'm allowed to hit a man and buy him a beer after." He buys the beer (Jin can drink it or set it down; flavour). |
| 3 | Deshawn Pryor, 26 | `accepted`: `boxer` scripted to drop in round 2 on the first clean cross. `refused`: full `boxer`: feints twice per exchange, punishes three jabs with a slip-counter, keeps range, leaves only small openings after a missed straight | Slip → counter-cross under pressure; patience | See S3.7 |

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch3_slim_carried` | bool | Round 3 mode; `slim` +3 / −2 | Ch10 on the Alder Row crew: `slim ≥ 1` → he drops his hands and stands with the residents ("You carried me once."); `≤ 0` → he fights Jin (a `boxer` in the wave, reluctant, leaves after one knockdown). |
| `ch3_cup` | drank / poured | Lenny's reaction | Ch8 Teddy's cup scene: if `poured`, Jin pours Teddy's cup too and Teddy drinks from the bottle instead ("Fair."); if `drank`, Teddy drinks first from the same cup: "It's water, kid. Watch me. ...See? Water." |
| `ch3_deshawn_dive` | accepted / refused | Bout 3 length; `deshawn` | Ch8: `deshawn ≥ 1` → Deshawn confirms Ray's tell ("He drops that right shoulder. Every time. I sparred him two weeks."). Ch9 Penner (accepted): "You've taken a gift before." Ch10 reflection. `take_count` unaffected (it's Q1-adjacent: Jin was paid to accept a result). |
| `ch3_deshawn_paid` | bool | −$200; `deshawn` to +2 | Ending Two wave 3: Deshawn fights beside Jin if `deshawn ≥ 2`. |
| `ch3_mo_deal` | accepted / declined | Saturday dives unlocked | `cellar_dives_taken` (0–2) read by Ray (Ch8), Penner (Ch9), reflection (Ch10). |
| `ch3_lenny_method` | patient / pressed | Tape complete or partial; `lenny` +2 / −3 | Lenny is a copy holder (Ch8) and testifies in Ending Two only if `lenny ≥ 1`. Pressed: Lenny leaves Calder; Ending Two notes "Lenny Voss was never found to testify." `harm_count` +1 if pressed. |

## Chapter ending and state handed on
- Ending beat: the snow bank under the broken "C" of COCKTAILS; the word "Dock Road".
- Completion screen: three bouts listed as results ("Dobbs — carried to the bell" / "Dobbs — KO R3"), the dive, the cup, how Lenny was handled.
- Handed to Ch4: skills hook, counter; training cap rises to 2; money +$225 (or +$275 with smart money, −$200 if Deshawn paid); evidence `ev_lenny_tape`, `ev_lenny_receipt`, `ev_lenny_statement`, `ev_booking_card` (opt.); memory `mem_cup` complete; map nodes `n_starlite` (Saturday dives if accepted), Doc Ferris; new node `n_dockroad` pencilled on the map.

---
# Chapter 4 — Collections

**Chapter card:** "Collections" · "Harlan Freight Depot, Dock Road · January 25–27, 1997"

## Date, mood, palette, weather
- Part A: Saturday, January 25, 3:40 pm (scouting in fading daylight). Part B: the same evening (preparation). Part C: Monday, January 27, 11:40 pm to 2:15 am (the assault).
- Mood: cold, methodical, then chaotic and dangerous; the records room is a held breath; the boss is a wall closing in.
- Palette: river slate-blue, rust orange containers and boxcars, green-gray dock metal, sodium-yellow floodlights, sleet streaks in white; inside, olive office paneling, a green-shaded counting lamp, cash in pale green stacks.
- Weather: Saturday overcast and windy; Monday sleet, turning to wet snow during the boss fight. Puddles reflect the floodlights in broken horizontal clusters.

## Gameplay identity
**A heist without a plan that holds.** Scout the depot by watching it, prepare one new technique, then push through a crowded working yard, a two-level warehouse and an office floor where the fights are about groups, positions and who to hit first; then sit in a quiet room with money on the table and decide whose it is. The boss is a man who uses the walls.
- Exploration 15% · dialogue 10% · investigation 20% · combat 50% · activities 5%.
- Target length: 22–25 minutes.

## Locations
| id | Name | Size | Layout | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `depot_riverlot` | River lot and rail spur | 1400 × 420 (boxcar roofs at y 230) | Bus stop under the Dock Road overpass → scrap piles → the rail spur with two boxcars (climbable) → chain-link fence with a **gap** behind a dead bush → the depot's back wall and the **container corner** (three stacked containers forming an L: the boss arena x 900–1350) | Scouting points (verb: Watch) on the boxcar roof. A child's bike frame rusting into the river mud. | Saturday: overcast daylight. Monday: floodlights over the wall, sleet, river lapping | Bus stop (map), fence gap → `depot_yard` (right end), container corner |
| `depot_yard` | Loading yard | 2000 × 420 (container tops at y 250 and 180) | Front gate with guard shack → truck bays (two box trucks, one backed in) → pallets and a burning barrel (crew warming hands) → forklift lane → **container stacks** (two high, then three: the air-dash teaching climb) → warehouse roll door | A whiteboard on the guard shack: "TUES — C.H.P. ENVELOPES — N.F. PICKUP 9 AM". A union sticker peeled half off a truck. | Floodlights on poles, the barrel's orange glow; truck engines idling, radios, sleet on metal | Gate (assault start), fence gap (left), warehouse |
| `depot_warehouse` | Warehouse floor | 1800 × 540 (floor y 480; catwalk y 260 the full width; ladders at x 300, 1100, 1650) | Roll door → shelving aisles of freight (crates of TVs, cartons stencilled "MACHINE PARTS") → forklift parked mid-floor → open floor (the fight space) → stairs up to the offices at the far right (top level) | Shelves have gaps where freight was moved fast. Pallets labelled with Calder addresses, one "N. COMM. COUNCIL — COMMUNITY ROOM CHAIRS (40)". | High sodium lamps, dark between aisles; forklift beeping, heaters roaring | Yard, offices (upper right) |
| `depot_offices` | Office corridor (upper floor) | 1200 × 360 | Stair landing → **dispatch room** (Roz; radio sets, a wall map of Calder with pins, window over the yard) → break room (coffee machine, TV with a ballgame, two thugs at a card table) → counting room (locked: Roz has the key) → Dutch's office (door ajar) → fire stairs down to the river lot | Wall map pins: Starlite Lanes, St. Agnes, Foundry Courts, Calder Civic. | Fluorescent; the ballgame; a radio crackling dispatches | Warehouse stairs, counting room, Dutch's office, fire stairs → `depot_riverlot` |
| `depot_counting` | Counting room | 640 × 360 | Door → **the table** under a green-shaded lamp → filing cabinet → cash-counting machine on a stand | On the table: banded stacks with slips "to A.C." ($600) and **one manila envelope** with a typed label (the payroll). Rubber bands in a coffee mug. | One lamp; the hum of the counting machine | Corridor |
| `depot_dutch_office` | Dutch's office | 640 × 360 | Door → desk (wedding photo, desk calendar) → floor safe under a rug → window over the river | Wedding photo inscribed "Moira — 4.11.62 — always". A bowling trophy from Starlite Lanes. A rosary on the desk lamp. | Desk lamp; the river through the glass | Corridor |
| `monarch_room5` | Monarch Hotel, Room 5 | 640 × 360 | Door → bed → radiator → window over Kessler → the **evidence wall** (cards pinned with tape) | First used this chapter (rent paid from the Cellar purses). The wall shows every evidence item as a paper card. | Neon from a bar sign outside, a radiator knock | Hall → street |

## NPCs present
| id | Where / idle | Key lines | Barks / reactions |
|---|---|---|---|
| `teddy` (if met) | Iron Pulse after hours, Saturday night, mitts on | "Don't stop at the end of the step. Let the step throw the punch." / "Where are you going with that? ...Don't tell me. Come back after." | — |
| `mari` (if Teddy not met) | Cellar warm-up corner | Same lesson in her words: "You stop after the step, you're a statue. Let the step throw it." | — |
| `roz` | Dispatch room, headset round her neck, cigarette | Patient: "Tuesday envelopes go to a woman from the Courts. Nell. She signs. Dutch drove the ambulance money himself in '94. He was proud of it, like it was a favour." / "Dutch never remembers numbers. Everything's his wife's birthday." Threatened: "Four-eleven-sixty-two! Four-eleven-sixty-two! Please." | Hides under the desk if a fight breaks out in the corridor |
| `eddie` | Forklift driver, yard and warehouse | "I just drive the forklift, man!" (flees; non-hostile) | — |
| `hooper` | Yard foreman, clipboard and whistle (`director`) | "Pick it up, pick it up! He's one guy!" | Whistle bursts make nearby enemies faster |
| `dutch` | Yard on Saturday (seen getting out of a black Lincoln); Monday in the container corner, waiting | "I don't chase. I wait for the wall." / "You got what you came for. Go home, kid." | During the fight: "Back up. Keep backing up." |

## Interactables
| id | Label | Examine | Unlocks |
|---|---|---|---|
| `o_watch_gate` | Watch (boxcar roof) | "Guard shack. One man, one baton. He walks the fence every forty minutes." | Journal note |
| `o_watch_window` | Watch | "Office window, second floor. A woman with a headset. She doesn't leave." | Journal note (Roz) |
| `o_watch_lincoln` | Watch | "Black Lincoln. Big man, pea coat. Everybody stops talking when he walks by." | Journal note (Dutch) |
| `o_watch_shift` | Watch | "Shift change at midnight. For five minutes the back fence is nobody's job." | Unlocks the fence-gap route (skips yard wave 1) |
| `o_whiteboard` | Whiteboard | "'TUES — C.H.P. ENVELOPES — N.F. PICKUP 9 AM.' C.H.P.?" | — |
| `o_pallet_chairs` | Pallet | "'N. COMM. COUNCIL — COMMUNITY ROOM CHAIRS (40).' Folding chairs. From a gangster's warehouse." | — |
| `o_wall_map` | Wall map (dispatch) | "Pins. Starlite Lanes. St. Agnes. Calder Civic. And one up north: Foundry Courts." | — |
| `o_cabinet_chp` | Filing cabinet "C.H.P." | Doc: disbursement ledger. Thought: "Roof repairs. Boiler parts. A community room. Nice front. Gangsters running a charity." | `ev_chp_disbursements` ★ |
| `o_payroll` | Manila envelope | Doc: the label (`ev_payroll_note`); then the choice | `ev_payroll_note` |
| `o_stacks` | Banded stacks | "Six hundred, banded. Slips say 'to A.C.' Whoever A.C. is, this is theirs." | choice |
| `o_wedding_photo` | Wedding photo | "'Moira — 4.11.62 — always.'" (the combination for the patient route) | — |
| `o_safe` | Floor safe | Combination input (three numbers). Opens: doc ledger. | `ev_depot_ledger_94` ★ |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q4_main` | main | "Watch the depot from the rail spur." → "Get ready. [Iron Pulse after ten / The Cellar's warm-up corner.]" → (time card) → "Get inside Harlan Freight." → "Cross the yard." → "Through the warehouse." → "Find the records." → "Open Dutch's safe." → "Get out by the river." → (boss) → "Foundry Courts. Northside." | Watch 2 of 4 points; dash-straight session; each area cleared; ledger + C.H.P. file taken; boss done | `skill dashStraight`, `skill airdash`; evidence; next destination |
| `q4_side_saturday` | side (only if `ch3_mo_deal == accepted`) | "Saturday at the Cellar. Mo's expecting you to go down in the second." | A short bout where the player must drop his guard and take a clean punch in round 2 (the HUD: "Go down in round two. Mo's watching."). The game won't do it for him. | +$150; `cellar_dives_taken` +1. Declining is simply not going. |
| `q4_side_deshawn` | side | "You still owe Deshawn a choice." (if `refused` and unpaid, and Jin now has $200) | Find him at the Cellar on Saturday | `ch3_deshawn_paid` |

## Scripted scenes, beat by beat
**S4.1 The card and the room.** Chapter card over Jin's handwriting in a notebook: "Six weeks since the bus. Legs feel like mine." Monarch Room 5 (first time): the evidence wall. Jin pins `ev_lenny_receipt`; thought: "Harlan Freight. Dock Road. Brannigan." The player can sleep (skips to Saturday afternoon) or go straight out.

**S4.2 Scouting (Saturday, daylight).** On the boxcar roof, `Watch` points (each one is a 4 s camera pan across the river lot to the depot at zoom 0.8, then back). No combat; the map is open. Thought after two: "Front gate's a fight. The fence at midnight isn't." The guard shack whiteboard is readable from the fence (zoom-in examine).

**S4.3 Preparation (Saturday night).** Teddy (if met) or Mari. Activity `train_mitts` variant: the partner backs away; the player dashes in and presses attack during the burst → **dash straight**. Teddy: "Don't stop at the end of the step. Let the step throw the punch." Three clean ones: toast "Dash straight". If Teddy: he notices Jin isn't asking for the bag, he's asking for a technique for tonight. "Where are you going with that? ...Don't tell me. Come back after." (`teddy` +1 if this is his first mitts session.)

**S4.4 Time card:** "Monday, January 27 · 11:40 pm". Sleet. Two routes, both legitimate: the front gate (full yard fight) or the fence gap at the shift change (skips yard wave 1, only if `o_watch_shift` was seen).

**S4.5 The yard → warehouse → offices.** See Encounters. At the container stacks, the first jump between a two-high and a three-high stack shows "Press DASH in the air" and unlocks **air dash** in motion.

**S4.6 Roz (dispatch room).** Roz is alone with the radios. She sees Jin's knuckles and stands up so fast her chair rolls into the wall.
- Roz: "I'm dispatch. I'm just dispatch. I put trucks on roads."
- Jin: "I need the counting room and Dutch's safe."
- Roz: "He'll know it was me. He'll *know*."
- **Choice `ch4_roz`:**
  - "[Let her go. Ask what she can tell you.]" → `let_go`. Roz gives the counting-room key off her ring and the routine (Tuesday envelopes, Nell, the ambulance money), adds "Dutch never remembers numbers. Everything's his wife's birthday," and leaves by the fire stairs with her coat over her head. The safe needs the wedding photo. (`ev_roz_account` full)
  - "[Threaten her. You don't have time.]" → `threatened`. Jin steps in; she backs into the radio desk. "Four-eleven-sixty-two! Four-eleven-sixty-two! Please." She throws the key ring at him and runs. Faster (no search), and she remembers his face. (`ev_roz_account` partial; `harm_count` +1)

**S4.7 The counting room (the quiet room; no enemies, no timer).** The door shuts behind Jin and the noise of the depot drops (`muffle 0.5` on ambience). Camera eases in to 1.25 on the table under the lamp.
- Jin opens the C.H.P. cabinet first: `ev_chp_disbursements`. Thought: "Roof repairs. Boiler parts. A community room. Nice front."
- The banded stacks: **choice `ch4_took_profit`**: "[Take the 'to A.C.' stacks. $600. Their profit.]" / "[Leave them.]"
- The envelope. The label is opened in the document viewer first, so the player has read every name before choosing:
  > C.H.P. MAINT. PAYROLL · WK OF 1/27/97 · $1,840
  > Kowalski 560 · Greer 480 · Reyes 400 · Lindqvist 200 · Pruitt (bldg capt.) 200
  > deliver Tue. w/ N. Faraday
- Jin's thought: "Eighteen-forty. A room for the rest of the winter. A real doctor for the ribs I don't have broken yet."
- **Choice `ch4_envelope`:**
  - "[Take the payroll envelope. $1,840. Five people's wages.]" → `taken`
  - "[Leave it.]" → `left`. Jin copies the label into his notebook (the evidence entry `ev_payroll_note` keeps the names either way).
- Neither choice changes anything else in this chapter. The camera holds on the table for two seconds after the choice, with the envelope there or gone.

**S4.8 Dutch's office.** The safe (combination from Roz or from the photo). `ev_depot_ledger_94`. The line "8/22 private ambulance, Calder Gen → St. Agnes, 2,500, per G.P." gets a slow typewriter and a heartbeat. Thought: "They paid for the ambulance. They paid for my bed. They paid for my new name." Then: "And they paid for a roof." The objective: "Get out by the river." Fire stairs to the river lot.

## Encounters
All encounters use `maxAttackers: 2` (3 for the warehouse with the director up), checkpoints at each area entrance, and the Ch4 tips. Knuckles on (`power 0.85`).

**E4.1 The yard** (arena x 300–1700).
- Wave 1 (front gate only): 3 `thug` + 1 `guard` (dock baton; the baton swing is a longer arc that can't be slipped, only backdashed). Tip at start: "Don't stand between two of them. Dash through one and turn." Teaches **repositioning through groups** and dashing through ordinary enemies during the dodge window.
- Wave 2: **Hooper** (`director`, stays back by the burning barrel, whistles: allies within 160 px attack 30% faster), 2 `thug`, 1 `collector`. Tip on spawn: "The one with the whistle makes them faster. Get to him first." Tip after the first multi-hit: "Hooks hit everyone in front of you." Teaches **recognising enemies who direct others** and **hooks for crowd control**.
- A retreat point: the container stack. Enemies climb slowly, one at a time. Tip if Jin's condition drops below 40%: "Too many? Get up the containers. They'll come one at a time." Teaches **choosing when to retreat**.
- Eddie the forklift driver flees; he's never hostile.

**E4.2 The warehouse** (arena x 600–1400, floor + catwalk).
- 2 `guard`, 2 `thug` on the floor; a second `director` on the catwalk shouting down. The director can only be reached by ladder (x 1100), and climbing it pulls one enemy at a time after Jin.
- Tip at the first moment two enemies wind up at once: "Dash, then ATTACK: dash straight knocks the first one back while the other one misses." Teaches **interrupting one attacker while avoiding another**.

**E4.3 The break room** (short): 2 `thug` get up from the card game. If Roz was let go and is gone, nobody hides under the desk; if the player threatened her, she's crying in the dispatch room as he passes, and neither man looks at her.

**E4.4 Boss: Dutch Brannigan** (`boss_collector`, container corner x 900–1350; checkpoint at the fire-stairs door).
- Dutch walks forward slowly while Jin backs up, cuts off the open side, and **grabs when Jin's back is within 40 px of a wall** (the grab is unslippable; the only answer is not to be there). He resists stagger (poise), cannot be launched, and never chases at a run: "I don't chase. I wait for the wall."
- **Phase 1:** alone. The lesson: circle out *before* the corner. Backdash + slip keep you in the middle; standing still loses.
- **Phase 2 (60% condition):** he whistles two `thug` out from the fire stairs; they cut off the far side. Jin must thin them without letting Dutch walk him in.
- **Phase 3 (30%):** the pea coat comes off; he's faster and throws a two-hit haymaker. Low crates near the containers let Jin jump and **air dash over** him to escape a corner (Dutch is a boss, so a ground dash can't pass through him; the game says so on the first attempt: "Can't get past a man that size. Go over.").
- Sleet turns to wet snow during phase 3.
- **After:** Dutch on one knee against a container. Questioning:
  - Dutch: "You got what you came for. Go home, kid."
  - Jin: "Who's A.C.?"
  - Dutch: "Somebody who don't come to Dock Road. I hand out envelopes. I don't write 'em."
  - If `ch4_envelope == taken`: Dutch (a short laugh): "You took the Courts' payroll? Huh. I'm a crook and I don't touch that one. Those people got kids."
  - **Choice `ch4_dutch_after`:** "[Walk away.]" → `walked_away`. Dutch, to Jin's back: "Moira's gonna ask about the face." / "[Keep going.]" → `kept_going`: Jin hits him again, twice. Hard cut to black on the second impact; the sleet sound continues. Dutch's hand (bandaged in Ch10) is the visible consequence. (`harm_count` +1)
- **Cracked rib:** whatever happened, Dutch's phase-3 haymaker cracked one. Toast: "Cracked rib: breath max −25 until it heals (rest, or Doc Ferris)."

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch4_roz` | let_go / threatened | Route to the safe; Roz's account | Ch8 copy holder only if `let_go` (she sends Jin a postcard c/o Teddy: "Quit. Moved to my sister's. If you need a dispatcher to say it out loud, I will."). Ending Two epilogue line. |
| `ch4_took_profit` | bool | +$600 | Ch9 Celeste: "You took six hundred dollars of ours, Mr. Seo. Consider it an advance." No harm to anyone innocent; not counted in `take_count`. |
| `ch4_envelope` | taken / left | +$1,840 or nothing | Ch5's whole texture: taken → the payroll never arrives Tuesday; Mara can't pay her crew; Darnell picks up extra rail-yard nights; the residents' meeting is about covering wages from the roof reserve; Ada's roof keeps leaking. Left → wages paid; the meeting is about roof vs boiler controls vs independence. Ch7 Darnell; Ch9 Penner ("Eighteen hundred and forty dollars of other people's wages. You understood the deal before we offered it."); Ch10 reflection. |
| `ch4_dutch_after` | walked_away / kept_going | Line or cut | Ch10: walked away → Dutch on the Alder Row crew steps aside: "I collect. I don't do this." Kept going → he fights in the final wave with a bandaged hand and a grudge. |

## Chapter ending and state handed on
- **Ending beat (no fight after the records):** Jin walks along the river under the overpass in wet snow, one hand on his ribs. He sits on a bench at the bus stop (`sitCurb`). Thought: "Courts Housing Partnership. Foundry Courts. Northside." If envelope taken, a second thought: "Eighteen-forty. Five names." The bus comes. In the window: Northside's dead foundry stacks across the river. Card: "Foundry Courts."
- Handed to Ch5: skills dash straight, air dash; cracked rib; money; evidence `ev_depot_ledger_94`, `ev_chp_disbursements`, `ev_payroll_note`, `ev_roz_account`; map node `n_courts` inked; `n_dockroad` closed from Ch6 ("HARLAN FREIGHT HAS MOVED").

---
# Chapter 5 — The Houses Still Standing

**Chapter card:** "The Houses Still Standing" · "Foundry Courts, Northside · February 3–7, 1997"

## Date, mood, palette, weather
- Monday, February 3 to Friday, February 7, 1997. Each day is a short **day block** (morning → work → evening), separated by a sleep (camera eases out over the Courts at night, lit windows turning off one by one, then a dawn card: "Tuesday").
- Mood: a break from violence that slowly becomes uncomfortable. Ordinary, warm, argumentative, alive.
- Palette: cream and red brick (cleaner than Eastgate), green-painted doors (several freshly painted), white snow kept shovelled into neat banks, laundry in faded primaries, amber kitchen windows at dusk; the dead foundry stacks are a flat gray silhouette behind everything.
- Weather: Monday bright and cold; Wednesday a hard freeze (the boiler night); Thursday thaw, dripping eaves; Friday light snow during the meeting.

## Gameplay identity
**Living somewhere for a week.** Carrying radiators, fixing a dryer vent, helping restart a boiler, holding mitts for a kid, training with a local boxer, listening to neighbours argue about money, being offered an apartment. No hostile combat at all. New techniques arrive through training, which here *is* play.
- Exploration 25% · dialogue 30% · investigation 5% · combat 0% (sparring is an activity) · activities 40%.
- Target length: 22–25 minutes (about 5 minutes per day block).

## Locations
| id | Name | Size | Layout | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `courts_yard` | Foundry Courts yard | 2600 × 480, exterior (fire escapes on B and C as one-way platforms at y 300/220/140; ladder to D's roof at x 2380) | Northside Ave bus stop (left) → **Building A** (lobby door; basement stair to the workshop) → **Building B** (Ada's stoop with her kitchen chair; fire escape; Ada's 3rd-floor window with a bucket visible inside) → the courtyard proper: laundry lines, a basketball hoop, snow-covered raised garden beds with hand-painted name stakes, a bench, a snowman with a Calder Ironmen cap → **Building C** (community room on the ground floor; boiler-room stair) → **Building D** (site office in the ground-floor unit; basement gym stair; roof ladder) | Freshly painted green doors on A and C, peeling on B and D (the paint budget ran out). A hand-lettered sign on a garden stake: "KEISHA'S TOMATOES — DO NOT STEP". Keisha's red sled. | Day: bright; dusk: kitchen windows; night: two streetlights and the lit windows. Kids, a radio from a window, a dog, Gus coughing, shovels | Bus stop (map), every building door |
| `courts_lobby_a` | Building A lobby | 640 × 360 | Door → mailboxes → **plaque** → bulletin board → stair down to workshop | Bulletin: "MEETING FRIDAY 7 PM — SHARED FUND: ROOF? PAYROLL? BOILER? — BRING YOUR OPINION, NOT YOUR TEMPER"; "LOST: red mitten (Andre)"; "RADIO REPAIR — GUS, 1C — FREE IF IT'S FROM BEFORE 1970". | Warm bulb | Yard, workshop |
| `courts_workshop` | Maintenance workshop | 960 × 360 | Stair → workbench and vise → tool wall with painted outlines for every tool → stacked cast-iron radiators → **the pay tin** (a blue Danish butter-cookie tin, masking tape "PAY") on the shelf above the bench → a cot behind the boiler-parts rack → a radio | A "DAYS SINCE ACCIDENT" board reading 47. A photo of a man in a leather apron at a cupola: "Tata, Calder Foundry, 1971". | Bench lamp, radio (Polish news, then a ballgame) | Lobby |
| `courts_boiler` | Building C boiler room | 800 × 360 | Stair → the boiler (old cast iron; three gauges; a sight glass) → pipe manifold → the pump → a workbench | A logbook on a nail: daily readings in Mara's block capitals. | Pilot glow, pipes ticking, the pump's whine (when running) | Yard |
| `courts_gym` | Basement gym (Building D) | 900 × 360 | Stair → speed bag → heavy bag wrapped in duct tape → a "ring" of floor tape → mirrors salvaged from a closed dance studio → the bench (Keisha, Andre) → Lucho's chalkboard | Chalkboard: kids' names with tally marks and "NO SCHOOL = NO GYM". A Golden Gloves 1986 photo of Lucho. | Fluorescent, a boombox (Lucho's merengue tape, low) | Yard |
| `courts_community_room` | Community room (Building C) | 1000 × 360 | Door → stacks of **folding chairs** stencilled "N. COMM. COUNCIL" → coffee urn → bake-sale table → front table and Nell's easel (the budget sheet) → hand-drawn map of A–D on the wall | Friday: chairs in rows (the player set them out on shift 4). | Fluorescent, coffee urn gurgle | Yard |
| `courts_site_office` | Site office (Building D, unit 1A) | 640 × 360 | Door → Nell's desk → **filing cabinet "C.H.P. — PURCHASE 1994"** → waitlist board → Council poster | Waitlist: "4D — VASQUEZ, E. (3 children) — APPROVED 1/30 — MOVE-IN 2/14". Poster: "NORTHSIDE COMMUNITY COUNCIL — 11 YEARS OF KNOCKING ON DOORS". | Desk lamp, space heater (unplugged, with a note in Mara's hand: "NOT IN MY BUILDINGS") | Yard |
| `courts_4d` | Unit 4D | 640 × 360 | Door → empty living room → a mattress Rook had brought in → window over the yard and the stacks | Fresh paint smell suggested by the walls' clean cream. On the windowsill: a crayon drawing taped by a previous child, "MY HOUSE". | Bare bulb, radiator hiss | Hall → yard |
| `courts_roof_d` | Roof of Building D | 960 × 360, exterior | Ladder → tar paper → water tank → parapet facing the yard and the stacks | — | Night: the yard's lit windows below, the stacks black against the river glow | Ladder |

## NPCs present
| id | Where / idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|
| `mara` | Workshop at the bench (`crouch` at a radiator), in the yard with a wrench | "You can carry? Good. Don't punch anything while you're carrying. Radiators don't forgive." / "I don't pay late people. I barely pay early ones." / on the St. Agnes file: see `ev_mara_foundry` | "Lift with the legs, boxer." | Envelope outcome; boiler choice; meeting stance; shifts |
| `ada` | Kitchen chair on B's stoop in a purple housecoat and a man's overcoat | "Forty-one years in 3B. My husband died in that bedroom. I wasn't leaving it for a parking garage." / Friday: "Walter got it done in three weeks. After eleven years of nothing. You understand what three weeks felt like?" | "Shut the door, you're heating the yard." | Meeting stance (roof); unit 4D |
| `darnell` | Yard in his orange rail-yard vest, going to or from a shift | Envelope taken: "Crew didn't get paid. Tuesday envelope 'didn't come.' So I'm on nights at the rail yard till it does." / left: "Wednesday, you held the flashlight for Mara. That was you? Thanks, man." | "Not now, man." | Envelope; boiler |
| `tasha` | With the kids, or at the meeting | "Darnell's not mad at you. He's scared. It comes out the same." | — | — |
| `keisha` | Bench in the gym; sled in the yard | "Is it true you were on TV?" / copies Jin's guard on the bench | "Watch me! Watch me!" | `ch5_trained_kids` |
| `andre` | Follows Keisha | "Did you find my mitten?" | — | Mitten found (side) |
| `gus` | Bench by the garden beds, coughing; or 1C with radios | "I poured iron forty years for a man who sold us to a bank. Then Walter bought us back. I'd still like to know with what." | "Bring me something with tubes." | Meeting stance (independence) |
| `lucho` | Gym, in mechanic's overalls rolled to the waist | "Half a second. Bang-bang-bang-bang. Then get out before he remembers he has hands." / "Short. From the knees. Then hit him again before he lands." | "Feet!" | Training sessions; kids |
| `nell` | Site office, cardigan, clipboard | "I just do the forms. I believed the forms." (said in Ch7; here she's busy and kind) / "Walter, 4D is the Vasquez family's." | "Sign-in sheet, please." | 4D; site office |
| `elena` | Site office (Tuesday), then the yard (Friday) | Tuesday: "Is 4D still the fourteenth? My lease ends the fifteenth." / Friday, if 4D taken: "They told me April now. April." | — | `ch5_took_unit_4d` |
| `rook` | Thursday: arrives in a brown Oldsmobile, sits on Ada's stoop, hand on shoulders | See S5.4 | "Ada, you look twenty years younger. Liar that I am." | 4D |

## Interactables
| id | Label | Examine | Unlocks |
|---|---|---|---|
| `o_plaque` | Plaque | Doc: the plaque. Thought: "September thirtieth, 1994. Forty-one days after the fight." | `ev_courts_plaque` ★ |
| `o_pay_tin` | Pay tin | Envelope taken: "Empty. A note inside in Mara's hand: 'IOU crew — wk of 1/27.'" Left: "Five small envelopes inside with names on them. Kowalski. Greer. Reyes. Lindqvist. Pruitt. The same five." | (choices if taken) |
| `o_tata_photo` | Photo | "Her father at the cupola. 1971." | — |
| `o_chairs` | Folding chairs (shift 4) | "'N. COMM. COUNCIL.' Forty of them. I saw these on a pallet at Dock Road." | Journal note linking `ev_chp_disbursements` |
| `o_space_heater` | Space heater (site office) | "'NOT IN MY BUILDINGS.' Mara's handwriting." (no further comment; Ch6 makes it land) | — |
| `o_waitlist` | Waitlist board | "4D. Vasquez, E. Three kids. Move-in the fourteenth." | — |
| `o_chp_cabinet` | C.H.P. purchase file (site office) | Only open on the Wednesday night if Jin abandons the repair; otherwise locked ("Nell's cabinet. Nell's key.") | `ev_chp_schedule` |
| `o_garden_stakes` | Name stakes | "Keisha's tomatoes. Gus's peppers. Ada's 'whatever comes up.'" | — |
| `o_mitten` | Red mitten (under the snowman) | "Andre's." | `q5_side_mitten` |
| `o_logbook` | Boiler logbook | "Mara writes the pressure down three times a day. Since 1994. Every day." | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q5_main` | main | Mon: "Look around Foundry Courts." → "Help the woman with the radiator." → Tue: "Mara's crew starts at eight." → Wed: "The boiler's out in C. Help Mara." → Thu: "Somebody's here to see you." → Fri: "The residents' meeting. Seven o'clock." → "Get some air." | Day triggers | Relationships, the purchase date, suspicion |
| `q5_work` | side (repeatable ×4) | "Mara's work board: [Radiators to B-3 / Dryer vent, laundry / Ada's ceiling / Chairs for Friday]." | Each shift's activity | $35 each; `mara` +1 (max +3), `courts` +1 (max +2) |
| `q5_lucho` | side (teaching) | "Lucho's gym, after six." | Session A (Tue): `skill uppercut`. Session B (Thu): `skill flurry`. Optional sparring (Fri afternoon) | `lucho` +1 each; training cap 3 from Wednesday |
| `q5_keisha` | side | "Keisha wants you to hold the mitts." | Mitts-holding rhythm activity (Jin calls the punch; Keisha throws; press the matching direction to catch it) | `ch5_trained_kids`; `lucho` +1 |
| `q5_side_mitten` | side | "Andre lost a mitten." | Find it under the snowman | Andre waves at Jin for the rest of the game |
| `q5_side_gus` | side | "Gus wants 'something with tubes.'" | Bring the dead tube radio from the community room's closet | Gus's story: the foundry's last heat, and his "Ask where it comes from" vote (he won't say which vote yet: "I voted no on something once. Didn't matter.") |
| `q5_side_mara_file` | side | "Show Mara the St. Agnes file." | Talk with `ev_current_file` | `ev_mara_foundry` |

## Scripted scenes, beat by beat
**S5.1 Monday: arriving at a front.** The bus drops Jin at Northside Ave. Thought: "A front. Gangster money in a housing project. Let's see the front." Camera: a slow pan right across the whole yard at zoom 0.8 (kids sledding, laundry, Ada waving someone off her stoop), then back to Jin. Free roam. Mara is wrestling a radiator onto a hand truck by Building A; she yells "You! You have arms?" Carry activity (`carry`, radiator; the rib makes it slower if untreated: "Rib. Lift with the legs."). Mara: "You can carry? Good. Don't punch anything while you're carrying. Radiators don't forgive." She offers temporary work, $35 a shift, cash on Fridays, and a cot behind the parts rack "if the hotel's far. Don't tell Nell." She walks him to the basement gym door: "Lucho runs a gym for the kids. Says you look like you used to box." Lucho, from inside: "Used to? He still walks like it."

**S5.2 Tuesday: the payroll.**
- If `ch4_envelope == left`: at noon, Nell arrives with the Tuesday envelope and signs Mara's book. Mara pays the crew from the pay tin, five small envelopes. Camera holds on the label in Mara's hand (zoom 1.5): **"C.H.P. MAINT. PAYROLL · WK OF 1/27/97 · $1,840"**, the same label Jin read at Dock Road. Thought: "Same envelope. I left it on a table and it came here." Darnell pockets his and goes home to sleep for the first time in two days.
- If `taken`: Nell arrives empty-handed. "Harlan Freight says there was 'an incident.' No envelope this week." Mara, very quiet: "Then I don't pay my crew this week." She writes "IOU crew — wk of 1/27" and puts it in the empty tin. Darnell, in the yard: "Crew didn't get paid. So I'm on nights at the rail yard till it does." Lucho cancels the kids' Tuesday class to take an extra shift at the bus garage. **Choice `ch5_envelope_outcome`** becomes available at the pay tin for the rest of the chapter: "[Tell Mara it was you. Give it back.]" → `confessed` / "[Put the money in the tin when no one's looking.]" → `returned_anon` / leave it → `kept` at chapter end. The amount returned is whatever Jin still has up to $1,840; if he spent some, the tin is short and Mara notices in Ch7.
  - Confessed: Mara counts it twice. Long silence. "...You stole it from the people who stole it. And it was ours." She pays the crew that night. "I'm not going to thank you for bringing back my own money." (`mara` +1 net; she trusts the honesty, not the act)
  - Returned anonymously: Mara finds it Wednesday morning, crosses out the IOU, and says to nobody: "Somebody's got a conscience. Late, but." (`mara` +0)
- Elena Vasquez at the site office asks about 4D's date.
- Evening: Lucho, session A (uppercut).

**S5.3 Wednesday: the boiler night (Q3).** Freeze. At 9 pm the Building C boiler trips. Kids in coats in the stairwell; Tasha carries Andre down to Ada's. Mara and Jin in the boiler room: a `repair` sequence (bleed the line, reset the low-water cutoff, relight the pilot) with a missing part: "Thermocouple. Workshop, second drawer, red box. Run." The route back from the workshop passes the site office: the door is open, Nell's gone home, and the C.H.P. purchase cabinet is unlocked, its drawer half out.
- **Choice `ch5_left_repair`:** "[Bring Mara the part.]" / "[Look in the site office. Mara can wait ten minutes.]"
  - Stay: Jin brings the part; the repair completes; the pump whines up, the pipes tick, the camera eases out to the yard and Building C's windows warm one by one. Darnell, on the stairs: "Thanks, man." (`mara` +2, `courts` +1)
  - Leave: Jin reads the file (`ev_chp_schedule`: "NCC capital contribution $640,000, received 9/27/94"). He gets back twenty minutes later; Mara has jury-rigged it and failed; the boiler stays down until morning. The Greer kids sleep at Ada's. Mara says only: "Red box. Second drawer." She doesn't look at him. (`mara` −2, `courts` −1)
- Either way, Jin's thought at night: "Six hundred and forty thousand [if he read it] / Forty-one days. Everybody here says 'Walter' like a prayer."

**S5.4 Thursday: Rook.** The brown Oldsmobile. Rook gets out with a box of doughnuts, sits on Ada's stoop, hand on her shoulder, then on Gus's. He sees Jin carrying chairs across the yard. He stops talking. The camera zooms slowly in on Rook (1.0 → 1.3) while the yard's noise drops a little.
- Rook: "Jin Seo." (a beat) "You're out of the hospital."
- Jin: "Do I know you?"
- Rook: "Walter Rook. Northside Community Council. Everybody in Calder knew your face once. I'm sorry for what happened to you. I mean that."
- Rook: "If you need work, a room, a doctor — I can make calls. That's all I'm good for anymore. Calls."
- Rook: "4D's empty. Paint's dry. It's yours tonight if you want it."
- Nell (from the office door): "Walter, 4D is the Vasquez family's. They were approved last Thursday."
- Rook: "The Vasquez family can have 4C in April when the Kowalczyks go to their daughter's. This man has nowhere."
- **Choice `ch5_took_unit_4d`:** "[Take 4D. It was promised to the Vasquez family.]" / "Give it to the Vasquezes." Both are stated plainly.
  - Take: Rook gives him the key with both hands. Nell crosses something out on her clipboard. (`courts` −1)
  - Decline: Rook: "Pride's expensive in February." He means it kindly.
- Jin: "You said 'out of the hospital.' Like you knew which one."
- Rook: "...Did I? Nell must have mentioned it." (Nell, puzzled, shakes her head behind him; Rook doesn't see it, the player does.) "Nell, is there coffee?" He leaves within the hour, waving from the Oldsmobile.
- Jin's thought: "He knew. He knew before I said a word."
- Evening: Lucho, session B (flurry). Keisha asks for the mitts (`q5_keisha`).

**S5.5 Friday: the meeting.** Shift 4 earlier in the day (chairs). At 7 pm, the community room. Nell at the easel: "Three thousand in the shared reserve. Three asks. Then we vote." The camera works like a play: static wide shot (0.9), each speaker standing up in turn, with a zoom to 1.15 on whoever has the floor.
- Ada: "Building B's ceiling has been crying since Christmas. I'm seventy-four, and I empty a bucket at three in the morning."
- Darnell (envelope taken): "My crew didn't get paid. You want the boiler fixed, pay the people who fix it." / (left): "Kids slept in coats Wednesday. C needs new controls before that boiler kills somebody."
- Gus: "Every dollar we get comes through the Council. Every dollar the Council gets comes from somewhere. I'd like to pay our own way, even if it's slower. I'd like to know where the roof money comes from."
- Mara: "I'll fix whatever you vote for. I'd like to be paid for it."
- Tasha: "Can we not do this like last time? Nobody throw a doughnut."
- **Choice `ch5_meeting_stance`** (Nell: "Mr. Seo? You've worked here all week. You can speak."): "The roof. Ada shouldn't be up at three." → `roof` / "Cover the payroll." (only if envelope taken) → `payroll` / "The boiler controls. Wednesday can't happen again." → `heater` / "Gus is right. Find out where the money comes from." → `independence` / "[Say nothing. It's their money.]" → `silent`. The room is evenly split; Jin's voice tips the vote (except `independence`, which loses 11–14; Gus: "Thanks for saying it out loud."). `silent`: the roof wins by two. Visible later: Ada's bucket gone (roof), the crew paid (payroll), C's new thermostat (heater), or Gus's motion in the minutes Jin reads in Ch7 (independence).
- **Donation** (`ch5_donation`): a coffee can goes round. Any amount; ≥ $50 → `courts` +1. Ada sees it either way and says nothing; she pats the seat next to her.
- After the vote, Ada, folding chairs: "Walter got it done in three weeks. After eleven years of nothing. September of '94. The bank was going to sell us to a parking company. You understand what three weeks felt like?"
- Jin's thought: "September of '94."

## Encounters
None hostile. Combat-adjacent activities only:
- Lucho session A (`train_mitts` variant): uppercut on rising mitts, then "hit him again before he lands" with a jab on the dropping mitt. Unlocks **uppercut**.
- Lucho session B: flurry on the speed bag, then on mitts, then "get out" (backdash within 0.3 s of the flurry's finish, or Lucho's mitt taps Jin's head). Unlocks **flurry**.
- Optional sparring (`sparring`, 2 rounds × 45 s, head-guards on, no damage carried over): Lucho fights like a short, fast boxer who mixes uppercuts in. Teaches using the uppercut as a launcher on a light opponent. Keisha and Andre cheer from the bench.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch5_envelope_outcome` | none / confessed / returned_anon / kept | Crew paid or not | Ch7 Mara: confessed: "You told me. That's the only reason I'm still talking to you." / kept: she found the IOU still in the tin: `mara` −1. `take_count` includes `kept`. |
| `ch5_left_repair` | bool | Boiler, `mara`, `courts`; `ev_chp_schedule` early | Ch7: if not read here, Nell hands Jin the schedule herself ("I believed the forms."). Ch9 night Mara: "You went in Nell's office while I was on my knees in front of a boiler. I remember." |
| `ch5_meeting_stance` | roof / payroll / heater / independence / silent | Vote result; props | Ch7 reactions (Gus remembers who backed him; Ada remembers the roof); Ch9 night lines. |
| `ch5_donation` | $ | `courts` +1 if ≥ $50 | Ada's line in Ch7: "You put money in the can. I saw." |
| `ch5_took_unit_4d` | bool | Rest point in 4D for Ch6; `courts` −1 | Ch6: Elena and her three kids in Ada's front room "until April"; Ch7 Rook: "I gave you 4D. I took it from a woman with three children and gave it to you, and you took it. We're the same animal, Jin." Nell's look. Ch9 Penner. Ch10 reflection. `take_count`. |
| `ch5_trained_kids` | bool | Keisha copies Jin's guard | Ending Two: the teaching vignette shows Keisha in the front row. |

## Chapter ending and state handed on
- **Ending beat:** Friday, 10 pm, the roof of Building D. Snow. Mara comes up the ladder with two bottles of beer (if `mara ≥ 2`; otherwise Jin is alone). Mara: "You're good with your hands, for a boxer." Jin: "I'm good with my hands for a lot of things." Mara: "Stay a while. Courts could use a guy who carries." She leaves him there. Camera eases out to 0.75: the lit windows of four buildings, the dead stacks behind. Thought: "Bought forty-one days after I went down. I can't prove it. I don't want it to be true." (He suspects; he has no evidence that establishes it.) Card: "March. Garrison Street."
- Handed to Ch6: skills complete (uppercut, flurry); training cap 3; rest point (4D, Mara's cot if `mara ≥ 2`, or the Monarch); relationships `mara`, `courts`, `lucho`; Foundry Courts node stays open and changes with every later chapter.

---
# Chapter 6 — Undelivered

**Chapter card:** "Undelivered" · "Garrison Street · City Hall Annex · 88 Market Street · March 3–8, 1997"

## Date, mood, palette, weather
- Monday, March 3 to Saturday, March 8, 1997. The week is split into **half-days** shown on the journal page header ("Tue · afternoon"). Each lead costs one half-day; sleeping at the rest point moves to the next morning. Nothing expires: the half-days only give the week a shape and let the city change its light.
- Mood: patient and documentary at first, then grief, then something colder and more exact. The anger of Chapter 2 becomes a list of names, dates and one signature.
- Palette: the Annex in institutional green walls, beige counters and frosted glass with gold-leaf window numbers; Garrison Street in sooty brick, the Lindell House ruin black and charred behind white plastic sheeting that flaps; Garrison Suds warm yellow behind steamed windows; Market Street blue-gray with the pink neon tooth of Brandt Dental; the cemetery the only open sky in the chapter, pale and cold.
- Weather: thaw. Monday rain; Wednesday river fog that swallows the top floors; Friday clear and hard; Saturday morning bright, frost on the grass in Section 14.

## Gameplay identity
**Walking Min's route two years late.** The player reads, compares, queues, listens and sorts. Three leads are open at once and can be done in any order (MapleStory-style hub investigation), and two short confrontations both have a way out that isn't a fight. The chapter's main activity is the **timeline board**, built in two passes, which will not let the player blame a single thing.
- Exploration 25% · dialogue 25% · investigation 35% · combat 8% · activities 7% (folding sheets, the window run-around, the board).
- Target length: 22–25 minutes. No new combat skills: the toolkit is complete (PDF: "By now, the player can have the full core combat toolkit").

**Rest point this chapter** (where the evidence wall and sleep live): unit 4D if `ch5_took_unit_4d` and not given back; otherwise Mara's cot behind the parts rack if `rel.mara ≥ 2`; otherwise Monarch Room 5 (if rent paid) or Harbor Light. The wall is the same object in all four, so the board works everywhere.

## Locations
| id | Name | Size | Layout (left → right; layers) | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `annex_hall` | City Hall Annex, ground floor | 1600 × 360 | Revolving door → security desk (guard Ruben with a newspaper) → bench rows (a woman with a stroller, an old man with a folder of carbons) → red take-a-number dispenser ("NOW SERVING 41") → **Window 2** Housing Court Records → **Window 3** Housing Authority → **Window 5** Building Department → **Window 7** Mail Return / Unclaimed → elevator (basement) | A sign over every window: "ALL REQUESTS IN WRITING — FORM 7B". A wall clock four minutes slow. A poster: "CALDER WORKS WHEN YOU DO". Scuffs on the floor in front of each window where people have stood for years. | Fluorescent, green walls; the number dispenser's ding, two typewriters, rain on the high windows | Market Street (bus stop), elevator → `annex_property_room` |
| `annex_property_room` | County property room (basement) | 900 × 360 | Elevator → wire-cage counter (Mr. Dukes) → shelving aisles of cardboard boxes labelled by surname and date → a reading table under one hanging lamp → floor drain, mop bucket | Box labels in marker: "ALVAREZ — 11/95", "SEO — LINDELL — 2/96", "UNKNOWN MALE — RIVER — 1/96". A clipboard on the cage: "UNCLAIMED PROPERTY HELD 24 MONTHS, THEN DISPOSED". The Seo box is tagged "DISPOSE AFTER 3/15/97". (A fact, not a timer. It tells the player how close it came.) | One lamp over the table, the rest in shadow; a pipe dripping; the elevator's hum | Elevator |
| `garrison_st` | Garrison Street | 1800 × 420, exterior | Route 14 bus stop → Duffy's Pawn (grate down) → **Garrison Suds** (lit, steamed windows) → vacant lot with a burnt mattress → **Lindell House** behind a chain-link fence and flapping plastic → a telephone pole with **Min's flyer**, weathered, still stapled → Garrison Realty office (shuttered; a new sign: "FOR SALE — DEVELOPMENT OPPORTUNITY — GARRISON REALTY") → the street's end at the rail cut | Min's flyer: "HAVE YOU SEEN JIN SEO? Boxer, 26. Last seen Calder Civic Arena 8/20/94. Call Min 555-0193 / Lindell House Rm 9" with the passport photo from the poster. Three layers of staples: she came back to re-staple it. Someone has left a plastic rose in the fence (Mrs. Okafor's church). | Rain Monday, fog Wednesday; sodium lamps; plastic sheeting flapping; a freight train in the rail cut every few minutes | Bus stop (map), Suds door, the fence gap → `lindell_ruin` |
| `lindell_ruin` | Lindell House (burnt) | 1000 × 600 (three floors; vertical) | **Ground (y 540):** front hall, collapsed stair (impassable) → rear hall → the **rear exit**: a steel door, a length of chain still looped through the push bar, the padlock melted into a lump. **Exterior fire escape (right side):** ladder, then a gap where the 2nd-floor landing fell (jump + **air dash** across). **2nd floor (y 360):** the copper strippers working on the wiring; Room 4. **3rd floor (y 180):** a hall with a scorched ceiling and an **empty smoke-detector bracket**, **Room 6** (the shell of a space heater, the floor burned through around it), **Room 9** (Min and Umma's: two iron bedframes, a scorched wall calendar, the window Min photographed the back door from). | The calendar's February 1996 page survived in one corner: "Sat 2/10 — Mrs. O bday — CAKE" circled. The rest is ash. Snow blows in through the roof onto Room 9's floor. | Gray daylight through holes; drips; wind; the strippers' radio (a ballgame) | Fence gap → `garrison_st` |
| `garrison_suds` | Garrison Suds laundromat | 900 × 360 | Door with a bell → a row of washers → dryers → **the folding table** (Wendell Asher) → change machine → back-room door | A coffee can with tape on the counter: "LINDELL HOUSE FIRE — FAMILIES FUND — THANK YOU", from 1996, dusty, two quarters in it. A bulletin board of handwritten room ads. A sign: "NO DYEING. NO SLEEPING. NO KIDDING. — MGMT". | Warm yellow, steam; the dryers' tumble and the buzzer when one finishes | Street |
| `market_st` | Market Street, downtown | 1400 × 360, exterior | Route 9 bus stop → **Kwik Copy** (red sign; wedding invitations in the window) → a newsstand (Calder Ledger, Ring Magazine with Ray Castell on the cover: "THE PROMISE KEPT") → **88 Market St**: Brandt Dental on the ground floor (pink neon tooth), a street door with a directory: "2F — CALDER FOUNDRY RELIEF FUND — G. PIKE" → First Calder Savings → an alley with a dumpster | The newsstand guy reads the Ring cover aloud to nobody: "Castell, May seventeenth. Who's he even fighting?" | Blue dusk, neon pink, office windows going dark | Bus stop, Kwik Copy, 88 Market (stair door), alley |
| `fund_stair` | 88 Market St, stairwell | 360 × 540 (vertical) | Street door → narrow stair with a landing at y 360 → 2F door with gold letters "CALDER FOUNDRY RELIEF FUND" | A rubber plant dying on the landing. The dentist's drill audible through the wall. | One bulb, the neon tooth through a frosted window | Street, `fund_office` |
| `fund_office` | Calder Foundry Relief Fund | 960 × 360 | Reception (empty desk; a calendar from 1995 still on January) → **Pike's office** (desk, **locked right-hand drawer**, a filing cabinet, a **shredder** running, a window on the neon tooth) → **storage room** door (locked; Pike's key) | A framed photo of the foundry's last shift, 1993, with the Fund's logo printed on the mat: a charity built on a picture of men it never paid. A wastebasket of shredded paper strips (half of the "AHN, D." file). | Desk lamp, shredder whine, a radiator | Stair, storage |
| `fund_storage` | Storage room | 640 × 360 | Door → steel shelving → **a mail tray labelled "1180 — RECEIVED — HOLD"** → a stool | Other trays: "1180 — FORWARD W.R.", "1180 — DISCARD". The HOLD tray holds only nine envelopes. | Bare bulb | Office |
| `kwik_copy` | Kwik Copy, Market Street | 800 × 360 | Counter with a bell → two big copiers → a curtain to the one-hour photo lab → break corner with staff cubbies | One cubby still has a name tag taped to it: "MIN". Dot never took it down. A photo strip pinned above the counter: Dot and Min pulling faces, 1993. | Fluorescent; copier rhythm; the lab fan | Street |
| `cemetery_s14` | Calder Municipal Cemetery, Section 14 | 1400 × 420, exterior | Gate (a flower cart, $5 bunches) → gravel path between old family plots → **Section 14**: flat county markers in rows, numbers only → **96-031 and 96-032**, side by side, a small wooden cross between them painted white → a bench → a view down the hill to the river, the foundry stacks and the downtown towers (Ashgrove Tower the tallest, lit at the top even in daylight) | The cross reads in hand-painted letters: "MI-OK & MIN-JI SEO — ST. COLUMBA'S REMEMBERS". Someone has kept the grass around it clipped. | Clear cold light, a high wind, crows, distant traffic | Gate (map) |

Existing locations used: `sunnys` (the booth by the window), `okafor_3a` (side), `stagnes_dayroom` (side), `courts_yard` and Ada's front room (side), `iron_pulse`, `courts_gym`, `cellar` (training and dives).

## NPCs present
| id | Where / idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|
| `dukes` | **Leon Dukes**, 63, property clerk: 44 px, gray cardigan, sleeve garters, a pencil behind each ear; behind the cage, `writeDesk` | "Seo. Seo... Two boxes came in, one was water damage. This is the one that's left. You're cutting it close, son — fifteenth they go to the incinerator." / on ID: "I need something that says Seo with your face on it." | "Number, please." | ID route (see S6.2) |
| `hale` | **Bernice Hale**, 58, Window 5 clerk: 42 px, cat-eye glasses on a chain, purple cardigan, a radio earpiece for the ballgame | "Seo. The girl with the camera. Every two weeks. She brought her own carbon paper because ours ran out." / "I'm not sending you round the windows. She went round them enough for both of you." | "Five! Number forty-four!" | The run-around; she ends it |
| `asher` | **Wendell Asher** (cast), Garrison Suds, folding sheets that never end | Patient: "I had the key. On my ring. The whole time. Fire was on three, I was asleep on one. I got four people out the front. I never thought of the back." Threatened: "The door was chained. Owner's orders. That's all I know." | "Dryer six sticks. Kick it low." | `ch6_asher_method` |
| `fitz` + 2 | **Fitz Mahoney** and two cousins, copper strippers on Lindell's 2nd floor: `thug` looks, hard hats, a shopping cart of wire outside | "Building's condemned, pal. Finders keepers." / talked down: "...Your people? Jesus. Okay. Okay, we're gone. Take whatever you want, we didn't touch three." | "Watch the floor, it's soft." | `ch6_strippers` |
| `dot` | Kwik Copy counter, red polo, toner on her sleeves | "You're Min's brother. You're Min's brother who's *alive*." (a long beat) "She worked Saturdays so your mom didn't have to fold sheets on Saturdays. You know that?" / on the film: "One hour. Sit. I'm not letting you walk around with Min's roll undeveloped." | "Copies are seven cents. For you, they're seven cents." | Returns in Ch8 (copy run) |
| `pike` | Fund office, feeding the shredder in shirtsleeves, his raincoat on the chair | See S6.6 | — | `ch1_pike_stance` (his file on Jin), `ch2_collector_after` (who guards him) |
| `benny` / `carl` | `fund_stair` landing | Benny (if `let_go`): "You let me walk. I'm walking." (steps down past Jin and out into the street) / Carl: "Pike pays me to stand here. So I'm standing here." | — | `ch2_collector_after` |
| `hana` | Sunny's booth by the window, Friday evening, off duty (navy peacoat, gray scarf), a manila envelope on the table | See S6.8 | — | `ch1_records_route`, `ch1_told_hana_boxing`, `ch1_fare_source`, `rel.hana` |
| `augie` | Sunny's grill | "Booth by the window's yours. Nobody sits there Fridays anyway." | "Pie's cherry or nothing." | — |
| `okafor` | 3A (side) | "She made the cake herself. Three layers, it leaned like the Tower of Pisa. We ate the whole thing." | — | `ch6_okafor_photo` |
| `elena` | Ada's front room in Building B (side, only if `ch5_took_unit_4d`), three kids asleep on Ada's sofa | "You're the boxer in 4D? ...It's nice, 4D. The light's good in the morning." (no blame; that's what makes it land) | — | `ch6_gave_back_4d` |
| `bell` | St. Agnes day room (side) | "Did you find your people, son?" | — | — |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `o_min_flyer` | Flyer on the pole | Photo viewer: the flyer. Thought: "Three layers of staples. She kept coming back to put it up again." | — |
| `o_rear_door` | Rear exit | "A chain through the push bar. The padlock melted shut. Somebody had to put this here. Somebody had to lock it every night." | Board card (with `ev_building_complaints`) |
| `o_detector_bracket` | Bracket (3rd floor hall) | "A smoke-detector bracket. No smoke detector." | Board card |
| `o_heater_shell` | Space heater (Room 6) | "Room six. This is where it started. Somebody was cold." (no blame placed on the resident) | — |
| `o_room9_calendar` | Calendar scrap (Room 9) | "'Sat 2/10 — Mrs. O bday — CAKE.' The day before." | — |
| `o_room9_window` | Window | "From here you can see the back door. She stood here with the camera." (only after `ev_film_roll`: "This is where she took it.") | — |
| `o_fund_can` | Coffee can (Suds) | "'Lindell House fire — families fund.' Two quarters." Option: drop $5 (no flag; Asher sees it: "...Thanks.") | — |
| `o_box_seo` | Box "SEO — LINDELL — 2/96" | Opens the **box viewer** (items one at a time, see S6.3) | `ev_min_notebook` ★, `ev_calloway_invoice`, `ev_umma_timecards`, `ev_umma_note`, `ev_shopping_list`, `ev_robe`, camera (→ `ev_film_roll`), `mem_robe` |
| `o_win2` | Window 2 | Housing Court records (after the run-around) | `ev_housing_court` |
| `o_win3` | Window 3 | Housing Authority archive | `ev_ha_application` |
| `o_win5` | Window 5 | Building Department file | `ev_building_complaints` ★ |
| `o_win7` | Window 7 bin | If not `ch2_took_mailbox`: "Return-to-sender bin. 'SEO' in the S drawer." | `ev_returned_letter` |
| `o_tray_hold` | Tray "1180 — RECEIVED — HOLD" | "Nine envelopes. Min's handwriting. Every one stamped received. Not one opened." | `ev_min_letters` ★ |
| `o_tray_forward` | Tray "1180 — FORWARD W.R." | "Empty. Whatever went to W.R. went." | — |
| `o_pike_drawer` | Locked drawer | Locked until Pike opens it ("Pike's key. Pike's drawer.") | `ev_pike_memo` ★, `ev_rook_maintain` ★ |
| `o_shredder_basket` | Wastebasket | "Shredded strips. I can read 'AHN, D.' on four of them." | — |
| `o_foundry_photo` | Framed photo (Fund office) | "The foundry's last shift. A charity printed its name on a picture of men it never paid." | — |
| `o_min_cubby` | Cubby "MIN" (Kwik Copy) | "Dot never took her name down." | — |
| `o_markers` | Markers 96-031, 96-032 | "Numbers. The county gave them numbers." With flowers: "Yellow ones. Umma liked yellow. She said they were loud." | `ch6_flowers` |
| `o_cross` | Wooden cross | "'Mi-ok & Min-ji Seo — St. Columba's remembers.' Mrs. Okafor's church." | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q6_main` | main | "Find out how they lived. Not only how they died." → (three leads, shown together) "The Annex: ask under Seo." · "Lindell House, Garrison Street." · "Pick up Min's film at Kwik Copy." (appears after the box) → "Put it in order." (board, pass 1) → "P.O. Box 1180. 88 Market Street." → "Read them." → "Sunny's. Hana's waiting." → "Put it in order." (pass 2) → "Section 14." | Each lead's ★ items; both board passes; the Fund discovery; Sunny's; the cemetery | Evidence; the chapter's turn |
| `q6_side_okafor` | side | "Bring Mrs. Okafor the cake picture." | Dot prints a second copy of frame 2; give it at 3A | `ch6_okafor_photo`; her framed copy appears in later chapters |
| `q6_side_bell` | side | "Mr. Bell asked about your people." | Visit the St. Agnes day room | Bell's line; the empty name-card slot on 214-B |
| `q6_side_hana_repay` | side (only if `ch1_fare_source == hana_loan`) | "You owe Hana ten dollars." | Give $10 at Sunny's | `ch6_hana_repaid`, `hana` +1 |
| `q6_side_4d` | side (only if `ch5_took_unit_4d`) | (no objective shown; Elena's presence in Ada's window is the prompt) | Talk to Elena; choose | `ch6_gave_back_4d` |
| `q6_side_saturday` | side (if `ch3_mo_deal == accepted` and dives < 2) | "Saturday at the Cellar." | Same as Ch4 | +$150, `cellar_dives_taken` +1 |

## Scripted scenes, beat by beat
**S6.1 Monday: the wall.** Chapter card over Jin's notebook: "March. Okafor said: ask under Seo." Rest point, morning. Jin pins `ev_okafor_account` on the evidence wall; the camera eases in to 1.3 on the card and holds. Thought: "I know how they died. I don't know how they lived the last year and a half." The three leads appear together in the HUD (a small stacked list; the minimap shows three markers on the world map: Downtown, Garrison Street, and a pencil "?" over Market Street that stays pencil until the box gives the address).

**S6.2 The Annex (lead A).**
- **ID at the cage.** Mr. Dukes needs "something that says Seo with your face on it." Jin takes out the Athletic Commission license from the property bag (`ev_property_tag`; it was found with the ★ transfer form, so the player always has it). The card has the passport photo. Dukes looks at the photo, at Jin, at the photo: "You look like you're being arrested for tax fraud." Jin stops. (Min's line, from Ch0, out of a stranger's mouth.) Thought: "That's what she said." Dukes, not knowing why the man in front of him has gone quiet: "...It's a compliment. Most people look dead in these." He brings out the box.
- (Fallback if the player somehow lacks the card: Dukes phones Mrs. Okafor, whose number is on the claimant sheet; she vouches; the line about the photo is said by Okafor down the phone instead.)
- **S6.3 The box (sit at the reading table; no enemies, no timer).** The box viewer shows one item at a time with a soft lift sound. Order is fixed so the mundane comes before the pleading:
  1. `ev_shopping_list` (Min's handwriting): "rice 20 lb · gochugaru · lightbulbs (hall!) · Tri-X film x2 · card for Mrs. O's birthday · ask Dot re: Sat shift". Thought: "Lightbulbs, hall, exclamation mark. The hall was dark."
  2. Min's Pentax K1000, film still in it, counter at 8. Thought: "Eight frames. She never finished the roll." → new lead: "Pick up Min's film at Kwik Copy."
  3. `ev_umma_note` (inside Jin's own gym bag, returned to the family by the Civic Arena lost and found): the Sunny's napkin: "Jin-ah. After, Sunny's, the booth by the window. Min is paying (she says). Don't shower too long. — Umma". The camera does not move. Thought: "I never got there."
  4. `ev_robe`: the navy robe, the E of EASTGATE half re-stitched, the needle still in it. Holding E on it plays **`mem_robe`** (memory filter): Umma at the kitchen table at night, counting stitches in Korean under her breath, Min asleep behind the curtain. Thought after: "She was fixing it. For when I came back."
  5. `ev_umma_timecards` (Royal Linen Service): sixty-two-hour weeks; margin notes "Sat. — extra 4 hrs. For Min's books." / "Sun. off. Church, then Box 1180 letter w/ Min."
  6. `ev_calloway_invoice`: "$350. Subject not located under given name."
  7. `ev_min_notebook` ★: two years of calls and fares. The viewer opens on the page that matters: "Calder Gen records — 'transferred, sponsor confidential' — they said write to the sponsor: P.O. Box 1180" and, below, a column: "Box 1180 — letter #1 ✓ #2 ✓ ... #9 ✓ — no answer". Thought: "Box 1180. Pike's card says Box 1180." The pencil "?" over Market Street is inked.
  - After the last item, the player can sit at the table as long as they like (camera eases out to 0.85; the drip; the elevator hum). The objective only reappears when Jin stands.
- **S6.4 The windows (activity: the run-around).** The player wants the court, housing and building records. Each window has its own number queue; the dispenser dings. Window 3 needs Form 7B stamped at Window 2; Window 2 stamps only Housing Court requests and sends Jin back to 3 with "claimant ID for the household member"; Window 3 says the application is filed under the head of household and needs "proof of the claimant's relationship"... A small counter in the corner of the HUD counts **"Trips: 1 … 2 … 3"**. Thought on trip 2: "She did this. In block capitals. Twice a week." On trip 3, Bernice Hale at Window 5 looks up at the name on his form, takes off her glasses, and leaves her window (the queue groans). She walks the papers to Windows 2 and 3 herself. "I'm not sending you round the windows. She went round them enough for both of you." She hands him three folders: `ev_housing_court` (with Umma's handwritten note on the back about the purse held "until the fighter signs for it"), `ev_ha_application` (seven months, three resubmissions, "pending — incomplete: whereabouts of household member SEO JIN"), and `ev_building_complaints` ★ (three complaints; the second is a petition whose first signature is "Seo Min-ji, Rm 9"). Hale: "The inspector rescheduled twice. I typed both reschedules. I'm sorry. I typed them." (Most staff are ordinary people: she is one of them.)
  - If `ch2_took_mailbox` is false, Window 7's bin has `ev_returned_letter`. Hale points at it on the way back.

**S6.5 Garrison Street (lead B).** Arrival by Route 14 in rain (or fog on Wednesday). The flyer on the pole is the first interactable in the player's path.
- **Garrison Suds: Wendell Asher (Q2: threaten a frightened witness to save time?).** Asher folds sheets at the long table. He knows who Jin is from the flyer; he's looked at it every day for a year.
  - Asher: "You're the brother. From the poster." He keeps folding. "I was night man at Lindell. I'm not anymore."
  - Jin: "Who chained the back door?"
  - Asher's hands stop. "...I've got forty sheets for the Holiday Inn by four."
  - **Choice `ch6_asher_method`:**
    - "[Help him fold. Let him talk while he works.]" → `patient`. Activity: **folding** (12 sheets; a two-button rhythm: grab corners when the sheet billows, fold when it falls; mistakes cost nothing but time). Umma folded hotel sheets at Royal Linen; the player does it beside a stranger while he tells it. Between sheets, Asher's account comes out in pieces: the owner, Dimitri Lazarou of Garrison Realty, told him to chain the rear door at night "against squatters"; Min asked him twice to unlock it ("She said 'Mr. Asher, if there's a fire, we're on three.' I said 'Talk to Mr. Lazarou.' She did. She wrote letters. She was good at letters."). On the last sheet he takes a folded note out of his wallet and puts it on the stack: **"Chain rear door nights. Squatters. — D.L."** "I kept it. In case. In case of what, I don't know. In case somebody ever asked me." Then the line that matters: "I had the key. On my ring. The whole time. Fire was on three, I was asleep on one. I got four people out the front. I never thought of the back." He asks nothing of Jin. `ev_asher_testimony` (full, with the owner's note); Asher becomes a possible copy holder and witness.
    - "[Grab the sheet out of his hands. You don't have all day.]" → `threatened`. Jin pulls the sheet away; Asher flinches into the dryers (`cower`). "The door was chained. Owner's orders. That's all I know." He goes out the back door and doesn't come back. `ev_asher_testimony` (partial: no note, no name beyond "owner"). `harm_count` +1. Faster: about 90 seconds instead of four minutes.
  - Neither option is hidden or misrepresented; the brackets say what Jin does.
- **Lindell House.** Through the fence gap. Ground floor: the rear exit and its chain (`o_rear_door`). The collapsed stair means the only way up is the exterior fire escape: a short climbing section (one-way platforms, then the fallen landing: jump and **air dash** across; a tip appears only if the player fails twice: "Jump, then DASH in the air."). This is traversal, not combat, and uses the full toolkit gently.
- **2nd floor: the copper strippers (short confrontation, `ch6_strippers`).** Fitz and his cousins are pulling wire from the walls into a duffel. Fitz: "Building's condemned, pal. Finders keepers."
  - "My mother and sister lived on three." → `talked_down`. Fitz takes off his hard hat. "...Your people? Jesus. Okay. Okay, we're gone. Take whatever you want, we didn't touch three." They leave with the duffel half full.
  - "Get out." → Fitz: "Or what?" → `fought`. 3 `thug` on a floor with **soft spots** (marked by darker, sagging boards; anyone standing on one for more than 1 s drops a few pixels and is stunned; that includes Jin). A 30-second fight; it teaches nothing new and is not meant to. They flee down the fire escape.
- **3rd floor.** The hall: the empty detector bracket. Room 6: the heater shell (the text does not blame the resident: "Somebody was cold."). **Room 9**: the two bedframes, the calendar scrap ("Sat 2/10 — Mrs. O bday — CAKE"), the window over the back door. A sit glint on the windowsill. If Jin sits: camera eases out to 0.8 showing all three floors in section, snow falling through the roof into Room 9; Jin's thoughts, one by one: "She stood here." / "The cake was the day before." / "I was on Hillcrest. Thirty-seven ceiling tiles." No music; wind.

**S6.6 Kwik Copy (lead C, after the box).** Dot sees the Pentax before she sees Jin. Then she sees Jin. "You're Min's brother. You're Min's brother who's *alive*." She doesn't hug him; she takes the camera very carefully, like it's hot. "One hour. Sit." The player can wait (sit, time passes) or go do another lead and come back. The **photo viewer** opens on `ev_film_roll`, eight frames, and the player steps through them with Dot's commentary:
1. Umma asleep on the Route 9 bus, her head on the window. Dot: "Your mom slept on every bus in Calder."
2. Mrs. Okafor's birthday cake, three layers, leaning. Dot: "Min made that. It leaned like the Tower of Pisa." (→ `q6_side_okafor`: Dot prints a second copy unasked.)
3. **The chained rear door of Lindell House**, date-stamped 01/28/96 in orange. Dot goes quiet. "She said she was taking it to Channel 8 if they didn't fix it."
4. Umma laughing at Sunny's, in the booth by the window, a fork in the air.
5. Min's reflection in a shop window, holding a stack of "HAVE YOU SEEN JIN SEO?" flyers, sticking her tongue out at the camera.
6–8. Snow on Garrison Street, three nearly identical frames. Dot: "She always shot three of everything. In case."
- Dot: "She worked Saturdays so your mom didn't have to fold sheets on Saturdays. You know that?" If `ch0_purse_dream == umma_saturdays`: Jin: "That was supposed to be my job." Dot: "Yeah. She said."

**S6.7 Board, pass 1 (at the rest point, after leads A and B).** The **timeline board** (activity) opens on the evidence wall. Four horizontal lanes, labelled in Jin's handwriting, matching the PDF's four failures:
- **"The search cost them"** (`ev_min_notebook`, `ev_calloway_invoice`, `ev_umma_timecards`, the flyer)
- **"Help was delayed or sent elsewhere"** (`ev_housing_court`, `ev_ha_application`, `ev_returned_letter`)
- **"The building was known"** (`ev_building_complaints`, `ev_film_roll` frame 3, `ev_asher_testimony`)
- **"Someone kept me hidden"** (`ev_transfer_form`, `ev_current_file`, … and a blank card that reads only "Box 1180 — 9 letters — ?")
The player drags cards to dates along the top (Aug 1994 → Feb 1996). A wrong placement just slides back with Jin's thought ("No. That was after the court date."); there's no failure. When the first three lanes are full, the fourth lane's gap glows: Jin's thought: "Nine letters to one box. Somebody opened that box every week." Objective: "P.O. Box 1180. 88 Market Street."

**S6.8 88 Market Street (the confrontation, and the discovery).**
- **The stair (short confrontation).** On the landing:
  - If `ch2_collector_after == let_go`: Benny is there with Carl. Benny looks at Jin, at the knuckles, and says "You let me walk. I'm walking." He goes down past Jin and out into the street. Carl, alone: "Pike pays me to stand here. So I'm standing here." **E6.2**: 1 `collector` (Carl) on a narrow stair. Short.
  - If `hit_again`: Benny isn't there ("Benny's in the hospital. Jaw's still wired," Carl says. "Pike hired me a friend."). **E6.2**: Carl + Vic (`collector` + `thug`) on the stair.
  - The stair is narrow (one enemy can attack at a time; the landing gives room to circle). Teaches nothing new; tests the slip against a big committed swing in a tight space.
- **Pike's office.** Pike is feeding the "AHN, D." file into a shredder in his shirtsleeves. He sees Jin and doesn't stop feeding it, which is somehow worse. His file on Jin is on the desk, top sheet visible: `ch1_pike_stance == insisted` → "Patient agitated. Monitor."; `played_along` → "Patient cooperative. Low risk." Jin's thought (insisted): "Agitated. I said my own name." / (played along): "Low risk. I said 'Daniel' to get a phone call."
- **Present (evidence confrontation, no fail state).** Pike: "There's nothing here for you, Daniel. The Fund closed in January. There's no box."
  - Present `ev_min_notebook` ("Box 1180, letters 1–9"): Pike: "Letters come. I forward what I'm told to forward."
  - Present `ev_transfer_form` ("Transfer authorized by G. Pike for sponsor"): Pike stops the shredder. "...I'm a bookkeeper with a fund. I forwarded what I was told to forward."
  - Wrong presentations just get "That's not mine," and nothing is lost.
  - Pike takes a key off his ring and puts it on the desk without looking up. "Storage. The tray says hold. I held."
- **The storage room.** Three trays. "FORWARD W.R." is empty. "DISCARD" has catalogues. "**RECEIVED — HOLD**" holds nine envelopes in Min's handwriting, each date-stamped received, none opened (`ev_min_letters` ★). Jin does not open them here. Thought: "Not here."
- **The drawer.** Back in the office, Pike sees the bundle in Jin's hands, and does the thing frightened clerks do: he proves it wasn't him. He unlocks his own drawer and puts two sheets on the desk, side by side, squared to the edge.
  - Doc viewer, typewriter, slow: **`ev_pike_memo`** ★ "Jan 9, 1995. Walter — The sister has written seven times and is now asking St. Agnes and Calder General directly. The mother has applied to your Eastgate tenant fund. How do you want this handled? — G.P."
  - Doc viewer, handwriting (Rook's slanted hand on Northside Community Council letterhead): **`ev_rook_maintain`** ★ "Gerald — Maintain. No contact. Nothing from our fund under that name. It holds or everything goes. Once. — W.R. 1/12/95"
  - On "Maintain." the ambience drops out entirely. No heartbeat, no sting: silence for two seconds, then the radiator ticks. The camera eases in on Jin from 1.0 to 1.2 over four seconds and stops.
  - Jin's thought: "Walter." / "Everybody at the Courts says 'Walter' like a prayer." / "He sat on Ada's stoop and said he was sorry for what happened to me."
  - Pike: "You see? Instruction. I'm a clerk. I had a mortgage." (`harm_count` options are not offered here; nothing in this scene lets Jin hit him.)
- **Choice `ch6_pike_statement`:**
  - "Write it down. All of it. Sign it." → true. Pike writes for four minutes of game time (time-skip fade: the neon tooth flickers on, the street goes dark). Two pages in his tidy hand (`ev_pike_statement`): the name change came "from Mr. Rook, through the Harlan people"; he held the family's letters on instruction; he was paid $1,500 a month. He signs. "Will this... is this going to a lawyer?" Jin: "It's going to a lot of people."
  - "[Leave. You have what you came for.]" → false. Pike, as Jin goes: "I never opened them. I want you to know that. I never read a word."
- **No combat after this.** The stair is empty when Jin goes down (Carl has gone). The objective changes to "Read them." Market Street at dusk; the newsstand guy says "Night" and nothing else.

**S6.9 Sunny's: the booth by the window (Friday evening).** Jin takes the Route 9 to Kessler. Augie: "Booth by the window's yours. Nobody sits there Fridays anyway." Jin sits where Umma's napkin told him to sit two and a half years ago. The camera frames him from outside through the window glass (rain streaks, the neon "SUNNY'S" reversed), then cuts inside.
- **The letters (letter viewer; read any, all, or none; each is short).** Min's voice, not only pleading:
  1. *Sept 3, 1994:* "Calder General says you were 'transferred' and the 'sponsor is confidential.' What sponsor? You don't have a sponsor. You have me. Write back."
  2. *Oct 1, 1994:* "Section eight was LOUD. I got a picture of you in the tunnel before. You look good. When you wake up I'll give it to you, and you have to say it's a good picture."
  3. *Nov 19, 1994:* "Mrs. O's tomatoes died. Umma made japchae for the whole floor. You'd have eaten three plates and said you were cutting weight."
  4. *Dec 24, 1994:* (variant by `ch0_purse_dream`) "Umma still says when you're back she's quitting Saturdays. / Umma still says when you're back she's paying the rent off 'and the rent after that' — she says it in your voice. / Umma still says when you're back I'm getting a door. I'm going to slam it so hard."
  5. *Feb 12, 1995:* "I paid a detective. $350. In two parts. Don't be mad. He didn't find you either. Nobody finds you. It's like you're under a different name." (Jin's thought: "I was.")
  6. *Apr 13, 1995:* "Umma went to court in her good coat. They gave us thirty days. Thirty. She asked them for your purse and they said you have to sign for it."
  7. *June 20, 1995:* "New address: Lindell House, Room 9, Garrison St. It's fine. The radiator works if you kick it. Don't worry. (Worry a little.)"
  8. *Oct 31, 1995:* "I did a petition about the back door. Eleven signatures. I'm good at petitions now. I'm good at a lot of boring things now."
  9. *Jan 29, 1996:* "Jin-ah. Writing to the Box again, because it's the only address anyone gave me. Umma says hi. Umma says eat. I took a picture of the back door; if they don't fix it I'm taking it to Channel 8. Mrs. O turns 65 on the 10th, I'm making the cake, pray for her. If you're reading this, come home. If you can't come home, write. If you can't write, I'll find you anyway. — Min"
  - After the ninth, no line for four seconds. Then Jin's thought: "The tenth was the cake. The eleventh was the fire." He puts the letters back in their order.
- **Hana arrives** (after the player closes the viewer, never during). Peacoat, scarf, rain on her shoulders. She slides into the booth across from him and puts a manila envelope on the table.
  - Hana: "Dr. Whitlow pulled your Athletic Commission physical. The fourth metacarpal you broke at nineteen. Dental records from your gym's insurance. She signed it this afternoon." `ev_whitlow_affidavit` ★. "It says you are who you say you are. In a form a judge has to read."
  - If `rel.hana ≥ 3`: a second sheet. "And this. Our switchboard log. I went through November '95 on my lunch breaks." `ev_st_agnes_calllog`: "11/02/95 14:10 — caller Seo, Min-ji — asking for patient SEO, JIN — no such patient." Hana: "She called my building. You were down the hall from the switchboard. I was probably at the bars with somebody else."
  - Hana (by `ch1_records_route`): `with_hana` → "We found the first one together. I'm not stopping now." / `alone_at_night` → "You could have trusted me, you know. With the records. I'm here anyway."
  - If `ch1_told_hana_boxing`: "You told me about the fight, on the bars, the second week. I didn't write it down. I should have written it down."
  - If `ch1_fare_source == activities_jar`: Hana, carefully: "Mrs. Alvarez cancelled the bingo prizes in December. The jar was short. I didn't put it together until you'd gone." She waits. (`hana` −1, applied now, once.) Jin can answer "It was me." (no flag; Hana: "I know. Six-forty. I covered it. Don't do that again to people who have less than you.") or say nothing.
  - If `ch1_fare_source == hana_loan` and Jin has $10: "[Pay Hana back. $10.]" → `ch6_hana_repaid` (`hana` +1). Hana takes it without making a thing of it. "Good. Now I can buy my own pie."
  - Jin shows her the memo and the reply. Hana reads "Maintain" twice. She says the PDF's caution aloud, in her own words, because she's the one person who would: "Would one answered letter have saved them? I don't know, Jin. Nobody gets to know. He made sure nobody gets to know." Then: "He didn't light the fire. He kept them from finding you, and he kept money from them, on purpose, for a building full of other people. That's what he did. That's enough."
  - Optional: `mem_sunnys` triggers if the player examines the booth's sugar dispenser afterwards (1993: Min counting out quarters, forty cents short, Umma pretending not to notice).

**S6.10 Board, pass 2 (Saturday morning, rest point).** The fourth lane fills: `ev_min_letters`, `ev_pike_memo`, `ev_rook_maintain`, `ev_st_agnes_calllog` (if held), `ev_pike_statement` (if held). Then the board asks one question in the center, in Jin's handwriting: **"What killed them?"**
- The player may drag any single card into the center. Each time, the card slides back to its lane and Jin answers it: `ev_rook_maintain` → "No. Not just that. He didn't chain the door." / `ev_building_complaints` → "No. They'd have moved, if anyone had helped them move." / `ev_min_notebook` → "No. Looking for me isn't what killed them."
- A button on the board reads **"Leave the center empty."** (also offered from the start; the player never has to try a card). When chosen, all four lanes light from left to right, and Jin's thought writes itself across the top: "Not one thing. Four things. One of them had a signature."
- The completion text in the journal under the claim *What happened to Umma and Min*: "Their search cost them time and money. Help was delayed and redirected. The building's danger was known and left. And Walter Rook, told they were looking, chose to keep Jin hidden and keep his fund closed to them."

**S6.11 Section 14 (ending; no combat anywhere near it).** See below.

## Encounters
- **E6.1 Lindell House 2nd floor** (only if `ch6_strippers == fought`): 3 `thug` (Fitz has a crowbar: a longer, slower swing that can't be slipped, only backdashed), soft floor spots as shared hazards. 30 s. Checkpoint at the fire-escape window. After: they flee; nobody is questioned.
- **E6.2 88 Market stair:** 1 `collector` (Carl) or `collector` + `thug` (Carl, Vic), depending on `ch2_collector_after`. Narrow stair (`maxAttackers: 1` on the steps, 2 on the landing). Checkpoint at the street door. After: Carl goes down the stairs holding his jaw; if Vic was there, he follows. Nobody is questioned; Jin has nothing to ask them.
- Optional training: Iron Pulse (Teddy), the Courts' gym (Lucho), the Cellar (Mari), the river path. Optional Saturday dive at the Cellar. All at cap 3.
- **Explicitly no encounter** after S6.8's discovery, at Sunny's, on the board, or at the cemetery.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch6_asher_method` | patient / threatened | Folding activity and full account with Lazarou's note / 90-second partial account | Asher is a copy-holder candidate (`patient` only) and testifies in Ending Two ("Wendell Asher told the grand jury about the key on his ring."). `threatened`: `harm_count` +1; Ch9 Penner: "You frightened an old man in a laundromat. Efficient." |
| `ch6_strippers` | talked_down / fought | Short fight or none | Flavour only: Ch9 night, if talked down, Fitz waves from a scrap truck on Garrison Street. |
| `ch6_pike_statement` | bool | `ev_pike_statement` | Ch7: can be presented to Rook (Rook: "Gerald always did want somebody to blame in writing."). Ending Two epilogue: "Gerald Pike's two handwritten pages were Exhibit 14." |
| `ch6_hana_repaid` | bool | `hana` +1, −$10 | Ch9 night Hana line ("You paid me back. Nobody pays me back."). |
| `ch6_gave_back_4d` | bool (only if `ch5_took_unit_4d`) | Elena: "You're the boxer in 4D? ...It's nice, 4D. The light's good in the morning." Options: "[Give 4D back to the Vasquez family.]" / "[Keep it.]". Giving it back: Jin moves to Mara's cot (or the Monarch); Elena's kids carry their own boxes up on Sunday; `courts` +1; `take_count` no longer counts 4D. | Ch7 Rook's "same animal" line changes to: "You gave it back. I noticed. I never gave anything back." Ch9 Penner skips the 4D line. |
| `ch6_okafor_photo` | bool | Okafor frames it | Ch9 night: the frame is on her TV, the light on; Ending Two: she shows it to Jin again. |
| `ch6_flowers` | bool ($5) | Yellow flowers on 96-031 / 96-032 | They stay (fresh) for every later visit; Ch9 night they've been replaced by someone else's flowers too (Okafor's church). |

## Chapter ending and state handed on
- **Ending beat (Saturday, March 8, morning).** The cemetery gate; the flower cart (the player can buy yellow flowers for $5 or not; the scene plays the same). The camera follows Jin along the gravel path at 0.9, then lets him walk ahead into Section 14 while it stays back (Jin small among numbered markers). At 96-031 and 96-032, he kneels (`kneel`). No dialogue box at all for six seconds: wind, crows. Then thoughts, one per press:
  - "Umma. Min."
  - "You went to court in your good coat."
  - "You made the cake. It leaned."
  - (by `ch0_purse_dream`) "I was going to pay the rent and the rent after that." / "You were going to have Saturdays." / "You were going to have a door."
  - "He wrote 'once.'"
  - He stands; the sit glint on the bench lights. If he sits, the camera eases out to 0.7 and tilts up the hill to the river and the towers; Ashgrove Tower's lit top is the brightest thing in the frame (no comment; Chapter 9 will). Thought: "I want to hear him say it. To me."
- Card: "Friday, March 21. Northside."
- Completion screen: "Choices made: [You helped Wendell Asher fold sheets while he talked. / You pulled the sheet out of Wendell Asher's hands.] [You talked the men in Lindell House into leaving. / You fought the men in Lindell House.] [Gerald Pike wrote it down. / You left Gerald Pike with his shredder.] [You gave 4D back.] [You paid Hana back.] [You left flowers.]" Evidence: up to 17. Memories: `mem_robe`, `mem_sunnys`.
- Handed to Ch7: the full *What happened to Umma and Min* claim; `ev_pike_memo`, `ev_rook_maintain` (★ for Ch7's third link); `ev_whitlow_affidavit`; optional `ev_pike_statement`, `ev_st_agnes_calllog`, `ev_asher_testimony`; `rel.hana`; Courts relationship adjusted by 4D; map nodes `n_garrison`, `n_downtown`, `n_cemetery` inked; the Fund office "FOR LEASE" from Ch7.

---
# Chapter 7 — What Your Life Bought

**Chapter card:** "What Your Life Bought" · "Northside Community Council · Friday, March 21, 1997"

## Date, mood, palette, weather
- Friday, March 21, 1997, the first day of spring. 7:40 am at the rest point → 9:30 am Council HQ → 11:00 am Rook's office → 7:00 pm the Courts' community room → 11:00 pm the roof of Building D.
- Mood: the quietest anger in the game. A conversation with the weight of a title fight, then a room full of people Jin knows hearing something they can't un-hear.
- Palette: Council HQ is a 1921 savings bank. Cracked and patched white marble, brass teller cages turned into volunteer desks, tall arched windows full of pale spring light; Rook's office in the old bank president's room: dark wood panels, a green banker's lamp, framed photos of eleven years of meetings. The Courts at night: rain, amber windows, some lit and some deliberately dark.
- Weather: bright, wet, windy morning (puddles on Northside Ave reflect the bank's columns); clouds by afternoon; rain at the Courts from 6 pm.

## Gameplay identity
**Make the argument.** In the morning the player assembles a three-link chain on the board and sees exactly which link is missing. At the Council the missing pieces are found in a vault and a safe. The confrontation with Rook is played as a **presentation duel**: Rook's statements against the player's evidence, three links, no fail state, the camera closing in a step with each link. It is the chapter's boss and there are no punches in it. One short fight happens before it (Harlan Street men pushing the Council around); none happens after.
- Exploration 20% · dialogue 40% · investigation 25% · combat 10% · activities 5% (the chain board).
- Target length: 18–22 minutes.

## Locations
| id | Name | Size | Layout (left → right; layers) | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `council_front` | Northside Avenue, Council HQ | 1400 × 420, exterior | Route 22 bus stop → a closed Woolworth's → **the bank**: four stone columns, "NORTHSIDE SAVINGS & LOAN · 1921" carved over the door, a vinyl banner "NORTHSIDE COMMUNITY COUNCIL — 11 YEARS OF KNOCKING ON DOORS" → front steps → side lot (Rook's brown Oldsmobile) → a **black Lincoln Town Car** double-parked, engine running | A hand-painted sandwich board on the steps: "FREE TAX HELP TUES · TENANT RIGHTS THURS". The Lincoln's plates frame says "HARLAN FREIGHT — WE MOVE CALDER". | Bright wet spring; traffic; a church bell for nine-thirty | Bus stop (map), front door |
| `council_hall` | Banking hall | 1600 × 480 (main floor y 420; mezzanine balcony y 200, stair at x 1300) | Revolving door → marble floor (patched with mismatched gray tiles) → **teller cages** converted into volunteer desks (a phone bank, a copier, a coffee urn) → the **photo wall** → the **vault door** (propped open; `council_records`) → stair up → mezzanine balcony → Rook's office door (frosted glass: "W. ROOK") | The photo wall, 1986–1996: Ada at City Hall in 1991 holding "212 FAMILIES — 1 BUILDING AT A TIME"; a Calder Ledger clipping, 1988: "BAKE SALE RAISES $1,214 FOR FOUNDRY TENANTS"; Sept 30, 1994: the ribbon-cutting at the Courts, Rook with scissors, Gus at the edge of the frame not smiling. | Arched windows throw long bright rectangles across the marble; fluorescent tubes in the cages; phones ringing, a copier, volunteers' voices echoing | Front door, vault, mezzanine |
| `council_records` | The vault (records) | 640 × 360 | Vault door (two feet thick; the 1921 time-lock still visible) → shelves of binders "EXEC SESSION MINUTES 1986–" → a dehumidifier → a stool | A binder spine lettered "1994" in Nell's neat capitals. A box of unsold bake-sale cookbooks, 1989. | Single bulb; the dehumidifier hum; the hall's echo muffled | Hall |
| `rook_office` | Rook's office | 900 × 360 | Door → two visitor chairs (one with a cushion "for Ada's back") → **Rook's desk** (green banker's lamp, coffee can of pens, the framed photo of Ada cutting the ribbon) → the window over Northside Ave → **wall safe** behind a painting of Calder Foundry pouring at night → coat rack (flat cap, an umbrella) | A small photo face-down on the windowsill: Rook's late wife Dolores (d. 1990). A list taped inside the desk's pencil drawer, in Rook's hand, 1994: the 212 households by building, a tick by every one. | Window light in the morning, the banker's lamp by noon (clouds); a clock; traffic below | Mezzanine |
| `courts_community_room` | Community room (existing) | 1000 × 360 | Rows of folding chairs, the coffee urn, Nell's easel | Tonight the easel is blank. Somebody has put out the bake-sale table anyway, out of habit. | Fluorescent; rain on the windows | Yard |
| `courts_yard`, `courts_roof_d` | (existing) | — | Evening: residents in clusters, porches, one argument, Ada alone on her stoop | Some windows deliberately dark: people who don't want to talk tonight. | Rain, the boiler ticking (it was fixed in Ch5, or by now in any case) | — |

## NPCs present
| id | Where / idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|
| `rook` | His office; at the window with his hands behind his back when Jin comes in | See S7.4 | — | Everything the player has |
| `nell` | Council hall, at a teller-cage desk with a stack of Courts forms; later at the Courts | "I just do the forms. I believed the forms." / "The deed's the deed. It's recorded. Nobody can take the buildings for this." | "Sign-in sheet, please." | Gives `ev_chp_schedule` if Jin doesn't have it |
| `carrow` | **Vince Carrow**, front steps then the hall, leather jacket, clipboard, never raises his voice | "Mr. Rook's expecting this. Five-one. He knows." / leaving: "You're the boxer. Huh. Mr. Penner's gonna want to hear about you." | "Easy. Easy. It's paperwork." | First appearance; returns in Ch10 |
| `volunteers` | **Marjorie** (70s, phone bank) and **Kwame** (20s, copier) | Marjorie: "Walter's in a mood. He's been in a mood since Christmas." / Kwame: "Don't mind the Lincoln. They come every couple weeks. Walter goes gray after." | "Council, this is Marjorie." | They hide behind the cages during the fight |
| Courts residents | Community room at 7 pm: `ada`, `gus`, `darnell`, `tasha`, `keisha`, `andre`, `mara`, `lucho`, `nell`, `elena` (if still waiting or moved in) | See S7.6 | — | `ch4_envelope`, `ch5_*`, `ch6_gave_back_4d`, `ch7_truth_told_by` |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `o_board_chain` | Evidence wall (rest point) | Opens the **chain board** (S7.1) | — |
| `o_photo_wall` | Photo wall | "Eleven years of meetings. Ada with a sign at City Hall, 1991. A bake sale, 1988: twelve hundred and fourteen dollars." | Journal note |
| `o_ribbon_photo` | Photo: Sept 30, 1994 | "The ribbon. Walter with the scissors. Gus at the edge, not smiling. Forty-one days." | — |
| `o_lincoln` | Black Lincoln | "'Harlan Freight. We move Calder.' Engine running." | — |
| `o_binder_1994` | Binder "1994" | Doc: `ev_council_minutes`. Thought: "'Ask where it comes from.' Gus said it in a room in 1994. Nobody did." | `ev_council_minutes` |
| `o_binders_old` | Binders 1986–1993 | Doc (summary page in Nell's hand): "Bake sales 1986–93: $1,214 / $880 / $1,530 / $640 / $1,102 / $910 / $1,288. City HOME applications: denied 1987, 1989, 1990; partial 1992 ($38,000). Letters to the Calder Foundry pension trustee: 31. Replies: 2." Thought: "Eight years of asking politely." | Journal note (feeds Rook's defense) |
| `o_households_list` | List in the pencil drawer (after the confrontation, if Rook leaves the office open) | "Two hundred and twelve names, by building. A tick by every one. 3B: Pruitt, Ada. 1C: Lindqvist, G." | — |
| `o_safe` | Wall safe | Locked: "Behind the foundry painting. A bank safe. I'm not opening that." (Rook opens it in S7.4) | `ev_wire_640k` ★ |
| `o_dolores` | Photo, face down | "A woman laughing on a boardwalk. He put her face-down." | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q7_main` | main | "Put the chain together." → "Northside Community Council." → (fight) → "The vault. 1994." → "Walter Rook. Mezzanine." → (confrontation; HUD hidden) → "The Courts. Seven o'clock." → "Get some air." | Board opened; minutes read; confrontation complete; meeting complete; roof | `ev_council_minutes`, `ev_wire_640k` ★, `ev_rook_testimony` ★, `ev_alder_letter`; next lead: Ray Castell |
| `q7_side_marjorie` | side | "Marjorie's phone bank is short a caller." | Read one call script into the phone (a 30-second scene: Jin calling a city councilman's answering machine about Northside streetlights; the script is the Council's daily, ordinary work) | Marjorie: "You've got a phone voice. Who knew." Nothing else; it's the Council doing ordinary good work on the same morning. |
| `q7_side_ada` | side (evening) | "Ada's on her stoop alone." | Sit with her (`sitCurb` beside her kitchen chair) | Her line (see S7.7); no reward |

## Scripted scenes, beat by beat
**S7.1 The chain board (morning, rest point).** The evidence wall opens in a new mode: three links drawn as chain rings across the top, each with the PDF's sentence in Jin's handwriting, and slots under each:
- **Link 1, "The fight was fixed, and it paid."** Slots: who did it (`ev_lenny_tape` / `ev_lenny_statement`), who paid (`ev_lenny_receipt`, `ev_depot_ledger_94`), what it paid (`ev_depot_ledger_94`'s "book settlement: Castell KO R3–5, receivable via A.C. 2,100,000").
- **Link 2, "A share of it bought Foundry Courts."** Slots: what the Courts cost and when (`ev_chp_schedule`; if Jin skipped it in Ch5, this slot reads "Nell's file"), what the depot paid for (`ev_chp_disbursements`), **where the Council's $640,000 came from (empty)**, **who voted for it (empty)**.
- **Link 3, "Hiding me protected all of them."** Slots: the false name (`ev_transfer_form`), who paid for the bed (`ev_depot_ledger_94`'s St. Agnes deposit line), who knew the family was looking (`ev_pike_memo`), who decided (`ev_rook_maintain`).
- Filling the slots is quick (a minute; the player drags cards they already own). The two empty slots in Link 2 pulse. Jin's thought: "The Council paid six hundred and forty thousand in September. I can't prove it was the fight's money. Not yet." Objective: "Northside Community Council."
- If the player leaves without opening the board, the objective still advances; the board is how the chapter shows what's missing, not a gate.

**S7.2 Northside Avenue: the Lincoln.** Jin arrives by bus. The camera holds a wide (0.85) on the bank's columns and the Lincoln idling in front of them. Inside the hall, Vince Carrow is at Nell's desk with two enforcers behind him, holding out a typed letter in a clear sleeve.
- Carrow: "For Mr. Rook. He's expecting it. Five-one. He knows."
- Nell: "Mr. Rook is in a meeting. I can take a message."
- Carrow: "This is the message." He puts it on her forms. She pushes it back. One of the enforcers shoves her chair, hard; it rolls into the teller cage and she goes down with it. Marjorie screams from the phone bank.
- Jin is already walking. (No choice: the PDF's Jin doesn't stand by, and the fight is short.) Carrow steps back out of the way, clipboard to his chest: "Easy. Easy. It's paperwork."

**S7.3 After the fight: Nell and the vault.** Carrow has watched the whole fight from the revolving door. He writes something on the clipboard, leaves the sleeve on the floor, and goes: "You're the boxer. Huh. Mr. Penner's gonna want to hear about you." (The first time the player hears the name Penner. The Journal's People tab adds "Penner — ?".) The Lincoln pulls away.
- Nell, getting up, straightening her cardigan: "Thank you. They come every couple of weeks. Walter goes gray after." She picks up the sleeve and reads the top line without meaning to: "...'in support of Alder Commons, a mixed-income redevelopment'? What's Alder Commons?"
- If Jin doesn't have `ev_chp_schedule`: Nell, when he asks about the purchase: "It's in my file. I have a copy here, for the auditors." She hands it over. "I just do the forms. I believed the forms." (She doesn't know why he's asking yet; she will by tonight.)
- The vault: `o_binder_1994` gives `ev_council_minutes`: "Sept 26, 1994, executive session. Bridge financing from H.F. Co. accepted for Foundry Courts purchase, deadline 9/30. Moved W. Rook, carried 3–1 (G. Lindqvist opposed: 'Ask where it comes from.')". The board's "who voted" slot fills with a click the player hears even though the board isn't open (a small chain-link sound and a journal badge). The old binders (`o_binders_old`) give the eight years of polite asking.
- Thought: "Gus. In a room in 1994. 'Ask where it comes from.'"

**S7.4 The confrontation (Rook's office).** The mezzanine stair; the frosted glass door: "W. ROOK". The HUD hides completely. Letterbox on. Rook is at the window, hands behind his back. He doesn't turn round.
- Rook: "Nell says you put three of Dutch's people on my marble." A beat. "Thank you for that. Sit down, Jin. Ada's chair has the cushion."
- **Presentation duel.** Rook makes a statement; the player opens the evidence ring (a radial menu of the claim's cards) and presents one. Correct cards advance the link; any other card gets a short reply from Rook and the player tries again. Nothing is lost, there is no timer and no health bar. The camera moves one step closer with each link (zoom 1.0 → 1.15 → 1.3), and Rook's posture changes: standing at the window → sitting behind the desk → standing to open the safe → sitting heavily, rubbing his knuckles.
- **Link 1.**
  - Rook: "I don't know anything about a fixed fight. I run a tenants' council. We do taxes on Tuesdays."
  - Present `ev_lenny_tape` → (tape plays: "...in the cup, before the walk... Freight office on Dock Road pays. Brannigan hands it over.") Rook: "Harlan Street does a lot of things. I don't ask."
  - Present `ev_council_minutes` → Rook reads his own motion. "...Bridge financing. It was bridge financing. A loan. I didn't ask where Dutch got it."
  - Present `ev_depot_ledger_94` (the "book settlement" line) → Rook takes off his reading glasses. "Two million one hundred thousand." He says it like a man hearing the number for the first time in a while. Link 1 closes (a chain-ring sound).
- **Link 2.**
  - Rook (sitting now): "The money came in September. Your fight was in August. Lots of money moves in September."
  - Present `ev_chp_schedule` ("NCC capital contribution $640,000, received 9/27/94") → Rook: "Received. Yes. From the outfit. Bridge financing. I've said that."
  - Jin: "Where did the outfit get it?" Rook doesn't answer. Jin: "Open the safe."
  - Long hold (3 s). Rook gets up, takes the foundry painting off the wall, and opens the safe himself. He puts a single sheet on the desk and squares it to the edge, exactly the way Pike did. `ev_wire_640k` ★: "9/27/94 · $640,000.00 · from Harlan Freight Co. escrow, ref ASH-0894 · to Northside Community Council capital account." Thought: "ASH." (The Journal's "Penner — ?" entry gains a pencil line: "ASH-0894?")
  - Rook: "Six hundred and forty thousand. Out of two million one. They kept the rest. It went up the river to people who've never set foot on Northside." Link 2 closes.
- **Link 3.**
  - Rook: "The hospital was Dutch's idea. A clean bed, a different name, so nobody asks the Commission questions. You were looked after. I made sure you were looked after. Every month."
  - Present `ev_pike_memo` → Rook: "Gerald worried. Gerald always worried."
  - Present `ev_rook_maintain` → Rook looks at his own handwriting for a long time. He doesn't touch it. (If `ev_pike_statement` is presented instead or after: "Gerald always did want somebody to blame in writing.") Link 3 closes; all three rings light on screen, and the chain is shown once, whole, the PDF's sentences in Jin's handwriting: **"The forced result produced the payout. A negotiated share financed Foundry Courts. My concealment protected everyone involved."**
- **The admission (`ev_rook_testimony` ★).** No more presenting. Rook talks. The player advances lines; nothing else.
  - Rook: "Dutch came to me in July. At Starlite Lanes, in the lounge, over a pitcher nobody drank. He said there'd be a fight, and a result, and a share. He said the kid loses a fight he'd lose anyway in two years, and nobody gets hurt. I said yes. I said yes in July, Jin."
  - Rook: "I was in section twelve. Round two, I watched your legs go. I knew what I was looking at. I stood up. I was going to walk to the Commission table and say stop it. Dutch was in the next seat. He said, 'Sit down, Walter. It's almost over.'" A beat. "And I sat down."
  - Rook: "When Gerald told me you might not wake up, I said keep paying St. Agnes. Keep him comfortable. Keep the name. I paid for your bed every month out of the same money. I told myself that was something."
- **His defense (concrete, the PDF's demand).** Rook takes the list out of his pencil drawer and reads from it without needing to look.
  - Rook: "Ada Pruitt, 3B, forty-one years; her husband died in that bedroom. Gus Lindqvist, 1C, foundry lungs. The Greers: Darnell's mother then, Darnell and his kids now. The Reyes boy. The Kowalczyks. Two hundred and twelve households. The pension trustee had a buyer, Mid-State Parking, and the sale closed September thirtieth. I had eleven years of bake sales." He taps the 1988 clipping on the wall without looking at it. "Twelve hundred and fourteen dollars."
  - Rook: "Ada sat in that chair and cried. People I'd known twenty years begged me. Polite never worked. Not once in eleven years. Dutch worked in three weeks."
  - Rook: "And I told myself once. A man can live a long time on once."
- **Jin's answer** (canon; the line is fixed, its delivery varies by `jin_voice`):
  - Jin: "Nobody asked me."
  - (restrained) "You had a list. Two hundred and twelve names. You had my name too. You just didn't put a line next to it." / (mixed) "You read me a list. Was my name on it? Was Umma's? Min wrote to you nine times." / (hard) "Nobody asked me. Nobody asked my mother. You asked Dutch."
  - Rook: "No. Nobody asked you." He doesn't defend that.
- **Reflections of the player's own choices** (only the ones that happened; Rook names them because he has been watching too):
  - If `ch5_took_unit_4d` and not `ch6_gave_back_4d`: "I gave you 4D. I took it from a woman with three children and gave it to you, and you took it. We're the same animal, Jin. We just had different-sized rooms." / if given back: "You gave 4D back. I noticed. I never gave anything back."
  - If `ch4_envelope == taken` and `ch5_envelope_outcome == kept`: "And Dock Road's payroll. That was you. Mara's crew went a week without. You see how easy it is? You see how it doesn't feel like anything at the time?"
  - If `jin_voice == hard`: "You've hurt people to get to this office. You had reasons. So did I." / if `restrained`: "You got all the way here without hurting anybody who didn't swing first. I couldn't have done that. I never tried."
- **Rook's question, `ch7_rook_answer`.** Rook: "What would you have said? If I'd come to you in July. Two hundred and twelve households against one fight. What would you have said?"
  - "You'd have had to ask me. That's the point. You didn't." → `would_have_asked`. Rook: "And you'd have said no, and I'd have lost the buildings, and you'd have your mother. That's the arithmetic I didn't want to do."
  - "I don't know. I don't know what I'd have said." → `dont_know`. Rook, very quietly: "...Thank you for that. That's more than I gave you."
  - "Not this. Whatever I'd have said, not this." → `not_this`. Rook: "No. Not this. I'd agree with you, if it was mine to agree."
- **What the outfit wants now.** Rook picks up Carrow's sleeve from where Jin put it on the desk.
  - Rook: "They own the roof money now. Every month the Courts' maintenance comes through Dock Road because I let it start. Now they want a letter. Alder Row, across the river: a co-op, twenty-four families. Somebody's going to build 'Alder Commons' where it stands. They want the Council's name on a lie that says Northside supports clearing it. If I don't sign by May first, the roof money stops, and the Courts' bank calls the note." He hands it over: `ev_alder_letter` (unsigned; clipped note "Sign by 5/1. — H.S."). "I haven't signed it. I don't know if that's because I'm better than I was or because I'm more scared."
- **The lead.** Jin: "Who's A.C.? Who said when?" Rook: "I never knew who. Dutch told me after, laughing, that Castell's trainer took a phone call at the end of round two. Somebody up the river said 'now.' Castell knows. He was there for it." Objective (shown after the scene): "Ray Castell."
- **The last beat in the office (`ch7_hit_rook`, the Q4 ladder at the smallest scale).** Rook comes round the desk and stands in front of Jin with his hands at his sides. "If you want to hit me, do it now. There's nobody to see."
  - "[Hit him.]" → true. One punch (Jin's real punch animation, a heavy hit-stop, no spark effect). Rook goes into the bookcase and sits down on the floor. He touches his mouth. "...That's fair." `harm_count` +1. The bruise is on his face at the meeting tonight and in Ch9.
  - "No." → false. Rook nods. "No." He sits back down. Nothing more; the game doesn't praise the player for it.
- **`ch7_truth_told_by`.** Rook: "They'll have to know. The Courts. Let me tell them. Tonight. It should come from me."
  - "[Let Rook tell them. Stand at the back.]" → `rook` (`courts` +1: they heard it from him).
  - "[No. I'll tell them.]" → `jin`. Rook: "...All right. Nell will call the meeting. I'll be in my office if anybody wants to come and shout." He doesn't come.
- Letterbox off. The HUD fades back in. **No combat after this anywhere in the chapter.**

**S7.5 Afternoon (free).** Northside in clouds. The player can train at the Courts' gym (Lucho is distracted: "Something's up. Nell called a meeting. Nell never calls meetings."), sit at the bus stop, or go straight to the Courts. Kids are playing in the yard as if nothing has happened, because for them nothing has yet. Jin's thoughts on the bench by the garden beds: "Keisha's tomatoes. Bought with my fight." / "I came here thinking it was a front."

**S7.6 The meeting (7 pm, community room, rain).** Nell has put out the chairs. Forty people. The camera works like a play again (static wide at 0.9), but this time it does not zoom on speakers: it stays wide and lets the whole room be seen reacting at once.
- **If `rook` tells it:** Rook stands at the front table in his corduroy blazer (with a bruise if `ch7_hit_rook`; Ada: "Walter, your face." Rook: "I walked into something I'd earned."). He tells it plainly, in order: July, the lounge at Starlite, the share, section twelve, "Sit down, Walter," the hospital, the name, the letters. He doesn't say "for you"; he says "I did it." Jin stands at the back by the coffee urn and is pointed at once, by Rook: "That's Jin Seo. You know him as the man who carried your radiators."
- **If `jin` tells it:** Jin stands at the front. The player doesn't type a speech: he puts four cards on Nell's easel (the dialogue shows them as he pins them: the transfer form, the wire, the memo, "Maintain"). Jin: "My name is Jin Seo. Two and a half years ago I fought Ray Castell at the Civic. I was drugged in the dressing room. Your Council took a share of the money that made. It bought these buildings. Walter Rook kept me under another name so nobody would ask. My mother and sister looked for me until they died." Rook's chair is empty. Everyone looks at it.
- **Reactions, one after another, each in its own body language** (the PDF: some reject Rook immediately, some can't reconcile gratitude with it, a few turn on Jin out of fear; never all ungrateful, never fraud):
  - **Gus** stands up first and puts on his cap. "I poured iron forty years for a man who sold us to a bank. Now I find out who bought us back. Wonderful." (If `ch5_meeting_stance == independence`: on his way out, to Jin: "You said it out loud in February. Thank you for that.") He leaves. **Rejects Rook immediately.**
  - **Ada** doesn't stand. She holds her purse in her lap with both hands. "He saved my home and he took your life. Both. I can't hold both, Jin." (If `ch5_meeting_stance == roof`: "You voted for my ceiling. I still have a dry ceiling. I don't know what to do with that.") (If `ch5_donation ≥ 50`, first: "You put money in the can. I saw.") **Can't reconcile it.**
  - **Darnell** is on his feet. "So what now? You got your truth. I got two kids and a lease that says Courts Housing Partnership. Is the bank going to take it back because some gangster paid for it?" (If `ch4_envelope == taken` and `ch5_envelope_outcome == kept`: "And Harlan Freight got hit the same night our envelope 'didn't come.' That was you. You took our pay to get here." Jin can answer "It was me." or say nothing; both are shown plainly; `rel.courts` −1 if silent.) **Angry at Jin because he's afraid.**
  - **Tasha**, a hand on Darnell's arm: "Darnell's not mad at you. He's scared. It comes out the same."
  - **Elena Vasquez** (if she's at the Courts): "Can they take it back? The buildings?" **Nell** answers, firmly, the one thing she's sure of: "No. The deed's the deed. It's recorded. The roof is real. The boiler is real." (The benefits are not fraudulent, per the PDF.)
  - **Keisha**, to Tasha, too loudly: "Are we still allowed to live here?" Nobody answers her for a moment.
  - **Mara** has been standing against the back wall with her arms crossed the whole time. "I fixed these pipes with that money. I'd fix them again. That's the worst part." (Variant: `ch5_envelope_outcome == confessed`: to Jin, quieter, later: "You told me about the envelope. That's the only reason I'm still talking to you." / `kept`: she says nothing to Jin at all tonight; the tin was short and she has done the arithmetic.)
  - **Nell**: "I just do the forms. I believed the forms."
  - **Lucho** says nothing in the room. He stacks chairs afterwards, alone, until Jin helps or leaves.
- **The yard after.** Rain. The residents split into three clusters on three porches. If `rook` told it, Rook's Oldsmobile is still in the lot; he sits in it with the engine off; nobody goes to it except, after a while, Ada, who stands at the driver's window and says something the player can't hear. If `jin` told it, the lot is empty.

**S7.7 Lucho's ask (the commitment for Chapter 8).** Lucho finds Jin by the gym stairs, hands in his overalls.
- Lucho: "Whatever happens with Walter. April eleventh. The Armory. Golden Gloves. Thirty-three, last year they let me. Thirty-four, they don't." He shrugs. "I need a corner who's been there."
- "I'll be there." → `ch7_lucho_promise = yes` / "I'll try." → `try`. Lucho: "Try's fine. Be there." Both create the commitment the player will be asked to keep or break in Chapter 8. (A third option is not offered: Lucho isn't asking for an answer about anything else tonight.)
- Optional: sit with Ada on her stoop (`q7_side_ada`). She talks without looking at him. "My husband used to say the Courts would outlive all of us. I think he meant it nicely." Then: "Come Sunday. I'll make soup. I don't know what else to do."

## Encounters
**E7.1 The banking hall** (the chapter's only fight; arena x 200–1200 on the marble; checkpoint at the revolving door).
- 2 `enforcer` (Harlan Street muscle: hold a high guard that absorbs jabs, then commit to a shoulder charge with a long wind-up; the charge can be slipped at the last moment for a counter, or dashed through during the dodge window) + 2 `thug`. `maxAttackers: 2`.
- **No tips.** This is the first fight since Chapter 4 that assumes the full toolkit and says nothing. The hall's teller cages break up the space; the volunteers duck behind them (Marjorie under the phone desk, Kwame behind the copier). Hooks for the two thugs, uppercut-launch the lighter one, slip-counter the charges.
- Carrow never fights. He stands in the revolving door and watches (he is the reason Penner "has followed his progress" in Ch9).
- After: the enforcers limp out to the Lincoln. Nobody is questioned; Carrow already said what he came to say.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch7_rook_answer` | would_have_asked / dont_know / not_this | Rook's reply | Ch9 night: Gus or Ada quotes it back if Rook told them ("He said you said you didn't know. That's the most honest thing anybody's said about any of this."). Ch10: Jin's last thought before the gate uses it ("You'd have had to ask." / "I don't know what I'd have said." / "Not this."). |
| `ch7_hit_rook` | bool | One punch, `harm_count` +1 | Rook's bruise at the meeting; Ch9 night Rook: "My lip's healed. I'd have let you do it twice." / (false) "You didn't hit me. I've been trying to decide all month whether that was mercy or contempt." |
| `ch7_truth_told_by` | jin / rook | Who stands at the front; `courts` +1 if `rook` | Ch9 night: if `rook`, the Courts hold a vigil for the Seo family in the yard (Nell's idea; candles in jars on the garden beds); if `jin`, ordinary laundry on the lines and the residents divided, some nodding to Jin, some not. Ending Two: Rook testifies (both cases), but only after `rook` does he speak at the Courts' Sunday meeting again. |
| `ch7_lucho_promise` | yes / try | Lucho's reply | Ch8 opening line when the conflict arrives ("You said you'd be there." / "You said you'd try."). |

## Chapter ending and state handed on
- **Ending beat (11 pm, roof of Building D, rain easing).** Jin climbs the ladder alone. Below, the yard: four buildings, the windows lit and dark in a pattern that wasn't there last week. If `rel.mara ≥ 2`, Mara comes up after a minute, no beer this time, and stands beside him. Mara: "I'm going to fix the boiler controls tomorrow. Because it's Saturday and they need fixing." Jin: "I know." Mara: "I'm not saying that to make you feel better. I'm saying it because I don't know what else is true." She goes down. If not, Jin is alone. The camera eases out to 0.7. Thought: "He had a list. Two hundred and twelve names. He had my name too." Then: "Castell. He was there for 'now.'"
- Card: "April. Calder Civic Arena."
- Completion screen: "Choices made: [You told Rook he'd have had to ask. / You told Rook you don't know what you'd have said. / You told Rook: not this.] [You hit Walter Rook once. / You didn't hit Walter Rook.] [Rook told the Courts himself. / You told the Courts yourself.] [You told Lucho you'd be in his corner. / You told Lucho you'd try.]"
- Handed to Ch8: the complete chain (`ev_council_minutes`, `ev_wire_640k`, `ev_rook_testimony`, `ev_alder_letter`); the lead "Ray Castell"; Journal person "Penner — ?" with "ASH-0894?"; the commitment to Lucho (April 11); `rel.courts`, `rel.mara`, `rel.lucho` after the meeting; Council HQ stays open on the map (Rook's office lit late every night through Ch9).

---
# Chapter 8 — The Man in the Other Corner

**Chapter card:** "The Man in the Other Corner" · "Calder Civic Arena · April 11–14, 1997"

## Date, mood, palette, weather
- Friday, April 11, 1997 (Lucho's bout at the Calder Armory, 7 pm; Ray's light-security night). Sunday, April 13 (Ray's heavier-security night, if Jin keeps the promise). The copy run at dawn the morning after Ray: Saturday April 12 or Monday April 14.
- Mood: dread and familiarity. Everything echoes Chapter 0 a half-step off: the same building, emptier; the same bell, rung by a different hand; the same corner, with whoever Jin kept. Then the emptiness after winning.
- Palette: the Armory is warm and crowded (tungsten bulbs, red-white-blue bunting, folding chairs, popcorn). The Civic at night is the Chapter 0 palette with the crowd taken out: deep navy and charcoal, the ring the only white-hot thing, the blue and red corner pads. The copy run is dawn blue through Kwik Copy's window, then the first green on the river path (spring).
- Weather: Friday mild rain; Sunday clear and warm for April, windows open in Eastgate; dawn fog that lifts.

## Gameplay identity
**Mastery and its limits.** A promise that costs something to keep (Q3), a night in another man's corner where the player reads a fight instead of throwing it, a security run through a building the player already knows, then the personal climax: Ray Castell, in the same ring, under the same lights, with attack patterns the player has seen before and can now answer. Then a dawn of photocopies and doorsteps.
- Exploration 15% · dialogue 20% · investigation 10% · combat 40% · activities 15% (the corner at the Armory, the copy run).
- Target length: 22–25 minutes (Armory 6, approach 5, Ray 6, after and copies 6).

## Locations
| id | Name | Size | Layout (left → right; layers) | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `armory_floor` | Calder Armory, drill hall | 1600 × 480 (bleachers at y 260 and 160) | Doors with a ticket table ("GOLDEN GLOVES · CALDER DISTRICT · $5") → bleachers on the left (Keisha, Andre, Tasha, Ada with a cushion, Darnell after his shift) → the ring (amateur, blue canvas, x 600–1000) with **Lucho's corner** on the left → judges' table → the dressing area behind a canvas curtain (Lucho's stool, a bucket, Vaseline, a towel) | A hand-painted banner from the Courts: "LUCHO — FOUNDRY COURTS — LAST DANCE". Programs on the chairs: "Bout 14: L. Reyes (Foundry Courts BC) vs K. Shaw (Calder PAL)". | Tungsten, haze; crowd of a few hundred, bell (a cheap electric buzzer, not brass: deliberately unlike the Civic's bell) | Doors (map) |
| `civic_dock` | Calder Civic, loading dock | 900 × 360 | Street → the dock ramp → the **dock door** ("kick it low": Deshawn's or Lenny's tip; otherwise the night guard's route) → service corridor | Road cases stencilled "CASTELL — MAY 17 — TITLE DEFENSE". A banner in plastic wrap: "THE PROMISE KEPT". | Sodium lamp; a dumpster lid banging in the wind | Street, `civic_concourse` |
| `civic_concourse` | Backstage concourse (Ch0 location, 1997 state) | 1600 × 360 | Same layout as 1994: corridor → press room door → stairwell door → **Dressing Room B** → tunnel | The 1994 taped arrows "BLUE CORNER →" are still on the floor, faded and half-scraped. A new sign on Dressing Room B: "VISITORS". A security guard's chair with a paperback face-down. | Half the fluorescents off; footsteps echo; no crowd at all | Dock, press room, stairwell, Dressing Room B, tunnel |
| `civic_press` | Press room | 720 × 360 | Folding tables, the backdrop with sponsor logos (Riverside Ford, Calder Ledger), a podium | The same backdrop as the July 1994 press conference; a fresh poster for May 17 pinned over it. | One lamp | Concourse |
| `civic_dressing_b` | Dressing Room B (1997) | 720 × 360 | Same as Ch0: bench and lockers → taping table → **the water cooler with a stack of paper cups** → footwork floor → heavy bag → mirror | The X marks on the floor are still there under new tape. The cups are the same brand. | Bare bulbs; the clock (stopped at 4:10) | Concourse |
| `civic_stairwell` | Service stairwell (1997) | 360 × 540 | Ground → mid-landing (empty) → roof door | The coffee can of butts is still on the mid-landing. The "EX T" sign still has its dead letter. Nobody stands under the bulb. | One caged bulb | Concourse |
| `civic_ring` | Main floor, dark | 1280 × 360 | Tunnel mouth → **blue corner** (stool, a bucket; Teddy if present) → ring (x 440–840) → **red corner** (Ray's gym bag, his robe on the ropes) → ringside: the **timekeeper's table with the brass bell** (Sal), press row with its old phones, **row 3** seat behind the red corner (empty, one seat folded down) → bleachers in darkness | Section 8 sign in the dark bleachers on the left, where Umma and Min sat. The Channel 8 riser, empty. | Only the ring lights (white cones) and the exit signs; the rest is black. The ring ropes creak. When Sal strikes the bell, it is the exact sample from Ch0's cold open. | Tunnel |
| `kwik_copy` | (Ch6) at dawn | — | Dot unlocks at 5 am; the lights flicker on one row at a time | Min's cubby; Dot has put a coffee for Jin on it. | Copiers warming up (a rising hum), the light bar sweeping | Street |
| `river_path` | Riverside path (spring state) | (existing) | — | First green on the willows; the ice is gone. Ashgrove Tower across the river. | Birds, the river | — |

## NPCs present
| id | Where / idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|
| `lucho` | Armory dressing area (if kept), wrapping his own hands, bouncing | "Half a second, bang-bang-bang-bang, then get out. You tell me if I forget." / at the stool: "I'm fine. Send me." | "Feet! ...That's my line. You say it." | `ch8_lucho_commitment`, `ch8_lucho_call`, `ch7_lucho_promise` |
| `kenny` | **Kenny Shaw**, 24, Calder Police Athletic League, red headgear | (no lines; a fighter seen from the corner) | — | — |
| `deshawn` | The Cellar (Thursday, if `rel.deshawn ≥ 0`) | "He drops that right shoulder. Every time. I sparred him two weeks in '96. When it's real, his back heel comes up. When it's a feint, the heel stays down." / "Friday and Sunday nights he works out alone with Sal. Sunday the promoter's people are in for the press tour." | — | `rel.deshawn` (tip only if ≥ 1) |
| `teddy` | Iron Pulse (Thursday) then Jin's corner at the Civic, if `rel.teddy ≥ 2` | "Same corner. I'm not leaving it this time." / "Jin. Look at me. Are you all right? If you're not, I stop it. I'll stop it this time." | "Feet." | `ch3_cup`, `ch0_told_teddy`, `ch8_hands` |
| `ray` | In the ring, hitting Sal's mitts | See S8.6 | — | `ch0_resistance`, `cellar_dives_taken`, `ch8_hands` |
| `sal` | **Sal Bruno**, 66, Ray's trainer: holding mitts; later at the timekeeper's table | "Ray. Ray, this isn't — " / (at the bell) "That's it! That's it! He's done! Jin, he's DONE!" | — | `ch8_ray_after` |
| `guards` | Concourse and dock | Friday: "Building's closed, pal." Sunday: radio chatter ("Lobby to dock, we got a walk-in.") | — | Sunday only: `brezinski`, the promoter's head of security (`director`): a stout man in a blue blazer with an earpiece, who never leaves the press-room door |
| `dot` | Kwik Copy, 5 am, keys in hand, a coat over her pajamas | "You call me at four in the morning, it better be for Min." / "Copies are seven cents. Today they're free. Don't tell my manager." | — | — |
| copy holders | At their own places (see S8.9) | One line each | — | Relationship and witness flags |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `o_sunnys_tv` | Augie's TV (Thursday) | Channel 8 sports: "Champion Ray Castell, preparing for his May seventeenth defense, is training behind closed doors at Calder Civic Arena, Friday and Sunday nights, with heavy security expected for Monday's media day." | The Civic lead (always available, whatever Deshawn thinks of Jin) |
| `o_tape_arrows` | Floor arrows | "'BLUE CORNER.' Two and a half years. Nobody scraped them off all the way." | — |
| `o_cups_1997` | Paper cups by the cooler | "Cups." (The same one word as Chapter 0. Now it's the most frightening word in the game.) | — |
| `o_mirror_1997` | Mirror | "Scar. Thinner. Same hair." | — |
| `o_press_backdrop` | Press backdrop | Holding E plays **`mem_presser`**: July 1994, the press conference, Ray's handshake held a beat too long, his eyes going past Jin to someone at the back of the room. | `mem_presser` |
| `o_stair_landing` | Mid-landing | "Nobody under the bulb tonight." | — |
| `o_section8` | Section 8 sign (dark bleachers) | "Section eight. She said wave." | — |
| `o_row3` | Row 3 seat | "Folded down. Somebody sat here and watched." | — |
| `o_brass_bell` | The bell | "The bell. Brass. Two strikes for a round. I heard this one for a long time." | — |
| `o_ray_bag` | Ray's gym bag | (after the fight) His appearance schedule | `ev_alder_closing` ★ |
| `o_copier` | Copier | Copy activity | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q8_main` | main | "Find out where Ray Castell trains." → (Friday, two objectives shown together, see S8.2) → "Calder Civic. Get to the ring." → (fight; HUD hidden) → "Make copies. Kwik Copy opens at five if Dot says so." → "Get the envelopes to people who'll keep them." → "Ashgrove Tower." | TV or Deshawn; the choice by walking; Ray done; copies made; at least Hana's envelope delivered | `ev_sal_notebook` ★, `ev_alder_closing` ★, `ev_ray_statement` (stop only); copy holders |
| `q8_lucho` | side → **commitment** | "Lucho's corner. Calder Armory, seven o'clock." | Go to the Armory on Friday (kept) or not (abandoned) | `ch8_lucho_commitment` |
| `q8_teddy` | side (if `rel.teddy ≥ 2`) | "Teddy unrolled the old canvas." | Iron Pulse, Thursday: one mitts round on the old Marsh ring canvas | Teddy comes to the Civic |
| `q8_hana_call` | side | "Call Hana." | The payphone in the Civic concourse after the fight | `hana` +1 |

## Scripted scenes, beat by beat
**S8.1 Thursday, April 10: where Ray trains.** Chapter card over Jin's notebook: "Castell. Sal Bruno. 'Now.'" Two ways to learn the schedule, both always available:
- Sunny's: Augie turns the TV up (`o_sunnys_tv`). Augie: "Castell. That's the guy who — " He looks at Jin. "...I'll turn it down."
- The Cellar: Deshawn on the bench by the lockers (if `rel.deshawn ≥ 0`; if `≤ −1` he walks past Jin and only says "Not my business anymore"). With `rel.deshawn ≥ 1` he adds the tell and the dock door: "Loading dock door sticks. Kick it low." With `ch3_deshawn_dive == accepted`: "You let me eat that night. I'll tell you what I know."
- If `rel.teddy ≥ 2` (`q8_teddy`): Iron Pulse after ten. Teddy has unrolled the old Marsh Boxing Club canvas over the Nautilus floor and taped the corners down. One mitts round where Teddy mimics the right hand with the shoulder drop. Teddy: "Same corner. I'm not leaving it this time."

**S8.2 Friday, 6 pm: the promise (Q3: abandon a commitment when an investigative opportunity appears?).** At the rest point, the HUD shows **two objectives at once**, stacked, with their costs written plainly:
- "Lucho's corner. Calder Armory, seven o'clock." (`ch7_lucho_promise`: "You said you'd be there." / "You said you'd try.")
- "Calder Civic. Ray works out with one guard on the door tonight. Sunday the promoter's security will be in."
- Jin's thought: "Tonight it's Ray, Sal and an old man on a chair. Sunday it's a building full of people with radios."
- There is no menu. The choice is made **by which bus Jin takes** from the stop on Kessler: the Route 22 to the Armory or the Route 9 to the Civic. The stop's sign shows both, and pressing E at it gives: "[Route 22 — the Armory. Ray can wait until Sunday.]" / "[Route 9 — the Civic. Lucho will have to fight without you.]" Autosave before.
  - Armory → `ch8_lucho_commitment = kept`. Ray happens on Sunday with heavier security (E8.2 Sunday version).
  - Civic → `abandoned`. Ray happens tonight with light security (E8.2 Friday version). Lucho fights without Jin.

**S8.3 The Armory (only if kept): working a corner.** The drill hall; the Courts' banner; the Courts' kids in the bleachers (Keisha waves both arms). Lucho wrapping his own hands behind the curtain: "You came." (If `try`: "You tried. Look at that.")
- **The corner activity (3 rounds × 2 minutes, Lucho vs Kenny Shaw).** Jin stands on the apron; the camera frames the ring from Lucho's corner (zoom 1.0). The player does not control Lucho. During each round, four call buttons are mapped to directions: **"Feet!"** · **"Jab!"** · **"Turn him!"** · **"Hands up!"** Kenny shows readable habits: after two jabs he drops his left (call "Turn him!"); when Lucho stands flat-footed on the ropes (call "Feet!"); when Kenny loads his right hand his rear heel comes up (call "Hands up!"). A correct call at the right moment makes Lucho do the thing (a small win for that exchange); a wrong or late call does nothing and costs nothing. This is the player reading openings from outside the fight, the same skill they need for Ray, taught where nothing is at stake for Jin.
- **The stool between rounds:** a one-line choice of advice (three options, each true: "He drops the left after two jabs." / "Stop standing on the ropes." / "Breathe. You're winning."). Lucho repeats whatever he's told under his breath, like Jin used to.
- **Round 3: the call (`ch8_lucho_call`).** Halfway through, Kenny catches Lucho with a right hand; a cut opens over Lucho's left eye; Lucho's legs go for a second (the Ch0 debuff visuals, faint, on Lucho's sprite: his outline doubles for a moment). He survives to the bell. On the stool the referee leans over the ropes to the corner: "Corner? He good?" Lucho, blood running into his eye: "I'm fine. Send me." The camera holds on Jin at zoom 1.4, the same framing as Teddy in Chapter 0. No timer; the ref waits.
  - "[Throw the towel.]" → `stopped`. The towel lands on the canvas; the crowd boos; the Courts' bleacher goes quiet. Lucho shoves the stool. Later, in the dressing area, with a butterfly bandage on his eyebrow: "You did right. I hate you a little. Buy me a sandwich." (`lucho` +2 for keeping the commitment, no further change.)
  - "[Send him out.]" → `sent`. Lucho goes out and finishes on his feet. He loses a split decision. The cut needs four stitches at the Armory's doctor table. Lucho, while they stitch: "Thanks for trusting me." A beat. "My legs were gone, you know. In the third. You knew." He isn't angry. He isn't absolving anyone either. (`lucho` +2.)
  - Neither result is better. The game does not grade it. The completion screen says only what Jin did.
- Ada, leaving: "Lucho's mother would have liked you in the corner." Keisha: "Did we win?" Tasha: "We came."

**S8.4 The approach (Friday or Sunday night).** Route 9 to the Civic. The building is dark except for one row of high windows. Jin takes the loading dock (Deshawn's "kick it low" saves a door-forcing animation; otherwise the night guard's rounds open it on a 20-second loop). Inside, the concourse in half-light. The 1994 arrows on the floor. See E8.1 for the fights. Optional stops (all on the way, none required):
- **Press room** (`mem_presser`).
- **The stairwell**: the empty mid-landing under the bulb. Jin's thought: "He said it was advice." (`ch0_refusal_line` quoted back in Jin's head: "'I'm not for sale.' / 'My mother's in section eight.' / 'Move. I've got a fight.'")
- **Dressing Room B**: the cups, the mirror. Here **`ch8_hands`** is chosen at the taping table:
  - "[Wrap your hands. Tape, like a boxer.]" → `wraps`. If Teddy is here, he wraps them (`sit` on the bench, Teddy kneeling with the tape). Mechanically: `power 0.65`, counter-cross damage ×1.3 (clean technique rewarded).
  - "[The knuckles.]" → `knuckles`. Mechanically: `power 0.90`, counters ×1.0. Teddy, if present, looks at them and then at Jin: "...Your hands. Your call." 
  - The numbers are tuned so both are equally winnable; the choice is about what this fight is.
- **Teddy and the cup** (if Teddy is here). Teddy fills a paper cup at the cooler and holds it out. The camera holds on the cup at 1.5 for one second longer than is comfortable.
  - If `ch3_cup == drank`: Teddy sees Jin's face, takes the cup back, and drinks half of it himself first. "It's water, kid. Watch me." He swallows. "...See? Water." He holds it out again. (Drinking is optional; nothing changes either way.)
  - If `poured`: Jin takes the cup and pours it into the sink. He takes the second cup Teddy fills and pours that out too. Teddy looks at the sink, then drinks from the cooler bottle directly, like a kid. "Fair."
- **The tunnel.** Letterbox on. Walking out of the tunnel into a dark arena is the Chapter 0 walk-out with the crowd removed: the same camera move (track from behind at 1.2, pull out to 0.85 as he reaches the apron), but silence instead of the roar, and the ropes creaking.

**S8.5 Ray (before the bell).** Ray is in the ring hitting Sal's mitts in a gray sweatshirt, burgundy track pants. Sal sees Jin first. The mitts come down. Ray turns.
- Ray (by `ch0_resistance`): 0–1: "You went down like you'd been told." / 2–3: "You were still throwing in the third. I felt it. I still feel it in this hand."
- Ray: "I didn't put anything in your cup. I just didn't stop. You want to hang me for not stopping?"
- Jin: "I want to know who said 'now.'"
- Sal flinches. Ray sees him flinch.
- If `cellar_dives_taken > 0`: Ray: "I hear you took dives in a bowling-alley basement. You want to talk to me about clean?"
- Ray (by `ch8_hands`): wraps: "Tape. Okay. Like a fighter." / knuckles: "Brass. Okay. That's what this is."
- Ray: "You want it, come get it. Same corner." He points his glove at the blue corner. "Sal. Ring it."
- Sal: "Ray, this isn't a — " Ray: "Ring the bell, Sal."
- Jin walks to the blue corner. (If Teddy is here, Teddy is already on the apron with a towel.) Sal at the timekeeper's table. Two strikes of brass: the exact sound that opened the game.

**S8.6 Between rounds: the same stool.** After round 1 and round 2, the corner scene, camera at 1.4 on the stool, exactly framed like `s0_corner`.
- **With Teddy** (`mem_corner` shard ③): Teddy: "What do you see?" Jin: "Shoulder. He drops the right shoulder." Teddy: "Then don't be there when it comes." A beat. "Jin. Look at me. Are you all right? If you're not, I stop it. I'll stop it this time." Jin: "I'm all right." Teddy (if `ch0_told_teddy`): "You told me about a coat once. I didn't listen. I'm listening." Teddy: "Hands up. Chin down. Go." This time it's a question first.
- **Alone** (`mem_corner` ③ variant): Jin on the stool, the bucket empty, nobody on the apron. Thought: "Nobody to tell. Nobody to send me out." Then: "So I send myself."
- After round 2, `mem_row3` shard ② can trigger if the player looks at Ray's corner: Sal glances at the empty row-3 seat by reflex. Ray, across the ring, catches Jin looking: "Sal always looks there. Some guy in a camel coat. Every fight there was a guy like that." (The coat is never identified as the one who ordered anything.)

**S8.7 The end of the fight (`ch8_ray_after`, played, not picked).** See E8.2 for the fight. When Ray's condition reaches zero:
1. The knockdown plays in slow motion (0.25) and freezes on Ray's shoulder hitting the canvas; input is ignored for 1.0 s and the buffer is flushed (so nobody "continues" by mashing the last combo).
2. The HUD is gone. Ray is on one elbow, trying to get up, unable to. He is no longer a threat; his guard won't come up.
3. **Sal starts ringing the bell.** Not two strikes: over and over, the brass bell from Chapter 0, struck by the man who stood in the other corner while it rang for Jin. Sal, shouting over it: "That's it! That's it! He's done! Jin, he's DONE!"
4. The **neutral corner** (the white pad) is lit by the ring light. Walking into it is stopping. There is no prompt text on screen except a small "E — walk away" when Jin is beside Ray, and nothing at all elsewhere.
5. If the player presses ATTACK near Ray: the **first press** does not hit. Jin raises his fist over Ray and holds (a new pose, the punch frozen at its start). The thought line appears: *"He's done."* The **second press** commits: Jin hits a man on the canvas. Each blow is muffled, with no hit-stop, no sparks and no shake; Sal is screaming; the bell keeps going. After the second blow the screen cuts to black on the impact; the bell continues over black for two seconds, exactly like the end of Chapter 0, then stops. → `continued`, `harm_count` +1.
6. If the player walks to the neutral corner (or presses E): → `stopped`. Jin leans on the white pad with both forearms; the bell stops after three more strikes; Sal sits down on the floor behind the table.
7. If the player does nothing: nothing happens. The bell keeps ringing. After 15 seconds, one thought: *"Walk away. Or don't."* There is no timer and no default.
- **After `stopped`:** Ray, on his back, speaking to the lights: "I saw your eyes go in the first. In '94. I knew. Sal came back from the phone and said 'now,' and I threw. I could've held you. I could've hugged you till the bell. I threw." `ev_ray_statement`. "You don't know what it is to be the guy everybody's paycheck stands on. Sal's kids. My cutman. The Ford dealer with my face on a billboard on Route 9. I was going to be nobody in two years. You were going to make it one night." Then: "His name's Penner. Sal wrote it down. Sal writes everything down." Sal brings the notebook from Ray's bag and holds it out with both hands: `ev_sal_notebook` ★ ("End R2 — press-row phone, L. Penner (Ashgrove): 'Now.' Told Ray: he's done, go.").
- **After `continued`:** fade in on Sal kneeling over Ray, a towel under Ray's head. Sal doesn't look at Jin. He takes the notebook out of the gym bag and throws it; it slides across the canvas to Jin's feet. "Take it. Take it and get out of my building." `ev_sal_notebook` ★. No `ev_ray_statement`.
- Either way, Ray's open gym bag shows his appearance schedule (`ev_alder_closing` ★): "Alder Commons · Closing Fri May 9, 1997, 10:00, Ashgrove Tower 30F · Site to be delivered vacant · Community partner: NCC · Celebrity ambassador: R. Castell (TBC) / alternative under discussion." Jin's thought: "'Alternative under discussion.'"

**S8.8 No restoration.** Ray is helped out down the tunnel by Sal (stopped: leaning on him; continued: Sal half-carrying him). The arena is empty. Jin sits on the stool in the blue corner (the player can stand up whenever they want; the camera waits).
- The camera eases out slowly from 1.2 to 0.6 until the ring is a small white square in a black building. One ring light clicks off on its timer.
- Thoughts, one per press: "I thought it would sound like something." / "Umma's still dead. Min's still dead." / "Two and a half years are still gone." / "My hands are shaking." (They are: a cosmetic tremor on Jin's idle pose for the rest of the night; his walk has the Ch1 limp again, `limp 0.25`, until the next sleep. The fight was short and desperate; this is what it cost.)
- If Teddy is here, he sits on the apron below the stool and says nothing for a while. Then: "Come on. I'll drive." (stopped) / "...Come on. I'll drive. We'll talk about it some other year." (continued)
- **Payphone in the concourse** (`q8_hana_call`): Hana, half asleep: "Jin? It's two in the morning." Jin: "It's done. Ray." Hana: "Are you hurt?" Jin (stopped): "No. He is. I stopped." / (continued): "...I didn't stop." Hana (stopped): "Okay. Okay. Go home. Call me tomorrow." / (continued): a long silence. "Go home, Jin." (`hana` +1 for calling; `hana` −1 separately if `continued`, as the registry states.)
- **No combat after this.** The guards, if any are still standing, are gone.

**S8.9 Dawn: the copy run (activity) and the envelopes.** A payphone at 4:10 am. Dot: "You call me at four in the morning, it better be for Min." Jin: "It's for Min." Dot: "...I'll be there at five."
- **Kwik Copy.** Dot unlocks in a coat over her pajamas; the lights come on one row at a time. **Copy activity:** the player feeds pages (each evidence item becomes a sheet; the copier's light bar sweeps; a satisfying stack grows on the tray). Jin's thoughts run over the sheets as they copy, one per claim. Dot staples. On Min's cubby she has put a coffee for Jin.
- **The envelopes (`copy_holder_*`).** A table of manila envelopes; the player writes a name on each from the list of people who would keep one. Eligible names appear only if they qualify; ineligible people are not shown (the hidden-option rule), and the list is honest about why someone isn't there only in Jin's thought ("Lenny ran. Lenny won't keep anything for me."):
  - **Hana** (always; pre-written; her envelope is first).
  - **Mara** (`rel.mara ≥ 1`), **Teddy** (`rel.teddy ≥ 1`), **Lenny** (`rel.lenny ≥ 1`), **Deshawn** (`rel.deshawn ≥ 1`), **Roz** (`ch4_roz == let_go`: her postcard c/o Teddy gave her sister's address in Millport), **Asher** (`ch6_asher_method == patient`), **Dot** (always offered: "Me? ...Yeah. Give me one. I'll put it in Min's cubby.").
  - The player can make as many envelopes as there are names; more holders means a faster, wider exposure in Ending Two's epilogue. Fewer is allowed.
- **The delivery walk (optional except Hana).** The HUD: "Get the envelopes to people who'll keep them." Each is a short scene at that person's place, one line each, while the city wakes up:
  - Hana, St. Agnes staff door, 7 am shift change: "I'll keep it at my mother's. She keeps everything. She has my baby teeth." (`hana` holder.)
  - Mara, the Courts' workshop, at the vise: she reads the first page standing up, then puts the envelope in the pay tin and closes the lid. "Safest place in Northside. Nobody's ever wanted what's in there."
  - Teddy, Iron Pulse: tapes it under the ring apron. "Thirty years I hid cigarettes there."
  - Lenny, the pinsetter loft at Starlite (if patient): "I'll say it again. To a lawyer, a judge, whoever. Just don't make me say it to you twice."
  - Deshawn, the Cellar: puts it in his Bible. "Good book. Lot of evidence in it already."
  - Roz: a blue mailbox on Market Street (mailed; her reply arrives in Ch9 as a postcard: "Got it. Sister says I'm crazy. I'm keeping it.").
  - Asher, Garrison Suds: folds the envelope into a pillowcase without looking at it. "In case."
  - Dot keeps hers in Min's cubby.

## Encounters
**E8.1 The approach** (no tips; mastery; checkpoints at the dock door and at the tunnel mouth).
- **Friday version (abandoned):** dock: 1 `guard` (an old night man who, after one exchange, sits down on his chair and says "I'm sixty-four. Go on."); concourse: 1 `boxer` (Ray's sparring partner Tito, leaving late with his bag; he fights because he thinks Jin is a robber, and stops when he recognises him: "You're — oh. Oh. I'm not in this, man."). Two minutes of combat at most.
- **Sunday version (kept):** dock: 2 `guard`; concourse: 2 `guard` + **`director`** (Brezinski, the promoter's head of security, on a radio; nearby guards attack faster while he talks; hit him first); press-room corridor: 1 `boxer` (Tito) + 1 `guard`. About four minutes. The cost of keeping the promise is real and stated.
- Guards have batons (`guard`: long arc, not slippable, backdash it); the director stays back near the press-room door.

**E8.2 Ray Castell** (`A.bout`: `ring {x0:440, x1:840}`, `opponent {type:'champion', name:'Ray Castell', opts:{patternSet:'ch8'}}`, `rounds:3`, `roundTime:60`, `allowLoss:true` (retry from round 1, line: "Again. Watch the heel."), `crowd:false`, `bell:true` (Sal), `corner:'s8_corner'`).
- **Patterns the player already knows from Chapter 0** (now readable): ① double jab then step right; ② **the right hand** after a ~0.25 s right-shoulder drop (slip it; the best counter in the game); ③ body hook → head hook (backdash, don't slip); ④ lean-back counter if Jin throws three jabs in a row.
- **New, to test mastery:** ⑤ **the feint**: the shoulder drops and a jab comes instead, then the real right a beat later. It punishes slipping on the shoulder alone. The difference is the back heel (it lifts only for the real one). Tip shown only if `rel.deshawn ≥ 1` (Deshawn's line as a HUD tip at the start of round 2: "When it's real, his back heel comes up."). Without it, Teddy (if present) says it after round 1; without either, the player has to see it. ⑥ **clinch-and-lean** when Jin's breath is under 30%: Ray closes, ties Jin up and leans, draining breath; break with a backdash on his first step or a short uppercut inside (Ray can't be launched, but the uppercut breaks the clinch).
- **Round 3:** Ray throws pattern ② twice in a row, the 1994 finish. Countering both ends it if it hasn't ended already.
- **Jin's limits:** breath recovery is 15% slower each round (round 3 audibly ragged). The fight is tuned to be won in round 2 or 3 by a player who counters; a player who trades ends up exhausted. "His speed allows him to win a short, desperate encounter" is the tuning target.
- **Ray as a boss:** poise (he doesn't flinch from jabs after the first two in a sequence), no launch loops, recovers from stagger in 0.6 s.
- **After:** S8.7 (the played choice). Then S8.8. No further combat in the chapter.

**E8.3 Lucho vs Kenny** (activity, see S8.3; Jin does not fight).

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch8_lucho_commitment` | kept / abandoned | Which night, how much security; the Armory or not | `kept`: `lucho` +2; Lucho fights beside Jin in Ending Two if `rel.lucho ≥ 2`. `abandoned`: `lucho` −2; Monday, in the Courts' gym, Lucho with a healing cut: "Kenny Shaw. Split decision. A guy from the bus garage held my bucket. Keisha cried. You weren't there." Ch9 night: Lucho is polite and nothing else. |
| `ch8_lucho_call` | stopped / sent (only if kept) | Lucho's line | Ch10 reflection before the gate: "I threw the towel for Lucho. Nobody threw it for me." / "I sent Lucho out. He said his legs were gone. I knew." Ending Two teaching vignette: Lucho tells the kids about it (either version). |
| `ch8_hands` | wraps / knuckles | Power and counter numbers; Ray's and Teddy's lines | Ending Two: the knuckles are on the Monarch windowsill (knuckles) or in the river (wraps; the player sees Jin drop them off the river path in S8 dawn if `wraps`, a small optional interaction on the bridge: "[Drop them.]"/"[Keep them.]", no flag beyond the epilogue prop). |
| `ch8_ray_after` | stopped / continued (played) | Ray's statement or Sal's anger; `harm_count` +1 if continued | Teddy (−1 if continued), Hana (−1), Mara (−1), Deshawn and Lucho lines; Ch9 Penner ("You stopped. Interesting." / "You didn't stop. Good. Neither do we."); Ending Two: stopped → Ray sends a typed statement to the Athletic Commission; continued → Ray's camp closes ranks and Sal's notebook is the only account from that corner. |
| `copy_holder_*` | bool each | Envelopes | Ch9 Penner names them aloud; Ending Two epilogue texture (how fast and how wide the exposure goes). |

## Chapter ending and state handed on
- **Ending beat.** After the last delivery the player chooses (or Hana's alone, if that's all), the river path in the late morning: green on the willows, the river high with melt. Jin stops at the rail. Across the water, Ashgrove Tower. He takes out Sal's notebook and the closing memo, one in each hand. Thought: "Penner. Ashgrove. Friday, May ninth, ten o'clock." Then: "'Alternative under discussion.'"
- A short cut to Sunny's a few days later (no control, 8 s): Augie's TV: "Champion Ray Castell has withdrawn from his May seventeenth title defense, citing [a hand injury (continued) / personal reasons (stopped)]." Augie: "Huh. Castell pulled out." He looks at Jin's hands. He doesn't say anything else.
- Card: "May. Ashgrove Tower."
- Completion screen: "Choices made: [You kept your promise to Lucho. / You went after Ray instead of working Lucho's corner.] [You threw the towel for Lucho. / You sent Lucho back out.] [You fought Ray with taped hands. / You fought Ray with the knuckles.] [You stopped when Ray couldn't defend himself. / You kept hitting Ray after he was down.] Envelopes: [names]."
- Handed to Ch9: `ev_sal_notebook` ★, `ev_alder_closing` ★, `ev_ray_statement` (opt.); copy holders; `harm_count`, `jin_voice` final except for Ch9's Owen; `rel.*`; the Civic closed again ("CASTELL DEFENSE POSTPONED" banner); Ashgrove Tower inked on the map.

---
# Chapter 9 — The Offer

**Chapter card:** "The Offer" · "Ashgrove Tower · May 6–8, 1997"

## Date, mood, palette, weather
- Tuesday, May 6, 1997, 8:10 pm to 10:40 pm: the tower. Wednesday May 7 and Thursday May 8: **the consideration days**, free roam, as long as the player likes. The chapter ends when the player chooses to sleep on Thursday night.
- Mood: cold, clean, airless in the tower; then the warmest, saddest free-roam in the game, because everyone Jin meets is someone the player made (or didn't make) a relationship with.
- Palette: the tower is the anti-Eastgate: pale granite, white marble, brushed steel, clear glass, gray carpet, cool white light with no warmth anywhere; the only warm colour on 30F is the city itself through the glass, a field of amber windows far below. Outside the tower, the city is in full spring: green on Kessler, open windows, a ballgame on every radio.
- Weather: Tuesday clear and windy (the tower hums in the wind at the top); Wednesday warm; Thursday rain in the evening, clearing after midnight.

## Gameplay identity
**Climb to the people who decide, then be given the decision.** A vertical assault through spaces that have never seen a fight (security in blazers, glass, carpet, an elevator car), a frightened analyst who can be talked to or used, a boardroom where the player is offered everything and is allowed to ask anything, and then two days to walk around Calder and hear what everybody thinks without any of them deciding for him.
- Exploration 25% · dialogue 35% · investigation 5% · combat 30% · activities 5%.
- Target length: 22–25 minutes (tower 12, consideration 10+ at the player's pace).

## Locations
| id | Name | Size | Layout (left → right; layers) | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `ash_plaza` | Ashgrove Plaza | 1200 × 420, exterior | Route 9 stop → a dry fountain → a bronze statue "THE WORKER" (a foundry man with a ladle, commissioned by Ashgrove Capital, 1991) → the tower's revolving doors | The plaque on the statue: "In honor of the men and women who built Calder. — Ashgrove Capital". Jin's thought: "They bought a statue of Mara's father." | Uplights on the granite; wind; the fountain's empty basin | Bus stop (map), lobby |
| `ash_lobby` | Lobby | 1400 × 540 (mezzanine at y 300) | Revolving door → **security desk** (two guards, monitors) → turnstiles → elevator bank (keycard after 7 pm: "After hours: authorized cards only") → **freight corridor** behind a steel door → mezzanine with the tower model in a case | A Calder Ledger rack: "ASHGROOVE TO BRING 'ALDER COMMONS' TO SOUTHBANK — 400 UNITS, RETAIL". A press-conference podium stored against a wall: it will be used in Ending One. | Cool white, the lobby echo, a floor polisher somewhere | Plaza, freight corridor → `ash_security`, elevators (card) |
| `ash_security` | Security level and freight elevator | 900 × 360 + the **freight car** (a 160 × 120 box that rises through a lit shaft) | Monitor room (every floor on a wall of screens, including 22 and 30) → locker room → the freight elevator | On one monitor: a man in a camel coat walking down a 30F corridor, then gone. | Monitor glow, the elevator's motor | Lobby, freight car → `ash_floor22` |
| `ash_floor22` | 22F, Acquisitions | 1600 × 360 | Freight lobby → **cubicles** (grey partitions, the hum of a printer) → Owen Tully's cubicle (lamp on, a cold coffee) → the **project room** ("ALDER — DELIVERY DAY 5/9 — T-3" on a whiteboard; a fax machine spitting pages) → copier alcove → stairwell door | The whiteboard has the plan as bullet points: "· NCC letter (pending — W.R.) · ambassador (Castell out — alt.) · HS crew x 12 · Ch. 8 at 9:00 · voluntary surrender forms x 24". A child's drawing on Owen's partition: "DADDY'S OFFICE IS IN THE SKY". | Fluorescent, half the floor dark; the fax; the building's air hum | Freight, stairwell |
| `ash_stairwell` | Fire stairwell 22–30 | 360 × 1440 (eight flights; landings every 180 px; the camera follows vertically) | Switchback flights with landings; floor numbers stencilled; a fire hose cabinet on 26; a door to each floor (locked except 30) | Somebody's cigarette break spot on 27: a coffee can of butts, the same as the Civic stairwell. | Emergency lighting, red-white; the stairwell's echo amplifies every footstep and radio | 22, 30 |
| `ash_floor30` | 30F, executive corridor | 1800 × 360 | Stair door → **reception** (empty desk, an orchid) → a glass-walled corridor with the city on the left → art on the right (abstract canvases in beige) → the security chief's post → **boardroom doors** (double, frosted glass, "A") | Every surface clean. A cleaning cart left mid-corridor with a radio playing Korean news on 1490 AM, quietly: the night cleaner, Mrs. Paik, who nods to Jin and keeps vacuuming. (The one person on 30F who goes home to Eastgate.) | Cool white; the city glow; the vacuum | Stairwell, boardroom |
| `ash_boardroom` | Boardroom | 1100 × 360 | Doors → the long table (twelve chairs) → **Celeste Ashgrove** at the far end → **Lyle Penner** standing by a glass case with the architectural model of **Alder Commons** → floor-to-ceiling windows: the river, Southbank, and the actual Alder Row as a row of small lit windows → **the man in the camel coat** at the window, back to the room | The model: towers where the rowhouses are; the co-op's community garden replaced by "PLAZA". A folder on the table, "SEO, J.", with photographs: Jin carrying a radiator at the Courts; Jin on the Starlite snow bank; Jin at Sunny's. Carrow's handwriting in the margins. | Recessed light over the table only; the windows bright with the city | Doors |

Consideration days use existing locations: `stagnes_lobby`, `iron_pulse`, the **Hollow Tap** (a bar on Kessler, `hollow_tap`, 640 × 360: a long bar, a TV, a jukebox; Teddy's stool), `courts_yard`, `courts_workshop`, `rook_office`, `okafor_3a`, `cemetery_s14`, `cellar`, `kwik_copy`, `sunnys`, `river_path`, the rest point.

## NPCs present
| id | Where / idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|
| `voigt` | **Greta Voigt**, 48, director of security: gray suit, earpiece, a radio; on 30F | (radio) "All posts, he's in the freight car. Hold him on twenty-two." / when reached: "I'm salaried. I'm not going to get hurt for salary. They're expecting you anyway." | "Posts, report." | — |
| `owen` | **Owen Tully** (cast), 22F, at his cubicle, tie loosened, printing | See S9.3 | — | `ch9_owen` |
| `mrs_paik` | Night cleaner, 30F | (in Korean, then English) "Late. Everybody's late tonight." | — | Ending One: she's cleaning the lobby during the press conference |
| `celeste` | Seated at the end of the boardroom table | See S9.5 | — | Flags (only the ones that happened) |
| `penner` | Standing by the model, clicking a fountain pen | See S9.5 | — | Flags |
| `coat` | At the boardroom window, hands clasped behind his back | "I did tell you to take the money." | — | — |
| consideration cast | See S9.6 | — | — | Relationships and flags |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `o_worker_statue` | Statue | "'In honor of the men and women who built Calder.' They bought a statue of Mara's father." | — |
| `o_ledger_rack` | Newspaper rack | "'Ashgrove to bring Alder Commons to Southbank.' Four hundred units. Retail." | — |
| `o_monitors` | Monitor wall | "Every floor. Twenty-two has a light on. Thirty has a man in a long coat." | — |
| `o_whiteboard_alder` | Whiteboard (22F) | The plan, as above. Thought: "'Ambassador — Castell out — alt.' The alternative." | Journal note |
| `o_owen_drawing` | Child's drawing | "'Daddy's office is in the sky.'" | — |
| `o_fax` | Fax machine | "A fax from Harlan Freight: 'Crew confirmed 12 men + 2 vans, 5:30 a.m. pickup Kessler & 5th.'" | Journal note (the van) |
| `o_model` | Alder Commons model | "Towers where the houses are. The garden is a plaza now. Somebody made tiny trees." | — |
| `o_folder_seo` | Folder "SEO, J." | Photo viewer: Carrow's surveillance shots, with his notes ("Courts — carries for the Polish woman — no visitors — Sunny's most nights"). Thought: "They've been watching me since March." | — |
| `o_offer` | The offer | Document: `ev_offer_terms` ★ | `ev_offer_terms` ★ |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q9_main` | main | "Ashgrove Tower. Thirtieth floor." → "Get past the lobby." → "Twenty-two." → [persuaded: "The stairs. Eight floors."] / [threatened: "Owen's card. The elevator."] → "The boardroom." → (offer; HUD hidden) → "You have until Friday morning." → (consideration: no objective text other than this one line, which never changes or counts down) → "Sleep when you're ready." | Tower cleared; offer received; the player chooses to sleep on Thursday night | `ev_offer_terms` ★; the van at 5:30 |
| `q9_visits` | side (non-binding) | Not shown as a list. Each person Jin could visit has the `…` marker over them on the world map | Any visit | `ch9_night_visits` |

## Scripted scenes, beat by beat
**S9.1 The plaza (Tuesday, 8:10 pm).** Chapter card over Jin's notebook: "Penner. Ashgrove. 30F." Wide shot from the dry fountain looking up the tower (the camera tilts up the full height, 3 s, until the boardroom's lit windows are a strip at the top of frame). Thought: "Thirty floors. The neighborhoods are all below it."

**S9.2 Lobby → security level → freight car.** See E9.1. The freight elevator is the route up (the passenger elevators need a card). The **elevator fight** happens in the moving car.

**S9.3 22F: Owen Tully (Q2: threaten a frightened witness to save time?).** The car stops at 22 ("The freight car only goes to twenty-two after nine." The panel says so). Owen is at his cubicle, printing. He stands up so fast his chair rolls into the partition. He has a stapler in his hand like it's a weapon, then realises, and puts it down.
- Owen: "I'm an analyst. I'm a junior analyst. I make spreadsheets."
- Jin: "Alder Row. What is it?"
- Owen (looking at the project room): "It's a co-op. Twenty-four families. It's a spreadsheet. It's — I built the relocation model. I hate it. I built it anyway."
- **Choice `ch9_owen`:**
  - "[Sit on the edge of his desk. Let him explain it.]" → `persuaded`. Owen explains the model while it prints (`ev_relocation_model`: "Alder Row Cooperative — 24 households, 61 residents. Eminent-domain route: 14–20 months, $520,000. 'Voluntary surrender' route (on-site community pressure + NCC endorsement + public ambassador): 1 day, $110,000. Ambassador: J. Seo (pending)."). A guard patrol passes the cubicles halfway through; the player presses DOWN to crouch behind the partition with Owen (a 6-second hide; failing it just means a 2-guard fight in the cubicles, E9.2b). Owen won't give his keycard: "It logs my name. They'll know. I have a kid." He points at the stairwell: "Eight floors. They'll come down to meet you. I'm sorry." Slower: the stairwell gauntlet (E9.3).
  - "[Take his keycard. Now.]" → `threatened`. Jin closes the distance; Owen flinches into the partition (`cower`). "Take it! Take it! It's on the lanyard!" Jin takes the card; the passenger elevator goes straight to 30. Faster: the stairwell gauntlet is skipped. No relocation model. `harm_count` +1. **And Owen pays for it:** in the boardroom Penner says so (S9.5).
- Jin's thought, either way: "'Ambassador: J. Seo, pending.' They already wrote my name in."

**S9.4 30F.** The corridor of glass. Mrs. Paik vacuuming with 1490 AM on her cart's radio: the Korean program Umma listened to on Sunday mornings (Ch0's cast bible). Jin stops for one beat (the camera does too). Mrs. Paik nods and keeps vacuuming. Greta Voigt at her post with two guards (E9.4). When they're down, Voigt holds up her hands: "I'm salaried. I'm not going to get hurt for salary." She touches her earpiece: "He's here, Ms. Ashgrove." A pause. "...They're expecting you anyway." She opens the boardroom doors for him.

**S9.5 The boardroom: the offer.** Letterbox on. The HUD hides. The camera starts wide (0.8): the table's length between Jin at the door and Celeste at the far end, the city behind her, the man in the camel coat at the window with his back to the room. Penner by the model.
- Celeste: "Mr. Seo. Sit wherever you like. Nobody in this room has ever hit anyone. That's rather the point."
- Penner (clicking his pen, cheerful): "Lyle Penner. We spoke once, in a manner of speaking. I said one word on a telephone in August of '94. I'm told you heard the result."
- **They have followed his progress.** Penner opens the folder "SEO, J." and reads from it, choosing only lines that happened (each is conditional; a player with none of them hears the restraint line instead):
  - Always: "'I'm not for sale.'" / "'My mother's in section eight. Tell your people to watch.'" / "'Move. I've got a fight.'" (`ch0_refusal_line`, word for word.) "You said that on a stairwell. We liked you for it."
  - `ch1_fare_source == activities_jar`: "Six dollars and forty cents from a bingo jar. Even the bingo money. We're not so different."
  - `ch3_deshawn_dive == accepted`: "You let a man lose to you for money. You've taken a gift before."
  - `cellar_dives_taken > 0`: "You went down in a bowling-alley basement for Mo Feeney. [Once / Twice.] For a hundred and fifty dollars a time. We're offering a little more."
  - `ch4_took_profit`: Celeste: "You took six hundred dollars of ours, Mr. Seo. Consider it an advance."
  - `ch4_envelope == taken` and outcome not `confessed`/`returned_anon`: "Eighteen hundred and forty dollars of other people's wages. You understood the deal before we offered it."
  - `ch5_took_unit_4d` and not `ch6_gave_back_4d`: "And an apartment promised to a woman with three children. You slept fine, I hope."
  - `ch6_asher_method == threatened`: "You frightened an old man in a laundromat. Efficient."
  - `ch9_owen == threatened`: "Mr. Tully's card opened our elevator at nine-fourteen. He'll be clearing his desk in the morning. That was you, not us. You see how quickly it becomes nobody's fault?"
  - `ch8_ray_after`: stopped: "You stopped, with Castell. Interesting." / continued: "You didn't stop, with Castell. Good. Neither do we."
  - Money over $1,000: "You've been careful with money. Careful men take good offers."
  - **If the player took nothing and hurt nobody who didn't swing first** (`take_count == 0` and `harm_count == 0`): Penner closes the folder. "You've been remarkably careful not to take anything that wasn't yours. I admire it. It's expensive."
- **The offer.** Penner slides a bound document down the table; it stops in front of Jin. The document viewer opens (`ev_offer_terms` ★) and stays open until the player closes it:
  > **Treatment:** the full 18-month neuro-rehabilitation program, Boston, all costs.
  > **Housing:** furnished two-bedroom apartment, Riverside.
  > **Income:** $4,000 per month for 36 months.
  > **Identity:** public restoration as Jin Seo; press conference arranged.
  > **Career:** managed return; six bouts; title opportunity guaranteed.
  > **Condition:** participation in the Alder Row delivery, Friday May 9, and public support of Alder Commons.
- Thought (always): "Eighty-four thousand. Whitlow's number. It's the first line." (The price stated in Chapter 1, the one ordinary money could never reach, is the first thing they offer.)
- **Questions (a menu; ask any or all, in any order; each is answered honestly; none is a trap).** This is the "time to consider" inside the room.
  - "Is the treatment real?" Penner: "The Beacon Street Institute's program in Boston. The same one Dr. Whitlow trained in, as it happens. You won't be what you were. You'll be a great deal more than you are." (True. Hana confirms it on Wednesday.)
  - "What happens to the people on Alder Row?" Penner: "Twenty-four households. A hundred and ten thousand in relocation assistance, split among them. Some go to family. Some find something. A few will have a hard year." Celeste: "People move every day in this city, Mr. Seo. Usually nobody gives them anything."
  - "Why me?" Penner: "Castell was going to be our face. He's withdrawn. A comeback is a better story than a defense. The man who was wronged, standing with the future. People believe a scar."
  - "What do you need me to do on Friday?" Penner: "Stand in front. Walk in first. Open the gate if they've locked it, and they will have. Sign nothing; just be seen. Channel 8 is at nine."
  - "What if I say no?" Celeste: "Then you leave, and we close later, slower, through the courts. It costs us four hundred thousand dollars and a year. And you'll be exactly where you are. We don't threaten people, Mr. Seo. We've never needed to."
  - "What happened to the rest of my money? The two million." Celeste: "Distributed. Some of it built a parking structure. Some of it is in this table. Some of it bought a roof in Northside." (Not fraud: the Courts' roof is real; she says so as a fact.)
  - "I've got copies. People are holding them." Penner names them, from the folder: "Ms. Lim at St. Agnes. [Ms. Kowalski at the Courts.] [A Mr. Marsh.] [Mr. Voss, God help us.] [Mr. Pryor.] [Mrs. Kaminski in Millport.] [Mr. Asher.] [A Ms. Pham at a copy shop.]" Celeste: "Exposure is possible. I won't insult you by saying it isn't. It's slow. It's expensive. It needs a lot of people to keep being brave for a long time, and you'd have to be one of them, and you'd be poor while you did it. Expose us, and in three years a judge fines a holding company. Accept, and in three years you're champion of the world. Both are true. Choose which one you'd like to live in." (The PDF: exposure is possible but requires rejecting the deal and cooperating with others; one more fight won't solve the system.)
- **The man in the camel coat** turns from the window only once, when Jin stands to leave. He adjusts a cuff. "I did tell you to take the money." He turns back to the window.
- **The terms of the decision.** Penner: "No answer tonight. We're not animals. Friday, five-thirty in the morning, Kessler and Fifth. There'll be a van. If you're on the curb, you're with us. If you're not, you're not, and we'll never speak again." He smiles. "Kessler and Fifth. You know the corner."
- Voigt walks him to the elevator. On the way down (the passenger car, no fight), the guards he beat are standing in the lobby with ice packs. They step aside. Letterbox off. The HUD returns with one line that never changes: **"You have until Friday morning."**

**S9.6 Consideration (Wednesday and Thursday; free roam; no timer).** The world map opens. Every person below has a `…` marker on the map; the player can visit any, all, or none; each visit is a perspective, not an argument the game wants won. Nothing in this section changes which ending is available. `ch9_night_visits` records who was visited (for the completion screen and a few epilogue props only).
- **Hana** (St. Agnes, the staff door at the end of her shift, Wednesday 7 pm): "I called Boston today. On my lunch. The program's real, Jin. Whitlow trained there. It works. Not all the way. But it works." A beat. "I won't tell you what to do. Everyone's been deciding for you. I'm not going to be one more." (`ch6_hana_repaid`: "You paid me back. Nobody pays me back." / `ch8_ray_after == continued`: "I keep thinking about the phone call. You said 'I didn't stop.' I believed you.")
- **Teddy** (the Hollow Tap, Thursday afternoon; Jin can buy him a round for $3): "I sent you out once for a title. Don't let me tell you anything about titles." Then, after a long time looking at the TV: "I'd take it. I'm a coward and I'd take it. Don't listen to me."
- **Mara** (the workshop, Wednesday): she keeps working while she talks. "Twenty-four families. That's one of my buildings. One stairwell." / (if `ch5_left_repair`): "You went in Nell's office while I was on my knees in front of a boiler. I remember. I also remember you came back." / "I'm not going to tell you. I'd hate you a bit either way."
- **Rook** (Council HQ, his office, lights off; he speaks only if Jin knocks): "They asked me for a letter. They asked you for your face. Same price list." (`ch7_hit_rook`: "My lip's healed. I'd have let you do it twice." / else: "You didn't hit me. I've been trying to decide all month whether that was mercy or contempt.") "I didn't sign it. Dutch's people say the roof money's done. Nell's finding a bank that lends to tenants. We'll be cold for a year." Then: "I'm going to tell you not to do it, and you're going to think about who's saying it. That's fair."
- **The Courts** (Wednesday evening). If `ch7_truth_told_by == rook`: a vigil for Umma and Min in the yard, candles in jam jars on the garden beds, Nell's idea; Ada and Gus sit with Jin if he sits. Gus quotes `ch7_rook_answer` back: "Walter told us you said [you don't know what you'd have said]. That's the most honest thing anybody's said about any of this." If `jin`: ordinary laundry on the lines, the residents divided; some nod to Jin, Darnell doesn't. Keisha, either way: "Lucho says you're going away. Are you going away?"
- **Lucho** (the gym): warm if `ch8_lucho_commitment == kept` ("Whatever you do Friday, you were in my corner."), polite if not ("Good luck, man.").
- **Mrs. Okafor** (3A; her light is on): if `ch6_okafor_photo`, the cake photo is framed on her TV. "Your mother would ask me what I think, and then do what she wanted. So I'll tell you what I think: I think you should eat something." She feeds him.
- **The cemetery** (Section 14): the flowers are there if he left them, and someone else's beside them now (St. Columba's). A sit spot. Thought: "Umma would take the money. She'd take it and feel terrible and send half of it to church." Then: "Min wouldn't. Min would photograph the gate."
- **Deshawn** (the Cellar): "Everybody down here would take it. I'd take it. That's why I'm down here."
- **Mo Feeney** (the Cellar, cigar): "Heard you got an offer from up the hill. Kid. Finally being smart."
- **Dot** (Kwik Copy): "Min's envelope's still in her cubby. In case you were wondering. It's not going anywhere."
- **Alone**: the river path at night; Alder Row is visible across the water as a short row of lit windows (it is not on the map and cannot be visited: Jin's thought when the player tries the map: "Southbank. I've never been. I don't know anyone there."). Thought: "Twenty-four windows. I don't know a single name."
- **Sleep.** At the rest point, the evidence wall shows the offer pinned in the middle of everything. The player sleeps when ready. Thought before sleep, by `jin_voice`: restrained: "Friday." / mixed: "Friday. Whatever I am by Friday." / hard: "Friday. They think they know what I'll do. They've been reading the same folder I have."

## Encounters
**E9.1 Lobby and security level** (checkpoint at the revolving door). 3 `guard` (corporate security in navy blazers, batons: the long, unslippable arc; backdash it) at the turnstiles. Clean floor, no cover. Then 2 `guard` in the monitor room. Teaches nothing new; tests spacing against batons in an open, bright room.

**E9.2 The freight car** (checkpoint at the car door). A 160 × 120 box rising through the shaft with the doors opening at 12 and 17 to let a guard in each time (2 at once at most). `maxAttackers: 2`, no room to dash: uppercut, hook and slip in a phone booth. The shaft lights strobe past the car's grille.
- **E9.2b** (only if the hide fails on 22): 2 `guard` among the cubicles.

**E9.3 The stairwell gauntlet** (only if `ch9_owen == persuaded`; checkpoints at 24, 27, 30). A vertical climb, landing by landing: 2 `guard` on 24, a `guard` + `director` (a shift supervisor with a radio) on 27 (hit the supervisor first), 2 `guard` coming down from 29. Stairs are one-way platforms; air dash from flight to flight; knocking a guard down a flight takes him out of the fight.

**E9.4 30F corridor** (checkpoint at the stair door): 2 `guard` + **Greta Voigt** (`director`; she never throws a punch; while her radio is live, nearby guards attack 30% faster; reaching her ends the fight: she surrenders). Glass walls; the city on the left.

No combat after the boardroom. Nothing in the consideration days is hostile.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch9_owen` | persuaded / threatened | `ev_relocation_model` + the stairwell / the keycard + skip | `threatened`: Penner's line about Owen's desk; `harm_count` +1; Ending Two epilogue: "Owen Tully was let go on May 7. He did not testify." / `persuaded`: Ending Two epilogue: "Owen Tully testified for two days. His daughter drew the courthouse." Ending One: the administrative report is Owen's model with the actual numbers filled in. |
| `ch9_night_visits` | list of ids | — | Completion screen lists who Jin saw; small props in the endings (Teddy's beer mat in Ending One's apartment; Mrs. Okafor's leftovers in a container in Ending Two's room). |
| (question menu) | — | — | None. Asking or not asking changes nothing; it only informs. |

## Chapter ending and state handed on
- **Ending beat (Friday, May 9, 5:10 am).** No card first: the alarm clock at the rest point (5:00), the player gets up. Walking out is the only thing to do; the map is closed ("Not now."). Kessler and Fifth before dawn: the **poster wall** (Ch0: fresh paste; Ch2: buried; now a new layer, "ALDER COMMONS — CALDER'S FUTURE — ASHGROVE CAPITAL", over everything), the **Route 9 bus shelter** where Umma waited with two umbrellas. Jin stands under the streetlight. If the player presses nothing, he leans on the wall, hands in his pockets, one knee bent: the game's key image, now at 5:28 in the morning.
- 5:30: a **gray panel van** turns onto Kessler, headlights on (the Ch2 van's twin; same model, same color). Carrow at the wheel. The side door slides open: Dutch on the bench in his pea coat (with a bandaged hand if `ch4_dutch_after == kept_going`), Benny (if `let_go`, he nods; if `hit_again`, he looks away), Slim in a hoodie with his gym bag on his knees ("I needed the money, man. Two hundred for a morning."), and five more men Jin doesn't know.
- Carrow: "Morning, champ. Get in."
- The player presses E on the van door. (Getting in is canon: Jin arrives at Alder Row with the enforcers. The decision is at the gate, and Jin's thought says so: "I'll decide when I see it. They'll have to show me.")
- The door slides shut. Black. Card: **"Somebody Else's Home."**
- Completion screen: "Choices made: [You listened to Owen Tully. / You took Owen Tully's card.] You read the offer. You had until Friday morning. You saw: [names]."
- Handed to Ch10: `ev_offer_terms`, `ev_relocation_model` (opt.); every flag; `support_at_alder` is computed now (see Ch10) but nothing is shown.

---
# Chapter 10 — Somebody Else's Home

**Chapter card:** "Somebody Else's Home" · "Alder Row, Southbank · Friday, May 9, 1997"

## Date, mood, palette, weather
- Friday, May 9, 1997. The van arrives at 5:55 am; first light at 5:40, sunrise at 5:52; the co-op's emergency meeting on the steps at 6:00; Channel 8 is booked for 9:00. **There is no clock on screen and nothing happens on its own.** Carrow says so: "We go when the ambassador's ready. Mr. Penner's orders." The sun rises slowly behind the row whatever the player does; nothing else moves until the gate.
- Mood: ordinary morning in a stranger's street, with men unloading bolt cutters at one end of it. Then either a quiet, purposeful wrongness, or the last fight in the game.
- Palette: Southbank is older and lower than anywhere else: two-story red brick rowhouses with white-painted stoops, window boxes with geraniums, a green iron gate into the co-op's inner garden, a corner shop with a striped awning. Dawn is pink-gray over the river, then gold on the brick; the vans are the only gray things on the street. Across the river: the whole city, Ashgrove Tower catching the sun first.
- Weather: clear, cool, still. Dew on the garden beds; breath visible until 7.

## Gameplay identity
**Meet the people it would cost, then choose where the cost falls.** A short, slow exploration of a street full of people Jin doesn't know, doing ordinary things under pressure (closing a shop, dragging a mattress, arguing on a stoop), in which the player can learn names or not. Then the gate. After it, one of two endings: a playable clearance that is uncomfortable on purpose and then the rewards over time; or the final fight beside whoever the campaign left him, and then an ordinary, poorer life.
- Pre-choice: exploration 45% · dialogue 50% · activity 5% (carrying the mattress). About 8 minutes at a natural pace; as long as the player likes.
- Ending One: clearance 6 min (no real combat; one restraint), epilogue 6 min with one playable round.
- Ending Two: combat 8 min (three waves), epilogue 7 min with one playable walk.
- Target length: 20–25 minutes either way.

## Locations
| id | Name | Size | Layout (left → right; layers) | Props and storytelling | Light / sound | Exits |
|---|---|---|---|---|---|---|
| `alder_street` | Alder Row | 1800 × 420, exterior (stoops as one-way platforms at y 330; a few fire escapes at y 240) | Southbank Ave corner: **the two gray vans** and the crew unloading → **Alder Market** (Mr. Haile pulling the grate; a coffee urn on a card table in front) → rowhouses 1–8 with stoops (window boxes, a kid's bike, a "SUPPORT ALDER ROW CO-OP" sign in a window) → a rented moving truck, back open, half full of other people's furniture → **the gate** (green iron, between houses 12 and 13; chained from inside) → rowhouses 13–24 → the far end: a black sedan parked under a tree, engine off (the man in the camel coat) | The co-op's hand-painted sign over the gate: "ALDER ROW COOPERATIVE · EST. 1979 · 24 HOMES · ONE ROOF AT A TIME". Flyers taped to every lamppost: "MEETING 6 AM — DO NOT SIGN ANYTHING". Moving boxes on stoops labelled in marker: "KITCHEN", "BABY", "MAMA'S DISHES — CAREFUL". | Pink dawn to gold morning; birds, a radio, a baby crying in house 7, the vans' engines idling, crew voices low | (no map: the map is closed for this chapter: "Not now.") Gate → `alder_garden` |
| `alder_gate` | The gate (scene space) | 640 × 360 | Jin and Carrow on the street side; **Hollis Grant** and **Terrence** on the garden side; residents behind them on the garden path; the chain and padlock through the gate bars at chest height | The chain is new, bought yesterday; the price sticker is still on the padlock ("$6.99 — HANDY HARDWARE"). | The light comes through the gate bars in stripes | — |
| `alder_garden` | The co-op garden (behind the gate) | 1200 × 420 | Gate → brick path → **raised beds** with name stakes → Mr. Fitch's folding chair and radio → laundry lines → the back doors of houses 9–16 → a mural on the back wall painted by kids: 24 houses with 24 different colored doors | Name stakes: "FITCH — BEANS — 22 YRS", "JUNE — SUNFLOWERS (DON'T STEP)", "GRANT". Compare `courts_yard`'s "KEISHA'S TOMATOES — DO NOT STEP" (the player has seen this kind of place before, with different names). | Morning sun; the radio (a morning sports call-in show) | Gate |

## NPCs present
Residents are labelled **"Resident"** until Jin speaks to them; then their name appears in their bubble and is stored in `ch10_names_learned`. They do not need backstories (PDF); each one does one human thing.

| id | Where / idle | Key lines | Barks |
|---|---|---|---|
| `haile` | **Mr. Haile**, Alder Market, pulling the grate down two hours early, then pouring coffee from an urn on a card table for anyone who walks past, **including the crew** | "Nobody's buying milk this morning." / (handing Jin a paper cup) "Everybody's cold. Coffee doesn't pick sides." / if asked: "Twenty-two years. My wife did the books. Now I do the books badly." | "Coffee. Free. Today only." |
| `rosa` | **Rosa Medina**, house 7, dragging a crib mattress off her stoop toward the moving truck | "Help me with this or get out of the way." / after: "Thanks. ...You're with them, though. I saw you get out of the van." | "Careful, that's the baby's." |
| `hollis` | **Hollis Grant**, co-op chair, on the steps of house 12 with a clipboard, arguing | "If we lock the gate, they call it resisting. If we open it, they call it consent. Somebody tell me the third thing." | "Nobody signs anything!" |
| `terrence` | **Terrence Grant**, 19, Hollis's grandson, holding a broom handle like a bat | "You're the boxer. From the TV. You're with them?" | "Let 'em try." |
| `fitch` | **Mr. Fitch**, 80s, in a folding chair in the garden behind the gate, radio on his knee; Jin talks to him through the bars | "I was here before the co-op. I'll be here after the vans. One of those is true." | (hums) |
| `june` | **June**, 10, circling on a bike, delivering flyers to every stoop and every crew member, very seriously | "You can have one. You're not supposed to sign anything either." | "Meeting! Six o'clock! It's six o'clock!" |
| `carrow` | **Vince Carrow**, crew boss, by the vans, clipboard | See S10.2 | "Load the cutters in the first van. No, the first van." |
| `dutch` | On the first van's step in his pea coat (bandaged right hand if `ch4_dutch_after == kept_going`) | walked_away: "I collect. I don't do this." / kept_going: "You did my hand. Moira cried. She doesn't cry." | — |
| `benny` | Unloading boxes | let_go: "Morning." (He looks embarrassed to be here.) / hit_again: says nothing; his jaw clicks when he chews gum. | — |
| `slim` | Sitting in the van's open door in a gray hoodie, gym bag on his knees | "I needed the money, man. Two hundred for a morning. I didn't know it was — I didn't ask what it was." | — |
| `coat` | In the black sedan at the far end of the row, visible through the windshield; never gets out | — | — |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `o_coffee_cup` | Paper cup (from Mr. Haile) | "A paper cup. Coffee. A stranger handed it to me because I looked cold." Option: "[Drink it.]" / "[Hold it.]" (no flag; Jin's thought if he drinks: "It's coffee. It's just coffee.") | — |
| `o_flyer_june` | Flyer | "'Meeting 6 a.m. — Do not sign anything.' In a ten-year-old's handwriting, photocopied." | — |
| `o_coop_sign` | Co-op sign | "'One roof at a time.' Since 1979." | — |
| `o_boxes` | Moving boxes | "'Mama's dishes — careful.'" | — |
| `o_moving_truck` | Rented truck | "Half full of somebody's living room. They rented it themselves, to get their things out before anyone else carries them." | — |
| `o_padlock` | Padlock (gate) | "Six ninety-nine at Handy Hardware. Bought yesterday." | — |
| `o_sedan` | Black sedan | "A man in a camel coat behind the windshield. He's reading a newspaper." | — |
| `o_name_stakes` | Name stakes (visible through the gate) | "'June — sunflowers (don't step).'" | — |

## Quests
| id | Kind | HUD objective | Completion | Consequence |
|---|---|---|---|---|
| `q10_main` | main | "Alder Row." → "The gate." (shown after Carrow's briefing; nothing forces the player toward it) → [accept] "Walk in first." → "Stand where they tell you." / [refuse] "Keep them off the gate." → (epilogue; HUD hidden) | The gate choice; the ending's sequence | `ch10_choice` |
| `q10_rosa` | side (pre-choice) | "Rosa needs a hand with the mattress." | Carry activity (no punching while carrying, stated: "Hands full.") | Rosa's name; her line |

## Scripted scenes, beat by beat
**S10.1 Arrival (5:55 am).** The van door slides open. The camera starts inside the van, looking out (zoom 1.3), then lets Jin step down into a wide shot (0.85) of the whole row at dawn: the vans, the shop, the stoops, the gate, the sedan. No music. A baby crying. June ringing her bike bell. Thought: "Twenty-four doors."

**S10.2 Carrow's briefing (the consequences, stated before the choice).** Carrow, by the first van, clipboard against his chest, explains it like moving furniture:
- Carrow: "Here's the morning. You walk up first. They'll have chained the gate; they always chain the gate. You cut it. We walk in behind you. Every unit gets a form. They sign, they get forty-five hundred and a ride. Furniture to the curb. Channel 8's here at nine; you stand in front and say 'This neighborhood deserves a future.' Then you go home to Riverside."
- Jin: "And if they don't sign?"
- Carrow: "Then it takes longer and it's louder, and you're still in front." A beat. "We go when you're ready. Mr. Penner's orders. Take a walk. Get a coffee. The old guy's giving it away."
- The Journal's last claim, *What they want next*, writes itself in plain words while he talks (a badge, not a pop-up): "**Accept:** walk in first, cut the chain, help them clear Alder Row. Treatment, the apartment, the income, the comeback, my name on a poster again. **Refuse:** fight this crew. No treatment. No comeback. The envelopes go to court with the people holding them, and it takes years."
- The objective becomes "The gate." The player is free.

**S10.3 The street (free; no timer).** Everything is optional. The player can walk straight to the gate. Each resident is a short interaction; nothing is withheld if they don't:
- **Mr. Haile** pours coffee into paper cups from an urn on a card table, for residents and crew alike. He hands one to Jin without asking who he is. "Everybody's cold. Coffee doesn't pick sides." The **cup** (`o_coffee_cup`): the game's motif closes here. In Chapter 0 a paper cup was handed to Jin to take his choice away. This one is just coffee, given by a stranger who wants nothing. Jin holds it for as long as the player wants; drinking it is a single E press and changes nothing. Thought: "It's coffee. It's just coffee."
- **Rosa Medina** (`q10_rosa`): Jin can take one end of the crib mattress. Carry activity across the street to the moving truck (punching disabled while carrying; the HUD says "Hands full."). Rosa: "Thanks. ...You're with them, though. I saw you get out of the van." No choice; it's just true.
- **Hollis and Terrence** arguing on the steps of house 12: Hollis: "They want us to swing first, Terrence. Then it's a riot on Channel 8 and nobody remembers why." Terrence: "So we just watch?" Rosa, passing with a box: "I've got a baby. I'm not standing in front of anything." (The PDF: residents arguing about whether resistance will make things worse.) If Jin approaches, Terrence: "You're the boxer. From the TV. You're with them?" Jin can answer "I came in their van." (no flag) or say nothing.
- **Mr. Fitch** through the gate bars, in his folding chair among the beans: "I was here before the co-op. I'll be here after the vans. One of those is true."
- **June** gives Jin a flyer: "You can have one. You're not supposed to sign anything either."
- **The crew:** Slim on the van step ("I didn't ask what it was."), Benny unloading, Dutch on the step. Talking to Dutch: walked_away: "I collect. I don't do this." He doesn't say what he'll do. / kept_going: "You did my hand. Moira cried. She doesn't cry."
- **The sedan:** the man in the camel coat reading a newspaper behind the windshield. Examine only. He doesn't look up.
- The player can also sit (a stoop at the empty house 19, which has a "SOLD" sticker from an earlier sale: someone has already gone). Thought: "Somebody already left. Took the money. I don't blame them."

**S10.4 The gate (the choice).** When Jin walks up to the gate, Carrow comes up the street with the bolt cutters (red handles) and holds them out handle-first. Letterbox on. The camera settles into a fixed two-sided frame at 1.0: Carrow and the crew on the left, the residents behind the bars on the right (Hollis in front with his clipboard, Terrence with the broom handle, Rosa at the back with the baby, Mr. Fitch's chair, June on her bike), Jin in the middle with the chain at chest height between him and them. The sun comes up behind the row, slowly; it's the only thing that moves.
- Jin takes the cutters (he must take them; holding them is not the choice). The chain is in front of him. Thought (fixed): "Lindell's chain kept them in. This one keeps us out."
- **Jin's last thoughts** play one per press, built only from what the player actually did (nothing invented; nothing the player didn't do is said):
  1. `ch0_refusal_line`: "'I'm not for sale.' I said that on a stairwell." / "'My mother's in section eight.' She was." / "'Move. I've got a fight.' I did."
  2. Taking (`take_count`): 0: "I never took anything that wasn't mine. It was always small things. It was always easy to leave them." / ≥ 1: "I took [the bingo jar / Mara's payroll / the Vasquez family's apartment / Mo's money for going down]. Small. It was always small."
  3. Hurting (`jin_voice`): restrained: "I never hit anyone who was already down." / mixed: "I hit some people who'd already given me what I wanted." / hard: "I hurt people who were down. I had reasons. Rook had reasons."
  4. `ch8_lucho_call` (if kept): "I threw the towel for Lucho. Nobody threw it for me." / "I sent Lucho out. He said his legs were gone. I knew." (if abandoned): "I left Lucho without a corner for a chance at Ray. It was the right chance. It still cost him."
  5. `ch7_rook_answer`: "Rook asked what I'd have said. [You'd have had to ask me. / I don't know. / Not this.]"
  6. `ch10_names_learned`: none: "I don't know a single name." / some: "[Mr. Haile. Rosa. June...]" (the names learned, in the order learned).
  7. `ch0_purse_dream`: "Umma's rent." / "Umma's Saturdays." / "Min's door."
  8. Fixed, last: **"Nobody asked me. Nobody's asking them."**
- **Choice `ch10_choice`** (both always shown, both always enabled; no timer; no option is misleading; the player can leave the menu up as long as they want, and the residents and crew keep breathing):
  - **"[Cut the chain. Take the deal.]"** → `accept` → Ending One.
  - **"[Drop the cutters. Stand with Alder Row.]"** → `refuse` → Ending Two.

## Ending One — The Champion
**E1.1 Opening access.** The player **holds E** to cut (a 2-second hold, the cutter's jaws closing visibly). The chain drops onto the path. Hollis steps back from the gate without being touched. The crew walks in behind Jin. HUD: "Walk in first."

**E1.2 Overcoming resistance.** Terrence comes at the crew with the broom handle. The game hands Jin one verb for this: ATTACK becomes **"Restrain"** (the prompt changes on screen; punches are disabled here and the HUD says so: "Not with your fists. Stop him."). Terrence's swings are clumsy and slow; Jin slips one and ties him up (the same clinch Ray used on Jin in Chapter 8), and holds him against the garden wall while the crew walks past. No hit-stop, no sparks, no music, no health bars, no score. Hollis: "Terrence. Terrence, stop. Let it go." Terrence goes limp. Into Jin's shoulder: "You were on TV." Jin lets go.
- Supporting characters on the crew react, according to what the player built:
  - Slim (`rel.slim ≥ 1`): drops the box he's carrying. "You carried me once. I'm not carrying this." He walks out of the gate and down the street with his gym bag and doesn't come back. (`≤ 0`: he carries boxes with his hood up and doesn't look at anyone.)
  - Dutch (`walked_away`): sits on the van step for the whole clearance, smoking. "I collect. I don't do this." Carrow: "Fine. More for the rest of us." (`kept_going`: Dutch works, efficiently.)
  - Benny (`let_go`): carries Mr. Fitch's beans in their pot to the curb very carefully, as if that helps.

**E1.3 Allowing the residents to be forced out.** HUD: "Stand where they tell you." The camera stays wide (0.8) and does not zoom in on anyone's grief; the player walks to marks Carrow points at and stands there. Doors are knocked on. Forms are signed on the hoods of the vans. What the player sees, in order, without commentary:
- Rosa's crib mattress (the one Jin may have carried) goes on the curb after all; she sits on it with the baby.
- Two crew members carry Mr. Fitch out in his folding chair, still holding his radio; he doesn't help them and doesn't fight them.
- June's flyers in the gutter, wet.
- Mr. Haile's grate stays down. The coffee urn on the card table goes cold.
- If an ally with the highest relationship ≥ 3 among Mara, Teddy, Lucho and Hana came to Alder Row (they all read the closing memo in their envelopes): at the end of the street, they arrive, see Jin in front of the vans, and leave. Mara's green Courts truck stops at the corner, idles, and turns around. Teddy gets off the bus, looks, and gets back on before the doors close. Lucho stands at the corner with his hands in his overalls and walks away. Hana's peacoat at the corner, then gone. No dialogue.
- The black sedan at the far end starts its engine and pulls away.
- **9:00:** the Channel 8 van. A reporter with a microphone. Jin stands in front of the gate (open, its chain on the path). The player advances the line Carrow gave him: "This neighborhood deserves a future." (He accepted; there's no option to say something else, and the game doesn't pretend there is.)
- No rewards appear on screen at any point in this sequence. No money counter. No toasts. (PDF: "Do not turn their suffering into a celebratory loot wave.")

**E1.4 The rewards, over time (time cards; mostly watched, one short playable section).** Each card is a scene of 10–20 seconds.
1. **"July 1997 · Boston."** A bright rehab gym, three therapists, new equipment. Jin on the parallel bars again (Chapter 1's verb): the player walks him along the bars for 8 seconds and the body answers instantly. A therapist counts out loud. It isn't Hana.
2. **"October 1997 · Riverside."** The furnished two-bedroom. By `ch0_purse_dream`: `rent`: a folder of rent receipts paid a year in advance for an apartment nobody else lives in. / `umma_saturdays`: Saturday morning, nothing to do, the 1490 AM Korean program on the radio; Jin turns it up, then off. / `new_apartment`: the second bedroom has a door. The player can open and close it; it doesn't slam. Thought: "She wanted to slam it." On the table: Teddy's beer mat from the Hollow Tap (if visited in Ch9).
3. **"January 1998 · Ashgrove Tower lobby."** The press conference at the podium from the Ch9 lobby. Penner beside him, smiling. Banner: "ALDER COMMONS — CALDER'S FUTURE". The Calder Ledger headline in the next shot: **"SEO: 'I OVERCAME IT. ANYONE CAN.'"** (The organization presents him as a man who overcame hardship through determination.) Mrs. Paik vacuums at the edge of the lobby and doesn't look up.
4. **"1998."** Six fights in quick cuts: Jin winning, each by clear decision or KO, his body whole. In the fourth, the opposing trainer glances toward row three before sending his fighter out.
5. **"March 1999 · Calder Municipal Cemetery."** A granite headstone has replaced the county markers: "SEO MI-OK · 1942–1996 · SEO MIN-JI · 1972–1996 · BELOVED". Ashgrove's publicist photographs Jin beside it for the press kit; the flash goes off. St. Columba's wooden cross is gone from the grave. (In the next card, it leans in a corner of the Riverside apartment.)
6. **"May 1999 · Calder Civic Arena."** The title fight. Full house. The same tunnel walk as Chapter 0 with the crowd restored. **One playable round** (`power 1.0`, no breath, the full toolkit on a whole body): the champion (unnamed, gold trunks) fights for a minute, then in the second minute drops his hands and walks into Jin's first clean punch. If the player looks at the red corner between exchanges, the champion's cutman says "He's fine. Send him." (Lenny's line.) Row three: a man in a camel coat. The fight ends on that punch whatever the player does. The bell: two clean strikes. The announcer: **"AND THE NEW... JIN 'EASTGATE' SEO!"** Jin's name to an arena full of people. Section 8 is full of strangers, cheering.
7. **The administrative report.** The document viewer opens on a typed page (Owen Tully's model with the blanks filled in, if `ch9_owen == persuaded`; otherwise a template from "Acquisitions"): "ALDER COMMONS — SITE DELIVERY REPORT · Delivery date: May 9, 1997 · Households: 24 · Residents: 61 · Voluntary surrenders: 24 · Relocation assistance disbursed: $110,000 · Incidents: 1 (minor; resolved on site) · Outcomes known:" and then one line per household. **Residents whose names Jin learned are listed by name**; the rest are numbers:
   - Haile, T. — Alder Market (closed) — not reopened. Relocated: unknown.
   - Medina, R. — 1 adult, 2 minors — doubled up with family, Millport.
   - Grant, H. & T. — 2 adults — address unknown.
   - Fitch, H. — 87 — placed: St. Agnes Long-Term Care, Hillcrest.
   - Household 17 — 1 adult, 1 minor (age 10) — address unknown. (June, if her name was learned: "Household 17 (incl. June, 10)".)
   - Households 1–24 not named above: "relocated" / "address unknown".
   - "Status: CLOSED."
   (Their losses are summarized in an administrative report.)
8. **Last image.** The Riverside apartment at night. The belt on the table. Jin at the window. Across the river, cranes over Southbank, where the row was. No thought line. Two strikes of the bell. Title: **"The Champion."**
- Completion screen: "You took the bargain. Jin Seo received treatment, a home, an income and a championship. Alder Row's 24 households were relocated on May 9, 1997." Then the choices of the whole campaign, each in one plain sentence, in chapter order. No grade.

## Ending Two — His Own Name
**E2.1 The refusal.** Jin opens his hand. The bolt cutters fall on the path with a heavy clang (sound hold: 1 s of nothing else). Carrow looks at them, then at Jin. "...Okay." He steps back and lifts his clipboard; the crew starts forward. Jin turns his back to the gate and puts his guard up. Behind the bars, Terrence: "Wait — you're — " Hollis, pulling him back: "Terrence. Get back."
- Carrow, from behind his men: "This doesn't stop anything, champ. It stops today." (He's right: the PDF says the fight creates an opportunity for accountability and does not replace it.)
- HUD: "Keep them off the gate." Letterbox off.

**E2.2 The fight** (arena x 300–1500 on `alder_street`; the gate at the right edge behind Jin; checkpoints before each wave; `onLoss: 'retry'` with the line "Again. You know how to do this."). One enemy per wave carries a second pair of bolt cutters and goes for the gate; he is marked like a director (hit him first). If he reaches the gate, Hollis and Terrence hold the chain from the inside and shove him back while Jin gets there; there is no fail state for the gate.
- **Allies (`support_at_alder`)** are computed from relationships, never from `jin_voice`, and they arrive *for Alder Row*: each of them read the closing memo in their envelope. None of them was promised anything by Jin. Who comes:
  - **Slim** (`rel.slim ≥ 1`): at the start of wave 1 he drops his hands and walks over to stand inside the gate with the residents. "You carried me once." He doesn't fight; he holds the gate with Terrence. (`≤ 0`: he fights as a reluctant `boxer` in wave 1 and leaves after his first knockdown: "I'm done. I'm done, man.")
  - **Benny** (`ch2_collector_after == let_go`): he says it again, "You let me walk. I'm walking," and gets back in the van. (`hit_again`: he fights in wave 1 as a `collector`.)
  - **Lucho** (`rel.lucho ≥ 2`): arrives at the end of wave 1 running down the street from the bus stop in his mechanic's overalls. "Feet! ...That's your line." Fights beside Jin in wave 2 (an AI ally `boxer` on Jin's side; draws one attacker).
  - **Mara** (`rel.mara ≥ 2`): between waves 1 and 2, the green Courts maintenance truck pulls across the end of the row, blocking the second van; wave 3 has two fewer men. Mara leans out of the cab: "Twenty-four families. One stairwell. I said I'd hate you a bit either way. I lied."
  - **Teddy** (`rel.teddy ≥ 2`): between waves, on the curb with a towel and a **bottle** of water (not a cup). Jin sits on the curb (the corner, 5 seconds, condition restored). Teddy: "Feet. Watch the big one's shoulders." Then, the Chapter 0 line asked as a question first: "You all right? ...Hands up. Chin down. Go."
  - **Deshawn** (`rel.deshawn ≥ 2`): arrives at the start of wave 3 and fights beside Jin.
  - **Hana** (`rel.hana ≥ 3`): arrives after the fight with a Calder Ledger reporter, **Ruth Abernathy**, and a photographer (see E2.3).
  - With no allies at all, the fight is tuned to be winnable alone on Normal by a player who uses the whole toolkit; the residents hold the gate.
- **Wave 1:** 4 Harlan Street men (`enforcer` ×2, `thug` ×2) + Benny (if `hit_again`) + Slim (if `≤ 0`). The cutter-man is a `thug`.
- **Wave 2:** 4 `enforcer` + **Carrow** as a `director` (he never throws a punch; his men attack faster while he talks into his radio; hitting him once sends him back behind the vans for good). Lucho beside Jin if he came.
- **Wave 3:** **Dutch Brannigan**, if `ch4_dutch_after == kept_going`: `boss_collector` with the bandaged hand, phase 1 and 3 behaviour from Ch4, and his old method aimed at the gate: he walks Jin back toward it, because a man with people behind a gate can't step aside. "I don't chase. I wait for the wall. You brought your own wall." Plus 2 `collector` (0 if Mara's truck). If `walked_away`: Dutch sits on the van's step and lights a cigarette, "I collect. I don't do this," and wave 3 is 3 `enforcer` + 2 `collector` (1 + 0 with Mara's truck). Deshawn beside Jin if he came.
- **After the last man goes down:** the crew backs into the vans. Carrow, from the van window: "It stops today." The vans leave. At the far end of the row, the black sedan starts and pulls away; the man in the camel coat doesn't look over.
- Jin sits on the curb in front of the gate (`sitCurb`), breathing hard (the ragged breath from Ch8; his hands shake). He can't get up for a while. The camera holds wide (0.85).

**E2.3 Nine o'clock.** Behind Jin, Hollis takes the padlock off the gate from the inside (he has the key; he always had the key). Residents come out onto the street.
- The Channel 8 van arrives anyway (Ashgrove booked it) and films a different story: the reporter puts her microphone in front of Hollis. Hollis: "Some men came to take our homes this morning. Some other people came and stood in the way. That's all I know." He doesn't point at Jin.
- If Hana came (`rel.hana ≥ 3`): she sits down on the curb next to Jin in her peacoat. The Ledger photographer's flash goes off once, white, across the gate: the same flash as Min's Pentax from section 8 in Chapter 0. Hana gives Ruth Abernathy her envelope. Hana, to Jin: "You don't have to talk to anybody today." Jin: "I'll talk." / If Hana didn't come: Jin gets up, finds a payphone on Southbank Ave, and calls her. "It's done. Alder Row." Hana: "...I'm coming. Don't go anywhere."
- **The residents don't have to know** (PDF). Rosa, with the baby: "Thanks. I still don't know who you are." Mr. Haile pushes his grate back up: "Milk's back on." He hands Jin a fresh paper cup of coffee. Mr. Fitch's radio is still going. June gives Jin another flyer, a new one, handwritten in the night: "MEETING TOMORROW 6 AM — STILL DON'T SIGN ANYTHING." Hollis: "Whoever you are. There's a meeting at six tomorrow. You're welcome. Don't sign anything."

**E2.4 Afterward (time cards; one playable walk at the end).** Each card shows only what the player's choices made true. The PDF's shape is kept: exposure happens through evidence, witnesses, residents and people he worked with; Jin loses the treatment and the comeback; he stays poor and his recovery incomplete; his ordinary future has choices in it; he still wants what he refused.
1. **"June 1997 · Calder County Courthouse."** The grand jury. Witnesses climb the courthouse steps one at a time (each appears only if it's true): Hana with her envelope; Dot with Min's; Mara; Teddy; Deshawn; Roz Kaminski ("If you need a dispatcher to say it out loud, I will."); Wendell Asher ("Wendell Asher told the grand jury about the key on his ring."); Lenny (`rel.lenny ≥ 1`: "Lenny Voss said it again, to a judge." / else a line card: "Lenny Voss was never found to testify."); Owen Tully (`persuaded`: "Owen Tully testified for two days. His daughter drew the courthouse." / `threatened`: "Owen Tully was let go on May 7. He did not testify."); Gerald Pike's two pages ("Exhibit 14", if `ch6_pike_statement`); Ray Castell's typed statement to the Athletic Commission (`stopped`) / "Sal Bruno's notebook was the only account from that corner." (`continued`). **Walter Rook testifies in every version:** "Walter Rook testified for the prosecution and resigned from the Northside Community Council the same week." The more copy holders there were, the faster it moves: many: "The Calder Ledger ran it for eleven days." / few: "It took a year for anyone to print it."
2. **"1998."** Partial accountability, the way Celeste said it would go, and a little more: "Harlan Freight's Dock Road operation was indicted. Dutch Brannigan pleaded guilty. Ashgrove Capital paid a fine and replaced two officers. Lyle Penner resigned; his trial was set for 1999. Celeste Ashgrove remained chair." "Alder Commons was cancelled. The cooperative remains."
3. **"August 1997 · Calder County Probate."** A one-page order in the document viewer: "In the Matter of Jin Seo, registered at St. Agnes Long-Term Care as Daniel Ahn: the petitioner's identity is restored." (Dr. Whitlow's affidavit, Hana's work.) Then the Athletic Commission: Jin signs for his 1994 purse, held "until the fighter signs for it" (Umma's note on the back of the Housing Court judgment, Ch6). After fees it is $9,400. The viewer shows where it went, as a short list in his handwriting: "Kessler Realty — 3B arrears, Seo — $1,140. / County — two stones, Section 14 — $1,200. / St. Columba's — $200. / Rent." The county numbers on 96-031 and 96-032 are replaced by two flat stones with their names, and St. Columba's wooden cross stays between them. What's left lasts the winter. (He remains poor.)
4. **"Foundry Courts."** The roof money ended; Nell found a tenants' credit union; they were cold for a year. The buildings still stand (the benefits were real). Ada on her stoop; Gus fixing a radio; if `ch5_meeting_stance == roof`, Ada's ceiling is still dry.
5. **"A rented room."** By relationships: `rel.mara ≥ 2`: the room behind the Courts' workshop, the cot replaced by a bed Mara found; otherwise Monarch Room 5. On the windowsill: the knuckles (`ch8_hands == knuckles`) or nothing (`wraps`, if he dropped them off the bridge). The evidence wall is down; one card is still pinned: Umma's napkin note.
6. **"Difficult work."** `rel.mara ≥ 1`: Mara's crew, carrying radiators at six in the morning ("Lift with the legs, boxer."). Otherwise: nights at the rail yard with Darnell (Darnell, if `ch5_left_repair == false`: "You held the flashlight that night. I remember.").
7. **"Saturdays."** Occasional teaching at a gym: `rel.teddy ≥ 2`: the kids' class at Iron Pulse on the old Marsh canvas, Teddy on a stool with a whistle ("Hands up, chin down, mouth shut."); and/or `rel.lucho ≥ 1`: the Courts' basement gym with Lucho, Keisha in the front row copying Jin's guard if `ch5_trained_kids`. Lucho tells the kids about the towel or about sending him out (by `ch8_lucho_call`). If neither: Jin shadowboxes alone on the river path on Saturday mornings; a kid on a bike stops to watch, then rides on.
8. **"Relationships he kept."** Short vignettes, each only if earned: Sunday soup at Ada's; Friday pie with Hana at Sunny's, in the booth by the window (`rel.hana ≥ 3`; else a postcard from Hana on the windowsill: "Still here. — H."); Mrs. Okafor showing him the framed cake photo again (`ch6_okafor_photo`); Teddy at the Hollow Tap; Deshawn at the Cellar, no longer fighting ("I'm a bouncer now. It's the same thing with less getting hit.").
9. **"May 1999 · Sunny's."** Augie's TV: the title fight at Calder Civic Arena that Jin will never be in. Jin watches every round from the counter. Augie refills his coffee without asking. Jin's hands move a little on the counter with every exchange (the absent-minded double jab from his cast bible). Thought: "I'd have been good." Then: "I still want it." (PDF: do not erase his disappointment.) Augie: "You want the next one on?" Jin: "Yeah."
10. **Last scene (playable, short).** An autumn morning on Alder Row. Jin walks through on his way to work (the player walks him left to right; nothing else to do). Mr. Haile's shop is open. June is on her bike. Mr. Fitch's radio. Rosa hanging laundry on a stoop rail. Residents whose names the player learned are greeted by name in Jin's little bubble barks ("Morning, Rosa."); the others are still "Resident": he never learned them, and they never learned his history. A couple of them nod. Nobody stops him. At the shop, Mr. Haile holds out a paper cup: "Cold one this morning." Jin takes it (the player presses E or doesn't; he takes it anyway if the player walks on, Mr. Haile pressing it into his hand). He keeps walking. The camera stops following and lets him walk out of frame to the right while the street goes on with its morning. Thought, as he leaves frame: "They don't know my name. That's all right. I do."
- Title: **"His Own Name."**
- Completion screen: "You refused the bargain. Jin Seo did not receive the treatment program or the managed comeback. Alder Row is still occupied." Then the campaign's choices, one plain sentence each, in chapter order. No grade.

## Choices made here
| Flag | Options | Immediate | Later |
|---|---|---|---|
| `ch10_names_learned` | list of resident ids | Names in bubbles | Ending One: named lines in the administrative report; Ending Two: named greetings in the last walk. |
| `ch10_choice` | accept / refuse | **The ending.** The only flag any ending reads to decide which ending plays. | — |

## Chapter ending and state handed on
- Chapter select unlocks for every chapter; replaying Chapter 10 from its start keeps all earlier flags, so a player can see the other ending without replaying the campaign (the completion screen says: "You can return to the gate from Chapter Select.").
- The save slot records the ending and a one-line summary on the load screen: "The Champion · May 1999" or "His Own Name · Autumn 1997".

---
# Registry cross-check (final pass for Chapters 6–10)

Flags added while writing Chapters 6–10, and where each is set and read. These rows extend the **Choice flags** table in the Flags & relationships registry.

| Flag id | Values | Set where | Read where |
|---|---|---|---|
| `ch1_told_hana_boxing` | bool | Ch1, the parallel bars, second week | `hana` +1; Ch6 Sunny's line ("You told me about the fight, on the bars..."). |
| `ch6_gave_back_4d` | bool | Ch6, Ada's front room, only if `ch5_took_unit_4d` | `courts` +1; removes 4D from `take_count`; Ch7 Rook's line; Ch9 Penner skips the 4D line; Ch10 Jin's taking thought. |
| `ch6_okafor_photo` | bool | Ch6 side quest | Ch9 night (frame on her TV); Ending Two vignette. |
| `ch6_flowers` | bool | Ch6 cemetery gate ($5) | Ch9 night cemetery; map note. |
| `ch7_hit_rook` | bool | Ch7, end of the confrontation | `harm_count` +1; Ch7 meeting (bruise); Ch9 night Rook line. |
| `ch7_lucho_promise` | yes / try | Ch7, after the meeting | Ch8 S8.2 line; S8.3 Lucho's greeting. |

Updates to derived values:
- `harm_count` also counts `ch7_hit_rook`. (Final list: `ch2_collector_after=hit_again`, `ch3_lenny_method=pressed`, `ch4_roz=threatened`, `ch4_dutch_after=kept_going`, `ch6_asher_method=threatened`, `ch7_hit_rook`, `ch8_ray_after=continued`, `ch9_owen=threatened`.)
- `take_count` counts `ch5_took_unit_4d` only if not `ch6_gave_back_4d`.
- `support_at_alder` = { Slim if `rel.slim ≥ 1` (holds the gate), Lucho if `rel.lucho ≥ 2`, Mara if `rel.mara ≥ 2` (truck), Teddy if `rel.teddy ≥ 2` (corner), Deshawn if `rel.deshawn ≥ 2`, Hana if `rel.hana ≥ 3` (reporter) } plus the two crew members who step aside by flag (Benny if `ch2_collector_after == let_go`, Dutch if `ch4_dutch_after == walked_away`). It changes the Ending Two fight and both endings' supporting beats. It never changes which ending is available.

Every flag in the registry, checked for at least one read site:
- Ch0: `ch0_purse_dream` (Ch2, Ch6 letter 4, Ch10 thought, both endings) · `ch0_refusal_line` (Ch8 stairwell thought, Ch9 Penner, Ch10 thought) · `ch0_told_teddy` (Ch2, Ch8 corner) · `ch0_resistance` (Ch8 Ray).
- Ch1: `ch1_pike_stance` (Ch2 van, Ch6 Pike's file) · `ch1_records_route` (Ch6 Hana) · `ch1_fare_source` (Ch6 Hana, Ch9 Penner, Ch10 thought) · `ch1_told_hana_boxing` (Ch6).
- Ch2: `ch2_collector_after` (Ch3, Ch6 stair, Ch9 van, Ch10) · `ch2_teddy_met` / `ch2_teddy_tone` (training, `rel.teddy` → Ch8 corner, Ch10) · `ch2_took_mailbox` (Ch6 Window 7).
- Ch3: `ch3_slim_carried` (`rel.slim` → Ch10) · `ch3_cup` (Ch8 Teddy's cup) · `ch3_deshawn_dive` (Ch8 Deshawn, Ch9 Penner) · `ch3_deshawn_paid` (`rel.deshawn` → Ch10) · `ch3_lenny_method` (`rel.lenny` → Ch8 copies, Ending Two) · `ch3_mo_deal` / `cellar_dives_taken` (Ch8 Ray, Ch9 Penner, Ch10 thought).
- Ch4: `ch4_roz` (Ch8 copies, Ch9 Penner list, Ending Two) · `ch4_took_profit` (Ch9 Celeste) · `ch4_envelope` (Ch5, Ch7 Darnell and Rook, Ch9 Penner, Ch10 thought) · `ch4_dutch_after` (Ch9 van, Ch10 both endings).
- Ch5: `ch5_envelope_outcome` (Ch7 Mara/Darnell, Ch9 Penner) · `ch5_left_repair` (Ch9 Mara, Ending Two Darnell) · `ch5_meeting_stance` (Ch7 Gus/Ada, Ending Two Courts card) · `ch5_donation` (Ch7 Ada: carried from the Ch5 table; she says it at the meeting if ≥ $50) · `ch5_took_unit_4d` (Ch6, Ch7, Ch9, Ch10) · `ch5_trained_kids` (Ending Two).
- Ch6: `ch6_asher_method` (Ch8 copies, Ch9 Penner, Ending Two) · `ch6_strippers` (Ch9 flavour) · `ch6_pike_statement` (Ch7 presentable, Ending Two) · `ch6_hana_repaid` (Ch9 Hana) · `ch6_gave_back_4d` · `ch6_okafor_photo` · `ch6_flowers`.
- Ch7: `ch7_rook_answer` (Ch9 Gus, Ch10 thought) · `ch7_hit_rook` (Ch9 Rook) · `ch7_truth_told_by` (Ch9 Courts, Ending Two) · `ch7_lucho_promise` (Ch8).
- Ch8: `ch8_lucho_commitment` (Ch9 Lucho, Ch10 thought, Ending Two ally) · `ch8_lucho_call` (Ch10 thought, Ending Two teaching) · `ch8_hands` (Ending Two room) · `ch8_ray_after` (Ch9 Hana/Penner, Ending Two) · `copy_holder_*` (Ch9 Penner, Ending Two).
- Ch9: `ch9_owen` (Ch9 Penner, both endings) · `ch9_night_visits` (completion screen, ending props).
- Ch10: `ch10_names_learned` (both endings) · `ch10_choice` (the ending).

Ada's donation line ("You put money in the can. I saw.") is placed in the Ch7 meeting, before her "I can't hold both" line, when `ch5_donation ≥ 50`.
