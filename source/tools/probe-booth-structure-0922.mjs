/* 22 Sep: the portal Booth's structure. Seven numbered parts in order, each part's sub-section links land under the
   bars, no sideways overflow, full-page shot for review. Usage: node tools/probe-booth-structure-0922.mjs <outdir> [width] */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.', W = +(process.argv[3] || 1440)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 200))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 200)) })
await p.setViewport({ width: W, height: 900 })
await p.goto('http://localhost:5177/portal/booth?admin', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(5000)
console.log(JSON.stringify(await p.evaluate(() => ({
  parts: [...document.querySelectorAll('.bt-part-h')].map(h => h.querySelector('.bt-part-n').textContent + ' ' + h.querySelector('h2').textContent + ' [' + [...h.querySelectorAll('.bt-part-toc a')].map(a => a.textContent).join(', ') + ']'),
  h3: document.querySelectorAll('.bt-sec-h h3').length, h2sec: document.querySelectorAll('.bt-sec-h h2').length,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }))))
for (const sid of ['leaflet', 'rollups', 'posts', 'walls', 'questions']) {
  await p.evaluate(sid => document.querySelector(`.bt-part-toc a[href="#bt-s-${sid}"]`).click(), sid); await wait(4200)
  console.log('sub', sid, await p.evaluate(sid => { const t = document.querySelector('.bt-tabs').getBoundingClientRect().bottom, r = document.getElementById('bt-s-' + sid).getBoundingClientRect().top; return 'gap under bar ' + Math.round(r - t) + ' | bar on ' + document.querySelector('.bt-tabs a.on')?.textContent }, sid))
}
await p.evaluate(() => window.scrollTo(0, 0)); await wait(800)
await p.screenshot({ path: `${OUT}/structure-${W}.png`, fullPage: true })
console.log('errs', JSON.stringify(errs))
await b.close()
