import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sm-faq').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 900))
  const r = await p.evaluate(() => { const h = document.querySelector('.sm-faq-h'), ic = h.querySelector('.faq-hic'), t = h.querySelector('span'); const plate = ic.querySelector('ellipse'); const pr = plate.getBoundingClientRect(), ir = ic.getBoundingClientRect(), tr = t.getBoundingClientRect(); return { ov: getComputedStyle(ic).overflow, plateL: Math.round(pr.left), plateR: Math.round(pr.right), boxL: Math.round(ir.left), boxR: Math.round(ir.right), textL: Math.round(tr.left), textTop: Math.round(tr.top), icBottom: Math.round(ir.bottom) } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  const hd = await p.$('.sm-faq .pg-in'); await p.screenshot({ path: `${OUT}/${tag}-faqhead-above.png`, clip: { x: 0, y: 0, width: w, height: w < 500 ? 420 : 380 } })
  await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('.cu-rv').forEach(e => e.classList.add('cu-in')); document.querySelector('.cu-grow').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 900))
  await p.screenshot({ path: `${OUT}/${tag}-growhead-above.png`, clip: { x: 0, y: 0, width: w, height: w < 500 ? 420 : 380 } })
  await p.close()
}
await b.close()
