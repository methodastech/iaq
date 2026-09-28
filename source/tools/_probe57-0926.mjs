import http from 'http'; import fs from 'fs'; import path from 'path'
import puppeteer from 'puppeteer-core'
const ROOT = process.argv[2], OUT = process.argv[3], PORT = 8794
const TY = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = path.join(ROOT, u); if (u.endsWith('/')) f = path.join(f, 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { if (path.extname(u)) { r.writeHead(404); return r.end() } f = path.join(ROOT, 'index.html') } r.writeHead(200, { 'Content-Type': TY[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r) }).listen(PORT)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.goto(`http://localhost:${PORT}/services`, { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 10000))
await p.screenshot({ path: OUT })
const fps = await p.evaluate(async () => { let n = 0; const t0 = performance.now(); await new Promise(r => { const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r() }; requestAnimationFrame(f) }); return Math.round(n / 2) })
console.log(JSON.stringify({ fps, errs })); await b.close(); srv.close(); process.exit(0)
