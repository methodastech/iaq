import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/markets/ev-battery', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2600))
const m = await p.evaluate(() => { const q = s => document.querySelector(s); const g = (s, k) => getComputedStyle(q(s))[k]; return { asideVar: getComputedStyle(q('.mkb')).getPropertyValue('--mk-aside'), inAsideCols: g('.mkb .pg-in-aside', 'gridTemplateColumns'), factsCols: g('.mk-facts', 'gridTemplateColumns'), icoW: g('.mkb-ico', 'width'), icoPad: g('.mkb-ico', 'padding'), asidePad: g('.mkb .pg-head-aside', 'padding'), svgW: g('.mkb-ico svg', 'width'), svgMax: g('.mkb-ico svg', 'maxWidth'), svgAttrs: (e => ({ w: e.getAttribute('width'), vb: e.getAttribute('viewBox'), cls: e.getAttribute('class'), style: e.getAttribute('style') }))(q('.mkb-ico svg')), mmW: g('.mm', 'width'), mmMax: g('.mm', 'maxWidth') } })
console.log(JSON.stringify(m, null, 1))
await b.close()
