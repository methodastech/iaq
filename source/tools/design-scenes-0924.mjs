/* 24 Sep (Bazil: "this design, animation and style should be shared at the design tab as well").
   Renders the six drawn value scenes (src/components/ValueMotion.jsx) to static SVG, inlines their stylesheet, and
   writes a "Drawn scenes" block into the Motion section of public/design.html between the scenes markers.
   Idempotent: node tools/design-scenes-0924.mjs */
import fs from 'node:fs'
import path from 'node:path'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const tmp = path.resolve('.scenes-tmp.mjs')
await build({ entryPoints: ['src/components/ValueMotion.jsx'], bundle: true, format: 'esm', outfile: tmp, jsx: 'automatic',
  external: ['react', 'react-dom'], loader: { '.css': 'empty' }, logLevel: 'silent' })
const { default: ValueMotion } = await import('file://' + tmp)
fs.unlinkSync(tmp)
const VALUES = [
  ['V·01', 'Safety commitment', 'A hard hat inside a manhours dial. The red count runs the full ring, then the tick lands.'],
  ['V·02', 'Quality consistency', 'An inspection sheet. Each row is ticked in turn, then the ISO 9001 seal lands.'],
  ['V·03', 'Honesty & integrity', 'A balance with a weight against a document. It swings, then settles level, and the level shows in red.'],
  ['V·04', 'Engineering capabilities', 'A cleanroom section drawn by a cursor: envelope, floor, ceiling, fan filter units, tools, then the dimension line.'],
  ['V·05', 'Efficiency & proficiency', 'A gauge. The needle overshoots, corrects, and holds inside the red target band; the bar below follows it.'],
  ['V·06', 'Pursuit of excellence', 'A podium builds in three steps, the trophy lands and fills red, and it catches the light.'],
]
const css = fs.readFileSync('src/styles/value-motion.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n')
const tiles = VALUES.map(([k, title, what], i) => {
  const svg = renderToStaticMarkup(React.createElement(ValueMotion, { k, i }))
  return `      <figure class="dsc-t">
        <div class="dsc-stage">${svg}</div>
        <figcaption><b>${String(i + 1).padStart(2, '0')} · ${title}</b><span>${what}</span></figcaption>
      </figure>`
}).join('\n')

const block = `<!-- scenes:start -->
    <div id="scenes" class="dsc" style="--blue:#EC2027;--blue-bright:#FF3B42;--ink:#0C1220;--bg:#F7F9FC;--line:rgba(12,18,32,.1)">
    <style>
${css}
    .dsc{margin-top:clamp(40px,5vw,72px)}
    .dsc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:22px}
    .dsc-t{margin:0;background:#fff;display:flex;flex-direction:column}
    .dsc-stage{height:196px;background:#F7F9FC;overflow:hidden}
    .dsc-t figcaption{padding:14px 16px 18px;font-size:13.5px;line-height:1.5;color:#4A4A4A}
    .dsc-t figcaption b{display:block;font-family:"Switzer",sans-serif;font-weight:600;font-size:15px;color:#101010;margin-bottom:4px}
    .dsc-rules{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 28px;margin-top:26px;font-size:13.5px;line-height:1.5;color:#4A4A4A}
    .dsc-rules b{display:block;font-family:"Switzer",sans-serif;font-weight:600;font-size:14.5px;color:#101010;margin-bottom:3px}
    .dsc-rules code{font-family:"JetBrains Mono",monospace;font-size:11.5px;color:#B5121B}
    @media(max-width:980px){.dsc-grid,.dsc-rules{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:640px){.dsc-grid,.dsc-rules{grid-template-columns:1fr}}
    </style>
    <div class="mo-hd"><b>Drawn scenes</b><span>The six value cards on Careers. A static glyph cannot carry an abstract value, so each value is a small technical drawing whose ONE movement, in IAQ red, says what the value means. Live below, on the same code the site runs.</span></div>
    <div class="dsc-grid">
${tiles}
    </div>
    <div class="dsc-rules">
      <div><b>The frame</b>A 240 by 160 drafting ground with a dotted grid, <code>preserveAspectRatio="xMidYMid meet"</code>, so the scene scales with its card and never crops.</div>
      <div><b>The line</b>Ink at 1.6, butt caps, mitre joins, no fill on the line work. Plates are <code>#E6EAF1</code>, paper is white. Same grammar as the interface icons and the record marks.</div>
      <div><b>One red, one movement</b>Exactly one element is IAQ red and it is the thing that moves: the count, the ticks and seal, the level, the cursor and dimension, the needle and band, the trophy fill. Nothing else animates.</div>
      <div><b>The loop</b>6 to 7 seconds per scene (<code>--vmd</code>), each part on its own keyframes, and a short dip to <code>.18</code> at the end so the reset reads as a breath, not a jump.</div>
      <div><b>Only on screen</b><code>IntersectionObserver</code> at <code>threshold: .35</code> adds <code>.is-live</code>; every animation rule sits under it, so a card off screen costs nothing. Under reduced motion the finished drawing is the still.</div>
      <div><b>Its own clock</b>Each card carries <code>--vmi</code> and the last rule in the sheet, <code>.vm.is-live :is([class])</code>, sets a negative delay from it. It must stay last: an <code>animation:</code> shorthand on any element resets the delay, which is how six cards once blanked together.</div>
      <div><b>Where it lives</b><code>src/components/ValueMotion.jsx</code> draws the scenes, <code>src/styles/value-motion.css</code> moves them. This block is generated from both by <code>tools/design-scenes-0924.mjs</code>; re-run it after any edit.</div>
      <div><b>Adding a scene</b>Draw on the 240 by 160 grid, centre the subject, put the moving part in a <code>&lt;g&gt;</code> with its own class, give it one keyframe set under <code>.vm-NN.is-live</code>, and keep the red to that part.</div>
      <div><b>What it replaced</b>Isometric objects ("very bad on symbolising"), then flat marks in a tinted square ("wants either video or top level animation"). The rule that came out of it: for an abstract value, a drawn scene with one meaningful movement, or real footage, before any icon.</div>
    </div>
    <script>
    (function(){var els=document.querySelectorAll('#scenes .vm');if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('is-live',e.isIntersecting)})},{threshold:.35});
      els.forEach(function(el){io.observe(el)})})();
    </script>
    </div>
<!-- scenes:end -->`

let html = fs.readFileSync('public/design.html', 'utf8')
if (/<!-- scenes:start -->[\s\S]*?<!-- scenes:end -->/.test(html)) html = html.replace(/<!-- scenes:start -->[\s\S]*?<!-- scenes:end -->/, block)
else {
  const anchor = '  </section>\n\n  <!-- ==================== 12 ACCESSIBILITY'
  if (!html.includes(anchor)) throw new Error('anchor not found')
  html = html.replace(anchor, block + '\n' + anchor)
}
fs.writeFileSync('public/design.html', html)
console.log('design.html: scenes block written,', tiles.split('<figure').length - 1, 'tiles')
