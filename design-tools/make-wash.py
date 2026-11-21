"""
Makes the soft "wash" picture for a design from its main artwork.

  py -3 design-tools/make-wash.py "new design/images/d7/yourname.jpg"

writes  new design/images/d7/yourname-wash.jpg  next to it (never overwrites the artwork).

What a wash is: the artwork shrunk to 800 px wide, blurred until no detail is left, saved as a
small JPEG (about 10-15 KB). Options:  --blur 35 (softness)  --contrast 0.9  --brightness 1.04  --width 800
One-time setup:  py -3 -m pip install pillow
"""
import argparse
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("artwork", help="path to the main artwork, e.g. 'new design/images/d7/yourname.jpg'")
ap.add_argument("--blur", type=float, default=35, help="blur radius in pixels at 800 px wide (default 35; bigger = softer)")
ap.add_argument("--contrast", type=float, default=0.9, help="1 = unchanged, lower = flatter (default 0.9)")
ap.add_argument("--brightness", type=float, default=1.04, help="1 = unchanged, higher = lighter (default 1.04)")
ap.add_argument("--width", type=int, default=800, help="output width in pixels (default 800)")
ap.add_argument("--out", help="output path (default: <artwork>-wash.jpg next to the artwork)")
a = ap.parse_args()

src = Path(a.artwork)
out = Path(a.out) if a.out else src.with_name(src.stem + "-wash.jpg")
if out.resolve() == src.resolve():
    raise SystemExit("Refusing to overwrite the artwork itself.")

img = Image.open(src).convert("RGB")
h = round(img.height * a.width / img.width)
img = img.resize((a.width, h), Image.LANCZOS)
# blur at a fraction of the size, which is much faster and just as smooth
small = img.resize((a.width // 4, h // 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(a.blur / 4))
wash = small.resize((a.width, h), Image.BICUBIC)
# the washes in d2-d6 are slightly lighter and flatter than a plain blur
wash = ImageEnhance.Brightness(ImageEnhance.Contrast(wash).enhance(a.contrast)).enhance(a.brightness)
wash.save(out, "JPEG", quality=70, optimize=True)
print(f"{out}  {a.width}x{h}  {out.stat().st_size // 1024} KB")
