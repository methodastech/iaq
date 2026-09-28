/* samples the rendered marks and reports the most saturated red actually on screen, against IAQ red EC2027 */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 3500))
await p.evaluate(() => document.querySelector('.hmk-row.hmk-iso').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 1200))
const out = await p.evaluate(() => {
  const c = document.querySelector('.hmk-gl-canvas')
  const gl = c.getContext('webgl2') || c.getContext('webgl')
  const px = new Uint8Array(c.width * c.height * 4)
  gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, px)
  let best = null, n = 0, sum = [0, 0, 0]
  for (let i = 0; i < px.length; i += 4) {
    const [r, g, bl, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]]
    if (a < 200) continue
    if (r > 120 && r > g * 1.5 && r > bl * 1.5) { n++; sum[0] += r; sum[1] += g; sum[2] += bl; if (!best || r - (g + bl) / 2 > best.k) best = { r, g, b: bl, k: r - (g + bl) / 2 } }
  }
  const avg = n ? sum.map(v => Math.round(v / n)) : null
  const hex = v => '#' + v.map(x => x.toString(16).padStart(2, '0')).join('')
  return { redPixels: n, avgRed: avg && hex(avg), peak: best && hex([best.r, best.g, best.b]) }
})
console.log(JSON.stringify(out))
await b.close()
