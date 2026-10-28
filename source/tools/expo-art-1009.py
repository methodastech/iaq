"""9 Oct 2026: two changes to variation D of the exhibition artwork, made on the print PDFs, then the PNGs (the portal
tiles and the 3D textures) rendered from them so every copy agrees. Pieces: back wall, side wall, counter front, aisle column. Run after tools/expo-portal-1009.py, which unpacks
the portal fresh: python3 tools/expo-art-1009.py   (the untouched files are in src/_backups/expo-1009/files/)

1. Back wall (Bazil: "just want the Europe timeline in the form like picture one but better, 2009 ... 2020, 2025 and
   2026 (now we are here at Europa)", "should replace this part" on the industries row): the industries row gives way
   to "Engineering across Europe", France 2009, IAQ Sweden 2020, IAQ Germany 2025, SEMICON Europa 2026 "We are here".
   Facts from IAQ's own company timeline. The industries stay on the D aisle column.
2. Side wall foot (Bazil: "Energy we don't want", "replace with a horizontal view of this" on the aisle column's
   cycle): the six services as the aisle column draws them, IAQ's isometric marks and names, laid in a row with the
   arrows and the return loop. Order and names as on the aisle column.
"""
import fitz, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(ROOT, 'public/booth/expo/files')
ORIG = os.path.join(ROOT, 'src/_backups/expo-1009/files')
# always from the untouched files, so a second run never edits an edit
for n in ['IAQ-D-Back-wall.pdf', 'IAQ-D-Side-wall.pdf', 'IAQ-D-Counter-front.pdf', 'IAQ-D-Aisle-column.pdf', 'IAQ-D-Leaflet-front.pdf', 'IAQ-D-Trifold-outside.pdf']: shutil.copy2(os.path.join(ORIG, n), os.path.join(F, n))
# the untouched 3D textures are kept beside the originals once, for the record
FONTS = os.path.join(ROOT, 'tools/expo-art')
RED, INK, WHITE = (0.925, 0.137, 0.149), (0.137, 0.122, 0.125), (1, 1, 1)
SW6, SW5 = os.path.join(FONTS, 'Switzer-600-normal.ttf'), os.path.join(FONTS, 'Switzer-500-normal.ttf')
f6, f5 = fitz.Font(fontfile=SW6), fitz.Font(fontfile=SW5)

def fonts(pg):
    pg.insert_font(fontname='sw6', fontfile=SW6); pg.insert_font(fontname='sw5', fontfile=SW5)

def text(pg, x, y, s, size, font='sw6', color=WHITE, center=False, lead=1.12):
    """y is the first baseline; lines split on \\n; center: x is the centre"""
    fo = f6 if font == 'sw6' else f5
    for i, line in enumerate(s.split('\n')):
        w = fo.text_length(line, fontsize=size)
        pg.insert_text((x - w / 2 if center else x, y + i * size * lead), line, fontsize=size, fontname=font, color=color)

def ground(pg, probe):
    """the fill of the largest shape under a point: the wall's ground colour"""
    best = None
    for d in pg.get_drawings():
        if d.get('fill') and d['rect'].contains(fitz.Point(*probe)):
            if best is None or d['rect'].get_area() > best['rect'].get_area(): best = d
    return best['fill'] if best else (1, 1, 1)

def clear(pg, rect, fill):
    pg.add_redact_annot(rect, fill=fill)
    # only shapes wholly inside the area go: the wall's full-page ground merely touches it and must stay
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_REMOVE, graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED, text=fitz.PDF_REDACT_TEXT_REMOVE)

def flag(pg, x, y, w, h, kind):
    r = fitz.Rect(x, y, x + w, y + h)
    if kind == 'fr':
        for i, c in enumerate([(0, .333, .643), (1, 1, 1), (.937, .255, .208)]): pg.draw_rect(fitz.Rect(x + i * w / 3, y, x + (i + 1) * w / 3, y + h), color=None, fill=c)
    elif kind == 'de':
        for i, c in enumerate([(0, 0, 0), (.867, 0, 0), (1, .808, 0)]): pg.draw_rect(fitz.Rect(x, y + i * h / 3, x + w, y + (i + 1) * h / 3), color=None, fill=c)
    elif kind == 'se':
        pg.draw_rect(r, color=None, fill=(0, .416, .655))
        pg.draw_rect(fitz.Rect(x + w * 5 / 16, y, x + w * 7 / 16, y + h), color=None, fill=(.996, .8, 0))
        pg.draw_rect(fitz.Rect(x, y + h * .4, x + w, y + h * .6), color=None, fill=(.996, .8, 0))
    pg.draw_rect(r, color=WHITE, width=6)

