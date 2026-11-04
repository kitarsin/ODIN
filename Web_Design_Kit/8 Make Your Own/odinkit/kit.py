"""Pixel-art rendering kit: a 480x270 canvas, bitmap text, sprites, easing and video output.

Everything is drawn on a small RGB canvas with whole-pixel coordinates, then
scaled up by an integer factor with hard edges when the video is encoded.
"""
from __future__ import annotations

import math
import os
import shutil
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .font5x7 import ADVANCE, GLYPH_H, GLYPH_W, GLYPHS, LINE_H  # noqa: F401  (re-exported)

W, H = 480, 270


# --- maths -------------------------------------------------------------------

def clamp(x, lo=0.0, hi=1.0):
    return lo if x < lo else hi if x > hi else x


def seg(t, t0, t1):
    """Progress of t through [t0, t1], clamped to 0..1."""
    if t1 <= t0:
        return 1.0 if t >= t1 else 0.0
    return clamp((t - t0) / (t1 - t0))


def lerp(a, b, u):
    return a + (b - a) * u


def ease_out(u):
    return 1 - (1 - u) ** 3


def ease_in(u):
    return u ** 3


def ease_in_out(u):
    return u * u * (3 - 2 * u)


def ease_out_back(u, s=1.70158):
    u -= 1
    return 1 + u * u * ((s + 1) * u + s)


def ease_out_bounce(u):
    n, d = 7.5625, 2.75
    if u < 1 / d:
        return n * u * u
    if u < 2 / d:
        u -= 1.5 / d
        return n * u * u + 0.75
    if u < 2.5 / d:
        u -= 2.25 / d
        return n * u * u + 0.9375
    u -= 2.625 / d
    return n * u * u + 0.984375


def blink(t, period, duty=0.5, phase=0.0):
    return ((t + phase) % period) < period * duty


# --- colour ------------------------------------------------------------------

def rgb(c):
    if isinstance(c, str):
        c = c.lstrip("#")
        return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
    return tuple(int(v) for v in c[:3])


def mix(a, b, u):
    a, b, u = rgb(a), rgb(b), clamp(u)
    return tuple(int(round(a[i] + (b[i] - a[i]) * u)) for i in range(3))


# --- canvas primitives -------------------------------------------------------

def new_canvas(color=(0, 0, 0), size=(W, H)):
    return Image.new("RGB", size, rgb(color))


def fill(im, x, y, w, h, color, alpha=1.0):
    x, y, w, h = int(round(x)), int(round(y)), int(round(w)), int(round(h))
    if w <= 0 or h <= 0 or alpha <= 0:
        return
    box = (x, y, x + w, y + h)
    if alpha >= 1:
        im.paste(rgb(color), box)
    else:
        im.paste(rgb(color), box, Image.new("L", (w, h), int(255 * alpha)))


def frame(im, x, y, w, h, color, t=1, alpha=1.0):
    fill(im, x, y, w, t, color, alpha)
    fill(im, x, y + h - t, w, t, color, alpha)
    fill(im, x, y + t, t, h - 2 * t, color, alpha)
    fill(im, x + w - t, y + t, t, h - 2 * t, color, alpha)


def panel(im, x, y, w, h, bg, border, bw=2, bg_alpha=1.0, notch=1):
    """A bordered box with clipped (pixel-rounded) corners, like the game's StyleBoxFlat panels."""
    fill(im, x + bw, y + bw, w - 2 * bw, h - 2 * bw, bg, bg_alpha)
    fill(im, x + notch, y, w - 2 * notch, bw, border)
    fill(im, x + notch, y + h - bw, w - 2 * notch, bw, border)
    fill(im, x, y + notch, bw, h - 2 * notch, border)
    fill(im, x + w - bw, y + notch, bw, h - 2 * notch, border)


def stamp(im, mask, x, y, color, alpha=1.0):
    """Paint `color` through an 8-bit mask."""
    if alpha <= 0:
        return
    if alpha < 1:
        mask = mask.point(lambda v: int(v * alpha))
    im.paste(rgb(color), (int(round(x)), int(round(y))), mask)


# --- bitmap text (5x7 font) --------------------------------------------------

_mask_cache: dict = {}


def text_w(s, scale=1):
    return max(0, len(s) * ADVANCE - 1) * scale


def text_mask(s, scale=1):
    key = (s, scale)
    m = _mask_cache.get(key)
    if m is None:
        a = np.zeros((GLYPH_H, max(1, len(s) * ADVANCE)), np.uint8)
        for i, ch in enumerate(s):
            g = GLYPHS.get(ch) or GLYPHS["?"]
            a[:, i * ADVANCE:i * ADVANCE + GLYPH_W] = np.array(g, np.uint8) * 255
        m = Image.fromarray(a, "L")
        if scale != 1:
            m = m.resize((m.width * scale, m.height * scale), Image.NEAREST)
        _mask_cache[key] = m
    return m


