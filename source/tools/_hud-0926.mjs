import puppeteer from 'puppeteer-core'
/* 26 Sep: the Facilities HUD after "default should be V2 Environment", "no square", "don't put it in boxes".
   node tools/_hud-0926.mjs <outdir> [width] [height] */
const out = process.argv[2], W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900), sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: W < 700, hasTouch: W < 700 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(4000)
const probe = () => p.evaluate(() => {
  const d = document.querySelector('.db3-frame').contentDocument, cs = e => e ? getComputedStyle(e) : null
  const sk = [...d.querySelectorAll('#skin-switch button')].map(x => ({ id: x.id, text: x.textContent.trim(), pressed: x.getAttribute('aria-pressed') }))
  const lis = [...d.querySelectorAll('#hud2 .h-rail li')]
  const rows = lis.map((li, i) => { const c = cs(li); return c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backgroundImage !== 'none' || c.boxShadow !== 'none' || c.backdropFilter !== 'none' ? { i, cls: li.className, bg: c.backgroundColor, img: c.backgroundImage.slice(0, 60), sh: c.boxShadow, bf: c.backdropFilter } : null }).filter(Boolean)
  const on = lis.findIndex(li => li.classList.contains('on'))
  const sp = [...d.querySelectorAll('#hud2 .h-speed button')].map(x => { const c = cs(x); return { t: x.textContent.trim(), pressed: x.getAttribute('aria-pressed'), border: c.borderTopWidth + ' ' + c.borderTopStyle, bg: c.backgroundColor, color: c.color, bf: c.backdropFilter } })
  const ss = d.getElementById('skin-switch').getBoundingClientRect(), head = d.querySelector('#hud2 .h-head')?.getBoundingClientRect()
  return { light: d.documentElement.classList.contains('iaq-light'), body: d.body.className, sk, on, rowsWithFill: rows, sp, skinBox: [Math.round(ss.left), Math.round(ss.top), Math.round(ss.width), Math.round(ss.height)], headBox: head ? [Math.round(head.left), Math.round(head.top), Math.round(head.width), Math.round(head.height)] : null, vw: d.documentElement.clientWidth }
})
const r0 = await probe(); console.log('DEFAULT', JSON.stringify(r0))
await p.screenshot({ path: `${out}/a-default-${W}.png` })
/* light up row 7, the cleanroom system, the row in Bazil's screenshot */
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; (L[6] || L[L.length - 1]).click() }); await sleep(9000)
const r1 = await probe(); console.log('ROW7', JSON.stringify(r1))
await p.screenshot({ path: `${out}/b-row7-${W}.png` })
/* Classic, the dark stage */
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v1').click()); await sleep(7000)
const r2 = await probe(); console.log('CLASSIC', JSON.stringify(r2))
await p.screenshot({ path: `${out}/c-classic-${W}.png` })
/* the choice is remembered on reload */
await p.reload({ waitUntil: 'domcontentloaded' }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(3000)
const r3 = await p.evaluate(() => [...document.querySelector('.db3-frame').contentDocument.querySelectorAll('#skin-switch button')].map(x => x.textContent.trim() + ':' + x.getAttribute('aria-pressed')).join(' '))
console.log('AFTER RELOAD', r3)
console.log('errors', JSON.stringify(errs.slice(0, 6))); await b.close()
