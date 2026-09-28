import React, { useId } from 'react'
import '../styles/value-motion.css'

/* ============================================================================
   The three pillar drawings on the Corporate Commitment page, second cut, 25 Sep 2026 (Bazil, on
   the first: "why are our icons so bad looking"). They are drawn in the language that passed on the
   Culture page (ValueMotion.jsx): ink line work on a dotted drafting ground, butt caps, mitre joins,
   a 240 x 160 sheet, and IAQ red for the ONE movement that says what the pillar means:
     Environmental responsibility  a bar chart of energy use, year on year; the red trend line draws
                                   down the bar tops and lands on the target band
     Social accountability         three people; a red ring draws itself round them and the
                                   safe-and-sound badge lands
     Corporate governance          a balance with policy on one pan and practice on the other; it
                                   swings, settles level, and the red level mark confirms it
   Loops run only while the tile is on screen (.cc-tile.live, set by the page) and never under
   reduced motion, where the finished drawing is the still. Motion rules in commitment.css.
   ========================================================================= */

function Sheet ({ cls, children }) {
  const gid = useId().replace(/:/g, '')
  return (
    <span className={'vm cc-vm ' + cls} aria-hidden="true">
      <svg viewBox="0 0 240 160">
        <defs>
          <pattern id={gid} width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" /></pattern>
        </defs>
        <rect className="vm-grid" x="0" y="0" width="240" height="160" fill={`url(#${gid})`} />
        {children}
      </svg>
    </span>
  )
}

export function MarkEnv () {
  return (
    <Sheet cls="cc-vm-env">
      <path className="i o5" d="M40 130H212M40 130V28" />
      <path className="i o35" d={['M36 30H40', 'M36 55H40', 'M36 80H40', 'M36 105H40'].join('')} />
      <rect className="i f" x="56" y="52" width="20" height="78" />
      <rect className="i f" x="88" y="64" width="20" height="66" />
      <rect className="i f" x="120" y="78" width="20" height="52" />
      <rect className="i f" x="152" y="94" width="20" height="36" />
      <rect className="i f" x="184" y="106" width="20" height="24" />
      <path className="r dash o5" d="M40 106H212" />
      <path className="r w22 trend" pathLength="1" d="M66 52L98 64L130 78L162 94L194 106" />
      <circle className="rf mark" cx="194" cy="106" r="4" />
      <text className="st2" x="126" y="150">ENERGY USE, YEAR ON YEAR</text>
    </Sheet>
  )
}

export function MarkSocial () {
  return (
    <Sheet cls="cc-vm-soc">
      <path className="i o5" d="M52 116H188" />
      <circle className="i w" cx="92" cy="66" r="9" />
      <path className="i f" d="M72 116V104a20 20 0 0 1 40 0v12" />
      <circle className="i w" cx="120" cy="58" r="10" />
      <path className="i f" d="M98 116V100a22 22 0 0 1 44 0v16" />
      <circle className="i w" cx="148" cy="66" r="9" />
      <path className="i f" d="M128 116V104a20 20 0 0 1 40 0v12" />
      <ellipse className="r w18 ring" pathLength="1" cx="120" cy="88" rx="66" ry="44" />
      <g className="badge">
        <circle className="rf" cx="180" cy="44" r="11" />
        <path className="wk" d="M174 44l4 4 8-8" />
      </g>
      <text className="st2" x="120" y="150">PEOPLE AND COMMUNITY, SAFE</text>
    </Sheet>
  )
}

export function MarkGov () {
  return (
    <Sheet cls="cc-vm-gov">
      <path className="i o5" d="M84 132H156" />
      <path className="i" d="M120 132V56" />
      <path className="i f" d="M112 132l8-14 8 14z" />
      <g className="beam">
        <path className="i w22" d="M60 56H180" />
        <path className="i" d="M60 56v26M180 56v26" />
        <path className="i" d="M44 82h32M164 82h32" />
        <rect className="i f" x="53" y="62" width="14" height="18" />
        <path className="i w08" d="M56 68h8M56 72h8M56 76h5" />
        <path className="i f" d="M172 80l4-14h8l4 14z" />
      </g>
      <circle className="i w" cx="120" cy="56" r="4" />
      <path className="r w22 level" d="M96 46H144" />
      <circle className="rf plumb" cx="120" cy="46" r="3" />
      <text className="st2" x="120" y="150">POLICY, HELD IN PRACTICE</text>
    </Sheet>
  )
}
