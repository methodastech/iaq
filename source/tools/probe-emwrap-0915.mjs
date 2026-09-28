/* 15 Sep: unbroken emphasis audit. For every h1/h2/h3 holding an em, count the em's line boxes
   (getClientRects) and its overflow past the heading, at six widths, on every public route.
   One page per route, resized in place. Usage: node tools/probe-emwrap-0915.mjs <out.json> [routes,comma] */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [OUT, ONLY] = process.argv.slice(2)
const BASE = 'http://localhost:5177'
const STATIC = ['/','/about','/about/history','/about/commitment','/about/leadership','/about/esg','/global-presence',
  '/services','/services/design','/services/procurement','/services/construction','/services/commissioning','/services/maintenance',
  '/services/epc-construction','/services/process-critical-utilities','/services/tool-installation','/services/energy-management',
  '/markets','/markets/semiconductor','/markets/data-centre','/markets/ev-battery','/markets/photovoltaics','/markets/district-cooling','/markets/bio-lifescience','/markets/food-beverage',
  '/projects','/news','/careers','/careers/culture','/contact','/investors','/policies','/exhibition','/shortlist','/portal','/flow','/fab','/home2','/about2','/does-not-exist',
  '/news/penang-branch-office-opening','/news/prime-minister-business-roundtable-france','/news/ims-global-standards-commitment',
  '/projects/0','/projects/5','/projects/11']
const ROUTES = ONLY ? ONLY.split(',') : STATIC
const WIDTHS = [1920, 1440, 1280, 1100, 768, 390]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const res = {}
for (const r of ROUTES) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: 1920, height: 1000 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  try { await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) { errs.push('GOTO ' + String(e).slice(0, 100)) }
  await new Promise(x => setTimeout(x, 1200))
  res[r] = { errs, widths: {} }
  for (const w of WIDTHS) {
    await p.setViewport({ width: w, height: 1000 }); await new Promise(x => setTimeout(x, 700))
    res[r].widths[w] = await p.evaluate(() => {
      const out = []
      document.querySelectorAll('h1 em, h2 em, h3 em').forEach(em => {
        const h = em.closest('h1,h2,h3'); const hr = h.getBoundingClientRect(); const er = em.getBoundingClientRect()
        if (!hr.width || !er.width || getComputedStyle(h).visibility === 'hidden') return
        const rects = [...em.getClientRects()].filter(q => q.width > 0.5)
        /* merge fragments on the same line (nested inline children) */
        const tops = []; rects.forEach(q => { if (!tops.some(t => Math.abs(t - q.top) < 4)) tops.push(q.top) })
        out.push({ h: h.tagName + (h.className ? '.' + String(h.className).split(' ').join('.') : ''), text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
          em: em.textContent.trim(), lines: tops.length, over: Math.round(er.right - hr.right), fs: getComputedStyle(h).fontSize, ws: getComputedStyle(em).whiteSpace })
      })
      return { items: out, sw: document.documentElement.scrollWidth, iw: innerWidth }
    })
  }
  const fails = Object.entries(res[r].widths).map(([w, v]) => [w, v.items.filter(i => i.lines > 1 || i.over > 1).length, v.sw > v.iw ? 'OVERFLOW ' + v.sw : '']).filter(x => x[1] || x[2])
  console.log(r, 'errs', errs.length, fails.length ? JSON.stringify(fails) : 'ok')
  await p.close()
}
fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); await b.close()
