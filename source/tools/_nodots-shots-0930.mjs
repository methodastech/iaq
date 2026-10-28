/* 30 Sep: element crops of the rewritten spots, for the no-dots sweep */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const SPOTS = [['/', '.hero-inner .eyebrow', 'home-eyebrow'], ['/markets/semiconductor', '.pg-pc', 'market-card'], ['/markets', '.pg-pc', 'markets-card'],
  ['/careers', '.job.open .jd-meta, .job-body .jd-meta', 'careers-meta'], ['/lp/semiconductor', '.lp-foot', 'lp-foot'], ['/lp/semiconductor', '.lp-pc', 'lp-card'], ['/about/commitment', '.cc-card-k', 'commit-card'],
  ['/contact', '.of-o', 'contact-office'], ['/news', '.pg-note', 'news-note'], ['/global-presence', '.pg-note', 'gp-note'], ['/careers/role/IAQ-ENG-01', '.pg-head-lede', 'role-lede'], ['/projects', '.readout', 'projects-readout'], ['/projects', '.pc', 'projects-card']]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
let last = ''
for (const [r, sel, name] of SPOTS) {
  if (r !== last) { await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle2', timeout: 45000 }); await new Promise(x => setTimeout(x, 2500)); await p.evaluate(() => document.querySelectorAll('.bmws').forEach(e => e.remove())); last = r }
  if (name === 'careers-meta') { await p.evaluate(() => { const h = document.querySelector('.job-head'); h.scrollIntoView({ block: 'center' }); h.click() }); await new Promise(x => setTimeout(x, 1200)) }
  const el = await p.$(sel); if (!el) { console.log(name, 'MISSING', sel); continue }
  await p.evaluate(e => { document.documentElement.style.scrollBehavior = 'auto'; e.scrollIntoView({ block: 'center' }) }, el); await new Promise(x => setTimeout(x, 1400))
  const txt = await p.evaluate(e => e.innerText.replace(/\s+/g, ' ').slice(0, 160), el)
  const bb = await el.boundingBox(); const pad = 14; if (!bb) { console.log(name.padEnd(18), "| (no box) |", txt, "|", await p.evaluate(e => e.textContent.trim().slice(0, 120), el)); continue }
  await el.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name.padEnd(18), '|', txt)
}
await b.close()
