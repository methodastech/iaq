import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(r => setTimeout(r, 1500))
  const r0 = await p.evaluate(() => ({ inCls: document.querySelector('.sc-head').classList.contains('in'), pins: document.querySelectorAll('.sc-pin').length, pinScale: getComputedStyle(document.querySelector('.sc-pin')).transform, lit: document.querySelector('.sc-pin.on')?.textContent, tip: document.querySelector('.sc-tip')?.textContent, legOn: document.querySelector('.sc-grp li.on')?.textContent, img: document.querySelector('.sc-mo img').naturalWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, headH: Math.round(document.querySelector('.sc-head').getBoundingClientRect().height) }))
  await p.mouse.move(2, 2); await new Promise(r => setTimeout(r, 5200))
  const r1 = await p.evaluate(() => document.querySelector('.sc-pin.on')?.textContent)
  const li = (await p.$$('.sc-grp li'))[6]; await li.hover(); await new Promise(r => setTimeout(r, 400))
  const r2 = await p.evaluate(() => ({ lit: document.querySelector('.sc-pin.on')?.textContent, tip: document.querySelector('.sc-tip')?.textContent.slice(0, 30) }))
  console.log(w, JSON.stringify({ ...r0, afterTimer: r1, afterHover: r2 }), 'errors', errs.length ? errs : 0)
  await p.mouse.move(2, 2); const el = await p.$('.sc-head'); await el.screenshot({ path: `${OUT}/${tag}-cover.png` }); await p.close()
}
await b.close()
