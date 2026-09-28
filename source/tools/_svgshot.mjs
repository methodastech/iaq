import puppeteer from 'puppeteer-core'
const [,, url, out, w, h] = process.argv
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: +w, height: +h })
await p.goto(url, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 800))
await p.screenshot({ path: out }); await b.close()
