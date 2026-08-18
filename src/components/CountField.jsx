import React, { useEffect, useRef } from 'react'
import { registerField, FIELDS } from '../scenes/figure3d.js'

/* ============================================================================
   A COUNT FIELD — the milestone's own number, built out of that many units.

   It replaces the ledger's leader hairline, which stays underneath as the
   fallback: with no WebGL, with reduced motion, or before three.js has loaded,
   the row still reads as a register entry with a rule running from the figure
   to its label. The field is an upgrade on top of that, never a requirement.

   Shares the single renderer with every other figure on the page — see
   scenes/figure3d.js.
   ========================================================================= */

export default function CountField ({ kind }) {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el || !FIELDS[kind]) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let killed = false
    let release = () => {}

    const io = new IntersectionObserver(async entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      const off = await registerField(el, FIELDS[kind])
      if (killed) off()
      else release = off
    }, { rootMargin: '300px' })
    io.observe(el)

    return () => { killed = true; io.disconnect(); release() }
  }, [kind])

  return (
    <span className="h2-led-field" ref={host}>
      <i className="h2-led-lead" aria-hidden="true" />
    </span>
  )
}
