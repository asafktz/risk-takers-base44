#!/usr/bin/env python3
"""Build deterministic Risk Takers print artwork and storefront mockups.

The print files are transparent 300 DPI PNGs (except the full-bleed desk mat).
No external network, paid fonts, or generated text is required.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ART_DIR = ROOT / "public" / "merch" / "artwork"
MOCKUP_DIR = ROOT / "public" / "merch" / "mockups"

BLACK = (24, 24, 22, 255)
SOFT_BLACK = (36, 36, 33, 255)
CREAM = (244, 240, 226, 255)
PAPER = (232, 228, 216, 255)
YELLOW = (241, 196, 15, 255)
RED = (192, 57, 43, 255)
TRANSPARENT = (0, 0, 0, 0)

FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_NARROW = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"
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


def circuit(
    draw: ImageDraw.ImageDraw,
    points: list[tuple[int, int]],
    color: tuple[int, int, int, int],
    width: int,
    node_radius: int,
) -> None:
    draw.line(points, fill=color, width=width, joint="curve")
    for x, y in (points[0], points[-1]):
        draw.ellipse((x - node_radius, y - node_radius, x + node_radius, y + node_radius), outline=color, width=width)


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


def human_in_the_loop() -> Path:
    canvas = Image.new("RGBA", (4500, 5400), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    hazard_stripes(draw, (300, 220, 4200, 500), stripe=150)
    draw.rounded_rectangle((300, 670, 4200, 4680), radius=140, outline=CREAM, width=34)
    draw.rounded_rectangle((380, 750, 4120, 4600), radius=110, outline=YELLOW, width=14)

    label_face = fit_font(draw, "RISK TAKERS / CONTROL LAYER", FONT_NARROW, 3000, 180)
    centered_text(draw, "RISK TAKERS / CONTROL LAYER", 2250, 850, label_face, YELLOW)

    for value, y in (("HUMAN", 1260), ("IN THE", 2260), ("LOOP", 3260)):
        face = fit_font(draw, value, FONT_BLACK, 3400, 900)
        centered_text(draw, value, 2250, y, face, CREAM)

    loop_y = 4340
    draw.line((700, loop_y, 3800, loop_y), fill=YELLOW, width=30)
    draw.arc((560, loop_y - 190, 940, loop_y + 190), 90, 270, fill=YELLOW, width=30)
    draw.arc((3560, loop_y - 190, 3940, loop_y + 190), 270, 90, fill=YELLOW, width=30)
    for x in range(1050, 3550, 500):
        draw.ellipse((x - 32, loop_y - 32, x + 32, loop_y + 32), fill=YELLOW)

    small_face = font(FONT_MONO, 82)
    centered_text(draw, "KEEP THE JUDGMENT. AUTOMATE THE DRAG.", 2250, 4830, small_face, CREAM)

    for idx, y in enumerate(range(1040, 3980, 520)):
        circuit(draw, [(340, y), (480, y), (560, y + (-1 if idx % 2 else 1) * 120), (700, y + (-1 if idx % 2 else 1) * 120)], YELLOW, 14, 20)
        circuit(draw, [(4160, y), (4020, y), (3940, y + (1 if idx % 2 else -1) * 120), (3800, y + (1 if idx % 2 else -1) * 120)], YELLOW, 14, 20)

    add_grit(canvas, seed=1107, count=520, opacity=52)
    return save_art(canvas, "human-in-the-loop-print-4500x5400.png")


def zero_trust_high_agency() -> Path:
    canvas = Image.new("RGBA", (4500, 5400), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)

    shield = [(2250, 300), (3850, 940), (3580, 3200), (2250, 4420), (920, 3200), (650, 940)]
    inner = [(2250, 600), (3510, 1100), (3280, 3010), (2250, 3980), (1220, 3010), (990, 1100)]
    draw.line(shield + [shield[0]], fill=CREAM, width=46, joint="curve")
    draw.line(inner + [inner[0]], fill=YELLOW, width=22, joint="curve")

    nodes = [(2250, 1130), (1550, 1660), (2950, 1660), (1260, 2570), (2250, 2410), (3240, 2570), (2250, 3350)]
    edges = ((0, 1), (0, 2), (1, 3), (1, 4), (2, 4), (2, 5), (3, 4), (4, 5), (3, 6), (4, 6), (5, 6))
    for a, b in edges:
        draw.line((*nodes[a], *nodes[b]), fill=CREAM, width=18)
    for idx, (x, y) in enumerate(nodes):
        r = 48 if idx == 4 else 34
        draw.ellipse((x - r, y - r, x + r, y + r), fill=YELLOW, outline=BLACK, width=12)

    plate = (430, 4050, 4070, 4920)
    draw.rounded_rectangle(plate, radius=70, fill=BLACK, outline=CREAM, width=28)
    zero_face = fit_font(draw, "ZERO TRUST", FONT_BLACK, 3300, 420)
    agency_face = fit_font(draw, "HIGH AGENCY", FONT_BLACK, 3300, 420)
    centered_text(draw, "ZERO TRUST", 2250, 4130, zero_face, CREAM)
    centered_text(draw, "HIGH AGENCY", 2250, 4530, agency_face, YELLOW)

    small_face = font(FONT_MONO, 80)
    centered_text(draw, "VERIFY EVERYTHING / FREE THE OPERATOR", 2250, 5070, small_face, CREAM)
    add_grit(canvas, seed=917, count=430, opacity=48)
    return save_art(canvas, "zero-trust-high-agency-print-4500x5400.png")


def prompt_injection_fuel() -> Path:
    canvas = Image.new("RGBA", (4800, 2000), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((120, 160, 4680, 1840), radius=160, fill=BLACK, outline=CREAM, width=30)
    draw.rounded_rectangle((170, 210, 4630, 1790), radius=130, outline=YELLOW, width=12)

    cup_box = (310, 460, 1420, 1480)
    draw.rounded_rectangle(cup_box, radius=100, outline=CREAM, width=42)
    draw.arc((1220, 650, 1700, 1280), -85, 90, fill=CREAM, width=42)
    for x in (560, 830, 1100):
        circuit(draw, [(x, 500), (x, 350), (x + 90, 260)], YELLOW, 18, 22)
    draw.ellipse((650, 790, 1080, 1220), outline=YELLOW, width=32)
    draw.line((865, 790, 865, 1220), fill=YELLOW, width=22)
    draw.line((650, 1005, 1080, 1005), fill=YELLOW, width=22)

    label_face = fit_font(draw, "PROMPT INJECTION", FONT_BLACK, 2750, 360)
    fuel_face = fit_font(draw, "FUEL", FONT_BLACK, 2750, 680)
    draw.text((1760, 430), "PROMPT INJECTION", font=label_face, fill=CREAM)
    draw.text((1760, 820), "FUEL", font=fuel_face, fill=YELLOW)
    mono = font(FONT_MONO, 72)
    draw.text((1770, 1500), "CAFFEINE IS NOT AN AUTH BOUNDARY", font=mono, fill=CREAM)
    add_grit(canvas, seed=404, count=220, opacity=45)
    return save_art(canvas, "prompt-injection-fuel-mug-print-4800x2000.png")


def attack_surface() -> Path:
    canvas = Image.new("RGBA", (6000, 2600), BLACK)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((55, 55, 5945, 2545), outline=YELLOW, width=26)
    draw.rectangle((110, 110, 5890, 2490), outline=CREAM, width=8)

    for x in range(250, 5800, 320):
        draw.line((x, 280, x, 2320), fill=(244, 240, 226, 32), width=4)
    for y in range(280, 2350, 260):
        draw.line((220, y, 5780, y), fill=(244, 240, 226, 32), width=4)

    rng = random.Random(1309)
    nodes: list[tuple[int, int]] = []
    for _ in range(34):
        nodes.append((rng.randint(250, 5750), rng.randint(250, 2300)))
    for idx, point in enumerate(nodes):
        near = sorted(nodes[:idx], key=lambda p: math.dist(point, p))[:2]
        for other in near:
            draw.line((*point, *other), fill=(241, 196, 15, 125), width=8)
        x, y = point
        draw.ellipse((x - 20, y - 20, x + 20, y + 20), fill=YELLOW, outline=CREAM, width=6)

    plate = (420, 730, 5580, 1870)
    draw.rounded_rectangle(plate, radius=90, fill=(24, 24, 22, 235), outline=CREAM, width=26)
    face = fit_font(draw, "ATTACK SURFACE", FONT_BLACK, 4700, 620)
    centered_text(draw, "ATTACK SURFACE", 3000, 850, face, CREAM)
    strap = font(FONT_MONO, 94)
    centered_text(draw, "MAKE BOLD MOVES / VERIFY EVERYTHING", 3000, 1570, strap, YELLOW)
    hazard_stripes(draw, (420, 2020, 2150, 2220), stripe=90)
    hazard_stripes(draw, (3850, 2020, 5580, 2220), stripe=90)
    add_grit(canvas, seed=222, count=620, opacity=32)
    return save_art(canvas, "attack-surface-desk-mat-print-6000x2600.png")


def own_the_outcome() -> Path:
    canvas = Image.new("RGBA", (3000, 3000), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((170, 170, 2830, 2830), fill=YELLOW, outline=CREAM, width=70)
    draw.ellipse((300, 300, 2700, 2700), fill=BLACK, outline=BLACK, width=20)
    draw.arc((450, 450, 2550, 2550), 205, 335, fill=YELLOW, width=58)
    draw.arc((450, 450, 2550, 2550), 25, 155, fill=YELLOW, width=58)

    top = fit_font(draw, "TAKE THE RISK", FONT_BLACK, 2200, 360)
    bottom = fit_font(draw, "OWN THE OUTCOME", FONT_BLACK, 2300, 330)
    centered_text(draw, "TAKE THE RISK", 1500, 760, top, CREAM)
    centered_text(draw, "OWN THE OUTCOME", 1500, 1830, bottom, YELLOW)

    draw.polygon([(1500, 1250), (1750, 1500), (1500, 1750), (1250, 1500)], outline=CREAM)
    draw.line((1250, 1500, 1750, 1500), fill=CREAM, width=44)
    draw.line((1500, 1250, 1500, 1750), fill=CREAM, width=44)
    mono = font(FONT_MONO, 72)
    centered_text(draw, "RISK TAKERS / FIELD SUPPLY", 1500, 2390, mono, CREAM)
    add_grit(canvas, seed=5150, count=300, opacity=42)
    return save_art(canvas, "take-the-risk-sticker-print-3000x3000.png")


def mockup_background(seed: int) -> Image.Image:
    canvas = Image.new("RGBA", (1400, 1600), PAPER)
    draw = ImageDraw.Draw(canvas)
    rng = random.Random(seed)
    for _ in range(900):
        shade = rng.choice((210, 218, 226, 236))
        alpha = rng.randint(10, 24)
        x, y = rng.randrange(1400), rng.randrange(1600)
        draw.point((x, y), fill=(shade, shade, shade - 4, alpha))
    draw.rectangle((0, 1330, 1400, 1600), fill=(31, 31, 29, 255))
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
        draw.polygon([(380, 430), (120, 660), (270, 1110), (430, 980)], fill=BLACK)
        draw.polygon([(1020, 430), (1280, 660), (1130, 1110), (970, 980)], fill=BLACK)
        draw.rounded_rectangle(body, radius=55, fill=BLACK)
        draw.ellipse((455, 90, 945, 590), fill=BLACK, outline=(60, 60, 56, 255), width=12)
        draw.ellipse((540, 150, 860, 470), fill=(18, 18, 17, 255))
        draw.line((620, 380, 590, 760), fill=CREAM, width=8)
        draw.line((780, 380, 810, 760), fill=CREAM, width=8)
        draw.rounded_rectangle((500, 1040, 900, 1220), radius=55, outline=(55, 55, 52, 255), width=10)
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
