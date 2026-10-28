#!/usr/bin/env python3
"""29 Sep 2026, night. Set a line of text in one of the site's own font files and return it as an SVG path, so a
drawing that is served through <img> (which cannot load web fonts) still carries the brand face. Used by
build-fab.mjs for the fab's labels (Switzer). Applies the font's GPOS pair kerning.
stdin: JSON list of {"text", "font" (path to .woff2/.ttf/.otf), "size" (px)}
stdout: JSON list of {"d" (path, baseline at y = 0, starting at x = 0), "width"}"""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

_fonts = {}


def load(path):
    if path in _fonts:
        return _fonts[path]
    f = TTFont(path)
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    upm = f['head'].unitsPerEm
    pairs = []  # (kind, data) from the kern feature's pair lookups
    if 'GPOS' in f:
        g = f['GPOS'].table
        idx = set()
        for fr in g.FeatureList.FeatureRecord:
            if fr.FeatureTag == 'kern':
                idx.update(fr.Feature.LookupListIndex)
        for i in sorted(idx):
            lk = g.LookupList.Lookup[i]
            for st in lk.SubTable:
                t = lk.LookupType
                if t == 9:
                    t, st = st.ExtensionLookupType, st.ExtSubTable
                if t == 2:
                    pairs.append(st)
    _fonts[path] = (f, gs, cmap, upm, pairs)
    return _fonts[path]


def kern(pairs, a, b):
    for st in pairs:
        cov = st.Coverage.glyphs
        if a not in cov:
            continue
        if st.Format == 1:
            ps = st.PairSet[cov.index(a)]
            for r in ps.PairValueRecord:
                if r.SecondGlyph == b:
                    v = r.Value1
                    return (getattr(v, 'XAdvance', 0) or 0) if v else 0
        elif st.Format == 2:
            c1 = st.ClassDef1.classDefs.get(a, 0)
            c2 = st.ClassDef2.classDefs.get(b, 0)
            r = st.Class1Record[c1].Class2Record[c2]
            v = r.Value1
            x = getattr(v, 'XAdvance', 0) if v else 0
            if x:
                return x
    return 0


def setline(text, path, size):
    f, gs, cmap, upm, pairs = load(path)
    s = size / upm
    names = [cmap.get(ord(ch), '.notdef') for ch in text]
    x = 0.0
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    for i, n in enumerate(names):
        g = gs[n]
        tp = TransformPen(pen, (s, 0, 0, -s, x * s, 0))
        g.draw(tp)
        x += g.width
        if i + 1 < len(names):
            x += kern(pairs, n, names[i + 1])
    return {'d': pen.getCommands(), 'width': round(x * s, 2)}


if __name__ == '__main__':
    req = json.load(sys.stdin)
    out = [setline(r['text'], r['font'], r['size']) for r in req]
    json.dump(out, sys.stdout)
