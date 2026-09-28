import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 300000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 14000))
const REG = { main: [-70, 38, -38, 2], annex: [38, 68, -18, 38], south: [-72, 32, 20, 58], link: [-14, -3, 2, 20] }
async function mark(tag) {
  await p.evaluate(() => { document.querySelectorAll('.db3-ghost').forEach(g => g.style.display = 'none'); const w = document.querySelector('.db3-frame').contentWindow; w.__iaqScene.onBeforeRender = (r, s, c) => { w.__cam = c } })
  await new Promise(r => setTimeout(r, 800))
  const boxes = await p.evaluate(REG => { const f = document.querySelector('.db3-frame'), w = f.contentWindow, sc = w.__iaqScene, cam = w.__cam; if (!cam) return null
    const fr = f.getBoundingClientRect(), cv = [...f.contentDocument.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0], cr = cv.getBoundingClientRect()
    const V = new cam.position.constructor(); const out = {}
    for (const [k, [x0, x1, z0, z1]] of Object.entries(REG)) { let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9, hit = 0
      sc.traverse(o => { if (!o.isMesh || !o.visible || !o.geometry.attributes.position) return; const pos = o.geometry.attributes.position, e = o.matrixWorld.elements, n = pos.count, st = Math.max(1, Math.floor(n / 400))
        for (let i = 0; i < n; i += st) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); const X = e[0] * x + e[4] * y + e[8] * z + e[12], Y = e[1] * x + e[5] * y + e[9] * z + e[13], Z = e[2] * x + e[6] * y + e[10] * z + e[14]
          if (X < x0 || X > x1 || Z < z0 || Z > z1 || Y < -10 || Y > 40) continue; V.set(X, Y, Z).project(cam); if (V.z > 1) continue; hit++
          const sx = fr.left + cr.left + (V.x + 1) / 2 * cr.width, sy = fr.top + cr.top + (1 - V.y) / 2 * cr.height; mnx = Math.min(mnx, sx); mny = Math.min(mny, sy); mxx = Math.max(mxx, sx); mxy = Math.max(mxy, sy) } })
      out[k] = hit ? [mnx, mny, mxx, mxy].map(Math.round) : null }
    return out }, REG)
  await p.screenshot({ path: `${OUT}/3d-mark-${tag}.png` })
  return boxes
}
const res = { rest: await mark('rest') }
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.defaultView.scrollTo(0, d.documentElement.scrollHeight * .08) }); await new Promise(r => setTimeout(r, 20000))
res.civil = await mark('civil')
fs.writeFileSync(OUT + '/3d-mark.json', JSON.stringify(res)); console.log(JSON.stringify(res))
await b.close(); process.exit(0)
