import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 1000 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(4000)
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; const L = [...d.querySelectorAll('#hud2 .h-rail li')]; L[4].click() }); await sleep(8000)
const r = await p.evaluate(() => {
  const d = document.querySelector('.db3-frame').contentDocument, w = d.defaultView
  const L = d.querySelector('#hud2 .h-left'), on = d.querySelector('#hud2 .h-rail li.on'), off = d.querySelector('#hud2 .h-rail li:not(.on)')
  const cs = (e, props) => { const c = w.getComputedStyle(e); return Object.fromEntries(props.map(k => [k, c[k]])) }
  const head = d.querySelector('#hud2 .h-head')
  const kids = [...L.children].map(c => c.tagName + '.' + c.className + ' ' + Math.round(c.getBoundingClientRect().height))
  const labels = [...d.querySelectorAll('body *')].filter(e => /^(DUCTWORK|HEPA CEILING|CLEANROOM PARTITIONS|ENVELOPE)$/i.test((e.textContent || '').trim()) && e.children.length <= 2).slice(0, 3).map(e => e.outerHTML.slice(0, 300) + ' || ' + JSON.stringify(cs(e, ['fontFamily', 'fontSize', 'letterSpacing', 'textTransform', 'backgroundColor', 'color', 'padding'])))
  return { kids, head: head.outerHTML.slice(0, 200), headCss: cs(head, ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'marginTop', 'marginBottom']), on: on.outerHTML.slice(0, 1600), off: off.outerHTML.slice(0, 700), ctrl: d.querySelector('#hud2 .h-ctrl').outerHTML.slice(0, 1400), labels }
})
console.log(JSON.stringify(r, null, 1))
await b.close()
