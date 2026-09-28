import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], URL = process.argv[3] || '/services', TAG = process.argv[4] || 'sv'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 200000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
await p.goto('http://localhost:5177' + URL + '?launchview', { waitUntil: 'load' }); for (let i = 0; i < 40; i++) { const n = await p.evaluate(() => document.querySelectorAll('section').length); if (n > 3) break; await new Promise(r => setTimeout(r, 500)) } await new Promise(r => setTimeout(r, 2500))
const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 450) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 120)) }
await new Promise(r => setTimeout(r, 1200))
const secs = await p.evaluate(() => [...document.querySelectorAll('body section, body .pg-sec')].filter(s => !s.parentElement.closest('section')).map((s, i) => { s.dataset.probe = i; const r = s.getBoundingClientRect(); return { i, cls: s.className.slice(0, 60), id: s.id, h: Math.round(r.height), h2: (s.querySelector('h1,h2') || {}).textContent?.slice(0, 60) } }))
for (const s of secs) { if (s.h < 40) continue; await p.evaluate(i => { const e = document.querySelector(`[data-probe="${i}"]`); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 80) }, s.i); await new Promise(r => setTimeout(r, 1400)); const el = await p.$(`[data-probe="${s.i}"]`); await el.screenshot({ path: `${OUT}/${TAG}-${String(s.i).padStart(2, '0')}.png` }).catch(e => {}) }
console.log(JSON.stringify({ H, secs, errs }, null, 0))
await b.close(); process.exit(0)
