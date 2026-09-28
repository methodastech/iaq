/* IAQ site audit crawler · 10 Sep 2026. Loads every route fresh at two viewports, records
   console errors, failed requests, headings, alt text, placeholder strings the client can see,
   overflow, weight and timing; saves a full-page screenshot and the visible text per route. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
const OUT = process.argv[2]; const BASE = process.argv[3] || 'http://localhost:5177'
const STATIC = ['/','/about','/about/history','/about/commitment','/about/leadership','/about/esg','/global-presence',
  '/services','/services/design','/services/procurement','/services/construction','/services/commissioning','/services/maintenance',
  '/services/epc-construction','/services/process-critical-utilities','/services/tool-installation','/services/energy-management',
  '/markets','/markets/semiconductor','/markets/data-centre','/markets/ev-battery','/markets/photovoltaics','/markets/district-cooling','/markets/bio-lifescience','/markets/food-beverage',
  '/projects','/news','/careers','/careers/culture','/contact','/investors','/policies','/exhibition','/shortlist','/portal','/portal/codex','/portal/downloads','/flow','/fab','/home2','/about2','/does-not-exist']
const VPS = [{ name: 'desktop', w: 1440, h: 900, mobile: false }, { name: 'mobile', w: 390, h: 844, mobile: true }]
const PH = ['supplied by iaq','placeholder','concept','brand method','tbc','awaiting content','content slot','interim','coming soon','not yet','to be confirmed','lorem','demo only','sample']
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const report = []; const discovered = new Set()
const slug = r => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'))
async function crawl(route, vp) {
  const page = await browser.newPage()
  const errs = [], warns = [], failed = [], bad = []
  page.on('console', m => { const t = m.type(); if (t === 'error') errs.push(m.text().slice(0, 300)); else if (t === 'warning') warns.push(m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 300)))
  page.on('requestfailed', r => failed.push(r.url().slice(0, 200) + ' · ' + (r.failure()?.errorText || '')))
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(0, 200)) })
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile })
  if (vp.mobile) await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const t0 = Date.now()
  let navErr = null
  try { await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) { navErr = String(e).slice(0, 200) }
  const tLoad = Date.now() - t0
  await new Promise(r => setTimeout(r, 1500))
  /* walk the page so lazy media and observers fire, then return to the top */
  await page.evaluate(async () => {
    const st = document.createElement('style'); st.textContent = '[data-reveal],.reveal,.in,[class*="reveal"]{opacity:1!important;transform:none!important;visibility:visible!important}'; document.head.appendChild(st)
    const H = () => document.documentElement.scrollHeight; let y = 0
    while (y < H() && y < 40000) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); y += 700 }
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400))
  })
  const m = await page.evaluate((PH) => {
    const txt = document.body.innerText || ''; const low = txt.toLowerCase()
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({ l: +h.tagName[1], t: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 90) }))
    let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i].l > hs[i - 1].l + 1) skips++
    const imgs = [...document.images]
    const links = [...document.querySelectorAll('a[href]')]
    const internal = [...new Set(links.map(a => a.getAttribute('href')).filter(h => /^#?\//.test(h)).map(h => h.replace(/^#/, '').split('?')[0]))]
    const external = [...new Set(links.map(a => a.getAttribute('href')).filter(h => /^https?:/.test(h)))]
    const emptyLinks = links.filter(a => { const h = a.getAttribute('href'); return h === '#' || h === '' }).length
    const nameless = [...document.querySelectorAll('a,button')].filter(el => !(el.textContent.trim() || el.getAttribute('aria-label') || el.getAttribute('title') || el.querySelector('img[alt]:not([alt=""])'))).length
    const ph = {}; for (const p of PH) { const c = low.split(p).length - 1; if (c) ph[p] = c }
    const small = [...document.querySelectorAll('body *')].filter(el => { if (!el.childNodes.length) return false; const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2); if (!own) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.fontSize) < 11 }).length
    const nav = performance.getEntriesByType('navigation')[0]; const res = performance.getEntriesByType('resource')
    const bytes = res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0)
    const words = txt.split(/\s+/).filter(Boolean).length
    const sentences = txt.split(/[.!?]\s/).filter(s => s.trim().length > 20)
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 32).length
    return {
      title: document.title, metaDesc: document.querySelector('meta[name="description"]')?.content?.slice(0, 120) || null,
      h1: hs.filter(h => h.l === 1).map(h => h.t), headings: hs.length, skips, headingList: hs.slice(0, 60),
      imgs: imgs.length, imgNoAlt: imgs.filter(i => !i.hasAttribute('alt')).length, imgBroken: imgs.filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src')).slice(0, 8),
      links: links.length, internal, external, emptyLinks, nameless,
      ph, dashes: (txt.match(/[—–]/g) || []).length, bangs: (txt.match(/!/g) || []).length,
      words, longSentences, height: document.documentElement.scrollHeight, sections: document.querySelectorAll('section').length,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, scrollWidth: document.documentElement.scrollWidth,
      small, hasNav: !!document.querySelector('nav'), hasFooter: !!document.querySelector('footer'), ctas: links.filter(a => /#\/contact/.test(a.getAttribute('href') || '')).length,
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null, load: nav ? Math.round(nav.loadEventEnd) : null, requests: res.length, bytes, text: txt,
    }
  }, PH)
  for (const l of m.internal) if (/^\/(projects|news|lp)\/[^/]+$/.test(l)) discovered.add(l)
  const text = m.text; delete m.text
  if (vp.name === 'desktop') fs.writeFileSync(path.join(OUT, 'text', slug(route) + '.txt'), text)
  const shot = path.join(OUT, 'shots', slug(route) + '-' + vp.name + '.png')
  try { await page.screenshot({ path: shot, fullPage: m.height < 14000 }) } catch (e) { try { await page.screenshot({ path: shot, fullPage: false }) } catch (e2) {} }
  report.push({ route, vp: vp.name, navErr, tLoad, errs: [...new Set(errs)].slice(0, 10), warns: [...new Set(warns)].slice(0, 6), failed: [...new Set(failed)].slice(0, 10), bad: [...new Set(bad)].slice(0, 10), ...m })
  await page.close()
  process.stdout.write(`${vp.name.padEnd(7)} ${route.padEnd(40)} ${String(m.height).padStart(6)}px  err ${errs.length}  bad ${bad.length}  ph ${Object.values(m.ph).reduce((a, b) => a + b, 0)}\n`)
}
for (const r of STATIC) for (const vp of VPS) await crawl(r, vp)
const dyn = [...discovered]; const pick = [...dyn.filter(d => d.startsWith('/projects/')).slice(0, 3), ...dyn.filter(d => d.startsWith('/news/')).slice(0, 2), ...dyn.filter(d => d.startsWith('/lp/')).slice(0, 2)]
for (const r of pick) for (const vp of VPS) await crawl(r, vp)
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ report, discovered: dyn }, null, 1))
await browser.close(); console.log('DONE', report.length, 'captures ·', dyn.length, 'dynamic links discovered')
