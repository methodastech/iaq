import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(r => setTimeout(r, 3000))
const m = await p.evaluate(() => { const svgs = [...document.querySelectorAll('.cyc-mk svg')]; return { n: svgs.length, fitRoot: !!document.querySelector('.cyc-fit'), inFit: document.querySelectorAll('.cyc-fit .cyc-mk svg').length, bbox: svgs.map(s => { try { const b = s.getBBox(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)].join(',') } catch (e) { return 'ERR ' + e.message } }), display: svgs.map(s => getComputedStyle(s).display), fit: svgs.map(s => s.dataset.fit || '-') } })
console.log(JSON.stringify({ errs: errs.filter(e => !/WebGL/.test(e)), m }))
await b.close()
