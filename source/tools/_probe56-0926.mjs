import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 240000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
let hmr = 0; p.on('console', m => { if (/hot updated/.test(m.text())) hmr++ })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 7000))
const f = 'src/scenes/home.js'
for (let i = 0; i < 10; i++) { fs.writeFileSync(f, fs.readFileSync(f, 'utf8')); await new Promise(r => setTimeout(r, 2500)) }
await p.evaluate(() => { const e = document.getElementById('globeHost'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150) }); await new Promise(r => setTimeout(r, 4000))
const st = await p.evaluate(() => ({ tags: document.querySelectorAll('#globeHost .globe-tag').length, cvs: document.querySelectorAll('#globeHost canvas').length, allCanvas: document.querySelectorAll('canvas').length }))
const host = await p.$('#globeHost'); await host.screenshot({ path: `${OUT}/hmr10.png` })
console.log(JSON.stringify({ hmr, st })); await b.close(); process.exit(0)
