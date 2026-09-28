import http from 'http'; import fs from 'fs'; import path from 'path'
import puppeteer from 'puppeteer-core'
const ROOT = process.argv[2], PORT = +(process.env.ZPORT || 8791)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf' }
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); let f = path.join(ROOT, p); if (p.endsWith('/')) f = path.join(f, 'index.html')
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { if (path.extname(p)) { r.writeHead(404); return r.end() } f = path.join(ROOT, 'index.html') }
  r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r) }).listen(PORT)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 280000)
const routes = ['/', '/services', '/services/epc-construction', '/services/tool-installation', '/services/energy-management', '/about', '/careers', '/contact']
const out = []
for (const u of routes) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  const errs = [], fails = []
  p.on('pageerror', e => errs.push(e.message.slice(0, 120))); p.on('console', m => { if (m.type() === 'error' && !/AudioContext|pointer-lock/.test(m.text())) errs.push(m.text().slice(0, 120)) })
  p.on('requestfailed', q => { if (!/\.mp4|net::ERR_ABORTED/.test(q.url() + (q.failure() || {}).errorText)) fails.push(q.url().replace('http://localhost:' + PORT, '') + ' ' + (q.failure() || {}).errorText) })
  p.on('response', r => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url().replace('http://localhost:' + PORT, '')) })
  await p.goto('http://localhost:' + PORT + u, { waitUntil: 'load', timeout: 60000 }).catch(e => errs.push('goto ' + e.message.slice(0, 80)))
  await new Promise(r => setTimeout(r, 2500))
  const H = await p.evaluate(() => document.documentElement.scrollHeight).catch(() => 0); for (let y = 0; y < H; y += 900) { await p.evaluate(y => window.scrollTo(0, y), y).catch(() => {}); await new Promise(r => setTimeout(r, 90)) }
  await new Promise(r => setTimeout(r, 800))
  const info = await p.evaluate(() => ({ path: location.pathname, h1: (document.querySelector('h1') || {}).textContent?.slice(0, 50), docW: document.documentElement.scrollWidth })).catch(() => ({}))
  out.push({ u, ...info, errs: errs.length, fails: fails.length, e1: errs[0], f1: fails[0] }); await p.close()
}
/* LOADERCHECK: the home loader, open to lift, on the built copy */
{ const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:' + PORT + '/', { waitUntil: 'domcontentloaded' }); const t0 = Date.now(), log = []
  for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => { const l = document.getElementById('loader'); return l ? l.className + '|' + (document.getElementById('ldPct') || {}).textContent + '|' + getComputedStyle(l).display : 'none' }).catch(() => 'err'); if (!log.length || log[log.length - 1][1] !== s.replace(/\d+%/, '')) log.push([Date.now() - t0, s.replace(/\d+%/, '')]); if (/none$/.test(s) && log.some(x => /flex/.test(x[1]))) break; await new Promise(r => setTimeout(r, 100)) }
  console.log('loader', JSON.stringify(log)); await p.close() }
/* BARCHECK: the section bar on the built copy, desktop and phone */
for (const [w, h] of [[1440, 900], [375, 812]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:' + PORT + '/services', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
  await p.evaluate(() => document.querySelector('.sm-works').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200))
  const down = await p.evaluate(() => { const s = document.querySelector('.ssb').getBoundingClientRect(), n = document.querySelector('.nav').getBoundingClientRect(), hh = document.querySelector('.sm-works h2').getBoundingClientRect(); return { bar: Math.round(s.top), navBottom: Math.round(n.bottom), h2Top: Math.round(hh.top), barBottom: Math.round(s.bottom) } })
  await p.evaluate(() => window.scrollBy(0, -300)); await new Promise(r => setTimeout(r, 900))
  const up = await p.evaluate(() => { const s = document.querySelector('.ssb').getBoundingClientRect(), n = document.querySelector('.nav').getBoundingClientRect(); return { bar: Math.round(s.top), navBottom: Math.round(n.bottom) } })
  console.log('bar', w, JSON.stringify({ down, up })); await p.close()
}
console.log(out.map(o => `${o.u} -> ${o.path} | ${o.h1} | w${o.docW} | err ${o.errs}${o.e1 ? ' (' + o.e1 + ')' : ''} | fail ${o.fails}${o.f1 ? ' (' + o.f1 + ')' : ''}`).join('\n'))
await b.close(); srv.close(); process.exit(0)
