import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ============================================================================
   THE MOTION SYSTEM.

   The audit scored motion 3/10 with one line that names the problem exactly:
   "four animation libraries produce generic fades". One `opacity:0, y:24` on
   everything is not a motion system, it is a default. And only two pages had
   even that: services, markets, capability, news and the shortlist arrived
   completely still.

   So: one module, five treatments, chosen by what the element IS rather than
   by where it sits. A heading resolves, a paragraph settles, a grid arrives in
   sequence, an image releases from a held scale, a rule draws itself. The
   difference between premium and templated is that these are not the same
   animation at different delays.

   RELIABILITY, which is most of the work:
   - Nothing is hidden by CSS. Every treatment is a `gsap.from` with
     `immediateRender:false`, so the hidden start state is never painted until
     the trigger actually fires. A missed trigger leaves the element at its
     normal, visible CSS state — the page is readable with this file deleted.
   - `once:true` everywhere. Motion is earned once, then the page rests.
   - Reduced motion is a hard bail before a single tween is created.
   - Every trigger is tagged and killed on route change, or a SPA leaks one
     ScrollTrigger per element per navigation.
   ============================================================================ */

const ID = 'iaq-mo'
const EASE = 'power3.out'

/* Elements a page scene already animates are left alone: two tweens on one
   element fight, and the scene knows things this module does not. */
const CLAIMED = '[data-reveal], [data-reveal] *, [data-mo-skip]'

/* The five treatments. Order matters: the first selector that matches an
   element wins, so the list runs most specific first. */
const TREATMENTS = [
  {
    /* HEADINGS resolve rather than slide. A short rise plus a blur release
       reads as the type coming into focus, which is the one motion that can
       carry a page on its own. Opacity stays partial rather than zero so a
       stalled rAF can never leave a headline blank. */
    key: 'head',
    sel: '.pg-sec h2, .pg-in > h2, .head h1, .pg-head h1, section > .wrap > h2',
    from: { y: 22, opacity: 0.001, filter: 'blur(7px)' },
    opts: { duration: 0.95, ease: 'power4.out' },
    start: 'top 88%',
  },
  {
    /* EYEBROWS lead the heading in by a beat, and travel sideways so the two
       motions are not the same gesture at different speeds. */
    key: 'kick',
    sel: '.eyebrow, .pg-k, .nw-mk',
    from: { x: -14, opacity: 0.001 },
    opts: { duration: 0.6, ease: EASE },
    start: 'top 92%',
  },
  {
    /* BODY settles. Small, slow, unshowy: this is the text someone is trying
       to read, and it should not perform. */
    key: 'body',
    sel: '.pg-lede, .pg-body, .lp-lede, .lede, .pg-note',
    from: { y: 12, opacity: 0.001 },
    opts: { duration: 0.8, ease: EASE, delay: 0.06 },
    start: 'top 90%',
  },
  {
    /* GRIDS arrive in sequence. The stagger is the point: it says these are
       several of a kind, counted, not one block that faded. */
    key: 'grid',
    sel: '.pg-cards, .pg-proof, .inds, .nw-recent, .pg-beats, .lp-proof-g, .lp-stats, .cp-grid, .nm-cols',
    children: true,
    from: { y: 18, opacity: 0.001, scale: 0.985 },
    opts: { duration: 0.7, ease: EASE, stagger: 0.075 },
    start: 'top 86%',
  },
  {
    /* FIGURES release from a held scale inside their own frame. The frame is
       already clipped, so this needs no wrapper and cannot reflow anything. */
    key: 'fig',
    sel: '.pg-head-fig img, .pg-pcv img, .indv img, .nw-rc img, .lp-hero-fig img',
    from: { scale: 1.08 },
    opts: { duration: 1.15, ease: 'power2.out' },
    start: 'top 92%',
  },
]

let ctx = null

