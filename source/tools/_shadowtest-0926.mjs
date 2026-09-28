import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 14000 : 6500) }
const r = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow, bs = w.__iaqBoss, R = w.__iaqRenderer, o = []
  bs.traverse(x => { if (x.isHemisphereLight) { o.push('hemi ' + x.intensity); x.intensity = 0 } if (x.isDirectionalLight && !x.castShadow) { o.push('fill ' + x.intensity); x.intensity = 0 } })
  o.push('env ' + bs.environmentIntensity); bs.environmentIntensity = 0
  const hs = bs.getObjectByName('handover-site'); let pav = null; hs.children.forEach(c => { if (c.isMesh && c.geometry && c.geometry.index && c.geometry.index.count / 3 === 1608) pav = c }); o.push('paving ' + !!pav + ' recv=' + (pav && pav.receiveShadow) + ' prog=' + (pav && R.properties.get(pav.material).currentProgram ? 'yes' : 'no'))
  const pr = pav && R.properties.get(pav.material); o.push('paving props receiveShadow=' + (pr && pr.receiveShadow) + ' lightsStateVersion=' + (pr && pr.lightsStateVersion))
  const sh = hs.getObjectByName('iaq-yard-shade'); o.push('shade ' + !!sh + (sh ? ' vis=' + sh.visible + ' mat=' + sh.material.type + ' op=' + sh.material.opacity : '')); let sun = null; bs.traverse(x => { if (x.isDirectionalLight && x.castShadow) sun = x }); if (sun) { sun.position.set(160, 60, 20); o.push('sun moved low') } if (sh) sh.material.opacity = .9; window.dispatchEvent(new Event('resize')); return o.join(' | ') })
console.log(r)
await sleep(2500); await p.mouse.move(900, 500); await p.mouse.move(905, 505); await sleep(1500)
await p.screenshot({ path: `${out}/shadowtest.png` })
await b.close()
