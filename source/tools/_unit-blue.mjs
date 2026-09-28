import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const res = []
for (const r of ['/services/epc-construction', '/services/tool-installation', '/services/process-critical-utilities', '/services/energy-management']) {
  await p.goto('http://localhost:52158' + r, { waitUntil: 'networkidle0', timeout: 90000 }); await wait(2500)
  const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 800) { await p.evaluate(v => scrollTo(0, v), y); await wait(80) } await p.evaluate(() => scrollTo(0, 0)); await wait(500)
  const m = await p.evaluate(() => { const g = (s, k = 'color') => { const e = document.querySelector(s); return e ? getComputedStyle(e)[k] : null }; const reds = [...document.querySelectorAll('.un-hero *, .un-sec *, .un-band *')].filter(e => { const c = getComputedStyle(e); return [c.color, c.backgroundColor, c.borderColor].some(v => /rgb\(2(36|55), (32|77|107|138), (39|85|112|144)\)/.test(v)) }).map(e => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8); return { h1em: g('.un-h1 em'), h2em: g('.un-h2 em'), when: g('.un-hero .un-when span'), bandK: g('.un-band-k'), svcTag: g('.un-svc-tag', 'backgroundColor'), modelN: g('.un-model-n'), pickOn: g('.un-pick-tab.on', 'backgroundColor'), closingCta: g('.cb .cta, .closing .cta, .cta', 'backgroundColor'), navCta: g('.nav-act .cta, .nav .cta', 'backgroundColor'), redsLeft: reds } })
  res.push([r, m])
  if (r === '/services/epc-construction') { await p.screenshot({ path: `${out}/unit-epc-hero.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } }); const t = await p.evaluate(() => document.querySelector('.un-models').getBoundingClientRect().top + scrollY); await p.evaluate(y => scrollTo(0, y - 40), t); await wait(1200); await p.screenshot({ path: `${out}/unit-epc-models.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } }) }
}
console.log(JSON.stringify(res, null, 1))
await b.close()
