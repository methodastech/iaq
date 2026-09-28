import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await new Promise(r => setTimeout(r, 4000))
console.log(JSON.stringify({ errs: errs.filter(e => !/WebGL/.test(e)).slice(0, 5), sec: await p.evaluate(() => { const s = document.getElementById('build3d'); return s ? { frame: !!s.querySelector('iframe'), cls: s.className } : null }) }))
await b.close()
