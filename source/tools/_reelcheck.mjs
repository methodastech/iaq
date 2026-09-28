import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 })
for (let i = 0; i < 6; i++) {
  await sleep(3000)
  const st = await p.evaluate(() => ({ now: (document.querySelector('.hs-now') || {}).textContent, vids: [...document.querySelectorAll('.hero video')].map(v => { const cs = getComputedStyle(v); return (v.currentSrc || v.src).split('/').pop() + ' op' + (+cs.opacity).toFixed(2) + ' z' + cs.zIndex + ' t' + v.currentTime.toFixed(1) + (v.paused ? ' paused' : '') + ' cls:' + v.className }) }))
  console.log(i * 3 + 3 + 's', JSON.stringify(st))
  if (i === 0) await p.screenshot({ path: `${out}/reel-3s.png`, clip: { x: 700, y: 150, width: 700, height: 420 } })
}
await b.close()
