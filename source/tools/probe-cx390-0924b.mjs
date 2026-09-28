import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.cx-part .cx-sh h2, .cx-part .cx-sh p')].map(e => ({ t: e.innerText.slice(0, 40), right: Math.round(e.getBoundingClientRect().right), over: Math.round(e.getBoundingClientRect().right - innerWidth) })).filter(x => x.over > 0)), 'past-edge items above (empty = none)'))
await b.close()
