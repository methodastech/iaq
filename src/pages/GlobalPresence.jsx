import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   Global Presence · /global-presence · sitemap id `global-presence`
   Blocks, in sitemap order: Globe · Office list · Projects by country · Enquiry
   One action: Start a project → /contact

   CONTENT PROVENANCE. The office list and the delivered-in list are EXACTLY the
   ones carried by the built about page, down to the same coordinates its live
   3D globe pins: offices at Shah Alam (HQ), Penang, Singapore, Dresden, France
   and India; delivered in China, Sweden, Poland and Morocco.

   NO COUNT IS CLAIMED. The sources do not reconcile on how many offices or how
   many countries: the company profile says six global offices, the live counter
   says eight in one block and seven in another, and the profile's own footprint
   sentence names a different set again. Rather than publish a number that
   contradicts the rest of the site, this page names the places and declares the
   count as an open item for IAQ.

   The projects listed are the 18 publishable entries in src/data/projects.js.
   The ~77 profile-only references are NOT named: they carry client names that
   cannot be published.
   ============================================================================ */

const OFFICES = [
  { lat: 3.08, lon: 101.53, label: 'Shah Alam' },
  { lat: 5.18, lon: 100.49, label: 'Penang' },
  { lat: 1.35, lon: 103.82, label: 'Singapore' },
  { lat: 51.05, lon: 13.74, label: 'Dresden' },
  { lat: 46.6, lon: 2.4, label: 'France' },
  { lat: 21.0, lon: 78.0, label: 'India' },
]
const DELIVERED = [
  { lat: 31.2, lon: 121.5, label: 'China' },
  { lat: 63.8, lon: 20.3, label: 'Sweden' },
  { lat: 52.2, lon: 21.0, label: 'Poland' },
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
        aria-label="Globe marking the IAQ offices in Shah Alam, Penang, Singapore, Dresden, France and India, and the countries IAQ has delivered in: China, Sweden, Poland and Morocco.">
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
  ['sea', 'Southeast Asia'],
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

      <PageHead
        eyebrow="Where we are"
        title={<>Rooted in Malaysia, <em>building across borders.</em></>}
        lede="From a modest Malaysian engineering firm in 1994 to a trusted global total facility solutions provider. Reach is not a map on a wall here: it is offices that hold a programme together, and projects that were handed over."
      />

      {/* ── Globe ───────────────────────────────────────────────────────── */}
      <section className="cp-globe-band">
        <div className="pg-in cp-globe-wrap">
          <Globe />
          <div className="cp-globe-copy">
            <span className="eyebrow">The footprint</span>
            <h2>The pin map, <em>and the work behind it.</em></h2>
            <p>
              Red marks an office: Shah Alam, Penang, Singapore, Dresden, France and India. Pale marks a
              country IAQ has built in: China, Sweden, Poland and Morocco. Home market first, Malaysia
              and Southeast Asia, with Europe and India as the growth arc.
            </p>
            <p>
              Beyond the Shah Alam headquarters, IAQ maintains a presence across Germany, India and
              Singapore, supporting clients locally while drawing on the full regional engineering
              capability.
            </p>
          </div>
        </div>
      </section>

      {/* ── Office list ─────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Office list</span>
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
            <em>Singapore</em><em>France</em><em>India</em>
          </div>
          <div className="cp-chips">
            <span className="lbl">Delivered in</span>
            <em>China</em><em>Sweden</em><em>Poland</em><em>Morocco</em>
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Office and country count · supplied by IAQ</span>
              <b>The page names the places rather than publishing a count</b>
              <p>
                The supplied sources give three different office counts and two different country
                counts. Until IAQ settles it, no number goes on this page that would contradict the rest
                of the site.
              </p>
              <ul>
                <li>The definitive office list, with street addresses for Singapore, France and India</li>
                <li>The Johor and Kuching bases named in the company profile, confirmed and addressed</li>
                <li>The definitive country count for the counters used elsewhere on the site</li>
                <li>The HQ street number: the profile prints 9, every other source prints 12</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects by country ─────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Projects by country</span>
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
            18 projects published at concept stage · the definitive launch list is still outstanding from
            IAQ · profile-only references are held back because they carry client names that cannot be
            published
          </p>
        </div>
      </section>

      {/* ── Enquiry ─────────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Enquiry</span>
          <h2>Building somewhere <em>on this map.</em></h2>
          <div className="cp-act">
            <Link className="cta" to="/contact">Start a project</Link>
            <span className="cp-hint">
              Tell us the country, the class and the programme. One accountable team from feasibility to
              handover.
            </span>
          </div>
        </div>
      </section>

      <Related from="global-presence" />
      <Footer note="Global Presence concept · Brand Method" />
    </>
  )
}
