/* =============================================================================
   tools/art/world.js — office architecture + furniture (bake time)
   -----------------------------------------------------------------------------
   Everything is a 32x32 tile unless noted. Three themes (gfs / cdb / exec)
   share one drawing vocabulary and differ by palette + which props appear:
     gfs   engineering: drafting greys/steel, drawings, dual monitors, plotters
     cdb   construction: warm concrete/tan, hi-vis, site photos, plan tables
     exec  executive:    walnut + charcoal, brass, glass, artwork, quiet light
   ========================================================================== */

globalThis.T = 32;

globalThis.THEMES = {
  gfs: {
    floor: PAL.carpetGfs,
    floorDk: PAL.carpetGfsDk,
    floorLt: PAL.carpetGfsLt,
    wall: PAL.wallLt,
    wallMd: PAL.wallMd,
    wallDk: PAL.wallDk,
    trim: PAL.steel,
    desk: PAL.woodLt,
    deskDk: PAL.wood,
  },
  cdb: {
    floor: PAL.carpetCdb,
    floorDk: PAL.carpetCdbDk,
    floorLt: PAL.carpetCdbLt,
    wall: "#e6e0d4",
    wallMd: "#cbc4b4",
    wallDk: "#8f887a",
    trim: PAL.orange,
    desk: "#b08a5e",
    deskDk: "#7d5e37",
  },
  exec: {
    floor: PAL.carpetExec,
    floorDk: PAL.carpetExecDk,
    floorLt: PAL.carpetExecLt,
    wall: "#37393d",
    wallMd: "#2b2d31",
    wallDk: "#1d1f22",
    trim: PAL.gold,
    desk: PAL.walnut,
    deskDk: "#33241a",
  },
};

/* --- floors ---------------------------------------------------------------- */
function floorTile(th, variant, seed) {
  const p = new Painter(T, T);
  p.r(0, 0, T, T, th.floor);
  if (th === THEMES.exec) {
    // wide-plank walnut with a subtle sheen
    p.r(0, 0, T, T, th.floor);
    for (let y = 0; y < T; y += 8) {
      p.hr(0, y, T, th.floorDk);
      p.noise(0, y + 1, T, 7, th.floorLt, 10, seed + y);
    }
    p.vr(variant % 2 === 0 ? 11 : 21, 0, T, th.floorDk);
  } else {
    // carpet tile: flecked, with a faint seam so the grid reads as carpet tiles
    p.noise(0, 0, T, T, th.floorDk, 46, seed);
    p.noise(0, 0, T, T, th.floorLt, 30, seed + 7);
    // The three variants differ only by fleck pattern and which edges carry a
    // seam — anything stronger reads as a checkerboard from the camera.
    if (variant === 0) {
      p.hr(0, 0, T, shade(th.floorDk, 0.97));
      p.vr(0, 0, T, shade(th.floorDk, 0.97));
    } else if (variant === 1) {
      p.noise(0, 0, T, T, th.floorDk, 22, seed + 3);
      p.vr(0, 0, T, shade(th.floorDk, 0.98));
    } else {
      p.hr(0, 0, T, shade(th.floorDk, 0.98));
    }
  }
  return p;
}

function breakFloorTile(th, seed) {
  // kitchen / break-room vinyl: checker, warmer than the carpet
  const p = new Painter(T, T);
  const a = "#d8d2c4";
  const b = "#c3bcab";
  p.r(0, 0, T, T, a);
  p.r(0, 0, 16, 16, b);
  p.r(16, 16, 16, 16, b);
  p.noise(0, 0, T, T, "#ffffff", 18, seed);
  p.frame(0, 0, T, T, "rgba(0,0,0,0.06)");
  return p;
}

/* --- ambient occlusion overlays ------------------------------------------- */
function aoTile(dir) {
  const p = new Painter(T, T);
  const steps = [0.3, 0.2, 0.13, 0.08, 0.04];
  steps.forEach((a, i) => {
    const c = `rgba(0,0,0,${a})`;
    if (dir === "n") p.hr(0, i, T, c);
    if (dir === "s") p.hr(0, T - 1 - i, T, c);
    if (dir === "w") p.vr(i, 0, T, c);
    if (dir === "e") p.vr(T - 1 - i, 0, T, c);
  });
  return p;
}

