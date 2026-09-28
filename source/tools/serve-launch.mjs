/* a dependency-free static server for dist-launch, with the SPA rewrite the real host will have.
   npx is not usable here (the npm cache is root-owned), so the launch bundle gets its own server. */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const ROOT = path.resolve(process.argv[3] || 'dist-launch')
const PORT = +(process.env.PORT || process.argv[2] || 5189)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml', '.glb': 'model/gltf-binary' }
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  let f = path.join(ROOT, url)
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
  if (!fs.existsSync(f)) f = path.join(ROOT, 'index.html')          /* the host's rewrite rule */
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
}).listen(PORT, () => console.log('launch bundle on http://localhost:' + PORT + ' from ' + ROOT))
