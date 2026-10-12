/* The enquiries API on this computer (10 Oct 2026, "can i testing on localhost first?").

   The enquiry form (/enquiry, the /lp/ campaign pages) and the portal's Enquiries tracker talk to one plain address,
   /api/enquiries, so any host can serve it. On the dev server (npm run dev) and a local preview this plugin is that
   server, keeping every brief in source/.data/enquiries.json (outside git). On the live site, the same three calls
   are what the host's server must answer:

     POST  /api/enquiries        a brief from the form (JSON); answers { ok, id }
     GET   /api/enquiries        every brief, newest first: { items: [...] }
     PATCH /api/enquiries/:id    { status, note } for one brief; answers { ok, item }

   Never part of a build. */
import fs from 'node:fs'
import path from 'node:path'

const FILE = path.resolve('.data', 'enquiries.json')
const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost']
const FIELDS = ['name', 'company', 'email', 'phone', 'market', 'need', 'timing', 'message', 'source', 'kind', 'owner', 'page']

const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { return [] } }
const write = list => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(list, null, 2)) }
const send = (res, code, body) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(body)) }
const body = req => new Promise(ok => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e6) req.destroy() }); req.on('end', () => { try { ok(JSON.parse(d || '{}')) } catch { ok(null) } }) })

function handler (req, res, next) {
  const url = (req.url || '').split('?')[0]
  if (!url.startsWith('/api/enquiries')) return next()
  const id = decodeURIComponent(url.slice('/api/enquiries'.length).replace(/^\//, ''))
  ;(async () => {
    if (req.method === 'GET' && !id) return send(res, 200, { items: read().sort((a, b) => (a.at < b.at ? 1 : -1)) })
    if (req.method === 'POST' && !id) {
      const b = await body(req)
      if (!b || (!b.email && !b.name)) return send(res, 400, { error: 'empty' })
      const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), status: 'new', note: '' }
      for (const f of FIELDS) if (b[f] != null) item[f] = String(b[f]).slice(0, 4000)
      const list = read(); list.push(item); write(list)
      return send(res, 201, { ok: true, id: item.id })
    }
    if (req.method === 'PATCH' && id) {
      const b = await body(req) || {}
      const list = read(), it = list.find(x => x.id === id)
      if (!it) return send(res, 404, { error: 'not-found' })
      if (STATUSES.includes(b.status)) it.status = b.status
      if (typeof b.note === 'string') it.note = b.note.slice(0, 2000)
      it.updated = new Date().toISOString()
      write(list)
      return send(res, 200, { ok: true, item: it })
    }
    send(res, 405, { error: 'method' })
  })().catch(() => send(res, 500, { error: 'server' }))
}

export default function enquiriesApi () {
  return {
    name: 'iaq-enquiries-api',
    configureServer (s) { s.middlewares.use(handler) },
    configurePreviewServer (s) { s.middlewares.use(handler) },
  }
}
