import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } scrollTo(0, 0) }); await new Promise(r => setTimeout(r, 800))
const secs = await p.evaluate(() => [...document.querySelectorAll('main section, main header, body > div > section, .pg-sec, section')].filter((e, i, a) => !a.some(o => o !== e && o.contains(e))).map(e => { const r = e.getBoundingClientRect(); const h = e.querySelector('h1, h2, h3'); return { id: e.id || e.className.split(' ').slice(0, 2).join('.'), top: Math.round(r.top + scrollY), h: Math.round(r.height), head: h ? h.innerText.replace(/\n/g, ' ').slice(0, 90) : '', words: e.innerText.split(/\s+/).length } }))
console.log(JSON.stringify(secs, null, 0)); console.log('total', await p.evaluate(() => document.body.scrollHeight), 'errors', errs.length)
await p.screenshot({ path: OUT + '/services-full.png', fullPage: true })
await b.close()
