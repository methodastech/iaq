/* 22 Sep: the 3D stand. Shoots each preset view of the BoothModel at 1440 on the real GPU.
   Usage: node tools/probe-bm3-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 240))); p.on('console', e => { if (e.type() === 'error' || e.type() === 'warning') errs.push(e.text().slice(0, 240)) })
p.on('requestfailed', r => errs.push('FAIL ' + r.url()))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/booth?admin', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(2000)
await p.goto('http://localhost:5177/portal/booth/stand', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(7000)
const el = await p.$('.bm3'); await p.evaluate(e => e.scrollIntoView({ block: 'center' }), el); await wait(800)
for (let i = 0; i < 4; i++) {
  await p.evaluate(i => window.__boothModel?.goto(i), i); await wait(2600)
  await el.screenshot({ path: `${OUT}/bm3-${i}.png` })
}
console.log(await p.evaluate(() => typeof window.__boothModel))
console.log('errs', JSON.stringify(errs))
await b.close()
