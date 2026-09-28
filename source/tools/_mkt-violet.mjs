import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const out = process.argv[2]
const wait = ms => new Promise(r => setTimeout(r, ms))
// the hub: hero, then the standards band
await p.goto('http://localhost:52158/markets', { waitUntil: 'networkidle0', timeout: 60000 }); await wait(2200)
await p.screenshot({ path: out + '/hub-hero.png', clip: { x: 0, y: 0, width: 1440, height: 640 } })
const band = await p.evaluate(() => { const e = document.querySelector('.pg-sec.deep'); const r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height } })
await p.evaluate(t => scrollTo(0, t), band.top - 20); await wait(900)
await p.screenshot({ path: out + '/hub-cards.png', clip: { x: 0, y: 0, width: 1440, height: 900 } })
const cs = await p.evaluate(() => { const g = s => getComputedStyle(document.querySelector(s)); return { mark: g('.mk-cd-top svg').color, plate: g('.mk-cd .mk-spec').backgroundColor, square: g('.mk-cd-sq i').backgroundColor, go: g('.mk-cd-go').color, eyebrow: g('.mkb .eyebrow').color, h1em: g('.mkb h1 em').color } })
console.log('hub', JSON.stringify(cs))
// one market page: the hero drawing, the facts, the flow
await p.goto('http://localhost:52158/markets/semiconductor', { waitUntil: 'networkidle0', timeout: 60000 }); await wait(2600)
await p.screenshot({ path: out + '/mkt-semi-hero.png', clip: { x: 0, y: 0, width: 1440, height: 760 } })
const cs2 = await p.evaluate(() => { const q = s => document.querySelector(s); const g = s => q(s) ? getComputedStyle(q(s)) : null; return { motionRed: g('.mm .r') && g('.mm .r').stroke, motionFill: g('.mm .rf') && g('.mm .rf').fill, factLink: g('a.mk-fact .v') && g('a.mk-fact .v').color, flowIc: g('.mf-ic') && g('.mf-ic').color, flowN: g('.mf-n') && g('.mf-n').color, flowArrow: q('.mf-scope li') && getComputedStyle(q('.mf-scope li'), '::after').borderLeftColor, flowTop: q('.mf') && q('.mf').getBoundingClientRect().top + scrollY } })
console.log('market page', JSON.stringify(cs2))
if (cs2.flowTop) { await p.evaluate(t => scrollTo(0, t), cs2.flowTop - 120); await wait(900); await p.screenshot({ path: out + '/mkt-semi-flow.png', clip: { x: 0, y: 0, width: 1440, height: 900 } }) }
await b.close()
