import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/portal/codex', { waitUntil: 'networkidle2', timeout: 90000 }); await sleep(2500)
const clicked = await p.evaluate(() => { const b = [...document.querySelectorAll('button,a')].find(e => /emergency access/i.test(e.textContent)); if (b) { b.click(); return true } return false })
await sleep(4000)
const H = await p.evaluate(() => document.documentElement.scrollHeight)
const heads = await p.evaluate(() => [...document.querySelectorAll('h2,h3')].map(h => [h.tagName, h.textContent.trim().slice(0, 80), Math.round(h.getBoundingClientRect().top + scrollY)]))
for (const y of [0, 900, 2600, 5200]) { await p.evaluate(y => window.scrollTo(0, y), y); await sleep(1000); await p.screenshot({ path: `${out}/cx-${y}.png` }) }
console.log('clicked', clicked, 'height', H); console.log(heads.map(h => h.join(' | ')).join('\n')); await b.close()
