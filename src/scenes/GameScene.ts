import Phaser from 'phaser';
import { AI, BALL, COLORS, GAME_HEIGHT, GAME_WIDTH, PADDLE, WIN_SCORE } from '../config';
import { type GamePhase, setActiveScene, setGameControls } from '../debug/testHook';
import { aiPaddleVelocity, predictBallY } from '../logic/ai';
import { bounceVelocity, hitOffset, nextSpeed, serveVelocity } from '../logic/bounce';
import { addPoint, emptyScore, type Score, scorerFor, winner } from '../logic/score';
import type { Side } from '../logic/types';
import { Ball } from '../objects/Ball';
import { Paddle } from '../objects/Paddle';
import type { GameOverData } from './GameOverScene';
import { SceneKeys } from './keys';

/**
 * The match itself. The flow is: serving -> playing -> (point scored) -> serving ... -> over.
 *
 * Phaser calls `create()` once when the scene starts and `update()` every frame after that.
 * Physics (movement, wall bounces, collisions) runs automatically between frames.
 */
export class GameScene extends Phaser.Scene {
  private player!: Paddle;
  private ai!: Paddle;
  private ball!: Ball;
  private scoreText!: { left: Phaser.GameObjects.Text; right: Phaser.GameObjects.Text };
  private keys!: {
    up: Phaser.Input.Keyboard.Key[];
    down: Phaser.Input.Keyboard.Key[];
  };

  private score: Score = emptyScore;
  private phase: GamePhase = 'serving';
  private aiAimError = 0;
  private serveTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    setActiveScene(SceneKeys.Game);
    // A scene object is reused when restarted, so reset state here, not in field initialisers.
    this.score = emptyScore;
    this.phase = 'serving';

    this.drawCourt();

