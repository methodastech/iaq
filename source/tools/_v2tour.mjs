import puppeteer from 'puppeteer-core'
const out = process.argv[2], mode = process.argv[3] || 'v2', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
if (mode === 'v2') { await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000) }
await p.screenshot({ path: `${out}/${mode}-s0.png` })
await p.mouse.move(900, 400); for (let i = 1; i <= 9; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4600); await p.screenshot({ path: `${out}/${mode}-s${i}.png` }) }
console.log('errors', JSON.stringify(errs.slice(0, 5))); await b.close()
