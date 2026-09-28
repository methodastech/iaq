import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   Global Presence · /global-presence · sitemap id `global-presence`
   Blocks, in sitemap order: Globe · Office list · Projects by country · Enquiry
   One action: Start a project → /contact

   CONTENT PROVENANCE. Office list per the client confirmation of 19 Aug 2026:
   Malaysia (Shah Alam HQ + Penang), Singapore, Germany (Dresden), India,
   Sweden, USA, Ireland — seven countries, matching the counters used across the site (Ireland announced 10 Sep 2026).
   Delivered-in keeps the countries with past projects but no current office:
   China, Poland, France and Morocco. Street addresses for India, Sweden and
   the USA are still outstanding from IAQ.

   The projects listed are the 18 publishable entries in src/data/projects.js.
   The ~77 profile-only references are NOT named: they carry client names that
   cannot be published.
   ============================================================================ */

const OFFICES = [
  { lat: 3.08, lon: 101.53, label: 'Shah Alam' },
  { lat: 5.18, lon: 100.49, label: 'Penang' },
  { lat: 1.35, lon: 103.82, label: 'Singapore' },
  { lat: 51.05, lon: 13.74, label: 'Dresden' },
  { lat: 21.0, lon: 78.0, label: 'India' },
  { lat: 63.8, lon: 20.3, label: 'Sweden' },
  { lat: 33.4, lon: -112.1, label: 'USA' },
  { lat: 53.35, lon: -6.26, label: 'Ireland' },
]
const DELIVERED = [
  { lat: 31.2, lon: 121.5, label: 'China' },
  { lat: 52.2, lon: 21.0, label: 'Poland' },
  { lat: 46.6, lon: 2.4, label: 'France' },
  { lat: 33.6, lon: -7.6, label: 'Morocco' },
]

const C = 160, R = 116, TILT = 0.35, RAD = Math.PI / 180

/* orthographic projection with a fixed x-tilt. z > 0 is the near face. */
function project(lat, lon, rot) {
  const la = lat * RAD, lo = (lon + rot) * RAD
  const x = Math.cos(la) * Math.sin(lo)
  const y0 = Math.sin(la)
  const z0 = Math.cos(la) * Math.cos(lo)
  return {
    x: C + x * R,
    y: C - (y0 * Math.cos(TILT) - z0 * Math.sin(TILT)) * R,
    z: y0 * Math.sin(TILT) + z0 * Math.cos(TILT),
  }
}

/* sample a graticule line and cut it wherever it passes round the back */
function segments(points, rot) {
  const out = []
  let run = []
  points.forEach(([la, lo]) => {
    const p = project(la, lo, rot)
    if (p.z > 0) run.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    else { if (run.length > 1) out.push(run.join(' ')); run = [] }
  })
  if (run.length > 1) out.push(run.join(' '))
  return out
}

