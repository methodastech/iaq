/* the 'concept note' bucket in audit-missing matches the bare word "concept", which is also a real service stage.
   This prints the sentence around every hit so a real placeholder can be told from ordinary copy. */
import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:5177'
const ROUTES = ['/', '/services/design', '/services/epc-construction', '/services/tool-installation', '/services/energy-management', '/services/process-critical-utilities',
  '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects/0', '/projects/5', '/global-presence', '/investors']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
for (const r of ROUTES) {
  await p.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await new Promise(x => setTimeout(x, 700))
  const txt = await p.evaluate(() => (document.querySelector('main') || document.body).innerText)
  const hits = txt.split(/\n+/).filter(l => /\bconcept\b/i.test(l))
  if (hits.length) console.log(r + '\n' + hits.map(h => '    · ' + h.trim().slice(0, 150)).join('\n'))
}
await b.close()
