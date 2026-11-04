"""Slide elements in the look of the ODIN AVP and poster: panels, ODIN's dialogue box, cards,
headings, tags and lettering, as see-through RGBA images.

Everything is drawn on a small canvas in whole pixels, then scaled up by a whole number with
hard edges. On a 1920x1080 slide one canvas pixel is 4 screen pixels, as in the AVP (a 480x270
canvas shown at 4x).

Each element is painted twice, over black and over white; the difference between the two
shots gives every pixel its exact alpha, so see-through panel backgrounds stay see-through.

Needs only kit.py and font5x7.py beside it (this file is copied into the slides kit with them).
Set kit.FONT_PATH to Dedicool.ttf before drawing Dedicool text.
"""
from __future__ import annotations

import re
import textwrap
from pathlib import Path

import numpy as np
from PIL import Image

from .kit import (ADVANCE, GLYPH_H, LINE_H, Sprite, blit, fill, frame, new_canvas, panel as box, rgb,
                  text, text_w, ttf_mask, ttf_text, ttf_w, wrap_ttf)

# --- palette: the game's UI colours and ODIN's own (same values as the AVP's assets.py) ---------
PALETTE = {
    "panel": (31, 34, 40),        # panel background (the game's code editor)
    "border": (21, 147, 255),     # panel border
    "white": (240, 246, 255),
    "ink": (10, 12, 20),          # shadows and dark text
    "deep": (7, 14, 38),          # slide background
    "dots": (22, 38, 82),         # the background's dot grid
    "navy": (11, 28, 69),         # ODIN's face
    "cyan": (95, 205, 228),       # ODIN
    "teal": (27, 209, 195),
    "ice": (190, 240, 232),
    "gold": (251, 242, 54),       # ODIN's eyes
    "speaker": (0, 255, 255),     # the speaker's name on the dialogue box
    "red": (217, 38, 38),         # error highlight
    "error": (255, 110, 110),     # error text
    "correct": (91, 227, 123),
    "amber": (255, 190, 70),
    "text": (222, 230, 242),      # code and body text
    "label": (150, 160, 180),     # small grey labels
    "muted": (96, 106, 126),      # line numbers, empty boxes
    "ground": (36, 60, 120),      # the patch of floor under each character
    "poster_navy": (39, 60, 111),
    # the five behaviours ODIN tracks (clip 4)
    "helpless": (111, 168, 255), "tinker": (255, 165, 59), "active": (91, 227, 123),
    "wheel": (199, 125, 255), "gaming": (255, 90, 110),
    # the four levels (clip 5)
    "level0": (0, 168, 255), "level1": (0, 255, 32), "level2": (241, 34, 34), "level3": (219, 255, 0),
}

PAD = 8                    # inner margin of a panel
GAP = 6                    # space between the blocks of a panel
BUTTON_BG = (58, 63, 70)

# C#-flavoured syntax colours, as in the code editor
C_COMMENT, C_KEYWORD, C_NUMBER = (118, 168, 110), (102, 178, 255), (255, 196, 104)
C_PUNCT, C_STRING = (176, 186, 204), (240, 160, 120)
_TOKEN = re.compile(
    r"(?P<comment>//.*)"
    r"|(?P<string>\"[^\"]*\")"
    r"|(?P<keyword>\b(?:int|new|for|foreach|in|while|do|if|else|string|var|void|bool|double|float|char"
    r"|return|continue|break|class|public|private|static|true|false|null)\b)"
    r"|(?P<number>\b\d+\b)"
    r"|(?P<punct>[\[\]{}();,.=<>+\-*/%!&|])")
_TOKEN_COLORS = {"comment": C_COMMENT, "string": C_STRING, "keyword": C_KEYWORD,
                 "number": C_NUMBER, "punct": C_PUNCT}


