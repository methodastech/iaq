import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================================
   THE CLOUD TRANSITION.

   The hero does not end, it clouds over. Four layers straddle the seam
   between the hero and the glance section (markup in Home.jsx, paint in
   home.css), and one scrubbed timeline drives them at different speeds as
   the hero's bottom edge climbs the viewport:

     hero video   sinks, softens, washes out          (slowest)
     rear mist    a huge blurred mass, far away       (very slow)
     main cloud   the photographic bank, mid-field    (medium)
     fore fog     thin wisps crossing in front        (fastest)
     white wash   the finishing layer that becomes the next section's ground

   Every layer moves slower than the scroll itself, which is what reads as
   atmosphere rather than as an element scrolling by. The glance content
   rises out of the whiteness at the end.

   Reduced motion: no timeline at all. The CSS resting state is a soft
   static mist over the seam, which already hides the hard edge.
   ============================================================================ */

export default function initCloudX() {
  const hero = document.querySelector('.hero')
  const wrap = document.getElementById('cldx')
  if (!hero || !wrap) return () => {}

  const video = hero.querySelector('.hero-video')
  const veil = hero.querySelector('.hero-veil')
  const inner = hero.querySelector('.hero-inner')
  const rear = document.getElementById('cldxRear')
  const main = document.getElementById('cldxMain')
  const fore = document.getElementById('cldxFore')
  const wash = document.getElementById('cldxWash')
  const next = document.querySelector('.glance-in')

  const mm = gsap.matchMedia()

  mm.add(
    {
      still: '(prefers-reduced-motion: reduce)',
      mobile: '(max-width: 640px)',
      tablet: '(min-width: 641px) and (max-width: 1024px)',
      desktop: '(min-width: 1025px)',
    },
    (ctx) => {
      const { still, mobile, tablet } = ctx.conditions
      if (still) return

      /* movement scale: full drama on desktop, ~20% less on tablet,
         roughly half the travel on mobile for performance */
      const k = mobile ? 0.5 : tablet ? 0.8 : 1

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'cldx',
          trigger: hero,
          start: 'bottom bottom',
          end: mobile ? 'bottom 40%' : 'bottom 18%',
          scrub: mobile ? true : 0.7,
          invalidateOnRefresh: true,
        },
      })

      /* the hero recedes: a slight lift and swell while contrast drains
         away, with a whisper of blur only at the very end */
      if (video) {
        tl.fromTo(video,
          { y: 0, scale: 1, filter: 'contrast(1) brightness(1) blur(0px)' },
          { y: -34 * k, scale: 1.03, filter: 'contrast(.84) brightness(1.16) blur(0px)', duration: 0.8 }, 0)
        tl.to(video, { filter: 'contrast(.8) brightness(1.2) blur(2.5px)', duration: 0.2 }, 0.8)
      }

      /* the veil whitens the whole backdrop mid-phase, so by the time the
         clouds thin there is no gray hero and no seam contrast left behind
         them — the copy dissolves along with it */
      if (veil) tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power1.inOut' }, 0.3)
      if (inner) tl.fromTo(inner, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0.35)

      /* the layers, rear to front, each faster than the one behind it */
      const drift = (el, from, to, at = 0, dur = 1) =>
        el && tl.fromTo(el, from, { ...to, duration: dur }, at)

      drift(rear,
        { yPercent: 14 * k, opacity: 0.22, scale: 1.03 },
        { yPercent: -7 * k, opacity: 0.9, scale: 1.07 })
      drift(main,
        { yPercent: 20 * k, opacity: 0.26, scale: 1.05 },
        { yPercent: -14 * k, opacity: 1, scale: 1.15 })
      drift(fore,
        { yPercent: 28 * k, opacity: 0.16, scale: 1.1 },
        { yPercent: -24 * k, opacity: 1, scale: 1.24 })

      /* the wash arrives with the veil: the seam region is buried in solid
         white well before the cloud layers rise past it */
      drift(wash, { opacity: 0 }, { opacity: 1, ease: 'power1.in' }, 0.35, 0.45)

      /* the next section surfaces from inside the cloud */
      if (next) {
        tl.fromTo(next,
          { y: 30 * k, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }, 0.62)
      }
    }
  )

  return () => mm.revert()
}
