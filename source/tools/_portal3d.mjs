import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.4 })
await p.goto('http://localhost:5177/portal/models', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 1800))
if (await p.$('input')) { await p.type('input', 'iaqsolution321'); await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 2500)) }
const o = await p.evaluate(() => ({
  tabs: [...document.querySelectorAll('.pt-tabs a')].map(a => a.textContent.trim()),
  h1: (document.querySelector('h1')?.textContent || '').slice(0, 50),
  rows: document.querySelectorAll('.cms-set').length,
  slots: document.querySelectorAll('.pg-slot').length,
  sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
}))
console.log(JSON.stringify(o, null, 1), 'errs', errs.length, errs.slice(0, 2))
await p.evaluate(() => { const els = document.querySelectorAll('.pt-md'); els[2] && els[2].scrollIntoView({ block: 'start' }) })
await new Promise(r => setTimeout(r, 600))
await p.screenshot({ path: SP + '/v-portal3d-owed.png', fullPage: false })
await b.close()
