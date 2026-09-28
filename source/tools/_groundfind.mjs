import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 3; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
// candidates: visible meshes in either scene whose world bbox spans > 300 m
const cands = await p.evaluate(() => {
  const W = document.querySelector('.db3-frame').contentWindow, out = []; W.__iaqCands = []
  for (const [tag, sc] of [['boss', W.__iaqBoss], ['main', W.__iaqScene]]) sc.traverse(n => { if (!n.isMesh) return; let v = true, q = n; while (q) { if (!q.visible) v = false; q = q.parent } if (!v) return
    const g = n.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); const s = n.getWorldScale(new (n.position.constructor)()); const R = g.boundingSphere.radius * Math.max(s.x, s.y, s.z); if (R < 150) return
    const m = n.material; W.__iaqCands.push(n); out.push({ i: W.__iaqCands.length - 1, tag, name: n.name, par: n.parent && n.parent.name, R: Math.round(R), col: m.color && m.color.getHexString(), map: !!m.map, fog: m.fog, type: m.type, shader: !!m.onBeforeCompile && m.onBeforeCompile.toString().length > 30, y: +n.getWorldPosition(new (n.position.constructor)()).y.toFixed(2) }) })
  return out })
console.log(JSON.stringify(cands))
const px = async () => { await sleep(500); const buf = await p.screenshot({ clip: { x: 1300, y: 440, width: 1, height: 1 }, encoding: 'binary' }); return buf.length }
for (const c of cands) {
  await p.evaluate(i => { document.querySelector('.db3-frame').contentWindow.__iaqCands[i].visible = false }, c.i); await sleep(600)
  await p.screenshot({ path: `${out}/gf-${c.i}.png`, clip: { x: 400, y: 250, width: 1040, height: 400 } })
  await p.evaluate(i => { document.querySelector('.db3-frame').contentWindow.__iaqCands[i].visible = true }, c.i)
}
await p.screenshot({ path: `${out}/gf-all.png`, clip: { x: 400, y: 250, width: 1040, height: 400 } })
await b.close()