def color(c):
    """A palette name ("cyan"), a hex string ("#5FCDE4") or an (r, g, b) tuple."""
    if isinstance(c, str) and c.lower() in PALETTE:
        return PALETTE[c.lower()]
    return rgb(c)


def colorize(line):
    """One colour per character."""
    cols = [PALETTE["text"]] * len(line)
    for m in _TOKEN.finditer(line):
        cols[m.start():m.end()] = [_TOKEN_COLORS[m.lastgroup]] * (m.end() - m.start())
    return cols


def draw_code(im, x, y, line):
    cols = colorize(line)
    i = 0
    while i < len(line):
        j = i
        while j < len(line) and cols[j] == cols[i]:
            j += 1
        text(im, x + i * ADVANCE, y, line[i:j], cols[i])
        i = j


def load(img):
    """A PIL image, or a path to one, as RGBA."""
    if isinstance(img, (str, Path)):
        img = Image.open(img)
    if getattr(img, "n_frames", 1) > 1:
        img.seek(0)
    return img.convert("RGBA")


def wrap(s, chars):
    """Word-wrap 5x7 text to `chars` columns, keeping the line breaks already in it."""
    out = []
    for para in str(s).split("\n"):
        out += textwrap.wrap(para, max(1, chars)) or [""]
    return out


def _tall(s):
    return any(ch in "gjpqy,;" for ch in s)


# --- output ------------------------------------------------------------------------------------

