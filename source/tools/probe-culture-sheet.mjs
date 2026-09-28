/* stitches probe shots into contact sheets so a phone run can be read in a few images */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [DIR, COLS = '4', PER = '8'] = process.argv.slice(2)
const files = fs.readdirSync(DIR).filter(f => /^\d+\.png$/.test(f)).sort()
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
for (let k = 0; k * +PER < files.length; k++) {
  const chunk = files.slice(k * +PER, (k + 1) * +PER)
  const html = `<body style="margin:0;background:#888;display:grid;grid-template-columns:repeat(${COLS},1fr);gap:6px">` + chunk.map(f => `<div><img style="width:100%;display:block" src="data:image/png;base64,${fs.readFileSync(DIR + '/' + f).toString('base64')}"><div style="font:12px sans-serif;color:#fff">${f}</div></div>`).join('') + '</body>'
  await p.setViewport({ width: 1600, height: 1000 })
  await p.setContent(html, { waitUntil: 'load' })
  await p.screenshot({ path: `${DIR}/sheet-${k}.png`, fullPage: true })
}
await b.close()
