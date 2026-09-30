import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import FooterNav from './FooterNav.jsx'

/* BrandMethod ribbon: the animated fabric signature, ported verbatim from the static concept */
function initRibbon(cv, fb) {
  let ctx; try { ctx = cv && cv.getContext('2d') } catch (e) {}
  if (!ctx) { if (cv) cv.style.display = 'none'; if (fb) fb.hidden = false; return () => {} }
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const W = 460, H = 110, dpr = Math.min(window.devicePixelRatio || 1, 2)
  cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const X0 = 40, X1 = 420, BH = 32, BY = 40
  let running = false, looping = false, t = 0, dead = false
  const SEGS = [
    { t: 'DEMO BY', f: '600 12px Inter,sans-serif', sp: 3.6, a: 1, dy: 0, gap: 8 },
    { star: true, w: 13, gap: 9 },
    { t: 'BRAND', f: '600 12px Inter,sans-serif', sp: 3.6, a: 0.98, dy: 0 },
    { t: 'METHOD.CO', f: '600 12px Inter,sans-serif', sp: 3.6, a: 0.98, dy: 0 },
  ]
  let GLYPHS = null
  function buildGlyphs() {
    GLYPHS = []
    SEGS.forEach(s => {
      if (s.star) { GLYPHS.push({ star: true, w: s.w }); if (s.gap) GLYPHS.push({ gap: s.gap }); return }
      if (!s.t) { if (s.gap) GLYPHS.push({ gap: s.gap }); return }
      ctx.font = s.f
      for (let i = 0; i < s.t.length; i++) {
        const ch = s.t[i]
        if (ch === ' ') { GLYPHS.push({ gap: 6.5 }); continue }
        GLYPHS.push({ ch, f: s.f, a: s.a, dy: s.dy || 0, w: ctx.measureText(ch).width + s.sp })
      }
      if (s.gap) GLYPHS.push({ gap: s.gap })
    })
  }
  const wave = (x, tt) => 4.0 * Math.sin(x * 0.0135 + tt * 0.0011) + 2.4 * Math.sin(x * 0.029 - tt * 0.00068) + 1.2 * Math.sin(x * 0.055 + tt * 0.0016)
  const slope = (x, tt) => (wave(x + 2, tt) - wave(x - 2, tt)) / 4
  const lerp = (a, b, p) => a + (b - a) * p
  const shade = p => `rgb(${Math.round(lerp(18, 86, p))},${Math.round(lerp(28, 116, p))},${Math.round(lerp(158, 255, p))})`
  function tail(xEdge, dir, tt) {
    const y = BY + wave(xEdge, tt) * 0.7 + 9
    const x2 = xEdge - dir * 40
    ctx.beginPath()
    ctx.moveTo(xEdge, y); ctx.lineTo(x2, y + 7); ctx.lineTo(x2 + dir * 13, y + 7 + BH / 2)
    ctx.lineTo(x2, y + 7 + BH); ctx.lineTo(xEdge, y + BH); ctx.closePath()
    ctx.fillStyle = '#101C96'; ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fill()
  }
  function draw(tt) {
    if (!GLYPHS) buildGlyphs()
    ctx.clearRect(0, 0, W, H)
    tail(X0 + 6, 1, tt); tail(X1 - 6, -1, tt)
    for (let x = X0; x <= X1; x += 2) {
      const y = BY + wave(x, tt), s = slope(x, tt)
      const p = Math.max(0, Math.min(1, 0.52 + s * 5.5 + 0.14 * Math.sin(x * 0.006 - tt * 0.00042)))
      ctx.fillStyle = shade(p)
      ctx.fillRect(x - 1, y, 2.4, BH)
    }
    ctx.beginPath()
    for (let x = X0; x <= X1; x += 4) { const y = BY + wave(x, tt); x === X0 ? ctx.moveTo(x, y + 0.6) : ctx.lineTo(x, y + 0.6) }
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.1; ctx.stroke()
    ctx.beginPath()
    for (let x = X0; x <= X1; x += 4) { const y = BY + wave(x, tt) + BH; x === X0 ? ctx.moveTo(x, y - 0.6) : ctx.lineTo(x, y - 0.6) }
    ctx.strokeStyle = 'rgba(0,10,60,.4)'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    let total = 0; GLYPHS.forEach(g => { total += g.w || g.gap || 0 })
    let xs = (X0 + X1) / 2 - total / 2
    GLYPHS.forEach(g => {
      if (g.gap) { xs += g.gap; return }
      const cxx = xs + (g.w || 0) / 2
      const y = BY + wave(cxx, tt) + BH / 2 + 0.5, a = Math.atan(slope(cxx, tt))
      ctx.save(); ctx.translate(cxx, y); ctx.rotate(a)
      if (g.star) {
        ctx.strokeStyle = 'rgba(255,255,255,.97)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
        for (let sp = 0; sp < 4; sp++) {
          const an = sp * Math.PI / 4
          ctx.beginPath(); ctx.moveTo(-Math.cos(an) * 4.6, -Math.sin(an) * 4.6); ctx.lineTo(Math.cos(an) * 4.6, Math.sin(an) * 4.6); ctx.stroke()
        }
      } else {
        ctx.font = g.f
        ctx.fillStyle = 'rgba(2,8,40,.4)'; ctx.fillText(g.ch, -((g.w || 0) / 2) + 0.7, (g.dy || 0) + 1.1)
        ctx.fillStyle = `rgba(255,255,255,${g.a})`; ctx.fillText(g.ch, -((g.w || 0) / 2), g.dy || 0)
      }
      ctx.restore()
      xs += g.w || 0
    })
  }
  function frame() { if (dead || !running) { looping = false; return } looping = true; t += 16; draw(t); requestAnimationFrame(frame) }
  draw(0)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) { GLYPHS = null; draw(t) } })
  let io = null
  const onVis = () => {
    if (document.hidden) { running = false } else {
      const r = cv.getBoundingClientRect()
      if (r.top < innerHeight && r.bottom > 0) { running = true; if (!looping) requestAnimationFrame(frame) }
    }
  }
  if (!reduce) {
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(es => es.forEach(en => { running = en.isIntersecting; if (running && !looping) requestAnimationFrame(frame) }))
      io.observe(cv)
    } else { running = true; requestAnimationFrame(frame) }
    document.addEventListener('visibilitychange', onVis)
  }
  return () => { dead = true; running = false; io && io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
}

