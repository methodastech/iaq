import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const w of [1280, 1000, 900, 820, 768, 600, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1800))
  const m = await p.evaluate(() => { const row = document.querySelector('.hmk-row'); if (!row) return null; const r = row.getBoundingClientRect(); const items = [...row.querySelectorAll('li')].map(li => li.getBoundingClientRect()); const cs = getComputedStyle(row)
    return { cls: row.className, cols: cs.gridTemplateColumns.split(' ').length, rowW: Math.round(r.width), rowRight: Math.round(r.right - innerWidth), itemsPast: items.filter(i => i.right > innerWidth + 1).length, itemsClippedLeft: items.filter(i => i.left < 0).length, mk: Math.round(items[0].width), line: !!document.querySelector('.hmk-line'), onGl: document.querySelector('.hmk').className.includes('on3d'), pageOver: document.documentElement.scrollWidth - innerWidth } })
  console.log(w, JSON.stringify(m))
  if (w === 900 || w === 768) { const h = await p.$('.hero'); await h.screenshot({ path: `${OUT}/hero-${w}.png` }) }
  await p.close()
}
await b.close()
