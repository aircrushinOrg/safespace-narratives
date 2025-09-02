import Phaser from 'phaser';

export class NPC extends Phaser.GameObjects.Sprite {
  private nameText: Phaser.GameObjects.Text;
  private interactionPrompt?: Phaser.GameObjects.Image;
  private idleTimer: number = 0;
  private readonly idleInterval: number = 3000;

  public dialogue: string[];
  public scenarioId: string;
  public npcName: string;
  public spriteKey: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    spriteKey: string,
    dialogue: string[],
    scenarioId: string
  ) {
    super(scene, x, y, `npc-${spriteKey}`);
    
    this.npcName = name;
    this.spriteKey = spriteKey;
    this.dialogue = dialogue;
    this.scenarioId = scenarioId;
    
    this.setScale(1.2);
    this.setDepth(5);
    
    // Set up physics
    scene.physics.add.existing(this, true); // Static body
    
    // Create name label
    this.nameText = scene.add.text(x, y + 25, name, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(6);

    // Start idle animation
    this.startIdleAnimation();
  }

  private startIdleAnimation(): void {
    // Gentle breathing animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.25,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Occasional blink/head turn
    this.scene.time.addEvent({
      delay: 5000,
      callback: () => {
        this.scene.tweens.add({
          targets: this,
          angle: Phaser.Math.Between(-5, 5),
          duration: 500,
          yoyo: true,
          ease: 'Power2'
        });
      },
      loop: true
    });
  }

  public showInteractionPrompt(show: boolean): void {
    if (show && !this.interactionPrompt) {
      this.interactionPrompt = this.scene.add.image(this.x, this.y - 40, 'interaction-bubble');
      this.interactionPrompt.setScale(0.8);
      this.interactionPrompt.setDepth(15);
      
      // Bouncing animation
      this.scene.tweens.add({
        targets: this.interactionPrompt,
        y: this.y - 45,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    } else if (!show && this.interactionPrompt) {
      this.interactionPrompt.destroy();
      this.interactionPrompt = undefined;
    }
  }

  public update(): void {
    // Check if scene and game are available before accessing delta
    if (!this.scene || !this.scene.game || !this.scene.game.loop) {
      return;
    }
    
    this.idleTimer += this.scene.game.loop.delta;
    
    if (this.idleTimer >= this.idleInterval) {
      this.performIdleAction();
      this.idleTimer = 0;
    }
  }

  private performIdleAction(): void {
    // Random idle actions
    const actions = [
      () => {
        // Look around
        this.scene.tweens.add({
          targets: this,
          angle: { from: -10, to: 10 },
          duration: 1000,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
      },
      () => {
        // Scale pulse
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.3,
          scaleY: 1.4,
          duration: 300,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      },
      () => {
        // Slight jump
        this.scene.tweens.add({
          targets: this,
          y: this.y - 10,
          duration: 200,
          yoyo: true,
          ease: 'Quad.easeOut'
        });
      }
    ];

    const randomAction = Phaser.Utils.Array.GetRandom(actions);
    randomAction();
  }

  public destroy(): void {
    if (this.nameText) {
      this.nameText.destroy();
    }
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
    }
    super.destroy();
  }
}