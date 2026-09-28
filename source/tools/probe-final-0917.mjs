import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
const h1 = await p.evaluate(() => document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim())
await p.goto('http://localhost:5177/services/process-critical-utilities', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800))
const y = await p.evaluate(() => document.querySelector('.un-cycle').getBoundingClientRect().top + scrollY - 40)
await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500))
const stripes = await p.evaluate(() => [...document.querySelectorAll('.un-cycle svg rect')].filter(r => r.getAttribute('fill') === '#EC2027' || /EC2027/i.test(r.getAttribute('fill') || '')).map(r => r.getAttribute('width') + 'x' + r.getAttribute('height')))
await p.screenshot({ path: `${OUT}/pcu-cycle.png`, captureBeyondViewport: false })
console.log(JSON.stringify({ h1, stripes, errs }))
await b.close()
