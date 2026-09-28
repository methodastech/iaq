/* measure each hero line mark's drawn bounding box in SVG user units, so the set can be normalised */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?noanim&marks=line', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 1600))
const rows = await p.evaluate(() => {
  const out = []
  document.querySelectorAll('.hmk-iso li').forEach(li => {
    const svg = li.querySelector('svg.hmk-ln')
    if (!svg) return
    const name = li.querySelector('.hmk-nm')?.textContent
    let x0 = 99, y0 = 99, x1 = -99, y1 = -99
    const parts = []
    svg.querySelectorAll('path').forEach(pa => {
      const bb = pa.getBBox()
      parts.push({ red: (pa.getAttribute('stroke') === '#FF3B42' || pa.getAttribute('fill') === '#FF3B42'), x: +bb.x.toFixed(2), y: +bb.y.toFixed(2), w: +bb.width.toFixed(2), h: +bb.height.toFixed(2) })
      x0 = Math.min(x0, bb.x); y0 = Math.min(y0, bb.y); x1 = Math.max(x1, bb.x + bb.width); y1 = Math.max(y1, bb.y + bb.height)
    })
    out.push({ name, x0: +x0.toFixed(2), y0: +y0.toFixed(2), x1: +x1.toFixed(2), y1: +y1.toFixed(2), w: +(x1 - x0).toFixed(2), h: +(y1 - y0).toFixed(2), cx: +((x0 + x1) / 2).toFixed(2), cy: +((y0 + y1) / 2).toFixed(2), reds: parts.filter(q => q.red).length, area: +((x1 - x0) * (y1 - y0)).toFixed(1) })
  })
  return out
})
console.log(rows.map(r => `${String(r.name).padEnd(24)} box ${r.x0}→${r.x1} × ${r.y0}→${r.y1}  w${r.w} h${r.h}  cx${r.cx} cy${r.cy}  base${r.y1}  reds=${r.reds}  area${r.area}`).join('\n'))
await b.close()
