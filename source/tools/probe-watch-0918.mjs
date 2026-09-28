// 18 Sep: the Watch strips. Thumbnails load, nothing embeds until pressed, one press embeds the player.
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const w of [1440, 390]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
  const r0 = await p.evaluate(async () => {
    const ws = [...document.querySelectorAll('.wt')]
    for (const x of ws) { x.scrollIntoView(); await new Promise(r => setTimeout(r, 900)) }
    const imgs = [...document.querySelectorAll('.wt img')]
    return { strips: ws.length, cards: document.querySelectorAll('.wt-card').length, iframesBefore: document.querySelectorAll('.wt iframe').length, thumbsLoaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length, thumbs: imgs.length }
  })
  const el = await p.$('.wt'); await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 500))
  await el.screenshot({ path: `${OUT}/watch-${w}-1.png` })
  const el2 = (await p.$$('.wt'))[1]; await el2.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 500))
  await el2.screenshot({ path: `${OUT}/watch-${w}-2.png` })
  await p.click('.wt-play'); await new Promise(r => setTimeout(r, 1500))
  const after = await p.evaluate(() => { const f = document.querySelector('.wt iframe'); return f ? f.src.split('?')[0] : null })
  console.log(w, JSON.stringify(r0), '| after one press:', after, '| errors', errs.length, errs.slice(0, 2))
  await p.close()
}
await b.close()
