import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
const band = await p.$('.sm-map-duo'); await band.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 3500))
await p.evaluate(async () => { const u = document.querySelectorAll('.sm-map .rx-n.n-u'); u[1].click(); await new Promise(r => setTimeout(r, 300)); if (!u[1].classList.contains('me')) u[1].click() }); await new Promise(r => setTimeout(r, 2800))
await band.screenshot({ path: OUT + '/duo-2x.png' })
await b.close()
