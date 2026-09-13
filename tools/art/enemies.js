/* =============================================================================
   tools/art/enemies.js — corporate monsters + human opponents (bake time)
   -----------------------------------------------------------------------------
   Every battle sprite is 112x120, two frames (an idle breath cycle). The
   design rule for the abstract ones: the sprite has to tell the joke before
   you read the name. Scope Creep is literally built out of contracts and
   revision clouds; Reply-All Storm is a funnel of email windows; the Deadline
   Wraith is a ghost wearing a clock.

   Human opponents (executives, clients, the rival manager) share one "bust"
   builder so the suits all read as the same species of adversary.
   ========================================================================== */

globalThis.EW = 112;
globalThis.EH = 120;

const F = PAL;

/* --- shared pieces --------------------------------------------------------- */

function groundShadow(p, cx = 56, cy = 112, rx = 34) {
  p.ell(cx, cy, rx, 6, "rgba(0,0,0,0.28)");
}

// A sheet of paper with ruled lines — the atom most of these monsters are
// assembled from.
function sheet(p, x, y, w, h, opts = {}) {
  p.r(x, y, w, h, opts.color || F.paper);
  p.frame(x, y, w, h, opts.border || F.paperDim);
  const lines = opts.lines === undefined ? 3 : opts.lines;
  for (let i = 0; i < lines; i++) {
    const ly = y + 3 + i * 4;
    if (ly < y + h - 2) p.hr(x + 2, ly, Math.max(2, w - 4 - i * 2), opts.ink || F.steelLt);
  }
  if (opts.stamp) p.r(x + w - 8, y + 2, 6, 4, F.red);
}

function stickyNote(p, x, y, col) {
  p.r(x, y, 10, 10, col);
  p.r(x, y, 10, 2, shade(col, 1.12));
  p.hr(x + 2, y + 4, 6, shade(col, 0.6));
  p.hr(x + 2, y + 6, 4, shade(col, 0.6));
}

// The revision cloud — a scalloped outline. The single most recognizable
// mark on a marked-up drawing.
function revCloud(p, x, y, w, h, col) {
  const r = 3;
  for (let i = 0; i < w; i += r * 2) {
    p.ell(x + i + r, y, r, r, col);
    p.ell(x + i + r, y + h, r, r, col);
  }
  for (let i = 0; i < h; i += r * 2) {
    p.ell(x, y + i + r, r, r, col);
    p.ell(x + w, y + i + r, r, r, col);
  }
}

function eye(p, x, y, opts = {}) {
  const w = opts.w || 8;
  const h = opts.h || 8;
  p.ell(x, y, w / 2, h / 2, opts.sclera || F.paper);
  p.ell(x + (opts.look || 0), y + 1, 2, 2, F.ink);
  if (opts.angry) {
    p.line(x - w / 2, y - h / 2 - 1, x + w / 2, y - 2, F.ink);
  }
}

/* --- abstract corporate monsters ------------------------------------------ */

const ENEMY_ART = {};

// SCOPE CREEP — a blob of accumulated "small asks". Every frame it has
// visibly grown another requirement.
ENEMY_ART.scope_creep = (p, f) => {
  groundShadow(p);
  const bob = f;
  // the mass: overlapping contracts smothering a core
  p.ell(56, 74 + bob, 40, 30, "#6f5a4a");
  p.ell(56, 70 + bob, 36, 26, "#8a7059");
  p.ell(44, 66 + bob, 16, 12, "#9c8168");
  // papers erupting out of it
  sheet(p, 12, 44 + bob, 24, 30, { stamp: true });
  sheet(p, 76, 40 + bob, 24, 32, { stamp: true });
  sheet(p, 30, 26 + bob, 26, 32, { lines: 4 });
  sheet(p, 58, 20 + bob, 26, 34, { lines: 4, stamp: true });
  // revision clouds over the new "requirements"
  revCloud(p, 34, 34 + bob, 18, 14, F.red);
  revCloud(p, 64, 30 + bob, 16, 12, F.red);
  // sticky notes: the small things
  stickyNote(p, 20, 70 + bob, F.hiVis);
  stickyNote(p, 84, 74 + bob, "#8fd08a");
  stickyNote(p, 48, 86 + bob, "#f2a0c0");
  stickyNote(p, 66, 92 + bob, F.hiVis);
  // eyes buried in the pile
  eye(p, 46, 78 + bob, { angry: true, look: -1 });
  eye(p, 66, 78 + bob, { angry: true, look: 1 });
  // grasping little hands made of paper
  p.r(8, 76 + bob, 10, 6, F.paper);
  p.r(94, 80 + bob, 10, 6, F.paper);
  p.autoOutline();
};

