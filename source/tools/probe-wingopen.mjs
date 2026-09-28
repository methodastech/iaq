/* 15 Sep: open each nav wing by hover and confirm its panel sits fully inside the viewport; check /about/history renders clean */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1440, 1100]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
  await p.setViewport({ width: w, height: 900 }); await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0', timeout: 40000 })
  const n = await p.$$eval('.nav-has', e => e.length)
  for (let i = 0; i < n; i++) {
    const trig = (await p.$$('.nav-has > a'))[i]; await trig.hover(); await new Promise(r => setTimeout(r, 700))
    const r = await p.evaluate(i => { const h = document.querySelectorAll('.nav-has')[i]; const m = h.querySelector('.nav-mega'); const rc = m.getBoundingClientRect(); const vw = document.documentElement.getBoundingClientRect().width
      return { wing: h.querySelector(':scope > a').textContent.trim(), open: m.classList.contains('open'), left: Math.round(rc.left), right: Math.round(rc.right), vw: Math.round(vw), inside: rc.left >= 15.5 && rc.right <= vw - 15.5, gapL: Math.round(rc.left), gapR: Math.round(vw - rc.right) } }, i)
    console.log(w, JSON.stringify(r))
    if (w === 1440 && r.wing === 'Careers') await p.screenshot({ path: `${OUT}/wing-careers-after.png`, clip: { x: 0, y: 0, width: 1440, height: 620 } })
    await p.mouse.move(5, 600); await new Promise(r => setTimeout(r, 300))
  }
  console.log(w, 'page errors', errs.length); await p.close()
}
const h = await b.newPage(); const herr = []; h.on('pageerror', e => herr.push(String(e).slice(0, 150))); h.on('console', m => { if (m.type() === 'error') herr.push(m.text().slice(0, 150)) })
await h.setViewport({ width: 1440, height: 900 }); await h.goto('http://localhost:5177/about/history', { waitUntil: 'networkidle0', timeout: 40000 })
const hr = await h.evaluate(() => { const s = document.querySelector('.hx, [class*="hspan"], [class*="history"]'); const eb = [...document.querySelectorAll('.eyebrow')].map(e => e.textContent.trim())
  return { eyebrows: eb, fullRecordGone: !eb.includes('The full record'), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
console.log('history', JSON.stringify(hr), 'errors', herr.length ? herr : 0)
await b.close()
