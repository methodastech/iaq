import React from 'react'
import Icon from '../FlowIcon.jsx'
import ModelIcon from '../ModelIcon.jsx'
import MarketMotion from '../MarketMotion.jsx'
import { HERO_LINE, LINE_MARKS } from '../HeroLineMarks.jsx'
/* 25 Sep, late night: the service objects are the isometric renders now; CYCLE_SVG no longer drawn here */
import '../../styles/icon-library.css'

/* ============================================================================
   IconLibrary · 25 Sep 2026. Bazil, on the Design tab: "all the updated icons supposed to be here". Every icon set
   as the site draws it today, from the live components, in the kind colours: services red, units in three blues, work
   amber, systems green, markets violet with white on navy, delivery models and interface marks ink. The Design tab
   (public/design.html) carries a static copy exported from this page (tools/export-icons.mjs).
   ============================================================================ */
const G = (name, color, items, opts = {}) => ({ name, color, items, ...opts })
const MKT = { 'mkt-semiconductor': 'Semiconductor', 'mkt-data-centre': 'Data Centre', 'mkt-ev-battery': 'EV Battery', 'mkt-photovoltaics': 'Photovoltaics', 'mkt-district-cooling': 'District Cooling & Heating', 'mkt-bio-lifescience': 'Bio LifeScience', 'mkt-food-beverage': 'Food & Beverage' }
const flow = list => list.map(([n, l]) => ({ l, el: <Icon name={n} /> }))
const GROUPS = [
  G('Services', '#EC2027', flow([['compass', 'Design'], ['crate', 'Procurement'], ['crane', 'Construction'], ['gauge', 'Commissioning'], ['gear', 'Maintenance'], ['link', 'Tools hookup']])),
  G('Business units', null, [
    { l: 'EPC', el: <Icon name="epcUnit" />, c: '#5CBCF5' },
    { l: 'PCU & TTI', el: <Icon name="pcuUnit" />, c: '#0B8FD8' },
    { l: 'EFM', el: <Icon name="efmUnit" />, c: '#1C4F9C' },
  ]),
  G('Work', '#231F20', flow([['building', 'CSA'], ['airflow', 'MEP'], ['gas', 'Process utilities'], ['helmet', 'Work, the kind']])),
  G('Systems', '#0FA968', flow([['sysPiles', 'Piling and foundations'], ['sysFrame', 'Structural frame and roof'], ['sysEnvelope', 'Cleanroom envelope'], ['sysFinish', 'Architectural finishes'], ['sysAir', 'HVAC, ACMV, FFU'], ['sysPcw', 'Process cooling water'], ['sysChiller', 'Chiller plant, district cooling'], ['sysFire', 'Fire protection'], ['sysElec', 'Electrical HV and LV'], ['sysPlumb', 'Plumbing and drainage'], ['sysCda', 'Clean dry air'], ['sysGas', 'Gases and chemicals'], ['sysUpw', 'Ultrapure water'], ['sysVac', 'Process vacuum, exhaust'], ['sysWaste', 'Waste treatment']])),
  G('Markets', '#9D8CF5', Object.entries(HERO_LINE).map(([id, Ln]) => ({ l: MKT[id], el: <Ln /> })), { dark: true }),
  G('Delivery models', '#0C1220', ['EPCC', 'EPCM', 'Standalone', 'On the EPC or EPCM model', 'Cooling as a Service', 'Energy Performance Contracting', 'Build Operate Transfer'].map(n => ({ l: n, el: <ModelIcon name={n} /> }))),
  G('Line marks: About, commitment, records', '#0C1220', Object.entries(LINE_MARKS).map(([k, Ln]) => ({ l: { vision: 'Vision', mission: 'Mission', esgEnv: 'Environment', esgSocial: 'Social', esgGov: 'Governance', recClean: 'Cleanroom record', recCooling: 'Cooling record', recCogen: 'Cogeneration record', recAward: 'Award', recMedal: 'Medal', recSafety: 'Safety record' }[k] || k, el: <Ln /> }))),
  G('Interface', '#0C1220', flow([['mail', 'Email'], ['phone', 'Phone'], ['pin', 'Location'], ['file', 'Document'], ['folder', 'Files'], ['calendar', 'Date'], ['layers', 'Layers'], ['cube', '3D'], ['play', 'Play'], ['globe', 'Global'], ['press', 'News'], ['people', 'People'], ['user', 'Account'], ['chart', 'Chart'], ['shield', 'Policy'], ['done', 'Done'], ['check', 'Checklist'], ['arrow', 'Go'], ['route', 'Route'], ['target', 'Target'], ['flag', 'Milestone'], ['camera', 'Photo'], ['copy', 'Copy'], ['plus', 'Zoom in'], ['minus', 'Zoom out'], ['recentre', 'Reset view']])),
]
const OBJECTS = [['des', 'Design', 'design'], ['prc', 'Procurement', 'procure'], ['con', 'Construction', 'construct'], ['com', 'Commissioning', 'commission'], ['mnt', 'Maintenance', 'maintain'], ['hok', 'Tools hookup', 'hookup']]
const SCENES = ['mkt-semiconductor', 'mkt-data-centre', 'mkt-ev-battery', 'mkt-photovoltaics', 'mkt-district-cooling', 'mkt-bio-lifescience', 'mkt-food-beverage']

