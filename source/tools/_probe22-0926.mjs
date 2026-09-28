import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 150000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.goto('http://localhost:5177/services?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 5000))
const H = await p.evaluate(() => document.documentElement.scrollHeight)
const out = { H, spy: [] }
out.top = await p.evaluate(() => ({ shown: document.querySelector('.ssb').classList.contains('is-shown') }))
for (const sel of ['.sm-units', '#services-cycle', '.sm-works', '#tools-hookup', '.sysm', '.sm-qs', '.sm-faq']) {
  await p.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'start' }), sel); await new Promise(r => setTimeout(r, 700))
  out.spy.push(await p.evaluate(() => { const a = document.querySelector('.ssb-a.on'); const s = document.querySelector('.ssb'); return [a ? a.textContent : null, s.classList.contains('is-shown'), Math.round(s.getBoundingClientRect().top)] }))
}
await p.evaluate(() => document.querySelector('#tools-hookup').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 900))
await p.screenshot({ path: `${OUT}/sv2-hookup.png` })
out.fig0 = await p.evaluate(() => !!document.querySelector('#tools-hookup .thb-fig'))
await p.click('.thb-open'); await new Promise(r => setTimeout(r, 500)); out.fig1 = await p.evaluate(() => !!document.querySelector('#tools-hookup .thb-fig'))
await p.click('.thb-open'); await new Promise(r => setTimeout(r, 300))
out.asks0 = await p.evaluate(() => document.querySelectorAll('.sm-ask:not(.sm-ask-h)').length)
await p.evaluate(() => document.querySelector('.sm-asks-more').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 900))
await p.screenshot({ path: `${OUT}/sv2-asks.png` })
await p.click('.sm-asks-more'); await new Promise(r => setTimeout(r, 500)); out.asks1 = await p.evaluate(() => document.querySelectorAll('.sm-ask:not(.sm-ask-h)').length)
await p.evaluate(() => document.querySelector('.sm-works').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200))
await p.screenshot({ path: `${OUT}/sv2-bar.png` })
out.H2 = await p.evaluate(() => document.documentElement.scrollHeight)
out.errs = errs
console.log(JSON.stringify(out))
await b.close(); process.exit(0)
