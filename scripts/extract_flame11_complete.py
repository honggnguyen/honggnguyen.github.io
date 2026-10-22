import os
import json
import numpy as np
from PIL import Image
from scipy import signal, ndimage as ndi

BASE_DIR = "/home/tri/Code/Poem"
SRC_IMAGE = os.path.join(BASE_DIR, "Fig/Flame/Flame11.png")
FRAMES_DIR = os.path.join(BASE_DIR, "Fig/Flame/frames")
ALIGNED_DIR = os.path.join(BASE_DIR, "Fig/Flame/frames_aligned")
WEB_DIR = os.path.join(BASE_DIR, "assets/img/calcifer")

os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(ALIGNED_DIR, exist_ok=True)
os.makedirs(WEB_DIR, exist_ok=True)

GLOW = np.array([255, 120, 40], np.float32)
CANVAS_W, CANVAS_H = 621, 770

y_splits = [0, 395, 745, 1090, 1415, 1792]
x_splits = [0, 600, 1200, 1800, 2400]

# Precise match coordinates:
row_match_y = [315, 255, 244, 234, 276]

im_src = Image.open(SRC_IMAGE).convert("RGB")
arr_src = np.array(im_src)

manifest_path = os.path.join(ALIGNED_DIR, "manifest.json")
if os.path.exists(manifest_path):
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
else:
    manifest = []

# Filter out any old frames >= 157 if re-running
manifest = [item for item in manifest if item.get("index", 0) < 157]

START_FRAME_ID = 157

print("Starting Flame11 extraction and generation of 20 frames...")

for r in range(5):
    for c in range(4):
        cell_idx = r * 4 + c + 1
        frame_id = START_FRAME_ID + (cell_idx - 1)
        frame_name = f"frame_{frame_id:03d}"
        hide_alias = f"calcifer_hide_{cell_idx:02d}"

        # 1. Slice cell from Flame11.png
        cell = arr_src[y_splits[r]:y_splits[r+1], x_splits[c]:x_splits[c+1]]
        cell_raw_name = f"Flame11_r{r+1}c{c+1}.png"
        Image.fromarray(cell).save(os.path.join(FRAMES_DIR, cell_raw_name))

        p = cell.astype(np.float32)
        mx, mn = p.max(2), p.min(2)
        diff = mx - mn
        sat = diff / np.maximum(mx, 1)

        # 2. Segment Calcifer
        is_flame = (sat > 0.55) & (p[:, :, 0] > 175) & (p[:, :, 2] < 85)
        is_head_sparks = (p[:, :, 0] > 200) & (sat > 0.50) & (p[:, :, 2] < 90)
        is_wood = ((p[:, :, 0] > p[:, :, 2] + 10) & (p[:, :, 0] > p[:, :, 1] + 3) & (p.mean(2) < 140) & (sat > 0.25)) | (p.mean(2) < 65)
        is_wood[:cell.shape[0]-160, :] = False

        is_dark = (p.mean(2) < 95) & (p[:, :, 0] >= p[:, :, 2] - 5)
        is_dark_face = np.zeros_like(is_dark)
        is_dark_face[:, 120:480] = is_dark[:, 120:480]

        body_mask = is_flame | is_wood | is_dark_face
        body_filled = ndi.binary_fill_holes(body_mask)

        solid = body_filled | is_head_sparks

        # Exclude checkerboard background
        is_checker = (diff < 22) & (p.mean(2) > 130) & (p.mean(2) < 240)
        solid &= ~is_checker

        # Remove top-left number badge
        solid[:65, :65] = False

        # Remove bottom-right watermark in cell 20
        if r == 4 and c == 3:
            solid[-80:, -80:] = False

        match_x = 170
        match_y = row_match_y[r]

        # Trim bottom coal mound to match standard frame log line
        y_m = np.ogrid[:cell.shape[0], :cell.shape[1]][0]
        solid &= ~(y_m > match_y + 57)

        # Procedural golden aura
        body = ndi.binary_fill_holes(ndi.binary_closing(solid & (sat > 0.5), iterations=5))
        glow = ndi.gaussian_filter(body.astype(np.float32), 14)
        glow = np.clip(glow * 1.5 - 0.12, 0, 1) * 0.50

        out = np.zeros(cell.shape[:2] + (4,), np.float32)
        out[:, :, :3] = GLOW
        out[:, :, 3] = glow * 255
        out[solid, :3] = p[solid]
        out[solid, 3] = 255
        out[match_y + 59:, :, 3] = 0

        clean_cell_img = Image.fromarray(out.astype(np.uint8), "RGBA")

        # Paste on standard fireplace canvas (621 x 770)
        paste_x = 253 - match_x
        paste_y = 570 - match_y
        canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        canvas.alpha_composite(clean_cell_img, (paste_x, paste_y))

        # Save aligned PNG
        png_path = os.path.join(ALIGNED_DIR, f"{frame_name}.png")
        canvas.save(png_path)

        # Save WebPs (both frame_xxx.webp and calcifer_hide_xx.webp)
        webp_frame_path = os.path.join(WEB_DIR, f"{frame_name}.webp")
        webp_alias_path = os.path.join(WEB_DIR, f"{hide_alias}.webp")
        canvas.save(webp_frame_path, format="WEBP", quality=95, method=6)
        canvas.save(webp_alias_path, format="WEBP", quality=95, method=6)

        # Update manifest
        manifest.append({
            "index": frame_id,
            "id": frame_name,
            "source_file": cell_raw_name,
            "category": "hide_peek_laugh",
            "description": f"Biểu cảm Calcifer ẩn nấp, ngó nghiêng và cười đùa (Flame11 frame {cell_idx})",
            "canvas_size": [CANVAS_W, CANVAS_H],
            "alias": hide_alias,
            "match_x": match_x,
            "match_y": match_y,
            "paste_x": paste_x,
            "paste_y": paste_y
        })

        print(f"Generated {frame_name} ({hide_alias}) from Flame11 r{r+1}c{c+1} -> paste=({paste_x}, {paste_y})")

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"Saved manifest with {len(manifest)} total frames.")
