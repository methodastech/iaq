import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1440, 390]) for (const path of ['/services/design', '/services/maintenance', '/services/epc-construction', '/services/energy-management', '/services/tool-installation']) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 800))
  const r = await p.evaluate(() => ({ cb: [...document.querySelectorAll('.cb-i')].map(e => e.className.replace('cb-i ', '') + ':' + e.querySelector('b').textContent), when: document.querySelector('.un-when')?.textContent.slice(0, 60), whenVisible: (() => { const e = document.querySelector('.un-when'); return e ? getComputedStyle(e).color : null })(), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))
  console.log(w, path, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  if (w === 1440 && path === '/services/design') { const el = await p.$('.cb'); await el.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.classList.add('in') }); await new Promise(r => setTimeout(r, 900)); await el.screenshot({ path: `${OUT}/design-carried.png` }) }
  if (w === 1440 && path === '/services/epc-construction') { const el = await p.$('.un-hero'); await el.screenshot({ path: `${OUT}/epc-hero-when.png` }) }
  await p.close()
}
await b.close()
