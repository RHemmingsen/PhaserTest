import type { Score } from '../logic/score';

/**
 * A tiny window into the running game, used by the Playwright tests (and handy in the browser
 * console). It's only installed in dev mode or when the URL contains `?test`.
 */
export type GamePhase = 'serving' | 'playing' | 'over';

export interface GameState {
  phase: GamePhase;
  score: Score;
  ball: { x: number; y: number; vx: number; vy: number };
  playerY: number;
  aiY: number;
}

export interface GameControls {
  getState(): GameState;
  /** Skip the serve delay and launch the ball from the centre line at height `y` (default: middle). */
  serve(vx: number, vy: number, y?: number): void;
  /** Teleport the player's paddle (it keeps responding to input afterwards). */
  setPlayerY(y: number): void;
}

export interface TestHook {
  /** Key of the scene currently running, e.g. `Menu`, `Game`, `GameOver`. */
  activeScene: string;
  /** Present while the Game scene is running. */
  game: GameControls | null;
}

declare global {
  interface Window {
    __PONG__?: TestHook;
  }
}

export function testHookEnabled(): boolean {
  return import.meta.env.DEV || new URLSearchParams(window.location.search).has('test');
}

const hook: TestHook = { activeScene: 'none', game: null };

export function installTestHook(): void {
  if (testHookEnabled()) window.__PONG__ = hook;
}

export function setActiveScene(key: string): void {
  hook.activeScene = key;
}

export function setGameControls(controls: GameControls | null): void {
  hook.game = controls;
}
