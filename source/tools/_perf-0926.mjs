import puppeteer from 'puppeteer-core'
/* 26 Sep: what the yard costs per frame at handover (draw calls, triangles), desktop and phone. */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
for (const [W, H, mob] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: mob ? 3 : 2, isMobile: mob, hasTouch: mob }); await p.setCacheEnabled(false)
  p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
  await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
  await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
  await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 150000, polling: 500 }); await sleep(5000)
  for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; (L[i] || L[L.length - 1]).click() }, i); await sleep(i === 8 ? 14000 : 6000) }
  const m = async v => p.evaluate(async v => { const w = document.querySelector('.db3-frame').contentWindow, R = w.__iaqRenderer, hs = w.__iaqBoss.getObjectByName('handover-site'), y = hs && hs.getObjectByName('iaq-yard'); if (y) y.visible = v; R.info.autoReset = false; R.info.reset(); const fa = R.info.render.frame; w.dispatchEvent(new Event('resize')); await new Promise(r => setTimeout(r, 1000)); const n = Math.max(1, R.info.render.frame - fa); const c = R.info.render.calls, t = R.info.render.triangles; R.info.autoReset = true; return { yard: v, frames: n, callsPerFrame: Math.round(c / n), trisPerFrame: Math.round(t / n) } }, v)
  console.log(W, mob ? 'phone' : 'desktop', JSON.stringify(await m(true)), JSON.stringify(await m(false)))
  await p.close()
}
await b.close()
