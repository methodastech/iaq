import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * "Support Beyond Buying and Selling" — services section.
 *
 * Grid, not a slider: row 1 holds the three reference cards at their exact
 * geometry (553 x 470 @1920), row 2 holds four more at the same height.
 * Hover is an accordion — the hovered card stretches (flex-grow 1 → 1.33,
 * i.e. 667px against 501px siblings @1920) and its description fades up.
 *
 * Motion: GSAP (already a project dependency) for the entrance only.
 * The stretch and the reveal are pure CSS.
 */

const EASE = 'cubic-bezier(.22,1,.36,1)'

const ROW_ONE = [
  {
    title: ['Mortgage', 'Services'],
    desc: 'Helping you secure your dream home with flexible mortgage options.',
    img: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=80',
    alt: 'Dark urban building facade with repeating arched windows',
    pos: '50% 50%',
  },
  {
    title: ['Property', 'Management'],
    desc: 'Let us handle the details so you can enjoy the rewards.',
    img: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80',
    alt: 'Balcony view over the city and river at sunset',
    pos: '50% 60%',
  },
  {
    title: ['Construction', 'and Real Estate', 'Development'],
    desc: 'Guiding you through the intricacies of building and developing properties with expert insight and support.',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    alt: 'Two people standing beside modern architecture',
    pos: '58% 68%',
  },
]

const ROW_TWO = [
  {
    title: ['Interior', 'Design'],
    desc: 'Shaping considered interiors that elevate the way a property lives and sells.',
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    alt: 'Minimal warm interior with natural light',
    pos: '50% 55%',
  },
  {
    title: ['Property', 'Valuation'],
    desc: 'Precise, market-led appraisals so you always know what your asset is worth.',
    img: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1600&q=80',
    alt: 'Modern residence exterior at dusk',
    pos: '50% 62%',
  },
  {
    title: ['Investment', 'Advisory'],
    desc: 'Building long-term portfolios around yield, timing and location.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    alt: 'Low angle of a glass tower against a pale sky',
    pos: '50% 45%',
  },
  {
    title: ['Relocation', 'Services'],
    desc: 'Handling every detail of the move so arrival feels effortless.',
    img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80',
    alt: 'Residential home in warm afternoon light',
    pos: '50% 58%',
  },
]

/* Breakpoint rhythm + the accordion itself. Kept as real CSS because the
   shared --pad / --gap pair drives the derived card height, and because the
   stretch reads far better as one rule than as a chain of arbitrary variants. */
const SHELL_CSS = `
.svc{
  --pad:24px; --gap:20px;
  --card-h:calc((100vw - (var(--pad) * 2)) * 1);
}
@media (min-width:481px){ .svc{--card-h:calc((100vw - (var(--pad) * 2)) * 1.25)} }
@media (min-width:769px){
  .svc{--pad:56px; --gap:24px;
       --card-h:calc(((100vw - (var(--pad) * 2) - var(--gap)) / 2) * .85)}
}
@media (min-width:1201px){ .svc{--pad:72px; --gap:26px} }
@media (min-width:1441px){ .svc{--pad:100px; --gap:30px} }
@media (min-width:1201px){
  .svc{--card-h:calc(((100vw - (var(--pad) * 2) - (var(--gap) * 2)) / 3) * .85)}
}

.svc-card{ height:var(--card-h); transition:flex-grow 560ms cubic-bezier(.22,1,.36,1) }

/* one per row → two per row → the 3 / 4 accordion grid */
.svc-card{ flex:0 0 100% }
@media (min-width:769px){ .svc-card{ flex:0 0 calc((100% - var(--gap)) / 2) } }
@media (min-width:1201px){
  .svc-card{ flex:1 1 0; min-width:0 }
  .svc-card:hover, .svc-card:focus-within{ flex-grow:1.33 }
}

@media (prefers-reduced-motion:reduce){
  .svc *{ transition:none!important; animation:none!important }
}
`

function Arrow({ w = 20, h = 12 }) {
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-300 group-hover/pill:translate-x-[6px]"
      style={{ transitionTimingFunction: EASE }}
    >
      <path
        d="M0 6h18M13 1l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Card({ service }) {
  return (
    <article
      data-reveal="card"
      tabIndex={0}
      className="svc-card group relative overflow-hidden rounded-none bg-[#1A1D1C]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={service.img}
          alt={service.alt}
          className="h-full w-full scale-100 object-cover transition-transform duration-700 group-hover:scale-[1.012] group-focus-within:scale-[1.012]"
          style={{ objectPosition: service.pos, transitionTimingFunction: EASE }}
        />
      </div>

      {/* readability scrim — not decoration */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg,rgba(0,0,0,.52) 0%,rgba(0,0,0,.24) 34%,rgba(0,0,0,.06) 58%,rgba(0,0,0,.34) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/[.18] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ transitionTimingFunction: EASE }}
      />

      <div className="absolute left-7 right-7 top-9 md:left-10 md:right-8 md:top-11 min-[1441px]:left-[52px] min-[1441px]:right-10 min-[1441px]:top-[55px]">
        <h3 className="whitespace-normal text-[clamp(28px,7.2vw,34px)] font-medium leading-[1.06] tracking-[-0.014em] md:whitespace-nowrap md:text-[clamp(26px,2.29vw,44px)]">
          {service.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>

        <p
          className="mt-4 max-w-[92%] translate-y-0 text-[16px] font-normal leading-[1.35] tracking-[-0.002em] opacity-100 md:mt-[34px] md:max-w-[80%] md:translate-y-3 md:text-[17px] md:opacity-0 md:transition-[opacity,transform] md:duration-[420ms] md:delay-[60ms] md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 min-[1441px]:mt-[46px] min-[1441px]:w-[350px] min-[1441px]:max-w-full min-[1441px]:text-[18px]"
          style={{ transitionTimingFunction: EASE }}
        >
          {service.desc}
        </p>
      </div>

      <a
        href="#"
        className="group/pill absolute bottom-[26px] left-[26px] flex h-[52px] w-[172px] items-center justify-between rounded-full border border-white/55 bg-white/0 pl-[26px] pr-[22px] text-[15.5px] tracking-[-0.003em] text-white backdrop-blur-[2px] transition-[background-color,border-color] duration-300 hover:border-white/85 hover:bg-white/5 md:bottom-10 md:left-10 md:h-[54px] md:w-[192px] md:text-[16.5px] min-[1441px]:bottom-[50px] min-[1441px]:left-[52px]"
        style={{ transitionTimingFunction: EASE }}
      >
        <span>Learn More</span>
        <Arrow w={18} h={11} />
      </a>
    </article>
  )
}

