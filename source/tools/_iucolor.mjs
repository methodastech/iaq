import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000 })
await p.goto('http://localhost:57375/design.html?v=' + Date.now(), { waitUntil: 'networkidle2', timeout: 90000 })
console.log(JSON.stringify(await p.evaluate(() => {
  const l = document.querySelector('#inuse .iu-list'), sp = document.querySelector('#inuse .iu-scr-h + .iu-spec'), led = document.querySelector('#inuse .iu-ledger > div')
  const cs = e => { const c = getComputedStyle(e); return { bt: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, r: c.getPropertyValue('--r') } }
  return { list: cs(l), spec: sp && cs(sp), ledger: getComputedStyle(led).borderBottomColor, rootR: getComputedStyle(document.documentElement).getPropertyValue('--r'), sheets: [...document.styleSheets].map(s => (s.href || 'inline').slice(-40)) }
})))
await b.close()
