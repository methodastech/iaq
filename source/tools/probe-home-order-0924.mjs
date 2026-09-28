import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
console.log(JSON.stringify(await p.evaluate(() => ({ order: [...document.querySelectorAll('body section, body header')].filter(e => e.getBoundingClientRect().height > 200).map(e => e.id || e.className.split(' ')[0]), explorer: !!document.querySelector('.fx'), total: document.body.scrollHeight }))), 'errors', errs.length)
await b.close()
