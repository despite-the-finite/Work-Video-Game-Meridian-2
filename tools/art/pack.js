/* =============================================================================
   tools/art/pack.js — atlas packer + JS module emitter (bake time)
   -----------------------------------------------------------------------------
   Packs a list of { name, painter } into one PNG, then writes a shipped module
   that carries the PNG as a data URI plus a Phaser JSONHash frame table. Data
   URI (not a .png file) so the game still runs from a bare file:// page with
   no server and no CORS problems — the V1 property worth keeping.
   ========================================================================== */

globalThis.packAtlas = function (items, perRow) {
  const maxW = Math.max(...items.map((i) => i.painter.w));
  const maxH = Math.max(...items.map((i) => i.painter.h));
  const cols = perRow || Math.ceil(Math.sqrt(items.length * (maxH / maxW)));
  const rows = Math.ceil(items.length / cols);
  const canvas = createCanvas(cols * maxW, rows * maxH);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const frames = {};
  items.forEach((item, i) => {
    const cx = (i % cols) * maxW;
    const cy = Math.floor(i / cols) * maxH;
    ctx.drawImage(item.painter.c, cx, cy);
    frames[item.name] = {
      frame: { x: cx, y: cy, w: item.painter.w, h: item.painter.h },
      sourceSize: { w: item.painter.w, h: item.painter.h },
      spriteSourceSize: { x: 0, y: 0, w: item.painter.w, h: item.painter.h },
      rotated: false,
      trimmed: false,
    };
  });
  return { canvas, frames, cols, rows, cellW: maxW, cellH: maxH };
};

globalThis.canvasToDataURI = async function (canvas) {
  if (typeof canvas.toDataURL === "function") return canvas.toDataURL("image/png");
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
};

globalThis.emitAtlasModule = async function (varName, pack, note) {
  const uri = await canvasToDataURI(pack.canvas);
  return (
    `// GENERATED FILE — do not edit by hand.\n` +
    `// ${note}\n` +
    `// Rebake with tools/bake.js (see tools/README.md). ${pack.canvas.width}x${pack.canvas.height}px,\n` +
    `// ${Object.keys(pack.frames).length} frames, shipped as a data URI so file:// still works.\n` +
    `const ${varName}_JSON = ${JSON.stringify({ frames: pack.frames, meta: { scale: 1 } })};\n` +
    `const ${varName}_PNG = "${uri}";\n`
  );
};
