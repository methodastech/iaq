import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.cyc-band').scrollIntoView()); await new Promise(r => setTimeout(r, 4000))
console.log(JSON.stringify(await p.evaluate(() => {
  const n = document.querySelectorAll('.cyc-node')[3]; const bEl = n.querySelector('.cyc-txt b')
  const rg = document.createRange(); rg.selectNodeContents(bEl); const r = rg.getBoundingClientRect()
  const pts = [[r.right - 3, r.top + r.height / 2], [r.right - 8, r.top + r.height / 2], [r.right - 3, r.top + 4], [r.right + 2, r.top + r.height / 2]]
  return pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); const cs = e && getComputedStyle(e); return { x: Math.round(x), y: Math.round(y), el: e && (e.tagName + '.' + e.className.toString().slice(0, 30)), bg: cs && cs.backgroundColor, rect: e && [Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().width)] } })
}), null, 0)); await b.close()