/* --- walls ----------------------------------------------------------------- */
// Plan-view wall band (h / v / x) — the same continuous-line logic V1 used,
// but drawn as a real wall: core, highlight edge, cast shadow.
function wallBand(th, isH, isV) {
  const p = new Painter(T, T);
  p.r(0, 0, T, T, th.floor);
  const core = th.wallMd;
  const lite = th.wall;
  const dark = th.wallDk;
  if (isH) {
    p.r(0, 11, T, 10, core);
    p.hr(0, 11, T, lite);
    p.hr(0, 12, T, lite);
    p.hr(0, 20, T, dark);
    p.r(0, 21, T, 3, "rgba(0,0,0,0.22)");
  }
  if (isV) {
    p.r(11, 0, 10, T, core);
    p.vr(11, 0, T, lite);
    p.vr(20, 0, T, dark);
    p.r(21, 0, 3, T, "rgba(0,0,0,0.18)");
  }
  if (isH && isV) {
    p.r(11, 11, 10, 10, core);
    p.hr(11, 11, 10, lite);
  }
  return p;
}

// A south-facing wall the player looks at: full-height elevation with
// baseboard, wainscot and room for one object (window, whiteboard, drawings,
// signage, art, TV, door).
function wallFace(th, kind, seed) {
  const p = new Painter(T, T);
  const lite = th.wall;
  const core = th.wallMd;
  const dark = th.wallDk;
  p.r(0, 0, T, T, core);
  p.r(0, 0, T, 20, lite);
  p.hr(0, 20, T, shade(lite, 0.88));
  p.r(0, 21, T, 6, core);
  p.r(0, 27, T, 3, dark); // baseboard
  p.r(0, 30, T, 2, "rgba(0,0,0,0.28)"); // contact shadow onto the floor

  if (kind === "plain") {
    p.noise(0, 1, T, 19, shade(lite, 0.97), 14, seed);
  } else if (kind === "window") {
    p.r(3, 3, 26, 16, PAL.inkSoft);
    p.r(4, 4, 24, 14, PAL.sky);
    p.r(4, 4, 24, 5, shade(PAL.sky, 1.06));
    p.r(4, 13, 24, 5, shade(PAL.sky, 0.9));
    // distant skyline / mountains, per seed
    if (seed % 2 === 0) {
      p.line(5, 13, 11, 7, "#8fa8b8");
      p.line(11, 7, 17, 13, "#8fa8b8");
      p.line(15, 13, 21, 8, "#7e97a8");
      p.line(21, 8, 27, 13, "#7e97a8");
      p.r(4, 14, 24, 4, "#9fb6c2");
    } else {
      [6, 11, 16, 21, 25].forEach((bx, i) => {
        const bh = 5 + ((seed + i * 3) % 6);
        p.r(bx, 18 - bh, 4, bh, "#9aafbd");
        p.r(bx, 18 - bh, 1, bh, "#b0c3ce");
      });
    }
    p.vr(15, 4, 14, shade(PAL.inkSoft, 1.4));
    p.hr(4, 11, 24, shade(PAL.inkSoft, 1.4));
    p.frame(3, 3, 26, 16, PAL.inkSoft);
  } else if (kind === "board") {
    // whiteboard, mid-scribble
    p.r(3, 4, 26, 15, PAL.paper);
    p.frame(3, 4, 26, 15, PAL.metal);
    p.r(3, 18, 26, 2, PAL.metal);
    const rnd = mulberry(seed);
    for (let i = 0; i < 5; i++) {
      const y = 7 + i * 2;
      p.hr(6 + Math.floor(rnd() * 4), y, 8 + Math.floor(rnd() * 10), i % 2 ? PAL.steel : PAL.inkSoft);
    }
    p.line(20, 8, 26, 14, PAL.red);
    p.r(24, 19, 3, 1, PAL.red); // marker on the tray
  } else if (kind === "drawings") {
    // drawings pinned up, one with revision clouds
    for (let i = 0; i < 2; i++) {
      const x = 2 + i * 15;
      p.r(x, 3, 13, 17, PAL.paper);
      p.frame(x, 3, 13, 17, PAL.paperDim);
      p.r(x + 1, 15, 11, 4, "rgba(89,128,166,0.18)");
      p.frame(x + 1, 15, 11, 4, PAL.steelLt);
      for (let l = 0; l < 4; l++) p.hr(x + 2, 5 + l * 2, 8, PAL.steelLt);
      p.line(x + 2, 12, x + 10, 6, PAL.steel);
      if (i === 1) {
        p.ell(x + 6, 9, 4, 3, "rgba(194,69,63,0.0)");
        p.frame(x + 3, 7, 7, 5, PAL.red);
      }
      p.px(x + 6, 3, PAL.red);
    }
  } else if (kind === "sign") {
    p.r(6, 5, 20, 10, th === THEMES.exec ? PAL.gold : PAL.steel);
    p.r(7, 6, 18, 8, shade(th === THEMES.exec ? PAL.gold : PAL.steel, 0.85));
    for (let i = 0; i < 3; i++) p.hr(9, 8 + i * 2, 14 - i * 3, PAL.paper);
    p.r(6, 15, 20, 1, PAL.inkSoft);
  } else if (kind === "tv") {
    p.r(4, 3, 24, 15, PAL.inkSoft);
    p.r(5, 4, 22, 13, PAL.screen);
    // dashboard-ish bars on screen
    p.r(7, 12, 3, 3, PAL.steelLt);
    p.r(11, 9, 3, 6, PAL.steel);
    p.r(15, 7, 3, 8, PAL.steelLt);
    p.r(19, 11, 3, 4, PAL.amber);
    p.hr(6, 15, 20, PAL.steelDk);
    p.r(14, 18, 4, 2, PAL.inkSoft);
  } else if (kind === "art") {
    p.r(5, 3, 22, 16, th === THEMES.exec ? "#2a2622" : PAL.wood);
    p.r(7, 5, 18, 12, "#cfd8dd");
    // duotone landscape, Industry-style
    p.r(7, 12, 18, 5, PAL.steelDk);
    p.line(7, 12, 13, 7, PAL.steel);
    p.line(13, 7, 19, 12, PAL.steel);
    p.line(17, 12, 22, 8, PAL.steelLt);
    p.line(22, 8, 25, 12, PAL.steelLt);
    p.frame(5, 3, 22, 16, PAL.ink);
  } else if (kind === "door") {
    p.r(5, 2, 22, 26, th.wallDk);
    p.r(6, 3, 20, 25, th === THEMES.exec ? PAL.walnut : "#b9a888");
    p.r(6, 3, 20, 2, shade(th === THEMES.exec ? PAL.walnut : "#b9a888", 1.1));
    p.r(9, 6, 14, 11, th === THEMES.exec ? "#5a4a3a" : "#cfd8dd"); // vision panel
    p.frame(9, 6, 14, 11, PAL.inkSoft);
    p.r(23, 16, 2, 3, PAL.metalLt); // lever handle
    p.r(6, 27, 20, 1, PAL.inkSoft);
  } else if (kind === "glass") {
    // glass partition (exec + conference fronts)
    p.r(0, 2, T, 26, "rgba(200,220,235,0.20)");
    p.frame(0, 2, T, 26, PAL.metalLt);
    p.vr(10, 3, 24, "rgba(255,255,255,0.35)");
    p.vr(22, 3, 24, "rgba(255,255,255,0.18)");
    p.r(0, 27, T, 3, th.wallDk);
  } else if (kind === "elevator") {
    p.r(3, 2, 26, 26, PAL.metalDk);
    p.r(4, 3, 24, 24, PAL.metalLt);
    p.vr(16, 3, 24, PAL.metalDk);
    p.r(4, 3, 24, 2, PAL.metal);
    p.r(11, 0, 10, 3, PAL.inkSoft); // indicator housing
    p.r(13, 1, 6, 1, PAL.amber);
  }
  return p;
}

