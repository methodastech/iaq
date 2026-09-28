import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const w of [1440, 1920, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177/?noanim', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise(r => setTimeout(r, 3000))
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const hero = document.querySelector('.hero'), inner = document.querySelector('.hero-inner'), bar = document.querySelector('.hero-mkts.hmk')
    const h = hero.getBoundingClientRect(), i = inner.getBoundingClientRect(), r = bar.getBoundingClientRect()
    const cs = getComputedStyle(inner)
    return { heroH: Math.round(h.height), innerDisplay: cs.display, innerFlow: cs.flexDirection, innerJustify: cs.justifyContent,
      barH: Math.round(r.height), gapBelowBar: Math.round(h.bottom - r.bottom), innerPadBottom: cs.paddingBottom }
  })))
  await p.close()
}
await b.close()
