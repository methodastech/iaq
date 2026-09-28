import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.cyc-band').scrollIntoView()); await new Promise(r => setTimeout(r, 4000))
console.log(JSON.stringify(await p.evaluate(() => {
  const out = []
  for (const n of document.querySelectorAll('.cyc-node')) {
    const bEl = n.querySelector('.cyc-txt b'); const rg = document.createRange(); rg.selectNodeContents(bEl); const tr = rg.getBoundingClientRect(), br = bEl.getBoundingClientRect()
    const cs = getComputedStyle(bEl)
    out.push({ t: bEl.textContent, text: Math.round(tr.width), box: Math.round(br.width), font: cs.fontFamily.split(',')[0], mask: cs.webkitMaskImage !== 'none' || cs.clipPath !== 'none', after: getComputedStyle(bEl, '::after').content, txtAfter: getComputedStyle(n.querySelector('.cyc-txt'), '::after').content, numW: Math.round(n.querySelector('.cyc-num').getBoundingClientRect().width) })
  }
  return { fonts: document.fonts.status, out }
}), null, 0))
const n = (await p.$$('.cyc-node'))[3]; await n.screenshot({ path: `${OUT}/m-node4-2x.png` })
await b.close()
