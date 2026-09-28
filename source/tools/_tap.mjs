import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true })
await p.goto('http://localhost:5177/about?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => {
  const out = { hidden: 0, visible: [] }
  for (const e of document.querySelectorAll('a,button')) {
    const r = e.getBoundingClientRect()
    if (!r.width || !r.height) continue
    if (r.height >= 40 && r.width >= 28) continue
    if (e.closest('.bmws, .topbar')) continue
    /* is it really reachable? the element under its own centre must be it or its child */
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const onScreen = cy > 0 && cy < innerHeight && cx > 0 && cx < innerWidth
    const hit = onScreen ? document.elementFromPoint(cx, cy) : null
    const reachable = hit && (hit === e || e.contains(hit))
    if (!reachable) { out.hidden++; continue }
    out.visible.push({ t: (e.textContent || '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), cls: String(e.className).slice(0, 22) })
  }
  return out
}), null, 1))
await b.close()
