import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 3; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
const inv = await p.evaluate(() => {
  const W = document.querySelector('.db3-frame').contentWindow, B = W.__iaqBoss; if (!B) return 'no boss'
  const out = []; const box = new (W.__iaqCam.position.constructor)()
  B.traverse(n => { if (!(n.isMesh || n.isLight || n.isInstancedMesh)) return; let vis = true, q = n; while (q) { if (!q.visible) vis = false; q = q.parent }
    const g = n.geometry; let ext = null; if (g) { g.computeBoundingBox && !g.boundingBox && g.computeBoundingBox(); const bb = g.boundingBox; if (bb) ext = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map(x => Math.round(x * (n.scale ? n.scale.x : 1))) }
    const m = n.material; out.push([n.type, n.name || (n.parent && n.parent.name) || '', vis, ext, m && m.color ? m.color.getHexString() : null, m && m.map ? 'map' : '', m ? +(m.opacity ?? 1).toFixed(2) : null, m && m.fog, n.receiveShadow, Math.round(n.position.y * 100) / 100]) })
  return { fog: B.fog && [B.fog.near, B.fog.far, B.fog.color.getHexString()], bg: B.background && (B.background.isColor ? B.background.getHexString() : 'tex'), n: out.length, big: out.filter(r => r[3] && (r[3][0] > 150 || r[3][2] > 150)), lights: out.filter(r => /Light/.test(r[0])) }
})
console.log(JSON.stringify(inv, null, 0)); await b.close()
