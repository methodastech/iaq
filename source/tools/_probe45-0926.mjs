import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('http://localhost:5177/services?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
const r = await p.evaluate(() => [...document.querySelectorAll('.ssb-a')].map(a => { const h = a.getAttribute('href'); return [h, !!document.querySelector(h)] }))
const t2 = []
for (const k of ['works', 'who', 'faq']) { await p.evaluate(k => document.querySelector(`.ssb-a[data-k="${k}"]`).click(), k); await new Promise(r => setTimeout(r, 3000)); t2.push(await p.evaluate(k => { const id = { works: 'works', who: 'who-does-what', faq: 'questions' }[k]; const e = document.getElementById(id); return [k, Math.round(e.getBoundingClientRect().top), getComputedStyle(e).scrollMarginTop, Math.round(document.querySelector('.ssb').getBoundingClientRect().bottom)] }, k)) }
const top = t2
console.log(JSON.stringify({ r, top, errs })); await b.close(); process.exit(0)
