import React from 'react'
import { Link } from 'react-router-dom'

/* The closing band asks the visitor to start a project, so it needs the button that does it
   (3 Sep, Bazil). One component, used by every page that renders the closing block, so the
   call to action cannot drift page to page. */
export default function ContactCta({ label = 'Contact us' }) {
  return (
    <Link className="close-cta" to="/contact">
      {label}
    </Link>
  )
}
