import puppeteer from 'puppeteer-core'
const out = process.argv[2], tag = process.argv[3] || 'sky', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('http://localhost:52658/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(3000)
const frame = async n => { const el = await p.$('.db3-pin'); await el.screenshot({ path: `${out}/${tag}-${n}.png` }) }
await frame('0start')
await p.mouse.move(900, 400); for (let i = 0; i < 3; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4300) }
await frame('1mid')
for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4300) }
await sleep(3500); await frame('2end')
/* turn the view to look up toward the horizon */
await p.mouse.move(900, 450); await p.mouse.down(); await p.mouse.move(900, 620, { steps: 20 }); await p.mouse.up(); await sleep(1500); await frame('3tilt')
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(6000); await frame('4v2')
console.log('errors', errs); await b.close()
