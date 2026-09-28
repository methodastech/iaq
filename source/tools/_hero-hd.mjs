import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] })
const out = process.argv[2]; const res = []
for (const [w, h, mob, dpr] of [[1440, 900, false, 2], [390, 844, true, 2]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:61862/', { waitUntil: 'networkidle2', timeout: 120000 }); await new Promise(r => setTimeout(r, 8500))
  const m = await p.evaluate(() => { const v = [...document.querySelectorAll('.hero-video video')]; const on = v.find(x => x.classList.contains('on')) || v[0]; const cv = document.getElementById('heroCanvas'); return { src: on && on.currentSrc.replace(location.origin, ''), vw: on && on.videoWidth, vh: on && on.videoHeight, playing: on && !on.paused, canvas: cv && getComputedStyle(cv).display } })
  await p.screenshot({ path: `${out}/hero-${w}.png`, captureBeyondViewport: false })
  res.push({ w, errs, ...m }); await p.close()
}
console.log(JSON.stringify(res))
await b.close()
