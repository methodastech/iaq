import puppeteer from 'puppeteer-core'
const W = +(process.argv[2] || 390)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: W, height: 844, isMobile: W < 500, hasTouch: W < 500 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2', timeout: 90000 })
const r = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth, out = []
  const all = [...document.body.querySelectorAll('*')]
  for (const el of all) {
    const rc = el.getBoundingClientRect(); if (!rc.width || rc.right <= vw + 1) continue
    // report only the outermost offender: its parent fits
    const par = el.parentElement, pr = par && par.getBoundingClientRect()
    if (pr && pr.right > vw + 1) continue
    let anc = el, sec = ''; while (anc && anc !== document.body) { if (anc.id && anc.tagName === 'SECTION') { sec = anc.id; break } anc = anc.parentElement }
    out.push({ sec, tag: el.tagName.toLowerCase(), cls: String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 50), right: Math.round(rc.right), w: Math.round(rc.width) })
  }
  return { vw, docW: document.documentElement.scrollWidth, bodyOx: getComputedStyle(document.body).overflowX, htmlOx: getComputedStyle(document.documentElement).overflowX, out: out.slice(0, 40), n: out.length }
})
console.log(JSON.stringify(r, null, 0))
await b.close()