def _decorated(im, m, x, y, color, alpha, shadow, outline, step):
    if outline is not None:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx or dy:
                    stamp(im, m, x + dx * step, y + dy * step, outline, alpha)
    if shadow is not None:
        stamp(im, m, x + step, y + step, shadow, alpha)
    stamp(im, m, x, y, color, alpha)


def text(im, x, y, s, color, scale=1, alpha=1.0, shadow=None, outline=None, align="left"):
    """Draw 5x7 text. Returns the x just past the last glyph."""
    if not s:
        return x
    w = text_w(s, scale)
    if align == "center":
        x -= w // 2
    elif align == "right":
        x -= w
    _decorated(im, text_mask(s, scale), x, y, color, alpha, shadow, outline, 1)
    return x + w + scale


# --- TrueType text (the game's Dedicool font, rendered without anti-aliasing) -

_fonts: dict = {}
_ttf_cache: dict = {}
FONT_PATH: Path | None = None       # set by assets.py


def _font(size):
    f = _fonts.get(size)
    if f is None:
        f = ImageFont.truetype(str(FONT_PATH), size)
        _fonts[size] = f
    return f


def ttf_w(s, size=16):
    return int(math.ceil(_font(size).getlength(s)))


def ttf_mask(s, size=16):
    key = (s, size)
    m = _ttf_cache.get(key)
    if m is None:
        f = _font(size)
        asc, desc = f.getmetrics()
        m = Image.new("L", (max(1, ttf_w(s, size)) + 2, asc + desc + 2), 0)
        d = ImageDraw.Draw(m)
        d.fontmode = "1"
        d.text((0, 0), s, fill=255, font=f)
        _ttf_cache[key] = m
    return m


