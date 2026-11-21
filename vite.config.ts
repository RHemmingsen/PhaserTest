import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the built game works from any folder or static host.
  base: './',
  server: {
    port: 5173,
    host: true, // reachable from your phone on the same network
  },
  build: {
    outDir: 'dist',
    // Phaser alone is ~1.2 MB minified, so silence the default 500 kB warning.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
