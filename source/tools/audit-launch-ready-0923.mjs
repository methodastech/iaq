/* Launch readiness (checklist P47/q47, the Brand Method half): serve dist-launch and count what a visitor would
   actually see. Two things are gated: the owed-content slots, and any internal surface leaking into the public bundle.
   Usage: node tools/audit-launch-ready-0923.mjs http://localhost:3000 */
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2] || 'http://localhost:3000'
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence',
  '/services', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance', '/services/tool-installation',
  '/services/epc-construction', '/services/energy-management', '/services/process-critical-utilities',
  '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects', '/projects/0', '/projects/5', '/news', '/careers', '/investors', '/exhibition', '/contact', '/policies', '/shortlist']
/* a slot is a LABEL the build prints where a fact is owed. "concept" alone is NOT one: IAQ's own service copy says
   "Concept to detailed design", which is why the older audit read 22 phantom slots. */
const SLOT = [
  ['supplied by IAQ', /supplied by IAQ/gi],
  ['to be confirmed / TBC', /to be confirmed|\bTBC\b/gi],
  ['still to come', /still to come/gi],
  ['awaiting / awaited', /awaiting|awaited/gi],
  ['placeholder', /placeholder/gi],
  ['coming soon', /coming soon/gi],
  ['representation', /representation/gi],
  ['draft wording', /draft wording/gi],
  ['concept note (labelled)', /concept (?:note|image|visual|render|only)|note: concept/gi],
]
const INTERNAL = [['portal', /\/portal\b/g], ['codex', /\/codex\b/g], ['booth', /\/booth\b/g], ['semicon', /\/semicon\b/g], ['demo ribbon', /Prototype · Brand Method|demo by Brand Method/gi]]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
const rows = [], tot = {}, leak = {}
let errs = 0
p.on('pageerror', () => errs++)
for (const r of ROUTES) {
  try {
    await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 60000 })
    await p.evaluate(() => new Promise(r => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1200); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); r() } }, 60) }))
    await new Promise(x => setTimeout(x, 1400))
    const { txt, html } = await p.evaluate(() => ({ txt: (document.querySelector('main') || document.body).innerText, html: document.body.innerHTML }))
    const hit = {}
    for (const [k, re] of SLOT) { const n = (txt.match(re) || []).length; if (n) { hit[k] = n; tot[k] = (tot[k] || 0) + n } }
    for (const [k, re] of INTERNAL) { const n = (html.match(re) || []).length; if (n) leak[k] = (leak[k] || 0) + n }
    rows.push({ r, n: Object.values(hit).reduce((a, x) => a + x, 0), hit })
  } catch (e) { rows.push({ r, n: -1, hit: { error: String(e).slice(0, 50) } }) }
}
await b.close()
rows.sort((a, c) => c.n - a.n)
console.log('LAUNCH BUNDLE · ' + BASE + '\n')
for (const x of rows) if (x.n > 0) console.log(String(x.n).padStart(3) + '  ' + x.r.padEnd(38) + Object.entries(x.hit).map(([k, v]) => `${k} ×${v}`).join(' · '))
console.log('\nCLEAN: ' + rows.filter(x => x.n === 0).length + ' of ' + ROUTES.length + ' routes')
console.log('SLOTS BY KIND: ' + (Object.keys(tot).length ? Object.entries(tot).sort((a, c) => c[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ') : 'none'))
console.log('TOTAL SLOTS: ' + Object.values(tot).reduce((a, x) => a + x, 0))
console.log('INTERNAL SURFACES IN THE PUBLIC BUNDLE: ' + (Object.keys(leak).length ? Object.entries(leak).map(([k, v]) => `${k}=${v}`).join('  ') : 'none'))
console.log('PAGE ERRORS: ' + errs)
