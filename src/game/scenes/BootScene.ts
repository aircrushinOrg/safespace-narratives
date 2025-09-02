import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load minimal assets for loading screen
    this.load.image('logo', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#4A90E2" rx="10"/>
        <text x="50" y="35" text-anchor="middle" fill="white" font-size="16" font-family="Arial">STI</text>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="12" font-family="Arial">Education</text>
        <text x="50" y="75" text-anchor="middle" fill="white" font-size="12" font-family="Arial">Campus</text>
      </svg>
    `));
  }

  create(): void {
    const { width, height } = this.sys.game.canvas;

    // Show logo scaled to screen
    const logo = this.add.image(width / 2, height * 0.33, 'logo').setScale(Math.min(width, height) / 400);
    
    // Add loading text
    const loadingText = this.add.text(width / 2, height * 0.58, 'Loading...', {
      fontSize: `${Math.min(width, height) / 25}px`,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Animate logo
    this.tweens.add({
      targets: logo,
      scaleX: logo.scaleX * 1.1,
      scaleY: logo.scaleY * 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start preload scene after delay
    this.time.delayedCall(2000, () => {
      this.scene.start('PreloadScene');
    });
  }
}