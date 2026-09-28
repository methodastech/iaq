import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
const k = await p.$('.cx-kinds'); await k.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 600))
const a = await p.evaluate(() => ({ tiles: document.querySelectorAll('.cx-kst').length, cards: document.querySelectorAll('.cx-kinds-det .cx-kc').length, keyBand: !!document.querySelector('.cx-key-band'), h: Math.round(document.querySelector('.cx-kinds').getBoundingClientRect().height) }))
await k.screenshot({ path: OUT + '/kinds-summary.png' })
await p.click('.cx-kinds-sw button:nth-child(2)'); await new Promise(r => setTimeout(r, 500))
const c = await p.evaluate(() => ({ tiles: document.querySelectorAll('.cx-kst').length, cards: document.querySelectorAll('.cx-kinds-det .cx-kc').length, rows: document.querySelectorAll('.cx-kinds-det .cx-kt tbody tr').length }))
console.log('summary', JSON.stringify(a), '| detailed', JSON.stringify(c), '| errors', errs.length)
await b.close()
