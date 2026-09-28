import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
const band = await p.$('.sm-map-duo'); await band.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 3500))
await p.evaluate(async () => { const u = document.querySelectorAll('.sm-map .rx-n.n-u'); u[2].click(); await new Promise(r => setTimeout(r, 300)); if (!u[2].classList.contains('me')) u[2].click() }); await new Promise(r => setTimeout(r, 2500))
const m = await p.evaluate(() => { const st = document.querySelector('.sm-map-stage').getBoundingClientRect(), mp = document.querySelector('.rx-compact').getBoundingClientRect()
  const cards = [...document.querySelectorAll('.rx-compact .rx-n')].map(n => n.getBoundingClientRect()); let off = 0
  document.querySelectorAll('.rx-compact .rx-e circle').forEach(ci => { const q = ci.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2; if (!cards.some(k => (Math.abs(x - k.left) < 3 || Math.abs(x - k.right) < 3) && y >= k.top - 1 && y <= k.bottom + 1)) off++ })
  return { stageW: Math.round(st.width), stageH: Math.round(st.height), mapW: Math.round(mp.width), mapH: Math.round(mp.height), sideBySide: st.right <= mp.left + 2, bothInView: st.top >= 0 && st.bottom <= innerHeight, edges: document.querySelectorAll('.rx-compact .rx-e').length, offEdge: off, gl: !document.querySelector('.sm-map-stage .fx-view'), lit: [...document.querySelectorAll('.fv-legend li.on b')].map(e => e.textContent).join(','), overflow: document.documentElement.scrollWidth - innerWidth } })
console.log(JSON.stringify(m), 'errors', errs.length)
await p.screenshot({ path: OUT + '/duo-1440.png' })
await b.close()
