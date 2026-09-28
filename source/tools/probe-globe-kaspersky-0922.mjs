/* 22 Sep: the Kaspersky-style globe on the home page. Real GPU. Shots at rest (two moments, to see the streaks move),
   a click on the Germany chip (fly-in and card), then Back to globe. Reports GL and page errors and the globe's QA state.
   Usage: node tools/probe-globe-kaspersky-0922.mjs <outdir> [width] */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.', W = +(process.argv[3] || 1440)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 200000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 200))); p.on('console', e => { if (e.type() === 'error' || /WebGL|shader|THREE/i.test(e.text())) errs.push(e.type() + ' ' + e.text().slice(0, 300)) })
await p.setViewport({ width: W, height: 900 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(3000)
const y = await p.evaluate(() => document.querySelector('#globeHost').getBoundingClientRect().top + scrollY)
for (let i = 1; i <= 10; i++) { await p.mouse.wheel({ deltaY: (y - 120) / 10 }); await wait(100) }
await wait(3500)
const host = await p.$('#globeHost')
await host.screenshot({ path: `${OUT}/gk-${W}-a.png` }); await wait(1300); await host.screenshot({ path: `${OUT}/gk-${W}-b.png` })
console.log('qa', JSON.stringify(await p.evaluate(() => window.__globeQA && window.__globeQA())))
await p.evaluate(() => { const t = [...document.querySelectorAll('.globe-tag')].find(e => /Germany/.test(e.textContent)); t && t.click() }); await wait(3200)
console.log('open', JSON.stringify(await p.evaluate(() => ({ card: document.querySelector('.globe-card.on')?.innerText.replace(/\n+/g, ' | '), gz: document.querySelector('#globeHost').classList.contains('gz'), shownTags: [...document.querySelectorAll('.globe-tag')].filter(t => getComputedStyle(t).opacity !== '0').map(t => t.textContent) }))))
await host.screenshot({ path: `${OUT}/gk-${W}-open.png` })
await p.evaluate(() => document.querySelector('.globe-card .gc-back').click()); await wait(2600)
console.log('back', JSON.stringify(await p.evaluate(() => ({ card: !!document.querySelector('.globe-card.on'), gz: document.querySelector('#globeHost').classList.contains('gz'), sel: window.__globeQA().sel }))))
await host.screenshot({ path: `${OUT}/gk-${W}-back.png` })
console.log('errs', JSON.stringify(errs))
await b.close()
