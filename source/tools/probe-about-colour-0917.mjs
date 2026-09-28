/* 17 Sep: About page colour pass. Shoots /about section by section at desktop and phone,
   reads console errors, overflow, and exercises the values carousel.
   Usage: node tools/probe-about-colour-0917.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const res = {}
const SECTIONS = ['.ab-hero', '#story', '#vision', '#values', '#proof', '#contact']
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); const m = w < 768
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: m, hasTouch: m })
  const errs = []; p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 160)) }); p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2200))
  const r = { sections: {}, errors: errs }
  // walk the page so reveals fire
  const total = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(h * 0.7)) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 220)) }
  await p.evaluate(() => window.scrollTo(0, 0)); await new Promise(r => setTimeout(r, 600))
  for (const s of [...SECTIONS, 'extra']) {
    const list = s === 'extra' ? await p.evaluate(() => [...document.querySelectorAll('main > section, body > section, #root > section, #root > * > section')].map(e => e.id || e.className.split(' ')[0])) : null
    if (s === 'extra') { r.sectionList = list; continue }
    const info = await p.evaluate(async s => {
      const e = document.querySelector(s); if (!e) return null
      e.scrollIntoView({ block: 'start' }); await new Promise(r => setTimeout(r, 900))
      const b = e.getBoundingClientRect()
      return { top: Math.round(b.top + scrollY), h: Math.round(b.height), bg: getComputedStyle(e).backgroundColor }
    }, s)
    if (!info) { r.sections[s] = 'missing'; continue }
    // shoot in viewport-height slices
    const slices = Math.ceil(info.h / h)
    for (let k = 0; k < slices; k++) {
      await p.evaluate((y) => window.scrollTo(0, y), info.top + k * h)
      await new Promise(r => setTimeout(r, 900))
      await p.screenshot({ path: `${OUT}/${w}-${s.replace(/[.#]/g, '')}-${k}.png`, captureBeyondViewport: false })
    }
    r.sections[s] = info
  }
  r.overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  r.proof = await p.evaluate(() => [...document.querySelectorAll('.ab-proof-cap')].map(c => c.textContent.trim().replace(/\s+/g, ' ')))
  r.images = await p.evaluate(() => [...document.querySelectorAll('#story img, #values img, #proof img')].map(i => [i.getAttribute('src').split('/').pop(), i.complete && i.naturalWidth > 0]))
  r.storyText = await p.evaluate(() => { const e = document.querySelector('#story .mline'); const cs = getComputedStyle(e); return { color: cs.color, size: cs.fontSize, lines: Math.round(e.getBoundingClientRect().height / parseFloat(cs.lineHeight)) } })
  // carousel
  await p.evaluate(async () => { document.querySelector('#values').scrollIntoView({ block: 'center' }) }); await new Promise(r => setTimeout(r, 900))
  r.carouselBefore = await p.evaluate(() => (document.querySelector('.vc-dots button.on') || {}).textContent)
  const next = await p.$('.vc-arw[aria-label="Next value"]'); if (next) { await next.click(); await new Promise(r => setTimeout(r, 1100)) }
  r.carouselAfter = await p.evaluate(() => ({ dot: (document.querySelector('.vc-dots button.on') || {}).textContent, front: (document.querySelector('.vc-card.is-front b') || {}).textContent }))
  await p.screenshot({ path: `${OUT}/${w}-values-next.png`, captureBeyondViewport: false })
  res[w] = r
  await p.close()
}
console.log(JSON.stringify(res, null, 1))
await b.close()
