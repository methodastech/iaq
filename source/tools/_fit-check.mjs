import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error' && !/WebGL/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)) })
const out = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(3000)
const m = await p.evaluate(() => { const meas = sel => [...document.querySelectorAll(sel)].map(s => { const r = s.getBoundingClientRect(); const b = s.getBBox(); const vb = s.getAttribute('viewBox').split(' ').map(Number); const k = r.width / vb[2]; return { fit: s.dataset.fit || '-', drawn: Math.round(b.width * k) + 'x' + Math.round(b.height * k), box: Math.round(r.width) } }); return { cycle: meas('.cyc-mk svg'), chart: meas('.sysm-mk svg') } })
// hover the explorer's cards as a reader would, so any error in the reading panel or the 3D pins surfaces
for (const sel of ['.rx-u .rx-n:nth-child(2)', '.rx-w .rx-n.n-w-s', '.rx-y .rx-n:last-child', '.rx-y .rx-n:nth-last-child(2)', '.rx-w .rx-n:nth-child(1)']) { await p.hover(sel); await wait(500) }
// the cycle: shift into view, screenshot at rest, then with a hovered stage
const t = await p.evaluate(() => document.querySelector('.cyc-fit').getBoundingClientRect().top + scrollY)
await p.evaluate(y => { document.documentElement.style.marginTop = (-y + 40) + 'px' }, t); await wait(2500)
await p.screenshot({ path: `${out}/cycle-after.png`, clip: { x: 0, y: 0, width: 1440, height: 560 } })
await p.evaluate(() => { document.documentElement.style.marginTop = '' })
console.log(JSON.stringify({ errs, m }))
await b.close()
