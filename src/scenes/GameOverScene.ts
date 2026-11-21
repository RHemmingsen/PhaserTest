import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config';
import { setActiveScene } from '../debug/testHook';
import type { Score } from '../logic/score';
import type { Side } from '../logic/types';
import { SceneKeys } from './keys';

/** Data the Game scene hands over when the match ends. */
export interface GameOverData {
  winner: Side;
  score: Score;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.GameOver);
  }

  create(data: GameOverData): void {
    setActiveScene(SceneKeys.GameOver);
    const cx = GAME_WIDTH / 2;
    const playerWon = data.winner === 'left';

    this.add
      .text(cx, GAME_HEIGHT * 0.35, playerWon ? 'YOU WIN' : 'COMPUTER WINS', {
        fontFamily: 'monospace',
        fontSize: '72px',
        color: playerWon ? `#${COLORS.accent.toString(16)}` : '#f2f2f2',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.5, `${data.score.left} – ${data.score.right}`, {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#f2f2f2',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, GAME_HEIGHT * 0.68, 'SPACE or tap to play again', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#8a91a0',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Wait a moment before accepting input, so a frantic last tap doesn't skip this screen.
    this.time.delayedCall(600, () => {
      prompt.setAlpha(1);
      const again = (): void => {
        this.scene.start(SceneKeys.Game);
      };
      this.input.keyboard?.once('keydown-SPACE', again);
      this.input.keyboard?.once('keydown-ENTER', again);
      this.input.once('pointerdown', again);
    });

    this.input.keyboard?.once('keydown-ESC', () => this.scene.start(SceneKeys.Menu));
  }
}
