/* ============ the CMS layer ============
   One thin storage layer between the public pages and the portal. In this
   prototype everything persists to localStorage in THIS browser; at production
   the same read/write surface is wired to the real CMS backend, so the pages
   never change. The public pages call the read functions and silently fall
   back to the shipped registries when nothing has been edited. */

import { NEWS } from '../data/news.js'
import { ROLES } from '../data/roles.js'
import { PROJECTS } from '../data/projects.js'

const K = {
  session: 'iaq.cms.session.v1',
  news: 'iaq.cms.news.v1',
  roles: 'iaq.cms.roles.v1',
  projects: 'iaq.cms.projects.v1',
}

/* prototype passcode, shown on the login card. The real portal gets SSO. */
const PASS = 'iaq-admin'

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
export const login = pass => {
  if (pass !== PASS) return false
  try { localStorage.setItem(K.session, '1') } catch (e) {}
  return true
}
export const logout = () => clear(K.session)

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

export const slugify = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
