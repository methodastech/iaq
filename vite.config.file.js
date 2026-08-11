import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* A SECOND build target: one self-contained HTML file that opens by double-clicking.
   The normal build emits <script type="module">, and Chrome blocks module scripts loaded over
   file:// under CORS (origin "null"), so dist/index.html is blank when opened as a file no matter
   how the paths are written. A classic IIFE script has no such restriction.
   Cost: no code splitting, so every route ships in one bundle. That is the right trade for a
   deliverable meant to be emailed or opened off a USB stick, and the wrong one for the web, which
   is why this is a separate target and not a change to the default. */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist-file',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app.[ext]' },
    },
  },
})
