import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* 8 Oct 2026: the exhibition deck as its own site (deck.html, src/deck-main.jsx). publicDir is off so the 450 MB public
   folder is not copied; tools/pack-deck-1008.py copies only the files the built deck references, adds the 3D app, the
   local server and the readme, and zips it. */
export default defineConfig({
  base: '/',
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist-deck',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: { input: 'deck.html' },
  },
})
