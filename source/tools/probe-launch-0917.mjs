import puppeteer from 'puppeteer-core'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const ROOT = path.resolve('dist-launch'); const PORT = 4177
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.glb': 'model/gltf-binary' }
const srv = http.createServer((req, res) => { let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html'); res.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(res) }).listen(PORT)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const routes = ['/', '/about', '/services', '/services/epc-construction', '/services/tool-installation', '/markets/semiconductor', '/news', '/careers', '/careers/culture', '/careers/role/iaq-eng-01', '/contact', '/policies', '/about/commitment']
const out = []
for (const u of routes) {
  const errs = []; const h = e => errs.push(String(e).slice(0, 90)); p.on('pageerror', h); const c = m => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)) }; p.on('console', c)
  const bad = []; const rq = r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().split('/').slice(3).join('/').slice(0, 60)) }; p.on('response', rq)
  await p.goto('http://localhost:' + PORT + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
  const info = await p.evaluate(() => ({ h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), slots: document.querySelectorAll('.pg-slot, .pg-slot-tag').length, blank: (document.querySelector('#root')?.innerText || '').length < 200, admin: !!document.querySelector('.bmws') }))
  out.push([u, info.h1, info.blank ? 'BLANK' : '', 'slots:' + info.slots, info.admin ? 'ADMINBAR' : '', errs.slice(0, 2).join('|'), bad.slice(0, 3).join('|')])
  p.off('pageerror', h); p.off('console', c); p.off('response', rq)
}
const pdf = await p.goto('http://localhost:' + PORT + '/docs/certificates/IAQ-ISO-9001-2015-certificate.pdf'); out.push(['pdf', pdf.status(), pdf.headers()['content-type']])
console.log(out.map(r => r.join('  ')).join('\n'))
await b.close(); srv.close()
