import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(8000)
const r = await p.evaluate(() => {
  const w = document.querySelector('.db3-frame').contentWindow, o = [], hsl = { h: 0, s: 0, l: 0 }
  for (const [nm, sc] of [['boss', w.__iaqBoss], ['main', w.__iaqScene]]) sc && sc.traverse(x => { if (!x.isMesh) return; for (const m of [].concat(x.material || [])) { if (!m || !m.color) continue; m.color.getHSL(hsl); const warm = hsl.h > .06 && hsl.h < .2 && hsl.s > .3; const vc = !!(x.geometry && x.geometry.attributes.color); if (warm || (m.map && /crane|excav|roller/i.test(x.name + (x.parent && x.parent.name)))) o.push(`${nm} ${x.name || '-'} < ${(x.parent && x.parent.name) || '-'} < ${(x.parent && x.parent.parent && x.parent.parent.name) || '-'} ${m.type} #${m.color.getHexString()} h=${hsl.h.toFixed(3)} s=${hsl.s.toFixed(2)} l=${hsl.l.toFixed(2)} map=${!!m.map} vc=${vc} steel=${!!m.userData.iaqSteel} inst=${!!x.isInstancedMesh}`) } })
  return [...new Set(o)].slice(0, 40).join('\n')
})
console.log(r); await b.close()