/* --- furniture ------------------------------------------------------------- */
function deskBase(p, th, h = 14) {
  // desktop slab with a visible front edge + cast shadow = depth
  p.r(1, 32 - h - 3, 30, h, th.desk);
  p.r(1, 32 - h - 3, 30, 2, shade(th.desk, 1.12));
  p.r(1, 32 - 6, 30, 3, th.deskDk);
  p.r(1, 32 - 3, 30, 2, "rgba(0,0,0,0.25)");
}

function monitor(p, x, y, w, h, on = true) {
  p.r(x, y, w, h, PAL.inkSoft);
  p.r(x + 1, y + 1, w - 2, h - 2, PAL.screen);
  if (on) {
    p.r(x + 1, y + 1, w - 2, h - 2, "#22404d");
    for (let i = 0; i < h - 3; i += 2) p.hr(x + 2, y + 2 + i, w - 4 - (i % 3), PAL.screenGlow);
    p.r(x + 1, y + 1, w - 2, 1, "rgba(127,211,232,0.5)");
  }
  p.r(x + Math.floor(w / 2) - 1, y + h, 2, 2, PAL.metalDk);
  p.r(x + Math.floor(w / 2) - 3, y + h + 2, 6, 1, PAL.metalDk);
}

const PROPS = {};

