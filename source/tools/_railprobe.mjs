import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.evaluateOnNewDocument(() => { try { window.__iaqLoaderPlayed = true } catch (e) {} })
await p.goto('http://localhost:57375/news?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => { const ol = document.querySelector('.nb-rail'); const cs = getComputedStyle(ol); return { gap: cs.columnGap, lis: [...ol.children].map(li => { const q = li.getBoundingClientRect(); const bq = li.querySelector('button').getBoundingClientRect(); const pb = getComputedStyle(li.querySelector('button'), '::before'); return [Math.round(q.left), Math.round(q.right), Math.round(bq.left), Math.round(bq.right), pb.width, pb.backgroundColor] }) } })))
await p.evaluate(() => { const ol = document.querySelector('.nb-rail'); ol.scrollIntoView({ block: 'center' }) }); await new Promise(r => setTimeout(r, 600))
const r = await p.evaluate(() => { const q = document.querySelector('.nb-rail').getBoundingClientRect(); return { x: q.left - 20, y: q.top - 40, width: q.width + 40, height: q.height + 80 } })
await p.screenshot({ path: process.argv[2], clip: r }); await b.close()
