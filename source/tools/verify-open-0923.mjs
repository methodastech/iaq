/* Verify, against the live build, the checklist items that are described concretely enough to check by machine.
   These are the br* review notes and the m18* Codex notes that were built but never ticked. */
import puppeteer from 'puppeteer-core'
const B = 'http://localhost:5177'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu'] })
const out = []
const page = async (r, fn, wait = 2200) => {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto(B + r, { waitUntil: 'networkidle0', timeout: 90000 })
  await new Promise(x => setTimeout(x, wait))
  const v = await fn(p); await p.close(); return v
}
const say = (id, ok, detail) => out.push({ id, ok, detail })

/* --- home: the delivery cycle ring (br1, br2, br3) --- */
const ring = await page('/services?noanim', p => p.evaluate(() => {
  const r = document.querySelector('.cring, .cring-wrap, [class*="cring"]')
  if (!r) return { none: true }
  const svg = r.querySelector('svg')
  const mid = r.querySelector('[class*="cring-mid"], [class*="centre"], [class*="center"]')
  const cb = mid && mid.getBoundingClientRect(), rb = r.getBoundingClientRect()
  const discs = r.querySelectorAll('[class*="cring-disc"]').length
  return { discs, ringW: Math.round(rb.width), midInside: cb ? (cb.left >= rb.left - 1 && cb.right <= rb.right + 1 && cb.top >= rb.top - 1 && cb.bottom <= rb.bottom + 1) : null, hasSvg: !!svg }
}))
say('br1', ring.midInside === true, `centre box inside the ring frame: ${ring.midInside} · discs ${ring.discs} · ring ${ring.ringW}px`)
say('br2', ring.ringW > 0 && ring.ringW <= 1000, `ring laid out on the fixed 1000 grid, rendered ${ring.ringW}px wide`)
say('br3', ring.discs === 6, `${ring.discs} discs carry the isometric cycle marks`)

/* --- nav dropdowns (br4) --- */
const nav = await page('/', async p => {
  await p.evaluate(() => { const s = document.createElement('style'); s.textContent = '.nav *{transition-duration:0s!important;animation-duration:0s!important}'; document.head.appendChild(s) })
  await p.evaluate(() => { const el = document.querySelector('.nav-has'); if (el) el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })) })
  await new Promise(x => setTimeout(x, 700))
  return p.evaluate(() => {
    const w = document.querySelector('[class*="wing"], .nav-panel, .nav-drop')
    if (!w) return { none: true }
    const cards = w.querySelectorAll('[class*="card"], a')
    const boxed = [...cards].filter(c => { const s = getComputedStyle(c); return s.borderWidth !== '0px' && parseFloat(s.borderWidth) > 1 }).length
    return { open: true, cards: cards.length, boxed }
  })
})
say('br4', nav.open === true && nav.boxed === 0, nav.none ? 'wing did not open in this probe' : `wing open, ${nav.cards} rows, ${nav.boxed} with a border over 1px`)

/* --- About (br5, br6, br7, br13) --- */
const about = await page('/about', p => p.evaluate(() => {
  const main = document.querySelector('main') || document.body
  const txt = main.innerText
  const imgs = [...main.querySelectorAll('img')].map(i => i.currentSrc || i.src)
  const hero = main.querySelector('.hero, [class*="hero"]')
  const hb = hero && hero.getBoundingClientRect()
  const lede = hero && hero.querySelector('p')
  const lb = lede && lede.getBoundingClientRect()
  const redIcons = main.querySelectorAll('[class*="ic"] svg [stroke="#EC2027"], [class*="ic"] svg [fill="#EC2027"], svg [stroke="#FF3B42"], svg [fill="#FF3B42"]').length
  const sent = txt.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
  const dupes = {}
  for (const s of sent) if (s.length > 40) dupes[s] = (dupes[s] || 0) + 1
  return {
    imgs: imgs.length, story: imgs.some(u => /story|about|hq|office|team/i.test(u)),
    ledeMid: hb && lb ? (lb.top - hb.top) / hb.height : null,
    redIcons, repeated: Object.values(dupes).filter(n => n > 1).length,
    vm: /vision/i.test(txt) && /mission/i.test(txt),
  }
}))
say('br5', about.imgs > 0, `${about.imgs} images on About`)
say('br6', about.repeated === 0, `${about.repeated} sentences over 40 chars appear more than once`)
say('br7', about.ledeMid !== null && about.ledeMid > 0.25 && about.ledeMid < 0.8, `hero lede sits ${about.ledeMid === null ? '?' : (about.ledeMid * 100).toFixed(0) + '%'} down the hero`)
say('br13', about.vm && about.redIcons > 0, `vision and mission present: ${about.vm} · ${about.redIcons} red icon parts`)

/* --- Contact (br8, br10) --- */
const contact = await page('/contact', p => p.evaluate(() => {
  const main = document.querySelector('main') || document.body
  const form = main.querySelector('form')
  return {
    formIcons: form ? form.querySelectorAll('svg').length : -1,
    fields: form ? form.querySelectorAll('input, select, textarea').length : -1,
    flags: main.querySelectorAll('[class*="flag"], img[src*="flag"]').length + (main.innerText.match(/🇲🇾|🇸🇬|🇩🇪|🇮🇳|🇸🇪|🇺🇸|🇮🇪/g) || []).length,
    map: !!main.querySelector('canvas, [class*="map"]'),
  }
}))
say('br8', contact.formIcons > 0, `${contact.formIcons} icons in the enquiry form, ${contact.fields} fields`)
say('br10', contact.flags >= 5, `${contact.flags} country flags on the office cards`)
say('br9', contact.map, `map present: ${contact.map} (the RED HQ BUILDING is still an inference to confirm with IAQ)`)

/* --- closing band (br12) --- */
const band = await page('/', p => p.evaluate(() => {
  const cb = document.querySelector('.close3d, [class*="closing"], footer')
  const logos = document.querySelectorAll('footer img[alt*="IAQ"], footer [class*="logo"], .close3d [class*="logo"]').length
  return { h: cb ? Math.round(cb.getBoundingClientRect().height) : -1, logos }
}))
say('br12', band.logos <= 1, `closing band ${band.h}px tall, ${band.logos} logo`)

/* --- home hero market rail (m18t) --- */
const hero = await page('/?noanim', p => p.evaluate(() => ({
  tiles: document.querySelectorAll('.hmk-iso li').length,
  rail: !!document.querySelector('.hmk-rail, [class*="rail"]'),
})))
say('m18t', false, `SUPERSEDED: the live rail was replaced by the seven-mark row (${hero.tiles} tiles). Re-word, do not tick`)

/* --- primary button (m18s) --- */
const btn = await page('/', p => p.evaluate(() => {
  const a = [...document.querySelectorAll('a')].find(x => /start a project/i.test(x.textContent))
  if (!a) return { none: true }
  const s = getComputedStyle(a)
  return { tt: s.textTransform, fs: s.fontSize, radius: s.borderRadius, arrow: /→|›|>/.test(a.textContent) }
}))
say('m18s', btn.tt === 'none' && !btn.arrow, `text-transform ${btn.tt}, ${btn.fs}, radius ${btn.radius}, arrow ${btn.arrow}`)

console.log('ITEM   OK    DETAIL')
for (const o of out) console.log(`${o.id.padEnd(6)} ${o.ok ? 'YES ' : 'no  '}  ${o.detail}`)
await b.close()
