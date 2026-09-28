/* 25 Sep 2026: headless captures of the pages changed in the evening pass (the Browser pane returns stale frames
   while hidden). Usage: node tools/shot-0925.mjs <base> <outdir> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:52943', out = '/tmp/shots', only = ''] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const TARGETS = [
  { url: '/about/commitment', shots: [['pillars', '.cc-pillars', 5200], ['certs', '#certificates .cc-cv', 1500], ['badges', '#recognition .cc-in', 1200], ['policies', '#qehs .cc-in', 1200], ['metrics', '#metrics .cc-in', 2500]],
    checks: { certTabs: '.cc-cv-tab', marks: '.cc-vm', globe: '.cc-globe-host canvas', badges: '.cc-badge img', policyPdf: 'a[href$="IAQ-Quality-Policy.pdf"]' } },
  { url: '/services/epc-construction', shots: [['epc-models', '.un-models .pg-in', 1200], ['epc-why', '.un-deliver .pg-in', 1200], ['epc-scope', '.un-scope .pg-in', 1200]],
    checks: { bim: '.un-bim', svcs: '.un-svcs', pick: '.un-pick', pickOther: '.un-pick-row dd span', beats: '.un-beat' } },
  { url: '/services/energy-management', shots: [['efm-svc7', '.un-svc7 .pg-in', 1200], ['efm-pains', '.un-what .pg-in', 1200], ['efm-intro', '.un-scope .pg-in', 1200]],
    checks: { svc7: '.un-svc7-grid li', pick: '.un-pick', painsHead: '.un-pains-h', intro: '.un-intro', models: '.un-models', bim: '.un-bim' } },
  { url: '/services/tool-installation', shots: [['tool-models', '.un-models .pg-in', 1200]], checks: { pick: '.un-pick', bim: '.un-bim', svcs: '.un-svcs' } },
  { url: '/services', shots: [['services-top', 'body', 1500]], checks: { work: '.sm-work, [aria-labelledby="sm-work-h"]', proof: '#proof-h', units: '.sm-units', flow: '.cf, .cycle-flow, .cb' } },
  { url: '/checklist.html', shots: [['checklist', 'body', 1200]], checks: { c24: '[data-id="c24a"]', b25: '[data-id="b25a"]' } },
]
const report = []
for (const t of TARGETS) {
  if (only && !t.url.includes(only)) continue
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) })
  await p.goto(base + t.url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => errs.push('goto: ' + e.message))
  await new Promise(r => setTimeout(r, 1200))
  const checks = {}
  for (const [k, sel] of Object.entries(t.checks)) checks[k] = await p.$$eval(sel, els => els.length).catch(() => -1)
  for (const [name, sel, wait] of t.shots) {
    const el = await p.$(sel)
    if (!el) { errs.push('missing ' + sel); continue }
    await p.evaluate(s => { const e = document.querySelector(s); e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -20) }, sel)
    await new Promise(r => setTimeout(r, wait))
    try { await el.screenshot({ path: `${out}/${name}.png` }) } catch (e) { await p.screenshot({ path: `${out}/${name}.png` }) }
  }
  report.push({ url: t.url, checks, errs })
  await p.close()
}
await b.close()
console.log(JSON.stringify(report, null, 1))
