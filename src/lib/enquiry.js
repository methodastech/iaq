/* The one place an enquiry leaves the site.

   Every form on the site routes through submit(): the contact RFQ, the gated capability download,
   and the campaign pages. There is exactly one endpoint to configure and one payload shape to
   agree, rather than three forms each inventing their own.

   WHERE THE DATA GOES, honestly: nowhere yet. No endpoint is configured, because IAQ has not
   supplied one. Rather than pretend, submit() reports `delivered: false` and the caller tells the
   visitor the truth. Wire it by setting VITE_ENQUIRY_ENDPOINT at build time; nothing else changes.

   The intent field is what makes this a routing engine rather than a shared inbox: the plan asks
   for the enquiry to reach a named owner, and the owner is chosen from intent. */

const ENDPOINT = import.meta.env?.VITE_ENQUIRY_ENDPOINT || ''

/* who each intent belongs to. Addresses stay as placeholders until IAQ confirms the owners. */
export const OWNERS = {
  project:  { team: 'Business development', note: 'Routed to the project enquiry owner' },
  career:   { team: 'Human resources',      note: 'Routed to the HR inbox, not the shared catch-all' },
  media:    { team: 'Marketing',            note: 'Routed to the media and press owner' },
  supplier: { team: 'Procurement',          note: 'Routed to the procurement team' },
}

/* Context the enquiry carries with it, so the owner can see what the visitor already looked at
   instead of asking. Session-scoped: this is a browsing trail, not a profile, and it is never
   persisted beyond the tab. */
const TRAIL_KEY = 'iaq.trail.v1'
const MAX_TRAIL = 12

export function noteVisit (path, label) {
  try {
    const t = JSON.parse(sessionStorage.getItem(TRAIL_KEY) || '[]')
    if (t[t.length - 1]?.p === path) return
    t.push({ p: path, l: label || '' })
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify(t.slice(-MAX_TRAIL)))
  } catch { /* private mode: the trail is an enhancement, never a requirement */ }
}

export function trail () {
  try { return JSON.parse(sessionStorage.getItem(TRAIL_KEY) || '[]') } catch { return [] }
}

/**
 * @returns {Promise<{delivered:boolean, reason?:string, owner?:object}>}
 *   delivered:false is a real, expected outcome while no endpoint is configured. Callers must
 *   handle it and say so rather than showing a success panel.
 */
export async function submit (payload) {
  const owner = OWNERS[payload.intent] || OWNERS.project
  const body = {
    ...payload,
    owner: owner.team,
    trail: trail(),
    sentAt: new Date().toISOString(),
    page: typeof location !== 'undefined' ? location.href : '',
  }

  if (!ENDPOINT) {
    return { delivered: false, reason: 'no-endpoint', owner }
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { delivered: false, reason: 'http-' + res.status, owner }
    return { delivered: true, owner }
  } catch {
    return { delivered: false, reason: 'network', owner }
  }
}

export const configured = () => !!ENDPOINT
