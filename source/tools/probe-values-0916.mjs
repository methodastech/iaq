/* 16 Sep: the About values carousel. Shoots the section at five widths and measures whether the front
   card is clear of its neighbours, whether any text is clipped, and whether the page overflows.
   Reduced motion is NOT emulated: under it the component renders the typographic index instead.
   Usage: node tools/probe-values-0916.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const res = {}
for (const w of [1440, 1280, 1100, 860, 560, 390]) {
  const p = await b.newPage(); const m = w < 768
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 2, isMobile: m, hasTouch: m })
  const errs = []; p.on('console', e => { if (e.type() === 'error') errs.push(e.text()) }); p.on('pageerror', e => errs.push(String(e)))
  await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(async () => {
    document.querySelector('#values').scrollIntoView({ block: 'center' })
    const imgs = [...document.querySelectorAll('.vc img')]
    imgs.forEach(i => { i.loading = 'eager' })
    await Promise.all(imgs.map(i => (i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 8000) }))))
  })
  await new Promise(r => setTimeout(r, 1400))
  res[w] = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.vc-card')]
    const seen = cards.filter(c => parseFloat(getComputedStyle(c).opacity) > .05)
    const front = document.querySelector('.vc-card.is-front')
    const fr = front.getBoundingClientRect()
    const clash = seen.filter(c => c !== front).map(c => {
      const r = c.getBoundingClientRect()
      return Math.max(0, Math.min(fr.right, r.right) - Math.max(fr.left, r.left))
    })
    const clip = el => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1
    const st = document.querySelector('.vc-stage').getBoundingClientRect()
    return {
      front: front.querySelector('b').textContent,
      frontW: Math.round(fr.width), frontH: Math.round(fr.height),
      overlapIntoFront: Math.max(0, ...clash),
      visible: seen.length,
      clippedText: cards.filter(c => [...c.querySelectorAll('b,.vc-line')].some(clip)).length,
      outsideStage: seen.filter(c => { const r = c.getBoundingClientRect(); return r.left < st.left - 1 || r.right > st.right + 1 }).length,
      cardTopInStage: Math.round(fr.top - st.top), cardBottomToStage: Math.round(st.bottom - fr.bottom),
      tallestCard: Math.round(Math.max(...cards.map(c => c.querySelector('.vc-hit').getBoundingClientRect().height / (parseFloat(getComputedStyle(c).width) / c.getBoundingClientRect().width)))),
      stageH: Math.round(st.height),
      dots: [...document.querySelectorAll('.vc-dots button')].map(d => d.textContent).join(''),
      activeDot: (document.querySelector('.vc-dots button.on') || {}).textContent,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  const el = await p.$('.vg .wrap')
  await el.screenshot({ path: `${OUT}/values-${w}.png` })
  res[w].errors = errs
  await p.close()
}
console.log(JSON.stringify(res, null, 1))
await b.close()
