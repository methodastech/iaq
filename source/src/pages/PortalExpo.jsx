import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

/* ============================================================================
   PortalExpo · 9 Oct 2026 (Bazil: "please update the exhibition part fully with this", with IAQ-Exhibition-Portal.html).

   The exhibition part of the member portal IS that portal now: brief, direction, variations A to D, the 3D views,
   the stand, print, screen and digital, the print specification and the files. It is shown whole, as delivered, from
   public/booth/expo/ (unpacked by tools/expo-portal-1009.py; re-run it when a new copy arrives), so the two can never
   drift. The sidebar's Exhibition items open its sections: /portal/booth/<section>. The 30 Sep booth page
   (PortalBooth.jsx) stays on disk, unrouted.
   ============================================================================ */
export const EXPO_PARTS = [
  ['top', 'Overview', 'home'],
  ['brief', 'Brief', 'file'],
  ['direction', 'Direction', 'layers'],
  ['compare', 'Variations A to D', 'grid'],
  ['stand3d', '3D views', 'cube'],
  ['stand', 'The stand', 'building'],
  ['print', 'Print', 'file'],
  ['digital', 'Screen and digital', 'play'],
  ['spec', 'Specification', 'chart'],
  ['files', 'Files', 'folder'],
]
const VALID = new Set(EXPO_PARTS.map(p => p[0]))

export default function PortalExpo () {
  const { view } = useParams()
  const part = VALID.has(view) ? view : 'top'
  const frame = useRef(null)
  useEffect(() => { document.title = 'IAQ Group · Portal · Exhibition · Brand Method' }, [])
  /* a section from the sidebar: the portal page scrolls to it inside the frame (its own anchors) */
  useEffect(() => {
    const f = frame.current; if (!f) return
    /* scroll the frame's own page only: scrollIntoView would also scroll the portal around it, pushing the super admin
       bar and the site menu off the top (Bazil, 9 Oct: "where's the super admin") */
    const go = () => {
      try {
        const w = f.contentWindow, d = f.contentDocument, el = d && d.getElementById(part)
        const bar = d && d.querySelector('header.bar'), off = bar ? bar.getBoundingClientRect().height : 0
        const top = part === 'top' || !el ? 0 : el.getBoundingClientRect().top + w.scrollY - off
        w.scrollTo({ top, behavior: 'smooth' })
      } catch {}
      if (window.scrollY > 0) window.scrollTo({ top: 0 })
    }
    if (f.contentDocument && f.contentDocument.readyState === 'complete') go()
    else f.addEventListener('load', go, { once: true })
  }, [part])
  return (
    <iframe ref={frame} className="pt-expo" src="/booth/expo/index.html" title="IAQ exhibition portal, SEMICON Europa 2026"
      allow="fullscreen" style={{ display: 'block', width: '100%', height: 'calc(100vh - var(--sticktop, 78px))', border: 0, background: '#fff' }} />
  )
}
