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
    // Show logo
    const logo = this.add.image(400, 200, 'logo').setScale(2);
    
    // Add loading text
    const loadingText = this.add.text(400, 350, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Animate logo
    this.tweens.add({
      targets: logo,
      scaleX: 2.2,
      scaleY: 2.2,
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