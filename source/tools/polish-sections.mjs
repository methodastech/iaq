/* 22 Oct 2026: section captures for the Polishing table. Every page is cut into its sections (the hero, each band with a
   heading, the footer), and each section is saved as its own image with its heading, its text and its place on the page,
   so the table can show one section before and after a change.
   Usage: node tools/polish-sections.mjs <base> <outdir> [route,route,...]
   Writes <outdir>/<slug>/<key>.webp and <outdir>/<slug>.json, plus <outdir>/index.json. Chrome on Metal so WebGL draws. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = '/tmp/polish-sections', only = ''] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence',
  '/services', '/services/all', '/services/epc-construction', '/services/tool-installation', '/services/energy-management',
  '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects', '@project', '/news', '@article', '/careers', '/contact', '/enquiry', '/investors', '/policies', '/exhibition', '/shortlist', '/semicon', '/booth/screen']
const slug = r => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900', '--autoplay-policy=no-user-gesture-required'] })
const index = []
let firstProject = null, firstArticle = null
const want = only ? only.split(',') : null
for (let r of ROUTES) {
  if (r === '@project') { if (!firstProject) continue; r = firstProject }
  if (r === '@article') { if (!firstArticle) continue; r = firstArticle }
  if (want && !want.includes(r)) continue
  const s = slug(r), p = await b.newPage()
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  const errs = []
  p.on('pageerror', e => errs.push('pageerror: ' + String(e.message).slice(0, 200)))
  await p.goto(base + r, { waitUntil: 'networkidle2', timeout: 90000 }).catch(e => errs.push('goto: ' + e.message.slice(0, 160)))
  await new Promise(w => setTimeout(w, r === '/' ? 7000 : 2500))
  await p.evaluate(async () => {
    const H = () => document.documentElement.scrollHeight; let y = 0
    while (y < H() && y < 60000) { window.scrollTo(0, y); await new Promise(w => setTimeout(w, 90)); y += 600 }
    await new Promise(w => setTimeout(w, 600)); window.scrollTo(0, 0); await new Promise(w => setTimeout(w, 700))
    const st = document.createElement('style'); st.id = 'polish-force'
    st.textContent = '[data-reveal],.reveal,.in,[class*="reveal"],.cxr,.vm,[data-rv]{opacity:1!important;transform:none!important;visibility:visible!important}'
    document.head.appendChild(st)
  })
  /* the sections: every header, section or footer at least 120 px tall and 600 px wide that is not inside another such
     element (the outer one is the page's own band); the fixed nav is too short to count */
  const secs = await p.evaluate(() => {
    const all = [...document.querySelectorAll('header, section, footer')].map(el => { const r = el.getBoundingClientRect(); return { el, top: r.top + scrollY, h: r.height, w: r.width } })
      .filter(x => x.h >= 120 && x.w >= 600)
    const keep = all.filter(x => !all.some(y => y !== x && y.el.contains(x.el)))
    keep.sort((a, b) => a.top - b.top)
    const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
    const seen = new Map()
    return { project: links.find(h => /^\/projects\/[^/?#]+$/.test(h)) || null, article: links.find(h => /^\/news\/[^/?#]+$/.test(h)) || null,
      sections: keep.map((x, i) => {
        const hEl = x.el.querySelector('h1, h2, h3'); const heading = hEl ? hEl.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) : ''
        const cls = (x.el.className && typeof x.el.className === 'string' ? x.el.className : '').split(/\s+/).filter(Boolean).slice(0, 2).join('.')
        let key = (heading || cls || x.el.tagName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'section'
        if (x.el.tagName === 'FOOTER') key = 'footer'
        if (x.el.tagName === 'HEADER' && i === 0) key = 'hero'
        const n = (seen.get(key) || 0) + 1; seen.set(key, n); if (n > 1) key += '-' + n
        return { i, key, heading, tag: x.el.tagName.toLowerCase(), cls, top: Math.round(x.top), height: Math.round(x.h), text: (x.el.innerText || '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 2400) }
      }) }
  })
  if (!firstProject && secs.project) firstProject = secs.project
  if (!firstArticle && secs.article) firstArticle = secs.article
  fs.mkdirSync(`${out}/${s}`, { recursive: true })
  const list = []
  for (const sec of secs.sections) {
    const file = `${s}/${String(sec.i + 1).padStart(2, '0')}-${sec.key}.webp`
    /* Chrome wraps a capture over 16,384 px; a runway section (the home 3D) is cut at 8,000 */
    const h = Math.min(sec.height, 8000)
    try { await p.screenshot({ path: `${out}/${file}`, type: 'webp', quality: 82, clip: { x: 0, y: sec.top, width: 1440, height: h }, captureBeyondViewport: true }) }
    catch (e) { errs.push('shot ' + sec.key + ': ' + e.message.slice(0, 100)); continue }
    list.push({ ...sec, img: file, shownHeight: h })
  }
  const meta = { url: r, slug: s, title: await p.title(), at: new Date().toISOString(), sections: list, errs }
  fs.writeFileSync(`${out}/${s}.json`, JSON.stringify(meta, null, 1))
  index.push({ url: r, slug: s, sections: list.length, errs: errs.length })
  console.log(s.padEnd(34), String(list.length).padStart(3), 'sections', errs.length ? 'ERR ' + errs[0] : '')
  await p.close()
}
await b.close()
let pages = index
if (want && fs.existsSync(`${out}/index.json`)) { const prev = JSON.parse(fs.readFileSync(`${out}/index.json`, 'utf8')).pages || []; pages = prev.map(x => index.find(y => y.slug === x.slug) || x); for (const y of index) if (!pages.some(x => x.slug === y.slug)) pages.push(y) }
fs.writeFileSync(`${out}/index.json`, JSON.stringify({ base, at: new Date().toISOString(), pages }, null, 1))
console.log('done', index.length, 'pages ->', out)
