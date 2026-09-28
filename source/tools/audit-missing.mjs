/* What is still missing on the site: every visible placeholder slot, grouped by page.
   Usage: node tools/audit-missing.mjs <base> */
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence',
  '/services', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance', '/services/tool-installation',
  '/services/epc-construction', '/services/energy-management', '/services/process-critical-utilities',
  '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects', '/projects/0', '/projects/5', '/news', '/careers', '/investors', '/exhibition', '/contact', '/policies', '/shortlist']
const PATTERNS = [
  ['supplied by IAQ', /supplied by IAQ/gi],
  ['to be confirmed / TBC', /to be confirmed|\bTBC\b/gi],
  ['still to come', /still to come/gi],
  ['awaiting / awaited', /awaiting|awaited/gi],
  /* 23 Sep: this used to be /\bconcept\b/gi, which matched IAQ's OWN service copy ("Concept to detailed design
     across CSA and MEP") on 17 routes. Every one of the 22 hits it reported was ordinary copy, not an owed slot,
     and the inflated total sat in HANDOVER for weeks. A slot is a LABEL, so match the label. */
  ['concept note', /concept (?:note|image|visual|render|only)|note: concept/gi],
  ['placeholder', /placeholder/gi],
  ['coming soon', /coming soon/gi],
  ['representation', /representation/gi],
  ['draft wording', /draft wording/gi],
  ['not audited', /not audited/gi],
]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
const rows = [], totals = {}
for (const r of ROUTES) {
  try {
    await p.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await new Promise(x => setTimeout(x, 700))
    const txt = await p.evaluate(() => { const m = document.querySelector('main') || document.body; return m.innerText })
    const hit = {}
    for (const [name, re] of PATTERNS) { const n = (txt.match(re) || []).length; if (n) { hit[name] = n; totals[name] = (totals[name] || 0) + n } }
    const n = Object.values(hit).reduce((a, x) => a + x, 0)
    rows.push({ route: r, n, hit })
  } catch (e) { rows.push({ route: r, n: -1, hit: { error: String(e).slice(0, 60) } }) }
}
rows.sort((a, c) => c.n - a.n)
console.log('PAGES WITH MISSING CONTENT, worst first\n')
for (const x of rows) if (x.n > 0) console.log(String(x.n).padStart(3) + '  ' + x.route.padEnd(38) + Object.entries(x.hit).map(([k, v]) => `${k} ×${v}`).join(' · '))
console.log('\nCLEAN PAGES: ' + rows.filter(x => x.n === 0).map(x => x.route).join(', '))
console.log('\nTOTALS BY KIND'); for (const [k, v] of Object.entries(totals).sort((a, c) => c[1] - a[1])) console.log('  ' + String(v).padStart(3) + '  ' + k)
console.log('\nGRAND TOTAL slots visible: ' + Object.values(totals).reduce((a, x) => a + x, 0) + ' across ' + rows.filter(x => x.n > 0).length + ' of ' + ROUTES.length + ' pages')
await b.close()
