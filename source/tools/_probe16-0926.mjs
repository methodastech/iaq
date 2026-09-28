import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 390)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: W, height: 844, isMobile: W < 500, hasTouch: W < 500 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2', timeout: 90000 })
const r = await p.evaluate(() => {
  const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return { w: Math.round(r.width), ws: c.whiteSpace, ox: c.overflowX, disp: c.display, parent: e.parentElement.className, pw: Math.round(e.parentElement.getBoundingClientRect().width), pox: getComputedStyle(e.parentElement).overflowX } }
  return { body: Math.round(document.body.getBoundingClientRect().width), wrap: Math.round(document.querySelector('body>.wrap').getBoundingClientRect().width), src: q('.dv-src'), tbl: q('.dv-tbl'), cta: q('#inuse .iu-cta'), bar: Math.round(document.querySelector('.bmws').scrollWidth), barW: Math.round(document.querySelector('.bmws').getBoundingClientRect().width) }
})
console.log(JSON.stringify(r)); await b.close()
