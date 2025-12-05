// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist', // Vite will put the built site here
    emptyOutDir: true
  }
});
