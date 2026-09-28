/* 21 Sep: the home page's numbers and the world. Shoots the section at 1440 and 390, picks an office and
   checks the globe turned to it, and checks the hero market row. Usage: node tools/probe-record-0921.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage()
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 140)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: m, hasTouch: m })
  await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await new Promise(r => setTimeout(r, 7000))
  await p.screenshot({ path: `${OUT}/hero-${w}.png` })
  await p.evaluate(() => { const s = document.querySelector('#story'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 10) })
  await new Promise(r => setTimeout(r, 4500))
  const before = await p.evaluate(() => window.__globeQA())
  await p.evaluate(() => document.querySelectorAll('.globe-tag')[2].click())     /* Germany, picked on the globe itself */
  await new Promise(r => setTimeout(r, 4000))
  const after = await p.evaluate(() => ({ qa: window.__globeQA(), office: document.querySelector('.gr-o-txt b').textContent, place: document.querySelector('.gr-o-txt span').textContent, picksRow: document.querySelectorAll('.gr-picks').length,
    selTag: (document.querySelector('.globe-tag.sel') || {}).textContent, nums: [...document.querySelectorAll('.gstat .num')].map(n => n.textContent),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }))
  const el = await p.$('#story')
  await el.screenshot({ path: `${OUT}/record-${w}.png` })
  console.log(w, JSON.stringify({ before, after, errs }))
  await p.close()
}
await b.close()
