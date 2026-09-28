import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
const g = await p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height } })
await p.evaluate(v => scrollTo(0, v), g.top - 700); await wait(1500); await p.evaluate(v => scrollTo(0, v), g.top); await wait(9000)
await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; const li = [...d.querySelectorAll('#hud2 .h-rail li')].pop(); li.click() }); await wait(14000); await p.screenshot({ path: process.argv[2] + '/xray-probe-end.png', captureBeyondViewport: false })
const m = await p.evaluate(() => {
  const w = document.querySelector('#build3d iframe').contentWindow, asm = w.__iaqAsm
  const out = {}
  asm.groups.forEach((objs, i) => { const c = asm.stages[i] && asm.stages[i].chapter; for (const o of objs) o.traverse(x => { if (!x.isMesh) return; const e = out[c] || (out[c] = { selfHidden: 0, hiddenBy: {}, geo: 0, noGeo: 0, sample: null }); if (!x.visible) e.selfHidden++; else { let q = x.parent; while (q) { if (!q.visible) { e.hiddenBy[q.name || q.type] = (e.hiddenBy[q.name || q.type] || 0) + 1; break } q = q.parent } } const pc = x.geometry && x.geometry.attributes && x.geometry.attributes.position ? x.geometry.attributes.position.count : 0; if (pc > 0) e.geo++; else e.noGeo++; if (!e.sample) { const chain = []; let q = x; while (q) { chain.push((q.name || q.type) + (q.visible ? '' : '(H)')); q = q.parent } e.sample = chain.slice(0, 6).join(' < ') } }) })
  const layerRoots = asm.layerRoots ? (asm.layerRoots instanceof Map ? [...asm.layerRoots.keys()] : Object.keys(asm.layerRoots)).slice(0, 40) : null
  return { out, layerRoots, liveStoreys: asm.liveStoreys ? [...(asm.liveStoreys.keys ? asm.liveStoreys.keys() : asm.liveStoreys)].slice(0, 10) : null }
})
console.log(JSON.stringify(m, null, 1))
await b.close()
