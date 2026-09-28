import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.getElementById('scenes').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 2000))
const r = await p.evaluate(() => { const sc = document.getElementById('scenes'); const vms = [...sc.querySelectorAll('.vm')]; const anims = document.getAnimations().filter(a => sc.contains(a.effect?.target))
  return { vms: vms.length, live: vms.filter(v => v.classList.contains('is-live')).length, anims: anims.length, delays: vms.map(v => { const a = anims.find(x => v.contains(x.effect.target)); return a ? a.effect.getTiming().delay : null }), redStroke: getComputedStyle(sc.querySelector('.r')).stroke, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
console.log(JSON.stringify(r), 'errors', errs.length ? errs : 0)
const el = await p.$('#scenes'); await el.screenshot({ path: OUT + '/design-scenes.png' }); await b.close()
