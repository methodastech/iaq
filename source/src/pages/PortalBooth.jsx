import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/FlowIcon.jsx'
import { EVENT, DEADLINES, BRIEF, CONFIRMED, MESSAGE, SURFACES, PRINT_SPEC, SCREEN, COLLATERAL, TIMELINE, OWNERS, OPEN, FILES, POSTS } from '../data/booth.js'
import { ART, PIECES, FlyerFront, FlyerBack, FlyerFrontB, FlyerBackB, RollUp, RollUpB, Post1, Post2, Post3, Post4, Ad, ADS, Signature } from '../components/booth/Art.jsx'
import Direction from '../components/booth/Direction.jsx'
import { useBrandFonts } from '../lib/brandFonts.js'
import '../styles/booth.css'

const BoothModel = lazy(() => import('../components/booth/BoothModel.jsx'))

/* ============================================================================
   Portal · Booth (22 Sep 2026). SEMICON Europa 2026, designed: the plan, the design direction, the
   stand in 3D with each wall to scale, the print pieces, the booth screen and the digital pieces, the booth
   page on the website, and every file. One page (Bazil: "i need to see everything on the web, not touch and
   open another screen"): the bar jumps to a section and marks the one in view; /portal/booth/:view lands on it.
   The booth screen and the booth page run live inside it.
   Content: data/booth.js. Artwork: components/booth/Art.jsx (mm-true vector). 3D: BoothModel.jsx.
   Downloads: public/booth/png (tools/render-booth-art-0922.mjs) and public/booth/print
   (tools/export-booth-print-0922.mjs).
   ============================================================================ */

/* the seven parts, in the order the work is read: [id, name, icon, what it holds, its sub-sections] */
const VIEWS = [
  ['plan', 'Plan', 'calendar', 'What the stand has to do, what IAQ has confirmed, the dates, and the answers still needed.', [['brief', 'Brief and headline'], ['timeline', 'Dates and owners'], ['questions', 'Open questions']]],
  ['stand', 'Stand', 'cube', 'IAQ’s corner in 3D, then each wall and the counter at its real size, ready for berrylife.', [['corner3d', 'The corner in 3D'], ['walls', 'Walls and counter to scale']]],
  ['print', 'Print', 'file', 'The A5 leaflet in two design sets, the rest of the take-away, and the roll-ups for after Munich.', [['leaflet', 'Leaflet, two sets'], ['takeaway', 'Take-away'], ['rollups', 'Roll-ups']]],
  ['digital', 'Screen and digital', 'play', 'The booth screen running live, then the LinkedIn posts, the web ads and the email signature.', [['screen', 'Booth screen'], ['posts', 'LinkedIn posts'], ['ads', 'Web ads'], ['sig', 'Email signature']]],
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
            <span className="bt-k">SEMICON Europa 2026 · booth, for IAQ approval</span>
            <h1>The stand in Munich, <em>designed.</em></h1>
            <p>Every piece for the show, finished and to scale: the three walls and the counter, the stand in 3D, the flyer and roll-ups, the posts, ads and signature, the screen loop and the booth page. The design direction says why each looks the way it does.</p>
            <div className="bt-cta">
              <a className="bt-btn" href="#bt-digital" onClick={e => { e.preventDefault(); go('digital') }}><Icon name="play" />See the booth screen</a>
              <a className="bt-btn ghost" href="#bt-stand" onClick={e => { e.preventDefault(); go('stand') }}><Icon name="cube" />The stand in 3D</a>
            </div>
          </div>
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
              </div>
              {subs.length > 0 && <nav className="bt-part-toc" aria-label={name}>{subs.map(([sid, l]) => <a key={sid} href={'#bt-s-' + sid} onClick={e => { e.preventDefault(); go('bt-s-' + sid) }}>{l}<Icon name="arrow" /></a>)}</nav>}
            </header>
            {id === 'plan' && <Plan />}
            {id === 'stand' && <Stand setBig={setBig} />}
            {id === 'print' && <Print />}
            {id === 'digital' && <><Screen /><Digital /></>}
            {id === 'website' && <Website />}
            {id === 'files' && <Files setBig={setBig} />}
          </section>
        ))}
      </div>

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
function Dl({ id, print }) {
  return (
    <span className="bt-dlk">
      <a href={png(id)} download><Icon name="file" />PNG</a>
      {print && <a href={pdf(id)} target="_blank" rel="noreferrer"><Icon name="file" />Print PDF, 1:1</a>}
    </span>
  )
}

