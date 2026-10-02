#!/usr/bin/env python3
"""Set the live web address once it is known (needed for social-share previews).

Usage:  python3 tools/set_site_url.py https://username.github.io/repo-name/
"""
import sys
from pathlib import Path
if len(sys.argv) != 2 or not sys.argv[1].startswith("http"):
    sys.exit("Usage: python3 tools/set_site_url.py https://username.github.io/repo-name/")
url = sys.argv[1].rstrip("/") + "/"
root = Path(__file__).resolve().parent.parent
for name in ("index.html", "404.html"):
    p = root / name
    s = p.read_text(encoding="utf-8").replace("https://example.invalid/", url)
    p.write_text(s, encoding="utf-8")
p = root / "404.html"
s = p.read_text(encoding="utf-8")
from urllib.parse import urlparse
s = s.replace('var HOME = "";', 'var HOME = "%s";' % urlparse(url).path)
p.write_text(s, encoding="utf-8")
print("Site address set to", url)
