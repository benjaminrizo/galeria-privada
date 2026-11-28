// Vitest es lo idiomático en un proyecto Vite (capítulo 8, Guideline 8b).
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom', // hace falta para localStorage
    include: ['src/**/*.test.{js,jsx}'],
    coverage: { provider: 'v8', include: ['src/**/*.{js,jsx}'] },
  },
});
