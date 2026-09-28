import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.cu-origin').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 3000))
console.log(JSON.stringify(await p.evaluate(() => { const v = document.querySelector('.cu-origin video'); return { src: v.getAttribute('src'), paused: v.paused, t: +v.currentTime.toFixed(2), ready: v.readyState } })))
await p.evaluate(() => window.scrollTo(0, 0)); await new Promise(r => setTimeout(r, 800))
console.log('off screen paused:', await p.evaluate(() => document.querySelector('.cu-origin video').paused))
await b.close()
