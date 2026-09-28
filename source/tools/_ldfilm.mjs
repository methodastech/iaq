import puppeteer from 'puppeteer-core'
const out = process.argv[2], W = +(process.argv[3] || 1440), tag = process.argv[4] || 'd', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: W < 700 ? 844 : 900, isMobile: W < 700, hasTouch: W < 700 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) }
  window.__ldLog = []; const t0 = performance.now(); let last = t0, n = 0
  const tick = () => { const now = performance.now(); n++; const el = document.getElementById('loader'); if (el) { window.__ldLog.push([Math.round(now - t0), el.getAttribute('aria-valuenow'), el.classList.contains('ld-done') ? 1 : 0, Math.round(now - last)]) } last = now; if (now - t0 < 7000) requestAnimationFrame(tick) }
  requestAnimationFrame(tick) })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 140)))
const t0 = Date.now(); p.goto('http://localhost:57375/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
const shots = []
for (let i = 0; i < 26; i++) { await sleep(i === 0 ? 250 : 180); const ms = Date.now() - t0; try { await p.screenshot({ path: `${out}/${tag}-${String(i).padStart(2, '0')}.png` }); shots.push(ms) } catch (e) {} }
await sleep(1500)
const log = await p.evaluate(() => window.__ldLog || [])
const firstLoader = log.find(r => r[1] !== null), done = log.find(r => r[2] === 1)
const gaps = log.map(r => r[3]).filter(g => g > 0); const long = gaps.filter(g => g > 34).length
const byPct = {}; for (const r of log) { const k = r[1]; if (k !== null && !(k in byPct)) byPct[k] = r[0] }
console.log(JSON.stringify({ width: W, frames: log.length, firstPct: firstLoader, pct50at: byPct['50'], pct100at: byPct['100'], doneAt: done && done[0], longFrames: long, medianGap: gaps.sort((a, b) => a - b)[gaps.length >> 1], shots: shots.slice(0, 26) }))
console.log('errors', JSON.stringify(errs.slice(0, 4))); await b.close()
