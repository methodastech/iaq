import puppeteer from 'puppeteer-core'
const OUT = '/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/dbb50718-829c-4f90-a63d-2463dd2e819a/scratchpad/home'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
for (const [w, h] of [[1440, 900], [1920, 1080], [390, 844]]) {
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 }); await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' }); await wait(4500)
  const info = await p.evaluate(() => ({ tiles: document.querySelectorAll('.hmk-iso a').length, night: document.querySelectorAll('.hmk-iso .iaq-night').length, lines: [...document.querySelectorAll('.hmk-nm')].map(n => Math.round(n.getBoundingClientRect().height)).join(','), rowScroll: (() => { const r = document.querySelector('.hmk-row'); return r.scrollWidth - r.clientWidth })(), overflow: document.documentElement.scrollWidth - innerWidth }))
  console.log(w, JSON.stringify(info))
  const r = await p.evaluate(() => { const e = document.querySelector('.hmk').getBoundingClientRect(); return { x: 0, y: Math.max(0, e.top - 40), width: innerWidth, height: e.height + 70 } })
  await p.screenshot({ path: `${OUT}/glass-${w}.png`, clip: r })
}
console.log('errs', JSON.stringify(errs)); await b.close()
