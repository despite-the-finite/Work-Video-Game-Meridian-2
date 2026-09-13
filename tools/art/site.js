/* =============================================================================
   tools/art/site.js — EPC project site art (bake time)
   -----------------------------------------------------------------------------
   Six site themes share one construction vocabulary (gravel, concrete, fence,
   staging, hazard zones) and differ by what's being built:

     process    Meridian Phase 2   — vessels, piping racks, structural steel
     food       Ashgrove Foods     — stainless line, chillers, sanitary piping
     power      Meridian Grid      — lattice towers, conductors, insulators
     refinery   Blackwater         — columns, flare stack, heat exchangers
     bridge     Route 9            — girders, deck, barrier, traffic control
     water      Cedar Falls WTP    — basins, clarifiers, chemical feed

   The ground tiles are 32x32; the big equipment pieces are 64x64 so they can
   tower over the player the way real plant equipment does.
   ========================================================================== */

globalThis.ST = 32;
globalThis.SBIG = 64;

globalThis.SITE_THEMES = {
  process: { steel: "#8792a0", accent: "#5980a6", ground: "#8f887c", tank: "#c2c6cb" },
  food: { steel: "#b4bcc4", accent: "#6f9a8a", ground: "#9a958a", tank: "#dfe3e6" },
  power: { steel: "#9aa3ab", accent: "#d8b45a", ground: "#8a8878", tank: "#b4bcc4" },
  refinery: { steel: "#8a8f96", accent: "#c2703a", ground: "#7e7a70", tank: "#a8adb2" },
  bridge: { steel: "#96a0a8", accent: "#e8701a", ground: "#8e8a82", tank: "#b0b6bc" },
  water: { steel: "#9aa8ac", accent: "#5a9aa6", ground: "#8f8f84", tank: "#c4ced2" },
};

/* --- ground ---------------------------------------------------------------- */
function gravelTile(th, v, seed) {
  const p = new Painter(ST, ST);
  p.r(0, 0, ST, ST, th.ground);
  p.noise(0, 0, ST, ST, shade(th.ground, 0.82), 70, seed);
  p.noise(0, 0, ST, ST, shade(th.ground, 1.14), 46, seed + 5);
  // a few larger stones so the texture has scale
  const rnd = mulberry(seed + 17);
  for (let i = 0; i < 5 + v * 2; i++) {
    const x = Math.floor(rnd() * (ST - 3));
    const y = Math.floor(rnd() * (ST - 3));
    p.r(x, y, 2 + Math.floor(rnd() * 2), 2, shade(th.ground, 0.72));
    p.px(x, y, shade(th.ground, 1.2));
  }
  if (v === 2) {
    // tire track
    p.r(4, 0, 5, ST, shade(th.ground, 0.88));
    p.r(20, 0, 5, ST, shade(th.ground, 0.88));
    for (let y = 0; y < ST; y += 4) {
      p.hr(4, y, 5, shade(th.ground, 0.75));
      p.hr(20, y + 2, 5, shade(th.ground, 0.75));
    }
  }
  return p;
}

function concreteTile(th, v, seed) {
  const p = new Painter(ST, ST);
  p.r(0, 0, ST, ST, PAL.concrete);
  p.noise(0, 0, ST, ST, PAL.concreteDk, 30, seed);
  p.noise(0, 0, ST, ST, shade(PAL.concrete, 1.1), 22, seed + 3);
  // control joints on the tile edges — reads as a poured slab
  p.hr(0, 0, ST, shade(PAL.concreteDk, 0.9));
  p.vr(0, 0, ST, shade(PAL.concreteDk, 0.9));
  if (v === 1) p.line(6, 0, 12, ST, "rgba(0,0,0,0.05)");
  return p;
}

function mudTile(th, seed) {
  const p = new Painter(ST, ST);
  p.r(0, 0, ST, ST, "#6b5d4a");
  p.noise(0, 0, ST, ST, "#5a4d3c", 60, seed);
  p.noise(0, 0, ST, ST, "#7d6e58", 40, seed + 9);
  // a shallow rut rather than a puddle — these tiles are sprinkled across a
  // whole yard, so anything high-contrast reads as a repeating stamp
  p.ell(11, 13, 8, 3, "#5f5342");
  p.ell(21, 23, 6, 2, "#5f5342");
  return p;
}

