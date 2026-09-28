import React from 'react'

/* Social accounts.

   ONE place to hold these so the handles are a single-line swap at handover. Only entries
   with a `url` render, so an unconfirmed account simply does not appear rather than
   shipping a dead link.

   LinkedIn is the only one that earns footer space for a B2B engineering group: it is where
   procurement, partners and candidates actually check a contractor. Consumer networks are
   deliberately absent — an empty or stale profile in a footer reads worse than no profile.

   2 Sep: the LinkedIn handle was WRONG. `/company/iaq-technology/` returns LinkedIn's "page not
   found"; the page IAQ's own live site (iaqtechnology.com.my) links is `/company/iaq-group-of-
   companies/`, titled "IAQ Group", verified in the browser. The live site publishes NO other
   network, so Facebook, Instagram and YouTube are declared below with an EMPTY url: the footer
   hides them until IAQ supplies a handle, and switching one on is filling in the string.

   4 Sep: the LinkedIn URL was re-checked in the browser and is LIVE: it titles "IAQ Group |
   LinkedIn" with an h1 of "IAQ Group". A dead slug titles plain "LinkedIn" with a not-found
   heading, so that title is the test to repeat if it ever needs re-confirming.

   ⚠ CONFIRM THE REMAINING HANDLES with IAQ before launch. */
export const SOCIAL = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/iaq-group-of-companies/',
    icon: <><path d="M4.5 9.2h3.1V19H4.5zM6 4.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z" /><path d="M10.3 9.2h3v1.35a3.3 3.3 0 0 1 2.95-1.6c2.35 0 3.75 1.5 3.75 4.35V19h-3.1v-5.05c0-1.35-.5-2.2-1.7-2.2-1 0-1.55.68-1.8 1.34-.1.24-.1.57-.1.9V19h-3.1z" /></>,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    url: '',   /* not published by IAQ anywhere verifiable as of 2 Sep 2026 */
    icon: <path d="M13.5 21v-7.2h2.5l.4-2.9h-2.9V9.05c0-.85.25-1.4 1.45-1.4h1.55V5.05A20 20 0 0 0 14.2 4.9c-2.25 0-3.8 1.4-3.8 3.9v2.1H8v2.9h2.4V21z" />,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: '',
    icon: <><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2z" /><circle cx="17.1" cy="6.9" r="1.1" /><path d="M16.6 3H7.4A4.4 4.4 0 0 0 3 7.4v9.2A4.4 4.4 0 0 0 7.4 21h9.2a4.4 4.4 0 0 0 4.4-4.4V7.4A4.4 4.4 0 0 0 16.6 3zm2.7 13.6a2.7 2.7 0 0 1-2.7 2.7H7.4a2.7 2.7 0 0 1-2.7-2.7V7.4a2.7 2.7 0 0 1 2.7-2.7h9.2a2.7 2.7 0 0 1 2.7 2.7z" /></>,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    url: '',
    icon: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.75-1.75C18.3 5 12 5 12 5s-6.3 0-7.85.45A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.75 1.75C5.7 19 12 19 12 19s6.3 0 7.85-.45a2.5 2.5 0 0 0 1.75-1.75A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />,
  },
]
