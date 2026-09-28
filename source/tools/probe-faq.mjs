import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sm-faq').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1500))
  const r1 = await p.evaluate(() => ({ groups: document.querySelectorAll('.faq-g').length, items: document.querySelectorAll('.faq-i').length, open: [...document.querySelectorAll('.faq-i.open .faq-q span')].map(e => e.textContent), ix: document.querySelectorAll('.faq-ix-b').length, ixOn: document.querySelector('.faq-ix-b.on b')?.textContent, links: document.querySelectorAll('.faq-more').length, sticky: getComputedStyle(document.querySelector('.faq-ix')).position, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))
  // click the second question, then jump to group 3 via the index
  const qs = await p.$$('.faq-q'); await qs[1].click(); await new Promise(r => setTimeout(r, 600))
  const r2 = await p.evaluate(() => ({ open: [...document.querySelectorAll('.faq-i.open .faq-q span')].map(e => e.textContent), openH: Math.round(document.querySelector('.faq-i.open .faq-a').getBoundingClientRect().height) }))
  const ix = await p.$$('.faq-ix-b'); await ix[2].click(); await new Promise(r => setTimeout(r, 1200))
  const r3 = await p.evaluate(() => ({ ixOn: document.querySelector('.faq-ix-b.on b')?.textContent, g3top: Math.round(document.querySelector('.faq-g[data-g="live"]').getBoundingClientRect().top) }))
  console.log(w, JSON.stringify({ ...r1, afterClick: r2, afterJump: r3 }), 'errors', errs.length ? errs : 0)
  await p.evaluate(() => document.querySelector('.sm-faq').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 600))
  await (await p.$('.sm-faq')).screenshot({ path: `${OUT}/${tag}-faq.png` })
  await p.close()
}
await b.close()