// REPLY-ALL STORM — a funnel cloud of mail windows and unread badges.
ENEMY_ART.reply_all = (p, f) => {
  groundShadow(p, 56, 112, 24);
  const sway = f * 2;
  // funnel — widest at the top, tapering to a point, so it reads as a
  // tornado rather than a stack of discs
  for (let i = 0; i < 14; i++) {
    const y = 100 - i * 7;
    const w = 6 + i * 3.4;
    const off = Math.sin((i + f * 2) * 0.55) * (3 + i * 0.5);
    p.ell(56 + off + sway, y, w / 2, 4, i % 2 ? "#3b556e" : "#4a6b8c");
  }
  for (let i = 0; i < 14; i++) {
    const y = 100 - i * 7;
    const w = 6 + i * 3.4;
    const off = Math.sin((i + f * 2) * 0.55) * (3 + i * 0.5);
    p.hr(Math.round(56 + off + sway - w / 2), y - 2, Math.max(2, Math.round(w * 0.4)), "#6d90b2");
  }
  // email windows caught in the swirl
  const windows = [
    [14, 24, 26, 18],
    [72, 34, 26, 18],
    [26, 56, 28, 20],
    [64, 70, 26, 18],
    [40, 86, 30, 20],
  ];
  windows.forEach(([x, y, w, h], i) => {
    const off = Math.sin((i + f) * 1.3) * 3;
    p.r(x + off, y, w, h, F.paper);
    p.r(x + off, y, w, 4, F.steel);
    p.frame(x + off, y, w, h, F.inkSoft);
    // envelope glyph
    p.frame(x + off + 3, y + 7, 10, 7, F.steelDk);
    p.line(x + off + 3, y + 7, x + off + 8, y + 11, F.steelDk);
    p.line(x + off + 13, y + 7, x + off + 8, y + 11, F.steelDk);
    p.hr(x + off + 16, y + 8, w - 19, F.paperDim);
    p.hr(x + off + 16, y + 11, w - 22, F.paperDim);
  });
  // unread badges — the actual threat
  [[10, 18], [96, 28], [22, 48], [92, 62], [34, 80]].forEach(([x, y], i) => {
    p.ell(x, y + Math.sin((i + f) * 1.7) * 2, 7, 7, F.red);
    p.r(x - 3, y - 2, 2, 4, F.paper);
    p.r(x, y - 2, 3, 1, F.paper);
    p.r(x, y + 1, 3, 1, F.paper);
  });
  // a phone being swallowed
  p.r(48, 96, 14, 22, F.inkSoft);
  p.r(50, 99, 10, 15, "#2b4a5a");
  p.r(51, 101, 8, 2, F.screenGlow);
  p.autoOutline();
};

// DEADLINE WRAITH — a ghost whose face is a clock, trailing calendar pages
// and burning milestones.
ENEMY_ART.deadline_wraith = (p, f) => {
  groundShadow(p, 56, 112, 22);
  const bob = f * 2;
  // robe
  p.ell(56, 52 + bob, 30, 34, "#4a4560");
  p.r(26, 52 + bob, 60, 40, "#4a4560");
  // ragged hem
  for (let i = 0; i < 7; i++) {
    const x = 26 + i * 9;
    p.ell(x + 4, 92 + bob, 5, 6 + (i % 3) * 3, "#3d3950");
  }
  p.r(26, 52 + bob, 12, 40, "#565072");
  // hood
  p.ell(56, 44 + bob, 26, 26, "#565072");
  p.ell(56, 46 + bob, 20, 20, "#1d1b28");
  // clock face inside the hood
  p.ell(56, 46 + bob, 15, 15, F.paper);
  p.ell(56, 46 + bob, 13, 13, "#e6e2d8");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    p.px(Math.round(56 + Math.cos(a) * 11), Math.round(46 + bob + Math.sin(a) * 11), F.inkSoft);
  }
  // hands at 11:58 — always nearly out of time
  p.line(56, 46 + bob, 56 - 2, 46 + bob - 9, F.ink);
  p.line(56, 46 + bob, 56 + 8, 46 + bob - 4, F.red);
  p.ell(56, 46 + bob, 2, 2, F.ink);
  // burning calendar pages trailing behind
  [[12, 62], [92, 56], [18, 88], [88, 84]].forEach(([x, y], i) => {
    const yy = y + Math.sin((i + f) * 1.4) * 3;
    p.r(x, yy, 16, 18, F.paper);
    p.r(x, yy, 16, 5, F.red);
    p.hr(x + 2, yy + 9, 12, F.steelLt);
    p.hr(x + 2, yy + 13, 8, F.steelLt);
    // scorched corner
    p.ell(x + 14, yy + 17, 4, 4, F.orange);
    p.ell(x + 15, yy + 18, 2, 2, F.hiVis);
  });
  // red schedule bars for arms
  p.r(14, 66 + bob, 24, 6, F.red);
  p.r(74, 70 + bob, 24, 6, F.red);
  p.r(14, 66 + bob, 24, 2, "#e06a64");
  p.autoOutline();
};

