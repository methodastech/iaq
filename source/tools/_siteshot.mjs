// Viewport shots of site routes at given document y: node tools/_siteshot.mjs <outdir> <width> route@y,route@y,...
import puppeteer from 'puppeteer-core'
const [out, W, list] = [process.argv[2], +process.argv[3], process.argv[4].split(',')]
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: 900, isMobile: W < 700, hasTouch: W < 700 })
await p.evaluateOnNewDocument(() => { try { window.__iaqLoaderPlayed = true } catch (e) {} })
let k = 0
for (const it of list) {
  const [route, y] = it.split('@')
  try { await p.goto('http://localhost:57375' + route + '?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) {}
  await sleep(900)
  await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } })
  await p.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo({ top: y, behavior: 'instant' }) }, Math.max(0, (+y || 0) - 120))
  await sleep(1300)
  await p.screenshot({ path: `${out}/${String(k++).padStart(2, '0')}-${route.replace(/\//g, '_') || 'home'}.png` })
}
await b.close(); console.log('shots', k)
