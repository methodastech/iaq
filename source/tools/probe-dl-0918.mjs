import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
const btn = await p.evaluate(() => { const a = document.querySelector('.cx-dl a'); return a.textContent + ' | ' + a.getAttribute('href') + ' | download=' + a.getAttribute('download') + ' | note: ' + document.querySelector('.cx-dl-note').textContent })
const head = await p.$('.cx-head'); await head.screenshot({ path: OUT + '/dl-codex-head.png' })
await p.goto('http://localhost:5177/portal/downloads?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 800))
const card = await p.evaluate(() => { const s = document.querySelector('.cms-set'); return s.querySelector('h2').textContent + ' | ' + s.querySelector('.cta').getAttribute('href') + ' | ' + s.querySelector('.cms-dl-note').textContent + ' | previews loaded ' + [...s.querySelectorAll('img')].filter(i => i.naturalWidth).length })
const el = await p.$('.cms-set'); await el.screenshot({ path: OUT + '/dl-portal-card.png' })
console.log('Codex page button:', btn); console.log('Downloads tab:', card); console.log('errors', errs.length)
await b.close()
