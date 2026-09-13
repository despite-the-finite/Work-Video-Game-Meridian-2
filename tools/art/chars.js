/* =============================================================================
   tools/art/chars.js — the modular character system (bake time)
   -----------------------------------------------------------------------------
   One 24x32 frame grid, 11 frames per character:
     0-2   face down   (idle, step A, step B)
     3-5   face up
     6-8   face left   (right is the same frames flipped at runtime)
     9-10  seated typing (ambient desk workers)

   A character is a SPEC: skin / hair / top / bottom / shoes + role props
   (hard hat, hi-vis vest, lanyard, glasses, beard, tie, tablet, coffee,
   clipboard, badge). specFromId() derives one deterministically from the
   character's id + role, so the office reads as a crowd of individuals and
   an engineer never gets mistaken for a superintendent.
   ========================================================================== */

globalThis.CW = 24;
globalThis.CH = 32;

const TOPS_ENGINEER = ["#5980a6", "#4d7a6a", "#e6e4dd", "#7d6f9c", "#b5724a", "#476b8e"];
const TOPS_ADMIN = ["#6f5a94", "#4d7a8a", "#a8546a", "#5c6b8a"];
const SUITS = ["#2f3440", "#25313f", "#3a3a40", "#2b2b33"];
const TIES = ["#c2453f", "#5980a6", "#d8b45a", "#4d7a4a"];
const SLACKS = ["#39414e", "#4a4a52", "#2f3644", "#6b6350"];
const JEANS = ["#4a5f7d", "#5d6b7a", "#7a6a55", "#3f4a5c"];
const TEES = ["#c2453f", "#4d7a4a", "#e6e4dd", "#e2a13a", "#5980a6", "#a8546a"];

globalThis.roleOfTitle = function (title = "") {
  const t = title.toLowerCase();
  if (/coo|cfo|counsel|ceo|chief|president|board|vice president/.test(t)) return "exec";
  if (/executive assistant|assistant to|chief of staff|receptionist|coordinator/.test(t)) return "admin";
  if (/superintendent|field|craft|foreman|safety|construction manager|ironworker|millwright|welder/.test(t))
    return "construction";
  if (/estimator|scheduler|planner|project manager|program manager|controls|procurement|logistics/.test(t))
    return "pm";
  if (/client|owner|representative/.test(t)) return "client";
  if (/inspector|qa|qc|quality/.test(t)) return "inspector";
  return "engineer";
};

globalThis.specFromId = function (id, role, opts = {}) {
  const h = hashStr(id + "|" + role);
  const rnd = mulberry(h);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const spec = {
    role,
    skin: SKIN[Math.floor(rnd() * SKIN.length)],
    hair: HAIR[Math.floor(rnd() * HAIR.length)],
    hairStyle: Math.floor(rnd() * 6), // 0 bald/buzz .. 5 long
    beard: rnd() < 0.22,
    glasses: rnd() < 0.3,
    top: "#5980a6",
    bottom: pick(SLACKS),
    shoes: "#2e2a26",
    lanyard: false,
    hardhat: null,
    vest: false,
    tie: null,
    blazer: false,
    tablet: false,
    coffee: false,
    clipboard: false,
    badge: false,
    kid: !!opts.kid,
    scale: 1,
  };

  if (role === "engineer") {
    spec.top = pick(TOPS_ENGINEER);
    spec.lanyard = rnd() < 0.8;
    spec.coffee = rnd() < 0.3;
    spec.glasses = rnd() < 0.45;
  } else if (role === "construction") {
    spec.top = pick(["#4d6b8a", "#7a6a55", "#8a4a3a", "#5a6a5a"]);
    spec.vest = true;
    spec.hardhat = rnd() < 0.35 ? PAL.hatWhite : PAL.hiVis;
    spec.shoes = "#6b4a24";
    spec.bottom = pick(["#6b6350", "#4a4a52", "#5d6b7a"]);
    spec.clipboard = rnd() < 0.3;
  } else if (role === "pm") {
    spec.top = "#e6e4dd";
    spec.blazer = true;
    spec.blazerColor = pick(["#39414e", "#4a5260", "#5980a6", "#4d5a4a"]);
    spec.tablet = rnd() < 0.55;
    spec.lanyard = rnd() < 0.5;
  } else if (role === "exec") {
    spec.top = "#f2f2f3";
    spec.blazer = true;
    spec.blazerColor = pick(SUITS);
    spec.tie = pick(TIES);
    spec.shoes = "#1f1c1a";
    spec.bottom = spec.blazerColor;
  } else if (role === "admin") {
    spec.top = pick(TOPS_ADMIN);
    spec.lanyard = true;
    spec.hairStyle = 3 + Math.floor(rnd() * 3);
  } else if (role === "client") {
    spec.top = "#cdbb95";
    spec.blazer = true;
    spec.blazerColor = "#8a7a56";
    spec.hardhat = PAL.hatWhite;
    spec.badge = true;
    spec.bottom = "#5b5a52";
  } else if (role === "inspector") {
    spec.top = "#e6e4dd";
    spec.vest = true;
    spec.hardhat = PAL.hatWhite;
    spec.clipboard = true;
    spec.shoes = "#6b4a24";
  } else if (role === "casual") {
    spec.top = pick(TEES);
    spec.bottom = pick(JEANS);
    spec.shoes = pick(["#c2453f", "#e6e4dd", "#39414e"]);
    spec.lanyard = false;
  }

  if (opts.topColor) spec.top = opts.topColor;
  if (opts.hairColor) spec.hair = { base: opts.hairColor, sh: shade(opts.hairColor, 0.7) };
  if (opts.kid) {
    spec.top = pick(TEES);
    spec.bottom = pick(JEANS);
    spec.hairStyle = Math.max(1, spec.hairStyle);
    spec.beard = false;
    spec.glasses = rnd() < 0.2;
  }
  return spec;
};

