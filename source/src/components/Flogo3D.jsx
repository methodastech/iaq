import React from 'react'

/* The stacked-layer 3D wordmark, extracted from <Footer> so it can sit wherever the brand
   block sits (2 Sep, client: "put iaq logo at the top left"). Same extrusion as the nav mark:
   seven darkened copies pushed back on Z, one face on top. The dark-mark asset carries the
   white ®, which is why this is the footer twin and not the nav's. Decorative only, so it is
   hidden from assistive tech and the adjacent text carries the name. */
export default function Flogo3D({ className = '' }) {
  return (
    <span className={'flogo3d ' + className} aria-hidden="true">
      <span className="flogo3d-in">
        {[-8.4, -7.2, -6, -4.8, -3.6, -2.4, -1.2].map(z => (
          <img key={z} className="fldepth" src="/assets/iaq-logo-dark.webp" alt=""
               style={{ transform: `translateZ(${z}px)` }} loading="lazy" decoding="async" />
        ))}
        <img className="flface" src="/assets/iaq-logo-dark.webp" alt="" loading="lazy" decoding="async" />
      </span>
    </span>
  )
}
