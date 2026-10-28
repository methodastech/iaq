/* 8 Oct 2026: headless proof of the packaged deck, every slide at 1920x1080 from the unzipped zip served by its own
   serve.py. Usage: node tools/shot-deck-1008.mjs http://localhost:8799 <outdir> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:8799', out = '/tmp/deck-shots'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1920,1080', '--autoplay-policy=no-user-gesture-required'] })
const WAIT = { 1: 6000, 2: 16000, 3: 14000, 4: 16000, 5: 2500, 6: 3500, 7: 3500, 8: 4500, 9: 2000 }
const report = []
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
p.on('requestfailed', r => errs.push('failed: ' + r.url()))
p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()) })
await p.goto(base + '/', { waitUntil: 'networkidle2', timeout: 60000 })
for (let n = 1; n <= 9; n++) {
  /* step with the keyboard, as a visitor would, so the kept 3D instance carries over between its tabs */
  if (n > 1) await p.keyboard.press('ArrowRight')
  await new Promise(r => setTimeout(r, WAIT[n]))
  const info = await p.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
    const fr = document.querySelector('.pr-live .cxs')
    return { hash: location.hash, screen: R(document.querySelector('.pr-screen')), frame: R(fr), frameAspect: fr ? +(fr.clientWidth / fr.clientHeight).toFixed(3) : null,
      overflowFrame: fr ? fr.scrollHeight > fr.clientHeight + 2 : null, tab: (document.querySelector('.pr-tabs a.on') || {}).textContent }
  })
  await p.screenshot({ path: `${out}/s${n}.png` })
  report.push({ n, ...info })
  if (n === 4) {
    /* the second version of the systems view: every system in its code colour (a real click, so the auto-advance holds) */
    const btns = await p.$$('.pr-sys-v button'); if (btns[1]) { await btns[1].click(); await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: `${out}/s4-coded.png` }); await btns[0].click() }
  }
}
console.log(JSON.stringify({ report, errs: errs.slice(0, 20), errCount: errs.length }, null, 1))
await b.close()
