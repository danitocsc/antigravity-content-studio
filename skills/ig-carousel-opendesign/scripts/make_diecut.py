#!/usr/bin/env python3
"""Convert a transparent PNG into a die-cut sticker with crisp white + subtle slate contour."""
import sys
import os
from PIL import Image, ImageFilter


def make_diecut(in_path: str, out_path: str, max_dim: int = 520) -> None:
    im = Image.open(in_path).convert("RGBA")
    im.thumbnail((max_dim, max_dim), Image.LANCZOS)
    pad = 28
    canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))

    alpha = canvas.split()[3]
    clean_a = alpha.point(lambda p: 255 if p > 25 else 0)
    outer_a = clean_a.filter(ImageFilter.MaxFilter(23)).filter(ImageFilter.GaussianBlur(1.2))
    white_a = clean_a.filter(ImageFilter.MaxFilter(19)).filter(ImageFilter.GaussianBlur(0.8))

    out_im = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    slate_layer = Image.new("RGBA", canvas.size, (15, 23, 42, 65))
    out_im.paste(slate_layer, (0, 0), outer_a)
    white_layer = Image.new("RGBA", canvas.size, (255, 255, 255, 255))
    out_im.paste(white_layer, (0, 0), white_a)
    out_im = Image.alpha_composite(out_im, canvas)

    bbox = out_im.getbbox()
    if bbox:
        out_im = out_im.crop(bbox)
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    out_im.save(out_path)
    print(f"Saved die-cut sticker: {out_path} ({out_im.size[0]}x{out_im.size[1]})")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 make_diecut.py <input.png> <output.png>")
        sys.exit(1)
    make_diecut(sys.argv[1], sys.argv[2])
