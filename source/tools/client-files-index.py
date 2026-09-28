#!/usr/bin/env python3
"""Client files index (25 Sep 2026). Walks the client store (Client info/IAQ, outside the repo), writes a
manifest and a thumbnail per file into _reference/client-files/ (outside public/, so the launch build can
never ship it). The Client files tab page is generated from the manifest by client-files-page.py.
Originals are never touched: read only. Re-run any time; thumbs are skipped when up to date."""
import os, sys, json, subprocess, hashlib, time
from PIL import Image, ImageOps
STORE = '/Users/zieel/Bazil Claude 3/Client info/IAQ'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '_reference', 'client-files')
THUMBS = os.path.join(OUT, 'thumbs'); os.makedirs(THUMBS, exist_ok=True)
FF = '/Users/zieel/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'
IMG = {'jpg','jpeg','png','webp','gif','bmp','tif','tiff'}; HEIC = {'heic','heif'}
VID = {'mp4','mov','m4v','webm','avi','mkv'}; QL = {'pdf','pptx','docx','xlsx','ai','vsdx','otf','ttf','psd','key','pages','numbers'}
TW = 560
def tid(rel): return hashlib.md5(rel.encode('utf-8')).hexdigest()[:16]
def save(im, dst):
    im = ImageOps.exif_transpose(im).convert('RGB'); im.thumbnail((TW, TW)); im.save(dst, 'JPEG', quality=78, optimize=True); return im.size
def thumb_image(src, dst):
    with Image.open(src) as im: return save(im, dst)
def thumb_heic(src, dst):
    tmp = dst + '.tmp.jpg'; subprocess.run(['sips','-s','format','jpeg','-Z',str(TW*2),src,'--out',tmp], capture_output=True)
    if not os.path.exists(tmp): return None
    with Image.open(tmp) as im: s = save(im, dst)
    os.remove(tmp); return s
def probe_video(src):
    r = subprocess.run([FF,'-hide_banner','-i',src], capture_output=True, text=True); out = r.stderr
    dur = None; wh = None
    for line in out.splitlines():
        if 'Duration:' in line:
            t = line.split('Duration:')[1].split(',')[0].strip()
            try: h,m,s = t.split(':'); dur = int(h)*3600+int(m)*60+float(s)
            except: pass
        if 'Video:' in line:
            import re; m = re.search(r'(\d{2,5})x(\d{2,5})', line)
            if m: wh = (int(m.group(1)), int(m.group(2)))
    codec = None
    for line in out.splitlines():
        if 'Video:' in line:
            import re; mm = re.search(r'Video: ([a-z0-9]+)', line)
            if mm: codec = mm.group(1)
    return dur, wh, codec
PROXIES = os.path.join(OUT, 'proxies'); os.makedirs(PROXIES, exist_ok=True)
def proxy_video(src, dst):
    """25 Sep (Bazil: "why cant i open this file"): HEVC and MPEG-4 part 2 do not play in a page; a 720p H.264 proxy does.
    The original is untouched; the tab plays the proxy and links the original."""
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src): return True
    r = subprocess.run([FF,'-v','error','-y','-i',src,'-vf','scale=-2:720','-c:v','libx264','-preset','veryfast','-crf','26','-pix_fmt','yuv420p','-movflags','+faststart','-c:a','aac','-b:a','96k',dst], capture_output=True)
    return r.returncode == 0 and os.path.exists(dst)
def thumb_video(src, dst, dur):
    ss = '2' if (dur or 0) > 4 else '0'
    subprocess.run([FF,'-v','error','-y','-ss',ss,'-i',src,'-frames:v','1','-vf',f'scale={TW}:-2',dst], capture_output=True)
    return os.path.exists(dst)
def thumb_ql(src, dst):
    tmpd = dst + '.qld'; os.makedirs(tmpd, exist_ok=True)
    subprocess.run(['qlmanage','-t','-s',str(TW),'-o',tmpd,src], capture_output=True, timeout=60)
    made = [f for f in os.listdir(tmpd) if f.lower().endswith('.png')]
    ok = False
    if made:
        try:
            with Image.open(os.path.join(tmpd, made[0])) as im: save(im, dst); ok = True
        except Exception: ok = False
    for f in os.listdir(tmpd): os.remove(os.path.join(tmpd, f))
    os.rmdir(tmpd); return ok
