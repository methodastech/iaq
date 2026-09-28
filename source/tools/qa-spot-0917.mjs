/* 17 Sep: the spot check over every page today's work touched, run after the last edit.
   Usage: node tools/qa-spot-0917.mjs */
import puppeteer from 'puppeteer-core'
const ROUTES = ['/', '/about', '/about/history', '/services', '/services/epc-construction', '/services/tool-installation',
  '/services/process-critical-utilities', '/services/energy-management', '/news', '/careers', '/careers/role/iaq-eng-01', '/checklist.html']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
let bad = 0
for (const r of ROUTES) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 90)))
  p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 90)) })
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5177' + r, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise(x => setTimeout(x, 3000))
  const m = await p.evaluate(() => ({
    h1: (document.querySelector('h1, .sec-title') || {}).textContent?.trim().slice(0, 34) || '(none)',
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    imgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
  }))
  if (errs.length || m.overflow || m.imgs) bad++
  console.log(r.padEnd(40), 'err', String(errs.length).padStart(2), '· overflow', String(m.overflow).padStart(3), '· broken img', m.imgs, '·', m.h1, errs[0] || '')
  await p.close()
}
console.log(bad ? 'ROUTES WITH A PROBLEM: ' + bad : 'all clean')
await b.close()
