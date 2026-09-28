import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: +(process.argv[2] || 1440), height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2000))
console.log(JSON.stringify(await p.evaluate(() => {
  const row = document.querySelector('.hmk-row.hmk-iso')
  const li = [...row.querySelectorAll('li')]
  const r = row.getBoundingClientRect()
  return {
    vw: innerWidth, rowLeft: Math.round(r.left), rowRight: Math.round(r.right),
    items: li.map(l => { const a = l.querySelector('.hmk-nm').getBoundingClientRect(); return { l: Math.round(a.left), r: Math.round(a.right), h: Math.round(a.height) } }),
    gap: getComputedStyle(row).columnGap,
    stageGap: getComputedStyle(li[0].querySelector('a')).rowGap,
  }
})))
await b.close()
