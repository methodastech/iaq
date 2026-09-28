import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const w of [1440, 1920, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177/?noanim', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise(r => setTimeout(r, 3000))
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const band = document.querySelector('.hmk'); const mk = document.querySelector('.hmk-mk')
    const nm = document.querySelector('.hmk-nm'); const a = document.querySelector('.hmk-iso a')
    const hero = document.querySelector('.hero')
    const li = [...document.querySelectorAll('.hmk-iso li')]
    const twoLine = li.filter(l => { const n = l.querySelector('.hmk-nm'); return n.getBoundingClientRect().height / parseFloat(getComputedStyle(n).lineHeight) > 1.4 }).length
    return { band: Math.round(band.getBoundingClientRect().height), mark: Math.round(mk.getBoundingClientRect().width), name: getComputedStyle(nm).fontSize, tile: Math.round(a.getBoundingClientRect().height), hero: Math.round(hero.getBoundingClientRect().height), twoLine }
  })))
  await p.close()
}
await b.close()
