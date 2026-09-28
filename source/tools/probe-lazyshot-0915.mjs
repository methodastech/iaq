/* 15 Sep: confirm images that looked grey in tall element captures really paint: decode each, then element shots */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [url, sel, anchor, name] of [
  ['/contact', '#offices', '.off-grid', 'contact-390-offgrid'],
  ['/careers/culture', '.cu-places', '.cu-pgrid', 'culture-390-pgrid'],
  ['/careers/culture', '.cu-grow', '.cu-uni', 'culture-390-uni'],
]) {
  const p = await b.newPage()
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto('http://localhost:5177' + url, { waitUntil: 'networkidle0', timeout: 60000 })
  const r = await p.evaluate(async (sel) => {
    document.querySelectorAll('.cu-rv').forEach(e => { e.classList.add('cu-in'); e.style.opacity = '1'; e.style.transform = 'none' })
    const imgs = [...document.querySelectorAll(sel + ' img')]
    imgs.forEach(i => { i.loading = 'eager'; i.decoding = 'sync' })
    const res = await Promise.all(imgs.map(async i => { try { await i.decode() } catch (e) {} return { src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 } }))
    return { total: res.length, bad: res.filter(x => !x.ok) }
  }, sel)
  const el = await p.$(anchor)
  const h = await el.evaluate(e => e.getBoundingClientRect().height)
  await p.setViewport({ width: 390, height: Math.ceil(h) + 400, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await new Promise(r => setTimeout(r, 1500))
  await el.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name, JSON.stringify(r), 'h', Math.round(h)); await p.close()
}
await b.close()
