/* 15 Sep: compare the closing block (close3d) across pages: padding, grid, child placement */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const path of ['/careers/culture', '/careers', '/about', '/services']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto('http://localhost:5177' + path, { waitUntil: 'domcontentloaded', timeout: 90000 }); await new Promise(r => setTimeout(r, 3500))
  const r = await p.evaluate(() => {
    const c = document.querySelector('section.close3d'); if (!c) return null
    const cs = getComputedStyle(c); const inn = c.querySelector('.close-in'); const ics = inn && getComputedStyle(inn)
    const kids = inn ? [...inn.children].map(k => { const rc = k.getBoundingClientRect(), cr = c.getBoundingClientRect(); const s = getComputedStyle(k)
      return { cls: (k.className || k.tagName).toString().slice(0, 40), top: Math.round(rc.top - cr.top), left: Math.round(rc.left), w: Math.round(rc.width), h: Math.round(rc.height), gridRow: s.gridRow, gridCol: s.gridColumn } }) : []
    return { cls: c.className, padTop: cs.paddingTop, zIndex: cs.zIndex, height: Math.round(c.getBoundingClientRect().height), inner: inn && { cls: inn.className, display: ics.display, cols: ics.gridTemplateColumns, rows: ics.gridTemplateRows, padTop: ics.paddingTop, alignItems: ics.alignItems }, kids }
  })
  console.log(path, JSON.stringify(r))
  const el = await p.$('section.close3d'); if (el) { await el.evaluate(e => e.scrollIntoView()); await new Promise(r => setTimeout(r, 500)); await el.screenshot({ path: `${OUT}/footer-${path.replace(/\W+/g, '-')}.png` }) }
  await p.close()
}
await b.close()
