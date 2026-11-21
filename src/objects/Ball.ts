import Phaser from 'phaser';
import { BALL, COLORS } from '../config';

/** The ball: a small square with an Arcade body that bounces off the top and bottom walls. */
export class Ball extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;

  /** Current speed in px/s. Grows with every paddle hit, resets on each serve. */
  speed: number = BALL.startSpeed;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, BALL.size, BALL.size, COLORS.foreground);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCollideWorldBounds(true);
    this.body.setBounce(1, 1); // perfect bounce off the walls, no energy lost
    this.body.setAllowGravity(false);
  }

  /** Put the ball back in the middle, standing still. */
  resetTo(x: number, y: number): void {
    this.speed = BALL.startSpeed;
    this.body.reset(x, y); // moves the body and the game object together, zeroes velocity
  }

  launch(vx: number, vy: number): void {
    this.body.setVelocity(vx, vy);
  }
}
