// Element shots of Design tab pieces: every .ap (Applications), the Brand elements line plates, and the phone UI mockups.
// node tools/_dtshots.mjs <outdir> [selector list, comma separated]
import puppeteer from 'puppeteer-core'
const out = process.argv[2], sels = (process.argv[3] || '.ap,#elements .be-sub,.iu-phones').split(',')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 })
await p.goto('http://localhost:57375/design.html?v=' + Date.now(), { waitUntil: 'networkidle2', timeout: 90000 })
await p.addStyleTag({ content: '.bmws,.snav{display:none!important}' })
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } scrollTo(0, 0) })
await sleep(1500)
let k = 0
for (const s of sels) {
  const els = await p.$$(s)
  for (const e of els) {
    const id = await e.evaluate(n => n.id || n.className.split(' ')[0])
    try { await e.screenshot({ path: `${out}/${String(k).padStart(2, '0')}-${id}.png` }); k++ } catch (err) { console.log('skip', id, err.message.slice(0, 80)) }
  }
}
console.log('shots', k); await b.close()