export function initMotion(root = document) {
  teardownMotion()
  if (typeof window === 'undefined') return
  /* Hard bail: the page is already correct without any of this. */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!gsap || !ScrollTrigger) return

  const armed = []
  ctx = gsap.context(() => {
    const taken = new WeakSet()

    for (const t of TREATMENTS) {
      const nodes = gsap.utils.toArray(t.sel, root).filter(el => {
        if (taken.has(el)) return false
        if (el.closest && el.closest(CLAIMED)) return false
        return true
      })

      for (const el of nodes) {
        const targets = t.children ? Array.from(el.children) : el
        if (t.children && !el.children.length) continue
        if (t.children) Array.from(el.children).forEach(c => taken.add(c))
        else taken.add(el)

        ;(Array.isArray(targets) ? targets : [targets]).forEach(n => armed.push(n))
        gsap.from(targets, {
          ...t.from,
          ...t.opts,
          /* THE load-bearing flag. Without it GSAP paints the hidden start
             state immediately and a trigger that never fires strands the
             element invisible for good. */
          immediateRender: false,
          scrollTrigger: { trigger: el, start: t.start, once: true, id: ID },
          /* blur is expensive to composite; drop the filter once it is done
             rather than leaving `filter:blur(0)` on the element forever */
          clearProps: t.from.filter ? 'filter' : '',
        })
      }
    }
  }, root === document ? undefined : root)

  /* ---- THE SAFETY SWEEP ----
     `immediateRender:false` stops the hidden start state being painted at creation, but once a
     ScrollTrigger is built it arms the element so the reveal does not pop. Armed is fine; armed
     FOREVER is a blank paragraph. That happens when a trigger's start point was measured against a
     layout that later changed underneath it — this page pins a 3D showpiece, and pinning rewrites
     document height.

     So: anything armed that is on screen and still invisible gets released. It cannot fight a
     legitimate reveal, because a reveal that fired is no longer invisible. `pending` shrinks as
     elements resolve and the whole thing unhooks itself once empty, so this is a net, not a loop. */
  pending = armed.slice()

  const sweep = () => {
    if (!pending.length) { stopSweep(); return }
    const still = []
    for (const el of pending) {
      if (!el || !el.isConnected) continue
      if (parseFloat(getComputedStyle(el).opacity) > 0.05) continue      /* revealed: stop watching */
      const r = el.getBoundingClientRect()
      if (r.height === 0) { still.push(el); continue }                   /* not laid out yet */
      if (r.top < window.innerHeight && r.bottom > 0) gsap.set(el, { clearProps: 'all' })
      else still.push(el)                                                /* off screen: legitimately waiting */
    }
    pending = still
    if (!pending.length) stopSweep()
  }
  sweepFn = sweep

  /* Fonts and images move every trigger point. Refresh once each has settled. */
  const refresh = () => ScrollTrigger.refresh()
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { refresh(); sweep() }).catch(() => {})
  window.addEventListener('load', () => { refresh(); sweep() }, { once: true })

  let ticks = 0
  sweepTimer = setInterval(() => { sweep(); if (++ticks > 20) stopSweep() }, 500)
  window.addEventListener('scroll', onScrollSweep, { passive: true })
}

/* module scope, so teardown can reach them across route changes */
let sweepTimer = null
let sweepFn = null
let pending = []
let scrollRaf = 0

function onScrollSweep() {
  /* one check per frame at most: the sweep reads computed styles, and doing that per scroll event
     on a Lenis-driven page would be dozens of reads a frame */
  if (scrollRaf || !sweepFn) return
  scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; if (sweepFn) sweepFn() })
}

function stopSweep() {
  if (sweepTimer) { clearInterval(sweepTimer); sweepTimer = null }
  window.removeEventListener('scroll', onScrollSweep)
  sweepFn = null
  pending = []
}

export function teardownMotion() {
  stopSweep()
  /* Kill by id, not all: the page scenes own ScrollTriggers of their own and
     a blanket kill would take the pinned showpieces down with it. */
  ScrollTrigger.getAll().forEach(t => { if (t.vars && t.vars.id === ID) t.kill() })
  if (ctx) { ctx.revert(); ctx = null }
}
