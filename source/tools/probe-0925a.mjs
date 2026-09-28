// 25 Sep morning: home hero and record band, About story, History banner and records, Services cycle and pins
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] })
const open = async (url, w = 1440, h = 900) => { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)) }); await p.setViewport({ width: w, height: h }); await p.goto(url, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500)); return [p, errs] }
const shot = async (p, sel, file, wait = 900) => { const el = await p.$(sel); if (!el) return false; await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, wait)); await el.screenshot({ path: `${OUT}/${file}` }); return true }
{ const [p, errs] = await open('http://localhost:5177/')
  const m = await p.evaluate(() => { const q = s => document.querySelector(s); const h = q('.hero h1'); const ls = [...h.querySelectorAll('.hl')].map(e => e.getBoundingClientRect()); const gaps = ls.slice(1).map((r, i) => Math.round(r.top - ls[i].bottom)); const cs = getComputedStyle(h); const em = h.querySelector('em').getClientRects().length
    const g = q('.glance.gr'); const cv = q('#globeCv'); const tags = [...document.querySelectorAll('.gr .globe-tag')].map(t => { const r = t.getBoundingClientRect(); return [t.textContent.trim().slice(0, 9), Math.round(r.left), Math.round(r.right)] })
    return { h1: h.innerText.replace(/\n/g, ' / '), lineHeight: cs.lineHeight, lineGaps: gaps, emRects: em, punct: /[,.]/.test(h.innerText), bg: getComputedStyle(g).backgroundImage.slice(0, 70), canvas: [Math.round(cv.getBoundingClientRect().width), Math.round(cv.getBoundingClientRect().height)], section: [Math.round(g.getBoundingClientRect().width), Math.round(g.getBoundingClientRect().height)], tags, tagsPast: tags.filter(t => t[2] > innerWidth || t[1] < 0).length, overflow: document.documentElement.scrollWidth - innerWidth } })
  console.log('home', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  await p.screenshot({ path: `${OUT}/home-hero.png` }); await shot(p, '.glance.gr', 'home-record.png', 2500); await p.close() }
{ const [p, errs] = await open('http://localhost:5177/about')
  const m = await p.evaluate(() => { const q = s => document.querySelector(s); const st = q('.manifesto'); const v = st.querySelector('video'); return { storyBg: getComputedStyle(st).backgroundColor, video: v ? v.currentSrc.split('/').pop() : null, playing: v ? !v.paused : null, eyebrow: !!st.querySelector('.eyebrow'), lineColor: getComputedStyle(st.querySelector('.mline')).color, proofStrip: !!q('.ab-proof'), vmHead: q('.vm-h')?.innerText, overflow: document.documentElement.scrollWidth - innerWidth } })
  console.log('about', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  await shot(p, '.manifesto', 'about-story.png', 1500); await p.close() }
{ const [p, errs] = await open('http://localhost:5177/about/history')
  const m = await p.evaluate(() => { const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]; const vb = q('.vb'); const v = vb && vb.querySelector('video')
    return { banner: !!vb, video: v ? v.currentSrc.split('/').pop() : null, playing: v ? !v.paused : null, h1: q('.vb h1')?.innerText, bannerH: vb && Math.round(vb.getBoundingClientRect().height), greyBand: !!q('.pg-sec-tight'), icons: qa('.cp-tile .cp-ic').length, iconW: q('.cp-tile .cp-ic')?.getBoundingClientRect().width, cpAct: !!q('.cp-act'), readBar: !!q('.hx-read-bar'), readN: q('.hx-read-n')?.innerText, overflow: document.documentElement.scrollWidth - innerWidth } })
  console.log('history', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  await p.screenshot({ path: `${OUT}/history-banner.png` }); await shot(p, '.cp-tiles', 'history-records.png'); await shot(p, '.hx-body', 'history-reading.png', 1800)
  await p.evaluate(() => { const els = document.querySelectorAll('.hx-item'); els[3].scrollIntoView({ block: 'center' }) }); await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: `${OUT}/history-reading-4.png` })
  console.log('history live', JSON.stringify(await p.evaluate(() => ({ y: document.querySelector('.hx-read-y').innerText, n: document.querySelector('.hx-read-n').innerText, live: [...document.querySelectorAll('.hx-item[data-live="1"]')].map(e => e.dataset.i), past: document.querySelectorAll('.hx-item[data-past="1"]').length })))); await p.close() }
{ const [p, errs] = await open('http://localhost:5177/services')
  const m = await p.evaluate(async () => { const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const red = q('.cyc-red'); const cs = getComputedStyle(red); const base = !!q('.cyc-redbase')
    const v = q('.sm-map-dark .fx-view').getBoundingClientRect(); const stage = q('.sm-map-dark .sm-map-stage').getBoundingClientRect()
    const u = qa('.sm-map .rx-n.n-u'); u[0].click(); await new Promise(r => setTimeout(r, 300)); if (!u[0].classList.contains('me')) u[0].click(); await new Promise(r => setTimeout(r, 1800))
    const lit = qa('.sm-map-dark .fx-pin.lit'); const ic = lit.filter(e => e.querySelector('.fx-pin-ic') && e.querySelector('.fx-pin-ic').getBoundingClientRect().width > 8).length
    const col = lit[0] && getComputedStyle(lit[0].querySelector('i')).backgroundColor
    const r = lit.map(e => e.querySelector('b').getBoundingClientRect()); let ov = 0; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].left < r[j].right && r[j].left < r[i].right && r[i].top < r[j].bottom && r[j].top < r[i].bottom) ov++
    const y = qa('.sm-map .rx-n.n-y'); y[1].click(); await new Promise(r => setTimeout(r, 300)); if (!y[1].classList.contains('me')) y[1].click(); await new Promise(r => setTimeout(r, 1500)); const lit2 = q('.sm-map-dark .fx-pin.lit i'); const col2 = lit2 && getComputedStyle(lit2).backgroundColor
    return { cycleReturn: { dash: cs.strokeDasharray, anim: cs.animationName, base }, view: [Math.round(v.left), Math.round(v.width), Math.round(v.height)], stageLeft: Math.round(stage.left), litPins: lit.length, pinIcons: ic, unitPinColour: col, systemPinColour: col2, labelOverlaps: ov, overflow: document.documentElement.scrollWidth - innerWidth } })
  console.log('services', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  await p.evaluate(() => scrollTo(0, 0)); await new Promise(r => setTimeout(r, 400)); await (await p.$('.sm-map-dark')).screenshot({ path: `${OUT}/svc-banner.png` }); await shot(p, '.cyb', 'svc-cycle.png', 1500); await p.close() }
await b.close()
