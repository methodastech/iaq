import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 60000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2500))
await p.evaluate(() => { const e = document.querySelector('.sitefoot .f-certs'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 300) }); await new Promise(r => setTimeout(r, 1500))
const r = await p.evaluate(() => [...document.querySelectorAll('.f-certs-row img')].map(i => [i.getAttribute('src'), i.complete && i.naturalWidth, Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)]))
const el = await p.$('.sitefoot .f-certs'); const bb = await el.boundingBox()
await p.screenshot({ path: `${OUT}/certs2.png`, clip: { x: bb.x, y: bb.y + (await p.evaluate(() => scrollY)) - 10, width: bb.width, height: bb.height + 30 } })
console.log(JSON.stringify(r)); await b.close(); process.exit(0)
