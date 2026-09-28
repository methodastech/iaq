/* a short crawl of the routes that changed today, for console errors and missing marks */
import puppeteer from 'puppeteer-core'
const ROUTES = ['/', '/services', '/markets', '/markets/semiconductor', '/about', '/contact', '/careers', '/projects']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const out = []
for (const r of ROUTES) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  p.on('requestfailed', q => errs.push('404? ' + q.url().split('/').pop()))
  await p.setViewport({ width: 1440, height: 900 })
  try {
    await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle0', timeout: 45000 })
    await new Promise(x => setTimeout(x, 1800))
    const info = await p.evaluate(() => ({
      h1: (document.querySelector('h1')?.textContent || '').slice(0, 42),
      marks: document.querySelectorAll('.hmk-ln, .iaq-rf, .ig-ic, .cring-disc svg').length,
    }))
    out.push({ r, ...info, errs: errs.slice(0, 2) })
  } catch (e) { out.push({ r, fail: String(e).slice(0, 80) }) }
  await p.close()
}
await b.close()
console.log(out.map(o => `${o.r.padEnd(26)} marks=${String(o.marks ?? '-').padEnd(3)} errs=${(o.errs || []).length}  ${o.h1 || o.fail || ''}`).join('\n'))
