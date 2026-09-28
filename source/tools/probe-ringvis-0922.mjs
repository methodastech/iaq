/* 22 Sep (Bazil: "no cutting the visual"). For each of the six ring stages: where the clip's measured subject box lands
   inside the centre box after the CSS zoom (air top/bottom as a fraction of the box height, and left/right against the
   side feather's opaque core 10% to 90%), the clip's currentTime sampled for the construct window, the ring and box
   sizes, and a screenshot per stage. Usage: node tools/probe-ringvis-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const BOX = [[.25,.111,.838,.861],[.259,.067,.791,.828],[.234,.044,.791,.867],[.275,.05,.706,.85],[.131,.067,.847,.889],[.234,.044,.784,.967]]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: m, hasTouch: m })
  await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await wait(6000)
  await p.evaluate(() => { const s = document.querySelector('.lp-orbit'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 90) })
  await wait(2500)
  /* the ring advances on its own every few seconds, so the geometry is read with the slide transitions and the
     entrance animations switched off, clip by clip, whichever one happens to be in play */
  await p.addStyleTag({ content: '.lpv{transform:none!important;transition:none!important}.lpv-in{animation:none!important;transform:none!important}.lp-vis{animation:none!important}' })
  await wait(300)
  const rows = await p.evaluate(B => [...document.querySelectorAll('#lpBubbles .lpv')].map(el => {
    const i = +el.dataset.i, v = el.querySelector('video'), bx = el.getBoundingClientRect(), vr = v.getBoundingClientRect(), st = el.querySelector('.lpv-still').getBoundingClientRect()
    const o = document.querySelector('.lp-orbit').getBoundingClientRect(), trk = document.querySelector('.lp-trk').getBoundingClientRect()
    return { i, airTop: +((vr.top + B[i][1] * vr.height - bx.top) / bx.height).toFixed(3), airBottom: +((bx.bottom - (vr.top + B[i][3] * vr.height)) / bx.height).toFixed(3),
      left: +((vr.left + B[i][0] * vr.width - bx.left) / bx.width).toFixed(3), right: +((vr.left + B[i][2] * vr.width - bx.left) / bx.width).toFixed(3),
      stillMatches: Math.abs(st.top - vr.top) < 0.6 && Math.abs(st.width - vr.width) < 0.6, orbit: Math.round(o.width) + 'x' + Math.round(o.height), ring: Math.round(trk.width), box: Math.round(bx.width) + 'x' + Math.round(bx.height) }
  }), BOX)
  /* construct: start it the way the page does, then push the playhead to just before the window's end and watch it wrap */
  const ts = await p.evaluate(async () => {
    const v = document.querySelector('.lpv[data-i="2"] video'), out = []
    v.currentTime = 8.1; await v.play().catch(() => {})
    for (let k = 0; k < 14; k++) { await new Promise(r => setTimeout(r, 120)); out.push(+v.currentTime.toFixed(2)) }
    return out
  })
  const band = await p.evaluate(() => { let e = document.querySelector('.lp-orbit'), bg = ''; while (e && (!bg || bg === 'rgba(0, 0, 0, 0)')) { bg = getComputedStyle(e).backgroundColor; e = e.parentElement } return bg })
  console.log(w, JSON.stringify(rows)); console.log('  construct playhead', JSON.stringify(ts), 'min', Math.min(...ts), 'max', Math.max(...ts), 'band bg', band, 'overflowX', await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'errs', JSON.stringify(errs))
  await p.close()
}
await b.close()
