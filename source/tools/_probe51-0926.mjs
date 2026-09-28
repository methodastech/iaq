import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const logs = []; p.on('console', m => { const t = m.text(); if (/vite|hmr|update/i.test(t)) logs.push(t.slice(0, 120)) })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 7000))
await p.evaluate(() => { const e = document.getElementById('globeHost'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150) }); await new Promise(r => setTimeout(r, 2000))
const before = await p.evaluate(() => document.querySelectorAll('#globeHost .globe-tag').length)
/* a save without a content change: the same thing an edit does to the open page */
const f = 'src/scenes/home.js'; fs.writeFileSync(f, fs.readFileSync(f, 'utf8'))
await new Promise(r => setTimeout(r, 9000))
await p.evaluate(() => { const e = document.getElementById('globeHost'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150) }); await new Promise(r => setTimeout(r, 3000))
const after = await p.evaluate(() => ({ tags: document.querySelectorAll('#globeHost .globe-tag').length, reloaded: performance.getEntriesByType('navigation')[0] && Math.round(performance.now()) }))
const host = await p.$('#globeHost'); await host.screenshot({ path: `${OUT}/hmr-after.png` })
console.log(JSON.stringify({ before, after, logs: logs.slice(0, 6) })); await b.close(); process.exit(0)
