import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const POSES = JSON.parse(process.argv[3])
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 300000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 14000))
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.defaultView.scrollTo(0, d.documentElement.scrollHeight) }); await new Promise(r => setTimeout(r, 30000))
await p.evaluate(() => { const f = document.querySelector('.db3-frame'), d = f.contentDocument, w = f.contentWindow; f.scrollIntoView()
  const h = d.getElementById('hud2'); if (h) h.style.visibility = 'hidden'; d.querySelectorAll('#skin-switch, #iaq-xr-chip, #iaq-walk-hud').forEach(x => x.style.visibility = 'hidden'); document.querySelectorAll('.db3-intro, .db3-ghost-cap').forEach(x => x.style.display = 'none')
  w.__iaqScene.onBeforeRender = (r, s, c) => { if (c.isPerspectiveCamera && w.__pose) { c.position.set(...w.__pose); c.lookAt(...w.__look); c.updateMatrixWorld(true) } } })
const shoot = async tag => { await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 2500)); await p.screenshot({ path: `${OUT}/${tag}.png` }) }
for (const [k, pose, look] of POSES) {
  await p.evaluate((pose, look) => { const w = document.querySelector('.db3-frame').contentWindow; w.__pose = pose; w.__look = look; w.__iaqScene.traverse(o => { if (o.userData.__hid) { o.visible = true; o.userData.__hid = 0 } }) }, pose, look)
  await shoot('st-' + k)
  await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow; w.__iaqScene.traverse(o => { if ((o.isMesh || o.isLine || o.isLineSegments || o.isPoints || o.isSprite) && o.visible) { o.visible = false; o.userData.__hid = 1 } }) })
  await shoot('bg-' + k)
}
console.log('done'); await b.close(); process.exit(0)
