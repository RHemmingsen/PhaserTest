/**
 * All tunable numbers in one place. Change these to change how the game feels.
 * Units: pixels and pixels per second, in the 800x600 game world.
 */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const COLORS = {
  background: 0x0b0d12,
  foreground: 0xf2f2f2,
  dim: 0x3a3f4b,
  accent: 0x4fd1c5,
} as const;

export const PADDLE = {
  width: 14,
  height: 96,
  /** Distance from the screen edge to the paddle's centre. */
  inset: 40,
  /** Max speed of the player's paddle. */
  playerSpeed: 520,
  /** Max speed of the computer's paddle. Lower than the ball so it can miss. */
  aiSpeed: 340,
} as const;

export const BALL = {
  size: 14,
  startSpeed: 380,
  /** Added to the ball speed every time it hits a paddle. */
  speedUpPerHit: 28,
  maxSpeed: 820,
  /** Steepest angle the ball can leave a paddle at, in degrees from horizontal. */
  maxBounceAngleDeg: 60,
  /** Pause before each serve, in milliseconds. */
  serveDelayMs: 700,
} as const;

export const AI = {
  /** The AI only starts tracking the ball once it's this close (in x). */
  reactionDistance: 520,
  /** Random aiming error in pixels, re-rolled every time the ball is hit. */
  maxAimError: 40,
  /** Stop moving when this close to the target, so it doesn't jitter. */
  deadZone: 6,
} as const;

export const WIN_SCORE = 7;
