import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
const w = await p.$('.sm-work'); await w.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1500))
const card = (await p.$$('.sm-wstack .sm-wc'))[1]; await card.hover(); await new Promise(r => setTimeout(r, 400))
console.log(JSON.stringify(await p.evaluate(() => ({ litPins: [...document.querySelectorAll('.fl .sc-pin.lit')].map(e => e.textContent).join(','), dimPins: document.querySelectorAll('.fl .sc-pin.dim').length, litCard: document.querySelector('.sm-wc.lit b, .sm-wc.lit .sm-chip')?.textContent, tip: document.querySelector('.fl .sc-tip')?.innerText }))))
await b.close()
