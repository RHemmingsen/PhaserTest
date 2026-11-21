# PhaserTest

A Phaser 4 + TypeScript + Vite playground. The placeholder game is Pong.

```bash
npm install
npm run dev        # open http://localhost:5173
```

Controls: **W/S** or **↑/↓**, or drag with a finger/mouse. **Space** starts, **Esc** goes back to the menu. First to 7 wins.

Add `?debug` to the URL to see the physics bodies.

## Checks

```bash
npm run check      # typecheck + unit tests + browser play-tests
```

The browser tests need Playwright's Chromium once: `npx playwright install chromium`.