// REDLINE BARRAGE — a wall of marked-up drawings, red pens loaded like darts.
ENEMY_ART.redline_barrage = (p, f) => {
  groundShadow(p, 56, 112, 32);
  const bob = f;
  // stacked drawing sheets, fanned
  [[8, 30, -0], [22, 22, 0], [40, 16, 0], [58, 22, 0], [74, 30, 0]].forEach(([x, y], i) => {
    const yy = y + bob + (i % 2);
    p.r(x, yy, 28, 62, F.paper);
    p.frame(x, yy, 28, 62, F.paperDim);
    for (let l = 0; l < 8; l++) p.hr(x + 3, yy + 6 + l * 6, 22 - (l % 3) * 4, F.steelLt);
    // title block
    p.frame(x + 3, yy + 50, 22, 9, F.steelDk);
    p.hr(x + 4, yy + 53, 20, F.steelLt);
    // the redlines themselves
    p.line(x + 4, yy + 12, x + 24, yy + 30, F.red);
    p.line(x + 24, yy + 12, x + 4, yy + 30, F.red);
    revCloud(p, x + 6, yy + 34, 14, 10, F.red);
    p.r(x + 3, yy + 2, 10, 4, F.red);
  });
  // red pens hovering, nib-down
  [[16, 8], [50, 4], [86, 10]].forEach(([x, y], i) => {
    const yy = y + Math.sin((i + f) * 1.6) * 2;
    p.r(x, yy, 6, 16, F.red);
    p.r(x, yy, 6, 4, "#8e2f2b");
    p.r(x + 1, yy + 16, 4, 4, F.inkSoft);
    p.px(x + 2, yy + 20, F.red);
  });
  p.autoOutline();
};

// SCHEDULE SLIP — a Gantt chart that has physically come apart, bars sliding
// off the right edge into the future.
ENEMY_ART.schedule_slip = (p, f) => {
  groundShadow(p, 56, 112, 34);
  const slide = f * 3;
  // chart board
  p.r(10, 18, 92, 82, "#2f3640");
  p.frame(10, 18, 92, 82, F.metalDk);
  p.r(10, 18, 92, 8, F.inkSoft);
  for (let i = 0; i < 5; i++) p.hr(12, 30 + i * 14, 88, "#3d4550");
  // task bars — the lower ones have slipped right and turned red
  const bars = [
    [16, 32, 44, F.steel, 0],
    [22, 46, 38, F.steel, 0],
    [30, 60, 42, F.amber, slide],
    [44, 74, 44, F.red, slide * 2],
    [58, 88, 40, F.red, slide * 3],
  ];
  bars.forEach(([x, y, w, col, off]) => {
    p.r(x + off, y, w, 8, col);
    p.r(x + off, y, w, 2, shade(col, 1.2));
    p.r(x + off + w - 3, y, 3, 8, shade(col, 0.7));
  });
  // the critical-path line, snapped
  p.line(16, 36, 60, 64, F.paper);
  p.line(64, 70, 96, 96, F.red);
  p.r(60, 62, 5, 5, F.red);
  // cracked glass over the whole thing
  p.line(30, 18, 52, 56, "rgba(255,255,255,0.5)");
  p.line(52, 56, 40, 100, "rgba(255,255,255,0.35)");
  p.line(52, 56, 86, 74, "rgba(255,255,255,0.35)");
  // eyes in the chart
  eye(p, 34, 26, { w: 6, h: 6, angry: true });
  eye(p, 78, 26, { w: 6, h: 6, angry: true });
  p.autoOutline();
};

/* --- human opponents ------------------------------------------------------- */

