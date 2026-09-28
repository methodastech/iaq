/* 26 Sep 2026: the fab scroll assembly posed at given stages on /fab (dev only). Usage: node tools/_shotfablab-0926.mjs <outdir> <tag> <u,u,...> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [out = '/tmp/fab', tag = 'x', us = '0.35'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const errs = []
for (const u of us.split(',')) {
  const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5177/fab?fabu=' + u, { waitUntil: 'networkidle2', timeout: 90000 })
  await new Promise(r => setTimeout(r, 5000))
  await p.screenshot({ path: `${out}/${tag}-u${u}.png` })
  await p.close()
}
console.log(JSON.stringify({ errs })); await b.close()
