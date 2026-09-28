// the explorer and the cycle band on the home page: renders, selection, frames, pins, tour; captures
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
  const fx = await p.$('.fx'); if (!fx) { console.log(w, 'NO EXPLORER'); continue }
  await fx.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2200))
  const r = await p.evaluate(async () => {
    const sec = document.querySelector('.fx'), q = s => sec.querySelector(s)
    const f0 = q('.fx-view img').getAttribute('src')
    const tourSel = sec.querySelector('.fx-n.me, .fx-c.me')?.textContent.slice(0, 30)
    sec.querySelector('.fx-grp.c-u .fx-n:nth-child(2)').click(); await new Promise(r => setTimeout(r, 1200))
    const after = { frame: q('.fx-view img').getAttribute('src').split('/').pop(), lit: sec.querySelectorAll('.fx-pin.lit:not(.gone)').length, gone: sec.querySelectorAll('.fx-pin.gone').length, sentence: q('.fx-read p').innerText.slice(0, 120), on: sec.querySelectorAll('.fx-n.on, .fx-c.on').length, off: sec.querySelectorAll('.fx-n.off, .fx-c.off').length, go: q('.fx-go')?.getAttribute('href') }
    sec.querySelector('.fx-grp.c-y .fx-c:nth-child(6)').click(); await new Promise(r => setTimeout(r, 1200))
    const sys = { frame: q('.fx-view img').getAttribute('src').split('/').pop(), lit: sec.querySelectorAll('.fx-pin.lit:not(.gone)').length, sentence: q('.fx-read p').innerText.slice(0, 100) }
    const order = [...document.querySelectorAll('main > section, main > header, body section, body header')].filter(e => e.getBoundingClientRect().height > 200).map(e => e.id || e.className.split(' ')[0]).slice(0, 7)
    return { firstFrame: f0.split('/').pop(), tourSel, after, sys, order, overflow: document.documentElement.scrollWidth - innerWidth, fxH: Math.round(sec.getBoundingClientRect().height), cyb: !!document.querySelector('.cyb'), lpx: !!document.querySelector('.lpx-band') }
  })
  console.log(w, JSON.stringify(r)); console.log('errors', errs.length, errs.slice(0, 3))
  await p.evaluate(() => document.querySelector('.fx-grp.c-u .fx-n:nth-child(1)').click()); await new Promise(r => setTimeout(r, 1400))
  await fx.screenshot({ path: `${OUT}/fx-${w}.png` })
  const cyb = await p.$('.cyb'); if (cyb) { await cyb.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1500)); await cyb.screenshot({ path: `${OUT}/cyb-${w}.png` }) }
  if (w === 1440) { const gr = await p.$('.glance.gr'); await gr.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200)); await gr.screenshot({ path: `${OUT}/gr-${w}.png` }) }
  await p.close()
}
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 860 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
const f = await p.$('.sm-faq-head'); await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 900)); await f.screenshot({ path: `${OUT}/v-faq2.png` })
await b.close()
