import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Routes, Route, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import * as CMS from '../lib/cms.js'
import { TAGS, longDate } from '../data/news.js'
import { LOCS, DEPTS } from '../data/roles.js'
import '../styles/portal.css'
import '../styles/gate.css'
import { CodexBody } from './Codex.jsx'
import PortalBooth from './PortalBooth.jsx'
import Direction from '../components/booth/Direction.jsx'
import IsoFamily from '../components/codex/IsoFamily.jsx'
import ArtStyle from '../components/codex/ArtStyle.jsx'
import IconLibrary from '../components/codex/IconLibrary.jsx'
import '../styles/codex.css'
import '../styles/codex-parts.css'
import { useBrandFonts } from '../lib/brandFonts.js'
import '../styles/booth.css'
import Icon from '../components/FlowIcon.jsx'
import SignatureGen from '../components/portal/SignatureGen.jsx'
import QrRefs from '../components/portal/QrRefs.jsx'
import SigCatalogue from '../components/portal/SigCatalogue.jsx'

/* ============ the CMS portal ============
   The self-managed layer the proposal promises: IAQ's team signs in and edits
   the Newsroom, the open roles and the project registry text without a
   developer. Prototype scope: edits persist in this browser (localStorage);
   at production the same editors write to the real CMS and publish site-wide.
   The public pages already read through the CMS layer, so anything saved here
   is live on this browser immediately. */

/* 18 Sep, evening (Bazil: "portal should have its own tabs and pages, right inside there is the Codex"). The member
   portal is its own area: one tab bar under the site nav, a page per tab on its own address, the Codex first.
     /portal/codex      the Codex
     /portal/newsroom   /portal/careers   /portal/projects   the CMS editors
     /portal/downloads  the capability pack, the certificates, the infographic set
     /portal/booth      SEMICON Europa 2026: the plan, the stand drafts, the screen (full screen at /booth/screen)
   One member session covers every tab (lib/cms.js); signing out anywhere gates them all. */
/* 22 Sep (Bazil: "icons for each"): every tab carries its line icon, from the site's one icon set */
const TAB_ICON = { codex: 'layers', newsroom: 'press', careers: 'people', projects: 'building', history: 'clock', downloads: 'folder', booth: 'cube', models: 'cube', direction: 'layers', qr: 'grid', signature: 'mail', 'signature-designs': 'layers' }
const TABS = [
  ['codex', 'Codex', 'The IAQ structure, the infographic set and the cross-check'],
  ['newsroom', 'Newsroom', 'Articles on the site'],
  ['careers', 'Careers', 'Open roles'],
  ['projects', 'Projects', 'The project registry text'],
  ['history', 'History', 'The milestones of History of IAQ'],   /* 1 Oct ("make like editable for this page") */
  ['downloads', 'All files', 'The capability pack, the certificates, the infographic set, to send'],   /* 25 Sep (Bazil: "Documents and Files to send are supposed to be the same"): the Documents group IS this page; its menu names it All files */
  /* 22 Sep (Bazil: "a detailed proposal plan for the IAQ booth ... and the portal section that has all this") */
  ['booth', 'Booth', 'SEMICON Europa 2026: the plan, the stand, the screen, print and online'],
  /* 25 Sep (Bazil: "design direction should be in another tab, standalone, not in the exhibition") */
  ['direction', 'Design direction', 'The rules every piece is drawn with: colour, type, the mark, lines, spacing, and what to do and not do'],
  /* 23 Sep (checklist d6: "a 3D modelling tab for Azwan's files, so IAQ reviews both demos in one place").
     Brand Method's half is the place and the honest slots; the files come from Azwan and Haydar. */
  /* 29 Sep: under the Email signature group, the Generator (this page) and Designs, the catalogue */
  ['signature-designs', 'Designs', 'The house signature designs, each with your own details, ready to copy'],
  ['signature', 'Generator', 'Your signature in the house style, ready to paste into Outlook, Gmail or Apple Mail'],
  /* 29 Sep ("add marketing and sub QR code", "just that we put QR code for reference") */
  ['qr', 'QR code', 'The QR codes the team uses, to look up and download'],
  ['models', '3D', 'Both 3D demos in one place: the facility model that ships, and the walkthrough in progress'],
]

/* ============================================================================
   23 Sep (Bazil: "in the portal navigation bar we should separate to 1. edit website, 2. exhibition
   (anything exhibition related), 3. documents (to download)", and "when click 1 which is edit, the
   info expands to the right or left, and that works for the others as well").

   Seven flat tabs said nothing about what the portal is FOR. They are three jobs now, and the bar
   shows the three. Clicking one opens its pages in a panel beside the buttons, so the second level
   arrives where the eye already is instead of on another screen. Every page keeps its own address,
   so /portal/codex and the rest still work and still deep-link.
   ============================================================================ */
