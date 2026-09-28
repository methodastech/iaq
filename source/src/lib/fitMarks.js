/* fitMarks · 25 Sep 2026 (Bazil, on the six-service cycle: "icons supposed to be the same size"). The drawn stage
   marks (data/cycleMarks.js) share one 96-unit viewBox and one ground plate, so they are all 74 units wide, but their
   heights run from 22 (the hookup rings, flat) to 74 (the gauge), so at one box size they read as different sizes.
   This measures each drawing once it is on the page and resets its viewBox so the drawings carry the same visual
   weight (equal area, the mean of the set), never wider than the box. Pure presentation: the drawings are untouched.
   A flat object stays flatter than a tall one; only a redraw could change that. */
export function fitMarks(root, selector = 'svg', { pad = 0.06, mode = 'area' } = {}) {
  if (!root) return
  /* the mean is taken over EVERY mark in the root, fitted or not (a bbox is in user units and never changes), so a
     call that arrives while marks are still mounting, or React's double-invoked refs, cannot skew it */
  const all = [...root.querySelectorAll(selector)].map(svg => {
    let b; try { b = svg.getBBox() } catch (e) { return null }
    return b && b.width > 0 && b.height > 0 ? { svg, b } : null
  }).filter(Boolean)
  const items = all.filter(it => !it.svg.dataset.fit)
  if (!items.length) return
  const mean = all.reduce((a, it) => a + it.b.width * it.b.height, 0) / all.length
  items.forEach(({ svg, b }) => {
    const vb = (svg.getAttribute('viewBox') || '0 0 96 96').split(/[\s,]+/).map(Number)
    const vbW = vb[2] || 96
    let side = mode === 'area' ? vbW * Math.sqrt((b.width * b.height) / mean) : Math.max(b.width, b.height)
    side = Math.max(side, Math.max(b.width, b.height) * (1 + pad * 2))
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    svg.setAttribute('viewBox', `${(cx - side / 2).toFixed(2)} ${(cy - side / 2).toFixed(2)} ${side.toFixed(2)} ${side.toFixed(2)}`)
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.dataset.fit = '1'
  })
}
