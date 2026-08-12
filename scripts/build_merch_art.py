#!/usr/bin/env python3
"""Build logo-led Risk Takers print artwork and storefront mockups.

The print files are transparent 300 DPI PNGs (except the full-bleed desk mat).
No external network, paid fonts, or generated text is required.
"""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ART_DIR = ROOT / "public" / "merch" / "artwork"
MOCKUP_DIR = ROOT / "public" / "merch" / "mockups"
BRAND_LOGO = ROOT / "public" / "merch" / "brand" / "risk-takers-logo-source.png"

BLACK = (24, 24, 22, 255)
CREAM = (244, 240, 226, 255)
WASHED_GRAY = (166, 163, 153, 255)
DARK_GRAY = (58, 57, 53, 255)
YELLOW = (241, 196, 15, 255)
TRANSPARENT = (0, 0, 0, 0)

FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_MONO = "/System/Library/Fonts/SFNSMono.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def text_size(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), value, font=face, stroke_width=0)
    return box[2] - box[0], box[3] - box[1]


def fit_font(draw: ImageDraw.ImageDraw, value: str, path: str, max_width: int, start: int) -> ImageFont.FreeTypeFont:
    size = start
    while size > 24:
        face = font(path, size)
        if text_size(draw, value, face)[0] <= max_width:
            return face
        size -= max(2, size // 30)
    return font(path, 24)


def centered_text(
    draw: ImageDraw.ImageDraw,
    value: str,
    center_x: int,
    y: int,
    face: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    stroke_width: int = 0,
    stroke_fill: tuple[int, int, int, int] | None = None,
) -> None:
    width, _ = text_size(draw, value, face)
    draw.text(
        (center_x - width / 2, y),
        value,
        font=face,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )


def hazard_stripes(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    color: tuple[int, int, int, int] = YELLOW,
    stripe: int = 120,
) -> None:
    x0, y0, x1, y1 = box
    draw.rectangle(box, fill=BLACK)
    height = y1 - y0
    x = x0 - height
    while x < x1:
        draw.polygon(
            [(x, y1), (x + stripe, y1), (x + stripe + height, y0), (x + height, y0)],
            fill=color,
        )
        x += stripe * 2


def add_grit(image: Image.Image, seed: int, count: int, opacity: int = 80) -> None:
    rng = random.Random(seed)
    overlay = Image.new("RGBA", image.size, TRANSPARENT)
    draw = ImageDraw.Draw(overlay)
    for _ in range(count):
        x = rng.randrange(image.width)
        y = rng.randrange(image.height)
        radius = rng.choice((2, 3, 4, 6, 9, 12))
        color = rng.choice((CREAM, YELLOW, BLACK))
        draw.ellipse((x, y, x + radius, y + max(2, radius // 2)), fill=(*color[:3], opacity))
    image.alpha_composite(overlay)


def save_art(image: Image.Image, filename: str) -> Path:
    path = ART_DIR / filename
    image.save(path, dpi=(300, 300), optimize=True)
    return path


def paste_brand_logo(canvas: Image.Image, box: tuple[int, int, int, int]) -> None:
    """Place the approved Risk Takers source logo without redrawing or inventing a mark."""
    x0, y0, x1, y1 = box
    approved_logo = Image.open(BRAND_LOGO).convert("RGBA")
    approved_logo.thumbnail((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    approved_logo = approved_logo.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))
    x = x0 + ((x1 - x0) - approved_logo.width) // 2
    y = y0 + ((y1 - y0) - approved_logo.height) // 2
    canvas.alpha_composite(approved_logo, (x, y))


def human_in_the_loop() -> Path:
    canvas = Image.new("RGBA", (4500, 5400), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    hazard_stripes(draw, (300, 220, 4200, 500), stripe=150)
    draw.rounded_rectangle((300, 670, 4200, 4850), radius=130, fill=BLACK, outline=WASHED_GRAY, width=38)
    draw.rounded_rectangle((380, 750, 4120, 4770), radius=100, outline=YELLOW, width=16)
    paste_brand_logo(canvas, (1020, 850, 3480, 3310))

    label_face = fit_font(draw, "HUMAN IN THE LOOP", FONT_BLACK, 3400, 500)
    centered_text(draw, "HUMAN IN THE LOOP", 2250, 3490, label_face, CREAM)
    draw.rectangle((620, 4160, 3880, 4190), fill=WASHED_GRAY)
    small_face = font(FONT_MONO, 92)
    centered_text(draw, "KEEP THE JUDGMENT / AUTOMATE THE DRAG", 2250, 4350, small_face, YELLOW)
    hazard_stripes(draw, (300, 5000, 4200, 5280), stripe=150)

    add_grit(canvas, seed=1107, count=520, opacity=52)
    return save_art(canvas, "human-in-the-loop-print-4500x5400.png")


def zero_trust_high_agency() -> Path:
    canvas = Image.new("RGBA", (4500, 5400), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    hazard_stripes(draw, (340, 220, 4160, 500), stripe=150)
    draw.rounded_rectangle((340, 650, 4160, 4930), radius=130, fill=DARK_GRAY, outline=WASHED_GRAY, width=36)
    draw.rounded_rectangle((420, 730, 4080, 4850), radius=100, outline=YELLOW, width=16)
    paste_brand_logo(canvas, (900, 860, 3600, 3560))

    zero_face = fit_font(draw, "ZERO TRUST", FONT_BLACK, 3300, 420)
    agency_face = fit_font(draw, "HIGH AGENCY", FONT_BLACK, 3300, 510)
    centered_text(draw, "ZERO TRUST", 2250, 3720, zero_face, CREAM)
    centered_text(draw, "HIGH AGENCY", 2250, 4140, agency_face, YELLOW)
    small_face = font(FONT_MONO, 82)
    centered_text(draw, "VERIFY EVERYTHING / OWN THE OUTCOME", 2250, 4670, small_face, CREAM)
    hazard_stripes(draw, (340, 5070, 4160, 5350), stripe=150)
    add_grit(canvas, seed=917, count=430, opacity=48)
    return save_art(canvas, "zero-trust-high-agency-print-4500x5400.png")


def prompt_injection_fuel() -> Path:
    canvas = Image.new("RGBA", (4800, 2000), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((120, 160, 4680, 1840), radius=160, fill=DARK_GRAY, outline=WASHED_GRAY, width=32)
    draw.rounded_rectangle((170, 210, 4630, 1790), radius=130, outline=YELLOW, width=12)
    paste_brand_logo(canvas, (300, 330, 1720, 1750))
    draw.rectangle((1850, 390, 1900, 1610), fill=WASHED_GRAY)
    label_face = fit_font(draw, "OPERATOR", FONT_BLACK, 2400, 390)
    fuel_face = fit_font(draw, "FUEL", FONT_BLACK, 2400, 720)
    draw.text((2070, 420), "OPERATOR", font=label_face, fill=CREAM)
    draw.text((2070, 820), "FUEL", font=fuel_face, fill=YELLOW)
    mono = font(FONT_MONO, 72)
    draw.text((2080, 1500), "PROMPT INJECTION / CAFFEINE / REPEAT", font=mono, fill=CREAM)
    add_grit(canvas, seed=404, count=220, opacity=45)
    return save_art(canvas, "prompt-injection-fuel-mug-print-4800x2000.png")


def attack_surface() -> Path:
    canvas = Image.new("RGBA", (6000, 2600), BLACK)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((55, 55, 5945, 2545), outline=YELLOW, width=26)
    draw.rectangle((110, 110, 5890, 2490), fill=DARK_GRAY, outline=WASHED_GRAY, width=10)
    paste_brand_logo(canvas, (250, 250, 2350, 2350))
    draw.rectangle((2510, 300, 2570, 2300), fill=WASHED_GRAY)
    face = fit_font(draw, "ATTACK", FONT_BLACK, 2950, 660)
    surface = fit_font(draw, "SURFACE", FONT_BLACK, 2950, 660)
    draw.text((2820, 470), "ATTACK", font=face, fill=CREAM)
    draw.text((2820, 1080), "SURFACE", font=surface, fill=YELLOW)
    strap = font(FONT_MONO, 88)
    draw.text((2830, 1830), "MAKE BOLD MOVES", font=strap, fill=CREAM)
    draw.text((2830, 1980), "VERIFY EVERYTHING", font=strap, fill=CREAM)
    hazard_stripes(draw, (2820, 2210, 5580, 2390), stripe=90)
    add_grit(canvas, seed=222, count=620, opacity=32)
    return save_art(canvas, "attack-surface-desk-mat-print-6000x2600.png")


def own_the_outcome() -> Path:
    canvas = Image.new("RGBA", (3000, 3000), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((120, 120, 2880, 2880), radius=250, fill=WASHED_GRAY, outline=CREAM, width=76)
    draw.rounded_rectangle((210, 210, 2790, 2790), radius=205, fill=BLACK, outline=YELLOW, width=44)
    paste_brand_logo(canvas, (330, 330, 2670, 2670))
    add_grit(canvas, seed=5150, count=300, opacity=42)
    return save_art(canvas, "take-the-risk-sticker-print-3000x3000.png")


def mockup_background(seed: int) -> Image.Image:
    canvas = Image.new("RGBA", (1400, 1600), (199, 197, 188, 255))
    draw = ImageDraw.Draw(canvas)
    rng = random.Random(seed)
    for _ in range(900):
        shade = rng.choice((145, 158, 176, 214))
        alpha = rng.randint(10, 24)
        x, y = rng.randrange(1400), rng.randrange(1600)
        draw.point((x, y), fill=(shade, shade, max(0, shade - 5), alpha))
    draw.rectangle((0, 1330, 1400, 1600), fill=DARK_GRAY)
    hazard_stripes(draw, (0, 1330, 1400, 1370), stripe=38)
    return canvas


def paste_contain(canvas: Image.Image, art: Image.Image, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    copy = art.copy()
    copy.thumbnail((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    x = x0 + ((x1 - x0) - copy.width) // 2
    y = y0 + ((y1 - y0) - copy.height) // 2
    canvas.alpha_composite(copy, (x, y))


def shadow_layer(mask: Image.Image, offset: tuple[int, int], blur: int = 28) -> Image.Image:
    shadow = Image.new("RGBA", mask.size, TRANSPARENT)
    alpha = mask.getchannel("A").filter(ImageFilter.GaussianBlur(blur))
    block = Image.new("RGBA", mask.size, (0, 0, 0, 115))
    block.putalpha(alpha)
    shadow.alpha_composite(block, offset)
    return shadow


def apparel_mockup(art_path: Path, filename: str, hoodie: bool) -> Path:
    canvas = mockup_background(91 if hoodie else 81)
    garment = Image.new("RGBA", canvas.size, TRANSPARENT)
    draw = ImageDraw.Draw(garment)
    body = (380, 310 if hoodie else 250, 1020, 1320)
    if hoodie:
        draw.polygon([(380, 430), (120, 660), (270, 1110), (430, 980)], fill=DARK_GRAY)
        draw.polygon([(1020, 430), (1280, 660), (1130, 1110), (970, 980)], fill=DARK_GRAY)
        draw.rounded_rectangle(body, radius=55, fill=DARK_GRAY)
        draw.ellipse((455, 90, 945, 590), fill=DARK_GRAY, outline=(94, 92, 86, 255), width=12)
        draw.ellipse((540, 150, 860, 470), fill=(42, 41, 38, 255))
        draw.line((620, 380, 590, 760), fill=CREAM, width=8)
        draw.line((780, 380, 810, 760), fill=CREAM, width=8)
        draw.rounded_rectangle((500, 1040, 900, 1220), radius=55, outline=(94, 92, 86, 255), width=10)
        art_box = (500, 470, 900, 1030)
    else:
        draw.polygon([(385, 305), (120, 520), (300, 770), (430, 650)], fill=BLACK)
        draw.polygon([(1015, 305), (1280, 520), (1100, 770), (970, 650)], fill=BLACK)
        draw.rounded_rectangle(body, radius=48, fill=BLACK)
        draw.ellipse((530, 155, 870, 430), fill=(18, 18, 17, 255))
        draw.arc((520, 150, 880, 430), 8, 172, fill=(72, 72, 67, 255), width=9)
        art_box = (500, 430, 900, 1030)

    canvas.alpha_composite(shadow_layer(garment, (18, 28)))
    canvas.alpha_composite(garment)
    paste_contain(canvas, Image.open(art_path).convert("RGBA"), art_box)
    path = MOCKUP_DIR / filename
    canvas.convert("RGB").save(path, quality=94, optimize=True)
    return path


def mug_mockup(art_path: Path) -> Path:
    canvas = mockup_background(44)
    mug = Image.new("RGBA", canvas.size, TRANSPARENT)
    draw = ImageDraw.Draw(mug)
    draw.ellipse((260, 490, 1160, 830), fill=(224, 219, 200, 255), outline=BLACK, width=12)
    draw.rounded_rectangle((260, 650, 1110, 1260), radius=110, fill=CREAM, outline=BLACK, width=12)
    draw.ellipse((900, 720, 1290, 1160), outline=CREAM, width=110)
    draw.ellipse((965, 785, 1225, 1095), outline=BLACK, width=18)
    draw.ellipse((270, 570, 1090, 790), fill=(41, 31, 24, 255), outline=BLACK, width=12)
    canvas.alpha_composite(shadow_layer(mug, (22, 30)))
    canvas.alpha_composite(mug)
    paste_contain(canvas, Image.open(art_path).convert("RGBA"), (330, 750, 980, 1130))
    path = MOCKUP_DIR / "mug-prompt-injection-fuel.jpg"
    canvas.convert("RGB").save(path, quality=94, optimize=True)
    return path


def deskmat_mockup(art_path: Path) -> Path:
    canvas = mockup_background(12)
    mat = Image.new("RGBA", canvas.size, TRANSPARENT)
    draw = ImageDraw.Draw(mat)
    draw.rounded_rectangle((100, 500, 1300, 1120), radius=80, fill=BLACK, outline=(8, 8, 8, 255), width=24)
    canvas.alpha_composite(shadow_layer(mat, (18, 35)))
    canvas.alpha_composite(mat)
    paste_contain(canvas, Image.open(art_path).convert("RGBA"), (140, 540, 1260, 1080))
    path = MOCKUP_DIR / "deskmat-attack-surface.jpg"
    canvas.convert("RGB").save(path, quality=94, optimize=True)
    return path


def sticker_mockup(art_path: Path) -> Path:
    canvas = mockup_background(55)
    sticker = Image.open(art_path).convert("RGBA")
    sticker.thumbnail((940, 940), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", canvas.size, TRANSPARENT)
    layer.alpha_composite(sticker, ((1400 - sticker.width) // 2, 300))
    canvas.alpha_composite(shadow_layer(layer, (20, 28), blur=18))
    canvas.alpha_composite(layer)
    path = MOCKUP_DIR / "sticker-take-the-risk.jpg"
    canvas.convert("RGB").save(path, quality=94, optimize=True)
    return path


def main() -> None:
    ART_DIR.mkdir(parents=True, exist_ok=True)
    MOCKUP_DIR.mkdir(parents=True, exist_ok=True)

    human = human_in_the_loop()
    zero = zero_trust_high_agency()
    prompt = prompt_injection_fuel()
    attack = attack_surface()
    sticker = own_the_outcome()

    apparel_mockup(human, "tee-human-in-the-loop.jpg", hoodie=False)
    apparel_mockup(zero, "hoodie-zero-trust-high-agency.jpg", hoodie=True)
    mug_mockup(prompt)
    deskmat_mockup(attack)
    sticker_mockup(sticker)

    for path in sorted((*ART_DIR.iterdir(), *MOCKUP_DIR.iterdir())):
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
