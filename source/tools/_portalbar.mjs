import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/portal/newsroom', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 2200))
if (await p.$('input')) { await p.type('input', 'iaqsolution321'); await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 2600)) }
const read = () => p.evaluate(() => ({
  groups: [...document.querySelectorAll('.pt-g')].map(g => g.textContent.trim() + (g.classList.contains('open') ? '*' : '') + (g.classList.contains('here') ? '#' : '')),
  panel: [...document.querySelectorAll('.pt-p')].map(a => a.textContent.trim() + (a.classList.contains('on') ? '*' : '')),
  barH: Math.round(document.querySelector('.pt-bar-in').getBoundingClientRect().height),
  sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
}))
console.log('ON /portal/newsroom', JSON.stringify(await read()))
await p.screenshot({ path: SP + '/portal-bar-1.png', clip: { x: 0, y: 0, width: 1440, height: 300 } })
await p.evaluate(() => [...document.querySelectorAll('.pt-g')].find(g => /exhibition/i.test(g.textContent)).click())
await new Promise(r => setTimeout(r, 600))
console.log('AFTER clicking Exhibition', JSON.stringify(await read()))
await p.screenshot({ path: SP + '/portal-bar-2.png', clip: { x: 0, y: 0, width: 1440, height: 300 } })
console.log('errs', errs.length, errs.slice(0, 3))
await b.close()
