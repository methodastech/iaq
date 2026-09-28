/* 26 Sep: Design tab layout audit at a width: page overflow, and any element inside the new sections that spills out of its box */
import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 390)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: W, height: 844, isMobile: W < 500, hasTouch: W < 500 })
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2', timeout: 90000 }); await p.evaluate(() => document.fonts.ready)
const r = await p.evaluate(() => {
  const docW = document.documentElement.scrollWidth, vw = document.documentElement.clientWidth
  const wide = []
  for (const sel of ['#elements', '#direction', '#applications', '#art-services', '#icon-library']) {
    const root = document.querySelector(sel); if (!root) continue
    root.querySelectorAll('*').forEach(el => { const rc = el.getBoundingClientRect(); if (rc.width && (rc.right > vw + 1 || rc.left < -1)) { const cs = getComputedStyle(el); if (cs.position !== 'fixed') wide.push(sel + ' ' + el.tagName.toLowerCase() + '.' + String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).split(' ').slice(0, 2).join('.') + ' r=' + Math.round(rc.right)) } })
  }
  /* text that overflows its own box inside the artboards (clipped type) */
  const clipped = []
  document.querySelectorAll('.ab *').forEach(el => { if (el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') clipped.push(el.textContent.trim().slice(0, 40)) })
  return { docW, vw, wide: [...new Set(wide)].slice(0, 30), wideCount: wide.length, clipped: clipped.slice(0, 10) }
})
console.log(JSON.stringify({ W, ...r, errs }))
await b.close()
