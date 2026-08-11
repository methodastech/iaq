import React from 'react'

/* One line-icon set for the framework diagram, drawn on a single 24 grid at one stroke weight. */
const P = {
  home:     <><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-6h4v6" /></>,
  building: <><rect x="4" y="4" width="16" height="16" /><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" /></>,
  clock:    <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
  people:   <><circle cx="9" cy="9" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 6.5a3 3 0 0 1 0 5.9" /><path d="M18 14.5c1.8.9 3 2.7 3 5.5" /></>,
  /* food & beverage is a production line, not a dinner service: a filled bottle, not a cloche */
  bottle:   <><path d="M10 3h4" /><path d="M10.5 3v2.6c0 1-.6 1.6-1.3 2.4C8.4 8.9 8 9.8 8 11v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8c0-1.2-.4-2.1-1.2-3-.7-.8-1.3-1.4-1.3-2.4V3" /><path d="M8 14c1.3 0 1.3 1 2.7 1s1.3-1 2.7-1 1.3 1 2.6 1" /></>,
  leaf:     <><path d="M20 4c0 8-5 12-11 12H5c0-7 5-12 11-12z" /><path d="M5 20c2-5 5-8 10-10" /></>,
  mail:     <><rect x="3" y="5" width="18" height="14" /><path d="m3 6 9 7 9-7" /></>,
  cycle:    <><path d="M20 12a8 8 0 1 1-3-6.2" /><path d="M20 4v5h-5" /></>,
  compass:  <><circle cx="12" cy="12" r="8" /><path d="m15 9-2.5 5.5L7 17l2.5-5.5z" /></>,
  crate:    <><rect x="4" y="7" width="16" height="12" /><path d="M4 11h16M10 7v12M14 7v12" /><path d="m6 7 2-3h8l2 3" /></>,
  crane:    <><path d="M5 20V5h11" /><path d="M16 5v4" /><path d="M5 9h6" /><path d="M14 9h4v3h-4z" /><path d="M3 20h8" /></>,
  gauge:    <><path d="M4 17a8 8 0 1 1 16 0" /><path d="m12 17 4-5" /><circle cx="12" cy="17" r="1.4" /></>,
  gear:     <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" /></>,
  grid:     <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
  chip:     <><rect x="7" y="7" width="10" height="10" /><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" /></>,
  server:   <><rect x="3" y="4" width="18" height="6" /><rect x="3" y="14" width="18" height="6" /><path d="M7 7h.01M7 17h.01" /></>,
  battery:  <><rect x="3" y="7" width="16" height="10" rx="1" /><path d="M21 10v4" /><path d="m12 9-2 3h3l-2 3" /></>,
  sun:      <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
  snow:     <><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" /></>,
  flask:    <><path d="M10 3h4" /><path d="M11 3v6l-5 9a2 2 0 0 0 1.8 3h8.4A2 2 0 0 0 18 18l-5-9V3" /><path d="M8.5 15h7" /></>,
  folder:   <><path d="M3 7h6l2 2h10v10H3z" /></>,
  file:     <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></>,
  globe:    <><circle cx="12" cy="12" r="8" /><path d="M4 12h16" /><path d="M12 4c2.5 2.5 3.5 5.5 3.5 8s-1 5.5-3.5 8c-2.5-2.5-3.5-5.5-3.5-8s1-5.5 3.5-8z" /></>,
  press:    <><rect x="3" y="5" width="14" height="14" /><path d="M17 9h4v8a2 2 0 0 1-4 0z" /><path d="M6 9h8M6 12h8M6 15h5" /></>,
  chart:    <><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>,
  shield:   <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  cube:     <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" /></>,
  factory:  <><path d="M3 20V10l5 3V10l5 3V6l6 3v11z" /><path d="M7 20v-3M12 20v-3M17 20v-3" /></>,
  arrow:    <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  link:     <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>,
}

export default function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] || P.file}
    </svg>
  )
}