PROPS.desk_dual = (th) => {
  const p = new Painter(T, T);
  deskBase(p, th);
  monitor(p, 2, 6, 13, 9);
  monitor(p, 17, 6, 13, 9);
  p.r(9, 24, 14, 3, PAL.inkSoft); // keyboard
  for (let i = 0; i < 6; i++) p.r(10 + i * 2, 25, 1, 1, PAL.metal);
  p.r(25, 24, 3, 2, PAL.metalDk); // mouse
  p.r(3, 21, 4, 5, PAL.paper); // notepad
  p.r(3, 21, 4, 1, PAL.steel);
  return p;
};

PROPS.desk_laptop = (th) => {
  const p = new Painter(T, T);
  deskBase(p, th);
  p.r(8, 12, 16, 10, PAL.metalLt);
  p.r(9, 13, 14, 8, PAL.screen);
  p.r(9, 13, 14, 3, "#22404d");
  p.r(6, 22, 20, 3, PAL.metal);
  p.r(7, 23, 18, 1, PAL.metalDk);
  p.r(26, 19, 4, 5, PAL.paper); // coffee cup
  p.r(26, 19, 4, 1, PAL.red);
  p.r(2, 20, 5, 5, PAL.steelPale); // sticky notes
  p.r(3, 21, 3, 3, PAL.amber);
  return p;
};

PROPS.desk_drawings = (th) => {
  const p = new Painter(T, T);
  deskBase(p, th);
  // drawing spread flat on the desk, weighted down
  p.r(3, 13, 26, 13, PAL.paper);
  p.frame(3, 13, 26, 13, PAL.paperDim);
  for (let i = 0; i < 5; i++) p.hr(5, 15 + i * 2, 20 - i * 2, PAL.steelLt);
  p.line(5, 24, 26, 16, PAL.steel);
  p.frame(14, 17, 8, 5, PAL.red); // revision cloud stand-in
  p.r(24, 14, 5, 3, PAL.red);
  // rolled tubes leaning at the back
  p.r(1, 4, 4, 12, PAL.paperDim);
  p.r(5, 6, 4, 10, "#cfc8b6");
  p.r(1, 4, 4, 2, PAL.paper);
  return p;
};

PROPS.desk_empty = (th) => {
  const p = new Painter(T, T);
  deskBase(p, th);
  p.r(10, 16, 12, 9, shade(th.desk, 0.92)); // tucked-in chair back
  p.r(11, 17, 10, 7, PAL.metalDk);
  p.r(4, 20, 6, 4, PAL.paperDim);
  return p;
};

PROPS.desk_cdb = (th) => {
  const p = new Painter(T, T);
  deskBase(p, th);
  monitor(p, 4, 7, 14, 10);
  // hard hat parked on the desk
  p.ell(25, 20, 6, 4, PAL.hiVis);
  p.r(19, 20, 12, 1, PAL.hiVisDk);
  p.ell(25, 19, 4, 3, shade(PAL.hiVis, 1.08));
  // site photos taped up
  p.r(20, 5, 5, 5, PAL.paper);
  p.r(21, 6, 3, 3, "#8a9a7a");
  p.r(26, 8, 5, 5, PAL.paper);
  p.r(27, 9, 3, 3, PAL.steelLt);
  p.r(6, 22, 10, 3, PAL.inkSoft);
  return p;
};

PROPS.desk_exec = (th) => {
  const p = new Painter(T, T);
  deskBase(p, th, 18);
  p.r(1, 11, 30, 2, shade(th.desk, 1.2));
  // brass lamp
  p.r(4, 8, 7, 3, PAL.gold);
  p.r(7, 11, 1, 5, shade(PAL.gold, 0.8));
  p.r(5, 9, 5, 1, "#f0dca0");
  // leather blotter + pen set + closed laptop
  p.r(12, 16, 16, 8, "#3a2b22");
  p.r(13, 17, 14, 6, "#4a382c");
  p.r(14, 18, 10, 4, PAL.paper);
  p.r(26, 14, 4, 2, PAL.metalLt);
  return p;
};

PROPS.conf_table = (th) => {
  const p = new Painter(T, T);
  p.r(0, 6, T, 20, th.desk);
  p.r(0, 6, T, 3, shade(th.desk, 1.14));
  p.r(0, 23, T, 3, th.deskDk);
  p.r(0, 26, T, 2, "rgba(0,0,0,0.22)");
  p.r(6, 12, 20, 8, shade(th.desk, 1.05)); // inlay
  p.r(13, 13, 6, 6, PAL.inkSoft); // conference puck
  p.r(14, 14, 4, 4, PAL.metalDk);
  p.px(16, 15, PAL.red);
  return p;
};

