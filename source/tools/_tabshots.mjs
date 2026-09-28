import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) }; try { sessionStorage.setItem('iaq.portal', '1'); localStorage.setItem('iaq.portal', '1') } catch (e) {} })
for (const [u, n, ys] of [['http://localhost:57375/design.html', 'iaq-design', [0, 1400, 5200]], ['http://localhost:57375/portal/codex', 'iaq-codex', [0, 1200, 3200]]]) {
  await p.goto(u, { waitUntil: 'networkidle2', timeout: 90000 }); await sleep(3000)
  for (const y of ys) { await p.evaluate(y => window.scrollTo(0, y), y); await sleep(900); await p.screenshot({ path: `${out}/${n}-${y}.png` }) }
}
await b.close()
