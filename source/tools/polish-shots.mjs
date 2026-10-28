/* 22 Oct 2026: full-page captures of every public page for the Polishing tab (old build against the new one).
   Usage: node tools/polish-shots.mjs <base> <outdir> [onlyRouteSubstring]
   Writes <slug>.webp (full page, 1440 wide), <slug>-top.webp (first screen), <slug>.json (title, headings, text, height,
   errors) and index.json. Chrome on Metal so the WebGL scenes draw. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
const [base = 'http://localhost:5177', out = '/tmp/polish', only = ''] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence',
  '/services', '/services/all', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance',
  '/services/epc-construction', '/services/process-critical-utilities', '/services/tool-installation', '/services/energy-management',
  '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects', '@project', '/news', '@article', '/careers', '/contact', '/investors', '/policies', '/exhibition', '/shortlist', '/enquiry', '/lp/project', '/semicon', '/booth/screen']
const slug = r => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900', '--autoplay-policy=no-user-gesture-required'] })
const index = []
let firstProject = null, firstArticle = null
for (let r of ROUTES) {
  if (r === '@project') { if (!firstProject) continue; r = firstProject }
  if (r === '@article') { if (!firstArticle) continue; r = firstArticle }
  if (only && !(only.includes(',') ? only.split(',').includes(r) : only.startsWith('=') ? r === only.slice(1) : r.includes(only))) continue   /* =/route for an exact match; a,b,c for a set of exact routes */
  const s = slug(r), p = await b.newPage()
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  const errs = []
  p.on('pageerror', e => errs.push('pageerror: ' + String(e.message).slice(0, 200)))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  p.on('response', x => { if (x.status() >= 400) errs.push(x.status() + ' ' + x.url().slice(0, 160)) })
  const t0 = Date.now()
  await p.goto(base + r, { waitUntil: 'networkidle2', timeout: 90000 }).catch(e => errs.push('goto: ' + e.message.slice(0, 160)))
  await new Promise(w => setTimeout(w, r === '/' ? 7000 : 2500))
  /* walk the page so observers, lazy media and reveals fire; then back to the top */
  await p.evaluate(async () => {
    const H = () => document.documentElement.scrollHeight; let y = 0
    while (y < H() && y < 60000) { window.scrollTo(0, y); await new Promise(w => setTimeout(w, 90)); y += 600 }
    await new Promise(w => setTimeout(w, 600)); window.scrollTo(0, 0); await new Promise(w => setTimeout(w, 700))
  })
  const meta = await p.evaluate(() => {
    const st = document.createElement('style'); st.id = 'polish-force'
    st.textContent = '[data-reveal],.reveal,.in,[class*="reveal"],.cxr,.vm{opacity:1!important;transform:none!important;visibility:visible!important}'
    document.head.appendChild(st)
    const hs = [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName.toLowerCase() + ' ' + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 140))
    const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
    return { title: document.title, h: hs, text: (document.body.innerText || '').replace(/\n{3,}/g, '\n\n'), height: document.documentElement.scrollHeight,
      project: links.find(h => /^\/projects\/[^/?#]+$/.test(h)) || null, article: links.find(h => /^\/news\/[^/?#]+$/.test(h)) || null }
  })
  if (!firstProject && meta.project) firstProject = meta.project
  if (!firstArticle && meta.article) firstArticle = meta.article
  try { await p.screenshot({ path: `${out}/${s}-top.webp`, type: 'webp', quality: 82 }) } catch (e) { errs.push('top shot: ' + e.message.slice(0, 120)) }
  /* Chrome wraps a capture taller than 16,384 px back to the top (and WebP stops at 16,383 a side): a taller page
     (History, the new home with its 3D runway) is captured in clipped passes and stitched to one JPEG (polish-stitch.py) */
  const ext = meta.height > 16000 ? 'jpg' : 'webp'
  try {
    if (ext === 'jpg') {
      const PASS = 8000; let i = 0
      for (let y = 0; y < meta.height; y += PASS, i++) await p.screenshot({ path: `${out}/${s}.part${i}.png`, clip: { x: 0, y, width: 1440, height: Math.min(PASS, meta.height - y) }, captureBeyondViewport: true })
      execFileSync('python3', ['tools/polish-stitch.py', out, s], { stdio: 'inherit' })
    } else await p.screenshot({ path: `${out}/${s}.webp`, type: 'webp', quality: 80, fullPage: true })
  } catch (e) { errs.push('full shot: ' + e.message.slice(0, 120)) }
  fs.writeFileSync(`${out}/${s}.json`, JSON.stringify({ url: r, ...meta, ext, errs, ms: Date.now() - t0 }, null, 1))
  index.push({ url: r, slug: s, title: meta.title, height: meta.height, ext, errs: errs.length, ms: Date.now() - t0 })
  console.log(s.padEnd(34), String(meta.height).padStart(6), 'px', String(Date.now() - t0).padStart(6), 'ms', errs.length ? 'ERR ' + errs[0] : '')
  await p.close()
}
await b.close()
let pages = index
if (only && fs.existsSync(`${out}/index.json`)) { const prev = JSON.parse(fs.readFileSync(`${out}/index.json`, 'utf8')).pages || []; pages = prev.map(x => index.find(y => y.slug === x.slug) || x); for (const y of index) if (!pages.some(x => x.slug === y.slug)) pages.push(y) }
fs.writeFileSync(`${out}/index.json`, JSON.stringify({ base, at: new Date().toISOString(), pages }, null, 1))
console.log('done', index.length, 'pages ->', out)
