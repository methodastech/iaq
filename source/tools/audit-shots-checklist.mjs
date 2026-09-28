import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1400, height: 900 })
await p.goto(BASE + '/checklist.html', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 800))
const info = await p.evaluate(() => { const boxes = [...document.querySelectorAll('input.cbx')]; const secs = [...document.querySelectorAll('.section')].map(s => ({ id: s.dataset.sec, closed: s.classList.contains('closed'), n: s.querySelectorAll('input.cbx').length, done: s.querySelectorAll('input.cbx:checked').length })); return { total: boxes.length, done: boxes.filter(b => b.checked).length, secs, headText: document.querySelector('header, .top, .hero')?.innerText.replace(/\n/g, ' · ').slice(0, 200) } })
console.log(JSON.stringify(info))
await p.screenshot({ path: `${OUT}/30-checklist-top.png` })
const clip = async (id, name, maxH = 1400) => { const box = await p.evaluate(id => { const s = document.querySelector(`.section[data-sec="${id}"]`); if (!s) return null; s.classList.remove('closed'); const r = s.getBoundingClientRect(); return { top: r.top + window.scrollY - 10, h: r.height + 20 } }, id); if (!box) { console.log('MISSING', id); return } await new Promise(r => setTimeout(r, 200)); const box2 = await p.evaluate(id => { const r = document.querySelector(`.section[data-sec="${id}"]`).getBoundingClientRect(); return { top: r.top + window.scrollY - 10, h: r.height + 20 } }, id); await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: box2.top, width: 1400, height: Math.min(maxH, box2.h) }, captureBeyondViewport: true }); console.log('clip', name, Math.round(box2.h)) }
await clip('qa-done', '31-checklist-qa-done', 2200); await clip('qa-part', '32-checklist-qa-part'); await clip('qa-blocked', '33-checklist-qa-blocked', 1600)
await clip('mtg-facts', '34-checklist-mtg-facts'); await clip('mtg-home-svc', '35-checklist-mtg-home-svc'); await clip('mtg-pages', '36-checklist-mtg-pages')
await b.close()
