/* headless verification for the newsroom bodies pass. node verify.mjs [--all] */
import { createRequire } from 'module'
import fs from 'fs'
const require = createRequire('/Users/zieel/Bazil Claude 3/Websites/iaq website/package.json')
const puppeteer = require('puppeteer-core')
const OUT = process.env.OUT || new URL('../../_reference/newsroom-scrape/shots', import.meta.url).pathname
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:5177'
const ALL = process.argv.includes('--all')
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const report = {}

async function open (url, w, h, mobile, reduced = true) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  p.on('requestfailed', r => errs.push('requestfailed: ' + r.url()))
  p.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ': ' + r.url()) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
  if (reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto(BASE + url, { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal],.cu-rv').forEach(e => { e.classList.add('in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) })
  return { p, errs }
}

/* walk the page so lazy images load, then list broken ones */
async function imgs (p) {
  await p.evaluate(async () => {
    const H = document.documentElement.scrollHeight
    for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
    window.scrollTo(0, 0)
  })
  await sleep(1000)
  return p.evaluate(async () => {
    const list = [...document.images]
    const broken = []
    for (const i of list) {
      if (i.complete && i.naturalWidth) continue
      i.scrollIntoView({ block: 'center' })
      await new Promise(r => {
        if (i.complete && i.naturalWidth) return r()
        i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 6000)
      })
      if (!i.naturalWidth) broken.push(i.currentSrc || i.src)
    }
    window.scrollTo(0, 0)
    return { total: list.length, broken }
  })
}
const overflow = p => p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))

/* element capture: load every image inside it first, and pin fixed/sticky chrome so a tall
   capture does not stitch the nav into the middle of the picture (probe only, not the site) */
async function capture (p, sel, path) {
  const el = await p.$(sel); if (!el) return
  await p.evaluate(async s => {
    const root = document.querySelector(s)
    const im = [...root.querySelectorAll('img')]
    im.forEach(i => { i.loading = 'eager' })
    await Promise.all(im.map(i => (i.complete && i.naturalWidth) ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 6000) })))
    for (const e of document.querySelectorAll('body *')) {
      const pos = getComputedStyle(e).position
      if (pos === 'fixed' || pos === 'sticky') e.style.setProperty('position', 'absolute', 'important')
    }
  }, sel)
  await sleep(300)
  await el.screenshot({ path })
}

/* characters per rendered line in the longest paragraph of the article */
const measure = p => p.evaluate(() => {
  const ps = [...document.querySelectorAll('.ar-prose p')].sort((a, b) => b.textContent.length - a.textContent.length)
  const el = ps[0]; if (!el) return null
  const lines = new Map()
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    for (let i = 0; i < n.length; i++) {
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1)
      const rect = r.getClientRects()[0]; if (!rect) continue
      const k = Math.round(rect.top)
      lines.set(k, (lines.get(k) || 0) + 1)
    }
  }
  const counts = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1])
  const full = counts.slice(0, -1)
  const cs = getComputedStyle(el)
  return { lines: counts.length, perLine: full, avg: full.length ? Math.round(full.reduce((a, c) => a + c, 0) / full.length) : null,
    fontSize: cs.fontSize, lineHeight: cs.lineHeight, colWidth: Math.round(el.getBoundingClientRect().width) }
})

/* any border on the article's own elements */
const borders = p => p.evaluate(() => [...document.querySelectorAll('.ar-head, .ar-head *, .ar-sec, .ar-sec *, .ar-pn, .ar-pn *, .ar-proj .cp-rows, .ar-proj .cp-row, .nf-more')]
  .map(e => { const s = getComputedStyle(e); const w = ['Top', 'Right', 'Bottom', 'Left'].map(d => parseFloat(s['border' + d + 'Width']) && s['border' + d + 'Style'] !== 'none' ? d : '').filter(Boolean); return w.length ? (e.className || e.tagName) + ':' + w.join('/') : '' })
  .filter(Boolean))

