import puppeteer from 'puppeteer-core'
/* 26 Sep: the Facilities journey in Environment (the default): nine chapters by scroll, then the walkthrough.
   node tools/_envtour-0926.mjs <outdir> */
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
const on = () => p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; const i = L.findIndex(li => li.classList.contains('on')); return i + ':' + (L[i]?.querySelector('.rd-t')?.textContent || '').trim() })
await p.screenshot({ path: `${out}/t00.png` }); console.log('t00', await on())
/* chapter by chapter through the rail (the same as the scroll reaching each one) */
for (let i = 0; i < 9; i++) {
  await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; L[i].click() }, i)
  await sleep(i === 8 ? 12000 : 8000)
  await p.screenshot({ path: `${out}/t${String(i + 1).padStart(2, '0')}.png` }); console.log('t' + (i + 1), await on())
}
/* the walkthrough */
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; const c = d.querySelector('#hud2 .h-cta'); c && c.click() }); await sleep(9000)
await p.screenshot({ path: `${out}/w1.png` })
await p.keyboard.down('w'); await sleep(1800); await p.keyboard.up('w'); await sleep(1500)
await p.screenshot({ path: `${out}/w2.png` })
console.log('errors', JSON.stringify(errs.slice(0, 6))); await b.close()
