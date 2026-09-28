import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
const r = await p.evaluate(async () => { const out = []; const e = document.getElementById('works'); const a = document.querySelector('.ssb-a[data-k="works"]')
  const ev = new MouseEvent('click', { bubbles: true, cancelable: true }); const ok = a.dispatchEvent(ev); out.push(['defaultPrevented', ev.defaultPrevented, 'hash', location.hash])
  for (let i = 0; i < 8; i++) { await new Promise(r => setTimeout(r, 350)); out.push([Math.round(scrollY), Math.round(e.getBoundingClientRect().top), location.hash]) }
  return out })
await p.screenshot({ path: process.argv[2] + '/bar-land.png' }); console.log(JSON.stringify(r.slice(-1))); await b.close(); process.exit(0)
