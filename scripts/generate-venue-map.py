#!/usr/bin/env python3
"""
Generate public/venue-map.png — a static 600x280 map of the venue with a
branded pin, rendered from OpenStreetMap tiles.

Run when the venue address/coords change:
    python3 -m pip install --user Pillow certifi
    python3 scripts/generate-venue-map.py

The image is embedded in booking confirmation emails (src/lib/email.ts).
OSM attribution is shown in the email next to the image (required by ODbL).
"""
import math
import os
import ssl
import urllib.request
from io import BytesIO

import certifi
from PIL import Image, ImageDraw, ImageFilter

# Maybachstraße 11, 71634 Ludwigsburg (Tamm-Nord / Eglosheim)
LAT = 48.9213
LON = 9.1445
ZOOM = 18  # tighter than 17 — less surrounding clutter (other business labels)

TARGET_W = 600
TARGET_H = 280
TILES_X = 3
TILES_Y = 2

OUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public",
    "venue-map.png",
)

# Bordeaux accent from the brand palette
PIN_FILL = (74, 26, 18, 255)
PIN_STROKE = (255, 255, 255, 255)


def latlon_to_tile(lat: float, lon: float, zoom: int) -> tuple[float, float]:
    n = 2 ** zoom
    x = (lon + 180.0) / 360.0 * n
    y = (
        (1.0 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi)
        / 2.0
        * n
    )
    return x, y


def main() -> None:
    ctx = ssl.create_default_context(cafile=certifi.where())
    xf, yf = latlon_to_tile(LAT, LON, ZOOM)
    cx, cy = int(xf), int(yf)
    x0 = cx - 1
    y0 = cy - 1 if (yf - cy) > 0.5 else cy

    img = Image.new("RGB", (TILES_X * 256, TILES_Y * 256))
    headers = {"User-Agent": "rueckwand/1.0 (booking@rueckwand-padel.de)"}

    for tx in range(TILES_X):
        for ty in range(TILES_Y):
            url = f"https://tile.openstreetmap.org/{ZOOM}/{x0 + tx}/{y0 + ty}.png"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
                tile = Image.open(BytesIO(r.read()))
                img.paste(tile, (tx * 256, ty * 256))

    pin_x = (xf - x0) * 256
    pin_y = (yf - y0) * 256

    left = max(0, min(int(pin_x - TARGET_W / 2), img.size[0] - TARGET_W))
    top = max(0, min(int(pin_y - TARGET_H / 2), img.size[1] - TARGET_H))
    cropped = img.crop((left, top, left + TARGET_W, top + TARGET_H)).convert("RGBA")
    rel_x = pin_x - left
    rel_y = pin_y - top

    # Soft drop shadow under the pin
    shadow = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse(
        (rel_x - 22, rel_y - 20, rel_x + 22, rel_y + 24), fill=(0, 0, 0, 110)
    )
    cropped = Image.alpha_composite(cropped, shadow.filter(ImageFilter.GaussianBlur(6)))

    # Teardrop pin: triangle tip + circle body + white dot
    overlay = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.polygon(
        [(rel_x - 10, rel_y - 2), (rel_x + 10, rel_y - 2), (rel_x, rel_y + 18)],
        fill=PIN_FILL,
    )
    d.ellipse(
        (rel_x - 18, rel_y - 30, rel_x + 18, rel_y + 6),
        fill=PIN_FILL,
        outline=PIN_STROKE,
        width=3,
    )
    d.ellipse((rel_x - 6, rel_y - 18, rel_x + 6, rel_y - 6), fill=PIN_STROKE)

    final = Image.alpha_composite(cropped, overlay).convert("RGB")
    final.save(OUT_PATH, "PNG", optimize=True)
    print(f"wrote {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)")


if __name__ == "__main__":
    main()
