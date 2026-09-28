/* capture named elements on a route after scrolling them into view: node tools/probe-elements.mjs <route> <outDir> <sel1,sel2,...> */
import puppeteer from 'puppeteer-core'
const [route, OUT, sels] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177' + route, { waitUntil: 'networkidle0', timeout: 60000 })
for (const sel of sels.split(',')) {
  const el = await p.$(sel); if (!el) { console.log('missing', sel); continue }
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 2500))
  await el.screenshot({ path: `${OUT}/${sel.replace(/\W+/g, '')}.png` }); console.log('saved', sel)
}
console.log('errors', errs.length ? errs : 0); await b.close()
