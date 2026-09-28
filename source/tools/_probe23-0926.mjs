import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
await p.goto('http://localhost:5177/services?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 5000))
await p.evaluate(() => document.querySelector('.sm-qs').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200))
const r = await p.evaluate(() => { const s = document.querySelector('.ssb'), i = document.querySelector('.ssb-in'); return { docW: document.documentElement.scrollWidth, shown: s.classList.contains('is-shown'), barW: Math.round(s.getBoundingClientRect().width), rowScroll: i.scrollWidth > i.clientWidth, on: (document.querySelector('.ssb-a.on') || {}).textContent, onVisible: (() => { const a = document.querySelector('.ssb-a.on'); if (!a) return null; const ar = a.getBoundingClientRect(); return ar.left >= 0 && ar.right <= innerWidth })() } })
await p.screenshot({ path: `${OUT}/sv2-phone.png` })
console.log(JSON.stringify({ ...r, errs }))
await b.close(); process.exit(0)
