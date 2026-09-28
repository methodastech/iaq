import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', e => errs.push(String(e)))
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2500))
const H = await p.evaluate(() => document.documentElement.scrollHeight)
const shots = []
for (let y = 0, k = 0; y < H - 900 && k < 14; y += 820, k++) {
  await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1300))
  await p.screenshot({ path: `${OUT}/cu-${k}.png`, captureBeyondViewport: false }); shots.push(k)
}
const text = await p.evaluate(() => document.querySelector('main, #root').innerText)
const dash = (text.match(/[—–]| - /g) || []).length, bang = (text.match(/!/g) || []).length
console.log(JSON.stringify({ H, shots: shots.length, dash, bang, errs: errs.slice(0, 3) }))
await b.close()
