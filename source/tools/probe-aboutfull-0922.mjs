/* 22 Sep: the whole About page on the real GPU, section by section, with every icon's colour, for the visual pass.
   Usage: node tools/probe-aboutfull-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(4500)
const secs = await p.evaluate(() => [...document.querySelectorAll('#root header, #root section, #root main > *')].filter(e => e.getBoundingClientRect().height > 120 && !e.closest('.close3d') && !e.parentElement.closest('section')).map((e, i) => { e.dataset.pq = i; return { i, tag: e.tagName, cls: String(e.className).slice(0, 40), id: e.id, h: Math.round(e.getBoundingClientRect().height),
  icons: [...e.querySelectorAll('svg')].slice(0, 30).map(s => getComputedStyle(s).color + '|' + getComputedStyle(s).stroke).reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), {}) } }))
console.log(JSON.stringify(secs, null, 0))
for (const s of secs) {
  await p.evaluate(i => { const e = document.querySelector('[data-pq="' + i + '"]'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 40) }, s.i); await wait(1800)
  const el = await p.$('[data-pq="' + s.i + '"]'); await el.screenshot({ path: `${OUT}/ab-${String(s.i).padStart(2, '0')}-${s.id || s.cls.split(' ')[0]}.png` }).catch(() => {})
}
await b.close()
