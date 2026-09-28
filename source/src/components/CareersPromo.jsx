import React from 'react'
import { Link } from 'react-router-dom'
import { ROLES, DEPTS, speculativeHref } from '../data/roles.js'
import '../styles/careers-promo.css'

/* 15 Sep (Bazil: "from both pages we can just click a button like open roles, and also promote
   above the footer on both pages"). One band, two directions, placed directly above the closing
   block on Careers and on Culture. On Careers it promotes Life at IAQ with the team photographs;
   on Culture it promotes the open roles with the live department counts, the same registry the
   Careers list renders. Photographs are IAQ's own, from the newsroom. */
const PICS = [
  /* 25 Sep: IAQ's own photograph (SharePoint DSCN6580) in place of the logo-pasted team photo */
  { src: '/assets/iaq/cr-team-dscn6580.webp', alt: 'The IAQ team crossing a finished cleanroom ballroom' },
  { src: '/assets/photo-opening.webp', alt: 'IAQ colleagues around a meeting table' },
  { src: '/assets/photo-awards.webp', alt: 'The IAQ team at the MCIEA 2024 awards night' },
]

const Arrow = () => <i className="cpr-arr" aria-hidden="true">&rarr;</i>

export default function CareersPromo({ variant = 'culture' }) {
  const nRoles = ROLES.length
  const depts = DEPTS.map(([id, label]) => ({ id, label, n: ROLES.filter(r => r.dept === id).length })).filter(d => d.n)
  if (variant === 'roles') {
    return (
      <section className="cpr cpr-roles" aria-labelledby="cpr-h">
        <div className="wrap cpr-in">
          <div className="cpr-copy" data-reveal>
            <h2 id="cpr-h"><span data-count={nRoles}>{nRoles}</span> roles open, <em>{depts.length} departments.</em></h2>
            <p>Engineering, project delivery, commercial and finance, in Shah Alam and Penang. Every opening is on one list, filterable by location and department.</p>
            <div className="cpr-ctas">
              <Link className="cpr-btn" to="/careers#roles">See open roles <Arrow /></Link>
              <a className="cpr-btn ghost" href={speculativeHref}>Send a speculative CV</a>
            </div>
          </div>
          <ul className="cpr-depts" data-reveal>
            {depts.map(d => (
              <li key={d.id}><Link to={`/careers#dept=${d.id}`}><span>{d.label}</span><strong>{d.n}</strong><Arrow /></Link></li>
            ))}
          </ul>
        </div>
      </section>
    )
  }
  return (
    <section className="cpr cpr-life" aria-labelledby="cpr-h">
      <div className="wrap cpr-in">
        <div className="cpr-copy" data-reveal>
          <h2 id="cpr-h">Life at IAQ, <em>before the job title.</em></h2>
          <p>How the team works, how safety is held, where engineers start and grow, and the offices in seven countries. Read it before you apply.</p>
          <div className="cpr-ctas">
            <Link className="cpr-btn" to="/careers/culture">See how the team works <Arrow /></Link>
            <Link className="cpr-btn ghost" to="/careers/culture#cu-hire">How hiring works</Link>
          </div>
        </div>
        <div className="cpr-pics" data-reveal>
          {PICS.map(p => (
            <Link to="/careers/culture" key={p.src} aria-label={p.alt}><img src={p.src} alt="" loading="lazy" decoding="async" /></Link>
          ))}
        </div>
      </div>
    </section>
  )
}
