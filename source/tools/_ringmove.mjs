import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2500))
await p.evaluate(() => document.querySelector('[class*="cring"]')?.scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 1200))
const sample = () => p.evaluate(() => [...document.querySelectorAll('[class*="cring-disc"] svg .mk-mv, [class*="cring-disc"] svg [class*="mv"]')].map(g => getComputedStyle(g).transform))
const a = await sample(); await new Promise(r => setTimeout(r, 1400)); const c = await sample()
const moved = a.filter((v, i) => v !== c[i]).length
console.log(JSON.stringify({ movers: a.length, changedIn1_4s: moved, sampleA: a.slice(0, 3), sampleB: c.slice(0, 3) }, null, 1))
await b.close()
