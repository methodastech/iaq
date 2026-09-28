// the 3D stage alone, at 2x, for each of three picks
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
const band = await p.$('.sm-map-duo'); await band.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 3500))
for (const [sel, name] of [['.rx-n.n-u', 0, 'epc'], ['.rx-n.n-w', 1, 'mep'], ['.rx-n.n-s', 5, 'hookup']].map(([s, i, n]) => [[s, i], n])) {
  await p.evaluate(async ([s, i]) => { const n = document.querySelectorAll('.sm-map ' + s)[i]; n.click(); await new Promise(r => setTimeout(r, 300)); if (!n.classList.contains('me')) n.click() }, sel); await new Promise(r => setTimeout(r, 2600))
  const el = await p.$('.sm-map-stage .fv'); await el.screenshot({ path: `${OUT}/studio-${name}.png` })
}
await b.close()
