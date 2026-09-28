import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2500)
const geo = () => p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) } })
let g = await geo(); let y = 0; while (y < g.top - 900) { y = Math.min(g.top - 900, y + 400); await p.mouse.wheel({ deltaY: 400 }); await wait(50) }
await wait(9000); g = await geo()
const state = () => p.evaluate(() => { const s = document.getElementById('build3d'); const i = s.querySelector('.db3-intro'); const d = s.querySelector('iframe').contentDocument; const txt = d.body.innerText; const m = /(\d+)\s*\/\s*\d+\s*placed/i.exec(txt); return { intro: i.className, ghostVar: i.style.getPropertyValue('--ghost'), opacity: getComputedStyle(i).opacity, vis: getComputedStyle(i).visibility, placed: m ? +m[1] : null, imgOk: i.querySelector('img').naturalWidth > 0, box: (r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)])(i.getBoundingClientRect()) } })
await p.evaluate(v => scrollTo(0, v), g.top); await wait(2500)
const s0 = await state(); await p.screenshot({ path: `${out}/db3-intro-0.png`, captureBeyondViewport: false })
// a reader scrolls in with the wheel
for (let i = 0; i < 4; i++) { await p.mouse.wheel({ deltaY: 300 }); await wait(400) }
await wait(3000)
const s1 = await state(); await p.screenshot({ path: `${out}/db3-intro-1.png`, captureBeyondViewport: false })
// the zoom keys: spy on the app's buttons, press Meta+= and Meta+- and Meta+0
await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; window.__zoomHits = []; ['zoom-in', 'zoom-out', 'zoom-reset'].forEach(id => d.getElementById(id).addEventListener('click', () => window.__zoomHits.push(id))) })
await p.keyboard.down('Meta'); await p.keyboard.press('Equal'); await p.keyboard.press('Minus'); await p.keyboard.press('Digit0'); await p.keyboard.up('Meta'); await wait(400)
const hits = await p.evaluate(() => window.__zoomHits)
console.log(JSON.stringify({ errs, s0, s1, hits }))
await b.close()
