import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from './config';
import { DEBUG_PHYSICS } from './debug/flags';
import { installTestHook } from './debug/testHook';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';

installTestHook();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL when available (it nearly always is)
  parent: 'game', // the <div id="game"> in index.html
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.background,
  scale: {
    // Keep the 800x600 world and scale it to fit any screen, letterboxed and centred.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: DEBUG_PHYSICS,
    },
  },
  // The first scene in the list starts automatically.
  scene: [MenuScene, GameScene, GameOverScene],
};

export const game = new Phaser.Game(config);
