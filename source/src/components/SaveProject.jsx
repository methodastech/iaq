import React, { useEffect, useState } from 'react'
import * as SL from '../lib/shortlist.js'

/* ============================================================================
   SaveProject: the control that puts a project on the shortlist.

   Subscribed to the store rather than holding its own truth, so the same
   project saved from the registry shows as saved on its detail page, and the
   nav counter moves at the same moment.

   props
     id     number   the project's registry index
     label  string   the project name, used for the accessible label only
     compact bool    icon-only, for use inside a dense registry card
   ============================================================================ */

export default function SaveProject({ id, label, compact }) {
  const [on, setOn] = useState(() => SL.has(id))

  useEffect(() => SL.subscribe(() => setOn(SL.has(id))), [id])

  return (
    <button
      type="button"
      className={'sl-save' + (on ? ' on' : '')}
      aria-pressed={on}
      aria-label={(on ? 'Remove from shortlist: ' : 'Save to shortlist: ') + (label || 'project')}
      title={on ? 'Saved to your shortlist' : 'Save to your shortlist'}
      onClick={e => {
        /* the control usually sits inside a card that is itself a link */
        e.preventDefault(); e.stopPropagation()
        SL.toggle(id)
      }}
    >
      <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor"
           strokeWidth="1.9" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
        <path d="M6 3h12v18l-6-4.5L6 21z" />
      </svg>
      {!compact && <span>{on ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
