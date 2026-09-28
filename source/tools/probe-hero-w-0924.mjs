import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const w of [1280, 1100, 1024, 900, 820, 768, 600, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  const m = await p.evaluate(() => { const s = document.querySelector('.hmr-segs'), r = document.querySelector('.hmr'); if (!s) return null; const sr = s.getBoundingClientRect(); const btns = [...s.querySelectorAll('button')]; return { segsW: Math.round(sr.width), scrollW: s.scrollWidth, clientW: s.clientWidth, left: Math.round(sr.left), rightOver: Math.round(sr.right - innerWidth), railW: Math.round(r.getBoundingClientRect().width), pageOver: document.documentElement.scrollWidth - innerWidth, nmShown: getComputedStyle(s.querySelector('.hmr-nm')).display, btnOver: btns.filter(b => b.scrollWidth > b.clientWidth + 1).length } })
  console.log(w, JSON.stringify(m))
  if (w === 900) { const h = await p.$('.hero'); await h.screenshot({ path: OUT + '/hero-900.png' }) }
  await p.close()
}
await b.close()