// Hazard zone floor: the painted-and-taped area where encounters happen.
function hazardTile(th, seed) {
  const p = new Painter(ST, ST);
  p.r(0, 0, ST, ST, th.ground);
  p.noise(0, 0, ST, ST, shade(th.ground, 0.85), 40, seed);
  // diagonal hazard stripes, worn
  for (let i = -ST; i < ST * 2; i += 10) {
    for (let j = 0; j < 5; j++) p.line(i + j, 0, i + j - ST, ST, j < 3 ? PAL.hiVis : PAL.ink);
  }
  p.noise(0, 0, ST, ST, shade(th.ground, 0.9), 60, seed + 21);
  p.frame(0, 0, ST, ST, "rgba(0,0,0,0.12)");
  return p;
}

/* --- barriers -------------------------------------------------------------- */
function fenceTile(th, kind) {
  const p = new Painter(ST, ST);
  p.r(0, 0, ST, ST, th.ground);
  p.noise(0, 0, ST, ST, shade(th.ground, 0.85), 30, 4);
  if (kind === "chain") {
    // chain link: posts, top rail, diamond mesh
    p.r(0, 6, ST, 2, PAL.metal);
    for (let x = 0; x < ST; x += 5) {
      p.line(x, 8, x + 5, 28, "rgba(190,198,206,0.85)");
      p.line(x + 5, 8, x, 28, "rgba(190,198,206,0.85)");
    }
    p.r(2, 4, 4, 26, PAL.metalDk);
    p.r(26, 4, 4, 26, PAL.metalDk);
    p.r(2, 4, 2, 26, PAL.metalLt);
    p.r(26, 4, 2, 26, PAL.metalLt);
    p.r(0, 28, ST, 3, "rgba(0,0,0,0.2)");
    // a wind-flapped safety banner every few panels
    p.r(8, 12, 16, 7, PAL.orange);
    p.r(9, 14, 14, 1, PAL.paper);
    p.r(9, 17, 9, 1, PAL.paper);
  } else {
    // jersey barrier
    p.r(0, 10, ST, 20, PAL.concrete);
    p.r(0, 10, ST, 3, shade(PAL.concrete, 1.14));
    p.r(0, 16, ST, 2, PAL.concreteDk);
    p.r(0, 27, ST, 3, PAL.concreteDk);
    p.noise(0, 10, ST, 20, PAL.concreteDk, 24, 8);
    p.r(4, 19, 10, 5, PAL.orange);
    p.r(18, 19, 10, 5, PAL.paper);
    p.r(0, 30, ST, 2, "rgba(0,0,0,0.25)");
  }
  return p;
}

/* --- 64x64 equipment ------------------------------------------------------- */

const SITE_BIG = {};

// Vertical process vessel with skirt, ladder and nozzles.
SITE_BIG.vessel = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 24, 5, "rgba(0,0,0,0.25)");
  p.r(18, 14, 28, 44, th.tank);
  p.ell(32, 14, 14, 6, shade(th.tank, 1.08));
  p.r(18, 14, 6, 44, shade(th.tank, 1.12));
  p.r(40, 14, 6, 44, shade(th.tank, 0.82));
  // skirt + base ring
  p.r(16, 54, 32, 6, PAL.concrete);
  p.r(16, 58, 32, 2, PAL.concreteDk);
  // circumferential weld seams
  [24, 34, 44].forEach((y) => p.hr(18, y, 28, shade(th.tank, 0.78)));
  // ladder + cage
  for (let y = 18; y < 54; y += 4) p.hr(46, y, 5, PAL.metalDk);
  p.vr(46, 16, 38, PAL.metalDk);
  p.vr(50, 16, 38, PAL.metalDk);
  // nozzles
  p.r(14, 26, 5, 5, PAL.pipeDk);
  p.r(45, 40, 6, 5, PAL.pipeDk);
  p.r(30, 8, 5, 7, PAL.pipeDk);
  // asset tag
  p.r(24, 32, 12, 6, PAL.paper);
  p.hr(26, 35, 8, th.accent);
  p.autoOutline();
  return p;
};

