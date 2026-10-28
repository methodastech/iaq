#!/usr/bin/env python3
"""Design tab, 29 Sep 2026 (Bazil: "i want a design download button for this whole page to be in html").
Bundles public/design.html into ONE self-contained file, public/design/iaq-design-system.html, that opens offline:
the three stylesheets inlined, every image, drawing and mask inlined as a data URI (every picture over 60 KB scaled to 1200 px at most
and re-encoded as WebP so the file stays light), Switzer and Instrument Sans embedded, the loading-screen demos folded in
as srcdoc frames that still animate, and the live 3D embed replaced by a note (it needs the running site).
The download button itself is taken out of the bundle. Run after the generator; the generator calls it.
Run: python3 tools/design-bundle-0929.py"""
import re, os, io, base64, mimetypes, urllib.request, html as H
from PIL import Image

PUB = 'public'
SRC = 'public/design.html'
OUT = 'public/design/iaq-design-system.html'
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'}
cache = {}
stats = {'files': 0, 'bytes': 0, 'fonts': 0}

def local(path):
    p = path.split('?')[0].split('#')[0]
    if not p.startswith('/'): return None
    f = PUB + p
    return f if os.path.isfile(f) else None

def data_uri(path):
    f = local(path)
    if not f: return None
    if f in cache: return cache[f]
    ext = os.path.splitext(f)[1].lower()
    raw = open(f, 'rb').read()
    mime = mimetypes.types_map.get(ext) or {'.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'}.get(ext, 'application/octet-stream')
    if ext in ('.jpg', '.jpeg', '.png', '.webp'):
        try:
            im = Image.open(io.BytesIO(raw))
            if im.width > 1200 or len(raw) > 60_000:
                if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
                buf = io.BytesIO()
                if im.mode in ('RGBA', 'LA', 'P'): im.convert('RGBA').save(buf, 'WEBP', quality=82, method=6)
                else: im.convert('RGB').save(buf, 'WEBP', quality=76, method=6)
                if buf.tell() < len(raw): raw, mime = buf.getvalue(), 'image/webp'
        except Exception:
            pass
    uri = f'data:{mime};base64,' + base64.b64encode(raw).decode()
    cache[f] = uri; stats['files'] += 1; stats['bytes'] += len(raw)
    return uri

def inline_css_urls(css, base='/'):
    def rep(m):
        u = m.group(2)
        if u.startswith('data:') or u.startswith('#') or u.startswith('http') or u.startswith('//'): return m.group(0)
        p = u if u.startswith('/') else os.path.normpath(os.path.join(os.path.dirname(base), u)).replace('\\', '/')
        d = data_uri(p)
        return f'url("{d}")' if d else m.group(0)
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', rep, css)

def fetch(url):
    if url.startswith('//'): url = 'https:' + url
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read()

def embed_font_css(url):
    css = fetch(url).decode()
    # the modern format only: one woff2 per face
    css = re.sub(r"src:\s*(url\([^)]*\.woff2[^)]*\)\s*format\(['\"]woff2['\"]\))[^;]*;", r'src: \1;', css)
    def rep(m):
        u = m.group(2)
        if not re.search(r'\.(woff2?|ttf|otf)(\?|$)', u): return m.group(0)
        try:
            b = fetch(u); stats['fonts'] += 1
            kind = 'woff2' if '.woff2' in u else ('woff' if '.woff' in u else 'truetype')
            return f'url("data:font/{kind};base64,{base64.b64encode(b).decode()}")'
        except Exception:
            return m.group(0)
    css = re.sub(r'url\((["\']?)([^)"\']+)\1\)', rep, css)
    # keep only the woff2 source where a rule lists several, so each face is embedded once
    css = re.sub(r'src:\s*(url\("data:font/woff2[^)]*\)\s*format\([^)]*\))[^;]*;', r'src: \1;', css)
    return css

s = open(SRC, encoding='utf-8').read()

# 1 the download button is not part of the downloaded page
s = re.sub(r'<!-- DESIGN-APPS:DLBTN:START -->[\s\S]*?<!-- DESIGN-APPS:DLBTN:END -->\n?', '', s)
s = re.sub(r'<a class="dsb-dl"[\s\S]*?</a>', '', s)

# 2 stylesheets inlined
def link_rep(m):
    href = m.group(1)
    f = local(href)
    if f and f.endswith('.css'):
        return '<style>\n' + inline_css_urls(open(f, encoding='utf-8').read(), href.split('?')[0]) + '\n</style>'
    if href.startswith('https://fonts.googleapis.com/css2') or href.startswith('https://api.fontshare.com'):
        try: return '<style>\n' + embed_font_css(H.unescape(href)) + '\n</style>'
        except Exception: return m.group(0)
    return m.group(0)
s = re.sub(r'<link rel="stylesheet" href="([^"]+)">', link_rep, s)
s = re.sub(r'<link href="(https://(?:fonts\.googleapis\.com/css2|api\.fontshare\.com)[^"]+)" rel="stylesheet">', link_rep, s)
s = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', s)

# 3 inline <style> blocks: their url()s
s = re.sub(r'(<style[^>]*>)([\s\S]*?)(</style>)', lambda m: m.group(1) + inline_css_urls(m.group(2)) + m.group(3), s)

