import puppeteer from 'puppeteer-core'
/* 26 Sep: reusable assets in the site scene at handover: cars, trees, the paving, the camera. */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 12000 : 6000) }
const r = await p.evaluate(() => {
  const w = document.querySelector('.db3-frame').contentWindow, bs = w.__iaqBoss, ms = w.__iaqScene, o = []
  const size = x => { const v = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 }; x.updateWorldMatrix(true, true); x.traverse(m => { if (!m.isMesh || !m.geometry) return; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox, e = m.matrixWorld.elements; for (let i = 0; i < 8; i++) { const lx = i & 1 ? b.max.x : b.min.x, ly = i & 2 ? b.max.y : b.min.y, lz = i & 4 ? b.max.z : b.min.z; const X = e[0] * lx + e[4] * ly + e[8] * lz + e[12], Y = e[1] * lx + e[5] * ly + e[9] * lz + e[13], Z = e[2] * lx + e[6] * ly + e[10] * lz + e[14]; v.x0 = Math.min(v.x0, X); v.x1 = Math.max(v.x1, X); v.y0 = Math.min(v.y0, Y); v.y1 = Math.max(v.y1, Y); v.z0 = Math.min(v.z0, Z); v.z1 = Math.max(v.z1, Z) } }); return [v.x1 - v.x0, v.y1 - v.y0, v.z1 - v.z0].map(n => Math.round(n * 100) / 100).join('x') + ' at ' + [(v.x0 + v.x1) / 2, v.y0, (v.z0 + v.z1) / 2].map(n => Math.round(n * 10) / 10).join(',') }
  const cars = []; bs.traverse(x => { if (/^car-/.test(x.name || '')) cars.push(x) })
  o.push('cars in boss scene: ' + cars.length)
  for (const c of cars.slice(0, 14)) { let meshes = 0, mats = []; c.traverse(m => { if (m.isMesh) { meshes++; for (const mm of [].concat(m.material)) mats.push(mm.type + ':' + (mm.color ? mm.color.getHexString() : '') + (mm.map ? '+map' : '')) } }); o.push(`  ${c.name} ${c.type} vis=${c.visible} meshes=${meshes} size=${size(c)} parent=${c.parent && c.parent.name} mats=${mats.slice(0, 6).join(' ')}`) }
  const inst = []; bs.traverse(x => { if (x.isInstancedMesh) inst.push(x) })
  for (const m of inst.slice(0, 20)) { const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox; const mm = [].concat(m.material)[0]; o.push(`  INST ${m.name || '-'} parent=${m.parent && (m.parent.name || m.parent.type)} count=${m.count} geo=${g.type} gsize=${[(b.max.x - b.min.x), (b.max.y - b.min.y), (b.max.z - b.min.z)].map(n => n.toFixed(2)).join('x')} mat=${mm.type}:${mm.color ? mm.color.getHexString() : ''}${mm.map ? '+map' : ''}${mm.alphaTest ? ' alphaTest' : ''} cast=${m.castShadow}`) }
  const types = {}; for (const s of [bs, ms]) s.traverse(x => { if (x.geometry) types[x.geometry.type] = (types[x.geometry.type] || 0) + 1 })
  o.push('geometry types: ' + JSON.stringify(types))
  const hs = bs.getObjectByName('handover-site'); o.push('hs pos ' + JSON.stringify(hs.position) + ' rot ' + JSON.stringify([hs.rotation.x, hs.rotation.y, hs.rotation.z]) + ' scale ' + JSON.stringify(hs.scale))
  const cam = w.__iaqLook; o.push('look ' + (cam ? JSON.stringify(Object.keys(cam)).slice(0, 200) : 'none'))
  const R = w.__iaqRenderer; o.push('renderer shadows ' + (R && R.shadowMap.enabled) + ' pr ' + (R && R.getPixelRatio()))
  let lights = []; bs.traverse(x => { if (x.isLight) lights.push(x.type + ' int=' + x.intensity.toFixed(2) + ' cast=' + x.castShadow + ' pos=' + [x.position.x, x.position.y, x.position.z].map(n => Math.round(n)).join(',')) }); o.push('boss lights: ' + lights.join(' | '))
  return o.join('\n')
})
console.log(r)
await b.close()
