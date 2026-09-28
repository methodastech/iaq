import puppeteer from 'puppeteer-core'
/* 26 Sep: the handover car park: where its bays are, and whether the cars ever arrive. */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const net = []; p.on('requestfinished', r => { if (/props|\.glb/.test(r.url())) net.push(r.url().replace(/.*\/3d\//, '') + ' ' + (r.response() && r.response().status())) }); p.on('requestfailed', r => { if (/\.glb/.test(r.url())) net.push('FAILED ' + r.url().replace(/.*\/3d\//, '') + ' ' + (r.failure() && r.failure().errorText)) })
const cons = []; p.on('console', m => { const t = m.text(); if (/car|glb|fail|error/i.test(t)) cons.push(t.slice(0, 160)) })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 12000 : 6000) }
await sleep(15000)
const r = await p.evaluate(() => {
  const w = document.querySelector('.db3-frame').contentWindow, hs = w.__iaqBoss.getObjectByName('handover-site'), o = []
  hs.children.forEach((c, i) => { if (c.type === 'Group' && !c.isMesh) o.push(`${i} ${c.name || 'group'} kids=${c.children.length} pos=${[c.position.x, c.position.y, c.position.z].map(n => Math.round(n * 10) / 10).join(',')} rotY=${c.rotation.y.toFixed(2)}`) })
  return o.join('\n')
})
console.log(r); console.log('NET', net.filter(x => /props|FAILED|workers/.test(x)).join(' | ')); console.log('CONSOLE', cons.slice(0, 8).join(' | '))
await b.close()
