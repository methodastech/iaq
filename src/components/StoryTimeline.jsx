import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/story-timeline.css'

gsap.registerPlugin(ScrollTrigger)

/* Pinned horizontal company story, ported from the "story" concept (Next.js) into this site.
   Design and choreography kept; typography, colour and image treatment follow the IAQ system.
   Content = the ten milestones from the previous drag-timeline, preserved verbatim.
   The old section is backed up at src/pages/.about.pre-story.bak.jsx */

const MILESTONES = [
  {
    id: 'y1994', year: '1994', title: 'Founded on air',
    subtitle: 'A small office, a blueprint, an unrelenting spirit.',
    body: 'Ir. Tiew Soon Aik establishes IAQ in Malaysia as a cleanroom specialist: a small office, a blueprint and an unrelenting spirit.',
    images: [
      { src: '/assets/about-1994-workshop.webp', alt: 'The first workshop, 1994', slot: 'a', drift: -0.03, chip: 'Interim · current site' },
    ],
  },
  {
    id: 'y2000', year: '2000', title: 'First build abroad',
    subtitle: '25,000 m² of cleanroom delivered in China.',
    body: "25,000 m² of cleanroom, M&E and utilities delivered in China for the dot-com boom's chipmakers: the first project beyond Malaysia, with more across China to follow.",
    images: [
      { src: '/assets/tl-2000-china.webp', alt: 'Construction site in China, 2000', slot: 'a', drift: -0.03, chip: 'Interim · AI concept' },
    ],
  },
  {
    id: 'y2007', year: '2007', title: 'Into Europe',
    subtitle: 'A branch office in Poland; France follows.',
    body: "A branch office opens in Poland for engineering, procurement, construction and commissioning; a project in France follows on a client's recommendation.",
    images: [
      { src: '/assets/tl-2007-europe.webp', alt: 'European city street', slot: 'a', drift: 0.03, chip: 'Interim · AI concept' },
    ],
  },
  {
    id: 'y2009', year: '2009', title: 'Class 1, delivered',
    subtitle: 'Among the cleanest rooms in the region.',
    body: 'A 14,000 m² Class 1 cleanroom is built in Ipoh, among the cleanest rooms in the region, as the group extends its reach to Morocco.',
    images: [
      { src: '/assets/photo-cleanroom.webp', alt: 'Cleanroom interior', slot: 'a', drift: -0.02, chip: 'Interim · concept asset' },
    ],
  },
  {
    id: 'y2013', year: '2013', title: 'The energy pivot',
    subtitle: "Malaysia's largest district cooling plant.",
    body: "Main contractor for Malaysia's largest district cooling plant: a system serving 56,000 parties, delivered with zero lost-time injury and a 25 year maintenance mandate.",
    images: [
      { src: '/assets/about-2013-energy.webp', alt: 'Energy plant works', slot: 'a', drift: -0.03, chip: 'Interim · current site' },
      { src: '/assets/projects/prj-012.webp', alt: 'District cooling centre, Kuala Lumpur', slot: 'b', drift: 0.04, chip: 'Photo · iaqtechnology.com.my' },
    ],
  },
  {
    id: 'y2015', year: '2015', title: 'Semiconductor scale',
    subtitle: 'A 43,000 m² backend facility.',
    body: 'A 43,000 m² backend facility marks a new order of scale; Class 100 cleanroom works for the national wafer fab initiative follow a year later.',
    images: [
      { src: '/assets/about-2015-robotics.webp', alt: 'Robotics in a semiconductor facility', slot: 'a', drift: -0.03, chip: 'Interim · current site' },
      { src: '/assets/projects/prj-003.webp', alt: 'Semiconductor backend plant', slot: 'b', drift: 0.04, chip: 'Photo · iaqtechnology.com.my' },
    ],
  },
  {
    id: 'y2020', year: '2020', title: 'The EV era',
    subtitle: 'Dry rooms for a Swedish gigafactory.',
    body: 'Dry rooms and architectural works for a Swedish gigafactory carry IAQ into EV batteries; a green-certified plant lands ahead of schedule through the pandemic.',
    images: [
      { src: '/assets/tl-2020-dryroom.webp', alt: 'Battery dry room', slot: 'a', drift: -0.03, chip: 'Interim · AI concept' },
      { src: '/assets/projects/prj-006.webp', alt: 'Gigafactory dry room, Europe', slot: 'b', drift: 0.04, chip: 'Photo · iaqtechnology.com.my' },
    ],
  },
  {
    id: 'y2022', year: '2022', title: 'Mega projects',
    subtitle: 'Wafer fabs, data centres, design and build.',
    body: 'A wafer fab expansion in the northern corridor, entry into data centres, and a full design and build fab expansion in Kuching the following year.',
    images: [
      { src: '/assets/hero-campus.webp', alt: 'Facility campus', slot: 'a', drift: -0.03, chip: 'Interim · concept asset' },
      { src: '/assets/projects/prj-002.webp', alt: 'Wafer fab facility, the northern corridor', slot: 'b', drift: 0.04, chip: 'Photo · iaqtechnology.com.my' },
    ],
  },
  {
    id: 'y2025', year: '2025', title: 'Going global',
    subtitle: 'Penang, Dresden, and a global arc.',
    body: 'A second Malaysian base opens in Penang; IAQ Engineering (DE) GmbH opens in Dresden, joining offices in Singapore, France and India.',
    images: [
      { src: '/assets/tl-2025-global.webp', alt: 'Global offices', slot: 'a', drift: -0.02, chip: 'Interim · AI concept' },
    ],
  },
  {
    id: 'today', year: 'Today', title: 'Listing-grade',
    subtitle: 'Eight countries · 450 people · 250+ projects.',
    body: 'Eight countries, 450 people, more than 250 projects and over a million square metres of cleanroom built-up, and a group preparing for its public listing.',
    images: [
      { src: '/assets/photo-team.webp', alt: 'The IAQ team', slot: 'a', drift: -0.02, chip: 'Interim · concept asset' },
      { src: '/assets/photo-awards.webp', alt: 'Awards night', slot: 'b', drift: 0.04, chip: 'Interim · concept asset' },
    ],
  },
]

