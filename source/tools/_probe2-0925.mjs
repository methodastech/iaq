import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/services?noanim', { waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 5000))
console.log(JSON.stringify(await p.$$eval('.wk-head h3', els => els.map(h => { const s = h.querySelector('small'), c = getComputedStyle(s), ch = getComputedStyle(h); return { w: h.getBoundingClientRect().width, sw: s.getBoundingClientRect().width, mw: c.maxWidth, tw: c.textWrap, hmw: ch.maxWidth, htw: ch.textWrap, hw: ch.width } }))))
await b.close()
