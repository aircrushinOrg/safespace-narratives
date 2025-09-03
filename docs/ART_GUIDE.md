# Art Direction & Asset Pipeline

Goal: A modern, inviting campus-life vibe for STI education — warm, inclusive, and approachable. Think cozy contemporary 2D top‑down (slight 3/4), clean geometry, soft gradients, and readable UI. Avoid harsh pixelation unless chosen deliberately.

Visual Pillars
- Palette: Warm neutrals + optimistic accents. Example: base greens/teals for campus, pink/coral for interaction highlights, soft off‑white panels.
- Readability: Strong foreground/background separation, clear hotspots, minimal noise.
- Inclusivity: Diverse characters (skin tones, hairstyles, mobility aids), neutral clothing colors with accent variants.
- Consistency: One perspective (top‑down 3/4), one tile size, one outline rule (none or subtle), and consistent lighting direction.

Technical Specs
- Perspective: Top‑down 3/4.
- Tile size: Pick one and stick to it (recommended 32×32 for modern clarity; 16×16 if going styled pixelart).
- Character sheets: 48×64 or 64×64 per frame (headroom for hair/props). Animations: idle(4), walk(8), talk(4), interact(4).
- UI density: 8‑pt spacing grid; min 44px touch targets.
- Fonts: Pair a humanist sans for body with a friendly display (e.g., Inter + Nunito). Keep line-height 1.3–1.5.

Folders (drop assets here)
- public/assets/tiles: tilesets (PNG) + Tiled TSX/collection.
- public/assets/maps: Tiled JSON maps.
- public/assets/characters: sprite sheets + atlases.
- public/assets/ui: icons, 9‑slice panels, buttons.
- public/assets/audio: SFX (walk/interaction/ambient), music.

Tools
- Map editing: Tiled (JSON export). Set tile size to your chosen grid (e.g., 32×32). Use layers: ground, detail, collision.
- Sprite editing: Aseprite (export sprite sheets + JSON), or Spine/DragonBones if you go skeletal.
- Texture atlas: Shoebox/Free Texture Packer (power‑of‑two if targeting low‑end devices).

Phaser Integration Plan
1) Tilemap world
   - Export from Tiled as JSON → `public/assets/maps/campus.json`.
   - Tileset image → `public/assets/tiles/campus.png`.
   - Layers: `Ground`, `Detail`, `Collision`. Mark collision tiles with a custom property `collide=true`.
   - GameScene: load tilemap + tileset, create layers, set world bounds from map size, and set collisions from `Collision` layer.

2) Character sheets
   - Export sheets: `characters/player.png` + JSON or uniform frame size.
   - Define animations in PreloadScene after load: `player-idle`, `player-walk`, `player-talk`.
   - Swap current placeholder images to the loaded sprite sheet frames.

3) UI polish
   - Use 9‑slice panels for HUD/dialog.
   - Color system: semantic vars (Primary, Accent, Danger, Surface, Backdrop) mirrored in Tailwind tokens.
   - Add small motion: 150–250ms ease-in-out for hover, 400–600ms for subtle ambient floats.

Recommended Asset Sources (CC0/free‑friendly)
- Kenney (CC0): Topdown/Platformer/City packs for tiles, props, UI.
- Ansimuz / CraftPix (mixed licenses): modern tiles and characters if you can license.
- Google Fonts: Inter, Nunito, Noto.

Naming Conventions
- Tilesets: `tiles/campus_v01.png` (increment versions).
- Maps: `maps/campus_v01.json`.
- Characters: `characters/player_base_v01.png` (variants: `_skin2`, `_outfit_red`).
- UI: `ui/panel_9slice_v01.png`, `ui/icon_interact.png`.

Hand‑off Checklist
- Export sizes match grid.
- Transparent backgrounds for sprites.
- Trim whitespace; pad via frame size if needed.
- Consistent pivot points (feet for top‑down).

Roadmap
1) Decide style (32px tile clean vs 16px pixelart).
2) Build a small vertical slice map (100×100 tiles) in Tiled.
3) Replace placeholder characters with one finished sheet.
4) Swap UI to 9‑slice panels and a cohesive icon set.
5) Add ambience: campus ambient loop, interaction SFX, day/night tint.

