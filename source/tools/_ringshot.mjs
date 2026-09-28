import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.evaluateOnNewDocument(() => { try { window.__iaqLoaderPlayed = true } catch (e) {} })
await p.goto('http://localhost:57375/services?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1200))
await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } })
const y = await p.evaluate(() => { const e = document.querySelector('.cyc-canvas') || document.querySelector('section.sec.cyb'); const q = e.getBoundingClientRect(); return q.top + scrollY })
await p.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo({ top: y - 90, behavior: 'instant' }) }, y); await new Promise(r => setTimeout(r, 2500))
await p.screenshot({ path: process.argv[2] }); await b.close()
