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
    // Sky gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98);
    bg.fillRect(0, 0, width, height);

    // Main campus building (stylized)
    const building = this.add.graphics();
    building.fillStyle(0x8B4513);
    building.fillRect(width * 0.2, height * 0.25, width * 0.6, height * 0.4);
    
    // Building details
    building.fillStyle(0xA0522D);
    building.fillRect(width * 0.22, height * 0.27, width * 0.56, height * 0.36);
    
    // Windows
    building.fillStyle(0x4682B4);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 3; j++) {
        building.fillRect(
          width * 0.24 + i * (width * 0.52 / 8), 
          height * 0.3 + j * (height * 0.1),
          width * 0.04,
          height * 0.06
        );
      }
    }
    
    // Central tower/spire
    building.fillStyle(0x8B4513);
    building.fillRect(width * 0.47, height * 0.1, width * 0.06, height * 0.2);
    
    // Tower roof
    building.fillStyle(0xB22222);
    const tower = new Phaser.Geom.Triangle(
      width * 0.44, height * 0.1,
      width * 0.5, height * 0.05,
      width * 0.56, height * 0.1
    );
    building.fillTriangleShape(tower);

    // Campus lawn (large green area)
    const lawn = this.add.graphics();
    lawn.fillStyle(0x228B22);
    lawn.fillRect(0, height * 0.65, width, height * 0.35);
    
    // Add some texture to the lawn
    lawn.fillStyle(0x32CD32, 0.3);
    for (let i = 0; i < 20; i++) {
      lawn.fillCircle(
        Math.random() * width,
        height * 0.7 + Math.random() * height * 0.25,
        5 + Math.random() * 10
      );
    }

    // Campus pathways
    const paths = this.add.graphics();
    paths.fillStyle(0xDEB887);
    paths.fillRect(width * 0.45, height * 0.65, width * 0.1, height * 0.35);
    paths.fillRect(0, height * 0.78, width, height * 0.05);

    // Decorative campus trees
    for (let i = 0; i < 6; i++) {
      const treeX = (i / 5) * width * 0.8 + width * 0.1;
      const treeY = height * 0.7 + Math.random() * height * 0.1;
      this.createCampusTree(treeX, treeY);
    }

    // Campus benches
    for (let i = 0; i < 3; i++) {
      const benchX = width * 0.2 + i * width * 0.3;
      const benchY = height * 0.75;
      this.createBench(benchX, benchY);
    }
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
    
    // Trees positioned relative to screen size
    const tree1 = this.add.image(width * 0.85, height * 0.87, 'tree').setScale(0.8).setDepth(1);
    const tree2 = this.add.image(width * 0.225, height * 0.8, 'tree').setScale(0.6).setDepth(1);

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

    // Animate trees gently
    this.tweens.add({
      targets: [tree1, tree2],
      angle: { from: -2, to: 2 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
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
    
    // Mini-map (positioned relative to screen)
    const miniMap = this.add.graphics();
    miniMap.fillStyle(0x000000, 0.5);
    miniMap.fillRect(20, 20, 150, 100);
    miniMap.lineStyle(2, 0xffffff, 1);
    miniMap.strokeRect(20, 20, 150, 100);
    
    // Add player dot on minimap
    const playerDot = this.add.circle(0, 0, 3, 0x00ff00);
    playerDot.setDepth(100);

    // Update minimap
    this.events.on('postupdate', () => {
      const mapX = 20 + (this.player.x / width) * 150;
      const mapY = 20 + (this.player.y / height) * 100;
      playerDot.setPosition(mapX, mapY);
    });
    
    // Add fullscreen instructions
    const instructions = this.add.text(width / 2, height - 30, 'Use WASD or Arrow Keys to move • Press SPACE/ENTER to interact with NPCs', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(100);
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