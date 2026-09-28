import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
const g = await p.evaluate(() => { const s = document.getElementById('build3d'); const r = s.getBoundingClientRect(); return { top: r.top + scrollY } })
await p.evaluate(v => scrollTo(0, v), g.top - 700); await wait(1500); await p.evaluate(v => scrollTo(0, v), g.top); await wait(9000)
const F = () => p.evaluateHandle(() => document.querySelector('#build3d iframe').contentDocument)
const st = () => p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument, w = d.defaultView, asm = w.__iaqAsm; const rows = [...d.querySelectorAll('#hud2 .h-rail li')]; return { on: (d.querySelector('#hud2 .h-rail li.on .rd-t') || {}).textContent, eyesShown: rows.filter(li => { const e = li.querySelector('.iaq-eye'); return e && getComputedStyle(e).display !== 'none' }).length, pressed: rows.filter(li => li.classList.contains('iaq-xr')).length, zoom: +asm.zoomLevel.toFixed(2), chip: (d.getElementById('iaq-xr-chip') || {}).textContent || '', chipHidden: (d.getElementById('iaq-xr-chip') || {}).hidden } })
/* 1. the finished view: rail jump to Overall */
await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')].pop().click() }); await wait(14000)
const s1 = await st(); await p.screenshot({ path: `${out}/xray-0-final.png`, captureBeyondViewport: false })
/* 2. x-ray Fire Protection */
const clickEye = async i => p.evaluate(i => { const d = document.querySelector('#build3d iframe').contentDocument; d.querySelectorAll('#hud2 .h-rail li')[i].querySelector('.iaq-eye').click() }, i)
await clickEye(3); await wait(2500)
const vis = () => p.evaluate(() => { const w = document.querySelector('#build3d iframe').contentWindow, asm = w.__iaqAsm; const chainOn = x => { let q = x; while (q) { if (!q.visible) return false; q = q.parent } return true }; const r = {}; asm.groups.forEach((objs, i) => { const c = asm.stages[i].chapter; let v = 0, n = 0; for (const o of objs) o.traverse(m => { if (m.isMesh) { n++; if (chainOn(m)) v++ } }); r[c] = (r[c] || 0) + v }); let ghosts = 0; let root = null; for (const v of asm.groups.values()) { for (const o of v) { root = o; break } if (root) break } while (root.parent) root = root.parent; root.traverse(m => { if (m.isMesh && m.userData.iaqXM) ghosts++ }); let solidCivil = 0; asm.groups.forEach((objs, i) => { if (asm.stages[i].chapter !== 'Civil & Structural') return; for (const o of objs) o.traverse(m => { if (m.isMesh && chainOn(m) && !m.userData.iaqXM) solidCivil++ }) }); r.solidCivil = solidCivil; return { visibleBySystem: r, ghosted: ghosts } })
const s2 = { ...(await st()), ...(await vis()) }; await p.screenshot({ path: `${out}/xray-1-fire.png`, captureBeyondViewport: false })
/* 3. add Air-conditioning */
await clickEye(4); await wait(2500); const s3 = { ...(await st()), ...(await vis()) }; await p.screenshot({ path: `${out}/xray-2-fire-ac.png`, captureBeyondViewport: false })
/* 4. all eight through the envelope */
await clickEye(8); await wait(2500); const s4 = { ...(await st()), ...(await vis()) }; await p.screenshot({ path: `${out}/xray-3-all.png`, captureBeyondViewport: false })
/* 5. clear via the chip */
await p.evaluate(() => document.querySelector('#build3d iframe').contentDocument.querySelector('#iaq-xr-chip button').click()); await wait(1500)
const s5 = { ...(await st()), ...(await vis()) }; await p.screenshot({ path: `${out}/xray-4-cleared.png`, captureBeyondViewport: false })
/* 6. leave the last chapter: the auto zoom is taken back */
await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; d.querySelectorAll('#hud2 .h-rail li')[2].click() }); await wait(9000)
const s6 = await st()
console.log(JSON.stringify({ errs, s1, s2, s3, s4, s5, s6 }, null, 1))
await b.close()
