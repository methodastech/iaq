/* 22 Sep: the Contact district map on the machine's real GPU (ANGLE on Metal), because SwiftShader draws it at a frame every
   few seconds and says nothing about how it runs for a visitor. Reports frames per second through the fly-in, then shoots
   the settled street view, a zoom in and the district view. Usage: node tools/probe-hqmap-gpu-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/contact', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(4000)
const gpu = await p.evaluate(() => { const c = document.createElement('canvas').getContext('webgl'); const e = c && c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'no webgl' })
await p.evaluate(() => { const s = document.querySelector('#find-us'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 70) }); await wait(800)
const f0 = await p.evaluate(() => window.__hqmapQA().frames); await wait(4000); const q1 = await p.evaluate(() => window.__hqmapQA())
console.log('gpu', gpu, '| fps through the fly-in', ((q1.frames - f0) / 4).toFixed(1), '| intro', q1.intro, 'dist', q1.dist)
await wait(2500)
const q2 = await p.evaluate(() => window.__hqmapQA()); console.log('settled', JSON.stringify({ intro: q2.intro, dist: q2.dist, az: q2.az, el: q2.el, labels: q2.labels.map(l => l.t + ' o' + l.o) }))
const map = await p.$('#find-us'); await map.screenshot({ path: `${OUT}/gmap-street.png` })
await p.evaluate(() => document.querySelector('[data-hqm="in"]').click()); await wait(2500); await map.screenshot({ path: `${OUT}/gmap-in.png` })
await p.evaluate(() => { const o = document.querySelector('[data-hqm="out"]'); o.click(); o.click(); o.click(); o.click() }); await wait(3000); await map.screenshot({ path: `${OUT}/gmap-out.png` })
console.log('errs', JSON.stringify(errs))
await b.close()
