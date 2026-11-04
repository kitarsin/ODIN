"""Make slide elements in the ODIN look (the AVP and the poster) from the list in elements.json.

    python make_elements.py                      everything in elements.json, into out\\
    python make_elements.py my_slides.json       another list
    python make_elements.py --only odin_hello    just the elements with these names

Needs Python 3.9 or newer with Pillow and NumPy:   pip install pillow numpy
Every element comes out as name@2x.png, name@3x.png and name@4x.png. On a 1920x1080 slide,
@4x matches the AVP. Every option is in START HERE.html, under "Make your own".
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent
sys.path.insert(0, str(HERE))

from odinkit import elements as E  # noqa: E402
from odinkit import kit  # noqa: E402

kit.FONT_PATH = KIT / "1 Fonts" / "Dedicool.ttf"

# names you can give "image" or "portrait" instead of a file path
SHORTCUTS = {"odin": KIT / "2 Brand and Logos" / "odin_head@1x.png"}
for folder in ("team", "faculty"):
    for png in (KIT / "3 Characters" / folder).glob("*_standing@1x.png"):
        SHORTCUTS[png.name.replace("_standing@1x.png", "")] = png         # jerson, doc_shane, ...

# JSON key -> argument name, where they differ
RENAME = {"text": "text_", "color": "color_"}
MAKERS = {"panel": E.panel, "dialog": E.dialog, "lettering": E.lettering, "heading": E.heading,
          "card": E.card, "tag": E.tag}


def find(ref, base):
    """A shortcut ("odin", "russell", "enemy25") or a path relative to the JSON file or the kit."""
    if ref in SHORTCUTS:
        return SHORTCUTS[ref]
    m = re.fullmatch(r"enemy(\d\d)", ref)
    if m:
        hits = sorted((KIT / "3 Characters" / "enemies").glob(f"*/{m.group(1)}_*@1x.png"))
        if hits:
            return hits[0]
    for root in (base, KIT):
        if (root / ref).exists():
            return root / ref
    raise SystemExit(f"Can't find the image '{ref}'. Use a shortcut ({', '.join(sorted(SHORTCUTS))}, "
                     f"enemy01..enemy35) or a path from the kit folder.")


def make(spec, base):
    spec = {k: v for k, v in spec.items() if not k.startswith("_")}       # "_comment" and the like
    kind, name = spec.pop("type", None), spec.pop("name", None)
    if kind not in MAKERS:
        raise SystemExit(f"'{name}': type must be one of {', '.join(MAKERS)}, not '{kind}'.")
    if not name:
        raise SystemExit(f"Every element needs a \"name\" (the {kind} without one).")
    for key in ("image", "portrait"):
        if isinstance(spec.get(key), str):
            spec[key] = find(spec[key], base)
    for b in spec.get("blocks", []):
        if isinstance(b.get("image"), str):
            b["image"] = find(b["image"], base)
    kwargs = {RENAME.get(k, k): v for k, v in spec.items()}
    try:
        return name, MAKERS[kind](**kwargs)
    except TypeError as e:
        raise SystemExit(f"'{name}': {e}. Check the option names for a {kind} in START HERE.html.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("spec", nargs="?", type=Path, default=HERE / "elements.json")
    ap.add_argument("--only", nargs="*", metavar="NAME", help="make just these elements")
    ap.add_argument("--out", type=Path, default=HERE / "out")
    args = ap.parse_args()

    data = json.loads(args.spec.read_text(encoding="utf-8"))
    scales = data.get("scales", [2, 3, 4])
    for spec in data["elements"]:
        if args.only and spec.get("name") not in args.only:
            continue
        name, im = make(spec, args.spec.resolve().parent)
        paths = E.save(im, args.out, name, scales)
        print(f"{name}: {im.width}x{im.height} pixels -> " + ", ".join(p.name for p in paths))
    print(f"Saved in {args.out}")


if __name__ == "__main__":
    main()
