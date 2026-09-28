import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
const k = await p.$('.cx-kinds'); await k.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 800))
console.log(JSON.stringify(await p.evaluate(() => { const s = document.querySelector('.cx-kinds'); return { cards: s.querySelectorAll('.cx-kc').length, rows: s.querySelectorAll('.cx-kt tbody tr').length, h: Math.round(s.getBoundingClientRect().height), tableW: s.querySelector('.cx-kt').scrollWidth, wrapW: s.querySelector('.cx-kt-wrap').clientWidth } })), 'errors', errs.length, errs.slice(0, 2))
await k.screenshot({ path: OUT + '/kinds-1440.png' })
await b.close()
