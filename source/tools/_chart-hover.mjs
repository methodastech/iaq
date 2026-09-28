import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(2500)
const t = await p.evaluate(() => document.querySelector('.sysm').getBoundingClientRect().top + scrollY)
await p.evaluate(y => scrollTo(0, y - 80), t); await wait(1500)
const read = async (sel) => { await p.hover(sel); await wait(400); return p.evaluate(() => ({ text: document.querySelector('.sysm-read').textContent.trim().slice(0, 140), litU: [...document.querySelectorAll('.sysm-u.lit b')].map(e => e.textContent.replace(/Unit \d/, '').trim()), litS: [...document.querySelectorAll('.sysm-st.lit span')].map(e => e.textContent), dimText: getComputedStyle(document.querySelector('.sysm-bar.dim i.core span') || document.body).color })) }
const out = {}
out.cellCore = await read('.sysm-bar i.core')
out.cellAsk = await read('.sysm-bar i.ask')
out.cellOff = await read('.sysm-bar i.off')
out.chip = await read('.sysm-w .sm-chip.w')
out.hookChip = await read('.sysm-w .sm-chip.s')
await p.mouse.move(5, 5); await wait(3200)
out.tourAfterLeave = await p.evaluate(() => document.querySelector('.sysm-read').textContent.trim().slice(0, 60))
console.log(JSON.stringify({ errs, out }, null, 1))
await b.close()
