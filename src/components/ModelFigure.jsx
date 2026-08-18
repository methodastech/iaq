import React, { useEffect, useRef } from 'react'
import { registerFigure, FIGURES } from '../scenes/figure3d.js'

/* ============================================================================
   A FIGURE STAGE — the flat mark, and then the same object turning.

   Two layers share one box:
     1. the SVG mark, which assembles itself and is what EVERYONE gets;
     2. the same object as real geometry, in the same 2:1 dimetric projection
        and at the same size, which fades in once it has drawn a frame.

   Because both layers are the same object under the same camera, the handover
   has no seam: the mark finishes assembling and simply starts to move.

   The 3D is an UPGRADE, never a requirement. three.js is imported dynamically
   and only when the figure comes within a screen of the viewport, so it never
   touches first paint; it is skipped entirely under reduced motion or where
   WebGL is missing, and then the mark just stays, fully assembled. All figures
   on the page share ONE renderer — see scenes/figure3d.js for why.
   ========================================================================= */

export default function ModelFigure ({ kind, tone = 'wire', className = '', children }) {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el || !FIGURES[kind]) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let killed = false
    let release = () => {}

    const io = new IntersectionObserver(async entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      const off = await registerFigure(el, FIGURES[kind], tone === 'solid'
        /* the white band moves half as far and half as slowly as the black one */
        ? { tone: 'solid', half: 2.35, amp: .3, period: 4200, float: .045 }
        : { tone: 'wire', half: 2.5, amp: .56, period: 2600, float: .07 })
      if (killed) off()
      else release = off
    }, { rootMargin: '400px' })
    io.observe(el)

    return () => { killed = true; io.disconnect(); release() }
  }, [kind, tone])

  return (
    <div className={'h2-fig ' + className} ref={host}>
      {children}
    </div>
  )
}