def inside(p, ext):
    """A one-look breakdown of what a container or document holds (25 Sep, Bazil: "breakdown whats inside just through
    one look like this no need to click"). Read only; nothing is extracted to disk."""
    import zipfile, re, html as H
    try:
        if ext == 'zip':
            z = zipfile.ZipFile(p); names = [n for n in z.namelist() if not n.endswith('/') and '__MACOSX' not in n and not n.split('/')[-1].startswith('.')]
            exts = {}
            for n in names: e = n.rsplit('.', 1)[-1].lower() if '.' in n else 'file'; exts[e] = exts.get(e, 0) + 1
            top = sorted({n.split('/')[0] for n in names})
            return {'kind': 'Archive', 'count': len(names), 'lines': [f"{c} {e.upper()}" for e, c in sorted(exts.items(), key=lambda x: -x[1])][:4] + top[:5]}
        if ext == 'pptx':
            z = zipfile.ZipFile(p); slides = sorted([n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)], key=lambda n: int(re.findall(r'\d+', n)[0]))
            titles = []
            for n in slides[:60]:
                x = z.read(n).decode('utf-8', 'ignore'); t = re.findall(r'<a:t>(.*?)</a:t>', x, re.S)
                if t: titles.append(H.unescape(re.sub(r'\s+', ' ', t[0])).strip()[:70])
            return {'kind': 'Deck', 'count': len(slides), 'lines': [t for t in titles if t][:6]}
        if ext == 'xlsx':
            z = zipfile.ZipFile(p); wb = z.read('xl/workbook.xml').decode('utf-8', 'ignore'); sheets = re.findall(r'<sheet [^>]*name="([^"]+)"', wb)
            ss = z.read('xl/sharedStrings.xml').decode('utf-8', 'ignore') if 'xl/sharedStrings.xml' in z.namelist() else ''
            strings = [H.unescape(re.sub(r'<[^>]+>', '', t)).strip() for t in re.findall(r'<si>(.*?)</si>', ss, re.S)]
            strings = [t for t in strings if 12 < len(t) < 90][:4]
            return {'kind': 'Workbook', 'count': len(sheets), 'lines': [f"Sheet: {s}" for s in sheets[:4]] + strings}
        if ext == 'docx':
            z = zipfile.ZipFile(p); x = z.read('word/document.xml').decode('utf-8', 'ignore')
            paras = [H.unescape(re.sub(r'<[^>]+>', '', pp)).strip() for pp in re.findall(r'<w:p[ >].*?</w:p>', x, re.S)]
            paras = [pp for pp in paras if pp]
            return {'kind': 'Document', 'count': len(paras), 'lines': [pp[:80] for pp in paras[:5]]}
        if ext == 'vsdx':
            z = zipfile.ZipFile(p); pages = [n for n in z.namelist() if re.match(r'visio/pages/page\d+\.xml$', n)]
            names = re.findall(r'<Page [^>]*Name="([^"]+)"', z.read('visio/pages/pages.xml').decode('utf-8', 'ignore')) if 'visio/pages/pages.xml' in z.namelist() else []
            return {'kind': 'Diagram', 'count': len(pages), 'lines': [f"Page: {n}" for n in names[:6]]}
        if ext in ('txt', 'md', 'csv'):
            lines = [l.strip() for l in open(p, encoding='utf-8', errors='ignore').read().splitlines() if l.strip()]
            return {'kind': 'Text', 'count': len(lines), 'lines': [l[:80] for l in lines[:5]]}
        if ext == 'pdf':
            try:
                import pypdf; r = pypdf.PdfReader(p); n = len(r.pages); t = (r.pages[0].extract_text() or '') if n else ''
                lines = [l.strip() for l in t.splitlines() if len(l.strip()) > 3][:4]
                return {'kind': 'PDF', 'count': n, 'lines': [l[:80] for l in lines]}
            except Exception: return None
        if ext == 'rvt':
            return {'kind': 'Revit model', 'count': 0, 'lines': ['Autodesk Revit project file; opens in Revit only']}
    except Exception as e:
        return {'kind': ext.upper(), 'count': 0, 'lines': ['could not be read: ' + str(e)[:60]]}
    return None

files = []; t0 = time.time(); n = 0
for root, dirs, names in os.walk(STORE):
    dirs[:] = sorted(d for d in dirs if d != '__MACOSX')
    for name in sorted(names):
        if name in ('.DS_Store',) or name.startswith('._'): continue
        p = os.path.join(root, name); rel = os.path.relpath(p, STORE)
        try: st = os.stat(p)
        except OSError: continue
        ext = name.rsplit('.',1)[-1].lower() if '.' in name else ''
        kind = 'image' if ext in IMG or ext in HEIC else 'video' if ext in VID else 'doc' if ext in QL else 'file'
        rec = {'rel': rel, 'name': name, 'dir': os.path.dirname(rel), 'size': st.st_size, 'mtime': int(st.st_mtime), 'ext': ext, 'kind': kind}
        th = os.path.join(THUMBS, tid(rel) + '.jpg')
        fresh = os.path.exists(th) and os.path.getmtime(th) >= st.st_mtime
        try:
            if kind == 'video':
                dur, wh, codec = probe_video(p); rec['dur'] = dur; rec['wh'] = wh; rec['codec'] = codec
                if not fresh: fresh = thumb_video(p, th, dur)
                if codec and codec not in ('h264', 'vp9', 'av1'):
                    px = os.path.join(PROXIES, tid(rel) + '.mp4')
                    if proxy_video(p, px): rec['proxy'] = 'proxies/' + tid(rel) + '.mp4'
            elif kind == 'image':
                if not fresh:
                    s = thumb_heic(p, th) if ext in HEIC else thumb_image(p, th); fresh = bool(s)
                try:
                    with Image.open(p) as im: rec['wh'] = list(ImageOps.exif_transpose(im).size)
                except Exception: pass
            elif kind == 'doc':
                if not fresh: fresh = thumb_ql(p, th)
        except Exception as e:
            rec['err'] = str(e)[:120]; fresh = False
        if fresh: rec['thumb'] = 'thumbs/' + tid(rel) + '.jpg'
        if ext in ('zip','pptx','xlsx','docx','vsdx','txt','md','csv','pdf','rvt'):
            ins = inside(p, ext)
            if ins: rec['inside'] = ins
        files.append(rec); n += 1
        if n % 50 == 0: print(n, 'files', round(time.time()-t0), 's', flush=True)
json.dump({'store': STORE, 'built': int(time.time()), 'files': files}, open(os.path.join(OUT, 'manifest.json'), 'w'), ensure_ascii=False)
print('done', len(files), 'files', round(time.time()-t0), 's; thumbs', sum(1 for f in files if f.get('thumb')))
