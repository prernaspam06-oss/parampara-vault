# Draws the app icon, splash screens and notification icon with Pillow.
import math, os
from PIL import Image, ImageDraw, ImageFilter
RES = "android/app/src/main/res"
BG1, BG2 = (29, 24, 56), (13, 11, 23)
SAFFRON, GOLD, LOTUS, CREAM = (242, 154, 46), (255, 210, 122), (255, 127, 174), (255, 241, 201)

def radial_bg(w, h):
    img = Image.new("RGB", (w, h), BG2); px = img.load()
    cx, cy, R = w / 2, h * 0.42, math.hypot(w, h) * 0.6
    for y in range(h):
        for x in range(w):
            t = min(1, math.hypot(x - cx, y - cy) / R)
            px[x, y] = tuple(int(BG1[i] * (1 - t) + BG2[i] * t) for i in range(3))
    return img

def petal(d, cx, cy, ang, length, width, fill, outline=None, ow=0):
    pts = []
    for i in range(41):
        t = i / 40
        r = length * t
        wv = width * math.sin(math.pi * t) * (1 - 0.15 * t)
        for sgn in (1,) if i < 41 else ():
            pass
        pts.append((r, wv))
    left = [(r, w) for r, w in pts]; right = [(r, -w) for r, w in reversed(pts)]
    poly = []
    for r, w in left + right:
        x = cx + r * math.cos(ang) - w * math.sin(ang)
        y = cy + r * math.sin(ang) + w * math.cos(ang)
        poly.append((x, y))
    d.polygon(poly, fill=fill, outline=outline, width=ow)

def lotus(size, scale=1.0, glow=True):
    S = size * 4  # supersample
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    cx, cy = S / 2, S * 0.56
    u = S * 0.38 * scale
    if glow:
        g = Image.new("RGBA", (S, S), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        gd.ellipse([cx - u * 1.1, cy - u * 1.25, cx + u * 1.1, cy + u * 0.6], fill=SAFFRON + (110,))
        g = g.filter(ImageFilter.GaussianBlur(S * 0.06)); img.alpha_composite(g)
    d = ImageDraw.Draw(img)
    # back petals
    for a in (-150, -30, -122, -58):
        petal(d, cx, cy, math.radians(a), u * 0.95, u * 0.26, LOTUS + (255,))
    # front petals
    for a in (-170, -10, -135, -45):
        petal(d, cx, cy, math.radians(a), u * 0.82, u * 0.24, SAFFRON + (255,))
    petal(d, cx, cy, math.radians(-90), u * 1.05, u * 0.3, GOLD + (255,))
    # diya flame above
    fx, fy = cx, cy - u * 1.12
    fl = Image.new("RGBA", (S, S), (0, 0, 0, 0)); fd = ImageDraw.Draw(fl)
    fd.ellipse([fx - u * 0.22, fy - u * 0.3, fx + u * 0.22, fy + u * 0.16], fill=GOLD + (150,))
    fl = fl.filter(ImageFilter.GaussianBlur(S * 0.025)); img.alpha_composite(fl)
    d = ImageDraw.Draw(img)
    petal(d, fx, fy + u * 0.12, math.radians(-90), u * 0.4, u * 0.11, CREAM + (255,))
    # base bowl
    d.chord([cx - u * 0.62, cy - u * 0.2, cx + u * 0.62, cy + u * 0.42], 0, 180, fill=(196, 104, 58, 255))
    return img.resize((size, size), Image.LANCZOS)

def mask_round(img):
    m = Image.new("L", img.size, 0); ImageDraw.Draw(m).ellipse([0, 0, img.size[0] - 1, img.size[1] - 1], fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0)); out.paste(img, (0, 0), m); return out

dens = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for name, k in dens.items():
    leg = int(48 * k); fg = int(108 * k)
    base = radial_bg(leg, leg).convert("RGBA"); base.alpha_composite(lotus(leg, 0.95))
    rr = Image.new("L", (leg, leg), 0); ImageDraw.Draw(rr).rounded_rectangle([0, 0, leg - 1, leg - 1], radius=int(leg * 0.22), fill=255)
    sq = Image.new("RGBA", (leg, leg), (0, 0, 0, 0)); sq.paste(base, (0, 0), rr)
    os.makedirs(f"{RES}/mipmap-{name}", exist_ok=True)
    sq.save(f"{RES}/mipmap-{name}/ic_launcher.png")
    mask_round(base).save(f"{RES}/mipmap-{name}/ic_launcher_round.png")
    lotus(fg, 0.62, glow=True).save(f"{RES}/mipmap-{name}/ic_launcher_foreground.png")
    # notification icon: white silhouette, 24dp
    n = int(24 * k); sil = lotus(n * 4, 1.0, glow=False)
    a = sil.split()[3].point(lambda v: 255 if v > 90 else 0)
    white = Image.new("RGBA", sil.size, (255, 255, 255, 0)); white.putalpha(a)
    os.makedirs(f"{RES}/drawable-{name}", exist_ok=True)
    white.resize((n, n), Image.LANCZOS).save(f"{RES}/drawable-{name}/ic_stat_lotus.png")

with open(f"{RES}/values/ic_launcher_background.xml", "w") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1D1838</color>\n</resources>\n')

def splash(w, h):
    img = radial_bg(w // 4, h // 4).resize((w, h), Image.BICUBIC).convert("RGBA")
    s = int(min(w, h) * 0.42); l = lotus(s, 0.9)
    img.alpha_composite(l, ((w - s) // 2, int(h * 0.5 - s * 0.6)))
    return img.convert("RGB")
for p in os.listdir(RES):
    f = f"{RES}/{p}/splash.png"
    if os.path.exists(f):
        w, h = Image.open(f).size
        splash(w, h).save(f)
# store icon for README / web
os.makedirs("resources", exist_ok=True)
big = radial_bg(512, 512).convert("RGBA"); big.alpha_composite(lotus(512, 0.95)); big.save("resources/icon-512.png")
print("icons done")
