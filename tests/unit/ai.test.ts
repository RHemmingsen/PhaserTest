import { describe, expect, it } from 'vitest';
import { aiPaddleVelocity, predictBallY } from '../../src/logic/ai';

describe('predictBallY', () => {
  it('follows a straight line when there is no bounce', () => {
    // 100 px right at vx=100 takes 1 s; vy=50 moves it 50 px down.
    expect(predictBallY(0, 100, 100, 50, 100, 0, 600)).toBeCloseTo(150);
  });

  it('reflects off the bottom wall', () => {
    // Would reach y=700, which is 100 past the floor at 600, so lands at 500.
    expect(predictBallY(0, 500, 100, 200, 100, 0, 600)).toBeCloseTo(500);
  });

  it('reflects off the top wall', () => {
    expect(predictBallY(0, 50, 100, -150, 100, 0, 600)).toBeCloseTo(100);
  });

  it('handles several bounces', () => {
    // Travels 1500 px vertically in a 600 px court: down 550 to floor, up 600, down 350 -> 350.
    expect(predictBallY(0, 50, 100, 1500, 100, 0, 600)).toBeCloseTo(350);
  });

  it('returns null when the ball moves away', () => {
    expect(predictBallY(400, 300, -100, 0, 700, 0, 600)).toBeNull();
    expect(predictBallY(400, 300, 0, 100, 700, 0, 600)).toBeNull();
  });
});

describe('aiPaddleVelocity', () => {
  it('does not move inside the dead zone', () => {
    expect(aiPaddleVelocity(300, 304, 300, 6)).toBe(0);
  });

  it('moves at full speed when far away', () => {
    expect(aiPaddleVelocity(300, 500, 300, 6)).toBe(300);
    expect(aiPaddleVelocity(300, 100, 300, 6)).toBe(-300);
  });

  it('slows down close to the target', () => {
    const v = aiPaddleVelocity(300, 330, 300, 6);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(300);
  });
});
