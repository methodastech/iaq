"""22 Oct 2026: contact sheets for the Polishing review. A full-page capture is cut into 1440x2000 segments,
each scaled to a third, and laid out four across, so a whole page reads at a glance beside its other version.
Usage: python3 tools/polish-sheet.py <outdir> <slug> [<slug> ...]   (writes <outdir>/<slug>-old.jpg and -new.jpg)"""
import sys, os, json
from PIL import Image
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
SEG, SC, COLS = 2000, 3, 4
for slug in sys.argv[2:]:
    for side in ('old', 'new'):
        j = f'public/polish/{side}/{slug}.json'
        if not os.path.exists(j): print(slug, side, 'missing'); continue
        ext = json.load(open(j)).get('ext', 'webp')
        p = f'public/polish/{side}/{slug}.{ext}'
        if not os.path.exists(p) or os.path.getsize(p) == 0: print(slug, side, 'no image'); continue
        im = Image.open(p).convert('RGB'); W, H = im.size
        n = (H + SEG - 1) // SEG; rows = (n + COLS - 1) // COLS
        sw, sh = W // SC, SEG // SC
        sheet = Image.new('RGB', (COLS * sw + (COLS - 1) * 8, rows * sh + (rows - 1) * 8), (230, 234, 240))
        for i in range(n):
            seg = im.crop((0, i * SEG, W, min(H, (i + 1) * SEG))).resize((sw, max(1, (min(H, (i + 1) * SEG) - i * SEG) // SC)), Image.LANCZOS)
            sheet.paste(seg, ((i % COLS) * (sw + 8), (i // COLS) * (sh + 8)))
        f = f'{out}/{slug}-{side}.jpg'; sheet.save(f, quality=80); print(f, sheet.size, 'from', (W, H))
