import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 7000))
await p.evaluate(() => { const e = document.getElementById('globeHost'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150) }); await new Promise(r => setTimeout(r, 2000))
const host = await p.$('#globeHost'); const bb = await host.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2
const out = []
for (const [dx, dy, tag] of [[-260, 0, 'left'], [0, 220, 'down'], [0, -440, 'up'], [180, 120, 'diag']]) {
  await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 1; i <= 12; i++) { await p.mouse.move(cx + dx * i / 12, cy + dy * i / 12); await new Promise(r => setTimeout(r, 16)) } await p.mouse.up()
  await new Promise(r => setTimeout(r, 1800)); await host.screenshot({ path: `${OUT}/gd-${tag}.png` }); out.push(tag)
}
console.log(JSON.stringify(out)); await b.close(); process.exit(0)
