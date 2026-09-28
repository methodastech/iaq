// each nav wing open, captured at 1440
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
const items = await p.evaluate(() => [...document.querySelectorAll('.nav-links > li, .nav-links > div, .nav-links > a, .nav-links > button')].map(e => e.textContent.trim().slice(0, 12)))
console.log('nav items', JSON.stringify(items))
for (const name of ['About', 'Services', 'Markets', 'Careers']) {
  const h = await p.evaluateHandle(n => [...document.querySelectorAll('.nav-links a, .nav-links button')].find(e => e.textContent.trim() === n), name)
  const el = h.asElement(); if (!el) { console.log('no', name); continue }
  await el.hover(); await new Promise(r => setTimeout(r, 900))
  const mega = await p.$('.nav-mega.open'); if (!mega) { console.log('no open wing for', name); continue }
  const m = await p.evaluate(() => { const l = document.querySelector('.nav-mega.open .nm-lead'); const r = l.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), eyeb: l.querySelector('.nm-eyeb')?.textContent, open: l.querySelector('.nm-open')?.textContent, bg: l.querySelector('.nm-lead-bg.on')?.getAttribute('src') } })
  console.log(name, JSON.stringify(m))
  await mega.screenshot({ path: `${OUT}/wing-${name}.png` })
  await p.mouse.move(700, 600); await new Promise(r => setTimeout(r, 500))
}
await b.close()
