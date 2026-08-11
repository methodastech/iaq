import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import * as CMS from '../lib/cms.js'
import { TAGS, longDate } from '../data/news.js'
import { LOCS, DEPTS } from '../data/roles.js'
import '../styles/portal.css'

/* ============ the CMS portal ============
   The self-managed layer the proposal promises: IAQ's team signs in and edits
   the Newsroom, the open roles and the project registry text without a
   developer. Prototype scope: edits persist in this browser (localStorage);
   at production the same editors write to the real CMS and publish site-wide.
   The public pages already read through the CMS layer, so anything saved here
   is live on this browser immediately. */

export default function Portal () {
  const [authed, setAuthed] = useState(CMS.isAuthed())
  useEffect(() => { document.title = 'IAQ Group · CMS Portal · Brand Method' }, [])
  return (
    <>
      <Nav />
      {authed ? <Dashboard onOut={() => { CMS.logout(); setAuthed(false) }} /> : <Login onIn={() => setAuthed(true)} />}
      <Footer />
    </>
  )
}

function Login ({ onIn }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)
  const submit = e => {
    e.preventDefault()
    if (CMS.login(pass.trim())) onIn()
    else setErr(true)
  }
  return (
    <div className="cms-login">
      <span className="cms-k">Staff only · CMS portal</span>
      <h1>Sign in to manage the site.</h1>
      <p>The Newsroom, the open roles and the project registry are edited here, with no developer needed. Changes publish the moment you save.</p>
      <form onSubmit={submit}>
        <input
          type="password" value={pass} autoFocus
          onChange={e => { setPass(e.target.value); setErr(false) }}
          placeholder="Passcode" aria-label="Passcode"
        />
        {err && <span className="cms-err">That passcode is not right. Try again.</span>}
        <button type="button" onClick={submit}>Sign in</button>
      </form>
      <div className="cms-hint">Prototype access: the passcode is <code>iaq-admin</code>. At production this becomes individual staff accounts with roles and an audit trail.</div>
    </div>
  )
}

function Dashboard ({ onOut }) {
  const [tab, setTab] = useState('news')
  return (
    <div className="cms-wrap">
      <div className="cms-head">
        <div>
          <span className="cms-k">CMS portal · signed in</span>
          <h1>Manage the site.</h1>
          <p>Edit, add or remove entries, then save. Saved changes are live on the site immediately in this browser; at production they publish for everyone through the CMS.</p>
        </div>
        <button className="cms-out" type="button" onClick={onOut}>Sign out</button>
      </div>
      <div className="cms-tabs" role="tablist">
        <button type="button" className={tab === 'news' ? 'on' : ''} onClick={() => setTab('news')}>Newsroom</button>
        <button type="button" className={tab === 'roles' ? 'on' : ''} onClick={() => setTab('roles')}>Careers</button>
        <button type="button" className={tab === 'projects' ? 'on' : ''} onClick={() => setTab('projects')}>Projects</button>
      </div>
      {tab === 'news' && <NewsEditor />}
      {tab === 'roles' && <RolesEditor />}
      {tab === 'projects' && <ProjectsEditor />}
    </div>
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

/* ---------- projects ---------- */
function ProjectsEditor () {
  const ed = useEditor(CMS.cmsProjects, CMS.saveProjects, CMS.resetProjects, CMS.cmsProjectsEdited)
  return (
    <>
      <div className="cms-note"><b>The confidentiality rule is hard:</b> projects publish by location, sector and scope, never by client name. The client field here is the neutral sector description that shows publicly. Photography and detail pages stay canonical; the text is yours to edit.</div>
      <EditorBar onAdd={() => {}} addLabel="Registry is fixed at 18 · the 60-project list lands next" onReset={ed.doReset} dirty={ed.dirty} edited={ed.edited} flash={ed.flash} />
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
