# PhaserTest

Phaser 4 (2D only) game playground. Current placeholder game: Pong.

## Hard rules
- **TypeScript only.** Never add `.js`, `.mjs`, `.cjs` or `.jsx` files: source, config, tests and scripts are all `.ts`. `allowJs` stays `false`.
- **Phaser 4, not Phaser 3.** Most examples online are v3. Check the v4 API before using anything unfamiliar: `node_modules/phaser/types/phaser.d.ts`, `node_modules/phaser/changelog/v4/`, and the topic guides in `node_modules/phaser/skills/*/SKILL.md` (start with `v3-to-v4-migration`).
- **2D only.** No 3D work in this repo.
- Only the free `phaser` npm library. No Phaser Editor, Phaser Game Agent or other paid/hosted services.

## Commands
- `npm run dev`: dev server at http://localhost:5173 (add `?debug` to draw physics bodies)
- `npm run typecheck`: strict TypeScript check (browser code and node-side config/tests)
- `npm test`: unit tests (Vitest) for `src/logic`
- `npm run test:e2e`: Playwright play-tests in headless Chromium; writes screenshots to `screenshots/`
- `npm run check`: all of the above. Run it before calling a change done.
- `npm run build`: production build into `dist/`

## Layout
- `src/main.ts`: Phaser game config and scene list
- `src/config.ts`: every tunable number (sizes, speeds, scores). Tweak feel here first.
- `src/scenes/`: one class per scene. Keys live in `scenes/keys.ts`.
- `src/objects/`: game objects (classes extending Phaser objects, with their physics setup)
- `src/logic/`: pure functions with no Phaser import. All rules and maths go here so they're unit-testable.
- `src/debug/`: URL flags and the `window.__PONG__` test hook (dev mode or `?test` only)
- `tests/unit/`: Vitest, one file per logic module
- `tests/e2e/`: Playwright specs driving the real game in a browser

## Conventions
- Keep scenes thin: input, wiring and visuals. Rules go into `src/logic`.
- New gameplay behaviour gets a unit test (logic) and, when it's user-visible, an e2e test that drives it through the test hook or real key presses.
- Look at the screenshots from the e2e run before reporting visual changes as done.
- Scene state is reset in `create()`, because Phaser reuses the scene instance on restart.
