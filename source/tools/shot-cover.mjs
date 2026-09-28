import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 1000, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 1500))
  await (await p.$('.sc-head')).screenshot({ path: `${OUT}/${tag}-cover-refined.png` }); await p.close()
}
await b.close()
