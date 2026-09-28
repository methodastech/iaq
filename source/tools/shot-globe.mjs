import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 60000 })
const el = await p.$('#globe, .globe, canvas.gl-globe, [class*="globe"] canvas, [class*="globe"]')
if (!el) { console.log('no globe element found'); const cs = await p.$$eval('canvas', a => a.map(c => c.className + ' ' + c.width + 'x' + c.height)); console.log(cs) }
else { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 2500)); await el.screenshot({ path: `${OUT}/globe.png` }); console.log('globe shot') }
await b.close()
