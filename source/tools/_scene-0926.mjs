import puppeteer from 'puppeteer-core'
/* 26 Sep: map the Environment scene at handover: ground planes, building footprint, props. */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 12000 : 6000) }
const r = await p.evaluate(() => {
  const w = document.querySelector('.db3-frame').contentWindow, sc = w.__iaqBoss
  const out = { top: [], flats: [], named: [], three: Object.keys(w.__iaqTHREE ? w.__iaqTHREE() : {}) }
  const bbOf = o => { const bx = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 }; o.updateWorldMatrix(true, true); o.traverse(m => { if (!m.isMesh || !m.geometry || !m.visible) return; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const bb = g.boundingBox, e = m.matrixWorld.elements; for (let i = 0; i < 8; i++) { const lx = i & 1 ? bb.max.x : bb.min.x, ly = i & 2 ? bb.max.y : bb.min.y, lz = i & 4 ? bb.max.z : bb.min.z; const x = e[0] * lx + e[4] * ly + e[8] * lz + e[12], y = e[1] * lx + e[5] * ly + e[9] * lz + e[13], z = e[2] * lx + e[6] * ly + e[10] * lz + e[14]; bx.x0 = Math.min(bx.x0, x); bx.x1 = Math.max(bx.x1, x); bx.y0 = Math.min(bx.y0, y); bx.y1 = Math.max(bx.y1, y); bx.z0 = Math.min(bx.z0, z); bx.z1 = Math.max(bx.z1, z) } }); return Object.fromEntries(Object.entries(bx).map(([k, v]) => [k, Math.round(v * 10) / 10])) }
  for (const c of sc.children) { let n = 0; c.traverse(m => { if (m.isMesh) n++ }); out.top.push({ name: c.name, type: c.type, vis: c.visible, meshes: n, kids: c.children.length, bb: n ? bbOf(c) : null }) }
  sc.traverse(m => { if (!m.isMesh || !m.visible) return; const g = m.geometry; if (!g) return; if (!g.boundingBox) g.computeBoundingBox(); m.updateWorldMatrix(true, false); const bb = bbOf(m); const dx = bb.x1 - bb.x0, dz = bb.z1 - bb.z0, dy = bb.y1 - bb.y0; if (dx > 8 && dz > 8 && dy < 1.5) { const mat = Array.isArray(m.material) ? m.material[0] : m.material; out.flats.push({ name: m.name, parent: m.parent && m.parent.name, type: m.type, gtype: g.type, bb, col: mat && mat.color ? mat.color.getHexString() : null, map: !!(mat && mat.map), mtype: mat && mat.type }) } })
  sc.traverse(o => { if (o.name && out.named.length < 120 && o.parent && (o.parent === sc || o.parent.parent === sc)) out.named.push(o.name + ' [' + o.type + '] ' + JSON.stringify(bbOf(o))) })
  return out
})
console.log("THREE", r.three.join(",")); for (const t of r.top) console.log("TOP", t.name || t.type, t.vis ? "on" : "off", t.meshes, JSON.stringify(t.bb)); for (const f of r.flats) console.log("FLAT", JSON.stringify(f)); for (const n of r.named) console.log("NAMED", n)
await b.close()
