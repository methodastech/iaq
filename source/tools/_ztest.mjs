import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 3200))
await p.evaluate(() => {
  document.querySelector('.hmk-row.hmk-iso').scrollIntoView({ block: 'center' })
  document.querySelectorAll('.hmk-iso a').forEach(a => { a.style.background = 'none'; a.style.backdropFilter = 'none'; a.style.webkitBackdropFilter = 'none'; a.style.boxShadow = 'none' })
})
await new Promise(r => setTimeout(r, 900))
const el = await p.$('.hmk')
await el.screenshot({ path: process.argv[2] })
const z = await p.evaluate(() => {
  const c = document.querySelector('.hmk-gl'), a = document.querySelector('.hmk-iso a')
  return { glZ: getComputedStyle(c).zIndex, aPos: getComputedStyle(a).position, aZ: getComputedStyle(a).zIndex, aBg: getComputedStyle(a).backgroundImage.slice(0, 40), filt: getComputedStyle(a).backdropFilter }
})
console.log(JSON.stringify(z))
await b.close()
