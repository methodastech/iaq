import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('http://localhost:5177/services/energy-management?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => { const e = document.querySelector('.dcs3-stage'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 140) }); await new Promise(r => setTimeout(r, 6000))
await p.evaluate(() => document.querySelector('.dcs3-num[data-k="plant"]').click()); await new Promise(r => setTimeout(r, 3000))
const el = await p.$('.dcs3-stage'); await el.screenshot({ path: `${OUT}/plant-fixed.png` })
console.log(JSON.stringify({ errs })); await b.close(); process.exit(0)