export default function IconLibrary() {
  return (
    <section className="il" aria-labelledby="il-h" id="icon-library">
      <div className="pg-in">
        <h2 id="il-h">The icon library. <em>Every set, as the site draws it.</em></h2>
        <p className="pg-lede">Flat line marks on a 24 grid, one weight, butt caps and mitre joins, in the kind&rsquo;s colour; never in a box.</p>
        {GROUPS.map(g => (
          <div className={'il-g' + (g.dark ? ' il-dark' : '')} key={g.name} data-group={g.name}>
            <h3><i style={{ background: g.color || '#0B8FD8' }} />{g.name}<small>{g.items.length}</small></h3>
            <div className="il-grid">
              {g.items.map(it => (
                <figure className="il-it" key={it.l} style={{ color: it.c || g.color || undefined }}>
                  <span className="il-ic">{it.el}</span>
                  <figcaption>{it.l}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
        {/* 25 Sep, late night (Bazil: "the service objects look too flat and imperfect, they need to be more isometric 3D,
            and motion for the services so there is variety"): the six objects are the isometric renders the delivery
            cycle already runs on (public/assets/cycle3d), then the same six in motion, then at work. The flat vector
            set (CYCLE_SVG) stays in the code for the ring's small discs. */}
        <div className="il-g il-objects" data-group="Service objects">
          <h3><i style={{ background: '#EC2027' }} />Service objects, isometric<small>6</small></h3>
          <div className="il-grid il-grid-lg">
            {OBJECTS.map(([k, l, f]) => <figure className="il-it" key={k}><span className="il-obj3"><img src={`/assets/cycle3d/${f}-ic.webp`} alt="" loading="lazy" /></span><figcaption>{l}</figcaption></figure>)}
          </div>
        </div>
        <div className="il-g il-objects" data-group="Service objects in motion">
          <h3><i style={{ background: '#EC2027' }} />Service objects, in motion<small>6</small></h3>
          <div className="il-grid il-grid-lg">
            {OBJECTS.map(([k, l, f]) => <figure className="il-it" key={k}><span className="il-obj3 v"><video src={`/assets/cycle3d/${f}-loop.mp4`} poster={`/assets/cycle3d/${f}-still.webp`} muted loop autoPlay playsInline preload="none" /></span><figcaption>{l}</figcaption></figure>)}
          </div>
        </div>
        <div className="il-g il-objects" data-group="Service objects at work">
          <h3><i style={{ background: '#EC2027' }} />Service objects, at work<small>6</small></h3>
          <div className="il-grid il-grid-lg">
            {OBJECTS.map(([k, l, f]) => <figure className="il-it" key={k}><span className="il-obj3 w"><img src={`/assets/cycle3d/${f}-card.webp`} alt="" loading="lazy" /></span><figcaption>{l}</figcaption></figure>)}
          </div>
        </div>
        <div className="il-g il-dark il-scenes" data-group="Market scenes">
          <h3><i style={{ background: '#9D8CF5' }} />Market scenes, the market page heroes<small>7</small></h3>
          <div className="il-grid il-grid-lg">
            {SCENES.map(id => <figure className="il-it" key={id}><span className="il-scene"><MarketMotion id={id} /></span><figcaption>{MKT[id]}</figcaption></figure>)}
          </div>
        </div>
      </div>
    </section>
  )
}
