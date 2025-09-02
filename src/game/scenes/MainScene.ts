import Phaser from 'phaser';
import { DialogSystem } from '@/game/systems/DialogSystem';

interface NPC {
  id: string;
  name: string;
  scenarioId: string;
  dialogue: string[];
  sprite: Phaser.GameObjects.Sprite;
  interactionZone: Phaser.GameObjects.Zone;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private npcs: NPC[] = [];
  private dialogSystem!: DialogSystem;
  private scenarioCallback?: (scenarioId: string) => void;
  private isMoving = false;
  private moveSpeed = 120;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // Create background
    const bg = this.add.image(400, 300, 'campus-bg');
    bg.setDisplaySize(800, 600);

    // Add decorative elements
    this.createDecorations();

    // Create player
    this.createPlayer();

    // Create NPCs
    this.createNPCs();

    // Set up input
    this.setupInput();

    // Create dialog system
    this.dialogSystem = new DialogSystem(this);

    // Create physics groups
    this.physics.world.enable([this.player, ...this.npcs.map(npc => npc.sprite)]);

    // Set up NPC interactions
    this.setupNPCInteractions();
  }

  private createDecorations(): void {
    // Add trees
    const tree1 = this.add.image(680, 520, 'tree');
    tree1.setScale(0.8);
    tree1.setDepth(1);

    const tree2 = this.add.image(180, 480, 'tree');
    tree2.setScale(0.6);
    tree2.setDepth(1);

    // Add floating particles
    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550),
        Phaser.Math.Between(2, 4),
        0x90EE90,
        0.3
      );
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 20,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  private createPlayer(): void {
    this.player = this.add.sprite(400, 500, 'player-idle');
    this.player.setScale(1.5);
    this.player.setDepth(10);
    
    // Add player physics
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);
    playerBody.setSize(20, 25, true);
  }

  private createNPCs(): void {
    const npcData = [
      {
        id: 'alex',
        name: 'Alex',
        x: 200,
        y: 200,
        scenarioId: 'college-party',
        sprite: 'npc-alex',
        dialogue: [
          "Hey! I'm Alex from your biology class.",
          "Want to practice conversations about health and safety at parties?",
          "Click 'Start Scenario' to begin the college party simulation!"
        ]
      },
      {
        id: 'jamie',
        name: 'Jamie',
        x: 600,
        y: 150,
        scenarioId: 'travel-romance',
        sprite: 'npc-jamie',
        dialogue: [
          "Hello traveler! I'm Jamie.",
          "I can teach you about health considerations while traveling abroad.",
          "Ready for an overseas romance scenario?"
        ]
      },
      {
        id: 'taylor',
        name: 'Taylor',
        x: 150,
        y: 400,
        scenarioId: 'relationship-milestone',
        sprite: 'npc-taylor',
        dialogue: [
          "Hi there! I'm Taylor.",
          "Let's explore important health conversations in relationships.",
          "Want to practice a relationship milestone scenario?"
        ]
      },
      {
        id: 'riley',
        name: 'Riley',
        x: 550,
        y: 450,
        scenarioId: 'dating-app',
        sprite: 'npc-riley',
        dialogue: [
          "Hey! I'm Riley from the dating app.",
          "I can help you practice digital communication about health.",
          "Ready for a dating app scenario?"
        ]
      }
    ];

    npcData.forEach(data => {
      const sprite = this.add.sprite(data.x, data.y, data.sprite);
      sprite.setScale(1.2);
      sprite.setDepth(5);
      
      // Create interaction zone
      const interactionZone = this.add.zone(data.x, data.y, 80, 80);
      this.physics.add.existing(interactionZone, true);
      
      // Add name label
      const nameText = this.add.text(data.x, data.y + 25, data.name, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 }
      });
      nameText.setOrigin(0.5);
      nameText.setDepth(6);

      const npc: NPC = {
        id: data.id,
        name: data.name,
        scenarioId: data.scenarioId,
        dialogue: data.dialogue,
        sprite,
        interactionZone
      };

      this.npcs.push(npc);

      // Add idle animation
      this.tweens.add({
        targets: sprite,
        scaleX: 1.15,
        scaleY: 1.25,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    });
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D,SPACE,ENTER');
  }

  private setupNPCInteractions(): void {
    this.npcs.forEach(npc => {
      this.physics.add.overlap(this.player, npc.interactionZone, () => {
        this.showInteractionPrompt(npc);
      });
    });
  }

  private showInteractionPrompt(npc: NPC): void {
    // Check for interaction input
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.SPACE) || 
        Phaser.Input.Keyboard.JustDown(this.wasdKeys.ENTER)) {
      this.dialogSystem.startDialog(npc.name, npc.dialogue, npc.scenarioId);
    }
  }

  private updatePlayerMovement(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;
    this.isMoving = false;

    if (this.cursors.left?.isDown || this.wasdKeys.A.isDown) {
      velocityX = -this.moveSpeed;
      this.player.setFlipX(true);
      this.isMoving = true;
    } else if (this.cursors.right?.isDown || this.wasdKeys.D.isDown) {
      velocityX = this.moveSpeed;
      this.player.setFlipX(false);
      this.isMoving = true;
    }

    if (this.cursors.up?.isDown || this.wasdKeys.W.isDown) {
      velocityY = -this.moveSpeed;
      this.isMoving = true;
    } else if (this.cursors.down?.isDown || this.wasdKeys.S.isDown) {
      velocityY = this.moveSpeed;
      this.isMoving = true;
    }

    playerBody.setVelocity(velocityX, velocityY);

    // Update player sprite based on movement
    if (this.isMoving) {
      this.player.setTexture('player-walk');
    } else {
      this.player.setTexture('player-idle');
    }
  }

  public setScenarioCallback(callback?: (scenarioId: string) => void): void {
    this.scenarioCallback = callback;
    if (this.dialogSystem) {
      this.dialogSystem.setScenarioCallback(callback);
    }
  }

  update(): void {
    this.updatePlayerMovement();
  }
}