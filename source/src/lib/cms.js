/* ============ the CMS layer ============
   One thin storage layer between the public pages and the portal. In this
   prototype everything persists to localStorage in THIS browser; at production
   the same read/write surface is wired to the real CMS backend, so the pages
   never change. The public pages call the read functions and silently fall
   back to the shipped registries when nothing has been edited. */

import { NEWS } from '../data/news.js'
import { ROLES } from '../data/roles.js'
import { PROJECTS } from '../data/projects.js'
import { SPAN } from '../data/history.js'

const K = {
  session: 'iaq.cms.session.v1',
  news: 'iaq.cms.news.v1',
  roles: 'iaq.cms.roles.v1',
  projects: 'iaq.cms.projects.v1',
  history: 'iaq.cms.history.v1',
}

/* prototype passcode, shown on the login card. The real portal gets SSO. */
/* 15 Sep: the public build has no portal, so the prototype passcode is compiled out of it entirely */
/* 18 Sep (Bazil): the member passcode is iaqsolution321 */
const PASS = import.meta.env.MODE === 'launch' ? '' : 'iaqsolution321'

function read (key) {
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : null } catch (e) { return null }
}
function write (key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)) } catch (e) {}
}
function clear (key) { try { localStorage.removeItem(key) } catch (e) {} }

/* Saves bump a generation stamp; reads are cached per generation so every call
   inside one generation returns the SAME array instance (object identity holds
   for indexOf and re-renders), yet the moment the portal saves, every consumer
   sees the new copy without a reload. */
let _gen = null; let _cache = {}
const generation = () => { try { return localStorage.getItem('iaq.cms.gen') || '0' } catch (e) { return '0' } }
const bump = () => { try { localStorage.setItem('iaq.cms.gen', String(Date.now())) } catch (e) {} }
function cached (kind, compute) {
  const g = generation()
  if (_gen !== g) { _cache = {}; _gen = g }
  if (!_cache[kind]) _cache[kind] = compute()
  return _cache[kind]
}

/* a list that always reflects the current generation, drop-in for a const array */
export const live = getter => new Proxy([], {
  get (_, p) { const l = getter(); const v = l[p]; return typeof v === 'function' ? v.bind(l) : v },
  has (_, p) { return p in getter() },
  ownKeys () { return Reflect.ownKeys(getter()) },
  getOwnPropertyDescriptor (_, p) { return Object.getOwnPropertyDescriptor(getter(), p) },
})

/* ---- auth ---- */
export const isAuthed = () => { try { return localStorage.getItem(K.session) === '1' } catch (e) { return false } }
/* 18 Sep: every change of session tells the open page, so a sign-out in the nav popover flips the
   portal or the Codex under it without a reload */
const tell = () => { try { window.dispatchEvent(new Event('iaq:auth')) } catch (e) {} }
export const onAuth = fn => { window.addEventListener('iaq:auth', fn); return () => window.removeEventListener('iaq:auth', fn) }
export const login = pass => {
  if (!PASS || pass !== PASS) return false
  try { localStorage.setItem(K.session, '1') } catch (e) {}
  tell()
  return true
}
export const logout = () => { clear(K.session); tell() }
/* 18 Sep (Bazil: "put another button, emergency, that grants access for this testing"): opens the
   member session without the passcode. Review builds only; the launch build has no member area. */
export const grant = () => {
  if (import.meta.env.MODE === 'launch') return false
  try { localStorage.setItem(K.session, '1') } catch (e) {}
  tell()
  return true
}

/* ---- newsroom ---- */
export const cmsNews = () => cached('news', () => read(K.news) || NEWS)
export const cmsNewsEdited = () => !!read(K.news)
export const saveNews = list => { write(K.news, list); bump() }
export const resetNews = () => { clear(K.news); bump() }
export const newsBySlug = slug => cmsNews().find(n => n.slug === slug)

/* ---- careers ---- */
export const cmsRoles = () => cached('roles', () => read(K.roles) || ROLES)
export const cmsRolesEdited = () => !!read(K.roles)
export const saveRoles = list => { write(K.roles, list); bump() }
export const resetRoles = () => { clear(K.roles); bump() }

/* ---- projects ---- */
export const cmsProjects = () => cached('projects', () => {
  const stored = read(K.projects)
  if (!stored) return PROJECTS
  /* images and detail links stay canonical: only the text fields are editable */
  return PROJECTS.map((p, i) => stored[i] ? { ...p, ...stored[i] } : p)
})
export const cmsProjectsEdited = () => !!read(K.projects)
export const saveProjects = list => { write(K.projects, list.map(p => ({ name: p.name, client: p.client, loc: p.loc, iso: p.iso }))); bump() }
export const resetProjects = () => { clear(K.projects); bump() }

/* ---- history (1 Oct: "make like editable for this page") ----
   The milestones of /about/history. Their text and their picture are editable; the years, their order and the
   scale between them stay canonical. An edit is filed under the milestone's id, its year and its place among that
   year's milestones (2024#0, 2024#1), not its place in the list, so a milestone added to data/history.js later
   does not shift the edits onto its neighbours. */
const HISTORY_ID = SPAN.map((m, i) => m.label + '#' + SPAN.slice(0, i).filter(x => x.label === m.label).length)
const HIST_FIELDS = ['title', 'text', 'tech']
const FIG_FIELDS = ['img', 'kind', 'cap', 'alt']
export const cmsHistory = () => cached('history', () => {
  const stored = read(K.history)
  if (!stored) return SPAN
  const by = new Map(stored.map(s => [s.id, s]))
  return SPAN.map((m, i) => {
    const s = by.get(HISTORY_ID[i])
    if (!s) return m
    const out = { ...m }
    for (const f of HIST_FIELDS) if (typeof s[f] === 'string') out[f] = s[f]
    if (m.fig && s.fig) {
      out.fig = { ...m.fig }
      for (const f of FIG_FIELDS) if (typeof s.fig[f] === 'string' && s.fig[f]) out.fig[f] = s.fig[f]
      /* a new picture is not the shipped one: drop the shipped frame ratio and crop, so it shows whole, and any clip
         or placeholder the milestone carried, so the picture is what shows */
      if (s.fig.img && s.fig.img !== m.fig.img) {
        for (const f of ['ar', 'pos', 'clip', 'poster', 'ph']) delete out.fig[f]
        /* its own shape, measured by the editor when the picture loaded there */
        if (typeof s.fig.ar === 'string' && /^\d+ \/ \d+$/.test(s.fig.ar)) out.fig.ar = s.fig.ar
      }
    }
    if (m.proj && typeof s.projLabel === 'string' && s.projLabel) out.proj = { ...m.proj, label: s.projLabel }
    return out
  })
})
export const historyId = i => HISTORY_ID[i]
export const cmsHistoryEdited = () => !!read(K.history)
export const saveHistory = list => {
  write(K.history, list.map((m, i) => ({
    id: HISTORY_ID[i],
    title: m.title, text: m.text, tech: m.tech || '',
    ...(m.fig ? { fig: { img: m.fig.img, kind: m.fig.kind || '', cap: m.fig.cap || '', alt: m.fig.alt || '', ...(m.fig.ar ? { ar: m.fig.ar } : {}) } } : {}),
    ...(m.proj ? { projLabel: m.proj.label } : {}),
  })))
  bump()
}
export const resetHistory = () => { clear(K.history); bump() }

export const slugify = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
