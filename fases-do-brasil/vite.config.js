import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: true, // acessível na rede local (celular / TV)
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks: { three: ['three'], vendor: ['jquery', 'bootstrap'] } },
    },
  },
});
