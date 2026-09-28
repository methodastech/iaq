import puppeteer from 'puppeteer-core'
const out = process.argv[2], tag = process.argv[3] || 'l2', tuneArg = process.argv[4] ? JSON.parse(process.argv[4]) : null, sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error' || /iaq-look|WebGL|shader|GL_/i.test(m.text())) errs.push(m.type() + ' ' + m.text().slice(0, 400)) })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
const shot = async n => { await sleep(900); await p.screenshot({ path: `${out}/${tag}-${n}.png` }) }
const set = v => p.evaluate(v => { const W = document.querySelector('.db3-frame').contentWindow; if (v === 'off') { W.__iaqLookOff = true } else { W.__iaqLookOff = false; W.__iaqLookTune = v } }, v)
const fps = () => p.evaluate(() => new Promise(res => { const W = document.querySelector('.db3-frame').contentWindow; let n = 0; const t = W.performance.now(); const f = () => { n++; if (W.performance.now() - t < 2500) W.requestAnimationFrame(f); else res(Math.round(n / 2.5)) }; W.requestAnimationFrame(f) }))
const base = tuneArg || {}
const pass = async v => { await set('off'); await shot(v + '-off'); await set({ ...base, uDebug: 1 }); await shot(v + '-ao'); await set({ ...base, uDebug: 0 }); await shot(v + '-on'); return fps() }
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
const f1 = await pass('v1')
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
const f2 = await pass('v2')
const inv = await p.evaluate(() => { const W = document.querySelector('.db3-frame').contentWindow, sc = W.__iaqScene, r = W.__iaqRenderer; const o = { shadowMap: r && r.shadowMap.enabled, cast: 0, recv: 0, meshes: 0, lights: [] }; sc && sc.traverse(n => { if (n.isMesh && n.visible) { o.meshes++; n.castShadow && o.cast++; n.receiveShadow && o.recv++ } if (n.isLight) o.lights.push([n.type, n.name, +n.intensity.toFixed(2), n.castShadow, n.shadow && n.shadow.mapSize ? n.shadow.mapSize.x : null, n.shadow && n.shadow.camera ? [n.shadow.camera.left, n.shadow.camera.right, n.shadow.camera.top, n.shadow.camera.bottom, n.shadow.camera.far].map(x => Math.round(x)) : null]) }); return o })
console.log('fps V1', f1, 'V2', f2); console.log('inventory', JSON.stringify(inv)); console.log('errors', JSON.stringify(errs.slice(0, 8))); await b.close()
