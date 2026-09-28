import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
for (const [label, base] of [['DEV', 'http://localhost:5177'], ['LAUNCH', 'http://localhost:3000']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 1200 })
  await p.goto(base + '/policies', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await new Promise(r => setTimeout(r, 1200))
  const t = await p.evaluate(() => (document.querySelector('main') || document.body).innerText)
  console.log('===== ' + label + ' (' + t.length + ' chars)')
  console.log(t.split(/\n+/).map(l => '  ' + l.trim()).slice(0, 34).join('\n'))
  await p.close()
}
await b.close()
