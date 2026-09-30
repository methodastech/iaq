/* The Scroll to build 3D, run inside the home page (28 Sep 2026). No iframe: the developer's app (public/build3d,
   prepared by tools/embed-3d.mjs) runs in this document, in <section id="build3d"> (components/Build3D.jsx).

   The app is a compiled script that starts once, finds its elements by id and never shuts down. So its markup is
   built once and kept: leaving the home page takes the stage out of the document, coming back puts the same nodes
   back, and the running app never notices. While the section is off screen, or the home page is not showing, the
   render loop waits (window.__b3d.raf) instead of drawing.

   window.__b3d is what the patched script calls in place of the page-wide calls it was written with:
     y() span() scrollTo()  the scroll position, range and scroll-to, measured from the section
     raf(fn)                one frame of the render loop, held while the section is not in use
     onKey(fn, opts)        a page-wide keydown listener that ignores typing and waits while not in use
     root                   where the app adds its own panels (the stage)

   The stage is one viewport tall and sticky; #scroll-runway (the app sets its height, one stretch per build step)
   sits under it and gives the section its length. The walkthrough takes the stage full screen over the site. */
import MARKUP from './build3d-markup.html?raw'

const APP = '/build3d/assets/app.js'
const CSS = '/build3d/assets/app.css'

let stage = null, runway = null, host = null, io = null, mo = null
let started = false, visible = false, pending = null, asked = false

const inRoom = () => document.body.classList.contains('room')
const inUse = () => !!host && (visible || inRoom())
const typing = t => !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
const top = () => (host ? host.getBoundingClientRect().top + scrollY : 0)

const api = {
  root: null,
  y: () => scrollY - top(),
  span: () => (runway ? Math.max(0, runway.getBoundingClientRect().height - innerHeight) : 0),
  /* The app also scrolls to its start by itself once it has loaded, which on its own page is the top. Here that
     would pull a visitor still reading the hero down to the section, so the page only moves once they have used
     the 3D (a click or a key in it: Start build, a rail row, leaving the walkthrough) and while it is on screen. */
  scrollTo (y, behavior) {
    if (!asked || !inUse()) return
    const to = y + top()
    /* the site scrolls through Lenis; a native scrollTo underneath it is undone on its next frame */
    if (window.__lenis) window.__lenis.scrollTo(to, { immediate: behavior !== 'smooth', force: true })
    else window.scrollTo({ top: to, behavior })
  },
  raf (fn) { if (inUse()) requestAnimationFrame(fn); else pending = fn },
  onKey (fn, opts) { addEventListener('keydown', e => { if (inUse() && !typing(e.target)) fn(e) }, opts) },
}

function wake () {
  if (!pending || !inUse()) return
  const fn = pending; pending = null
  requestAnimationFrame(fn)
}

/* the nav slides away while the stage fills the window, and the page holds still during the walkthrough */
function pin () {
  if (!host) return
  const r = host.getBoundingClientRect()
  document.documentElement.classList.toggle('b3d-pin', r.top <= 1 && r.bottom >= innerHeight - 1)
}
function room () {
  const on = inRoom()
  document.documentElement.classList.toggle('b3d-room', on)
  if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start()
  wake()
}

function build () {
  stage = document.createElement('div')
  stage.className = 'b3d-stage'
  stage.innerHTML = MARKUP
  runway = stage.querySelector('#scroll-runway')
  runway.remove()
  for (const t of ['pointerdown', 'keydown']) stage.addEventListener(t, () => { asked = true }, { capture: true, passive: true })
  api.root = stage
  window.__b3d = api
  const link = document.createElement('link')
  link.rel = 'stylesheet'; link.href = CSS
  document.head.append(link)
  mo = new MutationObserver(room)
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
}

/* puts the stage into the section; returns the undo */
export function mount (el) {
  if (!stage) build()
  host = el
  el.append(stage, runway)
  io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake() }, { rootMargin: '200px 0px' })
  io.observe(el)
  addEventListener('scroll', pin, { passive: true })
  addEventListener('resize', pin)
  pin()
  return () => {
    if (inRoom()) document.getElementById('exit-room')?.click()
    io.disconnect()
    removeEventListener('scroll', pin)
    removeEventListener('resize', pin)
    stage.remove(); runway.remove()
    host = null; visible = false
    document.documentElement.classList.remove('b3d-pin', 'b3d-room')
  }
}

/* starts the app, once per page load: it fetches the models (about 130 MB) as soon as it runs */
export function load () {
  if (started || !host) return
  started = true
  const s = document.createElement('script')
  s.type = 'module'; s.src = APP
  document.head.append(s)
}
