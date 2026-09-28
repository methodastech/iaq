/* 22 Sep: the sub-tabbed portal Booth area. Loads each view of /portal/booth/<view> at 1440 on the real GPU, full-page shots,
   reports errors, horizontal overflow, and elements that spill past their section.
   Usage: node tools/probe-booth-tabs-0922.mjs <outdir> [views...] */
import puppeteer from 'puppeteer-core'
const [OUT = '.', ...only] = process.argv.slice(2)
const VIEWS = only.length ? only : ['plan', 'direction', 'stand', 'print', 'digital', 'screen', 'website', 'files']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 240))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 240)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/booth?admin', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(2500)
for (const v of VIEWS) {
  await p.goto('http://localhost:5177/portal/booth/' + v, { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(v === 'stand' ? 7000 : 3500)
  const info = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth, out = []
    document.querySelectorAll('.bt-body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1)) out.push((e.className?.baseVal ?? e.className) + ' ' + Math.round(r.left) + '..' + Math.round(r.right)) })
    return { title: document.title, h: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - vw, spill: out.slice(0, 6), tabs: [...document.querySelectorAll('.bt-tabs a')].map(a => a.textContent + (a.classList.contains('on') ? '*' : '')).join(' | ') }
  })
  console.log(v, JSON.stringify(info))
  await p.screenshot({ path: `${OUT}/tab-${v}.png`, fullPage: true })
}
console.log('errs', JSON.stringify(errs))
await b.close()
