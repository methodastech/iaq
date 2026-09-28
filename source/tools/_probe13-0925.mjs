import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 400000)
const regions = { none: null, east: 'c.x > 41.5', south: 'c.z > 3.5 && c.x <= 41.5 && c.x > -75' }
for (const [name, cond] of Object.entries(regions)) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
  await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 14000))
  const ov = await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; const bt = [...d.querySelectorAll('button, a, li, [role=button]')].find(e => /^\s*9?\s*Overall\s*$/.test(e.textContent) || /Overall$/.test(e.textContent.trim())); if (bt) { bt.click(); return bt.tagName + ':' + bt.textContent.trim().slice(0, 30) } const w = d.defaultView; w.scrollTo(0, d.documentElement.scrollHeight); return 'scrolled' })
  console.log('overall', ov); await new Promise(r => setTimeout(r, 30000))
  const r = await p.evaluate(cond => { const w = document.querySelector('.db3-frame').contentWindow, sc = w.__iaqScene
    sc.updateMatrixWorld(true); let meshes = 0, cut = 0, tot = 0; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]
    sc.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; meshes++
      const g = o.geometry, pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, e = o.matrixWorld.elements
      const P = i => { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]] }
      const keep = []
      for (let t = 0; t < n; t += 3) { const a = idx ? idx.getX(t) : t, bb = idx ? idx.getX(t + 1) : t + 1, cc = idx ? idx.getX(t + 2) : t + 2
        const A = P(a), B = P(bb), C = P(cc), c = { x: (A[0] + B[0] + C[0]) / 3, y: (A[1] + B[1] + C[1]) / 3, z: (A[2] + B[2] + C[2]) / 3 }; tot++
        for (let k = 0; k < 3; k++) { const v = [c.x, c.y, c.z][k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v }
        if (cond && eval(cond)) { cut++; continue } keep.push(a, bb, cc) }
      if (cond && keep.length < n) { const arr = pos.count > 65535 ? new Uint32Array(keep) : new Uint16Array(keep); const BA = pos.constructor; g.setIndex(new BA(arr, 1)) } })
    return { meshes, tot, cut, mn: mn.map(v => Math.round(v)), mx: mx.map(v => Math.round(v)) } }, cond)
  await p.evaluate(() => { document.querySelector('.db3-frame').scrollIntoView(); document.querySelectorAll('.db3-ghost').forEach(g => g.style.display = 'none') }); await new Promise(r => setTimeout(r, 3000))
  const fr = await p.evaluate(() => { const r = document.querySelector('.db3-frame').getBoundingClientRect(); return [r.top, r.height] })
  await p.screenshot({ path: `${OUT}/3d-cut-${name}.png` })
  console.log(name, JSON.stringify(r)); await p.close()
}
await b.close(); process.exit(0)
