import puppeteer from 'puppeteer-core'
const routes = ['/', '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage', '/projects', '/news', '/careers', '/about/leadership', '/about/esg', '/global-presence', '/contact', '/services', '/services/design']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [390, 1440]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  for (const r of routes) {
    await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle0', timeout: 60000 })
    const res = await p.evaluate(() => {
      const out = []
      for (const em of document.querySelectorAll('h1 em, h2 em')) { if (em.closest('nav, footer, .bmws')) continue; const rg = document.createRange(); rg.selectNodeContents(em); const lines = new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size; if (lines > 1) out.push(em.textContent.trim()) }
      const h1 = document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim()
      return { h1, split: out, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }
    })
    if (res.split.length || res.overflow || w === 1440) console.log(w, r, JSON.stringify(res))
  }
  console.log(w, 'errors', errs.length ? errs : 0)
  await p.close()
}
await b.close()
