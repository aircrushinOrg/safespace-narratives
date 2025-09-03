import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameScene } from '../scenes/GameScene';
import { ConversationScene } from '../scenes/ConversationScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#2c5530',
  parent: 'phaser-game',
  // Improve rendering on high-DPI screens without going overboard
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  // Start directly at PreloadScene to skip splash/loading page
  scene: [PreloadScene, MainMenuScene, GameScene, ConversationScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};
