import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/* 25 Sep: the Client files tab, served from outside the repo on dev and preview only (never part of a build) */
import clientFiles from './tools/vite-client-files.mjs'

export default defineConfig({
  /* 10 Sep: absolute base, required for nested paths under BrowserRouter (./assets from /services/design would resolve wrong) */
  base: '/',
  plugins: [react(), clientFiles()],
  /* Take the port from the environment. Vite does NOT read PORT on its own, so with the hardcoded
     --port flag removed from launch.json this is what lets the harness assign a free port when
     another session already holds the usual one. Falls back to Vite's own default when unset. */
  server: { host: true, port: process.env.PORT ? Number(process.env.PORT) : undefined },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        /* the 5-second value-proposition target: three.js and gsap only load
           with the scenes that use them, and the react vendor chunk caches
           independently of app code */
        manualChunks (id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
