import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogManager } from '../managers/DialogManager';
import { InputManager } from '../managers/InputManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private dialogManager!: DialogManager;
  private inputManager!: InputManager;
  private scenarioCallback?: (scenarioId: string) => void;
  private interactionZones!: Phaser.Physics.Arcade.Group;
  private worldWidth: number = 0;
  private worldHeight: number = 0;
  private interactBtn?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Define a world larger than the viewport for camera scrolling
    const { width, height } = this.sys.game.canvas;
    this.worldWidth = Math.floor(width * 2);
    this.worldHeight = Math.floor(height * 2);
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Create stylized campus background
    this.createStyledCampusBackground(this.worldWidth, this.worldHeight);

    // Add atmospheric elements
    this.createAtmosphere();
    
    this.createPlayer();
    
    // Configure camera to follow the player and zoom out slightly
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setZoom(0.75);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.createNPCs();
    this.setupManagers();
    this.setupCollisions();
    this.createUI();
  }

  private createStyledCampusBackground(width: number, height: number): void {
    // Pixel-art campus: grass, paths with shifted intersections, and buildings
    const tile = 16;
    const cols = Math.ceil(width / tile);
    const rows = Math.ceil(height / tile);

    const g = this.add.graphics();
    g.setDepth(-100);

    const grassPalette = [0x2f6b2f, 0x2a5a27, 0x356f34];
    const dirtPalette = [0x8b5a2b, 0x7a4b23, 0xa47148];

    // Path layout: two horizontals and two verticals (moved intersections)
    const hRows = [Math.floor(rows * 0.35), Math.floor(rows * 0.65)];
    const vCols = [Math.floor(cols * 0.25), Math.floor(cols * 0.75)];
    const pathThickness = 3; // tiles

    // Central quad ring (rectangular walkway around green)
    const quad = {
      left: Math.floor(cols * 0.42),
      right: Math.floor(cols * 0.58),
      top: Math.floor(rows * 0.44),
      bottom: Math.floor(rows * 0.56),
      t: 2
    };

    const isOnQuadRing = (c: number, r: number) => (
      (c >= quad.left && c <= quad.right && (Math.abs(r - quad.top) <= quad.t || Math.abs(r - quad.bottom) <= quad.t)) ||
      (r >= quad.top && r <= quad.bottom && (Math.abs(c - quad.left) <= quad.t || Math.abs(c - quad.right) <= quad.t))
    );

    const isPath = (c: number, r: number) => {
      const inH = hRows.some(hr => r >= hr - pathThickness && r <= hr + pathThickness);
      const inV = vCols.some(vc => c >= vc - pathThickness && c <= vc + pathThickness);
      return inH || inV || isOnQuadRing(c, r);
    };

    // Paint ground tiles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tile;
        const y = r * tile;
        if (isPath(c, r)) {
          g.fillStyle(dirtPalette[(c + r) % dirtPalette.length], 1);
          g.fillRect(x, y, tile, tile);
        } else {
          g.fillStyle(grassPalette[(c + r) % grassPalette.length], 1);
          g.fillRect(x, y, tile, tile);
        }
      }
    }

    // Path edge highlights
    const edge = this.add.graphics();
    edge.setDepth(-95);
    edge.fillStyle(0xC2A386, 0.5);
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (!isPath(c, r)) continue;
        const x = c * tile;
        const y = r * tile;
        if (!isPath(c - 1, r)) edge.fillRect(x, y, 2, tile); // left
        if (!isPath(c + 1, r)) edge.fillRect(x + tile - 2, y, 2, tile); // right
        if (!isPath(c, r - 1)) edge.fillRect(x, y, tile, 2); // top
        if (!isPath(c, r + 1)) edge.fillRect(x, y + tile - 2, tile, 2); // bottom
      }
    }

    // More realistic pixel buildings with borders, roofs, doors, windows, shadows
    const drawBuilding = (cx: number, cy: number, wTiles: number, hTiles: number, base: number, roof: number, window: number) => {
      const bx = cx * tile;
      const by = cy * tile;
      const bw = wTiles * tile;
      const bh = hTiles * tile;

      // Determine entrance side by nearest path row/col
      const centerCol = cx + Math.floor(wTiles / 2);
      const centerRow = cy + Math.floor(hTiles / 2);
      const nearestH = hRows.reduce((prev, hr) => Math.abs(hr - centerRow) < Math.abs(prev - centerRow) ? hr : prev, hRows[0]);
      const nearestV = vCols.reduce((prev, vc) => Math.abs(vc - centerCol) < Math.abs(prev - centerCol) ? vc : prev, vCols[0]);
      const distH = Math.abs(nearestH - centerRow);
      const distV = Math.abs(nearestV - centerCol);
      const entrance: 'north' | 'south' | 'west' | 'east' = distH < distV ? (nearestH < centerRow ? 'north' : 'south') : (nearestV < centerCol ? 'west' : 'east');

      const b = this.add.graphics();
      b.setDepth(-90);

      // Drop shadow (bottom-right)
      b.fillStyle(0x000000, 0.25);
      b.fillRect(bx + 2, by + 2, bw, bh);

      // Main body
      b.fillStyle(base, 1);
      b.fillRect(bx, by, bw, bh);

      // Border outline
      const border = 0x1a1a1a;
      b.fillStyle(border, 1);
      b.fillRect(bx, by, bw, 1); // top
      b.fillRect(bx, by + bh - 1, bw, 1); // bottom
      b.fillRect(bx, by, 1, bh); // left
      b.fillRect(bx + bw - 1, by, 1, bh); // right

      // Roof cap
      b.fillStyle(roof, 1);
      b.fillRect(bx + 1, by + 1, bw - 2, 3);
      // Roof shading band
      b.fillStyle(Phaser.Display.Color.IntegerToColor(roof).darken(10).color, 1);
      b.fillRect(bx + 1, by + 4, bw - 2, 2);

      // Windows grid (even spacing, margins)
      const marginX = 6;
      const marginY = 7;
      const stepX = 12;
      const stepY = 10;
      b.fillStyle(window, 1);
      for (let wy = by + marginY; wy < by + bh - marginY; wy += stepY) {
        for (let wx = bx + marginX; wx < bx + bw - marginX; wx += stepX) {
          b.fillRect(wx, wy, 4, 4);
          // window sill
          b.fillStyle(0x222222, 1);
          b.fillRect(wx, wy + 4, 4, 1);
          b.fillStyle(window, 1);
        }
      }

      // Entrance door + steps on chosen side
      const doorW = Math.max(6, Math.floor(bw * 0.12));
      const doorColor = 0x3b2f2f;
      const stepColor = 0xc2a386;
      if (entrance === 'south') {
        const dx = bx + Math.floor((bw - doorW) / 2);
        const dy = by + bh - 9;
        b.fillStyle(doorColor, 1); b.fillRect(dx, dy, doorW, 8);
        b.fillStyle(stepColor, 1); b.fillRect(dx - 2, dy + 8, doorW + 4, 2);
      } else if (entrance === 'north') {
        const dx = bx + Math.floor((bw - doorW) / 2);
        const dy = by + 3;
        b.fillStyle(doorColor, 1); b.fillRect(dx, dy, doorW, 8);
        b.fillStyle(stepColor, 1); b.fillRect(dx - 2, dy - 2, doorW + 4, 2);
      } else if (entrance === 'west') {
        const dx = bx + 2;
        const dy = by + Math.floor(bh / 2) - 4;
        b.fillStyle(doorColor, 1); b.fillRect(dx, dy, 8, 8);
        b.fillStyle(stepColor, 1); b.fillRect(dx - 2, dy + 2, 2, 4);
      } else { // east
        const dx = bx + bw - 10;
        const dy = by + Math.floor(bh / 2) - 4;
        b.fillStyle(doorColor, 1); b.fillRect(dx, dy, 8, 8);
        b.fillStyle(stepColor, 1); b.fillRect(dx + 8, dy + 2, 2, 4);
      }

      // Roof details: vents
      b.fillStyle(0x2b2b2b, 1);
      b.fillRect(bx + 6, by + 2, 3, 2);
      b.fillRect(bx + bw - 9, by + 2, 3, 2);
    };

    // Place buildings around campus edges and near quad
    drawBuilding(2, 2, Math.max(6, Math.floor(cols * 0.15)), Math.max(5, Math.floor(rows * 0.12)), 0x5b6d7a, 0x3e4a52, 0xcfe8ff); // Library TL
    drawBuilding(cols - Math.max(8, Math.floor(cols * 0.18)) - 2, 2, Math.max(8, Math.floor(cols * 0.18)), Math.max(5, Math.floor(rows * 0.12)), 0x7a5b5b, 0x4e3a3a, 0xfff2cf); // Lab TR
    drawBuilding(2, rows - Math.max(6, Math.floor(rows * 0.16)) - 2, Math.max(7, Math.floor(cols * 0.16)), Math.max(6, Math.floor(rows * 0.16)), 0x6b7a5b, 0x4a523e, 0xe8ffd1); // Dorm BL
    drawBuilding(cols - Math.max(7, Math.floor(cols * 0.14)) - 2, rows - Math.max(6, Math.floor(rows * 0.15)) - 2, Math.max(7, Math.floor(cols * 0.14)), Math.max(6, Math.floor(rows * 0.15)), 0x5b5b7a, 0x3e3e4e, 0xdcdcff); // Admin BR

    // Central hall near the quad (top side)
    drawBuilding(Math.floor(cols * 0.44), Math.floor(rows * 0.40), Math.floor(cols * 0.12), 4, 0x7a6b5b, 0x4e3f33, 0xffe6cf);

    // Quad fountain at center
    const fx = Math.floor((quad.left + quad.right) / 2) * tile;
    const fy = Math.floor((quad.top + quad.bottom) / 2) * tile;
    const fountain = this.add.graphics();
    fountain.setDepth(-91);
    fountain.fillStyle(0x2e86c1, 1);
    fountain.fillRect(fx - 8, fy - 8, 16, 16);
    fountain.fillStyle(0xffffff, 0.6);
    fountain.fillRect(fx - 2, fy - 6, 4, 12);

    // Pixel bushes/trees sprinkled
    const deco = this.add.graphics();
    deco.setDepth(-92);
    for (let i = 0; i < 20; i++) {
      const cx = Math.floor(Math.random() * cols);
      const cy = Math.floor(Math.random() * rows);
      if (isPath(cx, cy)) continue;
      const x = cx * tile;
      const y = cy * tile;
      // trunk
      deco.fillStyle(0x5a3a1e, 1);
      deco.fillRect(x + 6, y + 8, 4, 6);
      // leaves
      deco.fillStyle(0x2e8b57, 1);
      deco.fillRect(x + 3, y + 3, 10, 7);
      deco.fillStyle(0x3aa36c, 1);
      deco.fillRect(x + 5, y + 5, 6, 4);
    }
  }

  private createMagicalCampusTree(x: number, y: number, index: number): void {
    const treeContainer = this.add.container(x, y);
    
    // Enhanced trunk with bark texture
    const trunk = this.add.graphics();
    trunk.fillGradientStyle(0x8B4513, 0x8B4513, 0x654321, 0x654321);
    trunk.fillRoundedRect(-5, 0, 10, 28, 2);
    treeContainer.add(trunk);
    
    // Multi-layered magical foliage
    const foliage1 = this.add.graphics();
    foliage1.fillGradientStyle(0x228B22, 0x228B22, 0x32CD32, 0x32CD32);
    foliage1.fillCircle(0, -8, 22);
    treeContainer.add(foliage1);
    
    const foliage2 = this.add.graphics();
    foliage2.fillStyle(0x90EE90, 0.7);
    foliage2.fillCircle(-12, -3, 15);
    foliage2.fillCircle(12, -3, 15);
    foliage2.fillCircle(0, -20, 13);
    treeContainer.add(foliage2);
    
    // Add magical sparkles to trees
    const sparkle = this.add.graphics();
    sparkle.fillStyle(0xFFD700, 0.8);
    sparkle.fillCircle(0, -15, 2);
    treeContainer.add(sparkle);
    
    this.tweens.add({
      targets: sparkle,
      alpha: { from: 0.8, to: 0.2 },
      scale: { from: 1, to: 0.5 },
      duration: 2000 + index * 300,
      yoyo: true,
      repeat: -1
    });
    
    // Enhanced sway animation
    this.tweens.add({
      targets: treeContainer,
      rotation: 0.04 + Math.random() * 0.02,
      duration: 3000 + Math.random() * 2000 + index * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createEnhancedBench(x: number, y: number): void {
    const bench = this.add.graphics();
    bench.fillGradientStyle(0x8B4513, 0x8B4513, 0x654321, 0x654321);
    // Enhanced bench seat with curves
    bench.fillRoundedRect(x - 18, y, 36, 5, 2);
    // Enhanced bench back
    bench.fillRoundedRect(x - 18, y - 10, 36, 3, 1);
    // Enhanced bench legs
    bench.fillRoundedRect(x - 15, y, 3, 8, 1);
    bench.fillRoundedRect(x + 12, y, 3, 8, 1);
    
    // Add magical glow to bench
    bench.lineStyle(2, 0xFFE4B5, 0.3);
    bench.strokeRoundedRect(x - 18, y, 36, 5, 2);
  }

  private createMagicalLampPost(x: number, y: number, index: number): void {
    const lamp = this.add.graphics();
    
    // Enhanced lamp post with texture
    lamp.fillGradientStyle(0x696969, 0x696969, 0x2F4F4F, 0x2F4F4F);
    lamp.fillRoundedRect(x - 3, y, 6, 25, 1);
    
    // Enhanced lamp top with magical glow
    lamp.fillGradientStyle(0xFFD700, 0xFFD700, 0xFFA500, 0xFFA500);
    lamp.fillCircle(x, y - 8, 10);
    
    // Enhanced lamp glow effect with pulsing animation
    const glow = this.add.graphics();
    glow.fillStyle(0xFFFFE0, 0.3);
    glow.fillCircle(x, y - 8, 20);
    
    this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 0.3, to: 0.1 },
      duration: 2500 + index * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createLampPost(x: number, y: number): void {
    const lamp = this.add.graphics();
    lamp.fillStyle(0x696969);
    // Lamp post
    lamp.fillRect(x - 2, y, 4, 20);
    // Lamp top
    lamp.fillStyle(0xFFD700, 0.6);
    lamp.fillCircle(x, y - 5, 8);
    // Lamp glow effect
    lamp.fillStyle(0xFFFFE0, 0.2);
    lamp.fillCircle(x, y - 5, 15);
  }

  private createCampusTree(x: number, y: number): void {
    // Tree trunk
    const trunk = this.add.graphics();
    trunk.fillStyle(0x8B4513);
    trunk.fillRect(x - 4, y, 8, 25);
    
    // Tree foliage (multiple circles for fuller look)
    const foliage = this.add.graphics();
    foliage.fillStyle(0x228B22);
    foliage.fillCircle(x, y - 5, 18);
    foliage.fillStyle(0x32CD32, 0.7);
    foliage.fillCircle(x - 10, y, 12);
    foliage.fillCircle(x + 10, y, 12);
    foliage.fillCircle(x, y - 15, 10);
    
    // Add gentle sway animation
    this.tweens.add({
      targets: [trunk, foliage],
      rotation: 0.03,
      duration: 3000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createBench(x: number, y: number): void {
    const bench = this.add.graphics();
    bench.fillStyle(0x654321);
    // Bench seat
    bench.fillRect(x - 15, y, 30, 4);
    // Bench back
    bench.fillRect(x - 15, y - 8, 30, 2);
    // Bench legs
    bench.fillRect(x - 12, y, 2, 6);
    bench.fillRect(x + 10, y, 2, 6);
  }

  private createAtmosphere(): void {
    const width = this.worldWidth || this.sys.game.canvas.width;
    const height = this.worldHeight || this.sys.game.canvas.height;
    
    // Floating particles with physics
    const particles = this.add.particles(0, 0, 'tree', {
      scale: { start: 0.02, end: 0.01 },
      alpha: { start: 0.3, end: 0 },
      speed: { min: 10, max: 30 },
      lifespan: 3000,
      frequency: 500,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(0, 0, width, height * 0.17)
      }
    });

    particles.setDepth(-1);
  }

  private createPlayer(): void {
    const width = this.worldWidth || this.sys.game.canvas.width;
    const height = this.worldHeight || this.sys.game.canvas.height;
    // Spawn the player on the campus path (bottom horizontal path band)
    const tile = 16;
    const cols = Math.ceil(width / tile);
    const rows = Math.ceil(height / tile);
    const hRowBottom = Math.floor(rows * 0.65);
    const spawnX = Math.floor(width * 0.5); // middle of screen
    const spawnY = hRowBottom * tile + Math.floor(tile / 2); // center of tile row
    this.player = new Player(this, spawnX, spawnY);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
  }

  private createNPCs(): void {
    const { width, height } = { width: this.worldWidth || this.sys.game.canvas.width, height: this.worldHeight || this.sys.game.canvas.height };
    
    const npcData = [
      {
        name: 'Alex',
        x: width * 0.25,
        y: height * 0.33,
        scenarioId: 'college-party',
        sprite: 'alex',
        dialogue: [
          "Hey! I'm Alex from your biology class.",
          "Want to practice conversations about health and safety at parties?",
          "Click 'Start Scenario' to begin the college party simulation!"
        ]
      },
      {
        name: 'Jamie',
        x: width * 0.75,
        y: height * 0.25,
        scenarioId: 'travel-romance',
        sprite: 'jamie',
        dialogue: [
          "Hello traveler! I'm Jamie.",
          "I can teach you about health considerations while traveling abroad.",
          "Ready for an overseas romance scenario?"
        ]
      },
      {
        name: 'Taylor',
        // Move Taylor down-left of Alex and left of Riley
        x: width * 0.15,
        y: height * 0.50,
        scenarioId: 'relationship-milestone',
        sprite: 'taylor',
        dialogue: [
          "Hi there! I'm Taylor.",
          "Let's explore important health conversations in relationships.",
          "Want to practice a relationship milestone scenario?"
        ]
      },
      {
        name: 'Riley',
        x: width * 0.75,
        y: height * 0.65,
        scenarioId: 'dating-app',
        sprite: 'riley',
        dialogue: [
          "Hey! I'm Riley from the dating app.",
          "I can help you practice digital communication about health.",
          "Ready for a dating app scenario?"
        ]
      }
    ];

    this.interactionZones = this.physics.add.group();

    npcData.forEach(data => {
      const npc = new NPC(this, data.x, data.y, data.name, data.sprite, data.dialogue, data.scenarioId);
      this.npcs.push(npc);
      this.add.existing(npc);
      this.physics.add.existing(npc);

      // Allow tapping the NPC to interact on mobile
      npc.setInteractive({ useHandCursor: true });
      npc.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // stop propagation so it doesn't trigger tap-to-move
        (pointer.event as any)?.stopPropagation?.();
        const nearbyNPC = this.getNearbyNPC();
        if (nearbyNPC && !this.dialogManager.isActive()) {
          this.dialogManager.startDialog(nearbyNPC);
          this.sound.play('interact', { volume: 0.3 });
        }
      });

      // Create interaction zone
      const zone = this.physics.add.sprite(data.x, data.y, null);
      zone.setVisible(false);
      zone.body!.setSize(80, 80);
      zone.setData('npc', npc);
      this.interactionZones.add(zone);
    });
  }

  private setupManagers(): void {
    this.inputManager = new InputManager(this);
    this.dialogManager = new DialogManager(this);

    // Set up input callbacks
    this.inputManager.onInteraction = () => {
      const nearbyNPC = this.getNearbyNPC();
      if (nearbyNPC && !this.dialogManager.isActive()) {
        this.dialogManager.startDialog(nearbyNPC);
        this.sound.play('interact', { volume: 0.3 });
      }
    };

    // Tap-to-move: set player target and show a quick marker
    this.inputManager.onMoveTo = (x: number, y: number) => {
      if (this.dialogManager.isActive()) return;
      // Ignore taps on fixed HUD areas like the minimap
      const cam = this.cameras.main;
      const screenX = x - cam.scrollX;
      const screenY = y - cam.scrollY;
      if (screenX >= 20 && screenX <= 180 && screenY >= 20 && screenY <= 130) {
        return; // inside minimap bounds; ignore for movement
      }
      // Ignore taps on the mobile "Start Chat" button area
      if (this.interactBtn && this.interactBtn.visible) {
        const bx = cam.width - 90;
        const by = cam.height - 70;
        const bw = 140;
        const bh = 48;
        const left = bx - bw / 2;
        const right = bx + bw / 2;
        const top = by - bh / 2;
        const bottom = by + bh / 2;
        if (screenX >= left && screenX <= right && screenY >= top && screenY <= bottom) {
          return; // inside interact button; ignore for movement
        }
      }
      this.player.setMoveTarget(x, y);
      this.createTapMarker(x, y);
    };

    // Set up dialog callback
    this.dialogManager.onScenarioStart = (scenarioId: string) => {
      const npc = this.npcs.find(n => n.scenarioId === scenarioId);
      if (npc) {
        this.startScenario(npc);
      }
    };
  }

  private createTapMarker(x: number, y: number): void {
    const g = this.add.graphics();
    g.setDepth(50);
    g.lineStyle(2, 0xffffff, 0.9);
    g.strokeCircle(x, y, 8);
    g.lineStyle(2, 0x2A9D8F, 0.9);
    g.strokeCircle(x, y, 14);
    this.tweens.add({
      targets: g,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.4 },
      duration: 350,
      onComplete: () => g.destroy()
    });
  }

  private setupCollisions(): void {
    // Player-NPC interaction zones
    this.physics.add.overlap(
      this.player,
      this.interactionZones,
      (player, zone: any) => {
        const npc = zone.getData('npc') as NPC;
        npc.showInteractionPrompt(true);
      }
    );

    // Reset interaction prompts when player leaves
    this.physics.world.on('worldstep', () => {
      this.npcs.forEach(npc => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          npc.x, npc.y
        );
        if (distance > 60) {
          npc.showInteractionPrompt(false);
        }
      });
    });
  }

  private createUI(): void {
    const { width, height } = this.sys.game.canvas;
    const isSmall = Math.min(width, height) < 480;
    const mapW = Math.max(120, Math.min(180, Math.floor(width * 0.36)));
    const mapH = Math.floor(mapW * 0.6875); // maintain aspect ratio similar to 160x110
    
    // Enhanced mini-map with magical border
    const miniMap = this.add.graphics();
    miniMap.fillGradientStyle(0x000022, 0x000022, 0x001133, 0x001133);
    miniMap.fillRoundedRect(20, 20, mapW, mapH, 8);
    miniMap.lineStyle(3, 0xFF6B9D, 1);
    miniMap.strokeRoundedRect(20, 20, mapW, mapH, 8);
    // Keep UI fixed on screen
    miniMap.setScrollFactor(0);
    
    // Add minimap glow
    miniMap.lineStyle(1, 0xFFFFFF, 0.5);
    miniMap.strokeRoundedRect(18, 18, mapW + 4, mapH + 4, 10);
    
    // Enhanced player dot with glow effect
    const playerDot = this.add.graphics();
    playerDot.fillStyle(0x00FF00);
    playerDot.fillCircle(0, 0, 4);
    playerDot.lineStyle(2, 0xFFFFFF, 0.8);
    playerDot.strokeCircle(0, 0, 6);
    playerDot.setDepth(100);
    playerDot.setScrollFactor(0);

    // Add pulsing animation to player dot
    this.tweens.add({
      targets: playerDot,
      scale: { from: 1, to: 1.3 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Update minimap using world bounds
    this.events.on('postupdate', () => {
      const worldW = this.worldWidth || width;
      const worldH = this.worldHeight || height;
      const mapX = 30 + (this.player.x / worldW) * (mapW - 20);
      const mapY = 30 + (this.player.y / worldH) * (mapH - 20);
      playerDot.setPosition(mapX, mapY);
    });
    
    // Enhanced instructions with beautiful styling
    const instructions = this.add.text(width / 2, height - (isSmall ? 28 : 35), isSmall
      ? '✨ Tap to move • Tap NPC to interact ✨'
      : '✨ Tap to move • Use WASD/Arrows • Press SPACE/ENTER to interact ✨', {
      fontSize: isSmall ? '14px' : '18px',
      color: '#FFE4B5',
      backgroundColor: '#FF6B9D99',
      padding: { x: 15, y: 8 },
      stroke: '#FFFFFF',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(100);
    instructions.setScrollFactor(0);

    // Add floating animation to instructions
    this.tweens.add({
      targets: instructions,
      y: instructions.y - 3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // Create a mobile-friendly interact button that appears when near an NPC
  private ensureInteractButton(): void {
    if (this.interactBtn) return;
    const cam = this.cameras.main;
    const btn = this.add.container(cam.width - 90, cam.height - 70);
    btn.setScrollFactor(0);
    btn.setDepth(120);

    const isTouch = this.sys.game.device.input.touch;
    const bg = this.add.rectangle(0, 0, 140, 48, 0x28a745, 0.9);
    bg.setStrokeStyle(2, 0xffffff, 0.95);
    const label = this.add.text(0, 0, 'Start Chat', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setVisible(false);

    bg.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Stop the global tap-to-move handler from firing
      const evt: any = pointer && (pointer.event as any);
      try {
        evt?.stopPropagation?.();
        evt && (evt.cancelBubble = true);
        evt?.preventDefault?.();
      } catch {}
      const nearbyNPC = this.getNearbyNPC();
      if (nearbyNPC && !this.dialogManager.isActive()) {
        this.dialogManager.startDialog(nearbyNPC);
        this.sound.play('interact', { volume: 0.3 });
      }
    });

    this.interactBtn = btn;
  }

  private getNearbyNPC(): NPC | null {
    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      if (distance < 60) {
        return npc;
      }
    }
    return null;
  }

  public setScenarioCallback(callback?: (scenarioId: string) => void): void {
    this.scenarioCallback = callback;
  }

  private startScenario(npc: NPC): void {
    // Switch to AI conversation instead of scripted conversation
    if (this.scenarioCallback) {
      this.scenarioCallback(npc.scenarioId);
    }
  }

  private getScenarioSetting(scenarioId: string): string {
    const settings = {
      'college-party': 'College Party',
      'travel-romance': 'Bangkok Night Market', 
      'relationship-milestone': 'Cozy Home',
      'dating-app': 'Coffee Shop'
    };
    return settings[scenarioId as keyof typeof settings] || 'Unknown Location';
  }

  update(): void {
    // Only update if scene is active
    if (!this.scene.isActive('GameScene')) {
      return;
    }
    
    this.player.update();
    this.inputManager.update();
    
    this.npcs.forEach(npc => {
      if (npc && npc.scene) {
        npc.update();
      }
    });

    // Show/hide mobile interact button based on proximity
    this.ensureInteractButton();
    const nearby = this.getNearbyNPC();
    if (this.interactBtn) {
      const isTouch = this.sys.game.device.input.touch;
      const shouldShow = isTouch && !!nearby && !this.dialogManager.isActive();
      this.interactBtn.setVisible(shouldShow);
      // keep bottom-right anchoring on resize
      const cam = this.cameras.main;
      this.interactBtn.setPosition(cam.width - 90, cam.height - 70);
    }
  }
}
