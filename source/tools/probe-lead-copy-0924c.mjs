import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
const h = await p.evaluateHandle(() => [...document.querySelectorAll('.nav-links a, .nav-links button')].find(e => e.textContent.trim() === 'Services'))
await h.asElement().hover(); await new Promise(r => setTimeout(r, 1600))
console.log(JSON.stringify(await p.evaluate(() => { const l = document.querySelector('.nav-mega.open .nm-lead'); const c = l.querySelector('.nm-lead-copy'); const bb = c.querySelector('b'); const cs = getComputedStyle(bb); const cc = getComputedStyle(c); return { bColor: cs.color, bOpacity: cs.opacity, copyOpacity: cc.opacity, copyAnim: cc.animationName + ' ' + cc.animationPlayState, copyTransform: cc.transform, leadOpacity: getComputedStyle(l).opacity, pitchColor: getComputedStyle(c.querySelector('.nm-pitch')).color, openColor: getComputedStyle(l.querySelector('.nm-open')).color } })))
await b.close()
