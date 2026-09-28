/* 22 Sep: (1) the seamless window for the construct clip in which the beam never crosses the frame edge, (2) each
   clip's subject box INSIDE its playable window, which is what the zoom has to be sized from, (3) the still at a.
   Usage: node tools/probe-clipwin-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.goto('http://localhost:5177/checklist.html', { waitUntil: 'domcontentloaded' })
const lib = `
  window.load = async slug => { const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = '/assets/cycle3d/' + slug + '-loop.mp4'; await new Promise(ok => { v.onloadeddata = ok }); return v }
  window.grab = async (v, t, W, H) => { await new Promise(ok => { v.onseeked = ok; v.currentTime = t }); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(v, 0, 0, W, H); return { c, d: x.getImageData(0, 0, W, H).data } }
  window.box = (d, W, H) => { let l = W, t = H, r = 0, b = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]); if (mx < 205 || mx - mn > 40) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y } } return [l / W, t / H, r / W, b / H] }
`
await p.evaluate(lib)
const win = await p.evaluate(async () => {
  const v = await load('construct'), W = 240, H = 135, A = [], B = []
  for (let t = 1.9; t <= 3.6; t += 1 / 12) { const g = await grab(v, t, W, H); A.push({ t, d: g.d, bx: box(g.d, W, H) }) }
  for (let t = 7.6; t <= 9.0; t += 1 / 12) { const g = await grab(v, t, W, H); B.push({ t, d: g.d, bx: box(g.d, W, H) }) }
  let best = null
  for (const a of A) for (const bb of B) {
    if (a.bx[1] < 0.03 || bb.bx[1] < 0.03) continue
    let s = 0; for (let i = 0; i < a.d.length; i += 4) s += Math.abs(a.d[i] - bb.d[i]); s /= a.d.length / 4
    if (!best || s < best.s) best = { a: +a.t.toFixed(3), b: +bb.t.toFixed(3), s: +s.toFixed(3), ta: a.bx[1], tb: bb.bx[1] }
  }
  return { best, topsA: A.map(f => [+f.t.toFixed(2), +f.bx[1].toFixed(3)]), topsB: B.map(f => [+f.t.toFixed(2), +f.bx[1].toFixed(3)]) }
})
console.log('construct window', JSON.stringify(win.best)); console.log(' tops in', JSON.stringify(win.topsA)); console.log(' tops out', JSON.stringify(win.topsB))
const WINS = { design: [3.083, 8.208], procure: [4.417, 7.75], construct: [win.best.a, win.best.b], commission: [0, 5.0], maintain: [0, 5.0], hookup: [0, 11.2] }
for (const [slug, [a, bb]] of Object.entries(WINS)) {
  const r = await p.evaluate(async (slug, a, bb) => {
    const v = await load(slug), W = 320, H = 180; let L = 1, T = 1, R = 0, B = 0
    for (let t = a; t <= bb; t += 0.2) { const g = await grab(v, t, W, H), x = box(g.d, W, H); L = Math.min(L, x[0]); T = Math.min(T, x[1]); R = Math.max(R, x[2]); B = Math.max(B, x[3]) }
    return [L, T, R, B].map(n => +n.toFixed(3))
  }, slug, a, bb)
  console.log(slug, 'window', a, bb, 'box L,T,R,B', JSON.stringify(r))
}
const still = await p.evaluate(async a => { const v = await load('construct'); const g = await grab(v, a, 960, 540); return g.c.toDataURL('image/webp', 0.86) }, win.best.a)
fs.writeFileSync(`${OUT}/construct-still-new.webp`, Buffer.from(still.split(',')[1], 'base64'))
const pair = await p.evaluate(async (a, bb) => { const v = await load('construct'); const c = document.createElement('canvas'); c.width = 960; c.height = 270; const x = c.getContext('2d'); const g1 = await grab(v, a, 480, 270); x.drawImage(g1.c, 0, 0); const g2 = await grab(v, bb, 480, 270); x.drawImage(g2.c, 480, 0); return c.toDataURL('image/jpeg', 0.85) }, win.best.a, win.best.b)
fs.writeFileSync(`${OUT}/construct-pair.jpg`, Buffer.from(pair.split(',')[1], 'base64'))
await b.close()
