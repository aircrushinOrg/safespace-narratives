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

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Set world bounds to screen size
    const { width, height } = this.sys.game.canvas;
    this.physics.world.setBounds(0, 0, width, height);

    // Create stylized campus background
    this.createStyledCampusBackground(width, height);

    // Add atmospheric elements
    this.createAtmosphere();
    
    this.createPlayer();
    this.createNPCs();
    this.setupManagers();
    this.setupCollisions();
    this.createUI();
  }

  private createStyledCampusBackground(width: number, height: number): void {
    // Enhanced magical sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xFF6B9D, 0xFF6B9D, 0x4ECDC4, 0x45B7D1);
    bg.fillRect(0, 0, width, height);

    // Add subtle animated rays of light
    for (let i = 0; i < 6; i++) {
      const ray = this.add.graphics();
      ray.fillStyle(0xFFFFFF, 0.1);
      ray.fillRect(-5, 0, 10, height);
      ray.setPosition(width * (i / 5), 0);
      ray.setRotation(Math.PI / 12);
      
      this.tweens.add({
        targets: ray,
        alpha: { from: 0.1, to: 0.3 },
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Campus lawn with enhanced colors and texture
    const lawn = this.add.graphics();
    lawn.fillGradientStyle(0x32CD32, 0x32CD32, 0x228B22, 0x006400);
    lawn.fillRect(0, height * 0.65, width, height * 0.35);
    
    // Add magical grass texture with sparkles
    lawn.fillStyle(0x90EE90, 0.4);
    for (let i = 0; i < 30; i++) {
      lawn.fillCircle(
        Math.random() * width,
        height * 0.7 + Math.random() * height * 0.25,
        3 + Math.random() * 8
      );
    }

    // Enhanced pathway system with glowing edges
    const paths = this.add.graphics();
    paths.fillGradientStyle(0xF4A460, 0xF4A460, 0xDEB887, 0xD2B48C);
    
    // Central main path (horizontal) with curves
    paths.fillRoundedRect(0, height * 0.45, width, height * 0.1, 5);
    
    // Vertical connecting paths with rounded edges
    paths.fillRoundedRect(width * 0.2, height * 0.2, width * 0.1, height * 0.6, 5);
    paths.fillRoundedRect(width * 0.45, height * 0.3, width * 0.1, height * 0.5, 5);
    paths.fillRoundedRect(width * 0.7, height * 0.25, width * 0.1, height * 0.55, 5);
    
    // Add glowing path borders
    paths.lineStyle(3, 0xFFE4B5, 0.8);
    paths.strokeRoundedRect(0, height * 0.45, width, height * 0.1, 5);
    paths.strokeRoundedRect(width * 0.2, height * 0.2, width * 0.1, height * 0.6, 5);
    paths.strokeRoundedRect(width * 0.45, height * 0.3, width * 0.1, height * 0.5, 5);
    paths.strokeRoundedRect(width * 0.7, height * 0.25, width * 0.1, height * 0.55, 5);

    // Enhanced path intersections with magical glow
    paths.fillGradientStyle(0xFFD700, 0xFFD700, 0xF4A460, 0xF4A460);
    paths.fillCircle(width * 0.25, height * 0.5, 18);
    paths.fillCircle(width * 0.5, height * 0.5, 18);
    paths.fillCircle(width * 0.75, height * 0.5, 18);

    // Add intersection sparkle effects
    for (let i = 0; i < 3; i++) {
      const intersectionX = width * (0.25 + i * 0.25);
      const sparkle = this.add.graphics();
      sparkle.fillStyle(0xFFFFFF, 0.8);
      sparkle.fillCircle(0, 0, 2);
      sparkle.setPosition(intersectionX, height * 0.5);
      
      this.tweens.add({
        targets: sparkle,
        scale: { from: 1, to: 2 },
        alpha: { from: 0.8, to: 0 },
        duration: 1500,
        repeat: -1,
        delay: i * 500
      });
    }

    // Enhanced decorative campus trees
    for (let i = 0; i < 10; i++) {
      const treeX = width * 0.1 + (i / 9) * width * 0.8;
      const treeY = height * 0.7 + Math.random() * height * 0.1;
      this.createMagicalCampusTree(treeX, treeY, i);
    }

    // Enhanced benches with magical glow
    this.createEnhancedBench(width * 0.15, height * 0.5);
    this.createEnhancedBench(width * 0.35, height * 0.5);
    this.createEnhancedBench(width * 0.65, height * 0.5);
    this.createEnhancedBench(width * 0.85, height * 0.5);

    // Enhanced lamp posts with magical lighting
    for (let i = 0; i < 4; i++) {
      const lampX = width * 0.15 + i * width * 0.25;
      const lampY = height * 0.4;
      this.createMagicalLampPost(lampX, lampY, i);
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
    const { width, height } = this.sys.game.canvas;
    
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
    const { width, height } = this.sys.game.canvas;
    this.player = new Player(this, width / 2, height * 0.83);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
  }

  private createNPCs(): void {
    const { width, height } = this.sys.game.canvas;
    
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
        x: width * 0.19,
        y: height * 0.67,
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
        x: width * 0.69,
        y: height * 0.75,
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

    // Set up dialog callback
    this.dialogManager.onScenarioStart = (scenarioId: string) => {
      const npc = this.npcs.find(n => n.scenarioId === scenarioId);
      if (npc) {
        this.startScenario(npc);
      }
    };
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
    
    // Enhanced mini-map with magical border
    const miniMap = this.add.graphics();
    miniMap.fillGradientStyle(0x000022, 0x000022, 0x001133, 0x001133);
    miniMap.fillRoundedRect(20, 20, 160, 110, 8);
    miniMap.lineStyle(3, 0xFF6B9D, 1);
    miniMap.strokeRoundedRect(20, 20, 160, 110, 8);
    
    // Add minimap glow
    miniMap.lineStyle(1, 0xFFFFFF, 0.5);
    miniMap.strokeRoundedRect(18, 18, 164, 114, 10);
    
    // Enhanced player dot with glow effect
    const playerDot = this.add.graphics();
    playerDot.fillStyle(0x00FF00);
    playerDot.fillCircle(0, 0, 4);
    playerDot.lineStyle(2, 0xFFFFFF, 0.8);
    playerDot.strokeCircle(0, 0, 6);
    playerDot.setDepth(100);

    // Add pulsing animation to player dot
    this.tweens.add({
      targets: playerDot,
      scale: { from: 1, to: 1.3 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Update minimap
    this.events.on('postupdate', () => {
      const mapX = 30 + (this.player.x / width) * 140;
      const mapY = 30 + (this.player.y / height) * 90;
      playerDot.setPosition(mapX, mapY);
    });
    
    // Enhanced instructions with beautiful styling
    const instructions = this.add.text(width / 2, height - 35, '✨ Use WASD or Arrow Keys to move • Press SPACE/ENTER to interact with NPCs ✨', {
      fontSize: '18px',
      color: '#FFE4B5',
      backgroundColor: '#FF6B9D99',
      padding: { x: 15, y: 8 },
      stroke: '#FFFFFF',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(100);

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
    // Switch to conversation scene instead of callback
    const conversationData = {
      scenarioId: npc.scenarioId,
      npcName: npc.npcName,
      npcSprite: npc.scenarioId.split('-')[0], // alex, jamie, taylor, riley
      setting: this.getScenarioSetting(npc.scenarioId)
    };
    
    this.scene.start('ConversationScene', { 
      conversationData,
      scenarioCallback: this.scenarioCallback 
    });
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
    this.player.update();
    this.inputManager.update();
    
    this.npcs.forEach(npc => {
      npc.update();
    });
  }
}