import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
const out = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(2500)
const shot = async (sel, name, off = 24, h = 900) => { const t = await p.evaluate(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : null }, sel); if (t == null) { console.log('missing', sel); return } await p.evaluate(y => scrollTo(0, y), t - off); await wait(1400); await p.screenshot({ path: `${out}/${name}.png`, clip: { x: 0, y: 0, width: 1440, height: h } }) }
// 1. the band's foot
const band = await p.evaluate(() => { const s = document.querySelector('.sm-map-dark.sm-map-full'); const side = s.querySelector('.sm-map-side'); const left = s.querySelector('.sm-map-left'); const r = s.getBoundingClientRect(); const low = Math.max(side ? side.getBoundingClientRect().bottom : 0, left ? left.getBoundingClientRect().bottom : 0); return { padBottom: getComputedStyle(s).paddingBottom, airUnderLists: Math.round(r.bottom - low) } })
await p.evaluate(() => { const s = document.querySelector('.sm-map-dark.sm-map-full'); scrollTo(0, s.getBoundingClientRect().bottom + scrollY - 520) }); await wait(1400)
await p.screenshot({ path: `${out}/svc-band-foot.png`, clip: { x: 0, y: 0, width: 1440, height: 700 } })
// 2. the requests table with its marks
await shot('.sm-asks', 'svc-asks', 60, 760)
const asks = await p.evaluate(() => ({ rows: document.querySelectorAll('.sm-ask:not(.sm-ask-h)').length, unitMarks: document.querySelectorAll('.sm-chip.u .sm-ci svg').length, modelMarks: document.querySelectorAll('.sm-chip.m .sm-ci svg').length, stageMarks: document.querySelectorAll('.sm-chip.s .sm-cm svg').length, workMarks: document.querySelectorAll('.sm-chip.w .sm-ci svg').length, sysMarks: document.querySelectorAll('.sm-chip.y .sm-ci svg').length, rowH: [...document.querySelectorAll('.sm-ask:not(.sm-ask-h)')].map(e => Math.round(e.getBoundingClientRect().height)) }))
// 3. the chart with named cells
await shot('.sysm', 'svc-chart', 40, 820)
await wait(2000)
const chart = await p.evaluate(() => { const cells = [...document.querySelectorAll('.sysm-bar i')]; const clipped = cells.filter(c => c.scrollWidth > c.clientWidth + 1).length; return { cells: cells.length, named: cells.filter(c => c.textContent.trim()).length, clipped, sample: [...document.querySelectorAll('.sysm-bar')].map(b => [...b.querySelectorAll('i')].map(i => i.textContent.trim() || '·').join(' | ')), key: document.querySelector('.sysm-key').textContent.trim() } })
await p.screenshot({ path: `${out}/svc-chart-b.png`, clip: { x: 0, y: 0, width: 1440, height: 820 } })
console.log(JSON.stringify({ band, asks, chart }))
// phone: no page overflow, no cut cell text
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(2500)
const ph = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, chipsClipped: [...document.querySelectorAll('.sm-ask .sm-chip')].filter(c => c.scrollWidth > c.clientWidth + 1).length, cellsClipped: [...document.querySelectorAll('.sysm-bar i')].filter(c => c.scrollWidth > c.clientWidth + 1).length, bandPad: getComputedStyle(document.querySelector('.sm-map-dark.sm-map-full')).paddingBottom }))
console.log('phone', JSON.stringify(ph))
await b.close()
