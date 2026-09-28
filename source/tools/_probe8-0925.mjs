import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2' })
console.log(JSON.stringify(await p.evaluate(() => { const e = document.querySelector('.ru2 .pho'); const c = getComputedStyle(e); return { cls: e.className, mask: c.webkitMaskImage.slice(0, 120), mask2: c.maskImage.slice(0, 120), top: c.top, bottom: c.bottom, h: e.getBoundingClientRect().height, bg: getComputedStyle(document.querySelector('.ru2')).backgroundImage.slice(0, 80) } })))
await b.close()
