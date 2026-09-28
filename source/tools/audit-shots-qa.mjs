import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1400, height: 900 })
const wait = ms => new Promise(r => setTimeout(r, ms))
await p.goto(BASE + '/qa.html', { waitUntil: 'networkidle0', timeout: 60000 }); await wait(800)
await p.screenshot({ path: `${OUT}/20-qa-top.png` })
const info = await p.evaluate(() => ({ h2: [...document.querySelectorAll('h2')].map(h => h.textContent.trim().slice(0, 60)), tables: document.querySelectorAll('table').length, height: document.body.scrollHeight }))
console.log(JSON.stringify(info))
const clipBy = async (re, name, maxH = 900) => { const box = await p.evaluate(re => { const h = [...document.querySelectorAll('h2')].find(h => new RegExp(re).test(h.textContent)); if (!h) return null; const r = h.getBoundingClientRect(); return { top: r.top + window.scrollY - 16 } }, re); if (!box) { console.log('MISSING', re); return } await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: box.top, width: 1400, height: maxH }, captureBeyondViewport: true }); console.log('clip', name) }
await clipBy('right|Strength|works', '21-qa-strengths'); await clipBy('Problem|wrong', '22-qa-problems'); await clipBy('Solution', '23-qa-solutions'); await clipBy('Action|check', '24-qa-action')
const row = await p.evaluate(() => { const tr = [...document.querySelectorAll('tr')].reverse().find(tr => /\bP01\b/.test(tr.innerText)); if (!tr) return null; const r = tr.getBoundingClientRect(); return { top: r.top + window.scrollY - 8, h: r.height + 16 } })
if (row) await p.screenshot({ path: `${OUT}/25-qa-p01-row.png`, clip: { x: 0, y: row.top, width: 1400, height: Math.min(900, row.h) }, captureBeyondViewport: true })
await b.close()