// Pipe rack: bents with pipe runs on two levels.
SITE_BIG.piperack = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 26, 4, "rgba(0,0,0,0.22)");
  [8, 30, 52].forEach((x) => {
    p.r(x, 12, 5, 48, th.steel);
    p.r(x, 12, 2, 48, shade(th.steel, 1.18));
  });
  p.r(4, 12, 56, 5, th.steel);
  p.r(4, 34, 56, 5, th.steel);
  // pipe runs
  [[20, PAL.pipe], [26, PAL.pipeDk], [42, "#7a8b7a"], [48, PAL.rust]].forEach(([y, col]) => {
    p.r(0, y, SBIG, 6, col);
    p.hr(0, y, SBIG, shade(col, 1.25));
    p.hr(0, y + 5, SBIG, shade(col, 0.72));
  });
  // insulation break + flange
  p.r(28, 19, 6, 8, PAL.metalLt);
  p.r(44, 41, 6, 8, PAL.metalLt);
  p.autoOutline();
  return p;
};

// Structural steel frame under construction — bolted connections, no deck yet.
SITE_BIG.steelframe = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 26, 4, "rgba(0,0,0,0.22)");
  const col = PAL.hiVis; // shop primer on new steel
  [6, 30, 54].forEach((x) => {
    p.r(x, 6, 5, 54, col);
    p.r(x, 6, 2, 54, shade(col, 1.15));
  });
  [10, 30, 50].forEach((y) => {
    p.r(4, y, 56, 4, col);
    p.hr(4, y, 56, shade(col, 1.15));
  });
  // bracing
  p.line(10, 30, 30, 12, shade(col, 0.85));
  p.line(34, 12, 54, 30, shade(col, 0.85));
  p.line(10, 50, 30, 32, shade(col, 0.85));
  // bolted gusset plates
  [[8, 10], [32, 10], [56, 30], [8, 50]].forEach(([x, y]) => {
    p.r(x - 3, y - 2, 8, 8, shade(col, 0.8));
    p.px(x - 1, y, PAL.ink);
    p.px(x + 2, y + 3, PAL.ink);
  });
  p.autoOutline();
  return p;
};

// Crawler crane — boom out of frame, which is what makes it feel big.
SITE_BIG.crane = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 58, 26, 5, "rgba(0,0,0,0.25)");
  // tracks
  p.r(8, 46, 48, 12, PAL.inkSoft);
  p.r(10, 48, 44, 8, "#3d434c");
  for (let x = 10; x < 54; x += 5) p.vr(x, 48, 8, PAL.inkSoft);
  // house
  p.r(14, 26, 30, 20, PAL.hiVis);
  p.r(14, 26, 30, 3, shade(PAL.hiVis, 1.15));
  p.r(38, 28, 6, 18, PAL.hiVisDk);
  p.r(17, 30, 12, 10, PAL.screen);
  p.r(18, 31, 10, 4, "#9ac0d8");
  // counterweight
  p.r(44, 30, 12, 16, PAL.inkSoft);
  p.hr(44, 36, 12, PAL.metalDk);
  // lattice boom heading up out of the tile
  for (let i = 0; i < 7; i++) {
    const y = 24 - i * 4;
    if (y < 0) break;
    p.hr(12 - i, y, 14, PAL.hiVis);
    p.line(12 - i, y, 26 - i, y - 4, PAL.hiVisDk);
  }
  p.vr(12, 0, 26, PAL.hiVis);
  p.vr(25, 0, 26, PAL.hiVis);
  p.autoOutline();
  return p;
};

