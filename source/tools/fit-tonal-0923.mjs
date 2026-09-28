/* Measures each tonal mark's OBJECT (the .mk-ob group, ground dots excluded) and writes the uniform scale and
   translation that puts every one of them in the same optical box, so none reads taller or shorter than its
   neighbours on the hero row. Output: marks-tonal-fit.json, read by scripts_marks_tonal.mjs when it emits. */
import fs from 'fs'
import puppeteer from 'puppeteer-core'
const dir = process.argv[2], out = process.argv[3]
const TW = 84, TH = 72, CX = 48, CY = 46
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg')).sort()
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
const fit = {}
for (const f of files) {
  const slot = f.replace('tm-', '').replace('.svg', '')
  await p.setContent(`<body style="margin:0">${fs.readFileSync(dir + '/' + f, 'utf8')}</body>`, { waitUntil: 'load' })
  const bb = await p.evaluate(() => {
    const g = document.querySelector('.mk-ob')
    const r = g.getBBox()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  const s = Math.min(TW / bb.w, TH / bb.h)
  const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2
  fit[slot] = { s: +s.toFixed(4), tx: +(CX - cx * s).toFixed(2), ty: +(CY - cy * s).toFixed(2), w: +bb.w.toFixed(1), h: +bb.h.toFixed(1) }
}
await b.close()
fs.writeFileSync(out, JSON.stringify(fit, null, 1))
console.log(JSON.stringify(fit))
