/* 17 Sep 2026: the merged cycle section and the model build on the four unit pages.
   node tools/probe-cycle-build-0917.mjs <shot dir>
   For each page at 1440x900 and 390x844: console errors, horizontal overflow, the cycle section
   at several rows (which row is on, which stage the drawing lights, the locator text, shots),
   the build stage at three scroll positions (frame drawn, a pixel sample so the frames are
   proven different, shots), the transfer weight of the frame set, and a reduced-motion pass. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const OUT = process.argv[2] || '.'
fs.mkdirSync(OUT, { recursive: true })
const PAGES = [['/services/epc-construction', 'epc'], ['/services/energy-management', 'energy'], ['/services/tool-installation', 'hookup'], ['/services/process-critical-utilities', 'pcu']]
const wait = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const out = {}

for (const [vw, vh, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  for (const [u, n] of PAGES) {
    const p = await b.newPage()
    await p.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 })
    const errs = []
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
    p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
    let seqBytes = 0, seqFiles = 0
    p.on('response', async r => { if (r.url().includes('/assets/iaq/model-seq/')) { const h = r.headers()['content-length']; if (h) { seqBytes += Number(h); seqFiles++ } } })
    await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await wait(1500)
    const r = { errs, overflow: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), cycle: [], build: [] }

    /* the cycle: put each row's centre on the observer band (42% to 54% of the viewport) */
    const rows = await p.evaluate(() => Array.from(document.querySelectorAll('.un-step')).map(el => { const b = el.getBoundingClientRect(); return b.top + scrollY + b.height / 2 }))
    const pick = rows.length > 5 ? [0, 2, 4, rows.length - 1] : [0, 2, rows.length - 1]
    for (const i of pick) {
      await p.evaluate(y => window.scrollTo(0, Math.max(0, y - innerHeight * 0.48)), rows[i]); await wait(i === pick[0] ? 2600 : 900)
      const st = await p.evaluate(() => {
        const on = document.querySelector('.un-step.on'), svg = document.querySelector('.un-cycle .un-art')
        const stick = document.querySelector('.un-cycle-stick').getBoundingClientRect()
        return {
          on: on ? Number(on.dataset.i) : -1, active: svg ? Number(svg.dataset.active) : null,
          lit: svg ? svg.querySelectorAll('.is-on').length : 0, back: svg ? svg.querySelectorAll('.is-off').length : 0,
          now: document.querySelector('.un-cycle-now')?.textContent.trim(),
          stickTop: Math.round(stick.top), stickBottom: Math.round(stick.bottom),
          barBottom: Math.round(document.querySelector('.bmws')?.getBoundingClientRect().bottom || 0),
          figIn: document.querySelector('.un-cycle-fig')?.classList.contains('in'),
        }
      })
      r.cycle.push({ want: i, ...st })
      await p.screenshot({ path: `${OUT}/${tag}-${n}-cycle-${i}.png`, captureBeyondViewport: false })
    }

    /* the build: three positions along the runway, plus a pixel sample of the canvas */
    const geo = await p.evaluate(() => { const b = document.querySelector('.un-build'), s = document.querySelector('.un-build-stage'); const r = b.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, sh: s.getBoundingClientRect().height, live: b.classList.contains('is-live') } })
    r.buildGeo = geo
    for (const f of [0, 0.5, 1]) {
      const y = geo.top + f * (geo.h - geo.sh) - (await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.un-build-stage')).top) || 0))
      await p.evaluate(y => window.scrollTo(0, y), y); await wait(f === 0 ? 2500 : 900)
      const st = await p.evaluate(() => {
        const c = document.querySelector('.un-build canvas'), ctx = c.getContext('2d')
        const sample = []
        for (let k = 0; k < 6; k++) { const d = ctx.getImageData(Math.floor(c.width * (0.3 + k * 0.08)), Math.floor(c.height * 0.55), 1, 1).data; sample.push(d[0] + ',' + d[1] + ',' + d[2]) }
        let dark = 0; const step = 16, d = ctx.getImageData(0, 0, c.width, c.height).data
        for (let i = 0; i < d.length; i += 4 * step) if (d[i] + d[i + 1] + d[i + 2] < 600) dark++
        const sr = document.querySelector('.un-build-stage').getBoundingClientRect()
        const hud = document.querySelector('.un-build-hud').getBoundingClientRect()
        return { frame: c.dataset.frame, p: c.dataset.p, cw: c.width, ch: c.height, sample: sample.join(' | '), inkPx: dark, hud: document.querySelector('.un-build-k')?.textContent, stageTop: Math.round(sr.top), stageBottom: Math.round(sr.bottom), hudTop: Math.round(hud.top), barBottom: Math.round(document.querySelector('.bmws')?.getBoundingClientRect().bottom || 0) }
      })
      r.build.push({ f, ...st })
      await p.screenshot({ path: `${OUT}/${tag}-${n}-build-${f}.png`, captureBeyondViewport: false })
    }
    /* the definition section without its drawing, and the unit's extract under the runway */
    for (const [sel, name, off] of [['.un-what', 'what', 20], ['.un-bim-sys', 'extract', 40]]) {
      const y = await p.evaluate((sel, off) => document.querySelector(sel).getBoundingClientRect().top + scrollY - off, sel, off)
      await p.evaluate(y => window.scrollTo(0, y), y); await wait(1200)
      await p.screenshot({ path: `${OUT}/${tag}-${n}-${name}.png`, captureBeyondViewport: false })
    }
    await wait(1200)
    r.seq = { files: seqFiles, kb: Math.round(seqBytes / 1024) }
    out[`${tag}-${n}`] = r
    await p.close()
  }
}

/* reduced motion: the still, the collapsed runway, and the drawing without transitions */
{
  const p = await b.newPage()
  await p.setViewport({ width: 1440, height: 900 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  await p.goto('http://localhost:5177/services/epc-construction', { waitUntil: 'networkidle2' }); await wait(1500)
  const y = await p.evaluate(() => document.querySelector('.un-bim').getBoundingClientRect().top + scrollY - 20)
  await p.evaluate(y => window.scrollTo(0, y), y); await wait(1500)
  out.reduced = await p.evaluate(() => {
    const b = document.querySelector('.un-build'), img = b.querySelector('.un-build-still'), c = b.querySelector('canvas')
    return { cls: b.className, still: getComputedStyle(img).display, stillSrc: img.currentSrc.split('/').pop(), stillW: Math.round(img.getBoundingClientRect().width), stillH: Math.round(img.getBoundingClientRect().height), canvas: getComputedStyle(c).display, runwayH: Math.round(b.getBoundingClientRect().height), hud: getComputedStyle(b.querySelector('.un-build-hud')).display, errs: [] }
  })
  out.reduced.errs = errs
  await p.screenshot({ path: `${OUT}/reduced-epc-build.png`, captureBeyondViewport: false })
  await p.close()
}
console.log(JSON.stringify(out, null, 1))
await b.close()
