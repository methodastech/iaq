import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.goto('http://localhost:5177/projects', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
const out = {}
for (const label of ['About', 'Services', 'Markets', 'Careers']) {
  let tab; for (const a of await p.$$('.nav-has > a')) if ((await a.evaluate(e => e.textContent)) === label) tab = a
  await tab.hover(); await new Promise(r => setTimeout(r, 1300))
  const mega = await tab.evaluateHandle(e => e.parentElement.querySelector('.nav-mega'))
  const clip = await mega.evaluate(m => { const r = m.getBoundingClientRect(); return { x: r.left - 4, y: r.top - 70, width: r.width + 8, height: r.height + 76 } })
  const read = () => mega.evaluate(m => ({ eyeb: m.querySelector('.nm-eyeb')?.textContent, title: m.querySelector('.nm-lead-copy b')?.textContent, cta: m.querySelector('.nm-open')?.textContent.trim(), heads: [...m.querySelectorAll('.nm-seth')].map(h => h.textContent.replace(/\s+/g, ' ').trim()), tags: [...m.querySelectorAll('.nm-tag')].map(t => t.textContent) }))
  out[label + ':rest'] = await read()
  await p.screenshot({ path: `${OUT}/lvl-${label}.png`, clip, captureBeyondViewport: false })
  const rows = await mega.asElement().$$('.nm-rows > a')
  if (rows[0]) { await rows[0].hover(); await new Promise(r => setTimeout(r, 900)); out[label + ':row0'] = await read() }
  if (rows[rows.length - 1]) { await rows[rows.length - 1].hover(); await new Promise(r => setTimeout(r, 900)); out[label + ':rowLast'] = await read(); await p.screenshot({ path: `${OUT}/lvl-${label}-hover.png`, clip, captureBeyondViewport: false }) }
  await p.mouse.move(10, 850); await new Promise(r => setTimeout(r, 700))
}
console.log(JSON.stringify({ out, errs }, null, 1))
await b.close()
