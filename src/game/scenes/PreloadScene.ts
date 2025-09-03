import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createStyledBackground();
    this.createLoadingBar();
    this.setupLoadingEvents();
    this.loadAssets();
  }

  private createStyledBackground(): void {
    const { width, height } = this.sys.game.canvas;
    
    // Create gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c5530, 0x2c5530, 0x1a3d1f, 0x1a3d1f);
    bg.fillRect(0, 0, width, height);

    // Add animated clouds
    for (let i = 0; i < 5; i++) {
      const cloudX = Math.random() * width;
      const cloudY = Math.random() * height * 0.4;
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.1);
      cloud.fillCircle(0, 0, 20 + Math.random() * 10);
      cloud.fillCircle(15, 0, 15 + Math.random() * 8);
      cloud.fillCircle(-15, 0, 12 + Math.random() * 6);
      cloud.setPosition(cloudX, cloudY);
      
      // Animate clouds
      this.tweens.add({
        targets: cloud,
        x: cloudX + width,
        duration: 15000 + Math.random() * 10000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  private createLoadingBar(): void {
    const { width, height } = this.sys.game.canvas;

    // Loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x333333);
    this.loadingBar.fillRect(width / 4, height / 2 - 20, width / 2, 40);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Loading text
    this.add.text(width / 2, height / 2 - 50, 'Loading Assets...', {
      fontSize: `${Math.min(width, height) / 30}px`,
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  private setupLoadingEvents(): void {
    this.load.on('progress', (value: number) => {
      const { width, height } = this.sys.game.canvas;
      
      this.progressBar.clear();
      this.progressBar.fillStyle(0x4A90E2);
      this.progressBar.fillRect(
        width / 4 + 5,
        height / 2 - 15,
        (width / 2 - 10) * value,
        30
      );
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.loadingBar.destroy();
    });
  }

  private loadAssets(): void {

    // Create player spritesheet programmatically
    this.createPlayerSprites();
    
    // Create NPC sprites
    this.createNPCSprites();

    // Load UI elements
    this.createUIElements();

    // Load sound effects (placeholder)
    this.createSounds();
  }

  private createPlayerSprites(): void {
    // Player idle animation frames
    const idleFrames = [
      this.createPlayerSprite('idle1', '#FFB3BA', false),
      this.createPlayerSprite('idle2', '#FFB3BA', false, 0.95)
    ];

    // Player walk animation frames
    const walkFrames = [
      this.createPlayerSprite('walk1', '#FFB3BA', false),
      this.createPlayerSprite('walk2', '#FFB3BA', true),
      this.createPlayerSprite('walk3', '#FFB3BA', false),
      this.createPlayerSprite('walk4', '#FFB3BA', true)
    ];

    // Load each frame
    idleFrames.forEach((sprite, index) => {
      this.load.image(`player-idle-${index}`, sprite);
    });

    walkFrames.forEach((sprite, index) => {
      this.load.image(`player-walk-${index}`, sprite);
    });
  }

  private createPlayerSprite(name: string, skinColor: string, legOffset: boolean, scale: number = 1): string {
    const legY = legOffset ? 26 : 24;
    const legHeight = legOffset ? 8 : 6;
    
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <g transform="scale(${scale})">
          <!-- Head -->
          <circle cx="16" cy="10" r="6" fill="${skinColor}"/>
          <!-- Eyes -->
          <circle cx="13" cy="8" r="1" fill="#333"/>
          <circle cx="19" cy="8" r="1" fill="#333"/>
          <!-- Smile -->
          <path d="M 12 12 Q 16 15 20 12" stroke="#333" stroke-width="1" fill="none"/>
          <!-- Body -->
          <rect x="10" y="16" width="12" height="14" fill="#4A90E2" rx="2"/>
          <!-- Legs -->
          <rect x="12" y="${legY}" width="3" height="${legHeight}" fill="${skinColor}"/>
          <rect x="17" y="${legY}" width="3" height="${legHeight}" fill="${skinColor}"/>
          <!-- Hair -->
          <ellipse cx="16" cy="6" rx="7" ry="3" fill="#8B4513"/>
        </g>
      </svg>
    `);
  }

  private createNPCSprites(): void {
    const npcs = [
      { name: 'alex', color: '#DEB887', hair: '#8B4513', outfit: '#228B22' },
      { name: 'jamie', color: '#F0C987', hair: '#4B0082', outfit: '#FF6B6B' },
      { name: 'taylor', color: '#FFDBAC', hair: '#FF69B4', outfit: '#9932CC' },
      { name: 'riley', color: '#98FB98', hair: '#32CD32', outfit: '#32CD32' }
    ];

    npcs.forEach(npc => {
      const sprite = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="10" r="6" fill="${npc.color}" stroke="#333" stroke-width="0.5"/>
          <rect x="10" y="16" width="12" height="16" fill="${npc.outfit}" rx="2" stroke="#333" stroke-width="0.5"/>
          <circle cx="13" cy="8" r="1" fill="#333"/>
          <circle cx="19" cy="8" r="1" fill="#333"/>
          <path d="M 12 12 Q 16 15 20 12" stroke="#333" stroke-width="1" fill="none"/>
          <ellipse cx="16" cy="6" rx="7" ry="3" fill="${npc.hair}"/>
        </svg>
      `)}`;
      this.load.image(`npc-${npc.name}`, sprite);
    });
  }

  private createUIElements(): void {
    // Dialog box background
    this.load.image('dialog-bg', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#000000" fill-opacity="0.8" rx="10"/>
        <rect width="396" height="146" x="2" y="2" fill="none" stroke="#ffffff" stroke-width="2" rx="8"/>
      </svg>
    `));

    // Interaction prompt (without emoji to avoid encoding issues)
    this.load.image('interaction-bubble', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="12" r="12" fill="#ffffff" stroke="#333" stroke-width="2"/>
        <circle cx="12" cy="10" r="1.5" fill="#333"/>
        <circle cx="16" cy="10" r="1.5" fill="#333"/>
        <circle cx="20" cy="10" r="1.5" fill="#333"/>
        <path d="M 16 24 L 12 28 L 20 28 Z" fill="#ffffff" stroke="#333" stroke-width="2"/>
      </svg>
    `));
  }

  private createSounds(): void {
    // Create simple audio data URLs for sound effects
    // Walk sound (simple beep)
    const walkSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMSBjiS3/HNeSsFM4LL7tyMPwkUYbfp6KdXFAlFnt7yxWUZBTWQ2fHJfC0GJHfE7t2QQwoVXrPt451MFAlFnePxvWIaBjWS2vHIey0HJnjE7t+PQAkTXbLq7Z1DEAt';

    // Interaction sound
    const interactSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMSBjiS3/HNeSsFM4LL7tyMPwkUYbfp6KdXFAlFnt7yxWUZBTWQ2fHJfC0GJHfE7t2QQwoVXrPt451MFAlFnePxvWIaBjWS2vHIey0HJnjE7t+PQAkTXbLq7Z1DEAt';

    this.load.audio('walk', [walkSound]);
    this.load.audio('interact', [interactSound]);
  }

  create(): void {
    // Create animations after loading
    this.createAnimations();
    
    // Transition to main menu immediately after loading
    this.scene.start('MainMenuScene');
  }

  private createAnimations(): void {
    // Player idle animation
    this.anims.create({
      key: 'player-idle',
      frames: [
        { key: 'player-idle-0' },
        { key: 'player-idle-1' }
      ],
      frameRate: 2,
      repeat: -1
    });

    // Player walk animation
    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'player-walk-0' },
        { key: 'player-walk-1' },
        { key: 'player-walk-2' },
        { key: 'player-walk-3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    // NPC idle animations
    ['alex', 'jamie', 'taylor', 'riley'].forEach(npcName => {
      this.anims.create({
        key: `${npcName}-idle`,
        frames: [{ key: `npc-${npcName}` }],
        frameRate: 1
      });
    });
  }
}
