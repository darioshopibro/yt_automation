import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    fs: {
      // Allow serving files from the entire YT automation directory
      // so we can dynamically import Generated_*.tsx from videos/
      allow: ['.', '/Users/dario61/Desktop/YT automation'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
  // Resolve remotion and phosphor-icons for imported video components
  optimizeDeps: {
    include: ['remotion', '@remotion/player', '@phosphor-icons/react'],
  },
});
