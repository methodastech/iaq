/* 15 Sep: what a public visitor would still see that only says what IAQ owes. Loads every public route with
   ?launchview (lib/launch.js), lists visible text matching the owed patterns with its nearest class, and
   sections that render with almost no text. Usage: node tools/probe-launchview-0915.mjs [base] */
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2] || 'http://localhost:5177'
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/esg', '/global-presence', '/services', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance',
  '/services/epc-construction', '/services/process-critical-utilities', '/services/tool-installation', '/services/energy-management', '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery',
  '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage', '/projects', '/projects/0', '/projects/5', '/projects/12', '/news', '/news/osh-week-safety-pledge-signing', '/careers', '/careers/culture', '/contact', '/policies', '/shortlist',
  '/investors', '/exhibition', '/about/leadership']
const RX = /supplied by IAQ|to be confirmed|\bTBC\b|awaiting|still to come|placeholder|representation image|draft for IAQ|concept ·|· brand method|brand method/i
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto(BASE + '/?launchview', { waitUntil: 'domcontentloaded', timeout: 60000 })
for (const r of ROUTES) {
  try { await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) {}
  await new Promise(x => setTimeout(x, 1200))
  const out = await p.evaluate(async (src) => {
    const RX = new RegExp(src, 'i')
    const H = () => document.documentElement.scrollHeight; for (let y = 0; y < H() && y < 30000; y += 900) { window.scrollTo(0, y); await new Promise(z => setTimeout(z, 40)) }
    window.scrollTo(0, 0)
    const launch = document.documentElement.classList.contains('is-launch')
    const hits = []
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (tw.nextNode()) {
      const n = tw.currentNode, t = n.textContent.trim(); if (!t || !RX.test(t)) continue
      const el = n.parentElement; if (!el || el.closest('script,style,#bmws-bar,.bmws,noscript')) continue
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
      if (!r.width || !r.height || cs.visibility === 'hidden' || el.closest('[hidden],[aria-hidden="true"]')) continue
      let hidden = false; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none' || c.opacity === '0' && e.closest('details:not([open])')) { hidden = true; break } }
      if (hidden) continue
      const host = el.closest('[class]'); hits.push((host ? host.className.toString().split(' ')[0] : el.tagName) + ' :: ' + t.slice(0, 110))
    }
    const thin = [...document.querySelectorAll('main section, .pg-sec, section')].filter(s => { const r = s.getBoundingClientRect(); return r.height > 60 && s.innerText.trim().length < 25 && !s.querySelector('img,video,canvas,svg') }).map(s => s.className.toString().slice(0, 40) + ' h=' + Math.round(s.getBoundingClientRect().height))
    const nf = !!document.querySelector('.nf, .notfound, [data-404]') || /not found|404|not here/i.test((document.querySelector('h1') || {}).textContent || '')
    return { launch, hits: [...new Set(hits)].slice(0, 25), thin: thin.slice(0, 6), nf, h1: ((document.querySelector('h1') || {}).textContent || '').slice(0, 60) }
  }, RX.source)
  console.log(`${r.padEnd(42)} launch=${out.launch} ${out.nf ? '404 ' : ''}hits=${out.hits.length}${out.thin.length ? ' thin=' + JSON.stringify(out.thin) : ''}`)
  for (const h of out.hits) console.log('     ', h)
}
await b.close()