const GROUPS = [
  { k: 'edit', label: 'Edit website', icon: 'press', note: 'Everything the site reads',
    items: ['newsroom', 'careers', 'projects', 'history'] },
  /* 24 Sep (Bazil: "exhibition should have all the exhibition plans"): the booth page's own views sit in the
     panel, so every part of the SEMICON plan is one click from the bar */
  /* 25 Sep (Bazil: "design direction should be in another tab, standalone"): its own title in the sidebar, no group */
  { k: 'direction', label: 'Design direction', icon: 'layers', note: '', items: ['direction'], solo: true },
  { k: 'exhibition', label: 'Exhibition', icon: 'cube', note: 'SEMICON Europa 2026 and the 3D',
    items: [
      { k: 'booth', view: 'plan', label: 'Plan', icon: 'calendar' },
      { k: 'booth', view: 'stand', label: 'Stand', icon: 'cube' },
      { k: 'booth', view: 'print', label: 'Print', icon: 'file' },
      { k: 'booth', view: 'digital', label: 'Screen and digital', icon: 'play' },
      { k: 'booth', view: 'website', label: 'Website', icon: 'globe' },   /* the booth page's own part, so every part in view has its sidebar item */
      { k: 'booth', view: 'files', label: 'Booth files', icon: 'folder' },
      'models',
    ] },
  /* 29 Sep ("add marketing and sub QR code"): a Marketing group after Exhibition, the QR code reference page under it */
  { k: 'marketing', label: 'Marketing', icon: 'target', note: 'For campaigns and print',
    items: ['qr'] },
  { k: 'documents', label: 'Documents', icon: 'folder', note: 'To read and to send',
    items: ['downloads', 'codex'] },
  /* 25 Sep (Bazil: "create an email signature generator in the website", "portal"): its own title in the sidebar */
  /* 29 Sep ("make sub design under email signature, for catalogue email design, but this portal changeable email signature
     stay"): a group now, the Generator unchanged and the Designs catalogue beside it */
  { k: 'email', label: 'Email signature', icon: 'mail', note: 'Your signature, in the house style', items: ['signature', 'signature-designs'] },
]
const TAB_META = Object.fromEntries(TABS.map(t => [t[0], { label: t[1], note: t[2] }]))
const itemKey = it => (typeof it === 'string' ? it : it.k)
const groupOf = key => (GROUPS.find(g => g.items.some(it => itemKey(it) === key)) || GROUPS[0]).k

export default function Portal () {
  const [authed, setAuthed] = useState(CMS.isAuthed())
  useEffect(() => CMS.onAuth(() => setAuthed(CMS.isAuthed())), [])
  return (
    <>
      <Nav />
      {authed ? <Shell onOut={() => { CMS.logout(); setAuthed(false) }} /> : <Login onIn={() => setAuthed(true)} />}
      <ClosingBand note="Member portal · Brand Method" />
    </>
  )
}

