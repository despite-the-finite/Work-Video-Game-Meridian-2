# Art bake tools

Bake-time only. Nothing in this folder is loaded by the game — it produces the
`src/art/atlas_*.js` modules that are.

## Why bake at all

V1 drew every sprite at runtime with Phaser's `Graphics` API. That kept the
project free of loose image files, which was worth keeping, but it capped how
detailed the art could get (boot time) and made animation impractical.

V2 keeps the art authored as code but moves the drawing offline. The output is
still a single self-contained JS file per atlas — the PNG is embedded as a data
URI — so the game still runs from a bare `file://` page with no server, no
CORS, and no missing-image failure mode.

## Running a bake

The tools are plain scripts that expect a browser-ish environment with a
canvas, `readFile`/`saveFile` helpers, and no module system. Load them in
order, then call the bake functions:

```js
eval(await readFile('tools/art/lib.js'));      // painter, palette, outlining
eval(await readFile('tools/art/chars.js'));    // character system
eval(await readFile('tools/art/world.js'));    // office tiles + furniture
eval(await readFile('tools/art/enemies.js'));  // battle opponents
eval(await readFile('tools/art/site.js'));     // construction sites
eval(await readFile('tools/art/pack.js'));     // atlas packer + emitter
eval(await readFile('tools/bake.js'));

// characters need the game's own data files for the roster
await bakeWorld();
await bakeEnemies();
await bakeSite();
await bakeChars({ COWORKERS, VISITORS, CLIENTS, SITE_VISITS });
```

Each bake writes its `src/art/atlas_*.js` module and a flat `build/preview_*`
sheet you can eyeball without launching the game.

## The house style

Every painter follows the same rules, which is what keeps 300-odd sprites
looking like one game:

- **Whole pixels only.** Draw on integer rects at 1:1; never scale at bake time.
- **Outline last.** `p.autoOutline()` derives a 1px dark silhouette from the
  alpha channel. Call it at the end of anything that stands on the floor
  (characters, props, enemies) and skip it for tiles that must butt seamlessly
  against their neighbours (floors, walls, ground).
- **One palette.** Colors come from `PAL` in `lib.js`, which mirrors
  `src/art/palette.js`. Don't introduce a hex inline.
- **Deterministic variation.** Anything that should look varied but stable —
  wardrobe, floor fleck, which desk pod appears where — is hashed from a
  stable key (`hashStr`, `mulberry`, `TILES.hash`), never `Math.random()`.
- **Shadow and a light edge.** A contact shadow under an object and a lighter
  top edge on it do most of the work of making a flat tile read as a thing
  sitting in a room.

## Files

| File | What it draws |
| --- | --- |
| `art/lib.js` | The `Painter` (rects, runs, ellipses, dither, noise, Bresenham lines), `PAL`/`SKIN`/`HAIR`, `autoOutline`, hashing helpers |
| `art/chars.js` | The modular character system: 11 frames per character (down/up/left × idle+2 steps, plus 2 seated typing), assembled from body, hair, wardrobe and role props. `specFromId()` derives a look from an id + role |
| `art/world.js` | Per-floor office art: carpet/vinyl, plan-view walls, full wall elevations (windows, whiteboards, drawings, artwork, doors, glass, elevators), desks, plants, printers, plotters, filing, coffee, break-room fixtures, battle objects |
| `art/enemies.js` | Battle opponents at 112×120, two idle frames each. Abstract monsters are assembled from office paperwork; humans share one `bust()` builder; site hazards share a yellow-black chevron band |
| `art/site.js` | Six site themes: gravel/concrete/mud/hazard ground, chain-link and jersey barriers, 32×32 yard props, and 64×64 equipment (vessels, pipe racks, steel frames, cranes, trailers, skids, towers, columns, girders, clarifiers) |
| `art/pack.js` | Packs painters into one sheet and emits the shipped `atlas_*.js` module |
| `bake.js` | The bake entry points, plus `rosterFromData()` which turns the game's own coworker/visitor/client/site data into the character roster |

## Adding art

1. Write a painter in the matching `tools/art/*.js` file, returning a
   `Painter`.
2. Register it — props are picked up automatically from `WORLD_PROPS` /
   `SITE_PROPS` / `ENEMY_ART`; tiles need an entry in `bake.js`.
3. Rebake, and look at the `build/preview_*.png` sheet.
4. If the game needs to choose it situationally, add the rule to
   `src/art/tiles.js` (office) or the theme map in `SiteVisitScene` (sites) —
   the *runtime* decides which frame goes where; the bake only draws it.
