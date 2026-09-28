/* 17 Sep: force the globe's GL context to be lost and check the page does not end up with a broken
   canvas: the flat world must take its place and the chips must go. Usage: node tools/probe-globe-loss-0917.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const p = await b.newPage()
const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 90000 })
await p.evaluate(() => document.querySelector('.globe-col').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 2000))
const before = await p.evaluate(() => ({ tags: document.querySelectorAll('.globe-tag').length, flat: !!document.querySelector('.globe-flat') }))
await p.evaluate(() => {
  const cv = document.getElementById('globeCv')
  const gl = cv.getContext('webgl2') || cv.getContext('webgl')
  gl.getExtension('WEBGL_lose_context').loseContext()
})
await new Promise(r => setTimeout(r, 2200))
const after = await p.evaluate(() => {
  const cv = document.getElementById('globeCv')
  const gl = cv && (cv.getContext('webgl2') || cv.getContext('webgl'))
  return { tags: document.querySelectorAll('.globe-tag').length, flat: !!document.querySelector('.globe-flat'),
    liveContext: gl ? !gl.isContextLost() : false, canvasDisplay: cv ? getComputedStyle(cv).display : 'gone' }
})
/* and it must still be turning: two tag reads a moment apart */
const t1 = await p.evaluate(() => [...document.querySelectorAll('.globe-tag')].map(e => e.style.transform).join('|'))
await new Promise(r => setTimeout(r, 700))
const t2 = await p.evaluate(() => [...document.querySelectorAll('.globe-tag')].map(e => e.style.transform).join('|'))
after.turning = t1 !== t2
const host = await p.$('.globe-host')
await host.screenshot({ path: `${OUT}/globe-after-loss.png` })
console.log(JSON.stringify({ before, after, errs }, null, 1))
await b.close()
