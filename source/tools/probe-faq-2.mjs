import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sm-faq').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1200))
  const r1 = await p.evaluate(() => ({ bg: getComputedStyle(document.querySelector('.sm-faq')).backgroundColor, mark: !!document.querySelector('.faq-mark svg'), markW: Math.round(document.querySelector('.faq-mark')?.getBoundingClientRect().width || 0), icons: document.querySelectorAll('.faq-ic svg').length, openGroups: [...document.querySelectorAll('.faq-g.is-open .faq-gt b')].map(e => e.textContent), foldedH: Math.round(document.querySelectorAll('.faq-g')[1].querySelector('.faq-gl').getBoundingClientRect().height), lede: document.querySelector('.sm-faq .pg-lede').textContent, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))
  const gb = await p.$$('.faq-gb'); await gb[1].click(); await new Promise(r => setTimeout(r, 700))
  const r2 = await p.evaluate(() => ({ openGroups: [...document.querySelectorAll('.faq-g.is-open .faq-gt b')].map(e => e.textContent), g2H: Math.round(document.querySelectorAll('.faq-g')[1].querySelector('.faq-gl').getBoundingClientRect().height) }))
  const ix = await p.$$('.faq-ix-b'); await ix[4].click(); await new Promise(r => setTimeout(r, 1200))
  const r3 = await p.evaluate(() => ({ openGroups: [...document.querySelectorAll('.faq-g.is-open .faq-gt b')].map(e => e.textContent), ixOn: document.querySelector('.faq-ix-b.on b')?.textContent }))
  console.log(w, JSON.stringify({ ...r1, afterGroupClick: r2, afterIndex5: r3 }), 'errors', errs.length ? errs : 0)
  await p.evaluate(() => document.querySelector('.sm-faq').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 500))
  await (await p.$('.sm-faq')).screenshot({ path: `${OUT}/${tag}-faq2.png` })
  if (w === 1440) await (await p.$('.faq-mark')).screenshot({ path: `${OUT}/faq-mark.png` })
  await p.close()
}
await b.close()