// One bust builder for every suited adversary: shoulders, head, hair, and a
// prop that says which kind of executive this is.
function bust(p, f, opts) {
  groundShadow(p, 56, 112, 32);
  const bob = f;
  const suit = opts.suit || "#2f3440";
  const suitSh = shade(suit, 0.78);
  const skin = opts.skin || SKIN[1];
  const hair = opts.hair || HAIR[0];

  // shoulders
  p.r(16, 64 + bob, 80, 48, suit);
  p.ell(56, 66 + bob, 40, 14, suit);
  p.r(76, 64 + bob, 20, 48, suitSh);
  // lapels + shirt
  p.r(44, 64 + bob, 24, 48, opts.shirt || F.paper);
  p.line(44, 64 + bob, 34, 100 + bob, suitSh);
  p.line(68, 64 + bob, 78, 100 + bob, suitSh);
  p.r(38, 64 + bob, 12, 40, suit);
  p.r(62, 64 + bob, 12, 40, suitSh);
  if (opts.tie) {
    p.r(52, 66 + bob, 8, 6, opts.tie);
    p.r(51, 72 + bob, 10, 30, opts.tie);
    p.r(51, 72 + bob, 10, 2, shade(opts.tie, 1.2));
  }
  // neck + head
  p.r(48, 52 + bob, 16, 14, skin.sh);
  p.ell(56, 38 + bob, 19, 22, skin.base);
  p.ell(64, 38 + bob, 11, 20, skin.sh);
  // features
  eye(p, 49, 36 + bob, { w: 7, h: 6, angry: opts.stern });
  eye(p, 63, 36 + bob, { w: 7, h: 6, angry: opts.stern });
  p.r(54, 42 + bob, 4, 4, skin.sh);
  p.hr(50, 50 + bob, 12, skin.line);
  if (opts.glasses) {
    p.frame(43, 32 + bob, 12, 10, F.inkSoft);
    p.frame(57, 32 + bob, 12, 10, F.inkSoft);
    p.hr(55, 36 + bob, 2, F.inkSoft);
    p.r(44, 33 + bob, 10, 8, "rgba(190,220,240,0.25)");
  }
  if (opts.beard) {
    p.ell(56, 48 + bob, 14, 8, hair.sh);
    p.hr(50, 50 + bob, 12, shade(hair.sh, 0.8));
  }
  // hair
  if (opts.hairStyle !== "bald") {
    p.ell(56, 22 + bob, 20, 12, hair.base);
    p.r(37, 22 + bob, 38, 8, hair.base);
    p.r(37, 22 + bob, 10, 14, hair.sh);
    if (opts.hairStyle === "long") {
      p.r(34, 26 + bob, 8, 30, hair.base);
      p.r(70, 26 + bob, 8, 30, hair.sh);
    }
  } else {
    p.ell(56, 24 + bob, 18, 9, skin.base);
    p.ell(56, 22 + bob, 14, 6, shade(skin.base, 1.05));
  }
  if (opts.hardhat) {
    p.ell(56, 22 + bob, 21, 14, opts.hardhat);
    p.r(32, 26 + bob, 48, 4, opts.hardhat);
    p.r(32, 28 + bob, 48, 2, shade(opts.hardhat, 0.75));
    p.r(53, 10 + bob, 6, 14, shade(opts.hardhat, 1.1));
  }
  if (opts.badge) {
    p.r(30, 78 + bob, 14, 10, F.paper);
    p.hr(32, 82 + bob, 10, F.steel);
    p.hr(32, 85 + bob, 7, F.steelLt);
  }
  if (opts.prop) opts.prop(p, bob);
  p.autoOutline();
}

ENEMY_ART.rival_review = (p, f) =>
  bust(p, f, {
    suit: "#5a4a6b",
    tie: null,
    shirt: "#e8e2ee",
    hair: HAIR[1],
    hairStyle: "long",
    skin: SKIN[2],
    stern: true,
    prop: (p, bob) => {
      // a tablet held up like a scorecard
      p.r(76, 82 + bob, 26, 22, F.inkSoft);
      p.r(79, 85 + bob, 20, 16, "#2b4a5a");
      p.r(81, 88 + bob, 6, 10, F.steelLt);
      p.r(89, 92 + bob, 6, 6, F.hiVis);
    },
  });

ENEMY_ART.reginald_review = (p, f) =>
  bust(p, f, {
    suit: "#3a3f4a",
    tie: F.red,
    hair: HAIR[5],
    skin: SKIN[1],
    stern: true,
    glasses: true,
    prop: (p, bob) => {
      // the performance review folder
      p.r(4, 74 + bob, 30, 36, "#8a6b3a");
      p.r(6, 76 + bob, 26, 32, F.paper);
      for (let i = 0; i < 5; i++) p.hr(9, 80 + i * 5 + bob, 20 - i * 2, F.steelLt);
      p.r(22, 96 + bob, 10, 8, F.red);
    },
  });

