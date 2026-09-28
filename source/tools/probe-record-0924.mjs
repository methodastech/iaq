import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
const gr = await p.$('.glance.gr'); await gr.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 3500))
const m = await p.evaluate(() => { const g = document.querySelector('.glance.gr'), h = document.querySelector('.globe-host'), c = document.querySelector('#globeCv'); const r = g.getBoundingClientRect(), hr = h ? h.getBoundingClientRect() : null
  return { order: [...document.querySelectorAll('body section, body header')].filter(e => e.getBoundingClientRect().height > 200).map(e => e.id || e.className.split(' ')[0]), sectionH: Math.round(r.height), host: hr ? { w: Math.round(hr.width), h: Math.round(hr.height), right: Math.round(hr.right), top: Math.round(hr.top - r.top) } : null, canvas: c ? { w: c.width, h: c.height, cssW: Math.round(c.getBoundingClientRect().width) } : null, tags: document.querySelectorAll('.globe-tag').length, tagBg: getComputedStyle(document.querySelector('.globe-tag')).backgroundColor, overflow: getComputedStyle(g).overflow, h2: g.querySelector('h2')?.innerText, stats: g.querySelectorAll('.gstat').length } })
console.log(JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
await gr.screenshot({ path: OUT + '/record-now.png' })
await b.close()
