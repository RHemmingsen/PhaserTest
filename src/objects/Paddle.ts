import Phaser from 'phaser';
import { COLORS, PADDLE } from '../config';

/**
 * A paddle is a plain rectangle with an Arcade Physics body.
 * We only ever set its vertical velocity; physics handles moving it and keeping it on screen.
 */
export class Paddle extends Phaser.GameObjects.Rectangle {
  // Tell TypeScript which kind of body this object gets (Arcade, not Matter).
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PADDLE.width, PADDLE.height, COLORS.foreground);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true); // the ball bounces off; the paddle doesn't get pushed
    this.body.setCollideWorldBounds(true); // can't leave the screen
    this.body.setAllowGravity(false);
  }

  /** Move vertically at `vy` pixels per second (negative is up). */
  setVerticalVelocity(vy: number): void {
    this.body.setVelocityY(vy);
  }

  /** A quick squash when the ball hits. Purely visual. */
  pulse(): void {
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.6,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
