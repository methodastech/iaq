import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--autoplay-policy=no-user-gesture-required'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('http://localhost:5177/services/tool-installation?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
const v1 = await p.evaluate(async () => { const v = document.querySelector('.un-hero-fig video'); if (!v) return null; const a = v.currentTime; await new Promise(r => setTimeout(r, 1500)); return { src: v.currentSrc.split('/').pop(), ready: v.readyState, dur: Math.round(v.duration * 10) / 10, moved: v.currentTime > a, w: v.videoWidth, alt: document.querySelector('.un-hero-fig img').alt.slice(0, 60) } })
await p.screenshot({ path: `${OUT}/pcu-hero-new.png` })
const home = await p.evaluate(async () => (await fetch('/assets/videos/hookup-team-rep.mp4', { method: 'HEAD' })).headers.get('content-length'))
console.log(JSON.stringify({ v1, home, errs })); await b.close(); process.exit(0)
