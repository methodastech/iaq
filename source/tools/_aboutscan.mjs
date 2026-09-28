import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1.2 })
await p.goto('http://localhost:5177/about?noanim', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2600))
const H = await p.evaluate(() => document.body.scrollHeight)
const heads = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map(h => ({ t: h.textContent.trim().slice(0, 60), y: Math.round(h.getBoundingClientRect().top + scrollY) })))
console.log('height', H); heads.forEach(h => console.log('  ', h.y, h.t))
const target = heads.find(h => /vision|mission/i.test(h.t)) || heads.find(h => /value/i.test(h.t))
if (target) { await p.evaluate(y => scrollTo(0, y - 140), target.y); await new Promise(r => setTimeout(r, 1400)); await p.screenshot({ path: SP + '/v-vm.png' }) }
const vals = heads.find(h => /value/i.test(h.t))
if (vals) { await p.evaluate(y => scrollTo(0, y - 120), vals.y); await new Promise(r => setTimeout(r, 1400)); await p.screenshot({ path: SP + '/v-values.png' }) }
await b.close()
