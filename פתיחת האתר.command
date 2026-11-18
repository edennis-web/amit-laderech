#!/bin/bash
# Double-click to open the Amit LaDerech site preview.
# Serves the site/ folder on this Mac, opens it in the browser,
# and prints a link for a phone on the same Wi-Fi.

PORT=4400
SITE="$(cd "$(dirname "$0")" && pwd)/site"
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)"

echo ""
echo "  עמית לדרך — תצוגה מקדימה"
echo "  ─────────────────────────"
echo "  מחשב:            http://localhost:$PORT/"
echo "  מחשב (צעירים):   http://localhost:$PORT/young/"
echo "  תצוגת נייד במחשב: http://localhost:$PORT/_mobile.html"
if [ -n "$IP" ]; then
echo "  בטלפון (אותו Wi-Fi): http://$IP:$PORT/"
echo "  בטלפון (צעירים):     http://$IP:$PORT/young/"
fi
echo ""
echo "  כדי לעצור: לסגור את החלון הזה."
echo ""

# Already running? Just open the browser.
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  open "http://localhost:$PORT/"
  exit 0
fi

(sleep 1; open "http://localhost:$PORT/") &

cd "$SITE" || { echo "לא נמצאה תיקיית site"; read -r; exit 1; }
exec python3 - "$PORT" <<'PY'
import sys, http.server, socketserver
class H(http.server.SimpleHTTPRequestHandler):
    # Always serve the latest files (no stale cache after edits)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, *a):
        pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("0.0.0.0", int(sys.argv[1])), H) as s:
    s.serve_forever()
PY
