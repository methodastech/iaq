/* Renders every booth artwork from /booth/art/:id to PNG (22 Sep 2026): for review, the portal downloads and the
   3D booth textures (--print drops the reader's notes, as the 3D booth and the printer see it).
   Usage: node tools/render-booth-art-0922.mjs <outdir> [maxPx=2400] [--print] [ids...] */
import puppeteer from 'puppeteer-core'
const argv = process.argv.slice(2), PRINT = argv.includes('--print'), args = argv.filter(a => a !== '--print')
const [OUT = '.', MAX = '2400', ...only] = args
const Q = PRINT ? '?print=1&marks=0' : '?print=0&marks=0'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.goto('http://localhost:5177/booth/art/w1', { waitUntil: 'networkidle0' })
const ids = only.length ? only : await p.evaluate(async () => (await import('/src/components/booth/Art.jsx')).PIECES).then(o => Object.keys(o)).catch(() => [])
for (const id of ids) {
  await p.goto(`http://localhost:5177/booth/art/${id}${Q}`, { waitUntil: 'networkidle0' })
  const [w, h] = await p.evaluate(() => { const d = document.querySelector('.ba'); return [+d.dataset.w, +d.dataset.h] })
  /* Chrome will not lay out a window under about 400 px in either direction, so a small piece is laid out
     larger and the device scale brings the output back to MAX on its long side */
  const k = Math.max(400 / Math.min(w, h), Math.min(1, +MAX / Math.max(w, h)))
  const vw = Math.round(w * k), vh = Math.round(h * k)
  const dpr = +MAX / Math.max(vw, vh)
  await p.setViewport({ width: vw, height: vh, deviceScaleFactor: Math.min(dpr, 4) })
  /* reload at the final size: a resize after load can be captured before the relayout lands */
  await p.goto(`http://localhost:5177/booth/art/${id}${Q}`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 500))
  await p.screenshot({ path: `${OUT}/${id}.png` })
  console.log(id, w + 'x' + h, '->', Math.round(vw * Math.min(dpr, 4)) + 'x' + Math.round(vh * Math.min(dpr, 4)))
}
console.log('errors', errs.length, errs.slice(0, 3))
await b.close()
