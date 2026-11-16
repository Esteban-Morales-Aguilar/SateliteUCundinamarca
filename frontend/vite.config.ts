/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// En desarrollo, /api y el WebSocket pasan por Traefik (docker compose up -d).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'SpaceNet Lab', short_name: 'SpaceNet', lang: 'es', start_url: '/', display: 'standalone',
        description: 'ODC: redes inalámbricas seguras para CubeSats y CanSat educativos',
        theme_color: '#003366', background_color: '#f6f8fb',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        sourcemap: false,
        navigateFallbackDenylist: [/^\/api\//],       // la API nunca se sirve desde el service worker
        runtimeCaching: [
          { urlPattern: /\/api\/v1\/content\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'content-api' } },
          { urlPattern: /tile\.openstreetmap\.org/, handler: 'CacheFirst', options: { cacheName: 'map-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } } },
        ],
      },
    }),
  ],
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost', changeOrigin: true, ws: true } } },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 900 },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'], css: false },
});
