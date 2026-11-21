import type { Velocity } from './types';

/**
 * Where on the paddle the ball hit, from -1 (top edge) through 0 (centre) to 1 (bottom edge).
 * Values are clamped, so a ball clipping the very corner still counts as an edge hit.
 */
export function hitOffset(ballY: number, paddleY: number, paddleHeight: number): number {
  const half = paddleHeight / 2;
  const offset = (ballY - paddleY) / half;
  return Math.max(-1, Math.min(1, offset));
}

/**
 * Classic Pong control: the further from the centre you hit, the steeper the ball leaves.
 * The ball always travels away from the paddle (`directionX`) at exactly `speed`.
 */
export function bounceVelocity(
  offset: number,
  speed: number,
  directionX: 1 | -1,
  maxAngleDeg: number,
): Velocity {
  const angle = (offset * maxAngleDeg * Math.PI) / 180;
  return {
    vx: Math.cos(angle) * speed * directionX,
    vy: Math.sin(angle) * speed,
  };
}

/** Speed after one more paddle hit, never above `max`. */
export function nextSpeed(current: number, increment: number, max: number): number {
  return Math.min(current + increment, max);
}

/**
 * Velocity for a serve: towards `directionX`, at a random-ish angle given by `angleFactor`
 * in [-1, 1]. Serves are kept shallower than paddle bounces so they're fair.
 */
export function serveVelocity(speed: number, directionX: 1 | -1, angleFactor: number): Velocity {
  return bounceVelocity(angleFactor, speed, directionX, 30);
}
