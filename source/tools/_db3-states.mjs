import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2500)
const geo = () => p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), runway: getComputedStyle(s).getPropertyValue('--db3-runway') } })
let g = await geo()
// approach with wheel steps to the section top, so the app boots, then settle exactly on the top
let y = 0; while (y < g.top - 900) { y = Math.min(g.top - 900, y + 400); await p.mouse.wheel({ deltaY: 400 }); await wait(50) }
await wait(9000); g = await geo()
const shot = async (frac, name) => { await p.evaluate(v => scrollTo(0, v), Math.round(g.top + (g.h - 900) * frac)); await wait(4000); const st = await p.evaluate(() => { const s = document.getElementById('build3d'); const d = s.querySelector('iframe').contentDocument; return { secTop: Math.round(s.getBoundingClientRect().top), step: d.getElementById('stage-step') ? d.getElementById('stage-step').textContent.trim().slice(0, 40) : null, title: d.getElementById('stage-title') ? d.getElementById('stage-title').textContent.trim().slice(0, 40) : null, readout: d.getElementById('readout') ? d.getElementById('readout').textContent.trim().slice(0, 60) : null } }); await p.screenshot({ path: `${out}/${name}.png`, captureBeyondViewport: false }); return st }
const s0 = await shot(0, 'db3-0'); const s1 = await shot(0.04, 'db3-4'); const s2 = await shot(0.12, 'db3-12'); const s3 = await shot(0.98, 'db3-end')
console.log(JSON.stringify({ g, s0, s1, s2, s3 }))
await b.close()
