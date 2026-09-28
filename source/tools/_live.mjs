// persistent headless page for fast 3D iteration: POST /eval (js body, run in the 3D frame), GET /shot?f=path, GET /wheel?n=, GET /reload
import puppeteer from 'puppeteer-core'
import http from 'node:http'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const logs = []; p.on('console', m => { const t = m.text(); if (!/\[vite\]|React DevTools/.test(t)) logs.push(m.type() + ' ' + t.slice(0, 300)) }); p.on('pageerror', e => logs.push('pageerror ' + String(e.message || e).slice(0, 300)))
async function load () {
  await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
  await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
  await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
  await p.mouse.move(900, 400)
}
await load()
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); let body = ''; req.on('data', d => body += d); await new Promise(r => req.on('end', r))
  try {
    let out = null
    if (u.pathname === '/eval') out = await p.evaluate(src => { const W = document.querySelector('.db3-frame').contentWindow; return W.eval(src) }, body)
    else if (u.pathname === '/peval') out = await p.evaluate(src => eval(src), body)
    else if (u.pathname === '/shot') { await sleep(+(u.searchParams.get('wait') || 700)); await p.screenshot({ path: u.searchParams.get('f') }); out = 'ok' }
    else if (u.pathname === '/wheel') { const n = +(u.searchParams.get('n') || 1); for (let i = 0; i < n; i++) { await p.mouse.wheel({ deltaY: +(u.searchParams.get('d') || 100) }); await sleep(+(u.searchParams.get('gap') || 4400)) } out = 'ok' }
    else if (u.pathname === '/click') { await p.mouse.click(+u.searchParams.get('x'), +u.searchParams.get('y')); out = 'ok' }
    else if (u.pathname === '/reload') { await load(); out = 'ok' }
    else if (u.pathname === '/logs') { out = logs.splice(0) }
    else if (u.pathname === '/quit') { res.end('bye'); await b.close(); process.exit(0) }
    res.end(JSON.stringify(out))
  } catch (e) { res.statusCode = 500; res.end(String(e && e.message || e)) }
}).listen(49997, () => console.log('live on 49997'))
