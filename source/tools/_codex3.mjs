import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const w of [1440, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 950 })
  await p.goto('http://localhost:5177/portal/codex', { waitUntil: 'networkidle0', timeout: 90000 })
  await new Promise(r => setTimeout(r, 1800))
  if (await p.$('input')) { await p.type('input', 'iaqsolution321'); await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 2500)) }
  const o = await p.evaluate(() => {
    const rows = []
    for (const e of document.querySelectorAll('h1,h2,h3,p,em,b,span,a,li,td')) {
      if (e.scrollWidth <= e.clientWidth + 2) continue
      const s = getComputedStyle(e)
      if (s.overflow === 'visible') continue
      rows.push({ tag: e.tagName, cls: String(e.className).slice(0, 28), ov: s.overflowX, te: s.textOverflow, ws: s.whiteSpace, w: Math.round(e.clientWidth), sw: e.scrollWidth, t: (e.textContent || '').trim().slice(0, 40) })
    }
    const map = document.querySelector('[class*="cxmap"], [class*="relmap"], [class*="cx-map"]')
    const glow = map ? [...map.querySelectorAll('*')].filter(e => /blur|drop-shadow/.test(getComputedStyle(e).filter)).length : 'no map el'
    return { rows: rows.slice(0, 12), n: rows.length, mapGlow: glow, mapCls: map ? String(map.className).slice(0, 40) : null }
  })
  console.log('=== ' + w, 'clipped', o.n, '· map glow nodes', o.mapGlow, '·', o.mapCls)
  o.rows.forEach(r => console.log(`   ${r.tag}.${r.cls} ov:${r.ov} te:${r.te} ws:${r.ws} ${r.w}<${r.sw} "${r.t}"`))
  await p.close()
}
await b.close()
