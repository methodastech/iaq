import React from 'react'
import '../styles/culture-hero.css'

/* Culture hero photo set, 15 Sep 2026. Bazil circled the old collage ("make this section look a lot
   better"): three photos scattered at unrelated sizes, overlapping, and all three repeated in the strip
   right below. Now one composed set aligned to the copy: a wide top frame and two below, IAQ's own
   photographs, each used ONCE on the page. They reveal with a wipe and drift at three rates as the page
   scrolls (useMomentum, data-mo), so the set reads with depth without moving around. */
const PICS = [
  /* 25 Sep (Bazil: "change this picture, make it better, use Higgsfield, more professional"): the team photo with a logo
     pasted over it (the file also carried an "AI-generated content" mark) is replaced by a Higgsfield frame of engineers in
     cleanroom garments on a finished floor. Generated, so it carries the Representation tag. */
  { k: 'a', src: '/assets/culture/cleanroom-team-rep.webp', alt: 'Engineers in cleanroom garments reviewing a tablet on a finished cleanroom floor', cap: 'Finished cleanroom floor', mo: 0.9, pos: '50% 38%', rep: true },
  { k: 'b', src: '/assets/culture/hq-lobby-eid-2025.webp', alt: 'IAQ colleagues gathered in the Shah Alam headquarters lobby for Hari Raya 2025', cap: 'Hari Raya at headquarters, 2025', mo: -0.6, pos: '50% 42%' },
  { k: 'c', src: '/assets/culture/annual-dinner-2025.webp', alt: 'The IAQ team together at Annual Dinner 2025', cap: 'Annual Dinner 2025', mo: 0.55, pos: '50% 50%' },
]

export default function CultureCollage() {
  return (
    <div className="cuh cu-rv" style={{ '--d': '.1s' }}>
      {PICS.map(p => (
        <figure className={'cuh-f cuh-' + p.k} key={p.k}>
          <span className="cuh-mo" data-mo={p.mo}>
            <img src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} decoding="async" fetchPriority={p.k === 'a' ? 'high' : undefined} />
          </span>
          <figcaption>{p.cap}</figcaption>
          {p.rep && <span className="cuh-rep">Representation</span>}
        </figure>
      ))}
    </div>
  )
}