for (const [vw, vh, mob, tag] of [[1440, 900, false, 'd'], [390, 844, true, 'm']]) {
  /* ---- /news */
  {
    const { p, errs } = await open('/news', vw, vh, mob, false)
    await sleep(600)
    await p.screenshot({ path: `${OUT}/news-top-${tag}.png` })
    /* the rail pauses off screen by design, so bring it into view and let the scroll throw settle */
    await p.$eval('.nf-marq', e => e.scrollIntoView({ block: 'center' }))
    await sleep(2500)
    const t0 = await p.$eval('.nf-marq-track', e => e.style.transform)
    await sleep(1800)
    const t1 = await p.$eval('.nf-marq-track', e => e.style.transform)
    await (await p.$('.nf-feat')).screenshot({ path: `${OUT}/news-featured-${tag}.png` })
    const facts = await p.$$eval('.nb-facts > div', ds => ds.map(d => d.textContent.trim()))
    const groups = await p.$$eval('.nf-group', gs => gs.map(g => ({ h: g.querySelector('.nf-group-h').textContent, rows: g.querySelectorAll('.nf-row').length, more: g.querySelector('.nf-more')?.textContent || '' })))
    const counts = { featured: await p.$$eval('.nf-marq-set:first-child .nf-mc', x => x.length), latest: await p.$$eval('.nf-grid .nf-card', x => x.length) }
    const note = await p.$eval('.nf-topics .pg-note', e => e.textContent.replace(/\s+/g, ' ').trim())
    /* open the largest group */
    const btn = await p.$('.nf-more')
    let opened = null
    if (btn) {
      await btn.evaluate(e => e.click()); await sleep(400)
      opened = await p.$$eval('.nf-group', gs => gs.map(g => g.querySelectorAll('.nf-row').length))
    }
    const im = await imgs(p)
    const ovNews = await overflow(p)
    const bdNews = await borders(p)
    await capture(p, '.nf-latest', `${OUT}/news-latest-${tag}.png`)
    await capture(p, '.nf-topics', `${OUT}/news-topics-open-${tag}.png`)
    report['news-' + tag] = { ovNews, bdNews, errs, drift: [t0, t1], moved: t0 !== t1, facts, counts, groups, opened, note, imgs: im, overflow: await overflow(p), borders: await borders(p) }
    await p.close()
  }
  /* ---- articles */
  const slugs = ['house-of-love-chocolate-museum-day', 'malam-bakti-sekalung-kasih', 'lim-kar-leang-20-years', 'house-of-love-chinese-new-year-giving', 'featured-in-the-star', 'wafer-fab-facility-design-excellence', 'johor-data-centre-hub', 'ceo-message-2023', 'osh-excellence-awards-2024-gold']
  for (const s of slugs) {
    const { p, errs } = await open('/news/' + s, vw, vh, mob)
    const info = await p.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent,
      paras: document.querySelectorAll('.ar-prose p').length,
      heads: document.querySelectorAll('.ar-prose .ar-h').length,
      lists: document.querySelectorAll('.ar-prose .ar-list li').length,
      links: [...document.querySelectorAll('.ar-prose a')].map(a => a.href),
      lead: document.querySelector('.ar-lead img')?.getAttribute('src'),
      gallery: document.querySelectorAll('.ar-gallery img').length,
      slot: !!document.querySelector('.ar-col .pg-slot'),
      srclink: !!document.querySelector('.cp-srclink'),
      oldNote: /still with IAQ|old site|Read the original/i.test(document.body.innerText),
    }))
    const im = await imgs(p)
    const m = await measure(p)
    const ov = await overflow(p)
    const bd = await borders(p)
    await p.screenshot({ path: `${OUT}/article-${s}-${tag}.png` })
    if (['lim-kar-leang-20-years', 'house-of-love-chinese-new-year-giving', 'wafer-fab-facility-design-excellence', 'malam-bakti-sekalung-kasih', 'featured-in-the-star', 'johor-data-centre-hub'].includes(s)) {
      await capture(p, '.ar-sec', `${OUT}/article-${s}-body-${tag}.png`)
      await capture(p, '.ar-pnav', `${OUT}/article-${s}-pn-${tag}.png`)
    }
    report['art-' + s + '-' + tag] = { errs, ...info, imgs: im, measure: m, overflow: ov, borders: bd }
    await p.close()
  }
}

/* ---- home rail */
{
  const { p, errs } = await open('/home2', 1440, 900, false)
  await p.evaluate(() => document.querySelector('#news')?.scrollIntoView()); await sleep(1200)
  const rail = await p.$$eval('.nr-card', x => x.length).catch(() => -1)
  const railImgs = await p.$$eval('.nr-card img', xs => xs.map(i => i.getAttribute('src')))
  report.home = { errs, railCards: rail, railImgs, overflow: await overflow(p) }
  await p.close()
}

/* ---- every article, desktop */
if (ALL) {
  const src = fs.readFileSync('/Users/zieel/Bazil Claude 3/Websites/iaq website/src/data/news.js', 'utf8')
  const all = [...src.matchAll(/slug: '([^']+)'/g)].map(m => m[1])
  const bad = []
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: 1440, height: 900 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  for (const s of all) {
    const before = errs.length
    await p.goto(BASE + '/news/' + s, { waitUntil: 'networkidle0', timeout: 60000 })
    const r = await p.evaluate(async () => {
      const lead = document.querySelector('.ar-lead img')
      const gal = [...document.querySelectorAll('.ar-gallery img')]
      for (const i of [lead, ...gal]) { if (i) { i.loading = 'eager'; if (!i.complete) await new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000) }) } }
      return { h1: document.querySelector('h1')?.textContent || '', paras: document.querySelectorAll('.ar-prose p').length, lead: lead ? lead.naturalWidth : -1, gal: gal.map(i => i.naturalWidth), dash: /[—–]| - /.test(document.querySelector('.ar-prose')?.textContent || ''), excl: /!/.test((document.querySelector('.ar-prose')?.textContent || '') + document.querySelector('h1')?.textContent) }
    })
    if (!r.h1 || !r.paras || r.lead <= 0 || r.gal.some(w => !w) || r.dash || r.excl || errs.length > before) bad.push({ s, ...r, errs: errs.slice(before) })
  }
  report.all = { checked: all.length, bad }
  await p.close()
}

fs.writeFileSync(OUT + '/../verify-report.json', JSON.stringify(report, null, 1))
console.log(JSON.stringify(report, null, 1).slice(0, 20000))
await b.close()
