import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const out = process.argv[2]; const res = []
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:50519/services/tool-installation', { waitUntil: 'networkidle2', timeout: 120000 }); await new Promise(r => setTimeout(r, 5000))
res.push(await p.evaluate(() => { const v = document.querySelector('.un-hero-fig video'); return { page: 'tool-installation', src: v && v.currentSrc.replace(location.origin, ''), w: v && v.videoWidth, playing: v && !v.paused, t: v && +v.currentTime.toFixed(2), alt: v && v.getAttribute('aria-label') } }))
await p.screenshot({ path: `${out}/captool.png`, captureBeyondViewport: false })
/* the home reel: wait for the hook-up clip to be the one on screen */
await p.goto('http://localhost:50519/', { waitUntil: 'networkidle2', timeout: 120000 })
const t0 = Date.now(); let hit = null
while (Date.now() - t0 < 90000) { hit = await p.evaluate(() => { const v = [...document.querySelectorAll('.hero-video video')].find(x => x.classList.contains('on')); return v && /hookup-team-rep/.test(v.currentSrc) ? { src: v.currentSrc.replace(location.origin, ''), w: v.videoWidth, playing: !v.paused } : null }); if (hit) break; await new Promise(r => setTimeout(r, 400)) }
if (hit) { await new Promise(r => setTimeout(r, 2200)); await p.screenshot({ path: `${out}/home-hookup.png`, captureBeyondViewport: false }) }
res.push({ page: 'home reel', ...(hit || { reached: false }), afterMs: Date.now() - t0 })
console.log(JSON.stringify({ errs, res }))
await b.close()
