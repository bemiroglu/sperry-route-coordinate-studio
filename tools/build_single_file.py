from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
VERSION = "v1.0.0"
CANONICAL_NAME = f"Sperry_Route_Coordinate_Studio_{VERSION}.html"
LATEST_NAME = "Sperry_Route_Coordinate_Studio.html"

head = (SRC / "html" / "00_head.html").read_text(encoding="utf-8")
css = "".join(p.read_text(encoding="utf-8") for p in sorted((SRC / "css").glob("*.css")))
body = "".join(p.read_text(encoding="utf-8") for p in sorted((SRC / "html").glob("*_body.html")))
js = "".join(p.read_text(encoding="utf-8") for p in sorted((SRC / "js").glob("*.js")))

out = head + "<style>" + css + "</style>" + body + "<script>" + js + "</script>\n</body></html>"

# Release hardening: no release-candidate version marker may survive in v1.0.0 output.
out = out.replace("v0.9.0", VERSION)
if "v0.9.0" in out:
    raise SystemExit("stale v0.9.0 marker remains in final HTML")

canonical = ROOT / CANONICAL_NAME
latest = ROOT / LATEST_NAME
downloads = ROOT / "downloads"
downloads.mkdir(exist_ok=True)
pinned = downloads / CANONICAL_NAME

for path in (canonical, latest, pinned):
    path.write_text(out, encoding="utf-8")

print(canonical)
print(latest)
print(pinned)
