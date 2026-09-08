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
    # BOTH OF THESE ARRIVE RELATIVE ON PURPOSE, AND THIS NOTE IS THE TRIGGER FOR A LINE THAT CANNOT
    # HOLD ONE (2026-09-08). launch.json invokes this file by a repo-relative path with "." as the
    # document root, because it previously named an absolute home-directory path twice — and that
    # config is TRACKED in a public repo, so it had been leaking an account name since the initial
    # commit. JSON permits no comments, so the note that belongs beside those two argument values
    # lives here, at the code that consumes them: the criterion is where the reader is standing, and
    # a reader changing the invocation reads what it invokes.
    #   THE EXAMPLE IS DESCRIBED AND NOT WRITTEN OUT, for a sharper reason than usual. Elsewhere in
    # this repo instantiating a bad form merely gets it counted by a matcher; here the instance IS
    # the leak, so spelling it would reintroduce exactly what was removed. The evidence lives in git
    # history, which is immutable at those refs and cannot be purged.
    #   DO NOT REINTRODUCE AN ABSOLUTE PATH IN EITHER PLACE. If the preview cannot find the document
    # root, the cause is the working directory the runner starts in, not a missing hard-coded path —
    # sibling configs in the same setup pass relative roots and work. No instrument watches for this,
    # so this comment is the entire mechanism at authoring time; a tracked-file scan for the home
    # path was considered and is recorded as a CANDIDATE rather than built, because it would be a new
    # battery member and owes condition (7) and a declaration before it can join.
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3055
    directory = sys.argv[2] if len(sys.argv) > 2 else '.'
    handler = lambda *args, **kwargs: NoCacheHandler(*args, directory=directory, **kwargs)
    http.server.test(HandlerClass=handler, port=port, bind='127.0.0.1')
