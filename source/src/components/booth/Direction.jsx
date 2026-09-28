import React from 'react'
import { DIRECTION as D } from '../../data/booth.js'
import { Mark, Stripes, IsoFab, DotMap, Ic, C } from './Art.jsx'

/* The booth's design direction (22 Sep 2026): the colours and where each goes, the one blue, the type and
   its scale per surface, the mark, the stripes, where lines are and are not used, spacing, imagery, and the
   dos and don'ts, each don't drawn next to its do. Content: data/booth.js DIRECTION. */
const FD = "'Poppins','Switzer',sans-serif", FB = "'Urbanist','Instrument Sans',sans-serif", FL = "'League Spartan','Urbanist',sans-serif"

export default function Direction() {
  return (
    <div className="dd">
      <section className="dd-idea">
        <div>
          <h3>{D.idea.h.split(', ')[0]}, <em>{D.idea.h.split(', ')[1]}</em></h3>
          <p>{D.idea.t}</p>
        </div>
        <svg viewBox="0 0 600 420" aria-hidden="true">
          <rect width="600" height="420" fill="#fff" />
          <IsoFab x={330} y={10} w={200} />
          <Mark x={40} y={40} w={170} />
          <Stripes x={40} y={150} w={60} n={3} h={8} gap={6} />
          <text x="40" y="215" fontFamily={FD} fontWeight="600" fontSize="30" fill={C.ink} letterSpacing="-1">Every layer,</text>
          <text x="40" y="252" fontFamily={FD} fontWeight="600" fontSize="30" fill={C.red} letterSpacing="-1">built to class.</text>
          <rect y="370" width="600" height="50" fill={C.navy} />
          <text x="40" y="401" fontFamily={FL} fontWeight="600" fontSize="12" fill="#fff" letterSpacing="2">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
        </svg>
      </section>

      <section className="dd-sec">
        <h3>Colour scheme</h3>
        <div className="dd-share" aria-label="The share of a surface each colour takes">
          {D.colours.map(c => <span key={c.k} style={{ flexGrow: c.share, background: c.hex }} title={`${c.k} ${c.share} %`} />)}
        </div>
        <p className="dd-cap">The share of a typical surface each colour takes. Red stays at about six percent.</p>
        <div className="dd-sw">
          {D.colours.map(c => (
            <div key={c.k} className="dd-swi">
              <span className="dd-chip" style={{ background: c.hex }} />
              <div>
                <b>{c.k}</b>
                <dl>
                  <div><dt>HEX</dt><dd>{c.hex}</dd></div>
                  <div><dt>RGB</dt><dd>{c.rgb}</dd></div>
                  <div><dt>CMYK</dt><dd>{c.cmyk}{c.src === 'est' && <sup title="Converted by us; confirm with the printer's proof">*</sup>}</dd></div>
                </dl>
                <p>{c.use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="dd-cap">CMYK without a star is from IAQ Brand OS v3.1. A star marks our conversion: confirm it on the printer’s proof.</p>
        <div className="dd-blue">
          <svg viewBox="0 0 520 150" aria-hidden="true">
            <rect width="250" height="150" fill="#fff" /><rect y="110" width="250" height="40" fill={C.navy} />
            <Mark x={24} y={24} w={90} /><text x="24" y="92" fontFamily={FD} fontWeight="600" fontSize="16" fill={C.ink}>IAQ’s side</text>
            <rect x="270" width="250" height="150" fill="#fff" /><rect x="270" width="36" height="150" fill="#2B45B8" />
            <text x="322" y="92" fontFamily={FD} fontWeight="600" fontSize="16" fill={C.ink}>Green Excel’s side</text>
            <text x="322" y="116" fontFamily={FB} fontWeight="500" fontSize="12" fill={C.soft}>royal blue, theirs only</text>
          </svg>
          <div><h4>Which blue</h4><p>{D.blue}</p></div>
        </div>
      </section>

      <section className="dd-sec">
        <h3>Type</h3>
        <div className="dd-type">
          {D.type.map(t => (
            <div key={t.k} className="dd-face">
              <span className="dd-spec" style={{ fontFamily: t.k === 'Poppins' ? FD : t.k === 'Urbanist' ? FB : FL, fontWeight: 600, textTransform: t.k === 'League Spartan' ? 'uppercase' : 'none', letterSpacing: t.k === 'League Spartan' ? '.12em' : t.k === 'Poppins' ? '-.03em' : 0 }}>{t.k === 'League Spartan' ? 'Semicon Europa' : 'Built to class'}</span>
              <b>{t.k}</b><small>{t.w}</small>
              <p><strong>{t.role}.</strong> {t.rule}</p>
            </div>
          ))}
        </div>
        <h4 className="dd-h4">Sizes, by surface</h4>
        <table className="dd-tbl">
          <thead><tr><th>Surface</th><th>Headline</th><th>Figures and names</th><th>Text</th><th>Labels</th></tr></thead>
          <tbody>{D.scale.map(r => <tr key={r[0]}>{r.map((c, i) => i ? <td key={i}>{c || '·'}</td> : <th key={i}>{c}</th>)}</tr>)}</tbody>
        </table>
      </section>

      <section className="dd-sec dd-two">
        <div>
          <h3>The mark</h3>
          <ul className="dd-kv">{D.mark.map(([k, v]) => <li key={k}><b>{k}</b><span>{v}</span></li>)}</ul>
        </div>
        <svg viewBox="0 0 520 300" aria-hidden="true" className="dd-marks">
          <rect width="250" height="140" fill="#fff" /><Mark x={40} y={38} w={170} />
          <text x="40" y="126" fontFamily={FB} fontWeight="600" fontSize="12" fill={C.mist}>Lockup A</text>
          <rect x="270" width="250" height="140" fill="#fff" /><Mark x={310} y={24} w={170} />
          <text x="310" y="112" fontFamily={FL} fontWeight="600" fontSize="7.4" fill={C.ink} letterSpacing=".6" textLength="170" lengthAdjust="spacing">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
          <text x="310" y="132" fontFamily={FB} fontWeight="600" fontSize="12" fill={C.mist}>Lockup B, back wall</text>
          <rect y="160" width="250" height="140" fill={C.navy} /><Mark x={40} y={176} w={112} panel pad={0.16} />
          <text x="40" y="288" fontFamily={FB} fontWeight="600" fontSize="12" fill="#9AA6BD">On navy: in a white panel</text>
          <rect x="270" y="160" width="250" height="140" fill={C.red} /><Mark x={310} y={176} w={112} panel pad={0.16} />
          <text x="310" y="288" fontFamily={FB} fontWeight="600" fontSize="12" fill="#fff">On red: in a white panel</text>
        </svg>
      </section>

      <section className="dd-sec dd-two">
        <div>
          <h3>The one graphic device</h3>
          <p className="dd-p">{D.device}</p>
        </div>
        <svg viewBox="0 0 520 160" aria-hidden="true">
          <rect width="160" height="160" fill="#fff" /><Stripes x={30} y={30} w={60} n={3} h={9} gap={7} />
          <text x="30" y="140" fontFamily={FB} fontWeight="600" fontSize="12" fill={C.mist}>Headline marker</text>
          <rect x="180" width="160" height="160" fill={C.red} /><Stripes x={210} y={60} w={100} n={4} h={9} gap={7} fill="#fff" o={0.22} />
          <text x="210" y="140" fontFamily={FB} fontWeight="600" fontSize="12" fill="#fff">Aisle column</text>
          <rect x="360" width="160" height="160" fill="#fff" /><Stripes x={390} y={60} w={100} n={3} h={6} gap={9} fill={C.line} />
          <text x="390" y="140" fontFamily={FB} fontWeight="600" fontSize="12" fill={C.mist}>Back wall, counter</text>
        </svg>
      </section>

      <section className="dd-sec dd-two">
        <div>
          <h3>Where lines are used</h3>
          <h4 className="dd-h4 yes">Yes</h4><ul className="dd-list yes">{D.lines.yes.map(t => <li key={t}>{t}</li>)}</ul>
          <h4 className="dd-h4 no">No</h4><ul className="dd-list no">{D.lines.no.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
        <div>
          <h3>Spacing</h3>
          <ul className="dd-kv">{D.spacing.map(([k, v]) => <li key={k}><b>{k}</b><span>{v}</span></li>)}</ul>
          <svg viewBox="0 0 520 250" aria-hidden="true" className="dd-zones">
            <rect width="520" height="250" fill="#fff" />
            {[['0 to 1000 quiet', 0, 1000, '#F4F6F9'], ['1000 to 1700 facts', 1000, 1700, '#E9EDF3'], ['1700 to 2900 main visual', 1700, 2900, '#DCE2EC'], ['2900 to 3350 headline', 2900, 3350, '#FBE3E4']].map(([t, a, b, f]) => {
              const y = 250 - b / 3472 * 250, hh = (b - a) / 3472 * 250
              return <g key={t}><rect x="0" y={y} width="520" height={hh} fill={f} /><text x="12" y={y + hh / 2 + 4} fontFamily={FB} fontWeight="600" fontSize="12" fill={C.soft}>{t} mm</text></g>
            })}
            <rect y={250 - 250 / 3472 * 250} width="520" height={250 / 3472 * 250} fill={C.navy} />
          </svg>
        </div>
      </section>

      <section className="dd-sec">
        <h3>Imagery and icons</h3>
        <div className="dd-img">
          {D.imagery.map(([k, v]) => <div key={k}><b>{k}</b><span>{v}</span></div>)}
        </div>
        <div className="dd-ics">
          {[['crane', 'EPC'], ['link', 'PCU & TTI'], ['power', 'EFM'], ['compass', 'Design'], ['crate', 'Procurement'], ['gauge', 'Commissioning'], ['gear', 'Maintenance']].map(([n, l], i) => (
            <span key={n + l}><svg viewBox="0 0 48 48" aria-hidden="true"><Ic name={n} x={4} y={4} s={40} color={i < 3 ? C.red : C.ink} /></svg>{l}</span>
          ))}
        </div>
      </section>

      <section className="dd-sec dd-dd">
        <div>
          <h3>Do</h3>
          <ul className="dd-list yes">{D.dos.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
        <div>
          <h3>Do not</h3>
          <ul className="dd-list no">{D.donts.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
      </section>

      <section className="dd-sec">
        <h3>Side by side</h3>
        <div className="dd-pairs">
          {PAIRS.map(p => (
            <figure key={p.k}>
              <div className="dd-pair">
                <div className="ok"><svg viewBox="0 0 200 130" aria-hidden="true">{p.ok}</svg><span>Do</span></div>
                <div className="bad"><svg viewBox="0 0 200 130" aria-hidden="true">{p.bad}</svg><span>Do not</span></div>
              </div>
              <figcaption>{p.k}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}

const T = (x, y, s, t, fill = C.ink, f = FD, w = 600, extra = {}) => <text x={x} y={y} fontFamily={f} fontWeight={w} fontSize={s} fill={fill} {...extra}>{t}</text>
const PAIRS = [
  { k: 'The mark on navy', ok: <><rect width="200" height="130" fill={C.navy} /><Mark x={48} y={36} w={80} panel pad={0.16} /></>, bad: <><rect width="200" height="130" fill={C.navy} /><Mark x={52} y={44} w={96} /></> },
  { k: 'Red is one signal', ok: <><rect width="200" height="130" fill="#fff" />{T(18, 40, 16, 'Controlled')}{T(18, 60, 16, 'environments,')}{T(18, 80, 16, 'built to class.', C.red)}<rect y="110" width="200" height="20" fill={C.navy} /></>, bad: <><rect width="200" height="130" fill={C.red} />{T(18, 40, 16, 'Controlled', '#fff')}{T(18, 60, 16, 'environments,', '#fff')}<rect x="18" y="68" width="118" height="22" fill="#fff" />{T(24, 84, 14, 'built to class.', C.red)}</> },
  { k: 'Separate with space and the plinth', ok: <><rect width="200" height="130" fill="#fff" />{T(18, 40, 15, 'Headline')}{T(18, 70, 11, 'Text sits one headline height below.', C.soft, FB, 500)}<rect y="108" width="200" height="22" fill={C.navy} /></>, bad: <><rect width="200" height="130" fill="#fff" />{T(18, 40, 15, 'Headline')}<rect x="18" y="50" width="164" height="2" fill={C.ink} />{T(18, 74, 11, 'Text under a rule.', C.soft, FB, 500)}<rect x="10" y="88" width="180" height="30" fill="none" stroke={C.ink} strokeWidth="1.5" /></> },
  { k: 'One blue: Deep Navy', ok: <><rect width="200" height="130" fill="#fff" /><rect y="100" width="200" height="30" fill={C.navy} /><Mark x={18} y={20} w={70} /></>, bad: <><rect width="200" height="130" fill="#fff" /><rect y="100" width="200" height="30" fill="#2B45B8" /><rect x="0" width="10" height="100" fill="#3D6BFF" /><Mark x={26} y={20} w={70} /></> },
  { k: 'Headlines in sentence case', ok: <><rect width="200" height="130" fill="#fff" />{T(18, 60, 18, 'Every layer,')}{T(18, 84, 18, 'built to class.', C.red)}</>, bad: <><rect width="200" height="130" fill="#fff" />{T(18, 60, 14, 'EVERY LAYER, BUILT', C.ink, "'JetBrains Mono',monospace", 700)}{T(18, 82, 14, 'TO CLASS', C.ink, "'JetBrains Mono',monospace", 700)}</> },
  { k: 'Keep the logo as supplied', ok: <><rect width="200" height="130" fill="#fff" /><Mark x={50} y={40} w={100} /></>, bad: <><rect width="200" height="130" fill="#fff" /><g transform="translate(20 30) scale(1.6 .7)"><Mark x={0} y={20} w={100} /></g></> },
]
