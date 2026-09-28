import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] })
const p = await b.newPage(); await p.setViewport({ width: 1240, height: 330 })
await p.goto('file://' + process.argv[2], { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 500))
await p.screenshot({ path: process.argv[3] }); await b.close()
