import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [route, w] of [['/services/energy-management', 1440], ['/services/epc-construction', 390]]) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 500 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto('http://localhost:5177' + route, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 1200))
  await page.evaluate(() => { const st = document.createElement('style'); st.textContent = '[data-rv],[data-reveal]{opacity:1!important;transform:none!important}'; document.head.appendChild(st) })
  const el = await page.$('.un-scope')
  await el.screenshot({ path: `${OUT}/unitscope-${w}.png` })
  console.log(route, w, 'shot')
  await page.close()
}
await browser.close()
