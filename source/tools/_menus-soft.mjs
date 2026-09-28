import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/about', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2500))
for (const hub of ['services-hub', 'markets-hub']) {
  const mk = await p.$(`.nav-has[data-hub="${hub}"] > a`)
  await mk.hover(); await new Promise(r => setTimeout(r, 2200))
  if (hub === 'markets-hub') { const row = await p.$('.nav-has[data-hub="markets-hub"] .nm-rows > a:nth-child(2)'); await row.hover(); await new Promise(r => setTimeout(r, 900)) }
  await p.screenshot({ path: `${process.argv[2]}/menu-${hub}.png`, clip: { x: 240, y: 60, width: 1100, height: 560 } })
  await p.mouse.move(20, 700); await new Promise(r => setTimeout(r, 900))
}
// the Amendments tab after the beautify: top, then the Markets page filter
await p.goto('http://localhost:52158/checklist.html', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 1200))
await p.screenshot({ path: process.argv[2] + '/checklist-top.png', clip: { x: 0, y: 0, width: 1440, height: 900 } })
await p.click('#filters2 .chip[data-f="markets"]'); await new Promise(r => setTimeout(r, 600))
const ck = await p.evaluate(() => ({ shown: document.querySelectorAll('.item').length, on: document.querySelector('.chip.on') && document.querySelector('.chip.on').textContent, firstMeta: document.querySelector('.item .tags') && document.querySelector('.item .tags').textContent.trim(), stampBg: getComputedStyle(document.querySelector('.stamp')).backgroundColor }))
await p.screenshot({ path: process.argv[2] + '/checklist-markets.png', clip: { x: 0, y: 0, width: 1440, height: 900 } })
console.log(JSON.stringify(ck))
await b.close()
