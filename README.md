# Donnell and McBurns: An EPC Epic — Version 2

A browser RPG about climbing the corporate ladder at an EPC (Engineering,
Procurement, Construction) company — built with [Phaser 3](https://phaser.io/),
no build step required.

**Version 2 is a graphical overhaul.** Gameplay, story, progression, XP, Bonus
Potential, job titles, battles, enemies, coworkers, site visits, change-order
mechanics, dialogue, controls and touch support are all carried over from V1
unchanged. What changed is everything you look at: a baked pixel-art library
in place of the old procedural blocks, four-direction animated characters,
dressed office floors, redesigned corporate monsters, a new battle
presentation, layered construction sites, and one UI system across every
screen. See **Art pipeline** below for how the art is produced.

You play **Karsh**, freshly promoted to Engineering Manager, working toward
Executive. Walk the office, fight in conference rooms and huddle spaces, run
site visits across five industries, and negotiate change orders with clients.

## Running it

No install, no build tool, no network. Phaser is vendored in `src/vendor/`,
the art ships as data URIs inside `src/art/atlas_*.js`, and everything else
is plain JS — so opening `index.html` in a browser is the whole setup,
offline included. (The two Barlow webfonts are the one online nicety; without
a connection the type falls back to condensed system faces and every layout
still holds.)

```
index.html
```

(If you're on a system with `python3`, `npx serve`, or similar, serving the
folder over `http://localhost` works too, but isn't required.)

The game is drawn at a fixed 640x480 internally and scaled up to fill the
browser window, keeping its 4:3 aspect — so it fills a desktop monitor and
a phone screen alike rather than sitting in a small box.

**Controls:** Hit any key at the title screen to start. Arrow keys / WASD to
move, `SPACE` to talk/interact/fight and to confirm menu choices, `H` to warp
back to your cubicle from anywhere in the office, arrow keys to navigate
battle menus and the cubicle's mode-select menu. The title and intro screens
play a small procedurally-synthesized beat; the intro also shows the full
controls legend.

**On a phone or tablet:** open the same page and on-screen controls appear —
a thumb pad plus `SPACE` and `H` buttons. The pad reads direction from where
your thumb sits, so you can slide between directions without lifting and hold
a corner to walk diagonally. In portrait the game sits above the controls; in
landscape they tuck into the letterbox bands beside the canvas. They stay
hidden on desktop, and on a touchscreen laptop until you actually touch the
screen.

## Opening ident

Every launch opens on the Entropic Labs logo and its sound (`src/media/entropic-ident.mp4`), played full-screen
by `src/ident.js` while the game loads underneath. A tap, click, Enter, Space or Escape
skips it; if the video can't load, the game simply starts. The logo has sound,
and browsers won't start sound before the player interacts, so when the browser
blocks it the screen first says "Tap to begin" (that tap also unlocks the game's
own audio). Add `?noident` to the URL to skip it while developing.

## What's in the game

- **Title & intro** — a title card over a drafting sheet of the plant you
  spend the game arguing about (storage tanks, a burning flare, a crane whose
  hook drifts on the line) and an offer-letter story beat setting up the
  promotion before you land in the office.
- **Three floors, three departments** — **GFS** is Engineering (the main
  office floor: desk pods, conference rooms, a break room). **CDB** is
  Construction (estimators, schedulers, construction managers). **EXEC** is
  the executive floor — private offices for the COO/CFO/General Counsel plus
  their secretaries at desks outside each door, and a boardroom. Nobody on
  EXEC will interact with you until you've made Director; the fights up
  there are deliberately much tougher than anything else in the game.
  Each floor is dressed differently, not just recolored: GFS gets grey
  carpet tile, dual-monitor workstations, drawings pinned to the walls and
  plotters; CDB gets warm flooring, hard hats parked on desks, site photos
  and plan tables; EXEC gets walnut plank, brass lamps, glass partitions,
  artwork and subdued light. Stairs connect GFS↔CDB and GFS↔EXEC, and the
  two GFS stairwells alternate between a staircase and an elevator lobby.
- **Your cubicle** — home base, on GFS's west wall. Interact with it to open
  a mode-select menu: Office, Site Visit (lists every unlocked site), Visitor
  Day, or PTO — the single hub for every mode.
- **Coworkers** — a large fictional cast across all three floors, each built
  from a modular character system: skin tone, hair, facial hair, glasses,
  shirt, jacket, tie, trousers, shoes, lanyard, hard hat, hi-vis vest,
  clipboard, tablet or coffee. Wardrobe is chosen deterministically from the
  character's id and their job title, so an engineer, a superintendent, a
  project manager, an executive and a client each read differently at a
  glance and always look the same across reloads. Everyone animates in four
  directions; a few wander a small loop, and a budget of desk workers sit
  typing at their monitors. Names appear as you get close, so a crowded floor
  stays readable.
- **Turn-based battles** — no random encounters. Every conference room and
  every former "solid" landmark room (stairs, restrooms, huddle rooms,
  utility, print/copy, etc.) is walkable and has one battle object inside —
  walk up and hit SPACE to fight. A handful of coworkers (the QA/QC manager,
  the client rep, a rival Engineering Manager from CDB, and the EXEC-floor
  big wigs) trigger a fight when their dialogue ends instead. Corporate-satire
  enemies, each drawn so the joke lands before you read the name: Scope Creep
  is a growing heap of contracts, sticky notes and revision clouds; the
  Reply-All Storm is a funnel of email windows and unread badges; the Deadline
  Wraith is a hooded ghost with a clock for a face trailing burning calendar
  pages; the Redline Barrage is a fan of marked-up drawings with pens hanging
  nib-down over it; the Schedule Slip is a cracked Gantt chart whose bars are
  sliding off the right edge. Site hazards and the executives get the same
  treatment. Fights open with an entrance animation, land hits with damage
  numbers and screen shake, and each menu slot has its own effect — a redline
  slash, an email barrage, an exploding Gantt chart, a change-order shield.
  Every fight still runs off the same six-slot menu —
  Attack, Overtime Push (5 MP), Special Attack (8 MP), Guard, Dodge, Flee.
  Guard reliably halves the next hit; Dodge is a coin flip to avoid it
  entirely. Client negotiations reskin those same six slots with
  change-order language rather than adding a separate system.
- **Promotion ladder** — leveling up advances your actual job title:
  Engineering Manager → Senior Engineering Manager → Director of
  Engineering → VP of Engineering → **Executive**. Every level up (however
  it's triggered) hands you a brief "note from the executives" congratulating
  you before you're back on the floor. Executive itself isn't unlocked by
  leveling — it's earned on the EXEC floor: a scripted "Performance Review"
  boss fight against the Regional Director (La Plata conference room, GFS,
  available at VP) confirms you're ready, then you have to beat all four
  EXEC-floor bosses (the COO, the CFO, General Counsel, and the Board) to
  actually win the promotion — and the game.
- **Bonus Potential** — a reputation score starting at 20, with flavor labels
  from "Not Bonus Eligible" to "Stock Options Mentioned Once." Maxing it out
  at 100 rolls over and queues a level up, same as XP overflow — but neither
  path applies until you get a change order approved on a site visit, so
  leveling needs progress in the office *and* on-site, not either alone.
  It cuts the other way too: losing a fight costs you Bonus Potential and
  offers Retry or Exit, and letting it bottom out at 0 is Game Over — your
  reputation is gone, and the run restarts.
- **Site visits** — six construction-site maps reached from your cubicle,
  spanning multiple industries: a processing facility, a food manufacturing
  plant, a T&D line rebuild, an oil & gas refinery turnaround, a bridge
  replacement, and a water treatment plant upgrade. Clear three checkpoints
  (Safety, Schedule, Quality) at each, survive hazard-zone encounters, then
  negotiate a change order with the client — winning it is what unlocks any
  level up you've queued up. Completing the first site (Meridian Phase 2)
  unlocks the other five in the cubicle's menu. Each site is built from its
  own equipment set — process vessels and pipe racks, stainless skids and
  chillers, lattice transmission towers, a fractionation column, plate
  girders on falsework, clarifier basins — over gravel, concrete and painted
  hazard zones, with steam, welding sparks, crane beacons and drifting dust.
  Safety, Schedule and Quality each carry their own color and marker.
- **Visitor Day** — a low-stakes bonus mode reached from your cubicle, set in
  a paved lot with planters and real food trucks rather than office carpet.
  Family give a
  one-time Bonus Potential boost plus a free heal; vendors give a repeatable
  heal plus a temporary "Well Fed" battle buff; subcontractors give a
  repeatable small Bonus Potential bump; clients give a bigger one-time
  Bonus Potential boost. Every visitor's title states their category
  (Vendor —, Subcontractor —, Client —) so they're easy to tell apart.
- **PTO** — take time off with Colleen and Indra from your cubicle. Fully
  restores HP/MP, at the cost of some Bonus Potential.
- **Sound** — synthesized live with the Web Audio API, no audio files. The
  title and intro play a short boom-bap beat, and each mode then gets its
  own ambient bed: mouse clicks, keyboard clatter and phone rings in the
  office; an excavator drone and truck backup beeps on site; elevator muzak
  on Visitor Day; surf and gulls on PTO.

## Project structure

```
index.html                  Entry point — boot/progress screen, then loads every script in order
src/
  vendor/phaser.min.js       Phaser 3.80.1, vendored so the game runs offline
  audio.js                   Title/intro beat + per-mode ambient sound (Web Audio API)
  touch.js                   On-screen phone/tablet controls — synthesizes the
                             same key events the scenes already listen for
  art/                       The V2 art layer
    palette.js               Every color, font stack and text style in the game
    ui.js                    The panel/gauge/prompt kit every screen is built from
    fx.js                    Damage numbers, shake, flashes, bursts, steam, beacons
    chars.js                 Character animation sets + facing helpers
    tiles.js                 Which baked tile/prop art goes where, per floor
    atlas_chars.js           GENERATED — character atlas (11 frames each)
    atlas_world.js           GENERATED — floors, walls, elevations, furniture
    atlas_enemies.js         GENERATED — battle opponents, 2 frames each
    atlas_site.js            GENERATED — site ground, barriers and equipment
  data/                      Plain-data config, no logic
    ranks.js                 Promotion ladder thresholds/titles + shared level-up growth
    bonus.js                 Bonus Potential scoring + labels
    coworkers.js              Coworker roster + dialogue, all three floors
    enemies.js / bosses.js    Battle-object/chat-triggered fights, EXEC-floor bosses, the Executive boss fight
    clients.js                Client negotiation "boss" data, one per site visit
    site_hazards.js           Random encounters specific to site visits, generic + industry-specific
    sitevisits.js              All six site visit maps, checkpoints, client trailers, unlock rules
    visitors.js                Visitor Day cast + lobby map
    floorplan.js                FLOORS.GFS / CDB / EXEC — maps, NPCs, battle objects, stairs, cubicle
  scenes/
    PreloadScene.js             Decodes the baked atlases behind a progress bar
    TitleScene.js               Title card + blueprint art ("Hit any key to play")
    IntroScene.js                Story beat + controls legend, between title and the game
    BootScene.js               Registers character animations + legacy texture aliases
    OfficeScene.js              The office overworld (any of the three floors)
    TransitionScene.js          Brief "Travelling to Site..."-style message between modes
    PromotionScene.js           "A note from the executives" screen shown on any level up
    SiteVisitScene.js           Site visit maps
    VisitorScene.js             Visitor Day lobby
    BattleScene.js              Shared turn-based battle engine (encounters, bosses, negotiations)
  main.js                       Phaser game config (640x480, scaled to fit the window) + global PLAYER_STATE
tools/                        Bake-time only — never shipped to the browser
  bake.js                     Runs the whole bake and writes src/art/atlas_*.js
  art/lib.js                  Pixel painter, palette, outline derivation, hashing
  art/chars.js                The modular character system
  art/world.js                Office floors, walls, wall elevations, furniture
  art/enemies.js              Corporate monsters, executives, clients, hazards
  art/site.js                 Construction ground, barriers and equipment
  art/pack.js                 Atlas packer + data-URI module emitter
```

## Art pipeline

V1 drew everything at runtime with Phaser's `Graphics` API. V2 keeps the
spirit of that — the art is still *authored as code*, and there are still no
loose image files to lose track of — but moves the drawing to bake time:

1. `tools/art/*.js` draw each sprite pixel by pixel on a canvas. A shared
   `autoOutline()` derives the 1px dark silhouette from the alpha channel,
   which is what gives every sprite in the game the same hand-drawn read.
2. `tools/art/pack.js` packs them into one sheet per family and emits a
   `src/art/atlas_*.js` module holding the PNG as a data URI plus a Phaser
   frame table.
3. `PreloadScene` decodes those data URIs and registers them as atlases.

The payoff over drawing at runtime: the art can be far more detailed without
costing boot time, sprites can animate, and each office floor composites into
a **single** render texture — a 72x26 floor is one draw call per frame instead
of ~1,900. The cost is that art changes require a rebake rather than a reload.

Walls still pick their orientation from their neighbours so a run reads as one
continuous line, but a wall whose south face looks into a room is now drawn as
a full elevation — windows, whiteboards, pinned drawings, artwork, doors — and
floor tiles pick up an ambient-occlusion edge where they meet one, which is
most of what removes the flat look.

## Deploying

This repository is the standalone Version 2 and is independently deployable.
It is a static site with no build step, so GitHub Pages can serve the
repository root as-is: **Settings → Pages → Source: Deploy from a branch →
Branch: `main` / `(root)`**.

Every asset reference in the project is relative (`src/...`), and the art is
embedded in the JS rather than fetched, so the game works unchanged from a
project-page subpath (`https://<user>.github.io/<repo>/`), from a custom
domain, or from a local `file://` page. Version 1 lives in its own repository
and is untouched by anything here.

## Status

Actively evolving. V2's focus was the presentation layer; the systems
underneath it are V1's and are deliberately unchanged. More coworkers, site
visits and story beats remain easy to add since everything is data-driven off
the files in `src/data/` — and new art is a matter of adding a painter in
`tools/art/` and rebaking.
