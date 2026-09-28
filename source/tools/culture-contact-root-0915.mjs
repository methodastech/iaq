import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const files = ['/assets/photo-awards.webp','/assets/photo-cleanroom.webp','/assets/photo-opening.webp','/assets/photo-team.webp']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1200, height: 400 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' })
await p.setContent('<base href="http://localhost:5177/"><style>body{margin:0;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}img{width:100%;height:220px;object-fit:cover}</style>' + files.map(f => `<figure style="margin:0"><img src="${f}"><figcaption>${f}</figcaption></figure>`).join(''), { waitUntil: 'networkidle0' })
await p.screenshot({ path: OUT, fullPage: true }); await b.close()
