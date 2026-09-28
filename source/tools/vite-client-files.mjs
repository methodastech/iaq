/* Client files (25 Sep 2026). Serves the client store, which lives OUTSIDE the repo (Client info/IAQ), on the
   dev and preview servers only, under /client-files/. Nothing here enters public/ or any build: the page and its
   thumbnails live in _reference/client-files/ (tools/client-files-index.py, tools/client-files-page.py) and the
   originals stay where they are, read only. Range requests are honoured so the videos seek.
   Bazil: "so we need to at least store it and show it in this tab". */
import fs from 'node:fs'
import path from 'node:path'

const STORE = '/Users/zieel/Bazil Claude 3/Client info/IAQ'
const REF = path.resolve(process.cwd(), '_reference/client-files')
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', svg: 'image/svg+xml',
  mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', pdf: 'application/pdf', html: 'text/html; charset=utf-8',
  json: 'application/json', css: 'text/css', js: 'text/javascript', txt: 'text/plain; charset=utf-8', md: 'text/plain; charset=utf-8', zip: 'application/zip' }

function serve(req, res, base, rel) {
  const file = path.resolve(base, rel)
  if (file !== base && !file.startsWith(base + path.sep)) { res.statusCode = 403; return res.end('forbidden') }
  let st
  try { st = fs.statSync(file) } catch { res.statusCode = 404; return res.end('not found') }
  if (st.isDirectory()) { res.statusCode = 404; return res.end('not a file') }
  const ext = path.extname(file).slice(1).toLowerCase()
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Cache-Control', 'no-cache')
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
  if (m && (m[1] || m[2])) {
    let start = m[1] ? parseInt(m[1], 10) : Math.max(0, st.size - parseInt(m[2], 10))
    let end = m[1] && m[2] ? parseInt(m[2], 10) : st.size - 1
    if (start >= st.size || end >= st.size || start > end) { res.statusCode = 416; res.setHeader('Content-Range', `bytes */${st.size}`); return res.end() }
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${st.size}`)
    res.setHeader('Content-Length', end - start + 1)
    if (req.method === 'HEAD') return res.end()
    return fs.createReadStream(file, { start, end }).pipe(res)
  }
  res.statusCode = 200
  res.setHeader('Content-Length', st.size)
  if (req.method === 'HEAD') return res.end()
  fs.createReadStream(file).pipe(res)
}

function handler(req, res, next) {
  let u
  try { u = decodeURIComponent((req.url || '').split('?')[0]) } catch { return next() }
  if (u === '/client-files.html' || u === '/client-files' || u === '/client-files/') return serve(req, res, REF, 'index.html')
  if (u.startsWith('/client-files/thumbs/')) return serve(req, res, path.join(REF, 'thumbs'), u.slice('/client-files/thumbs/'.length))
  if (u.startsWith('/client-files/proxies/')) return serve(req, res, path.join(REF, 'proxies'), u.slice('/client-files/proxies/'.length))
  if (u.startsWith('/client-files/raw/')) return serve(req, res, STORE, u.slice('/client-files/raw/'.length))
  next()
}

export default function clientFiles() {
  return {
    name: 'iaq-client-files',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}
