import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2200))
await p.evaluate(() => scrollTo(0, document.body.scrollHeight))
await new Promise(r => setTimeout(r, 1400))
console.log(JSON.stringify(await p.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), left: Math.round(b.left) } }
  return {
    navBlock: r('.cb-nav'), navLabel: r('.cb-nav .f-h4, .cb-nav h2'),
    ledBlock: r('.cb-ledger'), ledLabel: r('.cb-ledger .f-h4, .cb-ledger h2, .cb-ledger .cb-k'),
  }
})))
await b.close()
