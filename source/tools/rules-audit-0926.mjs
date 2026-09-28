/* IAQ graphic rules audit · 26 Sep 2026.
   Loads every public route, walks the page so reveals and lazy media fire, then checks every visible element (and its
   ::before and ::after) against Bazil's IAQ graphic rules (memory: iaq-graphic-rules, iaq-design-elements-rule):
     vertical-line    no vertical line, ever (borders left/right, thin tall bars)
     short-dash       no short dash or small stripe flag
     grey-line        lines are red (white on red); no thin grey, blue or black line
     light-line       a white or light line on a dark ground (reviewed separately)
     outline-box      a thin non-red outline round a box
     gradient(-radial) gradients only in rare cases; no organic radial bloom
     yellow           no yellow anywhere
     rounded / round  square corners; square texture, not round
     heavy-type       nothing 700 or heavier
     mono-words       no mono for words
     photo-filter     photos in colour, no filter or blend
     overlay-on-photo no tint laid over a photo
     type-on-visual   no type set over a photo or a video
     warm-photo       photos with a yellow cast (mean colour warmer than neutral)
   Each finding names the stylesheet rule that sets it: Vite injects every CSS file as a style tag carrying
   data-vite-dev-id, so the file is known; inline styles are reported as inline.
   Usage: node tools/rules-audit-0926.mjs <outdir> [base]   (base defaults to the dev server) */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const OUT = process.argv[2]; const BASE = (process.argv[3] || 'http://localhost:57375').replace(/\/$/, '')
const ONLY = process.argv[4] ? process.argv[4].split(',') : null
fs.mkdirSync(OUT, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/leadership', '/about/esg', '/global-presence',
  '/services', '/services/all', '/services/design', '/services/procurement', '/services/construction', '/services/commissioning',
  '/services/maintenance', '/services/epc-construction', '/services/process-critical-utilities', '/services/tool-installation',
  '/services/energy-management', '/markets', '/markets/semiconductor', '/markets/data-centre', '/markets/ev-battery',
  '/markets/photovoltaics', '/markets/district-cooling', '/markets/bio-lifescience', '/markets/food-beverage',
  '/projects', '/news', '/careers', '/careers/culture', '/contact', '/investors', '/policies', '/exhibition', '/semicon', '/shortlist']

/* approved by Bazil and kept: the delivery ring's discs and track ("a core element"), the hero scene bars ("bars and name"),
   the footer's stacked 3D logo layers (a logo, not a photo). Icon glyphs drawn with bars (the FAQ plus) are not dashes. */
