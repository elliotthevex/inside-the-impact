/* Story Mode — chapters/cast.js
   Shared looks and cast for every chapter (ARCHITECTURE.md §1 item 9, §3 LookDef, §8 PersonDef).
   Source: story/design/bible-parts/01-global.md (Cast bible) and the "NPCs present" table of each chNN.md.
   Notes: story/dev/notes/foundation-cast.md.

   What this file gives chapter authors
     S.defineLook(id, ...)   a look for every recurring person, each variant they need, and generic
                             enemy / background looks. A look id equals the cast id for the default look
                             ('teddy', 'hana', ...); variants add a suffix ('teddy_1996', 'hana_coat').
     S.cast[id]              { name, full, role, look, alt, rel, notes: [] } for every person. It is also the
                             base People-archive entry (director's story.person falls back to S.cast, and every
                             entry is registered with S.definePerson). Chapters extend it with
                             `people: { id: { notes: [ { id, text } ] } }`: notes are concatenated onto the base,
                             any other field a chapter gives (role, look, name) overrides the base in that chapter.
     S.castLook(id, n)       the person's look for chapter n (default: the current chapter), from `alt`.
     S.castNpc(id, opts)     an NpcPlacement with the person's id, name and chapter look, merged with opts.
     S.castIds / S.lookIds   ordered lists (for tests and the notes).

   Ids follow the bible's NPC tables exactly (min, umma, okafor, teddy, lenny, rita, inspector, ray_1994,
   camel_coat, referee, morty, rook_1994, hana, pike, earl, dolores, whitlow, sister_margaret, petra, augie,
   receptionist, tomas, benny, carl, vic, otis, mo, deshawn, wojo, slim, ferris, peg, tiny, fran, pat,
   whistle, roz, dutch, mara, odette, gus, darnell, keisha, nell, elena, rook, dukes, hale, asher, fitz, dot,
   brandt, wanda, carrow, ray, gym_desk, joan, celeste, penner, owen, garvey, tran, rosa, gloria, terrence,
   odell, june, brenda, ed) and the relationship meters (hana, teddy, lenny, deshawn, slim, mara).
   No faces anywhere: posture carries everything (bible). Colours stay in the muted palette; Jin's blue top
   stays the only blue mass in a fight, so enemies wear browns, olives, charcoals and tans. */
