import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const cdp = await p.createCDPSession(); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 6 * 1024 * 1024 / 8 * 10, uploadThroughput: 2 * 1024 * 1024 })
await p.goto('http://localhost:61862/', { waitUntil: 'domcontentloaded', timeout: 120000 })
await p.waitForSelector('#build3d', { timeout: 60000 }); await new Promise(r => setTimeout(r, 1500))
await p.evaluate(() => { const l = document.getElementById('loader'); if (l && window.__iaqLoaderDismiss) window.__iaqLoaderDismiss() })
await new Promise(r => setTimeout(r, 900))
await p.evaluate(() => { const s = document.getElementById('build3d'); scrollTo(0, s.getBoundingClientRect().top + scrollY) })
const t0 = Date.now(); const log = []; let k = 0; let doneAt = null
while (Date.now() - t0 < 40000) {
  const s = await p.evaluate(() => { const l = document.querySelector('.db3-load'); return { pct: (l.querySelector('.db3-pct') || {}).textContent, t: (l.querySelector('.db3-load-t') || {}).textContent, st: (l.querySelector('.db3-st') || {}).textContent, done: l.classList.contains('is-done'), k: l.style.getPropertyValue('--k') } })
  const last = log[log.length - 1]; if (!last || last.pct !== s.pct || last.done !== s.done) { log.push({ ms: Date.now() - t0, ...s }); if ([2, 6, 10].includes(log.length) || s.pct === '100%' && !log.some(x => x.shot100)) { await p.screenshot({ path: `${out}/db3-load-${log.length}.png`, captureBeyondViewport: false }); if (s.pct === '100%') log[log.length - 1].shot100 = true } }
  if (s.done && !doneAt) { doneAt = Date.now() - t0; await new Promise(r => setTimeout(r, 1000)); await p.screenshot({ path: `${out}/db3-load-after.png`, captureBeyondViewport: false }); break }
  await new Promise(r => setTimeout(r, 120))
}
console.log(JSON.stringify({ errs, doneAt, steps: log.length, first: log.slice(0, 4), last: log.slice(-5) }))
await b.close()
