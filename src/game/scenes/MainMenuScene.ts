import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private startCallback?: () => void;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.sys.game.canvas;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c5530);

    // Title
    const title = this.add.text(width / 2, height * 0.25, 'STI Education Campus', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.37, 'Interactive Learning Game', {
      fontSize: '24px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height * 0.58, 'Start Game', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4A90E2',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5);

    startButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        startButton.setStyle({ backgroundColor: '#357ABD' });
        this.tweens.add({
          targets: startButton,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        startButton.setStyle({ backgroundColor: '#4A90E2' });
        this.tweens.add({
          targets: startButton,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2'
        });
      })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });

    // Instructions
    this.add.text(width / 2, height * 0.75, 'Use WASD or Arrow Keys to move\nPress SPACE or ENTER to interact with NPCs', {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Animated title effect
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setStartCallback(callback: () => void): void {
    this.startCallback = callback;
  }
}