def ttf_text(im, x, y, s, color, size=16, alpha=1.0, shadow=None, outline=None, align="left"):
    if not s:
        return x
    w = ttf_w(s, size)
    if align == "center":
        x -= w // 2
    elif align == "right":
        x -= w
    _decorated(im, ttf_mask(s, size), x, y, color, alpha, shadow, outline, max(1, size // 8 // 2))
    return x + w


def wrap_ttf(s, size, max_w):
    """Greedy word wrap using real glyph widths."""
    lines, cur = [], ""
    for word in s.split(" "):
        trial = word if not cur else cur + " " + word
        if cur and ttf_w(trial, size) > max_w:
            lines.append(cur)
            cur = word
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines


# --- sprites -----------------------------------------------------------------

class Sprite:
    """An RGB image plus an alpha mask, with a few cheap pixel-art transforms."""

    def __init__(self, rgba):
        rgba = rgba.convert("RGBA")
        self.rgba = rgba
        self.rgb = rgba.convert("RGB")
        self.mask = rgba.getchannel("A")
        self.w, self.h = rgba.size

    def scaled(self, n):
        return Sprite(self.rgba.resize((self.w * n, self.h * n), Image.NEAREST))

    def flipped(self):
        return Sprite(self.rgba.transpose(Image.FLIP_LEFT_RIGHT))

    def rotated(self, quarter_turns_ccw=1):
        ops = {1: Image.ROTATE_90, 2: Image.ROTATE_180, 3: Image.ROTATE_270}
        return Sprite(self.rgba.transpose(ops[quarter_turns_ccw % 4]))

    def cropped(self, box):
        return Sprite(self.rgba.crop(box))

    def bbox(self):
        return self.mask.point(lambda v: 255 if v > 200 else 0).getbbox()

    def solid(self, color):
        """Same silhouette, one flat colour (used for hit flashes)."""
        out = Image.new("RGBA", (self.w, self.h), rgb(color) + (0,))
        out.putalpha(self.mask)
        return Sprite(out)

    def toned(self, color, amount):
        """Blend every pixel toward `color`."""
        flat = Image.new("RGB", (self.w, self.h), rgb(color))
        out = Image.blend(self.rgb, flat, clamp(amount)).convert("RGBA")
        out.putalpha(self.mask)
        return Sprite(out)

    def grey(self, amount=1.0):
        g = self.rgb.convert("L").convert("RGB")
        out = Image.blend(self.rgb, g, clamp(amount)).convert("RGBA")
        out.putalpha(self.mask)
        return Sprite(out)


def blit(im, spr, x, y, alpha=1.0):
    if alpha <= 0:
        return
    m = spr.mask if alpha >= 1 else spr.mask.point(lambda v: int(v * alpha))
    im.paste(spr.rgb, (int(round(x)), int(round(y))), m)


def sprite_from_rows(rows, palette, scale=1):
    """Build a sprite from ASCII art. `palette` maps characters to colours; '.' is transparent."""
    h, w = len(rows), len(rows[0])
    a = np.zeros((h, w, 4), np.uint8)
    for y, row in enumerate(rows):
        assert len(row) == w, row
        for x, ch in enumerate(row):
            if ch != ".":
                a[y, x, :3] = rgb(palette[ch])
                a[y, x, 3] = 255
    s = Sprite(Image.fromarray(a, "RGBA"))
    return s.scaled(scale) if scale != 1 else s


def outlined(spr, color):
    """Add a 1px outline around a sprite (grows the image by 1px on every side)."""
    a = np.asarray(spr.rgba)
    h, w = a.shape[:2]
    big = np.zeros((h + 2, w + 2, 4), np.uint8)
    big[1:-1, 1:-1] = a
    solid = big[:, :, 3] > 0
    grow = solid.copy()
    grow[1:, :] |= solid[:-1, :]
    grow[:-1, :] |= solid[1:, :]
    grow[:, 1:] |= solid[:, :-1]
    grow[:, :-1] |= solid[:, 1:]
    edge = grow & ~solid
    big[edge, :3] = rgb(color)
    big[edge, 3] = 255
    return Sprite(Image.fromarray(big, "RGBA"))


# --- whole-frame effects -----------------------------------------------------

def shifted(im, dx, dy, bg=(0, 0, 0)):
    if not dx and not dy:
        return im
    out = Image.new("RGB", im.size, rgb(bg))
    out.paste(im, (int(dx), int(dy)))
    return out


def dimmed(im, color, alpha):
    if alpha <= 0:
        return im
    return Image.blend(im, Image.new("RGB", im.size, rgb(color)), clamp(alpha))


def desaturated(im, amount):
    if amount <= 0:
        return im
    return Image.blend(im, im.convert("L").convert("RGB"), clamp(amount))


_rng = np.random.RandomState(20261012)
NOISE = _rng.rand(H, W)                 # stable per-pixel noise for dissolves
ROW_NOISE = _rng.rand(64, H)            # stable per-row noise for tearing


def torn(im, strength, seed):
    """Horizontal scan-line tearing: rows slide sideways by up to `strength` pixels."""
    if strength <= 0:
        return im
    a = np.asarray(im).copy()
    offs = ((ROW_NOISE[seed % 64] - 0.5) * 2 * strength).astype(int)
    band = 3                              # tear in 3px bands so it reads as chunky pixels
    for y0 in range(0, a.shape[0], band):
        o = offs[y0]
        if o:
            a[y0:y0 + band] = np.roll(a[y0:y0 + band], o, axis=1)
    return Image.fromarray(a, "RGB")


# --- video output ------------------------------------------------------------

def find_ffmpeg():
    p = os.environ.get("FFMPEG")
    if p and Path(p).exists():
        return p
    p = shutil.which("ffmpeg")
    if p:
        return p
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


class Encoder:
    """Writes canvas frames to an .mp4, scaled up by an integer factor with hard pixel edges.

    Uses ffmpeg (H.264) when available and falls back to OpenCV's MPEG-4 writer.
    """

    def __init__(self, path, fps, scale, size=(W, H)):
        self.path, self.scale, self.size = Path(path), scale, size
        self.path.parent.mkdir(parents=True, exist_ok=True)
        ow, oh = size[0] * scale, size[1] * scale
        self.proc = self.cv = None
        ff = find_ffmpeg()
        if ff:
            self.proc = subprocess.Popen(
                [ff, "-y", "-loglevel", "error",
                 "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{size[0]}x{size[1]}", "-r", str(fps), "-i", "-",
                 "-vf", f"scale={ow}:{oh}:flags=neighbor:out_color_matrix=bt709:out_range=tv,format=yuv420p,"
                        "setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv",
                 "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-tune", "animation", "-g", str(fps // 2),
                 "-movflags", "+faststart", str(self.path)],
                stdin=subprocess.PIPE)
        else:
            import cv2
            self.cv = cv2.VideoWriter(str(self.path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (ow, oh))

    def write(self, im):
        if self.proc:
            self.proc.stdin.write(im.tobytes())
        else:
            a = np.asarray(im)[:, :, ::-1]
            a = np.repeat(np.repeat(a, self.scale, axis=0), self.scale, axis=1)
            self.cv.write(np.ascontiguousarray(a))

    def close(self):
        if self.proc:
            self.proc.stdin.close()
            if self.proc.wait() != 0:
                raise RuntimeError(f"ffmpeg failed writing {self.path}")
        else:
            self.cv.release()
