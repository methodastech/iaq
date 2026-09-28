#!/usr/bin/env python3
"""The Design tab's application photographs, graded. 25 Sep 2026, rewritten late night.

Bazil, on the navy duotone this script used to make: "Use the actual picture that we have, but reduce the yellowish
part ... more the red, the blue, even occasionally some green. Don't photo edit straightforward like this, that looks
very very bad." So the photographs stay in full colour. Three corrections only:
  1. the warm cast comes out of the highlights (a partial grey-world balance on the bright pixels), so a cleanroom
     reads white and not cream;
  2. yellows and oranges (hue 28 to 72 degrees) lose most of their saturation, which is what makes lighting and
     floors look yellowish; reds, blues and greens keep theirs;
  3. a little contrast and a slight lift of the whites.
Output: public/design/photos/<name>.jpg"""
import numpy as np
from PIL import Image

SRC = {'vision': 'projects/prj-008.webp', 'mission': 'units/hero-hookup.jpg', 'sig': 'contact-cleanroom.webp',
       'tender': 'projects/prj-002.webp', 'investor': 'hero-campus.webp', 'card': 'markets/band-semiconductor.jpg',
       'ru1': 'contact-cleanroom.webp', 'ru2': 'markets/band-ev-battery.jpg', 'ru3': 'culture/cleanroom-team-rep.webp',
       'ad-a': 'markets/band-semiconductor.jpg', 'ad-b': 'banners/mkt-ev-battery.jpg', 'folder': 'projects/prj-010.webp'}


def grade(a):
    # 1. take the warm cast out of the highlights
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    hi = L > np.quantile(L, .82)
    mean = a[hi].mean(0)
    gain = (mean.mean() / np.maximum(mean, 1e-3)) ** 0.75
    a = np.clip(a * gain, 0, 1)
    # 2. yellows and oranges lose most of their saturation; reds, blues and greens keep theirs
    mx, mn = a.max(-1), a.min(-1)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    hue = (np.degrees(np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)) + 360) % 360
    band = np.clip(1 - np.abs(hue - 50) / 22, 0, 1)            # peaks at 50 degrees, zero outside 28 to 72
    k = 1 - 0.72 * band                                          # keep 28% of a yellow's saturation
    L = (0.2126 * r + 0.7152 * g + 0.0722 * b)[..., None]
    a = L + (a - L) * k[..., None]
    # 3. a little contrast, whites lifted
    a = np.clip((a - .5) * 1.06 + .5 + .015, 0, 1)
    return a


if __name__ == '__main__':
    for key, f in SRC.items():
        im = Image.open('public/assets/' + f).convert('RGB')
        if im.width > 2000:
            im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
        out = grade(np.asarray(im).astype(float) / 255)
        Image.fromarray((out * 255).astype('uint8')).save(f'public/design/photos/{key}.jpg', quality=86, optimize=True)
        print(key, im.size)
