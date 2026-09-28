/* Where does the rule actually stop working? Apply nowrap at each narrow width and find the first
   width at which any phrase overflows its heading or pushes the page sideways. */
import puppeteer from 'puppeteer-core'
const ROUTES = ['/about', '/about/commitment', '/about/esg', '/global-presence', '/services/epc-construction',
  '/services/energy-management', '/services/process-critical-utilities', '/markets', '/markets/bio-lifescience', '/careers', '/contact', '/', '/services', '/projects', '/news']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const w of [430, 390, 375, 360, 344, 320]) {
  const bad = []
  for (const r of ROUTES) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
    try {
      await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
      await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
      await new Promise(x => setTimeout(x, 700))
      const o = await p.evaluate(() => {
        const st = document.createElement('style'); st.id = 'emtest'
        st.textContent = 'h1 em,h2 em,h3 em{white-space:nowrap}'
        document.head.appendChild(st)
        const out = []
        for (const em of document.querySelectorAll('h1 em, h2 em, h3 em')) {
          const h = em.closest('h1,h2,h3'); const er = em.getBoundingClientRect(); if (!er.width) continue
          const hr = h.getBoundingClientRect()
          if (er.right > hr.right + 1 || er.left < -1) out.push(em.textContent.trim().slice(0, 30) + ` (+${Math.round(er.right - hr.right)}px)`)
        }
        const sideways = document.documentElement.scrollWidth > window.innerWidth + 1
        st.remove()
        return { out, sideways }
      })
      if (o.out.length) bad.push(r + ': ' + o.out.join(', '))
      if (o.sideways) bad.push(r + ': PAGE SIDEWAYS')
    } catch (e) { bad.push(r + ' FAIL') }
    await p.close()
  }
  console.log(String(w).padEnd(5) + (bad.length ? 'FAILS · ' + bad.join(' | ') : 'all phrases fit on one line'))
}
await b.close()