def render(paint, size):
    """Run paint(im) over black and over white and return the result as RGBA."""
    shots = []
    for base in (0, 255):
        im = new_canvas((base, base, base), size)
        paint(im)
        shots.append(np.asarray(im, np.float64))
    black, white = shots
    a = 1 - (white - black).mean(axis=2) / 255
    col = black / np.maximum(a, 1e-6)[..., None]
    out = np.dstack([np.clip(np.round(col), 0, 255), np.round(a * 255)]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def trim(im):
    """Crop away the fully transparent border."""
    box_ = im.getchannel("A").getbbox()
    return im.crop(box_) if box_ else im


def save(im, out_dir, name, scales=(2, 3, 4), dpi=144):
    """Write name@<n>x.png for every scale. 144 dpi makes PowerPoint place a 1920 px wide image
    exactly across a 16:9 slide, so "Reset size" keeps every pixel sharp."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    for n in scales:
        path = out_dir / f"{name}@{n}x.png"
        big = im if n == 1 else im.resize((im.width * n, im.height * n), Image.NEAREST)
        big.save(path, dpi=(dpi, dpi))
        paths.append(path)
    return paths


# --- the panel: the game's code editor box, holding any mix of blocks ----------------------------

def _block_height(b, inner):
    """Height of one block, from the top of its first row to the bottom of its last."""
    if "text" in b:
        lines = wrap(b["text"], inner // ADVANCE)
        return (len(lines) - 1) * LINE_H + GLYPH_H
    if "bullets" in b:
        n = sum(len(wrap(s, inner // ADVANCE - 2)) for s in b["bullets"])
        return (n - 1) * LINE_H + GLYPH_H + 3 * (len(b["bullets"]) - 1)
    if "code" in b:
        return (len(b["code"]) - 1) * LINE_H + GLYPH_H
    if "divider" in b:
        return 1
    if "big" in b:
        s = b.get("scale", 3)
        return (GLYPH_H if _tall(b["big"]) else 7) * s
    if "lettering" in b:
        return ttf_mask(b["lettering"], b.get("size", 16)).getbbox()[3]
    if "image" in b:
        return load(b["image"]).height * b.get("scale", 1)
    raise ValueError(f"unknown panel block: {b}")


def _gutter(b):
    return len(str(len(b["code"]))) * ADVANCE + 7 if b.get("numbers", True) else 0


def _block_width(b):
    """The narrowest inner width that fits a block without cutting it."""
    if "code" in b:
        return _gutter(b) + max((len(s) for s in b["code"]), default=0) * ADVANCE + 2 * ADVANCE
    if "big" in b:
        return text_w(b["big"], b.get("scale", 3))
    if "lettering" in b:
        return ttf_w(b["lettering"], b.get("size", 16))
    if "image" in b:
        return load(b["image"]).width * b.get("scale", 1)
    return 0


def _draw_block(im, b, x, y, inner, w, accent):
    align = b.get("align", "left")

    def ax(width):
        return x + (inner - width) // 2 if align == "center" else x + inner - width if align == "right" else x

    if "text" in b:
        c = color(b.get("color", "text"))
        for k, s in enumerate(wrap(b["text"], inner // ADVANCE)):
            text(im, ax(text_w(s)), y + k * LINE_H, s, c)
    elif "bullets" in b:
        c, mark = color(b.get("color", "text")), color(b.get("marker_color", accent))
        for s in b["bullets"]:
            lines = wrap(s, inner // ADVANCE - 2)
            text(im, x, y, b.get("marker", "▶"), mark)
            for k, line in enumerate(lines):
                text(im, x + 2 * ADVANCE, y + k * LINE_H, line, c)
            y += len(lines) * LINE_H + 3
    elif "code" in b:
        g = _gutter(b)
        err = b.get("error_line")
        for k, line in enumerate(b["code"]):
            ry = y + k * LINE_H
            if err == k + 1:
                fill(im, 2, ry - 2, w - 4, LINE_H, PALETTE["red"], 0.40)
                fill(im, 2, ry - 2, 2, LINE_H, PALETTE["red"])
            if g:
                num_c = PALETTE["red"] if err == k + 1 else PALETTE["muted"]
                text(im, x + g - 7, ry, str(k + 1), num_c, align="right")
            draw_code(im, x + g, ry, line)
    elif "divider" in b:
        fill(im, 2, y, w - 4, 1, accent, 0.45)
    elif "big" in b:
        s = b.get("scale", 3)
        text(im, ax(text_w(b["big"], s)), y, b["big"], color(b.get("color", "gold")), scale=s,
             shadow=color(b["shadow"]) if b.get("shadow") else None)
    elif "lettering" in b:
        size = b.get("size", 16)
        x0, _, x1, _ = ttf_mask(b["lettering"], size).getbbox()
        ttf_text(im, ax(x1 - x0) - x0, y, b["lettering"], color(b.get("color", "white")), size=size)
    elif "image" in b:
        spr = Sprite(load(b["image"])).scaled(b.get("scale", 1))
        blit(im, spr, ax(spr.w), y)


def panel(title="", label="", blocks=(), width=240, button=None, accent="border", opacity=0.96):
    """The game's code editor box: a header strip (title left, grey label right) over blocks.

    blocks, top to bottom, each a dict:
        {"text": "...", "color": "text", "align": "left"}   wrapped paragraph; \\n starts a new line
        {"bullets": ["...", "..."], "marker": "▶"}          bulleted list
        {"code": ["int x = 1;", ...], "error_line": 2}      syntax-coloured C#, numbered lines
        {"divider": true}                                    thin line across the panel
        {"big": "92%", "scale": 3, "color": "gold"}          big 5x7 text, for a number or a word
        {"lettering": "...", "size": 16, "color": "white"}   Dedicool text
        {"image": <path or image>, "scale": 2, "align": "center"}
    """
    accent = color(accent)
    blocks = [dict(b) for b in blocks]
    head = bool(title or label)
    need = max([_block_width(b) for b in blocks] + [text_w(title) + text_w(label) + 3 * ADVANCE])
    w = max(width, need + 2 * PAD)
    inner = w - 2 * PAD
    y0 = 21 if head else PAD
    heights = [_block_height(b, inner) for b in blocks]
    content = sum(heights) + GAP * max(0, len(blocks) - 1)
    btn = 14 if button else 0
    h = y0 + content + (GAP + btn if button and blocks else btn) + PAD

    def paint(im):
        box(im, 0, 0, w, h, PALETTE["panel"], accent, bw=2, bg_alpha=opacity)
        if head:
            text(im, PAD, 5, title, PALETTE["white"])
            text(im, w - PAD, 5, label, PALETTE["label"], align="right")
            fill(im, 2, 15, w - 4, 1, accent, 0.45)
        y = y0
        for b, bh in zip(blocks, heights):
            _draw_block(im, b, PAD, y, inner, w, accent)
            y += bh + GAP
        if button:
            bw = text_w(button) + 14
            box(im, w - PAD - bw, h - PAD - 14, bw, 14, BUTTON_BG, accent, bw=1)
            text(im, w - PAD - bw // 2, h - PAD - 10, button, PALETTE["white"], align="center")

    return render(paint, (w, h))


# --- ODIN's dialogue box (clip 3) ----------------------------------------------------------------

def dialog(text_, speaker="Odin", width=468, font="pixel", hint=None, more=True, portrait=None,
           portrait_scale=2, opacity=0.96):
    """The game's dialogue box: the speaker's name on a tab, the line in big pixel text.

    font      "pixel" (the 5x7 font at 2x, as in the AVP) or "dedicool" (the game's own dialogue font)
    hint      [tier, of], e.g. [1, 3], draws the HINT tab with that many of the boxes filled
    more      the blinking arrow in the corner that says there is more to read
    portrait  an image drawn inside the box on the left (ODIN's head, a team member...)
    """
    pic = Sprite(load(portrait)).scaled(portrait_scale) if portrait is not None else None
    text_x = 14 + (pic.w + 10 if pic else 0)
    avail = width - text_x - 14
    lines = wrap_ttf(text_, 16, avail) if font == "dedicool" else wrap(text_, avail // 12)
    bh = max(len(lines) * 22 + 18, (pic.h + 16) if pic else 0)
    top = 15 if speaker else 9 if hint else 0
    h = top + bh

    def paint(im):
        y = top
        box(im, 0, y, width, bh, PALETTE["panel"], PALETTE["border"], bw=2, bg_alpha=opacity)
        if speaker:
            name_w = ttf_w(speaker, 16)
            box(im, 10, y - 15, name_w + 15, 20, PALETTE["panel"], PALETTE["border"], bw=2)
            ttf_text(im, 18, y - 12, speaker, PALETTE["speaker"], size=16)
        if hint:
            tier, of = hint
            tab_w = text_w("HINT") + 12 + of * 8 + 6
            tx = width - 10 - tab_w
            box(im, tx, y - 9, tab_w, 14, PALETTE["panel"], PALETTE["border"], bw=2)
            text(im, tx + 7, y - 5, "HINT", PALETTE["ice"])
            for k in range(of):
                px = tx + 7 + text_w("HINT") + 6 + k * 8
                if k < tier:
                    fill(im, px, y - 5, 6, 6, PALETTE["gold"])
                else:
                    frame(im, px, y - 5, 6, 6, PALETTE["muted"])
        if pic:
            blit(im, pic, 10, y + (bh - pic.h) // 2)
        ty = y + (bh - len(lines) * 22) // 2 + 3
        for line in lines:
            if font == "dedicool":
                ttf_text(im, text_x, ty - 2, line, PALETTE["white"], size=16)
            else:
                text(im, text_x, ty, line, PALETTE["white"], scale=2)
            ty += 22
        if more:
            text(im, width - 16, y + bh - 14, "▼", PALETTE["cyan"])

    return render(paint, (width, h))


# --- titles ----------------------------------------------------------------------------------------

def lettering(text_, size=16, color_="white", shadow=None):
    """Dedicool lettering on nothing. Keep size a multiple of 8 so every stroke is whole pixels."""
    step = max(2, size // 16)
    w, h = ttf_w(text_, size) + step + 4, size + step + 8

    def paint(im):
        if shadow:
            ttf_text(im, step, step, text_, color(shadow), size=size)
        ttf_text(im, 0, 0, text_, color(color_), size=size)

    return trim(render(paint, (w, h)))


def heading(title, subtitle="", scale=2, color_="cyan", highlight="", highlight_color="cyan",
            subtitle_color="white", subtitle_scale=1, shadow="ink", align="center"):
    """A big 5x7 heading with a hard shadow, and smaller lines under it (the clip 4 and 5 titles).

    highlight   a word of the title drawn in highlight_color, like "ODIN" in BEHAVIORS ODIN TRACKS
    subtitle    one line, or several split with \\n
    """
    runs = [(title, color(color_))]
    if highlight and highlight in title:
        a, b = title.split(highlight, 1)
        runs = [(a, color(color_)), (highlight, color(highlight_color)), (b, color(color_))]
    subs = subtitle.split("\n") if subtitle else []
    tw = text_w(title, scale)
    w = max([tw] + [text_w(s, subtitle_scale) for s in subs]) + scale
    sub_y, pitch = GLYPH_H * scale + 5, (GLYPH_H + 2) * subtitle_scale
    h = (sub_y + (len(subs) - 1) * pitch + GLYPH_H * subtitle_scale if subs else GLYPH_H * scale) + scale

    def x_for(width):
        return (w - scale - width) // 2 if align == "center" else 0

    def paint(im):
        x = x_for(tw)
        for s, c in runs:
            text(im, x, 0, s, c, scale=scale, shadow=color(shadow) if shadow else None)
            x += len(s) * ADVANCE * scale
        for k, s in enumerate(subs):
            text(im, x_for(text_w(s, subtitle_scale)), sub_y + k * pitch, s, color(subtitle_color),
                 scale=subtitle_scale)

    return render(paint, (w, h))


# --- cards and tags ----------------------------------------------------------------------------------

def card(title, detail="", accent="cyan", image=None, image_scale=2, width=86, opacity=0.97):
    """A behaviour card (clip 4): a tinted plate with a picture, a title, a short bar, a detail.

    title and detail are strings (wrapped to fit) or lists of lines.
    """
    c = color(accent)
    pic = Sprite(load(image)).scaled(image_scale) if image is not None else None
    if pic:
        width = max(width, pic.w + 12)                     # room for the picture inside the border
    chars = (width - 8) // ADVANCE
    t_lines = title if isinstance(title, list) else wrap(title, chars)
    d_lines = detail if isinstance(detail, list) else (wrap(detail, chars) if detail else [])
    plate = max(44, pic.h + 8) if pic else 44
    title_y = plate + 8 if len(t_lines) > 1 else plate + 13
    bar_y = plate + 33 + 11 * max(0, len(t_lines) - 2)
    h = bar_y + 8 + 11 * len(d_lines) + 5 if d_lines else bar_y + 8

    def paint(im):
        box(im, 0, 0, width, h, PALETTE["panel"], c, bw=2, bg_alpha=opacity)
        fill(im, 2, 2, width - 4, plate, c, 0.16)
        if pic:
            blit(im, pic, (width - pic.w) // 2, 2 + (plate - pic.h) // 2)
        cx = width // 2
        for k, line in enumerate(t_lines):
            text(im, cx, title_y + k * 11, line, PALETTE["white"], align="center")
        fill(im, cx - 14, bar_y, 28, 2, c)
        for k, line in enumerate(d_lines):
            text(im, cx, bar_y + 8 + k * 11, line, PALETTE["label"], align="center")

    return render(paint, (width, h))


def tag(text_, color_="border", text_color="white"):
    """A small label chip, like the P1 / MENTOR tags on the character select."""
    w = text_w(text_) + 6

    def paint(im):
        fill(im, 0, 0, w, 11, color(color_))
        text(im, 3, 2, text_, color(text_color))

    return render(paint, (w, 11))
