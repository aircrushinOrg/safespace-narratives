import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private escapeKey!: Phaser.Input.Keyboard.Key;
  
  public onInteraction?: () => void;
  public onPause?: () => void;
  public onMoveTo?: (x: number, y: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeys();
    this.setupPointer();
  }

  private setupKeys(): void {
    this.spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escapeKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private setupPointer(): void {
    // Tap/Click to move support (mobile + desktop)
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldX = pointer.worldX ?? pointer.x;
      const worldY = pointer.worldY ?? pointer.y;
      if (this.onMoveTo) this.onMoveTo(worldX, worldY);
    });
  }

  public update(): void {
    // Interaction input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
        Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.onInteraction) {
        this.onInteraction();
      }
    }

    // Pause input
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      if (this.onPause) {
        this.onPause();
      }
    }
  }
}
