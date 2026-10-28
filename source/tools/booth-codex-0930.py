#!/usr/bin/env python3
"""Exhibition codex, 30 Sep 2026 (Bazil, on /portal/booth: "have a codex download for this").

Writes, from the booth data and the exported files only (nothing is copied by hand, so a rerun after any artwork change
is current):
  public/booth/iaq-exhibition-print-files.zip  every print PDF in public/booth/print: the exhibition print and the live
                                               directions by folder, the rejected directions under rejected/, a README.txt
  public/booth/iaq-exhibition-codex.html       one self-contained document that opens offline: Switzer and Instrument
                                               Sans embedded, every picture a WebP data URI (walls at most 1600 px wide,
                                               the rest 1200 px, the rejected directions smaller)
  src/data/boothCodex.js                       the two files' sizes and the date, read by the download bar on /portal/booth
                                               (components/booth/CodexDownload.jsx)

Sources: src/data/booth.js, src/components/booth/sets.js and Print.jsx, read through esbuild so the codex uses the same
registry the portal draws with (LIVE, REJECTED, SETS, PIECES, PRINT_SETS); public/booth/png (the art, from
tools/render-booth-art-0922.mjs); public/booth/print (the PDFs, from tools/export-booth-print-0922.mjs, bleed read off
each page); public/booth/screen-*.webp (the screen's chapters).

Run from the project root, after any export:  python3 tools/booth-codex-0930.py
Check offline:  node tools/_bundle-offline-check.mjs "$PWD/public/booth/iaq-exhibition-codex.html" <outdir>
The launch build never carries these: public/booth is pruned (tools/prune-launch.mjs) and the portal chunk is not built.
"""
import os, re, io, sys, json, base64, zipfile, datetime, tempfile, subprocess, urllib.request, html as H
from PIL import Image
try:
    import fitz  # PyMuPDF, for the bleed of each PDF
except ImportError:
    fitz = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PUB = 'public'
PNG = 'public/booth/png'
PDF_DIR = 'public/booth/print'
PDF_PRE = 'IAQ-SEMICON-2026-'
OUT_HTML = 'public/booth/iaq-exhibition-codex.html'
OUT_ZIP = 'public/booth/iaq-exhibition-print-files.zip'
OUT_DATA = 'src/data/boothCodex.js'
WORDMARK = 'public/design/iaq-official.png'   # the Design tab's official light file: red letters, black ®
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'}
TODAY = datetime.date.today()
WARN = []

# ---------------------------------------------------------------------------------------------- the data, as the portal reads it
ENTRY = r'''
import * as B from '__ROOT__/src/data/booth.js'
import { LIVE, REJECTED, DIRS, DEFAULT_DIR, SETS, SFX, ALL_PIECES, pieceId } from '__ROOT__/src/components/booth/sets.js'
import { PRINT_SETS, PIECES_PRINT } from '__ROOT__/src/components/booth/Print.jsx'
import { ADS } from '__ROOT__/src/components/booth/Art.jsx'
const strip = o => JSON.parse(JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v))
const pieces = Object.fromEntries(Object.entries(ALL_PIECES).map(([id, p]) => [id, { w: p.w, h: p.h, unit: p.unit, k: p.k, print: !!p.print }]))
const IDS = ['w1', 'w2', 'w3', 'ct', 'post1', 'post2', 'post3', 'post4', 'sig', ...ADS.map(s => 'ad' + s.join('x'))]
const sets = Object.fromEntries(DIRS.map(d => [d, { flyer: { ids: SETS[d].flyer.ids, h: SETS[d].flyer.h, t: SETS[d].flyer.t }, roll: { id: SETS[d].roll.id, cap: SETS[d].roll.cap },
  surf: strip(SETS[d].surf), pieces: Object.keys(SETS[d].pieces), ids: Object.fromEntries(IDS.map(x => [x, pieceId(d, x)])) }]))
const files = B.FILES.map(f => ({ k: f.k, src: f.src, pdf: !!f.pdf, paths: f.n ? Array.from({ length: f.n }, (_, i) => f.f(i + 1)) : [f.f()] }))
console.log(JSON.stringify({ ...strip(B), FILES: files, LIVE, REJECTED, DIRS, DEFAULT_DIR, SFX, ADS, PIECES: pieces, SETS: sets, PRINT_SETS: strip(PRINT_SETS), PIECES_PRINT: strip(PIECES_PRINT) }))
'''
BUILD = r'''
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
const esbuild = createRequire(process.argv[4] + '/package.json')('esbuild')
const [entry, out] = process.argv.slice(2)
await esbuild.build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', loader: { '.js': 'jsx' }, outfile: out, logLevel: 'error',
  nodePaths: [process.argv[4] + '/node_modules'],
  plugins: [{ name: 'vite-queries', setup(b) {
    b.onResolve({ filter: /\?(raw|url)$/ }, a => ({ path: path.resolve(a.resolveDir, a.path.replace(/\?(raw|url)$/, '')), namespace: a.path.endsWith('?raw') ? 'raw' : 'stub' }))
    b.onLoad({ filter: /.*/, namespace: 'raw' }, a => ({ contents: fs.readFileSync(a.path, 'utf8'), loader: 'text' }))
    b.onResolve({ filter: /\.(css|png|jpe?g|webp|svg|glb|mp4)$/ }, a => ({ path: a.path, namespace: 'stub' }))
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: '', loader: 'text' }))
  } }] })
'''

def read_meta():
    with tempfile.TemporaryDirectory() as t:
        open(f'{t}/entry.jsx', 'w').write(ENTRY.replace('__ROOT__', ROOT))
        open(f'{t}/build.mjs', 'w').write(BUILD)
        subprocess.run(['node', f'{t}/build.mjs', f'{t}/entry.jsx', f'{t}/meta.mjs', ROOT], check=True)
        out = subprocess.run(['node', f'{t}/meta.mjs'], check=True, capture_output=True, text=True).stdout
    return json.loads(out)

M = read_meta()
D = M['DIRECTIONS']; LIVE = M['LIVE']; REJ = M['REJECTED']; SETS = M['SETS']; PIECES = M['PIECES']
SURF = M['SURFACES']; SURF_BY = {s['id']: s for s in SURF}
status = lambda d: D[d].get('status') or 'live'
PREF = next((d for d in LIVE if status(d) == 'preferred'), M['DEFAULT_DIR'])
ORDER = [PREF] + [d for d in LIVE if d != PREF]           # the live directions, the preferred one first
WALLS = ['w1', 'w2', 'w3', 'ct']

# ---------------------------------------------------------------------------------------------- text helpers
def clean(s):
    """the house rules on any text that reaches the page: no middle dots, no dashes as pauses"""
    s = str(s)
    n = len(re.findall(r'[·—–]', s))
    if n: WARN.append(f'separator replaced in: {s[:60]}')
    s = s.replace(' · ', ', ').replace('·', ',')
    s = re.sub(r'\s*[—–]\s*', ', ', s)
    return s
def e(s): return H.escape(clean(s), quote=False)
def a(s): return H.escape(clean(s), quote=True)
WORDS = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split()
def word(n): return WORDS[n] if 0 <= n < len(WORDS) else str(n)
def join(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]
def fmt(iso, year=True):
    d = datetime.date.fromisoformat(iso)
    return d.strftime('%a %-d %b') + (d.strftime(' %Y') if year else '')
def mb(n): return f'{n / 1e6:.1f} MB' if n >= 1e6 else f'{max(1, round(n / 1e3))} KB'
def dname(d): return f'Direction {d}, {D[d]["name"]}'
def sname(s): return clean(s['k'].split(' · ')[0])
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

REC = ' <span class="tg tg-n">Recommended</span>'
TICK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.3l2.6 2.5L10 3.4"/></svg>'
CROSS = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg>'
def tag(d):
    st, when = status(d), D[d].get('when')
    if st == 'rejected': return f'<span class="tg tg-x">{CROSS}Rejected, {e(when)}</span>'
    if st == 'preferred': return f'<span class="tg tg-y">{TICK}Preferred, {e(when)}</span>'
    if st == 'new': return f'<span class="tg tg-n">New, {e(when)}</span>'
    return ''

