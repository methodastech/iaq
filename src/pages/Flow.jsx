import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GROUPS, PAGES, ROUTES_BY_AUDIENCE, byId, pagesInGroup, linksInto, orphans } from '../data/sitemap.js'
import Icon from '../components/FlowIcon.jsx'
import '../styles/flow.css'

/* The site framework, drawn as a tree: the homepage at the top, the six groups beneath it,
   every page hanging off its group, and the cross-links between them drawn on selection.
   Generated from src/data/sitemap.js, so it can never fall out of step with the site. */

export default function Flow() {
  const [sel, setSel] = useState('home')
  const [audience, setAudience] = useState(null)
  const treeRef = useRef(null)
  const homeRef = useRef(null)
  const groupRefs = useRef({})
  const cardRefs = useRef({})
  const [wires, setWires] = useState([])

  useEffect(() => { document.title = 'IAQ Group · Website Framework · Brand Method' }, [])

  const page = byId(sel)
  const inbound = useMemo(() => linksInto(sel), [sel])
  const orphanList = useMemo(() => orphans(), [])
  const route = audience ? ROUTES_BY_AUDIENCE.find(r => r.id === audience) : null
  const onRoute = id => (route ? route.path.includes(id) : false)

  const counts = useMemo(() => ({
    total: PAGES.length,
    live: PAGES.filter(p => p.status === 'live').length,
    added: PAGES.filter(p => p.status === 'new').length,
    gated: PAGES.filter(p => p.status === 'gated').length,
  }), [])

  /* ---- draw the branches: measure the laid-out DOM, emit SVG paths ---- */
  const draw = () => {
    const host = treeRef.current
    if (!host) return
    const O = host.getBoundingClientRect()
    const rel = el => { const r = el.getBoundingClientRect()
      return { l: r.left - O.left, r: r.right - O.left, t: r.top - O.top, b: r.bottom - O.top, cx: r.left + r.width / 2 - O.left, cy: r.top + r.height / 2 - O.top } }
    const out = []

    /* trunk: home down to each group node */
    const hs = homeRef.current && rel(homeRef.current)
    if (hs) {
      GROUPS.forEach(g => {
        const el = groupRefs.current[g.id]; if (!el) return
        const t = rel(el)
        const midY = hs.b + (t.t - hs.b) * 0.55
        out.push({ kind: 'trunk', d: `M ${hs.cx} ${hs.b} C ${hs.cx} ${midY}, ${t.cx} ${hs.b + (t.t - hs.b) * 0.35}, ${t.cx} ${t.t}` })
      })
    }
    /* branches: each group node down its own spine, then a stub out to every page card */
    GROUPS.forEach(g => {
      const gel = groupRefs.current[g.id]; if (!gel) return
      const gr = rel(gel)
      const kids = pagesInGroup(g.id).filter(p => p.id !== 'home')
      if (!kids.length) return
      const spineX = gr.l + 16
      const last = cardRefs.current[kids[kids.length - 1].id]
      if (last) out.push({ kind: 'spine', d: `M ${gr.cx} ${gr.b} L ${gr.cx} ${gr.b + 10} L ${spineX} ${gr.b + 20} L ${spineX} ${rel(last).cy}` })
      kids.forEach(k => {
        const el = cardRefs.current[k.id]; if (!el) return
        const c = rel(el)
        out.push({ kind: 'twig', d: `M ${spineX} ${c.cy} L ${c.l} ${c.cy}` })
      })
    })
    /* cross links from the selected page: where it sends people next */
    const src = cardRefs.current[sel] || (sel === 'home' ? homeRef.current : null)
    if (src) {
      const s = rel(src)
      const p = byId(sel)
      ;(p?.linksOut || []).forEach(id => {
        const el = cardRefs.current[id]; if (!el) return
        const t = rel(el)
        const goingRight = t.cx > s.cx
        const x1 = goingRight ? s.r : s.l, x2 = goingRight ? t.l : t.r
        /* keep the control points inside the canvas so a curve never escapes the diagram */
        const W = O.width
        const clamp = v => Math.max(6, Math.min(W - 6, v))
        const dx = Math.min(90, Math.max(30, Math.abs(x2 - x1) * 0.4))
        const c1 = clamp(x1 + (goingRight ? dx : -dx)), c2 = clamp(x2 - (goingRight ? dx : -dx))
        out.push({ kind: 'link', d: `M ${x1} ${s.cy} C ${c1} ${s.cy}, ${c2} ${t.cy}, ${x2} ${t.cy}` })
      })
    }
    setWires(out)
  }

  useLayoutEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (treeRef.current) ro.observe(treeRef.current)
    window.addEventListener('resize', draw)
    const t = setTimeout(draw, 350) /* after fonts settle */
    return () => { ro.disconnect(); window.removeEventListener('resize', draw); clearTimeout(t) }
  }, [sel, audience])

  const cardCls = p => {
    const c = ['fw-card', 'st-' + p.status]
    if (sel === p.id) c.push('sel')
    else if ((page?.linksOut || []).includes(p.id)) c.push('rel-out')
    else if (inbound.includes(p.id)) c.push('rel-in')
    if (audience) c.push(onRoute(p.id) ? 'onroute' : 'offroute')
    return c.join(' ')
  }

  return (
    <div className="fw">
      <header className="fw-head">
        <span className="eyebrow">Website framework</span>
        <h1>Every page, and where it sends people next.</h1>
        <p className="fw-lede">
          The whole site as one tree: the homepage at the top, the six groups beneath it, and every page
          hanging off its group. Click any page to draw the routes it sends people down. Pick an audience
          to trace the path that visitor actually walks. Generated from the site data, so it is always current.
        </p>
        <div className="fw-stats">
          <div><b>{counts.total}</b><span>page types</span></div>
          <div><b>{GROUPS.length}</b><span>groups</span></div>
          <div><b>{counts.live}</b><span>live</span></div>
          <div><b>{counts.added}</b><span>this phase</span></div>
          <div><b>{counts.gated}</b><span>gated</span></div>
        </div>
        <div className="fw-routes">
          <span className="fw-k">Trace a route</span>
          {ROUTES_BY_AUDIENCE.map(r => (
            <button key={r.id} className={'fw-rt' + (audience === r.id ? ' on' : '')}
              onClick={() => setAudience(audience === r.id ? null : r.id)}>
              <Icon name={r.icon} /> {r.name}
            </button>
          ))}
          {audience && <button className="fw-clear" onClick={() => setAudience(null)}>Clear</button>}
        </div>
      </header>

      {route && (
        <div className="fw-rail">
          {route.path.map((id, i) => {
            const p = byId(id)
            return (
              <React.Fragment key={id + i}>
                <button className="fw-railnode" onClick={() => setSel(id)}>
                  <Icon name={p.icon} /><span>{p.label}</span>
                </button>
                {i < route.path.length - 1 && <i className="fw-railarrow" aria-hidden="true" />}
              </React.Fragment>
            )
          })}
        </div>
      )}

      {/* ---------------- the tree ---------------- */}
      <div className="fw-tree" ref={treeRef}>
        <svg className="fw-wires" aria-hidden="true">
          <defs>
            <marker id="fwArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#EC2027" />
            </marker>
          </defs>
          {wires.map((w, i) => (
            <path key={i} d={w.d} className={'w-' + w.kind}
              markerEnd={w.kind === 'link' ? 'url(#fwArrow)' : undefined} />
          ))}
        </svg>

        <div className="fw-lvl-home">
          <button ref={homeRef} className={'fw-card fw-home' + (sel === 'home' ? ' sel' : '')} onClick={() => setSel('home')}>
            <span className="fw-ic"><Icon name="home" /></span>
            <span className="fw-tx"><b>Home</b><code>/</code></span>
            <span className="fw-st">live</span>
          </button>
        </div>

        <div className="fw-lvl-groups">
          {GROUPS.map(g => (
            <section className="fw-branch" key={g.id}>
              <div className="fw-gnode" ref={el => (groupRefs.current[g.id] = el)}>
                <span className="fw-gno">{g.no}</span>
                <b>{g.name}</b>
                <p>{g.blurb}</p>
              </div>
              <div className="fw-stack">
                {pagesInGroup(g.id).filter(p => p.id !== 'home').map(p => (
                  <button key={p.id} ref={el => (cardRefs.current[p.id] = el)}
                    className={cardCls(p)} onClick={() => setSel(p.id)}>
                    <span className="fw-ic"><Icon name={p.icon} /></span>
                    <span className="fw-tx"><b>{p.label}</b><code>{p.route}</code></span>
                    <span className="fw-st">{p.status === 'live' ? 'live' : p.status === 'gated' ? 'gated' : 'new'}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {page && (
        <aside className="fw-detail">
          <div className="fw-dhead">
            <span className="fw-ic big"><Icon name={page.icon} /></span>
            <div>
              <span className="fw-k">{GROUPS.find(g => g.id === page.group).name}</span>
              <h3>{page.label}</h3>
              <code>{page.route}</code>
            </div>
            {!page.dynamic && <Link className="fw-open" to={page.route}>Open page →</Link>}
          </div>
          <p className="fw-purpose">{page.purpose}</p>

          <div className="fw-cols">
            <div>
              <span className="fw-k">Blocks on this page</span>
              <ol className="fw-blocks">{page.blocks.map(b => <li key={b}>{b}</li>)}</ol>
            </div>
            <div>
              <span className="fw-k">One action it asks for</span>
              <p className="fw-cta"><Icon name="arrow" /> {page.cta.label} <code>{page.cta.route}</code></p>

              <span className="fw-k">Sends people to</span>
              <div className="fw-chips">
                {(page.linksOut || []).map(id => {
                  const t = byId(id); if (!t) return null
                  return <button key={id} className="fw-chip" onClick={() => setSel(id)}><Icon name={t.icon} />{t.label}</button>
                })}
              </div>

              <span className="fw-k">Arrived at from</span>
              <div className="fw-chips">
                {inbound.length === 0 ? <em className="fw-orphan">Nothing links here yet</em> : inbound.map(id => {
                  const t = byId(id); if (!t) return null
                  return <button key={id} className="fw-chip in" onClick={() => setSel(id)}><Icon name={t.icon} />{t.label}</button>
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      <section className="fw-rules">
        <span className="eyebrow">The interlinking rules</span>
        <div className="fw-rulegrid">
          {[
            ['01', 'Every market proves itself', 'A market page links straight into the projects filtered to that market. No filter to touch.'],
            ['02', 'Every project points back', 'A project links to its market and to the capability that delivered it.'],
            ['03', 'Every capability shows work', 'No service line is a claim without reference projects under it.'],
            ['04', 'One obvious next step', 'One primary action per page. Never two competing calls to action.'],
            ['05', 'Nothing orphaned', 'Every page has an inbound link from its group hub. This is what keeps rankings intact.'],
          ].map(([n, t, d]) => (
            <div className="fw-rule" key={n}><span className="fw-gno">{n}</span><b>{t}</b><p>{d}</p></div>
          ))}
        </div>
        <p className={'fw-check' + (orphanList.length ? ' bad' : '')}>
          {orphanList.length === 0
            ? 'Rule 05 check: passing. Every page has at least one inbound link.'
            : 'Rule 05 check: ' + orphanList.length + ' orphaned (' + orphanList.join(', ') + ')'}
        </p>
      </section>
    </div>
  )
}
