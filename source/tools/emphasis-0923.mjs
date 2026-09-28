/* the house unbroken-emphasis rule, measured at the widths the skill names.
   Pass per em: lines = 1 (except under 640px, where the skill allows a wrap) and em.right <= h.right. */
import puppeteer from 'puppeteer-core'
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/esg', '/global-presence',
  '/services', '/services/design', '/services/epc-construction', '/services/energy-management', '/services/process-critical-utilities',
  '/markets', '/markets/semiconductor', '/markets/bio-lifescience', '/projects', '/projects/0', '/news', '/careers', '/contact', '/policies']
const WIDTHS = [2066, 1960, 1660, 1440, 1280, 430, 390, 375, 360]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu'] })
const bad = []
for (const w of WIDTHS) {
  for (const r of ROUTES) {
    const p = await b.newPage()
    await p.setViewport({ width: w, height: 900 })
    try {
      await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
      await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
      await new Promise(x => setTimeout(x, 900))
      const rows = await p.evaluate(() => {
        const out = []
        for (const em of document.querySelectorAll('h1 em, h2 em, h3 em, h1 .em, h2 .em, h3 .em')) {
          const h = em.closest('h1,h2,h3'); if (!h) continue
          const er = em.getBoundingClientRect(); if (!er.width) continue
          const lines = Math.round(er.height / parseFloat(getComputedStyle(em).lineHeight))
          const over = Math.round(er.right - h.getBoundingClientRect().right)
          out.push({ em: em.textContent.trim().slice(0, 40), lines, over, ws: getComputedStyle(em).whiteSpace })
        }
        return { rows: out, sideways: document.documentElement.scrollWidth > window.innerWidth + 1 }
      })
      for (const x of rows.rows) if (x.lines > 1 || x.over > 0) bad.push({ w, r, ...x })
      if (rows.sideways) bad.push({ w, r, em: '(page)', lines: 0, over: 0, ws: 'SIDEWAYS' })
    } catch (e) { bad.push({ w, r, em: 'FAIL ' + String(e).slice(0, 40), lines: 0, over: 0, ws: '' }) }
    await p.close()
  }
}
await b.close()
if (!bad.length) console.log('PASS · every coloured phrase on one line at ' + WIDTHS.join(', '))
else {
  console.log('width  route                           lines over ws        phrase')
  for (const x of bad) console.log(String(x.w).padEnd(6) + x.r.padEnd(32) + String(x.lines).padEnd(6) + String(x.over).padEnd(5) + String(x.ws).padEnd(10) + x.em)
}
