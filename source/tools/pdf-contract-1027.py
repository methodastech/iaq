"""27 Oct 2026: "under one contract" out of finished PDFs (the phrase only) whose source can no longer
re-export them as they were: the exhibition portal's print files (public/booth/expo/files) and the 47-page booth plan.
Bazil: "remove 'under one contract' from the booth artwork, booth data, deck and Codex too"; IAQ asked for the line off on
24 Sep. Each matched block of lines is taken out (text only, no fill, so the ground stays) and set again on the first
line's baseline in Switzer; the weight is picked by matching the ink coverage of the original glyphs (400/500/600), the
colour is sampled from the rendered glyphs (white on the red grounds).   python3 tools/pdf-contract-1027.py <pdf> ...
Originals: _backups/nr-open-1026/expo-1027 and _backups/nr-open-1026/contract-1027."""
import fitz, io, os, sys
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FT = os.path.join(ROOT, 'tools/expo-art')
WEIGHTS = {400: 'Switzer-400-normal.ttf', 500: 'Switzer-500-normal.ttf', 600: 'Switzer-600-normal.ttf'}
SWAPS = [   # 27 Oct, Bazil ("do not overwrite the copywriting"): the phrase is removed, nothing is reworded
    (['Builds the facility, under one contract.'], ['Builds the facility.']),
    (['Builds the facility,', 'under one contract.'], ['Builds the facility.']),
    (['Builds the facility, under', 'one contract.'], ['Builds the facility.']),
    (['Builds the facility, under one', 'contract.'], ['Builds the facility.']),
    (['Cleanrooms and the whole hi-tech facility, under one contract: EPCC, or EPCM for', 'the largest programmes.'],
     ['Cleanrooms and the whole hi-tech facility: EPCC, or EPCM for', 'the largest programmes.']),
]

def raster(pg, rect, z):
    pix = pg.get_pixmap(matrix=fitz.Matrix(z, z), clip=rect, alpha=False)
    return np.asarray(Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')).astype(float)

def look(a):
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bg = np.median(border, axis=0)
    d = np.linalg.norm(a - bg, axis=2)
    ink = np.median(a[d >= np.percentile(d, 99)], axis=0)
    return bg, ink, (d > 60).mean()

def style(pg, line):
    sp = line['spans'][0]; sz = sp['size']; text = ''.join(s['text'] for s in line['spans'])
    rect = fitz.Rect(line['bbox'][0] - 2, sp['origin'][1] - sz * .95, line['bbox'][2] + 2, sp['origin'][1] + sz * .3)
    z = 80 / rect.height
    bg, ink, cov = look(raster(pg, rect, z))
    ink = np.array([255, 255, 255]) if ink.mean() > 225 else (np.array([0x23, 0x1f, 0x20]) if ink.mean() < 70 else ink)
    best, gap = 400, 9
    for w, f in WEIGHTS.items():
        d = fitz.open(); p = d.new_page(width=pg.rect.width, height=pg.rect.height)
        p.draw_rect(p.rect, color=None, fill=tuple(bg / 255)); p.insert_font(fontname='f', fontfile=os.path.join(FT, f))
        p.insert_text(sp['origin'], text, fontsize=sz, fontname='f', color=tuple(ink / 255))
        c = look(raster(p, rect, z))[2]
        if abs(c - cov) < gap: best, gap = w, abs(c - cov)
    return best, tuple(ink / 255)

def fix(path):
    doc = fitz.open(path); n = 0
    for pg in doc:
        L = [(''.join(s['text'] for s in l['spans']).strip(), l) for b in pg.get_text('dict')['blocks'] for l in b.get('lines', [])]
        texts = [t for t, _ in L]; plan = []
        for old, new in SWAPS:
            for i in range(len(texts) - len(old) + 1):
                if texts[i:i + len(old)] == old:
                    ls = [L[i + k][1] for k in range(len(old))]
                    plan.append((ls, new, *style(pg, ls[0])))
        if not plan: continue
        for ls, *_ in plan:
            for l in ls:
                sp = l['spans'][0]; oy, sz = sp['origin'][1], sp['size']
                pg.add_redact_annot(fitz.Rect(l['bbox'][0] - .5, oy - .5 * sz, l['bbox'][2] + 1, oy - .25 * sz), fill=False)
        pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE, text=fitz.PDF_REDACT_TEXT_REMOVE)
        for w, f in WEIGHTS.items(): pg.insert_font(fontname=f'sw{w}', fontfile=os.path.join(FT, f))
        for ls, new, w, ink in plan:
            for k, t in enumerate(new):
                sp = ls[min(k, len(ls) - 1)]['spans'][0]
                origin = sp['origin'] if k < len(ls) else (sp['origin'][0], sp['origin'][1] + (k - len(ls) + 1) * sp['size'] * 1.2)
                pg.insert_text(origin, t, fontsize=sp['size'], fontname=f'sw{w}', color=ink)
            n += 1
            print(f'  p{pg.number + 1}: {" / ".join(t for t in new)}  ({w}, {"#%02x%02x%02x" % tuple(int(c * 255) for c in ink)})')
    doc.save(path + '.tmp', garbage=3, deflate=True); doc.close(); os.replace(path + '.tmp', path)
    print(os.path.relpath(path, ROOT), n, 'blocks')

for p in sys.argv[1:]: fix(os.path.abspath(p))
