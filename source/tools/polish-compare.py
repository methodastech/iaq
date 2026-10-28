"""22 Oct 2026: marks which sections changed between the before and after section captures (tools/polish-sections.mjs).
A section counts as changed when its text differs, its height differs by more than 6 px, or the two images differ by more
than a small mean pixel difference (so a numeral drawn by CSS counts, but a video frame at a different moment does not
on its own: the hero loops are compared on their text and height only). Writes `changed` into each after section.
Usage: python3 tools/polish-compare.py public/polish/before public/polish/after [slug ...]"""
import sys, os, json
from PIL import Image, ImageChops, ImageStat
B, A = sys.argv[1], sys.argv[2]
slugs = sys.argv[3:] or [f[:-5] for f in os.listdir(A) if f.endswith('.json') and f != 'index.json']
def diff(pa, pb):
    try:
        a = Image.open(pa).convert('L'); b = Image.open(pb).convert('L')
    except Exception: return 99
    if a.size != b.size: return 99
    w = 480; h = max(1, int(a.height * w / a.width))
    a = a.resize((w, h)); b = b.resize((w, h))
    return ImageStat.Stat(ImageChops.difference(a, b)).mean[0]
for slug in slugs:
    pb, pa = f'{B}/{slug}.json', f'{A}/{slug}.json'
    if not (os.path.exists(pb) and os.path.exists(pa)): print(slug, 'missing'); continue
    bf, af = json.load(open(pb)), json.load(open(pa))
    if 'sections' not in bf or 'sections' not in af: continue   # 23 Oct: index.json and states.json sit beside the pages
    n = 0
    for i, s in enumerate(af['sections']):
        m = next((x for x in bf['sections'] if x['key'] == s['key']), None) or (bf['sections'][i] if i < len(bf['sections']) else None)
        if not m: s['changed'] = True; n += 1; continue
        video = s['key'] == 'hero' or 'reel' in s.get('cls', '')
        textChanged = s['text'] != m['text']; heightChanged = abs(s['height'] - m['height']) > 6
        strip = lambda t: '\n'.join(l[:-1] if l.endswith('.') else l for l in t.split('\n'))
        fullstopOnly = textChanged and strip(s['text']) == strip(m['text'])
        pix = 0 if video else diff(f'{B}/{m["img"]}', f'{A}/{s["img"]}')
        s['changed'] = bool(textChanged or heightChanged or pix > 0.6)
        s['diff'] = {'text': textChanged, 'height': s['height'] - m['height'], 'pixels': round(pix, 2)}
        if fullstopOnly and abs(s['height'] - m['height']) <= 6 and pix <= 2.5: s['reason'] = 'fullstop'
        if s['changed']: n += 1
    json.dump(af, open(pa, 'w'), indent=1)
    print(slug.ljust(34), 'changed', n, 'of', len(af['sections']), ' '.join(s['key'] for s in af['sections'] if s['changed']))