// Site trailer with steps and a window AC unit.
SITE_BIG.trailer = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 58, 28, 5, "rgba(0,0,0,0.25)");
  p.r(4, 18, 56, 34, "#d8d4c6");
  p.r(4, 18, 56, 5, "#e8e4d8");
  p.r(4, 47, 56, 5, "#b4b0a2");
  p.r(4, 14, 56, 5, "#9aa0a6");
  // skirting + jacks
  p.r(6, 52, 52, 4, PAL.metalDk);
  p.r(10, 56, 4, 4, PAL.metalDk);
  p.r(50, 56, 4, 4, PAL.metalDk);
  // door + steps
  p.r(38, 26, 12, 24, "#8a6b4a");
  p.r(39, 27, 10, 22, "#a07f5a");
  p.r(47, 38, 2, 3, PAL.metalLt);
  p.r(36, 50, 16, 3, PAL.metal);
  p.r(34, 53, 20, 3, PAL.metal);
  // windows
  p.r(10, 26, 10, 9, "#9ac0d8");
  p.frame(10, 26, 10, 9, PAL.metalDk);
  p.r(23, 26, 10, 9, "#9ac0d8");
  p.frame(23, 26, 10, 9, PAL.metalDk);
  // AC unit + sign
  p.r(12, 38, 9, 7, PAL.metalLt);
  p.hr(13, 41, 7, PAL.metalDk);
  p.r(23, 38, 12, 7, th.accent);
  p.hr(25, 41, 8, PAL.paper);
  p.autoOutline();
  return p;
};

// Material laydown: banded steel, pipe stacks, pallets.
SITE_BIG.laydown = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 58, 28, 4, "rgba(0,0,0,0.2)");
  // pipe stack, nested
  [[8, 40], [16, 40], [24, 40], [12, 32], [20, 32], [16, 24]].forEach(([x, y]) => {
    p.ell(x + 4, y + 4, 5, 5, PAL.pipe);
    p.ell(x + 4, y + 4, 3, 3, PAL.pipeDk);
  });
  p.r(4, 46, 32, 4, PAL.wood);
  // banded steel bundles
  p.r(38, 34, 24, 8, th.steel);
  p.r(38, 42, 24, 8, shade(th.steel, 0.85));
  p.r(44, 34, 3, 16, PAL.inkSoft);
  p.r(56, 34, 3, 16, PAL.inkSoft);
  // pallet of bagged material
  p.r(38, 18, 22, 14, "#c9b189");
  p.r(38, 18, 22, 4, "#dcc79e");
  p.r(38, 30, 22, 3, PAL.wood);
  p.autoOutline();
  return p;
};

// Chiller / skid package (food + water plants).
SITE_BIG.skid = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 58, 26, 5, "rgba(0,0,0,0.24)");
  p.r(6, 24, 52, 30, th.tank);
  p.r(6, 24, 52, 4, shade(th.tank, 1.1));
  p.r(6, 50, 52, 4, shade(th.tank, 0.78));
  // fan grilles
  [16, 40].forEach((cx) => {
    p.ell(cx, 36, 11, 11, PAL.metalDk);
    p.ell(cx, 36, 9, 9, "#2b3036");
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      p.line(cx, 36, Math.round(cx + Math.cos(a) * 8), Math.round(36 + Math.sin(a) * 8), PAL.metalLt);
    }
    p.ell(cx, 36, 2, 2, PAL.metalLt);
  });
  // sanitary piping out the side
  p.r(0, 30, 8, 5, PAL.metalLt);
  p.r(0, 42, 8, 5, PAL.metalLt);
  p.r(56, 36, 8, 5, PAL.metalLt);
  // frame
  p.r(4, 52, 56, 4, PAL.inkSoft);
  p.r(8, 20, 6, 6, th.accent);
  p.autoOutline();
  return p;
};

