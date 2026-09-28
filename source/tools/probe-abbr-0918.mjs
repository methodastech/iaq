// 18 Sep: "meaning, everything need to put bracket". Lists, per Codex section, short forms whose FIRST
// appearance has no meaning beside it, and captures the fab story and plain cards.
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '/tmp'
import { ABBR } from '../src/lib/abbr.js'
const KEYS = ['PCU & TTI','EPCC','EPCM','EPC','EFM','PCU','TTI','CSA','MEP','M&E','ESCO','BIM','PCW','CDA','UPW','PV','HVAC','ACMV','FFUs','FFU','VMB','SLA','T&C','ATF','OEM']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const w of [1440, 390]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/?admin', { waitUntil: 'networkidle0' })   // home first: the old ig- collision trap
  await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1200))
  const r = await p.evaluate((KEYS, ABBR) => {
    const secs = [...document.querySelectorAll('.cx-key-band, .cx-open, .cx-part, .cx-bg, .cxs, .fs-panel, .rx')]
    const out = []
    for (const s of secs) {
      const t = s.innerText
      const miss = []
      const done = new Set()
      const rx = new RegExp('(?<![A-Za-z0-9])(' + KEYS.map(k => k.replace(/[&]/g, '&')).join('|') + ')(?![A-Za-z0-9])', 'g')
      let m
      while ((m = rx.exec(t))) {
        const k = m[1]; if (done.has(k)) continue; done.add(k)
        const next = t.slice(m.index + k.length, m.index + k.length + 3), prev = t.slice(Math.max(0, m.index - 2), m.index)
        if (!t.toLowerCase().includes(ABBR[k].toLowerCase())) miss.push(k)
      }
      if (miss.length) out.push((s.id || s.className.split(' ').slice(0, 2).join('.')) + ': ' + miss.join(', '))
    }
    return { ab: document.querySelectorAll('.ab-x').length, miss: out, overflow: document.documentElement.scrollWidth - innerWidth }
  }, KEYS, ABBR)
  console.log(w, 'brackets', r.ab, 'overflow', r.overflow, 'errors', errs.length, errs.slice(0, 2))
  r.miss.forEach(x => console.log('   first use without meaning:', x))
  for (const [sel, name] of [['.fs', 'fab'], ['.cx-plain', 'plain']]) {
    const el = await p.$(sel); if (!el) { console.log('no', sel); continue }
    await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 500))
    await el.screenshot({ path: `${OUT}/abbr-${w}-${name}.png` })
  }
  await p.close()
}
await b.close()
