import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)))
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 })
let bad = 0, n = 0
for (let i = 0; i < 90; i++) { await sleep(250)
  const st = await p.evaluate(() => { const vs = [...document.querySelectorAll('.hero video')].map(v => ({ f: (v.currentSrc || v.src).split('/').pop().replace('.mp4', ''), op: +getComputedStyle(v).opacity, z: +getComputedStyle(v).zIndex || 0 })).sort((a, b) => b.z - a.z); const top = vs[0].op > .5 ? vs[0] : vs[1]; return { now: (document.querySelector('.hs-now') || {}).textContent, top } })
  const NAMES = { 'hero-plant': 'Stadium build', 'hero-mkt-district-cooling': 'District cooling', 'hero-kl': 'Kuala Lumpur', 'hookup-team-rep': 'Tool hook-up', 'cr-bay-hf': 'Cleanroom bay', 'hero-campus-dusk': 'Production campus', 'hero-mkt-data-centre': 'Data centre', 'cr-corridor-hf': 'Cleanroom corridor' }
  n++; if (st.top && st.top.op > .6 && NAMES[st.top.f] !== st.now) { bad++; if (bad < 4) console.log('mismatch', JSON.stringify(st)) }
}
console.log('samples', n, 'mismatches while a clip is mostly shown', bad, 'errors', JSON.stringify(errs)); await b.close()
