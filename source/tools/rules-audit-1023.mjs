/* 23 Oct 2026: the walk-through rules (public/polish.html, rules 1 to 43) checked by machine on every route, so the sweep of
   the pages not yet walked starts from a list of concrete faults rather than a scroll through pictures.
   Checks: titles ending in a full stop (4), stub lines of one or two words in multi-line text (22, 23), icons in circles or
   boxed twice (24, 26, 27), dashed or dotted borders (26), tracking over .04em (16), type under 13 px (14), uppercase
   eyebrows before a heading (30), hover rules whose elements are not links or buttons (8, 26), inner banners taller than
   60% of the window (12), the breadcrumb below the banner's middle (17).
   Usage: node tools/rules-audit-1023.mjs <base> <out.json> [/route,/route,...]   (default: every page in public/polish/after/index.json) */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = 'public/polish/rules-audit.json', only] = process.argv.slice(2)
let routes = only ? only.split(',') : null
if (!routes) {
  const idx = JSON.parse(fs.readFileSync('public/polish/after/index.json', 'utf8'))
  routes = (idx.pages || []).map(p => typeof p === 'string' ? p : (p.url || p.route || p.path)).filter(Boolean)
}
routes = routes.filter(r => !/booth|portal|codex|presentation/.test(r))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const all = {}
for (const r of routes) {
  try {
    await p.goto(base + r, { waitUntil: 'networkidle2', timeout: 90000 })
  } catch (e) { all[r] = { error: String(e.message).slice(0, 120) }; continue }
  await new Promise(w => setTimeout(w, 1500))
  /* walk the page so every reveal has fired, then back to the top */
  await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise(w => setTimeout(w, 90)) } window.scrollTo(0, 0); await new Promise(w => setTimeout(w, 400)) })
  const res = await p.evaluate(() => {
    const vis = el => { const r = el.getClientRects(); if (!r.length) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && r[0].width > 0 }
    const inAdmin = el => !!el.closest('.bmws, .sa-bar, .admin-bar, [class*="bmws"]')
    const txt = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
    const path = el => { const bits = []; let e = el; while (e && e !== document.body && bits.length < 4) { bits.unshift(e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '')); e = e.parentElement } return bits.join(' > ') }
    const F = { fullstop: [], stub: [], circle: [], dashed: [], tracking: [], small: [], eyebrow: [], hover: [], banner: null, crumb: null }
    const seen = new Set()
    /* 4: a title ending in a full stop */
    for (const h of document.querySelectorAll('h1, h2, h3, h4')) { if (!vis(h) || inAdmin(h)) continue; const t = txt(h); if (/[^.]\.$/.test(t) && !/\.\.\.$/.test(t)) F.fullstop.push({ t: t.slice(0, 90), at: path(h) }) }
    /* 22, 23: a line of one or two words inside text of two lines or more (words measured one by one) */
    const lineWords = el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const lines = new Map(); let node
      while ((node = walker.nextNode())) {
        const s = node.nodeValue; const re = /\S+/g; let m
        while ((m = re.exec(s))) { const rg = document.createRange(); rg.setStart(node, m.index); rg.setEnd(node, m.index + m[0].length); const rc = rg.getClientRects()[0]; if (!rc || rc.width === 0) continue; const key = Math.round(rc.top / 4) * 4; if (!lines.has(key)) lines.set(key, []); lines.get(key).push(m[0]) }
      }
      return [...lines.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1])
    }
    for (const el of document.querySelectorAll('h1, h2, h3, p, li, dd, dt, figcaption, blockquote, .lede, .pg-lede, .pg-body, .un-lede, .mk-lede')) {
      if (!vis(el) || inAdmin(el)) continue
      if (el.querySelector('p, li, h1, h2, h3')) continue   /* measured at the leaf */
      const r = el.getBoundingClientRect(); if (r.width < 260) continue
      const t = txt(el); if (t.split(' ').length < 6) continue
      const lines = lineWords(el); if (lines.length < 2) continue
      const bad = lines.map((w, i) => ({ i, w })).filter(x => x.w.length <= 2 && x.w.join(' ').length <= 16)
      if (bad.length) { const k = path(el) + '|' + t.slice(0, 40); if (seen.has(k)) continue; seen.add(k); F.stub.push({ t: t.slice(0, 110), lines: lines.length, stub: bad.map(x => `${x.i + 1}: ${x.w.join(' ')}`), w: Math.round(r.width), at: path(el), tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 60) }) }
    }
    /* 24, 26, 27: an icon in a circle, or a box inside a box */
    for (const el of document.querySelectorAll('*')) {
      if (!vis(el) || inAdmin(el)) continue
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (r.width < 14 || r.width > 160 || r.height > 160) continue
      const round = parseFloat(cs.borderTopLeftRadius) >= Math.min(r.width, r.height) / 2 - 1
      const hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || (cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none') || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none'
      const icon = el.querySelector(':scope > svg, :scope > img, :scope > i > svg') || (el.tagName === 'SVG' ? null : null)
      if (round && hasBg && icon) {
        const inLink = !!el.closest('a, button')
        F.circle.push({ at: path(el), w: Math.round(r.width), inLink, cls: (el.className || '').toString().slice(0, 60) })
      }
      const dashed = ['Top', 'Right', 'Bottom', 'Left'].some(s => /dashed|dotted/.test(cs['border' + s + 'Style']) && parseFloat(cs['border' + s + 'Width']) > 0) || /dashed|dotted/.test(cs.outlineStyle)
      if (dashed) F.dashed.push({ at: path(el), cls: (el.className || '').toString().slice(0, 60) })
    }
    /* 16, 14: tracking and the type floor, on elements that own text */
    for (const el of document.querySelectorAll('body *')) {
      if (!vis(el) || inAdmin(el)) continue
      if (!el.childNodes || ![...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) continue
      const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize); const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing)
      const t = txt(el); if (!t) continue
      if (fs && ls / fs > 0.041) F.tracking.push({ t: t.slice(0, 50), em: +(ls / fs).toFixed(3), at: path(el) })
      if (fs && fs < 12.9) F.small.push({ t: t.slice(0, 50), px: +fs.toFixed(1), at: path(el) })
      /* 30: a short uppercase label just before a heading */
      const up = cs.textTransform === 'uppercase' || (t === t.toUpperCase() && /[A-Z]/.test(t))
      if (up && fs <= 13.5 && t.split(' ').length <= 4 && t.length <= 32) { const nx = el.nextElementSibling || (el.parentElement && el.parentElement.nextElementSibling); if (nx && /^H[1-3]$/.test(nx.tagName)) F.eyebrow.push({ t, at: path(el) }) }
    }
    /* 8, 26: hover rules whose elements are not links, buttons or inside one */
    const hov = new Map()
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules } catch (e) { continue }
      const walk = list => { for (const r of list) { if (r.cssRules) { walk(r.cssRules); continue } const st = r.selectorText; if (!st || !st.includes(':hover')) continue
        if (/bmws|sa-|admin|codex|portal|pt-|dk-|cx-|booth|expo|deck|polish|wf-/.test(st)) continue
        for (let sel of st.split(',')) { sel = sel.trim(); if (!sel.includes(':hover')) continue
          const bare = sel.replace(/::?[a-z-]+(\([^)]*\))?/g, '').replace(/\s+$/, '').replace(/[>+~]\s*$/, '').trim(); if (!bare) continue
          let els = []; try { els = [...document.querySelectorAll(bare)] } catch (e) { continue }
          const nonLink = els.filter(e => vis(e) && !e.closest('a, button, [role="button"], label, summary, input, select, textarea, [onclick], [tabindex]') && getComputedStyle(e).cursor !== 'pointer')
          if (nonLink.length) hov.set(sel, (hov.get(sel) || 0) + nonLink.length) } } }
      walk(rules)
    }
    F.hover = [...hov.entries()].map(([sel, n]) => ({ sel: sel.slice(0, 120), n }))
    /* 12, 17: the first dark banner's height, and where the breadcrumb sits in it */
    const first = [...document.querySelectorAll('main > *, #root > * > *, body > div > *')].find(el => vis(el) && el.getBoundingClientRect().top < 200 && el.getBoundingClientRect().height > 200 && el.tagName !== 'HEADER' && el.tagName !== 'NAV')
    if (first) { const r = first.getBoundingClientRect(); const cs = getComputedStyle(first); F.banner = { at: path(first), h: Math.round(r.height), vh: +(r.height / innerHeight).toFixed(2), bg: cs.backgroundColor }
      const crumb = first.querySelector('nav[aria-label*="rumb" i], .crumbs, .vb-crumbs, .pg-crumbs, ol.crumb, .breadcrumb'); if (crumb && vis(crumb)) { const c = crumb.getBoundingClientRect(); F.crumb = { top: Math.round(c.top - r.top), share: +((c.top - r.top) / r.height).toFixed(2) } } }
    return { title: document.title, F }
  })
  all[r] = res
  const F = res.F
  console.log(r.padEnd(36), `fullstop ${F.fullstop.length}  stub ${F.stub.length}  circle ${F.circle.length}  dashed ${F.dashed.length}  tracking ${F.tracking.length}  small ${F.small.length}  eyebrow ${F.eyebrow.length}  hover ${F.hover.length}  banner ${F.banner ? F.banner.vh + 'vh' : '-'}  crumb ${F.crumb ? F.crumb.share : '-'}`)
}
fs.writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), base, pages: all }, null, 1))
console.log('->', out)
await b.close()
