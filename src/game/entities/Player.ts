import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private speed: number = 260;
  private isMoving: boolean = false;
  private footstepTimer: number = 0;
  private readonly footstepInterval: number = 400;
  private moveTarget?: Phaser.Math.Vector2 | null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle-0');
    
    this.setScale(1.5);
    this.setDepth(10);
    
    // Set up physics
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 28, true);
    
    // Set up input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = scene.input.keyboard!.addKeys('W,S,A,D');
    
    // Start with idle animation
    this.play('player-idle');
  }

  update(): void {
    this.handleMovement();
    this.updateFootsteps();
  }

  private handleMovement(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;
    this.isMoving = false;

    // Handle input
    if (this.cursors.left?.isDown || this.wasdKeys.A.isDown) {
      velocityX = -this.speed;
      this.setFlipX(true);
      this.isMoving = true;
    } else if (this.cursors.right?.isDown || this.wasdKeys.D.isDown) {
      velocityX = this.speed;
      this.setFlipX(false);
      this.isMoving = true;
    }

    if (this.cursors.up?.isDown || this.wasdKeys.W.isDown) {
      velocityY = -this.speed;
      this.isMoving = true;
    } else if (this.cursors.down?.isDown || this.wasdKeys.S.isDown) {
      velocityY = this.speed;
      this.isMoving = true;
    }

    // If no keyboard input, use click/tap move target
    if (velocityX === 0 && velocityY === 0 && this.moveTarget) {
      const dx = this.moveTarget.x - this.x;
      const dy = this.moveTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 6) {
        const nx = dx / dist;
        const ny = dy / dist;
        velocityX = nx * this.speed;
        velocityY = ny * this.speed;
        this.isMoving = true;
        this.setFlipX(velocityX < 0);
      } else {
        // Arrived at destination
        this.moveTarget = null;
        velocityX = 0;
        velocityY = 0;
      }
    }

    // Apply movement
    body.setVelocity(velocityX, velocityY);

    // Update animation
    if (this.isMoving) {
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== 'player-walk') {
        this.play('player-walk');
      }
    } else {
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== 'player-idle') {
        this.play('player-idle');
      }
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      body.setVelocity(velocityX * 0.707, velocityY * 0.707);
    }
  }

  public setMoveTarget(x: number, y: number): void {
    this.moveTarget = new Phaser.Math.Vector2(x, y);
  }

  public clearMoveTarget(): void {
    this.moveTarget = null;
  }

  private updateFootsteps(): void {
    if (this.isMoving) {
      this.footstepTimer += this.scene.game.loop.delta;
      
      if (this.footstepTimer >= this.footstepInterval) {
        this.scene.sound.play('walk', { 
          volume: 0.1,
          rate: Phaser.Math.Between(0.9, 1.1) 
        });
        this.footstepTimer = 0;
      }
    } else {
      this.footstepTimer = 0;
    }
  }

  public getMoving(): boolean {
    return this.isMoving;
  }
}
