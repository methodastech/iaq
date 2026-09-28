/* 15 Sep: Culture and Contact slot fill. Counts "supplied by IAQ" slots, broken images, overflow and
   console errors at 1440 and 390. Usage: node tools/probe-culture-slots-0915.mjs <outdir> <tag> [shots] */
import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2] || '.'; const TAG = process.argv[3] || 'run'; const SHOTS = process.argv[4] === 'shots'
const BASE = 'http://localhost:5177'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const res = {}
const SECTIONS = {
  culture: ['.cu-strip', '.cu-origin', '.cu-safety', '.cu-life', '.cu-grow', '.cu-places', '.cu-voices', '.cu-hire'],
  contact: ['#offices'],
}
for (const [url, name] of [['/careers/culture', 'culture'], ['/contact', 'contact']]) {
  for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
    const key = `${name}-${w}`; const errs = []
    const p = await b.newPage()
    p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
    p.on('console', msg => { if (msg.type() === 'error') errs.push('console: ' + msg.text().slice(0, 200)) })
    p.on('requestfailed', r => errs.push('reqfail: ' + r.url()))
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: m, hasTouch: m })
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await p.goto(BASE + url, { waitUntil: 'networkidle0', timeout: 60000 })
    await p.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager' })
      const H = document.documentElement.scrollHeight
      for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)) }
      window.scrollTo(0, 0)
      await Promise.all([...document.images].map(i => (i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 10000) }))))
    })
    await new Promise(r => setTimeout(r, 900))
    const data = await p.evaluate(() => {
      const txt = document.body.innerText
      const broken = [...document.images].filter(i => i.naturalWidth === 0).map(i => i.currentSrc || i.src)
      const vw = document.documentElement.clientWidth
      const over = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw
      const lines = txt.split('\n').map(s => s.trim()).filter(l => /supplied by IAQ/i.test(l))
      const q = s => document.querySelectorAll(s).length
      return {
        slotText: lines.length, slotLines: lines,
        chips: q('.cu-chip'), skel: q('.cu-skel'), pcSlot: q('.cu-pc-slot'), stSlot: q('.cu-st.is-slot'), offSlot: q('.off-slot'), offRep: q('.off-rep'),
        imgs: document.images.length, broken, over,
      }
    })
    res[key] = { ...data, errs }
    if (SHOTS) {
      for (const sel of SECTIONS[name]) {
        const el = await p.$(sel); if (!el) { res[key].errs.push('missing ' + sel); continue }
        await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 700))
        await el.screenshot({ path: `${OUT}/${TAG}-${name}-${w}-${sel.replace(/[^a-z0-9]/gi, '')}.png` })
      }
    }
    await p.close()
  }
}
fs.writeFileSync(`${OUT}/probe-${TAG}.json`, JSON.stringify(res, null, 2))
for (const [k, v] of Object.entries(res)) console.log(k, JSON.stringify({ slotText: v.slotText, chips: v.chips, skel: v.skel, pcSlot: v.pcSlot, stSlot: v.stSlot, offSlot: v.offSlot, offRep: v.offRep, imgs: v.imgs, broken: v.broken, over: v.over, errs: v.errs }))
await b.close()