# ---------------------------------------------------------------------------------------------- pictures
KEYS = {}     # path|maxw -> key
IMG = {}      # key -> data uri
USES = {}     # key -> number of uses
STATS = {'imgs': 0, 'bytes': 0}
def picture(path, maxw, q=80):
    key = KEYS.setdefault(f'{path}|{maxw}', f'i{len(KEYS)}')
    if key not in IMG:
        if not os.path.isfile(path):
            WARN.append(f'missing picture {path}')
            return None
        im = Image.open(path)
        if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        if im.mode in ('RGBA', 'LA', 'P'): im.convert('RGBA').save(buf, 'WEBP', quality=q + 4, method=5)
        else: im.convert('RGB').save(buf, 'WEBP', quality=q, method=5)
        IMG[key] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
        STATS['imgs'] += 1; STATS['bytes'] += buf.tell()
    USES[key] = USES.get(key, 0) + 1
    return key
def img(path, maxw, alt='', cls='', w=None, h=None, q=80, zoom=True):
    k = picture(path, maxw, q)
    if not k: return f'<div class="nofile">{e(os.path.basename(path))} not exported yet</div>'
    size = f' width="{w}" height="{h}"' if w and h else ''
    klass = f' class="{cls}"' if cls else ''
    return f'<img src="@@{k}@@" alt="{a(alt)}"{size} decoding="async"{klass}{" data-zoom" if zoom else ""}>'
def art(pid, maxw, alt='', **kw):
    p = PIECES.get(pid.replace('@2x', ''), {})
    return img(f'{PNG}/{pid}.png', maxw, alt or p.get('k', pid), w=p.get('w'), h=p.get('h'), **kw)

# ---------------------------------------------------------------------------------------------- the print files, measured
def pdf_rows():
    rows = []
    for f in sorted(os.listdir(PDF_DIR)):
        if not f.endswith('.pdf'): continue
        pid = f[len(PDF_PRE):-4] if f.startswith(PDF_PRE) else f[:-4]
        p = PIECES.get(pid) or M['PIECES_PRINT'].get(pid)
        r = {'file': f, 'id': pid, 'bytes': os.path.getsize(f'{PDF_DIR}/{f}'), 'k': (p or {}).get('k', pid), 'w': (p or {}).get('w'), 'h': (p or {}).get('h')}
        if fitz:
            doc = fitz.open(f'{PDF_DIR}/{f}'); pg = doc[0].rect; r['pages'] = len(doc); doc.close()
            r['pw'], r['ph'] = pg.width * 25.4 / 72, pg.height * 25.4 / 72
            if r['w']: r['bleed'] = round(((r['pw'] - r['w']) / 2) * 2) / 2
        if not p: WARN.append(f'PDF with no piece in the registry: {f}')
        rows.append(r)
    return rows
PDFS = pdf_rows()

def folder_of(pid):
    if pid in M['PIECES_PRINT']: return 'exhibition-print'
    for d in LIVE + REJ:                          # the first direction to carry a piece owns it (C2 and C3 share C's)
        if pid in SETS[d]['pieces']:
            base = f'direction-{d}-{slug(D[d]["name"])}'
            return ('rejected/' if d in REJ else '') + base
    return 'other'
def folder_title(fo):
    if fo == 'exhibition-print': return 'The exhibition print'
    m = re.match(r'(?:rejected/)?direction-([A-Z0-9]+)-', fo)
    if m: return dname(m.group(1)) + (', rejected' if fo.startswith('rejected/') else '')
    return 'Not in the registry'
def folder_note(fo):
    if fo == 'exhibition-print': return 'The A5 leaflet and the A4 trifold, in every design, both sides. Independent of the direction chosen.'
    m = re.match(r'(?:rejected/)?direction-([A-Z0-9]+)-', fo)
    if not m: return ''
    d = m.group(1)
    own = [p for p in SETS[d]['pieces'] if folder_of(p) == fo and PIECES.get(p, {}).get('print')]
    shared = [p for p in SETS[d]['pieces'] if PIECES.get(p, {}).get('print') and folder_of(p) != fo]
    note = clean(D[d]['line'])
    if shared:
        owners = sorted({re.match(r'(?:rejected/)?direction-([A-Z0-9]+)-', folder_of(p)).group(1) for p in shared})
        note += f' Its other pieces are Direction {join(owners)}’s, in that folder.'
    if d in REJ: note += f' Rejected on {D[d].get("when", "")}: kept for reference, not for print.'
    return note
ORDER_F = ['exhibition-print'] + [f'direction-{d}-{slug(D[d]["name"])}' for d in ORDER] + [f'rejected/direction-{d}-{slug(D[d]["name"])}' for d in REJ] + ['other']
GROUPS = {}
for r in PDFS: GROUPS.setdefault(folder_of(r['id']), []).append(r)
RANK = {}
for pid in [i for k in dict.fromkeys(p['k'] for p in M['PRINT_SETS']) for p in M['PRINT_SETS'] if p['k'] == k for i in p['ids']] + [pid for d in LIVE + REJ for pid in SETS[d]['pieces']]:
    RANK.setdefault(pid, len(RANK))
GROUPS = {f: sorted(GROUPS[f], key=lambda r: RANK.get(r['id'], 9999)) for f in ORDER_F if f in GROUPS}
def bleed_of(rows):
    b = sorted({r.get('bleed') for r in rows if r.get('bleed') is not None})
    return ' or '.join(f'{x:g} mm' for x in b) if b else 'as exported'
def bleed_kinds(rows):
    """[(bleed, 'Wall 1, Wall 2, ... Roll-up')] from the pages themselves"""
    by = {}
    for r in sorted(rows, key=lambda r: RANK.get(r['id'], 9999)):
        if r.get('bleed') is not None: by.setdefault(r['bleed'], []).append(clean(r['k']).split(',')[0])
    return [(b, join(list(dict.fromkeys(ks)))) for b, ks in sorted(by.items(), reverse=True)]
def size_line(r):
    s = f'{r["w"]} × {r["h"]} mm' if r.get('w') else ''
    if r.get('bleed') is not None: s += f', {r["bleed"]:g} mm bleed (page {r["pw"]:.0f} × {r["ph"]:.0f} mm)'
    return s

# ---------------------------------------------------------------------------------------------- the zip
def contact_label():
    try:
        m = re.search(r'>\s*(Contact details to follow[^<{}"\n]*?)\s*<', open('src/components/booth/Print.jsx', encoding='utf-8').read())
        return m.group(1).strip() if m else None
    except OSError:
        return None
CONTACT = contact_label()
RENDER_DIRS = [d for d in LIVE if any('render' in (t or '').lower() for _, t in D[d].get('device', []))]
RENDER_PRINT = [p for p in M['PRINT_SETS'] if 'render' in p['t'].lower() or any(p['t'].startswith(D[d]['name'] + ':') for d in RENDER_DIRS)]
ZIP_ROOT = 'IAQ-SEMICON-Europa-2026-print-files'

def write_zip():
    E = M['EVENT']
    L = [f'IAQ at {E["name"]}: the print files', f'{E["where"]}. {E["dates"]}.', f'Prepared by Brand Method for IAQ, {TODAY.strftime("%-d %b %Y")}. For review and approval.', '']
    live_n = sum(len(v) for f, v in GROUPS.items() if not f.startswith('rejected/'))
    L += ['WHAT IS IN THIS ZIP', f'{len(PDFS)} print PDFs, one page each, vector at 1:1 with bleed, fonts embedded, in RGB for review.',
          f'{live_n} are the exhibition print and the live directions; the rejected directions are under rejected/.', '']
    for fo, rows in GROUPS.items():
        L += [f'{fo}/', f'  {folder_title(fo)}. {folder_note(fo)}']
        for r in rows: L.append(f'  {r["file"]}  {clean(r["k"])}. {size_line(r)}. {mb(r["bytes"])}.')
        L.append('')
    L += ['BLEED, AS EXPORTED']
    for b, ks in bleed_kinds(PDFS): L.append(f'  {b:g} mm on every edge: {ks}.')
    L += ['', 'PRINT SPECIFICATION']
    for k, v in M['PRINT_SPEC']: L.append(f'  {clean(k)}: {clean(v)}')
    L += ['', 'BEFORE PRINT']
    if CONTACT: L.append(f'  Contact label: every leaflet and trifold back carries "Your contact" with the label "{CONTACT}". IAQ gives the name, email and phone for the stand, and the files are updated before print.')
    if RENDER_DIRS or RENDER_PRINT:
        who = [f'Direction {join(RENDER_DIRS)}'] if RENDER_DIRS else []
        ks = list(dict.fromkeys(p['k'] for p in RENDER_PRINT))
        ns = {k: join([str(p['n']) for p in RENDER_PRINT if p['k'] == k]) for k in ks}
        if ks and len(set(ns.values())) == 1: who.append(f'design {ns[ks[0]]} of the {join([k.lower() for k in ks])}')
        else: who += [f'design {ns[k]} of the {k.lower()}' for k in ks]
        L.append(f'  Renders: the pictures in {join(who)} are generated representations of a cleanroom facility, not photographs of an IAQ project.')
    L.append('  Colour: the files are RGB for review. The CMYK conversion (Coated FOGRA39) is the last step, after IAQ signs off, matched on the printer’s proof.')
    L.append('  Sizes, bleed and the screen cut out on the back wall are to be confirmed by berrylife before the walls print.')
    L += ['', f'The codex, iaq-exhibition-codex.html, shows every piece with its direction, measurements and the open questions.']
    readme = '\n'.join(clean(x) for x in L) + '\n'
    tmp = OUT_ZIP + '.tmp'
    with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr(f'{ZIP_ROOT}/README.txt', readme)
        for fo, rows in GROUPS.items():
            for r in rows: z.write(f'{PDF_DIR}/{r["file"]}', f'{ZIP_ROOT}/{fo}/{r["file"]}')
    os.replace(tmp, OUT_ZIP)
    return os.path.getsize(OUT_ZIP)

