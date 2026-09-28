import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
for (const [r, t] of [['epc-construction', 'epc'], ['tool-installation', 'tool'], ['energy-management', 'efm']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177/services/' + r + '?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 5000))
  await p.screenshot({ path: `${OUT}/${t}-hero.png` }); await p.close()
}
await b.close(); process.exit(0)
