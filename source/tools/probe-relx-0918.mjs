// 18 Sep: relationship map, "clearer, no overlapping". Captures each tour stop at 1440 and 1100,
// and checks every line end sits on a card edge and no line box crosses a card.
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '/tmp'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const errs = []
for (const w of [1440, 1100]) {
  const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.setViewport({ width: w, height: 1000, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
  await p.evaluate(() => { const r = document.querySelector('.rx'); r.scrollIntoView({ block: 'start' }) })
  await new Promise(r => setTimeout(r, 900))
  const picks = [['.n-u', 0], ['.n-u', 1], ['.n-u', 2], ['.n-s', 0], ['.n-w', 1], ['.n-y', 5]]
  for (const [c, i] of picks) {
    const res = await p.evaluate(async (c, i) => {
      const n = document.querySelectorAll('.rx-n' + c)[i]; if (!n.classList.contains('me')) n.click()
      await new Promise(r => setTimeout(r, 600))
      const cards = [...document.querySelectorAll('.rx-n')].map(n => n.getBoundingClientRect())
      let off = 0, cross = 0
      document.querySelectorAll('.rx-e circle').forEach(ci => {
        const q = ci.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2
        if (!cards.some(k => (Math.abs(x - k.left) < 3 || Math.abs(x - k.right) < 3) && y >= k.top - 1 && y <= k.bottom + 1)) off++
      })
      // sample each path and count samples that fall inside any card
      document.querySelectorAll('.rx-e path').forEach(pa => {
        const L = pa.getTotalLength(), m = pa.getScreenCTM()
        for (let t = 4; t < L - 4; t += 6) {
          const pt = pa.getPointAtLength(t), s = new DOMPoint(pt.x, pt.y).matrixTransform(m)
          if (cards.some(k => s.x > k.left + 1 && s.x < k.right - 1 && s.y > k.top + 1 && s.y < k.bottom - 1)) { cross++; break }
        }
      })
      const rd = document.querySelector('.rx-read').getBoundingClientRect(), svg = [...document.querySelectorAll('.rx-e path')].map(p => p.getBoundingClientRect())
      return { edges: document.querySelectorAll('.rx-e').length, offEdge: off, throughCard: cross, intoReadBox: svg.filter(s => s.bottom > rd.top + 1).length, sel: document.querySelector('.rx-n.me span, .rx-n.me b')?.textContent }
    }, c, i)
    console.log(w, c, i, JSON.stringify(res))
    if (i === 0 && c === '.n-u' || c === '.n-y') {
      const el = await p.$('.rx'); await el.screenshot({ path: `${OUT}/relx-${w}-${c.slice(3)}${i}.png` })
    }
  }
  await p.close()
}
console.log('errors', errs.length, errs.slice(0, 3))
await b.close()
