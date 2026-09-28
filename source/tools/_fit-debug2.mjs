import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(r => setTimeout(r, 3000))
const m = await p.evaluate(() => [...document.querySelectorAll('.cyc-mk svg')].map(s => { const b = s.getBBox(); return { vb: s.getAttribute('viewBox').split(' ').map(n => Math.round(Number(n))).join(','), bbox: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)].join(','), anim: [...s.querySelectorAll('*')].filter(e => getComputedStyle(e).animationName !== 'none').length, cls: s.getAttribute('class') } }))
console.log(JSON.stringify(m))
await b.close()
