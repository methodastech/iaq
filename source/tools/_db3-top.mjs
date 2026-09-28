import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2500)
const geo = () => p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) } })
let g = await geo(); let y = 0; while (y < g.top - 900) { y = Math.min(g.top - 900, y + 400); await p.mouse.wheel({ deltaY: 400 }); await wait(50) }
await wait(9000); g = await geo()
const state = () => p.evaluate(() => { const s = document.getElementById('build3d'); const i = s.querySelector('.db3-intro'); const d = s.querySelector('iframe').contentDocument; const m = /(\d+)\s*\/\s*\d+\s*placed/i.exec(d.body.innerText); return { y: Math.round(scrollY), top: Math.round(s.getBoundingClientRect().top), ghost: getComputedStyle(i).opacity, cls: i.className, placed: m ? +m[1] : null } })
/* the blank case: the section pinned at its very top, nothing placed yet (the state Bazil's screenshot showed) */
await p.evaluate(v => scrollTo(0, v), g.top); await wait(3500)
const atTop = await state(); await p.screenshot({ path: `${out}/db3-intro-top.png`, captureBeyondViewport: false })
/* then the reader scrolls: the first parts land and the ghost dissolves */
for (let i = 0; i < 3; i++) { await p.mouse.wheel({ deltaY: 250 }); await wait(300) } await wait(2500)
const after = await state(); await p.screenshot({ path: `${out}/db3-intro-after.png`, captureBeyondViewport: false })
console.log(JSON.stringify({ atTop, after }))
await b.close()
