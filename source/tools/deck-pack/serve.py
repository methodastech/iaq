#!/usr/bin/env python3
"""IAQ exhibition deck: a small local web server for this folder.

Why a server: browsers will not load the 3D models or play the videos smoothly from a page opened straight from disk.
This one also answers byte-range requests, which the videos need to loop and to seek.
Run:  python3 serve.py        then the deck opens in your browser at http://localhost:8765
Stop: close this window (or press Ctrl+C).
"""
import http.server, os, re, socket, socketserver, sys, threading, webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
                      '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.mp4': 'video/mp4',
                      '.woff2': 'font/woff2', '.svg': 'image/svg+xml'}

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if not rng or os.path.isdir(path) or not os.path.exists(path):
            return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        size = os.path.getsize(path)
        if not m:
            return super().send_head()
        a, b = m.group(1), m.group(2)
        start = int(a) if a else max(0, size - int(b or 0))
        end = int(b) if (a and b) else size - 1
        if start >= size:
            self.send_response(416); self.send_header('Content-Range', f'bytes */{size}'); self.end_headers(); return None
        end = min(end, size - 1)
        f = open(path, 'rb'); f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._range_left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, '_range_left', None)
        if left is None:
            return super().copyfile(source, outputfile)
        try:
            while left > 0:
                chunk = source.read(min(65536, left))
                if not chunk: break
                outputfile.write(chunk); left -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            self._range_left = None

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def free_port(start=8765):
    for p in range(start, start + 40):
        with socket.socket() as s:
            try:
                s.bind(('127.0.0.1', p)); return p
            except OSError:
                continue
    return 0

if __name__ == '__main__':
    port = int(os.environ['PORT']) if os.environ.get('PORT') else free_port()
    httpd = Server(('127.0.0.1', port), Handler)
    url = f'http://localhost:{port}/'
    print('IAQ exhibition deck is running at', url)
    print('Keep this window open while the deck is on screen. Close it to stop.')
    if '--no-open' not in sys.argv:
        threading.Timer(.8, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
