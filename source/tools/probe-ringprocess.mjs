import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => document.querySelector('.cyc-band').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2500))
  const r = await p.evaluate(() => ({ chev: document.querySelectorAll('.cring-chev').length, chevOn: document.querySelectorAll('.cring-chev.on').length, ret: !!document.querySelector('.cring-return'), head: !!document.querySelector('.cring-return-head'), label: document.querySelector('.cring-ret-l')?.textContent.trim().slice(0, 40), labelVisible: (() => { const l = document.querySelector('.cring-ret-l'); if (!l) return false; const r = l.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth })(), listRet: !!document.querySelector('.cring-li-ret') && getComputedStyle(document.querySelector('.cring-li-ret')).display !== 'none', coverChev: document.querySelectorAll('.sc-ring-chev').length, coverRet: !!document.querySelector('.sc-ring-ret'), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  const el = await p.$('.cyc-band'); await el.screenshot({ path: `${OUT}/${tag}-ring-process.png` })
  if (w === 1440) { await p.evaluate(() => window.scrollTo(0, 0)); await new Promise(r => setTimeout(r, 1200)); const c = await p.$('.sc-ring'); await c.screenshot({ path: `${OUT}/d-cover-ring.png` }) }
  await p.close()
}
await b.close()