ENEMY_ART.coo_showdown = (p, f) =>
  bust(p, f, {
    suit: "#2a2d4a",
    tie: "#8fb0cd",
    hair: HAIR[0],
    skin: SKIN[1],
    stern: true,
    prop: (p, bob) => {
      // a reorg chart, boxes already being redrawn
      p.r(2, 66 + bob, 34, 42, "#1d2330");
      p.frame(2, 66 + bob, 34, 42, F.steelDk);
      [[8, 70], [4, 84], [20, 84], [12, 98]].forEach(([x, y]) => {
        p.r(x, y + bob, 12, 8, F.steel);
        p.frame(x, y + bob, 12, 8, F.steelLt);
      });
      p.line(14, 78 + bob, 14, 84 + bob, F.steelLt);
      p.line(10, 84 + bob, 26, 84 + bob, F.steelLt);
      p.line(18, 92 + bob, 18, 98 + bob, F.red);
    },
  });

ENEMY_ART.cfo_showdown = (p, f) =>
  bust(p, f, {
    suit: "#4a2a3a",
    shirt: "#f2eef0",
    hair: HAIR[4],
    hairStyle: "long",
    skin: SKIN[0],
    stern: true,
    glasses: true,
    prop: (p, bob) => {
      // a ledger with one line item circled in red
      p.r(76, 70 + bob, 34, 40, F.paper);
      p.frame(76, 70 + bob, 34, 40, F.paperDim);
      for (let i = 0; i < 7; i++) {
        p.hr(79, 74 + i * 5 + bob, 28, F.steelLt);
        p.r(100, 74 + i * 5 + bob, 6, 1, F.inkSoft);
      }
      p.frame(78, 88 + bob, 30, 7, F.red);
      p.r(96, 102 + bob, 12, 6, F.red);
    },
  });

ENEMY_ART.counsel_showdown = (p, f) =>
  bust(p, f, {
    suit: "#2e3a2a",
    tie: "#7a2e2e",
    hair: HAIR[1],
    skin: SKIN[3],
    stern: true,
    beard: true,
    prop: (p, bob) => {
      // a contract thicker than it has any right to be
      p.r(2, 72 + bob, 32, 38, F.paper);
      p.r(2, 72 + bob, 32, 4, F.paperDim);
      p.r(2, 76 + bob, 32, 4, "#e8e6e0");
      p.r(2, 80 + bob, 32, 30, F.paper);
      for (let i = 0; i < 6; i++) p.hr(5, 84 + i * 4 + bob, 26 - (i % 2) * 6, F.steelLt);
      p.r(6, 100 + bob, 14, 2, F.ink);
      p.ell(28, 104 + bob, 5, 5, F.red);
    },
  });

ENEMY_ART.board_review = (p, f) => {
  groundShadow(p, 56, 112, 44);
  const bob = f;
  // A row of silhouettes behind a long table — no faces, just the table and
  // five identical shapes. Scarier than any single face.
  p.r(0, 86 + bob, 112, 26, PAL.walnut);
  p.r(0, 86 + bob, 112, 4, shade(PAL.walnut, 1.3));
  p.r(0, 106 + bob, 112, 6, "#2b1d13");
  const seats = [8, 30, 52, 74, 96];
  seats.forEach((x, i) => {
    const h = i === 2 ? 0 : 4;
    p.ell(x, 44 + h + bob, 10, 11, "#14161c");
    p.r(x - 16, 56 + h + bob, 32, 32, "#1b1e26");
    p.ell(x, 58 + h + bob, 17, 8, "#1b1e26");
    // just enough shirt to read as a suit
    p.r(x - 4, 58 + h + bob, 8, 26, "#33384a");
    // eyes
    p.px(x - 4, 44 + h + bob, F.hiVis);
    p.px(x + 3, 44 + h + bob, F.hiVis);
  });
  // agenda papers + a single gavel-ish water glass
  p.r(40, 90 + bob, 20, 12, F.paper);
  p.hr(43, 94 + bob, 14, F.steelLt);
  p.hr(43, 97 + bob, 10, F.steelLt);
  p.r(86, 84 + bob, 8, 12, "rgba(200,225,240,0.5)");
  p.autoOutline();
};

/* --- clients --------------------------------------------------------------- */

