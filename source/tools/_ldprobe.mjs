// The live loader's UI boxes mid-load: the logo and the count, what is shown, where.
import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob }); await p.setCacheEnabled(false)
  await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
  p.goto('http://localhost:57375/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  const rows = []
  for (const t of [700, 1500, 2300, 2700]) {
    await sleep(t - (rows.length ? [700, 1500, 2300, 2700][rows.length - 1] : 0))
    rows.push(await p.evaluate(() => {
      const q = id => { const e = document.getElementById(id); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { txt: e.textContent.slice(0, 6), disp: cs.display, op: cs.opacity, vis: cs.visibility, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) } }
      const row = document.querySelector('.ld-row'); const rcs = row && getComputedStyle(row)
      return { pct: q('ldPct'), logo: q('ldLogoFill'), row: row && { disp: rcs.display, op: rcs.opacity, h: Math.round(row.getBoundingClientRect().height) }, fill: document.getElementById('ldLogoFill') && document.getElementById('ldLogoFill').style.getPropertyValue('--fill') }
    }))
  }
  console.log(w, JSON.stringify(rows))
  await p.close()
}
await b.close()
