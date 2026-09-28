import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], TAG = process.argv[3] || 'ban'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
await p.goto('http://localhost:5177/services?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 9000))
const band = await p.evaluate(() => window.__frBand ? window.__frBand() : null)
await p.screenshot({ path: `${OUT}/${TAG}-a.png` })
const pick = await p.evaluate(() => { const el = [...document.querySelectorAll('.rx-only button, .rx-w button, [class*="rx-"] button')].find(b => /^\s*MEP/.test(b.textContent)); if (el) { el.click(); return el.className } return null })
await new Promise(r => setTimeout(r, 3500)); await p.screenshot({ path: `${OUT}/${TAG}-b.png` }); console.log('pick', pick)
const labs = await p.evaluate(() => [...document.querySelectorAll('.fr-lab')].filter(l => l.style.opacity === '1').map(l => l.textContent.trim()))
console.log(JSON.stringify({ band, labs, errs }))
await b.close(); process.exit(0)
