import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
for (const [label, base] of [['DEV', 'http://localhost:5177'], ['LAUNCH', 'http://localhost:3000']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 2400 })
  await p.goto(base + '/contact', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await new Promise(r => setTimeout(r, 1500))
  const cards = await p.evaluate(() => [...document.querySelectorAll('[class*="off"], [class*="office"]')].filter(e => e.querySelector('h3,h4') && e.innerText.length < 400).map(e => e.innerText.replace(/\n+/g, ' | ').slice(0, 220)))
  console.log('== ' + label + ' (' + cards.length + ' cards)')
  cards.slice(0, 8).forEach(c => console.log('   ' + c))
  await p.close()
}
await b.close()
