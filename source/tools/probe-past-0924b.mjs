import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1024, height: 768 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)) } })
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.fx *, .cyb *, .glance.gr *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map(e => { let clip = null; for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflow; if (/hidden|clip/.test(o)) { clip = x.className.toString().slice(0, 24); break } } return e.tagName + ' in ' + (e.parentElement.className.baseVal ?? e.parentElement.className).toString().slice(0, 30) + ' right+' + Math.round(e.getBoundingClientRect().right - innerWidth) + ' clippedBy:' + clip }))))
await b.close()
