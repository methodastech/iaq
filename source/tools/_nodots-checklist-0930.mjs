import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 120))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
await p.goto('http://localhost:5177/checklist.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
const r = await p.evaluate(() => { const el = [...document.querySelectorAll('.item')].find(e => /no middle dots or bullets/.test(e.textContent)); return el ? { done: el.classList.contains('done'), text: el.innerText.replace(/\s+/g, ' ').slice(0, 220) } : null })
console.log(JSON.stringify(r), 'errors', errs)
const el = await p.evaluateHandle(() => [...document.querySelectorAll('.item')].find(e => /no middle dots or bullets/.test(e.textContent)))
if (el.asElement()) await el.asElement().screenshot({ path: process.argv[2] })
await b.close()
