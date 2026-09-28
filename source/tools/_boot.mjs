// The first-paint shell (#boot in index.html): what shows before the app mounts its loader, whether the boot mark sits
// exactly where the loader's mark sits (before and after base.css brings the root zoom), and that it leaves on time.
import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
for (const [w, h, mob] of [[390, 844, true], [800, 900, false], [1440, 900, false], [2560, 1300, false]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob }); await p.setCacheEnabled(false)
  await p.evaluateOnNewDocument(() => {
    const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) }
    window.__bt = { rects: [], gone: null, loaderAt: null }; const t0 = performance.now()
    const tick = () => {
      const i = document.querySelector('#boot i'), l = document.getElementById('ldLogoFill'), now = Math.round(performance.now() - t0)
      if (i) { const r = i.getBoundingClientRect(); window.__bt.rects.push([now, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), getComputedStyle(document.documentElement).zoom]) }
      else if (window.__bt.gone === null && document.readyState !== 'loading') window.__bt.gone = now
      if (l && window.__bt.loaderAt === null) window.__bt.loaderAt = now
      if (now < 4000) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 160)) })
  const t0 = Date.now(); p.goto('http://localhost:57375/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  for (const [i, t] of [[0, 120], [1, 300], [2, 520]]) { await sleep(Math.max(0, t - (Date.now() - t0))); try { await p.screenshot({ path: `${out}/b${w}-${i}.png` }) } catch (e) {} }
  await sleep(1400)
  const r = await p.evaluate(() => { const l = document.getElementById('ldLogoFill'); const q = l && l.getBoundingClientRect(); return { bt: window.__bt, logo: q && [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)], boot: !!document.getElementById('boot') } })
  const R = r.bt.rects; console.log(w, 'boot first', JSON.stringify(R[0]), 'boot last', JSON.stringify(R[R.length - 1]), 'n', R.length, '| loader mark', JSON.stringify(r.logo), '| loader at', r.bt.loaderAt, 'boot gone', r.bt.gone, 'still there', r.boot, '| errors', JSON.stringify(errs.slice(0, 3)))
  await p.close()
}
// another route: the shell must never show
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)))
await p.goto('http://localhost:57375/#/services', { waitUntil: 'domcontentloaded' }); const early = await p.evaluate(() => !!document.getElementById('boot'))
await sleep(1200); await p.screenshot({ path: `${out}/services.png` })
console.log('services: boot present at DOMContentLoaded', early, 'errors', JSON.stringify(errs))
await b.close()