function Shell ({ onOut }) {
  const navigate = useNavigate()
  const here = (typeof location !== 'undefined' ? location.pathname : '').split('/')[2] || 'codex'
  /* 25 Sep (Bazil: "all this should be in the same page, not separated, a left navigation bar, not this kind of
     dropdown", "in fact all should have a navigation left bar"): one shell. The groups and every page they hold are
     listed in a sidebar that stays; the page opens beside it. The dropdown bar is in _backups/services-0926c. */
  const path = (typeof location !== 'undefined' ? location.pathname : '').split('/')
  /* 25 Sep (Bazil: "main titles and subtitles, structured; only when you click the main title the bottom one expands"):
     the three groups are an accordion. The group of the page on show opens by itself; a click on a title opens that
     group and closes the others; the items sit indented under their title */
  const hereGroup = groupOf(path[2] || 'codex')
  const [openGroup, setOpenGroup] = useState(hereGroup)
  useEffect(() => { setOpenGroup(hereGroup) }, [hereGroup])
  /* the booth is one page: its parts are sections, and the sidebar's on-state follows the part in view (PortalBooth
     dispatches booth:part from its scroll spy) */
  const [boothPart, setBoothPart] = useState(null)
  /* 25 Sep (Bazil: "the Codex left navigation should be structured into 3 segments on the same page"): the Codex's three
     parts sit under its link; the one in view is marked */
  const [codexPart, setCodexPart] = useState('part1')
  useEffect(() => {
    if (path[2] !== 'codex') return
    const on = () => { let cur = 'part1'; for (const id of ['part1', 'part2', 'part3']) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .35) cur = id } setCodexPart(cur) }
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [path[2]])
  useEffect(() => { const h = e => setBoothPart(e.detail); window.addEventListener('booth:part', h); return () => window.removeEventListener('booth:part', h) }, [])
  return (
    <div className="pt pt-shell">
      <aside className="pt-side" aria-label="Portal">
        <div className="pt-side-in">
          <span className="pt-name"><b>Member portal</b><small>IAQ Group</small></span>
          {GROUPS.map(g => (
            g.solo ? (
              <div key={g.k} className={'pt-sg pt-solo' + (g.k === hereGroup ? ' here' : '')}>
                <NavLink to={'/portal/' + g.k} className={({ isActive }) => 'pt-sg-b' + (isActive ? ' on' : '')}>
                  <i className="pt-ic" aria-hidden="true"><Icon name={g.icon} /></i><span className="pt-sg-l">{g.label}</span>
                </NavLink>
              </div>
            ) : (
            <div key={g.k} className={'pt-sg' + (g.k === hereGroup ? ' here' : '') + (g.k === openGroup ? ' open' : '')}>
              <button type="button" className="pt-sg-b" aria-expanded={g.k === openGroup} aria-controls={'pt-sg-' + g.k} onClick={() => setOpenGroup(o => (o === g.k ? null : g.k))}>
                <i className="pt-ic" aria-hidden="true"><Icon name={g.icon} /></i><span className="pt-sg-l">{g.label}</span><i className="pt-car" aria-hidden="true" />
              </button>
              <div className="pt-sg-items" id={'pt-sg-' + g.k} hidden={g.k !== openGroup}>
              <em className="pt-sg-n">{g.note}</em>
              {g.items.map(it => {
                const k = itemKey(it), view = typeof it === 'string' ? '' : it.view
                const to = '/portal/' + k + (view ? '/' + view : '')
                const label = typeof it === 'string' ? (TAB_META[k] ? TAB_META[k].label : k) : it.label
                const note = typeof it === 'string' ? (TAB_META[k] ? TAB_META[k].note : '') : ''
                const icon = typeof it === 'string' ? TAB_ICON[k] : it.icon
                const viewOn = view && path[2] === 'booth' && ((boothPart || path[3] || 'plan') === view)
                return (
                  <React.Fragment key={to}>
                  <NavLink to={to} end={!!view} className={({ isActive }) => 'pt-p' + ((view ? viewOn : isActive) ? ' on' : '')} title={note || undefined}>
                    <i className="pt-ic" aria-hidden="true"><Icon name={icon} /></i>
                    <span><b>{label}</b></span>
                  </NavLink>
                  {k === 'codex' && (
                    <div className="pt-subs">
                      {[['part1', '1', 'For everyone'], ['part2', '2', 'For professionals'], ['part3', '3', 'On the website']].map(([id, n, l]) => (
                        <Link key={id} to={{ pathname: '/portal/codex', hash: '#' + id }} className={'pt-sub' + (path[2] === 'codex' && codexPart === id ? ' on' : '')}><i>{n}</i>{l}</Link>
                      ))}
                    </div>
                  )}
                  </React.Fragment>
                )
              })}
              </div>
            </div>
            )
          ))}
          <button className="pt-out" type="button" onClick={onOut}>Sign out</button>
        </div>
      </aside>
      <div className="pt-main">
      <Routes>
        <Route index element={<Navigate to="/portal/codex" replace />} />
        <Route path="codex" element={<CodexBody />} />
        <Route path="newsroom" element={<Page k="newsroom" title={<>The newsroom, <em>edited here.</em></>} lede="Add, edit or remove articles. Saved changes are live on the site in this browser at once; at production they publish for everyone through the CMS."><NewsEditor /></Page>} />
        <Route path="careers" element={<Page k="careers" title={<>Open roles, <em>kept current.</em></>} lede="A role saved here appears in the Careers list and its filters immediately. Applications route to the HR inbox."><RolesEditor /></Page>} />
        <Route path="projects" element={<Page k="projects" title={<>The project registry, <em>by scope and location.</em></>} lede="Edit the text of the published references. Photography and detail pages stay canonical."><ProjectsEditor /></Page>} />
        <Route path="history" element={<Page k="history" title={<>The history of IAQ, <em>milestone by milestone.</em></>} lede="Edit the words and the picture of each milestone on History of IAQ. The years and their order stay as published."><HistoryEditor /></Page>} />
        <Route path="downloads" element={<Page k="downloads" title={<>Files for members, <em>ready to send.</em></>} lede="The infographic set for the company profile, the capability pack and the certificates behind it."><Downloads /></Page>} />
        <Route path="booth/:view?" element={<PortalBooth />} />
        <Route path="direction" element={<DirectionPage />} />
        <Route path="signature" element={<Page k="signature" title={<>Email signatures, <em>one house style.</em></>} lede="Fill in your details, check the preview, then copy the signature into your mail app. Every member’s signature comes out the same."><SignatureGen /></Page>} />
        <Route path="qr" element={<Page k="qr" title={<>QR codes, <em>for reference.</em></>} lede="The codes the team uses, each with the link it opens. Download PNG for screens and documents, SVG for print."><QrRefs /></Page>} />
        <Route path="signature-designs" element={<Page k="signature-designs" title={<>Signature designs, <em>one catalogue.</em></>} lede="The house signature and its variants, each shown with your own details. Pick the one the moment needs and copy it into your mail app."><SigCatalogue /></Page>} />
        <Route path="models" element={<Page k="models" title={<>The 3D, <em>both demos in one place.</em></>} lede="What is on the site today, and what is still being modelled. Nothing here is a render of a real IAQ project unless it says so."><Models /></Page>} />
        <Route path="*" element={<Navigate to="/portal/codex" replace />} />
      </Routes>
      </div>
    </div>
  )
}