PROPS.plan_table = (th) => {
  const p = new Painter(T, T);
  p.r(0, 5, T, 22, th.desk);
  p.r(0, 5, T, 2, shade(th.desk, 1.12));
  p.r(0, 25, T, 2, "rgba(0,0,0,0.22)");
  // site plan rolled out flat with markup
  p.r(2, 8, 28, 16, PAL.paper);
  p.frame(2, 8, 28, 16, PAL.paperDim);
  for (let i = 0; i < 4; i++) p.hr(4, 10 + i * 3, 24 - i * 2, PAL.steelLt);
  p.frame(6, 12, 10, 8, PAL.steel);
  p.line(4, 22, 28, 14, PAL.orange);
  p.r(20, 10, 8, 4, "rgba(232,112,26,0.25)");
  p.r(24, 20, 5, 3, PAL.hiVis);
  return p;
};

PROPS.plant_small = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 28, 8, 3);
  p.r(11, 21, 10, 8, "#9c6b45");
  p.r(11, 21, 10, 2, "#b58057");
  p.r(11, 27, 10, 2, "#7a5334");
  p.ell(16, 14, 9, 8, PAL.green);
  p.ell(13, 12, 5, 4, shade(PAL.green, 1.25));
  p.ell(19, 16, 4, 3, PAL.greenDk);
  p.line(16, 20, 16, 14, PAL.greenDk);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.plant_tall = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 7, 3);
  p.r(12, 22, 8, 8, "#8e6b4d");
  p.r(12, 22, 8, 2, "#a67f5c");
  // fiddle-leaf silhouette
  [[16, 6], [11, 11], [21, 10], [13, 17], [20, 17]].forEach(([x, y], i) => {
    p.ell(x, y, 5 - (i % 2), 4, i % 2 ? PAL.green : shade(PAL.green, 1.15));
  });
  p.vr(16, 10, 12, PAL.greenDk);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.plant_exec = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 28, 7, 3);
  p.r(12, 20, 9, 9, "#2b2b30");
  p.r(12, 20, 9, 2, "#3d3d44");
  p.vr(16, 10, 11, PAL.greenDk);
  p.ell(16, 9, 3, 3, "#e8dfe8");
  p.ell(13, 12, 2, 2, "#d8c8d8");
  p.ell(19, 13, 2, 2, "#d8c8d8");
  p.ell(14, 18, 4, 3, PAL.green);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.filing = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 9, 3);
  p.r(4, 6, 24, 23, PAL.metal);
  p.r(4, 6, 24, 2, PAL.metalLt);
  p.r(26, 8, 2, 21, PAL.metalDk);
  for (let i = 0; i < 3; i++) {
    p.frame(6, 9 + i * 7, 19, 6, PAL.metalDk);
    p.r(13, 11 + i * 7, 6, 2, PAL.metalLt);
  }
  p.r(8, 2, 12, 4, PAL.paper); // stacked binders on top
  p.r(8, 2, 4, 4, PAL.red);
  p.r(16, 2, 4, 4, PAL.steel);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.printer = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 10, 3);
  p.r(3, 10, 26, 18, PAL.paperDim);
  p.r(3, 10, 26, 3, "#e8e6e0");
  p.r(3, 25, 26, 3, PAL.metalDk);
  p.r(6, 14, 20, 6, PAL.inkSoft);
  p.r(7, 15, 18, 4, PAL.screen);
  p.r(8, 16, 4, 1, PAL.screenGlow);
  p.r(6, 21, 20, 3, PAL.paper); // output tray with a sheet
  p.r(22, 11, 5, 2, PAL.red); // error light
  p.r(9, 7, 14, 3, PAL.paper);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.plotter = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 12, 3);
  p.r(1, 9, 30, 14, PAL.metalLt);
  p.r(1, 9, 30, 2, "#ccd1d8");
  p.r(1, 21, 30, 3, PAL.metalDk);
  p.r(3, 12, 26, 5, PAL.inkSoft);
  p.r(4, 13, 24, 3, PAL.screen);
  // a drawing emerging from the slot
  p.r(4, 23, 24, 6, PAL.paper);
  for (let i = 0; i < 3; i++) p.hr(6, 24 + i * 2, 18 - i * 4, PAL.steelLt);
  p.r(2, 5, 6, 4, PAL.paperDim);
  p.r(24, 10, 4, 2, PAL.green);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.water_cooler = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 7, 3);
  p.r(10, 3, 12, 12, "rgba(143,208,255,0.55)");
  p.r(10, 3, 12, 2, "rgba(220,245,255,0.8)");
  p.r(19, 5, 2, 9, "rgba(90,150,190,0.5)");
  p.r(9, 15, 14, 14, "#e4e6e8");
  p.r(9, 15, 14, 2, PAL.paper);
  p.r(21, 17, 2, 12, PAL.paperDim);
  p.r(12, 19, 3, 3, PAL.steelDk);
  p.r(17, 19, 3, 3, PAL.red);
  p.r(11, 24, 10, 4, PAL.metalDk);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.coffee = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 10, 3);
  p.r(2, 16, 28, 13, "#b9ac96"); // counter
  p.r(2, 16, 28, 2, "#cfc3ac");
  p.r(2, 27, 28, 2, "rgba(0,0,0,0.25)");
  p.r(7, 4, 14, 12, PAL.inkSoft); // brewer
  p.r(8, 5, 12, 6, PAL.screen);
  p.r(9, 6, 4, 1, PAL.screenGlow);
  p.r(9, 12, 10, 4, "#6b4a2f"); // carafe
  p.r(10, 13, 8, 2, "#3f2a1a");
  p.r(22, 11, 4, 5, PAL.paper); // mugs
  p.r(22, 11, 4, 1, PAL.steel);
  p.r(26, 12, 4, 4, PAL.paper);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.fridge = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 9, 3);
  p.r(4, 2, 24, 27, "#dfe2e4");
  p.r(4, 2, 24, 2, PAL.paper);
  p.r(26, 4, 2, 25, PAL.paperDim);
  p.hr(4, 13, 24, PAL.metal);
  p.r(22, 6, 2, 6, PAL.metalDk);
  p.r(22, 15, 2, 6, PAL.metalDk);
  p.r(8, 4, 8, 6, PAL.paper); // kids' drawing magneted on
  p.r(9, 5, 6, 4, PAL.amber);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.microwave = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 9, 3);
  p.r(2, 16, 28, 13, "#b9ac96");
  p.r(2, 16, 28, 2, "#cfc3ac");
  p.r(4, 5, 24, 12, PAL.metalDk);
  p.r(5, 6, 16, 10, PAL.screen);
  p.r(6, 7, 14, 8, "#2b3a40");
  p.r(22, 7, 5, 3, PAL.red);
  p.r(22, 11, 5, 4, PAL.metal);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.whiteboard_free = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 30, 10, 2);
  p.r(2, 2, 28, 20, PAL.paper);
  p.frame(2, 2, 28, 20, PAL.metal);
  p.r(2, 21, 28, 2, PAL.metalLt);
  const rnd = mulberry(9);
  for (let i = 0; i < 6; i++) p.hr(5 + Math.floor(rnd() * 5), 5 + i * 2, 10 + Math.floor(rnd() * 10), i % 2 ? PAL.steel : PAL.inkSoft);
  p.line(18, 6, 27, 16, PAL.red);
  p.r(6, 23, 3, 6, PAL.metalDk);
  p.r(23, 23, 3, 6, PAL.metalDk);
  p.r(5, 28, 5, 2, PAL.metalDk);
  p.r(22, 28, 5, 2, PAL.metalDk);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.chair = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 7, 3);
  p.r(9, 6, 14, 11, PAL.inkSoft);
  p.r(10, 7, 12, 9, shade(PAL.metalDk, 1.15));
  p.r(8, 17, 16, 5, PAL.inkSoft);
  p.r(9, 18, 14, 3, shade(PAL.metalDk, 1.05));
  p.vr(16, 22, 4, PAL.metalDk);
  p.r(11, 26, 11, 2, PAL.metalDk);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.shelf = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 10, 3);
  p.r(3, 3, 26, 26, th.deskDk);
  p.r(4, 4, 24, 24, shade(th.desk, 0.85));
  [5, 13, 21].forEach((y, row) => {
    p.r(5, y, 22, 7, shade(th.desk, 0.7));
    for (let i = 0; i < 5; i++) {
      const c = [PAL.red, PAL.steel, PAL.green, PAL.amber, PAL.purple][(i + row) % 5];
      p.r(6 + i * 4, y + 1, 3, 6, c);
      p.r(6 + i * 4, y + 2, 3, 1, PAL.paper);
    }
  });
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.boxes = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 9, 3);
  p.r(4, 14, 15, 14, "#b49a72");
  p.r(4, 14, 15, 2, "#c9b089");
  p.r(10, 14, 3, 14, "#a08a66");
  p.r(17, 8, 13, 20, "#c0a67c");
  p.r(17, 8, 13, 2, "#d3bb92");
  p.r(22, 8, 3, 20, "#ab9169");
  p.r(6, 10, 10, 4, PAL.paper);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.cubicle_home = (th) => {
  // the player's own cubicle: partition walls, monitor, personal photo, plant
  const p = new Painter(T, T);
  p.r(0, 0, T, 8, shade(th.floorDk, 0.9)); // partition top edge
  p.r(0, 2, T, 6, "#9a9f9e");
  p.r(0, 2, T, 1, "#b4b8b6");
  deskBase(p, th, 13);
  monitor(p, 5, 8, 13, 9);
  p.r(20, 10, 7, 7, PAL.paper); // framed photo
  p.r(21, 11, 5, 5, PAL.steelLt);
  p.r(22, 13, 3, 3, PAL.amber);
  p.r(10, 24, 12, 3, PAL.inkSoft);
  p.r(27, 20, 4, 6, "#9c6b45");
  p.ell(29, 18, 3, 3, PAL.green);
  p.frame(0, 0, T, T, PAL.amber);
  return p;
};

