import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2500))
const H = await p.evaluate(() => document.documentElement.scrollHeight)
let k = 0
for (let y = 0; y < H - 500 && k < 12; y += 820) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: `${OUT}/ab-${k++}.png`, captureBeyondViewport: false }) }
const text = await p.evaluate(() => document.querySelector('#root').innerText)
console.log(JSON.stringify({ H, shots: k, dash: (text.match(/[—–]| - /g) || []).length, bang: (text.match(/!/g) || []).length, overflow: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), errs }))
await b.close()