/* ============================================================================
   Models · 23 Sep 2026. Checklist d6: "Portal: a 3D modelling tab for Azwan's files, so IAQ reviews
   both demos in one place." Until 23 Sep the portal had no such tab, so IAQ had to be sent the web
   model and the walkthrough separately and had nowhere to comment on them together.

   This is the place and the honest slots, which is Brand Method's half. Each row names what it is,
   where it can be seen today, who owns the next step and what is owed. Nothing is invented: a row
   with no file says so in the site's own slot language rather than showing a stand-in.
   ============================================================================ */
const MODELS = [
  {
    k: 'Ships today',
    h: 'The facility model, on the home page',
    p: 'The fab assembly that builds as the visitor scrolls: piles, structure, envelope, cleanroom, systems and tools. It runs in the browser with no plugin, holds 60fps at 1440, and falls back to stills where WebGL is off.',
    go: [['See it on the home page', '/'], ['Open the lab view', '/fab']],
    owner: null,
  },
  {
    k: 'Ships today',
    h: 'The delivery cycle, six 3D marks',
    p: 'One isometric object per stage, in the same material and lamp, carried by the ring on the Services page and by the record block on the home page.',
    go: [['See the ring', '/services']],
    owner: null,
  },
  {
    k: 'In progress',
    h: 'The character and the walking walkthrough',
    p: 'Bunny suit and safety harness are confirmed. The updated model and the walking walkthrough were due 11 September.',
    go: [],
    owner: 'Azwan',
    owed: 'Updated character model and the walking walkthrough, supplied by IAQ\u2019s 3D team',
  },
  {
    k: 'In progress',
    h: 'Equipment, from the Revit and NWD files',
    p: 'Equipment stands as boxed placeholders in the model until the source files can be converted. The files belong to IAQ\u2019s subcontractor; Navisworks opens the NWD but cannot export it usefully.',
    go: [],
    owner: 'Azwan · IAQ subcontractor',
    owed: 'Revit or NWD equipment files in a convertible format, supplied by IAQ',
  },
  {
    k: 'Waiting on a check',
    h: 'Engineering accuracy review',
    p: 'The 3D sequence and its animations go to IAQ engineering before anything in them is treated as confirmed. Bazil sends the files; Nabilah routes them.',
    go: [],
    owner: 'IAQ engineering',
    owed: 'Engineering sign-off on the sequence, the piping legend and the cleanroom raised floor colour, awaited from IAQ',
  },
]

function Models () {
  useEffect(() => { document.title = 'IAQ Group · Portal · 3D · Brand Method' }, [])
  return (
    <>
      {MODELS.map(m => (
        <div className={'cms-set pt-md' + (m.owed ? '' : ' pt-md-live')} key={m.h}>
          <div>
            <span className="pg-slot-tag">{m.k}</span>
            <h2>{m.h}</h2>
            <p>{m.p}</p>
            {m.go.length ? (
              <div className="cms-dl-act">
                {m.go.map(([t, to]) => <Link className="cta" key={to} to={to}>{t}</Link>)}
                <span className="pt-md-where">Opens the live page, so it can be reviewed beside this one.</span>
              </div>
            ) : null}
          </div>
          {m.owed
            ? <div><div className="pg-slot"><span className="pg-slot-tag">Owed</span><p>{m.owed}</p><p className="pg-note">Owner: {m.owner}</p></div></div>
            : null}
        </div>
      ))}
    </>
  )
}

/* 25 Sep (Bazil: "design direction should be in another tab, standalone"): the booth's Direction rulebook on its own page.
   25 Sep, late night (Bazil: "design direction side bar is also the design tab"): the Design direction page now IS the
   Design tab (public/design.html), shown whole, so the two can never drift. /portal/direction?source still shows the
   React page below, which tools/export-icons.mjs reads the icon library from; a build without the Design tab (the launch
   build prunes it) falls back to that page too. */
function DirectionPage () {
  useBrandFonts()
  const source = typeof window !== 'undefined' && /[?&]source\b/.test(window.location.search)
  const [tab, setTab] = useState(source ? false : null)
  useEffect(() => {
    if (source) return
    let off = false
    fetch('/design/apps.css', { method: 'HEAD', cache: 'no-store' })
      .then(r => { if (!off) setTab(r.ok && /css/.test(r.headers.get('content-type') || '')) })
      .catch(() => { if (!off) setTab(false) })
    return () => { off = true }
  }, [source])
  useEffect(() => { document.title = 'IAQ Group · Portal · Design direction · Brand Method' }, [])
  if (tab === null) return <div style={{ minHeight: '70vh' }} />
  if (tab) return <iframe className="dir-tab" src="/design.html?embed" title="IAQ design system" style={{ display: 'block', width: '100%', height: 'calc(100vh - var(--sticktop, 78px))', border: 0, background: '#F6F6F6' }} />
  return (
    <Page k="direction" title={<>Design direction, <em>the rules.</em></>} lede="The rules every piece is drawn with: colour, type, the mark, lines, spacing, and what to do and not do.">
      <div className="bt bt-solo"><div className="bt-body"><section className="bt-part"><Direction /></section></div></div>
      {/* 25 Sep (Bazil: "isn't this supposed to be in the design tab?"): the icon family and the art and motion rules, from the Codex */}
      <div className="cx-page cx-in-dir"><IsoFamily /><IconLibrary /><ArtStyle /></div>
    </Page>
  )
}

