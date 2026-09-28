/* the unit showcase: selector, stage swap on click and on the timer, photo, and a capture with motion on */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  const top = await p.evaluate(() => Math.round(document.querySelector('.sm-units').getBoundingClientRect().top + scrollY))
  await p.evaluate(() => document.querySelector('.sm-units').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2200))
  const r0 = await p.evaluate(() => ({ sel: document.querySelectorAll('.sm-sel-b').length, on: document.querySelector('.sm-sel-b.on b')?.textContent, stage: document.querySelector('.sm-stage-body h3')?.firstChild?.nextSibling?.textContent || document.querySelector('.sm-stage-body h3')?.textContent.slice(0, 12), pic: document.querySelector('.sm-stage-pic .sm-mo.on img')?.naturalWidth, stageOp: getComputedStyle(document.querySelector('.sm-stage')).opacity, h: Math.round(document.querySelector('.sm-show').getBoundingClientRect().height) }))
  await p.screenshot({ path: `${OUT}/${tag}-showcase.png`, clip: { x: 0, y: 0, width: w, height: Math.min(900, 900) } })
  const btns = await p.$$('.sm-sel-b'); await btns[2].click(); await new Promise(r => setTimeout(r, 900))
  const r1 = await p.evaluate(() => ({ on: document.querySelector('.sm-sel-b.on b')?.textContent, term: document.querySelector('.sm-stage-body .sm-uc-term')?.textContent, chips: document.querySelectorAll('.sm-stage-body .sm-chip').length }))
  await p.mouse.move(5, 5); await new Promise(r => setTimeout(r, 7200))
  const r2 = await p.evaluate(() => document.querySelector('.sm-sel-b.on b')?.textContent)
  console.log(w, JSON.stringify({ unitsTop: top, ...r0, afterClick: r1, afterTimer: r2 }), 'errors', errs.length ? errs : 0)
  await p.close()
}
await b.close()