// Lattice transmission structure (power).
SITE_BIG.tower = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 22, 4, "rgba(0,0,0,0.22)");
  const c = PAL.metal;
  // tapering legs
  for (let y = 0; y < 56; y += 1) {
    const half = 6 + (y / 56) * 16;
    p.px(Math.round(32 - half), y, c);
    p.px(Math.round(32 + half), y, c);
  }
  // cross bracing
  for (let y = 4; y < 54; y += 9) {
    const half = 6 + (y / 56) * 16;
    p.line(Math.round(32 - half), y, Math.round(32 + half), y + 9, PAL.metalDk);
    p.line(Math.round(32 + half), y, Math.round(32 - half), y + 9, PAL.metalDk);
    p.hr(Math.round(32 - half), y, Math.round(half * 2), c);
  }
  // crossarm + insulator strings + conductors
  p.r(2, 10, 60, 3, c);
  [10, 32, 54].forEach((x) => {
    for (let i = 0; i < 3; i++) p.ell(x, 15 + i * 3, 3, 2, "#8a6b5a");
    p.ell(x, 24, 3, 2, PAL.rust);
  });
  p.hr(0, 11, SBIG, shade(c, 1.2));
  // footings
  p.r(6, 54, 10, 6, PAL.concrete);
  p.r(48, 54, 10, 6, PAL.concrete);
  p.autoOutline();
  return p;
};

// Fractionation column + flare (refinery).
SITE_BIG.column = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 20, 4, "rgba(0,0,0,0.25)");
  p.r(22, 4, 20, 54, th.tank);
  p.ell(32, 4, 10, 4, shade(th.tank, 1.1));
  p.r(22, 4, 5, 54, shade(th.tank, 1.12));
  p.r(37, 4, 5, 54, shade(th.tank, 0.8));
  // tray platforms
  [14, 26, 38, 50].forEach((y) => {
    p.r(16, y, 32, 3, PAL.metalDk);
    p.hr(16, y, 32, PAL.metalLt);
  });
  // overhead line
  p.r(12, 8, 12, 4, PAL.pipe);
  p.r(12, 8, 4, 30, PAL.pipe);
  // ladder
  for (let y = 8; y < 56; y += 4) p.hr(42, y, 4, PAL.metalDk);
  p.r(20, 56, 24, 4, PAL.concrete);
  p.autoOutline();
  return p;
};

// Bridge girder span on falsework.
SITE_BIG.girder = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 28, 4, "rgba(0,0,0,0.22)");
  // plate girders
  p.r(0, 18, SBIG, 6, th.steel);
  p.r(0, 18, SBIG, 2, shade(th.steel, 1.2));
  p.r(0, 24, SBIG, 12, shade(th.steel, 0.82));
  p.r(0, 36, SBIG, 6, th.steel);
  // stiffeners
  for (let x = 4; x < SBIG; x += 10) p.r(x, 24, 3, 12, shade(th.steel, 0.7));
  // falsework towers
  [8, 46].forEach((x) => {
    p.r(x, 42, 4, 18, PAL.wood);
    p.r(x + 10, 42, 4, 18, PAL.wood);
    p.line(x, 42, x + 14, 60, PAL.woodDk);
    p.r(x - 2, 42, 18, 3, PAL.woodDk);
  });
  // deck rebar mat starting on top
  for (let x = 2; x < SBIG; x += 6) p.vr(x, 10, 8, PAL.rust);
  p.hr(0, 12, SBIG, PAL.rust);
  p.hr(0, 16, SBIG, PAL.rust);
  p.autoOutline();
  return p;
};

// Clarifier basin (water).
SITE_BIG.basin = (th) => {
  const p = new Painter(SBIG, SBIG);
  p.ell(32, 60, 28, 4, "rgba(0,0,0,0.2)");
  p.ell(32, 34, 30, 22, PAL.concrete);
  p.ell(32, 34, 27, 19, PAL.concreteDk);
  p.ell(32, 35, 24, 16, "#5a8a92");
  p.ell(32, 34, 22, 14, "#6ea2aa");
  // launder ring + weir
  p.ell(32, 34, 18, 11, "#7fb4bc");
  p.ell(32, 34, 16, 9, "#5a8a92");
  // rotating rake bridge
  p.r(6, 32, 52, 4, PAL.metalLt);
  p.r(6, 32, 52, 1, PAL.paper);
  p.r(28, 26, 8, 16, PAL.metalDk);
  p.r(29, 22, 6, 6, th.accent);
  // handrail posts
  [10, 22, 42, 54].forEach((x) => p.r(x, 26, 2, 7, PAL.metalDk));
  p.autoOutline();
  return p;
};