# ---------------------------------------------------------------------------------------------- fonts
FONT_CSS = [
    'https://api.fontshare.com/v2/css?f[]=switzer@400,500,600&display=swap',
    'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..600&display=swap',
]
def fetch(url):
    if url.startswith('//'): url = 'https:' + url
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read()
def embed_font_css(url):
    css = fetch(url).decode()
    # Google: only the latin and latin-ext blocks
    if 'googleapis' in url:
        css = ''.join(m.group(0) for m in re.finditer(r'/\*\s*(latin|latin-ext)\s*\*/\s*@font-face\s*{[^}]*}', css))
    css = re.sub(r'src:\s*(url\([^)]*\.woff2[^)]*\)\s*format\([\'"]woff2[\'"]\))[^;]*;', r'src: \1;', css)
    def rep(m):
        u = m.group(2)
        if not re.search(r'\.(woff2?|ttf|otf)(\?|$)', u): return m.group(0)
        return f'url("data:font/woff2;base64,{base64.b64encode(fetch(u)).decode()}")'
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', rep, css)
def fonts():
    try:
        return '\n'.join(embed_font_css(u) for u in FONT_CSS), 'fetched'
    except Exception as x:
        # offline: take the faces the Design tab's own download already carries
        try:
            s = open('public/design/iaq-design-system.html', encoding='utf-8').read()
            faces = [m.group(0) for m in re.finditer(r'@font-face\s*{[^}]*}', s) if re.search(r'font-family:\s*[\'"]?(Switzer|Instrument Sans)', m.group(0))]
            WARN.append(f'fonts from the Design tab download (network: {str(x)[:60]})')
            return '\n'.join(faces), 'from the Design tab file'
        except OSError:
            WARN.append('no fonts embedded'); return '', 'none'

# ---------------------------------------------------------------------------------------------- page parts
MAN = '<svg viewBox="0 0 60 175" aria-hidden="true"><circle cx="30" cy="12" r="10" fill="#C4CBD8"/><path d="M14 30h32l6 70h-10l-3 75H21l-3-75H8z" fill="#C4CBD8"/></svg>'

def lineup(d, maxw=1600, small=False, man=True):
    ids = SETS[d]['ids']
    cols = ' '.join(f'{SURF_BY[s]["w"]}fr' for s in WALLS) + (' 600fr' if man else '')
    figs = []
    for s in WALLS:
        S = SURF_BY[s]
        figs.append(f'<figure style="--ar:{S["w"]}/{S["h"]}">{art(ids[s], maxw, f"{sname(S)}, {dname(d)}", q=78 if small else 80)}</figure>')
    if man: figs.append(f'<figure class="lu-man" style="--ar:60/175">{MAN}</figure>')
    legend = '; '.join(f'{sname(SURF_BY[s]).lower()}, {SURF_BY[s]["w"]} × {SURF_BY[s]["h"]} mm' for s in WALLS) + ('; a person, 1.75 m' if man else '')
    return (f'<div class="lu-wrap{" lu-sm" if small else ""}"><div class="lu" style="grid-template-columns:{cols}">{"".join(figs)}</div>'
            f'<p class="lu-legend">From the left: {e(legend)}.</p></div>')

def colours(d, compact=False):
    cs = D[d].get('colours', [])
    bar = ''.join(f'<i style="background:{c["hex"]};flex:{c.get("share", 1)}" title="{a(c["k"])} {c.get("share", "")}%"></i>' for c in cs)
    if compact: return f'<div class="cl cl-c"><div class="cl-bar">{bar}</div></div>'
    li = ''.join(f'<li><i style="background:{c["hex"]}"></i><b>{e(c["k"])}</b><span>{c["hex"]}, {c.get("share", "")} %</span><small>{e(c.get("use", ""))}</small></li>' for c in cs)
    return f'<div class="cl"><div class="cl-bar" aria-hidden="true">{bar}</div><ul class="cl-list">{li}</ul></div>'

def rules(d):
    x = D[d]
    ty = ''.join(f'<li><b>{e(t[0])}</b><span>{e(t[1])}</span></li>' for t in x.get('type', []))
    dev = ''.join(f'<li><b>{e(k)}</b><span>{e(t)}</span></li>' for k, t in x.get('device', []))
    dos = ''.join(f'<li>{TICK}<span>{e(t)}</span></li>' for t in x.get('dos', []))
    donts = ''.join(f'<li>{CROSS}<span>{e(t)}</span></li>' for t in x.get('donts', []))
    return (f'<div class="rl"><div><h4>Type</h4><ul class="kv">{ty}</ul><h4>The rules</h4><ul class="kv">{dev}</ul></div>'
            f'<div><h4>Do</h4><ul class="dd dd-y">{dos}</ul><h4>Do not</h4><ul class="dd dd-x">{donts}</ul></div></div>')

def surf_list(d):
    s = SETS[d]['surf']
    return '<ul class="sc">' + ''.join(f'<li><b>{e(sname(SURF_BY[w]))}</b><span>{e(s[w]["content"])}</span></li>' for w in WALLS if w in s) + '</ul>'

def spec_notes(d):
    return [v for k, v in M['PRINT_SPEC'] if re.match(rf'Direction {re.escape(d)}\b', k)]

def direction(d):
    x = D[d]
    notes = ''.join(f'<p class="note">{e(n)}</p>' for n in spec_notes(d))
    return (f'<article class="dir" id="dir-{d}" data-nav>'
            f'<header class="dir-h"><h3>{e(dname(d))} {tag(d)}</h3><p class="lede">{e(x["line"])}</p></header>'
            f'<div class="idea"><b>{e(x["idea"]["h"])}</b><p>{e(x["idea"]["t"])}</p></div>'
            f'<h4>The line-up, at one scale</h4>{lineup(d)}{surf_list(d)}'
            f'<h4>Colour, by share of the surface</h4>{colours(d)}{rules(d)}{notes}</article>')

def rejected(d):
    x = D[d]
    return (f'<article class="dir dir-rej" id="dir-{d}" data-nav>'
            f'<header class="dir-h"><h3>{e(dname(d))} {tag(d)}</h3><p class="lede">{e(x["line"])}</p></header>'
            f'<div class="idea idea-sm"><b>{e(x["idea"]["h"])}</b></div>'
            f'{lineup(d, maxw=820, small=True, man=False)}{colours(d, compact=True)}</article>')

def groups_by(fn, dirs=None):
    """live directions that share the same pieces, in order, e.g. C, C2 and C3 share one leaflet"""
    out = {}
    for d in (dirs or ORDER): out.setdefault(fn(d), []).append(d)
    return out
def glabel(ds): return f'Direction {ds[0]}, {D[ds[0]]["name"]}' if len(ds) == 1 else f'Directions {join(ds)}'
def gtags(ds): return ' '.join(t for t in (tag(d) for d in ds) if t)

