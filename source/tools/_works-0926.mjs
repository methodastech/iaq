import puppeteer from 'puppeteer-core'
/* 26 Sep: the Services works band, for the split line question. node tools/_works-0926.mjs <out.png> */
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/services?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
const r = await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; const s = document.querySelector('.sm-works'); if (!s) return null; s.scrollIntoView({ block: 'start', behavior: 'instant' }); await new Promise(r => setTimeout(r, 1800)); s.classList.add('in'); const bx = s.getBoundingClientRect(); const lines = [...s.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e, '::before'); return c.content !== 'none' && c.content !== 'normal' && parseFloat(c.height) <= 4 }).length; const other = [...s.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e); return (parseFloat(c.borderTopWidth) > 0 && c.borderTopStyle !== 'none') || (parseFloat(c.borderBottomWidth) > 0 && c.borderBottomStyle !== 'none') }).map(e => e.className).slice(0, 8); return { top: Math.round(bx.top), h: Math.round(bx.height), beforeLines: lines, borders: other } })
console.log(JSON.stringify(r))
await sleep(1200); await p.screenshot({ path: out })
await b.close()
