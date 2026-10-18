import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
FW, FH = 621, 770
BASE_X, BASE_Y = 2131, 649
bg_fp = bg.crop((BASE_X, BASE_Y, BASE_X + FW, BASE_Y + FH))

# 1. Clean the static fire in bg_fp:
bg_clean_arr = np.array(bg_fp)
fire_clean_mask = (bg_clean_arr[:, :, 0] > 150) & (bg_clean_arr[:, :, 1] > 75) & (bg_clean_arr[:, :, 2] < 130)
Y, X = np.ogrid[:FH, :FW]
in_cavity_zone = (X >= 235) & (X <= 540) & (Y >= 320) & (Y <= 550)
brick_color = [77, 25, 30]
bg_clean_arr[fire_clean_mask & in_cavity_zone, :3] = brick_color
bg_clean_fp = Image.fromarray(bg_clean_arr)

# Exact landmark offsets matching bg_fp:
OFFSETS = [
    (0, 5),     # Frame 1
    (5, 5),     # Frame 2
    (10, 5),    # Frame 3
    (5, 5),     # Frame 4
    (-18, 110), # Frame 5
    (-35, 110), # Frame 6
    (-35, 110), # Frame 7
    (-70, 110)  # Frame 8
]

cw, ch = 688, 768
f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')

out_dir = 'assets/img/calcifer'
os.makedirs(out_dir, exist_ok=True)

def render_and_save(sheet, idx, filename):
    c = idx % 4
    r = idx // 4
    cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    dx, dy = OFFSETS[idx]
    
    canv = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    canv.paste(cell, (dx, dy))
    canv_arr = np.array(canv)
    
    # Strictly inside fireplace cavity:
    # Stops at Y=580 (strictly above stone floor at Y=585)
    # Bounds: X in [220..540], Y in [250..580]
    in_cavity = (X >= 220) & (X <= 540) & (Y >= 250) & (Y <= 580)
    
    # Isolate flame, sparks, face, and arms:
    is_fire = in_cavity & (canv_arr[:, :, 0] > 115) & ((canv_arr[:, :, 0].astype(int) - canv_arr[:, :, 2].astype(int)) > 50) & (canv_arr[:, :, 1] > 35)
    fire_filled = ndimage.binary_fill_holes(is_fire)
    fire_mask_img = Image.fromarray((fire_filled * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    
    comp = Image.composite(canv, bg_clean_fp, fire_mask_img)
    out_path = os.path.join(out_dir, filename)
    # Save as lossless webp or high quality 98 to ensure zero compression artifacts on background
    comp.save(out_path, 'WEBP', quality=98)

print("Generating 8 idle frames...")
for i in range(8):
    render_and_save(f18, i, f'flame_idle_{i+1}.webp')

print("Generating 8 smile frames...")
for i in range(8):
    render_and_save(fs1, i, f'calcifer_smile_{i+1}.webp')

print("Generating 8 talk frames...")
for i in range(8):
    render_and_save(fs2, i, f'calcifer_talk_{i+1}.webp')

print("ALL_24_FRAMES_GENERATED_SUCCESSFULLY")
