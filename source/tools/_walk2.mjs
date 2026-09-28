import puppeteer from 'puppeteer-core'
const out = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu','--window-size=1600,900','--autoplay-policy=no-user-gesture-required'] })
const res = {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
for (const [w, h] of [[1600, 900], [1366, 768], [1280, 720]]) {
  const q = await b.newPage(); await q.setViewport({ width: w, height: h }); await q.setCacheEnabled(false); const errs = []; q.on('pageerror', e => errs.push(e.message.slice(0, 140)))
  await q.goto('http://localhost:52943/?nointro=1&x=' + Date.now(), { waitUntil: 'networkidle2', timeout: 120000 }); await sleep(7000)
  await q.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' })); await sleep(2500); await q.mouse.move(w * 0.7, h * 0.5)
  const roll = async () => { for (let k = 0; k < 6; k++) { await q.mouse.wheel({ deltaY: 100 }); await sleep(30) } }
  for (let i = 0; i < 5; i++) { await roll(); await sleep(3600) }
  await sleep(600)
  const rail = await q.evaluate(() => { const f = document.querySelector('.db3-frame'), d = f.contentDocument, W = d.defaultView; const L = d.querySelector('#hud2 .h-left'), on = d.querySelector('#hud2 .h-rail li.on'), cs = on && W.getComputedStyle(on); const r = L.getBoundingClientRect(); return { innerH: W.innerHeight, leftBottom: Math.round(r.bottom), fits: r.bottom <= W.innerHeight, k: L.style.getPropertyValue('--rail-k'), onTitle: on && on.querySelector('.rd-t').textContent.trim(), landed: on && on.classList.contains('iaq-landed'), onShadow: cs && cs.boxShadow, onBg: cs && cs.backgroundImage.slice(0, 60), rows: d.querySelectorAll('#hud2 .h-rail li').length, ctaBottom: Math.round(d.querySelector('#hud2 .h-ctrl').getBoundingClientRect().bottom) } })
  await q.screenshot({ path: `${out}/cam2-${w}x${h}.png` })
  /* the walkthrough */
  await q.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.getElementById('explore-cta').click() }); await sleep(3500)
  const probe = () => q.evaluate(() => { const f = document.querySelector('.db3-frame'), d = f.contentDocument, W = d.defaultView; const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } }; const fs = d.getElementById('floor-switch'), mm = d.getElementById('minimap'), rk = d.getElementById('room-keys'), tg = d.querySelector('.iaq-fs-tog'), tp = d.querySelector('.iaq-tape-in'), lv = d.querySelector('#floor-list .iaq-lv'); return { room: d.body.classList.contains('room'), fsBox: r(fs), detail: fs.classList.contains('iaq-detail'), tog: tg && tg.textContent, lvDisplay: lv && W.getComputedStyle(lv).display, keysOpen: rk && rk.classList.contains('open'), keysBox: r(rk), keysDl: (e => e && W.getComputedStyle(e).display)(rk && rk.querySelector('.rk-keys')), mm: r(mm), walk: W.__iaqWalk ? { yaw: +W.__iaqWalk.yaw.toFixed(3) } : null, tape: tp && tp.style.transform, deg: (e => e && e.textContent)(d.querySelector('.iaq-deg')), where: (e => e && e.textContent.trim())(d.querySelector('.iaq-where')), inner: { w: W.innerWidth, h: W.innerHeight } } })
  const p1 = await probe()
  await q.screenshot({ path: `${out}/walk2-${w}x${h}.png` })
  /* turn: drag to look right, so the tape moves */
  await q.mouse.move(w * .6, h * .5); await q.mouse.down(); await q.mouse.move(w * .6 + 160, h * .5, { steps: 12 }); await q.mouse.up(); await sleep(500)
  const p2 = await probe()
  /* the Details switch */
  await q.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.querySelector('.iaq-fs-tog').click() }); await sleep(600)
  const p3 = await probe()
  await q.screenshot({ path: `${out}/walk2-${w}x${h}-detail.png` })
  await q.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.querySelector('.iaq-fs-tog').click() }); await sleep(300)
  res[`${w}x${h}`] = { errs, rail, walk: { simple: p1, turned: { tape: p2.tape, deg: p2.deg, yaw: p2.walk }, detail: { detail: p3.detail, tog: p3.tog, lvDisplay: p3.lvDisplay, fsBox: p3.fsBox } } }
  await q.close()
}
for (const [k, v] of Object.entries(res)) { const r = v.rail, w = v.walk; console.log(k, '| errs', v.errs.length, '| rail fits', r.fits, 'k', r.k, 'bottom', r.leftBottom, '/', r.innerH, 'landed', r.landed, 'shadow', r.onShadow, 'bg', (r.onBg||'').slice(0,15)); console.log('   walk room', w.simple.room, 'fs', JSON.stringify(w.simple.fsBox), 'tog', w.simple.tog, 'lv', w.simple.lvDisplay, '| keys open', w.simple.keysOpen, JSON.stringify(w.simple.keysBox), '| mm', JSON.stringify(w.simple.mm), '| deg', w.simple.deg, '->', w.turned.deg, '| detail', w.detail.detail, w.detail.tog, w.detail.lvDisplay, JSON.stringify(w.detail.fsBox), '| inner', JSON.stringify(w.simple.inner)); if (v.errs.length) console.log('   ERR', v.errs) }
await b.close()
