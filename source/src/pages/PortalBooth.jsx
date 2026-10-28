import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/FlowIcon.jsx'
import { EVENT, DEADLINES, BRIEF, CONFIRMED, MESSAGE, SURFACES, PRINT_SPEC, SCREEN, COLLATERAL, TIMELINE, OWNERS, OPEN, FILES, POSTS, DIRECTIONS } from '../data/booth.js'
import { ADS } from '../components/booth/Art.jsx'
import { DIRS, LIVE, REJECTED, DEFAULT_DIR, SETS, OPT, pieceId, statusOf } from '../components/booth/sets.js'
import { PRINT_SETS, PIECES_PRINT } from '../components/booth/Print.jsx'
import { Directions, DirStatus } from '../components/booth/Direction.jsx'
import { useBrandFonts } from '../lib/brandFonts.js'
import '../styles/booth.css'
import CodexDownload, { CodexMini, PartDownload } from '../components/booth/CodexDownload.jsx'   /* 30 Sep: the codex and print files downloads, styles/booth-codex.css */

const BoothModel = lazy(() => import('../components/booth/BoothModel.jsx'))
/* 30 Sep: the print pieces in 3D, a folded sheet and a card (loaded only when the Print part comes near) */
const PrintViewer = lazy(() => import('../components/booth/PrintViewer.jsx'))

/* ============================================================================
   Portal · Booth (22 Sep 2026). SEMICON Europa 2026, designed: the plan, the design direction, the
   stand in 3D with each wall to scale, the print pieces, the booth screen and the digital pieces, the booth
   page on the website, and every file. One page (Bazil: "i need to see everything on the web, not touch and
   open another screen"): the bar jumps to a section and marks the one in view; /portal/booth/:view lands on it.
   The booth screen and the booth page run live inside it.
   Content: data/booth.js. Artwork: components/booth/Art.jsx (mm-true vector). 3D: BoothModel.jsx.
   Downloads: public/booth/png (tools/render-booth-art-0922.mjs) and public/booth/print
   (tools/export-booth-print-0922.mjs).
   29 Sep (Bazil: "complete the exhibition with 2 choices of direction"): every piece in two directions, shown side by
   side and labelled: A, White cleanroom (Art.jsx) and B, Navy statement (ArtB.jsx). The two columns are in the Plan
   (Directions, from Direction.jsx); the 3D stand switches between them.
   30 Sep (Bazil: "make a 4th variation as well", "make a 5th version as well, all red on the back wall"): five directions,
   A to E (components/booth/sets.js). Side by side stopped working, so the page has ONE chooser (in the head, mirrored in the
   sticky bar) that switches every piece, the 3D stand and the file list; ?dir=C lands on a direction; the reader's last
   choice is remembered in this browser. Compare in the Plan shows the five stands at one scale.
   ============================================================================ */

/* the seven parts, in the order the work is read: [id, name, icon, what it holds, its sub-sections] */
const VIEWS = [
  ['plan', 'Plan', 'calendar', 'What the stand has to do, the five design directions compared, what IAQ has confirmed, the dates, and the answers still needed.', [['brief', 'Brief and headline'], ['directions', 'Five directions'], ['timeline', 'Dates and owners'], ['questions', 'Open questions']]],
  ['stand', 'Stand', 'cube', 'IAQ’s corner in 3D, then each wall and the counter at its real size, in the direction chosen above, ready for berrylife.', [['corner3d', 'The corner in 3D'], ['walls', 'Walls and counter to scale']]],
  ['print', 'Print', 'file', 'The exhibition print: the A5 leaflet and the trifold in three designs each, in 3D and flat, then the leaflet and the roll-up in the chosen direction, and the rest of the take-away.', [['leaflet2', 'Leaflet, three designs'], ['trifold', 'Trifold, three designs'], ['leaflet', 'Leaflet in the direction'], ['takeaway', 'Take-away'], ['rollups', 'Roll-up']]],
  ['digital', 'Screen and digital', 'play', 'The booth screen running live, then the LinkedIn posts, the web ads and the email signature in the chosen direction.', [['screen', 'Booth screen'], ['posts', 'LinkedIn posts'], ['ads', 'Web ads'], ['sig', 'Email signature']]],
  ['website', 'Website', 'globe', 'The booth page that the code on every piece opens.', []],
  ['files', 'Files', 'folder', 'Every piece as PNG and print PDF, and what IAQ and berrylife sent.', []],
]
const ALIAS = { screen: 'digital' }
const DAY = 86400000
const daysTo = iso => Math.ceil((new Date(iso + 'T00:00:00') - new Date(new Date().toDateString())) / DAY)
const fmt = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const png = id => `/booth/png/${id}.png`
const pdf = id => `/booth/print/IAQ-SEMICON-2026-${id}.pdf`

