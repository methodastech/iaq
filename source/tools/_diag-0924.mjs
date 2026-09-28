import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1024, height: 800 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
console.log(JSON.stringify(await p.evaluate(() => {
  const chain = []; let e = document.querySelector('.sm-map-dark .fx-view')
  while (e && !e.classList.contains('sm-map-dark')) { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); chain.push([e.className.slice(0, 40), Math.round(r.width), Math.round(r.height), cs.display, cs.position, cs.maxWidth, cs.aspectRatio]); e = e.parentElement }
  const mk = document.querySelector('.cyc-mk'); const fills = mk ? [...new Set([...mk.querySelectorAll('[fill]')].map(x => x.getAttribute('fill')))] : null
  return { chain, fills, iso: document.querySelector('.rx-compact .rx-s .rx-iso')?.getBoundingClientRect().width }
})))
await b.close()