/* 3 Sep (Bazil: "check the website for unneeded info"): every page used to push its own
   "<page> concept · Brand Method" line into the legal strip. One quiet label now, the same on
   every page; the per-page `note` prop is still accepted so no call site breaks. */
const FOOT_NOTE = 'Prototype · Brand Method'
/* 10 Sep audit: the prototype label, the ribbon and the per-page notes belong to the review build */
/* 15 Sep: the shared flag, so ?launchview shows the footer exactly as it publishes */
import { LAUNCH } from '../lib/launch.js'
export default function Footer({ note = FOOT_NOTE, nav = true }) {
  const cvRef = useRef(null)
  const fbRef = useRef(null)
  useEffect(() => { if (!LAUNCH) return initRibbon(cvRef.current, fbRef.current) }, [])
  return (
    <footer className="sitefoot">
      {nav && <div className="f-in"><FooterNav wide /></div>}
      {/* Palantir order (client, 28 Aug): link grid, then the giant wordmark, then ONE slim
          legal strip at the very bottom — the © line now signs off BELOW the logo, not above. */}
      {/* shortened on the client review of 19 Aug 2026: the dead ISO anchor list and the
          compliance column are gone; certifications read as one line in the base row */}
      {/* 25 Sep (Bazil, on "Registered, certified and recognised": "put this one in the footer instead"): the four marks sat
          here on every page. 30 Sep (client: "this should be under this about us page"): they moved to the About overview,
          below the values (pages/About.jsx, .ab-awards); the white -rev copies stay in public/assets/certs */}
      <div className="f-base">
        <span>&copy; 2026 IAQ Group &middot; IAQ Technology International Sdn. Bhd. 200001031412 (534019-T) &middot; ISO 9001 / 14001 / 45001 &middot; CIDB G7</span>
        {!LAUNCH && <span>{FOOT_NOTE}</span>}
        <a className="f-top" href="#top" onClick={e => { e.preventDefault(); (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })) }}>Back to top <i aria-hidden="true">&uarr;</i></a>
      </div>
      {!LAUNCH && (
        <div className="bm-footrib-strip">
          <div className="bm-footrib" role="img" aria-label="Demo by BrandMethod.co">
            <canvas ref={cvRef} width="460" height="110" aria-hidden="true" />
            <span ref={fbRef} className="bm-footrib-fb" hidden>Demo · BrandMethod.co</span>
          </div>
        </div>
      )}
    </footer>
  )
}
