from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"src"
head=(SRC/"html"/"00_head.html").read_text(encoding="utf-8")
css="".join(p.read_text(encoding="utf-8") for p in sorted((SRC/"css").glob("*.css")))
body="".join(p.read_text(encoding="utf-8") for p in sorted((SRC/"html").glob("*_body.html")))
js="".join(p.read_text(encoding="utf-8") for p in sorted((SRC/"js").glob("*.js")))
out=head+"<style>"+css+"</style>"+body+"<script>"+js+"</script>\n</body></html>"
path=ROOT/"Sperry_Route_Coordinate_Studio.html"
path.write_text(out,encoding="utf-8")
print(path)
