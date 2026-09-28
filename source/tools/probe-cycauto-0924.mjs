import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
await p.mouse.move(1400, 880)
const idx = () => p.evaluate(() => [...document.querySelectorAll('.cyc-node')].findIndex(n => n.classList.contains('on')))
const a = await idx(); await new Promise(r => setTimeout(r, 3400)); const c = await idx(); await new Promise(r => setTimeout(r, 3100)); const d = await idx()
const disc = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('.cyc-disc')); return { bg: s.backgroundColor, border: s.borderTopWidth, shadow: s.boxShadow } })
console.log('active over time', a, c, d, '| disc', JSON.stringify(disc), '| errors', errs.length)
const el = await p.$('.cyb'); await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 800)); await el.screenshot({ path: OUT + '/cyb-nocircle.png' })
await b.close()
