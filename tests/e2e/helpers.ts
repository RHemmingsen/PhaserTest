import { expect, type Page } from '@playwright/test';
import type { GameState } from '../../src/debug/testHook';

/** Open the game and fail the test on any console error or uncaught exception. */
export async function openGame(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/?test');
  await waitForScene(page, 'Menu');
  return errors;
}

export async function waitForScene(page: Page, key: string): Promise<void> {
  await expect.poll(() => page.evaluate(() => window.__PONG__?.activeScene)).toBe(key);
}

export async function gameState(page: Page): Promise<GameState> {
  const state = await page.evaluate(() => window.__PONG__?.game?.getState());
  if (!state) throw new Error('Game scene is not running');
  return state;
}

export async function startMatch(page: Page): Promise<void> {
  await page.keyboard.press('Space');
  await waitForScene(page, 'Game');
}
