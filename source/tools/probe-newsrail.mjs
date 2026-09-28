import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], W = +(process.argv[3] || 1440)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: 900, isMobile: W < 700, hasTouch: W < 700 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', e => errs.push(String(e)))
await p.goto('http://localhost:5177/news', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
const y = await p.evaluate(() => document.querySelector('.nf-feat').getBoundingClientRect().top + scrollY - 60)
await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1200))
const tx = () => p.evaluate(() => Math.round(new DOMMatrix(getComputedStyle(document.querySelector('.nf-marq-track')).transform).m41))
const info = await p.evaluate(() => { const r = document.querySelector('.nf-marq').getBoundingClientRect(); const c = document.querySelector('.nf-mc').getBoundingClientRect(); const vis = [...document.querySelectorAll('.nf-mc')].filter(e => { const q = e.getBoundingClientRect(); return q.right > r.left + 30 && q.left < r.right - 30 }).length; return { rail: [Math.round(r.left), Math.round(r.width), Math.round(r.top)], tile: [Math.round(c.width), Math.round(c.height)], visible: vis } })
const out = { info }
const t0 = await tx(); await new Promise(r => setTimeout(r, 2000)); const t1 = await tx()
out.drift2s = t1 - t0
await p.screenshot({ path: `${OUT}/rail-${W}.png`, captureBeyondViewport: false })
if (W >= 700) {
  const ry = info.rail[2] + 200
  await p.mouse.move(W * 0.5, ry); await new Promise(r => setTimeout(r, 1500))
  const h0 = await tx(); await new Promise(r => setTimeout(r, 1000)); const h1 = await tx(); out.hoverStill1s = h1 - h0
  await p.screenshot({ path: `${OUT}/rail-${W}-hover.png`, captureBeyondViewport: false })
  await p.mouse.move(W * 0.5, 880); await new Promise(r => setTimeout(r, 1500))
  const d0 = await tx(); await p.mouse.move(W * 0.7, ry); await p.mouse.down()
  for (let k = 1; k <= 10; k++) { await p.mouse.move(W * 0.7 - k * 30, ry); await new Promise(r => setTimeout(r, 16)) }
  await p.mouse.up(); await p.mouse.move(W * 0.5, 880)
  const d1 = await tx(); await new Promise(r => setTimeout(r, 400)); const d2 = await tx(); out.dragMoved = d1 - d0; out.after400 = d2 - d1
  const url = await p.evaluate(() => location.pathname); out.stillOnNews = url
}
await new Promise(r => setTimeout(r, 2500))
const s0 = await tx(); await p.evaluate(() => window.scrollBy(0, 120)); await new Promise(r => setTimeout(r, 300)); const s1 = await tx(); out.scrollBoost300ms = s1 - s0
console.log(JSON.stringify({ ...out, errs }))
await b.close()
