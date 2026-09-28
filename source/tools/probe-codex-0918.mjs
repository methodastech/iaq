import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const page = await browser.newPage()
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) }); page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 160)))
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile })
  await page.goto('http://localhost:5177/', { waitUntil: 'networkidle2', timeout: 60000 })
  await page.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
  await page.goto('http://localhost:5177/codex', { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 1200))
  const r = await page.evaluate(() => ({ parts: document.querySelectorAll('.cx-part').length, heads: [...document.querySelectorAll('.cx-sh h2')].map(x => x.textContent), openQ: document.querySelectorAll('.cx-oq li').length, firstBlock: document.querySelector('.cx-head + section')?.id, slides: document.querySelectorAll('.cx-set .ig').length, bench: document.querySelectorAll('.cx-bm tbody tr').length, bar: document.querySelectorAll('.cx-bar li').length, prof: document.querySelectorAll('.cx-prof li').length, jump: [...document.querySelectorAll('.cx-jump a')].map(a => a.textContent), pageW: document.documentElement.scrollWidth, vw: innerWidth, emWrap: [...document.querySelectorAll('.cx-head h1 em,.cx-open h2 em,.cx-part h2 em')].filter(e => e.getClientRects().length > 1).map(e => e.textContent), brokenImg: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src).slice(0, 5), slideW: Math.round(document.querySelector('.cx-set .ig')?.getBoundingClientRect().width || 0) }))
  console.log(w, JSON.stringify(r)); console.log('errors', errs.length, errs.slice(0, 3))
  await page.close()
}
await browser.close()
