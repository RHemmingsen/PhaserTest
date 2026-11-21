import { describe, expect, it } from 'vitest';
import { addPoint, emptyScore, scorerFor, winner } from '../../src/logic/score';

describe('score', () => {
  it('adds a point without mutating the old score', () => {
    const next = addPoint(emptyScore, 'left');
    expect(next).toEqual({ left: 1, right: 0 });
    expect(emptyScore).toEqual({ left: 0, right: 0 });
  });

  it('has no winner before the win score', () => {
    expect(winner({ left: 6, right: 6 }, 7)).toBeNull();
  });

  it('declares the side that reaches the win score', () => {
    expect(winner({ left: 7, right: 3 }, 7)).toBe('left');
    expect(winner({ left: 2, right: 7 }, 7)).toBe('right');
  });

  it('gives the point to the opposite side of where the ball left', () => {
    expect(scorerFor('left')).toBe('right');
    expect(scorerFor('right')).toBe('left');
  });
});
