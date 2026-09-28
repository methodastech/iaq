import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
for (const [i, name] of [[0, 'epc'], [1, 'hookup'], [2, 'efm']]) {
  await p.evaluate(async i => { const b = document.querySelectorAll('.sm-uc-more')[i]; if (!b.getAttribute('aria-expanded') || b.getAttribute('aria-expanded') === 'false') b.click(); await new Promise(r => setTimeout(r, 800)) }, i)
  const dg = await p.$('.sm-ud-dg'); await dg.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 400))
  await dg.screenshot({ path: `${OUT}/uddg-${name}.png` })
  await p.evaluate(() => document.querySelector('.sm-ud-close').click()); await new Promise(r => setTimeout(r, 400))
}
await b.close()