def side(k):   # "Leaflet A5, design 1, front" -> "Front"
    return clean(k.split(',')[-1].strip()).capitalize()

def figure(pid, maxw, cap, cls='art'):
    return f'<figure class="{cls}">{art(pid, maxw)}<figcaption>{cap}</figcaption></figure>'

# ---------------------------------------------------------------------------------------------- the document
def build(zip_bytes):
    E = M['EVENT']
    nav = []   # (id, label, level)
    parts = []

    # cover
    dl = ''.join(f'<div class="dl"><b>{fmt(x["d"], False)}</b><span>{e(x["k"])}</span><small>{e(x["who"])}. {e(x["note"])}</small></div>' for x in M['DEADLINES'])
    parts.append(f'''<section class="cover" id="cover" data-nav>
<img class="mark" src="@@{picture(WORDMARK, 520)}@@" alt="IAQ" width="260" height="109">
<h1>{e(E["name"])}, <em>the IAQ stand.</em></h1>
<p class="lede big">Every piece of IAQ’s corner, in {word(len(LIVE))} live design directions, for IAQ to review and choose between. The preferred one is {e(dname(PREF))}.</p>
<dl class="facts"><div><dt>Where</dt><dd>{e(E["where"])}</dd></div><div><dt>When</dt><dd>{e(E["dates"])}. {e(E["with"])}.</dd></div>
<div><dt>The stand</dt><dd>{e(E["stand"])}</dd></div><div><dt>Built by</dt><dd>{e(E["builder"])}</dd></div></dl>
<h2 class="h-sm">The dates that do not move</h2><div class="dls">{dl}</div>
<h2 class="h-sm">{e(dname(PREF))}, at one scale {tag(PREF)}</h2>{lineup(PREF)}
<p class="meta">Prepared by Brand Method for IAQ, {TODAY.strftime("%-d %b %Y")}. The print files are in {os.path.basename(OUT_ZIP)} ({mb(zip_bytes)}), beside this file on the portal.</p>
</section>''')
    nav.append(('cover', 'Cover', 1))

    # the brief
    brief = ''.join(f'<li><b>{e(b["k"])}</b><span>{e(b["t"])}</span></li>' for b in M['BRIEF'])
    conf = ''.join(f'<li>{TICK}<div><b>{e(c["k"])}</b><span>{e(c["t"])}</span><small>{e(c["who"])}</small></div></li>' for c in M['CONFIRMED'])
    opts = ''.join(f'<li><b>{e(o["h"])}</b>{REC if i == 0 else ""}<span>{e(o["why"])}</span></li>' for i, o in enumerate(M['MESSAGE']['options']))
    proof = ''.join(f'<div><b>{e(n)}</b><span>{e(l)}</span></div>' for n, l in M['MESSAGE']['proof'])
    units = ''.join(f'<li><b>{e(u["k"])}</b><span>{e(u["t"])}</span></li>' for u in M['MESSAGE']['units'])
    parts.append(f'''<section class="part" id="brief" data-nav>
<h2>What the stand <em>has to do.</em></h2><p class="lede">{e(E["dates"])}, {e(E["where"])}. {e(E["stand"])}</p>
<ul class="kv kv-2">{brief}</ul>
<div class="sub" id="confirmed" data-nav><h3>Confirmed by IAQ</h3><ul class="conf">{conf}</ul></div>
<div class="sub two" id="headline" data-nav><div><h3>The headline, for IAQ to choose</h3><ul class="opts">{opts}</ul></div>
<div><h3>What every surface can say</h3><div class="proof">{proof}</div><ul class="kv">{units}</ul></div></div>
</section>''')
    nav += [('brief', 'The brief', 1), ('confirmed', 'Confirmed by IAQ', 2), ('headline', 'The headline', 2)]

    # the directions
    arts = ''.join(direction(d) for d in ORDER)
    rej = ''.join(rejected(d) for d in REJ)
    rej_when = join(sorted({D[d].get('when', '') for d in REJ}))
    parts.append(f'''<section class="part" id="directions" data-nav>
<h2>The directions, <em>one choice.</em></h2>
<p class="lede">{word(len(LIVE)).capitalize()} live directions, {e(dname(PREF))} first as the preferred one, then the others in the portal’s order. Each with its idea, its colours by share, its type, its rules, and the aisle column, side wall, back wall and counter at one scale. {join([f"Direction {d}" for d in REJ])} were rejected on {e(rej_when)} and close the part, smaller.</p>
{arts}
<div class="sub rej" id="rejected" data-nav><h3>Rejected on {e(rej_when)}, kept for reference</h3>{rej}</div>
</section>''')
    nav.append(('directions', 'The directions', 1))
    nav += [(f'dir-{d}', f'{d}, {D[d].get("tab") or D[d]["name"]}', 2) for d in ORDER]
    nav.append(('rejected', f'Rejected, {join(REJ)}', 2))

    # print
    PP = M['PIECES_PRINT']
    def designs(kind):
        rows = []
        for p in [p for p in M['PRINT_SETS'] if p['k'] == kind]:
            f, b = p['ids']
            cap = lambda pid: f'{e(side(PP[pid]["k"]))}, {PP[pid]["w"]} × {PP[pid]["h"]} mm'
            rows.append(f'<div class="pd pd-{slug(kind)}"><div class="pd-h"><b>Design {p["n"]}</b><span>{e(p["t"])}</span></div>'
                        f'{figure(f, 1200, cap(f))}{figure(b, 1200, cap(b))}</div>')
        return ''.join(rows)
    def bleed_for(kind):
        ids = {i for p in M['PRINT_SETS'] if p['k'] == kind for i in p['ids']}
        return bleed_of([r for r in PDFS if r['id'] in ids])
    kinds = list(dict.fromkeys(p['k'] for p in M['PRINT_SETS']))
    kind_secs = ''
    for kind in kinds:
        n = sum(1 for p in M['PRINT_SETS'] if p['k'] == kind)
        one = next(p for p in M['PRINT_SETS'] if p['k'] == kind)
        pc = PP[one['ids'][0]]
        kind_secs += (f'<div class="sub" id="print-{slug(kind)}" data-nav><h3>The {kind.lower()}, {word(n)} designs</h3>'
                      f'<p class="lede">{e(pc["k"].split(",")[0])}, {pc["w"]} × {pc["h"]} mm, both sides, {bleed_for(kind)} bleed. Independent of the direction chosen.</p>{designs(kind)}</div>')
        nav.append((f'print-{slug(kind)}', f'{kind}, {word(n)} designs', 2))
    fl = ''
    for ids, ds in groups_by(lambda d: tuple(SETS[d]['flyer']['ids'])).items():
        F = SETS[ds[0]]['flyer']
        cap = lambda pid: f'{e(side(PIECES[pid]["k"]))}, {PIECES[pid]["w"]} × {PIECES[pid]["h"]} mm'
        fl += (f'<div class="pd pd-leaflet"><div class="pd-h"><b>{e(glabel(ds))} {gtags(ds)}</b><span><strong>{e(F["h"])}</strong> {e(F["t"])}</span></div>'
               f'{figure(ids[0], 1200, cap(ids[0]))}{figure(ids[1], 1200, cap(ids[1]))}</div>')
    ro = ''
    for rid, ds in groups_by(lambda d: SETS[d]['roll']['id']).items():
        ro += figure(rid, 1200, f'<b>{e(glabel(ds))}</b> {e(SETS[ds[0]]["roll"]["cap"])}')
    roll_p = PIECES[SETS[PREF]['roll']['id']]
    take = ''.join(f'<div class="ci"><b>{e(c["k"])}</b><span class="tg tg-g">{e(c["status"])}</span><small>{e(c["size"])}</small><p>{e(c["use"])}</p><small>{e(c["qty"])}</small></div>'
                   for c in M['COLLATERAL'] if c['id'] not in ('flyer', 'rollup'))
    parts.append(f'''<section class="part" id="print" data-nav>
<h2>The print, <em>to take away.</em></h2>
<p class="lede">The exhibition leaflet and trifold in every design, both sides; then each live direction’s own leaflet and the roll-ups. Open any piece to see it larger.</p>
{kind_secs}
<div class="sub" id="print-direction" data-nav><h3>The leaflet in each direction</h3><p class="lede">Each direction’s own A5 leaflet, front and back. Directions that share one leaflet are shown once.</p>{fl}</div>
<div class="sub" id="print-rollups" data-nav><h3>The roll-ups, for after Munich</h3><p class="lede">{roll_p["w"]} × {roll_p["h"]} mm. Not needed on this stand, which has its walls: for the office, site entrances and smaller shows.</p><div class="rolls">{ro}</div></div>
<div class="sub" id="print-rest" data-nav><h3>The rest of the take-away</h3><div class="cis">{take}</div></div>
</section>''')
    nav += [('print', 'Print', 1), ('print-direction', 'Leaflet in each direction', 2), ('print-rollups', 'Roll-ups', 2), ('print-rest', 'The rest of the take-away', 2)]
    # keep the print sub-links in page order
    nav_print = [n for n in nav if n[0].startswith('print-') and n[0] not in ('print-direction', 'print-rollups', 'print-rest')]
    nav = [n for n in nav if n not in nav_print]
    i = [n[0] for n in nav].index('print') + 1
    nav[i:i] = nav_print

    # screen and digital
    S = M['SCREEN']
    stills = sorted(f for f in os.listdir('public/booth') if re.match(r'screen-\d+\.webp$', f))
    stills.sort(key=lambda f: int(re.findall(r'\d+', f)[0]))
    chs = S['chapters']; lap = sum(c.get('s', 0) for c in chs)
    ch_html = ''.join(
        f'<figure class="ch">{img("public/booth/" + stills[i], 1200, c["k"]) if len(stills) == len(chs) else ""}'
        f'<figcaption><b>{e(c["k"])}</b><span>{e(c["t"])}</span><small>{c.get("s", "")} s</small></figcaption></figure>' for i, c in enumerate(chs))
    modes = ''.join(f'<li><b>{e(k)}</b><span>{e(v)}</span></li>' for k, v in S['modes'])
    srules = ''.join(f'<li>{e(r)}</li>' for r in S['rules'])
    deliv = ''.join(f'<li><b>{e(k)}</b><span>{e(v)}</span></li>' for k, v in S['delivery'])
    caps = ''.join(f'<li><b>{e(p["when"])}</b><span>{e(p["caption"])}</span></li>' for p in M['POSTS'])
    posts = ''
    for ids, ds in groups_by(lambda d: tuple(SETS[d]['ids'][p['id']] for p in M['POSTS'])).items():
        posts += (f'<div class="dg"><h4>{e(glabel(ds))} {gtags(ds)}</h4><div class="posts">'
                  + ''.join(figure(pid, 1200, e(p['when'])) for pid, p in zip(ids, M['POSTS'])) + '</div></div>')
    ads = ''
    ad_ids = ['ad' + 'x'.join(map(str, s)) for s in M['ADS']]
    for ids, ds in groups_by(lambda d: tuple(SETS[d]['ids'][x] for x in ad_ids)).items():
        figs = ''.join(f'<figure class="ad" style="--w:{s[0]}px">{art(pid + "@2x", 1200, f"Web ad {s[0]} × {s[1]}, {glabel(ds)}")}<figcaption>{s[0]} × {s[1]}</figcaption></figure>'
                       for pid, s in zip(ids, M['ADS']))
        ads += f'<div class="dg"><h4>{e(glabel(ds))} {gtags(ds)}</h4><div class="ads">{figs}</div></div>'
    sig_p = PIECES.get('sig', {'w': 600, 'h': 150})
    sigs = ''.join(f'<figure class="sig">{art(sid, 1200)}<figcaption><b>{e(glabel(ds))}</b></figcaption></figure>'
                   for sid, ds in groups_by(lambda d: SETS[d]['ids']['sig']).items())
    parts.append(f'''<section class="part" id="digital" data-nav>
<h2>The screen <em>and digital.</em></h2>
<p class="lede">The booth screen’s loop, then the LinkedIn posts, the web ads and the email signature in each live direction.</p>
<div class="sub" id="screen" data-nav><h3>The booth screen</h3><p class="lede">{e(S["size"])}. Canvas {e(S["canvas"])}. {word(len(chs)).capitalize()} chapters, about {lap} s a lap. A live website, running in the portal; these are its chapters.</p>
<div class="chs">{ch_html}</div>
<div class="two"><div><h4>Two modes</h4><ul class="kv">{modes}</ul><h4>What is delivered</h4><ul class="kv">{deliv}</ul></div><div><h4>How it reads</h4><ul class="plain">{srules}</ul></div></div></div>
<div class="sub" id="posts" data-nav><h3>LinkedIn posts</h3><p class="lede">{PIECES["post1"]["w"]} × {PIECES["post1"]["h"]} px. The captions are the same in every direction.</p><ul class="kv kv-2">{caps}</ul>{posts}</div>
<div class="sub" id="ads" data-nav><h3>Web ads</h3><p class="lede">{join([f"{s[0]} × {s[1]}" for s in M["ADS"]])} px, shown at their size (exported at 1x and 2x).</p>{ads}</div>
<div class="sub" id="signature" data-nav><h3>Email signature</h3><p class="lede">{sig_p["w"]} × {sig_p["h"]} px.</p><div class="sigs">{sigs}</div></div>
</section>''')
    nav += [('digital', 'Screen and digital', 1), ('screen', 'The booth screen', 2), ('posts', 'LinkedIn posts', 2), ('ads', 'Web ads', 2), ('signature', 'Email signature', 2)]

    # surfaces measured
    spec_img = next((f['paths'][0] for f in M['FILES'] if not f['pdf'] and len(f['paths']) == 1 and 'IAQ' in f['k']), None)
    cards = ''
    for s in SURF:
        rows = [('Size', f'{s["w"]} × {s["h"]} mm' + (f', {s["visible"]} mm visible' if s.get('visible') else ''))]
        rows.append(('Print', f'Vector at 1:1. A photograph across the whole surface needs {s["pxW"]:,} × {s["pxH"]:,} px at {s["ppi"]} ppi.'))
        if s.get('screen'):
            sc = s['screen']
            rows.append(('Screen', f'{sc["w"]} × {sc["h"]} mm, bottom edge {sc["bottom"]} mm and top edge {sc["bottom"] + sc["h"]} mm from the floor, {sc["side"]} mm from the side'))
        if s.get('radius'): rows.append(('Corner', f'{s["radius"]} mm radius'))
        tb = ''.join(f'<tr><th>{k}</th><td>{e(v)}</td></tr>' for k, v in rows)
        zg = ''
        for sid, ds in groups_by(lambda d: SETS[d]['surf'][s['id']]['id']).items():
            z = SETS[ds[0]]['surf'][s['id']]['zones']
            zg += f'<div class="zg"><h4>{e(glabel(ds))}</h4><ul class="zones">' + ''.join(f'<li><b>{e(r)}</b><span>{e(l)}</span></li>' for r, l in z) + '</ul></div>'
        cards += (f'<div class="srf" id="srf-{s["id"]}"><div class="srf-h"><h3>{e(sname(s))}</h3><p>{e(s["where"])}</p><table class="tb">{tb}</table></div>'
                  f'<h4 class="zk">Zones from the floor, in each live direction</h4><div class="zgs">{zg}</div></div>')
    heights = {}
    for d in ORDER:
        for w in WALLS:
            for r, l in SETS[d]['surf'][w]['zones']:
                if re.search(r'\b(the (long )?(red |white )?line\b|seven lines|plinth)', l):
                    h = heights.setdefault((r, l.split(', one height')[0]), {'s': [], 'd': []})
                    h['s'].append(sname(SURF_BY[w]).lower()); h['d'].append(d)
    start = lambda r: -int(re.findall(r'\d+', r)[0])
    hrows = ''.join(f'<tr><th>{e(r)}</th><td>{e(l[0].upper() + l[1:])}, on the {e(join(list(dict.fromkeys(h["s"]))))}. Direction{"s" if len(set(h["d"])) > 1 else ""} {join(list(dict.fromkeys(h["d"])))}.</td></tr>'
                    for (r, l), h in sorted(heights.items(), key=lambda kv: start(kv[0][0])))
    w3 = next((s for s in SURF if s.get('screen')), None)
    scr_row = f'<tr><th>{w3["screen"]["bottom"]} to {w3["screen"]["bottom"] + w3["screen"]["h"]} mm</th><td>The {e(S["size"].split(",")[0])} screen, on the back wall. Every direction: nothing printed behind it.</td></tr>' if w3 else ''
    parts.append(f'''<section class="part" id="surfaces" data-nav>
<h2>The surfaces, <em>measured.</em></h2>
<p class="lede">IAQ’s {word(len(SURF))} surfaces, read off berrylife’s graphic specification. Heights are from the floor.</p>
<div class="sub" id="heights" data-nav><h3>Heights round the zone</h3><table class="tb">{scr_row}{hrows}</table></div>
{f'<figure class="art spec">{img(PUB + spec_img, 1600, "berrylife graphic specification, IAQ surfaces")}<figcaption>berrylife’s graphic specification of the IAQ surfaces, as received</figcaption></figure>' if spec_img else ''}
{cards}
</section>''')
    nav += [('surfaces', 'Surfaces measured', 1), ('heights', 'Heights round the zone', 2)]

    # print specification
    spec = ''.join(f'<tr><th>{e(k)}</th><td>{e(v)}</td></tr>' for k, v in M['PRINT_SPEC'])
    bl = ''.join(f'<tr><th>{b:g} mm on every edge</th><td>{e(ks)}</td></tr>' for b, ks in bleed_kinds(PDFS))
    parts.append(f'''<section class="part" id="spec" data-nav>
<h2>Print <em>specification.</em></h2><p class="lede">What the printer receives, and what is still to confirm with berrylife.</p>
<table class="tb">{spec}</table>
<div class="sub"><h3>Bleed in the files</h3><table class="tb">{bl}</table></div>
</section>''')
    nav.append(('spec', 'Print specification', 1))

    # open questions
    qs = ''.join(f'<li><b>{e(q["q"])}</b><span>Meanwhile: {e(q["did"])}</span><small>For {e(q["who"])}</small></li>' for q in M['OPEN'])
    parts.append(f'''<section class="part" id="questions" data-nav>
<h2>Open questions <em>for IAQ.</em></h2><p class="lede">{word(len(M["OPEN"])).capitalize()} answers we need. Each says what was done in the meantime, so nothing waits on the answer.</p>
<ul class="qs">{qs}</ul></section>''')
    nav.append(('questions', 'Open questions', 1))

    # files
    ft = ''
    for fo, rows in GROUPS.items():
        tr = ''.join(f'<tr><th>{e(r["k"])}<small>{e(r["file"])}</small></th><td>{e(size_line(r))}</td><td class="n">{mb(r["bytes"])}</td></tr>' for r in rows)
        ft += (f'<div class="fg{" fg-rej" if fo.startswith("rejected/") else ""}"><h3>{e(folder_title(fo))} {tag(re.match(r"(?:rejected/)?direction-([A-Z0-9]+)-", fo).group(1)) if fo.startswith(("direction", "rejected/")) else ""}</h3>'
               f'<p class="fo">{e(fo)}/, {len(rows)} file{"s" if len(rows) != 1 else ""}, {mb(sum(r["bytes"] for r in rows))}. {e(folder_note(fo))}</p><table class="tb tb-f">{tr}</table></div>')
    parts.append(f'''<section class="part" id="files" data-nav>
<h2>The print files, <em>ready to send.</em></h2>
<p class="lede">Every print PDF, {len(PDFS)} files, {mb(sum(r["bytes"] for r in PDFS))}, all in <b>{os.path.basename(OUT_ZIP)}</b> ({mb(zip_bytes)}) beside this codex on the portal, folder by folder as below, with a README. One page each, vector at 1:1 with bleed, fonts embedded, in RGB for review: the CMYK FOGRA39 conversion is the last step, after IAQ signs off.{(" The contact on every leaflet and trifold back is a label, “" + e(CONTACT) + "”, until IAQ gives the names.") if CONTACT else ""}</p>
{ft}</section>''')
    nav.append(('files', 'Files', 1))

    # the contents
    items = []
    for nid, label, lvl in nav:
        items.append(f'<li class="l{lvl}"><a href="#{nid}">{e(label)}</a></li>')
    side_nav = (f'<aside class="sb" aria-label="Contents"><a class="sb-h" href="#cover"><img src="@@{picture(WORDMARK, 520)}@@" alt="IAQ" width="72" height="30">'
                f'<span>{e(E["name"])}<small>Exhibition codex, {TODAY.strftime("%-d %b %Y")}</small></span></a><ol>{"".join(items)}</ol></aside>')
    mnav = '<nav class="mnav" aria-label="Parts">' + ''.join(f'<a href="#{nid}">{e(label)}</a>' for nid, label, lvl in nav if lvl == 1) + '</nav>'

    font_css, font_src = fonts()
    body = '\n'.join(parts)
    doc = f'''<!doctype html>
<html lang="en">
<head>
<!-- IAQ at SEMICON Europa 2026, the exhibition codex. Written by Brand Method from the portal's booth data on {TODAY.isoformat()}. One file: styles, fonts and pictures inside. -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IAQ, SEMICON Europa 2026, exhibition codex</title>
<style>
{font_css}
</style>
<style>
{CSS}
</style>
</head>
<body>
{side_nav}
<main class="main">
{mnav}
<div class="wrap">
{body}
<footer class="foot"><p>Prepared by Brand Method for IAQ, {TODAY.strftime("%-d %b %Y")}, from the exhibition page of the IAQ review portal. The walls, counter and print are drafts for approval; the renders in {("Direction " + join(RENDER_DIRS)) if RENDER_DIRS else "the 3D pieces"} are generated representations, not photographs of a project.</p></footer>
</div>
</main>
<div id="lb" hidden><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=""></div>
<!--SHARED-->
<script>
{JS}
</script>
</body>
</html>'''
    # a picture used once is inline; one used more than once is stored once and set as the page loads
    BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    shared = {k: f'x{i}' for i, k in enumerate(k for k, n in USES.items() if n > 1)}
    def rep(m):
        k = m.group(1)
        return f'{BLANK}" data-dx="{shared[k]}' if k in shared else IMG[k]
    doc = re.sub(r'@@(i\d+)@@', rep, doc)
    lib = ',\n'.join(f'{v}:"{IMG[k]}"' for k, v in shared.items())
    doc = doc.replace('<!--SHARED-->', f'<script>/* pictures used more than once, stored once */(function(){{var P={{{lib}}};document.querySelectorAll("[data-dx]").forEach(function(el){{el.src=P[el.getAttribute("data-dx")];}});}})();</script>' if shared else '')
    return doc, font_src, len(shared)

