import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:52658/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(3000)
await p.mouse.move(900, 400)
const on = () => p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; return [...d.querySelectorAll('#hud2 .h-rail li')].findIndex(l => l.classList.contains('on')) })
for (let k = 0; k < 12; k++) {
  const before = await on(); await p.mouse.wheel({ deltaY: 100 })
  const t0 = Date.now(); while (Date.now() - t0 < 14000) { await sleep(700); const slow = await p.evaluate(() => !!document.querySelector('.db3-slow.is-on')); if (!slow && Date.now() - t0 > 4500) break }
  const now = await on(); await p.screenshot({ path: `${out}/c2-${k}.png` }); console.log('roll', k, 'chapter', before, '->', now)
  if (now === 8 && before === 8) break
}
await b.close()
