import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
const info = await p.evaluate(() => {
  const W = document.querySelector('.db3-frame').contentWindow, sc = W.__iaqScene; const r3 = v => [v.x, v.y, v.z].map(x => +x.toFixed(1))
  const L = []; let cam = null
  sc.traverse(n => { if (n.isDirectionalLight) L.push({ i: n.intensity, cast: n.castShadow, pos: r3(n.position), tgt: r3(n.target.position), col: n.color.getHexString(), bias: n.shadow.bias, nb: n.shadow.normalBias, rad: n.shadow.radius }); if (n.isHemisphereLight) L.push({ hemi: n.intensity, sky: n.color.getHexString(), gnd: n.groundColor.getHexString(), pos: r3(n.position) }); if (n.isAmbientLight) L.push({ amb: n.intensity, col: n.color.getHexString() }) })
  const r = W.__iaqRenderer
  return { L, shadowType: r.shadowMap.type, tone: r.toneMapping, exp: r.toneMappingExposure, envI: sc.environmentIntensity, bgIsTex: !!(sc.background && sc.background.isTexture), fog: sc.fog && [sc.fog.near, sc.fog.far, sc.fog.color.getHexString()] }
})
console.log(JSON.stringify(info, null, 0))
await p.screenshot({ path: `${out}/sun-now.png` })
await b.close()
