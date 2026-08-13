#!/usr/bin/env python3
"""Build the versioned Risk Takers v2 production print artwork.

The v2 artwork mirrors the restrained physical-product direction used by the
approved storefront photography: a clean extracted Risk Takers wordmark,
washed charcoal, warm cream, and one small signal-yellow accent. It does not
generate storefront mockups and never overwrites the original v1 print files.

All output is deterministic, local, 300 DPI PNG artwork. No generated text,
network access, paid fonts, rejected iconography, or hazard framing.
"""

from __future__ import annotations

import argparse
import random
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
# Print masters stay in private local brand storage, outside this public repo
# and Vite's public root, so neither GitHub nor a deployment can publish them.
ART_DIR = Path(
    "/Users/ak/Documents/Risk Takers/Brand Assets/Merch/Production/Edition 01"
)
BRAND_LOGO = ROOT / "public" / "merch" / "brand" / "risk-takers-logo-source.png"

CHARCOAL = (28, 29, 27, 255)
CHARCOAL_LIGHT = (38, 39, 36, 255)
CREAM = (239, 233, 216, 255)
WASHED_GRAY = (166, 163, 153, 255)
SIGNAL_YELLOW = (224, 178, 14, 255)
TRANSPARENT = (0, 0, 0, 0)

DESK_MAT_PRINT_SIZE = (9921, 5196)
# Keep every mark at least 0.07 of the canvas width and 0.10 of its height
# inside Fourthwall's full-bleed print boundary. The background alone bleeds.
DESK_MAT_SAFE_INSET = (744, 520)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


@dataclass(frozen=True)
class AssetSpec:
    filename: str
    size: tuple[int, int]
    transparent: bool

    @property
    def path(self) -> Path:
        return ART_DIR / self.filename


SPECS = (
    AssetSpec("human-in-the-loop-left-chest-v2-1500x1500.png", (1500, 1500), True),
    AssetSpec("zero-trust-high-agency-left-chest-v2-1500x1500.png", (1500, 1500), True),
    AssetSpec("zero-trust-high-agency-sleeve-v2-3000x900.png", (3000, 900), True),
    AssetSpec("operator-fuel-mug-wrap-v2-4800x2000.png", (4800, 2000), True),
    AssetSpec("attack-surface-desk-mat-full-bleed-v3-9921x5196.png", DESK_MAT_PRINT_SIZE, False),
    AssetSpec("risk-takers-sticker-v2-3000x3000.png", (3000, 3000), True),
)


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD, size)


def text_box(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), value, font=face)
    return box[2] - box[0], box[3] - box[1]


