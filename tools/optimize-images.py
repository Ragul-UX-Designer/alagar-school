#!/usr/bin/env python3
"""
optimize-images.py — shrink oversized gallery photos for the web (in place).

Walks the content image folders and, for any photo that is too big, resizes it to
a max long edge of 1600px and compresses it to under ~300 KB (sRGB, progressive
JPEG). Photos already within limits are left untouched, so re-running is safe and
does not re-compress (no quality loss on repeat runs). Rotated phone photos are
auto-straightened via their EXIF orientation.

USAGE
    python tools/optimize-images.py            # optimize the default folders in place
    python tools/optimize-images.py --dry-run  # show what WOULD change, write nothing
    python tools/optimize-images.py assets/img/Gallery/Academic2026-27   # specific folder(s)

Defaults: Gallery, Achievement and Competitions under assets/img/. Other images
(logo, hero banners, portraits, og-image, …) are intentionally NOT touched.

NOTE: this overwrites the files in place. Keep your full-resolution originals
somewhere else (e.g. the shared drive) as the golden copy.
"""
import io
import os
import sys
from PIL import Image, ImageOps

MAX_KB = 300          # target max file size
MAX_EDGE = 1600       # target max width/height in px
Q_START = 85          # starting JPEG/WebP quality
Q_MIN = 60            # don't go below this quality
EXT = {".jpg", ".jpeg", ".png", ".webp"}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_TARGETS = ["assets/img/Gallery", "assets/img/Achievement", "assets/img/Competitions"]

dry = "--dry-run" in sys.argv
targets = [a for a in sys.argv[1:] if not a.startswith("-")] or DEFAULT_TARGETS


def process(path):
    """Return (old_bytes, new_bytes, note) if changed/would-change, else None."""
    old = os.path.getsize(path)
    ext = os.path.splitext(path)[1].lower()
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im)          # honour phone rotation
        w, h = im.size
        need_resize = max(w, h) > MAX_EDGE
        need_recompress = old > MAX_KB * 1024
        if not need_resize and not need_recompress:
            return None                            # already fine — skip

        if need_resize:
            s = MAX_EDGE / max(w, h)
            im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)

        buf = io.BytesIO()
        note = ""
        if ext in (".jpg", ".jpeg"):
            rgb = im.convert("RGB")
            q = Q_START
            while True:
                buf.seek(0); buf.truncate(0)
                rgb.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
                if buf.tell() <= MAX_KB * 1024 or q <= Q_MIN:
                    break
                q -= 5
        elif ext == ".webp":
            q = Q_START
            while True:
                buf.seek(0); buf.truncate(0)
                im.save(buf, "WEBP", quality=q, method=6)
                if buf.tell() <= MAX_KB * 1024 or q <= Q_MIN:
                    break
                q -= 5
        else:  # .png — resize + re-optimise only (kept as PNG to preserve transparency)
            im.save(buf, "PNG", optimize=True)
            if buf.tell() > MAX_KB * 1024:
                note = " (still >300KB — consider supplying a JPG)"

        data = buf.getvalue()
        new = len(data)
        # only rewrite if we actually made it smaller
        if new >= old and not need_resize:
            return None
        if not dry:
            with open(path, "wb") as f:
                f.write(data)
        return (old, new, note)


def main():
    files = []
    for t in targets:
        base = os.path.join(ROOT, t)
        if not os.path.isdir(base):
            print(f"! skip (not found): {t}")
            continue
        for dp, _dn, fn in os.walk(base):
            for name in fn:
                if os.path.splitext(name)[1].lower() in EXT:
                    files.append(os.path.join(dp, name))

    changed = saved = scanned = 0
    warnings = []
    for p in sorted(files):
        scanned += 1
        try:
            r = process(p)
        except Exception as e:
            warnings.append(f"! error on {os.path.relpath(p, ROOT)}: {e}")
            continue
        if r:
            old, new, note = r
            changed += 1
            saved += (old - new)
            rel = os.path.relpath(p, ROOT).replace("\\", "/")
            print(f"  {old/1024:6.0f}KB -> {new/1024:6.0f}KB  {rel}{note}")
            if note:
                warnings.append(f"! {rel}{note}")

    tag = "[dry-run] would optimize" if dry else "optimized"
    print(f"\n{tag} {changed} of {scanned} images  ·  saved {saved/1024/1024:.1f} MB")
    for w in warnings:
        print(w)
    if dry and changed:
        print("\nRun again without --dry-run to apply.")


if __name__ == "__main__":
    main()
