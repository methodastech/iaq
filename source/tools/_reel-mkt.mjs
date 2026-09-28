import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:50519/', { waitUntil: 'networkidle2', timeout: 120000 })
const want = { 'hero-mkt-data-centre': null, 'hero-mkt-district-cooling': null }; const t0 = Date.now()
while (Date.now() - t0 < 150000 && Object.values(want).some(v => !v)) {
  const s = await p.evaluate(() => { const v = [...document.querySelectorAll('.hero-video video')].find(x => x.classList.contains('on')); return v ? { src: v.currentSrc.replace(location.origin, ''), w: v.videoWidth, h: v.videoHeight, playing: !v.paused, t: +v.currentTime.toFixed(1), name: (document.querySelector('.hero-scenes b, .hero-scenes .hs-name, .hs-name') || {}).textContent || null } : null })
  if (s) for (const k of Object.keys(want)) if (!want[k] && s.src.includes(k) && s.t > 1.5) { want[k] = { ...s, atMs: Date.now() - t0 }; await p.screenshot({ path: `${process.argv[2]}/reel-${k}.png`, captureBeyondViewport: false }) }
  await new Promise(r => setTimeout(r, 500))
}
console.log(JSON.stringify({ errs, want }))
await b.close()
