import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
const h = await p.evaluateHandle(() => [...document.querySelectorAll('.nav-links a, .nav-links button')].find(e => e.textContent.trim() === 'Services'))
await h.asElement().hover(); await new Promise(r => setTimeout(r, 900))
const row = await p.evaluateHandle(() => [...document.querySelectorAll('.nav-mega.open .nm-cols a')].find(e => /Construction/.test(e.textContent)))
await row.asElement().hover(); await new Promise(r => setTimeout(r, 900))
console.log(JSON.stringify(await p.evaluate(() => { const l = document.querySelector('.nav-mega.open .nm-lead'); return { peek: l.classList.contains('peek'), bgOn: l.querySelector('.nm-lead-bg.on')?.getAttribute('src'), title: l.querySelector('.nm-lead-copy b')?.textContent, open: l.querySelector('.nm-open')?.textContent } })))
await (await p.$('.nav-mega.open')).screenshot({ path: OUT + '/wing-Services-hover.png' })
await b.close()
