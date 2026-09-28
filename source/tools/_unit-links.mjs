import puppeteer from 'puppeteer-core'
import fs from 'fs'
const raw = fs.readFileSync(process.argv[2], 'utf8'); const d = JSON.parse(raw.slice(raw.indexOf('{')))
const links = d.links.filter(h => !/\.html$|^\/#|\?admin|^\/web1|^\/home2|^\/portal/.test(h)).map(h => h.split('#')[0]).filter((v, i, a) => a.indexOf(v) === i)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const out = []
for (const h of links) {
  try { await p.goto('http://localhost:52158' + h, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 900)); const t = await p.title(); if (/not found/i.test(t)) out.push(h + ' -> ' + t) } catch (e) { out.push(h + ' -> ' + e.message.slice(0, 60)) }
}
console.log(JSON.stringify({ checked: links.length, notFound: out }))
await b.close()