PROPS.stairs = (th) => {
  const p = new Painter(T, T);
  p.r(0, 0, T, T, th.wallMd);
  for (let i = 0; i < 5; i++) {
    const y = 26 - i * 5;
    p.r(3 + i, y, 26 - i * 2, 5, shade(th.wall, 1 - i * 0.06));
    p.hr(3 + i, y, 26 - i * 2, PAL.paper);
    p.hr(3 + i, y + 4, 26 - i * 2, th.wallDk);
  }
  p.vr(2, 2, 28, th.wallDk);
  p.vr(29, 2, 28, th.wallDk);
  p.r(24, 3, 6, 5, PAL.green); // exit sign
  p.r(25, 4, 4, 3, PAL.paper);
  return p;
};

PROPS.elevator = (th) => {
  const p = new Painter(T, T);
  p.r(0, 0, T, T, th.wallMd);
  p.r(3, 4, 26, 25, PAL.metalDk);
  p.r(4, 5, 24, 23, PAL.metalLt);
  p.vr(16, 5, 23, PAL.metalDk);
  p.r(4, 5, 24, 2, PAL.metal);
  p.r(10, 0, 12, 4, PAL.inkSoft);
  p.r(12, 1, 8, 2, PAL.amber);
  p.r(29, 12, 2, 5, PAL.inkSoft);
  return p;
};

