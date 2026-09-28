import { useEffect } from 'react'

/* ============================================================================
   useMomentum · 15 Sep 2026 (Bazil: "subtle momentum animation" on every section)
   Any element marked [data-mo] drifts vertically inside its frame as the page
   scrolls, eased toward its target each frame so it trails the scroll and settles
   after it stops: momentum, not a locked parallax. data-mo is the rate (1 is the
   full range, negative drifts the other way). The element is scaled just enough
   that the drift never opens a gap at the frame edge.
   Put data-mo on a WRAPPER inside the frame (position:absolute; inset:0), not on
   the <img>, so CSS hover zooms on the image keep working.
   Off under reduced motion; frames off screen are skipped; the loop stops when
   everything has settled.
   ========================================================================== */
export function useMomentum({ range = 26, ease = 0.08 } = {}) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const state = new Map()
    let raf = 0
    const io = new IntersectionObserver(es => es.forEach(e => { const s = state.get(e.target); if (s) s.vis = e.isIntersecting }), { rootMargin: '160px 0px' })
    const track = el => { if (state.has(el)) return; state.set(el, { cur: 0, vis: true, k: parseFloat(el.dataset.mo) || 1 }); io.observe(el) }
    const scan = () => {
      document.querySelectorAll('[data-mo]').forEach(track)
      for (const el of state.keys()) if (!el.isConnected) { io.unobserve(el); state.delete(el) }
    }
    const tick = () => {
      raf = 0
      const vh = window.innerHeight
      let moving = false
      state.forEach((s, el) => {
        if (!s.vis) return
        const frame = el.parentElement
        const r = frame.getBoundingClientRect()
        if (!r.height) return
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)))
        const tgt = -p * range * s.k
        s.cur += (tgt - s.cur) * ease
        if (Math.abs(tgt - s.cur) > 0.08) moving = true
        const scale = 1 + (2 * range * Math.abs(s.k) + 2) / r.height
        el.style.transform = `translate3d(0, ${s.cur.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
      })
      if (moving) raf = requestAnimationFrame(tick)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }
    scan(); kick()
    /* tabs, rails and lazy sections add frames later; rescan only when elements were added or removed */
    const mo = new MutationObserver(list => { if (list.some(m => m.addedNodes.length || m.removedNodes.length)) { scan(); kick() } })
    mo.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      io.disconnect(); mo.disconnect()
      window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick)
      if (raf) cancelAnimationFrame(raf)
      state.forEach((_, el) => { el.style.transform = '' })
    }
  }, [range, ease])
}
