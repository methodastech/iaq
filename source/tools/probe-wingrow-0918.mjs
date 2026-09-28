import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:5177/about', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 1000))
const state = () => page.evaluate(() => { const w = document.querySelector('.nav-mega.open'); if (!w) return 'no open wing'; return [...w.querySelectorAll('.nm-rows>a')].map(a => { const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { op: cs.opacity, bg: cs.backgroundColor, y: Math.round(r.top), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width), hit: top ? (top.className || top.tagName).toString().slice(0, 40) : null, em: a.querySelector('em')?.textContent, emColor: getComputedStyle(a.querySelector('em')).color } }) })
const h = await page.evaluateHandle(() => [...document.querySelectorAll('.nav-links a')].find(a => a.textContent.trim() === 'About'))
await h.asElement().hover(); await new Promise(r => setTimeout(r, 1700))
console.log('before', JSON.stringify(await state()))
await page.screenshot({ path: OUT + '/wing-about-full.png' })
console.log('after', JSON.stringify(await state()))
await browser.close()
