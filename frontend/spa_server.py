#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8888
DIRECTORY = "dist"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Check if the path is a file that exists
        path = self.translate_path(self.path)
        if os.path.exists(path) and os.path.isfile(path):
            return super().do_GET()
        
        # For all other paths, serve index.html (SPA routing)
        self.path = '/index.html'
        return super().do_GET()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("0.0.0.0", PORT), SPAHandler) as httpd:
        print(f"Serving SPA at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
