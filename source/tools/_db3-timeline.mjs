import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2500)
const geo = () => p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) } })
let g = await geo(); let y = 0; while (y < g.top - 900) { y = Math.min(g.top - 900, y + 400); await p.mouse.wheel({ deltaY: 400 }); await wait(50) }
await wait(9000); g = await geo()
const state = () => p.evaluate(() => { const s = document.getElementById('build3d'); const i = s.querySelector('.db3-intro'); const d = s.querySelector('iframe').contentDocument; const m = /(\d+)\s*\/\s*\d+\s*placed/i.exec(d.body.innerText); return { y: Math.round(scrollY), top: Math.round(s.getBoundingClientRect().top), ghost: getComputedStyle(i).opacity, placed: m ? +m[1] : null } })
// arrive with the wheel, like a reader, then watch for six seconds without touching anything
const tl = []; tl.push(await state()); await p.screenshot({ path: `${out}/db3-intro-before.png`, captureBeyondViewport: false })
for (let i = 0; i < 3; i++) { await p.mouse.wheel({ deltaY: 300 }); await wait(150); tl.push(await state()) }
await p.screenshot({ path: `${out}/db3-intro-arrive.png`, captureBeyondViewport: false })
for (let i = 0; i < 16; i++) { tl.push(await state()); await wait(250) }
await p.screenshot({ path: `${out}/db3-intro-after.png`, captureBeyondViewport: false })
// then scroll on
for (let i = 0; i < 4; i++) { await p.mouse.wheel({ deltaY: 300 }); await wait(400) } await wait(2500)
tl.push(await state())
console.log(JSON.stringify(tl))
await b.close()
