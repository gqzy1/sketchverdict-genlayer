"""Generate P12 evidence drawings: 384x384 PNG, white background,
dark strokes. Same path live play uses: canvas export -> base64 -> store.
"""
import base64
import hashlib
import json
import os

from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "evidence")
os.makedirs(OUT, exist_ok=True)

W = 384
INK = (30, 30, 46)  # near-black navy
FAINT = (90, 90, 110)


def new_canvas():
    img = Image.new("RGB", (W, W), (255, 255, 255))
    return img, ImageDraw.Draw(img)


def save(img, name):
    path = os.path.join(OUT, name)
    img.save(path, "PNG")
    data = open(path, "rb").read()
    b64 = base64.b64encode(data).decode("ascii")
    with open(os.path.join(OUT, name.replace(".png", ".b64")), "w") as f:
        f.write(b64)
    print(name, "bytes:", len(data), "b64:", len(b64),
          "sha256:", hashlib.sha256(data).hexdigest())
    return data


# --- bicycle: two wheels + frame + fork + handlebar + saddle -----------
def bicycle():
    img, d = new_canvas()
    w = 4
    rear = (118, 262)
    front = (272, 262)
    r = 68
    for cx, cy in (rear, front):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=INK, width=w)
        # a few spokes so the wheels read as wheels, not rings
        for ang in (30, 90, 150, 210, 270, 330):
            import math
            a = math.radians(ang)
            d.line([cx, cy, cx + int(r * 0.92 * math.cos(a)),
                    cy + int(r * 0.92 * math.sin(a))],
                   fill=FAINT, width=2)
    seat = (152, 148)      # seat cluster
    head = (246, 158)      # head tube top
    bb = (196, 258)        # bottom bracket
    # frame triangle + top tube + down tube
    d.line([rear, seat], fill=INK, width=w)
    d.line([seat, head], fill=INK, width=w)
    d.line([head, front], fill=INK, width=w)
    d.line([rear, bb], fill=INK, width=w)
    d.line([bb, seat], fill=INK, width=w)
    d.line([bb, head], fill=INK, width=w)
    # fork
    d.line([head, front], fill=INK, width=w)
    # handlebar: stem up from head tube, swept bar
    d.line([head, (head[0] + 6, head[1] - 34)], fill=INK, width=w)
    d.line([(head[0] + 6, head[1] - 34), (head[0] + 34, head[1] - 30)],
           fill=INK, width=w)
    # saddle
    d.line([(seat[0] - 26, seat[1] - 6), (seat[0] + 20, seat[1] - 6)],
           fill=INK, width=w)
    # seat post
    d.line([seat, (seat[0], seat[1] - 6)], fill=INK, width=w)
    # crank + pedal
    d.ellipse([bb[0] - 14, bb[1] - 14, bb[0] + 14, bb[1] + 14],
              outline=INK, width=3)
    d.line([bb, (bb[0] + 22, bb[1] + 26)], fill=INK, width=3)
    d.line([(bb[0] + 10, bb[1] + 26), (bb[0] + 34, bb[1] + 26)],
           fill=INK, width=3)
    return img


# --- lighthouse: deliberately vague -- plain tapered tower, tiny lamp ---
def lighthouse():
    img, d = new_canvas()
    w = 4
    # tapered tower outline only, no stripes, no beams, no waves
    d.polygon([(158, 308), (226, 308), (210, 128), (174, 128)],
              outline=INK, width=w)
    # two faint horizontal lines (bare suggestion of structure)
    d.line([(168, 220), (216, 220)], fill=FAINT, width=2)
    d.line([(172, 176), (212, 176)], fill=FAINT, width=2)
    # lamp room: small plain box + flat cap
    d.rectangle([176, 96, 208, 128], outline=INK, width=w)
    d.line([(170, 96), (214, 96)], fill=INK, width=w)
    # ground line only
    d.line([(120, 308), (264, 308)], fill=INK, width=w)
    return img


# --- lighthouse, vaguer take 2: bare tapered tower, NO lamp room, NO
# cap, NO ground line -- just a trapezoid with railing ticks + one
# faint line. The R2 drawing (tower + lamp room + cap) read as a
# clear MATCHES; this one aims at the WEAK band ("vaguely resembles").
def lighthouse_vague():
    img, d = new_canvas()
    w = 4
    d.polygon([(158, 308), (226, 308), (210, 140), (174, 140)],
              outline=INK, width=w)
    # railing ticks at the top: a hint of a gallery, no enclosed lamp
    for x in (178, 188, 198, 208):
        d.line([(x, 140), (x, 126)], fill=INK, width=3)
    d.line([(172, 140), (212, 140)], fill=INK, width=3)
    # one faint horizontal line
    d.line([(168, 224), (216, 224)], fill=FAINT, width=2)
    return img


# --- volcano text cheat: the written word only, no drawing -------------
def volcano_text():
    img, d = new_canvas()
    font = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
    text = "VOLCANO"
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    d.text(((W - tw) / 2 - bbox[0], (W - th) / 2 - bbox[1]),
           text, font=font, fill=INK)
    return img


if __name__ == "__main__":
    meta = {}
    for fn, name in ((bicycle, "bicycle.png"),
                     (lighthouse, "lighthouse.png"),
                     (lighthouse_vague, "lighthouse-vague.png"),
                     (volcano_text, "volcano-text.png")):
        data = save(fn(), name)
        meta[name] = {
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "b64_chars": len(base64.b64encode(data)),
        }
    # crank.png reused from the probe (same bytes, same hash)
    import shutil
    crank_src = os.path.expanduser(
        "~/workspace/build-p12/probe/evidence/crank.png")
    crank = open(crank_src, "rb").read()
    shutil.copy(crank_src, os.path.join(OUT, "crank.png"))
    with open(os.path.join(OUT, "crank.b64"), "w") as f:
        f.write(base64.b64encode(crank).decode("ascii"))
    meta["crank.png"] = {
        "bytes": len(crank),
        "sha256": hashlib.sha256(crank).hexdigest(),
        "b64_chars": len(base64.b64encode(crank)),
        "source": "probe evidence, Wikimedia Commons File:Crank (PSF).png, "
                  "public domain line art",
    }
    print("crank.png bytes:", len(crank), "b64:",
          len(base64.b64encode(crank)),
          "sha256:", hashlib.sha256(crank).hexdigest())
    with open(os.path.join(OUT, "images.json"), "w") as f:
        json.dump(meta, f, indent=2, sort_keys=True)
    print("wrote", os.path.join(OUT, "images.json"))
