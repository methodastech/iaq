import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], TAG = process.argv[3] || 'dcs'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warn') errs.push(m.type() + ' ' + m.text().slice(0, 160)) })
await p.goto('http://localhost:5177/services/energy-management?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2500))
await p.evaluate(() => { const e = document.querySelector('.dcs3-stage'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 140) }); await new Promise(r => setTimeout(r, 6000))
const t = await p.evaluate(async () => { const c = document.querySelector('.dcs3-stage canvas'); let n = 0; const t0 = performance.now(); await new Promise(r => { const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r() }; requestAnimationFrame(f) }); return { fps: Math.round(n / 2), w: c.width, h: c.height } })
const el = await p.$('.dcs3-stage'); await el.screenshot({ path: `${OUT}/${TAG}.png` })
console.log(JSON.stringify({ t, errs: [...new Set(errs)].slice(0, 6) }))
await b.close(); process.exit(0)
