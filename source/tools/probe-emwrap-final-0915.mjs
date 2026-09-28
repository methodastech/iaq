/* 15 Sep: the unbroken emphasis rule, site-wide. For every h1/h2/h3 em on every public route at six widths:
   lines (distinct line boxes of the em) and overflow past the heading's right edge. Pass: 1 line, no overflow
   (under 640px wrapping is allowed by the house rule). Usage: node tools/probe-emwrap-final-0915.mjs [base] [widths] */
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2] || 'http://localhost:5177'
const WIDTHS = (process.argv[3] || '1920,1440,1280,1100,768,390').split(',').map(Number)
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence', '/services', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance',
  '/services/epc-construction', '/services/process-critical-utilities', '/services/tool-installation', '/services/energy-management', '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery',
  '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage', '/projects', '/projects/0', '/projects/7', '/news', '/news/osh-week-safety-pledge-signing', '/careers', '/careers/culture', '/contact', '/investors', '/policies', '/exhibition', '/shortlist']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const fails = []
for (const w of WIDTHS) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  for (const r of ROUTES) {
    try { await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 90000 }) } catch (e) { fails.push({ w, r, err: 'nav timeout' }); continue }
    await new Promise(x => setTimeout(x, 900))
    let res
    try { res = await p.evaluate(async () => {
      const H = () => document.documentElement.scrollHeight; for (let y = 0; y < H() && y < 30000; y += 900) { window.scrollTo(0, y); await new Promise(z => setTimeout(z, 30)) }
      window.scrollTo(0, 0)
      const out = []
      for (const em of document.querySelectorAll('h1 em, h2 em, h3 em')) {
        const h = em.closest('h1,h2,h3'); const hr = h.getBoundingClientRect(); if (!hr.width) continue
        let hidden = false; for (let e = em; e; e = e.parentElement) if (getComputedStyle(e).display === 'none' || getComputedStyle(e).visibility === 'hidden') { hidden = true; break }
        if (hidden || h.closest('.nav, nav, .nav-mega, .nm-lead')) continue
        const tops = new Set([...em.getClientRects()].filter(x => x.width > 1).map(x => Math.round(x.top)))
        const er = em.getBoundingClientRect()
        const over = Math.round(er.right - Math.max(hr.right, document.documentElement.clientWidth))
        const overH = Math.round(er.right - hr.right)
        if (tops.size > 1 || overH > 2) out.push({ h: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 70), em: em.textContent.trim().slice(0, 40), lines: tops.size, overH, cls: (h.className || h.parentElement.className || '').toString().slice(0, 40) })
      }
      return { out, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }
    }) } catch (e) { console.log(JSON.stringify({ w, r, err: String(e).slice(0, 80) })); continue }
    for (const o of res.out) console.log(JSON.stringify({ w, r, ...o }))
    for (const o of res.out) fails.push({ w, r, ...o })
    if (res.sw > res.cw + 1) fails.push({ w, r, overflowX: res.sw - res.cw })
  }
  await p.close()
}
await b.close()
for (const f of fails) console.log(JSON.stringify(f))
console.log('TOTAL', fails.length, 'wrapping-or-overflow at >=640:', fails.filter(f => f.w >= 640).length)
