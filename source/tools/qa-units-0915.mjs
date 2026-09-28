/* 15 Sep: final QA of the three business-unit pages and the Culture page: console and page errors, failed requests,
   sideways overflow, broken images, and the hero's left edge against the nav's, at five widths. */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--no-sandbox', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1, MAP fonts.gstatic.com 127.0.0.1, MAP api.fontshare.com 127.0.0.1'] })
const routes = ['/services/epc-construction', '/services/tool-installation', '/services/energy-management', '/careers/culture']
const widths = [390, 768, 1024, 1440, 1920]
const out = []
for (const w of widths) for (const path of routes) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  const errs = [], fails = []
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 160)))
  p.on('response', r => { if (r.status() >= 400 && !/fonts\.|fontshare/.test(r.url())) fails.push(r.status() + ' ' + r.url().replace('http://localhost:5177', '')) })
  try { await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 45000 }) } catch (e) { errs.push('GOTO ' + String(e).slice(0, 80)) }
  await new Promise(r => setTimeout(r, 1500))
  const r = await p.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 400)); window.scrollTo(0, 0)
    const de = document.documentElement
    const vw = de.clientWidth, sw = de.scrollWidth
    const wide = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.position !== 'fixed' && (r.right > vw + 1 || r.left < -1) && !e.closest('.flogo3d, .un-hero-fig, .nav-mega, .bmws, .dd-rail') }).slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().left) + '/' + Math.round(e.getBoundingClientRect().right))
    const badImg = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src')).slice(0, 6)
    const h1 = document.querySelector('.un-h1, .cu-h1'); const logo = document.querySelector('.nav .wordmark')
    const h1l = h1 ? Math.round(h1.getBoundingClientRect().left) : null, ll = logo ? Math.round(logo.getBoundingClientRect().left) : null
    const h1fs = h1 ? getComputedStyle(h1).fontSize : null
    const small = [...document.querySelectorAll('.un-page *, .cu-page *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 11).map(e => e.className + ' ' + getComputedStyle(e).fontSize).slice(0, 4)
    const vids = [...document.querySelectorAll('video')].map(v => ({ src: v.getAttribute('src'), ready: v.readyState, err: v.error ? v.error.code : 0 }))
    return { vw, sw, over: sw - vw, wide, badImg, h1l, ll, h1fs, small, vids, title: document.title }
  })
  out.push({ w, path, ...r, errs: [...new Set(errs)].slice(0, 5), fails: [...new Set(fails)].slice(0, 6) })
  await p.close()
}
await b.close()
for (const o of out) {
  const flag = o.over > 0 || o.wide.length || o.badImg.length || o.errs.length || o.fails.length || o.small.length || (o.h1l !== null && o.ll !== null && Math.abs(o.h1l - o.ll) > 2)
  console.log((flag ? 'FLAG ' : 'ok   ') + o.w + ' ' + o.path + ' over=' + o.over + ' h1/logo=' + o.h1l + '/' + o.ll + ' h1=' + o.h1fs + (o.wide.length ? ' wide=' + JSON.stringify(o.wide) : '') + (o.badImg.length ? ' badImg=' + JSON.stringify(o.badImg) : '') + (o.errs.length ? ' errs=' + JSON.stringify(o.errs) : '') + (o.fails.length ? ' fails=' + JSON.stringify(o.fails) : '') + (o.small.length ? ' small=' + JSON.stringify(o.small) : '') + (o.vids.length ? ' vids=' + JSON.stringify(o.vids) : ''))
}