def pin(pg, x, ytop, h, color, width):
    """a map pin, outline, its point at (x + h*.36, ytop + h)"""
    s = h / 24.0; ox, oy = x - 6 * s, ytop - 2 * s
    P = lambda a, b: fitz.Point(ox + a * s, oy + b * s)
    sh = pg.new_shape()
    sh.draw_bezier(P(12, 23), P(12, 23), P(6, 16.6), P(6, 11.5))
    sh.draw_bezier(P(6, 11.5), P(6, 8.2), P(8.7, 5.5), P(12, 5.5))
    sh.draw_bezier(P(12, 5.5), P(15.3, 5.5), P(18, 8.2), P(18, 11.5))
    sh.draw_bezier(P(18, 11.5), P(18, 16.6), P(12, 23), P(12, 23))
    sh.finish(color=color, width=width, closePath=True)
    sh.draw_circle(P(12, 11.5), 2.4 * s); sh.finish(color=color, width=width)
    sh.commit()

def chevron(pg, x, y, size, color, width, direction):
    d = 1 if direction == 'right' else -1
    pg.draw_polyline([fitz.Point(x - d * size, y - size), fitz.Point(x, y), fitz.Point(x - d * size, y + size)], color=color, width=width)

# ---------- 1 · back wall: the IAQ and the title centred and the IAQ larger; the Europe timeline, premium ----------
# (Bazil, 9 Oct: "centre title and IAQ", "make IAQ bigger if possible", "please refine the new one to look more premium")
def image_with_mask(doc, xref):
    pix = fitz.Pixmap(doc, xref)
    sm = doc.extract_image(xref).get('smask')
    if sm: pix = fitz.Pixmap(pix, fitz.Pixmap(doc, sm))
    return pix
p = os.path.join(F, 'IAQ-D-Back-wall.pdf'); doc = fitz.open(p); pg = doc[0]
red = ground(pg, (1500, 7700))
CX = 2459                                        # the middle of the visible 1736 mm (the right 310 mm sits behind the side wall)
logo = image_with_mask(doc, 4)
clear(pg, fitz.Rect(250, 330, 4700, 2140), red)  # the IAQ and the title
clear(pg, fitz.Rect(250, 6200, 4700, 8640), red) # the industries row (the wall's long line at 8704 stays)
fonts(pg)
LW = 1780; LH = LW * logo.height / logo.width
pg.insert_image(fitz.Rect(CX - LW / 2, 300, CX + LW / 2, 300 + LH), pixmap=logo)
text(pg, CX, 1660, 'Engineering Today.', 396.6, center=True)
text(pg, CX, 2080, 'Advancing Tomorrow.', 396.6, center=True)
SOFT = (0.97, 0.86, 0.87)                        # white at 85% over the wall red
text(pg, CX, 6660, 'Engineering across Europe', 156, center=True)
# 9 Oct, later (Bazil: "please update it from 1995", with a picture): the timeline starts at the founding in Shah Alam
text(pg, CX, 6800, 'From our headquarters in Shah Alam to SEMICON Europa, Munich.', 84, font='sw5', color=SOFT, center=True)
LINE_Y = 7520
CENT = [CX + (i - 2) * 880 for i in range(5)]   # five stops centred on the visible wall; labels measured: 136 pt clear between neighbours
pg.draw_line(fitz.Point(380, LINE_Y), fitz.Point(4530, LINE_Y), color=WHITE, width=14)
chevron(pg, 4570, LINE_Y, 46, WHITE, 14, 'right')
STOPS = [
    ('1995', 'my', 'Established', 'Headquarters in\nShah Alam, Malaysia'),
    ('2009', 'fr', 'France', 'Tool hook-up for a\nspecialty foundry'),
    ('2020', 'se', 'IAQ Sweden', 'Dry rooms and\nmechanical works\nfor EV batteries'),
    ('2025', 'de', 'IAQ Germany', 'Dresden. Design\nand build for a\nleading foundry'),
    ('2026', None, 'We are here', 'SEMICON Europa\nMunich\n10 to 13 November'),   # dates: messe-muenchen.de, re-checked 9 Oct
]
R = 132
for cx, (year, fl, name, line) in zip(CENT, STOPS):
    text(pg, cx, LINE_Y - 230, year, 210, center=True)
    if fl:
        pg.insert_image(fitz.Rect(cx - R, LINE_Y - R, cx + R, LINE_Y + R), filename=os.path.join(FONTS, f'flag-{fl}.png'))
        pg.draw_circle(fitz.Point(cx, LINE_Y), R + 6, color=WHITE, width=14)
    else:
        pg.draw_circle(fitz.Point(cx, LINE_Y), R + 6, color=WHITE, fill=WHITE, width=1)
        pg.draw_circle(fitz.Point(cx, LINE_Y), R + 30, color=WHITE, width=6)
        pin(pg, cx - 40, LINE_Y - 82, 148, RED, 14)
    text(pg, cx, LINE_Y + 300, name, 112, center=True)
    text(pg, cx, LINE_Y + 430, line, 84, font='sw5', color=SOFT, center=True, lead=1.2)
