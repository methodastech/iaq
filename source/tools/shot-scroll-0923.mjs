import puppeteer from 'puppeteer-core'
const y = parseInt(process.argv[3] || '900', 10)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2400))
await p.evaluate(v => scrollTo(0, v), y)
await new Promise(r => setTimeout(r, 1200))
const bg = await p.evaluate(() => {
  const at = (x, yy) => { const el = document.elementFromPoint(x, yy); let e = el, c = ''; while (e && !c) { const s = getComputedStyle(e).backgroundColor; if (s && s !== 'rgba(0, 0, 0, 0)') c = s + ' ← ' + (e.className || e.tagName); e = e.parentElement } return c }
  return { top: at(720, 60), mid: at(720, 450), bot: at(720, 850) }
})
await p.screenshot({ path: process.argv[2] })
console.log(JSON.stringify(bg))
await b.close()
