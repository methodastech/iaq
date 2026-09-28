import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
await p.evaluate(v => scrollTo(0, v), top - 600); await wait(1200); await p.evaluate(v => scrollTo(0, v), top); await wait(9000)
await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')].pop().click() }); await wait(14000)
const m = await p.evaluate(() => {
  const w = document.querySelector('#build3d iframe').contentWindow, asm = w.__iaqAsm
  let root = null; for (const v of asm.groups.values()) { for (const o of v) { root = o; break } if (root) break } while (root.parent) root = root.parent
  const out = {}
  root.traverse(x => { if (!x.isMesh) return; const nm = (x.parent && x.parent.name || '') + '/' + x.name; if (!/support-apron\/mesh_0$|exterior-v3-all\/mesh_9$/.test(nm)) return
    const pa = x.geometry.attributes.position, v = new x.matrixWorld.constructor(); const e = x.matrixWorld.elements; const hist = {}
    /* world y of each vertex: row 1 of the matrix */
    for (let i = 0; i < pa.count; i++) { const X = pa.getX(i), Y = pa.getY(i), Z = pa.getZ(i); const wy = e[1] * X + e[5] * Y + e[9] * Z + e[13]; if (wy > 2.0) continue; const k = (Math.round(wy * 4) / 4).toFixed(2); hist[k] = (hist[k] || 0) + 1 }
    out[nm] = Object.entries(hist).sort((a, b) => +a[0] - +b[0]) })
  return out
})
console.log(JSON.stringify(m, null, 1))
await b.close()
