/* the seven hero marks, big, on the hero's dark, for judging detail and family */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1500, height: 520, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim&marks=line', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 1500))
const html = await p.evaluate(() => {
  const cells = [...document.querySelectorAll('.hmk-iso li')].map(li => `<figure><div class="q">${li.querySelector('svg').outerHTML}</div><figcaption>${li.querySelector('.hmk-nm').textContent}</figcaption></figure>`).join('')
  return cells
})
await p.setContent(`<style>body{margin:0;background:#12151A;font:600 13px/1.3 system-ui;color:#fff;display:flex;flex-wrap:wrap;gap:8px;padding:18px;align-items:flex-end}
figure{margin:0;width:196px;text-align:center}.q{height:196px;display:grid;place-items:center}
svg{width:190px;height:190px;color:#D8DDE4;filter:none}figcaption{padding-top:8px;color:#aeb6c0}
.g{position:absolute}</style>${html}`)
await new Promise(r => setTimeout(r, 300))
await p.screenshot({ path: process.argv[2], fullPage: true })
console.log('ok')
await b.close()