/* ---------------------------------------------------------------- plan */
function Plan() {
  return (
    <>
      <Sec id="brief" title={<>What the stand <em>has to do.</em></>} lede={`${EVENT.dates} · ${EVENT.where} · ${EVENT.stand}`}>
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
      <Sec id="timeline" title={<>Eight weeks, <em>three fixed dates.</em></>} lede="The fixed dates come from IAQ. The steps between them are our proposal, with one review round for each piece.">
        <Timeline />
        <h3 className="bt-sub">Who does what</h3>
        <table className="bt-tbl bt-owners"><tbody>{OWNERS.map(([k, val]) => <tr key={k}><th>{k}</th><td>{val}</td></tr>)}</tbody></table>
      </Sec>
      <Sec id="questions" title={<>Ten answers <em>we need from IAQ.</em></>} lede="Each one says what we did in the meantime, so nothing waits on the answer.">
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
function Stand({ setBig }) {
  const [opt, setOpt] = useState('w2')
  const [zones, setZones] = useState(false)
  const [bleed, setBleed] = useState(false)
  const list = SURFACES.flatMap(s => s.id === 'w2' ? [s, { ...s, id: 'w2b', k: 'Side wall · option B, every layer', content: 'The headline, IAQ’s exploded fab with its four layers named, and the plinth. For a stand that leads with how IAQ builds rather than where it is.' }] : [s])
  return (
    <>
      <Sec id="corner3d" title={<>The IAQ corner, <em>in 3D.</em></>} lede="Built to berrylife’s measurements, with the print artwork on the walls. The screen cycles the loop’s six chapters.">
        <div className="bt-3d">
          <Suspense fallback={<div className="bm3 bm3-load" />}><BoothModel option={opt} /></Suspense>
          <div className="bt-3d-side">
            <h3>The side wall</h3>
            <div className="bt-seg">
              <button type="button" className={opt === 'w2' ? 'on' : undefined} onClick={() => setOpt('w2')}><b>A · Global presence</b><span>As in berrylife’s concept: the map, Dresden in red, the four proof numbers.</span></button>
              <button type="button" className={opt === 'w2b' ? 'on' : undefined} onClick={() => setOpt('w2b')}><b>B · Every layer</b><span>IAQ’s exploded fab, its four layers named.</span></button>
            </div>
            <p className="bt-note">The back wall, the aisle column and the counter are one design each. IAQ’s part is this corner only, and the outside and back of the walls are not printed (both confirmed by Nabilah, 22 Sep). Green Excel’s side is left plain: it is theirs to design.</p>
          </div>
        </div>
        <div className="bt-renders">
          {Array.from({ length: 6 }, (_, i) => (
            <button type="button" key={i} onClick={() => setBig(`/booth/render-${i + 1}.webp`)}><img src={`/booth/render-${i + 1}.webp`} alt={`berrylife render ${i + 1}`} loading="lazy" /></button>
          ))}
        </div>
        <p className="bt-note">berrylife’s renders of the stand as it stands today, for comparison.</p>
      </Sec>
      <Sec id="walls" title={<>The walls and the counter, <em>to scale.</em></>} lede="Each drawing is its real size in millimetres, all vector, so it prints at 1:1. Due to berrylife on 10 October.">
        <div className="bt-tools">
          <label><input type="checkbox" checked={zones} onChange={e => setZones(e.target.checked)} /> Show the height zones</label>
          <label><input type="checkbox" checked={bleed} onChange={e => setBleed(e.target.checked)} /> Show 10 mm bleed</label>
        </div>
        <Lineup zones={zones} bleed={bleed} />
        <div className="bt-srfs">{list.map(s => {
          const A = ART[s.id]
          return (
            <article className={'bt-srf bt-srf-' + s.id} key={s.id}>
              <div className="bt-srf-art"><A zones={zones ? s.zones : null} bleed={bleed} /></div>
              <div className="bt-srf-copy">
                <h3>{s.k}</h3>
                <p>{s.where}</p>
                <dl>
                  <div><dt>Size</dt><dd>{s.w} × {s.h} mm{s.visible ? `, ${s.visible} mm visible` : ''}</dd></div>
                  <div><dt>On it</dt><dd>{s.content}</dd></div>
                  <div><dt>Print</dt><dd>Vector PDF at 1:1 with 10 mm bleed. Any photograph would need {s.pxW.toLocaleString()} × {s.pxH.toLocaleString()} px at {s.ppi} ppi: none is used.</dd></div>
                </dl>
                <Dl id={s.id} print />
              </div>
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
function Lineup({ zones, bleed }) {
  const s = 0.1
  return (
    <div className="bt-lineup">
      {SURFACES.map(x => {
        const A = ART[x.id]
        return (
          <figure key={x.id} style={{ '--w': x.w * s, '--h': x.h * s }}>
            <div className="bt-lu-box"><A zones={zones ? x.zones : null} bleed={bleed} /></div>
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
const SETS = [
  { k: 'Set A', h: 'Controlled environments, built to class.', t: 'The recommended headline. Front: what IAQ does, the three units, the exploded fab, the show in the navy crown. Back: the six services, the record, Dresden and headquarters, the code.', F: FlyerFront, B: FlyerBack, ids: ['flyer1', 'flyer2'] },
  { k: 'Set B', h: 'The cleanroom, and the whole fab around it.', t: 'Sits beside Green Excel’s cleanroom products and says what IAQ adds. Front: the fab’s four layers named, the show and the code in the navy foot. Back: the three units, the record, Dresden and headquarters, the code to book a meeting.', F: FlyerFrontB, B: FlyerBackB, ids: ['flyerB1', 'flyerB2'] },
]
function Print() {
  return (
    <>
      <Sec id="leaflet" title={<>The leaflet, <em>A5, two design sets.</em></>} lede="Handed out at the counter: 148 × 210 mm, front and back, 3 mm bleed, 350 gsm silk suggested. IAQ picks one set; the code on both opens the booth page.">
        {SETS.map(set => (
          <div className="bt-set" key={set.k}>
            <div className="bt-set-h">
              <span className="bt-chip">{set.k}</span>
              <b>{set.h}</b>
              <p>{set.t}</p>
            </div>
            <figure><set.F /><figcaption>Front <Dl id={set.ids[0]} print /></figcaption></figure>
            <figure><set.B /><figcaption>Back <Dl id={set.ids[1]} print /></figcaption></figure>
          </div>
        ))}
      </Sec>
      <Sec id="takeaway" title="The rest of the take-away">
        <div className="bt-coll">{COLLATERAL.filter(c => !['flyer', 'rollup'].includes(c.id)).map(c => <div key={c.id} className="bt-ci"><div className="bt-ci-h"><b>{c.k}</b><span className="bt-chip">{c.status}</span></div><small>{c.size}</small><p>{c.use}</p><span className="bt-ci-q">{c.qty}</span></div>)}</div>
      </Sec>
      <Sec id="rollups" title={<>Two roll-ups, <em>for after Munich.</em></>} lede="Not needed on this stand: IAQ’s corner has its walls. For the office, site entrances and every smaller show after Munich. Both follow the brand book’s roll-up designs, 850 × 2000 mm.">
        <div className="bt-print2 tall">
          <figure><RollUp /><figcaption>A · Navy crown, white field, red foot (Brand OS design 1) <Dl id="rollA" print /></figcaption></figure>
          <figure><RollUpB /><figcaption>B · Full navy, one statement (Brand OS design 2) <Dl id="rollB" print /></figcaption></figure>
        </div>
      </Sec>
    </>
  )
}

/* ---------------------------------------------------------------- digital */
function Digital() {
  const P = { post1: Post1, post2: Post2, post3: Post3, post4: Post4 }
  return (
    <>
      <Sec id="posts" title={<>Four LinkedIn posts, <em>one campaign.</em></>} lede="1080 × 1350, the portrait size LinkedIn shows largest in the feed. Posts 3 and 4 carry a picture of the stand: the 3D view until the real photographs exist.">
        <div className="bt-posts">
          {POSTS.map(p => {
            const A = P[p.id]
            return (
              <figure key={p.id}>
                <A />
                <figcaption><b>{p.when}</b><span>{p.caption}</span><Dl id={p.id} /></figcaption>
              </figure>
            )
          })}
        </div>
      </Sec>
      <Sec id="ads" title={<>Web ads, <em>in four standard sizes.</em></>} lede="The brand book’s banner grammar: navy band, white field, one message, one red call to action. For the organiser’s ad system or any magazine site.">
        <div className="bt-ads">
          {ADS.map(s => <figure key={s.join('x')} style={{ '--w': s[0], '--h': s[1] }}><Ad size={s} /><figcaption>{s[0]} × {s[1]} <Dl id={'ad' + s.join('x')} /></figcaption></figure>)}
        </div>
      </Sec>
      <Sec id="sig" title={<>The email signature, <em>600 × 150.</em></>} lede="On every IAQ email from 26 October to 13 November.">
        <figure className="bt-sig"><Signature /><figcaption><Dl id="sig" /></figcaption></figure>
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
function Files({ setBig }) {
  const made = Object.entries(PIECES).map(([id, p]) => ({ id, ...p }))
  return (
    <>
      <Sec title={<>Every piece, <em>ready to send.</em></>} lede="PNG for screens and review. Print PDFs are vector at 1:1 with bleed, in RGB: the CMYK FOGRA39 conversion is the last step, after IAQ signs off.">
        <table className="bt-tbl bt-files-t">
          <thead><tr><th>Piece</th><th>Size</th><th>Files</th></tr></thead>
          <tbody>{made.map(p => <tr key={p.id}><th>{p.k}</th><td>{p.w} × {p.h} {p.unit}</td><td><Dl id={p.id} print={p.print} /></td></tr>)}</tbody>
        </table>
      </Sec>
      <Sec title="What IAQ and berrylife sent" lede="As received on 22 September.">
        <div className="bt-files">
          {FILES.flatMap(f => (f.n ? Array.from({ length: f.n }, (_, i) => ({ ...f, k: `${f.k} · ${i + 1}`, href: f.f(i + 1) })) : [{ ...f, href: f.f() }])).map(f => (
            f.pdf
              ? <a key={f.k} className="bt-file pdf" href={f.href} target="_blank" rel="noreferrer"><Icon name="file" /><b>{f.k}</b><small>{f.src}</small></a>
              : <button key={f.k} type="button" className="bt-file" onClick={() => setBig(f.href)}><img src={f.href} alt="" loading="lazy" /><b>{f.k}</b><small>{f.src}</small></button>
          ))}
        </div>
      </Sec>
    </>
  )
}
