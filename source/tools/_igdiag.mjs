import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/markets?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.ig-ic')].map(s => {
  const base = s.querySelector('.ig-ic-base')
  const kids = [...base.children]
  const last = kids[kids.length - 1]
  return { n: kids.length, lastClass: last.getAttribute('class'), lastD: last.getAttribute('d').slice(0, 24), stroke: getComputedStyle(last).stroke, fill: getComputedStyle(last).fill }
})), null, 1))
await b.close()
