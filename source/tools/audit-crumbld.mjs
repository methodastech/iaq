/* Verify every BreadcrumbList on the site resolves to a real URL. Usage: node tools/audit-crumbld.mjs <base> */
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 })
const ROUTES = ['/services/design', '/services/epc-construction', '/markets/ev-battery', '/markets/semiconductor', '/about/esg', '/about/history', '/about/commitment', '/about/leadership', '/global-presence', '/projects/1', '/projects/0']
let hash = 0, ok = 0, missing = []
for (const r of ROUTES) {
  await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(x => setTimeout(x, 400))
  const ld = await p.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).filter(t => /BreadcrumbList/.test(t)).map(t => JSON.parse(t)))
  if (!ld.length) { missing.push(r); continue }
  const items = ld[0].itemListElement.map(i => i.item)
  const bad = items.filter(u => /\/#/.test(u) || !/^https:\/\/iaqtechnology\.com\//.test(u))
  if (bad.length) { hash++; console.log('BAD ', r, JSON.stringify(bad)) } else { ok++; console.log('ok  ', r, items.join(' > ')) }
}
console.log(`\nreal-path breadcrumbs ${ok}/${ROUTES.length} · hash or malformed ${hash} · no BreadcrumbList ${missing.length}${missing.length ? ' (' + missing.join(', ') + ')' : ''}`)
await b.close()
