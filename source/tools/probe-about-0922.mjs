/* 22 Sep: About hero (is the block centred, is the ticker gone, which facts repeat), the story band, and the Services wing.
   Usage: node tools/probe-about-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(5000)
const r = await p.evaluate(() => { const h = document.querySelector('.ab-hero').getBoundingClientRect(), c = document.querySelector('.ab-hero .head'), first = c.querySelector('.eyebrow').getBoundingClientRect(), last = c.querySelector('.head-stats').getBoundingClientRect()
  const txt = document.querySelector('main, #root').innerText
  return { hero: Math.round(h.height), airAbove: Math.round(first.top - h.top), airBelow: Math.round(h.bottom - last.bottom), ticker: document.querySelectorAll('.spec-tick').length, chips: [...document.querySelectorAll('.hchip')].map(x => x.innerText.replace(/\n/g, ' ')),
    count1995: (txt.match(/1995/g) || []).length, count450: (txt.match(/\b450\b/g) || []).length, countSeven: (txt.match(/seven countries|7 countries/gi) || []).length } })
console.log(JSON.stringify(r), JSON.stringify(errs))
await p.screenshot({ path: `${OUT}/about-hero.png` })
const st = await p.$('#story'); await p.evaluate(() => document.querySelector('#story').scrollIntoView()); await wait(1800); await st.screenshot({ path: `${OUT}/about-story.png` })
await p.evaluate(() => window.scrollTo(0, 0)); await wait(600)
const hubs = await p.$$('.nav-has'); await hubs[1].hover(); await wait(1500)
await p.screenshot({ path: `${OUT}/wing-services.png`, clip: { x: 100, y: 40, width: 1340, height: 600 } })
await b.close()
