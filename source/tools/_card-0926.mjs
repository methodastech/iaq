import puppeteer from 'puppeteer-core'
/* 26 Sep: the refined Facilities card. node tools/_card-0926.mjs <outdir> <W> <H> <row> [classic] */
const [out, W = 1600, H = 1000, row = 8, classic] = [process.argv[2], +process.argv[3] || 1600, +process.argv[4] || 1000, +(process.argv[5] ?? 8), process.argv[6]]
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: W < 700, hasTouch: W < 700 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto('http://localhost:5177/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(4000)
if (classic) { await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v1').click()); await sleep(5000) }
if (row >= 0) { await p.evaluate(r => { const d = document.querySelector('.db3-frame').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; L[r].click() }, row); await sleep(row === 8 ? 12000 : 9000) }
const m = await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument, r = s => { const e = d.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)] }
  return { iw: d.documentElement.clientWidth, left: r('#hud2 .h-left'), play: r('#hud2 .h-play'), start: r('#hud2 .h-start'), cta: r('#hud2 .h-cta'), speed: r('#hud2 .h-speed'), bar: r('#hud2 .h-rail li.on .rd-bar'), k: getComputedStyle(d.querySelector('#hud2 .h-left')).getPropertyValue('--rail-k'), refine: !!d.getElementById('iaq-refine-style'), num: getComputedStyle(d.querySelector('#hud2 .h-rail li .rd-n'), '::before').content } })
console.log(W, JSON.stringify(m), 'errors', JSON.stringify(errs.slice(0, 4)))
const cl = await p.evaluate(() => { const f = document.querySelector('.db3-frame'), fb = f.getBoundingClientRect(), d = f.contentDocument, L = d.querySelector('#hud2 .h-left').getBoundingClientRect(), z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1; return { x: (fb.left + L.left - 12) * z + scrollX, y: (fb.top + L.top - 12) * z + scrollY, w: (L.width + 24) * z, h: (L.height + 24) * z } })
await p.screenshot({ path: `${out}/card-${W}${classic ? '-classic' : ''}-r${row}.png`, clip: { x: Math.max(0, cl.x), y: Math.max(0, cl.y), width: Math.min(cl.w, W), height: Math.min(cl.h, H) } })
await p.screenshot({ path: `${out}/full-${W}${classic ? '-classic' : ''}-r${row}.png` })
await b.close()
