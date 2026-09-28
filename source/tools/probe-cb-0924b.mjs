import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const w of [1440, 1280, 1160]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)) } })
  await new Promise(r => setTimeout(r, 600))
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const T = e => e ? Math.round(e.getBoundingClientRect().top + scrollY) : null
    const H = e => e ? Math.round(e.getBoundingClientRect().height) : null
    const gr = document.querySelector('.glance.gr'), body = document.querySelector('.gr .glance-body'), globe = document.querySelector('.gr .globe-host'), stats = document.querySelector('.gr .gstats')
    const cta = document.querySelector('.cb-cta'), line = document.querySelector('.cb-line')
    return { h1: document.querySelector('.hero h1')?.innerText.replace(/\n/g, ' / '), emLines: document.querySelector('.hero h1 em')?.getClientRects().length,
      grH: H(gr), grTop: T(gr), grBodyBottom: body ? Math.round(body.getBoundingClientRect().bottom + scrollY) : null, globeBottom: globe ? Math.round(globe.getBoundingClientRect().bottom + scrollY) : null, grBottom: gr ? Math.round(gr.getBoundingClientRect().bottom + scrollY) : null, statsBottom: stats ? Math.round(stats.getBoundingClientRect().bottom + scrollY) : null,
      lineBesideButton: cta && line ? Math.abs(T(cta) - T(line)) < 40 : null,
      companyLabelTop: T(document.querySelector('.cb-nav .f-h4')), emailLabelTop: T(document.querySelector('.cb-right .cb-ledger .crow .ref')), colsTop: T(document.querySelector('.cb-nav .f-cols')), ledgerTop: T(document.querySelector('.cb-right .cb-ledger')),
      crowPad: getComputedStyle(document.querySelector('.cb-right .cb-ledger .crow')).paddingTop, h4Line: getComputedStyle(document.querySelector('.cb-nav .f-h4')).lineHeight, h4mb: getComputedStyle(document.querySelector('.cb-nav .f-h4')).marginBottom }
  })))
  await p.close()
}
await b.close()
