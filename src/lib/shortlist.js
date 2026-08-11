/* The project shortlist.

   Buying a facility is a committee decision and the first visitor is rarely the one who signs, so
   the site has to make forwarding the proof effortless. Saved projects survive a return visit,
   become a link that can be sent to a colleague, and attach themselves to the enquiry.

   Two stores, deliberately:
     localStorage  the visitor's own list, so it survives a return visit
     the URL       a received list, so a forwarded link works for someone who has saved nothing

   A shortlist arriving in the URL is treated as READ-ONLY and is never merged into the recipient's
   own saved list unless they ask for it. Silently adopting a colleague's list would overwrite work
   the recipient had already done, and the recipient did not consent to it. */

const KEY = 'iaq.shortlist.v1'
const listeners = new Set()

const read = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.filter(n => Number.isInteger(n)) : []
  } catch { return [] }        /* private mode, quota, or a corrupted value: an empty list is correct */
}

const write = ids => {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* nothing to do */ }
  listeners.forEach(fn => { try { fn(ids) } catch { /* a bad subscriber must not break the rest */ } })
}

export const get = () => read()
export const has = id => read().includes(id)
export const count = () => read().length

export function toggle (id) {
  const ids = read()
  const i = ids.indexOf(id)
  if (i === -1) ids.push(id); else ids.splice(i, 1)
  write(ids)
  return ids.includes(id)
}

export function remove (id) {
  write(read().filter(n => n !== id))
}

export function clear () { write([]) }

/* Adopt a received list, merged rather than replacing, so nothing the recipient saved is lost. */
export function adopt (ids) {
  const mine = read()
  write([...new Set([...mine, ...ids.filter(n => Number.isInteger(n))])])
}

export function subscribe (fn) {
  listeners.add(fn)
  /* another tab is the same visitor: keep the counter honest across windows */
  const onStorage = e => { if (e.key === KEY) fn(read()) }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage) }
}

/* ---- the shareable link ----
   Ids are packed as a comma list rather than JSON so the URL stays readable and short enough to
   paste into an email without a wrapper mangling it. */
export const encode = ids => ids.join(',')
export const decode = s => String(s || '').split(',')
  .map(n => parseInt(n, 10)).filter(n => Number.isInteger(n) && n >= 0)

export function shareUrl (ids) {
  /* HashRouter: the app's own route lives in the fragment, so the query has to sit INSIDE it or
     react-router never sees it. */
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/shortlist?p=${encode(ids)}`
}