export default function ServicesSection() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      gsap.set(root.querySelectorAll('[data-reveal]'), { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return
          io.disconnect()
          gsap
            .timeline({ defaults: { ease: 'power3.out', duration: 0.82 } })
            .from('[data-reveal="heading"]', { opacity: 0, y: 30 })
            .from('[data-reveal="copy"]', { opacity: 0, y: 25 }, 0.09)
            .from('[data-reveal="cta"]', { opacity: 0, y: 15 }, 0.17)
            .from('[data-reveal="card"]', { opacity: 0, y: 35, stagger: 0.08 }, 0.1)
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      )
      io.observe(root)
      return () => io.disconnect()
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="services"
      className="svc relative overflow-hidden bg-[#101312] px-[var(--pad)] pt-12 pb-14 font-[Inter,'Helvetica_Neue',Helvetica,Arial,sans-serif] text-white antialiased md:pt-14 md:pb-[72px] min-[1201px]:pt-16 min-[1201px]:pb-[90px]"
    >
      <style>{SHELL_CSS}</style>

      {/* ===== TOP INTRO ===== */}
      <div className="grid items-start gap-y-[34px] md:grid-cols-[0.9fr_1fr] md:gap-x-11 md:gap-y-0 min-[1441px]:grid-cols-[0.8fr_1fr] min-[1441px]:gap-x-[60px]">
        <h2
          data-reveal="heading"
          className="max-w-none text-[clamp(34px,8.4vw,44px)] font-medium leading-[1] tracking-[-0.018em] md:max-w-[440px] md:text-[clamp(36px,4.2vw,50px)] md:leading-[0.96] min-[1441px]:max-w-[560px] min-[1441px]:text-[clamp(38px,3.23vw,62px)]"
        >
          Support
          <br />
          Beyond <span className="text-[#707170]">Buying</span>
          <br />
          <span className="text-[#707170]">and Selling</span>
        </h2>

        <div className="max-w-[640px] min-[1441px]:max-w-[850px] min-[1441px]:pt-1">
          <p
            data-reveal="copy"
            className="text-[clamp(18px,4.6vw,22px)] font-medium leading-[1.2] tracking-[-0.008em] text-[#707170] md:text-[clamp(18px,2.05vw,24px)] md:leading-[1.15] min-[1441px]:text-[clamp(18px,1.46vw,28px)]"
          >
            <span className="text-[#F4F5F4]">
              The real estate market never stands still — and neither do we.
            </span>{' '}
            Our experts offer continued support beyond the sale, helping you maximize your
            investment.
          </p>

          <a
            data-reveal="cta"
            href="#"
            className="group/pill mt-[34px] flex h-14 w-full max-w-[300px] items-center justify-between rounded-full bg-[#F4F5F4] pl-8 pr-[26px] text-[16px] font-medium tracking-[-0.005em] text-[#0B0D0C] transition-[transform,background-color] duration-300 hover:scale-[1.01] hover:bg-white min-[1441px]:mt-11 min-[1441px]:h-[60px] min-[1441px]:w-[280px] min-[1441px]:text-[17.5px]"
            style={{ transitionTimingFunction: EASE }}
          >
            <span>Discover Our Services</span>
            <Arrow />
          </a>
        </div>
      </div>

      {/* ===== CARD GRID — 7 SERVICES (3 / 4) ===== */}
      <div className="mt-14 flex flex-col gap-[var(--gap)] md:mt-[76px] min-[1201px]:mt-[88px] min-[1441px]:mt-[104px]">
        <div className="flex flex-wrap items-stretch gap-[var(--gap)] min-[1201px]:flex-nowrap">
          {ROW_ONE.map((s) => (
            <Card key={s.title.join(' ')} service={s} />
          ))}
        </div>
        <div className="flex flex-wrap items-stretch gap-[var(--gap)] min-[1201px]:flex-nowrap">
          {ROW_TWO.map((s) => (
            <Card key={s.title.join(' ')} service={s} />
          ))}
        </div>
      </div>
    </section>
  )
}
