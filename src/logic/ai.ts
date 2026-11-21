/**
 * Predict the y position where the ball will cross `targetX`, including bounces off the
 * top (`minY`) and bottom (`maxY`) walls. Returns `null` if the ball moves away from `targetX`.
 */
export function predictBallY(
  ballX: number,
  ballY: number,
  vx: number,
  vy: number,
  targetX: number,
  minY: number,
  maxY: number,
): number | null {
  if (vx === 0) return null;
  const time = (targetX - ballX) / vx;
  if (time < 0) return null;

  const span = maxY - minY;
  if (span <= 0) return minY;

  // Unfold the bounces: walk along an infinitely tall court, then fold back into [minY, maxY].
  const raw = ballY - minY + vy * time;
  const period = span * 2;
  const wrapped = ((raw % period) + period) % period;
  const folded = wrapped <= span ? wrapped : period - wrapped;
  return minY + folded;
}

/**
 * Vertical velocity for the computer paddle: move towards `targetY` at up to `maxSpeed`,
 * slowing down near the target so it doesn't overshoot, and stopping inside `deadZone`.
 */
export function aiPaddleVelocity(
  paddleY: number,
  targetY: number,
  maxSpeed: number,
  deadZone: number,
): number {
  const diff = targetY - paddleY;
  if (Math.abs(diff) <= deadZone) return 0;
  // Proportional control: full speed when far away, eases in over the last ~60px.
  const ease = Math.min(1, Math.abs(diff) / 60);
  return Math.sign(diff) * maxSpeed * ease;
}
