import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services/epc-construction', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
const H = await p.evaluate(() => document.documentElement.scrollHeight)
let k = 0
for (let y = 0; y < H - 600; y += 800) {
  await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1300))
  await p.screenshot({ path: `${OUT}/epc-${k++}.png`, captureBeyondViewport: false })
}
console.log(JSON.stringify({ H, shots: k }))
await b.close()
