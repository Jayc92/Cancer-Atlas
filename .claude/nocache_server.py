import http.server
import sys

# Plain http.server sends no Cache-Control/Expires header at all, which leaves browsers free to
# apply heuristic freshness caching off Last-Modified alone (RFC 7234) — fine for a real deploy,
# but during local dev it meant editing js/organs/*.js or js/main.js and reloading could keep
# serving an old cached module for well over an hour with no visible sign anything was stale.
# This subclass just forces every response to be revalidated every time, so local edits are
# always reflected on the next reload.
class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3055
    directory = sys.argv[2] if len(sys.argv) > 2 else '.'
    handler = lambda *args, **kwargs: NoCacheHandler(*args, directory=directory, **kwargs)
    http.server.test(HandlerClass=handler, port=port, bind='127.0.0.1')