CSS = r'''
:root{--r:#EC2027;--rd:#B5121B;--ink:#231F20;--tx2:#5A5F6B;--faint:#8A909B;--tint:#F1F3F6;--pap:#F7F8FA;--green:#0B8452;--sbw:264px}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:400 15.5px/1.6 "Instrument Sans",system-ui,sans-serif;overflow-wrap:break-word}
img{display:block;max-width:100%;height:auto}
h1,h2,h3,h4{font-family:"Switzer","Instrument Sans",sans-serif;font-weight:600;letter-spacing:-.02em;margin:0;color:var(--ink)}
h1 em,h2 em,h3 em{font-style:normal;color:var(--r);white-space:nowrap}
b,strong{font-weight:600;color:var(--ink)}
a{color:inherit}
.main{padding:0 16px 80px}
.wrap{max-width:1180px;margin:0 auto}
/* contents */
.sb{display:none}
.mnav{position:sticky;top:0;z-index:20;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:10px 12px;background:rgba(255,255,255,.97);box-shadow:0 10px 22px -20px rgba(16,16,16,.55)}
.mnav::-webkit-scrollbar{display:none}
.mnav a{flex:none;padding:8px 10px;font:500 13.5px/1 "Switzer",sans-serif;color:var(--tx2);text-decoration:none;white-space:nowrap}
.mnav a.on{color:var(--ink);font-weight:600;background:rgba(236,32,39,.08)}
@media(min-width:1100px){
  .mnav{display:none}
  .sb{display:block;position:fixed;left:0;top:0;bottom:0;width:var(--sbw);overflow-y:auto;scrollbar-width:thin;background:#fff;box-shadow:14px 0 34px -30px rgba(16,16,16,.35);padding:28px 14px 48px;z-index:20}
  .main{margin-left:var(--sbw);padding:0 clamp(32px,4vw,72px) 120px}
}
.sb a.sb-h{display:block;padding:0 10px 22px;background:none}
.sb-h img{width:64px;margin-bottom:10px}
.sb-h span{font:600 14.5px/1.25 "Switzer",sans-serif;color:var(--ink)}
.sb-h small{display:block;margin-top:3px;font:500 12px/1.3 "Instrument Sans",sans-serif;color:var(--faint)}
.sb ol{list-style:none;margin:0;padding:0}
.sb a{display:block;padding:7px 10px;font:500 13.5px/1.3 "Switzer",sans-serif;color:var(--tx2);text-decoration:none;transition:color .2s,background .2s}
.sb li.l1{margin-top:10px}
.sb li.l1:first-child{margin-top:0}
.sb li.l1>a{font-weight:600;color:var(--ink)}
.sb li.l2>a{padding:5px 10px 5px 22px;font-size:12.5px;color:var(--faint)}
.sb a:hover{color:var(--ink);background:#F4F4F4}
.sb a.on{color:var(--ink);background:rgba(236,32,39,.07)}
.sb li.l2>a.on{color:var(--rd);background:none}
/* type */
.lede{margin:14px 0 0;max-width:72ch;font-size:16.5px;line-height:1.6;color:var(--tx2)}
.lede.big{font-size:clamp(17px,1.6vw,20px);color:var(--ink);max-width:60ch}
.lede b{color:var(--ink)}
.note{margin:18px 0 0;max-width:80ch;padding:14px 16px;background:var(--pap);font-size:14px;color:var(--tx2)}
.meta{margin:28px 0 0;font-size:13.5px;color:var(--faint)}
/* parts */
.cover{padding:48px 0 24px}
.cover .mark{width:clamp(150px,18vw,230px);margin-bottom:clamp(36px,6vw,72px)}
.cover h1{font-size:clamp(38px,6vw,84px);line-height:1.02;letter-spacing:-.035em}
.part{padding-top:clamp(64px,9vw,120px)}
.part>h2{font-size:clamp(30px,4vw,52px);line-height:1.05;letter-spacing:-.03em}
.h-sm{margin-top:48px;font-size:19px;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.sub{margin-top:clamp(48px,6vw,72px)}
.sub>h3{font-size:clamp(22px,2.2vw,28px);line-height:1.15}
h4{margin:34px 0 12px;font-size:15.5px;letter-spacing:-.01em}
.two{display:grid;gap:28px 48px}
@media(min-width:860px){.two{grid-template-columns:1fr 1fr}}
/* tags */
.tg{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;font:600 11.5px/1 "Switzer",sans-serif;letter-spacing:0;color:#fff;vertical-align:middle;white-space:nowrap}
.tg svg{width:11px;height:11px;fill:none;stroke:#fff;stroke-width:1.8}
.tg-y{background:var(--green)}.tg-x{background:#D7141C}.tg-n{background:var(--ink)}
.tg-g{background:var(--tint);color:var(--tx2)}
/* facts and dates */
.facts{display:grid;gap:18px 40px;margin:36px 0 0;max-width:980px}
@media(min-width:760px){.facts{grid-template-columns:1fr 1fr}}
.facts dt{font:600 13px/1.3 "Switzer",sans-serif;color:var(--faint)}
.facts dd{margin:4px 0 0;font-size:15.5px}
.dls{display:grid;gap:12px;margin-top:16px}
@media(min-width:760px){.dls{grid-template-columns:repeat(3,1fr)}}
.dl{background:var(--tint);padding:20px 20px 22px}
.dl b{display:block;font:600 30px/1 "Switzer",sans-serif;letter-spacing:-.03em;color:var(--r)}
.dl span{display:block;margin-top:12px;font:600 16px/1.3 "Switzer",sans-serif}
.dl small{display:block;margin-top:6px;font-size:13.5px;line-height:1.5;color:var(--tx2)}
/* lists */
.kv{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:14px}
.kv li{display:grid;gap:3px}
.kv li b{font-family:"Switzer",sans-serif}
.kv li span{color:var(--tx2)}
@media(min-width:860px){.kv-2{grid-template-columns:1fr 1fr;gap:20px 48px}}
.plain{margin:0;padding:0;list-style:none;display:grid;gap:10px;color:var(--tx2)}
.conf{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:12px}
.conf li{display:grid;grid-template-columns:22px 1fr;gap:12px;background:var(--pap);padding:16px 18px}
.conf svg{width:20px;height:20px;fill:none;stroke:var(--green);stroke-width:1.6;margin-top:2px}
.conf b,.conf span,.conf small{display:block}.conf span{color:var(--tx2)}.conf small{margin-top:6px;font-size:13px;color:var(--faint)}
.opts{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:16px}
.opts li b{font:600 19px/1.3 "Switzer",sans-serif;margin-right:8px}
.opts li>span:last-child{display:block;margin-top:4px;color:var(--tx2)}
.proof{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;margin-top:16px}
.proof b{display:block;font:600 clamp(24px,2.4vw,32px)/1.05 "Switzer",sans-serif;letter-spacing:-.03em;color:var(--r);white-space:nowrap}
.proof span{display:block;margin-top:4px;font-size:13.5px;color:var(--tx2)}
/* directions */
.dir{margin-top:clamp(64px,8vw,104px)}
.dir-h h3{font-size:clamp(24px,2.6vw,34px);line-height:1.12;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}
.idea{margin-top:26px;max-width:860px}
.idea b{display:block;font:600 clamp(20px,2vw,26px)/1.2 "Switzer",sans-serif;letter-spacing:-.02em}
.idea p{margin:10px 0 0;color:var(--tx2)}
.lu-wrap{margin-top:8px;background:var(--tint);padding:26px 22px 16px;overflow-x:auto}
.lu{display:grid;gap:clamp(5px,1.4vw,16px);align-items:end}
.lu figure{margin:0;min-width:0}
.lu img{width:100%;height:auto;aspect-ratio:var(--ar);background:#fff;box-shadow:0 1px 2px rgba(10,16,31,.08),0 12px 26px -16px rgba(10,16,31,.35);cursor:zoom-in}
.lu .lu-man svg{display:block;width:100%;aspect-ratio:var(--ar)}
.lu-legend{margin:14px 0 0;font-size:13px;line-height:1.45;color:var(--tx2)}
.lu-sm{max-width:760px}
.sc{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:16px 28px}
@media(min-width:860px){.sc{grid-template-columns:repeat(4,1fr)}}
.sc b{display:block;font:600 14px/1.3 "Switzer",sans-serif}.sc span{display:block;margin-top:4px;font-size:14px;line-height:1.55;color:var(--tx2)}
.cl{background:var(--tint);padding:18px 18px 20px}
.cl-bar{display:flex;height:30px;background:#fff}
.cl-bar i{display:block;min-width:3px;box-shadow:inset 0 0 0 1px rgba(10,16,31,.06)}
.cl-list{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:14px 22px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.cl-list li{display:grid;grid-template-columns:34px 1fr;column-gap:12px;align-content:start}
.cl-list i{grid-row:1/span 3;width:34px;height:34px;box-shadow:inset 0 0 0 1px rgba(10,16,31,.12)}
.cl-list b{font:600 14px/1.3 "Switzer",sans-serif}.cl-list span{font-size:12.5px;color:var(--tx2)}.cl-list small{font-size:12.5px;line-height:1.45;color:var(--tx2)}
.cl-c{padding:10px;max-width:760px;margin-top:10px}.cl-c .cl-bar{height:16px}
.rl{display:grid;gap:0 48px}
@media(min-width:860px){.rl{grid-template-columns:1.25fr 1fr}}
.dd{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.dd li{display:grid;grid-template-columns:16px 1fr;gap:10px;color:var(--tx2)}
.dd svg{width:15px;height:15px;margin-top:4px;fill:none;stroke-width:1.8}
.dd-y svg{stroke:var(--green)}.dd-x svg{stroke:#D7141C}
.rej .dir{margin-top:48px}
.dir-rej .dir-h h3{font-size:22px}
.idea-sm b{font-size:18px;color:var(--tx2)}
.dir-rej .lu-wrap{background:#F6F7F9}.dir-rej .lu img{opacity:.85}
/* print and digital */
.pd{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 22px;margin-top:36px}
.pd-leaflet{max-width:860px}
@media(max-width:700px){.pd-trifold{grid-template-columns:1fr}}
.pd-h{grid-column:1/-1;display:grid;gap:4px}
.pd-h b{font:600 17px/1.3 "Switzer",sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.pd-h span{color:var(--tx2);max-width:80ch}.pd-h strong{color:var(--ink)}
figure{margin:0}
figure img{width:100%}
figure.art img,.ch img{background:#fff;box-shadow:0 1px 2px rgba(10,16,31,.08),0 12px 28px -18px rgba(10,16,31,.4);cursor:zoom-in}
figure figcaption{margin-top:10px;font-size:13.5px;line-height:1.45;color:var(--tx2)}
figure figcaption b{color:var(--ink);display:block}
.rolls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:24px}
@media(min-width:860px){.rolls{grid-template-columns:repeat(4,minmax(0,1fr))}}
.cis{display:grid;gap:12px;margin-top:18px}
@media(min-width:860px){.cis{grid-template-columns:repeat(2,1fr)}}
.ci{background:var(--pap);padding:18px 20px;display:grid;gap:6px;align-content:start}
.ci .tg{justify-self:start}.ci small{color:var(--faint);font-size:13px}.ci p{margin:0;color:var(--tx2);font-size:14.5px}
.chs{display:grid;gap:22px;margin-top:24px}
@media(min-width:700px){.chs{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1000px){.chs{grid-template-columns:repeat(3,1fr)}}
.ch figcaption span{display:block}.ch figcaption small{display:block;margin-top:2px;color:var(--faint)}
.dg{margin-top:34px}.dg h4{margin:0 0 14px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.posts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
@media(min-width:860px){.posts{grid-template-columns:repeat(4,minmax(0,1fr))}}
.ads{display:flex;flex-wrap:wrap;align-items:flex-start;gap:22px}
.ad{width:var(--w);max-width:100%}
.sigs{display:grid;gap:22px;margin-top:22px}
@media(min-width:1000px){.sigs{grid-template-columns:repeat(2,minmax(0,1fr))}}
.sig{max-width:600px}
.nofile{padding:24px;background:var(--pap);color:var(--faint);font-size:13px}
/* surfaces, tables */
.tb{width:100%;border-collapse:collapse;margin-top:16px;font-size:14.5px}
.tb th,.tb td{text-align:left;vertical-align:top;padding:11px 14px}
.tb tr:nth-child(odd){background:var(--pap)}
.tb th{width:30%;font:600 14px/1.4 "Switzer",sans-serif;color:var(--ink)}
.tb td{color:var(--tx2)}
.tb th small{display:block;margin-top:2px;font:400 12px/1.35 "Instrument Sans",sans-serif;color:var(--faint);word-break:break-all}
.tb td.n{width:90px;text-align:right;white-space:nowrap}
@media(max-width:600px){.tb th{width:42%}.tb-f td:nth-child(2){display:none}}
.spec{margin-top:40px}
.srf{margin-top:56px}
.srf-h h3{font-size:24px}.srf-h p{margin:8px 0 0;color:var(--tx2);max-width:80ch}
.zk{margin-top:28px}
.zgs{display:grid;gap:16px}
@media(min-width:760px){.zgs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1180px){.zgs{grid-template-columns:repeat(3,minmax(0,1fr))}}
.zg{background:var(--pap);padding:16px 18px}
.zg h4{margin:0 0 10px;font-size:14px}
.zones{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.zones li{display:grid;grid-template-columns:118px 1fr;gap:10px;font-size:13.5px;line-height:1.45}
.zones b{font:600 13px/1.45 "Switzer",sans-serif;white-space:nowrap}.zones span{color:var(--tx2)}
.qs{list-style:none;margin:24px 0 0;padding:0;display:grid;gap:12px}
@media(min-width:900px){.qs{grid-template-columns:1fr 1fr}}
.qs li{background:var(--pap);padding:18px 20px;display:grid;gap:6px;align-content:start}
.qs b{font:600 16.5px/1.35 "Switzer",sans-serif}.qs span{color:var(--tx2)}.qs small{color:var(--faint);font-size:13px}
.fg{margin-top:44px}.fg h3{font-size:20px;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.fo{margin:6px 0 0;color:var(--tx2);font-size:14px;max-width:90ch}
.fg-rej{opacity:.8}
.foot{margin-top:96px;padding:28px 0 0;color:var(--faint);font-size:13px;max-width:90ch}
/* the larger view */
#lb{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(24,24,26,.92);cursor:zoom-out}
#lb[hidden]{display:none}
#lb img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;background:#fff}
@media print{.sb,.mnav,#lb{display:none!important}.main{margin:0;padding:0}.part,.dir,.pd,figure{break-inside:avoid}}
'''

