import puppeteer from 'puppeteer-core'
/* 26 Sep: the furnished yard at handover. node tools/_yard-0926.mjs <outdir> [W] [H] */
const out = process.argv[2], W = +process.argv[3] || 1440, H = +process.argv[4] || 900, sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 2 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 14000 : 6500) }
const st = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow, bs = w.__iaqBoss, R = w.__iaqRenderer; const L = []; bs.traverse(o => { if (o.isDirectionalLight) L.push({ i: +o.intensity.toFixed(2), cast: o.castShadow, map: !!(o.shadow && o.shadow.map) }) }); let painted = 0, bright = 0; bs.traverse(o => { if (o.userData && o.userData.iaqPaint) painted++; if (o.isMesh && !o.isInstancedMesh && o.material && /^Body/.test(o.material.name || '') && o.material.map) bright++ }); const sun = []; bs.traverse(o => { if (o.isDirectionalLight && o.castShadow) sun.push(o) }); const s0 = sun[0]; const tgt = s0 && s0.target; const hs = bs.getObjectByName('handover-site'); const recv = []; hs.children.forEach(c => { if (c.isMesh && !c.isInstancedMesh) recv.push((c.material && c.material.type) + ':' + c.receiveShadow) }); const yd = hs.getObjectByName('iaq-yard'); const cast = yd ? yd.children.filter(c => c.castShadow).length : -1; return { yard: w.__iaqYard || null, err: w.__iaqYardErr || null, lights: L, auto: R.shadowMap.autoUpdate, enabled: R.shadowMap.enabled, type: R.shadowMap.type, painted, bright, tgt: tgt && [tgt.position.x, tgt.position.y, tgt.position.z, !!tgt.parent], lpos: s0 && [s0.position.x, s0.position.y, s0.position.z, s0.parent && s0.parent.type], cam: s0 && [s0.shadow.camera.left, s0.shadow.camera.near, s0.shadow.camera.far], mapSize: s0 && s0.shadow.map && [s0.shadow.map.width, s0.shadow.map.height], recv: recv.slice(0, 8), cast, ydVis: yd && yd.visible } })
console.log(JSON.stringify(st), 'errors', JSON.stringify(errs.slice(0, 4)))
await p.screenshot({ path: `${out}/yard-${W}.png` })
/* turn the model a little to see the yard from the south */
await p.mouse.move(W * .66, H * .55); await p.mouse.down(); await p.mouse.move(W * .66 + 260, H * .55, { steps: 12 }); await p.mouse.up(); await sleep(3500)
await p.screenshot({ path: `${out}/yard-${W}-turn.png` })
await b.close()
