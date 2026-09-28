import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 60000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services/energy-management?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
const r = await p.evaluate(() => [...document.querySelectorAll('.un-sec i')].filter(e => /236, 32, 39/.test(getComputedStyle(e).backgroundColor)).map(e => ({ cls: e.className, parent: e.parentElement.className, sec: e.closest('section').className, html: e.outerHTML.slice(0, 120), w: e.getBoundingClientRect().width })))
console.log(JSON.stringify(r)); await b.close(); process.exit(0)
