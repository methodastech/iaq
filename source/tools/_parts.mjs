import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:61862/', { waitUntil: 'networkidle2', timeout: 120000 }); await new Promise(r => setTimeout(r, 8000))
const m = await p.evaluate(() => { const cv = document.getElementById('heroCanvas'); const c = cv.getContext('2d'); const d = c.getImageData(0, 0, cv.width, cv.height).data; let lit = 0, bright = 0; for (let i = 3; i < d.length; i += 4) { if (d[i] > 8) lit++; if (d[i] > 120) bright++ } return { w: cv.width, h: cv.height, op: getComputedStyle(cv).opacity, litPx: lit, brightPx: bright } })
console.log(JSON.stringify(m)); await b.close()
