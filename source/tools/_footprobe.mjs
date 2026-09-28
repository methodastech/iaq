import puppeteer from 'puppeteer-core'
const out = process.argv[2], route = process.argv[3] || '/about', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375' + route + '?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1500)
const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await sleep(120) }
await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(2500)
await p.screenshot({ path: `${out}/foot-bottom.png` })
const info = await p.evaluate(() => {
  const a = [...document.querySelectorAll('footer a')].find(x => /Global Presence/.test(x.textContent)); if (!a) return 'no link'
  const r = a.getBoundingClientRect(); const st = document.elementsFromPoint(r.left + 5, r.top + r.height / 2).slice(0, 6).map(e => e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' z' + getComputedStyle(e).zIndex + ' pos' + getComputedStyle(e).position + ' op' + getComputedStyle(e).opacity)
  const f = document.querySelector('.close3d footer'); const fs = getComputedStyle(f)
  return { link: [r.top, r.height].map(Math.round), stack: st, footer: { pos: fs.position, z: fs.zIndex, top: Math.round(f.getBoundingClientRect().top), h: Math.round(f.getBoundingClientRect().height), bg: fs.backgroundColor } }
})
console.log(JSON.stringify(info, null, 1)); await b.close()