const ALLOW = /\blpn-|\blp-trk|\blp-flow|\blp-arc|\bhs-c\b|\bhero-scenes|\bflogo3d|\bfldepth|\bglance\.gr\b|\blpx-band\b/   /* + the ring's red arc; the glance and ring-band grey fades Bazil asked for on 24 and 25 Sep */
const DETECT = function (ALLOWSRC) {
  const ALLOW = new RegExp(ALLOWSRC)
  const doc = document, W = window, out = []
  const rgba = c => { if (!c) return null; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } }
  const hsl = c => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 } return { h, s, l } }
  const isRed = c => { const { h, s, l } = hsl(c); return (h >= 340 || h <= 16) && s > .45 && l > .22 && l < .72 }
  const isWhite = c => c.r > 232 && c.g > 232 && c.b > 232
  const isYellow = c => { const { h, s, l } = hsl(c); return h >= 38 && h <= 66 && s > .45 && l > .28 && l < .86 }
  const vis = c => c && c.a > .12
  const faint = c => c && c.a > .05
  const hex = c => c ? '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') + (c.a < 1 ? '/' + (+c.a).toFixed(2) : '') : ''
  const px = v => parseFloat(v) || 0
  const own = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim()
  const hasText = el => /[A-Za-z]{2,}/.test(own(el))
  const path = el => { const parts = []; let e = el; for (let i = 0; i < 4 && e && e !== doc.body; i++) { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (e.classList && e.classList.length) s += '.' + [...e.classList].slice(0, 2).join('.'); parts.unshift(s); e = e.parentElement } return parts.join(' > ') }
  const bgOf = el => { let e = el; while (e && e !== doc.documentElement) { const c = rgba(W.getComputedStyle(e).backgroundColor); if (vis(c) && c.a > .5) return c; e = e.parentElement } return { r: 255, g: 255, b: 255, a: 1 } }
  const onRed = el => isRed(bgOf(el))
  const isForm = el => /^(input|textarea|select|option)$/i.test(el.tagName)
  const track = el => { const pa = el.parentElement; if (!pa) return false; const ps = W.getComputedStyle(pa), pr = pa.getBoundingClientRect(), r = el.getBoundingClientRect(); return (vis(rgba(ps.backgroundColor)) || ps.backgroundImage !== 'none') && pr.height <= 10 && pr.width > r.width + 8 }
  const skip = el => el.closest('.bmws, [data-audit-skip], .db3-frame')
  function sources(el, pseudo, props) {
    const res = []
    const inl = el.getAttribute && el.getAttribute('style')
    if (!pseudo && inl && props.some(p => p && inl.includes(p))) res.push('inline · ' + path(el))
    const walk = (rules, src) => { for (const ru of rules) {
      if (ru.cssRules && !ru.selectorText) { if (ru.media && !W.matchMedia(ru.media.mediaText).matches) continue; walk(ru.cssRules, src); continue }
      if (!ru.selectorText || !ru.style) continue
      for (const s0 of ru.selectorText.split(',')) { const s = s0.trim(); const hasP = /::?(before|after)\b/.test(s)
        if (!!pseudo !== hasP) continue
        if (pseudo && !new RegExp('::?' + pseudo.replace('::', '') + '\\b').test(s)) continue
        let ok = false; try { ok = el.matches(s.replace(/::?(before|after)\b/g, '') || '*') } catch (e) {}
        if (ok && props.some(p => p && ru.style.getPropertyValue(p))) { res.push(src + ' :: ' + s.slice(0, 90)); break } } } }
    for (const sh of doc.styleSheets) { let rules; try { rules = sh.cssRules } catch (e) { continue }
      const node = sh.ownerNode, src = (node && node.dataset && node.dataset.viteDevId || sh.href || 'style tag').replace(/^.*\/iaq website\//, '').replace(/^https?:\/\/[^/]+\//, '')
      walk(rules, src) }
    return res.slice(-2)
  }
  function add(rule, el, pseudo, detail, props) { if (ALLOW.test(path(el))) return; out.push({ rule, sel: path(el) + (pseudo || ''), text: (el.innerText || own(el) || '').trim().replace(/\s+/g, ' ').slice(0, 48), detail, src: sources(el, pseudo, props) }) }
  const LINE_PROPS = s => ['border-' + s, 'border-' + s + '-color', 'border-' + s + '-width', 'border-' + s + '-style', 'border', 'border-color', 'border-width', 'border-style', 'border-block', 'border-inline', 'border-block-' + (s === 'top' ? 'start' : 'end'), 'border-inline-' + (s === 'left' ? 'start' : 'end')]
  for (const el of doc.body.querySelectorAll('*')) {
    if (skip(el)) continue
    const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) continue
    const cs = W.getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue
    const tag = el.tagName.toLowerCase(), svgChild = el instanceof W.SVGElement && tag !== 'svg'
    for (const pseudo of ['', '::before', '::after']) {
      if (pseudo && svgChild) continue
      const s = pseudo ? W.getComputedStyle(el, pseudo) : cs
      if (pseudo && (s.content === 'none' || s.content === 'normal' || s.display === 'none')) continue
      const w = pseudo ? px(s.width) : r.width, h = pseudo ? px(s.height) : r.height
      const bg = rgba(s.backgroundColor), bgi = s.backgroundImage || 'none'
      if (!svgChild) {
        if (bgi.includes('gradient(')) add(/radial/.test(bgi) ? 'gradient-radial' : 'gradient', el, pseudo, bgi.replace(/\s+/g, ' ').slice(0, 100), ['background', 'background-image'])
        const sides = ['Top', 'Right', 'Bottom', 'Left'].map(k => ({ k, w: px(s['border' + k + 'Width']), c: rgba(s['border' + k + 'Color']), st: s['border' + k + 'Style'] })).map(x => ({ ...x, on: x.w >= .5 && x.st !== 'none' && faint(x.c) }))
        if (sides.every(x => x.on)) { const c = sides[0].c; if (!isRed(c) && !isForm(el) && sides[0].w <= 2) add('outline-box', el, pseudo, sides[0].w + 'px ' + hex(c), ['border', 'border-color', 'box-shadow', 'outline']) }
        else for (const x of sides) {
          if (!x.on || x.w > 4) continue
          if (x.k === 'Left' || x.k === 'Right') { if ((pseudo ? h >= 10 || s.height === 'auto' : r.height >= 12)) add('vertical-line', el, pseudo, x.k.toLowerCase() + ' ' + x.w + 'px ' + hex(x.c), LINE_PROPS(x.k.toLowerCase())) }
          else if (!isRed(x.c) && !(isWhite(x.c) && onRed(el)) && !isForm(el) && (pseudo || r.width >= 40)) add(isWhite(x.c) || hsl(x.c).l > .8 && hsl(bgOf(el)).l < .35 ? 'light-line' : 'grey-line', el, pseudo, x.k.toLowerCase() + ' ' + x.w + 'px ' + hex(x.c), LINE_PROPS(x.k.toLowerCase()))
        }
        const filled = vis(bg) || (bgi !== 'none' && !bgi.includes('url('))
        if (w > 0 && w <= 4 && h >= 14 && filled) add('vertical-line', el, pseudo, 'bar ' + Math.round(w) + 'x' + Math.round(h) + ' ' + (vis(bg) ? hex(bg) : 'gradient'), ['background', 'background-color', 'background-image', 'width'])
        if (h > 0 && h <= 3 && w >= 40 && faint(bg) && !isRed(bg) && !track(el) && !(isWhite(bg) && onRed(el))) add(isWhite(bg) || hsl(bg).l > .8 && hsl(bgOf(el.parentElement || el)).l < .35 ? 'light-line' : 'grey-line', el, pseudo, 'bar ' + Math.round(w) + 'x' + Math.round(h) + ' ' + hex(bg), ['background', 'background-color', 'height'])
        const glyph = r.width <= 28 && r.height <= 28
        if (h > 0 && h <= 5 && w >= 6 && w < 40 && filled && !track(el) && !glyph) add('short-dash', el, pseudo, Math.round(w) + 'x' + Math.round(h) + ' ' + (vis(bg) ? hex(bg) : 'gradient'), ['width', 'background', 'background-color', 'height'])
      }
      for (const [prop, val, gate] of [['color', s.color, !pseudo && hasText(el)], ['background-color', s.backgroundColor, true], ['border-top-color', s.borderTopColor, px(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none'], ['border-left-color', s.borderLeftColor, px(s.borderLeftWidth) > 0 && s.borderLeftStyle !== 'none'], ['fill', s.fill, el instanceof W.SVGElement], ['stroke', s.stroke, el instanceof W.SVGElement && s.stroke !== 'none']]) {
        if (!gate) continue; const c = rgba(val); if (c && vis(c) && isYellow(c)) add('yellow', el, pseudo, prop + ' ' + hex(c), [prop, prop === 'background-color' ? 'background' : prop.startsWith('border') ? 'border' : ''])
      }
      if (!svgChild && s.boxShadow && s.boxShadow !== 'none') { const m = s.boxShadow.match(/rgba?\([^)]+\)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/g) || []; for (const g of m) { const c = rgba(g), blur = parseFloat(g.split(/px\s+/)[2]); if (c && c.a > .2 && blur >= 12 && hsl(c).s > .4) { add('glow', el, pseudo, g.slice(0, 60), ['box-shadow']); break } } }
      if (pseudo || svgChild) continue
      const br = px(s.borderTopLeftRadius)
      if (br >= 2 && (vis(bg) || px(s.borderTopWidth) > 0 || tag === 'img' || tag === 'video' || tag === 'button')) add(br >= Math.min(r.width, r.height) / 2 - 1 ? 'round' : 'rounded', el, '', Math.round(br) + 'px on ' + Math.round(r.width) + 'x' + Math.round(r.height), ['border-radius'])
      if ((tag === 'img' || tag === 'video') && (s.filter !== 'none' || s.mixBlendMode !== 'normal')) add('photo-filter', el, '', s.filter + ' / ' + s.mixBlendMode, ['filter', 'mix-blend-mode'])
      if (hasText(el)) {
        const fw = +s.fontWeight, fam = s.fontFamily.split(',')[0].replace(/"/g, '')
        if (fw >= 700) add('heavy-type', el, '', fw + ' ' + fam, ['font-weight', 'font'])
        if (/mono|courier|consolas|menlo/i.test(fam) && /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(own(el))) add('mono-words', el, '', fam, ['font-family', 'font'])
      }
    }
  }
  return out
}

/* the viewport passes: type laid over a photo or a video, and tints laid over photos */
const STACK = function () {
  const W = window, out = []
  const rgba = c => { const m = (c || '').match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } }
  const hex = c => c ? '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') + (c.a < 1 ? '/' + (+c.a).toFixed(2) : '') : ''
  const path = el => { const parts = []; let e = el; for (let i = 0; i < 4 && e && e !== document.body; i++) { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (e.classList && e.classList.length) s += '.' + [...e.classList].slice(0, 2).join('.'); parts.unshift(s); e = e.parentElement } return parts.join(' > ') }
  const isMedia = e => /^(img|video|picture)$/i.test(e.tagName) || /url\(/.test(W.getComputedStyle(e).backgroundImage)
  const pinned = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const p = W.getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true } return false }
  const H = innerHeight
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('.bmws') || pinned(el)) continue
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim(); if (!/[A-Za-z]{3,}/.test(t)) continue
    const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > H) continue
    const cs = W.getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue
    const x = Math.min(innerWidth - 2, Math.max(1, r.left + Math.min(r.width, 40) / 2)), y = Math.min(H - 2, Math.max(1, r.top + r.height / 2))
    const stack = document.elementsFromPoint(x, y); const i = stack.indexOf(el); if (i < 0) continue
    const m = stack.slice(i + 1).find(isMedia)
    if (m && !el.contains(m)) out.push({ rule: 'type-on-visual', sel: path(el), text: t.slice(0, 48), detail: 'over ' + m.tagName.toLowerCase() + ' ' + path(m).split(' > ').pop() })
  }
  for (const m of document.querySelectorAll('img,video')) {
    const r = m.getBoundingClientRect(); if (r.width * r.height < 40000 || r.bottom < 0 || r.top > H) continue
    const stack = document.elementsFromPoint(r.left + r.width / 2, Math.min(H - 2, Math.max(1, r.top + r.height / 2))); const i = stack.indexOf(m); if (i <= 0) continue
    for (const e of stack.slice(0, i)) { const s = W.getComputedStyle(e), c = rgba(s.backgroundColor), er = e.getBoundingClientRect()
      if (er.width * er.height < r.width * r.height * .6 || pinned(e)) continue
      if ((c && c.a > .08 && c.a < .97) || /gradient\(/.test(s.backgroundImage)) out.push({ rule: 'overlay-on-photo', sel: path(e), text: '', detail: (c && c.a > .08 ? hex(c) : '') + ' ' + (s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 60) : '') + ' over ' + (m.currentSrc || m.src || '').split('/').pop() }) }
  }
  return out
}

