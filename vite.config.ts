/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Demo build is served from /demos/sofia-shop/ on the portfolio site.
export default defineConfig(({ mode }) => ({
  base: mode === 'demo' ? '/demos/sofia-shop/' : './',
  plugins: [react()],
  define: { __DEMO__: JSON.stringify(mode === 'demo') },
  test: { environment: 'jsdom', include: ['src/**/*.test.ts'] },
}));
