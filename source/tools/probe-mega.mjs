import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], W = +(process.argv[3] || 1440)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: W, height: 900 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await p.goto('http://localhost:5177/projects', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 2500))
const tab = async label => { const h = await p.$$('.nav-has > a'); for (const a of h) if ((await a.evaluate(e => e.textContent)) === label) return a }
for (const [label, rowSel] of [['Services', '.nm-units .nm-rows>a:nth-child(2)'], ['Markets', '.nm-mlist .nm-rows>a:nth-child(3)']]) {
  const a = await tab(label); await a.hover(); await new Promise(r => setTimeout(r, 1400))
  const mega = await a.evaluateHandle(e => e.parentElement.querySelector('.nav-mega'))
  const clip = await mega.evaluate(m => { const r = m.getBoundingClientRect(); return { x: r.left - 4, y: r.top - 70, width: r.width + 8, height: r.height + 76 } })
  await p.screenshot({ path: `${OUT}/mega-${label}-${W}.png`, clip, captureBeyondViewport: false })
  const row = await mega.asElement().$(rowSel); await row.hover(); await new Promise(r => setTimeout(r, 1000))
  await new Promise(r => setTimeout(r, 600)); await p.screenshot({ path: `${OUT}/mega-${label}-${W}-hover.png`, clip, captureBeyondViewport: false })
  const info = await mega.evaluate(m => { const r = m.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, clipped: [...m.querySelectorAll('.nm-rows em')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent), tall: [...m.querySelectorAll('.nm-rows em')].map(e => [e.textContent, Math.round(e.getBoundingClientRect().height)]) } })
  console.log(label, JSON.stringify(info))
  await p.mouse.move(5, 800); await new Promise(r => setTimeout(r, 600))
}
console.log('errors', JSON.stringify(errs))
await b.close()
