import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 150000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)))
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 7000))
await p.evaluate(() => { const e = document.getElementById('globeHost'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150) }); await new Promise(r => setTimeout(r, 1500))
const host = await p.$('#globeHost')
await new Promise(r => setTimeout(r, 15000)); for (let i = 0; i < 12; i++) { await host.screenshot({ path: `${OUT}/gw-${i}.png` }); await new Promise(r => setTimeout(r, 1000)) }
console.log(JSON.stringify({ errs })); await b.close(); process.exit(0)