    this.player = new Paddle(this, PADDLE.inset, GAME_HEIGHT / 2);
    this.ai = new Paddle(this, GAME_WIDTH - PADDLE.inset, GAME_HEIGHT / 2);
    this.ball = new Ball(this, GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // The ball bounces off the top and bottom of the world, but flies out on the left and right.
    this.physics.world.setBoundsCollision(false, false, true, true);

    this.physics.add.collider(this.ball, this.player, () => this.onPaddleHit(this.player, 1));
    this.physics.add.collider(this.ball, this.ai, () => this.onPaddleHit(this.ai, -1));

    this.setupInput();
    this.updateScoreText();
    this.queueServe(Math.random() < 0.5 ? 'left' : 'right');

    setGameControls({
      getState: () => ({
        phase: this.phase,
        score: this.score,
        ball: {
          x: this.ball.x,
          y: this.ball.y,
          vx: this.ball.body.velocity.x,
          vy: this.ball.body.velocity.y,
        },
        playerY: this.player.y,
        aiY: this.ai.y,
      }),
      serve: (vx, vy, y = GAME_HEIGHT / 2) => {
        this.serveTimer?.remove();
        this.serveTimer = null;
        this.ball.resetTo(GAME_WIDTH / 2, y);
        this.ball.launch(vx, vy);
        this.phase = 'playing';
      },
      setPlayerY: (y) => {
        this.player.body.reset(this.player.x, y);
      },
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => setGameControls(null));
  }

  update(): void {
    if (this.phase === 'over') return;
    this.updatePlayer();
    this.updateAi();
    this.checkForPoint();
  }

  // ---------------------------------------------------------------- setup

  private drawCourt(): void {
    // Dashed centre line, drawn once with a Graphics object.
    const g = this.add.graphics();
    g.fillStyle(COLORS.dim);
    for (let y = 10; y < GAME_HEIGHT; y += 30) {
      g.fillRect(GAME_WIDTH / 2 - 2, y, 4, 16);
    }

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#f2f2f2',
    };
    this.scoreText = {
      left: this.add.text(GAME_WIDTH / 2 - 60, 30, '0', style).setOrigin(1, 0),
      right: this.add.text(GAME_WIDTH / 2 + 60, 30, '0', style).setOrigin(0, 0),
    };
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is disabled in the game config');
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up: [kb.addKey(K.W), kb.addKey(K.UP)],
      down: [kb.addKey(K.S), kb.addKey(K.DOWN)],
    };
    kb.once('keydown-ESC', () => this.scene.start(SceneKeys.Menu));
  }

  // ---------------------------------------------------------------- per-frame logic

  private updatePlayer(): void {
    const pointer = this.input.activePointer;

    if (pointer.isDown) {
      // Touch / mouse: chase the finger, using the same easing as the AI so it feels smooth.
      this.player.setVerticalVelocity(
        aiPaddleVelocity(this.player.y, pointer.worldY, PADDLE.playerSpeed, 2),
      );
      return;
    }

    const up = this.keys.up.some((k) => k.isDown);
    const down = this.keys.down.some((k) => k.isDown);
    const dir = (down ? 1 : 0) - (up ? 1 : 0);
    this.player.setVerticalVelocity(dir * PADDLE.playerSpeed);
  }

  private updateAi(): void {
    const v = this.ball.body.velocity;
    const comingAtAi = v.x > 0 && this.ball.x > GAME_WIDTH - AI.reactionDistance;

    let targetY = GAME_HEIGHT / 2; // drift back to the middle while waiting
    if (comingAtAi) {
      const half = BALL.size / 2;
      const predicted = predictBallY(
        this.ball.x,
        this.ball.y,
        v.x,
        v.y,
        this.ai.x - PADDLE.width / 2 - half,
        half,
        GAME_HEIGHT - half,
      );
      if (predicted !== null) targetY = predicted + this.aiAimError;
    }

    this.ai.setVerticalVelocity(aiPaddleVelocity(this.ai.y, targetY, PADDLE.aiSpeed, AI.deadZone));
  }

  private checkForPoint(): void {
    if (this.phase !== 'playing') return;
    const margin = BALL.size;
    let exit: Side | null = null;
    if (this.ball.x < -margin) exit = 'left';
    else if (this.ball.x > GAME_WIDTH + margin) exit = 'right';
    if (exit === null) return;

    const scorer = scorerFor(exit);
    this.score = addPoint(this.score, scorer);
    this.updateScoreText();
    this.cameras.main.shake(120, 0.006);

    const won = winner(this.score, WIN_SCORE);
    if (won) {
      this.phase = 'over';
      this.ball.resetTo(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      const data: GameOverData = { winner: won, score: this.score };
      this.time.delayedCall(800, () => this.scene.start(SceneKeys.GameOver, data));
      return;
    }

    // Serve towards whoever just lost the point.
    this.queueServe(exit);
  }

  // ---------------------------------------------------------------- events

  private onPaddleHit(paddle: Paddle, directionX: 1 | -1): void {
    this.ball.speed = nextSpeed(this.ball.speed, BALL.speedUpPerHit, BALL.maxSpeed);
    const offset = hitOffset(this.ball.y, paddle.y, PADDLE.height);
    const { vx, vy } = bounceVelocity(offset, this.ball.speed, directionX, BALL.maxBounceAngleDeg);

    // Nudge the ball clear of the paddle so it can't register a second hit next frame.
    const clearX = paddle.x + directionX * (PADDLE.width / 2 + BALL.size / 2 + 1);
    this.ball.body.reset(clearX, this.ball.y);
    this.ball.launch(vx, vy);

    paddle.pulse();
    this.aiAimError = Phaser.Math.Between(-AI.maxAimError, AI.maxAimError);
  }

  private queueServe(towards: Side): void {
    this.phase = 'serving';
    this.ball.resetTo(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.serveTimer = this.time.delayedCall(BALL.serveDelayMs, () => {
      const { vx, vy } = serveVelocity(
        BALL.startSpeed,
        towards === 'left' ? -1 : 1,
        Phaser.Math.FloatBetween(-1, 1),
      );
      this.ball.launch(vx, vy);
      this.phase = 'playing';
      this.serveTimer = null;
    });
  }

  private updateScoreText(): void {
    this.scoreText.left.setText(String(this.score.left));
    this.scoreText.right.setText(String(this.score.right));
  }
}
