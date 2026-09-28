/* At 390 the skill ALLOWS a wrap, but only because the column is narrower than the phrase.
   This asks the harder question per phrase: with nowrap applied, does it actually fit? */
import puppeteer from 'puppeteer-core'
const ROUTES = ['/about', '/about/commitment', '/about/esg', '/global-presence', '/services/epc-construction',
  '/services/energy-management', '/services/process-critical-utilities', '/markets', '/markets/bio-lifescience', '/careers', '/contact']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const r of ROUTES) {
  const p = await b.newPage()
  await p.setViewport({ width: 390, height: 900 })
  await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
  await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
  await new Promise(x => setTimeout(x, 800))
  const rows = await p.evaluate(() => {
    const out = []
    for (const em of document.querySelectorAll('h1 em, h2 em, h3 em, h1 .em, h2 .em, h3 .em')) {
      const h = em.closest('h1,h2,h3'); if (!h) continue
      const before = em.getBoundingClientRect()
      if (!before.width) continue
      const lh = parseFloat(getComputedStyle(em).lineHeight)
      if (Math.round(before.height / lh) < 2) continue
      const prev = em.style.whiteSpace
      em.style.whiteSpace = 'nowrap'
      const after = em.getBoundingClientRect()
      const hr = h.getBoundingClientRect()
      const fits = Math.round(after.height / lh) === 1 && after.right <= hr.right + 1 && after.left >= -1
      const page = document.documentElement.scrollWidth <= window.innerWidth + 1
      em.style.whiteSpace = prev
      out.push({ em: em.textContent.trim().slice(0, 36), fits, page, need: Math.round(after.width), have: Math.round(hr.width), fs: getComputedStyle(h).fontSize })
    }
    return out
  })
  for (const x of rows) console.log(r.padEnd(40) + (x.fits && x.page ? 'CAN FIT   ' : 'cannot    ') + `needs ${x.need}px of ${x.have}px @${x.fs}  "${x.em}"`)
  await p.close()
}
await b.close()
