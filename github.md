repo: despite-the-finite/Work-Video-Game-Meridian-2
branch: main
path:

## Last sync

date: 2026-09-13T00:00:00Z
note: V2 graphical overhaul built in this workspace from the V1 source tree. The
  Version 2 repository was empty/uninitialized at read time, so the V1 tree
  (despite-the-finite/Work-Video-Game-Meridian) was used as the gameplay
  foundation, per the brief. No commits were pushed from here — GitHub access
  in this environment is read-only.

### Updated in this project

- New baked pixel-art pipeline (`tools/art/`, `src/art/atlas_*.js`) replacing runtime `Graphics` art.
- Modular animated character system; office floors, enemies and site visits redrawn.
- One UI kit (`src/art/ui.js`) applied to every screen; new effects layer (`src/art/fx.js`).
- Gameplay, data files and save/progression logic carried over from V1 unchanged.

## Screen map

| Screen | Built from |
| --- | --- |
| Preload / art registration | `src/scenes/PreloadScene.js`, `src/art/atlas_*.js` |
| Title card | `src/scenes/TitleScene.js` |
| Intro / offer letter | `src/scenes/IntroScene.js` |
| Office floors (GFS / CDB / EXEC) | `src/scenes/OfficeScene.js`, `src/art/tiles.js`, `src/data/floorplan.js` |
| Battles | `src/scenes/BattleScene.js`, `src/data/enemies.js`, `bosses.js`, `clients.js`, `site_hazards.js` |
| Site visits | `src/scenes/SiteVisitScene.js`, `src/data/sitevisits.js` |
| Visitor Day | `src/scenes/VisitorScene.js`, `src/data/visitors.js` |
| Transition / promotion | `src/scenes/TransitionScene.js`, `src/scenes/PromotionScene.js` |
| Touch controls | `index.html`, `src/touch.js` |
