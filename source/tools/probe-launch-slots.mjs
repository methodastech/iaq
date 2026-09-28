import puppeteer from 'puppeteer-core'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const ROOT = path.resolve('dist-launch'); const PORT = 4178
const srv = http.createServer((req, res) => { let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html'); res.setHeader('content-type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(res) }).listen(PORT)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const out = {}
for (const u of ['/policies']) {
  await p.goto('http://localhost:' + PORT + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
  out[u] = await p.evaluate(() => ({ gslots: [...document.querySelectorAll('.gslots')].map(g => { const r = g.getBoundingClientRect(); const cs = getComputedStyle(g); return [Math.round(r.height), cs.display, cs.marginTop, [...g.children].map(c => getComputedStyle(c).display)] }), launch: document.documentElement.classList.contains('is-launch'), visible: [...document.querySelectorAll('.pg-slot, .pg-slot-tag, .un-gap, [class*="slot"]')].filter(e => { const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 }).map(e => e.className + ' :: ' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 70)), supplied: (document.body.innerText.match(/supplied by IAQ/gi) || []).length }))
}
console.log(JSON.stringify(out, null, 1))
await b.close(); srv.close()