const CLIENT_LOOKS = {
  chip_site_negotiation: { suit: "#8a7a56", hardhat: PAL.hatWhite, skin: SKIN[0], hair: HAIR[3] },
  ashgrove_negotiation: { suit: "#5a6a4a", hardhat: PAL.hatWhite, skin: SKIN[2], hair: HAIR[0], hairStyle: "long" },
  meridiangrid_negotiation: { suit: "#4a5a6b", hardhat: PAL.hiVis, skin: SKIN[1], hair: HAIR[5] },
  blackwater_negotiation: { suit: "#6b4a3a", hardhat: PAL.orange, skin: SKIN[3], hair: HAIR[0], hairStyle: "long" },
  route9_negotiation: { suit: "#7a6a4a", hardhat: PAL.orange, skin: SKIN[1], hair: HAIR[1], hairStyle: "long" },
  cedarfalls_negotiation: { suit: "#4a6b63", hardhat: PAL.hatWhite, skin: SKIN[2], hair: HAIR[2] },
};

Object.keys(CLIENT_LOOKS).forEach((id) => {
  const look = CLIENT_LOOKS[id];
  ENEMY_ART[id] = (p, f) =>
    bust(p, f, {
      ...look,
      shirt: PAL.paper,
      badge: true,
      stern: true,
      prop: (p, bob) => {
        // the change order, already signed by them and not by you
        p.r(78, 76 + bob, 32, 34, F.paper);
        p.frame(78, 76 + bob, 32, 34, F.paperDim);
        p.r(80, 78 + bob, 28, 5, F.steel);
        for (let i = 0; i < 4; i++) p.hr(81, 88 + i * 5 + bob, 24 - i * 3, F.steelLt);
        p.line(82, 104 + bob, 96, 100 + bob, F.ink);
        p.r(98, 78 + bob, 10, 7, F.red);
      },
    });
});

/* --- site hazards ---------------------------------------------------------- */

// Hazards read as *situations*, not creatures — a swinging load, an open
// edge, a leak. Each is built around the actual thing that hurts you, with
// a yellow-black hazard chevron band as the shared visual signature.
function hazardBand(p, y) {
  for (let x = 0; x < 112; x += 12) {
    p.r(x, y, 6, 8, F.hiVis);
    p.r(x + 6, y, 6, 8, F.ink);
  }
  p.hr(0, y, 112, F.hiVisDk);
  p.hr(0, y + 7, 112, F.hiVisDk);
}

ENEMY_ART.swinging_load = (p, f) => {
  groundShadow(p, 56 + f * 6, 112, 26);
  const sw = f * 8;
  // crane block and line
  p.r(48, 0, 16, 6, F.metalDk);
  p.line(56, 6, 56 + sw, 40, F.metal);
  p.line(57, 6, 57 + sw, 40, F.metalDk);
  // hook
  p.r(52 + sw, 40, 10, 8, F.metal);
  p.line(57 + sw, 48, 57 + sw, 56, F.metalDk);
  // the load: a bundle of steel
  p.r(28 + sw, 56, 58, 26, F.pipe);
  for (let i = 0; i < 4; i++) p.hr(30 + sw, 60 + i * 6, 54, F.pipeDk);
  p.r(28 + sw, 56, 58, 3, "#b4bcc4");
  p.r(40 + sw, 54, 6, 30, F.hiVis);
  p.r(68 + sw, 54, 6, 30, F.hiVis);
  hazardBand(p, 100);
  p.autoOutline();
};

ENEMY_ART.uncovered_rebar = (p, f) => {
  groundShadow(p, 56, 112, 34);
  // a forest of vertical bars, uncapped
  for (let i = 0; i < 9; i++) {
    const x = 8 + i * 12;
    const h = 44 + ((i * 7) % 26) + f;
    p.r(x, 100 - h, 5, h, F.rust);
    p.r(x, 100 - h, 2, h, "#a75f38");
    // deformations
    for (let y = 100 - h; y < 100; y += 5) p.hr(x, y, 5, "#6e3a20");
    // sharpened tip
    p.r(x + 1, 100 - h - 3, 3, 3, "#c07a4a");
  }
  p.r(0, 96, 112, 16, F.concrete);
  p.noise(0, 96, 112, 16, F.concreteDk, 60, 3);
  hazardBand(p, 88);
  p.autoOutline();
};

