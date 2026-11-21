import type { Side } from './types';

export interface Score {
  readonly left: number;
  readonly right: number;
}

export const emptyScore: Score = { left: 0, right: 0 };

/** Returns a new score with one point added to `side`. Never mutates. */
export function addPoint(score: Score, side: Side): Score {
  return side === 'left' ? { ...score, left: score.left + 1 } : { ...score, right: score.right + 1 };
}

/** The side that has reached `winScore`, or `null` if the match is still on. */
export function winner(score: Score, winScore: number): Side | null {
  if (score.left >= winScore) return 'left';
  if (score.right >= winScore) return 'right';
  return null;
}

/** The side that scores when the ball leaves the court on `exitSide`. */
export function scorerFor(exitSide: Side): Side {
  return exitSide === 'left' ? 'right' : 'left';
}
