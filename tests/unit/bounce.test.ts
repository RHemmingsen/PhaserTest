import { describe, expect, it } from 'vitest';
import { bounceVelocity, hitOffset, nextSpeed, serveVelocity } from '../../src/logic/bounce';

describe('hitOffset', () => {
  it('is 0 at the centre of the paddle', () => {
    expect(hitOffset(300, 300, 100)).toBe(0);
  });

  it('is -1 at the top edge and 1 at the bottom edge', () => {
    expect(hitOffset(250, 300, 100)).toBe(-1);
    expect(hitOffset(350, 300, 100)).toBe(1);
  });

  it('clamps hits beyond the edges', () => {
    expect(hitOffset(1000, 300, 100)).toBe(1);
    expect(hitOffset(-1000, 300, 100)).toBe(-1);
  });
});

describe('bounceVelocity', () => {
  it('goes straight back on a centre hit', () => {
    const v = bounceVelocity(0, 400, 1, 60);
    expect(v.vx).toBeCloseTo(400);
    expect(v.vy).toBeCloseTo(0);
  });

  it('always keeps the same speed', () => {
    for (const offset of [-1, -0.5, 0.3, 1]) {
      const v = bounceVelocity(offset, 500, -1, 60);
      expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(500);
    }
  });

  it('travels in the requested direction', () => {
    expect(bounceVelocity(0.5, 400, -1, 60).vx).toBeLessThan(0);
    expect(bounceVelocity(0.5, 400, 1, 60).vx).toBeGreaterThan(0);
  });

  it('sends edge hits off at the max angle', () => {
    const v = bounceVelocity(1, 400, 1, 60);
    expect((Math.atan2(v.vy, v.vx) * 180) / Math.PI).toBeCloseTo(60);
  });
});

describe('nextSpeed', () => {
  it('adds the increment', () => {
    expect(nextSpeed(400, 25, 800)).toBe(425);
  });
  it('never exceeds the max', () => {
    expect(nextSpeed(790, 25, 800)).toBe(800);
  });
});

describe('serveVelocity', () => {
  it('is never steeper than 30 degrees', () => {
    const v = serveVelocity(400, 1, 1);
    expect((Math.atan2(v.vy, v.vx) * 180) / Math.PI).toBeCloseTo(30);
  });
});
