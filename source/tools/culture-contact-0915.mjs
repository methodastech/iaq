/* 15 Sep: contact sheet of candidate photographs for the Culture page. Usage: node tools/culture-contact-0915.mjs <outPng> <glob dirs...> */
import puppeteer from 'puppeteer-core'
import fs from 'fs'
const [OUT, ...dirs] = process.argv.slice(2)
const files = dirs.flatMap(d => fs.readdirSync('public' + d).filter(f => /\.(webp|png|jpg)$/.test(f)).map(f => d + '/' + f))
const html = `<style>body{margin:0;font:11px sans-serif;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:6px}figure{margin:0}img{width:100%;height:150px;object-fit:cover;display:block}figcaption{padding:2px 0;word-break:break-all}</style>` + files.map(f => `<figure><img src="${f}"><figcaption>${f}</figcaption></figure>`).join('')
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1500, height: 900 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' })
await p.setContent(`<base href="http://localhost:5177/">` + html, { waitUntil: 'networkidle0' })
await p.screenshot({ path: OUT, fullPage: true }); console.log(files.length, 'images'); await b.close()
