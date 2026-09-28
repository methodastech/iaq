import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 })
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)) }); page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 200)))
const res = {}
const go = async (u, w = 1800) => { await page.goto('http://localhost:5177' + u, { waitUntil: 'domcontentloaded', timeout: 90000 }); await new Promise(r => setTimeout(r, w)) }
await go('/'); await page.evaluate(() => localStorage.removeItem('iaq.cms.session.v1'))
await go('/portal'); res.gated = await page.evaluate(() => ({ url: location.pathname, login: !!document.querySelector('.cms-login'), tabs: document.querySelectorAll('.pt-tabs a').length }))
await go('/portal/codex?admin'); res.admin = await page.evaluate(() => ({ url: location.pathname + location.search, session: localStorage.getItem('iaq.cms.session.v1'), tabs: [...document.querySelectorAll('.pt-tabs a')].map(a => a.textContent + (a.classList.contains('on') ? '*' : '')), parts: document.querySelectorAll('.cx-part').length, cc: document.querySelectorAll('.cx-cc-row').length, slides: document.querySelectorAll('.cx-set .ig').length, h1: document.querySelectorAll('h1').length, barOn: document.querySelector('.bmws-tabs a.on')?.textContent.trim(), title: document.title, w: document.documentElement.scrollWidth }))
await page.screenshot({ path: OUT + '/portal-codex.png' })
for (const t of ['newsroom', 'careers', 'projects', 'downloads']) {
  await go('/portal/' + t, 1200)
  res[t] = await page.evaluate(() => ({ url: location.pathname, on: document.querySelector('.pt-tabs a.on')?.textContent, h1: document.querySelector('.cms-head h1')?.textContent, items: document.querySelectorAll('.cms-item').length, set: document.querySelectorAll('.cms-set-grid li').length, brokenImg: [...document.images].filter(i => i.complete && !i.naturalWidth).length, barOn: document.querySelector('.bmws-tabs a.on')?.textContent.trim(), title: document.title }))
  if (t === 'downloads') await page.screenshot({ path: OUT + '/portal-downloads.png' })
}
await go('/codex#crosscheck', 2500); res.redirect = await page.evaluate(() => ({ url: location.pathname + location.hash, cc: document.querySelectorAll('.cx-cc-row').length }))
await go('/portal/nonsense', 1500); res.unknown = await page.evaluate(() => ({ url: location.pathname, bar: !!document.querySelector('.pt-bar'), login: !!document.querySelector('.cms-login'), session: localStorage.getItem('iaq.cms.session.v1'), body: document.body.innerText.slice(0, 160) }))
const s = await page.$('.pt-bar'); res.sticky = await page.evaluate(() => { const b = document.querySelector('.pt-bar'); return b ? getComputedStyle(b).position : 'no bar' })
await page.evaluate(() => document.querySelector('.pt-out')?.click()); await new Promise(r => setTimeout(r, 600))
res.signout = await page.evaluate(() => ({ login: !!document.querySelector('.cms-login'), session: localStorage.getItem('iaq.cms.session.v1') }))
console.log(JSON.stringify(res, null, 0)); console.log('errors', errs.length, errs.slice(0, 4))
await browser.close()