ENEMY_ART.missing_guardrail = (p, f) => {
  groundShadow(p, 56, 112, 32);
  // deck edge with the middle post conspicuously gone
  p.r(0, 78, 112, 34, F.concrete);
  p.noise(0, 78, 112, 34, F.concreteDk, 70, 7);
  p.r(0, 78, 112, 3, "#bab8b0");
  const posts = [6, 26, 86, 106];
  posts.forEach((x) => {
    p.r(x, 30, 6, 48, F.hiVis);
    p.r(x, 30, 2, 48, F.hiVisDk);
  });
  p.r(6, 34, 26, 5, F.hiVis);
  p.r(86, 34, 26, 5, F.hiVis);
  p.r(6, 56, 26, 5, F.hiVis);
  p.r(86, 56, 26, 5, F.hiVis);
  // the gap — a dangling loose rail and a long drop
  p.r(36, 40 + f * 2, 26, 5, F.hiVisDk);
  p.r(40, 78, 44, 34, "#1b1e24");
  for (let i = 0; i < 5; i++) p.hr(42 + i * 2, 84 + i * 6, 40 - i * 6, "#272b33");
  hazardBand(p, 18);
  p.autoOutline();
};

ENEMY_ART.heat_stress = (p, f) => {
  groundShadow(p, 56, 112, 26);
  // a punishing sun over shimmering air
  p.ell(56, 30, 22 + f, 22 + f, "#f2c53d");
  p.ell(56, 30, 17, 17, "#f7dc7a");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x0 = 56 + Math.cos(a) * 26;
    const y0 = 30 + Math.sin(a) * 26;
    const x1 = 56 + Math.cos(a) * (34 + f * 2);
    const y1 = 30 + Math.sin(a) * (34 + f * 2);
    p.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), "#e8a91a");
  }
  // heat shimmer
  for (let i = 0; i < 4; i++) {
    const y = 72 + i * 8;
    for (let x = 4; x < 108; x += 8) {
      p.hr(x + ((i + f) % 2) * 4, y, 5, "rgba(242,197,61,0.45)");
    }
  }
  // thermometer, well past the red line
  p.r(88, 54, 10, 44, F.paper);
  p.frame(88, 54, 10, 44, F.paperDim);
  p.r(91, 58, 4, 36, F.red);
  p.ell(93, 98, 7, 7, F.red);
  for (let i = 0; i < 6; i++) p.hr(88, 62 + i * 6, 4, F.inkSoft);
  p.autoOutline();
};

ENEMY_ART.allergen_crosscontact = (p, f) => {
  groundShadow(p, 56, 112, 30);
  // a stainless line with the wrong thing on it
  p.r(8, 60, 96, 34, F.metalLt);
  p.r(8, 60, 96, 4, "#d0d5da");
  p.r(8, 90, 96, 4, F.metalDk);
  for (let i = 0; i < 5; i++) p.vr(20 + i * 18, 64, 26, F.metal);
  // product totes, one flagged
  [[16, 42], [44, 42], [72, 42]].forEach(([x, y], i) => {
    p.r(x, y, 24, 20, i === 1 ? "#c2453f" : "#8fb08a");
    p.r(x, y, 24, 3, "rgba(255,255,255,0.4)");
    p.frame(x, y, 24, 20, F.inkSoft);
    p.r(x + 4, y + 6, 16, 8, F.paper);
    if (i === 1) {
      p.r(x + 6, y + 8, 12, 4, F.red);
    } else {
      p.hr(x + 6, y + 9, 12, F.steelLt);
    }
  });
  // airborne particulate drifting off the flagged tote
  [[50, 26], [62, 18], [40, 14], [70, 30]].forEach(([x, y], i) => {
    p.ell(x + ((i + f) % 2) * 3, y, 4, 3, "rgba(194,69,63,0.55)");
  });
  hazardBand(p, 98);
  p.autoOutline();
};

ENEMY_ART.energized_conductor = (p, f) => {
  groundShadow(p, 56, 112, 28);
  // a live bus with an arc jumping the gap
  p.r(6, 22, 14, 84, F.metal);
  p.r(92, 22, 14, 84, F.metal);
  p.r(6, 22, 4, 84, F.metalLt);
  p.r(92, 22, 4, 84, F.metalLt);
  // insulators
  for (let i = 0; i < 4; i++) {
    p.ell(13, 34 + i * 9, 9, 4, "#8a6b5a");
    p.ell(99, 34 + i * 9, 9, 4, "#8a6b5a");
  }
  // conductor ends
  p.r(20, 58, 20, 8, F.rust);
  p.r(72, 58, 20, 8, F.rust);
  // the arc
  const path = f === 0 ? [[40, 62], [48, 52], [56, 66], [64, 54], [72, 62]] : [[40, 62], [47, 70], [56, 56], [66, 70], [72, 62]];
  for (let i = 0; i < path.length - 1; i++) {
    p.line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], "#e8f4ff");
    p.line(path[i][0], path[i][1] + 1, path[i + 1][0], path[i + 1][1] + 1, "#7fd3e8");
  }
  p.ell(56, 62, 10, 10, "rgba(127,211,232,0.35)");
  // sparks
  [[44, 78], [68, 80], [56, 84]].forEach(([x, y], i) => p.px(x, y + ((i + f) % 3), F.hiVis));
  hazardBand(p, 104);
  p.autoOutline();
};

