import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
const band = await p.$('.sm-map'); await band.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 4000))
const r = await p.evaluate(async () => {
  const q = s => document.querySelector(s)
  const st = () => ({ nogl: q('.fv')?.dataset.nogl || null, fallback: !!q('.sm-map-stage .fx-view'), litKey: [...document.querySelectorAll('.fv-legend li.on b')].map(e => e.textContent).join(','), labels: [...document.querySelectorAll('.fv .fab-lab')].filter(e => getComputedStyle(e).opacity !== '0').map(e => e.textContent.trim()).slice(0, 8).join(' | '), me: q('.sm-map .rx-n.me')?.textContent.slice(0, 20) || null })
  const a = st()
  document.querySelectorAll('.sm-map .rx-n.n-u')[1].click(); await new Promise(r => setTimeout(r, 2500)); const c = st()
  document.querySelectorAll('.fv-legend li button')[3].click(); await new Promise(r => setTimeout(r, 2500)); const d = st()
  return { start: a, unit2: c, keyFire: d, canvasH: q('.fv canvas')?.getBoundingClientRect().height }
})
console.log(JSON.stringify(r), 'errors', errs.length, errs.slice(0, 3))
await p.evaluate(() => document.querySelectorAll('.sm-map .rx-n.n-u')[1].click()); await new Promise(r => setTimeout(r, 3000))
const el = await p.$('.sm-map-stage'); await el.screenshot({ path: OUT + '/fabdriven-unit2.png' })
await b.close()
