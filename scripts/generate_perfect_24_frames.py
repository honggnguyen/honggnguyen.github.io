import os
import numpy as np
from PIL import Image, ImageFilter

bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
FW, FH = 621, 770
BASE_X, BASE_Y = 2131, 649
bg_fp = bg.crop((BASE_X, BASE_Y, BASE_X + FW, BASE_Y + FH))

# 1. Clean the static background fire in bg_fp:
bg_clean_arr = np.array(bg_fp)
fire_clean_mask = (bg_clean_arr[:, :, 0] > 150) & (bg_clean_arr[:, :, 1] > 75) & (bg_clean_arr[:, :, 2] < 130)
Y, X = np.ogrid[:FH, :FW]
in_cavity_zone = (X >= 235) & (X <= 540) & (Y >= 320) & (Y <= 615)
brick_color = [77, 25, 30]
bg_clean_arr[fire_clean_mask & in_cavity_zone, :3] = brick_color
bg_clean_fp = Image.fromarray(bg_clean_arr)

# 2. Perfect Cavity Opening Mask (stays strictly inside dark cavity shadow, avoiding all stone blocks):
cx = 380.0
cy = 415.0
rx = 146.0
ry = 117.0

mask = np.zeros((FH, FW), dtype=np.uint8)
top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
in_top_arch = top_ellipse & (Y <= cy) & (Y >= cy - ry)
in_body = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 610)

mask[in_top_arch | in_body] = 255
mask_img = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(3.0))

# 3. Exact per-sheet landmark offsets:
OFFSETS_DICT = {
    'idle': [
        (0, 0), (5, 0), (11, 0), (5, 0),
        (-15, 100), (-32, 100), (-33, 100), (-67, 108)
    ],
    'smile': [
        (0, 0), (5, 0), (11, 1), (4, 0),
        (-15, 102), (-32, 102), (-33, 102), (-67, 109)
    ],
    'talk': [
        (0, 0), (5, 0), (11, 0), (4, 0),
        (-15, 102), (-32, 102), (-32, 102), (-67, 110)
    ]
}

cw, ch = 688, 768

f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')

out_dir = 'assets/img/calcifer'
os.makedirs(out_dir, exist_ok=True)

def render_frame(sheet, idx, sname, filename):
    c = idx % 4
    r = idx // 4
    cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    dx, dy = OFFSETS_DICT[sname][idx]
    
    canv = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    canv.paste(cell, (dx, dy))
    
    comp = Image.composite(canv, bg_clean_fp, mask_img)
    comp.save(os.path.join(out_dir, filename), 'WEBP', quality=95)

print("Generating 8 idle frames...")
for i in range(8):
    render_frame(f18, i, 'idle', f'flame_idle_{i+1}.webp')

print("Generating 8 smile frames...")
for i in range(8):
    render_frame(fs1, i, 'smile', f'calcifer_smile_{i+1}.webp')

print("Generating 8 talk frames...")
for i in range(8):
    render_frame(fs2, i, 'talk', f'calcifer_talk_{i+1}.webp')

print("All 24 frames successfully updated with zero-seam mask!")

if __name__ == '__main__':
    pass
