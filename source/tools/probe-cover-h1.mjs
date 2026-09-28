import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1920, 1440, 1280, 1200, 1100, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 800))
  console.log(w, JSON.stringify(await p.evaluate(() => { const h = document.querySelector('.sc-copy h1'); const em = h.querySelector('em'); const rg = document.createRange(); rg.selectNodeContents(h); return { h1Lines: rg.getClientRects().length > 0 ? Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)) : 0, emLines: em.getClientRects().length, fs: getComputedStyle(h).fontSize, spare: Math.round(h.getBoundingClientRect().width - (() => { const r2 = document.createRange(); r2.selectNodeContents(em); return r2.getBoundingClientRect().width })()) } })))
  await p.close()
}
await b.close()
