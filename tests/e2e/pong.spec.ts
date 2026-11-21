import { expect, test } from '@playwright/test';
import { gameState, openGame, startMatch, waitForScene } from './helpers';

test('boots to the menu with no errors', async ({ page }) => {
  const errors = await openGame(page);
  await expect(page.locator('canvas')).toBeVisible();
  await page.screenshot({ path: 'screenshots/menu.png' });
  expect(errors).toEqual([]);
});

test('space starts a match and the ball gets served', async ({ page }) => {
  const errors = await openGame(page);
  await startMatch(page);

  // The serve happens after a short delay; then the ball must actually move.
  await expect.poll(async () => (await gameState(page)).phase, { timeout: 3000 }).toBe('playing');
  const before = await gameState(page);
  await page.waitForTimeout(300);
  const after = await gameState(page);
  expect(Math.abs(after.ball.x - before.ball.x)).toBeGreaterThan(20);

  await page.screenshot({ path: 'screenshots/playing.png' });
  expect(errors).toEqual([]);
});

test('holding S moves the player paddle down, W moves it up', async ({ page }) => {
  await openGame(page);
  await startMatch(page);

  const start = (await gameState(page)).playerY;
  await page.keyboard.down('s');
  await page.waitForTimeout(250);
  await page.keyboard.up('s');
  const lower = (await gameState(page)).playerY;
  expect(lower).toBeGreaterThan(start + 40);

  await page.keyboard.down('w');
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  expect((await gameState(page)).playerY).toBeLessThan(lower - 40);
});

test('the ball bounces back off the player paddle', async ({ page }) => {
  await openGame(page);
  await startMatch(page);

  // Line the paddle up with the ball's path and fire the ball straight at it.
  await page.evaluate(() => {
    const g = window.__PONG__!.game!;
    g.setPlayerY(300);
    g.serve(-500, 0);
  });

  await expect.poll(async () => (await gameState(page)).ball.vx, { timeout: 3000 }).toBeGreaterThan(0);
  expect((await gameState(page)).score).toEqual({ left: 0, right: 0 });
});

test('missing the ball gives the computer a point', async ({ page }) => {
  await openGame(page);
  await startMatch(page);

  // Paddle at the top, ball fired flat along the bottom: an unavoidable miss.
  await page.evaluate(() => {
    const g = window.__PONG__!.game!;
    g.setPlayerY(60);
    g.serve(-700, 0, 540);
  });

  await expect.poll(async () => (await gameState(page)).score.right, { timeout: 4000 }).toBe(1);
});

test('first to 7 ends the match on the game over screen', async ({ page }) => {
  await openGame(page);
  await startMatch(page);

  for (let i = 1; i <= 7; i++) {
    await page.evaluate(() => {
      const g = window.__PONG__!.game!;
      g.setPlayerY(60);
      g.serve(-800, 0, 540);
    });
    // After the 7th point the Game scene shuts down, so fall back to 7 once it's gone.
    await expect
      .poll(() => page.evaluate(() => window.__PONG__?.game?.getState().score.right ?? 7), {
        timeout: 4000,
      })
      .toBe(i);
  }

  await waitForScene(page, 'GameOver');
  await page.screenshot({ path: 'screenshots/game-over.png' });
});

test('the computer paddle tracks the ball and returns it', async ({ page }) => {
  await openGame(page);
  await startMatch(page);

  // Aim at the lower part of the AI's side; it starts in the middle, so it has to move to save it.
  await page.evaluate(() => window.__PONG__!.game!.serve(450, 120, 300));

  await expect.poll(async () => (await gameState(page)).ball.vx, { timeout: 4000 }).toBeLessThan(0);
  const s = await gameState(page);
  expect(s.aiY).toBeGreaterThan(330);
  expect(s.score).toEqual({ left: 0, right: 0 });
});