export default function PortalBooth() {
  useBrandFonts()
  const { view } = useParams()
  const land = ALIAS[view] || view
  const [on, setOn] = useState(VIEWS.find(x => x[0] === land) ? land : 'plan')
  const [big, setBig] = useState(null)
  /* the one direction every piece on the page shows: ?dir= wins, then this browser's last choice, then A */
  const [dir, setDirState] = useState(() => {
    const q = typeof window !== 'undefined' && (window.location.search.match(/[?&]dir=([a-f][23]?)/i) || [])[1]
    if (q && DIRS.includes(q.toUpperCase())) return q.toUpperCase()
    /* 30 Sep: C is the preferred direction and opens the page; the key changed so earlier visits do not override it */
    try { const v = localStorage.getItem('iaq.booth.dir2'); if (DIRS.includes(v)) return v } catch (e) { /* storage off */ }
    return DEFAULT_DIR
  })
  const setDir = d => { setDirState(d); try { localStorage.setItem('iaq.booth.dir2', d) } catch (e) { /* storage off */ } }
  const tabs = useRef(null)
  useEffect(() => { document.title = 'IAQ Group · Portal · Booth' }, [])
  /* land on the section the address names, once the page has laid out */
  useEffect(() => {
    if (!land || !VIEWS.find(x => x[0] === land)) return
    /* 25 Sep (Bazil: "this should be in the same page", "make sure not laggy"): one landing after layout; go()'s own
       correction passes settle it as pictures load, and they stop the moment the reader scrolls (see go) */
    const t = setTimeout(() => go(land, 'auto'), 80)
    return () => clearTimeout(t)
  }, [land])
  /* the portal's own bar is sticky too: this bar sticks directly under it */
  useEffect(() => {
    /* the portal bar's own top is not predictable (the review bar pins it inline at its height, otherwise it
       follows --sticktop as the nav hides and shows), so read it live and sit directly under it */
    let raf = 0
    const set = () => {
      raf = 0
      const pb = document.querySelector('.pt-bar'), nav = document.querySelector('.nav')
      if (!pb || !tabs.current) return
      let top = (parseFloat(getComputedStyle(pb).top) || 0) + pb.offsetHeight
      /* the site nav slides back in over both on a scroll up: then sit under the nav */
      if (nav && !nav.classList.contains('nav-hide')) top = Math.max(top, (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight)
      tabs.current.style.top = top + 'px'
    }
    const soon = () => { if (!raf) raf = requestAnimationFrame(set) }
    set(); window.addEventListener('resize', soon); window.addEventListener('scroll', soon, { passive: true })
    const ts = [900, 2200].map(ms => setTimeout(set, ms))
    return () => { window.removeEventListener('resize', soon); window.removeEventListener('scroll', soon); ts.forEach(clearTimeout); cancelAnimationFrame(raf) }
  }, [])
  /* mark the section in view */
  useEffect(() => {
    const io = new IntersectionObserver(es => {
      const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) { setOn(vis[0].target.dataset.part); window.dispatchEvent(new CustomEvent('booth:part', { detail: vis[0].target.dataset.part })) }   /* the portal sidebar follows the scroll */
    }, { rootMargin: '-30% 0px -60% 0px' })
    document.querySelectorAll('.bt-part').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  const go = (id, behavior = 'smooth') => {
    const el = document.getElementById(id.startsWith('bt-') ? id : 'bt-' + id); if (!el) return
    /* where the stuck bars end, in the same units as the section's rect (the root zoom included) */
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1
    const under = () => tabs.current ? (parseFloat(getComputedStyle(tabs.current).top) + tabs.current.offsetHeight) * z + 8 : 0
    const top = el.getBoundingClientRect().top + window.scrollY - under()
    const L = window.__lenis
    if (L) L.scrollTo(top, { immediate: behavior === 'auto', force: true }); else window.scrollTo({ top, behavior })
    /* then measure against the bar itself and correct (the review bar may have hidden on the way down), which also
       lands the jump if the smooth loop cannot run */
    /* repeat until it settles: a correction upward brings the site nav back, which moves this bar down (0.4 s), so
       each pass waits for the bar and measures again */
    /* the reader's own scroll ends the correction passes, so the page never yanks under them */
    let touched = false
    const stop = () => { touched = true; window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', stop) }
    setTimeout(() => { window.addEventListener('wheel', stop, { passive: true }); window.addEventListener('touchstart', stop, { passive: true }); window.addEventListener('keydown', stop) }, behavior === 'auto' ? 0 : 900)
    const fix = n => setTimeout(() => {
      if (touched) return
      const d = el.getBoundingClientRect().top - (tabs.current ? tabs.current.getBoundingClientRect().bottom + 8 : 0)
      if (Math.abs(d) <= 4) return
      if (L) L.scrollTo(window.scrollY + d, { immediate: true, force: true }); else window.scrollTo(0, window.scrollY + d)
      if (n < 4) fix(n + 1)
    }, n ? 520 : (behavior === 'auto' ? 60 : 1700))
    fix(0)
    if (!id.startsWith('bt-s-')) setOn(id)
  }

  return (
    <div className="bt">
      <header className="bt-head">
        <div className="bt-head-in">
          <div>
            <span className="bt-k">SEMICON Europa 2026, the booth for IAQ approval</span>
            <h1>The stand in Munich, <em>designed.</em></h1>
            <p>Every piece for the show, finished and to scale, in five design directions for IAQ to choose between: the three walls and the counter, the stand in 3D, the leaflet and roll-up, the posts, ads and signature. The screen loop and the booth page run live.</p>
            <div className="bt-cta">
              <a className="bt-btn" href="#bt-digital" onClick={e => { e.preventDefault(); go('digital') }}><Icon name="play" />See the booth screen</a>
              <a className="bt-btn ghost" href="#bt-stand" onClick={e => { e.preventDefault(); go('stand') }}><Icon name="cube" />The stand in 3D</a>
            </div>
            <CodexDownload />
          </div>
          <DirChooser dir={dir} setDir={setDir} />
          <div className="bt-dls">
            {DEADLINES.map(d => {
              const n = daysTo(d.d)
              return <div key={d.k}><b>{n > 0 ? n : n === 0 ? 'Today' : 'Done'}<small>{n > 0 ? ' days' : ''}</small></b><span>{d.k}</span><em>{fmt(d.d)}</em></div>
            })}
          </div>
        </div>
      </header>

      <nav className="bt-tabs" aria-label="Booth" ref={tabs}>
        <div>{VIEWS.map(([id, l, ic]) => <a key={id} href={'#bt-' + id} className={id === on ? 'on' : undefined} onClick={e => { e.preventDefault(); go(id) }}><Icon name={ic} />{l}</a>)}</div>
      </nav>

      <div className="bt-body">
        {VIEWS.map(([id, name, , what, subs], k) => (
          <section className="bt-part" id={'bt-' + id} data-part={id} key={id}>
            <header className="bt-part-h">
              <span className="bt-part-n">{String(k + 1).padStart(2, '0')}</span>
              <div>
                <h2>{name}</h2>
                <p>{what}</p>
                <PartDownload />
              </div>
              {subs.length > 0 && <nav className="bt-part-toc" aria-label={name}>{subs.map(([sid, l]) => <a key={sid} href={'#bt-s-' + sid} onClick={e => { e.preventDefault(); go('bt-s-' + sid) }}>{l}<Icon name="arrow" /></a>)}</nav>}
            </header>
            {id === 'plan' && <Plan dir={dir} setDir={setDir} />}
            {id === 'stand' && <Stand dir={dir} setDir={setDir} setBig={setBig} />}
            {id === 'print' && <Print dir={dir} />}
            {id === 'digital' && <><Screen /><Digital dir={dir} /></>}
            {id === 'website' && <Website />}
            {id === 'files' && <Files dir={dir} setBig={setBig} />}
          </section>
        ))}
      </div>

      <DirMini dir={dir} setDir={setDir} />

      {big && (
        <div className="bt-lb" role="dialog" aria-label="Full size" onClick={() => setBig(null)}>
          <img src={big} alt="" />
          <button type="button" onClick={() => setBig(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

const Prop = () => <span className="bt-prop">For approval</span>
/* a sub-section of a part: its own heading (h3 under the part's h2) and an anchor for the part's links */
function Sec({ id, title, lede, children }) {
  return (
    <div className="bt-sec" id={id ? 'bt-s-' + id : undefined}>
      {title && <div className="bt-sec-h"><div><h3>{title}</h3>{lede && <p>{lede}</p>}</div></div>}
      {children}
    </div>
  )
}
/* 30 Sep: the one chooser. The live directions as tabs with their names, C tagged preferred; the rejected pair after them,
   smaller, still viewable. The head carries it large; a fixed pill mirrors it once the head has scrolled away */
function DirChooser({ dir, setDir }) {
  const tab = d => (
    <button type="button" key={d} className={(d === dir ? 'on' : '') + (statusOf(d) === 'rejected' ? ' rej' : '')} aria-pressed={d === dir} onClick={() => setDir(d)}>
      <i className={'bt-dsw bt-dsw-' + d.toLowerCase()} aria-hidden="true" /><b>Direction {d}</b><span>{DIRECTIONS[d].tab || DIRECTIONS[d].name}</span><DirStatus d={d} />
    </button>
  )
  return (
    <div className="bt-dirs" role="group" aria-label="Design direction for every piece on this page">
      <span className="bt-dirs-k">Show every piece in</span>
      <div className="bt-dirs-t">{LIVE.map(tab)}</div>
      <div className="bt-dirs-r"><span className="bt-dirs-k">Rejected</span><div>{REJECTED.map(tab)}</div></div>
    </div>
  )
}
/* the head's chooser mirrored small, fixed at the foot of the window once the head has scrolled away, so the direction can
   be switched from any piece (inside the portal the booth's own tab bar is hidden, so it cannot live there) */
function DirMini({ dir, setDir }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const check = () => { raf = 0; const el = document.querySelector('.bt-dirs'); setShow(!!el && el.getBoundingClientRect().bottom < 0) }
    const soon = () => { if (!raf) raf = requestAnimationFrame(check) }
    check(); window.addEventListener('scroll', soon, { passive: true }); window.addEventListener('resize', soon)
    const t = setTimeout(check, 1200)
    return () => { window.removeEventListener('scroll', soon); window.removeEventListener('resize', soon); cancelAnimationFrame(raf); clearTimeout(t) }
  }, [])
  return (
    <div className={'bt-dmini' + (show ? ' show' : '')} role="group" aria-label="Design direction" aria-hidden={!show}>
      <CodexMini tabIndex={show ? 0 : -1} />
      <small>Direction {dir}, {DIRECTIONS[dir].tab || DIRECTIONS[dir].name}</small>
      {DIRS.map(d => <button type="button" key={d} tabIndex={show ? 0 : -1} className={(d === dir ? 'on' : '') + (statusOf(d) === 'rejected' ? ' rej' : '')} aria-pressed={d === dir} title={`Direction ${d}, ${DIRECTIONS[d].name}${statusOf(d) === 'rejected' ? ', rejected' : ''}`} onClick={() => setDir(d)}>{d}</button>)}
    </div>
  )
}
/* the directions: the label over a piece or a row, "Direction A, White cleanroom", and its one line */
function DirTag({ d, line = true }) {
  const x = DIRECTIONS[d]
  return <div className={'bt-dir bt-dir-' + d.toLowerCase()}><b>Direction {d}, {x.name} <DirStatus d={d} /></b>{line && <span>{x.line}</span>}</div>
}
function Dl({ id, print }) {
  return (
    <span className="bt-dlk">
      <a href={png(id)} download><Icon name="file" />PNG</a>
      {print && <a href={pdf(id)} target="_blank" rel="noreferrer"><Icon name="file" />Print PDF, 1:1</a>}
    </span>
  )
}

/* ---------------------------------------------------------------- plan */
function Plan({ dir, setDir }) {
  return (
    <>
      <Sec id="brief" title={<>What the stand <em>has to do.</em></>} lede={`${EVENT.dates}, ${EVENT.where}, ${EVENT.stand}`}>
        <ul className="bt-brief">{BRIEF.map(b => <li key={b.k}><b>{b.k}</b><span>{b.t}</span></li>)}</ul>
        <h3 className="bt-sub">Confirmed by IAQ</h3>
        <ul className="bt-conf">{CONFIRMED.map(c => <li key={c.k}><Icon name="check" /><div><b>{c.k}</b><span>{c.t}</span><small>{c.who}</small></div></li>)}</ul>
        <div className="bt-msg">
          <div>
            <h3>The headline <Prop /></h3>
            <ol className="bt-opts">{MESSAGE.options.map((o, i) => <li key={o.h} className={i === 0 ? 'rec' : undefined}><b>{o.h}</b><span>{o.why}</span></li>)}</ol>
          </div>
          <div>
            <h3>What every surface can say</h3>
            <div className="bt-proof">{MESSAGE.proof.map(([n, l]) => <div key={n}><b>{n}</b><span>{l}</span></div>)}</div>
            <ul className="bt-units">{MESSAGE.units.map(u => <li key={u.k}><b>{u.k}</b><span>{u.t}</span></li>)}</ul>
            <p className="bt-note">Every figure is one the website already publishes.</p>
          </div>
        </div>
      </Sec>
      <Sec id="directions" title={<>Five live directions, <em>one choice.</em></>} lede="Every piece below is finished in each. C is our preferred one after the 30 Sep review; B and D were rejected and stay viewable. Compare them here at one scale; the chooser at the top switches every piece on the page. Every backdrop leads with the cleanroom, and the screen hangs at 1900 mm in all of them.">
        <Directions d={dir} setD={setDir} />
      </Sec>
      <Sec id="timeline" title={<>Eight weeks, <em>three fixed dates.</em></>} lede="The fixed dates come from IAQ. The steps between them are our proposal, with one review round for each piece.">
        <Timeline />
        <h3 className="bt-sub">Who does what</h3>
        <table className="bt-tbl bt-owners"><tbody>{OWNERS.map(([k, val]) => <tr key={k}><th>{k}</th><td>{val}</td></tr>)}</tbody></table>
      </Sec>
      <Sec id="questions" title={<>Eleven answers <em>we need from IAQ.</em></>} lede="Each one says what we did in the meantime, so nothing waits on the answer.">
        <ol className="bt-qs">{OPEN.map((q, i) => <li key={q.q}><i>{i + 1}</i><div><b>{q.q}</b><span>{q.did}</span></div><small>{q.who}</small></li>)}</ol>
      </Sec>
    </>
  )
}
function Timeline() {
  const today = new Date(new Date().toDateString()).getTime()
  let placed = false
  return (
    <ol className="bt-tl">
      {TIMELINE.map(r => {
        const d = new Date(r.d + 'T00:00:00').getTime(), mark = !placed && d > today
        if (mark) placed = true
        return (
          <React.Fragment key={r.d + r.t}>
            {mark && <li className="bt-tl-now"><span>Today, {fmt(new Date(today).toISOString().slice(0, 10))}</span></li>}
            <li className={(r.fixed ? 'fixed' : '') + (r.done ? ' done' : '') + (d < today && !r.done ? ' past' : '')}>
              <time>{fmt(r.d)}</time><div><b>{r.t}</b><span>{r.who}</span></div>
              {r.fixed && <span className="bt-chip red">Fixed</span>}{r.done && <span className="bt-chip">Done</span>}
            </li>
          </React.Fragment>
        )
      })}
    </ol>
  )
}

/* ---------------------------------------------------------------- stand */
/* the 3D stand in each direction (BoothModel option) */
function Stand({ dir, setDir, setBig }) {
  const [zones, setZones] = useState(false)
  const [bleed, setBleed] = useState(false)
  const set = SETS[dir]
  return (
    <>
      <Sec id="corner3d" title={<>The IAQ corner, <em>in 3D.</em></>} lede="Built to berrylife’s measurements, with the print artwork of the chosen direction on the walls and the screen raised to 1900 mm. The screen cycles the loop’s six chapters.">
        <div className="bt-3d">
          <Suspense fallback={<div className="bm3 bm3-load" />}><BoothModel option={OPT[dir]} /></Suspense>
          <div className="bt-3d-side">
            <h3>On the walls</h3>
            <div className="bt-seg">
              {DIRS.map(d => <button type="button" key={d} className={(dir === d ? 'on' : '') + (statusOf(d) === 'rejected' ? ' rej' : '')} aria-pressed={dir === d} onClick={() => setDir(d)}><b>Direction {d}, {DIRECTIONS[d].name} <DirStatus d={d} /></b><span>{DIRECTIONS[d].line}</span></button>)}
            </div>
            <p className="bt-note">IAQ’s part is this corner only, and the outside and back of the walls are not printed (both confirmed by Nabilah, 22 Sep). Green Excel’s side is left plain: it is theirs to design.</p>
          </div>
        </div>
        <div className="bt-renders">
          {Array.from({ length: 6 }, (_, i) => (
            <button type="button" key={i} onClick={() => setBig(`/booth/render-${i + 1}.webp`)}><img src={`/booth/render-${i + 1}.webp`} alt={`berrylife render ${i + 1}`} loading="lazy" /></button>
          ))}
        </div>
        <p className="bt-note">berrylife’s renders of the stand as it stands today, for comparison.</p>
      </Sec>
      <Sec id="walls" title={<>The walls and the counter, <em>to scale.</em></>} lede="Each drawing is its real size in millimetres, all vector, so it prints at 1:1. Due to berrylife on 10 October, in the direction IAQ chooses.">
        <div className="bt-tools">
          <DirTag d={dir} />
          <label><input type="checkbox" checked={zones} onChange={e => setZones(e.target.checked)} /> Show the height zones</label>
          <label><input type="checkbox" checked={bleed} onChange={e => setBleed(e.target.checked)} /> Show 10 mm bleed</label>
        </div>
        <Lineup dir={dir} zones={zones} bleed={bleed} />
        <div className="bt-rows">{SURFACES.map(s => {
          const sf = set.surf[s.id], A = set.walls[s.id]
          return (
            <article className={'bt-row bt-row1 bt-row-' + s.id} key={s.id}>
              <div className="bt-row-copy">
                <h3>{s.k.split(' · ')[0]}</h3>
                <p>{s.where}</p>
                <dl>
                  <div><dt>Size</dt><dd>{s.w} × {s.h} mm{s.visible ? `, ${s.visible} mm visible` : ''}</dd></div>
                  <div><dt>Print</dt><dd>Vector PDF at 1:1 with 10 mm bleed. A photograph on a wall needs {s.pxW.toLocaleString()} × {s.pxH.toLocaleString()} px at {s.ppi} ppi for the full surface: the camera original, never the web copy.</dd></div>
                </dl>
              </div>
              <figure className="bt-ab-fig">
                <div className="bt-ab-art"><A zones={zones ? sf.zones : null} bleed={bleed} /></div>
                <figcaption>
                  <b>Direction {dir}, {DIRECTIONS[dir].name} <DirStatus d={dir} /></b>
                  <span>{sf.content}</span>
                  <Dl id={sf.id} print />
                </figcaption>
              </figure>
            </article>
          )
        })}</div>
        <div className="bt-spec">
          <h3>Print specification</h3>
          <table className="bt-tbl"><tbody>{PRINT_SPEC.map(([k, val]) => <tr key={k}><th>{k}</th><td>{val}</td></tr>)}</tbody></table>
        </div>
      </Sec>
    </>
  )
}
function Lineup({ dir, zones, bleed }) {
  const s = 0.1, set = SETS[dir]
  return (
    <div className="bt-lineup">
      {SURFACES.map(x => {
        const A = set.walls[x.id]
        return (
          <figure key={x.id} style={{ '--w': x.w * s, '--h': x.h * s }}>
            <div className="bt-lu-box"><A zones={zones ? set.surf[x.id].zones : null} bleed={bleed} /></div>
            <figcaption>{x.k.split(' · ')[0]}<small>{x.w} × {x.h}</small></figcaption>
          </figure>
        )
      })}
      <figure className="bt-lu-man" style={{ '--h': 1750 * s }}>
        <div className="bt-lu-box"><svg viewBox="0 0 60 175" aria-hidden="true"><circle cx="30" cy="12" r="10" fill="#C4CBD8" /><path d="M14 30h32l6 70h-10l-3 75H21l-3-75H8z" fill="#C4CBD8" /></svg></div>
        <figcaption>1.75 m</figcaption>
      </figure>
    </div>
  )
}

/* ---------------------------------------------------------------- print */
/* 30 Sep (Bazil: "2 design A5 variant", "and 2 more trifold variant", "for the exhibition print"): the take-away in two
   designs each, flat and straight, both sides, independent of the chooser (components/booth/Print.jsx) */
/* mounts its children only once the reader comes within a screen of it, so three.js loads only for the Print part */
function Near({ children }) {
  const ref = useRef(null), [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el || on) return
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setOn(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(el); return () => io.disconnect()
  }, [on])
  return <div ref={ref}>{on ? children : <div className="pv pv-load" />}</div>
}
function PrintDesigns({ k }) {
  return (
    <div className={'bt-pd bt-pd-' + k.toLowerCase()}>
      {PRINT_SETS.filter(p => p.k === k).map(p => (
        <div className="bt-pd-row" key={p.n}>
          <div className="bt-pd-h"><b>Design {p.n}</b><span>{p.t}</span></div>
          <figure><p.F /><figcaption>{k === 'Trifold' ? 'Outside, flat: inside flap, back, front cover' : 'Front'} <Dl id={p.ids[0]} print /></figcaption></figure>
          <figure><p.B /><figcaption>{k === 'Trifold' ? 'Inside, flat: left, centre, right' : 'Back'} <Dl id={p.ids[1]} print /></figcaption></figure>
        </div>
      ))}
    </div>
  )
}
function Print({ dir }) {
  const set = SETS[dir], f = set.flyer, R = set.roll.C
  return (
    <>
      <Sec id="leaflet2" title={<>The leaflet, <em>three designs.</em></>} lede="A5, 148 × 210 mm, both sides, 3 mm bleed, 250 gsm uncoated suggested. Cleanroom construction first, the three units, the six services as a loop, the figures, the booth, the contacts and the code. Personal contact details follow from IAQ.">
        <Near><Suspense fallback={<div className="pv pv-load" />}><PrintViewer kind="leaflet" /></Suspense></Near>
        <PrintDesigns k="Leaflet" />
      </Sec>
      <Sec id="trifold" title={<>The trifold, <em>three designs.</em></>} lede="A4 roll fold, 297 × 210 mm flat, folded to 100 × 210: outside the inside flap (97), the back and the front cover; inside the three units, the cleanroom layer by layer and the six services as a loop. The folds are marked only in the print file’s zones, never on the art.">
        <Near><Suspense fallback={<div className="pv pv-load" />}><PrintViewer kind="trifold" /></Suspense></Near>
        <PrintDesigns k="Trifold" />
      </Sec>
      <Sec id="leaflet" title={<>The leaflet, <em>in the chosen direction.</em></>} lede="Each direction’s own A5 leaflet: 148 × 210 mm, 3 mm bleed. The code on both opens the booth page.">
        <div className="bt-set">
          <div className="bt-set-h">
            <DirTag d={dir} />
            <b>{f.h}</b>
            <p>{f.t}</p>
          </div>
          <figure><f.F /><figcaption>Front <Dl id={f.ids[0]} print /></figcaption></figure>
          <figure><f.B /><figcaption>Back <Dl id={f.ids[1]} print /></figcaption></figure>
        </div>
      </Sec>
      <Sec id="takeaway" title="The rest of the take-away">
        <div className="bt-coll">{COLLATERAL.filter(c => !['flyer', 'rollup'].includes(c.id)).map(c => <div key={c.id} className="bt-ci"><div className="bt-ci-h"><b>{c.k}</b><span className="bt-chip">{c.status}</span></div><small>{c.size}</small><p>{c.use}</p><span className="bt-ci-q">{c.qty}</span></div>)}</div>
      </Sec>
      <Sec id="rollups" title={<>The roll-up, <em>for after Munich.</em></>} lede="Not needed on this stand: IAQ’s corner has its walls. For the office, site entrances and every smaller show after Munich, 850 × 2000 mm.">
        <div className="bt-print2 tall bt-print1">
          <figure><R /><figcaption><DirTag d={dir} line={false} /><span className="bt-cap">{set.roll.cap}</span><Dl id={set.roll.id} print /></figcaption></figure>
        </div>
      </Sec>
    </>
  )
}

/* ---------------------------------------------------------------- digital */
function Digital({ dir }) {
  const set = SETS[dir], Ad = set.Ad, Sig = set.Sig
  return (
    <>
      <Sec id="posts" title={<>Four LinkedIn posts, <em>one campaign.</em></>} lede="1080 × 1350, the portrait size LinkedIn shows largest in the feed. Posts 3 and 4 carry a picture of the stand: the 3D view, in the same direction, until the real photographs exist.">
        <div className="bt-dirrow">
          <DirTag d={dir} />
          <div className="bt-posts">
            {POSTS.map(p => {
              const P = set.posts[p.id]
              return (
                <figure key={p.id}>
                  <P />
                  <figcaption><b>{p.when}</b><span>{p.caption}</span><Dl id={pieceId(dir, p.id)} /></figcaption>
                </figure>
              )
            })}
          </div>
          <p className="bt-note">The captions to post are the same in every direction.</p>
        </div>
      </Sec>
      <Sec id="ads" title={<>Web ads, <em>in four standard sizes.</em></>} lede="One message and one red call to action, for the organiser’s ad system or any magazine site.">
        <div className="bt-dirrow">
          <DirTag d={dir} />
          <div className="bt-ads">
            {ADS.map(s => <figure key={s.join('x')} style={{ '--w': s[0], '--h': s[1] }}><Ad size={s} /><figcaption>{s[0]} × {s[1]} <Dl id={pieceId(dir, 'ad' + s.join('x'))} /></figcaption></figure>)}
          </div>
        </div>
      </Sec>
      <Sec id="sig" title={<>The email signature, <em>600 × 150.</em></>} lede="On every IAQ email from 26 October to 13 November.">
        <div className="bt-sigs bt-sigs1">
          <figure className="bt-sig"><Sig /><figcaption><DirTag d={dir} line={false} /><Dl id={pieceId(dir, 'sig')} /></figcaption></figure>
        </div>
      </Sec>
    </>
  )
}

/* ---------------------------------------------------------------- screen */
function Screen() {
  return (
    <Sec id="screen" title={<>The booth screen, <em>a live website.</em></>} lede={`${SCREEN.size}. One browser tab, open full screen on the stand machine: it loops for the aisle, and a touch hands it to the visitor. This is it, running: touch it, drag the fab, open a unit, book a meeting.`}>
      <div className="bt-live">
        <iframe src="/booth/screen" title="The booth screen, live and interactive" loading="lazy" allow="fullscreen" />
      </div>
      <p className="bt-live-cap">On the stand machine: <b>iaqtechnology.com.my/booth/screen</b>, then F for full screen. No sign-in. Sixty seconds untouched and it loops again.</p>
      <div className="bt-scr">
        <div>
          <h3>The sections, in loop order</h3>
          <ol className="bt-chs">{SCREEN.chapters.map((c, i) => <li key={c.id}><i>{i + 1}</i><div><b>{c.k}</b><span>{c.t}</span></div><small>{c.s} s</small></li>)}</ol>
        </div>
        <div>
          <h3>Two modes</h3><ul className="bt-list">{SCREEN.modes.map(([k, val]) => <li key={k}><b>{k}.</b> {val}</li>)}</ul>
          <h3 className="bt-h3-gap">How it reads</h3><ul className="bt-list">{SCREEN.rules.map(r => <li key={r}>{r}</li>)}</ul>
          <h3 className="bt-h3-gap">What is delivered</h3><ul className="bt-list">{SCREEN.delivery.map(([k, val]) => <li key={k}><b>{k}.</b> {val}</li>)}</ul>
        </div>
      </div>
    </Sec>
  )
}

/* ---------------------------------------------------------------- website */
function Website() {
  return (
    <Sec title={<>The booth page, <em>where the code leads.</em></>} lede="iaqtechnology.com.my/semicon (proposed). The counter, the flyer, the screen and every post point here: the 3D story, the services, Dresden, and one way to book a meeting.">
      <div className="bt-web">
        <div className="bt-web-frame"><iframe src="/semicon" title="The booth page" loading="lazy" /></div>
        <div>
          <h3>On the page</h3>
          <ul className="bt-list">
            <li><b>The date, the hall and the stand</b>, and a button to book a meeting that opens the contact form with the reason already set.</li>
            <li><b>A fab, built layer by layer</b>: IAQ’s own Revit model, the same one on the screen, which the visitor can play or scrub.</li>
            <li><b>The three units and the six services</b>, one line each.</li>
            <li><b>In Europe</b>: IAQ Engineering (DE) GmbH, Dresden, with its address and phone.</li>
          </ul>
        </div>
      </div>
    </Sec>
  )
}

/* ---------------------------------------------------------------- files */
function Files({ dir, setBig }) {
  const made = Object.entries(SETS[dir].pieces).map(([id, p]) => ({ id, ...p }))
  return (
    <>
      <Sec title={<>Every piece, <em>ready to send.</em></>} lede={`Direction ${dir}, ${DIRECTIONS[dir].name}: the chooser at the top switches this list. PNG for screens and review. Print PDFs are vector at 1:1 with bleed, in RGB: the CMYK FOGRA39 conversion is the last step, after IAQ signs off.`}>
        <table className="bt-tbl bt-files-t">
          <thead><tr><th>Piece</th><th>Size</th><th>Files</th></tr></thead>
          <tbody>{made.map(p => <tr key={p.id}><th>{p.k}</th><td>{p.w} × {p.h} {p.unit}</td><td><Dl id={p.id} print={p.print} /></td></tr>)}</tbody>
        </table>
      </Sec>
      <Sec title={<>The exhibition print, <em>three designs each.</em></>} lede="The leaflet and the trifold, whichever direction is chosen above.">
        <table className="bt-tbl bt-files-t">
          <thead><tr><th>Piece</th><th>Size</th><th>Files</th></tr></thead>
          <tbody>{Object.entries(PIECES_PRINT).map(([id, p]) => <tr key={id}><th>{p.k}</th><td>{p.w} × {p.h} {p.unit}</td><td><Dl id={id} print /></td></tr>)}</tbody>
        </table>
      </Sec>
      <Sec title="What IAQ and berrylife sent" lede="As received on 22 September.">
        <div className="bt-files">
          {FILES.flatMap(f => (f.n ? Array.from({ length: f.n }, (_, i) => ({ ...f, k: `${f.k}, sheet ${i + 1}`, href: f.f(i + 1) })) : [{ ...f, href: f.f() }])).map(f => (
            f.pdf
              ? <a key={f.k} className="bt-file pdf" href={f.href} target="_blank" rel="noreferrer"><Icon name="file" /><b>{f.k}</b><small>{f.src}</small></a>
              : <button key={f.k} type="button" className="bt-file" onClick={() => setBig(f.href)}><img src={f.href} alt="" loading="lazy" /><b>{f.k}</b><small>{f.src}</small></button>
          ))}
        </div>
      </Sec>
    </>
  )
}