/* thin engineering ticks scattered along the line, per scene */
const TICKS = {
  y1994: [{ left: '12vw', dir: 'up', h: 34 }, { left: '52vw', dir: 'down', h: 26 }, { left: '79vw', dir: 'up', h: 42 }],
  y2000: [{ left: '8vw', dir: 'down', h: 30 }, { left: '44vw', dir: 'up', h: 25 }, { left: '88vw', dir: 'down', h: 38 }],
  y2007: [{ left: '10vw', dir: 'up', h: 28 }, { left: '48vw', dir: 'down', h: 44 }],
  y2009: [{ left: '38vw', dir: 'up', h: 32 }, { left: '74vw', dir: 'down', h: 26 }],
  y2013: [{ left: '6vw', dir: 'down', h: 34 }, { left: '46vw', dir: 'up', h: 26 }],
  y2015: [{ left: '9vw', dir: 'up', h: 40 }, { left: '43vw', dir: 'down', h: 28 }, { left: '92vw', dir: 'up', h: 30 }],
  y2020: [{ left: '10vw', dir: 'down', h: 32 }, { left: '52vw', dir: 'up', h: 26 }],
  y2022: [{ left: '14vw', dir: 'up', h: 30 }, { left: '58vw', dir: 'down', h: 40 }],
  y2025: [{ left: '8vw', dir: 'down', h: 28 }, { left: '46vw', dir: 'up', h: 34 }],
  today: [{ left: '10vw', dir: 'down', h: 32 }, { left: '52vw', dir: 'up', h: 26 }],
}

function Scene({ milestone }) {
  return (
    <article className={`scene scene--${milestone.id}`} data-scene>
      <h3 className="scene__year" data-year aria-hidden="true">{milestone.year}</h3>
      <span className="scene__node" aria-hidden="true" />
      {(TICKS[milestone.id] || []).map((t, i) => (
        <span key={i} className={`scene__tick scene__tick--${t.dir}`} style={{ left: t.left, height: t.h }} aria-hidden="true" />
      ))}
      <div className="scene__copy" data-copy>
        <span className="scene__k">{milestone.year}</span>
        <h3 className="scene__title">{milestone.title}</h3>
        <p className="scene__subtitle">{milestone.subtitle}</p>
        <p className="scene__body">{milestone.body}</p>
      </div>
      <div className="scene__images">
        {milestone.images.map(img => (
          <figure key={img.src} className={`scene__img scene__img--${img.slot}`} data-img data-drift={img.drift || 0}>
            <img src={img.src} alt={img.alt} loading={milestone.id === 'y1994' ? 'eager' : 'lazy'} draggable={false} />
            <span className="scene__chip">{img.chip}</span>
          </figure>
        ))}
      </div>
    </article>
  )
}