# 4 the loading-screen demos, folded in so they still run
def loader_frame(m):
    tag, src = m.group(0), m.group(1)
    q = src.split('?', 1)[1] if '?' in src else ''
    page = open('public/loader-lab/index.html', encoding='utf-8').read()
    land = open('public/loader-lab/land.js', encoding='utf-8').read()
    lab = open('public/loader-lab/lab.js', encoding='utf-8').read().replace('location.search', repr('?' + q.split('"')[0]))
    page = page.replace('<script src="land.js"></script>', '<script>\n' + land + '\n</script>')
    page = page.replace('<script type="module" src="lab.js"></script>', '<script type="module">\n' + lab + '\n</script>')
    page = inline_css_urls(page)
    return tag.replace(f'src="{src}"', 'srcdoc="' + H.escape(page, quote=True) + '"')
s = re.sub(r'<iframe[^>]*src="(/loader-lab/index\.html[^"]*)"[^>]*>', loader_frame, s)

# 5 the live 3D needs the running site
s = re.sub(r'<iframe class="fabframe"[^>]*></iframe>',
           '<div class="fabframe" style="display:grid;place-items:center;background:#F7F9FC;font:500 15px/1.5 Switzer,sans-serif;color:#5A5F6B;text-align:center;padding:40px">'
           'The live facility model runs on the review site: open the Design tab there to turn it.</div>', s)

# 6 every local image, drawing and poster
def attr_rep(m):
    name, val = m.group(1), m.group(2)
    if name == 'srcset':
        parts = []
        for piece in val.split(','):
            bits = piece.strip().split(' ', 1)
            d = data_uri(bits[0]) if bits and bits[0].startswith('/') else None
            parts.append((d or bits[0]) + (' ' + bits[1] if len(bits) > 1 else ''))
        return f'{name}="{", ".join(parts)}"'
    if not val.startswith('/') or val.endswith('.html') or val.startswith('/#'): return m.group(0)
    d = data_uri(val)
    return f'{name}="{d}"' if d else m.group(0)
s = re.sub(r'\b(src|srcset|poster|xlink:href)="([^"]+)"', attr_rep, s)
s = re.sub(r'(<image\b[^>]*?\bhref=")(/[^"]+)(")', lambda m: m.group(1) + (data_uri(m.group(2)) or m.group(2)) + m.group(3), s)
s = re.sub(r'(<link rel="icon"[^>]*href=")(/[^"]+)(")', lambda m: m.group(1) + (data_uri(m.group(2)) or m.group(2)) + m.group(3), s)
s = re.sub(r'style="([^"]*url\([^"]*)"', lambda m: 'style="' + inline_css_urls(H.unescape(m.group(1))).replace('"', '&quot;') + '"', s)

# 7 an image used more than once is stored once: every use points at the one copy, set as the page loads
counts = {}
for m in re.finditer(r'\b(src|srcset)="(data:image/[a-z+]+;base64,[A-Za-z0-9+/=]{2000,})"', s): counts[m.group(2)] = counts.get(m.group(2), 0) + 1
for m in re.finditer(r'(<image\b[^>]*?\bhref=")(data:image/[a-z+]+;base64,[A-Za-z0-9+/=]{2000,})"', s): counts[m.group(2)] = counts.get(m.group(2), 0) + 1
shared = {u: f'x{i}' for i, u in enumerate(k for k, v in counts.items() if v > 1)}
if shared:
    BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    s = re.sub(r'\b(src|srcset)="(data:image/[a-z+]+;base64,[A-Za-z0-9+/=]{2000,})"', lambda m: f'{m.group(1)}="{BLANK}" data-dx="{m.group(1)}:{shared[m.group(2)]}"' if m.group(2) in shared else m.group(0), s)
    s = re.sub(r'(<image\b[^>]*?\bhref=")(data:image/[a-z+]+;base64,[A-Za-z0-9+/=]{2000,})"', lambda m: m.group(1) + BLANK + f'" data-dx="href:{shared[m.group(2)]}"' if m.group(2) in shared else m.group(0), s)
    lib = ',\n'.join(f'{k}:"{u}"' for u, k in shared.items())
    s = s.replace('</body>', '<script>/* images used more than once, stored once */(function(){var D={' + lib + '};document.querySelectorAll("[data-dx]").forEach(function(el){var p=el.getAttribute("data-dx").split(":");el.setAttribute(p[0],D[p[1]]);});})();</script>\n</body>', 1)

# 8 a note in the head
s = s.replace('<head>', '<head>\n<!-- IAQ design system, exported from Tab 04 of the IAQ review site by Brand Method. One file: styles, images, drawings and fonts inside. -->', 1)
open(OUT, 'w', encoding='utf-8').write(s)
left = sorted(set(re.findall(r'(?:src|href)="(/(?!#)[^"]+\.(?:png|jpg|jpeg|webp|svg|css|woff2?))"', s)))
print(f'bundle {OUT}: {round(os.path.getsize(OUT)/1e6,1)} MB, {stats["files"]} files inlined ({round(stats["bytes"]/1e6,1)} MB raw), {stats["fonts"]} font files, local refs left: {len(left)}', left[:5])
