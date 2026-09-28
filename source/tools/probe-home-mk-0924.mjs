import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.ig-intro').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1200))
  const r = await p.evaluate(() => { const h = document.querySelector('.ig-h'); const em = h.querySelector('em'); const rg = document.createRange(); rg.selectNodeContents(em); return { h2: h.textContent.replace(/\s+/g, ' ').trim(), emColor: getComputedStyle(em).color, emLines: new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size, muted: document.querySelectorAll('.ig-h .muted').length, cta: document.querySelector('.ig-cta').textContent.trim(), ctaTT: getComputedStyle(document.querySelector('.ig-cta')).textTransform, no: getComputedStyle(document.querySelector('.ig-no')).display, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  console.log('home', w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  const sec = await p.$('.ig-intro'); await sec.evaluate(e => e.closest('section')?.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 600))
  const igsec = await p.evaluateHandle(() => document.querySelector('.ig-intro').closest('section') || document.querySelector('.ig-intro').parentElement.parentElement); await igsec.screenshot({ path: `${OUT}/${tag}-industries.png` })
  await p.goto('http://localhost:5177/markets', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.pg-sec.deep').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1000))
  const r2 = await p.evaluate(() => ({ rows: document.querySelectorAll('.mk-br').length, icons: document.querySelectorAll('.mk-bm svg').length, specs: [...document.querySelectorAll('.mk-spec')].map(e => e.textContent).slice(0, 3), counts: [...document.querySelectorAll('.mk-n')].map(e => e.textContent), stats: document.querySelectorAll('.pg-sec.deep .pg-stat').length, statTT: getComputedStyle(document.querySelector('.pg-sec.deep .pg-stat span')).textTransform, table: !!document.querySelector('.mk-tbl'), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))
  console.log('markets', w, JSON.stringify(r2), 'errors', errs.length ? errs : 0)
  await (await p.$('.pg-sec.deep')).screenshot({ path: `${OUT}/${tag}-clean-board.png` })
  await p.close()
}
await b.close()
