/* 30 Sep: middle dot and bullet counter. Loads each page at 1440x900, removes the .bmws admin bar,
   counts U+00B7 and U+2022 in body textContent and in ::before/::after content, and lists page and console errors.
   usage: node tools/nodots-0930.mjs [live|more|all|dynamic|/route ...] [--ctx] */
import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:5177'
const LIVE = ['/', '/about', '/about/history', '/about/commitment', '/about/esg', '/services', '/services/all', '/services/epc-construction', '/services/tool-installation', '/services/energy-management',
  '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery', '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects', '/projects/0', '/projects/5', '/projects/11', '/projects/14', '/news', '/news/penang-branch-office-opening', '/news/featured-in-the-star', '/careers', '/careers/role/IAQ-ENG-01', '/contact', '/global-presence', '/policies', '/shortlist', '/lp/semiconductor']
const GATED = ['/investors', '/portal/codex', '/portal/newsroom', '/portal/careers', '/portal/projects', '/portal/downloads', '/portal/booth', '/portal/direction', '/portal/signature', '/portal/models', '/codex']
const MORE = ['/investors', '/exhibition', '/about/leadership', '/portal', '/codex', '/semicon', '/booth/screen']
import fs from 'fs'
const rd = f => fs.readFileSync(new URL('../src/data/' + f, import.meta.url), 'utf8')
const DYN = [...Array(18).keys()].map(i => '/projects/' + i)
  .concat((rd('news.js').match(/slug: *'[^']+'/g) || []).map(s => '/news/' + s.split("'")[1]))
  .concat((rd('roles.js').match(/ref: *'[^']+'/g) || []).map(s => '/careers/role/' + s.split("'")[1]))
  .concat(['/lp/semiconductor', '/lp/data-centre', '/lp/ev-battery'])
const args = process.argv.slice(2), ctx = args.includes('--ctx')
const pick = args.filter(a => !a.startsWith('--'))
const routes = pick.length === 0 || pick[0] === 'live' ? LIVE : pick[0] === 'all' ? [...LIVE, ...MORE] : pick[0] === 'more' ? MORE : pick[0] === 'dynamic' ? DYN : pick[0] === 'gated' ? GATED : pick
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
let total = 0, errTotal = 0
for (const r of routes) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  /* gated mode: open the prototype's own gates the way a signed-in session does (local flags, no passcode typed) */
  if (pick[0] === 'gated') await p.evaluateOnNewDocument(() => { try { sessionStorage.setItem('iaq-ir-gate', '1'); localStorage.setItem('iaq.cms.session.v1', '1') } catch (e) {} })
  const errs = []
  p.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 140)))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)) })
  try { await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 }) } catch (e) { errs.push('nav: ' + String(e).slice(0, 80)) }
  await new Promise(res => setTimeout(res, 1200))
  const out = await p.evaluate(async (ctx) => {
    window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 500)); window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 300))
    document.querySelectorAll('.bmws').forEach(e => e.remove())
    const RX = /[·•∙⋅]/g
    const t = document.body.textContent
    const text = (t.match(RX) || []).length
    const hits = []
    if (ctx) {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let n; while ((n = w.nextNode())) { if (RX.test(n.nodeValue)) { const el = n.parentElement; hits.push((el.tagName + '.' + (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className)).slice(0, 50) + ' | ' + n.nodeValue.trim().slice(0, 120)) } RX.lastIndex = 0 }
    }
    let pseudo = 0; const ph = []
    for (const el of document.body.querySelectorAll('*')) for (const ps of ['::before', '::after']) { const c = getComputedStyle(el, ps).content; if (c && c !== 'none' && /[·•∙⋅]/.test(c)) { pseudo++; if (ph.length < 8) ph.push(el.tagName + '.' + String(el.className).slice(0, 40) + ps + ' ' + c) } }
    let attr = 0; const ah = []
    for (const el of document.body.querySelectorAll('[title],[placeholder],[alt],[aria-label]')) for (const a of ['title', 'placeholder', 'alt', 'aria-label']) { const v = el.getAttribute(a); if (v && /[\u00b7\u2022]/.test(v)) { attr++; if (ah.length < 5) ah.push(a + '=' + v.slice(0, 80)) } }
    return { text, pseudo, hits, ph, attr, ah }
  }, ctx)
  /* same-origin frames (the home page's 3D viewer): scroll it into view first so the frame mounts */
  let frame = 0; const fh = []
  if (p.frames().length > 1 || await p.$('.db3-frame, iframe')) {
    await p.evaluate(() => { const f = document.querySelector('iframe'); if (f) f.scrollIntoView({ block: 'center' }) })
    await new Promise(res => setTimeout(res, 6000))
    for (const f of p.frames()) { if (f === p.mainFrame()) continue
      try { const r2 = await f.evaluate(() => { const t = document.body ? document.body.textContent : ''; const m = t.match(/[\u00b7\u2022]/g) || []; const s = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/[\u00b7\u2022]/.test(n.nodeValue) && s.length < 6) s.push(n.nodeValue.trim().slice(0, 90)); return { n: m.length, s, url: location.pathname, nodots: !!window.__iaqNoDots } }); frame += r2.n; fh.push(r2) } catch (e) { fh.push({ err: String(e).slice(0, 80) }) } }
  }
  total += out.text + out.pseudo + out.attr + frame; errTotal += errs.length
  console.log(`${r.padEnd(38)} text ${String(out.text).padStart(3)}  pseudo ${String(out.pseudo).padStart(2)}  attr ${out.attr}  frame ${frame}  errors ${errs.length}`)
  if (out.ah.length) out.ah.forEach(h => console.log('    [attr] ' + h))
  fh.forEach(f => { if (f.err || f.n || ctx) console.log('    [frame] ' + JSON.stringify(f)) })
  if (ctx) { out.hits.forEach(h => console.log('    ' + h)); out.ph.forEach(h => console.log('    [pseudo] ' + h)) }
  if (errs.length) errs.slice(0, 5).forEach(e => console.log('    ! ' + e))
  await p.close()
}
console.log('TOTAL dots', total, 'errors', errTotal)
await b.close()
