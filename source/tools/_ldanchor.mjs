// Where does a sidebar jump to #mo-loader land at desktop and phone: the h3 top against the sticky bars' bottom.
import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:57375/design.html', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(800)
  const r = await p.evaluate(async () => {
    const out = {}
    const bars = ['.bmws', '.snav'].map(s => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); const q = e.getBoundingClientRect(); return { s, pos: cs.position, top: cs.top, h: Math.round(q.height), bottom: Math.round(q.bottom) } })
    out.bars = bars; out.barh = getComputedStyle(document.documentElement).getPropertyValue('--barh')
    for (const id of ['mo-loader', 'motion', ...[...document.querySelectorAll('.be-sub[id]')].map(e => e.id).filter(i => i !== 'mo-loader').slice(0, 1)]) {
      document.documentElement.style.scrollBehavior = 'auto'; const t = document.getElementById(id); t.scrollIntoView({ block: 'start', behavior: 'instant' }); await new Promise(r => setTimeout(r, 300))
      const hd = t.querySelector('h3,h2'); out[id] = { sm: getComputedStyle(t).scrollMarginTop, h: Math.round(hd.getBoundingClientRect().top), y: Math.round(scrollY), stickyBottom: Math.max(...[...document.querySelectorAll('.bmws,.snav')].filter(e => getComputedStyle(e).position === 'sticky').map(e => Math.round(e.getBoundingClientRect().bottom))) }
    }
    return out
  })
  console.log(w, JSON.stringify(r)); await p.close()
}
await b.close()
