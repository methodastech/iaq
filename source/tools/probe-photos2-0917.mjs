import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const q = async (u, sel) => { await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800)); return p.evaluate(sel => { const i = document.querySelector(sel); if (!i) return 'missing'; const r = i.getBoundingClientRect(); return [i.getAttribute('src'), i.complete && i.naturalWidth > 0, Math.round(r.width) + 'x' + Math.round(r.height), Math.round(r.top)] }, sel) }
const out = {}
out.construct = await q('/services/construction', 'img[src*="cr-build"]')
out.commission = await q('/services/commissioning', 'img[src*="cr-ballroom-8575"]')
out.design = await q('/services/design', 'img[src*="bim-archi"]')
out.semi = await q('/markets/semiconductor', 'img[src*="mkt-semiconductor"]')
out.hubCard = await q('/services', 'img[src*="cr-utilities"]')
out.pcuBand = await q('/services/process-critical-utilities', 'img[src*="mkt-semiconductor"]')
await p.goto('http://localhost:5177/projects', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
for (const a of await p.$$('.nav-has > a')) { if ((await a.evaluate(e => e.textContent)) === 'Markets') { await a.hover(); break } }
await new Promise(r => setTimeout(r, 1500))
out.menuTile = await p.evaluate(() => { const i = document.querySelector('img[src*="mkt-semiconductor-t"]'); return i ? [i.getAttribute('src'), i.complete && i.naturalWidth > 0] : 'missing' })
console.log(JSON.stringify(out))
await b.close()