/* --- 32x32 site props ------------------------------------------------------ */

const SITE_PROPS = {};

SITE_PROPS.cone = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 28, 8, 3, "rgba(0,0,0,0.25)");
  p.r(9, 26, 15, 4, PAL.orange);
  for (let i = 0; i < 9; i++) p.r(12 + Math.floor(i / 3), 26 - i * 2, 8 - Math.floor(i / 1.6), 2, PAL.orange);
  p.r(13, 14, 6, 3, PAL.paper);
  p.autoOutline();
  return p;
};

SITE_PROPS.barrel = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 29, 8, 3, "rgba(0,0,0,0.25)");
  p.r(8, 8, 16, 21, "#3f6b8a");
  p.ell(16, 8, 8, 3, "#5a86a6");
  p.r(8, 8, 4, 21, "#4e7d9c");
  p.hr(8, 14, 16, "#2e5570");
  p.hr(8, 22, 16, "#2e5570");
  p.r(11, 17, 10, 5, PAL.hiVis);
  p.autoOutline();
  return p;
};

SITE_PROPS.spool = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 28, 10, 3, "rgba(0,0,0,0.22)");
  p.r(3, 14, 26, 12, PAL.pipe);
  p.hr(3, 14, 26, shade(PAL.pipe, 1.22));
  p.hr(3, 25, 26, PAL.pipeDk);
  p.r(1, 12, 4, 16, PAL.metalLt);
  p.r(27, 12, 4, 16, PAL.metalLt);
  [2, 28].forEach((x) => {
    for (let i = 0; i < 4; i++) p.px(x + 1, 14 + i * 4, PAL.ink);
  });
  p.r(12, 8, 8, 7, PAL.wood);
  p.autoOutline();
  return p;
};

SITE_PROPS.genset = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 29, 11, 3, "rgba(0,0,0,0.24)");
  p.r(2, 12, 28, 17, PAL.hiVis);
  p.r(2, 12, 28, 3, shade(PAL.hiVis, 1.14));
  p.r(2, 26, 28, 3, PAL.hiVisDk);
  p.r(5, 16, 9, 8, PAL.metalDk);
  for (let i = 0; i < 4; i++) p.vr(6 + i * 2, 17, 6, PAL.metalLt);
  p.r(18, 16, 9, 6, PAL.screen);
  p.r(19, 17, 3, 2, PAL.screenGlow);
  p.r(22, 6, 4, 7, PAL.metalDk);
  p.r(4, 29, 5, 3, PAL.inkSoft);
  p.r(23, 29, 5, 3, PAL.inkSoft);
  p.autoOutline();
  return p;
};

SITE_PROPS.dumpster = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 29, 12, 3, "rgba(0,0,0,0.22)");
  p.r(2, 12, 28, 17, "#4a6b5a");
  p.r(2, 12, 28, 3, "#5d8270");
  p.r(2, 25, 28, 4, "#3a5648");
  p.r(6, 8, 20, 5, "#3a5648");
  p.r(8, 6, 6, 3, PAL.wood);
  p.r(17, 5, 7, 4, PAL.paperDim);
  p.r(4, 29, 4, 3, PAL.inkSoft);
  p.r(24, 29, 4, 3, PAL.inkSoft);
  p.autoOutline();
  return p;
};

SITE_PROPS.signboard = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 30, 8, 2, "rgba(0,0,0,0.2)");
  p.r(4, 2, 24, 20, PAL.hiVis);
  p.frame(4, 2, 24, 20, PAL.hiVisDk);
  // hard-hat-required pictogram
  p.ell(16, 11, 7, 6, PAL.ink);
  p.ell(16, 10, 5, 4, PAL.paper);
  p.r(10, 12, 12, 2, PAL.ink);
  p.r(6, 17, 20, 3, PAL.ink);
  p.r(14, 22, 4, 8, PAL.metalDk);
  p.autoOutline();
  return p;
};

