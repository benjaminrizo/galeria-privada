import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo las llamadas a /api van al gateway (ADR 0002: es el único
    // punto de entrada). En docker-compose esto lo hace nginx.
    proxy: {
      '/api': { target: process.env.GATEWAY_URL || 'http://localhost:3000', changeOrigin: true },
    },
  },
});
