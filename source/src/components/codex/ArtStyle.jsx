import React from 'react'
import ValueMotion from '../ValueMotion.jsx'
import { VALUES } from '../../data/values.js'
import '../../styles/culture.css'
import '../../styles/codex.css'

/* 25 Sep, night (Bazil: "save this animation style in Codex", "and art style"): the value marks from the Culture page,
   live, with the rules they are drawn and moved by, so every new mark on the site starts from them */
const ART_RULES = [
  ['Ground', 'A dotted drafting ground: one dot every 12 units, #C3CBD8 at 55%. No box, no shadow, no gradient behind the mark.'],
  ['Line', 'Ink line work at 1.6, butt caps and mitre joins; fine detail at 0.8, emphasis at 2.2. Fills are white or one pale grey, #E6EAF1.'],
  ['Colour', 'Everything is ink except the one element that moves, which is IAQ red. One red thing per scene.'],
  ['Number', 'The plain number, top right, light ink at 16%. No prefix, no box.'],
  ['Scale', 'Drawn on a 240 by 160 sheet, centred, shown at the card\u2019s full width.'],
]
const MOTION_RULES = [
  ['One movement', 'Each scene says its idea in one movement: a count runs the ring, rows tick then the seal lands, the balance swings and settles, a cursor draws then dimensions, the needle overshoots and settles in its band, the podium builds and the trophy fills.'],
  ['Pace', 'About six seconds a loop: the movement, a settle with ease-out, then a hold on the finished drawing before it runs again.'],
  ['Stagger', 'Cards in a row start a beat apart, so the grid never moves in unison.'],
  ['When', 'Only while the card is on screen. Off screen, and under reduced motion, the finished drawing is the still.'],
]
export default function ArtStyle() {
  return (
    <section className="pg-sec cx-part cx-art" aria-labelledby="cx-hart" id="art-style">
      <div className="pg-in">
        <h2 id="cx-hart">Art and motion. <em>How a mark is drawn and moved.</em></h2>
        <p className="pg-lede">The six value marks from the Culture page, running live. Every new mark on the site starts from these rules.</p>
        <div className="cu-vgrid cx-art-grid">
          {VALUES.map((v, i) => (
            <article className="cu-vc" key={v.ix}>
              <span className="cu-vc-top"><ValueMotion k={v.ix} i={i} /><span className="cu-vc-ix">{i + 1}</span></span>
              <h3>{v.title}</h3>
            </article>
          ))}
        </div>
        <div className="cx-art-rules">
          <div><h3>Art style</h3><dl>{ART_RULES.map(([k, t]) => <div key={k}><dt>{k}</dt><dd>{t}</dd></div>)}</dl></div>
          <div><h3>Animation style</h3><dl>{MOTION_RULES.map(([k, t]) => <div key={k}><dt>{k}</dt><dd>{t}</dd></div>)}</dl></div>
        </div>
      </div>
    </section>
  )
}

