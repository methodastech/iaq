import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/portal/codex', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 1800))
if (await p.$('input')) { await p.type('input', 'iaqsolution321'); await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 2500)) }
await p.evaluate(() => document.querySelector('.rx')?.scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 900))
const rest = await p.evaluate(() => {
  const rx = document.querySelector('.rx'); if (!rx) return { none: true }
  const edges = [...rx.querySelectorAll('.rx-e')]
  const vis = edges.filter(e => +getComputedStyle(e).opacity > 0.02).length
  const glow = [...rx.querySelectorAll('*')].filter(e => /blur|drop-shadow/.test(getComputedStyle(e).filter)).length
  return { edges: edges.length, visibleAtRest: vis, glowNodes: glow, has: rx.classList.contains('has') }
})
console.log('AT REST', JSON.stringify(rest))
await p.evaluate(() => { const n = document.querySelector('.rx-s .rx-n'); n && n.click() })
await new Promise(r => setTimeout(r, 900))
const lit = await p.evaluate(() => {
  const rx = document.querySelector('.rx')
  const edges = [...rx.querySelectorAll('.rx-e')]
  const on = edges.filter(e => +getComputedStyle(e).opacity > 0.25)
  const paths = on.map(e => e.querySelector('path')).filter(Boolean)
  /* where each line lands: the end point of its path, rounded */
  const ends = paths.map(pa => { const L = pa.getTotalLength(); const q = pa.getPointAtLength(L); return Math.round(q.x) + ',' + Math.round(q.y) })
  const glow = [...rx.querySelectorAll('*')].filter(e => /blur|drop-shadow/.test(getComputedStyle(e).filter)).length
  /* does any lit line pass over a node card? sample 20 points per path against node boxes */
  const svg = rx.querySelector('.rx-lines'); const sb = svg.getBoundingClientRect()
  const nodes = [...rx.querySelectorAll('.rx-n')].map(n => n.getBoundingClientRect())
  /* a line LANDS on the card it connects, so the endpoints are not crossings: sample only the middle
     of each path (15% to 85%) and ignore the two cards it touches. */
  let crossings = 0
  const touched = pa => { const L = pa.getTotalLength(); const A = pa.getPointAtLength(0), B = pa.getPointAtLength(L)
    return nodes.filter(r => [A, B].some(q => { const x = sb.left + q.x, y = sb.top + q.y
      return x > r.left - 6 && x < r.right + 6 && y > r.top - 6 && y < r.bottom + 6 })) }
  for (const pa of paths) { const L = pa.getTotalLength(); const skip = touched(pa)
    for (let i = 3; i <= 17; i++) { const q = pa.getPointAtLength(L * i / 20); const x = sb.left + q.x, y = sb.top + q.y
      if (nodes.some(r => !skip.includes(r) && x > r.left + 2 && x < r.right - 2 && y > r.top + 2 && y < r.bottom - 2)) { crossings++; break } } }
  return { litEdges: on.length, ofTotal: edges.length, distinctLandings: new Set(ends).size, landings: ends.length, glowNodes: glow, linesCrossingACard: crossings }
})
console.log('LIT', JSON.stringify(lit))
await (await p.$('.rx')).screenshot({ path: SP + '/v-relmap.png' })
await b.close()
