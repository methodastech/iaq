import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const errs = []
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)) }); p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 300)))
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(r => setTimeout(r, 2500))
const m = await p.evaluate(() => ({ sysm: !!document.querySelector('.sysm'), band: !!document.querySelector('.sm-map-dark.sm-map-full'), sections: document.querySelectorAll('section').length, bodyText: document.body.innerText.slice(0, 120) }))
console.log(JSON.stringify({ m, errs: errs.slice(0, 5) }))
await b.close()
