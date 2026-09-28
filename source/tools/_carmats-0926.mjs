import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1200, height: 800 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(12000)
const r = await p.evaluate(() => {
  const w = document.querySelector('.db3-frame').contentWindow, hs = w.__iaqBoss.getObjectByName('handover-site'), seen = new Set(), o = []
  hs.traverse(c => { if (!/^car-/.test(c.name || '') || seen.has(c.name)) return; seen.add(c.name); const parts = []; c.traverse(m => { if (m.isMesh) { const mm = [].concat(m.material)[0]; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const bb = g.boundingBox; parts.push(`${m.name}:${mm.name || ''}:${mm.color.getHexString()}${mm.map ? '+map' : ''} v=${g.attributes.position.count} col=${!!g.attributes.color}`) } }); o.push(c.name + ' -> ' + parts.join(' | ')) })
  return o.join('\n')
})
console.log(r); await b.close()
