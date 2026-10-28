#!/usr/bin/env python3
"""30 Sep 2026: Direction F's photoreal renders (public/booth/f3d, generated CGI) graded to the IAQ palette, into
public/booth/f3d/iaq/ (the originals stay as delivered):
  every hue except red goes to its own grey (the blue pumps, the yellow and green pipes: no yellow, no royal or bright
  blue on IAQ's pieces), red is kept as rendered;
  ONE red part per render: on column-stack the second red (the pump in the lowest layer) goes grey too;
  the ground is lifted to pure white (the renders sit at 254), so a render meets the wall's own white with no box edge.
Writes <name>.jpg (full size, for print) and <name>.webp (1600 wide, for the screen).
Usage: python3 tools/booth-f3d-grade-0930.py"""
import os
import numpy as np
from PIL import Image

SRC, OUT = 'public/booth/f3d', 'public/booth/f3d/iaq'
os.makedirs(OUT, exist_ok=True)
# the second red to take out, as (name, top fraction): reds below that height go grey
EXTRA = {'column-stack': 0.62}

def grade(name):
    im = Image.open(f'{SRC}/{name}.jpg').convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # hue in degrees
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    red = ((h < 18) | (h > 342)) & (s > 0.25)
    if name in EXTRA:
        rows = np.arange(a.shape[0])[:, None] / a.shape[0]
        red &= ~(rows > EXTRA[name])
    lum = (0.299 * r + 0.587 * g + 0.114 * b)[..., None]
    k = np.clip((s - 0.05) / 0.12, 0, 1)[..., None] * (~red)[..., None]
    out = a * (1 - k) + lum * k
    out = np.clip(out * (255.0 / 252.0), 0, 1)          # the ground to pure white
    img = Image.fromarray((out * 255 + 0.5).astype(np.uint8))
    img.save(f'{OUT}/{name}.jpg', 'JPEG', quality=90, optimize=True)
    w = img.resize((1600, round(1600 * img.height / img.width)), Image.LANCZOS)
    w.save(f'{OUT}/{name}.webp', 'WEBP', quality=86)
    print(name, img.size, 'red px kept', int(red.sum()))

for f in sorted(os.listdir(SRC)):
    if f.endswith('.jpg'):
        grade(f[:-4])
