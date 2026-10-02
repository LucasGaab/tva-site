# Servidor de desenvolvimento sem cache (só para preview local).
import http.server, functools, os

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
http.server.ThreadingHTTPServer(("127.0.0.1", 5174), functools.partial(NoCache, directory=root)).serve_forever()
