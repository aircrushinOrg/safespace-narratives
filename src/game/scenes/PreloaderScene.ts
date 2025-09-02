import Phaser from 'phaser';
import campusBackground from '@/assets/campus-background.jpg';
import treeImage from '@/assets/tree.png';

export class PreloaderScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private progressShadow!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private loadingDots!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload(): void {
    this.createStyledBackground();
    this.createLoadingBar();
    this.setupLoadingEvents();
    this.loadAssets();
  }

  private createStyledBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2A9D8F, 0x2A9D8F, 0xC1F0F7, 0xC1F0F7, 1);
    bg.fillRect(0, 0, width, height);

    // Create a simple white pixel texture for particles
    this.add.graphics()
      .fillStyle(0xFFFFFF)
      .fillRect(0, 0, 1, 1)
      .generateTexture('white-pixel', 1, 1)
      .destroy();

    // Add animated particles
    const particles = this.add.particles(0, 0, 'white-pixel', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { start: 0.1, end: 0.3 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 3000,
      frequency: 200,
      blendMode: 'ADD'
    });

    // Create animated orbs
    for (let i = 0; i < 5; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(100, height - 100),
        Phaser.Math.Between(20, 40),
        0x2A9D8F,
        0.2
      );
      
      this.tweens.add({
        targets: orb,
        x: Phaser.Math.Between(100, width - 100),
        y: Phaser.Math.Between(100, height - 100),
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Outer progress container with shadow effect
    this.progressShadow = this.add.graphics();
    this.progressShadow.fillStyle(0x000000, 0.2);
    this.progressShadow.fillRoundedRect(width / 4 - 2, height / 2 + 28, width / 2 + 4, 14, 7);
    
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0xFFFFFF, 0.1);
    this.progressBox.lineStyle(2, 0xFFFFFF, 0.3);
    this.progressBox.fillRoundedRect(width / 4, height / 2 + 30, width / 2, 10, 5);
    this.progressBox.strokeRoundedRect(width / 4, height / 2 + 30, width / 2, 10, 5);
    
    this.progressBar = this.add.graphics();
    
    // Beautiful title
    this.loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 40,
      text: 'Smart Choices',
      style: {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        fontStyle: 'bold',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#2A9D8F',
          blur: 4,
          fill: true
        }
      }
    });
    this.loadingText.setOrigin(0.5, 0.5);

    // Subtitle
    this.subtitleText = this.make.text({
      x: width / 2,
      y: height / 2 - 10,
      text: 'Interactive STI Education',
      style: {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#C1F0F7',
        fontStyle: 'italic'
      }
    });
    this.subtitleText.setOrigin(0.5, 0.5);

    // Animated percentage text
    this.percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 60,
      text: '0%',
      style: {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }
    });
    this.percentText.setOrigin(0.5, 0.5);

    // Loading dots animation
    this.loadingDots = this.make.text({
      x: width / 2,
      y: height / 2 + 85,
      text: 'Loading',
      style: {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#C1F0F7'
      }
    });
    this.loadingDots.setOrigin(0.5, 0.5);

    // Animate loading dots
    this.time.addEvent({
      delay: 500,
      callback: () => {
        const current = this.loadingDots.text;
        if (current.endsWith('...')) {
          this.loadingDots.setText('Loading');
        } else {
          this.loadingDots.setText(current + '.');
        }
      },
      loop: true
    });

    // Title glow animation
    this.tweens.add({
      targets: this.loadingText,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private setupLoadingEvents(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.load.on('progress', (value: number) => {
      // Clear and redraw progress bar with gradient effect
      this.progressBar.clear();
      const progressWidth = (width / 2 - 4) * value;
      
      // Create gradient effect
      this.progressBar.fillGradientStyle(0x2A9D8F, 0x4FD1C7, 0x4FD1C7, 0x2A9D8F, 1);
      this.progressBar.fillRoundedRect(width / 4 + 2, height / 2 + 32, progressWidth, 6, 3);
      
      // Update percentage with smooth animation
      const targetPercent = Math.floor(value * 100);
      this.tweens.add({
        targets: { value: parseInt(this.percentText.text) || 0 },
        value: targetPercent,
        duration: 200,
        onUpdate: (tween) => {
          this.percentText.setText(Math.floor(tween.getValue()) + '%');
        }
      });

      // Add sparkle effect at progress bar end
      if (progressWidth > 20) {
        const sparkle = this.add.circle(
          width / 4 + 2 + progressWidth,
          height / 2 + 35,
          2,
          0xFFFFFF,
          0.8
        );
        
        this.tweens.add({
          targets: sparkle,
          scale: 0,
          alpha: 0,
          duration: 300,
          onComplete: () => sparkle.destroy()
        });
      }
    });

    this.load.on('complete', () => {
      // Beautiful completion animation
      this.tweens.add({
        targets: [this.progressBar, this.progressBox, this.progressShadow, this.percentText, this.loadingDots],
        alpha: 0,
        duration: 500,
        ease: 'Power2'
      });

      this.loadingText.setText('Ready!');
      this.subtitleText.setText('Starting your journey...');
      
      this.tweens.add({
        targets: [this.loadingText, this.subtitleText],
        scale: 1.1,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });
  }

  private loadAssets(): void {

    // Load assets
    this.load.image('campus-bg', campusBackground);
    this.load.image('tree', treeImage);
    
    // Create player sprite sheet programmatically since we don't have actual sprite assets
    this.load.image('player-idle', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="6" fill="#FFB3BA"/>
        <rect x="10" y="16" width="12" height="16" fill="#4A90E2" rx="2"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M 13 12 Q 16 14 19 12" stroke="#333" stroke-width="1" fill="none"/>
      </svg>
    `));

    this.load.image('player-walk', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="6" fill="#FFB3BA"/>
        <rect x="10" y="16" width="12" height="14" fill="#4A90E2" rx="2"/>
        <rect x="8" y="24" width="4" height="8" fill="#FFB3BA"/>
        <rect x="20" y="26" width="4" height="6" fill="#FFB3BA"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M 13 12 Q 16 14 19 12" stroke="#333" stroke-width="1" fill="none"/>
      </svg>
    `));

    // NPC sprites
    this.load.image('npc-alex', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="6" fill="#DEB887"/>
        <rect x="10" y="16" width="12" height="16" fill="#228B22" rx="2"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M 13 12 Q 16 14 19 12" stroke="#333" stroke-width="1" fill="none"/>
        <rect x="12" y="4" width="8" height="4" fill="#8B4513" rx="2"/>
      </svg>
    `));

    this.load.image('npc-jamie', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="6" fill="#F0C987"/>
        <rect x="10" y="16" width="12" height="16" fill="#FF6B6B" rx="2"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M 13 12 Q 16 14 19 12" stroke="#333" stroke-width="1" fill="none"/>
        <path d="M 10 6 Q 16 2 22 6 Q 16 8 10 6" fill="#4B0082"/>
      </svg>
    `));

    this.load.image('npc-taylor', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="6" fill="#FFB3D9"/>
        <rect x="10" y="16" width="12" height="16" fill="#FF1493" rx="2"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M 13 12 Q 16 14 19 12" stroke="#333" stroke-width="1" fill="none"/>
        <path d="M 8 4 Q 16 0 24 4 Q 16 10 8 4" fill="#FF69B4"/>
      </svg>
    `));

    this.load.image('npc-riley', 'data:image/svg+xml;base64=' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="6" fill="#98FB98"/>
        <rect x="10" y="16" width="12" height="16" fill="#32CD32" rx="2"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M 13 12 Q 16 14 19 12" stroke="#333" stroke-width="1" fill="none"/>
        <rect x="6" y="18" width="4" height="6" fill="#333" rx="1"/>
      </svg>
    `));
  }

  create(): void {
    this.scene.start('MainScene');
  }
}