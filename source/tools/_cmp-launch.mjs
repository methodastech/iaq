import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
for (const [label, base] of [['DEV  ', 'http://localhost:5177'], ['LAUNCH', 'http://localhost:3000']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
  await p.goto(base + process.argv[2], { waitUntil: 'domcontentloaded', timeout: 45000 })
  await new Promise(r => setTimeout(r, 1200))
  const t = await p.evaluate(() => (document.querySelector('main') || document.body).innerText)
  const lines = t.split(/\n+/).filter(l => /supplied by IAQ|representation|to be confirmed|TBC|awaiting|still to come/i.test(l))
  console.log(label, process.argv[2], '· matches', lines.length)
  lines.slice(0, 8).forEach(l => console.log('      · ' + l.trim().slice(0, 120)))
  await p.close()
}
await b.close()