/* the mean colour of each photograph, for a yellow cast */
const WARM = async function () {
  const out = []
  for (const im of document.querySelectorAll('img')) {
    const src = im.currentSrc || im.src; if (!/\.(jpe?g|webp|png|avif)(\?|$)/i.test(src) || im.naturalWidth < 300 || /logo|icon|badge|cert|mark/i.test(src)) continue
    try { await im.decode().catch(() => {}); const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 32, 32)
      const d = x.getImageData(0, 0, 32, 32).data; let R = 0, G = 0, B = 0, n = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; R += d[i]; G += d[i + 1]; B += d[i + 2]; n++ }
      if (!n) continue; R /= n; G /= n; B /= n; const warm = ((R + G) / 2 - B) / 255
      out.push({ src: src.replace(location.origin, ''), warm: +warm.toFixed(3), mean: [R, G, B].map(Math.round) }) } catch (e) {}
  }
  return out
}

const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const VW = +(process.argv[5] || 1440)
const p = await b.newPage(); await p.setViewport({ width: VW, height: VW < 700 ? 844 : 900, isMobile: VW < 700, hasTouch: VW < 700 })
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const all = [], warm = new Map(), errs = []
p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)))
for (const route of (ONLY || ROUTES)) {
  const t0 = Date.now()
  try { await p.goto(BASE + route + (route.includes('?') ? '&' : '?') + 'nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) { console.log('nav', route, String(e).slice(0, 80)) }
  await sleep(1800)
  await p.evaluate(() => { const st = document.createElement('style'); st.textContent = '[data-reveal],.reveal,[class*="reveal"],.in,[data-rv]{opacity:1!important;transform:none!important;visibility:visible!important}'; document.head.appendChild(st) })
  const stack = []
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < Math.min(H, 40000); y += 700) { await p.evaluate(y => window.scrollTo(0, y), y); await sleep(160); stack.push(...await p.evaluate(STACK)) }
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(500)
  const found = await p.evaluate(DETECT, ALLOW.source)
  for (const w of await p.evaluate(WARM)) if (!warm.has(w.src)) warm.set(w.src, { ...w, route })
  const seen = new Set(); const uniqStack = stack.filter(f => { const k = f.rule + f.sel + f.text; if (seen.has(k)) return false; seen.add(k); return true })
  for (const f of [...found, ...uniqStack]) all.push({ route, ...f })
  console.log(route.padEnd(40), 'findings', found.length + uniqStack.length, Math.round((Date.now() - t0) / 1000) + 's')
}
fs.writeFileSync(OUT + '/findings.json', JSON.stringify(all, null, 1))
fs.writeFileSync(OUT + '/photos.json', JSON.stringify([...warm.values()].sort((a, b) => b.warm - a.warm), null, 1))
/* the summary: per rule, per source rule (or selector when the source is unknown), with the routes it appears on */
const agg = new Map()
for (const f of all) { const src = (f.src && f.src.length ? f.src[f.src.length - 1] : 'no rule found · ' + f.sel.split(' > ').slice(-2).join(' > ')); const k = f.rule + ' || ' + src
  if (!agg.has(k)) agg.set(k, { rule: f.rule, src, n: 0, routes: new Set(), sample: f.sel, detail: f.detail, text: f.text }); const a = agg.get(k); a.n++; a.routes.add(f.route) }
const rows = [...agg.values()].map(a => ({ ...a, routes: [...a.routes] })).sort((x, y) => x.rule.localeCompare(y.rule) || y.routes.length - x.routes.length)
fs.writeFileSync(OUT + '/summary.json', JSON.stringify(rows, null, 1))
const byRule = {}; for (const r of rows) { byRule[r.rule] = byRule[r.rule] || { sources: 0, hits: 0 }; byRule[r.rule].sources++; byRule[r.rule].hits += r.n }
console.log(JSON.stringify(byRule)); console.log('page errors', JSON.stringify(errs.slice(0, 5)))
await b.close()
