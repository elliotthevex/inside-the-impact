/* Story Mode — pieces.js
   Environment piece library, sky and far-parallax backdrops, weather, and the
   lighting composite. Contract: ARCHITECTURE.md §4.

   Art direction (ref-movement-art.pdf, "Artistic style"): muted blue-gray
   ambience, worn brown / faded red brick with only selective visible
   brickwork, charcoal and plum shadows, dull green-gray metal, soft amber
   lights, 3–5 shades per material, cool shadows and warm highlights, pixel
   clusters with quiet areas between them, period 1990s American industrial
   neighbourhood detail.

   Conventions (also in story/dev/notes/pieces.md):
   - Pieces draw in their layer's world coordinates. `x` is the LEFT edge for
     pieces that take a `w`, the horizontal CENTRE for fixed-size props.
   - `y` defaults to the location ground and is the line the prop stands on.
     Wall-mounted pieces (posters, signs, windows, pictures, ...) treat `y` as
     their TOP edge.
   - Every drawing call is skipped when S.headless. Wear patterns come from
     S.util.hash seeded per piece, so a bake is identical every time. */
(function (S) {
  'use strict';

  const W = S.W || 640, H = S.H || 360;
  const U = S.util || {};
  const clamp = U.clamp || ((v, a, b) => (v < a ? a : v > b ? b : v));
  const lerp = U.lerp || ((a, b, t) => a + (b - a) * t);
  // Deterministic 0..1. Falls back to a local integer hash if core lacks one.
  const hash = U.hash || function (n) {
    let h = Math.floor((+n || 0) * 1000) | 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const fail = (e, ctx) => { try { (S.fail || console.error)(e, ctx); } catch (_) { /* nothing to report to */ } };

  /* ── 1. Colour utilities ─────────────────────────────────────────── */
  const rgbCache = new Map();
  function rgb(hex) {
    let v = rgbCache.get(hex);
    if (v) return v;
    let h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16) || 0;
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, v);
    return v;
  }
  const hx = (r, g, b) => '#' + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1);
  const mixCache = new Map();
  function mix(a, b, t) {
    const key = a + b + t;
    let v = mixCache.get(key);
    if (v) return v;
    const A = rgb(a), B = rgb(b);
    v = hx(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
    if (mixCache.size > 4000) mixCache.clear();
    mixCache.set(key, v);
    return v;
  }
  function rgba(hex, a) { const c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (+a).toFixed(3) + ')'; }
  // Shadows lean cool (plum charcoal), highlights lean warm, per the art direction.
  const COOL = '#191524', WARM = '#efd9b0';
  const shade = (hex, amt) => (amt < 0 ? mix(hex, COOL, -amt) : mix(hex, WARM, amt));
  // Five-step material ramp from one colour: [deep, shadow, base, lit, highlight].
  const rampCache = new Map();
  function ramp(hex) {
    let r = rampCache.get(hex);
    if (!r) { r = [shade(hex, -0.55), shade(hex, -0.28), hex, shade(hex, 0.14), shade(hex, 0.3)]; rampCache.set(hex, r); }
    return r;
  }
  // Pull a caller-supplied colour toward the muted world palette.
  function mute(hex, t) {
    const c = rgb(hex), l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;
    return mix(hex, hx(l * 0.92, l * 0.96, l * 1.08), t === undefined ? 0.22 : t);
  }

  /* ── 2. Palette (material ramps, dark → light; index 2 is the base) ─ */
  const PAL = {
    ink: '#0c0a11', night: '#11131b', shadow: '#17141d', plum: '#271e2c', plum2: '#36293a', charcoal: '#1d1c22',
    brick: ['#2a1e1c', '#3a2924', '#4c362e', '#5f4639', '#735645'],
    brick_red: ['#2c1918', '#43221e', '#5a2e27', '#703c32', '#854f42'],
    brick_dark: ['#1a1618', '#241f22', '#30292c', '#3d3437', '#4a4043'],
    stone: ['#25262b', '#34353a', '#45454a', '#57565a', '#6b6968'],
    siding: ['#1e252e', '#29323d', '#36404c', '#45505d', '#57626f'],
    concrete: ['#232528', '#313437', '#404346', '#505255', '#626365'],
    plaster: ['#2b2a2c', '#3b3a3b', '#4d4b4a', '#615e5a', '#77726b'],
    metal: ['#1a201e', '#262e2b', '#343e39', '#444f49', '#57635b'],
    iron: ['#121417', '#1b1e22', '#262a2f', '#33383e', '#434950'],
    steel: ['#24282d', '#33383e', '#454b52', '#5a6168', '#737a80'],
    rust: ['#3a2218', '#55301f', '#704328', '#8a5733'],
    wood: ['#23180f', '#332417', '#463220', '#5b432c', '#72573b'],
    woodPale: ['#3b2f22', '#52432f', '#6b593e', '#83704f', '#9a8662'],
    asphalt: ['#111318', '#171a20', '#1e222a', '#272c35', '#323843'],
    walk: ['#262930', '#30343c', '#3b4049', '#474d57', '#565c66'],
    amber: ['#5a3c20', '#956532', '#cf964a', '#ecbd6c', '#fbdc9c'],
    glass: ['#0e131b', '#151c27', '#1d2633', '#293443', '#3a4757'],
    paper: ['#5f584c', '#7a7262', '#958c78', '#b0a68e', '#c8bea4'],
    cloth: ['#1f2530', '#2b3340', '#3a4352', '#4b5566', '#5f697a'],
    green: ['#1b241f', '#26332b', '#324238', '#405346', '#526656'],
    hospital: ['#4a5558', '#5d6a6c', '#727f80', '#8a9594', '#a2aca9'],
    sheet: ['#5c6672', '#717c88', '#8a949e', '#a3acb3', '#bcc2c4'],
    canvas: ['#4d4a46', '#625e58', '#79746c', '#908a80', '#a59e92'],
    fadedRed: '#7c3a31', fadedBlue: '#3d5168', fadedYellow: '#a98c47', fadedGreen: '#4f6852', cream: '#c4b896', offWhite: '#cfc8b6',
    neonRed: '#d9634f', neonBlue: '#7fb0c8', neonAmber: '#e8b860', neonPink: '#c97a8e', neonGreen: '#86b88c',
    lamp: '#f2c46e', lampWarm: '#e9a95a', lampCool: '#b9cbd6', fluoro: '#cfe0d6', tvBlue: '#7d9cc4', fire: '#e07a3a',
  };
  const STYLE = { brick: PAL.brick, brick_red: PAL.brick_red, brick_dark: PAL.brick_dark, stone: PAL.stone, siding: PAL.siding, concrete: PAL.concrete, plaster: PAL.plaster, wood: PAL.wood, metal: PAL.metal };
  const styleRamp = (s) => STYLE[s] || (typeof s === 'string' && s[0] === '#' ? ramp(s) : PAL.brick);
  const colorRamp = (c, def) => (Array.isArray(c) ? c : c ? ramp(mute(c, 0.18)) : def);

  /* ── 3. Pixel primitives ─────────────────────────────────────────── */
  // Integer-snapped rect; computing both edges avoids 1 px seams between rects.
  function R(c, x, y, w, h, col) {
    const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h);
    if (x1 <= x0 || y1 <= y0) return;
    c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  function Px(c, x, y, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function RA(c, x, y, w, h, col, a) { if (a <= 0.003) return; R(c, x, y, w, h, rgba(col, a)); }
  function line(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    c.fillStyle = col;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, n = 0;
    for (;;) {
      c.fillRect(x0, y0, 1, 1);
      if ((x0 === x1 && y0 === y1) || ++n > 4000) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // A sagging cable between two points, one pixel per column.
  function cable(c, x0, y0, x1, y1, sag, col) {
    c.fillStyle = col;
    const n = Math.max(1, Math.abs(Math.round(x1 - x0)));
    let py = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = Math.round(lerp(x0, x1, t)), y = Math.round(lerp(y0, y1, t) + sag * 4 * t * (1 - t));
      if (py !== null && Math.abs(y - py) > 1) c.fillRect(x, Math.min(y, py) + 1, 1, Math.abs(y - py) - 1);
      c.fillRect(x, y, 1, 1);
      py = y;
    }
  }
  function ellipse(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let yy = -ry; yy <= ry; yy++) {
      const k = 1 - (yy * yy) / Math.max(1, ry * ry);
      if (k < 0) continue;
      const hw = Math.round(rx * Math.sqrt(k));
      c.fillRect(Math.round(cx - hw), Math.round(cy + yy), hw * 2 + 1, 1);
    }
  }
  // Block with top-left light: highlight top row, lit left column, dark right and bottom.
  function box(c, x, y, w, h, r, opt) {
    R(c, x, y, w, h, r[2]);
    if (w > 2 && h > 2) {
      R(c, x, y, w, 1, r[4]); R(c, x, y + 1, 1, h - 1, r[3]);
      R(c, x + w - 1, y + 1, 1, h - 1, r[1]); R(c, x, y + h - 1, w, 1, r[0]);
    }
    if (opt && opt.outline) { R(c, x - 1, y, 1, h, opt.outline); R(c, x + w, y, 1, h, opt.outline); }
  }
  // Scattered single pixels or 2-px clusters (wear, texture). Deterministic per seed.
  function speckle(c, x, y, w, h, col, n, seed, cluster) {
    for (let i = 0; i < n; i++) {
      const px = x + Math.floor(hash(seed + i * 1.37) * w), py = y + Math.floor(hash(seed + i * 2.71 + 0.5) * h);
      if (cluster && hash(seed + i * 3.1) < 0.5) R(c, px, py, 2, 1, col); else Px(c, px, py, col);
    }
  }
  // Soft contact shadow under a floor prop.
  function contact(c, cx, gy, w) {
    RA(c, cx - w / 2, gy - 1, w, 2, PAL.ink, 0.35);
    RA(c, cx - w / 2 + 2, gy + 1, w - 4, 1, PAL.ink, 0.2);
  }
  // Water stains / grime streaks running down from a ledge.
  function streaks(c, x, y, w, h, col, n, seed, a) {
    for (let i = 0; i < n; i++) {
      const sx = x + Math.floor(hash(seed + i * 4.1) * w), len = Math.floor(h * (0.25 + 0.75 * hash(seed + i * 5.3)));
      RA(c, sx, y, 1, len, col, a * (0.6 + 0.4 * hash(seed + i * 6.7)));
      if (hash(seed + i * 7.9) < 0.4) RA(c, sx + 1, y, 1, Math.floor(len * 0.5), col, a * 0.5);
    }
  }
  // Vertical gradient done as pixel bands, so it stays crisp.
  function vbands(c, x, y, w, h, top, bot, steps) {
    steps = steps || 6;
    for (let i = 0; i < steps; i++) R(c, x, y + (h * i) / steps, w, h / steps + 1, mix(top, bot, i / (steps - 1)));
  }
  const seedOf = (p, salt) => (p.seed !== undefined ? +p.seed * 7.13 : (+p.x || 0) * 0.731 + (+p.y || 0) * 0.173 + (+p.x0 || 0) * 0.37) + (salt || 0);
  const gyOf = (p, L) => (p.y !== undefined && p.y !== null ? +p.y : L && L.ground !== undefined ? +L.ground : 300);
  const ceilOf = (L) => (L && L.room && L.room.ceiling !== undefined ? +L.room.ceiling : (L && L.ground !== undefined ? +L.ground : 300) - 210);

  /* ── 4. Pixel font (fallback when art.js's S.font is absent) ────── */
  // 3x5 glyphs, rows as 3-bit numbers (4 = left pixel).
  const GLYPH = {
    A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4],
    G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7],
    M: [5, 7, 7, 5, 5], N: [6, 5, 5, 5, 5], O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5],
    S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2], U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5],
    Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7],
    0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [6, 1, 2, 4, 7], 3: [6, 1, 2, 1, 6], 4: [5, 5, 7, 1, 1], 5: [7, 4, 6, 1, 6],
    6: [3, 4, 7, 5, 7], 7: [7, 1, 2, 2, 2], 8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 6],
    '.': [0, 0, 0, 0, 2], ',': [0, 0, 0, 2, 4], "'": [2, 2, 0, 0, 0], '!': [2, 2, 2, 0, 2], '?': [6, 1, 2, 0, 2],
    '-': [0, 0, 7, 0, 0], ':': [0, 2, 0, 2, 0], '/': [1, 1, 2, 4, 4], '&': [2, 5, 2, 5, 3], '#': [5, 7, 5, 7, 5],
    '$': [3, 6, 2, 3, 6], '(': [1, 2, 2, 2, 1], ')': [4, 2, 2, 2, 4], '"': [5, 5, 0, 0, 0], '+': [0, 2, 7, 2, 0], ' ': [0, 0, 0, 0, 0],
  };
  const miniFont = {
    width(text, scale) { const s = scale || 1; const n = String(text || '').length; return n ? (n * 4 - 1) * s : 0; },
    draw(c, text, x, y, o) {
      o = o || {};
      const s = o.scale || 1, str = String(text || '').toUpperCase(), w = miniFont.width(str, s);
      let x0 = o.align === 'center' ? x - Math.floor(w / 2) : o.align === 'right' ? x - w : x;
      x0 = Math.round(x0); y = Math.round(y);
      const pass = (dx, dy, col) => {
        c.fillStyle = col;
        for (let i = 0; i < str.length; i++) {
          const g = GLYPH[str[i]] || GLYPH['?'];
          for (let r = 0; r < 5; r++) for (let b = 0; b < 3; b++) if (g[r] & (4 >> b)) c.fillRect(x0 + (i * 4 + b) * s + dx, y + r * s + dy, s, s);
        }
      };
      if (o.shadow) pass(s, s, o.shadow === true ? 'rgba(0,0,0,0.6)' : o.shadow);
      pass(0, 0, o.color || PAL.offWhite);
    },
  };
  const font = () => (S.font && typeof S.font.draw === 'function' ? S.font : miniFont);
  function txt(c, text, x, y, o) { if (text === undefined || text === null || text === '') return; font().draw(c, String(text), x, y, o || {}); }
  const txtW = (text, scale) => { const f = font(); return f.width ? f.width(String(text || ''), scale || 1) : miniFont.width(text, scale); };

  /* ── 5. Registry and dispatch ────────────────────────────────────── */
  const defs = Object.create(null);
  const warned = new Set();
  const warnOnce = (key, msg) => { if (warned.has(key)) return; warned.add(key); try { console.warn('[story/pieces] ' + msg); } catch (_) { /* no console */ } };
  const failedTypes = new Set();
  // Keeps one broken piece type from flooding S.fail every frame.
  function guarded(type, fn) {
    try { fn(); } catch (e) {
      if (!failedTypes.has(type)) { failedTypes.add(type); fail(e, 'piece ' + type); }
    }
  }
  function resetCtx(c) { c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }

  const pieces = S.pieces = {
    defs,
    pal: PAL,
    define(type, def) {
      if (!type || !def || typeof def.draw !== 'function') throw new Error('pieces.define(' + type + '): draw(ctx, p, L, bake) is required');
      defs[type] = def;
      return def;
    },
    has: (type) => !!defs[type],
    types: () => Object.keys(defs).sort(),
    isAnimated: (p) => !!(p && defs[p.t] && defs[p.t].animated),
    // `when` is evaluated against S.G; world.js also checks it at bake time.
    active(p) {
      if (!p || !p.when) return true;
      try { return !!p.when(S.G); } catch (e) { fail(e, 'piece when ' + p.t); return false; }
    },
    // Full draw. With bake=true only the static part; otherwise the animated part follows at S.time.
    draw(ctx, p, L, bake) {
      if (S.headless || !ctx || !p || !pieces.active(p)) return;
      const d = defs[p.t];
      L = L || {};
      if (!d) {
        warnOnce('type:' + p.t, 'unknown piece type "' + p.t + '"');
        const gy = gyOf(p, L);
        R(ctx, (+p.x || 0) - 4, gy - 8, 8, 8, '#ff00ff');
        return;
      }
      guarded(p.t, () => {
        d.draw(ctx, p, L, !!bake);
        resetCtx(ctx);
        if (!bake && d.animated && d.drawAnimated) d.drawAnimated(ctx, p, L, S.time || 0);
      });
      resetCtx(ctx);
    },
    // Per-frame part of an animated piece (world.js calls this over the baked layer).
    drawAnimated(ctx, p, L, time) {
      if (S.headless || !ctx || !p || !pieces.active(p)) return;
      const d = defs[p.t];
      if (!d || !d.animated || !d.drawAnimated) return;
      guarded(p.t, () => d.drawAnimated(ctx, p, L || {}, time === undefined ? S.time || 0 : time));
      resetCtx(ctx);
    },
    // Lights in the piece's layer coordinates. Pure data, so it also runs headless.
    lights(p, L) {
      if (!p || !pieces.active(p)) return [];
      const d = defs[p.t];
      if (!d || !d.lights) return [];
      try { return d.lights(p, L || {}) || []; } catch (e) { fail(e, 'piece lights ' + p.t); return []; }
    },
    // Helpers exported for world.js / chapters (see notes): colour and drawing kit.
    util: { rgb, mix, rgba, shade, ramp, mute, R, Px, RA, line, cable, ellipse, box, speckle, contact, streaks, vbands, txt, txtW, hash },
    font: miniFont,
  };

  /* ── 6. Material helpers: walls, windows, doors, paper, people ───── */

  // Visible brickwork in a few ragged patches only; the rest stays a broad wall colour.
  function brickPatches(c, x, y, w, h, r, seed, n) {
    for (let k = 0; k < n; k++) {
      const pw = 14 + Math.floor(hash(seed + k * 7.7) * 34), ph = 9 + Math.floor(hash(seed + k * 8.8) * 20);
      const px0 = x + Math.floor(hash(seed + k * 9.9) * Math.max(1, w - pw));
      const py0 = y + Math.floor(hash(seed + k * 10.1) * Math.max(1, h - ph));
      const cy0 = y + Math.floor((py0 - y) / 3) * 3;
      for (let row = 0; row * 3 < ph; row++) {
        const yy = cy0 + row * 3;
        if (yy + 3 > y + h) break;
        const course = Math.floor((yy - y) / 3), off = (course % 2) * 3;
        const t = (row * 3 + 1.5) / ph, shapeK = Math.sqrt(Math.max(0, 1 - (2 * t - 1) * (2 * t - 1)));
        const rw = Math.round(pw * (0.4 + 0.6 * shapeK) + (hash(seed + k * 3 + row * 1.3) - 0.5) * 6);
        const rx0 = Math.round(px0 + (pw - rw) / 2 + (hash(seed + k + row * 2.9) - 0.5) * 4);
        if (rw < 4) continue;
        R(c, rx0, yy, rw, 1, r[1]);
        for (let bx = x + off + Math.floor((rx0 - x - off) / 6) * 6; bx < rx0 + rw; bx += 6) {
          if (bx >= rx0) R(c, bx, yy + 1, 1, 2, r[1]);
          const hv = hash(seed + bx * 0.37 + yy * 1.91), x1 = Math.max(bx + 1, rx0), x2 = Math.min(bx + 6, rx0 + rw);
          if (x2 <= x1) continue;
          if (hv < 0.16) R(c, x1, yy + 1, x2 - x1, 2, r[3]);
          else if (hv < 0.3) R(c, x1, yy + 1, x2 - x1, 2, r[1]);
          else if (hv < 0.38) R(c, x1, yy + 1, x2 - x1, 1, r[3]);
          else if (hv < 0.42) R(c, x1, yy + 1, x2 - x1, 2, r[0]);
        }
      }
    }
  }
  // A wall surface: broad colour, quiet tonal patches, selective pattern, soot and grime.
  function wallFill(c, x, y, w, h, style, seed, opt) {
    opt = opt || {};
    const r = styleRamp(style);
    R(c, x, y, w, h, r[2]);
    const nb = 2 + Math.floor(w / 80);
    for (let i = 0; i < nb; i++) {
      const bw = 16 + hash(seed + i * 3.3) * w * 0.45, bx = x + hash(seed + i * 1.9) * Math.max(1, w - bw);
      const by = y + hash(seed + i * 2.2) * h * 0.7, bh = h * (0.15 + 0.5 * hash(seed + i * 4.4));
      RA(c, bx, by, bw, Math.min(bh, y + h - by), hash(seed + i * 5.5) < 0.55 ? r[3] : r[1], 0.3);
    }
    const st = String(style || 'brick');
    if (st.indexOf('brick') === 0 || st[0] === '#') {
      brickPatches(c, x, y, w, h, r, seed, opt.patches !== undefined ? opt.patches : Math.max(1, Math.round((w * h) / 5200)));
    } else if (st === 'siding') {
      for (let yy = y + 3; yy < y + h; yy += 4) { R(c, x, yy, w, 1, r[1]); RA(c, x, yy + 1, w, 1, r[3], 0.5); }
      for (let i = 0; i < Math.floor(w / 30); i++) R(c, x + Math.floor(hash(seed + i * 2.1) * w), y, 1, h, r[1]);
      speckle(c, x, y, w, h, r[4], Math.floor((w * h) / 160), seed + 3, true);
    } else if (st === 'stone') {
      for (let k = 0; k < Math.max(1, Math.round((w * h) / 6000)); k++) {
        const px0 = x + hash(seed + k * 3.7) * Math.max(1, w - 40), py0 = y + hash(seed + k * 5.1) * Math.max(1, h - 24);
        for (let yy = Math.floor(py0 / 7) * 7; yy < py0 + 24; yy += 7) {
          R(c, px0, yy, 40, 1, r[1]);
          for (let bx = px0 + ((yy / 7) % 2) * 7; bx < px0 + 40; bx += 14) { R(c, bx, yy + 1, 1, 6, r[1]); R(c, bx + 1, yy + 1, 12, 1, r[3]); }
        }
      }
    } else if (st === 'concrete') {
      for (let xx = x + 31; xx < x + w; xx += 32) { R(c, xx, y, 1, h, r[1]); RA(c, xx + 1, y, 1, h, r[3], 0.4); }
      for (let yy = y + 23; yy < y + h; yy += 24) R(c, x, yy, w, 1, r[1]);
      for (let xx = x + 8; xx < x + w; xx += 16) for (let yy = y + 6; yy < y + h; yy += 12) Px(c, xx, yy, r[1]);
    } else if (st === 'plaster') {
      for (let i = 0; i < Math.floor(w / 60) + 1; i++) {
        let cx = x + hash(seed + i * 3.9) * w, cy = y + hash(seed + i * 4.7) * h * 0.6;
        for (let s = 0; s < 10; s++) { const nx = cx + (hash(seed + i + s * 1.1) - 0.5) * 6, ny = cy + 3; line(c, cx, cy, nx, ny, r[1]); cx = nx; cy = ny; }
      }
    } else if (st === 'wood') {
      for (let xx = x; xx < x + w; xx += 6) { R(c, xx, y, 1, h, r[1]); if (hash(seed + xx) < 0.3) R(c, xx + 2, y, 1, h, r[3]); }
    }
    if (opt.soot !== false) for (let i = 0; i < 4; i++) RA(c, x, y + i * 2, w, 2, r[0], 0.28 - i * 0.06);
    if (opt.grime !== false) { RA(c, x, y + h - 12, w, 12, r[0], 0.18); RA(c, x, y + h - 4, w, 4, r[0], 0.25); }
    streaks(c, x, y + 2, w, h * 0.45, r[1], Math.floor(w / 16), seed + 9, 0.35);
  }

  const SASH = ['#3c3a36', '#55524b', '#6e6a60', '#878175', '#9d968a'];
  const CURTAINS = ['#6a3b33', '#5c5a38', '#3f5562', '#6b5a3c', '#5e4155', '#4b5a48'];
  // One window: lintel, recess, sash, glass/interior, sill, optional AC unit or plant.
  function drawWin(c, x, y, w, h, o) {
    o = o || {};
    const s = o.seed || 0, fr = colorRamp(o.frame, PAL.stone), sash = o.sash ? colorRamp(o.sash) : SASH;
    if (o.lintel !== false) { R(c, x - 1, y - 3, w + 2, 2, fr[3]); R(c, x - 1, y - 1, w + 2, 1, fr[1]); }
    R(c, x, y, w, h, PAL.ink);
    const gx = x + 1, gy = y + 1, gw = w - 2, gh = h - 2;
    if (o.boarded) {
      const pw = PAL.woodPale;
      R(c, x, y, w, h, pw[1]);
      for (let yy = y; yy < y + h; yy += 4) { R(c, x, yy, w, 1, pw[0]); R(c, x, yy + 1, w, 1, pw[3]); }
      for (let i = 0; i < 2; i++) { const yy = y + 2 + Math.floor(hash(s + i) * (h - 4)); line(c, x, yy, x + w - 1, Math.min(y + h - 1, yy + 3), pw[2]); }
      Px(c, x + 1, y + 1, PAL.iron[3]); Px(c, x + w - 2, y + 1, PAL.iron[3]); Px(c, x + 1, y + h - 2, PAL.iron[3]); Px(c, x + w - 2, y + h - 2, PAL.iron[3]);
      RA(c, x, y + h - 3, w, 3, PAL.ink, 0.3);
    } else if (o.lit) {
      const a = PAL.amber, warmTop = o.litColor ? ramp(o.litColor) : a;
      vbands(c, gx, gy, gw, gh, warmTop[4], warmTop[2], 4);
      R(c, gx, gy, gw, 1, warmTop[1]);
      const kind = o.interior !== undefined ? o.interior : Math.floor(hash(s + 1.5) * 5);
      if (o.curtains || kind === 0) {
        const cc = ramp(CURTAINS[Math.floor(hash(s + 2.5) * CURTAINS.length)]);
        R(c, gx, gy, Math.max(2, Math.floor(gw * 0.3)), gh, cc[3]); R(c, gx + gw - Math.max(2, Math.floor(gw * 0.3)), gy, Math.max(2, Math.floor(gw * 0.3)), gh, cc[3]);
        R(c, gx + Math.max(2, Math.floor(gw * 0.3)) - 1, gy, 1, gh, cc[2]); R(c, gx + gw - Math.max(2, Math.floor(gw * 0.3)), gy, 1, gh, cc[2]);
        R(c, gx, gy, gw, 2, cc[2]);
      } else if (kind === 1) {
        for (let yy = gy + 1; yy < gy + gh * 0.7; yy += 2) R(c, gx, yy, gw, 1, a[2]);
        R(c, gx, gy + Math.floor(gh * 0.7), gw, 1, a[1]);
      } else if (kind === 2) {
        R(c, gx + Math.floor(gw * 0.6), gy + gh - 7, 3, 4, a[1]); R(c, gx + Math.floor(gw * 0.6) - 1, gy + gh - 9, 5, 2, a[0]);
      } else if (kind === 3 && gw > 6) {
        R(c, gx + 2, gy + gh - 9, 3, 9, '#5a3a2c'); R(c, gx + 1, gy + gh - 12, 5, 4, '#5a3a2c');
      }
      if (o.tv) { RA(c, gx, gy, gw, gh, PAL.tvBlue, 0.45); }
    } else if (o.broken) {
      R(c, gx, gy, gw, gh, PAL.glass[0]);
      const hx0 = gx + Math.floor(gw * (0.2 + 0.4 * hash(s + 3))), hy0 = gy + Math.floor(gh * (0.2 + 0.4 * hash(s + 4)));
      ellipse(c, hx0 + 2, hy0 + 2, Math.max(2, Math.floor(gw * 0.3)), Math.max(2, Math.floor(gh * 0.25)), PAL.ink);
      for (let i = 0; i < 4; i++) line(c, hx0 + 2, hy0 + 2, gx + Math.floor(hash(s + i * 1.7) * gw), gy + (i % 2 ? gh - 1 : 0), PAL.glass[3]);
      R(c, gx, gy, gw, 1, PAL.glass[4]);
    } else {
      R(c, gx, gy, gw, gh, PAL.glass[1]);
      RA(c, gx, gy, gw, Math.floor(gh / 2), PAL.glass[2], 0.6);
      for (let i = 0; i < Math.min(gw, gh); i += 1) if ((i + Math.floor(hash(s) * 3)) % 5 < 2) Px(c, gx + gw - 1 - i, gy + i, PAL.glass[3]);
      if (o.curtains) { const cc = ramp(CURTAINS[Math.floor(hash(s + 2.5) * CURTAINS.length)]); R(c, gx, gy, 2, gh, cc[0]); R(c, gx + gw - 2, gy, 2, gh, cc[0]); }
      if (o.tv) RA(c, gx, gy + Math.floor(gh / 2), gw, Math.ceil(gh / 2), PAL.tvBlue, 0.22);
    }
    if (!o.boarded && o.mullions !== false) {
      const rail = y + Math.floor(h / 2);
      R(c, x, y, w, 1, sash[1]); R(c, x, y, 1, h, sash[2]); R(c, x + w - 1, y, 1, h, sash[1]);
      R(c, x, rail, w, 1, sash[3]);
      if (w >= 12 && o.panes !== 1) R(c, x + Math.floor(w / 2), y, 1, rail - y, sash[2]);
    }
    if (o.sill !== false) { R(c, x - 2, y + h, w + 4, 1, fr[4]); R(c, x - 2, y + h + 1, w + 4, 1, fr[1]); RA(c, x - 1, y + h + 2, w + 2, 2, PAL.ink, 0.22); }
    if (o.ac) {
      const ax = x + Math.floor(w / 2) - 5, ay = y + h - 5;
      box(c, ax, ay, 10, 6, ['#3e3c37', '#57534b', '#6d685e', '#837d70', '#968f80']);
      for (let i = 1; i < 9; i += 2) Px(c, ax + i, ay + 2, '#3e3c37');
      streaks(c, ax + 4, ay + 7, 2, 14, PAL.ink, 2, s + 8, 0.3);
    } else if (o.plant) {
      R(c, x + 1, y + h - 3, 4, 3, '#6a4030'); R(c, x, y + h - 6, 6, 3, '#3f5a3a'); Px(c, x + 2, y + h - 7, '#5c7a4e'); Px(c, x + 4, y + h - 7, '#4d6b44');
    }
  }

  // A door with its frame. x = left edge, gy = threshold line.
  function drawDoor(c, x, gy, w, h, o) {
    o = o || {};
    const kind = o.kind || 'wood', s = o.seed || 0;
    const top = gy - h;
    const base = o.color ? colorRamp(o.color) : kind === 'metal' ? PAL.metal : kind === 'glass' || kind === 'roll' ? PAL.steel : ramp('#4a3a30');
    // frame / casing
    R(c, x - 2, top - 3, w + 4, 3, PAL.stone[3]); R(c, x - 2, top - 1, w + 4, 1, PAL.stone[1]);
    R(c, x - 2, top, 2, h, PAL.stone[2]); R(c, x + w, top, 2, h, PAL.stone[1]);
    if (o.open) {
      vbands(c, x, top, w, h, PAL.ink, o.lit ? PAL.amber[1] : PAL.plum, 5);
      if (o.lit) { RA(c, x + 2, top + 4, w - 4, h - 4, PAL.amber[3], 0.35); }
      R(c, x + w - 3, top, 3, h, base[1]); R(c, x + w - 3, top, 1, h, base[3]);
    } else if (kind === 'roll') {
      R(c, x, top, w, h, base[2]);
      for (let yy = top; yy < gy; yy += 3) { R(c, x, yy, w, 1, base[3]); R(c, x, yy + 2, w, 1, base[1]); }
      R(c, x, gy - 3, w, 3, base[0]); R(c, x + Math.floor(w / 2) - 2, gy - 6, 4, 2, PAL.iron[3]);
      if (o.graffiti !== false && w > 20) graffitiTag(c, x + 3, top + Math.floor(h * 0.4), w - 6, s + 3);
      speckle(c, x, top, w, h, PAL.rust[2], Math.floor(w * h / 60), s + 1, true);
    } else if (kind === 'glass') {
      R(c, x, top, w, h, base[2]);
      const lit = !!o.lit;
      R(c, x + 2, top + 2, w - 4, h - 8, lit ? PAL.amber[3] : PAL.glass[1]);
      if (!lit) {
        for (let i = 0; i < Math.min(w, h) - 6; i++) if (i % 6 < 2) Px(c, x + w - 3 - i, top + 2 + i, PAL.glass[3]);
      } else RA(c, x + 2, top + 2, w - 4, 3, PAL.amber[4], 0.6);
      R(c, x + 2, top + Math.floor(h * 0.55), w - 4, 2, base[3]);
      R(c, x + 2, gy - 6, w - 4, 4, base[1]);
      if (o.hours !== false) R(c, x + 3, top + 4, 4, 3, lit ? PAL.amber[1] : PAL.paper[2]);
      if (w > 30) R(c, x + Math.floor(w / 2), top, 1, h, base[0]);
    } else if (kind === 'metal') {
      box(c, x, top, w, h, base);
      R(c, x + 2, top + 3, w - 4, 1, base[1]); R(c, x + 2, gy - 8, w - 4, 1, base[1]);
      R(c, x + w - 5, top + Math.floor(h * 0.5), 3, 2, PAL.steel[4]);
      for (let i = 0; i < 3; i++) Px(c, x + 2, top + 6 + i * Math.floor((h - 10) / 2), base[4]);
      speckle(c, x + 1, top + h * 0.6, w - 2, h * 0.4, PAL.rust[1], Math.floor(w / 2), s + 2, true);
      if (o.sign) { R(c, x + 3, top + 6, w - 6, 5, PAL.offWhite); txt(c, o.sign, x + Math.floor(w / 2), top + 6, { align: 'center', color: PAL.fadedRed }); }
    } else {
      // wood (and the leaves of a double door): raised panels, knob, kick plate
      const leaves = kind === 'double' ? 2 : 1, lw = Math.floor(w / leaves);
      for (let l = 0; l < leaves; l++) {
        const lx = x + l * lw, ww = l === leaves - 1 ? w - l * lw : lw;
        box(c, lx, top, ww, h, base);
        const pw = ww - 6, ph = Math.floor((h - 10) / 2) - 1;
        for (let k = 0; k < 2; k++) {
          const py = top + 3 + k * (ph + 3);
          R(c, lx + 3, py, pw, ph, base[1]); R(c, lx + 4, py + 1, pw - 2, ph - 2, base[2]);
          R(c, lx + 3, py + ph - 1, pw, 1, base[3]);
        }
        if (o.window !== false && h > 30 && leaves === 1 && o.kind !== 'double') { R(c, lx + 4, top + 4, pw - 2, 7, o.lit ? PAL.amber[3] : PAL.glass[1]); R(c, lx + 4, top + 4, pw - 2, 1, base[0]); }
        const kx = leaves === 2 ? (l === 0 ? lx + ww - 3 : lx + 2) : lx + ww - 4;
        Px(c, kx, top + Math.floor(h * 0.55), '#b8964f'); Px(c, kx, top + Math.floor(h * 0.55) + 1, '#6e5530');
        R(c, lx + 1, gy - 4, ww - 2, 3, base[0]);
      }
      if (!o.fresh) { speckle(c, x, top, w, h, base[1], Math.floor(w * h / 50), s + 5, true); RA(c, x, gy - 10, w, 10, PAL.ink, 0.15); }
      else { R(c, x, top, w, 1, base[4]); }
    }
    R(c, x - 3, gy, w + 6, 1, PAL.stone[3]); RA(c, x - 3, gy + 1, w + 6, 1, PAL.ink, 0.3);
    if (o.label) {
      const lw = txtW(o.label) + 4, lx = x + Math.floor(w / 2) - Math.floor(lw / 2);
      R(c, lx, top - 10, lw, 7, PAL.iron[1]); txt(c, o.label, lx + 2, top - 9, { color: PAL.cream });
    }
  }

  function graffitiTag(c, x, y, w, seed) {
    const cols = ['#5d4a6b', '#6b3b3b', '#3f5f6b', '#7a6a3a', '#4a5a4a'];
    const col = cols[Math.floor(hash(seed) * cols.length)], col2 = cols[Math.floor(hash(seed + 1) * cols.length)];
    let px = x, py = y + 4;
    for (let i = 0; i < w; i++) {
      const ny = y + 2 + Math.round(Math.sin(i * 0.9 + seed) * 2 + (hash(seed + i * 0.7) - 0.5) * 3);
      line(c, px, py, x + i, ny, col); px = x + i; py = ny;
      if (hash(seed + i * 1.3) < 0.15) line(c, x + i, y - 1, x + i + 1, y + 6, col);
    }
    line(c, x, y + 7, x + w - 1, y + 6, col2);
  }

  // Paper rows with a torn corner; returns per-row [x0, x1] so content can be clipped.
  function paperRows(x, y, w, h, torn, seed) {
    const rows = [];
    const tear = torn ? (typeof torn === 'number' ? torn : 0.45) : 0;
    const corner = Math.floor(hash(seed + 11) * 4);
    for (let r = 0; r < h; r++) {
      let x0 = x, x1 = x + w;
      if (tear) {
        const ty = corner < 2 ? r : h - 1 - r, depth = Math.floor(w * tear * (1 - ty / (h * 0.7)) + (hash(seed + r * 0.9) - 0.5) * 3);
        if (depth > 0) { if (corner % 2 === 0) x0 = x + depth; else x1 = x + w - depth; }
      }
      if (x1 - x0 > 0) rows.push([r + y, x0, x1]);
    }
    return rows;
  }
  function clipRows(c, rows) { c.beginPath(); for (const [yy, x0, x1] of rows) c.rect(x0, yy, x1 - x0, 1); c.clip(); }
  const POSTER_KINDS = ['boxing', 'concert', 'missing', 'notice', 'ad', 'jin_fight'];
  function drawPoster(c, x, y, w, h, kind, torn, text, seed) {
    // older layers of paper underneath, peeking out
    for (let i = 0; i < 2; i++) {
      const ox = Math.floor((hash(seed + i * 3.3) - 0.5) * 6), oy = Math.floor((hash(seed + i * 4.4) - 0.5) * 6);
      const rows = paperRows(x + ox, y + oy, w, h, 0.7, seed + i * 9);
      for (const [yy, x0, x1] of rows) R(c, x0, yy, x1 - x0, 1, i ? PAL.paper[1] : PAL.paper[0]);
    }
    const rows = paperRows(x, y, w, h, torn, seed);
    c.save(); clipRows(c, rows);
    const t = (text || '').toString();
    if (kind === 'boxing' || kind === 'jin_fight') {
      const band = kind === 'jin_fight' ? '#3a5274' : PAL.fadedRed;
      R(c, x, y, w, h, '#a39574'); R(c, x, y, w, Math.max(6, Math.floor(h * 0.26)), band);
      txt(c, t || (kind === 'jin_fight' ? 'SEO' : 'FIGHT'), x + Math.floor(w / 2), y + 1, { align: 'center', color: '#e1d6b8' });
      // two small fighter silhouettes facing each other
      const fy = y + Math.floor(h * 0.32), fh = Math.floor(h * 0.42);
      for (let k = 0; k < 2; k++) {
        const fx = x + (k ? w - Math.floor(w * 0.36) : Math.floor(w * 0.12)), fw = Math.max(3, Math.floor(w * 0.24));
        R(c, fx + 1, fy, fw - 2, 3, '#2a2224'); R(c, fx, fy + 3, fw, fh - 3, '#2a2224');
        R(c, k ? fx - 2 : fx + fw - 1, fy + 4, 3, 3, kind === 'jin_fight' && !k ? '#3a5274' : PAL.fadedRed);
      }
      R(c, x + 2, y + h - 6, w - 4, 1, '#5a4c3c'); R(c, x + 3, y + h - 4, w - 6, 1, '#5a4c3c');
    } else if (kind === 'concert') {
      const bg = ['#3b3346', '#2f4448', '#4a3a2c'][Math.floor(hash(seed + 2) * 3)];
      R(c, x, y, w, h, bg);
      ellipse(c, x + Math.floor(w / 2), y + Math.floor(h * 0.45), Math.floor(w * 0.3), Math.floor(w * 0.3), PAL.fadedYellow);
      R(c, x + Math.floor(w / 2) - 1, y + Math.floor(h * 0.25), 2, Math.floor(h * 0.45), '#2a2224');
      txt(c, t || 'LIVE', x + Math.floor(w / 2), y + h - 7, { align: 'center', color: '#c9a7a0' });
    } else if (kind === 'missing') {
      R(c, x, y, w, h, '#b9b29e');
      txt(c, t || 'MISSING', x + Math.floor(w / 2), y + 1, { align: 'center', color: '#6e2a24' });
      R(c, x + Math.floor(w * 0.25), y + 8, Math.ceil(w * 0.5), Math.floor(h * 0.35), '#6f6a60');
      R(c, x + Math.floor(w / 2) - 2, y + 10, 4, 4, '#4a4642'); R(c, x + Math.floor(w / 2) - 3, y + 14, 6, 4, '#4a4642');
      for (let yy = y + 10 + Math.floor(h * 0.35); yy < y + h - 2; yy += 2) R(c, x + 2, yy, w - 4 - (yy % 4), 1, '#7a7466');
    } else if (kind === 'notice') {
      R(c, x, y, w, h, '#bdb5a0');
      if (t) txt(c, t, x + 2, y + 2, { color: '#3a3430' });
      for (let yy = y + (t ? 9 : 3); yy < y + h - 2; yy += 2) R(c, x + 2, yy, Math.floor((w - 4) * (0.5 + 0.5 * hash(seed + yy))), 1, '#56504a');
    } else {
      const bg = ['#5f7a6a', '#8a5a3a', '#4d5f7a', '#7a6a44'][Math.floor(hash(seed + 5) * 4)];
      R(c, x, y, w, h, bg); R(c, x, y + h - 7, w, 7, '#d0c4a2');
      R(c, x + Math.floor(w / 2) - 2, y + 4, 4, Math.floor(h * 0.45), '#d0c4a2'); R(c, x + Math.floor(w / 2) - 1, y + 2, 2, 2, '#d0c4a2');
      txt(c, t || 'COLA', x + Math.floor(w / 2), y + h - 6, { align: 'center', color: '#5a3a2a' });
    }
    // fading and dirt
    RA(c, x, y, w, h, '#6a6a70', 0.18);
    speckle(c, x, y, w, h, PAL.paper[4], Math.floor(w * h / 30), seed + 7);
    speckle(c, x, y, w, h, PAL.paper[0], Math.floor(w * h / 40), seed + 8);
    RA(c, x, y + h - 4, w, 4, PAL.ink, 0.15);
    c.restore();
    // curled tear edge highlight and staples
    if (torn) for (const [yy, x0, x1] of rows) if (x0 > x || x1 < x + w) { if (x0 > x) Px(c, x0, yy, PAL.paper[4]); else Px(c, x1 - 1, yy, PAL.paper[4]); }
    Px(c, x + 1, y + 1, PAL.steel[4]); Px(c, x + w - 2, y + 1, PAL.steel[4]);
  }

  // Tiny people for crowds, photos and TV screens. Upper body only when `bust`.
  function person(c, x, gy, h, col, o) {
    o = o || {};
    const hw = Math.max(2, Math.round(h * 0.13)), sw = Math.max(4, Math.round(h * 0.34));
    const headY = gy - h, skin = o.skin || '#7a5a48';
    R(c, x - hw, headY, hw * 2, hw * 2 + 1, skin);
    R(c, x - hw, headY, hw * 2, Math.max(1, Math.round(hw * 0.8)), o.hair || '#241c18');
    const by = headY + hw * 2 + 1;
    R(c, x - Math.floor(sw / 2), by, sw, gy - by, col);
    R(c, x - Math.floor(sw / 2), by, 1, gy - by, shade(col, 0.12));
    if (o.armsUp) { R(c, x - Math.floor(sw / 2) - 1, headY - 2, 2, by - headY + 4, col); R(c, x + Math.floor(sw / 2) - 1, headY - 3, 2, by - headY + 5, col); Px(c, x - Math.floor(sw / 2) - 1, headY - 3, skin); Px(c, x + Math.floor(sw / 2), headY - 4, skin); }
  }

  /* ── 7. Architecture and street pieces ───────────────────────────── */
  const def = (type, d) => pieces.define(type, d);
  const TANK = ['#29231f', '#3a312a', '#4b4036', '#5e5245', '#716455'];

  function fireEscape(c, x, w, yTop, floors, floorH, seed, drop) {
    const ir = PAL.iron;
    for (let f = 0; f < floors; f++) {
      const py = Math.round(yTop + f * floorH);
      if (f < floors - 1) {
        // switchback stair down to the next landing
        const dir = f % 2 ? 1 : -1, sx0 = dir > 0 ? x + 3 : x + w - 4, sx1 = dir > 0 ? x + w - 12 : x + 11, ny = Math.round(yTop + (f + 1) * floorH);
        line(c, sx0, py + 2, sx1, ny - 1, ir[1]); line(c, sx0, py + 4, sx1, ny + 1, ir[1]);
        const steps = Math.max(3, Math.floor((ny - py) / 4));
        for (let s = 1; s < steps; s++) { const t = s / steps, xx = Math.round(lerp(sx0, sx1, t)), yy = Math.round(lerp(py + 3, ny, t)); R(c, xx - 1, yy, 3, 1, ir[3]); }
        line(c, sx0, py - 7, sx1, ny - 9, ir[2]);
      }
      R(c, x, py, w, 2, ir[2]); R(c, x, py, w, 1, ir[3]); RA(c, x, py + 2, w, 2, PAL.ink, 0.35);
      line(c, x + 2, py + 2, x + 6, py + 6, ir[1]); line(c, x + w - 3, py + 2, x + w - 7, py + 6, ir[1]);
      R(c, x, py - 9, w, 1, ir[3]); R(c, x, py - 5, w, 1, ir[1]);
      for (let xx = x; xx < x + w; xx += 3) R(c, xx, py - 8, 1, 8, ir[1]);
      R(c, x, py - 9, 1, 9, ir[3]); R(c, x + w - 1, py - 9, 1, 9, ir[2]);
      if (hash(seed + f) < 0.35) { R(c, x + 4 + Math.floor(hash(seed + f * 2) * (w - 12)), py - 5, 4, 5, '#4a3a2c'); Px(c, x + 6 + Math.floor(hash(seed + f * 2) * (w - 12)), py - 7, '#4d6b44'); }
      speckle(c, x, py - 9, w, 11, PAL.rust[1], Math.floor(w / 6), seed + f * 3, false);
    }
    if (drop) {
      const by = Math.round(yTop + (floors - 1) * floorH), lx = x + Math.floor(w * 0.5);
      R(c, lx, by + 2, 1, drop, ir[2]); R(c, lx + 6, by + 2, 1, drop, ir[2]);
      for (let yy = by + 5; yy < by + drop; yy += 4) R(c, lx, yy, 7, 1, ir[3]);
    }
  }
  function waterTank(c, cx, by, seed) {
    const ir = PAL.iron;
    // steel legs and cross bracing
    for (const lx of [-9, -3, 3, 9]) R(c, cx + lx, by - 10, 1, 10, ir[2]);
    line(c, cx - 9, by - 9, cx + 9, by - 1, ir[1]); line(c, cx + 9, by - 9, cx - 9, by - 1, ir[1]);
    R(c, cx - 11, by - 11, 22, 2, ir[3]);
    // stave body with iron hoops
    const tx = cx - 11, ty = by - 30;
    R(c, tx, ty, 22, 19, TANK[2]);
    for (let xx = tx + 1; xx < tx + 22; xx += 3) R(c, xx, ty, 1, 19, TANK[1]);
    R(c, tx, ty, 2, 19, TANK[3]); R(c, tx + 19, ty, 3, 19, TANK[0]);
    for (const hy of [3, 9, 15]) { R(c, tx, ty + hy, 22, 1, ir[2]); Px(c, tx + 3, ty + hy, ir[3]); }
    // conical roof and finial
    for (let i = 0; i < 7; i++) R(c, cx - 11 + i * 1.5, ty - i, 22 - i * 3, 1, i < 2 ? TANK[3] : TANK[2]);
    R(c, cx, ty - 9, 1, 3, ir[3]);
    speckle(c, tx, ty, 22, 19, TANK[4], 6, seed, false);
  }
  function antenna(c, x, by, h, seed) {
    const ir = PAL.iron;
    R(c, x, by - h, 1, h, ir[3]);
    for (let i = 0; i < 4; i++) {
      const yy = by - h + 2 + i * 4, hw = 9 - i * 2 + Math.floor(hash(seed + i) * 2);
      R(c, x - hw, yy, hw * 2 + 1, 1, ir[3]);
      for (let k = -hw; k <= hw; k += 3) R(c, x + k, yy - 1, 1, 3, ir[2]);
    }
    line(c, x, by - h + 4, x - 14, by, ir[1]);
  }
  function cornice(c, x, top, w, r) {
    R(c, x - 2, top, w + 4, 2, r[4]); R(c, x - 2, top + 2, w + 4, 1, r[3]);
    for (let xx = x - 1; xx < x + w + 1; xx += 3) R(c, xx, top + 3, 2, 2, r[3]);
    R(c, x - 1, top + 3, w + 2, 1, r[1]); R(c, x - 1, top + 5, w + 2, 1, r[1]);
    RA(c, x, top + 6, w, 3, PAL.ink, 0.35);
  }

  function bLayout(p, L) {
    const gy = gyOf(p, L), w = +p.w || 120, h = +p.h || 150, x = +p.x || 0, top = gy - h;
    // ground floor tall enough for a 54 px door under a 46 px figure (upper floors stay compressed)
    const shop = p.shop || null, shopH = shop ? clamp(Math.round(h * 0.36), 70, 78) : 0;
    const corn = p.cornice === false ? 2 : 8, groundH = shop ? shopH : 62;
    const avail = Math.max(0, h - groundH - corn);
    const floors = Math.max(0, p.floors !== undefined ? Math.max(0, +p.floors - 1) : Math.round(avail / 44));
    const fh = floors ? avail / floors : 0;
    const win = p.windows || {};
    const cols = Math.max(1, win.cols !== undefined ? +win.cols : Math.max(1, Math.floor(w / 32)));
    const ww = clamp(win.w || Math.floor((w / cols) * 0.42), 8, 16), wh = clamp(win.h || 20, 10, Math.max(10, Math.floor(fh * 0.6)));
    const seed = win.seed !== undefined ? +win.seed * 3.1 + 0.5 : seedOf(p, 1);
    const lit = win.lit !== undefined ? +win.lit : 0.3;
    const wins = [];
    const add = (wx, wy, f, k) => {
      const hv = hash(seed + f * 13.1 + k * 3.7), hv2 = hash(seed + f * 5.3 + k * 9.1);
      const o = { x: Math.round(wx), y: Math.round(wy), w: ww, h: wh, f, k, seed: seed + f * 7 + k, lit: hv < lit };
      if (win.boarded && hv2 < win.boarded) o.boarded = true;
      else if (win.broken && hv2 < (win.boarded || 0) + win.broken) o.broken = true;
      o.ac = !o.boarded && hash(seed + f * 2.3 + k) < (win.ac !== undefined ? win.ac : 0.14);
      o.plant = !o.ac && o.lit && hash(seed + f * 4.1 + k) < 0.2;
      o.curtains = hash(seed + f * 6.1 + k * 1.1) < (win.curtains !== undefined ? win.curtains : 0.5);
      o.tv = o.lit && hash(seed + f * 8.3 + k * 2.2) < 0.15;
      o.sash = hash(seed + f * 3.9 + k * 4.4) < 0.25 ? '#4a5a4c' : null; // mismatched replacement sash
      wins.push(o);
    };
    for (let f = 0; f < floors; f++) {
      const fy = top + corn + f * fh, wy = fy + (fh - wh) * 0.45;
      for (let k = 0; k < cols; k++) add(x + (w / cols) * (k + 0.5) - ww / 2, wy, f, k);
    }
    const door = Object.assign({ dx: shop ? w - 28 : Math.floor(w / 2) - 11, kind: shop ? 'glass' : 'wood', w: 22, h: 54 }, p.door || {});
    if (!shop && floors >= 0) {
      // ground-floor windows beside the door
      for (let k = 0; k < cols; k++) {
        const wx = x + (w / cols) * (k + 0.5) - ww / 2;
        if (wx + ww > x + door.dx - 4 && wx < x + door.dx + door.w + 4) continue;
        add(wx, gy - 48, floors, k);
      }
    }
    return { gy, x, w, h, top, shop, shopH, corn, floors, fh, cols, ww, wh, wins, seed, door };
  }

  def('building', {
    draw(c, p, L) {
      const b = bLayout(p, L), r = styleRamp(p.style || 'brick'), s = seedOf(p, 2);
      const { x, w, h, top, gy } = b;
      wallFill(c, x, top, w, h, p.style || 'brick', s);
      R(c, x, top, 1, h, r[3]); R(c, x + w - 2, top, 2, h, r[1]); R(c, x + w - 1, top, 1, h, r[0]);
      if (p.cornice !== false) cornice(c, x, top, w, p.style === 'siding' ? PAL.siding : PAL.stone);
      else { R(c, x, top, w, 2, PAL.stone[3]); RA(c, x, top + 2, w, 2, PAL.ink, 0.3); }
      // belt course above the ground floor
      const gTop = gy - (b.shop ? b.shopH : 62);
      R(c, x, gTop - 3, w, 2, PAL.stone[3]); R(c, x, gTop - 1, w, 1, PAL.stone[1]); RA(c, x, gTop, w, 2, PAL.ink, 0.25);
      for (const o of b.wins) drawWin(c, o.x, o.y, o.w, o.h, o);
      // roof furniture
      const roof = p.roof === true ? { tank: true, antenna: true } : p.roof || {};
      if (roof.tank) waterTank(c, x + Math.round(w * (roof.tankAt || 0.7)), top, s + 3);
      if (roof.antenna) antenna(c, x + Math.round(w * (roof.antennaAt || 0.22)), top, 22 + Math.floor(hash(s + 4) * 10), s + 5);
      if (roof.chimney) { box(c, x + Math.round(w * 0.45), top - 12, 8, 12, r); R(c, x + Math.round(w * 0.45) - 1, top - 13, 10, 2, PAL.stone[3]); }
      // storefront or plain ground floor
      const d = b.door;
      if (b.shop) {
        const sh = b.shop, sc = colorRamp(sh.color || PAL.fadedGreen), signY = gy - b.shopH;
        R(c, x + 2, signY, w - 4, 11, sc[1]); R(c, x + 3, signY + 1, w - 6, 9, sc[2]); R(c, x + 3, signY + 1, w - 6, 1, sc[3]);
        speckle(c, x + 3, signY + 1, w - 6, 9, sc[3], Math.floor(w / 5), s + 6, true);
        if (sh.sign) txt(c, sh.sign, x + Math.floor(w / 2), signY + 3, { align: 'center', color: sh.lit === false ? PAL.paper[2] : '#e2d6b4', shadow: sc[0] });
        const wx0 = x + 5, wx1 = x + d.dx - 4, wy0 = signY + 14, wy1 = gy - 8;
        const winKind = sh.window || 'lit';
        if (wx1 - wx0 > 6) shopWindow(c, wx0, wy0, wx1 - wx0, wy1 - wy0, winKind, s + 7, sh);
        const rx0 = x + d.dx + d.w + 4, rx1 = x + w - 5;
        if (rx1 - rx0 > 10) shopWindow(c, rx0, wy0, rx1 - rx0, wy1 - wy0, winKind, s + 8, sh);
        R(c, x + 2, gy - 8, w - 4, 8, PAL.stone[1]); R(c, x + 2, gy - 8, w - 4, 1, PAL.stone[3]);
        drawDoor(c, x + d.dx, gy, d.w, d.h, { kind: d.kind, lit: winKind === 'lit', color: d.color, label: d.label, seed: s, open: d.open, fresh: d.fresh });
        if (sh.awning) awningShape(c, x + 3, signY + 11, w - 6, typeof sh.awning === 'string' ? sh.awning : sh.color || PAL.fadedRed, sh.stripes !== false, s + 9);
      } else {
        drawDoor(c, x + d.dx, gy, d.w, d.h, { kind: d.kind, color: d.color, label: d.label, seed: s, open: d.open, fresh: d.fresh, lit: d.lit });
        R(c, x, gy - 3, w, 3, PAL.concrete[1]); R(c, x, gy - 3, w, 1, PAL.concrete[3]);
      }
      if (p.fireEscape) {
        const k = typeof p.fireEscape === 'number' ? p.fireEscape : Math.min(b.cols - 1, Math.floor(b.cols / 2));
        const fw = Math.min(w - 8, b.ww + 26), fx = clamp(Math.round(x + (w / b.cols) * (k + 0.5) - fw / 2), x + 2, x + w - fw - 2);
        if (b.floors > 0) fireEscape(c, fx, fw, top + b.corn + b.fh * 0.45 + b.wh + 3, b.floors, b.fh, s + 10, 18);
      }
      // posters on the ground floor
      (p.posters || []).forEach((po, i) => {
        const q = typeof po === 'string' ? { kind: po } : po || {};
        const pw = q.w || 14, ph = q.h || 20;
        const px0 = x + (q.dx !== undefined ? q.dx : 8 + i * 17), py0 = q.dy !== undefined ? gy - q.dy : gy - 34 + (i % 2) * 3;
        drawPoster(c, px0, py0, pw, ph, q.kind || 'boxing', q.torn !== undefined ? q.torn : i % 2 === 0, q.text, s + 20 + i * 3);
      });
    },
    lights(p, L) {
      const b = bLayout(p, L), out = [];
      for (const o of b.wins) if (o.lit && !o.boarded) out.push({ x: o.x + o.w / 2, y: o.y + o.h / 2, r: 14 + o.w, color: o.tv ? PAL.tvBlue : '#efb866', k: o.tv ? 0.6 : 0.8, flicker: o.tv ? 0.35 : 0, win: true });
      if (b.shop && (b.shop.window || 'lit') === 'lit') {
        const d = b.door, cx = b.x + Math.max(20, d.dx / 2);
        out.push({ x: cx, y: b.gy - b.shopH / 2 + 4, r: Math.max(60, Math.min(110, b.w * 0.6)), color: PAL.lamp, k: 0.85, reflect: true });
        if (b.shop.neon) out.push({ x: cx, y: b.gy - b.shopH + 22, r: 40, color: b.shop.neon === true ? PAL.neonRed : b.shop.neon, k: 0.55, flicker: 0.1 });
      }
      return out;
    },
  });

  function shopWindow(c, x, y, w, h, kind, seed, sh) {
    R(c, x - 1, y - 1, w + 2, h + 2, PAL.steel[1]);
    if (kind === 'boarded') { drawWin(c, x, y, w, h, { boarded: true, seed, lintel: false, sill: false }); return; }
    if (kind === 'dark') {
      R(c, x, y, w, h, PAL.glass[1]); RA(c, x, y, w, Math.floor(h / 2), PAL.glass[2], 0.6);
      for (let i = 0; i < w; i += 7) line(c, x + i, y + h - 1, Math.min(x + w - 1, x + i + 6), y + h - 7, PAL.glass[3]);
      if (sh && sh.closed !== false) { R(c, x + Math.floor(w / 2) - 7, y + 4, 14, 6, PAL.paper[2]); txt(c, 'CLOSED', x + Math.floor(w / 2), y + 5, { align: 'center', color: PAL.fadedRed }); }
      return;
    }
    // lit: amber interior with shelves and stock in silhouette
    vbands(c, x, y, w, h, PAL.amber[4], PAL.amber[2], 4);
    const a = PAL.amber;
    for (let yy = y + 6; yy < y + h - 2; yy += 7) {
      R(c, x, yy, w, 1, a[1]);
      for (let xx = x + 1; xx < x + w - 1; xx += 3) if (hash(seed + xx * 0.7 + yy) < 0.7) R(c, xx, yy - 3, 2, 3, hash(seed + xx + yy * 0.3) < 0.5 ? a[1] : '#8a5a3a');
    }
    if (sh && sh.counter !== false && w > 30) { R(c, x + 3, y + h - 8, Math.floor(w * 0.4), 8, a[0]); R(c, x + 3, y + h - 8, Math.floor(w * 0.4), 1, a[2]); }
    if (sh && sh.open !== false && w > 24) { R(c, x + w - 18, y + 3, 15, 7, '#3a1c18'); txt(c, 'OPEN', x + w - 17, y + 4, { color: PAL.neonRed }); }
    R(c, x, y, w, 1, PAL.amber[1]);
    for (let i = 0; i < 3; i++) RA(c, x + Math.floor(hash(seed + i) * w), y, 1, h, '#ffffff', 0.08);
  }
  function awningShape(c, x, y, w, color, stripes, seed) {
    const r = colorRamp(color);
    RA(c, x, y + 10, w, 4, PAL.ink, 0.35);
    for (let row = 0; row < 9; row++) {
      const inset = Math.floor(row * 0.3);
      R(c, x - inset, y + row, w + inset * 2, 1, row < 2 ? r[3] : row < 6 ? r[2] : r[1]);
    }
    if (stripes) for (let xx = x - 2; xx < x + w + 2; xx += 8) R(c, xx, y, 4, 9, rgba(PAL.offWhite, 0.18));
    for (let xx = x - 2; xx < x + w + 2; xx += 4) { R(c, xx, y + 9, 3, 2, r[1]); Px(c, xx + 1, y + 11, r[0]); }
    speckle(c, x, y, w, 9, r[4], Math.floor(w / 6), seed, false);
    if (hash(seed + 1) < 0.5) { const tx = x + Math.floor(hash(seed + 2) * (w - 6)); R(c, tx, y + 7, 3, 4, PAL.ink); }
  }

  def('wall', {
    draw(c, p, L) {
      const gy = gyOf(p, L), w = +p.w || 100, h = +p.h || 120, x = +p.x || 0, s = seedOf(p, 3);
      wallFill(c, x, gy - h, w, h, p.style || 'brick', s);
      if (p.coping !== false) { R(c, x - 1, gy - h - 2, w + 2, 2, PAL.stone[3]); RA(c, x, gy - h, w, 2, PAL.ink, 0.3); }
      R(c, x, gy - 3, w, 3, PAL.concrete[1]);
      if (p.pipe) { const px0 = x + (typeof p.pipe === 'number' ? p.pipe : w - 8); R(c, px0, gy - h, 3, h, PAL.metal[2]); R(c, px0, gy - h, 1, h, PAL.metal[4]); for (let yy = gy - h + 10; yy < gy; yy += 24) R(c, px0 - 1, yy, 5, 2, PAL.metal[1]); R(c, px0 - 1, gy - 4, 6, 4, PAL.metal[2]); }
      (p.posters || []).forEach((po, i) => {
        const q = typeof po === 'string' ? { kind: po } : po || {};
        drawPoster(c, x + (q.dx !== undefined ? q.dx : 6 + i * 16), q.dy !== undefined ? gy - q.dy : gy - 36 + (i % 3) * 2, q.w || 14, q.h || 20, q.kind || 'boxing', q.torn !== undefined ? q.torn : i % 2 === 0, q.text, s + 30 + i * 3);
      });
    },
  });

  def('alley_gap', {
    draw(c, p, L) {
      const gy = gyOf(p, L), w = +p.w || 40, h = +p.h || 150, x = +p.x || 0, s = seedOf(p, 4);
      // far back wall, darker and lower in contrast
      vbands(c, x, gy - h, w, h, '#1a1820', '#121017', 5);
      brickPatches(c, x, gy - h, w, h, ['#121016', '#16131a', '#1b171f', '#211c25', '#272029'], s, 2);
      if (p.light !== false) { R(c, x + Math.floor(w * 0.6), gy - Math.floor(h * 0.45), 5, 7, PAL.amber[2]); R(c, x + Math.floor(w * 0.6), gy - Math.floor(h * 0.45), 5, 1, PAL.amber[1]); }
      // receding side walls
      for (let i = 0; i < 6; i++) { RA(c, x + i, gy - h, 1, h, PAL.ink, 0.6 - i * 0.08); RA(c, x + w - 1 - i, gy - h, 1, h, PAL.ink, 0.5 - i * 0.07); }
      vbands(c, x, gy - 14, w, 14, '#16141b', '#0f0e14', 3);
      R(c, x + 6, gy - 12, 7, 12, '#1d2120'); R(c, x + 6, gy - 12, 7, 1, '#2a302d');
      cable(c, x, gy - h + 20, x + w, gy - h + 26, 4, PAL.ink);
    },
    lights(p, L) { if (p.light === false) return []; const gy = gyOf(p, L), w = +p.w || 40, h = +p.h || 150; return [{ x: (+p.x || 0) + w * 0.6 + 2, y: gy - h * 0.45 + 3, r: 26, color: PAL.lampWarm, k: 0.6, flicker: 0.1 }]; },
  });

  def('streetlight', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), h = +p.h || 112, f = p.face === -1 ? -1 : 1, m = PAL.metal, on = p.on !== false;
      contact(c, x, gy, 10);
      R(c, x - 3, gy - 6, 7, 6, m[2]); R(c, x - 3, gy - 6, 7, 1, m[4]); R(c, x - 2, gy - 9, 5, 3, m[2]);
      R(c, x - 1, gy - h, 3, h - 9, m[2]); R(c, x - 1, gy - h, 1, h - 9, m[4]); R(c, x + 1, gy - h, 1, h - 9, m[0]);
      // cobra-head arm
      for (let i = 0; i <= 18; i++) { const yy = gy - h - Math.round(Math.sin((i / 18) * Math.PI * 0.5) * 6); R(c, x + f * i, yy, 1, 2, m[3]); }
      const hx = x + f * 16, hy = gy - h - 6;
      R(c, hx - 5, hy - 1, 11, 3, m[2]); R(c, hx - 5, hy - 1, 11, 1, m[4]);
      R(c, hx - 4, hy + 2, 9, 1, on ? PAL.amber[4] : PAL.glass[3]);
      if (on) RA(c, hx - 3, hy + 3, 7, 1, PAL.amber[3], 0.6);
      // flyer and sticker wear
      R(c, x - 2, gy - 44, 5, 7, PAL.paper[2]); R(c, x - 1, gy - 42, 3, 1, PAL.paper[0]);
      speckle(c, x - 1, gy - h, 3, h - 10, PAL.rust[1], 8, seedOf(p, 5), false);
    },
    lights(p, L) {
      if (p.on === false) return [];
      const gy = gyOf(p, L), h = +p.h || 112, f = p.face === -1 ? -1 : 1;
      return [{ x: (+p.x || 0) + f * 16, y: gy - h - 3, r: h + 14, color: p.color || PAL.lamp, k: 0.95, flicker: p.flicker === true ? 0.6 : +p.flicker || 0, cone: { dir: 'down', width: 70 }, reflect: true }];
    },
  });

  def('pole', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), h = +p.h || 160, wd = PAL.wood, s = seedOf(p, 6);
      contact(c, x, gy, 8);
      R(c, x - 2, gy - h, 4, h, wd[2]); R(c, x - 2, gy - h, 1, h, wd[3]); R(c, x + 1, gy - h, 1, h, wd[0]);
      for (let yy = gy - h + 8; yy < gy; yy += 7) if (hash(s + yy) < 0.4) R(c, x - 1, yy, 1, 3, wd[1]);
      const ay = gy - h + 8;
      R(c, x - 16, ay, 33, 2, wd[2]); R(c, x - 16, ay, 33, 1, wd[3]);
      for (const ix of [-14, -6, 6, 14]) { R(c, ix + x, ay - 3, 1, 3, PAL.steel[3]); Px(c, ix + x, ay - 4, '#6f8a86'); }
      line(c, x - 10, ay + 2, x - 1, ay + 10, wd[1]); line(c, x + 10, ay + 2, x + 1, ay + 10, wd[1]);
      if (p.transformer !== false && hash(s) < 0.6) { R(c, x + 3, ay + 14, 7, 10, PAL.steel[2]); R(c, x + 3, ay + 14, 7, 1, PAL.steel[4]); R(c, x + 9, ay + 14, 1, 10, PAL.steel[0]); }
      for (let yy = gy - 70; yy < gy - 20; yy += 9) Px(c, x + (yy % 2 ? -3 : 2), yy, PAL.steel[3]);
      for (let i = 0; i < 3; i++) R(c, x - 2, gy - 50 + i * 6, 4, 5, [PAL.paper[2], '#b9a66a', PAL.paper[3]][i]);
    },
  });

  def('wires', {
    draw(c, p) {
      const x0 = +p.x0 || 0, x1 = p.x1 !== undefined ? +p.x1 : x0 + 200, y = p.y !== undefined ? +p.y : 150, sag = p.sag !== undefined ? +p.sag : 14, n = p.n || 3;
      for (let i = 0; i < n; i++) cable(c, x0, y + i * 3, x1, y + i * 3 + (i % 2), sag + i * 2, i === 0 ? '#0e0f13' : '#16171c');
      if (p.shoes) {
        const sx = Math.round(lerp(x0, x1, 0.4)), sy = Math.round(y + sag * 4 * 0.4 * 0.6);
        line(c, sx, sy, sx - 2, sy + 6, '#2a2a2a'); line(c, sx, sy, sx + 3, sy + 7, '#2a2a2a');
        R(c, sx - 5, sy + 6, 5, 2, PAL.offWhite); R(c, sx + 2, sy + 7, 5, 2, '#b8b2a4');
      }
    },
  });

  def('fireescape', {
    draw(c, p, L) {
      const floors = p.floors || 3, fh = p.floorH || 44, gy = gyOf({}, L);
      const y = p.y !== undefined ? +p.y : gy - 60 - (floors - 1) * fh;
      fireEscape(c, +p.x || 0, +p.w || 40, y, floors, fh, seedOf(p, 7), p.drop === false ? 0 : 18);
    },
  });

  def('water_tank', { draw(c, p, L) { waterTank(c, Math.round(+p.x || 0), gyOf(p, L), seedOf(p, 8)); } });

  def('dumpster', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, PAL.green), s = seedOf(p, 9);
      contact(c, x, gy, 48);
      const x0 = x - 22, top = gy - 26;
      for (let row = 0; row < 22; row++) { const inset = Math.floor((22 - row) / 11); R(c, x0 + 1 - inset, top + 3 + row, 44 - 2 + inset * 2, 1, row < 2 ? r[3] : row > 18 ? r[1] : r[2]); }
      for (const rx of [6, 18, 30]) { R(c, x0 + rx, top + 6, 1, 15, r[1]); R(c, x0 + rx + 1, top + 6, 1, 15, r[3]); }
      R(c, x0 - 1, top + 9, 46, 2, r[1]); R(c, x0 - 1, top + 9, 46, 1, r[3]);
      // lids: one slightly propped by a bag
      R(c, x0 - 1, top + 1, 23, 3, PAL.iron[2]); R(c, x0 - 1, top + 1, 23, 1, PAL.iron[3]);
      for (let i = 0; i < 23; i++) Px(c, x0 + 22 + i, top + 1 - Math.floor(i / 6), PAL.iron[3]);
      R(c, x0 + 22, top + 2, 23, 2, PAL.iron[1]); R(c, x0 + 26, top - 2, 9, 4, '#1c1e24'); Px(c, x0 + 28, top - 2, '#3a3e48');
      R(c, x0 + 3, gy - 6, 6, 3, r[0]); R(c, x0 + 35, gy - 6, 6, 3, r[0]);
      R(c, x0 + 3, gy - 3, 4, 3, PAL.ink); R(c, x0 + 37, gy - 3, 4, 3, PAL.ink);
      speckle(c, x0, top + 4, 44, 18, PAL.rust[1], 22, s, true);
      speckle(c, x0, top + 14, 44, 8, PAL.rust[2], 8, s + 1, false);
      txt(c, p.label || '4', x0 + 9, top + 13, { color: r[4] });
    },
  });

  def('trashbags', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 3, s = seedOf(p, 10);
      const bag = ['#101217', '#191c23', '#232832', '#2f3644', '#47506a'];
      contact(c, x, gy, n * 10 + 6);
      for (let i = 0; i < n; i++) {
        const bx = x - n * 5 + i * 10 + Math.floor(hash(s + i) * 3), bw = 11 + Math.floor(hash(s + i * 2) * 4), bh = 9 + Math.floor(hash(s + i * 3) * 5);
        const tint = hash(s + i * 4) < 0.25 ? ramp('#3a3d33') : bag;
        ellipse(c, bx + bw / 2, gy - bh / 2, bw / 2, bh / 2, tint[2]);
        ellipse(c, bx + bw / 2 - 1, gy - bh / 2 - 1, bw / 2 - 2, bh / 2 - 2, tint[3]);
        R(c, bx + Math.floor(bw / 2) - 1, gy - bh - 3, 2, 3, tint[2]); Px(c, bx + Math.floor(bw / 2) - 2, gy - bh - 4, tint[3]); Px(c, bx + Math.floor(bw / 2) + 1, gy - bh - 4, tint[3]);
        Px(c, bx + 3, gy - bh + 2, tint[4]); Px(c, bx + 4, gy - bh + 3, tint[4]); R(c, bx + 1, gy - 2, bw - 2, 2, tint[1]);
      }
      if (hash(s + 9) < 0.6) { R(c, x + n * 5, gy - 2, 4, 2, PAL.paper[2]); R(c, x + n * 5 + 3, gy - 1, 5, 1, PAL.paper[3]); }
    },
  });

  def('newspapers', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), s = seedOf(p, 11);
      for (let i = 0; i < 5; i++) {
        const nx = x - 14 + Math.floor(hash(s + i) * 28), nw = 5 + Math.floor(hash(s + i * 2) * 5);
        R(c, nx, gy - 1 + (i % 2), nw, 1, i % 3 ? PAL.paper[3] : PAL.paper[2]);
        if (i % 2) for (let k = 1; k < nw - 1; k += 2) Px(c, nx + k, gy - 1 + (i % 2), PAL.paper[1]);
      }
      R(c, x + 3, gy - 4, 6, 4, PAL.paper[2]); R(c, x + 4, gy - 5, 4, 1, PAL.paper[3]); Px(c, x + 5, gy - 3, PAL.paper[0]); Px(c, x + 7, gy - 2, PAL.paper[0]);
    },
  });

  def('pallet', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 2, wd = PAL.woodPale;
      if (p.lean) {
        RA(c, x - 2, gy - 2, 18, 2, PAL.ink, 0.3);
        for (let i = 0; i < 26; i++) { const yy = gy - 1 - i; R(c, x - 6 + Math.floor(i * 0.25), yy, 14, 1, i % 5 < 2 ? wd[1] : wd[2]); }
        for (const k of [0, 6, 12]) R(c, x - 5 + k, gy - 26, 2, 26, wd[3]);
        return;
      }
      contact(c, x, gy, 30);
      for (let i = 0; i < n; i++) {
        const yy = gy - (i + 1) * 5;
        R(c, x - 13, yy, 26, 1, wd[3]); for (let k = 0; k < 26; k += 5) R(c, x - 13 + k, yy, 4, 1, wd[3]);
        R(c, x - 13, yy + 1, 26, 1, wd[1]);
        for (const k of [0, 11, 22]) R(c, x - 13 + k, yy + 2, 4, 2, wd[2]);
        R(c, x - 13, yy + 4, 26, 1, wd[0]);
      }
    },
  });

  def('crates', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 2, per = p.stack || 2, wd = PAL.wood;
      const stacks = Math.ceil(n / per);
      contact(c, x, gy, stacks * 17 + 4);
      let k = 0;
      for (let si = 0; si < stacks; si++) for (let j = 0; j < per && k < n; j++, k++) {
        const bx = x - Math.floor(stacks * 17 / 2) + si * 17 + (j % 2), by = gy - (j + 1) * 14;
        box(c, bx, by, 16, 14, wd);
        R(c, bx + 1, by + 4, 14, 1, wd[1]); R(c, bx + 1, by + 9, 14, 1, wd[1]);
        line(c, bx + 2, by + 2, bx + 13, by + 11, wd[3]);
        if (hash(seedOf(p, 12) + k) < 0.5) txt(c, 'FRAGILE'.slice(0, 3), bx + 2, by + 5, { color: wd[1] });
      }
    },
  });

  def('barrel', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ['#1d2522', '#2a3430', '#37423d', '#47534c', '#5a665e']), s = seedOf(p, 13);
      contact(c, x, gy, 16);
      R(c, x - 7, gy - 20, 14, 20, r[2]); R(c, x - 7, gy - 20, 2, 20, r[3]); R(c, x + 5, gy - 20, 2, 20, r[1]);
      for (const ry of [3, 10, 17]) { R(c, x - 7, gy - 20 + ry, 14, 1, r[1]); R(c, x - 7, gy - 19 + ry, 14, 1, r[3]); }
      R(c, x - 7, gy - 21, 14, 2, r[4]); R(c, x - 6, gy - 20, 12, 1, p.fire ? '#1a100c' : r[0]);
      speckle(c, x - 7, gy - 20, 14, 20, PAL.rust[1], 18, s, true); speckle(c, x - 7, gy - 12, 14, 12, PAL.rust[2], 6, s + 1, false);
      if (p.fire) for (let i = 0; i < 5; i++) Px(c, x - 5 + i * 2, gy - 6 - (i % 2) * 3, '#5a2a18');
    },
    drawAnimated(c, p, L, t) {
      if (!p.fire) return;
      const gy = gyOf(p, L), x = Math.round(+p.x || 0);
      drawFlames(c, x, gy - 21, 12, 14, t, seedOf(p, 14));
    },
    lights(p, L) { return p.fire ? [{ x: +p.x || 0, y: gyOf(p, L) - 26, r: 70, color: PAL.fire, k: 0.85, flicker: 0.35, reflect: true }] : []; },
  });
  // Small flame cluster; time-driven, deterministic.
  function drawFlames(c, cx, by, w, h, t, seed) {
    const cols = ['#7a2a14', '#b84a1c', '#e07a3a', '#f2b860', '#fbe3a8'];
    for (let i = 0; i < w; i++) {
      const ph = t * 9 + i * 1.7 + seed, fh = Math.max(1, Math.round(h * (0.35 + 0.65 * Math.abs(Math.sin(ph * 0.7) * Math.cos(ph * 0.31 + i))) * (1 - Math.abs(i - w / 2) / (w * 0.75))));
      const xx = cx - Math.floor(w / 2) + i;
      for (let k = 0; k < fh; k++) Px(c, xx + (k > fh * 0.6 ? Math.round(Math.sin(ph + k) * 0.8) : 0), by - k, cols[Math.min(4, Math.floor((k / fh) * 2.2 + (1 - k / fh) * 0.4))]);
      if (fh > 3) Px(c, xx, by - 1, cols[3]);
    }
    if (Math.sin(t * 3 + seed) > 0.6) Px(c, cx + Math.round(Math.sin(t * 5) * 3), by - h - 2 - Math.floor((t * 20) % 6), cols[3]);
  }

  def('payphone', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), st = PAL.steel;
      contact(c, x, gy, 10);
      R(c, x - 1, gy - 30, 3, 30, st[1]); R(c, x - 1, gy - 30, 1, 30, st[3]);
      R(c, x - 8, gy - 51, 16, 3, '#2a3e58'); R(c, x - 8, gy - 51, 16, 1, '#3d5878');
      R(c, x - 11, gy - 58, 22, 7, '#22344c'); R(c, x - 11, gy - 58, 22, 1, '#3d5878'); txt(c, 'PHONE', x, gy - 57, { align: 'center', color: '#b9c6d0' });
      box(c, x - 6, gy - 48, 12, 18, st);
      R(c, x - 4, gy - 45, 8, 4, PAL.glass[2]); R(c, x - 4, gy - 45, 8, 1, PAL.glass[4]);
      for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) Px(c, x - 2 + k * 2, gy - 39 + i * 2, st[4]);
      R(c, x + 3, gy - 46, 1, 3, st[0]);
      R(c, x - 9, gy - 47, 3, 10, '#1b1d22'); R(c, x - 9, gy - 47, 3, 1, '#3a3e46');
      for (let yy = gy - 37; yy < gy - 30; yy += 2) Px(c, x - 8 + (yy % 4 ? 0 : 1), yy, '#1b1d22');
      R(c, x - 6, gy - 30, 12, 2, st[0]);
    },
    lights(p, L) { return [{ x: +p.x || 0, y: gyOf(p, L) - 54, r: 22, color: '#9fb6cc', k: 0.5 }]; },
  });

  def('hydrant', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ramp('#7a3a2e'));
      contact(c, x, gy, 10);
      R(c, x - 4, gy - 2, 9, 2, r[1]); R(c, x - 3, gy - 10, 7, 8, r[2]); R(c, x - 3, gy - 10, 2, 8, r[3]); R(c, x + 3, gy - 10, 1, 8, r[0]);
      R(c, x - 5, gy - 8, 2, 3, r[2]); R(c, x + 4, gy - 8, 2, 3, r[1]); R(c, x - 1, gy - 7, 3, 3, r[1]);
      R(c, x - 4, gy - 11, 9, 2, r[3]); R(c, x - 2, gy - 13, 5, 2, r[2]); Px(c, x, gy - 14, r[3]);
      speckle(c, x - 3, gy - 10, 7, 8, PAL.paper[1], 4, seedOf(p, 15), false);
    },
  });

  def('mailbox', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ramp('#2f4a6a'));
      contact(c, x, gy, 16);
      R(c, x - 6, gy - 4, 2, 4, r[0]); R(c, x + 4, gy - 4, 2, 4, r[0]);
      box(c, x - 7, gy - 22, 14, 18, r);
      for (let i = 0; i < 4; i++) R(c, x - 7 + Math.floor(i * 0.7), gy - 23 - i, 14 - Math.floor(i * 1.4), 1, i < 2 ? r[3] : r[4]);
      R(c, x - 4, gy - 18, 8, 2, r[0]); R(c, x - 4, gy - 18, 8, 1, PAL.steel[2]);
      txt(c, 'MAIL', x, gy - 13, { align: 'center', color: '#a9b7c6' });
      speckle(c, x - 7, gy - 22, 14, 18, r[1], 8, seedOf(p, 16), true);
    },
  });

  def('bench', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = p.kind || 'park', w = p.w || 34;
      const wd = kind === 'bus' ? PAL.steel : kind === 'gym' ? ramp('#3a2a2a') : PAL.wood, ir = PAL.iron;
      contact(c, x, gy, w + 2);
      const x0 = x - Math.floor(w / 2);
      if (kind === 'gym') {
        R(c, x0 + 3, gy - 9, 2, 9, ir[2]); R(c, x0 + w - 5, gy - 9, 2, 9, ir[2]);
        box(c, x0, gy - 13, w, 4, wd); R(c, x0 + 1, gy - 13, w - 2, 1, wd[4]);
        return;
      }
      if (kind === 'pew' || kind === 'wood') {
        box(c, x0, gy - 11, w, 3, wd); R(c, x0 + 1, gy - 8, 2, 8, wd[1]); R(c, x0 + w - 3, gy - 8, 2, 8, wd[1]);
        if (kind === 'pew') box(c, x0, gy - 24, 3, 24, wd);
        return;
      }
      R(c, x0 + 2, gy - 10, 2, 10, ir[2]); R(c, x0 + w - 4, gy - 10, 2, 10, ir[2]);
      R(c, x0 + 1, gy - 1, 4, 1, ir[3]); R(c, x0 + w - 5, gy - 1, 4, 1, ir[3]);
      for (let i = 0; i < 2; i++) { R(c, x0, gy - 11 + i * 2, w, 1, wd[3 - i]); }
      R(c, x0 + 2, gy - 22, 1, 12, ir[2]); R(c, x0 + w - 3, gy - 22, 1, 12, ir[2]);
      for (let i = 0; i < 3; i++) R(c, x0 + 1, gy - 21 + i * 3, w - 2, 2, i === 0 ? wd[3] : wd[2]);
      speckle(c, x0, gy - 21, w, 12, wd[1], 6, seedOf(p, 17), true);
    },
  });

  def('bus_stop', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), st = PAL.steel;
      if (p.shelter) {
        const x0 = x - 30;
        R(c, x0, gy - 50, 60, 3, st[2]); R(c, x0, gy - 50, 60, 1, st[4]);
        R(c, x0, gy - 47, 2, 47, st[2]); R(c, x0 + 58, gy - 47, 2, 47, st[1]);
        RA(c, x0 + 2, gy - 47, 56, 40, PAL.glass[3], 0.25);
        R(c, x0 + 36, gy - 44, 20, 30, '#4a5f78'); R(c, x0 + 37, gy - 43, 18, 28, '#8a7a5a'); txt(c, 'ADS', x0 + 46, gy - 32, { align: 'center', color: '#3a2a20' });
        R(c, x0 + 6, gy - 12, 26, 2, st[3]); R(c, x0 + 8, gy - 10, 1, 10, st[1]); R(c, x0 + 29, gy - 10, 1, 10, st[1]);
      }
      R(c, x + (p.shelter ? 34 : 0), gy - 64, 2, 64, st[2]);
      const sx = x + (p.shelter ? 34 : 0);
      R(c, sx - 6, gy - 66, 14, 10, '#2c4a3a'); R(c, sx - 5, gy - 65, 12, 8, '#cfc8b6');
      txt(c, p.sign || 'BUS', sx + 1, gy - 64, { align: 'center', color: '#2c4a3a' });
      R(c, sx - 3, gy - 52, 8, 10, PAL.paper[2]); R(c, sx - 2, gy - 50, 6, 1, PAL.paper[0]); R(c, sx - 2, gy - 48, 6, 1, PAL.paper[0]);
    },
  });

  // Boxy period cars as side profiles; heights are px above the ground at fractions of length.
  const CAR = {
    sedan: { len: 74, prof: [[0, 8], [0.03, 12], [0.27, 14], [0.4, 22], [0.68, 22], [0.8, 15], [0.98, 14], [1, 9]], win: [0.38, 0.79], pillar: [0.56] },
    cab: { len: 74, prof: [[0, 8], [0.03, 12], [0.27, 14], [0.4, 22], [0.68, 22], [0.8, 15], [0.98, 14], [1, 9]], win: [0.38, 0.79], pillar: [0.56] },
    wagon: { len: 78, prof: [[0, 8], [0.03, 12], [0.25, 14], [0.38, 22], [0.97, 22], [1, 10]], win: [0.36, 0.95], pillar: [0.54, 0.76] },
    van: { len: 72, prof: [[0, 9], [0.03, 14], [0.12, 16], [0.24, 29], [0.98, 30], [1, 10]], win: [0.2, 0.33], pillar: [] },
    pickup: { len: 74, prof: [[0, 9], [0.03, 13], [0.27, 15], [0.36, 23], [0.55, 23], [0.56, 16], [0.99, 16], [1, 10]], win: [0.34, 0.54], pillar: [] },
  };
  // Cars were authored small; CAR_SCALE brings a sedan's roof to about chest height on a 46 px figure.
  const CAR_SCALE = 1.5;
  const profAt = (prof, t) => { for (let i = 1; i < prof.length; i++) if (t <= prof[i][0]) { const a = prof[i - 1], b = prof[i]; return lerp(a[1], b[1], (t - a[0]) / Math.max(0.0001, b[0] - a[0])); } return prof[prof.length - 1][1]; };
  def('car', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = CAR[p.kind] ? p.kind : 'sedan', spec = CAR[kind], f = p.face === -1 ? -1 : 1, s = seedOf(p, 18);
      const col = p.color || (kind === 'cab' ? '#a08a3c' : kind === 'van' ? '#5a5e62' : ['#4a5a6a', '#6a3a32', '#4f5a48', '#6a6050', '#3a3e4a'][Math.floor(hash(s) * 5)]);
      const K = CAR_SCALE, r = colorRamp(col), len = Math.round(spec.len * K), x0 = x - Math.floor(len / 2);
      const X = (i) => (f > 0 ? x0 + len - 1 - i : x0 + i); // i counted from the front bumper
      contact(c, x, gy, len + 4); RA(c, x0 + 2, gy - 3, len - 4, 3, PAL.ink, 0.35);
      const belt = Math.round((kind === 'van' ? 16 : 14) * K);
      for (let i = 0; i < len; i++) {
        const t = i / (len - 1), top = Math.round(profAt(spec.prof, t) * K), xx = X(i);
        const inWin = t > spec.win[0] && t < spec.win[1] && top > belt + 2 && !spec.pillar.some((pp) => Math.abs(t - pp) < 0.025);
        for (let k = 3; k <= top; k++) {
          const yy = gy - k;
          let col2 = k === top ? r[4] : k > belt ? r[3] : k === belt ? r[4] : k < 8 ? r[1] : r[2];
          if (inWin && k > belt && k < top) col2 = k > top - 2 ? PAL.glass[3] : (i + k) % 7 === 0 ? PAL.glass[3] : PAL.glass[1];
          Px(c, xx, yy, col2);
        }
      }
      if (kind === 'pickup') for (let i = Math.round(len * 0.58); i < len - 2; i++) Px(c, X(i), gy - Math.round(16 * K), r[0]);
      if (kind === 'van') { R(c, Math.min(X(Math.round(len * 0.4)), X(Math.round(len * 0.92))), gy - Math.round(26 * K), Math.round(len * 0.52), 1, r[1]); if (p.text) txt(c, p.text, x - f * 8, gy - Math.round(22 * K), { align: 'center', color: r[0] }); }
      if (kind === 'cab') { R(c, X(Math.round(len * 0.55)) - 5, gy - Math.round(25 * K) + 1, 11, 4, '#c8b070'); for (let i = 0; i < len; i += 4) Px(c, X(i), gy - Math.round(11 * K), '#2a2a2a'); }
      // wheels with arches
      for (const wt of [0.18, 0.8]) {
        const wx = X(Math.round(len * wt));
        ellipse(c, wx, gy - 8, 9, 8, PAL.ink); ellipse(c, wx, gy - 7, 7, 7, '#16171b'); ellipse(c, wx, gy - 7, 3, 3, PAL.steel[2]); Px(c, wx - 1, gy - 8, PAL.steel[4]); Px(c, wx, gy - 7, PAL.steel[0]);
      }
      R(c, Math.min(X(0), X(2)), gy - 12, 3, 4, PAL.steel[3]); R(c, Math.min(X(len - 1), X(len - 3)), gy - 12, 3, 4, PAL.steel[3]);
      R(c, Math.min(X(1), X(2)), gy - 16, 2, 2, p.on ? '#fff2c0' : '#c8c0a0'); R(c, Math.min(X(len - 2), X(len - 3)), gy - 17, 2, 3, '#8a2a22');
      R(c, Math.min(X(Math.round(len * 0.3)), X(Math.round(len * 0.7))), gy - belt + 2, Math.round(len * 0.4), 1, r[1]);
      speckle(c, x0, gy - belt, len, belt - 4, PAL.rust[1], p.rusty === false ? 0 : 10, s + 2, true);
    },
    lights(p, L) {
      if (!p.on) return [];
      const gy = gyOf(p, L), x = +p.x || 0, f = p.face === -1 ? -1 : 1, len = Math.round((CAR[p.kind] || CAR.sedan).len * CAR_SCALE);
      return [{ x: x + f * (len / 2 + 2), y: gy - 15, r: 110, color: '#f4e2b0', k: 0.8, cone: { dir: f > 0 ? 'right' : 'left', width: 30 }, reflect: true }];
    },
  });

  def('fence', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 80, kind = p.kind || 'chain', s = seedOf(p, 19);
      if (kind === 'wood') {
        const h = p.h || 40, wd = PAL.wood;
        for (let xx = x; xx < x + w; xx += 6) {
          const ph = h - Math.floor(hash(s + xx) * 3), pc = hash(s + xx * 1.3) < 0.15 ? PAL.woodPale : wd;
          R(c, xx, gy - ph, 5, ph, pc[2]); R(c, xx, gy - ph, 1, ph, pc[3]); R(c, xx + 4, gy - ph, 1, ph, pc[1]); R(c, xx + 1, gy - ph - 1, 3, 1, pc[2]);
        }
        R(c, x, gy - h + 8, w, 2, wd[1]); R(c, x, gy - 10, w, 2, wd[1]);
        speckle(c, x, gy - h, w, h, wd[0], Math.floor(w / 3), s + 1, true);
        return;
      }
      if (kind === 'iron') {
        const h = p.h || 36, ir = PAL.iron;
        R(c, x, gy - h + 4, w, 2, ir[3]); R(c, x, gy - 6, w, 2, ir[2]);
        for (let xx = x; xx < x + w; xx += 4) { R(c, xx, gy - h + 1, 1, h - 1, ir[2]); Px(c, xx, gy - h, ir[3]); Px(c, xx - 1, gy - h + 1, ir[2]); Px(c, xx + 1, gy - h + 1, ir[2]); }
        for (let xx = x; xx <= x + w; xx += 40) { R(c, xx - 1, gy - h - 2, 3, h + 2, ir[3]); R(c, xx - 2, gy - h - 3, 5, 2, ir[3]); }
        return;
      }
      const h = p.h || 52, st = PAL.steel;
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if ((xx + yy) % 5 === 0 || (xx - yy + 1000) % 5 === 0) {
        if (hash(s + xx * 0.13 + yy * 0.71) < 0.06) continue;
        c.fillStyle = rgba(st[3], yy < 4 ? 0.8 : 0.45); c.fillRect(x + xx, gy - h + yy, 1, 1);
      }
      R(c, x, gy - h, w, 2, st[3]); R(c, x, gy - h, w, 1, st[4]);
      for (let xx = x; xx <= x + w; xx += 40) { R(c, xx - 1, gy - h - 2, 3, h + 2, st[2]); R(c, xx - 1, gy - h - 2, 1, h + 2, st[4]); }
      if (p.barbed) for (let xx = x; xx < x + w; xx += 3) { Px(c, xx, gy - h - 4 - (xx % 2), st[3]); if (xx % 6 === 0) Px(c, xx, gy - h - 6, st[4]); }
    },
  });

  def('gate', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 40, h = p.h || 48, st = p.kind === 'iron' ? PAL.iron : PAL.steel;
      R(c, x - 2, gy - h - 4, 3, h + 4, st[3]); R(c, x + w - 1, gy - h - 4, 3, h + 4, st[2]);
      const lw = p.open ? Math.max(6, Math.floor(w * 0.22)) : w - 2, lx = x + 1;
      R(c, lx, gy - h, lw, 2, st[3]); R(c, lx, gy - 3, lw, 2, st[2]); R(c, lx, gy - h, 1, h, st[3]); R(c, lx + lw - 1, gy - h, 1, h, st[2]);
      line(c, lx, gy - 3, lx + lw - 1, gy - h, st[2]);
      for (let yy = 2; yy < h - 3; yy++) for (let xx = 1; xx < lw - 1; xx++) if ((xx + yy) % (p.open ? 3 : 5) === 0) { c.fillStyle = rgba(st[3], 0.4); c.fillRect(lx + xx, gy - h + yy, 1, 1); }
      if (!p.open && p.locked !== false) { cable(c, lx + lw - 6, gy - h / 2 - 3, lx + lw + 2, gy - h / 2 - 3, 3, '#5a5e62'); R(c, lx + lw - 3, gy - h / 2 + 1, 4, 4, '#8a7a3a'); }
    },
  });

  def('stoop', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 30, n = p.steps || 3, cr = PAL.concrete;
      contact(c, x + w / 2, gy, w + 6);
      for (let k = 0; k < n; k++) {
        const yy = gy - (k + 1) * 4, inset = k * 2;
        R(c, x + inset, yy, w - inset * 2, 4, cr[2]); R(c, x + inset, yy, w - inset * 2, 1, cr[4]); R(c, x + inset, yy + 3, w - inset * 2, 1, cr[1]);
      }
      R(c, x - 3, gy - n * 4 - 6, 3, n * 4 + 6, cr[3]); R(c, x + w, gy - n * 4 - 6, 3, n * 4 + 6, cr[1]);
      R(c, x - 4, gy - n * 4 - 7, 5, 1, cr[4]); R(c, x + w - 1, gy - n * 4 - 7, 5, 1, cr[3]);
      const ir = PAL.iron;
      R(c, x - 2, gy - n * 4 - 22, 1, 16, ir[2]); R(c, x + w + 1, gy - n * 4 - 22, 1, 16, ir[2]);
      line(c, x - 2, gy - n * 4 - 22, x - 6, gy - 16, ir[3]); line(c, x + w + 1, gy - n * 4 - 22, x + w + 5, gy - 16, ir[3]);
      if (p.plant !== false) { R(c, x + w - 6, gy - n * 4 - 5, 5, 5, '#6a4030'); R(c, x + w - 7, gy - n * 4 - 9, 7, 4, '#3f5a3a'); Px(c, x + w - 5, gy - n * 4 - 10, '#a8584a'); Px(c, x + w - 3, gy - n * 4 - 10, '#c8a050'); }
    },
  });

  def('stairs', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, h = +p.h || 40, dir = p.dir === -1 ? -1 : 1;
      const cr = p.kind === 'iron' ? PAL.iron : PAL.concrete, steps = Math.max(2, Math.round(h / 5)), sw = w / steps, sh = h / steps;
      for (let k = 0; k < steps; k++) {
        const sx = dir > 0 ? x + k * sw : x + w - (k + 1) * sw, sy = gy - (k + 1) * sh;
        if (p.kind === 'iron') { R(c, sx, sy, sw + 1, 2, cr[3]); R(c, sx, sy, sw + 1, 1, cr[4]); }
        else { R(c, sx, sy, sw + 1, gy - sy, cr[2]); R(c, sx, sy, sw + 1, 1, cr[4]); R(c, sx, sy + 1, sw + 1, 1, cr[3]); R(c, dir > 0 ? sx : sx + sw, sy, 1, sh, cr[1]); }
      }
      if (p.kind === 'iron') { line(c, x, gy, x + w, gy - h, cr[2]); line(c, x, gy - 1, x + w, gy - h - 1, cr[1]); }
      const ir = PAL.iron, rx0 = dir > 0 ? x : x + w, rx1 = dir > 0 ? x + w : x;
      line(c, rx0, gy - 16, rx1, gy - h - 16, ir[3]);
      for (let k = 0; k <= steps; k += 2) { const t = k / steps, xx = lerp(rx0, rx1, t), yy = gy - t * h; R(c, xx, yy - 16, 1, 16, ir[2]); }
    },
  });

  def('planter', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = p.w || 22, cr = p.kind === 'wood' ? PAL.wood : PAL.concrete, s = seedOf(p, 20);
      contact(c, x, gy, w + 2);
      box(c, x - w / 2, gy - 10, w, 10, cr); R(c, x - w / 2 + 1, gy - 10, w - 2, 1, '#2a1e16');
      const greens = ['#2c3d2e', '#3a5038', '#4a6444', '#5c7850'];
      for (let i = 0; i < w - 2; i++) {
        const hh = 3 + Math.floor(hash(s + i) * 6);
        for (let k = 0; k < hh; k++) Px(c, x - w / 2 + 1 + i, gy - 11 - k, greens[Math.min(3, Math.floor((k / hh) * 3 + hash(s + i + k) * 1.2))]);
      }
      if (p.flowers !== false) {
        const fc = ['#b0584a', '#c8a050', '#a87a9a', '#d0c4a8'];
        for (let i = 0; i < Math.floor(w / 3); i++) { const fx = x - w / 2 + 2 + Math.floor(hash(s + i * 3) * (w - 4)), fy = gy - 14 - Math.floor(hash(s + i * 5) * 4); Px(c, fx, fy, fc[i % fc.length]); Px(c, fx + 1, fy, fc[i % fc.length]); }
      }
    },
  });

  function canopy(c, cx, cy, rx, ry, seed, cols) {
    for (let i = 0; i < 7; i++) {
      const ox = (hash(seed + i) - 0.5) * rx * 1.2, oy = (hash(seed + i * 2) - 0.5) * ry * 0.9, rr = rx * (0.45 + 0.3 * hash(seed + i * 3));
      ellipse(c, cx + ox, cy + oy, rr, rr * (ry / rx), cols[1]);
    }
    for (let i = 0; i < 6; i++) {
      const ox = (hash(seed + i * 5) - 0.6) * rx * 0.9, oy = (hash(seed + i * 6) - 0.7) * ry * 0.7, rr = rx * (0.28 + 0.2 * hash(seed + i * 7));
      ellipse(c, cx + ox, cy + oy, rr, rr * (ry / rx), cols[2]);
      ellipse(c, cx + ox - 1, cy + oy - 2, Math.max(1, rr * 0.45), Math.max(1, rr * 0.3), cols[3]);
    }
    speckle(c, cx - rx, cy - ry, rx * 2, ry * 2, cols[0], Math.floor(rx * ry * 0.15), seed + 9, false);
  }
  def('tree', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = p.kind || 'leafy', s = seedOf(p, 21), wd = PAL.wood, h = p.h || (kind === 'small' ? 56 : 92);
      contact(c, x, gy, 18);
      R(c, x - 8, gy - 1, 17, 2, PAL.iron[2]); for (let i = -7; i < 8; i += 2) Px(c, x + i, gy - 1, PAL.iron[0]);
      const tw = kind === 'small' ? 2 : 4;
      R(c, x - Math.floor(tw / 2), gy - h * 0.55, tw, h * 0.55, wd[2]); R(c, x - Math.floor(tw / 2), gy - h * 0.55, 1, h * 0.55, wd[3]);
      if (kind === 'small') { R(c, x + 3, gy - 30, 1, 30, PAL.woodPale[2]); Px(c, x + 1, gy - 26, PAL.paper[2]); }
      const bare = kind === 'bare' || kind === 'dead';
      // branches
      for (let i = 0; i < (bare ? 7 : 4); i++) {
        const by = gy - h * (0.4 + 0.35 * hash(s + i)), dir = i % 2 ? 1 : -1, len = h * (0.18 + 0.2 * hash(s + i * 2));
        line(c, x, by, x + dir * len, by - len * 0.8, wd[1]);
        if (bare) line(c, x + dir * len * 0.6, by - len * 0.5, x + dir * len * 0.9, by - len * 1.1, wd[1]);
      }
      if (!bare) {
        const cols = p.autumn ? ['#3a2418', '#6a3e22', '#8a5a2e', '#a87a40'] : ['#1c2a20', '#2c3f2e', '#3c5438', '#506a48'];
        canopy(c, x, gy - h * 0.72, kind === 'small' ? 11 : 22, kind === 'small' ? 10 : 18, s, cols);
      }
    },
  });

  def('poster', {
    draw(c, p, L) {
      const kind = POSTER_KINDS.indexOf(p.kind) >= 0 ? p.kind : 'boxing';
      const w = p.w || (kind === 'jin_fight' ? 22 : kind === 'notice' ? 14 : 15), h = p.h || (kind === 'jin_fight' ? 30 : 21);
      const y = p.y !== undefined ? +p.y : gyOf({}, L) - 40;
      drawPoster(c, Math.round((+p.x || 0) - w / 2), Math.round(y), w, h, kind, p.torn, p.text, seedOf(p, 22));
    },
  });

  def('flyer', {
    draw(c, p, L) {
      const x = Math.round((+p.x || 0) - 5), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 38), s = seedOf(p, 23);
      R(c, x, y, 10, 9, PAL.paper[3]); R(c, x, y, 10, 1, PAL.paper[4]);
      if (p.text) txt(c, String(p.text).slice(0, 2), x + 1, y + 1, { color: '#3a3430' }); else { R(c, x + 2, y + 2, 6, 1, '#4a4440'); R(c, x + 2, y + 4, 5, 1, '#6a6458'); }
      R(c, x + 2, y + 6, 6, 1, '#6a6458');
      for (let i = 0; i < 5; i++) if (hash(s + i) > 0.35) R(c, x + i * 2, y + 9, 1, 4, PAL.paper[2]);
      Px(c, x + 5, y, PAL.steel[4]);
    },
  });

  def('notice', {
    draw(c, p, L) {
      const lines = Array.isArray(p.lines) ? p.lines : p.lines ? [String(p.lines)] : [];
      const w = Math.max(16, ...lines.map((l) => txtW(l) + 4)), h = Math.max(14, lines.length * 7 + 4);
      const x = Math.round((+p.x || 0) - w / 2), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 44);
      R(c, x + 1, y + 1, w, h, rgba(PAL.ink, 0.35));
      R(c, x, y, w, h, '#c2b9a2'); R(c, x, y, w, 1, '#d4cbb4'); RA(c, x, y + h - 3, w, 3, PAL.paper[1], 0.4);
      lines.forEach((l, i) => txt(c, l, x + 2, y + 3 + i * 7, { color: '#2e2a30' }));
      if (!lines.length) for (let yy = y + 3; yy < y + h - 2; yy += 3) R(c, x + 2, yy, w - 4 - (yy % 5), 1, '#4a4448');
      RA(c, x - 1, y - 1, 5, 3, '#d8d0b0', 0.7); RA(c, x + w - 4, y - 1, 5, 3, '#d8d0b0', 0.7);
    },
  });

  def('graffiti', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 30), w = +p.w || 40, s = seedOf(p, 24);
      graffitiTag(c, x, y, Math.floor(w * 0.55), s);
      if (w > 30) {
        const bx = x + Math.floor(w * 0.6), bw = Math.floor(w * 0.38), col = ['#4f5a6e', '#6a4a5a', '#5a6a4a'][Math.floor(hash(s + 2) * 3)];
        for (let i = 0; i < 3; i++) { ellipse(c, bx + 3 + i * Math.floor(bw / 3), y + 4, Math.floor(bw / 6) + 1, 5, col); ellipse(c, bx + 3 + i * Math.floor(bw / 3), y + 4, Math.max(1, Math.floor(bw / 6) - 1), 3, shade(col, 0.2)); }
      }
      RA(c, x, y - 2, w, 12, '#40404a', 0.12);
    },
  });

  function neonText(c, text, x, y, col, scale, on) {
    const cr = ramp(col);
    if (!on) { txt(c, text, x, y, { align: 'center', color: cr[0], scale }); return; }
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) txt(c, text, x + dx, y + dy, { align: 'center', color: rgba(col, 0.35), scale });
    txt(c, text, x, y, { align: 'center', color: mix(col, '#fff4dc', 0.45), scale });
  }
  def('sign', {
    animated: true,
    draw(c, p, L) {
      const text = String(p.text || 'SIGN').toUpperCase(), scale = p.scale || 1;
      const w = +p.w || txtW(text, scale) + 10, h = p.h || 6 * scale + 6, x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 70);
      if (p.neon) {
        R(c, x, y, w, h, '#16141a'); R(c, x, y, w, 1, '#2a2630'); R(c, x + w / 2 - 6, y - 4, 1, 4, PAL.iron[2]); R(c, x + w / 2 + 6, y - 4, 1, 4, PAL.iron[2]);
        neonText(c, text, x + Math.floor(w / 2), y + Math.floor((h - 5 * scale) / 2), p.color || PAL.neonRed, scale, false);
        return;
      }
      const r = colorRamp(p.color, ramp('#5a3a2c'));
      R(c, x, y, w, h, r[1]); R(c, x + 1, y + 1, w - 2, h - 2, r[2]); R(c, x + 1, y + 1, w - 2, 1, r[3]);
      speckle(c, x + 1, y + 1, w - 2, h - 2, r[3], Math.floor(w / 3), seedOf(p, 25), true);
      if (hash(seedOf(p, 26)) < 0.5) R(c, x + w - 6, y + 1, 4, h - 2, r[1]);
      txt(c, text, x + Math.floor(w / 2), y + Math.floor((h - 5 * scale) / 2), { align: 'center', color: p.textColor || '#d8ccaa', scale, shadow: r[0] });
      R(c, x + 3, y - 3, 1, 3, PAL.iron[2]); R(c, x + w - 4, y - 3, 1, 3, PAL.iron[2]);
    },
    drawAnimated(c, p, L, t) {
      if (!p.neon) return;
      const text = String(p.text || 'SIGN').toUpperCase(), scale = p.scale || 1;
      const w = +p.w || txtW(text, scale) + 10, h = p.h || 6 * scale + 6, x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 70);
      // a tired tube: mostly on, with short buzzing dropouts
      const f = p.flicker === undefined ? 0.15 : +p.flicker, bucket = Math.floor(t * 14), on = !(f > 0 && hash(bucket * 0.37 + seedOf(p, 27)) < f * 0.5);
      neonText(c, text, x + Math.floor(w / 2), y + Math.floor((h - 5 * scale) / 2), p.color || PAL.neonRed, scale, on);
    },
    lights(p, L) {
      if (!p.neon && !p.lit) return [];
      const text = String(p.text || 'SIGN'), scale = p.scale || 1, w = +p.w || txtW(text, scale) + 10, h = p.h || 6 * scale + 6;
      const y = p.y !== undefined ? +p.y : gyOf({}, L) - 70;
      return [{ x: (+p.x || 0) + w / 2, y: y + h / 2, r: Math.max(36, w * 0.9), color: p.neon ? p.color || PAL.neonRed : PAL.lamp, k: 0.6, flicker: p.neon ? (p.flicker === undefined ? 0.15 : +p.flicker) : 0, reflect: true }];
    },
  });

  def('window', {
    draw(c, p, L) {
      const w = +p.w || 14, h = +p.h || 20, y = p.y !== undefined ? +p.y : gyOf({}, L) - 70;
      drawWin(c, Math.round(+p.x || 0), Math.round(y), w, h, { lit: p.lit, curtains: p.curtains, broken: p.broken, boarded: p.boarded, seed: seedOf(p, 28), ac: p.ac, plant: p.plant, tv: p.tv, frame: p.frame, interior: p.interior });
    },
    lights(p, L) {
      if (!p.lit || p.boarded) return [];
      const w = +p.w || 14, h = +p.h || 20, y = p.y !== undefined ? +p.y : gyOf({}, L) - 70;
      return [{ x: (+p.x || 0) + w / 2, y: y + h / 2, r: 16 + w, color: p.tv ? PAL.tvBlue : '#efb866', k: 0.8, flicker: p.tv ? 0.35 : 0 }];
    },
  });

  const DOOR_W = { wood: 22, metal: 22, glass: 22, roll: 44, double: 36 };
  def('door', {
    draw(c, p, L) {
      const kind = DOOR_W[p.kind] ? p.kind : 'wood', w = +p.w || DOOR_W[kind], h = +p.h || (kind === 'roll' ? 56 : 54);
      drawDoor(c, Math.round((+p.x || 0) - w / 2), gyOf(p, L), w, h, { kind, color: p.color, open: p.open, label: p.label, seed: seedOf(p, 29), lit: p.lit, fresh: p.fresh, sign: p.sign });
    },
    lights(p, L) {
      if (!(p.open && p.lit)) return [];
      return [{ x: +p.x || 0, y: gyOf(p, L) - 16, r: 40, color: PAL.lampWarm, k: 0.7, reflect: true }];
    },
  });

  def('awning', {
    draw(c, p, L) {
      awningShape(c, Math.round(+p.x || 0), Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 40), +p.w || 50, p.color || PAL.fadedRed, p.stripes !== false, seedOf(p, 30));
    },
  });

  def('billboard', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 90, h = p.h || 40, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 190), s = seedOf(p, 31), ir = PAL.iron;
      for (const lx of [0.2, 0.8]) { R(c, x + w * lx, y + h, 2, 24, ir[2]); line(c, x + w * lx, y + h + 2, x + w * lx + 10, y + h + 22, ir[1]); }
      R(c, x - 2, y + h + 2, w + 4, 2, ir[3]); for (let xx = x; xx < x + w; xx += 4) R(c, xx, y + h + 4, 1, 4, ir[1]); R(c, x - 2, y + h + 7, w + 4, 1, ir[2]);
      R(c, x - 2, y - 2, w + 4, h + 4, ir[2]);
      const bg = ['#4a5a6a', '#6a4a3a', '#5a6450'][Math.floor(hash(s) * 3)];
      R(c, x, y, w, h, bg); vbands(c, x, y, w, Math.floor(h * 0.5), shade(bg, 0.15), bg, 3);
      for (let xx = x + Math.floor(w / 4); xx < x + w; xx += Math.floor(w / 4)) R(c, xx, y, 1, h, shade(bg, -0.2));
      R(c, x + w - 18, y + h - 22, 14, 18, '#c8bea0'); R(c, x + w - 15, y + h - 26, 8, 6, '#c8bea0');
      txt(c, p.text || 'CALDER SAVINGS', x + Math.floor((w - 20) / 2), y + 6, { align: 'center', color: '#e0d4b0', shadow: shade(bg, -0.4) });
      txt(c, p.sub || 'SINCE 1952', x + Math.floor((w - 20) / 2), y + 16, { align: 'center', color: shade(bg, 0.35) });
      // peeling corner and grime
      const px0 = x + Math.floor(hash(s + 1) * (w - 16));
      R(c, px0, y + h - 9, 12, 9, PAL.paper[1]); for (let i = 0; i < 6; i++) Px(c, px0 + i, y + h - 10 - Math.floor(i / 2), PAL.paper[3]);
      RA(c, x, y + h - 6, w, 6, PAL.ink, 0.25);
      for (const lx of [0.25, 0.5, 0.75]) { R(c, x + w * lx, y + h + 2, 1, 4, ir[3]); R(c, x + w * lx - 2, y + h + 1, 5, 2, ir[3]); }
    },
    lights(p, L) {
      if (p.lit === false) return [];
      const x = +p.x || 0, w = +p.w || 90, h = p.h || 40, y = p.y !== undefined ? +p.y : gyOf({}, L) - 190;
      return [0.25, 0.5, 0.75].map((lx) => ({ x: x + w * lx, y: y + h, r: h + 6, color: '#f0d8a0', k: 0.55, cone: { dir: 'up', width: 70 } }));
    },
  });

  const CLOTHES = ['#6a6a7a', '#8a4a3a', '#c4baa0', '#4a6a8a', '#7a7a4a', '#a89a8a', '#5a4a6a'];
  def('laundry_line', {
    animated: true,
    draw(c, p) {
      const x0 = +p.x0 || 0, x1 = p.x1 !== undefined ? +p.x1 : x0 + 80, y = p.y !== undefined ? +p.y : 160;
      cable(c, x0, y, x1, y, p.sag || 6, '#3a3a40');
      R(c, x0 - 1, y - 1, 3, 3, PAL.iron[2]); R(c, x1 - 1, y - 1, 3, 3, PAL.iron[2]);
    },
    drawAnimated(c, p, L, t) {
      const x0 = +p.x0 || 0, x1 = p.x1 !== undefined ? +p.x1 : x0 + 80, y = p.y !== undefined ? +p.y : 160, sag = p.sag || 6, s = seedOf(p, 32);
      const n = Math.max(1, Math.floor((x1 - x0) / 16));
      for (let i = 0; i < n; i++) {
        const tt = (i + 0.5) / n, cx = Math.round(lerp(x0, x1, tt)), cy = Math.round(y + sag * 4 * tt * (1 - tt));
        const col = ramp(CLOTHES[Math.floor(hash(s + i) * CLOTHES.length)]), kind = Math.floor(hash(s + i * 2) * 3), sway = Math.round(Math.sin(t * 1.6 + i * 1.3 + s) * 1.2);
        if (kind === 0) { // shirt
          R(c, cx - 5, cy + 1, 10, 3, col[2]); R(c, cx - 3, cy + 4, 6 + sway, 8, col[2]); R(c, cx - 3, cy + 4, 1, 8, col[3]); R(c, cx - 5, cy + 1, 10, 1, col[3]);
        } else if (kind === 1) { // sheet
          for (let k = 0; k < 14; k++) R(c, cx - 6 + Math.round((k / 14) * sway), cy + 1 + k, 12, 1, k % 4 === 0 ? col[3] : col[2]);
        } else { // socks
          R(c, cx - 3, cy + 1, 2, 6, col[2]); R(c, cx - 3 + sway, cy + 7, 3, 2, col[2]); R(c, cx + 2, cy + 1, 2, 6, col[1]); R(c, cx + 2 + sway, cy + 7, 3, 2, col[1]);
        }
        Px(c, cx - 2, cy, '#8a7a5a'); Px(c, cx + 2, cy, '#8a7a5a');
      }
    },
  });

  def('basketball_hoop', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), f = p.face === -1 ? -1 : 1, st = PAL.steel;
      contact(c, x, gy, 8);
      R(c, x - 1, gy - 72, 3, 72, st[2]); R(c, x - 1, gy - 72, 1, 72, st[4]);
      line(c, x, gy - 70, x + f * 10, gy - 74, st[2]);
      const bx = x + f * 10 - (f > 0 ? 0 : 3);
      R(c, bx, gy - 86, 3, 20, '#b0aa98'); R(c, bx, gy - 86, 3, 1, '#c8c2b0');
      R(c, bx + (f > 0 ? 3 : -9), gy - 72, 9, 1, '#8a4a2a');
      for (let i = 0; i < 5; i++) { const nx = bx + (f > 0 ? 4 : -8) + i * 2; line(c, nx, gy - 71, nx + (i % 2 ? 1 : -1), gy - 64, '#8a8a84'); }
      speckle(c, x - 1, gy - 60, 3, 60, PAL.rust[1], 10, seedOf(p, 33), false);
    },
  });

  def('garden_plot', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, s = seedOf(p, 34), wd = PAL.woodPale;
      contact(c, x + w / 2, gy, w + 4);
      box(c, x, gy - 9, w, 9, wd); R(c, x + 1, gy - 9, w - 2, 2, '#2a1c14'); R(c, x + 1, gy - 9, w - 2, 1, '#3a2a1c');
      const greens = ['#2c3d2e', '#3a5038', '#4a6444', '#5f7a52'];
      for (let xx = x + 3; xx < x + w - 3; xx += 6) {
        const kind = Math.floor(hash(s + xx) * 4), hh = 5 + Math.floor(hash(s + xx * 2) * 8);
        if (kind === 0) { // tomato cage
          R(c, xx, gy - 9 - hh - 4, 1, hh + 4, '#7a7a74'); R(c, xx + 4, gy - 9 - hh - 4, 1, hh + 4, '#7a7a74'); R(c, xx, gy - 9 - hh, 5, 1, '#7a7a74');
          for (let k = 0; k < 6; k++) Px(c, xx + 1 + (k % 3), gy - 10 - Math.floor(hash(s + xx + k) * hh), greens[k % 4]);
          Px(c, xx + 2, gy - 12, '#9a3a2a'); Px(c, xx + 3, gy - 15, '#9a4a2a');
        } else if (kind === 1 && hash(s + xx * 3) < 0.4) { // sunflower
          R(c, xx + 2, gy - 9 - hh - 12, 1, hh + 12, greens[1]); ellipse(c, xx + 2, gy - 9 - hh - 13, 2, 2, '#b0903c'); Px(c, xx + 2, gy - 9 - hh - 13, '#4a3020');
        } else for (let k = 0; k < 5; k++) { const lx = xx + Math.floor(hash(s + xx + k * 3) * 5); R(c, lx, gy - 10 - Math.floor(hash(s + xx + k) * hh * 0.6), 1, 2, greens[1 + (k % 3)]); }
      }
      R(c, x + w - 6, gy - 15, 1, 6, wd[3]); R(c, x + w - 9, gy - 15, 7, 4, '#c8bea0'); txt(c, '#7', x + w - 6, gy - 14, { align: 'center', color: '#3a3430' });
    },
  });

  def('mural', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 120, h = +p.h || 60, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - h - 10), s = seedOf(p, 35);
      vbands(c, x, y, w, h, '#5a5068', '#a07858', 5);
      ellipse(c, x + Math.floor(w * 0.68), y + Math.floor(h * 0.62), Math.floor(h * 0.25), Math.floor(h * 0.25), '#c49a5a');
      // factory skyline band
      for (let xx = 0; xx < w; xx++) { const hh = Math.floor(h * 0.18 + (Math.floor(xx / 9) % 3) * 4 + (xx % 30 < 4 ? h * 0.25 : 0)); R(c, x + xx, y + h - hh - 10, 1, hh, '#3a3a48'); }
      R(c, x, y + h - 12, w, 12, '#4a5a4a');
      // figures holding hands
      const n = Math.max(3, Math.floor(w / 18)), cols = ['#8a4a3a', '#3a5a7a', '#c0a060', '#5a7a5a', '#7a5a7a'];
      for (let i = 0; i < n; i++) { const fx = x + 8 + Math.floor(((w - 16) * i) / (n - 1 || 1)); person(c, fx, y + h - 3, 16 + (i % 2) * 3, cols[i % cols.length], { skin: ['#9a6a4a', '#c08a6a', '#6a4a3a'][i % 3], hair: '#2a2020' }); if (i < n - 1) R(c, fx + 3, y + h - 12, Math.floor((w - 16) / (n - 1 || 1)) - 5, 1, '#9a6a4a'); }
      if (p.text !== false) txt(c, p.text || 'EASTGATE TOGETHER', x + Math.floor(w / 2), y + 4, { align: 'center', color: '#e8d8b0', shadow: '#3a2a30' });
      // weathering: peeled patches show the wall underneath
      for (let i = 0; i < 4; i++) { const px0 = x + Math.floor(hash(s + i) * (w - 10)), py0 = y + Math.floor(hash(s + i * 2) * (h - 8)); R(c, px0, py0, 4 + Math.floor(hash(s + i * 3) * 8), 2 + Math.floor(hash(s + i * 4) * 4), PAL.brick[2]); }
      RA(c, x, y, w, h, '#30303a', 0.22);
      speckle(c, x, y, w, h, '#2a2a30', Math.floor(w * h / 50), s + 5, true);
    },
  });

  def('memorial', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0);
      R(c, x - 6, gy - 30, 12, 15, '#6a5a48'); R(c, x - 5, gy - 29, 10, 10, '#4a4a50'); R(c, x - 2, gy - 27, 4, 4, '#8a7060'); R(c, x - 3, gy - 23, 6, 4, '#3a3440');
      if (p.text !== false) { R(c, x - 6, gy - 18, 12, 5, '#c2b9a2'); txt(c, p.text || 'RIP', x, gy - 18, { align: 'center', color: '#3a3040' }); }
      const fl = [['#8a3a4a', '#a8584a'], ['#c8b070', '#d8c890'], ['#8a6a9a', '#a88ab8']];
      for (let i = 0; i < 3; i++) { const fx = x - 12 + i * 9; line(c, fx, gy - 1, fx + 2, gy - 6, '#3a5a3a'); R(c, fx - 1, gy - 6, 5, 4, '#cfc8b8'); RA(c, fx - 1, gy - 6, 5, 4, '#a8b8c8', 0.3); Px(c, fx + 1, gy - 8, fl[i][0]); Px(c, fx + 2, gy - 9, fl[i][1]); Px(c, fx, gy - 9, fl[i][1]); }
      for (let i = 0; i < 4; i++) { const cx = x - 9 + i * 6; R(c, cx, gy - 4 - (i % 2), 3, 4 + (i % 2), i % 2 ? '#a83a2a' : '#c8b890'); }
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0);
      for (let i = 0; i < 4; i++) { const cx = x - 8 + i * 6, fy = gy - 6 - (i % 2); const k = Math.sin(t * 11 + i * 2.1) > -0.2; Px(c, cx, fy, k ? '#f2c060' : '#e08a3a'); if (k) Px(c, cx, fy - 1, '#fbe3a8'); }
    },
    lights(p, L) { return [{ x: +p.x || 0, y: gyOf(p, L) - 7, r: 30, color: '#f0b060', k: 0.65, flicker: 0.25 }]; },
  });

  def('caution_tape', {
    animated: true,
    draw(c, p) {
      const x0 = +p.x0 || 0, x1 = p.x1 !== undefined ? +p.x1 : x0 + 60, y = p.y !== undefined ? +p.y : 270;
      R(c, x0 - 1, y - 1, 2, 3, '#8a7a3a'); R(c, x1 - 1, y - 1, 2, 3, '#8a7a3a');
    },
    drawAnimated(c, p, L, t) {
      const x0 = +p.x0 || 0, x1 = p.x1 !== undefined ? +p.x1 : x0 + 60, y = p.y !== undefined ? +p.y : 270, n = Math.max(1, Math.round(x1 - x0));
      const sag = 4 + Math.sin(t * 2.3 + x0) * 1.5;
      for (let i = 0; i <= n; i++) {
        const tt = i / n, yy = Math.round(y + sag * 4 * tt * (1 - tt) + Math.sin(t * 6 + i * 0.3) * 0.6 * tt * (1 - tt) * 4);
        const col = Math.floor((i + 2) / 4) % 2 ? '#a99140' : '#1d1b18';
        Px(c, x0 + i, yy, col); Px(c, x0 + i, yy + 1, col === '#1d1b18' ? '#2a2620' : '#8a7634');
      }
    },
  });

  def('rubble', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 50, s = seedOf(p, 36);
      contact(c, x + w / 2, gy, w);
      for (let i = 0; i < Math.max(3, Math.floor(w / 9)); i++) {
        const cx = x + Math.floor(hash(s + i) * w), rw = 5 + Math.floor(hash(s + i * 2) * 10), rh = 3 + Math.floor(hash(s + i * 3) * 7);
        const r = hash(s + i * 4) < 0.5 ? PAL.brick : PAL.concrete;
        for (let k = 0; k < rh; k++) { const ww = Math.round(rw * (1 - k / (rh + 1))); R(c, cx - Math.floor(ww / 2), gy - 1 - k, ww, 1, k === rh - 1 ? r[3] : k > rh / 2 ? r[2] : r[1]); }
      }
      for (let i = 0; i < Math.floor(w / 6); i++) { const bx = x + Math.floor(hash(s + i * 5) * w); R(c, bx, gy - 2, 4, 2, PAL.brick_red[2 + (i % 2)]); Px(c, bx, gy - 2, PAL.brick_red[4]); }
      line(c, x + Math.floor(w * 0.3), gy - 3, x + Math.floor(w * 0.45), gy - 12, PAL.rust[1]);
      speckle(c, x, gy - 2, w, 3, PAL.concrete[3], Math.floor(w / 2), s + 9, false);
    },
  });

  def('burned_wall', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 100, h = +p.h || 120, s = seedOf(p, 37);
      // jagged broken top edge via a clip
      c.save(); c.beginPath(); c.moveTo(x, gy);
      for (let xx = 0; xx <= w; xx += 4) c.lineTo(x + xx, gy - h + Math.floor(hash(s + xx) * 14) + (xx > w * 0.4 && xx < w * 0.7 ? 18 : 0));
      c.lineTo(x + w, gy); c.closePath(); c.clip();
      wallFill(c, x, gy - h - 2, w, h + 2, p.style || 'brick', s);
      for (let i = 0; i < 6; i++) RA(c, x, gy - h + i * 8, w, 8, '#0e0c10', 0.5 - i * 0.07);
      const nw = Math.max(1, Math.floor(w / 40));
      for (let k = 0; k < nw; k++) {
        const wx = x + Math.floor((w / nw) * (k + 0.5)) - 7, wy = gy - Math.floor(h * 0.6);
        R(c, wx, wy, 14, 20, PAL.ink); ellipse(c, wx + 7, wy - 6, 12, 14, rgba('#0a080c', 0.6));
        line(c, wx + 2, wy + 2, wx + 12, wy + 18, '#2a1a12'); Px(c, wx + 3, wy + 19, '#5a2a18');
      }
      c.restore();
      for (let i = 0; i < 3; i++) { const bx = x + Math.floor(w * (0.3 + i * 0.15)); line(c, bx, gy - h + 10, bx + 10, gy - h - 6 + i * 3, '#1c140f'); line(c, bx, gy - h + 11, bx + 10, gy - h - 5 + i * 3, '#2a1d14'); }
      speckle(c, x, gy - h * 0.5, w, h * 0.5, '#0e0c10', Math.floor(w * h / 60), s + 3, true);
    },
  });

  def('scaffold', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 90, h = +p.h || 120, st = PAL.steel, wd = PAL.woodPale;
      const bays = Math.max(1, Math.round(w / 30)), bw = w / bays, lifts = Math.max(1, Math.round(h / 32)), lh = h / lifts;
      for (let i = 0; i <= bays; i++) { const xx = Math.round(x + i * bw); R(c, xx, gy - h, 2, h, st[2]); R(c, xx, gy - h, 1, h, st[4]); R(c, xx - 2, gy - 1, 6, 1, st[1]); }
      for (let j = 1; j <= lifts; j++) {
        const yy = Math.round(gy - j * lh);
        R(c, x, yy, w + 2, 1, st[3]);
        if (j % 2 === 1 || j === lifts) { R(c, x, yy - 2, w + 2, 2, wd[2]); R(c, x, yy - 2, w + 2, 1, wd[3]); R(c, x, yy - 8, w + 2, 1, st[2]); }
        for (let i = 0; i < bays; i++) if ((i + j) % 2 === 0) line(c, x + i * bw + 1, yy, x + (i + 1) * bw, yy + lh, st[1]);
      }
      speckle(c, x, gy - h, w, h, PAL.rust[1], Math.floor(w * h / 200), seedOf(p, 38), false);
    },
  });

  def('puddle', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 40, s = seedOf(p, 39);
      for (let k = 0; k < 4; k++) {
        const ww = Math.round(w * (1 - Math.abs(k - 1.5) / 3)), xx = x + Math.floor((w - ww) / 2) + Math.floor((hash(s + k) - 0.5) * 4);
        R(c, xx, gy + 1 + k, ww, 1, k === 0 ? '#2c3442' : '#1a2030');
      }
      for (let i = 0; i < 4; i++) R(c, x + Math.floor(hash(s + i * 3) * (w - 6)), gy + 2 + (i % 2), 3 + Math.floor(hash(s + i) * 4), 1, '#3a4658');
    },
    drawAnimated(c, p, L, t) {
      const kinds = weatherKinds(L);
      if (kinds.indexOf('rain') < 0 && kinds.indexOf('drizzle') < 0) return;
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 40, s = seedOf(p, 40);
      // rain rings: each slot restarts on its own period
      for (let i = 0; i < Math.max(2, Math.floor(w / 10)); i++) {
        const per = 0.5 + hash(s + i) * 0.5, ph = ((t + hash(s + i * 2) * per) % per) / per, cyc = Math.floor((t + hash(s + i * 2) * per) / per);
        const rx = x + 3 + Math.floor(hash(s + i + cyc * 1.7) * (w - 6)), rr = Math.round(ph * 4);
        const a = 0.55 * (1 - ph);
        RA(c, rx - rr, gy + 2, 1, 1, '#8a9ab0', a); RA(c, rx + rr, gy + 2, 1, 1, '#8a9ab0', a);
        if (rr > 1) RA(c, rx - rr + 1, gy + 1, rr * 2 - 1, 1, '#8a9ab0', a * 0.5);
      }
    },
  });

  // Far pieces carry their own haze so they sit back in the far layer.
  const HAZE = '#262c39';
  def('smokestack', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), h = +p.h || 160, r = PAL.brick.map((col) => mix(col, HAZE, 0.45));
      for (let k = 0; k < h; k++) { const ww = Math.round(lerp(16, 10, k / h)); R(c, x - Math.floor(ww / 2), gy - k - 1, ww, 1, r[2]); Px(c, x - Math.floor(ww / 2), gy - k - 1, r[3]); Px(c, x + Math.ceil(ww / 2) - 1, gy - k - 1, r[1]); }
      for (const bk of [0.9, 0.82, 0.5]) R(c, x - 6, gy - Math.round(h * bk), 12, 1, mix(PAL.iron[2], HAZE, 0.4));
      R(c, x - 6, gy - h - 2, 12, 2, r[3]);
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), h = +p.h || 160, s = seedOf(p, 41);
      if (p.smoke !== false) for (let i = 0; i < 9; i++) {
        const age = ((t * 0.12 + i / 9) % 1), px0 = x + age * 60 * (p.wind || 1) + Math.sin(t * 0.5 + i) * 3, py0 = gy - h - 4 - age * 70, rr = 3 + age * 12;
        ellipse(c, px0, py0, rr, rr * 0.7, rgba('#4a4e58', 0.35 * (1 - age)));
      }
      if (Math.floor(t * 1.2 + hash(s) * 3) % 3 === 0) Px(c, x, gy - h - 3, '#c84a3a');
    },
    lights(p, L) { return []; },
  });

  def('bridge', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 400, y = p.y !== undefined ? +p.y : gy - 30;
      const col = mix(PAL.iron[2], HAZE, 0.5), col2 = mix(PAL.iron[3], HAZE, 0.45);
      R(c, x, y, w, 3, col2); R(c, x, y + 3, w, 1, col);
      const span = 40, th = 22;
      for (let xx = 0; xx < w; xx += span) {
        line(c, x + xx, y, x + xx + span / 2, y - th, col); line(c, x + xx + span / 2, y - th, x + xx + span, y, col);
        R(c, x + xx + span / 2, y - th, 1, th, col);
      }
      R(c, x, y - th, w, 1, col2);
      for (let xx = 0; xx < w; xx += span * 3) { R(c, x + xx + 16, y + 4, 8, 60, mix(PAL.concrete[1], HAZE, 0.5)); }
      for (let xx = 6; xx < w; xx += 12) Px(c, x + xx, y - 1, '#c8a060');
    },
  });

  def('river', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = +p.x || 0, w = +p.w || (L && L.w) || 2000, y = p.y !== undefined ? +p.y : gy - 30, h = p.h || 90;
      vbands(c, x, y, w, h, '#1e2634', '#10141c', 6);
      R(c, x, y, w, 1, '#3a4658');
      for (let i = 0; i < w / 6; i++) { const xx = x + Math.floor(hash(i * 1.3 + 7) * w), yy = y + 3 + Math.floor(hash(i * 2.1 + 3) * (h - 6)); R(c, xx, yy, 3 + Math.floor(hash(i) * 6), 1, '#273142'); }
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = +p.x || 0, w = +p.w || (L && L.w) || 2000, y = p.y !== undefined ? +p.y : gy - 30, h = p.h || 90;
      // broken horizontal glints drifting slowly
      const n = Math.floor(w / 14), step = Math.floor(t * 3);
      for (let i = 0; i < n; i++) {
        const xx = x + ((hash(i * 3.7 + 1) * w + t * 4 * (0.5 + hash(i))) % w), yy = y + 2 + Math.floor(hash(i * 5.1 + 2) * (h * 0.7));
        if (hash(i * 0.9 + step * 0.13) < 0.55) R(c, xx, yy, 2 + Math.floor(hash(i + step) * 5), 1, hash(i * 7.7) < 0.3 ? '#8a7a5a' : '#4a5a70');
      }
    },
  });

  /* ── 8. Interior pieces ──────────────────────────────────────────── */
  const VINYL = ['#121216', '#1a1a20', '#24242b', '#30303a', '#3e3e4a'];
  const BEIGE = ['#45403a', '#5c564d', '#756e62', '#8d8576', '#a39a88'];
  const GRAYGREEN = ['#2a302d', '#3a423e', '#4c5550', '#5f6862', '#737c75'];
  const LEATHER = ['#2a1612', '#3e211a', '#552e22', '#6b3c2c', '#80503a'];
  const BRASS = ['#4a3a1a', '#6e5626', '#958034', '#b8a050', '#d8c27a'];
  const faceOf = (p) => (p.face === -1 ? -1 : 1);

  def('bed', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = p.kind || 'hospital', f = faceOf(p), st = PAL.steel, s = seedOf(p, 50);
      const sheet = colorRamp(p.color, kind === 'hospital' ? PAL.sheet : ramp(kind === 'single' ? '#5a4a6a' : '#4a5a4a'));
      const len = kind === 'cot' ? 52 : 60, x0 = x - len / 2;
      contact(c, x, gy, len + 4);
      if (kind === 'bunk') {
        const ir = PAL.iron;
        for (const lx of [x0, x0 + len - 2]) { R(c, lx, gy - 56, 2, 56, ir[3]); R(c, lx, gy - 56, 1, 56, ir[4] || ir[3]); }
        for (const ly of [gy - 12, gy - 42]) {
          R(c, x0, ly, len, 2, ir[2]); R(c, x0 + 2, ly - 4, len - 4, 4, sheet[2]); R(c, x0 + 2, ly - 4, len - 4, 1, sheet[3]);
          R(c, x0 + 3, ly - 7, 9, 3, PAL.sheet[3]);
        }
        for (let yy = gy - 40; yy < gy - 14; yy += 5) R(c, x0 + len - 6, yy, 4, 1, ir[3]);
        R(c, x0 + len - 6, gy - 40, 1, 26, ir[3]); R(c, x0 + len - 3, gy - 40, 1, 26, ir[3]);
        return;
      }
      if (kind === 'cot') {
        line(c, x0 + 4, gy - 1, x0 + 14, gy - 10, st[2]); line(c, x0 + 14, gy - 1, x0 + 4, gy - 10, st[2]);
        line(c, x0 + len - 4, gy - 1, x0 + len - 14, gy - 10, st[2]); line(c, x0 + len - 14, gy - 1, x0 + len - 4, gy - 10, st[2]);
        R(c, x0, gy - 12, len, 3, '#4a5038'); R(c, x0, gy - 12, len, 1, '#5e6448');
        R(c, x0 + 6, gy - 15, len - 12, 3, sheet[1]); R(c, x0 + (f > 0 ? len - 12 : 2), gy - 16, 10, 4, PAL.sheet[3]);
        return;
      }
      if (kind === 'single') {
        const wd = PAL.wood, hx = f > 0 ? x0 + len - 3 : x0;
        R(c, x0, gy - 14, len, 6, wd[2]); R(c, x0, gy - 14, len, 1, wd[3]);
        R(c, x0 + 1, gy - 8, 3, 8, wd[1]); R(c, x0 + len - 4, gy - 8, 3, 8, wd[1]);
        box(c, hx, gy - 30, 3, 30, wd); R(c, f > 0 ? x0 : x0 + len - 3, gy - 20, 3, 20, wd[1]);
        R(c, x0 + 2, gy - 18, len - 4, 4, sheet[2]); R(c, x0 + 2, gy - 18, len - 4, 1, sheet[4]);
        for (let xx = x0 + 6; xx < x0 + len - 6; xx += 8) R(c, xx, gy - 17, 4, 3, sheet[3]);
        R(c, f > 0 ? x0 + len - 14 : x0 + 4, gy - 21, 10, 4, '#b8b0a0'); R(c, f > 0 ? x0 + len - 14 : x0 + 4, gy - 21, 10, 1, '#cfc8b8');
        return;
      }
      // hospital: wheeled steel frame, raised head section, half rails
      R(c, x0 + 4, gy - 8, len - 8, 2, st[2]);
      line(c, x0 + 8, gy - 7, x0 + len - 12, gy - 13, st[1]); line(c, x0 + 8, gy - 13, x0 + len - 12, gy - 7, st[1]);
      for (const wx of [x0 + 6, x0 + len - 7]) { R(c, wx, gy - 6, 1, 3, st[3]); ellipse(c, wx, gy - 2, 2, 2, VINYL[1]); }
      R(c, x0, gy - 16, len, 3, st[2]); R(c, x0, gy - 16, len, 1, st[4]);
      R(c, x0 + 1, gy - 20, len - 2, 4, sheet[2]); R(c, x0 + 1, gy - 20, len - 2, 1, sheet[4]);
      const head = f > 0 ? x0 + len - 20 : x0 + 1;
      for (let i = 0; i < 18; i++) { const hx = f > 0 ? head + i : head + 17 - i; R(c, hx, gy - 20 - Math.floor(i * 0.33), 1, 1 + Math.floor(i * 0.33), sheet[2]); }
      R(c, f > 0 ? x0 + len - 13 : x0 + 3, gy - 27, 10, 4, PAL.sheet[4]); R(c, f > 0 ? x0 + len - 13 : x0 + 3, gy - 24, 10, 1, PAL.sheet[2]);
      R(c, f > 0 ? x0 + 4 : x0 + 20, gy - 22, len - 24, 3, ramp('#6a7a8a')[2]); R(c, f > 0 ? x0 + 4 : x0 + 20, gy - 22, len - 24, 1, ramp('#6a7a8a')[3]);
      const hb = f > 0 ? x0 + len - 2 : x0, fb = f > 0 ? x0 : x0 + len - 2;
      R(c, hb, gy - 34, 3, 26, st[3]); R(c, hb, gy - 34, 3, 1, st[4]); R(c, fb, gy - 26, 3, 18, st[3]);
      const rx = f > 0 ? x0 + len - 26 : x0 + 6;
      R(c, rx, gy - 26, 20, 1, st[4]); R(c, rx, gy - 23, 20, 1, st[3]); R(c, rx, gy - 26, 1, 6, st[3]); R(c, rx + 19, gy - 26, 1, 6, st[3]);
      if (p.chart !== false) { R(c, fb + (f > 0 ? -1 : 0), gy - 24, 4, 6, PAL.paper[3]); Px(c, fb + 1, gy - 22, PAL.ink); }
      speckle(c, x0, gy - 20, len, 4, sheet[1], 6, s, true);
    },
  });

  def('curtain', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 50, top = p.y !== undefined ? +p.y : ceilOf(L) + 6, r = colorRamp(p.color, ramp('#7d9690'));
      R(c, x - 2, top - 2, w + 4, 2, PAL.steel[3]);
      const cw = p.open ? Math.max(8, Math.floor(w * 0.18)) : w, cx = p.open && p.side === 'right' ? x + w - cw : x;
      for (let xx = 0; xx < cw; xx++) {
        const fold = Math.sin((xx / (p.open ? 2.2 : 5)) * Math.PI), col = fold > 0.5 ? r[3] : fold > -0.3 ? r[2] : r[1];
        R(c, cx + xx, top, 1, gy - 6 - top - (xx % 7 === 3 ? 1 : 0), col);
      }
      R(c, cx, top, cw, 6, r[3]); for (let xx = cx + 1; xx < cx + cw; xx += 4) Px(c, xx, top - 1, PAL.steel[4]);
      RA(c, cx, gy - 18, cw, 12, PAL.ink, 0.15);
    },
  });

  def('iv_stand', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), st = PAL.steel;
      R(c, x - 7, gy - 2, 15, 1, st[2]); for (const wx of [x - 7, x, x + 7]) R(c, wx - 1, gy - 1, 2, 1, VINYL[2]);
      R(c, x, gy - 64, 1, 62, st[4]); R(c, x - 4, gy - 64, 9, 1, st[3]); Px(c, x - 4, gy - 63, st[3]); Px(c, x + 4, gy - 63, st[3]);
      R(c, x - 6, gy - 62, 5, 9, rgba('#c8d8d8', 0.55)); R(c, x - 6, gy - 58, 5, 5, rgba('#b8d0c8', 0.7)); R(c, x - 5, gy - 53, 3, 2, rgba('#d8e4e0', 0.8));
      R(c, x - 4, gy - 51, 1, 3, '#9ab0b0');
      for (let i = 0; i < 18; i++) Px(c, x - 4 - Math.round(Math.sin(i / 18 * Math.PI) * 4) - Math.floor(i / 4), gy - 48 + i, rgba('#a8bcbc', 0.7));
    },
  });

  def('med_monitor', {
    animated: true,
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 62), st = PAL.steel;
      R(c, x - 1, y + 14, 2, 8, st[2]); R(c, x - 6, y + 21, 12, 2, st[3]);
      box(c, x - 10, y, 20, 15, BEIGE); R(c, x - 8, y + 2, 13, 10, '#0c1410'); R(c, x + 6, y + 3, 2, 2, '#5a8a5a'); R(c, x + 6, y + 7, 2, 1, BEIGE[1]);
    },
    drawAnimated(c, p, L, t) {
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 62), bpm = p.bpm || 64;
      const col = '#6fbf7a', head = Math.floor((t * 18) % 13);
      for (let i = 0; i < 13; i++) {
        const ph = ((t * bpm / 60) - (head - i) / 13 * 0.8) % 1, k = ph < 0 ? ph + 1 : ph;
        const dy = k < 0.06 ? -Math.round(k / 0.06 * 4) : k < 0.1 ? 2 : 0;
        RA(c, x - 8 + i, y + 7 + dy, 1, 1, col, i === head ? 1 : 0.25 + 0.6 * (1 - ((head - i + 13) % 13) / 13));
      }
      txt(c, String(bpm), x - 7, y + 3, { color: '#4a7a54' });
    },
    lights(p, L) { const y = p.y !== undefined ? +p.y : gyOf({}, L) - 62; return [{ x: +p.x || 0, y: y + 7, r: 24, color: '#7ac08a', k: 0.45 }]; },
  });

  def('wheelchair', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), f = faceOf(p), st = PAL.steel;
      contact(c, x, gy, 24);
      const bx = x - f * 5;
      for (let a = 0; a < 24; a++) { const an = (a / 24) * Math.PI * 2; Px(c, bx + Math.round(Math.cos(an) * 9), gy - 9 + Math.round(Math.sin(an) * 9), a % 6 === 0 ? st[4] : st[3]); }
      for (let a = 0; a < 4; a++) line(c, bx, gy - 9, bx + Math.round(Math.cos(a * 0.8) * 8), gy - 9 + Math.round(Math.sin(a * 0.8) * 8), st[1]);
      Px(c, bx, gy - 9, st[4]);
      ellipse(c, x + f * 9, gy - 2, 2, 2, VINYL[2]); R(c, x + f * 9, gy - 10, 1, 7, st[3]);
      R(c, Math.min(x - f * 6, x + f * 8), gy - 14, 14, 3, VINYL[2]); R(c, Math.min(x - f * 6, x + f * 8), gy - 14, 14, 1, VINYL[3]);
      R(c, x - f * 7, gy - 28, 2, 15, VINYL[2]); R(c, x - f * 8, gy - 30, 1, 17, st[3]); R(c, x - f * 11, gy - 30, 4, 1, st[3]);
      R(c, x - f * 6, gy - 20, f > 0 ? 12 : -12, 1, st[3]);
      line(c, x + f * 8, gy - 12, x + f * 11, gy - 4, st[3]); R(c, x + f * 10, gy - 4, f > 0 ? 4 : -4, 1, st[4]);
    },
  });

  def('parallel_bars', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 90, st = PAL.steel, wd = PAL.woodPale;
      R(c, x - 4, gy - 3, w + 8, 3, wd[2]); R(c, x - 4, gy - 3, w + 8, 1, wd[4]);
      for (const k of [0, 0.5, 1]) { const px0 = Math.round(x + (w - 2) * k); R(c, px0, gy - 30, 2, 27, st[2]); R(c, px0, gy - 30, 1, 27, st[4]); R(c, px0 - 1, gy - 4, 4, 1, st[1]); }
      R(c, x - 2, gy - 32, w + 4, 2, st[3]); R(c, x - 2, gy - 32, w + 4, 1, st[4]);
      R(c, x - 2, gy - 36, w + 4, 2, st[2]); R(c, x - 2, gy - 36, w + 4, 1, st[3]);
      for (const k of [0.1, 0.9]) R(c, x + w * k, gy - 33, 3, 1, '#7a8a6a');
    },
  });

  def('mat', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, r = colorRamp(p.color, ramp('#3a4a6a'));
      R(c, x, gy - 3, w, 4, r[2]); R(c, x, gy - 3, w, 1, r[4]); R(c, x, gy, w, 1, r[0]);
      for (let xx = x + 15; xx < x + w; xx += 16) R(c, xx, gy - 3, 1, 4, r[1]);
      speckle(c, x, gy - 2, w, 2, r[3], Math.floor(w / 8), seedOf(p, 51), true);
    },
  });

  def('desk', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = p.kind || 'office', s = seedOf(p, 52);
      const w = +p.w || (kind === 'school' ? 22 : kind === 'executive' ? 58 : kind === 'reception' || kind === 'nurse' ? 60 : 44);
      contact(c, x + w / 2, gy, w + 2);
      if (kind === 'nurse' || kind === 'reception') {
        const r = kind === 'nurse' ? BEIGE : PAL.wood, hgt = 28;
        box(c, x, gy - hgt, w, hgt, r); R(c, x - 2, gy - hgt - 3, w + 4, 3, kind === 'nurse' ? GRAYGREEN[3] : r[3]); R(c, x - 2, gy - hgt - 3, w + 4, 1, r[4]);
        for (let xx = x + 8; xx < x + w - 4; xx += 12) R(c, xx, gy - hgt + 4, 1, hgt - 8, r[1]);
        R(c, x + 4, gy - hgt - 7, 8, 4, PAL.paper[3]); R(c, x + 14, gy - hgt - 5, 6, 2, PAL.paper[2]);
        if (kind === 'nurse') { R(c, x + w - 16, gy - hgt - 13, 12, 10, BEIGE[2]); R(c, x + w - 15, gy - hgt - 12, 10, 7, '#1c2a28'); RA(c, x + w - 15, gy - hgt - 12, 10, 7, '#6a9a8a', 0.35); }
        R(c, x + Math.floor(w / 2) - 4, gy - hgt - 4, 7, 1, '#5a6a8a');
        return;
      }
      if (kind === 'school') {
        const wd = PAL.woodPale;
        R(c, x, gy - 20, w, 2, wd[3]); R(c, x, gy - 20, w, 1, wd[4]); R(c, x + 1, gy - 18, w - 2, 4, PAL.steel[1]);
        R(c, x + 2, gy - 14, 1, 14, PAL.steel[3]); R(c, x + w - 3, gy - 14, 1, 14, PAL.steel[3]);
        txt(c, 'J+M', x + 3, gy - 18, { color: wd[1] });
        return;
      }
      const r = kind === 'executive' ? ramp('#3a2418') : GRAYGREEN, hgt = 19;
      R(c, x, gy - hgt, w, 3, r[3]); R(c, x, gy - hgt, w, 1, r[4]);
      box(c, x + 1, gy - hgt + 3, w - 2, 4, r);
      const dw = Math.min(16, Math.floor(w * 0.36)), dx = x + w - dw - 1;
      box(c, dx, gy - hgt + 3, dw, hgt - 3, r);
      for (let k = 0; k < 3; k++) { R(c, dx + 1, gy - hgt + 8 + k * 4, dw - 2, 1, r[1]); R(c, dx + Math.floor(dw / 2) - 1, gy - hgt + 6 + k * 4, 3, 1, kind === 'executive' ? BRASS[3] : PAL.steel[4]); }
      R(c, x + 2, gy - hgt + 7, 2, hgt - 7, r[1]);
      if (kind === 'executive') {
        R(c, x + 6, gy - hgt - 1, 20, 1, '#2a3a2a');
        R(c, x + 8, gy - hgt - 9, 1, 8, BRASS[3]); R(c, x + 4, gy - hgt - 12, 10, 3, '#2f5a3a'); R(c, x + 4, gy - hgt - 12, 10, 1, '#4a7a52');
        R(c, x + w - 18, gy - hgt - 2, 10, 2, PAL.paper[3]);
        return;
      }
      // office clutter: CRT monitor or typewriter, files, a mug
      if (p.items !== false) {
        if (hash(s) < 0.5) { box(c, x + 4, gy - hgt - 13, 14, 12, BEIGE); R(c, x + 6, gy - hgt - 11, 10, 7, '#1a2a30'); RA(c, x + 6, gy - hgt - 11, 10, 7, '#5a8aa0', 0.25); R(c, x + 8, gy - hgt - 1, 6, 1, BEIGE[1]); }
        else { R(c, x + 4, gy - hgt - 5, 14, 5, VINYL[3]); R(c, x + 5, gy - hgt - 8, 12, 3, VINYL[2]); R(c, x + 7, gy - hgt - 10, 8, 2, PAL.paper[4]); }
        R(c, x + 22, gy - hgt - 4, 10, 4, '#8a7a4a'); R(c, x + 22, gy - hgt - 4, 10, 1, '#a89a62'); R(c, x + 23, gy - hgt - 6, 8, 2, PAL.paper[3]);
        R(c, x + w - 7, gy - hgt - 4, 3, 4, '#a8a090'); Px(c, x + w - 4, gy - hgt - 3, '#a8a090');
      }
    },
    lights(p, L) {
      if (p.kind !== 'executive' || p.lamp === false) return [];
      return [{ x: (+p.x || 0) + 9, y: gyOf(p, L) - 30, r: 46, color: '#e8c070', k: 0.75 }];
    },
  });

  def('chair', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = p.kind || 'wood', f = faceOf(p), back = x - f * 5;
      contact(c, x, gy, 12);
      if (kind === 'office') {
        R(c, x - 6, gy - 1, 13, 1, VINYL[3]); Px(c, x - 6, gy, VINYL[2]); Px(c, x + 6, gy, VINYL[2]); R(c, x, gy - 8, 1, 7, PAL.steel[3]);
        R(c, x - 6, gy - 12, 13, 4, VINYL[2]); R(c, x - 6, gy - 12, 13, 1, VINYL[4]);
        R(c, back - 1, gy - 26, 4, 14, VINYL[2]); R(c, back - 1, gy - 26, 4, 1, VINYL[4]); R(c, back, gy - 14, 1, 3, PAL.steel[2]);
        return;
      }
      if (kind === 'stool') {
        R(c, x - 5, gy - 18, 11, 2, LEATHER[3]); R(c, x - 5, gy - 18, 11, 1, LEATHER[4]);
        line(c, x - 3, gy - 16, x - 5, gy - 1, PAL.steel[3]); line(c, x + 3, gy - 16, x + 5, gy - 1, PAL.steel[3]); R(c, x, gy - 16, 1, 15, PAL.steel[2]);
        R(c, x - 4, gy - 7, 9, 1, PAL.steel[2]);
        return;
      }
      if (kind === 'armchair') {
        const r = colorRamp(p.color, ramp('#5a3e3a'));
        box(c, x - 9, gy - 14, 19, 10, r); box(c, back - (f > 0 ? 2 : 0) - 1, gy - 28, 5, 16, r);
        box(c, x + f * 6 - 2, gy - 18, 5, 6, r); R(c, x - 8, gy - 4, 2, 4, PAL.wood[1]); R(c, x + 7, gy - 4, 2, 4, PAL.wood[1]);
        speckle(c, x - 9, gy - 28, 19, 24, r[1], 6, seedOf(p, 53), true);
        return;
      }
      const r = kind === 'plastic' ? colorRamp(p.color, ramp('#7a6a4a')) : kind === 'folding' ? PAL.steel : PAL.wood;
      R(c, x - 6, gy - 12, 12, 2, r[3]); R(c, x - 6, gy - 12, 12, 1, r[4]);
      if (kind === 'folding') { line(c, x - 5, gy - 10, x + 5, gy - 1, r[2]); line(c, x + 5, gy - 10, x - 5, gy - 1, r[2]); }
      else { R(c, x - 5, gy - 10, 1, 10, r[2]); R(c, x + 4, gy - 10, 1, 10, r[1]); }
      R(c, back - 1, gy - 26, 2, 14, r[2]);
      if (kind === 'wood') for (let yy = gy - 25; yy < gy - 14; yy += 4) R(c, back - 1, yy, f > 0 ? 3 : -2, 1, r[3]);
      else R(c, back - 2, gy - 26, 4, 7, r[3]);
    },
  });

  def('table', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), kind = p.kind || 'wood', w = +p.w || (kind === 'coffee' ? 30 : 40), s = seedOf(p, 54);
      contact(c, x + w / 2, gy, w);
      if (kind === 'diner') {
        R(c, x, gy - 21, w, 2, '#9a9688'); R(c, x, gy - 19, w, 1, PAL.steel[4]); R(c, x + Math.floor(w / 2) - 1, gy - 18, 3, 17, PAL.steel[3]); R(c, x + Math.floor(w / 2) - 5, gy - 1, 11, 1, PAL.steel[2]);
        R(c, x + 4, gy - 24, 3, 3, '#cfc8b8'); R(c, x + w - 9, gy - 23, 5, 2, '#b8a890'); R(c, x + w - 14, gy - 25, 2, 4, '#8a3a2a');
        return;
      }
      const r = kind === 'folding' ? BEIGE : kind === 'kitchen' ? PAL.woodPale : PAL.wood, th = kind === 'coffee' ? 10 : 19;
      R(c, x, gy - th, w, 2, r[3]); R(c, x, gy - th, w, 1, r[4]); R(c, x + 1, gy - th + 2, w - 2, 1, r[1]);
      const lg = kind === 'folding' ? PAL.steel : r;
      R(c, x + 1, gy - th + 2, 2, th - 2, lg[2]); R(c, x + w - 3, gy - th + 2, 2, th - 2, lg[1]);
      if (kind === 'kitchen') { R(c, x - 1, gy - th, w + 2, 5, '#8a5a5a'); for (let xx = x; xx < x + w; xx += 4) R(c, xx, gy - th + 1, 2, 2, '#b8a8a0'); }
      if (p.items !== false && hash(s) < 0.7) { R(c, x + 4, gy - th - 3, 3, 3, '#cfc8b8'); R(c, x + Math.floor(w / 2), gy - th - 1, 8, 1, PAL.paper[3]); }
    },
  });

  def('filing_cabinet', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 1, r = colorRamp(p.color, GRAYGREEN), s = seedOf(p, 55);
      for (let i = 0; i < n; i++) {
        const cx = x + i * 16;
        box(c, cx, gy - 36, 16, 36, r);
        for (let k = 0; k < 4; k++) {
          const dy = gy - 35 + k * 9, open = hash(s + i * 4 + k) < 0.08 ? 2 : 0;
          if (open) R(c, cx - 1, dy, 18, 8, r[3]);
          R(c, cx + 1 - open, dy + 7, 14 + open * 2, 1, r[0]); R(c, cx + 6, dy + 2, 4, 1, PAL.steel[4]); R(c, cx + 5, dy + 4, 6, 2, r[1]); R(c, cx + 6, dy + 4, 4, 1, PAL.paper[3]);
        }
      }
      contact(c, x + n * 8, gy, n * 16 + 2);
      if (p.items !== false) { R(c, x + 2, gy - 40, 10, 4, PAL.paper[2]); R(c, x + 3, gy - 42, 8, 2, '#7a5a3a'); }
    },
  });

  const BOOKS = ['#5a2e2a', '#2e3e5a', '#4a5a3a', '#6a5a3a', '#3a2e3e', '#7a6a4a', '#5a4a3a', '#8a7a5a'];
  def('shelf', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 40, h = +p.h || 56, items = p.items || 'books', s = seedOf(p, 56);
      const r = items === 'tools' || items === 'cans' ? PAL.steel : PAL.wood;
      contact(c, x + w / 2, gy, w + 2);
      R(c, x, gy - h, w, h, shade(r[0], -0.2)); R(c, x, gy - h, 2, h, r[2]); R(c, x + w - 2, gy - h, 2, h, r[1]);
      const n = Math.max(2, Math.round(h / 16)), sh = h / n;
      for (let k = 0; k < n; k++) {
        const by = Math.round(gy - h + (k + 1) * sh) - 2, top = Math.round(gy - h + k * sh) + 2;
        R(c, x, by, w, 2, r[3]); R(c, x, by, w, 1, r[4]);
        let xx = x + 2;
        while (xx < x + w - 3) {
          const hv = hash(s + xx * 0.7 + k * 3.1);
          if (hv < 0.12) { xx += 3; continue; }
          if (items === 'books') {
            const bw = 2 + Math.floor(hv * 3), bh = Math.min(by - top, 8 + Math.floor(hash(s + xx) * 5)), col = BOOKS[Math.floor(hash(s + xx * 1.3 + k) * BOOKS.length)];
            if (hv > 0.9) { R(c, xx, by - 3, 9, 3, col); R(c, xx, by - 3, 9, 1, shade(col, 0.2)); xx += 10; continue; }
            R(c, xx, by - bh, bw, bh, col); Px(c, xx, by - bh + 2, shade(col, 0.3)); xx += bw;
          } else if (items === 'boxes' || items === 'files') {
            const bw = items === 'files' ? 3 : 8 + Math.floor(hv * 4), bh = Math.min(by - top, items === 'files' ? 10 : 7 + Math.floor(hv * 4));
            const col = items === 'files' ? ['#5a6a7a', '#7a6a4a', '#4a5a4a', '#8a7a5a'][Math.floor(hv * 4)] : ['#7a6248', '#8a7050', '#6a5440'][Math.floor(hv * 3)];
            R(c, xx, by - bh, bw, bh, col); R(c, xx, by - bh, bw, 1, shade(col, 0.2)); if (items === 'boxes') R(c, xx + 2, by - bh + 2, 3, 2, PAL.paper[3]);
            xx += bw + (items === 'files' ? 0 : 1);
          } else if (items === 'cans') {
            const col = ['#8a3a2a', '#3a5a7a', '#b8a050', '#5a7a4a'][Math.floor(hv * 4)];
            R(c, xx, by - 6, 4, 6, col); R(c, xx, by - 6, 4, 1, PAL.steel[4]); R(c, xx, by - 4, 4, 2, PAL.paper[3]); xx += 5;
          } else if (items === 'trophies') {
            R(c, xx + 1, by - 2, 5, 2, PAL.wood[3]); R(c, xx + 3, by - 5, 1, 3, BRASS[3]); R(c, xx + 1, by - 9, 5, 4, BRASS[3]); R(c, xx + 1, by - 9, 1, 4, BRASS[4]); R(c, xx, by - 8, 1, 2, BRASS[2]); R(c, xx + 6, by - 8, 1, 2, BRASS[2]); xx += 9;
          } else {
            const tk = Math.floor(hv * 3);
            if (tk === 0) { R(c, xx, by - 3, 8, 3, '#8a3a2a'); R(c, xx, by - 3, 8, 1, '#a85a3a'); xx += 9; }
            else if (tk === 1) { R(c, xx, by - 5, 6, 5, PAL.steel[2]); R(c, xx + 1, by - 6, 4, 1, PAL.steel[4]); xx += 7; }
            else { R(c, xx, by - 7, 2, 7, PAL.wood[2]); R(c, xx + 3, by - 6, 3, 6, PAL.rust[2]); xx += 7; }
          }
        }
      }
      R(c, x, gy - h, w, 2, r[3]); RA(c, x + 2, gy - h + 2, w - 4, 2, PAL.ink, 0.3);
    },
  });

  def('locker', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 4, r = colorRamp(p.color, ramp('#3e5262')), s = seedOf(p, 57);
      const openIdx = p.open === true ? 0 : typeof p.open === 'number' ? p.open : -1;
      R(c, x, gy - 4, n * 12, 4, VINYL[2]);
      for (let i = 0; i < n; i++) {
        const lx = x + i * 12, top = gy - 48;
        if (i === openIdx) {
          R(c, lx, top, 12, 44, PAL.ink); R(c, lx + 1, top + 8, 10, 1, r[1]); R(c, lx + 3, top + 10, 6, 14, '#5a6a8a'); R(c, lx + 4, top + 9, 4, 2, PAL.steel[3]);
          box(c, lx - 5, top, 5, 44, r);
          continue;
        }
        box(c, lx, top, 12, 44, r);
        for (let k = 0; k < 3; k++) R(c, lx + 3, top + 3 + k * 2, 6, 1, r[0]);
        for (let k = 0; k < 3; k++) R(c, lx + 3, top + 36 + k * 2, 6, 1, r[0]);
        R(c, lx + 9, top + 18, 1, 6, PAL.steel[4]); R(c, lx + 3, top + 12, 5, 3, PAL.paper[3]);
        txt(c, String((p.start || 11) + i), lx + 5, top + 12, { align: 'center', color: PAL.ink });
        if (hash(s + i) < 0.3) speckle(c, lx, top + 20, 12, 20, r[1], 6, s + i, true);
        if (hash(s + i * 2) < 0.2) R(c, lx + 2, top + 26, 7, 8, ['#8a5a4a', '#b8b0a0', PAL.fadedBlue][i % 3]);
      }
    },
  });

  function crt(c, x, y, w, h) {
    box(c, x, y, w, h, ['#1a1a1e', '#26262c', '#33333a', '#44444c', '#55555e']);
    R(c, x + 2, y + 2, w - 7, h - 4, '#0c0e12');
    R(c, x + w - 4, y + 3, 2, 1, '#7a7a80'); R(c, x + w - 4, y + 6, 2, 1, '#5a5a60');
  }
  def('tv', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf({}, L), x = Math.round(+p.x || 0), w = p.w || 22, h = p.h || 17;
      const y = p.y !== undefined ? Math.round(+p.y) : gy - 16 - h;
      if (p.y === undefined && p.stand !== false) { box(c, x - 13, gy - 16, 26, 16, PAL.wood); R(c, x - 11, gy - 13, 10, 10, PAL.wood[1]); R(c, x + 1, gy - 13, 10, 10, PAL.wood[1]); contact(c, x, gy, 28); }
      if (p.mount) { R(c, x - 2, y - 6, 4, 6, PAL.steel[2]); R(c, x - 6, y - 7, 12, 2, PAL.steel[3]); }
      crt(c, x - Math.floor(w / 2), y, w, h);
      line(c, x - 3, y, x - 7, y - 7, PAL.steel[3]); line(c, x + 2, y, x + 6, y - 8, PAL.steel[3]);
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf({}, L), x = Math.round(+p.x || 0), w = p.w || 22, h = p.h || 17;
      const y = p.y !== undefined ? Math.round(+p.y) : gy - 16 - h;
      const sx = x - Math.floor(w / 2) + 2, sy = y + 2, sw = w - 7, sh = h - 4;
      if (!p.on) { RA(c, sx + 1, sy + 1, 3, 2, '#5a6070', 0.4); return; }
      const content = p.content || 'static', fr = Math.floor(t * 12);
      if (content === 'static') {
        R(c, sx, sy, sw, sh, '#3a4048');
        for (let i = 0; i < sw * sh * 0.45; i++) Px(c, sx + Math.floor(hash(fr * 3.1 + i * 0.37) * sw), sy + Math.floor(hash(fr * 1.7 + i * 0.73) * sh), hash(fr + i) < 0.5 ? '#9aa4b0' : '#20242a');
        R(c, sx, sy + ((fr * 2) % sh), sw, 1, '#aab4be');
      } else if (content === 'boxing') {
        vbands(c, sx, sy, sw, sh, '#2a3448', '#4a4a3a', 3);
        R(c, sx, sy + sh - 3, sw, 1, '#c8b8a0'); R(c, sx, sy + sh - 6, sw, 1, '#a83a2a');
        const bob = Math.round(Math.sin(t * 5) * 1), lunge = Math.sin(t * 3.3) > 0.7 ? 1 : 0;
        R(c, sx + 3 + lunge, sy + 3 + bob, 2, 6, '#c08a6a'); R(c, sx + 5 + lunge * 2, sy + 4, 2, 1, '#a83a2a');
        R(c, sx + sw - 5, sy + 3 - bob, 2, 6, '#8a6a4a'); R(c, sx + sw - 7, sy + 4, 2, 1, '#3a5a8a');
      } else {
        vbands(c, sx, sy, sw, sh, '#3a4a6a', '#2a3448', 3);
        R(c, sx + Math.floor(sw / 2) - 2, sy + 2, 4, 3, '#b08a6a'); R(c, sx + Math.floor(sw / 2) - 3, sy + 5, 6, sh - 8, '#2a2a3a');
        R(c, sx, sy + sh - 3, sw, 3, '#8a2a2a'); if (fr % 8 < 6) R(c, sx + 1, sy + sh - 2, sw - 3, 1, '#d8ccb0');
      }
      RA(c, sx, sy, sw, 1, '#ffffff', 0.15);
    },
    lights(p, L) {
      if (!p.on) return [];
      const gy = gyOf({}, L), h = p.h || 17, y = p.y !== undefined ? +p.y : gy - 16 - h;
      return [{ x: +p.x || 0, y: y + h / 2, r: 60, color: PAL.tvBlue, k: 0.6, flicker: 0.4 }];
    },
  });

  def('radio', {
    draw(c, p, L) {
      const gy = gyOf({}, L), x = Math.round(+p.x || 0), y = p.y !== undefined ? Math.round(+p.y) : gy - 10;
      box(c, x - 9, y, 18, 10, ['#2a1c14', '#3e2a1c', '#5a3e28', '#6e4e34', '#84603e']);
      for (let yy = y + 2; yy < y + 8; yy += 2) R(c, x - 7, yy, 8, 1, '#2a1c14');
      R(c, x + 3, y + 2, 4, 3, '#c8b070'); Px(c, x + 4, y + 3, '#8a2a1a'); Px(c, x + 3, y + 7, '#b8b0a0'); Px(c, x + 6, y + 7, '#b8b0a0');
      line(c, x + 7, y, x + 12, y - 9, PAL.steel[4]);
    },
  });

  def('sofa', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 50, r = colorRamp(p.color, ramp('#5a4a3a')), s = seedOf(p, 58);
      contact(c, x + w / 2, gy, w + 2);
      box(c, x + 2, gy - 26, w - 4, 12, r);
      box(c, x, gy - 15, w, 11, r);
      for (let xx = x + Math.floor(w / 2); xx < x + w - 4; xx += Math.floor(w / 2)) R(c, xx, gy - 15, 1, 6, r[1]);
      box(c, x - 2, gy - 19, 6, 15, r); box(c, x + w - 4, gy - 19, 6, 15, r);
      R(c, x + 2, gy - 4, 2, 4, PAL.wood[1]); R(c, x + w - 4, gy - 4, 2, 4, PAL.wood[1]);
      if (hash(s) < 0.6) { const px0 = x + 6 + Math.floor(hash(s + 1) * (w - 16)); R(c, px0, gy - 13, 5, 3, shade(r[2], 0.18)); Px(c, px0, gy - 13, r[0]); }
      if (p.blanket !== false) { R(c, x + w - 18, gy - 25, 10, 13, '#6a3a3a'); for (let yy = gy - 24; yy < gy - 12; yy += 3) R(c, x + w - 18, yy, 10, 1, '#8a5a4a'); }
    },
  });

  def('fridge', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ramp('#8a8674'));
      contact(c, x, gy, 20);
      box(c, x - 9, gy - 46, 18, 44, r); R(c, x - 9, gy - 46, 18, 1, r[4]);
      R(c, x - 8, gy - 32, 16, 1, r[0]); R(c, x + 5, gy - 43, 1, 8, PAL.steel[4]); R(c, x + 5, gy - 28, 1, 12, PAL.steel[4]);
      R(c, x - 8, gy - 2, 16, 2, r[0]);
      // magnets, a child's drawing, a note: someone lives here
      R(c, x - 6, gy - 26, 6, 7, PAL.paper[3]); R(c, x - 5, gy - 24, 3, 2, '#8a5a8a'); Px(c, x - 3, gy - 27, '#a83a2a');
      R(c, x - 6, gy - 42, 5, 4, '#cfc8b8'); Px(c, x - 4, gy - 43, '#3a6a8a'); R(c, x + 1, gy - 22, 3, 3, '#b8a050');
    },
  });

  def('stove', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ramp('#8a8674'));
      contact(c, x, gy, 22);
      box(c, x - 10, gy - 22, 20, 22, r); R(c, x - 10, gy - 30, 20, 8, r[1]); R(c, x - 9, gy - 29, 18, 1, r[3]);
      Px(c, x - 6, gy - 26, '#c8c0a0'); txt(c, '12', x + 3, gy - 28, { color: r[0] });
      R(c, x - 10, gy - 23, 20, 1, VINYL[2]); R(c, x - 8, gy - 24, 6, 1, VINYL[1]); R(c, x + 2, gy - 24, 6, 1, VINYL[1]);
      R(c, x - 7, gy - 27, 6, 3, '#4a4a50'); R(c, x - 8, gy - 26, 1, 1, '#4a4a50');
      for (let i = 0; i < 4; i++) Px(c, x - 7 + i * 4, gy - 20, VINYL[1]);
      R(c, x - 8, gy - 17, 16, 11, r[1]); R(c, x - 6, gy - 15, 12, 6, '#1a1a1e'); R(c, x - 6, gy - 18, 12, 1, PAL.steel[4]);
    },
  });

  def('sink', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), wd = PAL.woodPale;
      contact(c, x, gy, 24);
      box(c, x - 11, gy - 19, 22, 19, wd); R(c, x, gy - 17, 1, 15, wd[1]); Px(c, x - 2, gy - 12, BRASS[3]); Px(c, x + 2, gy - 12, BRASS[3]);
      R(c, x - 12, gy - 21, 24, 2, '#8a8a80'); R(c, x - 12, gy - 21, 24, 1, '#a8a8a0'); R(c, x - 7, gy - 21, 14, 1, '#4a4e54');
      R(c, x + 2, gy - 28, 2, 7, PAL.steel[4]); R(c, x - 2, gy - 28, 5, 1, PAL.steel[4]); Px(c, x - 2, gy - 27, PAL.steel[3]);
      R(c, x - 10, gy - 25, 6, 4, '#c8c0b0'); Px(c, x - 9, gy - 26, '#c8c0b0');
    },
  });

  def('counter', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, wd = colorRamp(p.color, PAL.woodPale), s = seedOf(p, 59);
      contact(c, x + w / 2, gy, w + 2);
      box(c, x, gy - 19, w, 19, wd);
      for (let xx = x + 2; xx < x + w - 6; xx += 12) { R(c, xx, gy - 16, 10, 12, wd[1]); R(c, xx + 1, gy - 15, 8, 10, wd[2]); Px(c, xx + 8, gy - 11, BRASS[3]); }
      R(c, x - 1, gy - 21, w + 2, 2, '#7a7a6e'); R(c, x - 1, gy - 21, w + 2, 1, '#9a9a8c');
      if (p.items !== false) for (let xx = x + 4; xx < x + w - 6; xx += 10) {
        const k = Math.floor(hash(s + xx) * 4);
        if (k === 0) { R(c, xx, gy - 26, 5, 5, '#6a6a70'); R(c, xx + 1, gy - 27, 3, 1, '#8a8a90'); }
        else if (k === 1) { R(c, xx, gy - 24, 3, 3, '#cfc8b8'); }
        else if (k === 2) { R(c, xx, gy - 27, 2, 6, '#5a3a2a'); R(c, xx + 3, gy - 25, 2, 4, '#8a7a4a'); }
      }
    },
  });

  // lamp: desk/floor stand on y (default ground); bulb/fluorescent/pendant hang from y (default ceiling).
  const hangs = (k) => k === 'bulb' || k === 'fluorescent' || k === 'pendant' || k === 'cage' || k === 'panel';
  function drawHanging(c, x, cy, kind, on, len) {
    const st = PAL.steel;
    if (kind === 'fluorescent' || kind === 'panel') {
      R(c, x - 16, cy, 32, 3, st[2]); R(c, x - 16, cy, 32, 1, st[3]);
      R(c, x - 14, cy + 3, 28, 1, on ? '#e4eee8' : '#6a7470'); if (on) RA(c, x - 15, cy + 4, 30, 1, '#cfe0d6', 0.5);
      return cy + 4;
    }
    R(c, x, cy, 1, len, '#1c1c20');
    const by = cy + len;
    if (kind === 'bulb') { R(c, x - 1, by, 3, 2, st[2]); R(c, x - 1, by + 2, 3, 3, on ? '#fbe3a8' : '#8a8478'); if (on) Px(c, x, by + 3, '#ffffff'); return by + 4; }
    if (kind === 'cage') { R(c, x - 3, by, 7, 2, st[2]); R(c, x - 2, by + 2, 5, 4, on ? '#f2c46e' : '#6a6458'); for (let i = -3; i <= 3; i += 2) R(c, x + i, by + 2, 1, 5, st[1]); return by + 6; }
    for (let i = 0; i < 5; i++) R(c, x - 2 - i, by + i, 5 + i * 2, 1, i === 4 ? st[1] : st[2]);
    if (on) R(c, x - 5, by + 5, 11, 1, '#fbe3a8');
    return by + 5;
  }
  def('lamp', {
    draw(c, p, L) {
      const kind = p.kind || 'desk', x = Math.round(+p.x || 0), on = p.on !== false;
      if (hangs(kind)) { drawHanging(c, x, p.y !== undefined ? +p.y : ceilOf(L), kind, on, p.len || 20); return; }
      const gy = gyOf(p, L);
      if (kind === 'floor') {
        contact(c, x, gy, 10); R(c, x - 4, gy - 2, 9, 2, BRASS[2]); R(c, x, gy - 46, 1, 44, BRASS[3]);
        for (let i = 0; i < 7; i++) R(c, x - 3 - Math.floor(i / 2), gy - 54 + i, 7 + Math.floor(i / 2) * 2, 1, on ? (i < 2 ? '#e8d0a0' : '#d8b880') : '#7a6a58');
        return;
      }
      R(c, x - 3, gy - 1, 7, 1, BRASS[2]); line(c, x, gy - 1, x + 2, gy - 8, BRASS[3]); line(c, x + 2, gy - 8, x - 2, gy - 12, BRASS[3]);
      for (let i = 0; i < 4; i++) R(c, x - 4 - i, gy - 14 + i, 5 + i, 1, '#2f5a3a');
      if (on) R(c, x - 7, gy - 10, 6, 1, '#fbe3a8');
    },
    lights(p, L) {
      if (p.on === false) return [];
      const kind = p.kind || 'desk', x = +p.x || 0;
      if (hangs(kind)) {
        const cy = p.y !== undefined ? +p.y : ceilOf(L), len = p.len || 20;
        if (kind === 'fluorescent' || kind === 'panel') return [{ x, y: cy + 4, r: 150, color: p.color || PAL.fluoro, k: 0.85, flicker: +p.flicker || 0, cone: { dir: 'down', width: 110 } }];
        return [{ x, y: cy + len + 4, r: kind === 'pendant' ? 130 : 100, color: p.color || PAL.lamp, k: 0.9, flicker: +p.flicker || 0, cone: kind === 'pendant' ? { dir: 'down', width: 60 } : undefined }];
      }
      const gy = gyOf(p, L);
      return kind === 'floor' ? [{ x, y: gy - 50, r: 80, color: PAL.lampWarm, k: 0.8 }] : [{ x: x - 4, y: gy - 10, r: 44, color: PAL.lamp, k: 0.8 }];
    },
  });

  def('ceiling_light', {
    draw(c, p, L) { drawHanging(c, Math.round(+p.x || 0), p.y !== undefined ? +p.y : ceilOf(L), p.kind || 'fluorescent', p.on !== false, p.len || (p.kind === 'pendant' ? 26 : 14)); },
    lights(p, L) {
      if (p.on === false) return [];
      const kind = p.kind || 'fluorescent', cy = p.y !== undefined ? +p.y : ceilOf(L), len = p.len || (kind === 'pendant' ? 26 : 14), x = +p.x || 0;
      const fl = p.flicker === true ? 0.6 : +p.flicker || 0;
      if (kind === 'fluorescent' || kind === 'panel') return [{ x, y: cy + 4, r: p.r || 160, color: p.color || PAL.fluoro, k: 0.85, flicker: fl, cone: { dir: 'down', width: 120 } }];
      return [{ x, y: cy + len + 4, r: p.r || 140, color: p.color || PAL.lamp, k: 0.9, flicker: fl, cone: kind === 'bulb' ? undefined : { dir: 'down', width: kind === 'cage' ? 80 : 60 } }];
    },
  });

  def('picture', {
    draw(c, p, L) {
      const kind = p.kind || 'photo', w = +p.w || (kind === 'calendar' ? 16 : kind === 'certificate' ? 16 : 12), h = +p.h || (kind === 'calendar' ? 20 : 10);
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 56), s = seedOf(p, 60);
      RA(c, x + 1, y + 1, w, h, PAL.ink, 0.35);
      if (kind === 'calendar') {
        R(c, x, y, w, h, '#c8c0aa'); R(c, x, y, w, 8, '#5a6a7a'); R(c, x + 2, y + 2, w - 4, 4, '#8aa0a8');
        txt(c, p.text || 'AUG', x + Math.floor(w / 2), y + 9, { align: 'center', color: '#8a2a22' });
        for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 4; k++) Px(c, x + 2 + k * 4, y + 15 + r2 * 2, '#6a6458');
        if (p.circle !== false) { R(c, x + 9, y + 16, 3, 1, '#a83a2a'); R(c, x + 9, y + 18, 3, 1, '#a83a2a'); }
        return;
      }
      const fr = kind === 'certificate' ? BRASS : kind === 'photo' ? ramp('#3a2a20') : PAL.wood;
      R(c, x, y, w, h, fr[2]); R(c, x, y, w, 1, fr[4]); R(c, x + w - 1, y, 1, h, fr[1]);
      const ix = x + 1, iy = y + 1, iw = w - 2, ih = h - 2;
      if (kind === 'certificate') { R(c, ix, iy, iw, ih, '#cfc6ac'); R(c, ix + 2, iy + 2, iw - 4, 1, '#5a4a3a'); R(c, ix + 2, iy + 4, iw - 6, 1, '#8a7a6a'); ellipse(c, ix + iw - 3, iy + ih - 3, 1, 1, '#a83a2a'); }
      else if (kind === 'poster') drawPoster(c, ix, iy, iw, ih, p.poster || 'boxing', false, p.text, s);
      else if (kind === 'photo') {
        R(c, ix, iy, iw, ih, '#8a8070'); R(c, ix, iy, iw, Math.floor(ih / 2), '#6a7a8a');
        const n = p.people || 3; for (let i = 0; i < n; i++) person(c, ix + 2 + Math.floor(((iw - 4) * (i + 0.5)) / n), iy + ih, Math.max(5, ih - 2 - (i % 2)), ['#3a4a6a', '#6a3a3a', '#5a5a4a'][i % 3], { skin: '#b08a6a' });
        RA(c, ix, iy, iw, ih, '#c8a878', 0.2);
      } else { vbands(c, ix, iy, iw, ih, '#5a6a7a', '#7a7058', 3); R(c, ix, iy + ih - 3, iw, 3, '#4a5a3a'); }
    },
  });

  def('clock', {
    animated: true,
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 70);
      ellipse(c, x, y + 6, 6, 6, '#2a2a30'); ellipse(c, x, y + 6, 5, 5, '#c8c2b0');
      for (let i = 0; i < 12; i += 3) { const a = (i / 12) * Math.PI * 2; Px(c, x + Math.round(Math.sin(a) * 4), y + 6 - Math.round(Math.cos(a) * 4), '#4a4a50'); }
    },
    drawAnimated(c, p, L, t) {
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 70);
      // p.time 'H:MM' freezes the hands (a stopped clock tells its own story)
      let mins;
      if (p.time) { const m = String(p.time).split(':'); mins = (+m[0] % 12) * 60 + (+m[1] || 0); } else mins = ((p.start || 9 * 60 + 40) + t / 60) % 720;
      const ha = (mins / 720) * Math.PI * 2, ma = ((mins % 60) / 60) * Math.PI * 2;
      line(c, x, y + 6, x + Math.round(Math.sin(ha) * 2.5), y + 6 - Math.round(Math.cos(ha) * 2.5), '#1a1a1e');
      line(c, x, y + 6, x + Math.round(Math.sin(ma) * 4), y + 6 - Math.round(Math.cos(ma) * 4), '#3a3a40');
      if (!p.time) { const sa = (t % 60) / 60 * Math.PI * 2; Px(c, x + Math.round(Math.sin(sa) * 4), y + 6 - Math.round(Math.cos(sa) * 4), '#a83a2a'); }
    },
  });

  def('bulletin_board', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 40, h = +p.h || 26, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 64), s = seedOf(p, 61);
      RA(c, x + 1, y + 1, w, h, PAL.ink, 0.3);
      R(c, x, y, w, h, PAL.wood[2]); R(c, x + 1, y + 1, w - 2, h - 2, '#7a5e40'); speckle(c, x + 1, y + 1, w - 2, h - 2, '#6a4e34', Math.floor(w * h / 8), s, false);
      const pins = ['#a83a2a', '#3a6a9a', '#b8a050', '#5a8a5a'];
      for (let i = 0; i < Math.floor(w * h / 120) + 2; i++) {
        const pw = 6 + Math.floor(hash(s + i) * 6), ph = 6 + Math.floor(hash(s + i * 2) * 5), px0 = x + 2 + Math.floor(hash(s + i * 3) * (w - pw - 4)), py0 = y + 2 + Math.floor(hash(s + i * 4) * (h - ph - 4));
        const col = hash(s + i * 5) < 0.2 ? '#b8a87a' : hash(s + i * 5) < 0.35 ? '#8aa0a8' : PAL.paper[3];
        R(c, px0 + 1, py0 + 1, pw, ph, rgba(PAL.ink, 0.3)); R(c, px0, py0, pw, ph, col);
        for (let yy = py0 + 2; yy < py0 + ph - 1; yy += 2) R(c, px0 + 1, yy, pw - 2 - (yy % 3), 1, '#5a5448');
        Px(c, px0 + Math.floor(pw / 2), py0, pins[i % 4]);
      }
    },
  });

  def('chalkboard', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 60, h = +p.h || 30, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 70), s = seedOf(p, 62);
      R(c, x - 2, y - 2, w + 4, h + 4, PAL.wood[2]); R(c, x - 2, y - 2, w + 4, 1, PAL.wood[3]);
      R(c, x, y, w, h, '#2a3a32'); speckle(c, x, y, w, h, '#34463c', Math.floor(w * h / 10), s, true);
      for (let i = 0; i < 3; i++) RA(c, x + Math.floor(hash(s + i) * (w - 16)), y + Math.floor(hash(s + i * 2) * (h - 6)), 16, 4, '#8a9a90', 0.12);
      (p.lines || []).forEach((l, i) => txt(c, l, x + 3, y + 3 + i * 7, { color: '#c8ccc0' }));
      R(c, x - 2, y + h + 2, w + 4, 2, PAL.wood[3]); R(c, x + 6, y + h + 1, 4, 1, '#d8d8cc'); R(c, x + 14, y + h + 1, 6, 1, '#4a4a40');
    },
  });

  def('boxes', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 3, s = seedOf(p, 63);
      const cb = ['#4a3a28', '#5e4a32', '#74603e', '#8a744c', '#9e875a'];
      const placed = [];
      contact(c, x, gy, Math.min(n, 3) * 16 + 4);
      for (let i = 0; i < n; i++) {
        const col = i % 3, row = Math.floor(i / 3), bw = 14 + Math.floor(hash(s + i) * 5), bh = 10 + Math.floor(hash(s + i * 2) * 5);
        const below = placed.filter((q) => q.col === col).reduce((m, q) => Math.min(m, q.y), gy);
        const bx = x - 24 + col * 16 + (row % 2) * 2, by = below - bh;
        box(c, bx, by, bw, bh, cb); R(c, bx + Math.floor(bw / 2) - 1, by, 2, bh, cb[3]); R(c, bx, by, bw, 1, cb[4]);
        if (i === 0 && p.label) txt(c, p.label, bx + Math.floor(bw / 2), by + 3, { align: 'center', color: '#2a2018' });
        else if (hash(s + i * 3) < 0.4) R(c, bx + 2, by + 4, 5, 3, PAL.paper[3]);
        placed.push({ col, y: by });
      }
    },
  });

  def('heavy_bag', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), top = p.y !== undefined ? +p.y : ceilOf(L);
      R(c, x - 3, top, 7, 2, PAL.iron[3]);
      contact(c, x, gy, 12);
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x0 = Math.round(+p.x || 0), top = p.y !== undefined ? +p.y : ceilOf(L);
      const sway = (p.sway || 0.6) * Math.sin(t * 1.9 + seedOf(p, 64)), bagTop = gy - 52, r = colorRamp(p.color, LEATHER);
      const bx = Math.round(x0 + sway);
      for (let yy = top + 2; yy < bagTop - 4; yy += 2) Px(c, Math.round(lerp(x0, bx, (yy - top) / (bagTop - top))), yy, PAL.iron[3]);
      line(c, bx, bagTop - 4, bx - 4, bagTop, PAL.iron[2]); line(c, bx, bagTop - 4, bx + 4, bagTop, PAL.iron[2]);
      R(c, bx - 6, bagTop, 12, 34, r[2]); R(c, bx - 6, bagTop, 3, 34, r[3]); R(c, bx + 4, bagTop, 2, 34, r[1]);
      R(c, bx - 6, bagTop, 12, 2, r[4]); R(c, bx - 5, bagTop + 33, 10, 2, r[1]);
      for (const ty of [9, 24]) R(c, bx - 6, bagTop + ty, 12, 2, '#5a5a5e');
      R(c, bx - 2, bagTop + 13, 4, 6, r[3]);
    },
  });

  def('speed_bag', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), wd = PAL.wood, py = gy - 60;
      R(c, x - 2, py - 18, 4, 24, PAL.iron[2]); R(c, x - 14, py, 28, 4, wd[2]); R(c, x - 14, py, 28, 1, wd[4]); R(c, x - 14, py + 3, 28, 1, wd[0]);
      R(c, x - 1, py + 4, 3, 2, PAL.steel[3]);
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), py = gy - 60, r = colorRamp(p.color, LEATHER);
      const wob = p.hit ? Math.round(Math.sin(t * 30) * 2) : Math.round(Math.sin(t * 2) * 0.4);
      R(c, x - 2 + wob, py + 6, 5, 3, r[2]); R(c, x - 3 + wob, py + 9, 7, 6, r[2]); R(c, x - 3 + wob, py + 9, 2, 6, r[3]); R(c, x - 2 + wob, py + 15, 5, 2, r[1]);
    },
  });

  // Ring: canvas top at y (fighters' feet), apron skirt below. part 'back' | 'front' | 'all'.
  def('ring', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 260, part = p.part || 'all';
      const corners = p.corners || ['#8a3a30', '#33507a'], nR = Array.isArray(p.ropes) ? p.ropes.length : p.ropes || 3;
      const ropeCols = Array.isArray(p.ropes) ? p.ropes : nR === 4 ? ['#b8b2a2', '#8a3a30', '#b8b2a2', '#33507a'] : ['#b8b2a2', '#8a3a30', '#33507a'];
      const ropeH = nR === 4 ? [12, 22, 32, 42] : [14, 26, 38];
      const cv = PAL.canvas, depth = 10;
      if (part !== 'front') {
        // apron skirt and canvas
        R(c, x - 6, gy, w + 12, 16, '#1c1a24'); R(c, x - 6, gy, w + 12, 1, '#2e2a38');
        for (let xx = x; xx < x + w; xx += 24) R(c, xx, gy + 2, 1, 14, '#15131a');
        if (p.skirt !== false) txt(c, p.skirtText || 'CALDER', x + Math.floor(w / 2), gy + 6, { align: 'center', color: '#5a5060' });
        for (let k = 0; k < depth; k++) R(c, x - 4, gy - depth + k, w + 8, 1, k < 2 ? cv[1] : k < 6 ? cv[2] : cv[3]);
        R(c, x - 4, gy - 1, w + 8, 1, cv[4]);
        speckle(c, x, gy - depth + 1, w, depth - 2, cv[1], Math.floor(w / 6), seedOf(p, 65), true);
        // back posts and ropes (further away: higher, darker)
        for (const [px0, col] of [[x + 4, corners[0]], [x + w - 6, corners[1]]]) {
          R(c, px0, gy - depth - 46, 3, 46, PAL.steel[1]); R(c, px0 - 1, gy - depth - 44, 5, 32, mix(col, PAL.ink, 0.35));
        }
        ropeH.forEach((rh, i) => R(c, x + 6, gy - depth - rh, w - 10, 1, mix(ropeCols[i % ropeCols.length], PAL.ink, 0.45)));
      }
      if (part !== 'back') {
        ropeH.forEach((rh, i) => {
          const col = ramp(ropeCols[i % ropeCols.length]);
          for (let xx = 0; xx <= w; xx++) { const sag = Math.round(Math.sin((xx / w) * Math.PI) * 1.5); R(c, x + xx, gy - rh + sag, 1, 2, xx % 6 === 0 ? col[1] : col[2]); Px(c, x + xx, gy - rh + sag, col[3]); }
        });
        for (const [px0, col] of [[x - 2, corners[0]], [x + w - 1, corners[1]]]) {
          R(c, px0, gy - 48, 4, 50, PAL.steel[2]); R(c, px0, gy - 48, 1, 50, PAL.steel[4]);
          const pr = ramp(col); R(c, px0 - 1, gy - 46, 6, 36, pr[2]); R(c, px0 - 1, gy - 46, 2, 36, pr[3]); R(c, px0 + 4, gy - 46, 1, 36, pr[1]);
        }
      }
    },
  });

  def('bleachers', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 160, rows = p.rows || 4, s = seedOf(p, 66), wd = PAL.wood, st = PAL.steel;
      for (let k = rows - 1; k >= 0; k--) {
        const ty = gy - (k + 1) * 10;
        R(c, x, ty + 2, w, 8, mix(PAL.ink, PAL.plum, 0.4)); for (let xx = x + 6; xx < x + w; xx += 30) R(c, xx, ty + 2, 2, 8, st[1]);
        if (p.crowd) {
          const dens = typeof p.crowd === 'number' ? p.crowd : 0.6;
          for (let xx = x + 4; xx < x + w - 4; xx += 7) {
            if (hash(s + xx * 0.3 + k * 7) > dens) continue;
            const col = mix(['#4a3a3a', '#3a4a5a', '#5a5040', '#4a4a4a', '#6a4a3a', '#3a3a4a'][Math.floor(hash(s + xx + k) * 6)], PAL.ink, 0.25 + k * 0.12);
            person(c, xx + Math.floor(hash(s + xx * 2) * 3), ty + 2, 14, col, { skin: mix(['#9a6e52', '#c49274', '#6e4c3a', '#b08060'][Math.floor(hash(s + xx * 3) * 4)], PAL.ink, 0.3 + k * 0.1), hair: '#1c1614' });
          }
        }
        R(c, x, ty, w, 2, wd[3]); R(c, x, ty, w, 1, wd[4]);
      }
      R(c, x - 2, gy - rows * 10 - 14, 2, rows * 10 + 14, st[2]); R(c, x + w, gy - rows * 10 - 14, 2, rows * 10 + 14, st[2]);
      line(c, x - 2, gy - 14, x - 2, gy - rows * 10 - 14, st[3]);
    },
  });

  const CROWD_COLS = ['#4a3a3a', '#3a4a5a', '#5a5040', '#4a4a4a', '#6a4a3a', '#3a3a4a', '#5a3a4a', '#40504a', '#7a6a5a'];
  const CROWD_SKIN = ['#9a6e52', '#c49274', '#6e4c3a', '#b08060', '#8a5e44'];
  def('crowd', {
    animated: true,
    draw(c, p, L) {
      // static far mass behind the animated rows
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 200, rows = p.rows || 3;
      const top = gy - rows * 9 - 22;
      R(c, x, top, w, 12, mix(PAL.ink, PAL.plum, 0.3));
      for (let xx = x; xx < x + w; xx += 4) { const hh = 2 + Math.floor(hash(xx * 0.31 + 5) * 3); R(c, xx, top - hh, 3, hh, mix(PAL.ink, PAL.plum, 0.35)); }
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 200, rows = p.rows || 3, dens = p.density === undefined ? 0.8 : +p.density, mood = p.mood || 'idle', s = seedOf(p, 67);
      for (let k = rows - 1; k >= 0; k--) {
        const by = gy - k * 9, dim = (p.dim !== undefined ? +p.dim : 0.32) + k * 0.15, ph = 17 + (rows - k) * 2;
        for (let xx = x + 3 + (k % 2) * 4; xx < x + w - 3; xx += 8) {
          const id = s + xx * 0.27 + k * 13.1;
          if (hash(id) > dens) continue;
          const col = mix(CROWD_COLS[Math.floor(hash(id + 1) * CROWD_COLS.length)], PAL.ink, dim);
          const skin = mix(CROWD_SKIN[Math.floor(hash(id + 2) * CROWD_SKIN.length)], PAL.ink, dim + 0.1);
          let bob = 0, armsUp = false, lean = 0;
          if (mood === 'cheer') { const sp = 5 + hash(id + 3) * 4; bob = Math.round(Math.max(0, Math.sin(t * sp + hash(id + 4) * 6)) * 2.4); armsUp = hash(id + 5) < 0.45 && Math.sin(t * 1.3 + hash(id + 6) * 6) > -0.3; }
          else if (mood === 'tense') { lean = hash(id + 7) < 0.4 ? 1 : 0; bob = Math.sin(t * 0.7 + hash(id) * 6) > 0.95 ? -1 : 0; }
          else bob = Math.round(Math.sin(t * (0.8 + hash(id + 3)) + hash(id + 4) * 6) * 0.6);
          person(c, xx + Math.floor(hash(id + 8) * 3) + lean, by - bob, ph + Math.floor(hash(id + 9) * 3), col, { skin, hair: mix('#1c1614', PAL.ink, dim), armsUp });
        }
      }
      // camera flashes in a cheering crowd
      if (mood === 'cheer') {
        const fb = Math.floor(t * 8);
        for (let i = 0; i < 2; i++) if (hash(fb * 0.71 + i * 3.3 + s) < 0.18) { const fx = x + Math.floor(hash(fb * 1.3 + i) * w), fy = gy - Math.floor(hash(fb * 2.1 + i) * rows * 9) - 18; R(c, fx - 1, fy, 3, 1, '#fff6dc'); R(c, fx, fy - 1, 1, 3, '#fff6dc'); }
      }
    },
  });

  def('spotlight', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), cy = p.y !== undefined ? +p.y : ceilOf(L), st = PAL.iron;
      R(c, x - 5, cy, 11, 2, st[3]); R(c, x - 5, cy + 2, 1, 6, st[2]); R(c, x + 5, cy + 2, 1, 6, st[2]);
      R(c, x - 4, cy + 4, 9, 10, st[2]); R(c, x - 4, cy + 4, 2, 10, st[3]); R(c, x - 3, cy + 14, 7, 1, p.on === false ? st[1] : '#fff0c8');
    },
    lights(p, L) {
      if (p.on === false) return [];
      const cy = p.y !== undefined ? +p.y : ceilOf(L);
      return [{ x: +p.x || 0, y: cy + 14, r: p.r || 230, color: p.color || '#fff0c8', k: 1, cone: { dir: p.dir || 'down', width: p.width || 26 }, flicker: +p.flicker || 0 }];
    },
  });

  def('corner_stool', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), wd = PAL.wood;
      contact(c, x, gy, 12);
      R(c, x - 5, gy - 13, 11, 2, wd[3]); R(c, x - 5, gy - 13, 11, 1, wd[4]);
      line(c, x - 4, gy - 11, x - 5, gy - 1, wd[2]); line(c, x + 4, gy - 11, x + 5, gy - 1, wd[1]); R(c, x - 4, gy - 6, 9, 1, wd[1]);
    },
  });

  def('bucket', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, PAL.steel);
      contact(c, x, gy, 10);
      for (let k = 0; k < 9; k++) R(c, x - 4 - Math.floor(k / 4), gy - 1 - k, 9 + Math.floor(k / 4) * 2, 1, k === 8 ? r[4] : r[2]);
      R(c, x - 4, gy - 9, 1, 8, r[3]); R(c, x - 5, gy - 9, 11, 1, r[4]); R(c, x - 4, gy - 8, 9, 1, '#3a4a5a');
      cable(c, x - 5, gy - 9, x + 5, gy - 9, -3, r[1]);
      R(c, x + 2, gy - 11, 4, 2, '#b8a050');
    },
  });

  def('banner', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 80, h = p.h || 14, y = Math.round(p.y !== undefined ? +p.y : ceilOf(L) + 20), r = colorRamp(p.color, ramp('#6a2a2a'));
      R(c, x - 3, y - 2, w + 6, 2, PAL.steel[3]);
      for (let xx = 0; xx < w; xx++) {
        const sag = Math.round(Math.sin((xx / w) * Math.PI) * 2), col = xx % 14 < 2 ? r[1] : xx % 14 < 9 ? r[2] : r[3];
        R(c, x + xx, y, 1, h + sag, col);
      }
      R(c, x, y, w, 1, r[4]); R(c, x + 2, y + 2, w - 4, 1, BRASS[2]); R(c, x + 2, y + h - 1, w - 4, 1, BRASS[2]);
      txt(c, p.text || 'CALDER CIVIC ARENA', x + Math.floor(w / 2), y + Math.floor(h / 2) - 2, { align: 'center', color: '#e0d0a8', shadow: r[0] });
      for (const ex of [x, x + w - 1]) { line(c, ex, y, ex, y - 6, PAL.iron[3]); }
    },
  });

  def('bowling_lanes', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 300, wd = ['#5a4430', '#7a5e3e', '#9a7a52', '#b49468', '#c8ac80'];
      R(c, x, gy - 4, w, 4, wd[2]); R(c, x, gy - 4, w, 1, wd[4]); R(c, x, gy - 1, w, 1, wd[1]);
      for (let xx = x; xx < x + w; xx += 3) Px(c, xx, gy - 3, xx % 9 === 0 ? wd[3] : wd[2]);
      for (let xx = x + 20; xx < x + 60 && xx < x + w; xx += 8) Px(c, xx, gy - 2, '#3a2a1c');
      R(c, x, gy, w, 2, '#1a1a20');
      // pin deck and pinsetter hood at the far (right) end
      const ex = x + w - 40;
      R(c, ex, gy - 40, 40, 30, '#14131a'); R(c, ex, gy - 40, 40, 2, '#2a2836'); R(c, ex + 2, gy - 38, 36, 10, '#222030');
      for (let i = 0; i < 4; i++) { const px0 = ex + 8 + i * 6; R(c, px0, gy - 10, 3, 6, '#d8d2c4'); R(c, px0 + 1, gy - 11, 1, 1, '#d8d2c4'); R(c, px0, gy - 8, 3, 1, '#a83a2a'); }
      // ball return near the approach
      R(c, x + 8, gy - 14, 26, 10, '#2a2a34'); R(c, x + 8, gy - 14, 26, 1, '#3e3e4a'); ellipse(c, x + 14, gy - 16, 3, 3, '#3a4a7a'); ellipse(c, x + 22, gy - 16, 3, 3, '#7a3a4a');
      // overhead scoring monitor
      R(c, x + 60, gy - 92, 1, 16, PAL.iron[2]); crt(c, x + 50, gy - 78, 22, 14);
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 300, ex = x + w - 40;
      neonText(c, p.text || 'STARLITE', ex + 20, gy - 35, PAL.neonPink, 1, Math.floor(t * 10) % 37 !== 0);
      R(c, x + 52, gy - 76, 17, 10, '#1c2a44'); txt(c, '7 9', x + 53, gy - 74, { color: '#8ab0d0' });
    },
    lights(p, L) { const gy = gyOf(p, L), w = +p.w || 300; return [{ x: (+p.x || 0) + w - 20, y: gy - 33, r: 50, color: PAL.neonPink, k: 0.55, flicker: 0.05 }]; },
  });

  def('forklift', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), f = faceOf(p), r = colorRamp(p.color, ramp('#9a7a32')), ir = PAL.iron;
      contact(c, x, gy, 40);
      const X = (dx) => x + f * dx;
      R(c, Math.min(X(-14), X(8)), gy - 18, 22, 12, r[2]); R(c, Math.min(X(-14), X(8)), gy - 18, 22, 1, r[4]);
      R(c, Math.min(X(-18), X(-12)), gy - 22, 6, 16, r[1]);
      R(c, X(-10), gy - 40, 1, 22, ir[3]); R(c, X(6), gy - 40, 1, 22, ir[3]); R(c, Math.min(X(-10), X(6)), gy - 40, 17, 2, ir[3]);
      R(c, Math.min(X(-6), X(0)), gy - 24, 7, 6, VINYL[2]);
      R(c, X(11), gy - 42, 2, 38, ir[2]); R(c, X(14), gy - 42, 1, 38, ir[3]);
      R(c, Math.min(X(14), X(28)), gy - 4, 15, 2, ir[3]); R(c, X(14), gy - 12, 1, 8, ir[3]);
      for (const wx of [-10, 6]) { ellipse(c, X(wx), gy - 4, 4, 4, '#121216'); ellipse(c, X(wx), gy - 4, 1, 1, PAL.steel[3]); }
      speckle(c, Math.min(X(-14), X(8)), gy - 18, 22, 12, r[1], 8, seedOf(p, 68), true);
    },
  });

  def('shelving', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 120, h = +p.h || 90, stock = p.stock || 'boxes', s = seedOf(p, 69);
      const up = ramp('#7a5a34'), beam = ramp('#8a4a2a'), levels = Math.max(2, Math.round(h / 30));
      for (let xx = x; xx <= x + w; xx += 40) { R(c, xx, gy - h, 3, h, up[2]); R(c, xx, gy - h, 1, h, up[4]); for (let yy = gy - h + 4; yy < gy; yy += 6) Px(c, xx + 1, yy, up[0]); }
      for (let k = 0; k < levels; k++) {
        const by = Math.round(gy - (k * h) / levels) - (k ? 0 : 2);
        if (k > 0) { R(c, x, by, w + 3, 3, beam[2]); R(c, x, by, w + 3, 1, beam[4]); }
        if (stock === 'empty') continue;
        for (let bx = x + 4; bx < x + w - 8; bx += 40) {
          if (hash(s + bx + k * 7) < 0.15) continue;
          const sh = Math.min(Math.floor(h / levels) - 6, 16 + Math.floor(hash(s + bx * 2 + k) * 8)), sw = 32;
          if (stock === 'drums') { for (let i = 0; i < 3; i++) { R(c, bx + i * 11, by - 14, 9, 14, ['#2a4a5a', '#5a3a2a', '#4a4a3a'][(i + k) % 3]); R(c, bx + i * 11, by - 10, 9, 1, PAL.ink); } continue; }
          R(c, bx, by - 4, sw, 3, PAL.woodPale[2]);
          const cb = ['#4a3a28', '#5e4a32', '#74603e', '#8a744c', '#9e875a'];
          box(c, bx + 1, by - 4 - sh, sw - 2, sh, cb); R(c, bx + Math.floor(sw / 2) - 1, by - 4 - sh, 2, sh, cb[3]);
          if (stock === 'crates' || hash(s + bx * 3 + k) < 0.3) RA(c, bx + 1, by - 4 - sh, sw - 2, sh, '#a8b8c8', 0.18);
        }
      }
    },
  });

  def('container', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ramp('#6a3a2a')), len = p.len || 120, h = 52, x0 = x - len / 2, s = seedOf(p, 70);
      contact(c, x, gy, len + 4);
      R(c, x0, gy - h, len, h, r[2]);
      for (let xx = x0 + 2; xx < x0 + len - 2; xx += 4) { R(c, xx, gy - h + 3, 1, h - 6, r[3]); R(c, xx + 2, gy - h + 3, 1, h - 6, r[1]); }
      R(c, x0, gy - h, len, 3, r[3]); R(c, x0, gy - 3, len, 3, r[0]); R(c, x0, gy - h, 3, h, r[1]); R(c, x0 + len - 3, gy - h, 3, h, r[1]);
      for (const cx of [x0, x0 + len - 4]) { R(c, cx, gy - h, 4, 4, PAL.iron[2]); R(c, cx, gy - 4, 4, 4, PAL.iron[2]); }
      if (p.doors !== false) { const dx = p.face === -1 ? x0 + 3 : x0 + len - 30; R(c, dx + 13, gy - h + 3, 1, h - 6, r[0]); for (const bx of [dx + 4, dx + 9, dx + 18, dx + 23]) R(c, bx, gy - h + 4, 1, h - 8, PAL.steel[3]); }
      txt(c, p.text || 'HRLU 304172', x0 + 10, gy - h + 7, { color: shade(r[2], 0.35) });
      streaks(c, x0, gy - h + 3, len, h * 0.7, PAL.rust[1], Math.floor(len / 10), s, 0.6);
      speckle(c, x0, gy - h, len, h, PAL.rust[2], Math.floor(len / 3), s + 1, true);
    },
  });

  def('loading_dock', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 100, h = p.h || 22, cr = PAL.concrete;
      R(c, x, gy - h, w, h, cr[2]); R(c, x, gy - h, w, 2, '#9a8434'); for (let xx = x; xx < x + w; xx += 8) R(c, xx, gy - h, 4, 2, '#26241e');
      R(c, x, gy - h + 2, w, 1, cr[3]); speckle(c, x, gy - h + 3, w, h - 3, cr[1], Math.floor(w / 3), seedOf(p, 71), true);
      for (let xx = x + 16; xx < x + w - 10; xx += 40) { R(c, xx, gy - h + 4, 8, 12, '#16161a'); R(c, xx, gy - h + 4, 8, 1, '#2a2a30'); }
      RA(c, x, gy - 4, w, 4, PAL.ink, 0.3);
    },
  });

  def('roll_door', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 56, h = p.h || 60, open = p.open === true ? 0.7 : +p.open || 0, st = PAL.steel;
      R(c, x - 3, gy - h - 6, w + 6, 6, st[1]); R(c, x - 3, gy - h - 6, w + 6, 1, st[3]);
      R(c, x - 3, gy - h, 3, h, st[2]); R(c, x + w, gy - h, 3, h, st[1]);
      const shut = Math.round(h * (1 - open));
      if (open > 0) { vbands(c, x, gy - h + shut, w, h - shut, PAL.ink, PAL.plum, 4); if (p.lit) RA(c, x, gy - h + shut, w, h - shut, PAL.amber[2], 0.3); }
      if (shut > 0) drawDoor(c, x, gy - h + shut, w, shut, { kind: 'roll', seed: seedOf(p, 72), graffiti: p.graffiti });
      if (open > 0) R(c, x, gy - h + shut - 1, w, 2, st[3]);
    },
    lights(p, L) { const open = p.open === true ? 0.7 : +p.open || 0; return open > 0 && p.lit ? [{ x: (+p.x || 0) + (+p.w || 50) / 2, y: gyOf(p, L) - 12, r: 60, color: PAL.lampWarm, k: 0.7, reflect: true }] : []; },
  });

  def('catwalk', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 120, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 90), ir = PAL.iron;
      R(c, x, y, w, 3, ir[2]); R(c, x, y, w, 1, ir[3]); for (let xx = x; xx < x + w; xx += 2) Px(c, xx, y + 1, ir[1]);
      RA(c, x, y + 3, w, 2, PAL.ink, 0.35);
      R(c, x, y - 14, w, 1, ir[3]); R(c, x, y - 7, w, 1, ir[2]);
      for (let xx = x; xx <= x + w; xx += 20) { R(c, xx, y - 14, 1, 14, ir[3]); if (p.hang !== false) R(c, xx, y - 60, 1, 46, ir[1]); }
      R(c, x, y - 3, w, 1, ir[1]);
    },
  });

  def('pipes', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 160, y = Math.round(p.y !== undefined ? +p.y : ceilOf(L) + 10), s = seedOf(p, 73);
      const runs = [{ d: 6, r: PAL.metal }, { d: 4, r: ramp('#6a3a2a') }, { d: 5, r: ramp('#8a8a80') }];
      let yy = y;
      runs.forEach((run, i) => {
        R(c, x, yy, w, run.d, run.r[2]); R(c, x, yy, w, 1, run.r[4]); R(c, x, yy + run.d - 1, w, 1, run.r[0]);
        for (let xx = x + 18 + i * 7; xx < x + w; xx += 40) { R(c, xx, yy - 1, 2, run.d + 2, run.r[1]); R(c, xx + 2, yy - 1, 1, run.d + 2, run.r[3]); }
        if (i === 2) for (let xx = x; xx < x + w; xx += 3) Px(c, xx, yy + 2, run.r[3]);
        yy += run.d + 2;
      });
      for (let xx = x + 30; xx < x + w; xx += 60) R(c, xx, y - 30, 1, 30, PAL.iron[2]);
      const vx = x + Math.floor(hash(s) * (w - 20)) + 10;
      ellipse(c, vx, y - 4, 3, 2, '#8a3a2a'); R(c, vx, y - 2, 1, 2, PAL.iron[3]);
      streaks(c, x, yy, w, 20, PAL.rust[1], Math.floor(w / 30), s + 1, 0.35);
    },
  });

  def('safe', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = ramp('#3a3e44');
      contact(c, x, gy, 22);
      R(c, x - 9, gy - 2, 3, 2, r[0]); R(c, x + 6, gy - 2, 3, 2, r[0]);
      box(c, x - 10, gy - 26, 20, 24, r);
      if (p.open) {
        R(c, x - 8, gy - 24, 16, 20, PAL.ink); R(c, x - 8, gy - 15, 16, 1, r[1]);
        R(c, x - 7, gy - 20, 10, 4, '#5a4a3a'); R(c, x - 7, gy - 20, 10, 1, '#7a6a4e'); R(c, x - 6, gy - 13, 8, 3, '#5a6a4a'); R(c, x - 6, gy - 10, 8, 3, '#4e5e40');
        box(c, x + 9, gy - 26, 6, 24, r); return;
      }
      R(c, x - 8, gy - 24, 16, 20, r[1]); R(c, x - 7, gy - 23, 14, 18, r[2]);
      ellipse(c, x - 1, gy - 16, 3, 3, r[4]); ellipse(c, x - 1, gy - 16, 2, 2, r[1]); Px(c, x - 1, gy - 19, '#c8b070');
      R(c, x + 4, gy - 17, 2, 4, PAL.steel[4]); R(c, x - 7, gy - 22, 1, 3, r[0]); R(c, x - 7, gy - 10, 1, 3, r[0]);
      txt(c, 'MOSLER', x, gy - 8, { align: 'center', color: BRASS[2] });
    },
  });

  def('cage', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, h = p.h || 70, st = PAL.steel, s = seedOf(p, 74);
      if (p.contents !== false) for (let i = 0; i < Math.floor(w / 16); i++) { const bx = x + 3 + i * 15, bh = 10 + Math.floor(hash(s + i) * 18); box(c, bx, gy - bh, 13, bh, ['#3a2e20', '#4a3a28', '#5e4a32', '#74603e', '#8a744c']); }
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if ((xx + yy) % 4 === 0 || (xx - yy + 1000) % 4 === 0) { c.fillStyle = rgba(st[3], 0.38); c.fillRect(x + xx, gy - h + yy, 1, 1); }
      R(c, x, gy - h, w, 2, st[3]); R(c, x, gy - h, 2, h, st[3]); R(c, x + w - 2, gy - h, 2, h, st[2]); R(c, x + Math.floor(w / 2), gy - h, 2, h, st[2]);
      R(c, x + Math.floor(w / 2) + 3, gy - h / 2, 3, 4, '#8a7a3a');
    },
  });

  def('office_window', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 50, h = p.h || 26, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 46), s = seedOf(p, 75);
      R(c, x - 2, y - 2, w + 4, h + 4, PAL.wood[2]); R(c, x - 2, y - 2, w + 4, 1, PAL.wood[3]);
      R(c, x, y, w, h, p.lit ? PAL.amber[2] : '#1a2028');
      if (p.lit) { R(c, x + 6, y + h - 9, 16, 9, PAL.amber[1]); R(c, x + 10, y + h - 14, 1, 5, PAL.amber[0]); }
      for (let yy = y + 1; yy < y + h * (p.raised ? 0.4 : 1); yy += 2) {
        const bent = hash(s + yy) < 0.06;
        R(c, x, yy, w, 1, p.lit ? (bent ? PAL.amber[3] : '#b89a6a') : bent ? '#3a4450' : '#2a323c');
      }
      R(c, x + w - 4, y, 1, h * 0.7, '#8a8a80');
      R(c, x - 3, y + h + 2, w + 6, 2, PAL.wood[3]);
      if (p.text) txt(c, p.text, x + Math.floor(w / 2), y + 2, { align: 'center', color: '#c8b88a' });
    },
    lights(p, L) { if (!p.lit) return []; const w = +p.w || 50, h = p.h || 26, y = p.y !== undefined ? +p.y : gyOf({}, L) - 46; return [{ x: (+p.x || 0) + w / 2, y: y + h / 2, r: w, color: PAL.lamp, k: 0.6 }]; },
  });

  def('workbench', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, wd = PAL.wood, s = seedOf(p, 76);
      contact(c, x + w / 2, gy, w + 2);
      R(c, x, gy - 20, w, 4, wd[3]); R(c, x, gy - 20, w, 1, wd[4]); R(c, x, gy - 16, w, 1, wd[0]);
      for (const lx of [x + 1, x + w - 4]) { R(c, lx, gy - 16, 3, 16, wd[2]); R(c, lx, gy - 16, 1, 16, wd[3]); }
      R(c, x + 3, gy - 6, w - 6, 2, wd[2]);
      for (let xx = x + 6; xx < x + w - 8; xx += 9) { const k = Math.floor(hash(s + xx) * 3); R(c, xx, gy - 6 - (k + 3), 6, k + 3, ['#3a4a5a', '#5a3a2a', '#6a6a50'][k]); }
      R(c, x + w - 10, gy - 25, 8, 5, PAL.steel[2]); R(c, x + w - 12, gy - 23, 2, 2, PAL.steel[3]); R(c, x + w - 4, gy - 27, 1, 3, PAL.steel[4]);
      R(c, x + 8, gy - 22, 10, 2, '#7a3a2a'); R(c, x + 16, gy - 23, 2, 4, PAL.steel[3]); R(c, x + 24, gy - 21, 8, 1, PAL.steel[4]);
    },
  });

  def('boiler', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = ramp('#4a4a42'), s = seedOf(p, 77);
      contact(c, x, gy, 48);
      R(c, x - 22, gy - 6, 44, 6, PAL.concrete[2]); R(c, x - 22, gy - 6, 44, 1, PAL.concrete[3]);
      for (let k = 0; k < 50; k++) { const ww = 40 - (k > 44 ? (k - 44) * 2 : 0); R(c, x - ww / 2, gy - 6 - k, ww, 1, k > 44 ? r[3] : r[2]); }
      R(c, x - 20, gy - 56, 4, 50, r[3]); R(c, x + 16, gy - 56, 4, 50, r[1]);
      for (const ry of [12, 28, 44]) { R(c, x - 20, gy - 6 - ry, 40, 1, r[1]); for (let xx = x - 18; xx < x + 18; xx += 4) Px(c, xx, gy - 5 - ry, r[4]); }
      R(c, x - 8, gy - 20, 16, 10, PAL.iron[1]); R(c, x - 7, gy - 19, 14, 1, PAL.iron[3]);
      ellipse(c, x + 10, gy - 40, 4, 4, '#c8c2b0'); ellipse(c, x + 10, gy - 40, 3, 3, '#e0dccc'); line(c, x + 10, gy - 40, x + 12, gy - 42, '#a83a2a');
      R(c, x - 4, gy - 80, 6, 26, PAL.metal[2]); R(c, x - 4, gy - 80, 1, 26, PAL.metal[4]); R(c, x - 5, gy - 60, 8, 2, PAL.metal[1]);
      ellipse(c, x - 14, gy - 48, 4, 4, '#8a2a22'); R(c, x - 14, gy - 52, 1, 8, '#6a1a14'); R(c, x - 18, gy - 48, 8, 1, '#6a1a14');
      streaks(c, x - 20, gy - 50, 40, 40, PAL.rust[1], 6, s, 0.4);
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0);
      for (let xx = x - 6; xx < x + 6; xx += 2) { const k = 0.5 + 0.5 * Math.sin(t * 7 + xx); R(c, xx, gy - 16, 1, 5, k > 0.6 ? '#e08a3a' : '#a84a1c'); }
      R(c, x - 6, gy - 12, 12, 1, '#f2b860');
    },
    lights(p, L) { return [{ x: +p.x || 0, y: gyOf(p, L) - 14, r: 56, color: PAL.fire, k: 0.7, flicker: 0.3 }]; },
  });

  def('tool_wall', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 60, h = p.h || 34, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 62), s = seedOf(p, 78);
      R(c, x, y, w, h, '#6a5434'); R(c, x, y, w, 1, '#7e6640'); for (let yy = y + 3; yy < y + h; yy += 4) for (let xx = x + 2; xx < x + w; xx += 4) Px(c, xx, yy, '#4a3a24');
      for (let xx = x + 4; xx < x + w - 6; xx += 10) {
        const k = Math.floor(hash(s + xx) * 5), ty = y + 4 + Math.floor(hash(s + xx * 2) * 8);
        RA(c, xx - 1, ty - 1, 8, 16, '#3a2e1e', 0.5);
        if (k === 0) { R(c, xx + 2, ty, 1, 14, PAL.wood[3]); R(c, xx, ty, 5, 3, PAL.steel[3]); }
        else if (k === 1) { R(c, xx + 2, ty, 2, 12, PAL.steel[3]); R(c, xx + 1, ty, 4, 2, PAL.steel[4]); R(c, xx + 1, ty + 11, 4, 2, PAL.steel[4]); }
        else if (k === 2) { line(c, xx, ty, xx + 4, ty + 12, '#7a3a2a'); line(c, xx + 4, ty, xx, ty + 12, '#7a3a2a'); }
        else if (k === 3) { R(c, xx, ty, 6, 8, PAL.steel[2]); R(c, xx + 2, ty + 8, 2, 6, PAL.wood[2]); }
        else { R(c, xx, ty + 2, 6, 2, '#3a5a8a'); R(c, xx + 2, ty + 4, 2, 8, PAL.steel[3]); }
      }
    },
  });

  def('elevator', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), st = PAL.steel, w = 32, h = 58, x0 = x - w / 2;
      R(c, x0 - 3, gy - h - 3, w + 6, h + 3, BRASS[2]); R(c, x0 - 3, gy - h - 3, w + 6, 1, BRASS[4]);
      if (p.open) { vbands(c, x0, gy - h, w, h, PAL.amber[3], PAL.amber[1], 4); R(c, x0, gy - h, 4, h, st[3]); R(c, x0 + w - 4, gy - h, 4, h, st[3]); }
      else { R(c, x0, gy - h, w, h, st[3]); R(c, x0 + w / 2, gy - h, 1, h, st[1]); for (let yy = gy - h; yy < gy; yy += 3) RA(c, x0, yy, w, 1, '#ffffff', 0.05); R(c, x0, gy - h, w, 1, st[4]); }
      R(c, x - 8, gy - h - 11, 16, 6, PAL.ink); txt(c, p.floor || '42', x, gy - h - 10, { align: 'center', color: PAL.amber[3] });
      R(c, x0 + w + 6, gy - 32, 3, 7, st[2]); Px(c, x0 + w + 7, gy - 30, PAL.amber[3]); Px(c, x0 + w + 7, gy - 27, st[4]);
    },
    lights(p, L) { return p.open ? [{ x: +p.x || 0, y: gyOf(p, L) - 30, r: 60, color: PAL.lampWarm, k: 0.75 }] : [{ x: +p.x || 0, y: gyOf(p, L) - 66, r: 14, color: PAL.amber[3], k: 0.5 }]; },
  });

  def('glass_wall', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 160, top = p.y !== undefined ? +p.y : ceilOf(L), h = gy - top, s = seedOf(p, 79);
      vbands(c, x, top, w, h, '#1c2432', '#141a24', 5);
      // faint reflected city and the room's own lights
      for (let i = 0; i < Math.floor(w / 6); i++) { const bx = x + Math.floor(hash(s + i) * w), bh = 20 + Math.floor(hash(s + i * 2) * h * 0.4); RA(c, bx, gy - bh - 20, 4, bh, '#2a3444', 0.6); if (hash(s + i * 3) < 0.5) RA(c, bx + 1, gy - bh - 12, 1, 1, PAL.amber[3], 0.6); }
      for (let i = 0; i < w; i += 1) if ((i + Math.floor(top)) % 23 < 3) RA(c, x + i, top + (i % 40), 1, 30, '#8aa0b8', 0.06);
      for (let xx = x; xx <= x + w; xx += 40) { R(c, xx, top, 2, h, '#2a2e36'); R(c, xx, top, 1, h, '#3a404a'); }
      R(c, x, top, w + 2, 2, '#2a2e36'); R(c, x, gy - 3, w + 2, 3, '#2a2e36');
    },
  });

  def('plant', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), s = seedOf(p, 80), kind = p.kind || 'ficus';
      contact(c, x, gy, 12);
      const pot = colorRamp(p.color, ramp('#6a4a3a'));
      for (let k = 0; k < 9; k++) R(c, x - 5 + Math.floor(k / 4), gy - 1 - k, 11 - Math.floor(k / 4) * 2, 1, k === 8 ? pot[4] : pot[2]);
      const greens = ['#1e2c22', '#2c3f2e', '#3c5438', '#506a48'];
      if (kind === 'snake') { for (let i = 0; i < 5; i++) { const lx = x - 4 + i * 2, lh = 12 + Math.floor(hash(s + i) * 10); R(c, lx, gy - 9 - lh, 2, lh, greens[1 + (i % 3)]); Px(c, lx, gy - 9 - lh, greens[3]); } return; }
      if (kind === 'fern') { for (let i = 0; i < 8; i++) { const a = -Math.PI + (i / 7) * Math.PI, len = 10 + hash(s + i) * 4; line(c, x, gy - 10, x + Math.cos(a) * len, gy - 10 + Math.sin(a) * len * 0.8 - 2, greens[1 + (i % 3)]); } return; }
      R(c, x, gy - 30, 1, 21, PAL.wood[2]);
      canopy(c, x, gy - 32, 9, 11, s, greens);
    },
  });

  def('art', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 40, h = +p.h || 28, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 70), s = seedOf(p, 81);
      RA(c, x + 2, y + 2, w, h, PAL.ink, 0.35);
      R(c, x - 1, y - 1, w + 2, h + 2, '#1a1a1e'); R(c, x, y, w, h, '#b8b2a4');
      const cols = ['#8a3a2a', '#3a4a6a', '#c8a050', '#2a2a30', '#6a7a6a'];
      for (let i = 0; i < 4; i++) { const bw = 6 + Math.floor(hash(s + i) * w * 0.5), bh = 4 + Math.floor(hash(s + i * 2) * h * 0.6); R(c, x + Math.floor(hash(s + i * 3) * (w - bw)), y + Math.floor(hash(s + i * 4) * (h - bh)), bw, bh, cols[i % cols.length]); }
      ellipse(c, x + Math.floor(w * 0.65), y + Math.floor(h * 0.4), Math.floor(h * 0.2), Math.floor(h * 0.2), cols[2]);
    },
  });

  def('reception', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 90, mar = ['#4a4a50', '#5e5e64', '#76767a', '#8e8e90', '#a6a6a6'], s = seedOf(p, 82);
      contact(c, x + w / 2, gy, w + 4);
      R(c, x, gy - 26, w, 26, mar[2]); R(c, x, gy - 26, w, 1, mar[4]);
      for (let i = 0; i < 6; i++) line(c, x + Math.floor(hash(s + i) * w), gy - 25, x + Math.floor(hash(s + i * 2) * w), gy - 1, mar[3]);
      R(c, x - 3, gy - 29, w + 6, 3, '#2a1e18'); R(c, x - 3, gy - 29, w + 6, 1, '#4a3628');
      R(c, x + Math.floor(w / 2) - 22, gy - 20, 44, 9, '#1a1a20'); txt(c, p.text || 'ASHGROVE', x + Math.floor(w / 2), gy - 18, { align: 'center', color: BRASS[3] });
      R(c, x, gy - 3, w, 3, mar[0]);
    },
  });

  def('window_city', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 80, h = +p.h || 60, y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 100), view = p.view || 'night', s = seedOf(p, 83);
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      if (view === 'river') {
        vbands(c, x, y, w, h * 0.6, '#3a3048', '#8a5a4a', 5);
        R(c, x, y + h * 0.6, w, h * 0.4, '#1c2230');
        for (let i = 0; i < w / 3; i++) R(c, x + Math.floor(hash(s + i) * w), y + h * 0.62 + Math.floor(hash(s + i * 2) * h * 0.35), 3, 1, '#6a5060');
        R(c, x, y + h * 0.5, w, 1, '#2a2632'); for (let xx = 0; xx < w; xx += 12) { line(c, x + xx, y + h * 0.5, x + xx + 6, y + h * 0.42, '#2a2632'); line(c, x + xx + 6, y + h * 0.42, x + xx + 12, y + h * 0.5, '#2a2632'); }
      } else {
        // 'night' | 'skyline' (city at night, taller) | 'dusk' | 'day': a hazy far row, a darker near row
        const SKYV = { day: ['#6c7f93', '#a3adb0', '#7d8a98', '#5f6c7a'], dusk: ['#262840', '#9a6a5a', '#4a3a48', '#2e2834'], skyline: ['#111726', '#3a3446', '#242a3c', '#171b28'], night: ['#0c1019', '#26283a', '#1a1e2c', '#121520'] };
        const sv = SKYV[view] || SKYV.night, lit = view === 'day' ? 0 : view === 'dusk' ? 0.5 : 1;
        vbands(c, x, y, w, h, sv[0], sv[1], 6);
        if (view === 'night' || view === 'skyline') for (let i = 0; i < Math.floor(w / 12); i++) Px(c, x + Math.floor(hash(s + i) * w), y + Math.floor(hash(s + i * 2) * h * 0.35), '#5c6276');
        for (let row = 0; row < 2; row++) {
          let bx = x - Math.floor(hash(s + row) * 6);
          while (bx < x + w) {
            const hv = hash(s + bx * 0.71 + row * 9.3), bw = 7 + Math.floor(hv * 12);
            const bh = Math.floor(h * (row ? 0.16 + 0.3 * hash(s + bx * 2 + 1) : (view === 'skyline' ? 0.4 : 0.28) + 0.42 * hash(s + bx * 2)));
            R(c, bx, y + h - bh, bw, bh, row ? sv[3] : sv[2]);
            if (row === 0 && hv < 0.3) R(c, bx + (bw >> 1), y + h - bh - 4, 1, 4, sv[2]);
            const p0 = (hv < 0.5 ? 0.05 : 0.15) * lit * (row ? 1.2 : 0.7);
            if (p0 > 0) for (let yy = y + h - bh + 2; yy < y + h - 1; yy += 3) for (let xx = bx + 1; xx < bx + bw - 1; xx += 2) {
              if (hash(s + xx * 1.3 + yy * 0.7) < p0) Px(c, xx, yy, mix(hash(s + xx + yy) < 0.7 ? '#d8a860' : '#9ab0c4', row ? sv[3] : sv[2], row ? 0.15 : 0.45));
            }
            bx += bw + (row ? 2 : 1);
          }
        }
      }
      c.restore();
      R(c, x - 3, y - 3, w + 6, 3, '#3a3a40'); R(c, x - 3, y + h, w + 6, 4, '#4a4a50'); R(c, x - 3, y + h, w + 6, 1, '#6a6a70');
      R(c, x - 3, y, 3, h, '#3a3a40'); R(c, x + w, y, 3, h, '#2a2a30');
      if (p.panes !== false) { R(c, x + Math.floor(w / 2) - 1, y, 2, h, '#3a3a40'); if (h > 40) R(c, x, y + Math.floor(h / 2), w, 2, '#3a3a40'); }
      RA(c, x, y, w, h, '#8aa0c0', 0.05);
    },
    lights(p, L) {
      const w = +p.w || 80, h = +p.h || 60, y = p.y !== undefined ? +p.y : gyOf({}, L) - 100;
      return [{ x: (+p.x || 0) + w / 2, y: y + h / 2, r: Math.max(w, h) * (p.view === 'day' ? 1.4 : 1), color: p.view === 'river' || p.view === 'dusk' ? '#c08a7a' : p.view === 'day' ? '#c4ccd0' : '#7a90b8', k: p.view === 'day' ? 0.7 : 0.45 }];
    },
  });

  def('fire_damage', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 80, h = +p.h || 90, s = seedOf(p, 84);
      for (let i = 0; i < 6; i++) {
        const cx = x + Math.floor(hash(s + i) * w), rw = 8 + Math.floor(hash(s + i * 2) * 18);
        for (let k = 0; k < h; k += 2) { const ww = Math.round(rw * (0.4 + 0.6 * (k / h)) + Math.sin(k * 0.3 + i) * 3); RA(c, cx - ww / 2, gy - k - 2, ww, 2, '#0c0a0e', 0.55 * (1 - k / h) + 0.15); }
      }
      for (let i = 0; i < Math.floor(w / 12); i++) { const sx = x + Math.floor(hash(s + i * 3) * w), sy = gy - 20 - Math.floor(hash(s + i * 4) * (h - 30)); R(c, sx, sy, 3, 6 + Math.floor(hash(s + i) * 10), '#3a2a20'); R(c, sx, sy, 1, 3, '#5a4a38'); }
      R(c, x, gy - 3, w, 3, '#141014'); speckle(c, x, gy - 6, w, 6, '#2a1a14', Math.floor(w / 2), s + 5, true);
    },
  });

  def('soot', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, h = p.h || 50, s = seedOf(p, 85);
      for (let k = 0; k < h; k += 2) { const a = 0.35 * (1 - k / h); RA(c, x + Math.floor(Math.sin(k * 0.2 + s) * 3), gy - k - 2, w, 2, '#0e0c10', a); }
      speckle(c, x, gy - h, w, h, '#16121a', Math.floor(w * h / 30), s, true);
    },
  });

  def('candles', {
    animated: true,
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 4;
      for (let i = 0; i < n; i++) { const cx = x - n * 2 + i * 4, h = 4 + ((i * 3) % 5); R(c, cx, gy - h, 2, h, i % 3 === 1 ? '#a83a2a' : '#d8ccb0'); Px(c, cx + (i % 2 ? 1 : 0), gy - h + 2, '#e8dcc0'); R(c, cx - 1, gy - 1, 4, 1, '#c8bca0'); }
    },
    drawAnimated(c, p, L, t) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), n = p.n || 4;
      for (let i = 0; i < n; i++) { const cx = x - n * 2 + i * 4, h = 4 + ((i * 3) % 5), lit = Math.sin(t * 12 + i * 1.9) > -0.3; Px(c, cx, gy - h - 1, lit ? '#f2c060' : '#e08a3a'); if (lit) Px(c, cx, gy - h - 2, '#fbe3a8'); }
    },
    lights(p, L) { return [{ x: +p.x || 0, y: gyOf(p, L) - 8, r: 36, color: '#f0b060', k: 0.7, flicker: 0.25 }]; },
  });

  def('flowers', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), s = seedOf(p, 86);
      const fl = ['#a8584a', '#c8b070', '#a88ab8', '#d8ccb8', '#c87a6a'];
      if (p.kind === 'wrapped') {
        R(c, x - 8, gy - 3, 16, 3, '#c8c2b0'); RA(c, x - 8, gy - 3, 16, 3, '#a8c0d0', 0.35); line(c, x - 8, gy - 1, x + 6, gy - 2, '#3a5a3a');
        for (let i = 0; i < 5; i++) { Px(c, x + 5 + (i % 2), gy - 3 - Math.floor(i / 2), fl[i % 5]); Px(c, x + 6 + (i % 3), gy - 2 - (i % 2), fl[(i + 2) % 5]); }
        if (p.dead) RA(c, x - 8, gy - 4, 16, 4, '#4a3a2a', 0.5);
        return;
      }
      R(c, x - 3, gy - 8, 6, 8, '#6a8a9a'); R(c, x - 3, gy - 8, 2, 8, '#8aaaba'); RA(c, x - 3, gy - 8, 6, 8, '#2a3a4a', 0.2);
      for (let i = 0; i < 6; i++) { const a = -Math.PI * 0.85 + (i / 5) * Math.PI * 0.7, len = 7 + hash(s + i) * 4, ex = x + Math.cos(a) * len, ey = gy - 8 + Math.sin(a) * len; line(c, x, gy - 8, ex, ey, p.dead ? '#5a4a30' : '#3a5a3a'); R(c, ex - 1, ey - 1, 2, 2, p.dead ? '#5a4030' : fl[i % 5]); }
    },
  });

  def('mattress', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), s = seedOf(p, 87), r = ramp('#8a8070');
      contact(c, x, gy, 54);
      R(c, x - 26, gy - 6, 52, 6, r[2]); R(c, x - 26, gy - 6, 52, 1, r[3]); R(c, x - 26, gy - 1, 52, 1, r[0]);
      for (let xx = x - 22; xx < x + 22; xx += 6) Px(c, xx, gy - 3, r[1]);
      for (let i = 0; i < 3; i++) RA(c, x - 20 + Math.floor(hash(s + i) * 36), gy - 5, 6 + Math.floor(hash(s + i * 2) * 6), 3, '#6a5a3a', 0.45);
      R(c, x + 12, gy - 9, 11, 3, '#b8b0a0'); R(c, x - 10, gy - 8, 16, 2, '#5a6a7a'); Px(c, x - 4, gy - 9, '#6a7a8a');
    },
  });

  def('stairs_interior', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 70, h = +p.h || 60, dir = p.dir === -1 ? -1 : 1, wd = PAL.wood;
      const steps = Math.max(3, Math.round(h / 6)), sw = w / steps, sh = h / steps;
      for (let k = 0; k < steps; k++) {
        const sx = dir > 0 ? x + k * sw : x + w - (k + 1) * sw, sy = gy - (k + 1) * sh;
        R(c, sx, sy, sw + 1, 2, wd[3]); R(c, sx, sy, sw + 1, 1, wd[4]); R(c, sx, sy + 2, sw + 1, sh - 2, wd[1]);
        if (p.runner !== false) R(c, sx + 1, sy, sw - 1, 2, '#6a2a2a');
      }
      line(c, dir > 0 ? x : x + w, gy, dir > 0 ? x + w : x, gy - h, wd[0]);
      const rx0 = dir > 0 ? x : x + w, rx1 = dir > 0 ? x + w : x;
      line(c, rx0, gy - 20, rx1, gy - h - 20, wd[3]); line(c, rx0, gy - 21, rx1, gy - h - 21, wd[2]);
      for (let k = 0; k <= steps; k++) { const t = k / steps; R(c, lerp(rx0, rx1, t), gy - t * h - 20, 1, 20 - 2, wd[2]); }
      R(c, rx0 - 1, gy - 26, 3, 26, wd[3]); R(c, rx0 - 2, gy - 28, 5, 2, wd[4]);
    },
  });

  def('rug', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 60, r = colorRamp(p.color, ramp('#6a3a34'));
      R(c, x, gy - 1, w, 4, r[2]); R(c, x, gy - 1, w, 1, r[3]); R(c, x + 2, gy, w - 4, 2, r[1]);
      for (let xx = x + 4; xx < x + w - 4; xx += 6) Px(c, xx, gy + 1, r[4]);
      for (let xx = x; xx < x + w; xx += 2) { Px(c, xx, gy + 3, r[3]); }
      R(c, x - 2, gy - 1, 2, 4, PAL.cream); R(c, x + w, gy - 1, 2, 4, PAL.cream);
    },
  });

  def('phone_wall', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 40), r = colorRamp(p.color, BEIGE);
      box(c, x - 4, y, 8, 14, r); R(c, x - 3, y + 6, 6, 5, r[1]); for (let i = 0; i < 3; i++) Px(c, x - 2 + i * 2, y + 7, r[4]);
      R(c, x - 6, y + 1, 3, 12, r[2]); R(c, x - 6, y + 1, 1, 12, r[3]);
      for (let k = 0; k < 10; k++) Px(c, x - 5 + (k % 2), y + 13 + k, '#3a3630');
    },
  });

  def('mirror', {
    draw(c, p, L) {
      const w = p.w || 14, h = p.h || 20, x = Math.round((+p.x || 0) - w / 2), y = Math.round(p.y !== undefined ? +p.y : gyOf({}, L) - 62);
      R(c, x - 1, y - 1, w + 2, h + 2, p.frame || BRASS[2]); vbands(c, x, y, w, h, '#5a6878', '#2a3240', 4);
      for (let i = 0; i < Math.min(w, h); i++) if (i % 5 < 2) Px(c, x + w - 2 - i, y + 1 + i, '#9aaab8');
      if (p.cracked) line(c, x + 2, y + 3, x + w - 3, y + h - 4, '#c8d0d8');
    },
  });

  def('trophy_case', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), w = +p.w || 50, h = 44, wd = PAL.wood, s = seedOf(p, 88);
      contact(c, x + w / 2, gy, w + 2);
      box(c, x, gy - h, w, h, wd); R(c, x + 2, gy - h + 2, w - 4, h - 12, '#1a1814');
      for (const sy of [gy - h + 16, gy - h + 30]) R(c, x + 2, sy, w - 4, 1, '#5a5a5e');
      for (let row = 0; row < 2; row++) for (let xx = x + 4; xx < x + w - 8; xx += 9) {
        const by = gy - h + 16 + row * 14, k = Math.floor(hash(s + xx + row) * 3);
        if (k === 0) { R(c, xx + 2, by - 2, 4, 2, wd[3]); R(c, xx + 3, by - 5, 2, 3, BRASS[3]); R(c, xx + 1, by - 10, 6, 5, BRASS[3]); R(c, xx + 1, by - 10, 1, 5, BRASS[4]); }
        else if (k === 1) { R(c, xx, by - 6, 8, 4, '#2a2420'); R(c, xx + 2, by - 7, 4, 6, BRASS[3]); Px(c, xx + 3, by - 5, '#a83a2a'); }
        else { R(c, xx + 1, by - 9, 6, 8, '#6a5a48'); R(c, xx + 2, by - 8, 4, 6, '#8a8070'); }
      }
      for (let i = 0; i < Math.min(w, h) - 14; i += 6) Px(c, x + w - 4 - i, gy - h + 3 + i, '#8a9aa8');
      R(c, x + 2, gy - 10, w - 4, 8, wd[1]); Px(c, x + Math.floor(w / 2), gy - 6, BRASS[3]);
    },
    lights(p, L) { return p.lit ? [{ x: (+p.x || 0) + (+p.w || 50) / 2, y: gyOf(p, L) - 34, r: 34, color: PAL.lamp, k: 0.6 }] : []; },
  });

  def('vending', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0), r = colorRamp(p.color, ramp('#7a2a26'));
      contact(c, x, gy, 24);
      box(c, x - 11, gy - 48, 22, 48, r);
      R(c, x - 9, gy - 45, 13, 30, '#cfd8d0'); for (let k = 0; k < 6; k++) R(c, x - 8, gy - 43 + k * 5, 11, 3, ['#a83a2a', '#3a5a8a', '#c8a040', '#4a7a4a', '#7a3a6a', '#d8d0c0'][k]);
      R(c, x + 5, gy - 45, 4, 14, r[1]); for (let k = 0; k < 5; k++) Px(c, x + 6, gy - 43 + k * 3, '#e0d8a0');
      R(c, x + 5, gy - 28, 4, 3, '#1a1a1e'); R(c, x - 9, gy - 12, 13, 6, '#121216');
      txt(c, 'COLD', x - 3, gy - 51, { align: 'center', color: '#e0d8c8' });
    },
    lights(p, L) { return [{ x: +p.x || 0, y: gyOf(p, L) - 30, r: 46, color: '#d8e4dc', k: 0.6, flicker: +p.flicker || 0 }]; },
  });

  def('water_cooler', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0);
      contact(c, x, gy, 12);
      box(c, x - 5, gy - 24, 10, 24, BEIGE); R(c, x - 3, gy - 19, 2, 2, '#3a6a9a'); R(c, x + 1, gy - 19, 2, 2, '#a83a2a');
      R(c, x - 4, gy - 35, 8, 11, rgba('#8ab0d0', 0.6)); R(c, x - 4, gy - 35, 2, 11, rgba('#c8e0f0', 0.6)); R(c, x - 2, gy - 36, 4, 1, rgba('#8ab0d0', 0.8));
      R(c, x + 6, gy - 22, 3, 5, '#d8d0c0');
    },
  });

  def('copier', {
    draw(c, p, L) {
      const gy = gyOf(p, L), x = Math.round(+p.x || 0);
      contact(c, x, gy, 30);
      box(c, x - 13, gy - 26, 26, 26, BEIGE); R(c, x - 13, gy - 28, 26, 2, '#3a3a40');
      R(c, x + 4, gy - 25, 8, 4, '#2a3a2a'); Px(c, x + 5, gy - 24, '#7ac08a'); for (let i = 0; i < 3; i++) Px(c, x + 6 + i * 2, gy - 22, BEIGE[4]);
      for (let k = 0; k < 2; k++) { R(c, x - 11, gy - 18 + k * 7, 22, 5, BEIGE[1]); R(c, x - 2, gy - 16 + k * 7, 6, 1, BEIGE[3]); }
      R(c, x + 13, gy - 16, 5, 1, PAL.paper[4]); R(c, x + 13, gy - 15, 5, 1, PAL.paper[2]);
    },
  });

  def('stage_lights', {
    draw(c, p, L) {
      const x = Math.round(+p.x || 0), w = +p.w || 200, y = Math.round(p.y !== undefined ? +p.y : ceilOf(L) + 6), ir = PAL.iron;
      R(c, x, y, w, 1, ir[3]); R(c, x, y + 6, w, 1, ir[3]);
      for (let xx = x; xx < x + w; xx += 6) line(c, xx, y, xx + 3, y + 6, ir[2]);
      for (let xx = x; xx < x + w; xx += 60) R(c, xx, y - 40, 1, 40, ir[1]);
      const n = p.n || Math.max(2, Math.floor(w / 60));
      for (let i = 0; i < n; i++) {
        const lx = Math.round(x + (w * (i + 0.5)) / n);
        R(c, lx - 1, y + 7, 3, 2, ir[2]); R(c, lx - 3, y + 9, 7, 7, ir[2]); R(c, lx - 3, y + 9, 1, 7, ir[3]); R(c, lx - 2, y + 16, 5, 1, p.on === false ? ir[1] : '#fff0c8');
      }
    },
    lights(p, L) {
      if (p.on === false) return [];
      const x = +p.x || 0, w = +p.w || 200, y = p.y !== undefined ? +p.y : ceilOf(L) + 6, n = p.n || Math.max(2, Math.floor(w / 60));
      const out = [];
      for (let i = 0; i < n; i++) out.push({ x: x + (w * (i + 0.5)) / n, y: y + 16, r: p.r || 220, color: p.color || '#fff0cc', k: p.k || 0.8, cone: { dir: 'down', width: p.width || 26 }, flicker: +p.flicker || 0, glow: 0.5, shaft: 0.6 });
      return out;
    },
  });

  /* ── 9. Backdrops: sky presets and far parallax ──────────────────── */
  // Offscreen canvases; never created headless.
  function makeCanvas(w, h) {
    if (S.headless || typeof document === 'undefined' || !document.createElement) return null;
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h));
    return cv;
  }
  function ctx2d(cv) { const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return c; }
  // Mulberry32 for cosmetic particles only, so visuals never consume the gameplay S.rand() stream.
  function prng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const frac = (v) => v - Math.floor(v);
  const LAYER_PAR = { far: 0.25, mid: 0.6, back: 1, main: 1, front: 1, fore: 1.25 };
  const flashSetting = () => (S.settings && S.settings.flash !== undefined ? clamp(+S.settings.flash, 0, 1) : 1);
  // Cameras arrive as {x, y, zoom} or as two numbers (backdrop.draw's signature).
  function camOf(cam, camY) {
    if (cam && typeof cam === 'object') return { x: +cam.x || 0, y: +cam.y || 0, zoom: +cam.zoom || 1 };
    return { x: +cam || 0, y: +camY || 0, zoom: (S.cam && +S.cam.zoom) || 1 };
  }
  // A point on a layer with parallax `par` -> screen pixels. cam.x/y is the view's top-left at zoom 1;
  // zoom scales about the view centre (same convention as world.js).
  function toScreen(wx, wy, cam, par, parY) {
    const px = par === undefined || par === null ? 1 : +par, py = parY === undefined || parY === null ? px : +parY, z = cam.zoom || 1;
    return [(wx - cam.x * px - W / 2) * z + W / 2, (wy - cam.y * py - H / 2) * z + H / 2];
  }
  const groundOf = (L) => (L && L.ground !== undefined && L.ground !== null ? +L.ground : 300);

  // Sky presets: colour stops top -> horizon, a horizon glow (city light / low sun), clouds, stars,
  // `lit` = share of distant windows lit, `sil` = the colour near silhouettes lean toward.
  const SKY = {
    night:    { stops: ['#0b0e18', '#111626', '#182034', '#20273d', '#2b3046', '#3b394b'], glow: '#5e4642', glowA: 0.36, stars: 0.7, clouds: 0.45, cloud: '#141824', cloudLit: '#2d2a34', litBelow: true, lit: 1, sil: '#07080d' },
    dusk:     { stops: ['#141829', '#22253b', '#383249', '#574357', '#7a5458', '#97665a'], glow: '#b47a58', glowA: 0.3, stars: 0.12, clouds: 0.7, cloud: '#352c42', cloudLit: '#8c5d56', litBelow: true, lit: 0.6, sil: '#120f18' },
    dawn:     { stops: ['#1a2233', '#2c3549', '#454c61', '#6a6773', '#917f77', '#ad9178'], glow: '#c79f7c', glowA: 0.26, stars: 0.05, clouds: 0.6, cloud: '#4b4e60', cloudLit: '#a5887b', litBelow: true, lit: 0.35, sil: '#181a24' },
    day:      { stops: ['#4b5f76', '#5a6d83', '#6b7d90', '#7e8e9c', '#909da6', '#a2abae'], glow: '#b3b5b0', glowA: 0.2, stars: 0, clouds: 0.6, cloud: '#8995a0', cloudLit: '#aeb6ba', litBelow: false, lit: 0, sil: '#353d4a' },
    overcast: { stops: ['#323943', '#3b424c', '#454c56', '#50565e', '#5b6067', '#666a6e'], glow: '#72746f', glowA: 0.18, stars: 0, clouds: 1, cloud: '#3c424c', cloudLit: '#585d65', litBelow: false, lit: 0.25, sil: '#1f232a' },
    storm:    { stops: ['#0b0d13', '#11141b', '#171b24', '#1e222c', '#262a34', '#2f313a'], glow: '#3c3940', glowA: 0.25, stars: 0, clouds: 1, cloud: '#12151c', cloudLit: '#272a34', litBelow: true, lit: 0.8, sil: '#06070b', lightning: true },
  };
  // L.sky: preset name | '#hex' (flat colour) | { preset, stops, glow, clouds, stars, moon, moonX, moonY, seed }.
  function skyOf(L) {
    let s = L ? L.sky : undefined, o = {};
    if (s && typeof s === 'object') { o = s; s = s.preset || s.kind; }
    if (s === undefined || s === null || s === '') s = L && L.kind === 'interior' ? 'none' : 'night';
    s = String(s);
    if (s[0] === '#') return { name: 'solid', d: null, o, solid: s };
    return { name: SKY[s] ? s : 'none', d: SKY[s] || null, o };
  }

  const SKY_PAD = 40, CLOUD_W = 1280, CLOUD_H = 150;
  const skyCache = new Map(), cloudCache = new Map();
  // The sky gradient, pre-rendered as crisp bands with a checker dither on each seam.
  function skyCanvas(sk) {
    const o = sk.o, d = sk.d, stops = Array.isArray(o.stops) && o.stops.length > 1 ? o.stops : d.stops, glow = o.glow || d.glow;
    const key = sk.name + '|' + stops.join() + '|' + glow;
    let e = skyCache.get(key);
    if (e) return e;
    const cv = makeCanvas(W, H + SKY_PAD);
    if (!cv) return null;
    const c = ctx2d(cv), hz = Math.round(H * 0.68), n = 26, bh = hz / n;
    const at = (t) => { const f = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)); return mix(stops[i], stops[i + 1], f - i); };
    let prev = null;
    for (let i = 0; i < n; i++) {
      const y0 = Math.round(i * bh), y1 = Math.round((i + 1) * bh), col = at(i / (n - 1));
      R(c, 0, y0, W, y1 - y0, col);
      if (prev) {
        c.fillStyle = prev;
        for (let x = 0; x < W; x += 2) c.fillRect(x, y0, 1, 1);
        for (let x = 1; x < W; x += 4) c.fillRect(x, y0 + 1, 1, 1);
      }
      prev = col;
    }
    R(c, 0, hz, W, H + SKY_PAD - hz, stops[stops.length - 1]);
    // Light pollution (night) or the low sun (dusk/dawn) pooling on the horizon.
    if (glow) for (let y = hz - 130; y < H + SKY_PAD; y += 2) { const t = clamp(1 - (hz - y) / 130, 0, 1); RA(c, 0, y, W, 2, glow, (y < hz ? t * t : 1) * (d.glowA || 0.3)); }
    e = { cv, hz };
    if (skyCache.size > 12) skyCache.delete(skyCache.keys().next().value);
    skyCache.set(key, e);
    return e;
  }
  // A wrapping 1280-wide strip of flat-based pixel clouds, lit from below at night (city glow).
  function cloudCanvas(sk) {
    const o = sk.o, d = sk.d, dens = clamp(o.clouds !== undefined ? +o.clouds : d.clouds, 0, 1);
    if (!(dens > 0)) return null;
    const key = sk.name + '|' + dens + '|' + (+o.seed || 0);
    let e = cloudCache.get(key);
    if (e) return e;
    const cv = makeCanvas(CLOUD_W, CLOUD_H);
    if (!cv) return null;
    const c = ctx2d(cv), seed = 5.3 + (+o.seed || 0) * 1.7, n = Math.round(5 + dens * 26), hzc = d.stops[d.stops.length - 1];
    for (let i = 0; i < n; i++) {
      const depth = Math.pow(hash(seed + i * 4.11), 0.75);   // 0 = high in the sky, 1 = low on the horizon
      const cw = 50 + hash(seed + i * 1.31) * (90 + dens * 170) * (1 - depth * 0.3), ch = 4 + Math.round(hash(seed + i * 2.17) * (6 + dens * 10) * (1 - depth * 0.4));
      const cx = hash(seed + i * 3.07) * CLOUD_W, cy = 2 + depth * (CLOUD_H - 26);
      const haze = 0.12 + depth * 0.45, body = mix(d.cloud, hzc, haze), lit = mix(d.cloudLit, hzc, haze * 0.6);
      for (const off of [-CLOUD_W, 0, CLOUD_W]) if (cx + off + cw > 0 && cx + off - cw < CLOUD_W) cloudShape(c, cx + off, cy, cw, ch, body, lit, d.litBelow, seed + i);
    }
    e = { cv, y: 6, speed: 1.2 + dens * 2 };
    if (cloudCache.size > 12) cloudCache.delete(cloudCache.keys().next().value);
    cloudCache.set(key, e);
    return e;
  }
  function cloudShape(c, cx, cy, cw, ch, body, lit, litBelow, seed) {
    const lumps = 2 + Math.floor(hash(seed * 1.3 + 0.2) * 3), base = cy + ch;
    for (let k = 0; k < lumps; k++) {
      const lw = cw * (0.35 + 0.5 * hash(seed + k * 0.77)), lh = Math.max(2, Math.round(ch * (0.45 + 0.55 * hash(seed + k * 1.91))));
      const lx = cx - cw / 2 + hash(seed + k * 2.33) * (cw - lw);
      const litRows = Math.max(1, Math.round(lh * (litBelow ? 0.3 : 0.35)));
      for (let r = 0; r < lh; r++) {
        const t = (r + 1) / lh, rw = lw * Math.sqrt(1 - (1 - t) * (1 - t)) + (hash(seed + k + r * 0.71) - 0.5) * 4;
        if (rw < 2) continue;
        const isLit = litBelow ? r >= lh - litRows : r < litRows;
        R(c, lx + (lw - rw) / 2, base - lh + r, rw, 1, isLit ? lit : body);
      }
    }
    // ragged wisps trailing off the flat base
    for (let i = 0; i < 3; i++) { const wx = cx - cw * 0.6 + hash(seed + i * 5.1) * cw * 1.2, ww = 6 + hash(seed + i * 6.3) * cw * 0.4; R(c, wx, base + (i % 2), ww, 1, body); }
  }
  function drawStars(ctx, sk, off, time) {
    const n = Math.round(90 * clamp(sk.o.stars !== undefined ? +sk.o.stars : sk.d.stars, 0, 2));
    for (let i = 0; i < n; i++) {
      const x = Math.floor(hash(i * 1.913 + 0.31) * W), y = Math.floor(Math.pow(hash(i * 2.377 + 0.77), 1.6) * H * 0.55) - off;
      const b = hash(i * 3.11 + 0.13);
      if (b > 0.8 && hash(i * 0.7 + Math.floor(time * 1.3 + i * 0.37)) < 0.2) continue;   // a few twinkle
      Px(ctx, x, y, b > 0.93 ? '#aeb3c4' : b > 0.6 ? '#6c7389' : '#454c61');
      if (b > 0.988) { const dim = '#3d4459'; Px(ctx, x - 1, y, dim); Px(ctx, x + 1, y, dim); Px(ctx, x, y - 1, dim); Px(ctx, x, y + 1, dim); }
    }
  }
  function drawMoon(ctx, sk, off) {
    const o = sk.o;
    if (!o.moon) return;
    const mx = Math.round(o.moonX !== undefined ? +o.moonX : W * 0.76), my = Math.round((o.moonY !== undefined ? +o.moonY : 52) - off);
    for (let r = 24; r > 8; r -= 4) ellipse(ctx, mx, my, r, r, rgba('#8d93a6', 0.03));
    ellipse(ctx, mx, my, 6, 6, '#a9aba4'); ellipse(ctx, mx - 1, my - 1, 5, 5, '#c4c4b8');
    Px(ctx, mx + 1, my + 1, '#a2a49c'); R(ctx, mx - 3, my, 2, 1, '#aeb0a8'); Px(ctx, mx + 2, my - 3, '#b4b5ac');
    if (o.moon === 'crescent') ellipse(ctx, mx + 3, my - 2, 5, 5, sk.d.stops[1]);
  }
  // A jagged lightning bolt, drawn on the flash's brightest frames.
  function drawBolt(ctx, x, yEnd, seed, a) {
    let px = x, py = 0;
    const col = rgba('#dfe4f2', a), dim = rgba('#9aa6c4', a * 0.6);
    for (let i = 0; py < yEnd && i < 60; i++) {
      const nx = px + (hash(seed + i * 1.7) - 0.5) * 14, ny = py + 5 + hash(seed + i * 2.9) * 8;
      line(ctx, px, py, nx, ny, col);
      if (hash(seed + i * 3.3) < 0.16) { let bx = nx, by = ny; for (let k = 0; k < 4; k++) { const ex = bx + (hash(seed + i + k * 0.9) - 0.3) * 12, ey = by + 4 + hash(seed + k + i * 1.3) * 6; line(ctx, bx, by, ex, ey, dim); bx = ex; by = ey; } }
      px = nx; py = ny;
    }
  }

  /* Far parallax: each preset is a few bands, far -> near. A band is pre-rendered once per
     (location width, sky) into a canvas as wide as its parallax travel, then blitted every frame
     with a few live details (aviation lights, windows switching, chimney smoke, water glints).
     depth `d`: 0 = faint and hazy, 1 = dark and crisp (reduce contrast and detail with distance). */
  const BACKDROPS = {
    skyline: [
      { gen: 'towers', par: 0.04, lift: 74, d: 0.12, h: 240, winP: 0.06, o: { minW: 10, maxW: 26, minH: 50, maxH: 180, gap: 4 } },
      { gen: 'midrise', par: 0.09, lift: 38, d: 0.5, h: 160, winP: 0.09, o: { minW: 16, maxW: 44, minH: 30, maxH: 104 } },
      { gen: 'midrise', par: 0.15, lift: 12, d: 0.82, h: 110, winP: 0.07, o: { minW: 26, maxW: 66, minH: 14, maxH: 48, pitchX: 6, pitchY: 7, ww: 2, wh: 3 } },
    ],
    foundry: [
      { gen: 'ridge', par: 0.03, lift: 44, d: 0.1, h: 110 },
      { gen: 'foundry', par: 0.08, lift: 20, d: 0.55, h: 170, winP: 1 },
      { gen: 'yard', par: 0.14, lift: 6, d: 0.85, h: 70, winP: 0.5 },
    ],
    river: [
      { gen: 'midrise', par: 0.04, lift: 52, d: 0.32, h: 110, winP: 0.14, o: { minW: 10, maxW: 30, minH: 8, maxH: 50, pitchX: 3, pitchY: 4, ww: 1, wh: 1 } },
      { gen: 'river', par: 0.1, lift: 0, d: 0.65, h: 150, winP: 1 },
    ],
    towers: [
      { gen: 'towers', par: 0.03, lift: 90, d: 0.08, h: 230, winP: 0.05, o: { minW: 12, maxW: 30, minH: 50, maxH: 160, gap: 12 } },
      { gen: 'towers', par: 0.07, lift: 44, d: 0.45, h: 250, winP: 0.12, o: { minW: 22, maxW: 46, minH: 50, maxH: 196, gap: 22 } },
      { gen: 'midrise', par: 0.13, lift: 12, d: 0.82, h: 120, winP: 0.06, o: { minW: 24, maxW: 60, minH: 20, maxH: 60 } },
    ],
    rowhouses: [
      { gen: 'midrise', par: 0.04, lift: 46, d: 0.15, h: 110, winP: 0.06, o: { minW: 10, maxW: 30, minH: 14, maxH: 60, pitchX: 3, pitchY: 4, ww: 1, wh: 1 } },
      { gen: 'rows', par: 0.09, lift: 20, d: 0.5, h: 80, winP: 0.14, o: { minH: 18, maxH: 30 } },
      { gen: 'rows', par: 0.15, lift: 4, d: 0.82, h: 90, winP: 0.12, o: { minH: 22, maxH: 34, trees: true, poles: true } },
    ],
  };
  // L.backdrop: preset | 'river+skyline' | [presets] | { preset(s), seed, lit (0..1 window scale) }
  function backdropOf(L) {
    let b = L ? L.backdrop : undefined, o = {};
    if (b && typeof b === 'object' && !Array.isArray(b)) { o = b; b = b.preset || b.presets || b.kind; }
    const names = (Array.isArray(b) ? b : typeof b === 'string' ? b.split(/[\s+,]+/) : []).filter((n) => BACKDROPS[n]);
    return { names, o };
  }
  function bandColours(sk, d, seed) {
    // silhouettes take the sky colour at mid height (not the horizon), so tall far towers never
    // come out lighter than the sky behind them; the haze pass warms their bases toward the horizon
    const sd = sk.d, st = sd.stops, hz = st[st.length - 1], f = 0.55 * (st.length - 1), i0 = Math.floor(f);
    const mid = mix(st[i0], st[Math.min(st.length - 1, i0 + 1)], f - i0), col = mix(mix(mid, hz, 0.35), sd.sil, 0.22 + 0.62 * d);
    const dim = 0.22 + 0.4 * (1 - d);   // haze over far windows
    return {
      hz, col, d, seed, lit: sd.lit,
      rim: d > 0.3 ? mix(col, hz, 0.18 + 0.14 * (1 - d)) : null,
      win: mix('#f4c271', col, dim), winCool: mix('#cdd8d2', col, dim + 0.08), winTv: mix('#8aaad2', col, dim), furnace: mix('#e8893e', col, dim * 0.7),
      water: mix(hz, '#080b12', 0.62), winP: 0, meta: { blink: [], smoke: [], lamps: [], glow: [], water: null },
    };
  }
  // Rooftop and window details shared by the band generators (all in the band's flat colour).
  function silTank(c, x, top, g, big) {
    const w = big ? 7 : 5;
    R(c, x, top - 3, 1, 3, g.col); R(c, x + w - 1, top - 3, 1, 3, g.col);
    R(c, x, top - 9, w, 6, g.col); R(c, x + 1, top - 10, w - 2, 1, g.col); Px(c, x + (w >> 1), top - 11, g.col);
    if (g.rim) R(c, x, top - 9, 1, 6, g.rim);
  }
  function silAntenna(c, x, top, h, g) { R(c, x, top - h, 1, h, g.col); R(c, x - 3, top - h + 2, 7, 1, g.col); R(c, x - 2, top - h + 5, 5, 1, g.col); }
  function silWindows(c, x, top, w, h, g, seed, px, py, ww, wh, office) {
    if (!(g.winP > 0)) return;
    for (let yy = top + 3, row = 0; yy + wh <= top + h - 2; yy += py, row++) {
      const rowLit = !office || hash(seed + row * 7.31) < g.winP * 1.6;
      for (let xx = x + 2; xx + ww <= x + w - 1; xx += px) {
        const hv = hash(seed + xx * 0.191 + yy * 0.737), p = office ? (rowLit ? 0.6 : g.winP * 0.12) : g.winP;
        if (hv >= p) continue;
        const col = office ? (hash(seed + row + xx * 0.31) < 0.55 ? g.winCool : g.win) : hv < p * 0.12 ? g.winTv : g.win;
        R(c, xx, yy, ww, wh, col);
        if (g.meta.blink.length < 28 && hash(seed + xx * 1.3 + yy * 0.1) < 0.05) g.meta.blink.push({ x: xx, y: yy, w: ww, h: wh, col, kind: 'win', ph: hash(seed + xx + yy * 3) });
      }
    }
  }
  const GEN = {
    towers(c, bw, bh, g, o) {
      let x = -Math.round(hash(g.seed) * 14), i = 0;
      while (x < bw) {
        const hv = (k) => hash(g.seed + i * 3.17 + k * 0.53);
        const w = Math.round(o.minW + hv(1) * (o.maxW - o.minW)), h = Math.round(o.minH + Math.pow(hv(2), 1.3) * (o.maxH - o.minH)), top = bh - h, mid = x + (w >> 1);
        R(c, x, top, w, h, g.col);
        const k = hv(3);
        if (k < 0.2) { // setback crown with a mast
          const sw = Math.max(3, Math.round(w * 0.55)), sh = 4 + Math.round(h * 0.08);
          R(c, x + ((w - sw) >> 1), top - sh, sw, sh, g.col);
          if (hv(4) < 0.7) { const mh = 8 + Math.round(hv(5) * 16); R(c, mid, top - sh - mh, 1, mh, g.col); g.meta.blink.push({ x: mid, y: top - sh - mh, kind: 'red', ph: hv(6) }); }
        } else if (k < 0.36) { // stepped deco top and a spire
          for (let s = 1; s <= 3; s++) if (w - s * 4 > 1) R(c, x + s * 2, top - s * 4, w - s * 4, 4, g.col);
          const sp = 6 + Math.round(hv(7) * 10); R(c, mid, top - 12 - sp, 1, sp, g.col);
        } else if (k < 0.52) { // flat roof, plant room, antenna with a warning light
          R(c, x + 2, top - 4, Math.min(8, w - 4), 4, g.col);
          const ah = 10 + Math.round(hv(8) * 18); R(c, x + w - 4, top - ah, 1, ah, g.col);
          g.meta.blink.push({ x: x + w - 4, y: top - ah, kind: 'red', ph: hv(9) });
        } else if (k < 0.62 && w > 14) { // slanted roof
          for (let j = 0; j < w; j++) { const th = Math.round((j / w) * 10); if (th) R(c, x + j, top - th, 1, th, g.col); }
        }
        if (g.rim && h > 20) R(c, x, top, 1, h, g.rim);
        silWindows(c, x, top, w, h, g, g.seed + i * 11.3, o.pitchX || 3, o.pitchY || 3, 1, 1, o.office !== false);
        x += w + Math.round(hv(10) * (o.gap || 0)) - (hv(11) < 0.3 ? Math.round(w * 0.35) : 0);
        i++;
      }
    },
    midrise(c, bw, bh, g, o) {
      const minW = o.minW || 16, maxW = o.maxW || 46, minH = o.minH || 22, maxH = o.maxH || 80;
      let x = -Math.round(hash(g.seed + 1) * 10), i = 0;
      while (x < bw) {
        const hv = (k) => hash(g.seed + i * 2.71 + k * 0.61);
        const w = Math.round(minW + hv(1) * (maxW - minW)), h = Math.round(minH + hv(2) * (maxH - minH)), top = bh - h;
        R(c, x, top, w, h, g.col);
        R(c, x, top, w, 1, g.rim || g.col);   // parapet catching the sky
        const k = hv(3);
        if (k < 0.3) silTank(c, x + 3 + Math.round(hv(4) * Math.max(1, w - 10)), top, g, hv(5) < 0.5);
        else if (k < 0.5) silAntenna(c, x + 3 + Math.round(hv(6) * Math.max(1, w - 6)), top, 8 + Math.round(hv(7) * 8), g);
        else if (k < 0.62) { R(c, x + 3, top - 5, 4, 5, g.col); R(c, x + 2, top - 6, 6, 1, g.col); }   // stair bulkhead
        else if (k < 0.7 && w > 20) { // a billboard on the roof
          const bww = Math.min(22, w - 4);
          R(c, x + 4, top - 6, 1, 6, g.col); R(c, x + bww - 1, top - 6, 1, 6, g.col); R(c, x + 2, top - 16, bww, 10, g.col);
          if (g.winP > 0 && hv(8) < 0.5) R(c, x + 3, top - 15, bww - 2, 1, g.win);
        }
        if (k > 0.86 && hv(12) < 0.5) { // a church steeple now and then
          const sx = x + (w >> 1);
          R(c, sx - 2, top - 26, 5, 26, g.col);
          for (let j = 0; j < 10; j++) R(c, sx - 2 + Math.floor(j / 4), top - 27 - j, 5 - Math.floor(j / 4) * 2, 1, g.col);
          R(c, sx, top - 41, 1, 5, g.col); R(c, sx - 1, top - 39, 3, 1, g.col);
        }
        if (g.rim) R(c, x, top, 1, h, g.rim);
        silWindows(c, x, top, w, h, g, g.seed + i * 5.9, o.pitchX || 4, o.pitchY || 5, o.ww || 2, o.wh || 2, false);
        x += w + (hv(9) < 0.3 ? 1 + Math.round(hv(10) * 4) : 0);
        i++;
      }
    },
    rows(c, bw, bh, g, o) {
      const minH = o.minH || 18, maxH = o.maxH || 30;
      let x = -Math.round(hash(g.seed + 2) * 8), i = 0;
      while (x < bw) {
        const hv = (k) => hash(g.seed + i * 1.93 + k * 0.47);
        const w = 12 + Math.round(hv(1) * 12), h = minH + Math.round(hv(2) * (maxH - minH)), top = bh - h, k = hv(3);
        R(c, x, top, w, h, g.col);
        if (k < 0.3) { const gh = Math.round(w / 2.4); for (let j = 0; j < gh; j++) R(c, x + Math.round(j * 1.2), top - j - 1, w - Math.round(j * 2.4), 1, g.col); }   // gable
        else if (k < 0.45) { R(c, x + 1, top - 4, w - 2, 4, g.col); R(c, x + 2, top - 5, w - 4, 1, g.col); }   // mansard
        else R(c, x - 1, top, w + 2, 1, g.rim || g.col);   // flat roof, cornice line
        if (hv(4) < 0.55) {
          const cx = x + 2 + Math.round(hv(5) * (w - 5)), ct = top - 6 - (k < 0.3 ? 2 : 0);
          R(c, cx, ct, 2, 6 + (k < 0.3 ? 2 : 0), g.col); R(c, cx - 1, ct, 4, 1, g.col);
          if (hv(6) < 0.3) g.meta.smoke.push({ x: cx + 1, y: ct - 1, s: 0.35 });
        }
        if (hv(7) < 0.25) silAntenna(c, x + 3 + Math.round(hv(8) * (w - 6)), top - (k < 0.3 ? 3 : 0), 7 + Math.round(hv(9) * 6), g);
        if (g.rim) R(c, x, top, 1, h, g.rim);
        silWindows(c, x, top, w, h, g, g.seed + i * 4.3, 5, 7, 2, 3, false);
        x += w;
        i++;
      }
      if (o.trees) {
        const tc = mix(g.col, '#14201a', 0.35);
        for (let tx = 6; tx < bw; tx += 22) {
          if (hash(g.seed + tx * 0.13) > 0.4) continue;
          const r = 6 + Math.round(hash(g.seed + tx * 0.7) * 6);
          R(c, tx, bh - 8, 1, 8, tc); ellipse(c, tx, bh - 8 - r * 0.7, r, Math.round(r * 0.75), tc);
          if (g.rim) for (let j = -r + 2; j < 0; j += 2) Px(c, tx + j, bh - 8 - r * 0.7 - Math.round(Math.sqrt(Math.max(0, r * r - j * j)) * 0.75), mix(tc, g.hz, 0.25));
        }
      }
      if (o.poles) {
        let prev = null;
        for (let px = 20; px < bw; px += 64 + Math.round(hash(g.seed + px) * 24)) {
          R(c, px, bh - 46, 1, 46, g.col); R(c, px - 5, bh - 43, 11, 1, g.col); Px(c, px - 4, bh - 44, g.col); Px(c, px + 4, bh - 44, g.col);
          if (prev !== null) { cable(c, prev, bh - 44, px, bh - 44, 5, g.col); cable(c, prev - 4, bh - 43, px - 4, bh - 43, 6, g.col); }
          prev = px;
        }
      }
    },
    ridge(c, bw, bh, g) {
      for (let x = 0; x < bw; x++) {
        const h = 12 + Math.round(8 * Math.sin(x * 0.011 + g.seed) + 5 * Math.sin(x * 0.037 + g.seed * 2) + 2 * hash(Math.floor(x / 6) + g.seed));
        R(c, x, bh - h, 1, h, g.col);
      }
      for (let i = 0; i < bw / 110; i++) {
        const sx = Math.round(hash(g.seed + i * 3.3) * bw), sh = 30 + Math.round(hash(g.seed + i * 4.4) * 36);
        R(c, sx, bh - sh, 2, sh, g.col); g.meta.smoke.push({ x: sx + 1, y: bh - sh - 1, s: 0.55 });
      }
    },
    foundry(c, bw, bh, g) {
      let x = -Math.round(hash(g.seed + 3) * 20), i = 0;
      while (x < bw) {
        const hv = (k) => hash(g.seed + i * 4.07 + k * 0.39), kind = hv(1);
        if (kind < 0.5) { // shed with a sawtooth roof; the glazed teeth glow from the furnaces inside
          const w = 50 + Math.round(hv(2) * 90), h = 22 + Math.round(hv(3) * 20), top = bh - h;
          R(c, x, top, w, h, g.col);
          for (let tx = x; tx < x + w - 8; tx += 9) {
            for (let j = 0; j < 8; j++) { const th = Math.round((j / 8) * 7); if (th) R(c, tx + j, top - th, 1, th, g.col); }
            R(c, tx + 8, top - 7, 1, 7, g.winP > 0 && hash(g.seed + tx * 0.7) < 0.65 ? g.furnace : g.col);
          }
          for (let wx = x + 3; wx < x + w - 4; wx += 5) if (hash(g.seed + wx * 0.31) < (g.winP > 0 ? 0.5 : 0.08)) R(c, wx, top + 6, 2, 3, hash(wx + g.seed) < 0.3 ? g.win : g.furnace);
          if (g.rim) R(c, x, top - 6, 1, h + 6, g.rim);
          x += w + 2;
        } else if (kind < 0.78) { // smokestacks with their base house
          const n = 1 + Math.floor(hv(4) * 3);
          for (let s = 0; s < n; s++) {
            const sx = x + 6 + s * 14, sh = 70 + Math.round(hash(g.seed + i + s * 1.7) * 70);
            for (let yy = 0; yy < sh; yy++) { const ww = Math.round(lerp(8, 5, yy / sh)); R(c, sx - (ww >> 1), bh - yy - 1, ww, 1, g.col); }
            R(c, sx - 3, bh - sh - 2, 7, 2, g.col);
            for (const bk of [0.93, 0.62]) R(c, sx - 3, bh - Math.round(sh * bk), 7, 1, g.rim || g.col);
            if (g.rim) R(c, sx - 3, bh - Math.round(sh * 0.9), 1, Math.round(sh * 0.9), g.rim);
            g.meta.smoke.push({ x: sx, y: bh - sh - 3, s: 1 });
            g.meta.blink.push({ x: sx, y: bh - sh - 4, kind: 'red', ph: hash(g.seed + s + i) });
          }
          const w = 12 + n * 14;
          R(c, x, bh - 18, w, 18, g.col);
          if (g.winP > 0) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (hash(g.seed + wx) < 0.4) R(c, wx, bh - 13, 2, 2, g.win);
          x += w + 2;
        } else if (kind < 0.9) { // blast furnace, hot-blast stoves, downcomer pipe and skip hoist
          const fx = x + 24, fh = 64 + Math.round(hv(5) * 16);
          R(c, fx - 7, bh - fh, 14, fh, g.col); R(c, fx - 5, bh - fh - 6, 10, 6, g.col); R(c, fx - 1, bh - fh - 18, 2, 12, g.col);
          for (let s = 0; s < 3; s++) { const sx2 = fx + 12 + s * 10; R(c, sx2, bh - 50, 8, 50, g.col); R(c, sx2 + 1, bh - 53, 6, 3, g.col); }
          line(c, fx + 1, bh - fh - 12, fx + 18, bh - 54, g.col); line(c, fx + 2, bh - fh - 12, fx + 19, bh - 54, g.col);
          line(c, fx - 6, bh - fh + 10, fx - 24, bh - 2, g.col); line(c, fx - 6, bh - fh + 12, fx - 22, bh - 2, g.col);
          if (g.rim) R(c, fx - 7, bh - fh, 1, fh, g.rim);
          if (g.winP > 0) { R(c, fx - 3, bh - 14, 6, 4, g.furnace); g.meta.glow.push({ x: fx, y: bh - 12, r: 22 }); }
          g.meta.smoke.push({ x: fx, y: bh - fh - 19, s: 0.7 });
          x += 62;
        } else { // gantry crane
          const cw = 40 + Math.round(hv(6) * 20), ch = 36 + Math.round(hv(7) * 14);
          R(c, x + 2, bh - ch, 2, ch, g.col); R(c, x + cw - 4, bh - ch, 2, ch, g.col); R(c, x - 4, bh - ch - 3, cw + 12, 3, g.col);
          line(c, x + 3, bh - ch, x + cw - 3, bh - 6, g.col);
          R(c, x + Math.round(cw * 0.55), bh - ch, 3, 4, g.col); R(c, x + Math.round(cw * 0.55) + 1, bh - ch + 4, 1, 10, g.col);
          x += cw + 8;
        }
        i++;
      }
    },
    yard(c, bw, bh, g) {
      let x = 6, i = 0;
      while (x < bw) {
        const hv = (k) => hash(g.seed + i * 2.29 + k * 0.83), k = hv(1);
        if (k < 0.45) { // a string of boxcars on a siding
          const n = 1 + Math.floor(hv(2) * 3);
          for (let j = 0; j < n; j++) {
            const cx = x + j * 33;
            R(c, cx, bh - 17, 31, 12, g.col); R(c, cx - 1, bh - 18, 33, 1, g.rim || g.col);
            R(c, cx + 3, bh - 5, 6, 2, g.col); R(c, cx + 22, bh - 5, 6, 2, g.col);
            if (g.rim) R(c, cx + 12, bh - 15, 6, 9, mix(g.col, g.hz, 0.1));
          }
          x += n * 33 + 10;
        } else if (k < 0.75) { // low shed
          const w = 20 + Math.round(hv(3) * 22), h = 10 + Math.round(hv(4) * 8);
          R(c, x, bh - h, w, h, g.col);
          for (let j = 0; j < 4; j++) R(c, x + j, bh - h - 4 + j, w - j * 2, 1, g.col);
          if (g.winP > 0 && hv(5) < 0.6) R(c, x + 4, bh - h + 3, 3, 2, g.win);
          x += w + 6;
        } else { // floodlight mast
          R(c, x + 1, bh - 44, 1, 44, g.col); R(c, x - 2, bh - 46, 7, 2, g.col);
          if (g.winP > 0) { R(c, x - 1, bh - 44, 5, 1, g.winCool); g.meta.glow.push({ x: x + 1, y: bh - 42, r: 10, cool: true }); }
          x += 18;
        }
        i++;
      }
      R(c, 0, bh - 12, bw, 1, g.col);   // chain-link fence line
      for (let fx = 0; fx < bw; fx += 14) R(c, fx, bh - 13, 1, 13, g.col);
      for (let fx = 0; fx < bw; fx += 3) Px(c, fx, bh - 11 + ((fx / 3) % 2), g.col);
      R(c, 0, bh - 3, bw, 3, g.col);
    },
    river(c, bw, bh, g) {
      const wy = bh - 46, deck = wy - 34, span = 26;
      // water reflects the sky, darker toward the near bank, with sparse broken ripples
      vbands(c, 0, wy, bw, bh - wy, mix(g.hz, g.water, 0.5), g.water, 6);
      R(c, 0, wy, bw, 1, mix(g.hz, g.water, 0.2));
      for (let i = 0; i < bw / 5; i++) {
        const xx = Math.floor(hash(g.seed + i * 1.37) * bw), yy = wy + 3 + Math.floor(Math.pow(hash(g.seed + i * 2.11), 1.5) * (bh - wy - 6));
        R(c, xx, yy, 3 + Math.floor(hash(i + g.seed) * 7), 1, mix(g.hz, g.water, 0.68));
      }
      // a long steel truss bridge on stone piers, its deck lamps strung along it
      R(c, 0, deck, bw, 3, g.col); R(c, 0, deck + 3, bw, 1, mix(g.col, '#000000', 0.2));
      R(c, 0, deck - 14, bw, 1, g.col);
      for (let x = 0; x < bw; x += span) {
        line(c, x, deck, x + span / 2, deck - 14, g.col); line(c, x + span / 2, deck - 14, x + span, deck, g.col);
        R(c, x + span / 2, deck - 14, 1, 14, g.col);
      }
      if (g.rim) R(c, 0, deck - 15, bw, 1, g.rim);
      for (let x = 60; x < bw; x += 156) { R(c, x - 4, deck + 3, 8, wy - deck - 1, g.col); R(c, x - 6, wy - 2, 12, 3, g.col); }
      for (let x = 7; x < bw; x += 22) {
        R(c, x, deck - 4, 1, 4, g.col);
        if (g.winP > 0) { R(c, x - 1, deck - 5, 3, 1, g.win); g.meta.lamps.push({ x, y: deck - 5 }); }
      }
      g.meta.water = { y: wy, deck };
    },
  };

  const BAND_PAD = 24, bandCache = new Map();
  function getBand(name, idx, spec, sk, L, o) {
    const lw = Math.max(W, +(L && L.w) || 2400);
    const bw = Math.ceil(W + Math.max(0, lw - W) * spec.par) + BAND_PAD * 2;
    const seed = (o.seed !== undefined ? +o.seed : 7) + idx * 13.7 + name.length * 3.1;
    const litScale = o.lit !== undefined ? clamp(+o.lit, 0, 3) : 1;
    const key = name + '#' + idx + '|' + sk.name + '|' + bw + '|' + seed + '|' + litScale;
    let b = bandCache.get(key);
    if (b) return b;
    const cv = makeCanvas(bw, spec.h);
    if (!cv) return null;
    const c = ctx2d(cv), g = bandColours(sk, spec.d, seed);
    g.winP = (spec.winP || 0) * g.lit * litScale;
    GEN[spec.gen](c, bw, spec.h, g, spec.o || {});
    // atmospheric haze thickening toward each band's base (source-atop keeps it on the silhouettes)
    c.globalCompositeOperation = 'source-atop';
    const h0 = Math.max(0, spec.h - 70);
    for (let y = h0; y < spec.h; y += 2) RA(c, 0, y, bw, 2, g.hz, ((y - h0) / (spec.h - h0)) * (0.08 + 0.32 * (1 - spec.d)));
    c.globalCompositeOperation = 'source-over';
    b = { cv, w: bw, h: spec.h, par: spec.par, lift: spec.lift, fill: spec.gen === 'river' ? g.water : g.col, g, meta: g.meta };
    if (bandCache.size > 30) bandCache.delete(bandCache.keys().next().value);
    bandCache.set(key, b);
    return b;
  }
  function drawBand(ctx, b, L, cam, time) {
    const z = cam.zoom || 1, s = 1 + (z - 1) * Math.min(1, b.par * 2);   // far bands barely react to zoom
    const x0 = -BAND_PAD - cam.x * b.par, base = groundOf(L) - cam.y * b.par - b.lift, y0 = base - b.h;
    const dx = Math.round(W / 2 + (x0 - W / 2) * s), dy = Math.round(H / 2 + (y0 - H / 2) * s), dw = Math.round(b.w * s), dh = Math.round(b.h * s);
    if (dx > W || dx + dw < 0) return;
    ctx.drawImage(b.cv, dx, dy, dw, dh);
    if (dy + dh < H) R(ctx, 0, dy + dh, W, H - dy - dh, b.fill);
    const g = b.g, m = b.meta, X = (bx) => dx + bx * s, Y = (by) => dy + by * s, onScreen = (sx) => sx > -40 && sx < W + 40;
    // aviation lights blink; a few distant windows switch on and off over time
    for (const e of m.blink) {
      const sx = X(e.x);
      if (!onScreen(sx)) continue;
      if (e.kind === 'red') {
        if (frac(time / 1.7 + e.ph) < 0.42) { Px(ctx, sx, Y(e.y), '#d4553f'); RA(ctx, sx - 1, Y(e.y) - 1, 3, 3, '#d4553f', 0.22); }
      } else if (hash(e.ph * 13.7 + Math.floor((time + e.ph * 20) / (5 + e.ph * 9))) > 0.62) R(ctx, sx, Y(e.y), e.w * s, e.h * s, g.col);
    }
    // stack and chimney smoke leaning downwind
    const smokeCol = mix(g.hz, '#6b6a70', 0.35);
    for (let k = 0; k < m.smoke.length; k++) {
      const e = m.smoke[k], sx = X(e.x);
      if (sx < -80 || sx > W + 20) continue;
      const n = e.s >= 0.9 ? 7 : 4, sp = 0.05 + 0.03 * hash(k * 1.7 + g.seed);
      for (let j = 0; j < n; j++) {
        const age = frac(time * sp + j / n), px = sx + (age * 44 + Math.sin(time * 0.6 + j + k) * 2) * e.s * s, py = Y(e.y) - age * 32 * e.s * s;
        const rr = Math.max(1, (1.4 + age * 9) * e.s * s);
        ellipse(ctx, px, py, rr, Math.max(1, Math.round(rr * 0.62)), rgba(smokeCol, (0.42 - 0.1 * (1 - g.d)) * (1 - age)));
      }
    }
    // furnace and floodlight glow breathing
    for (const e of m.glow) {
      const sx = X(e.x);
      if (!onScreen(sx)) continue;
      const a = (e.cool ? 0.07 : 0.1) + 0.04 * Math.sin(time * 1.3 + e.x * 0.1);
      ellipse(ctx, sx, Y(e.y), e.r * s, Math.round(e.r * 0.55 * s), rgba(e.cool ? '#b8c8cc' : '#e07a3a', a));
    }
    // river: lamp reflections broken into horizontal dashes, drifting glints, cars on the bridge
    if (m.water) {
      const wy = Y(m.water.y), step = Math.floor(time * 5), deep = Math.min(44, H - wy);
      // each lamp leaves a column of broken dashes that spreads and fades with depth
      for (let k = 0; k < m.lamps.length; k++) {
        const sx = X(m.lamps[k].x);
        if (!onScreen(sx) || hash(k * 7.7 + g.seed) < 0.3) continue;
        const reach = deep * (0.5 + 0.5 * hash(k * 1.9 + g.seed));
        for (let yy = 2; yy < reach; yy += 2) {
          const f = yy / reach, hv = hash(k * 3.1 + yy * 0.77 + step * 0.13);
          if (hv < 0.3 + f * 0.35) continue;
          const len = 1 + Math.floor(hv * (2 + f * 5));
          RA(ctx, sx - (len >> 1) + Math.round((hash(k + yy * 1.3 + step * 0.7) - 0.5) * (2 + f * 8)), wy + yy, len, 1, g.win, 0.5 * (1 - f));
        }
      }
      if (m.moonX !== undefined) for (let yy = 3; yy < deep; yy += 2) {   // the moon's path on the water
        const f = yy / deep, hv = hash(yy * 0.71 + step * 0.37);
        if (hv < 0.25) continue;
        const len = 2 + Math.floor(hv * (3 + f * 9));
        RA(ctx, m.moonX - (len >> 1) + Math.round((hash(yy + step * 0.19) - 0.5) * (3 + f * 10)), wy + yy, len, 1, '#b8bab0', 0.32 * (1 - f));
      }
      const n = Math.floor(W / 16);
      for (let i = 0; i < n; i++) {
        const xx = frac(hash(i * 3.7 + 1) + time * 0.006 * (0.5 + hash(i))) * W, yy = wy + 4 + Math.floor(hash(i * 5.1 + 2) * 36);
        if (hash(i * 0.9 + Math.floor(time * 2 + i) * 0.13) < 0.5) R(ctx, xx, yy, 2 + Math.floor(hash(i) * 5), 1, mix(g.hz, g.water, 0.35));
      }
      const deckY = Y(m.water.deck) - 2;
      for (let k = 0; k < 3; k++) {
        const dir = k % 2 ? -1 : 1, cx = dx + frac(hash(k * 7.3) + dir * time * (0.012 + k * 0.004)) * dw;
        Px(ctx, cx, deckY, dir > 0 ? '#efe2b8' : '#c8503c'); Px(ctx, cx + 3 * dir, deckY, dir > 0 ? '#c8503c' : '#efe2b8');
      }
    }
  }

  function drawBackdrop(ctx, L, cam, time) {
    const sk = skyOf(L), bd = backdropOf(L);
    if (sk.solid) R(ctx, 0, 0, W, H, sk.solid);
    else if (!sk.d) {
      if (L.kind === 'interior' && !bd.names.length) return;   // the room shell covers the frame
      R(ctx, 0, 0, W, H, PAL.night);
    } else {
      const sc = skyCanvas(sk);
      if (!sc) return;
      const off = Math.round(clamp(cam.y * 0.05, 0, SKY_PAD));
      ctx.drawImage(sc.cv, 0, -off);
      drawStars(ctx, sk, off, time);
      drawMoon(ctx, sk, off);
      const fl = sk.d.lightning ? wxFlash(L) : 0;
      if (fl > 0.02) {
        RA(ctx, 0, 0, W, sc.hz - off, '#8e98b0', fl * 0.45 * flashSetting());
        if (fl > 0.55 && flashSetting() > 0.3) drawBolt(ctx, wxBolt(L) * W, sc.hz - off - 50, Math.floor(wxBolt(L) * 977), fl);
      }
      const cl = cloudCanvas(sk);
      if (cl) {
        const v = time * cl.speed + cam.x * 0.02, ox = -Math.round(((v % CLOUD_W) + CLOUD_W) % CLOUD_W);
        ctx.drawImage(cl.cv, ox, cl.y - off); ctx.drawImage(cl.cv, ox + CLOUD_W, cl.y - off);
      }
    }
    if (!bd.names.length) return;
    const skc = sk.d ? sk : { name: 'night', d: SKY.night, o: {} };
    const bands = [];
    // Combined presets ('river+skyline'): the first is nearest; each later one is pushed back
    // behind it (higher on the horizon, slower parallax, hazier).
    bd.names.forEach((name, rank) => BACKDROPS[name].forEach((spec0, i) => {
      const o0 = spec0.o || {}, o = Object.assign({}, o0, { minH: (o0.minH || 22) * 0.65, maxH: (o0.maxH || 80) * 0.65 });
      const spec = rank ? Object.assign({}, spec0, { par: spec0.par * 0.6, lift: spec0.lift + (bd.names[0] === 'river' ? 46 : 26) * rank, d: spec0.d * 0.75, o }) : spec0;
      const b = getBand(rank ? name + '@' + rank : name, i, spec, skc, L, bd.o);
      if (b) bands.push(b);
    }));
    bands.sort((a, b) => a.par - b.par);
    const moonX = sk.d && sk.o.moon ? Math.round(sk.o.moonX !== undefined ? +sk.o.moonX : W * 0.76) : undefined;
    for (const b of bands) { b.meta.moonX = moonX; drawBand(ctx, b, L, cam, time); }
  }

  let backdropFailed = false;
  S.backdrop = {
    skies: Object.keys(SKY),
    presets: Object.keys(BACKDROPS),
    sky: skyOf,
    // Identity-transformed 640x360 ctx; camX/camY = the view's top-left in world pixels (or pass S.cam as camX).
    draw(ctx, L, camX, camY, time) {
      if (S.headless || !ctx) return;
      try {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        drawBackdrop(ctx, L || {}, camOf(camX, camY), time === undefined || time === null ? S.time || 0 : +time);
      } catch (e) {
        if (!backdropFailed) { backdropFailed = true; fail(e, 'backdrop'); }
      } finally { ctx.restore(); }
    },
    clearCache() { skyCache.clear(); cloudCache.clear(); bandCache.clear(); },
    // Haze for parallax piece layers: world.js tints the baked far/mid canvases toward this colour
    // (source-atop, alpha k) so depth reads as distance. Interiors use the ambient tint.
    hazeFor(L, layer) {
      const sk = skyOf(L || {}), k = layer === 'far' ? 0.5 : layer === 'mid' ? 0.26 : 0;
      const fog = clamp(+((L && L.ambient && L.ambient.fog) || 0), 0, 1);
      const color = sk.d ? mix(sk.d.stops[sk.d.stops.length - 1], sk.d.stops[2], 0.25) : sk.solid || (L && L.ambient && L.ambient.tint) || '#1a1c24';
      return { color, k: k ? clamp(k + fog * 0.2, 0, 0.85) : 0 };
    },
  };

  /* ── 10. Weather ─────────────────────────────────────────────────── */
  /* Screen-space particles with a fake depth z (0.55 far .. 1.45 near): nearer ones are bigger,
     brighter, faster and slide more when the camera moves. State is kept per LocationDef object,
     so two views (the dev page) never fight over it. Cosmetic only: a private PRNG, no S.rand(). */
  const WX_COUNT = { rain: 240, drizzle: 120, snow: 150, dust: 60, smoke: 12, embers: 46, leaves: 22 };
  const WX_WIND = { rain: -0.3, drizzle: -0.2, snow: 0.2, dust: 0.1, smoke: 0.35, embers: 0.25, leaves: 0.6 };
  // L.weather: 'rain' | 'rain+smoke' | ['rain', 'smoke'] | { kind, k|amount, wind } | [{...}, ...].
  // L.weatherAmount and L.wind are shorthands for the whole list.
  function weatherSpec(L) {
    const w = L && L.weather, out = [];
    if (!w) return out;
    const add = (v, k, wind) => {
      if (!v) return;
      if (typeof v === 'string') {
        for (const n of v.split(/[\s+,]+/)) if (WX_COUNT[n]) out.push({ kind: n, k: k === undefined || k === null ? 1 : clamp(+k || 0, 0, 2), wind: wind === undefined || wind === null ? WX_WIND[n] : +wind || 0 });
      } else if (Array.isArray(v)) for (const x of v) add(x, k, wind);
      else if (typeof v === 'object') add(v.kind || v.kinds || v.type, v.k !== undefined ? v.k : v.amount !== undefined ? v.amount : k, v.wind !== undefined ? v.wind : wind);
    };
    add(w, L.weatherAmount, L.wind);
    return out;
  }
  const wxKindCache = new Map();
  // Kind names only (also used by the puddle piece to decide whether rain rings show).
  function weatherKinds(L) {
    const w = L && L.weather;
    if (!w) return [];
    if (typeof w === 'string') {
      let v = wxKindCache.get(w);
      if (!v) { v = weatherSpec({ weather: w }).map((s) => s.kind); if (wxKindCache.size > 64) wxKindCache.clear(); wxKindCache.set(w, v); }
      return v;
    }
    return weatherSpec(L).map((s) => s.kind);
  }

  const wxStates = new WeakMap();
  function wxState(L) {
    if (!L || typeof L !== 'object') return null;
    const spec = weatherSpec(L), sig = spec.map((s) => s.kind + ':' + s.k + ':' + s.wind).join('|');
    let st = wxStates.get(L);
    if (st && st.sig === sig) return st;
    st = { sig, sys: [], cam: null, gy: groundOf(L), rnd: prng(0x1994 + sig.length * 131), t: 0, flash: 0, bolt: 0.5, reflash: 0, storm: false };
    for (const s of spec) {
      const sys = { kind: s.kind, k: s.k, wind: s.wind, parts: [], splash: [] }, n = Math.round(WX_COUNT[s.kind] * s.k);
      for (let i = 0; i < n; i++) { const p = {}; wxSpawn(st, sys, p, true); sys.parts.push(p); }
      st.sys.push(sys);
    }
    const sk = skyOf(L);
    st.storm = !!(sk.d && sk.d.lightning) && spec.some((s) => s.kind === 'rain');
    wxStates.set(L, st);
    return st;
  }
  function wxFlash(L) { const st = L && typeof L === 'object' ? wxStates.get(L) : null; return st ? st.flash : 0; }
  function wxBolt(L) { const st = L && typeof L === 'object' ? wxStates.get(L) : null; return st ? st.bolt : 0.5; }

  // (Re)place a particle. `initial` scatters it over the whole view instead of the entry edge.
  function wxSpawn(st, s, p, initial) {
    const r = st.rnd;
    p.z = 0.55 + r() * 0.9; p.age = 0; p.ph = r() * 6.283;
    switch (s.kind) {
      case 'rain': case 'drizzle': case 'snow': case 'leaves':
        p.x = r() * (W + 80) - 40; p.y = initial ? r() * H : -r() * 50 - 8;
        if (!initial && s.kind === 'leaves' && r() < 0.5) { p.x = s.wind >= 0 ? -10 : W + 10; p.y = r() * H * 0.7; }
        break;
      case 'embers':
        p.x = r() * W; p.y = initial ? r() * H : H - r() * 60; p.life = 1.6 + r() * 2.6; p.age = initial ? r() * p.life : 0;
        break;
      case 'smoke':
        p.r = 26 + r() * 50; p.y = H * (0.3 + r() * 0.65);
        p.x = initial ? r() * (W + 240) - 120 : s.wind >= 0 ? -p.r - r() * 40 : W + p.r + r() * 40;
        break;
      default: // dust
        p.x = r() * W; p.y = r() * H;
    }
  }
  function wxUpdate(dt, L) {
    if (S.headless) return;
    const st = wxState(L);
    if (!st || !st.sys.length) return;
    dt = clamp(+dt || 0, 0, 0.1);
    if (!dt) return;
    st.t += dt;
    const t = st.t, gy = st.gy;
    for (const s of st.sys) {
      const wind = s.wind;
      for (const p of s.parts) {
        p.age += dt;
        switch (s.kind) {
          case 'rain': case 'drizzle': {
            const vy = s.kind === 'rain' ? 430 + 170 * p.z : 190 + 90 * p.z;
            p.x += vy * wind * 0.3 * dt; p.y += vy * dt;
            // nearer drops land lower on the street: a cheap read of depth
            const land = gy + (p.z - 1) * 26;
            if (land > 0 && land < H + 30 && p.y >= land) {
              if ((s.kind === 'rain' ? p.z > 0.75 : p.z > 1.2) && s.splash.length < 90) s.splash.push({ x: p.x, y: land, age: 0 });
              wxSpawn(st, s, p);
            } else if (p.y > H + 24) wxSpawn(st, s, p);
            break;
          }
          case 'snow':
            p.x += (wind * 28 + Math.sin(t * 1.1 + p.ph) * 10) * p.z * dt; p.y += (14 + 20 * p.z) * dt;
            if (p.y > H + 6) wxSpawn(st, s, p);
            break;
          case 'leaves':
            p.x += (wind * 50 * p.z + Math.cos(t * 1.3 + p.ph) * 16) * dt; p.y += (20 + 18 * p.z + Math.sin(t * 2 + p.ph) * 12) * dt;
            if (p.y > H + 6 || p.x < -30 || p.x > W + 30) wxSpawn(st, s, p);
            break;
          case 'embers':
            p.x += (Math.sin(t * 2.2 + p.ph) * 14 + wind * 14) * dt; p.y -= (24 + 30 * p.z) * dt;
            if (p.age > p.life || p.y < -6) wxSpawn(st, s, p);
            break;
          case 'smoke':
            p.x += (5 + 11 * Math.abs(wind)) * (wind < 0 ? -1 : 1) * p.z * dt; p.y += Math.sin(t * 0.2 + p.ph) * 2 * dt;
            if (wind >= 0 ? p.x - p.r > W + 40 : p.x + p.r < -40) wxSpawn(st, s, p);
            break;
          default: // dust motes hang and wander
            p.x += (wind * 5 + Math.sin(t * 0.35 + p.ph) * 3.5) * dt; p.y += (Math.cos(t * 0.27 + p.ph * 1.7) * 2.5 - 0.6) * dt;
        }
        if (s.kind !== 'smoke') { if (p.x < -40) p.x += W + 80; else if (p.x > W + 40) p.x -= W + 80; }
        if (s.kind === 'dust') { if (p.y < -4) p.y += H + 8; else if (p.y > H + 4) p.y -= H + 8; }
      }
      for (let i = s.splash.length - 1; i >= 0; i--) { s.splash[i].age += dt; if (s.splash[i].age > 0.22) s.splash.splice(i, 1); }
    }
    // storm lightning: a flash, sometimes a second strike right after
    if (st.storm) {
      if (st.reflash > 0) { st.reflash -= dt; if (st.reflash <= 0) st.flash = 0.8; }
      else if (st.rnd() < dt * 0.07) { st.flash = 1; st.bolt = 0.1 + st.rnd() * 0.8; if (st.rnd() < 0.45) st.reflash = 0.14; }
      st.flash = Math.max(0, st.flash - dt * 3.2);
    }
  }

  // Emissive bits (embers, the lightning wash) drawn after the darkness pass by S.light.composite.
  const EMIT = [];
  const emit = (e) => { if (EMIT.length < 600) EMIT.push(e); };
  let puffSprite = null;
  function puff() {
    if (puffSprite) return puffSprite;
    const cv = makeCanvas(64, 64);
    if (!cv) return null;
    const c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(118,124,136,0.9)'); g.addColorStop(0.5, 'rgba(108,114,126,0.45)'); g.addColorStop(1, 'rgba(98,104,116,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    puffSprite = cv;
    return cv;
  }
  const RAIN_COL = ['rgba(125,140,160,0.2)', 'rgba(147,163,182,0.3)', 'rgba(180,194,210,0.42)'];
  const DRIZZLE_COL = ['rgba(130,146,166,0.14)', 'rgba(150,164,182,0.22)', 'rgba(170,184,200,0.3)'];
  const LEAF_COL = ['#6e5430', '#7a4428', '#5e5e34', '#8a6a34'];
  function drawRain(c, s) {
    const drizzle = s.kind === 'drizzle', slope = s.wind * 0.3, cols = drizzle ? DRIZZLE_COL : RAIN_COL;
    // three depth buckets, one path each; a streak is a few 1-px vertical runs following the slant
    for (let b = 0; b < 3; b++) {
      c.beginPath();
      for (const p of s.parts) {
        if ((p.z < 0.85 ? 0 : p.z < 1.15 ? 1 : 2) !== b) continue;
        const len = Math.round(drizzle ? 2 + 3 * p.z : 5 + 9 * p.z), y1 = Math.round(p.y), ya = y1 - len;
        if (y1 < 0 || ya > H) continue;
        let sx = Math.round(p.x - slope * len), sy = ya;
        for (let y = ya + 1; y <= y1; y++) {
          const xx = Math.round(p.x - slope * (y1 - y));
          if (xx !== sx) { c.rect(sx, sy, 1, y - sy); sx = xx; sy = y; }
        }
        c.rect(sx, sy, 1, y1 + 1 - sy);
      }
      c.fillStyle = cols[b]; c.fill();
    }
    for (const q of s.splash) {
      const k = q.age / 0.22, a = (1 - k) * (drizzle ? 0.35 : 0.6), sp = 1 + Math.round(q.age * 16), up = Math.round(Math.sin(k * Math.PI) * 3);
      RA(c, q.x - sp, q.y - up, 1, 1, '#b8c6d6', a); RA(c, q.x + sp, q.y - up, 1, 1, '#b8c6d6', a);
      if (q.age < 0.06) RA(c, q.x - 1, q.y, 3, 1, '#9aa8ba', 0.4);
    }
  }
  function wxDraw(ctx, L, cam) {
    if (S.headless || !ctx) return;
    const st = wxState(L);
    if (!st || !st.sys.length) return;
    cam = camOf(cam);
    st.gy = toScreen(0, groundOf(L), cam)[1];
    // keep particles anchored to the world while the camera moves (far ones drift less)
    if (st.cam) {
      const z = cam.zoom || 1, dx = (cam.x - st.cam.x) * z, dy = (cam.y - st.cam.y) * z;
      if (Math.abs(dx) > 240 || Math.abs(dy) > 240) { for (const s of st.sys) { for (const p of s.parts) wxSpawn(st, s, p, true); s.splash.length = 0; } }
      else if (dx || dy) for (const s of st.sys) {
        for (const p of s.parts) { p.x -= dx * p.z; p.y -= dy * p.z; if (s.kind !== 'smoke') { if (p.x < -40) p.x += W + 80; else if (p.x > W + 40) p.x -= W + 80; } }
        for (const q of s.splash) { q.x -= dx; q.y -= dy; }
      }
    }
    st.cam = { x: cam.x, y: cam.y };
    const t = st.t;
    ctx.save();
    for (const s of st.sys) {
      switch (s.kind) {
        case 'rain': case 'drizzle':
          drawRain(ctx, s);
          // spray hanging low over the street
          if (st.gy > 0 && st.gy < H) for (let i = 0; i < 4; i++) RA(ctx, 0, st.gy - 18 + i * 6, W, 6, '#8a98ac', (s.kind === 'rain' ? 0.03 : 0.02) * s.k * (i < 2 ? 0.6 : 1));
          break;
        case 'snow':
          for (const p of s.parts) {
            const a = 0.4 + 0.45 * clamp((p.z - 0.55) / 0.9, 0, 1), x = Math.round(p.x), y = Math.round(p.y);
            if (p.z > 1.25) { RA(ctx, x, y - 1, 1, 3, '#d6dae2', a); RA(ctx, x - 1, y, 3, 1, '#d6dae2', a); } else RA(ctx, x, y, 1, 1, '#cfd4dc', a);
          }
          break;
        case 'dust':
          for (const p of s.parts) RA(ctx, Math.round(p.x), Math.round(p.y), p.z > 1.25 ? 2 : 1, 1, '#c8b896', 0.08 + 0.2 * (0.5 + 0.5 * Math.sin(t * 1.3 + p.ph)));
          break;
        case 'smoke': {
          const spr = puff();
          if (!spr) break;
          ctx.imageSmoothingEnabled = true;
          for (const p of s.parts) { ctx.globalAlpha = clamp(0.075 * s.k * p.z, 0, 0.25); ctx.drawImage(spr, p.x - p.r, p.y - p.r * 0.55, p.r * 2, p.r * 1.1); }
          ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
          break;
        }
        case 'embers':
          for (const p of s.parts) {
            const k = p.age / p.life;
            if (hash(p.ph + Math.floor(t * 14) * 0.31) < 0.12) continue;
            const col = k < 0.35 ? '#f6c66a' : k < 0.7 ? '#e47e3a' : '#a8441c';
            const x = Math.round(p.x), y = Math.round(p.y), a = Math.min(1, 1.2 - k) * (0.55 + 0.45 * p.z);
            RA(ctx, x, y, 1, 1, col, a);
            emit({ x, y, w: p.z > 1.2 ? 2 : 1, h: 1, col, a: a * 0.85 });
          }
          break;
        case 'leaves':
          for (const p of s.parts) {
            const x = Math.round(p.x), y = Math.round(p.y), f = Math.floor(t * 5 + p.ph * 3) % 4, col = LEAF_COL[Math.floor(p.ph * 0.63) % 4];
            if (f === 0) R(ctx, x, y, 2, 1, col);
            else if (f === 1) { Px(ctx, x, y, col); Px(ctx, x + 1, y + 1, col); }
            else if (f === 2) R(ctx, x, y, 1, 2, col);
            else { Px(ctx, x + 1, y, col); Px(ctx, x, y + 1, col); }
          }
          break;
      }
    }
    ctx.restore();
    if (st.flash > 0.02) emit({ full: true, col: '#aeb8d0', a: st.flash * 0.22 * flashSetting() });
  }
  function wxIsWet(L) {
    if (L && L.wet !== undefined && L.wet !== null) return L.wet === true ? 0.7 : clamp(+L.wet || 0, 0, 1);
    const k = weatherKinds(L);
    return k.indexOf('rain') >= 0 ? 1 : k.indexOf('drizzle') >= 0 ? 0.75 : 0;
  }

  let weatherFailed = false;
  S.weather = {
    kinds: weatherKinds,
    spec: weatherSpec,
    wet: wxIsWet,   // 0..1: how strongly lights reflect on the ground (rain 1, drizzle .75, L.wet overrides)
    flash: wxFlash,
    update(dt, L) { try { wxUpdate(dt, L); } catch (e) { if (!weatherFailed) { weatherFailed = true; fail(e, 'weather.update'); } } },
    draw(ctx, L, cam) {
      try { wxDraw(ctx, L, cam || S.cam); } catch (e) { if (!weatherFailed) { weatherFailed = true; fail(e, 'weather.draw'); } }
      if (ctx) resetCtx(ctx);
    },
    reset(L) { if (L && typeof L === 'object') wxStates.delete(L); },
  };

  /* ── 11. Lighting composite ──────────────────────────────────────── */
  /* Order inside composite():
       1. darkness: L.ambient.dark fills an offscreen buffer in a dusty blue-charcoal (or the
          ambient tint), lights cut soft holes in it (destination-out), cones cut a beam plus a
          pool where the beam meets the floor; the buffer is drawn over the frame.
       2. glow: additive ('lighter') warm halos, a hot core at each lamp, faint beams.
       3. wet ground: lights flagged `reflect` (and lit windows, weaker) leave broken horizontal
          reflections below the floor line when it rains or L.wet is set; puddle pieces always do.
       4. fog (L.ambient.fog), then emissive weather bits (embers, lightning wash).
     Light: { x, y, r, color, k, flicker, cone: { dir: 'down'|'up'|'left'|'right'|deg, width: deg },
              reflect, win, glow (halo scale), shaft (beam scale), par/parY (layer parallax), layer, seed } */
  const DARK_DEF = '#0f1322';
  const LB = { cv: null, c: null, w: 0, h: 0 };
  function lightBuf(w, h) {
    if (!LB.cv || LB.w !== w || LB.h !== h) {
      const cv = makeCanvas(w, h);
      if (!cv) return null;
      LB.cv = cv; LB.c = cv.getContext('2d'); LB.w = w; LB.h = h;
    }
    return LB;
  }
  // Flicker 0..1 -> brightness multiplier. Below .5 it breathes and shimmers (fire, a TV);
  // from .5 up it also drops out now and then (a dying tube, a bad streetlight).
  function flickerK(l, time) {
    const f = clamp(+l.flicker || 0, 0, 1);
    if (!f) return 1;
    const sd = l.seed !== undefined ? +l.seed : (+l.x || 0) * 0.37 + (+l.y || 0) * 0.11;
    const slow = 0.5 + 0.5 * Math.sin(time * 2.3 + sd * 5.1) * Math.sin(time * 0.71 + sd);
    const fast = hash(sd + Math.floor(time * 20) * 0.731);
    let k = 1 - f * (0.25 * slow + 0.25 * fast);
    if (f >= 0.5 && hash(sd * 1.31 + Math.floor(time * 7 + sd * 3) * 0.917) < (f - 0.4) * 0.35) k *= 0.08 + 0.25 * hash(sd + Math.floor(time * 40) * 0.37);
    return clamp(k, 0, 1);
  }
  // Every piece light of a location (with its layer parallax) plus L.lights; cached per layer list.
  const gatherCache = new WeakMap();
  function gatherLights(L) {
    if (!L || typeof L !== 'object') return [];
    const layers = L.layers || {};
    let sig = '';
    for (const n in layers) sig += n + (Array.isArray(layers[n]) ? layers[n].length : 0) + ',';
    const e = gatherCache.get(L);
    if (e && e.layers === layers && e.extra === L.lights && e.sig === sig) return e.list;
    const list = [];
    for (const n in layers) {
      if (!Array.isArray(layers[n])) continue;
      const par = LAYER_PAR[n] !== undefined ? LAYER_PAR[n] : 1;
      for (const p of layers[n]) for (const l of pieces.lights(p, L)) list.push(Object.assign({ par, layer: n }, l));
    }
    if (Array.isArray(L.lights)) for (const l of L.lights) if (l) list.push(l);
    gatherCache.set(L, { layers, extra: L.lights, sig, list });
    return list;
  }
  // Puddle pieces on the main layers, as world x ranges (reflections brighten over them).
  const puddleCache = new WeakMap();
  function puddlesOf(L) {
    if (!L || typeof L !== 'object' || !L.layers) return [];
    const e = puddleCache.get(L);
    if (e && e.layers === L.layers) return e.list;
    const list = [];
    for (const n of ['back', 'main', 'front']) for (const p of L.layers[n] || []) if (p && p.t === 'puddle' && pieces.active(p)) list.push({ x0: +p.x || 0, x1: (+p.x || 0) + (+p.w || 40), y: gyOf(p, L) });
    puddleCache.set(L, { layers: L.layers, list });
    return list;
  }
  function floorBelow(L, l, par) {
    if (par === 1 && S.world && S.world.loc === L && typeof S.world.groundAt === 'function') {
      try { const g = S.world.groundAt(+l.x || 0, (+l.y || 0) + 2); if (isFinite(g)) return g; } catch (_) { /* fall back to the location ground */ }
    }
    return groundOf(L);
  }
  const CONE_DIR = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 };
  function coneOf(a, L, cam) {
    const cone = a.l.cone, d = cone.dir;
    const ang = typeof d === 'number' ? (d * Math.PI) / 180 : CONE_DIR[d] !== undefined ? CONE_DIR[d] : Math.PI / 2;
    const half = (clamp(+cone.width || 60, 4, 170) * Math.PI) / 360;
    let len = a.r * 1.3, pool = null;
    if (Math.sin(ang) > 0.3) { // aimed downward: the beam stops at the floor and leaves a pool of light there
      const gyS = toScreen(0, floorBelow(L, a.l, a.par), cam, a.par, a.l.parY)[1], dist = (gyS - a.sy) / Math.sin(ang);
      if (dist > 4 && dist < a.r * 1.7) { len = dist; pool = { x: a.sx + Math.cos(ang) * dist, y: gyS + 2, rx: Math.tan(half) * dist + 4 * a.z }; }
    }
    return { ang, half, len, pool };
  }
  function conePath(c, a, cg, s) {
    const dx = Math.cos(cg.ang), dy = Math.sin(cg.ang), px = -dy, py = dx, w0 = 2 * a.z, w1 = Math.tan(cg.half) * cg.len;
    const ex = a.sx + dx * cg.len, ey = a.sy + dy * cg.len;
    c.beginPath();
    c.moveTo((a.sx + px * w0) * s, (a.sy + py * w0) * s); c.lineTo((ex + px * w1) * s, (ey + py * w1) * s);
    c.lineTo((ex - px * w1) * s, (ey - py * w1) * s); c.lineTo((a.sx - px * w0) * s, (a.sy - py * w0) * s);
    c.closePath();
  }
  // Soft disc: alpha k at the centre falling to 0 at r. Colour defaults to black (for hole punching).
  function radial(c, x, y, r, k, col) {
    if (!(r >= 0.5) || !(k > 0.002)) return;
    const v = col ? rgb(col) : [0, 0, 0], pre = 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',';
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, pre + Math.min(1, k).toFixed(3) + ')'); g.addColorStop(0.3, pre + Math.min(1, k * 0.82).toFixed(3) + ')');
    g.addColorStop(0.62, pre + Math.min(1, k * 0.36).toFixed(3) + ')'); g.addColorStop(1, pre + '0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function ellipseGrad(c, x, y, rx, ry, k, col) {
    if (!(rx >= 1)) return;
    c.save(); c.translate(x, y); c.scale(1, ry / rx); radial(c, 0, 0, rx, k, col); c.restore();
  }
  // Cones wider than ~100 degrees (fluorescent tubes, panels) light a room diffusely: a broad
  // soft hole with only a faint beam, instead of a hard-edged wedge.
  const isWide = (cg) => cg.half > 0.87;
  function punch(c, a, s) {
    const k = Math.min(1, a.k), cg = a.cg;
    if (!cg) { radial(c, a.sx * s, a.sy * s, a.r * s, k); return; }
    const wide = isWide(cg);
    radial(c, a.sx * s, (a.sy + (wide ? a.r * 0.25 : 0)) * s, a.r * (wide ? 0.95 : 0.42) * s, k * (wide ? 0.85 : 0.9));
    // two nested wedges (a wide faint one, then the beam) give the beam a soft edge
    const kc = wide ? k * 0.5 : k;
    for (const [spread, kk] of wide ? [[1, kc]] : [[1.3, kc * 0.35], [1, kc * 0.75]]) {
      const cs = spread === 1 ? cg : { ang: cg.ang, half: Math.min(1.45, cg.half * spread), len: cg.len, pool: null };
      conePath(c, a, cs, s);
      const g = c.createRadialGradient(a.sx * s, a.sy * s, 0, a.sx * s, a.sy * s, cg.len * 1.05 * s);
      g.addColorStop(0, 'rgba(0,0,0,' + (kk * 0.95).toFixed(3) + ')'); g.addColorStop(0.6, 'rgba(0,0,0,' + (kk * 0.7).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,' + (kk * 0.3).toFixed(3) + ')');
      c.fillStyle = g; c.fill();
    }
    if (cg.pool) ellipseGrad(c, cg.pool.x * s, cg.pool.y * s, cg.pool.rx * 1.3 * s, Math.max(4, cg.pool.rx * 0.24) * s, k * (wide ? 0.7 : 1));
  }
  // hazeK: how much airborne stuff (fog, rain, smoke, dust) makes beams visible.
  function glow(c, a, dark, fog, hazeK) {
    const cg = a.cg, wide = cg && isWide(cg), gs = a.l.glow !== undefined ? +a.l.glow : 1;
    const base = a.k * (0.14 + 0.26 * dark + 0.12 * fog) * (a.l.win ? 0.55 : 1) * gs;
    // a beam lamp gets a tight lens glare; the beam itself carries the light
    const hr = cg ? (wide ? a.r * 0.45 : Math.min(a.r * 0.22, 46 * a.z)) : a.r * 0.85;
    radial(c, a.sx, a.sy + (wide ? hr * 0.55 * Math.sin(cg.ang) : 0), hr * (1 + fog * 0.35), base * (cg && !wide ? 0.8 : 1), a.col);
    if (!a.l.win) radial(c, a.sx, a.sy, Math.max(3, 7 * a.z), Math.min(1, a.k * 0.5 * Math.min(1, gs + 0.3)), mix(a.col, '#ffffff', 0.35));
    if (!cg) return;
    const sh = a.k * (0.035 + 0.035 * dark + 0.12 * fog + 0.09 * hazeK) * (a.l.shaft !== undefined ? +a.l.shaft : 1) * (wide ? 0.3 : 1);
    if (sh > 0.003) for (const [spread, m] of wide ? [[1, 1]] : [[1.3, 0.35], [1, 0.75]]) {
      conePath(c, a, spread === 1 ? cg : { ang: cg.ang, half: Math.min(1.45, cg.half * spread), len: cg.len }, 1);
      const g = c.createRadialGradient(a.sx, a.sy, 0, a.sx, a.sy, cg.len * 1.05);
      g.addColorStop(0, rgba(a.col, sh * m)); g.addColorStop(0.7, rgba(a.col, sh * m * 0.45)); g.addColorStop(1, rgba(a.col, sh * m * 0.1));
      c.fillStyle = g; c.fill();
    }
    if (cg.pool) ellipseGrad(c, cg.pool.x, cg.pool.y, cg.pool.rx * 1.2, Math.max(4, cg.pool.rx * 0.2), a.k * (0.16 + 0.12 * dark), a.col);
  }
  // Broken horizontal reflections under lights on wet ground: dashes of 1–N px, densest at a
  // mirrored depth, re-shuffled several times a second while it rains (slowly when only wet).
  function reflections(c, L, act, cam, time, wetK, vh) {
    const pud = puddlesOf(L).map((p) => { const a = toScreen(p.x0, p.y, cam), b = toScreen(p.x1, p.y, cam); return { x0: a[0], x1: b[0], y: a[1] }; });
    if (!(wetK > 0) && !pud.length) return;
    const step = Math.floor(time * (wetK >= 0.9 ? 9 : 3));
    for (const a of act) {
      if (!(a.l.reflect || a.l.win) || a.par !== 1) continue;
      const gyS = toScreen(0, floorBelow(L, a.l, 1), cam)[1];
      if (a.sy >= gyS - 1 || gyS >= vh - 1) continue;
      const depth = Math.min(vh - gyS, 64 * a.z), cd = clamp((gyS - a.sy) * 0.32, 3, Math.max(3, depth - 6));
      const halfW = a.l.win ? Math.max(2, a.r * 0.18) : clamp(a.r * 0.1, 3, 12) * (a.l.cone ? 1 : 1.3);
      const sd = (+a.l.x || 0) * 0.37 + (+a.l.y || 0) * 0.17, base = Math.min(1, a.k) * (a.l.win ? 0.22 : 0.42);
      const near = pud.filter((p) => p.x1 > a.sx - halfW * 3 && p.x0 < a.sx + halfW * 3);
      if (!(wetK > 0) && !near.length) continue;
      for (let yy = 1; yy < depth; yy += yy > 10 ? 2 : 1) {
        const f = 1 - Math.abs(yy - cd) / (cd + 10);
        if (f <= 0) continue;
        const n = 1 + Math.floor(hash(sd + yy * 0.37 + step * 0.11) * 2.5);
        for (let j = 0; j < n; j++) {
          const hv = hash(sd + yy * 1.71 + j * 3.13 + step * 0.737);
          if (hv < 0.28) continue;
          const len = 1 + Math.floor(hv * halfW * 1.2);
          const xx = Math.round(a.sx + (hash(sd + yy * 2.31 + j * 1.7 + step * 0.293) - 0.5) * halfW * 2 * (0.5 + 0.5 * f) - len / 2);
          let k = base * f * wetK;
          for (const p of near) if (xx + len > p.x0 && xx < p.x1 && gyS + yy >= p.y - 1 && gyS + yy <= p.y + 6) { k = Math.max(k * 1.8, base * f * 0.9); break; }
          if (k > 0.01) RA(c, xx, gyS + yy, len, 1, a.col, Math.min(0.85, k));
        }
      }
    }
  }

  function composite(ctx, L, cam, lights, time, opts) {
    L = L || {};
    cam = camOf(cam || S.cam);
    time = time === undefined || time === null ? S.time || 0 : +time;
    const vw = (opts && +opts.w) || W, vh = (opts && +opts.h) || H;
    const amb = L.ambient || {}, dark = clamp(+amb.dark || 0, 0, 1), fog = clamp(+amb.fog || 0, 0, 1), wetK = wxIsWet(L);
    const src = Array.isArray(lights) ? lights : gatherLights(L), act = [];
    for (const l of src) {
      if (!l) continue;
      const par = l.par !== undefined && l.par !== null ? +l.par : l.layer && LAYER_PAR[l.layer] !== undefined ? LAYER_PAR[l.layer] : 1;
      const sp = toScreen(+l.x || 0, +l.y || 0, cam, par, l.parY), z = cam.zoom || 1, r = Math.max(2, (l.r !== undefined ? +l.r : 60) * z);
      const reach = l.cone ? r * 1.7 : r;
      if (sp[0] < -reach || sp[0] > vw + reach || sp[1] < -reach || sp[1] > vh + reach) continue;
      const k = clamp(l.k === undefined ? 1 : +l.k, 0, 1.5) * flickerK(l, time);
      if (k <= 0.01) continue;
      const a = { l, sx: sp[0], sy: sp[1], r, k, z, par, col: l.color || PAL.lamp, cg: null };
      if (l.cone) a.cg = coneOf(a, L, cam);
      act.push(a);
    }
    // 1. darkness with soft holes (half resolution, smoothed on the way up: soft edges, cheap)
    if (dark > 0.004) {
      const res = clamp(Math.round(+S.light.res || 1), 1, 4), bw = Math.ceil(vw / res), bh = Math.ceil(vh / res), b = lightBuf(bw, bh);
      if (b) {
        const c = b.c, s = 1 / res;
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        c.clearRect(0, 0, bw, bh);
        c.fillStyle = rgba(amb.tint ? mix(amb.tint, '#05060a', 0.45) : DARK_DEF, dark * 0.9);
        c.fillRect(0, 0, bw, bh);
        c.globalCompositeOperation = 'destination-out';
        for (const a of act) punch(c, a, s);
        c.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.imageSmoothingEnabled = res > 1;
        ctx.drawImage(b.cv, 0, 0, bw, bh, 0, 0, bw * res, bh * res);
        ctx.restore();
      }
    }
    // 2. warm additive glow, 3. wet reflections
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const kinds = weatherKinds(L);
    const hazeK = clamp((kinds.indexOf('rain') >= 0 ? 0.6 : kinds.indexOf('drizzle') >= 0 ? 0.4 : 0) + (kinds.indexOf('smoke') >= 0 ? 0.8 : 0) + (kinds.indexOf('dust') >= 0 ? 0.35 : 0) + (kinds.indexOf('snow') >= 0 ? 0.4 : 0), 0, 1.2);
    for (const a of act) glow(ctx, a, dark, fog, hazeK);
    reflections(ctx, L, act, cam, time, wetK, vh);
    ctx.restore();
    // 4. ground fog, then emissive weather
    if (fog > 0.01) { const fc = amb.fogColor || '#566078'; for (let y = 0; y < vh; y += 4) RA(ctx, 0, y, vw, 4, fc, fog * 0.22 * (0.35 + 0.65 * (y / vh))); }
    if (EMIT.length) {
      ctx.save();
      for (const e of EMIT) {
        if (e.full) { ctx.globalCompositeOperation = 'source-over'; RA(ctx, 0, 0, vw, vh, e.col, e.a); }
        else { ctx.globalCompositeOperation = 'lighter'; RA(ctx, e.x, e.y, e.w || 1, e.h || 1, e.col, e.a); }
      }
      ctx.restore();
      EMIT.length = 0;
    }
  }

  let lightFailed = false;
  S.light = {
    res: 2,                 // darkness buffer downscale (1 = full resolution)
    darkColor: DARK_DEF,
    // Identity-transformed ctx; lights in their layer coordinates (`par` = layer parallax, default 1).
    // `lights` omitted -> every piece light of L plus L.lights (S.light.gather). opts: { w, h } for a non-640x360 view.
    composite(ctx, L, cam, lights, time, opts) {
      if (S.headless || !ctx) return;
      try { composite(ctx, L, cam, lights, time, opts); } catch (e) { if (!lightFailed) { lightFailed = true; fail(e, 'light.composite'); } }
      resetCtx(ctx);
    },
    gather: gatherLights,
    flicker: flickerK,
    toScreen(x, y, cam, par, parY) { return toScreen(x, y, camOf(cam || S.cam), par, parY); },
    layerPar: LAYER_PAR,
  };

  // Drawing kit for world.js room shells and chapter-specific pieces (see notes).
  Object.assign(pieces.util, { wallFill, brickPatches, drawWin, drawDoor, drawPoster, graffitiTag, person, makeCanvas, prng, toScreen, gyOf, ceilOf });

})(window.STORY);
