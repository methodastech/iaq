/* 23 Oct 2026: a close crop of a capture, scaled up, for looking at detail and for the Polishing record.
   Usage: node tools/crop-1023.mjs <image> <x> <y> <w> <h> <scale> <out.png>   (coordinates in the image's own pixels) */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [img, x, y, w, h, scale = '2', out] = process.argv.slice(2)
const X = +x, Y = +y, Wd = +w, Ht = +h, S = +scale
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--hide-scrollbars'] })
const p = await b.newPage(); await p.setViewport({ width: Math.ceil(Wd * S), height: Math.ceil(Ht * S), deviceScaleFactor: 1 })
/* the picture goes in as a data URI: a file path in a blank page is blocked */
const mime = /\.png$/i.test(img) ? 'image/png' : /\.jpe?g$/i.test(img) ? 'image/jpeg' : 'image/webp'
const uri = `data:${mime};base64,${fs.readFileSync(img).toString('base64')}`
await p.setContent(`<html><body style="margin:0;background:#fff;overflow:hidden"><img src="${uri}" style="position:absolute;left:${-X * S}px;top:${-Y * S}px;transform:scale(${S});transform-origin:0 0;image-rendering:auto"></body></html>`, { waitUntil: 'load' })
await new Promise(r => setTimeout(r, 400))
await p.screenshot({ path: out, type: out.endsWith('.webp') ? 'webp' : 'png', clip: { x: 0, y: 0, width: Math.ceil(Wd * S), height: Math.ceil(Ht * S) } })
console.log('crop ->', out)
await b.close()
