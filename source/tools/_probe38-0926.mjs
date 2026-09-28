import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const out = {}
for (const r of ['tool-installation', 'energy-management']) {
  const p = await b.newPage(); await p.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await p.goto('http://localhost:5177/services/' + r + '?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
  out[r] = await p.evaluate(() => ['.un-bento-c > b', '.un-bento-c.is-lead > b', '.un-flow li > b', '.un-svc7-grid li > b', '.un-pains2 li > b'].map(s => { const e = document.querySelector(s); return s + ' ' + (e ? getComputedStyle(e).fontSize : '-') }))
  await p.close()
}
console.log(JSON.stringify(out)); await b.close(); process.exit(0)
