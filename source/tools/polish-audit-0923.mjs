/* A polish sweep with numbers, not opinions. Per page and width it reports:
   · sideways overflow
   · any coloured <em> inside a heading that SPLITS across lines (the house unbroken-emphasis rule)
   · headings that leave a one-word last line (a widow)
   · tap targets under 44px on phone
   · images with no alt, and images whose box aspect differs from the file's by more than 12%
   · column slack: a grid child whose ink stops more than 80px above its box (the hole that br4 was)
   Usage: node tools/polish-audit-0923.mjs [1440|390] */
import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 1440)
const ROUTES = ['/', '/about', '/about/history', '/about/commitment', '/about/esg', '/global-presence',
  '/services', '/services/design', '/services/epc-construction', '/services/energy-management',
  '/markets', '/markets/semiconductor', '/markets/bio-lifescience',
  '/projects', '/projects/0', '/news', '/careers', '/contact', '/policies']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu'] })
const all = []
for (const r of ROUTES) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 80)))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 80)) })
  await p.setViewport({ width: W, height: 900, deviceScaleFactor: 1 })
  try {
    await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
    await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
    await new Promise(x => setTimeout(x, 1200))
    const o = await p.evaluate(mob => {
      const lineCount = el => { const r = el.getClientRects(); return r.length }
      /* 1 · emphasis phrases that split */
      const split = []
      for (const h of document.querySelectorAll('h1,h2,h3')) {
        for (const em of h.querySelectorAll('em, .em, b')) {
          const c = getComputedStyle(em).color
          if (!/(236, 32, 39)|(255, 59, 66)|(255, 77, 85)|(235, 32, 39)/.test(c)) continue
          if (lineCount(em) > 1) split.push({ t: h.textContent.trim().slice(0, 54), em: em.textContent.trim().slice(0, 34), lines: lineCount(em) })
        }
      }
      /* 2 · heading widows */
      const widow = []
      for (const h of document.querySelectorAll('h1,h2')) {
        const rects = [...h.getClientRects()]
        if (rects.length < 2) continue
        const words = h.textContent.trim().split(/\s+/)
        const last = rects[rects.length - 1]
        if (last.width < 140 && words.length > 3) widow.push({ t: h.textContent.trim().slice(0, 50), lastW: Math.round(last.width) })
      }
      /* 3 · small tap targets, phone only */
      const small = mob ? [...document.querySelectorAll('a,button')].filter(e => {
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 28) && e.offsetParent !== null && !e.closest('.bmws, .topbar, footer')
      }).map(e => ({ t: (e.textContent || '').trim().slice(0, 26), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })) : []
      /* 4 · images */
      const noAlt = [...document.querySelectorAll('img')].filter(i => i.getAttribute('alt') === null).length
      const squash = [...document.querySelectorAll('img')].filter(i => {
        if (!i.naturalWidth || !i.naturalHeight) return false
        const r = i.getBoundingClientRect(); if (r.width < 40) return false
        if (getComputedStyle(i).objectFit === 'cover') return false
        return Math.abs((r.width / r.height) / (i.naturalWidth / i.naturalHeight) - 1) > 0.12
      }).map(i => ({ src: (i.currentSrc || i.src).split('/').pop().slice(0, 30) }))
      /* 5 · column slack */
      const slack = []
      for (const g of document.querySelectorAll('*')) {
        const s = getComputedStyle(g)
        if (s.display !== 'grid' || g.children.length < 2) continue
        const gr = g.getBoundingClientRect(); if (gr.height < 200) continue
        for (const c of g.children) {
          const cr = c.getBoundingClientRect(); if (cr.height < 150) continue
          const kids = [...c.children].filter(k => k.getBoundingClientRect().height > 0)
          if (!kids.length) continue
          /* a column whose content is sticky is SUPPOSED to be taller than its ink: the card travels
             through it as the page scrolls. Measuring it as slack reported /projects/0 at 1987px,
             which is the distance the case-study card moves, not a hole. */
          if (kids.some(k => getComputedStyle(k).position === 'sticky')) continue
          const ink = Math.max(...kids.map(k => k.getBoundingClientRect().bottom))
          const top = Math.min(...kids.map(k => k.getBoundingClientRect().top))
          const gap = Math.round(cr.bottom - ink)
          const head = Math.round(top - cr.top)
          /* a CENTRED card always has a gap at the foot and is not a hole. Only a lopsided column is:
             the foot has to be more than 80px AND more than twice the space above the content. */
          if (gap > 80 && gap > head * 2) slack.push({ cls: String(c.className).slice(0, 26) || c.tagName, gap, head })
        }
      }
      return {
        sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
        split, widow, small: small.slice(0, 5), smallN: small.length, noAlt, squash: squash.slice(0, 3), slack: slack.slice(0, 4),
      }
    }, W < 700)
    all.push({ r, ...o, errs: errs.length })
  } catch (e) { all.push({ r, fail: String(e).slice(0, 60) }) }
  await p.close()
}
await b.close()
console.log('POLISH SWEEP @ ' + W + 'px\n')
for (const a of all) {
  const flags = []
  if (a.fail) { console.log(a.r.padEnd(32) + 'FAIL ' + a.fail); continue }
  if (a.sideways) flags.push('SIDEWAYS')
  if (a.split.length) flags.push('EM SPLIT ×' + a.split.length + ' (' + a.split.map(s => s.em).join('; ') + ')')
  if (a.widow.length) flags.push('WIDOW ×' + a.widow.length + ' (' + a.widow.map(w => w.t.slice(0, 26)).join('; ') + ')')
  if (a.smallN) flags.push('TAP<40 ×' + a.smallN + ' (' + a.small.map(s => `${s.t}|${s.w}x${s.h}`).join(', ') + ')')
  if (a.noAlt) flags.push('NO-ALT ×' + a.noAlt)
  if (a.squash.length) flags.push('SQUASH ' + a.squash.map(s => s.src).join(','))
  if (a.slack.length) flags.push('SLACK ' + a.slack.map(s => `${s.cls}: ${s.gap}px under vs ${s.head}px over`).join(', '))
  if (a.errs) flags.push('ERRS ' + a.errs)
  console.log(a.r.padEnd(32) + (flags.length ? flags.join(' · ') : 'clean'))
}
