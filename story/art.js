/* Story Mode — art.js
   Palette, 3x5 pixel font, looks registry, the procedural figure renderer (2D skeleton,
   two-bone IK, stamped pixel limbs, head templates), every pose, and small effects
   (afterimages, punch smears, impact sparks, foot dust). Contract: ARCHITECTURE.md §3.
   Nothing here draws when S.headless; the pose maths (S.art.joints) still works headless. */
(function (S) {
  'use strict';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const TAU = Math.PI * 2;
  const warned = new Set();
  function warnOnce(key, msg) {
    if (warned.has(key)) return;
    warned.add(key);
    try { if (typeof console !== 'undefined' && console.warn) console.warn('[story/art] ' + msg); } catch (_) { /* no console */ }
  }
  const canDraw = (ctx) => !S.headless && !!ctx && typeof ctx.fillRect === 'function';

  /* ════════════════════════════════════════════════════════════════════
     COLOUR
     Shadows shift toward a cool plum-charcoal, lights toward warm cream
     (ref-movement-art "Pixel shading": cooler shadows, warmer lit surfaces).
     ════════════════════════════════════════════════════════════════════ */
  const rgbMemo = new Map();
  function rgbOf(c) {
    let v = rgbMemo.get(c);
    if (v) return v;
    let s = typeof c === 'string' ? c.trim() : '';
    if (s[0] === '#') s = s.slice(1);
    if (s.length === 3 || s.length === 4) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = /^[0-9a-fA-F]{6}/.test(s) ? parseInt(s.slice(0, 6), 16) : NaN;
    v = Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [128, 128, 128];
    rgbMemo.set(c, v);
    return v;
  }
  const byte = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  const hexOf = (r, g, b) => '#' + ((1 << 24) | (byte(r) << 16) | (byte(g) << 8) | byte(b)).toString(16).slice(1);
  const mixMemo = new Map();
  function mix(a, b, t) {
    const key = a + '|' + b + '|' + t;
    let v = mixMemo.get(key);
    if (v) return v;
    const x = rgbOf(a), y = rgbOf(b);
    v = hexOf(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
    if (mixMemo.size > 6000) mixMemo.clear();
    mixMemo.set(key, v);
    return v;
  }
  const COOL = '#272136', WARM = '#fff0d2', FAR = '#1d1a27';
  const shade = (c, k) => mix(c, COOL, k);
  const lighten = (c, k) => mix(c, WARM, k);
  const luma = (c) => { const v = rgbOf(c); return 0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]; };
  function rgba(c, a) { const v = rgbOf(c); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; }
  // Material ramp: base, lit, shadow, deep shadow, and the same pushed back for far-side limbs.
  function ramp(c) {
    if (luma(c) < 52) {
      // near-black cloth (Jin's pants): lift the near side a step so near and far limbs still separate
      const nb = lighten(c, 0.1);
      return { b: nb, l: lighten(c, 0.22), d: c, dd: mix(c, '#09080c', 0.4), f: mix(c, '#0b0a0f', 0.35), fd: mix(c, '#07060a', 0.6), fl: c };
    }
    return { b: c, l: lighten(c, 0.17), d: shade(c, 0.3), dd: shade(c, 0.52), f: mix(c, FAR, 0.3), fd: mix(c, FAR, 0.5), fl: mix(c, FAR, 0.16) };
  }
  // Five-step ramp (deep shadow .. highlight) for other modules that want one.
  const ramp5 = (c) => [shade(c, 0.55), shade(c, 0.28), c, lighten(c, 0.14), lighten(c, 0.3)];

  /* ── Palette ──────────────────────────────────────────────────────── */
  S.pal = {
    // night air and street: dusty blue and blue-gray
    sky0: '#0f131c', sky1: '#161d2b', sky2: '#212b3f', sky3: '#33415a', sky4: '#4a5a74', haze: '#5d6b82',
    blue0: '#1a2030', blue1: '#252d40', blue2: '#343e55', blue3: '#47536b', blue4: '#606d84', blue5: '#8592a6',
    street0: '#1f242e', street1: '#2a303c', street2: '#383f4c', street3: '#4a5260', curb: '#5f6673', puddle: '#5b6e8c',
    // brick: desaturated brown and faded red
    brick0: '#2a1f1c', brick1: '#3e2c27', brick2: '#553b31', brick3: '#6c4c3d', brick4: '#85614c', mortar: '#665c53',
    brickRed0: '#341c1a', brickRed1: '#4e2824', brickRed2: '#6a3630', brickRed3: '#86473d', brickRed4: '#a15b4b',
    // shadows: charcoal and subdued plum
    charcoal0: '#141419', charcoal: '#1e1f26', charcoal2: '#2a2b33', charcoal3: '#3a3b45',
    plum0: '#171220', plum1: '#241b2c', plum2: '#33263b', plum3: '#46344e', plum4: '#5c4764',
    // weathered metal: dull green-gray and rust
    metal0: '#232a28', metal1: '#323c38', metal2: '#45514b', metal3: '#5a6760', metal4: '#76837b', metal5: '#98a39b', rust: '#7a4a30', rust2: '#9a6038',
    // soft amber light
    amber0: '#6e421c', amber1: '#a4682c', amber2: '#cf8f45', amber3: '#e6b066', amber4: '#f2cf94', lamp: '#ffe4ae', glow: '#ffcf86',
    wood0: '#2b1f17', wood1: '#3f2d20', wood2: '#57402c', wood3: '#70553a', wood4: '#8c6c4a',
    paper: '#e6dfcb', paper2: '#cbc2aa', paper3: '#a89f88', ink: '#1a1612', neon: '#c2564a',
    // skin tones, pale to deep
    skin0: '#efd0b0', skin1: '#e2b48e', skin2: '#d4a07a', skin3: '#bd8662', skin4: '#a2704f', skin5: '#85583c', skin6: '#5f3e2a',
    // Jin (ref-movement-art "Jin's character design")
    jinTop: '#4d6b93', jinStripe: '#d8d2c1', jinPants: '#1e1f26', jinShoes: '#d4cfc2', jinHair: '#3b2a20', jinSkin: '#d6a47e', jinScar: '#a85d4e',
    // the main game's UI accents
    gold: '#e8c272', red: '#d8402f', text: '#efe6d2', textDim: '#a89f8c', black: '#0b0a0d',
    // effects
    spark: '#fff2d6', sparkHeavy: '#ffe2a0', smear: '#efe7d3', smear2: '#a9bddb', after: '#7f9ccf', dust: '#9a9488', dust2: '#6f6b64',
    shadow: 'rgba(12,9,18,0.34)',
  };

  /* ════════════════════════════════════════════════════════════════════
     3x5 PIXEL FONT — uppercase, digits, . , ' ! ? - : / & # $ ( ) " and a few extras.
     Lowercase draws as uppercase. Unknown characters draw as '?'.
     ════════════════════════════════════════════════════════════════════ */
  const GLYPH_SRC = {
    A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
    E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
    I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
    M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.', P: '##.|#.#|##.|#..|#..',
    Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.',
    U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#',
    Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
    0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###', 3: '##.|..#|.#.|..#|##.',
    4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.', 6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
    8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|##.',
    '.': '.|.|.|.|#', ',': '..|..|..|.#|#.', "'": '#|#|.|.|.', '!': '#|#|#|.|#', '?': '##.|..#|.#.|...|.#.',
    '-': '...|...|###|...|...', ':': '.|#|.|#|.', '/': '..#|..#|.#.|#..|#..', '&': '.#.|#.#|.##|#.#|.##',
    '#': '#.#|###|#.#|###|#.#', '$': '.##|##.|.#.|.##|##.', '(': '.#|#.|#.|#.|.#', ')': '#.|.#|.#|.#|#.',
    '"': '#.#|#.#|...|...|...', '+': '...|.#.|###|.#.|...', '%': '#.#|..#|.#.|#..|#.#', '=': '...|###|...|###|...',
    ';': '..|.#|..|.#|#.', '*': '...|#.#|.#.|#.#|...', '<': '..#|.#.|#..|.#.|..#', '>': '#..|.#.|..#|.#.|#..',
    '_': '...|...|...|...|###', '[': '##|#.|#.|#.|##', ']': '##|.#|.#|.#|##', ' ': '..|..|..|..|..',
  };
  const FONT_ALIAS = { '—': '-', '–': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '…': '...', '·': '.', '\t': ' ' };
  const GLYPHS = {};
  for (const ch in GLYPH_SRC) {
    const rows = GLYPH_SRC[ch].split('|'), px = [];
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (rows[y][x] === '#') px.push(x, y);
    GLYPHS[ch] = { w: rows[0].length, px };
  }
  function glyphText(text) {
    let s = String(text == null ? '' : text).toUpperCase(), out = '';
    for (const ch of s) out += FONT_ALIAS[ch] !== undefined ? FONT_ALIAS[ch] : ch;
    return out;
  }
  const glyphOf = (ch) => GLYPHS[ch] || GLYPHS['?'];
  function lineWidth(line, scale) {
    let w = 0;
    for (const ch of line) w += glyphOf(ch).w + 1;
    return Math.max(0, w - 1) * scale;
  }
  S.font = {
    height: 5, lineHeight: 6,
    has: (ch) => !!GLYPHS[glyphText(ch)],
    width(text, scale) {
      const sc = Math.max(1, Math.round(+scale || 1));
      let w = 0;
      for (const line of glyphText(text).split('\n')) w = Math.max(w, lineWidth(line, sc));
      return w;
    },
    // y is the top of the glyphs. Returns the drawn width. shadow: true (dark) or a colour.
    draw(ctx, text, x, y, o) {
      o = o || {};
      const sc = Math.max(1, Math.round(+o.scale || 1));
      const lines = glyphText(text).split('\n');
      let widest = 0;
      for (const line of lines) widest = Math.max(widest, lineWidth(line, sc));
      if (!canDraw(ctx)) return widest;
      const color = o.color || S.pal.text;
      const sh = o.shadow ? (typeof o.shadow === 'string' ? o.shadow : 'rgba(10,8,14,0.8)') : null;
      const prev = ctx.fillStyle;
      lines.forEach((line, li) => {
        const lw = lineWidth(line, sc);
        let cx = Math.round(o.align === 'center' ? x - lw / 2 : o.align === 'right' ? x - lw : x);
        const cy = Math.round(y + li * 6 * sc);
        for (const ch of line) {
          const g = glyphOf(ch);
          for (let pass = sh ? 0 : 1; pass < 2; pass++) {
            ctx.fillStyle = pass === 0 ? sh : color;
            const off = pass === 0 ? sc : 0;
            for (let i = 0; i < g.px.length; i += 2) ctx.fillRect(cx + g.px[i] * sc + off, cy + g.px[i + 1] * sc + off, sc, sc);
          }
          cx += (g.w + 1) * sc;
        }
      });
      ctx.fillStyle = prev;
      return widest;
    },
  };

  /* ════════════════════════════════════════════════════════════════════
     LOOKS
     ════════════════════════════════════════════════════════════════════ */
  // Body widths in pixels at the authored 46 px height (widths do not scale with h; lengths do).
  const BUILDS = {
    avg:   { chest: 8.5, waist: 7, hipW: 7, upper: 3, fore: 3, thigh: 4, shin: 3, fist: 2, belly: 0, delt: 1, stoop: 0 },
    slim:  { chest: 7.5, waist: 6, hipW: 6.5, upper: 3, fore: 2, thigh: 4, shin: 3, fist: 2, belly: 0, delt: 0, stoop: 0 },
    broad: { chest: 11, waist: 8.5, hipW: 8, upper: 4, fore: 3, thigh: 5, shin: 4, fist: 3, belly: 0, delt: 1, stoop: 0 },
    heavy: { chest: 10.5, waist: 10.5, hipW: 9, upper: 4, fore: 3, thigh: 5, shin: 4, fist: 3, belly: 3, delt: 1, stoop: 0 },
    boxer: { chest: 10, waist: 6.5, hipW: 7, upper: 3, fore: 3, thigh: 5, shin: 3, fist: 3, belly: 0, delt: 2, stoop: 0 },
    old:   { chest: 8, waist: 8, hipW: 7, upper: 3, fore: 2, thigh: 4, shin: 3, fist: 2, belly: 1, delt: 0, stoop: 1 },
    kid:   { chest: 6, waist: 5.5, hipW: 5.5, upper: 2, fore: 2, thigh: 3, shin: 3, fist: 2, belly: 0, delt: 0, stoop: 0 },
  };
  // hem: px the top reaches below the hip joint. sleeve: long|short|none|none2 (shirt under)|wide.
  const TOPS = {
    track:    { sleeve: 'long', hem: 1.5, collar: 'raised', zip: true, stripe: true, band: true },
    tee:      { sleeve: 'short', hem: 1, collar: 'crew' },
    tank:     { sleeve: 'none', hem: 0.5, collar: 'scoop' },
    shirt:    { sleeve: 'long', hem: -1, collar: 'shirt', buttons: true, belt: true },
    polo:     { sleeve: 'short', hem: 0, collar: 'shirt', belt: true },
    hoodie:   { sleeve: 'long', hem: 2, collar: 'hood', pocket: true, band: true },
    sweater:  { sleeve: 'long', hem: 1.5, collar: 'crew', band: true },
    jacket:   { sleeve: 'long', hem: 2.5, collar: 'shirt', open: true },
    leather:  { sleeve: 'long', hem: 2, collar: 'shirt', sheen: true, open: true },
    coat:     { sleeve: 'long', hem: 5, collar: 'lapel', buttons: true, longK: 1.15 },
    trench:   { sleeve: 'long', hem: 5, collar: 'lapel', belt2: true, longK: 1.35, defLong: true },
    suit:     { sleeve: 'long', hem: 3, collar: 'lapel', vee: true },
    blazer:   { sleeve: 'long', hem: 3, collar: 'lapel', vee: true },
    scrubs:   { sleeve: 'short', hem: 2, collar: 'vneck' },
    gown:     { sleeve: 'short', hem: 4, collar: 'crew', dots: true, longK: 0.95, defLong: true },
    dress:    { sleeve: 'short', hem: 4, collar: 'crew', longK: 1.05, defLong: true },
    overalls: { sleeve: 'short2', hem: 0, collar: 'crew', bib: true },
    vest:     { sleeve: 'none2', hem: 1, collar: 'vneck', vee: true },
    robe:     { sleeve: 'wide', hem: 5, collar: 'lapel', belt2: true, longK: 1.75, defLong: true },
    bare:     { sleeve: 'none', hem: -2.5, collar: 'none', bare: true },
    cardigan: { sleeve: 'long', hem: 2.5, collar: 'vneck', open: true, buttons: true, band: true },
    uniform:  { sleeve: 'long', hem: 0, collar: 'shirt', patch: true, belt: true, buttons: true },
  };
  const BOTTOMS = {
    pants: { legs: 'full' }, jeans: { legs: 'full', seam: true }, slacks: { legs: 'full', crease: true },
    sweats: { legs: 'full', baggy: true, cuff: true }, shorts: { legs: 'shorts', len: 0.72 },
    trunks: { legs: 'shorts', len: 0.55, wide: true, band: true },
    skirt: { legs: 'bare', skirt: 0.88 }, long_skirt: { legs: 'bare', skirt: 1.75 },
  };
  const HAT_STYLES = new Set(['cap', 'beanie', 'fedora', 'hood']);
  const DEFAULT_LOOK = { h: 46, build: 'avg', skin: '#c8956c', hair: { style: 'short', color: '#2e241c' },
    top: { kind: 'jacket', color: '#5a5048', color2: '#a49a88' }, bottom: { kind: 'pants', color: '#3a3c44' }, shoes: '#2c2622', extras: [] };

  S.looks = S.looks || {};
  const lookMemo = new WeakMap();
  S.defineLook = function (id, def) {
    if (!id || !def || typeof def !== 'object') { warnOnce('deflook:' + id, 'defineLook(' + id + ') needs an id and a LookDef object'); return null; }
    S.looks[id] = def;
    lookMemo.delete(def);
    return def;
  };

  function parseExtras(list) {
    const ex = Object.create(null);
    for (const e of list || []) {
      if (typeof e !== 'string') continue;
      const i = e.indexOf(':');
      if (i < 0) ex[e.trim()] = true; else ex[e.slice(0, i).trim()] = e.slice(i + 1).trim() || true;
    }
    return ex;
  }
  // Resolve a LookDef (or id) into everything the renderer needs: ramps, build widths, kind tables.
  function normalize(def, id) {
    const d = def || DEFAULT_LOOK;
    const build = BUILDS[d.build] ? d.build : (d.h && d.h < 36 ? 'kid' : 'avg');
    const h = clamp(+d.h || (build === 'kid' ? 31 : 46), 20, 64);
    const hair = d.hair || {}, top = d.top || {}, bot = d.bottom || {};
    const style = HAIR[hair.style] ? hair.style : (hair.style ? (warnOnce('hair:' + hair.style, 'unknown hair style "' + hair.style + '"; using short'), 'short') : 'short');
    const topKind = TOPS[top.kind] ? top.kind : (top.kind ? (warnOnce('top:' + top.kind, 'unknown top "' + top.kind + '"; using tee'), 'tee') : 'tee');
    const botKind = BOTTOMS[bot.kind] ? bot.kind : (bot.kind ? (warnOnce('bot:' + bot.kind, 'unknown bottom "' + bot.kind + '"; using pants'), 'pants') : 'pants');
    const skin = d.skin || '#c8956c';
    const ex = parseExtras(d.extras);
    const T = TOPS[topKind], Bt = BOTTOMS[botKind];
    const topColor = top.color || (topKind === 'bare' ? skin : '#5a6472');
    const hairColor = hair.color || (style === 'gray_short' ? '#9c9890' : '#2a2018');
    const isHat = HAT_STYLES.has(style);
    // Headwear styles take hair.color as the hat colour; a hood defaults to the top's colour.
    const hatColor = isHat ? (hair.color || (style === 'hood' ? topColor : '#33363c')) : (typeof ex.cap === 'string' ? ex.cap : null);
    const sb = (h - 10) / 36;      // body scale: everything below the head scales, the head template does not
    const N = {
      id: id || null, h, sb, build, B: BUILDS[build],
      boxer: build === 'boxer', kid: build === 'kid', old: build === 'old', heavy: build === 'heavy' || build === 'broad',
      skin: Object.assign(ramp(skin), { s: shade(skin, 0.24), z: shade(skin, 0.44), e: shade(skin, 0.16), L: lighten(skin, 0.14) }),
      hair: { style, r: ramp(isHat ? (hair.under || '#2a2119') : hairColor), isHat },
      hat: hatColor ? Object.assign(ramp(hatColor), { k: shade(hatColor, 0.5) }) : null,
      top: { kind: topKind, T, r: ramp(topColor), r2: top.color2 ? ramp(top.color2) : null,
        long: top.long === undefined ? !!T.defLong : !!top.long, bare: !!T.bare },
      bottom: { kind: botKind, Bt, r: ramp(bot.color || (topKind === 'overalls' ? topColor : '#34363e')) },
      shoes: ramp(d.shoes || '#2c2622'),
      ex, extrasWhen: typeof d.extrasWhen === 'function' ? d.extrasWhen : null,
      heads: new Map(), variants: null,
    };
    N.shoes.sole = luma(N.shoes.b) > 150 ? shade(N.shoes.b, 0.36) : shade(N.shoes.b, 0.4);
    N.top.longK = N.top.long ? (T.longK || 1.1) : 0;
    if (!N.top.r2 && (T.stripe || T.vee || T.open || T.bib || topKind === 'vest')) {
      N.top.r2 = ramp(topKind === 'track' ? '#d8d2c1' : T.bib ? '#c8c0b0' : '#d6cfc0');
    }
    return N;
  }
  // look: id or LookDef -> normalised look (cached). Dynamic extras (extrasWhen) give cached variants.
  function lookFor(look) {
    let def = null, id = null;
    if (typeof look === 'string') {
      id = look; def = S.looks[look];
      if (!def) { warnOnce('look:' + look, 'unknown look "' + look + '"; using man'); def = S.looks.man || DEFAULT_LOOK; }
    } else if (look && typeof look === 'object') def = look;
    else def = S.looks.man || DEFAULT_LOOK;
    let N = lookMemo.get(def);
    if (!N) { N = normalize(def, id); lookMemo.set(def, N); }
    if (N.extrasWhen) {
      let more = null;
      try { more = N.extrasWhen(S.G, S); } catch (_) { more = null; }
      if (Array.isArray(more) && more.length) {
        const key = more.join(',');
        N.variants = N.variants || new Map();
        let V = N.variants.get(key);
        if (!V) {
          V = normalize(Object.assign({}, def, { extras: (def.extras || []).concat(more), extrasWhen: null }), id);
          N.variants.set(key, V);
        }
        return V;
      }
    }
    return N;
  }

  /* ════════════════════════════════════════════════════════════════════
     HEAD TEMPLATES
     A 10x12 grid; the skull fills cols 1..7, rows 2..9, facing right (front = col 7,
     nose bump col 8). The rig's head point sits at grid (4.5, 6.5). Hair tokens:
       H hair  h lit  d dark  k deep  q stubble (hair over skin)  r lock shown when moving
       forward (trails back)  f lock shown when braking (swings forward)
       c hat  C hat lit  v hat shade  b hat band  s/z forced skin shade  L scalp light  - erase
     Skin pixels on the face below hair are shaded automatically, two steps, so the upper
     face sits in shadow under the fringe without becoming a flat mask.
     ════════════════════════════════════════════════════════════════════ */
  const GW = 10, GH = 12;
  const SKULL = [
    '..........',
    '..........',
    '..SSSSS...',
    '.SSSSSSS..',
    '.SSSSSSS..',
    '.SSeSSSS..',
    '.SSeSSSSS.',
    '..SSSSSS..',
    '...SSSSS..',
    '.....SS...',
    '..........',
    '..........',
  ];
  // shade: how many auto-shade steps under hair (2 = fringe over the eyes, 1 = hairline only).
  // tail: hair that hangs behind the body ('long', 'pony', 'braids').
  const HAIR = {
    twoblock: { shade: 2, rows: [
      '..........',
      '...hhHh...',
      '.rHHhHHHH.',
      'rHHHHHHhH.',
      '.ddHHHHHHf',
      '.dd..HdH..',
      '.dd.......',
      '..d.......'] },
    shaggy: { shade: 2, rows: [
      '..........',
      '..hHHhH...',
      '.HHHhHHHH.',
      'rHHHHHHHH.',
      'HHdHHHHdHf',
      'HHHd.HdH..',
      'HHH.......',
      '.HH.......',
      '.H........'] },
    short: { shade: 2, rows: [
      '..........',
      '...HHHH...',
      '..HHhHHHH.',
      '.HHHHHHHH.',
      '.HHHHHH...',
      '.HH.......',
      '.HH.......',
      '..H.......'] },
    buzz: { shade: 1, rows: [
      '..........',
      '..........',
      '..qqqqq...',
      '.qqqqqqq..',
      '.qqq......',
      '.qq.......',
      '.q........'] },
    bald: { shade: 0, rows: [
      '..........',
      '..........',
      '....LL....',
      '...L......',
      '..........',
      '.....sss..'] },
    long: { shade: 2, tail: 'long', rows: [
      '..........',
      '...HHHH...',
      '..HHhHHHH.',
      '.HHHHhHHH.',
      'HHHHHHHHH.',
      'HHHH...H..',
      'HHHH......',
      'HHH.......',
      'HHH.......',
      '.HH.......'] },
    ponytail: { shade: 2, tail: 'pony', rows: [
      '..........',
      '...HHHH...',
      '..HHhHHHH.',
      'kHHHHHHH..',
      '.HHHHHH...',
      '.HH.......',
      '..H.......'] },
    bun: { shade: 2, rows: [
      '.hH.......',
      'HHHHHHH...',
      'kHHHhHHH..',
      '.HHHHHHH..',
      '.HHHH.....',
      '.HH.......',
      '..H.......'] },
    curly: { shade: 2, rows: [
      '..H.H.H...',
      '.HHhHHhH..',
      'HHHHHHHHH.',
      'HhHHHHhHH.',
      'HHHHHHHH..',
      'HHH.......',
      '.HH.......'] },
    afro: { shade: 2, rows: [
      '.HHHHHH...',
      'HHHhHHHH..',
      'HHHHHHHhH.',
      'HHHHHHHHH.',
      'HHHHHHH...',
      'HHH.......',
      'HHH.......',
      '.H........'] },
    slick: { shade: 1, rows: [
      '..........',
      '..........',
      '..hhHHH...',
      '.HHHHhHH..',
      '.HHHH.....',
      '.dd.......',
      '.dd.......',
      '..d.......'] },
    gray_short: { shade: 1, rows: [
      '..........',
      '..........',
      '...HHH....',
      '.HHHhH....',
      '.HHH......',
      '.HH.......',
      '.H........'] },
    bob: { shade: 2, rows: [
      '..........',
      '...HHHH...',
      '..HHHhHHH.',
      '.HHHHHHHH.',
      'HHHHHHHHH.',
      'HHHH......',
      'HHHH......',
      'HHHH......',
      '.HH.......'] },
    braids: { shade: 2, tail: 'braids', rows: [
      '..........',
      '...HHHH...',
      '..HdHdHHH.',
      '.HdHdHHH..',
      'HHHHHH....',
      'HdH.......',
      'HHH.......',
      'Hd........',
      'H.........'] },
    cap: { shade: 2, rows: [
      '..........',
      '...cccc...',
      '..cCCccc..',
      '.ccccccc..',
      '.Hcccvvvvv',
      '.HH.......',
      '.H........'] },
    beanie: { shade: 2, rows: [
      '....c.....',
      '..cCcccc..',
      '.cCccccc..',
      '.ccccccc..',
      '.vvvvvvv..',
      '.HH.......',
      '.H........'] },
    fedora: { shade: 2, rows: [
      '...cccc...',
      '..cCcccc..',
      '..bbbbbb..',
      'vvvvvvvvvv',
      '.HH.......',
      '.H........'] },
    hood: { shade: 2, rows: [
      '..........',
      '..cccc....',
      '.cCcccc...',
      'cccccccz..',
      'cccccc....',
      'cccccv....',
      'ccccv.....',
      'cccc......',
      '.ccc......',
      '..cc......'] },
  };
  // A baseball cap drawn over any hair style (extras 'cap:#hex').
  const CAP_OVERLAY = [
    '..........',
    '...cccc...',
    '..cCCccc..',
    '.ccccccc..',
    '...ccvvvvv'];

  // Build the head's pixel grid (colours) for a look; cached per wind state and scar flag.
  function headGrid(N, wind, scar) {
    const key = (wind > 0.35 ? 'r' : wind < -0.35 ? 'f' : '0') + (scar ? 's' : '');
    let g = N.heads.get(key);
    if (g) return g;
    g = new Array(GW * GH).fill(null);
    const kind = new Uint8Array(GW * GH);         // 0 empty, 1 skin, 2 hair/hat
    const sk = N.skin, hr = N.hair.r, ht = N.hat || ramp('#33363c');
    const put = (c, r, col, k) => { if (c < 0 || r < 0 || c >= GW || r >= GH) return; g[r * GW + c] = col; kind[r * GW + c] = k; };
    for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
      const ch = SKULL[r][c];
      if (ch === 'S') put(c, r, sk.b, 1); else if (ch === 'e') put(c, r, sk.e, 1);
    }
    const H = HAIR[N.hair.style] || HAIR.short;
    const paint = (rows) => {
      for (let r = 0; r < rows.length; r++) for (let c = 0; c < GW; c++) {
        const ch = rows[r][c];
        switch (ch) {
          case 'H': put(c, r, hr.b, 2); break;
          case 'h': put(c, r, hr.l, 2); break;
          case 'd': put(c, r, hr.d, 2); break;
          case 'k': put(c, r, hr.dd, 2); break;
          case 'q': put(c, r, mix(hr.b, sk.b, 0.32), 2); break;
          case 'r': if (wind > 0.35) put(c, r, hr.b, 2); break;
          case 'f': if (wind < -0.35) put(c, r, hr.b, 2); break;
          case 'c': put(c, r, ht.b, 2); break;
          case 'C': put(c, r, ht.l, 2); break;
          case 'v': put(c, r, ht.d, 2); break;
          case 'b': put(c, r, ht.k || ht.dd, 2); break;
          case 's': if (kind[r * GW + c] === 1) g[r * GW + c] = sk.s; break;
          case 'z': if (kind[r * GW + c] === 1) g[r * GW + c] = sk.z; break;
          case 'L': if (kind[r * GW + c] === 1) g[r * GW + c] = sk.L; break;
          case '-': put(c, r, null, 0); break;
          default: break;
        }
      }
    };
    paint(H.rows);
    if (N.ex.cap && !N.hair.isHat) paint(CAP_OVERLAY);
    if (N.ex.headband) {
      const hb = typeof N.ex.headband === 'string' ? N.ex.headband : '#c9c1ad';
      for (let c = 1; c <= 7; c++) if (kind[3 * GW + c]) put(c, 3, c === 7 ? lighten(hb, 0.15) : hb, 2);
    }
    // Upper-face shadow: skin on the face (cols >= 4) directly under hair gets the deep tone,
    // the next row down the mid tone. The back of the head gets a single soft step.
    const depth = H.shade;
    if (depth > 0) {
      const src = kind.slice();
      for (let r = 1; r < GH; r++) for (let c = 0; c < GW; c++) {
        const i = r * GW + c;
        if (src[i] !== 1) continue;
        const up1 = src[i - GW] === 2, up2 = r >= 2 && src[i - GW] === 1 && src[i - 2 * GW] === 2;
        if (c >= 4) {
          if (up1) g[i] = depth >= 2 ? sk.z : sk.s;
          else if (up2 && depth >= 2) g[i] = sk.s;
        } else if (up1) g[i] = sk.s;
      }
    }
    const ex = N.ex;
    if (ex.beard) {
      const bc = typeof ex.beard === 'string' ? ex.beard : '#3a2e26';
      for (const [c, r] of [[3, 7], [4, 8], [5, 8], [6, 8], [7, 8], [5, 9], [6, 9], [7, 7], [6, 7]]) if (kind[r * GW + c]) put(c, r, (c + r) % 3 ? bc : shade(bc, 0.2), 2);
    }
    if (ex.mustache) {
      const mc = typeof ex.mustache === 'string' ? ex.mustache : '#3a2e26';
      put(7, 7, mc, 2); put(6, 7, shade(mc, 0.15), 2);
    }
    if (ex.glasses) { put(5, 5, '#2b2b32', 2); put(6, 5, '#2b2b32', 2); put(7, 5, '#9fb0bc', 2); put(8, 5, '#2b2b32', 2); }
    if (ex.earrings) put(3, 7, '#d8b65a', 2);
    if (ex.cigarette) { put(8, 8, '#e8e2d4', 2); put(9, 8, '#d9693a', 2); }
    // Jin's broad, muted reddish healed scar on the right cheek (visible facing right).
    if (scar) {
      const sc = typeof ex.scar === 'string' ? ex.scar : S.pal.jinScar;
      for (const [c, r, k] of [[4, 7, 0.22], [5, 7, 0.12], [4, 8, 0.38], [5, 8, 0.3], [6, 7, 0.55]]) {
        const i = r * GW + c;
        if (kind[i] === 1) g[i] = mix(sc, g[i] || sk.b, k);
      }
    }
    N.heads.set(key, g);
    return g;
  }

  /* ════════════════════════════════════════════════════════════════════
     RIG
     A pose returns a rig: joint targets in a 46 px figure's space, facing right, feet
     centre at (0,0), y up negative. n = near side (towards the camera; facing right that
     is Jin's right side, his rear hand in an orthodox stance), f = far side (lead hand).
       hx,hy hip  cx,cy chest (shoulder line)  kx,ky head centre
       nhx.. hands  nfx.. feet (ground point; nfa/ffa foot angle, + = heel up / toe down)
       rot torso turn (+ near shoulder forward, we see more back; - far shoulder forward, more chest)
       tilt head pitch (+ chin down)  sh shoulder shrug px  wind hair/jacket (+ trails back)
       nex,ney fex,fey elbow pole; nkx,nky fkx,fky knee pole (direction the joint bends toward)
       nhh/fhh 0..1 hand follows the head (phone at the ear) instead of scaling with the body
       nfs/ffs forearm length scale (< 1 = pointing at or away from the camera, as in a hook)
       ffront > 0.5 draws the far arm in front of the torso (a lead hook swinging across the body)
       pa/pb prop parameters   nh/fh hand shape   prop object kind
     ════════════════════════════════════════════════════════════════════ */
  const DEF = {
    hx: 0, hy: -22.5, cx: 0.5, cy: -35.5, kx: 1.6, ky: -41,
    nhx: -0.6, nhy: -21.6, fhx: 1.6, fhy: -21.9, nfx: -1.8, nfy: 0, ffx: 2.1, ffy: 0, nfa: 0, ffa: 0,
    rot: -0.15, tilt: 0, sh: 0, wind: 0,
    nex: -0.7, ney: 1, fex: -0.7, fey: 1, nkx: 1, nky: -0.1, fkx: 1, fky: -0.1, nhh: 0, fhh: 0, pa: 0, pb: 0,
    nfs: 1, ffs: 1, ffront: 0,
    nh: 'relax', fh: 'relax', prop: null,
  };
  const NUM = Object.keys(DEF).filter((k) => typeof DEF[k] === 'number');
  const mk = (base, o) => Object.assign({}, base, o);
  // Always returns a fresh rig: pose code may adjust the result, and the base stances are shared.
  function lerpRig(a, b, k) {
    if (k <= 0) return Object.assign({}, a);
    if (k >= 1) return Object.assign({}, b);
    const o = {};
    for (const key of NUM) o[key] = a[key] + (b[key] - a[key]) * k;
    const src = k < 0.5 ? a : b;
    o.nh = src.nh; o.fh = src.fh; o.prop = src.prop;
    return o;
  }
  // Keyframes: [[p, rig], ...] ascending; eased (smoothstep) between keys.
  function kf(p, frames) {
    if (p <= frames[0][0]) return Object.assign({}, frames[0][1]);
    for (let i = 0; i < frames.length - 1; i++) {
      const a = frames[i], b = frames[i + 1];
      if (p <= b[0]) return lerpRig(a[1], b[1], smooth((p - a[0]) / Math.max(1e-6, b[0] - a[0])));
    }
    return Object.assign({}, frames[frames.length - 1][1]);
  }
  // Shift the upper body (chest, head, hands) and optionally the hip.
  function up(r, dx, dy, hipK) {
    r.cx += dx; r.cy += dy; r.kx += dx; r.ky += dy;
    r.nhx += dx; r.nhy += dy; r.fhx += dx; r.fhy += dy;
    if (hipK) { r.hx += dx * hipK; r.hy += dy * hipK; }
    return r;
  }
  const breathe = (t, rate) => Math.sin(t * TAU * (rate || 0.33));

  /* ── Base stances ──────────────────────────────────────────────────── */
  const STAND = mk(DEF, {});
  // Alert guard, orthodox: lead (far) fist forward at chin height, rear (near) fist at the cheek,
  // knees bent, feet staggered, chin tucked.
  const GUARD = mk(DEF, {
    hx: 0, hy: -21, cx: 2, cy: -33.8, kx: 3.6, ky: -39.2,
    fhx: 10.6, fhy: -35.8, nhx: 6.4, nhy: -37, nfx: -5.2, nfa: 0.3, ffx: 5, ffa: 0,
    rot: -0.45, tilt: 0.12, nex: -0.25, ney: 1, fex: -0.1, fey: 1, nh: 'fist', fh: 'fist', nkx: 1, nky: 0, fkx: 1, fky: 0,
  });
  // Jin's relaxed idle: loose fists at the belly, weight easy, feet a little staggered.
  const IDLE_BOX = mk(DEF, {
    hy: -22.2, cx: 0.9, cy: -35.4, kx: 1.7, ky: -40.9, nfx: -3.6, ffx: 3.2, nfa: 0.12,
    nhx: 4.4, nhy: -24.8, fhx: 6.2, fhy: -25.6, nh: 'fist', fh: 'fist', rot: -0.3, nex: -0.6, ney: 1, fex: -0.4, fey: 1,
  });
  const SLIPPED = mk(GUARD, {
    hy: -17.8, cx: 3.8, cy: -29.4, kx: 6.6, ky: -33.6, fhx: 8.6, fhy: -33.2, nhx: 6, nhy: -32.6,
    nfx: -5.6, nfa: 0.45, ffx: 5.4, rot: 0.75, tilt: 0.38,
  });
  const LYING = mk(DEF, {   // flat on the back, head toward -x (knocked down backward)
    hx: -1, hy: -3.2, cx: -13.8, cy: -3.6, kx: -19.4, ky: -4.2, nfx: 20.8, nfy: -0.4, ffx: 19.2, ffy: -1.6, nfa: -1.35, ffa: -1.2,
    nhx: -6, nhy: -2.6, fhx: -13, fhy: -2.2, rot: 0, tilt: 0, nkx: 0, nky: -1, fkx: 0, fky: -1,
    nex: 0, ney: -1, fex: 0, fey: -1, nh: 'open', fh: 'open',
  });

  // Shared stances are read-only; poses copy them (mk) before changing anything.
  for (const base of [DEF, STAND, GUARD, IDLE_BOX, SLIPPED, LYING]) Object.freeze(base);

  // Rate of a cycle in Hz: from the actor's speed (opts.vx, px/s) when known so feet do not slide,
  // else the base rate times opts.speed.
  function cycleRate(c, base, stridePx) {
    if (c.vx != null && Number.isFinite(c.vx) && stridePx > 0) return clamp(Math.abs(c.vx) / stridePx, base * 0.35, base * 2.4);
    return base * c.speed;
  }
  // One leg of a walk: stance (planted, slides back under the body), then swing.
  function legWalk(ph, A, lift) {
    if (ph < 0.5) {
      const u = ph / 0.5;
      return { x: A - 2 * A * u, y: 0, a: u > 0.72 ? ((u - 0.72) / 0.28) * 0.7 : 0 };
    }
    const u = (ph - 0.5) / 0.5;
    return { x: -A + 2 * A * smooth(u), y: -lift * Math.sin(Math.PI * u), a: 0.7 * (1 - u) * (1 - u) - 0.28 * u * u };
  }
  // One leg of a run: short stance, then the heel kicks up behind and the knee drives through.
  const RUN_DUTY = 0.36;
  function legRun(ph, A, lift) {
    if (ph < RUN_DUTY) {
      const u = ph / RUN_DUTY;
      return { x: A - 2 * A * u, y: 0, a: u > 0.55 ? ((u - 0.55) / 0.45) * 1.0 : -0.1 };
    }
    const u = (ph - RUN_DUTY) / (1 - RUN_DUTY);
    const back = Math.sin(Math.PI * Math.min(1, u * 1.8)) * (1 - u) * 3;
    const y = -lift * Math.pow(Math.sin(Math.PI * u), 0.75) - (u < 0.45 ? Math.sin(Math.PI * u / 0.45) * 2.5 : 0);
    return { x: -A - back + (2 * A) * smooth(clamp((u - 0.12) / 0.88, 0, 1)), y, a: 1.0 * (1 - u) + 0.15 * u * (1 - u) - 0.2 * u * u };
  }

  function walkRig(t, c, o) {
    o = o || {};
    const A = o.A != null ? o.A : (c.kid ? 4.2 : c.old ? 4.4 : 6.4), lift = o.lift != null ? o.lift : (c.old ? 2.2 : 3);
    const rate = o.rate != null ? o.rate : cycleRate(c, c.old ? 1.45 : c.kid ? 2.2 : 1.9, 4 * A);
    const ph = (t * rate) % 1;
    const n = legWalk(ph, A, lift), f = legWalk((ph + 0.5) % 1, A, lift);
    const bob = 0.75 * (0.5 + 0.5 * Math.cos(ph * TAU * 2));
    const lean = o.lean != null ? o.lean : 1.1;
    const r = mk(STAND, {
      hx: 0.3, hy: -22.7 + bob, cx: 0.4 + lean, cy: -35.7 + bob, kx: 1.5 + lean * 1.3, ky: -41.2 + bob,
      nfx: n.x, nfy: n.y, nfa: n.a, ffx: f.x, ffy: f.y, ffa: f.a, rot: -0.12 + 0.12 * Math.sin(ph * TAU), nkx: 1, nky: 0, fkx: 1, fky: 0,
      wind: 0.15,
    });
    const sw = o.armSwing != null ? o.armSwing : 0.6;
    r.nhx = 0.3 + lean - n.x * sw; r.nhy = -21.8 + bob + Math.abs(n.x) * 0.12;
    r.fhx = 0.9 + lean - f.x * sw; r.fhy = -22 + bob + Math.abs(f.x) * 0.12;
    r._ph = ph; r._n = n; r._f = f;
    return r;
  }

  // Shadowbox and the flurry reuse punch poses; these evaluate a pose by name.
  function evalPose(name, p, t, c) { const P = POSES[name]; return P.fn(p, t, c); }

  /* ════════════════════════════════════════════════════════════════════
     POSES: name -> { dur: one-shot length in seconds (0 = loop / static), fn(p, t, c) }
     p = progress 0..1 for one-shots (combat maps startup to 0..0.35, active 0.35..0.6,
     recovery 0.6..1, so punches are fully extended over 0.35..0.6); t = seconds into the pose.
     c = { boxer, heavy, kid, old, slim, speed, vx, moving, opts }.
     ════════════════════════════════════════════════════════════════════ */
  const POSES = {};
  const pose = (name, dur, fn) => { POSES[name] = { dur, fn }; };

  /* ── Standing ──────────────────────────────────────────────────────── */
  pose('idle', 0, (p, t, c) => {
    const br = breathe(t, 0.38) * 0.5, sway = Math.sin(t * TAU / 6.4);
    if (c.boxer) {
      // relaxed guard: breathing in the shoulders, a slow weight shift, a small bounce of the hands
      const r = up(mk(IDLE_BOX, {}), sway * 0.5, br * 0.9, 0.35);
      r.nhy += Math.sin(t * TAU * 0.38 + 0.6) * 0.4; r.fhy += Math.sin(t * TAU * 0.38 + 1.1) * 0.4;
      return r;
    }
    const r = up(mk(STAND, {}), sway * 0.4, br * 0.6, 0.3);
    if (c.old) { up(r, 1.4, 0.8); r.kx += 1.2; r.ky += 0.6; r.tilt = 0.12; }
    if (c.heavy) { r.nfx -= 0.8; r.ffx += 0.8; r.nhx -= 0.6; r.fhx += 0.4; }
    if (c.kid) { r.nfx += 0.4; r.ffx -= 0.4; }
    return r;
  });
  pose('guard', 0, (p, t, c) => {
    // on the balls of the feet: small bounce, breathing, lead hand pawing
    const b = Math.abs(Math.sin(t * TAU * 0.9)) * (c.boxer ? 0.9 : 0.4), br = breathe(t, 0.45) * 0.35;
    const r = up(mk(GUARD, {}), 0, b + br, 0.8);
    r.fhx += Math.sin(t * TAU * 0.9 + 0.8) * 0.5;
    if (!c.boxer) {   // a street fighter's guard: hands lower, more upright, less stagger
      r.fhy += 2.4; r.nhy += 2.8; r.fhx -= 1.2; r.hy -= 0.8; up(r, -0.6, -0.8); r.nfx += 1; r.ffx -= 0.6; r.tilt = 0;
    }
    if (c.heavy) { r.nfx -= 0.6; r.ffx += 0.4; }
    return r;
  });
  pose('block', 0, (p, t, c) => {
    // high cover: both forearms up in front of the face, hunched, chin buried
    const rc = t < 0.12 ? Math.sin((t / 0.12) * Math.PI) : 0;
    const r = mk(GUARD, { hy: -20.4, cx: 1.6, cy: -32.6, kx: 3, ky: -37.6, tilt: 0.32, fhx: 6.6, fhy: -39.4, nhx: 5.4, nhy: -38.6,
      nex: 0.6, ney: 1, fex: 0.7, fey: 1, rot: -0.2 });
    return up(r, -rc * 1.3, rc * 0.4, 0.5);
  });
  pose('pocket', 0, (p, t, c) => {
    const br = breathe(t, 0.3) * 0.5, sway = Math.sin(t * TAU / 7);
    const r = mk(STAND, { nfx: -2.4, ffx: 2.4, nhx: 0.8, nhy: -23.2, fhx: 2, fhy: -23.4, nh: 'pocket', fh: 'pocket', nex: -1, ney: 0.4, fex: -1, fey: 0.4, sh: 0.4 });
    return up(r, sway * 0.4, br * 0.5, 0.3);
  });
  pose('armsCrossed', 0, (p, t, c) => {
    const br = breathe(t, 0.3) * 0.45;
    const r = mk(STAND, { nfx: -2.8, ffx: 2.8, cx: 0.2, kx: 1.2, ky: -41.2, tilt: -0.06, rot: -0.35,
      nhx: 4.6, nhy: -30.2, fhx: 3.4, fhy: -31.6, nex: -1, ney: 0.35, fex: -1, fey: 0.2, nh: 'hidden', fh: 'fist' });
    return up(r, 0, br, 0.3);
  });
  pose('handsHips', 0, (p, t, c) => {
    const br = breathe(t, 0.3) * 0.45;
    const r = mk(STAND, { nfx: -3.6, ffx: 3.6, cx: 0, cy: -35.8, kx: 1, ky: -41.3, tilt: -0.05, rot: -0.2,
      nhx: 1.5, nhy: -23.6, fhx: 2.6, fhy: -24, nex: -1, ney: -0.25, fex: 1, fey: -0.2, nh: 'open', fh: 'open' });
    return up(r, 0, br, 0.3);
  });
  pose('headDown', 0, (p, t, c) => {
    const br = breathe(t, 0.22) * 0.5;
    const r = mk(STAND, { nfx: -1.4, ffx: 1.4, cx: 1.4, cy: -34.6, kx: 3.2, ky: -39.6, tilt: 0.62, sh: -0.6,
      nhx: 1.2, nhy: -21, fhx: 2.4, fhy: -21.4, rot: 0.1 });
    return up(r, 0, br, 0.2);
  });
  pose('shrug', 0, (p, t, c) => {
    const cyc = (t % 2.6) / 2.6, k = cyc < 0.18 ? smooth(cyc / 0.18) : cyc < 0.6 ? 1 : cyc < 0.78 ? 1 - smooth((cyc - 0.6) / 0.18) : 0;
    const base = mk(STAND, { nfx: -2.2, ffx: 2.2, nhx: 1, nhy: -22, fhx: 2, fhy: -22.2, nh: 'open', fh: 'open' });
    const top = mk(base, { sh: 1.8, tilt: -0.15, ky: -40.8, nhx: 5.4, nhy: -27.6, fhx: 7, fhy: -27.2, nex: -0.6, ney: 1, fex: -0.4, fey: 1, rot: -0.45 });
    return lerpRig(base, top, k);
  });
  pose('point', 0, (p, t, c) => {
    const br = breathe(t, 0.35) * 0.3;
    const r = mk(STAND, { nfx: -3, ffx: 2.6, cx: 1.2, kx: 2.4, rot: 0.45, nhx: 16, nhy: -37.4 + br, nh: 'point', nex: 0, ney: 1,
      fhx: 1.2, fhy: -22.6, fh: 'relax' });
    return r;
  });
  pose('wave', 0, (p, t, c) => {
    const w = Math.sin(t * TAU * 1.6);
    return mk(STAND, { nfx: -2, ffx: 2.2, rot: 0.15, nhx: 6 + w * 2.2, nhy: -47.5 + Math.abs(w) * 0.6, nh: 'open', nex: 1, ney: 0.6, nhh: 0.6,
      tilt: -0.08 });
  });
  pose('talk', 0, (p, t, c) => {
    // conversational gestures: an open hand rising and falling, a small nod
    const g = Math.sin(t * TAU * 0.55), g2 = Math.sin(t * TAU * 0.9 + 1.3);
    const r = mk(STAND, { nfx: -2, ffx: 2.3, rot: -0.1,
      nhx: 4.6 + g * 1.2, nhy: -27 - Math.max(0, g2) * 3.2, nh: 'open', nex: -1, ney: 0.8,
      fhx: 1.4, fhy: -22, tilt: Math.sin(t * TAU * 0.8) * 0.06 });
    if (c.boxer) { r.fhx = 3.6; r.fhy = -25.4; r.fh = 'fist'; }
    return up(r, 0, breathe(t, 0.3) * 0.3, 0.2);
  });
  pose('think', 0, (p, t, c) => {
    const r = mk(STAND, { nfx: -2.4, ffx: 2.2, cx: 0.8, kx: 2.2, ky: -40.8, tilt: 0.16, rot: -0.2,
      nhx: 3.6, nhy: -37.6, nh: 'fist', nhh: 1, nex: 0.2, ney: 1,
      fhx: 2.6, fhy: -28.2, fh: 'hidden', fex: -1, fey: 0.3 });
    r.nhy += Math.sin(t * TAU * 0.25) * 0.3;
    return up(r, 0, breathe(t, 0.25) * 0.35, 0.2);
  });
  pose('phone', 0, (p, t, c) => {
    const nod = Math.sin(t * TAU * 0.45) * 0.05;
    const r = mk(STAND, { nfx: -2.6, ffx: 2, cx: 0.2, kx: 1.2, tilt: 0.1 + nod, rot: 0.2,
      nhx: 0.4, nhy: -40.4, nh: 'fist', nhh: 1, nex: 0.4, ney: 1,
      fhx: 2.2, fhy: -27.4, fh: 'hidden', fex: -1, fey: 0.4, prop: 'phone' });
    return up(r, 0, breathe(t, 0.3) * 0.3, 0.2);
  });
  pose('smoke', 0, (p, t, c) => {
    // a slow cycle: hand comes up, a drag, the hand rests by the hip while smoke drifts
    const cyc = (t % 4.4) / 4.4;
    const k = cyc < 0.14 ? smooth(cyc / 0.14) : cyc < 0.34 ? 1 : cyc < 0.48 ? 1 - smooth((cyc - 0.34) / 0.14) : 0;
    const rest = mk(STAND, { nfx: -2.6, ffx: 2.2, nhx: 3.6, nhy: -26.4, nh: 'fist', nex: -1, ney: 0.6,
      fhx: 2.4, fhy: -28.6, fh: 'hidden', fex: -1, fey: 0.3, prop: 'cig', rot: -0.15 });
    const drag = mk(rest, { nhx: 3.4, nhy: -38.2, nhh: 1, nex: 0.2, ney: 1, tilt: -0.08 });
    const r = lerpRig(rest, drag, k);
    r.pa = cyc; r.prop = 'cig';
    return up(r, 0, breathe(t, 0.25) * 0.3, 0.2);
  });
  pose('drink', 0, (p, t, c) => {
    const cyc = (t % 3.8) / 3.8;
    const k = cyc < 0.16 ? smooth(cyc / 0.16) : cyc < 0.4 ? 1 : cyc < 0.56 ? 1 - smooth((cyc - 0.4) / 0.16) : 0;
    const rest = mk(STAND, { nfx: -2.2, ffx: 2.2, nhx: 4.2, nhy: -27.8, nh: 'fist', nex: -1, ney: 0.7, prop: 'cup', rot: -0.1 });
    const sip = mk(rest, { nhx: 4.4, nhy: -38.8, nhh: 1, nex: 0.3, ney: 1, tilt: -0.3, kx: 1, ky: -40.8 });
    const r = lerpRig(rest, sip, k);
    r.pa = k; r.prop = 'cup';
    return r;
  });
  pose('leanWall', 0, (p, t, c) => {
    // shoulders resting on the wall behind, hands in the track-top pockets, one knee bent with the
    // sole flat against the wall (ref-movement-art "First scene to produce")
    const br = breathe(t, 0.24) * 0.4;
    const r = mk(STAND, { hx: -1.6, hy: -22.4, cx: -3.6, cy: -35.4, kx: -2.2, ky: -40.9, tilt: 0.12, rot: -0.25,
      nfx: -4.4, nfy: -4.2, nfa: 1.35, nkx: 1, nky: -0.2, ffx: 3.8, ffa: 0,
      nhx: -0.4, nhy: -22.6, fhx: 0.6, fhy: -23, nh: 'pocket', fh: 'pocket', nex: -1, ney: 0.2, fex: -1, fey: 0.2 });
    return up(r, 0, br, 0);
  });
  pose('reach', 0, (p, t, c) => {
    const s = Math.sin(t * TAU * 0.6) * 0.6;
    return mk(STAND, { nfx: -1.8, ffx: 2, nfa: 0.55, ffa: 0.55, hy: -23.4, cx: 1, cy: -36.6, kx: 2, ky: -42.1, tilt: -0.3,
      nhx: 6.6, nhy: -53 + s, nh: 'open', nex: 0, ney: 1, nhh: 0.4, fhx: 4.6, fhy: -45 - s * 0.5, fh: 'open', fex: -0.5, fey: 1, fhh: 0.3 });
  });
  pose('cheer', 0, (p, t, c) => {
    const b = Math.abs(Math.sin(t * TAU * 1.1)), pump = Math.sin(t * TAU * 1.1) * 1.4;
    const r = mk(STAND, { nfx: -2.6, ffx: 2.6, tilt: -0.2, rot: -0.6, nhx: -3.6, nhy: -51.4 + pump, nh: 'fist', nex: -1, ney: 0.3, nhh: 0.6,
      fhx: 7.4, fhy: -51 - pump, fh: 'fist', fex: 1, fey: 0.3, fhh: 0.6 });
    return up(r, 0, -b * 1.2, 1);
  });
  pose('tired', 0, (p, t, c) => {
    // bent over, hands on the knees, heaving
    const br = Math.sin(t * TAU * 1.5) * 0.9;
    return mk(STAND, { hx: -1.8, hy: -20.4, cx: 6, cy: -29 + br, kx: 9, ky: -31.8 + br, tilt: 0.3, rot: -0.1,
      nfx: -3.6, ffx: 4.4, nhx: 5.6, nhy: -12.8, fhx: 6.6, fhy: -13.2, nh: 'open', fh: 'open', nex: -1, ney: -0.3, fex: -1, fey: -0.3,
      nkx: 1, nky: 0, fkx: 1, fky: 0 });
  });
  pose('cower', 0, (p, t, c) => {
    const j = Math.sin(t * 47) * 0.3;
    return mk(STAND, { hx: -1.6, hy: -13.4, cx: -2.6, cy: -24.6, kx: -0.6, ky: -28.6, tilt: 0.55, rot: 0.3,
      nfx: -4, ffx: 3.4, nfa: 0.4, ffa: 0.3, nhx: 2 + j, nhy: -31.4, fhx: 3.2 + j, fhy: -31.8, nh: 'open', fh: 'open',
      nex: 1, ney: 0.2, fex: 1, fey: 0.2, nkx: 1, nky: -0.3, fkx: 1, fky: -0.3 });
  });
  pose('handShoulder', 0, (p, t, c) => {
    const br = breathe(t, 0.28) * 0.3;
    return up(mk(STAND, { nfx: -2.4, ffx: 2.4, cx: 1.4, kx: 2.8, tilt: 0.16, rot: 0.3,
      nhx: 13.4, nhy: -36.2, nh: 'open', nex: 0, ney: 1, fhx: 1.6, fhy: -22 }), 0, br, 0.2);
  });
  pose('hug', 0, (p, t, c) => {
    const br = breathe(t, 0.25) * 0.4;
    return up(mk(STAND, { nfx: -3, ffx: 1.8, cx: 2.6, cy: -35, kx: 5.4, ky: -40.2, tilt: 0.38, rot: 0.15,
      nhx: 11.2, nhy: -30.8, nh: 'open', nex: 0, ney: 1, fhx: 12, fhy: -33.4, fh: 'open', fex: 0.3, fey: 1 }), 0, br, 0.2);
  });

  /* ── Locomotion ───────────────────────────────────────────────────── */
  pose('walk', 0, (p, t, c) => {
    if (c.boxer) {
      // a fighter's walk: loose fists carried at the belt, arms swinging less
      const r = walkRig(t, c, { armSwing: 0.32, lean: 1.4 });
      r.nhy -= 2.6; r.fhy -= 3; r.nhx += 2.4; r.fhx += 3; r.nh = 'fist'; r.fh = 'fist';
      r.nex = -0.6; r.ney = 1; r.fex = -0.5; r.fey = 1;
      return r;
    }
    const r = walkRig(t, c, {});
    if (c.old) { up(r, 1.6, 1); r.kx += 1.2; r.tilt = 0.14; }
    return r;
  });
  pose('limp', 0, (p, t, c) => {
    // the near (right) leg stays stiff and drags; the body dips onto the good leg
    const rate = cycleRate(c, 1.15, 16);
    let ph = (t * rate) % 1;
    ph = ph + 0.09 * Math.sin(ph * TAU);            // hurry off the bad leg
    const A = 4;
    const n = legWalk(ph, A, 0.9), f = legWalk((ph + 0.5) % 1, A, 2.6);
    const onBad = ph < 0.5;
    const dip = onBad ? 0.3 : 1.4 * Math.sin(((ph - 0.5) / 0.5) * Math.PI);
    const r = mk(STAND, { hy: -22.6 + dip, cx: 1.6, cy: -35.2 + dip, kx: 3, ky: -40.5 + dip, tilt: 0.15,
      nfx: n.x, nfy: n.y, nfa: n.a * 0.4, ffx: f.x, ffy: f.y, ffa: f.a, nkx: 0.25, nky: 0.2, fkx: 1, fky: 0,
      nhx: 1.6, nhy: -23.4 + dip, nh: 'open', fhx: 1.2 - f.x * 0.5, fhy: -22 + dip, rot: 0.1 + dip * 0.12 });
    return r;
  });
  pose('run', 0, (p, t, c) => {
    const A = c.kid ? 7 : 9.5, lift = c.kid ? 4.5 : 6;
    const rate = cycleRate(c, c.kid ? 3.3 : 2.85, (2 * A) / RUN_DUTY);
    const ph = (t * rate) % 1;
    const n = legRun(ph, A, lift), f = legRun((ph + 0.5) % 1, A, lift);
    const bounce = -1.3 * Math.max(0, Math.sin(ph * TAU * 2 - 0.6)) + 0.5;
    const r = mk(STAND, { hx: 1.2, hy: -22.2 + bounce, cx: 6.2, cy: -34.2 + bounce, kx: 8.6, ky: -39 + bounce, tilt: 0.12,
      nfx: n.x, nfy: n.y, nfa: n.a, ffx: f.x, ffy: f.y, ffa: f.a, nkx: 1, nky: 0.15, fkx: 1, fky: 0.15,
      rot: 0.28 * Math.sin(ph * TAU), wind: 1, nh: 'fist', fh: 'fist', nex: -1, ney: 0.35, fex: -1, fey: 0.35 });
    // arms pump opposite to the same-side leg, bent near 90 degrees
    const sn = -n.x / A, sf = -f.x / A;
    r.nhx = 5 + sn * 8; r.nhy = -27.4 + bounce - Math.max(0, sn) * 4.4 + Math.max(0, -sn) * 1.2;
    r.fhx = 5.6 + sf * 8; r.fhy = -27.6 + bounce - Math.max(0, sf) * 4.4 + Math.max(0, -sf) * 1.2;
    return r;
  });
  pose('backstep', 0, (p, t, c) => {
    // retreating with the guard up: quick shuffles, rear foot first, weight kept back
    const rate = cycleRate(c, 2.3, 14);
    const ph = (t * rate) % 1;
    const sN = Math.sin(ph * TAU), sF = Math.sin(ph * TAU - 1.1);
    const r = mk(GUARD, {});
    r.nfx = -5.6 - sN * 2.4; r.nfy = -Math.max(0, Math.cos(ph * TAU)) * 1.6; r.nfa = 0.55;
    r.ffx = 4.6 - sF * 2.2; r.ffy = -Math.max(0, Math.cos(ph * TAU - 1.1)) * 1.2; r.ffa = 0.2;
    up(r, -1.3, -0.4 + Math.abs(Math.sin(ph * TAU)) * 0.5, 0.4);
    r.wind = -0.2;
    if (!c.boxer) { r.fhy += 2; r.nhy += 2.4; }
    return r;
  });
  pose('brake', 0.18, (p, t, c) => {
    // sudden stop: lead heel digs in, body rocks back, arms catch the balance
    const r = mk(GUARD, { hx: -1.4, hy: -18.8, cx: -3.6, cy: -31.2, kx: -2.6, ky: -36.4, tilt: -0.1,
      nfx: -4.4, nfa: 0.5, ffx: 9.6, ffa: -0.45, fhx: 6.4, fhy: -29.6, fh: 'open', nhx: -6.4, nhy: -27.4, nh: 'open', nex: 0.5, ney: 1,
      wind: -1, rot: -0.3 });
    return lerpRig(r, GUARD, smooth(clamp((p - 0.55) / 0.45, 0, 1)));
  });
  pose('turn', 0.12, (p, t, c) => {
    // mid-pivot: chest square to the camera for a frame
    const r = mk(GUARD, { rot: -1, cx: 0.8, kx: 1.8, fhx: 4.6, nhx: 3.4, nfx: -3.4, ffx: 3.4 });
    return lerpRig(r, GUARD, smooth(p));
  });
  pose('jump', 0, (p, t, c) => {
    const k = clamp(t / 0.14, 0, 1);
    const tuck = mk(STAND, { hy: -23.8, cx: 1.6, cy: -37, kx: 2.8, ky: -42.4, tilt: -0.08,
      nfx: -3.4, nfy: -3.6, nfa: 0.9, ffx: 4.6, ffy: -7.4, ffa: 0.6, nkx: 1, nky: 0, fkx: 1, fky: -0.3,
      fhx: 7, fhy: -36.6, fh: 'fist', fex: -0.3, fey: 1, nhx: -2.8, nhy: -28.4, nh: 'fist', nex: 0.5, ney: 1, rot: -0.3, wind: -0.4 });
    const push = mk(tuck, { hy: -22.8, nfy: -0.6, ffy: -3, nfx: -2.4, ffx: 3.4, fhy: -33.6, nhy: -25 });
    return lerpRig(push, tuck, smooth(k));
  });
  pose('fall', 0, (p, t, c) => {
    const f = Math.sin(t * TAU * 1.6) * 0.8;
    return mk(STAND, { hy: -23, cx: 1, cy: -36.2, kx: 2.2, ky: -41.6, tilt: 0.05,
      nfx: -3.6, nfy: -1.6, nfa: 0.7, ffx: 4.2, ffy: -3, ffa: 0.4, nkx: 1, nky: 0, fkx: 1, fky: 0,
      fhx: 8 + f, fhy: -32.4, fh: 'open', fex: -0.4, fey: 1, nhx: -5.6 - f, nhy: -30.4, nh: 'open', nex: 0, ney: 1, wind: 0.6, rot: -0.2 });
  });
  pose('land', 0.12, (p, t, c) => {
    const deep = mk(GUARD, { hy: -15.8, cx: 3.4, cy: -28.4, kx: 5.2, ky: -33.4, tilt: 0.2,
      nfx: -4.4, nfa: 0.2, ffx: 5.2, fhx: 8.4, fhy: -26, nhx: 5.2, nhy: -24.4, fh: 'fist', nh: 'fist', wind: -0.6 });
    return lerpRig(deep, mk(deep, { hy: -19.4, cy: -31.6, ky: -36.8, fhy: -30, nhy: -29.4 }), smooth(p));
  });
  pose('climb', 0, (p, t, c) => {
    // facing the ladder: hands climb the rungs in front, feet alternate
    const ph = (t * cycleRate(c, 1.4, 0)) % 1, s = Math.sin(ph * TAU);
    return mk(STAND, { hx: -0.4, hy: -22.6 - s * 0.8, cx: 1.6, cy: -35.6 - s * 0.8, kx: 2.6, ky: -41, tilt: -0.1, rot: -0.6,
      nhx: 5.2, nhy: -44 - s * 4, nh: 'fist', nex: -1, ney: 1, fhx: 5.6, fhy: -40 + s * 4, fh: 'fist', fex: -1, fey: 1,
      nfx: 2.4, nfy: -3 + s * 3, nfa: 0.3, ffx: 2.8, ffy: -3 - s * 3, ffa: 0.3, nkx: 1, nky: 0, fkx: 1, fky: 0 });
  });

  /* ── Dashes and the slip ──────────────────────────────────────────── */
  pose('dash', 0.16, (p, t, c) => {
    // an exaggerated boxing step: drop the hips, drive off the rear foot, burst forward guard tight
    const load = mk(GUARD, { hy: -18.4, cx: 4.6, cy: -30.4, kx: 6.8, ky: -35, nfx: -6.2, nfa: 0.7, ffx: 5.4,
      fhx: 9.4, fhy: -32.6, nhx: 7, nhy: -32, tilt: 0.25, wind: 0.6 });
    const burst = mk(load, { hx: 1.2, hy: -19.2, cx: 7.4, cy: -30.6, kx: 9.8, ky: -35.1, nfx: -11.4, nfy: -0.6, nfa: 1.0,
      ffx: 8.6, ffy: -2.4, ffa: -0.15, fhx: 12.4, fhy: -32.8, nhx: 9.8, nhy: -31.8, rot: -0.25, wind: 1, tilt: 0.3 });
    return kf(p, [[0, load], [0.22, burst], [0.68, burst], [1, mk(GUARD, { wind: 0.5 })]]);
  });
  pose('backdash', 0.14, (p, t, c) => {
    // shorter defensive retreat, facing kept, body pulled back over the rear foot
    const load = mk(GUARD, { hy: -19.6, nfx: -5.6, ffx: 4.4, ffa: 0.4 });
    const pull = mk(GUARD, { hx: -1.4, hy: -20.2, cx: -2.6, cy: -32.6, kx: -1.4, ky: -37.7, tilt: 0.05,
      nfx: -9.8, nfy: -1.2, nfa: 0.35, ffx: 2.6, ffy: -2, ffa: 0.6, fhx: 5.6, fhy: -35.6, nhx: 2.8, nhy: -36.2, wind: -0.8, rot: -0.3 });
    return kf(p, [[0, load], [0.2, pull], [0.7, pull], [1, GUARD]]);
  });
  pose('slip', 0.2, (p, t, c) => {
    // a small knee bend, torso rotation and the head dropping off the line; hands stay home
    return kf(p, [[0, GUARD], [0.24, SLIPPED], [0.6, SLIPPED], [1, GUARD]]);
  });

  /* ── Punches (combat maps active frames to p 0.35..0.6) ───────────── */
  pose('jab', 0.22, (p, t, c) => {
    // lead hand snaps out with a tiny forward step and comes straight back
    const load = mk(GUARD, { fhx: 8.2, fhy: -34.8, rot: -0.55, hy: -20.8 });
    const ext = mk(GUARD, { hx: 1, cx: 3.6, cy: -33.6, kx: 4.8, ky: -38.9, ffx: 7.2, nfx: -4.6,
      fhx: 21, fhy: -35.8, fex: 0, fey: 1, rot: -0.8, nhx: 6.2, nhy: -35.8, wind: 0.3 });
    return kf(p, [[0, GUARD], [0.12, load], [0.35, ext], [0.6, mk(ext, { fhx: 20.2 })], [1, GUARD]]);
  });
  pose('cross', 0.29, (p, t, c) => {
    // rear foot pivots (heel up), hip turns, the rear shoulder drives the straight right through
    const load = mk(GUARD, { rot: -0.65, nhx: 4.6, nhy: -35.2 });
    const ext = mk(GUARD, { hx: 1.6, hy: -21.2, cx: 5.6, cy: -33.4, kx: 6.8, ky: -38.6, nfx: -4, nfa: 0.85, ffx: 6,
      nhx: 23, nhy: -35.6, nex: 0, ney: 1, fhx: 6.8, fhy: -36.2, rot: 0.75, wind: 0.4, tilt: 0.18 });
    return kf(p, [[0, GUARD], [0.12, load], [0.35, ext], [0.6, mk(ext, { nhx: 22.2 })], [1, GUARD]]);
  });
  pose('hook', 0.37, (p, t, c) => {
    // compact turn: lead elbow lifts to shoulder height, fist sweeps across in a curve
    const load = mk(GUARD, { hy: -20.2, rot: -0.95, fhx: 7.4, fhy: -34.6, fex: -1, fey: -0.2, cx: 1.4, kx: 2.8 });
    const mid = mk(GUARD, { hx: 1, hy: -20.4, cx: 4.8, cy: -33.2, kx: 6.2, ky: -38.2, ffa: 0.6, nfa: 0.4, tilt: 0.25,
      fhx: 14.6, fhy: -35, ffs: 0.32, fex: 0, fey: -1, rot: 0.35, nhx: 6.4, nhy: -36.4, wind: 0.4, ffront: 1 });
    const thru = mk(mid, { fhx: 13.2, fhy: -35, ffs: 0.3, rot: 0.95, cx: 5.2, kx: 6.6 });
    return kf(p, [[0, GUARD], [0.15, load], [0.35, mid], [0.6, thru], [1, GUARD]]);
  });
  pose('uppercut', 0.4, (p, t, c) => {
    // quick knee dip, then hips and rear shoulder drive the fist straight up
    const dip = mk(GUARD, { hy: -17.2, cx: 3, cy: -29.4, kx: 4.8, ky: -34.4, nhx: 5.2, nhy: -25.4, nex: -1, ney: 0.5,
      rot: -0.35, tilt: 0.25, nfa: 0.2 });
    const drive = mk(GUARD, { hx: 1, hy: -22.8, cx: 3.6, cy: -35.4, kx: 4, ky: -40.8, nfa: 0.75, ffa: 0.25,
      nhx: 10.4, nhy: -43.8, nex: 0.4, ney: 1, fhx: 6.4, fhy: -37, rot: 0.55, tilt: -0.22, wind: -0.3 });
    return kf(p, [[0, GUARD], [0.2, dip], [0.4, drive], [0.6, mk(drive, { nhy: -44.6 })], [1, GUARD]]);
  });
  pose('dashStraight', 0.33, (p, t, c) => {
    // the dash carries into a fully extended straight: long, low, the rear leg trailing
    const load = mk(GUARD, { hy: -18.4, cx: 5.6, cy: -30.2, kx: 7.8, ky: -34.8, nfx: -8.4, nfa: 0.8, ffx: 6,
      nhx: 6.8, nhy: -32.2, fhx: 10.2, fhy: -33.2, tilt: 0.25, wind: 1 });
    const ext = mk(GUARD, { hx: 3, hy: -19.2, cx: 8.8, cy: -31, kx: 11.2, ky: -35.6, nfx: -11.4, nfy: -0.4, nfa: 1.0, ffx: 10.2,
      nhx: 26, nhy: -33.6, nex: 0, ney: 1, fhx: 10.8, fhy: -34.4, rot: 0.8, tilt: 0.2, wind: 1 });
    return kf(p, [[0, load], [0.35, ext], [0.6, mk(ext, { nhx: 25.4 })], [1, GUARD]]);
  });
  pose('counter', 0.24, (p, t, c) => {
    // out of the slip: the head stays low and offline while the rear hand fires back up the middle
    const ext = mk(GUARD, { hx: 2, hy: -19.8, cx: 6.2, cy: -31.6, kx: 7.8, ky: -36.2, nfx: -4.6, nfa: 0.9, ffx: 6.4,
      nhx: 22.6, nhy: -34.8, nex: 0, ney: 1, fhx: 7.6, fhy: -34.4, rot: 0.85, tilt: 0.3, wind: 0.6 });
    return kf(p, [[0, SLIPPED], [0.35, ext], [0.6, mk(ext, { nhx: 21.8 })], [1, GUARD]]);
  });
  pose('flurry', 0.7, (p, t, c) => {
    // ~0.5 s of alternating straights at slightly different heights, then a clear finishing cross
    const base = mk(GUARD, { hx: 1, hy: -20.6, cx: 4, cy: -33.2, kx: 5.2, ky: -38.4, nfx: -5.6, ffx: 6, wind: 0.5 });
    if (t < 0.5) {
      const step = 0.5 / 6, i = Math.floor(t / step), u = (t - i * step) / step;
      const e = u < 0.45 ? smooth(u / 0.45) : 1 - smooth((u - 0.45) / 0.55);
      const h = [-35.6, -34, -36.4, -33.4, -35.2, -34.6][i % 6];
      const r = mk(base, {});
      if (i % 2) { r.nhx = lerp(6.4, 21.2, e); r.nhy = lerp(-35.8, h, e); r.nex = lerp(-0.25, 0, e); r.rot = lerp(-0.2, 0.6, e); r.fhx = 7.2; r.fhy = -35.8; }
      else { r.fhx = lerp(9, 20, e); r.fhy = lerp(-35.4, h, e); r.fex = lerp(-0.1, 0, e); r.rot = lerp(-0.2, -0.75, e); r.nhx = 6.2; r.nhy = -35.8; }
      return r;
    }
    const fin = mk(base, { hx: 2, cx: 6.4, cy: -33, kx: 7.6, ky: -38.2, nfa: 0.9, nhx: 23.2, nhy: -35.4, nex: 0, ney: 1, rot: 0.85,
      fhx: 7.2, fhy: -36, ffx: 7, wind: 1 });
    const u = (t - 0.5) / 0.2;
    return kf(u, [[0, base], [0.3, fin], [0.55, fin], [1, GUARD]]);
  });

  /* ── Getting hit ──────────────────────────────────────────────────── */
  pose('hurt', 0.3, (p, t, c) => {
    // recoil away from the hit: head snaps back, chest follows, hands fly loose
    const snap = mk(GUARD, { hx: -1.6, hy: -21.2, cx: -4, cy: -32.8, kx: -4, ky: -37.8, tilt: -0.7,
      fhx: 6.6, fhy: -26.4, fh: 'open', nhx: -4.2, nhy: -26.2, nh: 'open', nex: 0.6, ney: 1, fex: 0.3, fey: 1,
      nfx: -7.2, nfa: 0.25, ffx: 3.4, ffa: 0.6, rot: 0.45, wind: -1 });
    return kf(p, [[0, mk(GUARD, {})], [0.12, snap], [0.45, snap], [1, mk(GUARD, { fhy: -33, nhy: -33.6 })]]);
  });
  pose('stagger', 0, (p, t, c) => {
    const w = Math.sin(t * TAU * 1.3), w2 = Math.sin(t * TAU * 2.6 + 0.7);
    return mk(STAND, { hx: -0.8 + w * 0.6, hy: -20.4 + Math.abs(w2) * 0.6, cx: -2.6 + w * 1.6, cy: -32.4, kx: -1.4 + w * 2.2, ky: -37.4,
      tilt: -0.25 + w * 0.2, rot: 0.3 * w, nfx: -6 + w2 * 1.2, nfy: -Math.max(0, w2) * 1.4, nfa: 0.3, ffx: 4.4, ffa: 0.1,
      fhx: 6 + w, fhy: -27.2, fh: 'open', nhx: -4.4 - w, nhy: -26.2, nh: 'open', nex: 1, ney: 0.6, fex: 0.5, fey: 1,
      nkx: 1, nky: 0, fkx: 1, fky: 0, wind: -0.4 });
  });
  pose('knockdown', 0.45, (p, t, c) => {
    const hit = mk(GUARD, { hx: -1.2, hy: -21, cx: -3.4, cy: -33, kx: -3, ky: -38.4, tilt: -0.55, fhx: 4, fhy: -31, nhx: -2.4, nhy: -30,
      fh: 'open', nh: 'open', rot: 0.4, nfx: -6.4, ffx: 3.4, ffa: 0.6 });
    const going = mk(LYING, { hx: -3.4, hy: -12.4, cx: -12.4, cy: -20.6, kx: -15.6, ky: -24.2, tilt: -0.2,
      nfx: 3, nfy: -1.6, nfa: -0.6, ffx: 6.2, ffy: -5.4, ffa: -0.5, nhx: -9, nhy: -30.4, fhx: -16.6, fhy: -28,
      nkx: 1, nky: -1, fkx: 1, fky: -1, nex: 1, ney: 0, fex: 1, fey: 0 });
    const impact = mk(LYING, { ffy: -6.2, nfy: -3, nhy: -6, fhy: -5.4, kx: -19.6, ky: -5.2 });
    return kf(p, [[0, hit], [0.32, going], [0.66, impact], [0.82, mk(LYING, { ffy: -3 })], [1, LYING]]);
  });
  pose('down', 0, (p, t, c) => {
    const br = breathe(t, 0.35) * 0.35;
    return mk(LYING, { cy: LYING.cy - br, ky: LYING.ky - br * 0.5 });
  });
  pose('getup', 0.45, (p, t, c) => {
    const sitUp = mk(STAND, { hx: -1, hy: -3.4, cx: 3, cy: -15.6, kx: 5.2, ky: -21, tilt: 0.25, rot: 0,
      nfx: 7.4, ffx: 9, nfa: -0.2, ffa: -0.2, nkx: 0, nky: -1, fkx: 0, fky: -1,
      nhx: -5, nhy: -1.2, nh: 'open', nex: -1, ney: -0.3, fhx: 6.6, fhy: -10, fh: 'open' });
    const kneel = mk(STAND, { hx: 0, hy: -11.6, cx: 3.4, cy: -24.6, kx: 5.4, ky: -30, tilt: 0.25,
      nfx: -5.6, nfa: 1.1, ffx: 6, nkx: 1, nky: 0.6, fkx: 1, fky: -0.6, fhx: 7.6, fhy: -12.4, fh: 'open', nhx: 3.4, nhy: -16, nh: 'fist' });
    return kf(p, [[0, LYING], [0.3, sitUp], [0.62, kneel], [1, GUARD]]);
  });

  /* ── Sitting, lying, kneeling ─────────────────────────────────────── */
  // Seat height from opts.seat (px above the feet line): chair 12 (default), bench 11, stool 18, bed 20.
  function seated(c, o) {
    const seat = c.opts.seat != null ? +c.opts.seat : 12;
    const hy = -(seat + 1.2) / c.sb;      // rig space is pre-scale; keep the seat in pixels
    const footY = Math.min(0, -(seat + 1.2 - 20.5 * c.sb) / c.sb);
    return mk(STAND, Object.assign({ hx: -2.4, hy, cx: -1.6, cy: hy - 13, kx: -0.4, ky: hy - 18.5, rot: -0.1,
      nfx: 7.6, nfy: footY, ffx: 9, ffy: footY, nkx: 0.6, nky: -1, fkx: 0.6, fky: -1,
      nhx: 4, nhy: hy - 2.6, nh: 'open', fhx: 5.2, fhy: hy - 3, fh: 'open', nex: -1, ney: 0.3, fex: -1, fey: 0.3 }, o || {}));
  }
  pose('sit', 0, (p, t, c) => {
    const r = seated(c);
    return up(r, 0, breathe(t, 0.28) * 0.4, 0);
  });
  pose('write', 0, (p, t, c) => {
    // seated at a desk (top ~ 20 px): leaning in, the near hand scribbling, the other holding the page
    const r = seated(c, { cx: 0.6, kx: 2.8, tilt: 0.45 });
    r.cy = r.hy - 12.4; r.ky = r.cy - 5.2;
    const desk = c.opts.desk != null ? -(+c.opts.desk) - 1 : -21.2;
    r.nhx = 8.4 + Math.sin(t * TAU * 2.2) * 0.8; r.nhy = desk / c.sb + Math.abs(Math.sin(t * TAU * 4.4)) * -0.4; r.nh = 'fist'; r.nex = -1; r.ney = 0.2;
    r.fhx = 10.4; r.fhy = desk / c.sb + 0.4; r.fh = 'open'; r.fex = -1; r.fey = 0.2;
    r.prop = 'pen';
    return r;
  });
  pose('sitFloor', 0, (p, t, c) => {
    const r = mk(STAND, { hx: -2.4, hy: -3.4, cx: -0.4, cy: -16.6, kx: 1.4, ky: -22, tilt: 0.25, rot: -0.1,
      nfx: 7.4, ffx: 9, nkx: 0, nky: -1, fkx: 0, fky: -1, nhx: 6.2, nhy: -11.2, fhx: 7.4, fhy: -11.6, nh: 'open', fh: 'open',
      nex: -1, ney: 0.5, fex: -1, fey: 0.5 });
    return up(r, 0, breathe(t, 0.25) * 0.4, 0);
  });
  pose('sitCurb', 0, (p, t, c) => {
    // on a curb: knees up, forearms on the knees, hands hanging between them, head low
    const r = mk(STAND, { hx: -2.4, hy: -6.6, cx: 0.6, cy: -19.4, kx: 2.8, ky: -24.4, tilt: 0.38, rot: -0.1,
      nfx: 7, ffx: 8.4, nfa: 0.1, nkx: 0.3, nky: -1, fkx: 0.3, fky: -1, nhx: 8.6, nhy: -9.4, fhx: 9.4, fhy: -10, nh: 'relax', fh: 'relax',
      nex: 0, ney: -1, fex: 0, fey: -1 });
    return up(r, 0, breathe(t, 0.22) * 0.4, 0);
  });
  pose('kneel', 0, (p, t, c) => {
    // near knee on the ground, far foot planted forward, a hand on the raised knee
    const r = mk(STAND, { hx: -0.6, hy: -12.4, cx: 0.4, cy: -25.4, kx: 1.8, ky: -30.8, tilt: 0.18, rot: -0.15,
      nfx: -13, nfy: 0, nfa: 0.85, nkx: 1, nky: 1, ffx: 7.4, ffa: 0, fkx: 1, fky: -0.8,
      fhx: 6.6, fhy: -13.6, fh: 'open', nhx: 0.6, nhy: -14.6, nh: 'relax' });
    return up(r, 0, breathe(t, 0.28) * 0.4, 0);
  });
  pose('crouch', 0, (p, t, c) => {
    // a low squat to look at or pick up something on the ground
    const r = mk(STAND, { hx: -1, hy: -10.4, cx: 2.6, cy: -22.6, kx: 4.6, ky: -27.8, tilt: 0.35, rot: -0.2,
      nfx: -3, nfa: 0.55, ffx: 4.2, ffa: 0.2, nkx: 1, nky: -0.3, fkx: 1, fky: -0.3,
      fhx: 9.6, fhy: -4.4, fh: 'open', nhx: 5.6, nhy: -10.6, nh: 'relax', fex: -0.5, fey: 1 });
    return up(r, 0, breathe(t, 0.28) * 0.3, 0);
  });
  pose('lieBed', 0, (p, t, c) => {
    // on the back with the head propped on the pillow; drawn mirrored so the head points the way
    // the actor faces (pieces' bed puts the pillow on its facing side). opts.bed = surface height.
    const bed = c.opts.bed != null ? +c.opts.bed : 20;
    const y = -bed / c.sb, br = breathe(t, 0.25) * 0.35;
    return mk(LYING, { hx: 1.6, hy: y - 2.6, cx: -10.6, cy: y - 4.4 - br, kx: -15.8, ky: y - 7.4, tilt: -0.15,
      nfx: 24.6, nfy: y - 0.4, ffx: 23.4, ffy: y - 1.6, nfa: -1.3, ffa: -1.25, nkx: 0, nky: -1, fkx: 0, fky: -1,
      nhx: -3.4, nhy: y - 7.2, nh: 'relax', nex: 0, ney: 1, fhx: -1.6, fhy: y - 4.2, fh: 'relax', fex: 0, fey: 1, prop: 'blanket' });
  });
  POSES.lieBed.mirror = true;
  POSES.lieBed.noShadow = true;
  pose('wheelchair', 0, (p, t, c) => {
    // seated in a chair with big rear wheels (matches pieces' wheelchair); hands push the rims when moving
    const moving = c.moving;
    const ph = moving ? (t * cycleRate(c, 1.1, 0)) % 1 : 0.15;
    const push = moving ? Math.sin(ph * TAU) : -0.6;
    const r = mk(STAND, { hx: -3.4, hy: -15.6, cx: -2.4, cy: -28.6, kx: -1.2, ky: -34, rot: -0.1, tilt: 0.05,
      nfx: 8.2, nfy: -3.2, ffx: 9.4, ffy: -3.6, nfa: 0.2, ffa: 0.2, nkx: 0.5, nky: -1, fkx: 0.5, fky: -1,
      nhx: -3 + push * 2.8, nhy: -16.4 + push * 1.4, nh: 'fist', nex: -1, ney: 0.2,
      fhx: -2.4 + push * 2.8, fhy: -16.6 + push * 1.4, fh: 'fist', fex: -1, fey: 0.2, prop: 'wheelchair' });
    r.pa = moving ? t * cycleRate(c, 1.1, 0) : 0;
    if (moving) up(r, push * 0.8, 0, 0);
    return r;
  });
  pose('bars', 0, (p, t, c) => {
    // gripping parallel bars (pieces' rail ~32 px): shoulders carry the weight, a small effort tremor
    const barY = -(c.opts.barH != null ? +c.opts.barH : 32.5) / c.sb;
    const tr = Math.sin(t * 23) * 0.18, sh = Math.sin(t * TAU * 0.3) * 0.5;
    return mk(STAND, { hy: -22.2, cx: 0.8 + sh, cy: -35.6, kx: 2 + sh, ky: -40.9, tilt: 0.22, sh: 1.2, rot: -0.2,
      nfx: -2.6, ffx: 2.8, nfa: 0.1, nkx: 1, nky: 0, fkx: 1, fky: 0,
      nhx: 2.6, nhy: barY + tr, nh: 'fist', nex: -1, ney: 0.15, fhx: 4, fhy: barY - tr, fh: 'fist', fex: -1, fey: 0.15 });
  });

  /* ── Work and errands ─────────────────────────────────────────────── */
  pose('carry', 0, (p, t, c) => {
    // both hands under a load held at the belly; legs walk only when moving
    let r;
    if (c.moving) { r = walkRig(t, c, { A: 4.4, lift: 2, lean: -0.4, armSwing: 0 }); }
    else r = up(mk(STAND, { nfx: -2.6, ffx: 2.6 }), 0, breathe(t, 0.32) * 0.4, 0.3);
    r.cx -= 0.6; r.kx -= 0.8; r.tilt = 0.1;
    r.nhx = r.cx + 6.6; r.nhy = r.cy + 8.6; r.fhx = r.cx + 9.2; r.fhy = r.cy + 8; r.nh = 'open'; r.fh = 'open';
    r.nex = -1; r.ney = 0.6; r.fex = -1; r.fey = 0.6; r.rot = -0.1;
    r.prop = 'carry';
    return r;
  });
  pose('push', 0, (p, t, c) => {
    const s = c.moving ? Math.sin(t * TAU * 1.3) : Math.sin(t * TAU * 0.6) * 0.4;
    const r = mk(STAND, { hx: -1.4, hy: -21.4, cx: 4.8, cy: -32.4, kx: 7.4, ky: -37.4, tilt: 0.25, rot: -0.2,
      nfx: -8.6 + s * 2, nfa: 0.75, ffx: 2.8 - s * 1.6, ffy: c.moving ? -Math.max(0, s) * 1.6 : 0, nkx: 1, nky: 0, fkx: 1, fky: 0,
      nhx: 15.6, nhy: -32.4, nh: 'open', nex: 0, ney: 1, fhx: 16.6, fhy: -33.2, fh: 'open', fex: 0, fey: 1 });
    return r;
  });
  pose('work', 0, (p, t, c) => {
    // at a counter (~21 px): leaning in, hands busy in front — chopping, wiping, sorting
    const a = Math.sin(t * TAU * 1.5), b = Math.sin(t * TAU * 0.75 + 1);
    const r = mk(STAND, { nfx: -2.6, ffx: 2.4, cx: 2, cy: -35.2, kx: 3.6, ky: -40.4, tilt: 0.4, rot: -0.2,
      nhx: 8.8 + b * 1.6, nhy: -23.4 - Math.max(0, a) * 1.8, nh: 'fist', nex: -1, ney: 0.4,
      fhx: 10.6 - b * 0.8, fhy: -23, fh: 'open', fex: -1, fey: 0.4 });
    return r;
  });
  pose('sweep', 0, (p, t, c) => {
    // broom angled down in front; the head swishes back and forth
    const s = Math.sin(t * TAU * 0.9);
    const r = mk(STAND, { nfx: -3, ffx: 2.6, cx: 1.6, cy: -35, kx: 3.2, ky: -40.2, tilt: 0.38, rot: -0.15 + s * 0.15,
      fhx: 3 + s * 1.2, fhy: -31.6, fh: 'fist', fex: -1, fey: 0.6, nhx: 5.6 + s * 2.2, nhy: -25.6, nh: 'fist', nex: -1, ney: 0.4, prop: 'broom' });
    r.pa = 12 + s * 3.4;            // broom head x
    return r;
  });
  pose('shadowbox', 0, (p, t, c) => {
    // working alone: bounce, jab, jab, cross, slip, hook, reset (2.4 s loop)
    const T = t % 2.4;
    const bounce = Math.abs(Math.sin(t * TAU * 1.6)) * 0.8;
    const seq = [['jab', 0.05, 0.27], ['jab', 0.38, 0.6], ['cross', 0.72, 1.02], ['slip', 1.2, 1.42], ['hook', 1.6, 1.98]];
    for (const [name, a, b] of seq) if (T >= a && T < b) return up(evalPose(name, (T - a) / (b - a), T - a, c), 0, bounce * 0.4, 0.5);
    const r = POSES.guard.fn(0, t, c);
    return up(r, 0, bounce * 0.4, 0.5);
  });
  pose('skip', 0, (p, t, c) => {
    // skipping rope: small hops on the balls of the feet, wrists turning the rope at the hips
    const rate = 2.1, ph = (t * rate) % 1;
    const hop = Math.max(0, Math.sin(ph * TAU)) * 2.6, land = Math.max(0, -Math.sin(ph * TAU)) * 0.9;
    const w = ph * TAU;
    const r = mk(STAND, { hy: -22.2 + land - hop, cx: 0.8, cy: -35.4 + land * 0.6 - hop, kx: 1.8, ky: -40.9 + land * 0.4 - hop, tilt: 0.05,
      nfx: -1.4, nfy: -hop, ffx: 1.8, ffy: -hop, nfa: 0.5, ffa: 0.5, nkx: 1, nky: 0, fkx: 1, fky: 0,
      nhx: 2.6 + Math.cos(w) * 1.2, nhy: -23.6 - hop + Math.sin(w) * 1.2, nh: 'fist', nex: -1, ney: 0.4,
      fhx: 3.6 + Math.cos(w) * 1.2, fhy: -24 - hop + Math.sin(w) * 1.2, fh: 'fist', fex: -1, fey: 0.4, prop: 'rope' });
    r.pa = ph;
    return r;
  });

  /* ── Enemy moves ──────────────────────────────────────────────────── */
  pose('windup', 0.3, (p, t, c) => {
    // a readable telegraph: rear arm cocked far back, body coiled, weight on the back foot
    const k = smooth(clamp(t / 0.3, 0, 1)), tr = t > 0.3 ? Math.sin(t * 40) * 0.25 : 0;
    const coil = mk(GUARD, { hx: -1.6, hy: -20.8, cx: -1.4, cy: -33.8, kx: 0.2, ky: -39.2, tilt: 0.1,
      nhx: -7.4 + tr, nhy: -37.8, nex: -0.2, ney: -1, fhx: 8.4, fhy: -33.6, fh: 'open', rot: -0.95, nfx: -6, nfa: 0, ffx: 4.6, ffa: 0.35 });
    return lerpRig(GUARD, coil, k);
  });
  pose('grab', 0.4, (p, t, c) => {
    const reach = mk(GUARD, { hx: 2, hy: -21, cx: 6.4, cy: -32.4, kx: 8.4, ky: -37.4, tilt: 0.2, nfx: -6.4, nfa: 0.8, ffx: 6.4,
      nhx: 17, nhy: -31.4, nh: 'open', nex: 0, ney: 1, fhx: 18.2, fhy: -33.6, fh: 'open', fex: 0, fey: 1, rot: 0.1, wind: 0.6 });
    const open = mk(GUARD, { nhx: 6, nhy: -31, fhx: 8, fhy: -32, nh: 'open', fh: 'open', rot: -0.3 });
    return kf(p, [[0, open], [0.35, reach], [0.62, mk(reach, { nhx: 15.6, fhx: 16.6 })], [1, open]]);
  });
  pose('baton', 0.5, (p, t, c) => {
    // overhead swing: baton cocked behind the head, chopped down and forward
    const ready = mk(GUARD, { nhx: 6.6, nhy: -31.4, nh: 'fist', nex: -1, ney: 0.5, fhx: 7.4, fhy: -33.4, fh: 'open', prop: 'baton', rot: -0.3, pa: -1.1 });
    const cock = mk(ready, { nhx: -2.4, nhy: -43.4, nex: -1, ney: -0.4, cx: 0.6, kx: 2, rot: -0.7, pa: -2.5, nhh: 0.3 });
    const hit = mk(ready, { hx: 1.6, cx: 5.6, cy: -32.8, kx: 7.6, ky: -37.8, nhx: 16.4, nhy: -31.4, nex: 0, ney: 1, rot: 0.6, pa: 0.4, tilt: 0.2, ffx: 7, nfa: 0.7 });
    const thru = mk(hit, { nhx: 14, nhy: -26, pa: 0.95 });
    return kf(p, [[0, ready], [0.2, cock], [0.36, hit], [0.6, thru], [1, ready]]);
  });
  pose('shove', 0.4, (p, t, c) => {
    const load = mk(GUARD, { nhx: 5, nhy: -31.6, fhx: 6.2, fhy: -32.4, nh: 'open', fh: 'open', cx: 0.6, kx: 2.2, rot: -0.2 });
    const ext = mk(GUARD, { hx: 2, cx: 6, cy: -33.2, kx: 7.8, ky: -38.2, ffx: 8, nfa: 0.7, nhx: 16.6, nhy: -32, fhx: 17.6, fhy: -33.2,
      nh: 'open', fh: 'open', nex: 0, ney: 1, fex: 0, fey: 1, rot: 0, wind: 0.5 });
    return kf(p, [[0, GUARD], [0.15, load], [0.35, ext], [0.6, ext], [1, GUARD]]);
  });

  /* ════════════════════════════════════════════════════════════════════
     SOLVE: pose -> blended rig -> transforms (lean, squash, scaleX) -> IK joints
     ════════════════════════════════════════════════════════════════════ */
  const NO_OPTS = Object.freeze({});
  function ctxFor(N, opts) {
    const vx = opts.vx != null && Number.isFinite(+opts.vx) ? +opts.vx : null;
    let moving;
    if (opts.moving != null) moving = !!opts.moving;
    else if (vx != null) moving = Math.abs(vx) > 5;
    else moving = opts.speed != null && Math.abs(+opts.speed - 1) > 1e-6;   // combat sets speed != 1 only while moving
    return { boxer: N.boxer, heavy: N.heavy, kid: N.kid, old: N.old, slim: N.build === 'slim', sb: N.sb,
      speed: clamp(opts.speed != null ? +opts.speed || 1 : 1, 0.1, 4), vx, moving, opts };
  }
  function resolvePose(name) {
    if (POSES[name]) return name;
    warnOnce('pose:' + name, 'unknown pose "' + name + '"; drawing idle');
    return 'idle';
  }
  function rigAt(name, t, c, k) {
    const P = POSES[name];
    const tt = Math.max(0, +t || 0);
    const p = k != null && Number.isFinite(+k) ? clamp(+k, 0, 1) : P.dur > 0 ? clamp(tt / P.dur, 0, 1) : 0;
    return P.fn(p, tt, c);
  }
  function rotP(x, y, a) { const cs = Math.cos(a), sn = Math.sin(a); return { x: x * cs - y * sn, y: x * sn + y * cs }; }
  // Two-bone IK. Returns the middle joint and the (reach-clamped) end. The pole picks the bend side.
  function ik(ax, ay, bx, by, l1, l2, px, py) {
    let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
    if (d < 1e-4) { dx = 0; dy = 1; d = 1e-4; }
    const ux = dx / d, uy = dy / d;
    const dd = clamp(d, Math.abs(l1 - l2) + 0.05, l1 + l2 - 0.02);
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    let nx = -uy, ny = ux;
    if (nx * px + ny * py < 0) { nx = -nx; ny = -ny; }
    return { mx: ax + ux * a + nx * h, my: ay + uy * a + ny * h, ex: ax + ux * dd, ey: ay + uy * dd };
  }
  // Ankle above a foot ground point for a foot angle (+ heel raised, pivot at the ball; - toe raised, pivot at the heel).
  function footGeom(fx, fy, a, len) {
    const heel = -1.6, toe = len - 1.6, ball = toe - 1;
    const piv = a >= 0 ? ball : heel;
    const P = (x, y) => { const r = rotP(x - piv, y, a); return { x: fx + piv + r.x, y: fy + r.y }; };
    return { ankle: P(0, -2.1), heel: P(heel, 0), toe: P(toe, 0) };
  }

  function solve(poseName, t, N, opts, face) {
    const c = ctxFor(N, opts);
    const name = resolvePose(poseName);
    let rig = rigAt(name, t, c, opts.k);
    let mirror = !!POSES[name].mirror;
    const bf = opts.blendFrom;
    if (bf && bf.pose && +bf.k > 0) {
      const bn = resolvePose(bf.pose);
      // lying-in-bed is mirrored; blending across a mirror would swing the body through itself
      if (!!POSES[bn].mirror === mirror) rig = lerpRig(rig, rigAt(bn, bf.t, c, bf.k2), clamp(+bf.k, 0, 1));
    }
    const s = N.sb;
    const r = rig;
    // body points scale with the body; the head keeps its pixel size, so it rides on the chest
    let H = { x: r.hx * s, y: r.hy * s }, C = { x: r.cx * s, y: r.cy * s };
    let K = { x: C.x + (r.kx - r.cx), y: C.y + (r.ky - r.cy) };
    const hand = (x, y, hh) => {
      const p = { x: x * s, y: y * s };
      if (hh > 0) { p.x += (K.x - r.kx * s) * hh; p.y += (K.y - r.ky * s) * hh; }
      return p;
    };
    let hN = hand(r.nhx, r.nhy, r.nhh), hF = hand(r.fhx, r.fhy, r.fhh);
    let fN = { x: r.nfx * s, y: r.nfy * s }, fF = { x: r.ffx * s, y: r.ffy * s };
    // lean: shear the upper body about the hip (combat passes small values; + leans forward)
    const lean = clamp(+opts.lean || 0, -1, 1);
    if (lean) for (const P of [C, K, hN, hF]) P.x += lean * (H.y - P.y) * 0.55;
    // squash (+ squashed, - stretched) and horizontal stretch, about the feet centre
    const sq = clamp(+opts.squash || 0, -1, 1), sx = (opts.scaleX != null ? clamp(+opts.scaleX || 1, 0.5, 2) : 1) * (1 + 0.16 * sq), sy = 1 - 0.2 * sq;
    if (sx !== 1 || sy !== 1) for (const P of [H, C, K, hN, hF, fN, fF]) { P.x *= sx; P.y *= sy; }
    if (sy !== 1) { K.y = C.y + (r.ky - r.cy); }
    const B = N.B;
    const spread = 2.2 * (B.chest / 8);
    const sN = { x: C.x + r.rot * spread, y: C.y + 0.7 - r.sh }, sF = { x: C.x - r.rot * spread + 0.3, y: C.y + 0.2 - r.sh };
    const up1 = 8 * s, fo1 = 7.6 * s, th1 = 10.6 * s, sh1 = 10.4 * s;
    const eN = ik(sN.x, sN.y, hN.x, hN.y, up1, fo1 * clamp(r.nfs, 0.2, 1), r.nex, r.ney);
    const eF = ik(sF.x, sF.y, hF.x, hF.y, up1, fo1 * clamp(r.ffs, 0.2, 1), r.fex, r.fey);
    const flen = N.kid ? 4 : 5;
    const gN = footGeom(fN.x, fN.y, r.nfa, flen), gF = footGeom(fF.x, fF.y, r.ffa, flen);
    const kN = ik(H.x - 0.4, H.y, gN.ankle.x, gN.ankle.y, th1, sh1, r.nkx, r.nky), kF = ik(H.x + 0.4, H.y, gF.ankle.x, gF.ankle.y, th1, sh1, r.fkx, r.fky);
    // a foot that cannot reach its target hangs where the leg ends
    const reFoot = (g, k) => {
      const dx = k.ex - g.ankle.x, dy = k.ey - g.ankle.y;
      if (Math.abs(dx) + Math.abs(dy) < 0.05) return g;
      return { ankle: { x: k.ex, y: k.ey }, heel: { x: g.heel.x + dx, y: g.heel.y + dy }, toe: { x: g.toe.x + dx, y: g.toe.y + dy } };
    };
    const torsoA = Math.atan2(C.x - H.x, -(C.y - H.y));
    const w = clamp((Math.abs(torsoA) - 0.45) / 0.8, 0, 1);
    let theta = r.tilt + torsoA * lerp(0.3, 1, w);
    const qs = Math.PI / 8;          // quantised so heads do not shimmer between rotations
    theta = Math.abs(theta) < 0.2 ? 0 : Math.round(theta / qs) * qs;
    const dl = Math.hypot(C.x - H.x, C.y - H.y) || 1;
    const u = { x: (C.x - H.x) / dl, y: (C.y - H.y) / dl }, n = { x: -u.y, y: u.x };
    return {
      name, rig: r, mirror, s, H, C, K, u, n, theta, sN, sF,
      eN: { x: eN.mx, y: eN.my }, eF: { x: eF.mx, y: eF.my }, hN: { x: eN.ex, y: eN.ey }, hF: { x: eF.ex, y: eF.ey },
      kN: { x: kN.mx, y: kN.my }, kF: { x: kF.mx, y: kF.my }, gN: reFoot(gN, kN), gF: reFoot(gF, kF),
      rot: r.rot, wind: clamp(r.wind + lean * 2.5, -1, 1), nh: r.nh, fh: r.fh, prop: r.prop, pa: r.pa, pb: r.pb, t: +t || 0,
      face, opts, N, c,
    };
  }

  /* ════════════════════════════════════════════════════════════════════
     RASTER — everything below draws into the offscreen buffer, facing right.
     Buffer pixel (OX, OY) is the feet centre; rows OY-1, OY-2 hold the soles.
     ════════════════════════════════════════════════════════════════════ */
  const BW = 176, BH = 120, OX = 88, OY = 98;
  let buf = null, bx = null, sil = null, sx2 = null, curFill = null;
  function ensureBuf() {
    if (buf) return true;
    if (typeof document === 'undefined' || !document.createElement) return false;
    buf = document.createElement('canvas'); buf.width = BW; buf.height = BH;
    bx = buf.getContext('2d');
    sil = document.createElement('canvas'); sil.width = BW; sil.height = BH;
    sx2 = sil.getContext('2d');
    return !!bx;
  }
  function fill(c) { if (c !== curFill) { bx.fillStyle = c; curFill = c; } }
  function R(x, y, w, h, c) { fill(c); bx.fillRect(x, y, w, h); }
  // A w x w square centred on a rig-space point.
  function stamp(x, y, w, c) { fill(c); bx.fillRect(Math.round(OX + x - w / 2), Math.round(OY + y - w / 2), w, w); }
  function dot(x, y, c) { fill(c); bx.fillRect(Math.floor(OX + x), Math.floor(OY + y), 1, 1); }
  function line(ax, ay, bx2, by, w, c) {
    const d = Math.hypot(bx2 - ax, by - ay), n = Math.max(1, Math.ceil(d / 0.85));
    fill(c);
    for (let i = 0; i <= n; i++) { const k = i / n; bx.fillRect(Math.round(OX + ax + (bx2 - ax) * k - w / 2), Math.round(OY + ay + (by - ay) * k - w / 2), w, w); }
  }
  // A limb: dark stamps, then base stamps one pixel smaller pushed to the lit (upper-front) side,
  // so a one-pixel shadow edge runs along the back/bottom.
  function limb(ax, ay, bx2, by, w, base, dark) {
    const d = Math.hypot(bx2 - ax, by - ay), n = Math.max(1, Math.ceil(d / 0.85));
    if (w <= 1) { line(ax, ay, bx2, by, 1, base); return; }
    fill(dark);
    for (let i = 0; i <= n; i++) { const k = i / n; bx.fillRect(Math.round(OX + ax + (bx2 - ax) * k - w / 2), Math.round(OY + ay + (by - ay) * k - w / 2), w, w); }
    fill(base);
    for (let i = 0; i <= n; i++) { const k = i / n; bx.fillRect(Math.round(OX + ax + (bx2 - ax) * k - w / 2) + 1, Math.round(OY + ay + (by - ay) * k - w / 2), w - 1, w - 1); }
  }
  // Scanline polygon fill (pixel-crisp). edge: colour for the leftmost pixel of each row (back rim).
  function poly(pts, base, edge, topCol) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const ya = Math.floor(OY + y0), yb = Math.ceil(OY + y1);
    let first = true;
    for (let py = ya; py <= yb; py++) {
      const sy = py + 0.5 - OY, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a.y <= sy && b.y > sy) || (b.y <= sy && a.y > sy)) xs.push(a.x + ((sy - a.y) / (b.y - a.y)) * (b.x - a.x));
      }
      if (xs.length < 2) continue;
      xs.sort((m, q) => m - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const xa = Math.round(OX + xs[i]), xb = Math.round(OX + xs[i + 1]) - 1;
        if (xb < xa) continue;
        R(xa, py, xb - xa + 1, 1, first && topCol ? topCol : base);
        if (edge) R(xa, py, 1, 1, edge);
      }
      first = false;
    }
  }
  const add = (P, v, k) => ({ x: P.x + v.x * k, y: P.y + v.y * k });
  const comb = (P, u, ku, n, kn) => ({ x: P.x + u.x * ku + n.x * kn, y: P.y + u.y * ku + n.y * kn });
  const pick = (rmp, near) => (near ? { b: rmp.b, d: rmp.d, l: rmp.l } : { b: rmp.f, d: rmp.fd, l: rmp.fl });

  /* ── Limbs ────────────────────────────────────────────────────────── */
  function drawHand(J, near, H, dir, shape) {
    const N = J.N, ex = N.ex;
    const sk = pick(N.skin, near);
    if (shape === 'hidden' || shape === 'pocket') return;
    if (ex.gloves && shape !== 'open' && shape !== 'point') {
      const gc = ramp(typeof ex.gloves === 'string' ? ex.gloves : '#a8342a'), g = pick(gc, near), sz = N.kid ? 3 : 4;
      const cx = H.x + dir.x * 0.9, cy = H.y + dir.y * 0.9;
      const x0 = Math.round(OX + cx - sz / 2), y0 = Math.round(OY + cy - sz / 2);
      R(x0, y0, sz, sz, g.b);
      R(x0, y0 + sz - 1, sz, 1, g.d); R(x0, y0, 1, sz, g.d);
      R(x0 + 1, y0, sz - 2, 1, g.l);
      R(x0, y0, 1, 1, g.d);
      // cuff on the wrist side
      const cf = near ? '#e2dacb' : '#9e978a';
      dot(H.x - dir.x * 1.6 - 0.5, H.y - dir.y * 1.6 - 0.5, cf);
      return;
    }
    if (shape === 'open') {
      stamp(H.x, H.y, 2, sk.b);
      dot(H.x + dir.x * 1.7 - 0.5, H.y + dir.y * 1.7 - 0.5, sk.b);
      dot(H.x - 0.5 + dir.x * 0.6, H.y + 0.5 + dir.y * 0.6, sk.d);
      return;
    }
    if (shape === 'point') {
      stamp(H.x, H.y, 2, sk.b);
      line(H.x + dir.x * 1.4, H.y + dir.y * 1.4, H.x + dir.x * 3.2, H.y + dir.y * 3.2, 1, sk.b);
      return;
    }
    const big = shape !== 'relax' && N.B.fist >= 3, sz = big ? 3 : 2;
    const cx = H.x + dir.x * 0.5, cy = H.y + dir.y * 0.5;
    const x0 = Math.round(OX + cx - sz / 2), y0 = Math.round(OY + cy - sz / 2);
    const fc = ex.wraps ? pick(ramp('#ddd4c2'), near) : sk;
    R(x0, y0, sz, sz, fc.b);
    R(x0, y0 + sz - 1, sz, 1, fc.d);
    if (big) R(x0 + sz - 1, y0, 1, 1, ex.wraps ? sk.b : fc.l);
    if (ex.knuckles && shape === 'fist') {
      const kx = dir.x >= 0 ? x0 + sz - 1 : x0;
      R(kx, y0, 1, Math.min(2, sz), near ? '#d4bd7c' : '#8f815a');
      if (near) R(kx, y0, 1, 1, '#f0e2a8');
    }
  }
  function drawArm(J, near) {
    const N = J.N, B = N.B, T = N.top.T;
    const S0 = near ? J.sN : J.sF, E = near ? J.eN : J.eF, Hd = near ? J.hN : J.hF, shape = near ? J.nh : J.fh;
    const sk = pick(N.skin, near), tp = pick(N.top.r, near);
    const t2 = N.top.r2 ? pick(N.top.r2, near) : null;
    let dl = Math.hypot(Hd.x - E.x, Hd.y - E.y) || 1;
    const dir = { x: (Hd.x - E.x) / dl, y: (Hd.y - E.y) / dl };
    // the forearm stops short of the hand so the fist reads as a separate cluster
    const pocket = shape === 'pocket';
    const W = pocket ? { x: Hd.x - dir.x * 1.6, y: Hd.y - dir.y * 1.6 } : { x: Hd.x - dir.x * 1.1, y: Hd.y - dir.y * 1.1 };
    let sleeve = T.sleeve, sc = tp;
    if (sleeve === 'none2') { if (t2) { sleeve = 'long'; sc = t2; } else sleeve = 'none'; }
    if (sleeve === 'short2') { sc = t2 || tp; sleeve = 'short'; }
    const uw = B.upper, fw = B.fore + (sleeve === 'wide' ? 1 : 0);
    // upper arm (with a deltoid cap on built frames)
    if (sleeve === 'none') limb(S0.x, S0.y, E.x, E.y, uw, sk.b, sk.d);
    else if (sleeve === 'short') {
      limb(S0.x, S0.y, E.x, E.y, uw, sk.b, sk.d);
      const m = { x: S0.x + (E.x - S0.x) * 0.62, y: S0.y + (E.y - S0.y) * 0.62 };
      limb(S0.x, S0.y, m.x, m.y, uw, sc.b, sc.d);
    } else limb(S0.x, S0.y, E.x, E.y, uw, sc.b, sc.d);
    if (B.delt) {
      // shoulder and upper-arm mass: a thicker first half of the upper arm, capped at the shoulder
      const m = { x: S0.x + (E.x - S0.x) * 0.5, y: S0.y + (E.y - S0.y) * 0.5 };
      const mc = sleeve === 'none' ? sk : sc;
      limb(S0.x, S0.y + 0.3, m.x, m.y, uw + 1, mc.b, mc.d);
      if (B.delt > 1) stamp(S0.x - 0.4, S0.y + 0.2, uw + 1, mc.b);
    }
    // forearm
    if (sleeve === 'long' || sleeve === 'wide') {
      limb(E.x, E.y, W.x, W.y, fw, sc.b, sc.d);
      if (T.band || sleeve === 'wide' || T.stripe) stamp(W.x, W.y, fw, sc.d);   // cuff
    } else limb(E.x, E.y, W.x, W.y, fw, sk.b, sk.d);
    // track-top sleeve stripe: a thin off-white line down the outside of the arm
    if (T.stripe && t2 && (sleeve === 'long')) {
      const sCol = near ? mix(t2.b, sc.b, 0.3) : mix(t2.b, sc.b, 0.62);
      const off = (P, Q) => { const dx = Q.x - P.x, dy = Q.y - P.y, l = Math.hypot(dx, dy) || 1; return { x: -dy / l * 0.45, y: dx / l * 0.45 }; };
      const o1 = off(S0, E), o2 = off(E, W);
      const sgn = (o) => (o.y > 0 ? -1 : 1);     // keep the stripe on the upper side of the limb
      line(S0.x + o1.x * sgn(o1), S0.y + 0.6 + o1.y * sgn(o1), E.x + o1.x * sgn(o1), E.y + o1.y * sgn(o1), 1, sCol);
      line(E.x + o2.x * sgn(o2), E.y + o2.y * sgn(o2), W.x - dir.x * 0.8 + o2.x * sgn(o2), W.y - dir.y * 0.8 + o2.y * sgn(o2), 1, sCol);
    }
    if (N.ex.watch && !near && sleeve !== 'long') stamp(W.x, W.y, fw, '#2a2a30');
    if (J.prop === 'baton' && near) drawBaton(J, Hd, E);
    drawHand(J, near, Hd, dir, shape);
  }
  function drawLeg(J, near) {
    const N = J.N, B = N.B, Bt = N.bottom.Bt;
    const Hp = { x: J.H.x + (near ? -0.4 : 0.4), y: J.H.y }, Kn = near ? J.kN : J.kF, g = near ? J.gN : J.gF;
    const sk = pick(N.skin, near), bt = pick(N.bottom.r, near);
    const tw = B.thigh + (Bt.wide ? 1 : 0), sw = B.shin + (Bt.baggy ? 1 : 0);
    const A = g.ankle;
    if (Bt.legs === 'full') {
      limb(Hp.x, Hp.y, Kn.x, Kn.y, tw, bt.b, bt.d);
      limb(Kn.x, Kn.y, A.x, A.y - 0.3, sw, bt.b, bt.d);
      if (Bt.cuff) stamp(A.x, A.y - 0.6, sw, bt.d);
      if (near && Bt.seam) dot(Kn.x + 0.6, Kn.y - 0.5, bt.l);
      if (near && Bt.crease) line(Kn.x + 0.8, Kn.y + 1, A.x + 0.8, A.y - 1.5, 1, mix(bt.b, bt.l, 0.6));
    } else {
      limb(Hp.x, Hp.y, Kn.x, Kn.y, B.thigh, sk.b, sk.d);
      limb(Kn.x, Kn.y, A.x, A.y - 0.3, B.shin, sk.b, sk.d);
      if (Bt.legs === 'shorts') {
        const m = { x: Hp.x + (Kn.x - Hp.x) * Bt.len, y: Hp.y + (Kn.y - Hp.y) * Bt.len };
        limb(Hp.x, Hp.y, m.x, m.y, tw, bt.b, bt.d);
      }
    }
    drawShoe(J, near, g);
  }
  function drawShoe(J, near, g) {
    const N = J.N, sh = N.shoes;
    const base = near ? sh.b : sh.f, sole = near ? sh.sole : mix(sh.sole, FAR, 0.3);
    const h = g.heel, t = g.toe;
    const dx = t.x - h.x, dy = t.y - h.y, l = Math.hypot(dx, dy) || 1;
    const nx = dy / l, ny = -dx / l;      // "up" from the sole
    // upper (2 rows) then the sole line and a toe highlight
    line(h.x + 0.5 + nx * 1.1, h.y + ny * 1.1 - 0.0, t.x - 0.5 + nx * 1.1, t.y + ny * 1.1, 2, base);
    line(h.x + 0.5 + nx * 0.5, h.y + ny * 0.5, t.x - 0.5 + nx * 0.5, t.y + ny * 0.5, 1, sole);
    if (near) dot(t.x - 1.2 + nx * 1.6, t.y + ny * 1.6, sh.l);
  }

  /* ── Body ─────────────────────────────────────────────────────────── */
  function drawPelvis(J) {
    const N = J.N, u = J.u, n = J.n, H = J.H, hw = N.B.hipW / 2;
    const bt = N.bottom.Bt.legs === 'bare' ? N.skin : N.bottom.r;
    const bc = N.bottom.Bt.skirt ? N.bottom.r : bt;
    poly([comb(H, u, -2.6, n, -hw), comb(H, u, -2.6, n, hw), comb(H, u, 2.8, n, hw * 0.95), comb(H, u, 2.8, n, -hw)], bc.b, bc.d);
    if (N.bottom.Bt.band) line(H.x - n.x * hw + u.x * 2.2, H.y - n.y * hw + u.y * 2.2, H.x + n.x * hw + u.x * 2.2, H.y + n.y * hw + u.y * 2.2, 1, N.bottom.r.l);
  }
  // Skirt or long coat tail: from the hips to a hem extrapolated along both thighs (follows the legs).
  function drawSkirt(J, rmp, K, flare) {
    const N = J.N, u = J.u, n = J.n, H = J.H, hw = N.B.hipW / 2 + 0.6;
    const a = { x: H.x + (J.kN.x - H.x) * K, y: H.y + (J.kN.y - H.y) * K }, b = { x: H.x + (J.kF.x - H.x) * K, y: H.y + (J.kF.y - H.y) * K };
    const pa = (a.x - H.x) * n.x + (a.y - H.y) * n.y, pb = (b.x - H.x) * n.x + (b.y - H.y) * n.y;
    const front = pa > pb ? a : b, back = pa > pb ? b : a;
    const wind = J.wind;
    const bk = add(add(back, n, -(flare + 0.6) - Math.max(0, wind) * 2), u, Math.max(0, wind) * 0.8);
    const fr = add(front, n, flare + 0.3);
    poly([comb(H, u, 2.6, n, -hw), comb(H, u, 2.6, n, hw), fr, bk], rmp.b, rmp.d);
    line(bk.x, bk.y - 0.5, fr.x, fr.y - 0.5, 1, rmp.d);
  }
  function torsoShape(J) {
    const N = J.N, B = N.B, T = N.top.T, u = J.u, n = J.n, H = J.H, C = J.C;
    const vis = 1 + 0.3 * Math.abs(J.rot);
    const cf = (B.chest / 2) * vis + 0.4, cb = (B.chest / 2) * vis - 0.4;
    const wv = (B.waist / 2) * (1 + 0.12 * Math.abs(J.rot)), hw = B.hipW / 2;
    const hem = Math.min(T.hem, N.top.long ? 2.5 : T.hem) * J.s;
    const W = { x: H.x + (C.x - H.x) * 0.42, y: H.y + (C.y - H.y) * 0.42 };
    const sh = J.rig.sh || 0;
    const pts = [
      comb(H, u, -hem, n, -hw),
      comb(W, u, 0, n, -wv),
      comb(C, u, -1.6, n, -cb),
      comb(C, u, 1.6 + sh, n, -cb + 1.6),
      comb(C, u, 1.6 + sh, n, cf - 2.2),
      comb(C, u, -2, n, cf),
      comb(W, u, 0, n, wv + B.belly),
      comb(H, u, -hem, n, hw + B.belly * 0.6),
    ];
    return { pts, cf, cb, wv, hw, hem, W };
  }
  function drawTorso(J) {
    const N = J.N, T = N.top.T, u = J.u, n = J.n, H = J.H, C = J.C;
    const shp = torsoShape(J), pts = shp.pts;
    const tr = N.top.bare ? N.skin : N.top.r, t2 = N.top.r2;
    if (T.bib) {
      // overalls: the shirt underneath, then the bib and straps over it
      const sh = t2 || ramp('#c8c0b0');
      poly(pts, sh.b, sh.d);
      const bib = [comb(H, u, -shp.hem, n, -shp.hw), comb(H, u, -shp.hem, n, shp.hw), comb(C, u, -3.4, n, shp.cf - 0.5), comb(C, u, -3.4, n, -0.5)];
      poly(bib, N.top.r.b, N.top.r.d);
      line(C.x - n.x * 1 + u.x * 1, C.y - n.y * 1 + u.y * 1, C.x + n.x * (shp.cf - 1) - u.x * 3.4, C.y + n.y * (shp.cf - 1) - u.y * 3.4, 1, N.top.r.b);
      return shp;
    }
    poly(pts, tr.b, tr.d, tr.l);
    if (N.top.bare) {
      // pectoral and lat shadow lines carry the build without an outline
      line(C.x + n.x * (shp.cf - 0.8) - u.x * 4, C.y + n.y * (shp.cf - 0.8) - u.y * 4, C.x + n.x * (shp.cf - 3) - u.x * 4.4, C.y + n.y * (shp.cf - 3) - u.y * 4.4, 1, N.skin.s);
      dot(shp.W.x + n.x * 0.5, shp.W.y + n.y * 0.5, N.skin.s);
      return shp;
    }
    // hem / waistband
    if (T.band) line(pts[0].x, pts[0].y - 0.5, pts[7].x, pts[7].y - 0.5, 1, tr.d);
    // a fold at the waist on the back
    dot(shp.W.x - n.x * (shp.wv - 1.2), shp.W.y - n.y * (shp.wv - 1.2) + 0.5, tr.d);
    if (T.zip) {
      // track-top zip: a light line near the front edge, further in as the chest turns to the camera
      const inset = 1.2 + Math.max(0, -J.rot) * 1.8;
      if (J.rot < 0.45) line(C.x + n.x * (shp.cf - inset) - u.x * 2, C.y + n.y * (shp.cf - inset) - u.y * 2,
        H.x + n.x * (shp.hw - inset + 0.3) - u.x * shp.hem * 0.6, H.y + n.y * (shp.hw - inset + 0.3) - u.y * shp.hem * 0.6, 1, mix(tr.b, '#e8e2d4', 0.28));
    }
    if (T.open && t2) {
      if (J.rot < 0.3) line(C.x + n.x * (shp.cf - 1.4) - u.x * 1.6, C.y + n.y * (shp.cf - 1.4) - u.y * 1.6, shp.W.x + n.x * (shp.wv + 0.2), shp.W.y + n.y * (shp.wv + 0.2), 1, t2.b);
    }
    if (T.vee && t2) poly([comb(C, u, 1.2, n, shp.cf - 2.2), comb(C, u, 1.2, n, shp.cf - 0.2), comb(C, u, -4.6, n, shp.cf - 0.4)], t2.b, null);
    if (T.collar === 'vneck') poly([comb(C, u, 1.4, n, shp.cf - 2), comb(C, u, 1.4, n, shp.cf - 0.4), comb(C, u, -2.4, n, shp.cf - 0.4)], N.skin.s, null);
    if (T.buttons && !T.vee) for (let k = 0.2; k < 0.95; k += 0.28) dot(C.x + (H.x - C.x) * k + n.x * (shp.cf - 1.2) - 0.5, C.y + (H.y - C.y) * k + n.y * (shp.cf - 1.2), t2 ? t2.d : tr.d);
    if (T.pocket) line(H.x + n.x * 0.5 + u.x * 2.6, H.y + n.y * 0.5 + u.y * 2.6, H.x + n.x * (shp.hw - 0.4) + u.x * 3.4, H.y + n.y * (shp.hw - 0.4) + u.y * 3.4, 1, tr.d);
    if (T.sheen) line(C.x + n.x * 0.5 - u.x * 2.5, C.y + n.y * 0.5 - u.y * 2.5, C.x + n.x * 2 - u.x * 5.5, C.y + n.y * 2 - u.y * 5.5, 1, tr.l);
    if (T.dots && t2) for (let k = 0.15; k < 0.95; k += 0.3) for (let m = -1; m <= 1; m += 2) dot(C.x + (H.x - C.x) * k + n.x * m * 1.5, C.y + (H.y - C.y) * k + n.y * m * 1.5, t2.b);
    if (T.patch && t2) { stamp(C.x + n.x * (shp.cf - 2) - u.x * 3, C.y + n.y * (shp.cf - 2) - u.y * 3, 2, t2.b); }
    if (T.belt || T.belt2) {
      const by = T.belt2 ? 0.42 : 0.04, P = { x: H.x + (C.x - H.x) * by, y: H.y + (C.y - H.y) * by };
      line(P.x - n.x * shp.wv, P.y - n.y * shp.wv, P.x + n.x * (shp.wv + 0.4), P.y + n.y * (shp.wv + 0.4), 1, T.belt2 ? tr.d : '#2a2420');
    }
    return shp;
  }
  function drawTorsoExtras(J, shp) {
    const N = J.N, ex = N.ex, u = J.u, n = J.n, C = J.C, H = J.H;
    if (ex.apron) {
      const ac = ramp(typeof ex.apron === 'string' ? ex.apron : '#d8d0bc');
      const kAvg = { x: (J.kN.x + J.kF.x) / 2, y: (J.kN.y + J.kF.y) / 2 };
      const bot = { x: H.x + (kAvg.x - H.x) * 0.9, y: H.y + (kAvg.y - H.y) * 0.9 };
      poly([comb(C, u, -2.6, n, 0.6), comb(C, u, -2.6, n, shp.cf + 0.3), comb(bot, u, 0, n, shp.hw + 1.4), comb(bot, u, 0, n, 0)], ac.b, null);
      line(C.x + n.x * 0.6 - u.x * 2.6, C.y + n.y * 0.6 - u.y * 2.6, C.x - n.x * 1.5 + u.x * 1.2, C.y - n.y * 1.5 + u.y * 1.2, 1, ac.d);
    }
    if (ex.tie && N.top.T.collar !== 'raised') {
      const tc = typeof ex.tie === 'string' ? ex.tie : '#6a2a2a';
      line(C.x + n.x * (shp.cf - 1) + u.x * 0.6, C.y + n.y * (shp.cf - 1) + u.y * 0.6, C.x + n.x * (shp.cf - 0.6) - u.x * 8.5, C.y + n.y * (shp.cf - 0.6) - u.y * 8.5, 1, tc);
    }
    if (ex.lanyard) {
      line(C.x - n.x * 1 + u.x * 1, C.y - n.y * 1 + u.y * 1, C.x + n.x * (shp.cf - 1.5) - u.x * 5.4, C.y + n.y * (shp.cf - 1.5) - u.y * 5.4, 1, '#2f4a6a');
      R(Math.round(OX + C.x + n.x * (shp.cf - 2.2) - u.x * 6.4), Math.round(OY + C.y + n.y * (shp.cf - 2.2) - u.y * 6.4), 2, 3, '#e6e0d2');
    }
    if (ex.badge) { const P = comb(C, u, -3, n, shp.cf - 1.8); R(Math.round(OX + P.x - 1), Math.round(OY + P.y - 1), 2, 2, '#c9a64a'); dot(P.x - 1, P.y - 1, '#f0d890'); }
    if (ex.bag) {
      const bc = ramp(typeof ex.bag === 'string' ? ex.bag : '#6a4a32');
      line(J.sN.x, J.sN.y - 0.5, H.x - n.x * (shp.hw - 0.5), H.y - n.y * (shp.hw - 0.5), 1, bc.d);
      const P = comb(H, u, 0.5, n, -shp.hw - 1.6);
      poly([comb(P, u, 2.6, n, -2.6), comb(P, u, 2.6, n, 2.4), comb(P, u, -2.6, n, 2.4), comb(P, u, -2.6, n, -2.6)], bc.b, bc.d, bc.l);
    }
  }
  function drawNeckHead(J) {
    const N = J.N, u = J.u, n = J.n, C = J.C, th = J.theta;
    const KX = Math.round(OX + J.K.x), KY = Math.round(OY + J.K.y);
    const cs = Math.cos(th), sn = Math.sin(th);
    const hp = (gx, gy) => ({ x: KX + 0.5 - OX + (gx - 4.5) * cs - (gy - 6.5) * sn, y: KY + 0.5 - OY + (gx - 4.5) * sn + (gy - 6.5) * cs });
    // neck in the shadow of the jaw
    const nk = hp(4, 9);
    line(C.x + u.x * 0.8, C.y + u.y * 0.8, nk.x, nk.y, N.kid || N.build === 'slim' ? 2 : 3, N.skin.s);
    // hair hanging behind the shoulders
    const tail = (HAIR[N.hair.style] || {}).tail;
    if (tail) {
      const hc = N.hair.r, w = clamp(J.wind, -1, 1);
      if (tail === 'long') { const a = hp(2, 7), b = comb(C, u, -2.5, n, -(N.B.chest / 2) + 0.6 - Math.max(0, w)); line(a.x, a.y, b.x, b.y, 3, hc.d); line(a.x + 0.6, a.y, b.x + 0.6, b.y - 1, 2, hc.b); }
      if (tail === 'pony') { const a = hp(0.5, 3.6), b = { x: a.x - 1.6 - w * 2.6, y: a.y + 6.4 - Math.max(0, w) * 2.4 }; line(a.x, a.y, b.x, b.y, 2, hc.b); dot(b.x, b.y, hc.d); }
      if (tail === 'braids') { for (const o of [0.5, 2.2]) { const a = hp(o, 7.4), b = { x: a.x - 0.6 - w * 1.6, y: a.y + 7 }; line(a.x, a.y, b.x, b.y, 1, hc.d); } }
    }
    const spr = headSprite(N, J.wind, !!N.ex.scar && J.face > 0 && !J.mirror, th);
    bx.drawImage(spr, KX - HS, KY - HS);
    return hp;
  }
  // Heads are cached as small sprites per look, wind state, scar flag and (quantised) rotation;
  // a rotated head is inverse-sampled from the grid so it never gets holes.
  const HS = 9;
  function headSprite(N, wind, scar, th) {
    const g = headGrid(N, wind, scar);
    const key = (wind > 0.35 ? 'r' : wind < -0.35 ? 'f' : '0') + (scar ? 's' : '') + th.toFixed(3);
    N.sprites = N.sprites || new Map();
    let cv = N.sprites.get(key);
    if (cv) return cv;
    if (N.sprites.size > 96) N.sprites.clear();
    cv = document.createElement('canvas'); cv.width = cv.height = HS * 2 + 1;
    const x = cv.getContext('2d');
    const cs = Math.cos(th), sn = Math.sin(th);
    for (let dy = -HS; dy <= HS; dy++) for (let dx = -HS; dx <= HS; dx++) {
      let c, r;
      if (th === 0) { c = dx + 4; r = dy + 6; }
      else { c = Math.floor(dx * cs + dy * sn + 4.5); r = Math.floor(-dx * sn + dy * cs + 6.5); }
      if (c < 0 || r < 0 || c >= GW || r >= GH) continue;
      const col = g[r * GW + c];
      if (col) { x.fillStyle = col; x.fillRect(HS + dx, HS + dy, 1, 1); }
    }
    N.sprites.set(key, cv);
    return cv;
  }
  function drawCollar(J, hp) {
    const N = J.N, T = N.top.T, u = J.u, n = J.n, C = J.C, tr = N.top.r;
    if (N.top.bare) return;
    if (T.collar === 'raised') {
      // slightly raised track-top collar: hides the neck, stops below the jaw line
      poly([comb(C, u, 0.2, n, -2.7), comb(C, u, 0.2, n, 1.9), comb(C, u, 2.9, n, 1.1), comb(C, u, 3.7, n, -2.3)], tr.b, tr.d, tr.l);
      dot(C.x + n.x * 0.9 + u.x * 2.4, C.y + n.y * 0.9 + u.y * 2.4, mix(tr.b, '#e8e2d4', 0.25));
    } else if (T.collar === 'hood') {
      poly([comb(C, u, 0, n, -4.2), comb(C, u, 0.2, n, -0.8), comb(C, u, 3.4, n, -1.6), comb(C, u, 2.6, n, -4)], tr.d, tr.dd);
    } else if (T.collar === 'shirt' || T.collar === 'lapel') {
      const cc = T.collar === 'lapel' ? tr.l : (N.top.r2 ? N.top.r2.b : tr.l);
      line(C.x + n.x * 0.4 + u.x * 1.6, C.y + n.y * 0.4 + u.y * 1.6, C.x + n.x * 1.8 + u.x * 0.6, C.y + n.y * 1.8 + u.y * 0.6, 1, cc);
      dot(C.x - n.x * 1.6 + u.x * 1.8, C.y - n.y * 1.6 + u.y * 1.8, tr.d);
    }
    if (N.ex.scarf) {
      const sc = ramp(typeof N.ex.scarf === 'string' ? N.ex.scarf : '#8a3a32');
      poly([comb(C, u, 0, n, -2.8), comb(C, u, 0, n, 2), comb(C, u, 2.8, n, 1.4), comb(C, u, 3.2, n, -2.4)], sc.b, sc.d, sc.l);
      const w = J.wind;
      const a = comb(C, u, 0.5, n, w > 0.3 ? -2.6 : 1.4);
      const b = w > 0.3 ? comb(C, u, 1.6, n, -8.5) : comb(C, u, -6.5, n, 2.2);
      line(a.x, a.y, b.x, b.y, 2, sc.d);
    }
  }

  /* ── Props ────────────────────────────────────────────────────────── */
  function carryKind(k) {
    const s = String(k || 'box').toLowerCase();
    if (/crate|milk/.test(s)) return 'crate';
    if (/grocer|sack|paper bag|bag of/.test(s)) return 'sack';
    if (/tool/.test(s)) return 'toolbox';
    if (/bucket|paint/.test(s)) return 'bucket';
    if (/file|record|paper|ledger|document/.test(s)) return 'files';
    if (/tray|dish|plate|pot|soup/.test(s)) return 'tray';
    if (/bag|duffel/.test(s)) return 'duffel';
    if (/tire|wheel/.test(s)) return 'tire';
    return 'box';
  }
  function drawCarry(J) {
    const kind = carryKind(J.opts.carry);
    const m = { x: (J.hN.x + J.hF.x) / 2 + 0.6, y: Math.min(J.hN.y, J.hF.y) };
    const X = (dx) => Math.round(OX + m.x + dx), Y = (dy) => Math.round(OY + m.y + dy);
    switch (kind) {
      case 'crate': R(X(-6), Y(-8), 12, 9, '#6a5136'); for (let i = 0; i < 3; i++) R(X(-6), Y(-8 + i * 3), 12, 1, '#8a6c4a'); R(X(-6), Y(-8), 1, 9, '#4a3826'); break;
      case 'sack': R(X(-4), Y(-10), 8, 11, '#b08c62'); R(X(-4), Y(-10), 8, 1, '#c8a676'); R(X(-3), Y(-12), 2, 2, '#5f7a44'); R(X(0), Y(-13), 2, 3, '#c8b878'); R(X(-4), Y(-10), 1, 11, '#8e6e4a'); break;
      case 'toolbox': R(X(-6), Y(-5), 12, 6, '#8e3a2e'); R(X(-6), Y(-5), 12, 1, '#b05a46'); R(X(-2), Y(-7), 4, 1, '#3a3a40'); R(X(-6), Y(0), 12, 1, '#5e241c'); break;
      case 'bucket': R(X(-3), Y(-7), 7, 8, '#7d8a8c'); R(X(-3), Y(-7), 7, 1, '#a9b4b4'); R(X(-3), Y(-7), 1, 8, '#5d686a'); break;
      case 'files': R(X(-6), Y(-7), 12, 8, '#cdbf9e'); R(X(-6), Y(-7), 12, 2, '#b8a986'); R(X(-1), Y(-4), 3, 2, '#e6dfcb'); R(X(-6), Y(-7), 1, 8, '#a8996e'); break;
      case 'tray': R(X(-7), Y(-1), 14, 2, '#7a7f84'); R(X(-5), Y(-4), 3, 3, '#e6e0d2'); R(X(1), Y(-3), 3, 2, '#c9a463'); break;
      case 'duffel': R(X(-7), Y(-5), 14, 6, '#3d4a3a'); R(X(-7), Y(-5), 14, 1, '#56654f'); R(X(-2), Y(-7), 4, 2, '#2a3328'); break;
      case 'tire': R(X(-5), Y(-9), 10, 10, '#1f1f22'); R(X(-3), Y(-7), 6, 6, '#2c2c30'); R(X(-1), Y(-5), 2, 2, '#5a5a60'); break;
      default: R(X(-6), Y(-8), 12, 9, '#9c764c'); R(X(-6), Y(-8), 12, 1, '#b89068'); R(X(-1), Y(-8), 2, 9, '#c4a47a'); R(X(-6), Y(-8), 1, 9, '#76583a'); R(X(-6), Y(0), 12, 1, '#6a4e34');
    }
  }
  function drawBaton(J, Hd, E) {
    const ang = Math.atan2(Hd.y - E.y, Hd.x - E.x) + (J.pa || 0) * 0.35;
    const d = { x: Math.cos(ang), y: Math.sin(ang) };
    line(Hd.x - d.x * 1.5, Hd.y - d.y * 1.5, Hd.x + d.x * 9.5, Hd.y + d.y * 9.5, 2, '#1d1d22');
    dot(Hd.x + d.x * 8, Hd.y + d.y * 8 - 1, '#4a4a52');
  }
  function drawWheelchair(J, layer) {
    const st = layer === 'back' ? '#4e565c' : '#6f787e', vin = '#2e2a30';
    const cx = J.H.x - 1.6, cy = -9.2, r = 9;
    const spin = (J.pa || 0) * TAU;
    if (layer === 'back') {
      for (let a = 0; a < 26; a++) { const an = (a / 26) * TAU; dot(cx + 1.6 + Math.cos(an) * r, cy + Math.sin(an) * r, a % 7 === 0 ? '#7f888e' : st); }
      R(Math.round(OX + J.H.x - 3), Math.round(OY + J.H.y + 0.6), 13, 3, vin);           // seat
      line(J.H.x - 4.2, J.H.y + 1, J.H.x - 5.6, J.H.y - 13.6, 2, vin);                    // backrest
      line(J.H.x - 5.8, J.H.y - 14, J.H.x - 8.2, J.H.y - 14.2, 1, st);                    // push handle
      line(J.H.x + 9.8, J.H.y + 2, J.H.x + 12, -3, 1, st);                                 // footrest strut
      R(Math.round(OX + J.H.x + 10.2), Math.round(OY - 3.4), 4, 1, '#8a9298');
      for (const wx of [J.H.x + 11.6]) { R(Math.round(OX + wx - 1), Math.round(OY - 2), 2, 2, '#26242a'); }
      return;
    }
    for (let a = 0; a < 30; a++) { const an = (a / 30) * TAU; dot(cx + Math.cos(an) * r, cy + Math.sin(an) * r, a % 2 ? '#2a2a30' : '#36363e'); }
    for (let a = 0; a < 24; a++) { const an = (a / 24) * TAU; dot(cx + Math.cos(an) * (r - 1.6), cy + Math.sin(an) * (r - 1.6), st); }
    for (let k = 0; k < 4; k++) { const an = spin + k * (Math.PI / 4); line(cx - Math.cos(an) * 6.4, cy - Math.sin(an) * 6.4, cx + Math.cos(an) * 6.4, cy + Math.sin(an) * 6.4, 1, '#59626a'); }
    dot(cx, cy, '#9aa3a8');
  }
  function drawProps(J, layer) {
    const p = J.prop;
    if (!p) return;
    const t = J.t;
    if (p === 'wheelchair') { if (layer === 'back' || layer === 'mid') drawWheelchair(J, layer); return; }
    if (layer === 'mid') {
      if (p === 'carry') drawCarry(J);
      if (p === 'broom') {
        const top = { x: J.hF.x - 3.4, y: J.hF.y - 5.4 }, foot = { x: J.pa, y: -1.6 };
        line(top.x, top.y, foot.x, foot.y, 1, '#8a6a44');
        R(Math.round(OX + foot.x - 2.5), Math.round(OY - 3), 6, 2, '#c4a86a'); R(Math.round(OX + foot.x - 3), Math.round(OY - 1), 7, 1, '#a88c52');
      }
      return;
    }
    if (layer === 'front') {
      if (p === 'phone') {
        // handset from above the ear to the mouth, held by the near hand; a coiled cord hangs from it
        const hp = J.hp, a = hp(2.6, 4.2), b = hp(7.6, 10.2);
        for (let i = 0; i < 10; i++) dot(b.x - 1 + (i % 2), b.y + 1.5 + i * 1.1, i % 2 ? '#2a2a30' : '#3c3c46');
        line(a.x, a.y, b.x, b.y, 2, '#232329');
        dot(a.x - 1, a.y - 1, '#2d2d35'); dot(b.x, b.y, '#2d2d35');
        line(a.x + 0.3, a.y - 0.4, (a.x + b.x) / 2 + 0.3, (a.y + b.y) / 2 - 0.4, 1, '#55555f');
        drawHand(J, true, J.hN, { x: 0, y: -1 }, 'fist');
      }
      if (p === 'cig') {
        const tip = { x: J.hN.x + 1.6, y: J.hN.y - 1.2 };
        dot(tip.x - 1, tip.y, '#e8e2d4'); dot(tip.x, tip.y, '#d9693a');
        for (let i = 0; i < 4; i++) {
          const age = (t * 0.45 + i / 4) % 1, x = tip.x + age * 3 + Math.sin(age * 7 + i) * 1.2, y = tip.y - 1 - age * 11;
          bx.globalAlpha = (1 - age) * 0.42; dot(x, y, '#cfcac2'); if (age > 0.4) dot(x + 1, y, '#cfcac2');
          bx.globalAlpha = 1;
        }
      }
      if (p === 'cup') {
        const kind = typeof J.opts.carry === 'string' ? J.opts.carry : 'cup', H = J.hN;
        if (/bottle|beer/.test(kind)) { R(Math.round(OX + H.x), Math.round(OY + H.y - 4), 2, 5, '#5a3a1e'); dot(H.x + 0.5, H.y - 5.5, '#8a6a3a'); }
        else if (/can|soda/.test(kind)) R(Math.round(OX + H.x), Math.round(OY + H.y - 3), 2, 4, '#9a3a32');
        else { R(Math.round(OX + H.x), Math.round(OY + H.y - 3), 3, 4, '#e6e0d2'); R(Math.round(OX + H.x), Math.round(OY + H.y - 3), 3, 1, '#b8b0a0'); }
      }
      if (p === 'pen') line(J.hN.x + 0.5, J.hN.y - 1, J.hN.x + 2.4, J.hN.y - 3.4, 1, '#1e2a44');
      if (p === 'rope') {
        // the rope loop in side view: hands at the hips, the far end travelling round an ellipse
        const ph = J.pa || 0, A = { x: J.H.x + 2.2 + 11 * Math.sin(ph * TAU), y: -22.5 * J.s - 24 * J.s * Math.cos(ph * TAU) };
        const H = { x: (J.hN.x + J.hF.x) / 2, y: (J.hN.y + J.hF.y) / 2 };
        const mid = { x: (H.x + A.x) / 2 + (A.y < H.y ? 3 : -3), y: (H.y + A.y) / 2 };
        for (let i = 0; i <= 14; i++) { const k = i / 14, a = (1 - k) * (1 - k), b = 2 * k * (1 - k), cc = k * k; dot(a * H.x + b * mid.x + cc * A.x, a * H.y + b * mid.y + cc * A.y, '#c9bfa8'); }
      }
      if (p === 'blanket' && J.opts.blanket) {
        const bc = ramp(typeof J.opts.blanket === 'string' ? J.opts.blanket : '#6a7a8a');
        const a = J.C, f = J.gN.ankle;
        poly([{ x: a.x + 3, y: a.y - 3.6 }, { x: f.x + 2.6, y: f.y - 3.6 }, { x: f.x + 2.6, y: f.y + 1.6 }, { x: a.x + 3, y: a.y + 2.2 }], bc.b, null, bc.l);
      }
    }
  }
  function drawClipboard(J) {
    const H = J.hF, x = Math.round(OX + H.x + 0.5), y = Math.round(OY + H.y - 5);
    R(x, y, 4, 6, '#6e5236'); R(x + 1, y + 1, 3, 4, '#e2dbc8'); R(x + 1, y, 2, 1, '#9aa0a4'); R(x + 1, y + 2, 2, 1, '#9a9282');
  }

  /* ── Full figure ──────────────────────────────────────────────────── */
  function raster(J) {
    bx.setTransform(1, 0, 0, 1, 0, 0);
    bx.globalAlpha = 1; bx.globalCompositeOperation = 'source-over';
    // Work only inside the figure's bounds (joints plus room for hair, props and effects).
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const P of [J.H, J.C, J.K, J.hN, J.hF, J.eN, J.eF, J.kN, J.kF, J.gN.heel, J.gN.toe, J.gF.heel, J.gF.toe]) {
      if (P.x < x0) x0 = P.x; if (P.x > x1) x1 = P.x; if (P.y < y0) y0 = P.y; if (P.y > y1) y1 = P.y;
    }
    const pad = J.prop ? 18 : 13;
    J.bb = { x: clamp(Math.floor(OX + x0 - pad), 0, BW), y: clamp(Math.floor(OY + y0 - pad), 0, BH) };
    J.bb.w = clamp(Math.ceil(OX + x1 + pad), 0, BW) - J.bb.x; J.bb.h = clamp(Math.ceil(OY + y1 + 4), 0, BH) - J.bb.y;
    bx.clearRect(J.bb.x, J.bb.y, J.bb.w, J.bb.h);
    curFill = null;
    const N = J.N, T = N.top.T;
    J.hp = null;
    drawProps(J, 'back');
    const farFront = J.rig.ffront > 0.5;
    if (!farFront) drawArm(J, false);
    drawLeg(J, false);
    drawLeg(J, true);
    drawPelvis(J);
    if (N.bottom.Bt.skirt) drawSkirt(J, N.bottom.r, N.bottom.Bt.skirt, 0.8);
    if (N.top.long) drawSkirt(J, N.top.r, N.top.longK, T.longK > 1.5 ? 1.6 : 1.1);
    const shp = drawTorso(J);
    drawTorsoExtras(J, shp);
    J.hp = drawNeckHead(J);
    drawCollar(J, J.hp);
    if (farFront) drawArm(J, false);
    if (N.ex.clipboard) drawClipboard(J);
    drawProps(J, 'mid');
    drawArm(J, true);
    drawProps(J, 'front');
  }
  // Ground shadow: two soft rows under whatever touches the ground.
  function drawShadow(ctx, x, gy, J, alpha) {
    const pts = [J.gN.heel, J.gN.toe, J.gF.heel, J.gF.toe, J.H, J.C, J.K];
    let x0 = Infinity, x1 = -Infinity, low = -Infinity;
    for (const p of pts) { if (p.y > -9) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); } low = Math.max(low, p.y); }
    if (!Number.isFinite(x0)) { x0 = -4; x1 = 4; }
    const lift = Math.max(0, -low);
    const fade = clamp(1 - lift / 40, 0.25, 1);
    const w = Math.max(8, (x1 - x0) + 6) * (0.6 + 0.4 * fade);
    const m = (x0 + x1) / 2 * (J.face > 0 ? 1 : -1) * (J.mirror ? -1 : 1);
    const prevA = ctx.globalAlpha, prevF = ctx.fillStyle;
    ctx.globalAlpha = prevA * alpha * fade;
    ctx.fillStyle = S.pal.shadow;
    ctx.fillRect(Math.round(x + m - w / 2), gy - 1, Math.round(w), 1);
    ctx.fillRect(Math.round(x + m - w / 2 + 2), gy, Math.max(2, Math.round(w - 4)), 1);
    ctx.globalAlpha = prevA; ctx.fillStyle = prevF;
  }
  function drawFigure(ctx, x, y, face, poseName, t, look, opts) {
    if (!canDraw(ctx) || !ensureBuf()) return;
    opts = opts || NO_OPTS;
    if (opts.alpha != null && !(+opts.alpha > 0)) return;
    try {
      const N = lookFor(look);
      let fc = (face === -1 ? -1 : 1) * (opts.flip ? -1 : 1);
      const J = solve(poseName, t, N, opts, fc);
      // a mirrored pose (lying in bed) is authored head-left; flip so the head points the way the actor faces
      const drawFace = J.mirror ? -fc : fc;
      J.face = fc;
      raster(J);
      const alpha = opts.alpha == null ? 1 : clamp(+opts.alpha, 0, 1);
      if (opts.tint) {
        bx.globalCompositeOperation = 'source-atop';
        bx.globalAlpha = opts.tintK != null ? clamp(+opts.tintK, 0, 1) : (/^#?f{3,6}$/i.test(opts.tint) ? 0.82 : 0.55);
        bx.fillStyle = opts.tint; bx.fillRect(J.bb.x, J.bb.y, J.bb.w, J.bb.h);
        bx.globalCompositeOperation = 'source-over'; bx.globalAlpha = 1; curFill = null;
      }
      const ix = Math.round(x), iy = Math.round(y);
      const prevA = ctx.globalAlpha, prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      if (opts.shadow !== false && !POSES[J.name].noShadow) drawShadow(ctx, ix, opts.shadowY != null ? Math.round(+opts.shadowY) : iy, J, alpha);
      ctx.globalAlpha = prevA * alpha;
      const b = J.bb;
      if (b.w <= 0 || b.h <= 0) { ctx.globalAlpha = prevA; ctx.imageSmoothingEnabled = prevSmooth; return; }
      const put = (src, dx, dy) => {
        if (drawFace > 0) ctx.drawImage(src, b.x, b.y, b.w, b.h, ix - OX + b.x + dx, iy - OY + b.y + dy, b.w, b.h);
        else { ctx.save(); ctx.translate(ix + 1 + dx, iy + dy); ctx.scale(-1, 1); ctx.drawImage(src, b.x, b.y, b.w, b.h, b.x - OX, b.y - OY, b.w, b.h); ctx.restore(); }
      };
      if (opts.outlineCol) {
        sx2.globalCompositeOperation = 'source-over'; sx2.clearRect(b.x, b.y, b.w, b.h); sx2.drawImage(buf, b.x, b.y, b.w, b.h, b.x, b.y, b.w, b.h);
        sx2.globalCompositeOperation = 'source-in'; sx2.fillStyle = opts.outlineCol; sx2.fillRect(b.x, b.y, b.w, b.h);
        sx2.globalCompositeOperation = 'source-over';
        put(sil, -1, 0); put(sil, 1, 0); put(sil, 0, -1); put(sil, 0, 1);
      }
      put(buf, 0, 0);
      ctx.globalAlpha = prevA; ctx.imageSmoothingEnabled = prevSmooth;
    } catch (err) {
      // report once per pose so a broken pose cannot flood the error overlay every frame
      const key = 'fail:' + poseName;
      if (!warned.has(key)) { warned.add(key); if (S.fail) S.fail(err, { source: 'art.drawFigure', pose: poseName }); }
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     EFFECTS
     ════════════════════════════════════════════════════════════════════ */
  function drawAfterimage(ctx, x, y, face, poseName, t, look, alpha) {
    drawFigure(ctx, x, y, face, poseName, t, look, { alpha: alpha == null ? 0.45 : alpha, tint: S.pal.after, tintK: 0.85, shadow: false });
  }
  // Punch trails relative to the puncher's feet (x, y): narrow streaks for jab/cross/straight,
  // a short curve for hooks, an upward sweep for uppercuts. k = 0..1 age.
  function drawSmear(ctx, x, y, face, kind, k) {
    if (!canDraw(ctx)) return;
    k = clamp(+k || 0, 0, 1);
    const f = face === -1 ? -1 : 1, X = (dx) => Math.round(x + f * dx), Y = (dy) => Math.round(y + dy);
    const prevA = ctx.globalAlpha, prevF = ctx.fillStyle;
    const a = prevA * (1 - k) * 0.85;
    const hl = (dx0, dx1, dy, col, al) => {
      ctx.globalAlpha = al; ctx.fillStyle = col;
      const xa = X(dx0), xb = X(dx1);
      ctx.fillRect(Math.min(xa, xb), Y(dy), Math.abs(xb - xa) + 1, 1);
    };
    if (kind === 'hook') {
      // a short arc swept from wide to centre, in front of the head
      const n = 9;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        if (u < k * 0.8) continue;
        const an = -0.35 * Math.PI + u * 0.9 * Math.PI;
        const px = 9 + Math.cos(an) * 8.5, py = -36.5 + Math.sin(an) * 4.4;
        ctx.globalAlpha = a * (0.4 + 0.6 * u); ctx.fillStyle = u > 0.6 ? S.pal.smear : S.pal.smear2;
        ctx.fillRect(X(px), Y(py), 2, 1);
      }
    } else if (kind === 'upper' || kind === 'uppercut') {
      for (let i = 0; i < 8; i++) {
        const u = i / 7;
        if (u < k * 0.8) continue;
        const px = 7.5 + u * 3 - Math.sin(u * Math.PI) * 1.2, py = -24 - u * 20;
        ctx.globalAlpha = a * (0.35 + 0.65 * u); ctx.fillStyle = u > 0.55 ? S.pal.smear : S.pal.smear2;
        ctx.fillRect(X(px), Y(py), 1, 3);
      }
    } else {
      const len = kind === 'straight' ? 22 : kind === 'cross' ? 15 : 12;
      const tipX = kind === 'straight' ? 27 : kind === 'cross' ? 23 : 21, yy = kind === 'straight' ? -34 : -36;
      const back = tipX - len * (1 - k * 0.7);
      hl(back, tipX - 2, yy, S.pal.smear, a);
      hl(back + len * 0.3, tipX - 4, yy - 1, S.pal.smear2, a * 0.6);
      if (kind !== 'jab') hl(back + len * 0.15, tipX - 3, yy + 1, S.pal.smear2, a * 0.45);
    }
    ctx.globalAlpha = prevA; ctx.fillStyle = prevF;
  }
  // Impact spark: a bright core and eight rays that grow and thin out as k goes 0 -> 1.
  function spark(ctx, x, y, k, color) {
    if (!canDraw(ctx)) return;
    k = clamp(+k || 0, 0, 1);
    const col = color || S.pal.spark, xi = Math.round(x), yi = Math.round(y);
    const prevA = ctx.globalAlpha, prevF = ctx.fillStyle;
    ctx.globalAlpha = prevA * (1 - k * 0.85);
    ctx.fillStyle = col;
    if (k < 0.45) { ctx.fillRect(xi - 1, yi - 1, 3, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(xi, yi, 1, 1); ctx.fillStyle = col; }
    const r0 = 1.5 + k * 5, r1 = 3 + k * 7;
    for (let i = 0; i < 8; i++) {
      const an = (i / 8) * TAU + 0.2, long = i % 2 === 0, rr1 = long ? r1 : r1 * 0.6, rr0 = long ? r0 : r0 * 0.7;
      for (let r = rr0; r <= rr1; r += 1) {
        if (k > 0.5 && r < rr1 - 1.5) continue;
        ctx.fillRect(Math.round(xi + Math.cos(an) * r), Math.round(yi + Math.sin(an) * r), 1, 1);
      }
    }
    ctx.globalAlpha = prevA; ctx.fillStyle = prevF;
  }
  // Foot dust: a few low pixel clusters that spread and rise slightly as they fade.
  function dust(ctx, x, y, k) {
    if (!canDraw(ctx)) return;
    k = clamp(+k || 0, 0, 1);
    const prevA = ctx.globalAlpha, prevF = ctx.fillStyle;
    const pts = [[-3, 0], [-1, -1], [1, 0], [3, -1], [0, -2]];
    for (let i = 0; i < pts.length; i++) {
      const [ox, oy] = pts[i], spread = 1 + k * 2.2;
      ctx.globalAlpha = prevA * (1 - k) * (i === 4 ? 0.35 : 0.55);
      ctx.fillStyle = i % 2 ? S.pal.dust : S.pal.dust2;
      const px = Math.round(x + ox * spread), py = Math.round(y - 1 + oy - k * 2.5);
      ctx.fillRect(px, py, k < 0.5 ? 2 : 1, 1);
    }
    ctx.globalAlpha = prevA; ctx.fillStyle = prevF;
  }

  /* ════════════════════════════════════════════════════════════════════
     BUILT-IN LOOKS (chapters/cast.js adds the cast and may override these)
     ════════════════════════════════════════════════════════════════════ */
  const P = S.pal;
  const jinBase = (o) => Object.assign({
    h: 46, build: 'boxer', skin: P.jinSkin, hair: { style: 'twoblock', color: P.jinHair },
    top: { kind: 'track', color: P.jinTop, color2: P.jinStripe }, bottom: { kind: 'pants', color: P.jinPants }, shoes: P.jinShoes,
    extras: ['scar'],
  }, o || {});
  // 1996 onward: the canonical street look with the scar.
  S.defineLook('jin', jinBase());
  // 1994 (Chapter 0): the cheek is still clean.
  S.defineLook('jin_1994', jinBase({ extras: [] }));
  // Street look: brass knuckles appear on the fists whenever the gear is equipped.
  S.defineLook('jin_street', jinBase({ extrasWhen: (G, St) => ((G && G.gear && G.gear.knuckles) || (St && St.combat && St.combat.body && St.combat.body.knuckles) ? ['knuckles'] : []) }));
  // Fight night 1994: bare chest, navy trunks with a pale waistband, red gloves, no scar yet.
  S.defineLook('jin_ring', jinBase({ top: { kind: 'bare', color: P.jinSkin }, bottom: { kind: 'trunks', color: '#2c3f66' }, shoes: '#262a3a', extras: ['gloves:#a8342a'] }));
  S.defineLook('jin_ring_robe', jinBase({ top: { kind: 'robe', color: '#26304a', color2: P.jinStripe }, bottom: { kind: 'trunks', color: '#2c3f66' }, shoes: '#262a3a', extras: ['gloves:#a8342a'] }));
  // St. Agnes, Chapter 1: thinner, hair grown out over the ears, pale gown, gray socks.
  S.defineLook('jin_hospital', jinBase({ build: 'slim', hair: { style: 'shaggy', color: P.jinHair },
    top: { kind: 'gown', color: '#a3bab2', color2: '#8aa39b' }, bottom: { kind: 'shorts', color: '#a3bab2' }, shoes: '#9a9a9e' }));
  S.defineLook('jin_rehab', jinBase({ build: 'slim', hair: { style: 'shaggy', color: P.jinHair },
    top: { kind: 'tee', color: '#8b8e94' }, bottom: { kind: 'sweats', color: '#2b3450' }, shoes: '#8e8e92' }));
  // Generic fallbacks.
  S.defineLook('man', { h: 46, build: 'avg', skin: '#c48e68', hair: { style: 'short', color: '#2e241c' },
    top: { kind: 'jacket', color: '#5a5048', color2: '#a49a88' }, bottom: { kind: 'pants', color: '#3a3c44' }, shoes: '#2c2622', extras: [] });
  S.defineLook('woman', { h: 43, build: 'slim', skin: '#d9ab88', hair: { style: 'bob', color: '#4a3226' },
    top: { kind: 'cardigan', color: '#7a5a62', color2: '#d8cfc0' }, bottom: { kind: 'long_skirt', color: '#3e4250' }, shoes: '#3a2c26', extras: [] });
  S.defineLook('kid', { h: 30, build: 'kid', skin: '#c9966e', hair: { style: 'short', color: '#2a1f18' },
    top: { kind: 'tee', color: '#a85a3c' }, bottom: { kind: 'shorts', color: '#41506a' }, shoes: '#d0cbbf', extras: [] });
  S.defineLook('thug', { h: 47, build: 'broad', skin: '#b98563', hair: { style: 'beanie', color: '#33363c' },
    top: { kind: 'hoodie', color: '#4a4f48' }, bottom: { kind: 'jeans', color: '#36425a' }, shoes: '#2a2624', extras: [] });
  S.defineLook('collector', { h: 50, build: 'heavy', skin: '#c08a66', hair: { style: 'buzz', color: '#2a221c' },
    top: { kind: 'coat', color: '#2e3038', color2: '#5a5048' }, bottom: { kind: 'slacks', color: '#24252c' }, shoes: '#16151a', extras: ['beard:#3a2e26'] });
  S.defineLook('guard', { h: 47, build: 'avg', skin: '#b07e5c', hair: { style: 'cap', color: '#2a3448' },
    top: { kind: 'uniform', color: '#3c4a62', color2: '#c9b26a' }, bottom: { kind: 'slacks', color: '#232a38' }, shoes: '#151519', extras: ['badge'] });
  // A few more generic people so placeholder NPCs vary until the cast defines its own.
  S.defineLook('old_man', { h: 44, build: 'old', skin: '#c99c78', hair: { style: 'gray_short', color: '#a6a29a' },
    top: { kind: 'cardigan', color: '#6a6250', color2: '#cfc6b2' }, bottom: { kind: 'slacks', color: '#4a4a50' }, shoes: '#3a2e26', extras: ['glasses'] });
  S.defineLook('old_woman', { h: 40, build: 'old', skin: '#a8714f', hair: { style: 'bun', color: '#b0aca4' },
    top: { kind: 'dress', color: '#6a5a78', color2: '#d8cfc0' }, bottom: { kind: 'skirt', color: '#6a5a78' }, shoes: '#3a2c26', extras: [] });
  S.defineLook('nurse', { h: 43, build: 'slim', skin: '#d2a582', hair: { style: 'ponytail', color: '#1e1814' },
    top: { kind: 'scrubs', color: '#4f8a83' }, bottom: { kind: 'pants', color: '#4f8a83' }, shoes: '#dcd8cf', extras: ['lanyard', 'watch'] });
  S.defineLook('suit', { h: 48, build: 'avg', skin: '#d8b090', hair: { style: 'slick', color: '#3a3430' },
    top: { kind: 'suit', color: '#2e3340', color2: '#d8d4ca' }, bottom: { kind: 'slacks', color: '#2e3340' }, shoes: '#1a1614', extras: ['tie:#6a2a2a'] });
  S.defineLook('worker', { h: 47, build: 'broad', skin: '#9a6a4c', hair: { style: 'cap', color: '#7a3a2e' },
    top: { kind: 'overalls', color: '#3e5070', color2: '#b8ae9a' }, bottom: { kind: 'jeans', color: '#3e5070' }, shoes: '#3a2a20', extras: [] });

  /* ════════════════════════════════════════════════════════════════════
     EXPORTS
     ════════════════════════════════════════════════════════════════════ */
  const POSE_NAMES = Object.keys(POSES);
  // Joint positions for a pose (local space: facing right, feet centre at 0,0, y up negative). Works headless.
  function joints(poseName, t, look, opts) {
    const N = lookFor(look), o = opts || NO_OPTS;
    const J = solve(poseName, t, N, o, 1);
    const pt = (p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 });
    return { pose: J.name, hip: pt(J.H), chest: pt(J.C), head: pt(J.K), handN: pt(J.hN), handF: pt(J.hF), elbowN: pt(J.eN), elbowF: pt(J.eF),
      kneeN: pt(J.kN), kneeF: pt(J.kF), footN: pt(J.gN.ankle), footF: pt(J.gF.ankle), headAngle: J.theta, mirror: J.mirror, height: N.h };
  }
  S.art = Object.assign(S.art || {}, {
    poses: POSE_NAMES,
    poseDuration: (name) => (POSES[name] ? POSES[name].dur : 0),
    drawFigure, drawAfterimage, drawSmear, spark, dust,
    // extras (see story/dev/notes/art.md)
    joints,
    lookOf: (look) => { const N = lookFor(look); return { id: N.id, h: N.h, build: N.build }; },
    lookHeight: (look) => lookFor(look).h,
    mix, shade, lighten, ramp: ramp5, rgba,
    forgetLook: (look) => { const def = typeof look === 'string' ? S.looks[look] : look; if (def) lookMemo.delete(def); },
  });
})(window.STORY);
