import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const shot = async (w, h, name, fn) => {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1800))
  const y = await p.evaluate(fn); await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1400))
  await p.screenshot({ path: `${OUT}/${name}.png`, captureBeyondViewport: false }); await p.close()
}
await shot(1440, 900, 'seam-1440', () => document.querySelector('#story').getBoundingClientRect().top + scrollY - 380)
await shot(1024, 800, 'story-1024', () => document.querySelector('#story').getBoundingClientRect().top + scrollY - 40)
await shot(1024, 800, 'proof-1024', () => document.querySelector('#proof').getBoundingClientRect().top + scrollY - 120)
await shot(768, 1024, 'story-768', () => document.querySelector('#story').getBoundingClientRect().top + scrollY - 40)
await b.close()
