import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
const out = {}
out.instant = await p.evaluate(async () => { const e = document.getElementById('works'); e.scrollIntoView({ block: 'start' }); await new Promise(r => setTimeout(r, 600)); return Math.round(e.getBoundingClientRect().top) })
out.smooth = await p.evaluate(async () => { window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); const e = document.getElementById('works'); e.scrollIntoView({ behavior: 'smooth', block: 'start' }); await new Promise(r => setTimeout(r, 2500)); return Math.round(e.getBoundingClientRect().top) })
out.zoom = await p.evaluate(() => getComputedStyle(document.documentElement).zoom)
out.lenis = await p.evaluate(() => !!(window.lenis || document.documentElement.classList.contains('lenis')))
console.log(JSON.stringify(out)); await b.close(); process.exit(0)