def fit_font(value: str, max_width: int, start: int) -> ImageFont.FreeTypeFont:
    scratch = ImageDraw.Draw(Image.new("RGBA", (16, 16), TRANSPARENT))
    size = start
    while size >= 24:
        face = font(size)
        if text_box(scratch, value, face)[0] <= max_width:
            return face
        size -= max(2, size // 24)
    return font(24)


def approved_wordmark(fill: tuple[int, int, int, int] = CREAM) -> Image.Image:
    """Extract only the original RISK TAKERS lettering from the approved logo.

    The source logo contains a plate and diagonal caution surround. Cropping its
    central letter field and selecting its warm neutral ink preserves the exact
    distressed letterforms without carrying that rejected frame into products.
    """

    source = Image.open(BRAND_LOGO).convert("RGBA")
    letter_field = source.crop((165, 285, 1115, 1015))
    mask = Image.new("L", letter_field.size, 0)
    source_pixels = letter_field.load()
    mask_pixels = mask.load()

    for y in range(letter_field.height):
        for x in range(letter_field.width):
            red, green, blue, _ = source_pixels[x, y]
            is_warm_neutral = red > 120 and green > 110 and blue > 82 and red - blue < 105
            if is_warm_neutral:
                mask_pixels[x, y] = min(255, max(0, (min(red, green, blue) - 72) * 3))

    bounds = mask.getbbox()
    if bounds is None:
        raise RuntimeError(f"Could not extract approved wordmark from {BRAND_LOGO}")

    mask = mask.crop(bounds)
    wordmark = Image.new("RGBA", mask.size, fill)
    wordmark.putalpha(mask)
    return wordmark


def paste_contain(
    canvas: Image.Image,
    art: Image.Image,
    box: tuple[int, int, int, int],
    *,
    align: str = "center",
) -> None:
    x0, y0, x1, y1 = box
    copy = art.copy()
    copy.thumbnail((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    if align == "left":
        x = x0
    elif align == "right":
        x = x1 - copy.width
    else:
        x = x0 + ((x1 - x0) - copy.width) // 2
    y = y0 + ((y1 - y0) - copy.height) // 2
    canvas.alpha_composite(copy, (x, y))


def paste_brand_logo(
    canvas: Image.Image,
    box: tuple[int, int, int, int],
    *,
    align: str = "center",
) -> None:
    """Place the clean lettering extracted from the approved brand source."""

    paste_contain(canvas, approved_wordmark(), box, align=align)


def draw_label(
    canvas: Image.Image,
    value: str,
    xy: tuple[int, int],
    max_width: int,
    start_size: int,
    fill: tuple[int, int, int, int] = CREAM,
) -> tuple[int, int]:
    draw = ImageDraw.Draw(canvas)
    face = fit_font(value, max_width, start_size)
    draw.text(xy, value, font=face, fill=fill)
    return text_box(draw, value, face)


def add_charcoal_wash(canvas: Image.Image, seed: int) -> None:
    """Add restrained print texture without introducing illustrative motifs."""

    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    width, height = canvas.size
    for _ in range(14000):
        x = rng.randrange(width)
        y = rng.randrange(height)
        length = rng.randrange(4, 34)
        tone = rng.choice((31, 32, 33, 35))
        draw.line(
            (x, y, min(width - 1, x + length), y),
            fill=(tone, tone, max(0, tone - 2), 255),
            width=rng.choice((1, 1, 1, 2)),
        )


def save_art(canvas: Image.Image, spec: AssetSpec) -> Path:
    if canvas.size != spec.size:
        raise ValueError(f"{spec.filename}: expected {spec.size}, got {canvas.size}")
    canvas.save(spec.path, dpi=(300, 300), optimize=True)
    return spec.path


def build_tee(spec: AssetSpec) -> Path:
    canvas = Image.new("RGBA", spec.size, TRANSPARENT)
    paste_brand_logo(canvas, (330, 250, 810, 690), align="left")
    draw_label(canvas, "HUMAN IN THE LOOP", (330, 770), 850, 82)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((330, 930, 415, 948), radius=9, fill=SIGNAL_YELLOW)
    return save_art(canvas, spec)


def build_hoodie_chest(spec: AssetSpec) -> Path:
    canvas = Image.new("RGBA", spec.size, TRANSPARENT)
    paste_brand_logo(canvas, (430, 320, 1070, 1180))
    return save_art(canvas, spec)


def build_hoodie_sleeve(spec: AssetSpec) -> Path:
    canvas = Image.new("RGBA", spec.size, TRANSPARENT)
    width, height = draw_label(canvas, "ZERO TRUST / HIGH AGENCY", (170, 300), 2490, 170)
    draw = ImageDraw.Draw(canvas)
    dot_x = min(2820, 170 + width + 125)
    dot_y = 300 + height // 2 + 32
    draw.ellipse((dot_x, dot_y, dot_x + 46, dot_y + 46), fill=SIGNAL_YELLOW)
    return save_art(canvas, spec)


def build_mug(spec: AssetSpec) -> Path:
    canvas = Image.new("RGBA", spec.size, TRANSPARENT)
    paste_brand_logo(canvas, (930, 600, 1840, 1440))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((2080, 650, 2100, 1350), radius=10, fill=WASHED_GRAY)
    width, height = draw_label(canvas, "OPERATOR FUEL", (2380, 835), 1510, 210)
    dot_x = 2380 + width + 125
    dot_y = 835 + height // 2 + 20
    draw.ellipse((dot_x, dot_y, dot_x + 72, dot_y + 72), fill=SIGNAL_YELLOW)
    return save_art(canvas, spec)


def build_desk_mat(spec: AssetSpec) -> Path:
    if spec.size != DESK_MAT_PRINT_SIZE:
        raise ValueError(f"Desk mat must use Fourthwall's exact print canvas: {DESK_MAT_PRINT_SIZE}")

    canvas = Image.new("RGBA", spec.size, CHARCOAL)
    add_charcoal_wash(canvas, seed=5196)

    safe_x, safe_y = DESK_MAT_SAFE_INSET
    paste_brand_logo(canvas, (safe_x, 3200, 2380, spec.size[1] - safe_y), align="left")

    draw = ImageDraw.Draw(canvas)
    face = fit_font("ATTACK SURFACE", 1880, 215)
    label_width, label_height = text_box(draw, "ATTACK SURFACE", face)
    dot_size = 72
    dot_gap = 118
    content_right = spec.size[0] - safe_x
    label_x = content_right - dot_size - dot_gap - label_width
    label_y = spec.size[1] - safe_y - label_height - 82
    draw.text((label_x, label_y), "ATTACK SURFACE", font=face, fill=CREAM)
    dot_x = label_x + label_width + dot_gap
    dot_y = label_y + max(0, (label_height - dot_size) // 2) + 38
    draw.ellipse((dot_x, dot_y, dot_x + dot_size, dot_y + dot_size), fill=SIGNAL_YELLOW)
    return save_art(canvas, spec)


def build_sticker(spec: AssetSpec) -> Path:
    canvas = Image.new("RGBA", spec.size, TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    sticker_box = (180, 420, 2820, 2580)
    draw.rounded_rectangle(sticker_box, radius=170, fill=CHARCOAL_LIGHT)
    paste_brand_logo(canvas, (500, 610, 2500, 2390))
    draw.ellipse((2550, 2310, 2620, 2380), fill=SIGNAL_YELLOW)
    return save_art(canvas, spec)


BUILDERS = (
    build_tee,
    build_hoodie_chest,
    build_hoodie_sleeve,
    build_mug,
    build_desk_mat,
    build_sticker,
)


def validate_asset(spec: AssetSpec) -> str:
    if not spec.path.exists():
        raise FileNotFoundError(spec.path)

    with Image.open(spec.path) as image:
        if image.size != spec.size:
            raise ValueError(f"{spec.filename}: expected {spec.size}, got {image.size}")
        if image.mode != "RGBA":
            raise ValueError(f"{spec.filename}: expected RGBA, got {image.mode}")

        dpi = image.info.get("dpi", (0, 0))
        if any(abs(value - 300) > 1 for value in dpi):
            raise ValueError(f"{spec.filename}: expected 300 DPI, got {dpi}")

        alpha = image.getchannel("A")
        alpha_extrema = alpha.getextrema()
        bounds = alpha.getbbox()
        if bounds is None:
            raise ValueError(f"{spec.filename}: artwork is empty")
        if spec.transparent and alpha_extrema[0] != 0:
            raise ValueError(f"{spec.filename}: transparent placement art has no clear pixels")
        if not spec.transparent and alpha_extrema != (255, 255):
            raise ValueError(f"{spec.filename}: full-bleed art is not fully opaque")

        if spec.filename.startswith("attack-surface-desk-mat"):
            if image.size != DESK_MAT_PRINT_SIZE:
                raise ValueError(
                    f"{spec.filename}: Fourthwall desk-mat canvas must be {DESK_MAT_PRINT_SIZE}"
                )

        if spec.transparent:
            left, top, right, bottom = bounds
            if left == 0 or top == 0 or right == image.width or bottom == image.height:
                raise ValueError(f"{spec.filename}: content touches the canvas edge")

    kind = "transparent placement" if spec.transparent else "opaque full bleed"
    return f"PASS {spec.filename} | {spec.size[0]}x{spec.size[1]} | 300 DPI | {kind}"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="validate existing v2 output without rebuilding it",
    )
    args = parser.parse_args()

    ART_DIR.mkdir(parents=True, exist_ok=True)
    if not args.validate_only:
        if len(BUILDERS) != len(SPECS):
            raise RuntimeError("Each v2 asset must have exactly one builder")
        for builder, spec in zip(BUILDERS, SPECS):
            builder(spec)

    for spec in SPECS:
        print(validate_asset(spec))


if __name__ == "__main__":
    main()
