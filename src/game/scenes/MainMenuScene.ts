import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private startCallback?: () => void;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.sys.game.canvas;

    this.createStyledBackground(width, height);

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

  private createStyledBackground(width: number, height: number): void {
    // Gradient sky background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x2c5530, 0x2c5530);
    bg.fillRect(0, 0, width, height);

    // Campus buildings silhouette
    const buildings = this.add.graphics();
    buildings.fillStyle(0x1a3d1f, 0.8);
    buildings.fillRect(0, height * 0.6, width * 0.3, height * 0.4);
    buildings.fillRect(width * 0.35, height * 0.5, width * 0.2, height * 0.5);
    buildings.fillRect(width * 0.6, height * 0.65, width * 0.25, height * 0.35);
    buildings.fillRect(width * 0.88, height * 0.55, width * 0.12, height * 0.45);

    // Add campus trees
    for (let i = 0; i < 8; i++) {
      const treeX = (i / 7) * width;
      const treeY = height * 0.75 + Math.random() * height * 0.1;
      this.createTree(treeX, treeY);
    }

    // Floating particles (leaves/petals)
    for (let i = 0; i < 15; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x90EE90, 0.6);
      particle.fillCircle(0, 0, 2 + Math.random() * 3);
      particle.setPosition(Math.random() * width, Math.random() * height);
      
      this.tweens.add({
        targets: particle,
        y: particle.y + height + 100,
        x: particle.x + (Math.random() - 0.5) * 100,
        duration: 8000 + Math.random() * 4000,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000
      });
    }

    // Campus pathway
    const path = this.add.graphics();
    path.fillStyle(0xDEB887, 0.7);
    path.fillRect(width * 0.4, height * 0.8, width * 0.2, height * 0.2);
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