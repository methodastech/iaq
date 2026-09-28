import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1440, 390]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sysm').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1500))
  console.log(w, JSON.stringify(await p.evaluate(() => { const em = document.querySelector('.sysm h2 em'); const cs = getComputedStyle(em); const rg = document.createRange(); rg.selectNodeContents(em); const rects = rg.getClientRects(); return { emColor: cs.color, emStyle: cs.fontStyle, emLines: new Set([...rects].map(r => Math.round(r.top))).size, termBlock: getComputedStyle(document.querySelector('.sysm-u small em')).display, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })), 'errors', errs.length ? errs : 0)
  if (w === 1440) await (await p.$('.sysm')).screenshot({ path: `${OUT}/d-sysmap-final.png` })
  await p.close()
}
await b.close()
