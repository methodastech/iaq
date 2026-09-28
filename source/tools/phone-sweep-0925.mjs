/* Phone sweep (25 Sep 2026, Bazil: "fix bugs and make sure phone view awesome"). Every public route at 390x844 with
   mobile emulation: console and page errors, failed requests, page overflow, elements past the right edge, text
   under 11px, broken images, tap targets under 40px, and a full-page capture per route for the eye.
   Usage: node tools/phone-sweep-0925.mjs <outdir> [base] */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const OUT = process.argv[2]; const BASE = process.argv[3] || 'http://localhost:52158'
fs.mkdirSync(OUT, { recursive: true })
const ROUTES = ['/','/about','/about/history','/about/commitment','/global-presence',
  '/services','/services/design','/services/procurement','/services/construction','/services/commissioning','/services/maintenance',
  '/services/epc-construction','/services/process-critical-utilities','/services/tool-installation','/services/energy-management',
  '/markets','/markets/semiconductor','/markets/data-centre','/markets/ev-battery','/markets/photovoltaics','/markets/district-cooling','/markets/bio-lifescience','/markets/food-beverage',
  '/projects','/news','/careers','/careers/culture','/contact','/policies']
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const slug = r => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'))
const report = []
for (const route of ROUTES) {
  const page = await browser.newPage()
  const errs = [], failed = []
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 240)) })
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 240)))
  page.on('requestfailed', r => failed.push(r.url().slice(0, 160)))
  page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(0, 160)) })
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36')
  const t0 = Date.now()
  try { await page.goto(BASE + route + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) { errs.push('NAV ' + String(e).slice(0, 120)) }
  await page.evaluate(() => { try { window.__iaqLoaderDismiss && window.__iaqLoaderDismiss() } catch (e) {} })
  /* one pass down the page so lazy images and reveals fire, then back to the top */
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)) } scrollTo(0, 0) })
  await new Promise(r => setTimeout(r, 900))
  const m = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const desc = e => (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''))
    const past = []
    for (const e of document.body.querySelectorAll('*')) {
      if (e.closest('.bmws')) continue
      const r = e.getBoundingClientRect()
      if (r.width < 24 || r.height < 12) continue
      if ((r.right > vw + 2 || r.left < -2) && vis(e)) { const cs = getComputedStyle(e); if (cs.position === 'fixed' && (cs.left === '0px' || cs.right === '0px')) continue
        /* an element inside a horizontal scroller is meant to run past the edge */
        let p = e.parentElement, ok = false; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') { ok = true; break } p = p.parentElement }
        if (!ok) past.push(desc(e) + ' ' + Math.round(r.left) + '..' + Math.round(r.right)) }
    }
    const small = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let n; const seen = new Set()
    while ((n = walker.nextNode())) { const t = n.textContent.trim(); if (t.length < 3) continue; const e = n.parentElement; if (!e || e.closest('.bmws,script,style') || !vis(e)) continue
      const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 11 && !seen.has(e)) { seen.add(e); const pe = e.parentElement; small.push(fs.toFixed(1) + 'px ' + desc(e) + ' < ' + (pe ? desc(pe) : '') + ' < ' + (pe && pe.parentElement ? desc(pe.parentElement) : '') + ' "' + t.slice(0, 24) + '"') } }
    const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && vis(i) && !i.closest('.bmws')).map(i => i.getAttribute('src')?.slice(0, 80))
    const taps = [...document.querySelectorAll('a,button')].filter(e => vis(e) && !e.closest('.bmws')).filter(e => { const r = e.getBoundingClientRect(); return r.height < 32 || r.width < 32 }).map(e => desc(e) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)).slice(0, 12)
    const h1 = [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 60))
    return { overflow: document.documentElement.scrollWidth - vw, docH: document.documentElement.scrollHeight, past: past.slice(0, 12), pastN: past.length, small: small.slice(0, 40), smallN: small.length, broken, tapsN: taps.length, taps, h1, title: document.title }
  })
  try {
    const H = m.docH; const shots = []; let k = 0
    for (let y = 0; y < H && k < 16; y += 780, k++) { await page.evaluate(yy => scrollTo(0, yy), y); await new Promise(r => setTimeout(r, 260)); shots.push(await page.screenshot({ type: 'jpeg', quality: 60 })) }
    fs.writeFileSync(`${OUT}/${slug(route)}.shots.json`, JSON.stringify(shots.map(b => b.toString('base64'))))
  } catch (e) {}
  report.push({ route, ms: Date.now() - t0, errs: errs.slice(0, 6), errsN: errs.length, failed: failed.slice(0, 6), ...m })
  console.log(route.padEnd(36), 'err', String(errs.length).padStart(2), 'ovf', String(m.overflow).padStart(3), 'past', String(m.pastN).padStart(2), 'small', String(m.smallN).padStart(3), 'broken', m.broken.length, 'taps', m.tapsN, 'h1', m.h1.length)
  await page.close()
}
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1))
await browser.close()
