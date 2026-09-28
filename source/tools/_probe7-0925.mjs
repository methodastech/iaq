import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const W of [1000, 1440]) {
const p = await b.newPage(); await p.setViewport({ width: W, height: 800, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/plan.html', { waitUntil: 'networkidle2' })
await p.evaluate(() => window.scrollTo(0, 2600)); await new Promise(r => setTimeout(r, 800))
const m = await p.evaluate(() => { const ws = document.querySelector('.bmws'), bar = document.getElementById('bpBar'); const r = e => e ? (x => ({ top: Math.round(x.top), h: Math.round(x.height) }))(e.getBoundingClientRect()) : null
  return { ws: r(ws), wsPos: ws && getComputedStyle(ws).position, bar: r(bar), barCls: bar.className, wsH: getComputedStyle(bar).top, steps: [...bar.querySelectorAll('.is-live a.bp-step')].map(a => ({ t: a.textContent, w: a.clientWidth, sw: a.scrollWidth })) } })
console.log(W, JSON.stringify(m))
await p.screenshot({ path: '/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/f19488ad-dbd8-4061-ade0-b04e4d89e671/scratchpad/plan-' + W + '.png', clip: { x: 0, y: 0, width: W, height: 300 } })
await p.close() }
await b.close()
