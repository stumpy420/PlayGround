import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Three.js is a single large vendor dependency; keep it out of the app chunk.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
