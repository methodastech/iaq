import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] })
for (const [url, sel, name] of [['/services', '.cyc-band', 'svc-ring'], ['/services?cycle=flow', '.cyc-band', 'svc-flow'], ['/', '.lpx-band', 'home-loop']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177' + url, { waitUntil: 'networkidle0', timeout: 60000 })
  const el = await p.$(sel); if (!el) { console.log('missing', url, sel); await p.close(); continue }
  await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2500))
  const h = await el.evaluate(e => Math.round(e.getBoundingClientRect().height))
  await el.screenshot({ path: `${OUT}/${name}.png` }); console.log(name, h + 'px'); await p.close()
}
await b.close()
