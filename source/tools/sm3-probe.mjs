/* sm3-probe · verifies the Codex section 3 harness (/codex/site-preview). Usage: node tools/sm3-probe.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const B = 'http://localhost:5177/codex/site-preview'
const OUT = process.argv[2] || '.'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log(...a)

async function open(vp) {
  const p = await browser.newPage(); await p.setViewport(vp)
  const errs = []
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', e => errs.push('pageerror: ' + e.message))
  p.on('requestfailed', r => errs.push('requestfailed: ' + r.url()))
  await p.goto(B, { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1200)
  return { p, errs }
}

for (const vp of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 390, height: 844, isMobile: true, hasTouch: true }]) {
  const { p, errs } = await open(vp)
  /* scroll through so every image and observer fires, then back to top */
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } window.scrollTo(0, 0) })
  await sleep(800)
  const r = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('.sm3-shot-btn img')]
    const wide = []
    const vw = document.documentElement.clientWidth
    document.querySelectorAll('.sm3 *').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && (b.right > vw + 0.5 || b.left < -0.5)) { if (!e.closest('.sm3-sr')) wide.push((e.className && e.className.baseVal === undefined ? e.className : e.tagName) + ' ' + Math.round(b.left) + '..' + Math.round(b.right)) } })
    return {
      blocks: document.querySelectorAll('.sm3 .sm3-blk').length,
      h3: [...document.querySelectorAll('.sm3-h3')].map(h => h.textContent),
      thumbs: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
      notLoaded: imgs.filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.getAttribute('src')),
      otherImgs: [...document.querySelectorAll('.sm3 img')].filter(i => !i.closest('.sm3-shot-btn')).map(i => i.getAttribute('src') + ':' + i.naturalWidth),
      scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, innerWidth: innerWidth,
      overflowing: wide.slice(0, 12),
      flowCols: getComputedStyle(document.querySelector('.sm3-flow')).gridTemplateColumns.split(' ').length,
    }
  })
  log(`\n=== ${vp.width}x${vp.height}`)
  log(JSON.stringify(r, null, 1))
  if (vp.width === 1440) {
    /* hover a band in block 3 */
    const bands = await p.$$('.sm3-band')
    await bands[2].hover(); await sleep(350)
    const b1 = await p.evaluate(() => ({ hotBand: [...document.querySelectorAll('.sm3-band')].findIndex(e => e.classList.contains('sm3-hot')), hotNote: [...document.querySelectorAll('.sm3-note')].findIndex(e => e.classList.contains('sm3-hot')), otherOpacity: getComputedStyle(document.querySelectorAll('.sm3-band-btn')[0]).opacity, hotShadow: getComputedStyle(document.querySelectorAll('.sm3-band-btn')[2]).boxShadow.slice(0, 60) }))
    const notes = await p.$$('.sm3-note')
    await notes[4].hover(); await sleep(350)
    const b2 = await p.evaluate(() => ({ hotBand: [...document.querySelectorAll('.sm3-band')].findIndex(e => e.classList.contains('sm3-hot')), hotNote: [...document.querySelectorAll('.sm3-note')].findIndex(e => e.classList.contains('sm3-hot')) }))
    log('BAND hover band 3 ->', JSON.stringify(b1), '| hover note 5 ->', JSON.stringify(b2))
    /* click a band: preview toggles */
    await p.click('.sm3-band:nth-of-type(1) .sm3-band-btn').catch(() => {})
    const btns = await p.$$('.sm3-band-btn')
    await btns[2].click(); await sleep(600)
    const pv1 = await p.evaluate(() => { const pv = document.querySelector('.sm3-band-pv img'); return { open: !!pv, src: pv && pv.getAttribute('src'), w: pv && pv.naturalWidth, expanded: document.querySelectorAll('.sm3-band-btn')[2].getAttribute('aria-expanded') } })
    await btns[2].click(); await sleep(300)
    const pv2 = await p.evaluate(() => ({ open: !!document.querySelector('.sm3-band-pv'), expanded: document.querySelectorAll('.sm3-band-btn')[2].getAttribute('aria-expanded') }))
    log('BAND click ->', JSON.stringify(pv1), '| click again ->', JSON.stringify(pv2))
    /* hover a part in block 4, then a list item */
    const parts = await p.$$('.sm3-ap')
    await parts[3].hover(); await sleep(350)
    const a1 = await p.evaluate(() => ({ hotPart: [...document.querySelectorAll('.sm3-ap')].findIndex(e => e.classList.contains('sm3-hot')), hotItem: [...document.querySelectorAll('.sm3-anat-list li')].findIndex(e => e.classList.contains('sm3-hot')), dimOpacity: getComputedStyle(document.querySelectorAll('.sm3-ap')[0]).opacity }))
    const items = await p.$$('.sm3-anat-list li')
    await items[5].hover(); await sleep(350)
    const a2 = await p.evaluate(() => ({ hotPart: [...document.querySelectorAll('.sm3-ap')].findIndex(e => e.classList.contains('sm3-hot')), hotItem: [...document.querySelectorAll('.sm3-anat-list li')].findIndex(e => e.classList.contains('sm3-hot')), hotShadow: getComputedStyle(document.querySelectorAll('.sm3-ap')[5]).boxShadow.slice(0, 70) }))
    log('ANATOMY hover part 4 ->', JSON.stringify(a1), '| hover item 6 ->', JSON.stringify(a2))
    /* callout hover in block 2 */
    const cos = await p.$$('.sm3-callouts li')
    await cos[1].hover(); await sleep(300)
    const c1 = await p.evaluate(() => ({ hotSubs: document.querySelectorAll('.sm3-mn-sub.sm3-hot').length, hotCallout: [...document.querySelectorAll('.sm3-callouts li')].findIndex(e => e.classList.contains('sm3-hot')) }))
    log('MENU callout 2 hover ->', JSON.stringify(c1))
    await p.mouse.move(5, 5); await sleep(300)
    /* lightbox */
    const shots = await p.$$('.sm3-shot-btn')
    await shots[5].click(); await sleep(900)
    const l1 = await p.evaluate(() => { const lb = document.querySelector('.sm3-lb'); const img = lb && lb.querySelector('img'); return { open: !!lb, src: img && img.getAttribute('src'), w: img && img.naturalWidth, focused: document.activeElement && document.activeElement.textContent, bodyOverflow: document.body.style.overflow } })
    await p.screenshot({ path: OUT + '/sm3-lightbox-1440.png' })
    await p.keyboard.press('ArrowRight'); await sleep(500)
    const l2 = await p.evaluate(() => document.querySelector('.sm3-lb img').getAttribute('src'))
    await p.keyboard.press('Escape'); await sleep(400)
    const l3 = await p.evaluate(() => ({ open: !!document.querySelector('.sm3-lb'), focusIsTrigger: document.activeElement === document.querySelectorAll('.sm3-shot-btn')[5], active: document.activeElement.className, bodyOverflow: document.body.style.overflow }))
    log('LIGHTBOX click slide 5 ->', JSON.stringify(l1), '| ArrowRight ->', l2, '| Escape ->', JSON.stringify(l3))
    /* play button */
    await p.click('.sm3-play'); await sleep(1300)
    const pl = await p.evaluate(() => ({ pressed: document.querySelector('.sm3-play').getAttribute('aria-pressed'), bottoms: [...document.querySelectorAll('.sm3-mv-lay')].map(e => getComputedStyle(e).bottom) }))
    await p.click('.sm3-play'); await sleep(200)
    log('PLAY ->', JSON.stringify(pl))
    await p.mouse.move(5, 5); await sleep(300)
  }
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  await p.screenshot({ path: `${OUT}/sm3-full-${vp.width}.png`, fullPage: true })
  log('console errors:', errs.length, errs.slice(0, 8))
  await p.close()
}

/* print media: highlights off, lightbox gone */
{
  const { p } = await open({ width: 1200, height: 900 })
  await p.emulateMediaType('print'); await sleep(300)
  const pr = await p.evaluate(() => ({ lb: !!document.querySelector('.sm3-lb'), cue: getComputedStyle(document.querySelector('.sm3-band-cue')).display, play: getComputedStyle(document.querySelector('.sm3-play')).display }))
  log('\nPRINT ->', JSON.stringify(pr))
  await p.pdf({ path: OUT + '/sm3-print.pdf', format: 'A4', printBackground: true })
  await p.close()
}
await browser.close()
