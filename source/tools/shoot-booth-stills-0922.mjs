/* 22 Sep: stills of the 3D stand for LinkedIn posts 3 and 4 (the photo slot until the real photographs exist).
   Sizes the model to each post's photo slot on the real GPU and saves JPEGs; PIL turns them into webp.
   Usage: node tools/shoot-booth-stills-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const OUT = process.argv[2] || '.'
const SHOTS = [{ name: 'still-post3', w: 1080, h: 880, view: { pos: [-0.9, 1.6, 6.6], at: [0.45, 1.75, 1.1] }, screen: 0 }, { name: 'still-post4', w: 1080, h: 820, view: { pos: [0.05, 1.55, 5.4], at: [1.15, 1.7, 0.9] }, screen: 2 }]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/portal/booth?admin', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(2000)
await p.goto('http://localhost:5177/portal/booth/stand', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(7000)
for (const s of SHOTS) {
  await p.evaluate(s => { const el = document.querySelector('.bm3'); Object.assign(el.style, { position: 'fixed', left: '0', top: '0', width: s.w + 'px', height: s.h + 'px', zIndex: 9999 }); el.querySelectorAll('.bm3-views,.bm3-hint').forEach(e => e.style.display = 'none') }, s)
  await wait(1500)
  const url = await p.evaluate(s => window.__boothModel.shotAt(s.view, s.screen), s)
  await wait(400)
  const url2 = await p.evaluate(s => window.__boothModel.shotAt(s.view, s.screen), s)
  fs.writeFileSync(`${OUT}/${s.name}.jpg`, Buffer.from(url2.split(',')[1], 'base64'))
  console.log(s.name, url2.length)
}
await b.close()
