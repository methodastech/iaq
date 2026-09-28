import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1440, 1580, 1280]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 1000 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 1200))
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) } }
    const c = document.querySelector('.sc-ring-c'), bEl = c.querySelector('b'), ring = document.querySelector('.sc-ring'), copy = document.querySelector('.sc-copy'), cover = document.querySelector('.sc-cover')
    const sts = [...document.querySelectorAll('.sc-st')].map(R)
    const cr = R(c); const hits = sts.map((s, i) => (s.l < cr.r && s.r > cr.l && s.t < cr.b && s.b > cr.t) ? i + 1 : null).filter(Boolean)
    return { centre: cr, b: R(bEl), bFont: getComputedStyle(bEl).fontSize, bWs: getComputedStyle(bEl).whiteSpace, ring: R(ring), copy: R(copy), cover: R(cover), st3: sts[2], hits, zoom: getComputedStyle(document.documentElement).zoom }
  })))
  await p.close()
}
await b.close()
