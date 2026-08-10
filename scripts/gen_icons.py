# -*- coding: utf-8 -*-
"""Generates the FalaBrasil app icon set (PWA icons + favicon) with PIL.
A simple, bold, scalable mark: a rounded square in Brazil-green with a
yellow diamond (nod to the Brazilian flag) and a stylised toucan beak,
designed to read clearly at 48px and look premium at 512px."""
from PIL import Image, ImageDraw
import math

GREEN = (0, 151, 57, 255)
GREEN_DARK = (0, 90, 38, 255)
YELLOW = (255, 223, 0, 255)
BLUE = (0, 39, 118, 255)
WHITE = (255, 255, 255, 255)

def rounded_square(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    # simple vertical gradient green -> darker green
    for y in range(size):
        t = y / size
        col = tuple(int(GREEN[i] + (GREEN_DARK[i] - GREEN[i]) * t) for i in range(3)) + (255,)
        d.line([(0, y), (size, y)], fill=col)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out

def draw_mark(size, padding_ratio=0.16):
    base = rounded_square(size)
    d = ImageDraw.Draw(base)
    pad = size * padding_ratio
    cx, cy = size / 2, size / 2 * 1.02

    # yellow diamond (flag nod)
    dw, dh = size * 0.62, size * 0.40
    diamond = [
        (cx, cy - dh / 2),
        (cx + dw / 2, cy),
        (cx, cy + dh / 2),
        (cx - dw / 2, cy),
    ]
    d.polygon(diamond, fill=YELLOW)

    # blue circle center
    r = size * 0.135
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLUE)

    # toucan beak accent (bottom right, playful, yellow-orange stroke on white)
    beak_w = size * 0.30
    beak_h = size * 0.16
    bx, by = size * 0.60, size * 0.72
    d.ellipse([bx, by, bx + beak_w, by + beak_h], fill=(255, 200, 0, 255))
    d.ellipse([bx, by, bx + beak_w * 0.55, by + beak_h], fill=WHITE)

    return base

def save(img, path):
    img.save(path, "PNG")
    print("wrote", path, img.size)

sizes = {
    "public/icon-192.png": 192,
    "public/icon-512.png": 512,
    "public/icon-maskable-192.png": 192,
    "public/icon-maskable-512.png": 512,
    "public/apple-touch-icon.png": 180,
    "public/favicon-32.png": 32,
    "public/favicon-16.png": 16,
}

for path, size in sizes.items():
    if "maskable" in path:
        # maskable icons need extra safe-zone padding (icon content within ~80% circle)
        img = draw_mark(size, padding_ratio=0.22)
    else:
        img = draw_mark(size, padding_ratio=0.12)
    save(img, path)

# simple favicon.ico with multiple sizes
imgs = [draw_mark(s) for s in (16, 32, 48)]
imgs[-1].save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("wrote public/favicon.ico")
