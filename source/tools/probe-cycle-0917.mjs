/* 17 Sep: the services cycle after the caption moved into stage 6. Checks the six sub-labels, that
   no stray caption is left, that nothing overlaps its neighbour and that the canvas has no dead
   band at its foot. Usage: node tools/probe-cycle-0917.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const res = {}
for (const w of [1440, 1100, 860, 390]) {
  const p = await b.newPage(); const m = w < 768
  const errs = []; p.on('console', e => { if (e.type() === 'error') errs.push(e.text()) }); p.on('pageerror', e => errs.push(String(e)))
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 2, isMobile: m, hasTouch: m })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => (document.querySelector('.cyc-canvas') || document.querySelector('.cyc-fit')).scrollIntoView({ block: 'center' }))
  await new Promise(r => setTimeout(r, 1600))
  res[w] = await p.evaluate(() => {
    const nodes = [...document.querySelectorAll('.cyc-node')]
    const txt = nodes.map(n => ({ title: n.querySelector('b').textContent, sub: n.querySelector('small').innerText.replace(/\n/g, ' ') }))
    /* does any stage's text run into the next stage's disc or text? */
    const boxes = nodes.map(n => n.querySelector('.cyc-txt').getBoundingClientRect())
    const discs = nodes.map(n => n.querySelector('.cyc-disc').getBoundingClientRect())
    let clash = 0
    boxes.forEach((a, i) => discs.forEach((d, j) => { if (i !== j && a.right > d.left && a.left < d.right && a.bottom > d.top && a.top < d.bottom) clash++ })
    )
    const canvas = document.querySelector('.cyc-canvas')
    const cr = canvas ? canvas.getBoundingClientRect() : null
    const lowest = Math.max(...nodes.map(n => n.querySelector('.cyc-txt').getBoundingClientRect().bottom))
    return { txt, clash, caption: document.querySelectorAll('.cyc-caption').length,
      deadBandAtFoot: cr ? Math.round(cr.bottom - lowest) : null,
      canvasH: cr ? Math.round(cr.height) : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }
  })
  res[w].errors = errs
  const el = await p.$('.cyc-fit') || await p.$('.cyc-canvas')
  if (el) await el.screenshot({ path: `${OUT}/cycle-${w}.png` })
  await p.close()
}
console.log(JSON.stringify(res, null, 1))
await b.close()
