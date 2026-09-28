import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 1000, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0', timeout: 60000 })
  const gate = await p.$('.cx-gate-card, .pt-login'); if (gate) { for (const x of await p.$$('button')) { const t = await x.evaluate(e => e.textContent); if (/Emergency/i.test(t)) { await x.click(); break } } await new Promise(r => setTimeout(r, 2500)) }
  await p.evaluate(() => document.querySelectorAll('.cxr').forEach(e => e.classList.add('in'))); await new Promise(r => setTimeout(r, 800))
  const r = await p.evaluate(() => { const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]; return {
    p1life: qa('.cx-p1 .cx-life-i').length, p1when: qa('.cx-p1 .cx-life-when').map(e => e.textContent.slice(0, 22)), p1faq: qa('.cx-p1 .cx-faq dt').length,
    p2chart: !!q('.cx-p2 .sysm-embed'), p2cmp: qa('.cx-p2 .cx-cmp-r').length, p2cmpMe: qa('.cx-p2 .cx-cmp-r.me .on').length,
    p3bands: qa('.sm3-band, [class*="sm3-b-"]').length, p3names: qa('.sm3-band-name, .sm3-bn').map(e => e.textContent).slice(0, 12),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  for (const [sel, name] of [['.cx-life', 'life'], ['.cx-faq', 'faq'], ['.cx-cmp', 'cmp']]) { const el = await p.$(sel); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 400)); await el.screenshot({ path: `${OUT}/${tag}-codex-${name}.png` }) } }
  await p.close()
}
// the Services page still carries the moved data
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900 }); await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
console.log('services', JSON.stringify(await p.evaluate(() => ({ when: document.querySelectorAll('.sm-uc-when').length, faq: document.querySelectorAll('.sm-faq-i').length, life: document.querySelectorAll('.sm-life, .sm-uc-pic .sm-uc-tag, [class*="sm-life"]').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))), 'errors', errs.length ? errs : 0)
await b.close()
