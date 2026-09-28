import puppeteer from 'puppeteer-core'
/* 26 Sep: what the site scene holds at chapter 1 and at handover (props, trees, cars, visibility). */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
const snap = () => p.evaluate(() => {
  const w = document.querySelector('.db3-frame').contentWindow, sc = w.__iaqBoss, o = []
  const bb = x => { const v = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 }; x.updateWorldMatrix(true, true); x.traverse(m => { if (!m.isMesh || !m.geometry) return; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox, e = m.matrixWorld.elements; for (let i = 0; i < 8; i++) { const lx = i & 1 ? b.max.x : b.min.x, ly = i & 2 ? b.max.y : b.min.y, lz = i & 4 ? b.max.z : b.min.z; const X = e[0] * lx + e[4] * ly + e[8] * lz + e[12], Y = e[1] * lx + e[5] * ly + e[9] * lz + e[13], Z = e[2] * lx + e[6] * ly + e[10] * lz + e[14]; v.x0 = Math.min(v.x0, X); v.x1 = Math.max(v.x1, X); v.y0 = Math.min(v.y0, Y); v.y1 = Math.max(v.y1, Y); v.z0 = Math.min(v.z0, Z); v.z1 = Math.max(v.z1, Z) } }); return [v.x0, v.x1, v.y0, v.y1, v.z0, v.z1].map(n => Math.round(n * 10) / 10).join(' ') }
  const vis = x => { for (let a = x; a; a = a.parent) if (!a.visible) return false; return true }
  for (const n of ['boss-site', 'handover-site', 'site-props']) { const g = sc.getObjectByName(n); if (!g) { o.push(n + ' missing'); continue } o.push(`${n} visible=${vis(g)} kids=${g.children.length}`); for (const c of g.children.slice(0, 40)) { let meshes = 0, inst = 0, tris = 0; c.traverse(m => { if (m.isMesh) { meshes++; if (m.isInstancedMesh) inst += m.count; const g2 = m.geometry; tris += g2 && g2.index ? g2.index.count / 3 : (g2 && g2.attributes.position ? g2.attributes.position.count / 3 : 0) } }); o.push(`   ${c.name || '(' + c.type + ')'} ${c.type} vis=${c.visible} meshes=${meshes} inst=${inst} tris=${Math.round(tris)} bb=${meshes ? bb(c) : ''}`) } }
  return o.join('\n')
})
console.log('--- chapter 1\n' + await snap())
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 12000 : 6000) }
console.log('--- handover\n' + await snap())
await b.close()