(function (S) {
  'use strict';

  if (!S || typeof S.defineLook !== 'function') return;     // art.js missing: nothing to register
  const P = S.pal || {};
  const SKIN = { jin: P.jinSkin || '#d6a47e' };
  const LOOKS = [];
  function look(id, def) { S.defineLook(id, def); if (LOOKS.indexOf(id) < 0) LOOKS.push(id); return def; }
  const copy = (o) => JSON.parse(JSON.stringify(o));

  /* ════════════════════════════════════════════════════════════════════
     JIN — chapter variants
     Built-in (art.js): jin, jin_1994, jin_street, jin_ring, jin_ring_robe, jin_hospital, jin_rehab.
     Adjusted here:
       jin / jin_street  the scar is dynamic: it shows in every chapter except Chapter 0 (fight night
                         gives him the scar, and Chapter 0 ends at the fall). So a Chapter 0 that uses
                         jin_street (bible ch00 "Body: jin_street -> jin_ring") still shows a clean cheek.
       jin_ring(_robe)   blue trunks (bible: "blue trunks with a white stripe"), red gloves, no scar.
     Added: jin_cellar, jin_training, jin_civic, jin_civic_robe, jin_champion, jin_suit, jin_court.
     ════════════════════════════════════════════════════════════════════ */
  const JIN = {
    h: 46, build: 'boxer', skin: SKIN.jin, hair: { style: 'twoblock', color: P.jinHair || '#3b2a20' },
    top: { kind: 'track', color: P.jinTop || '#4d6b93', color2: P.jinStripe || '#d8d2c1' },
    bottom: { kind: 'pants', color: P.jinPants || '#1e1f26' }, shoes: P.jinShoes || '#d4cfc2', extras: [],
  };
  const jin = (o) => Object.assign(copy(JIN), o || {});
  const chapterOf = (G) => (G && typeof G.chapter === 'number' ? G.chapter : null);
  const scarNow = (G) => chapterOf(G) !== 0;                       // no G (title screen) -> canonical look, scarred
  const knucklesNow = (G, St) => !!((G && G.gear && G.gear.knuckles) || (St && St.combat && St.combat.body && St.combat.body.knuckles));
  const flagOf = (G, k) => (G && G.flags ? G.flags[k] : undefined);
  const TRUNKS_BLUE = '#3a5a90', GLOVE_RED = '#a8342a', HOUSE_GLOVE = '#6e2e28', ROBE_NAVY = '#26304a';

  // Canonical 1996+ street look; clean cheek only in Chapter 0.
  look('jin', jin({ extrasWhen: (G) => (scarNow(G) ? ['scar'] : []) }));
  // The street look; brass knuckles show whenever the gear is equipped (G.gear.knuckles or the body flag).
  look('jin_street', jin({ extrasWhen: (G, St) => {
    const out = [];
    if (scarNow(G)) out.push('scar');
    if (knucklesNow(G, St)) out.push('knuckles');
    return out;
  } }));
  // 1994, before the fight: the track top fits, no scar (also for memory flashbacks in any chapter).
  look('jin_1994', jin({ extras: [] }));
  // Fight night, August 20, 1994: bare chest, blue trunks (pale waistband), red gloves, no scar.
  look('jin_ring', jin({ top: { kind: 'bare', color: SKIN.jin }, bottom: { kind: 'trunks', color: TRUNKS_BLUE }, shoes: '#262a3a', extras: ['gloves:' + GLOVE_RED] }));
  // The walk-out: Umma's navy robe, EASTGATE across the back in off-white (letters are not drawable at 46 px).
  look('jin_ring_robe', jin({ top: { kind: 'robe', color: ROBE_NAVY, color2: P.jinStripe || '#d8d2c1' }, bottom: { kind: 'trunks', color: TRUNKS_BLUE }, shoes: '#262a3a', extras: ['gloves:' + GLOVE_RED] }));
  // Chapter 1 (built-in looks kept as they are): jin_hospital (gown, slim, shaggy hair), jin_rehab (gray tee, sweats).
  // Chapter 3, the Cellar: house gloves, knuckles in his pocket ("No metal in my ring."), his own black pants.
  look('jin_cellar', jin({ top: { kind: 'bare', color: SKIN.jin }, extras: ['scar', 'gloves:' + HOUSE_GLOVE] }));
  // Gym work (Teddy's back room mitts, the Courts basement gym): gray tee, black pants, hand wraps.
  look('jin_training', jin({ top: { kind: 'tee', color: '#8b8e94' }, extras: ['scar', 'wraps'] }));
  // Chapter 8, the Civic: bare chest, black pants; wraps or brass by ch8_hands ('wraps' | 'knuckles').
  const civicHands = (G) => {
    const h = flagOf(G, 'ch8_hands');
    const out = ['scar'];
    if (h === 'knuckles') out.push('knuckles'); else if (h === 'wraps') out.push('wraps');
    return out;
  };
  look('jin_civic', jin({ top: { kind: 'bare', color: SKIN.jin }, extras: [], extrasWhen: civicHands }));
  look('jin_civic_robe', jin({ top: { kind: 'robe', color: ROBE_NAVY, color2: P.jinStripe || '#d8d2c1' }, extras: [], extrasWhen: civicHands }));
  // Ending One, 1998-99: treated and fed; blue trunks again, the scar stays (only the poster airbrushes it).
  look('jin_champion', jin({ top: { kind: 'bare', color: SKIN.jin }, bottom: { kind: 'trunks', color: TRUNKS_BLUE }, shoes: '#262a3a', extras: ['scar', 'gloves:' + GLOVE_RED] }));
  // Ending One public life (press lobby, the Ashgrove Center): a good charcoal suit, a muted blue tie.
  look('jin_suit', jin({ build: 'boxer', top: { kind: 'suit', color: '#2e3340', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#2e3340' }, shoes: '#1a1614', extras: ['scar', 'tie:#4d6b93'] }));
  // Ending Two, the courthouse steps (June 1997): a plain white shirt, his black pants.
  look('jin_court', jin({ top: { kind: 'shirt', color: '#d8d4ca' }, shoes: '#2a2622', extras: ['scar'] }));

  /* ════════════════════════════════════════════════════════════════════
     THE SEO FAMILY (Chapter 0; afterwards only in memory)
     ════════════════════════════════════════════════════════════════════ */
  // Min, 22: slim, black bob with blunt bangs, the yellow scrunchie (the brightest small colour in Ch0),
  // oversized maroon cardigan over a college tee, faded jeans, red sneakers, the Pentax on its strap.
  look('min', { h: 40, build: 'slim', skin: '#d9ab86', hair: { style: 'bob', color: '#16120f' },
    top: { kind: 'cardigan', color: '#6e2c34', color2: '#c9c2b0' }, bottom: { kind: 'jeans', color: '#5c6e8c' }, shoes: '#b0362c',
    extras: ['headband:#e8c43a', 'bag:#2b2b30'] });
  // Umma, b. 1942: slight, gray-streaked black hair in a low bun, brown cardigan over the lavender work smock.
  look('umma', { h: 40, build: 'slim', skin: '#cf9e7a', hair: { style: 'bun', color: '#4a4646' },
    top: { kind: 'cardigan', color: '#6e5240', color2: '#a493b8' }, bottom: { kind: 'slacks', color: '#3a3a44' }, shoes: '#1e1c20', extras: [] });
  // Umma at the Civic (Section 14, Row F) and in court: her good navy coat.
  look('umma_coat', { h: 40, build: 'slim', skin: '#cf9e7a', hair: { style: 'bun', color: '#4a4646' },
    top: { kind: 'coat', color: '#2c3450', color2: '#a493b8' }, bottom: { kind: 'slacks', color: '#3a3a44' }, shoes: '#1e1c20', extras: [] });

  /* ════════════════════════════════════════════════════════════════════
     FIGHT NIGHT AND THE CORNER
     ════════════════════════════════════════════════════════════════════ */
  // Coach Teddy Marsh, 1994: heavy, bald (the gray horseshoe reads as bald at 46 px), white mustache,
  // gray MARSH B.C. sweatshirt, dark sweatpants.
  look('teddy', { h: 47, build: 'heavy', skin: '#dba88a', hair: { style: 'bald', color: '#c8c4bc' },
    top: { kind: 'sweater', color: '#8a8c90' }, bottom: { kind: 'sweats', color: '#2e3446' }, shoes: '#2a2622', extras: ['mustache:#e6e2d8'] });
  // Teddy from 1996: thinner, a gray IRON PULSE staff vest over a work shirt (he mops the gym that was his).
  look('teddy_1996', { h: 47, build: 'avg', skin: '#d9a688', hair: { style: 'bald', color: '#c8c4bc' },
    top: { kind: 'vest', color: '#5e6268', color2: '#7c7466' }, bottom: { kind: 'slacks', color: '#3a3a40' }, shoes: '#2a2622', extras: ['mustache:#e6e2d8'] });
  // Lenny Voss: slim, rounded shoulders, thinning slicked hair, maroon windbreaker. (The tape roll on his left
  // wrist and the gold chain are too small for the sprite; scenes show them in close-ups and documents.)
  look('lenny', { h: 44, build: 'slim', skin: '#cf9f80', hair: { style: 'slick', color: '#4a3e34' },
    top: { kind: 'jacket', color: '#6a2a30', color2: '#c8c0b0' }, bottom: { kind: 'slacks', color: '#3a3834' }, shoes: '#2a2420', extras: [] });
  // The man in the camel coat: neat silver hair, knee-length camel overcoat over a charcoal suit, gray scarf.
  look('camel_coat', { h: 48, build: 'avg', skin: '#e0b898', hair: { style: 'slick', color: '#c8c6c0' },
    top: { kind: 'coat', color: '#a8875a', color2: '#3a3a40', long: true }, bottom: { kind: 'slacks', color: '#34343a' }, shoes: '#1a1614',
    extras: ['scarf:#7a7a80'] });
  // Ray Castell, 1994: taller than Jin, close-cropped; gold trunks, white gloves.
  look('ray_1994', { h: 50, build: 'boxer', skin: '#a8714f', hair: { style: 'buzz', color: '#1b1410' },
    top: { kind: 'bare', color: '#a8714f' }, bottom: { kind: 'trunks', color: '#c09a3a' }, shoes: '#ece6d8', extras: ['gloves:#ddd6c6'] });
  // Ray's walk-out: white satin robe with gold trim.
  look('ray_1994_robe', { h: 50, build: 'boxer', skin: '#a8714f', hair: { style: 'buzz', color: '#1b1410' },
    top: { kind: 'robe', color: '#e2ddd0', color2: '#c9a13b' }, bottom: { kind: 'trunks', color: '#c09a3a' }, shoes: '#ece6d8', extras: ['gloves:#ddd6c6'] });
  // Ray, 1997: charcoal suit, the tie pulled loose.
  look('ray', { h: 50, build: 'boxer', skin: '#a8714f', hair: { style: 'buzz', color: '#1b1410' },
    top: { kind: 'suit', color: '#3a3c44', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#3a3c44' }, shoes: '#1a1614', extras: ['tie:#7a2a2a'] });
  // Ray at the Civic, Chapter 8: jacket off, shirt and suit trousers, the white gloves from the photographs.
  look('ray_shirt', { h: 50, build: 'boxer', skin: '#a8714f', hair: { style: 'buzz', color: '#1b1410' },
    top: { kind: 'shirt', color: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#3a3c44' }, shoes: '#1a1614', extras: ['tie:#7a2a2a', 'gloves:#ddd6c6'] });
  // Ray at his gym: burgundy tracksuit with gold piping.
  look('ray_gym', { h: 50, build: 'boxer', skin: '#a8714f', hair: { style: 'buzz', color: '#1b1410' },
    top: { kind: 'track', color: '#6a2430', color2: '#c9a13b' }, bottom: { kind: 'sweats', color: '#5a2028' }, shoes: '#ece6d8', extras: [] });
  // Referee Phil Ostrowski (Ch0) and the generic referee (Ending One): white shirt, black bow tie, black slacks.
  look('referee', { h: 46, build: 'avg', skin: '#d4a07a', hair: { style: 'slick', color: '#4a3e34' },
    top: { kind: 'shirt', color: '#e0dcd2' }, bottom: { kind: 'slacks', color: '#1e1e22' }, shoes: '#141416', extras: ['tie:#1a1a1e'] });
  // Commission inspector at the table (Ch0).
  look('inspector', { h: 45, build: 'old', skin: '#e0b496', hair: { style: 'gray_short', color: '#a8a49c' },
    top: { kind: 'blazer', color: '#4a4a52', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#3a3a42' }, shoes: '#1a1614', extras: ['glasses', 'tie:#5a2a2a'] });
  // Morty Fine, the Civic's timekeeper since 1961: white shirt, black vest and bow tie.
  look('morty', { h: 43, build: 'old', skin: '#e2b48e', hair: { style: 'gray_short', color: '#d8d4cc' },
    top: { kind: 'vest', color: '#2e2e34', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#2e2e34' }, shoes: '#141416', extras: ['tie:#1e1e22', 'glasses'] });
  // The ring announcer (Ch0, Ending One): black tuxedo.
  look('announcer', { h: 47, build: 'avg', skin: '#dcb090', hair: { style: 'slick', color: '#2a2220' },
    top: { kind: 'suit', color: '#1e1e24', color2: '#e0dcd2' }, bottom: { kind: 'slacks', color: '#1e1e24' }, shoes: '#101012', extras: ['tie:#101012'] });

  /* ════════════════════════════════════════════════════════════════════
     EASTGATE (recurring neighbours, 1994 and 1996-97)
     ════════════════════════════════════════════════════════════════════ */
  // Mrs. Grace Okafor, 3A, Umma's friend.
  look('okafor', { h: 41, build: 'old', skin: '#5f3e2a', hair: { style: 'bun', color: '#4a4442' },
    top: { kind: 'cardigan', color: '#4a6a5a', color2: '#d8cfc0' }, bottom: { kind: 'long_skirt', color: '#4a4450' }, shoes: '#2a2220', extras: ['glasses'] });
  // Ch9: Mrs. Okafor in her robe, the kettle on.
  look('okafor_robe', { h: 41, build: 'old', skin: '#5f3e2a', hair: { style: 'bun', color: '#4a4442' },
    top: { kind: 'robe', color: '#7a5a6a', color2: '#d8cfc0' }, bottom: { kind: 'long_skirt', color: '#7a5a6a' }, shoes: '#6a5a4a', extras: ['glasses'] });
  // Rita Mancuso, Sunny's waitress since 1981: diner uniform and white apron.
  look('rita', { h: 43, build: 'avg', skin: '#d4a07a', hair: { style: 'bun', color: '#6a4a3a' },
    top: { kind: 'dress', color: '#6e8282', color2: '#d8d0c0' }, bottom: { kind: 'skirt', color: '#6e8282' }, shoes: '#e0dcd2', extras: ['apron:#e0dacc'] });
  // Augie, Sunny's cook: paper cap, white tee, apron.
  look('augie', { h: 46, build: 'heavy', skin: '#c48e68', hair: { style: 'cap', color: '#dcd8cc', under: '#2a2018' },
    top: { kind: 'tee', color: '#d8d4ca' }, bottom: { kind: 'pants', color: '#4a4a50' }, shoes: '#2a2622', extras: ['apron:#e0dacc'] });
  // Petra Novak, the new 3B (Calder Transit driver, at home).
  look('petra', { h: 44, build: 'avg', skin: '#e0b496', hair: { style: 'ponytail', color: '#8a6a4a' },
    top: { kind: 'sweater', color: '#7a6a5a' }, bottom: { kind: 'jeans', color: '#4a5670' }, shoes: '#3a3030', extras: [] });
  // Rosie Novak, three.
  look('rosie', { h: 24, build: 'kid', skin: '#e8c4a6', hair: { style: 'curly', color: '#b8904a' },
    top: { kind: 'tee', color: '#c88a9a' }, bottom: { kind: 'pants', color: '#c88a9a' }, shoes: '#d8d4ca', extras: [] });
  // Iron Pulse front desk, 1996 (chewing gum).
  look('receptionist', { h: 42, build: 'slim', skin: '#d9ab88', hair: { style: 'curly', color: '#b08a4a' },
    top: { kind: 'polo', color: '#8a4a6a' }, bottom: { kind: 'pants', color: '#2a2a30' }, shoes: '#e0dcd2', extras: ['earrings'] });
  // Tomas, the alley delivery bay ("Not my business, man.").
  look('tomas', { h: 46, build: 'avg', skin: '#b07e5c', hair: { style: 'cap', color: '#4a5a3a', under: '#1e1610' },
    top: { kind: 'jacket', color: '#5a5a5e', color2: '#8a8478' }, bottom: { kind: 'pants', color: '#3a3c40' }, shoes: '#2a2420', extras: [] });

  /* ════════════════════════════════════════════════════════════════════
     ST. AGNES (Chapter 1)
     ════════════════════════════════════════════════════════════════════ */
  // Hana Lim: slim, black ponytail (a pencil through it), white cardigan over teal scrubs, badge on a
  // lanyard, white sneakers, the clipboard she hugs.
  look('hana', { h: 42, build: 'slim', skin: '#dcae88', hair: { style: 'ponytail', color: '#16120f' },
    top: { kind: 'cardigan', color: '#d8d4c8', color2: '#3f7f7c' }, bottom: { kind: 'pants', color: '#3f7f7c' }, shoes: '#e0dcd2',
    extras: ['lanyard', 'clipboard'] });
  // Hana working the gym (kneeling at the bars, spotting): scrubs only, no clipboard in her hands.
  look('hana_scrubs', { h: 42, build: 'slim', skin: '#dcae88', hair: { style: 'ponytail', color: '#16120f' },
    top: { kind: 'scrubs', color: '#3f7f7c' }, bottom: { kind: 'pants', color: '#3f7f7c' }, shoes: '#e0dcd2', extras: ['lanyard', 'watch'] });
  // Hana off duty: navy peacoat, gray scarf.
  look('hana_coat', { h: 42, build: 'slim', skin: '#dcae88', hair: { style: 'ponytail', color: '#16120f' },
    top: { kind: 'coat', color: '#28304a', color2: '#5a6472' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2a2626', extras: ['scarf:#7c7e84'] });
  // Gerald Pike: comb-over, wire glasses, a brown suit a size too big under the tan raincoat he never takes off.
  look('pike', { h: 44, build: 'slim', skin: '#e0b898', hair: { style: 'slick', color: '#6a5a48' },
    top: { kind: 'trench', color: '#a89670', color2: '#5a4632' }, bottom: { kind: 'slacks', color: '#4e3e2e' }, shoes: '#2a2018',
    extras: ['glasses', 'tie:#6a5a3a'] });
  // Pike at the Fund office, Saturday night (Ch6): shirtsleeves, the raincoat on the chair.
  look('pike_shirt', { h: 44, build: 'slim', skin: '#e0b898', hair: { style: 'slick', color: '#6a5a48' },
    top: { kind: 'shirt', color: '#d8d0bc' }, bottom: { kind: 'slacks', color: '#4e3e2e' }, shoes: '#2a2018', extras: ['glasses', 'tie:#6a5a3a'] });
  // Earl Dunning, Room 214's other bed: cardigan over pyjamas, slippers, glasses for the crossword.
  look('earl', { h: 44, build: 'old', skin: '#d9ab88', hair: { style: 'gray_short', color: '#c8c4bc' },
    top: { kind: 'cardigan', color: '#7a6a58', color2: '#9aa6b4' }, bottom: { kind: 'pants', color: '#9aa6b4' }, shoes: '#5a4a3a', extras: ['glasses'] });
  // Nurse Dolores Reyes: lavender scrubs (Hana's are teal), a watch, the binder.
  look('dolores', { h: 43, build: 'avg', skin: '#b98762', hair: { style: 'bun', color: '#2a1c16' },
    top: { kind: 'scrubs', color: '#8a7aa0' }, bottom: { kind: 'pants', color: '#8a7aa0' }, shoes: '#e0dcd2', extras: ['watch', 'lanyard'] });
  // Dr. Anita Whitlow, attending physiatrist: white coat over a slate blouse.
  look('whitlow', { h: 45, build: 'slim', skin: '#8a5a3c', hair: { style: 'bob', color: '#1a1410' },
    top: { kind: 'coat', color: '#e0dcd2', color2: '#5a6a7a', long: true }, bottom: { kind: 'slacks', color: '#3a3e48' }, shoes: '#2a2626', extras: ['glasses'] });
  // Sister Margaret Doyle, administrator: plain navy cardigan and skirt.
  look('sister_margaret', { h: 42, build: 'old', skin: '#e8c4a6', hair: { style: 'gray_short', color: '#c8c4bc' },
    top: { kind: 'cardigan', color: '#2e3a52', color2: '#d8d4ca' }, bottom: { kind: 'long_skirt', color: '#2e3a52' }, shoes: '#1e1c20', extras: ['glasses'] });

  /* ════════════════════════════════════════════════════════════════════
     PIKE'S COLLECTORS AND THE YMCA (Chapter 2)
     ════════════════════════════════════════════════════════════════════ */
  // Benny Szabo (collector): quilted brown vest over a gray hoodie; the pickup order is in the vest.
  look('benny', { h: 50, build: 'heavy', skin: '#c88e6a', hair: { style: 'buzz', color: '#3a2a20' },
    top: { kind: 'vest', color: '#4a3e30', color2: '#6a6e74' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#221f22', extras: ['mustache:#3a2a20'] });
  // Carl Dunphy (collector): the worn leather coat, knit cap, beard.
  look('carl', { h: 50, build: 'heavy', skin: '#d4a07a', hair: { style: 'beanie', color: '#4a4a50', under: '#4a3a2c' },
    top: { kind: 'coat', color: '#5a4a3c', color2: '#6e6256' }, bottom: { kind: 'slacks', color: '#3a3a42' }, shoes: '#221f22', extras: ['beard:#5a4632'] });
  // Vic, the van's driver (thug, light).
  look('vic', { h: 47, build: 'broad', skin: '#b07e5c', hair: { style: 'short', color: '#1e1610' },
    top: { kind: 'jacket', color: '#4a4236', color2: '#8a8478' }, bottom: { kind: 'jeans', color: '#2e3442' }, shoes: '#221f22', extras: [] });
  // Otis, Calder YMCA front desk.
  look('otis', { h: 46, build: 'avg', skin: '#6e4a32', hair: { style: 'gray_short', color: '#9c9890' },
    top: { kind: 'cardigan', color: '#7a3a34', color2: '#d8d0bc' }, bottom: { kind: 'slacks', color: '#3a3a40' }, shoes: '#2a2420', extras: ['glasses'] });

  /* ════════════════════════════════════════════════════════════════════
     STARLITE LANES AND THE CELLAR (Chapter 3; Ch6 corner night)
     ════════════════════════════════════════════════════════════════════ */
  // Mo Feeney: heavy, red face, white hair, plaid sport coat (a warm brown), open collar, the unlit cigar.
  look('mo', { h: 46, build: 'heavy', skin: '#d98c70', hair: { style: 'gray_short', color: '#e2ded6' },
    top: { kind: 'blazer', color: '#7a5a3a', color2: '#d8cfb8' }, bottom: { kind: 'slacks', color: '#4a4440' }, shoes: '#2a2420', extras: ['cigarette'] });
  // Deshawn Tillery: lean, gray hoodie, black trunks over tights, white sneakers.
  look('deshawn', { h: 46, build: 'boxer', skin: '#6e4a32', hair: { style: 'short', color: '#171210' },
    top: { kind: 'hoodie', color: '#7c7e82' }, bottom: { kind: 'shorts', color: '#1e1e22' }, shoes: '#d8d4ca', extras: [] });
  // Deshawn in the ring: black trunks, house gloves.
  look('deshawn_ring', { h: 46, build: 'boxer', skin: '#6e4a32', hair: { style: 'short', color: '#171210' },
    top: { kind: 'bare', color: '#6e4a32' }, bottom: { kind: 'trunks', color: '#1e1e22' }, shoes: '#d8d4ca', extras: ['gloves:' + HOUSE_GLOVE] });
  // Deshawn at the Courts gym and sparring Ray's camp (Ch5, Ch8): tank top, wraps, a headband for headgear.
  look('deshawn_gym', { h: 46, build: 'boxer', skin: '#6e4a32', hair: { style: 'short', color: '#171210' },
    top: { kind: 'tank', color: '#8a8c90' }, bottom: { kind: 'shorts', color: '#1e1e22' }, shoes: '#d8d4ca', extras: ['wraps', 'headband:#7a2e2a'] });
  // Stan "Wojo" Wojcik: heavy, a forklift driver's olive work jacket.
  look('wojo', { h: 48, build: 'heavy', skin: '#e0a88a', hair: { style: 'short', color: '#5a4634' },
    top: { kind: 'jacket', color: '#4e5a3e', color2: '#b8ae9a' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2e2a26', extras: [] });
  look('wojo_ring', { h: 48, build: 'heavy', skin: '#e0a88a', hair: { style: 'short', color: '#5a4634' },
    top: { kind: 'bare', color: '#e0a88a' }, bottom: { kind: 'trunks', color: '#8a3a2a' }, shoes: '#2e2a26', extras: ['gloves:' + HOUSE_GLOVE] });
  // Cyrus "Slim" Whitlock: long-armed, gray hoodie, a towel over his head (drawn as a hood in towel white).
  look('slim', { h: 50, build: 'slim', skin: '#7a5238', hair: { style: 'hood', color: '#cfc8b8' },
    top: { kind: 'hoodie', color: '#5e6064' }, bottom: { kind: 'sweats', color: '#2e3038' }, shoes: '#3a3a3e', extras: [] });
  look('slim_ring', { h: 50, build: 'boxer', skin: '#7a5238', hair: { style: 'buzz', color: '#1a1410' },
    top: { kind: 'bare', color: '#7a5238' }, bottom: { kind: 'trunks', color: '#4a4a50' }, shoes: '#3a3a3e', extras: ['gloves:' + HOUSE_GLOVE] });
  // Slim rented to the Ch10 crew: a borrowed black jacket, gym bag on his knees.
  look('slim_jacket', { h: 50, build: 'slim', skin: '#7a5238', hair: { style: 'buzz', color: '#1a1410' },
    top: { kind: 'jacket', color: '#222226', color2: '#5e6064' }, bottom: { kind: 'sweats', color: '#2e3038' }, shoes: '#3a3a3e', extras: ['bag:#3a3a3e'] });
  // Doc Ferris, ringside doctor (a vet for thirty-one years): cardigan, glasses, a black bag.
  look('ferris', { h: 43, build: 'old', skin: '#e2b48e', hair: { style: 'gray_short', color: '#d8d4cc' },
    top: { kind: 'cardigan', color: '#6a5a4a', color2: '#d8d0bc' }, bottom: { kind: 'slacks', color: '#3e3c3a' }, shoes: '#2a2420', extras: ['glasses', 'bag:#1e1a18'] });
  // Peg Halloran, shoe counter: teal bowling-alley shirt, dyed red curls.
  look('peg', { h: 42, build: 'avg', skin: '#e0b496', hair: { style: 'curly', color: '#a8604a' },
    top: { kind: 'polo', color: '#4a6a6a' }, bottom: { kind: 'slacks', color: '#3a3a40' }, shoes: '#2a2626', extras: ['earrings', 'glasses'] });
  // Bruno "Tiny" Russo, the door: big, bald, black tee.
  look('tiny', { h: 52, build: 'heavy', skin: '#c48e68', hair: { style: 'bald', color: '#2a2018' },
    top: { kind: 'tee', color: '#1e1e22' }, bottom: { kind: 'pants', color: '#2a2a30' }, shoes: '#141416', extras: ['mustache:#3a2a20'] });
  // Tiny refereeing: a pale referee's shirt and a black bow tie (stripes are too fine for the sprite).
  look('tiny_ref', { h: 52, build: 'heavy', skin: '#c48e68', hair: { style: 'bald', color: '#2a2018' },
    top: { kind: 'shirt', color: '#c8c4bc' }, bottom: { kind: 'slacks', color: '#1e1e22' }, shoes: '#141416', extras: ['mustache:#3a2a20', 'tie:#141416'] });

  /* ════════════════════════════════════════════════════════════════════
     HARLAN STREET AND THE DEPOT (Chapter 4; Ch7, Ch9-10)
     ════════════════════════════════════════════════════════════════════ */
  // Fran DeLuca, Harlan Grill waitress.
  look('fran', { h: 43, build: 'avg', skin: '#d9ab88', hair: { style: 'bun', color: '#8a7a6a' },
    top: { kind: 'dress', color: '#8a5a5a', color2: '#d8d0c0' }, bottom: { kind: 'skirt', color: '#8a5a5a' }, shoes: '#e0dcd2', extras: ['apron:#e0dacc'] });
  // Pat Gorman, seventy, the old gate man (never hostile, never hittable): guard cap, green work jacket.
  look('pat', { h: 44, build: 'old', skin: '#d9a888', hair: { style: 'cap', color: '#3a4458', under: '#c8c4bc' },
    top: { kind: 'jacket', color: '#4a5a4a', color2: '#b8ae9a' }, bottom: { kind: 'pants', color: '#3a3c40' }, shoes: '#2a2420', extras: [] });
  // Carmine "Whistle" Dalto, yard foreman (director): cap, canvas jacket, clipboard, the whistle on a lanyard.
  look('whistle', { h: 46, build: 'avg', skin: '#c48e68', hair: { style: 'cap', color: '#7a3a2e', under: '#2a2018' },
    top: { kind: 'jacket', color: '#5a4e3a', color2: '#9a9080' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2e2a26', extras: ['clipboard', 'lanyard'] });
  // Whistle in a fight (no clipboard in his hands).
  look('whistle_fight', { h: 46, build: 'avg', skin: '#c48e68', hair: { style: 'cap', color: '#7a3a2e', under: '#2a2018' },
    top: { kind: 'jacket', color: '#5a4e3a', color2: '#9a9080' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2e2a26', extras: ['lanyard'] });
  // Roz Kaminski, night dispatcher: mint cardigan, pencil behind her ear, crossword.
  look('roz', { h: 42, build: 'avg', skin: '#e0b496', hair: { style: 'bob', color: '#9a8a7a' },
    top: { kind: 'cardigan', color: '#8ab0a0', color2: '#d8d0bc' }, bottom: { kind: 'slacks', color: '#4a4a50' }, shoes: '#2a2626', extras: ['glasses'] });
  // Francis "Dutch" Brannigan: the biggest man in the game; navy peacoat, black knit cap, gray stubble.
  look('dutch', { h: 52, build: 'heavy', skin: '#d09a7a', hair: { style: 'beanie', color: '#22252a', under: '#8a8680' },
    top: { kind: 'coat', color: '#26304a', color2: '#3a3a40' }, bottom: { kind: 'pants', color: '#2e2c2a' }, shoes: '#1e1a18', extras: ['beard:#9a948a'] });
  // Dutch with the peacoat folded away (he does that before a fight): a charcoal knit sweater.
  look('dutch_fight', { h: 52, build: 'heavy', skin: '#d09a7a', hair: { style: 'beanie', color: '#22252a', under: '#8a8680' },
    top: { kind: 'sweater', color: '#3e3c3a' }, bottom: { kind: 'pants', color: '#2e2c2a' }, shoes: '#1e1a18', extras: ['beard:#9a948a'] });
  // Vince Carrow, Harlan Street crew boss: leather jacket, clipboard, never raises his voice.
  look('carrow', { h: 47, build: 'avg', skin: '#d4a07a', hair: { style: 'slick', color: '#1e1610' },
    top: { kind: 'leather', color: '#2a2624', color2: '#6a6a6e' }, bottom: { kind: 'slacks', color: '#2e2e34' }, shoes: '#141416', extras: ['clipboard'] });
  // Carrow directing a fight (Ending Two wave 2): no clipboard.
  look('carrow_fight', { h: 47, build: 'avg', skin: '#d4a07a', hair: { style: 'slick', color: '#1e1610' },
    top: { kind: 'leather', color: '#2a2624', color2: '#6a6a6e' }, bottom: { kind: 'slacks', color: '#2e2e34' }, shoes: '#141416', extras: [] });

  /* ════════════════════════════════════════════════════════════════════
     FOUNDRY COURTS AND THE COUNCIL (Chapter 5 onward)
     ════════════════════════════════════════════════════════════════════ */
  // Mara Kowalski: broad, short ash-blond hair under a dark-green beanie, brown canvas work jacket over a gray
  // hoodie, work pants, boots. (Tool belt, red rag and pencil are prop-level details.)
  look('mara', { h: 44, build: 'broad', skin: '#e2b48e', hair: { style: 'beanie', color: '#3a4a38', under: '#b8a888' },
    top: { kind: 'jacket', color: '#6e5034', color2: '#7a7a7c' }, bottom: { kind: 'pants', color: '#4a4438' }, shoes: '#4a3424', extras: [] });
  // Odette Baptiste, 71, tenants' secretary: small, gray bun, camel cardigan over a slate-teal dress, glasses.
  look('odette', { h: 38, build: 'old', skin: '#5f3e2a', hair: { style: 'bun', color: '#bdb8ae' },
    top: { kind: 'cardigan', color: '#8a6a4a', color2: '#3e5a6a' }, bottom: { kind: 'long_skirt', color: '#3e5a6a' }, shoes: '#2a2220', extras: ['glasses'] });
  // Odette going out (Ch7, the union hall walk under the lavender umbrella): her plum winter coat.
  look('odette_coat', { h: 38, build: 'old', skin: '#5f3e2a', hair: { style: 'bun', color: '#bdb8ae' },
    top: { kind: 'coat', color: '#5a4a5e', color2: '#3e5a6a', long: true }, bottom: { kind: 'long_skirt', color: '#3e5a6a' }, shoes: '#2a2220', extras: ['glasses', 'scarf:#8a7a9a'] });
  // Gus Lindqvist, 68: stooped, olive cardigan, coughing.
  look('gus', { h: 44, build: 'old', skin: '#e0b496', hair: { style: 'gray_short', color: '#c8c4bc' },
    top: { kind: 'cardigan', color: '#6a6a50', color2: '#b8b0a0' }, bottom: { kind: 'slacks', color: '#4a4840' }, shoes: '#3a3028', extras: [] });
  // Darnell Greer: orange rail vest over a dark long-sleeve, a hard hat (drawn as a yellow cap).
  look('darnell', { h: 47, build: 'broad', skin: '#6a4632', hair: { style: 'cap', color: '#c8a03a', under: '#171210' },
    top: { kind: 'vest', color: '#c86a2a', color2: '#4a4e58' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#3a2a20', extras: [] });
  // Keisha Greer, 8: pink jacket, braids, hopscotch.
  look('keisha', { h: 30, build: 'kid', skin: '#6e4a32', hair: { style: 'braids', color: '#1a1410' },
    top: { kind: 'jacket', color: '#c86a8a', color2: '#e0d8cc' }, bottom: { kind: 'jeans', color: '#4a5a7a' }, shoes: '#d8d4ca', extras: [] });
  // Keisha in Deshawn's oversized gloves.
  look('keisha_gloves', { h: 30, build: 'kid', skin: '#6e4a32', hair: { style: 'braids', color: '#1a1410' },
    top: { kind: 'jacket', color: '#c86a8a', color2: '#e0d8cc' }, bottom: { kind: 'jeans', color: '#4a5a7a' }, shoes: '#d8d4ca', extras: ['gloves:#a83a2c'] });
  // Nell Faraday, Council site coordinator: blue-gray cardigan, clipboard, glasses.
  look('nell', { h: 43, build: 'avg', skin: '#ddb08e', hair: { style: 'bob', color: '#8a7a6a' },
    top: { kind: 'cardigan', color: '#5a6a7a', color2: '#d8cfc0' }, bottom: { kind: 'slacks', color: '#3e3e46' }, shoes: '#2a2420', extras: ['glasses', 'clipboard'] });
  // Elena Vasquez: a purple-gray parka, carrying a child.
  look('elena', { h: 42, build: 'slim', skin: '#b98762', hair: { style: 'ponytail', color: '#1e1610' },
    top: { kind: 'jacket', color: '#5a4a6a', color2: '#c8b8a0' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2a2626', extras: [] });
  // One of Elena's three children.
  look('vasquez_kid', { h: 28, build: 'kid', skin: '#b98762', hair: { style: 'short', color: '#1e1610' },
    top: { kind: 'hoodie', color: '#7a6a3a' }, bottom: { kind: 'pants', color: '#4a5670' }, shoes: '#d8d4ca', extras: [] });
  // Walter Rook, 63: broad, a flat cap (drawn as a low cap), trimmed gray beard, canvas work jacket over a cardigan.
  look('rook', { h: 48, build: 'broad', skin: '#d4a07a', hair: { style: 'cap', color: '#5a5248', under: '#a8a49c' },
    top: { kind: 'jacket', color: '#8a7a58', color2: '#5e5446' }, bottom: { kind: 'pants', color: '#3e3c3a' }, shoes: '#2e2620', extras: ['beard:#b0aca4'] });
  // Rook with the cap in his hands (Ch7 confession), and with his reading glasses on (the ledgers).
  look('rook_bare', { h: 48, build: 'broad', skin: '#d4a07a', hair: { style: 'gray_short', color: '#a8a49c' },
    top: { kind: 'jacket', color: '#8a7a58', color2: '#5e5446' }, bottom: { kind: 'pants', color: '#3e3c3a' }, shoes: '#2e2620', extras: ['beard:#b0aca4'] });
  look('rook_glasses', { h: 48, build: 'broad', skin: '#d4a07a', hair: { style: 'cap', color: '#5a5248', under: '#a8a49c' },
    top: { kind: 'jacket', color: '#8a7a58', color2: '#5e5446' }, bottom: { kind: 'pants', color: '#3e3c3a' }, shoes: '#2e2620', extras: ['beard:#b0aca4', 'glasses'] });
  // Rook in 1994, Section 11, Row K: the same cap, a darker beard, a summer shirt under the jacket.
  look('rook_1994', { h: 48, build: 'broad', skin: '#d4a07a', hair: { style: 'cap', color: '#5a5248', under: '#8a8680' },
    top: { kind: 'jacket', color: '#7a6c50', color2: '#c8c0b0' }, bottom: { kind: 'pants', color: '#3e3c3a' }, shoes: '#2e2620', extras: ['beard:#8a8680'] });
  // Wanda Wojcik, 74, Council volunteer (knitting at the lobby desk).
  look('wanda', { h: 40, build: 'old', skin: '#e8c4a6', hair: { style: 'curly', color: '#c8c4bc' },
    top: { kind: 'cardigan', color: '#9a6a6a', color2: '#d8d0bc' }, bottom: { kind: 'long_skirt', color: '#4a4450' }, shoes: '#2a2220', extras: ['glasses'] });
  // Background residents for the Ch5/Ch7 meetings and the yard (the posed silhouettes who murmur).
  look('courts_resident_m', { h: 46, build: 'avg', skin: '#a8714f', hair: { style: 'short', color: '#1e1610' },
    top: { kind: 'jacket', color: '#5a5446', color2: '#9a9080' }, bottom: { kind: 'pants', color: '#3a3c40' }, shoes: '#2a2420', extras: [] });
  look('courts_resident_f', { h: 42, build: 'avg', skin: '#e0b496', hair: { style: 'bob', color: '#6a4a32' },
    top: { kind: 'coat', color: '#6a5a4e', color2: '#c8c0b0' }, bottom: { kind: 'slacks', color: '#3e3e46' }, shoes: '#2a2626', extras: ['scarf:#7a5a5a'] });
  look('courts_resident_old', { h: 42, build: 'old', skin: '#8a5c40', hair: { style: 'cap', color: '#4a4a50', under: '#bdb8ae' },
    top: { kind: 'coat', color: '#4a4a42', color2: '#9a9080' }, bottom: { kind: 'slacks', color: '#3a3a40' }, shoes: '#2a2420', extras: [] });
  look('courts_kid', { h: 29, build: 'kid', skin: '#c9966e', hair: { style: 'curly', color: '#2a1f18' },
    top: { kind: 'hoodie', color: '#6a7a5a' }, bottom: { kind: 'jeans', color: '#4a5a7a' }, shoes: '#d8d4ca', extras: [] });

  /* ════════════════════════════════════════════════════════════════════
     DOWNTOWN, GARRISON STREET, THE ANNEX (Chapter 6; Ch8)
     ════════════════════════════════════════════════════════════════════ */
  // Arnie Dukes, Annex property cage: gray cardigan, a pencil behind each ear.
  look('dukes', { h: 45, build: 'old', skin: '#d4a07a', hair: { style: 'gray_short', color: '#a8a49c' },
    top: { kind: 'cardigan', color: '#7a7a7e', color2: '#d8d0bc' }, bottom: { kind: 'slacks', color: '#3e3e44' }, shoes: '#2a2420', extras: ['glasses'] });
  // Bernice Hale, Window 5: cat-eye glasses on a chain, purple cardigan, a radio earpiece for the ballgame.
  look('hale', { h: 43, build: 'avg', skin: '#8a5c40', hair: { style: 'bob', color: '#4a4440' },
    top: { kind: 'cardigan', color: '#6a4a7a', color2: '#d8d0bc' }, bottom: { kind: 'skirt', color: '#3a3a44' }, shoes: '#2a2220', extras: ['glasses', 'earrings'] });
  // Wendell Asher, former Lindell night man, folding sheets at Garrison Suds.
  look('asher', { h: 45, build: 'old', skin: '#a8714f', hair: { style: 'gray_short', color: '#9c9890' },
    top: { kind: 'shirt', color: '#8a8070' }, bottom: { kind: 'pants', color: '#4a4a42' }, shoes: '#2a2420', extras: [] });
  // Fitz Mahoney and his cousins, copper strippers (thug builds, hard hats).
  look('fitz', { h: 48, build: 'broad', skin: '#d9a888', hair: { style: 'cap', color: '#b8943a', under: '#4a3a2a' },
    top: { kind: 'jacket', color: '#5a4a3a', color2: '#8a7a68' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2e2a26', extras: ['beard:#4a3a2a'] });
  look('fitz_cousin', { h: 47, build: 'broad', skin: '#d4a07a', hair: { style: 'cap', color: '#a88a3a', under: '#6a4a32' },
    top: { kind: 'hoodie', color: '#5e5a4a' }, bottom: { kind: 'jeans', color: '#3a4050' }, shoes: '#2e2a26', extras: [] });
  look('fitz_cousin2', { h: 46, build: 'avg', skin: '#c8926c', hair: { style: 'cap', color: '#b8943a', under: '#2a2018' },
    top: { kind: 'jacket', color: '#4a4e3e', color2: '#8a8478' }, bottom: { kind: 'pants', color: '#3a3836' }, shoes: '#2e2a26', extras: ['mustache:#2a2018'] });
  // Dot Pham, Kwik Copy (Min's coworker): red polo, toner on her sleeves.
  look('dot', { h: 41, build: 'slim', skin: '#dcae88', hair: { style: 'ponytail', color: '#16120f' },
    top: { kind: 'polo', color: '#a84a40' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2a2626', extras: [] });
  // Dot at 5:20 AM (Ch8): a coat over her pajamas.
  look('dot_coat', { h: 41, build: 'slim', skin: '#dcae88', hair: { style: 'ponytail', color: '#16120f' },
    top: { kind: 'coat', color: '#5a5a62', color2: '#8a7aa0' }, bottom: { kind: 'pants', color: '#8a7aa0' }, shoes: '#6a5a4a', extras: [] });
  // Dr. Saul Brandt, the dentist at 88 Market: white coat, keys in hand.
  look('brandt', { h: 45, build: 'old', skin: '#e2b48e', hair: { style: 'bald', color: '#9c9890' },
    top: { kind: 'coat', color: '#e0dcd2', color2: '#7a8a9a' }, bottom: { kind: 'slacks', color: '#3e3e44' }, shoes: '#1a1614', extras: ['glasses', 'mustache:#9c9890'] });

  /* ════════════════════════════════════════════════════════════════════
     CASTELL GYM AND THE PRESS (Chapter 8)
     ════════════════════════════════════════════════════════════════════ */
  // Castell Champions Gym front desk: a gold polo (the gym's colour).
  look('gym_desk', { h: 43, build: 'slim', skin: '#c48e68', hair: { style: 'bob', color: '#2a201a' },
    top: { kind: 'polo', color: '#a88a3a' }, bottom: { kind: 'slacks', color: '#2a2a30' }, shoes: '#e0dcd2', extras: ['earrings'] });
  // Joan Albright, Calder Ledger metro desk: dark green coat, steno pad.
  look('joan', { h: 43, build: 'slim', skin: '#e8c4a6', hair: { style: 'curly', color: '#6a4a32' },
    top: { kind: 'coat', color: '#3e4e42', color2: '#c8c0b0' }, bottom: { kind: 'slacks', color: '#3a3a40' }, shoes: '#2a2626', extras: ['glasses'] });
  // The photographer folding his light stand (Ch8) and press-row people.
  look('photographer', { h: 46, build: 'avg', skin: '#d9ab88', hair: { style: 'short', color: '#4a3a2c' },
    top: { kind: 'vest', color: '#5a5a4a', color2: '#7a7468' }, bottom: { kind: 'jeans', color: '#3a4050' }, shoes: '#2a2420', extras: ['bag:#2a2a2e'] });

  /* ════════════════════════════════════════════════════════════════════
     ASHGROVE (Chapter 9)
     ════════════════════════════════════════════════════════════════════ */
  // Celeste Ashgrove: silver bob, black turtleneck under a charcoal tailored suit, pearl earrings.
  look('celeste', { h: 44, build: 'slim', skin: '#e6c2a4', hair: { style: 'bob', color: '#c8c6c2' },
    top: { kind: 'suit', color: '#3a3a40', color2: '#1a1a1e' }, bottom: { kind: 'slacks', color: '#3a3a40' }, shoes: '#141416', extras: ['earrings'] });
  // Lyle Penner: slim, horn-rimmed glasses, the navy suit's trousers with his shirt sleeves rolled.
  look('penner', { h: 47, build: 'slim', skin: '#dcb090', hair: { style: 'short', color: '#4a3a2c' },
    top: { kind: 'shirt', color: '#d4d8de' }, bottom: { kind: 'slacks', color: '#26304a' }, shoes: '#141416', extras: ['glasses', 'tie:#26304a'] });
  // Penner with the navy jacket on (Ending One press lobby, the closing).
  look('penner_suit', { h: 47, build: 'slim', skin: '#dcb090', hair: { style: 'short', color: '#4a3a2c' },
    top: { kind: 'suit', color: '#26304a', color2: '#d4d8de' }, bottom: { kind: 'slacks', color: '#26304a' }, shoes: '#141416', extras: ['glasses', 'tie:#6a2a2a'] });
  // Owen Tully, 26, analyst on floor 22.
  look('owen', { h: 46, build: 'slim', skin: '#e2b48e', hair: { style: 'short', color: '#6a4a32' },
    top: { kind: 'shirt', color: '#c8d0dc' }, bottom: { kind: 'slacks', color: '#3a3e48' }, shoes: '#1a1614', extras: ['glasses', 'tie:#5a2a2a'] });
  // Mr. Garvey, head of building security (director): dark blazer, badge, radio.
  look('garvey', { h: 48, build: 'broad', skin: '#8a5c40', hair: { style: 'bald', color: '#2a2018' },
    top: { kind: 'blazer', color: '#2a2e38', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#3a3c44' }, shoes: '#141416', extras: ['tie:#2a2e38', 'badge', 'mustache:#2a2018'] });

  /* ════════════════════════════════════════════════════════════════════
     ALDER ROW (Chapter 10 only; strangers, each doing one human thing)
     ════════════════════════════════════════════════════════════════════ */
  // Mr. Tran, TRAN SHOE REPAIR · KEYS CUT: gray apron, pouring free coffee.
  look('tran', { h: 44, build: 'avg', skin: '#d6a47e', hair: { style: 'gray_short', color: '#9c9890' },
    top: { kind: 'shirt', color: '#7a7468' }, bottom: { kind: 'slacks', color: '#3e3e44' }, shoes: '#2a2420', extras: ['apron:#7a7a78'] });
  // Rosa Medina, house 7, dragging a crib mattress.
  look('rosa', { h: 42, build: 'avg', skin: '#b98762', hair: { style: 'long', color: '#2a1c16' },
    top: { kind: 'sweater', color: '#8a4a4a' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#d8d4ca', extras: [] });
  // Gloria Pryor, co-op president (70s): reading glasses, a clipboard, a plum coat.
  look('gloria', { h: 40, build: 'old', skin: '#5f3e2a', hair: { style: 'bob', color: '#c4c0b8' },
    top: { kind: 'coat', color: '#5a4a5a', color2: '#c8c0b0' }, bottom: { kind: 'long_skirt', color: '#3a3a42' }, shoes: '#2a2220', extras: ['glasses', 'clipboard'] });
  // Terrence Pryor, 19, a broom handle held like a bat.
  look('terrence', { h: 47, build: 'avg', skin: '#6e4a32', hair: { style: 'buzz', color: '#151010' },
    top: { kind: 'hoodie', color: '#4a5a3e' }, bottom: { kind: 'jeans', color: '#2e3442' }, shoes: '#d8d4ca', extras: [] });
  // Henry Odell, 84: overcoat over pyjamas, slippers, a radio on his knee.
  look('odell', { h: 42, build: 'old', skin: '#d9ab88', hair: { style: 'gray_short', color: '#d8d4cc' },
    top: { kind: 'coat', color: '#4a4438', color2: '#8a96a8' }, bottom: { kind: 'pants', color: '#8a96a8' }, shoes: '#6a5a4a', extras: [] });
  // June, 10, on her bike with DO NOT SIGN ANYTHING flyers.
  look('june', { h: 32, build: 'kid', skin: '#a8714f', hair: { style: 'ponytail', color: '#1e1610' },
    top: { kind: 'jacket', color: '#b89a3e', color2: '#e0d8cc' }, bottom: { kind: 'jeans', color: '#4a5a7a' }, shoes: '#b0443a', extras: [] });
  // Background neighbours on the row.
  look('alder_neighbor_m', { h: 46, build: 'avg', skin: '#c48e68', hair: { style: 'beanie', color: '#5a4a3a', under: '#2a2018' },
    top: { kind: 'jacket', color: '#4e4a40', color2: '#9a9080' }, bottom: { kind: 'jeans', color: '#3a4050' }, shoes: '#2a2420', extras: [] });
  look('alder_neighbor_f', { h: 42, build: 'slim', skin: '#8a5c40', hair: { style: 'curly', color: '#1e1610' },
    top: { kind: 'cardigan', color: '#6a5a4a', color2: '#c8c0b0' }, bottom: { kind: 'long_skirt', color: '#3e3e46' }, shoes: '#2a2220', extras: [] });
  // Brenda (Channel 6 reporter) and Ed (her cameraman).
  look('brenda', { h: 43, build: 'slim', skin: '#c48e68', hair: { style: 'bob', color: '#3a2a20' },
    top: { kind: 'blazer', color: '#8a3a3a', color2: '#d8d4ca' }, bottom: { kind: 'skirt', color: '#2e2e34' }, shoes: '#141416', extras: ['earrings'] });
  look('ed', { h: 47, build: 'heavy', skin: '#d9ab88', hair: { style: 'cap', color: '#4a5a6a', under: '#5a4a3a' },
    top: { kind: 'vest', color: '#5a5a4a', color2: '#7a7468' }, bottom: { kind: 'jeans', color: '#3a4050' }, shoes: '#2a2420', extras: ['beard:#6a5a48'] });

  /* ════════════════════════════════════════════════════════════════════
     ENDINGS
     ════════════════════════════════════════════════════════════════════ */
  // Ending One: Jin's cornerman (hands him a bottle) and the young fighter in green trunks.
  look('cornerman', { h: 46, build: 'avg', skin: '#d4a07a', hair: { style: 'short', color: '#2a2018' },
    top: { kind: 'jacket', color: '#2a2e3a', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#2a2a30' }, shoes: '#141416', extras: ['lanyard'] });
  look('fighter_green', { h: 46, build: 'boxer', skin: '#c99a78', hair: { style: 'short', color: '#3a2a1e' },
    top: { kind: 'bare', color: '#c99a78' }, bottom: { kind: 'trunks', color: '#3e6a4a' }, shoes: '#2a2a2e', extras: ['gloves:#2e2e34'] });
  // Ending Two, the last image: a small boy in oversized gloves ("Coach. What's your name?").
  look('kid_gloves', { h: 29, build: 'kid', skin: '#a8714f', hair: { style: 'short', color: '#1e1610' },
    top: { kind: 'tee', color: '#8a8c90' }, bottom: { kind: 'shorts', color: '#2e3442' }, shoes: '#d8d4ca', extras: ['gloves:#a83a2c'] });

  /* ════════════════════════════════════════════════════════════════════
     GENERIC ENEMIES AND STAFF (pass as `look` in EncounterDef / spawnEnemy)
     Archetype defaults (combat.js) stay valid: thug, collector, guard, man (director).
     ════════════════════════════════════════════════════════════════════ */
  // Harlan Street enforcer (combat type 'enforcer'): black leather, buzz cut.
  look('enforcer', { h: 49, build: 'broad', skin: '#c48e68', hair: { style: 'buzz', color: '#1e1610' },
    top: { kind: 'leather', color: '#2a2624', color2: '#5a5a5e' }, bottom: { kind: 'jeans', color: '#2e3442' }, shoes: '#141416', extras: [] });
  // Harlan Freight dockhands (thugs, Ch4): canvas work coats and knit caps, two variants.
  look('thug_dock', { h: 47, build: 'broad', skin: '#b98563', hair: { style: 'beanie', color: '#5a3a30', under: '#2a2018' },
    top: { kind: 'jacket', color: '#5a5440', color2: '#8a8070' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2e2a26', extras: [] });
  look('thug_dock2', { h: 46, build: 'avg', skin: '#d4a07a', hair: { style: 'cap', color: '#3e4636', under: '#4a3a2a' },
    top: { kind: 'hoodie', color: '#6a5038' }, bottom: { kind: 'pants', color: '#3a3836' }, shoes: '#2e2a26', extras: ['beard:#4a3a2a'] });
  // Depot heavy (collector archetype in the yard): a quilted work coat.
  look('collector_dock', { h: 50, build: 'heavy', skin: '#a8714f', hair: { style: 'beanie', color: '#3a3a3e', under: '#1e1610' },
    top: { kind: 'coat', color: '#4e4232', color2: '#6e6256' }, bottom: { kind: 'pants', color: '#2e2e30' }, shoes: '#221f22', extras: [] });
  // The younger night man with a dock baton (guard, Ch4).
  look('guard_dock', { h: 47, build: 'avg', skin: '#c8926c', hair: { style: 'cap', color: '#2e3440', under: '#2a2018' },
    top: { kind: 'uniform', color: '#4a4e44', color2: '#b8a46a' }, bottom: { kind: 'slacks', color: '#2a2c2a' }, shoes: '#151519', extras: ['badge'] });
  // Ashgrove Tower security (guard, Ch9): navy blazer, gray slacks, tie, badge; two variants.
  look('guard_tower', { h: 47, build: 'avg', skin: '#d4a07a', hair: { style: 'short', color: '#2a2018' },
    top: { kind: 'blazer', color: '#262c3a', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#4a4c52' }, shoes: '#141416', extras: ['tie:#262c3a', 'badge'] });
  look('guard_tower2', { h: 48, build: 'broad', skin: '#7a5238', hair: { style: 'buzz', color: '#151010' },
    top: { kind: 'blazer', color: '#262c3a', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#4a4c52' }, shoes: '#141416', extras: ['tie:#262c3a', 'badge'] });
  // Harlan Street crew at Alder Row (Ch10): dark work jackets and knit caps, three variants.
  look('crew', { h: 47, build: 'broad', skin: '#c48e68', hair: { style: 'beanie', color: '#2a2c30', under: '#2a2018' },
    top: { kind: 'jacket', color: '#3a3a36', color2: '#7a7468' }, bottom: { kind: 'jeans', color: '#2e3442' }, shoes: '#1e1c1a', extras: [] });
  look('crew2', { h: 48, build: 'heavy', skin: '#d9a888', hair: { style: 'cap', color: '#4a3a2e', under: '#5a4a3a' },
    top: { kind: 'coat', color: '#4a4034', color2: '#6e6256' }, bottom: { kind: 'pants', color: '#2e2e30' }, shoes: '#1e1c1a', extras: ['beard:#5a4a3a'] });
  look('crew3', { h: 46, build: 'avg', skin: '#8a5c40', hair: { style: 'short', color: '#151010' },
    top: { kind: 'hoodie', color: '#5a5048' }, bottom: { kind: 'jeans', color: '#3a4050' }, shoes: '#1e1c1a', extras: [] });
  // Truckers at the Grill counter (unnamed texture, Ch4).
  look('trucker', { h: 48, build: 'heavy', skin: '#d9a888', hair: { style: 'cap', color: '#7a2e2a', under: '#5a4a3a' },
    top: { kind: 'jacket', color: '#3a4a3a', color2: '#a89a80' }, bottom: { kind: 'jeans', color: '#3c465a' }, shoes: '#2e2a26', extras: ['beard:#5a4a3a'] });
  look('trucker2', { h: 47, build: 'broad', skin: '#b07e5c', hair: { style: 'cap', color: '#3a4a5a', under: '#2a2018' },
    top: { kind: 'shirt', color: '#7a5a4a' }, bottom: { kind: 'jeans', color: '#2e3442' }, shoes: '#2e2a26', extras: ['mustache:#2a2018'] });

  /* ════════════════════════════════════════════════════════════════════
     CAST — S.cast[id] = base PersonDef (+ full, alt, rel). Roles are what Jin knows at first meeting:
     no role spoils a later discovery. Chapters add notes, and may override role/look for that chapter.
     `alt` = { fromChapter: lookId } for S.castLook; `rel` = the relationship meter id where one exists.
     ════════════════════════════════════════════════════════════════════ */
  const C = [
    // id, name (dialogue plate), full name, role, look, alt, rel
    ['jin', 'Jin', 'Seo Jin', 'The Kessler Kid. Eastgate.', 'jin', { 0: 'jin_1994', 1: 'jin_hospital', 2: 'jin_street' }],
    ['min', 'Min', 'Seo Min-ji', 'Jin’s sister.', 'min'],
    ['umma', 'Umma', 'Seo Mi-ok', 'Jin’s mother.', 'umma'],
    ['teddy', 'Teddy', 'Teddy Marsh', 'Coach Teddy Marsh. Marsh Boxing Club, Kessler Avenue.', 'teddy', { 0: 'teddy', 2: 'teddy_1996' }, 'teddy'],
    ['lenny', 'Lenny', 'Lenny Voss', 'Lenny Voss. Cutman. Worked Jin’s corner.', 'lenny', null, 'lenny'],
    ['camel_coat', 'The man in the camel coat', 'The man in the camel coat', 'Never gave a name.', 'camel_coat'],
    ['ray', 'Ray', 'Ray Castell', 'Ray Castell. The champion.', 'ray', { 0: 'ray_1994', 8: 'ray' }],
    ['referee', 'Referee', 'Phil Ostrowski', 'Phil Ostrowski. Referee.', 'referee'],
    ['inspector', 'Inspector', 'Commission inspector', 'Commission inspector, Calder Civic Arena.', 'inspector'],
    ['morty', 'Morty', 'Morty Fine', 'Morty Fine. Timekeeper at the Civic since 1961.', 'morty'],
    ['okafor', 'Mrs. Okafor', 'Grace Okafor', 'Mrs. Grace Okafor. Apartment 3A, 412 Kessler. Umma’s friend.', 'okafor'],
    ['rita', 'Rita', 'Rita Mancuso', 'Rita Mancuso. Waitress at Sunny’s Diner since 1981.', 'rita'],
    ['augie', 'Augie', 'Augie', 'Augie. The cook at Sunny’s.', 'augie'],
    ['petra', 'Petra', 'Petra Novak', 'Petra Novak. Lives in 3B now. Drives for Calder Transit.', 'petra'],
    ['rosie', 'Rosie', 'Rosie Novak', 'Rosie Novak. Three.', 'rosie'],
    ['receptionist', 'Receptionist', 'Receptionist', 'Front desk, Iron Pulse Fitness.', 'receptionist'],
    ['tomas', 'Tomas', 'Tomas', 'Tomas. Deliveries, the Pratt Alley bay.', 'tomas'],
    ['hana', 'Hana', 'Hana Lim', 'Hana Lim. Rehabilitation therapist, St. Agnes.', 'hana', { 1: 'hana' }, 'hana'],
    ['pike', 'Pike', 'Gerald Pike', 'Gerald Pike. Liaison, Calder Foundry Relief Fund.', 'pike'],
    ['earl', 'Earl', 'Earl Dunning', 'Earl Dunning. The other bed in Room 214. Retired Foundry rigger.', 'earl'],
    ['dolores', 'Dolores', 'Dolores Reyes', 'Nurse Dolores Reyes. 2 West, St. Agnes.', 'dolores'],
    ['whitlow', 'Dr. Whitlow', 'Anita Whitlow', 'Dr. Anita Whitlow. Attending physiatrist, St. Agnes.', 'whitlow'],
    ['sister_margaret', 'Sister Margaret', 'Margaret Doyle', 'Sister Margaret Doyle. Administrator, St. Agnes.', 'sister_margaret'],
    ['benny', 'Benny', 'Benny Szabo', 'Benny Szabo. One of Pike’s collectors.', 'benny'],
    ['carl', 'Carl', 'Carl Dunphy', 'Carl Dunphy. One of Pike’s collectors.', 'carl'],
    ['vic', 'Vic', 'Vic', 'Vic. Drives the gray van.', 'vic'],
    ['otis', 'Otis', 'Otis', 'Otis. Front desk, Calder YMCA.', 'otis'],
    ['mo', 'Mo', 'Maurice Feeney', 'Mo Feeney. Promoter. Runs the Cellar under Starlite Lanes.', 'mo'],
    ['deshawn', 'Deshawn', 'Deshawn Tillery', 'Deshawn Tillery. Trains in Mo’s room. Fights when Mo books him.', 'deshawn', { 3: 'deshawn' }, 'deshawn'],
    ['wojo', 'Wojo', 'Stan Wojcik', 'Stan “Wojo” Wojcik. Forklift driver. Fights for the fun of it.', 'wojo'],
    ['slim', 'Slim', 'Cyrus Whitlock', 'Cyrus “Slim” Whitlock. Ex-pro. Sleeps on a cot in the Pit.', 'slim', { 3: 'slim', 10: 'slim_jacket' }, 'slim'],
    ['ferris', 'Doc Ferris', 'Doc Ferris', 'Doc Ferris. Ringside doctor at the Cellar. A vet, mostly horses.', 'ferris'],
    ['peg', 'Peg', 'Peg Halloran', 'Peg Halloran. Shoe counter, Starlite Lanes.', 'peg'],
    ['tiny', 'Tiny', 'Bruno Russo', 'Bruno “Tiny” Russo. The fighters’ door at the Cellar. Referees too.', 'tiny'],
    ['fran', 'Fran', 'Fran DeLuca', 'Fran DeLuca. Waitress, Harlan Grill.', 'fran'],
    ['pat', 'Pat', 'Pat Gorman', 'Pat Gorman. Night gate man, Harlan Freight.', 'pat'],
    ['whistle', 'Whistle', 'Carmine Dalto', 'Carmine “Whistle” Dalto. Yard foreman, Harlan Freight.', 'whistle'],
    ['roz', 'Roz', 'Roz Kaminski', 'Roz Kaminski. Night dispatcher, Harlan Freight.', 'roz'],
    ['dutch', 'Dutch', 'Francis Brannigan', 'Dutch Brannigan. Runs collections out of Harlan Freight Depot.', 'dutch'],
    ['mara', 'Mara', 'Mara Kowalski', 'Mara Kowalski. Maintenance lead, Foundry Courts.', 'mara', null, 'mara'],
    ['odette', 'Odette', 'Odette Baptiste', 'Odette Baptiste. Tenants’ secretary, Foundry Courts.', 'odette'],
    ['gus', 'Gus', 'Gus Lindqvist', 'Gus Lindqvist. Forty years a Foundry pipefitter. Fixes radios.', 'gus'],
    ['darnell', 'Darnell', 'Darnell Greer', 'Darnell Greer. Mara’s crew.', 'darnell'],
    ['keisha', 'Keisha', 'Keisha Greer', 'Keisha Greer. Eight. Darnell’s daughter.', 'keisha'],
    ['nell', 'Nell', 'Nell Faraday', 'Nell Faraday. Council site coordinator at the Courts.', 'nell'],
    ['elena', 'Elena', 'Elena Vasquez', 'Elena Vasquez. Three children. Waiting on apartment 4D.', 'elena'],
    ['rook', 'Rook', 'Walter Rook', 'Walter Rook. Leader, Northside Community Council.', 'rook', { 0: 'rook_1994', 5: 'rook' }],
    ['wanda', 'Wanda', 'Wanda Wojcik', 'Wanda Wojcik. Council volunteer. Wojo’s mother.', 'wanda'],
    ['dukes', 'Mr. Dukes', 'Arnie Dukes', 'Arnie Dukes. Property clerk, City Hall Annex.', 'dukes'],
    ['hale', 'Mrs. Hale', 'Bernice Hale', 'Bernice Hale. Window 5, City Hall Annex.', 'hale'],
    ['asher', 'Asher', 'Wendell Asher', 'Wendell Asher. Night man at Lindell House, once.', 'asher'],
    ['fitz', 'Fitz', 'Fitz Mahoney', 'Fitz Mahoney. Strips copper out of condemned buildings.', 'fitz'],
    ['dot', 'Dot', 'Dot Pham', 'Dot Pham. Kwik Copy, Market Street. Worked with Min.', 'dot'],
    ['brandt', 'Dr. Brandt', 'Saul Brandt', 'Dr. Saul Brandt. Dentist, 88 Market Street.', 'brandt'],
    ['carrow', 'Carrow', 'Vince Carrow', 'Vince Carrow. Harlan Street.', 'carrow'],
    ['gym_desk', 'Front desk', 'Front desk', 'Front desk, Castell Champions Gym.', 'gym_desk'],
    ['joan', 'Joan', 'Joan Albright', 'Joan Albright. Metro desk, Calder Ledger.', 'joan'],
    ['celeste', 'Celeste', 'Celeste Ashgrove', 'Celeste Ashgrove. Chair, Ashgrove Capital.', 'celeste'],
    ['penner', 'Penner', 'Lyle Penner', 'Lyle Penner. Managing director, Ashgrove Capital.', 'penner'],
    ['owen', 'Owen', 'Owen Tully', 'Owen Tully. Analyst, Ashgrove Capital, floor 22.', 'owen'],
    ['garvey', 'Garvey', 'Mr. Garvey', 'Mr. Garvey. Head of security, Ashgrove Tower.', 'garvey'],
    ['tran', 'Mr. Tran', 'Mr. Tran', 'Mr. Tran. Shoe repair and keys, Alder Row.', 'tran'],
    ['rosa', 'Rosa', 'Rosa Medina', 'Rosa Medina. House 7, Alder Row.', 'rosa'],
    ['gloria', 'Gloria', 'Gloria Pryor', 'Gloria Pryor. President, Alder Row Cooperative.', 'gloria'],
    ['terrence', 'Terrence', 'Terrence Pryor', 'Terrence Pryor. Nineteen. Gloria’s grandson.', 'terrence'],
    ['odell', 'Mr. Odell', 'Henry Odell', 'Henry Odell. Eighty-four. House 3, Alder Row.', 'odell'],
    ['june', 'June', 'June', 'June. Ten. Delivers flyers.', 'june'],
    ['brenda', 'Brenda', 'Brenda', 'Brenda. Reporter, Channel 6.', 'brenda'],
    ['ed', 'Ed', 'Ed', 'Ed. Camera, Channel 6.', 'ed'],
  ];

  const cast = S.cast = S.cast || {};
  const castIds = [];
  for (const row of C) {
    const [id, name, full, role, lk, alt, rel] = row;
    const def = { name, full, role, look: lk, notes: [] };
    if (alt) def.alt = alt;
    if (rel) def.rel = rel;
    cast[id] = def;
    castIds.push(id);
    // Register as the shared People base entry (story.people wins over S.cast in story.person, and the
    // headless load check verifies its look). Jin is not a People-archive entry.
    if (id !== 'jin' && typeof S.definePerson === 'function') S.definePerson(id, def);
  }

  // The person's look for chapter n (default: the current chapter): the `alt` entry with the greatest
  // chapter key <= n, else the default look. Unknown ids return the id itself if it is a look, else 'man'.
  S.castLook = function (id, n) {
    const p = cast[id];
    if (!p) return (S.looks && S.looks[id]) ? id : 'man';
    if (n === undefined || n === null) n = S.G && typeof S.G.chapter === 'number' ? S.G.chapter : 0;
    let best = p.look, bestK = -1;
    if (p.alt) for (const k in p.alt) { const kk = +k; if (kk <= n && kk > bestK && S.looks[p.alt[k]]) { best = p.alt[k]; bestK = kk; } }
    return best;
  };
  // An NpcPlacement for a cast member: { id, name, look (chapter look) } merged with opts (opts win).
  // opts.chapter (optional) picks the chapter for the look and is not copied into the placement.
  S.castNpc = function (id, opts) {
    const p = cast[id] || {};
    const o = Object.assign({}, opts || {});
    const n = o.chapter; delete o.chapter;
    return Object.assign({ id, name: p.name || id, look: S.castLook(id, n) }, o);
  };
  S.castIds = castIds;
  S.lookIds = LOOKS.slice();
})(window.STORY);