function Page ({ k, title, lede, children }) {
  const label = (TABS.find(t => t[0] === k) || [, k])[1]
  useEffect(() => { document.title = `IAQ Group · Portal · ${label} · Brand Method` }, [label])
  return (
    <div className="cms-wrap">
      <div className="cms-head"><div><h1>{title}</h1><p>{lede}</p></div></div>
      {children}
    </div>
  )
}

function Login ({ onIn }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)
  useEffect(() => { document.title = 'IAQ Group · Member portal · Brand Method' }, [])
  const submit = e => {
    e.preventDefault()
    if (CMS.login(pass.trim())) onIn()
    else setErr(true)
  }
  return (
    <div className="cms-login">
      <h1>Sign in to the <em>member portal.</em></h1>
      <p>The Codex, the newsroom, the open roles, the project registry and the member downloads, each on its own tab.</p>
      <form onSubmit={submit}>
        <input
          type="password" value={pass} autoFocus
          onChange={e => { setPass(e.target.value); setErr(false) }}
          placeholder="Passcode" aria-label="Passcode"
        />
        {err && <span className="cms-err">That passcode is not right. Try again.</span>}
        <button type="submit">Sign in</button>
      </form>
      <button className="nl-emerg cms-emerg" type="button" onClick={() => { if (CMS.grant()) onIn() }}>
        <span>Emergency access</span>
        <small>Opens the member area for testing, no passcode</small>
      </button>
      {import.meta.env.MODE !== 'launch' && <div className="cms-hint">Prototype access: the passcode is <code>iaqsolution321</code>. At production this becomes individual staff accounts with roles and an audit trail.</div>}
    </div>
  )
}

/* ---------- downloads ----------
   18 Sep (Bazil: "remove this part as well, put it in the portal page instead as a section to
   download"). The capability statement and certification pack left the public Services page,
   where it sat behind an email form. Here a member downloads it directly. The pack file itself is
   supplied by IAQ: until it is placed at PACK_FILE the button is inert and says so, and the three
   certificates IAQ has already supplied are downloadable now. */
const PACK_FILE = null /* e.g. '/docs/iaq-capability-statement-2026.pdf' once IAQ supplies it */
const CERTS = [
  { t: 'ISO 9001:2015', s: 'Quality management certificate', f: '/docs/certificates/IAQ-ISO-9001-2015-certificate.pdf' },
  { t: 'ISO 14001:2015', s: 'Environmental management certificate', f: '/docs/certificates/IAQ-ISO-14001-2015-certificate.pdf' },
  { t: 'ISO 45001:2018', s: 'Occupational health and safety certificate', f: '/docs/certificates/IAQ-ISO-45001-2018-certificate.pdf' },
]
/* the infographic set, exported by tools/export-codex-slides-0918.mjs and copied to public/codex/ (review builds
   only: tools/prune-launch.mjs removes the folder from the launch bundle) */
