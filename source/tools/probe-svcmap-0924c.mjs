import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  const secs = await p.evaluate(() => [...document.querySelectorAll('section, header.pg-head')].filter((e, i, a) => !a.some(o => o !== e && o.contains(e))).map(e => e.id || e.className.split(' ').slice(0, 2).join('.')))
  const map = await p.$('.sm-map'); if (!map) { console.log(w, 'NO MAP'); continue }
  await map.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1500))
  const m = await p.evaluate(async () => {
    const sec = document.querySelector('.sm-map'); const u = sec.querySelector('.rx-n.n-u'); if (u) { u.click(); await new Promise(r => setTimeout(r, 700)) }
    const cards = [...sec.querySelectorAll('.rx-n')].map(n => n.getBoundingClientRect()); let off = 0
    sec.querySelectorAll('.rx-e circle').forEach(ci => { const q = ci.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2; if (!cards.some(k => (Math.abs(x - k.left) < 3 || Math.abs(x - k.right) < 3) && y >= k.top - 1 && y <= k.bottom + 1)) off++ })
    return { edges: sec.querySelectorAll('.rx-e').length, offEdge: off, workCards: document.querySelectorAll('.sysm-wk').length, sentence: sec.querySelector('.rx-read p')?.innerText.slice(0, 80), h: Math.round(sec.getBoundingClientRect().height) }
  })
  console.log(w, JSON.stringify(secs), JSON.stringify(m), 'errors', errs.length)
  await map.screenshot({ path: `${OUT}/svcmap-${w}.png` })
  await p.close()
}
await b.close()