SITE_PROPS.portapotty = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 30, 9, 3, "rgba(0,0,0,0.24)");
  p.r(6, 4, 20, 26, "#4a7a6b");
  p.r(6, 4, 20, 3, "#5e9184");
  p.r(22, 6, 4, 24, "#3a6154");
  p.r(9, 9, 12, 18, "#3f6b5e");
  p.r(10, 10, 10, 7, "#59897a");
  p.r(19, 18, 2, 4, PAL.metalLt);
  p.autoOutline();
  return p;
};

SITE_PROPS.lightplant = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 30, 9, 3, "rgba(0,0,0,0.22)");
  p.r(8, 22, 16, 8, PAL.hiVis);
  p.r(8, 22, 16, 2, shade(PAL.hiVis, 1.15));
  p.r(9, 30, 4, 2, PAL.inkSoft);
  p.r(19, 30, 4, 2, PAL.inkSoft);
  p.vr(15, 6, 17, PAL.metal);
  p.vr(16, 6, 17, PAL.metalDk);
  p.r(4, 2, 10, 6, PAL.metalDk);
  p.r(5, 3, 8, 4, "#f7e9b0");
  p.r(18, 2, 10, 6, PAL.metalDk);
  p.r(19, 3, 8, 4, "#f7e9b0");
  p.autoOutline();
  return p;
};

SITE_PROPS.pickup = (th) => {
  const p = new Painter(ST, ST);
  p.ell(16, 29, 13, 3, "rgba(0,0,0,0.25)");
  p.r(2, 14, 28, 11, "#b4443c");
  p.r(2, 14, 28, 2, "#d05a50");
  p.r(6, 7, 14, 8, "#8e2f2b");
  p.r(8, 9, 10, 5, "#9ac0d8");
  p.r(20, 16, 10, 7, "#9c3b34");
  p.r(28, 16, 2, 4, PAL.hiVis);
  p.ell(8, 26, 4, 4, PAL.inkSoft);
  p.ell(24, 26, 4, 4, PAL.inkSoft);
  p.ell(8, 26, 2, 2, PAL.metal);
  p.ell(24, 26, 2, 2, PAL.metal);
  p.autoOutline();
  return p;
};

SITE_PROPS.portal = (th) => {
  // The exit gate — a swung-open fence panel you walk through.
  const p = new Painter(ST, ST);
  p.r(2, 4, 4, 26, PAL.metalDk);
  p.r(26, 4, 4, 26, PAL.metalDk);
  p.r(6, 6, 8, 4, PAL.metal);
  p.r(18, 6, 8, 4, PAL.metal);
  for (let x = 6; x < 14; x += 4) {
    p.line(x, 10, x + 4, 26, "rgba(190,198,206,0.7)");
    p.line(x + 4, 10, x, 26, "rgba(190,198,206,0.7)");
  }
  p.r(10, 12, 12, 10, PAL.hiVis);
  p.r(11, 15, 10, 2, PAL.ink);
  p.r(11, 18, 6, 2, PAL.ink);
  p.autoOutline();
  return p;
};

globalThis.SITE_BIG = SITE_BIG;
globalThis.SITE_PROPS = SITE_PROPS;
globalThis.gravelTile = gravelTile;
globalThis.concreteTile = concreteTile;
globalThis.mudTile = mudTile;
globalThis.hazardTile = hazardTile;
globalThis.fenceTile = fenceTile;

// Which big piece stands in for each site theme's "structure" and
// "equipment" grid characters, plus the ambient palette for the scene.
globalThis.SITE_THEME_MAP = {
  process: { structure: "steelframe", equipment: "vessel", extra: "piperack", sky: "#b9d3e0" },
  food: { structure: "steelframe", equipment: "skid", extra: "piperack", sky: "#c6d8e0" },
  power: { structure: "tower", equipment: "laydown", extra: "tower", sky: "#c2d6e2" },
  refinery: { structure: "column", equipment: "vessel", extra: "piperack", sky: "#d0c8b8" },
  bridge: { structure: "girder", equipment: "crane", extra: "girder", sky: "#bcd4e2" },
  water: { structure: "basin", equipment: "skid", extra: "basin", sky: "#c0d8dc" },
};
