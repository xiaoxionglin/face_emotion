import http.server
import ssl

server_address = ('192.168.178.21', 4443)  # Serve on https://localhost:4443
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, keyfile='key.pem', certfile='cert.pem', server_side=True)

print("Serving on https://localhost:4443...")
httpd.serve_forever()
