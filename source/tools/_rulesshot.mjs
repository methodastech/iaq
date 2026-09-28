import puppeteer from 'puppeteer-core'
const out = process.argv[2], jobs = JSON.parse(process.argv[3]), W = +(process.argv[4] || 1440), sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: 900 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
for (const [route, sel, name] of jobs) {
  await p.goto('http://localhost:57375' + route + '?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1500)
  await p.evaluate(() => { const st = document.createElement('style'); st.textContent = '[data-reveal],.reveal,[class*="reveal"],.in,[data-rv]{opacity:1!important;transform:none!important;visibility:visible!important}'; document.head.appendChild(st) })
  const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 800) { await p.evaluate(y => scrollTo(0, y), y); await sleep(90) }
  const ok = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.scrollIntoView({ block: 'start' }); return true }, sel); await sleep(900)
  if (!ok) { console.log('missing', route, sel); continue }
  await p.screenshot({ path: `${out}/${name}.png` })
}
await b.close()
