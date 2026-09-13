/* =============================================================================
   tools/bake.js — the whole art bake
   -----------------------------------------------------------------------------
   Run it from the design tool with:
     eval(await readFile('tools/art/lib.js'));
     eval(await readFile('tools/art/chars.js'));
     eval(await readFile('tools/art/world.js'));
     eval(await readFile('tools/art/pack.js'));
     eval(await readFile('tools/bake.js'));
     await bakeChars(); await bakeWorld();

   Outputs (generated, committed):
     src/art/atlas_chars.js   every character, 11 frames each
     src/art/atlas_world.js   floors, walls, wall elevations, furniture, props
     build/preview_*.png      flat sheets for eyeballing the art
   ========================================================================== */

globalThis.rosterFromData = function (data) {
  const { COWORKERS, VISITORS, CLIENTS, SITE_VISITS } = data;
  const roster = [];
  const add = (id, role, opts) => roster.push({ id, role, opts: opts || {} });

  // The player. Fixed steel polo — he should read as "you" at a glance.
  add("player", "engineer", { topColor: PAL.steel, forceLanyard: true });

  Object.keys(COWORKERS).forEach((id) => {
    const cw = COWORKERS[id];
    if (!cw || !cw.name) return;
    const role = roleOfTitle(cw.title || "");
    const opts = {};
    // portraitColor was V1's per-character identity; keep it as the shirt
    // color where the role's wardrobe actually has a shirt showing.
    if (["engineer", "admin", "pm"].includes(role) && cw.portraitColor) {
      opts.topColor = hexOf(cw.portraitColor);
    }
    add("npc_" + id, role, opts);
  });

  (VISITORS || []).forEach((v) => {
    const t = (v.title || "").toLowerCase();
    let role = "casual";
    if (/subcontractor/.test(t)) role = "construction";
    else if (/client/.test(t)) role = "client";
    const kid = /daughter|son|kid|child/.test(t) || /daughter|son/.test((v.name || "").toLowerCase());
    add("visitor_" + v.id, role, { kid, topColor: role === "casual" && v.portraitColor ? hexOf(v.portraitColor) : null });
  });

  (CLIENTS || []).forEach((c) => add("clientchar_" + c.id, "client", {}));

  Object.keys(SITE_VISITS || {}).forEach((siteKey) => {
    const site = SITE_VISITS[siteKey];
    (site.checkpoints || []).forEach((cp) => {
      const idl = (cp.id + " " + (cp.label || "") + " " + (cp.name || "")).toLowerCase();
      const role = /schedule|planner|sched/.test(idl) ? "pm" : "inspector";
      add(`checkpoint_${siteKey}_${cp.id}`, role, {});
    });
    const ct = site.clientTrailer;
    if (ct) add(`client_${siteKey}`, "client", {});
  });

  return roster;
};

globalThis.bakeChars = async function (data) {
  const roster = rosterFromData(data);
  const items = [];
  roster.forEach((entry) => {
    const spec = specFromId(entry.id, entry.role, entry.opts || {});
    if (entry.opts && entry.opts.topColor) spec.top = entry.opts.topColor;
    if (entry.opts && entry.opts.forceLanyard) spec.lanyard = true;
    for (let f = 0; f < CHAR_FRAME_COUNT; f++) {
      const p = new Painter(CW, CH);
      drawCharFrame(p, spec, f);
      items.push({ name: `${entry.id}_${f}`, painter: p });
    }
  });
  const pack = packAtlas(items, 22);
  await saveFile("src/art/atlas_chars.js", await emitAtlasModule("ART_CHARS", pack, "Character atlas: 11 frames per character (down/up/left x idle,stepA,stepB + 2 seated)."));
  await saveFile("build/preview_chars_atlas.png", pack.canvas);
  return { count: roster.length, frames: items.length, size: pack.canvas.width + "x" + pack.canvas.height };
};

