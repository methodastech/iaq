import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 390)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: W, height: 844, isMobile: W < 500, hasTouch: W < 500 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2', timeout: 90000 })
const r = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth, out = []
  for (const el of document.querySelectorAll('body *')) {
    const c = getComputedStyle(el); if (c.position !== 'absolute' && c.position !== 'fixed') continue
    const rc = el.getBoundingClientRect(); if (rc.right <= vw + 1 || !rc.width) continue
    let a = el.parentElement, clipped = false
    while (a && a !== document.documentElement) { const ac = getComputedStyle(a); if (ac.overflowX !== 'visible' && a !== document.body) { clipped = true; break } if (ac.position !== 'static' && ac.overflowX !== 'visible') { clipped = true; break } a = a.parentElement }
    if (!clipped) out.push({ tag: el.tagName.toLowerCase(), cls: String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 40), pos: c.position, right: Math.round(rc.right), op: el.offsetParent ? el.offsetParent.tagName + '.' + String(el.offsetParent.className).slice(0, 30) : 'none' })
  }
  // also test: which top-level child pushes scrollWidth
  const kids = [...document.body.children].map(k => ({ tag: k.tagName, cls: String(k.className).slice(0, 30), sw: k.scrollWidth, w: Math.round(k.getBoundingClientRect().width) })).filter(k => k.sw > vw + 1)
  return { out: out.slice(0, 20), n: out.length, kids }
})
console.log(JSON.stringify(r)); await b.close()
