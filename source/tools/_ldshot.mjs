import puppeteer from 'puppeteer-core'
const out = process.argv[2], tag = process.argv[3] || 'ld', W = +(process.argv[4] || 1440), sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: W < 700 ? 844 : 900, isMobile: W < 700 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?ldhold=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await sleep(2500)
for (const v of [0.15, 0.5, 0.85]) { await p.evaluate(v => { window.__ldPd = v }, v); await sleep(700); await p.screenshot({ path: `${out}/${tag}-${Math.round(v * 100)}.png` }) }
await b.close()
