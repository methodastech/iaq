import puppeteer from 'puppeteer-core'
const B = 'http://localhost:5177'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function open(route, vp, reduce = false) {
  const p = await browser.newPage(); await p.setViewport(vp)
  if (reduce) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto(B + route, { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1500); return p
}
/* 1. home weight, desktop, motion on */
let p = await open('/', { width: 1440, height: 900 })
const res = await p.evaluate(() => performance.getEntriesByType('resource').map(r => [Math.round((r.transferSize || r.encodedBodySize) / 1024), r.name.replace(location.origin, '')]).sort((a, b) => b[1] - a[1]).sort((a, b) => b[0] - a[0]))
console.log('HOME total KB', res.reduce((a, r) => a + r[0], 0), 'requests', res.length); console.log(res.slice(0, 16).map(r => `  ${String(r[0]).padStart(6)}K ${r[1]}`).join('\n'))
await p.close()
/* 2. mobile hero + globe tags, motion on, with the review bar and without */
p = await open('/', { width: 390, height: 844, isMobile: true, hasTouch: true })
const m1 = await p.evaluate(() => { const h = document.querySelector('.hero h1').getBoundingClientRect(), n = document.querySelector('nav').getBoundingClientRect(); return { h1Top: Math.round(h.top), navBottom: Math.round(n.bottom), hidden: h.top < n.bottom } })
await p.evaluate(() => { document.querySelector('.topbar')?.remove(); document.documentElement.style.setProperty('--tbh', '0px') }); await sleep(400)
const m2 = await p.evaluate(() => { const h = document.querySelector('.hero h1').getBoundingClientRect(), n = document.querySelector('nav').getBoundingClientRect(); return { h1Top: Math.round(h.top), navBottom: Math.round(n.bottom), hidden: h.top < n.bottom } })
console.log('MOBILE HERO with bar', JSON.stringify(m1), 'without bar', JSON.stringify(m2))
await p.evaluate(() => document.querySelector('#story').scrollIntoView()); await sleep(2500)
const tags = await p.evaluate(() => { const txt = [...document.querySelectorAll('#story p, #story .gstat')].map(e => e.getBoundingClientRect()); const hits = []; for (const t of document.querySelectorAll('.ld-tag, .globe-tag')) { const r = t.getBoundingClientRect(); if (!r.width) continue; for (const x of txt) if (r.left < x.right && r.right > x.left && r.top < x.bottom && r.bottom > x.top) { hits.push(t.textContent.trim()); break } } return { tagsOverText: hits, tagCount: document.querySelectorAll('.ld-tag, .globe-tag').length } })
console.log('MOBILE GLOBE TAGS', JSON.stringify(tags))
await p.screenshot({ path: process.argv[2] + '/probe-mobile-story.png' })
await p.close()
/* 3. scramble under reduced motion */
p = await open('/', { width: 1440, height: 900 }, true); await sleep(2500)
const sc = await p.evaluate(() => [...document.querySelectorAll('[data-scramble]')].slice(0, 8).map(e => e.textContent.trim()).concat([...document.querySelectorAll('nav .nav-links a, nav a')].slice(0, 8).map(a => a.textContent.trim())))
console.log('REDUCED MOTION TEXTS', JSON.stringify(sc)); await p.close()
/* 4. unknown project id */
p = await open('/projects/999', { width: 1440, height: 900 })
console.log('UNKNOWN PROJECT', JSON.stringify(await p.evaluate(() => ({ title: document.title, h1: document.querySelector('h1')?.textContent.trim().slice(0, 80), text: document.body.innerText.slice(0, 0) })))); await p.close()
/* 5. lazy images paint live */
for (const [route, sel] of [['/', '.ig-card img'], ['/services', '.un-card img'], ['/contact', '.off-ph img']]) {
  p = await open(route, { width: 1440, height: 900 })
  await p.evaluate(async sel => { for (const el of document.querySelectorAll(sel)) { el.scrollIntoView(); await new Promise(r => setTimeout(r, 250)) } }, sel); await sleep(1500)
  const r = await p.evaluate(sel => [...document.querySelectorAll(sel)].map(i => (i.complete && i.naturalWidth > 0 ? 'ok' : 'MISSING ') + i.getAttribute('src').split('/').pop()), sel)
  console.log(route, sel, JSON.stringify(r)); await p.close()
}
await browser.close()
