import puppeteer from 'puppeteer-core'
const [out] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2' }); await p.addStyleTag({ content: '.bmws{visibility:hidden}html{scroll-behavior:auto!important}' })
const gs = await p.$$('.ilx-g'); const names = []
for (const [i, g] of gs.entries()) {
  const n = await g.evaluate(e => e.querySelector('h4').textContent.replace(/\d+$/, '').trim())
  if (!/Markets|Delivery|Interface|Service objects/.test(n)) continue
  await g.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await new Promise(r => setTimeout(r, 1800))
  await g.screenshot({ path: `${out}/lib-${i}.png` }); names.push(i + ' ' + n)
}
console.log(JSON.stringify(names)); await b.close()
