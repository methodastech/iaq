/* 17 Sep: does the building hold still between the systems? Reads the camera itself rather than
   photographing it (the scene renders at seconds a frame under software GL). The camera should sit
   at one distance while the nine systems land, and only move when Overall pulls out.
   Usage: node tools/probe-fabcam-0917.mjs */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const p = await b.newPage()
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await new Promise(r => setTimeout(r, 9000))
const box = await p.evaluate(() => { const f = document.querySelector('#fab'); const r = f.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height } })
const rows = []
for (let i = 0; i <= 12; i++) {
  const frac = 0.08 + (i / 12) * 0.88
  await p.evaluate(y => window.scrollTo(0, y), Math.round(box.top + box.h * frac))
  await new Promise(r => setTimeout(r, 1500))
  const q = await p.evaluate(() => (window.__fabQA ? window.__fabQA() : null))
  if (q) rows.push({ frac: +frac.toFixed(2), ...q })
}
const build = rows.filter(r => r.tOut < 0.02)          /* the stages, before Overall pulls out */
const ds = build.map(r => r.dist)
const spread = ds.length ? Math.max(...ds) - Math.min(...ds) : null
console.log(JSON.stringify({ rows, stagesSampled: build.length,
  distanceDuringStages: ds, spreadDuringStages: spread ? +spread.toFixed(3) : null,
  overallPullOut: rows.filter(r => r.tOut > 0.5).map(r => r.dist), errs }, null, 1))
await b.close()
