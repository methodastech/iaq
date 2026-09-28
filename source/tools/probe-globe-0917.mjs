/* 17 Sep: how wide is the dot world inside its box? Shoots .globe-host on the home page and
   reports the host size, so the silhouette can be measured off the PNG.
   Usage: node tools/probe-globe-0917.mjs <outdir> <tag> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.', TAG = process.argv[3] || 'now'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const p = await b.newPage()
const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 90000 })
await p.evaluate(() => document.querySelector('#story').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 2500))
const host = await p.$('.globe-host')
await host.screenshot({ path: `${OUT}/globe-${TAG}.png` })
console.log(JSON.stringify({ errs, ...await p.evaluate(() => {
  const h = document.querySelector('.globe-host').getBoundingClientRect()
  return { hostW: Math.round(h.width), hostH: Math.round(h.height), tags: document.querySelectorAll('.globe-tag').length }
}) }))
await b.close()
