import puppeteer from 'puppeteer-core'
const OUT = '/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/dbb50718-829c-4f90-a63d-2463dd2e819a/scratchpad/home'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 }); await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' }); await wait(4000)
  const info = await p.evaluate(() => ({ marks: document.querySelectorAll('.hmk-iso .hmk-mk').length, names: [...document.querySelectorAll('.hmk-iso a span')].map(s => s.textContent), rows: new Set([...document.querySelectorAll('.hmk-iso li')].map(li => Math.round(li.getBoundingClientRect().top))).size, overflow: document.documentElement.scrollWidth - innerWidth }))
  console.log(w, JSON.stringify(info))
  const r = await p.evaluate(() => { const e = document.querySelector('.hmk').getBoundingClientRect(); return { x: 0, y: Math.max(0, e.top - 30), width: innerWidth, height: e.height + 60 } })
  await p.screenshot({ path: `${OUT}/hero-mk-${w}.png`, clip: r })
}
console.log('errs', JSON.stringify(errs)); await b.close()
