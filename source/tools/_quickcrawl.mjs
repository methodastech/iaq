import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 1440), sleep = ms => new Promise(r => setTimeout(r, ms))
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence', '/services', '/services/all', '/services/design', '/services/epc-construction', '/services/process-critical-utilities', '/services/tool-installation', '/services/energy-management', '/markets', '/markets/semiconductor', '/markets/district-cooling', '/projects', '/news', '/careers', '/careers/culture', '/contact', '/investors', '/policies', '/exhibition', '/semicon', '/shortlist', '/does-not-exist']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: W < 700 ? 844 : 900, isMobile: W < 700, hasTouch: W < 700 })
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
let errs = [], bad = []
p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource: net::ERR_ABORTED/.test(m.text())) errs.push(m.text().slice(0, 140)) })
p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) bad.push(r.status() + ' ' + r.url().split('/').slice(3).join('/').slice(0, 80)) })
const out = []
for (const r of ROUTES) { errs = []; bad = []
  try { await p.goto('http://localhost:57375' + r + '?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) { out.push(r + ' NAV ' + String(e).slice(0, 60)); continue }
  await sleep(900)
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (errs.length || bad.length || ov > 1) out.push(r + ' | errors ' + JSON.stringify(errs.slice(0, 2)) + ' | bad ' + JSON.stringify(bad.slice(0, 3)) + ' | overflow ' + ov)
}
console.log(W, 'routes', ROUTES.length, 'problems', out.length); for (const o of out) console.log('  ' + o)
await b.close()
