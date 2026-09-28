import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 220)))
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 220)) })
p.on('requestfailed', q => errs.push('requestfailed: ' + q.url().slice(-80) + ' ' + (q.failure()?.errorText || '')))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about?noanim', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 2500))
console.log(errs.join('\n') || 'none')
await b.close()
