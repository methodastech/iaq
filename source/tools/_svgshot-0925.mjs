import puppeteer from 'puppeteer-core'
const [f, out, w = '1400'] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: +w, height: 800 })
await p.goto('http://localhost:5177/' + f, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 400))
await p.screenshot({ path: out, fullPage: true }); await b.close()