/* --- body pieces ----------------------------------------------------------- */

function head(p, s, dir, y0) {
  const sk = s.skin;
  const cx = 12;
  // skull
  p.r(8, y0, 8, 8, sk.base);
  p.r(9, y0 - 1, 6, 1, sk.base);
  p.r(9, y0 + 8, 6, 1, sk.base);
  // cheek shading on the light-away side
  p.r(14, y0 + 1, 2, 7, sk.sh);
  if (dir === "left") {
    p.r(8, y0, 7, 8, sk.base);
    p.r(14, y0, 2, 8, "rgba(0,0,0,0)");
    p.r(13, y0 + 1, 2, 7, sk.sh);
    p.px(7, y0 + 4, sk.base); // nose
    p.px(7, y0 + 5, sk.sh);
  }
  // neck
  p.r(11, y0 + 9, 3, 2, sk.sh);

  if (dir === "down") {
    p.r(10, y0 + 4, 1, 2, PAL.ink);
    p.r(13, y0 + 4, 1, 2, PAL.ink);
    p.r(11, y0 + 7, 2, 1, sk.line); // mouth
    if (s.beard) {
      p.r(9, y0 + 6, 6, 3, s.hair.sh);
      p.r(11, y0 + 7, 2, 1, sk.line);
    }
    if (s.glasses) {
      p.frame(9, y0 + 3, 3, 3, PAL.inkSoft);
      p.frame(12, y0 + 3, 3, 3, PAL.inkSoft);
      p.px(15, y0 + 4, PAL.inkSoft);
    }
  } else if (dir === "left") {
    p.r(9, y0 + 4, 1, 2, PAL.ink);
    if (s.beard) p.r(8, y0 + 6, 5, 3, s.hair.sh);
    if (s.glasses) {
      p.frame(8, y0 + 3, 4, 3, PAL.inkSoft);
      p.px(12, y0 + 4, PAL.inkSoft);
    }
  }
  hair(p, s, dir, y0);
}

