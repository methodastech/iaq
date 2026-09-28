# tools/hero-site-team-0926.py. Home hero, ninth scene: "On site". Three of IAQ's own 2022 site photographs, one slow push each, joined by
# dissolves, in the reel's format (1920x1080, 24 fps, H.264 High, yuv420p, ~8 s). 26 Sep 2026.
import subprocess, os
from PIL import Image, ImageOps
D='/Users/zieel/Bazil Claude 3/Client info/IAQ/OneDrive 2026-09-26 (Site Photos, Website 2027)/Site Photos'
SP=os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '_site-clip'))
os.makedirs(SP, exist_ok=True)
FF='/Users/zieel/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'
MW,MH=7680,4320            # master: 4x the output, so zoompan's integer steps are a quarter output pixel
FPS=24; SEC=3.2; N=int(round(FPS*SEC)); XF=0.7
# name, vertical crop position (0 top .. 1 bottom), push target cx,cy, zoom, lateral drift (fraction of width)
SHOTS=[('IMG_9181',0.50,0.38,0.45,1.08,-0.012),   # the crane: two engineers point across the site
       ('IMG_9445',0.30,0.50,0.45,1.08, 0.0),     # the scissor lift: installation at height, IAQ on the vest
       ('IMG_9517',0.50,0.50,0.42,1.12, 0.0)]     # the finished cleanroom: the result
segs=[]
for i,(n,vp,cx,cy,zm,dx) in enumerate(SHOTS):
    im=ImageOps.exif_transpose(Image.open(f'{D}/{n}.jpg')).convert('RGB'); w,h=im.size
    th=int(w*9/16); top=int((h-th)*vp); im=im.crop((0,top,w,top+th)).resize((MW,MH),Image.LANCZOS)
    m=f'{SP}/m{i}.png'; im.save(m)
    p=f'min(1,max(0,(in-1)/{N-1}))'; e=f'({p}*{p}*(3-2*{p}))'
    z=f'1+{zm-1}*{e}'
    x=f'{cx}*iw*(1-1/zoom)+({dx})*iw*{e}'; y=f'{cy}*ih*(1-1/zoom)'
    seg=f'{SP}/s{i}.mp4'
    cmd=[FF,'-y','-hide_banner','-loglevel','error','-loop','1','-framerate',str(FPS),'-t',str(SEC),'-i',m,
         '-vf',f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s=1920x1080:fps={FPS},format=yuv420p",
         '-frames:v',str(N),'-c:v','libx264','-preset','veryfast','-crf','14','-r',str(FPS),seg]
    subprocess.run(cmd,check=True); segs.append(seg); print('seg',i,n,'ok')
o1=SEC-XF; o2=o1+SEC-XF
fc=f"[0:v][1:v]xfade=transition=fade:duration={XF}:offset={o1}[x1];[x1][2:v]xfade=transition=fade:duration={XF}:offset={o2},format=yuv420p[v]"
out=f'{SP}/hero-site-team.mp4'
cmd=[FF,'-y','-hide_banner','-loglevel','error']+sum([['-i',s] for s in segs],[])+['-filter_complex',fc,'-map','[v]',
     '-c:v','libx264','-profile:v','high','-level','4.0','-preset','slow','-crf','20','-g','48','-r',str(FPS),
     '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart','-an',out]
subprocess.run(cmd,check=True); print('out',out,os.path.getsize(out))
