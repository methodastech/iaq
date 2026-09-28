import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 300000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('console', m => { if (/error|warn/i.test(m.type())) errs.push(m.text().slice(0, 220)) }); p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 220)))
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 14000))
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.defaultView.scrollTo(0, d.documentElement.scrollHeight) }); await new Promise(r => setTimeout(r, 30000))
await p.evaluate(() => { document.querySelectorAll('.db3-ghost').forEach(g => g.style.display = 'none'); const f = document.querySelector('.db3-frame'); f.scrollIntoView(); const w = f.contentWindow
  w.__pose = [-150, 150, 190]; w.__iaqScene.onBeforeRender = (r, s, c) => { if (c.isPerspectiveCamera) { c.position.set(...w.__pose); c.lookAt(0, 4, 8); c.updateMatrixWorld(true) } } })
const shoot = async tag => { await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 2500)); await p.screenshot({ path: `${OUT}/3d-pose-${tag}.png` }) }
const hide = cond => p.evaluate(cond => { const w = document.querySelector('.db3-frame').contentWindow, sc = w.__iaqScene; let inst = 0, tris = 0
  let BA = null; sc.traverse(o => { if (BA || !o.isMesh) return; const ix = o.geometry && o.geometry.index; if (ix && ix.array && !ix.isInterleavedBufferAttribute) { const C = ix.constructor; try { if (new C(new w.Uint32Array([70000]), 1).array instanceof w.Uint32Array) BA = C } catch (e) {} } })
  if (!BA) return 'no BA'
  sc.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return
  if (o.isInstancedMesh) { const m = o.instanceMatrix.array; if (!o.userData.__m0) o.userData.__m0 = m.slice(); const m0 = o.userData.__m0, e = o.matrixWorld.elements
    for (let i = 0; i < o.count; i++) { const tx = m0[i * 16 + 12], ty = m0[i * 16 + 13], tz = m0[i * 16 + 14]; const c = { x: e[0] * tx + e[4] * ty + e[8] * tz + e[12], z: e[2] * tx + e[6] * ty + e[10] * tz + e[14] }
      if (cond && eval(cond)) { for (let k = 0; k < 16; k++) m[i * 16 + k] = 0; inst++ } else for (let k = 0; k < 16; k++) m[i * 16 + k] = m0[i * 16 + k] }
    o.instanceMatrix.needsUpdate = true; return }
  const g = o.geometry, ix = g.index, pos = g.attributes.position
  if (o.userData.__i0 === undefined) { if (ix) { const a = new w.Uint32Array(ix.count); for (let i = 0; i < ix.count; i++) a[i] = ix.getX(i); o.userData.__i0 = a } else o.userData.__i0 = null }
  const e = o.matrixWorld.elements, src = o.userData.__i0, n = src ? src.length : pos.count, keep = []
  for (let t = 0; t + 2 < n; t += 3) { let cx = 0, cz = 0; for (let k = 0; k < 3; k++) { const i = src ? src[t + k] : t + k, x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); cx += e[0] * x + e[4] * y + e[8] * z + e[12]; cz += e[2] * x + e[6] * y + e[10] * z + e[14] } const c = { x: cx / 3, z: cz / 3 }
    if (cond && eval(cond)) { tris++; continue } for (let k = 0; k < 3; k++) keep.push(src ? src[t + k] : t + k) }
  if (!src && keep.length === n) return
  g.setIndex(new BA(new w.Uint32Array(keep), 1)) }); return [inst, tris] }, cond)
await shoot('trimmed')
const st = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow; let n = 0, t = 0; w.__iaqScene.traverse(o => { if (o.isMesh && o.userData.iaqTrim) n++; if (o.isMesh && o.geometry && o.geometry.index) t += o.geometry.index.count / 3 }); return { trimmed: n, tris: Math.round(t) } })
console.log(JSON.stringify(st), [...new Set(errs)].filter(e => /PE|WebGL/.test(e)).slice(0, 5).join(' | '))
await p.evaluate(() => { const f = document.querySelector('.db3-frame'), d = f.contentDocument, w = f.contentWindow; const h = d.getElementById('hud2'); if (h) h.style.visibility = 'hidden'; d.querySelectorAll('#skin-switch, #iaq-xr-chip').forEach(x => x.style.visibility = 'hidden'); document.querySelectorAll('.db3-intro, .db3-ghost-cap').forEach(x => x.style.display = 'none'); w.__pose = [-150, 150, 190] })
await shoot('still-trim')
await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow; w.__iaqScene.traverse(o => { if (o.isMesh || o.isLine || o.isLineSegments || o.isPoints || o.isSprite) o.visible = false }) })
await shoot('still-bg')
console.log('done')
await b.close(); process.exit(0)
