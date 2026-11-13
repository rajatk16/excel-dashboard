import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    open: false,
  },

  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    manifest: true,
    reportCompressedSize: true,
  },
});
