import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: 1440, height: 900 }); await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 60000 })
console.log('home marks', JSON.stringify(await p.evaluate(() => ({ iaqMarks: document.querySelectorAll('svg[class*="iaq-"]').length, sigMarks: document.querySelectorAll('.iaq-sig, .glance svg').length }))), 'errors', errs.length ? errs : 0)
for (const path of ['/about', '/services/epc-construction', '/careers']) { await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 60000 }); console.log(path, 'errors', errs.length ? errs : 0) }
await b.close()
