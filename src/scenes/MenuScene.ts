import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, WIN_SCORE } from '../config';
import { setActiveScene } from '../debug/testHook';
import { SceneKeys } from './keys';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    setActiveScene(SceneKeys.Menu);
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, GAME_HEIGHT * 0.32, 'PONG', {
        fontFamily: 'monospace',
        fontSize: '120px',
        color: '#f2f2f2',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, GAME_HEIGHT * 0.58, 'Press SPACE or tap to start', {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: `#${COLORS.accent.toString(16)}`,
      })
      .setOrigin(0.5);

    // Gentle blink so the screen doesn't look frozen.
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    this.add
      .text(cx, GAME_HEIGHT * 0.78, `W/S or ↑/↓ · drag on touch · first to ${WIN_SCORE}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#8a91a0',
      })
      .setOrigin(0.5);

    const start = (): void => {
      this.scene.start(SceneKeys.Game);
    };
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.once('pointerdown', start);
  }
}
