import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.goto('http://localhost:5177/?ldhold&launchview', { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 5000))
for (const v of [0.05, 0.35, 0.7]) { await p.evaluate(v => { window.__ldPd = v }, v); await new Promise(r => setTimeout(r, 700)); await p.screenshot({ path: `${OUT}/ld-m-fill-${Math.round(v * 100)}.png` }) }
await p.evaluate(() => { window.__ldPd = 1; window.__ldFin = 1.6 }); await new Promise(r => setTimeout(r, 1500))
await p.screenshot({ path: `${OUT}/ld-m-full.png` })
const a = await p.evaluate(() => { const l = document.getElementById('loader'); return [l.getAttribute('role'), l.getAttribute('aria-valuenow'), getComputedStyle(document.querySelector('.ld-row')).display] })
console.log(JSON.stringify({ a, errs })); await b.close(); process.exit(0)
