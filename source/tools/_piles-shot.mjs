import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
await p.evaluate(v => scrollTo(0, v), top - 600); await wait(1200); await p.evaluate(v => scrollTo(0, v), top); await wait(9000)
const rail = i => p.evaluate(i => { const d = document.querySelector('#build3d iframe').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; (i < 0 ? L[L.length + i] : L[i]).click() }, i)
await rail(0); await wait(9000); await p.screenshot({ path: `${out}/civil.png`, captureBeyondViewport: false })

const m = await p.evaluate(() => { const w = document.querySelector('#build3d iframe').contentWindow, asm = w.__iaqAsm; const planes = asm.planes.map(pl => [pl.normal.x, pl.normal.y, pl.normal.z, +pl.constant.toFixed(2)]); const cb = asm.clipBox ? JSON.stringify(asm.clipBox).slice(0, 300) : null; let root = null; for (const v of asm.groups.values()) { for (const o of v) { root = o; break } if (root) break } while (root.parent) root = root.parent; let lowMeshes = 0, planed = 0; root.traverse(x => { if (x.isMesh && x.userData.iaqPileLow) { lowMeshes++; const mm = Array.isArray(x.material) ? x.material[0] : x.material; if (mm.clippingPlanes && mm.clippingPlanes.some(pl => Math.abs(pl.constant - 1.2) < 1e-6)) planed++ } }); return { lowMeshes, planed, planes, cb, openXMin: asm.openXMin, openXMax: asm.openXMax } })
console.log(JSON.stringify({ errs, ...m }))
await b.close()
