import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services/epc-construction?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
await p.evaluate(() => { const e = document.querySelector('.un-cycle'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 20) }); await new Promise(r => setTimeout(r, 1500))
const r = await p.evaluate(() => [...document.querySelectorAll('.cyc-num')].map(e => { const b = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 14), Math.round(b.left), Math.round(b.right), getComputedStyle(e).visibility, getComputedStyle(e).display] }))
await p.screenshot({ path: `${OUT}/epc-m-cyc.png` })
console.log(JSON.stringify(r)); await b.close(); process.exit(0)
