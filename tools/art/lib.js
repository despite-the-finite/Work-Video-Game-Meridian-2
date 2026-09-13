/* =============================================================================
   tools/art/lib.js — bake-time pixel-art helpers (Canvas2D)
   -----------------------------------------------------------------------------
   Runs at BAKE time only (never shipped to the browser). Everything draws on
   whole-pixel integer rects at 1:1, then `autoOutline()` derives the 1px dark
   silhouette outline from the alpha channel, which is what gives every sprite
   in the game the same hand-drawn 16-bit read.
   ========================================================================== */

globalThis.PAL = {
  // Industry design-system spine: steel accent on a light technical ground,
  // near-black ink. Everything else is derived so the whole game reads as one
  // palette rather than 40 unrelated hexes.
  ink: "#16181c",
  inkSoft: "#2b2f36",
  paper: "#f2f2f3",
  paperDim: "#d9dadd",
  steel: "#5980a6",
  steelDk: "#3c5c7d",
  steelLt: "#8fb0cd",
  steelPale: "#c3d3e2",

  // Floors / architecture
  carpetGfs: "#8e9aa6",
  carpetGfsDk: "#7d8994",
  carpetGfsLt: "#9ca8b4",
  carpetCdb: "#a89d88",
  carpetCdbDk: "#948a76",
  carpetCdbLt: "#b6ac98",
  carpetExec: "#4a3f42",
  carpetExecDk: "#3d3335",
  carpetExecLt: "#57494d",
  wallLt: "#e4e2dd",
  wallMd: "#c9c6bf",
  wallDk: "#8e8b84",

  // Furniture
  woodLt: "#b98a58",
  wood: "#8f6337",
  woodDk: "#5f4224",
  walnut: "#4e3career",
  metalLt: "#b9bec6",
  metal: "#8d939c",
  metalDk: "#5f656e",
  screen: "#1d2a33",
  screenGlow: "#7fd3e8",

  // Site / construction
  hiVis: "#f2c53d",
  hiVisDk: "#c79a18",
  orange: "#e8701a",
  orangeDk: "#b6520c",
  hatWhite: "#e8ecef",
  concrete: "#a5a39c",
  concreteDk: "#87857e",
  gravel: "#8f887c",
  gravelDk: "#756f64",
  rust: "#8a4a2a",
  pipe: "#9aa3ab",
  pipeDk: "#6e767e",
  green: "#4d7a4a",
  greenDk: "#36562f",
  sky: "#b9d3e0",

  // Signals
  red: "#c2453f",
  redDk: "#8e2f2b",
  amber: "#e2a13a",
  gold: "#d8b45a",
  purple: "#6f5a94",
  shadow: "rgba(0,0,0,0.22)",
};
// typo guard: keep walnut a real color
globalThis.PAL.walnut = "#4e3a26";

globalThis.SKIN = [
  { base: "#f2d3b3", sh: "#d9b189", line: "#9c7550" },
  { base: "#e0b48a", sh: "#c1906a", line: "#8a5f3f" },
  { base: "#c08a5c", sh: "#a06f45", line: "#6e462a" },
  { base: "#94603a", sh: "#77492b", line: "#4d2e1b" },
  { base: "#6b4327", sh: "#54321c", line: "#361e10" },
];

globalThis.HAIR = [
  { base: "#231d19", sh: "#15100d" },
  { base: "#4a3122", sh: "#301e14" },
  { base: "#6f4a28", sh: "#4c311a" },
  { base: "#a97c3f", sh: "#7c5828" },
  { base: "#d9c48a", sh: "#b09c63" },
  { base: "#8e9299", sh: "#6d7178" },
  { base: "#b04a2a", sh: "#82311a" },
];

