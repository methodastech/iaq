/* 15 Sep: page and section heights on /careers/culture. Usage: node tools/culture-height-0915.mjs [width] */
import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 1440)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: W, height: 900 })
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0', timeout: 40000 })
await new Promise(r => setTimeout(r, 800))
const r = await p.evaluate(() => ({ H: document.documentElement.scrollHeight, secs: [...document.querySelectorAll('.cu-page > header, .cu-page > section, section.cpr, section.close3d')].map(s => [s.className.split(' ').slice(0, 2).join(' '), Math.round(s.getBoundingClientRect().height)]) }))
console.log(JSON.stringify(r)); await b.close()