function Globe() {
  const [rot, setRot] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined
    let raf = 0, last = 0
    const tick = t => {
      if (t - last > 40) { last = t; setRot(r => (r + 0.4) % 360) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const grat = useMemo(() => {
    const paths = []
    for (let lo = 0; lo < 360; lo += 30) {
      const pts = []
      for (let la = -90; la <= 90; la += 5) pts.push([la, lo])
      segments(pts, rot).forEach(d => paths.push(d))
    }
    for (let la = -60; la <= 60; la += 30) {
      const pts = []
      for (let lo = 0; lo <= 360; lo += 5) pts.push([la, lo])
      segments(pts, rot).forEach(d => paths.push(d))
    }
    return paths
  }, [rot])

  const pins = useMemo(() => {
    const mark = (arr, kind) => arr.map(o => ({ ...project(o.lat, o.lon, rot), label: o.label, kind }))
    return [...mark(DELIVERED, 'dl'), ...mark(OFFICES, 'of')].filter(p => p.z > 0.03)
  }, [rot])

  return (
    <div className="cp-globe">
      <svg viewBox="0 0 320 320" role="img"
        aria-label="Globe marking the IAQ offices in Shah Alam, Penang, Singapore, Dresden, India, Sweden, the USA and Ireland, and the countries IAQ has delivered in: China, Poland, France and Morocco.">
        <circle cx={C} cy={C} r={R} fill="#0B1526" stroke="rgba(255,255,255,.16)" strokeWidth="1" />
        <g fill="none" stroke="rgba(140,170,225,.24)" strokeWidth=".7">
          {grat.map((d, i) => <polyline key={i} points={d} />)}
        </g>
        {pins.map((p, i) => (
          <g key={`${p.kind}-${p.label}-${i}`}>
            <circle cx={p.x} cy={p.y} r={p.kind === 'of' ? 3.4 : 2.6}
              fill={p.kind === 'of' ? '#FF3B44' : '#7C8CAA'}
              opacity={p.kind === 'of' ? 1 : 0.8} />
            {p.kind === 'of' && (
              <text x={p.x + 7} y={p.y + 3.4} fill="#D7E2F5" fontSize="8.5"
                fontFamily="JetBrains Mono, monospace">{p.label}</text>
            )}
          </g>
        ))}
      </svg>
      <div className="cp-globe-legend">
        <span><i className="of" />Offices</span>
        <span><i className="dl" />Delivered in</span>
      </div>
    </div>
  )
}

/* the 18 publishable projects, grouped the way the registry groups them */
const REGIONS = [
  ['malaysia', 'Malaysia'],
  ['singapore', 'Singapore'],
  ['china', 'China'],
  ['europe', 'Europe'],
]

export default function GlobalPresence() {
  useEffect(() => { document.title = 'IAQ Group · Global Presence · Brand Method' }, [])

  const grouped = useMemo(() => REGIONS.map(([key, name]) => ({
    key,
    name,
    items: PROJECTS.map((p, i) => ({ ...p, i })).filter(p => p.region === key),
  })).filter(g => g.items.length), [])

  return (
    <>
      <Nav />

      <PageHead crumbs={[{ label: 'About', to: '/about' }]}
        eyebrow="Where we are"
        title={<>Rooted in Malaysia, <em>building across borders.</em></>}
        lede="Founded in Malaysia in 1995. Today a total facility solutions provider with offices in six countries, measured in the programmes those offices run and the projects handed over."
      />

      {/* ── Globe ───────────────────────────────────────────────────────── */}
      <section className="cp-globe-band">
        <div className="pg-in cp-globe-wrap">
          <Globe />
          <div className="cp-globe-copy">
            <span className="eyebrow">The footprint</span>
            <h2>The pin map, <em>and the work behind it.</em></h2>
            <p>
              Red marks an office: Shah Alam, Penang, Singapore, Dresden, India, Sweden, the USA and,
              from September 2026, Ireland: seven countries. Pale marks a country IAQ has built in: China,
              Poland, France and Morocco.
            </p>
            <p>
              Each office supports clients locally and draws on the group&rsquo;s full regional engineering
              capability.
            </p>
          </div>
        </div>
      </section>

      {/* ── Office list ─────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Offices</span>
          <h2>The addresses <em>that answer.</em></h2>

          <div className="cp-offices">
            <div className="cp-office">
              <span className="k">Headquarters</span>
              <h3>Shah Alam, Malaysia</h3>
              <p>12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor.</p>
            </div>
            <div className="cp-office">
              <span className="k">Branch · 2025</span>
              <h3>Penang, Malaysia</h3>
              <p>9, Lorong Valdor Jaya 2, Kawasan Perindustrian Valdor, 14200 Jawi, Penang.</p>
            </div>
            <div className="cp-office">
              <span className="k">Europe</span>
              <h3>Dresden, Germany</h3>
              <p>IAQ Engineering (DE) GmbH, 8.OG, Budapester Strasse 5, 01069 Dresden.</p>
            </div>
          </div>

          <div className="cp-chips">
            <span className="lbl">Offices</span>
            <em>Singapore</em><em>India</em><em>Sweden</em><em>USA</em><em>Ireland</em>
          </div>
          <div className="cp-chips">
            <span className="lbl">Delivered in</span>
            <em>China</em><em>Poland</em><em>France</em><em>Morocco</em>
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Office addresses · supplied by IAQ</span>
              <b>Seven countries confirmed · street addresses outstanding</b>
              <p>
                The country list is settled: Malaysia, Singapore, Germany, India, Sweden, USA, and Ireland from 10 September 2026.
                Still needed from IAQ before launch:
              </p>
              <ul>
                <li>Street addresses for the Singapore, India, Sweden and USA offices</li>
                <li>The Ireland office: entity name, street address and phone</li>
                <li>The HQ street number: the profile prints 9, every other source prints 12</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects by country ─────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">By country</span>
          <h2>Reach, <em>as evidence.</em></h2>
          <p className="pg-lede">
            The publishable record, grouped by where it was built. Every entry opens the full project.
          </p>

          {grouped.map(g => (
            <div key={g.key} style={{ marginTop: '28px' }}>
              <span className="cp-pk">
                {g.name} · {g.items.length} {g.items.length === 1 ? 'project' : 'projects'}
              </span>
              <div className="cp-rows">
                {g.items.map(p => (
                  <Link className="cp-row" key={p.i} to={`/projects/${p.i}`}>
                    <span className="c">{p.client}</span>
                    <span className="n">{p.name}</span>
                    <span className="v">{p.loc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <p className="pg-note">
            18 projects published at concept stage · IAQ confirms the definitive launch list before go live · profile-only references stay off the page while their client names remain confidential
          </p>
        </div>
      </section>

      {/* ── Enquiry ─────────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Enquiries</span>
          <h2>A facility in any <em>of these countries.</em></h2>
          <div className="cp-act">
            <Link className="cta" to="/contact">Start a project</Link>
            <span className="cp-hint">
              Tell us the country, the class and the programme. One accountable team from feasibility to
              handover.
            </span>
          </div>
        </div>
      </section>
      <ClosingBand note="Global Presence concept · Brand Method" />
    </>
  )
}
