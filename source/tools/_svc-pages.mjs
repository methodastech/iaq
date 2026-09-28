import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const res = []
for (const r of ['/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance', '/services/tools-hookup', '/services/hookup']) {
  const rs = await p.goto('http://localhost:52158' + r, { waitUntil: 'networkidle0', timeout: 90000 }); await wait(1800)
  const m = await p.evaluate(() => { const g = (s, k = 'color') => { const e = document.querySelector(s); return e ? getComputedStyle(e)[k] : null }; const ems = [...document.querySelectorAll('h1 em, h2 em, h3 em')].map(e => getComputedStyle(e).color).filter((v, i, a) => a.indexOf(v) === i); const blues = [...document.querySelectorAll('main *, .pg-sec *, header *')].filter(e => { const c = getComputedStyle(e); return /rgb\((11, 143, 216|7, 114, 174|110, 86, 230|88, 64, 201)\)/.test(c.color + c.backgroundColor) }).map(e => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8); return { title: document.title.slice(0, 40), h1: (document.querySelector('h1') || {}).textContent, ems, kicker: g('.pg-k'), blueOrViolet: blues } })
  res.push([r, rs.status(), m])
}
console.log(JSON.stringify({ errs, res }, null, 1))
await b.close()
