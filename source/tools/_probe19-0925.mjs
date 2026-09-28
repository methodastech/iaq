import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 300000)
// 1 the standalone page
let p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
await p.goto('http://localhost:5177/3d/index.html', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 12000))
await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await new Promise(r => setTimeout(r, 30000))
const s1 = await p.evaluate(() => { let n = 0; window.__iaqScene.traverse(o => { if (o.isMesh && o.userData.iaqTrim) n++ }); window.__iaqScene.onBeforeRender = (r, s, c) => { if (c.isPerspectiveCamera) { c.position.set(-150, 150, 190); c.lookAt(0, 4, 8); c.updateMatrixWorld(true) } }; return { loaded: !!window.__iaqTrimLoaded, trimmed: n } })
await new Promise(r => setTimeout(r, 2000)); await p.screenshot({ path: `${OUT}/standalone.png` }); await p.close()
// 2 the home frame, then the walkthrough
p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); p.on('pageerror', e => errs.push('home ' + e.message.slice(0, 140)))
await p.goto('http://localhost:5177/?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => document.querySelector('.db3-frame').scrollIntoView()); await new Promise(r => setTimeout(r, 16000))
const s2 = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow; let n = 0; w.__iaqScene.traverse(o => { if (o.isMesh && o.userData.iaqTrim) n++ }); return { loaded: !!w.__iaqTrimLoaded, trimmed: n } })
const clicked = await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; const bt = [...d.querySelectorAll('button')].find(x => /Enter the cleanroom/.test(x.textContent)); if (bt) { bt.click(); return true } return false })
await new Promise(r => setTimeout(r, 12000))
await p.screenshot({ path: `${OUT}/walk.png` })
console.log(JSON.stringify({ s1, s2, clicked, errs }))
await b.close(); process.exit(0)
