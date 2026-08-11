import { GROUPS, PAGES, ROUTES_BY_AUDIENCE, byId, pagesInGroup, linksInto, orphans } from './src/data/sitemap.js'
import { writeFileSync } from 'fs'

const L = []
L.push('# IAQ website framework\n')
L.push('Generated from `src/data/sitemap.js`. Regenerate with `node scripts_gen_framework.mjs`. Do not hand-edit.\n')
L.push(`**${PAGES.length} page types** across **${GROUPS.length} groups**. Status: ${PAGES.filter(p=>p.status==='live').length} live, ${PAGES.filter(p=>p.status==='new').length} added this phase, ${PAGES.filter(p=>p.status==='gated').length} gated.\n`)

L.push('## Page flow at a glance\n')
L.push('| # | Group | Page | Route | Links out to | One action |')
L.push('|---|---|---|---|---|---|')
for (const g of GROUPS) for (const p of pagesInGroup(g.id)) {
  const outs = (p.linksOut||[]).map(id => byId(id)?.label).filter(Boolean).join(', ')
  L.push(`| ${g.no} | ${g.name} | ${p.label} | \`${p.route}\` | ${outs} | ${p.cta.label} |`)
}

L.push('\n## Audience routes\n')
for (const r of ROUTES_BY_AUDIENCE) L.push(`- **${r.name}**: ${r.path.map(id => byId(id)?.label).join(' → ')}`)

L.push('\n## Every page in detail\n')
for (const g of GROUPS) {
  L.push(`### ${g.no} ${g.name}\n\n${g.blurb}\n`)
  for (const p of pagesInGroup(g.id)) {
    L.push(`#### ${p.label} \`${p.route}\`${p.status !== 'live' ? ` _(${p.status})_` : ''}\n`)
    L.push(`${p.purpose}\n`)
    L.push(`- **Blocks:** ${p.blocks.join(' · ')}`)
    L.push(`- **Action:** ${p.cta.label} → \`${p.cta.route}\``)
    L.push(`- **Links out:** ${(p.linksOut||[]).map(id => byId(id)?.label).filter(Boolean).join(', ') || 'none'}`)
    const ins = linksInto(p.id).map(id => byId(id)?.label).filter(Boolean)
    L.push(`- **Linked from:** ${ins.join(', ') || '**ORPHAN**'}\n`)
  }
}

const o = orphans()
L.push('\n## Interlinking check\n')
L.push(o.length === 0 ? '- Rule 05 (nothing orphaned): **passing**, every page has an inbound link.' : `- Rule 05: **${o.length} orphaned** — ${o.join(', ')}`)
writeFileSync('FRAMEWORK.md', L.join('\n'))
console.log('FRAMEWORK.md written,', PAGES.length, 'pages, orphans:', o.length)
