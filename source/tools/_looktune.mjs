import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
const W = () => 'document.querySelector(".db3-frame").contentWindow'
const tune = t => p.evaluate(v => { const w = document.querySelector('.db3-frame').contentWindow; if (v === 'off') { w.__iaqLookOff = true } else { w.__iaqLookOff = false; w.__iaqLookTune = v } }, t)
const shot = async n => { await sleep(700); await p.screenshot({ path: `${out}/lt-${n}.png` }) }
const cfgs = { off: 'off', A: { uK: 0.022, uIntensity: 1.5, uStrength: 0.95, uExposure: 0.9 }, B: { uK: 0.022, uIntensity: 1.5, uStrength: 0.95, uExposure: 0.78 }, C: { uK: 0.025, uIntensity: 2.2, uStrength: 1.0, uExposure: 0.85 } }
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
for (const [k, v] of Object.entries(cfgs)) { await tune(v); await shot('v1-' + k) }
await tune('off'); await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 4; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
for (const [k, v] of Object.entries(cfgs)) { await tune(v); await shot('v2-' + k) }
await b.close()
