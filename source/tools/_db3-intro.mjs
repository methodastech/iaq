import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(3000)
const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
// wheel down to the section's top, as a reader would, then wait for the app
let y = 0; while (y < top) { y = Math.min(top, y + 400); await p.mouse.wheel({ deltaY: 400 }); await wait(60) }
await wait(9000)
const st = await p.evaluate(() => { const s = document.getElementById('build3d'); const f = s.querySelector('iframe'); const d = f && f.contentDocument; const load = s.querySelector('.db3-load'); return { cls: s.className, scrollY: Math.round(scrollY), secTop: Math.round(s.getBoundingClientRect().top), loadDone: load.className, status: load.textContent.trim().slice(0, 60), appStatus: d && d.querySelector('#status, .status') ? d.querySelector('#status, .status').textContent.slice(0, 80) : null, appTitle: d && d.body ? d.body.innerText.slice(0, 120).replace(/\n/g, ' | ') : null, appScroll: d ? Math.round(d.documentElement.scrollTop || d.body.scrollTop) : null } })
await p.screenshot({ path: `${process.argv[2]}/db3-start.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } })
console.log(JSON.stringify(st))
await b.close()
