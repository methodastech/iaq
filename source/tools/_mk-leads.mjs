import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await p.goto('http://localhost:50519/markets', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(r => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.mk-cd-lead')].map(e => e.textContent))))
await b.close()
