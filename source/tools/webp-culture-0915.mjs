/* 15 Sep: converts IAQ newsroom photographs to WebP (max 1600 wide, quality 0.8) with headless Chrome's
   canvas encoder, since this machine has no cwebp, sharp or ffmpeg.
   Usage: node tools/webp-culture-0915.mjs <map.json> <srcdir> <outdir>
   map.json: { "out-name.webp": { "src": "file.jpg", "crop": [x0, y0, x1, y1] } }  crop is optional, in fractions */
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
const [MAP, SRC, OUT] = process.argv.slice(2)
const map = JSON.parse(fs.readFileSync(MAP, 'utf8'))
fs.mkdirSync(OUT, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.goto('about:blank')
for (const [name, spec] of Object.entries(map)) {
  const file = path.join(SRC, spec.src)
  const ext = path.extname(file).slice(1).toLowerCase()
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
  const data = `data:${mime};base64,` + fs.readFileSync(file).toString('base64')
  const r = await p.evaluate(async (data, crop) => {
    const img = new Image(); img.src = data; await img.decode()
    const [x0, y0, x1, y1] = crop || [0, 0, 1, 1]
    const sx = Math.round(img.naturalWidth * x0), sy = Math.round(img.naturalHeight * y0)
    const sw = Math.round(img.naturalWidth * (x1 - x0)), sh = Math.round(img.naturalHeight * (y1 - y0))
    const k = Math.min(1, 1600 / sw)
    const c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k)
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'
    g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)
    return { url: c.toDataURL('image/webp', 0.8), w: c.width, h: c.height, nw: img.naturalWidth, nh: img.naturalHeight }
  }, data, spec.crop || null)
  if (!r.url.startsWith('data:image/webp')) throw new Error('webp encode failed for ' + name)
  const buf = Buffer.from(r.url.split(',')[1], 'base64')
  fs.writeFileSync(path.join(OUT, name), buf)
  console.log(name, `${r.nw}x${r.nh} -> ${r.w}x${r.h}`, Math.round(buf.length / 1024) + 'KB')
}
await b.close()
