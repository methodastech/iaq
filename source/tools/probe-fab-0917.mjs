/* 17 Sep: the fab showpiece after the camera was damped (client: static building between the
   systems, the zoom only at Overall). Shoots the stage at nine scroll positions so the frame can be
   compared across stages: the building should sit still until Overall pulls out.
   Usage: node tools/probe-fab-0917.mjs <outdir> */
import puppeteer from 'puppeteer-core'
import crypto from 'node:crypto'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const p = await b.newPage()
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await new Promise(r => setTimeout(r, 6000))
const box = await p.evaluate(() => { const f = document.querySelector('#fab'); const r = f.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height } })
const out = []
for (let i = 0; i <= 9; i++) {
  const frac = 0.06 + (i / 9) * 0.9
  await p.evaluate(y => window.scrollTo(0, y), Math.round(box.top + box.h * frac))
  await new Promise(r => setTimeout(r, 1400))
  const png = await p.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } })
  const f = `${OUT}/fab-${String(i).padStart(2, '0')}.png`
  const fs = await import('node:fs'); fs.writeFileSync(f, png)
  out.push({ i, frac: +frac.toFixed(2), hash: crypto.createHash('md5').update(png).digest('hex').slice(0, 8),
    rail: await p.evaluate(() => (document.querySelector('.fab-rail .on, .fab-row.on, [class*="row"].on') || {}).textContent?.trim().slice(0, 28) || '') })
}
console.log(JSON.stringify({ out, errs }, null, 1))
await b.close()