const SET_FILES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
function Downloads () {
  /* 18 Sep (Bazil: "download the whole codex page"): the whole Codex as one PDF, first on this tab */
  const [meta, setMeta] = React.useState(null)
  React.useEffect(() => { fetch('/codex/IAQ-Codex.json', { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(setMeta).catch(() => {}) }, [])
  return (
    <>
      <div className="cms-set">
        <div>
          <h2>The Codex, the whole page</h2>
          <p>Every section in one PDF: for everyone, for professionals, on the website, the cross-check against IAQ’s documents, and the background. The relationship map prints as tables and the videos as a list of links.</p>
          <div className="cms-dl-act"><a className="cta" href="/codex/IAQ-Codex.pdf" download="IAQ-Codex.pdf">Download the whole Codex</a><span className="cms-dl-note">{meta ? `${meta.pages} pages · A4 landscape · ${meta.date}` : 'A4 landscape'}</span></div>
        </div>
        <ul className="cms-set-grid pdf">
          {[0, 1, 2, 3].map(n => (
            <li key={n}><a href="/codex/IAQ-Codex.pdf" download="IAQ-Codex.pdf"><img src={`/codex/codex-page-${n}.jpg`} alt="" loading="lazy" /></a></li>
          ))}
        </ul>
      </div>
      <div className="cms-set">
        <div>
          <h2>The infographic set</h2>
          <p>A cover and eleven slides at 16:9, for the company profile and the booth screens. Slides 8, 9 and 10 are the three unit pages. They go straight after the page on the three business units.</p>
          <div className="cms-dl-act"><a className="cta" href="/codex/IAQ-infographic-set.pdf" download>Download the PDF</a><span className="cms-dl-note">12 pages · 1920 by 1080</span></div>
        </div>
        <ul className="cms-set-grid">
          {SET_FILES.map(n => (
            <li key={n}><a href={`/codex/slide-${n}.png`} download><img src={`/codex/slide-${n}.jpg`} alt="" loading="lazy" /><span>{n === 0 ? 'Cover' : 'Slide ' + n}<i>PNG</i></span></a></li>
          ))}
        </ul>
      </div>
      <div className="cms-note"><b>Member downloads.</b> The capability statement and certification pack, and the certificates behind it. These files are for procurement and tender use; client names stay out of every public asset.</div>
      <div className="cms-dl">
        <div className="gate-doc" aria-hidden="true">
          <span className="gd-shadow" />
          <div className="gd-book">
            <span className="gd-pages" />
            <span className="gd-back" />
            <span className="gd-leaf" />
            <div className="gd-cover">
              <span className="gd-spine" />
              <span className="gd-vis"><img src="/assets/hero-campus.webp" alt="" loading="lazy" decoding="async" /></span>
              <span className="gd-body">
                <img className="gd-logo" src="/assets/iaq-logo.webp" alt="" loading="lazy" decoding="async" />
                <span className="gd-k">Capability statement</span>
                <b>Total Facility Solutions</b>
                <span className="gd-sub">Scope of services &middot; delivery models &middot; classifications delivered &middot; certifications</span>
                <span className="gd-foot"><i>2026 edition</i><i>PDF</i></span>
              </span>
              <span className="gd-gloss" />
            </div>
          </div>
        </div>
        <div>
          <span className="cms-k">Download</span>
          <h2>Capability statement &amp; certification pack</h2>
          <p>Scope of services, delivery models, classifications delivered and current certifications, as one PDF for a procurement file.</p>
          <ul className="gd-list">
            <li><b>What is inside</b><span>Company profile, the six services, the three business units, delivered classes by market, project references by scope</span></li>
            <li><b>Certifications</b><span>ISO 9001 &middot; ISO 14001 &middot; ISO 45001 &middot; CIDB G7 &middot; ESH award record</span></li>
            <li><b>Format</b><span>One PDF &middot; about 24 pages &middot; under 10 MB</span></li>
          </ul>
          <div className="cms-dl-act">
            {PACK_FILE
              ? <a className="cta" href={PACK_FILE} download>Download the pack</a>
              : <a className="cta" href="#" aria-disabled="true" onClick={e => e.preventDefault()}>Download the pack</a>}
            <span className="cms-dl-note">{PACK_FILE ? 'PDF' : 'The file is supplied by IAQ. The button activates the moment it is placed.'}</span>
          </div>
        </div>
      </div>
      <h3 className="cms-h3">Certificates on file</h3>
      <ul className="cms-files">
        {CERTS.map(c => (
          <li key={c.f}>
            <a className="cms-file" href={c.f} download>
              <span><b>{c.t}</b><small>{c.s}</small></span>
              <span className="dl">PDF</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

/* ---------- shared editor scaffolding ---------- */
function useEditor (load, save, reset, edited) {
  const [items, setItems] = useState(load)
  const [dirty, setDirty] = useState(false)
  const [flash, setFlash] = useState(false)
  const [open, setOpen] = useState(-1)
  const update = (i, patch) => { setItems(l => l.map((x, k) => k === i ? { ...x, ...patch } : x)); setDirty(true) }
  const remove = i => { setItems(l => l.filter((_, k) => k !== i)); setDirty(true); setOpen(-1) }
  const add = item => { setItems(l => [item, ...l]); setDirty(true); setOpen(0) }
  const doSave = () => { save(items); setDirty(false); setFlash(true); setTimeout(() => setFlash(false), 2200) }
  const doReset = () => { reset(); setItems(load()); setDirty(false); setOpen(-1) }
  return { items, dirty, flash, open, setOpen, update, remove, add, doSave, doReset, edited: edited() }
}

function EditorBar ({ onAdd, addLabel, onReset, dirty, edited, flash }) {
  return (
    <div className="cms-bar">
      <button className="cms-add" type="button" onClick={onAdd}>{addLabel}</button>
      <button className="cms-reset" type="button" onClick={onReset}>Reset to the shipped registry</button>
      {flash && <span className="cms-saved-flash">Saved. Live on the site.</span>}
      <span className={'cms-state' + (dirty ? ' dirty' : '')}>{dirty ? 'Unsaved changes' : (edited ? 'Edited copy live' : 'Shipped registry live')}</span>
    </div>
  )
}

function SaveBar ({ dirty, onSave }) {
  return <div className="cms-save"><button type="button" disabled={!dirty} onClick={onSave}>Save &amp; publish</button></div>
}

/* ---------- newsroom ---------- */
function NewsEditor () {
  const ed = useEditor(CMS.cmsNews, CMS.saveNews, CMS.resetNews, CMS.cmsNewsEdited)
  const addNew = () => ed.add({ slug: '', date: new Date().toISOString().slice(0, 10), tag: 'Company', title: 'New article', body: '' })
  return (
    <>
      <div className="cms-note"><b>House rules apply:</b> no client names on any public asset (projects by location and sector only), no exclamation marks, no hype. The article body publishes on the article page; leave it empty to keep the labelled awaiting-copy slot.</div>
      <EditorBar onAdd={addNew} addLabel="+ New article" onReset={ed.doReset} dirty={ed.dirty} edited={ed.edited} flash={ed.flash} />
      <div className="cms-list">
        {ed.items.map((n, i) => (
          <div className="cms-item" key={i}>
            <div className="cms-item-h" onClick={() => ed.setOpen(ed.open === i ? -1 : i)}>
              <b>{n.title || 'Untitled'}</b>
              <span className="cms-chip">{n.tag}</span>
              <span className="cms-chip">{longDate(n.date)}</span>
              <button className="cms-del" type="button" aria-label="Delete article" onClick={e => { e.stopPropagation(); ed.remove(i) }}>&#10005;</button>
            </div>
            {ed.open === i && (
              <div className="cms-form">
                <label className="full">Title
                  <input value={n.title} onChange={e => ed.update(i, { title: e.target.value, slug: n.slug || CMS.slugify(e.target.value) })} />
                </label>
                <label>Date<input type="date" value={n.date} onChange={e => ed.update(i, { date: e.target.value })} /></label>
                <label>Tag
                  <select value={n.tag} onChange={e => ed.update(i, { tag: e.target.value })}>
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label>Slug (the address)<input value={n.slug} onChange={e => ed.update(i, { slug: CMS.slugify(e.target.value) })} /></label>
                <label className="full">Article body · publishes on the article page
                  <textarea value={n.body || ''} placeholder="Write the article. One blank line between paragraphs." onChange={e => ed.update(i, { body: e.target.value })} />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      <SaveBar dirty={ed.dirty} onSave={ed.doSave} />
    </>
  )
}

/* ---------- careers ---------- */
function RolesEditor () {
  const ed = useEditor(CMS.cmsRoles, CMS.saveRoles, CMS.resetRoles, CMS.cmsRolesEdited)
  const addNew = () => ed.add({ t: 'New role', loc: LOCS[0][0], dept: DEPTS[0][0] })
  const lbl = (pairs, k) => (pairs.find(p => p[0] === k) || [,''])[1]
  return (
    <>
      <div className="cms-note"><b>Applications route to the HR inbox</b>, exactly as agreed: no applicant tracking system. A role saved here appears in the Careers list and its filters immediately.</div>
      <EditorBar onAdd={addNew} addLabel="+ New role" onReset={ed.doReset} dirty={ed.dirty} edited={ed.edited} flash={ed.flash} />
      <div className="cms-list">
        {ed.items.map((r, i) => (
          <div className="cms-item" key={i}>
            <div className="cms-item-h" onClick={() => ed.setOpen(ed.open === i ? -1 : i)}>
              <b>{r.t || 'Untitled role'}</b>
              <span className="cms-chip">{lbl(DEPTS, r.dept)}</span>
              <span className="cms-chip">{lbl(LOCS, r.loc)}</span>
              <button className="cms-del" type="button" aria-label="Delete role" onClick={e => { e.stopPropagation(); ed.remove(i) }}>&#10005;</button>
            </div>
            {ed.open === i && (
              <div className="cms-form">
                <label className="full">Role title<input value={r.t} onChange={e => ed.update(i, { t: e.target.value })} /></label>
                <label>Department
                  <select value={r.dept} onChange={e => ed.update(i, { dept: e.target.value })}>
                    {DEPTS.map(d => <option key={d[0]} value={d[0]}>{d[1]}</option>)}
                  </select>
                </label>
                <label>Location
                  <select value={r.loc} onChange={e => ed.update(i, { loc: e.target.value })}>
                    {LOCS.map(l => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      <SaveBar dirty={ed.dirty} onSave={ed.doSave} />
    </>
  )
}

/* ---------- history (1 Oct: "make like editable for this page", on /about/history) ----------
   Every milestone's title, description, technical highlights, picture, picture label and caption, and the words of
   its project link. The years, their order and the spacing between them stay canonical, so the span still draws to
   scale. A picture is any image already on the site, by its address; the shipped ones are offered in the list. */
const HISTORY_IMAGES = [...new Set(CMS.cmsHistory().map(m => m.fig && m.fig.img).filter(Boolean))]
function HistoryEditor () {
  const ed = useEditor(CMS.cmsHistory, CMS.saveHistory, CMS.resetHistory, CMS.cmsHistoryEdited)
  const fig = (i, m, patch) => ed.update(i, { fig: { ...m.fig, ...patch } })
  return (
    <>
      <div className="cms-note"><b>House rules apply:</b> no client names in the words (by sector and location only), no exclamation marks, no hype. A picture that is a rendering or an illustration says so in its label. To use a new picture, its file goes into <code>public/assets/history/</code> first; then pick or type its address here.</div>
      <EditorBar onAdd={() => {}} addLabel={`All ${ed.items.length} milestones are editable here`} onReset={ed.doReset} dirty={ed.dirty} edited={ed.edited} flash={ed.flash} />
      <datalist id="cms-hx-imgs">{HISTORY_IMAGES.map(src => <option key={src} value={src} />)}</datalist>
      <div className="cms-list">
        {ed.items.map((m, i) => (
          <div className="cms-item" key={CMS.historyId(i)}>
            <div className="cms-item-h" onClick={() => ed.setOpen(ed.open === i ? -1 : i)}>
              <b>{m.title || 'Untitled'}</b>
              <span className="cms-chip">{m.label}</span>
              {m.kind === 'achievement' && <span className="cms-chip">Achievement</span>}
            </div>
            {ed.open === i && (
              <div className="cms-form">
                <label className="full">Title<input value={m.title} onChange={e => ed.update(i, { title: e.target.value })} /></label>
                <label className="full">Description
                  <textarea value={m.text || ''} onChange={e => ed.update(i, { text: e.target.value })} />
                </label>
                <label className="full">Technical highlights · leave empty to hide the line
                  <textarea value={m.tech || ''} onChange={e => ed.update(i, { tech: e.target.value })} />
                </label>
                {m.fig && (
                  <>
                    <label className="full">Picture (its address on the site)
                      <input list="cms-hx-imgs" value={m.fig.img || ''} placeholder="/assets/history/2026-name.webp" onChange={e => fig(i, m, { img: e.target.value.trim(), measure: true })} />
                    </label>
                    {/* a newly chosen picture is measured as it loads here, so the page frames it at its own shape, whole */}
                    {m.fig.img && <img className="cms-hx-pv" src={m.fig.img} alt="" onLoad={e => { if (m.fig.measure) fig(i, m, { measure: false, ar: e.currentTarget.naturalWidth + ' / ' + e.currentTarget.naturalHeight }) }} />}
                    <label>Picture label (Rendering, Representation, a place)<input value={m.fig.kind || ''} onChange={e => fig(i, m, { kind: e.target.value })} /></label>
                    <label>Caption<input value={m.fig.cap || ''} onChange={e => fig(i, m, { cap: e.target.value })} /></label>
                    <label className="full">Picture description, for screen readers<input value={m.fig.alt || ''} onChange={e => fig(i, m, { alt: e.target.value })} /></label>
                  </>
                )}
                {m.proj && <label className="full">Project link words · opens {m.proj.to}<input value={m.proj.label} onChange={e => ed.update(i, { proj: { ...m.proj, label: e.target.value } })} /></label>}
              </div>
            )}
          </div>
        ))}
      </div>
      <SaveBar dirty={ed.dirty} onSave={ed.doSave} />
      <p style={{ marginTop: 14, fontSize: 13, color: '#828B9E' }}>A milestone added or a year changed alters the span itself, its scale and its count, so it goes through <code>src/data/history.js</code>. <Link to="/about/history">View the live page</Link>.</p>
    </>
  )
}

/* ---------- projects ---------- */
function ProjectsEditor () {
  const ed = useEditor(CMS.cmsProjects, CMS.saveProjects, CMS.resetProjects, CMS.cmsProjectsEdited)
  return (
    <>
      <div className="cms-note"><b>The confidentiality rule is hard:</b> projects publish by location, sector and scope, never by client name. The client field here is the neutral sector description that shows publicly. Photography and detail pages stay canonical; the text is yours to edit.</div>
      <EditorBar onAdd={() => {}} addLabel="All 18 projects are editable here · the 60-project list follows" onReset={ed.doReset} dirty={ed.dirty} edited={ed.edited} flash={ed.flash} />
      <div className="cms-list">
        {ed.items.map((p, i) => (
          <div className="cms-item" key={i}>
            <div className="cms-item-h" onClick={() => ed.setOpen(ed.open === i ? -1 : i)}>
              <b>{p.name}</b>
              <span className="cms-chip">{p.loc}</span>
              <span className="cms-chip">{p.iso}</span>
            </div>
            {ed.open === i && (
              <div className="cms-form">
                <label className="full">Project title<input value={p.name} onChange={e => ed.update(i, { name: e.target.value })} /></label>
                <label>Sector description (public)<input value={p.client} onChange={e => ed.update(i, { client: e.target.value })} /></label>
                <label>Location (never the client)<input value={p.loc} onChange={e => ed.update(i, { loc: e.target.value })} /></label>
                <label>Class / spec<input value={p.iso} onChange={e => ed.update(i, { iso: e.target.value })} /></label>
              </div>
            )}
          </div>
        ))}
      </div>
      <SaveBar dirty={ed.dirty} onSave={ed.doSave} />
      <p style={{ marginTop: 14, fontSize: 13, color: '#828B9E' }}>Need a project removed or added? That changes the registry itself: it happens when the approved 60-project list arrives, so the numbers on the site always match the published record. <Link to="/projects">View the live registry</Link>.</p>
    </>
  )
}
