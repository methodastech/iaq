import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [390, 360, 1440]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sm-faq').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1200))
  const r = await p.evaluate(() => { const R = s => Math.round(document.querySelector(s).getBoundingClientRect().right); const p = document.querySelector('.faq-i.open .faq-a p'); return { vw: innerWidth, faqR: R('.faq'), listR: R('.faq-list'), ixR: R('.faq-ix'), openPR: Math.round(p.getBoundingClientRect().right), qR: Math.max(...[...document.querySelectorAll('.faq-q span')].map(e => Math.round(e.getBoundingClientRect().right))), gp: document.querySelector('.faq-more[href="/global-presence"]') ? 'ok' : 'missing', overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  if (w === 390) { await p.evaluate(() => document.querySelector('.sm-faq').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 400)); await p.screenshot({ path: `${OUT}/m-faq-fixed.png`, clip: { x: 0, y: 0, width: 390, height: 900 } }) }
  await p.close()
}
await b.close()
