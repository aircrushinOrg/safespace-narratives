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

    // Create beautiful gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A365D, 0x2A9D8F, 0x4FD1C7, 0xC1F0F7, 1);
    bg.fillRect(0, 0, width, height);

    // Add floating particles
    const particles = this.add.particles(width / 2, height / 2, 'logo', {
      scale: { start: 0.02, end: 0.1 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      frequency: 300,
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 150), quantity: 24 }
    });

    // Show logo with enhanced styling
    const logoScale = Math.min(width, height) / 300;
    const logo = this.add.image(width / 2, height * 0.35, 'logo').setScale(logoScale);
    
    // Add glow effect to logo
    const logoGlow = this.add.image(width / 2, height * 0.35, 'logo')
      .setScale(logoScale * 1.2)
      .setAlpha(0.3)
      .setTint(0x4FD1C7);

    // Welcome text with style
    const welcomeText = this.add.text(width / 2, height * 0.58, 'Welcome to', {
      fontSize: `${Math.min(width, height) / 35}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#C1F0F7',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Main title
    const titleText = this.add.text(width / 2, height * 0.65, 'Smart Choices', {
      fontSize: `${Math.min(width, height) / 20}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#2A9D8F',
        blur: 6,
        fill: true
      }
    }).setOrigin(0.5);

    // Loading text with dots animation
    const loadingText = this.add.text(width / 2, height * 0.8, 'Initializing', {
      fontSize: `${Math.min(width, height) / 30}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#4FD1C7'
    }).setOrigin(0.5);

    // Animate loading text
    this.time.addEvent({
      delay: 400,
      callback: () => {
        const current = loadingText.text;
        if (current.endsWith('...')) {
          loadingText.setText('Initializing');
        } else {
          loadingText.setText(current + '.');
        }
      },
      loop: true
    });

    // Complex logo animation
    this.tweens.add({
      targets: [logo, logoGlow],
      scaleX: logoScale * 1.05,
      scaleY: logoScale * 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Rotate glow effect
    this.tweens.add({
      targets: logoGlow,
      rotation: Math.PI * 2,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });

    // Fade in animation for text elements
    [welcomeText, titleText, loadingText].forEach((text, index) => {
      text.setAlpha(0);
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 800,
        delay: 500 + (index * 200),
        ease: 'Power2'
      });
    });

    // Title pulse animation
    this.tweens.add({
      targets: titleText,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start preload scene after delay with fade transition
    this.time.delayedCall(3000, () => {
      // Fade out everything
      this.tweens.add({
        targets: [bg, logo, logoGlow, welcomeText, titleText, loadingText, particles],
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          this.scene.start('PreloadScene');
        }
      });
    });
  }
}