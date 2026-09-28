/* Tap targets on a phone, measured the only way that means anything: scroll each candidate into
   view, then check the element under its own centre is itself. Anything in a closed drawer, behind
   a scrim or clipped away is not a tap target and is not counted. */
import puppeteer from 'puppeteer-core'
const ROUTES = ['/', '/about', '/services', '/markets', '/projects', '/news', '/careers', '/contact', '/policies']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const r of ROUTES) {
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })

  await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(x => setTimeout(x, 1400))
  const bad = await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const out = []
    const list = [...document.querySelectorAll('a,button')].filter(e => !e.closest('.bmws, .topbar'))
    for (const e of list) {
      let rr = e.getBoundingClientRect()
      if (!rr.width || !rr.height) continue
      if (rr.height >= 40 && rr.width >= 28) continue
      e.scrollIntoView({ block: 'center' }); await sleep(30)
      rr = e.getBoundingClientRect()
      if (rr.height >= 40 && rr.width >= 28) continue
      const cx = rr.left + rr.width / 2, cy = rr.top + rr.height / 2
      if (cy < 0 || cy > innerHeight || cx < 0 || cx > innerWidth) continue
      const owns = q => q && (q === e || e.contains(q) || q.contains(e))
      if (!owns(document.elementFromPoint(cx, cy))) continue
      /* the drawn box is not the hit area: a control can carry a transparent ::after that widens it.
         Measure what a finger would actually reach by walking out from the centre. */
      const reach = (dx, dy) => { let n = 0; for (let d = 2; d <= 24; d += 2) { if (owns(document.elementFromPoint(cx + dx * d, cy + dy * d))) n = d; else break } return n }
      const hitW = Math.round(reach(-1, 0) + reach(1, 0) + 2)
      const hitH = Math.round(reach(0, -1) + reach(0, 1) + 2)
      if (hitW >= 44 && hitH >= 44) continue
      out.push({ t: (e.textContent || '').trim().slice(0, 22), w: Math.round(rr.width), h: Math.round(rr.height), hit: hitW + 'x' + hitH, cls: String(e.className).slice(0, 20) })
    }
    return out
  })
  console.log(r.padEnd(14) + (bad.length ? bad.length + ' reachable under 40px: ' + bad.slice(0, 6).map(x => `"${x.t}" drawn ${x.w}x${x.h} hit ${x.hit} .${x.cls}`).join(' | ') : 'none under 40px'))
  await p.close()
}
await b.close()
