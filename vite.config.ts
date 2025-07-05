import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/archive-api': {
        target: 'https://archive.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/archive-api/, ''),
        secure: true,
      }
    }
  }
});