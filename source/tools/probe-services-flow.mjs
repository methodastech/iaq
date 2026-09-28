/* the Services bands with the choreography let run (no reduced motion): does each band reach its end state? */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
const out = {}
for (const sel of ['.sm-units', '.sm-qs', '.sm-work']) {
  const el = await p.$(sel); await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 300))
  const early = await p.evaluate(s => { const e = document.querySelector(s); const t = e.querySelector('.sm-uc, .sm-cell > *, .sm-wc li'); return { inCls: e.classList.contains('in'), firstOp: t && getComputedStyle(t).opacity } }, sel)
  await new Promise(r => setTimeout(r, 2600))
  const late = await p.evaluate(s => { const e = document.querySelector(s); const hidden = [...e.querySelectorAll('.sm-uc, .sm-cell > *, .sm-wc li, .sm-life li > *, .sm-q-n, .sm-cmp-r span i')].filter(x => parseFloat(getComputedStyle(x).opacity) < 0.99 || /scale\(0/.test(getComputedStyle(x).transform)).length; const bar = e.querySelector('.sm-life-bar i'); return { hiddenAfter: hidden, barScale: bar && getComputedStyle(bar).transform } }, sel)
  out[sel] = { ...early, ...late }
  await el.screenshot({ path: `${OUT}/flow-${sel.slice(1)}.png` })
}
console.log(JSON.stringify(out), 'errors', errs.length ? errs : 0); await b.close()
