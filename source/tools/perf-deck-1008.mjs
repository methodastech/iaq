/* 8 Oct 2026 (Bazil: "presentation is lagging"): frame timing on every slide of the packaged deck, and the label lines
   of the systems view checked against their labels in the zoomed portal view.
   Usage: node tools/perf-deck-1008.mjs <package base> [<portal base>] */
import puppeteer from 'puppeteer-core'
const [pkg = 'http://localhost:8799', portal = ''] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--window-size=1920,1080', '--autoplay-policy=no-user-gesture-required'] })
const frames = (page, ms) => page.evaluate(ms => new Promise(res => {
  const ts = []; let raf = 0; const t0 = performance.now()
  const f = t => { ts.push(t); if (t - t0 < ms) raf = requestAnimationFrame(f); else { const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, c) => a - c); res({ fps: +(1000 * d.length / (ts[ts.length - 1] - ts[0])).toFixed(1), p95: +d[Math.floor(d.length * .95)].toFixed(1), worst: +d[d.length - 1].toFixed(1) }) } }
  raf = requestAnimationFrame(f)
}), ms)
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 })
await p.goto(pkg + '/', { waitUntil: 'networkidle2', timeout: 60000 })
const WAIT = { 1: 5000, 2: 15000, 3: 13000, 4: 15000, 5: 2500, 6: 3000, 7: 3000, 8: 4000, 9: 2000 }
const out = []
for (let n = 1; n <= 9; n++) {
  if (n > 1) await p.keyboard.press('ArrowRight')
  await new Promise(r => setTimeout(r, WAIT[n]))
  const fr = await frames(p, 3000)
  const gl = await p.evaluate(() => { const f = document.querySelector('.pr-keep iframe'); if (!f) return null; const w = f.contentWindow, r = w.__iaqRenderer; const c = r && r.domElement; return { ratio: r ? r.getPixelRatio() : null, canvas: c ? [c.width, c.height] : null, frameH: f.clientHeight } })
  out.push({ n, tab: await p.$eval('.pr-tabs a.on', e => e.textContent), ...fr, gl })
}
console.log('PACKAGE frame timing (headless, Metal GPU)'); for (const o of out) console.log(JSON.stringify(o))
if (portal) {
  const q = await b.newPage(); await q.setViewport({ width: 1440, height: 900 })
  await q.goto(portal + '/portal/presentation/europe-1#s4', { waitUntil: 'networkidle2', timeout: 60000 })
  const em = await q.$('.cms-emerg'); if (em) { await em.click(); await new Promise(r => setTimeout(r, 1500)) }
  await new Promise(r => setTimeout(r, 17000))
  const gap = await q.evaluate(() => {
    const svg = document.querySelector('.pr-leaders'); if (!svg) return 'no leaders'
    const M = svg.getScreenCTM(); const pins = [...document.querySelectorAll('.pr-lb')], lines = [...svg.querySelectorAll('line')]
    return pins.map((pin, k) => { const r = pin.getBoundingClientRect(), l = lines[k]; if (!l || l.style.display === 'none') return null
      const x = +l.getAttribute('x1'), y = +l.getAttribute('y1'); const sx = M.a * x + M.c * y + M.e, sy = M.b * x + M.d * y + M.f
      return { label: pin.textContent, dx: +(sx - r.right).toFixed(1), dy: +(sy - (r.top + r.height / 2)).toFixed(1) } })
  })
  console.log('PORTAL leader start minus label edge (px):'); console.log(JSON.stringify(gap))
}
await b.close()
