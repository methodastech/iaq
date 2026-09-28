import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 1500))
  const geo = await p.evaluate(() => { const ring = document.querySelector('.sc-ring').getBoundingClientRect(); const c = { x: ring.left + ring.width / 2, y: ring.top + ring.height / 2 }
    const st = [...document.querySelectorAll('.sc-st')].map(e => { const r = e.getBoundingClientRect(); return Math.round(Math.hypot(r.left + r.width / 2 - c.x, r.top + r.height / 2 - c.y)) })
    const inside = [...document.querySelectorAll('.sc-st')].every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth })
    return { stations: st.length, radii: st, inside, on: document.querySelector('.sc-st.on .sc-st-l')?.textContent, arc: document.querySelector('.sc-ring-red').style.strokeDasharray, centre: document.querySelector('.sc-ring-c b')?.textContent, marks: document.querySelectorAll('.sc-st-mk svg').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  await p.mouse.move(2, 2); await new Promise(r => setTimeout(r, 5100))
  const after = await p.evaluate(() => ({ on: document.querySelector('.sc-st.on .sc-st-l')?.textContent, arc: document.querySelector('.sc-ring-red').style.strokeDasharray }))
  console.log(w, JSON.stringify({ ...geo, afterTimer: after }), 'errors', errs.length ? errs : 0)
  const el = await p.$('.sc-head'); await el.screenshot({ path: `${OUT}/${tag}-cover.png` }); await p.close()
}
await b.close()