globalThis.WORLD_TILE_LIST = function () {
  const items = [];
  const faceKinds = ["plain", "window", "board", "drawings", "sign", "tv", "art", "door", "glass", "elevator"];
  ["gfs", "cdb", "exec"].forEach((tn) => {
    const th = THEMES[tn];
    for (let v = 0; v < 3; v++) items.push({ name: `floor_${tn}_${v}`, painter: floorTile(th, v, 11 + v * 7) });
    items.push({ name: `break_${tn}`, painter: breakFloorTile(th, 5) });
    items.push({ name: `wall_${tn}_h`, painter: wallBand(th, true, false) });
    items.push({ name: `wall_${tn}_v`, painter: wallBand(th, false, true) });
    items.push({ name: `wall_${tn}_x`, painter: wallBand(th, true, true) });
    faceKinds.forEach((k, i) => {
      items.push({ name: `face_${tn}_${k}`, painter: wallFace(th, k, i + 1) });
      if (k === "window" || k === "drawings") {
        items.push({ name: `face_${tn}_${k}2`, painter: wallFace(th, k, i + 2) });
      }
    });
    Object.keys(WORLD_PROPS).forEach((pn) => {
      items.push({ name: `${pn}_${tn}`, painter: WORLD_PROPS[pn](th) });
    });
  });
  ["n", "s", "w", "e"].forEach((d) => items.push({ name: `ao_${d}`, painter: aoTile(d) }));
  return items;
};

globalThis.bakeEnemies = async function () {
  const items = [];
  Object.keys(ENEMY_ART).forEach((id) => {
    for (let f = 0; f < 2; f++) {
      const p = new Painter(EW, EH);
      ENEMY_ART[id](p, f);
      items.push({ name: `${id}_${f}`, painter: p });
    }
  });
  const pack = packAtlas(items, 8);
  await saveFile(
    "src/art/atlas_enemies.js",
    await emitAtlasModule("ART_ENEMIES", pack, "Enemy atlas: 2 idle frames per battle opponent (monsters, executives, clients, site hazards).")
  );
  await saveFile("build/preview_enemies_atlas.png", pack.canvas);
  return { frames: items.length, size: pack.canvas.width + "x" + pack.canvas.height };
};

globalThis.bakeSite = async function () {
  const items = [];
  Object.keys(SITE_THEMES).forEach((tn) => {
    const th = SITE_THEMES[tn];
    for (let v = 0; v < 3; v++) items.push({ name: `sground_${tn}_${v}`, painter: gravelTile(th, v, 21 + v * 9) });
    items.push({ name: `sconcrete_${tn}_0`, painter: concreteTile(th, 0, 31) });
    items.push({ name: `sconcrete_${tn}_1`, painter: concreteTile(th, 1, 41) });
    items.push({ name: `smud_${tn}`, painter: mudTile(th, 51) });
    items.push({ name: `shazard_${tn}`, painter: hazardTile(th, 61) });
    items.push({ name: `sfence_${tn}`, painter: fenceTile(th, "chain") });
    items.push({ name: `sjersey_${tn}`, painter: fenceTile(th, "jersey") });
    Object.keys(SITE_BIG).forEach((n) => items.push({ name: `sbig_${n}_${tn}`, painter: SITE_BIG[n](th) }));
    Object.keys(SITE_PROPS).forEach((n) => items.push({ name: `sprop_${n}_${tn}`, painter: SITE_PROPS[n](th) }));
  });
  const pack = packAtlas(items, 14);
  await saveFile(
    "src/art/atlas_site.js",
    await emitAtlasModule("ART_SITE", pack, "Site atlas: ground/barrier tiles plus construction equipment, per site theme.")
  );
  await saveFile("build/preview_site_atlas.png", pack.canvas);
  return { frames: items.length, size: pack.canvas.width + "x" + pack.canvas.height };
};

globalThis.bakeWorld = async function () {
  const items = WORLD_TILE_LIST();
  const pack = packAtlas(items, 16);
  await saveFile("src/art/atlas_world.js", await emitAtlasModule("ART_WORLD", pack, "World atlas: per-floor floors/walls/wall elevations + office furniture and props."));
  await saveFile("build/preview_world_atlas.png", pack.canvas);
  return { frames: items.length, size: pack.canvas.width + "x" + pack.canvas.height };
};
