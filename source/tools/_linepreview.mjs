import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const RED = ':root,html body{--line:rgba(236,35,38,.30)!important;--line2:rgba(236,35,38,.46)!important}'
for (const [route, sel, name] of [['/about/leadership', '.cp-rows,.cp-facts', 'lead'], ['/services/design', '.pg-sec.calm', 'svc'], ['/projects', '.pc', 'proj']]) {
  for (const v of ['grey', 'red']) {
    await p.goto('http://localhost:57375' + route + '?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1200)
    await p.evaluate(css => { const st = document.createElement('style'); st.textContent = '[data-reveal],.reveal,[class*="reveal"],.in,[data-rv]{opacity:1!important;transform:none!important;visibility:visible!important}' + css; document.head.appendChild(st) }, v === 'red' ? RED : '')
    await p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'start' }) }, sel); await sleep(700)
    await p.screenshot({ path: `${out}/lp-${name}-${v}.png` })
  }
}
await b.close()
