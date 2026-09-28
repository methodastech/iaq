import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const w of [1300, 1440, 1180]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  const m = await p.evaluate(() => { const n = document.querySelector('.rx-compact .rx-s .rx-n'); const sp = n.querySelector('span:last-child'); const r = n.getBoundingClientRect(), sr = sp.getBoundingClientRect(); const col = document.querySelector('.rx-compact .rx-col.rx-s').getBoundingClientRect(); const cs = getComputedStyle(n)
    const duo = getComputedStyle(document.querySelector('.sm-map-duo')).gridTemplateColumns
    return { duo, colW: Math.round(col.width), btnW: Math.round(r.width), spanW: Math.round(sr.width), spanOver: Math.round(sr.right - r.right), btnDisplay: cs.display, btnWhite: cs.whiteSpace, spanMin: getComputedStyle(sp).minWidth, cols: getComputedStyle(document.querySelector('.rx-compact .rx-cols')).gridTemplateColumns } })
  console.log(w, JSON.stringify(m))
  await p.close()
}
await b.close()