function hair(p, s, dir, y0) {
  const c = s.hair;
  const st = s.hairStyle;
  if (st === 0) {
    // buzz / thinning
    p.r(9, y0 - 1, 6, 2, c.sh);
    return;
  }
  p.r(8, y0 - 2, 8, 3, c.base);
  p.r(9, y0 - 3, 6, 1, c.base);
  p.r(8, y0 + 1, 1, 2, c.sh);
  p.r(15, y0 + 1, 1, 2, c.sh);
  if (st === 2) p.r(8, y0 - 1, 4, 2, c.sh); // side part
  if (st >= 3) {
    // longer: frames the face and covers the ears
    p.r(7, y0 - 1, 2, 6, c.base);
    p.r(15, y0 - 1, 2, 6, c.base);
    p.r(16, y0 + 1, 1, 3, c.sh);
  }
  if (st === 5) {
    // shoulder length
    p.r(6, y0 + 3, 2, 6, c.base);
    p.r(16, y0 + 3, 2, 6, c.sh);
  }
  if (dir === "up") {
    // back of the head — hair covers everything
    p.r(8, y0, 8, 7, c.base);
    p.r(8, y0 + 5, 8, 2, c.sh);
    if (st >= 3) p.r(7, y0, 10, 8, c.base), p.r(7, y0 + 5, 10, 3, c.sh);
  }
  if (dir === "left" && st >= 1) {
    p.r(13, y0 - 2, 4, 5, c.base);
    p.r(15, y0 + 1, 2, 4, c.sh);
  }
}

function torso(p, s, dir, y0, swing) {
  const top = s.top;
  const topSh = shade(top, 0.78);
  const w = dir === "left" ? 8 : 10;
  const x0 = dir === "left" ? 8 : 7;

  // arms behind the body
  const armC = s.blazer ? shade(s.blazerColor, 0.88) : topSh;
  if (dir === "left") {
    p.r(9, y0 + 2 + swing, 3, 6, armC);
    p.r(9, y0 + 8 + swing, 3, 2, s.skin.base);
  } else {
    p.r(x0 - 1, y0 + 2 - swing, 3, 6, armC);
    p.r(x0 + w - 2, y0 + 2 + swing, 3, 6, armC);
    p.r(x0 - 1, y0 + 8 - swing, 3, 2, s.skin.base);
    p.r(x0 + w - 2, y0 + 8 + swing, 3, 2, s.skin.base);
  }

  // shirt
  p.r(x0, y0, w, 10, top);
  p.r(x0 + w - 2, y0, 2, 10, topSh);

  if (s.blazer) {
    const b = s.blazerColor;
    const bs = shade(b, 0.8);
    p.r(x0, y0, 3, 10, b);
    p.r(x0 + w - 3, y0, 3, 10, bs);
    p.r(x0, y0, w, 1, b);
    if (dir === "down") {
      p.line(x0 + 3, y0 + 1, x0 + 4, y0 + 4, bs);
      p.line(x0 + w - 4, y0 + 1, x0 + w - 5, y0 + 4, bs);
    }
  }

  if (dir === "down") {
    // collar
    p.r(10, y0, 4, 1, PAL.paper);
    p.px(10, y0 + 1, PAL.paper);
    p.px(13, y0 + 1, PAL.paper);
    if (s.tie) {
      p.r(11, y0 + 1, 2, 1, s.tie);
      p.r(11, y0 + 2, 2, 5, s.tie);
      p.px(11, y0 + 7, shade(s.tie, 0.75));
    }
  } else if (dir === "up") {
    p.r(10, y0, 4, 1, shade(top, 0.7));
  }

  if (s.vest) {
    const v = PAL.hiVis;
    p.r(x0, y0 + 1, w, 9, v);
    p.r(x0 + w - 2, y0 + 1, 2, 9, PAL.hiVisDk);
    if (dir !== "up") {
      p.r(x0 + 1, y0 + 4, w - 2, 1, PAL.paperDim);
      p.r(x0 + 1, y0 + 7, w - 2, 1, PAL.paperDim);
      if (dir === "down") p.r(11, y0 + 1, 2, 9, shade(top, 0.9));
    } else {
      p.r(x0 + 1, y0 + 5, w - 2, 1, PAL.paperDim);
    }
  }

  if (s.lanyard && dir === "down") {
    p.line(10, y0 + 1, 11, y0 + 5, PAL.steelDk);
    p.line(13, y0 + 1, 12, y0 + 5, PAL.steelDk);
    p.r(11, y0 + 6, 3, 2, PAL.paper);
    p.px(12, y0 + 6, PAL.steel);
  }
  if (s.badge && dir === "down") {
    p.r(x0 + 1, y0 + 3, 3, 2, PAL.paper);
    p.px(x0 + 2, y0 + 4, PAL.red);
  }
}

