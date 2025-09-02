import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private startCallback?: () => void;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.sys.game.canvas;

    this.createStyledBackground(width, height);

    // Enhanced title with glow effect
    const title = this.add.text(width / 2, height * 0.25, 'STI Education Campus', {
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#FF6B9D',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Add title glow animation
    this.tweens.add({
      targets: title,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Enhanced subtitle with gradient feel
    const subtitle = this.add.text(width / 2, height * 0.37, '✨ Interactive Learning Adventure ✨', {
      fontSize: '28px',
      color: '#FFE4B5',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Subtitle floating animation
    this.tweens.add({
      targets: subtitle,
      y: subtitle.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Enhanced start button with gradient and glow
    const startButton = this.add.text(width / 2, height * 0.58, '🎮 Start Adventure', {
      fontSize: '36px',
      color: '#ffffff',
      backgroundColor: '#FF6B9D',
      padding: { x: 40, y: 20 },
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Button glow effect
    const buttonGlow = this.add.graphics();
    buttonGlow.fillStyle(0xFF6B9D, 0.3);
    buttonGlow.fillRoundedRect(
      startButton.x - startButton.width/2 - 10,
      startButton.y - startButton.height/2 - 10,
      startButton.width + 20,
      startButton.height + 20,
      15
    );
    buttonGlow.setDepth(-1);

    startButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        startButton.setStyle({ backgroundColor: '#FF1493' });
        this.tweens.add({
          targets: [startButton, buttonGlow],
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 200,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        startButton.setStyle({ backgroundColor: '#FF6B9D' });
        this.tweens.add({
          targets: [startButton, buttonGlow],
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2'
        });
      })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });

    // Enhanced instructions with better formatting
    this.add.text(width / 2, height * 0.75, '🎯 Use WASD or Arrow Keys to move\n💬 Press SPACE or ENTER to interact with NPCs\n🌟 Explore and learn about health & relationships', {
      fontSize: '18px',
      color: '#E6E6FA',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
  }

  private createStyledBackground(width: number, height: number): void {
    // Enhanced gradient sky background with time-of-day feel
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xFF6B9D, 0xFF6B9D, 0x4ECDC4, 0x45B7D1);
    bg.fillRect(0, 0, width, height);

    // Atmospheric clouds with depth
    for (let i = 0; i < 8; i++) {
      const cloudX = Math.random() * width;
      const cloudY = Math.random() * height * 0.4;
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.15 + Math.random() * 0.1);
      cloud.fillCircle(0, 0, 25 + Math.random() * 15);
      cloud.fillCircle(20, 0, 20 + Math.random() * 10);
      cloud.fillCircle(-20, 0, 18 + Math.random() * 8);
      cloud.fillCircle(10, -10, 15 + Math.random() * 6);
      cloud.setPosition(cloudX, cloudY);
      
      // Slow floating animation
      this.tweens.add({
        targets: cloud,
        x: cloudX + width + 100,
        duration: 25000 + Math.random() * 15000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // Enhanced campus buildings silhouette with depth
    const buildings = this.add.graphics();
    
    // Background buildings (darker)
    buildings.fillStyle(0x2C5F2D, 0.6);
    buildings.fillRect(width * 0.05, height * 0.45, width * 0.25, height * 0.25);
    buildings.fillRect(width * 0.35, height * 0.35, width * 0.15, height * 0.35);
    buildings.fillRect(width * 0.55, height * 0.4, width * 0.2, height * 0.3);
    buildings.fillRect(width * 0.8, height * 0.38, width * 0.18, height * 0.32);
    
    // Foreground buildings (lighter)
    buildings.fillStyle(0x97BC62, 0.8);
    buildings.fillRect(width * 0.1, height * 0.55, width * 0.2, height * 0.25);
    buildings.fillRect(width * 0.4, height * 0.5, width * 0.25, height * 0.3);
    buildings.fillRect(width * 0.7, height * 0.52, width * 0.22, height * 0.28);

    // Add campus trees with better design
    for (let i = 0; i < 12; i++) {
      const treeX = (i / 11) * width;
      const treeY = height * 0.75 + Math.random() * height * 0.1;
      this.createEnhancedTree(treeX, treeY, i);
    }

    // Magical floating particles (fireflies/sparkles)
    for (let i = 0; i < 25; i++) {
      const particle = this.add.graphics();
      const colors = [0xFFD700, 0xFF69B4, 0x00CED1, 0x98FB98, 0xDDA0DD];
      particle.fillStyle(colors[Math.floor(Math.random() * colors.length)], 0.7);
      particle.fillCircle(0, 0, 1.5 + Math.random() * 2);
      particle.setPosition(Math.random() * width, Math.random() * height);
      
      this.tweens.add({
        targets: particle,
        y: particle.y - height * 0.3,
        x: particle.x + (Math.random() - 0.5) * 150,
        alpha: { from: 0.7, to: 0 },
        scale: { from: 1, to: 0.3 },
        duration: 6000 + Math.random() * 4000,
        repeat: -1,
        ease: 'Sine.easeOut',
        delay: Math.random() * 3000
      });
    }

    // Enhanced campus pathway with glow
    const path = this.add.graphics();
    path.fillGradientStyle(0xF4A460, 0xF4A460, 0xDEB887, 0xD2B48C);
    path.fillRect(width * 0.35, height * 0.8, width * 0.3, height * 0.2);
    
    // Path glow effect
    path.lineStyle(4, 0xFFE4B5, 0.5);
    path.strokeRect(width * 0.35, height * 0.8, width * 0.3, height * 0.2);
  }

  private createEnhancedTree(x: number, y: number, index: number): void {
    const treeContainer = this.add.container(x, y);
    
    // Enhanced tree trunk with texture
    const trunk = this.add.graphics();
    trunk.fillGradientStyle(0x8B4513, 0x8B4513, 0x654321, 0x654321);
    trunk.fillRoundedRect(-4, 0, 8, 30, 2);
    treeContainer.add(trunk);
    
    // Multi-layered foliage for depth
    const foliage1 = this.add.graphics();
    foliage1.fillStyle(0x228B22, 0.8);
    foliage1.fillCircle(0, -5, 20);
    treeContainer.add(foliage1);
    
    const foliage2 = this.add.graphics();
    foliage2.fillStyle(0x32CD32, 0.6);
    foliage2.fillCircle(-8, -2, 14);
    foliage2.fillCircle(8, -2, 14);
    foliage2.fillCircle(0, -18, 12);
    treeContainer.add(foliage2);
    
    const foliage3 = this.add.graphics();
    foliage3.fillStyle(0x90EE90, 0.4);
    foliage3.fillCircle(-5, -10, 8);
    foliage3.fillCircle(5, -10, 8);
    treeContainer.add(foliage3);
    
    // Add gentle sway with variety
    this.tweens.add({
      targets: treeContainer,
      rotation: 0.05 + Math.random() * 0.03,
      duration: 2500 + Math.random() * 2000 + index * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createTree(x: number, y: number): void {
    // Tree trunk
    const trunk = this.add.graphics();
    trunk.fillStyle(0x8B4513);
    trunk.fillRect(x - 3, y, 6, 30);
    
    // Tree foliage
    const foliage = this.add.graphics();
    foliage.fillStyle(0x228B22, 0.8);
    foliage.fillCircle(x, y - 10, 15);
    foliage.fillCircle(x - 8, y - 5, 12);
    foliage.fillCircle(x + 8, y - 5, 12);
    
    // Add gentle sway animation
    this.tweens.add({
      targets: [trunk, foliage],
      rotation: 0.05,
      duration: 3000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setStartCallback(callback: () => void): void {
    this.startCallback = callback;
  }
}