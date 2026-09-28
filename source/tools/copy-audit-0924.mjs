import puppeteer from 'puppeteer-core'
import fs from 'fs'
const routes = process.argv.slice(3)
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const all = {}
for (const r of routes) {
  try {
    const resp = await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle0', timeout: 60000 })
    all[r] = await p.evaluate(() => {
      const T = e => e.textContent.replace(/\s+/g, ' ').trim()
      const skip = e => e.closest('nav, footer, .bmws, .admin, [class*="bmws"], .cx-page, .pt-')
      const h = [...document.querySelectorAll('h1, h2, h3')].filter(e => !skip(e)).map(e => e.tagName.toLowerCase() + ': ' + T(e)).filter(t => t.length > 4)
      const ledes = [...document.querySelectorAll('.pg-lede, .lede, .cu-p, .ig-copy, .cyc-lede, .pg-head-lede, .un-lede, .cu-lede, p.lead, .sm-note, .hero p, header p')].filter(e => !skip(e)).map(T).filter(t => t.length > 10)
      const ctas = [...document.querySelectorAll('a.btn, a[class*="cta"], a[class*="btn"], button[class*="btn"], .pg-more, .ig-pill, .faq-more, .sm-uc-go, .cu-link, a[class*="more"]')].filter(e => !skip(e)).map(T).filter(t => t.length > 2)
      return { h: [...new Set(h)], ledes: [...new Set(ledes)], ctas: [...new Set(ctas)] }
    })
  } catch (e) { all[r] = { error: String(e).slice(0, 80) } }
}
fs.writeFileSync(OUT, JSON.stringify(all, null, 1))
for (const [r, v] of Object.entries(all)) { console.log('\n## ' + r); (v.h || []).forEach(x => console.log('  ' + x)); (v.ledes || []).forEach(x => console.log('  lede: ' + x.slice(0, 160))); (v.ctas || []).forEach(x => console.log('  cta: ' + x)) }
await b.close()
