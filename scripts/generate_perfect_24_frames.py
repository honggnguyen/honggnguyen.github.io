import os
import numpy as np
from PIL import Image, ImageFilter

# Exact cell offsets relative to cell0 (dx, dy):
OFFSETS = [
    (0, 0),       # Frame 1
    (5, 0),       # Frame 2
    (11, 0),      # Frame 3
    (5, 0),       # Frame 4
    (-15, 101),   # Frame 5
    (-32, 101),   # Frame 6
    (-32, 101),   # Frame 7
    (-67, 109)    # Frame 8
]

# Base origin in bg_close:
BASE_X = 2131
BASE_Y = 649
FW = 621  # 2752 - 2131 = 621
FH = 770

def make_cavity_mask(width, height):
    # Fire cavity inside the fireplace crop:
    # Hearth level: y = 625
    # Arch apex: y = 245
    # Arch center x: 343
    # Radius rx = 148, ry = 118
    mask = np.zeros((height, width), dtype=np.uint8)
    Y, X = np.ogrid[:height, :width]
    
    cx = 343.0
    cy = 363.0
    rx = 148.0
    ry = 118.0
    
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_top_arch = top_ellipse & (Y <= cy) & (Y >= cy - ry)
    in_body = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 628)
    
    mask[in_top_arch | in_body] = 255
    # Feather by 1px
    return Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.0))

def main():
    bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
    bg_fp = bg.crop((BASE_X, BASE_Y, BASE_X + FW, BASE_Y + FH))
    
    mask = make_cavity_mask(FW, FH)
    
    # In bg_fp, let's create a CLEAN cavity base where the static flame is replaced by dark bricks:
    # Where mask > 0, if pixels are bright fire (R > 180, G > 90), replace with dark brick color:
    bg_clean_arr = np.array(bg_fp)
    fire_in_bg = (bg_clean_arr[:, :, 0] > 160) & (bg_clean_arr[:, :, 1] > 80) & (bg_clean_arr[:, :, 2] < 120) & (np.array(mask) > 10)
    # Dark brick color: sample from non-fire cavity (e.g. x=230, y=360)
    brick_sample = bg_clean_arr[360, 230, :3] # around [68, 24, 28]
    bg_clean_arr[fire_in_bg, :3] = brick_sample
    bg_clean_fp = Image.fromarray(bg_clean_arr)
    bg_clean_fp.save('/tmp/bg_clean_fp.png')
    print(f"Cleaned static fire in bg cavity! Brick color: {brick_sample}")
    
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    
    cw, ch = 688, 768
    
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    def process_frame(sheet, idx, filename):
        c = idx % 4
        r = idx // 4
        cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        
        dx, dy = OFFSETS[idx]
        
        # Paste cell onto fireplace canvas with (dx, dy):
        cell_canvas = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        cell_canvas.paste(cell, (dx, dy))
        
        # Composite with bg_clean_fp using mask:
        comp = Image.composite(cell_canvas, bg_clean_fp, mask)
        
        out_path = os.path.join(out_dir, filename)
        comp.save(out_path, 'WEBP', quality=95)
        print(f"Generated {filename} (offset dx={dx}, dy={dy})")

    # 1. 8 idle frames:
    print("Generating 8 idle frames...")
    for i in range(8):
        process_frame(f18, i, f'flame_idle_{i+1}.webp')
        
    # 2. 8 smile frames:
    print("Generating 8 smile frames...")
    for i in range(8):
        process_frame(fs1, i, f'calcifer_smile_{i+1}.webp')

    # 3. 8 talk frames:
    print("Generating 8 talk frames...")
    for i in range(8):
        process_frame(fs2, i, f'calcifer_talk_{i+1}.webp')

    print("ALL 24 FRAMES RE-GENERATED PERFECTLY!")

if __name__ == '__main__':
    main()
