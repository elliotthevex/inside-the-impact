/* Copied from research/src/avatars.js (the Login and Avatar Design Research, 2026-11). The Corner Pass
   shows the eight fighters from it under the spotlight. Loaded on demand by game.js. */
/* Inside the Impact — boxing avatar roster (design proposal).
   Every avatar is a 32x32 pixel bust drawn from shared parts, so the set
   keeps one style: same head size, same light from the top left, same
   1px ink outline, and at least one glove (or a boxing tool) in frame. */
(function () {
  const N = 32, INK = "#070a10";
  const G = () => Array.from({ length: N }, () => new Array(N).fill(0));
  const r = (g, x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < N && j >= 0 && j < N) g[j][i] = c; };
  const p = (g, x, y, c) => r(g, x, y, 1, 1, c);
  const e = (g, cx, cy, rx, ry, c, clip) => {
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const dx = (i + 0.5 - cx) / rx, dy = (j + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1 && (!clip || clip(i, j))) g[j][i] = c;
    }
  };
  const swap = (g, from, to, test) => { for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (g[j][i] === from && (!test || test(i, j))) g[j][i] = to; };
  const ring = (g, col) => {
    const o = G();
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (g[j][i]) { o[j][i] = g[j][i]; continue; }
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = i + a, y = j + b;
        if (x >= 0 && x < N && y >= 0 && y < N && g[y][x]) { o[j][i] = col; break; }
      }
    }
    return o;
  };
  /* draw a part on its own layer, give it an ink outline, lay it on top */
  const stamp = (L, fn) => { const t = G(); fn(t); const o = ring(t, INK); over(L, o); };
  const over = (A, B) => { for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (B[j][i]) A[j][i] = B[j][i]; };

  const SKIN = {
    a: ["#f2c9a0", "#d9a47a", "#b97f58", "#ffe2c4"],
    b: ["#dba271", "#bf8455", "#9c6740", "#f0c08e"],
    c: ["#a9714a", "#8c5937", "#6d4128", "#c48c62"],
    d: ["#6f4429", "#58331d", "#3f2312", "#8c5a38"],
  };
  const EYE = "#f3ead7", PUP = "#151922";

  /* ── shared parts ── */
  function glove(g, cx, cy, rx, ry, col, sh, hi, cuff, dir) {
    e(g, cx, cy, rx, ry, col);
    swap(g, col, sh, (i, j) => (i + 0.5 - cx) / rx * 0.6 + (j + 0.5 - cy) / ry > 0.5);
    e(g, cx - rx * 0.35, cy - ry * 0.42, Math.max(1, rx * 0.3), Math.max(0.9, ry * 0.22), hi);
    const sx = Math.round(cx + dir * rx * 0.38);
    r(g, sx, Math.round(cy - 1), 1, 3, sh);
    if (cuff) r(g, Math.round(cx - rx * 0.72), Math.round(cy + ry - 1.2), Math.round(rx * 1.44), 3, cuff);
  }
  function guard(L, o) {
    const big = o.big || "none", R = 4.4, Ry = 5;
    stamp(L, (g) => glove(g, 6.5, 23.6, big === "L" ? 5.2 : R, big === "L" ? 5.8 : Ry, o.glove, o.gloveS, o.gloveH, o.cuff, 1));
    stamp(L, (g) => glove(g, 25.5, 23.6, big === "R" ? 5.6 : R, big === "R" ? 6.2 : Ry, o.glove, o.gloveS, o.gloveH, o.cuff, -1));
  }
  function body(L, o) {
    stamp(L, (g) => {
      const s = o.skin;
      r(g, 13, 19, 6, 7, s[0]); r(g, 17, 19, 2, 7, s[1]);
      e(g, 16, 33.5, 13, 9.5, o.top);
      swap(g, o.top, o.topS, (i) => i >= 22);
      if (o.neck === "v") { r(g, 13, 24, 6, 1, s[0]); r(g, 14, 25, 4, 1, s[0]); r(g, 15, 26, 2, 1, s[0]); }
      if (o.neck === "collar") { r(g, 12, 24, 3, 2, o.collar); r(g, 17, 24, 3, 2, o.collar); }
      if (o.bodyExtra) o.bodyExtra(g);
    });
  }
  function head(L, o) {
    stamp(L, (g) => {
      const s = o.skin, hc = o.hairC;
      if (o.hair === "puff") e(g, 16, 9.5, 8.6, 6.8, hc);
      if (o.hair === "pony") { r(g, 21, 9, 3, 7, hc); e(g, 23, 16, 1.6, 2.6, hc); }
      e(g, 16, 14.5, 6.3, 7.2, s[0]);
      e(g, 9.6, 15, 1.4, 1.9, s[0]); e(g, 22.4, 15, 1.4, 1.9, s[0]);
      swap(g, s[0], s[1], (i, j) => i >= 20 || j >= 20);
      const cap = (c) => e(g, 16, 11.2, 6.7, 5.2, c, (i, j) => j <= 10);
      switch (o.hair) {
        case "buzz": cap(hc); r(g, 10, 11, 1, 2, hc); r(g, 21, 11, 1, 2, hc); break;
        case "short": cap(hc); r(g, 11, 10, 3, 2, hc); r(g, 10, 11, 1, 3, hc); r(g, 21, 11, 1, 3, hc); break;
        case "puff": cap(hc); break;
        case "pony": cap(hc); r(g, 10, 11, 1, 2, hc); break;
        case "bun": cap(hc); e(g, 16, 5.6, 2.8, 2.3, hc); p(g, 15, 4, o.hairH || hc); break;
        case "mohawk": cap(s[1]); r(g, 14, 2, 4, 9, hc); r(g, 15, 1, 2, 1, hc); p(g, 14, 2, s[1]); break;
        case "bald": p(g, 13, 9, s[3]); p(g, 14, 9, s[3]); p(g, 13, 10, s[3]); break;
        case "slick": cap(hc); r(g, 12, 8, 4, 1, o.hairH || hc); r(g, 10, 11, 1, 3, hc); r(g, 21, 11, 1, 3, hc); break;
      }
      if (o.headband) { r(g, 10, 10, 12, 2, o.headband); p(g, 22, 11, o.headband); p(g, 23, 12, o.headband); }
      if (o.hat) o.hat(g);
      // brows
      const bc = o.brow || hc || s[2];
      if (o.mood === "fierce") { p(g, 11, 12, bc); p(g, 12, 12, bc); p(g, 13, 13, bc); p(g, 18, 13, bc); p(g, 19, 12, bc); p(g, 20, 12, bc); }
      else if (o.mood === "kind") { p(g, 12, 12, bc); p(g, 13, 12, bc); p(g, 18, 12, bc); p(g, 19, 12, bc); p(g, 11, 13, bc); p(g, 20, 13, bc); }
      else { r(g, 11, 12, 3, 1, bc); r(g, 18, 12, 3, 1, bc); }
      // eyes
      if (o.mood === "calm") { r(g, 12, 15, 2, 1, EYE); r(g, 18, 15, 2, 1, EYE); p(g, 13, 15, PUP); p(g, 18, 15, PUP); r(g, 12, 14, 2, 1, s[2]); r(g, 18, 14, 2, 1, s[2]); }
      else { r(g, 12, 14, 2, 2, EYE); r(g, 18, 14, 2, 2, EYE); r(g, 13, 14, 1, 2, PUP); r(g, 18, 14, 1, 2, PUP); }
      // nose and mouth
      r(g, 15, 16, 2, 2, s[1]); p(g, 16, 17, s[2]);
      if (o.mouth === "guard") { r(g, 13, 19, 6, 2, "#3a1410"); r(g, 14, 19, 4, 1, o.guardC || "#4fb3e8"); }
      else if (o.mouth === "open") { r(g, 14, 19, 4, 2, "#3a1410"); r(g, 14, 19, 4, 1, "#f3ead7"); }
      else if (o.mouth === "smile") { r(g, 14, 19, 4, 1, "#7a3b2c"); p(g, 13, 18, "#7a3b2c"); p(g, 18, 18, "#7a3b2c"); }
      else r(g, 14, 19, 4, 1, "#7a3b2c");
      if (o.beard) { e(g, 16, 19.4, 5.8, 3.6, o.beard, (i, j) => j >= 17); r(g, 14, 19, 4, 1, "#5a2a20"); r(g, 14, 18, 4, 1, o.beard); }
      if (o.glasses) { const k = o.glasses; r(g, 11, 13, 4, 1, k); r(g, 11, 16, 4, 1, k); r(g, 11, 13, 1, 4, k); r(g, 14, 13, 1, 4, k); r(g, 17, 13, 4, 1, k); r(g, 17, 16, 4, 1, k); r(g, 17, 13, 1, 4, k); r(g, 20, 13, 1, 4, k); r(g, 15, 14, 2, 1, k); }
      if (o.faceExtra) o.faceExtra(g);
    });
  }
  function headgear(L, o) {
    stamp(L, (g) => {
      const s = o.skin, c = o.hg, cs = o.hgS;
      e(g, 16, 13.6, 8, 8.9, c);
      swap(g, c, cs, (i, j) => i >= 21);
      e(g, 16, 16, 4.9, 5.6, s[0]);
      swap(g, s[0], s[1], (i, j) => i >= 19 || j >= 20);
      r(g, 15, 5, 2, 6, cs); r(g, 11, 7, 1, 1, o.hgH); r(g, 12, 6, 2, 1, o.hgH);
      r(g, 12, 21, 8, 2, c);
      const bc = s[2];
      p(g, 12, 13, bc); p(g, 13, 13, bc); p(g, 18, 13, bc); p(g, 19, 13, bc);
      r(g, 12, 14, 2, 2, EYE); r(g, 18, 14, 2, 2, EYE); r(g, 13, 14, 1, 2, PUP); r(g, 18, 14, 1, 2, PUP);
      r(g, 15, 16, 2, 2, s[1]); p(g, 16, 17, s[2]);
      r(g, 13, 19, 6, 1, "#3a1410"); r(g, 14, 19, 4, 1, o.guardC || "#4fb3e8");
    });
  }

  /* ── backgrounds ── */
  const BG = {
    ring(g) {
      for (let j = 0; j < N; j++) r(g, 0, j, N, 1, j < 12 ? "#0c1624" : j < 22 ? "#101c2d" : "#142338");
      for (let j = 0; j < 22; j++) { const w = 6 + Math.floor(j * 0.7); r(g, 16 - w, j, w * 2, 1, j < 12 ? "#122036" : "#16263c"); }
      [[2, 3, "#3a2f4a"], [6, 2, "#2a3b52"], [9, 4, "#46313a"], [24, 3, "#2a3b52"], [28, 2, "#3a2f4a"], [4, 6, "#33405a"], [27, 6, "#46313a"], [1, 8, "#2a3b52"], [30, 9, "#33405a"]].forEach(([x, y, c]) => p(g, x, y, c));
      r(g, 0, 20, N, 1, "#8a2a24"); r(g, 0, 24, N, 1, "#a9a395"); r(g, 0, 28, N, 1, "#25508a");
    },
    gym(g) {
      for (let j = 0; j < N; j++) r(g, 0, j, N, 1, j % 4 === 3 ? "#24160f" : "#3a2419");
      for (let j = 0; j < N; j += 4) for (let i = (j / 4) % 2 ? 0 : 4; i < N; i += 8) r(g, i, j, 1, 3, "#24160f");
      r(g, 22, 3, 8, 7, "#3c5470"); r(g, 23, 4, 6, 5, "#5d7b98"); r(g, 25, 4, 1, 5, "#3c5470"); r(g, 23, 6, 6, 1, "#3c5470");
    },
    street(g) {
      for (let j = 0; j < N; j++) r(g, 0, j, N, 1, j < 8 ? "#2b1d3c" : j < 16 ? "#3c2440" : "#4a2a3c");
      r(g, 0, 12, 7, 20, "#1a1424"); r(g, 25, 9, 7, 23, "#1a1424"); r(g, 7, 17, 4, 15, "#221a2e");
      [[2, 14], [4, 18], [27, 12], [29, 16], [27, 20]].forEach(([x, y]) => r(g, x, y, 1, 2, "#e7b957"));
    },
    locker(g) {
      for (let i = 0; i < N; i++) r(g, i, 0, 1, N, i % 8 === 0 ? "#1a2230" : i % 8 < 4 ? "#2c394b" : "#273343");
      for (let i = 2; i < N; i += 8) { r(g, i, 6, 3, 1, "#1a2230"); r(g, i, 8, 3, 1, "#1a2230"); r(g, i + 4, 14, 1, 2, "#8b97a6"); }
    },
    title(g) {
      for (let j = 0; j < N; j++) r(g, 0, j, N, 1, j < 16 ? "#2a1e0c" : "#33240e");
      for (let j = 0; j < 24; j++) { const w = 6 + Math.floor(j * 0.7); r(g, 16 - w, j, w * 2, 1, j < 12 ? "#3a2a10" : "#45321a"); }
      r(g, 0, 26, N, 2, "#5a4214"); r(g, 14, 25, 4, 4, "#8d6421");
    },
    plain(g) { r(g, 0, 0, N, N, "#101b29"); },
  };

  /* ── roster ── */
  const RED = ["#c8372b", "#8f2219", "#ff8a78"], BLUE = ["#2f6fb3", "#1d4677", "#8cc4f2"], GOLD = ["#e0a93c", "#9c6d1c", "#ffe08a"],
    GREEN = ["#3f9e5a", "#256b3a", "#9be0a8"], BLACK = ["#2a2c33", "#121318", "#6a6f7c"], WHITE = ["#e9e4d6", "#b9b2a2", "#ffffff"],
    TEAL = ["#2a9d9a", "#196b69", "#8fe3df"], ORANGE = ["#e2702c", "#9e4614", "#ffb47a"], PURPLE = ["#7a55c8", "#4c3290", "#c3a9ff"];
  const TRIM = { red: RED, blue: BLUE, gold: GOLD, green: GREEN, black: BLACK };
  const gl = (t, cuff) => ({ glove: t[0], gloveS: t[1], gloveH: t[2], cuff: cuff || "#e9e4d6" });

  function fighter(o) {
    return (L, opt) => {
      const t = TRIM[opt.trim] || o.trim;
      body(L, Object.assign({ neck: "v" }, o, { top: o.top || t[1], topS: o.topS || "#0e1520" }));
      if (o.hg) headgear(L, Object.assign({}, o, { hg: t[0], hgS: t[1], hgH: t[2] })); else head(L, o);
      guard(L, Object.assign({}, o, gl(t, o.cuff)));
    };
  }

  const R = [];
  const add = (id, name, cat, tier, how, blurb, draw, extra) => R.push(Object.assign({ id, name, cat, tier, how, blurb, draw }, extra || {}));

  /* Fighters */
  add("rookie", "The Rookie", "fighters", "novice", "Starter", "First amateur bout. Headgear on, eyes up.",
    fighter({ skin: SKIN.b, hg: true, trim: BLUE, top: "#1d4677", topS: "#14304f", guardC: "#f3ead7" }), { starter: true, sig: BLUE[0] });
  add("southpaw", "The Southpaw", "fighters", "novice", "Starter", "Leads with the right. Hard to read, harder to catch.",
    fighter({ skin: SKIN.a, hair: "pony", hairC: "#4a2c1a", trim: GOLD, top: "#5a3d10", topS: "#3a2708", big: "L", mood: "fierce" }), { starter: true, sig: GOLD[0] });
  add("slugger", "The Slugger", "fighters", "novice", "Starter", "Walks forward. Has to learn when to stop walking.",
    fighter({ skin: SKIN.c, hair: "buzz", hairC: "#1a1410", trim: RED, top: "#8f2219", topS: "#5e160f", mood: "fierce", mouth: "guard", guardC: "#e9e4d6" }), { starter: true, sig: RED[0] });
  add("outboxer", "The Out-Boxer", "fighters", "club", "Finish 3 bouts", "Long jab, light feet, never stays in the pocket.",
    fighter({ skin: SKIN.d, hair: "puff", hairC: "#17110d", trim: GREEN, top: "#256b3a", topS: "#174628", big: "R" }), { sig: GREEN[0] });
  add("counter", "The Counterpuncher", "fighters", "club", "Win a 1v1 Arena round without taking a clean head shot", "Waits. Reads. Answers.",
    fighter({ skin: SKIN.b, hair: "short", hairC: "#2a1a10", headband: "#2a9d9a", trim: TEAL, top: "#196b69", topS: "#10494a", mood: "calm" }), { sig: TEAL[0] });
  add("swarmer", "The Swarmer", "fighters", "regional", "Land 50 body punches", "Pressure on the inside, all three rounds.",
    fighter({ skin: SKIN.a, hair: "mohawk", hairC: "#e2702c", trim: ORANGE, top: "#9e4614", topS: "#6a2e0c", mood: "fierce", mouth: "guard", guardC: "#ffb47a" }), { sig: ORANGE[0] });
  add("technician", "The Technician", "fighters", "regional", "Unlock 10 Medical Codex entries", "Every punch has a reason. So does every rest.",
    fighter({ skin: SKIN.c, hair: "bun", hairC: "#1a1410", trim: WHITE, top: "#3a4658", topS: "#262f3c", cuff: "#c8372b" }), { sig: "#d9d2c2" });
  add("veteran", "The Veteran", "fighters", "national", "Retire a fighter healthy", "Twenty years in. Still knows his name, still knows yours.",
    fighter({ skin: SKIN.b, hair: "bald", beard: "#b9bcc2", brow: "#b9bcc2", trim: BLACK, top: "#1c1e24", topS: "#101115", cuff: "#e0a93c", mood: "calm" }), { sig: "#b9bcc2" });

  /* Corner crew */
  add("coach", "Head Coach", "crew", "novice", "Yours from the start — you are the corner", "Cap, whistle, towel, and the last word.", (L) => {
    const s = SKIN.c;
    body(L, { skin: s, top: "#22364f", topS: "#17263a", neck: "collar", collar: "#e9e4d6", bodyExtra: (g) => {
      r(g, 21, 23, 5, 9, "#ece6d6"); r(g, 21, 27, 5, 1, "#c8372b"); r(g, 25, 23, 1, 9, "#c9c2b0");
      p(g, 13, 26, "#c9ced6"); p(g, 12, 27, "#c9ced6"); r(g, 11, 28, 3, 2, "#c9ced6");
    } });
    head(L, { skin: s, hair: "short", hairC: "#1a1410", mood: "kind", mouth: "smile", hat: (g) => {
      e(g, 16, 11.4, 7, 5.6, "#2a3b52", (i, j) => j <= 10); r(g, 9, 10, 14, 2, "#17263a"); r(g, 15, 7, 2, 2, "#e8c272");
    } });
    for (const cx of [6.5, 25.5]) stamp(L, (g) => { e(g, cx, 23.6, 4.6, 5.2, "#1d1f24"); e(g, cx, 23.1, 2.2, 2.4, "#c8372b"); e(g, cx, 23.1, 1, 1.1, "#f3ead7"); r(g, Math.round(cx - 3), 28, 6, 2, "#1d1f24"); });
  }, { sig: "#c8372b" });
  add("cutman", "The Cutman", "crew", "club", "Use the corner between rounds 10 times", "Cold steel, cotton swabs, ninety seconds.", (L) => {
    const s = SKIN.a;
    body(L, { skin: s, top: "#1c1e24", topS: "#111216", neck: "v" });
    head(L, { skin: s, hair: "short", hairC: "#6b4a2c", mood: "calm", hat: (g) => {
      e(g, 16, 10.6, 7.1, 6, "#2f6fb3", (i, j) => j <= 10); r(g, 9, 9, 14, 3, "#1d4677"); e(g, 16, 4, 2, 1.6, "#e9e4d6");
    }, faceExtra: (g) => { p(g, 22, 9, "#f3ead7"); p(g, 23, 8, "#f3ead7"); p(g, 23, 10, "#e9e4d6"); } });
    stamp(L, (g) => { e(g, 6.5, 25, 3.4, 3.6, "#9ec9e8"); swap(g, "#9ec9e8", "#6f9fc4", (i, j) => j >= 26); });
    stamp(L, (g) => { r(g, 21, 20, 8, 4, "#c3ccd6"); r(g, 21, 20, 8, 1, "#eef2f6"); r(g, 24, 24, 2, 6, "#4a4f58"); e(g, 25, 27, 3, 3, "#9ec9e8"); });
  }, { sig: "#2f6fb3" });
  add("referee", "The Referee", "crew", "regional", "Finish the coach briefing", "Says stop once. Means it the first time.", (L) => {
    const s = SKIN.d;
    body(L, { skin: s, top: "#e9edf2", topS: "#c3cbd5", neck: "collar", collar: "#ffffff", bodyExtra: (g) => { r(g, 13, 23, 2, 3, "#121318"); r(g, 17, 23, 2, 3, "#121318"); r(g, 15, 24, 2, 1, "#121318"); } });
    head(L, { skin: s, hair: "short", hairC: "#17110d", mood: "fierce", brow: "#17110d", faceExtra: (g) => { r(g, 10, 11, 1, 3, "#8a8f98"); r(g, 21, 11, 1, 3, "#8a8f98"); } });
    stamp(L, (g) => { r(g, 23, 25, 6, 7, "#e9edf2"); e(g, 26, 20.5, 3.3, 3.8, s[0]); r(g, 23, 15, 1, 4, s[0]); r(g, 25, 14, 1, 4, s[0]); r(g, 27, 14, 1, 4, s[0]); r(g, 29, 16, 1, 4, s[0]); swap(g, s[0], s[1], (i) => i >= 28); });
  }, { sig: "#e9edf2" });
  add("doctor", "Ringside Doctor", "crew", "national", "Call a medical stoppage", "Penlight, two questions, one answer: not tonight.", (L) => {
    const s = SKIN.a;
    body(L, { skin: s, top: "#e9edf2", topS: "#c3cbd5", neck: "v", bodyExtra: (g) => {
      r(g, 12, 24, 2, 6, "#c3cbd5"); r(g, 18, 24, 2, 6, "#c3cbd5");
      [[12, 22], [11, 23], [11, 24], [11, 25], [11, 26], [12, 27]].forEach(([x, y]) => p(g, x, y, "#2d3640"));
      [[19, 22], [20, 23], [20, 24], [21, 25], [21, 26]].forEach(([x, y]) => p(g, x, y, "#2d3640"));
      r(g, 20, 27, 3, 2, "#c9ced6");
    } });
    head(L, { skin: s, hair: "bun", hairC: "#3a2416", mood: "kind", glasses: "#26303d", mouth: "smile" });
    stamp(L, (g) => { r(g, 25, 17, 1, 7, "#d8dde3"); p(g, 25, 16, "#ffe58a"); e(g, 25.5, 25.5, 3, 3.2, s[0]); swap(g, s[0], s[1], (i, j) => j >= 27); r(g, 23, 28, 6, 4, "#e9edf2"); });
  }, { sig: "#78bdd1" });
  add("announcer", "Ring Announcer", "crew", "club", "Play on 3 different days", "Knows every name on the card — including yours.", (L) => {
    const s = SKIN.b;
    body(L, { skin: s, top: "#15181e", topS: "#0b0d11", neck: "v", bodyExtra: (g) => { r(g, 14, 24, 4, 3, "#f3ead7"); r(g, 14, 24, 1, 1, "#e0a93c"); r(g, 17, 24, 1, 1, "#e0a93c"); r(g, 15, 24, 2, 1, "#9c6d1c"); } });
    head(L, { skin: s, hair: "slick", hairC: "#17110d", hairH: "#3a3f4a", mouth: "open" });
    stamp(L, (g) => { e(g, 7, 20, 2.2, 2.2, "#9aa3ad"); p(g, 6, 19, "#e3e8ee"); r(g, 6, 22, 2, 5, "#2a2e36"); e(g, 7, 26.5, 2.8, 2.6, s[0]); r(g, 4, 28, 6, 4, "#15181e"); });
  }, { sig: "#e0a93c" });
  add("timekeeper", "Timekeeper", "crew", "club", "Finish 10 full rounds", "Three minutes is three minutes.", (L) => {
    const s = SKIN.c;
    body(L, { skin: s, top: "#3a4658", topS: "#262f3c", neck: "collar", collar: "#e9e4d6" });
    head(L, { skin: s, hair: "buzz", hairC: "#b9bcc2", mood: "calm", hat: (g) => { r(g, 9, 9, 14, 2, "#2f8f6a"); r(g, 8, 11, 16, 1, "#7fd1ae"); } });
    stamp(L, (g) => { r(g, 24, 18, 2, 2, "#9aa3ad"); e(g, 25, 23.5, 4, 4, "#cfd6de"); e(g, 25, 23.8, 2.9, 2.9, "#f3ead7"); r(g, 25, 21, 1, 3, PUP); r(g, 25, 23, 2, 1, PUP); e(g, 25, 29, 3, 2.6, s[0]); });
  }, { sig: "#2f8f6a" });

  /* Weight-class mascots */
  add("fly", "Flyweight", "mascots", "club", "Last a full 60-second Street Fight", "Tiny gloves. Never stops moving.", (L, opt) => {
    const t = TRIM[opt.trim] || RED;
    stamp(L, (g) => { e(g, 5, 12, 4.2, 6.4, "#bfe3f2"); e(g, 27, 12, 4.2, 6.4, "#bfe3f2"); r(g, 5, 9, 1, 7, "#8fb9cc"); r(g, 26, 9, 1, 7, "#8fb9cc"); });
    stamp(L, (g) => { e(g, 16, 33, 11, 9, "#2d4a3e"); swap(g, "#2d4a3e", "#1e3329", (i) => i >= 21); r(g, 12, 25, 8, 1, "#4a7a63"); r(g, 12, 28, 8, 1, "#4a7a63"); });
    stamp(L, (g) => {
      r(g, 12, 4, 1, 5, "#2a3036"); r(g, 19, 4, 1, 5, "#2a3036"); p(g, 11, 3, "#2a3036"); p(g, 20, 3, "#2a3036");
      e(g, 16, 14.5, 6.6, 6.4, "#2a3036");
      e(g, 11.6, 13, 3.6, 4, "#c0392b"); e(g, 20.4, 13, 3.6, 4, "#c0392b");
      swap(g, "#c0392b", "#8f2219", (i, j) => j >= 14 && (i % 2 === j % 2));
      p(g, 10, 11, "#ffd2c8"); p(g, 19, 11, "#ffd2c8"); r(g, 15, 18, 2, 3, "#121518");
    });
    stamp(L, (g) => glove(g, 7.5, 24, 3.2, 3.6, t[0], t[1], t[2], "#e9e4d6", 1));
    stamp(L, (g) => glove(g, 24.5, 24, 3.2, 3.6, t[0], t[1], t[2], "#e9e4d6", -1));
  }, { sig: "#c0392b" });
  add("bantam", "Bantamweight", "mascots", "club", "Win your first bout on points", "Loud at dawn, louder at the bell.", (L, opt) => {
    const t = TRIM[opt.trim] || BLUE;
    stamp(L, (g) => { e(g, 16, 33, 12.5, 9.5, "#c4652a"); swap(g, "#c4652a", "#8e4419", (i, j) => i >= 22 || (j % 3 === 0 && i % 4 === 1)); });
    stamp(L, (g) => {
      e(g, 13.8, 6.6, 1.9, 2.3, "#d63a2a"); e(g, 16.4, 5.4, 1.9, 2.6, "#d63a2a"); e(g, 19, 6.8, 1.7, 2.1, "#d63a2a");
      e(g, 16, 14.8, 6.2, 7.2, "#f2efe6"); swap(g, "#f2efe6", "#cfc9b8", (i, j) => i >= 20 || j >= 20);
      r(g, 12, 12, 2, 2, EYE); r(g, 18, 12, 2, 2, EYE); p(g, 13, 13, PUP); p(g, 18, 13, PUP); p(g, 12, 11, "#8a3a1a"); p(g, 19, 11, "#8a3a1a");
      r(g, 14, 15, 4, 2, "#e8a33a"); r(g, 15, 17, 2, 1, "#c27c1c"); e(g, 16, 19.6, 1.6, 2, "#d63a2a");
    });
    stamp(L, (g) => glove(g, 6.5, 23.6, 4.4, 5, t[0], t[1], t[2], "#e9e4d6", 1));
    stamp(L, (g) => glove(g, 25.5, 23.6, 4.4, 5, t[0], t[1], t[2], "#e9e4d6", -1));
  }, { sig: "#d63a2a" });
  add("roo", "Middleweight", "mascots", "regional", "Reach level 10 on coaching XP", "All legs, all patience.", (L, opt) => {
    const t = TRIM[opt.trim] || RED, c = "#c48a4f";
    stamp(L, (g) => { e(g, 16, 33, 12.5, 9.5, c); e(g, 16, 33, 6, 7, "#e3bb88"); swap(g, c, "#a06d3a", (i) => i >= 22); });
    stamp(L, (g) => {
      e(g, 11, 6.5, 2.1, 4.8, c); e(g, 21, 6.5, 2.1, 4.8, c); e(g, 11, 7, 0.9, 3.2, "#e9a99a"); e(g, 21, 7, 0.9, 3.2, "#e9a99a");
      e(g, 16, 15, 6.2, 6.6, c); swap(g, c, "#a06d3a", (i, j) => i >= 20);
      e(g, 16, 18.6, 3.6, 2.8, "#e3bb88"); r(g, 15, 17, 2, 1, "#2a1d16"); r(g, 15, 20, 2, 1, "#7a4a30");
      r(g, 12, 13, 2, 2, EYE); r(g, 18, 13, 2, 2, EYE); r(g, 13, 13, 1, 2, PUP); r(g, 18, 13, 1, 2, PUP);
    });
    stamp(L, (g) => glove(g, 6.5, 23.6, 4.4, 5, t[0], t[1], t[2], "#e9e4d6", 1));
    stamp(L, (g) => glove(g, 25.5, 23.6, 4.4, 5, t[0], t[1], t[2], "#e9e4d6", -1));
  }, { sig: "#c48a4f" });
  add("bear", "Heavyweight", "mascots", "national", "Win the Missions title on points", "Slow to start. Impossible to move.", (L, opt) => {
    const t = TRIM[opt.trim] || BLACK, c = "#6b4528";
    stamp(L, (g) => { e(g, 16, 34, 14.5, 10.5, c); swap(g, c, "#4c2f1a", (i) => i >= 23); });
    stamp(L, (g) => {
      e(g, 9.6, 8.4, 2.4, 2.4, c); e(g, 22.4, 8.4, 2.4, 2.4, c); e(g, 9.6, 8.6, 1.1, 1.1, "#a26a40"); e(g, 22.4, 8.6, 1.1, 1.1, "#a26a40");
      e(g, 16, 15, 7.2, 7, c); swap(g, c, "#4c2f1a", (i, j) => i >= 21);
      e(g, 16, 18, 3.8, 2.9, "#c49a6c"); r(g, 15, 16, 2, 2, "#1a120c"); r(g, 15, 19, 2, 1, "#6b3a22");
      p(g, 12, 13, PUP); p(g, 19, 13, PUP); p(g, 12, 12, "#2d1c10"); p(g, 19, 12, "#2d1c10");
    });
    stamp(L, (g) => glove(g, 6, 24, 5, 5.6, t[0], t[1], t[2], "#e0a93c", 1));
    stamp(L, (g) => glove(g, 26, 24, 5, 5.6, t[0], t[1], t[2], "#e0a93c", -1));
  }, { sig: "#6b4528" });
  add("shell", "The Shell", "mascots", "regional", "Block 100 punches in the 1v1 Arena", "High guard, older than the gym.", (L, opt) => {
    const t = TRIM[opt.trim] || GREEN;
    stamp(L, (g) => {
      e(g, 16, 34, 15, 11, "#5a4018");
      [[16, 28, 4.2, 3.4], [7.5, 30, 3.6, 3.2], [24.5, 30, 3.6, 3.2], [11, 24.6, 3, 1.8], [21, 24.6, 3, 1.8], [2.5, 26, 2.2, 2.4], [29.5, 26, 2.2, 2.4]]
        .forEach(([x, y, a, b]) => e(g, x, y, a, b, "#8a6a32"));
      swap(g, "#8a6a32", "#a8884a", (i, j) => j <= 25 || (j <= 27 && i % 5 === 1));
    });
    stamp(L, (g) => {
      e(g, 16, 15.5, 5.4, 6.8, "#6fa04a"); swap(g, "#6fa04a", "#4f7a32", (i, j) => i >= 19 || j >= 20);
      r(g, 13, 14, 2, 1, "#3e6226"); r(g, 18, 14, 2, 1, "#3e6226");
      r(g, 13, 15, 2, 1, EYE); r(g, 18, 15, 2, 1, EYE); p(g, 14, 15, PUP); p(g, 18, 15, PUP);
      r(g, 14, 19, 4, 1, "#3e6226"); p(g, 13, 10, "#9cc878"); p(g, 14, 10, "#9cc878");
    });
    stamp(L, (g) => glove(g, 6.6, 16.5, 3.9, 4.7, t[0], t[1], t[2], "#e9e4d6", 1));
    stamp(L, (g) => glove(g, 25.4, 16.5, 3.9, 4.7, t[0], t[1], t[2], "#e9e4d6", -1));
  }, { sig: "#6fa04a" });

  /* Gear buddies */
  add("mitt", "Mitt", "gear", "novice", "Finish your first bout", "A glove with opinions.", (L, opt) => {
    const t = TRIM[opt.trim] || RED;
    stamp(L, (g) => {
      e(g, 16, 14.5, 9.4, 10.2, t[0]); e(g, 24, 17.5, 3.4, 4.6, t[0]);
      swap(g, t[0], t[1], (i, j) => (i - 16) * 0.5 + (j - 14) > 7);
      e(g, 12, 8.5, 3, 2.2, t[2]); r(g, 21, 15, 1, 5, t[1]);
      r(g, 9, 24, 14, 8, "#ece6d6"); for (let j = 25; j < 31; j += 2) { p(g, 14, j, "#9c958a"); p(g, 17, j, "#9c958a"); p(g, 15, j + 1, "#9c958a"); p(g, 16, j + 1, "#9c958a"); }
      r(g, 11, 13, 3, 3, EYE); r(g, 17, 13, 3, 3, EYE); r(g, 13, 14, 1, 2, PUP); r(g, 17, 14, 1, 2, PUP);
      r(g, 13, 18, 6, 1, t[1]); p(g, 12, 17, t[1]); p(g, 19, 17, t[1]);
    });
  }, { sig: RED[0] });
  add("bag", "Big Bag", "gear", "club", "Finish 5 training sets in the Gym", "Takes everything. Says nothing. Mostly.", (L) => {
    stamp(L, (g) => {
      r(g, 15, 0, 2, 4, "#9aa3ad");
      e(g, 16, 6, 7, 3, "#5a3a24"); r(g, 9, 6, 14, 22, "#5a3a24"); e(g, 16, 28, 7, 3, "#5a3a24");
      swap(g, "#5a3a24", "#3f2817", (i) => i >= 20); r(g, 11, 7, 2, 18, "#7a5234");
      r(g, 9, 9, 14, 1, "#2a1a10"); r(g, 9, 23, 14, 1, "#2a1a10");
      r(g, 12, 14, 2, 2, EYE); r(g, 18, 14, 2, 2, EYE); r(g, 13, 14, 1, 2, PUP); r(g, 18, 14, 1, 2, PUP);
      r(g, 15, 18, 2, 2, "#2a1a10");
    });
    stamp(L, (g) => glove(g, 5, 25, 3.6, 4, RED[0], RED[1], RED[2], "#e9e4d6", 1));
  }, { sig: "#5a3a24" });
  add("speedy", "Speedy", "gear", "club", "Hit the speed bag 200 times in training", "Rat-a-tat-tat, all day.", (L) => {
    stamp(L, (g) => { r(g, 3, 1, 26, 3, "#5a4632"); r(g, 3, 1, 26, 1, "#7a6248"); r(g, 15, 4, 2, 2, "#9aa3ad"); });
    stamp(L, (g) => {
      e(g, 16, 10, 4.2, 4.2, "#b8452e"); e(g, 16, 18, 7, 8.6, "#b8452e");
      swap(g, "#b8452e", "#7e2c1c", (i, j) => i >= 20); e(g, 12.5, 14, 1.6, 2.6, "#e07a5c");
      r(g, 12, 16, 2, 2, EYE); r(g, 18, 16, 2, 2, EYE); r(g, 13, 16, 1, 2, PUP); r(g, 18, 16, 1, 2, PUP);
      r(g, 14, 21, 4, 1, "#4a160c"); p(g, 13, 20, "#4a160c"); p(g, 18, 20, "#4a160c");
    });
  }, { sig: "#b8452e" });
  add("ding", "Ding", "gear", "regional", "Finish all 3 rounds of a 1v1 Arena bout", "Starts the round. Ends the round. Saves a few.", (L) => {
    stamp(L, (g) => { r(g, 4, 5, 24, 24, "#6b4a2c"); for (let j = 7; j < 29; j += 5) r(g, 4, j, 24, 1, "#563a21"); });
    stamp(L, (g) => {
      e(g, 16, 17, 8.4, 8.4, "#e0b04a"); swap(g, "#e0b04a", "#a87a22", (i, j) => (i - 16) + (j - 17) > 4); e(g, 12.5, 13, 2.4, 1.8, "#fff0b8");
      r(g, 12, 16, 2, 2, PUP); r(g, 18, 16, 2, 2, PUP); p(g, 12, 16, EYE); p(g, 18, 16, EYE);
      r(g, 14, 20, 4, 2, "#5a3a10");
    });
    stamp(L, (g) => { r(g, 24, 22, 7, 2, "#3a2a1a"); e(g, 29, 21.5, 2, 2.4, "#9aa3ad"); });
  }, { sig: "#e0b04a" });
  add("towel", "The Towel", "gear", "title", "Make your first corner stoppage", "The bravest thing in the corner. Throwing it in early saves careers.", (L) => {
    stamp(L, (g) => {
      for (let j = 5; j < 30; j++) {
        const a = 8 + Math.round(1.6 * Math.sin(j / 3.2)), b = 24 + Math.round(1.6 * Math.sin(j / 3.2 + 1.3));
        r(g, a, j, b - a, 1, "#f4efe3");
      }
      swap(g, "#f4efe3", "#d8d0bd", (i, j) => i >= 20 || (j > 26));
      for (let j = 8; j <= 9; j++) for (let i = 0; i < N; i++) if (g[j][i]) g[j][i] = "#c8372b";
      for (let j = 25; j <= 26; j++) for (let i = 0; i < N; i++) if (g[j][i]) g[j][i] = "#2f6fb3";
      r(g, 12, 14, 2, 3, PUP); r(g, 18, 14, 2, 3, PUP); p(g, 12, 14, EYE); p(g, 18, 14, EYE);
      r(g, 13, 20, 6, 1, "#7a6a50"); p(g, 12, 19, "#7a6a50"); p(g, 19, 19, "#7a6a50");
      p(g, 11, 18, "#f2b0a0"); p(g, 20, 18, "#f2b0a0");
    });
  }, { sig: "#e7b957", halo: true });

  const TIERS = {
    novice: { name: "Novice", c: "#8a9bb0" }, club: { name: "Club", c: "#6fc29a" }, regional: { name: "Regional", c: "#5aa9e6" },
    national: { name: "National", c: "#e66b56" }, title: { name: "Title", c: "#e7b957" },
  };
  const CATS = { fighters: "Fighters", crew: "Corner Crew", mascots: "Weight-Class Mascots", gear: "Gear Buddies" };

  function grid(id, opt) {
    opt = opt || {};
    const a = R.find((x) => x.id === id);
    const L = G();
    a.draw(L, opt);
    let F = L;
    if (a.halo && !opt.silhouette) F = ring(L, "#e7b957");
    if (opt.silhouette) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (F[j][i]) F[j][i] = F[j][i] === INK ? "#3a4c62" : "#0b1119";
    const B = G();
    if (opt.bg !== "none") (BG[opt.bg || "ring"] || BG.ring)(B);
    over(B, F);
    if (opt.locked) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (B[j][i] && !F[j][i]) B[j][i] = shade(B[j][i], 0.55);
    return B;
  }
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  function svg(id, size, opt) {
    const g = grid(id, opt);
    let out = "";
    /* Rows are painted top to bottom, runs left to right. A run reaches half a
       pixel into a filled neighbour below or to the right, and that neighbour
       is painted later on top. PDF viewers smooth every edge, so without the
       overlap each row boundary shows the page through as a faint line. */
    const below = (i, j) => j + 1 < N && !!g[j + 1][i];
    for (let j = 0; j < N; j++) {
      let i = 0;
      while (i < N) {
        const c = g[j][i], b = below(i, j);
        let k = i + 1;
        while (k < N && g[j][k] === c && below(k, j) === b) k++;
        if (c) {
          const w = k - i + (k < N && g[j][k] ? 0.5 : 0), h = b ? 1.5 : 1;
          out += `<rect x="${i}" y="${j}" width="${w}" height="${h}" fill="${c}"/>`;
        }
        i = k;
      }
    }
    const s = size || 96;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${s}" height="${s}" shape-rendering="crispEdges" class="pxav">${out}</svg>`;
  }
  window.ITIAV = { roster: R, tiers: TIERS, cats: CATS, svg, bgs: Object.keys(BG) };
})();