JS = r'''
(function () {
  /* the contents follow the reading */
  var links = [].slice.call(document.querySelectorAll('.sb li a, .mnav a'));
  var mark = function (id) {
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + id); });
    var m = document.querySelector('.mnav a.on'); if (m && m.scrollIntoView && window.innerWidth < 1100) { var n = m.parentNode; n.scrollLeft = m.offsetLeft - 12; }
  };
  var parts = [].slice.call(document.querySelectorAll('[data-nav]'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      var vis = es.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (vis[0]) mark(vis[0].target.id);
    }, { rootMargin: '-15% 0px -75% 0px' });
    parts.forEach(function (p) { io.observe(p); });
  }
  /* any piece opens larger */
  var lb = document.getElementById('lb'), big = lb.querySelector('img'), blank = big.src;
  document.addEventListener('click', function (ev) {
    var im = ev.target.closest && ev.target.closest('img[data-zoom]');
    if (im && !lb.contains(im)) { big.src = im.currentSrc || im.src; big.alt = im.alt; lb.hidden = false; return; }
    if (lb.contains(ev.target)) { lb.hidden = true; big.src = blank; }
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { lb.hidden = true; big.src = blank; } });
})();
'''

# ---------------------------------------------------------------------------------------------- run
if __name__ == '__main__':
    zip_bytes = write_zip()
    doc, font_src, n_shared = build(zip_bytes)
    left = re.findall(r'(?:src|href)="(/[^"#][^"]*)"', doc)
    if left: WARN.append(f'local references left: {left[:4]}')
    words = re.sub(r'<(script|style)[\s\S]*?</\1>', '', doc)
    words = re.sub(r'<[^>]+>', ' ', words)
    if re.search(r'[·—–!]', words): WARN.append('a middle dot, dash or exclamation mark reached the text: ' + ', '.join(sorted(set(re.findall(r'.{20}[·—–!].{10}', words))))[:200])
    tmp = OUT_HTML + '.tmp'
    open(tmp, 'w', encoding='utf-8').write(doc)
    os.replace(tmp, OUT_HTML)
    html_bytes = os.path.getsize(OUT_HTML)
    stamp = TODAY.isoformat()
    ver = int(datetime.datetime.now().timestamp())
    data = {
        'date': stamp,
        'html': {'href': f'/booth/{os.path.basename(OUT_HTML)}?v={ver}', 'name': f'IAQ-SEMICON-Europa-2026-exhibition-codex-{stamp}.html', 'bytes': html_bytes},
        'zip': {'href': f'/booth/{os.path.basename(OUT_ZIP)}?v={ver}', 'name': f'IAQ-SEMICON-Europa-2026-print-files-{stamp}.zip', 'bytes': zip_bytes, 'files': len(PDFS)},
    }
    open(OUT_DATA, 'w', encoding='utf-8').write(
        '/* Written by tools/booth-codex-0930.py, do not edit: the exhibition codex and the print files, for the download bar on\n'
        '   /portal/booth (components/booth/CodexDownload.jsx). Rerun the script after any artwork export. */\n'
        f'export const CODEX = {json.dumps(data, indent=2)}\n')
    print(f'codex {OUT_HTML}: {html_bytes / 1e6:.1f} MB, {STATS["imgs"]} pictures ({STATS["bytes"] / 1e6:.1f} MB as WebP, {n_shared} stored once for several uses), fonts {font_src}')
    print(f'zip   {OUT_ZIP}: {zip_bytes / 1e6:.1f} MB, {len(PDFS)} PDFs in {len(GROUPS)} folders: ' + ', '.join(f'{f} {len(v)}' for f, v in GROUPS.items()))
    print(f'data  {OUT_DATA}')
    if WARN: print('warnings:\n  ' + '\n  '.join(WARN))
