/* the strip's marks at their REAL size, captured IN PLACE (the site's own CSS carries the red on stroked marks,
   so never copy the svg into a bare page to judge it: that was a harness bug on 23 Sep) */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 10 })
await p.goto('http://localhost:5177/markets?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 1800))
const ics = await p.$$('.ig-ic')
for (let i = 0; i < ics.length; i++) await ics[i].screenshot({ path: `${process.argv[2]}/ic-${i}.png` })
console.log('icons', ics.length)
await b.close()
