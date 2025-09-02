import Phaser from 'phaser';
import campusBackground from '@/assets/campus-background.jpg';
import treeImage from '@/assets/tree.png';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 60);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 40);
      percentText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

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