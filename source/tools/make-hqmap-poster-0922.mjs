/* 22 Sep: the still that stands in for the Contact district map when WebGL is not available (contact.css, .hqm-stage
   background). Shot from the live scene on the real GPU at the settled street view, with the page's own overlays hidden.
   Usage: node tools/make-hqmap-poster-0922.mjs <out.png>   then convert to public/assets/iaq/hq-district-poster.webp */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/contact', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(4000)
await p.addStyleTag({ content: '.hqm-veil,.hqm-in,.hqm-ctl,.hqm-n,.hqm-credit,.topbar,.nav{display:none!important}' })
await p.evaluate(() => { const s = document.querySelector('#find-us'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY) }); await wait(1200)
await p.evaluate(() => window.__hqmapSkip()); await wait(1200)
const el = await p.$('#hqmap'); await el.screenshot({ path: OUT })
await b.close()
