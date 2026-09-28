import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1, MAP fonts.gstatic.com 127.0.0.1, MAP api.fontshare.com 127.0.0.1'] })
for (const path of ['/services/epc-construction', '/services/tool-installation', '/services/energy-management', '/careers/culture', '/']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  const errs = [], fails = []
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 120)))
  p.on('response', r => { if (r.status() >= 400 && !/fonts\.|fontshare/.test(r.url())) fails.push(r.status() + ' ' + r.url().replace('http://localhost:5179', '')) })
  try { await p.goto('http://localhost:5179' + path, { waitUntil: 'networkidle0', timeout: 60000 }) } catch (e) { errs.push('GOTO ' + String(e).slice(0, 80)) }
  await new Promise(r => setTimeout(r, 1500))
  const r = await p.evaluate(() => ({ title: document.title, bar: !!document.querySelector('.bmws, #bmws-bar, .bmws-bar'), h1: (document.querySelector('h1') || {}).textContent, hero: !!document.querySelector('.un-hero-fig img, .un-hero-fig video, .cu-hero'), imgs: document.images.length, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).length, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  console.log(path.padEnd(30), JSON.stringify({ ...r, errs: [...new Set(errs)].slice(0, 4), fails: [...new Set(fails)].slice(0, 4) }))
  await p.close()
}
await b.close()
