#!/usr/bin/env python3
"""Generate optimised WebP versions + a size manifest for every clinical case image.

Usage (from the project root):   python3 tools/optimize_images.py
Requires: pip install Pillow

Originals in assets/images/cases/<folder>/ are NEVER modified.
Output:  assets/images/cases/<folder>/web/<name>-<width>.webp
         assets/images/cases/manifest.json   (width/height/srcset for each original)
Re-run this script whenever you add or replace a case image.
"""
import json, re
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CASES = ROOT / "assets" / "images" / "cases"
WIDTHS = [480, 800, 1200]          # responsive sizes; the full-size WebP is always added too
QUALITY = 86
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

manifest = {}
for folder in sorted(p for p in CASES.iterdir() if p.is_dir()):
    for src in sorted(folder.iterdir()):
        if not src.is_file() or src.suffix.lower() not in EXTS:
            continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        w, h = im.size
        out = folder / "web"
        out.mkdir(exist_ok=True)
        base = slug(src.stem)
        sizes = sorted({x for x in WIDTHS if x < w} | {w})
        srcset = []
        for sw in sizes:
            sh = round(h * sw / w)
            name = f"{base}-{sw}.webp"
            (im if sw == w else im.resize((sw, sh), Image.LANCZOS)).save(
                out / name, "WEBP", quality=QUALITY, method=6)
            srcset.append({"file": f"web/{name}", "width": sw})
        manifest[f"{folder.name}/{src.name}"] = {"width": w, "height": h, "srcset": srcset}
        print(f"{folder.name}/{src.name}: {w}x{h} -> {len(sizes)} sizes")

(CASES / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
print(f"\nManifest written ({len(manifest)} images).")
