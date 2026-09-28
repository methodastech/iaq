import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
await p.evaluate(v => scrollTo(0, v), top - 700); await wait(1500); await p.evaluate(v => scrollTo(0, v), top); await wait(9000)
const m = await p.evaluate(() => {
  const d = document.querySelector('#build3d iframe').contentDocument; const q = s => d.querySelector(s)
  const info = e => e ? { tag: e.tagName.toLowerCase(), cls: String(e.className), text: e.textContent.trim().slice(0, 70), font: getComputedStyle(e).fontFamily.slice(0, 40), size: getComputedStyle(e).fontSize, tt: getComputedStyle(e).textTransform, ls: getComputedStyle(e).letterSpacing, w: getComputedStyle(e).fontWeight } : null
  return {
    head: info(q('#hud2 .h-head')), eyebrow: info(q('#hud2 .h-eyebrow')), stand: info(q('#hud2 .h-stand')),
    seq: info(q('#hud2 .h-rail li.on .rd-seq')), ct: info(q('#hud2 .h-rail li.on .rd-ct')), t: info(q('#hud2 .h-rail .rd-t')), n: info(q('#hud2 .h-rail .rd-n')),
    playBtns: [...d.querySelectorAll('#hud2 .h-play > button')].map(info), speedL: info(q('#hud2 .h-speed-l')), speedB: info(q('#hud2 .h-speed button')),
    skin: info(q('#skin-switch button')), zoom: info(q('#zoom-in')), chip: info(q('#part-chip')), status: info(q('#status')), hint: info(q('#scroll-hint')),
    fontsLoaded: [...d.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status).slice(0, 8)
  }
})
console.log(JSON.stringify(m, null, 1))
await b.close()
