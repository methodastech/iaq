/* 15 Sep: why do the footer contact rows sit at a fixed offset? computed placement, margin, transform, offsets */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'domcontentloaded', timeout: 90000 }); await new Promise(r => setTimeout(r, 4000))
console.log(JSON.stringify(await p.evaluate(() => {
  const inn = document.querySelector('section.close3d .close-in'); const ics = getComputedStyle(inn)
  const kid = el => { const s = getComputedStyle(el); return { tag: el.tagName, cls: el.className, offsetTop: el.offsetTop, offsetH: el.offsetHeight, marginTop: s.marginTop, marginBottom: s.marginBottom, transform: s.transform, position: s.position, top: s.top, gridRowStart: s.gridRowStart, gridRowEnd: s.gridRowEnd, alignSelf: s.alignSelf, paddingTop: s.paddingTop, minHeight: s.minHeight, height: s.height } }
  const cards = inn.querySelector(':scope > .close-cards')
  return { inner: { rows: ics.gridTemplateRows, rowGap: ics.rowGap, alignContent: ics.alignContent, alignItems: ics.alignItems, height: ics.height, offsetH: inn.offsetHeight },
    kids: [...inn.children].map(kid),
    cardsFirstChild: cards && cards.firstElementChild ? kid(cards.firstElementChild) : null,
    zoom: getComputedStyle(document.documentElement).zoom }
}), null, 1))
await b.close()
