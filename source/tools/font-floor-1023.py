"""23 Oct 2026, Polishing: the type floor on the public site (rule 14 and the standing font rule: nothing under 13 px, the
same size on every screen). Every px font size under 13 in the public-site stylesheets becomes 13 px: font-size, the
font shorthand, and clamp() minimums. Admin, portal, codex, booth and deck styles are left alone.
Usage: python3 tools/font-floor-1023.py [--apply]   (dry run by default: prints what would change)"""
import glob, os, re, shutil, sys
os.chdir('/Users/zieel/Bazil Claude 3/Websites/iaq website')
APPLY = '--apply' in sys.argv
SKIP = re.compile(r'(codex|portal|booth|console|presentation|qr-refs|prospect|deck|flow\.css|polish|webflow|admin|bmws)')
FLOOR = 13.0
num = r'(\d+(?:\.\d+)?)px'
def fix_size(m):
    v = float(m.group(2))
    return m.group(1) + ('13px' if v < FLOOR else m.group(2) + 'px')
total = 0
if APPLY: os.makedirs('src/_backups/fontfloor-1023', exist_ok=True)
for f in sorted(glob.glob('src/styles/*.css')):
    if SKIP.search(os.path.basename(f)): continue
    s = open(f, encoding='utf-8').read(); t = s; n = 0
    # font-size: 10.5px
    t, k = re.subn(r'(font-size:\s*)' + num, fix_size, t); n += k
    # font: 600 10.5px/1 "Switzer"  (the first px token in a font shorthand)
    def sh(m):
        decl = m.group(0)
        return re.sub(r'(\b)' + num, lambda mm: mm.group(1) + ('13px' if float(mm.group(2)) < FLOOR else mm.group(2) + 'px'), decl, count=1)
    t, k = re.subn(r'(?<![a-z-])font:\s*[^;{}]*?' + num + r'(?=\s*[/ "\'a-zA-Z,;])', sh, t); n += k
    # clamp(10.5px, ...) minimums
    t, k = re.subn(r'(font-size:\s*clamp\(\s*)' + num, fix_size, t); n += k
    changed = sum(1 for a, b in zip(s.split('\n'), t.split('\n')) if a != b)
    if changed:
        total += changed
        print(f'{changed:4} lines  {f}')
        if APPLY:
            shutil.copy(f, 'src/_backups/fontfloor-1023/' + os.path.basename(f)); open(f, 'w', encoding='utf-8').write(t)
print(('applied' if APPLY else 'dry run') + ':', total, 'lines across the public stylesheets')
