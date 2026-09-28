import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warn') errs.push(m.type() + ' ' + m.text().slice(0, 160)) })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 7000))
await p.evaluate(() => { const e = document.getElementById('globeHost'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150) }); await new Promise(r => setTimeout(r, 2000))
const host = await p.$('#globeHost')
await host.screenshot({ path: `${OUT}/cl-0.png` })
for (let k = 1; k <= 4; k++) {
  const r = await p.evaluate(() => { const c = document.getElementById('globeCv'); const gl = c.getContext('webgl2') || c.getContext('webgl'); const ext = gl && gl.getExtension('WEBGL_lose_context'); if (ext) { ext.loseContext(); return 'lost' } return 'no ext' })
  await new Promise(r => setTimeout(r, 4000))
  const st = await p.evaluate(() => ({ tags: document.querySelectorAll('#globeHost .globe-tag').length, flat: !!document.querySelector('#globeHost .globe-flat'), cvs: document.querySelectorAll('#globeHost canvas').length }))
  await host.screenshot({ path: `${OUT}/cf-${k}.png` }); console.log(k, r, JSON.stringify(st))
}
console.log(JSON.stringify(errs.slice(0, 6))); await b.close(); process.exit(0)