ENEMY_ART.confined_space_alarm = (p, f) => {
  groundShadow(p, 56, 112, 30);
  // an open vessel manway with a gas monitor screaming
  p.r(14, 40, 84, 72, "#6e757e");
  p.ell(56, 40, 42, 12, "#7d848d");
  p.ell(56, 40, 34, 9, "#22262c");
  p.ell(56, 41, 30, 7, "#15181c");
  // bolts round the manway
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    p.px(Math.round(56 + Math.cos(a) * 37), Math.round(40 + Math.sin(a) * 10), F.metalDk);
  }
  // tripod + retrieval line over the hole
  p.line(20, 108, 56, 14, F.metal);
  p.line(92, 108, 56, 14, F.metal);
  p.line(56, 14, 56, 38, F.metalDk);
  // gas monitor, alarming
  p.r(76, 62, 22, 28, F.hiVis);
  p.frame(76, 62, 22, 28, F.hiVisDk);
  p.r(79, 66, 16, 12, F.screen);
  p.r(81, 69, 12, 3, f ? F.red : "#3a1d1c");
  p.ell(87, 84, 4, 4, f ? F.red : "#5a2220");
  // alarm rings
  if (f) {
    p.frame(70, 56, 34, 40, "rgba(194,69,63,0.45)");
    p.frame(66, 52, 42, 48, "rgba(194,69,63,0.25)");
  }
  p.autoOutline();
};

ENEMY_ART.traffic_incursion = (p, f) => {
  groundShadow(p, 56, 112, 36);
  // roadway
  p.r(0, 74, 112, 38, "#3d4045");
  p.noise(0, 74, 112, 38, "#4a4d53", 60, 11);
  for (let x = 0; x < 112; x += 20) p.r(x + f * 4, 92, 12, 3, F.paper);
  // a vehicle that has come through the taper
  p.r(24, 44, 64, 34, "#b4443c");
  p.r(24, 44, 64, 6, "#d05a50");
  p.r(34, 30, 44, 16, "#8e2f2b");
  p.r(38, 33, 36, 11, "#9ac0d8");
  p.r(26, 70, 12, 10, F.inkSoft);
  p.r(74, 70, 12, 10, F.inkSoft);
  p.r(84, 52, 6, 6, F.hiVis);
  p.r(22, 52, 6, 6, F.hiVis);
  // flattened cones in its path
  [[6, 84], [98, 88]].forEach(([x, y], i) => {
    p.r(x, y + (i ? 6 : 0), 12, 4, F.orange);
    p.r(x + 2, y - 8 + (i ? 6 : 0), 8, 8, F.orange);
    p.r(x + 2, y - 4 + (i ? 6 : 0), 8, 2, F.paper);
  });
  hazardBand(p, 16);
  p.autoOutline();
};

ENEMY_ART.chlorine_leak = (p, f) => {
  groundShadow(p, 56, 112, 24);
  // a one-ton cylinder venting
  p.r(26, 62, 60, 44, "#b8b45a");
  p.ell(26, 84, 8, 22, "#a8a44e");
  p.ell(86, 84, 8, 22, "#c8c46a");
  p.r(26, 62, 60, 4, "#d0cc7c");
  p.r(40, 76, 32, 8, F.hiVis);
  p.r(44, 78, 24, 4, F.ink);
  // valve, leaking
  p.r(78, 52, 10, 12, F.metalDk);
  p.r(74, 46, 18, 8, F.metal);
  // gas cloud
  const puffs = [[96, 40], [86, 28], [70, 22], [54, 18], [38, 24], [24, 34]];
  puffs.forEach(([x, y], i) => {
    const r = 9 + ((i + f) % 3) * 3;
    p.ell(x, y + ((i + f) % 2) * 2, r, r - 3, "rgba(190,214,140,0.55)");
  });
  puffs.forEach(([x, y], i) => {
    if (i % 2) p.ell(x, y, 5, 4, "rgba(220,238,180,0.6)");
  });
  hazardBand(p, 104);
  p.autoOutline();
};

globalThis.ENEMY_ART = ENEMY_ART;
globalThis.enemyBust = bust;
