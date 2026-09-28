import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 300)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify({ row: await p.evaluate(() => !!document.querySelector('.hmk-row')), errs: errs.slice(0, 4) }, null, 1))
await b.close()
