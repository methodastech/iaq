import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
const tune = t => p.evaluate(v => { document.querySelector('.db3-frame').contentWindow.__iaqLookTune = v }, t)
const shot = async n => { await sleep(700); await p.screenshot({ path: `${out}/ao-${n}.png` }) }
const cfgs = { a: { uDebug: 1, uK: 0.02, uIntensity: 1.0 }, b: { uDebug: 1, uK: 0.012, uIntensity: 1.2 }, c: { uDebug: 1, uK: 0.035, uIntensity: 0.9 } }
for (const [k, v] of Object.entries(cfgs)) { await tune(v); await shot(k) }
await b.close()
