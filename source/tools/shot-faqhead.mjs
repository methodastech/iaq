import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sm-faq').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1000))
  const r = await p.evaluate(() => { const h = document.querySelector('.sm-faq-h'); const em = h.querySelector('em'); const rg = document.createRange(); rg.selectNodeContents(em); return { icon: !!h.querySelector('.faq-hic'), iconW: Math.round(h.querySelector('.faq-hic').getBoundingClientRect().width), h2H: Math.round(h.getBoundingClientRect().height), emLines: new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size, oldMark: !!document.querySelector('.faq-mark'), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  await (await p.$('.sm-faq .pg-in')).screenshot({ path: `${OUT}/${tag}-faqhead.png`, clip: undefined }).catch(() => {})
  const hd = await p.$('.sm-faq-h'); await hd.screenshot({ path: `${OUT}/${tag}-faqhead-h2.png` })
  await p.close()
}
await b.close()