doc.save(p + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(p + '.tmp', p)

# ---------- 2 · side wall foot: the six services, the aisle column's cycle laid horizontal ----------
ac = fitz.open(os.path.join(F, 'IAQ-C-Aisle-column-option-2.pdf'))
icons = []
for info in sorted(ac[0].get_image_info(xrefs=True), key=lambda i: i['bbox'][1]):
    if info['bbox'][1] < 1500: continue          # the IAQ at the top
    pix = fitz.Pixmap(ac, info['xref'])
    if pix.n - pix.alpha > 3: pix = fitz.Pixmap(fitz.csRGB, pix)
    icons.append(pix.tobytes('png'))
NAMES = ['Design and\nconsultation', 'Procurement', 'Construction', 'Testing and\ncommissioning', 'Maintenance', 'Tools hookup']
assert len(icons) == 6, len(icons)
p = os.path.join(F, 'IAQ-D-Side-wall.pdf'); doc = fitz.open(p); pg = doc[0]
white = ground(pg, (4000, 8000))
clear(pg, fitz.Rect(200, 7575, 7900, 8475), white)
fonts(pg)
IW, IH, X0, X1, TOP = 880, 440, 470, 7610, 7610
gap = (X1 - X0 - 6 * IW) / 5
MID = TOP + IH / 2
xs = [X0 + i * (IW + gap) for i in range(6)]
for i, x in enumerate(xs):
    pg.insert_image(fitz.Rect(x, TOP, x + IW, TOP + IH), stream=icons[i])
    text(pg, x + IW / 2, TOP + IH + 100, NAMES[i], 88, color=INK, center=True)
    if i < 5:
        a, b = x + IW + 40, xs[i + 1] - 40
        pg.draw_line(fitz.Point(a, MID), fitz.Point(b, MID), color=RED, width=8)
        chevron(pg, (a + b) / 2 + 14, MID, 26, RED, 8, 'right')
# the return loop: out of the last, down and back along the foot, up and into the first
LOOP_Y, LX, RX = 8395, 300, 7780
loop = [fitz.Point(xs[5] + IW + 40, MID), fitz.Point(RX, MID), fitz.Point(RX, LOOP_Y), fitz.Point(LX, LOOP_Y), fitz.Point(LX, MID), fitz.Point(X0 - 40, MID)]
pg.draw_polyline(loop, color=RED, width=8)
chevron(pg, (LX + RX) / 2 - 14, LOOP_Y, 26, RED, 8, 'left')
chevron(pg, X0 - 40, MID, 30, RED, 8, 'right')
doc.save(p + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(p + '.tmp', p)

# ---------- 3 · counter front: the QR and its words clearer and bigger (Bazil, 9 Oct: "a bit clearer and bigger") ----------
p = os.path.join(F, 'IAQ-D-Counter-front.pdf'); doc = fitz.open(p); pg = doc[0]
white = ground(pg, (850, 1600))
qr = fitz.Pixmap(doc, 8)
clear(pg, fitz.Rect(120, 1100, 1600, 2420), white)  # the QR, its words, the line and the address, set again larger
fonts(pg)
text(pg, 142, 1250, 'Scan to visit our website.', 84, color=INK)
text(pg, 142, 1360, 'The 3D story and the projects.', 76, font='sw5', color=(0.28, 0.33, 0.42))
QS = 1100
pg.insert_image(fitz.Rect(142, 1440, 142 + QS, 1440 + QS), pixmap=qr)
pg.draw_rect(fitz.Rect(142, 2620, 1558, 2628), color=None, fill=RED)
text(pg, 142, 2760, 'iaqtechnology.com.my', 84, color=INK)
doc.save(p + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(p + '.tmp', p)

# ---------- 4 · aisle column: the four industries as isometric renders, no rules between them ----------
# (Bazil, 9 Oct: "on the industry we serve need amazing detailing or isometric view", "try to remove the lines").
# The renders are Higgsfield GPT Image 2.5, made to match the aisle column's own service marks (tools/expo-art/industry-*.png)
p = os.path.join(F, 'IAQ-D-Aisle-column.pdf'); doc = fitz.open(p); pg = doc[0]
white = ground(pg, (440, 5000))
for r in [(90, 2650, 790, 3270), (90, 4135, 790, 4755), (90, 5620, 790, 6240), (90, 7105, 790, 7722)]:
    clear(pg, fitz.Rect(*r), white)            # each old line icon and the rule above it (the long line at 8704 stays)
LABEL_TOP = [3282, 4767, 6251, 7730]
BW, BH = 680, 540
for n, top in enumerate(LABEL_TOP):
    from PIL import Image as _I
    im = _I.open(os.path.join(FONTS, f'industry-{n}.png')); k = min(BW / im.width, BH / im.height)
    w, h = im.width * k, im.height * k
    x0 = 99 + (BW - w) / 2; y1 = top - 50
    pg.insert_image(fitz.Rect(x0, y1 - h, x0 + w, y1), filename=os.path.join(FONTS, f'industry-{n}.png'))
doc.save(p + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(p + '.tmp', p)

# ---------- 5 · leaflet and trifold covers: the stand from IAQ's own poster ("Visit us at Booth No. C1 128") ----------
for n in ['IAQ-D-Leaflet-front.pdf', 'IAQ-D-Trifold-outside.pdf']:
    p = os.path.join(F, n); doc = fitz.open(p); pg = doc[0]
    hits = pg.search_for('Hall and stand [to confirm]')
    assert hits, n + ': cover line not found'
    r = hits[0]; base = r.y1 - 2.2
    pg.add_redact_annot(fitz.Rect(r.x0 - 1, r.y0 - 1, r.x1 + 2, r.y1 + 1), fill=ground(pg, (r.x0 + 1, r.y0 - 30)))
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE, text=fitz.PDF_REDACT_TEXT_REMOVE)
    fonts(pg)
    text(pg, r.x0, base, 'Booth C1 128', 9.7, font='sw5', color=INK)
    doc.save(p + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(p + '.tmp', p)

# ---------- 6 · the industries headings in title case, "and" as "&" ----------
# (Bazil, 9 Oct, on the D aisle column: "please capitalize the important words", "and replace and with &").
# Same words on the D trifold outside. Each line is taken out (text only, no fill, so the photo or the ground stays)
# and set again on its own baseline in Switzer Semibold, the weight measured from the embedded font's widths.
TITLES = {
    'we serve': 'We Serve', 'Industries we serve': 'Industries We Serve',
    'Foundry and': 'Foundry &', 'fabrication': 'Fabrication', 'Foundry and fabrication': 'Foundry & Fabrication',
    'packaging': 'Packaging', 'Advanced packaging': 'Advanced Packaging',
    'Probe, test and': 'Probe, Test &', 'assembly, OSAT': 'Assembly, OSAT',
    'EV batteries': 'EV Batteries',
}
def retitle(path):
    doc = fitz.open(path); pg = doc[0]; todo = []
    for b in pg.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for sp in l['spans']:
                if sp['text'] in TITLES: todo.append(sp)
    for sp in todo:
        x0, _, x1, _ = sp['bbox']; oy, sz = sp['origin'][1], sp['size']
        # a thin band through the letters of this line only, so the line above and below are never touched
        pg.add_redact_annot(fitz.Rect(x0 - 1, oy - .5 * sz, x1 + 2, oy - .25 * sz), fill=False)
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE, text=fitz.PDF_REDACT_TEXT_REMOVE)
    fonts(pg)
    for sp in todo:
        c = sp['color']; rgb = ((c >> 16 & 255) / 255, (c >> 8 & 255) / 255, (c & 255) / 255)
        pg.insert_text(sp['origin'], TITLES[sp['text']], fontsize=sp['size'], fontname='sw6', color=rgb)
    doc.save(path + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(path + '.tmp', path)
    print('title case', os.path.basename(path), len(todo), 'lines')
for n in ['IAQ-D-Aisle-column.pdf', 'IAQ-D-Trifold-outside.pdf']: retitle(os.path.join(F, n))

# ---------- the PNGs, from the PDFs: 1 px per mm, as delivered ----------
for n, w in [('IAQ-D-Back-wall', 2046), ('IAQ-D-Side-wall', 2852), ('IAQ-D-Counter-front', 600), ('IAQ-D-Aisle-column', 310), ('IAQ-D-Leaflet-front', 1118), ('IAQ-D-Trifold-outside', 2246)]:
    d = fitz.open(os.path.join(F, n + '.pdf')); pgx = d[0]; z = w / pgx.rect.width
    hpx = {'IAQ-D-Counter-front': round(w * pgx.rect.height / pgx.rect.width), 'IAQ-D-Leaflet-front': 1588, 'IAQ-D-Trifold-outside': 1588}.get(n, 3472)
    pix = pgx.get_pixmap(matrix=fitz.Matrix(z, hpx / pgx.rect.height), alpha=False)
    pix.save(os.path.join(F, n + '.png'))
    print(n, 'png', pix.width, pix.height)
# the 3D views use JPEG copies of each wall at the same size (tex-D-back-wall.jpg ...): written from the new PNGs
from PIL import Image
for n, t in [('IAQ-D-Back-wall', 'tex-D-back-wall.jpg'), ('IAQ-D-Side-wall', 'tex-D-side-wall.jpg'), ('IAQ-D-Counter-front', 'tex-D-counter-front.jpg'), ('IAQ-D-Aisle-column', 'tex-D-aisle-column.jpg')]:
    Image.open(os.path.join(F, n + '.png')).convert('RGB').save(os.path.join(F, t), quality=86, optimize=True, progressive=True)
    print('3D texture', t)
print('done')

# ---------- the portal's own description of variation D, kept true ----------
ip = os.path.join(ROOT, 'public/booth/expo/index.html'); h = open(ip, encoding='utf-8').read()
old = "<li>Back wall: Engineering Today. Advancing Tomorrow., with the industries as hexagons; the aisle column carries them too.</li>"
new = "<li>Back wall: Engineering Today. Advancing Tomorrow., the offices on the map, and a timeline from the founding in Shah Alam in 1995, through France, Sweden and Germany, to SEMICON Europa 2026; the industries on the aisle column.</li>"
prev = "<li>Back wall: Engineering Today. Advancing Tomorrow., the offices on the map, and a timeline across Europe from France in 2009 to SEMICON Europa 2026; the industries on the aisle column.</li>"
if old in h: h = h.replace(old, new, 1); print('D card updated')
elif prev in h: h = h.replace(prev, new, 1); print('D card updated to 1995')
elif new in h: print('D card already updated')
else: print('D card text not found: check the portal copy')
for a, b in [('<span class="label">Hall and stand</span><b>To confirm</b>', '<span class="label">Hall and stand</span><b>Booth C1 128</b>'),
             ('<h4>Hall and stand number</h4><p class="sub">Shown as “to confirm” on the leaflet and trifold covers.</p>', '<h4>Booth C1 128</h4><p class="sub">From IAQ’s pre-event poster; on the variation D leaflet and trifold covers. Confirm with Green Excel before print.</p>')]:
    if a in h: h = h.replace(a, b, 1); print('portal fact updated')
open(ip, 'w', encoding='utf-8').write(h)
