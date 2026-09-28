import React, { useEffect, useRef } from 'react'
import Icon from './FlowIcon.jsx'
import '../styles/detail-diagram.css'

/* ============================================================================
   DetailDiagram: the detail of a service or a market drawn as a diagram of custom line
   icons rather than as a list (2 Sep, Bazil: "custom icons diagrams that go through
   details about the services, for the market as well").

   props
     items    [{ label, line?, icon? }]   the details, in reading order
     variant  'flow' | 'grid'            flow: one rail, nodes joined by a hairline that draws
                                          itself as the diagram enters; grid: icon tiles, no
                                          rail, for requirements that have no order
     start    number                     first index printed (default 1)

   Icons are resolved from the label's own words when a page does not name one, so the
   thirteen pages that feed this share one vocabulary (airflow, gas, water, power…) and a
   later copy edit does not strand an item on the wrong mark. Reveal is class-driven and
   the diagram is fully visible without JS: `in` only adds the draw and the stagger.
   ============================================================================ */

const RULES = [
  [/dew|humid|dry room|moisture/i, 'dewpoint'],
  [/gas|specialty|chemical/i, 'gas'],
  [/acmv|hvac|airflow|air manage|ffu|air handling|ventilat|environment control|pressure cascade/i, 'airflow'],
  [/filter/i, 'filter'],
  [/water|upw|purified|piping|flush|chilled|condenser/i, 'water'],
  [/steam/i, 'steam'],
  [/chiller|cooling|heat rejection|thermal/i, 'snow'],
  [/electric|hv|mv|lv|power|distribution/i, 'power'],
  /* 10 Sep. Two faults in this table, both found by resolving every label on every page and
     looking at what came back rather than by reading it.

     SUBSTRINGS. The patterns match anywhere in the string, so "PLANned preventive maintenance"
     hit /plan/ in the design rule and came out as a drawing, and "upGRADE" hit /grade/ in the
     pharma rule and came out as a flask. Both now carry word boundaries.

     COLLISIONS. Three commissioning labels all resolved to `check` and two procurement labels
     both resolved to `crate`, so those diagrams drew the same mark two and three times in a row.
     The specific rules below run BEFORE the generic ones that were swallowing them.

     Order is load-bearing in this table: first match wins. Adding a rule below a broader one
     does nothing. */
  [/\bepcc\b|\bepcm\b|delivery model/i, 'building'],
  [/classification|iso class|cleanroom class/i, 'particle'],
  [/performance|tuned to|to specification/i, 'gauge'],
  [/dossier|documentation/i, 'file'],
  [/vendor|tender|qualification/i, 'check'],
  [/retrofit|expansion|\bupgrade\b|next cycle/i, 'cycle'],
  [/compliance|\blifecycle\b/i, 'shield'],
  [/planned|preventive|programme|\bprogram\b|scheduled/i, 'clock'],
  [/\bmaint|breakdown|reactive|response/i, 'gear'],
  [/test|commission|certif|verif|valid|readiness/i, 'check'],
  [/document|handover|dossier|submission/i, 'file'],
  [/regulat|authority|safety|interlock|compliance/i, 'shield'],
  [/feasib|value engineering|cost|budget|schedule|optimi/i, 'chart'],
  [/vendor|tender|procure|sourc|long-lead|equipment|material/i, 'crate'],
  [/site|trade|construct|build|envelope|architect|finish|vapour|airlock/i, 'envelope'],
  [/design|concept|drawing|csa|mep|\bplan\b|\bplans\b|engineering/i, 'drawing'],
  [/operation/i, 'gear'],
  [/tool|hook|move-in|qualif/i, 'link'],
  [/survey|set out/i, 'compass'],
  [/rig|place|lift|crane/i, 'crane'],
  [/hygien|food|clean-?ability/i, 'leaf'],
  [/particle|clean|iso/i, 'particle'],
  [/control|monitor|energy|efficien/i, 'gauge'],
  [/uptime|server|data/i, 'server'],
  [/gmp|\bgrade\b|pharma|steril/i, 'flask'],
]
export function iconFor(text) {
  const t = String(text || '')
  for (const [re, name] of RULES) if (re.test(t)) return name
  return 'cube'
}

export default function DetailDiagram({ items = [], variant = 'flow', start = 1, ariaLabel }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const on = () => el.classList.add('in')
    if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { on(); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { on(); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    const failsafe = setTimeout(on, 3000)      /* never leave a diagram half-drawn */
    return () => { io.disconnect(); clearTimeout(failsafe) }
  }, [])
  if (!items.length) return null
  return (
    <div className={'dd dd-' + variant} ref={ref} role="list" aria-label={ariaLabel}
         style={{ '--n': items.length }}>
      {items.map((it, i) => (
        <div className="dd-n" role="listitem" key={i} style={{ '--i': i }}>
          <span className="dd-ic" aria-hidden="true"><Icon name={it.icon || iconFor(it.label)} /></span>
          <span className="dd-no">{start + i}</span>
          <b className="dd-lb">{it.label}</b>
          {it.line && <small className="dd-ln">{it.line}</small>}
        </div>
      ))}
    </div>
  )
}
