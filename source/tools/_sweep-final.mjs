import puppeteer from 'puppeteer-core'
import fs from 'fs'
const ROUTES = ['/','/about','/about/history','/about/commitment','/global-presence',
  '/services','/services/design','/services/procurement','/services/construction','/services/commissioning','/services/maintenance',
  '/services/epc-construction','/services/process-critical-utilities','/services/tool-installation','/services/energy-management',
  '/markets','/markets/semiconductor','/markets/data-centre','/markets/ev-battery','/markets/photovoltaics','/markets/district-cooling','/markets/bio-lifescience','/markets/food-beverage',
  '/projects','/news','/careers','/careers/culture','/contact','/policies']
const BASE = 'http://localhost:50519'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox'] })
const res = []
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  for (const r of ROUTES) {
    const p = await b.newPage(); const errs = [], bad = []
    p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error' && !/WebGL|THREE\.WebGLRenderer|GPU/.test(m.text())) errs.push(m.text().slice(0, 140)) })
    p.on('response', rs => { if (rs.status() >= 400 && !/favicon/.test(rs.url())) bad.push(rs.status() + ' ' + rs.url().replace(BASE, '')) })
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
    try { await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) { errs.push('goto ' + e.message.slice(0, 80)) }
    await new Promise(x => setTimeout(x, 1500))
    const H = await p.evaluate(() => document.documentElement.scrollHeight).catch(() => 0)
    for (let y = 0; y < H; y += 900) { await p.evaluate(v => scrollTo(0, v), y).catch(() => {}); await new Promise(x => setTimeout(x, 60)) }
    const m = await p.evaluate(() => ({ title: document.title, notFound: /not found/i.test(document.title), docW: document.documentElement.scrollWidth, vw: innerWidth, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src') && !i.closest('.bmws')).map(i => i.getAttribute('src')).slice(0, 3) })).catch(e => ({ fail: String(e).slice(0, 80) }))
    res.push({ w, r, errs, bad: bad.slice(0, 3), ...m }); await p.close()
  }
}
const faults = res.filter(x => x.errs.length || x.bad.length || x.notFound || x.fail || (x.docW > x.vw + 1) || (x.broken && x.broken.length))
console.log(JSON.stringify({ pages: res.length, faults }, null, 1))
await b.close()
