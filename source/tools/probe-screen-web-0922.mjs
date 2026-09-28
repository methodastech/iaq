/* 22 Sep: the booth screen as a touch website. At 1920 x 1080 on the real GPU: each section in loop mode, then the
   explore interactions (fab moment and scrub, a unit opened, services filtered, a hook-up phase, an office, book a
   meeting). Reports errors, the smallest text, and anything past the stage. Usage: node tools/probe-screen-web-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 200))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 200)) })
await p.setViewport({ width: 1920, height: 1080 })
await p.goto('http://localhost:5177/booth/screen', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(3500)
const check = () => p.evaluate(() => {
  let min = 999, who = ''
  document.querySelectorAll('.bs-stage *').forEach(e => { if (!e.getClientRects().length || getComputedStyle(e).opacity === '0') return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const f = parseFloat(getComputedStyle(e).fontSize); if (f < min) { min = f; who = (e.className?.baseVal ?? e.className) + ':' + e.textContent.trim().slice(0, 20) } })
  const out = [...document.querySelectorAll('.bs-ch *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.bottom > 1081 || r.right > 1921) && e.tagName !== 'svg' && !e.closest('svg') }).slice(0, 4).map(e => (e.className?.baseVal ?? e.className) + ' ' + Math.round(e.getBoundingClientRect().bottom) + '/' + Math.round(e.getBoundingClientRect().right))
  return { min: min + ' ' + who, out, hint: document.querySelector('.bs-hint') ? 'touch-to-explore' : 'book-a-meeting', mode: document.querySelector('.bs').className }
})
const secs = ['open', 'fab', 'units', 'services', 'hookup', 'europe']
/* loop mode, each section via the clock: shot mid-section. Jumping would switch to explore, so wait instead for 1 and use keys after */
console.log('loop open', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-loop-open.png` })
await wait(9000); console.log('loop fab', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-loop-fab.png` })
/* explore: header nav, then the interactions */
const clickSel = async sel => { const el = await p.$(sel); if (!el) return console.log('MISSING', sel); await el.click(); await wait(900) }
await clickSel('.bs-top nav button:nth-child(1)'); await wait(1500)
await clickSel('.bs-fab-ctl li:nth-child(3) button'); console.log('fab moment 3', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-x-fab.png` })
await clickSel('.bs-top nav button:nth-child(2)'); await wait(2500)
await p.screenshot({ path: `${OUT}/sw-x-units.png` })
await clickSel('.bs-ucard:nth-child(2)'); console.log('unit open', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-x-unit2.png` })
await clickSel('.bs-uo-nav button:nth-child(4)'); await p.screenshot({ path: `${OUT}/sw-x-unit3.png` }); console.log('unit 3', JSON.stringify(await check()))
await clickSel('.bs-top nav button:nth-child(3)'); await wait(3000)
await clickSel('.bs-chips button:nth-child(3)'); await clickSel('.bs-sv:nth-child(6)'); console.log('services', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-x-svc.png` })
await clickSel('.bs-top nav button:nth-child(4)'); await wait(2000)
await clickSel('.bs-phases li:nth-child(3) button'); console.log('hookup', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-x-hk.png` })
await clickSel('.bs-top nav button:nth-child(5)'); await wait(2500)
await clickSel('.bs-offices li:nth-child(1) button'); console.log('europe', JSON.stringify(await check())); await p.screenshot({ path: `${OUT}/sw-x-eu.png` })
await clickSel('.bs-book'); await p.screenshot({ path: `${OUT}/sw-x-book.png` }); console.log('book', await p.evaluate(() => !!document.querySelector('.bs-bk')))
await clickSel('.bs-bk-x'); console.log('book closed', await p.evaluate(() => !document.querySelector('.bs-bk')))
await clickSel('.bs-home'); await wait(2600); await p.screenshot({ path: `${OUT}/sw-x-open.png` }); console.log('open x', JSON.stringify(await check()))
console.log('errs', JSON.stringify(errs))
await b.close()
