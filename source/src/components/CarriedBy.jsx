import React from 'react'
import { Link } from 'react-router-dom'
import { UNITS } from '../data/codex.js'
import '../styles/carried-by.css'

/* 24 Sep (Bazil: "with all the info we have, each page of services and units perfect"): a service page now says which
   business unit carries this stage, always or when the client asks, from the same data as the Services page chart. */
export default function CarriedBy({ service }) {
  return (
    <div className="cb" data-reveal="">
      <p className="cb-h">Which business unit carries this stage</p>
      <ul className="cb-l">
        {UNITS.map(u => {
          const k = u.core.includes(service) ? 'core' : u.ask.includes(service) ? 'ask' : 'off'
          return (
            <li key={u.id} className={'cb-i ' + k}>
              <Link to={u.route}><b>{u.short || u.name}</b><small>{u.line}</small></Link>
              <span className="cb-k">{k === 'core' ? 'Always' : k === 'ask' ? 'When you ask for it' : 'Other units'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
