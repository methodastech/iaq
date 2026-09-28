import sys, re, html, json, os
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text=[]; self.imgs=[]; self.links=[]; self.skip=0; self.cur=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ('script','style','noscript'): self.skip+=1
        if tag=='img':
            src=a.get('src') or a.get('data-src') or a.get('data-lazy-src') or ''
            srcset=a.get('srcset') or a.get('data-srcset') or ''
            self.imgs.append({'src':src,'alt':a.get('alt',''),'srcset':srcset[:300]})
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('p','h1','h2','h3','h4','li','br','div','tr'): self.text.append('\n')
        if tag=='meta' and a.get('property') in ('og:image','og:title','og:description','article:published_time','article:modified_time'):
            self.text.append(f"\n[META {a.get('property')}] {a.get('content','')}\n")
    def handle_endtag(self, tag):
        if tag in ('script','style','noscript'): self.skip-=1
    def handle_data(self, d):
        if self.skip==0:
            self.text.append(d)

for f in sys.argv[1:]:
    p=P(); p.feed(open(f,encoding='utf-8',errors='ignore').read())
    t=html.unescape(''.join(p.text)); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    base=os.path.basename(f).replace('.html','')
    open(f'raw/{base}.txt','w').write(t)
    imgs=[i for i in p.imgs if i['src'] and 'uploads' in i['src']]
    open(f'raw/{base}.imgs.json','w').write(json.dumps(imgs,indent=1))
    links=sorted(set(l for l in p.links if 'iaqtechnology' in l))
    open(f'raw/{base}.links.txt','w').write('\n'.join(links))
    print(f"== {base}: {len(t)} chars, {len(imgs)} upload imgs, {len(links)} site links")
