import puppeteer from 'puppeteer-core'
const out = process.argv[2], tag = process.argv[3] || 'look', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error' || /iaq-look|WebGL|shader/i.test(m.text())) errs.push(m.type() + ' ' + m.text().slice(0, 300)) })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
const fr = () => p.evaluate(() => document.querySelector('.db3-frame').contentWindow)
const shot = async n => { await p.screenshot({ path: `${out}/${tag}-${n}.png` }) }
const setLook = on => p.evaluate(v => { document.querySelector('.db3-frame').contentWindow.__iaqLookOff = !v }, on)
const fps = () => p.evaluate(() => new Promise(res => { const W = document.querySelector('.db3-frame').contentWindow; let n = 0; const t = W.performance.now(); const f = () => { n++; if (W.performance.now() - t < 2500) W.requestAnimationFrame(f); else res(Math.round(n / 2.5)) }; W.requestAnimationFrame(f) }))
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
await setLook(false); await sleep(600); await shot('v1-off'); const f0 = await fps()
await setLook(true); await sleep(600); await shot('v1-on'); const f1 = await fps()
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
await setLook(false); await sleep(600); await shot('v2-off')
await setLook(true); await sleep(600); await shot('v2-on'); const f2 = await fps()
console.log('fps off', f0, 'on V1', f1, 'on V2', f2); console.log('errors', errs.slice(0, 6)); await b.close()
