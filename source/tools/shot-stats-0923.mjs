import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 3 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 3000))
const box = await p.evaluate(() => {
  const st = [...document.querySelectorAll('.gr .gstat')]
  st[0].scrollIntoView({ block: 'center' })
  const a = st[0].getBoundingClientRect(), z = st[st.length - 1].getBoundingClientRect()
  return { x: a.left - 14, y: a.top - 14, w: Math.max(a.width, z.right - a.left) + 28, h: z.bottom - a.top + 28 }
})
await new Promise(r => setTimeout(r, 800))
await p.screenshot({ path: process.argv[2], clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.w, 1400), height: Math.min(box.h, 900) } })
console.log('ok')
await b.close()
