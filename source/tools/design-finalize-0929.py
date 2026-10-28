"""29 Sep: page-wide pass on public/design.html after the generator: no typewriter faces, no numbering in the type ladder,
no middle dots between items. The shared super admin bar (div.bmws) is left exactly as it is on every tab."""
import re
P='public/design.html'; s=open(P,encoding='utf-8').read()
m=re.search(r'<div class="bmws".*?</nav></div></div>', s, re.S); bar=m.group(0) if m else None
if bar: s=s.replace(bar,'@@BMWS@@',1)
n0=s.count('JetBrains')
s=s.replace('&family=JetBrains+Mono:wght@400;500;700','')
for stack in ['"JetBrains Mono", ui-monospace, monospace','"JetBrains Mono",ui-monospace,monospace','"JetBrains Mono",monospace',"'JetBrains Mono',monospace"]:
    s=s.replace(stack,'"Switzer",sans-serif')
s=re.sub(r'ui-monospace\s*,\s*(?:SFMono-Regular\s*,\s*)?(?:Menlo\s*,\s*)?(?:Consolas\s*,\s*)?(?:"Liberation Mono"\s*,\s*)?monospace','"Switzer",sans-serif',s)
s=re.sub(r'font-family:\s*monospace','font-family:"Switzer",sans-serif',s)
# SVG attributes: a family inside a double-quoted attribute takes no inner quotes
s=re.sub(r'font-family="[^"]*"Switzer",sans-serif"','font-family="Switzer, sans-serif"',s)
# the type ladder: no "01 · " in front of the names
s=re.sub(r'(<span class="tsc-k">)\d{2}\s*&middot;\s*',r'\1',s)
# no middle dots between items, in page text (not inside scripts)
parts=re.split(r'(<script[\s\S]*?</script>|<style[\s\S]*?</style>)',s)
for i in range(0,len(parts),2):
    parts[i]=re.sub(r'<i>V&middot;0\d</i>','',re.sub(r'\s&middot;(?=\s)',',',parts[i].replace(' &middot; ',', ').replace('&nbsp;&middot;&nbsp;',', ').replace(' · ',', ')))
s=''.join(parts)
if bar: s=s.replace('@@BMWS@@',bar,1)
open(P,'w',encoding='utf-8').write(s)
print('JetBrains before', n0, 'after', s.count('JetBrains'), '| monospace left', len(re.findall(r'monospace',s)), '| middots left outside bar', s.replace(bar or '','').count('&middot;'))
