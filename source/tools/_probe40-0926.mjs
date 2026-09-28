import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], TAG = process.argv[3] || 'ld'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('http://localhost:5177/?ldhold&launchview', { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 6000))
await p.evaluate(() => { window.__ldFin = 1.6 }); await new Promise(r => setTimeout(r, 1500))
await p.screenshot({ path: `${OUT}/${TAG}.png` })
const n = await p.evaluate(() => { const c = document.getElementById('loaderCv'); return c ? [c.width, c.height] : null })
console.log(JSON.stringify({ n, errs })); await b.close(); process.exit(0)
