"""Structured body extractor for iaqtechnology.com.my posts (Astra theme, entry-content clear).
Usage: python3 extract.py OUT.json file1.html file2.html ...
Emits {slug: {title, date, og_image, blocks:[{t:p|h|ul|img|gallery, ...}]}}"""
import sys, re, json, html, os
from html.parser import HTMLParser

VOID = {'br', 'img', 'hr', 'meta', 'link', 'input', 'source', 'wbr'}
SKIP_CLASS = re.compile(r'sharedaddy|jp-relatedposts|addtoany|share|post-navigation|comments|ast-author|related')


def best_src(a):
    srcset = a.get('srcset') or a.get('data-srcset') or a.get('data-lazy-srcset') or ''
    best, bw = None, -1
    for part in srcset.split(','):
        bits = part.strip().split()
        if len(bits) == 2 and bits[1].endswith('w'):
            try:
                w = int(bits[1][:-1])
            except ValueError:
                continue
            if w > bw:
                best, bw = bits[0], w
    src = a.get('data-src') or a.get('data-lazy-src') or a.get('src') or ''
    if src.startswith('data:'):
        src = ''
    return best or src, src


class Body(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.stack = []          # open tag names
        self.skip = 0            # depth inside skipped subtree
        self.skip_at = None
        self.buf = None          # current text block {'t':..,'text':[]}
        self.list = None
        self.li = None
        self.fig = None
        self.cap = None
        self.gallery = None
        self.strong_only = True

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get('class') or ''
        if tag not in VOID:
            self.stack.append(tag)
        if self.skip:
            return
        if tag in ('script', 'style', 'noscript', 'form', 'button') or (tag in ('div', 'section', 'nav', 'aside') and SKIP_CLASS.search(cls)):
            self.skip = len(self.stack)
            return
        if tag == 'figure' and 'wp-block-gallery' in cls:
            self.gallery = []
            return
        if tag == 'figure':
            self.fig = {'t': 'img', 'src': '', 'alt': '', 'cap': ''}
            return
        if tag == 'figcaption':
            self.cap = []
            return
        if tag == 'img':
            full, src = best_src(a)
            if 'uploads' not in (full or ''):
                return
            rec = {'t': 'img', 'src': full, 'alt': a.get('alt', ''), 'cap': ''}
            if self.fig is not None and not self.fig['src']:
                self.fig.update(src=full, alt=a.get('alt', ''))
            else:
                self.blocks.append(rec)
            return
        if tag in ('ul', 'ol'):
            self.list = {'t': tag, 'items': []}
            return
        if tag == 'li' and self.list is not None:
            self.li = []
            return
        if tag in ('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote') and self.li is None and self.cap is None:
            self.buf = {'t': 'h' if tag[0] == 'h' and tag != 'hr' else 'p', 'lvl': tag, 'text': []}
            self.strong_only = True
            return
        if tag == 'br':
            tgt = self.cap if self.cap is not None else self.li if self.li is not None else (self.buf['text'] if self.buf else None)
            if tgt is not None:
                tgt.append('\n')

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        # pop to matching tag
        if tag in self.stack:
            while self.stack:
                t = self.stack.pop()
                depth = len(self.stack) + 1
                if self.skip and depth == self.skip:
                    self.skip = 0
                    if t == tag:
                        return
                if t == tag:
                    break
        if self.skip:
            return
        if tag == 'figcaption' and self.cap is not None:
            txt = clean(''.join(self.cap))
            if self.fig is not None:
                self.fig['cap'] = txt
            elif self.gallery is not None:
                self.gallery.append({'t': 'gcap', 'text': txt})
            self.cap = None
        elif tag == 'figure':
            if self.fig is not None:
                if self.fig['src']:
                    (self.gallery if self.gallery is not None else self.blocks).append(self.fig)
                self.fig = None
            elif self.gallery is not None:
                imgs = [g for g in self.gallery if g.get('t') == 'img']
                if imgs:
                    self.blocks.append({'t': 'gallery', 'items': imgs})
                self.gallery = None
        elif tag == 'li' and self.li is not None:
            txt = clean(''.join(self.li))
            if txt:
                self.list['items'].append(txt)
            self.li = None
        elif tag in ('ul', 'ol') and self.list is not None:
            if self.list['items']:
                self.blocks.append(self.list)
            self.list = None
        elif self.buf is not None and tag in ('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'):
            txt = clean(''.join(self.buf['text']))
            if txt:
                b = {'t': self.buf['t'], 'text': txt}
                if self.buf['t'] == 'p' and self.strong_only and self.had_strong:
                    b['strong'] = True
                self.blocks.append(b)
            self.buf = None
            self.had_strong = False

    had_strong = False

    def handle_data(self, d):
        if self.skip:
            return
        if self.cap is not None:
            self.cap.append(d)
        elif self.li is not None:
            self.li.append(d)
        elif self.buf is not None:
            self.buf['text'].append(d)
            if d.strip():
                inside = any(t in ('strong', 'b') for t in self.stack)
                if inside:
                    self.had_strong = True
                else:
                    self.strong_only = False


def clean(s):
    s = s.replace(' ', ' ').replace('​', '')
    s = re.sub(r'[ \t\r\f\v]+', ' ', s)
    s = re.sub(r' *\n *', '\n', s)
    return s.strip()


def region(h):
    i = h.find('class="entry-content clear"')
    if i < 0:
        return None
    start = h.rfind('<', 0, i)
    depth = 0
    for m in re.finditer(r'<(/?)div\b[^>]*>', h[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return h[start:start + m.end()]
    return h[start:]


def meta(h, prop):
    m = re.search(r'<meta[^>]+property="%s"[^>]+content="([^"]*)"' % re.escape(prop), h)
    return html.unescape(m.group(1)) if m else ''


out = {}
for f in sys.argv[2:]:
    h = open(f, encoding='utf-8', errors='ignore').read()
    slug = os.path.basename(f).replace('.html', '')
    r = region(h)
    tm = re.search(r'<h1[^>]*class="entry-title[^"]*"[^>]*>(.*?)</h1>', h, re.S)
    rec = {
        'title': clean(html.unescape(re.sub('<[^>]+>', '', tm.group(1)))) if tm else '',
        'date': meta(h, 'article:published_time')[:10],
        'og_image': meta(h, 'og:image'),
        'og_desc': meta(h, 'og:description'),
        'blocks': [],
    }
    if r:
        p = Body()
        p.feed(r)
        rec['blocks'] = p.blocks
    out[slug] = rec
json.dump(out, open(sys.argv[1], 'w'), indent=1, ensure_ascii=False)
for s, r in out.items():
    kinds = {}
    for b in r['blocks']:
        kinds[b['t']] = kinds.get(b['t'], 0) + 1
    print(r['date'], s[:70], kinds, 'NO-REGION' if not r['blocks'] else '')
