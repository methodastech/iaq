// Capture the Design tab "Loading screen" sub-section at desktop and phone width, with the three live frames running.
import puppeteer from 'puppeteer-core'
const out = process.argv[2]
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob, deviceScaleFactor: mob ? 2 : 1 })
  const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.goto('http://localhost:57375/design.html#mo-loader', { waitUntil: 'networkidle2', timeout: 60000 })
  await p.evaluate(() => document.getElementById('mo-loader').scrollIntoView({ block: 'start' }))
  await sleep(4000)
  const info = await p.evaluate(() => {
    const s = document.getElementById('mo-loader'); const r = s.getBoundingClientRect()
    const fr = [...s.querySelectorAll('iframe')].map(f => { const d = f.contentDocument; const lg = d && d.getElementById('logo'); return { w: Math.round(f.getBoundingClientRect().width), h: Math.round(f.getBoundingClientRect().height), canvas: !!(d && d.querySelector('canvas')), fill: lg ? getComputedStyle(lg).getPropertyValue('--fill').trim() : null } })
    return { top: Math.round(r.top), h: Math.round(r.height), docW: document.documentElement.scrollWidth, frames: fr, side: !!document.querySelector('a[href="#mo-loader"]') }
  })
  console.log(w, JSON.stringify(info), 'errors', JSON.stringify(errs.slice(0, 4)))
  await p.screenshot({ path: `${out}/ld-${w}-a.png` })
  if (mob) { for (let i = 1; i <= 2; i++) { await p.evaluate(() => window.scrollBy(0, 700)); await sleep(2500); await p.screenshot({ path: `${out}/ld-${w}-${'bc'[i - 1]}.png` }) } }
  else { await p.evaluate(() => window.scrollBy(0, 360)); await sleep(1500); await p.screenshot({ path: `${out}/ld-${w}-b.png` }) }
  await p.close()
}
await b.close()
