"""Render the Elite Padel wordmark to PNG.

We re-render from scratch (not by rasterising the SVG) because rsvg/cairosvg
aren't installed and macOS qlmanage doesn't load Google Fonts. Drawing the
glyphs directly with PIL + the actual Noto Serif Italic file is the closest
match to the website's hero typography.
"""
from __future__ import annotations

import io
import ssl
import sys
import urllib.request
from pathlib import Path

import certifi
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "public" / "logo.png"
DOWNLOADS = Path.home() / "Downloads" / "elite-padel-logo.png"

# Noto Serif Italic (weight 400) hosted on the GitHub fonts repo — direct TTF,
# no auth dance like Google Fonts CSS would need.
FONT_URL = (
    "https://github.com/google/fonts/raw/main/ofl/notoserif/"
    "NotoSerif-Italic%5Bwdth%2Cwght%5D.ttf"
)
FONT_CACHE = Path(__file__).resolve().parent / ".cache" / "NotoSerif-Italic.ttf"

# Output canvas at 4× the SVG viewBox for crisp retina-grade rendering.
# SVG was 680×360; we render at 2720×1440 then downscale to 1360×720 for the
# final PNG. Supersampling kills aliasing on the italic curves.
SCALE = 4
SVG_W, SVG_H = 680, 360
FINAL_W, FINAL_H = SVG_W * 2, SVG_H * 2  # 1360×720

# Brand bordeaux from tailwind.config.ts
BRAND = (0x69, 0x25, 0x1B, 255)


def fetch_font() -> Path:
    if FONT_CACHE.exists() and FONT_CACHE.stat().st_size > 50_000:
        return FONT_CACHE
    FONT_CACHE.parent.mkdir(parents=True, exist_ok=True)
    ctx = ssl.create_default_context(cafile=certifi.where())
    print(f"downloading font…", file=sys.stderr)
    with urllib.request.urlopen(FONT_URL, context=ctx, timeout=30) as resp:
        FONT_CACHE.write_bytes(resp.read())
    return FONT_CACHE


def main() -> None:
    font_path = fetch_font()

    big_w, big_h = SVG_W * SCALE, SVG_H * SCALE
    img = Image.new("RGBA", (big_w, big_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # SVG uses font-size: 148px at viewBox 680×360. Scale to supersampled canvas.
    font_size = int(148 * SCALE)
    font = ImageFont.truetype(str(font_path), font_size)

    # SVG positions text by its baseline at the given (x, y). PIL anchors
    # vary — `ls` = left, baseline — matches the SVG coordinate semantics
    # so the PNG mirrors the SVG layout exactly.
    draw.text((60 * SCALE, 160 * SCALE), "Elite", font=font, fill=BRAND, anchor="ls")
    draw.text((220 * SCALE, 300 * SCALE), "Padel", font=font, fill=BRAND, anchor="ls")

    # Downsample with high-quality resampling for clean italic edges.
    img = img.resize((FINAL_W, FINAL_H), Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")

    DOWNLOADS.parent.mkdir(parents=True, exist_ok=True)
    img.save(DOWNLOADS, "PNG", optimize=True)
    print(f"wrote {DOWNLOADS} ({DOWNLOADS.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
