import puppeteer from 'puppeteer-core'
const frac = parseFloat(process.argv[3] || '0.35')
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2600))
await p.evaluate(f => {
  const el = document.querySelector('.fab')
  const r = el.getBoundingClientRect()
  const top = r.top + scrollY
  scrollTo(0, top + el.offsetHeight * f)
}, frac)
await new Promise(r => setTimeout(r, 2200))
await p.screenshot({ path: process.argv[2] })
console.log('shot at', frac)
await b.close()
