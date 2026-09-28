import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => document.querySelectorAll('.cu-rv,[data-reveal],.cr-why-c').forEach(e => { e.classList.add('in'); e.classList.add('cu-in'); e.classList.add('is-in') })); await new Promise(r => setTimeout(r, 800))
  const r = await p.evaluate(() => { const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]; return {
    whyMarks: qa('.cr-why-mk').length, whyMarkW: Math.round(q('.cr-why-mk')?.getBoundingClientRect().width || 0), whyTile: qa('.cr-why-ic').filter(e => getComputedStyle(e).display !== 'none').length,
    growMk: !!q('.cu-h2-mk .cu-hmk'), growH2Lines: (() => { const em = q('.cu-h2-mk em'); const rg = document.createRange(); rg.selectNodeContents(em); return new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size })(),
    quoteBg: getComputedStyle(q('.cu-sf-q')).backgroundColor, quoteSize: getComputedStyle(q('.cu-sf-q')).fontSize, quoteAlign: getComputedStyle(q('.cu-sf-q')).textAlign,
    badgeBg: getComputedStyle(q('.cu-sf-vis.is-badge')).backgroundColor, badgeImg: getComputedStyle(q('.cu-sf-vis.is-badge')).backgroundImage,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  for (const [sel, name] of [['.cr-why', 'why'], ['.cu-sf-q', 'quote'], ['.cu-grow .cu-head', 'growhead'], ['.cu-sf-tiles', 'tiles']]) { const el = await p.$(sel); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 500)); await el.screenshot({ path: `${OUT}/${tag}-${name}.png` }) } }
  await p.close()
}
await b.close()
