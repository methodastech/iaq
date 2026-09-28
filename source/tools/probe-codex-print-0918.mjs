import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto('http://localhost:5177/', { waitUntil: 'networkidle2', timeout: 60000 })
await page.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
await page.goto('http://localhost:5177/codex', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 1500))
const n = await page.evaluate(() => document.querySelectorAll('.cx-part').length)
await page.emulateMediaType('print')
await page.pdf({ path: OUT + '/codex-print.pdf', format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' } })
console.log('parts', n, 'pdf written')
await browser.close()
