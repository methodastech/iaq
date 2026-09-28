import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 700) { await p.evaluate(yy => window.scrollTo(0, yy), y); await new Promise(r => setTimeout(r, 100)) }
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => { e.classList.add('in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) }); await new Promise(r => setTimeout(r, 600))
  const info = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, units: document.querySelectorAll('.sm-uc').length, rx: !!document.querySelector('.rx-cols'), asks: document.querySelectorAll('.sm-ask').length, faq: document.querySelectorAll('.sm-faq-i').length, imgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length }))
  console.log(w, JSON.stringify(info), 'errors', errs.length ? errs : 0)
  for (const sel of ['.sm-units', '.sm-map', '.sm-qs', '.sm-work', '.sm-faq']) { const el = await p.$(sel); if (!el) { console.log('missing', sel); continue } await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 700)); await el.screenshot({ path: `${OUT}/${tag}-${sel.slice(1)}.png` }) }
  await p.close()
}
await b.close()
