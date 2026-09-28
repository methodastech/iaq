import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.sm-faq').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 800))
await (await p.$('.faq-mark')).screenshot({ path: `${OUT}/faq-mark2.png` }); await b.close()
