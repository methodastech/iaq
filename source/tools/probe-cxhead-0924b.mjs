import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
console.log(JSON.stringify(await p.evaluate(() => { const h = document.querySelector('.cx-head'); const r = h.getBoundingClientRect()
  const spill = [...h.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 0 && (q.bottom > r.bottom + 2 || q.right > r.right + 2) }).slice(0, 6).map(e => e.tagName + '.' + (e.className.baseVal ?? e.className).toString().slice(0, 30) + ' b' + Math.round(e.getBoundingClientRect().bottom - r.bottom) + ' r' + Math.round(e.getBoundingClientRect().right - r.right))
  return { sh: h.scrollHeight - h.clientHeight, sw: h.scrollWidth - h.clientWidth, spill, overflow: getComputedStyle(h).overflow } })))
await b.close()