export default function StoryTimeline() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const track = trackRef.current
    if (!section || !sticky || !track) return

    const mm = gsap.matchMedia()

    /* Reduced motion → simple vertical story, no pinning, no tweens. */
    mm.add('(prefers-reduced-motion: reduce)', () => {
      section.classList.add('story--static')
      return () => section.classList.remove('story--static')
    })

    /* Horizontal travel driven by a STICKY viewport, not ScrollTrigger's pin — the same
       pattern as the homepage showpiece. Pinning fights this site's Lenis + :root zoom
       setup; sticky is plain CSS, so the section just needs its height set to the travel.
       All measurements use the sticky element's own local px space, sidestepping the
       visual-vs-local mismatch the desktop zoom:1.12 creates. */
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const vwLocal = () => sticky.clientWidth
      const distance = () => Math.max(1, track.scrollWidth - vwLocal())
      /* extra scroll where "Today" stays settled before the section releases */
      const settle = () => sticky.offsetHeight * 0.9

      /* the section's height IS the scrub length: travel + settle + one viewport */
      const setHeight = () => {
        section.style.height = (distance() + settle() + sticky.offsetHeight) + 'px'
      }
      /* re-derive the height before ScrollTrigger measures, on every refresh */
      ScrollTrigger.addEventListener('refreshInit', setHeight)

      /* Piecewise-linear ease: constant speed for most of the travel, then a gentle
         deceleration so "Today" settles and rests before unpinning. */
      const SETTLE_AT = 0.82
      const travelEase = p =>
        p < SETTLE_AT
          ? (p / SETTLE_AT) * 0.96
          : 0.96 + 0.04 * (1 - Math.pow(1 - (p - SETTLE_AT) / (1 - SETTLE_AT), 2))

      const scenes = gsap.utils.toArray('[data-scene]', track)

      /* Subtle entrance per scene, played when the scene's left edge crosses ~78% vw. */
      const entries = scenes.map(scene => {
        const year = scene.querySelector('[data-year]')
        const copy = scene.querySelector('[data-copy]')
        const imgs = scene.querySelectorAll('[data-img]')
        const tl = gsap.timeline({ paused: true })
          .fromTo(year, { autoAlpha: 0.5, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' })
          .fromTo(copy, { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.08)
          .fromTo(imgs, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out', stagger: 0.07 }, 0.05)
        /* force-render the "from" state so upcoming scenes start hidden */
        tl.progress(1).progress(0)
        return { el: scene, tl, threshold: 0 }
      })

      /* Barely-there parallax drift between photo layers, driven off the track's real x. */
      const driftItems = gsap.utils.toArray('[data-img]', track)
        .map(img => ({
          el: img,
          drift: parseFloat(img.dataset.drift || '0'),
          left: 0, width: 0,
          set: gsap.quickSetter(img, 'x', 'px'),
        }))
        .filter(d => d.drift !== 0)

      const measure = () => {
        entries.forEach(e => { e.threshold = e.el.offsetLeft - vwLocal() * 0.78 })
        driftItems.forEach(d => {
          const scene = d.el.closest('[data-scene]')
          d.left = (scene ? scene.offsetLeft : 0) + d.el.offsetLeft
          d.width = d.el.offsetWidth
        })
      }

      const update = () => {
        const trackX = Number(gsap.getProperty(track, 'x'))
        const traveled = -trackX
        const vw = vwLocal()
        entries.forEach(e => {
          if (traveled >= e.threshold) {
            if (e.tl.reversed() || !e.tl.progress()) e.tl.play()
          } else if (traveled < e.threshold - vw * 0.06 && e.tl.progress()) {
            e.tl.reverse()
          }
        })
        driftItems.forEach(d => {
          const screenLeft = d.left + trackX
          const p = gsap.utils.clamp(0, 1, (vw - screenLeft) / (vw + d.width))
          d.set(d.drift * vw * (1 - 2 * p))
        })
      }

      gsap.to(track, {
        x: () => -distance(),
        ease: travelEase,
        onUpdate: update,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => { measure(); update() },
        },
      })

      setHeight()
      measure()
      update()
      ScrollTrigger.refresh()

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', setHeight)
        section.style.height = ''
      }
    })

    /* Re-measure as lazy images decode: each one changes scrollWidth. Debounced. */
    let refreshId = 0
    const queueRefresh = () => { clearTimeout(refreshId); refreshId = setTimeout(() => ScrollTrigger.refresh(), 180) }
    const imgs = Array.from(track.querySelectorAll('img'))
    imgs.forEach(img => { if (!img.complete) img.addEventListener('load', queueRefresh, { once: true }) })
    window.addEventListener('load', queueRefresh)

    return () => {
      window.removeEventListener('load', queueRefresh)
      imgs.forEach(img => img.removeEventListener('load', queueRefresh))
      clearTimeout(refreshId)
      mm.revert()
    }
  }, [])

  return (
    <section className="story" ref={sectionRef} aria-label="IAQ company history, 1994 to today">
      <div className="story__pin" ref={stickyRef}>
        <div className="story__track" ref={trackRef}>
          <div className="story__line" aria-hidden="true" />
          <p className="story__label">The story so far · est. 1994</p>
          {MILESTONES.map(m => <Scene key={m.id} milestone={m} />)}
        </div>
      </div>
    </section>
  )
}