function legs(p, s, dir, y0, stride) {
  const b = s.bottom;
  const bs = shade(b, 0.8);
  if (dir === "left") {
    p.r(10, y0, 3, 5 + stride, b);
    p.r(12, y0, 2, 5 - stride, bs);
    p.r(9, y0 + 5 + stride, 4, 2, s.shoes);
    p.r(12, y0 + 5 - stride, 4, 2, shade(s.shoes, 0.8));
  } else {
    p.r(8, y0, 3, 5 + stride, b);
    p.r(13, y0, 3, 5 - stride, bs);
    p.r(8, y0 + 5 + stride, 3, 2, s.shoes);
    p.r(13, y0 + 5 - stride, 3, 2, shade(s.shoes, 0.85));
  }
}

function hardhat(p, s, dir, y0) {
  if (!s.hardhat) return;
  const c = s.hardhat;
  const cs = shade(c, 0.78);
  p.r(8, y0 - 3, 8, 4, c);
  p.r(9, y0 - 4, 6, 1, c);
  p.r(14, y0 - 3, 2, 4, cs);
  p.r(6, y0 + 1, 12, 1, c); // brim
  p.r(6, y0 + 1, 12, 1, dir === "up" ? cs : c);
  if (dir !== "up") p.r(11, y0 - 4, 2, 5, shade(c, 1.08));
}

function handProps(p, s, dir, y0) {
  if (s.tablet && dir !== "up") {
    p.r(15, y0 + 5, 5, 6, PAL.inkSoft);
    p.r(16, y0 + 6, 3, 4, PAL.steelLt);
  }
  if (s.clipboard && dir !== "up") {
    p.r(4, y0 + 5, 5, 7, PAL.woodLt);
    p.r(5, y0 + 6, 3, 5, PAL.paper);
    p.r(5, y0 + 5, 3, 1, PAL.metal);
  }
  if (s.coffee && dir !== "up") {
    p.r(17, y0 + 7, 3, 4, PAL.paper);
    p.r(17, y0 + 7, 3, 1, PAL.paperDim);
    p.r(17, y0 + 9, 3, 1, PAL.steel);
  }
}

/* --- the 11 frames --------------------------------------------------------- */

globalThis.drawCharFrame = function (p, spec, frame) {
  const kid = spec.kid;
  const dirIdx = Math.min(2, Math.floor(frame / 3));
  const dir = ["down", "up", "left"][dirIdx];
  const phase = frame % 3;
  const seated = frame >= 9;

  // vertical layout — kids are two pixels shorter with a proportionally
  // bigger head, which is all it takes to read as a child next to an adult
  const headY = (kid ? 7 : 4) + (phase === 2 ? -1 : 0);
  const torsoY = headY + 11 - (kid ? 2 : 0);
  const legY = torsoY + 10;
  const swing = phase === 0 ? 0 : phase === 1 ? 1 : -1;
  const stride = phase === 0 ? 0 : phase === 1 ? 1 : -1;

  p.shadow(12, 30, kid ? 5 : 6, 2);

  if (seated) {
    const f = frame - 9;
    // office chair: back panel behind the shoulders, then the seat
    p.r(5, 18, 14, 9, shade(PAL.metalDk, 0.95));
    p.r(5, 18, 14, 1, PAL.metal);
    p.r(4, 26, 16, 2, PAL.metalDk);
    head(p, spec, "down", 7);
    torso(p, spec, "down", 18, 0);
    // forearms reaching a keyboard, alternating between the two frames
    p.r(6, 25 + f, 4, 2, spec.skin.base);
    p.r(14, 26 - f, 4, 2, spec.skin.base);
    hardhat(p, spec, "down", 7);
    p.autoOutline();
    return;
  }

  legs(p, spec, dir, legY, stride);
  torso(p, spec, dir, torsoY, swing);
  head(p, spec, dir, headY);
  hardhat(p, spec, dir, headY);
  handProps(p, spec, dir, torsoY);
  p.autoOutline();
};

globalThis.CHAR_FRAME_COUNT = 11;
