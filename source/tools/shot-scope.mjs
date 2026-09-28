import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services/design', { waitUntil: 'networkidle0', timeout: 60000 })
const h = await p.evaluateHandle(() => [...document.querySelectorAll('h2')].find(e => /What IAQ carries/.test(e.textContent)).closest('section'))
await p.evaluate(e => e.scrollIntoView({ block: 'center' }), h); await new Promise(r => setTimeout(r, 3000))
await h.screenshot({ path: `${OUT}/design-scope.png` }); await b.close()
