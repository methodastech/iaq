/* 9 Oct 2026 (Bazil: "make sure stable"): the packaged deck left in its showreel loop, as on the booth TV, sampled every
   20 s: the slide on show, JS heap, DOM nodes, the 3D canvas and its context, films playing, errors. Usage:
   node tools/soak-deck-1009.mjs http://localhost:8799 <minutes> */
import puppeteer from 'puppeteer-core'
const [base = 'http://localhost:8799', mins = '25'] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--window-size=1920,1080', '--autoplay-policy=no-user-gesture-required', '--enable-precise-memory-info'] })
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 })
const errs = []; p.on('pageerror', e => errs.push(['pageerror', e.message.slice(0, 160)])); p.on('console', m => { if (m.type() === 'error') errs.push(['console', m.text().slice(0, 160)]) })
p.on('response', r => { if (r.status() >= 400) errs.push([r.status(), r.url()]) })
await p.goto(base + '/?reel', { waitUntil: 'networkidle2', timeout: 60000 })
const end = Date.now() + (+mins) * 60000, samples = [], seen = new Set()
while (Date.now() < end) {
  await new Promise(r => setTimeout(r, 20000))
  const m = await p.metrics()
  const s = await p.evaluate(() => {
    const f = document.querySelector('.pr-keep iframe'); let gl = null
    try { const r = f && f.contentWindow.__iaqRenderer; const c = r && r.getContext && r.getContext(); gl = r ? { lost: c ? c.isContextLost() : null, canvas: [r.domElement.width, r.domElement.height], tex: r.info.memory.textures, geo: r.info.memory.geometries } : null } catch (e) { gl = 'err ' + e.message }
    const vids = [...document.querySelectorAll('video')].filter(v => v.classList.contains('on')).map(v => ({ t: +v.currentTime.toFixed(1), paused: v.paused, err: !!v.error }))
    return { hash: location.hash, tab: (document.querySelector('.pr-tabs a.on') || {}).textContent, fail: !!document.querySelector('.pr-fail'), gl, vids }
  })
  seen.add(s.tab)
  samples.push({ min: +((Date.now() - (end - mins * 60000)) / 60000).toFixed(1), heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), nodes: m.Nodes, listeners: m.JSEventListeners, ...s })
  console.log(JSON.stringify(samples[samples.length - 1]))
}
console.log('SUMMARY ' + JSON.stringify({ slidesSeen: [...seen], heapFirst: samples[0] && samples[0].heapMB, heapLast: samples[samples.length - 1].heapMB, heapMax: Math.max(...samples.map(x => x.heapMB)), failures: samples.filter(x => x.fail).length, errors: errs.slice(0, 15), errCount: errs.length }))
await b.close()
