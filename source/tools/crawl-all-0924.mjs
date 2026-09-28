import puppeteer from 'puppeteer-core'
const routes = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence', '/services', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance', '/services/tool-installation', '/services/process-critical-utilities', '/services/epc-construction', '/services/energy-management', '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage', '/projects', '/news', '/careers', '/careers/culture', '/contact', '/investors', '/policies', '/exhibition', '/shortlist']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
let bad = 0
for (const w of [1440, 390]) {
  const p = await p_new(); async function p_new() { const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 }); return p }
  for (const r of routes) {
    const errs = []; const h = e => errs.push(String(e).slice(0, 100)); p.on('pageerror', h); const ch = m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)) }; p.on('console', ch)
    let status = 0
    try { const resp = await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle0', timeout: 60000 }); status = resp.status() } catch (e) { errs.push('nav: ' + String(e).slice(0, 60)) }
    await p.evaluate(async () => { window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 400)); window.scrollTo(0, 0) })
    const r2 = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, broken: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('loading') !== 'lazy').length, nf: /That page is not here/.test(document.body.innerText), dashes: (document.body.innerText.match(/ [–—] /g) || []).length, bangs: (document.body.innerText.replace(/Skip to content/g, '').match(/!/g) || []).length }))
    p.off('pageerror', h); p.off('console', ch)
    const flag = errs.length || r2.overflow || r2.broken || r2.nf || r2.dashes || r2.bangs || status >= 400
    if (flag) { bad++; console.log(w, r, status, JSON.stringify(r2), errs.length ? errs : '') }
  }
  await p.close()
}
console.log('pages flagged:', bad)
await b.close()
