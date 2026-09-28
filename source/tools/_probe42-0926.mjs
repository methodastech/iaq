import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'domcontentloaded' })
const t0 = Date.now(), log = []; let shot = 0
for (let i = 0; i < 80; i++) {
  const s = await p.evaluate(() => { const l = document.getElementById('loader'); return l ? l.className + '|' + l.getAttribute('aria-valuenow') + '|' + getComputedStyle(l).display : 'gone' }).catch(() => 'err')
  log.push([Date.now() - t0, s]); if (/\|none$/.test(s)) break
  const v = parseInt((s.split('|')[1]) || '0'); if (!shot && v >= 45 && v <= 70) { shot = 1; await p.screenshot({ path: `${OUT}/ld-live-mid.png` }) }
  await new Promise(r => setTimeout(r, 100))
}
const brief = log.filter((x, i, a) => i === 0 || x[1].split('|')[0] !== a[i - 1][1].split('|')[0] || i === a.length - 1)
console.log(JSON.stringify({ brief, errs })); await b.close(); process.exit(0)