/* --- tiny painter ---------------------------------------------------------- */
globalThis.Painter = class Painter {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.c = createCanvas(w, h);
    this.x = this.c.getContext("2d");
    this.x.imageSmoothingEnabled = false;
  }
  r(x, y, w, h, col) {
    this.x.fillStyle = col;
    this.x.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    return this;
  }
  px(x, y, col) {
    return this.r(x, y, 1, 1, col);
  }
  // horizontal pixel run
  hr(x, y, w, col) {
    return this.r(x, y, w, 1, col);
  }
  vr(x, y, h, col) {
    return this.r(x, y, 1, h, col);
  }
  // filled ellipse snapped to the pixel grid (no antialiasing)
  ell(cx, cy, rx, ry, col) {
    this.x.fillStyle = col;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const t = (y + 0.5 - cy) / ry;
      if (Math.abs(t) > 1) continue;
      const half = Math.sqrt(1 - t * t) * rx;
      const x0 = Math.round(cx - half);
      const x1 = Math.round(cx + half);
      this.x.fillRect(x0, y, Math.max(1, x1 - x0), 1);
    }
    return this;
  }
  // rounded rect with 1px clipped corners — the "soft but still square" shape
  // used for most props
  box(x, y, w, h, col, clip = 1) {
    this.r(x + clip, y, w - clip * 2, h, col);
    this.r(x, y + clip, w, h - clip * 2, col);
    return this;
  }
  line(x0, y0, x1, y1, col) {
    // Bresenham, 1px, no AA
    let dx = Math.abs(x1 - x0),
      dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1,
      sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0,
      y = y0;
    for (let i = 0; i < 512; i++) {
      this.px(x, y, col);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    return this;
  }
  frame(x, y, w, h, col) {
    this.hr(x, y, w, col);
    this.hr(x, y + h - 1, w, col);
    this.vr(x, y, h, col);
    this.vr(x + w - 1, y, h, col);
    return this;
  }
  // 50% checker dither between two colors — cheap texture/gradient
  dither(x, y, w, h, col, phase = 0) {
    this.x.fillStyle = col;
    for (let yy = 0; yy < h; yy++)
      for (let xx = 0; xx < w; xx++)
        if ((xx + yy + phase) % 2 === 0) this.x.fillRect(x + xx, y + yy, 1, 1);
    return this;
  }
  noise(x, y, w, h, col, n, seed) {
    const rnd = mulberry(seed);
    for (let i = 0; i < n; i++) {
      this.px(x + Math.floor(rnd() * w), y + Math.floor(rnd() * h), col);
    }
    return this;
  }
  shadow(cx, cy, rx, ry) {
    return this.ell(cx, cy, rx, ry, PAL.shadow);
  }
  clear() {
    this.x.clearRect(0, 0, this.w, this.h);
    return this;
  }
  // Derive a 1px outline around every opaque cluster. `inset` also darkens the
  // inner bottom edge, which reads as contact shading.
  autoOutline(col = PAL.ink) {
    const d = this.x.getImageData(0, 0, this.w, this.h);
    const a = new Uint8Array(this.w * this.h);
    for (let i = 0; i < a.length; i++) a[i] = d.data[i * 4 + 3] > 8 ? 1 : 0;
    this.x.fillStyle = col;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (a[y * this.w + x]) continue;
        const n =
          (x > 0 && a[y * this.w + x - 1]) ||
          (x < this.w - 1 && a[y * this.w + x + 1]) ||
          (y > 0 && a[(y - 1) * this.w + x]) ||
          (y < this.h - 1 && a[(y + 1) * this.w + x]);
        if (n) this.x.fillRect(x, y, 1, 1);
      }
    }
    return this;
  }
};

globalThis.mulberry = function (seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

// Stable string hash — same character always gets the same wardrobe, across
// reloads and across rebakes.
globalThis.hashStr = function (s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
};

globalThis.shade = function (hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * f)));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

globalThis.hexOf = function (num, fallback) {
  if (typeof num === "string") return num;
  if (typeof num !== "number") return fallback;
  return "#" + num.toString(16).padStart(6, "0");
};
