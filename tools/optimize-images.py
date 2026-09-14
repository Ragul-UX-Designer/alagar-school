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
    python tools/optimize-images.py --crops    # (re)generate the homepage 'Proud Moments'
                                               # 16:10 crops from tools/crops.config.json

Defaults: Gallery, Achievement and Competitions under assets/img/. Other images
(logo, hero banners, portraits, og-image, …) are intentionally NOT touched.

NOTE: this overwrites the files in place. Keep your full-resolution originals
somewhere else (e.g. the shared drive) as the golden copy.
"""
import io
import json
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
IMG_DIR = "assets/img"
CROPS_CONFIG = "tools/crops.config.json"

dry = "--dry-run" in sys.argv
crops_mode = "--crops" in sys.argv
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


def _encode_jpeg_under(im, max_kb):
    """Encode a PIL image as a progressive sRGB JPEG under max_kb (best effort)."""
    rgb = im.convert("RGB")
    q = Q_START
    while True:
        buf = io.BytesIO()
        rgb.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        if buf.tell() <= max_kb * 1024 or q <= Q_MIN:
            return buf.getvalue()
        q -= 5


def parse_focus(focus):
    """Turn a focus setting into (fx, fy) fractions in 0-1 (anchor of the kept area)."""
    if isinstance(focus, (list, tuple)):
        return float(focus[0]), float(focus[1])
    s = str(focus or "center").strip().lower()
    if "," in s:  # explicit "x,y" fractions
        x, y = s.split(",", 1)
        return max(0.0, min(1.0, float(x))), max(0.0, min(1.0, float(y)))
    fx = fy = 0.5
    for tok in s.replace("_", "-").split("-"):
        if tok == "top": fy = 0.0
        elif tok == "bottom": fy = 1.0
        elif tok == "left": fx = 0.0
        elif tok == "right": fx = 1.0
        elif tok == "center": pass
    return fx, fy


def make_crop(src_path, out_path, ratio, width, max_kb, focus):
    """Cover-crop src to `ratio`, anchored at `focus`, resize to `width`, save as JPEG."""
    rw, rh = (float(n) for n in str(ratio).replace(":", "/").split("/"))
    target = rw / rh
    fx, fy = parse_focus(focus)
    with Image.open(src_path) as im:
        im = ImageOps.exif_transpose(im)
        w, h = im.size
        if w / h > target:                       # too wide -> trim the sides
            cw, ch = round(h * target), h
        else:                                    # too tall -> trim top/bottom
            cw, ch = w, round(w / target)
        x = round((w - cw) * fx)
        y = round((h - ch) * fy)
        im = im.crop((x, y, x + cw, y + ch))
        out_w = width
        out_h = round(width / target)
        im = im.resize((out_w, out_h), Image.LANCZOS)
        data = _encode_jpeg_under(im, max_kb)
    old = os.path.getsize(out_path) if os.path.exists(out_path) else 0
    if not dry:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "wb") as f:
            f.write(data)
    return old, len(data), f"{out_w}x{out_h}"


def run_crops():
    cfg_path = os.path.join(ROOT, CROPS_CONFIG)
    if not os.path.isfile(cfg_path):
        print(f"! no crop config found at {CROPS_CONFIG}")
        return
    with open(cfg_path, encoding="utf-8") as f:
        cfg = json.load(f)
    d = cfg.get("defaults", {})
    d_ratio, d_width, d_max = d.get("ratio", "16:10"), d.get("width", 1080), d.get("maxKB", 200)
    entries = cfg.get("crops", [])
    made = 0
    for e in entries:
        src = os.path.join(ROOT, IMG_DIR, e["src"])
        out = os.path.join(ROOT, IMG_DIR, e["out"])
        if not os.path.isfile(src):
            print(f"! skip (source missing): {e['src']}")
            continue
        try:
            old, new, dim = make_crop(src, out, e.get("ratio", d_ratio),
                                      e.get("width", d_width), e.get("maxKB", d_max),
                                      e.get("focus", "center"))
        except Exception as ex:
            print(f"! error on {e['src']} -> {e['out']}: {ex}")
            continue
        made += 1
        arrow = "would write" if dry else "wrote"
        print(f"  {arrow} {e['out']:24s} {dim:>9s}  {old/1024:5.0f}KB -> {new/1024:5.0f}KB  (from {e['src']}, focus={e.get('focus','center')})")
    tag = "[dry-run] would generate" if dry else "generated"
    print(f"\n{tag} {made} of {len(entries)} crops")


def main():
    if crops_mode:
        run_crops()
        return
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
