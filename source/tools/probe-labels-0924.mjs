import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
const band = await p.$('.sm-map-duo'); await band.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 3500))
await p.evaluate(async () => { const n = document.querySelectorAll('.sm-map .rx-n.n-w')[1]; n.click(); await new Promise(r => setTimeout(r, 300)); if (!n.classList.contains('me')) n.click() }); await new Promise(r => setTimeout(r, 2600))
console.log(JSON.stringify(await p.evaluate(() => { const v = document.querySelector('.fv .fab-view').getBoundingClientRect(); return [...document.querySelectorAll('.fv .fab-lab')].filter(e => e.style.opacity === '1').map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { t: e.textContent.trim(), op: cs.opacity, x: Math.round(r.left - v.left), y: Math.round(r.top - v.top), w: Math.round(r.width), inView: r.left >= v.left && r.right <= v.right && r.top >= v.top && r.bottom <= v.bottom, z: cs.zIndex, vis: cs.visibility, disp: cs.display } }) })))
await b.close()
