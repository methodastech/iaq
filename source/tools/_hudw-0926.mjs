import puppeteer from 'puppeteer-core'
/* 26 Sep: the light card against its controls, at several widths. node tools/_hudw-0926.mjs [shotdir] */
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
for (const [W, H] of [[1024, 768], [1280, 800], [1440, 900], [1920, 1080]]) {
  const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 }); await p.setCacheEnabled(false)
  p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
  await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
  await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
  await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(9000)
  const m = await p.evaluate(() => {
    const d = document.querySelector('.db3-frame').contentDocument, r = s => { const e = d.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)] }
    const L = d.querySelector('#hud2 .h-left'), cs = getComputedStyle(L)
    return { iw: d.documentElement.clientWidth, ih: d.documentElement.clientHeight, left: r('#hud2 .h-left'), pad: cs.paddingLeft + ' ' + cs.paddingRight, k: cs.getPropertyValue('--rail-k'), rail: r('#hud2 .h-rail'), ctrl: r('#hud2 .h-ctrl'), play: r('#hud2 .h-play'), cta: r('#hud2 .h-cta'), speed: r('#hud2 .h-speed'), last: r('#hud2 .h-speed button:last-child'), skin: r('#skin-switch') }
  })
  console.log(W, JSON.stringify(m))
  if (out) await p.screenshot({ path: `${out}/w-${W}.png` })
  await p.close()
}
await b.close()
