import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 300000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 14000))
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.defaultView.scrollTo(0, d.documentElement.scrollHeight) }); await new Promise(r => setTimeout(r, 30000))
const r = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow, sc = w.__iaqScene; sc.updateMatrixWorld(true)
  const pts = [], groups = {}
  sc.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return
    let top = o; const chain = []; while (top.parent && top.parent !== sc) { chain.push(top.name); top = top.parent } const gk = (top.name || top.type) 
    const g = o.geometry, pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, e = o.matrixWorld.elements
    groups[gk] = groups[gk] || { m: 0, t: 0, vis: o.visible }; groups[gk].m++; groups[gk].t += n / 3
    const step = Math.max(3, Math.floor(n / 3 / 300) * 3)
    for (let t = 0; t < n; t += step) { const i = idx ? idx.getX(t) : t; const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); pts.push([+(e[0] * x + e[4] * y + e[8] * z + e[12]).toFixed(1), +(e[1] * x + e[5] * y + e[9] * z + e[13]).toFixed(1), +(e[2] * x + e[6] * y + e[10] * z + e[14]).toFixed(1), o.visible && (!o.parent || o.parent.visible) ? 1 : 0]) } })
  return { pts, groups } })
fs.writeFileSync(OUT + '/live-plan.json', JSON.stringify(r.pts)); console.log(Object.entries(r.groups).map(([k, v]) => k + ':' + v.m + '/' + Math.round(v.t)).join('  '))
await b.close(); process.exit(0)
