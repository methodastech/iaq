import puppeteer from 'puppeteer-core'
/* 26 Sep: the construction ground (site scene) at chapter 1. node tools/_ground-0926.mjs <outdir> [tag] */
const out = process.argv[2], tag = process.argv[3] || 'g', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(6000)
const r = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow, bs = w.__iaqBoss, site = bs.getObjectByName('boss-site'), o = []
  site.children.forEach((c, i) => { if (!c.isMesh) return; const m = [].concat(c.material)[0], t = m.map; o.push(`${i} ${c.geometry.type} vis=${c.visible} col=${m.color.getHexString()} rough=${m.roughness} map=${t ? (t.image ? (t.image.width + 'x' + t.image.height + ' ' + (t.image.constructor && t.image.constructor.name)) : 'noimg') + ' rep=' + t.repeat.x.toFixed(1) + ',' + t.repeat.y.toFixed(1) + ' wrap=' + t.wrapS + ' cs=' + t.colorSpace + ' aniso=' + t.anisotropy : 'none'} nmap=${!!m.normalMap} uvscale? ${c.geometry.attributes.uv ? c.geometry.attributes.uv.count : 0}`) })
  return o.join('\n') })
console.log(r)
await p.screenshot({ path: `${out}/${tag}-ch1.png` })
await b.close()