/* --- battle-object props (each fight site looks like its own joke) -------- */
PROPS.bo_whiteboard = (th) => {
  const p = PROPS.whiteboard_free(th);
  p.r(24, 3, 6, 6, PAL.red); // red-flag sticky
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_phone = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 28, 9, 3);
  p.r(4, 12, 24, 14, PAL.inkSoft);
  p.r(5, 13, 22, 10, "#3a3f48");
  p.ell(16, 18, 6, 5, PAL.metalDk);
  p.ell(16, 18, 4, 3, PAL.screen);
  [[7, 14], [7, 20], [25, 14], [25, 20]].forEach(([x, y]) => p.r(x, y, 3, 3, PAL.steel));
  p.r(10, 8, 12, 4, PAL.paper);
  p.r(11, 9, 10, 2, PAL.red);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_printer = (th) => {
  const p = PROPS.printer(th);
  // paper jam: crumpled sheets erupting out of the top
  p.r(6, 2, 8, 6, PAL.paper);
  p.r(14, 0, 7, 7, PAL.paper);
  p.line(7, 3, 13, 7, PAL.paperDim);
  p.line(15, 6, 20, 1, PAL.paperDim);
  p.r(22, 11, 5, 2, PAL.red);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_papers = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 28, 10, 3);
  for (let i = 0; i < 5; i++) {
    p.r(4 + (i % 2) * 2, 24 - i * 4, 22, 5, PAL.paper);
    p.frame(4 + (i % 2) * 2, 24 - i * 4, 22, 5, PAL.paperDim);
    p.hr(6 + (i % 2) * 2, 26 - i * 4, 12, PAL.steelLt);
  }
  p.r(20, 2, 8, 6, PAL.red); // red flag
  p.vr(20, 2, 10, PAL.inkSoft);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_cabinet = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 9, 3);
  p.r(4, 4, 24, 25, PAL.metal);
  p.r(4, 4, 24, 2, PAL.metalLt);
  p.vr(16, 6, 23, PAL.metalDk);
  p.r(13, 15, 2, 5, PAL.metalDk);
  p.r(17, 15, 2, 5, PAL.metalDk);
  // door ajar, supplies spilling
  p.r(18, 8, 9, 12, PAL.inkSoft);
  p.r(19, 9, 7, 10, "#d8cfae");
  p.r(20, 10, 5, 2, PAL.red);
  p.r(20, 13, 5, 2, PAL.steel);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_signup = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 29, 8, 2);
  p.r(6, 3, 20, 22, PAL.woodLt);
  p.r(7, 4, 18, 20, PAL.paper);
  for (let i = 0; i < 7; i++) {
    p.hr(9, 7 + i * 2, 14, PAL.paperDim);
    if (i < 5) p.hr(9, 7 + i * 2, 6 + i, PAL.steelDk);
  }
  p.r(7, 4, 18, 2, PAL.metal);
  p.r(22, 25, 4, 4, PAL.red);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_bid_board = (th) => {
  const p = new Painter(T, T);
  p.shadow(16, 30, 10, 2);
  p.r(1, 2, 30, 22, "#7d6a4f");
  p.r(2, 3, 28, 20, "#c9b189");
  const cells = [[3, 4], [11, 4], [19, 4], [3, 10], [11, 10], [19, 10], [3, 16], [11, 16], [19, 16]];
  cells.forEach(([x, y], i) => {
    p.r(x, y, 8, 5, PAL.paper);
    p.hr(x + 1, y + 1, 6, PAL.steelLt);
    p.hr(x + 1, y + 3, 4, PAL.steelLt);
    if (i % 4 === 0) p.r(x + 5, y, 3, 2, PAL.orange);
  });
  p.r(6, 24, 4, 6, PAL.metalDk);
  p.r(22, 24, 4, 6, PAL.metalDk);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.bo_boardroom = (th) => {
  const p = new Painter(T, T);
  p.r(0, 4, T, 24, PAL.walnut);
  p.r(0, 4, T, 3, shade(PAL.walnut, 1.25));
  p.r(0, 25, T, 3, "#2b1d13");
  p.r(4, 10, 24, 12, shade(PAL.walnut, 1.1));
  p.r(7, 12, 18, 8, "#5a4230");
  p.r(13, 14, 6, 4, PAL.gold);
  [[3, 7], [14, 7], [25, 7], [3, 23], [14, 23], [25, 23]].forEach(([x, y]) => {
    p.r(x, y, 4, 3, PAL.inkSoft);
  });
  return p;
};

PROPS.foodtruck = (th) => {
  // Visitor Day: a food truck parked in the lot, awning out.
  const p = new Painter(T, T);
  p.shadow(16, 29, 14, 3);
  p.r(1, 10, 30, 15, "#c94f3a");
  p.r(1, 10, 30, 3, "#e06a52");
  p.r(1, 21, 30, 4, "#a03c2b");
  p.r(4, 13, 14, 7, PAL.paperDim);
  p.r(5, 14, 12, 5, "#3a4a52");
  p.r(3, 6, 26, 4, PAL.hiVis);
  p.r(20, 12, 9, 9, "#8f3a2a");
  p.r(21, 14, 7, 3, PAL.paper);
  p.ell(7, 26, 4, 4, PAL.inkSoft);
  p.ell(25, 26, 4, 4, PAL.inkSoft);
  p.ell(7, 26, 2, 2, PAL.metal);
  p.ell(25, 26, 2, 2, PAL.metal);
  p.autoOutline(PAL.ink);
  return p;
};

PROPS.flowerbed = (th) => {
  const p = new Painter(T, T);
  p.r(0, 6, T, 22, "#6b5340");
  p.noise(0, 6, T, 22, "#57432f", 40, 12);
  p.r(0, 6, T, 2, "#7d6350");
  p.r(0, 26, T, 2, "rgba(0,0,0,0.2)");
  const cols = ["#d9536a", "#e2a13a", "#c9689c", "#e8d05a"];
  for (let i = 0; i < 7; i++) {
    const x = 3 + i * 4;
    const y = 12 + ((i * 5) % 10);
    p.vr(x, y, 5, PAL.greenDk);
    p.ell(x, y, 2, 2, cols[i % cols.length]);
    p.px(x, y, PAL.paper);
  }
  return p;
};

globalThis.WORLD_PROPS = PROPS;
globalThis.wallBand = wallBand;
globalThis.wallFace = wallFace;
globalThis.floorTile = floorTile;
globalThis.breakFloorTile = breakFloorTile;
globalThis.aoTile = aoTile;
