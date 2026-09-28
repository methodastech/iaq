import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const t0 = Date.now()
await p.goto('http://localhost:52158/', { waitUntil: 'domcontentloaded', timeout: 120000 })
/* loading: time from the frame's creation to the loader clearing */
const loadT = await p.evaluate(() => new Promise(res => { const t = performance.now(); const iv = setInterval(() => { const s = document.getElementById('build3d'); const l = s && s.querySelector('.db3-load'); if (l && l.classList.contains('is-done')) { clearInterval(iv); res(Math.round(performance.now() - t)) } }, 100); setTimeout(() => { clearInterval(iv); res(-1) }, 60000) }))
const geo = () => p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) } })
let g = await geo(); await p.evaluate(v => scrollTo(0, v), g.top - 700); await wait(1500); g = await geo(); await p.evaluate(v => scrollTo(0, v), g.top); await wait(2000)
const read = () => p.evaluate(() => { const s = document.getElementById('build3d'); const d = s.querySelector('iframe').contentDocument; const on = d.querySelector('#hud2 .h-rail li.on'); const idx = on ? [...d.querySelectorAll('#hud2 .h-rail li')].indexOf(on) + 1 : 0; const m = /(\d+)\s*\/\s*\d+\s*placed/i.exec(d.body.innerText); const ic = d.querySelector('#hud2 .h-rail .rd-ic'); return { chapter: idx, placed: m ? +m[1] : null, secTop: Math.round(s.getBoundingClientRect().top), icon: ic ? Math.round(ic.getBoundingClientRect().width) + '/' + Math.round(ic.querySelector('svg').getBoundingClientRect().width) : null, ghost: getComputedStyle(s.querySelector('.db3-intro')).opacity } })
const start = await read()
/* the icons and the V2 ghost at the top */
await p.evaluate(() => document.querySelector('#build3d iframe').contentDocument.getElementById('skin-v3').click()); await wait(2500)
await p.screenshot({ path: `${out}/db3-v2-top.png`, captureBeyondViewport: false })
await p.evaluate(() => document.querySelector('#build3d iframe').contentDocument.getElementById('skin-v1').click()); await wait(1200)
/* continuous forward wheel for six seconds, over the frame */
const fx = 900, fy = 500; await p.mouse.move(fx, fy)
const tl = []; let tw = Date.now()
while (Date.now() - tw < 6000) { await p.mouse.wheel({ deltaY: 120 }); await wait(45); if ((Date.now() - tw) % 1000 < 60) tl.push({ t: Math.round((Date.now() - tw) / 100) / 10, ...(await read()) }) }
await wait(1500); const fwd = await read(); tl.push({ t: 'end', ...fwd })
/* continuous back wheel for six seconds */
tw = Date.now(); const bl = []
while (Date.now() - tw < 6000) { await p.mouse.wheel({ deltaY: -120 }); await wait(45); if ((Date.now() - tw) % 1000 < 60) bl.push({ t: Math.round((Date.now() - tw) / 100) / 10, ...(await read()) }) }
await wait(1500); const back = await read(); bl.push({ t: 'end', ...back })
/* a few more back pushes: the page should leave the section */
for (let i = 0; i < 12; i++) { await p.mouse.wheel({ deltaY: -160 }); await wait(120) } await wait(800)
const left = await p.evaluate(() => ({ secTop: Math.round(document.getElementById('build3d').getBoundingClientRect().top), y: Math.round(scrollY) }))
console.log(JSON.stringify({ errs, loadT, start, forward: tl, back: bl, left }))
await b.close()
