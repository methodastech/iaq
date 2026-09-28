import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
const res = {}
const shot = async (u, name, sel, y = 0) => {
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2200))
  if (y) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500)) }
  res[name] = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'missing ' + sel; const img = e.tagName === 'IMG' ? e : e.querySelector('img'); const r = (img || e).getBoundingClientRect(); return { src: img && img.getAttribute('src'), ok: img ? img.complete && img.naturalWidth > 0 : null, box: [Math.round(r.width), Math.round(r.height)], rep: !!e.closest('section, header, figure, .un-hero')?.querySelector('.un-rep, .pg-rep, [class*="rep"]') } }, sel)
  await p.screenshot({ path: `${OUT}/ph-${name}.png`, captureBeyondViewport: false })
}
await shot('/services/epc-construction', 'epc', '.un-hero-fig')
await shot('/services/tool-installation', 'hookup', '.un-hero-fig')
await shot('/services/construction', 'construct', '.pg-head-fig')
await shot('/services/commissioning', 'commission', '.pg-head-fig')
await shot('/services/design', 'design', '.pg-head-fig')
await shot('/markets/semiconductor', 'semi', 'header img, .mp-hero img, main img')
await shot('/services', 'hub', '.un-card img, .un-cards img', 700)
await p.goto('http://localhost:5177/projects', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
const tab = (await p.$$('.nav-has > a'))[2]; await tab.hover(); await new Promise(r => setTimeout(r, 1400))
res.menuTile = await p.evaluate(() => { const i = document.querySelector('.nm-mlist .nm-rows>a:first-child img'); return i && [i.getAttribute('src'), i.complete && i.naturalWidth > 0] })
await p.screenshot({ path: `${OUT}/ph-menu.png`, captureBeyondViewport: false })
res.tags = await p.evaluate(() => 0)
await p.goto('http://localhost:5177/services/tool-installation', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
res.hookupTags = await p.evaluate(() => [...document.querySelectorAll('.un-rep')].map(e => e.className))
await p.goto('http://localhost:5177/services/epc-construction', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
res.epcTags = await p.evaluate(() => [...document.querySelectorAll('.un-rep')].map(e => e.className))
console.log(JSON.stringify({ res, errs }, null, 1))
await b.close()
