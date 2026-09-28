/* Culture page interactions (14 Sep): tabs, rail, anchors, counters, SPA exit and re-entry. Headless only. */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '/tmp'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) }); p.on('pageerror', e => errs.push('pageerror ' + e.message))
const wait = ms => new Promise(r => setTimeout(r, ms))
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle2' }); await wait(1500)
const out = {}
out.title = await p.title()
out.meta = await p.$eval('meta[name="description"]', m => m.content)
out.canonical = await p.$eval('link[rel="canonical"]', l => l.href)
out.ld = await p.$eval('.cu-crumbs script', s => JSON.parse(s.textContent).itemListElement.map(i => i.item))
/* tabs: click the third, check the panel and the selected state */
await p.evaluate(() => document.querySelector('#cu-life').scrollIntoView()); await wait(900)
await p.click('#cu-tab-together'); await wait(900)
out.tab = await p.evaluate(() => ({ sel: document.querySelector('[role=tab][aria-selected=true]').id, h: document.querySelector('.cu-panel-copy h3').textContent, img: document.querySelector('.cu-panel-fig img.on').getAttribute('src') }))
await p.keyboard.press('ArrowLeft'); await wait(400)
out.tabKey = await p.evaluate(() => document.activeElement.id)
/* rail: next button moves it */
await p.evaluate(() => document.querySelector('#cu-year').scrollIntoView()); await wait(900)
const s0 = await p.$eval('.cu-rail', r => r.scrollLeft)
await p.click('.cu-railnav button:last-child'); await wait(1200)
out.rail = { before: s0, after: await p.$eval('.cu-rail', r => r.scrollLeft), max: await p.$eval('.cu-rail', r => r.scrollWidth - r.clientWidth) }
/* counters settle on their true values */
await p.evaluate(() => document.querySelector('#cu-safety').scrollIntoView()); await wait(2600)
out.count = await p.evaluate(() => [...document.querySelectorAll('[data-count]')].map(n => n.dataset.count + '=' + n.textContent))
out.clocks = await p.evaluate(() => [...document.querySelectorAll('.cu-clock')].map(c => c.textContent))
/* hero anchor */
await p.evaluate(() => window.scrollTo(0, 0)); await wait(600)
await p.click('a[href="#cu-hire"]'); await wait(2200)
out.anchorTop = await p.$eval('#cu-hire', el => Math.round(el.getBoundingClientRect().top))
/* SPA exit through a link on the page, then back */
await p.evaluate(() => document.querySelector('a[href="/news/osh-week-safety-pledge-signing"]').click()); await wait(1500)
out.after = await p.evaluate(() => location.pathname)
await p.goBack(); await wait(1800)
out.back = await p.evaluate(() => ({ path: location.pathname, armed: !!document.querySelector('.cu-page.cu-armed'), rv: document.querySelectorAll('.cu-rv').length, shown: document.querySelectorAll('.cu-rv.cu-in').length }))
await p.screenshot({ path: OUT + '/ux-back.png' })
/* reduced motion: everything visible without the reveal */
const q = await b.newPage(); await q.setViewport({ width: 1440, height: 900 }); await q.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await q.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle2' }); await wait(1000)
out.reduced = await q.evaluate(() => ({ armed: !!document.querySelector('.cu-armed'), hidden: [...document.querySelectorAll('.cu-rv')].filter(n => getComputedStyle(n).opacity !== '1').length }))
console.log(JSON.stringify({ ...out, errs }, null, 1))
await b.close()
