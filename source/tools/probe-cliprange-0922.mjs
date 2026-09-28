/* 22 Sep (Bazil: "no cutting the visual"). Measures, for each of the six centre clips, the box the SUBJECT occupies
   across the WHOLE loop (not one sampled frame), as fractions of the frame, and saves a contact sheet per clip.
   A pixel counts as subject when it is darker than the clip's near-white backdrop or carries colour.
   Usage: node tools/probe-cliprange-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
await p.setViewport({ width: 1200, height: 800 })
await p.goto('http://localhost:5177/checklist.html', { waitUntil: 'domcontentloaded' })
for (const s of ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup']) {
  const r = await p.evaluate(async slug => {
    const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = '/assets/cycle3d/' + slug + '-loop.mp4'
    await new Promise((ok, no) => { v.onloadeddata = ok; v.onerror = () => no(new Error('load')) })
    const W = 320, H = 180, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true })
    const sheet = document.createElement('canvas'); sheet.width = W * 4; sheet.height = H * 3; const sx = sheet.getContext('2d')
    let L = 1, T = 1, R = 0, B = 0; const per = []
    const N = 24
    for (let k = 0; k < N; k++) {
      const t = v.duration * k / N
      await new Promise(ok => { v.onseeked = ok; v.currentTime = t })
      x.drawImage(v, 0, 0, W, H)
      const d = x.getImageData(0, 0, W, H).data
      let l = W, tt = H, rr = 0, bb = 0
      for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
        const i = (yy * W + xx) * 4, mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2])
        if (mx < 205 || mx - mn > 40) { if (xx < l) l = xx; if (xx > rr) rr = xx; if (yy < tt) tt = yy; if (yy > bb) bb = yy }
      }
      per.push([+(t).toFixed(2), +(l / W).toFixed(3), +(tt / H).toFixed(3), +(rr / W).toFixed(3), +(bb / H).toFixed(3)])
      L = Math.min(L, l / W); T = Math.min(T, tt / H); R = Math.max(R, rr / W); B = Math.max(B, bb / H)
      if (k % 2 === 0) sx.drawImage(c, (k / 2 % 4) * W, Math.floor(k / 2 / 4) * H)
    }
    return { dur: +v.duration.toFixed(2), vw: v.videoWidth, vh: v.videoHeight, box: [L, T, R, B].map(n => +n.toFixed(3)), per, sheet: sheet.toDataURL('image/jpeg', 0.8) }
  }, s)
  const fs = await import('node:fs'); fs.writeFileSync(`${OUT}/clip-${s}.jpg`, Buffer.from(r.sheet.split(',')[1], 'base64'))
  const top = r.per.filter(f => f[2] <= 0.011).map(f => f[0]), bot = r.per.filter(f => f[4] >= 0.989).map(f => f[0])
  const lef = r.per.filter(f => f[1] <= 0.011).map(f => f[0]), rig = r.per.filter(f => f[3] >= 0.989).map(f => f[0])
  console.log(s, r.vw + 'x' + r.vh, r.dur + 's', 'box L,T,R,B', JSON.stringify(r.box), 'touchTop@', JSON.stringify(top), 'touchBottom@', JSON.stringify(bot), 'touchL@', JSON.stringify(lef), 'touchR@', JSON.stringify(rig))
  console.log('   top by frame   ', r.per.map(f => f[2]).join(' '))
  console.log('   bottom by frame', r.per.map(f => f[4]).join(' '))
}
await b.close()
