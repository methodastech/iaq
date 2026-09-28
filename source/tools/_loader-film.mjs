import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const cdp = await p.createCDPSession(); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
p.goto('http://localhost:61862/', { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => {})
const t0 = Date.now(); const log = []
for (const ms of [300, 700, 1200, 1800, 2500, 3200, 4000, 5000, 6200, 7500]) {
  while (Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 30))
  const s = await p.evaluate(() => { const l = document.getElementById('loader'); if (!l) return { none: true }; return { pct: (document.getElementById('ldPct') || {}).textContent, cls: l.className, disp: getComputedStyle(l).display, op: getComputedStyle(l).opacity } }).catch(e => ({ err: String(e).slice(0, 60) }))
  log.push({ ms, ...s }); await p.screenshot({ path: `${out}/t${ms}.png`, captureBeyondViewport: false }).catch(() => {})
}
console.log(JSON.stringify({ errs, log }))
await b.close()
